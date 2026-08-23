export interface SponsorTier {
  slotsFilledThreshold: number;
  label: string; // e.g. "Slot 1 (Early Bird)", "Slot 2 (Fast Mover)", etc.
  baseUsd: number;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    slotsFilledThreshold: 0,
    label: 'Slot 1 (Early Bird)',
    baseUsd: 50,
  },
  {
    slotsFilledThreshold: 1,
    label: 'Slot 2 (Fast Mover)',
    baseUsd: 100,
  },
  {
    slotsFilledThreshold: 2,
    label: 'Slot 3 (Standard)',
    baseUsd: 150,
  },
  {
    slotsFilledThreshold: 3,
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
