import * as THREE from 'three';
import { preloadNpcModels } from '../models/npcRig.js';
import { Marionette, BloodZombie } from '../combat/npcs.js';

// Página de desenvolvimento (npcs.html, só no `npm run dev`): a Marionete e os Zumbis de Sangue lado a lado, com as
// poses de cada estado/golpe em loop. Usa um "mundo" falso: nada de partida, só o modelo e a animação de pose().
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x15111c);
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
scene.add(new THREE.HemisphereLight(0xb8a8ff, 0x201828, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(3, 6, 5);
sun.castShadow = true;
scene.add(sun);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x2a2433 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const noop = () => {};
const world = {
  scene, npcs: [], cinematic: null,
  arena: { colliders: [], boxes: [], radius: 50 },
  audio: { play: noop },
  fx: { burst: noop, slash: noop, impact: noop, ring: noop },
};
const owner = { yaw: 0, pos: new THREE.Vector3(0, 0, -20), state: 'idle', notify: noop, opponent: null };

await preloadNpcModels();
const npcs = [
  new Marionette(owner, world, new THREE.Vector3(-3.4, 0, 0)),
  new BloodZombie(owner, world, new THREE.Vector3(0, 0, 0), {}),
  new BloodZombie(owner, world, new THREE.Vector3(3.6, 0, 0), { strong: true }),
];
for (const n of npcs) { n.state = 'chase'; n.yaw = 0; n.pool.visible = false; }

const MODES = ['parado', 'andando', 'reflex', 'quick', 'heavy', 'lunge', 'irony', 'drag', 'claw', 'bite', 'slam'];
let mode = 'parado';
let yaw = 0;
const ui = document.getElementById('ui');
for (const m of MODES) {
  const b = document.createElement('button');
  b.textContent = m;
  b.onclick = () => { mode = m; [...ui.children].forEach((c) => c.classList.toggle('on', c === b)); };
  ui.appendChild(b);
}
ui.firstChild.classList.add('on');

function setPose(n, dt) {
  n.t += dt;
  const atkName = mode === 'drag' ? 'irony' : mode;
  const A = n.cfg.attacks[atkName];
  if (A) {
    const len = A.windup + A.active + A.recovery + 0.4;
    if (!n.atk || n.atk.name !== atkName) { n.atk = { name: atkName, ...A, done: [], swung: [] }; n.stateT = 0; }
    n.state = mode === 'drag' ? 'drag' : 'attack';
    n.stateT = view.at != null ? view.at : (n.stateT + dt) % len; // at: congela num instante do golpe
  } else {
    n.atk = null;
    n.state = 'chase';
    if (mode === 'andando') n.gait += dt * n.cfg.speed * 0.6;
  }
  n.yaw = yaw;
  n.model.root.position.set(n.pos.x, n.restY() + n.bob(), n.pos.z);
  n.pose();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  for (const n of npcs) setPose(n, dt);
  // view.focus: índice da invocação em foco (null = as três)
  const f = view.focus == null ? null : npcs[view.focus].pos;
  const r = f ? view.dist : 11;
  const cx = f ? f.x : 0;
  camera.position.set(cx + Math.sin(view.cam) * r, view.camY, Math.cos(view.cam) * r);
  camera.lookAt(cx, f ? view.lookY : 1.1, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
const view = { cam: 0.25, focus: null, dist: 5, camY: 1.7, lookY: 1.2, at: null };
// câmera e pose pela URL (sobrevive ao recarregar): npcs.html#focus=0&dist=4.5&camY=2.2&lookY=1.9&cam=0.2&mode=heavy&yaw=0
for (const [key, val] of new URLSearchParams(location.hash.slice(1))) {
  if (key === 'mode') mode = val;
  else if (key === 'yaw') yaw = Number(val);
  else view[key] = Number(val);
}
window.__npcView = { npcs, view, setMode: (m) => { mode = m; }, setYaw: (v) => { yaw = v; } };
requestAnimationFrame(frame);
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});
