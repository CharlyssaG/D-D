'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

const ABILITY_NAMES: Record<AbilityKey, string> = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
};

export default function CharacterPage() {
  const { user } = useAuth();
  const params = useParams();
  const supabase = createClient();
  const [character, setCharacter] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'spells' | 'notes'>('stats');

  useEffect(() => {
    loadCharacter();
  }, [params.id]);

  const loadCharacter = async () => {
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) setCharacter(data);
    setLoading(false);
  };

  const updateHP = async (amount: number) => {
    if (!character) return;
    const newHP = Math.max(0, Math.min(character.hp_max, character.hp_current + amount));

    await supabase
      .from('characters')
      .update({ hp_current: newHP })
      .eq('id', character.id);

    setCharacter({ ...character, hp_current: newHP });
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

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
  const abilities = character.ability_scores || {};

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-accent-amber/30">
        <Link href="/" className="font-accent text-xl text-accent-burgundy">Campaign Manager</Link>
        <Link href="/dashboard" className="text-sm text-ink-medium hover:text-ink-dark transition-colors font-heading">
          Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto w-full p-6">
        {/* Character Header */}
        <div className="card-parchment corner-flourish mb-6">
          <div className="flex items-start gap-6">
            <div className="portrait-frame w-28 h-28 flex-shrink-0">
              <div className="w-full h-full bg-accent-amber/20 flex items-center justify-center">
                <span className="text-4xl font-accent text-ink-medium">
                  {character.name?.charAt(0)}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-heading font-semibold text-ink-dark mb-1">
                {character.name}
              </h1>
              <p className="text-lg text-ink-medium mb-4">
                Level {character.level} {character.race} {character.class}
              </p>

              {/* HP Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-ink-medium">Hit Points</span>
                  <span className="text-sm font-mono text-ink-dark">
                    {character.hp_current} / {character.hp_max}
                  </span>
                </div>
                <div className="hp-bar">
                  <div
                    className={`hp-bar-fill ${hpPercent > 50 ? 'healthy' : hpPercent > 25 ? 'wounded' : 'critical'}`}
                    style={{ width: `${Math.min(hpPercent, 100)}%` }}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateHP(-5)} className="btn-secondary text-sm py-1 px-3">-5</button>
                  <button onClick={() => updateHP(-1)} className="btn-secondary text-sm py-1 px-3">-1</button>
                  <button onClick={() => updateHP(1)} className="btn-secondary text-sm py-1 px-3">+1</button>
                  <button onClick={() => updateHP(5)} className="btn-secondary text-sm py-1 px-3">+5</button>
                  <button
                    onClick={() => updateHP(character.hp_max)}
                    className="btn-secondary text-sm py-1 px-3 ml-auto"
                  >
                    Full Heal
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-heading font-semibold text-accent-burgundy">{character.ac}</div>
                  <div className="text-xs text-ink-medium uppercase tracking-wide">AC</div>
                </div>
                <div className="border-l-2 border-accent-amber/30 pl-6 text-center">
                  <div className="text-2xl font-heading font-semibold text-accent-burgundy">
                    {getModifier(abilities.dex || 10)}
                  </div>
                  <div className="text-xs text-ink-medium uppercase tracking-wide">Initiative</div>
                </div>
                <div className="border-l-2 border-accent-amber/30 pl-6 text-center">
                  <div className="text-2xl font-heading font-semibold text-accent-burgundy">{character.speed || 30} ft</div>
                  <div className="text-xs text-ink-medium uppercase tracking-wide">Speed</div>
                </div>
                <div className="border-l-2 border-accent-amber/30 pl-6 text-center">
                  <div className="text-2xl font-heading font-semibold text-accent-burgundy">+{character.proficiency_bonus || 2}</div>
                  <div className="text-xs text-ink-medium uppercase tracking-wide">Proficiency</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['stats', 'inventory', 'spells', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 font-heading font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-accent-burgundy text-parchment-light shadow-raised'
                  : 'bg-parchment text-ink-dark border-2 border-accent-amber/30 hover:bg-parchment-dark'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-parchment">
              <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
                Ability Scores
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {(Object.keys(ABILITY_NAMES) as AbilityKey[]).map((key) => (
                  <div key={key} className="text-center">
                    <div className="bg-parchment-dark rounded-lg p-3 shadow-inset-soft">
                      <div className="text-xs uppercase tracking-wide text-ink-medium mb-1 font-semibold">{key}</div>
                      <div className="text-3xl font-heading font-semibold text-accent-burgundy">
                        {getModifier(abilities[key] || 10)}
                      </div>
                      <div className="text-sm text-ink-light mt-1">{abilities[key] || 10}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-parchment">
              <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
                Character Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-medium">Background</span>
                  <span className="font-semibold">{character.background || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-medium">Alignment</span>
                  <span className="font-semibold">{character.alignment || 'Unaligned'}</span>
                </div>
                {character.personality && (
                  <div className="pt-3 border-t border-accent-amber/20">
                    <span className="text-ink-medium block mb-1">Personality</span>
                    <p className="text-ink-dark">{character.personality}</p>
                  </div>
                )}
                {character.backstory && (
                  <div className="pt-3 border-t border-accent-amber/20">
                    <span className="text-ink-medium block mb-1">Backstory</span>
                    <p className="text-ink-dark">{character.backstory}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder tabs */}
        {activeTab === 'inventory' && (
          <div className="card-parchment text-center py-12">
            <h2 className="text-xl font-heading font-semibold text-ink-dark mb-2">Equipment &amp; Inventory</h2>
            <p className="text-ink-medium">Inventory management coming soon! Your DM can help you add items.</p>
          </div>
        )}

        {activeTab === 'spells' && (
          <div className="card-parchment text-center py-12">
            <h2 className="text-xl font-heading font-semibold text-ink-dark mb-2">Spellcasting</h2>
            <p className="text-ink-medium">Spell tracking coming soon! Spell slots, prepared spells, and descriptions.</p>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="card-parchment text-center py-12">
            <h2 className="text-xl font-heading font-semibold text-ink-dark mb-2">Character Notes</h2>
            <p className="text-ink-medium">Private notes, session logs, and wiki contributions coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
