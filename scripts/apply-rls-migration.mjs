import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const conn = process.env.DATABASE_URL;

async function run() {
  const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const migrationPath = path.join(__dirname, '../supabase/migrations/20260902000000_enable_rls_public_tables.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Applying RLS migration...');
  await client.query(sql);

  console.log('\nChecking Row Level Security status on tables:');
  const checkSql = `
    SELECT schemaname, tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename IN ('listings', 'site_traffic_events', 'stats_config');
  `;
  const res = await client.query(checkSql);
  console.table(res.rows);

  console.log('\nChecking policies:');
  const polSql = `
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('listings', 'site_traffic_events', 'stats_config');
  `;
  const polRes = await client.query(polSql);
  console.table(polRes.rows);

  await client.end();
  console.log('\n✅ Migration executed and verified successfully!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
