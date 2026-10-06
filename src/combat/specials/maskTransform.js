import * as THREE from 'three';
import { Timeline, forwardFromYaw } from '../../core/util.js';
import { faceClose, orbit, lowAngle } from '../../camera/shots.js';
import { transform } from '../forms.js';

// PÔR A MÁSCARA (transformação). Para os Mascarados a máscara é o momento em que a Intenção de Assassino desperta —
// só acontece aqui, na Transformação (Barra cheia + vida baixa, segurando △), nunca como habilidade comum:
// Labirinto → ??? (capacete) · Aguiar → Mutilador Noturno.
// A Erin (Ordo Realitas, NÃO é Mascarada) usa a mesma cena para pôr a máscara de gás e virar Em Nome do Caos.
//
// As cenas seguem os GIFs de referência do usuário (branch refs-gifs, "mascarados ref anm"; análise em
// Referencias visuais/ANALISE.md): quando a máscara encaixa, a cena fica VERMELHA (luz vermelha forte, clarão) e o
// assassino fica com uma AURA vermelha em volta até o fim do round.
//   sp.scene  'helmet' (Labirinto: segura o capacete no peito, ergue acima da cabeça e encaixa)
//             'mutilador' (Aguiar: close no olho, agacha com o machado esticado e leva a máscara ao rosto)
//             omitido: concentra e o acessório aparece (Erin)
//   sp.prop   acessório do modelo base que entra no rosto (helmetOn / maskOn)
//   sp.anim   animação da cena padrão (padrão 'concentrate')
//   sp.formBanner  letreiro ao virar a forma
const RED = 0xff1a1a;

// leva o acessório (que mora no osso da cabeça) para outro ponto do mundo sem tirá-lo do lugar: a cada quadro a peça
// fica no ponto de descanso + `offset` (em coordenadas do mundo); offset zero = encaixada no rosto
function carryProp(prop) {
  if (!prop) return null;
  const parts = prop.parts || [prop];
  const rest = parts.map((m) => m.position.clone());
  const tmp = new THREE.Vector3();
  return {
    set(offset) {
      parts.forEach((m, i) => {
        const parent = m.parent;
        if (!parent) return;
        parent.updateWorldMatrix(true, false);
        tmp.copy(rest[i]);
        parent.localToWorld(tmp).add(offset);
        m.position.copy(parent.worldToLocal(tmp));
      });
    },
    reset() { parts.forEach((m, i) => m.position.copy(rest[i])); },
  };
}

export const maskTransform = {
  canStart: (f) => !f.baseForm,
  blockMsg: 'JÁ TRANSFORMADO',
  start(f, sp, world) {
    const tl = new Timeline();
    const col = sp.color ?? f.def.energyColor ?? 0xffffff;
    const scene = sp.scene || null;
    world.beginCinematic(f, null);
    f.vel.set(0, 0, 0);
    const head = () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.1, 0));
    const fwd = forwardFromYaw(f.yaw, new THREE.Vector3());
    const prop = sp.prop ? f.rig.props[sp.prop] : null;
    const carry = scene ? carryProp(prop) : null;
    const offset = new THREE.Vector3();
    let offsetFrom = null;
    let offsetTo = null;
    let tweenT = 0;
    let tweenDur = 0;
    const moveProp = (to, dur) => { offsetFrom = offset.clone(); offsetTo = to; tweenT = 0; tweenDur = dur; };

    // luz da cena: começa fraca na cor do poder e vira vermelho forte quando a máscara encaixa
    const light = new THREE.PointLight(col, 0, 9, 1.6);
    world.scene.add(light);
    let lightTo = 6;
    let lightColor = new THREE.Color(col);
    const aura = world.fx.emitter({ rate: 30, follow: () => f.chestPos(), particle: { color: col, speed: 1, up: 1, spread: 0.7, life: 0.6, size: 0.22 } });

    const maskOn = (big = true) => {
      if (prop) f.rig.showProp(sp.prop, true);
      world.audio.play(sp.sound || 'maskOn');
      world.fx.flash(head(), { color: RED, size: big ? 3 : 2, life: 0.22 });
      world.fx.burst(head(), { count: 50, color: RED, speed: 5, life: 0.7, size: 0.24, gravity: 3 });
      world.screenFlash && world.screenFlash('#8a0000', 0.25);
      world.cameraRig.shake(0.35, 0.3);
      lightColor = new THREE.Color(RED);
      lightTo = 14;
    };

    let total;
    if (scene === 'helmet') {
      // 1) segura o capacete sorridente no peito e olha por cima do ombro · 2) clarão · 3) ergue acima da cabeça e
      // encaixa · 4) a aura vermelha toma conta
      f.anim.play('mask_hold', { restart: true, duration: 0.5 });
      if (prop) f.rig.showProp(sp.prop, true);
      offset.copy(fwd).multiplyScalar(0.45).add(new THREE.Vector3(0, -0.55, 0));
      world.cameraRig.playShots([
        faceClose(f, { dur: 1.3, from: 2.0, to: 1.5, side: 0.5, height: 1.2 }),
        lowAngle(f, { dur: 0.9, dist: 2.2, side: -0.4 }),
        faceClose(f, { dur: 1.0, from: 1.6, to: 1.1, side: 0.1 }),
      ]);
      tl.add(0.3, () => world.showBanner(sp.banner || sp.name, f.def.color));
      tl.add(1.1, () => { world.screenFlash && world.screenFlash('#300000', 0.15); world.fx.distort(f.chestPos(), { color: RED, radius: 1.8, life: 0.25 }); });
      tl.add(1.3, () => {
        f.anim.play('mask_lift', { restart: true, duration: 1.0 });
        moveProp(fwd.clone().multiplyScalar(0.12).add(new THREE.Vector3(0, 0.55, 0)), 0.55);
      });
      tl.add(1.95, () => moveProp(new THREE.Vector3(), 0.3));
      tl.add(2.3, () => maskOn(true));
      total = 3.1;
    } else if (scene === 'mutilador') {
      // 1) close no olho no escuro · 2) agacha baixo com o machado na corda esticado de lado · 3) a mão leva a máscara
      // branca ao rosto · 4) tudo fica vermelho
      f.anim.play('mutilador_mask', { restart: true, duration: 1.1 });
      offset.copy(fwd).multiplyScalar(0.4).add(new THREE.Vector3(0, -0.35, 0));
      lightTo = 2;
      world.cameraRig.playShots([
        faceClose(f, { dur: 0.7, from: 0.9, to: 0.7, side: 0.15, height: 1.0, fov: 30 }),
        lowAngle(f, { dur: 1.2, dist: 2.6, side: 1.1 }),
        faceClose(f, { dur: 1.0, from: 1.5, to: 1.1, side: -0.3, height: 0.9 }),
      ]);
      tl.add(0.25, () => world.showBanner(sp.banner || sp.name, f.def.color));
      tl.add(0.75, () => { if (prop) f.rig.showProp(sp.prop, true); moveProp(new THREE.Vector3(), 0.7); lightTo = 5; });
      tl.add(1.5, () => maskOn(true));
      total = 2.6;
    } else {
      f.anim.play(sp.anim || 'concentrate', { restart: true, duration: 1.5 });
      world.cameraRig.playShots([
        orbit(f, { dur: 0.8, radius: 3.4, height: 1.3, a0: -0.6, a1: 0.1, lookH: 1.1 }),
        faceClose(f, { dur: 0.9, from: 1.7, to: 1.0, side: 0.2 }),
      ]);
      world.audio.play(sp.startSound || 'fearGaze', { volume: 0.6, pitch: 0.6 });
      tl.add(0.3, () => world.showBanner(sp.banner || sp.name, f.def.color));
      tl.add(0.95, () => maskOn(false));
      total = 1.55;
    }
    if (carry) carry.set(offset);

    let done = false;
    const cleanup = () => {
      aura.stop();
      world.scene.remove(light);
      if (carry) carry.reset();
    };
    const finish = () => {
      if (done) return;
      done = true;
      cleanup();
      world.endCinematic();
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: RED, radius: 3, life: 0.5 });
      world.fx.burst(f.chestPos(), { count: 50, color: col, speed: 5, life: 0.7, size: 0.3 });
      const bonus = sp.bonusHealth || 0;
      transform(f, sp.form, { duration: sp.duration, health: f.health + bonus, bonusHealth: bonus, banner: sp.formBanner });
      f.invuln = Math.max(f.invuln, 0.8);
      f.energy = Math.max(f.energy, sp.energy ?? 40);
      // a aura vermelha da Intenção de Assassino fica em volta até o fim do round (os GIFs: contorno vermelho em chamas)
      if (sp.redAura !== false && scene) {
        const red = world.fx.emitter({
          rate: 16,
          follow: () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 0.9, f.pos.y + 0.3 + Math.random() * 1.6, f.pos.z + (Math.random() - 0.5) * 0.9),
          particle: { color: RED, speed: 0.6, up: 1.4, spread: 0.3, life: 0.55, size: 0.2 },
        });
        f.addBuff({ type: 'killerIntent', time: Infinity, onEnd() { red.stop(); } });
      }
    };
    tl.add(total - 0.1, finish);
    tl.end(total);
    return {
      update: (dt) => {
        // acessório viajando das mãos até o rosto
        if (offsetTo) {
          tweenT += dt;
          const k = Math.min(1, tweenT / tweenDur);
          const e = k * k * (3 - 2 * k);
          offset.lerpVectors(offsetFrom, offsetTo, e);
          if (k >= 1) offsetTo = null;
        }
        if (carry && !done) carry.set(offset);
        // luz acompanha o rosto e vai para a cor/força pedida
        light.position.copy(head()).addScaledVector(fwd, 0.8);
        light.intensity += (lightTo - light.intensity) * Math.min(1, dt * 6);
        light.color.lerp(lightColor, Math.min(1, dt * 5));
        return tl.update(dt);
      },
      cancel: () => { cleanup(); world.endCinematic(); },
    };
  },
};
