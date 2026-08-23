import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { SPONSOR_TIERS, getActiveSponsorTier } from '@/lib/sponsor-tiers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseServerClient();
  let slotsFilled = 0;

  try {
    const { count, error } = await supabaseAdmin
      .from('leaderboard_entries')
      .select('*', { count: 'exact', head: true })
      .or('selected_upsell.eq.sponsor_panel,status.eq.published_sponsor');

    if (!error && count !== null) {
      slotsFilled = count;
    }
  } catch (err) {
    console.warn('Sponsor slots count query warning:', err);
  }

  // Detect country code from Vercel header or standard CDN headers
  const detectedCountry =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    undefined;

  const activeTier = getActiveSponsorTier(slotsFilled);

  return NextResponse.json({
    success: true,
    slotsFilled,
    detectedCountry,
    activeTier,
    allTiers: SPONSOR_TIERS,
  });
}
