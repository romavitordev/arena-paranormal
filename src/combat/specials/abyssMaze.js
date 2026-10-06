import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { faceClose, orbit, pullBack, lowAngle } from '../../camera/shots.js';

// Especial do Labirinto — "O LABIRINTO É A RESPOSTA" (cinemático):
//  1. põe o capacete do sorriso (close);
//  2. muros de labirinto sobem do chão em volta da vítima, que anda perdida lá dentro;
//  3. a Antena dispara raios da Tempestade Caótica; o último derruba tudo.
// Mecanicamente: 250 de dano (padrão) dividido entre os raios, sem hitkill.
function buildMaze(center, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x3a4030, roughness: 0.9, emissive: color, emissiveIntensity: 0.15 });
  const glow = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
  const walls = [];
  // três anéis de muros com aberturas desencontradas (como um labirinto circular)
  [1.6, 2.6, 3.6].forEach((r, ring) => {
    const n = 10 + ring * 4;
    for (let i = 0; i < n; i++) {
      if ((i + ring * 3) % 5 === 0) continue; // passagem
      const a0 = (i / n) * Math.PI * 2;
      const len = (Math.PI * 2 * r) / n;
      const w = new THREE.Mesh(new THREE.BoxGeometry(len * 0.96, 1.6, 0.18), mat);
      w.position.set(Math.sin(a0) * r, -1.6, Math.cos(a0) * r);
      w.rotation.y = a0; // tangente ao anel (o comprimento da caixa segue a volta)
      const line = new THREE.Mesh(new THREE.BoxGeometry(len * 0.96, 0.05, 0.2), glow);
      line.position.y = 0.8;
      w.add(line);
      g.add(w);
      walls.push({ m: w, delay: ring * 0.12 + Math.random() * 0.15 });
    }
  });
  g.position.copy(center).setY(0);
  return { g, walls, mat, glow };
}

export const abyssMaze = {
  telegraph: () => ({ time: 0.85, anim: 'cast_up', animDuration: 0.85, mark: 'sigil' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 20);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    const total = sp.damage ?? COMBAT.specialDamage;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const bolts = sp.bolts || [{ t: 1.9, share: 0.2 }, { t: 2.35, share: 0.2 }, { t: 2.8, share: 0.2 }, { t: 3.4, share: 0.4, final: true }];
    const parts = splitDamage(total, bolts.map((b) => b.share));
    const color = sp.color;
    world.beginCinematic(f, opp);
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    const center = opp.pos.clone();
    const maze = buildMaze(center, color);
    world.scene.add(maze.g);
    world.cameraRig.playShots([
      faceClose(f, { dur: 0.8, from: 1.9, to: 1.25, side: 0.4 }),
      orbit(opp, { dur: 1.2, radius: 5.5, height: 4.5, a0: -0.8, a1: 0.4, lookH: 0.6, fov: 50 }),
      lowAngle(f, { dur: 0.6, dist: 2.4, side: 1.2 }),
      pullBack(f, opp, { dur: 1.8, from: 6, to: 11, height: 4, side: -1 }),
    ]);
    world.audio.play('maskOn', { pitch: 0.8 });
    f.anim.play('concentrate', { restart: true, duration: 0.7 });
    // o capacete NÃO aparece aqui: para os Mascarados a máscara é só da Transformação (forma labirinto_elmo)
    tl.add(0.35, () => { world.fx.flash(f.chestPos().add(new THREE.Vector3(0, 0.6, 0)), { color, size: 1.6, life: 0.15 }); });
    tl.add(0.6, () => world.showBanner(sp.banner || f.def.name, f.def.color));
    tl.add(0.8, () => { world.audio.play('ritual'); opp.anim.play('fear', { restart: true }); });
    // a vítima vagueia perdida dentro do labirinto
    let wander = 0;
    tl.each((t, dt) => {
      if (t < 0.8 || t > bolts[bolts.length - 1].t) return;
      wander += dt;
      const a = Math.sin(wander * 1.7) * 2 + wander;
      opp.pos.x = center.x + Math.sin(a) * 0.5;
      opp.pos.z = center.z + Math.cos(a) * 0.5;
      opp.yaw = a + Math.PI / 2;
      for (const w of maze.walls) {
        const k = Math.min(1, Math.max(0, (t - 0.8 - w.delay) / 0.35));
        w.m.position.y = -1.6 + 2.4 * (1 - (1 - k) ** 3);
      }
    });
    bolts.forEach((b, i) => {
      tl.add(b.t - 0.15, () => f.anim.play('point', { restart: true, duration: 0.3 }));
      tl.add(b.t, () => {
        const from = f.rig.sockets.handR.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.6, 0));
        const to = opp.chestPos();
        for (let k = 0; k < (b.final ? 7 : 3); k++) world.fx.lightning(from, to.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4)), { color, life: b.final ? 0.35 : 0.18 });
        // raio do céu também, no último
        if (b.final) for (let k = 0; k < 4; k++) world.fx.lightning(to.clone().add(new THREE.Vector3(0, 9, 0)), to, { color: 0xffffff, life: 0.3 });
        world.fx.flash(to, { color, size: b.final ? 6 : 2.4, life: b.final ? 0.3 : 0.15 });
        world.fx.burst(to, { count: b.final ? 70 : 24, color, speed: b.final ? 11 : 6, life: 0.5, size: 0.25 });
        world.audio.play(b.final ? 'explosion' : 'shockwave', { volume: b.final ? 1.2 : 0.8 });
        applyHit(world, f, opp, { damage: parts[i], kind: 'special', reaction: false, ignoreInvuln: true, color, sound: 'impact', scale: b.final ? 2.2 : 1.2 });
        if (opp.state !== 'ko') opp.anim.play(b.final ? 'launched' : 'hit', { restart: true });
        world.cameraRig.shake(b.final ? 0.7 : 0.25, b.final ? 0.4 : 0.15);
        if (b.final) {
          // os muros desabam
          for (const w of maze.walls) w.fall = Math.random() * 0.3;
        }
      });
    });
    const end = bolts[bolts.length - 1].t + 1.1;
    tl.end(end);
    let fallT = 0;
    const cleanup = () => {
      world.scene.remove(maze.g);
      maze.g.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      maze.mat.dispose();
      maze.glow.dispose();
    };
    return {
      update(dt) {
        const done = tl.update(dt);
        if (maze.walls[0] && maze.walls[0].fall !== undefined) {
          fallT += dt;
          for (const w of maze.walls) if (fallT > w.fall) { w.m.position.y -= dt * 5; w.m.rotation.z += dt * 2; }
        }
        if (done) {
          cleanup();
          world.endCinematic();
          if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(yawTo(f.pos, opp.pos)), knockback: 4, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
          f.anim.play('idle', { blend: 0.2 });
        }
        return done;
      },
      cancel() {
        cleanup();
        world.endCinematic();
      },
    };
  },
};
