import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { siteCopy } from '@/lib/copy';

export default function RulesPage() {
  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold tracking-tight">Directory Guidelines</h1>
            <div className="mt-8 space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3">How Directory Indexing Works</h2>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  {siteCopy.guidelines.indexingRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Tier Upgrades &amp; Profile Boosting</h2>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  {siteCopy.guidelines.upgradeRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Submission Standards &amp; Content Policy</h2>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>Accepted entries: software products, developer tools, SaaS applications, and creator profiles.</li>
                  <li>
                    Direct messaging/invite-only channels are disallowed (e.g., Telegram, WhatsApp, Discord invite links).
                  </li>
                  <li>Adult, illegal, malicious, or deceptive software listings are strictly prohibited.</li>
                  <li>
                    Affiliate/redirect tracking parameters are normalized to maintain clean canonical URLs.
                  </li>
                  <li>
                    Link shortener URLs are automatically resolved to their canonical destination domain.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Indexing &amp; Activation</h2>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>
                    Once a submission is processed, your listing is indexed across the verified public directory.
                  </li>
                  <li>Visitors click directly through to your canonical software product URL.</li>
                </ul>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </MobileLayout>
  );
}
