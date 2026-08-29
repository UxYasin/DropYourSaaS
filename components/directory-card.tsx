'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Sparkles, Clock, ExternalLink, BadgeCheck } from 'lucide-react';
import type { LeaderboardItem, MetaData } from '@/lib/leaderboard-data';
import { trackEvent } from '@/lib/analytics';
import { siteCopy } from '@/lib/copy';
import { VotePill } from '@/components/VotePill';
import { FaviconImage } from '@/components/favicon-image';
import { PreviewImage } from '@/components/preview-image';
import { getListingSlug } from '@/lib/slug';
import { cn } from '@/lib/utils';

function formatBid(amount: number) {
  return `$${amount.toLocaleString()}`;
}

function formatAskingPrice(amount?: number) {
  if (!amount || amount <= 0) return null;
  return `$${amount.toLocaleString('en-US')}`;
}

const BENTO_PASTEL_STYLES = [
  {
    bg: 'bg-[#eff6ff] dark:bg-blue-950/25',
    border: 'border-blue-200/80 dark:border-blue-800/40',
    title: 'text-blue-950 dark:text-blue-100',
    subtext: 'text-blue-900/75 dark:text-blue-200/75',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800',
    price: 'text-blue-600 dark:text-blue-400',
  },
  {
    bg: 'bg-[#fefce8] dark:bg-yellow-950/25',
    border: 'border-yellow-200/80 dark:border-yellow-800/40',
    title: 'text-yellow-950 dark:text-yellow-100',
    subtext: 'text-yellow-900/75 dark:text-yellow-200/75',
    badge: 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-200/80 dark:border-yellow-800',
    price: 'text-amber-600 dark:text-amber-400',
  },
  {
    bg: 'bg-[#f0fdf4] dark:bg-emerald-950/25',
    border: 'border-emerald-200/80 dark:border-emerald-800/40',
    title: 'text-emerald-950 dark:text-emerald-100',
    subtext: 'text-emerald-900/75 dark:text-emerald-200/75',
    badge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800',
    price: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    bg: 'bg-[#fdf2f8] dark:bg-pink-950/25',
    border: 'border-pink-200/80 dark:border-pink-800/40',
    title: 'text-pink-950 dark:text-pink-100',
    subtext: 'text-pink-900/75 dark:text-pink-200/75',
    badge: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200/80 dark:border-pink-800',
    price: 'text-pink-600 dark:text-pink-400',
  },
  {
    bg: 'bg-[#f5f3ff] dark:bg-purple-950/25',
    border: 'border-purple-200/80 dark:border-purple-800/40',
    title: 'text-purple-950 dark:text-purple-100',
    subtext: 'text-purple-900/75 dark:text-purple-200/75',
    badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800',
    price: 'text-purple-600 dark:text-purple-400',
  },
  {
    bg: 'bg-[#f8fafc] dark:bg-zinc-900/40',
    border: 'border-zinc-200/80 dark:border-zinc-800/40',
    title: 'text-zinc-950 dark:text-zinc-100',
    subtext: 'text-zinc-800/75 dark:text-zinc-300/75',
    badge: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800',
    price: 'text-zinc-700 dark:text-zinc-300',
  },
];

export interface DirectoryCardProps {
  item: LeaderboardItem;
  index?: number;
  variant?: 'grid' | 'top1' | 'top2_3' | 'top4_10' | 'top11_20';
  onClaimClick?: (rank: number, bid: number) => void;
}

export function DirectoryCard({ item, index, variant, onClaimClick }: DirectoryCardProps) {
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [clickedExtra, setClickedExtra] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const clicks = (item.clicks || 0) + clickedExtra;
  const relAttribute = 'noopener noreferrer';

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
  const description = item.description || meta?.description || `Explore ${item.name} — verified software tools & developer services listed on DropYourSaaS.`;
  const previewImageUrl = meta?.image || item.preview_image_url || null;
  const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=directory&utm_campaign=listings`;

  const handleClick = () => {
    setClickedExtra((prev) => prev + 1);
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

  const askingPriceFormatted = formatAskingPrice(item.asking_price);
  const forSaleBadgeText = askingPriceFormatted ? `🏷️ FOR SALE: ${askingPriceFormatted}` : '🏷️ FOR SALE';

  // VARIANT: GRID (Directory Page)
  if (variant === 'grid' || (!variant && typeof index === 'number')) {
    const themeIndex = (index ?? (item.rank ? item.rank - 1 : 0)) % BENTO_PASTEL_STYLES.length;
    const currentTheme = BENTO_PASTEL_STYLES[Math.max(0, Math.abs(themeIndex))];

    return (
      <div ref={containerRef} className="group relative h-full">
        <div
          className={cn(
            'rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden',
            currentTheme.border,
            currentTheme.bg
          )}
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <a href={href} target="_blank" rel={relAttribute} onClick={handleClick} className="shrink-0">
                  <div className="size-12 rounded-xl bg-background/90 p-1 border border-border/60 shadow-2xs flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                    <FaviconImage url={item.url} name={item.name} src={meta?.favicon} size={40} containerClassName="rounded-lg size-full" />
                  </div>
                </a>
                <div className="min-w-0 flex-1">
                  <a href={href} target="_blank" rel={relAttribute} onClick={handleClick} className={cn('font-mono font-bold text-sm sm:text-base hover:underline transition-colors inline-flex items-center gap-1 min-w-0 max-w-full', currentTheme.title)}>
                    <span className="truncate">{title}</span>
                    {item.is_verified && (
                      <span className="inline-flex items-center text-blue-500 font-bold shrink-0 ml-0.5" title="$5 Verified Listing">
                        <BadgeCheck className="size-4 fill-blue-500 text-white dark:text-black" />
                      </span>
                    )}
                  </a>
                  <p className={cn('font-body text-xs line-clamp-2 mt-1 leading-relaxed', currentTheme.subtext)}>{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-[11px] font-sans">
            <span className={cn('flex items-center gap-1', currentTheme.subtext)}>{item.time}</span>
            <span className={cn('font-mono font-bold text-sm', currentTheme.price)}>{formatBid(item.bid)}</span>
          </div>
        </div>
      </div>
    );
  }

  // VARIANT 1: SPOT #1 (BIGGER IN HEIGHT WITH RAINBOW GLOW & PREVIEW BANNER)
  if (variant === 'top1' || item.rank === 1) {
    return (
      <div ref={containerRef} className="group relative my-2">
        {/* Ambient Glow Aura */}
        <div className="absolute -inset-[2px] rounded-[26px] animate-rainbow-glow opacity-40 blur-xs group-hover:opacity-65 group-hover:blur-sm transition-all duration-300 pointer-events-none" />
        <div className="absolute -inset-[1px] rounded-[25px] animate-rainbow-glow opacity-55 pointer-events-none" />

        <Card className="relative rounded-[24px] border-none bg-card p-5 sm:p-7 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden text-foreground">
          {/* Subtle Ambient Top Corner Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-purple-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Top Row: Rank, Logo, Info, Price, and CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="size-8 sm:size-9 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-mono font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                #1
              </div>

              <a
                href={href}
                target="_blank"
                rel={relAttribute}
                onClick={handleClick}
                className="shrink-0"
              >
                <div className="size-14 sm:size-16 rounded-[14px] bg-muted/80 p-1.5 border border-border/80 shadow-xs flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                  <FaviconImage
                    url={item.url}
                    name={item.name}
                    src={meta?.favicon}
                    size={52}
                    containerClassName="rounded-[10px] size-full"
                  />
                </div>
              </a>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <a
                    href={href}
                    target="_blank"
                    rel={relAttribute}
                    onClick={handleClick}
                    className="font-mono font-black text-base sm:text-lg text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1.5 min-w-0 max-w-full"
                  >
                    <span className="truncate">{title}</span>
                    {item.is_verified && (
                      <span className="inline-flex items-center text-blue-500 font-bold shrink-0" title="$5 Verified Listing">
                        <BadgeCheck className="size-4.5 fill-blue-500 text-white dark:text-black" />
                      </span>
                    )}
                    <ExternalLink className="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>

                  <span className="font-sans text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold tracking-wide border border-blue-500/30 shrink-0">
                    TOP SPOT #1
                  </span>

                  {item.is_for_sale && (
                    <span className="inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                      {forSaleBadgeText}
                    </span>
                  )}
                </div>

                <p className="font-body text-xs sm:text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {description}
                </p>

                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground font-sans">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-[11px]">
                    <Sparkles className="size-3" />
                    {clicks.toLocaleString()} clicks
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="size-3 opacity-70" />
                    {item.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Voting Pill, View Listing, Price & Outbid CTA */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
              <div className="flex items-center gap-2">
                <Link
                  href={`/s/${getListingSlug(item)}`}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium whitespace-nowrap hidden sm:inline-flex items-center"
                >
                  Details →
                </Link>
                <VotePill
                  listingId={item.id || ''}
                  initialScore={item.net_score || 0}
                  initialUserVote={item.user_vote || 0}
                  size="md"
                />
              </div>

              {siteCopy.feed.showPrices && (
                <div className="font-mono font-black text-xl sm:text-2xl text-blue-600 dark:text-blue-400 tracking-tight shrink-0">
                  {formatBid(item.bid)}
                </div>
              )}

              {onClaimClick && (
                <button
                  type="button"
                  onClick={() => onClaimClick(item.rank, Math.max(1, item.bid + 1))}
                  className="px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  {siteCopy.feed.podiumButton}
                </button>
              )}
            </div>
          </div>

          {/* LARGE PREVIEW BANNER (GIVES SPOT #1 ITS PROMINENT TALLER HEIGHT) */}
          <div className="mt-4 pt-3 border-t border-border/60">
            <a
              href={href}
              target="_blank"
              rel={relAttribute}
              onClick={handleClick}
              className="block rounded-xl overflow-hidden group/img relative"
            >
              <PreviewImage
                src={previewImageUrl}
                url={item.url}
                name={item.name}
                title={title}
              />
            </a>
          </div>
        </Card>
      </div>
    );
  }

  // VARIANT 2: SPOT #2 & SPOT #3 (PODIUM CARDS WITH SOFT PASTEL COLORS)
  if (variant === 'top2_3' || item.rank === 2 || item.rank === 3) {
    const isRank2 = item.rank === 2;
    const theme = isRank2
      ? BENTO_PASTEL_STYLES[0] // Soft Blue
      : BENTO_PASTEL_STYLES[1]; // Soft Yellow

    return (
      <div ref={containerRef} className="group relative my-1">
        <div className={cn('rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-200 overflow-hidden', theme.border, theme.bg)}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <span className={cn('font-mono text-lg sm:text-xl font-bold shrink-0 mt-0.5 w-7 text-center', theme.price)}>
                #{item.rank}
              </span>

              <a
                href={href}
                target="_blank"
                rel={relAttribute}
                onClick={handleClick}
                className="shrink-0"
              >
                <div className="size-12 sm:size-13 rounded-xl bg-background/90 p-1 border border-border/60 shadow-2xs flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                  <FaviconImage
                    url={item.url}
                    name={item.name}
                    src={meta?.favicon}
                    size={42}
                    containerClassName="rounded-lg size-full"
                  />
                </div>
              </a>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <a
                    href={href}
                    target="_blank"
                    rel={relAttribute}
                    onClick={handleClick}
                    className={cn('font-mono font-bold text-sm sm:text-base hover:underline transition-colors inline-flex items-center gap-1 min-w-0 max-w-full', theme.title)}
                  >
                    <span className="truncate">{title}</span>
                    {item.is_verified && (
                      <span className="inline-flex items-center text-blue-500 font-bold shrink-0" title="$5 Verified Listing">
                        <BadgeCheck className="size-4.5 fill-blue-500 text-white dark:text-black" />
                      </span>
                    )}
                    <ExternalLink className="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>

                  <span className={cn('font-sans text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide border', theme.badge)}>
                    {isRank2 ? 'PODIUM #2' : 'PODIUM #3'}
                  </span>

                  {item.is_for_sale && (
                    <span className="inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 shrink-0">
                      {forSaleBadgeText}
                    </span>
                  )}
                </div>

                <p className={cn('font-body text-xs sm:text-[13px] mt-1 line-clamp-2 leading-relaxed', theme.subtext)}>
                  {description}
                </p>

                <div className="flex items-center gap-3 mt-2.5 font-sans">
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-[11px]', theme.badge)}>
                    <Sparkles className="size-3" />
                    {clicks.toLocaleString()} clicks
                  </span>
                  <span className={cn('text-[11px] flex items-center gap-1', theme.subtext)}>
                    <Clock className="size-3 opacity-70" />
                    {item.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Voting Pill, Price & Action */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
              <div className="flex items-center gap-2">
                <Link
                  href={`/s/${getListingSlug(item)}`}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium whitespace-nowrap hidden sm:inline-flex items-center"
                >
                  Details →
                </Link>
                <VotePill
                  listingId={item.id || ''}
                  initialScore={item.net_score || 0}
                  initialUserVote={item.user_vote || 0}
                  size="sm"
                />
              </div>

              {siteCopy.feed.showPrices && (
                <div className={cn('font-mono font-black text-lg sm:text-xl tracking-tight shrink-0', theme.price)}>
                  {formatBid(item.bid)}
                </div>
              )}

              {onClaimClick && (
                <button
                  type="button"
                  onClick={() => onClaimClick(item.rank, Math.max(1, item.bid + 1))}
                  className="px-3.5 py-1.5 rounded-full font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  {siteCopy.feed.podiumButton}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VARIANT 3: SPOT #4 TO #10 (ROTATING BENTO PASTEL COLORS)
  const styleIndex = (item.rank - 4) % BENTO_PASTEL_STYLES.length;
  const currentTheme = BENTO_PASTEL_STYLES[Math.max(0, styleIndex)];

  return (
    <div ref={containerRef} className="group relative">
      <div className={cn('rounded-2xl border p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all duration-150', currentTheme.border, currentTheme.bg)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className={cn('font-mono text-sm sm:text-base font-bold shrink-0 w-6 text-center', currentTheme.title)}>
              #{item.rank}
            </span>

            <a
              href={href}
              target="_blank"
              rel={relAttribute}
              onClick={handleClick}
              className="shrink-0"
            >
              <div className="size-10 sm:size-11 rounded-xl bg-background/90 p-1 border border-border/60 shadow-2xs flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                <FaviconImage
                  url={item.url}
                  name={item.name}
                  src={meta?.favicon}
                  size={36}
                  containerClassName="rounded-lg size-full"
                />
              </div>
            </a>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={href}
                  target="_blank"
                  rel={relAttribute}
                  onClick={handleClick}
                  className={cn('font-mono font-bold text-xs sm:text-sm hover:underline transition-colors truncate inline-flex items-center gap-1', currentTheme.title)}
                >
                  <span>{title}</span>
                  {item.is_verified && (
                    <span className="inline-flex items-center text-blue-500 font-bold shrink-0" title="$5 Verified Listing">
                      <BadgeCheck className="size-3.5 fill-blue-500 text-white dark:text-black" />
                    </span>
                  )}
                </a>

                {item.is_for_sale && (
                  <span className="inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 shrink-0">
                    {forSaleBadgeText}
                  </span>
                )}
              </div>

              <p className={cn('font-body text-[11px] sm:text-xs line-clamp-1 mt-0.5', currentTheme.subtext)}>
                {description}
              </p>

              <div className="flex items-center gap-2.5 mt-1 text-[10px] font-sans">
                <span className={cn('inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full', currentTheme.badge)}>
                  <Sparkles className="size-2.5" />
                  {clicks.toLocaleString()} clicks
                </span>
                <span className={currentTheme.subtext}>•</span>
                <span className={currentTheme.subtext}>{item.time || 'recently'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/s/${getListingSlug(item)}`}
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium whitespace-nowrap hidden sm:inline-flex items-center"
              >
                Details →
              </Link>
              <VotePill
                listingId={item.id || ''}
                initialScore={item.net_score || 0}
                initialUserVote={item.user_vote || 0}
                size="sm"
              />
            </div>

            {siteCopy.feed.showPrices && (
              <div className={cn('font-mono font-black text-xs sm:text-sm', currentTheme.title)}>
                {formatBid(item.bid)}
              </div>
            )}

            {onClaimClick && (
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, Math.max(1, item.bid + 1))}
                className="px-3 py-1 rounded-full font-bold text-[11px] text-white bg-blue-600 hover:bg-blue-500 shadow-2xs active:scale-95 transition-all font-sans shrink-0 cursor-pointer"
              >
                {siteCopy.feed.podiumButton}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
