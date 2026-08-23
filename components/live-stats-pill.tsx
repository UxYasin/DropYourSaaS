'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LiveStatsPillProps {
  className?: string;
  compact?: boolean;
}

export function LiveStatsPill({ className, compact = false }: LiveStatsPillProps) {
  const [stats, setStats] = useState({
    online: 0,
    visitors: 0,
    shareUrl: 'https://datafa.st/share/6a89fc95a1f790d0fcd8c797',
  });

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/datafast-stats');
        if (res.ok) {
          const data = await res.json();
          if (active && data) {
            setStats({
              online: typeof data.online === 'number' ? data.online : 0,
              visitors: typeof data.visitors === 'number' ? data.visitors : 0,
              shareUrl: data.shareUrl || 'https://datafa.st/share/6a89fc95a1f790d0fcd8c797',
            });
          }
        }
      } catch {}
    };

    fetchStats();
    const fetchInterval = setInterval(fetchStats, 30000);

    return () => {
      active = false;
      clearInterval(fetchInterval);
    };
  }, []);

  // Header navigation pill (compact mode): Displays "We're FREE"
  if (compact) {
    return (
      <a
        href={stats.shareUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="View public analytics on DataFast"
        className={cn(
          'group/stats inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-solid border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400 transition-all duration-150 shadow-xs whitespace-nowrap shrink-0',
          className
        )}
      >
        <span className="size-1.5 rounded-full bg-orange-500 ring-2 ring-orange-500/30 animate-pulse shrink-0" />
        <span>We&apos;re FREE</span>
      </a>
    );
  }

  // Hero section pill: Displays real live traffic from DataFast API without text toggle animation
  return (
    <a
      href={stats.shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="View verified real-time visitor statistics on DataFast"
      className={cn(
        'group/stats inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-solid border-border/70 bg-card/80 hover:bg-muted/60 backdrop-blur-md text-xs transition-all duration-200 shadow-xs hover:shadow-sm hover:border-emerald-500/40',
        className
      )}
    >
      <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse shrink-0" />
      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
        {stats.online.toLocaleString()} online
      </span>
      <span className="text-muted-foreground/40 font-sans">·</span>
      <span className="text-muted-foreground font-body text-xs sm:text-[13px]">
        {stats.visitors.toLocaleString()} visitors since launch
      </span>
      <span className="text-muted-foreground/40 font-sans">·</span>
      <span className="font-sans font-semibold text-foreground group-hover/stats:text-emerald-600 dark:group-hover/stats:text-emerald-400 transition-colors inline-flex items-center gap-0.5">
        see stats<span className="transition-transform duration-150 group-hover/stats:translate-x-0.5">→</span>
      </span>
    </a>
  );
}
