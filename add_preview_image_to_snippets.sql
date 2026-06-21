-- Add preview_image_url column to snippets table
ALTER TABLE snippets 
ADD COLUMN IF NOT EXISTS preview_image_url TEXT;
