'use client';

import { useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Minus, Plus, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { LiveStatsPill } from '@/components/live-stats-pill';
import { SubmissionModal, type ScrapedData } from '@/components/submission-modal';

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
    if (!email.trim()) {
      setError('Enter your email address to continue');
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

  const displayRank = selectedRank || 1;
  const bidText = `$${bid.toLocaleString()}`;
  const isHandle = url.startsWith('@');

  return (
    <section className="text-center overflow-hidden pt-2 pb-2">
      <div className="flex justify-center mb-4">
        <LiveStatsPill />
      </div>
      <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-2xl mx-auto">
        List Your SaaS for{' '}
        <div className="inline-flex items-center gap-1 sm:gap-2 text-primary align-middle justify-center flex-wrap">
          <button
            type="button"
            onClick={handleDecrease}
            className="inline-flex items-center justify-center size-7 sm:size-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex-shrink-0"
            aria-label="Decrease tier amount"
          >
            <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <input
            type="text"
            value={bidText}
            onChange={(e) => {
              const num = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
              if (!isNaN(num) && num >= 1 && num <= 100000) {
                setBid(num);
                onBidChange?.(num);
              }
            }}
            className="bg-transparent border-none outline-none text-primary text-center font-mono font-bold text-3xl sm:text-4xl md:text-5xl p-0 focus:ring-0 w-auto min-w-0"
            size={bidText.length}
          />
          <button
            type="button"
            onClick={handleIncrease}
            className="inline-flex items-center justify-center size-7 sm:size-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex-shrink-0"
            aria-label="Increase tier amount"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </h1>
      <p className="text-muted-foreground mt-3 text-xs sm:text-sm max-w-[60ch] mx-auto leading-relaxed">
        Instant directory indexing starting at $1. Submit your project profile to be featured across
        our verified developer index.
      </p>

      <div className="mt-7 max-w-xl mx-auto px-4">
        {/* Glow wrapper with fixed 24px radius */}
        <div className="relative group/input text-left">
          {/* Animated rainbow glow */}
          <div className="absolute -inset-[2px] rounded-[26px] transition-all duration-300 pointer-events-none animate-rainbow-glow opacity-40 blur-xs group-hover/input:opacity-75 group-hover/input:blur-sm" />
          <div className="absolute -inset-[1px] rounded-[25px] transition-all duration-300 pointer-events-none animate-rainbow-glow opacity-55" />

          {/* 24px Container in both collapsed and expanded states */}
          <div
            className={`relative bg-card border border-border/80 shadow-xl rounded-[24px] transition-all duration-300 ease-out overflow-hidden ${
              isExpanded ? 'p-4 sm:p-5' : 'p-1.5 sm:p-2'
            }`}
          >
            {/* Top Input Row */}
            <div className="flex items-center">
              <div className="relative flex-1 flex items-center min-w-0">
                {isHandle ? (
                  <XIcon className="size-4 sm:size-5 text-muted-foreground ml-3.5 mr-2.5 shrink-0" />
                ) : (
                  <Globe className="size-4 sm:size-5 text-muted-foreground ml-3.5 mr-2.5 shrink-0" />
                )}
                <input
                  ref={ref}
                  type="text"
                  placeholder="SaaS website link or App store link"
                  value={url}
                  onFocus={() => setIsExpanded(true)}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (!isExpanded) setIsExpanded(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleClaim();
                  }}
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
              <div className="mt-4 pt-4 border-t border-border/60 space-y-4 animate-in fade-in-50 duration-200">
                {/* Category & List for Sale Row (50% - 50%) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  {/* Left: Category Dropdown (50%) */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <Tag className="size-3 text-amber-500" />
                        Select Category
                      </label>
                    </div>

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
                  </div>

                  {/* Right: List for Sale (50%) */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <DollarSign className="size-3 text-amber-500" />
                        Marketplace
                      </label>
                    </div>

                    <div className="h-12 p-2.5 rounded-[18px] bg-muted/30 border border-border/70 flex items-center justify-between gap-2 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="min-w-0">
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
                </div>

                {/* Your Email Input */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Mail className="size-3 text-amber-500" />
                      Your Email
                    </label>
                  </div>

                  <div className="relative flex-1 flex items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-12 rounded-[18px] bg-muted/30 border border-border/70 text-foreground font-sans text-xs sm:text-sm px-3.5 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 hover:border-border transition-colors shadow-xs"
                      required
                    />
                  </div>
                </div>

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
                        <span>Scraping & Indexing...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" />
                        <span>{selectedRank ? `Claim #${selectedRank} Spot` : 'Claim #1 Spot'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-destructive mt-2 text-center font-medium">{error}</p>}

        <p className="mt-3.5 text-xs text-muted-foreground leading-relaxed text-center">
          Already listed? Drop in the same link to push your tier higher — you&apos;re only charged the difference.
        </p>
      </div>

      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={scrapedData}
        bid={bid}
        selectedRank={displayRank}
      />
    </section>
  );
});


