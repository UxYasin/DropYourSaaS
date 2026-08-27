'use client';

import { useState, forwardRef } from 'react';
import { Link2, Loader2, ChevronDown, ChevronUp, Sparkles, Crown, Award, Flame, Zap } from 'lucide-react';
import { LiveStatsPill } from '@/components/live-stats-pill';
import { SubmissionModal, type ScrapedData } from '@/components/submission-modal';
import { siteCopy } from '@/lib/copy';
import { CATEGORIES } from '@/lib/categories';

interface HeroSectionProps {
  ref?: React.Ref<HTMLInputElement>;
  selectedRank?: number;
  selectedBid?: number;
  onBidChange?: (bid: number) => void;
}

export const HeroSection = forwardRef<HTMLInputElement, HeroSectionProps>(function HeroSection(
  { selectedRank, selectedBid },
  ref
) {
  const [url, setUrl] = useState('');
  const [currentRank, setCurrentRank] = useState<number>(selectedRank || 1);
  const [bid, setBid] = useState(selectedBid || (selectedRank === 1 ? 50 : selectedRank && selectedRank <= 3 ? 25 : 5));
  const [category, setCategory] = useState<string>('SaaS');
  const [twitterHandle, setTwitterHandle] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClaim = async (rankOverride?: number, bidOverride?: number) => {
    const targetRank = rankOverride || currentRank || 1;
    const targetBid = bidOverride || bid || (targetRank === 1 ? 50 : targetRank <= 3 ? 25 : 5);
    setCurrentRank(targetRank);
    setBid(targetBid);

    if (!url.trim()) {
      setScrapedData({
        title: '',
        description: '',
        favicon: '',
        screenshotUrl: '',
        url: '',
        category,
        isForSale: false,
        email: '',
        twitterHandle,
      });
      setError(null);
      setIsModalOpen(true);
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(url) ? url.trim() : `https://${url.trim().replace(/^@/, '')}`;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const result = await res.json();
      if (result?.success && result?.data) {
        setScrapedData({
          ...result.data,
          category,
          isForSale: false,
          email: '',
          twitterHandle,
        });
      } else {
        let hostname = '';
        try {
          hostname = new URL(normalizedUrl).hostname;
        } catch {}
        setScrapedData({
          title: hostname || normalizedUrl,
          description: '',
          favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
          screenshotUrl: `https://api.microlink.io/?url=${encodeURIComponent(normalizedUrl)}&screenshot=true&meta=false&embed=screenshot.url`,
          url: normalizedUrl,
          hostname,
          category,
          isForSale: false,
          email: '',
          twitterHandle,
        });
      }
      setIsModalOpen(true);
    } catch {
      let hostname = '';
      try {
        hostname = new URL(normalizedUrl).hostname;
      } catch {}
      setScrapedData({
        title: hostname || normalizedUrl,
        description: '',
        favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
        screenshotUrl: `https://api.microlink.io/?url=${encodeURIComponent(normalizedUrl)}&screenshot=true&meta=false&embed=screenshot.url`,
        url: normalizedUrl,
        hostname,
        category,
        isForSale: false,
        email: '',
        twitterHandle,
      });
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-center py-6 sm:py-10 max-w-3xl xl:max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* 5-Second Dynamic Status Pill */}
      <LiveStatsPill />

      {/* Main Hero Headline & Copy */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="font-mono font-black text-4xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-tight text-foreground leading-[1.08]">
          Rank higher.
          <span className="block mt-1 sm:mt-2">
            Get verified clicks &amp;{' '}
            <span className="text-[#FFFC00] bg-black dark:bg-black/90 px-3 py-0.5 rounded-2xl shadow-sm border border-[#FFFC00]/30 inline-block">
              TRAFFIC
            </span>
          </span>
        </h1>
        <p className="font-body text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl xl:max-w-3xl mx-auto">
          {siteCopy.hero.description}
        </p>
      </div>

      {/* Quick Rank Tier Badges */}
      <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto pt-1">
        <button
          type="button"
          onClick={() => handleClaim(1, 50)}
          className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-[#FFFC00] border border-amber-500/30 text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Crown className="size-3.5 fill-current" />
          <span>#1 Top Spot ($50)</span>
        </button>
        <button
          type="button"
          onClick={() => handleClaim(2, 25)}
          className="px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Award className="size-3.5" />
          <span>#2–#3 Podium ($25)</span>
        </button>
        <button
          type="button"
          onClick={() => handleClaim(4, 10)}
          className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Flame className="size-3.5" />
          <span>#4–#10 Bento ($10)</span>
        </button>
        <button
          type="button"
          onClick={() => handleClaim(11, 5)}
          className="px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Zap className="size-3.5 fill-current" />
          <span>Fast-Track ($5)</span>
        </button>
      </div>

      {/* Unified Claim Form Container */}
      <div className="pt-2 max-w-2xl xl:max-w-3xl mx-auto">
        <div className="p-3 sm:p-4 rounded-[26px] bg-white dark:bg-[#1a1c20] border border-border/80 text-left shadow-sm space-y-3">
          {/* Top Row: Input with Link2 Icon & Single Accent Orange/Yellow Claim Button */}
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
                placeholder="yourproduct.com"
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:ring-0 font-sans"
              />
            </div>

            <button
              type="button"
              className="h-10 sm:h-11 px-6 sm:px-7 rounded-full shrink-0 font-mono font-black text-xs sm:text-sm text-black bg-[#FFFC00] hover:bg-[#e6e300] shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              onClick={() => handleClaim()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin text-black" />
              ) : (
                <>
                  <Zap className="size-4 fill-black" />
                  <span>{currentRank ? `Claim #${currentRank}` : 'Claim #1 Spot'}</span>
                </>
              )}
            </button>
          </div>

          {/* Expandable Section */}
          {isExpanded && (
            <div className="pt-2 space-y-3 animate-in fade-in-50 duration-200">
              <div className="border-t border-border/60 my-2" />

              {/* Row 1: Category Dropdown & Twitter Handle Input */}
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
                    placeholder="@x.com/username"
                    className="w-full h-11 rounded-[16px] bg-zinc-50 dark:bg-background/90 border border-border/80 text-foreground font-sans text-xs sm:text-sm px-3.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-xs placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              {/* Bottom Row: Collapse & Tier Note */}
              <div className="flex items-center justify-between w-full pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-sans px-3 py-1.5 rounded-full hover:bg-muted transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <ChevronUp className="size-3.5" />
                  Collapse
                </button>

                <div className="text-xs sm:text-sm flex flex-col text-right">
                  <span className="font-bold text-foreground font-mono">Instant Whop Checkout</span>
                  <span className="text-muted-foreground text-[11px] sm:text-xs">Secure #1, Podium, or Bento ranks immediately</span>
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
          Powered by Whop: Claim higher leaderboard rankings to boost verified traffic and SEO backlinks.
        </p>
      </div>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={scrapedData}
        bid={bid}
        selectedRank={currentRank}
      />
    </div>
  );
});
