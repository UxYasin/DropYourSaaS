'use client';

import { useState, forwardRef } from 'react';
import { Link2, Loader2, ChevronDown, ChevronUp, Zap, Crown, Award, Flame, Minus, Plus } from 'lucide-react';
import { LiveStatsPill } from '@/components/live-stats-pill';
import { siteCopy } from '@/lib/copy';
import { CATEGORIES } from '@/lib/categories';
import { trackEvent } from '@/lib/analytics';

interface HeroSectionProps {
  ref?: React.Ref<HTMLInputElement>;
  selectedRank?: number;
  selectedBid?: number;
  onBidChange?: (bid: number) => void;
}

export const HeroSection = forwardRef<HTMLInputElement, HeroSectionProps>(function HeroSection(
  { selectedRank = 1, selectedBid = 1, onBidChange },
  ref
) {
  const [url, setUrl] = useState('');
  const [currentRank, setCurrentRank] = useState<number>(selectedRank || 1);
  const [bid, setBid] = useState<number>(Math.max(1, selectedBid || 1));
  const [category, setCategory] = useState<string>('SaaS');
  const [twitterHandle, setTwitterHandle] = useState<string>('');
  const [isForSale, setIsForSale] = useState(false);
  const [askingPrice, setAskingPrice] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecrease = () => {
    const newBid = Math.max(1, bid - 1);
    setBid(newBid);
    onBidChange?.(newBid);
  };

  const handleIncrease = () => {
    const newBid = Math.min(100000, bid + 1);
    setBid(newBid);
    onBidChange?.(newBid);
  };

  const handleBidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const num = val ? Math.max(1, parseInt(val, 10)) : 1;
    setBid(num);
    onBidChange?.(num);
  };

  const handleQuickSelect = (rankNumber: number, suggestedBid: number) => {
    setCurrentRank(rankNumber);
    setBid(suggestedBid);
    onBidChange?.(suggestedBid);
  };

  const handleClaim = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL (e.g. yourproduct.com) or @handle');
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(url.trim())
      ? url.trim()
      : `https://${url.trim().replace(/^@/, '')}`;

    setIsSubmitting(true);
    setError(null);

    trackEvent('checkout_started', {
      url: normalizedUrl,
      rank: currentRank,
      bid,
      category,
      isForSale,
    });

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizedUrl,
          siteUrl: normalizedUrl,
          bid,
          amount: bid,
          targetRank: currentRank,
          category,
          twitterHandle: twitterHandle.trim() || undefined,
          isForSale,
          askingPrice: isForSale ? askingPrice.trim() : undefined,
        }),
      });

      const data = await res.json();
      const checkoutUrl = data?.checkoutUrl || data?.url;

      if (res.ok && checkoutUrl) {
        window.location.href = checkoutUrl;
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
    <div className="text-center py-2 sm:py-4 max-w-3xl xl:max-w-4xl mx-auto space-y-2.5 sm:space-y-3.5">
      {/* Dynamic Status Pill */}
      <LiveStatsPill />

      {/* Main Hero Headline & Dynamic Outbid Interactive Title */}
      <div className="space-y-1.5 sm:space-y-2">
        <h1 className="font-mono font-black text-2xl sm:text-4xl md:text-5xl lg:text-[52px] tracking-tight text-foreground leading-[1.1]">
          Rank higher. Claim #{displayRank} for{' '}
          <span className="inline-flex items-center gap-1 sm:gap-2 text-orange-500 dark:text-orange-400 align-middle justify-center flex-wrap bg-white dark:bg-zinc-900 px-2.5 py-0.5 rounded-xl sm:rounded-2xl border border-orange-500/30 dark:border-orange-500/40 shadow-xs">
            <button
              type="button"
              onClick={handleDecrease}
              aria-label="Decrease bid"
              className="inline-flex items-center justify-center size-6 sm:size-8 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 transition-transform active:scale-90 cursor-pointer shrink-0"
            >
              <Minus className="size-3 sm:size-3.5" />
            </button>

            <span className="inline-flex items-center font-mono font-black">
              <span className="text-lg sm:text-2xl md:text-3xl text-orange-500 dark:text-orange-400">$</span>
              <input
                type="text"
                value={bid}
                onChange={handleBidInputChange}
                className="w-12 sm:w-16 md:w-20 text-center bg-transparent border-b-2 border-orange-500/50 focus:border-orange-500 outline-none text-lg sm:text-2xl md:text-3xl font-mono font-black text-orange-500 dark:text-orange-400 p-0"
              />
            </span>

            <button
              type="button"
              onClick={handleIncrease}
              aria-label="Increase bid"
              className="inline-flex items-center justify-center size-6 sm:size-8 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 transition-transform active:scale-90 cursor-pointer shrink-0"
            >
              <Plus className="size-3 sm:size-3.5" />
            </button>
          </span>
        </h1>
        <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl xl:max-w-3xl mx-auto line-clamp-2">
          Outrank competitors in real-time. Every listing gets instant live placement, verified badge, dedicated SEO page &amp; dofollow backlink.
        </p>
      </div>

      {/* Quick Outrank Shortcut Badges */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => handleQuickSelect(1, Math.max(1, bid))}
          className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-[#FFFC00] border border-amber-500/30 text-[11px] font-mono font-bold inline-flex items-center gap-1 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Crown className="size-3 fill-current" />
          <span>👑 Outbid #1</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(2, Math.max(1, bid))}
          className="px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[11px] font-mono font-bold inline-flex items-center gap-1 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Award className="size-3" />
          <span>🥈 Outbid #2</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(3, Math.max(1, bid))}
          className="px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold inline-flex items-center gap-1 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Flame className="size-3" />
          <span>🥉 Outbid #3</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect(4, 1)}
          className="px-3 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[11px] font-mono font-bold inline-flex items-center gap-1 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Zap className="size-3 fill-current" />
          <span>🚀 Start from $1</span>
        </button>
      </div>

      {/* Unified Instant Outbid Container */}
      <div className="pt-1 max-w-2xl xl:max-w-3xl mx-auto">
        <div className="p-2.5 sm:p-3 rounded-[22px] bg-white dark:bg-[#1a1c20] border border-border/80 text-left shadow-2xs space-y-2">
          {/* Top Row: URL Input & Instant Yellow Claim Button */}
          <div className="flex items-center justify-between gap-2.5 h-10 sm:h-11 pl-2 sm:pl-2.5 pr-1">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Link2 className="size-4 text-muted-foreground shrink-0 ml-0.5" />
              <input
                ref={ref}
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                onFocus={() => setIsExpanded(true)}
                onClick={() => setIsExpanded(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleClaim();
                }}
                placeholder="yourproduct.com or @twitter"
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:ring-0 font-sans"
              />
            </div>

            <button
              type="button"
              className="h-8 sm:h-9 px-5 sm:px-6 rounded-full shrink-0 font-mono font-black text-xs text-black bg-[#FFFC00] hover:bg-[#e6e300] shadow-xs hover:shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              onClick={handleClaim}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin text-black" />
              ) : (
                <>
                  <Zap className="size-3.5 fill-black" />
                  <span>Claim #{displayRank} for {bidText}</span>
                </>
              )}
            </button>
          </div>

          {/* Expandable Meta Section */}
          {isExpanded && (
            <div className="pt-2 space-y-3 animate-in fade-in-50 duration-200">
              <div className="border-t border-border/60 my-2" />

              {/* Row 1: Category & Twitter Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="relative w-full flex items-center">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 rounded-[16px] bg-zinc-50 dark:bg-background/90 border border-border/80 text-foreground font-sans text-xs sm:text-sm px-3.5 pr-10 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors cursor-pointer shadow-xs"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-card text-foreground py-1.5">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown className="size-4" />
                  </div>
                </div>

                <div className="relative w-full flex items-center">
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="@x_handle (for auto-shoutout)"
                    className="w-full h-11 rounded-[16px] bg-zinc-50 dark:bg-background/90 border border-border/80 text-foreground font-sans text-xs sm:text-sm px-3.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-xs placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              {/* Row 2: List for Sale Toggle */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground block font-sans">List for Sale in Marketplace?</span>
                    <span className="text-[11px] text-muted-foreground block font-sans">Receive buyout offers directly from prospective SaaS buyers</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isForSale}
                    onClick={() => setIsForSale(!isForSale)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isForSale ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isForSale ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isForSale && (
                  <div className="pt-2 animate-in fade-in-50">
                    <input
                      type="text"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                      placeholder="Asking Price ($ USD, e.g. 25000)"
                      className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-black border border-border text-foreground text-xs font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Row: Collapse & Notice */}
              <div className="flex items-center justify-between w-full pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-sans px-3 py-1.5 rounded-full hover:bg-muted transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <ChevronUp className="size-3.5" />
                  Collapse
                </button>

                <div className="text-xs sm:text-sm flex flex-col text-right">
                  <span className="font-bold text-foreground font-mono">1-Click Whop Checkout</span>
                  <span className="text-muted-foreground text-[11px] sm:text-xs">Direct payment &amp; live instant ranking</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs font-mono text-amber-500 pt-1 text-left px-2">
              {error}
            </p>
          )}
        </div>

        <p className="text-xs font-body text-muted-foreground text-center mt-3">
          Every paid listing includes: Live Rank by Bid · Dofollow SEO Backlink · Verified Checkmark · Dedicated Profile Page · Automated X Broadcast
        </p>
      </div>
    </div>
  );
});
