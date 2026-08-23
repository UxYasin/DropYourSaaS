'use client';

import { useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Minus, Plus, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { LiveStatsPill } from '@/components/live-stats-pill';
import { SubmissionModal, type ScrapedData } from '@/components/submission-modal';
import { siteCopy, IS_FREE_MODE } from '@/lib/copy';

import { CATEGORIES } from '@/lib/categories';
import { Tag, Sparkles as SparklesIcon, ChevronDown, ChevronUp, DollarSign, Mail } from 'lucide-react';

const XIcon = ({ className, ...props }: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
    if (isForSale && !email.trim()) {
      setError('Enter your email address to list your project for sale');
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
          isForSale,
          email,
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
          email,
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
        email,
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
          {siteCopy.hero.headline}
        </h1>
        <p className="font-body text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          {siteCopy.hero.description}
        </p>
      </div>

      {/* Claim Spot Card Form */}
      <div className="pt-2">
        <div className="p-3.5 sm:p-4 rounded-[26px] bg-card border border-border/80 shadow-md transition-all duration-200 hover:shadow-lg">
          <div className="space-y-3">
            {/* Input & Action Bar */}
            <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-[20px] bg-muted/40 border border-border/60 focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <div className="flex items-center gap-2 flex-1 min-w-0 pl-2">
                <Globe className="size-4 text-muted-foreground shrink-0" />
                <input
                  ref={ref}
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleClaim();
                  }}
                  placeholder={siteCopy.hero.urlPlaceholder}
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 pr-2 focus:ring-0 font-sans"
                />
              </div>

              {!isExpanded && (
                <button
                  type="button"
                  className="h-10 sm:h-11 px-5 sm:px-6 rounded-[18px] shrink-0 font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xs hover:shadow active:scale-95 transition-all flex items-center gap-1.5"
                  onClick={() => setIsExpanded(true)}
                >
                  <Plus className="size-3.5 sm:size-4" />
                  <span>{selectedRank ? `Claim #${selectedRank}` : 'Claim #1'}</span>
                </button>
              )}
            </div>

            {/* Expanded Content Section */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-border/60 space-y-3 animate-in fade-in-50 duration-200">
                {/* Category & List for Sale Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  {/* Left: Category Dropdown */}
                  <div className="relative flex-1 flex items-center">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-12 rounded-[18px] bg-muted/30 border border-border/70 text-foreground font-sans text-xs sm:text-sm px-3.5 pr-10 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 hover:border-border transition-colors cursor-pointer shadow-xs"
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

                  {/* Right: List for Sale */}
                  <div className="h-12 p-2.5 rounded-[18px] bg-muted/30 border border-border/70 flex items-center justify-between gap-2 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold font-sans text-foreground truncate">
                          List for Sale?
                        </div>
                        <div className="text-[10px] font-body text-muted-foreground truncate">
                          Feature in Buy/Sell
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isForSale}
                      onClick={() => setIsForSale(!isForSale)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isForSale ? 'bg-emerald-500' : 'bg-zinc-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isForSale ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Conditional Email Input (Only when List for Sale is enabled) */}
                {isForSale && (
                  <div className="space-y-1 animate-in fade-in-50 duration-200 text-left">
                    <div className="relative flex-1 flex items-center">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-12 rounded-[18px] bg-muted/30 border border-border/70 text-foreground font-sans text-xs sm:text-sm px-3.5 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 hover:border-border transition-colors shadow-xs"
                        required={isForSale}
                      />
                    </div>
                    <p className="text-[11px] font-body text-muted-foreground px-1">
                      Required to receive buyer bids and direct acquisition inquiries.
                    </p>
                  </div>
                )}

                {/* Expanded Action Buttons Row */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="text-xs text-muted-foreground hover:text-foreground font-sans px-3 py-2 rounded-full hover:bg-muted/50 transition-colors inline-flex items-center gap-1"
                  >
                    <ChevronUp className="size-3.5" />
                    Collapse
                  </button>

                  <button
                    type="button"
                    className="h-11 px-6 sm:px-8 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2"
                    onClick={handleClaim}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Fetching SaaS Meta...
                      </>
                    ) : (
                      <span>{selectedRank ? `Claim #${selectedRank}` : 'Claim Spot #1'}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs font-mono text-amber-500 pt-1 text-left px-2 animate-in fade-in-50 duration-150">
                {error}
              </p>
            )}
          </div>
        </div>
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
