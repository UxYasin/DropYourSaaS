-- Run this once against your Supabase project (SQL Editor or `supabase db push`).

create extension if not exists "pgcrypto";

create table if not exists leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  name text not null,
  email text,
  submitter_email text,
  category text default 'SaaS',
  for_sale boolean default false,
  is_for_sale boolean default false,
  asking_price numeric default 0,
  mrr numeric default 0,
  ttm_revenue numeric default 0,
  last_30_days_revenue numeric default 0,
  active_subscriptions integer default 0,
  founder_name text,
  founded_year text,
  location_country text,
  value_proposition text,
  problem_solved text,
  audience text,
  pricing_model text,
  team_size text,
  funding_status text,
  tech_stack text,
  marketing_channels text,
  additional_info text,
  bid_cents integer not null default 0,
  clicks integer not null default 0,
  verification_token text,
  is_verified boolean default false,
  status text default 'pending_verification',
  claimed_at timestamptz not null default now()
);

create index if not exists leaderboard_entries_bid_cents_idx
  on leaderboard_entries (bid_cents desc);

create index if not exists idx_leaderboard_entries_verification_token
  on leaderboard_entries (verification_token);

create table if not exists bids (
  id uuid primary key default gen_random_uuid(),
  entry_url text not null,
  entry_name text not null,
  amount_cents integer not null check (amount_cents > 0),
  polar_checkout_id text not null unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists bids_entry_url_idx on bids (entry_url);

-- All reads/writes go through server-only route handlers using the service
-- role key, so no public RLS policies are required. If you later add
-- client-side reads with the anon key, enable RLS and add a public
-- select policy on leaderboard_entries.
alter table leaderboard_entries enable row level security;
alter table bids enable row level security;

create or replace function increment_clicks(entry_url text)
returns void as $$
begin
  update leaderboard_entries
  set clicks = clicks + 1
  where url = entry_url;
end;
$$ language plpgsql;

-- ======================================================
-- VOTING SYSTEM & HOT/DECAY SCORE ENGINE MIGRATION
-- ======================================================

-- 1. Add score columns to leaderboard_entries and listings tables
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

-- 2. Create vote tracking table supporting anonymous & logged-in users
CREATE TABLE IF NOT EXISTS listing_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES leaderboard_entries(id) ON DELETE CASCADE,
  voter_token TEXT NOT NULL,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (listing_id, voter_token)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_listing_votes_token_listing ON listing_votes(voter_token, listing_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_hot_score ON leaderboard_entries(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_net_score ON leaderboard_entries(net_score DESC);

-- 3. Trigger/Function to automatically recalculate net & hot scores on vote
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

-- 4. Create ad_requests table for Pin Ad monetization with slot_position
CREATE TABLE IF NOT EXISTS ad_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url TEXT NOT NULL,
  project_name TEXT NOT NULL,
  one_liner TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  slot_position TEXT DEFAULT 'left_1',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'active', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure slot_position column exists if table was created previously
ALTER TABLE ad_requests ADD COLUMN IF NOT EXISTS slot_position TEXT DEFAULT 'left_1';

-- 5. Table for currently active pinned ads overriding rail slots
CREATE TABLE IF NOT EXISTS pinned_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url TEXT NOT NULL,
  project_name TEXT NOT NULL,
  one_liner TEXT NOT NULL,
  logo_url TEXT,
  slot_position TEXT UNIQUE NOT NULL, -- 'left_1' .. 'left_5', 'right_1' .. 'right_5'
  contact_email TEXT,
  duration_days INT DEFAULT 30,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pinned_ads_active ON pinned_ads(slot_position, is_active);



