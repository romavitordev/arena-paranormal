import * as THREE from 'three';
import { yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { applyHit } from '../damage.js';
import { faceClose, orbit, twoShot } from '../../camera/shots.js';

// ENVELHECIMENTO (Deus da Morte — o especial dele): avança, agarra o adversário PELO PESCOÇO, ergue e o envelhece.
// O alvo muda de aparência (cabelo branco, pele acinzentada, corpo curvado) e fica fraco até o fim do round:
// sp.aged { mult, speedMult } e sem regenerar sanidade. Por ser tão forte: o preparo é visível (dá para esquivar ou
// sair do alcance), só pega de perto, uma vez por round (não pega quem já está envelhecido) e recarga longa.
export const ageGrab = {
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && !opp.findBuff('aged') && distXZ(f.pos, opp.pos) <= (sp.range ?? 7);
  },
  blockMsg: 'O ALVO JÁ ESTÁ ENVELHECIDO OU LONGE',
  start(f, sp, world) {
    const opp = f.opponent;
    const col = sp.color ?? 0x6a6670;
    let t = 0;
    let phase = 'reach';
    let caught = false;
    let done = false;
    const REACH = sp.reach ?? 0.55; // preparo visível: a mão enorme se estende
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('dm_lift', { restart: true, duration: REACH + 0.3 });
    world.audio.play('fearGaze', { volume: 0.9, pitch: 0.5 });
    const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    const aura = world.fx.emitter({ rate: 50, follow: hand, particle: { color: 0x9a948a, kind: 'smoke', speed: 0.4, spread: 0.2, life: 0.6, size: 0.3 } });
    const neck = () => opp.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -0.12, 0));
    const finish = () => { aura.stop(); if (world.cinematic && world.cinematic.actor === f) world.endCinematic(); };
    return {
      update(dt) {
        t += dt;
        if (phase === 'reach') {
          // avança um pouco na direção do alvo durante o preparo
          const F = forwardFromYaw(f.yaw);
          const d = distXZ(f.pos, opp.pos);
          const sp2 = d > 1.8 * (f.size || 1) ? 7 : 0;
          f.vel.x = F.x * sp2;
          f.vel.z = F.z * sp2;
          if (t >= REACH) {
            f.vel.x = 0;
            f.vel.z = 0;
            const close = distXZ(f.pos, opp.pos) - opp.radius <= (sp.grabRange ?? 2.6) * (f.size || 1) * 0.6;
            if (!close || opp.isInvulnerable() || opp.state === 'ko') {
              finish();
              f.notify('ERROU', true);
              phase = 'miss';
              t = 0;
              return false;
            }
            caught = true;
            phase = 'scene';
            t = 0;
            world.beginCinematic(f, opp);
            world.cameraRig.playShots([
              twoShot(f, opp, { dur: 0.8, dist: 4.4, height: 2.2, push: 0.4, side: 1, lookH: 2 }),
              faceClose(opp, { dur: 1.2, from: 1.8, to: 1.1, side: 0.3, height: 1.4 }),
              orbit(f, { dur: 1.0, radius: 5, height: 2.4, a0: 0.6, a1: 1.6, lookH: 1.8 }),
            ]);
            world.showBanner(sp.banner || sp.name, f.def.color);
            world.audio.play('drain', { volume: 1.1, pitch: 0.45 });
          }
          return false;
        }
        if (phase === 'miss') return t >= 0.4;
        // a cena: pelo pescoço, erguido, a vida escorre do corpo
        const F = forwardFromYaw(f.yaw);
        const lift = Math.min(1, t / 0.4) * 1.1;
        opp.pos.set(f.pos.x + F.x * 1.5 * (f.size || 1), lift, f.pos.z + F.z * 1.5 * (f.size || 1));
        opp.vel.set(0, 0, 0);
        opp.yaw = yawTo(opp.pos, f.pos);
        if (t < 0.05) opp.anim.play('hit', { restart: true });
        if (Math.random() < 0.6) world.fx.burst(neck(), { count: 2, color: 0x9a948a, kind: 'smoke', speed: 0.6, up: 1, life: 0.8, size: 0.35 });
        if (Math.random() < 0.4) world.fx.burst(opp.chestPos(), { count: 1, color: 0xd8d0c0, speed: 0.4, up: 0.6, life: 0.6, size: 0.08 });
        if (!done && t >= 1.6) {
          done = true;
          world.fx.distort(opp.chestPos(), { color: 0x6a6670, radius: 2.5, life: 0.6 });
          world.fx.burst(opp.chestPos(), { count: 50, color: 0x8a8478, kind: 'smoke', speed: 3, life: 1, size: 0.6, grow: 1 });
          world.cameraRig.shake(0.5, 0.3);
          ageVictim(world, opp, sp);
        }
        if (t >= 2.8) {
          finish();
          opp.pos.y = 0;
          applyHit(world, f, opp, { damage: sp.damage ?? 150, kind: 'special', element: 'morte', knockback: 4, hitstun: 0.6, launch: true, lowLaunch: true, ignoreInvuln: true, unblockable: true, dir: F.clone(), sound: 'heavyPunch', color: col, scale: 1.8 });
          return true;
        }
        return false;
      },
      cancel() {
        finish();
        if (caught && opp.state !== 'ko') opp.pos.y = 0;
      },
    };
  },
};

// o corpo envelhece: cabelo branco, pele acinzentada, curvado; fraco até o fim do round (o buff some no reset)
export function ageVictim(world, opp, sp) {
  const A = sp.aged || {};
  const changed = [];
  const hairCol = new THREE.Color(0xe8e4dc);
  const oldSkin = new THREE.Color(0xa49c90);
  opp.rig.root.traverse((o) => {
    if (!o.isMesh || !o.material || o.userData.isOutline) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const next = mats.map((m) => {
      const n = (m.name || '').toLowerCase();
      const hair = /hair|cabelo|beard|barba|brow|mustache|bigode|goatee/.test(n);
      const skin = /skin|face|arms|hand|pele|neck/.test(n);
      if (!hair && !skin) return m;
      const c = m.clone();
      if (c.color) {
        if (hair) c.color.copy(hairCol);
        else c.color.lerp(oldSkin, 0.55);
      }
      return c;
    });
    if (next.some((m, i) => m !== mats[i])) {
      changed.push({ o, old: o.material });
      o.material = Array.isArray(o.material) ? next : next[0];
    }
  });
  // curvado: o corpo encolhe e inclina um pouco para a frente
  const body = opp.rig.body;
  const oldScale = body ? body.scale.clone() : null;
  const oldRot = body ? body.rotation.x : 0;
  if (body) { body.scale.set(oldScale.x, oldScale.y * 0.9, oldScale.z); body.rotation.x = oldRot + 0.18; }
  const ash = world.fx.emitter({
    rate: 6,
    follow: () => new THREE.Vector3(opp.pos.x + (Math.random() - 0.5) * 0.6, opp.pos.y + 0.4 + Math.random() * 1.3, opp.pos.z + (Math.random() - 0.5) * 0.6),
    particle: { color: 0x9a948a, kind: 'smoke', speed: 0.2, up: -0.3, spread: 0.2, life: 0.8, size: 0.14 },
  });
  opp.addBuff({
    type: 'aged', name: 'ENVELHECIDO', time: Infinity, duration: Infinity,
    mult: A.mult ?? 0.6, affects: ['melee', 'ranged', 'ability', 'special'], speedMult: A.speedMult ?? 0.7, noRegen: true,
    onEnd() {
      ash.stop();
      for (const { o, old } of changed) {
        const cur = Array.isArray(o.material) ? o.material : [o.material];
        cur.forEach((m, i) => { const prev = Array.isArray(old) ? old[i] : old; if (m !== prev) m.dispose(); });
        o.material = old;
      }
      if (body) { body.scale.copy(oldScale); body.rotation.x = oldRot; }
    },
  });
  opp.notify('ENVELHECIDO ATÉ O FIM DO ROUND', true);
}
