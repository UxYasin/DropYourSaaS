'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MailCheck, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { Button } from '@/components/ui/button';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="max-w-xl mx-auto w-full my-8 sm:my-12 px-4">
      <div className="bg-card border border-border/80 text-foreground rounded-3xl p-6 sm:p-10 text-center shadow-xl space-y-6">
        {/* Glowing Badge */}
        <div className="size-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-[0_0_24px_rgba(0,102,255,0.25)]">
          <MailCheck className="size-8" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-mono font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
            Check Your Inbox!
          </h1>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            We sent a 1-click verification link to confirm ownership of your SaaS listing.
          </p>
        </div>

        {/* Email Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border/70 font-mono text-xs text-blue-600 dark:text-blue-400 max-w-full truncate">
          <Sparkles className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="truncate">{email}</span>
        </div>

        {/* Next Steps Card */}
        <div className="text-left bg-muted/30 border border-border/70 rounded-2xl p-4 sm:p-5 space-y-3 font-sans">
          <div className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
            Next Steps:
          </div>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>Open the verification email sent to your inbox.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>Click <strong className="text-foreground">"Verify Listing &amp; Activate Index"</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>Your SaaS will immediately go live on the verified index feed!</span>
            </li>
          </ul>
        </div>

        {/* Return Button */}
        <div className="pt-2">
          <Link href="/">
            <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-sm h-12 shadow-lg flex items-center justify-center gap-2">
              <ArrowLeft className="size-4" />
              Return to Directory Feed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center py-6">
          <Suspense fallback={<div className="text-center py-12 text-muted-foreground font-mono">Loading confirmation...</div>}>
            <ThankYouContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </MobileLayout>
  );
}
