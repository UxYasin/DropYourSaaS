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
    <footer className="mt-auto border-t border-border bg-[#faf7f5] dark:bg-[#130a1a] text-foreground transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-12 sm:py-16">
        {/* Main 4-Column Grid Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-border/80">
          {/* Column 1: Newsletter / Updates Block (Spans 5 Columns on Desktop) */}
          <div className="lg:col-span-5 space-y-4 pr-0 lg:pr-8">
            <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground">
              Sign up for our newsletter
            </h3>
            <p className="font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Don&apos;t worry, we reserve our newsletter for important SaaS updates, trending software discoveries, and founder rank shifts.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in-50 duration-200">
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
                  className="h-10 px-4 rounded-full bg-card dark:bg-[#241b27] border border-border text-foreground text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-0"
                  required
                />
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full font-bold text-xs sm:text-sm text-white bg-primary hover:bg-[#76439c] active:bg-[#5b2d7d] border border-transparent shadow-sm hover:shadow-[0_0_0_0.25em_rgba(140,80,185,0.25)] active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Column 2: Platform Links (Spans 2-3 Columns) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm text-foreground">
              Platform &amp; Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-sans">
              <li>
                <Link href="/" className="hover:text-primary transition-colors inline-block">
                  Leaderboard Discovery
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-primary transition-colors inline-block">
                  Explore Directory
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-accent font-semibold hover:underline transition-colors inline-block">
                  Advertise &amp; Sponsor
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-primary transition-colors inline-block">
                  Guidelines &amp; Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Compliance (Spans 2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-sm text-foreground">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-sans">
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-primary transition-colors inline-block">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-primary transition-colors inline-block">
                  Ranking Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About & Partner (Spans 2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-bold text-sm text-foreground">
              About &amp; Partner
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-sans">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors inline-block">
                  About DropYourSaaS
                </Link>
              </li>
              <li>
                <Link href="/stats" className="hover:text-primary transition-colors inline-block">
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-sans">
          <p>© 2026 DropYourSaaS · Pay-to-Rank Software Discovery &amp; Advertising Platform</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/rules" className="hover:text-primary transition-colors">
              Platform Guidelines
            </Link>
            <span>·</span>
            <Link href="/advertise" className="hover:text-primary transition-colors">
              Direct Promotion
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}