import * as THREE from 'three';
import { Marionette, BloodZombie } from './npcs.js';
import { buildCarnical, buildInkBeast } from '../models/beasts.js';
import { inkSplash } from '../fx/inkFx.js';

// ================================================================== O CARNIÇAL PRETO DA MORTE
// Invocação do DEUS DA MORTE (só um por vez). Wiki "Carniçal Preto da Morte": musculatura de Lodo Preto em tendões,
// crânio apodrecido com o Símbolo Espiral vermelho na testa. Calmo, preciso e arrogante — até se ferir.
//  - Garra da Morte: cortes precisos e frios (claw);
//  - Pancada Poderosa: empurra a vítima para longe (slam);
//  - Físico Paranormal: salta de longe em cima do alvo (bite = o salto, com investida e derrubada);
//  - Hipnose Espiral: olha para o alvo e o paralisa por um instante (hypno);
//  - Corpo Fechado: imune a TIROS (balas, chumbo, sniper); só golpes e rituais o machucam;
//  - Instinto Mortal: ferido (metade da vida), larga a postura, fica mais rápido e ataca sem parar.
export const CARNICAL = {
  name: 'O CARNIÇAL', hp: 380, duration: 18, speed: 4.8, radius: 0.5, height: 2.1,
  element: 'morte', fxColor: 0xff2a1a, poolColor: 0x0a080c, noPool: false,
  leg: [0.5, 0.5], crouch: { hip: -0.18, knee: 0.3, chest: 0.12, neck: -0.08 },
  attacks: {
    claw: { windup: 0.18, active: 0.12, recovery: 0.35, range: 2.0, arc: 140, damage: 18, cd: 1.0, knockback: 1.5 },
    slam: { windup: 0.5, active: 0.14, recovery: 0.6, range: 2.2, arc: 120, damage: 32, cd: 4, knockback: 7 },
    bite: { windup: 0.35, active: 0.25, recovery: 0.5, range: 2.0, arc: 120, damage: 28, cd: 4.5, knockback: 3, dash: 14, knockdown: true },
    hypno: { windup: 0.5, active: 0.1, recovery: 0.5, range: 7, arc: 50, damage: 4, cd: 9, knockback: 0, stun: 1.0 },
  },
  firstCd: { claw: 0.3, slam: 1.5, bite: 0.8, hypno: 2.5 },
};
const BULLET_VISUALS = new Set(['bullet', 'sniper', 'pellet', 'cursedSniper', 'deathSpiral']);
export const isBullet = (a) => !!a && (a.bullet || BULLET_VISUALS.has(a.visual));

export class Carnical extends BloodZombie {
  configFor() {
    // cópia própria: o Instinto Mortal muda a velocidade e as recargas dele
    return { ...CARNICAL, attacks: Object.fromEntries(Object.entries(CARNICAL.attacks).map(([k, v]) => [k, { ...v }])) };
  }
  buildModel() {
    this.strong = false;
    this.isMarionette = false;
    this.isCarnical = true;
    return buildCarnical();
  }

  riseTime() { return 1.0; }
  // sobe do Lodo devagar, em pé, já olhando para a vítima
  risePose(k, restY) {
    const e = 1 - (1 - k) * (1 - k);
    this.model.root.position.set(this.pos.x, -2.4 * (1 - e) + restY * e, this.pos.z);
    this.model.root.scale.setScalar(1);
    this.model.joints.body.rotation.x = 0;
    if (Math.random() < 0.5) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.2, this.pos.z), { count: 3, color: 0x0a080c, kind: 'smoke', speed: 1.4, up: 1.6, life: 0.7, size: 0.6 });
  }
  // morreu: o Lodo se desfaz; acabou o tempo: afunda de volta
  vanishPose(k, restY) {
    if (this.state !== 'die') return Marionette.prototype.vanishPose.call(this, k, restY);
    const root = this.model.root;
    root.position.y = restY * (1 - k);
    root.scale.set(1 + k * 0.4, Math.max(0.05, 1 - k * 0.95), 1 + k * 0.4);
    if (Math.random() < 0.5) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.3 + (1 - k), this.pos.z), { count: 4, color: 0x0a080c, kind: 'smoke', speed: 1.5, up: 1, life: 0.6, size: 0.5 });
  }

  pickAttack(d) {
    const c = this.cds;
    const A = this.cfg.attacks;
    const tg = this.target;
    if (d > 2.6 && d < A.hypno.range && c.hypno <= 0 && tg && tg.state !== 'stun' && Math.random() < 0.5) return 'hypno';
    if (d < 2.1 && c.slam <= 0 && Math.random() < 0.35) return 'slam';
    if (d < A.claw.range - 0.2 && c.claw <= 0) return 'claw';
    if (d > 2.6 && d < 9 && c.bite <= 0) return 'bite';
    return null;
  }

  attackSound(name) { return name === 'hypno' ? 'fearGaze' : name === 'claw' ? 'blade' : 'swing'; }

  swingFx(a) {
    if (a.name === 'hypno') {
      // Hipnose Espiral: o símbolo da testa brilha e uma espiral vermelha corre até o alvo
      const p = new THREE.Vector3(this.pos.x, this.pos.y + 1.9, this.pos.z);
      this.world.fx.flash(p, { color: 0xff2a1a, size: 0.8, life: 0.25 });
      if (this.target) this.world.fx.tracer(p, this.target.chestPos(), { color: 0xff2a1a, life: 0.2, width: 0.03 });
      return;
    }
    if (a.name === 'bite') return;
    this.world.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + 1.2, this.pos.z), this.yaw, { color: 0x2a1a2a, radius: a.range, arc: 2.4, life: 0.22, width: 0.3, roll: a.name === 'slam' ? 1.4 : -0.3 });
  }

  // o salto: sobe no ar durante a investida
  bob() {
    const a = this.atk;
    if (a && a.name === 'bite' && this.state === 'attack') {
      const t = this.stateT - a.windup;
      if (t > 0 && t < a.active + 0.1) return Math.sin((t / (a.active + 0.1)) * Math.PI) * 1.0;
    }
    return Math.sin(this.t * 2) * 0.015;
  }

  update(dt) {
    // INSTINTO MORTAL: ferido, larga a postura arrogante e ataca sem parar
    if (!this.enraged && this.alive && this.hp > 0 && this.hp < this.maxHp * 0.5) {
      this.enraged = true;
      this.cfg.speed *= 1.35;
      for (const k in this.cfg.attacks) this.cfg.attacks[k].cd *= 0.6;
      this.world.audio.play('fearGaze', { volume: 0.8, pitch: 0.5 });
      this.world.fx.burst(new THREE.Vector3(this.pos.x, 1.6, this.pos.z), { count: 30, color: 0xff2a1a, speed: 3, life: 0.5, size: 0.15 });
      this.owner.notify && this.owner.notify('O CARNIÇAL PERDEU A COMPOSTURA', true);
    }
    return super.update(dt);
  }

  pose() {
    super.pose();
    const a = this.atk;
    const J = this.model.joints;
    if (a && this.state === 'attack' && a.name === 'hypno' && J.armR) {
      // aponta a garra para a vítima, o crânio inclinado
      J.armR.sh.rotation.set(-1.5 - J.chest.rotation.x, 0.1, -0.1);
      J.armR.el.rotation.x = -0.1;
      J.neck.rotation.z = 0.25;
    } else if (!a) {
      // altivo: braços soltos ao lado, peito aberto, queixo erguido
      J.neck.rotation.x -= this.enraged ? -0.2 : 0.15;
    }
  }

  // CORPO FECHADO: imune a tiros
  hitBy(attacker, dmg, info) {
    if (info && info.bullet) {
      this.world.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1.2, this.pos.z), { count: 10, color: 0xffd0a0, speed: 4, life: 0.25, size: 0.06 });
      attacker && attacker.notify && attacker.notify('CORPO FECHADO — IMUNE A TIROS', true);
      return;
    }
    super.hitBy(attacker, dmg, info);
  }

  onDestroyed(attacker) {
    attacker && attacker.notify && attacker.notify('O CARNIÇAL CAIU!', true);
  }
}

// ================================================================== ANIMAIS INFECTADOS PELA TINTA
// Invocação do AMIGO IMAGINÁRIO (O Segredo na Ilha): os Javalis Infectados e os Cachorros Selvagens de Tipora,
// cadáveres ambulantes de carne derretida que tremem, grunhem e atacam descontrolados. Saem de poças de tinta.
//  - JAVALI: enorme, lento para virar; chifrada com as presas e a INVESTIDA que derruba;
//  - CÃO: magro e rápido; mordidas e o salto no pescoço.
export const INK_BEAST = {
  javali: {
    name: 'JAVALI INFECTADO', hp: 170, duration: 12, speed: 4.4, radius: 0.7, height: 1.3,
    element: 'tinta', fxColor: 0x8a4a22, poolColor: 0x2a1006, noPool: true,
    attacks: {
      gore: { windup: 0.35, active: 0.14, recovery: 0.5, range: 1.9, arc: 120, damage: 22, cd: 1.6, knockback: 4 },
      charge: { windup: 0.5, active: 0.45, recovery: 0.6, range: 1.8, arc: 100, damage: 30, cd: 4.5, knockback: 5, dash: 13, knockdown: true },
    },
    firstCd: { gore: 0.4, charge: 0.6 },
  },
  cao: {
    name: 'CÃO SELVAGEM INFECTADO', hp: 80, duration: 12, speed: 6.2, radius: 0.45, height: 0.9,
    element: 'tinta', fxColor: 0x8a4a22, poolColor: 0x2a1006, noPool: true,
    attacks: {
      bite: { windup: 0.2, active: 0.12, recovery: 0.35, range: 1.5, arc: 120, damage: 10, cd: 0.9, knockback: 1 },
      pounce: { windup: 0.3, active: 0.3, recovery: 0.45, range: 1.6, arc: 110, damage: 16, cd: 3.5, knockback: 2.5, dash: 12 },
    },
    firstCd: { bite: 0.3, pounce: 0.7 },
  },
};

export class InkBeast extends Marionette {
  configFor(o) { return INK_BEAST[o.kind] || INK_BEAST.cao; }
  buildModel(o) {
    this.kind = INK_BEAST[o.kind] ? o.kind : 'cao';
    this.isMarionette = false;
    this.isInkBeast = true;
    return buildInkBeast(this.kind);
  }

  chooseTarget() { this.target = this.owner.opponent; } // nunca trai o Amigo

  pickAttack(d) {
    const c = this.cds;
    const A = this.cfg.attacks;
    const [near, far] = this.kind === 'javali' ? ['gore', 'charge'] : ['bite', 'pounce'];
    if (d > 2.6 && d < 9 && c[far] <= 0) return far;
    if (d < A[near].range - 0.1 && c[near] <= 0) return near;
    return null;
  }

  attackSound(name) { return name === 'charge' ? 'heavyPunch' : 'bloodClaw'; }
  stepSpeed(d) { return this.cfg.speed * (d > 6 ? 1.3 : 1); }
  restY() { return 0; }
  bob() { return Math.abs(Math.sin(this.gait * (this.kind === 'javali' ? 3 : 4.5))) * 0.05; }

  // rasteja para fora da poça de tinta
  riseTime() { return 0.6; }
  risePose(k) {
    const root = this.model.root;
    root.position.set(this.pos.x, -0.8 * (1 - k), this.pos.z);
    root.scale.setScalar(1);
    if (Math.random() < 0.4) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.15, this.pos.z), { count: 3, color: 0x4a1c0e, speed: 1.6, up: 2, life: 0.5, size: 0.12, gravity: 8 });
  }
  // morreu: derrete numa poça de tinta; acabou o tempo: afunda
  vanishPose(k) {
    const root = this.model.root;
    if (this.state !== 'die') { root.position.y = -k * 1.2; return; }
    root.scale.set(1 + k * 0.4, Math.max(0.05, 1 - k * 0.95), 1 + k * 0.4);
    if (!this.melted) { this.melted = true; inkSplash(this.world, new THREE.Vector3(this.pos.x, 0.05, this.pos.z), { size: this.kind === 'javali' ? 1.4 : 0.9, life: 4 }); }
  }

  swingFx(a) {
    if (a.dash) return;
    this.world.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + this.height * 0.5, this.pos.z), this.yaw, { color: 0x6a3414, radius: a.range, arc: 2.0, life: 0.2, width: 0.25, roll: -0.2 });
  }

  onDestroyed() {}

  // galope procedural: pernas em diagonal, o corpo treme sem parar (infectado)
  pose() {
    const J = this.model.joints;
    this.model.root.rotation.y = this.yaw;
    const t = this.t;
    const walk = this.state === 'chase' ? 1 : 0;
    const ph = this.gait * (this.kind === 'javali' ? 3 : 4.5);
    const tremble = Math.sin(t * 37) * 0.02 + Math.sin(t * 23) * 0.015;
    let headX = Math.sin(t * 3) * 0.05 + tremble * 2;
    let jaw = 0.15 + Math.abs(Math.sin(t * 9)) * 0.1;
    let torsoX = 0;
    const a = this.atk;
    if (a && this.state === 'attack') {
      const st = this.stateT;
      const k = Math.min(1, st / a.windup);
      const after = st > a.windup;
      if (a.name === 'gore') { headX = after ? -0.6 : 0.5 * k; jaw = 0.4; } // abaixa e chifra para cima
      else if (a.name === 'charge') { headX = 0.45; torsoX = 0.1; jaw = 0.5; }
      else if (a.name === 'bite') { headX = after ? 0.2 : -0.3 * k; jaw = after ? 0.05 : 0.8 * k; }
      else if (a.name === 'pounce') { headX = -0.3; torsoX = after ? -0.35 : 0.2 * k; jaw = 0.9; }
    }
    J.torso.rotation.set(torsoX + tremble, 0, tremble);
    if (J.head) J.head.rotation.x = headX;
    if (J.jaw) J.jaw.rotation.x = jaw;
    if (J.tail) J.tail.rotation.set(Math.sin(t * 6) * 0.3, Math.sin(t * 4) * 0.4, 0);
    J.legs.forEach((l, i) => {
      const diag = i === 0 || i === 3 ? 0 : Math.PI; // FL+BR juntas, FR+BL juntas
      const s = Math.sin(ph + diag);
      l.hip.rotation.x = s * 0.6 * walk;
      if (l.knee) l.knee.rotation.x = Math.max(0, -s) * 0.7 * walk * (i < 2 ? -1 : 1);
    });
    this.updateFlash();
  }
}
