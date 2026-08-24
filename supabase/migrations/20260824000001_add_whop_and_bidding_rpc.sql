-- Migration for Whop Bidding & Pinned Ads RPC
CREATE OR REPLACE FUNCTION increment_listing_bid(
  p_listing_id TEXT,
  p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uuid UUID;
  v_amount_cents INT;
BEGIN
  v_amount_cents := ROUND(p_amount * 100);

  -- Try casting to UUID if possible
  BEGIN
    v_uuid := p_listing_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_uuid := NULL;
  END;

  -- 1. Update leaderboard_entries if matching by UUID or URL or name
  UPDATE leaderboard_entries
  SET 
    bid_cents = COALESCE(bid_cents, 0) + v_amount_cents,
    claimed_at = now()
  WHERE 
    (v_uuid IS NOT NULL AND id = v_uuid)
    OR url ILIKE '%' || p_listing_id || '%'
    OR name ILIKE p_listing_id;

  -- 2. Update listings table if exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    EXECUTE '
      UPDATE listings
      SET 
        bid = COALESCE(bid, 0) + $1,
        updated_at = now()
      WHERE 
        ($2 IS NOT NULL AND id = $2)
        OR url ILIKE ''%'' || $3 || ''%''
        OR title ILIKE $3'
    USING p_amount, v_uuid, p_listing_id;
  END IF;
END;
$$;
