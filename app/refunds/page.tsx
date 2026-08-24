import Link from 'next/link';
import { ArrowLeft, RefreshCw, Zap, Mail, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';

export const metadata = {
  title: 'Refund & Cancellation Policy | DropYourSaaS',
  description: 'Refund Policy, cancellation terms, and digital goods delivery details for DropYourSaaS.',
};

export default function RefundsPage() {
  return (
    <MobileLayout>
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
        <Header />

      <main className="flex-1 max-w-4xl mx-auto py-10 sm:py-16 px-4 sm:px-6 space-y-12">
        {/* Top Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            ← Back to Leaderboard
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4 border-b border-border/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold">
            <RefreshCw className="size-3.5" />
            Billing Transparency &amp; Digital Goods Policy
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs font-mono text-muted-foreground">
            Effective Date: August 24, 2026 · Version 3.2
          </p>
        </div>

        {/* Policy Body */}
        <div className="text-muted-foreground text-sm leading-relaxed space-y-10 font-sans">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">1. Immediate Execution of Digital Goods</h2>
            <p>
              DropYourSaaS delivers direct digital advertising and directory indexing services. When you complete a transaction for a <strong>Pay-to-Rank Leaderboard Boost</strong> or a <strong>Pinned Side-Rail Sponsor Spot</strong>, inventory allocation, search engine indexing, and real-time public exposure begin immediately.
            </p>
            <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2 text-xs">
              <div className="font-bold text-foreground flex items-center gap-2">
                <Zap className="size-4 text-amber-500" />
                Standard Policy for Instant Digital Marketing Services:
              </div>
              <p>
                Due to the immediate distribution of backlinks and digital exposure upon transaction confirmation, standard advertising fees and leaderboard boost payments are non-refundable once the listing is live.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">2. Recurring Sponsorships &amp; Cancellations</h2>
            <p>
              If you have purchased a monthly or multi-period Pinned Side-Rail Sponsorship:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-purple-500 text-xs sm:text-sm">
              <li>
                <strong>Cancel Anytime:</strong> You may cancel any recurring subscription at any time prior to the next renewal billing date via your invoice link or by emailing support.
              </li>
              <li>
                <strong>Active Period Guarantee:</strong> Your sponsored ad spot will remain live on the designated rail until the end of your prepaid billing period.
              </li>
              <li>
                <strong>No Pro-Rated Mid-Cycle Refunds:</strong> We do not issue partial refunds for days remaining in an active cycle once the period has commenced.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">3. Technical Downtime &amp; Exceptional Refunds</h2>
            <p>
              We are committed to delivering the exact advertising impressions and placement you purchased. Full or partial refunds will be promptly granted under the following circumstances:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-1">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Technical Outage / Failure to Render
                </div>
                <p>
                  If an active pinned ad spot fails to render or display on the platform due to verified server outages for more than 24 consecutive hours.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-1">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Duplicate Charge
                </div>
                <p>
                  If an accidental double charge occurs due to a payment gateway glitch, the duplicate transaction will be refunded immediately in full.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">4. Dispute &amp; Review Timeframe</h2>
            <p>
              Any refund inquiry or billing review request must be submitted within <strong>7 days</strong> of the transaction date.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border/80">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">5. Requesting a Billing Review</h2>
            <p>
              To request a refund or review of your transaction, please email our billing team with your Order ID, registered email, and website URL:
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-600 dark:text-purple-400">
              <Mail className="size-4" />
              <a href="mailto:billing@dropyoursaas.com" className="hover:underline">
                billing@dropyoursaas.com
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      </div>
    </MobileLayout>
  );
}
