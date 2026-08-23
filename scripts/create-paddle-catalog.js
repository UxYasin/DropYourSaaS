import fs from 'fs';

// Parse .env.local manually to get API key
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const val = valueParts.join('=').trim();
      process.env[key.trim()] = val;
    }
  });
}

const apiKey = process.env.PADDLE_API_KEY || process.env.PADDLE_SANDBOX_API_KEY;

if (!apiKey) {
  console.error('❌ Missing PADDLE_API_KEY in environment.');
  process.exit(1);
}

// Determine endpoint based on key prefix (pdl_live_ vs pdl_sdbx_)
const isSandbox = apiKey.startsWith('pdl_sdbx_');
const BASE_URL = isSandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';

const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
};

async function createCatalog() {
  console.log(`🚀 Creating Paddle Product & Prices on ${BASE_URL}...`);

  // 1. Create Product
  const productRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Side-panel sponsor spot',
      tax_category: 'saas',
      description: 'Featured side-panel sponsorship placement across directory pages',
    }),
  });

  const productData = await productRes.json();
  if (!productRes.ok || !productData?.data?.id) {
    console.error('❌ Product creation failed:', JSON.stringify(productData, null, 2));
    process.exit(1);
  }

  const productId = productData.data.id;
  console.log(`✅ Product Created: ${productId} ("Side-panel sponsor spot")`);

  // 2. Define 4 Prices with Regional Country Overrides for UK (GB), Ireland (IE), and Australia (AU)
  const priceSpecs = [
    {
      label: '$50 tier (Slot 1 Price)',
      description: 'Slot 1 Price ($50)',
      amount: '5000',
      gbp: '4000',
      eur: '4500',
      aud: '7500',
    },
    {
      label: '$100 tier (Slot 2 Price)',
      description: 'Slot 2 Price ($100)',
      amount: '10000',
      gbp: '8000',
      eur: '9000',
      aud: '15000',
    },
    {
      label: '$150 tier (Slot 3 Price)',
      description: 'Slot 3 Price ($150)',
      amount: '15000',
      gbp: '12000',
      eur: '13500',
      aud: '22500',
    },
    {
      label: '$200 tier (Standard/Base Price)',
      description: 'Standard/Base Price ($200)',
      amount: '20000',
      gbp: '16000',
      eur: '18000',
      aud: '30000',
    },
  ];

  const createdPrices = [];

  for (const spec of priceSpecs) {
    const priceRes = await fetch(`${BASE_URL}/prices`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        product_id: productId,
        description: spec.description,
        unit_price: {
          amount: spec.amount,
          currency_code: 'USD',
        },
        unit_price_overrides: [
          {
            country_codes: ['GB'],
            unit_price: { amount: spec.gbp, currency_code: 'GBP' },
          },
          {
            country_codes: ['IE'],
            unit_price: { amount: spec.eur, currency_code: 'EUR' },
          },
          {
            country_codes: ['AU'],
            unit_price: { amount: spec.aud, currency_code: 'AUD' },
          },
        ],
      }),
    });

    const priceData = await priceRes.json();
    if (!priceRes.ok || !priceData?.data?.id) {
      console.error(`❌ Failed to create price for ${spec.label}:`, JSON.stringify(priceData, null, 2));
      process.exit(1);
    }

    const priceId = priceData.data.id;
    console.log(`✅ Created Price [${spec.label}]: ${priceId}`);
    createdPrices.push({
      label: spec.label,
      priceId,
      usd: `$${Number(spec.amount) / 100}`,
      gbp: `£${Number(spec.gbp) / 100}`,
      eur: `€${Number(spec.eur) / 100}`,
      aud: `A$${Number(spec.aud) / 100}`,
    });
  }

  console.log('\n================ CATALOG CREATED SUCCESSFULLY ================');
  console.log(`PRODUCT ID: ${productId}`);
  console.table(createdPrices);
}

createCatalog().catch(console.error);
