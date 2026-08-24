'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Globe, Sparkles, ExternalLink, ArrowRight, Loader2, Image as ImageIcon, AlertCircle, Check, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { IS_FREE_MODE } from '@/lib/copy';
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
  email?: string;
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
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [favicon, setFavicon] = useState(initialData?.favicon || '');
  const [screenshotUrl, setScreenshotUrl] = useState(initialData?.screenshotUrl || '');
  const [category, setCategory] = useState(initialData?.category || 'SaaS');
  const [isForSale, setIsForSale] = useState(initialData?.isForSale || false);
  const [email, setEmail] = useState(initialData?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<'free' | 'fast_track'>('fast_track');

  // Sync state when new initialData arrives
  const initialUrl = initialData?.url;
  const [prevUrl, setPrevUrl] = useState(initialUrl);
  if (initialUrl !== prevUrl) {
    setPrevUrl(initialUrl);
    setTitle(initialData?.title || '');
    setDescription(initialData?.description || '');
    setUrl(initialData?.url || '');
    setFavicon(initialData?.favicon || '');
    setScreenshotUrl(initialData?.screenshotUrl || '');
    setCategory(initialData?.category || 'SaaS');
    setIsForSale(initialData?.isForSale || false);
    setEmail(initialData?.email || '');
    setError(null);
    setRateLimitError(null);
  }

  if (!isOpen || !initialData || typeof document === 'undefined') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid URL');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setRateLimitError(null);

    trackEvent('checkout_started', {
      url,
      bid,
      title,
      tier: selectedTier,
    });

    try {
      // 1. Submit listing record to /api/submit
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          faviconUrl: favicon || undefined,
          screenshotUrl: screenshotUrl || undefined,
          category: category || 'SaaS',
          forSale: isForSale,
          email: email.trim() || undefined,
          targetRank: selectedRank,
          tier: selectedTier,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.rateLimited) {
          setRateLimitError(data.error || 'Submission limit reached for this domain. Please try again later.');
          setIsSubmitting(false);
          return;
        }
        setError(data.error || 'Failed to submit listing. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const listingId = data.id || data.listingId || url;

      // 2. If Fast-Track ($5), route to Whop checkout immediately
      if (selectedTier === 'fast_track') {
        const checkoutRes = await fetch('/api/checkout/whop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 5,
            listingId,
            siteUrl: url.trim(),
            projectName: title.trim() || url.trim(),
            oneLiner: description.trim() || undefined,
            logoUrl: favicon || undefined,
          }),
        });

        const checkoutData = await checkoutRes.json();
        const redirectUrl = checkoutData?.url || checkoutData?.checkoutUrl;

        if (checkoutRes.ok && redirectUrl) {
          onSuccess?.();
          window.location.href = redirectUrl;
          return;
        }
      }

      // 3. Free tier or fallback
      onSuccess?.();
      onClose();
      if (data.immediate || data.verified) {
        router.push('/?verified=true');
      } else {
        router.push(data.redirectUrl || `/thank-you?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err: unknown) {
      console.error('Submission catch error:', err);
      setError('An unexpected network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-900 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-mono font-bold text-lg text-white truncate">Preview &amp; Confirm SaaS</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold shrink-0">
                Spot #{selectedRank}
              </span>
            </div>
            <p className="font-body text-xs text-zinc-400 mt-0.5">
              Verified metadata fetched via live Cheerio scraper. Confirm details to feature in Spot #{selectedRank}.
            </p>
          </div>
        </div>

        {rateLimitError && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-950/40 border border-[#FF8B06] text-[#FF8B06] font-mono text-xs flex items-center gap-2.5 animate-in fade-in-50 duration-200">
            <AlertCircle className="size-4 shrink-0 text-[#FF8B06]" />
            <span className="font-semibold">{rateLimitError}</span>
          </div>
        )}

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
                  #{selectedRank} Spot · {IS_FREE_MODE ? 'FREE' : `$${bid}`}
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
            <div className="w-full">
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white font-sans text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              <div className="w-full h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-sans font-medium flex items-center justify-between">
                <span className="text-zinc-300">List for Sale?</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isForSale}
                  onClick={() => setIsForSale(!isForSale)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isForSale ? 'bg-emerald-500' : 'bg-zinc-700'
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

          {/* Contact Email */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-300 font-sans">
              Contact / Founder Email {isForSale ? <span className="text-emerald-400 font-bold">(Required for Marketplace)</span> : <span className="text-zinc-500 font-normal">(Optional)</span>}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@yourproduct.com"
              className="bg-zinc-900 border-zinc-800 text-white font-sans text-xs sm:text-sm h-10 rounded-xl focus-visible:ring-amber-500"
              required={isForSale}
            />
            {isForSale && (
              <p className="text-[11px] font-body text-emerald-400/90 leading-snug">
                Buyers on the /buy-sell marketplace will use this email for direct acquisition inquiries.
              </p>
            )}
          </div>

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

          {/* Tier Selection (Free vs $5 Fast-Track) */}
          <div className="space-y-2 pt-2 text-left">
            <label className="block text-xs font-semibold text-zinc-300 font-sans">
              Choose Publishing Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* $5 Fast-Track Tier */}
              <div
                onClick={() => setSelectedTier('fast_track')}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-left ${
                  selectedTier === 'fast_track'
                    ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/40 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <span className="text-amber-400 font-mono">⚡</span>
                    <span>Fast-Track</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-600 text-white shadow-xs">
                    $5 One-Time
                  </span>
                </div>
                <ul className="text-[11px] text-zinc-300 space-y-1 font-sans leading-snug">
                  <li className="flex items-center gap-1.5 text-blue-400 font-medium">
                    <Check className="size-3.5 shrink-0 text-blue-400" />
                    <span>Instant Go-Live (Skip queue)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 shrink-0 text-blue-400" />
                    <span>Permanent Do-Follow Backlink</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="size-3.5 shrink-0 text-blue-400" />
                    <span>Verified Blue Badge</span>
                  </li>
                </ul>
              </div>

              {/* Free Tier */}
              <div
                onClick={() => setSelectedTier('free')}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-left ${
                  selectedTier === 'free'
                    ? 'bg-zinc-800/80 border-zinc-500 ring-2 ring-zinc-500/40 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Standard Free</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                    $0 Free
                  </span>
                </div>
                <ul className="text-[11px] text-zinc-400 space-y-1 font-sans leading-snug">
                  <li>• Standard review queue</li>
                  <li>• Nofollow SEO backlink</li>
                  <li>• No verified checkmark</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-sans font-bold text-xs sm:text-sm h-11 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || Boolean(rateLimitError)}
              className={`flex-1 rounded-full text-white font-sans font-bold text-xs sm:text-sm h-11 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                selectedTier === 'fast_track'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : selectedTier === 'fast_track' ? (
                <>
                  <Zap className="size-4 text-amber-300 fill-amber-300" />
                  <span>Fast-Track &amp; Verify ($5)</span>
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  <span>Publish Free Listing #{selectedRank}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
