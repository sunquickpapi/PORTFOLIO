-- Profile Table
CREATE TABLE IF NOT EXISTS profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    tagline TEXT,
    location TEXT,
    email TEXT,
    phone TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    resume_url TEXT,
    logo_url TEXT,
    hero_bg_url TEXT,
    tech_learned_count INTEGER DEFAULT 0,
    dumbells_lifted_count INTEGER DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    experience_years INTEGER DEFAULT 0,
    coffee_consumed INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    issuer TEXT,
    date TEXT,
    credential_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Hobbies Table
CREATE TABLE IF NOT EXISTS hobbies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon_name TEXT, -- Lucide icon name
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    image_url TEXT,
    preview_images TEXT[], -- Array of image URLs
    tech_stack TEXT[], -- Array of strings
    live_demo_url TEXT,
    repo_url TEXT,
    app_store_url TEXT,
    slug TEXT UNIQUE,
    category TEXT,
    challenge TEXT,
    solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Experience Table
CREATE TABLE IF NOT EXISTS experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    duration TEXT,
    description TEXT,
    logo_url TEXT,
    company_url TEXT,
    points TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Education Table
CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    years TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL, -- e.g., 'Development', 'Design'
    name TEXT NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote TEXT NOT NULL,
    feedback TEXT,
    author TEXT NOT NULL,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert initial profile data
-- INSERT INTO profile (name, role, tagline, bio, location, email, phone) 
-- VALUES ('Muhammad Naufal', 'Intelligent System Engineer', 'Crafting smart solutions that blend engineering precision with AI.', '...', 'Ayer Keroh, Melaka, Malaysia', 'naufalnizam25@gmail.com', '+6019-7952427');
