import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle2, AlertTriangle, Mail } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';

export const metadata = {
  title: 'Terms of Service | DropYourSaaS.com',
  description: 'Terms of Service, direct advertising agreement, and acceptable use policy for DropYourSaaS.com.',
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
            <Shield className="size-3.5" />
            Legal Agreement &amp; Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-xs font-mono text-muted-foreground">
            Effective Date: August 24, 2026 · Version 3.2
          </p>
        </div>

        {/* Legal Body */}
        <div className="text-muted-foreground text-sm leading-relaxed space-y-10 font-sans">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
            <p>
              By accessing, browsing, submitting content to, or purchasing digital advertising on DropYourSaaS (&ldquo;DropYourSaaS&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service. If you do not agree with any provision of these terms, you must immediately discontinue use of the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">2. Nature of Services (Direct Advertising &amp; Discovery)</h2>
            <p>
              DropYourSaaS operates exclusively as a <strong>software discovery index, direct digital advertising publisher, and pay-to-rank promotional leaderboard</strong> for software-as-a-service (SaaS) products, digital applications, and developer tools.
            </p>
            <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2 text-xs">
              <div className="font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                What We Provide:
              </div>
              <p>
                We sell direct digital promotional space, directory indexation, SEO backlink exposure, real-time leaderboard positioning, and side-rail banner placements.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">3. Marketplace &amp; Escrow Disclaimer</h2>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-foreground">
              <div className="font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4 shrink-0" />
                Important Notice regarding Transactions:
              </div>
              <p className="leading-relaxed">
                <strong>DropYourSaaS is NOT an escrow agent, business broker, investment intermediary, or financial custodian.</strong> We do not broker acquisitions, transfer intellectual property, or hold buyer/seller funds in escrow. Any external negotiations or agreements between users occur entirely off-platform at their sole discretion and liability.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">4. Digital Purchases &amp; Invoicing</h2>
            <p>
              All purchases on DropYourSaaS—including Pay-to-Rank Leaderboard boosts and Pinned Side-Rail sponsorships—constitute direct digital advertising expenditures.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-amber-500 text-xs sm:text-sm">
              <li>
                <strong>Instant Execution:</strong> Advertising placements, leaderboard rank boosts, and directory listings are activated automatically or published upon payment confirmation.
              </li>
              <li>
                <strong>Authorized Processors:</strong> Transactions are securely processed through merchant-of-record providers (e.g. Polar.sh, Creem, Stripe). We do not store raw card numbers.
              </li>
              <li>
                <strong>Taxes &amp; Invoicing:</strong> Invoices are generated electronically and delivered to the contact email provided during checkout.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">5. Acceptable Content &amp; Prohibited Spam</h2>
            <p>
              You are solely responsible for the links, domain names, trademarks, titles, and descriptions submitted to DropYourSaaS. By submitting a product, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-amber-500 text-xs sm:text-sm">
              <li>You own or are authorized to promote the software product or domain.</li>
              <li>The destination link does not distribute malware, spyware, phishing schemes, illegal content, or deceptive redirects.</li>
              <li>The submission does not infringe upon third-party trademarks, copyrights, or privacy rights.</li>
            </ul>
            <p className="text-xs">
              We reserve the absolute right to reject, unpublish, or permanently ban any listing or advertising creative that violates these guidelines without notice or refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">6. Limitation of Liability</h2>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs font-mono uppercase tracking-wide leading-relaxed">
              DROPYOURSAAS AND ITS OPERATORS PROVIDE THE SERVICES ON AN &ldquo;AS-IS&rdquo; AND &ldquo;AS-AVAILABLE&rdquo; BASIS. WE DO NOT GUARANTEE SPECIFIC TRAFFIC VOLUMES, CONVERSION RATES, OR FINANCIAL RETURNS FROM ANY LISTING OR ADVERTISEMENT. IN NO EVENT SHALL DROPYOURSAAS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR SPECIAL DAMAGES ARISING FROM USE OF THE PLATFORM.
            </div>
          </section>

          <section className="space-y-3 pt-6 border-t border-border/80">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">7. Contact &amp; Legal Notices</h2>
            <p>
              For legal inquiries, copyright notices, or compliance questions, please contact our support team at:
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400">
              <Mail className="size-4" />
              <a href="mailto:support@dropyoursaas.com" className="hover:underline">
                support@dropyoursaas.com
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
