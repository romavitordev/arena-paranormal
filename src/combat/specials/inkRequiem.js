import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { orbit, twoShot, lowAngle, faceClose } from '../../camera/shots.js';
import { inkTentacle, inkSplash, ghostBell, bellWave } from '../../fx/inkFx.js';
import { meltFace } from '../amigoPowers.js';

// TODO MUNDO VAI MORRER (o Amigo Imaginário — "quando o Sino tocar, a criatura vai retornar"):
//  aviso: ele aponta a garra e o sigilo pulsa debaixo do alvo (dá para esquivar);
//  1. o SINO toca dentro da criatura (o sino fantasma aparece sobre o capuz) e a poça de tinta se abre debaixo do alvo:
//     os TENTÁCULOS brotam, se enrolam nele e o ERGUEM do chão;
//  2. a criatura desliza até a vítima presa e RASGA com as garras (três golpes);
//  3. DERRETER: curva o capuz sobre o rosto erguido e a tinta escorre direto na cara dela;
//  4. a ÚLTIMA BADALADA: os tentáculos batem a vítima no chão — ela cai com o rosto derretendo.
export const inkRequiem = {
  telegraph: () => ({ time: 0.6, anim: 'ai_point', animDuration: 0.6, mark: 'sigil' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 12);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const col = sp.color ?? 0x8a4a22;
    const INK = 0x5a2410;
    const total = sp.damage ?? COMBAT.specialDamage;
    const [c1, c2, c3, m1, m2, slam] = splitDamage(total, [0.1, 0.1, 0.12, 0.1, 0.12, 0.46]);
    world.beginCinematic(f, opp);
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    opp.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.yaw = yawTo(opp.pos, f.pos);
    const spot = opp.pos.clone().setY(0);
    const startF = f.pos.clone();
    let lift = 0;
    let liftTo = 0;
    let held = false;
    let approach = 0; // 0 → 1: desliza até a vítima
    let stream = null;
    const tents = [];
    const prevTint = opp.buffTint;
    const head = () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3());
    const mouth = () => (f.rig.sockets.mouth || f.rig.joints.hd).getWorldPosition(new THREE.Vector3());
    const oppHead = () => opp.rig.joints.hd.getWorldPosition(new THREE.Vector3());
    const bell = ghostBell(world, () => head().add(new THREE.Vector3(0, 0.95, 0)), { life: 4.4, size: 0.75 });
    const toll = (vol, pitch, radius) => {
      bell.toll();
      world.audio.play('bellToll', { volume: vol, pitch });
      bellWave(world, f.pos.clone().setY(1.0), radius, col);
    };

    world.cameraRig.playShots([
      twoShot(f, opp, { dur: 1.1, dist: 5.2, height: 2.0, push: 0.4, side: 1, lookH: 1.4 }),
      lowAngle(opp, { dur: 1.2, dist: 3.4, side: -0.6 }),
      faceClose(opp, { dur: 1.3, from: 1.9, to: 1.3, side: 0.4, height: 1.9 }),
      orbit(f, { dur: 1.1, radius: 4.6, height: 2.2, a0: 0.3, a1: 1.2, lookH: 1.3 }),
    ]);
    // 1. O SINO
    tl.add(0.05, () => {
      world.showBanner(sp.banner || sp.name, f.def.color);
      f.anim.play('ai_bell', { restart: true, duration: 0.9 });
      toll(1, 1, 5);
    });
    // os tentáculos brotam da poça e erguem a vítima
    tl.add(0.4, () => {
      inkSplash(world, spot.clone().setY(0.05), { size: 1.9, life: 4.2 });
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2 + 0.5;
        const base = new THREE.Vector3(spot.x + Math.sin(ang) * 1.05, 0.02, spot.z + Math.cos(ang) * 1.05);
        tents.push(inkTentacle(world, base, () => opp.pos.clone().setY(opp.pos.y + 0.45 + (i % 3) * 0.42), { grow: 0.2, hold: 3.3, retract: 0.25, coil: true, radius: 0.1, arc: 0.45 }));
      }
      held = true;
      liftTo = 0.85;
      opp.anim.play('stagger', { restart: true });
      opp.notify('PRESO PELOS TENTÁCULOS', true);
      world.audio.play('chainPull', { volume: 1, pitch: 0.6 });
    });
    // 2. desliza até a vítima e rasga
    tl.add(0.85, () => { f.anim.play('ai_dash', { restart: true }); });
    const claw = (t, anim, dur, dmg, flip) => {
      tl.add(t, () => { f.anim.play(anim, { restart: true, duration: dur }); world.audio.play('blade', { volume: 0.8 }); });
      tl.add(t + dur * 0.5, () => {
        const p = opp.chestPos();
        world.fx.slash(p, f.yaw + (flip ? Math.PI : 0), { color: INK, radius: 1.5, arc: 2.4, life: 0.25, width: 0.3 });
        inkSplash(world, p, { size: 0.6, puddle: false });
        opp.anim.play('hit', { restart: true });
        applyHit(world, f, opp, { damage: dmg, kind: 'special', element: 'tinta', reaction: false, ignoreInvuln: true, unblockable: true, color: col, sound: 'clawHit', scale: 1.1, pos: p });
      });
    };
    claw(1.3, 'ai_claw_r', 0.36, c1, false);
    claw(1.62, 'ai_claw_l', 0.36, c2, true);
    claw(1.95, 'ai_rake', 0.46, c3, false);
    // 3. DERRETER
    tl.add(2.45, () => {
      f.anim.play('ai_pour', { restart: true, duration: 1.15 });
      world.audio.play('inkPour', { volume: 1.1 });
      opp.buffTint = { color: 0x6a3418, base: 0.35 };
      stream = world.fx.emitter({
        rate: 90,
        follow: () => mouth().lerp(oppHead(), 0.12),
        particle: { color: INK, speed: 0.4, up: -1.2, spread: 0.06, life: 0.3, size: 0.14, gravity: 5 },
      });
    });
    [[2.75, m1], [3.15, m2]].forEach(([t, dmg], i) => tl.add(t, () => {
      const p = oppHead();
      inkSplash(world, p, { size: 0.8, puddle: false });
      opp.anim.play('hit', { restart: true });
      if (i === 0) opp.notify('O ROSTO DERRETE', true);
      applyHit(world, f, opp, { damage: dmg, kind: 'special', element: 'tinta', reaction: false, ignoreInvuln: true, unblockable: true, color: INK, sound: 'drain', scale: 1, pos: p });
    }));
    // 4. a última badalada: os tentáculos batem a vítima no chão
    tl.add(3.45, () => {
      if (stream) { stream.stop(); stream = null; }
      toll(1.25, 0.82, 7);
      world.screenFlash && world.screenFlash('#2a1206', 0.3);
      liftTo = 1.5;
    });
    tl.add(3.7, () => {
      held = false;
      tents.forEach((h) => h.release());
      opp.pos.y = 0;
      opp.buffTint = prevTint || null;
      inkSplash(world, opp.pos.clone().setY(0.1), { size: 2 });
      world.fx.ring(opp.pos.clone().setY(0.08), { color: INK, radius: 3, life: 0.45 });
      world.cameraRig.shake(0.55, 0.35);
      applyHit(world, f, opp, { damage: slam, kind: 'special', element: 'tinta', knockback: 2.5, hitstun: 0.8, launch: true, lowLaunch: true, ignoreInvuln: true, unblockable: true, dir: forwardFromYaw(f.yaw), color: col, sound: 'heavyPunch', scale: 2.2 });
      if (opp.state !== 'ko' && sp.melt) meltFace(world, opp, sp.melt);
    });
    tl.end(4.3);

    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      if (stream) stream.stop();
      tents.forEach((h) => h.release());
      if (opp.buffTint && opp.buffTint.color === 0x6a3418 && opp.buffTint.base === 0.35) opp.buffTint = prevTint || null;
      if (opp.pos.y > 0 && held) opp.pos.y = 0;
      if (world.cinematic && world.cinematic.actor === f) world.endCinematic();
    };
    return {
      update(dt) {
        const t = tl.time;
        opp.vel.set(0, 0, 0);
        if (held) {
          lift += (liftTo - lift) * Math.min(1, dt * (liftTo > 1 ? 10 : 5));
          opp.pos.y = lift;
        }
        if (t >= 0.85 && t < 1.25) {
          approach = Math.min(1, (t - 0.85) / 0.4);
          const F = forwardFromYaw(f.yaw);
          const reach = Math.max(0, distXZ(startF, spot) - 1.15);
          f.pos.set(startF.x + F.x * reach * approach, f.pos.y, startF.z + F.z * reach * approach);
        }
        const end = tl.update(dt);
        if (end) cleanup();
        return end;
      },
      cancel() { cleanup(); },
    };
  },
};
