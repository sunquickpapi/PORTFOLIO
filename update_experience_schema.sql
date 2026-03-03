-- Update Experience Table
ALTER TABLE experience ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE experience ADD COLUMN IF NOT EXISTS company_url TEXT;
ALTER TABLE experience ADD COLUMN IF NOT EXISTS points TEXT; -- Stored as comma-separated string for simplicity
