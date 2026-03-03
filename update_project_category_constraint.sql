-- Update the category check constraint to allow 'Photography'
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;
ALTER TABLE projects ADD CONSTRAINT projects_category_check CHECK (category IN ('Mobile', 'Websites', 'Photography'));
