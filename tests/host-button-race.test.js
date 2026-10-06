import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseButtonWinner } from '../src/combat/hostButtonRace.js';

const center = { x: 0, z: 0 };
const fighter = (index, x, z) => ({ index, pos: { x, z } });

test('the closest fighter who pressed the button wins', () => {
  const farther = fighter(0, 1.2, 0);
  const closer = fighter(1, 0.7, 0);

  assert.equal(chooseButtonWinner([farther, closer], center, 42), closer);
});

test('a press outside the button radius is ignored', () => {
  assert.equal(chooseButtonWinner([fighter(0, 2, 0)], center, 42), null);
});

test('simultaneous presses are resolved deterministically by frame parity', () => {
  const first = fighter(0, 1, 0);
  const second = fighter(1, -1, 0);

  assert.equal(chooseButtonWinner([second, first], center, 42), first);
  assert.equal(chooseButtonWinner([first, second], center, 43), second);
});
