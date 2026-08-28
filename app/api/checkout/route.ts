import { NextResponse } from 'next/server';
import { createWhopRankCheckout } from '@/lib/whop';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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
      category,
      isForSale,
      askingPrice,
      selectedUpsell,
    } = body;

    const rawUrl = siteUrl || url || '';
    if (!rawUrl.trim()) {
      return NextResponse.json({ error: 'A valid website URL or @handle is required' }, { status: 400 });
    }

    const normalizedUrl = /^https?:\/\//i.test(rawUrl.trim())
      ? rawUrl.trim()
      : `https://${rawUrl.trim().replace(/^@/, '')}`;

    let hostname = 'SaaS Product';
    try {
      hostname = new URL(normalizedUrl).hostname.replace(/^www\./, '');
    } catch {
      hostname = normalizedUrl;
    }

    const resolvedName = projectName || title || name || hostname;
    const resolvedDescription = oneLiner || description || valueProposition || '';
    const resolvedRank = Number(targetRank || requestedRank || selectedRank || rank || 1);

    // Starting bid from $1
    let resolvedAmount = Math.max(1, Number(amount || bid || 1));
    if (selectedUpsell === 'sponsor_panel') resolvedAmount = 100;
    else if (selectedUpsell === 'ai_boost') resolvedAmount = 25;
    else if (selectedUpsell === 'dofollow') resolvedAmount = 10;

    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const origin = req.headers.get('origin') || (host ? `${proto}://${host}` : undefined);

    const checkoutResult = await createWhopRankCheckout({
      amount: resolvedAmount,
      targetRank: resolvedRank,
      siteUrl: normalizedUrl,
      projectName: resolvedName,
      oneLiner: resolvedDescription,
      email: email ? String(email).trim() : undefined,
      tier: tier || (selectedUpsell ? `upsell_${selectedUpsell}` : 'outbid'),
      slotPosition,
      twitterHandle: twitterHandle ? String(twitterHandle).trim() : undefined,
      category: category || 'SaaS',
      redirectUrl: origin ? `${origin}/congrats?name=${encodeURIComponent(resolvedName)}&url=${encodeURIComponent(normalizedUrl)}&rank=${resolvedRank}&verified=true` : undefined,
    });

    if (!checkoutResult.success || !checkoutResult.checkoutUrl) {
      return NextResponse.json(
        { error: checkoutResult.error || 'Failed to initialize Whop checkout' },
        { status: 500 }
      );
    }

    // Record pending bid in Supabase bids table for telemetry and fulfillment tracking
    try {
      const supabase = getSupabaseServerClient();
      const amountCents = Math.round(resolvedAmount * 100);
      await supabase.from('bids').insert({
        entry_url: normalizedUrl,
        entry_name: resolvedName,
        amount_cents: amountCents,
        status: 'pending',
      });
    } catch (dbErr) {
      console.warn('[Checkout API] Notice recording bid:', dbErr);
    }

    return NextResponse.json({
      success: true,
      url: checkoutResult.checkoutUrl,
      checkoutUrl: checkoutResult.checkoutUrl,
      sessionId: checkoutResult.sessionId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Checkout API Route Error]:', message);
    return NextResponse.json({ error: message || 'Checkout creation failed' }, { status: 500 });
  }
}
