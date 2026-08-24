'use client';

import { useState, forwardRef } from 'react';
import { Link2, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
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
  const [bid] = useState(selectedBid || 1);
  const [category, setCategory] = useState<string>('SaaS');
  const [twitterHandle, setTwitterHandle] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClaim = async () => {
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

  const currentBid = selectedBid || bid;
  const currentRank = selectedRank || 1;

  return (
    <div className="text-center py-6 sm:py-10 max-w-3xl xl:max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* 5-Second Dynamic Status Pill */}
      <LiveStatsPill />

      {/* Main Hero Headline & Copy */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="font-mono font-black text-4xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-tight text-foreground leading-[1.08]">
          Rank higher.
          <span className="block mt-1 sm:mt-2">
            Get more clicks for{' '}
            <span className="text-[#E0674B] dark:text-[#F0785C]">FREE</span>
          </span>
        </h1>
        <p className="font-body text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl xl:max-w-3xl mx-auto">
          {siteCopy.hero.description}
        </p>
      </div>

      {/* Unified Claim Form Container */}
      <div className="pt-2 max-w-2xl xl:max-w-3xl mx-auto">
        <div className="p-3 sm:p-4 rounded-[26px] bg-white dark:bg-[#25282c] border border-border/80 text-left shadow-sm space-y-3">
          {/* Top Row: Input with Link2 Icon & Single Accent Orange Claim Button */}
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
              className="h-10 sm:h-11 px-6 sm:px-7 rounded-full shrink-0 font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xs hover:shadow active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              onClick={handleClaim}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span>{selectedRank ? `Claim #${selectedRank}` : 'Claim #1 Spot'}</span>
              )}
            </button>
          </div>

          {/* Expandable Section inside the SAME background fill */}
          {isExpanded && (
            <div className="pt-2 space-y-3 animate-in fade-in-50 duration-200">
              {/* Divider line */}
              <div className="border-t border-border/60 my-2" />

              {/* Row 1: Category Dropdown */}
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-1/2 flex items-center">
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
              </div>

              {/* Bottom Row: Collapse, Twitter Handle, Tier Selection */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pt-3 gap-3 border-t border-border/60">
                {/* Left: Collapse Button */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-sans px-3 py-1.5 rounded-full hover:bg-muted transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <ChevronUp className="size-3.5" />
                  Collapse
                </button>

                {/* Right Side Group */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
                  {/* New Twitter Input */}
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="@yourhandle (optional)"
                    className="bg-transparent border-b border-border/80 px-2 py-1 focus:outline-none focus:border-orange-500 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70"
                  />

                  {/* Tier Selection - FLAT STYLE, NO BORDER */}
                  <div className="bg-transparent border-0 p-0 m-0 text-xs sm:text-sm flex flex-col text-left sm:text-right">
                    <span className="font-bold text-foreground">Instant Indexation &amp; Fast-Track</span>
                    <span className="text-muted-foreground text-[11px] sm:text-xs">$5 Fast-Track (Do-Follow + Badge) or Free</span>
                  </div>
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

        {/* Helper Note Below Card */}
        <p className="text-xs font-body text-muted-foreground text-center mt-3">
          Instant submission: Secure real-time leaderboard placement with community voting &amp; analytics.
        </p>
      </div>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={scrapedData}
        bid={currentBid}
        selectedRank={currentRank}
      />
    </div>
  );
});

