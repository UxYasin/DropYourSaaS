'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProfileMenu } from '@/components/profile-menu';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<{
    online: number;
    views: number;
    revenue: number;
  }>({ online: 3, views: 3246, revenue: 360 });

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          if (active && data) {
            setStats({
              online: Number(data.online || 3),
              views: Number(data.pageviews || data.totalVisitors || 3246),
              revenue: Number(data.totalPaidBids || 360),
            });
          }
        }
      } catch {}
    };
    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  let toggleSidebar = () => {};
  try {
    const sidebar = useSidebar();
    toggleSidebar = sidebar.toggleSidebar;
  } catch {}

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 w-full mx-auto flex items-center justify-between gap-3">
      {/* 1. SEPARATE LEFT PILL: Brand Logo */}
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon-sm" onClick={toggleSidebar} className="rounded-full bg-card border border-border/80 shadow-2xs">
            <Menu className="size-4" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-card/90 dark:bg-[#161822]/90 border border-border/80 dark:border-white/10 shadow-xs backdrop-blur-md hover:border-blue-500/40 transition-all group"
        >
          <div className="size-5 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
            <Zap className="size-3 fill-white" />
          </div>
          <span className="font-mono font-black text-sm tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            DropYourSaaS
          </span>
        </Link>
      </div>

      {/* 2. SEPARATE CENTER PILL: Live Stats Telemetry */}
      <Link
        href="/stats"
        title="View live verified directory analytics"
        className="hidden md:inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-card/90 dark:bg-[#161822]/90 border border-border/80 dark:border-white/10 shadow-xs backdrop-blur-md hover:border-emerald-500/40 transition-all text-xs font-mono select-none"
      >
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
          {stats.online.toLocaleString()} online now
        </span>
        <span className="text-border/80">|</span>
        <span className="text-muted-foreground">
          {stats.views.toLocaleString()}+ views
        </span>
        <span className="text-border/80">|</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          ${stats.revenue.toLocaleString()}+ Total
        </span>
      </Link>

      {/* 3. SEPARATE RIGHT PILL: Menu Navigation & Actions */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-card/90 dark:bg-[#161822]/90 border border-border/80 dark:border-white/10 shadow-xs backdrop-blur-md">
        <nav className={cn('flex items-center gap-1', isMobile && 'hidden')}>
          <Link
            href="/"
            className={cn(
              'text-xs font-bold transition-all px-3.5 py-1.5 rounded-full font-mono',
              pathname === '/'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            Leaderboard
          </Link>
          <Link
            href="/explore"
            className={cn(
              'text-xs font-medium transition-all px-3 py-1.5 rounded-full font-mono',
              pathname.startsWith('/explore') || pathname.startsWith('/buy-sell')
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            Explore
          </Link>
          <Link
            href="/rules"
            className={cn(
              'text-xs font-medium transition-all px-3 py-1.5 rounded-full font-mono',
              pathname === '/rules'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            Rules
          </Link>
        </nav>

        <div className="flex items-center gap-1 pl-1 border-l border-border/60">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
