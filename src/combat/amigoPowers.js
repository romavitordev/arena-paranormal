import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw, angleDiff, DEG } from '../core/util.js';
import { applyHit } from './damage.js';
import { splitDamage } from './specials/common.js';
import { inkTentacle, inkSplash, ghostBell, bellWave } from '../fx/inkFx.js';

// Habilidades próprias do AMIGO IMAGINÁRIO ("A Obra de Arte Perfeita", O Segredo na Ilha), registradas em
// abilities.js. Wiki: Tentáculos, Agarrão, DERRETER (a tinta escorre no rosto da vítima), DISSOLVER (absorve e
// recupera vida) e O SINO (quem ouve tem a mente falhando e fica vulnerável).

const INK = 0x5a2410;
const v = new THREE.Vector3();

const mouth = (f) => (f.rig.sockets.mouth || f.rig.joints.hd).getWorldPosition(new THREE.Vector3());
const headOf = (f) => f.rig.joints.hd.getWorldPosition(new THREE.Vector3());
const inFront = (f, opp, arc) => Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos))) <= (arc * DEG) / 2;

// ROSTO DERRETIDO: o que sobra depois da tinta — dano contínuo, lento, mais fraco e a tinta pingando do rosto
export function meltFace(world, opp, a) {
  const old = opp.findBuff('meltedFace');
  if (old) { old.time = a.duration; return; }
  let acc = 0;
  const prev = opp.buffTint;
  opp.buffTint = { color: 0x6a3418, base: 0.3 };
  opp.addBuff({
    type: 'meltedFace', name: 'ROSTO DERRETENDO', time: a.duration, duration: a.duration,
    mult: a.weaken, affects: ['melee', 'ranged', 'ability'], speedMult: a.slow,
    onTick(dt) {
      if (opp.state === 'ko') return;
      acc += a.dps * dt;
      if (acc >= 1) { const n = Math.floor(acc); acc -= n; opp.takeDamage(n); opp.flash = 0; }
      if (Math.random() < 0.3) world.fx.burst(headOf(opp), { count: 1, color: INK, speed: 0.2, up: -0.5, life: 0.5, size: 0.08, gravity: 9 });
    },
    onEnd() { if (opp.buffTint && opp.buffTint.color === 0x6a3418) opp.buffTint = prev || null; },
  });
}

export const AMIGO_TYPES = {
  // DERRETER: avança, agarra a cabeça da vítima com as garras e curva o capuz sobre o rosto dela — a tinta escorre do
  // buraco do rosto direto na cara do alvo (dano em pulsos, sem defesa). Solta com o ROSTO DERRETENDO (dano contínuo,
  // lento e mais fraco). Errou (longe, de lado, esquiva): nada.
  inkMelt: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      const hold = a.hold ?? 0.9;
      f.vel.set(0, 0, 0);
      if (opp && distXZ(f.pos, opp.pos) < 6) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('ai_pour', { restart: true, duration: a.windup + hold + a.recovery });
      world.audio.play('drain', { volume: 0.6, pitch: 0.6 });
      let held = false;
      let stream = null;
      const release = () => {
        held = false;
        if (stream) { stream.stop(); stream = null; }
      };
      tl.each(() => {
        if (held) {
          // a vítima fica presa de frente para o buraco do rosto
          const F = forwardFromYaw(f.yaw);
          opp.pos.set(f.pos.x + F.x * 1.0, opp.pos.y, f.pos.z + F.z * 1.0);
          opp.vel.set(0, 0, 0);
          opp.yaw = yawTo(opp.pos, f.pos);
          f.vel.set(0, 0, 0);
          return;
        }
        // investida curta até a vítima
        const t = tl.time;
        if (t > a.windup - 0.16 && t < a.windup + 0.02 && opp && distXZ(f.pos, opp.pos) > 1.1) {
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * 7;
          f.vel.z = F.z * 7;
        } else { f.vel.x = 0; f.vel.z = 0; }
      });
      tl.add(a.windup, () => {
        if (!opp || opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) - opp.radius > a.range || !inFront(f, opp, 110)) {
          f.notify('DERRETER (ERROU)', true);
          return;
        }
        held = true;
        opp.cancelAction && opp.cancelAction();
        opp.stun(hold + 0.25, 'stagger');
        opp.notify('A TINTA ESCORRE NO ROSTO', true);
        world.audio.play('inkPour', { volume: 1 });
        // o jorro: do buraco do rosto direto na cara da vítima
        stream = world.fx.emitter({
          rate: 80,
          follow: () => mouth(f).lerp(headOf(opp), 0.15),
          particle: { color: INK, speed: 0.4, up: -1.2, spread: 0.06, life: 0.3, size: 0.13, gravity: 5 },
        });
      });
      const parts = splitDamage(a.damage, [0.2, 0.2, 0.2, 0.4]);
      parts.forEach((d, i) => tl.add(a.windup + 0.12 + (i * hold) / 4, () => {
        if (!held || opp.state === 'ko') return;
        const p = headOf(opp);
        inkSplash(world, p, { size: i === 3 ? 0.9 : 0.5, puddle: false });
        applyHit(world, f, opp, { damage: d, kind: 'ability', ability: a.id, element: 'tinta', unblockable: true, reaction: false, knockback: 0, hitstun: 0, color: INK, sound: i === 3 ? 'heavyPunch' : 'clawHit', scale: 0.7, pos: p });
      }));
      tl.add(a.windup + hold, () => {
        if (!held) return;
        release();
        if (opp.state === 'ko') return;
        const F = forwardFromYaw(f.yaw);
        opp.vel.x = F.x * 5;
        opp.vel.z = F.z * 5;
        inkSplash(world, opp.pos.clone().setY(0.05), { size: 1.1 });
        meltFace(world, opp, a);
        opp.notify('ROSTO DERRETENDO', true);
      });
      tl.end(a.windup + hold + a.recovery);
      return { update: (dt) => tl.update(dt), cancel: release };
    },
  },

  // O SINO: o sino toca DENTRO da criatura (o sino fantasma aparece sobre o capuz). Três badaladas: cada uma abre uma
  // onda de som em volta (qualquer direção) que machuca um pouco; quem ainda estiver perto na ÚLTIMA fica paralisado
  // e VULNERÁVEL (leva mais dano) — "quem ouve o sino tem a mente falhando".
  bellToll: {
    start(f, a, world) {
      const tl = new Timeline();
      const tolls = a.tolls ?? 3;
      const gap = a.gap ?? 0.3;
      const first = a.windup ?? 0.3;
      const total = first + gap * (tolls - 1) + (a.recovery ?? 0.35);
      f.vel.set(0, 0, 0);
      f.anim.play('ai_bell', { restart: true, duration: total });
      const bell = ghostBell(world, () => headOf(f).add(v.set(0, 0.95, 0)), { life: total + 0.2 });
      for (let i = 0; i < tolls; i++) {
        tl.add(first + i * gap, () => {
          const last = i === tolls - 1;
          bell.toll();
          world.audio.play('bellToll', { volume: last ? 1.1 : 0.8, pitch: 1 - i * 0.06 });
          bellWave(world, f.pos.clone().setY(1.0), a.range * (0.75 + 0.125 * i), a.color ?? 0xb07a3a);
          world.cameraRig.shake && world.cameraRig.shake(last ? 0.22 : 0.1, 0.2);
          const opp = f.opponent;
          if (!opp || opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) > a.range) return;
          applyHit(world, f, opp, { damage: last ? a.damage : a.tollDamage, kind: 'ability', ability: a.id, element: 'tinta', unblockable: true, reaction: false, knockback: 0, hitstun: 0, color: 0xb07a3a, sound: 'impact', scale: 0.6 });
          if (!last || opp.state === 'ko') { opp.notify('O SINO...', true); return; }
          opp.stun(a.stun, 'fear');
          const old = opp.findBuff('bellDazed');
          if (old) old.time = a.vulnTime;
          else opp.addBuff({ type: 'bellDazed', name: 'A MENTE FALHA', time: a.vulnTime, duration: a.vulnTime, takenMult: a.takenMult });
          opp.notify('O SINO TOCOU — A MENTE FALHA', true);
          world.fx.burst(headOf(opp), { count: 24, color: 0x2a1408, kind: 'smoke', speed: 1.5, life: 0.8, size: 0.4 });
          world.onHit && world.onHit(f, opp, 0, { kind: 'ability', ability: a.id });
        });
      }
      tl.end(total);
      return { update: (dt) => tl.update(dt), cancel() {} };
    },
  },

  // DISSOLVER: derrete inteiro numa poça da própria tinta (intocável enquanto isso), absorve e recupera vida, e se
  // refaz de uma vez — a tinta espirra em volta e machuca quem estiver em cima da poça.
  inkDissolve: {
    start(f, a, world) {
      if (f.health >= f.maxHealth) {
        f.notify('VIDA CHEIA');
        return null;
      }
      const total = a.time ?? 1.6;
      const melt = 0.35;
      const tl = new Timeline();
      const root = f.rig.root;
      let healed = 0;
      f.vel.set(0, 0, 0);
      f.invuln = Math.max(f.invuln, total - 0.15);
      f.anim.play('ai_dissolve', { restart: true, duration: total });
      world.audio.play('inkPour', { volume: 0.9, pitch: 0.8 });
      inkSplash(world, f.pos.clone().setY(0.05), { size: 1.7, life: total + 0.6 });
      const reset = () => root.scale.set(1, 1, 1);
      tl.each((t, dt) => {
        f.vel.set(0, 0, 0);
        const m = t < melt ? t / melt : t > total - melt ? Math.max(0, (total - t) / melt) : 1;
        root.scale.set(1 + m * 0.45, Math.max(0.06, 1 - m * 0.94), 1 + m * 0.45);
        if (t > melt && t < total - melt) {
          const n = Math.min(a.heal - healed, (a.heal / (total - 2 * melt)) * dt);
          if (n > 0) { healed += n; f.health = Math.min(f.maxHealth, f.health + n); }
          if (Math.random() < 0.4) world.fx.burst(f.pos.clone().add(v.set((Math.random() - 0.5) * 1.6, 0.05, (Math.random() - 0.5) * 1.6)), { count: 1, color: INK, speed: 0.3, up: 0.8, life: 0.4, size: 0.1, gravity: 3 });
        }
      });
      // se refaz: a tinta espirra em volta
      tl.add(total - melt * 0.5, () => {
        world.audio.play('heavyPunch', { volume: 0.6, pitch: 0.6 });
        inkSplash(world, f.pos.clone().setY(0.4), { size: 1.4, puddle: false });
        world.fx.ring(f.pos.clone().setY(0.08), { color: INK, radius: a.radius ?? 2.2, life: 0.4 });
        const opp = f.opponent;
        if (opp && opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(f.pos, opp.pos) <= (a.radius ?? 2.2)) {
          applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: 'tinta', knockback: 3, hitstun: 0.4, color: INK, sound: 'impact', scale: 1 });
        }
      });
      tl.add(total, reset);
      tl.end(total);
      return { update: (dt) => tl.update(dt), cancel: reset };
    },
  },

  // TENTÁCULOS QUE PRENDEM: aponta a garra e uma poça de tinta se abre debaixo do alvo (o aviso — dá para sair dela);
  // os tentáculos brotam da poça, se enrolam em quem ficou em cima e o prendem.
  inkTentacles: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('ai_point', { restart: true, duration: a.windup + 0.35 });
      world.audio.play('chainThrow', { volume: 0.7, pitch: 0.6 });
      // o lugar: onde o alvo está (se estiver no alcance e na frente) ou o ponto mais distante à frente
      const F = forwardFromYaw(f.yaw);
      const ok = opp && opp.state !== 'ko' && distXZ(f.pos, opp.pos) <= a.range && inFront(f, opp, a.arc ?? 60);
      const spot = ok ? opp.pos.clone().setY(0) : new THREE.Vector3(f.pos.x + F.x * a.range * 0.6, 0, f.pos.z + F.z * a.range * 0.6);
      inkSplash(world, spot.clone().setY(0.05), { size: 1.5, life: a.windup + (a.hold ?? 1.2) + 0.5 });
      world.fx.ring(spot.clone().setY(0.07), { color: INK, radius: a.radius ?? 1.3, life: a.windup, inner: 0.88 });
      tl.add(a.windup, () => {
        const caught = opp && opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, spot) <= (a.radius ?? 1.3) + opp.radius;
        const n = a.count ?? 4;
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + 0.3;
          const base = new THREE.Vector3(spot.x + Math.sin(ang) * 1.0, 0.02, spot.z + Math.cos(ang) * 1.0);
          const end = caught ? () => opp.pos.clone().setY(opp.pos.y + 0.6 + (i % 2) * 0.5) : base.clone().setY(1.4 + (i % 2) * 0.4);
          inkTentacle(world, base, end, { grow: 0.14, hold: caught ? a.hold : 0.25, retract: 0.22, coil: caught, radius: 0.085, arc: 0.6 });
        }
        world.audio.play('chainPull', { volume: 0.8, pitch: 0.7 });
        if (!caught) { f.notify('TENTÁCULOS (ERROU)', true); return; }
        const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', ability: a.id, element: 'tinta', knockback: 0, hitstun: 0.3, reaction: false, sound: 'clawHit', color: INK, scale: 1 });
        if (typeof res !== 'number' || opp.state === 'ko') return;
        opp.stun(a.hold, 'stagger');
        opp.vel.set(0, 0, 0);
        opp.notify('PRESO PELOS TENTÁCULOS', true);
      });
      tl.end(a.windup + 0.35);
      return { update: (dt) => tl.update(dt), cancel() {} };
    },
  },
};
