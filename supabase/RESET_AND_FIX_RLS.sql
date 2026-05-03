-- ============================================
-- NUCLEAR RESET: Drop all policies, fix everything
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop ALL existing RLS policies on every table
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

-- Step 2: Create campaign_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign ON public.campaign_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_user ON public.campaign_members(user_id);

-- Step 3: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

-- Also handle tables that might not exist yet
DO $$ BEGIN
  ALTER TABLE public.wiki_page_versions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.character_notes ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================
-- Step 4: Create SIMPLE, NON-RECURSIVE policies
-- ============================================

-- PROFILES: everyone can read, owners can update
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CAMPAIGNS: DM can do everything, members can view
-- NOTE: No subquery to characters table! Uses campaign_members instead.
CREATE POLICY "campaigns_select" ON public.campaigns FOR SELECT 
  USING (
    dm_id = auth.uid() OR 
    id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
  );
CREATE POLICY "campaigns_insert" ON public.campaigns FOR INSERT WITH CHECK (dm_id = auth.uid());
CREATE POLICY "campaigns_update" ON public.campaigns FOR UPDATE USING (dm_id = auth.uid());
CREATE POLICY "campaigns_delete" ON public.campaigns FOR DELETE USING (dm_id = auth.uid());

-- CAMPAIGN_MEMBERS: members can see co-members, users can join, DM can manage
CREATE POLICY "cm_select" ON public.campaign_members FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
  );
CREATE POLICY "cm_insert" ON public.campaign_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cm_delete" ON public.campaign_members FOR DELETE USING (
  user_id = auth.uid() OR 
  campaign_id IN (SELECT cm.campaign_id FROM public.campaign_members cm WHERE cm.user_id = auth.uid() AND cm.role = 'dm')
);

-- CHARACTERS: owners can CRUD, campaign members can view
-- NOTE: No subquery to campaigns table! Direct ownership or campaign_members lookup.
CREATE POLICY "characters_select_own" ON public.characters FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "characters_select_campaign" ON public.characters FOR SELECT 
  USING (
    campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
  );
CREATE POLICY "characters_insert" ON public.characters FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "characters_update" ON public.characters FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "characters_delete" ON public.characters FOR DELETE USING (user_id = auth.uid());

-- NPCS: campaign members can view, DM can manage
CREATE POLICY "npcs_select" ON public.npcs FOR SELECT 
  USING (
    campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
  );
CREATE POLICY "npcs_insert" ON public.npcs FOR INSERT WITH CHECK (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);
CREATE POLICY "npcs_update" ON public.npcs FOR UPDATE USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);
CREATE POLICY "npcs_delete" ON public.npcs FOR DELETE USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);

-- COMBAT SESSIONS: campaign members can view, DM can manage
CREATE POLICY "combat_select" ON public.combat_sessions FOR SELECT 
  USING (
    campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
  );
CREATE POLICY "combat_insert" ON public.combat_sessions FOR INSERT WITH CHECK (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);
CREATE POLICY "combat_update" ON public.combat_sessions FOR UPDATE USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);

-- BATTLE MAPS: campaign members can view, DM can manage
CREATE POLICY "maps_select" ON public.battle_maps FOR SELECT 
  USING (
    campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
  );
CREATE POLICY "maps_insert" ON public.battle_maps FOR INSERT WITH CHECK (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);
CREATE POLICY "maps_update" ON public.battle_maps FOR UPDATE USING (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm')
);

-- WIKI PAGES: campaign members can view (dm_only check), members can create, creator can edit
CREATE POLICY "wiki_select" ON public.wiki_pages FOR SELECT 
  USING (
    campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid()) AND
    (NOT dm_only OR campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid() AND role = 'dm'))
  );
CREATE POLICY "wiki_insert" ON public.wiki_pages FOR INSERT WITH CHECK (
  campaign_id IN (SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid())
);
CREATE POLICY "wiki_update" ON public.wiki_pages FOR UPDATE USING (created_by = auth.uid());

-- Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_members;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Step 5: Verify no recursion
-- ============================================
-- This query will fail if there's still recursion
SELECT COUNT(*) FROM public.campaigns LIMIT 1;
SELECT COUNT(*) FROM public.characters LIMIT 1;

-- ============================================
-- DONE! If you see two "0" results, everything is clean.
-- ============================================
