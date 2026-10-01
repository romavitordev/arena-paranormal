import * as THREE from 'three';
import { part, addOutlines } from './rig.js';

// A MARIONETE (invocação do Dante) — referência: "dante marionete.jpg".
// Criatura esquelética de Morte: corpo de varetas escuras, véu cinza-azulado esfarrapado,
// cabeça enfaixada com cabelo preto comprido caindo, braço esquerdo com garra e braço
// direito terminando numa lâmina-foice longa; pernas finas penduradas; cruzeta de marionete
// no alto com fios. Lodo verde-água escorrendo das juntas.
// Retorna { root, joints } para animar em código (sem esqueleto skinned).
const BONE = 0x3a3238;
const CLOTH = 0x4a5868;
const CLOTH_DARK = 0x2a3240;
const WRAP = 0x6a5e5a;
const HAIR = 0x0a080c;
const DRIP = 0x8ad8c0;

function stick(len, r0, r1, color = BONE) {
  const g = new THREE.CylinderGeometry(r1, r0, len, 6);
  g.translate(0, -len / 2, 0); // pende para baixo a partir da junta
  return part(g, color);
}

function tattered(radiusTop, radiusBottom, height, color, seed = 1) {
  const g = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 18, 4, true);
  const pos = g.attributes.position;
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < -height / 2 + 0.01) pos.setY(i, y - rnd() * height * 0.45); // barra rasgada
    pos.setX(i, pos.getX(i) * (0.92 + rnd() * 0.16));
    pos.setZ(i, pos.getZ(i) * (0.92 + rnd() * 0.16));
  }
  g.computeVertexNormals();
  g.translate(0, -height / 2, 0);
  const m = part(g, color);
  m.material.side = THREE.DoubleSide;
  return m;
}

export function buildMarionette() {
  const root = new THREE.Group();
  const body = new THREE.Group(); // tudo que flutua/inclina
  root.add(body);
  const joints = { body };

  // ---- tronco: espinha e costelas de vareta
  const chest = new THREE.Group();
  chest.position.y = 1.75;
  body.add(chest);
  joints.chest = chest;
  const spine = stick(0.9, 0.05, 0.04);
  chest.add(spine);
  for (let i = 0; i < 4; i++) {
    const rib = part(new THREE.TorusGeometry(0.17 - i * 0.02, 0.018, 4, 12, Math.PI * 1.3), BONE);
    rib.rotation.x = Math.PI / 2;
    rib.rotation.z = Math.PI * 0.85;
    rib.position.y = -0.12 - i * 0.12;
    chest.add(rib);
  }
  // véu/vestido esfarrapado
  const dress = tattered(0.22, 0.55, 1.15, CLOTH, 7);
  dress.position.y = -0.2;
  chest.add(dress);
  const overlay = tattered(0.26, 0.42, 0.6, CLOTH_DARK, 3);
  overlay.position.y = 0.02;
  chest.add(overlay);

  // ---- cabeça enfaixada, pendendo para frente, com cabelo preto comprido
  const neck = new THREE.Group();
  neck.position.set(0, 0.12, 0.05);
  neck.rotation.x = 0.55;
  chest.add(neck);
  joints.neck = neck;
  const head = part(new THREE.SphereGeometry(0.17, 12, 10), WRAP);
  head.scale.set(1, 1.15, 1.05);
  head.position.y = 0.16;
  neck.add(head);
  for (let i = 0; i < 4; i++) {
    const band = part(new THREE.TorusGeometry(0.175, 0.022, 4, 14), 0x4a403c);
    band.position.y = 0.06 + i * 0.07;
    band.rotation.x = Math.PI / 2 + (i - 1.5) * 0.25;
    neck.add(band);
  }
  // boca aberta com dentes (de frente)
  const mouth = part(new THREE.BoxGeometry(0.1, 0.05, 0.04), 0x120a0c, { outline: false });
  mouth.position.set(0, 0.08, 0.16);
  neck.add(mouth);
  const hair = new THREE.Group();
  hair.position.set(0, 0.2, -0.02);
  neck.add(hair);
  joints.hair = hair;
  for (let i = 0; i < 9; i++) {
    const a = (i / 8 - 0.5) * 2.2;
    const lock = part(new THREE.PlaneGeometry(0.09, 1.05), HAIR, { outline: false });
    lock.material.side = THREE.DoubleSide;
    lock.geometry.translate(0, -0.52, 0);
    lock.position.set(Math.sin(a) * 0.16, 0, Math.cos(a) * 0.12 + 0.02);
    lock.rotation.set(0.25, a, 0);
    hair.add(lock);
  }

  // ---- braços longos de vareta: esquerdo com garra, direito com lâmina-foice
  const mkArm = (side) => {
    const sh = new THREE.Group();
    sh.position.set(side * 0.24, -0.02, 0);
    chest.add(sh);
    const upper = stick(0.75, 0.035, 0.03);
    sh.add(upper);
    const el = new THREE.Group();
    el.position.y = -0.75;
    sh.add(el);
    const fore = stick(0.8, 0.03, 0.022);
    el.add(fore);
    const hand = new THREE.Group();
    hand.position.y = -0.8;
    el.add(hand);
    // panos amarrados nas juntas
    const wrapC = part(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 6), CLOTH_DARK);
    wrapC.position.y = -0.05;
    el.add(wrapC);
    return { sh, el, hand };
  };
  const L = mkArm(1);
  const R = mkArm(-1);
  joints.armL = L;
  joints.armR = R;
  // garra (3 dedos longos)
  for (let i = 0; i < 3; i++) {
    const f = stick(0.32, 0.018, 0.004);
    f.rotation.z = (i - 1) * 0.35;
    f.rotation.x = 0.4;
    L.hand.add(f);
  }
  // lâmina-foice longa e curva
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, -0.9, 0.35), new THREE.Vector3(-0.15, -1.55, 0.95));
  const blade = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.035, 5, false), new THREE.MeshStandardMaterial({ color: 0x2a2428, roughness: 0.35, metalness: 0.5 }));
  blade.scale.set(1, 1, 1);
  R.hand.add(blade);
  const edge = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.012, 4, false), new THREE.MeshBasicMaterial({ color: 0xbfe8dc }));
  edge.position.z = 0.03;
  R.hand.add(edge);
  joints.blade = blade;

  // ---- pernas finas penduradas
  const legs = [];
  for (const side of [1, -1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.1, -0.85, 0);
    chest.add(hip);
    const thigh = stick(0.6, 0.03, 0.025);
    hip.add(thigh);
    const knee = new THREE.Group();
    knee.position.y = -0.6;
    hip.add(knee);
    knee.add(stick(0.6, 0.025, 0.015));
    legs.push({ hip, knee });
  }
  joints.legs = legs;

  // ---- cruzeta de marionete no alto, com fios até os braços e a cabeça
  const cross = new THREE.Group();
  cross.position.y = 3.6;
  body.add(cross);
  const barA = part(new THREE.BoxGeometry(0.9, 0.05, 0.05), 0x2a1e16);
  const barB = part(new THREE.BoxGeometry(0.05, 0.05, 0.6), 0x2a1e16);
  cross.add(barA, barB);
  joints.cross = cross;
  const strings = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xd8d4cc, transparent: true, opacity: 0.55 }));
  strings.geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6 * 3 * 2), 3));
  body.add(strings);
  joints.strings = strings;

  // ---- lodo verde-água escorrendo das juntas (gotas)
  const drips = [];
  for (const j of [L.el, R.el, neck]) {
    const d = part(new THREE.SphereGeometry(0.03, 6, 4), DRIP, { outline: false });
    d.material.emissive = new THREE.Color(DRIP);
    d.material.emissiveIntensity = 0.5;
    j.add(d);
    drips.push(d);
  }
  joints.drips = drips;

  addOutlines(root, 0.02);
  return { root, joints };
}

// atualiza os fios da cruzeta até mãos e cabeça (coordenadas locais de "body")
const _a = new THREE.Vector3();
export function updateMarionetteStrings(m) {
  const { joints, root } = m;
  const pos = joints.strings.geometry.attributes.position;
  const body = joints.body;
  body.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(body.matrixWorld).invert();
  const top = (x, z) => _a.set(x, 3.6, z);
  const ends = [
    [top(0.45, 0), joints.armL.hand],
    [top(-0.45, 0), joints.armR.hand],
    [top(0, 0.3), joints.neck],
  ];
  let k = 0;
  for (const [t, node] of ends) {
    pos.setXYZ(k++, t.x, t.y, t.z);
    const w = node.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
    pos.setXYZ(k++, w.x, w.y, w.z);
  }
  pos.needsUpdate = true;
  void root;
}
