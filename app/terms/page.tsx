import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | DropYourSaaS',
  description: 'Terms of Service and legal agreement for using DropYourSaaS.',
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold">
            <Shield className="size-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-xs font-mono text-zinc-500">Last Updated: August 2026</p>
        </div>

        {/* Long-form Legal Content */}
        <div className="text-zinc-300 text-sm leading-relaxed space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing and using DropYourSaaS (dropyoursaas.com), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Description of Services</h2>
            <p>
              DropYourSaaS operates as a curated directory platform and digital advertising marketplace for software-as-a-service (SaaS) products, startups, and related developer tools. We provide organic visibility listings and optional paid promotional placements (&apos;Side-panel sponsor spots&apos;).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Purchases and Payments</h2>
            <p>
              All financial transactions for paid sponsorships are processed securely through our merchant of record, Paddle. By purchasing a placement, you warrant that you are authorized to use the payment method provided. All prices are subject to change based on our dynamic scarcity model.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. User Responsibilities &amp; Content Guidelines</h2>
            <p>
              You retain full ownership of the content, logos, and URLs you submit. However, you grant DropYourSaaS a worldwide, non-exclusive license to display your submission. You agree not to submit malware, scam links, illegal content, or intellectual property violations. We reserve the right to remove any listing violating these standards without refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Intellectual Property &amp; DMCA</h2>
            <p>
              If you believe any content on DropYourSaaS infringes upon your copyright, please contact us immediately with a formal takedown notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">6. Limitation of Liability</h2>
            <p className="uppercase text-xs tracking-wider text-zinc-400 font-mono">
              DROPYOURSAAS IS PROVIDED ON AN &apos;AS-IS&apos; AND &apos;AS-AVAILABLE&apos; BASIS. WE DO NOT GUARANTEE SPECIFIC TRAFFIC NUMBERS, REVENUE OUTCOMES, OR CONVERSION RATES FROM DIRECTORY PLACEMENTS. TO THE FULLEST EXTENT PERMITTED BY LAW, DROPYOURSAAS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-zinc-900">
            <h2 className="text-xl font-bold text-white">7. Contact Information</h2>
            <p>
              For questions regarding these terms, reach out directly at{' '}
              <a
                href="mailto:yasin@dropyoursaas.com"
                className="text-[#08F9C9] font-mono hover:underline"
              >
                yasin@dropyoursaas.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
