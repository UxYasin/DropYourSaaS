'use client';

import { useState, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link2, Plus, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { LiveStatsPill } from '@/components/live-stats-pill';
import { SubmissionModal, type ScrapedData } from '@/components/submission-modal';
import { siteCopy } from '@/lib/copy';

interface HeroSectionProps {
  ref?: React.Ref<HTMLInputElement>;
  selectedRank?: number;
  selectedBid?: number;
  onBidChange?: (bid: number) => void;
}

export const HeroSection = forwardRef<HTMLInputElement, HeroSectionProps>(function HeroSection(
  { selectedRank, selectedBid, onBidChange },
  ref
) {
  const [url, setUrl] = useState('');
  const [bid, setBid] = useState(selectedBid || 1);
  const [category, setCategory] = useState<string>('SaaS');
  const [isForSale, setIsForSale] = useState(false);
  const [email, setEmail] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClaim = async () => {
    if (!url.trim()) {
      setError('Enter a SaaS website link or App store link first');
      return;
    }
    if (isForSale) {
      if (!email.trim()) {
        setError('Enter your email address to list your project for sale');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address');
        return;
      }
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
          isForSale,
          email: isForSale ? email : '',
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
          isForSale,
          email: isForSale ? email : '',
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
        isForSale,
        email: isForSale ? email : '',
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
        <h1 className="font-mono font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-[1.1]">
          {siteCopy.hero.headline.split(/(Free|FREE)/i).map((part, i) =>
            /^(Free|FREE)$/i.test(part) ? (
              <span key={i} className="text-orange-500 dark:text-orange-400">
                {part}
              </span>
            ) : (
              part
            )
          )}
        </h1>
        <p className="font-body text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          {siteCopy.hero.description}
        </p>
      </div>

      {/* Unified Claim Form Container */}
      <div className="pt-2 max-w-xl mx-auto">
        <div className="p-3 sm:p-4 rounded-[26px] bg-[#e3e5e8] dark:bg-[#25282c] border border-border/40 text-left shadow-xs space-y-3">
          {/* Top Row: Input with Link2 Icon & Single Accent Orange Claim Button */}
          <div className="flex items-center justify-between gap-3 h-12 sm:h-13 pl-2 sm:pl-3 pr-1">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link2 className="size-5 text-slate-500 dark:text-slate-400 shrink-0 ml-1" />
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
                placeholder="Your SaaS URL or X"
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-foreground placeholder:text-slate-500/80 dark:placeholder:text-slate-400/70 focus:ring-0 font-sans"
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
                <span>{selectedRank ? `Claim #${selectedRank}` : 'Claim #1'}</span>
              )}
            </button>
          </div>

          {/* Expandable Section inside the SAME background fill */}
          {isExpanded && (
            <div className="pt-2 space-y-3 animate-in fade-in-50 duration-200">
              {/* Divider line */}
              <div className="border-t border-slate-300/80 dark:border-slate-700/60 my-2" />

              {/* Row 1: Category & List for Sale Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                {/* Left: Category dropdown */}
                <div className="relative flex-1 flex items-center">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 rounded-[16px] bg-white/90 dark:bg-zinc-900/90 border border-slate-300/80 dark:border-zinc-700/80 text-foreground font-sans text-xs sm:text-sm px-3.5 pr-10 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors cursor-pointer shadow-xs"
                  >
                    {['SaaS', 'AI Tool', 'Mobile App', 'Developer Tool', 'Productivity', 'Marketing'].map((cat) => (
                      <option key={cat} value={cat} className="bg-card text-foreground py-1.5">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ChevronDown className="size-4" />
                  </div>
                </div>

                {/* Right: "List for Sale?" Switch / Toggle */}
                <div className="h-11 px-3.5 py-2 rounded-[16px] bg-white/90 dark:bg-zinc-900/90 border border-slate-300/80 dark:border-zinc-700/80 flex items-center justify-between gap-2 flex-1">
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-bold font-sans text-foreground truncate">
                      List for Sale?
                    </div>
                    <div className="text-[10px] font-body text-muted-foreground truncate">
                      Feature in Buy/Sell
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isForSale}
                    onClick={() => setIsForSale(!isForSale)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isForSale ? 'bg-emerald-500' : 'bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isForSale ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Row 2: Conditional Email Field */}
              {isForSale && (
                <div className="space-y-1 text-left">
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="you@example.com"
                      className="w-full h-11 rounded-[16px] bg-white/90 dark:bg-zinc-900/90 border border-slate-300/80 dark:border-zinc-700/80 text-foreground font-sans text-xs sm:text-sm px-3.5 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-xs"
                      required={isForSale}
                    />
                  </div>
                  <p className="text-[11px] font-body text-muted-foreground px-1">
                    Required to receive buyer bids and acquisition inquiries
                  </p>
                </div>
              )}

              {/* Row 3: Footer Actions (Collapse only - single claim button is in top bar) */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-sans px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronUp className="size-3.5" />
                  ^ Collapse
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
          Already listed? Re-submit your project link after 24 hours to refresh your placement.
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
