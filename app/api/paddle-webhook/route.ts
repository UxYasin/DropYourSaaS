import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

/**
 * Pure Node.js crypto signature verification for Paddle v2 webhooks.
 * Header format: ts=1690000000;h1=hash_hex
 */
function verifyPaddleSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  if (!signatureHeader || !secret) return false;

  try {
    const parts = signatureHeader.split(';').reduce((acc: Record<string, string>, item) => {
      const [key, value] = item.split('=');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {});

    const ts = parts['ts'];
    const h1 = parts['h1'];

    if (!ts || !h1) return false;

    const payload = `${ts}:${rawBody}`;
    const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expectedHmac, 'utf-8'), Buffer.from(h1, 'utf-8'));
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature') || '';
  const rawBody = await request.text();
  const secret =
    process.env.PADDLE_WEBHOOK_SECRET ||
    process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET ||
    '';

  // 1. Pre-validation
  if (!signature || !rawBody) {
    return NextResponse.json({ error: 'Missing signature or body' }, { status: 400 });
  }

  // 2. Signature Verification (In production/sandbox if secret is set)
  if (secret) {
    const isValid = verifyPaddleSignature(rawBody, signature, secret);
    if (!isValid) {
      console.warn('⚠️ Paddle webhook signature mismatch or invalid header.');
      // Return 401 on invalid signature so Paddle retries if secret rotated
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 401 });
    }
  }

  let eventData: any = null;
  try {
    eventData = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const eventType = eventData.eventType || eventData.event_type;
  console.log(`🔔 Received verified Paddle webhook: ${eventType} (Event ID: ${eventData.eventId || eventData.event_id})`);

  // 3. Route Events — Safely ignore non-transaction events
  if (eventType !== 'transaction.completed') {
    return NextResponse.json({ received: true, status: 'ignored_event_type' }, { status: 200 });
  }

  // 4. Extract Transaction Details & customData
  const transaction = eventData.data;
  const transactionId = transaction?.id;
  const customData = transaction?.customData || transaction?.custom_data || {};

  if (!transactionId) {
    return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseServerClient();

  // 5. Idempotency Check (Check if paddle_transaction_id exists)
  try {
    const { data: existingEntry } = await supabaseAdmin
      .from('leaderboard_entries')
      .select('id')
      .eq('paddle_transaction_id', transactionId)
      .maybeSingle();

    if (existingEntry?.id) {
      console.log(`ℹ️ Transaction ${transactionId} already processed.`);
      return NextResponse.json({ success: true, message: 'Already processed' }, { status: 200 });
    }
  } catch (dbCheckErr) {
    console.warn('Idempotency query check warning:', dbCheckErr);
  }

  // 6. Fulfillment & Provisioning (Insert/Upsert into Supabase)
  const productUrl = customData.url || customData.productUrl;
  if (!productUrl) {
    console.warn('⚠️ Webhook transaction missing product URL in customData:', customData);
    return NextResponse.json({ success: true, message: 'Received but missing URL in customData' }, { status: 200 });
  }

  const entryName = customData.name || customData.title || new URL(productUrl).hostname;
  const submitterEmail = customData.email || transaction?.customer?.email || 'sponsor@dropyoursaas.com';

  const recordPayload: Record<string, any> = {
    url: productUrl,
    name: entryName,
    email: submitterEmail,
    submitter_email: submitterEmail,
    category: customData.marketCategory || customData.category || 'SaaS',
    status: 'published',
    is_verified: true,
    for_sale: Boolean(customData.isForSale),
    is_for_sale: Boolean(customData.isForSale),
    asking_price: Number(customData.askingPrice) || 0,
    mrr: Number(customData.mrr) || 0,
    ttm_revenue: Number(customData.ttmRevenue) || 0,
    last_30_days_revenue: Number(customData.last30DaysRevenue) || 0,
    active_subscriptions: Number(customData.activeSubscriptions) || 0,
    founder_name: customData.founderName || null,
    founded_year: customData.foundedYear || null,
    location_country: customData.locationCountry || null,
    value_proposition: customData.valueProposition || null,
    problem_solved: customData.problemSolved || null,
    audience: customData.audience || null,
    pricing_model: customData.pricingModel || null,
    team_size: customData.teamSize || null,
    funding_status: customData.fundingStatus || null,
    tech_stack: customData.techStack || null,
    marketing_channels: customData.marketingChannels || null,
    additional_info: customData.additionalInfo || null,
    selected_upsell: 'sponsor_panel',
    paddle_transaction_id: transactionId,
    bid_cents: 1,
    claimed_at: new Date().toISOString(),
  };

  try {
    let { error: upsertErr } = await supabaseAdmin
      .from('leaderboard_entries')
      .upsert(recordPayload, { onConflict: 'url' });

    if (upsertErr) {
      console.warn('Upsert extended bento fields notice, trying core fields:', upsertErr.message);
      const corePayload = {
        url: productUrl,
        name: entryName,
        email: submitterEmail,
        submitter_email: submitterEmail,
        status: 'published',
        is_verified: true,
        bid_cents: 1,
        selected_upsell: 'sponsor_panel',
        paddle_transaction_id: transactionId,
        claimed_at: new Date().toISOString(),
      };
      await supabaseAdmin
        .from('leaderboard_entries')
        .upsert(corePayload, { onConflict: 'url' });
    }

    try {
      revalidatePath('/', 'page');
      revalidatePath('/buy-sell', 'page');
    } catch {}

    await invalidateLeaderboardCache().catch(() => {});

    console.log(`✅ Successfully fulfilled side-panel sponsor spot for ${productUrl} (Tx: ${transactionId})`);
    return NextResponse.json({ success: true, transactionId });
  } catch (err: any) {
    console.error('❌ Error fulfilling transaction in Supabase:', err);
    return NextResponse.json({ error: 'Database provisioning failed' }, { status: 500 });
  }
}
