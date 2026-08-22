import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LeaderboardCardSkeleton() {
  return (
    <Card className="p-3.5 sm:p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton className="size-7 rounded-lg shrink-0" />
          <Skeleton className="size-9 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  );
}