import * as THREE from 'three';
import { Effects } from '../fx/Effects.js';
import { CameraRig } from '../camera/CameraRig.js';
import { Projectiles } from '../combat/projectiles.js';
import { Fighter } from '../combat/Fighter.js';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';
import { ARENAS } from '../arena/index.js';
import { yawTo } from '../core/util.js';

// Tudo que existe dentro de uma luta: cena, arena, lutadores, projéteis,
// efeitos, câmera, cinematics e congelamento de impacto (hitstop).
export class World {
  constructor({ renderer, audio, input, ui }) {
    this.renderer = renderer;
    this.audio = audio;
    this.input = input;
    this.ui = ui;
    this.scene = new THREE.Scene();
    // near maior: objetos colados na câmera (mesas, cadeiras) não tapam a luta
    this.camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.7, 300);
    this.fx = new Effects(this.scene);
    this.cameraRig = new CameraRig(this.camera, this);
    this.cameraBasis = this.cameraRig.basis;
    this.projectiles = new Projectiles(this);
    this.fighters = [];
    this.zones = []; // áreas paranormais (ex.: névoa da Kaiser)
    this.timers = []; // ações agendadas em tempo de jogo
    this.tickers = []; // { update(dt)→done, dispose() } — efeitos com lógica própria (ex.: tentáculos)
    this.npcs = []; // clones do Trinitá, a Marionete (ver combat/npcs.js)
    this.cinematic = null;
    this.victoryActors = null;
    this.hitstopTime = 0;
    this.inputTime = 0;
    this.time = 0;
  }

  setup(defs, arenaId) {
    const A = ARENAS[arenaId];
    this.arena = A.create();
    this.arena.build(this.scene);
    this.fighters = defs.map((def, i) => new Fighter(def, i, this, this.input.players[i]));
    this.placeFighters();
    this.cameraRig.snap(this.fighters);
  }

  placeFighters() {
    const [a, b] = this.fighters;
    const s = this.arena.spawns;
    a.pos.set(s[0].x, 0, s[0].z);
    b.pos.set(s[1].x, 0, s[1].z);
    a.yaw = yawTo(a.pos, b.pos);
    b.yaw = yawTo(b.pos, a.pos);
    for (const f of this.fighters) {
      f.updateVisuals(0);
    }
    // câmera do lado em que o P1 fica à esquerda da tela (como na HUD)
    const ax = b.pos.x - a.pos.x;
    const az = b.pos.z - a.pos.z;
    const len = Math.hypot(ax, az) || 1;
    this.cameraRig.pos.set((a.pos.x + b.pos.x) / 2 - (az / len) * 10, 5, (a.pos.z + b.pos.z) / 2 + (ax / len) * 10);
  }

  // ------------------------------------------------ zonas
  // z: { owner, center()→Vector3, radius, slow, enemyRegen, projectileSlow, eatsProjectiles, alive }
  addZone(z) {
    z.alive = true;
    this.zones.push(z);
    return z;
  }

  inZone(z, p) {
    const c = z.center();
    return Math.hypot(p.x - c.x, p.z - c.z) <= z.radius;
  }

  addTicker(t) {
    this.tickers.push(t);
    return t;
  }

  addNpc(n) {
    this.npcs.push(n);
    return n;
  }

  clearNpcs() {
    for (const n of this.npcs) n.dispose();
    this.npcs.length = 0;
  }

  showVictoryLineup(defs) {
    this.clearTickers();
    this.clearNpcs();
    this.projectiles.clear();
    this.fx.clear();
    for (const fighter of this.fighters) {
      if (fighter.riding) fighter.mount(false);
      fighter.rig.root.visible = false;
      for (const assist of fighter.assists || []) assist.reset();
    }

    this.victoryActors = defs.map((def, index) => {
      const rig = buildModel(def.model);
      const anim = new Animator(rig, def.anims);
      const actor = { def, rig, anim, index };
      this.scene.add(rig.root);
      anim.play('victory', { blend: 0 });
      return actor;
    });
    this.layoutVictoryLineup();
  }

  layoutVictoryLineup() {
    if (!this.victoryActors) return;
    const count = this.victoryActors.length;
    const spacing = innerWidth / innerHeight < 0.85 ? 1.35 : 2.35;
    for (const actor of this.victoryActors) {
      const { rig, index } = actor;
      rig.root.position.set((index - (count - 1) / 2) * spacing, 0, 0);
      rig.root.rotation.y = 0;
      rig.groundLock = true;
    }

    const distance = innerWidth / innerHeight < 0.85 ? 10 : 7.5;
    this.camera.fov = 40;
    this.camera.position.set(0, 3.1, distance);
    this.camera.lookAt(0, 1, 0);
    this.camera.updateProjectionMatrix();
    this.cameraRig.pos.copy(this.camera.position);
    this.cameraRig.look.set(0, 1, 0);
  }

  // NPCs inimigos de um lutador (os que não são dele)
  hostileNpcs(f) {
    return this.npcs.filter((n) => n.alive && n.owner !== f);
  }

  clearTickers() {
    for (const t of this.tickers) t.dispose && t.dispose();
    this.tickers.length = 0;
  }

  // Executa fn depois de t segundos de jogo (respeita pausa)
  after(t, fn) {
    this.timers.push({ t, fn });
  }

  tickTimers(dt) {
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const tm = this.timers[i];
      tm.t -= dt;
      if (tm.t <= 0) {
        this.timers.splice(i, 1);
        tm.fn();
      }
    }
  }

  speedFactor(f) {
    let k = 1;
    for (const z of this.zones) if (z.owner !== f && z.slow && this.inZone(z, f.pos)) k *= 1 - z.slow;
    return k;
  }

  energyRegenFactor(f) {
    let k = 1;
    for (const z of this.zones) if (z.owner !== f && z.enemyRegen !== undefined && this.inZone(z, f.pos)) k *= z.enemyRegen;
    return k;
  }

  resetRound() {
    this.clearTickers();
    this.clearNpcs();
    for (const f of this.fighters || []) if (f.assists) for (const a of f.assists) a.reset();
    this.zones.length = 0;
    this.timers.length = 0;
    this.endCinematic();
    this.projectiles.clear();
    this.fx.clear();
    for (const f of this.fighters) f.reset();
    this.placeFighters();
    this.cameraRig.snap(this.fighters);
  }

  opponentOf(f) {
    return this.fighters[0] === f ? this.fighters[1] : this.fighters[0];
  }

  // ------------------------------------------------ cinematics
  beginCinematic(actor, target) {
    this.cinematic = { actor, target };
    if (target) {
      target.cancelAction();
      target.prevState = target.state;
      target.setState('grabbed');
      target.vel.set(0, 0, 0);
    }
    this.ui && this.ui.setCinematic(true);
  }

  endCinematic() {
    if (!this.cinematic) return;
    const { target } = this.cinematic;
    if (target && target.state === 'grabbed') target.setState('idle');
    this.cinematic = null;
    this.cameraRig.stopShots();
    this.ui && this.ui.setCinematic(false);
  }

  showBanner(name, color) {
    this.audio.play('banner');
    this.ui && this.ui.banner(name, color);
  }

  screenFlash(color, time) {
    this.ui && this.ui.flash(color, time);
  }

  hitstop(t) {
    this.hitstopTime = Math.max(this.hitstopTime, t);
  }

  // ------------------------------------------------ loop
  update(dt, { simulate = true } = {}) {
    this.time += dt;
    this.inputTime = this.input.time;
    this.arena.update(dt);

    if (this.victoryActors) {
      for (const actor of this.victoryActors) actor.anim.update(dt);
      this.fx.update(dt);
      return;
    }

    if (this.hitstopTime > 0) {
      this.hitstopTime -= dt;
      // botões apertados durante a pausa de impacto não se perdem
      for (const f of this.fighters) f.captureInputs();
      this.fx.update(dt * 0.15);
      this.cameraRig.update(dt, this.fighters);
      return;
    }

    if (this.cinematic) {
      // mundo congelado: só quem está no especial se mexe
      const { actor, target } = this.cinematic;
      actor.update(dt);
      for (const f of this.fighters) if (f !== actor) f.updatePresentation(dt);
      void target;
    } else if (simulate) {
      this.tickTimers(dt);
      if (this.victoryActors) {
        for (const actor of this.victoryActors) actor.anim.update(dt);
        this.fx.update(dt);
        return;
      }
      for (let i = this.tickers.length - 1; i >= 0; i--) {
        const tk = this.tickers[i];
        if (tk.update(dt)) { tk.dispose && tk.dispose(); this.tickers.splice(i, 1); }
      }
      for (let i = this.zones.length - 1; i >= 0; i--) if (!this.zones[i].alive) this.zones.splice(i, 1);
      for (const f of this.fighters) f.update(dt);
      for (const f of this.fighters) if (f.assists) for (const a of f.assists) a.update(dt);
      for (const n of this.npcs) n.update(dt);
      for (let i = this.npcs.length - 1; i >= 0; i--) if (!this.npcs[i].alive) this.npcs.splice(i, 1);
      this.separate();
      this.projectiles.update(dt);
    } else {
      for (const f of this.fighters) f.updatePresentation(dt);
    }
    this.fx.update(dt);
    this.cameraRig.update(dt, this.fighters);
  }

  // corpos não se sobrepõem
  separate() {
    const [a, b] = this.fighters;
    if (!a.visible || !b.visible) return;
    const dx = b.pos.x - a.pos.x;
    const dz = b.pos.z - a.pos.z;
    const d = Math.hypot(dx, dz);
    const min = a.radius + b.radius;
    if (d < min && d > 1e-4 && Math.abs(a.pos.y - b.pos.y) < 1.5) {
      const push = (min - d) / 2;
      a.pos.x -= (dx / d) * push;
      a.pos.z -= (dz / d) * push;
      b.pos.x += (dx / d) * push;
      b.pos.z += (dz / d) * push;
    }
  }

  dispose() {
    this.clearTickers();
    this.clearNpcs();
    for (const f of this.fighters || []) if (f.assists) for (const a of f.assists) a.reset();
    this.endCinematic();
    this.audio.stopAllLoops();
    this.projectiles.clear();
    this.fx.clear();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
