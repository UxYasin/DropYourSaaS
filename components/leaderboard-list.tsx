'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DirectoryCard } from '@/components/directory-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Tag, Flame, Trophy, Clock, BarChart2, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  leaderboardItems as seedLeaderboardItems,
  type LeaderboardItem,
} from '@/lib/leaderboard-data';

interface DirectoryListProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onClaimClick?: (rank: number, bid: number) => void;
}

function DirectoryRowSkeleton() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Skeleton className="size-6 rounded-md shrink-0" />
          <Skeleton className="size-10 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function LeaderboardList({
  selectedCategory: propCategory,
  onSelectCategory,
  onClaimClick,
}: DirectoryListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LeaderboardItem[]>(seedLeaderboardItems);
  const [internalCategory, setInternalCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'rank' | 'hot' | 'top' | 'recent'>('rank');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(seedLeaderboardItems.length);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const searchParams = useSearchParams();
  const isVerified = searchParams?.get('verified') === 'true';

  const selectedCategory = propCategory !== undefined ? propCategory : internalCategory;

  // Live Launch Countdown Timer (LaunchIt style)
  const [countdown, setCountdown] = useState({ hours: 1, minutes: 14, seconds: 38 });
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const countdownString = `${String(countdown.hours).padStart(2, '0')}h ${String(countdown.minutes).padStart(2, '0')}m ${String(countdown.seconds).padStart(2, '0')}s`;

  useEffect(() => {
    const handleListingSubmitted = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener('listing-submitted', handleListingSubmitted);
    return () => {
      window.removeEventListener('listing-submitted', handleListingSubmitted);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const catParam = selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
    fetch(`/api/leaderboard?page=${page}&limit=50&sortBy=${sortBy}${catParam}&t=${Date.now()}`)
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
  }, [page, selectedCategory, sortBy, isVerified, refreshTrigger]);

  const handleClaimClick = (rank: number, bid: number) => {
    if (onClaimClick) {
      onClaimClick(rank, bid);
    }
  };

  const [quickFilter, setQuickFilter] = useState<'all' | 'top5' | 'under10' | 'for_sale'>('all');

  const filteredItems = items.filter((item) => {
    if (quickFilter === 'top5') return item.rank <= 5;
    if (quickFilter === 'under10') return (item.bid || 0) <= 10;
    if (quickFilter === 'for_sale') return Boolean(item.is_for_sale);
    return true;
  });

  const displayList = filteredItems;
  const isFirstPage = page === 1 && selectedCategory === 'All' && quickFilter === 'all';
  const item1 = isFirstPage ? displayList[0] : null;
  const remainingItems = isFirstPage ? displayList.slice(1) : displayList;

  return (
    <div id="directory" className="space-y-4">
      {/* 1. LaunchIt Live Directory Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-muted-foreground">
            LIVE DIRECTORY
          </span>
          <h2 className="font-mono font-black text-xl sm:text-2xl text-foreground">
            {selectedCategory === 'All' ? 'Just launched' : selectedCategory}
          </h2>
        </div>

        {/* Live Countdown Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold self-start sm:self-auto shadow-2xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Next launch in {countdownString}</span>
        </div>
      </div>

      {/* 2. Quick Filter Pills */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="flex items-center gap-1 p-1 rounded-full bg-muted/60 dark:bg-[#161822] border border-border/80 text-xs font-mono">
          <button
            type="button"
            onClick={() => setQuickFilter('all')}
            className={cn(
              'px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer',
              quickFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            All Launches
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('top5')}
            className={cn(
              'px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer',
              quickFilter === 'top5'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Top 5
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('under10')}
            className={cn(
              'px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer',
              quickFilter === 'under10'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Under $10
          </button>
          <button
            type="button"
            onClick={() => setQuickFilter('for_sale')}
            className={cn(
              'px-3.5 py-1 rounded-full font-bold transition-all cursor-pointer',
              quickFilter === 'for_sale'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            For Sale
          </button>
        </div>

        <span className="text-xs font-mono text-muted-foreground">
          Showing {filteredItems.length} products
        </span>
      </div>

      {/* 3. Main Directory Feed */}
      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <DirectoryRowSkeleton key={i} />
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
          <p className="font-mono text-sm text-muted-foreground">
            No products found in this category yet.
          </p>
          <a
            href="#claim"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-mono text-xs font-bold"
          >
            <Zap className="size-3.5" />
            <span>Be the first to list here</span>
          </a>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Top 1 Spotlight */}
          {item1 && (
            <DirectoryCard
              key={item1.id || item1.rank}
              item={item1}
              variant="top1"
              onClaimClick={handleClaimClick}
            />
          )}

          {/* Remaining High-Density Listing Rows */}
          {remainingItems.map((item) => (
            <DirectoryCard
              key={item.id || item.rank}
              item={item}
              onClaimClick={handleClaimClick}
            />
          ))}
        </div>
      )}

      {/* 4. Pagination Bar */}
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
              className="h-8 gap-1 text-xs cursor-pointer rounded-full"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="h-8 gap-1 text-xs cursor-pointer rounded-full"
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

