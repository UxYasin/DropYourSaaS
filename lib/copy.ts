export const IS_FREE_MODE = process.env.NEXT_PUBLIC_IS_FREE_MODE === 'true';

export const siteCopy = {
  hero: {
    headline: 'Rank higher. Get more clicks for FREE',
    description: 'The real-time software discovery & direct promotional platform. Instant indexation, permanent SEO backlinks, and community-ranked leaderboard exposure.',
    subtext: 'Boost your ranking tier at any time to capture prime visibility on the leaderboard and side rails.',
    cta: 'Claim #1 Spot',
    urlPlaceholder: 'Your SaaS URL or domain (e.g. yourproduct.com)',
  },
  feed: {
    podiumButton: 'Claim this spot',
    listingButton: 'Claim',
    showPrices: !IS_FREE_MODE,
  },
  guidelines: {
    indexingRules: [
      'Directory listings start with dynamic self-serve promotion starting from $1.',
      'Featured products maintain verified placement on the real-time leaderboard based on their active advertising tier.',
      'Submissions are indexed in the public directory and discoverable immediately upon payment confirmation.',
      'Chronological priority applies to equal advertising tiers (earlier verified profiles maintain position).',
    ],
    upgradeRules: [
      'Enter your previously listed website URL to boost your project to a higher advertising tier.',
      'Upgrades only require the price difference over your current tier.',
      'All product metadata, titles, and preview descriptions are dynamically refreshed upon upgrade.',
    ],
  },
  about: {
    modelDescription:
      'The indexing system is transparent and self-serve: submit your SaaS profile to secure an active advertising tier. Products with higher promotional tiers receive prime placement across our directory, trending feeds, and high-visibility side rails. Existing listings can upgrade their tier at any time.',
  },
};

