-- Enable Row Level Security (RLS) on public tables to resolve Supabase security lint warnings

-- 1. listings
ALTER TABLE IF EXISTS public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on listings" ON public.listings;
CREATE POLICY "Allow public read access on listings"
ON public.listings
FOR SELECT
TO public
USING (true);

-- 2. site_traffic_events
ALTER TABLE IF EXISTS public.site_traffic_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert for traffic events" ON public.site_traffic_events;
CREATE POLICY "Allow anonymous insert for traffic events"
ON public.site_traffic_events
FOR INSERT
TO public
WITH CHECK (true);

-- 3. stats_config
ALTER TABLE IF EXISTS public.stats_config ENABLE ROW LEVEL SECURITY;
-- No public policies created for stats_config so public/anon cannot read or modify it.
-- Trusted server-side connections (service_role key or direct Postgres) have full access.
