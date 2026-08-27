-- Migration: Support Pay-to-High-Rank and Atomic Rank Displacement for Whop Payments

CREATE OR REPLACE FUNCTION claim_paid_rank(
  p_listing_id TEXT,
  p_target_rank INT,
  p_amount NUMERIC,
  p_name TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_twitter_handle TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uuid UUID;
  v_amount_cents INT;
  v_rank INT;
  v_target_url TEXT;
BEGIN
  v_amount_cents := ROUND(COALESCE(p_amount, 0) * 100);
  v_rank := GREATEST(1, COALESCE(p_target_rank, 1));
  v_target_url := COALESCE(p_url, p_listing_id);

  -- 1. Try casting p_listing_id to UUID
  BEGIN
    v_uuid := p_listing_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_uuid := NULL;
  END;

  -- 2. Shift all existing listings at or below target rank down by 1
  -- Exclude the current listing being updated
  UPDATE leaderboard_entries
  SET 
    rank = rank + 1,
    target_rank = COALESCE(target_rank, rank) + 1
  WHERE 
    rank >= v_rank
    AND (v_uuid IS NULL OR id != v_uuid)
    AND (url NOT ILIKE '%' || v_target_url || '%');

  -- 3. Upsert / update the paid entry into leaderboard_entries
  UPDATE leaderboard_entries
  SET
    rank = v_rank,
    target_rank = v_rank,
    bid_cents = GREATEST(COALESCE(bid_cents, 0), v_amount_cents),
    is_verified = true,
    is_dofollow = true,
    status = 'published',
    name = COALESCE(p_name, name),
    twitter_handle = COALESCE(p_twitter_handle, twitter_handle),
    verified_at = now(),
    claimed_at = now()
  WHERE
    (v_uuid IS NOT NULL AND id = v_uuid)
    OR url ILIKE '%' || v_target_url || '%'
    OR name ILIKE p_listing_id;

  -- If not updated and URL is provided, insert a new record
  IF NOT FOUND AND v_target_url IS NOT NULL AND v_target_url != '' THEN
    INSERT INTO leaderboard_entries (
      url,
      name,
      rank,
      target_rank,
      bid_cents,
      is_verified,
      is_dofollow,
      status,
      twitter_handle,
      verified_at,
      claimed_at
    ) VALUES (
      v_target_url,
      COALESCE(p_name, v_target_url),
      v_rank,
      v_rank,
      v_amount_cents,
      true,
      true,
      'published',
      p_twitter_handle,
      now(),
      now()
    )
    ON CONFLICT (url) DO UPDATE
    SET
      rank = v_rank,
      target_rank = v_rank,
      bid_cents = GREATEST(leaderboard_entries.bid_cents, v_amount_cents),
      is_verified = true,
      is_dofollow = true,
      status = 'published',
      name = COALESCE(p_name, leaderboard_entries.name),
      twitter_handle = COALESCE(p_twitter_handle, leaderboard_entries.twitter_handle),
      verified_at = now(),
      claimed_at = now();
  END IF;

  -- 4. Sync with listings table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    BEGIN
      EXECUTE '
        UPDATE listings
        SET 
          rank = $1,
          bid = GREATEST(COALESCE(bid, 0), $2),
          is_verified = true,
          is_dofollow = true,
          status = ''published'',
          verified_at = now(),
          updated_at = now()
        WHERE 
          ($3 IS NOT NULL AND id = $3)
          OR url ILIKE ''%'' || $4 || ''%'''
      USING v_rank, p_amount, v_uuid, v_target_url;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore if listings table structure differs
    END;
  END IF;

END;
$$;
