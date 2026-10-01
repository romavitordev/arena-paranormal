import * as THREE from 'three';
import { Timeline, yawTo, forwardFromYaw } from '../../core/util.js';
import { Marionette } from '../npcs.js';
import { findFreeSpotNear } from '../positioning.js';

// Especial INVOCAÇÃO: A MARIONETE (Dante). Não é só um efeito: invoca um NPC real (combat/npcs.js)
// com vida, IA e ataques próprios, que fica no campo por tempo limitado. Recarga longa.
export const marionette = {
  canStart(f, sp, world) {
    return !world.npcs.some((n) => n.isMarionette && n.alive);
  },

  start(f, sp, world) {
    const tl = new Timeline();
    const opp = f.opponent;
    f.vel.set(0, 0, 0);
    if (opp) f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('concentrate', { restart: true, duration: 1.0 });
    world.audio.play('ritual', { pitch: 0.7 });
    // o Lodo Preto escorre dos olhos e da boca e forma uma poça à frente
    const head = () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3());
    const drip = world.fx.emitter({ rate: 70, follow: head, particle: { color: 0x0a080c, kind: 'smoke', speed: 0.3, up: -1.4, spread: 0.15, life: 0.7, size: 0.25, gravity: 3 } });
    const F = forwardFromYaw(f.yaw, new THREE.Vector3());
    const want = f.pos.clone().addScaledVector(F, 1.8);
    const spot = findFreeSpotNear(world.arena, want.x, want.z, { radius: 0.6, others: opp ? [{ x: opp.pos.x, z: opp.pos.z, r: 0.8 }] : [] }) || { x: want.x, z: want.z };
    tl.add(0.25, () => world.showBanner(sp.banner || 'A Marionete!', f.def.color));
    tl.add(0.45, () => {
      world.addNpc(new Marionette(f, world, new THREE.Vector3(spot.x, 0, spot.z), { duration: sp.duration, hp: sp.hp }));
      world.cameraRig.shake(0.35, 0.3);
      world.audio.play('fearGaze');
    });
    tl.add(1.0, () => { drip.stop(); f.anim.play('idle', { blend: 0.2 }); });
    tl.end(1.05);
    return { update: (dt) => tl.update(dt), cancel: () => drip.stop() };
  },
};
