'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
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
    <header className="sticky top-3 z-40 px-4 w-full max-w-3xl mx-auto flex justify-center">
      <div className="w-full px-3.5 sm:px-5 py-2 rounded-[14px] flex items-center justify-between gap-3 sm:gap-4 bg-background/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
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
              className="h-9 sm:h-10 w-auto block dark:hidden transition-transform duration-150 group-hover:scale-[1.02]"
              priority
            />
            <Image
              src="/logo-dark.svg"
              alt="DropYourSaaS"
              width={170}
              height={56}
              className="h-9 sm:h-10 w-auto hidden dark:block transition-transform duration-150 group-hover:scale-[1.02]"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className={cn('flex items-center gap-1.5 sm:gap-2', isMobile && 'hidden')}>
            <Link
              href="/"
              className={cn(
                'text-xs font-medium transition-colors px-3 py-1.5 rounded-full',
                pathname === '/'
                  ? 'text-foreground font-semibold bg-muted/70'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              Leaderboard
            </Link>
            <Link
              href="/buy-sell"
              className={cn(
                'text-xs font-medium transition-colors px-3 py-1.5 rounded-full',
                pathname.startsWith('/buy-sell')
                  ? 'text-foreground font-semibold bg-muted/70'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              Buy / Sell
            </Link>
            <Link
              href="/advertise"
              className={cn(
                'text-xs font-medium transition-colors px-3 py-1.5 rounded-full',
                pathname === '/advertise' || pathname === '/pricing'
                  ? 'text-foreground font-semibold bg-muted/70'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              Advertise
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

