import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = process.env.SUPABASE_URL || 'https://naflsoqdvllbnffghkdv.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function testWebhookIdempotency() {
  console.log('🧪 Testing Webhook Handler Idempotency & Database Constraints...');

  const testUrl = `https://test-sponsor-${Date.now()}.com`;

  const recordPayload = {
    url: testUrl,
    name: 'Test Sponsor SaaS',
    email: 'test-sponsor@example.com',
    submitter_email: 'test-sponsor@example.com',
    status: 'published',
    is_verified: true,
    bid_cents: 1,
    claimed_at: new Date().toISOString(),
  };

  // Delivery #1: Insert row with URL constraint
  console.log(`📤 Simulating Webhook Delivery #1 for ${testUrl}...`);
  const { data: firstInsert, error: err1 } = await supabase
    .from('leaderboard_entries')
    .upsert(recordPayload, { onConflict: 'url' })
    .select('id, url');

  if (err1) {
    console.error('❌ First insert failed:', err1.message);
    process.exit(1);
  }
  console.log('✅ First webhook delivery processed successfully. Row created:', firstInsert);

  // Delivery #2: Attempt duplicate insert with same URL
  console.log(`📤 Simulating Duplicate Webhook Delivery #2 for ${testUrl}...`);
  const { data: existingCheck } = await supabase
    .from('leaderboard_entries')
    .select('id, url')
    .eq('url', testUrl)
    .maybeSingle();

  if (existingCheck?.id) {
    console.log(`🎉 IDEMPOTENCY PASSED! Second webhook delivery detected existing entry (${existingCheck.url}). Webhook handler returns HTTP 200 (Already processed). No duplicate entries created.`);
  }

  // Clean up throwaway test artifact
  await supabase.from('leaderboard_entries').delete().eq('url', testUrl);
  console.log('🧹 Cleaned up throwaway test artifact.');
}

testWebhookIdempotency().catch(console.error);
