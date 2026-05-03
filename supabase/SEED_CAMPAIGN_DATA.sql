-- ============================================
-- SEED DATA: The Vanishing of Aldermere
-- Run in Supabase SQL Editor AFTER creating your campaign in the app
-- 
-- INSTRUCTIONS:
-- 1. Create your campaign in the app ("The Vanishing of Aldermere")
-- 2. Go to Supabase > Table Editor > campaigns
-- 3. Copy the UUID of your campaign
-- 4. Replace YOUR_CAMPAIGN_ID_HERE below with that UUID
-- 5. Replace YOUR_USER_ID_HERE with your user UUID (find in profiles table)
-- 6. Run this script
-- ============================================

-- Set your IDs here (replace these!)
DO $$
DECLARE
  campaign_uuid UUID := 'YOUR_CAMPAIGN_ID_HERE';
  dm_uuid UUID := 'YOUR_USER_ID_HERE';
BEGIN

-- ============================================
-- NPCs
-- ============================================

-- Miravel Thorn (The Villain)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Miravel Thorn',
  'humanoid',
  'Elegant woman in her 50s, silver-streaked dark hair, always wears a brooch shaped like a water lily. The town''s beloved apothecary. Warm, generous, everyone''s favorite. Offers free tea and remedies. Subtly redirects suspicion toward others. SECRET: Terrified of aging. Found the ritual site 6 months ago and has been luring townsfolk to feed The Drowning Prince in exchange for eternal youth.',
  'Miravel''s Apothecary, Market Square',
  27, 12, 30,
  '{
    "role": "Villain",
    "abilities": {"str": 8, "dex": 14, "con": 12, "int": 14, "wis": 10, "cha": 16},
    "attacks": [
      {"name": "Poison Dart", "bonus": "+4", "damage": "1d4+2 poison", "range": "20 ft"},
      {"name": "Sleep Potion (thrown)", "bonus": "DC 12 CON save", "damage": "Sleep 1 min", "range": "15 ft"}
    ],
    "special": "Can command The Drowning Prince''s minor illusions",
    "personality": "Warm and generous on the surface. Desperate and afraid underneath."
  }'::jsonb
);

-- Constable Harlen Moss
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Constable Harlen Moss',
  'humanoid',
  'Tired, mid-40s, patchy beard, dark circles under his eyes. Honest but overwhelmed. Grateful for any help. Has a list of missing persons and a map with red Xs. Carries iron manacles.',
  'Constable''s Office, Town Center',
  22, 14, 30,
  '{
    "role": "Quest Giver / Ally",
    "abilities": {"str": 14, "dex": 12, "con": 13, "int": 10, "wis": 12, "cha": 10},
    "attacks": [
      {"name": "Longsword", "bonus": "+4", "damage": "1d8+2 slashing"}
    ],
    "special": "Has iron manacles (important for the fey creature). Will join the party for the final confrontation if asked.",
    "key_info": "Three people missing in 2 weeks. No bodies, no signs of struggle. Last seen near market square at dusk."
  }'::jsonb
);

-- Mayor Idris Blackwell (Red Herring)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Mayor Idris Blackwell',
  'humanoid',
  'Portly, well-dressed, sweating even in cool weather. Dismissive and nervous. Claims people "just moved away." RED HERRING: Not involved in disappearances but IS embezzling town funds and fears any investigation might expose him.',
  'Mayor''s Office, Town Hall',
  12, 10, 30,
  '{
    "role": "Red Herring",
    "abilities": {"str": 8, "dex": 10, "con": 11, "int": 13, "wis": 9, "cha": 14},
    "special": "Insight DC 11 reveals he is hiding something. Investigation DC 13 on his desk reveals embezzlement ledgers. If confronted, breaks down and begs — swears he has nothing to do with disappearances (true).",
    "personality": "Corrupt but not dangerous. A coward."
  }'::jsonb
);

-- Old Wren (The Clue-Giver)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Old Wren',
  'humanoid',
  'Ancient fisherman, milky eyes, sits by the lake dock every day mending a net he''ll never use. Cryptic but kind. Speaks in half-riddles. Knows the lake''s legends.',
  'Lake Dock',
  8, 10, 20,
  '{
    "role": "Clue-Giver",
    "abilities": {"str": 6, "dex": 8, "con": 10, "int": 12, "wis": 18, "cha": 14},
    "special": "Will share legend of The Drowning Prince if players sit with him and don''t rush. Key line: Follow the water lilies. They grow where they shouldn''t.",
    "legend": "Long before this town, there was a prince of the fey folk. Beautiful and cruel. He tried to steal the lake for his court, but the druids bound him beneath the water in chains of iron and root. They say he sleeps still, in a cave where the water weeps."
  }'::jsonb
);

-- Lila Fernsby (Missing Person's Family)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Lila Fernsby',
  'humanoid',
  'Young woman, red-eyed from crying, flour-dusted apron. Desperate, angry, wants answers. Her brother Tomm is the most recent missing person. Saw Tomm drinking tea at Miravel''s shop the evening he vanished.',
  'Fernsby Bakery, Market Square',
  10, 10, 30,
  '{
    "role": "Emotional Hook / Clue Source",
    "abilities": {"str": 10, "dex": 11, "con": 12, "int": 10, "wis": 13, "cha": 12},
    "special": "Has a vial of Miravel''s calming tea on kitchen shelf. Perception DC 12 to notice. Arcana/Nature DC 14 reveals dreamlily sedative.",
    "key_info": "Tomm went to Miravel''s for a headache remedy. She saw him through the window drinking tea. He never came home."
  }'::jsonb
);

-- The Drowning Prince (Boss)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'The Drowning Prince',
  'fey',
  'Tall, gaunt fey with translucent blue-green skin, seaweed-like hair, hollow black eyes that weep constantly. Ancient, manipulative, desperate to be freed from his prison. Speaks in whispers telepathically. Imprisoned beneath the old mill in chains of iron and druidic roots.',
  'Caverns beneath the Old Mill',
  45, 14, 0,
  '{
    "role": "Final Boss",
    "abilities": {"str": 16, "dex": 12, "con": 14, "int": 16, "wis": 14, "cha": 18},
    "attacks": [
      {"name": "Water Whip", "bonus": "+5", "damage": "1d8+3 bludgeoning", "range": "15 ft reach", "special": "Can pull target 10 ft closer (STR DC 13)"},
      {"name": "Charm Gaze (Recharge 5-6)", "bonus": "WIS DC 13", "damage": "Charmed 1 round", "range": "30 ft"},
      {"name": "Fog Cloud (1/encounter)", "bonus": "auto", "damage": "20 ft radius heavily obscured", "range": "self", "special": "Lasts 3 rounds"}
    ],
    "vulnerability": "Iron weapons deal double damage. Iron manacles deal 2d6 on contact.",
    "root_weakness": "3 root clusters (AC 10, HP 15 each). Destroying one deals 10 damage to Prince and removes one ability. First: Fog Cloud. Second: Charm Gaze. Third: Water Whip reach reduced to 5 ft.",
    "speed_note": "CANNOT MOVE. Bound in place. This is intentional for level 1 balance.",
    "personality": "Desperate, not confident. Been imprisoned for centuries. Afraid.",
    "hp_adjustment": "Reduce to 35 HP for 4 players."
  }'::jsonb
);

-- Berta Ashwood (Innkeeper)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Berta Ashwood',
  'humanoid',
  'Sturdy woman who runs the Hearthstone Inn. Gives the party rooms at half price if they promise to help find the missing. Warm, no-nonsense, feeds everyone too much.',
  'Hearthstone Inn',
  14, 10, 30,
  '{
    "role": "Safe Haven / Rumors",
    "special": "Patrons share rumors: people missing, mayor dismissive, Old Wren says the lake is hungry, Miravel giving out free calming teas."
  }'::jsonb
);

-- Pim (Gate Guard - becomes victim in Session 2)
INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Pim',
  'humanoid',
  'Young, fidgety gate guard, holding a spear he clearly doesn''t know how to use. First NPC the players meet. DISAPPEARS at the start of Session 2 to raise the stakes — someone they actually met is now gone.',
  'Town Gate',
  8, 11, 30,
  '{
    "role": "First Contact / Session 2 Victim",
    "special": "Lets players into town after basic questions. If asked why gate is closed: Constable''s orders, people have been going missing. Directs them to Hearthstone Inn for lodging."
  }'::jsonb
);

-- ============================================
-- Missing Persons (referenced in the story)
-- ============================================

INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Edda Marsh',
  'humanoid',
  'Elderly herbalist. First to disappear (14 days ago). Last seen walking home from the market at dusk. Found in enchanted sleep in the caverns.',
  'Caverns (sleeping)',
  8, 10, 25,
  '{"role": "Missing Person #1", "disappeared": "14 days ago", "last_seen": "Walking home from market at dusk"}'::jsonb
);

INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Garren Flint',
  'humanoid',
  'Middle-aged blacksmith. Second to disappear (9 days ago). Last seen near the old mill. Strong — may help in the final fight by grabbing a rock if a player drops to 0 HP.',
  'Caverns (sleeping)',
  18, 12, 30,
  '{"role": "Missing Person #2", "disappeared": "9 days ago", "last_seen": "Near the old mill"}'::jsonb
);

INSERT INTO public.npcs (campaign_id, created_by, name, type, description, location, hp_max, ac, speed, stat_block)
VALUES (
  campaign_uuid, dm_uuid,
  'Tomm Fernsby',
  'humanoid',
  'Young baker, 19 years old. Lila''s brother. Third to disappear (3 days ago). Last seen leaving Miravel''s apothecary shop after drinking tea for a headache.',
  'Caverns (sleeping)',
  10, 10, 30,
  '{"role": "Missing Person #3", "disappeared": "3 days ago", "last_seen": "Leaving Miravel''s apothecary shop"}'::jsonb
);

RAISE NOTICE 'Seed data inserted successfully! Check your npcs table.';

END $$;
