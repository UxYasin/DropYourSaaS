-- 1. Ensure columns exist on leaderboard_entries and listings tables
ALTER TABLE IF EXISTS leaderboard_entries 
ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS hot_score FLOAT DEFAULT 0;

ALTER TABLE IF EXISTS listings 
ADD COLUMN IF NOT EXISTS upvotes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS hot_score FLOAT DEFAULT 0;

-- 2. Create vote tracking table supporting anonymous & logged-in users
CREATE TABLE IF NOT EXISTS listing_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  voter_token TEXT NOT NULL,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (listing_id, voter_token)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_listing_votes_token_listing ON listing_votes(voter_token, listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_votes_listing_id ON listing_votes(listing_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_hot_score ON leaderboard_entries(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_net_score ON leaderboard_entries(net_score DESC);

-- 3. Grant RLS permissions for public / anonymous voting
ALTER TABLE listing_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read votes" ON listing_votes;
CREATE POLICY "Allow anonymous read votes" ON listing_votes
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert/update votes" ON listing_votes;
CREATE POLICY "Allow anonymous insert/update votes" ON listing_votes
FOR ALL USING (true) WITH CHECK (true);

-- 4. Recount function & trigger to recalculate net & hot scores on vote
CREATE OR REPLACE FUNCTION update_listing_vote_counts()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
DECLARE
  v_listing_id UUID;
  v_upvotes INT;
  v_downvotes INT;
  v_age_hours FLOAT;
BEGIN
  v_listing_id := COALESCE(NEW.listing_id, OLD.listing_id);

  SELECT 
    COALESCE(COUNT(*) FILTER (WHERE vote_type = 1), 0),
    COALESCE(COUNT(*) FILTER (WHERE vote_type = -1), 0)
  INTO v_upvotes, v_downvotes
  FROM listing_votes
  WHERE listing_id = v_listing_id;

  -- Update leaderboard_entries if exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leaderboard_entries') THEN
    SELECT EXTRACT(EPOCH FROM (now() - COALESCE(claimed_at, created_at, now()))) / 3600.0
    INTO v_age_hours
    FROM leaderboard_entries
    WHERE id = v_listing_id;

    UPDATE leaderboard_entries
    SET 
      upvotes = v_upvotes,
      downvotes = v_downvotes,
      net_score = (v_upvotes - v_downvotes),
      hot_score = (v_upvotes - v_downvotes) / POWER(COALESCE(v_age_hours, 0) + 2, 1.5)
    WHERE id = v_listing_id;
  END IF;

  -- Update listings if exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    SELECT EXTRACT(EPOCH FROM (now() - COALESCE(created_at, now()))) / 3600.0
    INTO v_age_hours
    FROM listings
    WHERE id = v_listing_id;

    UPDATE listings
    SET 
      upvotes = v_upvotes,
      downvotes = v_downvotes,
      net_score = (v_upvotes - v_downvotes),
      hot_score = (v_upvotes - v_downvotes) / POWER(COALESCE(v_age_hours, 0) + 2, 1.5)
    WHERE id = v_listing_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_listing_votes ON listing_votes;
CREATE TRIGGER trg_update_listing_votes
AFTER INSERT OR UPDATE OR DELETE ON listing_votes
FOR EACH ROW EXECUTE FUNCTION update_listing_vote_counts();
