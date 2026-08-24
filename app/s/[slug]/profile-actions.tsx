'use client';

import { useState } from 'react';
import { ExternalLink, Sparkles, Share2, Check } from 'lucide-react';
import { PinAdModal } from '@/components/pin-ad-modal';
import { VotePill } from '@/components/VotePill';
import type { LeaderboardItem } from '@/lib/leaderboard-data';

interface ProfileActionsProps {
  listing: LeaderboardItem;
}

export function ProfileActions({ listing }: ProfileActionsProps) {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const targetHref = `${listing.url}${
    listing.url.includes('?') ? '&' : '?'
  }utm_source=dropyoursaas&utm_medium=profile&utm_campaign=listing`;

  const handleVisitClick = () => {
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: listing.url }),
    }).catch(() => {});
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {/* Primary CTA: Visit Website */}
        <a
          href={targetHref}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={handleVisitClick}
          className="h-11 sm:h-12 px-6 sm:px-8 rounded-full font-bold text-xs sm:text-sm text-white bg-[#E0674B] hover:bg-[#d0573b] dark:bg-[#E0674B] dark:hover:bg-[#f0785c] shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>Visit website</span>
          <ExternalLink className="size-3.5 sm:size-4" />
        </a>

        {/* Secondary CTA: Sponsor a Higher Spot */}
        <button
          type="button"
          onClick={() => setIsPinModalOpen(true)}
          className="h-11 sm:h-12 px-5 sm:px-7 rounded-full font-bold text-xs sm:text-sm text-foreground bg-card hover:bg-muted border border-border/80 shadow-xs hover:shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Sponsor a higher spot</span>
        </button>

        {/* Vote Pill */}
        <div className="shrink-0">
          <VotePill
            listingId={listing.id || ''}
            initialScore={listing.net_score || 0}
            initialUserVote={listing.user_vote || 0}
            size="md"
          />
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="h-11 sm:h-12 px-4 rounded-full border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          title="Share profile"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-mono text-[11px]">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="size-3.5" />
              <span className="text-[11px] font-mono">Share</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Pin / Boost Modal */}
      <PinAdModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        slotPosition={`rank_${listing.rank}`}
        defaultSiteUrl={listing.url}
        defaultProjectName={listing.name}
      />
    </>
  );
}
