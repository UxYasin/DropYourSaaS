import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('creem-signature');
    const secret = process.env.CREEM_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.type === 'checkout.completed') {
      const customerEmail = event.data?.customer?.email;
      const metadata = event.data?.metadata || {};
      const targetUrl = metadata.url || event.data?.custom_fields?.url;

      console.log(`Creem checkout.completed received for ${customerEmail}, URL: ${targetUrl}`);

      if (customerEmail || targetUrl) {
        const supabase = getSupabaseServerClient();

        let query = supabase.from('leaderboard_entries').update({
          is_verified: true,
          status: 'published',
          claimed_at: new Date().toISOString(),
        });

        if (targetUrl) {
          query = query.eq('url', targetUrl);
        } else if (customerEmail) {
          query = query.or(`email.eq.${customerEmail},submitter_email.eq.${customerEmail}`);
        }

        const { error } = await query;
        if (error) {
          console.error('Supabase update error in Creem webhook:', error.message);
        }

        try {
          revalidatePath('/', 'page');
        } catch {}

        await invalidateLeaderboardCache().catch(() => {});
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Creem webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
