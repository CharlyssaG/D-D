'use client';

import { useState } from 'react';

interface RollResult {
  id: number;
  dice: string;
  rolls: number[];
  modifier: number;
  total: number;
  timestamp: Date;
  label?: string;
}

interface DiceRollerProps {
  modifier?: number;
  label?: string;
  onRoll?: (result: RollResult) => void;
  compact?: boolean;
}

export default function DiceRoller({ modifier = 0, label, onRoll, compact = false }: DiceRollerProps) {
  const [lastResult, setLastResult] = useState<RollResult | null>(null);
  const [history, setHistory] = useState<RollResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [customCount, setCustomCount] = useState(1);
  const [customSides, setCustomSides] = useState(20);
  const [customMod, setCustomMod] = useState(0);
  const [showCustom, setShowCustom] = useState(false);

  const DICE = [
    { sides: 20, color: 'bg-accent-burgundy', label: 'd20' },
    { sides: 12, color: 'bg-ink-dark', label: 'd12' },
    { sides: 10, color: 'bg-accent-forest', label: 'd10' },
    { sides: 8, color: 'bg-ink-medium', label: 'd8' },
    { sides: 6, color: 'bg-accent-amber', label: 'd6' },
    { sides: 4, color: 'bg-accent-burgundy/70', label: 'd4' },
  ];

  const rollDice = (count: number, sides: number, mod: number, rollLabel?: string) => {
    setIsRolling(true);

    setTimeout(() => {
      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }

      const total = rolls.reduce((a, b) => a + b, 0) + mod + modifier;

      const result: RollResult = {
        id: Date.now(),
        dice: `${count}d${sides}${mod + modifier !== 0 ? (mod + modifier >= 0 ? '+' : '') + (mod + modifier) : ''}`,
        rolls,
        modifier: mod + modifier,
        total,
        timestamp: new Date(),
        label: rollLabel || label,
      };

      setLastResult(result);
      setHistory((prev) => [result, ...prev].slice(0, 20));
      setIsRolling(false);
      onRoll?.(result);
    }, 400);
  };

  const isNat20 = lastResult?.rolls.length === 1 && lastResult.rolls[0] === 20;
  const isNat1 = lastResult?.rolls.length === 1 && lastResult.rolls[0] === 1;

  if (compact) {
    return (
      <div className="flex gap-1 flex-wrap">
        {DICE.map((die) => (
          <button
            key={die.sides}
            onClick={() => rollDice(1, die.sides, 0)}
            disabled={isRolling}
            className={`${die.color} text-parchment-light px-3 py-1.5 rounded-lg text-sm font-heading font-semibold
              hover:opacity-90 active:scale-95 transition-all ${isRolling ? 'animate-pulse' : ''}`}
          >
            {die.label}
          </button>
        ))}
        {lastResult && (
          <span className={`ml-2 text-lg font-heading font-semibold ${isNat20 ? 'text-accent-forest' : isNat1 ? 'text-accent-burgundy' : 'text-ink-dark'}`}>
            = {lastResult.total}
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Dice Buttons */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {DICE.map((die) => (
          <button
            key={die.sides}
            onClick={() => rollDice(1, die.sides, 0)}
            disabled={isRolling}
            className={`${die.color} text-parchment-light py-4 rounded-lg font-heading font-semibold text-lg
              hover:opacity-90 active:scale-95 transition-all ${isRolling ? 'animate-pulse' : ''}`}
          >
            {die.label}
          </button>
        ))}
      </div>

      {/* Result Display */}
      <div className={`bg-parchment-light rounded-lg p-6 text-center mb-4 border-2 transition-all
        ${isNat20 ? 'border-accent-forest bg-accent-forest/5' : isNat1 ? 'border-accent-burgundy bg-accent-burgundy/5' : 'border-accent-amber/30'}`}
      >
        {lastResult ? (
          <>
            {isNat20 && <div className="text-sm font-heading font-semibold text-accent-forest mb-1">Natural 20!</div>}
            {isNat1 && <div className="text-sm font-heading font-semibold text-accent-burgundy mb-1">Natural 1!</div>}
            {lastResult.label && <div className="text-sm text-ink-medium mb-1">{lastResult.label}</div>}
            <div className={`text-5xl font-heading font-semibold mb-2 ${isRolling ? 'animate-spin' : ''}
              ${isNat20 ? 'text-accent-forest' : isNat1 ? 'text-accent-burgundy' : 'text-ink-dark'}`}>
              {isRolling ? '?' : lastResult.total}
            </div>
            <div className="text-sm text-ink-medium">
              {lastResult.dice}: [{lastResult.rolls.join(', ')}]
              {lastResult.modifier !== 0 && ` ${lastResult.modifier >= 0 ? '+' : ''}${lastResult.modifier}`}
            </div>
          </>
        ) : (
          <div className="text-ink-light text-lg font-heading">Click a die to roll</div>
        )}
      </div>

      {/* Custom Roll */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="text-sm text-ink-medium hover:text-ink-dark transition-colors mb-3 font-heading"
      >
        {showCustom ? 'Hide' : 'Show'} custom roll
      </button>

      {showCustom && (
        <div className="bg-parchment-light rounded-lg p-4 border border-accent-amber/20 mb-4">
          <div className="flex gap-2 items-center mb-3">
            <input
              type="number"
              value={customCount}
              onChange={(e) => setCustomCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="input-parchment w-16 text-center"
              min={1}
              max={20}
            />
            <span className="text-ink-medium font-heading">d</span>
            <input
              type="number"
              value={customSides}
              onChange={(e) => setCustomSides(Math.max(2, Math.min(100, parseInt(e.target.value) || 2)))}
              className="input-parchment w-20 text-center"
              min={2}
              max={100}
            />
            <span className="text-ink-medium font-heading">+</span>
            <input
              type="number"
              value={customMod}
              onChange={(e) => setCustomMod(parseInt(e.target.value) || 0)}
              className="input-parchment w-16 text-center"
              min={-20}
              max={20}
            />
            <button
              onClick={() => rollDice(customCount, customSides, customMod, `${customCount}d${customSides}${customMod ? (customMod >= 0 ? '+' : '') + customMod : ''}`)}
              disabled={isRolling}
              className="btn-primary py-2"
            >
              Roll
            </button>
          </div>
        </div>
      )}

      {/* Roll History */}
      {history.length > 0 && (
        <div className="bg-parchment-light rounded-lg p-4 border border-accent-amber/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-heading font-semibold text-ink-medium">Recent rolls</h3>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-ink-light hover:text-accent-burgundy transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto scroll-styled">
            {history.map((roll) => (
              <div key={roll.id} className="flex justify-between items-center py-1.5 border-b border-accent-amber/10 last:border-0">
                <div className="text-sm">
                  {roll.label && <span className="text-ink-medium mr-2">{roll.label}:</span>}
                  <span className="text-ink-light">{roll.dice}</span>
                  <span className="text-xs text-ink-light ml-1">[{roll.rolls.join(', ')}]</span>
                </div>
                <span className={`font-heading font-semibold ${
                  roll.rolls.length === 1 && roll.rolls[0] === 20 ? 'text-accent-forest' :
                  roll.rolls.length === 1 && roll.rolls[0] === 1 ? 'text-accent-burgundy' :
                  'text-ink-dark'
                }`}>
                  {roll.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
