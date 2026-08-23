'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Zap } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Lightweight Navigation Header */}
      <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-white flex items-center gap-2">
          Drop<span className="text-[#08F9C9]">YourSaaS</span>
        </Link>
        <Link
          href="/"
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          ← Home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-6 shadow-2xl">
          <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#08F9C9] flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-[#FF8B06] text-xs font-mono font-bold border border-amber-500/30">
              <Zap className="size-3.5 fill-[#FF8B06]" />
              Sponsorship Active
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your side-panel sponsor spot has been registered. Your product listing and sponsorship badge are now live on DropYourSaaS!
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full h-11 px-6 rounded-full font-bold text-xs text-white bg-[#FF8B06] hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition-all gap-2 cursor-pointer"
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
