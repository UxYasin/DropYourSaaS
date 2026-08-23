import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { leaderboardItems as seedLeaderboardItems } from '@/lib/leaderboard-data';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    let voterToken: string | undefined;
    try {
      const cookieStore = await cookies();
      voterToken = cookieStore.get('voter_token')?.value;
    } catch {}

    let userVotesMap = new Map<string, 1 | -1>();
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

    // 1. Fetch 60% Evergreen Pool (Ordered by hot_score DESC, net_score DESC)
    const { data: hotData } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .neq('status', 'rejected')
      .order('hot_score', { ascending: false, nullsFirst: false })
      .order('net_score', { ascending: false })
      .limit(30);

    // 2. Fetch 40% Recent Fresh Drops (within 48 hours or recent)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: recentData } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .neq('status', 'rejected')
      .gte('claimed_at', fortyEightHoursAgo)
      .order('claimed_at', { ascending: false })
      .limit(20);

    const mapRow = (row: any) => {
      let hostname = 'SaaS Product';
      try {
        hostname = row.url ? new URL(row.url).hostname.replace(/^www\./, '') : 'SaaS Product';
      } catch {
        hostname = row.url || 'SaaS Product';
      }
      return {
        id: row.id,
        name: row.name || hostname,
        url: row.url,
        tagline: row.value_proposition || row.additional_info || `Verified ${row.category || 'SaaS'} tool on DropYourSaaS`,
        net_score: row.net_score || 0,
        hot_score: row.hot_score || 0,
        user_vote: userVotesMap.get(row.id) || 0,
        category: row.category || 'SaaS',
      };
    };

    const hotList = (hotData || []).map(mapRow);
    const recentList = (recentData || []).map(mapRow);

    // Combine and deduplicate
    const combinedMap = new Map<string, any>();
    hotList.forEach((item) => combinedMap.set(item.id || item.url, item));
    recentList.forEach((item) => combinedMap.set(item.id || item.url, item));

    let pool = Array.from(combinedMap.values());

    // Fallback fill with seed items if pool is small
    if (pool.length < 10) {
      seedLeaderboardItems.forEach((seed, idx) => {
        if (!pool.some((p) => p.url === seed.url)) {
          pool.push({
            id: `seed-${idx}`,
            name: seed.name,
            url: seed.url,
            tagline: `Verified ${seed.name} software product`,
            net_score: 0,
            hot_score: 0,
            user_vote: 0,
            category: 'SaaS',
          });
        }
      });
    }

    return NextResponse.json({ pool, hotCount: hotList.length, recentCount: recentList.length });
  } catch (error: any) {
    console.error('Rails pool error:', error);
    return NextResponse.json({ error: 'Failed to fetch rails pool' }, { status: 500 });
  }
}
