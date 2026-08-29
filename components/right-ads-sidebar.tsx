'use client';

import React, { useState, useEffect } from 'react';
import { Pin, ArrowRight, ExternalLink, Sparkles, Zap, ShieldCheck } from 'lucide-react';
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
    label: 'SPONSORED #1',
    price: '$100/month',
    badge: '60-DAY BONUS',
    description: 'Top-pinned spot across all pages with permanent visibility.',
  },
  {
    slot: 'right_2',
    label: 'AD SLOT #2',
    price: '$39/month',
    badge: 'POPULAR',
    description: 'High-visibility sidebar banner with direct dofollow backlink.',
  },
  {
    slot: 'right_3',
    label: 'AD SLOT #3',
    price: '$39/month',
    badge: 'LIMITED TIME',
    description: 'Targeted SaaS audience, founders, and dev tools investors.',
  },
  {
    slot: 'right_4',
    label: 'AD SLOT #4',
    price: '$29/month',
    badge: null,
    description: 'Boost qualified referral clicks directly to your landing page.',
  },
  {
    slot: 'right_5',
    label: 'PREMIUM SLOT #5',
    price: '$19/month',
    badge: null,
    description: 'Permanent dofollow SEO link and 24/7 side visibility.',
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
          'hidden xl:flex flex-col gap-3.5 w-[290px] 2xl:w-[310px] shrink-0 sticky top-20 h-fit select-none',
          className
        )}
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between px-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5 font-bold text-foreground/80">
            <Sparkles className="size-3 text-blue-500" />
            Sponsored Slots
          </span>
          <span className="text-[10px] text-blue-500/90 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            Instant Ads
          </span>
        </div>

        {/* 5 Dedicated Ad Slots */}
        {DEFAULT_SLOTS.map((slotConfig, idx) => {
          const slotKey = slotConfig.slot;
          const activeAd = pinnedAds[slotKey] || pinnedAds[`left_${idx + 1}`];

          // 1. ACTIVE SPONSOR CARD
          if (activeAd) {
            const href = `${activeAd.url}${activeAd.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=sponsored_slot&utm_campaign=${slotKey}`;

            return (
              <div
                key={slotKey}
                className="group relative rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-card to-purple-500/5 p-4 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="size-9 rounded-xl bg-background border border-border/80 p-1 shrink-0 overflow-hidden flex items-center justify-center shadow-xs">
                      <FaviconImage
                        url={activeAd.url}
                        name={activeAd.name}
                        size={28}
                        containerClassName="rounded-md size-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-blue-500 transition-colors">
                        {activeAd.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-blue-500 inline-flex items-center gap-1">
                        <Pin className="size-2.5 fill-current" />
                        <span>Sponsored</span>
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {activeAd.tagline || 'Verified sponsor on DropYourSaaS.'}
                </p>

                <a
                  href={href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  onClick={() => trackEvent('outbound_click', { url: activeAd.url, source: 'sponsored_slot' })}
                  className="w-full py-1.5 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-500/30 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all duration-150 shadow-2xs"
                >
                  <span>Visit Product</span>
                  <ArrowRight className="size-3" />
                </a>
              </div>
            );
          }

          // 2. AVAILABLE / UNCLAIMED AD SLOT
          return (
            <div
              key={slotKey}
              onClick={() => handleOpenAd(slotKey)}
              className="group relative rounded-2xl border border-dashed border-border/80 hover:border-blue-500/60 bg-card/60 hover:bg-card/95 p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-between gap-2.5 overflow-hidden"
            >
              {/* Top Slot Header */}
              <div className="w-full flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="font-bold tracking-wider text-muted-foreground/90 uppercase">
                  {slotConfig.label}
                </span>
                {slotConfig.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 text-[9px]">
                    {slotConfig.badge}
                  </span>
                )}
              </div>

              {/* Price & Pitch */}
              <div className="space-y-1">
                <div className="font-mono font-black text-base text-foreground group-hover:text-blue-500 transition-colors">
                  {slotConfig.price}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                  {slotConfig.description}
                </p>
              </div>

              {/* Take Spot Action Button */}
              <button
                type="button"
                className="w-full py-1.5 px-3 rounded-xl bg-muted/80 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 text-foreground group-hover:text-white font-mono font-bold text-[11px] border border-border group-hover:border-transparent transition-all duration-150 flex items-center justify-center gap-1 shadow-2xs"
              >
                <span>TAKE THIS SPOT</span>
                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}

        {/* Guaranteed Visibility Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-card border border-blue-500/20 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-foreground">
            <ShieldCheck className="size-3.5 text-blue-500" />
            <span>Guaranteed Dofollow Link</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-body leading-tight">
            Every ad placement receives live instant activation + dedicated backlink.
          </p>
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
