'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Crown,
  TrendingUp,
  Globe,
  Users,
  Eye,
  CheckCircle2,
  ArrowRight,
  Pin,
  ShieldCheck,
  BarChart3,
  Search,
} from 'lucide-react';
import { PinAdModal } from '@/components/pin-ad-modal';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';

export default function AdvertisePage() {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('left_1');

  const openPinModal = (slot = 'left_1') => {
    setSelectedSlot(slot);
    setIsPinModalOpen(true);
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
        <Header />

      <main className="flex-1 max-w-5xl xl:max-w-6xl mx-auto py-10 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* Top Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            ← Back to Leaderboard
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
            <Sparkles className="size-3.5" />
            Direct Advertising &amp; Pay-to-Rank Discovery
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Get Your SaaS in Front of Thousands of Developers and Founders
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl leading-relaxed max-w-2xl mx-auto">
            Instant indexation, permanent SEO backlinks, and high-visibility side-rail placements. Drive targeted high-intent traffic directly to your product.
          </p>
        </div>

        {/* Audience & Traffic Breakdown Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-card border border-border text-center space-y-2 shadow-xs">
            <div className="size-10 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-foreground">
              50,000+
            </div>
            <div className="text-xs font-sans text-muted-foreground uppercase tracking-wider font-semibold">
              Monthly Active Devs &amp; Founders
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border text-center space-y-2 shadow-xs">
            <div className="size-10 mx-auto rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
              <Eye className="size-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-foreground">
              250,000+
            </div>
            <div className="text-xs font-sans text-muted-foreground uppercase tracking-wider font-semibold">
              Monthly Ad &amp; Listing Impressions
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border text-center space-y-2 shadow-xs">
            <div className="size-10 mx-auto rounded-2xl bg-[#53ab73]/10 text-[#53ab73] flex items-center justify-center">
              <Globe className="size-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight text-foreground">
              120+
            </div>
            <div className="text-xs font-sans text-muted-foreground uppercase tracking-wider font-semibold">
              Global Founder Reach (US, EU, APAC)
            </div>
          </div>
        </div>

        {/* 3 Advertising Tiers Bento Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Choose Your Growth Tier
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans">
              Transparent, immediate execution. Every ad placement delivers real-time visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Tier 1: Pay-to-Rank Leaderboard Boost */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all shadow-xs">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <TrendingUp className="size-6" />
                  </div>
                  <span className="text-xs font-sans font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Self-Serve
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                    Leaderboard Boost
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold font-sans text-foreground">
                      $5 - $50
                    </span>
                    <span className="text-xs text-muted-foreground font-sans">/ dynamic</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-2">
                    Pay-what-you-want dynamic placement. Instant indexation and community upvote visibility.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Direct directory listing &amp; indexation</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Permanent do-follow SEO backlink</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Community upvoting &amp; trending rank score</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Live click &amp; impression metrics</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-muted hover:bg-muted/80 text-foreground font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <span>Boost Your Listing</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Tier 2: Pinned Side-Rail Sponsor Spot (Featured) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-amber-500/60 ring-4 ring-amber-500/10 flex flex-col justify-between space-y-6 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-mono font-bold text-[10px] uppercase tracking-wider shadow-sm">
                Most Popular • Guaranteed Views
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Pin className="size-6 fill-current" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    High Visibility
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    Pinned Side-Rail Spot
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                      $100
                    </span>
                    <span className="text-xs text-muted-foreground">/ month (or $30/7d)</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-2">
                    Fixed side-rail sponsor placement locked across all directory and detail pages.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Fixed left or right rail banner slot</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Highlighted brand badge &amp; custom tagline</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Guaranteed continuous desktop &amp; tablet impressions</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Direct do-follow website link</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => openPinModal('left_1')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Pin className="size-4" />
                  <span>Reserve a Rail Spot</span>
                </button>
              </div>
            </div>

            {/* Tier 3: Featured Leaderboard Takeover (#1 Spot) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 flex flex-col justify-between space-y-6 hover:border-border transition-all shadow-xs">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Crown className="size-6" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    #1 Podium
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    Featured #1 Takeover
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                      Outbid Dynamic
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-2">
                    Claim the absolute #1 ranked podium position on the main directory feed.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Top-pinned row above all competitor listings</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Exclusive Gold Podium Badge &amp; highlight</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Maximum CTR from founders &amp; tech buyers</span>
                  </div>
                  <div className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Instant outbid protection alerts</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-muted hover:bg-muted/80 text-foreground font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <Crown className="size-4 text-amber-500" />
                  <span>Claim #1 Spot</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Why Advertise Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-card border border-border/80 space-y-8 shadow-xs">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Why Founders Advertise on DropYourSaaS
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              A high-signal discovery platform built for genuine developer engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Search className="size-4.5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Permanent SEO Backlinks</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Indexed directly with high domain authority, clean canonical tags, and do-follow links that strengthen your organic rank.
              </p>
            </div>

            <div className="space-y-2">
              <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BarChart3 className="size-4.5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Transparent Metrics</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-time tracking of outbound clicks, community votes, and impressions visible directly on the public directory.
              </p>
            </div>

            <div className="space-y-2">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="size-4.5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Instant Self-Serve</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zero friction. Submit your URL, select your tier, and go live immediately with automated metadata extraction.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 text-white text-center space-y-6 max-w-3xl mx-auto shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-bold text-zinc-300">
            <Zap className="size-3.5 text-amber-400 fill-amber-400" />
            Immediate Publication
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to scale your SaaS visibility?
          </h3>
          <p className="text-zinc-300 text-xs sm:text-base max-w-lg mx-auto">
            Join hundreds of indie hackers, startups, and tech founders who get continuous traffic from DropYourSaaS.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Submit Your Product
            </Link>
            <button
              type="button"
              onClick={() => openPinModal('left_1')}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              Reserve a Sponsor Slot ($100/mo)
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Pin Ad Inquiry Modal */}
      <PinAdModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        slotPosition={selectedSlot}
      />
      </div>
    </MobileLayout>
  );
}

