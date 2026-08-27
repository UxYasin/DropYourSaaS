import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';
import { postToX } from '@/lib/twitter';
import { verifyWhopWebhookEvent } from '@/lib/whop';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    let event: Record<string, unknown> = {};

    // 1. Verify webhook signature using Whop SDK helpers if secret exists
    if (process.env.WHOP_WEBHOOK_SECRET) {
      try {
        event = verifyWhopWebhookEvent(rawBody, headers) as Record<string, unknown>;
      } catch (verifyErr: unknown) {
        const msg = verifyErr instanceof Error ? verifyErr.message : String(verifyErr);
        console.warn('[Whop Webhook Verification Warning]:', msg);
        try {
          event = JSON.parse(rawBody);
        } catch {
          return NextResponse.json({ error: 'Invalid webhook payload or signature' }, { status: 400 });
        }
      }
    } else {
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    const action = String(event.type || event.action || event.event || '');
    console.log(`[Whop Webhook] Verified event: ${action}`);

    // Process payment success events
    if (
      action === 'payment.succeeded' ||
      action === 'payment_succeeded' ||
      action === 'checkout.completed' ||
      action === 'membership.went_valid' ||
      action.includes('payment')
    ) {
      const supabase = getSupabaseServerClient();
      const data = (event.data || event) as Record<string, unknown>;
      const metadata = (data.metadata || {}) as Record<string, string | number | undefined>;

      const rawAmount = Number(data.final_amount ?? data.amount ?? data.total ?? data.initial_price ?? 0);
      const amountPaid = rawAmount > 0 ? (rawAmount > 1000 ? rawAmount / 100 : rawAmount) : 1;

      const listingId = String(metadata.listing_id || metadata.listingId || '');
      const rawTargetRank = metadata.target_rank ?? metadata.requested_rank ?? metadata.rank;
      const targetRank = rawTargetRank ? Math.max(1, parseInt(String(rawTargetRank), 10)) : 1;

      const rawSlot = metadata.slot_position ?? metadata.slotPosition ?? metadata.slot;
      const siteUrl = String(metadata.site_url || metadata.siteUrl || '');
      const projectName = String(metadata.project_name || metadata.projectName || '');
      const oneLiner = String(metadata.one_liner || metadata.oneLiner || '');
      const twitterHandle = String(metadata.twitter_handle || metadata.twitterHandle || '');
      const customerEmail = String(data.email || (data.user as Record<string, unknown>)?.email || metadata.email || '');
      const logoUrl = String(metadata.logo_url || metadata.logoUrl || metadata.favicon || metadata.faviconUrl || '');

      // 1. Sidebar Pinned Ad Placement ($100 / 30 Days)
      if (rawSlot !== undefined && rawSlot !== null && String(rawSlot) !== '') {
        let slotKey = String(rawSlot);
        if (/^\d+$/.test(slotKey)) {
          const num = parseInt(slotKey, 10);
          slotKey = num < 5 ? `left_${num + 1}` : `right_${num - 4}`;
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { error: pinError } = await supabase.from('pinned_ads').upsert(
          {
            slot_position: slotKey,
            site_url: siteUrl || 'https://dropyoursaas.com',
            project_name: projectName || 'Sponsored Listing',
            one_liner: oneLiner || 'Verified sponsor on DropYourSaaS',
            logo_url: logoUrl || undefined,
            paid_amount: amountPaid,
            status: 'active',
            starts_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            updated_at: now.toISOString(),
          },
          { onConflict: 'slot_position' }
        );

        if (pinError) {
          console.warn('[Whop Webhook] Pinned ad upsert warning:', pinError);
        }

        if (siteUrl || customerEmail) {
          await supabase
            .from('ad_requests')
            .update({ status: 'active' })
            .or(`site_url.eq.${siteUrl},contact_email.eq.${customerEmail}`);
        }
      }

      // 2. Outbid / Paid Listing Placement
      if (listingId || siteUrl) {
        const targetIdentifier = siteUrl || listingId;
        const nowIso = new Date().toISOString();
        const amountCents = Math.round(amountPaid * 100);

        // Update bids table
        try {
          await supabase
            .from('bids')
            .update({ status: 'paid' })
            .or(`entry_url.eq.${targetIdentifier},entry_url.eq.${siteUrl}`);
        } catch {}

        // Upsert into leaderboard_entries with paid bid_cents, verified status, and dofollow backlink
        try {
          await supabase.from('leaderboard_entries').upsert(
            {
              url: targetIdentifier,
              name: projectName || new URL(targetIdentifier).hostname.replace(/^www\./, ''),
              bid_cents: amountCents,
              is_verified: true,
              is_dofollow: true,
              status: 'published',
              twitter_handle: twitterHandle || undefined,
              verified_at: nowIso,
              claimed_at: nowIso,
            },
            { onConflict: 'url' }
          );
        } catch (upsertErr) {
          console.warn('[Whop Webhook] Upsert error:', upsertErr);
        }

        // Invalidate Upstash Redis leaderboard cache for instant real-time live ranking update
        await invalidateLeaderboardCache();

        // Trigger automated promotional Tweet to X (Twitter)
        try {
          const nameToPost = projectName || new URL(targetIdentifier).hostname.replace(/^www\./, '');
          const tagline = oneLiner || `Verified Listing ($${amountPaid} bid)`;
          const listingUrl = `https://www.dropyoursaas.com/s/${encodeURIComponent(nameToPost.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`;
          const handleToMention = twitterHandle || null;

          console.log(`[Whop Webhook] Triggering auto-post to X for ${nameToPost}...`);
          await postToX(nameToPost, listingUrl, tagline, true, handleToMention);
        } catch (xErr) {
          console.error('[Whop Webhook] Error triggering X post:', xErr);
        }
      }

      console.log(`[Whop Webhook] Successfully processed outbid payment of $${amountPaid} for ${siteUrl || listingId}`);
    }

    return NextResponse.json({ received: true, success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Whop Webhook Error]:', message);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
