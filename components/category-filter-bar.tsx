'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  LayoutGrid,
  SearchCheck,
  Bot,
  Sparkles,
  Megaphone,
  Code2,
  BarChart3,
  Wrench,
  Zap,
  ShoppingCart,
  Coins,
  Palette,
  Headphones,
  ShieldCheck,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryTopic {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  queryValue: string;
}

export const CATEGORY_TOPICS: CategoryTopic[] = [
  { id: 'all', label: 'All', icon: LayoutGrid, queryValue: 'All' },
  { id: 'seo', label: 'SEO & AI Visibility', icon: SearchCheck, queryValue: 'SEO' },
  { id: 'ai-infra', label: 'AI Agents & Infrastructure', icon: Bot, queryValue: 'AI' },
  { id: 'ai-media', label: 'AI Media Generation', icon: Sparkles, queryValue: 'Artificial Intelligence' },
  { id: 'marketing', label: 'Marketing & Advertising', icon: Megaphone, queryValue: 'Marketing' },
  { id: 'dev-tools', label: 'Developer Tools', icon: Code2, queryValue: 'Developer Tools' },
  { id: 'analytics', label: 'Analytics & Data', icon: BarChart3, queryValue: 'Analytics' },
  { id: 'no-code', label: 'No-Code & Builders', icon: Wrench, queryValue: 'No-Code' },
  { id: 'productivity', label: 'Productivity', icon: Zap, queryValue: 'Productivity' },
  { id: 'ecommerce', label: 'E-commerce & Sales', icon: ShoppingCart, queryValue: 'E-commerce' },
  { id: 'fintech', label: 'Fintech & Crypto', icon: Coins, queryValue: 'Fintech' },
  { id: 'design', label: 'Design & Creative', icon: Palette, queryValue: 'Design Tools' },
  { id: 'support', label: 'Customer Support', icon: Headphones, queryValue: 'Customer Support' },
  { id: 'security', label: 'Security & Legal', icon: ShieldCheck, queryValue: 'Security' },
  { id: 'mobile', label: 'Mobile Apps', icon: Smartphone, queryValue: 'Mobile Apps' },
];

interface CategoryFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (category: CategoryTopic) => void;
  activeCategories?: string[];
  className?: string;
}

export function CategoryFilterBar({
  selectedCategory,
  onSelectCategory,
  activeCategories = [],
  className,
}: CategoryFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Filter topics so that ONLY categories with at least 1 listing (plus 'All') are displayed
  const visibleTopics = CATEGORY_TOPICS.filter((cat) => {
    if (cat.id === 'all') return true;
    if (!activeCategories || activeCategories.length === 0) return true;

    return activeCategories.some((activeCat) => {
      const a = activeCat.toLowerCase().trim();
      const q = cat.queryValue.toLowerCase().trim();
      const l = cat.label.toLowerCase().trim();
      return a === q || a.includes(q) || q.includes(a) || a.includes(l) || l.includes(a);
    });
  });

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [visibleTopics]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative group/filter flex items-center', className)}>
      {/* Left Scroll Arrow */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-0 z-10 size-7 rounded-full bg-background/90 dark:bg-zinc-900/90 border border-border/80 shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-all cursor-pointer -ml-2 shrink-0"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      {/* Horizontally Scrollable / Slideable Category Pills */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth w-full"
      >
        {visibleTopics.map((cat) => {
          const Icon = cat.icon;
          const isActive =
            selectedCategory === cat.label ||
            selectedCategory === cat.queryValue ||
            (selectedCategory === 'All' && cat.id === 'all');

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer select-none',
                isActive
                  ? 'bg-[#fe4103] text-white shadow-xs'
                  : 'text-zinc-800 dark:text-zinc-200 hover:text-[#fe4103] dark:hover:text-[#fe4103] hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60'
              )}
            >
              <Icon
                className={cn(
                  'size-3.5 shrink-0',
                  isActive ? 'text-white' : 'text-zinc-600 dark:text-zinc-400'
                )}
              />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Scroll Arrow */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 z-10 size-7 rounded-full bg-background/90 dark:bg-zinc-900/90 border border-border/80 shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-all cursor-pointer -mr-2 shrink-0"
        >
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
