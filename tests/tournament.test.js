import test from 'node:test';
import assert from 'node:assert/strict';
import { createTournament, nextMatch, setWinner, autoResolve, bracketSize, roundKey } from '../src/game/tournament.js';

const people = (n, humans = []) => Array.from({ length: n }, (_, i) => ({ id: i, name: `P${i}`, human: humans.includes(i), defs: [] }));

test('torneio: tamanho da chave e nomes das rodadas', () => {
  assert.deepEqual([2, 3, 4, 5, 8].map(bracketSize), [2, 4, 4, 8, 8]);
  assert.deepEqual([1, 2, 4].map(roundKey), ['final', 'semi', 'quarter']);
});

test('torneio: de 2 a 8 participantes, todos aparecem uma vez e quem sobra passa direto (sem luta vazia)', () => {
  for (let n = 2; n <= 8; n++) {
    const t = createTournament(people(n), { seed: n });
    const first = t.rounds[0].flatMap((m) => [m.a, m.b]).filter((x) => x !== null);
    assert.deepEqual([...first].sort(), [...Array(n).keys()], `n=${n}`);
    assert.ok(t.rounds[0].every((m) => m.a !== null), 'nenhuma luta sem ninguém');
    assert.equal(t.rounds.at(-1).length, 1, 'termina numa final');
  }
});

test('torneio: lutas só de CPU se resolvem sozinhas e param na primeira com humano', () => {
  const t = createTournament(people(8, [0]), { seed: 3 });
  autoResolve(t);
  const n = nextMatch(t);
  assert.ok(n, 'tem luta com humano');
  assert.ok(t.participants[n.match.a].human || t.participants[n.match.b].human);
});

test('torneio: jogando até o fim sai um campeão', () => {
  const t = createTournament(people(6, [0, 1]), { seed: 9 });
  let guard = 0;
  autoResolve(t);
  for (let n = nextMatch(t); n && guard < 20; n = nextMatch(t), guard++) {
    setWinner(t, n.r, n.m, n.match.a);
    autoResolve(t);
  }
  assert.notEqual(t.champion, null);
  assert.equal(nextMatch(t), null);
});

test('torneio: todo mundo CPU termina sem nenhuma luta jogada', () => {
  const t = createTournament(people(5), { seed: 1 });
  autoResolve(t);
  assert.notEqual(t.champion, null);
});

test('torneio: luta só de CPU é sorteada mesmo com uma luta de humano antes dela na rodada', () => {
  const t = createTournament(people(4, [0]), { seed: 1 });
  autoResolve(t);
  const cpuOnly = t.rounds[0].filter((m) => !t.participants[m.a].human && !t.participants[m.b].human);
  assert.ok(cpuOnly.every((m) => m.winner !== null));
});
