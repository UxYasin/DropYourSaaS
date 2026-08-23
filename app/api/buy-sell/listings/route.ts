import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const SEED_BUY_SELL_LISTINGS = [
  {
    id: 'outrank-so',
    rank: 1,
    name: 'Outrank.so',
    url: 'https://outrank.so',
    description: 'AI-driven programmatic SEO & automated blog publisher for SaaS startups.',
    category: 'AI Tool',
    askingPrice: 45000,
    ttmRevenue: 28400,
    mrr: 2950,
    email: 'founders@outrank.so',
    favicon: 'https://www.google.com/s2/favicons?domain=outrank.so&sz=128',
    time: '3 minutes ago',
    clicks: 1420,
  },
  {
    id: 'orynth-dev',
    rank: 2,
    name: 'Orynth.dev',
    url: 'https://orynth.dev',
    description: 'Developer sandbox & synthetic telemetry testing infrastructure.',
    category: 'Developer Tool',
    askingPrice: 68000,
    ttmRevenue: 42000,
    mrr: 4100,
    email: 'contact@orynth.dev',
    favicon: 'https://www.google.com/s2/favicons?domain=orynth.dev&sz=128',
    time: '8 minutes ago',
    clicks: 980,
  },
  {
    id: 'trycomp-ai',
    rank: 3,
    name: 'TryComp.ai',
    url: 'https://trycomp.ai',
    description: 'Automated video competitor analysis & intelligence benchmarking platform.',
    category: 'SaaS',
    askingPrice: 32000,
    ttmRevenue: 19500,
    mrr: 1850,
    email: 'hello@trycomp.ai',
    favicon: 'https://www.google.com/s2/favicons?domain=trycomp.ai&sz=128',
    time: '14 hours ago',
    clicks: 850,
  },
  {
    id: 'lathire-com',
    rank: 4,
    name: 'Lathire.com',
    url: 'https://lathire.com',
    description: 'Niche Tech job board and AI resume matching for Remote Engineers.',
    category: 'Productivity',
    askingPrice: 18500,
    ttmRevenue: 12400,
    mrr: 1200,
    email: 'team@lathire.com',
    favicon: 'https://www.google.com/s2/favicons?domain=lathire.com&sz=128',
    time: '11 hours ago',
    clicks: 640,
  },
  {
    id: 'mytb-ai',
    rank: 5,
    name: 'Mytb.ai',
    url: 'https://mytb.ai',
    description: 'Personal knowledge assistant and bookmark summarizer extension.',
    category: 'Mobile App',
    askingPrice: 24000,
    ttmRevenue: 15800,
    mrr: 1550,
    email: 'support@mytb.ai',
    favicon: 'https://www.google.com/s2/favicons?domain=mytb.ai&sz=128',
    time: '12 hours ago',
    clicks: 530,
  },
  {
    id: 'evomarketing-co',
    rank: 6,
    name: 'EvoMarketing.co',
    url: 'https://evomarketing.co',
    description: 'Automated cold email sequence builder and lead verification API.',
    category: 'Marketing',
    askingPrice: 55000,
    ttmRevenue: 38000,
    mrr: 3400,
    email: 'sales@evomarketing.co',
    favicon: 'https://www.google.com/s2/favicons?domain=evomarketing.co&sz=128',
    time: '12 hours ago',
    clicks: 470,
  },
  {
    id: 'fiber-so',
    rank: 7,
    name: 'Fiber.so',
    url: 'https://fiber.so',
    description: 'Real-time WebSocket monitoring dashboard & alert webhooks.',
    category: 'Developer Tool',
    askingPrice: 15000,
    ttmRevenue: 9800,
    mrr: 920,
    email: 'alex@fiber.so',
    favicon: 'https://www.google.com/s2/favicons?domain=fiber.so&sz=128',
    time: '14 hours ago',
    clicks: 390,
  },
];

export async function GET() {
  const supabaseAdmin = getSupabaseServerClient();
  let liveListings: any[] = [];

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

  // Combine live listings with seed fallbacks if database has fewer items
  const combined = [...liveListings];
  SEED_BUY_SELL_LISTINGS.forEach((seed) => {
    if (!combined.some((item) => item.url === seed.url)) {
      combined.push({
        ...seed,
        rank: combined.length + 1,
      });
    }
  });

  return NextResponse.json({
    success: true,
    listings: combined,
  });
}
