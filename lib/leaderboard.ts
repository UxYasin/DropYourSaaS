import { redis } from '@/lib/redis';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { LeaderboardItem } from '@/lib/leaderboard-data';

const CACHE_KEY = 'leaderboard:v1';
const CACHE_TTL_SECONDS = 30;

// Cache-aside: serve from Redis when possible so the leaderboard page
// (read constantly) doesn't hit Postgres on every request.
export async function getLeaderboard(): Promise<LeaderboardItem[]> {
  try {
    const cached = await redis.get<LeaderboardItem[]>(CACHE_KEY);
    if (cached) return cached;
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

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('url, name, bid_cents, clicks, claimed_at')
    .order('clicks', { ascending: false })
    .order('claimed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const items: LeaderboardItem[] = (data ?? []).map((row, index) => ({
    rank: index + 1,
    name: row.name,
    bid: row.bid_cents / 100,
    url: row.url,
    clicks: row.clicks ?? 0,
    time: formatRelativeTime(row.claimed_at),
  }));

  try {
    await redis.set(cacheKey, items, { ex: CACHE_TTL_SECONDS });
  } catch {}

  return items;
}

export async function getRecentSubmissions(limit = 5): Promise<LeaderboardItem[]> {
  const cacheKey = `leaderboard:recent:v1:${limit}`;
  try {
    const cached = await redis.get<LeaderboardItem[]>(cacheKey);
    if (cached) return cached;
  } catch {}

  const supabase = getSupabaseServerClient();

  const { data: allEntries, error: allErr } = await supabase
    .from('leaderboard_entries')
    .select('url, name, bid_cents, clicks, claimed_at')
    .order('bid_cents', { ascending: false });

  if (allErr) throw allErr;

  const rankMap = new Map<string, number>();
  (allEntries ?? []).forEach((row, idx) => {
    rankMap.set(row.url, idx + 1);
  });

  const recentRows = [...(allEntries ?? [])]
    .sort((a, b) => new Date(b.claimed_at).getTime() - new Date(a.claimed_at).getTime())
    .slice(0, limit);

  const items: LeaderboardItem[] = recentRows.map((row) => ({
    rank: rankMap.get(row.url) ?? 1,
    name: row.name,
    bid: row.bid_cents / 100,
    url: row.url,
    clicks: row.clicks ?? 0,
    time: formatRelativeTime(row.claimed_at),
  }));

  try {
    await redis.set(cacheKey, items, { ex: CACHE_TTL_SECONDS });
  } catch {}

  return items;
}

export async function invalidateLeaderboardCache() {
  try {
    await redis.del(CACHE_KEY);
    await redis.del('leaderboard:trending:v1:5');
    await redis.del('leaderboard:recent:v1:5');
  } catch {}
}

async function fetchLeaderboardFromDatabase(): Promise<LeaderboardItem[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('url, name, bid_cents, clicks, claimed_at')
    .order('bid_cents', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row, index) => ({
    rank: index + 1,
    name: row.name,
    bid: row.bid_cents / 100,
    url: row.url,
    clicks: row.clicks,
    time: formatRelativeTime(row.claimed_at),
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

