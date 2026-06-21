-- Create snippets_page_settings table
CREATE TABLE IF NOT EXISTS snippets_page_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_title TEXT DEFAULT 'Snippet Gallery',
    hero_subtitle TEXT DEFAULT 'Curated Reusable Code Gallery',
    hero_value_prop TEXT DEFAULT 'A comprehensive vault of reusable code fragments and helper utilities built to optimize workflow efficiency, speed up development, and maintain high standards of code quality.',
    hero_image_url TEXT DEFAULT '/assets/projectHeader.jpg',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE snippets_page_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for full access
DROP POLICY IF EXISTS "Allow full access for anon on snippets_page_settings" ON snippets_page_settings;

CREATE POLICY "Allow full access for anon on snippets_page_settings"
ON snippets_page_settings FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Insert default settings if not exists
INSERT INTO snippets_page_settings (id, hero_title, hero_subtitle, hero_value_prop, hero_image_url)
SELECT uuid_generate_v4(), 'Snippet Gallery', 'Curated Reusable Code Gallery', 'A comprehensive vault of reusable code fragments and helper utilities built to optimize workflow efficiency, speed up development, and maintain high standards of code quality.', '/assets/projectHeader.jpg'
WHERE NOT EXISTS (SELECT 1 FROM snippets_page_settings LIMIT 1);
