import test from 'node:test';
import assert from 'node:assert/strict';
import { findSpotBehind, isSpotFree } from '../src/combat/positioning.js';

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
