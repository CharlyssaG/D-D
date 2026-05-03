'use client';

import { useState } from 'react';

type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

const ABILITIES: Record<AbilityKey, string> = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
};

const SKILLS: { name: string; ability: AbilityKey }[] = [
  { name: 'Acrobatics', ability: 'dex' },
  { name: 'Animal Handling', ability: 'wis' },
  { name: 'Arcana', ability: 'int' },
  { name: 'Athletics', ability: 'str' },
  { name: 'Deception', ability: 'cha' },
  { name: 'History', ability: 'int' },
  { name: 'Insight', ability: 'wis' },
  { name: 'Intimidation', ability: 'cha' },
  { name: 'Investigation', ability: 'int' },
  { name: 'Medicine', ability: 'wis' },
  { name: 'Nature', ability: 'int' },
  { name: 'Perception', ability: 'wis' },
  { name: 'Performance', ability: 'cha' },
  { name: 'Persuasion', ability: 'cha' },
  { name: 'Religion', ability: 'int' },
  { name: 'Sleight of Hand', ability: 'dex' },
  { name: 'Stealth', ability: 'dex' },
  { name: 'Survival', ability: 'wis' },
];

interface AbilityChecksProps {
  abilityScores: Record<AbilityKey, number>;
  proficiencyBonus: number;
  proficientSkills: string[];
  proficientSaves: AbilityKey[];
  onToggleSkillProficiency?: (skill: string) => void;
  onToggleSaveProficiency?: (ability: AbilityKey) => void;
}

export default function AbilityChecks({
  abilityScores,
  proficiencyBonus,
  proficientSkills,
  proficientSaves,
  onToggleSkillProficiency,
  onToggleSaveProficiency,
}: AbilityChecksProps) {
  const [lastRoll, setLastRoll] = useState<{ label: string; roll: number; modifier: number; total: number; nat20: boolean; nat1: boolean } | null>(null);

  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  const rollCheck = (label: string, modifier: number) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    setLastRoll({
      label,
      roll,
      modifier,
      total,
      nat20: roll === 20,
      nat1: roll === 1,
    });
  };

  return (
    <div>
      {/* Last Roll Result */}
      {lastRoll && (
        <div className={`mb-4 p-4 rounded-lg text-center border-2 transition-all ${
          lastRoll.nat20 ? 'bg-accent-forest/10 border-accent-forest' :
          lastRoll.nat1 ? 'bg-accent-burgundy/10 border-accent-burgundy' :
          'bg-parchment-light border-accent-amber/30'
        }`}>
          {lastRoll.nat20 && <div className="text-xs font-heading font-semibold text-accent-forest">Natural 20!</div>}
          {lastRoll.nat1 && <div className="text-xs font-heading font-semibold text-accent-burgundy">Natural 1!</div>}
          <div className="text-sm text-ink-medium">{lastRoll.label}</div>
          <div className={`text-3xl font-heading font-semibold ${
            lastRoll.nat20 ? 'text-accent-forest' : lastRoll.nat1 ? 'text-accent-burgundy' : 'text-ink-dark'
          }`}>
            {lastRoll.total}
          </div>
          <div className="text-xs text-ink-light">
            d20({lastRoll.roll}) {formatMod(lastRoll.modifier)}
          </div>
        </div>
      )}

      {/* Saving Throws */}
      <div className="mb-6">
        <h3 className="font-heading font-semibold text-ink-dark mb-3 border-b-2 border-accent-amber/30 pb-1">
          Saving Throws
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ABILITIES) as AbilityKey[]).map((key) => {
            const mod = getMod(abilityScores[key]);
            const isProficient = proficientSaves.includes(key);
            const totalMod = isProficient ? mod + proficiencyBonus : mod;

            return (
              <button
                key={key}
                onClick={() => rollCheck(`${ABILITIES[key]} Save`, totalMod)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-parchment-light border border-accent-amber/20 hover:bg-parchment-dark/50 transition-colors text-left"
              >
                {onToggleSaveProficiency && (
                  <input
                    type="checkbox"
                    checked={isProficient}
                    onChange={(e) => { e.stopPropagation(); onToggleSaveProficiency(key); }}
                    className="w-3 h-3"
                  />
                )}
                {!onToggleSaveProficiency && (
                  <span className={`w-3 h-3 rounded-full ${isProficient ? 'bg-accent-forest' : 'bg-parchment-dark'}`} />
                )}
                <span className="text-sm text-ink-dark flex-1">{ABILITIES[key]}</span>
                <span className="font-heading font-semibold text-accent-burgundy text-sm">
                  {formatMod(totalMod)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="font-heading font-semibold text-ink-dark mb-3 border-b-2 border-accent-amber/30 pb-1">
          Skills
        </h3>
        <div className="space-y-1">
          {SKILLS.map((skill) => {
            const mod = getMod(abilityScores[skill.ability]);
            const isProficient = proficientSkills.includes(skill.name);
            const totalMod = isProficient ? mod + proficiencyBonus : mod;

            return (
              <button
                key={skill.name}
                onClick={() => rollCheck(`${skill.name} Check`, totalMod)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-parchment-light/80 transition-colors text-left"
              >
                {onToggleSkillProficiency && (
                  <input
                    type="checkbox"
                    checked={isProficient}
                    onChange={(e) => { e.stopPropagation(); onToggleSkillProficiency(skill.name); }}
                    className="w-3 h-3"
                  />
                )}
                {!onToggleSkillProficiency && (
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${isProficient ? 'bg-accent-forest' : 'bg-parchment-dark'}`} />
                )}
                <span className="text-sm text-ink-dark flex-1">
                  {skill.name}
                  <span className="text-xs text-ink-light ml-1">({skill.ability.toUpperCase()})</span>
                </span>
                <span className="font-heading font-semibold text-accent-burgundy text-sm">
                  {formatMod(totalMod)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
