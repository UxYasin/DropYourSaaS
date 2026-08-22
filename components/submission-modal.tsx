'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Globe, Sparkles, ExternalLink, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

import { CATEGORIES } from '@/lib/categories';

export interface ScrapedData {
  title: string;
  description: string;
  favicon: string;
  screenshotUrl: string;
  url: string;
  hostname?: string;
  category?: string;
  isForSale?: boolean;
  askingPrice?: string;
}

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ScrapedData | null;
  bid: number;
  selectedRank?: number;
  onSuccess?: () => void;
}

export function SubmissionModal({
  isOpen,
  onClose,
  initialData,
  bid,
  selectedRank = 1,
  onSuccess,
}: SubmissionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [favicon, setFavicon] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [category, setCategory] = useState('SaaS');
  const [isForSale, setIsForSale] = useState(false);
  const [askingPrice, setAskingPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setUrl(initialData.url || '');
      setFavicon(initialData.favicon || '');
      setScreenshotUrl(initialData.screenshotUrl || '');
      setCategory(initialData.category || 'SaaS');
      setIsForSale(Boolean(initialData.isForSale));
      setAskingPrice(initialData.askingPrice || '');
    }
  }, [initialData]);

  if (!isOpen || !initialData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid URL');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    trackEvent('checkout_started', {
      url,
      bid,
      title,
      rank: selectedRank,
    });

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          bid,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to initiate submission checkout');
        return;
      }

      onSuccess?.();
      window.location.href = data.checkoutUrl;
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="font-mono font-bold text-lg text-white">Preview & Confirm SaaS</h2>
            <p className="font-body text-xs text-zinc-400">
              Verified metadata fetched via live Cheerio scraper. Edit details before listing.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 text-xs font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Live Preview Card */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-start gap-3.5">
            <div className="size-11 rounded-lg bg-black p-1 border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
              {favicon ? (
                <Image
                  src={favicon}
                  alt={title || 'Logo'}
                  width={36}
                  height={36}
                  className="size-full object-contain rounded"
                  unoptimized
                />
              ) : (
                <Globe className="size-5 text-zinc-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-white truncate">
                  {title || url}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-primary/20 text-primary font-bold">
                  #{selectedRank} Spot · ${bid}
                </span>
              </div>
              <p className="font-body text-xs text-zinc-400 line-clamp-2 mt-0.5">
                {description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
              Product Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MySaaS — The AI Workflow Tool"
              className="bg-zinc-900 border-zinc-800 text-white font-sans text-xs sm:text-sm h-10 rounded-xl focus-visible:ring-primary"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
              Tagline / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of what your software does..."
              className="w-full bg-zinc-900 border border-zinc-800 text-white font-body text-xs sm:text-sm rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Destination URL Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
              Destination Link
            </label>
            <div className="relative">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourproject.com"
                className="bg-zinc-900 border-zinc-800 text-zinc-300 font-mono text-xs h-10 rounded-xl pr-9 focus-visible:ring-primary"
                required
              />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1"
                title="Test destination link"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>

          {/* Category & For Sale Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white font-sans text-xs h-10 rounded-xl px-3 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-950 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                Marketplace
              </label>
              <button
                type="button"
                onClick={() => setIsForSale(!isForSale)}
                className={`w-full h-10 px-3 rounded-xl border text-xs font-sans font-medium flex items-center justify-between transition-colors ${
                  isForSale
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>List for Sale?</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isForSale ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {isForSale ? 'YES' : 'NO'}
                </span>
              </button>
            </div>
          </div>

          {/* Asking Price if For Sale */}
          {isForSale && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-in fade-in-0 duration-150">
              <label className="block text-xs font-medium text-amber-300 mb-1 font-sans">
                Asking Price / Valuation
              </label>
              <Input
                type="text"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="e.g. $5,000 or Open to Offers"
                className="bg-zinc-950/80 border-amber-500/40 text-white font-sans text-xs h-9 rounded-lg"
              />
              <p className="text-[10px] text-amber-300/80 mt-1 font-body">
                ⭐ Your project will be indexed in both Directory and Buy/Sell Marketplace.
              </p>
            </div>
          )}

          {/* Screenshot / OG Image preview banner */}
          {screenshotUrl && (
            <div className="pt-1">
              <label className="block text-xs font-medium text-zinc-400 mb-1 font-sans flex items-center gap-1">
                <ImageIcon className="size-3 text-zinc-400" />
                Featured Preview
              </label>
              <div className="relative h-24 w-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                <Image
                  src={screenshotUrl}
                  alt="Website preview"
                  fill
                  className="object-cover opacity-90"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-1/3 rounded-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 font-sans text-xs h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-white text-black hover:bg-zinc-200 font-sans font-bold text-xs sm:text-sm h-11 shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Securing Spot...
                </>
              ) : (
                <>
                  Save & Continue (${bid})
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
