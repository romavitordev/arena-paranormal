import * as THREE from 'three';
import { buildModel, MODEL_BUILDERS, preloadModels } from './models/index.js';
import { Animator } from './anim/Animator.js';
import { CLIPS } from './anim/clips.js';
import { ROSTER } from './characters/index.js';

// Página de visualização dos modelos e animações (ferramenta de desenvolvimento).
const IDLE = {
  kaiser: 'idle_fist', arthur: 'idle_onearm', joui: 'idle_katana',
  aghata: 'idle_knife', gal_sal: 'idle_dual', kian: 'idle_fist',
};

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x15111c);
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 9.5);
camera.lookAt(0, 1.0, 0);

scene.add(new THREE.HemisphereLight(0xb8a8ff, 0x201828, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(3, 6, 5);
sun.castShadow = true;
scene.add(sun);
const rim = new THREE.DirectionalLight(0x9a6aff, 1.4);
rim.position.set(-4, 3, -5);
scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), new THREE.MeshStandardMaterial({ color: 0x241e2c }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const ids = Object.keys(MODEL_BUILDERS);
const only = new URLSearchParams(location.search).get('only');
const shown = only ? ids.filter((id) => only.split(',').includes(id)) : ids;
await preloadModels();
const entries = shown.map((id, i) => {
  const rig = buildModel(id);
  rig.root.position.x = (i - (shown.length - 1) / 2) * 1.35;
  scene.add(rig.root);
  const anim = new Animator(rig);
  anim.play(IDLE[id]);
  return { id, rig, anim };
});
document.getElementById('labels').innerHTML = shown.map((id) => `<span>${(ROSTER.find((c) => c.id === id) || { name: id }).name}</span>`).join('');

const sel = document.getElementById('anim');
sel.innerHTML = '<option value="">(postura de cada um)</option>' + Object.keys(CLIPS).map((c) => `<option>${c}</option>`).join('');
sel.onchange = () => {
  for (const e of entries) e.anim.play(sel.value || IDLE[e.id], { restart: true });
};

let yaw = 0.35;
let drag = null;
addEventListener('pointerdown', (e) => { drag = e.clientX; });
addEventListener('pointerup', () => { drag = null; });
addEventListener('pointermove', (e) => {
  if (drag === null) return;
  yaw += (e.clientX - drag) * 0.01;
  drag = e.clientX;
});
function fit() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  // distância para caber os 6 lado a lado em qualquer proporção de tela
  const halfW = Math.max(1.1, shown.length * 0.78);
  const hfov = 2 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
  const d = Math.max(3.2, halfW / Math.tan(hfov / 2));
  camera.position.set(0, 1.4 + d * 0.06, d);
  camera.lookAt(0, 0.95, 0);
  // ?face → close nos rostos (para conferir os detalhes)
  if (new URLSearchParams(location.search).has('face')) {
    const fd = Math.max(1.05, (shown.length === 1 ? 0.24 : shown.length * 0.68) / Math.tan(hfov / 2));
    camera.position.set(0, 1.86, fd);
    camera.lookAt(0, 1.82, 0);
  }
}
addEventListener('resize', fit);
fit();

// Para inspeção externa
window.__gallery = { entries, setYaw: (v) => { yaw = v; } };

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(0.05, clock.getDelta());
  for (const e of entries) {
    e.rig.root.rotation.y = yaw;
    e.anim.update(dt);
    if (!CLIPS[e.anim.currentName]?.loop && e.anim.progress >= 1) e.anim.play(e.anim.currentName, { restart: true });
  }
  renderer.render(scene, camera);
});
