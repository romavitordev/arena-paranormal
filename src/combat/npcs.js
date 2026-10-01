import * as THREE from 'three';
import { yawTo, distXZ, angleDiff, forwardFromYaw, DEG } from '../core/util.js';
import { applyHit } from './damage.js';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';
import { buildMarionette, updateMarionetteStrings } from '../models/marionette.js';
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
// NPC autônomo: aparece do Lodo, persegue e ataca o adversário do Dante por um tempo limitado.
// Autônoma e instável: a cada troca de alvo pode se voltar contra o próprio Dante — bem mais provável
// quanto mais perto ele estiver dela (e se ele estiver mais perto que o adversário).
export const MARIONETTE = {
  hp: 350,
  duration: 20,
  speed: 5.2,
  attacks: {
    quick: { windup: 0.24, active: 0.12, recovery: 0.4, range: 2.6, arc: 150, damage: 26, cd: 1.1, knockback: 2.5 },
    heavy: { windup: 0.6, active: 0.14, recovery: 0.65, range: 2.5, arc: 110, damage: 52, cd: 3.5, knockback: 4, knockdown: true },
    lunge: { windup: 0.32, active: 0.18, recovery: 0.5, range: 1.8, arc: 120, damage: 34, cd: 4.5, knockback: 5, dash: 12 },
    special: { windup: 0.75, active: 0.2, recovery: 0.75, range: 3.4, arc: 360, damage: 40, cd: 9, knockback: 3, stun: 0.9 },
  },
  // chance (por sorteio, a cada 2 s) de atacar o Dante: base + bônus de proximidade
  betray: { base: 0.08, near: 0.22, nearDist: 6, closer: 0.15, oppFar: 0.12, oppFarDist: 10 },
};

export class Marionette {
  constructor(owner, world, pos, { duration = MARIONETTE.duration, hp = MARIONETTE.hp } = {}) {
    this.owner = owner;
    this.world = world;
    this.isMarionette = true;
    this.showBar = true;
    this.name = 'A MARIONETE';
    this.radius = 0.6;
    this.height = 2.6;
    this.hp = hp;
    this.maxHp = hp;
    this.alive = true;
    this.life = duration;
    this.t = 0;
    this.pos = pos.clone();
    this.yaw = owner.yaw;
    this.state = 'rise';
    this.stateT = 0;
    this.cds = { quick: 0.5, heavy: 1.5, lunge: 1.5, special: 4 };
    this.target = owner.opponent;
    this.retarget = 2;
    this.flash = 0;
    this.model = buildMarionette();
    world.scene.add(this.model.root);
    this.pool = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), new THREE.MeshBasicMaterial({ color: 0x050406, transparent: true, opacity: 0.85 }));
    this.pool.rotation.x = -Math.PI / 2;
    this.pool.position.set(pos.x, 0.03, pos.z);
    world.scene.add(this.pool);
    this.model.root.position.copy(this.pos);
    this.model.root.position.y = -3;
  }

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
    if (this.owner.state !== 'ko' && Math.random() < chance) {
      if (this.target !== this.owner) this.owner.notify('A MARIONETE SE VOLTOU CONTRA VOCÊ!', true);
      this.target = this.owner;
      this.retarget = 5; // persegue o Dante até golpear (ou por até 5 s)
    } else this.target = opp;
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
    if (this.state !== 'leave' && this.state !== 'die' && (this.t >= this.life || this.owner.state === 'ko')) { this.setState('leave'); w.audio.play('drain'); }

    // ---- surgir / ir embora (afunda no lodo)
    if (this.state === 'rise') {
      const k = Math.min(1, this.stateT / 0.9);
      root.position.set(this.pos.x, -3 + k * 3.25, this.pos.z);
      J.body.rotation.x = (1 - k) * 0.6;
      if (Math.random() < 0.5) w.fx.burst(new THREE.Vector3(this.pos.x, 0.2, this.pos.z), { count: 3, color: 0x050406, kind: 'smoke', speed: 1.5, up: 1.2, life: 0.6, size: 0.6 });
      if (k >= 1) this.setState('chase');
      this.pose(dt);
      return;
    }
    if (this.state === 'leave' || this.state === 'die') {
      const k = Math.min(1, this.stateT / 0.9);
      root.position.y = 0.25 - k * 3.3;
      J.body.rotation.x = k * 0.5;
      this.pool.material.opacity = 0.85 * (1 - k);
      if (k >= 1) this.dispose();
      this.pose(dt);
      return;
    }
    // ---- IA: procura, aproxima, escolhe ataque, executa, reposiciona
    this.retarget -= dt;
    // troca de alvo só fora de um ataque (senão o golpe já mirado no outro erra e a "traição" se perde)
    if (this.state !== 'attack' && (this.retarget <= 0 || !this.target || this.target.state === 'ko')) { this.retarget = 2; this.chooseTarget(); }
    const tg = this.target;
    if (!tg) return;
    const d = distXZ(this.pos, tg.pos);
    const face = yawTo(this.pos, tg.pos);
    if (this.state === 'chase') {
      this.yaw = face;
      // escolhe o ataque pela distância
      const A = MARIONETTE.attacks;
      let pick = null;
      if (d < 3.4 && this.cds.special <= 0 && Math.random() < 0.25) pick = 'special';
      else if (d < 2.4 && this.cds.heavy <= 0 && Math.random() < 0.35) pick = 'heavy';
      else if (d < 2.6 && this.cds.quick <= 0) pick = 'quick';
      else if (d > 4 && d < 10 && this.cds.lunge <= 0) pick = 'lunge';
      if (pick && tg.state !== 'downed') {
        this.atk = { name: pick, ...A[pick], hit: false, vsOwner: tg === this.owner };
        this.setState('attack');
        w.audio.play(pick === 'special' ? 'fearGaze' : 'swing', { volume: 0.7 });
      } else if (d > 1.6) {
        // anda flutuando em direção ao alvo, contornando um pouco
        const sp = MARIONETTE.speed * (d > 6 ? 1.3 : 1);
        this.pos.x += Math.sin(face + 0.25) * sp * dt;
        this.pos.z += Math.cos(face + 0.25) * sp * dt;
      }
    } else if (this.state === 'attack') {
      const a = this.atk;
      const t = this.stateT;
      if (t < a.windup) this.yaw = face;
      if (a.dash && t >= a.windup && t < a.windup + a.active + 0.1 && d > 1.4) {
        this.pos.x += Math.sin(this.yaw) * a.dash * dt;
        this.pos.z += Math.cos(this.yaw) * a.dash * dt;
      }
      if (!a.hit && t >= a.windup && t <= a.windup + a.active) {
        const inArc = a.arc >= 360 || Math.abs(angleDiff(this.yaw, yawTo(this.pos, tg.pos))) <= (a.arc * DEG) / 2;
        if (d - tg.radius <= a.range && inArc && Math.abs(tg.pos.y - this.pos.y) < 2.2) {
          a.hit = true;
          const res = applyHit(w, this.owner, tg, {
            damage: a.damage, kind: 'ability', element: 'morte', knockback: a.knockback, launch: !!a.knockdown, lowLaunch: !!a.knockdown,
            stun: a.stun, dir: forwardFromYaw(this.yaw, new THREE.Vector3()), sound: a.name === 'heavy' ? 'heavyPunch' : 'bladeHit', color: 0x8ad8c0, scale: a.name === 'heavy' ? 1.8 : 1.2,
          });
          if (typeof res === 'number' && a.stun && tg.state !== 'ko') tg.stun(a.stun, 'fear');
          if (a.name === 'special') w.fx.ring(new THREE.Vector3(this.pos.x, 0.06, this.pos.z), { color: 0x8ad8c0, radius: a.range, life: 0.4 });
        }
        if (a.name === 'quick' || a.name === 'heavy') w.fx.slash(new THREE.Vector3(this.pos.x, this.pos.y + 1.4, this.pos.z), this.yaw, { color: 0xbfe8dc, radius: a.range, arc: a.name === 'heavy' ? 2.2 : 2.8, life: 0.25, width: 0.35, roll: a.name === 'heavy' ? 1.4 : 0.2 });
      }
      if (t >= a.windup + a.active + a.recovery) {
        this.cds[a.name] = a.cd;
        this.atk = null;
        this.setState('chase');
        if (a.vsOwner) { this.target = this.owner.opponent; this.retarget = 2; } // só um golpe "traidor"
      }
    }
    resolveBody(w.arena, this.pos, this.radius);
    root.position.set(this.pos.x, 0.25 + Math.sin(this.t * 2.2) * 0.12, this.pos.z);
    this.pose(dt);
  }

  // animação procedural das juntas
  pose() {
    const J = this.model.joints;
    const t = this.t;
    const root = this.model.root;
    root.rotation.y = this.yaw;
    const sway = Math.sin(t * 1.7);
    J.chest.rotation.z = sway * 0.08;
    J.neck.rotation.x = 0.55 + Math.sin(t * 1.3) * 0.08;
    J.hair.rotation.x = -0.2 + Math.sin(t * 2.4) * 0.1;
    for (const [i, l] of J.legs.entries()) { l.hip.rotation.x = Math.sin(t * 1.9 + i) * 0.25; l.knee.rotation.x = 0.3 + Math.sin(t * 2.3 + i) * 0.2; }
    // braços: repouso pendurados abertos; no ataque, movimentos próprios
    let lx = -0.2 + sway * 0.1, lz = 0.5, rx = -0.3 - sway * 0.1, rz = -0.55, ex = -0.4;
    const a = this.atk;
    if (this.state === 'attack' && a) {
      const k = Math.min(1, this.stateT / a.windup);
      const after = this.stateT > a.windup;
      if (a.name === 'quick') { rx = after ? -1.6 : -0.6 - k * 1.4; rz = after ? 0.6 : -1.6 * k - 0.4; }
      if (a.name === 'heavy') { rx = after ? -0.4 : -2.9 * k; lx = after ? -0.4 : -2.9 * k; ex = after ? -0.1 : -0.8; }
      if (a.name === 'lunge') { rx = -1.5; lx = -1.5; ex = -0.1; }
      if (a.name === 'special') { const s = this.stateT * 14; lz = 1.4 + Math.sin(s) * 0.4; rz = -1.4 - Math.sin(s) * 0.4; lx = -1.2; rx = -1.2; J.chest.rotation.y = after ? this.stateT * 12 : 0; }
    } else J.chest.rotation.y = 0;
    J.armL.sh.rotation.set(lx, 0, lz);
    J.armR.sh.rotation.set(rx, 0, rz);
    J.armL.el.rotation.x = ex;
    J.armR.el.rotation.x = ex;
    updateMarionetteStrings(this.model);
    // pisca branco ao tomar dano
    const fl = this.flash > 0;
    if (fl !== this._fl) {
      this._fl = fl;
      this.model.root.traverse((o) => { if (o.isMesh && o.material && o.material.emissive && !o.userData.isOutline) o.material.emissive.setHex(fl ? 0x666666 : 0x000000); });
    }
  }

  hitTest(p, r) { return this.alive && this.state !== 'rise' && this.state !== 'leave' && this.state !== 'die' && hitTestNpc(this, p, r); }

  hitBy(attacker, dmg) {
    if (!this.alive || this.state === 'die' || this.state === 'leave') return;
    this.hp -= dmg;
    this.flash = 0.1;
    this.world.fx.impact(new THREE.Vector3(this.pos.x, this.pos.y + 1.5, this.pos.z), 0x8ad8c0, 1);
    this.world.audio.play('punch', { volume: 0.6 });
    if (this.hp <= 0) {
      this.hp = 0;
      this.setState('die');
      this.world.audio.play('ko', { volume: 0.6 });
      this.world.fx.burst(new THREE.Vector3(this.pos.x, 1.4, this.pos.z), { count: 50, color: 0x050406, kind: 'smoke', speed: 3, life: 1, size: 0.9 });
      attacker && attacker.notify && attacker.notify('MARIONETE DESTRUÍDA!', true);
    }
  }

  dispose() {
    if (!this.alive && !this.model.root.parent) return;
    this.alive = false;
    this.world.scene.remove(this.model.root);
    this.world.scene.remove(this.pool);
    this.pool.geometry.dispose();
    this.pool.material.dispose();
    // a Marionete é toda dela: libera geometrias e materiais (para de consumir memória e GPU)
    this.model.root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material && !o.userData.isOutline) o.material.dispose();
    });
  }
}
