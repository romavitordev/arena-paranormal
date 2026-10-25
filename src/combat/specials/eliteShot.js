import * as THREE from 'three';
import { yawTo, distXZ } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { trySpecialBlock } from './common.js';
import { faceClose, overShoulder, socketClose, pullBack } from '../../camera/shots.js';

// SOLO DO ABUTRE (Arthur, Calamidade): as habilidades de atirador do cânone numa cena só —
//   1. Treinado em Furtividade: some numa nuvem de fumaça (esconder-se é ação livre) e reaparece AJOELHADO, mirando;
//   2. Rebirth (Amaldiçoar Arma com Energia): os olhos abrem e os RAIOS ROXOS sobem pelo braço até o rifle, que se cobre
//      de pequenas caveiras;
//   3. Mira de Elite: a câmera vai para a mira — mirar e atirar no mesmo turno;
//   4. Golpe de Sorte: o tiro sai CRÍTICO (a margem de crítico dele é o dobro) e atravessa o alvo com a descarga roxa.
// sp.damage (padrão COMBAT.specialDamage), sp.color (o roxo do Rebirth), sp.critMult (o crítico), sp.showProp/hideProp.
export const eliteShot = {
  telegraph: () => ({ time: 0.8, anim: 'sniper_kneel', animDuration: 0.5, mark: 'laser' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 40);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const color = sp.color ?? 0xa46bff;
    const show = (v) => {
      if (sp.showProp && f.rig.props[sp.showProp]) f.rig.showProp(sp.showProp, v);
      if (sp.hideProp && f.rig.props[sp.hideProp]) f.rig.showProp(sp.hideProp, !v);
    };
    const muzzle = () => (f.rig.muzzle && f.rig.muzzle.parent && f.rig.muzzle.parent.visible ? f.rig.muzzle.getWorldPosition(new THREE.Vector3()) : f.chestPos());
    const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });

    // 1 — some na fumaça
    world.fx.burst(f.chestPos(), { count: 40, color: 0x2a2632, kind: 'smoke', speed: 2.2, life: 0.9, size: 0.9, grow: 1 });
    world.audio.play('blink', { volume: 0.8 });
    f.rig.root.visible = false;
    world.cameraRig.playShots([
      pullBack(f, opp, { dur: 0.55, from: 4, to: 5, height: 2.2 }),
      faceClose(f, { dur: 0.9, from: 1.6, to: 1.15, side: -0.35, height: 1.1 }),
      socketClose(f, () => hand(), { dur: 0.7, dist: 1.1, side: 0.7 }),
      overShoulder(f, opp, { dur: 0.75, back: 1.1, side: 0.45, height: 1.25, fov: 26 }),
    ]);
    let t = 0;
    let fired = false;
    let bolts = 0;
    let done = false;
    world.after(0.3, () => world.showBanner(sp.banner || sp.name, f.def.color));
    return {
      update(dt) {
        t += dt;
        // reaparece ajoelhado, já com o rifle
        if (t >= 0.55 && !f.rig.root.visible) {
          f.rig.root.visible = true;
          show(true);
          f.anim.play('sniper_kneel', { restart: true, duration: 0.4 });
          world.fx.burst(f.chestPos(), { count: 20, color: 0x2a2632, kind: 'smoke', speed: 1.2, life: 0.7, size: 0.7, grow: 1 });
        }
        // 2 — Rebirth: os raios roxos sobem do chão pelo corpo até o rifle (com as caveiras)
        if (t >= 0.9 && t < 2.1 && bolts < 26 && Math.random() < 0.55) {
          bolts++;
          const base = f.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.1, (Math.random() - 0.5) * 0.6));
          world.fx.tracer(base, hand().add(new THREE.Vector3((Math.random() - 0.5) * 0.2, 0, 0)), { color, life: 0.08, width: 0.02 });
          world.fx.burst(muzzle(), { count: 2, color, speed: 0.8, life: 0.35, size: 0.12 });
          if (bolts % 6 === 0) world.audio.play('shockwave', { volume: 0.25, pitch: 1.8 });
        }
        // 3 — a mira se firma
        if (!fired && t >= 2.1 && t < 2.85 && Math.random() < 0.6) world.fx.tracer(muzzle(), opp.chestPos(), { color, life: 0.05, width: 0.006 + (t - 2.1) * 0.012 });
        // 4 — o disparo crítico
        if (!fired && t >= 2.85) {
          fired = true;
          const from = muzzle();
          const to = opp.chestPos();
          f.anim.play('sniper_fire', { restart: true, duration: 0.7 });
          world.audio.play('sniper', { volume: 1.3 });
          world.fx.flash(from, { color, size: 3, life: 0.16 });
          world.fx.tracer(from, to, { color, life: 0.35, width: 0.07 });
          world.fx.tracer(from, to, { color: 0xffffff, life: 0.2, width: 0.025 });
          const base = sp.damage ?? COMBAT.specialDamage;
          applyHit(world, f, opp, { damage: Math.round(base * (sp.critMult ?? 1)), kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, sound: 'heavyPunch', color, scale: 2.4 });
          opp.notify('GOLPE DE SORTE — CRÍTICO!', true);
          world.fx.distort(to, { color, radius: 3, life: 0.5 });
          for (let i = 0; i < 3; i++) world.after(i * 0.08, () => world.fx.ring(to, { color, radius: 0.6 + i * 0.7, life: 0.45, vertical: true, yaw: f.yaw }));
          world.fx.burst(to, { count: 50, color, speed: 6, life: 0.6, size: 0.18 });
          world.cameraRig.shake(0.7, 0.35);
          world.cameraRig.playShots([faceClose(opp, { dur: 1.1, from: 2.4, to: 1.8, side: 0.3, height: 1.4 })]);
          if (opp.state !== 'ko') opp.anim.play('launched', { restart: true });
        }
        if (!done && t >= 2.85 + 1.1) {
          done = true;
          show(false);
          world.endCinematic();
          if (opp.state !== 'ko') opp.react({ dir: new THREE.Vector3().subVectors(opp.pos, f.pos).setY(0).normalize(), knockback: 7, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
          return true;
        }
        return false;
      },
      cancel() {
        f.rig.root.visible = true;
        show(false);
        world.endCinematic();
      },
    };
  },
};
