import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { siteCopy } from '@/lib/copy';

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
              <p>{siteCopy.about.modelDescription}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </MobileLayout>
  );
}
