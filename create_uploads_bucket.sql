-- Public storage bucket for admin uploads (images, videos, PDFs, playground HTML)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Anyone can read
CREATE POLICY "Public read uploads" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads');

-- Only needed if SUPABASE_SERVICE_ROLE_KEY is NOT set (upload falls back to anon key).
-- The /api/upload route already checks the admin session before uploading.
CREATE POLICY "Anon insert uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'uploads');
