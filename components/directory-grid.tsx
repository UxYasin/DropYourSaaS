'use client';

import { DirectoryCard } from '@/components/directory-card';
import type { LeaderboardItem } from '@/lib/leaderboard-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface DirectoryGridProps {
  listings: LeaderboardItem[];
  isLoading?: boolean;
  onClaimClick?: (rank: number, bid: number) => void;
}

export function DirectoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <Skeleton className="size-12 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="pt-3 border-t border-border flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function DirectoryGrid({ listings, isLoading = false, onClaimClick }: DirectoryGridProps) {
  if (isLoading) {
    return <DirectoryGridSkeleton />;
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-muted/20">
        <p className="text-sm text-muted-foreground font-mono">No SaaS listings found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((item, index) => (
        <DirectoryCard
          key={item.id || item.rank || index}
          item={item}
          index={index}
          variant="grid"
          onClaimClick={onClaimClick}
        />
      ))}
    </div>
  );
}
