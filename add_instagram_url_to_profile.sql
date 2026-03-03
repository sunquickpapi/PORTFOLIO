-- Add instagram_url to profile table
ALTER TABLE profile ADD COLUMN IF NOT EXISTS instagram_url TEXT;
