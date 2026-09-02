'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  X,
  Globe,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Loader2,
  Zap,
  Crown,
  Award,
  Flame,
} from 'lucide-react';
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
  email?: string;
  twitterHandle?: string;
}

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ScrapedData | null;
  bid: number;
  selectedRank?: number;
  onSuccess?: () => void;
}

type RankTierType = 'top1' | 'podium' | 'bento' | 'fast_track';

export function SubmissionModal({
  isOpen,
  onClose,
  initialData,
  selectedRank = 1,
  onSuccess,
}: SubmissionModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [favicon, setFavicon] = useState(initialData?.favicon || '');
  const [screenshotUrl, setScreenshotUrl] = useState(initialData?.screenshotUrl || '');
  const [category, setCategory] = useState(initialData?.category || 'SaaS');
  const [isForSale, setIsForSale] = useState(initialData?.isForSale || false);
  const [email, setEmail] = useState(initialData?.email || '');
  const [twitterHandle, setTwitterHandle] = useState(initialData?.twitterHandle || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [askingPrice, setAskingPrice] = useState(initialData?.askingPrice || '');

  // Dynamic Pay-to-Rank Tier State
  const initialTier: RankTierType =
    selectedRank === 1
      ? 'top1'
      : selectedRank <= 3
        ? 'podium'
        : selectedRank <= 10
          ? 'bento'
          : 'fast_track';

  const [selectedTier, setSelectedTier] = useState<RankTierType>(initialTier);

  // Determine current active rank & amount
  let activeRank = selectedRank;
  let activeAmount = 5;

  if (selectedTier === 'top1') {
    activeRank = 1;
    activeAmount = 50;
  } else if (selectedTier === 'podium') {
    activeRank = selectedRank === 2 || selectedRank === 3 ? selectedRank : 2;
    activeAmount = 25;
  } else if (selectedTier === 'bento') {
    activeRank = selectedRank >= 4 && selectedRank <= 10 ? selectedRank : 4;
    activeAmount = 10;
  } else if (selectedTier === 'fast_track') {
    activeRank = selectedRank > 10 ? selectedRank : 11;
    activeAmount = 5;
  }

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
    setAskingPrice(initialData?.askingPrice || '');
    setEmail(initialData?.email || '');
    setTwitterHandle(initialData?.twitterHandle || '');
    setError(null);
    setSelectedTier(initialTier);
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

    trackEvent('checkout_started', {
      url,
      rank: activeRank,
      amount: activeAmount,
      title,
      tier: selectedTier,
    });

    try {
      // 1. Submit pending listing record to /api/submit
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || undefined,
          name: title.trim() || undefined,
          description: description.trim() || undefined,
          valueProposition: description.trim() || undefined,
          faviconUrl: favicon || undefined,
          screenshotUrl: screenshotUrl || undefined,
          category: category || 'SaaS',
          forSale: isForSale,
          isForSale,
          askingPrice: isForSale ? askingPrice.trim() : undefined,
          email: email.trim() || undefined,
          twitterHandle: twitterHandle.trim() || undefined,
          targetRank: activeRank,
          selectedRank: activeRank,
          bid: activeAmount,
          tier: selectedTier,
        }),
      });

      const data = await res.json();
      const listingId = data.id || data.listingId || url.trim();

      // 2. Initialize Whop SDK Checkout with exact rank, amount, and metadata
      const checkoutRes = await fetch('/api/checkout/whop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeAmount,
          targetRank: activeRank,
          tier: selectedTier,
          listingId,
          siteUrl: url.trim(),
          projectName: title.trim() || url.trim(),
          oneLiner: description.trim() || undefined,
          logoUrl: favicon || undefined,
          twitterHandle: twitterHandle.trim() || undefined,
          category,
          email: email.trim() || undefined,
        }),
      });

      const checkoutData = await checkoutRes.json();
      const redirectUrl = checkoutData?.url || checkoutData?.checkoutUrl;

      if (checkoutRes.ok && redirectUrl) {
        onSuccess?.();
        window.location.href = redirectUrl;
        return;
      }

      setError('Could not initialize checkout. Please try again.');
    } catch (err: unknown) {
      console.error('Submission catch error:', err);
      setError('An unexpected network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 sm:py-8 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl lg:max-w-3xl bg-white dark:bg-[#121316] text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-4 shrink-0 bg-zinc-50/70 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-[#FFFC00] shrink-0 shadow-2xs">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-bold text-base sm:text-lg text-zinc-900 dark:text-white truncate">
                  Publish &amp; Claim High Rank
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-xs font-sans font-bold shrink-0">
                  Target Rank #{activeRank}
                </span>
              </div>
              <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Select your desired rank tier. Instant live placement upon Whop checkout confirmation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="submission-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-left">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-sans">
              {error}
            </div>
          )}

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3.5">
            <div className="size-12 rounded-xl bg-white dark:bg-black p-1.5 border border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
              {favicon ? (
                <Image
                  src={favicon}
                  alt={title || 'Logo'}
                  width={40}
                  height={40}
                  className="size-full object-contain rounded"
                  unoptimized
                />
              ) : (
                <Globe className="size-6 text-zinc-400 dark:text-zinc-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                  {title || url || 'Your SaaS Product'}
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
                  Target #{activeRank} · ${activeAmount}
                </span>
              </div>
              <p className="font-body text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                {description || 'Short summary of what your software does...'}
              </p>
            </div>
          </div>

          {/* STEP 1: Select Placement Tier */}
          <div className="space-y-3 pt-1 text-left">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans">
                1. Choose Your Preferred Placement Tier
              </label>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                Powered by Whop Payments
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tier 1: Spot #1 (Billboard / Hero) */}
              <div
                onClick={() => setSelectedTier('top1')}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 text-left ${
                  selectedTier === 'top1'
                    ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40 text-zinc-900 dark:text-white shadow-md'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                    <Crown className="size-4" />
                    <span>👑 Rank #1 Spotlight</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-sans font-bold bg-amber-500 text-zinc-950 shadow-xs">
                    $50
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-sans leading-snug">
                  Maximum top visibility, 2x click conversion, verified gold badge &amp; dofollow SEO link.
                </p>
              </div>

              {/* Tier 2: Podium Top 2 & 3 */}
              <div
                onClick={() => setSelectedTier('podium')}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 text-left ${
                  selectedTier === 'podium'
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/40 text-zinc-900 dark:text-white shadow-md'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-primary">
                    <Award className="size-4" />
                    <span>#2–#3 Podium</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-sans font-bold bg-primary text-white shadow-xs">
                    $25
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-sans leading-snug">
                  High-contrast podium cards with large preview images, verified checkmark.
                </p>
              </div>

              {/* Tier 3: Bento Featured (#4–#10) */}
              <div
                onClick={() => setSelectedTier('bento')}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 text-left ${
                  selectedTier === 'bento'
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 text-zinc-900 dark:text-white shadow-md'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                    <Flame className="size-4" />
                    <span>#4–#10 Bento</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-600 text-white shadow-xs">
                    $10
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-sans leading-snug">
                  Vibrant pastel Bento card styling, guaranteed top 10 discovery, dofollow link.
                </p>
              </div>

              {/* Tier 4: Fast-Track (#11+) */}
              <div
                onClick={() => setSelectedTier('fast_track')}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 text-left ${
                  selectedTier === 'fast_track'
                    ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 text-zinc-900 dark:text-white shadow-md'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-purple-600 dark:text-purple-400">
                    <Zap className="size-4 fill-current" />
                    <span>#11+ Fast-Track</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-600 text-white shadow-xs">
                    $5
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-sans leading-snug">
                  Instant live listing, verified badge, permanent SEO backlink, skip queues.
                </p>
              </div>
            </div>
          </div>

          {/* Grid Row 1: Title & Destination Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                Product Title
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MySaaS — AI Productivity Tool"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-sans text-xs sm:text-sm h-10.5 rounded-xl focus-visible:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                Destination Link
              </label>
              <div className="relative">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourproject.com"
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 font-mono text-xs h-10.5 rounded-xl pr-9 focus-visible:ring-primary"
                  required
                />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white p-1"
                  title="Test destination link"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
              Tagline / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of what your software does..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-body text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none shadow-xs"
            />
          </div>

          {/* Grid Row 2: Category & Marketplace Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-sans text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                Marketplace Acquisition
              </label>
              <div className="w-full h-10.5 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-sans font-medium flex items-center justify-between shadow-xs">
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">List for Sale?</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isForSale}
                  onClick={() => setIsForSale(!isForSale)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isForSale ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
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

          {/* Grid Row 3: Founder Email & X/Twitter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-sans">
                Contact Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@yourproduct.com"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-sans text-xs sm:text-sm h-10.5 rounded-xl focus-visible:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-sans">
                X / Twitter Username
              </label>
              <Input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@username (for auto-shoutout)"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-sans text-xs sm:text-sm h-10.5 rounded-xl focus-visible:ring-amber-500"
              />
            </div>

            {isForSale && (
              <div className="space-y-1 animate-in fade-in-50 duration-200 sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-sans">
                  Asking Price ($ USD) <span className="text-emerald-600 dark:text-emerald-400 font-bold">*</span>
                </label>
                <Input
                  type="text"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="e.g. $15,000"
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-mono text-xs sm:text-sm h-10.5 rounded-xl focus-visible:ring-emerald-500"
                  required={isForSale}
                />
              </div>
            )}
          </div>
        </form>

        {/* Fixed Sticky Action Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center gap-3 shrink-0">
          <Button
            type="button"
            onClick={onClose}
            className="w-1/3 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-sans font-bold text-xs sm:text-sm h-11 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="submission-form"
            disabled={isSubmitting}
            className="flex-1 rounded-full text-white font-mono font-black text-xs sm:text-sm h-11 shadow-lg bg-[#fe4103] hover:bg-[#e03800] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin text-white" />
                <span>Redirecting to Whop...</span>
              </>
            ) : (
              <>
                <Zap className="size-4 fill-white text-white" />
                <span>Pay &amp; Secure Rank #{activeRank} (${activeAmount})</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
