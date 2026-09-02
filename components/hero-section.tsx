'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import Link from 'next/link';
import {
  Link2,
  Zap,
  Minus,
  Plus,
  Loader2,
  Crown,
  Award,
  Flame,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { FaviconImage } from '@/components/favicon-image';
import { cn } from '@/lib/utils';
import type { LeaderboardItem } from '@/lib/leaderboard-data';

interface HeroSectionProps {
  selectedRank?: number;
  selectedBid?: number;
  onClaimClick?: (rank: number, bid: number) => void;
}

export const HeroSection = forwardRef<HTMLInputElement, HeroSectionProps>(function HeroSection(
  { selectedRank, selectedBid, onClaimClick },
  ref
) {
  const [url, setUrl] = useState('');
  const [currentRank, setCurrentRank] = useState<number>(selectedRank || 1);
  const [bid, setBid] = useState<number>(selectedBid !== undefined ? Math.max(1, selectedBid) : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topItems, setTopItems] = useState<LeaderboardItem[]>([]);
  const [isLoadingTop, setIsLoadingTop] = useState(true);

  // Current month & year string (e.g. "August 2026")
  const currentMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  // Fetch live top leaderboard entries
  useEffect(() => {
    let isMounted = true;
    async function loadTopBids() {
      try {
        const res = await fetch('/api/leaderboard?limit=5&sortBy=rank');
        if (res.ok) {
          const data = await res.json();
          const items: LeaderboardItem[] = Array.isArray(data) ? data : data?.items || [];
          if (isMounted && items.length > 0) {
            setTopItems(items);

            if (selectedBid === undefined) {
              const top1Bid = Number(items[0]?.bid || 0);
              const requiredOutbid = Math.max(1, top1Bid + 1);
              setBid(requiredOutbid);
              setCurrentRank(1);
            }
          }
        }
      } catch {} finally {
        if (isMounted) setIsLoadingTop(false);
      }
    }
    loadTopBids();
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

  const top1Bid = Number(topItems[0]?.bid || 0);
  const top2Bid = Number(topItems[1]?.bid || 0);
  const top3Bid = Number(topItems[2]?.bid || 0);

  const outbid1Cost = Math.max(1, top1Bid + 1);
  const outbid2Cost = Math.max(1, top2Bid + 1);
  const outbid3Cost = Math.max(1, top3Bid + 1);

  const calculateRankForBid = (bidAmount: number): number => {
    if (topItems.length === 0) return 1;
    if (bidAmount > top1Bid) return 1;
    if (bidAmount > top2Bid) return 2;
    if (bidAmount > top3Bid) return 3;
    const foundIdx = topItems.findIndex((it) => bidAmount > Number(it.bid || 0));
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

  const handleBidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleQuickSelect = (rankNumber: number, startingBid: number) => {
    setCurrentRank(rankNumber);
    setBid(Math.max(1, startingBid));
  };

  const handleClaim = async () => {
    if (!url.trim()) {
      setError('Please enter your website URL or @twitter handle');
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

      setError(data?.error || 'Failed to create checkout session. Please try again.');
    } catch {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRank = currentRank || selectedRank || 1;
  const bidText = `$${bid.toLocaleString()}`;

  return (
    <section id="claim" className="py-6 sm:py-9 max-w-[1440px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
        {/* ================= LEFT COLUMN: HERO PITCH & CLAIM FORM ================= */}
        <div className="lg:col-span-7 space-y-5 text-left">
          {/* Trust Eyebrow Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span>ahrefs DR 35+</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#46285d] text-white dark:bg-card dark:text-foreground text-xs font-semibold shadow-xs">
              <Sparkles className="size-3 fill-[#ffc748] text-[#ffc748]" />
              <span>DISCOVER THE BEST STARTUPS</span>
            </div>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tight text-foreground leading-[1.08]">
              Launch today. <br />
              <span className="text-primary">Get discovered.</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed max-w-xl">
              Guaranteed homepage placement, a permanent dofollow listing page, and founders discovering your product long after launch day.
            </p>
          </div>

          {/* Quick Outbid Shortcut Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => handleQuickSelect(1, outbid1Cost)}
              className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
            >
              <Crown className="size-3 fill-current" />
              <span>👑 Spot #1 (${outbid1Cost})</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(2, outbid2Cost)}
              className="px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
            >
              <Award className="size-3" />
              <span>🥈 Spot #2 (${outbid2Cost})</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(3, outbid3Cost)}
              className="px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer"
            >
              <Flame className="size-3" />
              <span>🥉 Spot #3 (${outbid3Cost})</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(Math.max(4, (topItems.length || 3) + 1), 1)}
              className="px-3 py-1 rounded-full bg-muted text-foreground border border-border text-xs font-medium inline-flex items-center gap-1 transition-all cursor-pointer hover:bg-muted/80"
            >
              <Zap className="size-3 text-accent fill-accent" />
              <span>Free / $1 to Rank</span>
            </button>
          </div>

          {/* Interactive Claim / Bid Input Bar */}
          <div className="space-y-2 pt-1 max-w-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleClaim();
              }}
              className="p-1.5 sm:p-2 rounded-2xl sm:rounded-full bg-card border border-border text-left shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-3 sm:pl-4">
                <Link2 className="size-4 text-muted-foreground shrink-0" />
                <input
                  ref={ref}
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="yourproduct.com or @handle"
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:ring-0 font-sans"
                />
              </div>

              {/* Stepper Inside Form */}
              <div className="flex items-center gap-1.5 self-end sm:self-center px-2 py-1 bg-muted/60 rounded-full border border-border/80">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="size-6 rounded-full bg-background hover:bg-muted text-foreground flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs text-xs font-bold"
                >
                  <Minus className="size-3" />
                </button>
                <div className="flex items-center font-bold text-xs text-foreground font-sans">
                  <span className="text-primary mr-0.5 font-bold">$</span>
                  <input
                    type="text"
                    value={bid}
                    onChange={handleBidInputChange}
                    className="w-8 text-center bg-transparent border-none outline-none font-bold text-foreground p-0 text-xs font-sans"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="size-6 rounded-full bg-background hover:bg-muted text-foreground flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs text-xs font-bold"
                >
                  <Plus className="size-3" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 sm:h-10 px-5 sm:px-6 rounded-full shrink-0 font-bold text-xs sm:text-sm text-white bg-primary hover:bg-[#76439c] active:bg-[#5b2d7d] shadow-sm hover:shadow-[0_0_0_0.25em_rgba(140,80,185,0.25)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Claim #{displayRank} for {bidText}</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="text-xs text-rose-600 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 text-center font-sans">
                {error}
              </div>
            )}
          </div>

          {/* Social Proof & Metrics */}
          <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground flex-wrap font-sans">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block size-6 rounded-full ring-2 ring-background bg-primary text-white font-bold text-[9px] flex items-center justify-center">YA</div>
                <div className="inline-block size-6 rounded-full ring-2 ring-background bg-[#53ab73] text-white font-bold text-[9px] flex items-center justify-center">SB</div>
                <div className="inline-block size-6 rounded-full ring-2 ring-background bg-accent text-white font-bold text-[9px] flex items-center justify-center">RC</div>
              </div>
              <span className="font-bold text-foreground">750+</span> founders launched
            </div>

            <div className="flex items-center gap-1.5">
              <Rocket className="size-3.5 text-primary" />
              <span><strong className="text-foreground">1,200+</strong> products listed</span>
            </div>

            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="size-3.5" />
              <span>100% Dofollow</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: LAUNCHING NOW LIVE CARD (LaunchIt Style) ================= */}
        <div className="lg:col-span-5 relative">
          {/* Subtle Ambient Background Grid & Glow */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-primary/15 via-transparent to-accent/15 rounded-3xl blur-xl -z-10" />

          <div className="rounded-3xl border border-border/90 bg-card p-5 sm:p-6 shadow-md relative overflow-hidden space-y-4">
            {/* Top Bar of Floating Card */}
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono font-black text-xs tracking-wider uppercase text-foreground">
                  LAUNCHING NOW
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {currentMonthYear}
                </span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#46285d] text-white text-[10px] font-sans font-bold shadow-xs">
                <CheckCircle2 className="size-3 fill-current" />
                <span>Permanent listing</span>
              </div>
            </div>

            {/* List of Top 3 Real-time Ranked Items */}
            <div className="space-y-2.5">
              {isLoadingTop ? (
                <div className="space-y-2 py-2">
                  <div className="h-12 w-full bg-muted/40 animate-pulse rounded-xl" />
                  <div className="h-12 w-full bg-muted/40 animate-pulse rounded-xl" />
                  <div className="h-12 w-full bg-muted/40 animate-pulse rounded-xl" />
                </div>
              ) : topItems.length === 0 ? (
                <p className="text-xs text-muted-foreground font-sans text-center py-4">
                  Leaderboard telemetry initializing...
                </p>
              ) : (
                topItems.slice(0, 3).map((item, idx) => {
                  const rank = idx + 1;
                  const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=hero_launchpad&utm_campaign=hero_preview`;

                  return (
                    <a
                      key={item.id || item.url + idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all border border-border/50 group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="font-heading font-bold text-xs text-muted-foreground w-6 shrink-0 text-center">
                          {rank}
                        </span>

                        <div className="size-9 rounded-xl bg-background border border-border p-1 shrink-0 overflow-hidden flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <FaviconImage
                            url={item.url}
                            name={item.name}
                            src={item.favicon}
                            size={28}
                            containerClassName="rounded-md size-full"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-heading font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate font-sans">
                            {item.description || 'Verified product listing on DropYourSaaS.'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-sans font-bold text-xs sm:text-sm text-foreground">
                          ${item.bid || 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                          Live
                        </span>
                      </div>
                    </a>
                  );
                })
              )}
            </div>

            {/* Bottom Callout in Floating Card */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-sans">
              <span className="text-muted-foreground">
                Want to be #1 today?
              </span>
              <a
                href="#claim"
                className="font-bold text-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
              >
                <span>Outbid now</span>
                <ArrowRight className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
