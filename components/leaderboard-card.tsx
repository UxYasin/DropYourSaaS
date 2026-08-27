'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, BadgeCheck } from 'lucide-react';
import type { LeaderboardItem, MetaData } from '@/lib/leaderboard-data';
import { FaviconImage } from '@/components/favicon-image';

function formatBid(amount: number) {
  return `$${amount.toLocaleString()}`;
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    case 2:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
    case 3:
      return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
    default:
      return 'bg-muted text-muted-foreground border-transparent';
  }
}

interface LeaderboardCardProps {
  item: LeaderboardItem;
  onClaimClick: (rank: number, bid: number) => void;
}

export function LeaderboardCard({ item, onClaimClick }: LeaderboardCardProps) {
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const fetchMeta = async () => {
      try {
        const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(item.url)}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setMeta(data);
        }
      } catch {}
    };
    fetchMeta();
    return () => {
      active = false;
    };
  }, [item.url]);

  const title = meta?.title || item.name;
  const description = meta?.description || '';

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
      <a href={href} target="_blank" rel="noopener noreferrer" className="block" onClick={handleClick}>
        <Card className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-[var(--shadow-1)] hover:border-border/90 hover:shadow-sm transition-all duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 shrink-0">
                <span
                  className={`size-7 rounded-lg flex items-center justify-center text-xs font-mono font-semibold border ${getRankStyle(item.rank)}`}
                >
                  #{item.rank}
                </span>
                <FaviconImage
                  url={item.url}
                  name={item.name}
                  src={meta?.favicon}
                  size={36}
                  containerClassName="rounded-lg shrink-0 border border-border/40"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate text-foreground">{title}</span>
                  <span className="inline-flex items-center text-blue-500 font-bold shrink-0" title="Verified Listing">
                    <BadgeCheck className="size-3.5 fill-blue-500 text-white dark:text-black" />
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
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Rank</div>
                <div className="font-mono text-xs font-semibold text-foreground">#{item.rank}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Bid</div>
                <div className="font-mono text-xs font-semibold text-[#FFFC00]">{formatBid(item.bid)}</div>
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
          className="w-full flex items-center justify-center bg-[#FFFC00]/15 text-black dark:text-[#FFFC00] text-xs font-mono font-bold cursor-pointer border border-[#FFFC00]/40 border-t-0 rounded-b-xl py-2 hover:bg-[#FFFC00]/25 transition-colors"
          onClick={() => onClaimClick(item.rank, item.bid + 1)}
        >
          Outbid #{item.rank} for {formatBid(item.bid + 1)}
        </button>
      </div>
    </div>
  );
}
