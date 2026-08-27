import { NextResponse } from 'next/server';
import { createWhopRankCheckout } from '@/lib/whop';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      amount,
      targetRank,
      requestedRank,
      selectedRank,
      rank,
      listingId,
      siteUrl,
      projectName,
      title,
      name,
      oneLiner,
      description,
      email,
      tier,
      slotPosition,
      twitterHandle,
      twitter_handle,
      logoUrl,
      iconUrl,
      category,
      redirectUrl,
    } = body;

    const resolvedRank = Number(targetRank || requestedRank || selectedRank || rank || 1);
    const resolvedAmount = Number(amount || 5);
    const resolvedName = projectName || title || name || siteUrl || 'SaaS Product';
    const resolvedDescription = oneLiner || description || '';
    const resolvedTwitter = twitterHandle || twitter_handle || '';
    const resolvedLogo = logoUrl || iconUrl || '';

    const checkoutResult = await createWhopRankCheckout({
      amount: resolvedAmount,
      targetRank: resolvedRank,
      listingId: listingId ? String(listingId) : undefined,
      siteUrl: String(siteUrl || ''),
      projectName: resolvedName,
      oneLiner: resolvedDescription,
      email: email ? String(email) : undefined,
      tier: tier ? String(tier) : (resolvedAmount === 5 ? 'fast_track' : 'paid_rank'),
      slotPosition: slotPosition ? String(slotPosition) : undefined,
      twitterHandle: resolvedTwitter,
      logoUrl: resolvedLogo,
      category: category ? String(category) : 'SaaS',
      redirectUrl: redirectUrl ? String(redirectUrl) : undefined,
    });

    return NextResponse.json({
      success: true,
      url: checkoutResult.checkoutUrl,
      checkoutUrl: checkoutResult.checkoutUrl,
      sessionId: checkoutResult.sessionId,
      planId: checkoutResult.planId,
    });
  } catch (error: any) {
    console.error('[Whop Checkout Route Error]:', error);
    const defaultUrl = process.env.NEXT_PUBLIC_WHOP_BOOST_CHECKOUT_URL || 'https://whop.com/dropyoursaas/verified-saas-listing';
    return NextResponse.json(
      {
        success: true,
        url: defaultUrl,
        checkoutUrl: defaultUrl,
        error: error?.message,
      },
      { status: 200 }
    );
  }
}
