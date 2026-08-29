'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DirectoryCard } from '@/components/directory-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Tag, Flame, Trophy, Clock, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';
import { CategoryFilterBar } from '@/components/category-filter-bar';
import {
  leaderboardItems as seedLeaderboardItems,
  type LeaderboardItem,
} from '@/lib/leaderboard-data';

interface DirectoryListProps {
  onClaimClick?: (rank: number, bid: number) => void;
}

function SectionDivider({ title, count }: { title: string; count?: string }) {
  return (
    <div className="relative my-4 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/70" />
      </div>
      <div className="relative flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-card border border-border/80 text-muted-foreground font-mono font-bold text-[10px] tracking-wider uppercase shadow-2xs">
        <span>{title}</span>
        {count && <span className="opacity-70 font-normal">({count})</span>}
      </div>
    </div>
  );
}

function DirectorySkeleton({ variant }: { variant: 'top1' | 'top2_3' | 'top4_10' | 'top11_20' }) {
  if (variant === 'top1') {
    return (
      <Card className="rounded-[22px] border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-16 rounded-[14px]" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <Skeleton className="w-full h-48 sm:h-56 md:h-64 rounded-xl" />
        </div>
      </Card>
    );
  }

  if (variant === 'top2_3') {
    return (
      <Card className="rounded-[18px] border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="size-14 rounded-[12px]" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'top4_10') {
    return (
      <Card className="rounded-[16px] border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="size-11 rounded-[12px]" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[12px] border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <Skeleton className="size-5 rounded-md" />
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function LeaderboardList({ onClaimClick }: DirectoryListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LeaderboardItem[]>(seedLeaderboardItems);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'rank' | 'hot' | 'top' | 'recent'>('rank');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(seedLeaderboardItems.length);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const searchParams = useSearchParams();
  const isVerified = searchParams?.get('verified') === 'true';

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
  }, [page, selectedCategory, sortBy, isVerified, refreshTrigger]);

  const handleClaimClick = (rank: number, bid: number) => {
    if (onClaimClick) {
      onClaimClick(rank, bid);
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
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
  const items2_3 = isFirstPage ? displayList.slice(1, 3) : [];
  const items4_10 = isFirstPage ? displayList.slice(3, 10) : [];
  const remainingItems = isFirstPage ? displayList.slice(10) : displayList;

  return (
    <div className="space-y-4">
      {/* Top Filter Capsule Bar Matching Sample */}
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
            All
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
        </div>

        {/* Category Topics Filter Bar */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <CategoryFilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => handleCategorySelect(cat.queryValue)}
            activeCategories={activeCategories}
          />
        </div>
      </div>

      {isFirstPage ? (
        <>
          {/* TOP 1 - 3 LISTINGS */}
          {isLoading ? (
            <div className="space-y-3">
              <DirectorySkeleton variant="top1" />
              <DirectorySkeleton variant="top2_3" />
              <DirectorySkeleton variant="top2_3" />
            </div>
          ) : (
            <div className="space-y-3">
              {item1 && (
                <DirectoryCard
                  key={item1.id || item1.rank}
                  item={item1}
                  variant="top1"
                  onClaimClick={handleClaimClick}
                />
              )}
              {items2_3.map((item) => (
                <DirectoryCard
                  key={item.id || item.rank}
                  item={item}
                  variant="top2_3"
                  onClaimClick={handleClaimClick}
                />
              ))}
            </div>
          )}

          {/* TOP 3 DIVIDER */}
          <SectionDivider title="TOP 3" />

          {/* REMAINING LISTINGS (#4+) */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <DirectorySkeleton key={i} variant="top4_10" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {items4_10.concat(remainingItems).map((item) => (
                <DirectoryCard
                  key={item.id || item.rank}
                  item={item}
                  variant="top4_10"
                  onClaimClick={handleClaimClick}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <DirectorySkeleton key={i} variant="top11_20" />
              ))}
            </div>
          ) : (
            filteredItems.map((item) => (
              <DirectoryCard
                key={item.id || item.rank}
                item={item}
                onClaimClick={handleClaimClick}
              />
            ))
          )}
        </div>
      )}

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
