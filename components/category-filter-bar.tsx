'use client';

import React from 'react';
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
  className?: string;
}

export function CategoryFilterBar({
  selectedCategory,
  onSelectCategory,
  className,
}: CategoryFilterBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar scroll-smooth',
        className
      )}
    >
      {CATEGORY_TOPICS.map((cat) => {
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
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer',
              isActive
                ? 'bg-[#E0674B] text-white shadow-xs'
                : 'text-zinc-800 dark:text-zinc-200 hover:text-[#E0674B] dark:hover:text-[#E0674B] hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60'
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
  );
}
