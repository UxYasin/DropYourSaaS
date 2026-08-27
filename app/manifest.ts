import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DropYourSaaS.com — #1 Pay-to-Rank SaaS Leaderboard',
    short_name: 'DropYourSaaS',
    description: 'The real-time pay-to-rank software leaderboard. Outrank competitors, get verified backlinks and traffic.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#fe4103',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
