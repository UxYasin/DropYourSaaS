'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { AddStartupModal } from '@/components/AddStartupModal';
import { BentoRails } from '@/components/bento-rails';
import { Search, Plus, Sparkles } from 'lucide-react';
import { CategoryFilterBar } from '@/components/category-filter-bar';
import { DirectoryGrid } from '@/components/directory-grid';
import type { LeaderboardItem } from '@/lib/leaderboard-data';

const MOCK_BUY_SELL_LISTINGS: LeaderboardItem[] = [
  {
    id: 'outrank-so',
    rank: 1,
    name: 'Outrank.so',
    url: 'https://outrank.so',
    description: 'AI-driven programmatic SEO & automated blog publisher for SaaS startups.',
    category: 'AI Tool',
    is_for_sale: true,
    asking_price: 45000,
    is_verified: true,
    bid: 120,
    clicks: 1420,
    time: '3 minutes ago',
  },
  {
    id: 'orynth-dev',
    rank: 2,
    name: 'Orynth.dev',
    url: 'https://orynth.dev',
    description: 'Developer sandbox & synthetic telemetry testing infrastructure.',
    category: 'Developer Tool',
    is_for_sale: true,
    asking_price: 68000,
    is_verified: false,
    bid: 110,
    clicks: 980,
    time: '8 minutes ago',
  },
  {
    id: 'trycomp-ai',
    rank: 3,
    name: 'TryComp.ai',
    url: 'https://trycomp.ai',
    description: 'Automated video competitor analysis & intelligence benchmarking platform.',
    category: 'SaaS',
    is_for_sale: true,
    asking_price: 32000,
    is_verified: true,
    bid: 100,
    clicks: 850,
    time: '14 hours ago',
  },
  {
    id: 'lathire-com',
    rank: 4,
    name: 'Lathire.com',
    url: 'https://lathire.com',
    description: 'Niche Tech job board and AI resume matching for Remote Engineers.',
    category: 'Productivity',
    is_for_sale: true,
    asking_price: 18500,
    is_verified: false,
    bid: 90,
    clicks: 640,
    time: '11 hours ago',
  },
  {
    id: 'mytb-ai',
    rank: 5,
    name: 'Mytb.ai',
    url: 'https://mytb.ai',
    description: 'Personal knowledge assistant and bookmark summarizer extension.',
    category: 'Mobile App',
    is_for_sale: true,
    asking_price: 24000,
    is_verified: false,
    bid: 85,
    clicks: 530,
    time: '12 hours ago',
  },
  {
    id: 'evomarketing-co',
    rank: 6,
    name: 'EvoMarketing.co',
    url: 'https://evomarketing.co',
    description: 'Automated cold email sequence builder and lead verification API.',
    category: 'Marketing',
    is_for_sale: true,
    asking_price: 55000,
    is_verified: false,
    bid: 80,
    clicks: 470,
    time: '12 hours ago',
  },
];

export default function BuySellPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listings, setListings] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchListings = async () => {
      try {
        const res = await fetch('/api/buy-sell/listings');
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data?.listings) && data.listings.length > 0) {
            const mapped: LeaderboardItem[] = data.listings.map((item: any, idx: number) => ({
              id: item.id || String(idx),
              rank: item.rank || idx + 1,
              name: item.name || 'SaaS Product',
              url: item.url || '',
              description: item.description || '',
              category: item.category || 'SaaS',
              is_for_sale: true,
              asking_price: item.askingPrice || item.asking_price || 0,
              is_verified: Boolean(item.is_verified),
              bid: item.bid || 0,
              clicks: item.clicks || 0,
              time: item.time || 'Recently',
            }));
            setListings(mapped);
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

  const displayListings = listings.length > 0 ? listings : (isLoading ? [] : MOCK_BUY_SELL_LISTINGS);

  const filteredListings = displayListings.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || (item.category || '').toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        <Header />

        <main className="flex-1 max-w-[1600px] xl:max-w-[1680px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-start gap-6 lg:gap-8">
            <BentoRails side="left" />

            <div className="w-full max-w-4xl xl:max-w-5xl mx-auto min-w-0 space-y-8">
              {/* Header Section */}
              <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-[#08F9C9] text-xs font-mono font-bold">
                  <Sparkles className="size-3.5" />
                  Verified SaaS Marketplace
                </div>

                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight font-mono">
                  SaaS Startups For Sale
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
                <div className="pt-4 space-y-4">
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search startups by name or keyword..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-xs"
                    />
                  </div>

                  <CategoryFilterBar
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => setSelectedCategory(cat.queryValue)}
                  />
                </div>
              </div>

              {/* 3-Column Responsive Grid Layout */}
              <DirectoryGrid listings={filteredListings} isLoading={isLoading} />
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
