-- ============================================
-- COMPLETE SEED: Campaign + NPCs + Wiki Pages
-- Your User ID: 972a6188-9d93-4ced-ba24-368d3ab97b5c
-- Run this in Supabase SQL Editor
-- ============================================

DO $$
DECLARE
  dm_uuid UUID := '972a6188-9d93-4ced-ba24-368d3ab97b5c';
  campaign_uuid UUID;
BEGIN

-- ============================================
-- Step 1: Create the campaign (or find existing)
-- ============================================
SELECT id INTO campaign_uuid FROM public.campaigns WHERE dm_id = dm_uuid AND name = 'The Vanishing of Aldermere' LIMIT 1;

IF campaign_uuid IS NULL THEN
  INSERT INTO public.campaigns (dm_id, name, description)
  VALUES (dm_uuid, 'The Vanishing of Aldermere', 'A 3-session mystery campaign for level 1 characters. People are disappearing from the lakeside town of Aldermere, and water lilies are growing where they shouldn''t.')
  RETURNING id INTO campaign_uuid;
  
  -- Add DM as campaign member
  INSERT INTO public.campaign_members (campaign_id, user_id, role)
  VALUES (campaign_uuid, dm_uuid, 'dm')
  ON CONFLICT (campaign_id, user_id) DO NOTHING;
END IF;

RAISE NOTICE 'Campaign ID: %', campaign_uuid;

-- ============================================
-- Step 2: Clear existing NPCs for this campaign (re-runnable)
-- ============================================
DELETE FROM public.npcs WHERE campaign_id = campaign_uuid;

-- ============================================
-- Step 3: Insert NPCs
-- ============================================

-- Miravel Thorn (The Villain)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (campaign_uuid, dm_uuid, 'Miravel Thorn', 'humanoid',
  'Elegant woman in her 50s, silver-streaked dark hair, always wears a brooch shaped like a water lily. The town''s beloved apothecary. SECRET: Feeding life force to The Drowning Prince in exchange for eternal youth.',
  'Miravel''s Apothecary, Market Square', 27, 12, 30,
  '{"role":"Villain","abilities":{"str":8,"dex":14,"con":12,"int":14,"wis":10,"cha":16},"attacks":[{"name":"Poison Dart","bonus":"+4","damage":"1d4+2 poison","range":"20 ft"},{"name":"Sleep Potion","bonus":"DC 12 CON save","damage":"Sleep 1 min","range":"15 ft"}],"personality":"Warm on surface. Desperate underneath.","insight_dc":13,"key_evidence":"Locked drawer contains dreamlily, map of mill passage, and journal."}'::jsonb
);

-- Constable Harlen Moss
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (campaign_uuid, dm_uuid, 'Constable Harlen Moss', 'humanoid',
  'Tired, mid-40s, patchy beard, dark circles. Honest but overwhelmed. Grateful for help. Has iron manacles (important for the boss fight).',
  'Constable''s Office, Town Center', 22, 14, 30,
  '{"role":"Quest Giver / Ally","abilities":{"str":14,"dex":12,"con":13,"int":10,"wis":12,"cha":10},"attacks":[{"name":"Longsword","bonus":"+4","damage":"1d8+2 slashing"}],"gives_players":"Permission to investigate, town map with disappearance locations, key to supply room, iron manacles","key_info":"3 missing in 2 weeks. No bodies, no struggle. All disappeared in evening."}'::jsonb
);

-- Mayor Idris Blackwell (Red Herring)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (campaign_uuid, dm_uuid, 'Mayor Idris Blackwell', 'humanoid',
  'Portly, well-dressed, sweating. RED HERRING: Not involved in disappearances but IS embezzling town funds. Insight DC 11 reveals he''s hiding something. Investigation DC 13 reveals embezzlement.',
  'Mayor''s Office, Town Hall', 12, 10, 30,
  '{"role":"Red Herring","abilities":{"str":8,"dex":10,"con":11,"int":13,"wis":9,"cha":14},"insight_dc":11,"investigation_dc":13,"secret":"Embezzling town taxes. If confronted, breaks down and begs. Swears innocence about disappearances (TRUE)."}'::jsonb
);

-- Old Wren (The Clue-Giver)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (campaign_uuid, dm_uuid, 'Old Wren', 'humanoid',
  'Ancient fisherman, milky eyes, sits by the dock. Cryptic but kind. Knows the legend of The Drowning Prince. Will share if players sit with him and don''t rush.',
  'Lake Dock', 8, 10, 20,
  '{"role":"Clue-Giver","abilities":{"str":6,"dex":8,"con":10,"int":12,"wis":18,"cha":14},"legend":"Long before this town, there was a prince of the fey folk. Beautiful and cruel. He tried to steal the lake, but the druids bound him beneath the water in chains of iron and root.","key_line":"Follow the water lilies. They grow where they shouldn''t."}'::jsonb
);

-- Lila Fernsby
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (campaign_uuid, dm_uuid, 'Lila Fernsby', 'humanoid',
  'Young woman, red-eyed from crying, flour-dusted apron. Brother Tomm is the most recent missing person. Saw Tomm drinking tea at Miravel''s the evening he vanished.',
  'Fernsby Bakery, Market Square', 10, 10, 30,
  '{"role":"Emotional Hook / Clue Source","key_info":"Tomm went to Miravel''s for headache remedy. She saw him through window drinking tea. He never came home.","evidence":"Has vial of Miravel''s calming tea on kitchen shelf. Perception DC 12 to notice. Arcana/Nature DC 14 reveals dreamlily sedative."}'::jsonb
);

-- The Drowning Prince (Boss)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (campaign_uuid, dm_uuid, 'The Drowning Prince', 'fey',
  'Tall, gaunt fey with translucent blue-green skin, seaweed-like hair, hollow black eyes that weep constantly. Imprisoned beneath the old mill in chains of iron and druidic roots. CANNOT MOVE (bound).',
  'Caverns beneath the Old Mill', 45, 14, 0,
  '{"role":"Final Boss","abilities":{"str":16,"dex":12,"con":14,"int":16,"wis":14,"cha":18},"attacks":[{"name":"Water Whip","bonus":"+5","damage":"1d8+3 bludgeoning","range":"15 ft reach","special":"Pull target 10 ft closer (STR DC 13)"},{"name":"Charm Gaze (Recharge 5-6)","bonus":"WIS DC 13","damage":"Charmed 1 round","range":"30 ft"},{"name":"Fog Cloud (1/encounter)","bonus":"auto","damage":"20 ft radius heavily obscured","special":"Lasts 3 rounds"}],"vulnerability":"Iron weapons deal DOUBLE damage. Iron manacles deal 2d6 on contact.","root_weakness":"3 root clusters (AC 10, HP 15 each). Destroying one deals 10 damage to Prince and removes one ability. Order: Fog Cloud, Charm Gaze, Water Whip reach to 5ft.","hp_for_4_players":35,"speed_note":"CANNOT MOVE. Bound in place. Intentional for level 1 balance."}'::jsonb
);

-- Berta Ashwood (Innkeeper)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (campaign_uuid, dm_uuid, 'Berta Ashwood', 'humanoid',
  'Sturdy innkeeper. Gives half-price rooms if party promises to help. Warm, no-nonsense.',
  'Hearthstone Inn', 14, 10, 30,
  '{"role":"Safe Haven / Rumors","rumors":["Three people gone in two weeks. Tomm the baker''s boy was last.","The mayor says they left town, but who leaves without packing?","Old Wren says the lake is hungry.","Miravel''s been giving out free calming teas."]}'::jsonb
);

-- Pim (Gate Guard)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (campaign_uuid, dm_uuid, 'Pim', 'humanoid',
  'Young, fidgety gate guard. First NPC players meet. DISAPPEARS at start of Session 2 to raise stakes.',
  'Town Gate', 8, 11, 30,
  '{"role":"First Contact / Session 2 Victim","dialogue":"People have been... going missing.","session2":"Found missing. His post abandoned, spear leaning against wall. A single water lily on the ground where he stood."}'::jsonb
);

-- Missing Persons
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES
  (campaign_uuid, dm_uuid, 'Edda Marsh', 'humanoid', 'Elderly herbalist. Missing 14 days. Last seen walking home from market at dusk.', 'Caverns (sleeping)', 8, 10, 25,
   '{"role":"Missing Person #1","disappeared":"14 days ago","last_seen":"Walking home from market at dusk"}'::jsonb),
  (campaign_uuid, dm_uuid, 'Garren Flint', 'humanoid', 'Middle-aged blacksmith. Missing 9 days. Last seen near old mill. May help in final fight.', 'Caverns (sleeping)', 18, 12, 30,
   '{"role":"Missing Person #2","disappeared":"9 days ago","last_seen":"Near the old mill","combat_note":"If a player drops to 0 HP, Garren grabs a rock and helps."}'::jsonb),
  (campaign_uuid, dm_uuid, 'Tomm Fernsby', 'humanoid', 'Young baker, 19. Lila''s brother. Missing 3 days. Last seen leaving Miravel''s shop.', 'Caverns (sleeping)', 10, 10, 30,
   '{"role":"Missing Person #3","disappeared":"3 days ago","last_seen":"Leaving Miravel''s apothecary after drinking tea"}'::jsonb);

-- ============================================
-- Step 4: Wiki Pages
-- ============================================
DELETE FROM public.wiki_pages WHERE campaign_id = campaign_uuid;

-- Campaign Overview
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES (campaign_uuid, dm_uuid, 'Campaign Overview', 'campaign-overview', 'lore', false,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The Vanishing of Aldermere"}]},{"type":"paragraph","content":[{"type":"text","text":"People are disappearing from the lakeside town of Aldermere. No bodies, no signs of struggle — just water lilies growing where they shouldn''t. The constable is overwhelmed, the mayor is dismissive, and the townsfolk are afraid. Can you uncover the truth before it''s too late?"}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Setting"}]},{"type":"paragraph","content":[{"type":"text","text":"Aldermere is a town of about two hundred souls nestled against the shore of Mirror Lake. Fishing boats bob at the dock. Smoke curls from chimneys. It looks peaceful — but something dark stirs beneath the surface."}]}]}'::jsonb
);

-- Aldermere (Location)
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES (campaign_uuid, dm_uuid, 'Aldermere', 'aldermere', 'location', false,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Aldermere"}]},{"type":"paragraph","content":[{"type":"text","text":"A small lakeside town of about 200 people, nestled against Mirror Lake in the Greenvale hills. Known for its fishing, quiet charm, and the Hearthstone Inn."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Locations"}]},{"type":"paragraph","content":[{"type":"text","text":"The Hearthstone Inn — Run by Berta Ashwood. Comfortable rooms, good food, and the best source of local gossip."}]},{"type":"paragraph","content":[{"type":"text","text":"Miravel''s Apothecary — Beautiful shop in Market Square. Dried herbs, remedies, and free calming teas."}]},{"type":"paragraph","content":[{"type":"text","text":"The Old Mill — Abandoned mill at the edge of town near the lake. Creaky, dusty... and hiding a secret passage to caverns below."}]},{"type":"paragraph","content":[{"type":"text","text":"Town Hall — Where Mayor Blackwell conducts (questionable) business."}]},{"type":"paragraph","content":[{"type":"text","text":"The Lake Dock — Where Old Wren sits mending his net every day."}]}]}'::jsonb
);

-- Mirror Lake
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES (campaign_uuid, dm_uuid, 'Mirror Lake', 'mirror-lake', 'location', false,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Mirror Lake"}]},{"type":"paragraph","content":[{"type":"text","text":"A large, still freshwater lake bordering Aldermere. Named for its glassy surface on calm days. Old Wren says the lake remembers everything that happens on its shores."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"The Legend"}]},{"type":"paragraph","content":[{"type":"text","text":"Long before Aldermere was built, a prince of the fey folk tried to steal the lake for his court. The druids of the old forest bound him beneath the water in chains of iron and root. They say he sleeps still, in a cave where the water weeps."}]}]}'::jsonb
);

-- The Old Mill
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES (campaign_uuid, dm_uuid, 'The Old Mill', 'the-old-mill', 'location', false,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The Old Mill"}]},{"type":"paragraph","content":[{"type":"text","text":"An abandoned mill at the edge of Aldermere, near the lake. The timbers are rotting and the millstone hasn''t turned in decades. Most townsfolk avoid it."}]},{"type":"paragraph","content":[{"type":"text","text":"Investigation reveals fresh boot prints in the dust, leading toward a cleverly disguised door in the back wall. Behind it: stone stairs descending into darkness."}]}]}'::jsonb
);

-- DM-only: The Truth (hidden from players)
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES (campaign_uuid, dm_uuid, 'The Truth (DM Only)', 'the-truth', 'lore', true,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The Truth"}]},{"type":"paragraph","content":[{"type":"text","text":"Miravel Thorn discovered the ancient ritual site beneath the old mill 6 months ago. The Drowning Prince spoke to her, promising eternal youth in exchange for ''sustenance'' — living energy from townsfolk."}]},{"type":"paragraph","content":[{"type":"text","text":"She uses dreamlily-laced tea to make victims compliant, then leads them to the caverns where The Drowning Prince feeds on their life force. The victims don''t die — they fall into an enchanted sleep. But each feeding weakens the druidic bindings holding the Prince prisoner."}]},{"type":"paragraph","content":[{"type":"text","text":"Four more feedings and the roots will break. The Prince will be free to flood Aldermere and reclaim Mirror Lake for the fey court."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Evidence"}]},{"type":"paragraph","content":[{"type":"text","text":"1. Miravel''s locked drawer: dreamlily vial, map of mill passage, journal with confessions. 2. Water lilies growing in unnatural places (fountain, gate). 3. All victims visited Miravel''s shop before vanishing. 4. Insight DC 13 detects Miravel is lying about Tomm leaving safely."}]}]}'::jsonb
);

-- DM-only: Session 1 Guide
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES (campaign_uuid, dm_uuid, 'Session 1 Guide', 'session-1-guide', 'session-recap', true,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Session 1: Arrival and First Clues"}]},{"type":"paragraph","content":[{"type":"text","text":"GOAL: Players arrive, meet NPCs, investigate 3-4 locations, find the mill entrance, and suspect Miravel."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Pacing"}]},{"type":"paragraph","content":[{"type":"text","text":"Opening (30 min): Arrive at gate, meet Pim, get rooms at Hearthstone Inn. Constable meeting (30 min): Get the missing persons list and town map. Investigation (90-120 min): Visit locations in any order. Closing: Water lilies appear in the town fountain at dusk."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"If Players Get Stuck"}]},{"type":"paragraph","content":[{"type":"text","text":"- Have Lila come find them in tears. - Old Wren drops a hint about the mill. - Moss shares a new clue about water lilies in Edda''s journal. - A player rolls Investigation DC 10 to remember a connection."}]}]}'::jsonb
);

-- DM-only: Session 2 Guide
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES (campaign_uuid, dm_uuid, 'Session 2 Guide', 'session-2-guide', 'session-recap', true,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Session 2: Deepening the Mystery"}]},{"type":"paragraph","content":[{"type":"text","text":"GOAL: Pim disappears, players confront Miravel, enter caverns, find sleepers, meet The Drowning Prince."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Opening"}]},{"type":"paragraph","content":[{"type":"text","text":"Players wake to shouting. Pim is missing. A water lily lies where he stood. This makes it personal — they MET this guy."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Moments"}]},{"type":"paragraph","content":[{"type":"text","text":"- Following Miravel to the mill at dusk (Stealth DC 14). - Finding her journal (smoking gun). - Overhearing her talking to the Prince. - The sleeping chamber: 4 townsfolk on stone slabs, connected by glowing tendrils to roots on the far wall. - The Drowning Prince opens one eye."}]}]}'::jsonb
);

-- DM-only: Session 3 Guide
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES (campaign_uuid, dm_uuid, 'Session 3 Guide', 'session-3-guide', 'session-recap', true,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Session 3: The Reckoning"}]},{"type":"paragraph","content":[{"type":"text","text":"GOAL: Free sleepers, fight the Prince, decide Miravel''s fate, get rewards, level up."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Freeing Sleepers"}]},{"type":"paragraph","content":[{"type":"text","text":"Each sleeper: Medicine DC 12 OR Arcana DC 13 OR cut tendrils (1d6 psychic to sleeper). After 2nd sleeper freed, Prince attacks."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Boss Fight Tips"}]},{"type":"paragraph","content":[{"type":"text","text":"He CANNOT MOVE. Players can kite at range. Use Fog Cloud early. Charm the strongest fighter. Root clusters (AC 10, HP 15) each remove an ability when destroyed. If too hard: a root breaks on its own for 10 free damage. If too easy: Prince pulls someone into the pool (restrained, STR DC 13)."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Rewards"}]},{"type":"paragraph","content":[{"type":"text","text":"150 XP each (milestone to Level 2). 50-100 gp each. One magic item per player: Brooch of Water Breathing, Iron Manacles (adv vs fey grapple), Wren''s Compass (detect magic 1/day), Hearthstone Pendant (spare the dying 1/day 30ft), Lucky Rolling Pin (+1 improvised, reroll save 1/LR)."}]}]}'::jsonb
);

-- Water Lilies (Lore)
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES (campaign_uuid, dm_uuid, 'The Water Lilies', 'water-lilies', 'lore', false,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The Water Lilies"}]},{"type":"paragraph","content":[{"type":"text","text":"Freshwater water lilies native to Mirror Lake have been appearing in strange places throughout Aldermere — growing in the town fountain, appearing on the ground where people were last seen, and blooming in the cracks of the old mill floor."}]},{"type":"paragraph","content":[{"type":"text","text":"They radiate faint enchantment magic and seem to be markers or breadcrumbs left by something fey. Old Wren says to follow them."}]}]}'::jsonb
);

-- NPC wiki pages (player-visible)
INSERT INTO public.wiki_pages (campaign_id, created_by, title, slug, category, dm_only, content)
VALUES
  (campaign_uuid, dm_uuid, 'Constable Harlen Moss', 'constable-moss', 'npc', false,
   '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Constable Harlen Moss"}]},{"type":"paragraph","content":[{"type":"text","text":"The town constable. Tired, honest, overwhelmed. Has been tracking the disappearances with red X marks on a town map. Grateful for any help the party can provide."}]}]}'::jsonb),
  (campaign_uuid, dm_uuid, 'Old Wren', 'old-wren', 'npc', false,
   '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Old Wren"}]},{"type":"paragraph","content":[{"type":"text","text":"An ancient fisherman who sits by the lake dock every day. Speaks in half-riddles but means well. Knows the legends of Mirror Lake better than anyone alive."}]}]}'::jsonb),
  (campaign_uuid, dm_uuid, 'Berta Ashwood', 'berta-ashwood', 'npc', false,
   '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Berta Ashwood"}]},{"type":"paragraph","content":[{"type":"text","text":"The innkeeper of the Hearthstone Inn. Sturdy, warm, and no-nonsense. Feeds everyone too much and won''t let heroes pay for breakfast."}]}]}'::jsonb);

RAISE NOTICE 'All data seeded successfully! Campaign: %, NPCs: 11, Wiki Pages: 11', campaign_uuid;

END $$;
