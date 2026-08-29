'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, TrendingUp, Sparkles, Tag, ArrowRight, Eye, MousePointerClick, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';

interface DirectoryLeftSidebarProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  activeCategoryCounts?: Record<string, number>;
  className?: string;
}

export function DirectoryLeftSidebar({
  selectedCategory = 'All',
  onSelectCategory,
  activeCategoryCounts = {},
  className,
}: DirectoryLeftSidebarProps) {
  const [stats, setStats] = useState<{
    views: number;
    clicks: number;
  }>({ views: 105160, clicks: 3420 });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setStats({
              views: Number(data.pageviews || data.totalVisitors || 105160),
              clicks: Number(data.totalClicks || data.outboundClicks || 3420),
            });
          }
        }
      } catch {}
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Top featured categories to display in sidebar
  const primaryCategories = [
    { name: 'All', label: 'All Categories' },
    { name: 'Marketing', label: 'Marketing and Sales' },
    { name: 'SaaS', label: 'SaaS and Business Tools' },
    { name: 'Productivity', label: 'Productivity' },
    { name: 'Developer Tools', label: 'Developer Tools' },
    { name: 'Artificial Intelligence', label: 'AI & Machine Learning' },
    { name: 'Design Tools', label: 'Design & Creative Tools' },
    { name: 'Analytics', label: 'Analytics & Data' },
    { name: 'Community', label: 'Community & Social' },
  ];

  return (
    <aside
      className={cn(
        'w-full lg:w-[260px] xl:w-[280px] shrink-0 space-y-5 select-none lg:sticky lg:top-20 h-fit',
        className
      )}
    >
      {/* 1. ALL TIME STATISTICS CARD (LaunchIt Style) */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-muted-foreground">
          ALL TIME
        </span>
        <h3 className="font-mono font-bold text-sm text-foreground">
          Statistics
        </h3>

        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="space-y-0.5">
            <div className="font-mono font-black text-base sm:text-lg text-foreground tracking-tight">
              {stats.views.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Eye className="size-2.5" />
              <span>Listing views</span>
            </div>
          </div>

          <div className="space-y-0.5 pl-2 border-l border-border/60">
            <div className="font-mono font-black text-base sm:text-lg text-foreground tracking-tight">
              {stats.clicks.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <MousePointerClick className="size-2.5" />
              <span>Website clicks</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BROWSE CATEGORIES (LaunchIt Style with Counts & Faceted Nav) */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-muted-foreground">
          BROWSE
        </span>
        <h3 className="font-mono font-bold text-sm text-foreground">
          Categories
        </h3>

        <div className="space-y-1">
          {primaryCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const count = activeCategoryCounts[cat.name] || (cat.name === 'All' ? undefined : undefined);

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left cursor-pointer group',
                  isSelected
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <span className="truncate">{cat.label}</span>
                {typeof count === 'number' && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-normal shrink-0 ml-1',
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                        : 'bg-muted text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          <Link
            href="/explore"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors pt-2 group"
          >
            <span>All categories</span>
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 3. SAVE ON TOOLS / DEALS SPOTLIGHT CARD */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-muted-foreground">
            SAVE ON TOOLS
          </span>
          <Link
            href="/explore"
            className="text-[11px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="size-2.5" />
          </Link>
        </div>
        <h3 className="font-mono font-bold text-sm text-foreground">
          Deals
        </h3>

        <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                ⚡
              </div>
              <div>
                <div className="font-bold text-xs text-foreground">
                  Founder Pass
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Lifetime dofollow index
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/20">
              20% off
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
            Get your tool indexed permanently across 10+ SEO category silos.
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs font-mono">
            <span className="font-bold text-foreground">$39/lifetime</span>
            <a
              href="#claim"
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[11px] inline-flex items-center gap-0.5"
            >
              <span>Claim Deal</span>
              <ArrowRight className="size-2.5" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
