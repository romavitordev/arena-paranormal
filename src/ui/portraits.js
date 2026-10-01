import * as THREE from 'three';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';

// Gera retratos dos personagens renderizando o modelo 3D uma vez (dataURL).
// Quando houver artes oficiais, basta trocar por <img> das artes.
export function renderPortraits(roster, renderer, { w = 300, h = 400, anim: animName = 'idle', animTime = 0.3, full = false, background = true, turn = 0.35 } = {}) {
  const target = new THREE.WebGLRenderTarget(w, h, { samples: 4 });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = null;
  scene.add(new THREE.HemisphereLight(0xc8b8ff, 0x201830, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa46bff, 2.5);
  rim.position.set(-3, 2, -3);
  scene.add(rim);
  const cam = new THREE.PerspectiveCamera(26, w / h, 0.1, 20);
  if (full) {
    // corpo inteiro (tela de vitória)
    cam.position.set(0.9, 1.3, 6.2);
    cam.lookAt(0, 1.0, 0);
  } else {
    cam.position.set(0.9, 1.5, 3.6);
    cam.lookAt(0, 1.15, 0);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const pixels = new Uint8Array(w * h * 4);
  const out = {};
  const prevTarget = renderer.getRenderTarget();
  const prevClear = renderer.getClearAlpha();
  renderer.setClearColor(0x000000, 0);

  for (const def of roster) {
    const rig = buildModel(def.model);
    const anim = new Animator(rig, def.anims);
    anim.play(animName, { blend: 0 });
    anim.update(animTime);
    rig.root.rotation.y = turn;
    scene.add(rig.root);
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.readRenderTargetPixels(target, 0, 0, w, h, pixels);
    const img = ctx.createImageData(w, h);
    // WebGL lê de baixo para cima
    for (let y = 0; y < h; y++) {
      img.data.set(pixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    }
    if (background) {
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#1c1428');
      grd.addColorStop(1, def.color + '55');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    } else ctx.clearRect(0, 0, w, h);
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    tmp.getContext('2d').putImageData(img, 0, 0);
    ctx.drawImage(tmp, 0, 0);
    out[def.id] = canvas.toDataURL('image/png');
    scene.remove(rig.root);
    rig.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  }
  renderer.setRenderTarget(prevTarget);
  renderer.setClearColor(0x000000, prevClear);
  target.dispose();
  return out;
}
