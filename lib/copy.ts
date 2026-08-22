export const IS_FREE_MODE = process.env.NEXT_PUBLIC_IS_FREE_MODE === 'true';

export const siteCopy = {
  hero: {
    headline: IS_FREE_MODE
      ? 'List Your SaaS for Free'
      : 'List Your SaaS for Instant Indexing',
    description: IS_FREE_MODE
      ? 'Instant directory indexing. Submit your project profile for free to be featured across our verified developer index.'
      : 'Instant directory indexing starting at $1. Submit your project profile to be featured across our verified developer index.',
    subtext: IS_FREE_MODE
      ? 'Already listed? Re-submit your project link after 24 hours to refresh your placement.'
      : "Already listed? Drop in the same link to push your tier higher — you're only charged the difference.",
    cta: 'Claim #1',
  },
  feed: {
    podiumButton: 'Take this spot',
    listingButton: 'Claim',
    showPrices: !IS_FREE_MODE,
  },
  guidelines: {
    indexingRules: IS_FREE_MODE
      ? [
          'Directory listings are 100% free with instant 1-click email verification.',
          'To maintain high-quality listings and prevent spam, submissions are limited to 1 per 24 hours per account.',
          'Submissions placed on the index are discoverable and indexed in the public feed immediately upon email confirmation.',
          'Chronological priority applies to verified submissions.',
        ]
      : [
          'Directory listings start at $1 USD minimum.',
          'Products featured on the index maintain their verified placement tier based on their profile indexing level.',
          'Submissions placed at any tier are indexed in the public directory and discoverable immediately.',
          'Equal indexing tiers maintain chronologically ordered placements (earlier verified profiles maintain priority).',
        ],
    upgradeRules: IS_FREE_MODE
      ? [
          'Enter your previously listed website URL to re-verify or refresh your metadata.',
          'Refresh cooldown is 24 hours per tool.',
          'All profile metadata, titles, and preview descriptions are dynamically refreshed.',
        ]
      : [
          'Enter your previously listed website URL or handle to upgrade your project to a higher tier.',
          'Upgrades require a minimum $1 increase over your current tier; you only pay the upgrade difference.',
          'All profile metadata, titles, and preview descriptions are dynamically refreshed upon upgrade.',
        ],
  },
  about: {
    modelDescription: IS_FREE_MODE
      ? 'The indexing system is transparent and self-serve: submit your SaaS profile for free to secure an active directory slot. Verified listings receive discoverability across our directory and trending feeds. Listings can be updated or refreshed every 24 hours.'
      : 'The indexing system is transparent and self-serve: submit your SaaS profile to secure an active directory tier. Products with higher indexing tiers receive prime placement across our directory, trending feeds, and discoverability channels. Existing listings can upgrade their tier at any time by paying the tier difference.',
  },
};
