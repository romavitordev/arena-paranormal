import * as THREE from 'three';

// Rig humanoide procedural PROVISÓRIO. Os modelos definitivos serão
// adicionados depois; para isso basta entregar um objeto com a mesma
// interface (ver README → "Trocando os modelos"):
//   { root, joints:{hips,sp,hd,sL,eL,sR,eR,lL,kL,lR,kR}, sockets:{handR,handL,back,hip,mouth,chest},
//     hipHeight, props:{nome:Object3D}, showProp(nome,bool), setTint(cor,intensidade) }

let gradient = null;
function toonGradient() {
  if (gradient) return gradient;
  const data = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
  gradient = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
}

export function toon(color, opts = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), ...opts });
}

export function glowMat(color, opacity = 0.9) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}

const OUTLINE_MAT = new THREE.MeshBasicMaterial({ color: 0x0a0a0c, side: THREE.BackSide });

// Cria malha com material toon; `outline` adiciona contorno estilo HQ.
export function part(geo, color, { outline = true, mat, castShadow = true } = {}) {
  const m = new THREE.Mesh(geo, mat || toon(color));
  m.castShadow = castShadow;
  m.userData.outline = outline;
  return m;
}

// Cilindro "membro" que pende para baixo a partir do pivô (y=0 → y=-len)
export function limb(rTop, rBot, len, color, opts) {
  const g = new THREE.CylinderGeometry(rTop, rBot, len, 10);
  g.translate(0, -len / 2, 0);
  return part(g, color, opts);
}

export function addOutlines(root, thickness = 0.022) {
  const list = [];
  root.traverse((o) => {
    if (o.isMesh && o.userData.outline && !o.userData.isOutline) list.push(o);
  });
  for (const m of list) {
    const o = new THREE.Mesh(m.geometry, OUTLINE_MAT);
    o.userData.isOutline = true;
    m.geometry.computeBoundingSphere();
    const r = m.geometry.boundingSphere.radius || 0.1;
    const s = 1 + thickness / Math.max(0.05, r);
    o.scale.setScalar(s);
    o.raycast = () => {};
    m.add(o);
  }
}

// Textura do rosto pintada em canvas. Frente do rosto = centro (64,64) de 256x128.
export function faceTexture(paint) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  paint(g, c);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Utilitário de pintura: olhos básicos
export function paintEyes(g, { y = 62, gap = 15, color = '#1a1412', iris = null, closed = false, brow = '#141010', browTilt = 3 } = {}) {
  for (const s of [-1, 1]) {
    const x = 64 + s * gap;
    if (closed) {
      g.strokeStyle = color; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.stroke();
    } else {
      g.fillStyle = '#f2ece4';
      g.beginPath(); g.ellipse(x, y, 6.5, 3.6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = iris || color;
      g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#000';
      g.beginPath(); g.arc(x, y, 1.4, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = brow; g.lineWidth = 3;
    // ponta interna mais baixa = expressão séria
    g.beginPath(); g.moveTo(x + s * 8, y - 10); g.lineTo(x - s * 7, y - 9 + browTilt); g.stroke();
  }
}

export function paintMouth(g, { y = 88, w = 9, color = '#5a3530', smile = 0 } = {}) {
  g.strokeStyle = color; g.lineWidth = 2;
  g.beginPath(); g.moveTo(64 - w, y); g.quadraticCurveTo(64, y + smile, 64 + w, y); g.stroke();
}

/**
 * Monta o corpo base. Cada personagem decide cores, proporções e o que
 * acrescentar (cabelo, roupa, armas) no próprio arquivo em models/characters.
 */
export function buildHumanoid(o) {
  const {
    skin = 0xc89a7c, torso = 0x333333, pants = 0x2a2a2e, shoes = 0x151515,
    sleeveL = torso, sleeveR = torso, forearmL = skin, forearmR = skin, handL = skin, handR = skin,
    width = 1, bulk = 1, height = 1, noArmL = false, faceTex = null, headColor = skin, belt = null,
  } = o;
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(height);
  root.add(body);
  const hipHeight = 0.95;

  const joints = {};
  const hips = new THREE.Group();
  hips.position.y = hipHeight;
  body.add(hips);
  joints.hips = hips;
  joints.hip = hips; // rotação do quadril

  const pelvis = part(new THREE.CylinderGeometry(0.17 * width, 0.15 * width, 0.2, 10), pants);
  pelvis.position.y = 0.02;
  pelvis.scale.z = 0.75;
  hips.add(pelvis);
  if (belt) {
    const b = part(new THREE.CylinderGeometry(0.175 * width, 0.175 * width, 0.05, 12), belt);
    b.scale.z = 0.76;
    b.position.y = 0.1;
    hips.add(b);
  }

  const sp = new THREE.Group();
  sp.position.y = 0.1;
  hips.add(sp);
  joints.sp = sp;
  const chestGeo = new THREE.CylinderGeometry(0.23 * width * bulk, 0.16 * width, 0.56, 16);
  chestGeo.rotateY(Math.PI); // costura da textura nas costas; frente = centro da textura
  chestGeo.translate(0, 0.28, 0);
  const chest = part(chestGeo, torso, o.torsoTex ? { mat: toon(0xffffff, { map: o.torsoTex }) } : {});
  chest.scale.z = 0.62;
  sp.add(chest);
  const shoulderBar = part(new THREE.SphereGeometry(0.1 * bulk, 10, 8), torso);
  shoulderBar.scale.set(2.6 * width, 1, 1.4);
  shoulderBar.position.y = 0.52;
  sp.add(shoulderBar);

  const neck = part(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), skin, { outline: false });
  neck.position.y = 0.6;
  sp.add(neck);
  const hd = new THREE.Group();
  hd.position.y = 0.63;
  sp.add(hd);
  joints.hd = hd;
  const headMat = faceTex ? toon(0xffffff, { map: faceTex }) : toon(headColor);
  const head = part(new THREE.SphereGeometry(0.155, 24, 16), headColor, { mat: headMat });
  head.scale.set(0.92, 1.1, 0.98);
  head.position.y = 0.16;
  hd.add(head);
  // rosto pintado olha para +Z: a frente da textura (u=0.25) fica em +Z
  head.rotation.y = 0;

  const sockets = {};
  const mkArm = (side) => {
    const s = side === 'L' ? 1 : -1;
    const sh = new THREE.Group();
    sh.rotation.order = 'YXZ';
    sh.position.set(s * 0.25 * width * bulk, 0.5, 0);
    sp.add(sh);
    const el = new THREE.Group();
    el.rotation.order = 'YXZ';
    el.position.y = -0.3;
    sh.add(el);
    const hand = new THREE.Group();
    hand.position.y = -0.3;
    el.add(hand);
    joints['s' + side] = sh;
    joints['e' + side] = el;
    sockets['hand' + side] = hand;
    if (side === 'L' && noArmL) return { sh, el, hand };
    const armMat = o.armTex ? { mat: toon(0xffffff, { map: o.armTex }) } : {};
    const upper = limb(0.07 * bulk, 0.06 * bulk, 0.31, side === 'L' ? sleeveL : sleeveR, o.armTex && o.armTexUpper !== false ? armMat : {});
    sh.add(upper);
    const fore = limb(0.058 * bulk, 0.048 * bulk, 0.29, side === 'L' ? forearmL : forearmR, armMat);
    el.add(fore);
    const fist = part(new THREE.SphereGeometry(0.058 * bulk, 10, 8), side === 'L' ? handL : handR);
    fist.scale.set(1, 1.15, 1.05);
    fist.position.y = -0.04;
    hand.add(fist);
    return { sh, el, hand, upper, fore, fist };
  };
  const armL = mkArm('L');
  const armR = mkArm('R');

  const mkLeg = (side) => {
    const s = side === 'L' ? 1 : -1;
    const hipJ = new THREE.Group();
    hipJ.position.set(s * 0.1 * width, -0.02, 0);
    hips.add(hipJ);
    const thigh = limb(0.085 * bulk, 0.07, 0.45, pants);
    hipJ.add(thigh);
    const knee = new THREE.Group();
    knee.position.y = -0.45;
    hipJ.add(knee);
    const shin = limb(0.066, 0.052, 0.44, pants);
    knee.add(shin);
    const foot = part(new THREE.BoxGeometry(0.1, 0.07, 0.22), shoes);
    foot.position.set(0, -0.45, 0.05);
    knee.add(foot);
    joints['l' + side] = hipJ;
    joints['k' + side] = knee;
    return { hipJ, knee, thigh, shin, foot };
  };
  const legL = mkLeg('L');
  const legR = mkLeg('R');

  const back = new THREE.Group();
  back.position.set(0, 0.35, -0.13);
  sp.add(back);
  sockets.back = back;
  const hipSock = new THREE.Group();
  hipSock.position.set(0.18 * width, 0.02, 0);
  hips.add(hipSock);
  sockets.hip = hipSock;
  const mouth = new THREE.Group();
  mouth.position.set(0, 0.09, 0.15);
  hd.add(mouth);
  sockets.mouth = mouth;
  const chestS = new THREE.Group();
  chestS.position.set(0, 0.35, 0.1);
  sp.add(chestS);
  sockets.chest = chestS;
  sockets.head = hd;

  const props = {};
  const rig = {
    root, body, joints, sockets, hipHeight, props,
    parts: { chest, head, armL, armR, legL, legR, pelvis },
    showProp(name, v) { if (props[name]) props[name].visible = v; },
    finish() {
      addOutlines(root);
      // guarda materiais para efeito de "flash" ao levar dano
      const mats = new Set();
      root.traverse((m) => { if (m.isMesh && m.material && m.material.isMeshToonMaterial) mats.add(m.material); });
      rig._mats = [...mats];
      return rig;
    },
    setTint(color, amount) {
      for (const m of rig._mats || []) {
        if (m.userData.keepEmissive) continue;
        m.emissive.set(color);
        m.emissiveIntensity = amount;
      }
    },
  };
  return rig;
}
