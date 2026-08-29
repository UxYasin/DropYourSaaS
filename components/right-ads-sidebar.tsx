'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, Sparkles, Pin, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaviconImage } from '@/components/favicon-image';
import { PinAdModal } from '@/components/pin-ad-modal';
import { trackEvent } from '@/lib/analytics';
import type { LeaderboardItem } from '@/lib/leaderboard-data';

interface PinnedAdItem {
  id: string;
  name: string;
  url: string;
  tagline: string;
  logo_url?: string;
  slot_position: string;
  is_verified?: boolean;
}

const STATIC_SLOTS = [
  {
    slot: 'right_1',
    slotNumber: '#1',
    label: 'AD SLOT #1',
    originalPrice: '$150',
    price: '$100/month',
    badge: 'TOP PINNED',
    description: 'Top-pinned spot across all pages with permanent 24/7 side visibility.',
  },
  {
    slot: 'right_2',
    slotNumber: '#2',
    label: 'AD SLOT #2',
    originalPrice: '$50',
    price: '$39/month',
    badge: null,
    description: 'High-visibility sticky sidebar placement with direct dofollow link.',
  },
  {
    slot: 'right_3',
    slotNumber: '#3',
    label: 'AD SLOT #3',
    originalPrice: '$50',
    price: '$39/month',
    badge: 'LIMITED TIME',
    description: 'Targeted SaaS audience, indie founders, and angel investors.',
  },
  {
    slot: 'right_4',
    slotNumber: '#4',
    label: 'AD SLOT #4',
    originalPrice: '$10',
    price: '$5/day',
    badge: null,
    description: 'Permanent dofollow backlink and qualified founder traffic.',
  },
];

export function RightAdsSidebar({ className }: { className?: string }) {
  const [pinnedAds, setPinnedAds] = useState<Record<string, PinnedAdItem>>({});
  const [listingsPool, setListingsPool] = useState<LeaderboardItem[]>([]);
  const [slot5Index, setSlot5Index] = useState(0);
  const [slot6Index, setSlot6Index] = useState(1);
  const [animKey5, setAnimKey5] = useState(0);
  const [animKey6, setAnimKey6] = useState(0);

  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    slotPosition: string;
  }>({ isOpen: false, slotPosition: 'right_1' });

  // Fetch pinned ads and listings pool
  useEffect(() => {
    let isMounted = true;
    const fetchAdsAndListings = async () => {
      try {
        const [adsRes, listRes] = await Promise.all([
          fetch('/api/rails-pool'),
          fetch('/api/leaderboard?limit=30'),
        ]);

        if (adsRes.ok) {
          const adsData = await adsRes.json();
          if (isMounted && adsData.pinnedAds) {
            setPinnedAds(adsData.pinnedAds);
          }
        }

        if (listRes.ok) {
          const listData = await listRes.json();
          const items = Array.isArray(listData) ? listData : listData?.items || [];
          if (isMounted && items.length > 0) {
            setListingsPool(items);
          }
        }
      } catch {}
    };

    fetchAdsAndListings();
    return () => {
      isMounted = false;
    };
  }, []);

  // 5-Second Interval Slow-Up Animation for Bottom 2 Rotating Slots
  useEffect(() => {
    if (listingsPool.length < 2) return;

    const interval = setInterval(() => {
      setSlot5Index((prev) => (prev + 1) % listingsPool.length);
      setAnimKey5((k) => k + 1);

      // Slightly offset slot 6 to create staggered dynamic motion
      setTimeout(() => {
        setSlot6Index((prev) => (prev + 2) % listingsPool.length);
        setAnimKey6((k) => k + 1);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, [listingsPool.length]);

  const handleOpenAd = (slot: string) => {
    setPinModalState({
      isOpen: true,
      slotPosition: slot,
    });
  };

  const itemSlot5 = listingsPool[slot5Index] || listingsPool[0];
  const itemSlot6 = listingsPool[slot6Index] || listingsPool[1];

  return (
    <>
      <aside
        className={cn(
          'hidden xl:flex flex-col gap-3 w-[260px] lg:w-[270px] xl:w-[285px] 2xl:w-[300px] shrink-0 sticky top-20 h-fit select-none',
          className
        )}
      >
        {/* SLOTS 1 TO 4 (STATIC SPONSORED / AVAILABLE PAID AD SLOTS) */}
        {STATIC_SLOTS.map((slotConfig, idx) => {
          const slotKey = slotConfig.slot;
          const activeAd = pinnedAds[slotKey] || pinnedAds[`left_${idx + 1}`];

          // 1. ACTIVE SPONSOR CARD
          if (activeAd) {
            const href = `${activeAd.url}${activeAd.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=sponsored_slot&utm_campaign=${slotKey}`;

            return (
              <div
                key={slotKey}
                className="relative rounded-2xl border border-border/80 dark:border-white/10 bg-card/90 dark:bg-[#161822] p-3.5 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-8 rounded-xl bg-background border border-border/80 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                      <FaviconImage
                        url={activeAd.url}
                        name={activeAd.name}
                        size={24}
                        containerClassName="rounded size-full"
                      />
                    </div>
                    <h4 className="font-bold text-xs text-foreground truncate">
                      {activeAd.name}
                    </h4>
                  </div>
                  <span className="text-[9px] font-mono tracking-wider text-muted-foreground uppercase">
                    SPONSORED
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {activeAd.tagline || 'Verified sponsor on DropYourSaaS.'}
                </p>

                <a
                  href={href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={() => trackEvent('outbound_click', { url: activeAd.url, source: 'sponsored_slot' })}
                  className="w-full py-1.5 px-3 rounded-full bg-muted/70 hover:bg-muted text-foreground text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <span>Visit →</span>
                </a>
              </div>
            );
          }

          // 2. UNCLAIMED / AVAILABLE AD SLOT
          return (
            <div
              key={slotKey}
              onClick={() => handleOpenAd(slotKey)}
              className="relative rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col items-center justify-between gap-2 text-center border border-border/80 dark:border-white/10 bg-card/90 dark:bg-[#161822] hover:bg-muted/30"
            >
              {/* Header: Slot Name + Sponsored Label / Badge */}
              <div className="w-full flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                <span className="uppercase font-semibold tracking-wide">
                  {slotConfig.label}
                </span>
                <div className="flex items-center gap-1">
                  {slotConfig.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[8px] font-bold uppercase',
                        slotConfig.badge === 'LIMITED TIME'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      )}
                    >
                      {slotConfig.badge}
                    </span>
                  )}
                  <span className="uppercase">SPONSORED</span>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline justify-center gap-1.5 font-mono">
                {slotConfig.originalPrice && (
                  <span className="text-xs text-muted-foreground/60 line-through">
                    {slotConfig.originalPrice}
                  </span>
                )}
                <span className="text-base font-black text-foreground">
                  {slotConfig.price}
                </span>
              </div>

              {/* Take Spot Button (Pill shaped) */}
              <button
                type="button"
                className="w-full py-1.5 px-4 rounded-full bg-background hover:bg-muted/80 text-foreground font-mono font-bold text-[10px] tracking-wider uppercase border border-border/80 shadow-2xs transition-all flex items-center justify-center cursor-pointer"
              >
                <span>TAKE THIS SPOT</span>
              </button>
            </div>
          );
        })}

        {/* BOTTOM 2 SLOTS: ANIMATED SLOW-UP ROTATING SHOWCASE SLOTS (SLOT #5 & SLOT #6) */}
        
        {/* SLOT #5: ANIMATED SLOW-UP SHOWCASE */}
        <div className="relative rounded-2xl border border-blue-500/30 dark:border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-card p-3.5 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="w-full flex items-center justify-between text-[9px] font-mono text-muted-foreground mb-2">
            <span className="font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
              <Sparkles className="size-2.5" />
              AD SLOT #5
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase text-[8px]">
              ROTATING 5S
            </span>
          </div>

          {/* Animated Listing Content (Slow-Up Slide & Fade Animation) */}
          {itemSlot5 ? (
            <div
              key={`slot5-${animKey5}-${itemSlot5.name}`}
              className="animate-in fade-in slide-in-from-bottom-2 duration-700 space-y-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-8 rounded-xl bg-background border border-border/80 p-0.5 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                  <FaviconImage
                    url={itemSlot5.url}
                    name={itemSlot5.name}
                    size={24}
                    containerClassName="rounded size-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-foreground truncate">
                    {itemSlot5.name}
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Rank #{itemSlot5.rank || 1} · {itemSlot5.clicks || 0} clicks
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {itemSlot5.description || 'Verified product active on DropYourSaaS.'}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`${itemSlot5.url}${itemSlot5.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=slot5_spotlight`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('outbound_click', { url: itemSlot5.url, source: 'ad_slot_5' })}
                  className="flex-1 py-1 px-3 rounded-full bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-500/20 text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <span>Visit</span>
                  <ArrowRight className="size-3" />
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenAd('right_5')}
                  className="py-1 px-2.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-mono font-semibold transition-all cursor-pointer"
                  title="Claim Slot #5 permanently"
                >
                  Promote ($15)
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-muted-foreground font-mono">
              Loading spotlight...
            </div>
          )}
        </div>

        {/* SLOT #6: ANIMATED SLOW-UP SHOWCASE */}
        <div className="relative rounded-2xl border border-purple-500/30 dark:border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-card to-card p-3.5 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="w-full flex items-center justify-between text-[9px] font-mono text-muted-foreground mb-2">
            <span className="font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1">
              <TrendingUp className="size-2.5" />
              AD SLOT #6
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold uppercase text-[8px]">
              LIVE DISCOVERY
            </span>
          </div>

          {/* Animated Listing Content (Slow-Up Slide & Fade Animation) */}
          {itemSlot6 ? (
            <div
              key={`slot6-${animKey6}-${itemSlot6.name}`}
              className="animate-in fade-in slide-in-from-bottom-2 duration-700 space-y-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-8 rounded-xl bg-background border border-border/80 p-0.5 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                  <FaviconImage
                    url={itemSlot6.url}
                    name={itemSlot6.name}
                    size={24}
                    containerClassName="rounded size-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-foreground truncate">
                    {itemSlot6.name}
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Rank #{itemSlot6.rank || 2} · {itemSlot6.clicks || 0} clicks
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {itemSlot6.description || 'Verified product active on DropYourSaaS.'}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`${itemSlot6.url}${itemSlot6.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=slot6_discovery`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('outbound_click', { url: itemSlot6.url, source: 'ad_slot_6' })}
                  className="flex-1 py-1 px-3 rounded-full bg-purple-600/10 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-500/20 text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <span>Visit</span>
                  <ArrowRight className="size-3" />
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenAd('right_6')}
                  className="py-1 px-2.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-mono font-semibold transition-all cursor-pointer"
                  title="Claim Slot #6 permanently"
                >
                  Promote ($15)
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-muted-foreground font-mono">
              Loading discovery...
            </div>
          )}
        </div>
      </aside>

      <PinAdModal
        isOpen={pinModalState.isOpen}
        onClose={() => setPinModalState({ isOpen: false, slotPosition: 'right_1' })}
        slotPosition={pinModalState.slotPosition}
      />
    </>
  );
}
