import * as THREE from 'three';
import { Effects } from '../fx/Effects.js';
import { CameraRig } from '../camera/CameraRig.js';
import { Projectiles } from '../combat/projectiles.js';
import { Fighter } from '../combat/Fighter.js';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';
import { ARENAS } from '../arena/index.js';
import { yawTo } from '../core/util.js';

const RAY = new THREE.Raycaster();

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

  // Vencedores em fila, de frente para a câmera, onde a luta terminou. A câmera procura uma direção com visão livre
  // (sem parede no caminho, dentro do cenário), de preferência olhando para o meio da arena — antes ficava fixa no
  // ponto (0, 0) e, no Bar Suvaco Seco, mostrava a fachada por fora em vez dos vencedores.
  layoutVictoryLineup() {
    if (!this.victoryActors) return;
    const count = this.victoryActors.length;
    const narrow = innerWidth / innerHeight < 0.85;
    const winner = this.fighters.find((f) => f.def.id === this.victoryActors[0].def.id || (f.baseForm && f.baseForm.def.id === this.victoryActors[0].def.id)) || this.fighters[0];
    const center = new THREE.Vector3(winner.pos.x, 0, winner.pos.z);
    const spots = this.arena.spawns || [];
    const mid = spots.length ? spots.reduce((v, p) => v.add(new THREE.Vector3(p.x, 0, p.z)), new THREE.Vector3()).multiplyScalar(1 / spots.length) : new THREE.Vector3();
    const inward = mid.clone().sub(center);
    const baseYaw = inward.lengthSq() > 0.25 ? Math.atan2(inward.x, inward.z) : 0;
    const q = new THREE.Vector3();
    const clear = (from, to) => {
      for (let k = 1; k <= 24; k++) {
        q.lerpVectors(from, to, k / 24);
        if (this.arena.blocksPoint(q, 0.25)) return false;
      }
      return true;
    };
    const want = narrow ? 10 : 7.5;
    // espaço entre os vencedores: cabe na largura visível (o vencedor no meio, a equipe dos lados)
    const halfW = (dist) => Math.tan(((40 / 2) * Math.PI) / 180) * dist * (innerWidth / innerHeight);
    const spacingFor = (dist) => (count < 2 ? 0 : Math.min(2.35, (halfW(dist) - 0.8) / Math.floor(count / 2)));
    const slot = (i) => (i === 0 ? 0 : i % 2 ? -Math.ceil(i / 2) : Math.ceil(i / 2)); // 0, -1, +1, -2...
    let best = null;
    for (const dist of [want, want * 0.8, 5.5, 4.2]) {
      for (let i = 0; i < 16 && !best; i++) {
        // alterna para os dois lados a partir da direção que olha para o meio da arena
        const yaw = baseYaw + Math.PI + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (Math.PI / 8);
        const cam = new THREE.Vector3(center.x + Math.sin(yaw) * dist, 3.1, center.z + Math.cos(yaw) * dist);
        if (!clear(new THREE.Vector3(center.x, 1.4, center.z), cam)) continue;
        const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
        const spacing = spacingFor(dist);
        const ends = [-1, 1].map((sgn) => center.clone().addScaledVector(right, sgn * Math.floor(count / 2) * spacing).setY(1));
        if (ends.some((e) => this.arena.blocksPoint(e, 0.3))) continue;
        // blocos grandes do cenário (cemitério, cidade) entre a câmera e algum vencedor: tenta outra direção
        const solids = this.arena.solids || [];
        if (solids.length && [0, ...[-1, 1].map((x) => x * Math.floor(count / 2))].some((k) => {
          const target = center.clone().addScaledVector(right, k * spacing);
          return [0.4, 1.2, 1.9].some((h) => {
            const to = target.clone().setY(h).sub(cam);
            const len = to.length();
            RAY.set(cam, to.divideScalar(len));
            RAY.far = len - 0.3;
            return RAY.intersectObjects(solids, false).length > 0;
          });
        })) continue;
        best = { yaw, dist, cam, right, spacing };
      }
      if (best) break;
    }
    if (!best) {
      const yaw = baseYaw + Math.PI;
      best = { yaw, dist: 4.2, spacing: spacingFor(4.2), cam: new THREE.Vector3(center.x + Math.sin(yaw) * 4.2, 3.1, center.z + Math.cos(yaw) * 4.2), right: new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)) };
    }
    for (const actor of this.victoryActors) {
      const { rig, index } = actor;
      rig.root.position.copy(center).addScaledVector(best.right, slot(index) * best.spacing);
      rig.root.rotation.y = best.yaw; // de frente para a câmera
      rig.groundLock = true;
    }
    const look = center.clone().setY(1);
    this.camera.fov = 40;
    this.camera.position.copy(best.cam);
    this.camera.lookAt(look);
    this.camera.updateProjectionMatrix();
    this.cameraRig.pos.copy(this.camera.position);
    this.cameraRig.look.copy(look);
    // movimento cinematográfico (updateVictoryCam): começa mais longe e alto, aproxima até este enquadramento e fica
    // balançando de leve em volta dos vencedores (pouco, para não perder a visão livre que foi escolhida)
    const off = best.cam.clone().sub(center);
    this.victoryCam = { center: center.clone(), look: look.clone(), yaw: Math.atan2(off.x, off.z), dist: Math.hypot(off.x, off.z), h: best.cam.y, t: 0 };
    // o que ainda ficar entre a câmera e os vencedores fica transparente
    this.cameraRig.updateOcclusion(this.victoryActors.map((x) => ({ visible: true, def: x.def, chestPos: (v) => (v || new THREE.Vector3()).copy(x.rig.root.position).setY(1.2) })), 1 / 60, true);
  }

  updateVictoryCam(dt) {
    const v = this.victoryCam;
    if (!v) return;
    v.t += dt;
    const k = Math.min(1, v.t / 1.6);
    const e = 1 - (1 - k) * (1 - k) * (1 - k); // desacelera no fim
    const dist = v.dist * (1.35 - 0.35 * e);
    const yaw = v.yaw + Math.sin(v.t * 0.25) * 0.07 * e;
    this.camera.position.set(v.center.x + Math.sin(yaw) * dist, v.h + 0.9 * (1 - e) + Math.sin(v.t * 0.4) * 0.05, v.center.z + Math.cos(yaw) * dist);
    this.camera.lookAt(v.look);
    this.cameraRig.pos.copy(this.camera.position);
    this.cameraRig.look.copy(v.look);
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
    this.roundNo = (this.roundNo || 0) + 1; // a IA que aprende fecha o round quando muda
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
      this.updateVictoryCam(dt);
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
