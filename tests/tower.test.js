import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTower, TOWER_FLOORS, TOWER_LEVELS } from '../src/game/tower.js';

const roster = Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, name: `C${i}` }));
const boss = { id: 'deus_morte', boss: true };

test('torre: 7 andares contra lutadores diferentes do jogador, sem repetir, e o chefe no topo', () => {
  const tw = buildTower({ player: roster[3], roster, boss, arenas: ['a', 'b'], seed: 42 });
  assert.equal(tw.floors.length, TOWER_FLOORS);
  const normal = tw.floors.slice(0, TOWER_LEVELS.length);
  assert.ok(normal.every((f) => f.def.id !== 'c3'), 'o jogador não enfrenta a si mesmo');
  assert.equal(new Set(normal.map((f) => f.def.id)).size, normal.length, 'sem repetir adversário');
  assert.deepEqual(normal.map((f) => f.level), TOWER_LEVELS);
  const top = tw.floors.at(-1);
  assert.equal(top.def.id, 'deus_morte');
  assert.ok(top.boss);
  assert.ok(tw.floors.every((f) => ['a', 'b'].includes(f.arenaId)));
  assert.equal(tw.floor, 0);
});

test('torre: mesma semente = mesma torre', () => {
  const a = buildTower({ player: roster[0], roster, boss, arenas: ['a'], seed: 7 });
  const b = buildTower({ player: roster[0], roster, boss, arenas: ['a'], seed: 7 });
  assert.deepEqual(a.floors.map((f) => f.def.id), b.floors.map((f) => f.def.id));
});
