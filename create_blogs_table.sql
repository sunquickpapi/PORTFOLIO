-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date TEXT NOT NULL, -- Stored as text to match user-provided format if desired (e.g. "Jan 22nd, 2026")
    header_image_url TEXT,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    tags TEXT, -- Comma separated tags
    read_minute INTEGER DEFAULT 0,
    content TEXT, -- Full blog post details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read (Drop if exists first to avoid errors)
DROP POLICY IF EXISTS "Allow public read-only access for blogs" ON blogs;
DROP POLICY IF EXISTS "Allow full access for authenticated admins on blogs" ON blogs;
DROP POLICY IF EXISTS "Allow full access for anon on blogs" ON blogs;

CREATE POLICY "Allow full access for anon on blogs"
ON blogs FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
