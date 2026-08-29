'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { RightAdsSidebar } from '@/components/right-ads-sidebar';
import { CategoryFilterBar } from '@/components/category-filter-bar';
import { DirectoryGrid } from '@/components/directory-grid';
import { Search, Sparkles, Flame, Trophy, Clock, BarChart2, ChevronLeft, ChevronRight, Filter, Layers } from 'lucide-react';
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
    <div className="w-full space-y-6">
      {/* Title Header */}
      <div className="text-left space-y-2.5 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
          <Sparkles className="size-3.5" />
          SaaS Directory &amp; Marketplace
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-mono text-foreground">
          Explore All Products
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed max-w-2xl">
          Browse verified SaaS products, startups for sale, and top developer tools ranked by real live traffic and community backing.
        </p>

        {/* Search Input Bar */}
        <div className="relative max-w-xl pt-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name, category, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/80 bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-2xs font-sans"
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
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
        <div className="inline-flex items-center p-1 rounded-full bg-muted/60 border border-border/70 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setSortBy('hot');
              setPage(1);
            }}
            className={cn(
              'px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              sortBy === 'hot'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
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
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Trophy className="size-3.5" />
            Top Voted
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
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock className="size-3.5" />
            Recently Listed
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
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <BarChart2 className="size-3.5" />
            Rank / Bid
          </button>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
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
        <div className="flex items-center justify-between pt-6 border-t border-border/80">
          <div className="text-xs font-mono text-muted-foreground">
            Page <span className="font-bold text-foreground">{page}</span> of{' '}
            <span className="font-bold text-foreground">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="h-8 gap-1 text-xs cursor-pointer rounded-xl font-mono"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="h-8 gap-1 text-xs cursor-pointer rounded-xl font-mono"
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
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-blue-600 selection:text-white">
        <Header />
        <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-5 sm:py-7">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-7 xl:gap-8 w-full">
            {/* Center / Main Content */}
            <div className="flex-1 w-full min-w-0 space-y-4">
              <Suspense fallback={null}>
                <ExploreDirectoryContent />
              </Suspense>
            </div>

            {/* Right Sticky Column: Dedicated Ads Only */}
            <RightAdsSidebar />
          </div>
        </main>
        <Footer />
      </div>
    </MobileLayout>
  );
}
