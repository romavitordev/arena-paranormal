import * as THREE from 'three';

// TORRE EM 3D (estilo Torre de Babel): um zigurate redondo de andares que afinam até o santuário do vilão no topo,
// com arcos acesos, uma rampa em espiral por fora e um feixe de luz da cor da torre. Cada andar tem uma placa com o
// retrato do adversário (✔ vencido, dourado = o da vez).
// Câmera: intro() sobe da base até o topo bem perto e depois se afasta mostrando a torre inteira; focus(i) leva até
// um andar. Usada pelas telas da TORRE (o resto da interface é HTML por cima).

const TIER_H = 2.2;
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

export class TowerStage {
  constructor({ color = '#d4a63a', floors = 8 }) {
    this.color = new THREE.Color(color);
    this.n = floors;
    this.scene = new THREE.Scene();
    const sky = new THREE.Color(0x0a0710).lerp(this.color, 0.06);
    this.scene.background = sky;
    this.scene.fog = new THREE.Fog(sky, 30, 90);
    this.cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 200);
    this.t = 0;
    this.last = performance.now();
    this.markers = [];
    this.disposables = [];

    this.scene.add(new THREE.HemisphereLight(0x8a7ab0, 0x0a0608, 0.7));
    const moon = new THREE.DirectionalLight(0xcfc4ff, 1.1);
    moon.position.set(-12, 30, 18);
    this.scene.add(moon);
    const warm = new THREE.DirectionalLight(this.color, 0.5);
    warm.position.set(14, 6, 10);
    this.scene.add(warm);

    this.buildGround();
    this.buildTower();
    this.buildSky();
    // começa mostrando a torre inteira (intro() troca pela subida)
    this.anim = null;
    this.view = this.fullView();
    this.applyView(this.view);
  }

  mat(opts) {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0.02, flatShading: true, ...opts });
    this.disposables.push(m);
    return m;
  }
  geo(g) {
    this.disposables.push(g);
    return g;
  }

  radiusAt(i) {
    return 5.4 * (1 - (i / this.n) * 0.62);
  }

  buildGround() {
    const sand = this.mat({ color: new THREE.Color(0x2a2018).lerp(this.color, 0.08) });
    const ground = new THREE.Mesh(this.geo(new THREE.CircleGeometry(120, 48)), sand);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
    // escadaria de entrada + pedras soltas
    const stone = this.mat({ color: 0x5a4a3a });
    for (let k = 0; k < 4; k++) {
      const step = new THREE.Mesh(this.geo(new THREE.BoxGeometry(3.2 - k * 0.3, 0.22, 0.7)), stone);
      step.position.set(0, 0.11 + k * 0.22, 6.4 - k * 0.55);
      this.scene.add(step);
    }
    const rock = this.geo(new THREE.DodecahedronGeometry(0.6, 0));
    for (let k = 0; k < 26; k++) {
      const a = (k / 26) * Math.PI * 2 + Math.sin(k * 7.1) * 0.3;
      const r = 9 + ((k * 37) % 14);
      const m = new THREE.Mesh(rock, stone);
      m.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r);
      m.scale.setScalar(0.5 + ((k * 13) % 7) / 6);
      m.rotation.set(k, k * 2, k * 3);
      this.scene.add(m);
    }
  }

  buildTower() {
    const n = this.n;
    const stone = this.mat({ color: new THREE.Color(0x9a8264).lerp(this.color, 0.12) });
    const ledgeMat = this.mat({ color: new THREE.Color(0x6e5a44).lerp(this.color, 0.1) });
    const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.color).multiplyScalar(0.9) });
    this.disposables.push(glow);
    this.glowMat = glow;
    const archGeo = this.geo(new THREE.BoxGeometry(0.42, 1.05, 0.3));
    const pillarGeo = this.geo(new THREE.BoxGeometry(0.22, 1.5, 0.22));
    const tower = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const rb = this.radiusAt(i);
      const rt = this.radiusAt(i + 1) + 0.35;
      const y = i * TIER_H;
      const body = new THREE.Mesh(this.geo(new THREE.CylinderGeometry(rt, rb, TIER_H, 28, 1)), stone);
      body.position.y = y + TIER_H / 2;
      tower.add(body);
      const ledge = new THREE.Mesh(this.geo(new THREE.CylinderGeometry(rt + 0.35, rt + 0.35, 0.2, 28)), ledgeMat);
      ledge.position.y = y + TIER_H;
      tower.add(ledge);
      // arcos acesos e colunas em volta do andar
      const count = Math.max(8, Math.round(rb * 3.2));
      const arches = new THREE.InstancedMesh(archGeo, glow, count);
      const pillars = new THREE.InstancedMesh(pillarGeo, ledgeMat, count);
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const rm = (rb + rt) / 2;
      for (let k = 0; k < count; k++) {
        const a = (k / count) * Math.PI * 2 + i * 0.4;
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a + Math.PI / 2);
        m4.compose(new THREE.Vector3(Math.cos(a) * (rm - 0.05), y + TIER_H * 0.48, Math.sin(a) * (rm - 0.05)), q, new THREE.Vector3(1, 1, 1));
        arches.setMatrixAt(k, m4);
        const a2 = a + Math.PI / count;
        m4.compose(new THREE.Vector3(Math.cos(a2) * (rm + 0.12), y + TIER_H * 0.5, Math.sin(a2) * (rm + 0.12)), q, new THREE.Vector3(1, 1, 1));
        pillars.setMatrixAt(k, m4);
      }
      tower.add(arches, pillars);
    }
    // rampa em espiral por fora (Babel): degraus pequenos subindo em volta
    const H = n * TIER_H;
    const stepGeo = this.geo(new THREE.BoxGeometry(0.9, 0.16, 0.55));
    const steps = Math.round(n * 26);
    const ramp = new THREE.InstancedMesh(stepGeo, ledgeMat, steps);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let k = 0; k < steps; k++) {
      const y = (k / steps) * H;
      const a = (k / steps) * Math.PI * 2 * (n / 2.2);
      const r = this.radiusAt(y / TIER_H) + 0.55;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a);
      m4.compose(new THREE.Vector3(Math.cos(a) * r, y + 0.1, Math.sin(a) * r), q, new THREE.Vector3(1, 1, 1));
      ramp.setMatrixAt(k, m4);
    }
    tower.add(ramp);
    // santuário do vilão no topo: colunas, cúpula, chama e feixe de luz
    const top = new THREE.Group();
    top.position.y = H;
    const rTop = this.radiusAt(n) + 0.35;
    const plat = new THREE.Mesh(this.geo(new THREE.CylinderGeometry(rTop + 0.4, rTop + 0.4, 0.3, 24)), ledgeMat);
    plat.position.y = 0.15;
    top.add(plat);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const col = new THREE.Mesh(this.geo(new THREE.CylinderGeometry(0.16, 0.2, 2.2, 8)), stone);
      col.position.set(Math.cos(a) * rTop * 0.8, 1.4, Math.sin(a) * rTop * 0.8);
      top.add(col);
    }
    const dome = new THREE.Mesh(this.geo(new THREE.ConeGeometry(rTop + 0.3, 1.8, 24)), ledgeMat);
    dome.position.y = 3.4;
    top.add(dome);
    this.flame = new THREE.Mesh(this.geo(new THREE.SphereGeometry(0.55, 16, 12)), glow);
    this.flame.position.y = 1.3;
    top.add(this.flame);
    const beamMat = new THREE.MeshBasicMaterial({ color: this.color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    this.disposables.push(beamMat);
    this.beam = new THREE.Mesh(this.geo(new THREE.CylinderGeometry(0.5, 1.4, 60, 20, 1, true)), beamMat);
    this.beam.position.y = 34;
    top.add(this.beam);
    this.topLight = new THREE.PointLight(this.color, 30, 18, 1.6);
    this.topLight.position.y = 2;
    top.add(this.topLight);
    tower.add(top);
    this.scene.add(tower);
    this.tower = tower;
    this.height = H;
  }

  buildSky() {
    const pts = [];
    for (let k = 0; k < 500; k++) {
      const a = Math.random() * Math.PI * 2;
      const e = 0.15 + Math.random() * 1.2;
      const r = 110;
      pts.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
    }
    const g = this.geo(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const m = new THREE.PointsMaterial({ color: 0xd8d0ff, size: 0.5, fog: false, transparent: true, opacity: 0.8 });
    this.disposables.push(m);
    this.scene.add(new THREE.Points(g, m));
    // poeira subindo em volta da torre
    const dust = [];
    for (let k = 0; k < 160; k++) dust.push((Math.random() - 0.5) * 30, Math.random() * this.height, (Math.random() - 0.5) * 30);
    const dg = this.geo(new THREE.BufferGeometry());
    dg.setAttribute('position', new THREE.Float32BufferAttribute(dust, 3));
    const dm = new THREE.PointsMaterial({ color: this.color, size: 0.09, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    this.disposables.push(dm);
    this.dust = new THREE.Points(dg, dm);
    this.scene.add(this.dust);
  }

  // placas dos andares: retrato do adversário de cada andar (floors = torre montada; portraits = imagens)
  setFloors(floors, portraits = {}) {
    for (const mk of this.markers) { this.tower.remove(mk.sprite); mk.tex.dispose(); mk.sprite.material.dispose(); }
    this.markers = floors.map((f, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 200;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      const boss = i === floors.length - 1 && f.boss;
      const y = boss ? this.height + 5.6 : i * TIER_H + TIER_H * 0.55;
      const r = boss ? 0 : this.radiusAt(i + 0.5) + 1.3;
      sprite.position.set(0, y, r);
      sprite.scale.set(boss ? 2.2 : 1.25, boss ? 2.75 : 1.56, 1);
      sprite.renderOrder = 5;
      this.tower.add(sprite);
      const mk = { sprite, tex, canvas, def: f.def, boss, img: null, state: 'next' };
      const src = portraits[f.def.id];
      if (src) {
        const img = new Image();
        img.onload = () => { mk.img = img; this.drawMarker(mk); };
        img.src = src;
      }
      this.drawMarker(mk);
      return mk;
    });
  }

  drawMarker(mk) {
    const c = mk.canvas.getContext('2d');
    const W = mk.canvas.width;
    const H = mk.canvas.height;
    c.clearRect(0, 0, W, H);
    const col = mk.state === 'now' ? '#ffd84a' : mk.state === 'won' ? '#7dffb0' : mk.boss ? '#ff4a3a' : mk.def.color || '#bfb3d6';
    c.fillStyle = 'rgba(8,6,12,.85)';
    c.fillRect(6, 6, W - 12, H - 12);
    if (mk.img) {
      c.globalAlpha = mk.state === 'won' ? 0.45 : 1;
      c.drawImage(mk.img, 10, 10, W - 20, H - 20);
      c.globalAlpha = 1;
    }
    c.lineWidth = mk.state === 'now' || mk.boss ? 10 : 6;
    c.strokeStyle = col;
    c.strokeRect(6, 6, W - 12, H - 12);
    if (mk.state === 'won') {
      c.fillStyle = '#7dffb0';
      c.font = 'bold 90px sans-serif';
      c.textAlign = 'center';
      c.fillText('✔', W / 2, H / 2 + 32);
    }
    mk.tex.needsUpdate = true;
  }

  // floor = andar da vez; done = torre zerada (tudo vencido)
  setProgress(floor, done = false) {
    this.markers.forEach((mk, i) => {
      const st = done || i < floor ? 'won' : i === floor ? 'now' : 'next';
      if (mk.state !== st) { mk.state = st; this.drawMarker(mk); }
    });
    this.current = done ? null : floor;
  }

  // ---------------- câmera
  // a torre inteira, da base à placa do vilão (com folga em cima e embaixo)
  fullView() {
    const H = this.height + 8;
    return { y: H * 0.5, look: H * 0.44, dist: H * 1.6 + 4, ang: 0.18 };
  }
  floorView(i) {
    const boss = i >= this.n;
    const y = boss ? this.height + 4.4 : i * TIER_H + TIER_H * 0.6;
    return { y: y + 2.4, look: y + 0.6, dist: (boss ? 13 : this.radiusAt(i) + 15), ang: 0.22 };
  }
  // shift: empurra a torre para a direita da tela (o painel fica à esquerda)
  applyView(v, sway = 0, shift = 0) {
    const a = v.ang + sway;
    const rx = Math.cos(a) * -shift;
    const rz = -Math.sin(a) * -shift;
    this.cam.position.set(Math.sin(a) * v.dist + rx, v.y, Math.cos(a) * v.dist + rz);
    this.cam.lookAt(rx, v.look, rz);
  }

  // subida da base até o topo bem perto, depois afasta mostrando a torre inteira
  intro() {
    const H = this.height;
    const r0 = this.radiusAt(0);
    this.anim = { t: 0, keys: [
      { at: 0, v: { y: 0.9, look: 2.4, dist: r0 + 8, ang: -0.75 } },
      { at: 3.6, v: { y: H + 4.5, look: H + 4, dist: this.radiusAt(this.n) + 9, ang: 0.45 } },
      { at: 5.8, v: this.fullView() },
    ] };
  }
  get introDone() { return !this.anim || this.anim.t >= this.anim.keys.at(-1).at; }
  skipIntro() { if (this.anim) this.anim.t = this.anim.keys.at(-1).at; }

  // leva a câmera até um andar (ou à torre inteira com i = null)
  focus(i) {
    const to = i === null || i === undefined ? this.fullView() : this.floorView(i);
    this.anim = { t: 0, keys: [{ at: 0, v: { ...this.view } }, { at: 1.4, v: to }] };
  }

  render(renderer) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;
    const size = renderer.getSize(new THREE.Vector2());
    this.cam.aspect = size.x / Math.max(1, size.y);
    if (this.anim) {
      this.anim.t += dt;
      const ks = this.anim.keys;
      let k = 1;
      while (k < ks.length - 1 && this.anim.t > ks[k].at) k++;
      const a = ks[k - 1];
      const b = ks[k];
      const p = ease(Math.min(1, Math.max(0, (this.anim.t - a.at) / (b.at - a.at))));
      this.view = {};
      for (const key of ['y', 'look', 'dist', 'ang']) this.view[key] = a.v[key] + (b.v[key] - a.v[key]) * p;
    }
    // tela estreita (celular em pé): mais longe para caber
    const far = this.cam.aspect < 1 ? 1.5 : 1;
    const shift = this.cam.aspect > 1.2 ? this.view.dist * 0.2 : 0;
    this.applyView({ ...this.view, dist: this.view.dist * far }, Math.sin(this.t * 0.25) * 0.06, shift);
    this.cam.updateProjectionMatrix();
    // brilho pulsando no topo, poeira subindo e o andar da vez piscando
    const pulse = 0.75 + Math.sin(this.t * 2.4) * 0.25;
    this.topLight.intensity = 26 * pulse;
    this.flame.scale.setScalar(0.9 + pulse * 0.2);
    this.beam.material.opacity = 0.12 + pulse * 0.08;
    const arr = this.dust.geometry.attributes.position.array;
    for (let k = 1; k < arr.length; k += 3) { arr[k] += dt * 0.6; if (arr[k] > this.height + 6) arr[k] = 0; }
    this.dust.geometry.attributes.position.needsUpdate = true;
    for (const mk of this.markers) {
      const s = mk.state === 'now' ? 1 + Math.sin(this.t * 4) * 0.06 : 1;
      const base = mk.boss ? [2.2, 2.75] : [1.25, 1.56];
      mk.sprite.scale.set(base[0] * s, base[1] * s, 1);
    }
    renderer.render(this.scene, this.cam);
  }

  dispose() {
    for (const mk of this.markers) { mk.tex.dispose(); mk.sprite.material.dispose(); }
    for (const d of this.disposables) d.dispose();
    this.scene.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
  }
}
