-- Add playground_url column to snippets table
ALTER TABLE snippets 
ADD COLUMN IF NOT EXISTS playground_url TEXT;
