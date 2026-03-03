-- Add category to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('Mobile', 'Websites'));
