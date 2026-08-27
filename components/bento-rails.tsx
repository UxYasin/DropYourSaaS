'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VotePill } from '@/components/VotePill';
import { PinAdModal } from '@/components/pin-ad-modal';
import { Pin, Target, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaviconImage } from '@/components/favicon-image';

export interface RailCardItem {
  id: string;
  name: string;
  url: string;
  tagline: string;
  net_score: number;
  user_vote?: 1 | -1 | 0;
  category?: string;
  is_pinned?: boolean;
  slot_position?: string;
  is_verified?: boolean;
  bid_cents?: number;
}

interface BentoRailsProps {
  side: 'left' | 'right';
}

const BENTO_THEMES = [
  {
    bg: 'bg-[var(--bento-blue)]',
    border: 'border-blue-300/80 dark:border-blue-800/50',
    text: 'text-blue-950 dark:text-blue-100',
    subtext: 'text-blue-900/80 dark:text-blue-200/80',
    badge: 'bg-blue-500/15 text-blue-900 dark:text-blue-300 border-blue-400/30',
  },
  {
    bg: 'bg-[var(--bento-yellow)]',
    border: 'border-amber-300/80 dark:border-amber-800/50',
    text: 'text-amber-950 dark:text-amber-100',
    subtext: 'text-amber-900/80 dark:text-amber-200/80',
    badge: 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-400/30',
  },
  {
    bg: 'bg-[var(--bento-mint)]',
    border: 'border-emerald-300/80 dark:border-emerald-800/50',
    text: 'text-emerald-950 dark:text-emerald-100',
    subtext: 'text-emerald-900/80 dark:text-emerald-200/80',
    badge: 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border-emerald-400/30',
  },
  {
    bg: 'bg-[var(--bento-pink)]',
    border: 'border-pink-300/80 dark:border-pink-800/50',
    text: 'text-pink-950 dark:text-pink-100',
    subtext: 'text-pink-900/80 dark:text-pink-200/80',
    badge: 'bg-pink-500/15 text-pink-900 dark:text-pink-300 border-pink-400/30',
  },
  {
    bg: 'bg-[var(--bento-lavender)]',
    border: 'border-purple-300/80 dark:border-purple-800/50',
    text: 'text-purple-950 dark:text-purple-100',
    subtext: 'text-purple-900/80 dark:text-purple-200/80',
    badge: 'bg-purple-500/15 text-purple-900 dark:text-purple-300 border-purple-400/30',
  },
  {
    bg: 'bg-[var(--bento-gray)]',
    border: 'border-zinc-300/80 dark:border-zinc-700/50',
    text: 'text-zinc-950 dark:text-zinc-100',
    subtext: 'text-zinc-800/80 dark:text-zinc-300/80',
    badge: 'bg-zinc-500/15 text-zinc-900 dark:text-zinc-300 border-zinc-400/30',
  },
];

let globalPool: RailCardItem[] = [];

export function BentoRails({ side }: BentoRailsProps) {
  const [displayedItems, setDisplayedItems] = useState<RailCardItem[]>([]);
  const [pinnedAds, setPinnedAds] = useState<Record<string, RailCardItem>>({});
  const [isAdSelectionMode, setIsAdSelectionMode] = useState(false);
  const [pinModalState, setPinModalState] = useState<{
    isOpen: boolean;
    slotPosition: string;
    siteUrl: string;
    projectName: string;
  }>({ isOpen: false, slotPosition: `${side}_1`, siteUrl: '', projectName: '' });

  useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const fetchPool = async () => {
      try {
        const res = await fetch('/api/rails-pool');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.pinnedAds) {
              setPinnedAds(data.pinnedAds);
            }
            if (Array.isArray(data.pool) && data.pool.length > 0) {
              globalPool = data.pool;
              const startIdx = side === 'left' ? 0 : 5;
              const slice = data.pool.slice(startIdx, startIdx + 5);
              setDisplayedItems(slice);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load rails pool:', err);
      }
    };

    fetchPool();

    // 8-Second maximum display rotation for unpinned slots (Slots 3, 4, 5)
    const startRotation = () => {
      timerId = setInterval(() => {
        if (!isMounted || globalPool.length < 5) return;

        setDisplayedItems((current) => {
          if (current.length === 0) return current;

          // Only rotate unpinned slots (slots 3, 4, 5)
          const availableSlotIndices = [2, 3, 4].filter((idx) => {
            const slotPos = `${side}_${idx + 1}`;
            return !pinnedAds[slotPos];
          });

          if (availableSlotIndices.length === 0) return current;

          const slotToReplace = availableSlotIndices[Math.floor(Math.random() * availableSlotIndices.length)];

          const currentUrls = new Set(current.map((c) => c.url));
          const candidates = globalPool.filter((p) => !currentUrls.has(p.url));

          if (candidates.length === 0) return current;

          const replacement = candidates[Math.floor(Math.random() * candidates.length)];

          const next = [...current];
          next[slotToReplace] = replacement;
          return next;
        });
      }, 8000);
    };

    startRotation();

    return () => {
      isMounted = false;
      clearInterval(timerId);
    };
  }, [side, pinnedAds]);

  const fallbackCards: RailCardItem[] = [
    { id: 'fb-1', name: side === 'left' ? 'redreplier.com' : 'whop.com', url: 'https://redreplier.com', tagline: 'Verified SaaS · AI-powered Reddit lead generation & social listening tool.', net_score: 15, user_vote: 0, category: 'AI Tools' },
    { id: 'fb-2', name: side === 'left' ? 'trycomp.ai' : 'lathire.com', url: 'https://trycomp.ai', tagline: 'Verified SaaS · Autonomous AI Agents & Intelligent Workflows.', net_score: 9, user_vote: 0, category: 'Developer' },
    { id: 'fb-3', name: side === 'left' ? 'mytb.ai' : 'fiber.so', url: 'https://mytb.ai', tagline: 'Verified SaaS · Productivity & Workspace Automation Suite.', net_score: 12, user_vote: 0, category: 'Productivity' },
    { id: 'fb-4', name: side === 'left' ? 'prelint.com' : 'ranked.ai', url: 'https://prelint.com', tagline: 'Verified SaaS · Developer Code Quality & Automated Linting.', net_score: 7, user_vote: 0, category: 'DevOps' },
    { id: 'fb-5', name: side === 'left' ? 'overskill.com' : 'startglobal.co', url: 'https://overskill.com', tagline: 'Verified SaaS · Global Founder Marketplace & Product Launchpad.', net_score: 18, user_vote: 0, category: 'Marketplace' },
  ];

  const cardsToRender = displayedItems.length === 5 ? displayedItems : fallbackCards;

  const handleOpenPlaceAd = (slotPos: string) => {
    setIsAdSelectionMode(false);
    setPinModalState({
      isOpen: true,
      slotPosition: slotPos,
      siteUrl: '',
      projectName: '',
    });
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col gap-3 w-[290px] sm:w-[305px] lg:w-[315px] xl:w-[325px] shrink-0 sticky top-20 h-fit">
        {[0, 1, 2, 3, 4].map((i) => {
          const slotPos = `${side}_${i + 1}`;
          const isTopTwoSlot = i < 2; // Top 2 slots on each rail
          const pinnedAd = pinnedAds[slotPos];
          const isPinnedAd = Boolean(pinnedAd);
          const defaultCard = cardsToRender[i] || fallbackCards[i];
          const card = pinnedAd || defaultCard;

          const themeIndex = (side === 'left' ? i : i + 3) % BENTO_THEMES.length;
          const theme = BENTO_THEMES[themeIndex];
          const href = `${card.url}${card.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=rail&utm_campaign=${side}`;

          // TOP 2 SLOTS: Monochromatic Minimal "Place an Ad" card with hover reveal
          if (isTopTwoSlot && !isPinnedAd) {
            return (
              <div
                key={slotPos}
                onClick={() => handleOpenPlaceAd(slotPos)}
                className="relative h-[124px] sm:h-[128px] w-full group cursor-pointer select-none"
              >
                <div className="w-full h-full min-h-[124px] sm:min-h-[128px] p-4 rounded-2xl border border-dashed border-zinc-400/40 dark:border-zinc-700/50 bg-white/15 dark:bg-zinc-900/20 hover:bg-white/30 dark:hover:bg-zinc-900/40 hover:border-zinc-500/70 dark:hover:border-zinc-600/70 backdrop-blur-[2px] transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden text-center">
                  {/* Default Monochromatic Resting State: Shows only "Place an Ad" */}
                  <div className="space-y-1.5 transition-all duration-200 group-hover:blur-[3px] group-hover:opacity-15 flex flex-col items-center justify-center">
                    <div className="size-8 rounded-xl bg-zinc-200/40 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                      <Pin className="size-4 fill-current" />
                    </div>
                    <h3 className="font-mono font-bold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                      Place an Ad
                    </h3>
                  </div>

                  {/* Hover Overlay: Monochromatic details + Vibrant Orange Pill Button */}
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/85 dark:bg-zinc-950/85 backdrop-blur-xs space-y-1.5 pointer-events-none">
                    <p className="text-[11px] font-mono text-muted-foreground leading-tight">
                      $100 · 30 days (1st buyer gets 60d!)
                    </p>
                    <div className="px-4 py-1.5 rounded-full bg-[#fe4103] hover:bg-[#e03800] text-white font-mono font-bold text-xs shadow-md flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform duration-150">
                      <span>Place an Ad</span>
                      <ArrowRight className="size-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // SLOTS 3, 4, 5 (or Top Slots with Active Pinned Ads)
          return (
            <div
              key={slotPos}
              className={cn(
                'relative h-[124px] sm:h-[128px] w-full group transition-all duration-200',
                isAdSelectionMode && 'cursor-pointer'
              )}
              onClick={isAdSelectionMode ? () => handleOpenPlaceAd(slotPos) : undefined}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={card.id || card.url}
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: 90, opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className={cn(
                    'w-full h-full min-h-[124px] sm:min-h-[128px] p-4 sm:p-4.5 rounded-2xl border shadow-xs transition-all duration-200 flex flex-col justify-between gap-2 overflow-hidden relative',
                    isAdSelectionMode
                      ? 'border-blue-500/80 bg-blue-500/10 ring-2 ring-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500 hover:scale-[1.02] shadow-lg'
                      : isPinnedAd
                      ? 'bg-gradient-to-br from-[#fe4103]/10 via-background to-[#fe4103]/5 border-[#fe4103]/40 dark:border-[#fe4103]/50 shadow-md ring-1 ring-[#fe4103]/20 hover:shadow-md'
                      : cn(theme.bg, theme.border, 'hover:shadow-md')
                  )}
                >
                  {/* Selection Mode Overlay Button */}
                  {isAdSelectionMode && (
                    <div className="absolute inset-0 z-30 bg-blue-600/15 dark:bg-blue-900/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center p-3 text-center transition-all animate-in fade-in duration-150">
                      <div className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-mono font-black text-xs shadow-xl border border-blue-400/50 flex items-center gap-1.5 transform hover:scale-105 active:scale-95 transition-all">
                        <Target className="size-3.5" />
                        <span>Select Slot #{i + 1}</span>
                      </div>
                    </div>
                  )}

                  {/* Top Row: Favicon, Title, Category Badge / Sponsored Badge & VotePill */}
                  <div className="flex items-start justify-between gap-2.5">
                    <a
                      href={isAdSelectionMode ? undefined : href}
                      target={isAdSelectionMode ? undefined : '_blank'}
                      rel="sponsored noopener noreferrer"
                      className="flex items-center gap-2.5 min-w-0 flex-1"
                      onClick={isAdSelectionMode ? (e) => e.preventDefault() : undefined}
                    >
                      <div className="size-10 sm:size-11 rounded-xl bg-background/90 border border-border/60 p-1 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <FaviconImage
                          url={card.url}
                          name={card.name}
                          size={36}
                          containerClassName="rounded-[6px] size-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={cn('font-bold text-sm sm:text-base truncate hover:underline transition-all', theme.text)}>
                          {card.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isPinnedAd ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#fe4103] text-white border border-[#fe4103]/50 shadow-2xs">
                              <Pin className="size-2.5 fill-current" />
                              <span>Sponsored Pin</span>
                            </span>
                          ) : (
                            <span className={cn('inline-block text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border', theme.badge)}>
                              {card.category || 'SaaS'}
                            </span>
                          )}
                        </div>
                      </div>
                    </a>

                    {/* VotePill */}
                    <div className="shrink-0 pt-0.5" onClick={isAdSelectionMode ? (e) => e.stopPropagation() : undefined}>
                      <VotePill
                        listingId={card.id}
                        initialScore={card.net_score}
                        initialUserVote={card.user_vote}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Bottom Row: 2-Line Truncated Tagline/Description */}
                  <a
                    href={isAdSelectionMode ? undefined : href}
                    target={isAdSelectionMode ? undefined : '_blank'}
                    rel="sponsored noopener noreferrer"
                    className="block pr-6"
                    onClick={isAdSelectionMode ? (e) => e.preventDefault() : undefined}
                  >
                    <p className={cn('text-xs line-clamp-2 leading-relaxed min-h-[32px] flex items-start', theme.subtext)}>
                      {card.tagline || `Verified ${card.name} SaaS tool on DropYourSaaS.`}
                    </p>
                  </a>

                  {/* Hover-to-Reveal Pin Icon Button (Normal Mode) */}
                  {!isAdSelectionMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleOpenPlaceAd(slotPos);
                      }}
                      title="Place an Ad in this spot"
                      className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out cursor-pointer z-10 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full bg-[#fe4103]/70 hover:bg-[#fe4103] text-white shadow-md border border-[#fe4103]/40 backdrop-blur-md font-mono group/pin overflow-hidden"
                    >
                      <span className="text-sm leading-none shrink-0 select-none">📌</span>
                      <span className="max-w-0 group-hover/pin:max-w-[180px] opacity-0 group-hover/pin:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap text-[11px] font-bold tracking-tight pr-1">
                        Place an Ad in this spot
                      </span>
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })}

        {/* Monochromatic "Place an Ad" Footer Button */}
        <button
          type="button"
          onClick={() => handleOpenPlaceAd(`${side}_1`)}
          className="w-full mt-1 py-2 text-xs transition-all flex items-center justify-center gap-1.5 font-mono font-medium rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer active:scale-95 shadow-2xs"
        >
          <Pin className="size-3 text-zinc-400" />
          <span>Place an Ad ($100 · 30–60d)</span>
        </button>
      </aside>

      <PinAdModal
        isOpen={pinModalState.isOpen}
        onClose={() => setPinModalState({ isOpen: false, slotPosition: `${side}_1`, siteUrl: '', projectName: '' })}
        slotPosition={pinModalState.slotPosition}
        defaultSiteUrl={pinModalState.siteUrl}
        defaultProjectName={pinModalState.projectName}
      />
    </>
  );
}
