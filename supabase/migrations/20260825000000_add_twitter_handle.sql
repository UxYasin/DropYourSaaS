-- Migration: Add twitter_handle column to listings and leaderboard_entries
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS twitter_handle TEXT;

ALTER TABLE leaderboard_entries 
ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
