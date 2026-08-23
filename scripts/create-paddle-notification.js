import fs from 'fs';

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

const isSandbox = apiKey.startsWith('pdl_sdbx_');
const BASE_URL = isSandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dropyoursaas.com';

async function createNotificationDestination() {
  console.log(`🚀 Creating Paddle Notification Destination on ${BASE_URL}...`);

  const res = await fetch(`${BASE_URL}/notification-settings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'DropYourSaaS Webhook Endpoint',
      destination: `${appUrl}/api/paddle-webhook`,
      type: 'url',
      subscribed_events: [
        'transaction.completed',
        'transaction.paid',
        'transaction.updated',
      ],
    }),
  });

  const data = await res.json();
  console.log('API Response:', JSON.stringify(data, null, 2));

  if (res.ok && data?.data?.endpoint_secret_key) {
    console.log('\n================ NOTIFICATION DESTINATION CREATED ================');
    console.log(`DESTINATION ID: ${data.data.id}`);
    console.log(`SIGNING SECRET: ${data.data.endpoint_secret_key}`);
  }
}

createNotificationDestination().catch(console.error);
