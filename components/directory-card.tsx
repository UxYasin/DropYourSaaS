'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Sparkles, Clock, ExternalLink } from 'lucide-react';
import type { LeaderboardItem, MetaData } from '@/lib/leaderboard-data';
import { trackEvent } from '@/lib/analytics';
import { siteCopy } from '@/lib/copy';

function formatBid(amount: number) {
  return `$${amount.toLocaleString()}`;
}

interface DirectoryCardProps {
  item: LeaderboardItem;
  variant: 'top1' | 'top2_3' | 'top4_10' | 'top11_20';
  onClaimClick: (rank: number, bid: number) => void;
}

export function DirectoryCard({ item, variant, onClaimClick }: DirectoryCardProps) {
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [clicks, setClicks] = useState(item.clicks);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClicks(item.clicks);
  }, [item.clicks]);

  useEffect(() => {
    let active = true;
    const fetchMeta = async () => {
      try {
        const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(item.url)}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setMeta(data);
        }
      } catch {}
    };
    fetchMeta();
    return () => {
      active = false;
    };
  }, [item.url]);

  const title = meta?.title || item.name;
  const description = meta?.description || `Explore ${item.name} — verified software tools & developer services listed on DropYourSaaS.`;
  const favicon = meta?.favicon || `https://www.google.com/s2/favicons?domain=${item.name}&sz=128`;
  const previewImageUrl = meta?.image || (item as any).preview_image_url || (item as any).og_image || null;

  const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=directory&utm_campaign=listings`;

  const handleClick = () => {
    setClicks((prev) => prev + 1);
    trackEvent('outbound_click', { url: item.url, rank: item.rank, name: item.name });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ url: item.url })], { type: 'application/json' });
      navigator.sendBeacon('/api/click', blob);
    } else {
      fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url }),
      }).catch(() => {});
    }
  };

  /* -------------------------------------------------------------
     VARIANT 1: #1 SPOT (Top Rank Card with Glow)
     ------------------------------------------------------------- */
  if (variant === 'top1') {
    return (
      <div ref={containerRef} className="group relative my-1.5">
        {/* Subtle animated rainbow ambient glow */}
        <div className="absolute -inset-[2px] rounded-[24px] animate-rainbow-glow opacity-35 blur-xs group-hover:opacity-60 group-hover:blur-sm transition-all duration-300 pointer-events-none" />
        <div className="absolute -inset-[1px] rounded-[23px] animate-rainbow-glow opacity-50 pointer-events-none" />

        <Card className="relative rounded-[22px] border-none bg-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden text-foreground">
          {/* Subtle ambient internal accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />

          {/* Main info header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
              <span className="font-mono text-xl sm:text-2xl font-black text-foreground shrink-0 mt-1">
                #{item.rank}
              </span>
              <a
                href={href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleClick}
                className="shrink-0"
              >
                <div className="size-14 sm:size-16 rounded-[14px] bg-muted/80 p-1.5 border border-border/80 shadow-sm flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                  <Image
                    src={favicon}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="size-full object-contain rounded-[10px]"
                    unoptimized
                  />
                </div>
              </a>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <a
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={handleClick}
                    className="font-mono font-black text-base sm:text-lg text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 min-w-0 max-w-full"
                  >
                    <span className="truncate">{title}</span>
                    <ExternalLink className="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                  <span className="font-sans text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 font-bold tracking-wide border border-amber-500/40 shrink-0">
                    TOP SPOT #1
                  </span>
                </div>
                <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
              {siteCopy.feed.showPrices && (
                <div className="font-mono font-black text-2xl sm:text-3xl text-sky-500 tracking-tight shrink-0">
                  {formatBid(item.bid)}
                </div>
              )}
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, item.bid + 1)}
                className="px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0"
              >
                {siteCopy.feed.podiumButton}
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground font-sans">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium text-[11px] font-sans">
              <Sparkles className="size-3" />
              {clicks.toLocaleString()} clicks
            </span>
            <span className="flex items-center gap-1 text-[11px] font-sans">
              <Clock className="size-3 text-muted-foreground/70" />
              {item.time}
            </span>
          </div>

          {/* Single Full-Width Preview Image Banner */}
          {previewImageUrl ? (
            <div className="mt-4 pt-3 border-t border-border/60">
              <a
                href={href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleClick}
                className="block relative w-full h-48 sm:h-56 md:h-64 overflow-hidden rounded-xl border border-border/80 bg-muted/40 group/preview shadow-xs"
              >
                <img
                  src={previewImageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/preview:scale-[1.02]"
                  loading="lazy"
                />
              </a>
            </div>
          ) : null}
        </Card>
      </div>
    );
  }

  /* -------------------------------------------------------------
     VARIANT 2: TOP 2 & TOP 3 (Prominent Colored Podium Cards)
     ------------------------------------------------------------- */
  if (variant === 'top2_3') {
    const isRank2 = item.rank === 2;

    const theme = isRank2
      ? {
          bg: 'bg-[var(--bento-blue)]',
          border: 'border-blue-300/80 dark:border-blue-700/60',
          text: 'text-blue-950 dark:text-blue-100',
          subtext: 'text-blue-900/75 dark:text-blue-200/75',
          rankColor: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-400/30',
          btn: 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-sm',
          priceColor: 'text-blue-600 dark:text-blue-400',
        }
      : {
          bg: 'bg-[var(--bento-yellow)]',
          border: 'border-amber-300/80 dark:border-amber-700/60',
          text: 'text-amber-950 dark:text-amber-100',
          subtext: 'text-amber-900/75 dark:text-amber-200/75',
          rankColor: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400/30',
          btn: 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-sm',
          priceColor: 'text-amber-600 dark:text-amber-400',
        };

    return (
      <div ref={containerRef} className="group relative">
        <div className={`rounded-[20px] border ${theme.border} ${theme.bg} p-4 sm:p-5 shadow-[var(--shadow-1)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <span className={`font-mono text-xl sm:text-2xl font-black shrink-0 mt-0.5 ${theme.rankColor}`}>
                #{item.rank}
              </span>
              <a
                href={href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleClick}
                className="shrink-0"
              >
                <div className="size-12 sm:size-14 rounded-[14px] bg-background/90 p-1.5 border border-border/60 shadow-xs flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                  <Image
                    src={favicon}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="size-full object-contain rounded-[8px]"
                    unoptimized
                  />
                </div>
              </a>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <a
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={handleClick}
                    className={`font-mono font-bold text-base sm:text-lg hover:underline transition-colors inline-flex items-center gap-1 min-w-0 max-w-full ${theme.text}`}
                  >
                    <span className="truncate">{title}</span>
                    <ExternalLink className="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                  <span className={`font-sans text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide border ${theme.badge}`}>
                    {isRank2 ? 'PODIUM #2' : 'PODIUM #3'}
                  </span>
                </div>
                <p className={`font-body text-xs mt-1 line-clamp-2 leading-relaxed ${theme.subtext}`}>
                  {description}
                </p>
                <div className="flex items-center gap-3 mt-3 font-sans">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-[11px] font-sans ${theme.badge}`}>
                    <Sparkles className="size-3" />
                    {clicks.toLocaleString()} clicks
                  </span>
                  <span className={`text-[11px] font-sans flex items-center gap-1 ${theme.subtext}`}>
                    <Clock className="size-3 opacity-70" />
                    {item.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
              {siteCopy.feed.showPrices && (
                <div className={`font-mono font-black text-xl sm:text-2xl tracking-tight shrink-0 ${theme.priceColor}`}>
                  {formatBid(item.bid)}
                </div>
              )}
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, item.bid + 1)}
                className="px-3.5 sm:px-4 py-1.5 rounded-full font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-xs active:scale-95 transition-all shrink-0"
              >
                {siteCopy.feed.podiumButton}
              </button>
            </div>
          </div>

          {/* Single Full-Width Preview Image Banner */}
          {previewImageUrl ? (
            <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10">
              <a
                href={href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleClick}
                className="block relative w-full h-44 sm:h-52 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 group/preview shadow-xs"
              >
                <img
                  src={previewImageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/preview:scale-[1.02]"
                  loading="lazy"
                />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     VARIANT 3: TOP 4 TO TOP 10 (Bento Pastel Cards)
     ------------------------------------------------------------- */
  if (variant === 'top4_10') {
    const bentoStyles = [
      {
        bg: 'bg-[var(--bento-blue)]',
        border: 'border-blue-200/60 dark:border-blue-800/40',
        text: 'text-blue-950 dark:text-blue-100',
        subtext: 'text-blue-900/70 dark:text-blue-200/70',
        badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
      },
      {
        bg: 'bg-[var(--bento-yellow)]',
        border: 'border-amber-200/60 dark:border-amber-800/40',
        text: 'text-amber-950 dark:text-amber-100',
        subtext: 'text-amber-900/70 dark:text-amber-200/70',
        badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      },
      {
        bg: 'bg-[var(--bento-mint)]',
        border: 'border-emerald-200/60 dark:border-emerald-800/40',
        text: 'text-emerald-950 dark:text-emerald-100',
        subtext: 'text-emerald-900/70 dark:text-emerald-200/70',
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      },
      {
        bg: 'bg-[var(--bento-pink)]',
        border: 'border-pink-200/60 dark:border-pink-800/40',
        text: 'text-pink-950 dark:text-pink-100',
        subtext: 'text-pink-900/70 dark:text-pink-200/70',
        badge: 'bg-pink-500/10 text-pink-700 dark:text-pink-300',
      },
      {
        bg: 'bg-[var(--bento-lavender)]',
        border: 'border-purple-200/60 dark:border-purple-800/40',
        text: 'text-purple-950 dark:text-purple-100',
        subtext: 'text-purple-900/70 dark:text-purple-200/70',
        badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
      },
      {
        bg: 'bg-[var(--bento-gray)]',
        border: 'border-zinc-300/60 dark:border-zinc-700/40',
        text: 'text-zinc-950 dark:text-zinc-100',
        subtext: 'text-zinc-900/70 dark:text-zinc-300/70',
        badge: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
      },
    ];

    const styleIndex = (item.rank - 4) % bentoStyles.length;
    const currentStyle = bentoStyles[Math.max(0, styleIndex)];

    return (
      <div ref={containerRef} className="group relative">
        <div className={`rounded-[16px] border ${currentStyle.border} ${currentStyle.bg} p-3.5 sm:p-4 shadow-[var(--shadow-1)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className={`font-mono text-sm sm:text-base font-black shrink-0 w-6 text-center ${currentStyle.text}`}>
                #{item.rank}
              </span>
              <a
                href={href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleClick}
                className="shrink-0"
              >
                <div className="size-10 sm:size-11 rounded-[12px] bg-background/80 p-1.5 border border-border/60 shadow-xs flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                  <Image
                    src={favicon}
                    alt={item.name}
                    width={44}
                    height={44}
                    className="size-full object-contain rounded-[8px]"
                    unoptimized
                  />
                </div>
              </a>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <a
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={handleClick}
                    className={`font-mono font-bold text-xs sm:text-sm hover:underline transition-colors truncate ${currentStyle.text}`}
                  >
                    {title}
                  </a>
                </div>
                <p className={`font-body text-[11px] sm:text-xs line-clamp-1 mt-0.5 ${currentStyle.subtext}`}>
                  {description}
                </p>
                <div className="flex items-center gap-2.5 mt-1.5 text-[10px] font-sans">
                  <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full font-sans ${currentStyle.badge}`}>
                    <Sparkles className="size-2.5" />
                    {clicks.toLocaleString()} clicks
                  </span>
                  <span className={currentStyle.subtext}>·</span>
                  <span className={currentStyle.subtext}>{item.time}</span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              {siteCopy.feed.showPrices && (
                <div className={`font-mono font-black text-sm sm:text-base ${currentStyle.text}`}>
                  {formatBid(item.bid)}
                </div>
              )}
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, item.bid + 1)}
                className="px-3 py-1.5 rounded-full font-bold text-[11px] text-white bg-blue-600 hover:bg-blue-500 shadow-xs active:scale-95 transition-all font-sans shrink-0"
              >
                {siteCopy.feed.podiumButton}
              </button>
            </div>
          </div>

          {/* Single Full-Width Preview Image Banner */}
          {previewImageUrl ? (
            <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10">
              <a
                href={href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleClick}
                className="block relative w-full h-36 sm:h-44 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 group/preview shadow-xs"
              >
                <img
                  src={previewImageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/preview:scale-[1.02]"
                  loading="lazy"
                />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     VARIANT 4: TOP 11 TO TOP 20 (Sleek, Clean Compact Rows)
     ------------------------------------------------------------- */
  return (
    <div ref={containerRef} className="group relative">
      <Card className="rounded-[12px] border border-border/70 bg-card p-2.5 sm:p-3 shadow-none hover:bg-muted/30 hover:border-border transition-all duration-150 text-foreground">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="font-mono text-xs font-bold text-muted-foreground w-6 shrink-0 text-center">
              #{item.rank}
            </span>
            <a
              href={href}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={handleClick}
              className="shrink-0"
            >
              <div className="size-7 sm:size-8 rounded-lg bg-muted/60 p-0.5 border border-border/50 flex items-center justify-center overflow-hidden">
                <Image
                  src={favicon}
                  alt={item.name}
                  width={32}
                  height={32}
                  className="size-full object-contain rounded-[4px]"
                  unoptimized
                />
              </div>
            </a>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <a
                  href={href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={handleClick}
                  className="font-mono font-bold text-xs text-foreground hover:text-primary transition-colors truncate"
                >
                  {title}
                </a>
              </div>
              <p className="font-body text-[11px] text-muted-foreground line-clamp-1">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-sans">
            <span className="text-[10px] text-muted-foreground font-sans hidden sm:inline">
              {clicks.toLocaleString()} clicks
            </span>
            {siteCopy.feed.showPrices && (
              <div className="font-mono font-black text-xs sm:text-sm text-sky-500">
                {formatBid(item.bid)}
              </div>
            )}
            <button
              type="button"
              onClick={() => onClaimClick(item.rank, item.bid + 1)}
              className="px-2.5 py-1 rounded-full font-bold text-[10px] text-white bg-blue-600 hover:bg-blue-500 shadow-xs active:scale-95 transition-all font-sans shrink-0"
            >
              {siteCopy.feed.listingButton}
            </button>
          </div>
        </div>

        {/* Single Full-Width Preview Image Banner */}
        {previewImageUrl ? (
          <div className="mt-2.5 pt-2 border-t border-border/50">
            <a
              href={href}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={handleClick}
              className="block relative w-full h-32 sm:h-40 overflow-hidden rounded-lg border border-border/60 bg-muted/40 group/preview shadow-xs"
            >
              <img
                src={previewImageUrl}
                alt={item.name}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/preview:scale-[1.02]"
                loading="lazy"
              />
            </a>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
