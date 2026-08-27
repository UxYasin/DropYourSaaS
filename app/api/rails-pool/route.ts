import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export interface PinnedAdItem {
  id: string;
  name: string;
  url: string;
  tagline: string;
  net_score: number;
  user_vote: number;
  category: string;
  is_pinned: boolean;
  slot_position: string;
  expires_at: string;
  logo_url?: string;
}

export interface PoolListingItem {
  id: string;
  name: string;
  url: string;
  tagline: string;
  net_score: number;
  hot_score: number;
  user_vote: 1 | -1 | 0;
  category: string;
  is_verified?: boolean;
  bid_cents?: number;
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

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

    // 0. Fetch active Pinned Ads for rail slots
    const pinnedAdsMap: Record<string, PinnedAdItem> = {};
    try {
      const { data: activePinned } = await supabase
        .from('pinned_ads')
        .select('*')
        .or('status.eq.active,is_active.eq.true')
        .gt('expires_at', new Date().toISOString());

      if (activePinned) {
        activePinned.forEach((ad) => {
          let hostname = 'SaaS Product';
          try {
            hostname = ad.site_url ? new URL(ad.site_url).hostname.replace(/^www\./, '') : ad.project_name;
          } catch {
            hostname = ad.project_name;
          }

          pinnedAdsMap[ad.slot_position] = {
            id: ad.id,
            name: ad.project_name || hostname,
            url: ad.site_url,
            tagline: ad.one_liner,
            net_score: 99,
            user_vote: 0,
            category: 'Sponsored',
            is_pinned: true,
            slot_position: ad.slot_position,
            expires_at: ad.expires_at,
            logo_url: ad.logo_url || undefined,
          };
        });
      }
    } catch (err) {
      console.warn('Pinned ads fetch warning:', err);
    }

    // 1. Fetch real listings directly from Supabase leaderboard_entries
    const { data: dbData, error: dbError } = await supabase
      .from('leaderboard_entries')
      .select('id, url, name, category, net_score, hot_score, is_verified, bid_cents, upvotes, clicks, claimed_at')
      .neq('status', 'rejected')
      .order('bid_cents', { ascending: false, nullsFirst: false })
      .order('hot_score', { ascending: false, nullsFirst: false })
      .order('net_score', { ascending: false });

    if (dbError) {
      console.warn('Database listings fetch warning:', dbError);
    }

    const mapRow = (row: Record<string, unknown>): PoolListingItem => {
      const urlStr = String(row.url || '');
      let hostname = 'SaaS Product';
      try {
        hostname = urlStr ? new URL(urlStr).hostname.replace(/^www\./, '') : 'SaaS Product';
      } catch {
        hostname = urlStr || 'SaaS Product';
      }
      return {
        id: String(row.id || ''),
        name: String(row.name || hostname),
        url: urlStr,
        tagline: `Verified ${row.category || 'SaaS'} tool on DropYourSaaS`,
        net_score: Number(row.net_score || 0),
        hot_score: Number(row.hot_score || 0),
        user_vote: userVotesMap.get(String(row.id || '')) || 0,
        category: String(row.category || 'SaaS'),
        is_verified: Boolean(row.is_verified || Number(row.bid_cents || 0) >= 500),
        bid_cents: Number(row.bid_cents || 0),
      };
    };

    const pool = (dbData || []).map(mapRow);

    return NextResponse.json({
      pool,
      pinnedAds: pinnedAdsMap,
      count: pool.length,
    });
  } catch (error: unknown) {
    console.error('Rails pool error:', error);
    return NextResponse.json({ error: 'Failed to fetch rails pool' }, { status: 500 });
  }
}
