'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { VotePill } from '@/components/VotePill';
import { PinAdModal, formatSlotLabel } from '@/components/pin-ad-modal';
import { Pin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      } catch {}
    };

    fetchPool();

    // Staggered card flip interval (every 5 to 12 seconds)
    const scheduleNextFlip = () => {
      const randomDelay = Math.floor(Math.random() * 7000) + 5000;

      timerId = setTimeout(() => {
        if (!isMounted) return;

        setDisplayedItems((prevDisplayed) => {
          if (prevDisplayed.length < 5 || globalPool.length <= 10) return prevDisplayed;

          const currentlyShownUrls = new Set(prevDisplayed.map((i) => i.url));
          const unshownCandidates = globalPool.filter((item) => !currentlyShownUrls.has(item.url));
          if (unshownCandidates.length === 0) return prevDisplayed;

          const updated = [...prevDisplayed];

          // Determine indices that do NOT have a pinned ad
          const availableSlots: number[] = [];
          for (let i = 0; i < 5; i++) {
            const slotPos = `${side}_${i + 1}`;
            if (!pinnedAds[slotPos]) {
              availableSlots.push(i);
            }
          }

          if (availableSlots.length === 0) return prevDisplayed;

          const countToFlip = Math.random() > 0.8 && unshownCandidates.length >= 2 && availableSlots.length >= 2 ? 2 : 1;

          for (let c = 0; c < countToFlip; c++) {
            if (availableSlots.length === 0 || unshownCandidates.length === 0) break;
            const slotIdx = Math.floor(Math.random() * availableSlots.length);
            const targetSlotIndex = availableSlots[slotIdx];
            availableSlots.splice(slotIdx, 1);

            const candidateIdx = Math.floor(Math.random() * unshownCandidates.length);
            const newItem = unshownCandidates[candidateIdx];
            unshownCandidates.splice(candidateIdx, 1);

            updated[targetSlotIndex] = newItem;
          }

          return updated;
        });

        scheduleNextFlip();
      }, randomDelay);
    };

    scheduleNextFlip();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [side, pinnedAds]);

  // Fallback cards if pool is loading
  const fallbackCards: RailCardItem[] = [
    { id: 'fb-1', name: side === 'left' ? 'outrank.so' : 'orynth.dev', url: 'https://outrank.so', tagline: 'Verified SaaS · SEO & AI Visibility Platform for modern founders.', net_score: 14, user_vote: 0, category: 'AI Tools' },
    { id: 'fb-2', name: side === 'left' ? 'trycomp.ai' : 'lathire.com', url: 'https://trycomp.ai', tagline: 'Verified SaaS · Autonomous AI Agents & Intelligent Workflows.', net_score: 9, user_vote: 0, category: 'Developer' },
    { id: 'fb-3', name: side === 'left' ? 'mytb.ai' : 'fiber.so', url: 'https://mytb.ai', tagline: 'Verified SaaS · Productivity & Workspace Automation Suite.', net_score: 12, user_vote: 0, category: 'Productivity' },
    { id: 'fb-4', name: side === 'left' ? 'prelint.com' : 'ranked.ai', url: 'https://prelint.com', tagline: 'Verified SaaS · Developer Code Quality & Automated Linting.', net_score: 7, user_vote: 0, category: 'DevOps' },
    { id: 'fb-5', name: side === 'left' ? 'overskill.com' : 'startglobal.co', url: 'https://overskill.com', tagline: 'Verified SaaS · Global Founder Marketplace & Product Launchpad.', net_score: 18, user_vote: 0, category: 'Marketplace' },
  ];

  const cardsToRender = displayedItems.length === 5 ? displayedItems : fallbackCards;

  return (
    <>
      <aside className="hidden lg:flex flex-col gap-3 w-72 sm:w-[285px] shrink-0 sticky top-20 h-fit">
        {cardsToRender.map((defaultCard, i) => {
          const slotPos = `${side}_${i + 1}`;
          // Check if active pinned ad exists for this specific slot position
          const card = pinnedAds[slotPos] || defaultCard;
          const isPinnedAd = Boolean(pinnedAds[slotPos]);

          const themeIndex = (side === 'left' ? i : i + 3) % BENTO_THEMES.length;
          const theme = BENTO_THEMES[themeIndex];
          const favicon = `https://www.google.com/s2/favicons?domain=${card.name}&sz=128`;
          const href = `${card.url}${card.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=rail&utm_campaign=${side}`;

          return (
            <div key={slotPos} className="relative h-auto group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={card.id || card.url}
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: 90, opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className={cn(
                    'w-full p-4 sm:p-4.5 rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-2.5 overflow-hidden relative',
                    isPinnedAd
                      ? 'bg-gradient-to-br from-blue-500/10 via-background to-blue-500/5 border-blue-500/40 dark:border-blue-400/50 shadow-md ring-1 ring-blue-500/20'
                      : cn(theme.bg, theme.border)
                  )}
                >
                  {/* Top Row: Favicon, Title, Category Badge / Sponsored Badge & VotePill */}
                  <div className="flex items-start justify-between gap-2.5">
                    <a
                      href={href}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="flex items-center gap-2.5 min-w-0 flex-1"
                    >
                      <div className="size-10 sm:size-11 rounded-xl bg-background/90 border border-border/60 p-1 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                        <Image
                          src={favicon}
                          alt={card.name}
                          width={44}
                          height={44}
                          className="size-full object-contain rounded-[6px]"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={cn('font-bold text-sm sm:text-base truncate hover:underline transition-all', theme.text)}>
                          {card.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isPinnedAd ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-blue-600 text-white border border-blue-400/50 shadow-2xs">
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
                    <div className="shrink-0 pt-0.5">
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
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="block pr-6"
                  >
                    <p className={cn('text-xs line-clamp-2 leading-relaxed', theme.subtext)}>
                      {card.tagline || `Verified ${card.name} SaaS tool on DropYourSaaS.`}
                    </p>
                  </a>

                  {/* Hover-to-Reveal Pin Icon Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setPinModalState({
                        isOpen: true,
                        slotPosition: slotPos,
                        siteUrl: card.url,
                        projectName: card.name,
                      });
                    }}
                    title={`Pin this spot (${formatSlotLabel(slotPos)}) • $100/mo`}
                    className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/95 text-foreground border border-border/80 shadow-md hover:scale-105 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 z-10 text-[10px] font-mono font-bold"
                  >
                    <Pin className="size-3 fill-current shrink-0 text-blue-500 group-hover:text-white" />
                    <span className="hidden sm:inline">Pin Spot ({formatSlotLabel(slotPos)}) • $100</span>
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })}
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
