import * as THREE from 'three';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';

// Fundo 3D da tela inicial e dos menus: alguns lutadores do elenco em pose parada, contra a luz (silhueta escura com
// contorno na cor do poder de cada um), neblina, o círculo ritual brilhando no chão, cinzas subindo e a câmera se
// aproximando devagar. Os modelos só são montados depois que os .glb carregam (ready()).
const LINEUP = [
  { id: 'aghata', x: -3.3, z: -1.6, yaw: 0.55 },
  { id: 'kaiser', x: -1.7, z: -0.6, yaw: 0.3 },
  { id: 'arthur', x: 0, z: 0, yaw: 0 },
  { id: 'joui', x: 1.7, z: -0.6, yaw: -0.3 },
  { id: 'gal_sal', x: 3.3, z: -1.6, yaw: -0.55 },
];

export class TitleStage {
  constructor(roster) {
    this.roster = roster;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07050b);
    this.scene.fog = new THREE.FogExp2(0x07050b, 0.075);
    this.cam = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 80);
    this.t = 0;
    this.last = performance.now();
    this.built = false;
    // luz baixa de frente (silhuetas) + luz de ambiente roxa
    this.scene.add(new THREE.HemisphereLight(0x3a2a5a, 0x050308, 0.55));
    const front = new THREE.DirectionalLight(0xb8a8ff, 0.6);
    front.position.set(0, 2, 8);
    this.scene.add(front);
    // chão escuro + círculo ritual que brilha
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: 0x0c0912, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
    this.sigil = new THREE.Group();
    const ringMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
    for (const [r, w, c, o] of [[5.2, 0.035, 0xa46bff, 0.55], [4.6, 0.02, 0xa46bff, 0.35], [3.1, 0.03, 0xe0204a, 0.35], [2.4, 0.015, 0xa46bff, 0.3]]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - w, r + w, 128), ringMat(c, o));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      this.sigil.add(ring);
    }
    // pentagrama dos cinco elementos
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const a = ((i * 2) % 5) / 5 * Math.PI * 2 + Math.PI / 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 4.6, 0.012, Math.sin(a) * 4.6));
    }
    pts.push(pts[0].clone());
    this.sigil.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x7a4ab8, transparent: true, opacity: 0.45 })));
    this.sigil.position.z = -0.5;
    this.scene.add(this.sigil);
    // brilho sob o círculo
    const glow = new THREE.Mesh(new THREE.CircleGeometry(5.5, 48), new THREE.MeshBasicMaterial({ color: 0x5a2a9a, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.005, -0.5);
    this.scene.add(glow);
    // cinzas / brasas subindo
    const N = 260;
    const pos = new Float32Array(N * 3);
    this.ash = [];
    for (let i = 0; i < N; i++) {
      const p = { x: (Math.random() - 0.5) * 16, y: Math.random() * 7, z: -6 + Math.random() * 9, s: 0.15 + Math.random() * 0.45, w: Math.random() * 6 };
      this.ash.push(p);
      pos.set([p.x, p.y, p.z], i * 3);
    }
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.ashPts = new THREE.Points(ag, new THREE.PointsMaterial({ color: 0xffa070, size: 0.045, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.scene.add(this.ashPts);
    this.actors = [];
  }

  // monta os lutadores (depois que os modelos carregaram)
  ready() {
    if (this.built) return;
    this.built = true;
    for (const L of LINEUP) {
      const def = this.roster.find((d) => d.id === L.id);
      if (!def) continue;
      let rig;
      try { rig = buildModel(def.model); } catch { continue; }
      const anim = new Animator(rig, def.anims);
      anim.play('idle', { blend: 0 });
      anim.update(Math.random());
      rig.root.position.set(L.x, 0, L.z);
      rig.root.rotation.y = L.yaw;
      this.scene.add(rig.root);
      // contorno na cor do poder: luz forte vindo de trás e de cima
      const rim = new THREE.SpotLight(def.energyColor ?? 0xa46bff, 70, 10, 0.6, 0.6, 1.3);
      rim.position.set(L.x * 1.15, 3.4, L.z - 2.6);
      rim.target.position.set(L.x, 1, L.z);
      this.scene.add(rim, rim.target);
      this.actors.push({ rig, anim });
    }
  }

  render(renderer) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;
    const size = renderer.getSize(new THREE.Vector2());
    this.cam.aspect = size.x / Math.max(1, size.y);
    // câmera baixa se aproximando devagar e balançando de leve (em tela estreita, mais longe)
    const far = this.cam.aspect < 1.2 ? 4 : 0;
    const push = 9.4 + far - Math.min(1.2, this.t * 0.04);
    this.cam.position.set(Math.sin(this.t * 0.12) * 0.6, 1.5 + Math.sin(this.t * 0.2) * 0.08, push);
    this.cam.lookAt(0, 2.05, 0); // os lutadores ficam no terço de baixo, deixando o título livre
    this.cam.updateProjectionMatrix();
    this.sigil.rotation.y += dt * 0.05;
    for (const a of this.actors) a.anim.update(dt);
    const arr = this.ashPts.geometry.attributes.position.array;
    this.ash.forEach((p, i) => {
      p.y += p.s * dt;
      p.x += Math.sin(this.t + p.w) * 0.12 * dt;
      if (p.y > 7) { p.y = 0; p.x = (Math.random() - 0.5) * 16; }
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    this.ashPts.geometry.attributes.position.needsUpdate = true;
    renderer.render(this.scene, this.cam);
  }
}
