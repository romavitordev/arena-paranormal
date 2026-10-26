import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../core/util.js';
import { ABILITY_TYPES } from './abilities.js';
import { applyHit } from './damage.js';

// ------------------------------------------------------------------ RAZIEL (líder dos Vampiros, Hexatombe)
// Os rituais e habilidades da ficha dele (wiki "Raziel" / Sobrevivendo ao Horror) que não cabiam nos tipos que já
// existiam: a MORDIDA (ele morde e se delicia com o sangue — "o gosto da sua carne e do seu sangue eram melhores") e a
// MALDIÇÃO SANGUÍNEA (apodrece o sangue do alvo: abalado, -1 dado em tudo). O Endurecer Sangue é o heavyProtection
// com a crosta de sangue e o Bote Retalhador é o heavyBlow com grazeOnDodge (quem esquiva ainda toma metade).
const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });
const BLOOD = 0xb01020;

Object.assign(ABILITY_TYPES, {
  // MORDIDA: o bote curto; se pega, segura a vítima pelo pescoço e morde (duas mordidas), sugando a vida
  vampireBite: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'raziel_bite', { restart: true, duration: a.duration });
      world.audio.play('fearGaze', { volume: 0.5, pitch: 1.4 });
      let caught = false;
      tl.each((t) => {
        // o avanço do bote
        if (t > 0.08 && t < 0.24 && !caught && distXZ(f.pos, opp.pos) > 1.2) {
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * a.step;
          f.vel.z = F.z * a.step;
        } else if (!caught) { f.vel.x = 0; f.vel.z = 0; }
      });
      tl.add(0.24, () => {
        f.vel.set(0, 0, 0);
        if (opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) - opp.radius > a.range) return;
        caught = true;
        opp.stun(a.hold, 'stagger');
        opp.notify('MORDIDO', true);
      });
      for (const [i, at] of [[0, 0.3], [1, a.duration * 0.62]].entries()) {
        tl.add(at[1], () => {
          if (!caught || opp.state === 'ko') return;
          const res = applyHit(world, f, opp, {
            damage: a.damage, kind: 'ability', element: 'sangue', knockback: i ? 1.4 : 0.2, hitstun: 0.4, reaction: !!i,
            sound: 'clawHit', color: BLOOD, scale: 1.3, dir: forwardFromYaw(f.yaw), ignoreInvuln: !!i,
          });
          if (typeof res === 'number' && res > 0) {
            const heal = Math.round(res * a.drain);
            f.health = Math.min(f.maxHealth, f.health + heal);
            const neck = opp.rig.joints.hd ? opp.rig.joints.hd.getWorldPosition(new THREE.Vector3()) : opp.chestPos();
            world.fx.burst(neck, { count: 26, color: BLOOD, speed: 3.5, life: 0.5, size: 0.14, gravity: 8 });
            world.fx.burst(f.chestPos(), { count: 8, color: 0xff3040, speed: 1, up: 1.2, life: 0.5, size: 0.12 });
            if (a.bleed && opp.state !== 'ko') opp.applyBleed(a.bleed, f);
            if (i === 1) f.notify(`BEBEU +${heal}`, true);
          }
        });
      }
      tl.end(a.duration);
      return seqFrom(tl, { cancel: () => f.vel.set(0, 0, 0) });
    },
  },

  // MALDIÇÃO SANGUÍNEA: aponta para o alvo e o sangue dele apodrece — fica ABALADO (bate mais fraco e apanha mais) e
  // perde um pouco de vida no começo. Ritual: pode ser interrompido; o alvo que DEFENDE no momento resiste (metade do tempo)
  bloodCurse: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp) return null;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'db_point', { restart: true, duration: a.windup + 0.3 });
      world.audio.play('ritual', { volume: 0.6, pitch: 0.7 });
      world.fx.burst(f.chestPos(), { count: 16, color: BLOOD, speed: 2, life: 0.5, size: 0.14 });
      tl.add(a.windup, () => {
        if (opp.state === 'ko' || opp.isInvulnerable() || distXZ(f.pos, opp.pos) > a.range) { f.notify('ERROU'); return; }
        const resisted = opp.state === 'block';
        const time = resisted ? a.duration / 2 : a.duration;
        world.fx.tracer(f.chestPos(), opp.chestPos(), { color: BLOOD, life: 0.25, width: 0.05 });
        for (const j of ['hd', 'sp', 'sL', 'sR', 'lL', 'lR']) {
          const joint = opp.rig.joints[j];
          if (joint) world.fx.cutMark(joint, { color: 0x5a0010, life: time, size: 0.22 });
        }
        world.fx.burst(opp.chestPos(), { count: 24, color: 0x4a0010, kind: 'smoke', speed: 1.5, life: 0.9, size: 0.45 });
        applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'sangue', knockback: 0.2, hitstun: 0.2, reaction: false, sound: 'clawHit', color: BLOOD, scale: 1 });
        const old = opp.findBuff('shaken');
        if (old) old.time = time;
        else opp.addBuff({ type: 'shaken', name: 'ABALADO', time, duration: time, mult: a.mult, affects: ['melee', 'ranged', 'ability', 'special'], takenMult: a.takenMult });
        opp.notify(resisted ? 'ABALADO (RESISTIU)' : 'SANGUE APODRECIDO: ABALADO', true);
      });
      tl.end(a.windup + 0.3);
      return seqFrom(tl);
    },
  },
});
