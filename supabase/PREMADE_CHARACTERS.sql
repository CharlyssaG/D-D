-- ============================================
-- PREMADE CHARACTERS: 5 beginner-friendly heroes
-- Your User ID: 972a6188-9d93-4ced-ba24-368d3ab97b5c
-- 
-- These are "unclaimed" characters - players pick one
-- and you transfer ownership by updating user_id
-- 
-- Run in Supabase SQL Editor
-- ============================================

DO $$
DECLARE
  dm_uuid UUID := '972a6188-9d93-4ced-ba24-368d3ab97b5c';
  campaign_uuid UUID;
BEGIN

-- Find the campaign
SELECT id INTO campaign_uuid FROM public.campaigns 
WHERE dm_id = dm_uuid AND name = 'The Vanishing of Aldermere' LIMIT 1;

IF campaign_uuid IS NULL THEN
  RAISE EXCEPTION 'Campaign not found! Create it first or run COMPLETE_SEED.sql';
END IF;

-- Clear existing premade characters (safe to re-run)
DELETE FROM public.characters WHERE campaign_id = campaign_uuid AND user_id = dm_uuid;

-- ============================================
-- CHARACTER 1: ROWAN ASHFORD (Fighter)
-- The Protector - simple to play, hard to kill
-- ============================================
INSERT INTO public.characters (
  user_id, campaign_id, name, race, class, level, background, alignment,
  ability_scores, proficiency_bonus,
  hp_max, hp_current, hp_temp, ac, initiative_bonus, speed,
  saving_throws, skills, features, feats, inventory, equipment,
  spellcasting_ability, spell_slots, spells_known, spells_prepared,
  backstory, personality, ideals, bonds, flaws
) VALUES (
  dm_uuid, campaign_uuid,
  'Rowan Ashford', 'Human', 'Fighter', 1, 'Soldier', 'Lawful Good',
  '{"str": 16, "dex": 14, "con": 15, "int": 10, "wis": 12, "cha": 8}'::jsonb,
  2, 12, 12, 0, 16, 2, 30,
  '{"str": true, "dex": false, "con": true, "int": false, "wis": false, "cha": false}'::jsonb,
  '{"Athletics": {"proficient": true}, "Intimidation": {"proficient": true}, "Perception": {"proficient": true}, "Survival": {"proficient": true}}'::jsonb,
  '[{"name": "Fighting Style: Defense", "description": "+1 AC while wearing armor (already calculated in AC)."}, {"name": "Second Wind", "description": "Once per short rest, use a bonus action to regain 1d10+1 HP. Your emergency heal button!"}]'::jsonb,
  '[]'::jsonb,
  '[{"name": "Chain Mail", "type": "armor", "weight": 55, "equipped": true}, {"name": "Longsword", "type": "weapon", "weight": 3, "damage": "1d8+3 slashing", "equipped": true}, {"name": "Shield", "type": "armor", "weight": 6, "equipped": true, "ac_bonus": 2}, {"name": "Handaxe", "type": "weapon", "weight": 2, "damage": "1d6+3 slashing", "quantity": 2, "properties": "Thrown (20/60)"}, {"name": "Explorer''s Pack", "type": "gear", "weight": 0}, {"name": "Identity papers", "type": "trinket", "weight": 0}, {"name": "Set of bone dice", "type": "trinket", "weight": 0}, {"name": "Common clothes", "type": "gear", "weight": 3}, {"name": "Belt pouch", "type": "gear", "weight": 1, "contains": "10 gp"}]'::jsonb,
  '{"armor": "Chain Mail + Shield", "weapon": "Longsword", "offhand": "Shield"}'::jsonb,
  NULL, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb,
  'Rowan served three years in the Greenvale militia before an ambush left half the unit dead. The guilt of surviving drove Rowan to wander, offering a sword arm to anyone who needs protection. Aldermere seemed like a quiet place to rest — but quiet places have a way of hiding trouble.',
  'I face problems head-on. A simple, direct solution is the best path to success.',
  'Greater Good. Our lot is to protect those who cannot protect themselves.',
  'I''ll never forget the soldiers who died beside me. I fight so their sacrifice meant something.',
  'I''d rather eat my armor than admit I''m wrong.'
);

-- ============================================
-- CHARACTER 2: THISTLE MOONPETAL (Cleric - Life Domain)
-- The Healer - keeps everyone alive, also hits hard
-- ============================================
INSERT INTO public.characters (
  user_id, campaign_id, name, race, class, level, background, alignment,
  ability_scores, proficiency_bonus,
  hp_max, hp_current, hp_temp, ac, initiative_bonus, speed,
  saving_throws, skills, features, feats, inventory, equipment,
  spellcasting_ability, spell_slots, spells_known, spells_prepared,
  backstory, personality, ideals, bonds, flaws
) VALUES (
  dm_uuid, campaign_uuid,
  'Thistle Moonpetal', 'Half-Elf', 'Cleric', 1, 'Acolyte', 'Neutral Good',
  '{"str": 12, "dex": 10, "con": 14, "int": 10, "wis": 16, "cha": 14}'::jsonb,
  2, 10, 10, 0, 18, 0, 30,
  '{"str": false, "dex": false, "con": false, "int": false, "wis": true, "cha": true}'::jsonb,
  '{"Insight": {"proficient": true}, "Medicine": {"proficient": true}, "Persuasion": {"proficient": true}, "Religion": {"proficient": true}}'::jsonb,
  '[{"name": "Disciple of Life", "description": "When you cast a healing spell of 1st level or higher, the creature regains extra HP equal to 2 + the spell''s level. Your heals are EXTRA strong!"}, {"name": "Spellcasting", "description": "You know 3 cantrips and can prepare up to 4 spells per day from the Cleric spell list. Wisdom is your spellcasting ability. Spell save DC: 13, Spell attack: +5."}]'::jsonb,
  '[]'::jsonb,
  '[{"name": "Scale Mail", "type": "armor", "weight": 45, "equipped": true}, {"name": "Shield", "type": "armor", "weight": 6, "equipped": true, "ac_bonus": 2}, {"name": "Mace", "type": "weapon", "weight": 4, "damage": "1d6+1 bludgeoning", "equipped": true}, {"name": "Holy Symbol (amulet)", "type": "focus", "weight": 1, "equipped": true}, {"name": "Prayer book", "type": "gear", "weight": 0}, {"name": "5 sticks of incense", "type": "gear", "weight": 0}, {"name": "Vestments", "type": "gear", "weight": 0}, {"name": "Explorer''s Pack", "type": "gear", "weight": 0}, {"name": "Belt pouch", "type": "gear", "weight": 1, "contains": "15 gp"}]'::jsonb,
  '{"armor": "Scale Mail + Shield", "weapon": "Mace", "offhand": "Shield"}'::jsonb,
  'wis',
  '{"1": {"max": 2, "used": 0}}'::jsonb,
  '["Sacred Flame", "Thaumaturgy", "Light", "Cure Wounds", "Bless", "Guiding Bolt", "Healing Word", "Detect Magic"]'::jsonb,
  '["Cure Wounds", "Bless", "Guiding Bolt", "Healing Word"]'::jsonb,
  'Thistle grew up in a small forest temple devoted to Eldath, goddess of peace. When travelers brought word of people vanishing near Mirror Lake, the temple elders sent Thistle to investigate — their first real mission beyond tending the garden and mending scraped knees. Thistle is terrified and exhilarated in equal measure.',
  'I see omens in every event and action. The gods try to speak to us, we just need to listen.',
  'Faith. I trust that my deity will guide my actions. I have faith that if I work hard, things will go well.',
  'I owe my life to the temple that took me in as an orphan. I will do anything to protect it and its people.',
  'I judge others harshly, and myself even more severely.'
);

-- ============================================
-- CHARACTER 3: FELIX QUICKFOOT (Rogue)
-- The Scout - sneaky, great at finding clues
-- ============================================
INSERT INTO public.characters (
  user_id, campaign_id, name, race, class, level, background, alignment,
  ability_scores, proficiency_bonus,
  hp_max, hp_current, hp_temp, ac, initiative_bonus, speed,
  saving_throws, skills, features, feats, inventory, equipment,
  spellcasting_ability, spell_slots, spells_known, spells_prepared,
  backstory, personality, ideals, bonds, flaws
) VALUES (
  dm_uuid, campaign_uuid,
  'Felix Quickfoot', 'Halfling', 'Rogue', 1, 'Criminal', 'Chaotic Good',
  '{"str": 8, "dex": 16, "con": 12, "int": 14, "wis": 13, "cha": 10}'::jsonb,
  2, 9, 9, 0, 14, 3, 25,
  '{"str": false, "dex": true, "con": false, "int": true, "wis": false, "cha": false}'::jsonb,
  '{"Acrobatics": {"proficient": true}, "Deception": {"proficient": true}, "Investigation": {"proficient": true}, "Perception": {"proficient": true}, "Sleight of Hand": {"proficient": true}, "Stealth": {"proficient": true, "expertise": true}}'::jsonb,
  '[{"name": "Sneak Attack (1d6)", "description": "Once per turn, deal extra 1d6 damage when you hit with a finesse/ranged weapon AND have advantage OR an ally within 5 ft of the target. This is your big damage dealer!"}, {"name": "Thieves'' Cant", "description": "You know a secret mix of dialect, jargon, and code that lets you hide messages in normal conversation."}, {"name": "Expertise", "description": "Double your proficiency bonus for Stealth and Thieves'' Tools checks."}, {"name": "Lucky (Halfling)", "description": "When you roll a 1 on a d20, you can reroll it. You MUST use the new roll. This is amazing and you should never forget it!"}]'::jsonb,
  '[]'::jsonb,
  '[{"name": "Leather Armor", "type": "armor", "weight": 10, "equipped": true}, {"name": "Shortsword", "type": "weapon", "weight": 2, "damage": "1d6+3 piercing", "equipped": true, "properties": "Finesse"}, {"name": "Shortbow", "type": "weapon", "weight": 2, "damage": "1d6+3 piercing", "properties": "Range (80/320)"}, {"name": "Quiver (20 arrows)", "type": "ammo", "weight": 1}, {"name": "Thieves'' Tools", "type": "tools", "weight": 1}, {"name": "Burglar''s Pack", "type": "gear", "weight": 0}, {"name": "Crowbar", "type": "gear", "weight": 5}, {"name": "Dark common clothes with hood", "type": "gear", "weight": 3}, {"name": "Belt pouch", "type": "gear", "weight": 1, "contains": "15 gp"}]'::jsonb,
  '{"armor": "Leather Armor", "weapon": "Shortsword", "ranged": "Shortbow"}'::jsonb,
  NULL, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb,
  'Felix grew up on the streets of a city far from here, picking pockets and running cons to survive. But Felix always had a code: never steal from anyone who can''t afford it, and always help a kid in trouble. A close call with the law sent Felix on the road, drifting from town to town. Aldermere seemed like a good place to lay low — turns out, it needs someone with Felix''s particular talents.',
  'I always have a plan for what to do when things go wrong. And things ALWAYS go wrong.',
  'Freedom. Everyone should be free to live their own life without being pushed around by bullies.',
  'I''m trying to pay off an old debt I owe to a generous benefactor who saved my life.',
  'When I see something valuable, I can''t help but think about how to steal it. I don''t actually steal it! Usually.'
);

-- ============================================
-- CHARACTER 4: EMBER STORMVANE (Wizard)
-- The Scholar - solves puzzles, big damage spells
-- ============================================
INSERT INTO public.characters (
  user_id, campaign_id, name, race, class, level, background, alignment,
  ability_scores, proficiency_bonus,
  hp_max, hp_current, hp_temp, ac, initiative_bonus, speed,
  saving_throws, skills, features, feats, inventory, equipment,
  spellcasting_ability, spell_slots, spells_known, spells_prepared,
  backstory, personality, ideals, bonds, flaws
) VALUES (
  dm_uuid, campaign_uuid,
  'Ember Stormvane', 'Elf', 'Wizard', 1, 'Sage', 'Neutral Good',
  '{"str": 8, "dex": 14, "con": 13, "int": 16, "wis": 12, "cha": 10}'::jsonb,
  2, 7, 7, 0, 12, 2, 30,
  '{"str": false, "dex": false, "con": false, "int": true, "wis": true, "cha": false}'::jsonb,
  '{"Arcana": {"proficient": true}, "History": {"proficient": true}, "Investigation": {"proficient": true}, "Nature": {"proficient": true}}'::jsonb,
  '[{"name": "Arcane Recovery", "description": "Once per day during a short rest, you can recover one 1st-level spell slot. Like a mini long rest for your magic!"}, {"name": "Spellcasting", "description": "You know 3 cantrips and have 6 spells in your spellbook. You can prepare up to 4 per day. Intelligence is your spellcasting ability. Spell save DC: 13, Spell attack: +5."}, {"name": "Fey Ancestry (Elf)", "description": "You have advantage on saving throws against being charmed, and magic can''t put you to sleep. Very useful against certain fey creatures..."}, {"name": "Darkvision (Elf)", "description": "You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light."}]'::jsonb,
  '[]'::jsonb,
  '[{"name": "Quarterstaff", "type": "weapon", "weight": 4, "damage": "1d6 bludgeoning (1d8 two-handed)", "equipped": true}, {"name": "Arcane Focus (crystal)", "type": "focus", "weight": 1, "equipped": true}, {"name": "Spellbook", "type": "gear", "weight": 3}, {"name": "Scholar''s Pack", "type": "gear", "weight": 0}, {"name": "Bottle of black ink", "type": "gear", "weight": 0}, {"name": "Quill", "type": "gear", "weight": 0}, {"name": "Small knife", "type": "gear", "weight": 0}, {"name": "Letter from dead colleague", "type": "trinket", "weight": 0, "description": "A letter asking you to investigate strange magical disturbances near Mirror Lake"}, {"name": "Common clothes", "type": "gear", "weight": 3}, {"name": "Belt pouch", "type": "gear", "weight": 1, "contains": "10 gp"}]'::jsonb,
  '{"weapon": "Quarterstaff", "focus": "Arcane Focus"}'::jsonb,
  'int',
  '{"1": {"max": 2, "used": 0}}'::jsonb,
  '["Fire Bolt", "Mage Hand", "Light", "Magic Missile", "Shield", "Detect Magic", "Thunderwave", "Sleep", "Find Familiar"]'::jsonb,
  '["Magic Missile", "Shield", "Detect Magic", "Sleep"]'::jsonb,
  'Ember has spent decades (elves live a long time) studying at the Academy of the Silver Quill, specializing in fey magic and planar bindings. When a colleague sent a letter about strange magical disturbances near Mirror Lake — then stopped writing entirely — Ember set out to investigate. The letter mentioned water lilies growing in impossible places and a presence beneath the lake that felt ancient. Ember suspects fey involvement.',
  'I use polysyllabic words that convey the impression of great erudition. Also, I''m endlessly fascinated by anything magical.',
  'Knowledge. The path to power and self-improvement is through knowledge.',
  'My colleague who wrote to me about Mirror Lake has gone silent. I need to find out what happened to them.',
  'I am easily distracted by the promise of new magical knowledge. "Ooh, what does THIS rune mean?"'
);

-- ============================================
-- CHARACTER 5: KAEL IRONFANG (Ranger)
-- The Tracker - good at exploring, ranged combat
-- ============================================
INSERT INTO public.characters (
  user_id, campaign_id, name, race, class, level, background, alignment,
  ability_scores, proficiency_bonus,
  hp_max, hp_current, hp_temp, ac, initiative_bonus, speed,
  saving_throws, skills, features, feats, inventory, equipment,
  spellcasting_ability, spell_slots, spells_known, spells_prepared,
  backstory, personality, ideals, bonds, flaws
) VALUES (
  dm_uuid, campaign_uuid,
  'Kael Ironfang', 'Half-Orc', 'Ranger', 1, 'Outlander', 'Chaotic Good',
  '{"str": 14, "dex": 15, "con": 13, "int": 10, "wis": 14, "cha": 8}'::jsonb,
  2, 11, 11, 0, 14, 2, 30,
  '{"str": true, "dex": true, "con": false, "int": false, "wis": false, "cha": false}'::jsonb,
  '{"Animal Handling": {"proficient": true}, "Nature": {"proficient": true}, "Perception": {"proficient": true}, "Stealth": {"proficient": true}, "Survival": {"proficient": true}, "Athletics": {"proficient": true}}'::jsonb,
  '[{"name": "Favored Enemy: Fey", "description": "You have advantage on Survival checks to track fey creatures, and Intelligence checks to recall information about them. Very relevant to this adventure!"}, {"name": "Natural Explorer: Forest", "description": "In forest terrain: difficult terrain doesn''t slow your group, you can''t become lost (except by magic), you stay alert to danger even when doing other things, you can move stealthily at normal pace, you find twice as much food when foraging, and you learn exact details of creatures you track."}, {"name": "Relentless Endurance (Half-Orc)", "description": "When you drop to 0 HP but aren''t killed outright, you drop to 1 HP instead. Once per long rest. This is your ''cheat death'' button!"}, {"name": "Savage Attacks (Half-Orc)", "description": "When you score a critical hit with a melee weapon, roll one extra damage die and add it to the total."}]'::jsonb,
  '[]'::jsonb,
  '[{"name": "Scale Mail", "type": "armor", "weight": 45, "equipped": true}, {"name": "Longbow", "type": "weapon", "weight": 2, "damage": "1d8+2 piercing", "properties": "Range (150/600)", "equipped": true}, {"name": "Two Shortswords", "type": "weapon", "weight": 4, "damage": "1d6+2 piercing each", "properties": "Finesse, light"}, {"name": "Quiver (20 arrows)", "type": "ammo", "weight": 1}, {"name": "Explorer''s Pack", "type": "gear", "weight": 0}, {"name": "Hunting trap", "type": "gear", "weight": 25}, {"name": "Trophy (fey wing, preserved)", "type": "trinket", "weight": 0}, {"name": "Traveler''s clothes", "type": "gear", "weight": 4}, {"name": "Staff (walking stick)", "type": "gear", "weight": 4}, {"name": "Belt pouch", "type": "gear", "weight": 1, "contains": "10 gp"}]'::jsonb,
  '{"armor": "Scale Mail", "weapon": "Longbow", "melee": "Two Shortswords"}'::jsonb,
  NULL, '{}'::jsonb, '[]'::jsonb, '[]'::jsonb,
  'Kael has lived in the Greenvale forests for years, preferring the company of animals to people. But the forest has been wrong lately — animals fleeing from the direction of Mirror Lake, plants wilting in circles, and fey signs appearing where none have been seen in generations. The preserved wing of a sprite that Kael found as a child has started glowing faintly at night. Something ancient is stirring, and Kael means to find out what.',
  'I watch over my friends as if they were a litter of newborn pups. Also, I was raised by wolves. Well, not literally, but close enough.',
  'Nature. The natural world is more important than the constructions of civilization.',
  'The forest near Mirror Lake is my home. If something threatens it, it threatens me.',
  'I''m slow to trust members of other races. I''m working on it, but it''s... a process.'
);

RAISE NOTICE 'All 5 premade characters created! Campaign: %', campaign_uuid;
RAISE NOTICE 'Characters: Rowan (Fighter), Thistle (Cleric), Felix (Rogue), Ember (Wizard), Kael (Ranger)';
RAISE NOTICE 'All characters are owned by you (DM). When a player claims one, update user_id in the characters table.';

END $$;
