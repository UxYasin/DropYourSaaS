'use client';

import { useState, useEffect } from 'react';
import { DirectoryCard } from '@/components/directory-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
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

  useEffect(() => {
    let cancelled = false;
    fetch('/api/leaderboard')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setTimeout(() => setIsLoading(false), 300);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaimClick = (rank: number, bid: number) => {
    if (onClaimClick) {
      onClaimClick(rank, bid);
    }
  };

  // Divide items into Top 3, Top 10 (4-10), and Top 20 (11-20)
  const top20Items = items.slice(0, 20);
  const item1 = top20Items[0];
  const items2_3 = top20Items.slice(1, 3);
  const items4_10 = top20Items.slice(3, 10);
  const items11_20 = top20Items.slice(10, 20);

  return (
    <div className="mt-8 space-y-4">
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

      {/* SECTION 3: TOP 20 (11th to 20th spot) */}
      <SectionDivider title="Top 20" />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <DirectorySkeleton key={i} variant="top11_20" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items11_20.map((item) => (
            <DirectoryCard
              key={item.rank}
              item={item}
              variant="top11_20"
              onClaimClick={handleClaimClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
