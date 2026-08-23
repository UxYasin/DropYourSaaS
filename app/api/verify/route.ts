import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://dropyoursaas.com');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=missing_token', baseUrl));
  }

  try {
    const supabaseAdmin = getSupabaseServerClient();

    // 1. Fetch matching pending listing from leaderboard_entries or listings (bypassing RLS via Service Role)
    let listing: any = null;
    let targetTable = 'leaderboard_entries';

    const { data: entryData, error: entryErr } = await supabaseAdmin
      .from('leaderboard_entries')
      .select('*')
      .eq('verification_token', token)
      .maybeSingle();

    if (entryData) {
      listing = entryData;
      targetTable = 'leaderboard_entries';
    } else {
      const { data: listingsData } = await supabaseAdmin
        .from('listings')
        .select('*')
        .eq('verification_token', token)
        .maybeSingle();
      if (listingsData) {
        listing = listingsData;
        targetTable = 'listings';
      }
    }

    if (!listing) {
      console.error(`Verification error: Token ${token} not found across tables`);
      return NextResponse.redirect(new URL('/?error=invalid_token', baseUrl));
    }

    // 2. Mark verified and published
    const { error: updateError } = await supabaseAdmin
      .from(targetTable)
      .update({
        is_verified: true,
        status: 'published',
        claimed_at: new Date().toISOString(),
      })
      .eq('verification_token', token);

    if (updateError) {
      console.error('Database update failed:', updateError);
      return NextResponse.redirect(new URL('/?error=update_failed', baseUrl));
    }

    // 3. Auto-link/provision user if service role key is present
    const submitterEmail = listing.email || listing.submitter_email;

    if (submitterEmail) {
      try {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        let user = usersData?.users?.find((u) => u.email === submitterEmail);

        if (!user) {
          const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
            email: submitterEmail,
            email_confirm: true,
            user_metadata: { source: 'verified_submission' },
          });
          user = newUser?.user ?? undefined;
        }

        if (user) {
          await supabaseAdmin
            .from(targetTable)
            .update({ user_id: user.id })
            .eq('verification_token', token);
        }
      } catch (authErr) {
        console.warn('Auth auto-provisioning non-critical warning:', authErr);
      }
    }

    // Invalidate Redis caches
    await invalidateLeaderboardCache().catch(() => {});

    // 4. Auto-login session generation via Supabase Admin magiclink redirect if available
    if (submitterEmail) {
      try {
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: submitterEmail,
          options: {
            redirectTo: `${baseUrl}/?verified=true`,
          },
        });

        if (linkData?.properties?.action_link) {
          return NextResponse.redirect(linkData.properties.action_link);
        }
      } catch (linkErr) {
        console.warn('Magic link generation warning:', linkErr);
      }
    }

    // Clean redirect to homepage with verified flag
    return NextResponse.redirect(new URL('/?verified=true', baseUrl));
  } catch (error: any) {
    console.error('Unhandled verification error:', error);
    return NextResponse.redirect(new URL('/?error=server_error', baseUrl));
  }
}
