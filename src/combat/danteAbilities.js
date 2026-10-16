import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../core/util.js';
import { ABILITY_TYPES } from './abilities.js';
import { applyHit } from './damage.js';
import { HoloCopy } from './holo.js';

// ------------------------------------------------------------------ DANTE — OLHOS ABERTOS (Calamidade)
// Os rituais que ele usa na Transformação (wiki "Dante", Calamidade):
//   PARADOXO        "faz um movimento de espiral no ar e uma névoa preta sai de seus dedos, criando uma grande espiral
//                   de mesma cor no chão, embaixo das criaturas [...] que começam a definhar e apodrecer" — uma zona
//                   no chão: quem fica em cima definha (dano por segundo) e fica lento; INVOCAÇÕES inimigas apodrecem
//                   rápido (os Zumbis de Sangue do Diabo morreram assim)
//   ECO ESPIRAL     "cria uma silhueta em tom negro do alvo [...] todos os ataques dados no inimigo são 'replicados'
//   "Eco Dolor"     novamente em forma de vulto" — marca o alvo: cada golpe do Dante nele é REPETIDO pelo vulto logo
//                   depois (uma fração do dano; o eco não ecoa de novo)
const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });
const foeOf = (world, owner) => (world.opponentOf ? world.opponentOf(owner) : owner.opponent);
const SMOKE = 0x0c0a0e;

// a espiral preta do Paradoxo (pintada uma vez): braços de névoa enrolando para o centro
let spiralTex = null;
function paradoxTexture() {
  if (spiralTex) return spiralTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.translate(128, 128);
  for (let arm = 0; arm < 3; arm++) {
    g.beginPath();
    for (let t = 0; t < 1; t += 0.01) {
      const a = arm * (Math.PI * 2 / 3) + t * Math.PI * 3.2;
      const r = 8 + t * 112;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.strokeStyle = 'rgba(255,255,255,0.95)';
    g.lineWidth = 16;
    g.lineCap = 'round';
    g.stroke();
  }
  const fade = g.createRadialGradient(0, 0, 10, 0, 0, 128);
  fade.addColorStop(0, 'rgba(255,255,255,0.5)');
  fade.addColorStop(0.85, 'rgba(255,255,255,0.18)');
  fade.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = fade;
  g.beginPath(); g.arc(0, 0, 128, 0, Math.PI * 2); g.fill();
  spiralTex = new THREE.CanvasTexture(c);
  return spiralTex;
}

// PARADOXO no chão: a espiral gira devagar; quem está em cima definha e fica lento; as invocações inimigas apodrecem
export function addParadoxZone(world, owner, x, z, a) {
  const radius = a.radius ?? 3;
  const life = a.life ?? 5;
  const mat = new THREE.MeshBasicMaterial({ map: paradoxTexture(), color: 0x14101a, transparent: true, opacity: 0, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 40), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.05, z);
  mesh.renderOrder = 1;
  world.scene.add(mesh);
  const rim = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 48), new THREE.MeshBasicMaterial({ color: a.color ?? 0x9a94ae, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  rim.rotation.x = -Math.PI / 2;
  rim.position.set(x, 0.055, z);
  world.scene.add(rim);
  let t = 0;
  let acc = 0;
  let npcT = 0;
  world.addTicker({
    update(dt) {
      t += dt;
      const k = t / life;
      const grow = Math.min(1, t / 0.35);
      mesh.scale.setScalar(radius * grow);
      rim.scale.setScalar(radius * grow);
      mesh.rotation.z += dt * 0.8;
      const fade = k > 0.8 ? (1 - k) / 0.2 : 1;
      mat.opacity = 0.92 * fade;
      rim.material.opacity = 0.5 * fade;
      // a névoa preta subindo da espiral
      if (Math.random() < dt * 22 * fade) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius * 0.95;
        world.fx.burst(new THREE.Vector3(x + Math.cos(ang) * r, 0.15, z + Math.sin(ang) * r), { count: 1, color: SMOKE, kind: 'smoke', speed: 0.3, up: 1.1, life: 0.9, size: 0.7, grow: 1 });
      }
      const foe = foeOf(world, owner);
      if (foe && foe.state !== 'ko' && !foe.isInvulnerable() && Math.hypot(foe.pos.x - x, foe.pos.z - z) <= radius + foe.radius * 0.3 && foe.pos.y < 1.2) {
        acc += (a.dps ?? 16) * dt;
        const b = foe.findBuff('paradox');
        if (b) b.time = 0.3;
        else foe.addBuff({ type: 'paradox', name: 'PARADOXO', time: 0.3, duration: 0.3, speedMult: a.slow ?? 0.65 });
        if (acc >= 1) {
          const n = Math.floor(acc);
          acc -= n;
          foe.takeDamage(n);
          if (Math.random() < 0.35) world.fx.burst(foe.chestPos(), { count: 3, color: SMOKE, kind: 'smoke', speed: 0.8, up: 1.2, life: 0.5, size: 0.4 });
          world.onHit && world.onHit(owner, foe, n, { kind: 'decay' });
        }
      }
      npcT += dt;
      if (npcT >= 0.25) {
        npcT = 0;
        const c = new THREE.Vector3(x, 0.5, z);
        for (const n of world.npcs || []) {
          if (!n.alive || n.owner === owner || n.illusion || !n.hitTest || !n.hitTest(c, radius)) continue;
          n.hitBy(owner, Math.round((a.npcDps ?? 60) * 0.25), { kind: 'ability' });
          world.fx.burst(new THREE.Vector3(n.pos.x, n.pos.y + 1, n.pos.z), { count: 4, color: SMOKE, kind: 'smoke', speed: 0.8, up: 1, life: 0.5, size: 0.5 });
        }
      }
      return t >= life;
    },
    dispose() {
      world.scene.remove(mesh);
      world.scene.remove(rim);
      mesh.geometry.dispose();
      mat.dispose();
      rim.geometry.dispose();
      rim.material.dispose();
    },
  });
}

const DANTE_TYPES = {
  paradox: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('concentrate', { restart: true, duration: a.cast + 0.2 });
      world.audio.play('ritual', { volume: 0.8, pitch: 0.65 });
      // a mão gira no ar: a névoa preta sai dos dedos em espiral
      const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
      const swirl = world.fx.emitter({ rate: 60, follow: hand, particle: { color: SMOKE, kind: 'smoke', speed: 0.5, spread: 0.3, life: 0.5, size: 0.3 } });
      tl.add(a.cast, () => {
        swirl.stop();
        // embaixo do adversário (ao alcance) ou à frente
        let x, z;
        if (opp && distXZ(f.pos, opp.pos) <= a.range) { x = opp.pos.x; z = opp.pos.z; } else {
          const F = forwardFromYaw(f.yaw, new THREE.Vector3());
          x = f.pos.x + F.x * Math.min(4, a.range); z = f.pos.z + F.z * Math.min(4, a.range);
        }
        addParadoxZone(world, f, x, z, a);
        world.audio.play('drain', { volume: 0.9, pitch: 0.7 });
        world.cameraRig.shake(0.2, 0.25);
        f.notify('PARADOXO', true);
      });
      tl.end(a.cast + 0.3);
      return seqFrom(tl, { cancel: () => swirl.stop() });
    },
  },

  echoPain: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!opp || opp.state === 'ko' || distXZ(f.pos, opp.pos) > a.range) { f.notify('FORA DE ALCANCE'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      // as mãos uma sobre a outra na frente do rosto e o sopro
      f.anim.play('concentrate', { restart: true, duration: a.cast + 0.2 });
      world.audio.play('fearGaze', { volume: 0.7, pitch: 0.6 });
      const mouth = () => f.rig.sockets.mouth.getWorldPosition(new THREE.Vector3());
      const breath = world.fx.emitter({ rate: 50, follow: mouth, particle: { color: SMOKE, kind: 'smoke', speed: 1.6, spread: 0.25, life: 0.45, size: 0.25 } });
      tl.add(a.cast, () => {
        breath.stop();
        if (opp.state === 'ko' || opp.isInvulnerable()) { f.notify('ERROU', true); return; }
        world.fx.tracer(mouth(), opp.chestPos(), { color: 0x2a2632, life: 0.35, width: 0.08 });
        // a silhueta preta do alvo, colada nele enquanto o ritual dura
        const shade = new HoloCopy(opp, world, { mode: 'mimic', offset: new THREE.Vector3(0.12, 0, -0.18), life: a.duration, color: SMOKE, opacity: 0.55 });
        world.addNpc(shade);
        const old = opp.findBuff('ecoDolor');
        if (old) old.onEnd && old.onEnd();
        if (old) opp.buffs.splice(opp.buffs.indexOf(old), 1);
        opp.addBuff({
          type: 'ecoDolor', name: 'ECO ESPIRAL', time: a.duration, duration: a.duration, owner: f,
          // lido em damage.js: cada golpe do Dante neste alvo volta como vulto
          queue(dealt) {
            const dmg = Math.max(1, Math.round(dealt * (a.echo ?? 0.4)));
            world.after(a.delay ?? 0.35, () => {
              if (!opp || opp.state === 'ko' || !shade.alive) return;
              const ghost = new HoloCopy(f, world, { mode: 'ghost', pos: opp.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 0, (Math.random() - 0.5) * 0.8)), yaw: yawTo(opp.pos, f.pos) + Math.PI, life: 0.4, color: SMOKE, opacity: 0.5, fadeIn: 0.02, fadeOut: 0.3 });
              world.addNpc(ghost);
              applyHit(world, f, opp, { damage: dmg, kind: 'ability', element: 'morte', echo: true, reaction: false, knockback: 0, hitstun: 0.12, sound: 'drain', color: 0x8a8494, scale: 0.7 });
            });
          },
          onEnd() { shade.alive && shade.kill(); },
        });
        opp.notify('ECO ESPIRAL', true);
      });
      tl.end(a.cast + 0.3);
      return seqFrom(tl, { cancel: () => breath.stop() });
    },
  },
};

Object.assign(ABILITY_TYPES, DANTE_TYPES);
