import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose, orbit } from '../../camera/shots.js';
import { transform } from '../forms.js';

// PÔR A MÁSCARA (transformação). Para os Mascarados a máscara é o momento em que a Intenção de Assassino desperta —
// só acontece aqui, na Transformação (Barra cheia + vida baixa, segurando △), nunca como habilidade comum:
// Labirinto → Capacete do ??? · Aguiar → Mutilador Noturno.
// A Erin (Ordo Realitas, NÃO é Mascarada) usa a mesma cena para pôr a máscara de gás e virar Em Nome do Caos.
// Cena: concentra (ou ri, no caso da Erin), leva a máscara ao rosto (sp.prop aparece no modelo base, se existir),
// clarão no rosto e vira a forma sp.form até o fim do round (+sp.bonusHealth de vida, que se perde ao voltar).
//   sp.prop        acessório do modelo base mostrado na cena (maskOn / helmetOn)
//   sp.anim        animação da cena (padrão 'concentrate')
//   sp.formBanner  letreiro ao virar a forma
export const maskTransform = {
  canStart: (f) => !f.baseForm,
  blockMsg: 'JÁ TRANSFORMADO',
  start(f, sp, world) {
    const tl = new Timeline();
    const col = sp.color ?? f.def.energyColor ?? 0xffffff;
    world.beginCinematic(f, null);
    f.vel.set(0, 0, 0);
    f.anim.play(sp.anim || 'concentrate', { restart: true, duration: 1.5 });
    world.cameraRig.playShots([
      orbit(f, { dur: 0.8, radius: 3.4, height: 1.3, a0: -0.6, a1: 0.1, lookH: 1.1 }),
      faceClose(f, { dur: 0.9, from: 1.7, to: 1.0, side: 0.2 }),
    ]);
    world.audio.play(sp.startSound || 'fearGaze', { volume: 0.6, pitch: 0.6 });
    const face = () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.1, 0));
    const aura = world.fx.emitter({ rate: 40, follow: () => f.chestPos(), particle: { color: col, speed: 1.2, up: 1, spread: 0.7, life: 0.6, size: 0.25 } });
    tl.add(0.3, () => world.showBanner(sp.banner || sp.name, f.def.color));
    tl.add(0.95, () => {
      if (sp.prop && f.rig.props[sp.prop]) f.rig.showProp(sp.prop, true);
      world.audio.play(sp.sound || 'maskOn');
      world.fx.flash(face(), { color: col, size: 2.2, life: 0.2 });
      world.fx.burst(face(), { count: 40, color: col, speed: 4, life: 0.6, size: 0.22, gravity: 4 });
      world.cameraRig.shake(0.3, 0.25);
    });
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      aura.stop();
      world.endCinematic();
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: col, radius: 3, life: 0.5 });
      world.fx.burst(f.chestPos(), { count: 50, color: col, speed: 5, life: 0.7, size: 0.3 });
      const bonus = sp.bonusHealth || 0;
      transform(f, sp.form, { duration: sp.duration, health: f.health + bonus, bonusHealth: bonus, banner: sp.formBanner });
      f.invuln = Math.max(f.invuln, 0.8);
      f.energy = Math.max(f.energy, sp.energy ?? 40);
    };
    tl.add(1.45, finish);
    tl.end(1.55);
    return {
      update: (dt) => tl.update(dt),
      cancel: () => { aura.stop(); world.endCinematic(); },
    };
  },
};
