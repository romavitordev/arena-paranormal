import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTower, floorLevel, towerFloorCount, isTowerUnlocked, bestDifficulty, pickBoss, TOWERS, TOWER_DIFFICULTIES, VILLAINS } from '../src/game/tower.js';

const roster = Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, name: `C${i}` }));
roster.push({ id: 'arnaldo', name: 'Arnaldo' });
const getForm = (id) => ({ id, name: id.toUpperCase(), form: true });

test('torres: 8, a 1ª livre e as outras abrem quando a anterior é zerada', () => {
  assert.equal(TOWERS.length, 8);
  assert.ok(isTowerUnlocked(0, {}));
  assert.ok(!isTowerUnlocked(1, {}));
  assert.ok(isTowerUnlocked(1, { [TOWERS[0].id]: 0 }));
  assert.ok(!isTowerUnlocked(2, { [TOWERS[0].id]: 4 }));
});

test('torre: andares sem repetir (o próprio lutador pode aparecer) e um vilão sorteado e buffado no topo', () => {
  const tower = TOWERS[0];
  const tw = buildTower({ tower, player: roster[3], roster, getForm, arenas: ['a', 'b'], difficulty: 'hard', seed: 42 });
  assert.equal(tw.floors.length, towerFloorCount(tower));
  const normal = tw.floors.slice(0, -1);
  assert.equal(new Set(normal.map((f) => f.def.id)).size, normal.length);
  const top = tw.floors.at(-1);
  assert.ok(VILLAINS.includes(top.def.id));
  assert.equal(top.def.id, pickBoss(tower, 42));
  assert.ok(top.boss && top.buff.hp > 1 && top.buff.dealt > 1 && top.buff.taken < 1);
  assert.equal(top.level, 'hard');
});

test('torre: a dificuldade escolhida vale para todos os andares', () => {
  const tw = buildTower({ tower: TOWERS[2], player: roster[0], roster, getForm, arenas: ['a'], difficulty: 'veryhard', seed: 3 });
  assert.ok(tw.floors.every((f) => f.level === 'veryhard'));
  assert.equal(floorLevel('???'), 'normal');
});

test('torre de Babel: os andares são os vilões das outras torres', () => {
  const babel = TOWERS.at(-1);
  const tw = buildTower({ tower: babel, player: roster[0], roster, getForm, arenas: ['a'], difficulty: 'superhard' });
  assert.deepEqual(tw.floors.slice(0, -1).map((f) => f.def.id), babel.gauntlet);
  assert.ok(tw.floors.at(-1).buff.hp > 2.2);
});

test('progresso: guarda a dificuldade mais difícil zerada', () => {
  assert.equal(bestDifficulty('x', {}), null);
  assert.equal(bestDifficulty('x', { x: 3 }), TOWER_DIFFICULTIES[3]);
});
