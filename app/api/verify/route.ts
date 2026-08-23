import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';
import { getPendingToken, removePendingToken } from '@/lib/token-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://dropyoursaas.com');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=missing_token', baseUrl));
  }

  const cleanToken = token.trim();
  console.log('Initiating token lookup for verification:', cleanToken);

  try {
    const supabaseAdmin = getSupabaseServerClient();
    let listing: any = null;
    let targetTable = 'leaderboard_entries';

    // 1. Check in-memory fallback store first for instant match
    const pendingFallback = getPendingToken(cleanToken);

    // 2. Fetch matching pending listing from Supabase leaderboard_entries or listings (bypassing RLS via Service Role)
    try {
      const { data: entryData, error: entryErr } = await supabaseAdmin
        .from('leaderboard_entries')
        .select('*')
        .eq('verification_token', cleanToken)
        .maybeSingle();

      if (entryData) {
        listing = entryData;
        targetTable = 'leaderboard_entries';
        console.log('Found matching token in leaderboard_entries table for ID:', listing.id);
      } else {
        if (entryErr) console.warn('leaderboard_entries lookup error:', entryErr);

        const { data: listingsData, error: listingsErr } = await supabaseAdmin
          .from('listings')
          .select('*')
          .eq('verification_token', cleanToken)
          .maybeSingle();

        if (listingsData) {
          listing = listingsData;
          targetTable = 'listings';
          console.log('Found matching token in listings table for ID:', listing.id);
        } else if (listingsErr) {
          console.warn('listings lookup error:', listingsErr);
        }
      }
    } catch (fetchErr) {
      console.warn('Database fetch warning in verify route:', fetchErr);
    }

    // Fallback to in-memory pending token if database query returned null
    if (!listing && pendingFallback) {
      console.log('Using in-memory pending token fallback for:', pendingFallback.name);
      listing = {
        url: pendingFallback.url,
        name: pendingFallback.name,
        email: pendingFallback.email,
        submitter_email: pendingFallback.email,
        verification_token: cleanToken,
      };
    }

    if (!listing) {
      console.error(`CRITICAL: Token lookup failed for token: "${cleanToken}". Zero matching rows in database or memory store.`);
      return NextResponse.redirect(new URL('/?error=invalid_token', baseUrl));
    }

    // 3. Mark verified and published in Supabase database
    try {
      const { error: updateError } = await supabaseAdmin
        .from(targetTable)
        .update({
          is_verified: true,
          status: 'published',
          claimed_at: new Date().toISOString(),
        })
        .eq('verification_token', cleanToken);

      if (updateError) {
        console.warn(`Update error on ${targetTable}:`, updateError);
        if (pendingFallback) {
          try {
            await supabaseAdmin
              .from('leaderboard_entries')
              .upsert(
                {
                  url: pendingFallback.url,
                  name: pendingFallback.name,
                  email: pendingFallback.email,
                  submitter_email: pendingFallback.email,
                  verification_token: cleanToken,
                  is_verified: true,
                  status: 'published',
                  bid_cents: Math.round((pendingFallback.bid || 0) * 100),
                  claimed_at: new Date().toISOString(),
                },
                { onConflict: 'url' }
              );
          } catch {}
        }
      }
    } catch (dbUpdateException) {
      console.warn('Database verify update exception:', dbUpdateException);
    }

    // 4. Auto-link / provision user account if service role key is present
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
          try {
            await supabaseAdmin
              .from(targetTable)
              .update({ user_id: user.id })
              .eq('verification_token', cleanToken);
          } catch {}
        }
      } catch (authErr) {
        console.warn('Auth auto-provisioning non-critical warning:', authErr);
      }
    }

    // Cleanup memory store token
    if (pendingFallback) {
      removePendingToken(cleanToken);
    }

    // Invalidate Redis caches
    await invalidateLeaderboardCache().catch(() => {});

    // 5. Auto-login session generation via Supabase Admin magiclink redirect if available
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
