import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw, angleDiff, DEG } from '../core/util.js';
import { ABILITY_TYPES } from './abilities.js';
import { applyHit } from './damage.js';
import { findFreeSpotNear } from './positioning.js';
import { HoloCopy } from './holo.js';

// ------------------------------------------------------------------ GUIZO (Sinais do Outro Lado)
// Os rituais da ficha dele (wiki) viram habilidades. Canônico: o que cada ritual faz; adaptação: como vira golpe.
//   DECADÊNCIA          espirais envolvem a mão e definham o alvo (dano de Morte)
//   ESPIRAIS DA PERDIÇÃO espirais no corpo do alvo deixam os movimentos lentos e atrapalham os ataques (−1d20)
//   EMBARALHAR          cópias ilusórias realistas que imitam as ações dele (+ Defesa: o golpe pega numa cópia)
//   VELOCIDADE MORTAL   distorce o tempo em volta: muito mais rápido (aqui, com rastros dele no ar)
//   CICATRIZAÇÃO        acelera o tempo nas feridas: recupera vida, mas ENVELHECE (o cabelo fica grisalho)
const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });
// celular / tela de toque: menos rastros (cada um é um modelo inteiro a mais na cena)
const COARSE = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
const MORTE = 0x8a8494;
const MORTE_DK = 0x26222c;

// espiral de partículas girando em volta de um ponto que acompanha (follow) — a linguagem visual de Morte
function spiralFx(world, follow, { color = MORTE, radius = 0.6, rate = 70, rise = 1.4, size = 0.14, life = 0.5 } = {}) {
  let ang = 0;
  let h = 0;
  return world.fx.emitter({
    rate,
    follow: () => {
      ang += 0.5;
      h = (h + 0.035) % 1;
      const c = follow();
      const r = radius * (1 - h * 0.45);
      return new THREE.Vector3(c.x + Math.sin(ang) * r, c.y - rise * 0.5 + h * rise, c.z + Math.cos(ang) * r);
    },
    particle: { color, speed: 0.15, spread: 0.05, life, size },
  });
}

const hand = (f, s = 'handR') => f.rig.sockets[s].getWorldPosition(new THREE.Vector3());
const inFront = (f, opp, range, arc = 110) => opp && opp.state !== 'ko' && distXZ(f.pos, opp.pos) - opp.radius <= range && Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos))) <= (arc * DEG) / 2;

export const GUIZO_TYPES = {
  // DECADÊNCIA: estende a mão, as espirais se enrolam nela; elas aparecem em volta do alvo, apertam e ele DEFINHA
  // (dano de Morte e uma decadência curta depois). Dá para esquivar no instante em que as espirais fecham.
  decadence: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko' || distXZ(f.pos, opp.pos) - opp.radius > a.range) { f.notify('FORA DE ALCANCE'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: a.cast + 0.35 });
      world.audio.play('ritual', { volume: 0.5, pitch: 0.8 });
      const handFx = spiralFx(world, () => hand(f), { radius: 0.18, rise: 0.3, rate: 60, size: 0.1, color: MORTE });
      let ring = null;
      let target = null;
      tl.add(a.cast * 0.5, () => {
        if (!inFront(f, opp, a.range, 140)) return;
        target = opp;
        ring = spiralFx(world, () => target.chestPos(), { radius: 0.75, rise: 1.8, rate: 120, size: 0.16, color: MORTE });
        world.fx.ring(new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z), { color: MORTE, radius: 1.2, life: a.cast * 0.6 });
      });
      tl.add(a.cast, () => {
        handFx.stop();
        if (ring) ring.stop();
        if (!target) { f.notify('FORA DE ALCANCE'); return; }
        if (target.state === 'ko' || target.isInvulnerable() || distXZ(f.pos, target.pos) - target.radius > a.range + 1) return;
        const c = target.chestPos();
        world.fx.burst(c, { count: 36, color: MORTE_DK, kind: 'smoke', speed: 2, up: 0.4, life: 0.8, size: 0.45 });
        world.fx.distort(c, { color: MORTE, radius: 1.6, life: 0.3 });
        world.audio.play('drain', { volume: 0.9, pitch: 0.7 });
        const res = applyHit(world, f, target, { damage: a.damage, kind: 'ability', element: 'morte', knockback: 0.8, hitstun: 0.45, sound: 'impact', color: MORTE, scale: 1.2, dir: new THREE.Vector3().subVectors(target.pos, f.pos).setY(0).normalize() });
        if (typeof res === 'number' && target.state !== 'ko' && a.decay) target.applyBleed({ ...a.decay, color: MORTE_DK }, f);
      });
      tl.end(a.cast + 0.3);
      return seqFrom(tl, { cancel: () => { handFx.stop(); if (ring) ring.stop(); } });
    },
  },

  // ESPIRAIS DA PERDIÇÃO: ergue a mão; um anel de espirais marca o chão do alvo e, se ele não sair, as espirais sobem
  // pelo corpo: fica LENTO e os golpes dele perdem força por alguns segundos
  doomSpirals: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || distXZ(f.pos, opp.pos) > a.range) { f.notify('FORA DE ALCANCE'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('cast_up', { restart: true, duration: 0.6 });
      world.audio.play('ritual', { volume: 0.5, pitch: 0.65 });
      const mark = opp.pos.clone();
      world.fx.ring(new THREE.Vector3(mark.x, 0.06, mark.z), { color: MORTE, radius: a.radius, life: a.delay });
      const markFx = spiralFx(world, () => new THREE.Vector3(mark.x, 0.5, mark.z), { radius: a.radius * 0.8, rise: 0.6, rate: 80, color: MORTE });
      tl.add(a.delay, () => {
        markFx.stop();
        if (opp.state === 'ko' || opp.isInvulnerable() || distXZ(opp.pos, mark) > a.radius + opp.radius) { f.notify('ESCAPOU', true); return; }
        world.audio.play('fearGaze', { volume: 0.6, pitch: 0.6 });
        applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'morte', reaction: false, unblockable: true, sound: null, color: MORTE, scale: 0.7 });
        const body = spiralFx(world, () => opp.chestPos(), { radius: 0.55, rise: 1.6, rate: 40, size: 0.12, color: MORTE });
        const old = opp.findBuff('doomSpirals');
        if (old) { old.time = a.duration; body.stop(); return; }
        opp.addBuff({
          type: 'doomSpirals', name: 'ESPIRAIS DA PERDIÇÃO', time: a.duration, duration: a.duration,
          speedMult: a.slow, mult: a.weaken, affects: ['melee', 'ranged', 'ability'],
          onEnd() { body.stop(); },
        });
        opp.notify('ESPIRAIS DA PERDIÇÃO', true);
      });
      tl.end(0.6);
      return seqFrom(tl, { cancel: () => markFx.stop() });
    },
  },

  // EMBARALHAR: vira um holograma por um instante, as posições se EMBARALHAM (ele troca de lugar) e ficam cópias
  // realistas em volta, imitando cada movimento dele. Enquanto durarem, um golpe pode pegar numa cópia (que se desfaz)
  // em vez dele — mais cópias, mais chance (damage.js → shuffleDodge). Especiais acertam o verdadeiro.
  shuffle: {
    start(f, a, world) {
      if (f.findBuff('shuffle')) { f.notify('JÁ EMBARALHADO'); return null; }
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('concentrate', { restart: true, duration: 0.35 });
      world.audio.play('blink', { volume: 0.8 });
      f.invuln = Math.max(f.invuln, 0.3);
      tl.add(0.15, () => {
        const fwd = opp ? new THREE.Vector3().subVectors(opp.pos, f.pos).setY(0).normalize() : forwardFromYaw(f.yaw, new THREE.Vector3());
        const side = new THREE.Vector3(-fwd.z, 0, fwd.x);
        // troca de lugar com uma das cópias (o "embaralhar")
        const shift = (Math.random() < 0.5 ? -1 : 1) * a.spacing;
        const others = opp ? [{ x: opp.pos.x, z: opp.pos.z, r: 0.6 }] : [];
        const spot = findFreeSpotNear(world.arena, f.pos.x + side.x * shift, f.pos.z + side.z * shift, { radius: f.radius, others });
        world.fx.distort(f.chestPos(), { color: a.color, radius: 1.4, life: 0.25 });
        if (spot) f.pos.set(spot.x, 0, spot.z);
        if (opp) f.yaw = yawTo(f.pos, opp.pos);
        // as cópias em volta, no referencial dele: dos lados e uma atrás
        const slots = [[-shift, 0], [shift * 0.95, -0.35], [-shift * 0.5, -0.9], [shift * 0.5, -0.9]].slice(0, a.copies);
        const copies = slots.map(([x, z]) => {
          const c = new HoloCopy(f, world, { mode: 'mimic', offset: new THREE.Vector3(x, 0, z), life: a.duration, color: a.color, opacity: 0.62 });
          world.addNpc(c);
          world.fx.burst(new THREE.Vector3(c.pos.x, 1, c.pos.z), { count: 14, color: a.color, speed: 2.5, life: 0.35, size: 0.12 });
          return c;
        });
        f.addBuff({
          type: 'shuffle', name: 'EMBARALHAR', time: a.duration, duration: a.duration, copies,
          perCopy: a.perCopy ?? 0.22,
          onEnd() { copies.forEach((c) => c.alive && c.shatter(a.color)); },
        });
        f.notify('EMBARALHAR', true);
      });
      tl.end(0.35);
      return seqFrom(tl);
    },
  },

  // VELOCIDADE MORTAL: o mesmo ritual do Xande (deadlySpeed: velocidade, ataque mais rápido, esquivas de volta), com
  // os RASTROS do Guizo no ar — cópias congeladas que ficam para trás e somem (a passagem do tempo distorcida)
  deadlySpeedTrail: {
    start(f, a, world) {
      const seq = ABILITY_TYPES.selfBuff.start(f, { ...a, buffType: 'deadlySpeed' }, world);
      if (!seq) return null;
      let acc = 0;
      let last = f.pos.clone();
      const pool = [];
      world.after(0.25, () => {
        const b = f.findBuff('deadlySpeed');
        if (!b) return;
        const prevTick = b.onTick;
        b.onTick = (dt) => {
          if (prevTick) prevTick(dt);
          acc += dt;
          const moved = distXZ(f.pos, last) > 0.25 || f.state === 'attack' || f.state === 'dodge' || f.state === 'dashing';
          if (acc < (a.trailEvery ?? 0.1) || !moved) return;
          acc = 0;
          last = f.pos.clone();
          // conjunto fixo de rastros reaproveitados (montar um modelo a cada rastro pesava, principalmente no celular)
          let g = pool.find((x) => x.alive && x.sleeping);
          if (g) g.revive(f.pos, f.yaw, a.trailLife ?? 0.35);
          else if (pool.length < (COARSE ? 2 : a.trailMax ?? 5)) {
            g = new HoloCopy(f, world, { mode: 'ghost', pos: f.pos, yaw: f.yaw, life: a.trailLife ?? 0.35, color: a.color, opacity: 0.4, fadeIn: 0.01, fadeOut: a.trailLife ?? 0.35 });
            g.reusable = true;
            world.addNpc(g);
            pool.push(g);
          }
        };
        const prevEnd = b.onEnd;
        b.onEnd = () => { if (prevEnd) prevEnd(); pool.forEach((g) => g.kill()); };
      });
      return seq;
    },
  },

  // CICATRIZAÇÃO: o tempo corre nas feridas (a cura do jogo), mas cobra: o Guizo ENVELHECE — a cada uso o cabelo
  // fica mais grisalho (ref. "Guizo velho"; até o fim da luta)
  agingHeal: {
    start(f, a, world) {
      const seq = ABILITY_TYPES.healOverTime.start(f, a, world);
      if (!seq) return null;
      world.after(0.6, () => {
        f.ageLevel = Math.min(a.maxAge ?? 3, (f.ageLevel || 0) + 1);
        ageHair(f, f.ageLevel / (a.maxAge ?? 3));
        f.notify(f.ageLevel >= (a.maxAge ?? 3) ? 'ENVELHECEU DE VEZ' : 'ENVELHECEU UM POUCO', true);
      });
      return seq;
    },
  },

  // LIGAÇÃO TELEPÁTICA (disfarce alienígena — a outra forma do Invadir Mente): um fio dourado liga as duas cabeças; o
  // adversário fica EXPOSTO (recebe mais dano) e cada golpe do Guizo devolve um pouco de sanidade (Fighter: mindRead)
  mindLink: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko' || distXZ(f.pos, opp.pos) > a.range) { f.notify('FORA DE ALCANCE'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('gaze', { restart: true, duration: 0.5 });
      world.audio.play('fearGaze', { volume: 0.7, pitch: 1.4 });
      tl.add(0.3, () => {
        if (opp.state === 'ko' || opp.isInvulnerable()) { f.notify('ERROU', true); return; }
        const head = (x) => x.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.15, 0));
        world.fx.tracer(head(f), head(opp), { color: a.color, life: 0.4, width: 0.05 });
        world.fx.distort(head(opp), { color: a.color, radius: 1.2, life: 0.3 });
        const old = opp.findBuff('mindLinked');
        if (old) old.time = a.duration;
        else opp.addBuff({ type: 'mindLinked', name: 'MENTE LIGADA', time: a.duration, duration: a.duration, takenMult: a.takenMult });
        const mine = f.findBuff('telepathy');
        if (mine) mine.time = a.duration;
        else f.addBuff({ type: 'telepathy', name: 'LIGAÇÃO TELEPÁTICA', time: a.duration, duration: a.duration, energyPerHit: a.energyPerHit });
        opp.notify('MENTE INVADIDA', true);
      });
      tl.end(0.5);
      return seqFrom(tl);
    },
  },
};

// deixa o cabelo (peça "hair") grisalho na proporção k (0 = vinho original, 1 = cinza)
function ageHair(f, k) {
  const hair = f.rig.props.hair;
  if (!hair) return;
  const grey = new THREE.Color(0xb4b0b0);
  hair.traverse((o) => {
    if (!o.isMesh || !o.material || o.userData.isOutline || !o.material.color) return;
    if (!o.userData.ownHairMat) { o.material = o.material.clone(); o.userData.ownHairMat = true; o.userData.hairBase = o.material.color.clone(); }
    o.material.color.copy(o.userData.hairBase).lerp(grey, k);
  });
}

// EMBARALHAR (lido em damage.js): um golpe que ia acertar o Guizo pega numa cópia — ela se desfaz e o dano some
export function shuffleDodge(world, attacker, victim, o) {
  const b = victim.findBuff && victim.findBuff('shuffle');
  if (!b || o.kind === 'special' || o.ignoreInvuln || !['melee', 'ranged', 'ability'].includes(o.kind)) return false;
  const alive = b.copies.filter((c) => c.alive);
  if (!alive.length) return false;
  if (Math.random() > b.perCopy * alive.length) return false;
  // a cópia mais perto de quem bateu leva o golpe
  alive.sort((x, y) => distXZ(x.pos, attacker.pos) - distXZ(y.pos, attacker.pos));
  alive[0].shatter(0xd8c070);
  victim.notify('ERA UMA CÓPIA!', true);
  if (attacker.notify) attacker.notify('ERA UMA CÓPIA!');
  return true;
}

Object.assign(ABILITY_TYPES, GUIZO_TYPES);
