'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Sparkles, Clock, MousePointerClick, ChevronRight, ExternalLink } from 'lucide-react';
import type { LeaderboardItem, MetaData } from '@/lib/leaderboard-data';

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
     VARIANT 1: #1 SPOT (2x Height of #2/#3, Pure Image Gallery)
     ------------------------------------------------------------- */
  if (variant === 'top1') {
    return (
      <div ref={containerRef} className="group relative">
        <Card className="rounded-[22px] border-2 border-amber-500/40 bg-card p-5 sm:p-6 shadow-md hover:border-amber-500/70 hover:shadow-lg transition-all duration-200 overflow-hidden">
          {/* Subtle glowing ambient accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Main info header */}
          <div className="flex items-start justify-between gap-4">
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={handleClick}
                    className="font-bold text-lg sm:text-xl text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="truncate">{title}</span>
                    <ExternalLink className="size-4 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold tracking-wide border border-amber-500/30 shrink-0">
                    TOP SPOT #1
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="font-mono font-black text-2xl sm:text-3xl text-sky-500 tracking-tight">
                {formatBid(item.bid)}
              </div>
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, item.bid + 1)}
                className="px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm hover:shadow active:scale-95 transition-all"
              >
                Take this spot
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium text-[11px]">
              <Sparkles className="size-3" />
              {item.clicks.toLocaleString()} clicks
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="size-3 text-muted-foreground/70" />
              {item.time}
            </span>
          </div>

          {/* Pure Image Container Gallery (No text blocks, pure screenshots/images) */}
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
                    <span className="text-[10px] text-white/90 font-mono bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full">
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
     VARIANT 2: TOP 2 & TOP 3 (Prominent Podium Cards with Big Thumb)
     ------------------------------------------------------------- */
  if (variant === 'top2_3') {
    const isRank2 = item.rank === 2;
    const accentBorder = isRank2 ? 'border-sky-500/30 hover:border-sky-500/60' : 'border-amber-500/30 hover:border-amber-500/60';
    const numColor = isRank2 ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400';

    return (
      <div ref={containerRef} className="group relative">
        <Card className={`rounded-[18px] border ${accentBorder} bg-card p-4 sm:p-5 shadow-[var(--shadow-1)] hover:shadow-md transition-all duration-200 overflow-hidden`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <span className={`font-mono text-xl sm:text-2xl font-bold shrink-0 mt-0.5 ${numColor}`}>
                #{item.rank}
              </span>
              <a
                href={href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleClick}
                className="shrink-0"
              >
                <div className="size-12 sm:size-14 rounded-[12px] bg-muted/80 p-1.5 border border-border/80 shadow-sm flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={handleClick}
                    className="font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    <span className="truncate">{title}</span>
                    <ExternalLink className="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {description}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-[11px]">
                    <Sparkles className="size-3" />
                    {item.clicks.toLocaleString()} clicks
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground/70" />
                    {item.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="font-mono font-bold text-xl sm:text-2xl text-sky-500 tracking-tight">
                {formatBid(item.bid)}
              </div>
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, item.bid + 1)}
                className="px-3.5 sm:px-4 py-1.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xs hover:shadow active:scale-95 transition-all"
              >
                Take this spot
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* -------------------------------------------------------------
     VARIANT 3: TOP 4 TO TOP 10 (0.7x Height of #2/#3, Compact-Medium)
     ------------------------------------------------------------- */
  if (variant === 'top4_10') {
    return (
      <div ref={containerRef} className="group relative">
        <Card className="rounded-[14px] border border-border/80 bg-card p-3 sm:p-3.5 shadow-[var(--shadow-1)] hover:border-border hover:shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="font-mono text-sm sm:text-base font-bold text-muted-foreground/80 w-6 shrink-0 text-center">
                #{item.rank}
              </span>
              <a
                href={href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={handleClick}
                className="shrink-0"
              >
                <div className="size-9 sm:size-10 rounded-[10px] bg-muted/60 p-1 border border-border/70 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                  <Image
                    src={favicon}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="size-full object-contain rounded-[6px]"
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
                    className="font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors truncate"
                  >
                    {title}
                  </a>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {description}
                </p>
                <div className="flex items-center gap-2.5 mt-1 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-primary font-medium">
                    <Sparkles className="size-2.5" />
                    {item.clicks.toLocaleString()} clicks
                  </span>
                  <span>·</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="font-mono font-bold text-sm sm:text-base text-sky-500">
                {formatBid(item.bid)}
              </div>
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, item.bid + 1)}
                className="px-2.5 sm:px-3 py-1 rounded-full font-medium text-[11px] text-orange-700 dark:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 active:scale-95 transition-all"
              >
                Take spot
              </button>
            </div>
          </div>
        </Card>
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
            <span className="font-mono text-xs font-medium text-muted-foreground w-6 shrink-0 text-center">
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
                  className="font-medium text-xs text-foreground hover:text-primary transition-colors truncate"
                >
                  {title}
                </a>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
              {item.clicks.toLocaleString()} clicks
            </span>
            <div className="font-mono font-semibold text-xs sm:text-sm text-sky-500">
              {formatBid(item.bid)}
            </div>
            <button
              type="button"
              onClick={() => onClaimClick(item.rank, item.bid + 1)}
              className="px-2.5 py-0.5 rounded-full font-medium text-[10px] text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 transition-colors"
            >
              Claim
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
