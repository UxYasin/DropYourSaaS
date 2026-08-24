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

    // 1. Get or create persistent voter token in cookies
    const cookieStore = await cookies();
    let voterToken = cookieStore.get('voter_token')?.value;
    let setCookie = false;

    if (!voterToken) {
      voterToken = crypto.randomUUID();
      setCookie = true;
    }

    const supabase = getSupabaseServerClient();

    // 2. Perform database operation
    if (direction === 0) {
      const { error: deleteErr } = await supabase
        .from('listing_votes')
        .delete()
        .eq('listing_id', listingId)
        .eq('voter_token', voterToken);

      if (deleteErr) {
        console.warn('listing_votes delete error:', deleteErr.message);
      }
    } else {
      const { error: upsertErr } = await supabase
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

      if (upsertErr) {
        console.warn('listing_votes upsert error:', upsertErr.message);
      }
    }

    // 3. Recount and query latest scores
    let netScore: number | null = null;

    // Check leaderboard_entries
    const { data: updatedEntry } = await supabase
      .from('leaderboard_entries')
      .select('net_score, upvotes, downvotes')
      .eq('id', listingId)
      .maybeSingle();

    if (updatedEntry && typeof updatedEntry.net_score === 'number') {
      netScore = updatedEntry.net_score;
    } else {
      // Check listings table
      const { data: updatedListing } = await supabase
        .from('listings')
        .select('net_score, upvotes, downvotes')
        .eq('id', listingId)
        .maybeSingle();

      if (updatedListing && typeof updatedListing.net_score === 'number') {
        netScore = updatedListing.net_score;
      }
    }

    // If trigger did not calculate or tables don't have columns yet, compute manually
    if (netScore === null || netScore === undefined) {
      const { data: voteRows } = await supabase
        .from('listing_votes')
        .select('vote_type')
        .eq('listing_id', listingId);

      let upvotes = 0;
      let downvotes = 0;
      if (voteRows) {
        voteRows.forEach((r) => {
          if (r.vote_type === 1) upvotes++;
          if (r.vote_type === -1) downvotes++;
        });
      }
      netScore = upvotes - downvotes;

      // Best effort update on tables
      try {
        await supabase
          .from('leaderboard_entries')
          .update({
            upvotes,
            downvotes,
            net_score: netScore,
          })
          .eq('id', listingId);
      } catch {}

      try {
        await supabase
          .from('listings')
          .update({
            upvotes,
            downvotes,
            net_score: netScore,
          })
          .eq('id', listingId);
      } catch {}
    }

    // Invalidate leaderboard cache
    await invalidateLeaderboardCache().catch(() => {});

    // 4. Return response with persistent cookie if new
    const response = NextResponse.json({
      success: true,
      listingId,
      netScore: netScore ?? 0,
      userVote: direction,
      voterToken,
    });

    if (setCookie) {
      response.cookies.set('voter_token', voterToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error: unknown) {
    console.error('Vote API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process vote';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

