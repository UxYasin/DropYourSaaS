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
    <div className="relative my-8 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/80" />
      </div>
      <div className="relative flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-xs shadow-xs tracking-wide">
        <span>{title}</span>
        {count && <span className="opacity-80 font-normal text-[11px]">({count})</span>}
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'rank' | 'hot' | 'top' | 'recent'>('rank');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(seedLeaderboardItems.length);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const isVerified = searchParams?.get('verified') === 'true';

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
  }, [page, selectedCategory, sortBy, isVerified]);

  const handleClaimClick = (rank: number, bid: number) => {
    if (onClaimClick) {
      onClaimClick(rank, bid);
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const isFirstPage = page === 1 && selectedCategory === 'All' && sortBy === 'rank';
  const item1 = isFirstPage ? items[0] : null;
  const items2_3 = isFirstPage ? items.slice(1, 3) : [];
  const items4_10 = isFirstPage ? items.slice(3, 10) : [];
  const remainingItems = isFirstPage ? items.slice(10) : items;

  return (
    <div className="mt-8 space-y-6">
      {/* Category Topics Filter Bar */}
      <div className="py-1">
        <CategoryFilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => handleCategorySelect(cat.queryValue)}
        />
      </div>

      {/* Reddit-Style Sort Engine Controls (Hot, Top, Recent, Rank) */}
      <div className="flex items-center justify-between gap-3 px-1 py-2 flex-wrap border-b border-border/40 pb-3">
        <div className="flex items-center gap-1 bg-zinc-900/60 dark:bg-zinc-900/80 p-1 rounded-full border border-zinc-800/80">
          <button
            type="button"
            onClick={() => { setSortBy('hot'); setPage(1); }}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              sortBy === 'hot'
                ? 'bg-[#FF4500] text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            )}
          >
            <Flame className="size-3.5" />
            <span>Hot</span>
          </button>

          <button
            type="button"
            onClick={() => { setSortBy('top'); setPage(1); }}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              sortBy === 'top'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            )}
          >
            <Trophy className="size-3.5" />
            <span>Top</span>
          </button>

          <button
            type="button"
            onClick={() => { setSortBy('recent'); setPage(1); }}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              sortBy === 'recent'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            )}
          >
            <Clock className="size-3.5" />
            <span>Recent</span>
          </button>

          <button
            type="button"
            onClick={() => { setSortBy('rank'); setPage(1); }}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer',
              sortBy === 'rank'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            )}
          >
            <BarChart2 className="size-3.5" />
            <span>Rank / Bids</span>
          </button>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Showing <span className="text-foreground font-bold">{items.length}</span> SaaS products
        </div>
      </div>

      {isFirstPage ? (
        <>
          {/* SECTION 1: TOP 3 */}
          <SectionDivider title="Top 3" />

          {isLoading ? (
            <div className="space-y-3.5">
              <DirectorySkeleton variant="top1" />
              <DirectorySkeleton variant="top2_3" />
              <DirectorySkeleton variant="top2_3" />
            </div>
          ) : (
            <div className="space-y-3.5">
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

          {/* SECTION 2: TOP 4 TO 10 */}
          <SectionDivider title="Top 4 – 10" />

          {isLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <DirectorySkeleton key={i} variant="top4_10" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {items4_10.map((item) => (
                <DirectoryCard
                  key={item.id || item.rank}
                  item={item}
                  variant="top4_10"
                  onClaimClick={handleClaimClick}
                />
              ))}
            </div>
          )}

          {/* SECTION 3: ALL OTHER LISTINGS */}
          <SectionDivider title="Leaderboard Feed" count={`${totalCount} Total`} />

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <DirectorySkeleton key={i} variant="top11_20" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {remainingItems.map((item) => (
                <DirectoryCard
                  key={item.id || item.rank}
                  item={item}
                  variant="top11_20"
                  onClaimClick={handleClaimClick}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <DirectorySkeleton key={i} variant="top11_20" />
              ))}
            </div>
          ) : (
            items.map((item) => (
              <DirectoryCard
                key={item.id || item.rank}
                item={item}
                variant="top11_20"
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
