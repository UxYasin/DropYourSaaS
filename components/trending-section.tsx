'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, BadgeCheck } from 'lucide-react';
import { TrendingSkeleton } from '@/components/trending-skeleton';
import type { LeaderboardItem } from '@/lib/leaderboard-data';
import { trackEvent } from '@/lib/analytics';
import { FaviconImage } from '@/components/favicon-image';

export function TrendingSection() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/leaderboard?type=trending');
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data.items)) {
            setItems(data.items);
          }
        }
      } catch {
        // Handle network error
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
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground font-mono">
            No trending submissions yet
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map((item, i) => {
              const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=trending&utm_campaign=listings`;

              return (
                <a
                  key={item.name + i}
                  href={href}
                  target="_blank"
                  rel={item.is_dofollow ? "noopener" : "nofollow noopener"}
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
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-muted-foreground w-3.5">{i + 1}</span>
                    <FaviconImage
                      url={item.url}
                      name={item.name}
                      size={15}
                      containerClassName="rounded size-3.5 shrink-0"
                    />
                    <span className="font-medium text-xs truncate text-foreground group-hover:text-primary transition-colors inline-flex items-center gap-1">
                      <span>{item.name}</span>
                      {item.is_verified && (
                        <BadgeCheck className="size-3 text-blue-500 fill-blue-500 shrink-0" />
                      )}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono font-normal px-2 py-0 h-4 bg-muted/80 text-muted-foreground shrink-0">
                    {(item.clicks || 0).toLocaleString()} clicks
                  </Badge>
                </a>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
