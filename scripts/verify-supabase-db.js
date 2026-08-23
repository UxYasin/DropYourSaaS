import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env.local manually
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
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log('Connecting to live Supabase project:', supabaseUrl);

  // 1. Test leaderboard_entries table
  const { data: leaderboardData, error: leaderboardError } = await supabase
    .from('leaderboard_entries')
    .select('id, url, name, email, verification_token, is_verified, status')
    .limit(1);

  if (leaderboardError) {
    console.error('❌ leaderboard_entries query:', leaderboardError.message);
  } else {
    console.log('✅ leaderboard_entries table & columns verified! Sample count:', leaderboardData?.length);
  }

  // 2. Test listings table
  const { data: listingsData, error: listingsError } = await supabase
    .from('listings')
    .select('id, url, title, submitter_email, verification_token, is_verified, status')
    .limit(1);

  if (listingsError) {
    console.error('ℹ️ listings table query:', listingsError.message);
  } else {
    console.log('✅ listings table & columns verified! Sample count:', listingsData?.length);
  }
}

main().catch(console.error);
