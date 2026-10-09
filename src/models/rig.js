import * as THREE from 'three';

// Materiais e peças em código (armas, acessórios, invocações): toon, brilho, contorno.
// O rig humanoide procedural antigo foi apagado — todos os personagens usam o modelo do Blender (glbRig.js).

let gradient = null;
function toonGradient() {
  if (gradient) return gradient;
  const data = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
  gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
}

export function toon(color, opts = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), ...opts });
}

export function glowMat(color, opacity = 0.9) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}

const OUTLINE_MAT = new THREE.MeshBasicMaterial({ color: 0x0a0a0c, side: THREE.BackSide });

// Cria malha com material toon; `outline` adiciona contorno estilo HQ.
export function part(geo, color, { outline = true, mat, castShadow = true } = {}) {
  const m = new THREE.Mesh(geo, mat || toon(color));
  m.castShadow = castShadow;
  m.userData.outline = outline;
  return m;
}

// Cilindro "membro" que pende para baixo a partir do pivô (y=0 → y=-len)
export function limb(rTop, rBot, len, color, opts) {
  const g = new THREE.CylinderGeometry(rTop, rBot, len, 10);
  g.translate(0, -len / 2, 0);
  return part(g, color, opts);
}

export function addOutlines(root, thickness = 0.022) {
  const list = [];
  root.traverse((o) => {
    if (o.isMesh && o.userData.outline && !o.userData.isOutline) list.push(o);
  });
  for (const m of list) {
    const o = new THREE.Mesh(m.geometry, OUTLINE_MAT);
    o.userData.isOutline = true;
    m.geometry.computeBoundingSphere();
    const r = m.geometry.boundingSphere.radius || 0.1;
    const s = 1 + thickness / Math.max(0.05, r);
    o.scale.setScalar(s);
    o.raycast = () => {};
    m.add(o);
  }
}
