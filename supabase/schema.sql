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
