'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Zap } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';

export default function ThankYouPage() {
  return (
    <MobileLayout>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
        <Header />

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-10">
          <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-border text-center space-y-6 shadow-xl">
            <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
                <Zap className="size-3.5 fill-current" />
                Sponsorship Active
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Thank You for Your Order!
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your direct advertising sponsorship has been registered. Your product listing and side-rail banner spot are active on DropYourSaaS!
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full h-11 px-6 rounded-full font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg active:scale-95 transition-all gap-2 cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                Return to Leaderboard
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MobileLayout>
  );
}


