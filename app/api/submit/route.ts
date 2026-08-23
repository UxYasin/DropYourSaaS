import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';
import { IS_FREE_MODE } from '@/lib/copy';
import { savePendingToken } from '@/lib/token-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { url, title, name, email, category, isForSale, bid, requestedRank, selectedRank } = body || {};

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const entryName = title || name || new URL(url).hostname;
    const targetRank = requestedRank || selectedRank || 1;
    const supabaseAdmin = getSupabaseServerClient();

    // 1. Dual 24-Hour Cooldown (by Email and Domain)
    let parsedDomain = '';
    try {
      parsedDomain = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      parsedDomain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    }

    if (IS_FREE_MODE) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      try {
        const { data: recentEntries } = await supabaseAdmin
          .from('leaderboard_entries')
          .select('id, email, submitter_email, url, claimed_at')
          .or(`email.eq.${email},submitter_email.eq.${email},url.ilike.%${parsedDomain}%`)
          .gte('claimed_at', twentyFourHoursAgo);

        if (recentEntries && recentEntries.length > 0) {
          return NextResponse.json(
            { error: 'Rate limited. You can only submit 1 product or domain every 24 hours.' },
            { status: 429 }
          );
        }
      } catch (rateErr) {
        console.warn('Rate limit query warning:', rateErr);
      }
    }

    // 2. Authenticated & Previous Verification History Check
    let isAlreadyVerified = false;

    try {
      const { data: verifiedHistory } = await supabaseAdmin
        .from('leaderboard_entries')
        .select('id')
        .or(`email.eq.${email},submitter_email.eq.${email}`)
        .eq('is_verified', true)
        .limit(1);

      if (verifiedHistory && verifiedHistory.length > 0) {
        isAlreadyVerified = true;
      } else {
        const { data: listingsHistory } = await supabaseAdmin
          .from('listings')
          .select('id')
          .or(`email.eq.${email},submitter_email.eq.${email}`)
          .eq('is_verified', true)
          .limit(1);

        if (listingsHistory && listingsHistory.length > 0) {
          isAlreadyVerified = true;
        }
      }
    } catch (checkErr) {
      console.warn('Verification check exception:', checkErr);
    }

    // CASE A: User is Logged In / Already Verified (isAlreadyVerified === true)
    if (isAlreadyVerified) {
      console.log(`User ${email} is already verified. Publishing listing directly without email verification.`);

      const recordPayload: Record<string, any> = {
        url,
        name: entryName,
        email,
        submitter_email: email,
        category: category || 'SaaS',
        for_sale: !!isForSale,
        bid_cents: IS_FREE_MODE ? 0 : Math.round((bid || 1) * 100),
        target_rank: targetRank,
        is_verified: true,
        status: 'published',
        claimed_at: new Date().toISOString(),
      };

      const { data: newListing } = await supabaseAdmin
        .from('leaderboard_entries')
        .upsert(recordPayload, { onConflict: 'url' })
        .select('id')
        .maybeSingle();

      if (newListing?.id) {
        try {
          await supabaseAdmin.rpc('claim_listing_spot', {
            target_listing_id: newListing.id,
            target_rank: targetRank,
          });
        } catch (err) {
          console.warn('RPC claim_listing_spot notice:', err);
        }
      }

      try {
        revalidatePath('/', 'page');
        revalidatePath('/[category]', 'page');
      } catch {}

      await invalidateLeaderboardCache().catch(() => {});

      return NextResponse.json({
        success: true,
        verified: true,
        immediate: true,
        message: 'Listing published immediately!',
      });
    }

    // CASE B: Guest / First-time User (isAlreadyVerified === false)
    const verification_token = crypto.randomUUID();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://dropyoursaas.com');
    const verifyUrl = `${baseUrl}/api/verify?token=${verification_token}`;

    savePendingToken(verification_token, {
      url,
      name: entryName,
      email,
      category: category || 'SaaS',
      isForSale: !!isForSale,
      bid: bid || 0,
    });

    const pendingPayload: Record<string, any> = {
      url,
      name: entryName,
      email,
      submitter_email: email,
      category: category || 'SaaS',
      for_sale: !!isForSale,
      bid_cents: IS_FREE_MODE ? 0 : Math.round((bid || 1) * 100),
      target_rank: targetRank,
      verification_token: verification_token,
      status: 'pending_verification',
      is_verified: false,
      claimed_at: new Date().toISOString(),
    };

    let insertedSuccessfully = false;

    try {
      const { data: insertedData, error: dbError } = await supabaseAdmin
        .from('leaderboard_entries')
        .upsert(pendingPayload, { onConflict: 'url' })
        .select()
        .maybeSingle();

      if (!dbError && insertedData) {
        insertedSuccessfully = true;
      } else if (dbError) {
        console.warn('Primary leaderboard_entries insert error:', dbError.message);
        const legacyPayload = {
          url,
          name: entryName,
          bid_cents: IS_FREE_MODE ? 0 : Math.round((bid || 1) * 100),
          target_rank: targetRank,
          claimed_at: new Date().toISOString(),
        };
        const { error: legacyErr } = await supabaseAdmin
          .from('leaderboard_entries')
          .upsert(legacyPayload, { onConflict: 'url' });

        if (!legacyErr) insertedSuccessfully = true;
      }
    } catch (e: any) {
      console.warn('leaderboard_entries upsert exception:', e.message);
    }

    if (!insertedSuccessfully) {
      try {
        await supabaseAdmin
          .from('listings')
          .upsert(
            {
              title: entryName,
              name: entryName,
              url,
              submitter_email: email,
              email,
              target_rank: targetRank,
              verification_token: verification_token,
              is_verified: false,
              status: 'pending_verification',
            },
            { onConflict: 'url' }
          );
      } catch (e: any) {
        console.warn('Listings upsert exception:', e.message);
      }
    }

    // Send verification email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { error: emailError } = await resend.emails.send({
        from: 'DropYourSaaS <hello@dropyoursaas.com>',
        to: [email],
        subject: `Verify & Activate Your SaaS Listing: ${entryName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Verify Listing</title>
            </head>
            <body style="background-color: #f4f4f5; padding: 20px 0; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <div style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px; max-width: 480px; margin: 40px auto;">
                <img src="${baseUrl}/icon.png" alt="DropYourSaaS" width="48" height="48" style="display:block; margin:0 auto 20px auto; border-radius:8px;" />
                <h2 style="color: #18181b; font-size: 20px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">Verify Your SaaS Listing</h2>
                <p style="color: #52525b; font-size: 14px; line-height: 22px; margin: 0 0 24px 0; text-align: center;">
                  Click below to confirm your ownership of <strong>${entryName}</strong> and activate your instant directory indexing slot.
                </p>
                <a href="${verifyUrl}" style="display: block; background-color: #2563eb; color: #ffffff; text-align: center; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 0 auto 24px auto;">
                  Verify Listing &amp; Activate Index
                </a>
                <p style="color: #71717a; font-size: 12px; text-align: center; word-break: break-all; margin: 0;">
                  Or copy and paste this link: <br/>
                  <a href="${verifyUrl}" style="color: #2563eb;">${verifyUrl}</a>
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (emailError) {
        console.error('Resend email error:', emailError);
        return NextResponse.json(
          { error: emailError.message || 'Failed to send verification email' },
          { status: 500 }
        );
      }
    }

    await invalidateLeaderboardCache().catch(() => {});

    return NextResponse.json({
      success: true,
      verified: false,
      redirectUrl: `/thank-you?email=${encodeURIComponent(email)}`,
      message: 'Verification link sent to your email! Please check your inbox.',
    });
  } catch (err: any) {
    console.error('Submit route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
