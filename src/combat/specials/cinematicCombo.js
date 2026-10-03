import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, specialHitFx, trySpecialBlock } from './common.js';
import { faceClose, twoShot, overShoulder, lowAngle, pullBack, socketClose } from '../../camera/shots.js';

// Especial genérico "avança e executa uma sequência de golpes com câmera
// cinematográfica". Usado por Arthur, Aghata, Injustiça e Kian;
// cada um só muda a configuração (golpes, efeitos, tempos).
//
// Fases: preparação → investida → (se encostar) cinematic com golpes → fim.
// Dano total = sp.damage ?? COMBAT.specialDamage, dividido entre os golpes.

const PREP_FX = {
  // Arthur: energia vermelha no antebraço e a Arma de Sangue surgindo
  forearmEnergy(f, world, sp) {
    const s = (sp.prepare && sp.prepare.arm) || 'R';
    const elbow = () => f.rig.joints['e' + s].getWorldPosition(new THREE.Vector3());
    const hand = () => f.rig.sockets['hand' + s].getWorldPosition(new THREE.Vector3());
    const e1 = world.fx.emitter({ rate: 90, follow: elbow, particle: { color: sp.color, speed: 1.6, spread: 0.7, life: 0.45, size: 0.28, jitter: 0.2 } });
    const e2 = world.fx.emitter({ rate: 60, follow: hand, particle: { color: 0x5a0008, kind: 'smoke', speed: 0.6, spread: 0.4, life: 0.6, size: 0.35, grow: 1 } });
    return [e1, e2];
  },
  bloodBurst(f, world, sp) {
    world.fx.burst(f.chestPos(), { count: 40, color: sp.color, speed: 6, life: 0.5, size: 0.3 });
    world.fx.burst(f.chestPos(), { count: 16, color: 0x2a0408, kind: 'smoke', speed: 2, life: 0.7, size: 0.8, grow: 1 });
    return [];
  },
  bladeGlow(f, world, sp) {
    const mk = (s) => world.fx.emitter({ rate: 90, follow: () => f.rig.sockets[s].getWorldPosition(new THREE.Vector3()), particle: { color: sp.color, speed: 1.4, spread: 0.8, life: 0.4, size: 0.3, jitter: 0.5 } });
    return [mk('handR'), mk('handL')];
  },
  // Lírio: nada de energia — pisa firme, levanta poeira e ergue a Leonora
  stomp(f, world) {
    world.fx.play('FX_DUST', f.pos, { scale: 1.2 });
    world.cameraRig.shake(0.25, 0.3);
    world.audio.play('heavyPunch', { volume: 0.6, pitch: 0.55 });
    return [];
  },
  fistGlow(f, world, sp) {
    const mk = (s) => world.fx.emitter({ rate: 100, follow: () => f.rig.sockets[s].getWorldPosition(new THREE.Vector3()), particle: { color: sp.color, speed: 1.4, spread: 0.7, life: 0.4, size: 0.32 } });
    return [mk('handR'), mk('handL')];
  },
};

function buildShots(kind, f, opp, sp) {
  const firstHit = sp.hits[0].t;
  const finalHit = sp.hits[sp.hits.length - 1].t;
  const shots = [];
  if (kind === 'claw') {
    // aproximação no braço com a garra, depois no rosto (nome aparece), golpes
    shots.push(socketClose(f, () => f.rig.joints.eR.getWorldPosition(new THREE.Vector3()), { dur: 0.45, dist: 1.6, side: 0.9 }));
    shots.push(faceClose(f, { dur: firstHit - 0.45, from: 1.8, to: 1.2, side: -0.4 }));
  } else {
    shots.push(faceClose(f, { dur: firstHit, from: 2.0, to: 1.25, side: 0.45 }));
  }
  const mid = finalHit - firstHit;
  shots.push(twoShot(f, opp, { dur: mid * 0.4, dist: 4.2, push: 0.8, side: 1 }));
  shots.push(overShoulder(opp, f, { dur: mid * 0.3, back: 1.8, side: 0.9, height: 1.8 }));
  shots.push(lowAngle(f, { dur: mid * 0.3, dist: 3.2, side: 2.0 }));
  shots.push(pullBack(f, opp, { dur: sp.length - finalHit + 0.1, from: 2.6, to: 6.5, height: 1.8, side: -1 }));
  return shots;
}

export const cinematicCombo = {
  canStart: () => true,
  start(f, sp, world) {
    const total = sp.damage ?? COMBAT.specialDamage;
    const parts = splitDamage(total, sp.hits.map((h) => h.share));
    const prep = sp.prepare || { anim: 'charge', time: 0.3 };
    const dash = sp.dash || { speed: 22, maxTime: 0.45, contact: 1.7 };
    let phase = 'prepare';
    let t = 0;
    let tl = null;
    let emitters = [];
    let propShown = false;
    let opp = f.opponent;

    f.vel.set(0, 0, 0);
    f.anim.play(prep.anim, { restart: true, duration: prep.time });
    world.audio.play(sp.sound || 'specialStart');
    if (prep.fx && PREP_FX[prep.fx]) emitters = PREP_FX[prep.fx](f, world, sp);
    if (!sp.physical) world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: sp.color, radius: 3, life: 0.5 });

    // corrente da aproximação (approach: 'chain')
    let chainFx = null;
    let tip = null;
    let pullFrom = null;
    const hitChains = [];
    const cleanup = () => {
      emitters.forEach((e) => e.stop());
      emitters = [];
      // a peça some no fim — a não ser que um estado ativo a mantenha (ex.: máscara do Aguiar)
      if (sp.prepare?.showProp && !(sp.prepare.keepIfBuff && f.findBuff(sp.prepare.keepIfBuff))) f.rig.showProp(sp.prepare.showProp, false);
      if (chainFx) { chainFx.stop(); chainFx = null; }
      hitChains.forEach((c) => c.stop());
      hitChains.length = 0;
    };
    const handPos = (s = 'handR') => f.rig.sockets[s].getWorldPosition(new THREE.Vector3());

    const beginCinematic = () => {
      phase = 'cinematic';
      world.beginCinematic(f, opp);
      // posiciona os dois frente a frente
      const yaw = yawTo(f.pos, opp.pos);
      f.yaw = yaw;
      opp.yaw = yawTo(opp.pos, f.pos);
      const F = forwardFromYaw(yaw);
      f.pos.set(opp.pos.x - F.x * 1.15, opp.pos.y, opp.pos.z - F.z * 1.15);
      f.anim.play('idle', { restart: true, blend: 0.05 });
      opp.anim.play('hit', { restart: true });
      world.cameraRig.playShots(buildShots(sp.shots, f, opp, sp));

      tl = new Timeline();
      tl.add(sp.bannerAt ?? 0.1, () => world.showBanner(sp.banner || f.def.name, f.def.color));
      sp.hits.forEach((h, i) => {
        tl.add(h.t, () => {
          f.anim.play(h.anim, { restart: true, duration: h.dur, blend: 0.04 });
          world.audio.play('swing', { volume: 0.7 });
        });
        tl.add(h.t + h.dur * 0.4, () => {
          applyHit(world, f, opp, {
            damage: parts[i], kind: 'special', reaction: false, ignoreInvuln: true,
            sound: h.sound, color: sp.color, scale: h.final ? 2 : 1.2,
            applyMeleePassives: !!sp.applyMeleePassives,
            strike: sp.applyMeleePassives ? { damage: parts[i], heal: Math.floor(parts[i] * 0.3) } : undefined,
          });
          specialHitFx(world, f, opp, h.fx, sp.color);
          if (h.fx && h.fx.chain) {
            // correntes aparecem fisicamente durante o golpe
            const sides = h.fx.chain === 'both' ? ['handR', 'handL'] : [h.fx.chain === 'L' ? 'handL' : 'handR'];
            for (const s of sides) {
              const c = world.fx.chain(() => handPos(s), () => opp.chestPos(), { links: 14, sag: 0.05 });
              hitChains.push(c);
              world.after(0.35, () => c.stop());
            }
            world.audio.play('chainPull', { volume: 0.6 });
          }
          if (opp.state !== 'ko') opp.anim.play(h.final ? 'launched' : 'hit', { restart: true, blend: 0.02 });
          // empurra um pouco e acompanha
          const F2 = forwardFromYaw(f.yaw);
          const push = h.final ? 0.6 : 0.18;
          opp.pos.addScaledVector(F2, push);
          f.pos.addScaledVector(F2, push * 0.8);
          if (h.final) world.cameraRig.shake(0.6, 0.35);
        });
      });
      tl.add(sp.length, () => {});
      tl.end(sp.length);
    };

    return {
      update(dt) {
        t += dt;
        if (phase === 'prepare') {
          opp = f.opponent;
          if (opp) f.yaw = yawTo(f.pos, opp.pos);
          if (prep.showProp && !propShown && t >= prep.time * 0.55) {
            propShown = true;
            f.rig.showProp(prep.showProp, true);
            const p = (prep.showProp === 'maskOn' ? f.rig.joints.hd : f.rig.joints['e' + (prep.arm || 'R')]).getWorldPosition(new THREE.Vector3());
            world.fx.burst(p, { count: 40, color: sp.color, speed: 5, life: 0.5, size: 0.3 });
            world.fx.flash(p, { color: sp.color, size: 2, life: 0.15 });
          }
          if (t >= prep.time) {
            t = 0;
            if (sp.approach === 'chain') {
              // 1: lança a lâmina presa à corrente
              phase = 'chain';
              tip = handPos();
              chainFx = world.fx.chain(() => handPos(), () => tip.clone(), { links: 32, sag: 0.06 });
              f.anim.play('chain_throw', { restart: true, duration: 0.4 });
              world.audio.play('chainThrow');
            } else {
              phase = 'dash';
              f.anim.play('dash', { restart: true });
            }
          }
          return false;
        }
        if (phase === 'chain') {
          const c = sp.chain || { speed: 60, range: 16 };
          if (!opp || opp.state === 'ko') { cleanup(); return true; }
          f.yaw = yawTo(f.pos, opp.pos);
          const goal = opp.chestPos();
          const dir = goal.clone().sub(tip);
          const step = c.speed * dt;
          const tooFar = tip.distanceTo(handPos()) > c.range;
          if (dir.length() <= step + 0.35 && !tooFar) {
            if (opp.isInvulnerable() && opp.state !== 'grabbed') {
              phase = 'whiff';
              t = 0;
              cleanup();
              return false;
            }
            if (trySpecialBlock(world, f, opp, sp)) { cleanup(); return true; }
            // 2–3: prende e puxa o adversário para perto
            phase = 'pull';
            t = 0;
            pullFrom = opp.pos.clone();
            world.beginCinematic(f, opp);
            opp.anim.play('launched', { restart: true, duration: 0.4 });
            f.anim.play('chain_pull', { restart: true, duration: 0.4 });
            world.audio.play('chainPull');
            world.fx.burst(goal, { count: 20, color: sp.color, speed: 5, life: 0.35, size: 0.22 });
            chainFx.toFn = () => opp.chestPos();
            return false;
          }
          if (tooFar || t > 0.8) { phase = 'whiff'; t = 0; cleanup(); return false; }
          tip.addScaledVector(dir.normalize(), step);
          return false;
        }
        if (phase === 'pull') {
          const k = Math.min(1, t / 0.32);
          const F = forwardFromYaw(f.yaw);
          const to = new THREE.Vector3(f.pos.x + F.x * 1.15, opp.pos.y, f.pos.z + F.z * 1.15);
          opp.pos.lerpVectors(pullFrom, to, k);
          if (k >= 1) {
            if (chainFx) { chainFx.stop(); chainFx = null; }
            world.endCinematic();
            beginCinematic();
          }
          return false;
        }
        if (phase === 'dash') {
          if (!opp || opp.state === 'ko') { cleanup(); return true; }
          f.yaw = yawTo(f.pos, opp.pos);
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * dash.speed;
          f.vel.z = F.z * dash.speed;
          if (sp.physical) world.fx.burst(new THREE.Vector3(f.pos.x, 0.2, f.pos.z), { count: 2, color: 0x9a8a72, kind: 'smoke', speed: 1, up: 0.4, life: 0.45, size: 0.5, grow: 1 });
          else world.fx.burst(f.chestPos(), { count: 2, color: sp.color, speed: 1, life: 0.3, size: 0.4 });
          const d = distXZ(f.pos, opp.pos);
          const reachable = Math.abs(opp.pos.y - f.pos.y) < 1.8 && opp.visible;
          if (d <= dash.contact && reachable) {
            f.vel.set(0, 0, 0);
            if (trySpecialBlock(world, f, opp, sp)) { cleanup(); return true; }
            beginCinematic();
            return false;
          }
          if (t >= dash.maxTime) {
            // errou: recupera sem causar dano
            f.vel.set(0, 0, 0);
            phase = 'whiff';
            t = 0;
            f.anim.play('idle', { restart: true });
          }
          return false;
        }
        if (phase === 'whiff') {
          if (t >= 0.45) { cleanup(); return true; }
          return false;
        }
        if (phase === 'cinematic') {
          const done = tl.update(dt);
          if (done) {
            cleanup();
            world.endCinematic();
            if (opp.state !== 'ko') {
              opp.react({ dir: forwardFromYaw(f.yaw), knockback: 8, hitstun: COMBAT.launchHitstun, launch: true });
            }
            f.anim.play('idle', { blend: 0.15 });
            return true;
          }
          return false;
        }
        return true;
      },
      cancel() {
        cleanup();
        if (phase === 'cinematic' || phase === 'pull') world.endCinematic();
      },
    };
  },
};
