'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RACES = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling', 'Dragonborn'];
const CLASSES = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
const ALIGNMENTS = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
const BACKGROUNDS = ['Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier', 'Charlatan', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander', 'Sailor', 'Urchin'];

const CLASS_INFO: Record<string, { description: string; hitDie: number; primaryAbility: string; savingThrows: string; spellcaster: boolean }> = {
  Barbarian: { description: 'A fierce warrior who channels primal rage in battle.', hitDie: 12, primaryAbility: 'Strength', savingThrows: 'STR & CON', spellcaster: false },
  Bard: { description: 'A magical performer whose music weaves spells and inspiration.', hitDie: 8, primaryAbility: 'Charisma', savingThrows: 'DEX & CHA', spellcaster: true },
  Cleric: { description: 'A holy warrior who channels divine power to heal and protect.', hitDie: 8, primaryAbility: 'Wisdom', savingThrows: 'WIS & CHA', spellcaster: true },
  Druid: { description: 'A nature priest who can shapeshift and command the elements.', hitDie: 8, primaryAbility: 'Wisdom', savingThrows: 'INT & WIS', spellcaster: true },
  Fighter: { description: 'A master of weapons and armor, adaptable to any combat style.', hitDie: 10, primaryAbility: 'Strength or Dexterity', savingThrows: 'STR & CON', spellcaster: false },
  Monk: { description: 'A martial artist who harnesses inner energy for incredible feats.', hitDie: 8, primaryAbility: 'Dexterity & Wisdom', savingThrows: 'STR & DEX', spellcaster: false },
  Paladin: { description: 'A holy knight bound by an oath to uphold justice and righteousness.', hitDie: 10, primaryAbility: 'Strength & Charisma', savingThrows: 'WIS & CHA', spellcaster: true },
  Ranger: { description: 'A skilled hunter and tracker who protects the wilds.', hitDie: 10, primaryAbility: 'Dexterity & Wisdom', savingThrows: 'STR & DEX', spellcaster: true },
  Rogue: { description: 'A stealthy trickster who strikes from the shadows.', hitDie: 8, primaryAbility: 'Dexterity', savingThrows: 'DEX & INT', spellcaster: false },
  Sorcerer: { description: 'A spellcaster with innate magical power flowing through their veins.', hitDie: 6, primaryAbility: 'Charisma', savingThrows: 'CON & CHA', spellcaster: true },
  Warlock: { description: 'A spellcaster who draws power from a pact with a mysterious patron.', hitDie: 8, primaryAbility: 'Charisma', savingThrows: 'WIS & CHA', spellcaster: true },
  Wizard: { description: 'A scholarly mage who learns spells through study and research.', hitDie: 6, primaryAbility: 'Intelligence', savingThrows: 'INT & WIS', spellcaster: true },
};

type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

const ABILITY_LABELS: Record<AbilityKey, { name: string; description: string }> = {
  str: { name: 'Strength', description: 'Physical power, melee attacks, carrying capacity' },
  dex: { name: 'Dexterity', description: 'Agility, reflexes, ranged attacks, stealth' },
  con: { name: 'Constitution', description: 'Endurance, stamina, hit points' },
  int: { name: 'Intelligence', description: 'Reasoning, memory, arcane magic (Wizard)' },
  wis: { name: 'Wisdom', description: 'Perception, insight, divine magic (Cleric/Druid)' },
  cha: { name: 'Charisma', description: 'Force of personality, persuasion, sorcery' },
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export default function CreateCharacterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Character data
  const [name, setName] = useState('');
  const [race, setRace] = useState('');
  const [charClass, setCharClass] = useState('');
  const [background, setBackground] = useState('');
  const [alignment, setAlignment] = useState('');
  const [abilities, setAbilities] = useState<Record<AbilityKey, number>>({
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  });
  const [backstory, setBackstory] = useState('');
  const [personality, setPersonality] = useState('');

  // Standard array assignment
  const [availableScores, setAvailableScores] = useState([...STANDARD_ARRAY]);

  const assignScore = (ability: AbilityKey, score: number) => {
    const oldScore = abilities[ability];
    const newAvailable = [...availableScores];

    // Return old score to pool (if it was from standard array)
    if (STANDARD_ARRAY.includes(oldScore) && oldScore !== 10) {
      newAvailable.push(oldScore);
    }

    // Remove new score from pool
    const idx = newAvailable.indexOf(score);
    if (idx > -1) newAvailable.splice(idx, 1);

    newAvailable.sort((a, b) => b - a);
    setAvailableScores(newAvailable);
    setAbilities({ ...abilities, [ability]: score });
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const calculateHP = () => {
    const classInfo = CLASS_INFO[charClass];
    if (!classInfo) return 10;
    const conMod = Math.floor((abilities.con - 10) / 2);
    return classInfo.hitDie + conMod;
  };

  const handleSubmit = async () => {
    if (!user) return router.push('/login');

    setLoading(true);
    setError('');

    const hp = calculateHP();

    const { data, error: dbError } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        name,
        race,
        class: charClass,
        level: 1,
        background,
        alignment,
        ability_scores: abilities,
        hp_max: hp,
        hp_current: hp,
        ac: 10 + Math.floor((abilities.dex - 10) / 2),
        initiative_bonus: Math.floor((abilities.dex - 10) / 2),
        backstory,
        personality,
        proficiency_bonus: 2,
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      router.push(`/character/${data.id}`);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-accent-amber/30">
        <Link href="/" className="font-accent text-xl text-accent-burgundy">Campaign Manager</Link>
        <Link href="/dashboard" className="text-sm text-ink-medium hover:text-ink-dark transition-colors font-heading">
          Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto w-full p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-ink-medium mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>
              {step === 1 && 'Identity'}
              {step === 2 && 'Class'}
              {step === 3 && 'Ability Scores'}
              {step === 4 && 'Backstory'}
            </span>
          </div>
          <div className="hp-bar">
            <div className="hp-bar-fill healthy" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="card-parchment corner-flourish">
            <h2 className="chapter-heading mb-2">Who Are You?</h2>
            <p className="text-center text-ink-medium mb-8">Choose your character&apos;s name, race, and background</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-heading font-semibold text-ink-dark mb-1">Character Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-parchment"
                  placeholder="Thandril Stormweaver..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-ink-dark mb-2">Race</label>
                <div className="grid grid-cols-3 gap-2">
                  {RACES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRace(r)}
                      className={`py-3 px-2 rounded-lg text-sm font-heading font-semibold transition-all ${
                        race === r
                          ? 'bg-accent-burgundy text-parchment-light shadow-raised'
                          : 'bg-parchment-dark text-ink-dark hover:bg-parchment-dark/80 border border-accent-amber/30'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-ink-dark mb-2">Background</label>
                <select
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="input-parchment"
                >
                  <option value="">Choose a background...</option>
                  {BACKGROUNDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-ink-dark mb-2">Alignment</label>
                <select
                  value={alignment}
                  onChange={(e) => setAlignment(e.target.value)}
                  className="input-parchment"
                >
                  <option value="">Choose alignment...</option>
                  {ALIGNMENTS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!name || !race}
                className="btn-primary"
              >
                Next: Choose Class
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Class */}
        {step === 2 && (
          <div className="card-parchment corner-flourish">
            <h2 className="chapter-heading mb-2">Choose Your Path</h2>
            <p className="text-center text-ink-medium mb-8">Your class defines what your character can do in combat and beyond</p>

            <div className="grid grid-cols-2 gap-3">
              {CLASSES.map((c) => {
                const info = CLASS_INFO[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCharClass(c)}
                    className={`text-left p-4 rounded-lg transition-all ${
                      charClass === c
                        ? 'bg-accent-burgundy/10 border-2 border-accent-burgundy shadow-raised'
                        : 'bg-parchment-light border-2 border-accent-amber/20 hover:border-accent-amber/50'
                    }`}
                  >
                    <div className="font-heading font-semibold text-ink-dark mb-1">{c}</div>
                    <div className="text-xs text-ink-medium leading-relaxed mb-2">{info.description}</div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="condition-badge">d{info.hitDie} HP</span>
                      {info.spellcaster && (
                        <span className="condition-badge positive">Spellcaster</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {charClass && (
              <div className="mt-6 bg-parchment-light rounded-lg p-4 border-2 border-accent-amber/30">
                <h3 className="font-heading font-semibold text-ink-dark mb-2">{charClass} Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-ink-medium">
                  <div><span className="font-semibold">Hit Die:</span> d{CLASS_INFO[charClass].hitDie}</div>
                  <div><span className="font-semibold">Primary:</span> {CLASS_INFO[charClass].primaryAbility}</div>
                  <div><span className="font-semibold">Saves:</span> {CLASS_INFO[charClass].savingThrows}</div>
                  <div><span className="font-semibold">Magic:</span> {CLASS_INFO[charClass].spellcaster ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!charClass}
                className="btn-primary"
              >
                Next: Ability Scores
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ability Scores */}
        {step === 3 && (
          <div className="card-parchment corner-flourish">
            <h2 className="chapter-heading mb-2">Set Your Abilities</h2>
            <p className="text-center text-ink-medium mb-4">
              Assign scores from the Standard Array to your abilities.
              Higher is better! Your {charClass}&apos;s primary ability is <span className="font-semibold text-accent-burgundy">{CLASS_INFO[charClass]?.primaryAbility}</span>.
            </p>

            {availableScores.length > 0 && (
              <div className="bg-parchment-light rounded-lg p-3 mb-6 text-center">
                <span className="text-sm text-ink-medium">Available scores: </span>
                <span className="font-heading font-semibold text-accent-burgundy">
                  {availableScores.join(', ')}
                </span>
              </div>
            )}

            <div className="space-y-4">
              {(Object.keys(abilities) as AbilityKey[]).map((key) => (
                <div key={key} className="bg-parchment-light rounded-lg p-4 border border-accent-amber/20">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="font-heading font-semibold text-ink-dark text-lg">
                        {ABILITY_LABELS[key].name}
                      </span>
                      <span className="text-xs text-ink-light ml-2 uppercase">{key}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-heading font-semibold text-accent-burgundy mr-2">
                        {abilities[key]}
                      </span>
                      <span className="text-sm text-ink-medium">({getModifier(abilities[key])})</span>
                    </div>
                  </div>
                  <p className="text-xs text-ink-light mb-2">{ABILITY_LABELS[key].description}</p>
                  <div className="flex gap-1 flex-wrap">
                    {[...STANDARD_ARRAY].sort((a, b) => b - a).map((score) => (
                      <button
                        key={`${key}-${score}`}
                        type="button"
                        onClick={() => assignScore(key, score)}
                        disabled={!availableScores.includes(score) && abilities[key] !== score}
                        className={`py-1 px-3 rounded text-sm font-semibold transition-all ${
                          abilities[key] === score
                            ? 'bg-accent-burgundy text-parchment-light'
                            : availableScores.includes(score)
                            ? 'bg-parchment text-ink-dark hover:bg-accent-amber/30 border border-accent-amber/30'
                            : 'bg-parchment-dark/50 text-ink-light/50 cursor-not-allowed'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {charClass && (
              <div className="mt-6 bg-accent-forest/10 rounded-lg p-4 border border-accent-forest/20">
                <p className="text-sm text-ink-dark">
                  <span className="font-semibold">Starting HP:</span>{' '}
                  <span className="text-xl font-heading font-semibold text-accent-forest">{calculateHP()}</span>
                  <span className="text-ink-medium ml-2">
                    (d{CLASS_INFO[charClass].hitDie} + CON modifier of {getModifier(abilities.con)})
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
              <button onClick={() => setStep(4)} className="btn-primary">
                Next: Backstory
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Backstory */}
        {step === 4 && (
          <div className="card-parchment corner-flourish">
            <h2 className="chapter-heading mb-2">Your Story</h2>
            <p className="text-center text-ink-medium mb-8">
              Tell us about your character. This is optional but helps bring them to life!
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-heading font-semibold text-ink-dark mb-1">
                  Personality Traits
                </label>
                <textarea
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="input-parchment min-h-[80px]"
                  placeholder="I'm always polite and respectful... or maybe I have a crude sense of humor..."
                />
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-ink-dark mb-1">
                  Backstory
                </label>
                <textarea
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  className="input-parchment min-h-[150px]"
                  placeholder="Where did you come from? What drives you? What happened that set you on the path of adventure?"
                />
              </div>
            </div>

            {/* Summary Card */}
            <div className="mt-8 bg-parchment-light rounded-lg p-5 border-2 border-accent-amber/30">
              <h3 className="font-heading font-semibold text-ink-dark text-lg mb-3">Character Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-ink-light">Name:</span> <span className="font-semibold text-ink-dark">{name}</span></div>
                <div><span className="text-ink-light">Race:</span> <span className="font-semibold text-ink-dark">{race}</span></div>
                <div><span className="text-ink-light">Class:</span> <span className="font-semibold text-ink-dark">{charClass}</span></div>
                <div><span className="text-ink-light">Level:</span> <span className="font-semibold text-ink-dark">1</span></div>
                <div><span className="text-ink-light">Background:</span> <span className="font-semibold text-ink-dark">{background || 'None'}</span></div>
                <div><span className="text-ink-light">HP:</span> <span className="font-semibold text-accent-forest">{calculateHP()}</span></div>
              </div>
              <div className="flex gap-3 mt-3 flex-wrap">
                {(Object.keys(abilities) as AbilityKey[]).map((key) => (
                  <div key={key} className="text-center">
                    <div className="text-xs text-ink-light uppercase">{key}</div>
                    <div className="font-heading font-semibold text-ink-dark">{abilities[key]}</div>
                    <div className="text-xs text-ink-medium">{getModifier(abilities[key])}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-accent-burgundy/10 text-accent-burgundy text-sm px-4 py-3 rounded-lg border border-accent-burgundy/20">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(3)} className="btn-secondary">Back</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating Character...' : 'Create Character!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
