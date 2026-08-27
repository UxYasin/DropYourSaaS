'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pin, Sparkles, Loader2, ArrowRight, Globe } from 'lucide-react';
import { FaviconImage } from '@/components/favicon-image';

interface PinAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotPosition?: string; // e.g. 'left_1', 'left_3', 'right_2'
  defaultSiteUrl?: string;
  defaultProjectName?: string;
}

export function formatSlotLabel(slot: string = 'left_1') {
  const parts = slot.split('_');
  if (parts.length === 2) {
    const side = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    return `${side} Rail • Slot #${parts[1]}`;
  }
  return slot;
}

export function PinAdModal({
  isOpen,
  onClose,
  slotPosition = 'left_1',
  defaultSiteUrl = '',
  defaultProjectName = '',
}: PinAdModalProps) {
  // 1. Clean state initialization
  const [siteUrl, setSiteUrl] = useState(defaultSiteUrl);
  const [productName, setProductName] = useState(defaultProjectName);
  const [oneLiner, setOneLiner] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset all fields whenever modal opens or slot changes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevSlot, setPrevSlot] = useState(slotPosition);
  if (isOpen !== prevIsOpen || slotPosition !== prevSlot) {
    setPrevIsOpen(isOpen);
    setPrevSlot(slotPosition);
    if (isOpen) {
      setSiteUrl(defaultSiteUrl);
      setProductName(defaultProjectName);
      setOneLiner('');
      setIconUrl('');
      setIsScraping(false);
      setIsSubmitting(false);
      setErrorMsg('');
    }
  }

  // 2. Debounced auto-scraping (400ms) on siteUrl input
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = siteUrl.trim();
    if (trimmed.length < 4 || !trimmed.includes('.')) {
      return;
    }

    let isCancelled = false;

    const timer = setTimeout(async () => {
      if (isCancelled) return;
      setIsScraping(true);

      let normalized = trimmed;
      if (!/^https?:\/\//i.test(normalized)) {
        normalized = `https://${normalized.replace(/^@/, '')}`;
      }

      try {
        const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(normalized)}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data?.title) {
            setProductName(data.title);
          } else if (data?.hostname) {
            setProductName(data.hostname);
          }
          if (data?.description) {
            setOneLiner(data.description);
          }
          if (data?.favicon) {
            setIconUrl(data.favicon);
          } else {
            try {
              const domain = new URL(normalized).hostname;
              setIconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Auto-scraping metadata error:', err);
      } finally {
        if (!isCancelled) {
          setIsScraping(false);
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [siteUrl, isOpen]);

  // 3. Click-to-Pay Redirect
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!siteUrl.trim()) {
      setErrorMsg('Please enter your website URL to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Record lead in ad_requests
      await fetch('/api/ads/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_url: siteUrl.trim(),
          project_name: productName.trim() || siteUrl.trim(),
          one_liner: oneLiner.trim() || 'Verified sponsor on DropYourSaaS',
          contact_email: 'whop-buyer@dropyoursaas.com',
          slot_position: slotPosition,
        }),
      }).catch(() => {});

      // Request direct Whop Checkout
      const checkoutRes = await fetch('/api/checkout/whop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          slotPosition,
          siteUrl: siteUrl.trim(),
          projectName: productName.trim() || siteUrl.trim(),
          oneLiner: oneLiner.trim() || 'Verified sponsor on DropYourSaaS',
          iconUrl: iconUrl || undefined,
          logoUrl: iconUrl || undefined,
        }),
      });

      const checkoutData = await checkoutRes.json();
      const redirectUrl = checkoutData?.url || checkoutData?.checkoutUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      setErrorMsg(checkoutData?.error || 'Failed to initialize Whop checkout. Please try again.');
      setIsSubmitting(false);
    } catch {
      setErrorMsg('An unexpected network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-7 bg-card text-foreground border border-border/80 shadow-2xl overflow-hidden">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fe4103]/10 text-[#fe4103] text-xs font-bold font-mono border border-[#fe4103]/20">
              <Pin className="size-3.5 fill-current" />
              <span>{formatSlotLabel(slotPosition)}</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
              Instant Auto-Lock
            </span>
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-mono font-black tracking-tight pt-1 text-foreground">
            Place an Ad on DropYourSaaS
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            30-day side rail placement &amp; high-intent founder visibility.
          </DialogDescription>
        </DialogHeader>

        {/* 3-Card Bento Metric Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 p-3 rounded-2xl bg-muted/40 dark:bg-zinc-900/60 border border-border/80 text-center my-1.5">
          <div className="space-y-0.5">
            <div className="font-mono font-black text-xs sm:text-sm text-foreground flex items-center justify-center gap-1">
              <span>🔥</span> 10 Max
            </div>
            <div className="text-[10px] text-muted-foreground font-sans leading-tight">
              Slots / Month
            </div>
          </div>

          <div className="space-y-0.5 border-x border-border/60 px-1">
            <div className="font-mono font-black text-xs sm:text-sm text-foreground flex items-center justify-center gap-1">
              <span>👀</span> High-Intent
            </div>
            <div className="text-[10px] text-muted-foreground font-sans leading-tight">
              Founders &amp; Devs
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="font-mono font-black text-xs sm:text-sm text-[#fe4103] flex items-center justify-center gap-1">
              <span>📌</span> 30–60d
            </div>
            <div className="text-[10px] text-muted-foreground font-sans leading-tight">
              Guaranteed Pin
            </div>
          </div>
        </div>

        {/* 1st Buyer Bonus Notice */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-700 dark:text-[#FFFC00] text-xs font-mono font-bold">
          <Sparkles className="size-4 fill-current text-amber-500 shrink-0" />
          <span>Special Offer: 1st buyer gets 1 month extra (total 60 days)!</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/15 text-destructive text-xs font-medium border border-destructive/30">
              {errorMsg}
            </div>
          )}

          {/* Website URL with Auto-Scrape Loader */}
          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between">
              <Label htmlFor="site_url" className="text-xs font-bold text-foreground">
                Website URL
              </Label>
              {isScraping && (
                <span className="text-[11px] font-mono text-[#fe4103] flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="size-3 animate-spin" />
                  Auto-scraping metadata...
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="site_url"
                type="text"
                placeholder="https://yourproduct.com"
                value={siteUrl}
                onChange={(e) => {
                  setSiteUrl(e.target.value);
                  setErrorMsg('');
                }}
                required
                className="h-10 pr-9 rounded-xl border-border bg-muted/30 text-xs font-mono"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                {isScraping ? (
                  <Loader2 className="size-4 animate-spin text-[#fe4103]" />
                ) : (
                  <Globe className="size-4 opacity-50" />
                )}
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-1 text-left">
            <Label htmlFor="product_name" className="text-xs font-bold text-foreground">
              Product / SaaS Name
            </Label>
            <Input
              id="product_name"
              type="text"
              placeholder="e.g. Acme AI"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="h-10 rounded-xl border-border bg-muted/30 text-xs"
            />
          </div>

          {/* Tagline / One-Liner */}
          <div className="space-y-1 text-left">
            <Label htmlFor="one_liner" className="text-xs font-bold text-foreground">
              One-liner / Tagline (Max 70 chars)
            </Label>
            <Textarea
              id="one_liner"
              placeholder="Brief value proposition shown on the sidebar card..."
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              maxLength={90}
              rows={2}
              className="rounded-xl border-border bg-muted/30 text-xs resize-none"
            />
          </div>

          {/* Live Preview Card */}
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center gap-3 text-left">
            <div className="size-10 rounded-xl bg-background border border-border/80 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              {iconUrl || siteUrl ? (
                <FaviconImage
                  url={siteUrl || 'https://dropyoursaas.com'}
                  name={productName || 'Sponsor'}
                  src={iconUrl}
                  size={36}
                  containerClassName="rounded-lg size-full"
                />
              ) : (
                <Sparkles className="size-5 text-muted-foreground/60" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-foreground truncate">
                  {productName || (siteUrl.trim() ? siteUrl.trim() : 'Your Product Name')}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#fe4103]/10 text-[#fe4103] font-bold shrink-0">
                  PINNED SPONSOR
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {oneLiner || 'Verified sponsor on DropYourSaaS'}
              </p>
            </div>
          </div>

          {/* Pricing Card Container */}
          <div className="p-4 rounded-2xl bg-[#fe4103]/10 dark:bg-[#fe4103]/15 border border-[#fe4103]/30 text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground block uppercase tracking-wider">
                Sidebar Ad Spot ({formatSlotLabel(slotPosition)})
              </span>
              <span className="font-mono font-black text-xl sm:text-2xl text-[#fe4103]">
                $100 <span className="text-xs font-normal text-muted-foreground">one-time</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Instant activation upon checkout. 30 days guaranteed placement (60 days for the 1st buyer).
            </p>
          </div>

          {/* Action Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl font-mono font-bold text-xs sm:text-sm text-white bg-[#fe4103] hover:bg-[#e03800] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin text-white" />
                <span>Redirecting to Whop Secure Checkout...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-white" />
                <span>Lock Spot ($100 · 1-Click Whop Checkout)</span>
                <ArrowRight className="size-4 text-white" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
