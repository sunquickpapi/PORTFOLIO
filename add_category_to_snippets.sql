-- Add category column to snippets table
ALTER TABLE snippets 
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'utility';
