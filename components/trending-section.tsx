'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';
import { TrendingSkeleton } from '@/components/trending-skeleton';

const trendingItems = [
  { name: 'outrank.so', clicks: '869 clicks/h' },
  { name: 'orynth.dev', clicks: '671 clicks/h' },
  { name: 'shows.farm', clicks: '288 clicks/h' },
  { name: 'foundrlist.com', clicks: '277 clicks/h' },
  { name: 'redreplier.com', clicks: '265 clicks/h' },
];

export function TrendingSection() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <TrendingSkeleton />;

  return (
    <Card className="p-3.5 border-border shadow-[var(--shadow-1)] bg-card rounded-xl">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-foreground">
            <Flame className="size-3.5 text-amber-500" />
            Trending Right Now
          </div>
          <span className="text-[10px] text-muted-foreground font-normal">Realtime signals</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1.5">
          {trendingItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-muted/60 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono text-muted-foreground w-3.5">{i + 1}</span>
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${item.name}&sz=32`}
                  alt={item.name}
                  width={14}
                  height={14}
                  className="rounded flex-shrink-0"
                  unoptimized
                />
                <span className="font-medium text-xs truncate">{item.name}</span>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono font-normal px-2 py-0 h-4 bg-muted/80 text-muted-foreground">
                {item.clicks}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
