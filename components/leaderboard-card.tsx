'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Clock, MousePointerClick } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { LeaderboardItem, MetaData } from '@/lib/leaderboard-data';

function getRankStyle(rank: number) {
  if (rank === 1) return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  if (rank === 2) return 'bg-slate-400/10 text-slate-500 border-slate-400/30';
  if (rank === 3) return 'bg-orange-600/10 text-orange-700 border-orange-600/30';
  return 'bg-muted text-muted-foreground border-transparent';
}

function formatBid(amount: number) {
  return `$${amount.toLocaleString()}`;
}

interface LeaderboardCardProps {
  item: LeaderboardItem;
  onClaimClick: (rank: number, bid: number) => void;
}

export function LeaderboardCard({ item, onClaimClick }: LeaderboardCardProps) {
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(item.url)}`);
        if (res.ok) {
          const data = await res.json();
          setMeta(data);
        }
      } catch {}
    };
    fetchMeta();
  }, [item.url]);

  const title = meta?.title || item.name;
  const description = meta?.description || '';
  const favicon = meta?.favicon || `https://www.google.com/s2/favicons?domain=${item.name}&sz=32`;

  const href = `${item.url}${item.url.includes('?') ? '&' : '?'}utm_source=dropyoursaas&utm_medium=directory&utm_campaign=listings`;

  const handleClick = () => {
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: item.url }),
    }).catch(() => {});
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group transition-transform duration-150"
    >
      <a href={href} target="_blank" rel="sponsored noopener noreferrer" className="block" onClick={handleClick}>
        <Card className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-[var(--shadow-1)] hover:border-border/90 hover:shadow-sm transition-all duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={`size-7 rounded-lg flex items-center justify-center text-xs font-mono font-semibold border ${getRankStyle(item.rank)}`}
                >
                  #{item.rank}
                </span>
                <Image
                  src={favicon}
                  alt={item.name}
                  width={36}
                  height={36}
                  className="rounded-lg shrink-0 border border-border/40"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate text-foreground">{title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium tracking-wide">
                    VERIFIED
                  </span>
                </div>
                {description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
                )}
                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {item.time}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:flex sm:items-center gap-3 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 text-center sm:text-right shrink-0">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Tier</div>
                <div className="font-mono text-xs font-semibold text-foreground">#{item.rank}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Price</div>
                <div className="font-mono text-xs font-semibold text-primary">{formatBid(item.bid)}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Clicks</div>
                <div className="font-mono text-xs font-semibold text-foreground">{item.clicks.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </Card>
      </a>
      <div
        className={`overflow-hidden transition-all duration-150 ease-out -mt-px ${isHovered ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <button
          type="button"
          className="w-full flex items-center justify-center bg-primary/10 text-primary text-xs font-medium cursor-pointer border border-primary/40 border-t-0 rounded-b-xl py-2 hover:bg-primary/15 transition-colors"
          onClick={() => onClaimClick(item.rank, item.bid + 1)}
        >
          Upgrade to Tier #{item.rank} for {formatBid(item.bid + 1)}
        </button>
      </div>
    </div>
  );
}
