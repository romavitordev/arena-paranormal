import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { faceClose, twoShot, orbit, pullBack } from '../../camera/shots.js';

// Especial INEXISTIR (Kian): agarra o alvo, o corpo dele se enche de escrita, brilha por
// dentro e vira pó, como se nunca tivesse existido.
//  - corpo a corpo (avança e precisa encostar)
//  - NÃO pode ser defendido; só ESQUIVADO (invulnerável no momento do contato = erra)
//  - com a sanidade (energia) CHEIA o alvo resiste: leva muito dano, mas nunca morre por ele
//  - limite de uso por partida definido em `usesPerMatch` (controlado pelo Fighter)
export const erase = {
  canStart: () => true,
  start(f, sp, world) {
    const dash = sp.dash || { speed: 24, maxTime: 0.4, contact: 1.6 };
    let phase = 'prepare';
    let t = 0;
    let tl = null;
    let opp = f.opponent;
    const hand = (s) => f.rig.sockets[s].getWorldPosition(new THREE.Vector3());
    const emitters = [
      world.fx.emitter({ rate: 90, follow: () => hand('handR'), particle: { color: sp.color, speed: 1.2, spread: 0.6, life: 0.4, size: 0.24 } }),
      world.fx.emitter({ rate: 90, follow: () => hand('handL'), particle: { color: sp.color, speed: 1.2, spread: 0.6, life: 0.4, size: 0.24 } }),
    ];
    const stopAll = () => emitters.forEach((e) => e.stop());
    f.vel.set(0, 0, 0);
    f.anim.play('charge_fists', { restart: true, duration: 0.35 });
    world.audio.play('fearGaze', { volume: 0.7 });
    f.buffTint = { color: sp.color, base: 0.35 };

    const begin = () => {
      phase = 'cinematic';
      world.beginCinematic(f, opp);
      f.yaw = yawTo(f.pos, opp.pos);
      opp.yaw = yawTo(opp.pos, f.pos);
      const F = forwardFromYaw(f.yaw);
      f.pos.set(opp.pos.x - F.x * 1.0, opp.pos.y, opp.pos.z - F.z * 1.0);
      f.anim.play('point', { restart: true, duration: 0.4 });
      opp.anim.play('stagger', { restart: true });
      world.cameraRig.playShots([
        twoShot(f, opp, { dur: 0.6, dist: 3.4, push: 0.6, side: 1 }),
        faceClose(opp, { dur: 0.9, from: 2.4, to: 1.6, side: -0.5, height: 1.5 }),
        orbit(opp, { dur: 0.8, radius: 3.0, height: 1.4, a0: 0.4, a1: 1.4, lookH: 1.1 }),
        pullBack(f, opp, { dur: 1.2, from: 3, to: 7, height: 2.2, side: -1 }),
      ]);
      tl = new Timeline();
      let glyphs = null;
      tl.add(0.15, () => {
        world.audio.play('ritual');
        // escrita girando em volta do corpo do alvo
        glyphs = world.fx.emitter({
          rate: 120,
          follow: () => {
            const a = Math.random() * Math.PI * 2;
            return new THREE.Vector3(opp.pos.x + Math.sin(a) * 0.45, opp.pos.y + Math.random() * 1.8, opp.pos.z + Math.cos(a) * 0.45);
          },
          particle: { color: sp.color, speed: 0.8, up: 0.8, spread: 0.3, life: 0.6, size: 0.12 },
        });
        opp.glowTint = { color: sp.color, base: 0.2 };
      });
      tl.add(0.6, () => world.showBanner(sp.banner || 'Inexistir', f.def.color));
      tl.each((time) => {
        if (time > 0.15 && time < 1.75 && opp.glowTint) opp.glowTint.base = 0.2 + (time - 0.15) * 0.5; // brilha por dentro
      });
      tl.add(1.2, () => world.fx.distort(opp.chestPos(), { color: sp.color, radius: 2.2, life: 0.5 }));
      tl.add(1.75, () => {
        glyphs && glyphs.stop();
        opp.glowTint = null;
        const resist = opp.energy >= opp.maxEnergy - 0.5;
        if (resist) {
          // sanidade cheia: resiste, mas leva muito dano (nunca o suficiente para morrer)
          const dmg = Math.max(0, Math.min(sp.resistDamage ?? 450, opp.health - 1));
          applyHit(world, f, opp, { damage: dmg, kind: 'special', reaction: false, ignoreInvuln: true, unblockable: true, color: sp.color, scale: 2.2, sound: 'heavyPunch' });
          opp.energy = 0; // a resistência consome toda a sanidade
          opp.notify('RESISTIU — SANIDADE CHEIA', true);
          world.fx.flash(opp.chestPos(), { color: 0xffffff, size: 4, life: 0.2 });
        } else {
          // deixa de existir: vira pó
          const c = opp.chestPos();
          world.fx.burst(c, { count: 120, color: 0x8a8070, kind: 'smoke', speed: 3, life: 1.6, size: 0.35, spread: 1, jitter: 0.8, grow: 0.5, gravity: -0.3 });
          world.fx.burst(c, { count: 80, color: sp.color, speed: 5, life: 0.9, size: 0.12, jitter: 0.8 });
          world.fx.flash(c, { color: 0xfff2c8, size: 5, life: 0.25 });
          world.audio.play('ko');
          world.screenFlash && world.screenFlash('#fff2c8', 0.1);
          const dealt = opp.takeDamage(opp.health);
          opp.setVisible(false);
          world.onHit && world.onHit(f, opp, dealt, { kind: 'special' });
        }
        world.cameraRig.shake(0.5, 0.35);
      });
      tl.end(2.6);
    };

    const finish = () => {
      stopAll();
      f.buffTint = null;
    };
    return {
      update(dt) {
        t += dt;
        if (phase === 'prepare') {
          opp = f.opponent;
          if (opp) f.yaw = yawTo(f.pos, opp.pos);
          if (t >= 0.35) { phase = 'dash'; t = 0; f.anim.play('dash', { restart: true }); }
          return false;
        }
        if (phase === 'dash') {
          if (!opp || opp.state === 'ko') { finish(); return true; }
          f.yaw = yawTo(f.pos, opp.pos);
          const F = forwardFromYaw(f.yaw);
          f.vel.x = F.x * dash.speed;
          f.vel.z = F.z * dash.speed;
          if (distXZ(f.pos, opp.pos) <= dash.contact && Math.abs(opp.pos.y - f.pos.y) < 1.8) {
            f.vel.set(0, 0, 0);
            // esquivou (invulnerável) no contato → erra. Defesa NÃO segura o Inexistir.
            if (opp.isInvulnerable() && opp.state !== 'block') {
              phase = 'whiff';
              t = 0;
              opp.notify('ESQUIVOU DO INEXISTIR', true);
              return false;
            }
            begin();
            return false;
          }
          if (t >= dash.maxTime) { f.vel.set(0, 0, 0); phase = 'whiff'; t = 0; }
          return false;
        }
        if (phase === 'whiff') {
          if (t >= 0.55) { finish(); return true; }
          return false;
        }
        const done = tl.update(dt);
        if (done) {
          finish();
          world.endCinematic();
          if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(f.yaw), knockback: 6, hitstun: COMBAT.launchHitstun, launch: true });
          f.anim.play('idle', { blend: 0.2 });
        }
        return done;
      },
      cancel() {
        finish();
        if (phase === 'cinematic') world.endCinematic();
      },
    };
  },
};
