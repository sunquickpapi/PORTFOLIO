-- Create project_page_settings table
CREATE TABLE IF NOT EXISTS project_page_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_title TEXT DEFAULT 'Full Portfolio',
    hero_subtitle TEXT DEFAULT 'Complete Project History',
    hero_value_prop TEXT DEFAULT 'A comprehensive showcase of my journey in Intelligent Systems Engineering. From mobile innovations to scalable web solutions—exploring the intersection of AI and precision engineering.',
    projects_completed_count TEXT DEFAULT '3+',
    photography_shoots_count TEXT DEFAULT '900+',
    years_coding_count TEXT DEFAULT '4+',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default settings if not exists
INSERT INTO project_page_settings (id, hero_title, hero_subtitle, hero_value_prop, projects_completed_count, photography_shoots_count, years_coding_count)
SELECT uuid_generate_v4(), 'Full Portfolio', 'Complete Project History', 'A comprehensive showcase of my journey in Intelligent Systems Engineering. From mobile innovations to scalable web solutions—exploring the intersection of AI and precision engineering.', '3+', '900+', '4+'
WHERE NOT EXISTS (SELECT 1 FROM project_page_settings LIMIT 1);
