'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800/80 py-8 bg-zinc-50/50 dark:bg-black/50">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex flex-col items-center md:items-start gap-3">
          <p>© 2026 DropYourSaaS · A realtime database &amp; marketplace for SaaS owners</p>
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
              className="h-10 w-auto object-contain"
            />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs font-medium">
          <Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-white transition-colors text-amber-500 font-bold">
            Pricing
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Terms of Service
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/refunds" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Refund Policy
          </Link>
          <span>·</span>
          <Link href="/stats" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Directory Stats
          </Link>
          <span>·</span>
          <Link href="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            About
          </Link>
          <span>·</span>
          <Link href="/rules" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Guidelines
          </Link>
        </div>
      </div>
    </footer>
  );
}