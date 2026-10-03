import * as THREE from 'three';
import { buildHumanoid, part, faceTexture, paintEyes, paintMouth, toon } from '../rig.js';
import { m4, wraps } from '../weapons.js';

// Kaiser — modelo provisório. Jaqueta branca com capuz, gola alta preta,
// braço direito enfaixado e grande queimadura no lado direito do rosto.
export function buildKaiser() {
  const skin = 0xc49478;
  const face = faceTexture((g) => {
    g.fillStyle = '#c49478';
    g.fillRect(0, 0, 256, 128);
    // Queimadura (lado direito do personagem = esquerda da textura)
    const grd = g.createRadialGradient(46, 64, 4, 46, 64, 34);
    grd.addColorStop(0, '#7a2a1c');
    grd.addColorStop(0.55, '#a04a30');
    grd.addColorStop(1, 'rgba(196,148,120,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(64, 30); g.bezierCurveTo(40, 26, 18, 44, 22, 70);
    g.bezierCurveTo(24, 96, 50, 104, 62, 96); g.bezierCurveTo(58, 80, 66, 60, 64, 30);
    g.fill();
    g.strokeStyle = 'rgba(40,10,8,0.7)';
    g.lineWidth = 1.2;
    for (let i = 0; i < 14; i++) {
      g.beginPath();
      const x = 28 + Math.random() * 32;
      const y = 38 + Math.random() * 52;
      g.moveTo(x, y);
      g.lineTo(x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 14);
      g.stroke();
    }
    paintEyes(g, { color: '#2b2018', browTilt: 4 });
    // olho direito parcialmente marcado pela cicatriz
    g.fillStyle = 'rgba(120,40,30,0.45)';
    g.beginPath(); g.ellipse(49, 62, 9, 6, 0, 0, Math.PI * 2); g.fill();
    paintMouth(g, { y: 88, w: 8, smile: -1 });
    g.fillStyle = 'rgba(60,40,30,0.35)';
    g.fillRect(70, 92, 20, 10); // barba rala
  });

  const rig = buildHumanoid({
    skin, faceTex: face,
    torso: 0xdcdad2, sleeveL: 0xdcdad2, sleeveR: 0xdcdad2,
    forearmL: 0x16161a, forearmR: 0xd9d4c8, handR: 0xd9d4c8,
    pants: 0x2c2c32, shoes: 0x1a1a1a, belt: 0x1a1a1a, bulk: 1.05,
  });
  const { joints, sockets, props } = rig;

  // gola alta preta
  const collar = part(new THREE.CylinderGeometry(0.085, 0.1, 0.12, 12), 0x141416);
  collar.position.y = 0.6;
  joints.sp.add(collar);
  // faixa preta frontal (camiseta de gola alta aparecendo sob a jaqueta aberta)
  const under = part(new THREE.BoxGeometry(0.14, 0.46, 0.05), 0x141416, { outline: false });
  under.position.set(0, 0.3, 0.135);
  joints.sp.add(under);
  // capuz caído
  const hood = part(new THREE.SphereGeometry(0.17, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0xd0cec6);
  hood.scale.set(1.1, 0.7, 0.9);
  hood.rotation.x = -2.0;
  hood.position.set(0, 0.56, -0.12);
  joints.sp.add(hood);
  // faixas no antebraço direito
  const wr = wraps(0.26, 0.055, 0xd9d4c8, false);
  joints.eR.add(wr);
  // alça da arma cruzando o peito
  const strap = part(new THREE.BoxGeometry(0.035, 0.62, 0.02), 0x1a1a1a, { outline: false });
  strap.position.set(0, 0.3, 0.14);
  strap.rotation.z = 0.75;
  joints.sp.add(strap);

  // cabelo preto espetado
  const hairMat = toon(0x121214);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
  cap.position.y = 0.18;
  cap.userData.outline = true;
  joints.hd.add(cap);
  for (let i = 0; i < 11; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 5), hairMat);
    const a = (i / 11) * Math.PI * 2;
    spike.position.set(Math.sin(a) * 0.12, 0.26 + Math.random() * 0.03, Math.cos(a) * 0.11 - 0.02);
    spike.rotation.set(Math.cos(a) * 0.9 + 0.3, 0, -Math.sin(a) * 0.9);
    spike.userData.outline = true;
    joints.hd.add(spike);
  }
  const fringe = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 4), hairMat);
  fringe.position.set(-0.05, 0.25, 0.13);
  fringe.rotation.set(2.4, 0, 0.3);
  joints.hd.add(fringe);

  // M4: nas costas fora de combate à distância, nas mãos ao atirar
  const back = m4();
  back.rotation.set(0, 0, 2.5);
  back.position.set(0, 0, -0.04);
  sockets.back.add(back);
  props.m4Back = back;
  const hand = m4();
  hand.rotation.x = -0.1;
  hand.position.y = -0.03;
  sockets.handR.add(hand);
  hand.visible = false;
  props.m4Hand = hand;
  rig.muzzle = hand.userData.muzzle;

  return rig.finish();
}
