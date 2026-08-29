'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Zap, Sparkles, Plus, Rocket, ArrowRight } from 'lucide-react';
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
    <div className="w-full flex flex-col items-center">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="w-full bg-zinc-950 dark:bg-black text-white text-[11px] sm:text-xs py-1.5 px-4 font-mono flex items-center justify-center gap-2 text-center border-b border-zinc-800/80">
        <span className="flex items-center gap-1.5 text-amber-400 font-bold">
          <Sparkles className="size-3.5 fill-amber-400" />
          <span>Launch Your SaaS:</span>
        </span>
        <span className="text-zinc-300 hidden sm:inline">
          Guaranteed homepage placement, instant Google indexation &amp; permanent dofollow backlinks.
        </span>
        <span className="text-zinc-300 sm:hidden">
          Dofollow backlinks &amp; instant indexation.
        </span>
        <a
          href="#claim"
          className="inline-flex items-center gap-1 text-white hover:text-amber-300 font-bold underline underline-offset-2 ml-1 cursor-pointer transition-colors"
        >
          <span>Claim Rank from $1</span>
          <ArrowRight className="size-3" />
        </a>
      </div>

      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <header className="sticky top-2 z-40 px-4 sm:px-6 lg:px-8 xl:px-10 w-full max-w-[1440px] mx-auto pt-3 flex items-center justify-between gap-3">
        {/* LEFT: Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              className="rounded-full bg-card border border-border/80 shadow-2xs"
            >
              <Menu className="size-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-card/90 dark:bg-[#161822]/90 border border-border/80 dark:border-white/10 shadow-xs backdrop-blur-md hover:border-blue-500/40 transition-all group"
          >
            <div className="size-6 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-2xs">
              <Rocket className="size-3.5 fill-current" />
            </div>
            <span className="font-mono font-black text-sm sm:text-base tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              DropYourSaaS<span className="text-[10px] text-muted-foreground ml-0.5 font-sans font-normal">™</span>
            </span>
          </Link>
        </div>

        {/* CENTER: Clean Navigation Links */}
        <nav className={cn('hidden md:flex items-center gap-1 p-1 rounded-full bg-card/90 dark:bg-[#161822]/90 border border-border/80 dark:border-white/10 shadow-xs backdrop-blur-md')}>
          <Link
            href="/#billboard"
            className={cn(
              'text-xs font-bold transition-all px-3.5 py-1.5 rounded-full font-mono flex items-center gap-1.5',
              pathname === '/'
                ? 'text-foreground hover:bg-muted/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <Zap className="size-3 text-amber-500 fill-amber-500" />
            <span>Billboard</span>
          </Link>
          <Link
            href="/explore"
            className={cn(
              'text-xs font-medium transition-all px-3.5 py-1.5 rounded-full font-mono',
              pathname.startsWith('/explore') || pathname.startsWith('/buy-sell')
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            Explore Directory
          </Link>
          <Link
            href="/stats"
            className={cn(
              'text-xs font-medium transition-all px-3.5 py-1.5 rounded-full font-mono',
              pathname === '/stats'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            Live Stats
          </Link>
          <Link
            href="/rules"
            className={cn(
              'text-xs font-medium transition-all px-3.5 py-1.5 rounded-full font-mono',
              pathname === '/rules'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            Rules &amp; FAQ
          </Link>
        </nav>

        {/* RIGHT: Live Telemetry + Theme + Profile + Submit CTA */}
        <div className="flex items-center gap-2">
          {/* Live Telemetry Pill */}
          <Link
            href="/stats"
            title="Live verified directory analytics"
            className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 dark:bg-[#161822]/90 border border-border/80 dark:border-white/10 shadow-xs backdrop-blur-md hover:border-emerald-500/40 transition-all text-xs font-mono select-none"
          >
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
              {stats.online} online
            </span>
            <span className="text-border/80">|</span>
            <span className="text-muted-foreground font-medium">
              {stats.views.toLocaleString()}+ views
            </span>
          </Link>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-card/90 dark:bg-[#161822]/90 border border-border/80 dark:border-white/10 shadow-xs backdrop-blur-md">
            <ThemeToggle />
            <ProfileMenu />
          </div>

          {/* High-Converting Launch / Submit CTA Button */}
          <a
            href="#claim"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-mono font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Submit SaaS</span>
          </a>
        </div>
      </header>
    </div>
  );
}
