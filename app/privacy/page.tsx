import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, Cookie, Database, Mail } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';

export const metadata = {
  title: 'Privacy Policy | DropYourSaaS.com',
  description: 'Privacy Policy, data protection practices, and cookie disclosures for DropYourSaaS.com.',
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
            <Lock className="size-3.5" />
            Data Protection &amp; GDPR / CCPA Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-muted-foreground">
            Effective Date: August 24, 2026 · Version 3.2
          </p>
        </div>

        {/* Policy Body */}
        <div className="text-muted-foreground text-sm leading-relaxed space-y-10 font-sans">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">1. Privacy Commitment &amp; Scope</h2>
            <p>
              DropYourSaaS (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to transparent and minimal data collection. We respect your digital privacy and design our platform so users can discover software, cast community votes, and advertise products without invasive tracking.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">2. Information We Collect &amp; How It Is Used</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <Database className="size-4 text-blue-500" />
                  Product Submission Data
                </div>
                <p className="text-xs">
                  When you submit a software product, we collect the public URL, product title, description, favicon, and category for directory publication.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <Mail className="size-4 text-amber-500" />
                  Email &amp; Invoicing Details
                </div>
                <p className="text-xs">
                  Contact emails are collected solely for ad delivery confirmations, order receipts, verification tokens, and critical administrative notices.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <Cookie className="size-4 text-purple-500" />
                  Anonymous Voter Token Cookies
                </div>
                <p className="text-xs">
                  We issue a secure, pseudonymous <code>voter_token</code> cookie. This allows the community voting system to prevent duplicate votes without requiring personal registration or tracking personal identities.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  Zero Sale of Data
                </div>
                <p className="text-xs">
                  <strong>We do NOT sell, rent, monetize, or trade your personal data</strong> to data brokers, advertising networks, or third parties under any circumstances.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">3. Payment &amp; Financial Security</h2>
            <p>
              All advertising transactions and digital payments are processed through PCI-DSS Level 1 certified merchant-of-record providers (including Polar.sh, Creem, and Stripe). DropYourSaaS never stores, sees, or handles raw credit card or banking numbers on our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">4. Analytics &amp; Cookies</h2>
            <p>
              We utilize privacy-focused, GDPR-compliant analytics (such as Umami Analytics and DataFast) that do not use invasive tracking cookies or collect Personally Identifiable Information (PII). We capture aggregated metrics like page views, referrers, and outbound link clicks to measure public directory visibility.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">5. Your Data Rights &amp; Deletion Requests</h2>
            <p>
              In accordance with international privacy regulations (including GDPR and CCPA), you maintain full rights to access, inspect, modify, or request deletion of your submitted product information.
            </p>
            <p className="text-xs">
              To request full data removal or update public listing details, submit a request to <a href="mailto:privacy@dropyoursaas.com" className="text-emerald-600 dark:text-emerald-400 underline font-mono">privacy@dropyoursaas.com</a> or <a href="mailto:support@dropyoursaas.com" className="text-emerald-600 dark:text-emerald-400 underline font-mono">support@dropyoursaas.com</a>. Requests are verified and processed within 48 hours.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border/80">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">6. Contact Data Protection</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact our Data Protection team at:
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <Mail className="size-4" />
              <a href="mailto:privacy@dropyoursaas.com" className="hover:underline">
                privacy@dropyoursaas.com
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
