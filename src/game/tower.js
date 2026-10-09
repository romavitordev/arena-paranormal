// TORRE (estilo Torre do Mortal Kombat): o jogador escolhe um lutador e sobe andar por andar contra a CPU.
// Venceu → sobe. Perdeu → pode tentar o mesmo andar de novo ou desistir. No topo, o chefe: O DEUS DA MORTE.
// Aqui só a montagem da torre e o recorde (sem DOM), para dar para testar fora do navegador.

// dificuldade de cada andar (o último é o chefe)
export const TOWER_LEVELS = ['easy', 'easy', 'normal', 'normal', 'hard', 'hard', 'veryhard'];
export const TOWER_BOSS = { id: 'deus_morte', level: 'hard' };
export const TOWER_FLOORS = TOWER_LEVELS.length + 1;

const RECORD_KEY = 'arena_torre_recorde';

// sorteio com semente (mesma torre ao tentar de novo um andar; nova torre a cada partida)
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// roster: lutadores jogáveis; boss: definição do chefe; arenas: ids dos cenários disponíveis
export function buildTower({ player, roster, boss, arenas, seed = Date.now() }) {
  const rand = rng(seed);
  const pool = roster.filter((c) => c.id !== player.id);
  // embaralha e pega um adversário diferente por andar (sem repetir enquanto houver lutadores)
  const order = pool.slice();
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const arena = () => arenas[Math.floor(rand() * arenas.length)];
  const floors = TOWER_LEVELS.map((level, i) => ({ def: order[i % order.length], level, arenaId: arena(), boss: false }));
  if (boss) floors.push({ def: boss, level: TOWER_BOSS.level, arenaId: arena(), boss: true });
  return { player, floors, floor: 0, wins: 0, seed };
}

export function loadRecords() {
  try { return JSON.parse(localStorage.getItem(RECORD_KEY) || '{}') || {}; } catch { return {}; }
}

// andares vencidos (recorde) com este lutador
export function towerRecord(charId) {
  return loadRecords()[charId] || 0;
}

// guarda o recorde se for maior; devolve true quando é recorde novo
export function saveTowerRecord(charId, floorsBeaten) {
  const all = loadRecords();
  if ((all[charId] || 0) >= floorsBeaten) return false;
  all[charId] = floorsBeaten;
  try { localStorage.setItem(RECORD_KEY, JSON.stringify(all)); } catch { /* sem armazenamento */ }
  return true;
}
