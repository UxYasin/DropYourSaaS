import { redis } from '@/lib/redis';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { leaderboardItems as seedLeaderboardItems, type LeaderboardItem } from '@/lib/leaderboard-data';

const CACHE_KEY = 'leaderboard:v2';
const CACHE_TTL_SECONDS = 2; // 2 seconds TTL for ultra-fast live real-time updates

export async function getLeaderboard(): Promise<LeaderboardItem[]> {
  try {
    const cached = await redis.get<LeaderboardItem[]>(CACHE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  } catch {
    // Fallback if Redis is unconfigured or offline
  }

  const items = await fetchLeaderboardFromDatabase();
  try {
    await redis.set(CACHE_KEY, items, { ex: CACHE_TTL_SECONDS });
  } catch {}
  return items;
}

export async function getTrendingLeaderboard(limit = 5): Promise<LeaderboardItem[]> {
  const cacheKey = `leaderboard:trending:v2:${limit}`;
  try {
    const cached = await redis.get<LeaderboardItem[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  } catch {}

  const items = await fetchLeaderboardFromDatabase();
  const trending = [...items].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, limit);

  try {
    await redis.set(cacheKey, trending, { ex: CACHE_TTL_SECONDS });
  } catch {}

  return trending;
}

export async function getRecentSubmissions(limit = 5): Promise<LeaderboardItem[]> {
  const cacheKey = `leaderboard:recent:v2:${limit}`;
  try {
    const cached = await redis.get<LeaderboardItem[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  } catch {}

  const items = await fetchLeaderboardFromDatabase();
  const recent = [...items].slice(0, limit);

  try {
    await redis.set(cacheKey, recent, { ex: CACHE_TTL_SECONDS });
  } catch {}

  return recent;
}

export async function invalidateLeaderboardCache() {
  try {
    await redis.del(CACHE_KEY);
    await redis.del('leaderboard:v1');
    await redis.del('leaderboard:trending:v1:5');
    await redis.del('leaderboard:recent:v1:5');
    await redis.del('leaderboard:trending:v2:5');
    await redis.del('leaderboard:recent:v2:5');
  } catch {}
}

export async function getPaginatedLeaderboard(page = 1, limit = 50) {
  const items = await getLeaderboard();
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

export async function fetchLeaderboardFromDatabase(): Promise<LeaderboardItem[]> {
  const supabase = getSupabaseServerClient();

  let dbEntries: any[] = [];
  try {
    // Select live listings ordered by claimed_at descending (newest submission gets rank #1)
    const { data: entryData } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .neq('status', 'rejected')
      .order('claimed_at', { ascending: false });

    if (entryData && entryData.length > 0) {
      dbEntries = entryData;
    } else {
      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .neq('status', 'rejected')
        .order('claimed_at', { ascending: false });

      if (listingData && listingData.length > 0) {
        dbEntries = listingData;
      }
    }
  } catch (err) {
    console.warn('Error loading live Supabase listings:', err);
  }

  // Map real DB entries to LeaderboardItem
  const realItems: LeaderboardItem[] = dbEntries.map((row, idx) => {
    let hostname = 'SaaS Product';
    try {
      hostname = row.url ? new URL(row.url).hostname.replace(/^www\./, '') : 'SaaS Product';
    } catch {
      hostname = row.url || 'SaaS Product';
    }

    return {
      rank: idx + 1,
      name: row.name || row.title || hostname,
      bid: (row.bid_cents || 0) / 100,
      url: row.url,
      clicks: row.clicks || 0,
      time: formatRelativeTime(row.claimed_at || row.created_at || new Date().toISOString()),
    };
  });

  // Fill remaining spots up to 20 with seed items if database entries are fewer than 20
  const merged: LeaderboardItem[] = [...realItems];
  const urlSet = new Set(
    realItems
      .filter((i) => i.url)
      .map((i) => i.url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''))
  );

  let seedIdx = 0;
  while (merged.length < 20 && seedIdx < seedLeaderboardItems.length) {
    const seed = seedLeaderboardItems[seedIdx];
    const seedNorm = seed.url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

    if (!urlSet.has(seedNorm)) {
      merged.push({
        ...seed,
        rank: merged.length + 1,
      });
      urlSet.add(seedNorm);
    }
    seedIdx++;
  }

  // Ensure clean sequential ranks 1..N
  return merged.map((item, idx) => ({
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
