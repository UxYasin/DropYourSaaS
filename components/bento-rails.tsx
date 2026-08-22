import React from 'react';
import { Sparkles, TrendingUp, Zap, ShieldCheck, Award, Flame } from 'lucide-react';

interface PromoCard {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
}

const leftCards: PromoCard[] = [
  {
    title: 'Instant Indexing',
    desc: 'Get discovered across our developer search engine.',
    icon: Zap,
    bgClass: 'bg-[var(--bento-blue)] text-blue-900 dark:text-blue-200',
  },
  {
    title: 'Verified Tiers',
    desc: 'Elevate placement with transparent tiered slots.',
    icon: Award,
    bgClass: 'bg-[var(--bento-yellow)] text-amber-900 dark:text-amber-200',
  },
  {
    title: 'Curated SaaS',
    desc: 'High-intent traffic from startup founders & devs.',
    icon: Sparkles,
    bgClass: 'bg-[var(--bento-mint)] text-emerald-900 dark:text-emerald-200',
  },
];

const rightCards: PromoCard[] = [
  {
    title: 'Trending Drops',
    desc: 'Live traffic signals tracking fastest rising tools.',
    icon: Flame,
    bgClass: 'bg-[var(--bento-pink)] text-pink-900 dark:text-pink-200',
  },
  {
    title: 'Developer First',
    desc: 'Clean metadata parsing and canonical backlinking.',
    icon: ShieldCheck,
    bgClass: 'bg-[var(--bento-lavender)] text-purple-900 dark:text-purple-200',
  },
  {
    title: 'Fast Refresh',
    desc: 'Instant cache updates upon verified submission.',
    icon: TrendingUp,
    bgClass: 'bg-[var(--bento-gray)] text-zinc-900 dark:text-zinc-200',
  },
];

export function BentoRails({ side }: { side: 'left' | 'right' }) {
  const cards = side === 'left' ? leftCards : rightCards;

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-60 shrink-0 sticky top-20 h-fit">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl border border-border/40 transition-transform duration-150 hover:-translate-y-0.5 shadow-[var(--shadow-1)] ${card.bgClass}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-background/60 backdrop-blur-sm shrink-0">
                <Icon className="size-4" />
              </span>
              <h3 className="font-semibold text-xs leading-tight">{card.title}</h3>
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">{card.desc}</p>
          </div>
        );
      })}
    </aside>
  );
}
