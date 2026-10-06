import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { faceClose, orbit, twoShot, lowAngle, socketClose, pullBack, overShoulder } from '../../camera/shots.js';

// ATO FINAL (ultimate do Arnaldo Fritz) — uma EXECUÇÃO TEATRAL, não só uma sequência de golpes:
//   1. SILÊNCIO: a câmera fecha no Arnaldo segurando a espada; a fita vermelha se mexe devagar (mundo parado, curto);
//   2. POSTURA: pequena reverência para a "plateia";
//   3. AVANÇO: dispara na direção do adversário em TEMPO REAL — dá para esquivar ou defender;
//   4. SEQUÊNCIA (se encostar): corte horizontal → corte diagonal → giro → estocada final;
//   5. FINALIZAÇÃO: ele ATRAVESSA o adversário e para de costas, imóvel por um instante, a fita ainda balançando;
//      só então o impacto chega e o adversário é lançado.
// Dano total = sp.damage ?? COMBAT.specialDamage (dividido pelos golpes: shares).
export const actFinal = {
  canStart: () => true,
  start(f, sp, world) {
    const total = sp.damage ?? COMBAT.specialDamage;
    const shares = sp.shares || [0.16, 0.16, 0.18, 0.2, 0.3];
    const parts = splitDamage(total, shares);
    const col = sp.color ?? 0xd01c30;
    let opp = f.opponent;
    let phase = 'intro';
    let t = 0;
    let tl = null;
    const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    const hy = f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).y - f.pos.y;
    const glints = [];

    // ---------------- 1–2: silêncio e postura (curto, mundo parado)
    world.beginCinematic(f, null);
    f.vel.set(0, 0, 0);
    if (opp) f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('idle_arnaldo', { restart: true, blend: 0.05 });
    world.audio.play('heartbeat', { volume: 0.5 });
    world.cameraRig.playShots([
      socketClose(f, hand, { dur: 0.55, dist: 1.0, side: 0.6, fov: 34 }), // a espada e a fita
      faceClose(f, { dur: 0.75, from: 1.7, to: 1.3, side: -0.35, height: hy, fov: 36 }),
    ]);
    const intro = new Timeline();
    intro.add(0.55, () => { f.anim.play('arn_bow', { restart: true, duration: 0.75 }); world.showBanner(sp.banner || sp.name, f.def.color); });
    intro.end(1.3);

    const cleanup = () => { glints.forEach((g) => g.stop()); glints.length = 0; };

    const beginSequence = () => {
      phase = 'cinematic';
      world.beginCinematic(f, opp);
      const yaw = yawTo(f.pos, opp.pos);
      f.yaw = yaw;
      opp.yaw = yawTo(opp.pos, f.pos);
      const F = forwardFromYaw(yaw);
      f.pos.set(opp.pos.x - F.x * 1.2, opp.pos.y, opp.pos.z - F.z * 1.2);
      opp.anim.play('hit', { restart: true });
      world.cameraRig.playShots([
        twoShot(f, opp, { dur: 0.7, dist: 4.0, push: 0.6, side: 1, fov: 42 }),
        overShoulder(opp, f, { dur: 0.6, back: 1.8, side: 0.9, height: 1.7 }),
        lowAngle(f, { dur: 0.6, dist: 3.0, side: 1.6 }),
        orbit(f, { dur: 1.3, radius: 3.6, height: 1.4, a0: 0.4, a1: 2.0, lookH: 1.2, fov: 44 }), // a travessia
        pullBack(f, opp, { dur: 1.3, from: 3.0, to: 7, height: 2.0, side: -1 }),
      ]);
      tl = new Timeline();
      const HITS = [
        { t: 0.05, anim: 'arn_open', dur: 0.32, fx: { roll: 0.05 } },
        { t: 0.42, anim: 'arn_bowcut', dur: 0.36, fx: { roll: 0.9 } },
        { t: 0.82, anim: 'arn_spin', dur: 0.5, fx: { roll: 0.0, wide: true } },
        { t: 1.38, anim: 'arn_lunge', dur: 0.36, fx: { stab: true } },
      ];
      HITS.forEach((h, i) => {
        tl.add(h.t, () => { f.anim.play(h.anim, { restart: true, duration: h.dur, blend: 0.04 }); world.audio.play('blade', { volume: 0.8 }); });
        tl.add(h.t + h.dur * 0.45, () => {
          applyHit(world, f, opp, { damage: parts[i], kind: 'special', reaction: false, ignoreInvuln: true, sound: 'bladeHit', color: col, scale: 1.3 });
          const p = opp.chestPos();
          if (h.fx.stab) world.fx.ring(p, { color: 0xffffff, radius: 1.4, life: 0.25, vertical: true, yaw: f.yaw });
          else world.fx.slash(p, f.yaw, { color: col, radius: h.fx.wide ? 2.4 : 1.8, roll: h.fx.roll, life: 0.3, width: 0.4 });
          world.fx.burst(p, { count: 14, color: col, speed: 4, life: 0.35, size: 0.16 });
          if (opp.state !== 'ko') opp.anim.play('hit', { restart: true, blend: 0.02 });
          const F2 = forwardFromYaw(f.yaw);
          opp.pos.addScaledVector(F2, 0.14);
          f.pos.addScaledVector(F2, 0.12);
        });
      });
      // 5: atravessa o adversário e para de costas para ele, a espada estendida — silêncio
      tl.add(1.95, () => {
        const F2 = forwardFromYaw(f.yaw);
        world.fx.slash(opp.chestPos(), f.yaw, { color: 0xffffff, radius: 2.6, roll: 0.0, life: 0.2, width: 0.6 });
        f.pos.set(opp.pos.x + F2.x * 2.4, f.pos.y, opp.pos.z + F2.z * 2.4);
        f.anim.play('arn_final', { restart: true, duration: 0.62 });
        world.audio.play('slashFinal', { volume: 1 });
        world.hitstop && world.hitstop(0.06);
        if (opp.state !== 'ko') opp.anim.play('stagger', { restart: true });
      });
      tl.add(2.55, () => { f.anim.play('arn_bow', { restart: true, duration: 0.9 }); }); // ainda de costas, a reverência
      // ...e o impacto chega
      tl.add(2.95, () => {
        const p = opp.chestPos();
        applyHit(world, f, opp, { damage: parts[4], kind: 'special', reaction: false, ignoreInvuln: true, sound: 'heavyPunch', color: col, scale: 2.4 });
        world.fx.slash(p, f.yaw + Math.PI, { color: col, radius: 2.8, roll: 0.8, life: 0.45, width: 0.7 });
        world.fx.slash(p, f.yaw + Math.PI, { color: 0xffffff, radius: 2.4, roll: -0.8, life: 0.4, width: 0.5 });
        world.fx.burst(p, { count: 50, color: col, speed: 8, life: 0.6, size: 0.24 });
        world.cameraRig.shake(0.6, 0.35);
        world.audio.play('explosion', { volume: 0.6, pitch: 1.6 });
      });
      tl.end(3.5);
    };

    return {
      update(dt) {
        t += dt;
        if (phase === 'intro') {
          if (intro.update(dt)) {
            world.endCinematic();
            phase = 'dash';
            t = 0;
            f.anim.play('dash', { restart: true });
            world.audio.play('blink', { volume: 0.6 });
          }
          return false;
        }
        if (phase === 'dash') {
          opp = f.opponent;
          if (!opp || opp.state === 'ko') { cleanup(); return true; }
          f.yaw = yawTo(f.pos, opp.pos);
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * (sp.speed ?? 22);
          f.vel.z = F.z * (sp.speed ?? 22);
          world.fx.burst(f.chestPos(), { count: 2, color: col, speed: 1, life: 0.3, size: 0.3 });
          const reachable = Math.abs(opp.pos.y - f.pos.y) < 1.8 && opp.visible;
          if (distXZ(f.pos, opp.pos) <= (sp.contact ?? 2.0) && reachable) {
            f.vel.set(0, 0, 0);
            if (opp.isInvulnerable()) { phase = 'whiff'; t = 0; f.anim.play('arn_bow', { restart: true, duration: 0.6 }); return false; }
            if (trySpecialBlock(world, f, opp, sp)) { cleanup(); return true; }
            beginSequence();
            return false;
          }
          if (t >= (sp.maxDash ?? 0.55)) { f.vel.set(0, 0, 0); phase = 'whiff'; t = 0; f.anim.play('idle', { restart: true }); }
          return false;
        }
        if (phase === 'whiff') {
          // errou: fica parado e aberto um instante (sem a cena)
          if (t >= 0.55) { cleanup(); return true; }
          return false;
        }
        if (phase === 'cinematic') {
          const done = tl.update(dt);
          if (done) {
            cleanup();
            world.endCinematic();
            if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw + Math.PI), knockback: 9, hitstun: COMBAT.launchHitstun, launch: true });
            f.yaw = yawTo(f.pos, opp.pos);
            f.anim.play('idle_arnaldo', { blend: 0.2 });
            return true;
          }
          return false;
        }
        return true;
      },
      cancel() {
        cleanup();
        if (phase === 'intro' || phase === 'cinematic') world.endCinematic();
      },
    };
  },
};
