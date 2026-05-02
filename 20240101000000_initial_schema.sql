-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  world_map_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  race TEXT,
  class TEXT,
  level INTEGER DEFAULT 1,
  background TEXT,
  alignment TEXT,
  
  -- Appearance
  portrait_url TEXT,
  token_url TEXT,
  
  -- Core stats
  ability_scores JSONB DEFAULT '{"str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10}'::jsonb,
  proficiency_bonus INTEGER DEFAULT 2,
  
  -- Combat stats
  hp_max INTEGER DEFAULT 10,
  hp_current INTEGER DEFAULT 10,
  hp_temp INTEGER DEFAULT 0,
  ac INTEGER DEFAULT 10,
  initiative_bonus INTEGER DEFAULT 0,
  speed INTEGER DEFAULT 30,
  
  -- Skills (proficient, expertise, bonus)
  skills JSONB DEFAULT '{}'::jsonb,
  
  -- Saves
  saving_throws JSONB DEFAULT '{"str": false, "dex": false, "con": false, "int": false, "wis": false, "cha": false}'::jsonb,
  
  -- Features & traits
  features JSONB DEFAULT '[]'::jsonb,
  feats JSONB DEFAULT '[]'::jsonb,
  
  -- Equipment
  inventory JSONB DEFAULT '[]'::jsonb,
  equipment JSONB DEFAULT '{}'::jsonb,
  
  -- Spellcasting
  spellcasting_ability TEXT,
  spell_slots JSONB DEFAULT '{}'::jsonb,
  spells_known JSONB DEFAULT '[]'::jsonb,
  spells_prepared JSONB DEFAULT '[]'::jsonb,
  
  -- Conditions & effects
  conditions JSONB DEFAULT '[]'::jsonb,
  
  -- Death saves
  death_saves JSONB DEFAULT '{"successes": 0, "failures": 0}'::jsonb,
  
  -- Notes
  backstory TEXT,
  personality TEXT,
  ideals TEXT,
  bonds TEXT,
  flaws TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPCs
CREATE TABLE public.npcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  
  name TEXT NOT NULL,
  type TEXT, -- humanoid, beast, monster, etc.
  portrait_url TEXT,
  token_url TEXT,
  
  -- Stats (simplified for quick NPCs)
  hp_max INTEGER DEFAULT 10,
  ac INTEGER DEFAULT 10,
  speed INTEGER DEFAULT 30,
  
  -- Full stat block (optional, for complex NPCs)
  stat_block JSONB,
  
  -- Lore
  description TEXT,
  location TEXT,
  faction TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Combat sessions
CREATE TABLE public.combat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  active BOOLEAN DEFAULT true,
  round_number INTEGER DEFAULT 1,
  current_turn_index INTEGER DEFAULT 0,
  
  -- Initiative order: [{entity_id, entity_type, initiative, hp_current, hp_max, conditions}]
  initiative_order JSONB DEFAULT '[]'::jsonb,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Battle maps
CREATE TABLE public.battle_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  combat_session_id UUID REFERENCES public.combat_sessions(id) ON DELETE CASCADE,
  
  name TEXT,
  image_url TEXT NOT NULL,
  grid_size INTEGER DEFAULT 5, -- feet per square
  width_squares INTEGER,
  height_squares INTEGER,
  
  -- Token positions: {character_id: {x, y, rotation}, npc_id: {x, y}}
  token_positions JSONB DEFAULT '{}'::jsonb,
  
  -- Fog of war: array of revealed coordinate ranges
  fog_of_war JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wiki pages
CREATE TABLE public.wiki_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT, -- location, npc, faction, item, lore, session-recap
  
  -- Rich content (TipTap JSON or markdown)
  content JSONB,
  
  -- Images
  cover_image_url TEXT,
  image_urls TEXT[],
  
  -- Metadata
  tags TEXT[],
  dm_only BOOLEAN DEFAULT false,
  
  -- Relations
  linked_character_ids UUID[],
  linked_npc_ids UUID[],
  linked_location_ids UUID[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, slug)
);

-- Wiki page versions (for history/rollback)
CREATE TABLE public.wiki_page_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wiki_page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  
  content_snapshot JSONB NOT NULL,
  change_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character notes (private to player)
CREATE TABLE public.character_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
  
  category TEXT, -- backstory, secrets, goals, relationships
  content TEXT NOT NULL,
  
  shared_with_dm BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session logs (auto-generated summaries)
CREATE TABLE public.session_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  session_number INTEGER,
  
  date DATE NOT NULL,
  players_present UUID[],
  
  -- Auto-populated data
  combat_encounters JSONB DEFAULT '[]'::jsonb,
  xp_gained INTEGER DEFAULT 0,
  loot_acquired JSONB DEFAULT '[]'::jsonb,
  
  -- Player-contributed narrative
  highlights JSONB DEFAULT '[]'::jsonb,
  
  -- Links to wiki pages created this session
  wiki_pages_created UUID[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage buckets setup
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('character-portraits', 'character-portraits', true),
  ('battle-maps', 'battle-maps', true),
  ('wiki-images', 'wiki-images', true),
  ('tokens', 'tokens', true)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security Policies

-- Profiles: public read, own write
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Campaigns: readable by members, writable by DM
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign members can view campaigns" ON public.campaigns FOR SELECT 
  USING (
    dm_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.characters WHERE campaign_id = campaigns.id AND user_id = auth.uid())
  );
CREATE POLICY "DM can update their campaigns" ON public.campaigns FOR UPDATE USING (dm_id = auth.uid());
CREATE POLICY "DM can create campaigns" ON public.campaigns FOR INSERT WITH CHECK (dm_id = auth.uid());

-- Characters: owner can CRUD, campaign members can read
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign members can view characters" ON public.characters FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = characters.campaign_id AND dm_id = auth.uid())
  );
CREATE POLICY "Users can update own characters" ON public.characters FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can create characters" ON public.characters FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own characters" ON public.characters FOR DELETE USING (user_id = auth.uid());

-- NPCs: DM can CRUD, players can read
ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign members can view NPCs" ON public.npcs FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = npcs.campaign_id AND (dm_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.characters WHERE campaign_id = npcs.campaign_id AND user_id = auth.uid())))
  );
CREATE POLICY "DM can manage NPCs" ON public.npcs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.campaigns WHERE id = npcs.campaign_id AND dm_id = auth.uid())
);

-- Combat sessions: readable by campaign members, writable by DM
ALTER TABLE public.combat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign members can view combat" ON public.combat_sessions FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = combat_sessions.campaign_id AND (dm_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.characters WHERE campaign_id = combat_sessions.campaign_id AND user_id = auth.uid())))
  );
CREATE POLICY "DM can manage combat" ON public.combat_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.campaigns WHERE id = combat_sessions.campaign_id AND dm_id = auth.uid())
);

-- Battle maps: same as combat sessions
ALTER TABLE public.battle_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign members can view maps" ON public.battle_maps FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = battle_maps.campaign_id AND (dm_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.characters WHERE campaign_id = battle_maps.campaign_id AND user_id = auth.uid())))
  );
CREATE POLICY "DM can manage maps" ON public.battle_maps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.campaigns WHERE id = battle_maps.campaign_id AND dm_id = auth.uid())
);

-- Wiki pages: readable by campaign members (unless dm_only), writable by all members
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign members can view wiki pages" ON public.wiki_pages FOR SELECT 
  USING (
    (NOT dm_only OR EXISTS (SELECT 1 FROM public.campaigns WHERE id = wiki_pages.campaign_id AND dm_id = auth.uid())) AND
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = wiki_pages.campaign_id AND (dm_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.characters WHERE campaign_id = wiki_pages.campaign_id AND user_id = auth.uid())))
  );
CREATE POLICY "Campaign members can create wiki pages" ON public.wiki_pages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.campaigns WHERE id = wiki_pages.campaign_id AND (dm_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.characters WHERE campaign_id = wiki_pages.campaign_id AND user_id = auth.uid())))
);
CREATE POLICY "Users can update wiki pages they created" ON public.wiki_pages FOR UPDATE USING (created_by = auth.uid());

-- Character notes: private to character owner
ALTER TABLE public.character_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Character owner can manage notes" ON public.character_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.characters WHERE id = character_notes.character_id AND user_id = auth.uid())
);
CREATE POLICY "DM can view shared notes" ON public.character_notes FOR SELECT USING (
  shared_with_dm = true AND EXISTS (
    SELECT 1 FROM public.characters c
    JOIN public.campaigns camp ON c.campaign_id = camp.id
    WHERE c.id = character_notes.character_id AND camp.dm_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_characters_campaign ON public.characters(campaign_id);
CREATE INDEX idx_characters_user ON public.characters(user_id);
CREATE INDEX idx_npcs_campaign ON public.npcs(campaign_id);
CREATE INDEX idx_wiki_pages_campaign ON public.wiki_pages(campaign_id);
CREATE INDEX idx_wiki_pages_slug ON public.wiki_pages(campaign_id, slug);
CREATE INDEX idx_combat_sessions_campaign ON public.combat_sessions(campaign_id);
CREATE INDEX idx_battle_maps_combat ON public.battle_maps(combat_session_id);

-- Realtime publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.combat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_maps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wiki_pages;
