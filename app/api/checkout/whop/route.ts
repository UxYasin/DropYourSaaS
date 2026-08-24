import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, email, listingId, siteUrl, slotPosition, projectName, oneLiner, tier } = body;

    const apiKey = process.env.WHOP_API_KEY;
    const isBoost = tier === 'verified_boost' || tier === 'fast_track' || Number(amount) === 5;

    // Use the $5 Boost credentials if applicable, otherwise default to the $100 Pin Ads
    const planId = isBoost
      ? (process.env.WHOP_BOOST_PRODUCT_ID || 'prod_R7AeUNO24nGGB')
      : (process.env.WHOP_PLAN_ID || process.env.WHOP_PRODUCT_ID || 'prod_zHQk66cmlC1qX');

    const baseUrl = isBoost
      ? (process.env.NEXT_PUBLIC_WHOP_BOOST_CHECKOUT_URL || 'https://whop.com/dropyoursaas/verified-saas-listing')
      : (process.env.NEXT_PUBLIC_WHOP_CHECKOUT_URL || 'https://whop.com/dropyoursaas/listing-pay');

    const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dropyoursaas.com';

    // 1. Attempt to generate a dynamic checkout session via Whop v5 API if API Key is set
    if (apiKey) {
      try {
        const response = await fetch('https://api.whop.com/api/v5/checkouts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: planId,
            email: email ? String(email).trim() : undefined,
            amount: amount ? Math.round(Number(amount) * 100) : (isBoost ? 500 : undefined),
            metadata: {
              listing_id: listingId ? String(listingId) : '',
              site_url: siteUrl ? String(siteUrl) : '',
              slot_position: slotPosition !== undefined && slotPosition !== null ? String(slotPosition) : '',
              project_name: projectName ? String(projectName) : '',
              one_liner: oneLiner ? String(oneLiner) : '',
              tier: isBoost ? 'fast_track' : 'pinned_ad',
            },
            redirect_url: `${siteBaseUrl}/?verified=true`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const targetUrl = data?.url || data?.checkout_url;
          if (targetUrl) {
            return NextResponse.json({
              success: true,
              url: targetUrl,
              checkoutUrl: targetUrl,
            });
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Whop v5 API checkout generation returned non-OK status:', errorData);
        }
      } catch (apiErr) {
        console.warn('Direct Whop API checkout generation fallback triggered:', apiErr);
      }
    }

    // 2. Fallback: Construct parameterized checkout URL from dynamically selected Whop Checkout Link
    try {
      const fallbackUrl = new URL(baseUrl);
      if (email) fallbackUrl.searchParams.set('email', String(email).trim());
      if (amount) fallbackUrl.searchParams.set('amount', String(amount));
      if (slotPosition) fallbackUrl.searchParams.set('slot', String(slotPosition));
      if (listingId) fallbackUrl.searchParams.set('listing_id', String(listingId));

      const fallbackStr = fallbackUrl.toString();
      return NextResponse.json({
        success: true,
        url: fallbackStr,
        checkoutUrl: fallbackStr,
      });
    } catch {
      return NextResponse.json({
        success: true,
        url: baseUrl,
        checkoutUrl: baseUrl,
      });
    }
  } catch (error) {
    console.error('Whop checkout route error:', error);
    const defaultUrl = process.env.NEXT_PUBLIC_WHOP_BOOST_CHECKOUT_URL || 'https://whop.com/dropyoursaas/verified-saas-listing';
    return NextResponse.json(
      { success: true, url: defaultUrl, checkoutUrl: defaultUrl },
      { status: 200 }
    );
  }
}
