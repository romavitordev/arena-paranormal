// Ferramentas de desenvolvimento: fotos de perto de um lutador na partida atual (para conferir modelos).
// Uso no console: const s = await import('/src/dev/shots.js'); s.show([s.shot(0, -60)]);
import * as THREE from 'three';

// foto do lutador fi, câmera girada `ang` graus em volta dele
export function shot(fi = 0, ang = 0, dist = 2.6, hy = 1.3, size = [300, 420]) {
  const w = window.__game.match.world;
  const f = w.fighters[fi];
  const r = w.renderer;
  const cam = new THREE.PerspectiveCamera(40, size[0] / size[1], 0.05, 100);
  const yaw = f.yaw + (ang * Math.PI) / 180;
  const c = f.pos.clone().add(new THREE.Vector3(0, hy, 0));
  cam.position.set(c.x + Math.sin(yaw) * dist, c.y + 0.2, c.z + Math.cos(yaw) * dist);
  cam.lookAt(c);
  const prev = new THREE.Vector2();
  r.getSize(prev);
  r.setSize(size[0], size[1], false);
  r.render(w.scene, cam);
  const url = r.domElement.toDataURL();
  r.setSize(prev.x, prev.y, false);
  return url;
}

// mostra as fotos por cima do jogo (clique para fechar)
export function show(urls) {
  document.getElementById('pv')?.remove();
  const box = document.createElement('div');
  box.id = 'pv';
  box.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#222;display:flex;gap:4px;align-items:flex-start';
  for (const u of urls) {
    const i = new Image();
    i.src = u;
    i.style.height = '90vh';
    box.appendChild(i);
  }
  box.onclick = () => box.remove();
  document.body.appendChild(box);
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
