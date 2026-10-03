import * as THREE from 'three';
import { buildHumanoid, part, faceTexture, paintEyes, paintMouth, toon } from '../rig.js';
import { knife } from '../weapons.js';

// Vampira — modelo provisório. Colete escuro com capuz sobre camisa vermelha,
// braços tatuados, camisa xadrez amarrada na cintura e faca curva na mão direita.
function tattooArm() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#d6a68c';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(30,24,28,0.8)';
  g.lineWidth = 1.5;
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * 128, y = Math.random() * 128;
    g.beginPath(); g.moveTo(x, y);
    g.lineTo(x + (Math.random() > 0.5 ? 16 : 0), y + (Math.random() > 0.5 ? 0 : 16));
    g.stroke();
    if (Math.random() > 0.6) { g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildVampira() {
  const skin = 0xd6a68c;
  const face = faceTexture((g) => {
    g.fillStyle = '#d6a68c';
    g.fillRect(0, 0, 256, 128);
    paintEyes(g, { color: '#1a0e0e', iris: '#5a0a12', browTilt: -1, brow: '#151012' });
    paintMouth(g, { y: 88, w: 10, color: '#4a1a20', smile: 4 });
    g.fillStyle = '#f4f0ea';
    g.fillRect(58, 88, 3, 4); g.fillRect(67, 88, 3, 4); // presinhas
  });
  const rig = buildHumanoid({
    skin, faceTex: face, armTex: tattooArm(),
    torso: 0x3a4448, sleeveL: skin, sleeveR: skin,
    pants: 0x2e3440, shoes: 0x5a2228, width: 0.9, bulk: 0.92, height: 0.97,
  });
  const { joints, sockets, props } = rig;

  // camisa vermelha aparecendo na frente + lenço vermelho
  const shirt = part(new THREE.BoxGeometry(0.17, 0.42, 0.05), 0xa01e24, { outline: false });
  shirt.position.set(0, 0.28, 0.12);
  joints.sp.add(shirt);
  const scarf = part(new THREE.TorusGeometry(0.1, 0.035, 6, 14), 0xa01e24);
  scarf.rotation.x = Math.PI / 2 - 0.25;
  scarf.position.set(0, 0.57, 0.02);
  joints.sp.add(scarf);
  // capuz do colete
  const hood = part(new THREE.SphereGeometry(0.16, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0x343e42);
  hood.scale.set(1.15, 0.7, 0.9);
  hood.rotation.x = -2.1;
  hood.position.set(0, 0.55, -0.12);
  joints.sp.add(hood);
  // camisa xadrez amarrada na cintura
  const plaidC = document.createElement('canvas');
  plaidC.width = plaidC.height = 64;
  const pg = plaidC.getContext('2d');
  pg.fillStyle = '#8a8478'; pg.fillRect(0, 0, 64, 64);
  pg.fillStyle = 'rgba(40,40,46,0.7)';
  for (let i = 0; i < 64; i += 16) { pg.fillRect(i, 0, 6, 64); pg.fillRect(0, i, 64, 6); }
  const plaidT = new THREE.CanvasTexture(plaidC);
  plaidT.wrapS = plaidT.wrapT = THREE.RepeatWrapping;
  plaidT.repeat.set(4, 1);
  const tied = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.24, 14, 1, true), toon(0xffffff, { map: plaidT, side: THREE.DoubleSide }));
  tied.scale.z = 0.78;
  tied.position.y = -0.04;
  tied.userData.outline = true;
  joints.hips.add(tied);
  // livro preso na cintura
  const book = part(new THREE.BoxGeometry(0.04, 0.16, 0.12), 0x5a4a38);
  book.position.set(-0.19, 0.0, 0.02);
  joints.hips.add(book);

  // cabelo curto bagunçado
  const hairMat = toon(0x101216);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
  cap.position.y = 0.17;
  cap.scale.set(1.08, 1.1, 1.05);
  cap.userData.outline = true;
  joints.hd.add(cap);
  for (let i = 0; i < 9; i++) {
    const lock = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.2, 4), hairMat);
    const a = -1.2 + (i / 8) * 2.4;
    lock.position.set(Math.sin(a) * 0.15, 0.17, Math.cos(a) * 0.12);
    lock.rotation.set(2.6 + Math.cos(a) * 0.2, 0, -Math.sin(a) * 0.6);
    lock.userData.outline = true;
    joints.hd.add(lock);
  }
  // brinco de pena
  const feather = part(new THREE.ConeGeometry(0.02, 0.14, 4), 0xc8c0b0, { outline: false });
  feather.position.set(0.15, 0.04, 0);
  feather.rotation.x = Math.PI;
  joints.hd.add(feather);

  // faca curva na mão direita (arma em todos os golpes)
  const blade = knife();
  blade.rotation.x = -0.35;
  sockets.handR.add(blade);
  props.knife = blade;
  // faca reserva que aparece ao arremessar
  const spare = knife();
  spare.visible = false;
  sockets.handR.add(spare);
  props.knifeThrow = spare;

  return rig.finish();
}
