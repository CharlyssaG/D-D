'use client';

import { useState, useMemo } from 'react';

export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[];
  ritual: boolean;
  concentration: boolean;
}

// Core SRD spells - enough to get started, expandable
export const SRD_SPELLS: Spell[] = [
  // Cantrips (Level 0)
  { name: 'Fire Bolt', level: 0, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack. On hit, deal 1d10 fire damage. Scales at 5th (2d10), 11th (3d10), 17th (4d10).', classes: ['Sorcerer', 'Wizard'], ritual: false, concentration: false },
  { name: 'Sacred Flame', level: 0, school: 'Evocation', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', description: 'Flame-like radiance descends on a creature. DEX save or take 1d8 radiant damage. No benefit from cover. Scales at 5th (2d8), 11th (3d8), 17th (4d8).', classes: ['Cleric'], ritual: false, concentration: false },
  { name: 'Eldritch Blast', level: 0, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'A beam of crackling energy. Make a ranged spell attack, deal 1d10 force damage. Additional beams at 5th (2), 11th (3), 17th (4).', classes: ['Warlock'], ritual: false, concentration: false },
  { name: 'Mage Hand', level: 0, school: 'Conjuration', castingTime: '1 action', range: '30 feet', components: 'V, S', duration: '1 minute', description: 'A spectral hand appears. Use it to manipulate objects, open doors, stow items. Cannot attack, activate magic items, or carry more than 10 pounds.', classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'], ritual: false, concentration: false },
  { name: 'Light', level: 0, school: 'Evocation', castingTime: '1 action', range: 'Touch', components: 'V, M', duration: '1 hour', description: 'You touch an object no larger than 10 feet. It sheds bright light in 20-foot radius, dim light 20 feet beyond. Can be colored. Hostile creature gets DEX save.', classes: ['Bard', 'Cleric', 'Sorcerer', 'Wizard'], ritual: false, concentration: false },
  { name: 'Minor Illusion', level: 0, school: 'Illusion', castingTime: '1 action', range: '30 feet', components: 'S, M', duration: '1 minute', description: 'Create a sound or image of an object within range. Sound can be your voice, a lion roar, etc. Image must fit in a 5-foot cube. Investigation check to see through it.', classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'], ritual: false, concentration: false },
  { name: 'Prestidigitation', level: 0, school: 'Transmutation', castingTime: '1 action', range: '10 feet', components: 'V, S', duration: 'Up to 1 hour', description: 'Minor magical trick. Create sensory effects, light/snuff candle, clean/soil objects, warm/chill/flavor, make a mark or trinket. Up to 3 non-instantaneous effects at once.', classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'], ritual: false, concentration: false },
  { name: 'Vicious Mockery', level: 0, school: 'Enchantment', castingTime: '1 action', range: '60 feet', components: 'V', duration: 'Instantaneous', description: 'You unleash a string of insults at a creature. WIS save or take 1d4 psychic damage and have disadvantage on next attack roll. Scales at 5th (2d4), 11th (3d4), 17th (4d4).', classes: ['Bard'], ritual: false, concentration: false },
  { name: 'Thaumaturgy', level: 0, school: 'Transmutation', castingTime: '1 action', range: '30 feet', components: 'V', duration: 'Up to 1 minute', description: 'Minor divine wonder: boom your voice, cause flames to flicker, cause tremors, create sounds, swing doors open/shut, change eye appearance. Up to 3 effects at once.', classes: ['Cleric'], ritual: false, concentration: false },
  { name: 'Druidcraft', level: 0, school: 'Transmutation', castingTime: '1 action', range: '30 feet', components: 'V, S', duration: 'Instantaneous', description: 'Create a tiny sensory effect predicting weather, bloom/wilt a flower, create harmless sensory effects (leaf fall, wind puff, animal sound), light or snuff a small flame.', classes: ['Druid'], ritual: false, concentration: false },

  // Level 1
  { name: 'Magic Missile', level: 1, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'Three glowing darts of force strike targets automatically. Each dart deals 1d4+1 force damage. One extra dart per level above 1st.', classes: ['Sorcerer', 'Wizard'], ritual: false, concentration: false },
  { name: 'Shield', level: 1, school: 'Abjuration', castingTime: '1 reaction', range: 'Self', components: 'V, S', duration: '1 round', description: 'An invisible barrier grants +5 AC until start of your next turn, including against the triggering attack. Also blocks magic missile.', classes: ['Sorcerer', 'Wizard'], ritual: false, concentration: false },
  { name: 'Cure Wounds', level: 1, school: 'Evocation', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Instantaneous', description: 'A creature you touch regains 1d8 + spellcasting modifier hit points. No effect on undead or constructs. +1d8 per level above 1st.', classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'], ritual: false, concentration: false },
  { name: 'Healing Word', level: 1, school: 'Evocation', castingTime: '1 bonus action', range: '60 feet', components: 'V', duration: 'Instantaneous', description: 'A creature within range regains 1d4 + spellcasting modifier hit points. +1d4 per level above 1st.', classes: ['Bard', 'Cleric', 'Druid'], ritual: false, concentration: false },
  { name: 'Thunderwave', level: 1, school: 'Evocation', castingTime: '1 action', range: 'Self (15-foot cube)', components: 'V, S', duration: 'Instantaneous', description: 'A wave of thunderous force sweeps out. Each creature in 15-foot cube makes CON save. Fail: 2d8 thunder damage, pushed 10 feet. Pass: half damage, not pushed. +1d8 per level above 1st.', classes: ['Bard', 'Druid', 'Sorcerer', 'Wizard'], ritual: false, concentration: false },
  { name: 'Detect Magic', level: 1, school: 'Divination', castingTime: '1 action', range: 'Self', components: 'V, S', duration: 'Concentration, up to 10 minutes', description: 'Sense the presence of magic within 30 feet. You can see a faint aura around any visible creature or object with magic, and learn its school.', classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'], ritual: true, concentration: true },
  { name: 'Guiding Bolt', level: 1, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: '1 round', description: 'A flash of light streaks toward a creature. Make a ranged spell attack. Hit: 4d6 radiant damage and next attack roll against target has advantage. +1d6 per level above 1st.', classes: ['Cleric'], ritual: false, concentration: false },
  { name: 'Bless', level: 1, school: 'Enchantment', castingTime: '1 action', range: '30 feet', components: 'V, S, M', duration: 'Concentration, up to 1 minute', description: 'Up to three creatures add 1d4 to attack rolls and saving throws for the duration. +1 creature per level above 1st.', classes: ['Cleric', 'Paladin'], ritual: false, concentration: true },
  { name: 'Hex', level: 1, school: 'Enchantment', castingTime: '1 bonus action', range: '90 feet', components: 'V, S, M', duration: 'Concentration, up to 1 hour', description: 'Curse a creature. Deal extra 1d6 necrotic damage whenever you hit it with an attack. Choose one ability — target has disadvantage on checks with that ability.', classes: ['Warlock'], ritual: false, concentration: true },
  { name: 'Hunter\'s Mark', level: 1, school: 'Divination', castingTime: '1 bonus action', range: '90 feet', components: 'V', duration: 'Concentration, up to 1 hour', description: 'Mark a creature as quarry. Deal extra 1d6 damage whenever you hit it with a weapon attack. Advantage on Perception/Survival checks to find it.', classes: ['Ranger'], ritual: false, concentration: true },

  // Level 2
  { name: 'Misty Step', level: 2, school: 'Conjuration', castingTime: '1 bonus action', range: 'Self', components: 'V', duration: 'Instantaneous', description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see.', classes: ['Sorcerer', 'Warlock', 'Wizard'], ritual: false, concentration: false },
  { name: 'Spiritual Weapon', level: 2, school: 'Evocation', castingTime: '1 bonus action', range: '60 feet', components: 'V, S', duration: '1 minute', description: 'Create a floating spectral weapon. Make a melee spell attack for 1d8 + spellcasting mod force damage. Move weapon 20 feet and attack as bonus action each turn.', classes: ['Cleric'], ritual: false, concentration: false },
  { name: 'Hold Person', level: 2, school: 'Enchantment', castingTime: '1 action', range: '60 feet', components: 'V, S, M', duration: 'Concentration, up to 1 minute', description: 'Choose a humanoid within range. WIS save or be paralyzed. Repeat save at end of each turn. +1 target per level above 2nd.', classes: ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Warlock', 'Wizard'], ritual: false, concentration: true },
  { name: 'Scorching Ray', level: 2, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'Create three rays of fire. Make a ranged spell attack for each. Hit: 2d6 fire damage per ray. +1 ray per level above 2nd.', classes: ['Sorcerer', 'Wizard'], ritual: false, concentration: false },

  // Level 3
  { name: 'Fireball', level: 3, school: 'Evocation', castingTime: '1 action', range: '150 feet', components: 'V, S, M', duration: 'Instantaneous', description: 'A bright streak explodes in a 20-foot-radius sphere. Each creature makes DEX save. Fail: 8d6 fire damage. Pass: half damage. Ignites flammable objects. +1d6 per level above 3rd.', classes: ['Sorcerer', 'Wizard'], ritual: false, concentration: false },
  { name: 'Counterspell', level: 3, school: 'Abjuration', castingTime: '1 reaction', range: '60 feet', components: 'S', duration: 'Instantaneous', description: 'You attempt to interrupt a creature casting a spell. If 3rd level or lower, it automatically fails. Higher: ability check DC 10 + spell level.', classes: ['Sorcerer', 'Warlock', 'Wizard'], ritual: false, concentration: false },
  { name: 'Revivify', level: 3, school: 'Necromancy', castingTime: '1 action', range: 'Touch', components: 'V, S, M (300gp diamond)', duration: 'Instantaneous', description: 'Touch a creature that died within the last minute. It returns to life with 1 HP. Cannot restore missing body parts or cure effects that caused death.', classes: ['Cleric', 'Paladin'], ritual: false, concentration: false },
  { name: 'Spirit Guardians', level: 3, school: 'Conjuration', castingTime: '1 action', range: 'Self (15-foot radius)', components: 'V, S, M', duration: 'Concentration, up to 10 minutes', description: 'Spirits fly around you in a 15-foot radius. Enemies entering or starting their turn there make WIS save: fail 3d8 radiant/necrotic damage, pass half. Halves enemy speed.', classes: ['Cleric'], ritual: false, concentration: true },

  // Level 4
  { name: 'Greater Invisibility', level: 4, school: 'Illusion', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Concentration, up to 1 minute', description: 'You or a creature you touch becomes invisible for the duration. Unlike regular Invisibility, this does not end when the target attacks or casts a spell.', classes: ['Bard', 'Sorcerer', 'Wizard'], ritual: false, concentration: true },
  { name: 'Banishment', level: 4, school: 'Abjuration', castingTime: '1 action', range: '60 feet', components: 'V, S, M', duration: 'Concentration, up to 1 minute', description: 'CHA save or be banished to a harmless demiplane. If native to a different plane and concentration lasts full duration, target stays banished. +1 creature per level above 4th.', classes: ['Cleric', 'Paladin', 'Sorcerer', 'Warlock', 'Wizard'], ritual: false, concentration: true },

  // Level 5
  { name: 'Mass Cure Wounds', level: 5, school: 'Evocation', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', description: 'Choose up to 6 creatures in a 30-foot-radius sphere. Each regains 3d8 + spellcasting modifier HP. No effect on undead or constructs. +1d8 per level above 5th.', classes: ['Bard', 'Cleric', 'Druid'], ritual: false, concentration: false },
  { name: 'Wall of Force', level: 5, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S, M', duration: 'Concentration, up to 10 minutes', description: 'An invisible wall of force. Up to ten 10-by-10-foot panels. Nothing can physically pass through. Immune to all damage. Disintegrate destroys it.', classes: ['Wizard'], ritual: false, concentration: true },
];

interface SpellListProps {
  characterClass?: string;
  maxLevel?: number;
  onSelectSpell?: (spell: Spell) => void;
  preparedSpells?: string[];
  onTogglePrepared?: (spellName: string) => void;
}

export function SpellList({ characterClass, maxLevel = 9, onSelectSpell, preparedSpells = [], onTogglePrepared }: SpellListProps) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  const filteredSpells = useMemo(() => {
    return SRD_SPELLS.filter((spell) => {
      if (characterClass && !spell.classes.includes(characterClass)) return false;
      if (levelFilter !== null && spell.level !== levelFilter) return false;
      if (schoolFilter && spell.school !== schoolFilter) return false;
      if (spell.level > maxLevel) return false;
      if (search && !spell.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [characterClass, levelFilter, schoolFilter, maxLevel, search]);

  const schools = [...new Set(SRD_SPELLS.map((s) => s.school))].sort();
  const levels = [...new Set(SRD_SPELLS.filter((s) => !characterClass || s.classes.includes(characterClass)).map((s) => s.level))].sort();

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-parchment mb-3"
        placeholder="Search spells..."
      />

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setLevelFilter(null)}
          className={`px-3 py-1 rounded-lg text-sm font-heading font-semibold transition-all ${
            levelFilter === null ? 'bg-accent-burgundy text-parchment-light' : 'bg-parchment-dark text-ink-dark'
          }`}
        >
          All Levels
        </button>
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl === levelFilter ? null : lvl)}
            className={`px-3 py-1 rounded-lg text-sm font-heading font-semibold transition-all ${
              levelFilter === lvl ? 'bg-accent-burgundy text-parchment-light' : 'bg-parchment-dark text-ink-dark'
            }`}
          >
            {lvl === 0 ? 'Cantrips' : `Lvl ${lvl}`}
          </button>
        ))}
      </div>

      {/* Spell List */}
      <div className="space-y-2 max-h-96 overflow-y-auto scroll-styled">
        {filteredSpells.length === 0 ? (
          <p className="text-ink-medium text-center py-4">No spells found</p>
        ) : (
          filteredSpells.map((spell) => (
            <div key={spell.name} className="bg-parchment-light rounded-lg border border-accent-amber/20 overflow-hidden">
              <button
                onClick={() => setExpandedSpell(expandedSpell === spell.name ? null : spell.name)}
                className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-parchment-dark/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {onTogglePrepared && (
                    <input
                      type="checkbox"
                      checked={preparedSpells.includes(spell.name)}
                      onChange={(e) => { e.stopPropagation(); onTogglePrepared(spell.name); }}
                      className="w-4 h-4"
                    />
                  )}
                  <div>
                    <span className="font-heading font-semibold text-ink-dark">{spell.name}</span>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs text-ink-light">
                        {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
                      </span>
                      <span className="text-xs text-ink-light">{spell.school}</span>
                      {spell.concentration && <span className="text-xs text-accent-burgundy font-semibold">C</span>}
                      {spell.ritual && <span className="text-xs text-accent-forest font-semibold">R</span>}
                    </div>
                  </div>
                </div>
                <span className="text-ink-light text-sm">{expandedSpell === spell.name ? '▲' : '▼'}</span>
              </button>

              {expandedSpell === spell.name && (
                <div className="px-4 pb-4 border-t border-accent-amber/20 pt-3">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><span className="text-ink-light">Casting Time:</span> <span className="text-ink-dark">{spell.castingTime}</span></div>
                    <div><span className="text-ink-light">Range:</span> <span className="text-ink-dark">{spell.range}</span></div>
                    <div><span className="text-ink-light">Components:</span> <span className="text-ink-dark">{spell.components}</span></div>
                    <div><span className="text-ink-light">Duration:</span> <span className="text-ink-dark">{spell.duration}</span></div>
                  </div>
                  <p className="text-sm text-ink-dark leading-relaxed">{spell.description}</p>
                  <div className="mt-2 text-xs text-ink-light">
                    Classes: {spell.classes.join(', ')}
                  </div>
                  {onSelectSpell && (
                    <button
                      onClick={() => onSelectSpell(spell)}
                      className="btn-secondary text-sm mt-3"
                    >
                      Add to Character
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Spell Slot Tracker component
interface SpellSlotTrackerProps {
  slots: Record<string, { max: number; used: number }>;
  onUseSlot: (level: string) => void;
  onRestoreSlot: (level: string) => void;
  onLongRest: () => void;
}

export function SpellSlotTracker({ slots, onUseSlot, onRestoreSlot, onLongRest }: SpellSlotTrackerProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-semibold text-ink-dark">Spell Slots</h3>
        <button onClick={onLongRest} className="btn-secondary text-sm py-1 px-3">
          Long Rest (restore all)
        </button>
      </div>
      <div className="space-y-3">
        {Object.entries(slots)
          .filter(([_, data]) => data.max > 0)
          .map(([level, data]) => (
            <div key={level} className="flex items-center gap-3">
              <span className="text-sm font-heading font-semibold text-ink-medium w-16">
                Level {level}
              </span>
              <div className="flex gap-1 flex-1">
                {Array.from({ length: data.max }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => i < data.max - data.used ? onUseSlot(level) : onRestoreSlot(level)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      i < data.max - data.used
                        ? 'bg-accent-burgundy border-accent-burgundy/50 hover:bg-accent-burgundy/80'
                        : 'bg-parchment-dark border-ink-light/30 hover:bg-parchment'
                    }`}
                    title={i < data.max - data.used ? 'Click to use' : 'Click to restore'}
                  />
                ))}
              </div>
              <span className="text-sm text-ink-medium w-12 text-right">
                {data.max - data.used}/{data.max}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
