import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose, orbit } from '../../camera/shots.js';
import { transform } from '../forms.js';

// PACTO DO SANTO (Ferreiro): crava o Símbolo Espiral no próprio peito e se entrega ao Parasita de
// Dimensões. Exige a sanidade acima de sp.minEnergy (85%). Por sp.window segundos (45), se ele MORRER, o Lodo
// toma o corpo e ele se ergue como O DEUS DA MORTE (sp.form) — um chefe com vida própria.
// sp.immediate (a transformação pela Barra de Transformação): a mesma cena, e ele se ergue no fim dela.
export const santoPact = {
  canStart: (f) => !f.findBuff('santoPact'),
  blockMsg: 'O PACTO JÁ ESTÁ FEITO',
  start(f, sp, world) {
    const tl = new Timeline();
    world.beginCinematic(f, null);
    f.vel.set(0, 0, 0);
    f.anim.play('concentrate', { restart: true, duration: 1.6 });
    world.cameraRig.playShots([
      faceClose(f, { dur: 0.9, from: 2.2, to: 1.3, side: 0.3 }),
      orbit(f, { dur: 1.0, radius: 4.6, height: 1.8, a0: -0.4, a1: 0.6, lookH: 1.2 }),
    ]);
    world.audio.play('drain', { volume: 0.9, pitch: 0.6 });
    const lodo = world.fx.emitter({
      rate: 70,
      follow: () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 2.2, 0.1, f.pos.z + (Math.random() - 0.5) * 2.2),
      particle: { color: 0x0a080c, kind: 'smoke', speed: 0.6, up: 1.6, spread: 0.2, life: 1.1, size: 0.7, grow: 1.2 },
    });
    // a espiral sendo cravada no peito
    tl.add(0.35, () => {
      world.showBanner(sp.banner || 'Pacto do Santo', f.def.color);
      for (let i = 0; i < 4; i++) world.after(i * 0.12, () => world.fx.ring(f.chestPos(), { color: 0x1a1620, radius: 0.5 + i * 0.5, life: 0.5, vertical: true, yaw: f.yaw }));
      world.fx.burst(f.chestPos(), { count: 30, color: 0x7a0010, speed: 3, life: 0.6, size: 0.18, gravity: 6 });
    });
    tl.add(1.0, () => {
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: 0x2a2632, radius: 4, life: 0.7 });
      world.cameraRig.shake(0.3, 0.3);
      if (sp.immediate) return; // pela Barra de Transformação: o Lodo toma o corpo no fim da cena, sem esperar a morte
      const until = world.time + sp.window;
      f.addBuff({ type: 'santoPact', name: 'PACTO DO SANTO', time: sp.window, duration: sp.window, onEnd() { if (f.lethalHook === hook) f.lethalHook = null; } });
      // golpe fatal dentro do pacto: em vez de cair, o Lodo toma o corpo
      const hook = (self) => {
        if (world.time > until) return false;
        self.health = 1;
        self.invuln = Math.max(self.invuln, 2.5);
        world.after(0.05, () => riseAsDeathGod(self, sp, world));
        return true;
      };
      f.lethalHook = hook;
      f.notify(`PACTO: SE CAIR EM ${sp.window}s, VIRA O DEUS DA MORTE`, true);
    });
    tl.add(1.6, () => {
      // depois que este especial termina (a troca de kit encerra a sequência)
      if (sp.immediate) world.after(0.01, () => riseAsDeathGod(f, sp, world));
    });
    tl.end(1.6);
    return {
      update: (dt) => {
        const done = tl.update(dt);
        if (done) { lodo.stop(); world.endCinematic(); }
        return done;
      },
      cancel: () => { lodo.stop(); world.endCinematic(); },
    };
  },
};

// O Ferreiro morre e o Lodo toma o corpo: vira o Deus da Morte com a vida cheia de chefe
export function riseAsDeathGod(f, sp, world) {
  if (f.state === 'ko') return;
  f.cancelAction && f.cancelAction();
  const at = f.pos.clone();
  world.fx.burst(new THREE.Vector3(at.x, 1, at.z), { count: 60, color: 0x0a080c, kind: 'smoke', speed: 3, up: 3, life: 1.4, size: 1.4, grow: 1.4 });
  world.fx.ring(new THREE.Vector3(at.x, 0.06, at.z), { color: 0x1a1620, radius: 6, life: 0.9 });
  world.cameraRig.shake(0.8, 0.6);
  world.audio.play('drain', { volume: 1.1, pitch: 0.45 });
  world.screenFlash && world.screenFlash('#000000', 0.25);
  transform(f, sp.form, { health: Infinity, banner: 'O Deus da Morte' });
  f.invuln = Math.max(f.invuln, 1.5);
  f.energy = f.maxEnergy;
  f.notify('O DEUS DA MORTE SE ERGUEU', true);
}
