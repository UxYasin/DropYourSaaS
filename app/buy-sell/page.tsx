import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { ShoppingBag, ArrowRight, Tag, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BuySellPage() {
  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold mb-6">
              <Sparkles className="size-3.5" />
              SaaS Acquisition Marketplace — Coming Soon
            </div>
            
            <h1 className="font-mono text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Buy & Sell Micro-SaaS
            </h1>
            <p className="font-body text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed">
              Acquire revenue-generating projects, pre-launch products, and niche SaaS businesses directly from verified builders on DropYourSaaS.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/"
                className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md transition-all inline-flex items-center gap-2"
              >
                List Your SaaS for Sale
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Tag className="size-5" />
              </div>
              <h3 className="font-mono font-bold text-sm text-foreground">Direct Deal Flow</h3>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Zero broker lock-ins. Connect directly with founders looking to exit or partner.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-mono font-bold text-sm text-foreground">Verified Traffic & Clicks</h3>
              <p className="font-body text-xs text-muted-foreground mt-1">
                All listed software includes real DataFast analytics and atomic click verification.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="size-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 mb-3">
                <ShoppingBag className="size-5" />
              </div>
              <h3 className="font-mono font-bold text-sm text-foreground">Instant Marketplace Exposure</h3>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Toggle &ldquo;List for Sale&rdquo; when claiming your directory spot to get featured instantly.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </MobileLayout>
  );
}
