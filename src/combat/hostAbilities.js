import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../core/util.js';
import { applyHit } from './damage.js';
import { findSpotBehind, findFreeSpotNear } from './positioning.js';
import { ABILITY_TYPES } from './abilities.js';
import {
  PURPLE, PINK, BLUE, YELLOW, RED, WHITE, NEON,
  pickChaos, chaosBoost, runChaosEvent, lash, spawnClones, hostClones, startOrphanGame,
} from './chaos.js';

// HABILIDADES DO ANFITRIÃO (forma do Arnaldo Fritz). O sorteio de tudo passa por combat/chaos.js.
// Cada tipo: start(f, cfg, world) → { update(dt)→done, cancel() } ou null (não deu: não gasta nada).

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const alive = (x) => x && x.state !== 'ko';
const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });
const handL = (f) => (f.rig.sockets.handL ? f.rig.sockets.handL.getWorldPosition(new THREE.Vector3()) : f.chestPos());

// ---------------------------------------------------------------- Regra do Caos
// 8 regras (valem para os DOIS; o Anfitrião conhece o jogo e leva metade). Quem quebrar leva um castigo sorteado.
export const RULES = [
  { id: 'jump', tier: 'common', text: 'PROIBIDO PULAR' },
  { id: 'dash', tier: 'common', text: 'PROIBIDO CORRER' },
  { id: 'block', tier: 'common', text: 'PROIBIDO DEFENDER' },
  { id: 'still', tier: 'common', text: 'PROIBIDO FICAR PARADO' },
  { id: 'attack', tier: 'uncommon', text: 'PROIBIDO ATACAR' },
  { id: 'move', tier: 'uncommon', text: 'PERMANEÇAM EM MOVIMENTO' },
  { id: 'turn', tier: 'uncommon', text: 'TROQUEM DE DIREÇÃO' },
  { id: 'approach', tier: 'uncommon', text: 'APROXIMEM-SE' },
];
const PUNISH = [
  { id: 'raio', tier: 'common', label: 'RAIO' },
  { id: 'choque', tier: 'common', label: 'CHOQUE' },
  { id: 'empurrao', tier: 'common', label: 'EMPURRÃO' },
  { id: 'explosao', tier: 'uncommon', label: 'EXPLOSÃO' },
  { id: 'stun', tier: 'uncommon', label: 'ATORDOADO' },
];

function punish(world, host, x, base, a) {
  const P = pickChaos(host, PUNISH, 'punish');
  const d = Math.round(base * (x === host ? a.ownerMult ?? 0.5 : 1));
  const p = x.chestPos();
  const opt = { kind: 'ability', element: 'energia', reaction: x !== host, ignoreInvuln: true, unblockable: true, sound: 'impact', noWeakFx: true };
  x.notify('QUEBROU A REGRA! ' + P.label, true);
  if (P.id === 'raio') {
    world.fx.lightning(p.clone().add(V(0, 6, 0)), p, { color: PURPLE, life: 0.3 });
    world.fx.lightning(p.clone().add(V(0.3, 6, 0.2)), p, { color: WHITE, life: 0.15 });
    applyHit(world, host, x, { ...opt, damage: d, hitstun: 0.3, knockback: 0.5, color: PURPLE });
  } else if (P.id === 'choque') {
    for (let i = 0; i < 4; i++) world.fx.lightning(p, p.clone().add(V((Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2)), { color: YELLOW, life: 0.25 });
    applyHit(world, host, x, { ...opt, damage: Math.round(d * 0.75), hitstun: 0.2, knockback: 0, color: YELLOW });
    if (x !== host && alive(x)) x.stun(0.4, 'stagger');
  } else if (P.id === 'empurrao') {
    world.fx.ring(V(x.pos.x, 0.07, x.pos.z), { color: PINK, radius: 2.4, life: 0.4 });
    const dir = forwardFromYaw(x.yaw + Math.PI);
    applyHit(world, host, x, { ...opt, damage: Math.round(d * 0.6), hitstun: 0.4, knockback: x === host ? 3 : 8, dir, color: PINK });
  } else if (P.id === 'explosao') {
    world.fx.flash(p, { color: RED, size: 3.4, life: 0.2 });
    world.fx.burst(p, { count: 36, color: RED, speed: 6, life: 0.5, size: 0.22 });
    world.audio.play('explosion', { volume: 0.7, pitch: 1.4 });
    applyHit(world, host, x, { ...opt, damage: Math.round(d * 1.15), hitstun: 0.5, knockback: 4, launch: x !== host, lowLaunch: true, color: RED });
  } else {
    world.fx.distort(p, { color: BLUE, radius: 1.6, life: 0.4 });
    applyHit(world, host, x, { ...opt, damage: Math.round(d * 0.4), hitstun: 0, knockback: 0, color: BLUE });
    if (x !== host && alive(x)) x.stun(0.75, 'stagger');
  }
}

Object.assign(ABILITY_TYPES, {
  chaosRule: {
    start(f, a, world) {
      if (world.activeRule) { f.notify('JÁ HÁ UMA REGRA EM JOGO'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      const opp = f.opponent;
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('host_cast', { restart: true, duration: a.windup + 0.3 });
      world.audio.play('heartbeat', { volume: 0.8 });
      const glow = world.fx.emitter({ rate: 50, follow: () => handL(f), particle: { color: a.color, speed: 1, spread: 0.5, life: 0.35, size: 0.16 } });
      tl.add(a.windup, () => {
        glow.stop();
        const rule = pickChaos(f, RULES, 'rule', { boost: chaosBoost(f) });
        world.showBanner(rule.text, f.def.color);
        world.audio.play('ritual', { volume: 0.9, pitch: 0.8 });
        world.fx.flash(handL(f), { color: a.color, size: 3, life: 0.25 });
        world.screenFlash && world.screenFlash('#2a0a40', 0.15);
        const both = [f, opp].filter(Boolean);
        both.forEach((x) => x.notify('REGRA: ' + rule.text, true));
        const st = new Map(both.map((x) => [x, { jumps: x.jumps || 0, dashes: x.dashes || 0, t: 0, prev: x.state, head: null, grace: 0 }]));
        let t = 0;
        let pulse = 0;
        let far = 0;
        world.activeRule = rule.id;
        world.addTicker({
          update(dt) {
            t += dt;
            pulse -= dt;
            if (pulse <= 0) {
              pulse = 0.45;
              for (const x of both) if (alive(x)) world.fx.ring(V(x.pos.x, 0.06, x.pos.z), { color: a.color, radius: 1.1, life: 0.4, inner: 0.85 });
            }
            for (const x of both) {
              if (!alive(x) || world.cinematic) continue;
              const s = st.get(x);
              s.grace -= dt;
              const speed = Math.hypot(x.vel.x, x.vel.z);
              switch (rule.id) {
                case 'jump': if ((x.jumps || 0) > s.jumps) { s.jumps = x.jumps; punish(world, f, x, a.damage, a); } break;
                case 'dash': if ((x.dashes || 0) > s.dashes) { s.dashes = x.dashes; punish(world, f, x, a.damage, a); } break;
                case 'block':
                  s.t = x.isGuarding() ? s.t + dt : 0;
                  if (s.t >= 0.6) { s.t = 0; punish(world, f, x, a.damage * 0.6, a); }
                  break;
                case 'still': {
                  const moving = speed > 0.6 || !x.onGround || x.state !== 'idle';
                  s.t = moving ? 0 : s.t + dt;
                  if (s.t >= 1.2) { s.t = 0; punish(world, f, x, a.damage * 0.6, a); }
                  break;
                }
                case 'move':
                  s.t = speed > 0.6 || !x.onGround ? 0 : s.t + dt; // atacar parado também conta como parado
                  if (s.t >= 0.9) { s.t = 0; punish(world, f, x, a.damage * 0.5, a); }
                  break;
                case 'attack':
                  if ((x.state === 'attack' || x.state === 'ranged') && s.prev !== x.state && s.grace <= 0) { s.grace = 0.8; punish(world, f, x, a.damage * 0.7, a); }
                  s.prev = x.state;
                  break;
                case 'turn': {
                  // andar muito tempo na mesma direção é proibido: a cada ~1,8 s andando tem que virar (> 60°)
                  if (speed < 0.6) break;
                  const h = Math.atan2(x.vel.x, x.vel.z);
                  if (s.head === null) s.head = h;
                  const d = Math.abs(Math.atan2(Math.sin(h - s.head), Math.cos(h - s.head)));
                  if (d > 1.05) { s.head = h; s.t = 0; } else s.t += dt;
                  if (s.t >= 1.8) { s.t = 0; s.head = h; punish(world, f, x, a.damage * 0.5, a); }
                  break;
                }
                default: break;
              }
            }
            if (rule.id === 'approach' && both.length === 2 && !world.cinematic && both.every(alive)) {
              // longe demais um do outro: os dois são punidos
              far = distXZ(both[0].pos, both[1].pos) > 6.5 ? far + dt : 0;
              if (far >= 1.3) { far = 0; both.forEach((x) => punish(world, f, x, a.damage * 0.5, a)); }
            }
            return t >= a.duration || both.some((x) => !alive(x));
          },
          dispose() { world.activeRule = null; },
        });
      });
      tl.end(a.windup + 0.3);
      return seqFrom(tl, { cancel: () => glow.stop() });
    },
  },

  // ---------------------------------------------------------------- Chicotada do Caos
  // Os cabos de Energia viram chicote: alcance longo, e o estalo tem um efeito sorteado (puxar / choque / lento / lançar)
  chaosWhip: {
    start(f, a, world) {
      const opp = f.opponent;
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('host_lash', { restart: true, duration: a.windup + a.recovery });
      world.audio.play('swing', { volume: 0.5 });
      const glow = world.fx.emitter({ rate: 40, follow: () => handL(f), particle: { color: PINK, speed: 1.2, spread: 0.4, life: 0.3, size: 0.14 } });
      const FX = [
        { id: 'puxar', tier: 'common', label: 'PUXÃO!' },
        { id: 'choque', tier: 'common', label: 'CHOQUE!' },
        { id: 'lento', tier: 'uncommon', label: 'LENTO!' },
        { id: 'lancar', tier: 'uncommon', label: 'PARA O ALTO!' },
      ];
      tl.add(a.windup, () => {
        glow.stop();
        if (!opp) return;
        if (opp) f.yaw = yawTo(f.pos, opp.pos);
        const e = pickChaos(f, FX, 'whip');
        const hit = lash(world, f, opp, {
          damage: a.damage, range: a.range, pull: e.id === 'puxar', color: NEON[Math.floor(Math.random() * 3)],
          extra: (o) => {
            if (e.id === 'choque') o.stun(0.4, 'stagger');
            if (e.id === 'lento') o.addBuff({ type: 'chaosSlow', name: 'LENTO', time: 2, duration: 2, speedMult: 0.65 });
            if (e.id === 'lancar') o.react({ dir: forwardFromYaw(f.yaw), knockback: 1, hitstun: 0.6, launch: true, high: true });
          },
        });
        if (hit) f.notify(e.label, true);
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: () => glow.stop() });
    },
  },

  // ---------------------------------------------------------------- Distorção
  // Some numa dobra da Realidade e reaparece num ponto sorteado (atrás / do lado / longe); o adversário fica virado
  // para o lado errado e a tela distorce. Não é totalmente segura: às vezes o truque FALHA e ele surge na frente.
  hostDistortion: {
    start(f, a, world) {
      const opp = f.opponent;
      if (!alive(opp)) return null;
      const tl = new Timeline();
      const gone = a.gone ?? 0.32;
      f.vel.set(0, 0, 0);
      f.anim.play('vanish', { restart: true, duration: 0.25 });
      world.audio.play('teleport');
      f.invuln = 0.25 + gone;
      const SPOTS = [
        { id: 'atras', tier: 'common' },
        { id: 'lado', tier: 'common' },
        { id: 'longe', tier: 'uncommon' },
        { id: 'falha', tier: 'rare' },
      ];
      let spot = null;
      tl.add(0.22, () => {
        world.fx.distort(f.chestPos(), { color: PURPLE, radius: 2.4, life: 0.5 });
        world.fx.burst(f.chestPos(), { count: 24, color: PINK, speed: 4, life: 0.4, size: 0.18 });
        f.setVisible(false);
        world.cameraRig.shake(0.3, 0.35);
        world.screenFlash && world.screenFlash('#1a0630', 0.18);
      });
      tl.add(0.22 + gone, () => {
        if (!alive(opp)) { f.setVisible(true); return; }
        spot = pickChaos(f, SPOTS, 'distortion');
        const others = [{ x: opp.pos.x, z: opp.pos.z, r: 0.7 }];
        let p = null;
        if (spot.id === 'atras') p = findSpotBehind(world.arena, { x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw }, { distance: 1.7, radius: f.radius });
        else if (spot.id === 'lado') {
          const s = forwardFromYaw(opp.yaw + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2);
          p = findFreeSpotNear(world.arena, opp.pos.x + s.x * 2.2, opp.pos.z + s.z * 2.2, { radius: f.radius, others });
        } else if (spot.id === 'longe') {
          const ang = Math.random() * Math.PI * 2;
          p = findFreeSpotNear(world.arena, opp.pos.x + Math.sin(ang) * 6, opp.pos.z + Math.cos(ang) * 6, { radius: f.radius, others });
        } else {
          const F = forwardFromYaw(opp.yaw);
          p = findFreeSpotNear(world.arena, opp.pos.x + F.x * 1.6, opp.pos.z + F.z * 1.6, { radius: f.radius, others });
        }
        if (p) f.pos.set(p.x, 0, p.z);
        f.vel.set(0, 0, 0);
        f.yaw = yawTo(f.pos, opp.pos);
        f.setVisible(true);
        f.invuln = 0.08;
        world.fx.distort(f.chestPos(), { color: PINK, radius: 2, life: 0.4 });
        world.audio.play('blink', { volume: 0.7 });
        if (spot.id === 'falha') {
          f.notify('O TRUQUE FALHOU', true);
          world.audio.play('denied', { volume: 0.6 });
          return;
        }
        // o adversário volta virado para o lado errado, desorientado
        opp.yaw += Math.PI + (Math.random() - 0.5) * 0.8;
        opp.surprised = a.surprise ?? 0.6;
        opp.notify('DESORIENTADO', true);
        world.fx.distort(opp.chestPos(), { color: BLUE, radius: 2.6, life: 0.5 });
      });
      // reaparece meio torto: um instante aberto
      tl.add(0.24 + gone, () => f.anim.play('host_tilt', { restart: true, duration: a.recovery ?? 0.3 }));
      tl.end(0.24 + gone + (a.recovery ?? 0.3));
      return seqFrom(tl, { cancel: () => f.setVisible(true), cancelable: () => tl.time > 0.3 + gone });
    },
  },

  // ---------------------------------------------------------------- Tempo Distorcido
  // Os ponteiros enlouquecem: ele fica mais rápido (anda e bate), recupera as esquivas e o tempo em volta do adversário
  // pesa por alguns segundos
  hostTime: {
    start(f, a, world) {
      if (f.findBuff('deadlySpeed')) { f.notify('JÁ ATIVO'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('host_cast', { restart: true, duration: 0.6 });
      world.audio.play('tick', { volume: 0.8 });
      for (let i = 1; i < 6; i++) world.after(i * 0.07, () => world.audio.play('tick', { volume: 0.6 }));
      tl.add(0.35, () => {
        const opp = f.opponent;
        const hand = handL(f);
        for (let i = 0; i < 3; i++) world.fx.ring(hand, { color: NEON[i], radius: 1.6 + i * 0.6, life: 0.5, vertical: true, yaw: f.yaw + i });
        const trail = world.fx.emitter({ rate: 26, follow: () => f.chestPos(), particle: { color: BLUE, speed: 0.5, spread: 0.4, life: 0.35, size: 0.14 } });
        f.dodges = Math.max(f.dodges, a.refillDodges ?? 4);
        f.addBuff({ type: 'deadlySpeed', name: 'TEMPO DISTORCIDO', time: a.duration, duration: a.duration, speedMult: a.speedMult, atkSpeed: a.atkSpeed, onEnd() { trail.stop(); } });
        f.notify('TEMPO DISTORCIDO', true);
        if (alive(opp) && distXZ(f.pos, opp.pos) <= (a.range ?? 14)) {
          const old = opp.findBuff('chaosSlow');
          if (old) old.time = a.slowTime;
          else opp.addBuff({ type: 'chaosSlow', name: 'TEMPO PESADO', time: a.slowTime, duration: a.slowTime, speedMult: a.slow });
          world.fx.distort(opp.chestPos(), { color: BLUE, radius: 2.2, life: 0.5 });
        }
      });
      tl.end(0.6);
      return seqFrom(tl);
    },
  },

  // ---------------------------------------------------------------- A Plateia
  // Vira para a CÂMERA (a plateia), se curva e recebe os aplausos: sanidade de volta, rituais e □ mais fortes e o caos
  // fica mais generoso com o raro. Fica parado e aberto durante o número.
  hostAudience: {
    start(f, a, world) {
      if (f.findBuff('audience')) { f.notify('A PLATEIA JÁ ESTÁ ASSISTINDO'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      const cam = world.camera.position;
      f.yaw = Math.atan2(cam.x - f.pos.x, cam.z - f.pos.z);
      f.anim.play('host_look', { restart: true, duration: 0.45 });
      tl.each(() => { f.yaw = Math.atan2(cam.x - f.pos.x, cam.z - f.pos.z); });
      tl.add(0.45, () => { f.anim.play('host_bow', { restart: true, duration: 0.75 }); world.audio.play('applause', { volume: 0.8 }); });
      tl.add(0.85, () => {
        world.audio.play('applause', { volume: 0.6 });
        const trail = world.fx.emitter({ rate: 20, follow: () => f.chestPos(), particle: { color: PINK, speed: 0.4, spread: 0.5, life: 0.4, size: 0.14 } });
        f.addBuff({ type: 'audience', name: 'A PLATEIA', time: a.duration, duration: a.duration, mult: a.damageMult, affects: a.affects, onEnd() { trail.stop(); } });
        f.addEnergy(a.energy ?? 20);
        f.notify('A PLATEIA APLAUDE', true);
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          world.fx.burst(V(f.pos.x + Math.sin(ang) * 2.5, 2.2, f.pos.z + Math.cos(ang) * 2.5), { count: 6, color: NEON[i % 3], speed: 1.5, life: 0.6, size: 0.16 });
        }
      });
      tl.end(a.animTime ?? 1.2);
      return seqFrom(tl);
    },
  },

  // ---------------------------------------------------------------- Botão do Anfitrião
  // Um botão paranormal sobe do chão. Ele agacha, a mão paira... (tensão, tique-taque)... aperta: um EVENTO DO CAOS
  // sorteado (comum → muito raro, com histórico e combinações). Depois ri.
  hostButton: {
    start(f, a, world) {
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      const opp = f.opponent;
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      const F = forwardFromYaw(f.yaw);
      const at = V(f.pos.x + F.x * 0.75, 0, f.pos.z + F.z * 0.75);
      const btn = new THREE.Group();
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a1420, roughness: 0.6, metalness: 0.4 });
      const capMat = new THREE.MeshStandardMaterial({ color: 0xc0306a, emissive: 0xb04aff, emissiveIntensity: 0.6, roughness: 0.3 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.14, 20), baseMat);
      base.position.y = 0.07;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 20), capMat);
      cap.position.y = 0.2;
      const ringMat = new THREE.MeshBasicMaterial({ color: PURPLE, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 24), ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      btn.add(base, cap, ring);
      btn.position.copy(at).setY(-0.3);
      world.scene.add(btn);
      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        world.scene.remove(btn);
        btn.traverse((o) => o.geometry && o.geometry.dispose());
        [baseMat, capMat, ringMat].forEach((m) => m.dispose());
      };
      f.anim.play('host_press', { restart: true, duration: a.pressAt + 0.3 });
      world.audio.play('heartbeat', { volume: 0.6 });
      let tick = 0;
      let pressed = false;
      tl.each((t, dt) => {
        // sobe do chão; brilha mais forte e o tique-taque acelera até apertar
        btn.position.y = Math.min(0, -0.3 + t * 1.2);
        if (!pressed) {
          tick -= dt;
          if (tick <= 0) {
            tick = 0.22 - 0.14 * Math.min(1, t / a.pressAt);
            world.audio.play('tick', { volume: 0.6 });
          }
          capMat.emissiveIntensity = 0.6 + Math.sin(t * 30) * 0.4 + t;
          ring.rotation.z += dt * 4;
        } else {
          cap.position.y = 0.14;
          btn.position.y -= dt * 0.5;
        }
      });
      tl.add(a.pressAt, () => {
        pressed = true;
        world.audio.play('button', { volume: 1 });
        world.fx.flash(at.clone().setY(0.3), { color: PINK, size: 2.4, life: 0.2 });
        world.fx.ring(at.clone().setY(0.05), { color: PURPLE, radius: 3, life: 0.5 });
        const { label } = runChaosEvent(f, 'button');
        world.showBanner(label, f.def.color);
      });
      tl.add(a.pressAt + 0.35, () => { f.anim.play('host_laugh', { restart: true, duration: 0.8 }); world.audio.play('laugh', { volume: 0.7 }); });
      tl.add(a.pressAt + 1.0, cleanup);
      tl.end(a.pressAt + 1.0);
      return seqFrom(tl, { cancel: cleanup, cancelable: () => pressed && tl.time > a.pressAt + 0.45 });
    },
  },

  // ---------------------------------------------------------------- Jogo do Orfanato
  orphanGame: {
    start(f, a, world) {
      if (world.orphanGame) { f.notify('O JOGO JÁ COMEÇOU'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('host_present', { restart: true, duration: 0.7 });
      world.audio.play('ritual', { volume: 0.8, pitch: 0.6 });
      tl.add(0.5, () => {
        startOrphanGame(world, f, { duration: a.duration, tick: a.tick, drain: a.drain, damage: a.damage, radius: a.radius });
        world.audio.play('laugh', { volume: 0.6 });
      });
      tl.end(0.8);
      return seqFrom(tl);
    },
  },

  // ---------------------------------------------------------------- Multiplicação
  // Cópias de Energia (tempo limitado, no máximo 3): atacam, correm, confundem e explodem no fim perto do alvo.
  // Às vezes ele troca de lugar com uma delas.
  hostClones: {
    start(f, a, world) {
      if (hostClones(world, f).length >= 3) { f.notify('A PLATEIA JÁ ESTÁ CHEIA'); return null; }
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play('host_cast', { restart: true, duration: 0.55 });
      world.audio.play('teleport');
      tl.add(0.3, () => {
        const made = spawnClones(world, f, a.clones ?? 2, a.duration ?? 5);
        f.notify('MULTIPLICAÇÃO', true);
        if (made.length && Math.random() < (a.swapChance ?? 0.4)) {
          // troca de lugar com uma cópia: quem é o verdadeiro?
          const c = made[Math.floor(Math.random() * made.length)];
          const p = f.pos.clone();
          f.pos.set(c.pos.x, 0, c.pos.z);
          c.pos.copy(p);
          const opp = f.opponent;
          if (opp) f.yaw = yawTo(f.pos, opp.pos);
          world.fx.burst(f.chestPos(), { count: 10, color: PINK, speed: 2, life: 0.3, size: 0.14 });
        }
      });
      tl.add(0.45, () => world.audio.play('laugh', { volume: 0.5 }));
      tl.end(0.6);
      return seqFrom(tl);
    },
  },

  // ---------------------------------------------------------------- Tradição de Família
  // Junta a Energia entre as mãos (parado, tremendo, dá para interromper) e explode em volta de si.
  familyTradition: {
    start(f, a, world) {
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      const opp = f.opponent;
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('host_charge', { restart: true, duration: a.windup / 0.85 });
      world.audio.play('powerUp', { volume: 0.6 });
      const core = () => f.chestPos().addScaledVector(forwardFromYaw(f.yaw), 0.45);
      const gather = world.fx.emitter({ rate: 70, follow: core, particle: { color: PURPLE, speed: -2.5, spread: 1.6, life: 0.35, size: 0.16 } });
      let ringT = 0;
      tl.each((t, dt) => {
        ringT -= dt;
        if (t < a.windup && ringT <= 0) {
          ringT = 0.16;
          world.fx.ring(V(f.pos.x, 0.07, f.pos.z), { color: NEON[Math.floor(t * 6) % 3], radius: a.radius * (1 - t / a.windup) + 0.6, life: 0.2, inner: 0.85 });
        }
      });
      tl.add(a.windup, () => {
        gather.stop();
        const c = core();
        world.fx.flash(c, { color: WHITE, size: a.radius * 2.2, life: 0.2 });
        for (let i = 0; i < 3; i++) world.fx.ring(V(f.pos.x, 0.1 + i * 0.4, f.pos.z), { color: NEON[i], radius: a.radius * (1.1 + i * 0.2), life: 0.5 });
        world.fx.burst(c, { count: 70, color: PURPLE, speed: 9, life: 0.6, size: 0.24 });
        world.fx.burst(c, { count: 40, color: PINK, speed: 6, life: 0.5, size: 0.2 });
        world.fx.distort(c, { color: PURPLE, radius: a.radius, life: 0.5 });
        world.cameraRig.shake(0.6, 0.35);
        world.screenFlash && world.screenFlash('#2a0a40', 0.2);
        world.audio.play('explosion', { volume: 1, pitch: 0.9 });
        if (alive(opp) && distXZ(f.pos, opp.pos) <= a.radius + opp.radius && Math.abs(opp.pos.y - f.pos.y) < 2.5) {
          applyHit(world, f, opp, { damage: a.damage, kind: 'ability', element: 'energia', knockback: a.knockback ?? 7, hitstun: 0.6, launch: true, dir: opp.pos.clone().sub(f.pos).setY(0).normalize(), color: PURPLE, sound: 'explosion', scale: 1.8 });
        }
        for (const n of world.hostileNpcs(f)) if (distXZ(f.pos, n.pos) <= a.radius) n.hitBy(f, a.damage, { kind: 'ability' });
      });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: () => gather.stop() });
    },
  },
});

