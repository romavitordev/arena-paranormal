import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { toon } from './rig.js';
import { MATERIAL_TEXTURES } from './textures.js';

// Rig a partir de um .glb feito no Blender (tools/blender/char_*.py).
// O esqueleto usa os MESMOS nomes de junta do rig procedural, então o Animator
// e todo o combate funcionam igual. A diferença é que aqui as juntas são ossos
// com orientação própria: aplicamos a rotação "no espaço do mundo de repouso",
//   local = inverso(repouso do pai) × rotação da pose × repouso do osso
// para que as mesmas poses sirvam para os dois tipos de rig.

const loader = new GLTFLoader();
const cache = new Map();

// PELE: a luz colorida do cenário (o roxo das Ruínas) deixava as peles morenas rosadas. Na pele, a luz muda o
// BRILHO mas quase não muda o TOM: o resultado é puxado para a cor da própria pele com a mesma luminância (70%).
// O brilho do dano (emissive) é somado depois, sem ser tingido.
const SKIN_KEEP = 0.7;
const SKIN_CODE = `{
  vec3 litK = outgoingLight - totalEmissiveRadiance;
  float lumO = dot(litK, vec3(0.299, 0.587, 0.114));
  float lumA = max(dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)), 1e-4);
  outgoingLight = mix(litK, diffuseColor.rgb * (lumO / lumA), ${SKIN_KEEP.toFixed(2)}) + totalEmissiveRadiance;
}
`;
function keepSkinHue(m) {
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', SKIN_CODE + '#include <opaque_fragment>');
  };
  m.customProgramCacheKey = () => 'skinKeep';
}

export function loadGLB(url) {
  if (!cache.has(url)) {
    cache.set(url, new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject)));
  }
  return cache.get(url);
}

const JOINT_ORDER = { sL: 'YXZ', eL: 'YXZ', sR: 'YXZ', eR: 'YXZ' };
const POSE_JOINTS = ['hip', 'sp', 'hd', 'sL', 'eL', 'sR', 'eR', 'lL', 'kL', 'lR', 'kR'];
const BONE_OF = { hip: 'hips' };

// Contorno estilo HQ que acompanha a deformação do esqueleto
function outlineMaterial(thickness) {
  const m = new THREE.MeshBasicMaterial({ color: 0x0a0a0c, side: THREE.BackSide });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <skinning_vertex>',
      `#include <skinning_vertex>
      #ifdef USE_SKINNING
        transformed += normalize( objectNormal ) * ${thickness.toFixed(4)};
      #endif`,
    );
  };
  return m;
}

export function rigFromGLB(gltf, { scale = 1, outline = 0.012 } = {}) {
  const body = SkeletonUtils.clone(gltf.scene);
  const root = new THREE.Group();
  root.add(body);
  body.scale.setScalar(scale);
  root.updateMatrixWorld(true);

  const joints = {};
  for (const name of ['hips', 'sp', 'hd', 'sL', 'eL', 'sR', 'eR', 'lL', 'kL', 'lR', 'kR']) {
    const b = body.getObjectByName(name);
    if (!b) throw new Error(`Osso ausente no .glb: ${name}`);
    joints[name] = b;
  }
  joints.hip = joints.hips;
  // V4 etapa 12: ossos extras (root, chest, neck, handL/R, footL/R). Ainda não recebem pose (seguem o pai);
  // servem de ponto de encaixe — armas presas no osso da MÃO, mochila/capa no PEITO. .glb antigos funcionam sem eles.
  const extra = {};
  body.traverse((o) => { if (o.isBone && ['root', 'chest', 'neck', 'handL', 'handR', 'footL', 'footR'].includes(o.name)) extra[o.name] = o; });

  // dados de repouso
  const rest = {};
  for (const [name, b] of Object.entries(joints)) {
    const wq = b.getWorldQuaternion(new THREE.Quaternion());
    const pq = b.parent.getWorldQuaternion(new THREE.Quaternion());
    rest[name] = { A: pq.clone().invert(), B: wq, pos: b.position.clone() };
  }
  // ossos extras: repouso (para o pescoço e os pés automáticos)
  const extraRest = {};
  for (const [name, b] of Object.entries(extra)) {
    extraRest[name] = { A: b.parent.getWorldQuaternion(new THREE.Quaternion()).invert(), B: b.getWorldQuaternion(new THREE.Quaternion()), local: b.quaternion.clone() };
  }
  const rootRestQ = root.getWorldQuaternion(new THREE.Quaternion());
  // altura do tornozelo em repouso (pé apoiado no chão)
  const ankleRestY = extra.footL ? extra.footL.getWorldPosition(new THREE.Vector3()).y - root.getWorldPosition(new THREE.Vector3()).y : 0;
  const hipsParentQ = joints.hips.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  const hipsParentScale = joints.hips.parent.getWorldScale(new THREE.Vector3());
  const upLocal = new THREE.Vector3(0, 1, 0).applyQuaternion(hipsParentQ).divide(hipsParentScale);

  // materiais → toon (mantendo cor/textura) + texturas pintadas pelo nome
  const mats = new Set();
  const convert = new Map();
  const meshes = [];
  body.traverse((o) => {
    if (!o.isMesh) return;
    meshes.push(o);
    o.castShadow = true;
    o.frustumCulled = false;
    const src = o.material;
    if (!convert.has(src)) {
      // nomes vêm como MAT_<CATEGORIA>_<nome> (V4); a textura é procurada pelo nome curto
      const key = src.name.replace(/^MAT_[A-Z]+_/, '');
      let tex = MATERIAL_TEXTURES[key] ? MATERIAL_TEXTURES[key]() : null;
      let emissiveMap = null;
      let texEmissive = null;
      if (tex && !tex.isTexture) {
        emissiveMap = tex.emissiveMap || null;
        texEmissive = tex.emissive ?? null;
        tex = tex.map;
      }
      // o glTF usa UV com origem no topo: texturas de canvas não podem ser invertidas
      for (const t of [tex, emissiveMap]) {
        if (t) { t.flipY = false; t.needsUpdate = true; }
      }
      const emissive = src.emissive && (src.emissive.r + src.emissive.g + src.emissive.b) > 0.01;
      const m = toon(tex ? 0xffffff : src.color, {
        map: tex || src.map || null,
        emissive: emissive ? src.emissive : new THREE.Color(texEmissive ?? 0),
        emissiveIntensity: emissive ? (src.emissiveIntensity || 1) * 1.5 : emissiveMap ? 1 : 0,
        emissiveMap,
        transparent: src.transparent,
        opacity: src.opacity,
        side: src.side,
      });
      m.name = src.name;
      if (/^MAT_SKIN_/.test(src.name)) keepSkinHue(m);
      if (emissive) m.userData.glow = true;
      if (emissiveMap) m.userData.baseEmissive = { color: new THREE.Color(texEmissive), intensity: 1 };
      convert.set(src, m);
    }
    o.material = convert.get(src);
    // a geometria e as texturas vêm do .glb carregado UMA vez e são as mesmas em todas as cópias do personagem
    // (lutadores, palco da seleção, retratos): quem descarta uma cena não pode liberá-las (ver World.dispose)
    o.userData.sharedGeometry = true;
    o.material.userData.sharedMap = true;
    if (!o.material.userData.glow) mats.add(o.material);
  });
  // contornos
  const oMat = outlineMaterial(outline);
  for (const o of meshes) {
    if (!o.isSkinnedMesh || o.material.userData.glow) continue;
    const ol = new THREE.SkinnedMesh(o.geometry, oMat);
    ol.bind(o.skeleton, o.bindMatrix);
    ol.frustumCulled = false;
    ol.userData.isOutline = true;
    ol.userData.sharedGeometry = true;
    ol.raycast = () => {};
    o.parent.add(ol);
    o.userData.outlineMesh = ol;
  }

  // props vindos do Blender (objetos com nome prop_*). Um objeto com vários
  // materiais vira um grupo com várias malhas: registra só o objeto de cima,
  // para esconder/mostrar a peça inteira de uma vez.
  const props = {};
  body.traverse((o) => {
    if (!o.name.startsWith('prop_')) return;
    if (o.parent && o.parent.name.startsWith('prop_')) return;
    props[o.name.slice(5).replace(/_\d+$/, '')] = o;
  });

  // sockets alinhados ao mundo em repouso (mesma convenção do rig procedural)
  const wp = (name) => joints[name].getWorldPosition(new THREE.Vector3());
  const makeSocket = (bone, worldPos) => {
    const s = new THREE.Object3D();
    bone.add(s);
    s.position.copy(bone.worldToLocal(worldPos.clone()));
    s.quaternion.copy(bone.getWorldQuaternion(new THREE.Quaternion()).invert());
    s.scale.setScalar(1 / bone.getWorldScale(new THREE.Vector3()).x);
    return s;
  };
  const H = (wp('hd').y - wp('hips').y) / 0.73; // altura relativa ao padrão
  const sockets = {
    handR: makeSocket(extra.handR || joints.eR, wp('eR').add(new THREE.Vector3(0, -0.3 * H, 0))),
    handL: makeSocket(extra.handL || joints.eL, wp('eL').add(new THREE.Vector3(0, -0.3 * H, 0))),
    back: makeSocket(extra.chest || joints.sp, wp('sp').add(new THREE.Vector3(0, 0.35 * H, -0.13 * H))),
    chest: makeSocket(extra.chest || joints.sp, wp('sp').add(new THREE.Vector3(0, 0.35 * H, 0.1 * H))),
    mouth: makeSocket(joints.hd, wp('hd').add(new THREE.Vector3(0, 0.09 * H, 0.15 * H))),
    hip: makeSocket(joints.hips, wp('hips').add(new THREE.Vector3(0.18 * H, 0.02 * H, 0))),
    head: makeSocket(joints.hd, wp('hd')),
  };

  const qE = new THREE.Quaternion();
  const eul = new THREE.Euler();
  const qN = new THREE.Quaternion();
  const qI = new THREE.Quaternion();
  const qT = new THREE.Quaternion();
  const qP = new THREE.Quaternion();
  const vF = new THREE.Vector3();
  const vR = new THREE.Vector3();
  const vU = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);
  const H0 = H; // altura relativa do personagem
  const hipsRestInv = rest.hips.B.clone().invert();
  const NECK_SHARE = 0.4; // parte da rotação da cabeça que vai para o pescoço
  const FOOT_MAX = Math.PI / 4; // o pé "assenta" no chão até 45°
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // V4: movimento secundário automático dos ossos extras —
  //  pescoço: divide a rotação da cabeça (a cabeça não gira "solta" sobre o pescoço);
  //  tornozelos: com o pé perto do chão e o corpo em pé, o pé fica plano no chão em vez de inclinar com a canela.
  function secondary(p) {
    if (extra.neck) {
      const r = rest.hd;
      const n = extraRest.neck;
      eul.set(p.hd[0], p.hd[1], p.hd[2], 'XYZ');
      qE.setFromEuler(eul);
      qN.copy(qI.identity()).slerp(qE, NECK_SHARE);
      extra.neck.quaternion.copy(n.A).multiply(qN).multiply(n.B);
      qT.copy(qN).invert().multiply(qE); // o resto fica na cabeça
      joints.hd.quaternion.copy(r.A).multiply(qT).multiply(r.B);
    }
    if (!extra.footL && !extra.footR) return;
    root.updateMatrixWorld(true);
    const rootQ = root.getWorldQuaternion(qP);
    const baseY = root.getWorldPosition(vR).y;
    // contato com o chão: se a pose afunda um pé no piso, o quadril sobe o necessário (só no chão e em pé)
    if (rig.groundLock && extra.footL && extra.footR) {
      const low = Math.min(extra.footL.getWorldPosition(vF).y, extra.footR.getWorldPosition(vU).y) - baseY;
      const sink = (ankleRestY - low) / root.scale.y;
      if (sink > 0.002) {
        joints.hips.position.addScaledVector(upLocal, sink);
        root.updateMatrixWorld(true);
      }
    }
    // corpo em pé? (o "para cima" do quadril perto do vertical)
    // rotação atual do quadril em relação ao repouso, no espaço do personagem
    qT.copy(rootQ).invert().multiply(joints.hips.getWorldQuaternion(qN)).multiply(hipsRestInv);
    const upright = sstep(0.75, 0.95, vU.copy(UP).applyQuaternion(qT).y);
    for (const s of ['footL', 'footR']) {
      const b = extra[s];
      if (!b) continue;
      const e = extraRest[s];
      b.quaternion.copy(e.local);
      const rel = (b.getWorldPosition(vF).y - baseY) / H0;
      const w = upright * sstep(0.3, 0.08, rel);
      if (w <= 0.001) continue;
      // orientação de repouso do pé, só girada com o personagem
      qT.copy(rootQ).multiply(qN.copy(rootRestQ).invert()).multiply(e.B);
      const parentQ = b.parent.getWorldQuaternion(new THREE.Quaternion());
      qT.premultiply(parentQ.invert()); // → local
      const ang = e.local.angleTo(qT);
      const k = ang > FOOT_MAX ? FOOT_MAX / ang : 1;
      b.quaternion.copy(e.local).slerp(qT, w * k);
    }
  }
  const rig = {
    root, body, joints, sockets, props, bones: extra,
    autoSecondary: true, // pescoço/tornozelos automáticos (false = ossos extras parados)
    groundLock: false, // o Fighter liga quando está no chão: pés não afundam no piso
    hipHeight: rest.hips.pos.y,
    skinned: true,
    // prende um objeto numa junta com a orientação de repouso do mundo
    attach(jointName, obj) {
      const s = makeSocket(joints[jointName], wp(jointName));
      s.add(obj);
      return s;
    },
    showProp(name, v) {
      const p = props[name];
      if (!p) return;
      p.visible = v;
      p.traverse((o) => { if (o.userData.outlineMesh) o.userData.outlineMesh.visible = v; });
    },
    applyPose(p) {
      joints.hips.position.copy(rest.hips.pos).addScaledVector(upLocal, p.h);
      for (const j of POSE_JOINTS) {
        const bone = joints[BONE_OF[j] || j];
        const r = rest[BONE_OF[j] || j];
        const v = p[j];
        eul.set(v[0], v[1], v[2], JOINT_ORDER[j] || 'XYZ');
        qE.setFromEuler(eul);
        bone.quaternion.copy(r.A).multiply(qE).multiply(r.B);
      }
      if (rig.autoSecondary) secondary(p);
      else for (const [n, b] of Object.entries(extra)) b.quaternion.copy(extraRest[n].local);
    },
    finish() {
      rig._mats = [...mats];
      // materiais adicionados por props em código também recebem o "flash" de dano
      root.traverse((m) => { if (m.isMesh && m.material && m.material.isMeshToonMaterial && !m.material.userData.glow) mats.add(m.material); });
      rig._mats = [...mats];
      return rig;
    },
    setTint(color, amount) {
      for (const m of rig._mats || []) {
        if (m.userData.keepEmissive) continue;
        // materiais com brilho próprio (sigilos) voltam ao brilho base sem tinta
        if (m.userData.baseEmissive && amount <= 0) {
          m.emissive.copy(m.userData.baseEmissive.color);
          m.emissiveIntensity = m.userData.baseEmissive.intensity;
          continue;
        }
        m.emissive.set(color);
        m.emissiveIntensity = amount;
      }
    },
  };
  return rig;
}
