import * as THREE from 'three';
import { toon } from './rig.js';

// Cão de caça (Rottweiler do Aguiar): modelo procedural simples, preto com marcas castanhas.
// Retorna { root, legs[], update(t) } — update anima as pernas e o corpo correndo.
export function buildHuntingDog() {
  const root = new THREE.Group();
  const black = toon(0x16130f);
  const tan = toon(0x8a4a1e);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), black);
  body.scale.set(0.75, 0.7, 1.45);
  body.position.y = 0.55;
  root.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), tan);
  chest.scale.set(0.9, 0.8, 0.6);
  chest.position.set(0, 0.5, 0.32);
  root.add(chest);
  const head = new THREE.Group();
  head.position.set(0, 0.78, 0.48);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.26), black);
  head.add(skull);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.2), tan);
  snout.position.set(0, -0.04, 0.2);
  head.add(snout);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), black);
  nose.position.set(0, 0.0, 0.31);
  head.add(nose);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.03), black);
    ear.position.set(s * 0.12, 0.1, -0.02);
    ear.rotation.z = s * 0.4;
    head.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff3020 }));
    eye.position.set(s * 0.07, 0.04, 0.13);
    head.add(eye);
  }
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.17), tan);
  jaw.position.set(0, -0.13, 0.18);
  head.add(jaw);
  root.add(head);
  const legs = [];
  for (const [x, z] of [[-0.14, 0.28], [0.14, 0.28], [-0.14, -0.3], [0.14, -0.3]]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.5, z);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.5, 6), black);
    leg.position.y = -0.25;
    pivot.add(leg);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), tan);
    paw.position.y = -0.5;
    pivot.add(paw);
    root.add(pivot);
    legs.push(pivot);
  }
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.18, 5), black);
  tail.position.set(0, 0.68, -0.48);
  tail.rotation.x = -0.8;
  root.add(tail);
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return {
    root,
    update(t, running = true, biting = false) {
      const k = running ? 14 : 4;
      legs.forEach((l, i) => { l.rotation.x = Math.sin(t * k + (i % 2 ? 0 : Math.PI) + (i > 1 ? Math.PI / 2 : 0)) * (running ? 0.7 : 0.1); });
      body.position.y = 0.55 + Math.abs(Math.sin(t * k)) * (running ? 0.05 : 0.01);
      head.rotation.x = biting ? -0.5 + Math.sin(t * 30) * 0.25 : Math.sin(t * k) * 0.08;
      jaw.rotation.x = biting ? 0.5 : 0;
    },
    dispose() { root.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); },
  };
}
