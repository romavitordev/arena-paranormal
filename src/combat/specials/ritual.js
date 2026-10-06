import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { faceClose, twoShot, orbit, pullBack } from '../../camera/shots.js';

// Especial do tipo ritual à distância (Aghata — DESCARNAR):
// encara, concentra-se, energia vermelha percorre o corpo, estende a mão e
// vários cortes surgem ao mesmo tempo no corpo do inimigo.
// Mecanicamente: 250 de dano (padrão), sem hitkill.
const BODY = ['hd', 'sp', 'sL', 'sR', 'eL', 'eR', 'lL', 'lR', 'kL', 'kR', 'sp', 'hd'];

export const ritual = {
  // aviso: ergue o braço e o sigilo de Sangue pulsa no chão do alvo
  telegraph: () => ({ time: 0.85, anim: 'cast_up', animDuration: 0.85, mark: 'sigil' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 20);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    const total = sp.damage ?? COMBAT.specialDamage;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const waves = sp.waves || [{ t: 2.1, cuts: 6, share: 0.45 }, { t: 2.55, cuts: 6, share: 0.55, final: true }];
    const parts = splitDamage(total, waves.map((w) => w.share));
    world.beginCinematic(f, opp);
    const tl = new Timeline();
    const color = sp.color;
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('idle', { restart: true });
    world.audio.play('ritual');
    world.cameraRig.playShots([
      twoShot(f, opp, { dur: 0.6, dist: 5, push: 0.5, height: 1.6, side: 1 }),
      faceClose(f, { dur: 1.0, from: 1.6, to: 1.05, side: 0.3 }),
      orbit(f, { dur: 0.5, radius: 2.6, height: 1.3, a0: -0.8, a1: -0.3 }),
      faceClose(opp, { dur: 0.6, from: 3.4, to: 2.8, side: -0.9, height: 1.3, fov: 44 }),
      orbit(opp, { dur: 0.7, radius: 3.2, height: 1.3, a0: 0.6, a1: 1.4, lookH: 1.0, fov: 46 }),
      pullBack(f, opp, { dur: 1.2, from: 4, to: 8, height: 2.4, side: -1 }),
    ]);

    // 1–2: encara e concentra-se (cabeça baixa, olhos fechados)
    tl.add(0.6, () => f.anim.play('concentrate', { restart: true }));
    // 3: energia vermelha percorre o corpo
    let body = null;
    tl.add(0.75, () => {
      f.glowTint = { color, base: 0.25 };
      body = world.fx.emitter({
        rate: 90,
        follow: () => {
          const j = f.rig.joints[BODY[Math.floor(Math.random() * BODY.length)]];
          return j.getWorldPosition(new THREE.Vector3());
        },
        particle: { color, speed: 1, spread: 0.5, up: 0.6, life: 0.5, size: 0.2 },
      });
    });
    // 4: estende a mão
    let hand = null;
    tl.add(1.6, () => {
      f.anim.play('point', { restart: true, duration: 0.4 });
      hand = world.fx.emitter({ rate: 120, follow: () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3()), particle: { color, speed: 1.6, spread: 0.6, life: 0.35, size: 0.25 } });
      world.audio.play('heartbeat');
    });
    tl.add(1.75, () => world.showBanner(sp.banner || f.def.name, f.def.color));
    // 5–7: o ritual atinge o alvo, cortes simultâneos em várias partes do corpo
    waves.forEach((w, wi) => {
      tl.add(w.t, () => {
        const handPos = f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
        world.fx.tracer(handPos, opp.chestPos(), { color, life: 0.2, width: 0.05 });
        for (let i = 0; i < w.cuts; i++) {
          const j = opp.rig.joints[BODY[(i * 5 + wi * 3) % BODY.length]];
          world.fx.cutMark(j, { color, life: 2.2, size: 0.3 + Math.random() * 0.15 });
          world.fx.burst(j.getWorldPosition(new THREE.Vector3()), { count: 10, color, speed: 4, life: 0.5, size: 0.2, gravity: 6 });
        }
        world.audio.play('descarnar');
        world.fx.flash(opp.chestPos(), { color, size: 1.6, life: 0.12 });
        applyHit(world, f, opp, { damage: parts[wi], kind: 'special', reaction: false, ignoreInvuln: true, sound: 'bladeHit', color, scale: w.final ? 2 : 1.2 });
        if (opp.state !== 'ko') opp.anim.play(w.final ? 'stagger' : 'hit', { restart: true });
        if (w.final) world.cameraRig.shake(0.5, 0.3);
      });
    });
    const end = waves[waves.length - 1].t + 1.0;
    tl.end(end);
    const cleanup = () => {
      body && body.stop();
      hand && hand.stop();
      f.glowTint = null;
    };
    return {
      update(dt) {
        const done = tl.update(dt);
        if (done) {
          cleanup();
          world.endCinematic();
          if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback: 3, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
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
