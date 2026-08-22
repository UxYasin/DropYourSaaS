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
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-3 z-40 px-4 w-full max-w-4xl mx-auto flex justify-center">
      <div className="w-full px-3.5 sm:px-5 py-2 rounded-[12px] flex items-center justify-between gap-4 bg-background/70 backdrop-blur-md border border-transparent shadow-none transition-colors">
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
          <nav className={cn('flex items-center gap-2 sm:gap-3', isMobile && 'hidden')}>
            <Link
              href="/"
              className={cn(
                'text-xs font-medium transition-colors px-3 py-1.5 rounded-full',
                pathname === '/' ? 'text-foreground font-semibold bg-muted/70' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              Directory
            </Link>
            <Link
              href="/buy-sell"
              className={cn(
                'text-xs font-medium transition-colors px-3 py-1.5 rounded-full inline-flex items-center gap-1.5',
                pathname === '/buy-sell'
                  ? 'text-foreground font-semibold bg-muted/70'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              Buy/Sell
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                Soon
              </span>
            </Link>
            <Link
              href="/about"
              className={cn(
                'text-xs font-medium transition-colors px-3 py-1.5 rounded-full',
                pathname === '/about'
                  ? 'text-foreground font-semibold bg-muted/70'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              About
            </Link>
            <Link
              href="/rules"
              className={cn(
                'text-xs font-medium transition-colors px-3 py-1.5 rounded-full',
                pathname === '/rules'
                  ? 'text-foreground font-semibold bg-muted/70'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              Guidelines
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
