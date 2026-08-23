import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { listingId, direction } = body || {};

    if (!listingId || typeof direction !== 'number') {
      return NextResponse.json(
        { error: 'Missing listingId or direction parameter' },
        { status: 400 }
      );
    }

    if (![-1, 0, 1].includes(direction)) {
      return NextResponse.json(
        { error: 'Invalid vote direction. Must be -1, 0, or 1' },
        { status: 400 }
      );
    }

    // 1. Get or generate voter_token cookie
    const cookieStore = await cookies();
    let voterToken = cookieStore.get('voter_token')?.value;
    let isNewCookie = false;

    if (!voterToken) {
      voterToken = crypto.randomUUID();
      isNewCookie = true;
    }

    const supabase = getSupabaseServerClient();

    // 2. Perform vote action (0 = remove vote, 1/-1 = upsert vote)
    if (direction === 0) {
      await supabase
        .from('listing_votes')
        .delete()
        .eq('listing_id', listingId)
        .eq('voter_token', voterToken);
    } else {
      await supabase
        .from('listing_votes')
        .upsert(
          {
            listing_id: listingId,
            voter_token: voterToken,
            vote_type: direction,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'listing_id,voter_token' }
        );
    }

    // 3. Query updated upvotes/downvotes/net_score for this listing
    const { data: voteRows } = await supabase
      .from('listing_votes')
      .select('vote_type')
      .eq('listing_id', listingId);

    let upvotes = 0;
    let downvotes = 0;
    if (voteRows) {
      voteRows.forEach((r) => {
        if (r.vote_type === 1) upvotes++;
        if (r.vote_type === -1) downvotes--;
      });
    }

    const netScore = upvotes + downvotes; // upvotes + negative downvotes

    // Update score columns on leaderboard_entries directly
    await supabase
      .from('leaderboard_entries')
      .update({
        upvotes,
        downvotes: Math.abs(downvotes),
        net_score: netScore,
      })
      .eq('id', listingId);

    // Invalidate leaderboard cache
    await invalidateLeaderboardCache().catch(() => {});

    // Prepare response
    const response = NextResponse.json({
      success: true,
      listingId,
      netScore,
      userVote: direction,
      voterToken,
    });

    // Set voter_token cookie if new (1 year max-age)
    if (isNewCookie) {
      response.cookies.set({
        name: 'voter_token',
        value: voterToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    console.error('Vote API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process vote' },
      { status: 500 }
    );
  }
}
