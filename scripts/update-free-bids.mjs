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

const ref = 'naflsoqdvllbnffghkdv';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

const sql = `
  ALTER TABLE leaderboard_entries DROP CONSTRAINT IF EXISTS leaderboard_entries_bid_cents_check;
  ALTER TABLE leaderboard_entries ADD CONSTRAINT leaderboard_entries_bid_cents_check CHECK (bid_cents >= 0);
  UPDATE leaderboard_entries SET bid_cents = 0;
`;

async function run() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionStrings = [
      `postgresql://postgres.${ref}:${serviceKey}@${host}:6543/postgres`,
      `postgresql://postgres.${ref}:${serviceKey}@${host}:5432/postgres`,
    ];

    for (const conn of connectionStrings) {
      try {
        console.log(`Connecting to ${host}...`);
        const client = new pg.Client({
          connectionString: conn,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 3000,
        });
        await client.connect();
        console.log(`✅ Connected to ${host}! Updating table constraint and setting bid_cents = 0...`);
        await client.query(sql);
        console.log('🎉 Successfully dropped constraint and updated all entries to bid_cents = 0!');
        await client.end();
        process.exit(0);
      } catch (err) {
        // try next
      }
    }
  }
}

run();
