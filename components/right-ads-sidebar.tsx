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
          'w-full lg:w-[260px] xl:w-[280px] 2xl:w-[290px] shrink-0 space-y-4 select-none lg:sticky lg:top-20 h-fit',
          className
        )}
      >
        {/* LaunchIt Style Hand-Picked Header */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-muted-foreground">
            HAND-PICKED
          </span>
          <h3 className="font-mono font-bold text-sm text-foreground">
            Featured
          </h3>
        </div>

        {/* SLOTS 1 TO 4 (STATIC SPONSORED / AVAILABLE PAID AD SLOTS) */}
        <div className="space-y-2.5">
          {STATIC_SLOTS.map((slotConfig, idx) => {
            const slotKey = slotConfig.slot;
            const activeAd = pinnedAds[slotKey] || pinnedAds[`left_${idx + 1}`];

            // 1. ACTIVE SPONSOR CARD
            if (activeAd) {
              const href = `${activeAd.url}${activeAd.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=sponsored_slot&utm_campaign=${slotKey}`;

              return (
                <a
                  key={slotKey}
                  href={href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={() => trackEvent('outbound_click', { url: activeAd.url, source: 'sponsored_slot' })}
                  className="group relative rounded-2xl border border-border/80 bg-card p-3 shadow-2xs hover:border-border hover:shadow-xs transition-all duration-150 flex items-center justify-between gap-2.5 block"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-8 rounded-xl bg-muted/60 border border-border/60 p-0.5 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaviconImage
                        url={activeAd.url}
                        name={activeAd.name}
                        size={24}
                        containerClassName="rounded size-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-xs text-foreground truncate group-hover:text-blue-500 transition-colors">
                          {activeAd.name}
                        </h4>
                        <span className="text-blue-500 font-bold text-[10px]">✔</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate leading-relaxed">
                        {activeAd.tagline || 'Verified sponsor tool'}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                </a>
              );
            }

            // 2. UNCLAIMED / AVAILABLE AD SLOT (LaunchIt Style)
            return (
              <div
                key={slotKey}
                onClick={() => handleOpenAd(slotKey)}
                className="relative rounded-2xl p-3 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex items-center justify-between gap-2 border border-dashed border-border/80 hover:border-border bg-muted/20 hover:bg-muted/40 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-muted/80 border border-dashed border-border flex items-center justify-center text-muted-foreground font-mono font-bold text-xs shrink-0">
                    {slotConfig.slotNumber}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold text-foreground">
                        {slotConfig.label}
                      </span>
                      {slotConfig.badge && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                          {slotConfig.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {slotConfig.price} · Pinned 24/7
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-2.5 py-1 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-mono font-bold shrink-0 group-hover:scale-105 transition-transform"
                >
                  Pin
                </button>
              </div>
            );
          })}
        </div>

        {/* Global Action: + Advertise Here */}
        <button
          type="button"
          onClick={() => handleOpenAd('right_1')}
          className="w-full py-2 px-3 rounded-2xl border border-border/80 hover:border-foreground/40 bg-card hover:bg-muted/50 text-xs font-mono font-bold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <span>+ Advertise here</span>
          <ArrowRight className="size-3" />
        </button>
      </aside>

      <PinAdModal
        isOpen={pinModalState.isOpen}
        onClose={() => setPinModalState({ isOpen: false, slotPosition: 'right_1' })}
        slotPosition={pinModalState.slotPosition}
      />
    </>
  );
}
