import * as THREE from 'three';
import { yawTo, distXZ, forwardFromYaw } from '../core/util.js';
import { applyHit } from './damage.js';
import { findSpotBehind, findFreeSpotNear, isSpotFree } from './positioning.js';
import { DanteClone } from './npcs.js';

// O CAOS DO ANFITRIÃO — tudo que é sorteado no kit dele passa por aqui.
// Cânone: entidade de Energia, manifestação do caos e da imprevisibilidade; joga JOGOS com regras que ele inventa e
// precisa de plateia. O sorteio é imprevisível, mas CONTROLADO:
//   - RARIDADE: comum 60 · incomum 28 · raro 10 · muito raro 2 (peso por categoria, dividido entre os eventos dela);
//   - HISTÓRICO: os últimos 3 resultados de cada sorteio (tiro, botão, regra...) não se repetem;
//   - COMBINAÇÕES: às vezes dois efeitos saem juntos, só nos pares permitidos (nunca dois raros);
//   - SEGURANÇA: teleporte sempre num lugar livre da arena, clones com tempo e limite, nada acumula sem fim,
//     tudo é limpo no fim do round (tickers/NPCs/timers do mundo).
// world.chaosLog[chave][id] conta o que saiu (testes de variedade).

export const PURPLE = 0xb04aff;
export const PINK = 0xff6ad0;
export const BLUE = 0x5aa0ff;
export const YELLOW = 0xffd23a;
export const GREEN = 0x4aff8a;
export const RED = 0xff3a3a;
export const WHITE = 0xffffff;
export const BLACK = 0x14061e;
export const NEON = [PURPLE, PINK, BLUE];

export const TIER_WEIGHT = { common: 60, uncommon: 28, rare: 10, veryRare: 2 };
const MAX_CLONES = 3;

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ground = (p, y = 0.07) => V(p.x, y, p.z);
const alive = (x) => x && x.state !== 'ko';

function log(world, key, id) {
  const L = (world.chaosLog || (world.chaosLog = {}));
  const k = (L[key] || (L[key] = {}));
  k[id] = (k[id] || 0) + 1;
}

// Sorteio com raridade + histórico. boost (> 1) deixa raros e muito raros mais prováveis (A Plateia assistindo).
export function pickChaos(host, pool, key, { history = 3, boost = 1, exclude = [] } = {}) {
  const H = host.chaosHist || (host.chaosHist = {});
  const hist = H[key] || (H[key] = []);
  let cand = pool.filter((e) => !hist.includes(e.id) && !exclude.includes(e.id) && (!e.ok || e.ok(host)));
  if (!cand.length) cand = pool.filter((e) => !exclude.includes(e.id) && (!e.ok || e.ok(host)));
  if (!cand.length) cand = pool;
  const per = {};
  for (const e of cand) per[e.tier] = (per[e.tier] || 0) + 1;
  const weight = (e) => ((TIER_WEIGHT[e.tier] ?? 30) * (e.tier === 'rare' || e.tier === 'veryRare' ? boost : 1) * (e.weight ?? 1)) / per[e.tier];
  let total = 0;
  for (const e of cand) total += weight(e);
  let r = Math.random() * total;
  let pick = cand[cand.length - 1];
  for (const e of cand) {
    r -= weight(e);
    if (r <= 0) { pick = e; break; }
  }
  hist.push(pick.id);
  while (hist.length > history) hist.shift();
  log(host.world, key, pick.id);
  return pick;
}

// A Plateia assistindo deixa o caos mais "generoso" com o raro
export const chaosBoost = (host) => (host.findBuff && host.findBuff('audience') ? 2.2 : 1);

// ---------------------------------------------------------------- helpers seguros
// Aviso no chão (anel pulsando cada vez mais rápido) e depois fn() — dá para sair de cima
export function warnZone(world, pos, { radius = 1.8, time = 0.6, color = PURPLE } = {}, fn) {
  let t = 0;
  let pulse = 0;
  const at = ground(pos);
  world.addTicker({
    update(dt) {
      t += dt;
      pulse -= dt;
      if (pulse <= 0) {
        pulse = 0.06 + 0.14 * Math.max(0, 1 - t / time);
        world.fx.ring(at, { color, radius, life: 0.25, inner: 0.84 });
      }
      if (t >= time) { fn(at); return true; }
      return false;
    },
  });
}

// Acerto de área (só no adversário de quem lançou; quem estiver longe não leva)
function areaHit(world, host, victim, at, radius, o) {
  if (!alive(victim) || victim.isInvulnerable() || distXZ(victim.pos, at) > radius + victim.radius) return false;
  if (Math.abs(victim.pos.y - at.y) > 2.2) return false;
  applyHit(world, host, victim, { kind: 'ability', element: 'energia', ignoreInvuln: false, ...o });
  return true;
}

function bolt(world, at, color = PURPLE) {
  world.fx.lightning(at.clone().add(V((Math.random() - 0.5) * 0.6, 7, (Math.random() - 0.5) * 0.6)), at.clone().setY(0.1), { color, life: 0.3 });
  world.fx.lightning(at.clone().add(V(0, 7, 0)), at.clone().setY(0.1), { color: WHITE, life: 0.15 });
  world.fx.flash(at.clone().setY(1), { color, size: 3, life: 0.15 });
  world.fx.ring(ground(at), { color, radius: 1.8, life: 0.4 });
  world.audio.play('impact', { volume: 0.8, pitch: 1.5 });
}

function boom(world, at, color = RED, radius = 2.4) {
  world.fx.flash(at.clone().setY(1), { color, size: radius * 2, life: 0.2 });
  world.fx.burst(at.clone().setY(1), { count: 50, color, speed: 7, life: 0.55, size: 0.24 });
  world.fx.burst(at.clone().setY(1), { count: 20, color: 0x2a1030, kind: 'smoke', speed: 2.5, life: 0.8, size: 0.8, grow: 1 });
  world.fx.ring(ground(at), { color, radius: radius * 1.3, life: 0.45 });
  world.cameraRig.shake(0.4, 0.25);
  world.audio.play('explosion', { volume: 0.9, pitch: 1.3 });
}

// Teleporte seguro: só para um lugar livre dentro da arena (senão não teleporta)
export function safeTeleport(world, f, x, z, others = []) {
  const spot = findFreeSpotNear(world.arena, x, z, { radius: f.radius, others });
  if (!spot) return false;
  f.pos.set(spot.x, 0, spot.z);
  f.vel.set(0, 0, 0);
  return true;
}

function poofAt(world, p, color = PURPLE) {
  world.fx.burst(V(p.x, 1.0, p.z), { count: 22, color: 0x12081a, kind: 'smoke', speed: 2.2, life: 0.5, size: 0.7, grow: 1 });
  world.fx.burst(V(p.x, 1.1, p.z), { count: 16, color, speed: 4, life: 0.35, size: 0.16 });
  world.fx.ring(V(p.x, 1.1, p.z), { color, radius: 1.2, life: 0.25, vertical: true, yaw: Math.random() * Math.PI });
}

// ---------------------------------------------------------------- clones (Multiplicação)
// Cópias de Energia do Anfitrião: cercam, batem (metade do dano), correm e EXPLODEM quando o tempo acaba perto do alvo.
// Tempo limitado e no máximo MAX_CLONES em campo.
export class HostClone extends DanteClone {
  constructor(owner, world, idx, duration, { explode = 22 } = {}) {
    super(owner, world, idx, duration);
    this.isHostClone = true;
    this.explodeDmg = explode;
    this.rig.root.traverse((o) => {
      if (!o.isMesh || !o.material || o.userData.isOutline || !o.material.color) return;
      o.material.color.lerp(new THREE.Color(NEON[idx % 3]), 0.35);
      o.material.opacity = 0.62;
    });
    this.glitch = 0;
  }

  update(dt) {
    if (!this.alive) return;
    const expiring = this.t + dt >= this.life;
    // fim do tempo perto do alvo: explode em vez de sumir
    if (expiring && this.explodeDmg) {
      const tg = this.owner.opponent;
      const at = this.pos.clone();
      if (tg && distXZ(tg.pos, at) < 2.4) {
        boom(this.world, at, NEON[this.idx % 3], 1.6);
        areaHit(this.world, this.owner, tg, at, 1.8, { damage: this.explodeDmg, knockback: 4, hitstun: 0.35, color: PINK, sound: 'impact', noWeakFx: true });
      }
    }
    super.update(dt);
    if (!this.alive) return;
    // tremidas de "sinal ruim" (só visual)
    this.glitch -= dt;
    if (this.glitch <= 0) {
      this.glitch = 0.3 + Math.random() * 0.6;
      this.rig.root.position.x += (Math.random() - 0.5) * 0.25;
      if (Math.random() < 0.4) this.world.fx.burst(V(this.pos.x, 1.2, this.pos.z), { count: 3, color: NEON[this.idx % 3], speed: 2, life: 0.2, size: 0.12 });
    }
  }
}

export function hostClones(world, host) {
  return world.npcs.filter((n) => n.isHostClone && n.owner === host && n.alive);
}

export function spawnClones(world, host, n, duration = 5) {
  const opp = host.opponent;
  const have = hostClones(world, host).length;
  const out = [];
  for (let k = 0; k < Math.min(n, MAX_CLONES - have); k++) {
    const cl = new HostClone(host, world, have + k, duration);
    const ang = host.yaw + Math.PI / 2 + k * Math.PI + (Math.random() - 0.5) * 0.6;
    const want = V(host.pos.x + Math.sin(ang) * 1.6, 0, host.pos.z + Math.cos(ang) * 1.6);
    const spot = findFreeSpotNear(world.arena, want.x, want.z, { radius: 0.45, others: opp ? [{ x: opp.pos.x, z: opp.pos.z, r: 0.6 }] : [] }) || { x: host.pos.x, z: host.pos.z };
    cl.pos.set(spot.x, 0, spot.z);
    world.addNpc(cl);
    poofAt(world, cl.pos, NEON[(have + k) % 3]);
    out.push(cl);
  }
  return out;
}

// ---------------------------------------------------------------- DISPARO DO CAOS (8 cores)
// Cada tiro sorteia uma cor (raridade + histórico) e a cor diz o que ela faz. Às vezes duas cores saem combinadas.
export const SHOT_COLORS = [
  { id: 'roxo', tier: 'common', color: PURPLE, label: 'ROXO · IMPACTO', patch: { damage: 40, knockback: 2.6, hitstun: 0.42, impactScale: 1.5 } },
  {
    id: 'azul', tier: 'common', color: BLUE, label: 'AZUL · DISTORÇÃO',
    patch: { damage: 24, onHit: { slow: { type: 'chaosSlow', mult: 0.6, time: 2.2, name: 'TEMPO DISTORCIDO' } } },
    hit(w, o, t) { w.fx.distort(t.chestPos(), { color: BLUE, radius: 2, life: 0.5 }); },
  },
  { id: 'rosa', tier: 'common', color: PINK, label: 'ROSA · REPULSÃO', patch: { damage: 26, knockback: 7.5, hitstun: 0.5 } },
  {
    id: 'amarelo', tier: 'uncommon', color: YELLOW, label: 'AMARELO · CHOQUE',
    patch: { damage: 22, onHit: { stun: 0.45 } },
    hit(w, o, t) {
      const c = t.chestPos();
      for (let i = 0; i < 4; i++) w.fx.lightning(c, c.clone().add(V((Math.random() - 0.5) * 2, (Math.random() - 0.3) * 2, (Math.random() - 0.5) * 2)), { color: YELLOW, life: 0.25 });
      w.audio.play('impact', { volume: 0.5, pitch: 1.8 });
    },
  },
  {
    id: 'verde', tier: 'uncommon', color: GREEN, label: 'VERDE · TROCA',
    patch: { damage: 20 },
    hit(w, o, t) {
      if (w.cinematic || !alive(o) || !alive(t) || !t.onGround || !o.onGround) return;
      const a = o.pos.clone();
      const b = t.pos.clone();
      poofAt(w, a, GREEN);
      poofAt(w, b, GREEN);
      o.pos.set(b.x, 0, b.z);
      t.pos.set(a.x, 0, a.z);
      o.vel.set(0, 0, 0);
      t.vel.set(0, 0, 0);
      o.yaw = yawTo(o.pos, t.pos);
      t.yaw = yawTo(t.pos, o.pos) + Math.PI; // volta de costas
      t.surprised = 0.5;
      t.notify('TROCA!', true);
      w.audio.play('teleport', { volume: 0.7 });
    },
  },
  {
    id: 'vermelho', tier: 'uncommon', color: RED, label: 'VERMELHO · EXPLOSÃO',
    patch: { damage: 20, knockback: 1 },
    hit(w, o, t) {
      const at = t.pos.clone();
      boom(w, at, RED, 2.2);
      w.after(0.05, () => areaHit(w, o, t, at, 2.4, { damage: 22, knockback: 5, hitstun: 0.5, launch: true, lowLaunch: true, ignoreInvuln: true, color: RED, sound: 'impact', noWeakFx: true }));
    },
  },
  {
    id: 'branco', tier: 'rare', color: WHITE, label: 'BRANCO · DUPLICAÇÃO',
    patch: { damage: 22 },
    // um "eco" do Anfitrião aparece do lado e repete o tiro
    afterFire(f, r, origin) {
      const w = f.world;
      const opp = f.opponent;
      if (!opp) return;
      const side = forwardFromYaw(f.yaw + Math.PI / 2).multiplyScalar(Math.random() < 0.5 ? 1.6 : -1.6);
      const from = origin.clone().add(side);
      poofAt(w, from.clone().setY(0), WHITE);
      w.after(0.18, () => {
        if (!alive(f) || !alive(opp)) return;
        const dir = opp.chestPos().sub(from).normalize();
        w.projectiles.spawn(f, { ...r, afterFire: null, damage: 18, color: WHITE, color2: PURPLE, echo: true }, from, dir);
        w.audio.play('shockwave', { volume: 0.5, pitch: 1.3 });
      });
    },
  },
  {
    id: 'preto', tier: 'rare', color: BLACK, label: 'PRETO · FALHA',
    patch: { damage: 34, knockback: 2 },
    // o tiro "falha" no meio do caminho... e reaparece de outra direção
    setup(f, r) {
      const opp = f.opponent;
      const d = opp ? distXZ(f.pos, opp.pos) : 10;
      return { range: Math.max(2.5, d * 0.45) };
    },
    expire(w, p) {
      const o = p.owner;
      const t = o.opponent;
      w.fx.distort(p.pos.clone(), { color: PURPLE, radius: 1.2, life: 0.3 });
      w.audio.play('fearGaze', { volume: 0.4, pitch: 1.6 });
      if (!alive(t)) return;
      const ang = yawTo(t.pos, o.pos) + Math.PI + (Math.random() - 0.5) * 2.2; // por trás / de lado
      const from = V(t.pos.x + Math.sin(ang) * 5, t.chestPos().y, t.pos.z + Math.cos(ang) * 5);
      w.fx.flash(from, { color: PURPLE, size: 1.4, life: 0.35 });
      w.fx.ring(from, { color: PURPLE, radius: 0.9, life: 0.35, vertical: true, yaw: ang });
      w.after(0.35, () => {
        if (!alive(o) || !alive(t)) return;
        const dir = t.chestPos().sub(from).normalize();
        w.projectiles.spawn(o, { ...p.ability, expireFn: null, range: 9, color: BLACK, color2: PURPLE, echo: true }, from, dir);
        w.audio.play('shockwave', { volume: 0.6, pitch: 0.7 });
      });
    },
  },
];

// pares que podem sair juntos (nunca dois raros)
const SHOT_COMBOS = [['roxo', 'azul'], ['rosa', 'amarelo'], ['azul', 'amarelo'], ['vermelho', 'rosa'], ['verde', 'azul'], ['roxo', 'vermelho']];
const NAME = { roxo: 'ROXO', azul: 'AZUL', rosa: 'ROSA', amarelo: 'AMARELO', verde: 'VERDE', vermelho: 'VERMELHO', branco: 'BRANCO', preto: 'PRETO' };

// r = ranged base (com chaosShot: true) → r com a cor, o dano e os ganchos (hitFn / expireFn / afterFire)
export function rollChaosShot(f, r, { combo = 0.2 } = {}) {
  const pool = SHOT_COLORS;
  const a = pickChaos(f, pool, 'shot', { boost: chaosBoost(f) });
  let parts = [a];
  if (a.tier !== 'rare' && Math.random() < combo) {
    const pairs = SHOT_COMBOS.filter((p) => p.includes(a.id));
    if (pairs.length) {
      const pr = pairs[Math.floor(Math.random() * pairs.length)];
      const b = pool.find((x) => x.id === (pr[0] === a.id ? pr[1] : pr[0]));
      parts = [a, b];
      log(f.world, 'shotCombo', a.id + '+' + b.id);
    }
  }
  let out = { ...r, chaosShot: false };
  let dmg = 0;
  let onHit = null;
  for (const c of parts) {
    out = { ...out, ...c.patch, ...(c.setup ? c.setup(f, r) : {}) };
    dmg = Math.max(dmg, c.patch.damage ?? r.damage);
    if (c.patch.onHit) onHit = { ...(onHit || {}), ...c.patch.onHit };
  }
  out.damage = parts.length > 1 ? Math.round(dmg * 0.85) : dmg;
  out.onHit = onHit;
  out.knockback = Math.max(...parts.map((c) => c.patch.knockback ?? r.knockback));
  out.color = parts[0].color;
  out.color2 = parts[1] ? parts[1].color : parts[0].id === 'preto' ? PURPLE : undefined;
  const hits = parts.filter((c) => c.hit);
  out.hitFn = hits.length ? (w, o, t, p) => hits.forEach((c) => c.hit(w, o, t, p)) : null;
  const exp = parts.find((c) => c.expire);
  out.expireFn = exp ? exp.expire : null;
  const af = parts.find((c) => c.afterFire);
  out.afterFire = af ? af.afterFire : null;
  out.chaosLabel = parts.length > 1 ? parts.map((c) => NAME[c.id]).join(' + ') + '!' : parts[0].label;
  return out;
}

// ---------------------------------------------------------------- EVENTOS DO CAOS (Botão, roleta, eventos raros)
// run(host, world, opp) → texto curto do que aconteceu. Todos com aviso ou efeito pequeno; nenhum mata sozinho.
export const CHAOS_EVENTS = [
  // ---- comuns
  {
    id: 'raio', tier: 'common', label: 'RAIO!',
    run(h, w, o) {
      if (!alive(o)) return;
      warnZone(w, o.pos, { radius: 1.6, time: 0.55, color: PURPLE }, (at) => {
        bolt(w, at, PURPLE);
        areaHit(w, h, o, at, 1.7, { damage: 34, knockback: 1.5, hitstun: 0.4, color: PURPLE, sound: 'impact' });
      });
    },
  },
  {
    id: 'choque', tier: 'common', label: 'CHOQUE!',
    run(h, w, o) {
      // perto: o choque passa para o adversário; longe: volta no próprio Anfitrião (o caos não escolhe lado)
      if (alive(o) && distXZ(h.pos, o.pos) < 9 && !o.isInvulnerable()) {
        w.fx.lightning(h.chestPos(), o.chestPos(), { color: YELLOW, life: 0.3 });
        w.fx.lightning(h.chestPos(), o.chestPos(), { color: WHITE, life: 0.15 });
        applyHit(w, h, o, { damage: 18, kind: 'ability', element: 'energia', knockback: 0.4, hitstun: 0.2, color: YELLOW, sound: 'impact', noWeakFx: true });
        if (alive(o)) o.stun(0.45, 'stagger');
      } else {
        const c = h.chestPos();
        for (let i = 0; i < 3; i++) w.fx.lightning(c.clone().add(V(0, 2, 0)), c, { color: YELLOW, life: 0.25 });
        h.health = Math.max(1, h.health - 10);
        h.notify('O CHOQUE VOLTOU!', true);
      }
    },
  },
  {
    id: 'empurrao', tier: 'common', label: 'EMPURRÃO!',
    run(h, w, o) {
      w.fx.ring(ground(h.pos), { color: PINK, radius: 6, life: 0.45 });
      w.fx.distort(h.chestPos(), { color: PINK, radius: 3, life: 0.4 });
      w.audio.play('shockwave', { volume: 0.8 });
      if (alive(o) && distXZ(h.pos, o.pos) < 6 && !o.isInvulnerable()) applyHit(w, h, o, { damage: 14, kind: 'ability', element: 'energia', knockback: 9, hitstun: 0.5, dir: o.pos.clone().sub(h.pos).setY(0).normalize(), color: PINK, sound: 'impact', noWeakFx: true });
    },
  },
  {
    id: 'lento', tier: 'common', label: 'TEMPO LENTO!',
    run(h, w, o) {
      if (!alive(o)) return;
      const old = o.findBuff('chaosSlow');
      if (old) old.time = 2.5;
      else o.addBuff({ type: 'chaosSlow', name: 'TEMPO DISTORCIDO', time: 2.5, duration: 2.5, speedMult: 0.6 });
      for (let i = 0; i < 3; i++) w.after(i * 0.1, () => alive(o) && w.fx.ring(o.chestPos(), { color: BLUE, radius: 2 - i * 0.4, life: 0.5, vertical: true, yaw: o.yaw }));
    },
  },
  // ---- incomuns
  {
    id: 'explosao', tier: 'uncommon', label: 'EXPLOSÃO!',
    run(h, w, o) {
      if (!alive(o)) return;
      warnZone(w, o.pos, { radius: 2.4, time: 0.75, color: RED }, (at) => {
        boom(w, at, RED, 2.4);
        areaHit(w, h, o, at, 2.5, { damage: 46, knockback: 6, hitstun: 0.6, launch: true, lowLaunch: true, color: RED, sound: 'explosion' });
      });
    },
  },
  {
    id: 'troca', tier: 'uncommon', label: 'TROCA!',
    ok: (h) => alive(h.opponent) && distXZ(h.pos, h.opponent.pos) < 16 && h.onGround && h.opponent.onGround,
    run(h, w, o) {
      const a = h.pos.clone();
      const b = o.pos.clone();
      poofAt(w, a, GREEN);
      poofAt(w, b, GREEN);
      h.pos.set(b.x, 0, b.z);
      o.pos.set(a.x, 0, a.z);
      h.yaw = yawTo(h.pos, o.pos);
      o.yaw = yawTo(o.pos, h.pos) + Math.PI;
      o.surprised = 0.5;
      w.audio.play('teleport', { volume: 0.7 });
    },
  },
  {
    id: 'teleporte', tier: 'uncommon', label: 'ATRÁS DE VOCÊ!',
    ok: (h) => alive(h.opponent),
    run(h, w, o) {
      const spot = findSpotBehind(w.arena, { x: o.pos.x, z: o.pos.z, yaw: o.yaw }, { distance: 1.6, radius: h.radius });
      if (!spot) return;
      poofAt(w, h.pos, PURPLE);
      h.pos.set(spot.x, 0, spot.z);
      h.vel.set(0, 0, 0);
      h.yaw = yawTo(h.pos, o.pos);
      poofAt(w, h.pos, PINK);
      o.surprised = 0.45;
      w.audio.play('teleport', { volume: 0.7 });
    },
  },
  {
    id: 'inverter', tier: 'uncommon', label: 'CONTROLES INVERTIDOS!',
    run(h, w, o) {
      if (!alive(o)) return;
      const old = o.findBuff('chaosInvert');
      if (old) old.time = 2.5;
      else o.addBuff({ type: 'chaosInvert', name: 'INVERTIDO', time: 2.5, duration: 2.5, invertMove: true });
      w.fx.distort(o.chestPos(), { color: PINK, radius: 1.8, life: 0.5 });
    },
  },
  {
    id: 'chicote', tier: 'uncommon', label: 'CHICOTADA!',
    ok: (h) => alive(h.opponent) && distXZ(h.pos, h.opponent.pos) < 9,
    run(h, w, o) { lash(w, h, o, { damage: 26, pull: true }); },
  },
  {
    id: 'falso', tier: 'uncommon', label: 'É FALSO!',
    // um vulto do Anfitrião avança e se desfaz antes de bater — só para assustar
    run(h, w, o) {
      if (!alive(o)) return;
      const from = h.chestPos();
      const to = o.chestPos();
      for (let i = 0; i < 5; i++) w.after(i * 0.05, () => w.fx.burst(from.clone().lerp(to, i / 5), { count: 8, color: PURPLE, speed: 1, life: 0.3, size: 0.4 }));
      w.after(0.28, () => { w.fx.flash(to, { color: PINK, size: 1.6, life: 0.12 }); w.audio.play('swing', { volume: 0.6 }); });
    },
  },
  // ---- raros
  {
    id: 'clone', tier: 'rare', label: 'MULTIPLICAÇÃO!',
    ok: (h) => hostClones(h.world, h).length < MAX_CLONES,
    run(h, w) { spawnClones(w, h, 1, 4); },
  },
  {
    id: 'distorcao', tier: 'rare', label: 'DISTORÇÃO!',
    run(h, w, o) {
      if (!alive(o)) return;
      o.yaw += Math.PI;
      o.surprised = 0.6;
      const old = o.findBuff('chaosSlow');
      if (!old) o.addBuff({ type: 'chaosSlow', name: 'DESORIENTADO', time: 1.5, duration: 1.5, speedMult: 0.8 });
      w.fx.distort(o.chestPos(), { color: PURPLE, radius: 3, life: 0.6 });
      w.screenFlash && w.screenFlash('#2a0a40', 0.2);
      w.cameraRig.shake(0.3, 0.3);
    },
  },
  {
    id: 'sumir', tier: 'rare', label: 'CADÊ ELE?',
    run(h, w, o) {
      if (!alive(o)) return;
      poofAt(w, h.pos, PURPLE);
      const ang = Math.random() * Math.PI * 2;
      const d = 4 + Math.random() * 2;
      if (safeTeleport(w, h, o.pos.x + Math.sin(ang) * d, o.pos.z + Math.cos(ang) * d, [{ x: o.pos.x, z: o.pos.z, r: 0.8 }])) {
        h.yaw = yawTo(h.pos, o.pos);
        poofAt(w, h.pos, PINK);
      }
    },
  },
  {
    id: 'glitch', tier: 'rare', label: 'FALHA NA REALIDADE',
    run(h, w) {
      for (let i = 0; i < 3; i++) w.after(i * 0.12, () => w.screenFlash && w.screenFlash(i % 2 ? '#0a1a40' : '#2a0a40', 0.08));
      w.cameraRig.shake(0.25, 0.4);
      h.addEnergy(15);
      h.notify('+15 SANIDADE', true);
    },
  },
  {
    id: 'tiroOutroLado', tier: 'rare', label: 'DE ONDE VEIO ISSO?',
    run(h, w, o) {
      if (!alive(o) || !h.def.ranged) return;
      const ang = Math.random() * Math.PI * 2;
      const from = V(o.pos.x + Math.sin(ang) * 6, o.chestPos().y, o.pos.z + Math.cos(ang) * 6);
      w.fx.flash(from, { color: PURPLE, size: 1.4, life: 0.4 });
      w.after(0.4, () => {
        if (!alive(h) || !alive(o)) return;
        const r = rollChaosShot(h, { ...h.def.ranged, range: 10 }, { combo: 0 });
        w.projectiles.spawn(h, { ...r, expireFn: null, afterFire: null }, from, o.chestPos().sub(from).normalize());
      });
    },
  },
  // ---- muito raros
  {
    id: 'multidao', tier: 'veryRare', label: 'A PLATEIA INTEIRA!',
    ok: (h) => hostClones(h.world, h).length === 0,
    run(h, w) { spawnClones(w, h, 3, 4); },
  },
  {
    id: 'relogios', tier: 'veryRare', label: 'OS RELÓGIOS!',
    // relógios de Energia em volta da arena; cada um dispara um raio (com aviso) onde o alvo estiver
    run(h, w, o) {
      if (!alive(o)) return;
      const c = o.pos.clone();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const p = V(c.x + Math.sin(ang) * 6, 2.6, c.z + Math.cos(ang) * 6);
        w.fx.ring(p, { color: NEON[i % 3], radius: 0.8, life: 1.4, vertical: true, yaw: ang, inner: 0.8 });
        w.after(0.5 + i * 0.25, () => {
          if (!alive(o)) return;
          w.audio.play('tick', { volume: 0.6 });
          warnZone(w, o.pos, { radius: 1.3, time: 0.45, color: NEON[i % 3] }, (at) => {
            w.fx.lightning(p, at.clone().setY(1), { color: NEON[i % 3], life: 0.3 });
            areaHit(w, h, o, at, 1.4, { damage: 12, knockback: 0.6, hitstun: 0.25, color: NEON[i % 3], sound: 'impact', noWeakFx: true });
          });
        });
      }
    },
  },
  {
    id: 'tempestade', tier: 'veryRare', label: 'TEMPESTADE DE ENERGIA!',
    run(h, w, o) {
      if (!alive(o)) return;
      for (let i = 0; i < 5; i++) {
        w.after(i * 0.2, () => {
          if (!alive(o)) return;
          const ang = Math.random() * Math.PI * 2;
          const d = i === 4 ? 0 : 1 + Math.random() * 2.5;
          const at = V(o.pos.x + Math.sin(ang) * d, 0, o.pos.z + Math.cos(ang) * d);
          warnZone(w, at, { radius: 1.4, time: 0.6, color: NEON[i % 3] }, (g) => {
            bolt(w, g, NEON[i % 3]);
            areaHit(w, h, o, g, 1.5, { damage: 16, knockback: 1, hitstun: 0.3, color: NEON[i % 3], sound: 'impact', noWeakFx: true });
          });
        });
      }
    },
  },
  {
    id: 'orfanato', tier: 'veryRare', label: 'O JOGO DO ORFANATO!',
    ok: (h) => !h.world.orphanGame,
    run(h, w) { startOrphanGame(w, h, { duration: 5, tick: 1.5, drain: 8 }); },
  },
  {
    id: 'roletaGigante', tier: 'veryRare', label: 'ROLETA GIGANTE!',
    // dois eventos comuns/incomuns de uma vez
    run(h, w, o) {
      const pool = CHAOS_EVENTS.filter((e) => e.tier === 'common' || e.tier === 'uncommon');
      const a = pickChaos(h, pool, 'giant');
      const b = pickChaos(h, pool, 'giant', { exclude: [a.id] });
      w.fx.ring(ground(h.pos), { color: PINK, radius: 5, life: 0.8, inner: 0.9 });
      a.run(h, w, o);
      w.after(0.35, () => b.run(h, w, h.opponent));
      return a.label + ' ' + b.label;
    },
  },
];

const EVENT_COMBOS = [['raio', 'lento'], ['empurrao', 'choque'], ['troca', 'inverter'], ['teleporte', 'chicote'], ['explosao', 'lento'], ['lento', 'chicote']];

// Sorteia e roda um evento (com chance de combinação controlada). Retorna o rótulo para o anúncio.
export function runChaosEvent(host, key = 'event', { pool = CHAOS_EVENTS, combo = 0.2, boost } = {}) {
  const w = host.world;
  const o = host.opponent;
  const e = pickChaos(host, pool, key, { boost: boost ?? chaosBoost(host) });
  let label = e.run(host, w, o) || e.label;
  if ((e.tier === 'common' || e.tier === 'uncommon') && Math.random() < combo) {
    const pairs = EVENT_COMBOS.filter((p) => p.includes(e.id));
    if (pairs.length) {
      const pr = pairs[Math.floor(Math.random() * pairs.length)];
      const b = CHAOS_EVENTS.find((x) => x.id === (pr[0] === e.id ? pr[1] : pr[0]));
      if (b && (!b.ok || b.ok(host))) {
        w.after(0.3, () => b.run(host, w, host.opponent));
        label += ' + ' + b.label;
        log(w, key + 'Combo', e.id + '+' + b.id);
      }
    }
  }
  return { event: e, label };
}

// ---------------------------------------------------------------- chicote de cabos (Chicotada do Caos)
// Cabos de Energia saem do braço do relógio até o alvo: acerta e às vezes puxa
export function lash(w, h, o, { damage = 30, pull = false, range = 9, color = PINK, extra = null } = {}) {
  if (!alive(o)) return false;
  const hand = () => (h.rig.sockets.handL ? h.rig.sockets.handL.getWorldPosition(new THREE.Vector3()) : h.chestPos());
  const tipAt = o.chestPos();
  const from = hand();
  const reach = Math.min(range, from.distanceTo(tipAt));
  const tip = from.clone().add(tipAt.clone().sub(from).normalize().multiplyScalar(reach));
  for (let i = 0; i < 3; i++) {
    const off = V((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4);
    w.fx.lightning(from, tip.clone().add(off), { color: NEON[i], life: 0.22, segments: 10, jitter: 0.25 });
  }
  w.fx.tracer(from, tip, { color, life: 0.12, width: 0.04 });
  w.audio.play('whip', { volume: 0.8 });
  const hit = distXZ(h.pos, o.pos) <= range + 0.2 && !o.isInvulnerable() && Math.abs(o.pos.y - h.pos.y) < 2.5;
  if (!hit) return false;
  applyHit(w, h, o, { damage, kind: 'ability', element: 'energia', knockback: pull ? 0 : 2, hitstun: 0.4, reaction: !pull, color, sound: 'impact', pos: tip });
  if (pull && alive(o)) {
    const F = forwardFromYaw(yawTo(h.pos, o.pos));
    o.pullTo(V(h.pos.x + F.x * 1.6, o.pos.y, h.pos.z + F.z * 1.6), { time: 0.25, after: 0.45 });
  }
  if (extra && alive(o)) extra(o);
  return true;
}

// ---------------------------------------------------------------- O JOGO DO ORFANATO
// Cânone: o jogo que ele impôs no orfanato — quem NÃO usa rituais leva dano de Energia. Chamas de Energia em volta da
// arena e a luz fica roxa por um tempo. Só um jogo por vez; tudo some no fim (dispose).
export function startOrphanGame(world, host, { duration = 8, tick = 1.5, drain = 10, damage = 14, radius = 7 } = {}) {
  if (world.orphanGame) return false;
  const c = host.pos.clone();
  const light = new THREE.PointLight(PURPLE, 9, 26, 1.4);
  light.position.set(c.x, 6, c.z);
  world.scene.add(light);
  const N = 14;
  const flames = [];
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 2;
    const p = V(c.x + Math.sin(ang) * radius, 0.2, c.z + Math.cos(ang) * radius);
    if (world.arena.blocksPoint && world.arena.blocksPoint(V(p.x, 1, p.z), 0.2)) continue;
    flames.push(world.fx.emitter({ rate: 14, follow: () => p, particle: { color: NEON[i % 3], speed: 1.2, up: 2.4, spread: 0.3, life: 0.6, size: 0.3 } }));
  }
  world.screenFlash && world.screenFlash('#2a0a40', 0.3);
  world.showBanner('O JOGO DO ORFANATO', host.def.color);
  const lastUse = (x) => Math.max(-99, ...Object.values(x.lastAbilityUse || {}));
  const start = world.time;
  let t = 0;
  let k = tick;
  const state = { host };
  world.orphanGame = state;
  world.addTicker({
    update(dt) {
      t += dt;
      k -= dt;
      light.intensity = 9 + Math.sin(t * 9) * 2;
      if (k <= 0) {
        k = tick;
        const o = host.opponent;
        // o anfitrião é o dono do jogo: só o adversário é cobrado
        if (alive(o) && world.time - Math.max(lastUse(o), start - 99) > 4 && !o.isInvulnerable()) {
          const p = o.chestPos();
          for (let i = 0; i < 3; i++) w3(world, p, i);
          o.drainEnergy(drain);
          applyHit(world, host, o, { damage, kind: 'ability', element: 'energia', reaction: false, unblockable: true, ignoreInvuln: true, color: PINK, sound: 'impact', noWeakFx: true });
          o.notify('SEM RITUAL: −' + drain + ' SANIDADE', true);
        }
      }
      return t >= duration || !alive(host);
    },
    dispose() {
      world.scene.remove(light);
      light.dispose && light.dispose();
      flames.forEach((e) => e.stop());
      if (world.orphanGame === state) world.orphanGame = null;
    },
  });
  return true;
}

function w3(world, p, i) {
  world.fx.lightning(p.clone().add(V((i - 1) * 0.5, 4, 0)), p, { color: NEON[i], life: 0.25 });
}

// ---------------------------------------------------------------- manias do Anfitrião (ambiente, só visual)
// De vez em quando: inclina a cabeça, ri sozinho, o relógio tique-taqueia alto, um passo "pula" (falha na imagem),
// faíscas de cor. Nada disso muda a luta (o passo que pula é curto, só para lugar livre e só andando).
export function tickHostQuirks(f, dt) {
  if (f.state === 'ko' || f.world.cinematic) return;
  f.quirkT = (f.quirkT ?? 3 + Math.random() * 3) - dt;
  if (f.quirkT > 0) return;
  f.quirkT = 3.5 + Math.random() * 4;
  const w = f.world;
  const idle = f.state === 'idle';
  const moving = Math.hypot(f.vel.x, f.vel.z) > 2;
  const opts = [];
  if (idle && !moving) opts.push('tilt', 'laugh', 'look');
  if (idle && moving && f.onGround) opts.push('skip', 'skip');
  opts.push('tick', 'sparks');
  const q = opts[Math.floor(Math.random() * opts.length)];
  log(w, 'quirk', q);
  const gesture = (clip, d) => { f.anim.play(clip, { restart: true, duration: d, blend: 0.1 }); f.gestureT = d; };
  if (q === 'tilt') gesture('host_tilt', 0.9);
  else if (q === 'laugh') { gesture('host_laugh', 1.0); w.audio.play('laugh', { volume: 0.35 }); }
  else if (q === 'look') gesture('host_look', 1.0);
  else if (q === 'tick') { w.audio.play('tick', { volume: 0.5 }); w.fx.ring(f.chestPos(), { color: PURPLE, radius: 0.8, life: 0.3, vertical: true, yaw: f.yaw }); }
  else if (q === 'sparks') w.fx.burst(f.chestPos(), { count: 10, color: NEON[Math.floor(Math.random() * 3)], speed: 2.5, life: 0.4, size: 0.12 });
  else if (q === 'skip') {
    // falha na imagem: some e aparece um pouco à frente, na direção em que já estava andando
    const d = V(f.vel.x, 0, f.vel.z).normalize().multiplyScalar(1.1);
    const x = f.pos.x + d.x;
    const z = f.pos.z + d.z;
    const opp = f.opponent;
    if (isSpotFree(w.arena, x, z, f.radius, opp ? [{ x: opp.pos.x, z: opp.pos.z, r: 0.7 }] : [])) {
      w.fx.burst(f.chestPos(), { count: 8, color: PINK, speed: 1, life: 0.2, size: 0.3 });
      f.pos.x = x;
      f.pos.z = z;
      w.fx.burst(f.chestPos(), { count: 8, color: BLUE, speed: 1, life: 0.2, size: 0.3 });
    }
  }
}
