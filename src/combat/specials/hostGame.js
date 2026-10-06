import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { trySpecialBlock } from './common.js';
import { faceClose, orbit, pullBack, twoShot } from '../../camera/shots.js';

// O JOGO DO ANFITRIÃO (especial do Anfitrião). Cânone: ele distorce a Realidade com JOGOS de regras imprevisíveis e
// precisa de plateia.
//  1. AVISO (telegraph.js): ergue o relógio com a Relíquia e um sigilo pulsa no chão do alvo — dá para sair do alcance,
//     esquivar no fim do aviso ou defender de frente;
//  2. pegou: uma ROLETA de Energia (roxo, rosa e azul) gira em volta do alvo, preso no lugar; os ponteiros do relógio
//     enlouquecem e ela para numa casa sorteada;
//  3. o resultado é aleatório só no "sabor", nunca no acerto: o dano fica sempre entre sp.minDamage e sp.maxDamage
//     (nunca mata de uma vez com a vida cheia) e cada casa soma um efeito pequeno:
//       RAIO     — mais dano (o topo da faixa) e lança
//       CHOQUE   — dano médio e o alvo fica atordoado
//       TROCA    — dano menor, mas rouba sanidade do alvo para o Anfitrião
const SLOTS = [
  { id: 'raio', label: 'RAIO!', color: 0xb04aff, k: 1 },
  { id: 'choque', label: 'CHOQUE!', color: 0x5aa0ff, k: 0.55 },
  { id: 'troca', label: 'TROCA!', color: 0xff6ad0, k: 0.15 },
];

export const hostGame = {
  telegraph: () => ({ time: 1.0, anim: 'cast_up', animDuration: 1.0, mark: 'sigil' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 18);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const lo = sp.minDamage ?? 200;
    const hi = sp.maxDamage ?? 300;
    const pick = SLOTS[Math.floor(Math.random() * SLOTS.length)];
    const damage = Math.round(lo + (hi - lo) * (pick.k * 0.8 + Math.random() * 0.2));
    world.beginCinematic(f, opp);
    const tl = new Timeline();
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.vel.set(0, 0, 0);
    opp.anim.play('fear', { restart: true });
    world.audio.play('ritual', { volume: 0.9, pitch: 0.7 });
    world.cameraRig.playShots([
      twoShot(f, opp, { dur: 0.8, dist: 5, push: 0.6, height: 1.6, side: 1 }),
      orbit(opp, { dur: 1.6, radius: 4.2, height: 2.6, a0: -1.0, a1: 0.8, lookH: 0.6, fov: 50 }),
      faceClose(f, { dur: 0.7, from: 1.8, to: 1.3, side: 0.3 }),
      pullBack(f, opp, { dur: 1.2, from: 4, to: 8, height: 2.6, side: -1 }),
    ]);
    world.showBanner(sp.banner || 'O Jogo do Anfitrião', f.def.color);

    // a roleta: 12 casas em volta do alvo, alternando as três cores, e um ponteiro fixo na frente dele
    const wheel = new THREE.Group();
    const R = 1.9;
    const N = 12;
    const mats = [];
    for (let i = 0; i < N; i++) {
      const slot = SLOTS[i % SLOTS.length];
      const m = new THREE.MeshBasicMaterial({ color: slot.color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      mats.push(m);
      const seg = new THREE.Mesh(new THREE.RingGeometry(R - 0.45, R, 8, 1, (i / N) * Math.PI * 2 + 0.03, (Math.PI * 2) / N - 0.06), m);
      seg.rotation.x = -Math.PI / 2;
      wheel.add(seg);
    }
    wheel.position.set(opp.pos.x, 0.08, opp.pos.z);
    world.scene.add(wheel);
    const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const toF = forwardFromYaw(yawTo(opp.pos, f.pos));
    pointer.position.set(opp.pos.x + toF.x * (R + 0.3), 0.3, opp.pos.z + toF.z * (R + 0.3));
    pointer.rotation.set(Math.PI / 2, 0, 0);
    pointer.lookAt(opp.pos.x, 0.3, opp.pos.z);
    pointer.rotateX(Math.PI / 2);
    world.scene.add(pointer);
    const light = new THREE.PointLight(pick.color, 6, 8, 1.6);
    light.position.set(opp.pos.x, 2.4, opp.pos.z);
    world.scene.add(light);

    // gira rápido e desacelera até parar
    let spin = 14;
    const SPIN_END = 2.2;
    tl.each((t, dt) => {
      if (t < SPIN_END) {
        spin = Math.max(0.4, 14 * (1 - t / SPIN_END) ** 1.6);
        wheel.rotation.y += spin * dt;
        if (Math.random() < 0.3) world.audio.play('select', { volume: 0.25, pitch: 1 + spin * 0.05 });
      }
      opp.vel.set(0, 0, 0);
    });
    tl.add(0.9, () => { f.anim.play('cast_up', { restart: true, duration: 0.8 }); world.audio.play('fearGaze', { volume: 0.5, pitch: 0.6 }); });
    tl.add(SPIN_END, () => {
      // parou: as casas do resultado acendem, as outras apagam
      mats.forEach((m, i) => { m.opacity = SLOTS[i % SLOTS.length] === pick ? 1 : 0.15; });
      light.intensity = 14;
      world.showBanner(pick.label, '#' + new THREE.Color(pick.color).getHexString());
      world.audio.play('confirm', { volume: 0.9 });
      opp.notify(pick.label, true);
    });
    tl.add(SPIN_END + 0.7, () => {
      const p = opp.chestPos();
      for (let i = 0; i < 6; i++) world.fx.lightning(p.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, 6, (Math.random() - 0.5) * 2)), p, { color: SLOTS[i % 3].color, life: 0.35 });
      world.fx.flash(p, { color: pick.color, size: 4, life: 0.3 });
      world.fx.burst(p, { count: 60, color: pick.color, speed: 7, life: 0.7, size: 0.26 });
      world.fx.ring(new THREE.Vector3(opp.pos.x, 0.08, opp.pos.z), { color: pick.color, radius: 3.2, life: 0.5 });
      world.screenFlash && world.screenFlash('#2a0a40', 0.25);
      world.cameraRig.shake(0.7, 0.4);
      world.audio.play('explosion', { volume: 1.1, pitch: 1.2 });
      applyHit(world, f, opp, { damage, kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, sound: 'impact', color: pick.color, scale: 2.2 });
      if (opp.state === 'ko') return;
      if (pick.id === 'troca') {
        const stolen = opp.drainEnergy(sp.steal ?? 30);
        f.addEnergy(stolen);
        f.notify(`+${Math.round(stolen)} SANIDADE`, true);
      }
      opp.anim.play('stagger', { restart: true });
    });
    const END = SPIN_END + 1.6;
    tl.end(END);
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      world.scene.remove(wheel, pointer, light);
      wheel.traverse((o) => o.geometry && o.geometry.dispose());
      mats.forEach((m) => m.dispose());
      pointer.geometry.dispose();
      pointer.material.dispose();
    };
    return {
      update(dt) {
        const done = tl.update(dt);
        if (done) {
          cleanup();
          world.endCinematic();
          if (opp.state !== 'ko') {
            if (pick.id === 'choque') opp.stun(sp.stun ?? 1.2, 'stagger');
            else opp.react({ dir: forwardFromYaw(f.yaw), knockback: pick.id === 'raio' ? 4 : 2, hitstun: COMBAT.launchHitstun, launch: pick.id === 'raio', lowLaunch: true });
          }
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
