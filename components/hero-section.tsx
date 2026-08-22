'use client';

import { useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Minus, Plus } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!url.trim()) {
      setError('Enter a URL or @handle first');
      return;
    }
    const normalizedUrl = /^https?:\/\//.test(url) ? url : `https://${url.replace(/^@/, '')}`;

    trackEvent('checkout_started', { url: normalizedUrl, bid });

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl, bid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError('Something went wrong');
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
    <section className="text-center overflow-hidden pt-4 pb-2">
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
        {/* Glow wrapper */}
        <div className="relative group/input">
          {/* Subtle animated rainbow glow */}
          <div className="absolute -inset-[2px] rounded-full animate-rainbow-glow opacity-40 blur-xs group-hover/input:opacity-75 group-hover/input:blur-sm transition-all duration-300 pointer-events-none" />
          <div className="absolute -inset-[1px] rounded-full animate-rainbow-glow opacity-55 pointer-events-none" />

          {/* Unified larger capsule container */}
          <div className="relative flex items-center bg-card rounded-full border border-border/80 p-1.5 sm:p-2 shadow-md transition-all">
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
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleClaim();
                }}
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 pr-2 focus:ring-0"
              />
            </div>
            <button
              type="button"
              className="h-10 sm:h-11 px-5 sm:px-6 rounded-full shrink-0 font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xs hover:shadow active:scale-95 transition-all flex items-center gap-1.5"
              onClick={handleClaim}
              disabled={isSubmitting}
            >
              <Plus className="size-3.5 sm:size-4" />
              <span>{isSubmitting ? 'Redirecting…' : selectedRank ? `Claim #${selectedRank}` : 'Claim #1'}</span>
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-destructive mt-2 text-center font-medium">{error}</p>}
        
        <p className="mt-3.5 text-xs text-muted-foreground leading-relaxed text-center">
          Already listed? Drop in the same link to push your tier higher — you&apos;re only charged the difference.
        </p>
      </div>
    </section>
  );
});
