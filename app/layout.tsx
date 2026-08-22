import type { Metadata } from 'next';
import { Geist_Mono, Inconsolata, Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { UmamiAnalytics } from '@/components/umami-analytics';
import { DataFastAnalytics } from '@/components/datafast-analytics';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'DropYourSaaS · Developer Directory & Software Index',
  description: 'A curated digital software directory and developer indexing platform. Submit and feature your SaaS product.',
  icons: {
    icon: '/icon.svg',
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
