import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
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

    // 1. Maintain 24-Hour Cooldown Logic for Free Mode
    if (IS_FREE_MODE) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

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

    // 2. Generate verification_token & status: 'pending_verification'
    const verificationToken = crypto.randomUUID();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const verifyUrl = `${siteUrl}/api/verify?token=${verificationToken}`;

    // Save listing into database
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
          verification_token: verificationToken,
          status: 'pending_verification',
          is_verified: false,
          claimed_at: new Date().toISOString(),
        },
        { onConflict: 'url' }
      );

    if (dbError) {
      // Fallback for legacy database schemas
      await supabase
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
    }

    // 3. Dispatch transactional email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: `Verify & Activate Your SaaS Listing: ${entryName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Verify Listing</title>
            </head>
            <body style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; margin: 0;">
              <div style="max-width: 560px; margin: 0 auto; background-color: #09090b; border: 1px solid #27272a; border-radius: 20px; padding: 36px; text-align: center;">
                <div style="margin-bottom: 24px;">
                  <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                    Verify Your SaaS Listing
                  </h1>
                  <p style="font-size: 14px; color: #a1a1aa; margin: 0; line-height: 1.6;">
                    Click below to confirm your ownership of <strong>${entryName}</strong> and activate your instant directory indexing slot.
                  </p>
                </div>

                <div style="margin: 32px 0;">
                  <a href="${verifyUrl}" target="_blank" style="background-color: #0066FF; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; border: 1px solid #3b82f6; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);">
                    Verify Listing &amp; Activate Index
                  </a>
                </div>

                <p style="font-size: 12px; color: #71717a; margin-top: 32px; border-t: 1px solid #18181b; padding-top: 20px;">
                  Or copy and paste this verification URL into your browser:<br>
                  <a href="${verifyUrl}" style="color: #60a5fa; text-decoration: underline; word-break: break-all;">${verifyUrl}</a>
                </p>
              </div>
            </body>
          </html>
        `,
      }).catch((err) => {
        console.error('Resend email dispatch error:', err);
      });
    }

    await invalidateLeaderboardCache();

    return NextResponse.json({
      success: true,
      message: 'Verification link sent to your email! Please check your inbox.',
      verifyUrl, // included for local development testing
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
