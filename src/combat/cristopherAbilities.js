import * as THREE from 'three';
import { Timeline, yawTo, forwardFromYaw } from '../core/util.js';
import { ABILITY_TYPES } from './abilities.js';
import { applyHit } from './damage.js';
import { part, glowMat } from '../models/rig.js';

// ------------------------------------------------------------------ CRISTOPHER "CRIS" COHEN (Ordo Realitas, OSNF)
// DIREÇÃO AVANÇADA (wiki): "por ter feito vários filmes de ação, Cristopher tem um talento nato em dirigir e realizava
// várias manobras radicais com o carro". No jogo: ele assobia, o carro dele vem derrapando por trás numa cena de dublê,
// ele se joga para o lado no último instante e o carro atropela quem estiver na frente.
const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });

// o carro: um sedã velho e grandalhão (pintura vinho, faróis acesos), montado em peças simples
export function stuntCar(color = 0x6a1418) {
  const g = new THREE.Group();
  const body = part(new THREE.BoxGeometry(1.9, 0.62, 4.3), color);
  body.position.y = 0.62;
  g.add(body);
  const hood = part(new THREE.BoxGeometry(1.86, 0.18, 1.3), color);
  hood.position.set(0, 0.98, 1.3);
  hood.rotation.x = 0.06;
  g.add(hood);
  const cabin = part(new THREE.BoxGeometry(1.7, 0.56, 2.0), 0x1e2630);
  cabin.position.set(0, 1.18, -0.3);
  g.add(cabin);
  const roof = part(new THREE.BoxGeometry(1.72, 0.08, 1.7), color);
  roof.position.set(0, 1.5, -0.35);
  g.add(roof);
  for (const [x, z] of [[-0.9, 1.35], [0.9, 1.35], [-0.9, -1.35], [0.9, -1.35]]) {
    const w = part(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 14), 0x121214);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.38, z);
    g.add(w);
    const hub = part(new THREE.CylinderGeometry(0.18, 0.18, 0.32, 10), 0xa8a8ae, { outline: false });
    hub.rotation.z = Math.PI / 2;
    hub.position.copy(w.position);
    g.add(hub);
  }
  for (const x of [-0.65, 0.65]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), glowMat(0xfff0b0, 1));
    lamp.position.set(x, 0.72, 2.16);
    g.add(lamp);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.04), glowMat(0xff2010, 0.9));
    tail.position.set(x, 0.75, -2.16);
    g.add(tail);
  }
  const bumper = part(new THREE.BoxGeometry(2.0, 0.18, 0.2), 0x9a9a9e);
  bumper.position.set(0, 0.42, 2.2);
  g.add(bumper);
  return g;
}

Object.assign(ABILITY_TYPES, {
  // △ → □  DIREÇÃO AVANÇADA: o carro vem por trás dele, ele pula para o lado e o carro atropela
  stuntCar: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('point', { restart: true, duration: 0.5 });
      world.audio.play('ready', { volume: 0.9, pitch: 1.6 }); // o assobio
      const F = forwardFromYaw(f.yaw);
      const R = new THREE.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw));
      const start = new THREE.Vector3(f.pos.x - F.x * (a.behind ?? 11), 0, f.pos.z - F.z * (a.behind ?? 11));
      const aim = opp.pos.clone().setY(0);
      const dir = aim.clone().sub(start).setY(0).normalize();
      const car = stuntCar(a.carColor);
      car.position.copy(start);
      car.rotation.y = Math.atan2(dir.x, dir.z);
      let carT = -(a.delay ?? 0.35);
      let hit = false;
      let gone = false;
      let travelled = 0;
      const total = start.distanceTo(aim) + (a.overshoot ?? 10);
      tl.add(a.delay ?? 0.35, () => {
        world.scene.add(car);
        world.audio.play('shockwave', { volume: 0.8, pitch: 0.55 }); // o motor roncando
      });
      // ele se joga para o lado quando o carro chega (a cena de dublê)
      tl.add((a.delay ?? 0.35) + 0.25, () => {
        f.anim.play('dodge', { restart: true, duration: 0.45 });
        f.invuln = Math.max(f.invuln, 0.5);
      });
      tl.each((t) => {
        const t0 = (a.delay ?? 0.35) + 0.25;
        if (t > t0 && t < t0 + 0.3) {
          f.vel.x = R.x * (a.sidestep ?? 2.2) / 0.3;
          f.vel.z = R.z * (a.sidestep ?? 2.2) / 0.3;
        } else { f.vel.x = 0; f.vel.z = 0; }
      });
      world.addTicker({
        update(dt) {
          carT += dt;
          if (carT < 0) return false;
          if (gone) return true;
          const step = (a.speed ?? 26) * dt;
          travelled += step;
          car.position.addScaledVector(dir, step);
          car.rotation.z = Math.sin(carT * 30) * 0.015; // a suspensão tremendo
          if (Math.random() < 0.6) {
            const back = car.position.clone().addScaledVector(dir, -2.2);
            world.fx.burst(new THREE.Vector3(back.x, 0.2, back.z), { count: 2, color: 0x7a7068, kind: 'smoke', speed: 1, up: 0.8, life: 0.6, size: 0.7, grow: 1 });
          }
          // atropelou?
          if (!hit && opp.state !== 'ko' && !opp.isInvulnerable() && opp.pos.y < 1.6) {
            const rel = opp.pos.clone().sub(car.position).setY(0);
            const along = rel.dot(dir);
            const across = Math.abs(rel.x * dir.z - rel.z * dir.x);
            if (Math.abs(along) < 2.3 && across < 1.0 + opp.radius) {
              hit = true;
              applyHit(world, f, opp, {
                damage: a.damage, kind: 'ability', knockback: a.knockback ?? 7, hitstun: 0.9, launch: true, guardCrush: true,
                dir: dir.clone(), sound: 'heavyPunch', scale: 2.2, hitstop: 0.12, color: 0xffd27a,
              });
              world.cameraRig.shake(0.6, 0.35);
              world.fx.burst(opp.chestPos(), { count: 30, color: 0xd8d4cc, speed: 8, life: 0.4, size: 0.18 });
              f.notify(a.label || 'CENA DE AÇÃO!', true);
            }
          }
          // bateu numa parede: o carro capota numa nuvem de fumaça
          const nose = car.position.clone().addScaledVector(dir, 2.2).setY(0.6);
          if (world.arena.blocksPoint(nose, 0.4) || travelled > total) {
            world.fx.play('FX_EXPLOSION', car.position.clone().setY(0.8), { color: 0xffa040, scale: 1.4 });
            world.fx.burst(car.position.clone().setY(1), { count: 30, color: 0x3a3634, kind: 'smoke', speed: 3, up: 2, life: 1.2, size: 1.6, grow: 1 });
            world.audio.play('explosion', { volume: 0.8 });
            gone = true;
            return true;
          }
          return false;
        },
        dispose() { world.scene.remove(car); },
      });
      tl.end((a.delay ?? 0.35) + 0.75);
      return seqFrom(tl, { cancel: () => { f.vel.set(0, 0, 0); } });
    },
  },
});
