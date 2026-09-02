import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';
import { IS_FREE_MODE } from '@/lib/copy';
import { savePendingToken } from '@/lib/token-store';
import { postToX } from '@/lib/twitter';
import { validateListingSubmission } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const {
      url,
      title,
      name,
      email,
      category,
      marketCategory,
      isForSale,
      forSale,
      askingPrice,
      asking_price,
      mrr,
      ttmRevenue,
      ttm_revenue,
      last30DaysRevenue,
      activeSubscriptions,
      founderName,
      foundedYear,
      locationCountry,
      valueProposition,
      problemSolved,
      audience,
      pricingModel,
      teamSize,
      fundingStatus,
      techStack,
      marketingChannels,
      additionalInfo,
      bid,
      requestedRank,
      selectedRank,
      tier,
      twitterHandle,
      twitter_handle,
    } = body || {};

    const rawUrl = url || '';
    const entryName = title || name || 'SaaS Product';
    const description = valueProposition || problemSolved || additionalInfo || '';

    // Security & Anti-Phishing Validation
    const validation = validateListingSubmission({
      name: entryName,
      url: rawUrl,
      description,
    });

    if (!validation.valid || !validation.sanitizedUrl) {
      return NextResponse.json({ error: validation.error || 'Invalid website URL format.' }, { status: 400 });
    }

    const formattedUrl = validation.sanitizedUrl;
    const parsedDomain = validation.hostname || 'SaaS Product';

    const cleanTwitterHandle = twitterHandle || twitter_handle
      ? String(twitterHandle || twitter_handle).trim().replace(/^@/, '')
      : null;
    const targetRank = Math.max(1, Number(requestedRank || selectedRank || 1));
    const isMarketplaceListing = Boolean(isForSale || forSale);
    const supabaseAdmin = getSupabaseServerClient();

    const parsedAskingPrice = Number(askingPrice || asking_price) || 0;
    const parsedMrr = Number(mrr) || 0;
    const parsedTtmRevenue = Number(ttmRevenue || ttm_revenue) || 0;
    const parsedLast30DaysRevenue = Number(last30DaysRevenue) || 0;
    const parsedActiveSubscriptions = Number(activeSubscriptions) || 0;
    const resolvedCategory = marketCategory || category || 'SaaS';
    const calculatedBidCents = Math.max(100, Math.round((Number(bid) || 1) * 100));

    // 1. Dual 24-Hour Cooldown (by Email and Domain)
    if (IS_FREE_MODE) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      try {
        const query = email
          ? `email.eq.${email},submitter_email.eq.${email},url.ilike.%${parsedDomain}%`
          : `url.ilike.%${parsedDomain}%`;

        const { data: recentEntries } = await supabaseAdmin
          .from('leaderboard_entries')
          .select('id, email, submitter_email, url, claimed_at, status')
          .or(query)
          .eq('status', 'published')
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


    // CASE A: Standard Directory Listing (isForSale === false)
    if (!isMarketplaceListing) {
      console.log(`Standard directory listing for ${formattedUrl} pending payment for position #${targetRank} (tier: ${tier || 'outbid'}).`);

      const submitterEmail = email ? email.trim() : 'guest@dropyoursaas.com';

      const corePayload = {
        url: formattedUrl,
        name: entryName,
        email: submitterEmail,
        submitter_email: submitterEmail,
        bid_cents: calculatedBidCents,
        target_rank: targetRank,
        rank: targetRank,
        is_verified: false,
        is_dofollow: false,
        status: 'pending',
        is_for_sale: false,
        twitter_handle: cleanTwitterHandle,
        claimed_at: new Date().toISOString(),
      };

      let { data: newListing, error: upsertErr } = await supabaseAdmin
        .from('leaderboard_entries')
        .upsert(corePayload, { onConflict: 'url' })
        .select('id')
        .maybeSingle();

      if (upsertErr) {
        console.error('Supabase leaderboard_entries upsert error:', upsertErr.message);
        const fallbackPayload = {
          url: formattedUrl,
          name: entryName,
          bid_cents: calculatedBidCents,
          rank: targetRank,
          target_rank: targetRank,
          is_verified: false,
          is_dofollow: false,
          status: 'pending',
          twitter_handle: cleanTwitterHandle,
          claimed_at: new Date().toISOString(),
        };
        const { data: fallbackListing } = await supabaseAdmin
          .from('leaderboard_entries')
          .upsert(fallbackPayload, { onConflict: 'url' })
          .select('id')
          .maybeSingle();
        newListing = fallbackListing;
      }

      return NextResponse.json({
        success: true,
        id: newListing?.id || formattedUrl,
        listingId: newListing?.id || formattedUrl,
        tier: tier || 'outbid',
        verified: false,
        immediate: false,
        message: 'Pending record created. Complete payment to publish.',
      });
    }

    // CASE B: Buy/Sell Marketplace Listing (isForSale === true)
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required to list your SaaS for sale in the marketplace.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim();
    const verification_token = crypto.randomUUID();
    const origin =
      process.env.NODE_ENV === 'production'
        ? 'https://dropyoursaas.com'
        : (process.env.NEXT_PUBLIC_APP_URL || 'https://dropyoursaas.com');
    const verifyUrl = `${origin}/api/verify?token=${verification_token}`;

    savePendingToken(verification_token, {
      url: formattedUrl,
      name: entryName,
      email: cleanEmail,
      category: resolvedCategory,
      isForSale: true,
      askingPrice: parsedAskingPrice,
      mrr: parsedMrr,
      ttmRevenue: parsedTtmRevenue,
      last30DaysRevenue: parsedLast30DaysRevenue,
      activeSubscriptions: parsedActiveSubscriptions,
      founderName,
      foundedYear,
      locationCountry,
      valueProposition,
      problemSolved,
      audience,
      pricingModel,
      teamSize,
      fundingStatus,
      techStack,
      marketingChannels,
      additionalInfo,
      bid: bid || 1,
    });

    const pendingPayload = {
      url: formattedUrl,
      name: entryName,
      email: cleanEmail,
      submitter_email: cleanEmail,
      bid_cents: calculatedBidCents,
      target_rank: targetRank,
      rank: targetRank,
      verification_token: verification_token,
      status: 'pending',
      is_verified: false,
      is_for_sale: true,
      twitter_handle: cleanTwitterHandle,
      claimed_at: new Date().toISOString(),
    };

    try {
      await supabaseAdmin
        .from('leaderboard_entries')
        .upsert(pendingPayload, { onConflict: 'url' });
    } catch (e: any) {
      console.warn('leaderboard_entries upsert exception:', e.message);
    }

    // Send notification email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'DropYourSaaS <hello@dropyoursaas.com>',
          to: [cleanEmail],
          subject: `Your Marketplace Listing is Live at #${targetRank}: ${entryName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Listing Published</title>
              </head>
              <body style="background-color: #f4f4f5; padding: 20px 0; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <div style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px; max-width: 480px; margin: 40px auto;">
                  <img src="https://dropyoursaas.com/logo.png" alt="DropYourSaaS" width="48" height="48" style="display: block; margin: 0 auto 16px auto; width: 48px; height: 48px; object-fit: contain;" />
                  <h2 style="color: #18181b; font-size: 20px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">Your Marketplace Listing is Live!</h2>
                  <p style="color: #52525b; font-size: 14px; line-height: 22px; margin: 0 0 24px 0; text-align: center;">
                    Your SaaS product <strong>${entryName}</strong> has been published to position <strong>#${targetRank}</strong> on the DropYourSaaS directory.
                  </p>
                  <a href="${verifyUrl}" style="display: block; background-color: #1a4bed; color: #ffffff; text-align: center; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 0 auto 24px auto;">
                    Confirm &amp; Manage Listing
                  </a>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailErr) {
        console.warn('Resend email warning:', emailErr);
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
      redirectUrl: `/thank-you?email=${encodeURIComponent(cleanEmail)}`,
      message: `Marketplace listing published live immediately at position #${targetRank}!`,
    });
  } catch (err: any) {
    console.error('Submit route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
