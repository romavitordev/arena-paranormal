// Telemetria de equilíbrio: lutas CPU × CPU em todos os pares, sem renderizar.
// Uso no console do navegador (com o jogo carregado):
//   const { runBalance } = await import('/src/dev/balance.js');
//   const r = await runBalance({ fights: 4, maxTime: 120 });   // r.table, r.matrix, r.moves
import { ROSTER } from '../characters/index.js';
import { CpuController } from '../ai/CpuController.js';

// focus: só os pares de um lutador (ex.: personagem novo contra todo o elenco). O resultado também fica em window.__balance.
export async function runBalance({ fights = 4, maxTime = 150, ids = ROSTER.map((c) => c.id), arena, level = 'normal', focus = null } = {}) {
  const g = window.__game;
  const inp = g.input;
  const stats = Object.fromEntries(ids.map((id) => [id, { wins: 0, fights: 0, dealt: 0, taken: 0, rounds: 0, moves: {} }]));
  const matrix = Object.fromEntries(ids.map((a) => [a, Object.fromEntries(ids.map((b) => [b, 0]))]));
  const dt = 1 / 60;
  for (const a of ids) {
    for (const b of ids) {
      if (a === b) continue;
      if (focus && a !== focus && b !== focus) continue;
      for (let n = 0; n < fights; n++) {
        const m = g.quick(a, b, true, arena);
        inp.players[0].setVirtual(null);
        inp.players[0].cpu = new CpuController({ level });
        inp.players[1].cpu = new CpuController({ level });
        inp.players[1].cpu.attach(m.fighters[1]);
        inp.players[0].cpu.attach(m.fighters[0]);
        const w = m.world;
        const prev = w.onHit;
        w.onHit = (att, vic, dmg, o) => {
          prev && prev(att, vic, dmg, o);
          if (!att || !vic || att === vic) return;
          // transformados (Diabo, Fantasma...) contam para o personagem de origem; NPCs (zumbi, clone) ficam de fora
          const idOf = (f) => (f.baseForm ? f.baseForm.def.id : f.def && f.def.id);
          const sa = stats[idOf(att)];
          const sv = stats[idOf(vic)];
          if (!sa || !sv) return;
          sa.dealt += dmg || 0;
          sv.taken += dmg || 0;
          const key = o && o.blocked ? 'defendido' : (o && (o.strike?.name || o.ability || o.kind)) || '?';
          sa.moves[key] = (sa.moves[key] || 0) + 1;
        };
        let t = 0;
        while (m.phase !== 'over' && t < maxTime * 3) {
          inp.update(dt);
          m.update(dt);
          t += dt;
        }
        const [wa, wb] = m.wins;
        stats[a].fights++;
        stats[b].fights++;
        stats[a].rounds += wa;
        stats[b].rounds += wb;
        if (wa > wb) { stats[a].wins++; matrix[a][b]++; } else if (wb > wa) { stats[b].wins++; matrix[b][a]++; }
        // não trava a aba
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }
  inp.players[0].cpu = null;
  const table = ids.map((id) => {
    const s = stats[id];
    return { id, vitorias: `${Math.round((s.wins / s.fights) * 100)}%`, lutas: s.fights, rounds: s.rounds, danoCausado: Math.round(s.dealt / s.fights), danoRecebido: Math.round(s.taken / s.fights) };
  }).sort((x, y) => parseInt(y.vitorias) - parseInt(x.vitorias));
  const moves = Object.fromEntries(ids.map((id) => [id, Object.entries(stats[id].moves).sort((x, y) => y[1] - x[1]).slice(0, 8)]));
  window.__balance = { table, matrix, moves };
  return { table, matrix, moves };
}
