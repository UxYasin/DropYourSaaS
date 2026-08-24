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
    <div className="w-full max-w-5xl mx-auto min-w-0 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-[#08F9C9] text-xs font-mono font-bold">
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
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name, category, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-xs"
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
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer',
              sortBy === 'hot'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-300/50 dark:hover:bg-zinc-800/50'
            )}
          >
            <Flame className="size-3.5 fill-current" />
            <span>Hot</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSortBy('top');
              setPage(1);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer',
              sortBy === 'top'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-300/50 dark:hover:bg-zinc-800/50'
            )}
          >
            <Trophy className="size-3.5" />
            <span>Top Voted</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSortBy('recent');
              setPage(1);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer',
              sortBy === 'recent'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-300/50 dark:hover:bg-zinc-800/50'
            )}
          >
            <Clock className="size-3.5" />
            <span>Recent</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSortBy('rank');
              setPage(1);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer',
              sortBy === 'rank'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-300/50 dark:hover:bg-zinc-800/50'
            )}
          >
            <BarChart2 className="size-3.5" />
            <span>Rank / Bids</span>
          </button>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filteredItems.length}</span> SaaS products
        </div>
      </div>

      {/* 3-Column Directory Grid Layout */}
      <DirectoryGrid listings={filteredItems} isLoading={isLoading} />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-border/80">
          <div className="text-xs font-mono text-muted-foreground">
            Page <span className="text-foreground font-bold">{page}</span> of{' '}
            <span className="text-foreground font-bold">{totalPages}</span>
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
        <main className="flex-1 max-w-[1600px] xl:max-w-[1680px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-start gap-6 lg:gap-8">
            <BentoRails side="left" />
            <Suspense fallback={null}>
              <ExploreDirectoryContent />
            </Suspense>
            <BentoRails side="right" />
          </div>
        </main>
        <Footer />
      </div>
    </MobileLayout>
  );
}
