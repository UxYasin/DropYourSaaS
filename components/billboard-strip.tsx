'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { FaviconImage } from '@/components/favicon-image';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { LeaderboardItem } from '@/lib/leaderboard-data';

interface BillboardStripProps {
  onClaimClick?: (rank: number, bid: number) => void;
  className?: string;
}

export function BillboardStrip({ onClaimClick, className }: BillboardStripProps) {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBillboard() {
      try {
        const res = await fetch('/api/leaderboard?limit=8&sortBy=rank');
        if (res.ok) {
          const data = await res.json();
          const list: LeaderboardItem[] = Array.isArray(data) ? data : data?.items || [];
          if (isMounted) {
            setItems(list);
          }
        }
      } catch {} finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBillboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="billboard" className={cn('w-full my-6 sm:my-8', className)}>
      <div className="rounded-3xl border border-amber-500/25 bg-amber-500/[0.03] dark:bg-amber-950/[0.12] p-4 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono font-bold text-[11px] uppercase tracking-wider">
              <Zap className="size-3 fill-amber-500 text-amber-500" />
              <span>Top on the Billboard</span>
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground font-mono">
              Live pay-to-rank featured inventory
            </span>
          </div>

          <a
            href="#claim"
            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <span>Claim from $1</span>
            <ArrowRight className="size-3" />
          </a>
        </div>

        {/* Billboard Grid: 2 rows x 4 columns on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
              />
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs font-mono text-muted-foreground">
              Billboard spots available. Be the first to claim #1!
            </div>
          ) : (
            items.slice(0, 8).map((item, idx) => {
              const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=billboard_strip&utm_campaign=billboard_grid`;
              const bidAmount = item.bid ? `$${item.bid}` : '$1';

              return (
                <a
                  key={item.id || item.url + idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('outbound_click', { url: item.url, source: 'billboard_strip' })}
                  className="flex items-center justify-between p-3 rounded-2xl bg-card hover:bg-muted/60 border border-border/70 hover:border-amber-500/40 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-8 rounded-xl bg-muted/80 border border-border/60 p-0.5 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaviconImage
                        url={item.url}
                        name={item.name}
                        src={item.favicon}
                        size={24}
                        containerClassName="rounded-md size-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate font-sans">
                        {item.description || 'Live software listing'}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-mono font-black text-[11px] shadow-2xs">
                      {bidAmount}
                    </span>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
