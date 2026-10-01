import * as THREE from 'three';
import { buildHumanoid, part, faceTexture, paintEyes, paintMouth, toon, glowMat } from '../rig.js';
import { sniper, guitarCase, bloodClaw } from '../weapons.js';

// Abutre — modelo provisório. Possui APENAS o braço direito.
// Camisa clara, colete escuro, barba grisalha, rabo de cavalo e a sniper
// guardada num suporte parecido com case de violão nas costas.
export function buildAbutre() {
  const skin = 0xc09a80;
  const face = faceTexture((g) => {
    g.fillStyle = '#c09a80';
    g.fillRect(0, 0, 256, 128);
    paintEyes(g, { color: '#3a4a40', iris: '#4a6a5a', browTilt: 2, brow: '#6a6058' });
    // cicatriz diagonal
    g.strokeStyle = '#7a4a40'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(40, 40); g.lineTo(60, 76); g.stroke();
    // barba grisalha
    g.fillStyle = '#b8b2aa';
    g.beginPath();
    g.moveTo(34, 74); g.quadraticCurveTo(64, 70, 94, 74);
    g.quadraticCurveTo(92, 120, 64, 124); g.quadraticCurveTo(36, 120, 34, 74);
    g.fill();
    g.fillStyle = '#4a3a30';
    g.fillRect(52, 84, 24, 4); // bigode escuro
    paintMouth(g, { y: 94, w: 7, color: '#5a3a35' });
  });

  const rig = buildHumanoid({
    skin, faceTex: face,
    torso: 0x2a2a2c, sleeveR: 0xd8cfb4, forearmR: 0xd8cfb4,
    pants: 0x323234, shoes: 0x1a1816, belt: 0x241c16, noArmL: true, bulk: 1.0,
  });
  const { joints, sockets, props } = rig;

  // gola e mangas da camisa clara sob o colete
  const collar = part(new THREE.CylinderGeometry(0.09, 0.1, 0.08, 10), 0xd8cfb4);
  collar.position.y = 0.58;
  joints.sp.add(collar);
  const shirtFront = part(new THREE.BoxGeometry(0.08, 0.4, 0.04), 0xd8cfb4, { outline: false });
  shirtFront.position.set(0, 0.33, 0.13);
  joints.sp.add(shirtFront);
  const badge = part(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), 0x8a8a90, { outline: false });
  badge.rotation.x = Math.PI / 2;
  badge.position.set(0.09, 0.38, 0.14);
  joints.sp.add(badge);
  // ombro esquerdo: manga vazia dobrada e presa (sem braço). Fica presa ao
  // tronco, não à junta do ombro, para nenhuma animação "mexer" um braço inexistente.
  const stump = part(new THREE.SphereGeometry(0.075, 10, 8), 0xd8cfb4);
  stump.scale.set(1, 1.2, 1);
  stump.position.set(0.25, 0.46, 0);
  joints.sp.add(stump);
  const pinned = part(new THREE.BoxGeometry(0.06, 0.14, 0.04), 0xd8cfb4);
  pinned.position.set(0.25, 0.36, 0.04);
  pinned.rotation.z = 0.3;
  joints.sp.add(pinned);

  // cabelo com rabo de cavalo e mecha grisalha
  const hairMat = toon(0x3a3028);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.163, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat);
  cap.position.y = 0.18;
  cap.userData.outline = true;
  joints.hd.add(cap);
  const streak = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.3), toon(0xc8c4bc));
  streak.position.set(-0.04, 0.33, 0);
  joints.hd.add(streak);
  const tail = part(new THREE.CylinderGeometry(0.035, 0.015, 0.28, 8), 0x3a3028);
  tail.position.set(0, 0.16, -0.2);
  tail.rotation.x = 0.5;
  joints.hd.add(tail);
  const beard = part(new THREE.SphereGeometry(0.1, 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0xb8b2aa);
  beard.scale.set(1.15, 0.9, 0.7);
  beard.position.set(0, 0.07, 0.08);
  joints.hd.add(beard);

  // case de violão com a sniper nas costas
  const kase = guitarCase();
  kase.rotation.z = -0.35;
  kase.position.set(0, -0.05, -0.08);
  sockets.back.add(kase);
  props.case = kase;
  const rifle = sniper();
  rifle.position.y = -0.02;
  sockets.handR.add(rifle);
  rifle.visible = false;
  props.sniperHand = rifle;
  rig.muzzle = rifle.userData.muzzle;

  // Olhos alterados durante o Rebirth
  const eyes = new THREE.Group();
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), glowMat(0xff2a3d, 1));
    e.position.set(s * 0.055, 0.17, 0.145);
    eyes.add(e);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), glowMat(0xff2a3d, 0.35));
    halo.position.copy(e.position);
    eyes.add(halo);
  }
  eyes.visible = false;
  joints.hd.add(eyes);
  props.eyes = eyes;

  // Arma de Sangue: fica oculta até o especial
  const claw = bloodClaw();
  claw.position.y = -0.05;
  joints.eR.add(claw);
  claw.visible = false;
  props.claw = claw;

  return rig.finish();
}
