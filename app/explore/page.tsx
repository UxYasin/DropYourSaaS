'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { BentoRails } from '@/components/bento-rails';
import { CategoryFilterBar } from '@/components/category-filter-bar';
import { DirectoryGrid } from '@/components/directory-grid';
import { Search, Sparkles, Flame, Trophy, Clock, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { leaderboardItems as seedLeaderboardItems, type LeaderboardItem } from '@/lib/leaderboard-data';

function ExploreDirectoryContent() {
  const searchParams = useSearchParams();
  const isVerified = searchParams?.get('verified') === 'true';

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LeaderboardItem[]>(seedLeaderboardItems);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'rank' | 'hot' | 'top' | 'recent'>('rank');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(seedLeaderboardItems.length);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const catParam = selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
    fetch(`/api/leaderboard?page=${page}&limit=24&sortBy=${sortBy}${catParam}&t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && Array.isArray(data.items)) {
          setItems(data.items);
          if (Array.isArray(data.activeCategories)) {
            setActiveCategories(data.activeCategories);
          }
          if (typeof data.totalCount === 'number') setTotalCount(data.totalCount);
          if (typeof data.totalPages === 'number') setTotalPages(data.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, selectedCategory, sortBy, isVerified]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(query);
    const descMatch = (item.description || '').toLowerCase().includes(query);
    const catMatch = (item.category || '').toLowerCase().includes(query);
    return nameMatch || descMatch || catMatch;
  });

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fe4103]/10 border border-[#fe4103]/20 text-[#fe4103] text-xs font-mono font-bold">
          <Sparkles className="size-3.5" />
          SaaS Directory &amp; Marketplace
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-zinc-900 dark:text-white">
          Explore Directory
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-body leading-relaxed">
          Browse verified SaaS products, startups for sale, and top developer tools.
        </p>

        {/* Search Input Bar */}
        <div className="relative max-w-md mx-auto pt-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name, category, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#fe4103]/40 shadow-sm"
          />
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="py-1">
        <CategoryFilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat.queryValue);
            setPage(1);
          }}
          activeCategories={activeCategories}
        />
      </div>

      {/* Sorting Tabs & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
        <div className="inline-flex items-center p-1 rounded-full bg-zinc-200/80 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setSortBy('hot');
              setPage(1);
            }}
            className={cn(
              'px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              sortBy === 'hot'
                ? 'bg-[#fe4103] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Flame className="size-3.5" />
            Hot
          </button>
          <button
            type="button"
            onClick={() => {
              setSortBy('top');
              setPage(1);
            }}
            className={cn(
              'px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              sortBy === 'top'
                ? 'bg-[#fe4103] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Trophy className="size-3.5" />
            Top
          </button>
          <button
            type="button"
            onClick={() => {
              setSortBy('recent');
              setPage(1);
            }}
            className={cn(
              'px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              sortBy === 'recent'
                ? 'bg-[#fe4103] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <Clock className="size-3.5" />
            Recent
          </button>
          <button
            type="button"
            onClick={() => {
              setSortBy('rank');
              setPage(1);
            }}
            className={cn(
              'px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              sortBy === 'rank'
                ? 'bg-[#fe4103] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            )}
          >
            <BarChart2 className="size-3.5" />
            Rank / Bid
          </button>
        </div>

        <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-bold text-foreground">{filteredItems.length}</span> of{' '}
          <span className="font-bold text-foreground">{totalCount}</span> products
        </div>
      </div>

      {/* Grid of Directory Cards */}
      <DirectoryGrid
        listings={filteredItems}
        isLoading={isLoading}
      />

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Page <span className="font-bold text-foreground">{page}</span> of{' '}
            <span className="font-bold text-foreground">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="h-8 gap-1 text-xs cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="h-8 gap-1 text-xs cursor-pointer"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 w-full px-3 sm:px-5 md:px-6 lg:px-6 xl:px-8 2xl:px-10 py-5 sm:py-8">
          <div className="flex justify-between items-start gap-4 lg:gap-6 xl:gap-8 w-full">
            <BentoRails side="left" />
            <div className="w-full max-w-3xl xl:max-w-4xl 2xl:max-w-[880px] mx-auto min-w-0">
              <Suspense fallback={null}>
                <ExploreDirectoryContent />
              </Suspense>
            </div>
            <BentoRails side="right" />
          </div>
        </main>
        <Footer />
      </div>
    </MobileLayout>
  );
}
