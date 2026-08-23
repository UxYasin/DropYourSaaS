export interface SponsorTier {
  slotsFilledThreshold: number;
  priceId: string;
  label: string; // e.g. "Slot 1 (Early Bird)", "Slot 2 (Fast Mover)", etc.
  baseUsd: number;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    slotsFilledThreshold: 0,
    priceId: 'pri_01m0qcsvzpx70d1dmwtc94qbj5',
    label: 'Slot 1 (Early Bird)',
    baseUsd: 50,
  },
  {
    slotsFilledThreshold: 1,
    priceId: 'pri_01m0qcswv02ac2063xkcztrb54',
    label: 'Slot 2 (Fast Mover)',
    baseUsd: 100,
  },
  {
    slotsFilledThreshold: 2,
    priceId: 'pri_01m0qcsxcfhxbhbawty0ksapxp',
    label: 'Slot 3 (Standard)',
    baseUsd: 150,
  },
  {
    slotsFilledThreshold: 3,
    priceId: 'pri_01m0qcsyd7xc9dsx3cxawwamjx',
    label: 'Slot 4+ (Final Spot)',
    baseUsd: 200,
  },
];

export function getActiveSponsorTier(slotsFilled: number): SponsorTier {
  if (slotsFilled <= 0) return SPONSOR_TIERS[0];
  if (slotsFilled === 1) return SPONSOR_TIERS[1];
  if (slotsFilled === 2) return SPONSOR_TIERS[2];
  return SPONSOR_TIERS[3];
}
