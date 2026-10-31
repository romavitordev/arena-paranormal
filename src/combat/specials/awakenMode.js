import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose, orbit } from '../../camera/shots.js';
import { swapFace } from './maskTransform.js';
import { applyHit } from '../damage.js';
import { DanteClone } from '../npcs.js';

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
//   larva               { drain, takenMult, regrow, hatch: { damage, summon } }: INCUBAR (o Estrangeiro) — a larva vai
//                       na cabeça do ADVERSÁRIO: ele fica exposto (takenMult), a sanidade não volta e escoa (drain/s);
//                       zerada, a larva ECLODE (dano + um Alheio que sai dela, `summon`) e outra é posta em `regrow` s
//   glowMat             trecho do nome do material que BRILHA na cor do estado (o próprio desenho da textura vira o
//                       brilho: na venda do Gal, as marcas douradas acendem e o pano preto continua escuro); pulsa
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
    // o brilho acende no close (a câmera está no rosto)
    let glow = null;
    if (sp.glowMat) tl.add(0.45, () => { glow = glowMaterials(f.rig, sp.glowMat, col); });
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
      applyAwakening(f, sp, world, col, undoFace, glow);
      undoFace = null;
      glow = null;
    };
    return {
      update: (dt) => {
        const done = tl.update(dt);
        if (done) finish();
        return done;
      },
      cancel: () => { rise.stop(); world.endCinematic(); if (undoFace) { undoFace(); undoFace = null; } if (glow) { glow.undo(); glow = null; } },
    };
  },
};

function applyAwakening(f, sp, world, col, undoFace, glow) {
  if (f.state === 'ko') { if (undoFace) undoFace(); if (glow) glow.undo(); return; }
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
      if (glow) glow.pulse(world.time);
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
    onEnd() { aura.stop(); if (drip) drip.stop(); if (undoFace) undoFace(); if (glow) glow.undo(); if (f.buffTint === tint) f.buffTint = null; },
  });
  if (sp.larva) incubate(f, sp.larva, world, col);
  f.notify(`${(sp.label || sp.name).toUpperCase()}!`, true);
}

// INCUBAR (wiki "Estrangeiro"): "enquanto estiver com uma larva incubada, o ser fica completamente exposto à criatura
// [...] a larva drena aos poucos a sanidade de seu hospedeiro e, quando esse processo é finalizado, o indivíduo morre
// instantaneamente ao eclodir algum Alheio". No jogo: a eclosão é um golpe pesado, sai um Doppelganger e a próxima larva
// entra pouco depois — até o fim do round (ou até o Estrangeiro cair)
function incubate(f, L, world, col) {
  const plant = () => {
    const opp = f.opponent;
    if (!opp || opp.state === 'ko' || f.state === 'ko' || opp.findBuff('larva')) return;
    const glow = world.fx.emitter({ rate: 6, follow: () => opp.rig.joints.hd.getWorldPosition(new THREE.Vector3()), particle: { color: col, speed: 0.2, up: 0.5, spread: 0.12, life: 0.5, size: 0.08 } });
    let acc = 0;
    let hatched = false;
    opp.addBuff({
      type: 'larva', name: 'LARVA', debuff: true, time: Infinity, duration: Infinity, takenMult: L.takenMult, energyRegenMult: 0,
      onTick(dt) {
        if (hatched || opp.state === 'ko') return;
        if (f.state === 'ko') { this.time = 0; return; }
        acc += (L.drain ?? 3) * dt;
        if (acc >= 1) { const n = Math.floor(acc); acc -= n; opp.energy = Math.max(0, opp.energy - n); }
        if (opp.energy > 0) return;
        // a sanidade acabou: a larva ECLODE
        hatched = true;
        this.time = 0;
        const head = opp.rig.joints.hd.getWorldPosition(new THREE.Vector3());
        world.fx.burst(head, { count: 40, color: col, speed: 5, life: 0.5, size: 0.18 });
        world.fx.distort(head, { color: col, radius: 2, life: 0.4 });
        world.cameraRig.shake(0.35, 0.3);
        opp.notify('A LARVA ECLODIU', true);
        applyHit(world, f, opp, { damage: L.hatch.damage, kind: 'ability', element: 'transmissao', unblockable: true, knockdown: true, knockback: 1.5, hitstun: 0.8, color: col, sound: 'heavyPunch', scale: 1.5, dir: new THREE.Vector3(Math.sin(opp.yaw + Math.PI), 0, Math.cos(opp.yaw + Math.PI)) });
        const S = L.hatch.summon;
        if (S && f.state !== 'ko') {
          const npc = new DanteClone(f, world, 2, S.duration, { model: S.model, hp: S.hp, damageMult: 1, element: 'transmissao', strikes: S.strikes, rise: true, restyle(m) { m.material.transparent = false; }, setup(rig) { if (rig.props.pistol) rig.showProp('pistol', false); } });
          npc.isDoppel = true;
          npc.pos.set(opp.pos.x + Math.sin(opp.yaw + 1.6) * 1.4, 0, opp.pos.z + Math.cos(opp.yaw + 1.6) * 1.4);
          world.addNpc(npc);
        }
        world.after(L.regrow ?? 8, plant);
      },
      onEnd() { glow.stop(); },
    });
    opp.notify('LARVA INCUBADA', true);
  };
  plant();
}

// acende os materiais cujo nome contém `part`: o material é CLONADO para este lutador (no espelho, o outro não muda) e o
// próprio mapa vira o emissivo — só o que é claro na textura brilha. undo() devolve os materiais originais.
function glowMaterials(rig, part, col) {
  const swaps = [];
  rig.root.traverse((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    if (!list.some((m) => m && m.name && m.name.includes(part) && m.emissive)) return;
    const orig = o.material;
    const next = list.map((m) => {
      if (!(m && m.name && m.name.includes(part) && m.emissive)) return m;
      const c = m.clone();
      c.emissive = new THREE.Color(col);
      if (c.map) c.emissiveMap = c.map;
      c.emissiveIntensity = 0.9;
      return c;
    });
    o.material = Array.isArray(orig) ? next : next[0];
    swaps.push({ o, orig, mats: next.filter((m) => !list.includes(m)) });
  });
  return {
    pulse(t) { for (const s of swaps) for (const m of s.mats) m.emissiveIntensity = 0.75 + 0.35 * Math.sin(t * 3); },
    undo() { for (const s of swaps) { s.o.material = s.orig; s.mats.forEach((m) => m.dispose()); } swaps.length = 0; },
  };
}

function auraEmitter(f, world, kind, col) {
  const around = () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 0.9, f.pos.y + Math.random() * 1.9, f.pos.z + (Math.random() - 0.5) * 0.9);
  if (kind === 'smoke') return world.fx.emitter({ rate: 22, follow: around, particle: { color: col, kind: 'smoke', speed: 0.4, up: 0.8, spread: 0.3, life: 0.8, size: 0.35, grow: 1 } });
  if (kind === 'blood') return world.fx.emitter({ rate: 20, follow: around, particle: { color: 0x8a0010, speed: 0.3, up: -0.6, spread: 0.2, life: 0.6, size: 0.1, gravity: 4 } });
  if (kind === 'sigil') return world.fx.emitter({ rate: 30, follow: around, particle: { color: col, speed: 0.3, up: 1.0, spread: 0.2, life: 0.5, size: 0.1 } });
  return world.fx.emitter({ rate: 34, follow: around, particle: { color: col, speed: 0.6, up: 1.4, spread: 0.3, life: 0.45, size: 0.14 } });
}
