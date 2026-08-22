'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Sparkles, Clock, MousePointerClick, ChevronRight, ExternalLink } from 'lucide-react';
import type { LeaderboardItem, MetaData } from '@/lib/leaderboard-data';
import { trackEvent } from '@/lib/analytics';

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=directory&utm_campaign=listings`;

  const handleClick = () => {
    trackEvent('outbound_click', { url: item.url, rank: item.rank });
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: item.url }),
    }).catch(() => {});
  };

  // If item has uploaded images, use them; otherwise provide sample app screenshots
  const displayImages = (meta?.image ? [meta.image] : []).concat([
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
  ]).slice(0, 6);

  /* -------------------------------------------------------------
     VARIANT 1: #1 SPOT (2x Height of #2/#3, Slim Rainbow Glow)
     ------------------------------------------------------------- */
  if (variant === 'top1') {
    return (
      <div ref={containerRef} className="group relative my-1.5">
        {/* Subtle, slim animated rainbow ambient glow */}
        <div className="absolute -inset-[2px] rounded-[24px] animate-rainbow-glow opacity-35 blur-xs group-hover:opacity-60 group-hover:blur-sm transition-all duration-300 pointer-events-none" />
        <div className="absolute -inset-[1px] rounded-[23px] animate-rainbow-glow opacity-50 pointer-events-none" />

        <Card className="relative rounded-[22px] border-none bg-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
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
              <div className="font-mono font-black text-2xl sm:text-3xl text-sky-500 tracking-tight shrink-0">
                {formatBid(item.bid)}
              </div>
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, item.bid + 1)}
                className="px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0"
              >
                Take this spot
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground font-sans">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium text-[11px] font-sans">
              <Sparkles className="size-3" />
              {item.clicks.toLocaleString()} clicks
            </span>
            <span className="flex items-center gap-1 text-[11px] font-sans">
              <Clock className="size-3 text-muted-foreground/70" />
              {item.time}
            </span>
          </div>

          {/* Pure Image Container Gallery */}
          <div className="mt-5 pt-4 border-t border-border/60">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
              {displayImages.map((imgUrl, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={handleClick}
                  className="min-w-[130px] sm:min-w-[155px] h-44 sm:h-52 rounded-2xl bg-zinc-900/90 border border-border/80 overflow-hidden shrink-0 shadow-sm snap-start hover:border-amber-500/60 hover:scale-[1.02] transition-all relative block group/img"
                >
                  <Image
                    src={imgUrl}
                    alt={`${item.name} screenshot ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white/90 font-sans bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      View
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* -------------------------------------------------------------
     VARIANT 2: TOP 2 & TOP 3 (Prominent Colored Podium Cards)
     ------------------------------------------------------------- */
  if (variant === 'top2_3') {
    const isRank2 = item.rank === 2;

    // Spot 2: Vibrant Azure / Ice Blue Theme
    // Spot 3: Vibrant Sunset Amber Theme
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
                    {item.clicks.toLocaleString()} clicks
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
              <div className={`font-mono font-black text-xl sm:text-2xl tracking-tight shrink-0 ${theme.priceColor}`}>
                {formatBid(item.bid)}
              </div>
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, item.bid + 1)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full font-bold text-xs shadow-xs active:scale-95 transition-all shrink-0 ${theme.btn}`}
              >
                Take this spot
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     VARIANT 3: TOP 4 TO TOP 10 (0.7x Height of #2/#3, Bento Pastel Colors)
     ------------------------------------------------------------- */
  if (variant === 'top4_10') {
    // 6 bento pastel styles matching the side rails
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
                    {item.clicks.toLocaleString()} clicks
                  </span>
                  <span className={currentStyle.subtext}>·</span>
                  <span className={currentStyle.subtext}>{item.time}</span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              <div className={`font-mono font-black text-sm sm:text-base ${currentStyle.text}`}>
                {formatBid(item.bid)}
              </div>
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, item.bid + 1)}
                className="px-3 py-1.5 rounded-full font-bold text-[11px] text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-xs active:scale-95 transition-all font-sans"
              >
                Take spot
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     VARIANT 4: TOP 11 TO TOP 20 (Sleek, Clean Compact Rows)
     ------------------------------------------------------------- */
  return (
    <div ref={containerRef} className="group relative">
      <Card className="rounded-[12px] border border-border/70 bg-card p-2.5 sm:p-3 shadow-none hover:bg-muted/30 hover:border-border transition-all duration-150">
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
              {item.clicks.toLocaleString()} clicks
            </span>
            <div className="font-mono font-black text-xs sm:text-sm text-sky-500">
              {formatBid(item.bid)}
            </div>
            <button
              type="button"
              onClick={() => onClaimClick(item.rank, item.bid + 1)}
              className="px-2.5 py-1 rounded-full font-bold text-[10px] text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-xs active:scale-95 transition-all font-sans"
            >
              Claim
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
