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

  // VARIANT: GRID (Directory page)
  if (variant === 'grid' || (!variant && typeof index === 'number')) {
    return (
      <div ref={containerRef} className="group relative h-full">
        <div className="rounded-2xl border border-border/80 dark:border-white/10 bg-card/90 dark:bg-[#161822] p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-border transition-all duration-150 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <a href={href} target="_blank" rel={relAttribute} onClick={handleClick} className="shrink-0">
                  <div className="size-12 rounded-xl bg-background border border-border/60 p-1 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                    <FaviconImage url={item.url} name={item.name} src={meta?.favicon} size={40} containerClassName="rounded-lg size-full" />
                  </div>
                </a>
                <div className="min-w-0 flex-1">
                  <a href={href} target="_blank" rel={relAttribute} onClick={handleClick} className="font-mono font-bold text-sm sm:text-base text-foreground hover:text-blue-500 transition-colors inline-flex items-center gap-1 min-w-0 max-w-full">
                    <span className="truncate">{title}</span>
                    {item.is_verified && (
                      <span className="inline-flex items-center text-blue-500 font-bold shrink-0 ml-0.5">
                        <BadgeCheck className="size-4 fill-blue-500 text-white dark:text-black" />
                      </span>
                    )}
                  </a>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-[11px] font-sans">
            <span className="text-muted-foreground flex items-center gap-1">{item.time}</span>
            <span className="font-mono font-bold text-foreground text-sm">{formatBid(item.bid)}</span>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD LEADERBOARD LIST CARD (Matching Sample Photo)
  const isTop1 = item.rank === 1;

  return (
    <div ref={containerRef} className="group relative">
      <div className="rounded-2xl border border-border/80 dark:border-white/10 bg-card/90 dark:bg-[#161822] p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-border/90 transition-all duration-150">
        <div className="flex items-center justify-between gap-4">
          {/* Left Block: Rank + Icon + Info */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
            {/* Rank Indicator */}
            {isTop1 ? (
              <div className="size-7 sm:size-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                #1
              </div>
            ) : (
              <div className="w-7 sm:w-8 text-center font-mono font-bold text-xs sm:text-sm text-muted-foreground shrink-0">
                #{item.rank}
              </div>
            )}

            {/* Favicon / Product Logo */}
            <a
              href={href}
              target="_blank"
              rel={relAttribute}
              onClick={handleClick}
              className="shrink-0"
            >
              <div className="size-11 sm:size-12 rounded-xl bg-background border border-border/80 p-1 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform shadow-2xs">
                <FaviconImage
                  url={item.url}
                  name={item.name}
                  src={meta?.favicon}
                  size={38}
                  containerClassName="rounded-lg size-full"
                />
              </div>
            </a>

            {/* Text Information */}
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <a
                  href={href}
                  target="_blank"
                  rel={relAttribute}
                  onClick={handleClick}
                  className="font-mono font-bold text-sm sm:text-base text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 min-w-0 max-w-full"
                >
                  <span className="truncate">{title}</span>
                  {item.is_verified && (
                    <span className="inline-flex items-center text-blue-500 font-bold shrink-0">
                      <BadgeCheck className="size-4 fill-blue-500 text-white dark:text-black" />
                    </span>
                  )}
                  <ExternalLink className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </a>

                {item.is_for_sale && (
                  <span className="inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                    {forSaleBadgeText}
                  </span>
                )}
              </div>

              <p className="font-body text-xs sm:text-[13px] text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">
                {description}
              </p>

              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground font-sans">
                <span>{item.time || 'recently'}</span>
                <span>•</span>
                <span>{clicks.toLocaleString()} clicks</span>
              </div>
            </div>
          </div>

          {/* Right Block: Price + Outbid Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="font-mono font-black text-xl sm:text-2xl text-foreground tracking-tight">
              {formatBid(item.bid)}
            </div>

            {onClaimClick && (
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, Math.max(1, item.bid + 1))}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full font-mono font-bold text-xs text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs hidden sm:inline-flex items-center cursor-pointer"
              >
                Outbid →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
