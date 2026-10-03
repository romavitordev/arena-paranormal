import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw, angleDiff, DEG } from '../core/util.js';
import { findSpotBehind, findFreeSpotNear } from './positioning.js';
import { applyHit } from './damage.js';
import { splitDamage } from './specials/common.js';
import { hasPassive } from './passives.js';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';
import { DanteClone, CLONE, BloodZombie } from './npcs.js';
import { buildHuntingDog } from '../models/dog.js';
import { bloodCoat } from '../models/weapons.js';
import { addBloodPool, poolsOf, splatGeo } from './bloodPools.js';

// Paga um custo em vida (rituais de Sangue) sem nunca se matar
function payHealth(f, n) {
  const paid = Math.min(n, Math.max(0, f.health - 1));
  f.health -= paid;
  f.world.fx.burst(f.chestPos(), { count: 12, color: 0x9a0010, speed: 2, life: 0.6, size: 0.18, gravity: 7 });
  return paid;
}

// Habilidades fora de físico / principal / especial, registradas por tipo.
// Um personagem novo pode reutilizar qualquer tipo daqui só configurando dados.
// Cada tipo: start(fighter, cfg, world) → { update(dt)→done, cancel(), cancelable()? } ou null (falhou, sem custo)

const v = new THREE.Vector3();

export function vanishFx(world, pos, color) {
  const p = v.set(pos.x, pos.y + 1.0, pos.z).clone();
  world.fx.burst(p, { count: 26, color: 0x0c0608, speed: 3, life: 0.6, size: 0.8, kind: 'smoke', spread: 1, grow: 1.2, jitter: 0.6 });
  world.fx.burst(p, { count: 20, color, speed: 6, life: 0.35, size: 0.2, jitter: 0.5 });
  world.fx.flash(p, { color, size: 2.2, life: 0.12 });
}

// Alvo dentro de alcance e de um cone à frente?
function inCone(f, target, range, arc) {
  if (!target || target.state === 'ko') return false;
  if (distXZ(f.pos, target.pos) > range) return false;
  return Math.abs(angleDiff(f.yaw, yawTo(f.pos, target.pos))) <= (arc * DEG) / 2;
}

// Armadura de Sangue de QUEM CONJURA o ritual (a.bloodArm): o braço vira uma arma de sangue — golpes físicos mais
// fortes e o braço de sangue aparece (Fighter.updateBloodShell). Recebida por assistência, só dá a resistência.
function bloodArmBuff(a) {
  return a.bloodArm ? { bloodArmSide: a.bloodArm.side, mult: a.bloodArm.meleeMult, affects: ['melee'] } : {};
}

function seqFrom(tl, extra = {}) {
  return { update: (dt) => tl.update(dt), ...extra };
}

// MAGRAS (Lírio): voltas de tripa que se enrolam no corpo do alvo e apertam enquanto ele está preso; no fim
// soltam junto com a corda (ropes)
function wrapCoils(world, opp, hold, ropes) {
  const mat = new THREE.MeshToonMaterial({ color: 0xa8343c, emissive: 0x4a0008, emissiveIntensity: 0.4 });
  const geo = new THREE.TorusGeometry(1, 0.08, 6, 20);
  const coils = [0.55, 0.95, 1.3].map((y, i) => {
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = Math.PI / 2 + (i - 1) * 0.25;
    m.userData.y = y;
    world.scene.add(m);
    return m;
  });
  let t = 0;
  const sz = opp.size || 1;
  const r0 = 0.9 * sz;
  const r1 = (opp.radius || 0.45) * 0.8;
  world.addTicker({
    update(dt) {
      t += dt;
      const k = Math.min(1, t / 0.16);
      const r = r0 + (r1 - r0) * k;
      coils.forEach((c, i) => {
        c.position.set(opp.pos.x, opp.pos.y + c.userData.y * sz, opp.pos.z);
        c.scale.set(r, r, r);
        c.rotation.z += dt * (i % 2 ? 2 : -2);
      });
      return t >= hold || opp.state === 'ko';
    },
    dispose() {
      coils.forEach((c) => world.scene.remove(c));
      geo.dispose();
      mat.dispose();
      if (ropes) ropes.forEach((r) => r.alive && r.stop());
      world.fx.burst(new THREE.Vector3(opp.pos.x, 1, opp.pos.z), { count: 14, color: 0x9a0010, speed: 2.5, life: 0.5, size: 0.14, gravity: 8 });
    },
  });
}

export const ABILITY_TYPES = {
  // ------------------------------------------------------------------ JOUI
  // Teleporte das Sombras: afunda na própria sombra e surge atrás do inimigo.
  teleportBehind: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const target = () => ({ x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw });
      const first = findSpotBehind(world.arena, target(), { distance: a.distance, radius: f.radius });
      if (!first) {
        f.notify('SEM ESPAÇO PARA TELEPORTAR');
        return null;
      }
      const tl = new Timeline();
      const sink = a.vanishTime;
      f.vel.set(0, 0, 0);
      f.anim.play('vanish', { restart: true, duration: sink });
      world.fx.shadowDisc(f.pos, { radius: 1.1, life: sink + 0.35 });
      world.audio.play('teleport');
      f.invuln = sink + 0.05;
      tl.each((time) => {
        // afunda na sombra
        if (time <= sink) f.rig.body.position.y = -1.9 * (time / sink);
      });
      tl.add(sink, () => {
        f.setVisible(false);
        world.fx.burst(new THREE.Vector3(f.pos.x, 0.2, f.pos.z), { count: 18, color: 0x0c0608, kind: 'smoke', speed: 2, up: 1, life: 0.6, size: 0.7 });
      });
      tl.add(sink + 0.06, () => {
        const spot = findSpotBehind(world.arena, target(), { distance: a.distance, radius: f.radius }) || first;
        f.pos.set(spot.x, Math.max(0, opp.pos.y), spot.z);
        f.yaw = yawTo(f.pos, opp.pos);
        world.fx.shadowDisc(f.pos, { radius: 1.1, life: 0.45 });
        f.rig.body.position.y = -1.6;
        f.setVisible(true);
        f.invuln = 0.12;
        // o adversário demora um instante para perceber de onde ele veio (Precognição evita)
        if (!hasPassive(opp, 'precognition')) opp.surprised = a.surpriseTime ?? 0.45;
      });
      // emerge da sombra já pronto para atacar
      tl.each((time) => {
        if (time > sink + 0.06) f.rig.body.position.y = Math.min(0, -1.6 + ((time - sink - 0.06) / 0.1) * 1.6);
      });
      tl.add(sink + 0.16, () => {
        f.rig.body.position.y = 0;
        world.fx.burst(f.chestPos(), { count: 14, color: a.color, speed: 4, life: 0.3, size: 0.2 });
        f.anim.play('idle', { restart: true, blend: 0.05 });
      });
      tl.end(sink + 0.22);
      return seqFrom(tl, {
        cancel: () => { f.setVisible(true); f.rig.body.position.y = 0; },
        cancelable: () => tl.time > sink + 0.1,
        finish: () => { f.rig.body.position.y = 0; },
      });
    },
  },

  // Olhar do Desespero: encara o adversário e libera uma manifestação de medo.
  fearGaze: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('gaze', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('fearGaze');
      const head = () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.15, 0));
      const eyes = world.fx.emitter({ rate: 40, follow: head, particle: { color: a.color, speed: 0.5, spread: 0.3, life: 0.3, size: 0.15 } });
      tl.add(a.windup, () => {
        eyes.stop();
        const F = forwardFromYaw(f.yaw);
        // onda de medo em cone
        for (let i = 1; i <= 4; i++) {
          const p = head().addScaledVector(F, i * 1.6);
          world.fx.ring(p, { color: 0x1a0610, radius: 0.8 + i * 0.5, life: 0.35 + i * 0.05, vertical: true, yaw: f.yaw + Math.PI / 2, inner: 0.85, opacity: 0.9 });
          world.fx.ring(p, { color: a.color, radius: 0.7 + i * 0.5, life: 0.3, vertical: true, yaw: f.yaw + Math.PI / 2, inner: 0.92 });
        }
        world.fx.flash(head(), { color: a.color, size: 1.2, life: 0.2 });
        if (inCone(f, opp, a.range, a.arc) && !opp.isInvulnerable()) {
          opp.stun(a.stun, 'fear');
          world.fx.burst(opp.chestPos(), { count: 30, color: 0x1a0610, kind: 'smoke', speed: 2, life: 1.0, size: 0.8, grow: 1 });
          world.fx.burst(opp.chestPos(), { count: 16, color: a.color, speed: 3, life: 0.6, size: 0.2 });
          opp.notify('DESESPERO', true);
          world.onHit && world.onHit(f, opp, 0, { kind: 'ability', ability: a.id });
        }
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: () => eyes.stop() });
    },
  },

  // ------------------------------------------------------------------ KAISER
  // Baforada Cinerária: sopra uma nuvem de névoa que controla o espaço.
  mistCloud: {
    start(f, a, world) {
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      const opp = f.opponent;
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('breath', { restart: true, duration: 0.7 });
      world.audio.play('smoke');
      const mouth = () => f.rig.sockets.mouth.getWorldPosition(new THREE.Vector3());
      const F = forwardFromYaw(f.yaw);
      const breath = world.fx.emitter({ rate: 90, follow: mouth, particle: { color: a.color, kind: 'smoke', speed: 5, spread: 0.25, life: 0.7, size: 0.4, grow: 2.5, dir: F.clone().multiplyScalar(1.2) } });
      tl.add(0.4, () => {
        breath.stop();
        const center = new THREE.Vector3(f.pos.x + F.x * a.distance, 0, f.pos.z + F.z * a.distance);
        createMistZone(world, f, { center: () => center, radius: a.radius, duration: a.duration, slow: a.enemySlow, enemyRegen: a.enemyRegen, eatsProjectiles: a.eatsProjectiles, color: a.color, density: a.smokeIntensity ?? 1 });
      });
      tl.end(0.7);
      return seqFrom(tl, { cancel: () => breath.stop() });
    },
  },

  // ------------------------------------------------------------------ ARTHUR
  // Rebirth: a arma fica temporariamente amaldiçoada (estado da arma).
  weaponState: {
    start(f, a, world) {
      if (f.findBuff('weaponState')) {
        f.notify('REBIRTH JÁ ATIVO');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('rebirth', { restart: true, duration: 0.9 });
      world.audio.play('rebirth');
      const body = world.fx.emitter({
        rate: 70,
        follow: () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 0.6, f.pos.y + Math.random() * 1.8, f.pos.z + (Math.random() - 0.5) * 0.6),
        particle: { color: a.color, speed: 1.5, up: 1.2, spread: 0.3, life: 0.5, size: 0.2 },
      });
      tl.add(0.3, () => {
        for (let i = 0; i < 6; i++) {
          const c = f.chestPos();
          world.fx.lightning(c, c.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2)), { color: a.color, life: 0.25 });
        }
      });
      tl.add(0.65, () => {
        body.stop();
        const back = () => f.rig.sockets.back.getWorldPosition(new THREE.Vector3());
        const runes = world.fx.runes(() => {
          const muzzle = f.rig.props.sniperHand && f.rig.props.sniperHand.visible ? f.rig.muzzle.getWorldPosition(new THREE.Vector3()) : back();
          return muzzle;
        }, { color: a.color, count: 6, radius: 0.5, shape: 'skull', size: 0.24 });
        f.rig.showProp('eyes', true);
        world.fx.flash(back(), { color: a.color, size: 2.5, life: 0.2 });
        let tick = 0;
        f.addBuff({
          type: 'weaponState',
          name: 'REBIRTH',
          shots: a.shots,
          bonusDamage: a.bonusDamage,
          time: a.duration,
          duration: a.duration,
          projectile: a.projectile,
          onTick(dt) {
            tick += dt;
            if (tick > 0.12) {
              tick = 0;
              const p = back();
              world.fx.lightning(p, p.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.9)), { color: a.color, life: 0.08 });
            }
          },
          onEnd() {
            runes.stop();
            f.rig.showProp('eyes', false);
            world.fx.burst(back(), { count: 16, color: a.color, speed: 2, life: 0.4, size: 0.2 });
          },
        });
      });
      tl.end(0.9);
      return seqFrom(tl, { cancel: () => body.stop() });
    },
  },

  // ------------------------------------------------------------------ AGHATA
  // Descarnar: ritual que abre cortes sobrenaturais no corpo do alvo à distância.
  ritualCuts: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: a.windup + 0.35 });
      const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
      const glow = world.fx.emitter({ rate: 80, follow: hand, particle: { color: a.color, speed: 1, spread: 0.6, life: 0.35, size: 0.22, jitter: 0.1 } });
      f.glowTint = { color: a.color, base: 0.12 };
      world.audio.play('ritual', { volume: 0.6 });
      const parts = splitDamage(a.damage, Array(a.cuts).fill(1));
      let connected = false;
      tl.add(a.windup, () => {
        glow.stop();
        f.glowTint = null;
        connected = inCone(f, opp, a.range, a.arc) && !opp.isInvulnerable();
        const end = connected ? opp.chestPos() : hand().addScaledVector(forwardFromYaw(f.yaw), a.range);
        world.fx.tracer(hand(), end, { color: a.color, life: 0.18, width: 0.03 });
        world.audio.play('descarnar');
        if (!connected) world.fx.burst(end, { count: 10, color: a.color, speed: 2, life: 0.4, size: 0.2 });
      });
      for (let i = 0; i < a.cuts; i++) {
        tl.add(a.windup + 0.05 + i * a.interval, () => {
          if (!connected || opp.state === 'ko') return;
          const joints = ['sp', 'hd', 'sL', 'sR', 'eL', 'eR', 'lL', 'lR', 'kL', 'kR'];
          const j = opp.rig.joints[joints[(i * 3 + 1) % joints.length]];
          world.fx.cutMark(j, { color: a.color, life: 1.6 });
          const p = j.getWorldPosition(new THREE.Vector3());
          world.fx.burst(p, { count: 8, color: a.color, speed: 3, life: 0.4, size: 0.18, gravity: 6 });
          const last = i === a.cuts - 1;
          applyHit(world, f, opp, {
            damage: parts[i], kind: 'ability', reaction: last, knockback: 2, hitstun: 0.45,
            sound: 'bladeHit', color: a.color, scale: 0.6, ignoreInvuln: !last, pos: p,
          });
          if (!last && opp.state !== 'ko' && opp.state !== 'block') opp.anim.play('hit', { restart: true });
        });
      }
      tl.end(a.windup + 0.05 + a.cuts * a.interval + 0.15);
      return seqFrom(tl, { cancel: () => { glow.stop(); f.glowTint = null; } });
    },
  },

  // Amaldiçoar Arma (Sangue): a faca fica amaldiçoada e os acertos abrem sangramento.
  curseWeapon: {
    start(f, a, world) {
      if (f.findBuff('curse')) {
        f.notify('ARMA JÁ AMALDIÇOADA');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('concentrate', { restart: true, duration: 0.6 });
      world.audio.play('ritual', { volume: 0.5 });
      const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
      // sangue subindo do chão em espiral até a faca
      const swirl = world.fx.emitter({
        rate: 90,
        follow: () => {
          const t = performance.now() / 120;
          return new THREE.Vector3(f.pos.x + Math.sin(t) * 0.7, f.pos.y + 0.2 + (t % 1) * 1.2, f.pos.z + Math.cos(t) * 0.7);
        },
        particle: { color: a.color, speed: 0.8, up: 1.2, spread: 0.2, life: 0.5, size: 0.18 },
      });
      tl.add(0.5, () => {
        swirl.stop();
        world.fx.burst(hand(), { count: 30, color: a.color, speed: 4, life: 0.5, size: 0.2 });
        world.fx.flash(hand(), { color: a.color, size: 1.4, life: 0.15 });
        const knives = (a.props || ['knife', 'knifeThrow']).map((n) => f.rig.props[n]).filter(Boolean);
        // encanto de SANGUE: a arma fica coberta de sangue (mesmo material da Arma de Sangue do Arthur); outros
        // elementos (ex.: Morte da Espada Consumidora) brilham na cor do ritual
        const isBlood = (a.element || f.def.element) === 'sangue';
        let uncoat = [];
        const glow = (on) => knives.forEach((k) => k.traverse((o) => {
          if (o.isMesh && o.material && o.material.emissive) {
            o.material.emissive.set(on ? a.color : 0x000000);
            o.material.emissiveIntensity = on ? 1.4 : 0;
            o.material.userData.keepEmissive = on; // o "flash" de dano não apaga o brilho
          }
        }));
        const tint = (on) => {
          if (!isBlood) return glow(on);
          if (on) uncoat = knives.map((k) => bloodCoat(k));
          else { uncoat.forEach((u) => u()); uncoat = []; }
        };
        tint(true);
        const drip = world.fx.emitter({ rate: 18, follow: hand, particle: { color: 0x9a0010, speed: 0.4, spread: 0.2, life: 0.6, size: 0.12, gravity: 6 } });
        f.addBuff({
          type: 'curse',
          name: 'ARMA AMALDIÇOADA',
          bleed: a.bleed,
          time: a.duration,
          duration: a.duration,
          onEnd() { drip.stop(); tint(false); },
        });
      });
      tl.end(0.6);
      return seqFrom(tl, { cancel: () => swirl.stop() });
    },
  },

  // ------------------------------------------------------------------ INJUSTIÇA
  // Corrente: prende no inimigo e puxa o PRÓPRIO Injustiça até ele (aproximação).
  chainSelfPull: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || distXZ(f.pos, opp.pos) > a.range) {
        f.notify('ALVO FORA DE ALCANCE');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('chain_throw', { restart: true, duration: 0.4 });
      world.audio.play('chainThrow');
      const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
      const tip = hand();
      let phase = 'throw';
      let t = 0;
      const chain = world.fx.chain(hand, () => tip.clone(), { links: 30, sag: 0.08 });
      const finish = () => { chain.stop(); f.vel.set(0, 0, 0); };
      return {
        update(dt) {
          t += dt;
          if (phase === 'throw') {
            const goal = opp.chestPos();
            const dir = goal.clone().sub(tip);
            const step = a.chainSpeed * dt;
            if (dir.length() <= step + 0.3) {
              if (opp.isInvulnerable() || opp.state === 'ko') { phase = 'retract'; t = 0; return false; }
              phase = 'fly';
              t = 0;
              world.audio.play('chainPull');
              f.anim.play('chain_fly', { restart: true });
              world.fx.burst(goal, { count: 14, color: a.color, speed: 4, life: 0.3, size: 0.2 });
            } else tip.addScaledVector(dir.normalize(), step);
            if (t > 1) { phase = 'retract'; t = 0; }
            return false;
          }
          if (phase === 'fly') {
            tip.copy(opp.chestPos());
            f.yaw = yawTo(f.pos, opp.pos);
            const F = forwardFromYaw(f.yaw);
            f.vel.x = F.x * a.flySpeed;
            f.vel.z = F.z * a.flySpeed;
            world.fx.burst(f.chestPos(), { count: 2, color: a.color, speed: 1, life: 0.25, size: 0.3 });
            if (distXZ(f.pos, opp.pos) <= 1.5 || t > 0.8) {
              f.vel.set(0, 0, 0);
              chain.stop();
              f.anim.play('dual_cross', { restart: true, duration: 0.42 });
              world.audio.play('blade');
              world.fx.slash(opp.chestPos(), f.yaw, { color: a.color, radius: 1.8, roll: 0.8, life: 0.3 });
              world.fx.slash(opp.chestPos(), f.yaw, { color: a.color, radius: 1.8, roll: -0.8, flip: true, life: 0.3 });
              applyHit(world, f, opp, { damage: a.damage, kind: 'ability', knockback: 1.5, hitstun: a.hitstun, sound: 'bladeHit', dir: F.clone() });
              phase = 'recover';
              t = 0;
            }
            return false;
          }
          if (phase === 'retract') {
            const back = hand().sub(tip);
            if (back.length() < 0.5 || t > 0.5) { finish(); return true; }
            tip.addScaledVector(back.normalize(), a.chainSpeed * dt);
            return false;
          }
          if (phase === 'recover') return t > 0.3;
          return true;
        },
        cancel: finish,
      };
    },
  },

  // ------------------------------------------------------------------ KIAN
  // Teletransporte: some numa distorção e reaparece numa posição válida.
  blink: {
    start(f, a, world) {
      const opp = f.opponent;
      const dir = f.moveInputWorld(new THREE.Vector3());
      let want;
      if (dir.length() > 0.3) {
        dir.normalize();
        want = { x: f.pos.x + dir.x * a.distance, z: f.pos.z + dir.z * a.distance };
      } else if (opp) {
        // sem direção: surge ao lado do adversário
        const side = yawTo(opp.pos, f.pos) + Math.PI / 2;
        want = { x: opp.pos.x + Math.sin(side) * a.flankDistance, z: opp.pos.z + Math.cos(side) * a.flankDistance };
      } else {
        want = { x: f.pos.x, z: f.pos.z };
      }
      const others = opp ? [{ x: opp.pos.x, z: opp.pos.z, r: 0.6 }] : [];
      const spot = findFreeSpotNear(world.arena, want.x, want.z, { radius: f.radius, others });
      if (!spot) {
        f.notify('SEM ESPAÇO');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('vanish', { restart: true, duration: a.vanishTime });
      world.audio.play('blink');
      world.fx.distort(f.chestPos(), { color: a.color, radius: 1.8, life: 0.35 });
      f.invuln = a.vanishTime + 0.12;
      tl.add(a.vanishTime * 0.6, () => f.setVisible(false));
      tl.add(a.vanishTime, () => {
        f.pos.set(spot.x, 0, spot.z);
        if (opp) f.yaw = yawTo(f.pos, opp.pos);
        f.setVisible(true);
        world.fx.distort(f.chestPos(), { color: a.color, radius: 2.2, life: 0.4 });
        world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: a.color, radius: 2.2, life: 0.35 });
        world.fx.burst(f.chestPos(), { count: 20, color: a.color, speed: 5, life: 0.35, size: 0.2 });
        f.anim.play('idle', { restart: true, blend: 0.05 });
      });
      tl.end(a.vanishTime + 0.15);
      return seqFrom(tl, { cancel: () => f.setVisible(true), cancelable: () => tl.time > a.vanishTime + 0.02 });
    },
  },

  // Transcendência: exposição total; golpes físicos atravessam a defesa por alguns segundos.
  transcend: {
    start(f, a, world) {
      if (f.findBuff('transcend')) {
        f.notify('JÁ EM TRANSCENDÊNCIA');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('charge_fists', { restart: true, duration: 0.7 });
      world.audio.play('rebirth', { volume: 0.7 });
      world.fx.distort(f.chestPos(), { color: a.color, radius: 2.4, life: 0.5 });
      tl.add(0.45, () => {
        world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: a.color, radius: 4, life: 0.6 });
        world.fx.burst(f.chestPos(), { count: 50, color: a.color, speed: 7, life: 0.6, size: 0.25 });
        world.screenFlash && world.screenFlash('#fff2c8', 0.06);
        const glow = world.fx.emitter({
          rate: 50,
          follow: () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 0.8, f.pos.y + Math.random() * 1.9, f.pos.z + (Math.random() - 0.5) * 0.8),
          particle: { color: a.color, speed: 0.6, up: 1.2, spread: 0.3, life: 0.5, size: 0.14 },
        });
        f.buffTint = { color: a.color, base: 0.3 };
        // Kian: a primeira Transcendência da partida libera mais um uso do especial (Inexistir)
        const bonus = f.def.special && f.def.special.bonusUseOnTranscend;
        if (bonus && !f.transcendBonusGiven) {
          f.transcendBonusGiven = true;
          f.specialBonusUses += bonus;
          f.notify(`${f.def.special.name.toUpperCase()} +${bonus}`, true);
        }
        f.addBuff({
          type: 'transcend',
          name: 'TRANSCENDÊNCIA',
          time: a.duration,
          duration: a.duration,
          noRegen: true, // transcender cobra sanidade: não regenera enquanto dura...
          onEnd() { glow.stop(); f.buffTint = null; f.drainEnergy(a.endDrain || 0); }, // ...e drena no fim
        });
      });
      tl.end(0.7);
      return seqFrom(tl);
    },
  },

  // Lâmina do Medo: manifestação translúcida na mão para um golpe devastador.
  fearBlade: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp && distXZ(f.pos, opp.pos) < 8) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('fear_blade', { restart: true, duration: a.duration });
      world.audio.play('fearGaze', { volume: 0.6 });
      f.rig.showProp('fearBlade', true);
      const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
      const aura = world.fx.emitter({ rate: 70, follow: hand, particle: { color: a.color, speed: 1, spread: 0.6, life: 0.4, size: 0.25 } });
      let hit = false;
      tl.each((time) => {
        // avanço curto durante o golpe
        if (time > a.active[0] - 0.1 && time < a.active[1]) {
          const F = forwardFromYaw(f.yaw);
          const close = opp && distXZ(f.pos, opp.pos) < 1.2;
          f.vel.x = close ? 0 : F.x * 7;
          f.vel.z = close ? 0 : F.z * 7;
        } else {
          f.vel.x = 0;
          f.vel.z = 0;
        }
        if (!hit && time >= a.active[0] && time <= a.active[1] && opp && opp.state !== 'ko') {
          const d = distXZ(f.pos, opp.pos) - opp.radius;
          if (d <= a.range && Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos))) <= (a.arc * DEG) / 2) {
            hit = true;
            const res = applyHit(world, f, opp, {
              damage: a.damage, kind: 'ability', guardBreak: true, element: 'medo', knockback: 9, launch: true, hitstun: a.hitstun,
              sound: 'fearBlade', color: a.color, scale: 2.2, dir: forwardFromYaw(f.yaw),
            });
            if (typeof res === 'number' && res > 0) world.fx.distort(opp.chestPos(), { color: a.color, radius: 2.6, life: 0.45 });
          }
        }
      });
      tl.add(a.active[0], () => {
        world.audio.play('fearBlade');
        world.fx.slash(f.chestPos(), f.yaw, { color: a.color, radius: 2.6, arc: 2.8, life: 0.4, width: 0.6, roll: 0.4 });
        world.fx.slash(f.chestPos(), f.yaw, { color: 0x000000, radius: 2.4, arc: 2.6, life: 0.3, width: 0.25, roll: 0.4 });
      });
      tl.add(a.active[1] + 0.1, () => { f.rig.showProp('fearBlade', false); aura.stop(); });
      // errar deixa o Kian exposto por mais tempo
      tl.end(a.duration + a.whiffRecovery);
      return {
        update: (dt) => {
          const done = tl.update(dt);
          return done || (hit && tl.time >= a.duration);
        },
        cancel: () => { f.rig.showProp('fearBlade', false); aura.stop(); },
      };
    },
  },
};

// ------------------------------------------------------------------ NOVAS (cânone)
Object.assign(ABILITY_TYPES, {
  // Kaiser — Dissipar Espíritos "Acácia": chuva de pequenas flores roxas sobre o alvo.
  flowerRain: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || distXZ(f.pos, opp.pos) > a.range) {
        f.notify('ALVO LONGE DEMAIS');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('cast_up', { restart: true, duration: a.castTime + 0.25 });
      world.audio.play('rebirth', { volume: 0.5, pitch: 1.4 });
      const center = new THREE.Vector3(opp.pos.x, 0, opp.pos.z);
      world.fx.ring(new THREE.Vector3(center.x, 0.06, center.z), { color: a.color, radius: a.radius, life: a.castTime + 0.2 });
      let rain = null;
      tl.add(a.castTime, () => {
        world.fx.flash(f.chestPos(), { color: a.color, size: 1.6, life: 0.15 });
        rain = world.fx.emitter({
          rate: 120,
          follow: () => {
            const ang = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * a.radius;
            return new THREE.Vector3(center.x + Math.sin(ang) * r, 4 + Math.random() * 1.5, center.z + Math.cos(ang) * r);
          },
          particle: { color: a.color, speed: 0.4, up: -5, spread: 0.2, life: 0.9, size: 0.16, gravity: 2 },
        });
        // a chuva continua sozinha depois que o Kaiser volta a agir
        for (let i = 0; i < a.hits; i++) {
          world.after(0.15 + i * a.interval, () => {
            if (opp.state === 'ko' || distXZ(opp.pos, center) > a.radius + opp.radius) return;
            applyHit(world, f, opp, {
              damage: a.damage / a.hits, kind: 'ability', knockback: 0.6, hitstun: 0.28, sound: 'clawHit',
              color: a.color, scale: 0.8, dir: new THREE.Vector3().subVectors(opp.pos, center).setY(0).normalize(), hitstop: 0.03,
            });
          });
        }
        world.after(0.35 + a.hits * a.interval, () => rain && rain.stop());
      });
      tl.add(a.castTime + 0.2, () => f.anim.play('idle', { blend: 0.1 }));
      tl.end(a.castTime + 0.3);
      return seqFrom(tl, { cancel: () => rain && rain.stop() });
    },
  },

  // Arthur — Paralisia de Sangue "Dystopia": suja o símbolo com o próprio sangue e paralisa o alvo.
  bloodParalysis: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      payHealth(f, a.healthCost);
      f.anim.play('gaze', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('bloodClaw', { volume: 0.8 });
      const head = () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.12, 0));
      const eyes = world.fx.emitter({ rate: 40, follow: head, particle: { color: a.color, speed: 0.4, spread: 0.2, life: 0.3, size: 0.12 } });
      tl.add(a.windup, () => {
        eyes.stop();
        world.fx.flash(head(), { color: a.color, size: 1.4, life: 0.2 });
        world.screenFlash && world.screenFlash('#5a0008', 0.05);
        if (inCone(f, opp, a.range, a.arc) && !opp.isInvulnerable()) {
          opp.stun(a.stun, 'stagger');
          const p = opp.chestPos();
          world.fx.ring(p, { color: a.color, radius: 1.6, life: 0.6, vertical: true, yaw: f.yaw });
          world.fx.ring(new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z), { color: a.color, radius: 1.4, life: a.stun });
          world.fx.burst(p, { count: 24, color: 0x9a0010, speed: 2, life: 0.8, size: 0.2, gravity: 5 });
          opp.notify('DYSTOPIA', true);
          world.onHit && world.onHit(f, opp, 0, { kind: 'ability', ability: a.id });
        }
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: () => eyes.stop() });
    },
  },

  // Arthur — Arma de Sangue: projeta uma lâmina do próprio sangue (golpes com mais alcance e sangramento).
  bloodBlade: {
    start(f, a, world) {
      if (f.findBuff('bloodBlade')) {
        f.notify('LÂMINA JÁ ATIVA');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      payHealth(f, a.healthCost);
      f.anim.play('charge', { restart: true, duration: 0.5 });
      world.audio.play('bloodClaw');
      const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
      tl.add(0.3, () => {
        world.fx.burst(hand(), { count: 26, color: a.color, speed: 4, life: 0.4, size: 0.2 });
        const drip = world.fx.emitter({ rate: 35, follow: hand, particle: { color: a.color, speed: 0.4, spread: 0.15, life: 0.45, size: 0.14, gravity: 4 } });
        // a arma fica coberta de sangue (mesmo material da Arma de Sangue do Arthur)
        const uncoat = (a.props || ['knife', 'knifeThrow']).map((n) => f.rig.props[n]).filter((k) => k && k.traverse).map((k) => bloodCoat(k));
        f.addBuff({
          type: 'bloodBlade', name: 'ARMA DE SANGUE', time: a.duration, duration: a.duration,
          rangeBonus: a.rangeBonus, bleed: a.bleed,
          onEnd() { drip.stop(); uncoat.forEach((u) => u()); },
        });
      });
      tl.end(0.5);
      return seqFrom(tl);
    },
  },

  // Arthur — Ódio Incontrolável "Templo do Ódio": força sobre-humana temporária, mas não defende.
  hatredTemple: {
    start(f, a, world) {
      const target = a.target || f; // a assistência pode aplicar em outro lutador
      if (target.findBuff('hatred')) {
        f.notify('JÁ COM ÓDIO');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (a.healthCost) payHealth(f, a.healthCost);
      f.anim.play('gaze', { restart: true, duration: 0.5 });
      world.audio.play('bloodClaw');
      tl.add(0.3, () => {
        const head = () => target.rig.joints.hd.getWorldPosition(new THREE.Vector3());
        world.fx.burst(head(), { count: 24, color: a.color, speed: 3, life: 0.5, size: 0.18 });
        const veins = world.fx.emitter({ rate: 30, follow: () => target.chestPos(), particle: { color: a.color, speed: 0.8, up: 0.5, spread: 0.5, life: 0.4, size: 0.14 } });
        const prevTint = target.buffTint;
        target.buffTint = { color: a.color, base: 0.18 };
        target.addBuff({
          type: 'hatred', name: 'ÓDIO', time: a.duration, duration: a.duration,
          mult: a.damageMult, affects: ['melee'], speedMult: a.speedMult, noBlock: true,
          onEnd() { veins.stop(); if (target.buffTint && target.buffTint.color === a.color) target.buffTint = prevTint || null; },
        });
        target.notify('ÓDIO INCONTROLÁVEL', true);
      });
      tl.end(0.5);
      return seqFrom(tl);
    },
  },

  // Kian — Toque da Morte: toca o alvo e o envelhece rápido (ritual de MORTE): bate mais fraco,
  // fica mais lento e definha por alguns segundos. Curto alcance e lento para sair — dá para esquivar.
  deathTouch: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp && distXZ(f.pos, opp.pos) < 6) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('drain', { volume: 0.7 });
      const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
      const aura = world.fx.emitter({ rate: 40, follow: hand, particle: { color: 0x2a2632, kind: 'smoke', speed: 0.4, spread: 0.2, life: 0.5, size: 0.25 } });
      tl.each((t) => {
        // passo curto à frente durante a investida
        if (t > a.windup - 0.12 && t < a.windup + 0.06 && opp && distXZ(f.pos, opp.pos) > 1.1) {
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * 6;
          f.vel.z = F.z * 6;
        } else { f.vel.x = 0; f.vel.z = 0; }
      });
      tl.add(a.windup, () => {
        aura.stop();
        if (!opp || opp.state === 'ko' || opp.isInvulnerable()) return;
        if (distXZ(f.pos, opp.pos) - opp.radius > a.range) { f.notify('ERROU', true); return; }
        const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'morte', unblockable: true, knockback: 1.5, hitstun: 0.4, sound: 'drain', color: 0x8a8090, scale: 1.2 });
        if (typeof res !== 'number' || opp.state === 'ko') return;
        world.fx.burst(opp.chestPos(), { count: 30, color: 0x8a8090, kind: 'smoke', speed: 1.5, up: 0.6, life: 1, size: 0.5 });
        const old = opp.findBuff('aging');
        if (old) old.time = a.duration;
        else {
          let acc = 0;
          const prevTint = opp.buffTint;
          opp.buffTint = { color: 0x5a5660, base: 0.25 };
          opp.addBuff({
            type: 'aging', name: 'ENVELHECENDO', time: a.duration, duration: a.duration,
            mult: a.weaken, affects: ['melee', 'ranged', 'ability'], speedMult: a.slow,
            onTick(dt) {
              if (opp.state === 'ko') return;
              acc += a.dps * dt;
              if (acc >= 1) { const n = Math.floor(acc); acc -= n; opp.takeDamage(n); opp.flash = 0; }
              if (Math.random() < 0.15) world.fx.burst(opp.chestPos(), { count: 1, color: 0x8a8090, kind: 'smoke', speed: 0.3, up: 0.5, life: 0.6, size: 0.3 });
            },
            onEnd() { if (opp.buffTint && opp.buffTint.color === 0x5a5660) opp.buffTint = prevTint || null; },
          });
        }
        // marca permanente: o alvo fica FRACO até o fim do round (não acumula; sai no próximo round)
        if (a.roundWeaken && !opp.findBuff('deathMark')) {
          opp.addBuff({ type: 'deathMark', name: 'TOQUE DA MORTE', time: Infinity, duration: Infinity, mult: a.roundWeaken, affects: ['melee', 'ranged', 'ability', 'special'] });
          world.fx.ring(new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z), { color: 0x8a8090, radius: 2.4, life: 0.6 });
        }
        opp.notify('TOQUE DA MORTE', true);
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: () => aura.stop() });
    },
  },

  // Gal — Controle Mental: sigilo dourado sobre o alvo; por alguns segundos o corpo dele obedece ao contrário
  // (direções invertidas). À distância, em cone — esquivar na hora escapa.
  mindControl: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('fearGaze', { pitch: 1.3 });
      tl.add(a.windup, () => {
        if (!inCone(f, opp, a.range, a.arc) || opp.isInvulnerable()) { f.notify('ERROU', true); return; }
        const head = () => opp.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.45, 0));
        world.fx.ring(head(), { color: a.color, radius: 0.6, life: a.duration, vertical: false });
        const sig = world.fx.emitter({ rate: 30, follow: head, particle: { color: a.color, speed: 0.3, spread: 0.3, life: 0.4, size: 0.12 } });
        const old = opp.findBuff('mindControl');
        if (old) old.time = a.duration;
        else opp.addBuff({ type: 'mindControl', name: 'CONTROLADO', time: a.duration, duration: a.duration, invertMove: true, onEnd() { sig.stop(); } });
        opp.notify('CONTROLE MENTAL', true);
        world.onHit && world.onHit(f, opp, 0, { kind: 'ability', ability: a.id });
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl);
    },
  },

  // Gal — Teletransporte: some em faíscas douradas e surge atrás do alvo.
  sparkTeleport: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const spot = findSpotBehind(world.arena, { x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw }, { distance: a.distance, radius: f.radius });
      if (!spot) {
        f.notify('SEM ESPAÇO PARA TELEPORTAR');
        return null;
      }
      const tl = new Timeline();
      const sparks = (p) => {
        world.fx.burst(p, { count: 34, color: a.color, speed: 5, life: 0.45, size: 0.14, gravity: 3 });
        world.fx.flash(p, { color: a.color, size: 1.8, life: 0.12 });
      };
      f.vel.set(0, 0, 0);
      f.anim.play('vanish', { restart: true, duration: a.vanishTime });
      world.audio.play('blink', { pitch: 1.3 });
      f.invuln = a.vanishTime + 0.1;
      tl.add(a.vanishTime * 0.5, () => { sparks(f.chestPos()); f.setVisible(false); });
      tl.add(a.vanishTime, () => {
        f.pos.set(spot.x, Math.max(0, opp.pos.y), spot.z);
        f.yaw = yawTo(f.pos, opp.pos);
        f.setVisible(true);
        sparks(f.chestPos());
        if (!hasPassive(opp, 'precognition')) opp.surprised = a.surpriseTime ?? 0.35;
        f.anim.play('idle', { restart: true, blend: 0.05 });
      });
      tl.end(a.vanishTime + 0.12);
      return seqFrom(tl, { cancel: () => f.setVisible(true), cancelable: () => tl.time > a.vanishTime + 0.02, finish: () => {} });
    },
  },

  // Kian — Rejeitar Névoa: enfraquece drasticamente os rituais na área.
  rejectMist: {
    start(f, a, world) {
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('charge_fists', { restart: true, duration: 0.6 });
      world.audio.play('blink', { pitch: 0.7 });
      tl.add(0.3, () => {
        world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: a.color, radius: a.radius, life: 0.6 });
        world.fx.distort(f.chestPos(), { color: a.color, radius: a.radius * 0.6, life: 0.5 });
        // dissipa as zonas paranormais do inimigo que estiverem na área
        let cleared = 0;
        for (const z of world.zones) {
          if (z.owner === f || !z.alive) continue;
          const zc = z.center();
          if (Math.hypot(zc.x - f.pos.x, zc.z - f.pos.z) <= a.radius + (z.radius || 0)) {
            if (z.end) z.end();
            else z.alive = false;
            cleared++;
          }
        }
        const opp = f.opponent;
        if (opp && opp.state !== 'ko' && distXZ(opp.pos, f.pos) <= a.radius) {
          const old = opp.findBuff('ritualWeak');
          if (old) old.time = a.duration;
          else opp.addBuff({ type: 'ritualWeak', name: 'RITUAIS ENFRAQUECIDOS', time: a.duration, duration: a.duration, mult: a.weaken, affects: ['ability', 'ranged'] });
          opp.notify('RITUAIS ENFRAQUECIDOS', true);
        }
        if (cleared) f.notify('NÉVOA REJEITADA', true);
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },
});

// ------------------------------------------------------------------ DANTE (Morte)
Object.assign(ABILITY_TYPES, {
  // Embaralhar "Trinitá": vira vulto, troca de lugar e cria 3 CLONES (Dante + 3 = 4 em campo).
  // Cada clone tem IA própria, pode ser destruído e causa METADE do dano do Dante (combat/npcs.js).
  shadowClones: {
    start(f, a, world) {
      if (world.npcs.some((n) => n.isClone && n.owner === f && n.alive)) {
        f.notify('CÓPIAS JÁ EM CAMPO');
        return null;
      }
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('vanish', { restart: true, duration: 0.25 });
      world.audio.play('teleport');
      f.invuln = 0.35;
      const smoke = (p) => {
        world.fx.burst(new THREE.Vector3(p.x, 1.0, p.z), { count: 28, color: 0x0c0a0e, kind: 'smoke', speed: 2.5, life: 0.6, size: 0.8, grow: 1.2 });
        world.fx.burst(new THREE.Vector3(p.x, 1.1, p.z), { count: 12, color: f.def.energyColor, speed: 4, life: 0.35, size: 0.16 });
      };
      tl.add(0.12, () => {
        smoke(f.pos);
        const origin = f.pos.clone();
        // troca de lugar: passo para o lado em relação ao adversário
        const fwd = opp ? new THREE.Vector3().subVectors(opp.pos, f.pos).setY(0).normalize() : forwardFromYaw(f.yaw);
        const side = new THREE.Vector3(-fwd.z, 0, fwd.x).multiplyScalar(Math.random() < 0.5 ? 1 : -1);
        const others = opp ? [{ x: opp.pos.x, z: opp.pos.z, r: 0.6 }] : [];
        const spot = findFreeSpotNear(world.arena, f.pos.x + side.x * a.sidestep, f.pos.z + side.z * a.sidestep, { radius: f.radius, others });
        if (spot) f.pos.set(spot.x, 0, spot.z);
        if (opp) f.yaw = yawTo(f.pos, opp.pos);
        smoke(f.pos);
        for (let k = 0; k < a.clones; k++) {
          const cl = new DanteClone(f, world, k, a.duration);
          cl.pos.copy(k === 0 ? origin : f.pos).add(new THREE.Vector3((Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2));
          world.addNpc(cl);
          smoke(cl.pos);
        }
        f.notify('TRINITÁ', true);
      });
      tl.add(0.25, () => f.anim.play('idle', { restart: true, blend: 0.05 }));
      tl.end(0.3);
      return seqFrom(tl);
    },
  },
  // Tentáculos de Lodo: tentáculos pretos brotam do chão embaixo do inimigo, prendem e comprimem.
  lodoTentacles: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || distXZ(f.pos, opp.pos) > a.range) {
        f.notify('ALVO LONGE DEMAIS');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('concentrate', { restart: true, duration: a.castTime + 0.2 });
      world.audio.play('drain', { volume: 0.8 });
      const center = new THREE.Vector3(opp.pos.x, 0, opp.pos.z);
      world.fx.ring(new THREE.Vector3(center.x, 0.06, center.z), { color: 0x2a2632, radius: a.radius, life: a.castTime + 0.1 });
      world.fx.burst(new THREE.Vector3(center.x, 0.1, center.z), { count: 20, color: 0x0c0a0e, kind: 'smoke', speed: 1.5, up: 0.5, life: a.castTime, size: 0.6 });
      tl.add(a.castTime, () => {
        // geometria dos tentáculos (cilindros curvos que sobem e depois recolhem)
        const mat = new THREE.MeshStandardMaterial({ color: a.color, roughness: 0.25, metalness: 0.1 });
        const group = new THREE.Group();
        group.position.copy(center);
        const tentacles = [];
        for (let i = 0; i < 7; i++) {
          const ang = (i / 7) * Math.PI * 2 + Math.random() * 0.4;
          const r = a.radius * (0.35 + Math.random() * 0.55);
          const h = 1.4 + Math.random() * 1.0;
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-Math.sin(ang) * 0.25, h * 0.4, -Math.cos(ang) * 0.25),
            new THREE.Vector3(-Math.sin(ang) * r * 0.6, h * 0.8, -Math.cos(ang) * r * 0.6),
            new THREE.Vector3(-Math.sin(ang) * r * 0.9, h, -Math.cos(ang) * r * 0.9),
          ]);
          const geo = new THREE.TubeGeometry(curve, 12, 0.11, 6, false);
          const m = new THREE.Mesh(geo, mat);
          m.position.set(Math.sin(ang) * r, 0, Math.cos(ang) * r);
          m.scale.set(1, 0.01, 1);
          group.add(m);
          tentacles.push(m);
        }
        world.scene.add(group);
        world.audio.play('chainPull', { pitch: 0.6 });
        world.fx.burst(new THREE.Vector3(center.x, 0.3, center.z), { count: 30, color: 0x0c0a0e, kind: 'smoke', speed: 3, up: 1, life: 0.7, size: 0.7 });
        let t = 0;
        let hit = false;
        world.addTicker({
          update(dt) {
            t += dt;
            const up = Math.min(1, t / 0.18);
            const down = t > a.hold ? Math.max(0, 1 - (t - a.hold) / 0.3) : 1;
            for (const m of tentacles) m.scale.y = Math.max(0.01, up * down);
            if (!hit && t >= 0.12) {
              hit = true;
              if (opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(opp.pos, center) <= a.radius + opp.radius) {
                const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', knockback: 0, hitstun: 0.3, sound: 'clawHit', color: 0x6a6478, scale: 1.4, reaction: false });
                if (typeof res === 'number' && opp.state !== 'ko') {
                  opp.stun(a.stun, 'stagger');
                  opp.notify('PRESO NO LODO', true);
                }
              }
            }
            return t > a.hold + 0.3;
          },
          dispose() {
            world.scene.remove(group);
            for (const m of tentacles) m.geometry.dispose();
            mat.dispose();
          },
        });
      });
      // eco do Trinitá: um clone (o mais perto do alvo) repete com metade do dano e área menor
      const echo = world.npcs.filter((n) => n.isClone && n.owner === f && n.alive).sort((x, y) => distXZ(x.pos, opp.pos) - distXZ(y.pos, opp.pos))[0];
      if (echo) {
        tl.add(a.castTime + 0.35, () => {
          if (!echo.alive || opp.state === 'ko' || opp.isInvulnerable()) return;
          world.fx.burst(new THREE.Vector3(opp.pos.x, 0.3, opp.pos.z), { count: 20, color: 0x0c0a0e, kind: 'smoke', speed: 2, up: 1, life: 0.6, size: 0.6 });
          applyHit(world, f, opp, { damage: Math.round(a.damage * CLONE.damageMult), kind: 'ability', knockback: 0, hitstun: 0.25, sound: 'clawHit', color: 0x6a6478, scale: 1, reaction: false, element: 'morte' });
        });
      }
      tl.end(a.castTime + 0.25);
      return seqFrom(tl);
    },
  },

  // Cicatrização "Paradiso": névoa preta em espiral que cicatriza as feridas aos poucos.
  healOverTime: {
    start(f, a, world) {
      if (f.findBuff('paradiso')) {
        f.notify('JÁ CICATRIZANDO');
        return null;
      }
      if (f.health >= f.maxHealth) {
        f.notify('VIDA CHEIA');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('breath', { restart: true, duration: 0.6 });
      world.audio.play('smoke');
      tl.add(0.3, () => {
        let given = 0;
        let ang = 0;
        const spiral = world.fx.emitter({
          rate: 60,
          follow: () => {
            ang += 0.35;
            const r = 0.7 + Math.sin(ang * 0.3) * 0.2;
            return new THREE.Vector3(f.pos.x + Math.sin(ang) * r, f.pos.y + 0.3 + ((ang * 0.08) % 1.6), f.pos.z + Math.cos(ang) * r);
          },
          particle: { color: 0x141018, kind: 'smoke', speed: 0.2, up: 0.4, spread: 0.1, life: 0.6, size: 0.35 },
        });
        f.addBuff({
          type: 'paradiso', name: 'PARADISO', time: a.duration, duration: a.duration,
          onTick(dt) {
            if (f.state === 'ko') return;
            const n = Math.min(a.heal - given, (a.heal / a.duration) * dt);
            given += n;
            f.health = Math.min(f.maxHealth, f.health + n);
          },
          onEnd() { spiral.stop(); },
        });
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },
});

// ------------------------------------------------------------------ ERIN PARKER e AGUIAR
Object.assign(ABILITY_TYPES, {
  // Arremessa um objeto (granada, machado na corda...) usando um projétil configurado em `projectile`.
  throwProjectile: {
    start(f, a, world) {
      const tl = new Timeline();
      const opp = f.opponent;
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'throw_r', { restart: true, duration: a.windup + a.recovery });
      if (a.hideProp) f.rig.showProp(a.hideProp, false);
      if (a.showProp) f.rig.showProp(a.showProp, true);
      if (a.startSound) world.audio.play(a.startSound);
      const restore = () => {
        if (a.showProp) f.rig.showProp(a.showProp, false);
        if (a.hideProp) f.rig.showProp(a.hideProp, true);
      };
      tl.add(a.windup, () => {
        if (a.showProp) f.rig.showProp(a.showProp, false); // o objeto sai da mão
        const origin = f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
        origin.y = Math.max(origin.y, 1.3);
        const target = opp && opp.state !== 'ko' ? opp.chestPos() : origin.clone().add(forwardFromYaw(f.yaw).multiplyScalar(10));
        const dir = target.sub(origin).normalize();
        world.projectiles.spawn(f, { ...a.projectile, element: a.element }, origin, dir);
        world.audio.play(a.sound || 'knifeThrow');
      });
      tl.add(a.windup + a.recovery - 0.02, () => { if (a.hideProp) f.rig.showProp(a.hideProp, true); });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: restore });
    },
  },

  // Aguiar — coloca a máscara do Mutilador Noturno: mais dano, mais rápido, aguenta golpes e
  // cada golpe físico faz sangrar. Mas a intenção assassina toma conta: não consegue defender.
  maskForm: {
    start(f, a, world) {
      if (f.findBuff('mask')) {
        f.notify('JÁ MASCARADO');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('concentrate', { restart: true, duration: 0.75 });
      world.audio.play('maskOn');
      const face = () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.15, 0));
      tl.add(0.45, () => {
        if (f.rig.props.maskOn) f.rig.showProp('maskOn', true);
        world.fx.burst(face(), { count: 30, color: a.color, speed: 3, life: 0.6, size: 0.2, gravity: 5 });
        world.fx.flash(face(), { color: a.color, size: 1.6, life: 0.15 });
        world.cameraRig.shake(0.2, 0.2);
        const prevTint = f.buffTint;
        f.buffTint = { color: a.color, base: 0.1 };
        f.armorHits = (f.armorHits || 0) + (a.armor || 0);
        const aura = world.fx.emitter({ rate: 14, follow: () => f.chestPos(), particle: { color: 0x5a0008, kind: 'smoke', speed: 0.3, up: 0.6, spread: 0.4, life: 0.8, size: 0.5 } });
        f.addBuff({
          type: 'mask', name: 'MUTILADOR NOTURNO', time: a.duration, duration: a.duration,
          mult: a.damageMult, affects: ['melee', 'ranged'], speedMult: a.speedMult, noBlock: a.noBlock,
          meleeBleed: a.bleed,
          onEnd() {
            aura.stop();
            if (f.rig.props.maskOn) f.rig.showProp('maskOn', false);
            f.armorHits = 0;
            if (f.buffTint && f.buffTint.color === a.color) f.buffTint = prevTint || null;
          },
        });
        f.notify('MUTILADOR NOTURNO', true);
      });
      tl.end(0.75);
      return seqFrom(tl);
    },
  },

  // Aguiar — Armadilha de urso: arma no chão à frente; quem pisa fica preso (atordoado), toma dano e sangra.
  // Só uma armadilha por vez; some depois de um tempo.
  bearTrap: {
    start(f, a, world) {
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('sniper_kneel', { restart: true, duration: 0.55 });
      tl.add(0.35, () => {
        if (f.trap) f.trap.remove();
        const F = forwardFromYaw(f.yaw);
        const pos = new THREE.Vector3(f.pos.x + F.x * (a.distance ?? 1.4), 0.03, f.pos.z + F.z * (a.distance ?? 1.4));
        const mesh = new THREE.Group();
        const steel = new THREE.MeshStandardMaterial({ color: 0x6a6460, metalness: 0.8, roughness: 0.45 });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.04, 10), steel);
        mesh.add(base);
        const jaws = [];
        for (const s of [-1, 1]) {
          const jaw = new THREE.Group();
          const arc = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 4, 18, Math.PI), steel);
          arc.rotation.x = -Math.PI / 2;
          jaw.add(arc);
          for (let k = 1; k < 8; k++) {
            const ang = (k / 8) * Math.PI;
            const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 4), steel);
            tooth.position.set(Math.cos(ang) * 0.34, 0.04, Math.sin(ang) * 0.34 * -1);
            jaw.add(tooth);
          }
          jaw.rotation.order = 'YXZ';
          jaw.rotation.y = s > 0 ? 0 : Math.PI;
          mesh.add(jaw);
          jaws.push(jaw);
        }
        mesh.position.copy(pos);
        world.scene.add(mesh);
        world.audio.play('grenadePin', { volume: 0.6 });
        let t = 0;
        let sprung = false;
        let shut = 0;
        let done = false;
        const self = {
          update(dt) {
            t += dt;
            if (done) return true;
            const opp = f.opponent;
            if (sprung) {
              shut = Math.min(1.45, shut + dt * 20);
              for (const j of jaws) j.rotation.x = -shut; // as duas mandíbulas sobem e se fecham
              if (t > 1.2) done = true;
              return done;
            }
            if (t > (a.life ?? 14)) return (done = true);
            if (t < (a.armTime ?? 0.4) || !opp || opp.state === 'ko' || !opp.onGround || opp.isInvulnerable()) return false;
            if (Math.hypot(opp.pos.x - pos.x, opp.pos.z - pos.z) > (a.radius ?? 0.7)) return false;
            // fecha!
            sprung = true;
            t = 0;
            world.audio.play('trapSnap');
            world.fx.burst(new THREE.Vector3(pos.x, 0.3, pos.z), { count: 26, color: 0x9a0010, speed: 4, up: 1.5, life: 0.6, size: 0.2, gravity: 8 });
            const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', knockback: 0, hitstun: 0.3, reaction: false, sound: 'bladeHit', color: 0x9a0010, pos: new THREE.Vector3(pos.x, 0.4, pos.z), unblockable: true });
            if (typeof res === 'number' && opp.state !== 'ko') {
              opp.stun(a.stun ?? 1.2, 'stagger');
              opp.vel.set(0, 0, 0);
              if (a.bleed) opp.applyBleed(a.bleed, f);
              opp.notify('PRESO NA ARMADILHA', true);
            }
            return false;
          },
          dispose() { world.scene.remove(mesh); mesh.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); if (f.trap === self) f.trap = null; },
          remove() { done = true; },
        };
        f.trap = self;
        world.addTicker(self);
      });
      tl.end(0.55);
      return seqFrom(tl);
    },
  },

  // Aguiar — Predador de Sangue: memoriza o cheiro do alvo; por alguns segundos todos os ataques
  // contra ele ficam mais fortes e o rastro de sangue dele fica visível.
  predatorScent: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko') return null;
      if (f.findBuff('scent')) {
        f.notify('JÁ FAREJANDO');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('breath', { restart: true, duration: 0.55 });
      world.audio.play('heartbeat', { volume: 0.8 });
      tl.add(0.3, () => {
        const trail = world.fx.emitter({ rate: 10, follow: () => opp.chestPos(), particle: { color: 0xb0101c, speed: 0.2, spread: 0.3, life: 1.2, size: 0.16, gravity: 2 } });
        world.fx.ring(opp.chestPos(), { color: a.color, radius: 1.2, life: 0.5, vertical: true, yaw: f.yaw });
        f.addBuff({
          type: 'scent', name: 'PREDADOR DE SANGUE', time: a.duration, duration: a.duration,
          mult: a.damageMult, affects: ['melee', 'ranged', 'ability'], speedMult: a.speedMult,
          onEnd() { trail.stop(); },
        });
        opp.notify('FAREJADO', true);
      });
      tl.end(0.55);
      return seqFrom(tl);
    },
  },

  // Erin — Bênção Maldita: perto de eletricidade, a mão brilha em ciano e ela vê o futuro:
  // recupera todas as esquivas e os próximos ataques ficam mais fortes por alguns segundos.
  blessing: {
    start(f, a, world) {
      if (f.findBuff('blessing')) {
        f.notify('JÁ ABENÇOADA');
        return null;
      }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('concentrate', { restart: true, duration: 0.6 });
      world.audio.play('ritual', { volume: 0.6 });
      const hand = () => f.rig.sockets.handL.getWorldPosition(new THREE.Vector3());
      const sparks = world.fx.emitter({ rate: 40, follow: hand, particle: { color: a.color, speed: 1.4, spread: 0.5, life: 0.25, size: 0.1 } });
      tl.add(0.4, () => {
        for (let k = 0; k < 5; k++) world.fx.lightning(hand(), hand().add(new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2)), { color: a.color, life: 0.2 });
        world.fx.flash(f.chestPos(), { color: a.color, size: 2.2, life: 0.18 });
        f.dodges = Math.max(f.dodges, a.dodges ?? 4);
        f.addBuff({
          type: 'blessing', name: 'BÊNÇÃO MALDITA', time: a.duration, duration: a.duration,
          mult: a.damageMult, affects: ['melee', 'ranged', 'ability'],
          onEnd() { sparks.stop(); },
        });
        f.notify('BÊNÇÃO MALDITA', true);
      });
      tl.end(0.6);
      return seqFrom(tl, { cancel: () => sparks.stop() });
    },
  },
});

// ------------------------------------------------------------------ LABIRINTO e XANDE
Object.assign(ABILITY_TYPES, {
  // Labirinto — Labirinto Mental: prende a mente do alvo num labirinto; por alguns segundos ele anda numa
  // direção que muda sozinha. Com o capacete vira Labirinto Abissal (dura mais).
  mentalMaze: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('fearGaze', { pitch: 0.8 });
      tl.add(a.windup, () => {
        if (!inCone(f, opp, a.range, a.arc) || opp.isInvulnerable()) { f.notify('ERROU', true); return; }
        const abyss = !!f.findBuff('helmet');
        const dur = a.duration * (abyss ? a.helmetMult ?? 1.6 : 1);
        const head = () => opp.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.5, 0));
        const glyph = world.fx.emitter({ rate: 26, follow: head, particle: { color: a.color, speed: 0.3, spread: 0.35, life: 0.45, size: 0.12 } });
        world.fx.ring(new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z), { color: a.color, radius: 1.6, life: 0.6 });
        const old = opp.findBuff('maze');
        if (old) old.time = dur;
        else {
          let k = 0;
          const buff = {
            type: 'maze', name: abyss ? 'LABIRINTO ABISSAL' : 'LABIRINTO MENTAL', time: dur, duration: dur, mazeMove: true, mazeAngle: Math.PI * 0.75,
            pullTo: abyss ? f : null, // Abissal: a direção é escolhida pelo Labirinto (anda até ele)
            onTick(dt) {
              k += dt;
              // a cada meio segundo o "corredor" vira para outro lado
              if (k > 0.5) { k = 0; buff.mazeAngle = (Math.random() < 0.5 ? 1 : -1) * (Math.PI * (0.5 + Math.random() * 0.5)); }
            },
            onEnd() { glyph.stop(); },
          };
          opp.addBuff(buff);
        }
        opp.notify(abyss ? 'LABIRINTO ABISSAL' : 'LABIRINTO MENTAL', true);
        world.onHit && world.onHit(f, opp, 0, { kind: 'ability', ability: a.id });
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl);
    },
  },

  // Labirinto — Consumir Momento: marca o chão onde o alvo está com uma espiral; ao estalar os dedos,
  // a espiral estoura e destrói a área (dano de Morte). Dá para sair de cima se perceber a marca.
  consumeMoment: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko') return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('concentrate', { restart: true, duration: 0.5 });
      const helmet = !!f.findBuff('helmet');
      const R = a.radius * (helmet ? 1.35 : 1);
      const dmg = Math.round(a.damage * (helmet ? 1.3 : 1));
      const center = new THREE.Vector3(opp.pos.x, 0.05, opp.pos.z);
      // espiral no chão
      const spiral = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color: a.color, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide });
      for (let i = 0; i < 4; i++) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(R * (0.25 + i * 0.25) - 0.06, R * (0.25 + i * 0.25), 40, 1, i * 0.8, Math.PI * 1.6), mat);
        ring.rotation.x = -Math.PI / 2;
        spiral.add(ring);
      }
      spiral.position.copy(center);
      world.scene.add(spiral);
      let t = 0;
      world.addTicker({
        update(dt) {
          t += dt;
          mat.opacity = Math.min(0.85, t * 1.6);
          spiral.rotation.y += dt * (1 + t * 3);
          return t >= a.delay;
        },
        dispose() { world.scene.remove(spiral); mat.dispose(); },
      });
      // a explosão acontece depois: o Labirinto já fica livre para agir enquanto a espiral gira
      world.after(a.delay - 0.15, () => { if (f.state === 'idle') f.anim.play('point', { restart: true, duration: 0.3 }); world.audio.play('chainPull', { volume: 0.5 }); });
      world.after(a.delay, () => {
        world.fx.flash(center.clone().setY(1), { color: a.color, size: R * 2, life: 0.2 });
        world.fx.ring(center, { color: a.color, radius: R, life: 0.45 });
        world.fx.burst(center.clone().setY(0.6), { count: 50, color: 0x0c0a0e, kind: 'smoke', speed: 4, up: 1.5, life: 0.9, size: 0.8, grow: 1 });
        world.fx.burst(center.clone().setY(0.6), { count: 40, color: a.color, speed: 8, life: 0.5, size: 0.25 });
        world.audio.play('explosion', { volume: 0.8 });
        world.cameraRig.shake(0.3, 0.2);
        if (opp.state !== 'ko' && !opp.isInvulnerable() && Math.hypot(opp.pos.x - center.x, opp.pos.z - center.z) <= R + opp.radius) {
          applyHit(world, f, opp, { damage: dmg, kind: 'ability', element: 'morte', knockback: 3, launch: true, lowLaunch: true, color: a.color, sound: 'heavyPunch', scale: 1.5, pos: opp.chestPos() });
        }
      });
      tl.end(0.5);
      return seqFrom(tl);
    },
  },

  // Labirinto — Capacete do ???: põe o elmo do sorriso; por alguns segundos os rituais ficam mais fortes
  // (Rajada Caótica vira Tempestade Caótica, Labirinto Mental vira Abissal, Consumir Momento cresce).
  helmetForm: {
    start(f, a, world) {
      if (f.findBuff('helmet')) { f.notify('JÁ COM O CAPACETE'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('concentrate', { restart: true, duration: 0.7 });
      world.audio.play('maskOn', { pitch: 0.8 });
      tl.add(0.4, () => {
        const head = f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.15, 0));
        if (f.rig.props.helmetOn) f.rig.showProp('helmetOn', true);
        world.fx.burst(head, { count: 24, color: a.color, speed: 3, life: 0.5, size: 0.18 });
        world.fx.flash(head, { color: a.color, size: 1.6, life: 0.15 });
        const aura = world.fx.emitter({ rate: 16, follow: () => f.chestPos(), particle: { color: a.color, speed: 0.6, up: 0.6, spread: 0.6, life: 0.6, size: 0.14 } });
        f.addBuff({
          type: 'helmet', name: 'CAPACETE DO ???', time: a.duration, duration: a.duration,
          mult: a.damageMult, affects: ['ranged', 'ability'],
          onEnd() { aura.stop(); if (f.rig.props.helmetOn) f.rig.showProp('helmetOn', false); },
        });
        f.notify('???', true);
      });
      tl.end(0.7);
      return seqFrom(tl);
    },
  },

  // Kaiser — Dendrobium: raízes roxas e uma flor brotam do chão sob o alvo e o prendem (ritual de Energia)
  rootTrap: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko' || distXZ(f.pos, opp.pos) > a.range) { f.notify('ALVO LONGE DEMAIS'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: a.delay + 0.2 });
      world.audio.play('ritual', { volume: 0.5, pitch: 1.5 });
      const c = new THREE.Vector3(opp.pos.x, 0.05, opp.pos.z);
      world.fx.ring(c, { color: a.color, radius: a.radius, life: a.delay + 0.1 });
      tl.add(a.delay, () => {
        // raízes subindo em volta (efeito) + flor no centro
        const roots = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0x4a2a6a, roughness: 0.8, emissive: a.color, emissiveIntensity: 0.25 });
        for (let i = 0; i < 9; i++) {
          const ang = (i / 9) * Math.PI * 2;
          const root = new THREE.Mesh(new THREE.ConeGeometry(0.07, 1.4 + Math.random() * 0.6, 5), mat);
          root.position.set(Math.sin(ang) * 0.55, 0.6, Math.cos(ang) * 0.55);
          root.rotation.set(Math.cos(ang) * -0.5, 0, Math.sin(ang) * 0.5);
          roots.add(root);
        }
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: a.color }));
        flower.scale.set(1.3, 0.5, 1.3);
        flower.position.y = 1.9;
        roots.add(flower);
        roots.position.copy(c);
        roots.scale.setScalar(0.01);
        world.scene.add(roots);
        let t = 0;
        world.addTicker({
          update(dt) { t += dt; roots.scale.setScalar(Math.min(1, t * 6)); if (t > a.hold) roots.position.y -= dt * 4; return t > a.hold + 0.4; },
          dispose() { world.scene.remove(roots); roots.traverse((o) => o.geometry && o.geometry.dispose()); mat.dispose(); },
        });
        world.fx.burst(c.clone().setY(0.5), { count: 30, color: a.color, speed: 4, up: 2, life: 0.5, size: 0.18 });
        if (!opp.isInvulnerable() && Math.hypot(opp.pos.x - c.x, opp.pos.z - c.z) <= a.radius + opp.radius) {
          const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', knockback: 0, hitstun: 0.3, reaction: false, color: a.color, sound: 'clawHit' });
          if (typeof res === 'number' && opp.state !== 'ko') { opp.stun(a.hold, 'stagger'); opp.vel.set(0, 0, 0); opp.notify('PRESO PELAS RAÍZES', true); }
        }
      });
      tl.end(a.delay + 0.2);
      return seqFrom(tl);
    },
  },

  // Kaiser — Balas Amaldiçoadas: saca a Desert Eagle e dispara uma rajada de balas carregadas de Energia
  cursedShots: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'shoot_rifle', { restart: true, duration: a.windup + a.count * a.interval + 0.2 });
      const restore = () => {
        if (a.showProp) f.rig.showProp(a.showProp, false);
        if (a.hideProp) f.rig.showProp(a.hideProp, true);
      };
      if (a.showProp) f.rig.showProp(a.showProp, true);
      if (a.hideProp) f.rig.showProp(a.hideProp, false);
      tl.add(a.windup + a.count * a.interval + 0.18, restore);
      for (let i = 0; i < a.count; i++) {
        tl.add(a.windup + i * a.interval, () => {
          const from = f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
          from.y = Math.max(from.y, 1.2);
          const target = f.opponent && f.opponent.state !== 'ko' ? f.opponent.chestPos() : from.clone().add(forwardFromYaw(f.yaw).multiplyScalar(10));
          const dir = target.sub(from).normalize();
          // leque: cada tiro sai um pouco aberto para os lados (spread em graus)
          if (a.spread) dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), ((i - (a.count - 1) / 2) / Math.max(1, a.count - 1)) * a.spread * DEG);
          world.projectiles.spawn(f, { ...a.projectile, volley: (f.cursedVolley = (f.cursedVolley || 0) + (i === 0 ? 1 : 0)) + 10000 }, from, dir);
          world.fx.flash(from, { color: a.projectile.color, size: 1, life: 0.08 });
          world.audio.play(a.shotSound || 'sniper', { volume: 0.5, pitch: 1.4 });
        });
      }
      tl.end(a.windup + a.count * a.interval + 0.2);
      return seqFrom(tl, { cancel: restore });
    },
  },

  // Golpe giratório em volta do corpo (Gal — Corrente Giratória): vários acertos numa área, o último lança
  sweepStrike: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      const total = a.windup + a.hits * a.interval + a.recovery;
      f.anim.play(a.anim || 'spin_kick', { restart: true, duration: total });
      world.audio.play(a.startSound || 'swing', { volume: 0.8 });
      const parts = splitDamage(a.damage, Array(a.hits).fill(1));
      for (let i = 0; i < a.hits; i++) {
        tl.add(a.windup + i * a.interval, () => {
          const c = new THREE.Vector3(f.pos.x, f.pos.y + 1.1, f.pos.z);
          world.fx.slash(c, f.yaw + i * 2.1, { color: a.color, radius: a.radius, arc: 6.2, life: 0.25, width: 0.4, roll: 0.15 * (i % 2 ? 1 : -1) });
          world.audio.play(a.hitSound ? 'swing' : 'blade', { volume: 0.5 });
          if (!opp || opp.state === 'ko' || opp.isInvulnerable()) return;
          if (distXZ(f.pos, opp.pos) - opp.radius > a.radius || Math.abs(opp.pos.y - f.pos.y) > 2) return;
          const last = i === a.hits - 1;
          applyHit(world, f, opp, {
            damage: parts[i], kind: 'ability', element: a.element, knockback: last ? a.knockback : 0.6, hitstun: last ? 0.6 : 0.35,
            launch: last && !!a.launch, lowLaunch: last && !!a.launch, sound: a.hitSound || 'bladeHit', color: a.color, scale: last ? 1.6 : 0.8,
            dir: new THREE.Vector3(opp.pos.x - f.pos.x, 0, opp.pos.z - f.pos.z).normalize(),
          });
        });
      }
      tl.end(total);
      return seqFrom(tl);
    },
  },

  // Investida com corte (Joui — Corte das Sombras): avança rápido em linha reta e corta o primeiro que encontrar
  dashStrike: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      const dashTime = a.distance / a.speed;
      f.anim.play(a.anim || 'dash_slash', { restart: true, duration: a.windup + dashTime + a.recovery });
      world.audio.play(a.startSound || 'blink', { volume: 0.7 });
      const trail = world.fx.emitter({ rate: 90, follow: () => f.chestPos(), particle: { color: a.color, kind: a.trailKind || 'smoke', speed: 0.5, spread: 0.3, life: 0.35, size: 0.35 } });
      trail.visible = false;
      let hit = false;
      let done = false;
      tl.each((t) => {
        const dashing = t >= a.windup && t < a.windup + dashTime && !done;
        trail.visible = dashing;
        if (!dashing) { f.vel.x = 0; f.vel.z = 0; return; }
        const F = forwardFromYaw(f.yaw);
        f.vel.x = F.x * a.speed;
        f.vel.z = F.z * a.speed;
        f.invuln = Math.max(f.invuln, a.iframes ? 0.05 : 0);
        if (!hit && opp && opp.state !== 'ko' && distXZ(f.pos, opp.pos) - opp.radius <= a.range && Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos))) < 1.2) {
          hit = true;
          done = true;
          world.fx.slash(f.chestPos(), f.yaw, { color: a.color, radius: 2.2, arc: 2.6, life: 0.3, width: 0.45, roll: 0.5 });
          if (!opp.isInvulnerable()) {
            applyHit(world, f, opp, {
              damage: a.damage, kind: 'ability', element: a.element, knockback: a.knockback, hitstun: a.hitstun ?? 0.6,
              launch: !!a.launch, lowLaunch: !!a.launch, guardCrush: a.guardCrush, sound: a.hitSound || 'bladeHit', color: a.color, scale: 1.6, dir: forwardFromYaw(f.yaw),
            });
          }
        }
      });
      tl.add(a.windup + dashTime, () => { trail.stop(); if (!hit) world.fx.slash(f.chestPos(), f.yaw, { color: a.color, radius: 2, arc: 2.4, life: 0.25, width: 0.35 }); });
      tl.end(a.windup + dashTime + a.recovery);
      return seqFrom(tl, { cancel: () => trail.stop() });
    },
  },

  // ------------------------------------------------------------------ LÍRIO
  // GOLPE PESADO: prepara → concentra → desloca o corpo → golpe → impacto → recupera. Difícil de acertar (preparação
  // visível e alcance curto), muito recompensador quando acerta. Resiste a UM golpe pequeno depois que já concentrou.
  heavyBlow: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp && distXZ(f.pos, opp.pos) < 8) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'hammer_heavy', { restart: true, duration: a.duration });
      world.audio.play('carga', { volume: 0.6, pitch: 0.7 });
      const now = world.time;
      f.superArmor = { from: now + a.armorFrom, to: now + a.impact, max: a.armorMax ?? 45, hits: a.armorHits ?? 1 };
      let hit = false;
      tl.add(a.armorFrom, () => {
        // concentração: pés fincados levantam poeira
        world.fx.play('FX_DUST', f.pos, { scale: 0.6 });
        world.audio.play('heavyPunch', { volume: 0.3, pitch: 0.5 });
      });
      tl.each((t) => {
        // deslocamento do corpo à frente logo antes do golpe
        if (t > a.impact - 0.2 && t < a.impact && !(opp && distXZ(f.pos, opp.pos) < 1.3)) {
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * a.step;
          f.vel.z = F.z * a.step;
        } else { f.vel.x = 0; f.vel.z = 0; }
      });
      tl.add(a.impact, () => {
        const F = forwardFromYaw(f.yaw);
        const at = new THREE.Vector3(f.pos.x + F.x * a.range * 0.7, 0, f.pos.z + F.z * a.range * 0.7);
        world.fx.play('FX_GROUND_SMASH', at, { scale: 1.2 });
        world.cameraRig.shake(0.55, 0.35);
        world.audio.play('heavyPunch', { volume: 1.1, pitch: 0.6 });
        if (!opp || opp.state === 'ko') return;
        const d = distXZ(f.pos, opp.pos) - opp.radius;
        const inArc = Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos))) <= (a.arc * DEG) / 2;
        if (d <= a.range && inArc && Math.abs(opp.pos.y - f.pos.y) < 1.6) {
          hit = true;
          applyHit(world, f, opp, {
            damage: a.damage, kind: 'ability', element: a.element, knockback: a.knockback, hitstun: 1.0,
            launch: true, lowLaunch: true, guardCrush: a.guardCrush, sound: 'heavyPunch', scale: 2.2, hitstop: 0.14,
            dir: F.clone(), strike: { impactFx: 'smash' },
          });
        }
      });
      // errou: fica cravado no chão por mais tempo (a recuperação anda devagar) — abertura para o adversário
      tl.add(a.impact + 0.02, () => { if (!hit) f.anim.speed = a.duration / (a.duration + (a.whiffRecovery || 0)); });
      tl.end(a.duration);
      let t = 0;
      return {
        update(dt) {
          t += dt;
          tl.update(dt);
          const done = t >= a.duration + (hit ? 0 : a.whiffRecovery || 0);
          if (done) f.anim.speed = 1;
          return done;
        },
        cancel: () => { f.anim.speed = 1; },
      };
    },
  },

  // CAI DENTRO: Lírio chama a atenção do inimigo e assume o confronto. Longe: avança correndo (pesado, sem
  // teletransporte) e dá uma ombrada; perto: só o grito. O inimigo fica PROVOCADO (só consegue atacar no corpo a
  // corpo por alguns segundos) e o Lírio se prepara para apanhar (recebe menos dano).
  caiDentro: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko') return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      let phase = distXZ(f.pos, opp.pos) > a.near ? 'run' : 'roar';
      let t = 0;
      let roarAt = 0;
      const dust = world.fx.emitter({ rate: 30, follow: () => new THREE.Vector3(f.pos.x, 0.2, f.pos.z), particle: { color: 0x9a8a72, kind: 'smoke', speed: 0.8, up: 0.4, life: 0.5, size: 0.45, grow: 1 } });
      dust.visible = phase === 'run';
      if (phase === 'run') {
        f.anim.play('dash_heavy', { restart: true });
        f.superArmor = { from: world.time, to: world.time + a.runTime + 0.3, max: 40, hits: 1 };
        world.audio.play('jump', { volume: 0.6, pitch: 0.7 });
      }
      const roar = () => {
        phase = 'roar';
        roarAt = t;
        dust.visible = false;
        f.vel.set(0, 0, 0);
        f.yaw = yawTo(f.pos, opp.pos);
        f.anim.play('taunt_roar', { restart: true, duration: a.roarTime });
        world.audio.play('fearGaze', { volume: 0.5, pitch: 0.55 });
        world.audio.play('heavyPunch', { volume: 0.4, pitch: 0.5 });
        world.fx.play('FX_DUST', f.pos, { scale: 1.3 });
        world.fx.ring(f.chestPos(), { color: 0xe8e0c8, radius: 2.6, life: 0.4, vertical: true, yaw: f.yaw });
        world.cameraRig.shake(0.2, 0.25);
        if (opp.state !== 'ko' && distXZ(f.pos, opp.pos) <= a.provokeRange) {
          const old = opp.findBuff('provoked');
          if (old) old.time = a.duration;
          else opp.addBuff({ type: 'provoked', name: 'PROVOCADO (CAI DENTRO)', time: a.duration, duration: a.duration, by: f });
          opp.notify('PROVOCADO!', true);
        }
        const mine = f.findBuff('caiDentro');
        if (mine) mine.time = a.duration;
        else f.addBuff({ type: 'caiDentro', name: 'CAI DENTRO', time: a.duration, duration: a.duration, takenMult: a.takenMult });
        f.notify('CAI DENTRO!', true);
      };
      if (phase === 'roar') roar();
      return {
        update(dt) {
          t += dt;
          if (phase === 'run') {
            f.yaw = yawTo(f.pos, opp.pos);
            const F = forwardFromYaw(f.yaw);
            f.vel.x = F.x * a.runSpeed;
            f.vel.z = F.z * a.runSpeed;
            const d = distXZ(f.pos, opp.pos);
            if (d <= 1.5 || t >= a.runTime) {
              f.vel.set(0, 0, 0);
              if (d <= 1.9 && !opp.isInvulnerable()) {
                // ombrada: empurra e desequilibra, abrindo espaço
                f.anim.play('shoulder_charge', { restart: true, duration: 0.4 });
                applyHit(world, f, opp, { damage: a.bashDamage, kind: 'ability', knockback: 4.5, hitstun: 0.5, stun: 0.3, sound: 'heavyPunch', scale: 1.4, dir: F.clone() });
                world.fx.play('FX_DUST', opp.pos, { scale: 0.9 });
                phase = 'bash';
                roarAt = t;
              } else roar();
            }
            return false;
          }
          if (phase === 'bash') {
            if (t - roarAt >= 0.35) roar();
            return false;
          }
          if (t - roarAt >= a.roarTime) { dust.stop(); return true; }
          return false;
        },
        cancel: () => dust.stop(),
      };
    },
  },

  // AMARRAS DE SANGUE "Magras": corda de tripas entrelaçadas que estala até o alvo e o prende por um instante.
  // Ritual de Sangue (mais forte contra Conhecimento pelo ciclo dos elementos).
  bloodBind: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('throw_r', { restart: true, duration: a.windup + 0.35 });
      world.audio.play('chainThrow', { volume: 0.7, pitch: 0.8 });
      const hand = () => f.rig.sockets.handL.getWorldPosition(new THREE.Vector3());
      let tip = null;
      let rope = null;
      let caught = false;
      tl.add(a.windup, () => {
        const connected = opp && opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(f.pos, opp.pos) <= a.range
          && Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos))) <= (a.arc * DEG) / 2;
        // errou: a ponta vai até o alcance (ou até bater num obstáculo no caminho)
        let end = connected ? opp.chestPos() : null;
        if (!end) {
          const from = hand();
          const fwd = forwardFromYaw(f.yaw);
          end = from.clone();
          for (let d = 0.5; d <= a.range; d += 0.5) {
            const pnt = from.clone().addScaledVector(fwd, d);
            if (world.arena.blocksPoint(pnt, 0.1)) break;
            end = pnt;
          }
        }
        tip = end.clone();
        const toFn = () => (caught && opp.state !== 'ko' ? opp.chestPos() : tip);
        if (a.gut) {
          // MAGRAS: duas cordas de tripas carnudas trançadas uma na outra
          rope = [0, Math.PI].map((phase) => world.fx.chain(hand, toFn, { rope: true, links: 44, thick: 0.034, twist: 0.035, turns: 7, phase, color: 0xa8343c, glow: 0x4a0008, sag: 0.12 }));
        } else rope = [world.fx.chain(hand, toFn, { rope: true, links: 26, thick: a.ropeThick, color: a.ropeColor ?? 0x8a1018, glow: a.ropeGlow ?? 0x3a0004, sag: 0.08 })];
        const stopRope = () => { if (rope) { rope.forEach((x) => x.alive && x.stop()); rope = null; } };
        if (!connected) {
          // a corda estica até a ponta e VOLTA para a mão; só então some (não fica presa no cenário)
          const out = 0.14;
          const back = 0.3;
          let t = 0;
          world.addTicker({
            update(dt) {
              t += dt;
              const h = hand();
              if (t < out) tip.lerpVectors(h, end, t / out);
              else tip.lerpVectors(end, h, Math.min(1, (t - out) / back));
              return t >= out + back;
            },
            dispose: stopRope,
          });
          return;
        }
        const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: a.element || 'sangue', knockback: 0, hitstun: 0.3, reaction: false, sound: 'chainPull', color: a.ropeColor ?? 0xc01828, scale: 1 });
        if (typeof res === 'number' && opp.state !== 'ko') {
          caught = true;
          // feitas para prender criaturas de Conhecimento: seguram mais tempo quem é de Conhecimento
          const hold = a.hold * (opp.def.element === 'conhecimento' ? (a.vsConhecimento || 1) : 1);
          opp.stun(hold, 'stagger');
          if (a.gut) wrapCoils(world, opp, hold, rope);
          else world.after(hold * 0.85, stopRope);
          opp.vel.set(0, 0, 0);
          opp.notify(a.caughtMsg || 'PRESO PELAS AMARRAS', true);
          world.fx.burst(opp.chestPos(), { count: 18, color: 0x9a0010, speed: 3, life: 0.5, size: 0.18, gravity: 8 });
        } else stopRope(); // acertou mas não prendeu (defendeu, por exemplo): a corda some
      });
      tl.end(a.windup + 0.35);
      // interrompida antes do arremesso: não sobra corda (depois dele, quem cuida é o ticker/temporizador acima)
      return seqFrom(tl, { cancel: () => { if (rope && !caught && tl.time < a.windup) rope.forEach((x) => x.stop()); } });
    },
  },

  // PROTEÇÃO PESADA: veste o capacete azul e se fecha: recebe menos dano e aguenta alguns golpes sem recuar,
  // mas fica um pouco mais lento.
  heavyProtection: {
    start(f, a, world) {
      const label = a.label || a.name.toUpperCase();
      if (f.findBuff('heavyProtection')) { f.notify(label + ' JÁ ATIVA'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play(f.def.anims.block || 'block', { restart: true, duration: 0.5 });
      world.audio.play('blockHit', { volume: 0.8, pitch: 0.7 });
      tl.add(0.3, () => {
        if (a.prop) f.rig.showProp(a.prop, true);
        f.armorHits = (f.armorHits || 0) + a.armor;
        world.fx.play('FX_DUST', f.pos, { scale: 0.8 });
        f.addBuff({
          type: 'heavyProtection', name: label, time: a.duration, duration: a.duration, takenMult: a.takenMult, speedMult: a.speedMult, bloodArmor: !!a.bloodArmor,
          ...bloodArmBuff(a),
          onEnd() { if (a.prop) f.rig.showProp(a.prop, false); f.armorHits = Math.max(0, (f.armorHits || 0) - a.armor); },
        });
        f.notify(label, true);
      });
      tl.end(0.5);
      return seqFrom(tl);
    },
  },

  // ------------------------------------------------------------------ DEUS DA MORTE
  // ESPIRAL DESCENDENTE: agarra a vítima e a prende no tempo — ela envelhece rápido (dano contínuo, fica lenta e perde
  // sanidade). Não dá para defender; esquivar escapa.
  timelockGrab: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('grab', { restart: true, duration: a.windup + 0.2 });
      world.audio.play('drain', { volume: 0.7, pitch: 0.7 });
      let caught = false;
      tl.each((t) => {
        if (t < a.windup && opp && distXZ(f.pos, opp.pos) > a.range * 0.7) {
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * a.lunge;
          f.vel.z = F.z * a.lunge;
        } else { f.vel.x = 0; f.vel.z = 0; }
      });
      tl.add(a.windup, () => {
        if (!opp || opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) - opp.radius > a.range) { f.notify('ERROU', true); return; }
        caught = true;
        opp.stun(a.hold, 'stagger');
        opp.vel.set(0, 0, 0);
        opp.notify('ESPIRAL DESCENDENTE', true);
        world.audio.play('fearGaze', { volume: 0.8, pitch: 0.5 });
        for (let i = 0; i < 5; i++) world.after(i * (a.hold / 5), () => world.fx.ring(opp.chestPos(), { color: 0x6a6670, radius: 1.8 - i * 0.3, life: 0.4, vertical: true, yaw: f.yaw }));
      });
      const ticks = 6;
      for (let i = 1; i <= ticks; i++) {
        tl.add(a.windup + (a.hold * i) / ticks, () => {
          if (!caught || opp.state === 'ko') return;
          applyHit(world, f, opp, { damage: a.damage / ticks, kind: 'ability', element: 'morte', reaction: false, ignoreInvuln: true, unblockable: true, sound: 'drain', color: 0x6a6670, scale: 0.7 });
          opp.drainEnergy && opp.drainEnergy(a.energyDrain / ticks);
          world.fx.burst(opp.chestPos(), { count: 4, color: 0x8a8090, kind: 'smoke', speed: 0.6, up: 0.6, life: 0.8, size: 0.4 });
        });
      }
      tl.add(a.windup + a.hold, () => {
        if (!caught || opp.state === 'ko') return;
        if (!opp.findBuff('aging')) opp.addBuff({ type: 'aging', name: 'ENVELHECIDO', time: a.slowTime, duration: a.slowTime, speedMult: a.slow });
        opp.react({ dir: forwardFromYaw(f.yaw), knockback: 5, hitstun: 0.6, launch: true, lowLaunch: true });
      });
      tl.end(a.windup + a.hold + 0.2);
      return seqFrom(tl);
    },
  },

  // CONTROLAR MORTOS: o Lodo do chão obedece — mãos de Lodo brotam sob o inimigo, uma atrás da outra (a última lança)
  deadHands: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('cast_up', { restart: true, duration: a.windup + 0.4 });
      world.audio.play('drain', { volume: 0.6, pitch: 0.8 });
      for (let i = 0; i < a.count; i++) {
        const t0 = a.windup + i * a.interval;
        let at = null;
        tl.add(t0 - 0.35, () => {
          // marca onde vai brotar (segue o inimigo até o aviso)
          at = opp ? new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z) : f.pos.clone();
          world.fx.ring(at, { color: 0x2a2632, radius: a.radius, life: 0.4 });
        });
        tl.add(t0, () => {
          world.fx.burst(new THREE.Vector3(at.x, 0.4, at.z), { count: 30, color: 0x0a080c, kind: 'smoke', speed: 2, up: 4, life: 0.8, size: 0.7, grow: 1 });
          const hands = new THREE.Group();
          const mat = new THREE.MeshToonMaterial({ color: 0x141216 });
          for (let k = 0; k < 5; k++) {
            const ang = (k / 5) * Math.PI * 2;
            const fing = new THREE.Mesh(new THREE.ConeGeometry(0.09, 1.3 + Math.random() * 0.5, 5), mat);
            fing.position.set(Math.sin(ang) * 0.35, 0.6, Math.cos(ang) * 0.35);
            fing.rotation.set(Math.cos(ang) * 0.4, 0, -Math.sin(ang) * 0.4);
            hands.add(fing);
          }
          hands.position.copy(at);
          hands.scale.setScalar(0.01);
          world.scene.add(hands);
          let t = 0;
          world.addTicker({
            update(dt) { t += dt; hands.scale.setScalar(Math.min(1, t * 8)); if (t > 0.5) hands.position.y -= dt * 4; return t > 0.9; },
            dispose() { world.scene.remove(hands); hands.traverse((o) => o.geometry && o.geometry.dispose()); mat.dispose(); },
          });
          const last = i === a.count - 1;
          if (opp && opp.state !== 'ko' && !opp.isInvulnerable() && Math.hypot(opp.pos.x - at.x, opp.pos.z - at.z) <= a.radius + opp.radius) {
            applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'morte', knockback: last ? 3 : 0.5, hitstun: 0.5, launch: last, lowLaunch: last, sound: 'clawHit', color: 0x6a6670, scale: 1.2, dir: new THREE.Vector3(0, 0, 0).subVectors(opp.pos, f.pos).setY(0).normalize() });
          }
        });
      }
      tl.end(a.windup + a.count * a.interval + 0.2);
      return seqFrom(tl);
    },
  },

  // SENHOR DO TEMPO: distorce o tempo do inimigo — ele fica muito lento por alguns segundos
  timeWarp: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('concentrate', { restart: true, duration: 0.6 });
      world.audio.play('fearGaze', { volume: 0.6, pitch: 0.4 });
      tl.add(0.4, () => {
        world.fx.distort(f.chestPos(), { color: 0x6a6670, radius: 4, life: 0.6 });
        if (!opp || opp.state === 'ko' || distXZ(f.pos, opp.pos) > a.range) { f.notify('LONGE DEMAIS', true); return; }
        const old = opp.findBuff('timeWarp');
        if (old) old.time = a.duration;
        else opp.addBuff({ type: 'timeWarp', name: 'TEMPO DISTORCIDO', time: a.duration, duration: a.duration, speedMult: a.slow });
        for (let i = 0; i < 4; i++) world.after(i * 0.12, () => world.fx.ring(opp.chestPos(), { color: 0x6a6670, radius: 2.2 - i * 0.4, life: 0.5, vertical: true, yaw: f.yaw }));
        opp.notify('TEMPO DISTORCIDO', true);
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },

  // ------------------------------------------------------------------ JUAN
  // VÍNCULO DE SANGUE: marca o próprio corpo e o do alvo com dois símbolos — por alguns segundos, parte do dano que o
  // Juan recebe é replicada no alvo (ver damage.js)
  bloodLink: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: a.windup + 0.3 });
      world.audio.play('descarnar', { volume: 0.6, pitch: 1.2 });
      tl.add(a.windup, () => {
        world.fx.ring(f.chestPos(), { color: 0xc01828, radius: 0.9, life: 0.5, vertical: true, yaw: f.yaw });
        if (!inCone(f, opp, a.range, a.arc) || opp.isInvulnerable()) { f.notify('ERROU O SÍMBOLO', true); return; }
        world.fx.ring(opp.chestPos(), { color: 0xc01828, radius: 0.9, life: 0.5, vertical: true, yaw: f.yaw + Math.PI });
        world.fx.tracer(f.chestPos(), opp.chestPos(), { color: 0xc01828, life: 0.3, width: 0.05 });
        const old = f.findBuff('bloodLink');
        if (old) { old.time = a.duration; old.target = opp; }
        else f.addBuff({ type: 'bloodLink', name: 'VÍNCULO DE SANGUE', time: a.duration, duration: a.duration, target: opp, ratio: a.ratio });
        opp.notify('VÍNCULO DE SANGUE', true);
      });
      tl.end(a.windup + 0.3);
      return seqFrom(tl);
    },
  },

  // PERTURBAÇÃO DISCENTE: uma ordem simples a quem está perto — "PARE!" (paralisa), "VENHA!" (puxa) ou "AJOELHE!" (derruba)
  command: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: a.windup + 0.3 });
      world.audio.play('fearGaze', { volume: 0.6, pitch: 1.1 });
      tl.add(a.windup, () => {
        if (!opp || opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) > a.range) { f.notify('NINGUÉM OUVIU', true); return; }
        const orders = ['PARE!', 'VENHA!', 'AJOELHE!'];
        const o = orders[Math.floor(Math.random() * orders.length)];
        world.fx.ring(opp.chestPos(), { color: 0xc01828, radius: 1.4, life: 0.4, vertical: true, yaw: f.yaw });
        f.notify(o, true);
        opp.notify(o, true);
        if (o === 'PARE!') opp.stun(a.stun, 'stagger');
        else if (o === 'VENHA!') {
          const F = forwardFromYaw(f.yaw);
          opp.pullTo(new THREE.Vector3(f.pos.x + F.x * 1.4, opp.pos.y, f.pos.z + F.z * 1.4), { time: 0.25, after: 0.4 });
        } else applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'sangue', knockback: 1, hitstun: 0.8, launch: true, lowLaunch: true, sound: 'heavyPunch', color: 0xc01828, scale: 1 });
      });
      tl.end(a.windup + 0.3);
      return seqFrom(tl);
    },
  },

  // ------------------------------------------------------------------ KEMI / A FANTASMA
  // DISPARO DA MORTE: Kemi ajoelha e o tempo desacelera em volta do alvo (fica lento) — ela mira com calma e dispara um
  // tiro certeiro de Morte (a.projectile; com execute, é o Sniper da Morte: a espiral termina quem já está morrendo)
  deathShot: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('sniper_kneel', { restart: true, duration: a.windup });
      if (a.showProp) f.rig.showProp(a.showProp, true);
      if (a.hideProp) f.rig.showProp(a.hideProp, false);
      world.audio.play('fearGaze', { volume: 0.5, pitch: 0.5 });
      tl.add(0.2, () => {
        if (!opp || opp.state === 'ko') return;
        world.fx.distort(opp.chestPos(), { color: 0xa7a3ad, radius: 3, life: 0.6 });
        const old = opp.findBuff('deathAim');
        if (old) old.time = a.slowTime;
        else opp.addBuff({ type: 'deathAim', name: 'TEMPO LENTO', time: a.slowTime, duration: a.slowTime, speedMult: a.slow });
        for (let i = 0; i < 3; i++) world.after(i * 0.12, () => world.fx.ring(opp.chestPos(), { color: 0xa7a3ad, radius: 1.8 - i * 0.4, life: 0.5, vertical: true, yaw: f.yaw }));
      });
      // mira a laser enquanto o tempo está lento
      for (let t = 0.25; t < a.windup; t += 0.06) {
        tl.add(t, () => {
          if (!opp || opp.state === 'ko') return;
          f.yaw = yawTo(f.pos, opp.pos);
          const from = f.rig.muzzle ? f.rig.muzzle.getWorldPosition(new THREE.Vector3()) : f.chestPos();
          world.fx.tracer(from, opp.chestPos(), { color: 0xd8d4dc, life: 0.05, width: 0.015 });
        });
      }
      tl.add(a.windup, () => {
        const from = f.rig.muzzle ? f.rig.muzzle.getWorldPosition(new THREE.Vector3()) : f.chestPos();
        const target = opp && opp.state !== 'ko' ? opp.chestPos() : from.clone().add(forwardFromYaw(f.yaw).multiplyScalar(10));
        world.projectiles.spawn(f, { ...a.projectile, element: a.element }, from, target.sub(from).normalize());
        world.fx.flash(from, { color: 0xd8d4dc, size: 1.4, life: 0.1 });
        world.audio.play('sniper');
        f.anim.play('sniper_fire', { restart: true, duration: a.recovery + 0.1 });
      });
      const restore = () => {
        if (a.showProp) f.rig.showProp(a.showProp, false);
        if (a.hideProp) f.rig.showProp(a.hideProp, true);
      };
      tl.add(a.windup + a.recovery - 0.02, restore);
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: restore });
    },
  },

  // PERITA / ANALÍTICA: estuda o alvo e acha os pontos fracos — por a.duration ele recebe a.takenMult de dano
  analyze: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('turn_look', { restart: true, duration: 0.5 });
      tl.add(0.3, () => {
        if (!opp || opp.state === 'ko' || distXZ(f.pos, opp.pos) > a.range) { f.notify('LONGE DEMAIS', true); return; }
        const type = a.buffType || 'analyzed';
        const old = opp.findBuff(type);
        if (old) old.time = a.duration;
        else opp.addBuff({ type, name: a.label || 'ANALISADO', time: a.duration, duration: a.duration, takenMult: a.takenMult, takenKinds: a.takenKinds });
        world.fx.ring(opp.chestPos(), { color: a.color ?? 0xe8c070, radius: 0.9, life: 0.5, vertical: true, yaw: f.yaw });
        world.fx.ring(new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z), { color: a.color ?? 0xe8c070, radius: 1.2, life: 0.6 });
        opp.notify(a.label || 'ANALISADO', true);
      });
      tl.end(0.5);
      return seqFrom(tl);
    },
  },

  // ------------------------------------------------------------------ O DIABO (Portador do Trono)
  // SENHOR DO SANGUE: abre poças de sangue perto do adversário e delas sobem Zumbis de Sangue que lutam pelo Diabo.
  // A horda é sorteada: 1, 2 ou 3 zumbis FRACOS, ou 2 fracos + 1 FORTE (a.hordes). Uma horda por vez.
  summonBlood: {
    start(f, a, world) {
      if (world.npcs.some((n) => n.alive && n.owner === f && n instanceof BloodZombie)) { f.notify('A HORDA JÁ ESTÁ EM CAMPO'); return null; }
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('cast_up', { restart: true, duration: 0.7 });
      world.audio.play('ritual', { volume: 0.7, pitch: 0.7 });
      const hordes = a.hordes || [['weak']];
      const horde = hordes[Math.floor(Math.random() * hordes.length)];
      tl.add(0.4, () => {
        const base = opp ? opp.pos : f.pos;
        const back = Math.atan2(f.pos.x - base.x, f.pos.z - base.z);
        const taken = [{ x: base.x, z: base.z, r: 0.8 }, { x: f.pos.x, z: f.pos.z, r: 0.7 }];
        horde.forEach((kind, i) => {
          // em leque do lado do Diabo, em volta do adversário
          const ang = back + (i - (horde.length - 1) / 2) * 0.9;
          const want = { x: base.x + Math.sin(ang) * 2.3, z: base.z + Math.cos(ang) * 2.3 };
          const strong = kind === 'strong';
          const spot = findFreeSpotNear(world.arena, want.x, want.z, { radius: strong ? 0.8 : 0.55, others: taken }) || want;
          taken.push({ x: spot.x, z: spot.z, r: strong ? 0.8 : 0.55 });
          world.fx.burst(new THREE.Vector3(spot.x, 0.4, spot.z), { count: strong ? 50 : 30, color: 0x9a0010, speed: 4, up: 4, life: 0.7, size: 0.22, gravity: 8 });
          world.addNpc(new BloodZombie(f, world, new THREE.Vector3(spot.x, 0, spot.z), { duration: a.duration, strong }));
          addBloodPool(world, f, spot.x, spot.z, { radius: strong ? 1.5 : 1.1, life: a.duration }); // poça de onde ele sobe
        });
        f.notify(horde.includes('strong') ? 'SENHOR DO SANGUE — A HORDA E O BRUTO' : `SENHOR DO SANGUE ×${horde.length}`, true);
      });
      tl.end(0.7);
      return seqFrom(tl);
    },
  },

  // SANGUE NOS ARREDORES: o chão em volta do Diabo começa a jorrar sangue — gêiseres em ondas machucam e deixam lento
  // quem estiver perto; o Diabo se alimenta do sangue derramado
  bloodGeysers: {
    start(f, a, world) {
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('powerup', { restart: true, duration: 0.6 });
      world.audio.play('ritual', { volume: 0.7, pitch: 0.6 });
      const center = new THREE.Vector3(f.pos.x, 0.06, f.pos.z);
      // as ondas continuam depois da animação (o Diabo já pode agir): agenda no mundo
      const wave = () => {
          world.fx.ring(center, { color: 0x9a0010, radius: a.radius, life: 0.5 });
          for (let i = 0; i < 9; i++) {
            const ang = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * a.radius;
            world.fx.burst(new THREE.Vector3(center.x + Math.sin(ang) * r, 0.2, center.z + Math.cos(ang) * r), { count: 10, color: 0xb01020, speed: 1.5, up: 7, spread: 0.2, life: 0.8, size: 0.2, gravity: 10 });
          }
          const opp = f.opponent;
          if (opp && opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(center, opp.pos) <= a.radius + opp.radius) {
            const res = applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'sangue', knockback: 1.2, hitstun: 0.35, sound: 'clawHit', color: 0xb01020, scale: 1, dir: new THREE.Vector3().subVectors(opp.pos, center).setY(0).normalize() });
            if (typeof res === 'number' && res > 0) {
              f.health = Math.min(f.maxHealth, f.health + Math.round(res * a.drain));
              if (!opp.findBuff('bloodMire')) opp.addBuff({ type: 'bloodMire', name: 'SANGUE ATÉ OS JOELHOS', time: 1.5, duration: 1.5, speedMult: a.slow });
            }
          }
      };
      tl.add(0.35, () => { for (let w = 0; w < a.waves; w++) world.after(w * a.interval, wave); });
      // o sangue derramado fica: poças em volta (passagem do Transportar e regeneração mais rápida)
      if (a.pools) {
        world.after(0.35 + a.waves * a.interval, () => {
          for (let i = 0; i < a.pools; i++) {
            const ang = (i / a.pools) * Math.PI * 2 + f.yaw;
            const r = a.radius * 0.6;
            const spot = findFreeSpotNear(world.arena, center.x + Math.sin(ang) * r, center.z + Math.cos(ang) * r, { radius: 0.6 });
            if (spot) addBloodPool(world, f, spot.x, spot.z, { radius: 1.1, life: 10 });
          }
        });
      }
      tl.end(0.6);
      return seqFrom(tl);
    },
  },

  // ÓDIO DO DIABO (cânone: faz o ALVO sentir um ódio paranormal extremo, ficando mais forte): o adversário na mira fica
  // CEGO DE ÓDIO — bate um pouco mais forte, mas não defende, não usa rituais nem tiros e leva mais dano. O Diabo se
  // alimenta do ódio (mais dano e velocidade enquanto durar). Errou a mira: só o Diabo se alimenta do próprio ódio.
  devilHate: {
    start(f, a, world) {
      if (f.findBuff('hateFeed')) { f.notify('JÁ ATIVO'); return null; }
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'powerup', { restart: true, duration: 0.6 });
      world.audio.play('fearGaze', { volume: 0.7, pitch: 0.55 });
      tl.add(0.3, () => {
        const col = a.color ?? 0xff2a3d;
        const feed = world.fx.emitter({ rate: 26, follow: () => f.chestPos(), particle: { color: col, speed: 0.5, up: 1, spread: 0.4, life: 0.45, size: 0.16 } });
        f.addBuff({ type: 'hateFeed', name: 'PRÍNCIPE DO ÓDIO', time: a.duration, duration: a.duration, mult: a.selfMult, speedMult: a.selfSpeed, affects: ['melee', 'ranged', 'ability'], onEnd() { feed.stop(); } });
        const hits = opp && opp.state !== 'ko' && !opp.isInvulnerable() && distXZ(f.pos, opp.pos) <= a.range
          && Math.abs(angleDiff(f.yaw, yawTo(f.pos, opp.pos))) <= (a.arc * DEG) / 2;
        if (!hits) { f.notify('ÓDIO DO DIABO (ERROU)'); return; }
        world.fx.lightning(f.chestPos(), opp.chestPos(), { color: col, life: 0.25 });
        world.fx.burst(opp.chestPos(), { count: 36, color: col, speed: 4, life: 0.6, size: 0.22 });
        const rage = world.fx.emitter({ rate: 30, follow: () => opp.chestPos(), particle: { color: 0xb01020, kind: 'smoke', speed: 0.6, up: 1.2, spread: 0.4, life: 0.5, size: 0.35 } });
        if (opp.state === 'block') opp.setState('idle');
        const old = opp.findBuff('enraged');
        if (old) old.done = true;
        opp.addBuff({
          type: 'enraged', name: 'CEGO DE ÓDIO', time: a.duration, duration: a.duration,
          noBlock: true, meleeOnly: true, lockMsg: 'CEGO DE ÓDIO: SÓ NO CORPO A CORPO',
          takenMult: a.takenMult, mult: a.enragedMult, affects: ['melee'],
          onEnd() { rage.stop(); },
        });
        opp.notify('CEGO DE ÓDIO', true);
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },

  // TRANSPORTAR PELO SANGUE (cânone: "através de fendas ou grandes poças de Sangue", e pode levar outro ser junto):
  // afunda e sai pela poça dele mais perto do adversário — ou por uma fenda atrás dele. Com o adversário colado,
  // ARRASTA-O junto: os dois somem e ele é cuspido de outra poça, caído e sangrando.
  bloodTransport: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const drag = opp.state !== 'ko' && !opp.isInvulnerable() && !world.cinematic && distXZ(f.pos, opp.pos) <= a.dragRange && Math.abs(opp.pos.y - f.pos.y) < 1;
      // destino: poça do Diabo mais perto do adversário (arrastando: a mais LONGE de onde estão)
      const pools = poolsOf(world, f).filter((p) => distXZ(p, f.pos) > 3);
      let dest = null;
      if (pools.length) {
        pools.sort((p, q) => (drag ? distXZ(q, f.pos) - distXZ(p, f.pos) : distXZ(p, opp.pos) - distXZ(q, opp.pos)));
        dest = pools[0];
      }
      const behind = () => findSpotBehind(world.arena, { x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw }, { distance: a.distance, radius: f.radius });
      if (!dest && !drag && !behind()) { f.notify('SEM ESPAÇO PARA TELEPORTAR'); return null; }
      const tl = new Timeline();
      const sink = a.vanishTime;
      f.vel.set(0, 0, 0);
      f.anim.play('vanish', { restart: true, duration: sink });
      addBloodPool(world, f, f.pos.x, f.pos.z, { radius: 1.2, life: 6 });
      world.audio.play('teleport', { pitch: 0.7 });
      f.invuln = sink + 0.1;
      if (drag) {
        if (opp.cancelAction) opp.cancelAction();
        opp.setState('grabbed');
        opp.vel.set(0, 0, 0);
        opp.notify('ARRASTADO PELO SANGUE', true);
      }
      const held = () => drag && opp.state === 'grabbed';
      tl.each((time) => {
        if (time <= sink) {
          f.rig.body.position.y = -1.9 * (time / sink);
          if (held()) opp.rig.body.position.y = -1.9 * (time / sink);
        }
      });
      tl.add(sink, () => {
        f.setVisible(false);
        if (held()) opp.setVisible(false);
        world.fx.burst(new THREE.Vector3(f.pos.x, 0.2, f.pos.z), { count: 26, color: 0x9a0010, speed: 3, up: 3, life: 0.6, size: 0.22, gravity: 8 });
      });
      tl.add(sink + 0.08, () => {
        let to = dest;
        if (!to && drag) {
          // sem poça: abre uma fenda a ~6 m, para o lado com mais espaço
          for (const ang of [Math.PI, Math.PI / 2, -Math.PI / 2, 0]) {
            const y = f.yaw + ang;
            const sp = findFreeSpotNear(world.arena, f.pos.x + Math.sin(y) * 6, f.pos.z + Math.cos(y) * 6, { radius: 0.8 });
            if (sp) { to = sp; break; }
          }
          to = to || { x: f.pos.x, z: f.pos.z };
          addBloodPool(world, f, to.x, to.z, { radius: 1.4, life: 6 });
        }
        if (drag) {
          // o Diabo sai de pé na borda da poça; o adversário é cuspido no meio dela, caído
          const yaw = Math.atan2(to.x - f.pos.x, to.z - f.pos.z) || f.yaw;
          const fs = findFreeSpotNear(world.arena, to.x - Math.sin(yaw) * 1.4, to.z - Math.cos(yaw) * 1.4, { radius: f.radius }) || to;
          f.pos.set(fs.x, 0, fs.z);
          if (opp.state === 'grabbed') {
            opp.pos.set(to.x, 0, to.z);
            opp.rig.body.position.y = 0;
            opp.setVisible(true);
            opp.setState('idle');
            applyHit(world, f, opp, { damage: a.dragDamage, kind: 'ability', element: 'sangue', knockback: 2.5, launch: true, lowLaunch: true, dir: new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), sound: 'clawHit', color: 0xb01020, scale: 1.4, ignoreInvuln: true });
            if (opp.state !== 'ko') opp.applyBleed({ dps: 5, duration: 2.5 }, f);
            world.fx.burst(new THREE.Vector3(to.x, 0.4, to.z), { count: 40, color: 0xb01020, speed: 4, up: 5, life: 0.7, size: 0.24, gravity: 9 });
          }
        } else if (dest) {
          f.pos.set(dest.x, 0, dest.z);
        } else {
          const spot = behind();
          if (spot) f.pos.set(spot.x, Math.max(0, opp.pos.y), spot.z);
          if (!hasPassive(opp, 'precognition')) opp.surprised = 0.45;
        }
        f.yaw = yawTo(f.pos, opp.pos);
        world.fx.burst(new THREE.Vector3(f.pos.x, 0.3, f.pos.z), { count: 20, color: 0x9a0010, speed: 3, up: 3, life: 0.5, size: 0.2, gravity: 8 });
        f.rig.body.position.y = -1.6;
        f.setVisible(true);
        f.invuln = 0.12;
      });
      tl.each((time) => {
        if (time > sink + 0.08) f.rig.body.position.y = Math.min(0, -1.6 + ((time - sink - 0.08) / 0.12) * 1.6);
      });
      tl.add(sink + 0.2, () => {
        f.rig.body.position.y = 0;
        f.anim.play('idle', { restart: true, blend: 0.05 });
      });
      tl.end(sink + 0.26);
      const restore = () => {
        f.setVisible(true);
        f.rig.body.position.y = 0;
        if (drag) {
          opp.rig.body.position.y = 0;
          opp.setVisible(true);
          if (opp.state === 'grabbed') opp.setState('idle');
        }
      };
      return seqFrom(tl, { cancel: restore, cancelable: () => tl.time > sink + 0.15, finish: restore });
    },
  },

  // Aguiar — Cães de Caça: assobia e um Rottweiler corre até a vítima, morde (prende e faz sangrar) e volta.
  huntingDog: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko') return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: 0.45 });
      world.audio.play('fearGaze', { pitch: 2.2, volume: 0.5 }); // assobio
      tl.add(0.2, () => {
        const dog = buildHuntingDog();
        const R = new THREE.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw));
        const pos = f.pos.clone().addScaledVector(R, 0.9);
        dog.root.position.copy(pos);
        world.scene.add(dog.root);
        world.fx.burst(pos.clone().setY(0.5), { count: 14, color: 0x2a2420, kind: 'smoke', speed: 1.5, life: 0.5, size: 0.5 });
        let t = 0;
        let phase = 'run';
        let biteT = 0;
        const away = new THREE.Vector3();
        world.addTicker({
          update(dt) {
            t += dt;
            const target = f.opponent;
            if (phase === 'run') {
              if (!target || target.state === 'ko' || t > a.maxRun) { phase = 'leave'; away.copy(dog.root.position).sub(f.pos).setY(0).normalize(); t = 0; return false; }
              const to = new THREE.Vector3(target.pos.x - pos.x, 0, target.pos.z - pos.z);
              const d = to.length();
              dog.root.rotation.y = Math.atan2(to.x, to.z);
              if (d <= 0.9) {
                if (!target.isInvulnerable()) {
                  const res = applyHit(world, f, target, { damage: a.damage, kind: 'ability', knockback: 0, hitstun: 0.4, reaction: false, sound: 'bladeHit', color: 0x9a0010, pos: target.chestPos() });
                  if (typeof res === 'number' && target.state !== 'ko') {
                    target.stun(a.hold, 'stagger');
                    if (a.bleed) target.applyBleed(a.bleed, f);
                    target.notify('MORDIDO', true);
                  }
                  world.fx.burst(target.chestPos(), { count: 18, color: 0x9a0010, speed: 3, life: 0.5, size: 0.16, gravity: 7 });
                }
                phase = 'bite';
                biteT = 0;
                return false;
              }
              pos.addScaledVector(to.normalize(), Math.min(d - 0.85, a.speed * dt));
            } else if (phase === 'bite') {
              biteT += dt;
              if (biteT > a.hold) { phase = 'leave'; away.set(-Math.sin(dog.root.rotation.y), 0, -Math.cos(dog.root.rotation.y)); t = 0; }
            } else {
              pos.addScaledVector(away, a.speed * dt);
              dog.root.rotation.y = Math.atan2(away.x, away.z);
              if (t > 0.7) {
                world.fx.burst(pos.clone().setY(0.5), { count: 10, color: 0x2a2420, kind: 'smoke', speed: 1.5, life: 0.5, size: 0.5 });
                return true;
              }
            }
            dog.root.position.copy(pos);
            dog.update(world.time, phase !== 'bite', phase === 'bite');
            return false;
          },
          dispose() { world.scene.remove(dog.root); dog.dispose(); },
        });
      });
      tl.end(0.45);
      return seqFrom(tl);
    },
  },

  // Xande — Polarização Caótica: aura magnética. Alvo LONGE é puxado até ele; alvo PERTO é repelido e cai.
  polarize: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko') return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('cast_up', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('shockwave', { pitch: 1.3 });
      const aura = world.fx.emitter({ rate: 60, follow: () => f.chestPos(), particle: { color: a.color, speed: 2, spread: 1, life: 0.3, size: 0.12 } });
      tl.add(a.windup, () => {
        aura.stop();
        const d = distXZ(f.pos, opp.pos);
        if (d > a.range || opp.isInvulnerable()) { f.notify('FORA DE ALCANCE', true); return; }
        for (let k = 0; k < 4; k++) world.fx.lightning(f.chestPos(), opp.chestPos(), { color: a.color, life: 0.15 });
        if (d > a.near) {
          // atrai: puxa para a frente dele
          const F = new THREE.Vector3().subVectors(opp.pos, f.pos).setY(0).normalize();
          const res = applyHit(world, f, opp, { damage: a.pullDamage, kind: 'ability', knockback: 0, hitstun: 0.5, reaction: false, color: a.color, sound: 'chainPull' });
          if (typeof res === 'number') opp.pullTo(new THREE.Vector3(f.pos.x + F.x * 1.5, opp.pos.y, f.pos.z + F.z * 1.5), { time: 0.3, after: 0.5 });
          opp.notify('ATRAÍDO', true);
        } else {
          // repele: empurra para longe e derruba
          applyHit(world, f, opp, { damage: a.pushDamage, kind: 'ability', knockback: 9, launch: true, lowLaunch: true, color: a.color, sound: 'shockwave', scale: 1.4 });
          world.fx.ring(f.chestPos(), { color: a.color, radius: 2.4, life: 0.35, vertical: true, yaw: f.yaw });
          opp.notify('REPELIDO', true);
        }
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: () => aura.stop() });
    },
  },

  // Xande — Tela de Ruído: película de Energia que absorve dano físico e de projétil (escudo de vida extra)
  noiseScreen: {
    start(f, a, world) {
      const buffType = a.buffType || 'noise';
      const label = a.label || 'TELA DE RUÍDO';
      if (f.findBuff(buffType)) { f.notify(label + ' JÁ ATIVA'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('concentrate', { restart: true, duration: 0.5 });
      world.audio.play('ritual', { volume: 0.5, pitch: 1.4 });
      tl.add(0.3, () => {
        const film = world.fx.emitter({ rate: 30, follow: () => f.chestPos().add(new THREE.Vector3((Math.random() - 0.5) * 1.2, (Math.random() - 0.3) * 1.6, (Math.random() - 0.5) * 1.2)), particle: { color: a.color, speed: 0.1, spread: 0.05, life: 0.25, size: 0.09 } });
        world.fx.ring(f.chestPos(), { color: a.color, radius: 1.3, life: 0.4, vertical: true, yaw: f.yaw });
        f.addBuff({ type: buffType, name: label, time: a.duration, duration: a.duration, shield: a.shield, shieldKinds: a.shieldKinds || ['melee', 'ranged'], color: a.color, ...bloodArmBuff(a), onEnd() { film.stop(); } });
        f.notify(label, true);
      });
      tl.end(0.5);
      return seqFrom(tl);
    },
  },

  // Buff simples em si mesmo (ex.: Velocidade Mortal do Xande)
  selfBuff: {
    start(f, a, world) {
      if (f.findBuff(a.buffType)) { f.notify('JÁ ATIVO'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play(a.anim || 'concentrate', { restart: true, duration: 0.45 });
      world.audio.play('ritual', { volume: 0.5 });
      tl.add(0.25, () => {
        const trail = world.fx.emitter({ rate: 24, follow: () => f.chestPos(), particle: { color: a.color, speed: 0.4, spread: 0.4, life: 0.4, size: 0.16 } });
        if (a.refillDodges) f.dodges = Math.max(f.dodges, a.refillDodges);
        f.addBuff({ type: a.buffType, name: a.label || a.name.toUpperCase(), time: a.duration, duration: a.duration, speedMult: a.speedMult, mult: a.damageMult, affects: a.affects, onEnd() { trail.stop(); } });
        f.notify(a.label || a.name.toUpperCase(), true);
      });
      tl.end(0.45);
      return seqFrom(tl);
    },
  },
});

// Zona de névoa da Kaiser (usada pela Baforada e pelo especial Cinerária)
export function createMistZone(world, owner, o) {
  const zone = world.addZone({
    owner, center: o.center, radius: o.radius, slow: o.slow, enemyRegen: o.enemyRegen,
    projectileSlow: o.projectileSlow, eatsProjectiles: o.eatsProjectiles,
  });
  const smoke = world.fx.emitter({
    rate: 22 * (o.density ?? 1) * (o.radius / 3),
    follow: () => {
      const c = o.center();
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * o.radius;
      return new THREE.Vector3(c.x + Math.sin(a) * r, 0.3 + Math.random() * 1.2, c.z + Math.cos(a) * r);
    },
    particle: { color: o.color, kind: 'smoke', speed: 0.3, up: 0.2, spread: 0.3, life: 2.2, size: 2.4, grow: 0.9, drag: 0.5 },
  });
  const ring = world.fx.emitter({
    rate: 14,
    follow: () => {
      const c = o.center();
      const a = Math.random() * Math.PI * 2;
      return new THREE.Vector3(c.x + Math.sin(a) * o.radius, 0.1, c.z + Math.cos(a) * o.radius);
    },
    particle: { color: o.color, speed: 0.3, up: 0.6, spread: 0.1, life: 0.9, size: 0.25 },
  });
  // poça no chão (Poça de Lodo do Dante): mancha preta e brilhante de contorno irregular, com bolhas estourando
  let bubbles = null;
  if (o.pool) {
    const c0 = o.center();
    const mesh = new THREE.Mesh(splatGeo(c0.x, c0.z), new THREE.MeshStandardMaterial({ color: o.pool.color ?? 0x07060a, roughness: 0.06, metalness: 0.45, emissive: o.pool.glow ?? 0x08201c, emissiveIntensity: 0.6, transparent: true, opacity: 0, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(c0.x, 0.04, c0.z);
    mesh.renderOrder = 1;
    world.scene.add(mesh);
    let t = 0;
    const life = o.duration || 6;
    world.addTicker({
      update(dt) {
        t += dt;
        const k = t / life;
        mesh.scale.setScalar(o.radius * Math.min(1, 0.4 + t / 0.3));
        mesh.material.opacity = 0.92 * Math.min(1, t / 0.15) * (k > 0.85 ? (1 - k) / 0.15 : 1);
        return t >= life;
      },
      dispose() { world.scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); },
    });
    bubbles = world.fx.emitter({
      rate: 10 * (o.radius / 3),
      follow: () => {
        const c = o.center();
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * o.radius * 0.85;
        return new THREE.Vector3(c.x + Math.sin(a) * r, 0.08, c.z + Math.cos(a) * r);
      },
      particle: { color: Math.random() < 0.2 ? 0x58d0b8 : 0x16131c, speed: 0.1, up: 0.5, spread: 0.05, life: 0.5, size: 0.14 },
    });
  }
  const end = () => {
    zone.alive = false;
    smoke.stop();
    ring.stop();
    if (bubbles) bubbles.stop();
  };
  if (o.duration) world.after(o.duration, end);
  zone.end = end;
  return zone;
}
