-- Add challenge and solution to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS challenge TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS solution TEXT;
