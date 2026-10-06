// APRENDIZADO DA CPU (nível Super Difícil). Leve, sem bibliotecas: um "bandit" contextual por tabela.
//
// Situação (estado) = distância (4 faixas) × o que o adversário está fazendo (4) × vida baixa ou não.
// Em cada decisão a CPU escolhe uma AÇÃO (combo, agarrão, uma habilidade, ataque à distância, especial, dash, carregar,
// defender, esperar); 1,5 s depois mede o resultado: (dano causado − dano recebido) / 100. O valor da ação naquela
// situação anda em direção ao resultado (média móvel). Na próxima decisão parecida, ações que deram certo têm mais
// chance — mas sempre misturadas com a preferência "de fábrica" (prior) e um pouco de exploração, para a IA não virar
// uma máquina que só faz uma coisa.
//
// Aprende CONTRA JOGADORES (é o caso principal) e também CPU × CPU. Além das ações, guarda o PERFIL dos jogadores
// humanos: em cada faixa de distância, o quanto eles atacam, defendem, pulam e atiram; também registra os golpes mais
// repetidos para a CPU adaptar a defesa.
//
// Onde fica salvo:
//   - no navegador (localStorage 'arena.ai.v1') — vale para quem joga a versão publicada;
//   - em public/ai/learned.json — o ponto de partida que vai junto com o jogo. No servidor de desenvolvimento
//     (npm run dev) o jogo envia o aprendido para lá (POST /__ai/learned, ver vite.config.js), então o que foi aprendido
//     jogando entra no próximo commit/push e a próxima versão já sai mais inteligente.

const KEY = 'arena.ai.v1';
const VERSION = 1;
const ALPHA = 0.18; // velocidade de aprendizado
const MAX_Q = 1.5; // o valor aprendido de uma ação fica em [-1.5, 1.5]
const WINDOW = 1.5; // segundos para medir o resultado de uma ação

let data = { version: VERSION, games: 0, tables: {}, player: {}, moves: { seen: 0, counts: {} } }; // games = rounds aprendidos
let loaded = false;
let lastSave = 0;
let dirty = false;

export function distBin(d) {
  return d < 2.3 ? 0 : d < 5 ? 1 : d < 9 ? 2 : 3;
}

export function oppBin(opp) {
  const s = opp.state;
  if (s === 'attack' || s === 'dashing' || s === 'ranged' || s === 'ability' || s === 'specialStart' || s === 'special') return 'atk';
  if (s === 'block') return 'blk';
  if (s === 'stun' || s === 'hitstun' || s === 'downed' || s === 'launched' || s === 'grabbed' || s === 'pulled') return 'vul';
  return 'neu';
}

export function stateKey(f, opp, d) {
  return `${distBin(d)}|${oppBin(opp)}|${f.health < f.maxHealth * 0.3 ? 'L' : 'H'}`;
}

function mergeInto(dst, src) {
  // junta duas memórias: valores ponderados pelo número de vezes que cada uma viu a situação
  for (const id in src.tables || {}) {
    const T = (dst.tables[id] = dst.tables[id] || {});
    for (const k in src.tables[id]) {
      const S = (T[k] = T[k] || {});
      for (const a in src.tables[id][k]) {
        const x = src.tables[id][k][a];
        const y = S[a];
        if (!y) S[a] = { q: x.q, n: x.n };
        else {
          const n = y.n + x.n;
          S[a] = { q: n ? (y.q * y.n + x.q * x.n) / n : 0, n };
        }
      }
    }
  }
  for (const b in src.player || {}) {
    const P = (dst.player[b] = dst.player[b] || { seen: 0, atk: 0, blk: 0, jump: 0, ranged: 0 });
    for (const k in src.player[b]) P[k] = (P[k] || 0) + src.player[b][k];
  }
  const moves = (dst.moves = dst.moves || { seen: 0, counts: {} });
  moves.counts = moves.counts || {};
  moves.seen += src.moves?.seen || 0;
  for (const id in src.moves?.counts || {}) moves.counts[id] = (moves.counts[id] || 0) + src.moves.counts[id];
  dst.games = (dst.games || 0) + (src.games || 0);
}

// carrega o aprendido do jogo (public/ai/learned.json) + o do navegador; chamada uma vez ao abrir o jogo
export async function loadLearned(base = '/') {
  if (loaded) return data;
  loaded = true;
  try {
    const r = await fetch(`${base}ai/learned.json`, { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json();
      if (j && j.version === VERSION) mergeInto(data, j);
    }
  } catch { /* sem arquivo: começa do zero */ }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const j = JSON.parse(raw);
      // o local guarda SÓ o que foi aprendido depois do arquivo do jogo (delta), para não contar duas vezes
      if (j && j.version === VERSION && j.delta) {
        mergeInto(data, j.delta);
        localDelta = j.delta;
        localDelta.moves = localDelta.moves || { seen: 0, counts: {} };
      }
    }
  } catch { /* armazenamento bloqueado: segue só com o do jogo */ }
  return data;
}

// o que foi aprendido NESTE navegador (vai para o localStorage e, no dev, para o arquivo)
let localDelta = { version: VERSION, games: 0, tables: {}, player: {}, moves: { seen: 0, counts: {} } };

function cell(tables, id, key, action) {
  const T = (tables[id] = tables[id] || {});
  const S = (T[key] = T[key] || {});
  return (S[action] = S[action] || { q: 0, n: 0 });
}

export function valueOf(id, key, action) {
  // mistura a tabela do personagem com a geral (todos os personagens), confiando mais na que viu mais vezes
  const a = data.tables[id]?.[key]?.[action];
  const g = data.tables._all?.[key]?.[action];
  const na = a?.n || 0;
  const ng = g?.n || 0;
  if (!na && !ng) return { q: 0, n: 0 };
  const wa = na * 2;
  return { q: ((a?.q || 0) * wa + (g?.q || 0) * ng) / (wa + ng), n: na + ng };
}

function learn(id, key, action, reward) {
  const r = Math.max(-MAX_Q, Math.min(MAX_Q, reward));
  for (const tables of [data.tables, localDelta.tables]) {
    for (const tid of [id, '_all']) {
      const c = cell(tables, tid, key, action);
      c.n++;
      c.q += (r - c.q) * Math.max(ALPHA, 1 / c.n);
    }
  }
  dirty = true;
}

// escolhe uma ação: softmax sobre (prior + valor aprendido × confiança); um pouco de exploração sempre
export function choose(id, key, options, { temp = 0.35, explore = 0.08 } = {}) {
  if (!options.length) return null;
  if (Math.random() < explore) return options[Math.floor(Math.random() * options.length)];
  const scores = options.map((o) => {
    const v = valueOf(id, key, o.id);
    const conf = v.n / (v.n + 4); // pouca experiência = confia mais no prior
    return Math.log(Math.max(0.01, o.prior)) * 0.6 + v.q * 2.2 * conf;
  });
  const m = Math.max(...scores);
  const ws = scores.map((s) => Math.exp((s - m) / temp));
  let r = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < options.length; i++) { r -= ws[i]; if (r <= 0) return options[i]; }
  return options[options.length - 1];
}

// ---- perfil do jogador humano
export function observePlayer(opp, d) {
  const b = distBin(d);
  const P = (data.player[b] = data.player[b] || { seen: 0, atk: 0, blk: 0, jump: 0, ranged: 0 });
  const L = (localDelta.player[b] = localDelta.player[b] || { seen: 0, atk: 0, blk: 0, jump: 0, ranged: 0 });
  const s = opp.state;
  // pulo = no ar POR VONTADE (parado no ar, não lançado por um golpe)
  const hit = s === 'attack' ? 'atk' : s === 'block' ? 'blk' : s === 'ranged' ? 'ranged' : s === 'idle' && !opp.onGround ? 'jump' : null;
  for (const X of [P, L]) {
    X.seen++;
    if (hit) X[hit]++;
  }
  dirty = true;
}

// tendência do jogador naquela distância (0..1) — com pouca observação volta para um valor neutro
export function playerTendency(d, what) {
  const P = data.player[distBin(d)];
  const neutral = { atk: 0.3, blk: 0.15, jump: 0.08, ranged: 0.1 }[what] ?? 0.1;
  if (!P || P.seen < 60) return neutral;
  const w = Math.min(1, P.seen / 600);
  return neutral * (1 - w) + (P[what] / P.seen) * w;
}

export function observePlayerMove(move) {
  if (!move) return;
  for (const target of [data.moves, localDelta.moves]) {
    target.seen = (target.seen || 0) + 1;
    target.counts = target.counts || {};
    target.counts[move] = (target.counts[move] || 0) + 1;
  }
  dirty = true;
}

export function playerMoveRate(move) {
  const profile = data.moves;
  if (!move || !profile || profile.seen < 8) return 0;
  return (profile.counts?.[move] || 0) / profile.seen;
}

// ---- episódio: cada controlador registra as ações e o resultado depois de WINDOW s
export class Episode {
  constructor(id) {
    this.id = id;
    this.pending = [];
  }

  record(key, action, f, opp, now) {
    this.pending.push({ key, action, t: now, dealt: opp.dmgTaken || 0, taken: f.dmgTaken || 0 });
  }

  update(f, opp, now, force = false) {
    while (this.pending.length && (force || now - this.pending[0].t >= WINDOW)) {
      const p = this.pending.shift();
      const dealt = (opp.dmgTaken || 0) - p.dealt;
      const taken = (f.dmgTaken || 0) - p.taken;
      learn(this.id, p.key, p.action, (dealt - taken * 1.1) / 100);
    }
  }
}

export function noteGame() {
  data.games = (data.games || 0) + 1;
  localDelta.games = (localDelta.games || 0) + 1;
  dirty = true;
}

// salva no navegador; no servidor de desenvolvimento também grava o arquivo do jogo (throttle de 4 s)
export function saveLearned(now = performance.now(), force = false) {
  if (!dirty || (!force && now - lastSave < 4000)) return;
  lastSave = now;
  dirty = false;
  try { localStorage.setItem(KEY, JSON.stringify({ version: VERSION, delta: localDelta })); } catch { /* sem armazenamento */ }
  if (import.meta.env && import.meta.env.DEV) {
    // o servidor junta este delta ao public/ai/learned.json; depois de gravado, o delta local zera (já está no arquivo)
    const body = JSON.stringify({ version: VERSION, delta: localDelta });
    fetch('/__ai/learned', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      .then((r) => {
        if (!r.ok) return;
        localDelta = { version: VERSION, games: 0, tables: {}, player: {}, moves: { seen: 0, counts: {} } };
        try { localStorage.setItem(KEY, JSON.stringify({ version: VERSION, delta: localDelta })); } catch { /* ok */ }
      })
      .catch(() => { /* servidor sem o plugin: fica só no navegador */ });
  }
}

export function learnedStats() {
  let cells = 0;
  for (const id in data.tables) for (const k in data.tables[id]) cells += Object.keys(data.tables[id][k]).length;
  return { games: data.games || 0, characters: Object.keys(data.tables).filter((k) => k !== '_all').length, cells };
}

// para o servidor de desenvolvimento e testes
export { mergeInto as _mergeInto };
