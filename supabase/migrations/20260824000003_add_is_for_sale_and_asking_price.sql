-- Migration: Add is_for_sale, is_verified, and asking_price columns to listings and leaderboard_entries
ALTER TABLE IF EXISTS listings 
ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS asking_price NUMERIC DEFAULT 0;

ALTER TABLE IF EXISTS leaderboard_entries 
ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS asking_price NUMERIC DEFAULT 0;
