import * as THREE from 'three';
import { Timeline, yawTo, forwardFromYaw } from '../../core/util.js';
import { SphinxGhoul } from '../beasts.js';
import { findFreeSpotNear } from '../positioning.js';

// Especial CARNIÇAL DA ESFINGE (Nubi). Cânone (Calamidade ep. 10): o ritual marcado na cabeça de chacal da bengala; o
// Lodo Preto sai dos olhos e da boca dela, escorre, forma uma poça enorme e dela sobe a criatura. Formação em etapas
// visíveis: (1) a bengala finca e o ritual brilha, (2) o Lodo escorre do rosto, (3) a poça cresce, (4) a Esfinge sobe.
// A criatura é um NPC de verdade (combat/beasts.js → SphinxGhoul): barra de vida própria, ataca só o adversário, tempo
// limitado; some (volta a ser Lodo) quando morre, quando o tempo acaba, no KO da Nubi ou no fim do round.
export const sphinx = {
  canStart(f, sp, world) {
    return !world.npcs.some((n) => n.isSphinx && n.alive);
  },

  start(f, sp, world) {
    const tl = new Timeline();
    const opp = f.opponent;
    f.vel.set(0, 0, 0);
    if (opp) f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('charge', { restart: true, duration: 1.7 });
    world.audio.play('ritual', { pitch: 0.6 });
    const F = forwardFromYaw(f.yaw, new THREE.Vector3());
    const want = f.pos.clone().addScaledVector(F, 2.4);
    const spot = findFreeSpotNear(world.arena, want.x, want.z, { radius: 0.9, others: opp ? [{ x: opp.pos.x, z: opp.pos.z, r: 1.0 }] : [] }) || { x: want.x, z: want.z };
    // (2) o Lodo escorre dos olhos e da boca
    const head = () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3());
    let drip = null;
    // (3) a poça cresce do pé dela até o ponto onde a criatura sobe
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x07060a, transparent: true, opacity: 0.9, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(f.pos.x, 0.035, f.pos.z);
    pool.scale.setScalar(0.01);
    let poolT = -1;
    const cleanup = () => {
      if (drip) { drip.stop(); drip = null; }
      if (pool.parent) { world.scene.remove(pool); pool.geometry.dispose(); pool.material.dispose(); }
    };
    tl.add(0.1, () => {
      // (1) o ritual na cabeça de chacal da bengala
      world.fx.flash(f.rig.sockets.handR ? f.rig.sockets.handR.getWorldPosition(new THREE.Vector3()) : f.chestPos(), { color: 0xd8b04a, size: 0.8, life: 0.4 });
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.05, f.pos.z), { color: 0x2a2030, radius: 1.4, life: 0.7, inner: 0.7 });
    });
    tl.add(0.3, () => {
      world.showBanner(sp.banner || 'Carniçal da Esfinge', f.def.color);
      drip = world.fx.emitter({ rate: 90, follow: head, particle: { color: 0x0a080c, kind: 'smoke', speed: 0.3, up: -1.6, spread: 0.12, life: 0.8, size: 0.24, gravity: 4 } });
      world.scene.add(pool);
      poolT = 0;
    });
    tl.add(1.15, () => {
      // (4) a criatura sobe da poça
      world.addNpc(new SphinxGhoul(f, world, new THREE.Vector3(spot.x, 0, spot.z), { duration: sp.duration, hp: sp.hp }));
      world.cameraRig.shake(0.45, 0.4);
      world.audio.play('fearGaze', { pitch: 0.55 });
    });
    tl.add(1.6, () => { if (drip) { drip.stop(); drip = null; } f.anim.play('idle', { blend: 0.25 }); });
    tl.end(1.7);
    return {
      update(dt) {
        const done = tl.update(dt);
        if (poolT >= 0 && pool.parent) {
          // a poça corre do pé dela até o ponto da criatura e cresce; depois de a criatura subir, fica com ela
          poolT += dt;
          const k = Math.min(1, poolT / 0.85);
          pool.position.set(f.pos.x + (spot.x - f.pos.x) * k, 0.035, f.pos.z + (spot.z - f.pos.z) * k);
          pool.scale.setScalar(0.4 + k * 1.6);
          if (poolT > 1.3) pool.material.opacity = Math.max(0, 0.9 - (poolT - 1.3) * 2);
          if (poolT > 1.8) cleanup();
        }
        if (done && pool.parent) {
          // o especial terminou: a poça ainda some sozinha num ticker (sem objeto órfão)
          world.addTicker({ update: (d) => { poolT += d; pool.material.opacity = Math.max(0, 0.9 - (poolT - 1.3) * 2); return poolT > 1.8; }, dispose: cleanup });
        }
        return done;
      },
      cancel: cleanup,
    };
  },
};
