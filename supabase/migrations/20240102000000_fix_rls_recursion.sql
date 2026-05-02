-- Fix: Remove recursive RLS policies that cause "infinite recursion" error
-- The problem: campaigns SELECT policy checks characters table, 
-- characters SELECT policy checks campaigns table = infinite loop

-- Add a campaign_members table to break the recursion
CREATE TABLE IF NOT EXISTS public.campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player', -- 'dm' or 'player'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_campaign_members_campaign ON public.campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON public.campaign_members(user_id);

-- Enable RLS on campaign_members
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their memberships" ON public.campaign_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Members can view co-members" ON public.campaign_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.campaign_members cm WHERE cm.campaign_id = campaign_members.campaign_id AND cm.user_id = auth.uid()));
CREATE POLICY "DM can manage members" ON public.campaign_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.campaign_members cm WHERE cm.campaign_id = campaign_members.campaign_id AND cm.user_id = auth.uid() AND cm.role = 'dm')
);
CREATE POLICY "Users can join campaigns" ON public.campaign_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- Drop old recursive policies
DROP POLICY IF EXISTS "Campaign members can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "DM can update their campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "DM can create campaigns" ON public.campaigns;

DROP POLICY IF EXISTS "Campaign members can view characters" ON public.characters;
DROP POLICY IF EXISTS "Users can update own characters" ON public.characters;
DROP POLICY IF EXISTS "Users can create characters" ON public.characters;
DROP POLICY IF EXISTS "Users can delete own characters" ON public.characters;

DROP POLICY IF EXISTS "Campaign members can view NPCs" ON public.npcs;
DROP POLICY IF EXISTS "DM can manage NPCs" ON public.npcs;

DROP POLICY IF EXISTS "Campaign members can view combat" ON public.combat_sessions;
DROP POLICY IF EXISTS "DM can manage combat" ON public.combat_sessions;

DROP POLICY IF EXISTS "Campaign members can view maps" ON public.battle_maps;
DROP POLICY IF EXISTS "DM can manage maps" ON public.battle_maps;

DROP POLICY IF EXISTS "Campaign members can view wiki pages" ON public.wiki_pages;
DROP POLICY IF EXISTS "Campaign members can create wiki pages" ON public.wiki_pages;
DROP POLICY IF EXISTS "Users can update wiki pages they created" ON public.wiki_pages;

-- Recreate campaigns policies (no recursion - uses campaign_members instead)
CREATE POLICY "Anyone can view campaigns they belong to" ON public.campaigns FOR SELECT 
  USING (
    dm_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = campaigns.id AND user_id = auth.uid())
  );
CREATE POLICY "DM can update campaigns" ON public.campaigns FOR UPDATE USING (dm_id = auth.uid());
CREATE POLICY "Anyone can create campaigns" ON public.campaigns FOR INSERT WITH CHECK (dm_id = auth.uid());

-- Recreate characters policies (no recursion - uses simple ownership check)
CREATE POLICY "Owners can view their characters" ON public.characters FOR SELECT 
  USING (user_id = auth.uid());
CREATE POLICY "DM can view campaign characters" ON public.characters FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = characters.campaign_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update own characters" ON public.characters FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can create characters" ON public.characters FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own characters" ON public.characters FOR DELETE USING (user_id = auth.uid());

-- Recreate NPCs policies
CREATE POLICY "Campaign members can view NPCs" ON public.npcs FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = npcs.campaign_id AND user_id = auth.uid())
  );
CREATE POLICY "DM can manage NPCs" ON public.npcs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = npcs.campaign_id AND user_id = auth.uid() AND role = 'dm')
);

-- Recreate combat session policies
CREATE POLICY "Campaign members can view combat" ON public.combat_sessions FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = combat_sessions.campaign_id AND user_id = auth.uid())
  );
CREATE POLICY "DM can manage combat" ON public.combat_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = combat_sessions.campaign_id AND user_id = auth.uid() AND role = 'dm')
);

-- Recreate battle map policies
CREATE POLICY "Campaign members can view maps" ON public.battle_maps FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = battle_maps.campaign_id AND user_id = auth.uid())
  );
CREATE POLICY "DM can manage maps" ON public.battle_maps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = battle_maps.campaign_id AND user_id = auth.uid() AND role = 'dm')
);

-- Recreate wiki policies
CREATE POLICY "Campaign members can view wiki pages" ON public.wiki_pages FOR SELECT 
  USING (
    (NOT dm_only OR EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = wiki_pages.campaign_id AND user_id = auth.uid() AND role = 'dm')) AND
    EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = wiki_pages.campaign_id AND user_id = auth.uid())
  );
CREATE POLICY "Campaign members can create wiki pages" ON public.wiki_pages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.campaign_members WHERE campaign_id = wiki_pages.campaign_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update wiki pages they created" ON public.wiki_pages FOR UPDATE USING (created_by = auth.uid());

-- Add campaign_members to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_members;
