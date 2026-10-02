import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose, orbit } from '../../camera/shots.js';
import { transform } from '../forms.js';

// RENASCIMENTO (Juan, fim de Hexatombe): o TRONO DO DIABO (Relíquia de Sangue) sobe do chão atrás dele — encosto de
// carne com a Coroa de Espinhos dourada e "asas" de braços vermelhos. Juan senta e aceita o novo começo: vira O
// PORTADOR DO TRONO de forma definitiva — O DIABO (sp.form) até o fim do round (sp.duration 0 = sem tempo) com
// sp.bonusHealth de vida a mais. Uma vez por partida (usesPerMatch).
export const devilPact = {
  canStart: (f) => !f.baseForm,
  blockMsg: 'JÁ TRANSFORMADO',
  start(f, sp, world) {
    const tl = new Timeline();
    world.beginCinematic(f, null);
    f.vel.set(0, 0, 0);
    f.anim.play('concentrate', { restart: true, duration: 1.4 });
    world.cameraRig.playShots([
      faceClose(f, { dur: 0.8, from: 2.0, to: 1.2, side: -0.3 }),
      orbit(f, { dur: 1.6, radius: 6.4, height: 2.8, a0: 0.5, a1: -0.4, lookH: 2.0 }),
    ]);
    world.audio.play('descarnar', { volume: 0.8, pitch: 0.8 });
    // o trono nasce atrás do Juan, de frente para a arena
    const throne = buildThrone();
    throne.position.set(f.pos.x - Math.sin(f.yaw) * 0.9, -4.2, f.pos.z - Math.cos(f.yaw) * 0.9);
    throne.rotation.y = f.yaw;
    world.scene.add(throne);
    let t = 0;
    const blood = world.fx.emitter({
      rate: 60,
      follow: () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 3, 0.1, f.pos.z + (Math.random() - 0.5) * 3),
      particle: { color: 0x9a0010, speed: 1.2, up: 3, spread: 0.3, life: 0.7, size: 0.18, gravity: 6 },
    });
    // depois da transformação o trono afunda de volta no sangue (ticker: só roda fora da cinemática)
    const sinkThrone = () => {
      world.addTicker({
        update(dt) {
          throne.position.y -= dt * 3.5;
          throne.userData.halo.rotation.z += dt * 0.6;
          return throne.position.y < -4.5;
        },
        dispose() {
          world.scene.remove(throne);
          throne.traverse((o) => { o.geometry && o.geometry.dispose(); });
          for (const m of throne.userData.mats) m.dispose();
        },
      });
    };
    tl.add(0.3, () => {
      world.fx.burst(f.chestPos(), { count: 24, color: 0x9a0010, speed: 2.5, life: 0.5, size: 0.16, gravity: 7 });
      world.showBanner(sp.banner || 'Renascimento', f.def.color);
    });
    tl.add(1.1, () => {
      world.fx.burst(new THREE.Vector3(f.pos.x, 2.6, f.pos.z), { count: 30, color: 0xd8a840, speed: 3, life: 0.6, size: 0.12, gravity: 1 });
      f.anim.play('rebirth', { restart: true, duration: 0.9 });
    });
    tl.add(1.9, () => {
      blood.stop();
      // a transformação troca o kit e encerra este especial: fecha a cinemática ANTES (senão o mundo fica parado nela)
      world.endCinematic();
      world.fx.burst(new THREE.Vector3(f.pos.x, 1.2, f.pos.z), { count: 80, color: 0x9a0010, speed: 6, up: 2, life: 0.8, size: 0.24, gravity: 5 });
      world.cameraRig.shake(0.7, 0.5);
      world.screenFlash && world.screenFlash('#7a0010', 0.25);
      transform(f, sp.form, { duration: sp.duration || 0, health: f.health + sp.bonusHealth, bonusHealth: sp.bonusHealth, banner: 'O Portador do Trono' });
      f.invuln = Math.max(f.invuln, 1.0);
      f.energy = Math.max(f.energy, 50);
      sinkThrone();
    });
    tl.end(1.9);
    let sunk = false;
    return {
      update: (dt) => {
        t += dt;
        throne.position.y = Math.min(0, -4.2 + t * 5.5);
        throne.userData.halo.rotation.z += dt * 0.6;
        const done = tl.update(dt);
        if (done) world.endCinematic();
        return done;
      },
      cancel: () => {
        blood.stop();
        world.endCinematic();
        if (!sunk) { sunk = true; if (!f.baseForm) sinkThrone(); }
      },
    };
  },
};

// O Trono do Diabo: degraus escuros, assento e encosto de carne viva, a Coroa de Espinhos dourada girando atrás e as
// asas de braços vermelhos abertas dos dois lados, terminando em mãos
export function buildThrone() {
  const g = new THREE.Group();
  const flesh = new THREE.MeshToonMaterial({ color: 0x7a1016 });
  const dark = new THREE.MeshToonMaterial({ color: 0x2a0406 });
  const gold = new THREE.MeshToonMaterial({ color: 0xd8a840, emissive: 0x4a2c00 });
  g.userData.mats = [flesh, dark, gold];
  for (let i = 0; i < 3; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.8 - i * 0.5, 0.2, 1.8 - i * 0.35), dark);
    step.position.set(0, 0.1 + i * 0.2, 0.15 - i * 0.12);
    g.add(step);
  }
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.95), flesh);
  seat.position.set(0, 0.82, -0.15);
  g.add(seat);
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.4, 0.3), flesh);
  backrest.position.set(0, 2.0, -0.62);
  g.add(backrest);
  for (const s of [1, -1]) {
    const armrest = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.25, 0.95), flesh);
    armrest.position.set(s * 0.68, 1.15, -0.15);
    g.add(armrest);
  }
  // Coroa de Espinhos
  const halo = new THREE.Group();
  halo.position.set(0, 3.4, -0.85);
  halo.add(new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.09, 8, 40), gold));
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const len = 0.7 + (i % 2) * 0.7;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.06, len, 5), gold);
    sp.position.set(Math.cos(a) * (1.5 + len / 2), Math.sin(a) * (1.5 + len / 2), 0);
    sp.rotation.z = a - Math.PI / 2;
    halo.add(sp);
  }
  g.add(halo);
  g.userData.halo = halo;
  // asas de braços
  for (const s of [1, -1]) {
    for (let k = 0; k < 7; k++) {
      const arm = new THREE.Group();
      const len = 1.3 + k * 0.2;
      const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.085, len, 6), flesh);
      limb.position.y = len / 2;
      arm.add(limb);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), flesh);
      hand.scale.set(1, 1.35, 0.55);
      hand.position.y = len + 0.06;
      arm.add(hand);
      arm.position.set(s * 0.5, 2.5 - k * 0.1, -0.7);
      arm.rotation.z = -s * (0.45 + k * 0.18);
      arm.rotation.x = -0.25;
      g.add(arm);
    }
  }
  return g;
}
