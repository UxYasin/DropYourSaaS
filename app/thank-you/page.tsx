'use client';

import Link from 'next/link';
import { CheckCircle2, Sparkles, ArrowLeft, Zap } from 'lucide-react';
import { Header } from '@/components/header';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center space-y-6 shadow-xl">
          <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-[#08F9C9] flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-mono font-bold border border-orange-500/30">
              <Zap className="size-3.5" />
              Sponsorship Active
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your side-panel sponsor spot has been registered. Your product listing and sponsorship badge are now live on DropYourSaaS!
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full h-11 px-6 rounded-full font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md active:scale-95 transition-all gap-2"
            >
              <ArrowLeft className="size-4" />
              Return to Directory Feed
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
