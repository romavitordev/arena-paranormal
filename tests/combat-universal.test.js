import test from 'node:test';
import assert from 'node:assert/strict';
import { COMBAT } from '../src/config/combat.js';

test('dodge parameters adhere to design specifications', () => {
  assert.equal(COMBAT.dodge.damagePerCharge, 70, '1 carga a cada 70 de dano');
  assert.equal(COMBAT.dodge.emptyLockout, 3, '3 segundos sem recarga quando zerado');
  assert.equal(COMBAT.cargaComboWindow, 0.4, 'janela Y -> B / Y -> X de 0.4s');
});

test('defense step cooldown matches duration for fluid continuous dodge', () => {
  assert.equal(COMBAT.dash.step.duration, 0.2);
  assert.equal(COMBAT.dash.step.cooldown, 0.2, 'passos rápidos encadeiam continuamente');
});

test('substitution costs 1 charge and provides safety window', () => {
  assert.equal(COMBAT.substitution.charges, 1);
  assert.ok(COMBAT.substitution.cooldown >= 1.0);
  assert.ok(COMBAT.substitution.iframes >= 0.3);
});

test('throw tech window and scaling rules are configured', () => {
  assert.ok(COMBAT.grabTech.window >= 0.2);
  assert.equal(COMBAT.comboScalingFloor.grab, 0.75);
  assert.equal(COMBAT.comboScalingFloor.special, 0.75);
  assert.equal(COMBAT.comboScaling[COMBAT.comboScaling.length - 1], 0.5, 'escala minima de combo 50%');
});

test('elemental affinity cycle provides balanced advantage and disadvantage', () => {
  assert.equal(COMBAT.elements.advantage, 1.15, '+15% de vantagem');
  assert.equal(COMBAT.elements.disadvantage, 0.85, '-15% de desvantagem');
});
