import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { invalidateLeaderboardCache } from '@/lib/leaderboard';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let body: Record<string, unknown> = {};
    
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const action = String(body.action || body.type || body.event || '');
    console.log(`[Whop Webhook] Received event: ${action}`);

    // Process payment success events
    if (
      action === 'payment.succeeded' ||
      action === 'payment_succeeded' ||
      action === 'checkout.completed' ||
      action === 'membership.went_valid' ||
      action.includes('payment')
    ) {
      const supabase = getSupabaseServerClient();
      const data = (body.data || body) as Record<string, unknown>;
      const metadata = (data.metadata || {}) as Record<string, string | number | undefined>;
      
      const rawAmount = Number(data.final_amount ?? data.amount ?? data.total ?? 0);
      const amountPaid = rawAmount > 0 ? (rawAmount > 1000 ? rawAmount / 100 : rawAmount) : 100;

      const listingId = String(metadata.listing_id || metadata.listingId || '');
      const rawSlot = metadata.slot_position ?? metadata.slotPosition ?? metadata.slot;
      const siteUrl = String(metadata.site_url || metadata.siteUrl || '');
      const projectName = String(metadata.project_name || metadata.projectName || '');
      const oneLiner = String(metadata.one_liner || metadata.oneLiner || '');
      const customerEmail = String(data.email || (data.user as Record<string, unknown>)?.email || '');
      const logoUrl = String(metadata.logo_url || metadata.logoUrl || metadata.favicon || metadata.faviconUrl || '');

      // 1. Sidebar Pinned Ad Placement
      if (rawSlot !== undefined && rawSlot !== null && String(rawSlot) !== '') {
        let slotKey = String(rawSlot);
        // Normalize numeric slot (0-9) to left_1..left_5, right_1..right_5 if necessary
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

        // Also mark matching ad_request as active if present
        if (siteUrl || customerEmail) {
          await supabase
            .from('ad_requests')
            .update({ status: 'active' })
            .or(`site_url.eq.${siteUrl},contact_email.eq.${customerEmail}`);
        }
      }

      // 2. Listing Verification / Outbid / Fast-Track Boost
      if (listingId || siteUrl) {
        const targetIdentifier = listingId || siteUrl;
        const nowIso = new Date().toISOString();
        const amountCents = Math.round(amountPaid * 100);

        // Try RPC for bidding boost if applicable
        try {
          await supabase.rpc('increment_listing_bid', {
            p_listing_id: targetIdentifier,
            p_amount: amountPaid,
          });
        } catch (rpcErr) {
          console.warn('[Whop Webhook] RPC notice:', rpcErr);
        }

        // Direct update for is_verified, is_dofollow, status, and verified_at
        try {
          await supabase
            .from('leaderboard_entries')
            .update({
              is_verified: true,
              is_dofollow: true,
              status: 'published',
              verified_at: nowIso,
              bid_cents: amountCents > 100 ? amountCents : undefined,
              claimed_at: nowIso,
            })
            .or(`id.eq.${targetIdentifier},url.ilike.%${targetIdentifier}%`);
        } catch (updateErr) {
          console.warn('[Whop Webhook] Leaderboard update notice:', updateErr);
        }

        // Also update listings table if present
        try {
          await supabase
            .from('listings')
            .update({
              is_verified: true,
              is_dofollow: true,
              status: 'published',
              verified_at: nowIso,
            })
            .or(`id.eq.${targetIdentifier},url.ilike.%${targetIdentifier}%`);
        } catch {}

        // Invalidate leaderboard cache for instant real-time ranking & verified badge update
        await invalidateLeaderboardCache();
      }

      console.log(`[Whop Webhook] Successfully processed payment of $${amountPaid}`);
    }

    return NextResponse.json({ received: true, success: true }, { status: 200 });
  } catch (error) {
    console.error('[Whop Webhook Error]:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
