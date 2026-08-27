import pg from 'pg';

const conn = 'postgresql://postgres.naflsoqdvllbnffghkdv:jhLON3g6mAQxpvx5@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function run() {
  const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL in ap-northeast-2!');

  const sql = `
    ALTER TABLE leaderboard_entries DROP CONSTRAINT IF EXISTS leaderboard_entries_bid_cents_check;
    ALTER TABLE leaderboard_entries ADD CONSTRAINT leaderboard_entries_bid_cents_check CHECK (bid_cents >= 0);
    UPDATE leaderboard_entries SET bid_cents = 0;
  `;

  await client.query(sql);
  console.log('🎉 Successfully dropped constraint and updated all entries to bid_cents = 0!');

  const res = await client.query('SELECT name, bid_cents, rank FROM leaderboard_entries');
  console.log('Updated rows count:', res.rows.length);
  res.rows.forEach(r => console.log(r.name, '-> bid_cents:', r.bid_cents));

  await client.end();
}

run().catch(console.error);
