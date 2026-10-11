import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage, trySpecialBlock } from './common.js';
import { faceClose, orbit, twoShot, lowAngle } from '../../camera/shots.js';

// TORTURA MENTAL (o Estrangeiro — "O que é pior do que a Dor e a Morte?"). A cena do fim de Sinais do Outro Lado: o
// Xande se sacrifica pelos Cinco e o Estrangeiro NÃO o leva — entra na mente dele, o PARALISA, CONTROLA os movimentos e
// o faz BATER EM SI MESMO; depois apaga as memórias e o derrete com um toque. (Pedido do usuário: "ele o tortura
// fazendo se bater, o paralisa, controla seus movimentos".)
//  1. aviso: o sigilo verde pulsa debaixo do alvo (dá para esquivar);
//  2. COMANDAR: ele ergue a mão e o alvo TRAVA no lugar — fios de sinal verdes ligam a mão dele ao corpo do alvo;
//  3. o alvo é forçado a se BATER três vezes com os próprios golpes;
//  4. forçado a AJOELHAR;
//  5. APAGAR MEMÓRIA: o alvo esquece os rituais (as recargas das habilidades voltam ao máximo) e perde a sanidade;
//  6. TOQUE SUTIL: ele flutua até a vítima, um dedo encosta e ela DERRETE por dentro.
// 250 de dano no total (padrão): os três golpes que o alvo dá em si mesmo e o toque.
export const mindTorture = {
  telegraph: () => ({ time: 0.75, anim: 'point', animDuration: 0.75, mark: 'sigil' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 14);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const col = sp.color ?? 0x7aff4a;
    const total = sp.damage ?? COMBAT.specialDamage;
    const [s1, s2, s3, touch] = splitDamage(total, [0.15, 0.15, 0.15, 0.55]);
    world.beginCinematic(f, opp);
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    opp.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.yaw = yawTo(opp.pos, f.pos);
    const startF = f.pos.clone();
    let approach = 0; // 0→1: flutua até a vítima antes do toque
    let jerk = 0;
    let kneeling = false;

    const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    const J = ['hd', 'eL', 'eR', 'kL', 'kR', 'sp'];
    const joint = (j) => opp.rig.joints[j].getWorldPosition(new THREE.Vector3());
    let threadsOn = false;
    let threadClock = 0;

    world.cameraRig.playShots([
      twoShot(f, opp, { dur: 1.1, dist: 4.6, height: 1.9, push: 0.4, side: 1, lookH: 1.4 }),
      faceClose(opp, { dur: 1.6, from: 1.7, to: 1.2, side: 0.35, height: 1.5 }),
      lowAngle(opp, { dur: 1.0, dist: 3.2, side: -0.6 }),
      orbit(f, { dur: 1.3, radius: 4.2, height: 2.0, a0: 0.4, a1: 1.3, lookH: 1.3 }),
    ]);
    tl.add(0.05, () => {
      world.showBanner(sp.banner || sp.name, f.def.color);
      world.audio.play('fearGaze', { volume: 1, pitch: 0.5 });
      f.anim.play('point', { restart: true, duration: 0.5 });
    });
    // COMANDAR: o alvo trava
    tl.add(0.35, () => {
      threadsOn = true;
      opp.anim.play('stagger', { restart: true });
      world.fx.distort(opp.chestPos(), { color: col, radius: 1.8, life: 0.4 });
      opp.notify('PARALISADO', true);
    });
    // forçado a se BATER: o próprio golpe do alvo, voltado contra ele
    const strikes = (opp.def.melee && opp.def.melee.strikes) || [];
    const selfHit = (i, dmg) => {
      const s = strikes[i % Math.max(1, strikes.length)];
      tl.add(0.75 + i * 0.5, () => {
        jerk = 0.25;
        opp.anim.play(s ? s.anim : 'jab', { restart: true, duration: 0.3 });
        world.audio.play('swing', { volume: 0.5, pitch: 0.8 });
      });
      tl.add(0.75 + i * 0.5 + 0.22, () => {
        const p = joint('hd');
        world.fx.impact(p, 0xffffff, 1.0);
        world.fx.burst(p, { count: 14, color: col, speed: 2.5, life: 0.3, size: 0.12 });
        opp.anim.play('hit', { restart: true });
        opp.notify(i === 0 ? 'FORÇADO A SE BATER' : 'DE NOVO', true);
        applyHit(world, f, opp, { damage: dmg, kind: 'special', element: 'transmissao', reaction: false, ignoreInvuln: true, unblockable: true, color: col, sound: 'heavyPunch', scale: 1.1, pos: p });
      });
    };
    selfHit(0, s1);
    selfHit(1, s2);
    selfHit(2, s3);
    // forçado a AJOELHAR
    tl.add(2.3, () => {
      kneeling = true;
      opp.anim.play('forced_kneel', { restart: true, duration: 0.5 });
      world.audio.play('land', { volume: 0.7 });
    });
    // APAGAR MEMÓRIA
    tl.add(2.75, () => {
      world.screenFlash && world.screenFlash('#0a3a0e', 0.3);
      world.fx.distort(joint('hd'), { color: 0xffffff, radius: 2.4, life: 0.5 });
      world.audio.play('blink', { volume: 0.9, pitch: 0.5 });
      for (const a of opp.def.abilities || []) opp.cooldowns[a.id] = Math.max(opp.cooldowns[a.id] || 0, (opp.cooldownMax[a.id] || a.cooldown) * (sp.forget ?? 1));
      opp.energy = 0;
      opp.notify('MEMÓRIAS APAGADAS — RITUAIS ESQUECIDOS', true);
    });
    // TOQUE SUTIL: flutua até a vítima e encosta um dedo
    tl.add(3.4, () => { f.anim.play('point', { restart: true, duration: 0.4 }); });
    tl.add(3.7, () => {
      threadsOn = false;
      const p = opp.chestPos();
      world.fx.flash(p, { color: col, size: 2.4, life: 0.2 });
      world.fx.burst(p, { count: 70, color: 0xa01018, speed: 3, up: 1.5, life: 0.9, size: 0.2, gravity: 4 }); // o sangue borbulhando
      world.fx.burst(p, { count: 40, color: col, kind: 'smoke', speed: 1.5, up: 1, life: 1, size: 0.5, grow: 1 });
      world.cameraRig.shake(0.5, 0.35);
      world.audio.play('drain', { volume: 1.1, pitch: 0.4 });
      kneeling = false;
      applyHit(world, f, opp, { damage: touch, kind: 'special', element: 'transmissao', knockback: 3, hitstun: 0.8, launch: true, lowLaunch: true, ignoreInvuln: true, unblockable: true, dir: forwardFromYaw(f.yaw), color: col, sound: 'heavyPunch', scale: 2.2 });
    });
    tl.end(4.2);

    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      if (opp.rig.body) opp.rig.body.rotation.z = 0;
      if (world.cinematic && world.cinematic.actor === f) world.endCinematic();
    };
    return {
      update(dt) {
        const t = tl.time;
        opp.vel.set(0, 0, 0);
        // fios de sinal da mão dele até o corpo do alvo
        if (threadsOn) {
          threadClock -= dt;
          if (threadClock <= 0) {
            threadClock = 0.06;
            for (let i = 0; i < 3; i++) world.fx.lightning(hand(), joint(J[Math.floor(Math.random() * J.length)]), { color: col, life: 0.08, jitter: 0.08 });
          }
        }
        // o corpo treme contra a vontade
        if (opp.rig.body) {
          if (jerk > 0) { jerk -= dt; opp.rig.body.rotation.z = Math.sin(t * 50) * 0.1; } else opp.rig.body.rotation.z = 0;
        }
        if (kneeling && opp.anim.currentName !== 'forced_kneel') opp.anim.play('forced_kneel', { restart: true, duration: 0.5 });
        // flutua até a vítima para o toque
        if (t >= 3.1 && t < 3.7) {
          approach = Math.min(1, (t - 3.1) / 0.5);
          const F = forwardFromYaw(f.yaw);
          const reach = Math.max(0, distXZ(startF, opp.pos) - 1.3);
          f.pos.set(startF.x + F.x * reach * approach, f.pos.y, startF.z + F.z * reach * approach);
        }
        const end = tl.update(dt);
        if (end) cleanup();
        return end;
      },
      cancel() { cleanup(); },
    };
  },
};
