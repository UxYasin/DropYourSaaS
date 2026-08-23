const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
  });
}

const { createClient } = require('@supabase/supabase-js');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

async function runMigration() {
  console.log('Running voting system migration on Supabase...');

  // 1. Add columns to leaderboard_entries and listings if not existing
  const queries = [
    `ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0;`,
    `ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0;`,
    `ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS net_score INT DEFAULT 0;`,
    `ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS hot_score FLOAT DEFAULT 0;`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0;`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0;`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS net_score INT DEFAULT 0;`,
    `ALTER TABLE listings ADD COLUMN IF NOT EXISTS hot_score FLOAT DEFAULT 0;`,
  ];

  // Since Supabase JS library doesn't expose arbitrary SQL execution unless an RPC exists,
  // we can use postgres connection directly if pg is installed or execute queries through postgres if needed.
  try {
    const { Client } = require('pg');
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (dbUrl) {
      console.log('Connecting via pg Client...');
      const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
      await client.connect();
      const sql = `
        ALTER TABLE leaderboard_entries 
        ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS net_score INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS hot_score FLOAT DEFAULT 0;

        ALTER TABLE listings 
        ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS net_score INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS hot_score FLOAT DEFAULT 0;

        CREATE TABLE IF NOT EXISTS listing_votes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID REFERENCES leaderboard_entries(id) ON DELETE CASCADE,
          voter_token TEXT NOT NULL,
          vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
          created_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE (listing_id, voter_token)
        );

        CREATE INDEX IF NOT EXISTS idx_listing_votes_token_listing ON listing_votes(voter_token, listing_id);
        CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_hot_score ON leaderboard_entries(hot_score DESC);
        CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_net_score ON leaderboard_entries(net_score DESC);

        CREATE OR REPLACE FUNCTION update_leaderboard_vote_counts()
        RETURNS TRIGGER AS $$
        DECLARE
          v_upvotes INT;
          v_downvotes INT;
          v_age_hours FLOAT;
        BEGIN
          SELECT 
            COALESCE(COUNT(*) FILTER (WHERE vote_type = 1), 0),
            COALESCE(COUNT(*) FILTER (WHERE vote_type = -1), 0)
          INTO v_upvotes, v_downvotes
          FROM listing_votes
          WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id);

          SELECT EXTRACT(EPOCH FROM (now() - claimed_at)) / 3600.0
          INTO v_age_hours
          FROM leaderboard_entries
          WHERE id = COALESCE(NEW.listing_id, OLD.listing_id);

          UPDATE leaderboard_entries
          SET 
            upvotes = v_upvotes,
            downvotes = v_downvotes,
            net_score = (v_upvotes - v_downvotes),
            hot_score = (v_upvotes - v_downvotes) / POWER(COALESCE(v_age_hours, 0) + 2, 1.5)
          WHERE id = COALESCE(NEW.listing_id, OLD.listing_id);

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_update_leaderboard_votes ON listing_votes;
        CREATE TRIGGER trg_update_leaderboard_votes
        AFTER INSERT OR UPDATE OR DELETE ON listing_votes
        FOR EACH ROW EXECUTE FUNCTION update_leaderboard_vote_counts();
      `;
      await client.query(sql);
      await client.end();
      console.log('✅ PostgreSQL Migration complete!');
      return;
    }
  } catch (err) {
    console.log('pg connection notice:', err.message);
  }

  // Fallback check columns in Supabase
  console.log('Verifying table access via Supabase JS client...');
  const { data, error } = await supabase.from('leaderboard_entries').select('id, name, upvotes, downvotes, net_score, hot_score').limit(1);
  if (error) {
    console.log('Columns might not exist yet:', error.message);
  } else {
    console.log('Columns upvotes/net_score/hot_score exist in leaderboard_entries!');
  }
}

runMigration();
