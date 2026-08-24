'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="mt-auto border-t border-border/80 bg-background dark:bg-black text-foreground transition-colors">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main 4-Column Grid Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-border/60">
          {/* Column 1: Newsletter / Updates Block (Spans 5 Columns on Desktop) */}
          <div className="lg:col-span-5 space-y-4 pr-0 lg:pr-8">
            <h3 className="font-mono font-bold text-lg sm:text-xl text-foreground">
              Sign up for our newsletter
            </h3>
            <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Don&apos;t worry, we reserve our newsletter for important SaaS updates, trending software discoveries, and founder rank shifts.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold animate-in fade-in-50 duration-200">
                <CheckCircle2 className="size-4" />
                <span>You&apos;re subscribed! Thanks for joining.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-10 px-4 rounded-full bg-muted/60 dark:bg-zinc-900 border border-border/80 text-foreground text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#E0674B] flex-1 min-w-0"
                  required
                />
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full font-bold text-xs sm:text-sm text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white border border-border/40 shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Column 2: Platform Links (Spans 2-3 Columns) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono font-bold text-sm text-foreground">
              Platform &amp; Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-sans">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors inline-block">
                  Leaderboard Discovery
                </Link>
              </li>
              <li>
                <Link href="/buy-sell" className="hover:text-foreground transition-colors inline-block">
                  Buy / Sell Startups
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline transition-colors inline-block">
                  Advertise &amp; Sponsor
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-foreground transition-colors inline-block">
                  Guidelines &amp; Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Compliance (Spans 2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono font-bold text-sm text-foreground">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-sans">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-foreground transition-colors inline-block">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-foreground transition-colors inline-block">
                  Ranking Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About & Partner (Spans 2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono font-bold text-sm text-foreground">
              About &amp; Partner
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-sans">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors inline-block">
                  About DropYourSaaS
                </Link>
              </li>
              <li>
                <Link href="/stats" className="hover:text-foreground transition-colors inline-block">
                  Live Traffic &amp; Stats
                </Link>
              </li>
              <li className="pt-1">
                <a
                  href="https://tools.launchllama.co?utm_source=badge&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-90 transition-opacity"
                  title="Featured on Launch Llama"
                >
                  <Image
                    src="https://tools.launchllama.co/featured-badge.png?v=2"
                    alt="As seen on Launch Llama Newsletter"
                    width={160}
                    height={40}
                    className="h-8 w-auto object-contain"
                    unoptimized
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Secondary Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <p>© 2026 DropYourSaaS · Pay-to-Rank Software Discovery &amp; Advertising Platform</p>
          <div className="flex items-center gap-4 text-[11px] font-sans">
            <Link href="/rules" className="hover:text-foreground transition-colors">
              Platform Guidelines
            </Link>
            <span>·</span>
            <Link href="/advertise" className="hover:text-foreground transition-colors">
              Direct Promotion
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}