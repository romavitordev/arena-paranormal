import * as THREE from 'three';
import { part, toon, glowMat } from './rig.js';

// Armas PROVISÓRIAS. Convenção: empunhadura na origem, lâmina/cano apontando
// para -Y local (continuação do braço) e "topo" da arma em +Z local.

function bladeShape(len, width, curve, tipBack = 0.3) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.quadraticCurveTo(-width / 2 + curve, -len * 0.55, curve * 1.6, -len);
  s.quadraticCurveTo(width / 2 + curve * (1 - tipBack), -len * 0.5, width / 2, 0);
  s.lineTo(-width / 2, 0);
  return s;
}

function extrude(shape, depth = 0.012) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 12 });
  g.translate(0, 0, -depth / 2);
  return g;
}

export function katana() {
  const g = new THREE.Group();
  const grip = part(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 8), 0x7a1010);
  grip.position.y = 0.06;
  g.add(grip);
  const tsuba = part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 14), 0x222222);
  tsuba.position.y = -0.08;
  g.add(tsuba);
  const blade = part(extrude(bladeShape(0.82, 0.035, 0.03, 0.6), 0.008), 0xdfe4ea, { mat: toon(0xdfe4ea, { emissive: 0x202830 }) });
  blade.position.y = -0.085;
  blade.rotation.y = Math.PI / 2;
  g.add(blade);
  g.userData.tipLength = 0.92;
  return g;
}

export function scabbard() {
  const g = new THREE.Group();
  const s = part(new THREE.CylinderGeometry(0.025, 0.02, 0.85, 8), 0x141012);
  s.position.y = -0.42;
  g.add(s);
  const ring = part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), 0x7a1010);
  g.add(ring);
  return g;
}

// Karambit vermelha do Kaiser: lâmina curva em garra e anel no cabo
export function karambit() {
  const g = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.016, 0.016, 0.1, 8), 0x1a1a1c);
  handle.position.y = 0.02;
  g.add(handle);
  const ring = part(new THREE.TorusGeometry(0.026, 0.007, 6, 14), 0x8a8a90);
  ring.position.y = 0.09;
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  const blade = part(extrude(bladeShape(0.18, 0.035, 0.09, 0.15), 0.008), 0xb0141e, { mat: toon(0xb0141e, { emissive: 0x2a0004 }) });
  blade.position.y = -0.03;
  blade.rotation.y = Math.PI / 2;
  g.add(blade);
  return g;
}

export function knife() {
  const g = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.018, 0.016, 0.12, 8), 0x2a1a14);
  handle.position.y = 0.02;
  g.add(handle);
  for (let i = 0; i < 3; i++) {
    const bead = part(new THREE.SphereGeometry(0.012, 6, 5), 0xa01020, { outline: false });
    bead.position.set(0.02, 0.05 - i * 0.03, 0);
    g.add(bead);
  }
  const blade = part(extrude(bladeShape(0.24, 0.04, 0.07, 0.2), 0.008), 0xd8d8d8, { mat: toon(0xd8d8d8, { emissive: 0x221111 }) });
  blade.position.y = -0.04;
  blade.rotation.y = Math.PI / 2;
  g.add(blade);
  return g;
}

// Lâmina longa curva do Injustiça (arco dos dois lados, empunhadura com aro dourado)
export function sickleBlade() {
  const g = new THREE.Group();
  const ring = part(new THREE.TorusGeometry(0.06, 0.012, 6, 16), 0xc9a24a, { mat: toon(0xc9a24a, { emissive: 0x3a2a08 }) });
  ring.rotation.y = Math.PI / 2;
  ring.position.set(0, 0, 0.04);
  g.add(ring);
  const grip = part(new THREE.CylinderGeometry(0.016, 0.016, 0.14, 8), 0xb08a3a);
  g.add(grip);
  const bladeMat = toon(0x5b544a, { emissive: 0x15120c });
  const lower = part(extrude(bladeShape(0.62, 0.05, 0.12, 0.4), 0.01), 0, { mat: bladeMat });
  lower.position.y = -0.07;
  lower.rotation.y = Math.PI / 2;
  g.add(lower);
  const upper = part(extrude(bladeShape(0.45, 0.045, 0.1, 0.4), 0.01), 0, { mat: bladeMat });
  upper.position.y = 0.07;
  upper.rotation.set(Math.PI, Math.PI / 2, 0);
  g.add(upper);
  return g;
}

export function m4() {
  const g = new THREE.Group();
  const dark = 0x1d1f22;
  const recv = part(new THREE.BoxGeometry(0.06, 0.32, 0.09), dark);
  recv.position.y = -0.08;
  g.add(recv);
  const guard = part(new THREE.BoxGeometry(0.055, 0.24, 0.065), 0x2b2e33);
  guard.position.set(0, -0.36, 0.005);
  g.add(guard);
  const barrel = part(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6), dark);
  barrel.position.y = -0.58;
  g.add(barrel);
  const stock = part(new THREE.BoxGeometry(0.05, 0.22, 0.07), dark);
  stock.position.set(0, 0.17, -0.01);
  g.add(stock);
  const mag = part(new THREE.BoxGeometry(0.04, 0.06, 0.14), dark);
  mag.position.set(0, -0.15, -0.1);
  mag.rotation.x = 0.25;
  g.add(mag);
  const sight = part(new THREE.BoxGeometry(0.03, 0.08, 0.04), 0x111111);
  sight.position.set(0, -0.12, 0.065);
  g.add(sight);
  const muzzle = new THREE.Object3D();
  muzzle.position.y = -0.7;
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

export function sniper() {
  const g = new THREE.Group();
  const wood = 0x3a2a1e;
  const metal = 0x1c1c1e;
  const body = part(new THREE.BoxGeometry(0.06, 0.5, 0.08), wood);
  body.position.y = -0.1;
  g.add(body);
  const barrel = part(new THREE.CylinderGeometry(0.014, 0.016, 0.7, 8), metal);
  barrel.position.y = -0.68;
  g.add(barrel);
  const scope = part(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 10), metal);
  scope.position.set(0, -0.15, 0.08);
  g.add(scope);
  const stock = part(new THREE.BoxGeometry(0.05, 0.25, 0.11), wood);
  stock.position.set(0, 0.25, -0.02);
  g.add(stock);
  const muzzle = new THREE.Object3D();
  muzzle.position.y = -1.04;
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

// SNIPER FANTASMA (Kemi): rifle preto de cano longo com silenciador, luneta, todo enrolado em faixas claras com
// pontas soltas penduradas. drip: na forma Fantasma o cano pinga lodo preto. Mesma orientação do sniper(): cano em -Y.
export function sniperFantasma({ drip = false } = {}) {
  const g = new THREE.Group();
  const black = 0x161618;
  const band = 0xd8ccb0;
  const body = part(new THREE.BoxGeometry(0.06, 0.55, 0.085), black);
  body.position.y = -0.1;
  g.add(body);
  const stock = part(new THREE.BoxGeometry(0.05, 0.28, 0.12), black);
  stock.position.set(0, 0.28, -0.02);
  g.add(stock);
  const grip = part(new THREE.BoxGeometry(0.035, 0.1, 0.05), black);
  grip.position.set(0, 0.06, -0.07);
  grip.rotation.x = 0.4;
  g.add(grip);
  const barrel = part(new THREE.CylinderGeometry(0.014, 0.016, 0.8, 8), black);
  barrel.position.y = -0.75;
  g.add(barrel);
  const silencer = part(new THREE.CylinderGeometry(0.026, 0.026, 0.2, 10), 0x0c0c0e);
  silencer.position.y = -1.2;
  g.add(silencer);
  const scope = part(new THREE.CylinderGeometry(0.026, 0.03, 0.32, 10), black);
  scope.position.set(0, -0.16, 0.085);
  g.add(scope);
  // faixas enroladas: no corpo, na luneta e no cano (com duas pontas soltas penduradas)
  for (const [y, r, z] of [[0.2, 0.072, -0.02], [-0.02, 0.066, 0], [-0.2, 0.066, 0], [-0.1, 0.034, 0.085], [-0.25, 0.034, 0.085], [-0.55, 0.022, 0], [-0.85, 0.022, 0]]) {
    const w = part(new THREE.CylinderGeometry(r, r, 0.045, 10, 1, true), band, { mat: toon(band, { side: THREE.DoubleSide }) });
    w.position.set(0, y, z);
    w.rotation.x = 0.12;
    g.add(w);
  }
  for (const [y, len] of [[-0.55, 0.32], [-0.02, 0.24]]) {
    const strip = part(new THREE.PlaneGeometry(0.035, len), band, { mat: toon(band, { side: THREE.DoubleSide }) });
    strip.position.set(0.01, y - 0.02, -0.04 - len / 2);
    strip.rotation.x = Math.PI / 2 - 0.25;
    g.add(strip);
  }
  if (drip) {
    // lodo preto escorrendo do cano
    const lodo = toon(0x050406, { emissive: 0x0a0508 });
    for (const [y, l] of [[-1.28, 0.14], [-1.12, 0.09], [-0.9, 0.11]]) {
      const d = part(new THREE.CylinderGeometry(0.008, 0.016, l, 6), 0x050406, { mat: lodo });
      d.position.set(0, y, -0.03 - l / 2);
      d.rotation.x = Math.PI / 2;
      g.add(d);
      const drop = part(new THREE.SphereGeometry(0.016, 6, 4), 0x050406, { mat: lodo });
      drop.position.set(0, y, -0.035 - l);
      g.add(drop);
    }
  }
  const muzzle = new THREE.Object3D();
  muzzle.position.y = -1.32;
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

// Suporte nas costas semelhante a um case de violão
export function guitarCase() {
  const g = new THREE.Group();
  const c = 0x17171a;
  const lower = part(new THREE.SphereGeometry(0.2, 14, 10), c);
  lower.scale.set(1, 1.15, 0.45);
  lower.position.y = -0.32;
  g.add(lower);
  const upper = part(new THREE.SphereGeometry(0.16, 14, 10), c);
  upper.scale.set(1, 1.1, 0.45);
  upper.position.y = 0.0;
  g.add(upper);
  const neck = part(new THREE.BoxGeometry(0.12, 0.55, 0.1), c);
  neck.position.y = 0.38;
  g.add(neck);
  const head = part(new THREE.BoxGeometry(0.15, 0.16, 0.11), c);
  head.position.y = 0.72;
  g.add(head);
  const strap = part(new THREE.BoxGeometry(0.03, 0.75, 0.02), 0x2a2018, { outline: false });
  strap.position.set(0.0, 0.05, 0.11);
  strap.rotation.z = 0.7;
  g.add(strap);
  return g;
}

// textura de sangue: vermelho escuro com feixes claros escorrendo no comprimento e veias quase pretas
let bloodTex = null;
function bloodTexture() {
  if (bloodTex) return bloodTex;
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 128, 0);
  grd.addColorStop(0, '#4a0008'); grd.addColorStop(0.5, '#8a0418'); grd.addColorStop(1, '#4a0008');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 256);
  const streak = (color, w, n) => {
    g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      let x = Math.random() * 128;
      g.beginPath(); g.moveTo(x, -10);
      for (let y = 0; y <= 266; y += 22) { x += (Math.random() - 0.5) * 14; g.lineTo(x, y); }
      g.stroke();
    }
  };
  streak('rgba(30,0,4,0.8)', 5, 7); // veias escuras
  streak('rgba(200,16,48,0.85)', 3, 9); // feixes claros
  streak('rgba(255,90,110,0.7)', 1.2, 6); // brilho molhado
  bloodTex = new THREE.CanvasTexture(c);
  bloodTex.colorSpace = THREE.SRGBColorSpace;
  bloodTex.wrapS = bloodTex.wrapT = THREE.RepeatWrapping;
  return bloodTex;
}
function bloodMaterial() {
  // sangue molhado: brilho especular + um pouco de luz própria
  const m = new THREE.MeshStandardMaterial({ map: bloodTexture(), color: 0xffffff, roughness: 0.22, metalness: 0.15, emissive: 0x3a0008, emissiveIntensity: 0.9 });
  m.userData.keepEmissive = true;
  return m;
}

// Reveste uma arma com SANGUE: troca o material de cada peça pelo mesmo sangue molhado da Arma de Sangue do Arthur
// (textura de sangue, reflexo úmido, luz própria fraca). Retorna a função que devolve os materiais originais.
export function bloodCoat(root) {
  const mat = bloodMaterial();
  const saved = [];
  root.traverse((o) => {
    if (!o.isMesh || o.userData.isOutline || o.material === mat) return;
    if (o.material && o.material.side === THREE.BackSide) return; // contorno preto fica
    saved.push([o, o.material]);
    o.material = mat;
  });
  return () => {
    for (const [o, m] of saved) o.material = m;
    mat.map && mat.map.dispose();
    mat.dispose();
  };
}

// tubo ao longo de uma curva que vai afinando (r(t) = raio no ponto t de 0 a 1)
function taperedTube(curve, len, r, mat, seg = 24, radial = 7) {
  const geo = new THREE.TubeGeometry(curve, seg, 1, radial, false);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = Math.floor(i / (radial + 1)) / seg;
    const p = curve.getPointAt(Math.min(1, t));
    v.sub(p).multiplyScalar(r(t)).add(p);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.userData.outline = true;
  return m;
}

// feixe retorcido de sangue girando em volta do eixo -Y
function bloodStrand(len, r0, r1, turns, offset, phase, mat, wobble = 0.35) {
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const a = phase + t * turns * Math.PI * 2;
    const rr = offset * (1 + Math.sin(t * Math.PI * 3 + phase) * wobble);
    pts.push(new THREE.Vector3(Math.cos(a) * rr, -t * len, Math.sin(a) * rr));
  }
  return taperedTube(new THREE.CatmullRomCurve3(pts), len, (t) => r0 + (r1 - r0) * t, mat);
}

// espinho/garra de sangue curvado
function bloodSpike(len, r, bend, mat) {
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pts.push(new THREE.Vector3(Math.sin(t * 1.2) * bend, -t * len, 0));
  }
  return taperedTube(new THREE.CatmullRomCurve3(pts), len, (t) => r * (1 - t) ** 1.3 + 0.002, mat, 12, 6);
}

/**
 * Arma de Sangue (especial do Arthur): um BRAÇO inteiro de sangue que nasce do toco do ombro esquerdo.
 * Feixes retorcidos formam o braço; a mão termina em garras longas e espinhos que se abrem.
 * Retorna { upper, fore }: upper vai na junta do ombro (sL), fore na do cotovelo (eL).
 * Espaço local: braço para baixo = -Y, frente do personagem = +Z.
 */
export function bloodArm(upperLen = 0.32, foreLen = 0.3) {
  const mat = bloodMaterial();
  const upper = new THREE.Group();
  const fore = new THREE.Group();
  // ombro: massa de sangue que cobre o toco
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), mat);
  cap.scale.set(1.1, 0.9, 1.05);
  cap.userData.outline = true;
  upper.add(cap);
  // braço: núcleo + feixes retorcidos
  // braço musculoso: núcleo grosso (bíceps mais largo no meio) + feixes retorcidos por fora
  const bicep = (t) => 0.08 + Math.sin(t * Math.PI) * 0.025 - t * 0.012;
  const core = (len, fn) => {
    const pts = [];
    for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector3(0, -(i / 8) * len, 0));
    return taperedTube(new THREE.CatmullRomCurve3(pts), len, fn, mat, 16, 10);
  };
  upper.add(core(upperLen + 0.04, bicep));
  for (let i = 0; i < 8; i++) upper.add(bloodStrand(upperLen + 0.05, 0.034, 0.026, 0.3 + (i % 3) * 0.12, 0.07, (i / 8) * Math.PI * 2, mat, 0.25));
  // antebraço: largo perto do cotovelo, afina no punho
  fore.add(core(foreLen + 0.02, (t) => 0.078 + Math.sin(t * Math.PI * 0.8) * 0.018 - t * 0.03));
  for (let i = 0; i < 9; i++) fore.add(bloodStrand(foreLen + 0.03, 0.032, 0.022, -0.35 - (i % 2) * 0.15, 0.064, (i / 9) * Math.PI * 2 + 0.3, mat, 0.25));
  // mão: massa no punho
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), mat);
  hand.scale.set(1.05, 1.3, 0.85);
  hand.position.y = -foreLen - 0.04;
  hand.userData.outline = true;
  fore.add(hand);
  // garras: 5 dedos longos e curvos, abertos para frente
  for (let i = 0; i < 5; i++) {
    const s = bloodSpike(0.32 + (i === 2 ? 0.08 : 0), 0.028, 0.08, mat);
    s.position.set((i - 2) * 0.034, -foreLen - 0.1, 0.02);
    s.rotation.set(-0.25 - Math.abs(i - 2) * 0.05, -Math.PI / 2, (i - 2) * 0.16);
    fore.add(s);
  }
  // espinhos longos que se abrem do antebraço e da mão (como chamas de sangue)
  const spikes = [
    [0.55, 0.62, 0.5, 0.25], [0.7, 0.7, 0.15, -0.1], [0.5, 0.7, -0.35, 0.3], [0.45, 0.58, 0.9, -0.2],
    [0.6, 0.78, -0.7, 0.15], [0.38, 0.55, -1.2, 0.35], [0.42, 0.74, 1.4, -0.3],
  ];
  for (const [len, at, yaw, tilt] of spikes) {
    const s = bloodSpike(len * 1.15, 0.04, 0.14, mat);
    s.position.set(Math.sin(yaw) * 0.05, -foreLen * at, Math.cos(yaw) * 0.05);
    s.rotation.set(0.6 + tilt, yaw, 0.3);
    fore.add(s);
  }
  // fios soltos saindo do braço (sangue vivo)
  for (let i = 0; i < 5; i++) {
    const s = bloodSpike(0.18, 0.015, 0.06, mat);
    s.position.set(0, -upperLen * (0.3 + i * 0.15), 0);
    s.rotation.set(0.9 + (i % 3) * 0.2, (i / 5) * Math.PI * 2, 0.4);
    upper.add(s);
  }
  // aura de brilho tênue
  const glowU = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, upperLen, 10, 1, true), glowMat(0xff1030, 0.14));
  glowU.position.y = -upperLen / 2;
  upper.add(glowU);
  const glowF = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, foreLen + 0.15, 10, 1, true), glowMat(0xff1030, 0.14));
  glowF.position.y = -(foreLen + 0.15) / 2;
  fore.add(glowF);
  return { upper, fore };
}

// Arma de Sangue antiga (garra no antebraço) — usada só no modelo procedural de reserva
export function bloodClaw() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.32, 10), glowMat(0xff1030, 0.55));
  core.position.y = -0.15;
  g.add(core);
  const clawMat = toon(0x9b0010, { emissive: 0xff1020, emissiveIntensity: 0.9 });
  for (let i = -1; i <= 1; i++) {
    const shape = bladeShape(0.55, 0.05, 0.12, 0.5);
    const talon = new THREE.Mesh(extrude(shape, 0.02), clawMat);
    talon.position.set(i * 0.045, -0.3, 0.02);
    talon.rotation.set(0.2, Math.PI / 2, i * 0.18);
    talon.userData.outline = true;
    g.add(talon);
  }
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), glowMat(0xff2244, 0.35));
  shell.scale.set(1, 1.8, 1);
  shell.position.y = -0.2;
  g.add(shell);
  return g;
}

// Machado do Mutilador: cabo de madeira marrom e lâmina vermelha levemente triangular
export function mutilatorAxe() {
  const g = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.022, 0.028, 0.72, 8), 0x6a4428);
  handle.position.y = -0.22;
  g.add(handle);
  const grip = part(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), 0x2a1a10, { outline: false });
  grip.position.y = 0.06;
  g.add(grip);
  // cabeça: lâmina vermelha (cânone) desenhada no plano XY e girada para a frente (+X do desenho → +Z)
  const head = new THREE.Group();
  head.rotation.y = -Math.PI / 2;
  head.position.y = -0.5;
  g.add(head);
  const shape = new THREE.Shape();
  shape.moveTo(0.02, 0.06);
  shape.lineTo(0.17, 0.12);
  shape.quadraticCurveTo(0.215, 0, 0.17, -0.12);
  shape.lineTo(0.02, -0.06);
  shape.lineTo(0.02, 0.06);
  const blade = part(extrude(shape, 0.016), 0xb01818, { mat: toon(0xb01818, { emissive: 0x200000 }) });
  head.add(blade);
  // fio de aço: faixa curva que segue o gume e encosta na lâmina (antes era uma caixa solta do outro lado)
  const bit = new THREE.Shape();
  bit.moveTo(0.17, 0.12);
  bit.quadraticCurveTo(0.215, 0, 0.17, -0.12);
  bit.lineTo(0.205, -0.135);
  bit.quadraticCurveTo(0.255, 0, 0.205, 0.135);
  bit.lineTo(0.17, 0.12);
  const edge = part(extrude(bit, 0.01), 0xc8c4c0, { mat: toon(0xc8c4c0) });
  head.add(edge);
  // olho de ferro que prende a lâmina no cabo + contrapeso atrás
  const eye = part(new THREE.BoxGeometry(0.07, 0.15, 0.06), 0x2e2a2a);
  head.add(eye);
  const poll = part(new THREE.BoxGeometry(0.05, 0.08, 0.05), 0x2e2a2a);
  poll.position.x = -0.05;
  head.add(poll);
  // manchas de sangue escuro na lâmina
  for (const [x, y, r] of [[0.1, 0.03, 0.022], [0.14, -0.06, 0.016], [0.07, -0.03, 0.012]]) {
    for (const sz of [1, -1]) {
      const spot = part(new THREE.CircleGeometry(r, 8), 0x4a0408, { outline: false });
      spot.position.set(x, y, sz * 0.0125);
      if (sz < 0) spot.rotation.y = Math.PI;
      head.add(spot);
    }
  }
  return g;
}

// A Antena (Labirinto): cabo de ferro enrolado em arame, parabólica no topo e varetas espetadas.
// Empunhada no meio do cabo: a parabólica fica para cima/frente (-Y é a ponta de baixo, a "lança").
export function antenna() {
  const g = new THREE.Group();
  const iron = 0x4a4a4e;
  const pole = part(new THREE.CylinderGeometry(0.022, 0.026, 2.0, 8), iron);
  pole.position.y = -0.1;
  g.add(pole);
  // arame enrolado no cabo
  for (let i = 0; i < 14; i++) {
    const r = part(new THREE.TorusGeometry(0.028, 0.006, 4, 10), 0x6a6a70, { outline: false });
    r.rotation.x = Math.PI / 2 + 0.3;
    r.position.y = -0.7 + i * 0.09;
    g.add(r);
  }
  const head = new THREE.Group();
  head.position.y = -1.0; // na pose de luta o -Y do soquete aponta para cima: a parabólica fica no alto
  const dish = part(new THREE.SphereGeometry(0.21, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), 0x9a9a98, { mat: toon(0x9a9a98, { side: THREE.DoubleSide }) });
  dish.rotation.x = Math.PI * 1.4;
  dish.position.z = 0.08;
  head.add(dish);
  const feed = part(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 5), iron);
  feed.rotation.x = Math.PI / 2;
  feed.position.z = 0.24;
  head.add(feed);
  // varetas espetadas em volta (como raios)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const rod = part(new THREE.CylinderGeometry(0.006, 0.006, 0.36, 4), 0x5a5a60, { outline: false });
    rod.position.set(Math.cos(a) * 0.12, 0.12, Math.sin(a) * 0.12);
    rod.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1);
    head.add(rod);
  }
  g.add(head);
  // ponta de baixo (lança)
  const tip = part(new THREE.ConeGeometry(0.035, 0.22, 6), 0x6a6a70);
  tip.position.y = 0.9; // ponta de lança na outra extremidade
  g.add(tip);
  return g;
}

// Taco de baseball do Xande: madeira, fita na empunhadura, arame farpado e corrente até o braço
export function barbedBat() {
  const g = new THREE.Group();
  const wood = part(new THREE.CylinderGeometry(0.052, 0.024, 0.86, 10), 0x7a4a26);
  wood.position.y = -0.38;
  g.add(wood);
  const tape = part(new THREE.CylinderGeometry(0.027, 0.027, 0.22, 8), 0xd8d4c8);
  tape.position.y = 0.06;
  g.add(tape);
  for (let i = 0; i < 9; i++) {
    const w = part(new THREE.TorusGeometry(0.045 - i * 0.002, 0.005, 4, 10), 0x9a9aa0, { outline: false });
    w.rotation.x = Math.PI / 2 + (i % 2 ? 0.4 : -0.4);
    w.position.y = -0.7 + i * 0.065;
    g.add(w);
    // farpas
    const sp = part(new THREE.ConeGeometry(0.008, 0.035, 3), 0x9a9aa0, { outline: false });
    sp.position.set(Math.cos(i * 2.1) * 0.05, -0.7 + i * 0.065, Math.sin(i * 2.1) * 0.05);
    sp.rotation.z = Math.cos(i * 2.1) * -1.4;
    g.add(sp);
  }
  return g;
}

// LEONORA (Lírio): marreta de madeira enorme. Cabeça em forma de tambor (eixo em Z: as faces batem para a
// frente/trás do golpe), cintas de ferro, duas fileiras de espinhos de madeira em volta e a PATA dourada nas
// duas faces (como na arte). Cabo comprido com empunhadura de couro e colar de ferro. Feita para parecer pesada.
export function leonora() {
  const g = new THREE.Group();
  const woodDark = 0x6a4224;
  const woodHead = 0x8a5a32;
  const iron = 0x3a3a40;
  // cabo: da ponta de baixo (pomo, +Y) até a cabeça (-Y)
  const handle = part(new THREE.CylinderGeometry(0.03, 0.036, 1.06, 10), woodDark);
  handle.position.y = -0.33;
  g.add(handle);
  const grip = part(new THREE.CylinderGeometry(0.038, 0.038, 0.3, 10), 0x3e2614);
  grip.position.y = 0.02;
  g.add(grip);
  for (let i = 0; i < 6; i++) {
    const wrapRing = part(new THREE.TorusGeometry(0.039, 0.005, 4, 10), 0x2a180a, { outline: false });
    wrapRing.rotation.x = Math.PI / 2 + 0.35;
    wrapRing.position.y = -0.1 + i * 0.05;
    g.add(wrapRing);
  }
  const pommel = part(new THREE.CylinderGeometry(0.045, 0.04, 0.05, 10), iron);
  pommel.position.y = 0.2;
  g.add(pommel);
  const collar = part(new THREE.CylinderGeometry(0.046, 0.04, 0.12, 10), iron);
  collar.position.y = -0.72;
  g.add(collar);
  // cabeça (tambor)
  const head = new THREE.Group();
  head.position.y = -0.88;
  g.add(head);
  const R = 0.19;
  const L = 0.42;
  const drum = part(new THREE.CylinderGeometry(R, R, L, 18), woodHead);
  drum.rotation.x = Math.PI / 2; // eixo do tambor em Z
  head.add(drum);
  // anéis da madeira nas faces (discos um pouco mais escuros)
  for (const z of [L / 2 + 0.002, -L / 2 - 0.002]) {
    const face = part(new THREE.CircleGeometry(R * 0.96, 18), 0x7a4c28, { outline: false });
    face.position.z = z;
    if (z < 0) face.rotation.y = Math.PI;
    head.add(face);
    for (const rr of [0.11, 0.06]) {
      const ring = part(new THREE.RingGeometry(rr, rr + 0.006, 18), 0x5a361a, { outline: false });
      ring.position.z = z + Math.sign(z) * 0.001;
      if (z < 0) ring.rotation.y = Math.PI;
      head.add(ring);
    }
  }
  // cintas de ferro nas bordas
  for (const z of [L / 2 - 0.03, -L / 2 + 0.03]) {
    const band = part(new THREE.TorusGeometry(R + 0.004, 0.014, 6, 22), iron);
    band.position.z = z;
    head.add(band);
  }
  // espinhos de madeira em volta (duas fileiras alternadas)
  for (let row = 0; row < 2; row++) {
    const z = row ? 0.07 : -0.07;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + (row ? Math.PI / 12 : 0);
      const len = 0.12 + ((i * 7 + row * 3) % 5) * 0.012;
      const spike = part(new THREE.ConeGeometry(0.016, len, 5), 0xd2b07a);
      spike.position.set(Math.cos(a) * (R + len / 2 - 0.01), Math.sin(a) * (R + len / 2 - 0.01), z);
      spike.rotation.z = a - Math.PI / 2;
      head.add(spike);
    }
  }
  // PATA dourada nas duas faces: almofada + 4 dedos
  for (const sz of [1, -1]) {
    const paw = new THREE.Group();
    paw.position.z = sz * (L / 2 + 0.012);
    if (sz < 0) paw.rotation.y = Math.PI;
    const pad = part(new THREE.SphereGeometry(0.055, 12, 8), 0xd0a640, { mat: toon(0xd0a640, { emissive: 0x2a1a00 }) });
    pad.scale.set(1.15, 0.9, 0.25);
    pad.position.y = -0.025;
    paw.add(pad);
    for (const [x, y] of [[-0.062, 0.035], [-0.024, 0.07], [0.024, 0.07], [0.062, 0.035]]) {
      const toe = part(new THREE.SphereGeometry(0.024, 10, 6), 0xd0a640, { mat: toon(0xd0a640, { emissive: 0x2a1a00 }) });
      toe.scale.set(0.9, 1.15, 0.3);
      toe.position.set(x, y, 0);
      paw.add(toe);
    }
    head.add(paw);
  }
  g.userData.head = head; // ponto de impacto (poeira/faíscas) e onde a maldição de Sangue se enrosca
  return g;
}

// MAGNUM: revólver grande (o .38 da Kemi) de cano longo, preto com cabo de madeira
export function magnum() {
  const g = new THREE.Group();
  const grip = part(new THREE.BoxGeometry(0.03, 0.11, 0.045), 0x5a3a22);
  grip.position.set(0, 0.03, -0.01);
  grip.rotation.x = 0.25;
  g.add(grip);
  const frame = part(new THREE.BoxGeometry(0.03, 0.06, 0.07), 0x1c1c20);
  frame.position.set(0, -0.04, 0.02);
  g.add(frame);
  const drum = part(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 6), 0x2a2a30);
  drum.rotation.x = Math.PI / 2;
  drum.position.set(0, -0.05, 0.05);
  g.add(drum);
  const barrel = part(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 8), 0x1c1c20);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, -0.045, 0.17);
  g.add(barrel);
  return g;
}

// ESPADA CONSUMIDORA (Ferreiro): lâmina enorme e larga, cabo vermelho com pedras pretas; arma amaldiçoada.
// Empunhada no cabo (origem); a lâmina segue para -Y, o fio virado para +Z.
export function espadaConsumidora() {
  const g = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.03, 0.032, 0.38, 10), 0x8a1418);
  handle.position.y = 0.06;
  g.add(handle);
  for (const y of [0.18, 0.1, 0.02, -0.06]) {
    const stone = part(new THREE.OctahedronGeometry(0.022), 0x0a0a0c, { mat: toon(0x0a0a0c, { emissive: 0x150818 }) });
    stone.position.set(0, y, 0.03);
    g.add(stone);
  }
  const pommel = part(new THREE.SphereGeometry(0.04, 10, 8), 0x2a2a2e);
  pommel.position.y = 0.27;
  g.add(pommel);
  const guard = part(new THREE.BoxGeometry(0.06, 0.05, 0.32), 0x3a3a40);
  guard.position.y = -0.14;
  g.add(guard);
  const shape = new THREE.Shape();
  shape.moveTo(-0.09, 0);
  shape.lineTo(-0.1, -1.05);
  shape.lineTo(0, -1.3);
  shape.lineTo(0.1, -1.05);
  shape.lineTo(0.09, 0);
  shape.lineTo(-0.09, 0);
  const blade = part(extrude(shape, 0.022), 0x8a8c94, { mat: toon(0x8a8c94) });
  blade.rotation.y = -Math.PI / 2; // fio para a frente (+Z)
  blade.position.y = -0.16;
  g.add(blade);
  // sulco escuro no meio da lâmina
  const fuller = part(new THREE.BoxGeometry(0.03, 0.85, 0.03), 0x3a3a42, { outline: false });
  fuller.position.set(0, -0.62, 0);
  g.add(fuller);
  return g;
}

// FACA PREDADORA (Juan): faca bonita com a lâmina toda em ondas (como um kris), cabo escuro com anel de metal.
export function facaPredadora() {
  const g = new THREE.Group();
  const grip = part(new THREE.CylinderGeometry(0.02, 0.022, 0.12, 8), 0x2a1a1a);
  grip.position.y = 0.04;
  g.add(grip);
  const ring = part(new THREE.TorusGeometry(0.024, 0.006, 5, 10), 0xb8b8c0, { outline: false });
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.02;
  g.add(ring);
  // lâmina ondulada: contorno senoidal
  const s = new THREE.Shape();
  const len = 0.3;
  const N = 14;
  s.moveTo(-0.022, 0);
  for (let i = 1; i <= N; i++) { const t = i / N; s.lineTo(-0.022 * (1 - t * 0.85) + Math.sin(t * Math.PI * 5) * 0.01, -len * t); }
  for (let i = N; i >= 0; i--) { const t = i / N; s.lineTo(0.022 * (1 - t * 0.85) + Math.sin(t * Math.PI * 5) * 0.01, -len * t); }
  const blade = part(extrude(s, 0.006), 0xc8c8d0, { mat: toon(0xc8c8d0) });
  blade.rotation.y = -Math.PI / 2;
  blade.position.y = -0.03;
  g.add(blade);
  return g;
}

// Skate Caótico (na mão esquerda do Xande)
export function chaosSkate() {
  const g = new THREE.Group();
  const deck = part(new THREE.BoxGeometry(0.03, 0.78, 0.22), 0xe8bc22);
  deck.position.y = -0.3;
  g.add(deck);
  for (const y of [-0.04, -0.56]) for (const z of [-0.08, 0.08]) {
    const wh = part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8), 0x3a3a3a);
    wh.rotation.z = Math.PI / 2;
    wh.position.set(-0.045, y, z);
    g.add(wh);
    const spike = part(new THREE.ConeGeometry(0.012, 0.05, 4), 0xb8b8c0, { outline: false });
    spike.rotation.z = Math.PI / 2;
    spike.position.set(-0.085, y, z);
    g.add(spike);
  }
  const sig = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.62), glowMat(0x5aff6a, 0.4));
  sig.rotation.y = -Math.PI / 2;
  sig.position.set(-0.017, -0.3, 0);
  g.add(sig);
  return g;
}

// Escopeta calibre 12 da Erin (com um desenho na lateral)
export function shotgun() {
  const g = new THREE.Group();
  const stock = part(new THREE.BoxGeometry(0.05, 0.3, 0.1), 0x5a3a24);
  stock.position.set(0, 0.22, -0.02);
  g.add(stock);
  const body = part(new THREE.BoxGeometry(0.055, 0.22, 0.08), 0x232326);
  body.position.y = -0.04;
  g.add(body);
  const sticker = part(new THREE.PlaneGeometry(0.12, 0.05), 0xff3050, { outline: false });
  sticker.position.set(0.029, -0.04, 0);
  sticker.rotation.y = Math.PI / 2;
  g.add(sticker);
  const barrel = part(new THREE.CylinderGeometry(0.02, 0.02, 0.56, 8), 0x1c1c1e);
  barrel.position.set(0, -0.42, 0.015);
  g.add(barrel);
  const pump = part(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), 0x5a3a24);
  pump.position.set(0, -0.3, -0.02);
  g.add(pump);
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, -0.72, 0.015);
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

// Granada de mão (a que aparece na mão antes de arremessar)
export function handGrenade(color = 0xff3050) {
  const g = new THREE.Group();
  const body = part(new THREE.SphereGeometry(0.07, 10, 8), 0x3a4a2a);
  body.scale.set(1, 1.2, 1);
  body.position.y = -0.08;
  g.add(body);
  const band = part(new THREE.TorusGeometry(0.07, 0.014, 6, 12), color, { outline: false });
  band.rotation.x = Math.PI / 2;
  band.position.y = -0.08;
  g.add(band);
  const cap = part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), 0x8a8a90);
  cap.position.y = 0.0;
  g.add(cap);
  return g;
}

// Faixas (bandagens) enroladas em um membro: anéis claros + pontas soltas
export function wraps(len, radius, color = 0xd9d4c8, loose = true) {
  const g = new THREE.Group();
  const mat = toon(color);
  const n = Math.round(len / 0.035);
  for (let i = 0; i < n; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 4, 12), mat);
    r.rotation.x = Math.PI / 2 + (i % 2 ? 0.18 : -0.18);
    r.position.y = -i * 0.035;
    g.add(r);
  }
  if (loose) {
    for (const dx of [-0.02, 0.025]) {
      const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.22), new THREE.MeshToonMaterial({ color, side: THREE.DoubleSide }));
      tail.position.set(dx, -len - 0.08, -radius);
      tail.rotation.x = 0.15;
      g.add(tail);
    }
  }
  return g;
}
