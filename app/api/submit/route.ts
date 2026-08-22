import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';
import { IS_FREE_MODE } from '@/lib/copy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { url, title, name, email, category, isForSale, bid } = body || {};

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const entryName = title || name || new URL(url).hostname;
    const supabase = getSupabaseServerClient();

    // Phase 3: 24-Hour Cooldown Check (Only in Free Mode)
    if (IS_FREE_MODE) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Check for any submission by this email in the last 24 hours
      const { data: recentSubmissions } = await supabase
        .from('leaderboard_entries')
        .select('claimed_at')
        .eq('email', email)
        .gte('claimed_at', twentyFourHoursAgo)
        .order('claimed_at', { ascending: false })
        .limit(1);

      if (recentSubmissions && recentSubmissions.length > 0) {
        return NextResponse.json(
          {
            error: 'Rate limited',
            message: 'You can only submit one free listing every 24 hours.',
          },
          { status: 429 }
        );
      }
    }

    // Insert or update the listing entry
    const { error: dbError } = await supabase
      .from('leaderboard_entries')
      .upsert(
        {
          url,
          name: entryName,
          email,
          category: category || 'SaaS',
          for_sale: !!isForSale,
          bid_cents: IS_FREE_MODE ? 0 : Math.round((bid || 1) * 100),
          claimed_at: new Date().toISOString(),
        },
        { onConflict: 'url' }
      );

    if (dbError) {
      // Fallback if email column doesn't exist yet on legacy schema
      const { error: retryError } = await supabase
        .from('leaderboard_entries')
        .upsert(
          {
            url,
            name: entryName,
            bid_cents: IS_FREE_MODE ? 0 : Math.round((bid || 1) * 100),
            claimed_at: new Date().toISOString(),
          },
          { onConflict: 'url' }
        );

      if (retryError) {
        return NextResponse.json({ error: 'Failed to record listing' }, { status: 500 });
      }
    }

    // Invalidate Redis caches so feeds refresh immediately
    await invalidateLeaderboardCache();

    return NextResponse.json({
      success: true,
      message: 'Listing submitted successfully!',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
