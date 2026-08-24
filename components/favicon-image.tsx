'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FaviconImageProps {
  url?: string;
  name?: string;
  src?: string;
  size?: number;
  className?: string;
  containerClassName?: string;
  alt?: string;
  priority?: boolean;
}

export function extractHostname(url?: string, name?: string): string {
  if (url) {
    try {
      const normalized = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim().replace(/^@/, '')}`;
      const host = new URL(normalized).hostname.toLowerCase().replace(/^www\./, '');
      if (host && host.includes('.')) return host;
    } catch {}
  }

  if (name) {
    const trimmed = name.trim();
    // If name contains a domain-like pattern e.g. "outrank.so" or "orynth.dev"
    const match = trimmed.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/);
    if (match && match[1]) {
      return match[1].toLowerCase().replace(/^www\./, '');
    }
  }

  return '';
}

// Generate deterministic background color for initials avatar
function getAvatarColor(str: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [
    { bg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    { bg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    { bg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    { bg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
    { bg: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30' },
    { bg: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
    { bg: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  ];
  const idx = Math.abs(hash) % hues.length;
  return { bg: hues[idx].bg, text: '' };
}

export function FaviconImage({
  url,
  name,
  src,
  size = 32,
  className,
  containerClassName,
  alt = '',
}: FaviconImageProps) {
  const domain = extractHostname(url, name);
  const iconSizeParam = size >= 64 ? 128 : 64;

  // Build candidate source list in order of reliability
  const sources = React.useMemo(() => {
    const list: string[] = [];
    if (src && src.trim() && !src.includes('undefined')) {
      list.push(src.trim());
    }
    if (domain) {
      list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=${iconSizeParam}`);
      list.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
      list.push(`https://unavatar.io/${domain}?fallback=false`);
      list.push(`https://${domain}/favicon.ico`);
    }
    return list;
  }, [src, domain, iconSizeParam]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Sync state if source key changes without using direct setState in effect
  const sourcesKey = sources.join('|');
  const [prevKey, setPrevKey] = useState(sourcesKey);
  if (sourcesKey !== prevKey) {
    setPrevKey(sourcesKey);
    setCurrentIndex(0);
    setHasFailedAll(sources.length === 0);
  }

  const handleError = () => {
    if (currentIndex + 1 < sources.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const displayName = name || domain || 'S';
  const initial = displayName.replace(/^https?:\/\//, '').replace(/^www\./, '').charAt(0).toUpperCase() || 'S';
  const color = getAvatarColor(displayName);

  if (hasFailedAll || sources.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center font-mono font-bold select-none shrink-0 rounded-lg border shadow-2xs',
          color.bg,
          containerClassName
        )}
        style={{ width: size, height: size, fontSize: Math.max(10, Math.floor(size * 0.45)) }}
        title={displayName}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden flex items-center justify-center rounded-lg bg-muted/40',
        containerClassName
      )}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources[currentIndex]}
        alt={alt}
        onError={handleError}
        referrerPolicy="no-referrer"
        loading="lazy"
        className={cn('size-full object-contain', className)}
      />
    </div>
  );
}
