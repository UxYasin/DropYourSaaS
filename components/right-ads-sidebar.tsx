'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaviconImage } from '@/components/favicon-image';
import { PinAdModal } from '@/components/pin-ad-modal';
import { trackEvent } from '@/lib/analytics';

interface PinnedAdItem {
  id: string;
  name: string;
  url: string;
  tagline: string;
  logo_url?: string;
  slot_position: string;
  is_verified?: boolean;
}

const DEFAULT_SLOTS = [
  {
    slot: 'right_1',
    slotNumber: '#1',
    label: 'AD SLOT #1',
    originalPrice: '$150',
    price: '$100/month',
    badge: 'TOP PINNED',
    description: 'Shipkit builds fixed-price MVPs for non-technical founders. SaaS, AI apps...',
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
    description: 'Permanent dofollow backlink and 24/7 side placement.',
  },
  {
    slot: 'right_5',
    slotNumber: '#5',
    label: 'AD SLOT #5',
    originalPrice: null,
    price: '$15/d',
    badge: 'PREMIUM',
    description: 'Premium right-rail slot with priority rank exposure.',
  },
];

export function RightAdsSidebar({ className }: { className?: string }) {
  const [pinnedAds, setPinnedAds] = useState<Record<string, PinnedAdItem>>({});
  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    slotPosition: string;
  }>({ isOpen: false, slotPosition: 'right_1' });

  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/rails-pool');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.pinnedAds) {
            setPinnedAds(data.pinnedAds);
          }
        }
      } catch {}
    };
    fetchAds();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAd = (slot: string) => {
    setPinModalState({
      isOpen: true,
      slotPosition: slot,
    });
  };

  return (
    <>
      <aside
        className={cn(
          'hidden xl:flex flex-col gap-3 w-[260px] lg:w-[270px] xl:w-[285px] 2xl:w-[300px] shrink-0 sticky top-20 h-fit select-none',
          className
        )}
      >
        {/* 5 Sponsored Ad Slots Matching Sample Layout */}
        {DEFAULT_SLOTS.map((slotConfig, idx) => {
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
          const isPremium = slotConfig.badge === 'PREMIUM';

          return (
            <div
              key={slotKey}
              onClick={() => handleOpenAd(slotKey)}
              className={cn(
                'relative rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col items-center justify-between gap-2 text-center',
                isPremium
                  ? 'border border-dashed border-border/80 dark:border-white/20 bg-muted/20 hover:bg-muted/40'
                  : 'border border-border/80 dark:border-white/10 bg-card/90 dark:bg-[#161822] hover:bg-muted/30'
              )}
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
                          : slotConfig.badge === 'PREMIUM'
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-black'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      )}
                    >
                      {slotConfig.badge}
                    </span>
                  )}
                  {!isPremium && <span className="uppercase">SPONSORED</span>}
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
      </aside>

      <PinAdModal
        isOpen={pinModalState.isOpen}
        onClose={() => setPinModalState({ isOpen: false, slotPosition: 'right_1' })}
        slotPosition={pinModalState.slotPosition}
      />
    </>
  );
}
