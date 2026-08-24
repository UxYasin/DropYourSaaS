import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileLayout } from '@/components/mobile-layout';
import { BentoRails } from '@/components/bento-rails';
import { FaviconImage } from '@/components/favicon-image';
import { PreviewImage } from '@/components/preview-image';
import { getListingBySlug } from '@/lib/leaderboard';
import { ProfileActions } from './profile-actions';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return {
      title: 'Listing Not Found · DropYourSaaS',
    };
  }

  const title = `${listing.name} – SaaS Discovery on DropYourSaaS`;
  const description = `Discover ${listing.name} on DropYourSaaS. Community-ranked #${listing.rank} software with instant indexation, verified SEO backlinks, and real-time leaderboard exposure.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://dropyoursaas.com/s/${slug}`,
      siteName: 'DropYourSaaS',
      images: listing.preview_image_url
        ? [{ url: listing.preview_image_url }]
        : listing.favicon
        ? [{ url: listing.favicon }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ListingProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  // Extract clean domain for display
  let cleanDomain = listing.name;
  try {
    cleanDomain = new URL(listing.url).hostname.replace(/^www\./, '');
  } catch {
    cleanDomain = listing.name.toLowerCase().replace(/https?:\/\//, '');
  }

  const targetHref = `${listing.url}${
    listing.url.includes('?') ? '&' : '?'
  }utm_source=dropyoursaas&utm_medium=profile&utm_campaign=listing`;

  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        <Header />

        <main className="flex-1 max-w-[1600px] xl:max-w-[1680px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-start gap-6 lg:gap-8">
            <BentoRails side="left" />

            <div className="w-full max-w-4xl xl:max-w-5xl mx-auto min-w-0 space-y-8">
              {/* Back Navigation Link */}
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Leaderboard</span>
                </Link>
              </div>

              {/* Main Profile Header Section */}
              <div className="space-y-6 pt-1">
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                  {/* Big Rounded Startup Logo / Favicon */}
                  <div className="size-16 sm:size-20 rounded-2xl bg-card p-2 border border-border/80 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                    <FaviconImage
                      url={listing.url}
                      name={listing.name}
                      src={listing.favicon}
                      size={64}
                      containerClassName="rounded-xl size-full"
                    />
                  </div>

                  {/* Startup Title & Hostname */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-mono font-bold text-[#E0674B] dark:text-[#F0785C]">
                      #{listing.rank} on dropyoursaas.com
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-mono font-black tracking-tight text-foreground truncate">
                      {cleanDomain}
                    </h1>

                    <a
                      href={targetHref}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="text-xs sm:text-sm font-mono text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group/host"
                    >
                      <span>{cleanDomain}</span>
                      <ExternalLink className="size-3 opacity-0 group-hover/host:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>

                {/* Interactive Action Buttons (Visit, Sponsor, Vote, Share) */}
                <ProfileActions listing={listing} />

                {/* 4-Column Bento Stats Card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl border border-border/80 bg-zinc-50/50 dark:bg-zinc-900/40 shadow-xs">
                  {/* Position */}
                  <div className="space-y-1">
                    <div className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      POSITION
                    </div>
                    <div className="font-mono font-black text-2xl sm:text-3xl text-foreground">
                      #{listing.rank}
                    </div>
                  </div>

                  {/* Sponsorship */}
                  <div className="space-y-1">
                    <div className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      SPONSORSHIP
                    </div>
                    <div className="font-mono font-black text-2xl sm:text-3xl text-foreground">
                      ${(listing.bid || 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Clicks */}
                  <div className="space-y-1">
                    <div className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      CLICKS
                    </div>
                    <div className="font-mono font-black text-2xl sm:text-3xl text-foreground">
                      {(listing.clicks || 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Last Change */}
                  <div className="space-y-1">
                    <div className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      LAST CHANGE
                    </div>
                    <div className="font-mono font-bold text-lg sm:text-2xl text-foreground truncate">
                      {listing.time || 'Recently'}
                    </div>
                  </div>
                </div>

                {/* Preview Image Banner (if available) */}
                <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      <ShieldCheck className="size-4 text-emerald-500" />
                      <span>Live Site Snapshot</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Category: <strong className="text-foreground font-semibold">{listing.category || 'SaaS'}</strong>
                    </span>
                  </div>

                  <a
                    href={targetHref}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="block overflow-hidden rounded-xl group/prev"
                  >
                    <PreviewImage
                      src={listing.preview_image_url}
                      url={listing.url}
                      name={listing.name}
                      title={listing.name}
                    />
                  </a>
                </div>

                {/* Footer Notice */}
                <div className="pt-2 text-xs text-muted-foreground font-body leading-relaxed max-w-3xl">
                  The name, description and icon come from the site itself.{' '}
                  <strong className="text-foreground font-mono font-semibold">{cleanDomain}</strong> holds{' '}
                  <span className="text-[#E0674B] dark:text-[#F0785C] font-mono font-bold">#{listing.rank}</span> until somebody
                  pays more or earns higher upvotes — see the{' '}
                  <Link href="/rules" className="underline text-foreground hover:text-[#E0674B] transition-colors font-medium">
                    rules
                  </Link>
                  .
                </div>
              </div>
            </div>

            <BentoRails side="right" />
          </div>
        </main>

        <Footer />
      </div>
    </MobileLayout>
  );
}
