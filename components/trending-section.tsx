'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';
import { TrendingSkeleton } from '@/components/trending-skeleton';
import type { LeaderboardItem } from '@/lib/leaderboard-data';
import { trackEvent } from '@/lib/analytics';

export function TrendingSection() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data.items)) {
            // Sort by clicks descending and take top 5
            const sorted = [...data.items]
              .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
              .slice(0, 5);
            setItems(sorted);
          }
        }
      } catch {
        // Keep fallback
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchTrending();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) return <TrendingSkeleton />;

  const displayItems = items.length > 0 ? items : [
    { rank: 1, name: 'outrank.so', clicks: 0, bid: 12052, url: 'https://outrank.so', time: '3m ago' },
    { rank: 2, name: 'orynth.dev', clicks: 0, bid: 12051, url: 'https://orynth.dev', time: '12m ago' },
    { rank: 3, name: 'trycomp.ai', clicks: 0, bid: 10000, url: 'https://trycomp.ai', time: '1h ago' },
    { rank: 4, name: 'lathire.com', clicks: 0, bid: 3100, url: 'https://lathire.com', time: '2h ago' },
    { rank: 5, name: 'mytb.ai', clicks: 0, bid: 2999, url: 'https://mytb.ai', time: '3h ago' },
  ];

  return (
    <Card className="p-3.5 border-border shadow-[var(--shadow-1)] bg-card rounded-xl">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-foreground font-mono">
            <Flame className="size-3.5 text-amber-500" />
            Trending Right Now
          </div>
          <span className="text-[10px] text-muted-foreground font-sans font-normal">Realtime signals</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1.5">
          {displayItems.map((item, i) => {
            const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=trending&utm_campaign=listings`;

            return (
              <a
                key={item.name + i}
                href={href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={() => {
                  trackEvent('outbound_click', { url: item.url, source: 'trending' });
                  fetch('/api/click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: item.url }),
                  }).catch(() => {});
                }}
                className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-muted/60 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-muted-foreground w-3.5">{i + 1}</span>
                  <Image
                    src={`https://www.google.com/s2/favicons?domain=${item.name}&sz=32`}
                    alt={item.name}
                    width={14}
                    height={14}
                    className="rounded flex-shrink-0"
                    unoptimized
                  />
                  <span className="font-medium text-xs truncate text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono font-normal px-2 py-0 h-4 bg-muted/80 text-muted-foreground shrink-0">
                  {item.clicks.toLocaleString()} clicks
                </Badge>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
