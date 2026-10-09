// TORNEIO (local, v1): 2 a 8 participantes (humano ou CPU), eliminatória simples. Com número que não é potência de 2,
// alguns passam direto na 1ª rodada (sem nunca sobrar uma luta vazia). Lutas só de CPU são resolvidas na hora
// (pedido do usuário: sempre pular); as com humano são jogadas. Aqui só a chave (sem DOM), para testar fora do jogo.
//
// participante: { id, name, human, defs: [def] (solo) ou [líder, assist1, assist2] (equipe) }
// chave: rounds[r][m] = { a, b, winner }  (a/b = índice do participante ou null; winner = índice ou null)

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function bracketSize(n) {
  let s = 2;
  while (s < n) s *= 2;
  return s;
}

// nome da rodada pelo número de lutas nela: 1 = final, 2 = semifinal, 4 = quartas
export function roundKey(matches) {
  return matches === 1 ? 'final' : matches === 2 ? 'semi' : 'quarter';
}

export function createTournament(participants, { seed = Date.now() } = {}) {
  const rand = rng(seed);
  const order = participants.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const size = bracketSize(participants.length);
  const half = size / 2;
  // 1ª rodada: a luta i junta order[i] e order[i + half] — como n > size/2, nunca há luta sem ninguém
  const first = Array.from({ length: half }, (_, i) => ({ a: order[i], b: order[i + half] ?? null, winner: null }));
  const rounds = [first];
  for (let m = half / 2; m >= 1; m /= 2) rounds.push(Array.from({ length: m }, () => ({ a: null, b: null, winner: null })));
  const t = { participants, rounds, seed, rand, champion: null };
  // quem está sozinho na luta passa direto
  first.forEach((match, i) => { if (match.b === null) setWinner(t, 0, i, match.a); });
  return t;
}

// marca o vencedor e leva para a próxima rodada
export function setWinner(t, r, m, winner) {
  const match = t.rounds[r][m];
  match.winner = winner;
  if (r + 1 >= t.rounds.length) { t.champion = winner; return; }
  const next = t.rounds[r + 1][Math.floor(m / 2)];
  if (m % 2 === 0) next.a = winner; else next.b = winner;
}

// próxima luta pronta (os dois lados definidos e sem vencedor), na ordem das rodadas
export function nextMatch(t) {
  for (let r = 0; r < t.rounds.length; r++) {
    for (let m = 0; m < t.rounds[r].length; m++) {
      const x = t.rounds[r][m];
      if (x.winner === null && x.a !== null && x.b !== null) return { r, m, match: x };
    }
  }
  return null;
}

// resolve na hora TODAS as lutas só de CPU que estiverem prontas (sorteio meio a meio), mesmo que antes delas haja
// uma luta com humano esperando; repete até não sobrar nenhuma. Devolve as resolvidas
export function autoResolve(t) {
  const done = [];
  let changed = true;
  while (changed) {
    changed = false;
    t.rounds.forEach((round, r) => round.forEach((x, m) => {
      if (x.winner !== null || x.a === null || x.b === null) return;
      if (t.participants[x.a].human || t.participants[x.b].human) return;
      const w = t.rand() < 0.5 ? x.a : x.b;
      setWinner(t, r, m, w);
      done.push({ r, m, match: x, winner: w });
      changed = true;
    }));
  }
  return done;
}
