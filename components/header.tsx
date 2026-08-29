'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProfileMenu } from '@/components/profile-menu';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { LiveStatsPill } from '@/components/live-stats-pill';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  let toggleSidebar = () => {};
  try {
    const sidebar = useSidebar();
    toggleSidebar = sidebar.toggleSidebar;
  } catch {}

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 w-full mx-auto flex justify-center">
      <div className="w-full px-4 sm:px-6 py-2.5 rounded-2xl flex items-center justify-between gap-3 sm:gap-4 bg-card/85 dark:bg-[#13151f]/85 border border-border/80 dark:border-white/10 backdrop-blur-xl shadow-xs transition-colors">
        {/* Left Brand Wordmark */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
              <Menu className="size-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo-light.svg"
              alt="DropYourSaaS"
              width={170}
              height={56}
              className="h-8 sm:h-9 w-auto block dark:hidden transition-transform duration-150 group-hover:scale-[1.02]"
              priority
            />
            <Image
              src="/logo-dark.svg"
              alt="DropYourSaaS"
              width={170}
              height={56}
              className="h-8 sm:h-9 w-auto hidden dark:block transition-transform duration-150 group-hover:scale-[1.02]"
              priority
            />
          </Link>
        </div>

        {/* Center / Right Nav, Live Stats Pill, Theme & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <nav className={cn('flex items-center gap-1 sm:gap-1.5', isMobile && 'hidden')}>
            <Link
              href="/"
              className={cn(
                'text-xs font-bold transition-all px-3.5 py-1.5 rounded-xl font-mono',
                pathname === '/'
                  ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              Leaderboard
            </Link>
            <Link
              href="/explore"
              className={cn(
                'text-xs font-bold transition-all px-3.5 py-1.5 rounded-xl font-mono',
                pathname.startsWith('/explore') || pathname.startsWith('/buy-sell')
                  ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              Explore
            </Link>
            <Link
              href="/stats"
              className={cn(
                'text-xs font-bold transition-all px-3.5 py-1.5 rounded-xl font-mono',
                pathname === '/stats'
                  ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              Stats
            </Link>
          </nav>

          <LiveStatsPill compact />
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
