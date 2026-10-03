import * as THREE from 'three';
import { loadGLB } from '../models/glbRig.js';
import { ARENA_TEXTURES } from './arenaTextures.js';
import { blocksPointGeneric } from '../combat/positioning.js';

// Cenário feito no Blender (tools/blender/arena_<id>.py → public/arenas/<id>.glb).
// Convenções dos objetos no .glb:
//   COL_cyl_*   → obstáculo redondo (centro e raio pela caixa do objeto); o objeto é removido
//   COL_box_*   → obstáculo retangular; removido
//   OCC_*       → fica transparente quando tampa a luta (paredes, pilares)
//   FLICKER_*   → lâmpada que pisca
//   SWAY_*      → balança devagar (balanços, estandartes)
//   HIDE_*      → removido (ajuda de modelagem)
// Materiais com nome em ARENA_TEXTURES recebem textura pintada em código.

const cache = {};

export async function preloadArena(cfg) {
  if (!cache[cfg.id]) cache[cfg.id] = await loadGLB(import.meta.env.BASE_URL + cfg.glb);
  return cache[cfg.id];
}

export function isArenaLoaded(id) {
  return !!cache[id];
}

export function createGLBArena(cfg) {
  const colliders = [];
  const boxes = [];
  const occluders = [];
  const solids = []; // blocos grandes que a câmera não atravessa
  const flicker = [];
  const sway = []; const spin = [];
  let time = 0;
  let particles = null;

  const arena = {
    id: cfg.id,
    name: cfg.name,
    radius: cfg.bounds.radius ?? 30,
    bounds: cfg.bounds.rects ? { rects: cfg.bounds.rects } : null,
    colliders,
    boxes,
    occluders,
    solids,
    spawns: cfg.spawns,

    build(scene) {
      const gltf = cache[cfg.id];
      if (!gltf) throw new Error(`Cenário não carregado: ${cfg.id}`);
      const group = gltf.scene.clone(true);
      scene.add(group);
      arena.group = group;
      group.updateMatrixWorld(true);

      const remove = [];
      const texCache = {};
      // Objetos com vários materiais viram um grupo com várias malhas: o prefixo
      // (OCC_, FLICKER_...) fica no nome do grupo, então olha também os pais.
      const PREFIXES = ['COL_', 'HIDE_', 'OCC_', 'FLICKER_', 'SWAY_', 'GROUND', 'FLOOR'];
      const taggedNode = (o) => {
        for (let p = o; p && p !== group; p = p.parent) {
          if (PREFIXES.some((x) => (p.name || '').startsWith(x))) return p;
        }
        return o;
      };
      const swaySeen = new Set();
      spin.length = 0;
      group.traverse((o) => {
        const node = taggedNode(o);
        const n = node.name || '';
        if (n.startsWith('COL_') || n.startsWith('HIDE_')) {
          if (o.isMesh) {
            const bb = new THREE.Box3().setFromObject(o);
            if (n.startsWith('COL_cyl')) {
              colliders.push({ x: (bb.min.x + bb.max.x) / 2, z: (bb.min.z + bb.max.z) / 2, r: Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) / 2, h: bb.max.y });
            } else if (n.startsWith('COL_box')) {
              boxes.push({ minX: bb.min.x, maxX: bb.max.x, minZ: bb.min.z, maxZ: bb.max.z, h: bb.max.y });
            }
          }
          remove.push(o);
          return;
        }
        if (!o.isMesh) return;
        o.castShadow = !n.startsWith('GROUND') && !n.startsWith('FLOOR') && !n.startsWith('DECAL_'); // decalque no chão não faz sombra
        o.receiveShadow = true;
        // texturas pintadas pelo nome do material
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          const key = m.name.replace(/^MAT_[A-Z]+_/, ''); // nomes MAT_<CATEGORIA>_<nome> (V4)
          if (ARENA_TEXTURES[key] && !m.userData.textured) {
            const t = texCache[key] || (texCache[key] = ARENA_TEXTURES[key]());
            const tex = t.isTexture ? t : t.map;
            tex.flipY = false;
            tex.needsUpdate = true;
            m.map = tex;
            m.color.set(0xffffff);
            if (!t.isTexture && t.roughness !== undefined) m.roughness = t.roughness;
            if (!t.isTexture && t.glow) {
              // textura que brilha (ex.: o círculo ritual): a própria imagem vira a luz emitida
              m.emissive = new THREE.Color(0xffffff);
              m.emissiveMap = tex;
              m.emissiveIntensity = t.glow;
              m.transparent = true;
            }
            m.userData.textured = true;
            m.needsUpdate = true;
          }
          if (m.metalness > 0.5) m.metalness = 0.4;
        }
        if (n.startsWith('OCC_')) {
          // material próprio para poder ficar transparente sozinho
          o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
          occluders.push(o);
        }
        if (n.startsWith('FLICKER_')) flicker.push({ o, base: (Array.isArray(o.material) ? o.material[0] : o.material).emissiveIntensity || 1, seed: Math.random() * 10 });
        if (n.startsWith('SPIN_')) spin.push({ o, speed: (0.05 + Math.random() * 0.06) * (spin.length % 2 ? -1 : 1) });
        if (n.startsWith('SWAY_') && !swaySeen.has(node)) {
          swaySeen.add(node);
          sway.push({ o: node, rot: node.rotation.clone(), seed: Math.random() * 10 });
        }
      });
      for (const o of remove) o.parent && o.parent.remove(o);
      // além das peças OCC_, qualquer objeto ALTO do cenário (árvores, pedras, casas, colunas) fica transparente
      // quando fica entre a câmera e os lutadores (o material só é copiado na primeira vez que precisar sumir)
      const occSet = new Set(occluders);
      group.updateMatrixWorld(true);
      group.traverse((o) => {
        if (!o.isMesh || occSet.has(o)) return;
        const n = taggedNode(o).name || '';
        if (/^(GROUND|FLOOR|DECAL_)/.test(n)) return;
        const bb = new THREE.Box3().setFromObject(o);
        if (bb.max.y - bb.min.y < 1.2) return;
        // peças juntadas num bloco só (a cidade inteira, o cemitério): não dá para sumir uma casa sozinha — a câmera
        // é que chega para a frente do obstáculo (CameraRig)
        if (bb.max.x - bb.min.x > 12 || bb.max.z - bb.min.z > 12) {
          if (bb.max.y - bb.min.y > 2.5) solids.push(o);
          return;
        }
        o.userData.autoOcc = true;
        occluders.push(o);
      });

      // céu, névoa e luzes definidos no cenário
      scene.background = cfg.sky.isTexture ? cfg.sky : new THREE.Color(cfg.sky);
      if (cfg.skyGradient) scene.background = gradientSky(cfg.skyGradient);
      scene.fog = cfg.fog ? new THREE.FogExp2(cfg.fog.color, cfg.fog.density) : null;
      for (const L of cfg.lights) {
        let light;
        if (L.type === 'hemi') light = new THREE.HemisphereLight(L.sky, L.ground, L.intensity);
        else if (L.type === 'ambient') light = new THREE.AmbientLight(L.color, L.intensity);
        else if (L.type === 'point') {
          light = new THREE.PointLight(L.color, L.intensity, L.distance ?? 15, L.decay ?? 2);
          light.position.set(...L.pos);
          if (L.flicker) flicker.push({ light, base: L.intensity, seed: Math.random() * 10 });
        } else if (L.type === 'dir') {
          light = new THREE.DirectionalLight(L.color, L.intensity);
          light.position.set(...L.pos);
          if (L.shadow) {
            light.castShadow = true;
            light.shadow.mapSize.set(2048, 2048);
            const s = L.area ?? 26;
            const c = light.shadow.camera;
            c.left = c.bottom = -s; c.right = c.top = s; c.near = 1; c.far = 120;
            light.shadow.bias = -0.0006;
          }
        }
        if (light) group.add(light);
      }
      if (cfg.particles) particles = makeParticles(group, cfg.particles);
    },

    update(dt) {
      time += dt;
      for (const f of flicker) {
        const k = Math.sin(time * 23 + f.seed) * Math.sin(time * 7.3 + f.seed * 2) > 0.93 ? 0.15 : 1;
        if (f.light) f.light.intensity = f.base * (0.85 + Math.sin(time * 9 + f.seed) * 0.1) * k;
        if (f.o) {
          const m = Array.isArray(f.o.material) ? f.o.material[0] : f.o.material;
          m.emissiveIntensity = f.base * k;
        }
      }
      for (const s of spin) s.o.rotation.y += s.speed * dt;
      for (const s of sway) {
        s.o.rotation.x = s.rot.x + Math.sin(time * 1.1 + s.seed) * 0.06;
        s.o.rotation.z = s.rot.z + Math.sin(time * 0.8 + s.seed) * 0.03;
      }
      if (particles) particles.update(dt);
    },

    blocksPoint(p, r = 0) {
      return blocksPointGeneric(arena, p, r);
    },

    clampCamera(p, fighters = []) {
      let cb = cfg.camera || {};
      // cenário fechado: com os dois lutando lá dentro, a câmera fica dentro (abaixo do teto)
      const inn = cb.interior;
      if (inn && fighters.length && fighters.every((f) => f.pos.x > inn.when.minX && f.pos.x < inn.when.maxX && f.pos.z > inn.when.minZ && f.pos.z < inn.when.maxZ)) {
        cb = inn;
      }
      if (cb.rect) {
        p.x = Math.max(cb.rect.minX, Math.min(cb.rect.maxX, p.x));
        p.z = Math.max(cb.rect.minZ, Math.min(cb.rect.maxZ, p.z));
      } else {
        const maxR = cb.radius ?? arena.radius + 6;
        const r = Math.hypot(p.x, p.z);
        if (r > maxR) { p.x *= maxR / r; p.z *= maxR / r; }
      }
      if (cb.maxY !== undefined) p.y = Math.min(cb.maxY, p.y);
    },

    dispose(scene) {
      if (arena.group) scene.remove(arena.group);
    },
  };
  return arena;
}

function gradientSky(stops) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 256);
  stops.forEach(([k, col]) => grd.addColorStop(k, col));
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Partículas do ambiente (poeira, folhas, cinzas, mosquitos na luz)
function makeParticles(group, o) {
  const n = o.count ?? 300;
  const pos = new Float32Array(n * 3);
  const vel = new Float32Array(n * 3);
  const A = o.area ?? 40;
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * A + (o.center?.[0] ?? 0);
    pos[i * 3 + 1] = Math.random() * (o.height ?? 8);
    pos[i * 3 + 2] = (Math.random() - 0.5) * A + (o.center?.[2] ?? 0);
    vel[i * 3] = (Math.random() - 0.5) * (o.drift ?? 0.4);
    vel[i * 3 + 1] = (o.rise ?? 0.2) * (0.5 + Math.random());
    vel[i * 3 + 2] = (Math.random() - 0.5) * (o.drift ?? 0.4);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: o.color, size: o.size ?? 0.08, transparent: true, opacity: o.opacity ?? 0.6, depthWrite: false }));
  group.add(pts);
  return {
    update(dt) {
      const p = g.attributes.position;
      for (let i = 0; i < n; i++) {
        let x = p.getX(i) + vel[i * 3] * dt;
        let y = p.getY(i) + vel[i * 3 + 1] * dt;
        let z = p.getZ(i) + vel[i * 3 + 2] * dt;
        if (y > (o.height ?? 8)) y = 0;
        if (y < 0) y = o.height ?? 8;
        p.setXYZ(i, x, y, z);
      }
      p.needsUpdate = true;
    },
  };
}
