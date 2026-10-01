import * as THREE from 'three';
import { toon } from '../models/rig.js';

// Arena 1 — Ruínas do Ritual. Cemitério abandonado com um círculo de
// invocação no centro, pilares de pedra, lápides, velas e névoa roxa.
// Formato de arena: { id, name, radius, colliders:[{x,z,r}], occluders:[Mesh],
//                     spawns:[{x,z}], build(scene), update(dt), blocksPoint(p, r) }

function ritualTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#1c1820';
  g.fillRect(0, 0, 1024, 1024);
  // pedras do chão
  for (let i = 0; i < 900; i++) {
    const v = 22 + Math.random() * 18;
    g.fillStyle = `rgb(${v},${v - 3},${v + 4})`;
    const x = Math.random() * 1024, y = Math.random() * 1024, s = 20 + Math.random() * 50;
    g.fillRect(x, y, s, s * 0.7);
  }
  g.strokeStyle = 'rgba(0,0,0,0.35)';
  for (let i = 0; i < 1024; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke();
  }
  // círculo ritual
  g.translate(512, 512);
  g.strokeStyle = 'rgba(150,100,230,0.75)';
  g.shadowColor = '#a46bff';
  g.shadowBlur = 8;
  g.lineWidth = 3;
  for (const r of [430, 400, 250]) { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); }
  g.lineWidth = 2.5;
  g.beginPath();
  for (let i = 0; i <= 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(a) * 400, y = Math.sin(a) * 400;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.stroke();
  g.font = 'bold 34px serif';
  g.fillStyle = 'rgba(190,140,255,0.9)';
  const glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  for (let i = 0; i < 36; i++) {
    g.save();
    g.rotate((i / 36) * Math.PI * 2);
    g.fillText(glyphs[i % glyphs.length], -10, -408);
    g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function createRuinas() {
  const radius = 22;
  const colliders = [];
  const occluders = [];
  let candles = [];
  let ash = null;
  let circleMat = null;
  let time = 0;

  const arena = {
    id: 'ruinas',
    name: 'Ruínas do Ritual',
    radius,
    colliders,
    occluders,
    spawns: [{ x: 0, z: -5 }, { x: 0, z: 5 }],

    build(scene) {
      const group = new THREE.Group();
      scene.add(group);
      scene.background = new THREE.Color(0x0d0a14);
      scene.fog = new THREE.FogExp2(0x1a1028, 0.022);

      // luzes
      group.add(new THREE.HemisphereLight(0xa898d8, 0x2a1c34, 1.6));
      group.add(new THREE.AmbientLight(0x6a5a8a, 0.5));
      const moon = new THREE.DirectionalLight(0xd8d0ff, 2.6);
      moon.position.set(12, 22, 8);
      moon.castShadow = true;
      moon.shadow.mapSize.set(2048, 2048);
      const sc = moon.shadow.camera;
      sc.left = sc.bottom = -26; sc.right = sc.top = 26; sc.near = 1; sc.far = 70;
      moon.shadow.bias = -0.0005;
      group.add(moon);
      const center = new THREE.PointLight(0xa46bff, 30, 30, 1.6);
      center.position.set(0, 2.5, 0);
      group.add(center);

      // chão
      const floorTex = ritualTexture();
      const floor = new THREE.Mesh(new THREE.CircleGeometry(radius + 12, 72), new THREE.MeshStandardMaterial({ color: 0x8a8090, roughness: 0.95 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      group.add(floor);
      const circle = new THREE.Mesh(new THREE.CircleGeometry(radius - 1, 72), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9, emissive: 0x6a3aa8, emissiveMap: floorTex, emissiveIntensity: 0.16 }));
      circle.rotation.x = -Math.PI / 2;
      circle.position.y = 0.01;
      circle.receiveShadow = true;
      circleMat = circle.material;
      group.add(circle);

      // muro baixo de pedra no limite (com aberturas)
      const stone = toon(0x4a4452);
      const darkStone = toon(0x2e2a34);
      const segs = 40;
      for (let i = 0; i < segs; i++) {
        if (i % 10 === 0) continue;
        const a = (i / segs) * Math.PI * 2;
        const w = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.9 + Math.random() * 0.5, 0.7), i % 3 ? stone : darkStone);
        w.position.set(Math.sin(a) * (radius + 0.4), 0.45, Math.cos(a) * (radius + 0.4));
        w.rotation.y = a;
        w.castShadow = true;
        w.receiveShadow = true;
        group.add(w);
      }

      // pilares (colisão + bloqueiam projéteis e câmera)
      const pillarGeo = new THREE.CylinderGeometry(0.75, 0.9, 6, 10);
      const capGeo = new THREE.BoxGeometry(2.0, 0.5, 2.0);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const r = 13.5;
        const x = Math.sin(a) * r, z = Math.cos(a) * r;
        const broken = i % 2 === 1;
        const h = broken ? 3.2 : 6;
        // material próprio: a câmera deixa o pilar transparente quando ele tampa a luta
        const p = new THREE.Mesh(pillarGeo, stone.clone());
        p.scale.y = h / 6;
        p.position.set(x, h / 2, z);
        p.castShadow = true;
        p.receiveShadow = true;
        group.add(p);
        occluders.push(p);
        if (!broken) {
          const cap = new THREE.Mesh(capGeo, darkStone);
          cap.position.set(x, h + 0.25, z);
          cap.castShadow = true;
          group.add(cap);
        }
        colliders.push({ x, z, r: 0.9 });
        // runa brilhante no pilar
        const rune = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.9), new THREE.MeshBasicMaterial({ color: 0xa46bff, transparent: true, opacity: 0.8 }));
        rune.position.set(x * 0.94, 1.8, z * 0.94);
        rune.lookAt(0, 1.8, 0);
        group.add(rune);
      }

      // lápides
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 7 + Math.random() * 11;
        const x = Math.sin(a) * r, z = Math.cos(a) * r;
        if (colliders.some((c) => Math.hypot(c.x - x, c.z - z) < 2.5)) continue;
        if (Math.abs(x) < 3 && Math.abs(z) < 10) continue; // não bloquear spawns
        const tomb = new THREE.Group();
        const slab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.22), stone);
        slab.position.y = 0.5;
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.22, 12, 1, false, 0, Math.PI), stone);
        top.rotation.set(Math.PI / 2, 0, Math.PI / 2);
        top.position.y = 1.0;
        tomb.add(slab, top);
        tomb.position.set(x, 0, z);
        tomb.rotation.set((Math.random() - 0.5) * 0.25, Math.random() * Math.PI, (Math.random() - 0.5) * 0.2);
        tomb.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        group.add(tomb);
        colliders.push({ x, z, r: 0.5 });
      }

      // velas no círculo
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb060 });
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const r = 4.2;
        const cnd = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.35, 8), toon(0xe8e0cc));
        cnd.position.set(Math.sin(a) * r, 0.17, Math.cos(a) * r);
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), flameMat);
        flame.scale.y = 1.8;
        flame.position.set(cnd.position.x, 0.42, cnd.position.z);
        group.add(cnd, flame);
        candles.push(flame);
      }
      for (const [x, z] of [[4, 4], [-4, -4]]) {
        const l = new THREE.PointLight(0xffa050, 6, 9, 2);
        l.position.set(x, 0.8, z);
        group.add(l);
      }

      // árvores mortas fora da arena
      const bark = toon(0x1a141c);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + Math.random() * 0.2;
        const r = radius + 4 + Math.random() * 6;
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.35, 5, 6), bark);
        trunk.position.y = 2.5;
        tree.add(trunk);
        for (let b = 0; b < 4; b++) {
          const br = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 2.2, 5), bark);
          br.position.y = 3 + b * 0.5;
          br.rotation.set(0, b * 1.7, 0.9 + Math.random() * 0.4);
          br.translateY(1);
          tree.add(br);
        }
        tree.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
        tree.rotation.y = Math.random() * 6;
        group.add(tree);
      }

      // cinzas flutuando
      const n = 400;
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 50;
        pos[i * 3 + 1] = Math.random() * 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      ash = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xb89aff, size: 0.07, transparent: true, opacity: 0.6, depthWrite: false }));
      group.add(ash);
      arena.group = group;
    },

    update(dt) {
      time += dt;
      if (circleMat) circleMat.emissiveIntensity = 0.16 + Math.sin(time * 1.5) * 0.05;
      for (const c of candles) c.scale.set(1, 1.6 + Math.sin(time * 18 + c.position.x) * 0.25, 1);
      if (ash) {
        const p = ash.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          let y = p.getY(i) + dt * 0.25;
          if (y > 10) y = 0;
          p.setY(i, y);
        }
        p.needsUpdate = true;
      }
    },

    // Projéteis param em pilares/lápides e no muro
    blocksPoint(p, r = 0) {
      if (Math.hypot(p.x, p.z) > radius + 0.5) return true;
      if (p.y < -0.2) return true;
      for (const c of colliders) {
        const h = c.r > 0.7 ? 6 : 1.1;
        if (p.y < h && Math.hypot(p.x - c.x, p.z - c.z) < c.r + r) return true;
      }
      return false;
    },

    dispose(scene) {
      if (arena.group) scene.remove(arena.group);
    },
  };
  return arena;
}
