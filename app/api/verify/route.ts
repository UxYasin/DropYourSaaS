import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/?error=missing_token`);
  }

  const supabase = getSupabaseServerClient();

  try {
    // 1. Find the matching listing by verification_token
    const { data: listing, error: fetchErr } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('verification_token', token)
      .maybeSingle();

    if (fetchErr || !listing) {
      return NextResponse.redirect(`${siteUrl}/?error=invalid_token`);
    }

    // 2. Update listing status to 'published' and is_verified: true
    await supabase
      .from('leaderboard_entries')
      .update({
        status: 'published',
        is_verified: true,
        claimed_at: new Date().toISOString(),
      })
      .eq('verification_token', token);

    // 3. Check if Supabase Auth user exists for submitter_email
    const submitterEmail = listing.email;
    let userId: string | null = null;

    if (submitterEmail) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = usersData?.users?.find((u) => u.email === submitterEmail);

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create user account to support hybrid passwordless flow
        const { data: newUser } = await supabase.auth.admin.createUser({
          email: submitterEmail,
          email_confirm: true,
        });
        if (newUser?.user) {
          userId = newUser.user.id;
        }
      }
    }

    // 4. Link listings.user_id to the user's ID
    if (userId) {
      await supabase
        .from('leaderboard_entries')
        .update({ user_id: userId })
        .eq('verification_token', token);
    }

    // Invalidate Redis caches so listing publishes immediately
    await invalidateLeaderboardCache();

    // 5. Redirect user to /?verified=true
    return NextResponse.redirect(`${siteUrl}/?verified=true`);
  } catch (err: any) {
    console.error('Verification error:', err);
    return NextResponse.redirect(`${siteUrl}/?error=verification_failed`);
  }
}
