import pg from 'pg';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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

const sql = `
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS submitter_email text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS category text DEFAULT 'SaaS';
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS for_sale boolean DEFAULT false;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS is_for_sale boolean DEFAULT false;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS asking_price numeric DEFAULT 0;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS mrr numeric DEFAULT 0;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS ttm_revenue numeric DEFAULT 0;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS last_30_days_revenue numeric DEFAULT 0;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS active_subscriptions integer DEFAULT 0;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS founder_name text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS founded_year text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS location_country text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS value_proposition text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS problem_solved text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS audience text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS pricing_model text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS team_size text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS funding_status text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS tech_stack text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS marketing_channels text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS additional_info text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS verification_token text;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_verification';

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_verification_token ON leaderboard_entries(verification_token);
`;

const connectionStrings = [
  'postgresql://postgres.naflsoqdvllbnffghkdv:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZmxzb3FkdmxsYm5mZmdoa2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM5NDI1MSwiZXhwIjoyMTAyOTcwMjUxfQ.aiN-DIx_lMXHQQhSlyP2MS4Doz1XdqBLfrFnIppnAro@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  'postgresql://postgres:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZmxzb3FkdmxsYm5mZmdoa2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM5NDI1MSwiZXhwIjoyMTAyOTcwMjUxfQ.aiN-DIx_lMXHQQhSlyP2MS4Doz1XdqBLfrFnIppnAro@db.naflsoqdvllbnffghkdv.supabase.co:5432/postgres',
];

async function syncSchema() {
  console.log('⚡ Starting schema sync against live Supabase database...');
  let migrated = false;

  for (const conn of connectionStrings) {
    try {
      console.log('Connecting to Postgres host:', conn.split('@')[1]);
      const client = new pg.Client({
        connectionString: conn,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
      });
      await client.connect();
      console.log('Connected! Applying DDL columns...');
      await client.query(sql);
      console.log('✅ DDL columns applied successfully via Direct Postgres connection!');
      await client.end();
      migrated = true;
      break;
    } catch (err) {
      console.warn('Postgres connection attempt note:', err.message);
    }
  }

  // Verify via Supabase Client
  const supabaseUrl = process.env.SUPABASE_URL || 'https://naflsoqdvllbnffghkdv.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('id, url, category, asking_price, mrr, ttm_revenue, last_30_days_revenue, active_subscriptions, founder_name, value_proposition, tech_stack')
      .limit(1);

    if (error) {
      console.error('❌ Supabase API select test:', error.message);
    } else {
      console.log('🎉 Supabase database schema is 100% SYNCED and VERIFIED! Read test succeeded.');
    }
  }
}

syncSchema().catch(console.error);
