'use client';

import React, { useState } from 'react';
import { ExternalLink, Globe, Sparkles } from 'lucide-react';
import { extractHostname, FaviconImage } from '@/components/favicon-image';
import { cn } from '@/lib/utils';

interface PreviewImageProps {
  src?: string | null;
  url: string;
  name?: string;
  title?: string;
  className?: string;
}

export function PreviewImage({
  src,
  url,
  name,
  title,
  className,
}: PreviewImageProps) {
  const domain = extractHostname(url, name);
  const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  // Candidate sources list: primary provided image, followed by high-res live screenshot
  const sources = React.useMemo(() => {
    const list: string[] = [];
    if (src && typeof src === 'string' && src.trim().length > 5) {
      list.push(src.trim());
    }
    if (normalizedUrl) {
      list.push(
        `https://api.microlink.io/?url=${encodeURIComponent(normalizedUrl)}&screenshot=true&meta=false&embed=screenshot.url`
      );
    }
    return list;
  }, [src, normalizedUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state if source key changes
  const sourcesKey = sources.join('|');
  const [prevKey, setPrevKey] = useState(sourcesKey);
  if (sourcesKey !== prevKey) {
    setPrevKey(sourcesKey);
    setCurrentIndex(0);
    setHasFailedAll(sources.length === 0);
    setIsLoading(true);
  }

  const handleError = () => {
    if (currentIndex + 1 < sources.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const displayTitle = title || name || domain || 'Software Product';

  if (hasFailedAll || sources.length === 0) {
    return (
      <div className={cn(
        'w-full h-48 sm:h-56 md:h-64 rounded-xl border border-border/80 bg-gradient-to-br from-card via-muted/30 to-muted/60 p-6 flex flex-col justify-between items-start text-left relative overflow-hidden group/card shadow-2xs',
        className
      )}>
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex items-center gap-3">
          <FaviconImage url={url} name={name} size={36} containerClassName="rounded-xl border border-border/80 shadow-2xs" />
          <div>
            <span className="text-xs font-mono font-bold text-foreground truncate block">
              {domain || displayTitle}
            </span>
            <span className="text-[10px] text-muted-foreground font-sans">
              Verified SaaS Product
            </span>
          </div>
        </div>

        <div className="space-y-1.5 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-medium">
            <Sparkles className="size-3" />
            Live Preview
          </div>
          <h4 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
            {displayTitle}
          </h4>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover/card:underline">
          <span>Visit Product</span>
          <ExternalLink className="size-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'relative w-full h-48 sm:h-56 md:h-64 overflow-hidden rounded-xl border border-border/80 bg-muted/30 group/preview shadow-xs',
      className
    )}>
      {/* Skeleton / loader while image fetches */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted/40 animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60">
            <Globe className="size-4 animate-spin text-muted-foreground/40" />
            <span>Loading preview...</span>
          </div>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources[currentIndex]}
        alt=""
        aria-hidden="true"
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        referrerPolicy="no-referrer"
        loading="lazy"
        className={cn(
          'w-full h-full object-cover object-top transition-transform duration-300 group-hover/preview:scale-[1.02]',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  );
}
