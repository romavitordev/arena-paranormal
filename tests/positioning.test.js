import test from 'node:test';
import assert from 'node:assert/strict';
import { findSpotBehind, findSubstitutionSpot, isSpotFree } from '../src/combat/positioning.js';

const target = { x: 0, z: 0, yaw: 0 };
const substitutionSpot = { distance: 1.7, radius: 0.5, targetRadius: 0.5 };

test('finds a free substitution point behind the opponent', () => {
  const arena = { radius: 10, colliders: [], boxes: [] };

  const spot = findSpotBehind(arena, target, substitutionSpot);

  assert.ok(spot);
  assert.ok(spot.z < 0);
  assert.ok(Math.abs(Math.hypot(spot.x, spot.z) - substitutionSpot.distance) < 1e-9);
  assert.ok(isSpotFree(arena, spot.x, spot.z, substitutionSpot.radius, [
    { x: target.x, z: target.z, r: substitutionSpot.targetRadius + 0.05 },
  ]));
});

test('chooses a safe alternative when the point directly behind is blocked', () => {
  const arena = { radius: 10, colliders: [{ x: 0, z: -1.7, r: 0.55 }], boxes: [] };

  const spot = findSpotBehind(arena, target, substitutionSpot);

  assert.ok(spot);
  assert.notDeepEqual(spot, { x: 0, z: -1.7 });
  assert.ok((spot.x - target.x) * -Math.sin(target.yaw) + (spot.z - target.z) * -Math.cos(target.yaw) >= 0);
  assert.ok(isSpotFree(arena, spot.x, spot.z, substitutionSpot.radius, [
    { x: target.x, z: target.z, r: substitutionSpot.targetRadius + 0.05 },
  ]));
});

test('does not return a substitution point when the arena has no room', () => {
  const arena = { radius: 1, colliders: [], boxes: [] };

  assert.equal(findSpotBehind(arena, target, substitutionSpot), null);
});

// Substituição: desvio curto perto de onde estava, nunca atrás do atacante
const attacker = { x: 0, z: 0 };
const victim = { x: 0, z: 1.2 };
const subst = { sidestep: 1.2, back: 0.4, radius: 0.5, attackerRadius: 0.5 };
const behindAttacker = (p) => (p.x - attacker.x) * (victim.x - attacker.x) + (p.z - attacker.z) * (victim.z - attacker.z) < 0;

test('substitution sidesteps close to where the fighter was', () => {
  const arena = { radius: 10, colliders: [], boxes: [] };

  const spot = findSubstitutionSpot(arena, victim, attacker, subst);

  assert.ok(Math.hypot(spot.x - victim.x, spot.z - victim.z) <= 1.5);
  assert.ok(Math.abs(spot.x - victim.x) > 0.5, 'deve sair para o lado');
  assert.ok(!behindAttacker(spot));
  assert.ok(isSpotFree(arena, spot.x, spot.z, subst.radius, [{ x: 0, z: 0, r: 0.55 }]));
});

test('substitution follows the held direction and is deterministic', () => {
  const arena = { radius: 10, colliders: [], boxes: [] };

  const right = findSubstitutionSpot(arena, victim, attacker, { ...subst, side: 1 });
  const left = findSubstitutionSpot(arena, victim, attacker, { ...subst, side: -1 });

  assert.ok(Math.sign(right.x) !== Math.sign(left.x));
  assert.deepEqual(findSubstitutionSpot(arena, victim, attacker, subst), findSubstitutionSpot(arena, victim, attacker, subst));
});

test('substitution picks the other side when one is blocked', () => {
  const blocked = findSubstitutionSpot({ radius: 10, colliders: [], boxes: [] }, victim, attacker, { ...subst, side: 1 });
  const arena = { radius: 10, colliders: [{ x: blocked.x, z: blocked.z, r: 0.8 }], boxes: [] };

  const spot = findSubstitutionSpot(arena, victim, attacker, { ...subst, side: 1 });

  assert.ok(Math.sign(spot.x) !== Math.sign(blocked.x));
  assert.ok(!behindAttacker(spot));
});

test('substitution stays in place when there is no room around', () => {
  const arena = { radius: 10, colliders: [], boxes: [{ minX: -5, maxX: 5, minZ: 1.6, maxZ: 5 }, { minX: -5, maxX: -0.6, minZ: -5, maxZ: 5 }, { minX: 0.6, maxX: 5, minZ: -5, maxZ: 5 }] };

  assert.deepEqual(findSubstitutionSpot(arena, victim, attacker, subst), { x: victim.x, z: victim.z });
});
