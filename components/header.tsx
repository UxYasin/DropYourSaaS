'use client';

import Link from 'next/link';
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

  return (
    <header className="py-3 border-b border-border/80 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
              <Menu className="size-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          <Link href="/" className="font-semibold text-lg tracking-tight text-primary flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary inline-block" />
            DropYourSaaS
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className={cn('flex items-center gap-4', isMobile && 'hidden')}>
            <Link
              href="/"
              className={cn(
                'text-xs font-medium transition-colors',
                pathname === '/' ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Directory
            </Link>
            <Link
              href="/about"
              className={cn(
                'text-xs font-medium transition-colors',
                pathname === '/about'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              About
            </Link>
            <Link
              href="/rules"
              className={cn(
                'text-xs font-medium transition-colors',
                pathname === '/rules'
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Guidelines
            </Link>
          </nav>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border bg-muted/50 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            2,934 online
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
