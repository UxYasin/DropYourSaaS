'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { AddStartupModal } from '@/components/AddStartupModal';
import { BentoRails } from '@/components/bento-rails';
import { Search, Plus, ExternalLink, Mail, Sparkles, Filter, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';

export interface BuySellListing {
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

const MOCK_BUY_SELL_LISTINGS: BuySellListing[] = [
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

const CATEGORY_FILTERS = ['All', ...CATEGORIES];

function formatMoney(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export default function BuySellPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listings, setListings] = useState<BuySellListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchListings = async () => {
      try {
        const res = await fetch('/api/buy-sell/listings');
        if (res.ok) {
          const data = await res.json();
          if (active && data?.listings) {
            setListings(data.listings);
          }
        }
      } catch (err) {
        console.warn('Error fetching live marketplace listings:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchListings();
    return () => {
      active = false;
    };
  }, []);

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-200">
        <Header />

        <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-8">
          <div className="flex justify-center items-start gap-8">
            <BentoRails side="left" />

            <div className="max-w-4xl w-full mx-auto min-w-0 space-y-10">
              {/* Header Section */}
              <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-[#08F9C9] text-xs font-mono font-bold">
                  <Sparkles className="size-3.5" />
                  Verified SaaS Marketplace
                </div>

                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight font-sans">
                  The database of Startups, SaaS or any business
                </h1>

                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                  Acquire verified, revenue-generating micro-SaaS products, tools, and apps directly from founders with zero broker fees.
                </p>

                {/* Action Bar & Modal Trigger */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="h-11 px-7 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="size-4" />
                    Add Your Startup for Sale
                  </button>
                </div>

                {/* Search Bar & Category Filter Pills */}
                <div className="pt-6 space-y-4">
                  <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search startups by name, description, or tech stack..."
                      className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {CATEGORY_FILTERS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
                          selectedCategory === cat
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* High-Density Central Data Table */}
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <th className="py-4 px-4 sm:px-6 w-16 text-center">Rank</th>
                        <th className="py-4 px-4 sm:px-6">Product</th>
                        <th className="py-4 px-4 sm:px-6">Category</th>
                        <th className="py-4 px-4 sm:px-6">Financials</th>
                        <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-sm">
                      {filteredListings.length > 0 ? (
                        filteredListings.map((item) => (
                          <tr
                            key={item.id}
                            className="group hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors"
                          >
                            {/* Rank */}
                            <td className="py-4 px-4 sm:px-6 font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 text-center">
                              #{item.rank}
                            </td>

                            {/* Product */}
                            <td className="py-4 px-4 sm:px-6 min-w-[240px]">
                              <Link href={`/buy-sell/${item.id}`} className="flex items-start gap-3 group/link">
                                <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center mt-0.5">
                                  <Image
                                    src={item.favicon}
                                    alt={item.name}
                                    width={32}
                                    height={32}
                                    className="size-full object-contain rounded-lg"
                                    unoptimized
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-zinc-900 dark:text-white group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors inline-flex items-center gap-1.5">
                                    <span>{item.name}</span>
                                    <ExternalLink className="size-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                  </div>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5 font-sans">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4 sm:px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800">
                                {item.category}
                              </span>
                            </td>

                            {/* Financials */}
                            <td className="py-4 px-4 sm:px-6">
                              <div className="space-y-1 font-mono text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-zinc-400 uppercase">Asking:</span>
                                  <span className="font-bold text-blue-600 dark:text-[#08F9C9]">
                                    {formatMoney(item.askingPrice)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                                  <span>MRR: <strong className="text-zinc-900 dark:text-white">{formatMoney(item.mrr)}</strong></span>
                                  <span>TTM: <strong className="text-zinc-900 dark:text-white">{formatMoney(item.ttmRevenue)}</strong></span>
                                </div>
                              </div>
                            </td>

                            {/* Action */}
                            <td className="py-4 px-4 sm:px-6 text-right">
                              <a
                                href={`mailto:${item.email}?subject=Inquiry%20regarding%20${encodeURIComponent(item.name)}%20acquisition`}
                                className="inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all shrink-0 gap-1.5"
                              >
                                <Mail className="size-3.5" />
                                Contact Seller
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <div className="space-y-3 max-w-sm mx-auto">
                              <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                                <Sparkles className="size-5 text-amber-500" />
                              </div>
                              <div className="font-bold text-sm text-zinc-900 dark:text-white">
                                No startups currently listed for sale
                              </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                Be the first founder to list your SaaS for sale on the marketplace feed!
                              </p>
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => setIsModalOpen(true)}
                                  className="h-9 px-5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="size-3.5" />
                                  List Your SaaS for Sale
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <BentoRails side="right" />
          </div>
        </main>

        <Footer />
      </div>

      {/* Submission Modal */}
      <AddStartupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </MobileLayout>
  );
}
