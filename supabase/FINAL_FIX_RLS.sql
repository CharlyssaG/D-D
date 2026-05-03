-- ============================================
-- FINAL FIX: Zero self-referencing policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Nuke every RLS policy in public schema
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Step 2: Create campaign_members if missing
CREATE TABLE IF NOT EXISTS public.campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_cm_campaign ON public.campaign_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_cm_user ON public.campaign_members(user_id);

-- Step 3: Enable RLS everywhere
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN ALTER TABLE public.wiki_page_versions ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.character_notes ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ============================================
-- Step 4: PROFILES - open read, own write
-- ============================================
CREATE POLICY "p1" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "p2" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "p3" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- Step 5: CAMPAIGN_MEMBERS - the key table
-- NO self-references. Only checks own user_id.
-- ============================================
CREATE POLICY "cm1" ON public.campaign_members FOR SELECT USING (true);
CREATE POLICY "cm2" ON public.campaign_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cm3" ON public.campaign_members FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "cm4" ON public.campaign_members FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- Step 6: CAMPAIGNS - DM owns, members view via campaign_members
-- campaign_members SELECT is now non-recursive (just checks true)
-- so this subquery is safe
-- ============================================
CREATE POLICY "c1" ON public.campaigns FOR SELECT USING (
  dm_id = auth.uid() OR 
  id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
);
CREATE POLICY "c2" ON public.campaigns FOR INSERT WITH CHECK (dm_id = auth.uid());
CREATE POLICY "c3" ON public.campaigns FOR UPDATE USING (dm_id = auth.uid());
CREATE POLICY "c4" ON public.campaigns FOR DELETE USING (dm_id = auth.uid());

-- ============================================
-- Step 7: CHARACTERS - own CRUD, campaign view
-- Only references campaign_members (safe, no recursion)
-- ============================================
CREATE POLICY "ch1" ON public.characters FOR SELECT USING (
  user_id = auth.uid() OR
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
);
CREATE POLICY "ch2" ON public.characters FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ch3" ON public.characters FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "ch4" ON public.characters FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- Step 8: NPCS - campaign members view, DM manages
-- ============================================
CREATE POLICY "n1" ON public.npcs FOR SELECT USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
);
CREATE POLICY "n2" ON public.npcs FOR INSERT WITH CHECK (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);
CREATE POLICY "n3" ON public.npcs FOR UPDATE USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);
CREATE POLICY "n4" ON public.npcs FOR DELETE USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);

-- ============================================
-- Step 9: COMBAT SESSIONS
-- ============================================
CREATE POLICY "cs1" ON public.combat_sessions FOR SELECT USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
);
CREATE POLICY "cs2" ON public.combat_sessions FOR INSERT WITH CHECK (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);
CREATE POLICY "cs3" ON public.combat_sessions FOR UPDATE USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);

-- ============================================
-- Step 10: BATTLE MAPS
-- ============================================
CREATE POLICY "bm1" ON public.battle_maps FOR SELECT USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
);
CREATE POLICY "bm2" ON public.battle_maps FOR INSERT WITH CHECK (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);
CREATE POLICY "bm3" ON public.battle_maps FOR UPDATE USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);

-- ============================================
-- Step 11: WIKI PAGES
-- ============================================
CREATE POLICY "w1" ON public.wiki_pages FOR SELECT USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
);
CREATE POLICY "w2" ON public.wiki_pages FOR INSERT WITH CHECK (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
);
CREATE POLICY "w3" ON public.wiki_pages FOR UPDATE USING (created_by = auth.uid());

-- ============================================
-- Step 12: Realtime
-- ============================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_members;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Step 13: VERIFY - these will fail if recursion exists
-- ============================================
SELECT 'campaigns OK', COUNT(*) FROM public.campaigns;
SELECT 'characters OK', COUNT(*) FROM public.characters;
SELECT 'campaign_members OK', COUNT(*) FROM public.campaign_members;
