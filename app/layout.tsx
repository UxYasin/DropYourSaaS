import type { Metadata } from 'next';
import { Geist_Mono, Inconsolata, Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { UmamiAnalytics } from '@/components/umami-analytics';
import { DataFastAnalytics } from '@/components/datafast-analytics';
import { WhopAnalytics } from '@/components/whop-analytics';
import { CloudFastAnalytics } from '@/components/cloudfast-analytics';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: {
    default: 'DropYourSaaS.com · Rank higher. Claim #1 for $1',
    template: '%s · DropYourSaaS.com',
  },
  description:
    'The real-time discovery & promotional platform for software founders. Rank higher with instant indexation, permanent dofollow SEO backlinks, and community-ranked leaderboard exposure on DropYourSaaS.com.',
  applicationName: 'DropYourSaaS.com',
  openGraph: {
    siteName: 'DropYourSaaS.com',
    title: 'DropYourSaaS.com · Rank higher. Claim #1',
    description: 'The real-time pay-to-rank SaaS leaderboard. Instant placement, dofollow backlinks & live exposure.',
    url: 'https://www.dropyoursaas.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dropyoursaas',
    creator: '@dropyoursaas',
    title: 'DropYourSaaS.com · Rank higher. Claim #1',
    description: 'The real-time pay-to-rank SaaS leaderboard.',
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-icon.png',
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const inconsolata = Inconsolata({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DropYourSaaS.com',
    alternateName: ['DropYourSaaS', 'Drop Your SaaS'],
    url: 'https://www.dropyoursaas.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.dropyoursaas.com/explore?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'antialiased',
        fontMono.variable,
        inter.variable,
        inconsolata.variable,
        'font-sans'
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <UmamiAnalytics />
        <DataFastAnalytics />
        <WhopAnalytics />
        <CloudFastAnalytics />
      </body>
    </html>
  );
}
