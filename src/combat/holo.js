import * as THREE from 'three';
import { buildModel } from '../models/index.js';

// CÓPIAS ILUSÓRIAS (Guizo — Embaralhar, Velocidade Mortal e o Registro do Outro Lado): o mesmo modelo, translúcido e
// tingido, que COPIA A POSE do dono quadro a quadro (cada osso e cada peça), então as cópias fazem exatamente o que ele
// faz — "imitam suas ações" (wiki). Não são lutadores: não apanham, não atacam e a CPU não as persegue.
//   mode 'mimic'   segue o dono num deslocamento fixo (no referencial dele) e copia a pose a cada quadro
//   mode 'anchor'  fica num ponto fixo do mundo (ex.: em volta do alvo no especial) e copia a pose do dono
//   mode 'ghost'   congela a pose no instante em que é criada e some aos poucos (rastro da Velocidade Mortal)
const tmpV = new THREE.Vector3();

function bonesOf(root) {
  const map = {};
  root.traverse((o) => { if (o.isBone) map[o.name] = o; });
  return map;
}

export class HoloCopy {
  constructor(owner, world, { mode = 'mimic', offset = null, pos = null, yaw = null, life = 6, color = 0xd8c070, opacity = 0.5, fadeIn = 0.2, fadeOut = 0.3 } = {}) {
    this.owner = owner;
    this.world = world;
    this.mode = mode;
    this.offset = offset ? offset.clone() : new THREE.Vector3();
    this.pos = pos ? pos.clone() : owner.pos.clone();
    this.yaw = yaw ?? owner.yaw;
    this.life = life;
    this.t = 0;
    this.fadeIn = fadeIn;
    this.fadeOut = fadeOut;
    this.alive = true;
    this.illusion = true; // não é alvo (hostileNpcs a filtra pela ausência de isClone/maxHp)
    this.radius = 0.4;
    this.rig = buildModel(owner.def.model);
    this.mats = [];
    this.baseOpacity = opacity;
    this.rig.root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const m = o.material.clone();
      m.transparent = true;
      m.depthWrite = false;
      m.opacity = 0;
      if (!o.userData.isOutline) {
        if (m.color) m.color.lerp(new THREE.Color(color), 0.72).multiplyScalar(0.85);
        if (m.emissive) { m.emissive.set(color); m.emissiveIntensity = 0.18; }
      }
      o.material = m;
      o.castShadow = false;
      this.mats.push({ m, outline: !!o.userData.isOutline });
    });
    // pares de ossos pelo NOME e peças pela chave (a câmera muda de mão para o quadril: a ordem dos nós muda)
    const sb = bonesOf(owner.rig.root);
    const db = bonesOf(this.rig.root);
    this.pairs = Object.keys(sb).filter((k) => db[k]).map((k) => [sb[k], db[k]]);
    this.copyPose();
    world.scene.add(this.rig.root);
    this.flicker = Math.random() * 10;
  }

  // copia a pose do dono: transformações locais de todos os nós (ossos e peças) e o que está visível
  copyPose() {
    for (const [a, b] of this.pairs) {
      b.position.copy(a.position);
      b.quaternion.copy(a.quaternion);
      b.scale.copy(a.scale);
    }
    const so = this.owner.rig;
    const d = this.rig;
    if (so.body && d.body) { d.body.position.copy(so.body.position); d.body.quaternion.copy(so.body.quaternion); }
    for (const key in so.props) {
      const a = so.props[key];
      const b = d.props[key];
      if (!a || !b) continue;
      b.visible = a.visible;
      // a peça mudou de encaixe no dono (ex.: a câmera foi para o quadril): leva junto
      const sock = Object.keys(so.sockets).find((k) => so.sockets[k] === a.parent);
      if (sock && d.sockets[sock] && b.parent !== d.sockets[sock]) d.sockets[sock].add(b);
      b.position.copy(a.position);
      b.quaternion.copy(a.quaternion);
      b.scale.copy(a.scale);
    }
  }

  setOpacity(k) {
    for (const { m, outline } of this.mats) m.opacity = (outline ? 0.15 : this.baseOpacity) * k;
  }

  // rastro reaproveitado (Velocidade Mortal): em vez de montar um modelo novo a cada rastro, o mesmo fantasma volta
  // num ponto novo com a pose do momento
  revive(pos, yaw, life) {
    this.pos.copy(pos);
    this.yaw = yaw;
    this.life = life;
    this.t = 0;
    this.sleeping = false;
    this.rig.root.visible = true;
    this.copyPose();
  }

  sleep() {
    this.sleeping = true;
    this.rig.root.visible = false;
  }

  update(dt) {
    if (!this.alive || this.sleeping) return;
    this.t += dt;
    const o = this.owner;
    if (this.t >= this.life || !o.rig || o.state === 'ko') { if (this.reusable && o.state !== 'ko') this.sleep(); else this.kill(); return; }
    if (this.mode === 'mimic') {
      // deslocamento no referencial do dono: x = lado, z = frente
      const c = Math.cos(o.yaw);
      const s = Math.sin(o.yaw);
      this.pos.set(o.pos.x + this.offset.x * c + this.offset.z * s, o.pos.y, o.pos.z - this.offset.x * s + this.offset.z * c);
      this.yaw = o.yaw;
    }
    if (this.mode !== 'ghost') this.copyPose();
    // aparece, tremeluz como holograma e some no fim
    this.flicker += dt * 22;
    const fin = Math.min(1, this.t / this.fadeIn);
    const fout = Math.min(1, (this.life - this.t) / this.fadeOut);
    const jitter = this.mode === 'ghost' ? 1 : 0.85 + 0.15 * Math.sin(this.flicker) * Math.sin(this.flicker * 0.37);
    this.setOpacity(Math.max(0, Math.min(fin, fout)) * jitter);
    this.rig.root.position.copy(this.pos);
    this.rig.root.rotation.y = this.yaw;
  }

  // a cópia se desfaz (acertada no lugar do verdadeiro, ou o ritual acabou)
  shatter(color = 0xd8c070) {
    if (!this.alive) return;
    const p = tmpV.set(this.pos.x, this.pos.y + 1.0, this.pos.z).clone();
    this.world.fx.burst(p, { count: 26, color, speed: 3.5, life: 0.45, size: 0.14 });
    this.world.fx.distort(p, { color, radius: 1.1, life: 0.25 });
    this.world.audio.play('blink', { volume: 0.5 });
    this.kill();
  }

  hitTest() { return false; }
  hitBy() {}

  kill() {
    if (!this.alive) return;
    this.alive = false;
    this.dispose();
  }

  dispose() {
    this.alive = false;
    this.world.scene.remove(this.rig.root);
    if (!this.freed) {
      this.freed = true;
      for (const { m } of this.mats) m.dispose();
    }
  }
}
