import * as THREE from 'three';
import { buildHumanoid, part, faceTexture, paintEyes, paintMouth } from '../rig.js';

// Dante — modelo provisório (só aparece se public/models/dante.glb não carregar).
// Loiro de coque, sigilo do infinito na testa, lágrimas pretas, sem barba, xale claro, camiseta escura, descalço.
export function buildDante() {
  const skin = 0xdcc0b0;
  const face = faceTexture((g) => {
    g.fillStyle = '#dcc0b0';
    g.fillRect(0, 0, 256, 128);
    paintEyes(g, { color: '#2a2424', iris: '#3a3434', browTilt: 1, brow: '#7a6640' });
    g.strokeStyle = '#1c1414'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(64, 30, 8, 3, 0, 0, Math.PI * 2); g.stroke(); // infinito simplificado
    g.fillStyle = '#0c0a0e';
    for (const x of [48, 80]) g.fillRect(x - 1, 52, 3, 26); // lágrimas de lodo
    paintMouth(g, { y: 90, w: 8, color: '#8a5a50' });
  });
  const rig = buildHumanoid({
    skin, faceTex: face, torso: 0x232226, sleeveL: 0x232226, sleeveR: 0x232226,
    pants: 0x1f1d1c, shoes: 0xd8d2c4, belt: 0x3a2a20, width: 0.98, height: 1.02,
  });
  const { joints } = rig;
  // xale claro sobre os ombros
  const shawl = part(new THREE.CylinderGeometry(0.2, 0.32, 0.42, 16, 1, true), 0xc9c8c2);
  shawl.material.side = THREE.DoubleSide;
  shawl.position.y = 0.32;
  joints.sp.add(shawl);
  // cabelo loiro com coque
  const hair = part(new THREE.SphereGeometry(0.17, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0x9a8456);
  hair.position.set(0, 0.14, -0.01);
  joints.hd.add(hair);
  const bun = part(new THREE.SphereGeometry(0.06, 10, 8), 0x9a8456);
  bun.position.set(0, 0.32, -0.06);
  joints.hd.add(bun);
  return rig.finish();
}
