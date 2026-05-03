-- ============================================
-- FIX: Auto-create profile when user signs up
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create a function that auto-creates a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a trigger on auth.users that fires on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Backfill profiles for any existing users that are missing
INSERT INTO public.profiles (id, display_name)
SELECT id, COALESCE(raw_user_meta_data->>'display_name', email)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify
SELECT 'Users without profiles:', COUNT(*) 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);
