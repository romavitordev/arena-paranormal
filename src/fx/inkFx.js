import * as THREE from 'three';

// Efeitos de TINTA do AMIGO IMAGINÁRIO (O Segredo na Ilha): tentáculos negros que brotam do chão, respingos e poças
// de tinta marrom e o SINO fantasma que toca dentro da criatura. Todos vivem em world.fx (rodam também durante os
// especiais, quando o mundo para).

const INK = 0x4a1c0e;
const TENT = 0x1a100c;
const _p = new THREE.Vector3();

// TENTÁCULO: sai do chão em `from` (Vector3), arqueia e chega em `to()` (função: o alvo pode andar). Cresce em
// `grow` s, fica `hold` s e recolhe em `retract` s. o.coil: enrola em volta do alvo no fim (prender).
export function inkTentacle(world, from, to, o = {}) {
  const { grow = 0.18, hold = 0.3, retract = 0.2, radius = 0.09, color = TENT, arc = 0.9, coil = false, wiggle = 0.12 } = o;
  const TUB = 26;
  const RAD = 6;
  const mat = new THREE.MeshToonMaterial({ color, emissive: 0x1a0804, emissiveIntensity: 0.4 });
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  mesh.frustumCulled = false;
  const life = grow + hold + retract;
  const seed = Math.random() * 10;
  let t = 0;
  const base = from.clone();
  const build = (amount) => {
    const end = typeof to === 'function' ? to() : to;
    const pts = [];
    const d = _p.copy(end).sub(base);
    const len = Math.max(0.3, d.length());
    const side = new THREE.Vector3(-d.z, 0, d.x).normalize();
    for (let i = 0; i <= 12; i++) {
      const k = i / 12;
      const p = base.clone().lerp(end, k);
      p.y += Math.sin(k * Math.PI) * arc * Math.min(1.6, len * 0.5);
      p.addScaledVector(side, Math.sin(k * 7 + seed + t * 9) * wiggle * Math.sin(k * Math.PI));
      if (coil && k > 0.75) {
        const c = (k - 0.75) / 0.25;
        const ang = c * Math.PI * 3 + seed;
        p.set(end.x + Math.sin(ang) * 0.32 * (1 - c * 0.3), end.y - 0.35 + c * 0.7, end.z + Math.cos(ang) * 0.32 * (1 - c * 0.3));
      }
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(curve, TUB, radius, RAD, false);
    // afina até a ponta
    const pos = g.attributes.position;
    for (let j = 0; j <= TUB; j++) {
      const c = curve.getPointAt(j / TUB);
      const tap = 1 - (j / TUB) * 0.85;
      for (let r = 0; r <= RAD; r++) {
        const idx = j * (RAD + 1) + r;
        _p.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(tap).add(c);
        pos.setXYZ(idx, _p.x, _p.y, _p.z);
      }
    }
    g.computeVertexNormals();
    g.setDrawRange(0, Math.max(0, Math.floor(TUB * amount)) * RAD * 6);
    mesh.geometry.dispose();
    mesh.geometry = g;
  };
  build(0);
  world.fx.burst(base.clone().setY(base.y + 0.05), { count: 10, color: INK, speed: 2, up: 2, life: 0.4, size: 0.14, gravity: 8 });
  const h = { mesh, alive: true };
  world.fx._addMesh(mesh, life, (k, dt) => {
    t += dt;
    const el = life - k * life;
    const amount = el < grow ? el / grow : el < grow + hold ? 1 : Math.max(0, 1 - (el - grow - hold) / retract);
    build(amount);
    if (k <= 0) h.alive = false;
  });
  // recolhe antes da hora (o alvo escapou / o golpe acabou)
  h.release = () => {
    const fx = world.fx.meshes.find((m) => m.obj === mesh);
    if (fx) fx.life = Math.min(fx.life, retract);
  };
  return h;
}

// RESPINGO de tinta: gotas + poça achatada no chão que some devagar
export function inkSplash(world, pos, o = {}) {
  const { size = 1, color = INK, puddle = true } = o;
  world.fx.burst(pos, { count: Math.round(22 * size), color, speed: 3.2 * size, up: 1.4, life: 0.6, size: 0.13 * size, gravity: 11 });
  world.fx.burst(pos, { count: Math.round(8 * size), color: 0x241008, kind: 'smoke', speed: 1, life: 0.5, size: 0.35 * size });
  if (!puddle) return;
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.55 * size, 18), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(pos.x, 0.025, pos.z);
  m.renderOrder = 2;
  const life = o.life ?? 2.5;
  world.fx._addMesh(m, life, (k) => {
    const g = Math.min(1, (1 - k) * life * 6);
    m.scale.setScalar(0.3 + 0.7 * g);
    m.material.opacity = 0.85 * Math.min(1, k * 3);
  });
}

// o SINO fantasma: aparece sobre a criatura, balança e brilha a cada badalada (toll())
export function ghostBell(world, followFn, o = {}) {
  const { life = 1.6, color = 0x5a3818, size = 0.55 } = o;
  const prof = [[0.02, 0.62], [0.16, 0.6], [0.24, 0.5], [0.27, 0.32], [0.33, 0.12], [0.44, 0.02], [0.47, 0], [0.4, 0.04]].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(prof, 20);
  geo.translate(0, -0.62, 0); // pendurado pelo alto
  const mat = new THREE.MeshToonMaterial({ color, emissive: 0x2a1004, emissiveIntensity: 0.5, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const bell = new THREE.Mesh(geo, mat);
  const clap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat);
  clap.position.y = -0.55;
  bell.add(clap);
  const g = new THREE.Group();
  g.add(bell);
  g.scale.setScalar(size);
  let swing = 0;
  let vel = 0;
  let glow = 0;
  const h = {
    toll() { vel += 6; glow = 1; },
  };
  world.fx._addMesh(g, life, (k, dt) => {
    const p = followFn();
    if (p) g.position.copy(p);
    vel -= swing * 60 * dt;
    vel *= 1 - 3 * dt;
    swing += vel * dt;
    bell.rotation.z = swing * 0.35;
    glow = Math.max(0, glow - dt * 2.5);
    mat.emissiveIntensity = 0.5 + glow * 2.0;
    mat.opacity = Math.min(0.85, (1 - k) * life * 5, k * life * 4);
  });
  return h;
}

// onda do SOM do sino: anéis marrons que se abrem no chão e em pé em volta da criatura
export function bellWave(world, pos, radius, color = 0xb07a3a) {
  const ground = pos.clone().setY(0.08);
  world.fx.ring(ground, { color, radius, life: 0.55, inner: 0.9, opacity: 0.85 });
  world.fx.ring(ground, { color: 0x3a1a08, radius: radius * 0.8, life: 0.45, inner: 0.82, opacity: 0.7 });
  for (let i = 0; i < 3; i++) world.fx.ring(pos.clone().setY(pos.y + 0.4 + i * 0.5), { color, radius: radius * (0.5 + i * 0.12), life: 0.4, vertical: true, yaw: i * 1.05, inner: 0.93, opacity: 0.6 });
}
