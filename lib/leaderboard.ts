import { redis } from '@/lib/redis';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { leaderboardItems as seedLeaderboardItems, type LeaderboardItem } from '@/lib/leaderboard-data';

const CACHE_KEY = 'leaderboard:v1';
const CACHE_TTL_SECONDS = 15;

export async function getLeaderboard(): Promise<LeaderboardItem[]> {
  try {
    const cached = await redis.get<LeaderboardItem[]>(CACHE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  } catch {
    // Graceful fallback if Redis is unavailable or unconfigured
  }

  const items = await fetchLeaderboardFromDatabase();
  try {
    await redis.set(CACHE_KEY, items, { ex: CACHE_TTL_SECONDS });
  } catch {}
  return items;
}

export async function getTrendingLeaderboard(limit = 5): Promise<LeaderboardItem[]> {
  const cacheKey = `leaderboard:trending:v1:${limit}`;
  try {
    const cached = await redis.get<LeaderboardItem[]>(cacheKey);
    if (cached) return cached;
  } catch {}

  const items = await fetchLeaderboardFromDatabase();
  const trending = [...items].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, limit);

  try {
    await redis.set(cacheKey, trending, { ex: CACHE_TTL_SECONDS });
  } catch {}

  return trending;
}

export async function getRecentSubmissions(limit = 5): Promise<LeaderboardItem[]> {
  const cacheKey = `leaderboard:recent:v1:${limit}`;
  try {
    const cached = await redis.get<LeaderboardItem[]>(cacheKey);
    if (cached) return cached;
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
    await redis.del('leaderboard:trending:v1:5');
    await redis.del('leaderboard:recent:v1:5');
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
    const { data: entryData } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('is_verified', true)
      .eq('status', 'published')
      .order('rank', { ascending: true, nullsFirst: false });

    if (entryData && entryData.length > 0) {
      dbEntries = entryData;
    } else {
      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .eq('is_verified', true)
        .eq('status', 'published')
        .order('rank', { ascending: true, nullsFirst: false });

      if (listingData && listingData.length > 0) {
        dbEntries = listingData;
      }
    }
  } catch (err) {
    console.warn('Error loading live Supabase listings:', err);
  }

  // Convert real DB entries to LeaderboardItem
  const realItems: LeaderboardItem[] = dbEntries.map((row, idx) => ({
    rank: row.rank || idx + 1,
    name: row.name || row.title || 'SaaS Product',
    bid: (row.bid_cents || 0) / 100,
    url: row.url,
    clicks: row.clicks || 0,
    time: formatRelativeTime(row.claimed_at || row.created_at || new Date().toISOString()),
  }));

  // Build merged array: place verified real items at their ranks, fill remaining spots with seed items
  const merged: LeaderboardItem[] = [];
  const rankTakenMap = new Set<number>();

  realItems.forEach((item) => {
    rankTakenMap.add(item.rank);
    merged.push(item);
  });

  // Fill up to 20 spots using seed mock items
  let seedIdx = 0;
  for (let r = 1; r <= 20; r++) {
    if (!rankTakenMap.has(r)) {
      while (
        seedIdx < seedLeaderboardItems.length &&
        merged.some((m) => m.url === seedLeaderboardItems[seedIdx].url)
      ) {
        seedIdx++;
      }
      if (seedIdx < seedLeaderboardItems.length) {
        merged.push({
          ...seedLeaderboardItems[seedIdx],
          rank: r,
        });
        seedIdx++;
      }
    }
  }

  // Sort strictly by rank ascending
  merged.sort((a, b) => a.rank - b.rank);

  return merged;
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
