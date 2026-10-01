import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { faceClose, twoShot, orbit, pullBack } from '../../camera/shots.js';

// Especial da Erin — KABOOM!: salta para trás e arremessa as granadas que ela mesma fez
// (Supernova, Nebulosa, Sakura). Cada uma explode no alvo e a última leva tudo junto.
// Mecanicamente: 250 de dano (padrão) dividido entre as explosões, sem hitkill.
function grenadeMesh(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3a4a2a, roughness: 0.6 }));
  body.scale.set(1, 1.2, 1);
  g.add(body);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 6, 14), new THREE.MeshBasicMaterial({ color }));
  band.rotation.x = Math.PI / 2;
  g.add(band);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffd060 }));
  spark.position.y = 0.2;
  g.add(spark);
  return g;
}

export const kaboom = {
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 18);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    const total = sp.damage ?? COMBAT.specialDamage;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const throws = sp.grenades || [
      { t: 0.75, color: 0xff3050, share: 0.25, name: 'SUPERNOVA' },
      { t: 1.1, color: 0x7ad0ff, share: 0.25, name: 'NEBULOSA' },
      { t: 1.45, color: 0xff9ad0, share: 0.5, name: 'SAKURA', final: true },
    ];
    const parts = splitDamage(total, throws.map((g) => g.share));
    world.beginCinematic(f, opp);
    const tl = new Timeline();
    const flying = [];
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    // recua um pouco (abre espaço para as granadas)
    const F = forwardFromYaw(f.yaw);
    const from = f.pos.clone();
    const back = from.clone().addScaledVector(F, -1.6);
    world.cameraRig.playShots([
      faceClose(f, { dur: 0.7, from: 1.7, to: 1.15, side: 0.35 }),
      twoShot(f, opp, { dur: 0.9, dist: 5.2, push: 0.6, height: 1.6, side: 1 }),
      orbit(opp, { dur: 0.9, radius: 3.6, height: 1.4, a0: 0.5, a1: 1.3, lookH: 1.0, fov: 48 }),
      pullBack(f, opp, { dur: 1.4, from: 5, to: 10, height: 3, side: -1 }),
    ]);
    world.audio.play('grenadePin');
    tl.add(0.05, () => f.anim.play('dodge', { restart: true, duration: 0.45 }));
    tl.add(0.35, () => world.showBanner(sp.banner || f.def.name, f.def.color));
    throws.forEach((g, i) => {
      tl.add(g.t - 0.2, () => {
        f.anim.play('throw_r', { restart: true, duration: 0.35 });
        world.audio.play('grenadePin', { volume: 0.7 });
      });
      tl.add(g.t, () => {
        const mesh = grenadeMesh(g.color);
        const start = f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
        mesh.position.copy(start);
        world.scene.add(mesh);
        flying.push({ mesh, start, t: 0, dur: 0.5, i, g, landed: false });
        world.audio.play('knifeThrow');
      });
    });
    const explode = (fl) => {
      const g = fl.g;
      const c = opp.chestPos();
      const big = !!g.final;
      world.fx.flash(c, { color: g.color, size: big ? 7 : 3.5, life: big ? 0.3 : 0.18 });
      world.fx.ring(new THREE.Vector3(opp.pos.x, 0.08, opp.pos.z), { color: g.color, radius: big ? 6 : 3, life: 0.5 });
      world.fx.burst(c, { count: big ? 90 : 40, color: 0xff9a30, speed: big ? 14 : 9, up: 2, life: 0.6, size: 0.4 });
      world.fx.burst(c, { count: big ? 40 : 16, color: g.color, speed: big ? 10 : 6, life: 0.6, size: 0.3 });
      world.fx.burst(c, { count: big ? 30 : 12, color: 0x2a2420, kind: 'smoke', speed: 2.5, up: 1.4, life: 1.4, size: big ? 1.8 : 1.1, grow: 1 });
      if (big) world.screenFlash && world.screenFlash('#fff2d0', 0.12);
      world.audio.play('explosion', { volume: big ? 1.3 : 0.9 });
      world.cameraRig.shake(big ? 0.7 : 0.35, big ? 0.4 : 0.22);
      applyHit(world, f, opp, { damage: parts[fl.i], kind: 'special', reaction: false, ignoreInvuln: true, sound: 'heavyPunch', color: g.color, scale: big ? 2.2 : 1.4 });
      if (opp.state !== 'ko') opp.anim.play(big ? 'launched' : 'hit', { restart: true });
      f.notify(g.name + "!", true);
    };
    const end = throws[throws.length - 1].t + 1.4;
    tl.end(end);
    const cleanup = () => {
      for (const fl of flying) world.scene.remove(fl.mesh);
      flying.length = 0;
    };
    return {
      update(dt) {
        // recuo no começo
        const k = Math.min(1, tl.time / 0.4);
        if (tl.time <= 0.45) f.pos.lerpVectors(from, back, k * (2 - k));
        for (const fl of flying) {
          if (fl.landed) continue;
          fl.t += dt;
          const u = Math.min(1, fl.t / fl.dur);
          const to = opp.chestPos();
          fl.mesh.position.lerpVectors(fl.start, to, u);
          fl.mesh.position.y += Math.sin(u * Math.PI) * 1.6;
          fl.mesh.rotation.x += dt * 14;
          if (u >= 1) {
            fl.landed = true;
            world.scene.remove(fl.mesh);
            explode(fl);
          }
        }
        const done = tl.update(dt);
        if (done) {
          cleanup();
          world.endCinematic();
          if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback: 6, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
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
