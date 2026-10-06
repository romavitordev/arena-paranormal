import * as THREE from 'three';
import { yawTo, distXZ, angleDiff, forwardFromYaw, DEG } from '../core/util.js';
import { applyHit } from './damage.js';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';
import { buildMarionette, updateMarionetteStrings } from '../models/marionette.js';
import { buildBloodZombie } from '../models/bloodZombie.js';
import { addBloodPool } from './bloodPools.js';
import { resolveBody } from './positioning.js';

// NPCs: entidades que existem no campo além dos dois lutadores (clones do Trinitá, a Marionete).
// Interface usada pelo mundo e pelos golpes:
//   owner, pos, radius, height, alive, hp/maxHp, update(dt), hitBy(attacker, dmg, o), dispose()
// Golpes físicos e projéteis do ADVERSÁRIO do dono também acertam NPCs (ver Fighter.checkMeleeHit
// e projectiles.js). Tudo é removido no fim do round/partida (World.clearNpcs).

const v = new THREE.Vector3();

function hitTestNpc(n, p, r = 0) {
  const dy = p.y - n.pos.y;
  if (dy < -0.2 - r || dy > n.height + r) return false;
  return Math.hypot(p.x - n.pos.x, p.z - n.pos.z) <= n.radius + r;
}

// ================================================================== CLONES (Trinitá)
// Cópia do Dante com IA simples: cerca o adversário, ataca com palmas a 50% do dano do Dante.
export const CLONE = {
  hp: 60,
  damageMult: 0.5, // cada clone causa metade do dano do Dante
  targetLock: 0.6, // um mesmo alvo só pode tomar golpe de clone a cada 0,6 s (todos juntos)
  attackCd: [1.4, 2.1],
  speed: 6.5,
};

export class DanteClone {
  constructor(owner, world, idx, duration) {
    this.owner = owner;
    this.world = world;
    this.idx = idx;
    this.isClone = true;
    this.radius = 0.45;
    this.height = 1.8;
    this.hp = CLONE.hp;
    this.maxHp = CLONE.hp;
    this.alive = true;
    this.t = 0;
    this.life = duration;
    this.yaw = owner.yaw;
    this.pos = owner.pos.clone();
    this.attack = null;
    this.cd = 0.5 + idx * 0.45;
    this.strikeIdx = idx;
    this.rig = buildModel(owner.def.model);
    this.rig.root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      o.material = o.material.clone();
      o.material.transparent = true;
      o.material.opacity = o.userData.isOutline ? 0.3 : 0.55;
      if (o.material.color && !o.userData.isOutline) o.material.color.multiplyScalar(0.4);
      o.castShadow = false;
    });
    this.anim = new Animator(this.rig, owner.def.anims);
    this.anim.play('idle', { blend: 0 });
    world.scene.add(this.rig.root);
    this.flash = 0;
  }

  poof() {
    const p = v.set(this.pos.x, this.pos.y + 1, this.pos.z).clone();
    this.world.fx.burst(p, { count: 22, color: 0x0c0a0e, kind: 'smoke', speed: 2.2, life: 0.6, size: 0.7, grow: 1 });
    this.world.fx.burst(p, { count: 10, color: this.owner.def.energyColor, speed: 3, life: 0.3, size: 0.15 });
  }

  update(dt) {
    if (!this.alive) return;
    this.t += dt;
    const w = this.world;
    const target = this.owner.opponent;
    if (this.t >= this.life || this.owner.state === 'ko' || !target) { this.kill(); return; }
    if (this.flash > 0) this.flash -= dt;
    // cerca o alvo: cada clone num ângulo, girando devagar
    const ang = this.idx * ((Math.PI * 2) / 3) + this.t * 0.6;
    const radius = this.attack ? 1.2 : 2.0;
    const want = v.set(target.pos.x + Math.sin(ang) * radius, 0, target.pos.z + Math.cos(ang) * radius);
    const dx = want.x - this.pos.x;
    const dz = want.z - this.pos.z;
    const dist = Math.hypot(dx, dz);
    const dTarget = distXZ(this.pos, target.pos);
    this.yaw = yawTo(this.pos, target.pos);
    if (this.attack) {
      // golpe: avança um pouco e acerta na janela ativa
      const a = this.attack;
      a.t += dt;
      if (a.t < a.active[0]) { this.pos.x += Math.sin(this.yaw) * 2.5 * dt; this.pos.z += Math.cos(this.yaw) * 2.5 * dt; }
      if (!a.hit && a.t >= a.active[0] && a.t <= a.active[1]) {
        const inArc = Math.abs(angleDiff(this.yaw, yawTo(this.pos, target.pos))) < 1.2;
        if (dTarget - target.radius <= a.range && inArc && !target.isInvulnerable() && w.time >= (target.cloneHitLock || 0)) {
          a.hit = true;
          target.cloneHitLock = w.time + CLONE.targetLock; // vários clones não acertam juntos
          applyHit(w, this.owner, target, {
            damage: Math.round(a.damage * CLONE.damageMult), kind: 'melee', knockback: 1.2, hitstun: 0.28,
            dir: forwardFromYaw(this.yaw, new THREE.Vector3()), sound: 'punch', color: 0x9a94ae, scale: 0.8, strike: { damage: a.damage, noPassive: true },
          });
        }
      }
      if (a.t >= a.dur) { this.attack = null; this.cd = CLONE.attackCd[0] + Math.random() * (CLONE.attackCd[1] - CLONE.attackCd[0]); this.anim.play('idle', { blend: 0.1 }); }
    } else {
      if (dist > 0.15) {
        const sp = Math.min(CLONE.speed, dist * 4);
        this.pos.x += (dx / dist) * sp * dt;
        this.pos.z += (dz / dist) * sp * dt;
        if (this.anim.currentName !== this.owner.def.anims.run && dist > 0.6) this.anim.play('run');
      } else if (this.anim.currentName !== 'idle_fist') this.anim.play('idle', { blend: 0.15 });
      this.cd -= dt;
      if (this.cd <= 0 && dTarget < 2.4 && target.state !== 'downed' && target.state !== 'ko') {
        const strikes = this.owner.def.melee.strikes;
        const s = strikes[this.strikeIdx++ % Math.min(3, strikes.length)];
        this.attack = { t: 0, dur: s.dur, active: s.active, range: s.range + 0.2, damage: s.damage, hit: false };
        this.anim.play(s.anim, { restart: true, duration: s.dur });
        w.audio.play('swing', { volume: 0.4 });
      }
    }
    resolveBody(w.arena, this.pos, this.radius);
    this.anim.update(dt);
    this.rig.root.position.copy(this.pos);
    this.rig.root.rotation.y = this.yaw;
    this.rig.setTint && this.rig.setTint(0xffffff, this.flash > 0 ? 0.5 : 0);
  }

  hitTest(p, r) { return this.alive && hitTestNpc(this, p, r); }

  hitBy(attacker, dmg) {
    if (!this.alive) return;
    this.hp -= dmg;
    this.flash = 0.1;
    this.world.fx.impact(v.set(this.pos.x, this.pos.y + 1.1, this.pos.z).clone(), 0x9a94ae, 0.8);
    this.world.audio.play('punch', { volume: 0.5 });
    if (this.hp <= 0) this.kill();
  }

  kill() {
    if (!this.alive) return;
    this.alive = false;
    this.poof();
    this.dispose();
  }

  dispose() {
    this.alive = false;
    this.world.scene.remove(this.rig.root);
    // os materiais foram clonados para este clone (a geometria é compartilhada com o modelo: não descartar)
    if (!this.freed) {
      this.freed = true;
      this.rig.root.traverse((o) => { if (o.isMesh && o.material && !o.userData.isOutline) o.material.dispose(); });
    }
  }
}

// ================================================================== A MARIONETE
// NPC autônomo: sobe do Lodo, persegue e ataca o adversário do Dante por um tempo limitado.
// Cânone (wiki): corpo esquelético flutuando, braços erguidos por fios invisíveis e a FOICE DE OSSOS no braço direito.
//  - Movimentos Desconexos: anda devagar e aos trancos (passos bruscos, juntas que estalam);
//  - Momento Passivo: atravessa obstáculos (só os limites da arena a seguram);
//  - Reflexos Perfeitos: quem chega perto leva um golpe na hora;
//  - Ironia do Destino: dois cortes da foice, agarra e arrasta a vítima — METADE do dano que a Marionete levar
//    enquanto segura vai para quem está preso;
//  - prefere caçar ENERGIA (com um adversário de Energia ela quase não se distrai com o Dante).
// Autônoma e instável: a cada troca de alvo pode se voltar contra o próprio Dante — bem mais provável quanto mais
// perto ele estiver dela (e se ele estiver mais perto que o adversário).
export const MARIONETTE = {
  hp: 350,
  duration: 20,
  speed: 3.6, // média dos trancos (anda aos pulos: para, avança rápido, para)
  radius: 0.6,
  height: 2.6,
  restY: 0.25, // flutua
  fxColor: 0x8ad8c0,
  poolColor: 0x050406,
  attacks: {
    reflex: { windup: 0.08, active: 0.1, recovery: 0.3, range: 1.9, arc: 220, damage: 16, cd: 1.6, knockback: 2.5 },
    quick: { windup: 0.3, active: 0.12, recovery: 0.45, range: 2.9, arc: 150, damage: 26, cd: 1.2, knockback: 2.5 },
    heavy: { windup: 0.6, active: 0.14, recovery: 0.65, range: 2.9, arc: 110, damage: 50, cd: 3.5, knockback: 4, knockdown: true },
    lunge: { windup: 0.32, active: 0.2, recovery: 0.5, range: 2.0, arc: 120, damage: 32, cd: 4.5, knockback: 5, dash: 12 },
    irony: { windup: 0.35, active: 0.5, recovery: 0.45, range: 2.6, arc: 150, damage: 18, cd: 11, knockback: 0.5, hits: [0.35, 0.62], grabAt: 0.82, hold: 1.1, release: 26, share: 0.5 },
  },
  firstCd: { reflex: 0.3, quick: 0.5, heavy: 1.5, lunge: 1.5, irony: 3 },
  // chance (por sorteio, a cada 2 s) de atacar o Dante: base + bônus de proximidade; × energia se o adversário é de Energia
  betray: { base: 0.08, near: 0.22, nearDist: 6, closer: 0.15, oppFar: 0.12, oppFarDist: 10, energia: 0.4 },
};

// ruído "em degraus": muda de valor de repente algumas vezes por segundo (os trancos da Marionete) — sem Math.random,
// então não mexe na sequência sorteada do netplay
function jerk(t, k, rate = 5) {
  const n = Math.floor(t * rate + k * 7.31);
  const x = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export class Marionette {
  constructor(owner, world, pos, o = {}) {
    const cfg = this.configFor(o);
    this.cfg = cfg;
    this.owner = owner;
    this.world = world;
    this.isMarionette = true;
    this.showBar = true;
    this.name = cfg.name || 'A MARIONETE';
    this.radius = cfg.radius;
    this.height = cfg.height;
    this.hp = o.hp ?? cfg.hp;
    this.maxHp = this.hp;
    this.alive = true;
    this.life = o.duration ?? cfg.duration;
    this.t = 0;
    this.seed = (pos.x * 3.7 + pos.z * 1.3) % 10;
    this.pos = pos.clone();
    this.yaw = owner.yaw;
    this.state = 'rise';
    this.stateT = 0;
    this.cds = {};
    for (const k in cfg.attacks) this.cds[k] = (cfg.firstCd && cfg.firstCd[k]) ?? 0.6;
    this.target = owner.opponent;
    this.retarget = 2;
    this.flash = 0;
    this.held = null;
    this.gait = 0;
    // Momento Passivo: só os limites da arena seguram (atravessa paredes, mesas, pilares)
    this.bounds = { colliders: [], boxes: [], bounds: world.arena.bounds, radius: world.arena.radius };
    this.model = this.buildModel(o);
    world.scene.add(this.model.root);
    this.pool = new THREE.Mesh(new THREE.CircleGeometry(cfg.radius * 2.3, 24), new THREE.MeshBasicMaterial({ color: cfg.poolColor, transparent: true, opacity: 0.85 }));
    this.pool.rotation.x = -Math.PI / 2;
    this.pool.position.set(pos.x, 0.03, pos.z);
    world.scene.add(this.pool);
    this.pool.visible = !cfg.noPool; // Zumbis: sobem de uma poça de sangue de verdade (bloodPools)
    this.model.root.position.copy(this.pos);
    this.model.root.position.y = -3;
  }

  configFor() { return MARIONETTE; }

  // surgir: sobe reta do Lodo, inclinada
  riseTime() { return 0.9; }
  risePose(k, restY) {
    const root = this.model.root;
    root.position.set(this.pos.x, -3 + k * (3 + restY), this.pos.z);
    this.model.joints.body.rotation.x = (1 - k) * 0.6;
    if (Math.random() < 0.5) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.2, this.pos.z), { count: 3, color: this.cfg.poolColor, kind: 'smoke', speed: 1.5, up: 1.2, life: 0.6, size: 0.6 });
  }

  // ir embora / morrer: afunda de volta
  vanishPose(k, restY) {
    this.model.root.position.y = restY - k * 3.3;
    this.model.joints.body.rotation.x = k * 0.5;
  }
  buildModel() { return buildMarionette(); }
  restY() { return this.cfg.restY; }

  setState(s) {
    this.state = s;
    this.stateT = 0;
  }

  chooseTarget() {
    const opp = this.owner.opponent;
    const dOpp = opp ? distXZ(this.pos, opp.pos) : 99;
    const dDante = distXZ(this.pos, this.owner.pos);
    // autônoma: às vezes vira contra o Dante (mais provável com ele por perto)
    const B = MARIONETTE.betray;
    let chance = B.base;
    if (dDante < B.nearDist) chance += B.near;
    if (dDante < dOpp) chance += B.closer;
    if (dOpp > B.oppFarDist) chance += B.oppFar;
    if (opp && opp.def && opp.def.element === 'energia') chance *= B.energia; // caça preferida: Energia
    if (this.owner.state !== 'ko' && Math.random() < chance) {
      if (this.target !== this.owner) this.owner.notify('A MARIONETE SE VOLTOU CONTRA VOCÊ!', true);
      this.target = this.owner;
      this.retarget = 5; // persegue o Dante até golpear (ou por até 5 s)
    } else this.target = opp;
  }

  // escolhe o golpe pela distância (null = continua andando)
  pickAttack(d) {
    const c = this.cds;
    if (d < 1.6 && c.reflex <= 0) return 'reflex';
    if (d < 2.4 && c.irony <= 0 && Math.random() < 0.3) return 'irony';
    if (d < 2.6 && c.heavy <= 0 && Math.random() < 0.35) return 'heavy';
    if (d < 2.8 && c.quick <= 0) return 'quick';
    if (d > 4 && d < 10 && c.lunge <= 0) return 'lunge';
    return null;
  }

  attackSound(name) { return name === 'irony' ? 'fearGaze' : 'swing'; }

  // passo aos trancos: avança rápido por um instante e quase para (média ≈ 1)
  stepSpeed(d) {
    const g = Math.max(0, Math.sin(this.t * 5.5 + this.seed)) ** 2 * 3.2 + 0.2;
    return this.cfg.speed * g * (d > 7 ? 1.35 : 1);
  }

  update(dt) {
    if (!this.alive) return;
    const w = this.world;
    this.t += dt;
    this.stateT += dt;
    for (const k in this.cds) this.cds[k] = Math.max(0, this.cds[k] - dt);
    if (this.flash > 0) this.flash -= dt;
    const J = this.model.joints;
    const root = this.model.root;
    const restY = this.restY();
    if (this.state !== 'leave' && this.state !== 'die' && (this.t >= this.life || this.owner.state === 'ko')) {
      this.release(false);
      this.setState('leave');
      w.audio.play('drain');
    }

    // ---- surgir / ir embora (afunda na poça)
    if (this.state === 'rise') {
      const k = Math.min(1, this.stateT / this.riseTime());
      this.risePose(k, restY);
      if (k >= 1) { J.body.rotation.x = 0; this.setState('chase'); }
      this.pose(dt);
      return;
    }
    if (this.state === 'leave' || this.state === 'die') {
      const k = Math.min(1, this.stateT / 0.9);
      this.vanishPose(k, restY);
      this.pool.material.opacity = 0.85 * (1 - k);
      if (k >= 1) this.dispose();
      this.pose(dt);
      return;
    }
    // ---- IA: procura, aproxima, escolhe ataque, executa, reposiciona
    this.retarget -= dt;
    // troca de alvo só fora de um ataque (senão o golpe já mirado no outro erra e a "traição" se perde)
    if (this.state === 'chase' && (this.retarget <= 0 || !this.target || this.target.state === 'ko')) { this.retarget = 2; this.chooseTarget(); }
    const tg = this.target;
    if (!tg) return;
    const d = distXZ(this.pos, tg.pos);
    const face = yawTo(this.pos, tg.pos);
    const px = this.pos.x;
    const pz = this.pos.z;
    if (this.state === 'chase') {
      this.yaw = face;
      const pick = tg.state !== 'downed' ? this.pickAttack(d) : null;
      if (pick) {
        this.atk = { name: pick, ...this.cfg.attacks[pick], done: [], swung: [], vsOwner: tg === this.owner };
        this.setState('attack');
        w.audio.play(this.attackSound(pick), { volume: 0.7 });
      } else if (d > 1.4) {
        // anda em direção ao alvo, contornando um pouco
        const sp = this.stepSpeed(d);
        this.pos.x += Math.sin(face + 0.25) * sp * dt;
        this.pos.z += Math.cos(face + 0.25) * sp * dt;
      }
    } else if (this.state === 'attack') {
      const a = this.atk;
      const t = this.stateT;
      if (t < a.windup || (a.hits && t < a.hits[a.hits.length - 1])) this.yaw = face;
      if (a.dash && t >= a.windup && t < a.windup + a.active + 0.1 && d > 1.4) {
        this.pos.x += Math.sin(this.yaw) * a.dash * dt;
        this.pos.z += Math.cos(this.yaw) * a.dash * dt;
      }
      const hits = a.hits || [a.windup];
      const win = a.hits ? 0.1 : a.active;
      for (let i = 0; i < hits.length; i++) {
        if (t < hits[i] || t > hits[i] + win) continue;
        if (!a.swung[i]) { a.swung[i] = true; this.swingFx(a, i); }
        if (!a.done[i] && this.strike(a, tg, d)) a.done[i] = true;
      }
      // Ironia do Destino: depois dos dois cortes, agarra quem ainda estiver ao alcance
      if (a.grabAt && !a.grabTried && t >= a.grabAt) {
        a.grabTried = true;
        if (d - tg.radius <= a.range + 0.3 && !['ko', 'downed', 'grabbed', 'launched'].includes(tg.state) && !tg.isInvulnerable() && !w.cinematic) {
          this.grab(tg);
          return this.finishTick(px, pz);
        }
      }
      if (t >= a.windup + a.active + a.recovery) this.endAttack();
    } else if (this.state === 'drag') {
      const g = this.held;
      const a = this.atk;
      // apertar botões sem parar solta mais cedo (cada toque tira 0,15 s do agarrão)
      const inp = g && g.input;
      if (inp && (inp.pressed.physical || inp.pressed.jump || inp.pressed.dodge || inp.pressed.ranged)) a.hold -= 0.15;
      if (!g || g.state !== 'grabbed' || this.stateT >= a.hold) this.release(true);
      else {
        // arrasta a vítima de costas, aos trancos, segurando-a na frente
        const sp = 2.4 * (0.5 + Math.max(0, Math.sin(this.t * 9)));
        this.pos.x -= Math.sin(this.yaw) * sp * dt;
        this.pos.z -= Math.cos(this.yaw) * sp * dt;
        resolveBody(this.bounds, this.pos, this.radius);
        const f = forwardFromYaw(this.yaw, v);
        g.pos.x = this.pos.x + f.x * 1.15;
        g.pos.z = this.pos.z + f.z * 1.15;
        resolveBody(w.arena, g.pos, g.radius || 0.4);
        g.vel.set(0, 0, 0);
        g.yaw = this.yaw + Math.PI;
      }
    }
    return this.finishTick(px, pz);
  }

  finishTick(px, pz) {
    resolveBody(this.bounds, this.pos, this.radius);
    this.gait += Math.hypot(this.pos.x - px, this.pos.z - pz);
    const root = this.model.root;
    root.position.set(this.pos.x, this.restY() + this.bob(), this.pos.z);
    this.pose();
    this.scytheTrail(px, pz);
  }

  // a foice é a única coisa que toca o chão: risca o chão enquanto ela anda
  scytheTrail(px, pz) {
    const J = this.model.joints;
    if (!J.puppet || !J.blade) return;
    this.trailClock = (this.trailClock || 0) + 1;
    if (this.trailClock % 4 || Math.hypot(this.pos.x - px, this.pos.z - pz) < 1e-3) return;
    this.model.root.updateMatrixWorld(true);
    const tip = J.blade.localToWorld(v.set(-0.5, -2.15, 0.6));
    if (tip.y > 0.45) return;
    tip.y = 0.06;
    this.world.fx.burst(tip, { count: 2, color: 0x2a2630, kind: 'smoke', speed: 0.4, up: 0.3, life: 0.5, size: 0.22 });
    this.world.fx.burst(tip, { count: 1, color: 0x8ad8c0, speed: 0.8, up: 0.6, life: 0.25, size: 0.05 });
  }

  bob() { return Math.sin(this.t * 2.2) * 0.1 + jerk(this.t, 9, 3) * 0.04; }

  strike(a, tg, d) {
    const inArc = a.arc >= 360 || Math.abs(angleDiff(this.yaw, yawTo(this.pos, tg.pos))) <= (a.arc * DEG) / 2;
    if (!(d - tg.radius <= a.range && inArc && Math.abs(tg.pos.y - this.pos.y) < 2.2)) return false;
    const heavy = a.name === 'heavy' || a.name === 'slam';
    const res = applyHit(this.world, this.owner, tg, {
      damage: a.damage, kind: 'ability', element: this.cfg.element || 'morte', knockback: a.knockback, launch: !!a.knockdown, lowLaunch: !!a.knockdown,
      stun: a.stun, dir: forwardFromYaw(this.yaw, new THREE.Vector3()), sound: heavy ? 'heavyPunch' : 'bladeHit', color: this.cfg.fxColor, scale: heavy ? 1.8 : 1.2,
    });
    if (typeof res === 'number' && a.stun && tg.state !== 'ko') tg.stun(a.stun, 'fear');
    return true;
  }

  swingFx(a, i) {
    if (a.name === 'lunge') return;
    const roll = a.name === 'heavy' ? 1.4 : a.name === 'irony' ? (i ? -0.5 : 0.5) : 0.2;
    this.world.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + 1.4, this.pos.z), this.yaw, { color: 0xbfe8dc, radius: a.range, arc: a.name === 'heavy' ? 2.2 : 2.8, life: 0.25, width: 0.35, roll });
  }

  endAttack() {
    const a = this.atk;
    this.cds[a.name] = a.cd;
    this.atk = null;
    this.setState('chase');
    if (a.vsOwner) { this.target = this.owner.opponent; this.retarget = 2; } // só um golpe "traidor"
  }

  grab(tg) {
    tg.cancelAction && tg.cancelAction();
    tg.setState('grabbed');
    tg.vel.set(0, 0, 0);
    this.held = tg;
    this.setState('drag');
    this.world.audio.play('chainPull', { volume: 0.8 });
    tg.notify && tg.notify('IRONIA DO DESTINO', true);
  }

  // solta quem está preso (hit = arremessa com o golpe final)
  release(hit) {
    const g = this.held;
    const a = this.atk;
    this.held = null;
    if (g && g.state === 'grabbed') {
      g.setState('idle');
      if (hit && a) {
        applyHit(this.world, this.owner, g, {
          damage: a.release, kind: 'ability', element: 'morte', knockback: 4.5, launch: true, lowLaunch: true,
          dir: forwardFromYaw(this.yaw, new THREE.Vector3()), sound: 'heavyPunch', color: this.cfg.fxColor, scale: 1.6,
        });
      }
    }
    if (this.state === 'drag' && a) this.endAttack();
  }

  // ---------------------------------------------------------------- animação procedural das juntas
  pose() {
    const J = this.model.joints;
    this.model.root.rotation.y = this.yaw;
    if (J.puppet) this.posePuppet(J);
    else this.poseLegacy(J);
    updateMarionetteStrings(this.model);
    this.updateFlash();
  }

  // pisca branco ao tomar dano
  updateFlash() {
    const fl = this.flash > 0;
    if (fl === this._fl) return;
    this._fl = fl;
    this.model.root.traverse((o) => {
      if (o.isMesh && o.material && o.material.emissive && !o.userData.isOutline && !o.material.userData.glow) o.material.emissive.setHex(fl ? 0x666666 : 0x000000);
    });
  }

  // modelo do Blender: pose de marionete (braços erguidos por fios invisíveis), tudo aos trancos
  posePuppet(J) {
    const t = this.t;
    const j = (k, r) => jerk(t, k + this.seed, r);
    const sway = Math.sin(t * 1.7);
    J.chest.rotation.set(0.12 + j(2) * 0.05, 0, sway * 0.06 + j(3) * 0.06);
    J.neck.rotation.set(0.4 + j(4) * 0.14, j(5) * 0.3, 0.18 + j(6) * 0.2); // cabeça tombada de lado, sacudindo
    J.jaw.rotation.x = 0.05 + Math.abs(Math.sin(t * 11)) * 0.12 * (j(12, 2) > 0 ? 1 : 0.2); // dentes batendo
    J.hair.rotation.x = -J.neck.rotation.x * 0.8 + Math.sin(t * 2.4) * 0.06; // o cabelo cai por trás, deixando o crânio à mostra
    // repouso: esquerdo com o cotovelo erguido e a garra pendurada; a foice pende até o chão
    let ls = [-0.2 + j(7) * 0.12, 0, 2.3 + j(8) * 0.12], le = -2.6;
    let rs = [j(9) * 0.1, 0, -2.1 + j(10) * 0.1], re = 1.6;
    let twist = 0;
    for (const [i, l] of J.legs.entries()) {
      l.hip.rotation.set(0.12 + Math.sin(t * 1.9 + i * 2) * 0.18 + j(13 + i) * 0.1, 0, (i ? -1 : 1) * 0.05);
      l.knee.rotation.x = 0.35 + Math.sin(t * 2.3 + i) * 0.15 + j(15 + i) * 0.1;
    }
    const a = this.atk;
    if (a && (this.state === 'attack' || this.state === 'drag')) {
      const st = this.stateT;
      const k = Math.min(1, st / a.windup);
      const after = st > a.windup;
      switch (a.name) {
        case 'reflex': // estalo do braço da foice
          rs = after ? [-1.3, 0, -1.0] : [0.3 * k, 0, -2.1 - 0.4 * k]; re = after ? 0.3 : 1.6;
          twist = after ? -0.4 : 0.2;
          break;
        case 'quick': // corte horizontal com a foice
          rs = after ? [-1.4, 0, -1.3] : [0.5 * k, 0, -2.1 - 0.5 * k]; re = after ? 0.4 : 1.2;
          twist = after ? -0.7 : 0.5 * k;
          break;
        case 'heavy': // ergue a foice acima da cabeça e crava à frente
          rs = after ? [-1.15, 0, -0.3] : [-0.4 * k, 0, -2.1 - 0.9 * k]; re = after ? 0.5 : 1.6 - 1.0 * k;
          J.chest.rotation.x = after ? 0.45 : 0.12 - 0.2 * k;
          break;
        case 'lunge': // investida com os dois braços à frente
          ls = [-1.5, 0, 0.5]; le = -0.3; rs = [-1.5, 0, -0.5]; re = 0.3;
          J.chest.rotation.x = 0.35;
          break;
        case 'irony': {
          if (this.state === 'drag') { // segura com a garra e a foice por cima
            ls = [-1.5, 0, 0.35]; le = -0.5; rs = [-0.6, 0, -2.6]; re = 1.0;
            J.chest.rotation.x = 0.3;
            J.jaw.rotation.x = 0.35;
          } else {
            const second = st > (a.hits[0] + a.hits[1]) / 2;
            rs = second ? [-1.2, 0, -2.3] : after ? [-1.4, 0, -1.2] : [0.5 * k, 0, -2.4 * k - 0.1];
            re = second ? 1.4 : 0.5;
            twist = second ? 0.6 : after ? -0.7 : 0.4 * k;
            if (st > a.grabAt - 0.12) { ls = [-1.3, 0, 0.5]; le = -0.6; }
          }
          break;
        }
        default: break;
      }
    }
    J.chest.rotation.y = twist;
    J.armL.sh.rotation.set(ls[0], ls[1], ls[2]);
    J.armR.sh.rotation.set(rs[0], rs[1], rs[2]);
    J.armL.el.rotation.set(0, 0, le);
    J.armR.el.rotation.set(0, 0, re);
  }

  // modelo provisório (feito em código): a animação antiga
  poseLegacy(J) {
    const t = this.t;
    const sway = Math.sin(t * 1.7);
    J.chest.rotation.z = sway * 0.08;
    J.neck.rotation.x = 0.55 + Math.sin(t * 1.3) * 0.08;
    if (J.hair) J.hair.rotation.x = -0.2 + Math.sin(t * 2.4) * 0.1;
    for (const [i, l] of J.legs.entries()) { l.hip.rotation.x = Math.sin(t * 1.9 + i) * 0.25; l.knee.rotation.x = 0.3 + Math.sin(t * 2.3 + i) * 0.2; }
    let lx = -0.2 + sway * 0.1, lz = 0.5, rx = -0.3 - sway * 0.1, rz = -0.55, ex = -0.4;
    const a = this.atk;
    if ((this.state === 'attack' || this.state === 'drag') && a) {
      const k = Math.min(1, this.stateT / a.windup);
      const after = this.stateT > a.windup;
      if (a.name === 'quick' || a.name === 'reflex' || a.name === 'claw' || a.name === 'bite') { rx = after ? -1.6 : -0.6 - k * 1.4; rz = after ? 0.6 : -1.6 * k - 0.4; }
      if (a.name === 'heavy' || a.name === 'slam') { rx = after ? -0.4 : -2.9 * k; lx = after ? -0.4 : -2.9 * k; ex = after ? -0.1 : -0.8; }
      if (a.name === 'lunge' || a.name === 'irony') { rx = -1.5; lx = -1.5; ex = -0.1; }
    }
    J.chest.rotation.y = 0;
    J.armL.sh.rotation.set(lx, 0, lz);
    J.armR.sh.rotation.set(rx, 0, rz);
    J.armL.el.rotation.x = ex;
    J.armR.el.rotation.x = ex;
  }

  hitTest(p, r) { return this.alive && this.state !== 'rise' && this.state !== 'leave' && this.state !== 'die' && hitTestNpc(this, p, r); }

  hitBy(attacker, dmg) {
    if (!this.alive || this.state === 'die' || this.state === 'leave') return;
    this.hp -= dmg;
    this.flash = 0.1;
    this.world.fx.impact(new THREE.Vector3(this.pos.x, this.pos.y + this.height * 0.55, this.pos.z), this.cfg.fxColor, 1);
    this.world.audio.play('punch', { volume: 0.6 });
    // Ironia do Destino: metade do dano vai para quem ela está segurando
    const g = this.held;
    if (g && this.state === 'drag' && g.state === 'grabbed' && this.atk && this.atk.share) {
      applyHit(this.world, this.owner, g, { damage: dmg * this.atk.share, kind: 'ability', element: 'morte', reaction: false, ignoreInvuln: true, knockback: 0, sound: 'bladeHit', color: this.cfg.fxColor, scale: 0.8 });
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.release(false);
      this.setState('die');
      this.world.audio.play('ko', { volume: 0.6 });
      this.world.fx.burst(new THREE.Vector3(this.pos.x, this.height * 0.5, this.pos.z), { count: 50, color: this.cfg.poolColor, kind: 'smoke', speed: 3, life: 1, size: 0.9 });
      this.onDestroyed(attacker);
    }
  }

  onDestroyed(attacker) { attacker && attacker.notify && attacker.notify('MARIONETE DESTRUÍDA!', true); }

  dispose() {
    if (!this.alive && !this.model.root.parent) return;
    this.release(false);
    this.alive = false;
    this.world.scene.remove(this.model.root);
    this.world.scene.remove(this.pool);
    this.pool.geometry.dispose();
    this.pool.material.dispose();
    // o modelo é todo dela: libera geometrias e materiais (para de consumir memória e GPU)
    this.model.root.traverse((o) => {
      if (o.geometry && !o.userData.sharedGeometry) o.geometry.dispose();
      if (o.material && !o.userData.isOutline) o.material.dispose();
    });
  }
}

// ================================================================== ZUMBIS DE SANGUE
// Senhor do Sangue (O Diabo, Portador do Trono): de uma poça de sangue sobem Zumbis de Sangue que lutam pelo Diabo
// por alguns segundos. Carne viva vermelha, sem olhos, a cabeça é quase só uma boca de presas. NUNCA traem o dono.
//  - FRACO: magro e rápido, garras e mordida em investida; morre fácil;
//  - FORTE: massa de músculo quase de quatro, lento, golpes pesados (pancada com os dois braços derruba).
export const BLOOD_ZOMBIE = {
  weak: {
    name: 'ZUMBI DE SANGUE', hp: 90, duration: 12, speed: 5.2, radius: 0.5, height: 2.0,
    element: 'sangue', fxColor: 0xc0202c, poolColor: 0x5a0008, noPool: true,
    leg: [0.5, 0.48], crouch: { hip: -0.75, knee: 1.25, chest: 0.62, neck: -0.75 },
    attacks: {
      claw: { windup: 0.22, active: 0.12, recovery: 0.4, range: 1.9, arc: 140, damage: 12, cd: 1.1, knockback: 1.5 },
      bite: { windup: 0.3, active: 0.2, recovery: 0.55, range: 1.6, arc: 120, damage: 20, cd: 4, knockback: 3, dash: 11 },
    },
    firstCd: { claw: 0.3, bite: 1 },
  },
  strong: {
    name: 'ZUMBI DE SANGUE FORTE', hp: 260, duration: 12, speed: 4.0, radius: 0.75, height: 2.5,
    element: 'sangue', fxColor: 0xc0202c, poolColor: 0x5a0008, noPool: true,
    leg: [0.46, 0.44], crouch: { hip: -0.85, knee: 1.35, chest: 0.95, neck: -0.85 },
    attacks: {
      claw: { windup: 0.3, active: 0.14, recovery: 0.45, range: 2.5, arc: 150, damage: 24, cd: 1.3, knockback: 2.5 },
      slam: { windup: 0.6, active: 0.14, recovery: 0.7, range: 2.6, arc: 120, damage: 42, cd: 4, knockback: 4, knockdown: true },
      bite: { windup: 0.35, active: 0.2, recovery: 0.6, range: 2.0, arc: 120, damage: 30, cd: 5, knockback: 4, dash: 10 },
    },
    firstCd: { claw: 0.5, slam: 1.5, bite: 2 },
  },
};

export class BloodZombie extends Marionette {
  configFor(o) { return BLOOD_ZOMBIE[o.strong ? 'strong' : 'weak']; }
  buildModel(o) {
    this.strong = !!o.strong;
    this.isMarionette = false;
    return buildBloodZombie(this.strong);
  }

  // agachado: a altura do quadril depende do quanto as pernas dobram (pés no chão)
  restY() {
    const J = this.model.joints;
    if (!J.zombie) return 0.1;
    const C = this.cfg.crouch;
    const [th, sh] = this.cfg.leg;
    return th * Math.cos(C.hip) + sh * Math.cos(C.hip + C.knee) - th - sh;
  }

  bob() { return Math.sin(this.t * 3) * 0.02; }

  // sobe rastejando da poça de sangue: primeiro as garras, depois o corpo
  riseTime() { return this.strong ? 1.1 : 0.8; }
  risePose(k, restY) {
    const root = this.model.root;
    const e = 1 - (1 - k) * (1 - k);
    root.position.set(this.pos.x, -2.4 * (1 - e) + restY * e, this.pos.z);
    root.scale.setScalar(1);
    this.model.joints.body.rotation.x = (1 - e) * 0.9;
    if (Math.random() < 0.4) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.15, this.pos.z), { count: 4, color: 0x9a0010, speed: 1.6, up: 2.5, life: 0.5, size: 0.16, gravity: 8 });
  }

  // morreu: desmancha numa poça de sangue; acabou o tempo: afunda de volta
  vanishPose(k, restY) {
    const root = this.model.root;
    if (this.state !== 'die') return super.vanishPose(k, restY);
    root.position.y = restY * (1 - k);
    root.scale.set(1 + k * 0.5, Math.max(0.05, 1 - k * 0.95), 1 + k * 0.5);
    if (!this.melted) {
      this.melted = true;
      addBloodPool(this.world, this.owner, this.pos.x, this.pos.z, { radius: this.strong ? 1.6 : 1.1, life: 6 });
    }
    if (Math.random() < 0.5) this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.3 + (1 - k) * this.height * 0.5, this.pos.z), { count: 5, color: 0xa01018, speed: 2, up: 1, life: 0.5, size: 0.18, gravity: 9 });
  }

  // leal: sempre ataca o adversário do dono
  chooseTarget() {
    this.target = this.owner.opponent;
  }

  pickAttack(d) {
    const c = this.cds;
    const A = this.cfg.attacks;
    if (A.slam && d < 2.3 && c.slam <= 0 && Math.random() < 0.4) return 'slam';
    if (d < A.claw.range - 0.2 && c.claw <= 0) return 'claw';
    if (d > 2.5 && d < 7 && c.bite <= 0) return 'bite';
    return null;
  }

  attackSound(name) { return name === 'claw' ? 'swing' : 'bloodClaw'; }

  stepSpeed(d) { return this.cfg.speed * (d > 6 ? 1.25 : 1); }

  swingFx(a) {
    if (a.name === 'bite') return;
    this.world.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + this.height * 0.5, this.pos.z), this.yaw, { color: 0xd02030, radius: a.range, arc: 2.4, life: 0.22, width: 0.3, roll: a.name === 'slam' ? 1.4 : -0.3 });
  }

  onDestroyed() {}

  pose() {
    const J = this.model.joints;
    this.model.root.rotation.y = this.yaw;
    if (!J.zombie) { this.poseLegacy(J); updateMarionetteStrings(this.model); this.updateFlash(); return; }
    const t = this.t;
    const C = this.cfg.crouch;
    const ph = this.gait * (this.strong ? 2.6 : 3.4); // passada segue a distância andada
    const walk = this.state === 'chase' ? 1 : 0;
    const s1 = Math.sin(ph);
    let chest = C.chest + Math.sin(t * 3) * 0.03;
    let neck = C.neck;
    let jaw = 0.15 + Math.sin(t * 2.2) * 0.08;
    // braços: pendurados à frente (o forte apoia no chão), balançando ao contrário das pernas
    const armBase = -chest - (this.strong ? 0.45 : 0.25);
    let la = [armBase - s1 * 0.4 * walk, 0, 0.25], ra = [armBase + s1 * 0.4 * walk, 0, -0.25];
    let le = this.strong ? -0.55 : -0.35, re = le;
    let twist = 0;
    const a = this.atk;
    if (a && this.state === 'attack') {
      const st = this.stateT;
      const k = Math.min(1, st / a.windup);
      const after = st > a.windup;
      const rec = after ? Math.min(1, (st - a.windup) / (a.active + 0.15)) : 0;
      if (a.name === 'claw') { // garrada com o braço direito, de cima para baixo na diagonal
        ra = after ? [armBase - 0.3 + rec * 0.6, 0, -0.6] : [armBase - 2.0 * k, 0, -0.6 * k - 0.25];
        re = after ? -0.15 : -1.2 * k;
        twist = after ? -0.45 : 0.35 * k;
        jaw = 0.5;
      } else if (a.name === 'slam') { // ergue os dois braços e martela o chão
        chest = after ? chest + 0.2 : chest - 0.55 * k;
        // ângulo no mundo: −2,7 = acima da cabeça, um pouco à frente (desconta a inclinação do tronco)
        const up = after ? armBase - 0.2 : armBase + (-2.7 - chest - armBase) * k;
        la = [up, 0, 0.3]; ra = [up, 0, -0.3];
        le = re = after ? -0.1 : -0.6 * k;
        jaw = 0.7;
      } else if (a.name === 'bite') { // investida de boca aberta e fecha
        chest += 0.15;
        neck = C.neck - 0.25;
        la = [armBase - 0.9, 0, 0.5]; ra = [armBase - 0.9, 0, -0.5];
        jaw = after && st > a.windup + a.active * 0.6 ? 0.05 : 0.9 * k;
      }
    }
    J.chest.rotation.set(chest, twist, Math.sin(t * 1.6) * 0.04);
    // pernas (filhas do tronco: desconta a inclinação dele): agachadas, passos alternados
    for (const [i, l] of J.legs.entries()) {
      const s = i ? -s1 : s1;
      l.hip.rotation.set(C.hip - chest + s * 0.45 * walk, 0, (i ? -1 : 1) * 0.08);
      l.knee.rotation.x = C.knee + Math.max(0, -s) * 0.5 * walk;
    }
    J.neck.rotation.set(neck - (chest - C.chest) * 0.6 + Math.sin(t * 4.1) * 0.05, Math.sin(t * 1.3) * 0.12, 0);
    if (J.jaw) J.jaw.rotation.x = jaw;
    J.armL.sh.rotation.set(la[0], la[1], la[2]);
    J.armR.sh.rotation.set(ra[0], ra[1], ra[2]);
    J.armL.el.rotation.x = le;
    J.armR.el.rotation.x = re;
    this.updateFlash();
  }
}
