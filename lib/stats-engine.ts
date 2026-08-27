import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redis } from '@/lib/redis';

// Anchor point: August 27, 2026 00:00 UTC at 129 visitors
const ANCHOR_DATE_MS = new Date('2026-08-27T00:00:00Z').getTime();
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
 * Calculates dynamic organic traffic starting from 129 and growing by ~700-1000/day
 */
export function calculateOrganicTraffic() {
  const now = Date.now();
  // Hours elapsed since today's anchor (Aug 27, 2026 00:00 UTC)
  const hoursSinceAnchor = Math.max(0, (now - ANCHOR_DATE_MS) / (1000 * 60 * 60));
  const daysSinceAnchor = hoursSinceAnchor / 24;

  // Current UTC hour for natural diurnal fluctuation
  const currentHour = new Date().getUTCHours();
  const diurnalFactor = 0.65 + 0.35 * Math.sin(((currentHour - 8) / 24) * 2 * Math.PI);

  // Daily growth rate (~750 to 950 visitors / 24h = ~31 to 40 visitors / hour)
  const growthRatePerHour = 33 + Math.sin(daysSinceAnchor * 1.5) * 6;

  // Accumulated growth starting right from 129
  const accumulatedGrowth = Math.floor(hoursSinceAnchor * growthRatePerHour);
  const totalVisitors = BASELINE_LAUNCH_VISITORS + accumulatedGrowth;

  // Active visitors online in last 2 hours (starts at 3-7 and scales naturally)
  const online = Math.max(2, Math.floor(3 + Math.min(18, daysSinceAnchor * 3) * diurnalFactor + (Math.sin(now / 60000) * 1.5)));

  // Visitors in the last 24 hours
  const visitors24h = Math.min(totalVisitors, Math.floor(58 + accumulatedGrowth * 0.85));

  return {
    online,
    visitors24h,
    totalVisitors,
    daysSinceAnchor,
  };
}

/**
 * Generates 30-day realistic timeline curve starting with the real initial spike (up to 129) and growing
 */
export function generate30DayTimeline(totalVisitors: number): DailyStatsPoint[] {
  const timeline: DailyStatsPoint[] = [];
  const now = new Date();

  // Data matching the historical DataFast curve leading up to 129:
  // Aug 22 (8), Aug 23 (14), Aug 24 (58), Aug 25 (21), Aug 26 (11), Aug 27 (Today: 17 + growth)
  const historicalDays: Record<number, number> = {
    5: 8,   // 5 days ago (Aug 22)
    4: 14,  // 4 days ago (Aug 23)
    3: 58,  // 3 days ago (Aug 24)
    2: 21,  // 2 days ago (Aug 25)
    1: 11,  // 1 day ago (Aug 26)
  };

  const todayAdded = Math.max(17, totalVisitors - 112);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const label = `${dayNum} ${monthName}`;

    let dayVisitors = 0;
    if (i === 0) {
      dayVisitors = todayAdded;
    } else if (historicalDays[i] !== undefined) {
      dayVisitors = historicalDays[i];
    } else if (i < 6) {
      dayVisitors = 4;
    }

    const outboundClicks = Math.floor(dayVisitors * 0.16);
    const checkouts = Math.max(0, Math.floor(dayVisitors * 0.03));

    timeline.push({
      date: dateStr,
      label,
      visitors: dayVisitors,
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
  const cacheKey = 'site:stats:public:v4';
  try {
    const cached = await redis.get<StatsOverview>(cacheKey);
    if (cached) return cached;
  } catch {}

  const traffic = calculateOrganicTraffic();
  const timeline = generate30DayTimeline(traffic.totalVisitors);

  const total = traffic.totalVisitors;

  const channels = [
    { name: 'Direct', visitors: Math.floor(total * 0.48), percentage: 48, color: '#38bdf8' },
    { name: 'Referral', visitors: Math.floor(total * 0.25), percentage: 25, color: '#818cf8' },
    { name: 'Organic Social (X, Reddit)', visitors: Math.floor(total * 0.18), percentage: 18, color: '#f59e0b' },
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
    { path: '/', visitors: Math.floor(total * 0.76), percentage: 76 },
    { path: '/explore', visitors: Math.floor(total * 0.12), percentage: 12 },
    { path: '/pricing', visitors: Math.floor(total * 0.06), percentage: 6 },
    { path: '/buy-sell', visitors: Math.floor(total * 0.05), percentage: 5 },
    { path: '/stats', visitors: Math.floor(total * 0.04), percentage: 4 },
    { path: '/about', visitors: Math.floor(total * 0.03), percentage: 3 },
  ];

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸', visitors: Math.floor(total * 0.38), percentage: 38 },
    { code: 'IN', name: 'India', flag: '🇮🇳', visitors: Math.floor(total * 0.19), percentage: 19 },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', visitors: Math.floor(total * 0.08), percentage: 8 },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', visitors: Math.floor(total * 0.06), percentage: 6 },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷', visitors: Math.floor(total * 0.04), percentage: 4 },
    { code: 'MV', name: 'Maldives', flag: '🇲🇻', visitors: Math.floor(total * 0.04), percentage: 4 },
    { code: 'VN', name: 'Viet Nam', flag: '🇻🇳', visitors: Math.floor(total * 0.04), percentage: 4 },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰', visitors: Math.floor(total * 0.04), percentage: 4 },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', visitors: Math.floor(total * 0.03), percentage: 3 },
    { code: 'CZ', name: 'Czechia', flag: '🇨🇿', visitors: Math.floor(total * 0.03), percentage: 3 },
  ];

  const browsers = [
    { name: 'Chrome', visitors: Math.floor(total * 0.69), percentage: 69 },
    { name: 'Safari', visitors: Math.floor(total * 0.16), percentage: 16 },
    { name: 'Edge', visitors: Math.floor(total * 0.08), percentage: 8 },
    { name: 'Twitter App', visitors: Math.floor(total * 0.04), percentage: 4 },
    { name: 'Firefox', visitors: Math.floor(total * 0.03), percentage: 3 },
  ];

  const devices = [
    { name: 'Desktop', visitors: Math.floor(total * 0.58), percentage: 58 },
    { name: 'Mobile', visitors: Math.floor(total * 0.39), percentage: 39 },
    { name: 'Tablet', visitors: Math.floor(total * 0.03), percentage: 3 },
  ];

  const goals = [
    { name: 'outbound_click', count: Math.floor(total * 0.16), conversion: '16.0%' },
    { name: 'checkout_started', count: Math.floor(total * 0.04), conversion: '4.0%' },
    { name: 'listing_voted', count: Math.floor(total * 0.07), conversion: '7.2%' },
    { name: 'category_filtered', count: Math.floor(total * 0.18), conversion: '18.4%' },
  ];

  const stats: StatsOverview = {
    online: traffic.online,
    visitors24h: traffic.visitors24h,
    totalVisitors: traffic.totalVisitors,
    bounceRate: '75.0%',
    sessionTime: '2m 12s',
    conversionRate: '24.0%',
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
    await redis.set(cacheKey, stats, { ex: 15 }); // 15s cache
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

  // Real traffic starting from 129 + real click actions
  const realVisitors = BASELINE_LAUNCH_VISITORS + realClicksTotal * 2;
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
      const prob = rank === 1 ? 0.6 : rank <= 3 ? 0.4 : rank <= 10 ? 0.2 : 0.08;
      if (Math.random() < prob) {
        const added = Math.floor(Math.random() * 2) + 1;
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
