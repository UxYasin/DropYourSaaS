-- Ensure both possible table targets have rank, target_rank, verification_token columns and claim_listing_spot function
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS rank INT;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS target_rank INT DEFAULT 1;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS verification_token TEXT;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_verification';
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS submitter_email TEXT;
        CREATE INDEX IF NOT EXISTS idx_listings_verification_token ON listings(verification_token);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leaderboard_entries') THEN
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS rank INT;
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS target_rank INT DEFAULT 1;
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS verification_token TEXT;
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_verification';
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS submitter_email TEXT;
        CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_verification_token ON leaderboard_entries(verification_token);
    END IF;
END $$;

-- Function to atomically insert/bump ranks
CREATE OR REPLACE FUNCTION claim_listing_spot(
  target_listing_id UUID,
  target_rank INT
) RETURNS VOID AS $$
BEGIN
  -- 1. Shift all existing published listings at or below target_rank down by 1
  UPDATE leaderboard_entries
  SET rank = COALESCE(rank, 1) + 1
  WHERE is_verified = TRUE
    AND status = 'published'
    AND rank >= target_rank;

  -- 2. Set the verified listing to the claimed rank
  UPDATE leaderboard_entries
  SET rank = target_rank,
      target_rank = target_rank,
      is_verified = TRUE,
      status = 'published',
      claimed_at = NOW()
  WHERE id = target_listing_id;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
    UPDATE listings
    SET rank = COALESCE(rank, 1) + 1
    WHERE is_verified = TRUE
      AND status = 'published'
      AND rank >= target_rank;

    UPDATE listings
    SET rank = target_rank,
        target_rank = target_rank,
        is_verified = TRUE,
        status = 'published',
        claimed_at = NOW()
    WHERE id = target_listing_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
