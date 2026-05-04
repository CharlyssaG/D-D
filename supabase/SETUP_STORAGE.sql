-- ============================================
-- STORAGE SETUP: Allow portrait uploads
-- Run in Supabase SQL Editor
-- ============================================

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('character-portraits', 'character-portraits', true),
  ('battle-maps', 'battle-maps', true),
  ('wiki-images', 'wiki-images', true),
  ('tokens', 'tokens', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies (safe to re-run)
DROP POLICY IF EXISTS "Anyone can view portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portraits" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their portraits" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their portraits" ON storage.objects;

-- Allow anyone to VIEW images (they're public)
CREATE POLICY "Anyone can view portraits" ON storage.objects
  FOR SELECT USING (bucket_id IN ('character-portraits', 'battle-maps', 'wiki-images', 'tokens'));

-- Allow authenticated users to UPLOAD
CREATE POLICY "Authenticated users can upload portraits" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('character-portraits', 'battle-maps', 'wiki-images', 'tokens') 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to UPDATE their uploads
CREATE POLICY "Users can update their portraits" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('character-portraits', 'battle-maps', 'wiki-images', 'tokens') 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to DELETE their uploads
CREATE POLICY "Users can delete their portraits" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('character-portraits', 'battle-maps', 'wiki-images', 'tokens') 
    AND auth.role() = 'authenticated'
  );

-- Verify
SELECT id, name, public FROM storage.buckets WHERE id IN ('character-portraits', 'battle-maps', 'wiki-images', 'tokens');
