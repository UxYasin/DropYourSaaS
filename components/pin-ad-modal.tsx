'use client';

import React, { useState, useRef } from 'react';
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
  const [siteUrl, setSiteUrl] = useState(defaultSiteUrl);
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [oneLiner, setOneLiner] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if default props change
  const [prevDefaultUrl, setPrevDefaultUrl] = useState(defaultSiteUrl);
  if (defaultSiteUrl !== prevDefaultUrl) {
    setPrevDefaultUrl(defaultSiteUrl);
    setSiteUrl(defaultSiteUrl);
    setProjectName(defaultProjectName);
  }

  // 500ms Debounced Auto-Scraping
  const handleUrlChange = (value: string) => {
    setSiteUrl(value);
    setErrorMsg('');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 4) {
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      let normalized = trimmed;
      if (!/^https?:\/\//i.test(normalized)) {
        normalized = `https://${normalized.replace(/^@/, '')}`;
      }

      try {
        setIsScraping(true);
        const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(normalized)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.title) {
            setProjectName(data.title);
          }
          if (data?.description) {
            setOneLiner(data.description);
          }
          if (data?.favicon) {
            setFaviconUrl(data.favicon);
          }
        }
      } catch (err) {
        console.warn('Auto-scraping metadata fallback:', err);
      } finally {
        setIsScraping(false);
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!siteUrl.trim() || !projectName.trim() || !oneLiner.trim()) {
      setErrorMsg('Please enter your website URL, product name, and one-liner description.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Record lead in ad_requests
      await fetch('/api/ads/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_url: siteUrl.trim(),
          project_name: projectName.trim(),
          one_liner: oneLiner.trim(),
          contact_email: 'whop-buyer@dropyoursaas.com',
          slot_position: slotPosition,
        }),
      }).catch(() => {});

      // 2. Generate dynamic Whop Checkout URL
      const checkoutRes = await fetch('/api/checkout/whop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100,
          slotPosition,
          siteUrl: siteUrl.trim(),
          projectName: projectName.trim(),
          oneLiner: oneLiner.trim(),
          logoUrl: faviconUrl || undefined,
        }),
      });

      const checkoutData = await checkoutRes.json();
      const redirectUrl = checkoutData?.url || checkoutData?.checkoutUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      setErrorMsg('Failed to initialize Whop checkout. Please try again.');
      setIsSubmitting(false);
    } catch {
      setErrorMsg('An unexpected network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setErrorMsg('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleReset()}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-7 bg-card text-foreground border border-border/80 shadow-2xl overflow-hidden">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-[#08F9C9] text-xs font-bold font-mono border border-blue-500/20">
              <Pin className="size-3.5 fill-current" />
              <span>{formatSlotLabel(slotPosition)}</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
              Instant Auto-Lock
            </span>
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-mono font-black tracking-tight pt-1">
            Advertise on DropYourSaaS
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Instant 30-day side rail placement &amp; high-intent founder visibility.
          </DialogDescription>
        </DialogHeader>

        {/* 3-Card Bento Metric Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 p-3 rounded-2xl bg-muted/40 dark:bg-zinc-900/60 border border-border/80 text-center my-2">
          <div className="space-y-0.5">
            <div className="font-mono font-black text-xs sm:text-sm text-foreground flex items-center justify-center gap-1">
              <span>🔥</span> 500+
            </div>
            <div className="text-[10px] text-muted-foreground font-sans leading-tight">
              Active Launches
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
            <div className="font-mono font-black text-xs sm:text-sm text-blue-600 dark:text-[#08F9C9] flex items-center justify-center gap-1">
              <span>📌</span> 30 Days
            </div>
            <div className="text-[10px] text-muted-foreground font-sans leading-tight">
              Guaranteed Pin
            </div>
          </div>
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
                <span className="text-[11px] font-mono text-blue-600 dark:text-[#08F9C9] flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="size-3 animate-spin" />
                  Auto-scraping title &amp; metadata...
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="site_url"
                type="text"
                placeholder="https://yourproduct.com"
                value={siteUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                required
                className="h-10 pr-9 rounded-xl border-border bg-muted/30 text-xs font-mono"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                {isScraping ? (
                  <Loader2 className="size-4 animate-spin text-blue-500" />
                ) : (
                  <Globe className="size-4 opacity-50" />
                )}
              </div>
            </div>
          </div>

          {/* Product Name & One-Liner Description */}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1 text-left">
              <Label htmlFor="project_name" className="text-xs font-bold text-foreground">
                Product Name
              </Label>
              <Input
                id="project_name"
                type="text"
                placeholder="e.g. Acme AI"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="h-10 rounded-xl border-border bg-muted/30 text-xs font-sans"
              />
            </div>

            <div className="space-y-1 text-left">
              <Label htmlFor="one_liner" className="text-xs font-bold text-foreground">
                One-Liner Description
              </Label>
              <Textarea
                id="one_liner"
                rows={2}
                placeholder="e.g. The automated invoice & CRM tool built for freelancers."
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value)}
                required
                className="rounded-xl border-border bg-muted/30 text-xs resize-none font-sans"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          {siteUrl && (projectName || oneLiner) && (
            <div className="p-3 rounded-xl bg-muted/30 dark:bg-zinc-900/40 border border-border/80 flex items-start gap-3 text-left">
              <div className="size-10 rounded-xl bg-background p-1 border border-border shrink-0 overflow-hidden flex items-center justify-center">
                <FaviconImage
                  url={siteUrl}
                  name={projectName || 'Sponsor'}
                  src={faviconUrl}
                  size={32}
                  containerClassName="rounded-lg size-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-foreground truncate">
                    {projectName || siteUrl}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-[#08F9C9] font-bold shrink-0">
                    PINNED SPONSOR
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {oneLiner || 'Verified sponsor on DropYourSaaS'}
                </p>
              </div>
            </div>
          )}

          {/* Pricing Card Container */}
          <div className="p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-200 block uppercase tracking-wider">
                30-Day Sidebar Pin ({formatSlotLabel(slotPosition)})
              </span>
              <span className="font-mono font-black text-xl sm:text-2xl text-blue-600 dark:text-[#08F9C9]">
                $100 <span className="text-xs font-normal text-muted-foreground">one-time</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Your spot is locked for exactly 30 days starting immediately upon checkout. No recurring subscription or manual review delay.
            </p>
          </div>

          {/* Action Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl font-mono font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Redirecting to Whop Secure Checkout...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-amber-300" />
                <span>Lock Spot for 30 Days ($100)</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
