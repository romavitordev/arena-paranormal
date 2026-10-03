import * as THREE from 'three';
import { loadGLB } from './glbRig.js';
import { toon } from './rig.js';

// Modelos de INVOCAÇÕES feitos no Blender em peças rígidas (tools/blender/npc_*.py → public/npcs/*.glb):
// a Marionete do Dante e os Zumbis de Sangue do Diabo. Não têm esqueleto: cada peça está presa numa junta (empty
// "J_<nome>") que o jogo gira em código. Carregados junto com os personagens; se faltar o arquivo, quem chama usa o
// modelo provisório feito em código.
export const NPC_MODELS = {
  marionette: 'npcs/marionette.glb',
  zumbi_sangue: 'npcs/zumbi_sangue.glb',
  zumbi_sangue_forte: 'npcs/zumbi_sangue_forte.glb',
};
const loaded = {};

export async function preloadNpcModels() {
  await Promise.all(Object.entries(NPC_MODELS).map(async ([id, url]) => {
    try {
      loaded[id] = await loadGLB(import.meta.env.BASE_URL + url);
    } catch (e) {
      console.warn(`Modelo de invocação indisponível (${id}), usando o provisório.`, e);
    }
  }));
}

// contorno: casca de trás empurrada pela normal (as peças ficam longe da origem da junta, então escala não serve)
function outlineMat(thickness) {
  const m = new THREE.MeshBasicMaterial({ color: 0x0a0a0c, side: THREE.BackSide });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n  transformed += normal * ${thickness.toFixed(4)};`);
  };
  return m;
}

// instância nova do modelo `id` (ou null): { root, joint(name), meshes }
// noOutline: trechos do nome do material sem contorno (fitas finas: cabelo, pano, cordas, brilho)
export function buildNpcModel(id, { outline = 0.012, noOutline = ['hair', 'cloth', 'rope', 'glow'] } = {}) {
  const gltf = loaded[id];
  if (!gltf) return null;
  const scene = gltf.scene.clone(true);
  const root = new THREE.Group();
  root.add(scene);
  const oMat = outlineMat(outline);
  const meshes = [];
  // junta a lista antes: o contorno é filho da malha e o traverse o visitaria de novo (recursão sem fim)
  const found = [];
  scene.traverse((o) => { if (o.isMesh) found.push(o); });
  found.forEach((o) => {
    const src = o.material;
    const name = src.name || '';
    const glow = src.emissive && src.emissive.r + src.emissive.g + src.emissive.b > 0.01;
    // cada instância tem os próprios materiais (o Zumbi recolore, o dano pisca)
    o.material = toon(src.color.clone(), {
      emissive: glow ? src.emissive.clone() : new THREE.Color(0),
      emissiveIntensity: glow ? 1.4 : 0,
      side: THREE.DoubleSide,
      transparent: src.transparent,
      opacity: src.opacity,
    });
    o.material.name = name;
    o.material.userData.glow = glow;
    o.castShadow = true;
    meshes.push(o);
    if (outline > 0 && !glow && !noOutline.some((k) => name.includes(k))) {
      const ol = new THREE.Mesh(o.geometry, oMat);
      ol.userData.isOutline = true;
      ol.raycast = () => {};
      o.add(ol);
    }
  });
  return { root, scene, meshes, joint: (n) => scene.getObjectByName('J_' + n) };
}
