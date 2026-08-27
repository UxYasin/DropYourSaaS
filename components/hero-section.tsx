'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [currentRank, setCurrentRank] = useState<number>(selectedRank || 1);
  const [bid, setBid] = useState<number>(selectedBid !== undefined ? Math.max(1, selectedBid) : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [projectName, setProjectName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [category, setCategory] = useState('SaaS');
  const [isForSale, setIsForSale] = useState(false);
  const [askingPrice, setAskingPrice] = useState('');

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
          projectName: projectName.trim() || undefined,
          oneLiner: oneLiner.trim() || undefined,
          twitterHandle: twitterHandle.trim() || undefined,
          category,
          isForSale,
          askingPrice: isForSale ? askingPrice : undefined,
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

      {/* Unified Instant Outbid Container */}
      <div className="pt-2 max-w-2xl xl:max-w-3xl mx-auto">
        <div className="p-3 sm:p-4 rounded-[26px] bg-white dark:bg-[#1a1c20] border border-border/80 text-left shadow-sm space-y-3">
          {/* Top Row: URL Input & Instant #fe4103 Claim Button */}
          <div className="flex items-center justify-between gap-3 h-12 sm:h-13 pl-2 sm:pl-3 pr-1">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link2 className="size-5 text-muted-foreground shrink-0 ml-1" />
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
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:ring-0 font-sans"
              />
            </div>

            <button
              type="button"
              className="h-10 sm:h-11 px-6 sm:px-8 rounded-full shrink-0 font-mono font-black text-xs sm:text-sm text-white bg-[#fe4103] hover:bg-[#e03800] shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              onClick={handleClaim}
              disabled={isSubmitting}
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
          </div>

          {/* Expandable Meta Section */}
          {isExpanded && (
            <div className="pt-2 space-y-3 animate-in fade-in-50 duration-200">
              <div className="border-t border-border/60 my-2" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                    Product Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Acme SaaS"
                    className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#fe4103] font-sans"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#fe4103] font-sans cursor-pointer"
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="AI">AI Tools</option>
                    <option value="Developer Tools">Developer Tools</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Design Tools">Design Tools</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="No-Code">No-Code</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                  Tagline / One-liner (Optional)
                </label>
                <input
                  type="text"
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                  placeholder="e.g. The fastest way to turn audio into structured notes"
                  className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#fe4103] font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                  X / Twitter Handle (for auto-shoutout on rank change)
                </label>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  placeholder="@yourcompany"
                  className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#fe4103] font-sans"
                />
              </div>

              {/* List for Sale Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                <div>
                  <div className="font-sans font-semibold text-xs text-foreground">
                    List for Sale in Marketplace?
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Receive buyout offers directly from prospective SaaS buyers
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isForSale}
                    onChange={(e) => setIsForSale(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#fe4103]"></div>
                </label>
              </div>

              {isForSale && (
                <div className="animate-in fade-in-50 duration-200">
                  <label className="text-[11px] font-mono text-muted-foreground block mb-1">
                    Asking Price (Optional)
                  </label>
                  <input
                    type="text"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    placeholder="e.g. $15,000 or Open to Offers"
                    className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#fe4103] font-sans"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ^ Collapse
                </button>
                <div className="text-[11px] font-mono text-muted-foreground">
                  <strong className="text-foreground">1-Click Whop Checkout</strong> · Direct payment &amp; live instant ranking
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs font-mono text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              {error}
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground/80 font-mono text-center pt-2">
          Every paid listing includes: Live Rank by Bid · Dofollow SEO Backlink · Verified Checkmark · Dedicated Profile Page · Automated X Broadcast
        </p>
      </div>
    </div>
  );
});
