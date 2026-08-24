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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClaim = async () => {
    if (!url.trim()) {
      setError('Enter your SaaS website or domain link first');
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
      });
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBid = selectedBid || bid;
  const currentRank = selectedRank || 1;

  return (
    <div className="text-center py-6 sm:py-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* 5-Second Dynamic Status Pill */}
      <LiveStatsPill />

      {/* Main Hero Headline & Copy */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="font-mono font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-foreground leading-[1.1]">
          Rank higher.
          <span className="block mt-1 sm:mt-2">
            Get more clicks for{' '}
            <span className="text-[#E0674B] dark:text-[#F0785C]">FREE</span>
          </span>
        </h1>
        <p className="font-body text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          {siteCopy.hero.description}
        </p>
      </div>

      {/* Unified Claim Form Container */}
      <div className="pt-2 max-w-xl mx-auto">
        <div className="p-3 sm:p-4 rounded-[26px] bg-zinc-200/90 dark:bg-[#25282c] border border-border/60 text-left shadow-xs space-y-3">
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

              {/* Row 1: Category Dropdown & Quick Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                {/* Left: Category dropdown */}
                <div className="relative flex-1 flex items-center">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 rounded-[16px] bg-background/90 border border-border/80 text-foreground font-sans text-xs sm:text-sm px-3.5 pr-10 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors cursor-pointer shadow-xs"
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

                {/* Right: Instant Perks Pill */}
                <div className="h-11 px-3.5 py-2 rounded-[16px] bg-background/90 border border-border/80 flex items-center justify-between gap-2 flex-1">
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-bold font-sans text-foreground truncate flex items-center gap-1">
                      <Sparkles className="size-3 text-amber-500 shrink-0" />
                      Instant Indexation
                    </div>
                    <div className="text-[10px] font-body text-muted-foreground truncate">
                      Do-follow SEO backlink included
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Footer Actions (Collapse only) */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-sans px-3 py-1.5 rounded-full hover:bg-muted transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronUp className="size-3.5" />
                  Collapse
                </button>
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

