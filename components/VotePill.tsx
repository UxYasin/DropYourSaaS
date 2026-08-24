'use client';

import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VotePillProps {
  listingId: string;
  initialScore?: number;
  initialUserVote?: 1 | -1 | 0;
  className?: string;
  size?: 'sm' | 'md';
}

function formatScore(score: number): string {
  const abs = Math.abs(score);
  const sign = score < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `${score}`;
}

export function VotePill({
  listingId,
  initialScore = 0,
  initialUserVote = 0,
  className,
  size = 'md',
}: VotePillProps) {
  const [score, setScore] = useState<number>(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(initialUserVote);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (targetDirection: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isSubmitting || !listingId) return;

    const newDirection = userVote === targetDirection ? 0 : targetDirection;

    let delta = 0;
    if (userVote === 0) {
      delta = newDirection;
    } else if (newDirection === 0) {
      delta = -userVote;
    } else {
      delta = newDirection * 2;
    }

    const prevScore = score;
    const prevVote = userVote;

    setScore((prev) => prev + delta);
    setUserVote(newDirection);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          direction: newDirection,
        }),
      });

      const data = await res.json();

      if (res.ok && typeof data.netScore === 'number') {
        setScore(data.netScore);
        if (typeof data.userVote === 'number') {
          setUserVote(data.userVote as 1 | -1 | 0);
        }
      } else {
        setScore(prevScore);
        setUserVote(prevVote);
      }
    } catch {
      setScore(prevScore);
      setUserVote(prevVote);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUpvoted = userVote === 1;
  const isDownvoted = userVote === -1;

  const iconSizes = size === 'sm' ? 'size-3.5 sm:size-4' : 'size-4.5 sm:size-5';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-zinc-200/80 dark:bg-zinc-900/80 border border-zinc-300/80 dark:border-zinc-800/80 px-1.5 py-0.5 backdrop-blur-sm select-none transition-all shadow-xs',
        className
      )}
    >
      {/* Upvote Button */}
      <button
        type="button"
        onClick={(e) => handleVote(1, e)}
        disabled={isSubmitting}
        title="Upvote"
        className={cn(
          'p-0.5 rounded-full transition-colors cursor-pointer focus:outline-none',
          isUpvoted
            ? 'text-[#FF4500] fill-[#FF4500]'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-[#FF4500]'
        )}
      >
        <ArrowBigUp
          className={cn(iconSizes, isUpvoted && 'fill-[#FF4500] text-[#FF4500]')}
        />
      </button>

      {/* Net Score */}
      <span
        className={cn(
          'px-1 font-bold font-mono text-xs transition-colors min-w-[18px] text-center',
          isUpvoted && 'text-[#FF4500]',
          isDownvoted && 'text-[#7193FF]',
          !isUpvoted && !isDownvoted && 'text-zinc-700 dark:text-zinc-200'
        )}
      >
        {formatScore(score)}
      </span>

      {/* Downvote Button */}
      <button
        type="button"
        onClick={(e) => handleVote(-1, e)}
        disabled={isSubmitting}
        title="Downvote"
        className={cn(
          'p-0.5 rounded-full transition-colors cursor-pointer focus:outline-none',
          isDownvoted
            ? 'text-[#7193FF] fill-[#7193FF]'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-[#7193FF]'
        )}
      >
        <ArrowBigDown
          className={cn(iconSizes, isDownvoted && 'fill-[#7193FF] text-[#7193FF]')}
        />
      </button>
    </div>
  );
}
