import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';

export default function AboutPage() {
  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold tracking-tight">About DropYourSaaS</h1>
            <div className="mt-8 space-y-6 text-muted-foreground">
              <p>
                DropYourSaaS is a curated digital software directory and developer indexing platform.
                We provide builders and founders with high-visibility listing slots to showcase their products
                to developers, founders, and early adopters.
              </p>
              <p>
                The indexing system is transparent and self-serve: submit your SaaS profile to secure an active
                directory tier. Products with higher indexing tiers receive prime placement across our directory,
                trending feeds, and discoverability channels.
              </p>
              <p>
                Existing listings can upgrade their tier at any time by paying the tier difference to boost their
                placement and maximize discovery.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </MobileLayout>
  );
}
