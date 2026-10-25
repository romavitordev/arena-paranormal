// REDIRECIONAMENTO de animações do Quaternius "Universal Animation Library" (CC0 — quaternius.com) para o esqueleto do
// jogo (as juntas de anim/clips.js: h, hip, sp, hd, sL/eL, sR/eR, lL/kL, lR/kR).
//   node tools/anim/retarget-ual.mjs <UAL1_Standard.glb> <UAL1_Standard_RM.glb>  → src/anim/ualClips.js
// O pacote em si NÃO vai para o repositório (baixar de quaternius.itch.io → "Universal Animation Library[Standard].zip").
//
// Como o jogo aplica a pose (models/glbRig.js applyPose): osso = inverso(repouso do pai) × qE × repouso do osso, ou
// seja, qE é o giro do osso RELATIVO ao giro do pai, no espaço de repouso do mundo. Então, para cada quadro:
//   D_src(osso) = mundo_src(t) × inverso(mundo_src_repouso)        (quanto o osso girou desde a pose T da fonte)
//   D_jogo(osso) = D_src × C                                         (C leva o repouso do jogo — braços para baixo —
//                                                                     à pose T da fonte; mantém a torção do braço)
//   qE(osso) = inverso(D_jogo(pai)) × D_jogo(osso)  → ângulos de Euler na ordem da junta (braços YXZ, resto XYZ)
//   h = (altura da pélvis − altura de repouso) × (quadril do jogo / pélvis da fonte)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';

const [, , SRC, SRC_RM] = process.argv;
if (!SRC) { console.error('uso: node tools/anim/retarget-ual.mjs <UAL1_Standard.glb> [UAL1_Standard_RM.glb]'); process.exit(1); }
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// ---------------------------------------------------------------- leitura do .glb (só nós e animações)
function readGLB(file) {
  const b = fs.readFileSync(file);
  const jsonLen = b.readUInt32LE(12);
  const json = JSON.parse(b.slice(20, 20 + jsonLen).toString());
  const binStart = 20 + jsonLen + 8;
  const bin = b.slice(binStart, binStart + b.readUInt32LE(20 + jsonLen));
  const acc = (i) => {
    const a = json.accessors[i];
    const v = json.bufferViews[a.bufferView];
    const n = { SCALAR: 1, VEC3: 3, VEC4: 4 }[a.type];
    const off = (v.byteOffset || 0) + (a.byteOffset || 0);
    if (a.componentType !== 5126) throw new Error('só float');
    const stride = v.byteStride || n * 4;
    const out = [];
    for (let k = 0; k < a.count; k++) {
      const row = [];
      for (let c = 0; c < n; c++) row.push(bin.readFloatLE(off + k * stride + c * 4));
      out.push(n === 1 ? row[0] : row);
    }
    return out;
  };
  const parent = {};
  json.nodes.forEach((n, i) => (n.children || []).forEach((c) => { parent[c] = i; }));
  return { json, acc, parent };
}

// pose de repouso dos nós (TRS do arquivo)
function restTRS(g) {
  return g.json.nodes.map((n) => ({
    t: new THREE.Vector3(...(n.translation || [0, 0, 0])),
    r: new THREE.Quaternion(...(n.rotation || [0, 0, 0, 1])),
    s: new THREE.Vector3(...(n.scale || [1, 1, 1])),
  }));
}

// mundo de cada nó a partir das TRS locais
function worldOf(g, trs) {
  const W = [];
  const get = (i) => {
    if (W[i]) return W[i];
    const m = new THREE.Matrix4().compose(trs[i].t, trs[i].r, trs[i].s);
    const p = g.parent[i];
    W[i] = p === undefined ? m : get(p).clone().multiply(m);
    return W[i];
  };
  g.json.nodes.forEach((_, i) => get(i));
  return W.map((m) => {
    const pos = new THREE.Vector3(); const q = new THREE.Quaternion(); const s = new THREE.Vector3();
    m.decompose(pos, q, s);
    return { pos, q };
  });
}

// TRS de um quadro da animação (interpolação linear / slerp)
function sampleAnim(g, anim, time, base) {
  const trs = base.map((x) => ({ t: x.t.clone(), r: x.r.clone(), s: x.s.clone() }));
  for (const ch of anim.channels) {
    const sm = anim.samplers[ch.sampler];
    const ts = sm._in || (sm._in = g.acc(sm.input));
    const vs = sm._out || (sm._out = g.acc(sm.output));
    let i = 0;
    while (i < ts.length - 2 && time > ts[i + 1]) i++;
    const j = Math.min(i + 1, ts.length - 1);
    const u = ts[j] > ts[i] ? Math.min(1, Math.max(0, (time - ts[i]) / (ts[j] - ts[i]))) : 0;
    const node = trs[ch.target.node];
    if (ch.target.path === 'rotation') node.r.copy(new THREE.Quaternion(...vs[i]).slerp(new THREE.Quaternion(...vs[j]), u));
    else if (ch.target.path === 'translation') node.t.copy(new THREE.Vector3(...vs[i]).lerp(new THREE.Vector3(...vs[j]), u));
    else if (ch.target.path === 'scale') node.s.copy(new THREE.Vector3(...vs[i]).lerp(new THREE.Vector3(...vs[j]), u));
  }
  return trs;
}
const duration = (g, anim) => Math.max(...anim.samplers.map((s) => { const ts = g.acc(s.input); return ts[ts.length - 1]; }));

// ---------------------------------------------------------------- esqueleto do jogo (repouso)
const TARGET = readGLB(path.join(ROOT, 'public/models/kaiser.glb'));
const tW = worldOf(TARGET, restTRS(TARGET));
const tIdx = (name) => TARGET.json.nodes.findIndex((n) => n.name === name);
const tPos = (name) => tW[tIdx(name)].pos;
const T_HIP_H = tPos('hips').y - tPos('root').y;
// direção de repouso de cada segmento no jogo (osso → filho)
const T_DIR = {
  sL: tPos('eL').clone().sub(tPos('sL')).normalize(), eL: tPos('handL').clone().sub(tPos('eL')).normalize(),
  sR: tPos('eR').clone().sub(tPos('sR')).normalize(), eR: tPos('handR').clone().sub(tPos('eR')).normalize(),
  lL: tPos('kL').clone().sub(tPos('lL')).normalize(), kL: tPos('footL').clone().sub(tPos('kL')).normalize(),
  lR: tPos('kR').clone().sub(tPos('lR')).normalize(), kR: tPos('footR').clone().sub(tPos('kR')).normalize(),
};

// ---------------------------------------------------------------- fonte (UE mannequin do Quaternius)
const S = readGLB(SRC);
const SRM = SRC_RM ? readGLB(SRC_RM) : null;
const sIdx = (g, name) => g.json.nodes.findIndex((n) => n.name === name);
const MAP = { hip: 'pelvis', sp: 'spine_03', hd: 'Head', sL: 'upperarm_l', eL: 'lowerarm_l', sR: 'upperarm_r', eR: 'lowerarm_r', lL: 'thigh_l', kL: 'calf_l', lR: 'thigh_r', kR: 'calf_r' };
const CHILD = { sL: 'lowerarm_l', eL: 'hand_l', sR: 'lowerarm_r', eR: 'hand_r', lL: 'calf_l', kL: 'foot_l', lR: 'calf_r', kR: 'foot_r' };
const PARENT = { hip: null, sp: 'hip', hd: 'sp', sL: 'sp', eL: 'sL', sR: 'sp', eR: 'sR', lL: 'hip', kL: 'lL', lR: 'hip', kR: 'lR' };
const ORDER = { sL: 'YXZ', eL: 'YXZ', sR: 'YXZ', eR: 'YXZ' };
const JOINTS = ['hip', 'sp', 'hd', 'sL', 'eL', 'sR', 'eR', 'lL', 'kL', 'lR', 'kR'];

const sBase = restTRS(S);
// pose de repouso da fonte: o quadro 0 da A_TPose (a TRS do arquivo pode não ser a pose T)
const tpose = S.json.animations.find((a) => a.name === 'A_TPose');
const sRestW = worldOf(S, tpose ? sampleAnim(S, tpose, 0, sBase) : sBase);
const sp = (name) => sRestW[sIdx(S, name)].pos;
// alinhamento de eixos: no jogo o personagem olha para +Z, esquerda = +X, cima = +Y
const left = sp('upperarm_l').clone().sub(sp('upperarm_r')).normalize();
const up = sp('Head').clone().sub(sp('pelvis')).normalize();
const fwd = new THREE.Vector3().crossVectors(left, up).normalize(); // esquerda × cima = frente (+Z quando esquerda = +X)
const basis = new THREE.Matrix4().makeBasis(left, up, fwd); // colunas: eixos da fonte
const G = new THREE.Quaternion().setFromRotationMatrix(basis).invert(); // leva a fonte para o jogo
const S_HIP_H = sp('pelvis').clone().applyQuaternion(G).y - Math.min(sp('foot_l').clone().applyQuaternion(G).y, sp('foot_r').clone().applyQuaternion(G).y);
const T_HIP_FROM_ANKLE = tPos('hips').y - tPos('footL').y;
const SCALE = T_HIP_FROM_ANKLE / S_HIP_H;
console.log('alinhamento', left.toArray().map((x) => x.toFixed(2)), up.toArray().map((x) => x.toFixed(2)), 'escala', SCALE.toFixed(3));

// C de cada membro: leva a direção de repouso do jogo à direção da pose T da fonte (já alinhada)
const C = {};
for (const j of Object.keys(CHILD)) {
  const d = sp(CHILD[j]).clone().sub(sp(MAP[j])).applyQuaternion(G).normalize();
  C[j] = new THREE.Quaternion().setFromUnitVectors(T_DIR[j], d);
}
// o TRONCO também: na pose T da fonte a coluna e o pescoço não ficam a prumo (no jogo ficam) — sem isto toda animação
// sai inclinada para a frente. Segmentos: quadril (pélvis → spine_01), tronco (spine_01 → neck_01), cabeça (neck → Head)
const TORSO = { hip: ['pelvis', 'spine_01', 'hips', 'sp'], sp: ['spine_01', 'neck_01', 'sp', 'neck'], hd: ['neck_01', 'Head', 'neck', 'hd'] };
for (const [j, [a, b, ta, tb]] of Object.entries(TORSO)) {
  const d = sp(b).clone().sub(sp(a)).applyQuaternion(G).normalize();
  const r = tPos(tb).clone().sub(tPos(ta)).normalize();
  C[j] = new THREE.Quaternion().setFromUnitVectors(r, d);
}

// QUADRIL e TRONCO medidos como SEGMENTO (e não pelo giro de um osso só): a coluna da fonte tem três ossos e o de cima
// inclina bem mais que o tronco inteiro — pelo osso, a corrida saía inclinada o dobro. Referencial: a linha do segmento
// (cima) e a linha entre os lados (esquerda).
const SEG = { hip: ['pelvis', 'spine_01', 'thigh_r', 'thigh_l'], sp: ['spine_01', 'neck_01', 'upperarm_r', 'upperarm_l'] };
function frameQ(Wx, [a, b, r, l]) {
  const P = (n) => Wx[sIdx(S, n)].pos;
  const y = P(b).clone().sub(P(a)).normalize();
  const x = P(l).clone().sub(P(r));
  x.addScaledVector(y, -x.dot(y)).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
const SEG_REST = Object.fromEntries(Object.entries(SEG).map(([j, s]) => [j, frameQ(sRestW, s)]));

function poseAt(anim, time) {
  const W = worldOf(S, sampleAnim(S, anim, time, sBase));
  const D = {};
  for (const j of JOINTS) {
    const n = sIdx(S, MAP[j]);
    // delta no espaço da fonte → espaço do jogo (conjuga por G)
    const dSrc = SEG[j] ? frameQ(W, SEG[j]).multiply(SEG_REST[j].clone().invert()) : W[n].q.clone().multiply(sRestW[n].q.clone().invert());
    const dGame = G.clone().multiply(dSrc).multiply(G.clone().invert());
    D[j] = C[j] ? dGame.multiply(C[j]) : dGame;
  }
  const pose = {};
  for (const j of JOINTS) {
    const q = PARENT[j] ? D[PARENT[j]].clone().invert().multiply(D[j]) : D[j];
    const e = new THREE.Euler().setFromQuaternion(q, ORDER[j] || 'XYZ');
    pose[j] = [e.x, e.y, e.z].map((v) => +v.toFixed(3));
  }
  const pelvis = W[sIdx(S, 'pelvis')].pos.clone().applyQuaternion(G);
  const rest = sRestW[sIdx(S, 'pelvis')].pos.clone().applyQuaternion(G);
  pose.h = +((pelvis.y - rest.y) * SCALE).toFixed(3);
  return pose;
}

// passada (distância por ciclo) a partir do arquivo com root motion
function strideOf(name) {
  if (!SRM) return undefined;
  const a = SRM.json.animations.find((x) => x.name === name);
  if (!a) return undefined;
  const base = restTRS(SRM);
  const d = duration(SRM, a);
  const at = (t) => worldOf(SRM, sampleAnim(SRM, a, t, base))[sIdx(SRM, 'pelvis')].pos.clone().applyQuaternion(G);
  // em ALTURAS DE QUADRIL por ciclo, como os clipes do jogo (Fighter.strideSpeed multiplica pela altura do quadril)
  return +((at(d).sub(at(0)).setY(0).length() * SCALE) / T_HIP_H).toFixed(3);
}

// ---------------------------------------------------------------- clipes a converter
// nome no jogo ← animação da fonte · keys: quantas poses por ciclo · speed: encurta/estica a duração
const WANT = [
  { id: 'ual_walk', src: 'Walk_Loop', keys: 16, loop: true },
  { id: 'ual_jog', src: 'Jog_Fwd_Loop', keys: 16, loop: true },
  { id: 'ual_sprint', src: 'Sprint_Loop', keys: 16, loop: true },
  { id: 'ual_jump_start', src: 'Jump_Start', keys: 10 },
  { id: 'ual_jump_loop', src: 'Jump_Loop', keys: 10, loop: true },
  { id: 'ual_jump_land', src: 'Jump_Land', keys: 10 },
  { id: 'ual_roll', src: 'Roll', keys: 14 },
  { id: 'ual_hit_chest', src: 'Hit_Chest', keys: 10 },
  { id: 'ual_hit_head', src: 'Hit_Head', keys: 10 },
  { id: 'ual_idle', src: 'Idle_Loop', keys: 12, loop: true },
  { id: 'ual_crouch_idle', src: 'Crouch_Idle_Loop', keys: 10, loop: true },
  { id: 'ual_death', src: 'Death01', keys: 16 },
];

const clips = {};
for (const w of WANT) {
  const a = S.json.animations.find((x) => x.name === w.src);
  if (!a) { console.warn('sem', w.src); continue; }
  const d = duration(S, a);
  const n = w.keys;
  const keys = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    // no laço, o último quadro é o primeiro (fecha o ciclo sem salto)
    keys.push({ t: +u.toFixed(4), pose: poseAt(a, w.loop && i === n ? 0 : u * d) });
  }
  clips[w.id] = { dur: +d.toFixed(3), loop: !!w.loop, linear: true, src: w.src, stride: w.loop ? strideOf(w.src) : undefined, keys };
  console.log(w.id, '←', w.src, d.toFixed(2) + 's', clips[w.id].stride ?? '');
}

const header = `// GERADO por tools/anim/retarget-ual.mjs — não editar à mão (rode o script de novo).
// Animações do "Universal Animation Library" de Quaternius (quaternius.com), licença CC0 1.0 (domínio público),
// redirecionadas para o esqueleto do jogo. Cada clipe: { dur, loop, linear (interpolação linear entre as poses), src
// (nome no pacote), stride (passada por ciclo, só nos laços de andar/correr), keys: [{ t, pose }] }.
`;
fs.writeFileSync(path.join(ROOT, 'src/anim/ualClips.js'), `${header}export const UAL_CLIPS = ${JSON.stringify(clips)};\n`);
console.log('ok → src/anim/ualClips.js');
