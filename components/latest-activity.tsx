'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LatestActivitySkeleton } from '@/components/latest-activity-skeleton';

const latestActivity = [
  { name: 'nippy.host', rank: 132, amount: '$14', time: 'just now' },
  { name: 'maltacasino.se', rank: 169, amount: '$7', time: 'just now' },
  { name: 'jobfast.co', rank: 233, amount: '$5', time: '2 minutes ago' },
  { name: 'outrank.so', rank: 1, amount: '$12,052', time: '3 minutes ago' },
  { name: 'aiapply.co', rank: 131, amount: '$14', time: '4 minutes ago' },
];

export function LatestActivity() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LatestActivitySkeleton />;

  return (
    <Card className="p-3.5 border-border shadow-[var(--shadow-1)] bg-card rounded-xl">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
            </span>
            Recent Submissions
          </div>
          <span className="text-[10px] text-muted-foreground font-normal">Live index</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1.5">
          {latestActivity.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-muted/60 transition-colors">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${item.name}&sz=32`}
                  alt={item.name}
                  width={14}
                  height={14}
                  className="rounded flex-shrink-0"
                  unoptimized
                />
                <span className="font-medium text-xs truncate">{item.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-mono">
                  #{item.rank}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{item.amount}</span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
