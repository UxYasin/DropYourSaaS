import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | DropYourSaaS',
  description: 'Privacy Policy and data protection details for DropYourSaaS users.',
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#08F9C9] text-xs font-mono font-bold">
            <Lock className="size-3.5" />
            Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-zinc-500">Last Updated: August 2026</p>
        </div>

        {/* Long-form Legal Content */}
        <div className="text-zinc-300 text-sm leading-relaxed space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Introduction</h2>
            <p>
              At DropYourSaaS, safeguarding your privacy is a core priority. This Privacy Policy outlines the types of information collected and how we use it, in compliance with global data protection standards including the GDPR and CCPA.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Information We Collect</h2>
            <ul className="space-y-3 pl-4 list-disc marker:text-[#08F9C9]">
              <li>
                <strong className="text-white">Voluntary Data:</strong> When you submit your startup or buy an ad slot, we collect your email address, startup name, website URL, description, and optional social handles.
              </li>
              <li>
                <strong className="text-white">Transaction Data:</strong> Payment details are handled securely and directly by our Merchant of Record, Paddle. We never store or process raw credit card numbers on our servers.
              </li>
              <li>
                <strong className="text-white">Log Files &amp; Analytics:</strong> Standard internet log data including IP addresses, browser types, and referral pages to monitor site performance and security.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. How We Use Your Information</h2>
            <p>
              We use collected information to operate the directory, display your startup listing, process secure transactions via Paddle, and send operational updates regarding your submission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Cookies and Web Beacons</h2>
            <p>
              DropYourSaaS uses &apos;cookies&apos; to store information including visitors&apos; preferences and the pages on the website that the visitor accessed or visited, optimizing the user experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Data Security &amp; Retention</h2>
            <p>
              We implement industry-standard security protocols and encrypted HTTPS channels. We retain your data only for as long as necessary to provide you with our services and for legitimate and essential business purposes.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-zinc-900">
            <h2 className="text-xl font-bold text-white">6. Your Data Rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, or delete your personal data. Contact us at{' '}
              <a
                href="mailto:yasin@dropyoursaas.com"
                className="text-[#08F9C9] font-mono hover:underline"
              >
                yasin@dropyoursaas.com
              </a>{' '}
              to exercise these rights.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
