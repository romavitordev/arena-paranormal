import * as THREE from 'three';
import { forwardFromYaw } from '../core/util.js';
import { faceClose, twoShot } from '../camera/shots.js';

// CENAS DE AGARRÃO (Defesa + ○): cada personagem agarra do seu jeito e fecha com um golpe dos SEUS poderes.
// Passada a janela de escape (Fighter.tryGrab), a cena roda: dois golpes (`beats`, com as animações do próprio kit) e
// o FINALIZADOR (`fin`), que arremessa. O dano total continua o do agarrão (70: 20% + 20% + 60%); o efeito extra do
// finalizador é pequeno (sangramento curto, um pouco de sanidade, lentidão) — o agarrão não pode virar ritual.
//
//   beats: [{ t, anim, dur, fx: { kind: 'slash'|'punch'|'stab'|'claw'|'smash'|'cross', ... }, sound }]
//   fin:   { t, anim, dur, fx: nome em FINISHERS, sound, bleed, drain, heal, slow }

const v = (x, y, z) => new THREE.Vector3(x, y, z);
const ground = (f) => v(f.pos.x, 0.06, f.pos.z);

// efeitos visuais dos finalizadores (rodam DURANTE a cena; o mundo está parado, só os efeitos andam)
export const FINISHERS = {
  // Kaiser — Acácia (Dissipar Espíritos): explosão de energia roxa com raios em volta do alvo
  acacia(w, a, b, col) {
    const c = b.chestPos();
    w.fx.play('FX_EXPLOSION', c, { color: col, scale: 0.9 });
    for (let i = 0; i < 6; i++) { const ang = (i / 6) * Math.PI * 2; w.fx.lightning(c, c.clone().add(v(Math.sin(ang) * 1.6, (i % 2) * 0.8 - 0.3, Math.cos(ang) * 1.6)), { color: col, life: 0.25 }); }
    w.fx.burst(c, { count: 20, color: 0xb8b4c0, kind: 'smoke', speed: 2, life: 0.8, size: 0.6, grow: 1 });
  },
  // Arthur — Arma de Sangue: a garra de sangue nasce do ombro que ele perdeu e rasga
  bloodClaw(w, a, b, col) {
    w.fx.slash(b.chestPos(), a.yaw, { color: col, radius: 1.9, roll: 1.1, life: 0.4, width: 0.6 });
    w.fx.slash(b.chestPos(), a.yaw, { color: 0x7a0010, radius: 1.6, roll: 0.7, life: 0.35, width: 0.45 });
    w.fx.play('FX_BLOOD', b.chestPos(), { color: 0x9a0010 });
    w.fx.burst(b.chestPos(), { count: 26, color: 0x9a0010, speed: 4, life: 0.5, size: 0.14, gravity: 8 });
  },
  // Joui — sombras: o alvo afunda numa poça de sombra e a espada corta em X
  shadow(w, a, b, col) {
    w.fx.shadowDisc(ground(b), { radius: 1.6, life: 0.9 });
    w.fx.burst(b.chestPos(), { count: 30, color: 0x0a0810, kind: 'smoke', speed: 2.5, up: 1, life: 0.9, size: 0.7, grow: 1 });
    w.fx.slash(b.chestPos(), a.yaw, { color: col, radius: 1.8, roll: 0.8, life: 0.35, width: 0.5 });
    w.fx.slash(b.chestPos(), a.yaw, { color: col, radius: 1.8, roll: -0.8, flip: true, life: 0.35, width: 0.5 });
  },
  // Aghata / Xande — Descarnar: a carne se abre em sangue (sigilo de Sangue + jorro)
  descarnar(w, a, b, col) {
    w.fx.ring(b.chestPos(), { color: col, radius: 0.9, life: 0.5, vertical: true, yaw: a.yaw });
    w.fx.play('FX_BLOOD', b.chestPos(), { color: 0x9a0010 });
    w.fx.burst(b.chestPos(), { count: 40, color: 0x9a0010, speed: 5, up: 1.5, life: 0.6, size: 0.16, gravity: 9 });
  },
  // Dante — Tentáculos de Lodo: o Lodo sobe do chão em colunas e aperta o alvo
  lodo(w, a, b) {
    const g = ground(b);
    w.fx.shadowDisc(g, { radius: 1.8, life: 1.0 });
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const p = v(g.x + Math.sin(ang) * 0.7, 0.2, g.z + Math.cos(ang) * 0.7);
      w.fx.burst(p, { count: 8, color: 0x07060a, kind: 'smoke', speed: 0.6, up: 4, spread: 0.1, life: 0.7, size: 0.4 });
    }
    w.fx.distort(b.chestPos(), { color: 0x3a3442, radius: 2, life: 0.5 });
  },
  // Erin — Explosões: a bomba vai junto e explode no alvo
  explosion(w, a, b, col) {
    w.fx.play('FX_EXPLOSION', b.chestPos(), { color: col, scale: 1.1 });
    w.fx.burst(b.chestPos(), { count: 30, color: 0x2a2420, kind: 'smoke', speed: 3, up: 2, life: 1, size: 0.8, grow: 1.2 });
  },
  // Gal — Controle Mental + correntes: sigilo dourado na cabeça e as correntes apertam
  mind(w, a, b, col) {
    const head = () => b.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(v(0, 0.45, 0));
    const r = w.fx.runes(head, { color: col, count: 6, radius: 0.4, size: 0.22 });
    w.after(0.6, () => r.stop());
    for (const s of ['handR', 'handL']) {
      const ch = w.fx.chain(() => a.rig.sockets[s].getWorldPosition(new THREE.Vector3()), () => b.chestPos(), { links: 12, sag: 0.05 });
      w.after(0.4, () => ch.stop());
    }
    w.fx.ring(b.chestPos(), { color: col, radius: 1.2, life: 0.4 });
  },
  // Kian — Inexistir em pequeno: a escrita sobe pelo corpo do alvo e brilha
  sigils(w, a, b, col) {
    const r = w.fx.runes(() => b.chestPos(), { color: col, count: 8, radius: 0.55, size: 0.24 });
    w.after(0.7, () => r.stop());
    w.fx.flash(b.chestPos(), { color: col, size: 2.4, life: 0.2 });
    w.fx.burst(b.chestPos(), { count: 40, color: col, speed: 5, life: 0.5, size: 0.16 });
  },
  // Aguiar — Mutilador: o machado desce na nuca
  axe(w, a, b) {
    w.fx.slash(b.chestPos().add(v(0, 0.3, 0)), a.yaw, { color: 0xc01818, radius: 1.7, roll: 1.5, life: 0.35, width: 0.55 });
    w.fx.play('FX_BLOOD', b.chestPos(), { color: 0x9a0010 });
    w.fx.burst(b.chestPos().add(v(0, 0.3, 0)), { count: 34, color: 0x9a0010, speed: 4.5, up: 2, life: 0.6, size: 0.15, gravity: 9 });
  },
  // Labirinto — Rajada Caótica: raios caem em cima do alvo
  chaos(w, a, b, col) {
    const c = b.chestPos();
    for (let i = 0; i < 4; i++) w.fx.lightning(c.clone().add(v((i - 1.5) * 0.4, 6, (i % 2) * 0.4)), c, { color: col, life: 0.3 });
    w.fx.ring(ground(b), { color: col, radius: 1.6, life: 0.5 });
    w.fx.distort(c, { color: col, radius: 2, life: 0.4 });
  },
  // Anfitrião — VISÃO TRAUMÁTICA: a máscara colada no rosto do alvo, a tela escurece e a mente quebra (sem sangue):
  // dano de sanidade, desorientação (controles invertidos) e um instante atordoado
  trauma(w, a, b, col) {
    const c = b.chestPos();
    w.screenFlash && w.screenFlash('#000000', 0.55);
    w.fx.distort(c, { color: col, radius: 2.6, life: 0.6 });
    w.fx.distort(a.chestPos(), { color: 0x5aa0ff, radius: 1.6, life: 0.5 });
    for (let i = 0; i < 3; i++) w.fx.ring(c, { color: [0xb04aff, 0xff6ad0, 0x5aa0ff][i], radius: 1.2 + i * 0.5, life: 0.5, vertical: true, yaw: a.yaw });
    w.audio.play('fearGaze', { volume: 1, pitch: 0.7 });
  },
  // Lírio / Balu — pancada no chão: levanta e enterra o alvo com o martelo / o machado
  slam(w, a, b, col) {
    w.fx.play('FX_GROUND_SMASH', ground(b), { color: col, scale: 1.2 });
    w.fx.play('FX_DUST', ground(b), { scale: 1.4 });
  },
  // Ferreiro — Espada Consumidora: a lâmina consome, o Lodo espirala
  consume(w, a, b, col) {
    w.fx.slash(b.chestPos(), a.yaw, { color: 0x2a2632, radius: 2.1, roll: 1.4, life: 0.45, width: 0.7 });
    for (let i = 0; i < 3; i++) w.fx.ring(b.chestPos(), { color: 0x1a1620, radius: 0.5 + i * 0.5, life: 0.5, vertical: true, yaw: a.yaw });
    w.fx.burst(b.chestPos(), { count: 24, color: col, kind: 'smoke', speed: 2, life: 0.8, size: 0.5, grow: 1 });
  },
  // Juan — Faca Predadora no pescoço: o sangue sobe para a faca
  throat(w, a, b) {
    const neck = b.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(v(0, -0.15, 0));
    w.fx.tracer(neck.clone().addScaledVector(forwardFromYaw(a.yaw + Math.PI / 2), -0.6), neck.clone().addScaledVector(forwardFromYaw(a.yaw + Math.PI / 2), 0.6), { color: 0xc01828, life: 0.2, width: 0.05 });
    w.fx.play('FX_BLOOD', neck, { color: 0x9a0010 });
    w.fx.burst(neck, { count: 30, color: 0x9a0010, speed: 3.5, life: 0.6, size: 0.14, gravity: 8 });
  },
  // Kemi — tiro à queima-roupa: a pistola no peito, a espiral de Morte sai pelas costas
  pointBlank(w, a, b, col) {
    const c = b.chestPos();
    const F = forwardFromYaw(a.yaw);
    w.fx.flash(c.clone().addScaledVector(F, -0.3), { color: 0xfff0c0, size: 1.4, life: 0.1 });
    w.fx.tracer(c, c.clone().addScaledVector(F, 3), { color: col, life: 0.15, width: 0.04 });
    for (let i = 0; i < 3; i++) w.fx.ring(c.clone().addScaledVector(F, 0.6 + i * 0.5), { color: 0x1a1620, radius: 0.3 + i * 0.2, life: 0.45, vertical: true, yaw: a.yaw });
  },
  // Diabo — as garras rasgam e espinhos de sangue saem do chão
  devil(w, a, b, col) {
    w.fx.slash(b.chestPos(), a.yaw, { color: col, radius: 2, roll: 0.9, life: 0.4, width: 0.6 });
    w.fx.slash(b.chestPos(), a.yaw, { color: col, radius: 2, roll: -0.9, flip: true, life: 0.4, width: 0.6 });
    w.fx.play('FX_GROUND_SMASH', ground(b), { color: 0x9a0010, scale: 1 });
    w.fx.burst(b.chestPos(), { count: 40, color: 0x9a0010, speed: 5, life: 0.6, size: 0.16, gravity: 8 });
  },
  // Fantasma — as faixas enrolam e a sniper dispara colada
  bands(w, a, b, col) {
    w.fx.burst(b.chestPos(), { count: 34, color: 0x0a0810, kind: 'smoke', speed: 2, life: 0.9, size: 0.6, grow: 1 });
    for (let i = 0; i < 4; i++) w.fx.ring(b.chestPos().add(v(0, (i - 1.5) * 0.35, 0)), { color: 0xd8ccb0, radius: 0.45, life: 0.4 });
    FINISHERS.pointBlank(w, a, b, col);
  },
  // Deus da Morte — a mão enorme esmaga o alvo no chão e o Lodo engole
  crush(w, a, b, col) {
    w.fx.play('FX_GROUND_SMASH', ground(b), { color: col, scale: 1.6 });
    FINISHERS.lodo(w, a, b, col);
  },
};

const S = (anim, dur = 0.28) => ({ anim, dur });
// t dos golpes e do finalizador em segundos desde o começo da cena
const scene = (b1, b2, fin) => ({
  beats: [{ t: 0.12, ...b1 }, { t: 0.48, ...b2 }],
  fin: { t: 0.9, dur: 0.5, ...fin },
});

export const GRAB_SCENES = {
  kaiser: scene({ ...S('jab'), fx: { kind: 'punch' }, sound: 'punch' }, { ...S('cross'), fx: { kind: 'punch' }, sound: 'punch' }, { anim: 'heavy_punch', fx: 'acacia', sound: 'explosion', drain: 15 }),
  arthur: scene({ ...S('knee'), fx: { kind: 'punch' }, sound: 'kick' }, { ...S('kick_low'), fx: { kind: 'punch' }, sound: 'kick' }, { anim: 'claw_raise_L', fx: 'bloodClaw', sound: 'bloodClaw', bleed: { dps: 4, duration: 2 } }),
  joui: scene({ ...S('slash_h'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('slash_d'), fx: { kind: 'slash', flip: true }, sound: 'bladeHit' }, { anim: 'slash_finisher', fx: 'shadow', sound: 'slashFinal' }),
  aghata: scene({ ...S('knife_1'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('thrust'), fx: { kind: 'stab' }, sound: 'bladeHit' }, { anim: 'knife_final', fx: 'descarnar', sound: 'descarnar', bleed: { dps: 4, duration: 2 } }),
  dante: scene({ ...S('jab'), fx: { kind: 'punch' }, sound: 'punch' }, { ...S('shove'), fx: { kind: 'punch' }, sound: 'punch' }, { anim: 'wave_punch', fx: 'lodo', sound: 'drain', slow: { mult: 0.75, time: 2 } }),
  erin: scene({ ...S('dual_r'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('dual_l'), fx: { kind: 'slash', flip: true }, sound: 'bladeHit' }, { anim: 'dual_both', fx: 'explosion', sound: 'explosion' }),
  gal_sal: scene({ ...S('dual_r'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('dual_l'), fx: { kind: 'slash', flip: true }, sound: 'bladeHit' }, { anim: 'chain_sweep', fx: 'mind', sound: 'chainPull', drain: 15 }),
  kian: scene({ ...S('body_blow'), fx: { kind: 'punch' }, sound: 'punch' }, { ...S('hook_l'), fx: { kind: 'punch' }, sound: 'punch' }, { anim: 'heavy_punch', fx: 'sigils', sound: 'ritual' }),
  aguiar: scene({ ...S('slash_h'), fx: { kind: 'slash' }, sound: 'axeHit' }, { ...S('kick_front'), fx: { kind: 'punch' }, sound: 'kick' }, { anim: 'slash_v', fx: 'axe', sound: 'axeHit', bleed: { dps: 5, duration: 2 } }),
  labirinto: scene({ ...S('thrust'), fx: { kind: 'stab' }, sound: 'bladeHit' }, { ...S('slash_h'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { anim: 'slash_d', fx: 'chaos', sound: 'shockwave' }),
  xande: scene({ ...S('slash_h'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('slash_h_back'), fx: { kind: 'slash', flip: true }, sound: 'bladeHit' }, { anim: 'slash_finisher', fx: 'descarnar', sound: 'descarnar', bleed: { dps: 4, duration: 2 } }),
  lirio: scene({ ...S('hammer_h', 0.34), fx: { kind: 'smash' }, sound: 'heavyPunch' }, { ...S('hammer_diag', 0.34), fx: { kind: 'smash' }, sound: 'heavyPunch' }, { anim: 'hammer_ground', fx: 'slam', sound: 'heavyPunch' }),
  balu: scene({ ...S('hammer_h', 0.34), fx: { kind: 'smash' }, sound: 'axeHit' }, { ...S('hammer_diag', 0.34), fx: { kind: 'smash' }, sound: 'axeHit' }, { anim: 'hammer_ground', fx: 'slam', sound: 'heavyPunch' }),
  ferreiro: scene({ ...S('slash_h', 0.32), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('slash_h_back', 0.32), fx: { kind: 'slash', flip: true }, sound: 'bladeHit' }, { anim: 'slash_finisher', fx: 'consume', sound: 'slashFinal' }),
  juan: scene({ ...S('knife_1'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('knife_2'), fx: { kind: 'slash', flip: true }, sound: 'bladeHit' }, { anim: 'thrust', fx: 'throat', sound: 'slashFinal', heal: 15 }),
  kemi: scene({ ...S('knife_1'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('shoulder_bash'), fx: { kind: 'punch' }, sound: 'punch' }, { anim: 'thrust', fx: 'pointBlank', sound: 'sniper' }),
  arnaldo: scene({ ...S('slash_h'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('thrust'), fx: { kind: 'stab' }, sound: 'bladeHit' }, { anim: 'slash_finisher', fx: 'sigils', sound: 'slashFinal' }),
  verissimo: scene({ ...S('thrust'), fx: { kind: 'stab' }, sound: 'bladeHit' }, { ...S('slash_h_back'), fx: { kind: 'slash', flip: true }, sound: 'bladeHit' }, { anim: 'slash_v', fx: 'pointBlank', sound: 'shotgun' }),
  // Visão Traumática: chicotada de cabo, puxa o rosto do alvo para perto da máscara (a câmera fecha na máscara, que
  // enche a tela) e a Energia empurra a mente para longe
  anfitriao: {
    beats: [{ t: 0.12, ...S('host_lash', 0.32), fx: { kind: 'slash' }, sound: 'whip' }, { t: 0.5, ...S('host_tilt', 0.5), fx: { kind: 'punch' }, sound: 'fearGaze' }],
    fin: { t: 1.15, dur: 0.45, anim: 'wave_punch', fx: 'trauma', sound: 'shockwave', drain: 20, invert: 1.8 },
    shots: (a, b) => [
      twoShot(a, b, { dur: 0.5, dist: 2.8, height: 1.5, push: 0.5, side: 1, lookH: 1.3 }),
      faceClose(a, { dur: 1.3, from: 1.0, to: 0.5, side: 0.05, height: 1.62, fov: 30 }),
    ],
  },
  diabo: scene({ ...S('db_claw_r'), fx: { kind: 'claw' }, sound: 'clawHit' }, { ...S('db_claw_l'), fx: { kind: 'claw', flip: true }, sound: 'clawHit' }, { anim: 'db_rend', fx: 'devil', sound: 'bloodClaw', bleed: { dps: 5, duration: 2 } }),
  fantasma: scene({ ...S('knife_1'), fx: { kind: 'slash' }, sound: 'bladeHit' }, { ...S('shoulder_bash'), fx: { kind: 'punch' }, sound: 'punch' }, { anim: 'thrust', fx: 'bands', sound: 'sniper' }),
  deus_morte: scene({ ...S('dm_slap', 0.34), fx: { kind: 'smash' }, sound: 'heavyPunch' }, { ...S('dm_hook', 0.34), fx: { kind: 'smash' }, sound: 'heavyPunch' }, { anim: 'dm_smash', fx: 'crush', sound: 'heavyPunch' }),
};
