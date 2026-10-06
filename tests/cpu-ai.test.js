import test from 'node:test';
import assert from 'node:assert/strict';
import { CPU_LEVELS, OpponentPatternMemory } from '../src/ai/CpuController.js';
import { observePlayerMove, playerMoveRate } from '../src/ai/learner.js';

test('CPU tactics and adaptation increase with difficulty below Super Difícil', () => {
  assert.equal(CPU_LEVELS.easy.tactics, 0);
  assert.ok(CPU_LEVELS.normal.tactics < CPU_LEVELS.hard.tactics);
  assert.ok(CPU_LEVELS.hard.tactics < CPU_LEVELS.veryhard.tactics);
  assert.ok(CPU_LEVELS.normal.adapt < CPU_LEVELS.hard.adapt);
  assert.ok(CPU_LEVELS.hard.adapt < CPU_LEVELS.veryhard.adapt);
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
