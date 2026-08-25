'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Lottie } from 'lottie-react';

function CongratsContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || searchParams.get('title') || 'Your SaaS';
  const rank = searchParams.get('rank') || '1';
  const verified = searchParams.get('verified') === 'true' || searchParams.get('fast_track') === 'true';
  const url = searchParams.get('url') || '';

  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // Fetch clean confetti burst animation JSON
    fetch('https://assets2.lottiefiles.com/packages/lf20_u4yrau.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.warn('Lottie fetch fallback:', err));
  }, []);

  const shareText = encodeURIComponent(
    `YOO! Just submitted ${name} to @DropYourSaaS! Check it out here: https://www.dropyoursaas.com #buildinpublic #saas`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 relative overflow-hidden font-sans">
      {/* Background Lottie Confetti Layer */}
      {animationData && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-85 scale-125">
          <Lottie src={animationData} loop={false} className="w-full h-full max-w-4xl" />
        </div>
      )}

      {/* Subtle Dark Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Foreground Content */}
      <div className="z-10 flex flex-col items-center max-w-2xl mx-auto gap-7 animate-in fade-in zoom-in-95 duration-300">
        {/* Verified Spark Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#08F9C9]/10 text-[#08F9C9] font-mono text-xs sm:text-sm font-bold tracking-wide">
          <Sparkles className="size-4 animate-pulse" />
          <span>{verified ? 'FAST-TRACK VERIFIED LISTING' : 'INSTANTLY PUBLISHED'}</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-none">
            YOO YOUR SAAS IS LIVE
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-zinc-300">
            <span className="text-[#08F9C9]">{name}</span> is officially placed at{' '}
            <span className="text-amber-400">#{rank}</span> on the leaderboard.
          </p>
        </div>

        {/* Subtitle / Bag Secured Copy */}
        <p className="text-sm sm:text-base text-zinc-400 max-w-lg leading-relaxed">
          Submission successful. The directory is instantly updated and live across all global indexes. Time to secure the bag.
        </p>

        {/* Action Buttons Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-3 w-full sm:w-auto">
          {/* Main CTA Button: Explore Directory */}
          <Link
            href="/"
            className="w-full sm:w-auto bg-[#0052FF] hover:bg-blue-600 text-white font-black py-4 px-9 rounded-full transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 text-sm sm:text-base inline-flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Explore Directory</span>
            <ArrowRight className="size-4" />
          </Link>

          {/* Secondary CTA: Share on X */}
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-7 rounded-full transition-all duration-200 text-sm sm:text-base inline-flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
          >
            <svg className="size-4 fill-current text-[#1DA1F2]" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Share on X</span>
          </a>
        </div>

        {/* Sub-navigation links */}
        <div className="flex items-center gap-6 pt-4 text-xs sm:text-sm font-semibold text-zinc-500">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
            >
              <span>Visit Your Site</span>
              <ExternalLink className="size-3" />
            </a>
          )}
          <Link href="/explore" className="hover:text-[#08F9C9] transition-colors">
            View All Categories
          </Link>
          <Link href="/buy-sell" className="hover:text-[#08F9C9] transition-colors">
            Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CongratsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">
          Loading...
        </div>
      }
    >
      <CongratsContent />
    </Suspense>
  );
}
