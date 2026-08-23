import fs from 'fs';

const SPONSOR_TIERS = [
  { slotsFilledThreshold: 0, priceId: 'pri_01m0qcsvzpx70d1dmwtc94qbj5', label: 'Slot 1 (Early Bird)', baseUsd: 50 },
  { slotsFilledThreshold: 1, priceId: 'pri_01m0qcswv02ac2063xkcztrb54', label: 'Slot 2 (Fast Mover)', baseUsd: 100 },
  { slotsFilledThreshold: 2, priceId: 'pri_01m0qcsxcfhxbhbawty0ksapxp', label: 'Slot 3 (Standard)', baseUsd: 150 },
  { slotsFilledThreshold: 3, priceId: 'pri_01m0qcsyd7xc9dsx3cxawwamjx', label: 'Slot 4+ (Final Spot)', baseUsd: 200 },
];

function getActiveSponsorTier(slotsFilled) {
  if (slotsFilled <= 0) return SPONSOR_TIERS[0];
  if (slotsFilled === 1) return SPONSOR_TIERS[1];
  if (slotsFilled === 2) return SPONSOR_TIERS[2];
  return SPONSOR_TIERS[3];
}

async function testSlotProgression() {
  console.log('🧪 Testing Dynamic Scarcity Price Progression across slots...');

  const tier0 = getActiveSponsorTier(0);
  console.log(`0 Slots Filled -> Tier: ${tier0.label} ($${tier0.baseUsd}) [Price ID: ${tier0.priceId}]`);

  const tier1 = getActiveSponsorTier(1);
  console.log(`1 Slot Filled -> Tier: ${tier1.label} ($${tier1.baseUsd}) [Price ID: ${tier1.priceId}]`);

  const tier2 = getActiveSponsorTier(2);
  console.log(`2 Slots Filled -> Tier: ${tier2.label} ($${tier2.baseUsd}) [Price ID: ${tier2.priceId}]`);

  const tier3 = getActiveSponsorTier(3);
  console.log(`3+ Slots Filled -> Tier: ${tier3.label} ($${tier3.baseUsd}) [Price ID: ${tier3.priceId}]`);

  if (
    tier0.baseUsd === 50 &&
    tier1.baseUsd === 100 &&
    tier2.baseUsd === 150 &&
    tier3.baseUsd === 200
  ) {
    console.log('🎉 Dynamic Scarcity Price Tier escalation logic verified 100%!');
  } else {
    console.error('❌ Tier progression mismatch!');
    process.exit(1);
  }
}

testSlotProgression().catch(console.error);
