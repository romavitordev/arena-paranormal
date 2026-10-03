import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw, angleDiff } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { findSpotBehind } from '../positioning.js';
import { vanishFx } from '../abilities.js';
import { twoShot, faceClose, pullBack, orbit } from '../../camera/shots.js';
import { trySpecialBlock } from './common.js';

// Especial do Joui: some, surge atrás do inimigo, o inimigo se vira,
// cara a cara, câmera aproxima, corte de katana.
// Mecanicamente igual aos outros especiais: dano configurável (padrão),
// respeita a vida, NÃO é hitkill.
export const teleportStrike = {
  canStart(f, sp, world) {
    const opp = f.opponent;
    if (!opp || opp.state === 'ko' || !opp.visible) return false;
    if (distXZ(f.pos, opp.pos) > (sp.maxRange ?? 30)) return false;
    return !!findSpotBehind(world.arena, { x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw }, { distance: sp.behindDistance ?? 1.4, radius: f.radius });
  },

  start(f, sp, world) {
    const opp = f.opponent;
    const damage = sp.damage ?? COMBAT.specialDamage;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    world.beginCinematic(f, opp);
    const tl = new Timeline();
    const red = sp.color;
    let dust = null;
    let turnFrom = opp.yaw;
    let turnTo = opp.yaw;
    let turnStart = -1;

    // 1–2: ativa e desaparece
    f.vel.set(0, 0, 0);
    f.anim.play('vanish', { restart: true, duration: 0.25 });
    opp.anim.play('idle', { restart: true });
    world.audio.play('teleport');
    world.cameraRig.playShots([
      orbit(f, { dur: 0.6, radius: 3, height: 1.5, a0: 0.5, a1: 0.2 }),
      faceClose(opp, { dur: 0.6, from: 2.6, to: 2.0, side: 0.6, height: 1.5 }),
      // cara a cara: plano lateral que vai fechando nos dois
      twoShot(f, opp, { dur: 1.55, dist: 3.6, push: 0.9, height: 1.5, side: 1, fov: 36, lookH: 1.4 }),
      pullBack(f, opp, { dur: 1.2, from: 2.4, to: 6, height: 2.0, side: -1 }),
    ]);
    // afunda na própria sombra
    world.fx.shadowDisc(f.pos, { radius: 1.2, life: 0.7 });
    tl.each((time) => {
      if (time < 0.25) f.rig.body.position.y = -1.9 * (time / 0.25);
      else if (time > 0.6 && time < 0.75) f.rig.body.position.y = -1.6 + ((time - 0.6) / 0.15) * 1.6;
      else if (time >= 0.75 && f.rig.body.position.y !== 0) f.rig.body.position.y = 0;
    });
    tl.add(0.25, () => {
      vanishFx(world, f.pos, red);
      f.setVisible(false);
    });

    // 3: surge atrás do inimigo (posição válida mais próxima, nunca dentro de parede)
    tl.add(0.6, () => {
      const spot = findSpotBehind(world.arena, { x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw }, { distance: sp.behindDistance ?? 1.4, radius: f.radius })
        || { x: f.pos.x, z: f.pos.z };
      f.pos.set(spot.x, opp.pos.y, spot.z);
      f.yaw = yawTo(f.pos, opp.pos);
      f.rig.body.position.y = -1.6;
      f.setVisible(true);
      world.fx.shadowDisc(f.pos, { radius: 1.2, life: 0.6 });
      vanishFx(world, f.pos, red);
      f.anim.play('iai_ready', { restart: true, duration: 0.5 });
      world.audio.play('heartbeat');
      // twoShot é calculado a partir das posições atuais; nada a refazer aqui
    });

    // 4: o inimigo percebe e se vira
    tl.add(1.2, () => {
      turnFrom = opp.yaw;
      turnTo = yawTo(opp.pos, f.pos);
      turnStart = tl.time;
      opp.anim.play('turn_look', { restart: true, duration: 0.45 });
    });
    tl.each((time) => {
      if (turnStart >= 0) {
        const k = Math.min(1, (time - turnStart) / 0.4);
        opp.yaw = turnFrom + angleDiff(turnFrom, turnTo) * k;
      }
    });

    // 5–6: cara a cara, câmera aproxima. 9: nome na tela no momento principal
    tl.add(1.7, () => {
      world.audio.play('heartbeat');
      dust = world.fx.emitter({
        rate: 25,
        follow: () => new THREE.Vector3((f.pos.x + opp.pos.x) / 2 + (Math.random() - 0.5) * 3, 0.1, (f.pos.z + opp.pos.z) / 2 + (Math.random() - 0.5) * 3),
        particle: { color: red, speed: 0.6, up: 1, spread: 0.3, life: 1.2, size: 0.15 },
      });
    });
    tl.add(2.0, () => world.showBanner(sp.banner || f.def.name, f.def.color));

    // 7–8: o golpe
    tl.add(2.75, () => {
      f.anim.play('iai_slash', { restart: true, duration: 0.5 });
      world.audio.play('slashFinal');
    });
    tl.add(2.86, () => {
      applyHit(world, f, opp, { damage, kind: 'special', reaction: false, ignoreInvuln: true, sound: 'bladeHit', color: red, scale: 2.2 });
      const c = opp.chestPos();
      world.fx.slash(c, f.yaw, { color: 0xffffff, radius: 2.4, arc: 3.2, life: 0.45, width: 0.18 });
      world.fx.slash(c, f.yaw, { color: red, radius: 2.6, arc: 3.0, life: 0.5, width: 0.5 });
      world.fx.flash(c, { color: 0xffffff, size: 6, life: 0.2 });
      world.screenFlash && world.screenFlash('#ffffff', 0.12);
      world.cameraRig.shake(0.5, 0.3);
      if (opp.state !== 'ko') opp.anim.play('stagger', { restart: true });
    });

    // 10–11: fim da animação, controle volta ao jogador
    tl.add(3.75, () => {});
    tl.end(3.8);

    return {
      update(dt) {
        const done = tl.update(dt);
        if (done) {
          dust && dust.stop();
          world.endCinematic();
          if (opp.state !== 'ko') {
            opp.react({ dir: forwardFromYaw(f.yaw), knockback: 5, hitstun: COMBAT.launchHitstun, launch: true });
          }
          f.anim.play('idle', { blend: 0.2 });
        }
        return done;
      },
      cancel() {
        dust && dust.stop();
        f.rig.body.position.y = 0;
        f.setVisible(true);
        world.endCinematic();
      },
    };
  },
};
