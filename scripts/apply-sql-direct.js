import pg from 'pg';
import fs from 'fs';

const sql = `
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  name text,
  title text,
  description text,
  favicon_url text,
  email text,
  submitter_email text,
  category text default 'SaaS',
  for_sale boolean default false,
  bid_cents integer not null default 0,
  clicks integer not null default 0,
  verification_token text,
  is_verified boolean default false,
  status text default 'pending_verification',
  claimed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table leaderboard_entries add column if not exists email text;
alter table leaderboard_entries add column if not exists submitter_email text;
alter table leaderboard_entries add column if not exists category text default 'SaaS';
alter table leaderboard_entries add column if not exists for_sale boolean default false;
alter table leaderboard_entries add column if not exists verification_token text;
alter table leaderboard_entries add column if not exists is_verified boolean default false;
alter table leaderboard_entries add column if not exists status text default 'pending_verification';

create index if not exists idx_leaderboard_entries_verification_token on leaderboard_entries(verification_token);
create index if not exists idx_listings_verification_token on listings(verification_token);
`;

const connectionStrings = [
  'postgresql://postgres.naflsoqdvllbnffghkdv:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZmxzb3FkdmxsYm5mZmdoa2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM5NDI1MSwiZXhwIjoyMTAyOTcwMjUxfQ.aiN-DIx_lMXHQQhSlyP2MS4Doz1XdqBLfrFnIppnAro@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  'postgresql://postgres:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZmxzb3FkdmxsYm5mZmdoa2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM5NDI1MSwiZXhwIjoyMTAyOTcwMjUxfQ.aiN-DIx_lMXHQQhSlyP2MS4Doz1XdqBLfrFnIppnAro@db.naflsoqdvllbnffghkdv.supabase.co:5432/postgres'
];

async function main() {
  for (const conn of connectionStrings) {
    try {
      console.log('Attempting connection to:', conn.split('@')[1]);
      const client = new pg.Client({
        connectionString: conn,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      await client.connect();
      console.log('Connected! Executing DDL SQL migration...');
      await client.query(sql);
      console.log('✅ DDL Migration executed successfully via direct Postgres connection!');
      await client.end();
      process.exit(0);
    } catch (err) {
      console.warn('Connection attempt failed:', err.message);
    }
  }
  process.exit(1);
}

main();
