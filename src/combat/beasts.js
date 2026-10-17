import * as THREE from 'three';
import { Marionette, BloodZombie } from './npcs.js';
import { applyHit } from './damage.js';
import { yawTo, angleDiff, DEG, forwardFromYaw } from '../core/util.js';
import { buildExistido, buildInkBeast, buildSphinx } from '../models/beasts.js';
import { startRiddle, canRiddle } from './riddle.js';
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

// ================================================================== CARNIÇAL DA ESFINGE
// Especial da NUBI (wiki "Carniçal da Esfinge", Calamidade ep. 10): sobe da poça de Lodo e ataca SÓ o adversário (não
// trai a dona, ao contrário da Marionete), com barra de vida própria no topo da tela. Habilidades da wiki:
//  - AMEDRONTAR: ao surgir, a presença abala o alvo (fica pasmo por um instante);
//  - SALTAR: um grande salto que cai em cima do alvo, dano em área e derruba;
//  - VOMITAR LODO: o Lodo cai numa poça embaixo do alvo; quem pisa nela fica ENFRAQUECIDO (e mais lento);
//  - ESTÔMAGO: devora o alvo — preso dentro das costelas, toma dano e o dano cura a Esfinge (apertar botões solta antes);
//  - ENIGMA: a barra de vida tem 3 MARCAS (75%, 50%, 25%); a cada marca que a vida passa, o mundo para e o alvo
//    responde um enigma com Y/A/B/X (combat/riddle.js).
//    Errou → é devorado. Acertou → a Esfinge fica PARALISADA (e leva mais dano) e já perde um pedaço da vida.
//  Garras: as mãos da frente, de perto.
export const SPHINX = {
  name: 'CARNIÇAL DA ESFINGE', hp: 380, duration: 14, speed: 4.6, radius: 0.85, height: 2.6, restY: 0,
  element: 'morte', fxColor: 0x6a3488, poolColor: 0x0a080c, noPool: false,
  attacks: {
    claw: { windup: 0.32, active: 0.14, recovery: 0.42, range: 2.6, arc: 150, damage: 24, cd: 1.2, knockback: 2.5, sound: 'heavyPunch' },
    leap: { windup: 0.45, active: 0.5, recovery: 0.55, range: 2.8, arc: 360, damage: 42, cd: 7, knockback: 4, knockdown: true, hits: [0.9], dash: 0, sound: 'heavyPunch' },
    vomit: { windup: 0.55, active: 0.2, recovery: 0.5, range: 8, arc: 60, damage: 14, cd: 9, knockback: 0.5, pool: { radius: 2.1, life: 5, weaken: 0.7, slow: 0.8 } },
    devour: { windup: 0.4, active: 0.12, recovery: 0.5, range: 2.3, arc: 110, damage: 10, cd: 12, knockback: 0, grabAt: 0.5, hold: 2.4, dps: 34, release: 30 },
    riddle: { windup: 0.7, active: 0.1, recovery: 0.4, range: 99, arc: 360, damage: 0, cd: 0 },
  },
  firstCd: { claw: 0.4, leap: 1.2, vomit: 2.5, devour: 4, riddle: 0 },
  fear: { range: 9, time: 0.8 },
  paralyze: { time: 4.5, damage: 0.18, mult: 1.5 }, // acertou o enigma: paralisada, perde 18% da vida e leva +50% de dano
  marks: [0.75, 0.5, 0.25], // as marcas da barra: passou de uma, vem um enigma
  wrongBite: 60, // errou o enigma: a mordida antes de devorar (com o Estômago, ~10% da vida)
};

export class SphinxGhoul extends Marionette {
  configFor() { return { ...SPHINX, attacks: Object.fromEntries(Object.entries(SPHINX.attacks).map(([k, v]) => [k, { ...v }])) }; }
  buildModel() {
    this.isMarionette = false;
    this.isSphinx = true;
    this.bossBar = true; // barra de vida no topo da tela, como a Marionete
    this.riddles = 0;
    this.marksLeft = [...SPHINX.marks];
    this.riddleDue = 0; // marcas passadas esperando o enigma
    this.feared = false;
    this.paralyzeT = 0;
    return buildSphinx();
  }

  // leal: nunca se volta contra a Nubi
  chooseTarget() { this.target = this.owner.opponent; }

  riseTime() { return 1.4; }
  // sobe da poça de Lodo, o corpo escorrendo
  risePose(k, restY) {
    const e = 1 - (1 - k) * (1 - k);
    const root = this.model.root;
    root.position.set(this.pos.x, -2.8 * (1 - e) + restY * e, this.pos.z);
    root.scale.setScalar(1);
    if (Math.random() < 0.6) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.2, this.pos.z), { count: 3, color: 0x0a080c, kind: 'smoke', speed: 1.6, up: 2.2, life: 0.8, size: 0.7 });
  }
  // morreu ou acabou o tempo: volta a ser Lodo (derrete na poça)
  vanishPose(k, restY) {
    const root = this.model.root;
    root.position.y = restY - k * 0.6;
    root.scale.set(1 + k * 0.35, Math.max(0.04, 1 - k * 0.96), 1 + k * 0.35);
    if (Math.random() < 0.5) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.3 + (1 - k) * 1.5, this.pos.z), { count: 4, color: 0x0a080c, kind: 'smoke', speed: 1.6, up: 0.6, life: 0.6, size: 0.6 });
  }

  pickAttack(d) {
    const c = this.cds;
    const A = this.cfg.attacks;
    const tg = this.target;
    // ENIGMA: a vida passou de uma das marcas da barra
    if (this.riddleDue > 0 && canRiddle(this.world, tg)) return 'riddle';
    if (d > 3.2 && d < 9.5 && c.leap <= 0) {
      A.leap.dash = Math.min(16, Math.max(0, (d - 1.3) / A.leap.active));
      return 'leap';
    }
    if (d > 3 && d < A.vomit.range && c.vomit <= 0 && Math.random() < 0.6) return 'vomit';
    if (d < A.devour.range && c.devour <= 0 && Math.random() < 0.35 && !['downed', 'launched', 'grabbed'].includes(tg.state)) return 'devour';
    if (d < A.claw.range - 0.15 && c.claw <= 0) return 'claw';
    return null;
  }

  attackSound(name) { return name === 'riddle' ? 'fearGaze' : name === 'vomit' ? 'drain' : name === 'leap' ? 'jump' : 'swing'; }
  stepSpeed(d) { return this.cfg.speed * (d > 6 ? 1.3 : 1); }
  restY() { return 0; }

  bob() {
    const a = this.atk;
    if (a && a.name === 'leap' && this.state === 'attack') {
      const k = (this.stateT - a.windup) / a.active;
      if (k > 0 && k < 1) return Math.sin(Math.PI * k) * 2.2;
    }
    return Math.abs(Math.sin(this.gait * 2.2)) * 0.06;
  }

  update(dt) {
    if (this.alive && this.state === 'chase' && !this.feared) this.amedrontar();
    if (this.state === 'stunned' && this.stateT >= this.paralyzeT) this.setState('chase');
    return super.update(dt);
  }

  // AMEDRONTAR: o urro ao surgir deixa o alvo pasmo por um instante
  amedrontar() {
    this.feared = true;
    const tg = this.target;
    const F = this.cfg.fear;
    this.world.audio.play('fearGaze', { pitch: 0.6 });
    this.world.cameraRig.shake(0.3, 0.35);
    this.world.fx.ring(new THREE.Vector3(this.pos.x, 0.06, this.pos.z), { color: 0x6a3488, radius: F.range * 0.6, life: 0.6, inner: 0.85 });
    if (!tg || tg.state === 'ko' || tg.isInvulnerable() || Math.hypot(tg.pos.x - this.pos.x, tg.pos.z - this.pos.z) > F.range) return;
    if (['grabbed', 'downed', 'launched'].includes(tg.state)) return;
    tg.stun(F.time, 'stagger');
    tg.notify && tg.notify('AMEDRONTADO', true);
  }

  strike(a, tg, d) {
    const w = this.world;
    if (a.name === 'riddle') {
      if (startRiddle(w, this, tg)) { this.riddles++; this.riddleDue--; tg.notify && tg.notify('O ENIGMA DA ESFINGE', true); }
      return true;
    }
    if (a.name === 'leap') {
      // a queda: onda de choque em volta
      w.cameraRig.shake(0.5, 0.35);
      w.fx.ring(new THREE.Vector3(this.pos.x, 0.06, this.pos.z), { color: 0x2a2030, radius: a.range, life: 0.5, inner: 0.6 });
      w.fx.burst(new THREE.Vector3(this.pos.x, 0.3, this.pos.z), { count: 30, color: 0x0a080c, kind: 'smoke', speed: 4, up: 1.4, life: 0.7, size: 0.6 });
      super.strike(a, tg, d);
      return true;
    }
    if (a.pool) {
      // VOMITAR LODO: a poça cai embaixo do alvo (ou o mais longe que alcança na direção dele)
      const F = forwardFromYaw(this.yaw, new THREE.Vector3());
      const reach = Math.min(d, a.range);
      const at = new THREE.Vector3(this.pos.x + F.x * reach, 0.04, this.pos.z + F.z * reach);
      this.lodoPool(at, a.pool);
      const inArc = Math.abs(angleDiff(this.yaw, yawTo(this.pos, tg.pos))) <= (a.arc * DEG) / 2;
      if (d <= a.range && inArc && !tg.isInvulnerable()) {
        applyHit(w, this.owner, tg, { damage: a.damage, kind: 'ability', element: 'morte', knockback: a.knockback, dir: F, sound: 'drain', color: 0x14101a, scale: 1 });
      }
      return true;
    }
    return super.strike(a, tg, d);
  }

  // a poça do vômito: quem estiver dentro (só o adversário) fica ENFRAQUECIDO e mais lento
  lodoPool(at, P) {
    const w = this.world;
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(P.radius, 28), new THREE.MeshBasicMaterial({ color: 0x07060a, transparent: true, opacity: 0.85, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(at);
    w.scene.add(mesh);
    const victim = this.owner.opponent;
    let t = 0;
    w.addTicker({
      update(dt) {
        t += dt;
        mesh.material.opacity = 0.85 * Math.max(0, Math.min(1, (P.life - t) / 0.6, t / 0.15));
        if (victim && victim.state !== 'ko' && Math.hypot(victim.pos.x - at.x, victim.pos.z - at.z) <= P.radius && victim.pos.y < 0.6) {
          const b = victim.findBuff('lodoWeak');
          if (b) b.time = 0.35;
          else {
            victim.addBuff({ type: 'lodoWeak', name: 'ENFRAQUECIDO (LODO)', time: 0.35, duration: 0.35, mult: P.weaken, affects: ['melee', 'ranged', 'ability'], speedMult: P.slow });
            victim.notify && victim.notify('ENFRAQUECIDO', true);
          }
          if (Math.random() < 0.2) w.fx.burst(victim.pos.clone().setY(0.2), { count: 1, color: 0x0a080c, speed: 0.4, up: 0.8, life: 0.4, size: 0.12, gravity: 6 });
        }
        return t >= P.life;
      },
      dispose() { w.scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); },
    });
  }

  swingFx(a) {
    const w = this.world;
    if (a.name === 'leap' || a.name === 'devour') return;
    if (a.name === 'riddle') {
      w.fx.flash(new THREE.Vector3(this.pos.x, 2.6, this.pos.z), { color: 0x9a5ac8, size: 1.2, life: 0.4 });
      return;
    }
    if (a.name === 'vomit') {
      // o jorro de Lodo da boca até o alvo
      const F = forwardFromYaw(this.yaw, new THREE.Vector3());
      const mouth = new THREE.Vector3(this.pos.x + F.x * 1.5, 2.1, this.pos.z + F.z * 1.5);
      for (let i = 0; i < 6; i++) w.fx.burst(mouth.clone().addScaledVector(F, i * 0.9).setY(2.1 - i * 0.33), { count: 4, color: 0x0a080c, kind: 'smoke', speed: 0.8, up: -0.6, life: 0.5, size: 0.4 });
      return;
    }
    w.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + 1.0, this.pos.z), this.yaw, { color: 0x6a3488, radius: a.range, arc: 2.4, life: 0.22, width: 0.32, roll: -0.25 });
  }

  grab(tg) {
    super.grab(tg);
    tg.notify && tg.notify('DEVORADO', true);
    this.world.audio.play('bloodClaw', { volume: 0.8 });
    this.devourAcc = 0;
  }

  // ESTÔMAGO: a vítima fica presa dentro das costelas; o dano que ela toma cura a Esfinge
  dragTick(dt, g, a) {
    const F = forwardFromYaw(this.yaw, new THREE.Vector3());
    g.pos.set(this.pos.x + F.x * 0.15, 0.35, this.pos.z + F.z * 0.15);
    g.vel.set(0, 0, 0);
    g.yaw = this.yaw;
    this.devourAcc += dt;
    if (this.devourAcc >= 0.4) {
      this.devourAcc -= 0.4;
      const res = applyHit(this.world, this.owner, g, { damage: a.dps * 0.4, kind: 'ability', element: 'morte', reaction: false, ignoreInvuln: true, knockback: 0, sound: 'drain', color: 0x6a3488, scale: 0.7 });
      if (typeof res === 'number' && res > 0) this.hp = Math.min(this.maxHp, this.hp + res);
    }
    if (Math.random() < 0.3) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.9, this.pos.z), { count: 1, color: 0x0a080c, speed: 0.4, up: -0.8, life: 0.5, size: 0.15, gravity: 6 });
  }

  release(hit) {
    const g = this.held;
    super.release(hit);
    if (g) g.pos.y = Math.max(0, g.pos.y);
  }

  // ENIGMA respondido certo: a Esfinge fica paralisada (a chance de bater nela) e já perde um pedaço da vida
  riddleSolved(victim) {
    const P = this.cfg.paralyze;
    if (this.held) this.release(false);
    this.atk = null;
    this.setState('stunned');
    this.paralyzeT = P.time;
    victim.notify && victim.notify('ENIGMA RESOLVIDO — A ESFINGE ESTÁ PARALISADA', true);
    this.owner.notify && this.owner.notify('RESPONDERAM O ENIGMA', true);
    // o dano do acerto não passa direto pela próxima marca (cada enigma vem da luta)
    const floor = this.marksLeft.length ? this.marksLeft[0] * this.maxHp + 1 : 1;
    const dmg = Math.min(this.maxHp * P.damage, Math.max(0, this.hp - floor));
    if (dmg > 0) this.hitBy(victim, dmg / P.mult);
  }

  // ENIGMA errado (ou sem resposta): morde e DEVORA
  riddleFailed(victim, timeout) {
    const w = this.world;
    victim.notify && victim.notify(timeout ? 'SEM RESPOSTA — DEVORADO' : 'RESPOSTA ERRADA — DEVORADO', true);
    applyHit(w, this.owner, victim, { damage: this.cfg.wrongBite, kind: 'ability', element: 'morte', ignoreInvuln: true, knockback: 0, reaction: false, sound: 'bloodClaw', color: 0x6a3488, scale: 1.4 });
    if (victim.state === 'ko' || w.cinematic) return;
    // puxa para dentro das costelas
    this.atk = { name: 'devour', ...this.cfg.attacks.devour, done: [], swung: [], hold: this.cfg.attacks.devour.hold + 0.4, vsOwner: false };
    this.grab(victim);
  }

  hitBy(attacker, dmg, info) {
    super.hitBy(attacker, this.state === 'stunned' ? dmg * this.cfg.paralyze.mult : dmg, info);
    // passou de uma marca da barra (e ainda está de pé): o próximo movimento dela é o enigma
    while (this.hp > 0 && this.marksLeft.length && this.hp <= this.marksLeft[0] * this.maxHp) {
      this.marksLeft.shift();
      this.riddleDue = Math.min(1, this.riddleDue + 1); // duas marcas de uma vez = um enigma só
    }
  }

  onDestroyed(attacker) {
    attacker && attacker.notify && attacker.notify('O CARNIÇAL DA ESFINGE CAIU!', true);
  }

  // quadrúpede: passos em diagonal, pescoço balançando, asas abrindo; paralisada, treme parada
  pose() {
    const J = this.model.joints;
    this.model.root.rotation.y = this.yaw;
    const t = this.t;
    const walk = this.state === 'chase' ? 1 : 0;
    const ph = this.gait * 2.2;
    let neckX = Math.sin(t * 1.4) * 0.05;
    let headX = Math.sin(t * 1.9) * 0.06;
    let jaw = 0.08 + Math.abs(Math.sin(t * 3)) * 0.06;
    let torsoX = 0;
    let wing = 0.15 + Math.sin(t * 1.6) * 0.08;
    const a = this.atk;
    if (this.state === 'stunned') {
      const tr = Math.sin(t * 41) * 0.03;
      neckX = 0.35 + tr; headX = 0.3; jaw = 0.5; wing = -0.2; torsoX = 0.05 + tr;
    } else if (this.state === 'rise' || (!this.feared && this.state !== 'attack')) {
      wing = 0.7; jaw = 0.6; neckX = -0.25;
    } else if (a && (this.state === 'attack' || this.state === 'drag')) {
      const st = this.stateT;
      const k = Math.min(1, st / a.windup);
      const after = st > a.windup;
      switch (a.name) {
        case 'claw': torsoX = after ? 0.15 : -0.2 * k; neckX = after ? 0.25 : -0.15 * k; break;
        case 'leap': torsoX = after ? -0.25 : 0.2 * k; wing = after ? 1.0 : 0.5 * k; neckX = -0.2; break;
        case 'vomit': neckX = after ? 0.45 : -0.3 * k; headX = after ? 0.25 : -0.2 * k; jaw = after ? 0.9 : 0.4 * k; break;
        case 'devour':
          neckX = after ? 0.55 : -0.25 * k; jaw = after ? 0.2 : 0.9 * k;
          if (this.state === 'drag') { neckX = 0.2; jaw = 0.25 + Math.abs(Math.sin(t * 7)) * 0.2; }
          break;
        case 'riddle': neckX = -0.35 * k; headX = -0.15 * k; wing = 1.1 * k; jaw = 0.35 + Math.sin(t * 8) * 0.1; break;
        default: break;
      }
    }
    if (J.torso) J.torso.rotation.set(torsoX, 0, 0);
    if (J.neck) J.neck.rotation.x = neckX;
    if (J.head) J.head.rotation.x = headX;
    if (J.jaw) J.jaw.rotation.x = jaw;
    if (J.tail) J.tail.rotation.set(Math.sin(t * 2.2) * 0.15, Math.sin(t * 1.5) * 0.35, 0);
    if (J.wingL) J.wingL.rotation.set(0, wing * 0.6, wing);
    if (J.wingR) J.wingR.rotation.set(0, -wing * 0.6, -wing);
    J.legs.forEach((l, i) => {
      if (!l.hip) return;
      const diag = i === 0 || i === 3 ? 0 : Math.PI;
      const sw = Math.sin(ph + diag);
      l.hip.rotation.x = sw * 0.45 * walk;
      if (l.knee) l.knee.rotation.x = Math.max(0, -sw) * 0.55 * walk * (i < 2 ? -1 : 1);
    });
    this.updateFlash();
  }
}
