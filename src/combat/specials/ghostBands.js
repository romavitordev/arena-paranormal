import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose, orbit } from '../../camera/shots.js';
import { transform } from '../forms.js';

// VESTIR AS FAIXAS (Kemi): as faixas sobem em espiral, enrolam o rosto e o corpo, o sobretudo de couro cai sobre os
// ombros e a escuridão esconde quem ela é — vira A FANTASMA (sp.form) por sp.duration segundos (+sp.bonusHealth).
// No fim volta a ser a Kemi (a vida extra que sobrar se perde).
export const ghostBands = {
  canStart: (f) => !f.baseForm,
  blockMsg: 'JÁ TRANSFORMADA',
  start(f, sp, world) {
    const tl = new Timeline();
    world.beginCinematic(f, null);
    f.vel.set(0, 0, 0);
    f.anim.play('concentrate', { restart: true, duration: 1.6 });
    world.cameraRig.playShots([
      orbit(f, { dur: 0.9, radius: 3.4, height: 1.2, a0: -0.7, a1: 0.2, lookH: 1.0 }),
      faceClose(f, { dur: 0.8, from: 1.8, to: 1.1, side: 0.25 }),
    ]);
    world.audio.play('fearGaze', { volume: 0.6, pitch: 0.7 });
    // faixas: anéis claros que sobem girando em volta dela
    const mat = new THREE.MeshBasicMaterial({ color: 0xd8ccb0, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
    const bands = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.07, 20, 1, true), mat);
      m.userData.phase = i * 0.14;
      world.scene.add(m);
      bands.push(m);
    }
    const lodo = world.fx.emitter({
      rate: 30,
      follow: () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 1.4, 0.2 + Math.random() * 1.6, f.pos.z + (Math.random() - 0.5) * 1.4),
      particle: { color: 0x0a080c, kind: 'smoke', speed: 0.4, up: 0.6, life: 0.8, size: 0.4 },
    });
    let t = 0;
    const cleanup = () => {
      lodo.stop();
      for (const b of bands) world.scene.remove(b);
      bands.forEach((b) => b.geometry.dispose());
      mat.dispose();
      bands.length = 0;
    };
    tl.add(0.3, () => world.showBanner(sp.banner || 'Vestir as Faixas', f.def.color));
    tl.add(1.45, () => {
      cleanup();
      world.endCinematic();
      world.fx.burst(f.chestPos(), { count: 40, color: 0x0a080c, kind: 'smoke', speed: 3, life: 0.8, size: 0.6, grow: 1 });
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: 0xa7a3ad, radius: 2.6, life: 0.5 });
      world.cameraRig.shake(0.35, 0.3);
      transform(f, sp.form, { duration: sp.duration, health: f.health + sp.bonusHealth, bonusHealth: sp.bonusHealth, banner: 'A Fantasma' });
      f.invuln = Math.max(f.invuln, 0.8);
      f.energy = Math.max(f.energy, 40);
    });
    tl.end(1.6);
    return {
      update: (dt) => {
        t += dt;
        // as faixas sobem do pé à cabeça e apertam
        for (const b of bands) {
          const k = Math.min(1, Math.max(0, (t - b.userData.phase) / 0.9));
          b.position.set(f.pos.x, 0.15 + k * 1.55, f.pos.z);
          const r = 1.3 - k * 0.75;
          b.scale.set(r, 1, r);
          b.rotation.y += dt * 9;
          b.rotation.z = Math.sin(t * 6 + b.userData.phase * 10) * 0.2;
        }
        const done = tl.update(dt);
        if (done) world.endCinematic();
        return done;
      },
      cancel: () => { cleanup(); world.endCinematic(); },
    };
  },
};
