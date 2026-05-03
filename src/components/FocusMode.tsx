'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface FocusModeProps {
  characterId: string;
}

interface RollResult {
  type: string;
  roll: number;
  modifier: number;
  total: number;
  nat20: boolean;
  nat1: boolean;
}

export default function FocusMode({ characterId }: FocusModeProps) {
  const supabase = createClient();
  const [character, setCharacter] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
  const [showSpells, setShowSpells] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [hpChange, setHpChange] = useState(0);
  const [showHpInput, setShowHpInput] = useState(false);

  useEffect(() => {
    loadCharacter();
  }, [characterId]);

  const loadCharacter = async () => {
    const { data } = await supabase.from('characters').select('*').eq('id', characterId).single();
    if (data) setCharacter(data);
    setLoading(false);
  };

  const getMod = (ability: string) => {
    const scores = character?.ability_scores || {};
    return Math.floor(((scores[ability] || 10) - 10) / 2);
  };

  const doRoll = (type: string, modifier: number) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const result: RollResult = {
      type,
      roll,
      modifier,
      total: roll + modifier,
      nat20: roll === 20,
      nat1: roll === 1,
    };
    setLastRoll(result);
    setShowResult(true);
    setShowSpells(false);
    setShowSkills(false);

    // Auto-hide after 5 seconds
    setTimeout(() => setShowResult(false), 5000);
  };

  const handleAttack = () => {
    // Use highest of STR or DEX modifier
    const strMod = getMod('str');
    const dexMod = getMod('dex');
    const mod = Math.max(strMod, dexMod) + (character?.proficiency_bonus || 2);
    doRoll('ATTACK', mod);
  };

  const handleDamage = (dice: string) => {
    // Parse dice like "1d8", "2d6"
    const match = dice.match(/(\d+)d(\d+)/);
    if (!match) return;
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    const strMod = getMod('str');
    const dexMod = getMod('dex');
    total += Math.max(strMod, dexMod);
    setLastRoll({ type: `DAMAGE (${dice})`, roll: total, modifier: 0, total, nat20: false, nat1: false });
    setShowResult(true);
    setTimeout(() => setShowResult(false), 5000);
  };

  const adjustHP = async (amount: number) => {
    if (!character) return;
    const newHP = Math.max(0, Math.min(character.hp_max, character.hp_current + amount));
    await supabase.from('characters').update({ hp_current: newHP }).eq('id', character.id);
    setCharacter({ ...character, hp_current: newHP });
    setShowHpInput(false);
    setHpChange(0);
  };

  const handleLongRest = async () => {
    if (!character) return;
    const newSlots = Object.fromEntries(
      Object.entries(character.spell_slots || {}).map(([k, v]: [string, any]) => [k, { ...v, used: 0 }])
    );
    await supabase.from('characters').update({
      hp_current: character.hp_max,
      spell_slots: newSlots,
      death_saves: { successes: 0, failures: 0 },
    }).eq('id', character.id);
    setCharacter({ ...character, hp_current: character.hp_max, spell_slots: newSlots });
    setLastRoll(null);
    setShowResult(false);
  };

  // Quick skill list - only the most common ones for beginners
  const QUICK_SKILLS = [
    { name: 'Perception', ability: 'wis', emoji: '👁️' },
    { name: 'Investigation', ability: 'int', emoji: '🔍' },
    { name: 'Persuasion', ability: 'cha', emoji: '🗣️' },
    { name: 'Stealth', ability: 'dex', emoji: '🤫' },
    { name: 'Athletics', ability: 'str', emoji: '💪' },
    { name: 'Insight', ability: 'wis', emoji: '🧠' },
    { name: 'Arcana', ability: 'int', emoji: '✨' },
    { name: 'Deception', ability: 'cha', emoji: '🎭' },
    { name: 'Intimidation', ability: 'cha', emoji: '😤' },
    { name: 'Acrobatics', ability: 'dex', emoji: '🤸' },
    { name: 'Medicine', ability: 'wis', emoji: '🩹' },
    { name: 'Survival', ability: 'wis', emoji: '🏕️' },
  ];

  if (loading || !character) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#eee', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ fontSize: '24px' }}>Loading...</p>
      </div>
    );
  }

  const hpPercent = Math.round((character.hp_current / character.hp_max) * 100);
  const hpColor = hpPercent > 50 ? '#22c55e' : hpPercent > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      color: '#eee',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      padding: '16px',
      maxWidth: '500px',
      margin: '0 auto',
    }}>
      {/* Character Name & HP */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#fff' }}>
          {character.name}
        </h1>
        <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
          Lvl {character.level} {character.race} {character.class}
        </p>
      </div>

      {/* HP Bar - BIG and obvious */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: hpColor }}>
            HP: {character.hp_current} / {character.hp_max}
          </span>
          <span style={{ fontSize: '14px', color: '#888' }}>AC: {character.ac}</span>
        </div>
        <div style={{ background: '#333', borderRadius: '12px', height: '24px', overflow: 'hidden' }}>
          <div style={{
            background: hpColor,
            height: '100%',
            width: `${Math.min(hpPercent, 100)}%`,
            borderRadius: '12px',
            transition: 'all 0.3s ease',
          }} />
        </div>
      </div>

      {/* Roll Result - big flashy display */}
      {showResult && lastRoll && (
        <div style={{
          background: lastRoll.nat20 ? '#166534' : lastRoll.nat1 ? '#991b1b' : '#2d2d5e',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '16px',
          border: `3px solid ${lastRoll.nat20 ? '#22c55e' : lastRoll.nat1 ? '#ef4444' : '#6366f1'}`,
          animation: 'fadeIn 0.2s ease',
        }}>
          {lastRoll.nat20 && <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#22c55e' }}>NATURAL 20! CRITICAL!</div>}
          {lastRoll.nat1 && <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>NATURAL 1! FUMBLE!</div>}
          <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '4px' }}>{lastRoll.type}</div>
          <div style={{ fontSize: '56px', fontWeight: 'bold', color: '#fff', lineHeight: 1.1 }}>{lastRoll.total}</div>
          {lastRoll.modifier !== 0 && (
            <div style={{ fontSize: '14px', color: '#888' }}>
              d20: {lastRoll.roll} {lastRoll.modifier >= 0 ? '+' : ''}{lastRoll.modifier}
            </div>
          )}
        </div>
      )}

      {/* MAIN ACTION BUTTONS */}
      {!showSpells && !showSkills && !showHpInput && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {/* ATTACK */}
          <button onClick={handleAttack} style={{
            background: '#dc2626', border: 'none', borderRadius: '16px',
            padding: '24px 16px', cursor: 'pointer', color: '#fff',
            fontSize: '18px', fontWeight: 'bold', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '32px' }}>⚔️</span>
            ATTACK
          </button>

          {/* I GOT HIT */}
          <button onClick={() => setShowHpInput(true)} style={{
            background: '#9333ea', border: 'none', borderRadius: '16px',
            padding: '24px 16px', cursor: 'pointer', color: '#fff',
            fontSize: '18px', fontWeight: 'bold', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '32px' }}>🛡️</span>
            I GOT HIT
          </button>

          {/* SKILL CHECK */}
          <button onClick={() => { setShowSkills(true); setShowSpells(false); }} style={{
            background: '#2563eb', border: 'none', borderRadius: '16px',
            padding: '24px 16px', cursor: 'pointer', color: '#fff',
            fontSize: '18px', fontWeight: 'bold', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '32px' }}>🎲</span>
            SKILL CHECK
          </button>

          {/* CAST SPELL */}
          <button onClick={() => { setShowSpells(true); setShowSkills(false); }} style={{
            background: '#7c3aed', border: 'none', borderRadius: '16px',
            padding: '24px 16px', cursor: 'pointer', color: '#fff',
            fontSize: '18px', fontWeight: 'bold', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '32px' }}>✨</span>
            CAST SPELL
          </button>

          {/* HEAL */}
          <button onClick={() => adjustHP(character.level > 1 ? 8 : 5)} style={{
            background: '#16a34a', border: 'none', borderRadius: '16px',
            padding: '24px 16px', cursor: 'pointer', color: '#fff',
            fontSize: '18px', fontWeight: 'bold', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '32px' }}>❤️</span>
            HEAL
          </button>

          {/* REST */}
          <button onClick={handleLongRest} style={{
            background: '#0891b2', border: 'none', borderRadius: '16px',
            padding: '24px 16px', cursor: 'pointer', color: '#fff',
            fontSize: '18px', fontWeight: 'bold', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '32px' }}>😴</span>
            REST
          </button>
        </div>
      )}

      {/* HP INPUT (when "I Got Hit" is pressed) */}
      {showHpInput && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '12px', color: '#aaa', fontSize: '16px' }}>
            How much damage did you take?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <button key={n} onClick={() => adjustHP(-n)} style={{
                background: '#ef4444', border: 'none', borderRadius: '12px',
                padding: '20px', cursor: 'pointer', color: '#fff',
                fontSize: '22px', fontWeight: 'bold',
              }}>
                -{n}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              value={hpChange || ''}
              onChange={(e) => setHpChange(parseInt(e.target.value) || 0)}
              placeholder="Other amount"
              style={{
                flex: 1, background: '#2a2a4a', border: '2px solid #444',
                borderRadius: '12px', padding: '14px', color: '#fff',
                fontSize: '18px', textAlign: 'center',
              }}
            />
            <button onClick={() => adjustHP(-hpChange)} style={{
              background: '#ef4444', border: 'none', borderRadius: '12px',
              padding: '14px 24px', cursor: 'pointer', color: '#fff',
              fontSize: '16px', fontWeight: 'bold',
            }}>
              Take
            </button>
          </div>
          <button onClick={() => setShowHpInput(false)} style={{
            width: '100%', marginTop: '8px', background: '#333',
            border: 'none', borderRadius: '12px', padding: '12px',
            cursor: 'pointer', color: '#aaa', fontSize: '14px',
          }}>
            ← Back
          </button>
        </div>
      )}

      {/* SKILL CHECK LIST */}
      {showSkills && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '12px', color: '#aaa', fontSize: '16px' }}>
            DM asked for a skill check? Tap it:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            {QUICK_SKILLS.map((skill) => {
              const mod = getMod(skill.ability) + (
                (character.skills?.[skill.name.toLowerCase()]?.proficient) ? (character.proficiency_bonus || 2) : 0
              );
              return (
                <button key={skill.name} onClick={() => doRoll(skill.name, mod)} style={{
                  background: '#2d2d5e', border: '2px solid #444',
                  borderRadius: '12px', padding: '16px 12px',
                  cursor: 'pointer', color: '#fff', fontSize: '15px',
                  fontWeight: '600', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '20px' }}>{skill.emoji}</span>
                  {skill.name}
                </button>
              );
            })}
          </div>

          {/* Saving throws */}
          <div style={{ textAlign: 'center', margin: '16px 0 8px', color: '#aaa', fontSize: '14px' }}>
            Saving throw:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ab) => {
              const mod = getMod(ab) + (character.saving_throws?.[ab] ? (character.proficiency_bonus || 2) : 0);
              return (
                <button key={ab} onClick={() => doRoll(`${ab.toUpperCase()} Save`, mod)} style={{
                  background: '#1e3a5f', border: '2px solid #2563eb',
                  borderRadius: '12px', padding: '14px 8px',
                  cursor: 'pointer', color: '#fff', fontSize: '14px',
                  fontWeight: '600', textAlign: 'center',
                }}>
                  {ab.toUpperCase()}
                </button>
              );
            })}
          </div>

          <button onClick={() => setShowSkills(false)} style={{
            width: '100%', background: '#333', border: 'none',
            borderRadius: '12px', padding: '12px', cursor: 'pointer',
            color: '#aaa', fontSize: '14px',
          }}>
            ← Back
          </button>
        </div>
      )}

      {/* SPELL LIST (simplified) */}
      {showSpells && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '12px', color: '#aaa', fontSize: '16px' }}>
            Tap a spell to cast it:
          </div>

          {/* Spell slots visual */}
          {character.spell_slots && Object.keys(character.spell_slots).length > 0 && (
            <div style={{ marginBottom: '12px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {Object.entries(character.spell_slots as Record<string, { max: number; used: number }>).map(([level, data]) => (
                <div key={level} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lvl {level}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: data.max }).map((_, i) => (
                      <div key={i} style={{
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: i < data.max - data.used ? '#7c3aed' : '#333',
                        border: '2px solid #555',
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(character.spells_prepared?.length > 0) ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '8px' }}>
              {(character.spells_prepared as string[]).map((spellName) => (
                <button key={spellName} onClick={() => {
                  const spellMod = getMod(character.spellcasting_ability || 'int') + (character.proficiency_bonus || 2);
                  doRoll(`${spellName} (Spell Attack)`, spellMod);
                }} style={{
                  background: '#3b0764', border: '2px solid #7c3aed',
                  borderRadius: '12px', padding: '16px',
                  cursor: 'pointer', color: '#fff', fontSize: '16px',
                  fontWeight: '600', textAlign: 'left',
                }}>
                  ✨ {spellName}
                </button>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '24px', color: '#666',
              background: '#222', borderRadius: '12px', marginBottom: '8px',
            }}>
              No spells prepared yet.
              <br />
              <span style={{ fontSize: '13px' }}>Go to your full character sheet to prepare spells.</span>
            </div>
          )}

          <button onClick={() => setShowSpells(false)} style={{
            width: '100%', background: '#333', border: 'none',
            borderRadius: '12px', padding: '12px', cursor: 'pointer',
            color: '#aaa', fontSize: '14px',
          }}>
            ← Back
          </button>
        </div>
      )}

      {/* Damage dice quick buttons (always visible) */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ fontSize: '12px', color: '#555', textAlign: 'center', marginBottom: '6px' }}>
          Quick damage dice
        </div>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {['1d4', '1d6', '1d8', '1d10', '1d12', '2d6'].map((dice) => (
            <button key={dice} onClick={() => handleDamage(dice)} style={{
              background: '#2a2a2a', border: '1px solid #444',
              borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
              color: '#aaa', fontSize: '13px', fontWeight: '500',
            }}>
              {dice}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle at bottom */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <a
          href={`/character/${characterId}`}
          style={{ color: '#555', fontSize: '13px', textDecoration: 'none' }}
        >
          Switch to full character sheet →
        </a>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
