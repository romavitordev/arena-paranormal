import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { trySpecialBlock, splitDamage } from './common.js';
import { faceClose, orbit, pullBack, lowAngle } from '../../camera/shots.js';
import { pickChaos, HostClone, PURPLE, PINK, BLUE, YELLOW, GREEN, RED, NEON } from '../chaos.js';
import { findSpotBehind } from '../positioning.js';

// O JOGO DO ANFITRIÃO (ultimate do Anfitrião) — um programa de auditório da Realidade:
//  0. AVISO (telegraph.js): ergue o relógio com a Relíquia e um sigilo pulsa no chão do alvo — dá para sair do
//     alcance, esquivar no fim do aviso ou defender de frente;
//  1. O APRESENTADOR: close nele, braços abertos para a plateia (aplausos);
//  2. O PALCO: um palco de luz neon se acende debaixo do alvo, holofote roxo;
//  3. A ROLETA: uma roleta gigante de 7 casas gira em cima do alvo e desacelera até parar;
//  4. O RESULTADO: RAIO · CHOQUE · TROCA · EXPLOSÃO · CLONES · CHICOTE · DISTORÇÃO — cada um com a sua cena;
//  5. A REVERÊNCIA para a plateia.
// Variações raras (sorteadas com histórico): ri no meio da roleta, olha o relógio antes do resultado, a roleta FALHA e
// gira de novo, aparece ATRÁS do alvo para a reverência, um clone participa da reverência.
// O aleatório fica só no sabor: o dano fica SEMPRE entre sp.minDamage e sp.maxDamage (nunca mata com a vida cheia).
export const SLOTS = [
  { id: 'raio', tier: 'common', label: 'RAIO!', color: PURPLE, k: 0.85 },
  { id: 'choque', tier: 'common', label: 'CHOQUE!', color: YELLOW, k: 0.55 },
  { id: 'chicote', tier: 'common', label: 'CHICOTE!', color: PINK, k: 0.65 },
  { id: 'troca', tier: 'uncommon', label: 'TROCA!', color: GREEN, k: 0.2 },
  { id: 'distorcao', tier: 'uncommon', label: 'DISTORÇÃO!', color: BLUE, k: 0.4 },
  { id: 'explosao', tier: 'uncommon', label: 'EXPLOSÃO!', color: RED, k: 1 },
  { id: 'clones', tier: 'rare', label: 'CLONES!', color: 0xffffff, k: 0.5 },
];
const VARIATIONS = [
  { id: 'none', tier: 'common', weight: 2 },
  { id: 'laugh', tier: 'uncommon' },
  { id: 'watch', tier: 'uncommon' },
  { id: 'restart', tier: 'rare' },
  { id: 'behind', tier: 'rare' },
  { id: 'clone', tier: 'rare' },
];

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const hex = (c) => '#' + new THREE.Color(c).getHexString();

// a roleta: disco com 7 casas coloridas e os nomes (textura desenhada num canvas)
function buildWheel() {
  const N = SLOTS.length;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 512;
  const g = cv.getContext('2d');
  const seg = (Math.PI * 2) / N;
  g.fillStyle = '#0a0410';
  g.beginPath(); g.arc(256, 256, 254, 0, Math.PI * 2); g.fill();
  SLOTS.forEach((s, i) => {
    const a0 = -Math.PI / 2 + i * seg;
    g.fillStyle = hex(s.color);
    g.globalAlpha = 0.85;
    g.beginPath(); g.moveTo(256, 256); g.arc(256, 256, 236, a0 + 0.02, a0 + seg - 0.02); g.closePath(); g.fill();
    g.globalAlpha = 1;
    g.save();
    g.translate(256, 256);
    g.rotate(a0 + seg / 2);
    g.fillStyle = s.id === 'clones' ? '#2a0a40' : '#ffffff';
    g.strokeStyle = '#000000';
    g.lineWidth = 5;
    g.font = 'bold 30px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const txt = s.label.replace('!', '');
    g.strokeText(txt, 150, 0);
    g.fillText(txt, 150, 0);
    g.restore();
  });
  g.strokeStyle = '#b04aff'; g.lineWidth = 10;
  g.beginPath(); g.arc(256, 256, 244, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(256, 256, 34, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#b04aff'; g.beginPath(); g.arc(256, 256, 22, 0, Math.PI * 2); g.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const group = new THREE.Group();
  const discMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), discMat);
  group.add(disc);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pin = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.36, 4), pinMat);
  pin.position.set(0, 1.62, 0.02);
  pin.rotation.z = Math.PI; // aponta para baixo, para a casa de cima
  group.add(pin);
  return { group, disc, pin, mats: [discMat, pinMat], tex, seg };
}

// palco: anéis de neon no chão em volta do alvo
function buildStage(at) {
  const group = new THREE.Group();
  const mats = [];
  NEON.forEach((c, i) => {
    const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    mats.push(m);
    const r = new THREE.Mesh(new THREE.RingGeometry(1.5 + i * 0.35, 1.65 + i * 0.35, 48), m);
    r.rotation.x = -Math.PI / 2;
    r.position.y = 0.05 + i * 0.005;
    group.add(r);
  });
  group.position.set(at.x, 0, at.z);
  return { group, mats };
}

export const hostGame = {
  telegraph: () => ({ time: 1.0, anim: 'host_cast', animDuration: 1.0, mark: 'sigil' }),
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 18);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    if (trySpecialBlock(world, f, opp, sp)) return { update: () => true, cancel() {} };
    const lo = sp.minDamage ?? 200;
    const hi = sp.maxDamage ?? 300;
    const pick = pickChaos(f, SLOTS, 'ultSlot');
    const vari = pickChaos(f, VARIATIONS, 'ultVar');
    const damage = Math.round(lo + (hi - lo) * (pick.k * 0.8 + Math.random() * 0.2));
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.vel.set(0, 0, 0);
    opp.yaw = yawTo(opp.pos, f.pos);
    opp.anim.play('fear', { restart: true });

    // ---- objetos da cena
    const stage = buildStage(opp.pos);
    world.scene.add(stage.group);
    const wheel = buildWheel();
    const toHost = V(f.pos.x - opp.pos.x, 0, f.pos.z - opp.pos.z).normalize();
    const wheelAt = V(opp.pos.x - toHost.x * 0.6, 3.5, opp.pos.z - toHost.z * 0.6);
    wheel.group.position.copy(wheelAt);
    wheel.group.lookAt(V(f.pos.x, 2.6, f.pos.z));
    wheel.group.scale.setScalar(0.01);
    world.scene.add(wheel.group);
    const spot = new THREE.PointLight(PURPLE, 0, 9, 1.5);
    spot.position.set(opp.pos.x, 3, opp.pos.z);
    world.scene.add(spot);
    const extras = []; // clones de cena (sem IA: só aparecem nesta cinemática)
    const sceneClone = (pos, idx) => {
      const c = new HostClone(f, world, idx, 99, { explode: 0 });
      c.pos.copy(pos);
      c.yaw = yawTo(c.pos, opp.pos);
      c.rig.root.position.copy(c.pos);
      c.rig.root.rotation.y = c.yaw;
      extras.push(c);
      return c;
    };

    // ---- tempos (a roleta que falha gira duas vezes)
    const T_STAGE = 1.0;
    const T_WHEEL = 1.6;
    const SPIN = 2.0;
    const restart = vari.id === 'restart';
    const T_STOP = T_WHEEL + SPIN + (restart ? 1.4 : 0);
    const T_WATCH = vari.id === 'watch' ? 0.7 : 0;
    const T_RES = T_STOP + 0.55 + T_WATCH;
    const T_BOW = T_RES + 1.15;
    const END = T_BOW + 1.0;

    const wheelShot = (dur) => ({
      dur, fov: 46,
      pos: (t) => V(f.pos.x + toHost.x * (2.2 + t * 0.4), 2.4 + t * 0.2, f.pos.z + toHost.z * (2.2 + t * 0.4)).add(V(-toHost.z * 1.1, 0, toHost.x * 1.1)),
      look: () => wheelAt.clone().setY(2.6),
    });
    const hy = f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).y - f.pos.y;
    world.cameraRig.playShots([
      faceClose(f, { dur: T_STAGE, from: 2.2, to: 1.5, side: 0.4, height: hy, fov: 36 }),
      orbit(opp, { dur: T_WHEEL - T_STAGE, radius: 4.6, height: 2.2, a0: -0.9, a1: -0.3, lookH: 1.0, fov: 50 }),
      wheelShot(T_STOP - T_WHEEL + 0.5 + T_WATCH),
      lowAngle(opp, { dur: T_BOW - (T_STOP + 0.5 + T_WATCH), dist: 3.2, side: 1.4 }),
      faceClose(f, { dur: 0.6, from: 2.0, to: 1.6, side: -0.3, height: hy, fov: 38 }),
      pullBack(f, opp, { dur: END - T_BOW - 0.6 + 0.2, from: 4, to: 7.5, height: 2.4, side: -1 }),
    ]);

    const tl = new Timeline();
    // 1. o apresentador
    f.anim.play('host_present', { restart: true, duration: 0.9 });
    world.showBanner(sp.banner || 'O Jogo do Anfitrião', f.def.color);
    world.audio.play('applause', { volume: 0.9 });
    tl.add(0.55, () => world.audio.play('laugh', { volume: 0.5 }));
    // 2. o palco
    tl.add(T_STAGE, () => {
      world.audio.play('ritual', { volume: 0.8, pitch: 0.9 });
      world.fx.ring(V(opp.pos.x, 0.06, opp.pos.z), { color: PINK, radius: 3.4, life: 0.5 });
    });
    // 3. a roleta: cresce, gira e desacelera; casas e luz
    let rot = 0;
    let tickT = 0;
    const finalRot = (i, turns) => (i + 0.5) * wheel.seg + Math.PI * 2 * turns;
    const idx = SLOTS.indexOf(pick);
    const fakeIdx = (idx + 3) % SLOTS.length;
    // primeira volta da roleta que falha: para "entre" duas casas
    const spin1 = restart ? finalRot(fakeIdx, 5) + wheel.seg * 0.5 : finalRot(idx, 6);
    tl.each((t, dt) => {
      const kS = Math.min(1, Math.max(0, (t - T_STAGE) / 0.5));
      stage.mats.forEach((m, i) => { m.opacity = kS * (0.6 + 0.3 * Math.sin(t * 8 + i)); });
      spot.intensity = kS * 10;
      const kW = Math.min(1, Math.max(0, (t - (T_WHEEL - 0.4)) / 0.4));
      wheel.group.scale.setScalar(Math.max(0.01, kW));
      let target = rot;
      if (t >= T_WHEEL && t < T_WHEEL + SPIN) {
        const x = (t - T_WHEEL) / SPIN;
        target = spin1 * (1 - (1 - x) ** 3);
      } else if (restart && t >= T_WHEEL + SPIN + 0.6 && t < T_STOP) {
        const x = (t - (T_WHEEL + SPIN + 0.6)) / (T_STOP - (T_WHEEL + SPIN + 0.6));
        target = spin1 + (finalRot(idx, 9) - spin1) * (1 - (1 - x) ** 3);
      }
      const dRot = target - rot;
      rot = target;
      wheel.disc.rotation.z = rot;
      tickT += dRot;
      if (tickT > wheel.seg) { tickT = 0; world.audio.play('tick', { volume: 0.6 }); }
      opp.vel.set(0, 0, 0);
      for (const c of extras) { c.anim.update(dt); c.rig.root.position.copy(c.pos); c.rig.root.rotation.y = c.yaw; }
    });
    tl.add(T_WHEEL - 0.3, () => { f.anim.play('host_cast', { restart: true, duration: SPIN }); world.audio.play('powerUp', { volume: 0.4 }); });
    if (vari.id === 'laugh') tl.add(T_WHEEL + 0.8, () => { f.anim.play('host_laugh', { restart: true, duration: 1.0 }); world.audio.play('laugh', { volume: 0.9 }); });
    if (restart) {
      tl.add(T_WHEEL + SPIN, () => {
        // ERRO: faíscas, a roleta pisca... e ele bate no relógio e gira de novo
        world.showBanner('ERRO NA ROLETA', '#ff6ad0');
        world.audio.play('denied', { volume: 0.9 });
        for (let i = 0; i < 6; i++) world.fx.lightning(wheelAt, wheelAt.clone().add(V((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 1)), { color: NEON[i % 3], life: 0.3 });
        f.anim.play('host_tilt', { restart: true, duration: 0.6 });
      });
      tl.add(T_WHEEL + SPIN + 0.5, () => { f.anim.play('host_cast', { restart: true, duration: 1.0 }); world.audio.play('tick', { volume: 1 }); });
    }
    tl.add(T_STOP, () => {
      wheel.pin.material.color.setHex(pick.color);
      world.fx.flash(wheelAt, { color: pick.color, size: 4, life: 0.3 });
      spot.color.setHex(pick.color);
      spot.intensity = 18;
      world.showBanner(pick.label, hex(pick.color));
      world.audio.play('confirm', { volume: 1 });
      opp.notify(pick.label, true);
    });
    if (vari.id === 'watch') {
      tl.add(T_STOP + 0.25, () => { f.anim.play('watch_raise', { restart: true, duration: T_WATCH + 0.2 }); });
      for (let i = 0; i < 4; i++) tl.add(T_STOP + 0.3 + i * 0.15, () => world.audio.play('tick', { volume: 0.9 }));
    }

    // 4. o resultado (dano total = damage, dividido em partes conforme a cena)
    const R = T_RES;
    const hit = (dmg, color, scale = 1.6, sound = 'impact') => applyHit(world, f, opp, { damage: dmg, kind: 'special', element: 'energia', reaction: false, ignoreInvuln: true, sound, color, scale });
    const p0 = () => opp.chestPos();
    const g0 = () => V(opp.pos.x, 0.08, opp.pos.z);
    let after = null; // efeito depois que a cena acaba
    if (pick.id === 'raio') {
      const parts = splitDamage(damage, [0.2, 0.2, 0.6]);
      [0, 0.25, 0.55].forEach((dt, i) => tl.add(R + dt, () => {
        const p = p0();
        for (let k = 0; k < (i === 2 ? 7 : 3); k++) world.fx.lightning(p.clone().add(V((Math.random() - 0.5) * 2, 7, (Math.random() - 0.5) * 2)), p, { color: NEON[k % 3], life: 0.35 });
        world.fx.flash(p, { color: PURPLE, size: i === 2 ? 5 : 2.5, life: 0.25 });
        world.cameraRig.shake(i === 2 ? 0.7 : 0.3, 0.3);
        hit(parts[i], PURPLE, i === 2 ? 2.2 : 1.2);
        if (opp.state !== 'ko') opp.anim.play(i === 2 ? 'stagger' : 'hit', { restart: true });
      }));
      after = () => opp.react({ dir: forwardFromYaw(f.yaw), knockback: 4, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
    } else if (pick.id === 'choque') {
      const parts = splitDamage(damage, [0.25, 0.25, 0.5]);
      [0, 0.3, 0.6].forEach((dt, i) => tl.add(R + dt, () => {
        const p = p0();
        world.fx.lightning(f.chestPos(), p, { color: YELLOW, life: 0.3 });
        for (let k = 0; k < 4; k++) world.fx.lightning(p, p.clone().add(V((Math.random() - 0.5) * 2, Math.random() * 1.6, (Math.random() - 0.5) * 2)), { color: YELLOW, life: 0.25 });
        hit(parts[i], YELLOW, 1.4);
        if (opp.state !== 'ko') opp.anim.play('stagger', { restart: true });
      }));
      after = () => opp.stun(sp.stun ?? 1.2, 'stagger');
    } else if (pick.id === 'chicote') {
      const parts = splitDamage(damage, [0.2, 0.2, 0.2, 0.4]);
      [0, 0.18, 0.36, 0.62].forEach((dt, i) => tl.add(R + dt, () => {
        f.anim.play('host_lash', { restart: true, duration: 0.3 });
        const from = f.rig.sockets.handL.getWorldPosition(new THREE.Vector3());
        const p = p0();
        for (let k = 0; k < 3; k++) world.fx.lightning(from, p.clone().add(V((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0)), { color: NEON[(i + k) % 3], life: 0.22, segments: 10, jitter: 0.25 });
        world.fx.slash(p, f.yaw, { color: PINK, radius: 1.8, roll: i * 0.7, life: 0.3, width: 0.4 });
        world.audio.play('whip', { volume: 0.9 });
        hit(parts[i], PINK, i === 3 ? 2 : 1.2);
        if (opp.state !== 'ko') opp.anim.play('hit', { restart: true });
      }));
      after = () => {
        const F = forwardFromYaw(yawTo(f.pos, opp.pos));
        opp.pullTo(V(f.pos.x + F.x * 1.6, opp.pos.y, f.pos.z + F.z * 1.6), { time: 0.25, after: 0.7 });
      };
    } else if (pick.id === 'troca') {
      tl.add(R, () => {
        const a = f.pos.clone();
        const b = opp.pos.clone();
        world.fx.burst(V(a.x, 1, a.z), { count: 30, color: GREEN, speed: 4, life: 0.5, size: 0.2 });
        world.fx.burst(V(b.x, 1, b.z), { count: 30, color: GREEN, speed: 4, life: 0.5, size: 0.2 });
        f.pos.set(b.x, 0, b.z);
        opp.pos.set(a.x, 0, a.z);
        f.yaw = yawTo(f.pos, opp.pos);
        opp.yaw = yawTo(opp.pos, f.pos) + Math.PI;
        world.audio.play('teleport', { volume: 1 });
      });
      tl.add(R + 0.4, () => {
        hit(damage, GREEN, 2);
        world.fx.lightning(f.chestPos(), p0(), { color: GREEN, life: 0.4 });
        const stolen = opp.drainEnergy(sp.steal ?? 30);
        f.addEnergy(stolen);
        f.notify(`+${Math.round(stolen)} SANIDADE`, true);
      });
      after = () => { opp.surprised = 0.6; };
    } else if (pick.id === 'distorcao') {
      const parts = splitDamage(damage, [0.4, 0.6]);
      tl.add(R, () => {
        world.fx.distort(p0(), { color: BLUE, radius: 4, life: 0.8 });
        world.screenFlash && world.screenFlash('#0a1a40', 0.35);
        opp.yaw += Math.PI;
        hit(parts[0], BLUE, 1.6);
      });
      tl.add(R + 0.5, () => { world.fx.distort(p0(), { color: PURPLE, radius: 3, life: 0.6 }); hit(parts[1], PURPLE, 2); world.cameraRig.shake(0.5, 0.4); });
      after = () => {
        opp.surprised = 0.8;
        opp.addBuff({ type: 'chaosInvert', name: 'DESORIENTADO', time: 2.2, duration: 2.2, invertMove: true });
        opp.addBuff({ type: 'chaosSlow', name: 'TEMPO DISTORCIDO', time: 2.2, duration: 2.2, speedMult: 0.7 });
      };
    } else if (pick.id === 'explosao') {
      tl.add(R, () => { world.fx.ring(g0(), { color: RED, radius: 3, life: 0.5, inner: 0.85 }); world.audio.play('heartbeat', { volume: 1 }); });
      tl.add(R + 0.45, () => {
        const p = p0();
        world.fx.flash(p, { color: RED, size: 7, life: 0.3 });
        world.fx.burst(p, { count: 90, color: RED, speed: 9, life: 0.7, size: 0.28 });
        world.fx.burst(p, { count: 40, color: PURPLE, speed: 6, life: 0.6, size: 0.22 });
        world.fx.burst(p, { count: 30, color: 0x2a1030, kind: 'smoke', speed: 3, life: 1, size: 1, grow: 1 });
        world.fx.ring(g0(), { color: RED, radius: 5, life: 0.6 });
        world.screenFlash && world.screenFlash('#401010', 0.3);
        world.cameraRig.shake(0.9, 0.5);
        world.audio.play('explosion', { volume: 1.2, pitch: 0.9 });
        hit(damage, RED, 2.6, 'explosion');
      });
      after = () => opp.react({ dir: forwardFromYaw(f.yaw), knockback: 7, hitstun: COMBAT.launchHitstun, launch: true });
    } else {
      // CLONES: três cópias aparecem em volta e atacam juntas
      const parts = splitDamage(damage, [0.25, 0.25, 0.5]);
      tl.add(R, () => {
        for (let i = 0; i < 3; i++) {
          const ang = yawTo(opp.pos, f.pos) + (i - 1) * 2.1;
          const c = sceneClone(V(opp.pos.x + Math.sin(ang) * 1.3, 0, opp.pos.z + Math.cos(ang) * 1.3), i);
          c.anim.play('dash_punch', { restart: true, duration: 0.5 });
          world.fx.burst(V(c.pos.x, 1, c.pos.z), { count: 18, color: NEON[i], speed: 3, life: 0.4, size: 0.18 });
        }
        world.audio.play('teleport', { volume: 1 });
      });
      [0.3, 0.5, 0.75].forEach((dt, i) => tl.add(R + dt, () => {
        const c = extras[i];
        if (c) c.anim.play(i === 2 ? 'meteor_punch' : 'jab', { restart: true, duration: 0.3 });
        world.fx.burst(p0(), { count: 20, color: NEON[i], speed: 5, life: 0.4, size: 0.2 });
        hit(parts[i], NEON[i], i === 2 ? 2 : 1.3);
        if (opp.state !== 'ko') opp.anim.play('hit', { restart: true });
      }));
      tl.add(R + 1.0, () => { extras.forEach((c) => { world.fx.burst(V(c.pos.x, 1, c.pos.z), { count: 20, color: PURPLE, kind: 'smoke', speed: 2, life: 0.5, size: 0.6 }); c.dispose(); }); extras.length = 0; });
      after = () => opp.react({ dir: forwardFromYaw(f.yaw), knockback: 5, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
    }

    // 5. a reverência
    tl.add(T_BOW, () => {
      if (vari.id === 'behind' && opp.state !== 'ko') {
        const s = findSpotBehind(world.arena, { x: opp.pos.x, z: opp.pos.z, yaw: opp.yaw }, { distance: 1.8, radius: f.radius });
        if (s) {
          world.fx.burst(f.chestPos(), { count: 20, color: PURPLE, kind: 'smoke', speed: 2, life: 0.5, size: 0.6 });
          f.pos.set(s.x, 0, s.z);
          world.audio.play('blink', { volume: 0.8 });
        }
      }
      f.yaw = Math.atan2(world.camera.position.x - f.pos.x, world.camera.position.z - f.pos.z); // para a plateia
      f.anim.play('host_bow', { restart: true, duration: 0.95 });
      world.audio.play('applause', { volume: 0.9 });
      if (vari.id === 'clone') {
        const sR = forwardFromYaw(f.yaw + Math.PI / 2);
        const c = sceneClone(V(f.pos.x + sR.x * 1.2, 0, f.pos.z + sR.z * 1.2), 1);
        c.yaw = f.yaw;
        c.anim.play('host_bow', { restart: true, duration: 0.95 });
      }
    });
    tl.end(END);

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      world.scene.remove(stage.group, wheel.group, spot);
      stage.group.traverse((o) => o.geometry && o.geometry.dispose());
      stage.mats.forEach((m) => m.dispose());
      wheel.group.traverse((o) => o.geometry && o.geometry.dispose());
      wheel.mats.forEach((m) => m.dispose());
      wheel.tex.dispose();
      extras.forEach((c) => c.dispose());
      extras.length = 0;
    };
    return {
      update(dt) {
        const done = tl.update(dt);
        if (done) {
          cleanup();
          world.endCinematic();
          if (opp.state !== 'ko' && after) after();
          if (opp.state !== 'ko') f.yaw = yawTo(f.pos, opp.pos);
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
