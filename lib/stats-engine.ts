import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redis } from '@/lib/redis';

// Launch Date: August 20, 2026
const LAUNCH_DATE_MS = new Date('2026-08-20T00:00:00Z').getTime();
const BASELINE_LAUNCH_VISITORS = 129;

export interface DailyStatsPoint {
  date: string;
  label: string;
  visitors: number;
  outboundClicks: number;
  checkouts: number;
}

export interface StatsOverview {
  online: number;
  visitors24h: number;
  totalVisitors: number;
  bounceRate: string;
  sessionTime: string;
  conversionRate: string;
  timeline: DailyStatsPoint[];
  channels: { name: string; visitors: number; percentage: number; color: string }[];
  referrers: { name: string; visitors: number; percentage: number }[];
  pages: { path: string; visitors: number; percentage: number }[];
  countries: { code: string; name: string; flag: string; visitors: number; percentage: number }[];
  browsers: { name: string; visitors: number; percentage: number }[];
  devices: { name: string; visitors: number; percentage: number }[];
  goals: { name: string; count: number; conversion: string }[];
}

export interface AdminStatsOverview extends StatsOverview {
  realVisitors: number;
  boostedVisitors: number;
  realClicksTotal: number;
  boostedClicksTotal: number;
  listingsStats: {
    id: string;
    name: string;
    url: string;
    rank: number;
    category: string;
    realClicks: number;
    boostedClicks: number;
    totalClicks: number;
  }[];
}

/**
 * Calculates deterministic, organic diurnal traffic curve
 */
export function calculateOrganicTraffic() {
  const now = Date.now();
  const daysSinceLaunch = Math.max(1, (now - LAUNCH_DATE_MS) / (1000 * 60 * 60 * 24));

  // Current UTC hour for diurnal pulse (peaks 14:00 - 22:00 UTC)
  const currentHour = new Date().getUTCHours();
  const diurnalFactor = 0.65 + 0.35 * Math.sin(((currentHour - 8) / 24) * 2 * Math.PI);

  // Daily target rate between 720 and 960 visitors/day
  const dailyTarget = 780 + Math.floor(Math.sin(daysSinceLaunch * 0.8) * 120);

  // Accumulated simulated visitors since launch
  const accumulatedGrowth = Math.floor(daysSinceLaunch * 840 + (Math.sin(daysSinceLaunch * 1.5) * 60));
  const totalVisitors = BASELINE_LAUNCH_VISITORS + accumulatedGrowth;

  // Active visitors in last 2 hours (12 - 26 online)
  const online = Math.max(6, Math.floor(14 * diurnalFactor + (Math.sin(now / 60000) * 4) + 6));

  // Visitors in last 24h
  const visitors24h = Math.floor(dailyTarget * (0.92 + diurnalFactor * 0.16));

  return {
    online,
    visitors24h,
    totalVisitors,
    daysSinceLaunch,
    dailyTarget,
  };
}

/**
 * Generates 30-day realistic timeline curve
 */
export function generate30DayTimeline(totalVisitors: number): DailyStatsPoint[] {
  const timeline: DailyStatsPoint[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const label = `${dayNum} ${monthName}`;

    // Organic growth trajectory over past 30 days
    let dayVisitors = 0;
    if (i > 8) {
      // Pre-launch / initial launch ramp
      dayVisitors = i > 12 ? 0 : Math.floor(12 + (12 - i) * 18);
    } else {
      // Post launch full scale
      const progress = (8 - i) / 8;
      dayVisitors = Math.floor(340 + progress * 520 + Math.sin(i * 1.2) * 65);
    }

    const outboundClicks = Math.floor(dayVisitors * 0.14 + (i % 3) * 4);
    const checkouts = Math.max(0, Math.floor(dayVisitors * 0.02 + (i % 2)));

    timeline.push({
      date: dateStr,
      label,
      visitors: Math.max(0, dayVisitors),
      outboundClicks,
      checkouts,
    });
  }

  return timeline;
}

/**
 * Get full public stats payload
 */
export async function getPublicStats(): Promise<StatsOverview> {
  const cacheKey = 'site:stats:public:v2';
  try {
    const cached = await redis.get<StatsOverview>(cacheKey);
    if (cached) return cached;
  } catch {}

  const traffic = calculateOrganicTraffic();
  const timeline = generate30DayTimeline(traffic.totalVisitors);

  const total = traffic.totalVisitors;

  const channels = [
    { name: 'Direct', visitors: Math.floor(total * 0.46), percentage: 46, color: '#38bdf8' },
    { name: 'Referral', visitors: Math.floor(total * 0.26), percentage: 26, color: '#818cf8' },
    { name: 'Organic Social (X, Reddit)', visitors: Math.floor(total * 0.19), percentage: 19, color: '#f59e0b' },
    { name: 'Organic Search (Google)', visitors: Math.floor(total * 0.09), percentage: 9, color: '#10b981' },
  ];

  const referrers = [
    { name: 'x.com / twitter.com', visitors: Math.floor(total * 0.16), percentage: 16 },
    { name: 'news.ycombinator.com', visitors: Math.floor(total * 0.07), percentage: 7 },
    { name: 'producthunt.com', visitors: Math.floor(total * 0.06), percentage: 6 },
    { name: 'github.com', visitors: Math.floor(total * 0.04), percentage: 4 },
    { name: 'reddit.com/r/SaaS', visitors: Math.floor(total * 0.03), percentage: 3 },
  ];

  const pages = [
    { path: '/', visitors: Math.floor(total * 0.72), percentage: 72 },
    { path: '/explore', visitors: Math.floor(total * 0.14), percentage: 14 },
    { path: '/pricing', visitors: Math.floor(total * 0.08), percentage: 8 },
    { path: '/buy-sell', visitors: Math.floor(total * 0.06), percentage: 6 },
    { path: '/stats', visitors: Math.floor(total * 0.04), percentage: 4 },
    { path: '/about', visitors: Math.floor(total * 0.03), percentage: 3 },
  ];

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸', visitors: Math.floor(total * 0.38), percentage: 38 },
    { code: 'IN', name: 'India', flag: '🇮🇳', visitors: Math.floor(total * 0.19), percentage: 19 },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', visitors: Math.floor(total * 0.11), percentage: 11 },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', visitors: Math.floor(total * 0.07), percentage: 7 },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', visitors: Math.floor(total * 0.06), percentage: 6 },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', visitors: Math.floor(total * 0.05), percentage: 5 },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', visitors: Math.floor(total * 0.04), percentage: 4 },
    { code: 'FR', name: 'France', flag: '🇫🇷', visitors: Math.floor(total * 0.04), percentage: 4 },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', visitors: Math.floor(total * 0.03), percentage: 3 },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', visitors: Math.floor(total * 0.03), percentage: 3 },
  ];

  const browsers = [
    { name: 'Chrome', visitors: Math.floor(total * 0.68), percentage: 68 },
    { name: 'Safari', visitors: Math.floor(total * 0.18), percentage: 18 },
    { name: 'Edge', visitors: Math.floor(total * 0.08), percentage: 8 },
    { name: 'Firefox', visitors: Math.floor(total * 0.04), percentage: 4 },
    { name: 'Other', visitors: Math.floor(total * 0.02), percentage: 2 },
  ];

  const devices = [
    { name: 'Desktop', visitors: Math.floor(total * 0.56), percentage: 56 },
    { name: 'Mobile', visitors: Math.floor(total * 0.41), percentage: 41 },
    { name: 'Tablet', visitors: Math.floor(total * 0.03), percentage: 3 },
  ];

  const goals = [
    { name: 'outbound_click', count: Math.floor(total * 0.14), conversion: '14.2%' },
    { name: 'checkout_started', count: Math.floor(total * 0.03), conversion: '3.1%' },
    { name: 'listing_voted', count: Math.floor(total * 0.08), conversion: '8.4%' },
    { name: 'category_filtered', count: Math.floor(total * 0.22), conversion: '22.0%' },
  ];

  const stats: StatsOverview = {
    online: traffic.online,
    visitors24h: traffic.visitors24h,
    totalVisitors: traffic.totalVisitors,
    bounceRate: '74.6%',
    sessionTime: '2m 14s',
    conversionRate: '24.3%',
    timeline,
    channels,
    referrers,
    pages,
    countries,
    browsers,
    devices,
    goals,
  };

  try {
    await redis.set(cacheKey, stats, { ex: 30 }); // 30s cache
  } catch {}

  return stats;
}

/**
 * Get Admin breakdown (Real vs Boosted)
 */
export async function getAdminStats(): Promise<AdminStatsOverview> {
  const publicStats = await getPublicStats();
  const supabase = getSupabaseServerClient();

  let listingsStats: AdminStatsOverview['listingsStats'] = [];
  let realClicksTotal = 0;
  let boostedClicksTotal = 0;

  try {
    const { data: entries } = await supabase
      .from('leaderboard_entries')
      .select('id, name, url, rank, category, clicks, real_clicks, boosted_clicks')
      .order('rank', { ascending: true });

    if (entries) {
      listingsStats = entries.map((e, idx) => {
        const total = Number(e.clicks || 0);
        const real = Number(e.real_clicks || 0);
        const boosted = Math.max(0, total - real);

        realClicksTotal += real;
        boostedClicksTotal += boosted;

        return {
          id: String(e.id),
          name: String(e.name || 'Listing'),
          url: String(e.url),
          rank: idx + 1,
          category: String(e.category || 'SaaS'),
          realClicks: real,
          boostedClicks: boosted,
          totalClicks: total,
        };
      });
    }
  } catch (err) {
    console.warn('Admin stats error fetching entries:', err);
  }

  // Real traffic from baseline + real click conversions
  const realVisitors = BASELINE_LAUNCH_VISITORS + realClicksTotal * 3;
  const boostedVisitors = Math.max(0, publicStats.totalVisitors - realVisitors);

  return {
    ...publicStats,
    realVisitors,
    boostedVisitors,
    realClicksTotal,
    boostedClicksTotal,
    listingsStats,
  };
}

/**
 * Organic Bot Clicker: Periodically increments realistic clicks across listings
 * (2-10-20 to 100-200 across 3-7 days distributed by rank prominence)
 */
export async function simulateOrganicListingClicks() {
  try {
    const supabase = getSupabaseServerClient();
    const { data: entries } = await supabase
      .from('leaderboard_entries')
      .select('id, rank, clicks, boosted_clicks')
      .order('rank', { ascending: true });

    if (!entries || entries.length === 0) return;

    for (const e of entries) {
      const rank = Number(e.rank || 1);
      // Probability based on rank prominence:
      // Rank 1 gets clicked ~60% of ticks, Top 3 ~40%, Top 10 ~20%, lower ~10%
      const prob = rank === 1 ? 0.6 : rank <= 3 ? 0.4 : rank <= 10 ? 0.2 : 0.08;
      if (Math.random() < prob) {
        const added = Math.floor(Math.random() * 2) + 1; // +1 or +2 clicks
        const currentClicks = Number(e.clicks || 0);
        const currentBoosted = Number(e.boosted_clicks || 0);

        await supabase
          .from('leaderboard_entries')
          .update({
            clicks: currentClicks + added,
            boosted_clicks: currentBoosted + added,
          })
          .eq('id', e.id);
      }
    }
  } catch (err) {
    console.warn('Organic click simulation warning:', err);
  }
}
