'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LatestActivitySkeleton } from '@/components/latest-activity-skeleton';
import type { LeaderboardItem } from '@/lib/leaderboard-data';
import { trackEvent } from '@/lib/analytics';
import { FaviconImage } from '@/components/favicon-image';
import { BadgeCheck } from 'lucide-react';

export function LatestActivity() {
  const [items, setItems] = useState<{ name: string; rank: number; amount: string; time: string; url: string; is_verified?: boolean; is_dofollow?: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/leaderboard?type=recent');
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data.items)) {
            const mapped = data.items.map((it: LeaderboardItem) => ({
              name: it.name,
              rank: it.rank,
              amount: `$${(it.bid || 0).toLocaleString()}`,
              time: it.time,
              url: it.url,
              is_verified: it.is_verified,
              is_dofollow: it.is_dofollow,
            }));
            setItems(mapped);
          }
        }
      } catch {
        // Handle error
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchLatest();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) return <LatestActivitySkeleton />;

  return (
    <Card className="p-3.5 border-border shadow-[var(--shadow-1)] bg-card rounded-xl">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-foreground font-mono">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
            </span>
            Recent Submissions
          </div>
          <span className="text-[10px] text-muted-foreground font-sans font-normal">Live index</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground font-mono">
            No recent submissions yet
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map((item, i) => {
              const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=recent&utm_campaign=listings`;

              return (
                <a
                  key={item.name + i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent('outbound_click', { url: item.url, source: 'recent_submissions' });
                    fetch('/api/click', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: item.url }),
                    }).catch(() => {});
                  }}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-muted/60 transition-colors group"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
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
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-mono">
                      #{item.rank}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-sans shrink-0">{item.time}</span>
                </a>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
