import * as THREE from 'three';
import { taperedTube, bloodSpike, bloodCoat } from './weapons.js';

// ARMADURA DE SANGUE (Juan/Henri — referência "armadura de sangue"): o próprio sangue cresce sobre um LADO do corpo
// como uma carne porosa, cheia de furos (parece coral/veias): espinhos no ombro esquerdo, o braço esquerdo inteiro
// coberto, gavinhas de sangue espalhando pelo peito, a perna esquerda tomada e garras nos pés. Quem CONJURA o ritual
// também tem o braço da faca virando arma: luva de sangue na mão e a lâmina coberta de sangue.
// Cada peça vai direto no osso (os ossos crescem no +Y local, até o filho), então acompanha qualquer pose; os tamanhos
// saem do próprio esqueleto — serve em qualquer personagem (a assistência do Juan dá a armadura ao parceiro).

const v = new THREE.Vector3();
const q = new THREE.Quaternion();
const DOWN = new THREE.Vector3(0, -1, 0);

// carne de sangue porosa: furos por células (Voronoi barato no espaço do objeto) com a borda escura e úmida
function porousMaterial(uniforms, { color = 0x9a1820, holes = 0.34, freq = 30 } = {}) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.05, emissive: 0x3a0006, emissiveIntensity: 0.55, side: THREE.DoubleSide });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uniforms.uTime;
    sh.vertexShader = 'varying vec3 vPor;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vPor = position;');
    sh.fragmentShader = `varying vec3 vPor;
uniform float uTime;
vec3 porHash(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453);
}
` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
  vec3 pp = vPor * ${freq.toFixed(1)} * vec3(1.0, 0.6, 1.0); // furos alongados ao longo do membro
  vec3 ci = floor(pp);
  vec3 cf = fract(pp);
  float md = 9.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 r = g + porHash(ci + g) * 0.8 + 0.1 - cf;
    md = min(md, dot(r, r));
  }
  float d = sqrt(md);
  if (d < ${holes.toFixed(2)}) discard;
  diffuseColor.rgb *= mix(0.25, 1.2, smoothstep(${holes.toFixed(2)}, ${(holes + 0.25).toFixed(2)}, d)); // borda do furo escura`);
  };
  mat.customProgramCacheKey = () => `porousBlood${holes}${freq}`;
  return mat;
}

// manga de carne ao longo de um osso (de 0 até −len no espaço da peça), irregular
function sleeve(len, r0, r1, outer, inner, seed = 1) {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector3(Math.sin(i * 1.7 + seed) * 0.006, -(i / 8) * len, Math.cos(i * 2.3 + seed) * 0.006));
  const curve = new THREE.CatmullRomCurve3(pts);
  const prof = (t) => (r0 + (r1 - r0) * t) * (1 + Math.sin(t * Math.PI) * 0.12 + Math.sin(t * 9 + seed) * 0.04);
  g.add(taperedTube(curve, len, (t) => prof(t) * 0.84, inner, 16, 10)); // carne escura por baixo dos furos
  g.add(taperedTube(curve, len, prof, outer, 24, 16));
  return g;
}

// gavinha fina (veia de sangue) por uma lista de pontos
function tendril(points, r, mat) {
  const curve = new THREE.CatmullRomCurve3(points);
  return taperedTube(curve, 1, (t) => r * (1 - t * 0.7) + 0.003, mat, 18, 6);
}

export function buildBloodArmor(rig, { weaponSide = null, yaw = 0 } = {}) {
  const J = rig.joints || {};
  if (!J.sL || !J.eL || !J.sL.isBone) return null;
  const uniforms = { uTime: { value: 0 } };
  const outer = porousMaterial(uniforms);
  const inner = new THREE.MeshStandardMaterial({ color: 0x2a0306, roughness: 0.45, emissive: 0x1a0003, emissiveIntensity: 0.6 });
  const solid = new THREE.MeshStandardMaterial({ color: 0xa01a22, roughness: 0.25, metalness: 0.05, emissive: 0x4a0008, emissiveIntensity: 0.6 });
  const added = [];
  // direções do personagem no mundo (no momento em que a armadura nasce)
  const UP = new THREE.Vector3(0, 1, 0);
  const LEFT = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const FWD = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const childOf = (bone) => bone.children.find((c) => c.isBone);
  const boneLen = (bone) => { const c = childOf(bone); return c ? c.position.length() : 0.28; };
  // peça presa ao osso; o −Y da peça aponta ao longo do osso (até o filho)
  const along = (bone, obj) => {
    bone.add(obj);
    obj.scale.setScalar(1 / bone.getWorldScale(v).x);
    const c = childOf(bone);
    obj.quaternion.setFromUnitVectors(DOWN, c ? c.position.clone().normalize() : new THREE.Vector3(0, 1, 0));
    added.push(obj);
    return obj;
  };
  // peça presa ao osso com eixos alinhados ao MUNDO no momento (para pôr coisas por cima/por fora/à frente)
  const worldFrame = (bone) => {
    const g = new THREE.Group();
    bone.add(g);
    g.scale.setScalar(1 / bone.getWorldScale(v).x);
    g.quaternion.copy(bone.getWorldQuaternion(q).invert());
    added.push(g);
    return g;
  };
  // espinho/garra (cresce em −Y) apontado para a direção dada no mundo
  const spikeTo = (len, r, dir, mat = solid) => {
    const s = bloodSpike(len, r, 0.04, mat);
    s.quaternion.setFromUnitVectors(DOWN, dir.clone().normalize());
    return s;
  };

  // ---- braço esquerdo inteiro (manga porosa no braço e no antebraço, punho de sangue)
  along(J.sL, sleeve(boneLen(J.sL) + 0.03, 0.078, 0.068, outer, inner, 1));
  const fore = along(J.eL, sleeve(boneLen(J.eL) + 0.02, 0.068, 0.056, outer, inner, 2));
  const fist = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), outer);
  fist.scale.set(1, 1.3, 0.9);
  fist.position.y = -boneLen(J.eL) - 0.05;
  fore.add(fist);

  // ---- ombro esquerdo e peito: massa porosa, espinhos e gavinhas (no osso do peito, que quase não balança)
  const chestBone = (J.sp && childOf(J.sp)) || J.sp;
  if (chestBone) {
    const g = worldFrame(chestBone);
    const origin = chestBone.getWorldPosition(new THREE.Vector3());
    // ombro esquerdo no espaço do personagem (lado/altura em relação ao centro do peito)
    const sh = J.sL.getWorldPosition(new THREE.Vector3()).sub(origin);
    const sx = sh.dot(LEFT);
    const sy = sh.dot(UP);
    const at = (l, u, f) => new THREE.Vector3().addScaledVector(LEFT, sx + l).addScaledVector(UP, sy + u).addScaledVector(FWD, f);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), outer);
    cap.scale.set(1.25, 0.85, 1.1);
    cap.position.copy(at(0.01, 0.02, 0.02));
    g.add(cap);
    const capIn = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), inner);
    capIn.scale.copy(cap.scale);
    capIn.position.copy(cap.position);
    g.add(capIn);
    for (const [len, l, u, f] of [[0.3, 0.3, 1, 0.1], [0.24, 0.6, 0.8, -0.2], [0.2, 0.9, 0.5, 0.2], [0.26, 0.15, 1, -0.4], [0.17, 0.8, 0.3, -0.5], [0.2, 0.5, 0.9, 0.5]]) {
      const s = spikeTo(len, 0.034, LEFT.clone().multiplyScalar(l).addScaledVector(UP, u).addScaledVector(FWD, f));
      s.position.copy(at(0.03, 0.04, 0.02 + f * 0.05));
      g.add(s);
    }
    // placa no peito esquerdo e veias de sangue descendo pelo tronco
    const plate = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), outer);
    plate.scale.set(1.0, 1.3, 0.4);
    plate.position.copy(at(-0.07, -0.12, 0.085));
    g.add(plate);
    // veias coladas na frente do tronco (profundidade ~ a pele do peito), descendo e cruzando para a direita
    for (const pts of [
      [[-0.06, -0.08, 0.11], [-0.13, -0.13, 0.12], [-0.2, -0.17, 0.12], [-0.26, -0.24, 0.11]],
      [[-0.07, -0.18, 0.11], [-0.1, -0.28, 0.12], [-0.12, -0.38, 0.115], [-0.1, -0.47, 0.11]],
      [[-0.02, -0.16, 0.09], [-0.02, -0.28, 0.1], [-0.04, -0.4, 0.105], [-0.06, -0.52, 0.1]],
      [[-0.09, -0.05, 0.1], [-0.17, -0.06, 0.115], [-0.24, -0.09, 0.11]],
      [[-0.09, -0.24, 0.115], [-0.17, -0.31, 0.12], [-0.21, -0.4, 0.115]],
    ]) g.add(tendril(pts.map(([l, u, f]) => at(l, u, f)), 0.012, solid));
  }

  // ---- perna esquerda tomada; garras nos dois pés
  if (J.lL && J.kL) {
    along(J.lL, sleeve(boneLen(J.lL) + 0.02, 0.118, 0.095, outer, inner, 3)); // por cima da calça
    along(J.kL, sleeve(boneLen(J.kL), 0.092, 0.07, outer, inner, 4));
  }
  for (const side of ['L', 'R']) {
    const knee = J['k' + side];
    const foot = knee && childOf(knee);
    if (!foot) continue;
    const g = worldFrame(foot);
    const heel = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), side === 'L' ? outer : solid);
    heel.scale.set(1, 0.6, 1.5);
    heel.position.copy(FWD).multiplyScalar(0.04).addScaledVector(UP, -0.02);
    g.add(heel);
    for (const s of [-1, 0, 1]) {
      const dir = FWD.clone().addScaledVector(LEFT, s * 0.35).addScaledVector(UP, -0.25);
      const c = spikeTo(0.15, 0.02, dir);
      c.position.copy(FWD).multiplyScalar(0.1).addScaledVector(LEFT, s * 0.035).addScaledVector(UP, -0.03);
      g.add(c);
    }
  }

  // ---- quem conjura: o braço da faca vira arma (luva de sangue no antebraço e na mão + lâmina com sangue)
  let uncoat = null;
  const elbow = weaponSide && J['e' + weaponSide];
  if (elbow) {
    const len = boneLen(elbow);
    const glove = new THREE.Group();
    const cuff = sleeve(len * 0.55, 0.05, 0.054, outer, inner, 5);
    cuff.position.y = -len * 0.45;
    glove.add(cuff);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), solid);
    hand.scale.set(1, 1.25, 0.8);
    hand.position.y = -len - 0.035;
    glove.add(hand);
    along(elbow, glove);
    const coats = Object.values(rig.props || {}).filter((p) => p && p.traverse).map((p) => bloodCoat(p)); // a faca (mesmo guardada)
    uncoat = () => coats.forEach((u) => u());
  }

  return {
    update(dt) {
      uniforms.uTime.value += dt;
      outer.emissiveIntensity = 0.45 + Math.sin(uniforms.uTime.value * 2.6) * 0.15;
    },
    remove() {
      for (const o of added) {
        if (o.parent) o.parent.remove(o);
        o.traverse((m) => { if (m.geometry) m.geometry.dispose(); });
      }
      if (uncoat) uncoat();
      outer.dispose();
      inner.dispose();
      solid.dispose();
    },
  };
}
