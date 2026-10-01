import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw } from '../core/util.js';
import { applyHit } from './damage.js';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';
import { findSpotBehind, findFreeSpotNear } from './positioning.js';
import { createMistZone } from './abilities.js';
import { ELEMENTS } from '../config/elements.js';

// ASSISTÊNCIAS (batalha em equipe): o personagem chamado aparece por alguns segundos, faz UMA ação
// que depende do contexto e vai embora. Não substitui o lutador principal.
//  - jogador ANDANDO  → ação de apoio (buff, zona, puxão...);
//  - jogador PARADO   → ação ofensiva contra o inimigo.
export const ASSIST = {
  cooldown: 18, // segundos por assistência
  damageMult: 0.6, // dano das assistências é reduzido
};

const tmp = new THREE.Vector3();

// ---------------------------------------------------------------- ações por personagem
// Cada uma: (ctx) → Timeline. ctx = { as (a assistência), owner, opp, world, hit(dmg, opts) }
const ACTIONS = {
  // ARTHUR: andando → Ódio Incontrolável no parceiro; parado → Descarnar (ritual de Sangue) no inimigo
  abutre: {
    moving: (c) => buffOwner(c, 'gaze', { type: 'hatred', name: 'ÓDIO (ARTHUR)', time: 6, mult: 1.25, affects: ['melee'], speedMult: 1.1, noBlock: true }, 0xd0102a, 'ÓDIO INCONTROLÁVEL'),
    still: (c) => ritualCuts(c, 0xe0204a, 70, 'DESCARNAR'),
  },
  // AGHATA: andando → amaldiçoa a arma do parceiro (sangramento); parado → Descarnar
  vampira: {
    moving: (c) => buffOwner(c, 'concentrate', { type: 'curse', name: 'ARMA AMALDIÇOADA (AGHATA)', time: 8, bleed: { dps: 6, duration: 3 } }, 0xe0204a, 'ARMA AMALDIÇOADA'),
    still: (c) => ritualCuts(c, 0xe0204a, 80, 'DESCARNAR'),
  },
  // KAISER: andando → névoa Cinerária em volta do parceiro; parado → rajada da M4
  cineraria: {
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
  // JOUI: andando → surge atrás do inimigo e corta; parado → Olhar do Desespero
  mascarado: {
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
  injustica: {
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
  desconjurado: {
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
};

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

function rushStrike(c, anim, hits, sound, extra = {}) {
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

  call() {
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
    const acts = ACTIONS[this.def.id];
    if (!acts) return false;
    // entra ao lado do parceiro (lado da assistência 1 = esquerda, 2 = direita)
    const fwd = new THREE.Vector3().subVectors(opp.pos, o.pos).setY(0).normalize();
    const side = new THREE.Vector3(-fwd.z, 0, fwd.x).multiplyScalar(this.slot === 0 ? 1 : -1);
    const want = o.pos.clone().addScaledVector(side, 1.6).addScaledVector(fwd, -0.6);
    const spot = findFreeSpotNear(w.arena, want.x, want.z, { radius: 0.5, others: [{ x: o.pos.x, z: o.pos.z, r: 0.6 }, { x: opp.pos.x, z: opp.pos.z, r: 0.6 }] });
    this.pos.set(spot ? spot.x : want.x, 0, spot ? spot.z : want.z);
    this.face(opp);
    w.scene.add(this.rig.root);
    this.rig.root.visible = true;
    this.poof();
    w.audio.play('teleport', { volume: 0.7 });
    o.notify(`${this.def.name}!`, true);
    const ctx = {
      as: this, owner: o, opp, world: w, def: this.def, color: this.color,
      hit: (dmg, opts = {}) => {
        if (opp.state === 'ko') return 0;
        const dir = new THREE.Vector3().subVectors(opp.pos, this.pos).setY(0).normalize();
        return applyHit(w, o, opp, { damage: Math.round(dmg * ASSIST.damageMult), kind: 'ability', knockback: 3, element: this.def.element, dir, color: this.color, scale: 1.3, ...opts });
      },
    };
    this.active = (moving ? acts.moving : acts.still)(ctx);
    this.update(0);
    return true;
  }

  poof() {
    const p = this.chest();
    this.world.fx.burst(p, { count: 26, color: 0x2a2632, kind: 'smoke', speed: 2.5, life: 0.6, size: 0.7, grow: 1 });
    this.world.fx.burst(p, { count: 16, color: this.color, speed: 4, life: 0.35, size: 0.18 });
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);
    if (!this.active) return;
    const done = this.active.update(dt);
    this.anim.update(dt);
    this.rig.root.position.copy(this.pos);
    this.rig.root.rotation.y = this.yaw;
    if (done) this.leave();
  }

  leave() {
    if (!this.active) return;
    this.active = null;
    this.poof();
    this.world.scene.remove(this.rig.root);
    this.cooldown = ASSIST.cooldown;
  }

  // fim do round / partida: some sem efeito e volta pronto
  reset() {
    this.active = null;
    this.world.scene.remove(this.rig.root);
    this.cooldown = 0;
  }
}
