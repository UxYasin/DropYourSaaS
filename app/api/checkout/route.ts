import { NextResponse } from 'next/server';
import { createWhopRankCheckout } from '@/lib/whop';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      url,
      siteUrl,
      title,
      name,
      projectName,
      valueProposition,
      description,
      oneLiner,
      email,
      targetRank,
      requestedRank,
      selectedRank,
      rank,
      bid,
      amount,
      tier,
      slotPosition,
      twitterHandle,
      selectedUpsell,
    } = body;

    const resolvedUrl = siteUrl || url || '';
    const resolvedName = projectName || title || name || resolvedUrl;
    const resolvedDescription = oneLiner || description || valueProposition || '';
    const resolvedRank = Number(targetRank || requestedRank || selectedRank || rank || 1);

    let resolvedAmount = Number(amount || bid || 5);
    if (selectedUpsell === 'sponsor_panel') resolvedAmount = 100;
    else if (selectedUpsell === 'ai_boost') resolvedAmount = 25;
    else if (selectedUpsell === 'dofollow') resolvedAmount = 10;

    const checkoutResult = await createWhopRankCheckout({
      amount: resolvedAmount,
      targetRank: resolvedRank,
      siteUrl: resolvedUrl,
      projectName: resolvedName,
      oneLiner: resolvedDescription,
      email,
      tier: tier || (selectedUpsell ? `upsell_${selectedUpsell}` : 'paid_rank'),
      slotPosition,
      twitterHandle,
    });

    return NextResponse.json({
      success: true,
      url: checkoutResult.checkoutUrl,
      checkoutUrl: checkoutResult.checkoutUrl,
      sessionId: checkoutResult.sessionId,
    });
  } catch (error: any) {
    console.error('[Checkout API Route Error]:', error);
    return NextResponse.json({ error: error?.message || 'Checkout creation failed' }, { status: 500 });
  }
}
