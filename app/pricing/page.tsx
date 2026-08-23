import Link from 'next/link';
import { ArrowLeft, CheckCircle2, DollarSign, Sparkles, Zap, Building } from 'lucide-react';

export const metadata = {
  title: "Pricing — Yes, We're 100% FREE | DropYourSaaS",
  description: "Free directory listings, 3-5% marketplace success fee, and monthly side-panel sponsor slots.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      <div className="max-w-5xl mx-auto py-16 px-6 space-y-16">
        {/* Top Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#08F9C9] transition-colors group"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            ← Back to Home
          </Link>
        </div>

        {/* Hero Section & Main Headline */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#08F9C9] text-xs font-mono font-bold">
            <Sparkles className="size-3.5" />
            100% Free Directory Ethos
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#08F9C9] drop-shadow-[0_0_35px_rgba(8,249,201,0.25)]">
            Yes, We&apos;re 100% FREE.
          </h1>

          <p className="text-zinc-300 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            Add your SaaS, get backlinks, and gain traction without paying a dime. We only make money when you scale or sell.
          </p>
        </div>

        {/* 3-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: The Free Directory (Always Free) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#08F9C9]">
                <CheckCircle2 className="size-6" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#08F9C9] uppercase tracking-wider">
                  Always Free
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  The Free Directory
                </h2>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed">
                Standard directory submissions are completely free forever. No hidden fees, no paywalls, no gimmicks. Add your startup, build your SEO backlinks, and gain organic traffic from our community on us.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Listing Fee:</span>
              <span className="text-[#08F9C9] font-bold">$0 / forever</span>
            </div>
          </div>

          {/* Card 2: Buy/Sell Marketplace (3-5% Success Fee) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-6 hover:border-zinc-700 transition-colors">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building className="size-6" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                  3-5% Success Fee
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Buy/Sell Marketplace
                </h2>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed">
                Ready to exit? List your startup for sale on our high-intent marketplace for free. We strictly operate on a win-win model: we only take a small 3-5% success fee when you successfully close a deal and sell your business through our platform.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Commission:</span>
              <span className="text-blue-400 font-bold">3 - 5% on Close</span>
            </div>
          </div>

          {/* Card 3: Side-Panel Sponsor Slots (Monthly Fee) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-amber-500/30 ring-1 ring-amber-500/20 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FF8B06]">
                <Zap className="size-6 fill-[#FF8B06]" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#FF8B06] uppercase tracking-wider flex items-center gap-1">
                  Dynamic Scarcity
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Side-Panel Sponsor Slots
                </h2>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed">
                Need explosive, guaranteed growth? Rent a prime side-panel sponsor slot on a monthly basis. Our advertising slots utilize a dynamic scarcity pricing model—as inventory fills up, prices scale ($50 to $200/month) to maintain a high signal-to-noise ratio. Lock in your slot for 30 days of direct, high-intent traffic.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Monthly Rate:</span>
              <span className="text-amber-400 font-bold">$50 - $200 / mo</span>
            </div>
          </div>
        </div>

        {/* Prominent Bottom CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-6 max-w-3xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to boost your SaaS visibility?
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
            Join 1,000+ verified founders and showcase your startup to 200,000+ monthly visitors today.
          </p>
          <div>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-9 py-4 rounded-full bg-[#FF8B06] hover:bg-amber-600 text-white font-bold text-base shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Submit Your Startup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
