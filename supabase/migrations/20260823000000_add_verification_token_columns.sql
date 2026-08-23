-- Ensure both possible table targets have the required columns and uuid index
DO $$ 
BEGIN
    -- Check if listings table exists and add columns
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS verification_token TEXT;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_verification';
        ALTER TABLE listings ADD COLUMN IF NOT EXISTS submitter_email TEXT;
        CREATE INDEX IF NOT EXISTS idx_listings_verification_token ON listings(verification_token);
    END IF;

    -- Check if leaderboard_entries table exists and add columns
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leaderboard_entries') THEN
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS verification_token TEXT;
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_verification';
        ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS submitter_email TEXT;
        CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_verification_token ON leaderboard_entries(verification_token);
    END IF;
END $$;
