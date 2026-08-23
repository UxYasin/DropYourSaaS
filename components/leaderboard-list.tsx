'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DirectoryCard } from '@/components/directory-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
        <div className="mt-6 pt-4 border-t border-border flex gap-3 overflow-hidden">
          <Skeleton className="w-36 h-44 rounded-xl shrink-0" />
          <Skeleton className="w-36 h-44 rounded-xl shrink-0" />
          <Skeleton className="w-36 h-44 rounded-xl shrink-0" />
          <Skeleton className="w-36 h-44 rounded-xl shrink-0" />
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
              <Skeleton className="h-5 w-40" />
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
      <Card className="rounded-[14px] border border-border bg-card p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="size-10 rounded-[10px]" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-14" />
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
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
    </Card>
  );
}

export function LeaderboardList({ onClaimClick }: DirectoryListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LeaderboardItem[]>(seedLeaderboardItems);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(seedLeaderboardItems.length);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const isVerified = searchParams?.get('verified') === 'true';

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/leaderboard?page=${page}&limit=50&t=${Date.now()}`)
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
  }, [page, isVerified]);

  const handleClaimClick = (rank: number, bid: number) => {
    if (onClaimClick) {
      onClaimClick(rank, bid);
    }
  };

  const isFirstPage = page === 1;
  const item1 = isFirstPage ? items[0] : null;
  const items2_3 = isFirstPage ? items.slice(1, 3) : [];
  const items4_10 = isFirstPage ? items.slice(3, 10) : [];
  const remainingItems = isFirstPage ? items.slice(10) : items;

  return (
    <div className="mt-8 space-y-4">
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
                  key={item1.rank}
                  item={item1}
                  variant="top1"
                  onClaimClick={handleClaimClick}
                />
              )}
              {items2_3.map((item) => (
                <DirectoryCard
                  key={item.rank}
                  item={item}
                  variant="top2_3"
                  onClaimClick={handleClaimClick}
                />
              ))}
            </div>
          )}

          {/* SECTION 2: TOP 10 (4th to 10th spot) */}
          <SectionDivider title="Top 10" />

          {isLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <DirectorySkeleton key={i} variant="top4_10" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {items4_10.map((item) => (
                <DirectoryCard
                  key={item.rank}
                  item={item}
                  variant="top4_10"
                  onClaimClick={handleClaimClick}
                />
              ))}
            </div>
          )}

          {/* SECTION 3: TOP 20 & BEYOND (11th+ spot) */}
          <SectionDivider title="Index Feed" count={`${totalCount} total`} />

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
                  key={item.rank}
                  item={item}
                  variant="top11_20"
                  onClaimClick={handleClaimClick}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <SectionDivider title={`Page ${page}`} count={`${totalCount} total`} />
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <DirectorySkeleton key={i} variant="top11_20" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <DirectoryCard
                  key={item.rank}
                  item={item}
                  variant="top11_20"
                  onClaimClick={handleClaimClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* PAGINATION CONTROLS */}
      {(totalPages > 1 || totalCount > 50) && (
        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between font-mono text-xs text-muted-foreground">
          <div>
            Showing <span className="font-bold text-foreground">{(page - 1) * 50 + 1}</span>-
            <span className="font-bold text-foreground">{Math.min(page * 50, totalCount)}</span> of{' '}
            <span className="font-bold text-foreground">{totalCount}</span> listings
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 rounded-lg text-xs font-sans flex items-center gap-1"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>

            <span className="px-2 font-bold text-foreground text-xs">
              {page} / {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 rounded-lg text-xs font-sans flex items-center gap-1"
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
