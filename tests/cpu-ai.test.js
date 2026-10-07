import test from 'node:test';
import assert from 'node:assert/strict';
import { abilityUsePrior, canSpendDodge, CPU_LEVELS, OpponentPatternMemory } from '../src/ai/CpuController.js';
import { observePlayerMove, playerMoveRate } from '../src/ai/learner.js';

test('CPU tactics and adaptation increase with difficulty below Super Difícil', () => {
  assert.equal(CPU_LEVELS.easy.tactics, 0);
  assert.ok(CPU_LEVELS.normal.tactics < CPU_LEVELS.hard.tactics);
  assert.ok(CPU_LEVELS.hard.tactics < CPU_LEVELS.veryhard.tactics);
  assert.ok(CPU_LEVELS.normal.adapt < CPU_LEVELS.hard.adapt);
  assert.ok(CPU_LEVELS.hard.adapt < CPU_LEVELS.veryhard.adapt);
});

test('CPU retains enough dodge charges for substitution unless a projectile is imminent', () => {
  const fighter = { dodges: 2, cooldowns: { dodge: 0 } };
  assert.equal(canSpendDodge(fighter), false);

  fighter.dodges = 3;
  assert.equal(canSpendDodge(fighter), true);

  fighter.dodges = 1;
  assert.equal(canSpendDodge(fighter), false);
  assert.equal(canSpendDodge(fighter, true), true);

  fighter.dodges = 3;
  fighter.cooldowns.dodge = 0.2;
  assert.equal(canSpendDodge(fighter, true), false);
});

test('CPU ability priorities respond to openings, health, and active buffs', () => {
  const fighter = {
    health: 400,
    maxHealth: 1000,
    findBuff: (type) => ['heavyProtection', 'healing'].includes(type) ? { type } : null,
  };
  const opponent = { state: 'attack', isInvulnerable: () => false };
  const heal = { id: 'heal', type: 'healOverTime' };
  const protection = { id: 'guard', type: 'heavyProtection' };
  const punish = { id: 'punish', type: 'heavyBlow', ai: { when: 'opening' } };

  assert.equal(abilityUsePrior(heal, fighter, opponent, { distance: 5, lowHp: true }), 0);
  assert.equal(abilityUsePrior(protection, fighter, opponent, { distance: 2, lowHp: true, threat: true }), 0);
  assert.ok(abilityUsePrior(heal, { ...fighter, findBuff: () => null }, opponent, { distance: 5, lowHp: true }) > 0);
  assert.equal(abilityUsePrior(punish, fighter, opponent, { distance: 2, opening: false }), 0);
  assert.ok(abilityUsePrior(punish, fighter, opponent, { distance: 2, opening: true }) > 0);
});

test('opponent pattern memory counts repeated moves and expires old observations', () => {
  const memory = new OpponentPatternMemory();
  const strike = { name: 'Corte lateral' };
  const opponent = {
    def: { id: 'arnaldo', ranged: null, special: null },
    state: 'attack',
    stateTime: 0,
    combo: { strike },
  };

  const move = memory.observe(opponent, 0);
  assert.equal(memory.count(move, 0), 1);

  opponent.state = 'idle';
  memory.observe(opponent, 0.4);
  opponent.state = 'attack';
  opponent.stateTime = 0;
  memory.observe(opponent, 1);
  assert.equal(memory.count(move, 1), 2);

  opponent.combo.strike = { name: 'Estocada' };
  opponent.stateTime = 0;
  const otherMove = memory.observe(opponent, 1.5);
  assert.notEqual(otherMove, move);
  assert.equal(memory.count(otherMove, 1.5), 1);
  assert.equal(memory.count(move, 14), 0);
});

test('player move profile learns repeated moves for later matches', () => {
  const move = 'melee:test-character:Test Strike';
  const other = 'ranged:test-character:main';
  assert.equal(playerMoveRate(move), 0);

  for (let i = 0; i < 6; i++) observePlayerMove(move);
  for (let i = 0; i < 2; i++) observePlayerMove(other);

  assert.equal(playerMoveRate(move), 0.75);
  assert.equal(playerMoveRate(other), 0.25);
});
