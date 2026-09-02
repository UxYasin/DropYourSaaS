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
      <div className="w-full bg-[#46285d] dark:bg-[#130a1a] text-white text-[11px] sm:text-xs py-2 px-4 font-sans flex items-center justify-center gap-2 text-center border-b border-[#5b2d7d]/40 shadow-xs">
        <span className="flex items-center gap-1.5 text-[#ffc748] font-bold">
          <Sparkles className="size-3.5 fill-[#ffc748]" />
          <span>Launch Your SaaS:</span>
        </span>
        <span className="text-white/90 hidden sm:inline font-medium">
          Guaranteed homepage placement, instant Google indexation &amp; permanent dofollow backlinks.
        </span>
        <span className="text-white/90 sm:hidden font-medium">
          Dofollow backlinks &amp; instant indexation.
        </span>
        <a
          href="#claim"
          className="inline-flex items-center gap-1 text-[#cb9569] hover:text-[#ffc748] font-bold underline underline-offset-2 ml-1 cursor-pointer transition-colors"
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
              className="rounded-full bg-card border border-border shadow-xs hover:border-primary/50"
            >
              <Menu className="size-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-card/95 dark:bg-[#241b27]/95 border border-border dark:border-white/10 shadow-sm backdrop-blur-md hover:border-primary/50 transition-all group"
          >
            <div className="size-6 rounded-full bg-[#8c50b9] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Rocket className="size-3.5 fill-current" />
            </div>
            <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
              DropYourSaaS<span className="text-[10px] text-muted-foreground ml-0.5 font-sans font-normal">™</span>
            </span>
          </Link>
        </div>

        {/* CENTER: Clean Navigation Links */}
        <nav className={cn('hidden md:flex items-center gap-1 p-1 rounded-full bg-card/95 dark:bg-[#241b27]/95 border border-border dark:border-white/10 shadow-sm backdrop-blur-md')}>
          <Link
            href="/#billboard"
            className={cn(
              'text-xs font-semibold transition-all px-3.5 py-1.5 rounded-full flex items-center gap-1.5',
              pathname === '/'
                ? 'text-primary bg-primary/10 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <Zap className="size-3 text-[#cb9569] fill-[#cb9569]" />
            <span>Billboard</span>
          </Link>
          <Link
            href="/explore"
            className={cn(
              'text-xs font-medium transition-all px-3.5 py-1.5 rounded-full',
              pathname.startsWith('/explore') || pathname.startsWith('/buy-sell')
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            Explore Directory
          </Link>
          <Link
            href="/stats"
            className={cn(
              'text-xs font-medium transition-all px-3.5 py-1.5 rounded-full',
              pathname === '/stats'
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            Live Stats
          </Link>
          <Link
            href="/rules"
            className={cn(
              'text-xs font-medium transition-all px-3.5 py-1.5 rounded-full',
              pathname === '/rules'
                ? 'bg-primary text-white shadow-xs font-bold'
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
            className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/95 dark:bg-[#241b27]/95 border border-border dark:border-white/10 shadow-sm backdrop-blur-md hover:border-emerald-500/40 transition-all text-xs select-none"
          >
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
              {stats.online} online
            </span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground font-medium">
              {stats.views.toLocaleString()}+ views
            </span>
          </Link>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-card/95 dark:bg-[#241b27]/95 border border-border dark:border-white/10 shadow-sm backdrop-blur-md">
            <ThemeToggle />
            <ProfileMenu />
          </div>

          {/* High-Converting Launch / Submit CTA Button */}
          <a
            href="#claim"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#8c50b9] hover:bg-[#76439c] active:bg-[#5b2d7d] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-[0_0_0_0.25em_rgba(140,80,185,0.25)] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Submit SaaS</span>
          </a>
        </div>
      </header>
    </div>
  );
}
