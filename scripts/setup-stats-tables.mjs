import pg from 'pg';

const conn = process.env.DATABASE_URL;

async function run() {
  const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const sql = `
    ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS real_clicks INT DEFAULT 0;
    ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS boosted_clicks INT DEFAULT 0;

    CREATE TABLE IF NOT EXISTS site_traffic_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      path TEXT NOT NULL DEFAULT '/',
      referrer TEXT,
      country TEXT,
      browser TEXT,
      device TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS stats_config (
      id TEXT PRIMARY KEY DEFAULT 'global',
      daily_growth_min INT DEFAULT 700,
      daily_growth_max INT DEFAULT 1000,
      is_bot_active BOOLEAN DEFAULT true,
      last_tick_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    INSERT INTO stats_config (id, daily_growth_min, daily_growth_max, is_bot_active)
    VALUES ('global', 700, 1000, true)
    ON CONFLICT (id) DO NOTHING;

    CREATE INDEX IF NOT EXISTS idx_site_traffic_created_at ON site_traffic_events(created_at DESC);
  `;

  await client.query(sql);
  console.log('✅ Stats tables & config created successfully!');
  await client.end();
}

run().catch(console.error);
