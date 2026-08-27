'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import { Link2, Zap, Minus, Plus, Loader2, Crown, Award, Flame } from 'lucide-react';
import { LiveStatsPill } from '@/components/live-stats-pill';

interface HeroSectionProps {
  selectedRank?: number;
  selectedBid?: number;
}

export const HeroSection = forwardRef<HTMLInputElement, HeroSectionProps>(function HeroSection(
  { selectedRank, selectedBid },
  ref
) {
  const [url, setUrl] = useState('');
  const [currentRank, setCurrentRank] = useState<number>(selectedRank || 1);
  const [bid, setBid] = useState<number>(selectedBid !== undefined ? Math.max(1, selectedBid) : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRank !== undefined) {
      setCurrentRank(selectedRank);
    }
    if (selectedBid !== undefined) {
      setBid(Math.max(1, selectedBid));
    }
  }, [selectedRank, selectedBid]);

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBid((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBid((prev) => prev + 1);
  };

  const handleBidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(val)) {
      setBid(Math.max(1, val));
    } else if (e.target.value === '') {
      setBid(1);
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
    <div className="text-center py-4 sm:py-6 max-w-3xl xl:max-w-4xl mx-auto space-y-4 sm:space-y-5">
      {/* Dynamic Status Pill */}
      <LiveStatsPill />

      {/* Main Hero Headline & Dynamic Outbid Interactive Title */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="font-mono font-black text-3xl sm:text-5xl md:text-6xl lg:text-[58px] tracking-tight text-foreground leading-[1.15]">
          Rank higher. Claim #{displayRank} for{' '}
          <span className="inline-flex items-center gap-2 sm:gap-3 text-[#fe4103] align-middle justify-center flex-wrap bg-white dark:bg-zinc-900 px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl sm:rounded-3xl border-2 border-[#fe4103]/30 dark:border-[#fe4103]/40 shadow-xs hover:border-[#fe4103]/60 transition-colors">
            <button
              type="button"
              onClick={handleDecrease}
              aria-label="Decrease bid"
              className="inline-flex items-center justify-center size-8 sm:size-9 rounded-full bg-[#fe4103]/10 hover:bg-[#fe4103]/20 text-[#fe4103] transition-transform active:scale-90 cursor-pointer shrink-0"
            >
              <Minus className="size-4 sm:size-4.5" />
            </button>

            <span className="inline-flex items-center font-mono font-black">
              <span className="text-2xl sm:text-3xl md:text-4xl text-[#fe4103] mr-0.5">$</span>
              <input
                type="text"
                value={bid}
                onChange={handleBidInputChange}
                className="w-14 sm:w-20 md:w-24 text-center bg-transparent border-b-3 border-[#fe4103] focus:border-[#fe4103] outline-none text-2xl sm:text-3xl md:text-4xl font-mono font-black text-[#fe4103] p-0"
              />
            </span>

            <button
              type="button"
              onClick={handleIncrease}
              aria-label="Increase bid"
              className="inline-flex items-center justify-center size-8 sm:size-9 rounded-full bg-[#fe4103]/10 hover:bg-[#fe4103]/20 text-[#fe4103] transition-transform active:scale-90 cursor-pointer shrink-0"
            >
              <Plus className="size-4 sm:size-4.5" />
            </button>
          </span>
        </h1>
        <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl xl:max-w-3xl mx-auto">
          Outrank competitors in real-time. Every listing gets instant live placement, verified badge, dedicated SEO page &amp; dofollow backlink.
        </p>
      </div>

      {/* Quick Outrank Shortcut Badges */}
      <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto pt-1">
        <button
          type="button"
          onClick={() => handleQuickSelect(1, Math.max(1, bid))}
          className="px-3.5 py-1.5 rounded-full bg-[#fe4103]/10 hover:bg-[#fe4103]/20 text-[#fe4103] border border-[#fe4103]/30 text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Crown className="size-3.5 fill-current" />
          <span>👑 Outbid #1</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(2, Math.max(1, bid))}
          className="px-3.5 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Award className="size-3.5" />
          <span>🥈 Outbid #2</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(3, Math.max(1, bid))}
          className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Flame className="size-3.5" />
          <span>🥉 Outbid #3</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(4, 1)}
          className="px-3.5 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Zap className="size-3.5 fill-current" />
          <span>🚀 Start from $1</span>
        </button>
      </div>

      {/* Super-clean Single-Row Instant Claim Bar */}
      <div className="pt-2 max-w-2xl xl:max-w-3xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleClaim();
          }}
          className="p-1.5 sm:p-2 rounded-full bg-white dark:bg-[#1a1c20] border border-border/90 text-left shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-3.5 sm:pl-4">
            <Link2 className="size-4 sm:size-5 text-muted-foreground shrink-0" />
            <input
              ref={ref}
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="yourproduct.com or @twitter"
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm md:text-base text-foreground placeholder:text-muted-foreground/70 focus:ring-0 font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 sm:h-11 px-5 sm:px-7 rounded-full shrink-0 font-mono font-black text-xs sm:text-sm text-white bg-[#fe4103] hover:bg-[#e03800] shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <>
                <Zap className="size-4 fill-white text-white" />
                <span>Claim #{displayRank} for {bidText}</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-2 text-xs font-mono text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-center">
            {error}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/80 font-mono text-center pt-2.5">
          Instant live placement · Dofollow SEO backlink · 1-click Whop checkout
        </p>
      </div>
    </div>
  );
});
