// TORRES (estilo Torre do Mortal Kombat / Torre de Babel): 8 torres, cada uma com um VILÃO forte no topo, buffado só
// para essa luta. A 1ª começa livre; zerar uma (em qualquer dificuldade) destrava a próxima. O jogador escolhe UM
// lutador para a torre inteira (não troca) e a dificuldade. Venceu → sobe; perdeu → tenta o andar de novo ou desiste.
// O menu de torres mostra a dificuldade MAIS DIFÍCIL já zerada em cada torre.
// Aqui só os dados, a montagem e o progresso salvo (sem DOM), para dar para testar fora do navegador.

export const TOWER_DIFFICULTIES = ['easy', 'normal', 'hard', 'veryhard', 'superhard'];

// buff do vilão do topo por dificuldade (vida ×, dano causado ×, dano recebido ×)
export const BOSS_BUFF = [
  { hp: 1.3, dealt: 1.1, taken: 0.95 },
  { hp: 1.5, dealt: 1.2, taken: 0.9 },
  { hp: 1.7, dealt: 1.3, taken: 0.85 },
  { hp: 1.9, dealt: 1.4, taken: 0.8 },
  { hp: 2.2, dealt: 1.5, taken: 0.75 },
];

// Vilões possíveis no topo (formas fortes). Com poucos personagens por enquanto, o vilão de cada torre é SORTEADO a
// cada subida (pedido do usuário) — a torre muda de cor/tamanho, o chefe varia. Só a Torre de Babel é fixa.
export const VILLAINS = ['anfitriao', 'fantasma', 'aguiar_mutilador', 'labirinto_elmo', 'erin_caos', 'diabo', 'deus_morte', 'colosso'];

// floors: andares ANTES do topo. gauntlet: os andares são esses vilões e o topo é fixo (Torre de Babel); bossBuff: extra
export const TOWERS = [
  { id: 't1', numeral: 'I', color: '#d4a63a', floors: 4 },
  { id: 't2', numeral: 'II', color: '#7ad0e8', floors: 4 },
  { id: 't3', numeral: 'III', color: '#b0302a', floors: 5 },
  { id: 't4', numeral: 'IV', color: '#5a8a4a', floors: 5 },
  { id: 't5', numeral: 'V', color: '#c040c0', floors: 6 },
  { id: 't6', numeral: 'VI', color: '#e0203a', floors: 6 },
  { id: 't7', numeral: 'VII', color: '#8a8494', floors: 7, bossBuff: 1.05 },
  { id: 'babel', numeral: 'VIII', boss: 'deus_morte', color: '#f0e0a0', gauntlet: ['anfitriao', 'fantasma', 'aguiar_mutilador', 'labirinto_elmo', 'erin_caos', 'diabo'], bossBuff: 1.15 },
];

// vilão desta subida: o fixo da torre ou um sorteado
export function pickBoss(tower, seed = Date.now()) {
  if (tower.boss) return tower.boss;
  const r = rng(seed ^ 0x5bd1e995)();
  return VILLAINS[Math.floor(r * VILLAINS.length)];
}

export const towerFloorCount = (tower) => (tower.gauntlet ? tower.gauntlet.length : tower.floors) + 1;

const SAVE_KEY = 'arena_torres';

// sorteio com semente
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// nível da CPU de cada andar: a dificuldade escolhida vale para a torre INTEIRA (pedido do usuário)
export function floorLevel(difficulty) {
  return TOWER_DIFFICULTIES.includes(difficulty) ? difficulty : 'normal';
}

// tower: um item de TOWERS; roster: lutadores jogáveis; getForm(id): definição dos vilões; arenas: ids dos cenários
// boss: id do vilão (pickBoss); o próprio lutador do jogador PODE aparecer nos andares (Kaiser × Kaiser vale)
export function buildTower({ tower, player, roster, getForm, arenas, difficulty = 'normal', seed = Date.now(), boss = pickBoss(tower, seed) }) {
  const rand = rng(seed);
  const arena = () => arenas[Math.floor(rand() * arenas.length)];
  let defs;
  if (tower.gauntlet) defs = tower.gauntlet.map((id) => getForm(id));
  else {
    const pool = roster.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    defs = Array.from({ length: tower.floors }, (_, i) => pool[i % pool.length]);
  }
  const floors = defs.map((def) => ({ def, level: floorLevel(difficulty), arenaId: arena(), boss: false }));
  const d = Math.max(0, TOWER_DIFFICULTIES.indexOf(difficulty));
  const b = BOSS_BUFF[d];
  const extra = tower.bossBuff || 1;
  floors.push({
    def: getForm(boss), level: difficulty, arenaId: arena(), boss: true,
    buff: { hp: b.hp * extra, dealt: b.dealt * extra, taken: b.taken / extra },
  });
  return { tower, player, difficulty, floors, floor: 0, seed, boss };
}

// ---------------- progresso salvo: { [torre]: índice da dificuldade mais difícil zerada }
export function loadTowerProgress() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch { return {}; }
}

// dificuldade mais difícil já zerada nesta torre (ou null)
export function bestDifficulty(towerId, progress = loadTowerProgress()) {
  const i = progress[towerId];
  return Number.isInteger(i) ? TOWER_DIFFICULTIES[i] : null;
}

// a 1ª torre é livre; as outras abrem quando a anterior foi zerada
export function isTowerUnlocked(index, progress = loadTowerProgress()) {
  return index === 0 || Number.isInteger(progress[TOWERS[index - 1].id]);
}

// zerou: guarda só se for mais difícil que a já salva; devolve true quando melhorou
export function saveTowerClear(towerId, difficulty) {
  const p = loadTowerProgress();
  const d = TOWER_DIFFICULTIES.indexOf(difficulty);
  if (Number.isInteger(p[towerId]) && p[towerId] >= d) return false;
  p[towerId] = d;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(p)); } catch { /* sem armazenamento */ }
  return true;
}
