import * as THREE from 'three';
import { buildHumanoid, part, faceTexture, toon } from '../rig.js';
import { katana, scabbard } from '../weapons.js';

// Mascarado — modelo provisório. Casaco escuro com detalhes vermelhos,
// máscara clara com fendas nos olhos e marca em X, katana como arma principal.
export function buildMascarado() {
  const skin = 0xd0a888;
  const face = faceTexture((g) => {
    g.fillStyle = '#d0a888';
    g.fillRect(0, 0, 256, 128);
  });

  const rig = buildHumanoid({
    skin, faceTex: face,
    torso: 0x2b2a2e, sleeveL: 0x2b2a2e, sleeveR: 0x2b2a2e, forearmL: 0x222124, forearmR: 0x222124,
    handL: 0x141414, handR: 0x141414, pants: 0x3a3a3e, shoes: 0x18181a, belt: 0x6a1010, width: 0.96,
  });
  const { joints, sockets, props } = rig;

  // máscara
  const maskTex = faceTexture((g) => {
    g.fillStyle = '#e8e2d6';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#0c0c0e';
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(64 + s * 6, 60); g.lineTo(64 + s * 24, 54); g.lineTo(64 + s * 22, 64); g.closePath();
      g.fill();
    }
    g.strokeStyle = '#8a1018'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(70, 72); g.lineTo(86, 88); g.moveTo(86, 72); g.lineTo(70, 88); g.stroke();
    g.strokeStyle = '#8a1018'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(64, 36); g.lineTo(64, 50); g.stroke();
    g.strokeStyle = '#2a2420'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(54, 94); g.lineTo(74, 94); g.stroke();
  });
  const mask = new THREE.Mesh(
    new THREE.SphereGeometry(0.162, 20, 14, Math.PI * 0.05, Math.PI * 0.9, Math.PI * 0.22, Math.PI * 0.55),
    toon(0xffffff, { map: maskTex }),
  );
  // a fatia da esfera (phi 0.05π..0.95π) já fica de frente (+Z); a textura
  // é desenhada centrada em x=64, então metade da largura cobre a fatia.
  maskTex.repeat.x = 0.5;
  mask.scale.set(0.95, 1.12, 1.02);
  mask.position.y = 0.16;
  mask.userData.outline = true;
  joints.hd.add(mask);
  const cord = part(new THREE.TorusGeometry(0.155, 0.008, 4, 20), 0x8a1018, { outline: false });
  cord.rotation.x = Math.PI / 2;
  cord.position.y = 0.2;
  joints.hd.add(cord);

  // cabelo preto em franja reta
  const hairMat = toon(0x0e0e10);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.168, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), hairMat);
  cap.position.y = 0.18;
  cap.scale.set(1, 1.15, 1);
  cap.userData.outline = true;
  joints.hd.add(cap);
  const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 0.06), hairMat);
  fringe.position.set(0, 0.29, 0.12);
  fringe.rotation.x = 0.3;
  joints.hd.add(fringe);

  // casaco longo com barra vermelha
  const red = 0x8a1018;
  const skirt = part(new THREE.CylinderGeometry(0.2, 0.3, 0.6, 14, 1, true), 0x262529, { mat: toon(0x262529, { side: THREE.DoubleSide }) });
  skirt.position.y = -0.24;
  skirt.scale.z = 0.8;
  joints.hips.add(skirt);
  const hem = part(new THREE.TorusGeometry(0.3, 0.012, 4, 24), red, { outline: false });
  hem.rotation.x = Math.PI / 2;
  hem.scale.y = 0.8;
  hem.position.y = -0.54;
  joints.hips.add(hem);
  for (const s of [-1, 1]) {
    const lapel = part(new THREE.BoxGeometry(0.03, 0.5, 0.02), red, { outline: false });
    lapel.position.set(s * 0.07, 0.3, 0.14);
    lapel.rotation.z = s * 0.15;
    joints.sp.add(lapel);
  }
  for (let i = 0; i < 4; i++) {
    const frog = part(new THREE.BoxGeometry(0.12, 0.012, 0.01), red, { outline: false });
    frog.position.set(0, 0.18 + i * 0.09, 0.142);
    joints.sp.add(frog);
  }
  // braçadeiras escuras
  for (const e of [joints.eL, joints.eR]) {
    const band = part(new THREE.CylinderGeometry(0.06, 0.055, 0.12, 8), 0x101012);
    band.position.y = -0.2;
    e.add(band);
  }

  addMascaradoProps(rig);
  return rig.finish();
}

// Armas (usadas tanto pelo modelo procedural quanto pelo modelo do Blender)
export function addMascaradoProps(rig) {
  const { sockets, props } = rig;
  // katana sempre na mão (arma principal) e bainha na cintura
  const sheath = scabbard();
  sheath.rotation.set(0.9, 0, 0.35);
  sockets.hip.add(sheath);
  props.scabbard = sheath;
  const blade = katana();
  blade.rotation.x = -0.45;
  sockets.handR.add(blade);
  props.katana = blade;
  // máscara puxada para o lado começa escondida (o lutador decide qual mostrar)
  if (props.maskSide) rig.showProp('maskSide', false);
}
