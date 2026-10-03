import * as THREE from 'three';
import { buildHumanoid, part, faceTexture, paintMouth, toon } from '../rig.js';
import { sickleBlade } from '../weapons.js';

// Injustiça — modelo provisório. Cabelo preto longo, faixa preta cobrindo os
// olhos, sorriso largo, poncho escuro com franjas, braços com padrão de
// correntes e duas lâminas longas curvas com empunhadura dourada.
function chainArm() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#c4a090';
  g.fillRect(0, 0, 128, 128);
  // trama tipo rede
  g.strokeStyle = 'rgba(20,16,16,0.55)';
  g.lineWidth = 1;
  for (let i = -128; i < 256; i += 8) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke();
    g.beginPath(); g.moveTo(i, 128); g.lineTo(i + 128, 0); g.stroke();
  }
  // elos de corrente
  g.strokeStyle = 'rgba(15,10,10,0.9)';
  g.lineWidth = 2.5;
  for (let y = 4; y < 128; y += 14) {
    g.beginPath(); g.ellipse(64 + Math.sin(y) * 10, y, 4, 7, 0.5, 0, Math.PI * 2); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildGalSal() {
  const skin = 0xc4a090;
  const face = faceTexture((g) => {
    g.fillStyle = '#c4a090';
    g.fillRect(0, 0, 256, 128);
    // faixa preta nos olhos
    g.fillStyle = '#0c0c0e';
    g.fillRect(0, 48, 256, 24);
    g.strokeStyle = '#2a2a2e'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, 54); g.lineTo(256, 56); g.stroke();
    // sorriso largo com dentes
    g.fillStyle = '#2a1416';
    g.beginPath(); g.moveTo(46, 86); g.quadraticCurveTo(64, 102, 84, 84); g.quadraticCurveTo(64, 92, 46, 86); g.fill();
    g.fillStyle = '#efe8dc';
    g.beginPath(); g.moveTo(49, 87); g.quadraticCurveTo(64, 96, 81, 85); g.quadraticCurveTo(64, 90, 49, 87); g.fill();
    paintMouth(g, { y: 86, w: 0 });
  });
  const rig = buildHumanoid({
    skin, faceTex: face, armTex: chainArm(),
    torso: 0x26231f, sleeveL: skin, sleeveR: skin,
    pants: 0x1c1a18, shoes: skin, width: 0.9, bulk: 0.92, height: 1.0,
  });
  const { joints, sockets, props } = rig;

  // poncho com franjas
  const ponchoMat = toon(0x2c2824, { side: THREE.DoubleSide });
  const poncho = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.38, 0.5, 8, 1, true), ponchoMat);
  poncho.position.y = 0.3;
  poncho.scale.z = 0.72;
  poncho.userData.outline = true;
  joints.sp.add(poncho);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const f = part(new THREE.ConeGeometry(0.03, 0.08, 3), 0x2c2824, { outline: false });
    f.position.set(Math.sin(a) * 0.37, 0.02, Math.cos(a) * 0.27);
    f.rotation.x = Math.PI;
    joints.sp.add(f);
  }
  const collar = part(new THREE.CylinderGeometry(0.09, 0.12, 0.1, 10), 0x1a1816);
  collar.position.y = 0.58;
  joints.sp.add(collar);

  // cabelo longo e liso
  const hairMat = toon(0x0d0d0f);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.168, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat);
  cap.position.y = 0.18;
  cap.scale.set(1.05, 1.1, 1.05);
  cap.userData.outline = true;
  joints.hd.add(cap);
  const curtain = part(new THREE.CylinderGeometry(0.17, 0.2, 0.62, 14, 1, true, Math.PI * 0.26, Math.PI * 1.48), 0x0d0d0f, { mat: toon(0x0d0d0f, { side: THREE.DoubleSide }) });
  curtain.position.y = -0.08;
  joints.hd.add(curtain);
  const band = part(new THREE.TorusGeometry(0.162, 0.018, 4, 22), 0x0c0c0e, { outline: false });
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.15;
  joints.hd.add(band);

  // duas lâminas
  const right = sickleBlade();
  right.rotation.x = -0.3;
  sockets.handR.add(right);
  props.bladeR = right;
  const left = sickleBlade();
  left.rotation.set(-0.3, Math.PI, 0);
  sockets.handL.add(left);
  props.bladeL = left;

  return rig.finish();
}
