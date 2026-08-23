import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Polar webhook secret not configured' }, { status: 400 });
  }

  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    if (payload.type === 'order.created' || payload.type === 'order.paid') {
      const order = payload.data;
      const metadata = order?.metadata || {};

      if (metadata.url && metadata.amountCents) {
        const supabase = getSupabaseServerClient();
        const amountCents = Number(metadata.amountCents);

        await supabase
          .from('bids')
          .update({ status: 'paid' })
          .eq('polar_checkout_id', order.checkout_id || order.checkoutId || '');

        await supabase.from('leaderboard_entries').upsert(
          {
            url: metadata.url,
            name: metadata.name || new URL(metadata.url).hostname,
            bid_cents: amountCents,
            claimed_at: new Date().toISOString(),
          },
          { onConflict: 'url' }
        );

        await invalidateLeaderboardCache().catch(() => {});
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Polar webhook processing notice:', err?.message || err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
