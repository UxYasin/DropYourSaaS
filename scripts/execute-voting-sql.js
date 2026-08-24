import pg from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
  });
}

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

const ref = 'naflsoqdvllbnffghkdv';
const regions = [
  'us-east-1',
  'us-west-1',
  'eu-central-1',
  'eu-west-1',
  'ap-southeast-1',
  'ap-south-1',
  'sa-east-1',
  'ca-central-1',
];

async function run() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionStrings = [
      `postgresql://postgres.${ref}:${serviceKey}@${host}:6543/postgres`,
      `postgresql://postgres.${ref}:${serviceKey}@${host}:5432/postgres`,
    ];

    for (const conn of connectionStrings) {
      try {
        console.log(`Trying ${host}...`);
        const client = new pg.Client({
          connectionString: conn,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 3000,
        });
        await client.connect();
        console.log(`✅ Connected to ${host}! Executing voting SQL...`);
        await client.query(sql);
        console.log('🎉 VOTING SQL EXECUTED SUCCESSFULLY!');
        await client.end();
        process.exit(0);
      } catch (err) {
        // failed
      }
    }
  }

  console.log('Pooler connection attempts completed.');
}

run();
