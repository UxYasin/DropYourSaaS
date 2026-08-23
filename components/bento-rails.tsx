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

// Global pool shared across left and right rails so no duplicate cards are shown
let globalPool: RailCardItem[] = [];
let initialSlotItems: RailCardItem[] = [];
let poolListeners: Array<(pool: RailCardItem[]) => void> = [];

export function BentoRails({ side }: { side: 'left' | 'right' }) {
  const [displayedItems, setDisplayedItems] = useState<RailCardItem[]>([]);
  const [pool, setPool] = useState<RailCardItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchPool = async () => {
      try {
        const res = await fetch('/api/rails-pool');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.pool) && data.pool.length > 0 && isMounted) {
            globalPool = data.pool;
            setPool(data.pool);

            // Left gets slots 0..4, Right gets slots 5..9
            const startIdx = side === 'left' ? 0 : 5;
            const slice = data.pool.slice(startIdx, startIdx + 5);
            setDisplayedItems(slice);
          }
        }
      } catch {}
    };

    fetchPool();

    // 3D Card flip interval every 7 seconds
    const interval = setInterval(() => {
      setDisplayedItems((prevDisplayed) => {
        if (prevDisplayed.length < 5 || globalPool.length <= 10) return prevDisplayed;

        // Pick a random slot (0..4) in this rail to flip
        const targetSlotIndex = Math.floor(Math.random() * 5);

        // Find an unshown item from the global pool
        const currentlyShownUrls = new Set(
          initialSlotItems.concat(prevDisplayed).map((i) => i.url)
        );

        const unshownCandidates = globalPool.filter((item) => !currentlyShownUrls.has(item.url));
        if (unshownCandidates.length === 0) return prevDisplayed;

        const newItem = unshownCandidates[Math.floor(Math.random() * unshownCandidates.length)];

        const updated = [...prevDisplayed];
        updated[targetSlotIndex] = newItem;
        return updated;
      });
    }, 7000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [side]);

  // Fallback initial cards if pool is loading
  const fallbackCards: RailCardItem[] = [
    { id: 'fb-1', name: side === 'left' ? 'outrank.so' : 'orynth.dev', url: 'https://outrank.so', tagline: 'SEO & AI Visibility Platform', net_score: 14, user_vote: 0 },
    { id: 'fb-2', name: side === 'left' ? 'trycomp.ai' : 'lathire.com', url: 'https://trycomp.ai', tagline: 'Autonomous AI Agents', net_score: 9, user_vote: 0 },
    { id: 'fb-3', name: side === 'left' ? 'mytb.ai' : 'fiber.so', url: 'https://mytb.ai', tagline: 'Productivity & Workspace', net_score: 12, user_vote: 0 },
    { id: 'fb-4', name: side === 'left' ? 'prelint.com' : 'ranked.ai', url: 'https://prelint.com', tagline: 'Developer Linting Tools', net_score: 7, user_vote: 0 },
    { id: 'fb-5', name: side === 'left' ? 'overskill.com' : 'startglobal.co', url: 'https://overskill.com', tagline: 'Global Founder Marketplace', net_score: 18, user_vote: 0 },
  ];

  const cardsToRender = displayedItems.length === 5 ? displayedItems : fallbackCards;

  return (
    <aside className="hidden lg:flex flex-col gap-3.5 w-64 shrink-0 sticky top-20 h-fit">
      <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider px-1 flex items-center justify-between">
        <span>{side === 'left' ? '🔥 Hot & Rising' : '✨ Fresh Drops'}</span>
        <span className="text-[10px] text-zinc-500 font-normal">5 Cards</span>
      </div>

      {cardsToRender.map((card, i) => {
        const favicon = `https://www.google.com/s2/favicons?domain=${card.name}&sz=64`;
        const href = `${card.url}${card.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=rail&utm_campaign=${side}`;

        return (
          <div key={card.id || `slot-${i}`} className="relative min-h-[96px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={card.id || card.url}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-full h-full p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/60 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="flex items-center gap-2.5 min-w-0 flex-1 group"
                  >
                    <div className="size-8 rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                      <Image
                        src={favicon}
                        alt={card.name}
                        width={32}
                        height={32}
                        className="size-full object-contain rounded-[4px]"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-xs text-white truncate group-hover:text-amber-400 transition-colors">
                        {card.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {card.tagline}
                      </p>
                    </div>
                  </a>

                  {/* Compact VotePill */}
                  <div className="shrink-0">
                    <VotePill
                      listingId={card.id}
                      initialScore={card.net_score}
                      initialUserVote={card.user_vote}
                      size="sm"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
    </aside>
  );
}
