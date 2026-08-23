import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export const metadata = {
  title: 'Refund Policy | DropYourSaaS',
  description: 'Refund Policy details for paid sponsorships and advertising on DropYourSaaS.',
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      <div className="max-w-3xl mx-auto py-16 px-6 space-y-12">
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

        {/* Header */}
        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold">
            <RefreshCw className="size-3.5" />
            Billing Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Refund Policy
          </h1>
          <p className="text-xs font-mono text-zinc-500">Last Updated: August 2026</p>
        </div>

        {/* Long-form Legal Content */}
        <div className="text-zinc-300 text-sm leading-relaxed space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. General Policy</h2>
            <p>
              Because our Side-panel sponsor spots provide immediate digital exposure, prime inventory allocation, and high-visibility placement across our directory index views, all purchases of sponsor spots are final and non-refundable once the advertisement is successfully published on the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Exceptional Circumstances</h2>
            <p>
              Refund requests will only be considered under specific, verifiable technical failures—such as a critical platform outage preventing your ad from displaying during your active 7-day window, or an accidental double-charge caused by a payment gateway error.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Timeframe for Claims</h2>
            <p>
              Any dispute, billing error inquiry, or refund request must be submitted in writing within 48 hours of the initial transaction timestamp.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-zinc-900">
            <h2 className="text-xl font-bold text-white">4. How to Request Review</h2>
            <p>
              To request a review of your transaction, please email{' '}
              <a
                href="mailto:yasin@dropyoursaas.com"
                className="text-[#08F9C9] font-mono hover:underline"
              >
                yasin@dropyoursaas.com
              </a>{' '}
              with your order receipt / transaction ID, registered email, and a clear description of the issue.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
