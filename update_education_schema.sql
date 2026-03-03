-- Update Education Table
ALTER TABLE education ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE education ADD COLUMN IF NOT EXISTS coursework TEXT;

-- Create Education Activities Table
CREATE TABLE IF NOT EXISTS education_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    education_id UUID REFERENCES education(id) ON DELETE CASCADE,
    section_name TEXT NOT NULL, -- e.g., 'Competitions Involvement', 'Volunteers'
    title TEXT NOT NULL,
    tags TEXT, -- Comma separated tags or single tag as per screenshot
    date TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for the new table (assuming standard policy)
ALTER TABLE education_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on education_activities" ON education_activities;
CREATE POLICY "Allow public read access on education_activities" ON education_activities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access on education_activities" ON education_activities;
CREATE POLICY "Allow authenticated full access on education_activities" ON education_activities
    FOR ALL USING (auth.role() = 'authenticated');

-- Disable RLS for education_activities (matching other tables in project)
ALTER TABLE education_activities DISABLE ROW LEVEL SECURITY;
