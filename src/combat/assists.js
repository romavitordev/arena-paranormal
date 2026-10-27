import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../core/util.js';
import { applyHit } from './damage.js';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';
import { findSpotBehind, findFreeSpotNear } from './positioning.js';
import { createMistZone, pickCurseElement, applyWeaponCurse } from './abilities.js';
import { ELEMENTS } from '../config/elements.js';
import { getForm } from '../characters/forms/index.js';

// ASSISTÊNCIAS (batalha em equipe): o personagem chamado aparece por alguns segundos, faz UMA ação
// que depende do contexto e vai embora. Não substitui o lutador principal.
//  - jogador ANDANDO  → ação de apoio (buff, zona, puxão...);
//  - jogador PARADO   → ação ofensiva contra o inimigo.
export { ACTIONS as ASSIST_ACTIONS };

export const ASSIST = {
  cooldown: 18, // segundos por assistência
  damageMult: 0.6, // dano das assistências é reduzido
};

const tmp = new THREE.Vector3();

// ---------------------------------------------------------------- ações por personagem
// Cada uma: (ctx) → Timeline. ctx = { as (a assistência), owner, opp, world, hit(dmg, opts) }
const ACTIONS = {
  // ARTHUR: andando → Ódio Incontrolável no parceiro; parado → Descarnar (ritual de Sangue) no inimigo
  arthur: {
    moving: (c) => buffOwner(c, 'gaze', { type: 'hatred', name: 'ÓDIO (ARTHUR)', time: 6, mult: 1.25, affects: ['melee'], speedMult: 1.1, noBlock: true, noRituals: true }, 0xd0102a, 'ÓDIO INCONTROLÁVEL'),
    still: (c) => ritualCuts(c, 0xe0204a, 70, 'DESCARNAR'),
  },
  // AGHATA: andando → amaldiçoa a arma do parceiro (sangramento); parado → Descarnar
  aghata: {
    moving: (c) => buffOwner(c, 'concentrate', { type: 'curse', name: 'ARMA AMALDIÇOADA (AGHATA)', time: 8, bleed: { dps: 6, duration: 3 } }, 0xe0204a, 'ARMA AMALDIÇOADA'),
    still: (c) => ritualCuts(c, 0xe0204a, 80, 'DESCARNAR'),
  },
  // KAISER: andando → névoa Cinerária em volta do parceiro; parado → rajada da M4
  kaiser: {
    moving: (c) => {
      const tl = new Timeline();
      c.as.play('breath', 0.7);
      tl.add(0.35, () => {
        const center = c.owner.pos.clone();
        createMistZone(c.world, c.owner, { center: () => center, radius: 3.5, duration: 5, slow: 0.3, enemyRegen: 0.5, eatsProjectiles: false, color: 0x8a6ab0, density: 0.8 });
        c.owner.notify('NÉVOA DO KAISER', true);
      });
      return tl.end(0.8);
    },
    still: (c) => {
      const tl = new Timeline();
      c.as.face(c.opp);
      c.as.play('shoot_rifle', 0.9);
      for (let i = 0; i < 4; i++) {
        tl.add(0.25 + i * 0.09, () => {
          const from = c.as.chest().add(forwardFromYaw(c.as.yaw, tmp).multiplyScalar(0.6));
          const dir = c.opp.chestPos().sub(from).normalize();
          c.world.projectiles.spawn(c.owner, { ...c.def.ranged, damage: Math.round(14 * ASSIST.damageMult * 1.6), count: 1, element: c.def.element }, from, dir);
          c.world.audio.play(c.def.ranged.sound || 'swing', { volume: 0.6 });
        });
      }
      return tl.end(1.0);
    },
  },
  // Joui: andando → surge atrás do inimigo e corta; parado → Olhar do Desespero
  joui: {
    moving: (c) => {
      const tl = new Timeline();
      tl.add(0.05, () => {
        const spot = findSpotBehind(c.world.arena, { x: c.opp.pos.x, z: c.opp.pos.z, yaw: c.opp.yaw }, { distance: 1.5, radius: 0.5 });
        if (spot) c.as.pos.set(spot.x, 0, spot.z);
        c.as.face(c.opp);
        c.world.fx.shadowDisc(c.as.pos, { radius: 1, life: 0.4 });
        c.as.play('iai_slash', 0.45);
      });
      tl.add(0.25, () => c.hit(60, { knockback: 4, launch: true, sound: 'slashFinal' }));
      return tl.end(0.7);
    },
    still: (c) => {
      const tl = new Timeline();
      c.as.face(c.opp);
      c.as.play('gaze', 0.8);
      tl.add(0.45, () => {
        if (distXZ(c.as.pos, c.opp.pos) < 10 && !c.opp.isInvulnerable()) {
          c.opp.stun(0.9, 'fear');
          c.opp.notify('DESESPERO', true);
          c.world.fx.burst(c.opp.chestPos(), { count: 24, color: 0x1a0610, kind: 'smoke', speed: 2, life: 0.8, size: 0.7 });
        }
      });
      return tl.end(0.9);
    },
  },
  // GAL: andando → Corrente de Captura que puxa o inimigo até o parceiro; parado → avança girando as lâminas
  gal_sal: {
    moving: (c) => {
      const tl = new Timeline();
      c.as.face(c.opp);
      c.as.play('chain_throw', 0.6);
      tl.add(0.2, () => {
        const from = c.as.chest();
        const dir = c.opp.chestPos().sub(from).normalize();
        c.world.projectiles.spawn(c.owner, { ...c.def.ranged, damage: 15, element: c.def.element }, from, dir);
        c.world.audio.play('chainThrow');
      });
      return tl.end(0.7);
    },
    still: (c) => rushStrike(c, 'dual_spin', [[0.35, 30], [0.5, 30]], 'bladeHit'),
  },
  // KIAN: andando → Transcendência no parceiro (físico atravessa a defesa); parado → soco meteoro
  kian: {
    moving: (c) => buffOwner(c, 'charge_fists', { type: 'transcend', name: 'TRANSCENDÊNCIA (KIAN)', time: 4 }, 0xffd88a, 'TRANSCENDÊNCIA'),
    still: (c) => rushStrike(c, 'meteor_punch', [[0.4, 70]], 'heavyPunch', { launch: true, knockback: 6 }),
  },
  // DANTE: andando → Paradiso cura o parceiro; parado → Tentáculos de Lodo no inimigo
  dante: {
    moving: (c) => {
      const tl = new Timeline();
      c.as.play('breath', 0.7);
      let given = 0;
      tl.each((t, dt) => {
        if (t < 0.3 || given >= 60) return;
        const n = Math.min(60 - given, 60 * dt);
        given += n;
        c.owner.health = Math.min(c.owner.maxHealth, c.owner.health + n);
        if (Math.random() < 0.4) c.world.fx.burst(c.owner.chestPos(), { count: 2, color: 0x141018, kind: 'smoke', speed: 0.4, up: 0.6, life: 0.6, size: 0.35 });
      });
      tl.add(0.3, () => c.owner.notify('PARADISO', true));
      return tl.end(1.4);
    },
    still: (c) => {
      const tl = new Timeline();
      c.as.face(c.opp);
      c.as.play('concentrate', 0.8);
      const center = c.opp.pos.clone();
      c.world.fx.ring(new THREE.Vector3(center.x, 0.06, center.z), { color: 0x2a2632, radius: 2, life: 0.5 });
      tl.add(0.5, () => {
        c.world.fx.burst(new THREE.Vector3(center.x, 0.4, center.z), { count: 40, color: 0x0c0a0e, kind: 'smoke', speed: 3, up: 1.5, life: 0.8, size: 0.7 });
        if (distXZ(c.opp.pos, center) < 2.4) {
          const res = c.hit(50, { reaction: false });
          if (typeof res === 'number' && c.opp.state !== 'ko') c.opp.stun(0.9, 'stagger');
        }
      });
      return tl.end(0.9);
    },
  },
  // ERIN: andando → "Black Hole" assopra cinzas e cura o parceiro; parado → granada Supernova no inimigo
  erin: {
    moving: (c) => {
      const tl = new Timeline();
      c.as.face(c.owner);
      c.as.play('breath', 0.7);
      let given = 0;
      tl.each((t, dt) => {
        if (t < 0.3 || given >= 50) return;
        const n = Math.min(50 - given, 50 * dt);
        given += n;
        c.owner.health = Math.min(c.owner.maxHealth, c.owner.health + n);
        if (Math.random() < 0.4) c.world.fx.burst(c.owner.chestPos(), { count: 2, color: 0x141018, kind: 'smoke', speed: 0.4, up: 0.6, life: 0.6, size: 0.35 });
      });
      tl.add(0.3, () => c.owner.notify('BLACK HOLE', true));
      return tl.end(1.4);
    },
    still: (c) => {
      const tl = new Timeline();
      c.as.face(c.opp);
      c.as.play('throw_r', 0.6);
      c.world.audio.play('grenadePin', { volume: 0.7 });
      tl.add(0.3, () => {
        const nova = c.def.abilities.find((a) => a.id === 'supernova');
        const from = c.as.chest();
        const dir = c.opp.chestPos().sub(from).normalize();
        const pr = nova.projectile;
        c.world.projectiles.spawn(c.owner, { ...pr, explode: { ...pr.explode, damage: Math.round(pr.explode.damage * ASSIST.damageMult * 1.3) } }, from, dir);
        c.world.audio.play('knifeThrow');
      });
      return tl.end(0.8);
    },
  },
  // AGUIAR: andando → Predador de Sangue no parceiro (mais dano e velocidade); parado → machadada que faz sangrar
  aguiar: {
    moving: (c) => buffOwner(c, 'breath', { type: 'scent', name: 'PREDADOR (AGUIAR)', time: 6, mult: 1.15, affects: ['melee', 'ranged', 'ability'], speedMult: 1.08 }, 0xb0101c, 'PREDADOR DE SANGUE'),
    still: (c) => {
      const tl = rushStrike(c, 'slash_v', [[0.4, 65]], 'axeHit', { knockback: 4 });
      tl.add(0.45, () => { if (c.opp.state !== 'ko') c.opp.applyBleed({ dps: 5, duration: 3 }, c.owner); });
      return tl;
    },
  },
  // LABIRINTO: andando → Labirinto Mental no inimigo (anda perdido); parado → Rajada Caótica
  labirinto: {
    moving: (c) => {
      const tl = new Timeline();
      c.as.face(c.opp);
      c.as.play('point', 0.7);
      tl.add(0.4, () => {
        if (c.opp.isInvulnerable() || distXZ(c.as.pos, c.opp.pos) > 12) return;
        if (!c.opp.findBuff('maze')) {
          const buff = { type: 'maze', name: 'LABIRINTO MENTAL', time: 2, duration: 2, mazeMove: true, mazeAngle: Math.PI * 0.75 };
          c.opp.addBuff(buff);
        }
        c.world.fx.ring(new THREE.Vector3(c.opp.pos.x, 0.06, c.opp.pos.z), { color: 0x9a6aff, radius: 1.6, life: 0.6 });
        c.opp.notify('LABIRINTO MENTAL', true);
      });
      return tl.end(0.8);
    },
    still: (c) => {
      const tl = new Timeline();
      c.as.face(c.opp);
      c.as.play('point', 0.7);
      tl.add(0.35, () => {
        const from = c.as.chest();
        const dir = c.opp.chestPos().sub(from).normalize();
        c.world.projectiles.spawn(c.owner, { ...c.def.ranged, damage: Math.round(c.def.ranged.damage * ASSIST.damageMult * 1.4), element: c.def.element }, from, dir);
        c.world.audio.play('shockwave');
      });
      return tl.end(0.8);
    },
  },
  // LÍRIO: com o parceiro apanhando → CAI DENTRO (entra correndo, ombrada, provoca); senão:
  // andando → Muralha no parceiro (recebe menos dano); parado → marretada vertical que derruba
  lirio: {
    auto: (c) => caiDentro(c),
    moving: (c) => (underPressure(c) ? caiDentro(c) : buffOwner(c, 'taunt_roar', { type: 'wall', name: 'MURALHA (LÍRIO)', time: 6, takenMult: 0.75 }, 0xd8c8a0, 'MURALHA')),
    still: (c) => {
      if (underPressure(c)) return caiDentro(c);
      const tl = rushStrike(c, 'hammer_v', [[0.42, 70]], 'heavyPunch', { knockback: 5, launch: true, lowLaunch: true, color: 0xd8c8a0 });
      tl.add(0.43, () => c.world.fx.play('FX_GROUND_SMASH', c.opp.pos, { scale: 0.9 }));
      return tl;
    },
  },
  // XANDE: andando → AMALDIÇOA A ARMA DO PARCEIRO com o elemento que supera o adversário (a Leonora do Lírio, as facas, o
  // punho de quem luta sem arma — combat/abilities.js applyWeaponCurse); parado → tacada por cima que faz sangrar
  xande: {
    moving: (c) => {
      const tl = new Timeline();
      c.as.face(c.owner);
      c.as.play('concentrate', 0.6);
      tl.add(0.35, () => {
        if (c.owner.findBuff('curse')) { c.owner.notify('ARMA JÁ AMALDIÇOADA'); return; }
        const el = pickCurseElement(c.owner, { adaptive: true });
        const C = applyWeaponCurse(c.world, c.owner, el, { duration: 8, label: null });
        c.world.fx.burst(c.owner.chestPos(), { count: 30, color: C.color, speed: 4, life: 0.5, size: 0.2 });
        c.world.fx.ring(new THREE.Vector3(c.owner.pos.x, 0.06, c.owner.pos.z), { color: C.color, radius: 1.8, life: 0.4 });
        c.world.audio.play('ritual', { volume: 0.5 });
      });
      return tl.end(0.75);
    },
    still: (c) => {
      const tl = rushStrike(c, 'slash_v', [[0.4, 62]], 'heavyPunch', { knockback: 4 });
      tl.add(0.45, () => { if (c.opp.state !== 'ko') c.opp.applyBleed({ dps: 4, duration: 2.5 }, c.owner); });
      return tl;
    },
  },
  // FERREIRO: andando → amaldiçoa a arma do parceiro com o Lodo (sangramento); parado → o Golpe do Ferreiro
  ferreiro: {
    moving: (c) => buffOwner(c, 'concentrate', { type: 'curse', name: 'ARMA CONSUMIDORA (FERREIRO)', time: 7, bleed: { dps: 4, duration: 3, color: 0x2a2632 } }, 0x6a6670, 'ARMA CONSUMIDORA'),
    still: (c) => rushStrike(c, 'slash_v', [[0.42, 66]], 'heavyPunch', { knockback: 4.5 }),
  },
  // JUAN: andando → Armadura de Sangue Diabólica no parceiro; parado → Descarnar Discente no inimigo
  juan: {
    moving: (c) => buffOwner(c, 'powerup', { type: 'bloodArmor', name: 'ARMADURA DE SANGUE (JUAN)', time: 6, takenMult: 0.75, takenKinds: ['melee', 'ranged'] }, 0xc01828, 'ARMADURA DE SANGUE'),
    still: (c) => ritualCuts(c, 0xc01828, 75, 'DESCARNAR'),
  },
  // BALU: andando → Colete Físico-Balístico no parceiro (menos dano de golpes e tiros); parado → machadada por cima
  balu: {
    moving: (c) => buffOwner(c, 'powerup', { type: 'vest', name: 'COLETE (BALU)', time: 6, takenMult: 0.8, takenKinds: ['melee', 'ranged'] }, 0xe8b23a, 'COLETE FÍSICO-BALÍSTICO'),
    still: (c) => rushStrike(c, 'hammer_v', [[0.42, 70]], 'axeHit', { knockback: 4.5 }),
  },
  // ARNALDO: andando → Aniquilador no parceiro (golpes físicos mais fortes); parado → o Ato Final (corte de palco)
  arnaldo: {
    moving: (c) => buffOwner(c, 'concentrate', { type: 'annihilator', name: 'ANIQUILADOR (ARNALDO)', time: 6, mult: 1.2, affects: ['melee'] }, 0xe0b040, 'ANIQUILADOR'),
    still: (c) => rushStrike(c, 'slash_finisher', [[0.42, 66]], 'slashFinal', { knockback: 4 }),
  },
  // VERÍSSIMO: andando → Inteligência Estratégica no parceiro (corte extra em cada golpe); parado → Comando com a espada
  verissimo: {
    moving: (c) => buffOwner(c, 'point', { type: 'strategicOrder', name: 'ORDEM! (VERÍSSIMO)', time: 6, extraHit: { damage: 10, delay: 0.1, color: 0x6ab0e0 } }, 0x6ab0e0, 'INTELIGÊNCIA ESTRATÉGICA'),
    still: (c) => rushStrike(c, 'slash_v', [[0.4, 64]], 'slashFinal', { knockback: 4 }),
  },
  // DALMO / COLOSSO: andando → Atropelar (ombrada que atravessa); parado → cabeçada e o soco de arena (nada de arremesso)
  dalmo: {
    moving: (c) => rushStrike(c, 'shoulder_charge', [[0.38, 62]], 'heavyPunch', { knockback: 5 }),
    still: (c) => rushStrike(c, 'headbutt', [[0.3, 28], [0.62, 44]], 'heavyPunch', { knockback: 4 }),
  },
  // KEMI: andando → Perita (o inimigo fica analisado e recebe mais dano); parado → um tiro da Sniper Fantasma
  kemi: {
    moving: (c) => debuffOpp(c, 'turn_look', { type: 'analyzed', name: 'ANALISADO (KEMI)', time: 6, takenMult: 1.12 }, 0xe8c070, 'PERITA'),
    still: (c) => shoot(c, 'sniper_fire', 1, 70, 'sniper'),
  },
};

// Personagem sem ações próprias (ex.: um lutador novo): parado → golpe do fim da sequência; andando → um tiro
// do ataque principal. Assim a assistência nunca deixa de sair.
function genericActions(def) {
  const fin = def.melee.strikes.at(-1);
  return {
    still: (c) => rushStrike(c, fin.anim, [[0.4, Math.round(fin.damage * 1.2)]], fin.hitSound || 'heavyPunch', { knockback: 4 }),
    moving: (c) => (def.ranged ? shoot(c, def.ranged.anim || 'throw_r', def.ranged.count || 1, Math.round((def.ranged.damage || 30) * 1.4), def.ranged.sound) : rushStrike(c, fin.anim, [[0.4, fin.damage]], fin.hitSound || 'heavyPunch')),
  };
}

// a assistência atira com o ataque principal dela (count tiros, dano por tiro já com o multiplicador de assistência)
export function shoot(c, anim, count, damage, sound) {
  const tl = new Timeline();
  c.as.face(c.opp);
  c.as.play(anim, 0.4 + count * 0.1 + 0.3);
  for (let i = 0; i < count; i++) {
    tl.add(0.35 + i * 0.1, () => {
      const from = c.as.chest().add(forwardFromYaw(c.as.yaw, tmp).multiplyScalar(0.6));
      const dir = c.opp.chestPos().sub(from).normalize();
      c.world.projectiles.spawn(c.owner, { ...c.def.ranged, chargeShot: undefined, damage: Math.round(damage * ASSIST.damageMult), count: 1, element: c.def.element }, from, dir);
      c.world.audio.play(sound || 'swing', { volume: 0.6 });
    });
  }
  return tl.end(0.5 + count * 0.1 + 0.3);
}

// enfraquece o inimigo (ex.: Perita da Kemi)
function debuffOpp(c, anim, buff, color, label) {
  const tl = new Timeline();
  c.as.face(c.opp);
  c.as.play(anim, 0.6);
  tl.add(0.3, () => {
    const old = c.opp.findBuff(buff.type);
    if (old) old.time = buff.time;
    else c.opp.addBuff({ ...buff, duration: buff.time });
    c.world.fx.ring(c.opp.chestPos(), { color, radius: 1, life: 0.5, vertical: true, yaw: c.as.yaw });
    c.opp.notify(label, true);
  });
  return tl.end(0.7);
}

// LÍRIO — CAI DENTRO como assistência: identifica que o parceiro está apanhando, entra CORRENDO (sem teletransporte)
// entre os dois, dá uma ombrada no inimigo, provoca e dá espaço para o parceiro se recuperar.
function underPressure(c) {
  const o = c.owner;
  return ['hitstun', 'stun', 'launched', 'block'].includes(o.state) || (c.opp.state === 'attack' && distXZ(c.opp.pos, o.pos) < 3);
}

function caiDentro(c) {
  const tl = new Timeline();
  const o = c.owner;
  const opp = c.opp;
  // começa um pouco atrás/ao lado e corre até ficar entre o parceiro e o inimigo
  const from = c.as.pos.clone();
  const mid = new THREE.Vector3().lerpVectors(o.pos, opp.pos, 0.55);
  const spot = findFreeSpotNear(c.world.arena, mid.x, mid.z, { radius: 0.5, others: [{ x: o.pos.x, z: o.pos.z, r: 0.6 }, { x: opp.pos.x, z: opp.pos.z, r: 0.7 }] }) || { x: mid.x, z: mid.z };
  c.as.face(opp);
  c.as.play('dash_heavy', 0.45);
  tl.each((t) => {
    if (t > 0.32) return;
    const k = Math.min(1, t / 0.32);
    c.as.pos.set(from.x + (spot.x - from.x) * k, 0, from.z + (spot.z - from.z) * k);
    c.as.face(opp);
    if (Math.random() < 0.5) c.world.fx.burst(new THREE.Vector3(c.as.pos.x, 0.2, c.as.pos.z), { count: 1, color: 0x9a8a72, kind: 'smoke', speed: 0.8, up: 0.4, life: 0.4, size: 0.45, grow: 1 });
  });
  tl.add(0.33, () => {
    c.as.play('shoulder_charge', 0.4);
    c.hit(55, { knockback: 6, stun: 0.35, sound: 'heavyPunch', color: 0xd8c8a0 });
    c.world.fx.play('FX_DUST', opp.pos, { scale: 1 });
    c.world.cameraRig.shake(0.25, 0.2);
    // o parceiro sai do combo e fica protegido por um instante
    if (['hitstun', 'stun'].includes(o.state)) o.setState('idle');
    o.invuln = Math.max(o.invuln, 0.6);
    if (!o.findBuff('protected')) o.addBuff({ type: 'protected', name: 'PROTEGIDO (LÍRIO)', time: 3, duration: 3, takenMult: 0.6 });
    if (opp.state !== 'ko' && !opp.findBuff('provoked')) opp.addBuff({ type: 'provoked', name: 'PROVOCADO (CAI DENTRO)', time: 3, duration: 3 });
    o.notify('LÍRIO: CAI DENTRO!', true);
  });
  tl.add(0.75, () => {
    c.as.play('taunt_roar', 0.6);
    c.world.audio.play('fearGaze', { volume: 0.45, pitch: 0.55 });
    c.world.fx.play('FX_DUST', c.as.pos, { scale: 1.1 });
  });
  return tl.end(1.4);
}

function buffOwner(c, anim, buff, color, label) {
  const tl = new Timeline();
  c.as.face(c.owner);
  c.as.play(anim, 0.6);
  tl.add(0.3, () => {
    if (!c.owner.findBuff(buff.type)) c.owner.addBuff({ ...buff, duration: buff.time });
    c.world.fx.burst(c.owner.chestPos(), { count: 30, color, speed: 4, life: 0.5, size: 0.2 });
    c.world.fx.ring(new THREE.Vector3(c.owner.pos.x, 0.06, c.owner.pos.z), { color, radius: 1.8, life: 0.4 });
    c.owner.notify(label, true);
  });
  return tl.end(0.7);
}

function ritualCuts(c, color, damage, label) {
  const tl = new Timeline();
  c.as.face(c.opp);
  c.as.play('concentrate', 0.5);
  tl.add(0.5, () => c.as.play('point', 0.4));
  tl.add(0.75, () => {
    if (distXZ(c.as.pos, c.opp.pos) > 18) return;
    c.world.fx.tracer(c.as.chest(), c.opp.chestPos(), { color, life: 0.2, width: 0.05 });
    for (const j of ['hd', 'sp', 'sL', 'sR', 'lL', 'lR']) {
      const joint = c.opp.rig.joints[j];
      if (joint) c.world.fx.cutMark(joint, { color, life: 1.8, size: 0.3 });
    }
    c.world.audio.play('descarnar');
    const res = c.hit(damage, { kind: 'ability', knockback: 2, sound: 'bladeHit', color });
    if (typeof res === 'number') c.opp.notify(label, true);
  });
  return tl.end(1.15);
}

export function rushStrike(c, anim, hits, sound, extra = {}) {
  const tl = new Timeline();
  tl.add(0.05, () => {
    // aparece colado no inimigo (como um avanço)
    const dir = new THREE.Vector3().subVectors(c.as.pos, c.opp.pos).setY(0).normalize();
    const spot = findFreeSpotNear(c.world.arena, c.opp.pos.x + dir.x * 1.3, c.opp.pos.z + dir.z * 1.3, { radius: 0.5, others: [{ x: c.opp.pos.x, z: c.opp.pos.z, r: 0.6 }] });
    if (spot) c.as.pos.set(spot.x, 0, spot.z);
    c.as.face(c.opp);
    c.world.fx.burst(c.as.chest(), { count: 14, color: c.color, speed: 3, life: 0.3, size: 0.2 });
    c.as.play(anim, 0.7);
  });
  for (const [t, dmg] of hits) tl.add(t, () => c.hit(dmg, { sound, ...extra }));
  return tl.end(0.85);
}

// arma de duas mãos (Lírio): a mão esquerda acompanha a direita no cabo, como no lutador principal
function twoHandFilter(def) {
  const G = def.grip;
  if (!G || !G.twoHand) return null;
  return (p) => {
    const r = p.sR;
    const e = p.eR;
    p.sL = [r[0], r[1] - (G.reach ?? 0.42), -0.05];
    p.eL = [Math.min(e[0], -0.25) - 0.15, e[1], e[2]];
    return p;
  };
}

// ---------------------------------------------------------------- entidade
export class Assist {
  constructor(def, owner, world, slot) {
    this.def = def;
    this.owner = owner;
    this.world = world;
    this.slot = slot;
    this.cooldown = 0;
    this.active = null;
    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.rig = buildModel(def.model);
    this.anim = new Animator(this.rig, def.anims);
    this.anim.poseFilter = twoHandFilter(def);
    this.anim.play('idle', { blend: 0 });
    this.color = ELEMENTS[def.element] ? new THREE.Color(ELEMENTS[def.element].color).getHex() : def.energyColor;
  }

  get ready() {
    return !this.active && this.cooldown <= 0;
  }

  play(name, duration) {
    this.anim.play(name, { restart: true, duration });
  }

  face(target) {
    this.yaw = yawTo(this.pos, target.pos);
  }

  chest() {
    return new THREE.Vector3(this.pos.x, this.pos.y + 1.15, this.pos.z);
  }

  call({ auto = false, still = false } = {}) {
    const o = this.owner;
    const w = this.world;
    const opp = o.opponent;
    if (!this.ready) {
      o.notify(this.active ? 'ASSISTÊNCIA EM CAMPO' : `${this.def.name}: RECARREGANDO`);
      return false;
    }
    if (!opp || opp.state === 'ko' || ['ko', 'intro', 'special', 'grabbed'].includes(o.state) || w.cinematic) return false;
    // contexto: jogador andando ou parado
    const moving = Math.hypot(o.input.moveX, o.input.moveY) > 0.3 || o.state === 'dashing';
    const acts = ACTIONS[this.def.id] || genericActions(this.def);
    // entra ao lado do parceiro (lado da assistência 1 = esquerda, 2 = direita)
    const fwd = new THREE.Vector3().subVectors(opp.pos, o.pos).setY(0).normalize();
    const side = new THREE.Vector3(-fwd.z, 0, fwd.x).multiplyScalar(this.slot === 0 ? 1 : -1);
    const want = o.pos.clone().addScaledVector(side, 1.6).addScaledVector(fwd, -0.6);
    const spot = findFreeSpotNear(w.arena, want.x, want.z, { radius: 0.5, others: [{ x: o.pos.x, z: o.pos.z, r: 0.6 }, { x: opp.pos.x, z: opp.pos.z, r: 0.6 }] });
    this.pos.set(spot ? spot.x : want.x, 0, spot ? spot.z : want.z);
    const ctx = this.enter(opp);
    this.active = (auto && acts.auto ? acts.auto : moving && !still ? acts.moving : acts.still)(ctx);
    this.autoCall = auto;
    this.update(0);
    return true;
  }

  // entra em campo (já posicionada em this.pos) e devolve o contexto das ações
  enter(opp, { quiet = false } = {}) {
    const o = this.owner;
    const w = this.world;
    this.face(opp);
    w.scene.add(this.rig.root);
    this.rig.root.visible = true;
    this.poof();
    if (!quiet) {
      w.audio.play('teleport', { volume: 0.7 });
      o.notify(`${this.def.name}!`, true);
    }
    return {
      as: this, owner: o, opp, world: w, def: this.def, color: this.color,
      hit: (dmg, opts = {}) => {
        if (opp.state === 'ko') return 0;
        const dir = new THREE.Vector3().subVectors(opp.pos, this.pos).setY(0).normalize();
        return applyHit(w, o, opp, { damage: Math.round(dmg * ASSIST.damageMult * (this.empowered ? this.empowered.mult : 1)), kind: 'ability', knockback: 3, element: this.def.element, dir, color: this.color, scale: 1.3, ...opts });
      },
    };
  }

  // ESPECIAL EM EQUIPE COM LIGAÇÃO (combat/teamSpecials.js): entra num ponto escolhido e faz o golpe da ligação
  // (script(ctx) → Timeline). Entra mesmo recarregando; quem é só convidado (membro do grupo fora da equipe) usa
  // { guest: true } e não deixa recarga.
  perform(script, { at = null, quiet = false, guest = false } = {}) {
    const opp = this.owner.opponent;
    if (!opp || opp.state === 'ko') return false;
    if (this.active) this.leave();
    this.cooldown = 0;
    if (at) this.pos.set(at.x, 0, at.z);
    else {
      const o = this.owner;
      const fwd = new THREE.Vector3().subVectors(opp.pos, o.pos).setY(0).normalize();
      const side = new THREE.Vector3(-fwd.z, 0, fwd.x).multiplyScalar(this.slot === 0 ? 1 : -1);
      const want = o.pos.clone().addScaledVector(side, 1.6).addScaledVector(fwd, -0.6);
      const spot = findFreeSpotNear(this.world.arena, want.x, want.z, { radius: 0.5, others: [{ x: o.pos.x, z: o.pos.z, r: 0.6 }, { x: opp.pos.x, z: opp.pos.z, r: 0.6 }] });
      this.pos.set(spot ? spot.x : want.x, 0, spot ? spot.z : want.z);
    }
    this.active = script(this.enter(opp, { quiet }));
    this.guest = guest;
    this.update(0);
    return true;
  }

  // ESPECIAL EM EQUIPE: entra mesmo recarregando e faz o golpe/habilidade dela (a versão parada)
  callTeam() {
    if (this.active) this.leave();
    this.cooldown = 0;
    return this.call({ still: true });
  }

  // TRANSFORMAÇÃO EM EQUIPE (F3): o líder se transformou com a Barra de Equipe cheia — quem tem FORMA no cânone
  // (def.awakening.form: Dante → Olhos Abertos, Arnaldo → Anfitrião, Kemi → Fantasma...) passa a entrar com o modelo e a
  // ficha da forma; quem só desperta (sem forma) entra com a aura e golpes mais fortes. Dura até o fim do round
  // (reset) ou até virar o lutador em campo numa troca (revertEmpower).
  empower(color) {
    if (this.empowered) return;
    const aw = this.def.awakening;
    const form = aw && aw.form ? getForm(aw.form) : null;
    this.empowered = { base: { def: this.def, rig: this.rig }, color: color ?? this.color, mult: form ? 1.15 : 1.25, form: form ? form.id : null };
    if (form) this.takeOver(form, buildModel(form.model));
  }

  revertEmpower() {
    const e = this.empowered;
    if (!e) return;
    if (this.active) this.leave();
    this.empowered = null;
    if (e.form) {
      this.world.scene.remove(this.rig.root);
      this.takeOver(e.base.def, e.base.rig);
    }
  }

  poof() {
    const p = this.chest();
    this.world.fx.burst(p, { count: 26, color: 0x2a2632, kind: 'smoke', speed: 2.5, life: 0.6, size: 0.7, grow: 1 });
    this.world.fx.burst(p, { count: 16, color: this.color, speed: 4, life: 0.35, size: 0.18 });
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);
    // proteção automática (Lírio): o parceiro tomou vários golpes seguidos → entra sozinho para proteger
    const A = this.def.assistAuto;
    const o = this.owner;
    if (A && this.ready && !this.world.cinematic && (o.comboHits || 0) >= A.comboHits && ['hitstun', 'stun'].includes(o.state)) this.call({ auto: true });
    if (!this.active) return;
    const done = this.active.update(dt);
    this.anim.update(dt);
    // a aura de quem entrou transformada pela equipe
    if (this.empowered && Math.random() < 0.45) {
      const c = this.chest();
      this.world.fx.burst(new THREE.Vector3(c.x + (Math.random() - 0.5) * 0.7, c.y - 0.9 + Math.random() * 1.6, c.z + (Math.random() - 0.5) * 0.7), { count: 1, color: this.empowered.color, speed: 0.3, up: 1.2, life: 0.5, size: 0.13 });
    }
    this.rig.root.position.copy(this.pos);
    this.rig.root.rotation.y = this.yaw;
    if (done) this.leave();
  }

  leave() {
    if (!this.active) return;
    this.active = null;
    this.poof();
    this.world.scene.remove(this.rig.root);
    this.cooldown = this.guest ? 0 : ASSIST.cooldown * (this.autoCall && this.def.assistAuto ? this.def.assistAuto.cooldownMult : 1);
    this.autoCall = false;
  }

  // troca de personagem: passa a ser quem acabou de sair de campo (com o modelo dele)
  takeOver(def, rig) {
    if (this.active) this.leave();
    this.def = def;
    this.rig = rig;
    this.anim = new Animator(rig, def.anims);
    this.anim.poseFilter = twoHandFilter(def);
    this.anim.play('idle', { blend: 0 });
    this.color = ELEMENTS[def.element] ? new THREE.Color(ELEMENTS[def.element].color).getHex() : def.energyColor;
  }

  // fim do round / partida: some sem efeito e volta pronto
  reset() {
    this.active = null;
    this.world.scene.remove(this.rig.root);
    this.cooldown = 0;
    this.revertEmpower(); // a transformação em equipe vale só até o fim do round
  }
}
