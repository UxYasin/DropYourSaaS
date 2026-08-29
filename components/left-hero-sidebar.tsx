'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import { Minus, Plus, Loader2, Zap } from 'lucide-react';
import { FaviconImage } from '@/components/favicon-image';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { LeaderboardItem } from '@/lib/leaderboard-data';

interface LeftHeroSidebarProps {
  selectedRank?: number;
  selectedBid?: number;
  className?: string;
}

export const LeftHeroSidebar = forwardRef<HTMLInputElement, LeftHeroSidebarProps>(
  function LeftHeroSidebar({ selectedRank, selectedBid, className }, ref) {
    const [url, setUrl] = useState('');
    const [currentRank, setCurrentRank] = useState<number>(selectedRank || 1);
    const [bid, setBid] = useState<number>(selectedBid !== undefined ? Math.max(1, selectedBid) : 1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [topItems, setTopItems] = useState<{ rank: number; bid: number }[]>([]);
    const [recentBids, setRecentBids] = useState<LeaderboardItem[]>([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);

    useEffect(() => {
      let isMounted = true;
      async function loadLiveFeed() {
        try {
          const res = await fetch('/api/leaderboard?limit=10&sortBy=rank');
          if (res.ok) {
            const data = await res.json();
            const items = Array.isArray(data) ? data : data?.items || [];
            if (isMounted && items.length > 0) {
              const mapped = items.map((it: { rank?: number; bid?: number }, idx: number) => ({
                rank: it.rank || idx + 1,
                bid: Number(it.bid || 0),
              }));
              setTopItems(mapped);

              if (selectedBid === undefined) {
                const top1Bid = mapped[0]?.bid || 0;
                const requiredOutbid = Math.max(1, top1Bid + 1);
                setBid(requiredOutbid);
                setCurrentRank(1);
              }
            }
          }

          const resRecent = await fetch('/api/leaderboard?limit=5&sortBy=recent');
          if (resRecent.ok) {
            const recentData = await resRecent.json();
            const recentList = Array.isArray(recentData) ? recentData : recentData?.items || [];
            if (isMounted) {
              setRecentBids(recentList);
            }
          }
        } catch {
        } finally {
          if (isMounted) setIsLoadingRecent(false);
        }
      }

      loadLiveFeed();
      return () => {
        isMounted = false;
      };
    }, [selectedBid]);

    useEffect(() => {
      if (selectedRank !== undefined) {
        setCurrentRank(selectedRank);
      }
      if (selectedBid !== undefined) {
        setBid(Math.max(1, selectedBid));
      }
    }, [selectedRank, selectedBid]);

    const top1Bid = topItems[0]?.bid ?? 0;

    const calculateRankForBid = (bidAmount: number): number => {
      if (topItems.length === 0) return 1;
      if (bidAmount > top1Bid) return 1;
      const foundIdx = topItems.findIndex((it) => bidAmount > it.bid);
      if (foundIdx !== -1) return foundIdx + 1;
      return Math.max(1, topItems.length + 1);
    };

    const handleDecrease = (e: React.MouseEvent) => {
      e.stopPropagation();
      setBid((prev) => {
        const next = Math.max(1, prev - 1);
        setCurrentRank(calculateRankForBid(next));
        return next;
      });
    };

    const handleIncrease = (e: React.MouseEvent) => {
      e.stopPropagation();
      setBid((prev) => {
        const next = prev + 1;
        setCurrentRank(calculateRankForBid(next));
        return next;
      });
    };

    const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(val)) {
        const positiveVal = Math.max(1, val);
        setBid(positiveVal);
        setCurrentRank(calculateRankForBid(positiveVal));
      } else if (e.target.value === '') {
        setBid(1);
        setCurrentRank(calculateRankForBid(1));
      }
    };

    const handleClaim = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!url.trim()) {
        setError('Please enter your website URL or @twitter');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url.trim(),
            amount: Math.max(1, bid),
            targetRank: currentRank,
          }),
        });

        const data = await res.json();

        if (res.ok && (data.url || data.checkoutUrl)) {
          window.location.href = data.url || data.checkoutUrl;
          return;
        }

        setError(data?.error || 'Failed to initialize checkout. Please try again.');
      } catch {
        setError('Network error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const displayRank = currentRank || selectedRank || 1;

    return (
      <aside
        className={cn(
          'w-full lg:w-[280px] xl:w-[295px] 2xl:w-[310px] shrink-0 lg:sticky lg:top-20 h-fit space-y-5 select-none',
          className
        )}
      >
        {/* 1. Main Pitch Headline with Blue-to-Purple Gradient Accent */}
        <div className="space-y-2 text-left">
          <h1 className="font-mono font-black text-3xl sm:text-4xl lg:text-[40px] tracking-tight text-foreground leading-[1.1]">
            Every great <br />
            project deserves <br />
            its{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              first bid.
            </span>
          </h1>
          <p className="text-xs sm:text-[13px] text-muted-foreground font-mono leading-relaxed">
            The real-time pay-to-rank software leaderboard. Starting from $1, outbid competitors to claim rankings, live placement, and dofollow backlinks.
          </p>
        </div>

        {/* 2. Interactive Claim / Outbid Widget Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-blue-500/20 dark:border-blue-500/30 bg-card/95 dark:bg-[#161822] shadow-xs space-y-3.5 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 size-28 bg-blue-500/10 dark:bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* URL Input */}
          <input
            ref={ref}
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="yourproduct.com or @handle"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-muted/40 dark:bg-muted/20 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-sans shadow-2xs"
          />

          {/* Stepper + Bid Amount Box */}
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/60">
            <button
              type="button"
              onClick={handleDecrease}
              aria-label="Decrease bid"
              className="size-8 rounded-lg bg-background hover:bg-muted text-foreground flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer border border-border/60"
            >
              <Minus className="size-3.5" />
            </button>

            <div className="flex items-center justify-center gap-1.5 font-mono font-black text-xl text-foreground">
              <span className="text-blue-600 dark:text-blue-400 font-black">$</span>
              <input
                type="text"
                value={bid}
                onChange={handleBidChange}
                className="w-14 text-center bg-transparent border-none outline-none font-mono font-black text-foreground"
              />
            </div>

            <button
              type="button"
              onClick={handleIncrease}
              aria-label="Increase bid"
              className="size-8 rounded-lg bg-background hover:bg-muted text-foreground flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer border border-border/60"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Primary Action Button (Blue-to-Purple Gradient) */}
          <button
            type="button"
            onClick={() => handleClaim()}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl font-mono font-black text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <>
                <Zap className="size-4 fill-white text-white" />
                <span>Claim #{displayRank} for ${bid}</span>
              </>
            )}
          </button>

          {error && (
            <p className="text-[11px] font-mono text-rose-500 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-center">
              {error}
            </p>
          )}

          <p className="text-[10px] text-center text-muted-foreground font-mono">
            start as min $1 to list · live ranking
          </p>
        </div>

        {/* 3. Recent Bids Live Feed Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-border/80 dark:border-white/10 bg-card/95 dark:bg-[#161822] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-mono px-1">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
              </span>
              RECENT BIDS
            </span>
            <span className="text-[10px] text-muted-foreground">Live Telemetry</span>
          </div>

          {isLoadingRecent ? (
            <div className="space-y-2 py-1">
              <div className="h-7 w-full bg-muted/40 animate-pulse rounded-lg" />
              <div className="h-7 w-full bg-muted/40 animate-pulse rounded-lg" />
              <div className="h-7 w-full bg-muted/40 animate-pulse rounded-lg" />
            </div>
          ) : recentBids.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2 font-mono">
              Live click telemetry active.
            </p>
          ) : (
            <div className="space-y-1.5">
              {recentBids.slice(0, 4).map((item, idx) => {
                const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=recent_bids&utm_campaign=left_rail`;
                const amount = item.bid ? `$${item.bid}` : '$1';

                return (
                  <a
                    key={item.id || item.url + idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('outbound_click', { url: item.url, source: 'left_recent_bids' })}
                    className="flex items-center justify-between p-2 rounded-xl bg-muted/30 dark:bg-muted/15 hover:bg-muted/60 transition-colors group text-xs border border-border/40"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="size-6 rounded-lg bg-background border border-border/60 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                        <FaviconImage
                          url={item.url}
                          name={item.name}
                          size={18}
                          containerClassName="rounded size-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate text-foreground group-hover:text-blue-500 transition-colors text-xs leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-sans truncate">
                          {item.time || 'recently'}
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                      {amount}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    );
  }
);
