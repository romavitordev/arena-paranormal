import * as THREE from 'three';
import { FX_LIBRARY } from './library.js';

// Sistema de efeitos leve: dois pools de partículas (brilho aditivo e fumaça)
// + efeitos de malha descartáveis (cortes, anéis, traçantes, clarões).
// Tudo é reaproveitado para não pesar no desempenho.

const VERT = `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vAlpha = aAlpha;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform float uAlpha;
uniform float uSoft;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = pow(smoothstep(0.5, 0.0, d), uSoft) * vAlpha * uAlpha;
  gl_FragColor = vec4(vColor, a);
}`;

class ParticlePool {
  constructor(scene, max, blending, { alpha = 1, soft = 1 } = {}) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.size0 = new Float32Array(max);
    this.grow = new Float32Array(max);
    this.alpha = new Float32Array(max);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.drag = new Float32Array(max);
    this.cursor = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uAlpha: { value: alpha }, uSoft: { value: soft } },
      transparent: true,
      depthWrite: false,
      blending,
    });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
    this.points.renderOrder = 10;
    scene.add(this.points);
  }

  spawn(x, y, z, vx, vy, vz, color, size, life, grav = 0, drag = 0, grow = 0) {
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.max;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.col[i * 3] = color.r; this.col[i * 3 + 1] = color.g; this.col[i * 3 + 2] = color.b;
    this.size[i] = size; this.size0[i] = size; this.grow[i] = grow;
    this.life[i] = life; this.maxLife[i] = life;
    this.grav[i] = grav; this.drag[i] = drag;
    this.alpha[i] = 1;
  }

  update(dt) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.life[i] -= dt;
      const k = Math.max(0, this.life[i] / this.maxLife[i]);
      const dr = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[i * 3] *= dr; this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * dr - this.grav[i] * dt; this.vel[i * 3 + 2] *= dr;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.alpha[i] = Math.min(1, k * 1.6);
      this.size[i] = this.size0[i] * (1 + this.grow[i] * (1 - k));
    }
    const g = this.points.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.aColor.needsUpdate = true;
    g.attributes.aSize.needsUpdate = true;
    g.attributes.aAlpha.needsUpdate = true;
  }

  clear() {
    this.life.fill(0);
    this.alpha.fill(0);
  }
}

const tmpColor = new THREE.Color();

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.glow = new ParticlePool(scene, 2500, THREE.AdditiveBlending);
    // fumaça: mais translúcida e com borda bem suave, para parecer névoa
    this.smoke = new ParticlePool(scene, 2000, THREE.NormalBlending, { alpha: 0.42, soft: 1.8 });
    this.meshes = []; // {obj, life, maxLife, update}
    this.emitters = new Set();
    this.paused = false;
  }

  pool(kind) {
    return kind === 'smoke' ? this.smoke : this.glow;
  }

  burst(pos, o = {}) {
    const {
      count = 16, color = 0xffffff, speed = 5, life = 0.5, size = 0.3,
      gravity = 0, spread = 1, up = 0, kind = 'glow', drag = 1.5, grow = 0, dir = null, jitter = 0,
    } = o;
    const c = tmpColor.set(color);
    const pool = this.pool(kind);
    for (let i = 0; i < count; i++) {
      let vx = (Math.random() * 2 - 1) * spread;
      let vy = (Math.random() * 2 - 1) * spread + up;
      let vz = (Math.random() * 2 - 1) * spread;
      if (dir) { vx += dir.x; vy += dir.y; vz += dir.z; }
      const s = speed * (0.4 + Math.random() * 0.6);
      pool.spawn(
        pos.x + (Math.random() - 0.5) * jitter, pos.y + (Math.random() - 0.5) * jitter, pos.z + (Math.random() - 0.5) * jitter,
        vx * s, vy * s, vz * s, c, size * (0.6 + Math.random() * 0.8), life * (0.6 + Math.random() * 0.6), gravity, drag, grow,
      );
    }
  }

  // Emissor contínuo preso a uma posição dinâmica. Retorna handle.stop().
  emitter(o) {
    const e = { acc: 0, alive: true, ...o };
    e.stop = () => { e.alive = false; };
    this.emitters.add(e);
    return e;
  }

  _addMesh(obj, life, update) {
    this.scene.add(obj);
    this.meshes.push({ obj, life, maxLife: life, update });
    return obj;
  }

  // Arco de corte (katana, faca, lâminas, garra).
  slash(pos, yaw, o = {}) {
    const { color = 0xffffff, radius = 1.6, arc = 2.4, tilt = 0, life = 0.22, width = 0.35, flip = false, roll = 0 } = o;
    const geo = new THREE.RingGeometry(radius - width, radius, 28, 1, -arc / 2, arc);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const m = new THREE.Mesh(geo, mat);
    const g = new THREE.Group();
    g.position.copy(pos);
    g.rotation.y = yaw;
    m.rotation.x = -Math.PI / 2 + tilt;
    m.rotation.z = Math.PI / 2 + roll;
    if (flip) m.scale.x = -1;
    g.add(m);
    return this._addMesh(g, life, (k) => {
      mat.opacity = 0.9 * k;
      m.scale.setScalar(1 + (1 - k) * 0.25);
      if (flip) m.scale.x *= -1;
    });
  }

  ring(pos, o = {}) {
    const { color = 0xffffff, radius = 1.5, life = 0.4, vertical = false, yaw = 0, inner = 0.7, opacity = 0.9 } = o;
    const geo = new THREE.RingGeometry(inner, 1, 40);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    if (vertical) m.rotation.set(0, yaw, 0);
    else m.rotation.x = -Math.PI / 2;
    return this._addMesh(m, life, (k) => {
      const s = radius * (0.2 + (1 - k) * 0.8);
      m.scale.set(s, s, s);
      mat.opacity = opacity * k;
    });
  }

  tracer(from, to, o = {}) {
    const { color = 0xffee99, life = 0.08, width = 0.05 } = o;
    const len = from.distanceTo(to);
    const geo = new THREE.CylinderGeometry(width, width, len, 5, 1, true);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, len / 2);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(from);
    m.lookAt(to);
    return this._addMesh(m, life, (k) => { mat.opacity = k; });
  }

  flash(pos, o = {}) {
    const { color = 0xffffff, size = 1, life = 0.08 } = o;
    const mat = new THREE.SpriteMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, map: glowTexture() });
    const s = new THREE.Sprite(mat);
    s.position.copy(pos);
    s.scale.setScalar(size);
    return this._addMesh(s, life, (k) => { mat.opacity = k; s.scale.setScalar(size * (0.6 + k * 0.4)); });
  }

  // ---------------------------------------------------------------- V2
  // Corrente física entre dois pontos dinâmicos (Injustiça). handle.stop() remove.
  chain(fromFn, toFn, o = {}) {
    // corrente de metal comum (aço cinza)
    // o.rope: corda de fibra (segmentos cilíndricos marrons) em vez de elos de aço
    const { links = 22, color = o.rope ? 0x8a6a44 : 0x9a9ea6, glow = o.rope ? 0x1a1208 : 0x2a2c30 } = o;
    const geo = o.rope ? new THREE.CylinderGeometry(0.016, 0.016, 1, 5).rotateX(Math.PI / 2) : new THREE.TorusGeometry(0.045, 0.014, 5, 8);
    const mat = new THREE.MeshToonMaterial({ color, emissive: glow, emissiveIntensity: 0.3 });
    const mesh = new THREE.InstancedMesh(geo, mat, links);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    const h = { mesh, fromFn, toFn, links, alive: true, sag: o.sag ?? 0.25, rope: !!o.rope };
    h.stop = () => {
      h.alive = false;
      this.scene.remove(mesh);
      geo.dispose();
      mat.dispose();
    };
    this.chains = this.chains || new Set();
    this.chains.add(h);
    this._updateChain(h);
    return h;
  }

  _updateChain(h) {
    const a = h.fromFn();
    const b = h.toFn();
    if (!a || !b) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const up = new THREE.Vector3(0, 0, 1);
    const fwd = dir.clone().normalize();
    for (let i = 0; i < h.links; i++) {
      const t = (i + 0.5) / h.links;
      const p = new THREE.Vector3().lerpVectors(a, b, t);
      p.y -= Math.sin(t * Math.PI) * h.sag * Math.min(1, len / 6);
      q.setFromUnitVectors(up, fwd);
      if (h.rope) {
        // cada pedaço da corda acompanha a curva (de um ponto da barriga ao próximo)
        const t2 = Math.min(1, (i + 1.5) / h.links);
        const p2 = new THREE.Vector3().lerpVectors(a, b, t2);
        p2.y -= Math.sin(t2 * Math.PI) * h.sag * Math.min(1, len / 6);
        const seg = p2.clone().sub(p);
        q.setFromUnitVectors(up, seg.lengthSq() > 1e-8 ? seg.normalize() : fwd);
        m.compose(p, q, new THREE.Vector3(1, 1, (len / h.links) * 1.15));
      } else {
        if (i % 2) q.multiply(new THREE.Quaternion().setFromAxisAngle(up, Math.PI / 2));
        m.compose(p, q, new THREE.Vector3(1, 1, 1));
      }
      h.mesh.setMatrixAt(i, m);
    }
    h.mesh.instanceMatrix.needsUpdate = true;
  }

  // Marca de corte presa a uma parte do corpo (some aos poucos)
  cutMark(parent, o = {}) {
    const { color = 0xff1030, size = 0.28, life = 1.6, offset = new THREE.Vector3(0, -0.1, 0.12), rot = Math.random() * Math.PI } = o;
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, 0.035), mat);
    m.position.copy(offset);
    m.rotation.set(0, 0, rot);
    parent.add(m);
    const fx = { obj: m, life, maxLife: life, update: (k) => { mat.opacity = Math.min(1, k * 2); m.scale.x = Math.min(1, (1 - k) * 12 + 0.2); }, parent };
    this.meshes.push(fx);
    return m;
  }

  // Poço de sombra no chão (Mascarado)
  shadowDisc(pos, o = {}) {
    const { radius = 1.1, life = 0.6, grow = true } = o;
    const mat = new THREE.MeshBasicMaterial({ color: 0x050307, transparent: true, opacity: 0.85, depthWrite: false });
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 32), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(pos.x, 0.03, pos.z);
    const rim = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 32), new THREE.MeshBasicMaterial({ color: 0xd01830, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.add(rim);
    return this._addMesh(m, life, (k) => {
      const s = radius * (grow ? Math.min(1, (1 - k) * 4) : 1) * (k < 0.25 ? k * 4 : 1);
      m.scale.setScalar(Math.max(0.01, s));
      mat.opacity = 0.85 * Math.min(1, k * 3);
      rim.material.opacity = 0.7 * Math.min(1, k * 3);
    });
  }

  // Distorção paranormal: anéis verticais + núcleo escuro
  distort(pos, o = {}) {
    const { color = 0xeae6ff, radius = 1.8, life = 0.4 } = o;
    for (let i = 0; i < 3; i++) {
      this.ring(pos, { color, radius: radius * (0.6 + i * 0.3), life: life * (0.7 + i * 0.2), vertical: true, yaw: (i * Math.PI) / 3, inner: 0.9 });
    }
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false });
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), mat);
    s.position.copy(pos);
    this._addMesh(s, life * 0.6, (k) => { s.scale.setScalar(0.4 + (1 - k) * radius); mat.opacity = 0.55 * k; });
  }

  // Raio irregular (eletricidade paranormal)
  lightning(a, b, o = {}) {
    const { color = 0xff3040, life = 0.12, segments = 7, jitter = 0.18 } = o;
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const p = new THREE.Vector3().lerpVectors(a, b, i / segments);
      if (i > 0 && i < segments) p.add(new THREE.Vector3((Math.random() - 0.5) * jitter * 2, (Math.random() - 0.5) * jitter * 2, (Math.random() - 0.5) * jitter * 2));
      pts.push(p);
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const line = new THREE.Line(g, mat);
    return this._addMesh(line, life, (k) => { mat.opacity = k; });
  }

  // Runas orbitando um ponto (Rebirth). handle.stop() remove.
  runes(followFn, o = {}) {
    const { color = 0xff2a3d, count = 5, radius = 0.45, size = 0.2, shape = 'rune' } = o;
    const group = new THREE.Group();
    const tex = shape === 'skull' ? skullTexture() : runeTexture();
    for (let i = 0; i < count; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      s.scale.setScalar(size);
      s.userData.a = (i / count) * Math.PI * 2;
      group.add(s);
    }
    this.scene.add(group);
    const h = { group, followFn, radius, alive: true, t: 0 };
    h.stop = () => { h.alive = false; this.scene.remove(group); };
    this.runeSets = this.runeSets || new Set();
    this.runeSets.add(h);
    return h;
  }

  // Efeito da biblioteca pelo nome (FX_HIT_SMALL, FX_BLOCK, ... — ver fx/library.js)
  play(name, pos, o = {}) {
    const f = FX_LIBRARY[name];
    if (!f) { console.warn('efeito desconhecido:', name); return; }
    f(this, pos, o);
  }

  // Impacto padrão: faíscas + clarão + anel.
  impact(pos, color = 0xffffff, strength = 1) {
    this.play('FX_HIT_SMALL', pos, { color, scale: strength });
  }

  update(dt) {
    for (const e of this.emitters) {
      if (!e.alive) { this.emitters.delete(e); continue; }
      if (e.until && e.until()) { this.emitters.delete(e); continue; }
      e.acc += dt * e.rate;
      const p = e.follow();
      while (e.acc >= 1) {
        e.acc -= 1;
        if (p && e.visible !== false) {
          this.burst(p, { count: 1, ...e.particle });
        }
      }
    }
    this.glow.update(dt);
    this.smoke.update(dt);
    if (this.chains) for (const h of this.chains) { if (!h.alive) this.chains.delete(h); else this._updateChain(h); }
    if (this.runeSets) {
      for (const h of this.runeSets) {
        if (!h.alive) { this.runeSets.delete(h); continue; }
        h.t += dt;
        const c = h.followFn();
        if (!c) continue;
        h.group.children.forEach((s, i) => {
          const a = s.userData.a + h.t * 2.2;
          s.position.set(c.x + Math.cos(a) * h.radius, c.y + Math.sin(h.t * 3 + i) * 0.12, c.z + Math.sin(a) * h.radius);
          s.material.rotation = h.t * 2 + i;
        });
      }
    }
    for (let i = this.meshes.length - 1; i >= 0; i--) {
      const fx = this.meshes[i];
      fx.life -= dt;
      const k = Math.max(0, fx.life / fx.maxLife);
      fx.update && fx.update(k, dt);
      if (fx.life <= 0) {
        (fx.parent || this.scene).remove(fx.obj);
        fx.obj.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose();
        });
        this.meshes.splice(i, 1);
      }
    }
  }

  clear() {
    this.glow.clear();
    this.smoke.clear();
    for (const fx of this.meshes) (fx.parent || this.scene).remove(fx.obj);
    this.meshes.length = 0;
    this.emitters.clear();
    if (this.chains) for (const h of [...this.chains]) h.stop();
    if (this.runeSets) for (const h of [...this.runeSets]) h.stop();
  }
}

let _skullTex = null;
// caveirinha de energia (Rebirth)
function skullTexture() {
  if (_skullTex) return _skullTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.shadowColor = '#fff';
  g.shadowBlur = 8;
  g.beginPath(); g.ellipse(32, 26, 18, 17, 0, 0, Math.PI * 2); g.fill();
  g.fillRect(22, 36, 20, 12);
  g.globalCompositeOperation = 'destination-out';
  g.shadowBlur = 0;
  g.beginPath(); g.ellipse(25, 27, 5, 6, 0, 0, Math.PI * 2); g.ellipse(39, 27, 5, 6, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(32, 33); g.lineTo(29, 39); g.lineTo(35, 39); g.fill();
  for (let i = 0; i < 4; i++) g.fillRect(24 + i * 5, 43, 2, 6);
  _skullTex = new THREE.CanvasTexture(c);
  return _skullTex;
}

let _runeTex = null;
function runeTexture() {
  if (_runeTex) return _runeTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.strokeStyle = '#fff';
  g.lineWidth = 4;
  g.shadowColor = '#fff';
  g.shadowBlur = 6;
  g.beginPath();
  g.moveTo(32, 8); g.lineTo(32, 56); g.moveTo(32, 20); g.lineTo(50, 34); g.moveTo(32, 30); g.lineTo(14, 44);
  g.arc(32, 32, 24, 0, Math.PI * 2);
  g.stroke();
  _runeTex = new THREE.CanvasTexture(c);
  return _runeTex;
}

let _glowTex = null;
export function glowTexture() {
  if (_glowTex) return _glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.3, 'rgba(255,255,255,0.6)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}
