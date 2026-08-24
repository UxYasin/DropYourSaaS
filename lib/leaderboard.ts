import { redis } from '@/lib/redis';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { leaderboardItems as seedLeaderboardItems, type LeaderboardItem } from '@/lib/leaderboard-data';
import { cookies } from 'next/headers';
import { getListingSlug } from '@/lib/slug';

const CACHE_KEY = 'leaderboard:v5';
const CACHE_TTL_SECONDS = 2; // 2 seconds TTL for real-time responsiveness

export async function getLeaderboard(
  category?: string,
  sortBy: 'rank' | 'hot' | 'top' | 'recent' = 'rank'
): Promise<LeaderboardItem[]> {
  const cacheKey = `${CACHE_KEY}:${sortBy}:${(category || 'all').toLowerCase()}`;
  try {
    const cached = await redis.get<LeaderboardItem[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  } catch {
    // Fallback if Redis is offline
  }

  const items = await fetchLeaderboardFromDatabase(category, sortBy);
  try {
    await redis.set(cacheKey, items, { ex: CACHE_TTL_SECONDS });
  } catch {}
  return items;
}

export async function getTrendingLeaderboard(limit = 5): Promise<LeaderboardItem[]> {
  return getLeaderboard(undefined, 'hot').then((items) => items.slice(0, limit));
}

export async function getRecentSubmissions(limit = 5): Promise<LeaderboardItem[]> {
  return getLeaderboard(undefined, 'recent').then((items) => items.slice(0, limit));
}

export async function invalidateLeaderboardCache() {
  try {
    await redis.del(CACHE_KEY);
    await redis.del('leaderboard:v1');
    await redis.del('leaderboard:v2');
    await redis.del('leaderboard:v3');
    await redis.del('leaderboard:v4');
  } catch {}
}

export async function getPaginatedLeaderboard(
  page = 1,
  limit = 50,
  category?: string,
  sortBy: 'rank' | 'hot' | 'top' | 'recent' = 'rank'
) {
  const items = await getLeaderboard(category, sortBy);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = items.slice(start, end);
  const total = items.length;

  return {
    items: paginated,
    totalCount: total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function fetchLeaderboardFromDatabase(
  category?: string,
  sortBy: 'rank' | 'hot' | 'top' | 'recent' = 'rank'
): Promise<LeaderboardItem[]> {
  const supabase = getSupabaseServerClient();

  // Try to get voter_token cookie if available to attach user_vote
  let voterToken: string | undefined;
  try {
    const cookieStore = await cookies();
    voterToken = cookieStore.get('voter_token')?.value;
  } catch {}

  const userVotesMap = new Map<string, 1 | -1>();
  if (voterToken) {
    try {
      const { data: votes } = await supabase
        .from('listing_votes')
        .select('listing_id, vote_type')
        .eq('voter_token', voterToken);

      if (votes) {
        votes.forEach((v) => {
          userVotesMap.set(v.listing_id, v.vote_type as 1 | -1);
        });
      }
    } catch {}
  }

  let dbEntries: Record<string, unknown>[] = [];
  try {
    let query = supabase
      .from('leaderboard_entries')
      .select('*')
      .neq('status', 'rejected');

    if (category && category !== 'All') {
      query = query.ilike('category', `%${category}%`);
    }

    // Apply exact sorting engine
    if (sortBy === 'hot') {
      query = query.order('hot_score', { ascending: false, nullsFirst: false }).order('net_score', { ascending: false });
    } else if (sortBy === 'top') {
      query = query.order('net_score', { ascending: false, nullsFirst: false }).order('upvotes', { ascending: false });
    } else if (sortBy === 'recent') {
      query = query.order('claimed_at', { ascending: false });
    } else {
      // Default 'rank': Order strictly by rank ascending
      query = query.order('rank', { ascending: true, nullsFirst: false }).order('claimed_at', { ascending: false });
    }

    const { data: entryData } = await query;
    if (entryData && entryData.length > 0) {
      dbEntries = entryData as Record<string, unknown>[];
    }
  } catch (err) {
    console.warn('Error loading live Supabase listings:', err);
  }

  // If DB entries exist and sorting is not default 'rank', return directly ordered by score!
  if (dbEntries.length > 0 && sortBy !== 'rank') {
    return dbEntries.map((row, idx) => {
      const urlStr = String(row.url || '');
      let hostname = 'SaaS Product';
      try {
        hostname = urlStr ? new URL(urlStr).hostname.replace(/^www\./, '') : 'SaaS Product';
      } catch {
        hostname = urlStr || 'SaaS Product';
      }
      return {
        id: String(row.id || ''),
        rank: idx + 1,
        name: String(row.name || row.title || hostname),
        bid: Number(row.bid_cents || 0) / 100,
        url: urlStr,
        clicks: Number(row.clicks || 0),
        time: formatRelativeTime(String(row.claimed_at || row.created_at || new Date().toISOString())),
        upvotes: Number(row.upvotes || 0),
        downvotes: Number(row.downvotes || 0),
        net_score: Number(row.net_score || 0),
        hot_score: Number(row.hot_score || 0),
        user_vote: userVotesMap.get(String(row.id || '')) || 0,
        category: String(row.category || 'SaaS'),
        claimed_at: String(row.claimed_at || row.created_at || ''),
        favicon: row.favicon_url ? String(row.favicon_url) : (row.favicon ? String(row.favicon) : undefined),
        preview_image_url: row.preview_image_url ? String(row.preview_image_url) : (row.screenshot_url ? String(row.screenshot_url) : (row.og_image ? String(row.og_image) : undefined)),
        is_verified: Boolean(row.is_verified),
        is_dofollow: Boolean(row.is_dofollow),
        verified_at: row.verified_at ? String(row.verified_at) : undefined,
      };
    });
  }

  // Default 'rank' building with seed item fallback
  const realItemsMap = new Map<number, LeaderboardItem>();
  const realUrlSet = new Set<string>();
  const unrankedItems: LeaderboardItem[] = [];

  dbEntries.forEach((row) => {
    const urlStr = String(row.url || '');
    let hostname = 'SaaS Product';
    try {
      hostname = urlStr ? new URL(urlStr).hostname.replace(/^www\./, '') : 'SaaS Product';
    } catch {
      hostname = urlStr || 'SaaS Product';
    }

    const assignedRank = Number(row.rank || row.target_rank) || 0;
    const item: LeaderboardItem = {
      id: String(row.id || ''),
      rank: assignedRank,
      name: String(row.name || row.title || hostname),
      bid: Number(row.bid_cents || 0) / 100,
      url: urlStr,
      clicks: Number(row.clicks || 0),
      time: formatRelativeTime(String(row.claimed_at || row.created_at || new Date().toISOString())),
      upvotes: Number(row.upvotes || 0),
      downvotes: Number(row.downvotes || 0),
      net_score: Number(row.net_score || 0),
      hot_score: Number(row.hot_score || 0),
      user_vote: userVotesMap.get(String(row.id || '')) || 0,
      category: String(row.category || 'SaaS'),
      claimed_at: String(row.claimed_at || row.created_at || ''),
      favicon: row.favicon_url ? String(row.favicon_url) : (row.favicon ? String(row.favicon) : undefined),
      preview_image_url: row.preview_image_url ? String(row.preview_image_url) : (row.screenshot_url ? String(row.screenshot_url) : (row.og_image ? String(row.og_image) : undefined)),
      is_verified: Boolean(row.is_verified),
      is_dofollow: Boolean(row.is_dofollow),
      verified_at: row.verified_at ? String(row.verified_at) : undefined,
    };

    if (urlStr) {
      realUrlSet.add(urlStr.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''));
    }

    if (assignedRank > 0 && !realItemsMap.has(assignedRank)) {
      realItemsMap.set(assignedRank, item);
    } else {
      unrankedItems.push(item);
    }
  });

  // Assemble full sequential array
  const result: LeaderboardItem[] = [];
  const maxRank = Math.max(20, ...Array.from(realItemsMap.keys()));

  let seedIdx = 0;
  let unrankedIdx = 0;

  for (let r = 1; r <= maxRank; r++) {
    if (realItemsMap.has(r)) {
      result.push({ ...realItemsMap.get(r)!, rank: r });
    } else if (unrankedIdx < unrankedItems.length) {
      result.push({ ...unrankedItems[unrankedIdx], rank: r });
      unrankedIdx++;
    } else {
      // Fill empty slot with seed item
      while (seedIdx < seedLeaderboardItems.length) {
        const seed = seedLeaderboardItems[seedIdx];
        const seedNorm = seed.url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
        seedIdx++;
        if (!realUrlSet.has(seedNorm)) {
          result.push({
            ...seed,
            rank: r,
            upvotes: 0,
            downvotes: 0,
            net_score: 0,
            hot_score: 0,
            user_vote: 0,
          });
          realUrlSet.add(seedNorm);
          break;
        }
      }
    }
  }

  // Append any remaining unranked items
  while (unrankedIdx < unrankedItems.length) {
    result.push({ ...unrankedItems[unrankedIdx], rank: result.length + 1 });
    unrankedIdx++;
  }

  return result.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

function formatRelativeTime(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

export async function getListingBySlug(slug: string): Promise<LeaderboardItem | null> {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const allItems = await getLeaderboard(undefined, 'rank');

  // 1. Match in active leaderboard
  const directMatch = allItems.find((item) => {
    const itemSlug = getListingSlug(item);
    if (itemSlug === cleanSlug) return true;
    if (item.id && item.id.toLowerCase() === cleanSlug) return true;
    if (item.name && item.name.toLowerCase() === cleanSlug) return true;
    try {
      const host = new URL(item.url).hostname.toLowerCase().replace(/^www\./, '');
      if (host === cleanSlug || host.replace(/\./g, '-') === cleanSlug) return true;
    } catch {}
    return false;
  });

  if (directMatch) return directMatch;

  // 2. Direct database lookup fallback
  try {
    const supabase = getSupabaseServerClient();
    const { data: row } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .or(`id.eq.${cleanSlug},url.ilike.%${cleanSlug}%,name.ilike.%${cleanSlug}%`)
      .maybeSingle();

    if (row) {
      const urlStr = String(row.url || '');
      let hostname = 'SaaS Product';
      try {
        hostname = urlStr ? new URL(urlStr).hostname.replace(/^www\./, '') : 'SaaS Product';
      } catch {
        hostname = urlStr || 'SaaS Product';
      }

      return {
        id: String(row.id || ''),
        rank: Number(row.rank || row.target_rank) || 1,
        name: String(row.name || row.title || hostname),
        bid: Number(row.bid_cents || 0) / 100,
        url: urlStr,
        clicks: Number(row.clicks || 0),
        time: formatRelativeTime(String(row.claimed_at || row.created_at || new Date().toISOString())),
        upvotes: Number(row.upvotes || 0),
        downvotes: Number(row.downvotes || 0),
        net_score: Number(row.net_score || 0),
        hot_score: Number(row.hot_score || 0),
        user_vote: 0,
        category: String(row.category || 'SaaS'),
        claimed_at: String(row.claimed_at || row.created_at || ''),
        favicon: row.favicon_url ? String(row.favicon_url) : (row.favicon ? String(row.favicon) : undefined),
        preview_image_url: row.preview_image_url ? String(row.preview_image_url) : (row.screenshot_url ? String(row.screenshot_url) : undefined),
        is_verified: Boolean(row.is_verified),
        is_dofollow: Boolean(row.is_dofollow),
        verified_at: row.verified_at ? String(row.verified_at) : undefined,
      };
    }
  } catch {}

  return null;
}

