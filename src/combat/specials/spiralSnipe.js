import * as THREE from 'three';
import { yawTo, distXZ } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { trySpecialBlock } from './common.js';
import { faceClose, overShoulder, pullBack } from '../../camera/shots.js';

// DISPARO ESPIRAL (A Fantasma): o mundo para, ela ajoelha e as faixas puxam o rifle — a bala sai em curva, DÁ A VOLTA
// NA ARENA desenhando uma espiral de Morte no ar (passa por qualquer brecha, como no cânone) e a câmera vai atrás dela
// até atravessar o alvo. Se ele já estava morrendo
// (vida ≤ sp.executeBelow), a espiral termina o serviço (sp.executeMult).
// sp.path 'straight' (Kemi, Disparo da Morte): o tempo desacelera e a bala vai RETA, devagar, com a espiral em volta.
export const spiralSnipe = {
  // aviso: ajoelha e a mira brilha no alvo
  telegraph: () => ({ time: 0.8, anim: 'sniper_kneel', animDuration: 0.5, mark: 'laser' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 40);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const show = (v) => {
      if (sp.showProp && f.rig.props[sp.showProp]) f.rig.showProp(sp.showProp, v);
      if (sp.hideProp && f.rig.props[sp.hideProp]) f.rig.showProp(sp.hideProp, !v);
    };
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    show(true);
    f.anim.play('sniper_kneel', { restart: true, duration: 0.5 });
    world.audio.play('fearGaze', { volume: 0.7, pitch: 0.4 });
    world.cameraRig.playShots([
      faceClose(f, { dur: 0.9, from: 1.9, to: 1.2, side: -0.3, height: 1.1 }),
      overShoulder(f, opp, { dur: 0.9, back: 1.4, side: 0.6, height: 1.3, fov: 34 }),
      pullBack(f, opp, { dur: 1.1, from: 3, to: 7, height: 2.4 }),
    ]);
    const muzzle = () => (f.rig.muzzle && f.rig.muzzle.parent && f.rig.muzzle.parent.visible ? f.rig.muzzle.getWorldPosition(new THREE.Vector3()) : f.chestPos());
    let t = 0;
    let fired = false;
    let hit = false;
    let bullet = null;
    let from = null;
    let path = null; // a volta pela arena (curva) que termina no peito do alvo
    const FLIGHT = sp.flight ?? 1.6;
    const bulletPos = new THREE.Vector3();
    const bulletDir = new THREE.Vector3(0, 0, 1);
    // câmera que persegue a bala (logo atrás e um pouco acima, olhando para onde ela vai)
    const chaseShot = {
      dur: FLIGHT,
      fov: 58,
      pos: () => bulletPos.clone().addScaledVector(bulletDir, -1.4).add(new THREE.Vector3(0, 0.35, 0)),
      look: () => bulletPos.clone().addScaledVector(bulletDir, 2),
    };
    const color = sp.color ?? 0xd8d4dc;
    world.showBanner(sp.banner || sp.name, f.def.color);
    return {
      update(dt) {
        t += dt;
        if (!fired && t < 1.5 && Math.random() < 0.6) {
          // a mira: linha fina que treme e se firma
          world.fx.tracer(muzzle(), opp.chestPos(), { color: 0xd8d4dc, life: 0.05, width: 0.008 + t * 0.01 });
        }
        if (!fired && t >= 1.5) {
          fired = true;
          from = muzzle();
          f.anim.play('sniper_fire', { restart: true, duration: 0.7 });
          world.audio.play('sniper', { volume: 1.2 });
          world.fx.flash(from, { color, size: 2.6, life: 0.14 });
          world.fx.burst(from, { count: 14, color: 0x0a080c, kind: 'smoke', speed: 1.5, life: 0.8, size: 0.5, grow: 1 });
          bullet = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color }));
          world.scene.add(bullet);
          // a volta: sai para um lado, contorna o alvo por trás, volta pelo outro lado e entra no peito dele
          const to = opp.chestPos();
          const fwd = to.clone().sub(from).setY(0).normalize();
          const side = new THREE.Vector3(-fwd.z, 0, fwd.x);
          const dist = Math.max(4, from.distanceTo(to));
          const R = Math.min(8, dist * 0.7 + 2);
          path = sp.path === 'straight' ? new THREE.CatmullRomCurve3([from.clone(), from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 0.25, 0)), to.clone()]) : new THREE.CatmullRomCurve3([
            from.clone(),
            from.clone().addScaledVector(fwd, dist * 0.3).addScaledVector(side, R * 0.8).setY(from.y + 1.6),
            to.clone().addScaledVector(fwd, R * 0.7).addScaledVector(side, R * 0.4).setY(to.y + 2.6),
            to.clone().addScaledVector(fwd, R * 0.4).addScaledVector(side, -R * 0.8).setY(to.y + 1.4),
            to.clone().addScaledVector(fwd, -1.6).addScaledVector(side, -0.6).setY(to.y + 0.2),
            to.clone(),
          ]);
          bulletPos.copy(from);
          world.cameraRig.playShots([chaseShot, faceClose(opp, { dur: 1.2, from: 2.2, to: 1.6, side: 0.3, height: 1.4 })]);
        }
        if (bullet && !hit) {
          const k = Math.min(1, (t - 1.5) / FLIGHT);
          const p = path.getPointAt(k); // getPointAt: velocidade constante ao longo da curva
          const tan = path.getTangentAt(k);
          // o fim da curva segue o alvo de verdade (ele ainda pode estar se mexendo antes da cinemática)
          if (k > 0.9) p.lerp(opp.chestPos(), (k - 0.9) / 0.1);
          // espiral de Morte em volta da trajetória
          const side = new THREE.Vector3().crossVectors(tan, new THREE.Vector3(0, 1, 0)).normalize();
          const up = new THREE.Vector3().crossVectors(side, tan);
          const amp = 0.35 * Math.sin(Math.min(1, k * 1.2) * Math.PI);
          const ang = k * Math.PI * 14;
          p.addScaledVector(side, Math.cos(ang) * amp).addScaledVector(up, Math.sin(ang) * amp);
          bulletPos.copy(p);
          bulletDir.copy(tan);
          bullet.position.copy(p);
          world.fx.burst(p, { count: 3, color: 0x0a080c, kind: 'smoke', speed: 0.2, life: 0.9, size: 0.35 });
          world.fx.burst(p, { count: 1, color, speed: 0.1, life: 0.5, size: 0.12 });
          if (k >= 1) {
            hit = true;
            world.scene.remove(bullet);
            bullet.geometry.dispose();
            bullet.material.dispose();
            bullet = null;
            const base = sp.damage ?? COMBAT.specialDamage;
            const exec = opp.health / opp.maxHealth <= (sp.executeBelow ?? 0) ? sp.executeMult ?? 1 : 1;
            applyHit(world, f, opp, { damage: Math.round(base * exec), kind: 'special', element: 'morte', reaction: false, ignoreInvuln: true, sound: 'heavyPunch', color, scale: 2.2 });
            const c = opp.chestPos();
            world.fx.distort(c, { color: 0xa7a3ad, radius: 3, life: 0.5 });
            for (let i = 0; i < 4; i++) world.after(i * 0.08, () => world.fx.ring(c, { color: 0x1a1620, radius: 0.6 + i * 0.6, life: 0.5, vertical: true, yaw: f.yaw }));
            world.fx.burst(c, { count: 40, color: 0x0a080c, kind: 'smoke', speed: 4, life: 0.9, size: 0.5, grow: 1 });
            world.cameraRig.shake(0.6, 0.35);
            if (exec > 1) opp.notify('ESPIRAL DA MORTE', true);
            if (opp.state !== 'ko') opp.anim.play('launched', { restart: true });
          }
        }
        if (t >= 1.5 + FLIGHT + 1.0) {
          show(false);
          world.endCinematic();
          if (opp.state !== 'ko') opp.stun(0.4, 'stagger');
          return true;
        }
        return false;
      },
      cancel() {
        if (bullet) { world.scene.remove(bullet); bullet = null; }
        show(false);
        world.endCinematic();
      },
    };
  },
};
