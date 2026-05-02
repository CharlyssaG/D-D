'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  portraitUrl?: string;
  hp_current: number;
  hp_max: number;
  hp_temp: number;
  ac: number;
  abilityScores: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
}

export default function CharacterSheet({ character }: { character: Character }) {
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'spells' | 'notes'>('stats');

  const getAbilityModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const hpPercentage = (character.hp_current / character.hp_max) * 100;
  const hpBarClass = 
    hpPercentage > 50 ? 'healthy' : 
    hpPercentage > 25 ? 'wounded' : 
    'critical';

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Character Header */}
      <div className="card-parchment corner-flourish mb-6">
        <div className="flex items-start gap-6">
          {/* Portrait */}
          <div className="portrait-frame w-32 h-32 flex-shrink-0">
            {character.portraitUrl ? (
              <Image
                src={character.portraitUrl}
                alt={character.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent-amber/20 to-accent-burgundy/20 flex items-center justify-center">
                <span className="text-4xl font-accent text-ink-medium">
                  {character.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Name & Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-semibold text-ink-dark mb-2">
              {character.name}
            </h1>
            <p className="text-lg text-ink-medium mb-4">
              Level {character.level} {character.race} {character.class}
            </p>

            {/* HP Bar */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-ink-medium">Hit Points</span>
                <span className="text-sm font-mono text-ink-dark">
                  {character.hp_current} / {character.hp_max}
                  {character.hp_temp > 0 && ` (+${character.hp_temp})`}
                </span>
              </div>
              <div className="hp-bar">
                <div 
                  className={`hp-bar-fill ${hpBarClass} animate-hp-change`}
                  style={{ width: `${Math.min(hpPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-heading font-semibold text-accent-burgundy">
                  {character.ac}
                </div>
                <div className="text-xs text-ink-medium uppercase tracking-wide">
                  Armor Class
                </div>
              </div>
              <div className="border-l-2 border-accent-amber/30 pl-4 text-center">
                <div className="text-2xl font-heading font-semibold text-accent-burgundy">
                  {getAbilityModifier(character.abilityScores.dex)}
                </div>
                <div className="text-xs text-ink-medium uppercase tracking-wide">
                  Initiative
                </div>
              </div>
              <div className="border-l-2 border-accent-amber/30 pl-4 text-center">
                <div className="text-2xl font-heading font-semibold text-accent-burgundy">
                  30 ft
                </div>
                <div className="text-xs text-ink-medium uppercase tracking-wide">
                  Speed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {(['stats', 'inventory', 'spells', 'notes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-2 font-heading font-semibold rounded-lg transition-all
              ${activeTab === tab 
                ? 'bg-accent-burgundy text-parchment-light shadow-raised' 
                : 'bg-parchment text-ink-dark border-2 border-accent-amber/30 hover:bg-parchment-dark'
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Ability Scores */}
          <div className="card-parchment">
            <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
              Ability Scores
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(character.abilityScores).map(([ability, score]) => (
                <div key={ability} className="text-center">
                  <div className="bg-parchment-dark rounded-lg p-3 shadow-inset-soft">
                    <div className="text-xs uppercase tracking-wide text-ink-medium mb-1 font-semibold">
                      {ability}
                    </div>
                    <div className="text-3xl font-heading font-bold text-accent-burgundy">
                      {getAbilityModifier(score)}
                    </div>
                    <div className="text-sm text-ink-light mt-1">
                      {score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saving Throws & Skills would go here */}
          <div className="card-parchment">
            <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
              Proficiencies
            </h2>
            <p className="text-ink-medium italic">
              Skills, saving throws, and tool proficiencies appear here...
            </p>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="card-parchment">
          <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
            Equipment & Inventory
          </h2>
          <p className="text-ink-medium italic">
            Character's belongings, weapons, armor, and magical items will be listed here...
          </p>
        </div>
      )}

      {activeTab === 'spells' && (
        <div className="card-parchment">
          <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
            Spellcasting
          </h2>
          <p className="text-ink-medium italic">
            Spell slots, prepared spells, and spell descriptions will appear here...
          </p>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="card-parchment">
          <h2 className="text-xl font-heading font-semibold text-ink-dark mb-4 border-b-2 border-accent-amber/30 pb-2">
            Character Notes
          </h2>
          <div className="prose-readable">
            <h3 className="text-lg font-heading font-semibold text-ink-dark mb-2">Backstory</h3>
            <p className="mb-4">
              Your character's history, motivations, and secrets appear here...
            </p>
            <h3 className="text-lg font-heading font-semibold text-ink-dark mb-2">Personality Traits</h3>
            <p>
              Ideals, bonds, and flaws that define your character...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
