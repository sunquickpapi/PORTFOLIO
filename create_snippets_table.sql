-- Create snippets table
CREATE TABLE IF NOT EXISTS snippets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language TEXT NOT NULL, -- e.g., 'javascript', 'python', 'css', 'typescript'
    category TEXT NOT NULL DEFAULT 'utility', -- e.g., 'utility', 'hook', 'animation', 'helper'
    tags TEXT, -- Comma separated tags
    preview_image_url TEXT, -- URL or path for outcome visual preview image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Create policy for full access (Drop if exists first to avoid errors)
DROP POLICY IF EXISTS "Allow full access for anon on snippets" ON snippets;

CREATE POLICY "Allow full access for anon on snippets"
ON snippets FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
