'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LiveStatsPillProps {
  className?: string;
  compact?: boolean;
}

export function LiveStatsPill({ className, compact = false }: LiveStatsPillProps) {
  const [stats, setStats] = useState({
    online: 883,
    visitors: 2644890,
    shareUrl: 'https://datafa.st/share/6a89fc95a1f790d0fcd8c797',
  });

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/datafast-stats');
        if (res.ok) {
          const data = await res.json();
          if (active) setStats(data);
        }
      } catch {}
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (compact) {
    return (
      <a
        href={stats.shareUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="View public analytics on DataFast"
        className={cn(
          'group/stats inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-solid border-border/80 bg-muted/40 hover:bg-muted/70 text-[11px] text-muted-foreground transition-all duration-150 shadow-xs hover:border-emerald-500/40',
          className
        )}
      >
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/20 shrink-0" />
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {stats.online.toLocaleString()} online
        </span>
      </a>
    );
  }

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
      <span className="size-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/30 shrink-0" />
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
