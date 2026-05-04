'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DiceRoller from '@/components/DiceRoller';
import AbilityChecks from '@/components/AbilityChecks';
import PortraitUpload from '@/components/PortraitUpload';
import { SpellList, SpellSlotTracker } from '@/components/SpellSystem';

type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

const ABILITY_NAMES: Record<AbilityKey, string> = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
};

const CONDITIONS = [
  'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
  'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
  'Prone', 'Restrained', 'Stunned', 'Unconscious', 'Exhaustion',
];

// Default spell slots by class level (simplified for level 1-5)
function getDefaultSpellSlots(charClass: string, level: number): Record<string, { max: number; used: number }> {
  const fullCaster = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'];
  const halfCaster = ['Paladin', 'Ranger'];
  const pactCaster = ['Warlock'];

  if (!charClass) return {};

  if (fullCaster.includes(charClass)) {
    const slots: Record<number, Record<string, number>> = {
      1: { '1': 2 }, 2: { '1': 3 }, 3: { '1': 4, '2': 2 },
      4: { '1': 4, '2': 3 }, 5: { '1': 4, '2': 3, '3': 2 },
    };
    const s = slots[Math.min(level, 5)] || {};
    return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { max: v, used: 0 }]));
  }

  if (halfCaster.includes(charClass) && level >= 2) {
    const slots: Record<number, Record<string, number>> = {
      2: { '1': 2 }, 3: { '1': 3 }, 4: { '1': 3 }, 5: { '1': 4, '2': 2 },
    };
    const s = slots[Math.min(level, 5)] || {};
    return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { max: v, used: 0 }]));
  }

  if (pactCaster.includes(charClass)) {
    const slots: Record<number, Record<string, number>> = {
      1: { '1': 1 }, 2: { '1': 2 }, 3: { '2': 2 }, 4: { '2': 2 }, 5: { '3': 2 },
    };
    const s = slots[Math.min(level, 5)] || {};
    return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { max: v, used: 0 }]));
  }

  return {};
}

export default function CharacterPage() {
  const { user } = useAuth();
  const params = useParams();
  const supabase = createClient();
  const [character, setCharacter] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'spells' | 'inventory' | 'notes' | 'dice'>('stats');
  const [spellSlots, setSpellSlots] = useState<Record<string, { max: number; used: number }>>({});
  const [preparedSpells, setPreparedSpells] = useState<string[]>([]);
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [deathSaves, setDeathSaves] = useState({ successes: 0, failures: 0 });
  const [showConditions, setShowConditions] = useState(false);

  useEffect(() => {
    loadCharacter();
  }, [params.id]);

  const loadCharacter = async () => {
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) {
      setCharacter(data);
      setSpellSlots(data.spell_slots || getDefaultSpellSlots(data.class, data.level));
      setPreparedSpells(data.spells_prepared || []);
      setActiveConditions(data.conditions || []);
      setDeathSaves(data.death_saves || { successes: 0, failures: 0 });
    }
    setLoading(false);
  };

  const updateCharacter = async (updates: Record<string, any>) => {
    if (!character) return;
    await supabase.from('characters').update(updates).eq('id', character.id);
    setCharacter({ ...character, ...updates });
  };

  const updateHP = async (amount: number) => {
    if (!character) return;
    const newHP = Math.max(0, Math.min(character.hp_max, character.hp_current + amount));
    await updateCharacter({ hp_current: newHP });
  };

  const toggleCondition = (condition: string) => {
    const newConditions = activeConditions.includes(condition)
      ? activeConditions.filter((c) => c !== condition)
      : [...activeConditions, condition];
    setActiveConditions(newConditions);
    updateCharacter({ conditions: newConditions });
  };

  const handleDeathSave = (type: 'success' | 'failure') => {
    const newSaves = { ...deathSaves };
    if (type === 'success') newSaves.successes = Math.min(3, newSaves.successes + 1);
    else newSaves.failures = Math.min(3, newSaves.failures + 1);
    setDeathSaves(newSaves);
    updateCharacter({ death_saves: newSaves });
  };

  const resetDeathSaves = () => {
    const reset = { successes: 0, failures: 0 };
    setDeathSaves(reset);
    updateCharacter({ death_saves: reset });
  };

  const useSpellSlot = (level: string) => {
    const slot = spellSlots[level];
    if (!slot || slot.used >= slot.max) return;
    const newSlots = { ...spellSlots, [level]: { ...slot, used: slot.used + 1 } };
    setSpellSlots(newSlots);
    updateCharacter({ spell_slots: newSlots });
  };

  const restoreSpellSlot = (level: string) => {
    const slot = spellSlots[level];
    if (!slot || slot.used <= 0) return;
    const newSlots = { ...spellSlots, [level]: { ...slot, used: slot.used - 1 } };
    setSpellSlots(newSlots);
    updateCharacter({ spell_slots: newSlots });
  };

  const longRest = () => {
    // Restore HP and all spell slots
    const newSlots = Object.fromEntries(
      Object.entries(spellSlots).map(([k, v]) => [k, { ...v, used: 0 }])
    );
    setSpellSlots(newSlots);
    resetDeathSaves();
    updateCharacter({
      hp_current: character?.hp_max,
      spell_slots: newSlots,
      death_saves: { successes: 0, failures: 0 },
    });
  };

  const togglePreparedSpell = (spellName: string) => {
    const newPrepared = preparedSpells.includes(spellName)
      ? preparedSpells.filter((s) => s !== spellName)
      : [...preparedSpells, spellName];
    setPreparedSpells(newPrepared);
    updateCharacter({ spells_prepared: newPrepared });
  };

  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-medium font-heading text-xl">Loading character...</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-parchment text-center">
          <p className="text-ink-medium mb-4">Character not found</p>
          <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const hpPercent = Math.round((character.hp_current / character.hp_max) * 100);
  const abilities = (character.ability_scores || {}) as Record<AbilityKey, number>;
  const isOwner = user?.id === character.user_id;

  const TABS = [
    { key: 'stats' as const, label: 'Stats & Skills' },
    { key: 'spells' as const, label: 'Spells' },
    { key: 'inventory' as const, label: 'Inventory' },
    { key: 'notes' as const, label: 'Notes' },
    { key: 'dice' as const, label: 'Dice' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-accent-amber/30">
        <Link href="/" className="font-accent text-xl text-accent-burgundy">Campaign Manager</Link>
        <div className="flex items-center gap-4">
          <Link href={`/character/${params.id}/focus`} className="bg-accent-burgundy text-parchment-light text-sm py-1.5 px-4 rounded-lg font-heading font-semibold hover:bg-accent-burgundy/90 transition-colors">
            Focus Mode
          </Link>
          <Link href="/dashboard" className="text-sm text-ink-medium hover:text-ink-dark transition-colors font-heading">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto w-full p-6">
        {/* Character Header */}
        <div className="card-parchment corner-flourish mb-6">
          <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
            {isOwner ? (
              <PortraitUpload
                characterId={character.id}
                currentPortraitUrl={character.portrait_url}
                characterName={character.name}
                onUpload={(url) => setCharacter({ ...character, portrait_url: url })}
                size={112}
              />
            ) : (
              <div className="portrait-frame w-28 h-28 flex-shrink-0">
                {character.portrait_url ? (
                  <img src={character.portrait_url} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent-amber/20 flex items-center justify-center">
                    <span className="text-4xl font-accent text-ink-medium">{character.name?.charAt(0)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-heading font-semibold text-ink-dark mb-1">{character.name}</h1>
              <p className="text-lg text-ink-medium mb-3">Level {character.level} {character.race} {character.class}</p>

              {/* Active Conditions */}
              {activeConditions.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {activeConditions.map((c) => (
                    <button key={c} onClick={() => toggleCondition(c)} className="condition-badge negative" title="Click to remove">
                      {c} ✕
                    </button>
                  ))}
                </div>
              )}

              {/* HP Section */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-ink-medium">Hit Points</span>
                  <span className="text-sm font-mono text-ink-dark">{character.hp_current} / {character.hp_max}</span>
                </div>
                <div className="hp-bar">
                  <div
                    className={`hp-bar-fill ${hpPercent > 50 ? 'healthy' : hpPercent > 25 ? 'wounded' : 'critical'}`}
                    style={{ width: `${Math.min(hpPercent, 100)}%` }}
                  />
                </div>
                {isOwner && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateHP(-5)} className="btn-secondary text-sm py-1 px-3">-5</button>
                    <button onClick={() => updateHP(-1)} className="btn-secondary text-sm py-1 px-3">-1</button>
                    <button onClick={() => updateHP(1)} className="btn-secondary text-sm py-1 px-3">+1</button>
                    <button onClick={() => updateHP(5)} className="btn-secondary text-sm py-1 px-3">+5</button>
                    <button onClick={longRest} className="btn-secondary text-sm py-1 px-3 ml-auto">Long Rest</button>
                    <button onClick={() => setShowConditions(!showConditions)} className="btn-secondary text-sm py-1 px-3">
                      Conditions
                    </button>
                  </div>
                )}
              </div>

              {/* Death Saves (shown when HP is 0) */}
              {character.hp_current === 0 && (
                <div className="bg-accent-burgundy/10 rounded-lg p-3 border border-accent-burgundy/20 mb-3">
                  <h4 className="text-sm font-heading font-semibold text-accent-burgundy mb-2">Death Saves</h4>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-medium">Successes:</span>
                      {[0, 1, 2].map((i) => (
                        <button key={i} onClick={() => handleDeathSave('success')}
                          className={`w-5 h-5 rounded-full border-2 ${i < deathSaves.successes ? 'bg-accent-forest border-accent-forest' : 'border-ink-light/30'}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-medium">Failures:</span>
                      {[0, 1, 2].map((i) => (
                        <button key={i} onClick={() => handleDeathSave('failure')}
                          className={`w-5 h-5 rounded-full border-2 ${i < deathSaves.failures ? 'bg-accent-burgundy border-accent-burgundy' : 'border-ink-light/30'}`}
                        />
                      ))}
                    </div>
                    <button onClick={resetDeathSaves} className="text-xs text-ink-light hover:text-ink-dark ml-auto">Reset</button>
                  </div>
                </div>
              )}

              {/* Conditions Dropdown */}
              {showConditions && (
                <div className="bg-parchment-light rounded-lg p-3 border border-accent-amber/20 mb-3">
                  <div className="flex gap-1 flex-wrap">
                    {CONDITIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleCondition(c)}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                          activeConditions.includes(c)
                            ? 'bg-accent-burgundy text-parchment-light'
                            : 'bg-parchment-dark text-ink-dark hover:bg-parchment-dark/80'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex gap-6 flex-wrap">
                <div className="text-center">
                  <div className="text-2xl font-heading font-semibold text-accent-burgundy">{character.ac}</div>
                  <div className="text-xs text-ink-medium uppercase tracking-wide">AC</div>
                </div>
                <div className="border-l-2 border-accent-amber/30 pl-6 text-center">
                  <div className="text-2xl font-heading font-semibold text-accent-burgundy">{formatMod(getMod(abilities.dex || 10))}</div>
                  <div className="text-xs text-ink-medium uppercase tracking-wide">Initiative</div>
                </div>
                <div className="border-l-2 border-accent-amber/30 pl-6 text-center">
                  <div className="text-2xl font-heading font-semibold text-accent-burgundy">{character.speed || 30} ft</div>
                  <div className="text-xs text-ink-medium uppercase tracking-wide">Speed</div>
                </div>
                <div className="border-l-2 border-accent-amber/30 pl-6 text-center">
                  <div className="text-2xl font-heading font-semibold text-accent-burgundy">+{character.proficiency_bonus || 2}</div>
                  <div className="text-xs text-ink-medium uppercase tracking-wide">Prof.</div>
                </div>
                <div className="border-l-2 border-accent-amber/30 pl-6 text-center">
                  <div className="text-2xl font-heading font-semibold text-accent-burgundy">{10 + getMod(abilities.wis || 10)}</div>
                  <div className="text-xs text-ink-medium uppercase tracking-wide">Pass. Perc.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 font-heading font-semibold rounded-lg transition-all text-sm ${
                activeTab === tab.key
                  ? 'bg-accent-burgundy text-parchment-light shadow-raised'
                  : 'bg-parchment text-ink-dark border-2 border-accent-amber/30 hover:bg-parchment-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ability Scores */}
            <div className="card-parchment">
              <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
                Ability Scores
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {(Object.keys(ABILITY_NAMES) as AbilityKey[]).map((key) => (
                  <div key={key} className="text-center">
                    <div className="bg-parchment-dark rounded-lg p-3 shadow-inset-soft">
                      <div className="text-xs uppercase tracking-wide text-ink-medium mb-1 font-semibold">{key}</div>
                      <div className="text-3xl font-heading font-semibold text-accent-burgundy">{formatMod(getMod(abilities[key] || 10))}</div>
                      <div className="text-sm text-ink-light mt-1">{abilities[key] || 10}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Character Details */}
              <div className="space-y-2 text-sm border-t-2 border-accent-amber/30 pt-4">
                <div className="flex justify-between"><span className="text-ink-medium">Background</span><span className="font-semibold">{character.background || 'None'}</span></div>
                <div className="flex justify-between"><span className="text-ink-medium">Alignment</span><span className="font-semibold">{character.alignment || 'Unaligned'}</span></div>
              </div>
            </div>

            {/* Skills & Saves */}
            <div className="card-parchment">
              <AbilityChecks
                abilityScores={abilities}
                proficiencyBonus={character.proficiency_bonus || 2}
                proficientSkills={character.skills ? Object.keys(character.skills).filter((k: string) => character.skills[k]?.proficient) : []}
                proficientSaves={character.saving_throws ? (Object.keys(character.saving_throws) as AbilityKey[]).filter((k) => character.saving_throws[k]) : []}
              />
            </div>
          </div>
        )}

        {/* Spells Tab */}
        {activeTab === 'spells' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-parchment">
              <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
                Spell Slots
              </h2>
              {Object.keys(spellSlots).length > 0 ? (
                <SpellSlotTracker
                  slots={spellSlots}
                  onUseSlot={useSpellSlot}
                  onRestoreSlot={restoreSpellSlot}
                  onLongRest={longRest}
                />
              ) : (
                <p className="text-ink-medium text-sm">
                  {['Barbarian', 'Fighter', 'Monk', 'Rogue'].includes(character.class)
                    ? 'This class does not use spell slots.'
                    : 'Spell slots will appear at the appropriate level.'}
                </p>
              )}
            </div>

            <div className="card-parchment">
              <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
                {character.class} Spells
              </h2>
              <SpellList
                characterClass={character.class}
                maxLevel={Math.ceil(character.level / 2)}
                preparedSpells={preparedSpells}
                onTogglePrepared={isOwner ? togglePreparedSpell : undefined}
              />
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="card-parchment text-center py-12">
            <h2 className="text-xl font-heading font-semibold text-ink-dark mb-2">Equipment &amp; Inventory</h2>
            <p className="text-ink-medium">Inventory management coming in the next update!</p>
            <p className="text-sm text-ink-light mt-2">Drag-and-drop items, weight tracking, attunement slots, and equipped items.</p>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="card-parchment">
            <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
              Character Notes
            </h2>
            {character.personality && (
              <div className="mb-4">
                <h3 className="text-sm font-heading font-semibold text-ink-medium mb-1">Personality Traits</h3>
                <p className="text-ink-dark">{character.personality}</p>
              </div>
            )}
            {character.backstory && (
              <div>
                <h3 className="text-sm font-heading font-semibold text-ink-medium mb-1">Backstory</h3>
                <p className="text-ink-dark leading-relaxed">{character.backstory}</p>
              </div>
            )}
            {!character.personality && !character.backstory && (
              <p className="text-ink-medium">No notes yet. Edit your character to add personality traits and backstory.</p>
            )}
          </div>
        )}

        {/* Dice Tab */}
        {activeTab === 'dice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-parchment">
              <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
                Dice Roller
              </h2>
              <DiceRoller />
            </div>

            <div className="card-parchment">
              <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
                Quick Rolls
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const roll = Math.floor(Math.random() * 20) + 1;
                    const mod = getMod(abilities.dex || 10);
                    alert(`Initiative: ${roll + mod} (d20: ${roll} ${formatMod(mod)})`);
                  }}
                  className="btn-secondary w-full text-left"
                >
                  Roll Initiative ({formatMod(getMod(abilities.dex || 10))})
                </button>

                {(Object.keys(ABILITY_NAMES) as AbilityKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      const roll = Math.floor(Math.random() * 20) + 1;
                      const mod = getMod(abilities[key] || 10);
                      alert(`${ABILITY_NAMES[key]} Check: ${roll + mod} (d20: ${roll} ${formatMod(mod)})`);
                    }}
                    className="btn-secondary w-full text-left text-sm"
                  >
                    {ABILITY_NAMES[key]} Check ({formatMod(getMod(abilities[key] || 10))})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
