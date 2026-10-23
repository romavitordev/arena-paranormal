import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose, orbit } from '../../camera/shots.js';
import { swapFace } from './maskTransform.js';

// DESPERTAR (Barra de Transformação de quem não tem uma forma própria): uma cena curta — o personagem se concentra, a
// aura cresce, o nome do estado aparece — e ele fica nesse estado ATÉ O FIM DO ROUND. Cada um escolhe o estado pelo
// cânone (Magnum Opus do Arthur, Predador Perfeito do Aguiar, Gladiador Paranormal do Xande...) e o que ele faz:
//   mult/affects        dano a mais (ex.: 1.15 em ['melee','ranged','ability'])
//   takenMult           dano recebido (0.85 = 15% a menos)
//   speedMult           velocidade de movimento
//   cdRate              recargas mais rápidas (1.3 = 30% mais rápido)
//   energyRegenMult     sanidade regenera mais rápido
//   regen               vida por segundo
//   drain / drainFloor  PERDE vida por segundo, sem nunca passar de drainFloor (padrão 1): o sacrifício não mata sozinho
//   drainMax/drainRamp  a perda sobe de drain até drainMax em drainRamp segundos
//   lowHealth           { from, min, max }: QUANTO MENOS VIDA, MAIS FORÇA — o dano vai de min (com `from` da vida
//                       máxima ou mais) até max (perto de zero), em linha reta (substitui `mult`)
//   armorEvery          a cada N s ganha 1 golpe que aguenta sem reagir (acumula até armorMax, padrão 1)
//   knockbackTakenMult  é empurrado menos (0.4 = 40% do empurrão)
//   unblockable         golpes físicos atravessam a defesa
//   meleeBleed          todo golpe físico/arremessado sangra
//   bloodArmSide        braço de sangue (visual da Armadura de Sangue) + bloodArmor
//   heal                cura na hora (fração da vida máxima)
//   aura                'flame' | 'smoke' | 'sigil' | 'blood' (partículas em volta)
//   face                [de, para]: troca a textura do rosto na hora do close (ex.: os olhos todos pretos da Nubi)
//   eyeDrip             cor do Lodo que escorre do rosto enquanto durar
//   passives            passivas que valem enquanto durar (ex.: [{ type: 'precognition' }] — lidas por hasPassive)
//   perfectBlockWindow  janela do Bloqueio Perfeito enquanto durar (s; vale a maior entre esta e a do personagem)
export const awakenMode = {
  canStart: (f) => !f.findBuff('awakened'),
  blockMsg: 'JÁ DESPERTOU',
  start(f, sp, world) {
    const tl = new Timeline();
    const col = sp.color ?? f.def.energyColor ?? 0xffffff;
    world.beginCinematic(f, null);
    f.vel.set(0, 0, 0);
    f.anim.play(sp.anim || 'charge', { restart: true, duration: 1.4 });
    world.cameraRig.playShots([
      faceClose(f, { dur: 0.75, from: 2.0, to: 1.3, side: 0.35 }),
      orbit(f, { dur: 0.75, radius: 4.2, height: 1.6, a0: -0.5, a1: 0.5, lookH: 1.1 }),
    ]);
    world.audio.play('carga', { pitch: 0.7, volume: 0.9 });
    const rise = world.fx.emitter({
      rate: 80,
      follow: () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 1.4, f.pos.y + Math.random() * 0.4, f.pos.z + (Math.random() - 0.5) * 1.4),
      particle: { color: col, speed: 0.5, up: 3, spread: 0.3, life: 0.6, size: 0.2 },
    });
    // o rosto muda no meio do close (a câmera está nele)
    let undoFace = null;
    if (sp.face) tl.add(0.45, () => { undoFace = swapFace(f.rig, sp.face[0], sp.face[1]); });
    tl.add(0.35, () => world.showBanner(sp.banner || sp.name, f.def.color));
    tl.add(1.0, () => {
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: col, radius: 5, life: 0.7 });
      world.fx.burst(f.chestPos(), { count: 70, color: col, speed: 8, life: 0.7, size: 0.3 });
      world.fx.distort(f.chestPos(), { color: col, radius: 3, life: 0.5 });
      world.cameraRig.shake(0.45, 0.35);
      world.screenFlash && world.screenFlash('#' + new THREE.Color(col).getHexString(), 0.08);
      world.audio.play('armed');
    });
    tl.add(1.4, () => {});
    tl.end(1.4);
    const finish = () => {
      rise.stop();
      world.endCinematic();
      applyAwakening(f, sp, world, col, undoFace);
      undoFace = null;
    };
    return {
      update: (dt) => {
        const done = tl.update(dt);
        if (done) finish();
        return done;
      },
      cancel: () => { rise.stop(); world.endCinematic(); if (undoFace) { undoFace(); undoFace = null; } },
    };
  },
};

function applyAwakening(f, sp, world, col, undoFace) {
  if (f.state === 'ko') { if (undoFace) undoFace(); return; }
  // o Lodo escorrendo do rosto (olhos e boca) enquanto durar
  const drip = sp.eyeDrip !== undefined ? world.fx.emitter({ rate: 14, follow: () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3()), particle: { color: sp.eyeDrip, kind: 'smoke', speed: 0.15, up: -1.2, spread: 0.08, life: 0.6, size: 0.12, gravity: 3 } }) : null;
  if (sp.heal) f.health = Math.min(f.maxHealth, f.health + f.maxHealth * sp.heal);
  const aura = auraEmitter(f, world, sp.aura || 'flame', col);
  const tint = { color: col, base: 0.16 };
  f.buffTint = tint;
  let armorClock = 0;
  let regenAcc = 0;
  let drainAcc = 0;
  let drainT = 0;
  f.addBuff({
    type: 'awakened', name: (sp.label || sp.name).toUpperCase(), time: Infinity, duration: Infinity,
    mult: sp.lowHealth ? sp.lowHealth.min : sp.mult, affects: sp.affects || ['melee', 'ranged', 'ability'], takenMult: sp.takenMult, speedMult: sp.speedMult,
    cdRate: sp.cdRate, energyRegenMult: sp.energyRegenMult, knockbackTakenMult: sp.knockbackTakenMult, unblockable: !!sp.unblockable, meleeBleed: sp.meleeBleed,
    bloodArmor: !!sp.bloodArmSide, bloodArmSide: sp.bloodArmSide, passives: sp.passives, perfectBlockWindow: sp.perfectBlockWindow,
    onTick(dt) {
      if (f.state === 'ko') return;
      if (sp.lowHealth) {
        const L = sp.lowHealth;
        const k = Math.max(0, Math.min(1, ((L.from ?? 0.35) - f.health / f.maxHealth) / (L.from ?? 0.35)));
        this.mult = L.min + (L.max - L.min) * k;
      }
      if (sp.regen && f.health < f.maxHealth) {
        regenAcc += sp.regen * dt;
        if (regenAcc >= 1) { const n = Math.floor(regenAcc); regenAcc -= n; f.health = Math.min(f.maxHealth, f.health + n); }
      }
      // o preço (Último Sacrifício do Cris): a vida escoa de pouco em pouco, mas quem dá o golpe final é o adversário
      if (sp.drain && f.health > (sp.drainFloor ?? 1)) {
        drainT += dt;
        const rate = sp.drainMax ? sp.drain + (sp.drainMax - sp.drain) * Math.min(1, drainT / (sp.drainRamp || 30)) : sp.drain;
        drainAcc += rate * dt;
        if (drainAcc >= 1) {
          const n = Math.floor(drainAcc);
          drainAcc -= n;
          f.health = Math.max(sp.drainFloor ?? 1, f.health - n);
          if (Math.random() < 0.15) world.fx.burst(f.chestPos(), { count: 2, color: 0x9a0010, speed: 0.6, up: -0.4, life: 0.5, size: 0.1, gravity: 4 });
        }
      }
      if (sp.armorEvery) {
        armorClock += dt;
        if (armorClock >= sp.armorEvery && (f.armorHits || 0) < (sp.armorMax ?? 1)) { armorClock = 0; f.armorHits = (f.armorHits || 0) + 1; }
      }
    },
    onEnd() { aura.stop(); if (drip) drip.stop(); if (undoFace) undoFace(); if (f.buffTint === tint) f.buffTint = null; },
  });
  f.notify(`${(sp.label || sp.name).toUpperCase()}!`, true);
}

function auraEmitter(f, world, kind, col) {
  const around = () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 0.9, f.pos.y + Math.random() * 1.9, f.pos.z + (Math.random() - 0.5) * 0.9);
  if (kind === 'smoke') return world.fx.emitter({ rate: 22, follow: around, particle: { color: col, kind: 'smoke', speed: 0.4, up: 0.8, spread: 0.3, life: 0.8, size: 0.35, grow: 1 } });
  if (kind === 'blood') return world.fx.emitter({ rate: 20, follow: around, particle: { color: 0x8a0010, speed: 0.3, up: -0.6, spread: 0.2, life: 0.6, size: 0.1, gravity: 4 } });
  if (kind === 'sigil') return world.fx.emitter({ rate: 30, follow: around, particle: { color: col, speed: 0.3, up: 1.0, spread: 0.2, life: 0.5, size: 0.1 } });
  return world.fx.emitter({ rate: 34, follow: around, particle: { color: col, speed: 0.6, up: 1.4, spread: 0.3, life: 0.45, size: 0.14 } });
}
