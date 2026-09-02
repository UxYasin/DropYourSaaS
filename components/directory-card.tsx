'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Sparkles, Clock, ExternalLink, BadgeCheck, Eye, MessageSquare, ArrowRight, Zap } from 'lucide-react';
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

  // VARIANT: TOP 1 SPOTLIGHT (High Impact with Preview Image on Large Screens)
  if (variant === 'top1' || item.rank === 1) {
    return (
      <div ref={containerRef} className="group relative my-1.5">
        <Card className="relative rounded-2xl border border-amber-500/40 bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden text-foreground">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            {/* Left Column: Rank + Favicon + Details + Outbound Link */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="size-8 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                1 🥇
              </div>

              <a
                href={href}
                target="_blank"
                rel={relAttribute}
                onClick={handleClick}
                className="shrink-0"
              >
                <div className="size-11 sm:size-12 rounded-xl bg-background border border-border p-1 shadow-xs flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
                  <FaviconImage
                    url={item.url}
                    name={item.name}
                    src={meta?.favicon}
                    size={38}
                    containerClassName="rounded-lg size-full"
                  />
                </div>
              </a>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <a
                    href={href}
                    target="_blank"
                    rel={relAttribute}
                    onClick={handleClick}
                    className="font-heading font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 min-w-0 max-w-full"
                  >
                    <span className="truncate">{title}</span>
                    {item.is_verified && (
                      <span className="inline-flex items-center text-primary font-bold shrink-0" title="Verified SaaS Listing">
                        <BadgeCheck className="size-4 fill-primary text-white dark:text-black" />
                      </span>
                    )}
                    <ExternalLink className="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 shrink-0">
                    👑 RANK #1
                  </span>

                  {item.is_for_sale && (
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                      {forSaleBadgeText}
                    </span>
                  )}
                </div>

                <p className="font-sans text-xs sm:text-[13px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {description}
                </p>

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-sans flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px]">
                    <Eye className="size-3 opacity-70" />
                    {clicks.toLocaleString()} views
                  </span>
                  {item.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-sans">
                      {item.category}
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground/70">
                    {item.time || 'just now'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Voting Pill, Price & Action CTA */}
            <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/50 w-full lg:w-auto">
              <Link
                href={`/s/${getListingSlug(item)}`}
                className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground font-sans font-medium transition-colors"
              >
                Page ➔
              </Link>

              {siteCopy.feed.showPrices && (
                <span className="font-bold text-sm sm:text-base text-foreground font-sans">
                  {formatBid(item.bid)}
                </span>
              )}

              <VotePill
                listingId={item.id || ''}
                initialScore={item.net_score || 0}
                initialUserVote={item.user_vote || 0}
                size="md"
              />

              {onClaimClick && (
                <button
                  type="button"
                  onClick={() => onClaimClick(item.rank, Math.max(1, item.bid + 1))}
                  className="px-3.5 py-1.5 rounded-full font-bold text-xs text-white bg-primary hover:bg-[#76439c] active:bg-[#5b2d7d] shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  Outbid
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // VARIANT: HIGH-DENSITY LISTING ROW (LaunchIt Standard Directory Row)
  const isPodium2 = item.rank === 2;
  const isPodium3 = item.rank === 3;
  const rankLabel = isPodium2 ? '2 🥈' : isPodium3 ? '3 🥉' : `${item.rank}`;

  return (
    <div ref={containerRef} className="group relative">
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-3.5 hover:border-primary/40 hover:shadow-sm transition-all duration-150">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Rank + Favicon + Content */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
              className={cn(
                'text-xs sm:text-sm font-bold shrink-0 w-7 text-center font-sans',
                isPodium2 && 'text-zinc-700 dark:text-zinc-300',
                isPodium3 && 'text-amber-700 dark:text-amber-400',
                !isPodium2 && !isPodium3 && 'text-muted-foreground font-semibold'
              )}
            >
              {rankLabel}
            </span>

            <a
              href={href}
              target="_blank"
              rel={relAttribute}
              onClick={handleClick}
              className="shrink-0"
            >
              <div className="size-9 sm:size-10 rounded-xl bg-muted/60 border border-border/80 p-1 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shadow-xs">
                <FaviconImage
                  url={item.url}
                  name={item.name}
                  src={meta?.favicon}
                  size={32}
                  containerClassName="rounded-md size-full"
                />
              </div>
            </a>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <a
                  href={href}
                  target="_blank"
                  rel={relAttribute}
                  onClick={handleClick}
                  className="font-heading font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 min-w-0"
                >
                  <span className="truncate">{title}</span>
                  {item.is_verified && (
                    <span className="inline-flex items-center text-primary font-bold shrink-0 ml-0.5" title="Verified SaaS Listing">
                      <BadgeCheck className="size-3.5 fill-primary text-white dark:text-black" />
                    </span>
                  )}
                </a>

                {item.is_for_sale && (
                  <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                    {forSaleBadgeText}
                  </span>
                )}
              </div>

              <p className="font-sans text-[11px] sm:text-xs text-muted-foreground truncate leading-relaxed">
                {description}
              </p>

              <div className="flex items-center gap-2.5 pt-0.5 text-[10px] text-muted-foreground font-sans">
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-2.5 opacity-60" />
                  {clicks.toLocaleString()}
                </span>
                {item.category && (
                  <span className="px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground font-sans hidden sm:inline-block">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Outbid Button, Price & Vote Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/s/${getListingSlug(item)}`}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground font-sans hidden md:inline-flex"
            >
              Page ➔
            </Link>

            {siteCopy.feed.showPrices && (
              <span className="font-bold text-xs sm:text-sm text-foreground shrink-0 hidden sm:inline-block font-sans">
                {formatBid(item.bid)}
              </span>
            )}

            <VotePill
              listingId={item.id || ''}
              initialScore={item.net_score || 0}
              initialUserVote={item.user_vote || 0}
              size="sm"
            />

            {onClaimClick && (
              <button
                type="button"
                onClick={() => onClaimClick(item.rank, Math.max(1, item.bid + 1))}
                className="px-3 py-1 rounded-full font-bold text-[11px] text-white bg-primary hover:bg-[#76439c] active:bg-[#5b2d7d] shadow-xs active:scale-95 transition-all font-sans shrink-0 cursor-pointer"
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
