'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/80 py-8 bg-muted/20 backdrop-blur-xs">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
        <div className="flex flex-col items-center md:items-start gap-2.5">
          <p className="font-mono">
            © 2026 DropYourSaaS · Pay-to-Rank Software Discovery &amp; Advertising Platform
          </p>
          <a
            href="https://tools.launchllama.co?utm_source=badge&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:opacity-90 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://tools.launchllama.co/featured-badge.png?v=2"
              alt="As seen on Launch Llama Newsletter"
              width={200}
              height={50}
              className="h-9 w-auto object-contain"
            />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs font-medium">
          <Link
            href="/advertise"
            className="text-amber-600 dark:text-amber-400 font-bold hover:underline transition-colors"
          >
            Advertise
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/refunds" className="hover:text-foreground transition-colors">
            Refund Policy
          </Link>
          <span>·</span>
          <Link href="/rules" className="hover:text-foreground transition-colors">
            Guidelines
          </Link>
          <span>·</span>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}