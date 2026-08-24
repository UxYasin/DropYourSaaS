import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export interface BuySellListingItem {
  id: string;
  rank: number;
  name: string;
  url: string;
  description: string;
  category: string;
  askingPrice: number;
  ttmRevenue: number;
  mrr: number;
  email: string;
  favicon: string;
  time: string;
  clicks: number;
}

export async function GET() {
  const supabaseAdmin = getSupabaseServerClient();
  let liveListings: BuySellListingItem[] = [];

  try {
    const { data: dbData } = await supabaseAdmin
      .from('leaderboard_entries')
      .select('*')
      .or('is_for_sale.eq.true,for_sale.eq.true')
      .order('bid_cents', { ascending: false });

    if (dbData && dbData.length > 0) {
      liveListings = dbData.map((row, idx) => {
        let domain = 'example.com';
        try {
          domain = new URL(row.url).hostname;
        } catch {
          domain = row.url || 'example.com';
        }

        return {
          id: row.id || `db-${idx}`,
          rank: row.rank || idx + 1,
          name: row.name || row.title || domain,
          url: row.url,
          description: row.description || `Verified ${row.category || 'SaaS'} startup listed for sale.`,
          category: row.category || 'SaaS',
          askingPrice: Number(row.asking_price) || 0,
          ttmRevenue: Number(row.ttm_revenue) || 0,
          mrr: Number(row.mrr) || 0,
          email: row.submitter_email || row.email || 'seller@dropyoursaas.com',
          favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
          time: 'Recently listed',
          clicks: row.clicks || 0,
        };
      });
    }
  } catch (err) {
    console.warn('Error fetching Buy/Sell listings from Supabase:', err);
  }

  return NextResponse.json({
    success: true,
    listings: liveListings,
  });
}
