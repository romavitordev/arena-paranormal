import * as THREE from 'three';
import { ARENAS, ARENA_ORDER } from '../arena/index.js';

// Gera imagens de preview dos cenários renderizando cada um uma vez (dataURL), como os retratos.
// Câmera padrão: de lado, entre os pontos de nascimento; um cenário pode definir `thumbCamera`
// no registro ({ pos: [x, y, z], look: [x, y, z] }) para um enquadramento próprio.
export function renderArenaThumbs(renderer, { w = 640, h = 360, cameras = {}, only = null } = {}) {
  const target = new THREE.WebGLRenderTarget(w, h, { samples: 4 });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const pixels = new Uint8Array(w * h * 4);
  const out = {};
  const prevTarget = renderer.getRenderTarget();
  const cam = new THREE.PerspectiveCamera(48, w / h, 0.5, 400);

  for (const id of ARENA_ORDER) {
    const A = ARENAS[id];
    if (!A || !A.available || (only && !only.includes(id))) continue;
    try {
      const scene = new THREE.Scene();
      const arena = A.create();
      arena.build(scene);
      if (arena.update) arena.update(0.016);
      const tc = cameras[id] || A.thumbCamera;
      if (tc) {
        cam.position.set(...tc.pos);
        cam.lookAt(new THREE.Vector3(...tc.look));
      } else {
        const [s0, s1] = arena.spawns;
        const mx = (s0.x + s1.x) / 2;
        const mz = (s0.z + s1.z) / 2;
        const ax = s1.x - s0.x;
        const az = s1.z - s0.z;
        const len = Math.hypot(ax, az) || 1;
        cam.position.set(mx - (az / len) * 13, 6, mz + (ax / len) * 13);
        cam.lookAt(mx, 1.2, mz);
      }
      cam.updateProjectionMatrix();
      scene.updateMatrixWorld(true);
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(scene, cam);
      renderer.readRenderTargetPixels(target, 0, 0, w, h, pixels);
      const img = ctx.createImageData(w, h);
      for (let y = 0; y < h; y++) img.data.set(pixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
      ctx.putImageData(img, 0, 0);
      out[id] = canvas.toDataURL('image/jpeg', 0.85);
      // (geometrias dos GLB são compartilhadas com o cenário de verdade: não descartar aqui)
    } catch (e) {
      console.warn('Preview do cenário falhou:', id, e);
    }
  }
  renderer.setRenderTarget(prevTarget);
  target.dispose();
  return out;
}
