import test from 'node:test';
import assert from 'node:assert/strict';
import { battleLines } from '../src/config/dialogues.js';

test('battle dialogue returns a two-character exchange for critical health', () => {
  const lines = battleLines('xande', 'verissimo', 'critical');

  assert.equal(lines.length, 2);
  assert.deepEqual(lines.map(([id]) => id), ['xande', 'verissimo']);
  assert.ok(lines.every(([, text]) => text.length > 0));
});

test('special dialogue returns an exchange for transformed characters', () => {
  const lines = battleLines('anfitriao', 'deus_morte', 'special');

  assert.equal(lines.length, 2);
  assert.deepEqual(lines.map(([id]) => id), ['anfitriao', 'deus_morte']);
  assert.ok(lines.every(([, text]) => text.length > 0));
});

test('transformation dialogue is only defined for transformation events', () => {
  const lines = battleLines('diabo', 'xande', 'transform');

  assert.equal(lines.length, 2);
  assert.equal(battleLines('diabo', 'xande', 'unknown'), null);
});
