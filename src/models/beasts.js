import * as THREE from 'three';
import { buildNpcModel } from './npcRig.js';
import { buildBloodZombie } from './bloodZombie.js';
import { toon } from './rig.js';

// O CARNIÇAL (invocação do Deus da Morte, tools/blender/npc_carnical.py): mesmo esqueleto dos Zumbis de Sangue, então
// usa a pose deles (em pé e altivo). Se o .glb faltar, usa o Zumbi fraco.
export function buildCarnical() {
  const m = buildNpcModel('carnical', { outline: 0.012, noOutline: ['tendon', 'glow', 'claw'] });
  if (!m) return buildBloodZombie(false);
  const J = m.joint;
  return {
    root: m.root,
    joints: {
      body: J('body'), chest: J('chest'), neck: J('neck'), jaw: J('jaw'),
      armL: { sh: J('shL'), el: J('elL'), hand: J('handL') },
      armR: { sh: J('shR'), el: J('elR'), hand: J('handR') },
      legs: [{ hip: J('hipL'), knee: J('kneeL') }, { hip: J('hipR'), knee: J('kneeR') }],
      zombie: true,
    },
  };
}

// ANIMAIS INFECTADOS PELA TINTA (invocação do Amigo Imaginário, tools/blender/npc_bicho_lib.py): javali e cão
// selvagem de quatro patas. Juntas: body, torso, head, jaw, legs[FL, FR, BL, BR] (+ joelho) e tail.
export function buildInkBeast(kind) {
  const m = buildNpcModel(kind === 'javali' ? 'javali_tinta' : 'cao_tinta', { outline: 0.012, noOutline: ['vein', 'tooth', 'ink', 'goo', 'glow', 'claw', 'bone'] });
  if (m) {
    const J = m.joint;
    return {
      root: m.root,
      joints: {
        body: J('body'), torso: J('torso'), head: J('head'), jaw: J('jaw'), tail: J('tail'),
        legs: ['FL', 'FR', 'BL', 'BR'].map((n) => ({ hip: J('leg' + n), knee: J('knee' + n) })),
      },
    };
  }
  // provisório (sem o .glb): um bloco marrom com as mesmas juntas
  const root = new THREE.Group();
  const mk = (parent, pos) => { const o = new THREE.Object3D(); o.position.set(...pos); parent.add(o); return o; };
  const body = mk(root, [0, 0, 0]);
  const torso = mk(body, [0, 0.5, 0]);
  const s = kind === 'javali' ? 1.3 : 0.8;
  torso.add(new THREE.Mesh(new THREE.BoxGeometry(0.4 * s, 0.4 * s, 1.0 * s), toon(0x3a2418)));
  const head = mk(torso, [0, 0.1, 0.55 * s]);
  head.add(new THREE.Mesh(new THREE.BoxGeometry(0.25 * s, 0.25 * s, 0.35 * s), toon(0x2a1a10)));
  const jaw = mk(head, [0, -0.1, 0.1]);
  const tail = mk(torso, [0, 0.1, -0.5 * s]);
  const legs = [[0.15, 0.35], [-0.15, 0.35], [0.15, -0.35], [-0.15, -0.35]].map(([x, z]) => {
    const hip = mk(torso, [x * s, 0, z * s]);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), toon(0x1a100a));
    leg.position.y = -0.25;
    hip.add(leg);
    return { hip, knee: mk(hip, [0, -0.25, 0]) };
  });
  return { root, joints: { body, torso, head, jaw, tail, legs } };
}
