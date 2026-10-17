import * as THREE from 'three';
import { Marionette, BloodZombie } from './npcs.js';
import { applyHit } from './damage.js';
import { yawTo, angleDiff, DEG } from '../core/util.js';
import { buildExistido, buildInkBeast } from '../models/beasts.js';
import { inkSplash } from '../fx/inkFx.js';

// ================================================================== EXISTIDO DE MORTE
// Invocação do DEUS DA MORTE (só um por vez). Wiki "Existidos de Morte": um Existido com influência da Morte —
// corpo grande e musculoso, pele cinza, rosto de caveira, escritas em espiral e Lodo Preto escorrendo das órbitas.
// Agressivo (golpes físicos) e com o MOVIMENTO ERRÁTICO: do nada anda em câmera lenta, do nada dispara rápido.
//  - Pancada: socos pesados (claw = a pose de golpe rápido); Pancada com os dois braços que derruba (slam);
//  - Distorção Temporal: de longe, desacelera o corpo do alvo por alguns segundos (timeWarp);
//  - Aceleração: fica bem mais rápido por um tempo, o Lodo jorra e parte dos golpes passa por ele (accel).
// Como os Zumbis de Sangue: sem barra de vida própria na tela. (O Carniçal saiu das invocações: vai virar personagem
// jogável — o modelo continua em tools/blender/npc_carnical.py.)
export const EXISTIDO = {
  name: 'EXISTIDO DE MORTE', hp: 340, duration: 18, speed: 4.2, radius: 0.62, height: 2.3,
  element: 'morte', fxColor: 0x6a6670, poolColor: 0x0a080c, noPool: false,
  leg: [0.5, 0.5], crouch: { hip: -0.18, knee: 0.3, chest: 0.42, neck: -0.32 }, // curvado para a frente, a cabeça erguida para o alvo
  attacks: {
    claw: { windup: 0.28, active: 0.12, recovery: 0.4, range: 2.1, arc: 140, damage: 20, cd: 1.1, knockback: 2, sound: 'heavyPunch' }, // PANCADA (soco; a pose de golpe rápido)
    slam: { windup: 0.6, active: 0.14, recovery: 0.65, range: 2.3, arc: 120, damage: 36, cd: 4, knockback: 5, knockdown: true },
    timeWarp: { windup: 0.5, active: 0.1, recovery: 0.45, range: 9, arc: 60, damage: 4, cd: 9, knockback: 0, slow: { time: 2.5, mult: 0.45 } },
    accel: { windup: 0.3, active: 0.05, recovery: 0.2, range: 99, arc: 360, damage: 0, cd: 11, knockback: 0, self: true, time: 4, speed: 1.9, dodge: 0.4 },
  },
  firstCd: { claw: 0.3, slam: 1.5, timeWarp: 2, accel: 3 },
  // passo errático: a cada 0,35 a 1,1 s sorteia câmera lenta (×0,3) ou disparada (×2,1)
  tempo: { slow: 0.3, fast: 2.1, min: 0.35, max: 1.1 },
};

export class ExistidoMorte extends BloodZombie {
  configFor() { return { ...EXISTIDO, attacks: Object.fromEntries(Object.entries(EXISTIDO.attacks).map(([k, v]) => [k, { ...v }])) }; }
  buildModel() {
    this.strong = false;
    this.isMarionette = false;
    this.isExistido = true;
    this.tempoK = 1;
    this.tempoT = 0;
    this.accelT = 0;
    return buildExistido();
  }

  riseTime() { return 1.0; }
  // sobe do Lodo devagar, em pé
  risePose(k, restY) {
    const e = 1 - (1 - k) * (1 - k);
    this.model.root.position.set(this.pos.x, -2.4 * (1 - e) + restY * e, this.pos.z);
    this.model.root.scale.setScalar(1);
    this.model.joints.body.rotation.x = 0;
    if (Math.random() < 0.5) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.2, this.pos.z), { count: 3, color: 0x0a080c, kind: 'smoke', speed: 1.4, up: 1.6, life: 0.7, size: 0.6 });
  }
  // morreu: o corpo se desfaz em Lodo (o resíduo da wiki); acabou o tempo: afunda de volta
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
    // Aceleração: longe do alvo (ou ferido) dispara até ele
    if (c.accel <= 0 && this.accelT <= 0 && (d > 6 || this.hp < this.maxHp * 0.5)) return 'accel';
    if (d > 2.8 && d < A.timeWarp.range && c.timeWarp <= 0 && tg && !(tg.findBuff && tg.findBuff('timeWarp')) && Math.random() < 0.6) return 'timeWarp';
    if (d < 2.2 && c.slam <= 0 && Math.random() < 0.35) return 'slam';
    if (d < A.claw.range - 0.15 && c.claw <= 0) return 'claw';
    return null;
  }

  attackSound(name) { return name === 'timeWarp' ? 'drain' : name === 'accel' ? 'blink' : 'swing'; }

  // passo errático (câmera lenta ↔ disparada); acelerado, sempre rápido
  stepSpeed(d) {
    const k = this.accelT > 0 ? this.cfg.attacks.accel.speed * 1.2 : this.tempoK;
    return this.cfg.speed * k * (d > 7 ? 1.2 : 1);
  }

  strike(a, tg, d) {
    if (a.self) {
      // ACELERAÇÃO: o Lodo jorra do corpo e ele dispara
      this.accelT = a.time;
      this.world.fx.burst(new THREE.Vector3(this.pos.x, 1.4, this.pos.z), { count: 40, color: 0x0a080c, kind: 'smoke', speed: 3.5, up: 1, life: 0.7, size: 0.5 });
      this.owner.notify && this.owner.notify('ACELERAÇÃO', true);
      return true;
    }
    if (a.slow) {
      // DISTORÇÃO TEMPORAL: o tempo do alvo anda devagar (movimento mais lento)
      const inArc = Math.abs(angleDiff(this.yaw, yawTo(this.pos, tg.pos))) <= (a.arc * DEG) / 2;
      if (!(d <= a.range && inArc) || tg.isInvulnerable()) return true;
      const res = applyHit(this.world, this.owner, tg, { damage: a.damage, kind: 'ability', element: 'morte', knockback: 0, reaction: false, sound: 'drain', color: 0x8a8490, scale: 0.8 });
      if (typeof res === 'number' && tg.state !== 'ko' && tg.addBuff && !tg.findBuff('timeWarp')) {
        tg.addBuff({ type: 'timeWarp', name: 'TEMPO DISTORCIDO', time: a.slow.time, duration: a.slow.time, speedMult: a.slow.mult });
        tg.notify && tg.notify('DISTORÇÃO TEMPORAL', true);
      }
      return true;
    }
    return super.strike(a, tg, d);
  }

  swingFx(a) {
    if (a.self) return;
    if (a.slow) {
      // os olhos vazios brilham e uma onda cinza vai até o alvo
      const p = new THREE.Vector3(this.pos.x, this.pos.y + 2.0, this.pos.z);
      this.world.fx.flash(p, { color: 0xb8b2c0, size: 0.7, life: 0.25 });
      if (this.target) this.world.fx.tracer(p, this.target.chestPos(), { color: 0x8a8490, life: 0.3, width: 0.05 });
      if (this.target) this.world.fx.ring(new THREE.Vector3(this.target.pos.x, 0.06, this.target.pos.z), { color: 0x8a8490, radius: 1.4, life: 0.6, inner: 0.8 });
      return;
    }
    this.world.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + 1.2, this.pos.z), this.yaw, { color: 0x2a262a, radius: a.range, arc: 2.4, life: 0.22, width: 0.3, roll: a.name === 'slam' ? 1.4 : -0.3 });
  }

  update(dt) {
    if (this.alive && this.state !== 'rise' && this.state !== 'die' && this.state !== 'leave') {
      // MOVIMENTO ERRÁTICO: do nada muda de câmera lenta para disparada (e volta)
      this.tempoT -= dt;
      if (this.tempoT <= 0) {
        const T = this.cfg.tempo;
        this.tempoK = Math.random() < 0.5 ? T.slow : T.fast;
        this.tempoT = T.min + Math.random() * (T.max - T.min);
      }
      if (this.accelT > 0) {
        this.accelT -= dt;
        if (Math.random() < 0.6) this.world.fx.burst(new THREE.Vector3(this.pos.x, 1.2 + Math.random(), this.pos.z), { count: 2, color: 0x0a080c, kind: 'smoke', speed: 1.2, up: -0.6, life: 0.5, size: 0.3 });
      }
    }
    return super.update(dt);
  }

  // ACELERADO: parte dos golpes passa pelo borrão de Lodo
  hitBy(attacker, dmg, info) {
    const A = this.cfg.attacks.accel;
    if (this.accelT > 0 && Math.random() < A.dodge) {
      this.world.fx.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1.2, this.pos.z), { count: 8, color: 0x0a080c, kind: 'smoke', speed: 3, life: 0.3, size: 0.25 });
      return;
    }
    super.hitBy(attacker, dmg, info);
  }

  onDestroyed(attacker) {
    attacker && attacker.notify && attacker.notify('O EXISTIDO DE MORTE CAIU!', true);
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
