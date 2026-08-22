'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-3 z-40 px-4 w-full max-w-3xl mx-auto flex justify-center">
      <div
        className={cn(
          'w-full px-3.5 sm:px-5 py-2 rounded-[24px] flex items-center justify-between gap-4 transition-all duration-300',
          scrolled
            ? 'bg-background/75 backdrop-blur-2xl shadow-md border border-solid border-border/80'
            : 'bg-background/45 backdrop-blur-md border border-transparent shadow-none'
        )}
      >
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-solid border-border/80 bg-muted/50 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">2,934 online</span>
            <span className="sm:hidden">Online</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
