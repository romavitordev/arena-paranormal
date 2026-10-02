import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose } from '../../camera/shots.js';

// PACTO (O Diabo): estende a mão e oferece um pacto — "ele cumpre a parte dele, mas distorce o resultado". O alvo
// vira TRANSTORNADO por sp.duration: obcecado, não consegue defender, recebe mais dano e perde sanidade aos poucos.
// O Diabo se alimenta da obsessão (cura sp.heal).
export const devilDeal = {
  canStart: (f) => !!f.opponent && f.opponent.state !== 'ko',
  start(f, sp, world) {
    const opp = f.opponent;
    const tl = new Timeline();
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.anim.play('point', { restart: true, duration: 1.4 });
    world.cameraRig.playShots([faceClose(f, { dur: 1.4, from: 2.6, to: 1.6, side: 0.4 })]);
    world.audio.play('fearGaze', { volume: 0.8, pitch: 0.6 });
    tl.add(0.25, () => world.showBanner(sp.banner || 'Pacto', f.def.color));
    tl.add(0.7, () => {
      // o Símbolo do Pacto brilha sob o alvo
      const c = new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z);
      for (let i = 0; i < 3; i++) world.after(i * 0.12, () => world.fx.ring(c, { color: 0x9a0010, radius: 0.8 + i * 0.7, life: 0.7 }));
      world.fx.burst(opp.chestPos(), { count: 30, color: 0x9a0010, speed: 3, life: 0.6, size: 0.18, gravity: 6 });
      if (opp.state === 'block') opp.setState('idle');
      const old = opp.findBuff('transtornado');
      if (old) old.time = sp.duration;
      else {
        opp.addBuff({
          type: 'transtornado', name: 'TRANSTORNADO (PACTO)', time: sp.duration, duration: sp.duration,
          noBlock: true, takenMult: sp.takenMult,
          onTick(dt) { opp.energy = Math.max(0, opp.energy - sp.drain * dt); },
        });
      }
      opp.notify('TRANSTORNADO', true);
      f.health = Math.min(f.maxHealth, f.health + sp.heal);
    });
    tl.add(1.4, () => {});
    tl.end(1.4);
    return {
      update: (dt) => {
        const done = tl.update(dt);
        if (done) world.endCinematic();
        return done;
      },
      cancel: () => world.endCinematic(),
    };
  },
};
