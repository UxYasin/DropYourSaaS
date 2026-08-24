import type { Metadata } from 'next';
import { Geist_Mono, Inconsolata, Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { UmamiAnalytics } from '@/components/umami-analytics';
import { DataFastAnalytics } from '@/components/datafast-analytics';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'DropYourSaaS · Rank higher. Get more clicks for FREE',
  description:
    'The real-time discovery & promotional platform for software founders. Rank higher, get more clicks for FREE with instant indexation, permanent SEO backlinks, and community-ranked leaderboard exposure.',
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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'antialiased',
        fontMono.variable,
        inter.variable,
        inconsolata.variable,
        'font-body'
      )}
    >
      <body className="font-body">
        <ThemeProvider>{children}</ThemeProvider>
        <UmamiAnalytics />
        <DataFastAnalytics />
      </body>
    </html>
  );
}
