-- Add integration code columns to snippets table
ALTER TABLE snippets ADD COLUMN IF NOT EXISTS integration_vanilla TEXT;
ALTER TABLE snippets ADD COLUMN IF NOT EXISTS integration_react TEXT;
