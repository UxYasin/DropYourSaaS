-- Migration: Add is_verified, is_dofollow, and verified_at to listings & leaderboard_entries
ALTER TABLE IF EXISTS leaderboard_entries
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_dofollow BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_dofollow BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_is_verified ON leaderboard_entries(is_verified);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_is_dofollow ON leaderboard_entries(is_dofollow);
