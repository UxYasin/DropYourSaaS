'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { VotePill } from '@/components/VotePill';

export interface RailCardItem {
  id: string;
  name: string;
  url: string;
  tagline: string;
  net_score: number;
  user_vote?: 1 | -1 | 0;
  category?: string;
}

interface BentoRailsProps {
  side: 'left' | 'right';
}

let globalPool: RailCardItem[] = [];

export function BentoRails({ side }: BentoRailsProps) {
  const [displayedItems, setDisplayedItems] = useState<RailCardItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const fetchPool = async () => {
      try {
        const res = await fetch('/api/rails-pool');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.pool) && data.pool.length > 0 && isMounted) {
            globalPool = data.pool;

            // Left rail gets slots 0..4, Right rail gets slots 5..9
            const startIdx = side === 'left' ? 0 : 5;
            const slice = data.pool.slice(startIdx, startIdx + 5);
            setDisplayedItems(slice);
          }
        }
      } catch {}
    };

    fetchPool();

    // Random staggered card flipping (every 5 to 12 seconds)
    const scheduleNextFlip = () => {
      const randomDelay = Math.floor(Math.random() * 7000) + 5000; // 5000ms to 12000ms

      timerId = setTimeout(() => {
        if (!isMounted) return;

        setDisplayedItems((prevDisplayed) => {
          if (prevDisplayed.length < 5 || globalPool.length <= 10) return prevDisplayed;

          const currentlyShownUrls = new Set(prevDisplayed.map((i) => i.url));
          const unshownCandidates = globalPool.filter((item) => !currentlyShownUrls.has(item.url));
          if (unshownCandidates.length === 0) return prevDisplayed;

          const updated = [...prevDisplayed];

          // 80% chance to flip 1 card, 20% chance to flip 2 cards
          const countToFlip = Math.random() > 0.8 && unshownCandidates.length >= 2 ? 2 : 1;
          const availableSlots = [0, 1, 2, 3, 4];

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
  }, [side]);

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
    <aside className="hidden lg:flex flex-col gap-4 w-72 sm:w-[290px] shrink-0 sticky top-20 h-fit">
      {cardsToRender.map((card, i) => {
        const favicon = `https://www.google.com/s2/favicons?domain=${card.name}&sz=128`;
        const href = `${card.url}${card.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=rail&utm_campaign=${side}`;

        return (
          <div key={card.id || `slot-${i}`} className="relative min-h-[145px] sm:min-h-[155px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={card.id || card.url}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-full h-full p-4 sm:p-5 rounded-2xl border border-zinc-800/70 bg-zinc-950/70 hover:bg-zinc-900/90 hover:border-zinc-700 transition-all shadow-md flex flex-col justify-between gap-3 group"
              >
                {/* Top Row: Favicon, Name & VotePill */}
                <div className="flex items-start justify-between gap-3">
                  <a
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <div className="size-11 sm:size-12 rounded-xl bg-zinc-900 border border-zinc-800/80 p-1 shrink-0 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Image
                        src={favicon}
                        alt={card.name}
                        width={48}
                        height={48}
                        className="size-full object-contain rounded-[8px]"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-amber-400 transition-colors">
                        {card.name}
                      </h3>
                      <span className="inline-block mt-0.5 text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {card.category || 'SaaS'}
                      </span>
                    </div>
                  </a>

                  {/* Compact VotePill */}
                  <div className="shrink-0 pt-0.5">
                    <VotePill
                      listingId={card.id}
                      initialScore={card.net_score}
                      initialUserVote={card.user_vote}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Bottom Section: 2-Line Expanded Description */}
                <a
                  href={href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="block"
                >
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed group-hover:text-zinc-300 transition-colors">
                    {card.tagline || `Verified ${card.name} SaaS tool on DropYourSaaS.`}
                  </p>
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
    </aside>
  );
}
