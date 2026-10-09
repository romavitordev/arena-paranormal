import * as THREE from 'three';

// Texturas dos cenários, pintadas em canvas e aplicadas pelo NOME do material do Blender.
// Os UVs dos cenários vêm da projeção em cubo do Blender (1 unidade = 1 metro), então
// `meters` diz quantos metros a textura cobre antes de repetir.

function tex(size, meters, paint, opts = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  paint(g, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / meters, 1 / meters);
  t.anisotropy = 8;
  if (opts.roughness !== undefined || opts.glow) return { map: t, roughness: opts.roughness, glow: opts.glow };
  return t;
}

const rnd = (a, b) => a + Math.random() * (b - a);

function noise(g, s, colors, n = 1800, size = [1, 3], alpha = 0.25) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    g.globalAlpha = alpha * Math.random();
    const r = rnd(size[0], size[1]);
    g.fillRect(Math.random() * s, Math.random() * s, r, r);
  }
  g.globalAlpha = 1;
}

function bricks(g, s, { base, mortar, rows = 8, cols = 4, vary = 18, dirt = 0.2 }) {
  g.fillStyle = mortar;
  g.fillRect(0, 0, s, s);
  const h = s / rows;
  const w = s / cols;
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? w / 2 : 0;
    for (let c = -1; c <= cols; c++) {
      const x = c * w + off;
      const k = 1 + (Math.random() - 0.5) * vary / 100;
      const [R, G, B] = base;
      g.fillStyle = `rgb(${R * k | 0},${G * k | 0},${B * k | 0})`;
      g.fillRect(x + 2, r * h + 2, w - 4, h - 4);
    }
  }
  noise(g, s, ['#000', '#fff'], 2500, [1, 2], 0.18);
  if (dirt) {
    const grd = g.createLinearGradient(0, s, 0, s * 0.4);
    grd.addColorStop(0, `rgba(30,20,10,${dirt})`);
    grd.addColorStop(1, 'rgba(30,20,10,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
  }
}

export const ARENA_TEXTURES = {
  // ---------------- comuns
  grass_dry: () => tex(256, 3, (g, s) => {
    g.fillStyle = '#8a7a4a'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#6a5a32', '#a8955a', '#5a6a32', '#c2ae70'], 6000, [1, 3], 0.5);
    g.strokeStyle = 'rgba(70,60,30,0.5)';
    for (let i = 0; i < 500; i++) { const x = Math.random() * s, y = Math.random() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-2, 2), y - rnd(3, 7)); g.stroke(); }
  }, { roughness: 1 }),
  dirt: () => tex(256, 3, (g, s) => {
    g.fillStyle = '#6a5038'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#4a3626', '#8a6a4a', '#3a2a1e', '#a08060'], 6000, [1, 4], 0.45);
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(60,40,25,0.35)'; g.beginPath(); g.ellipse(Math.random() * s, Math.random() * s, rnd(3, 10), rnd(2, 6), Math.random() * 3, 0, Math.PI * 2); g.fill(); }
  }, { roughness: 1 }),
  bark: () => tex(128, 1.5, (g, s) => {
    g.fillStyle = '#3a2c22'; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(15,10,8,0.7)'; g.lineWidth = 2;
    for (let i = 0; i < 40; i++) { const x = Math.random() * s; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + rnd(-8, 8), s / 3, x + rnd(-8, 8), (2 * s) / 3, x + rnd(-6, 6), s); g.stroke(); }
    noise(g, s, ['#5a4636', '#1a120c'], 1500, [1, 3], 0.4);
  }),
  foliage_pine: () => tex(128, 2, (g, s) => {
    g.fillStyle = '#1e3226'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#2a4a34', '#142218', '#3a5a3a'], 3000, [1, 4], 0.6);
  }),
  wood_plank: () => tex(256, 1.2, (g, s) => {
    g.fillStyle = '#6a4a30'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 32) { g.fillStyle = 'rgba(30,18,10,0.6)'; g.fillRect(0, i, s, 2); }
    g.strokeStyle = 'rgba(40,25,15,0.35)';
    for (let i = 0; i < 60; i++) { const y = Math.random() * s; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(s / 3, y + rnd(-4, 4), (2 * s) / 3, y + rnd(-4, 4), s, y); g.stroke(); }
  }),
  wood_dark: () => tex(256, 1.2, (g, s) => {
    g.fillStyle = '#3a2618'; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(15,8,4,0.45)';
    for (let i = 0; i < 80; i++) { const y = Math.random() * s; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(s / 3, y + rnd(-5, 5), (2 * s) / 3, y + rnd(-5, 5), s, y); g.stroke(); }
    noise(g, s, ['#000', '#7a5a3a'], 900, [1, 2], 0.25);
  }),
  stone_trim: () => tex(256, 1.5, (g, s) => {
    g.fillStyle = '#a8a092'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#8a8476', '#c2baa8', '#6a6458'], 4000, [1, 4], 0.4);
  }),

  // ---------------- Orfanato Santa Mega-Freira
  brick_manor: () => tex(512, 1.6, (g, s) => bricks(g, s, { base: [122, 74, 56], mortar: '#6e6258', rows: 22, cols: 7, vary: 26, dirt: 0.3 })),
  stone_manor: () => tex(512, 2, (g, s) => {
    g.fillStyle = '#7a7266'; g.fillRect(0, 0, s, s);
    // blocos de pedra irregulares
    for (let y = 0; y < s; y += 42) {
      let x = -rnd(0, 40);
      while (x < s) { const w = rnd(50, 110); const k = rnd(0.85, 1.12); g.fillStyle = `rgb(${130 * k | 0},${122 * k | 0},${108 * k | 0})`; g.fillRect(x + 3, y + 3, w - 6, 36); x += w; }
    }
    noise(g, s, ['#000', '#fff'], 4000, [1, 3], 0.2);
  }),
  roof_red: () => tex(256, 1.4, (g, s) => {
    g.fillStyle = '#5a2a1e'; g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 22) {
      for (let x = (y / 22) % 2 ? -14 : 0; x < s; x += 28) {
        const k = rnd(0.8, 1.15);
        g.fillStyle = `rgb(${150 * k | 0},${66 * k | 0},${44 * k | 0})`;
        g.beginPath(); g.ellipse(x + 14, y + 14, 13, 12, 0, 0, Math.PI); g.fill();
      }
    }
    noise(g, s, ['#000', '#2a2a1a'], 2500, [1, 3], 0.3);
  }),
  hedge: () => tex(128, 2, (g, s) => {
    g.fillStyle = '#2e3a22'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#3e4e2a', '#1e2816', '#56643a'], 4000, [2, 5], 0.7);
  }),
  water_pond: () => tex(128, 4, (g, s) => {
    g.fillStyle = '#3a4a46'; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(200,220,220,0.15)';
    for (let i = 0; i < 30; i++) { const y = Math.random() * s; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(s / 3, y + 3, (2 * s) / 3, y - 3, s, y); g.stroke(); }
  }, { roughness: 0.1 }),
  statue_stone: () => tex(128, 1, (g, s) => {
    g.fillStyle = '#9a968c'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#6a6a5e', '#c4c0b2', '#4a5a3a'], 2500, [1, 3], 0.45);
  }),

  // ---------------- Bar Suvaco Seco
  tile_white: () => tex(256, 0.8, (g, s) => {
    g.fillStyle = '#5a5a58'; g.fillRect(0, 0, s, s);
    const n = 8;
    const w = s / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const k = rnd(0.82, 0.96);
      g.fillStyle = `rgb(${226 * k | 0},${224 * k | 0},${216 * k | 0})`;
      g.fillRect(x * w + 2, y * w + 2, w - 4, w - 4);
    }
    // encardido: manchas e escorridos
    for (let i = 0; i < 18; i++) { const x = Math.random() * s; const grd = g.createLinearGradient(x, 0, x, s); grd.addColorStop(0, 'rgba(90,70,40,0)'); grd.addColorStop(1, 'rgba(90,70,40,0.25)'); g.fillStyle = grd; g.fillRect(x, rnd(0, s / 2), rnd(4, 18), s); }
    noise(g, s, ['#3a3020', '#000'], 1500, [1, 3], 0.25);
  }, { roughness: 0.35 }),
  brick_red: () => tex(512, 1.4, (g, s) => bricks(g, s, { base: [140, 64, 44], mortar: '#5a4a40', rows: 18, cols: 6, vary: 30, dirt: 0.25 })),
  concrete_floor: () => tex(256, 3, (g, s) => {
    g.fillStyle = '#4a4642'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#2a2622', '#6a6660', '#3a2a1a'], 6000, [1, 4], 0.4);
    for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(20,14,8,0.25)'; g.beginPath(); g.ellipse(Math.random() * s, Math.random() * s, rnd(8, 30), rnd(5, 20), Math.random() * 3, 0, Math.PI * 2); g.fill(); }
  }, { roughness: 0.9 }),
  checker_floor: () => tex(256, 1.2, (g, s) => {
    const n = 4;
    const w = s / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = (x + y) % 2 ? '#2a2826' : '#b8b2a4';
      g.fillRect(x * w, y * w, w, w);
    }
    noise(g, s, ['#000', '#5a4a30'], 2500, [1, 3], 0.3);
  }, { roughness: 0.6 }),
  ceiling: () => tex(256, 3, (g, s) => {
    g.fillStyle = '#3a3836'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#1a1816', '#5a5652'], 3000, [1, 5], 0.4);
  }),
  asphalt: () => tex(256, 4, (g, s) => {
    g.fillStyle = '#2a2a2c'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#1a1a1c', '#4a4a4c', '#3a3a3a'], 8000, [1, 2], 0.6);
  }, { roughness: 0.95 }),
  sidewalk: () => tex(256, 1.5, (g, s) => {
    g.fillStyle = '#6a6862'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#4a4844';
    for (let i = 0; i < s; i += 64) { g.fillRect(i, 0, 3, s); g.fillRect(0, i, s, 3); }
    noise(g, s, ['#000', '#8a8880'], 3000, [1, 3], 0.3);
  }),
  felt_green: () => tex(128, 1, (g, s) => {
    g.fillStyle = '#1e6a3a'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#145a2e', '#2a7a46'], 2500, [1, 2], 0.5);
  }),
  chalkboard: () => tex(256, 1.6, (g, s) => {
    g.fillStyle = '#1e3a2a'; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(230,230,220,0.85)'; g.fillStyle = 'rgba(230,230,220,0.85)'; g.lineWidth = 2;
    g.font = '18px sans-serif';
    const names = ['Beto', 'Arthur', 'Thiago', 'Samuel', 'Rubens'];
    names.forEach((n, i) => {
      g.fillText(n, 20 + (i % 3) * 80, 40 + Math.floor(i / 3) * 90);
      for (let k = 0; k < 2 + i; k++) { g.beginPath(); g.moveTo(24 + (i % 3) * 80 + k * 8, 50 + Math.floor(i / 3) * 90); g.lineTo(24 + (i % 3) * 80 + k * 8, 72 + Math.floor(i / 3) * 90); g.stroke(); }
    });
  }),
  poster_choro: () => tex(256, 1, (g, s) => {
    const grd = g.createLinearGradient(0, 0, 0, s);
    grd.addColorStop(0, '#3a1a10'); grd.addColorStop(1, '#a8501e');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    // anjo estilizado
    g.fillStyle = '#d8d0c0';
    g.beginPath(); g.moveTo(60, 200); g.lineTo(80, 90); g.lineTo(100, 200); g.fill();
    g.beginPath(); g.ellipse(80, 80, 12, 14, 0, 0, Math.PI * 2); g.fill();
    for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(80, 110); g.quadraticCurveTo(80 + s2 * 60, 60, 80 + s2 * 50, 150); g.fill(); }
    g.fillStyle = '#f2e8d8'; g.font = 'italic bold 30px serif';
    g.fillText('choro', 128, 100); g.fillText('dos anjos', 120, 140);
  }),
  poster_flame: () => tex(128, 1, (g, s) => {
    g.fillStyle = '#1a2a5a'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#ffb030';
    g.beginPath(); g.moveTo(64, 20); g.quadraticCurveTo(90, 70, 64, 110); g.quadraticCurveTo(38, 70, 64, 20); g.fill();
    g.fillStyle = '#fff2a0';
    g.beginPath(); g.moveTo(64, 50); g.quadraticCurveTo(76, 80, 64, 104); g.quadraticCurveTo(52, 80, 64, 50); g.fill();
  }),
  dartboard: () => tex(128, 0.5, (g, s) => {
    g.fillStyle = '#111'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 20; i++) {
      g.fillStyle = i % 2 ? '#e8dcc0' : '#1a1a1a';
      g.beginPath(); g.moveTo(64, 64); g.arc(64, 64, 60, (i / 20) * Math.PI * 2, ((i + 1) / 20) * Math.PI * 2); g.fill();
    }
    for (const [r, c] of [[60, '#a01a1a'], [54, null], [38, '#1a7a3a'], [33, null], [8, '#a01a1a']]) {
      if (!c) continue;
      g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.arc(64, 64, r, 0, Math.PI * 2); g.stroke();
    }
  }),
  // placa de 3,4 × 1,2 m: a textura quadrada é esticada na largura, então desenha numa área
  // virtual com a mesma proporção da placa e o título se ajusta para caber inteiro (sem cortar)
  sign_suvaco: () => tex(512, 1, (g, s) => {
    const R = 3.4 / 1.2;
    const W = s * R;
    g.save();
    g.scale(1 / R, 1);
    g.fillStyle = '#7a4a26'; g.fillRect(0, 0, W, s);
    g.strokeStyle = 'rgba(40,20,10,0.4)'; g.lineWidth = 3;
    for (let i = 0; i < 40; i++) { const y = Math.random() * s; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + rnd(-6, 6)); g.stroke(); }
    g.strokeStyle = '#3a2010'; g.lineWidth = 18; g.strokeRect(9, 9, W - 18, s - 18);
    // dois galos estilizados
    g.fillStyle = '#e8c890';
    for (const x of [W / 2 - 70, W / 2 + 70]) {
      const d = x < W / 2 ? 1 : -1;
      g.beginPath(); g.ellipse(x, 110, 46, 34, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(x + d * 38, 70, 16, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#c03a20'; g.beginPath(); g.arc(x + d * 38, 50, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e8c890';
    }
    // título: maior tamanho que cabe com folga nas bordas
    const title = 'SUVAÇO SECO';
    let size = 230;
    g.font = `bold ${size}px Georgia, serif`;
    while (g.measureText(title).width > W - 140 && size > 40) { size -= 6; g.font = `bold ${size}px Georgia, serif`; }
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#2a140a'; g.fillText(title, W / 2 + 6, 352 + 6);
    g.fillStyle = '#f6ead2'; g.fillText(title, W / 2, 352);
    g.font = 'italic 64px Georgia, serif';
    g.fillText('bar & sinuca', W / 2, 452);
    g.restore();
  }),
  crate_red: () => crate('#b82a24'),
  crate_blue: () => crate('#2a4ab0'),
  crate_yellow: () => crate('#d8a624'),

  // ---------------- Coliseu
  sand: () => tex(512, 5, (g, s) => {
    g.fillStyle = '#c9a46a'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#a8844e', '#e0c08a', '#8a6a3a', '#f0d8a8'], 12000, [1, 3], 0.45);
    // rachaduras
    g.strokeStyle = 'rgba(90,60,30,0.45)'; g.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) {
      let x = Math.random() * s, y = Math.random() * s;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += rnd(-22, 22); y += rnd(-22, 22); g.lineTo(x, y); }
      g.stroke();
    }
  }, { roughness: 1 }),
  stone_block: () => tex(512, 2.4, (g, s) => {
    g.fillStyle = '#7a6448'; g.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 64) {
      let x = -rnd(0, 60);
      while (x < s) { const w = rnd(90, 160); const k = rnd(0.82, 1.12); g.fillStyle = `rgb(${196 * k | 0},${164 * k | 0},${118 * k | 0})`; g.fillRect(x + 3, y + 3, w - 6, 58); x += w; }
    }
    noise(g, s, ['#5a4a32', '#e8d0a0', '#000'], 6000, [1, 4], 0.3);
  }),
  stone_worn: () => tex(256, 2, (g, s) => {
    g.fillStyle = '#b8966a'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#8a6a44', '#d8b888', '#6a5030', '#000'], 6000, [1, 5], 0.35);
  }),
  banner_red: () => tex(256, 3, (g, s) => {
    g.fillStyle = '#9a2a1a'; g.fillRect(0, 0, s, s);
    g.strokeStyle = '#d8a43a'; g.lineWidth = 6;
    g.strokeRect(14, 14, s - 28, s - 28);
    g.beginPath(); g.arc(s / 2, s / 2, 50, 0, Math.PI * 2); g.moveTo(s / 2, s / 2 - 70); g.lineTo(s / 2, s / 2 + 70); g.moveTo(s / 2 - 50, s / 2 - 20); g.quadraticCurveTo(s / 2, s / 2 - 70, s / 2 + 50, s / 2 - 20); g.stroke();
    noise(g, s, ['#000', '#5a1a10'], 2500, [1, 3], 0.35);
  }),

  // ---------------- Ruínas do Ritual: chão de pedras escuras com o círculo de invocação roxo (brilha: glow)
  ritual_circle: () => tex(1024, 1, (g) => {
    g.fillStyle = '#1c1820'; g.fillRect(0, 0, 1024, 1024);
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
    // fora do círculo: transparente aos poucos (o chão de terra aparece)
    g.save();
    g.globalCompositeOperation = 'destination-in';
    const fade = g.createRadialGradient(512, 512, 470, 512, 512, 512);
    fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fade; g.fillRect(0, 0, 1024, 1024);
    g.restore();
    g.translate(512, 512);
    g.strokeStyle = 'rgba(150,100,230,0.85)';
    g.shadowColor = '#a46bff'; g.shadowBlur = 8; g.lineWidth = 3;
    for (const r of [430, 400, 250]) { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); }
    g.lineWidth = 2.5;
    g.beginPath();
    for (let i = 0; i <= 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(a) * 400, y = Math.sin(a) * 400;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
    g.font = 'bold 34px serif'; g.fillStyle = 'rgba(190,140,255,0.9)';
    const glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
    for (let i = 0; i < 36; i++) { g.save(); g.rotate((i / 36) * Math.PI * 2); g.fillText(glyphs[i % glyphs.length], -10, -408); g.restore(); }
  }, { glow: 0.35 }),
  ground_graveyard: () => tex(256, 3, (g, s) => {
    g.fillStyle = '#3a3442'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#2a2430', '#4a4252', '#1e1a24', '#5a5060'], 6000, [1, 4], 0.45);
  }, { roughness: 1 }),

  // ---------------- Santo Berço
  // reboco claro de casa medieval (as vigas escuras são peças do modelo); manchas de umidade embaixo
  timber_wall: () => tex(256, 2, (g, s) => {
    g.fillStyle = '#e4dcc6'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#c8bea4', '#f2ecdc', '#b0a68c'], 5000, [1, 4], 0.35);
    const grd = g.createLinearGradient(0, s * 0.7, 0, s);
    grd.addColorStop(0, 'rgba(90,80,60,0)'); grd.addColorStop(1, 'rgba(90,80,60,0.25)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  }),
  // grama viva e farta (o Santo Berço deixa o solo "perfeito para viver")
  grass_lush: () => tex(256, 3, (g, s) => {
    g.fillStyle = '#4a6a2a'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#3a5a22', '#5a7a32', '#6a8a3a', '#2e4a1e'], 7000, [1, 3], 0.55);
    g.strokeStyle = 'rgba(30,50,20,0.5)';
    for (let i = 0; i < 600; i++) { const x = Math.random() * s, y = Math.random() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-2, 2), y - rnd(3, 7)); g.stroke(); }
    // florzinhas de cores estranhas
    for (let i = 0; i < 40; i++) { g.fillStyle = ['#c8a0e8', '#f0d060', '#e87aa0'][i % 3]; g.beginPath(); g.arc(Math.random() * s, Math.random() * s, 1.6, 0, Math.PI * 2); g.fill(); }
  }, { roughness: 1 }),
  hay: () => tex(128, 1, (g, s) => {
    g.fillStyle = '#c8a650'; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(120,90,30,0.5)';
    for (let i = 0; i < 300; i++) { const x = Math.random() * s, y = Math.random() * s, a = rnd(-0.4, 0.4); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); g.stroke(); }
  }),
  // o SÍMBOLO ESPIRAL entalhado na laje da praça: espiral de curvas concêntricas e o anel de sigilos em volta
  spiral_symbol: () => tex(512, 1, (g, s) => {
    const c = s / 2;
    // fundo transparente: o entalhe aparece direto sobre a laje de pedra
    g.clearRect(0, 0, s, s);
    g.strokeStyle = 'rgba(30,24,28,0.85)'; g.lineCap = 'round';
    // anel duplo
    g.lineWidth = 6; g.beginPath(); g.arc(c, c, s * 0.46, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.arc(c, c, s * 0.38, 0, Math.PI * 2); g.stroke();
    // sigilos entre os anéis
    g.font = 'bold 26px serif'; g.fillStyle = 'rgba(30,24,28,0.85)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const sig = 'ᛟᚱᛝᛉᚦᛗᛞᚹᛊᛏᚲᛒ';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.save(); g.translate(c + Math.cos(a) * s * 0.42, c + Math.sin(a) * s * 0.42); g.rotate(a + Math.PI / 2); g.fillText(sig[i], 0, 0); g.restore();
    }
    // a espiral: várias curvas saindo do centro e se abrindo
    for (let k = 0; k < 7; k++) {
      g.lineWidth = 7 - k * 0.6;
      g.beginPath();
      for (let t = 0; t <= 1.001; t += 0.01) {
        const a = k * 0.9 + t * Math.PI * 2.2;
        const r = s * (0.03 + 0.31 * t) * (1 - k * 0.06);
        const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r;
        if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
  }),
  lodo_black: () => tex(128, 2, (g, s) => {
    g.fillStyle = '#060508'; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(120,110,140,0.25)';
    for (let i = 0; i < 20; i++) { g.beginPath(); g.arc(Math.random() * s, Math.random() * s, rnd(4, 18), 0, Math.PI * 2); g.stroke(); }
  }, { roughness: 0.05 }),
  // ---------------- Acampamento Varminho (Sinais do Outro Lado)
  // grama escura de mato à noite, com falhas de terra
  ground_camp: () => tex(256, 4, (g, s) => {
    g.fillStyle = '#1e2a1c'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#16201a', '#2a3a24', '#3a3424', '#121812', '#34442a'], 7000, [1, 4], 0.5);
    g.strokeStyle = 'rgba(60,80,44,0.35)'; g.lineWidth = 1;
    for (let i = 0; i < 400; i++) { const x = Math.random() * s; const y = Math.random() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-2, 2), y - rnd(3, 7)); g.stroke(); }
  }, { roughness: 1 }),
  // clareira de terra batida em volta da fogueira (decalque redondo, bordas que somem na grama)
  camp_dirt: () => tex(512, 1, (g, s) => {
    const grd = g.createRadialGradient(s / 2, s / 2, s * 0.05, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(70,52,36,1)');
    grd.addColorStop(0.55, 'rgba(62,48,34,0.95)');
    grd.addColorStop(0.85, 'rgba(52,44,32,0.45)');
    grd.addColorStop(1, 'rgba(40,40,30,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 2500; i++) {
      const a = Math.random() * Math.PI * 2; const r = Math.sqrt(Math.random()) * s * 0.45;
      g.fillStyle = Math.random() < 0.5 ? 'rgba(30,22,16,0.4)' : 'rgba(110,90,64,0.35)';
      g.fillRect(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r, rnd(1, 3), rnd(1, 3));
    }
    // cinza e carvão perto do fogo
    const ash = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s * 0.16);
    ash.addColorStop(0, 'rgba(20,16,14,0.9)'); ash.addColorStop(1, 'rgba(40,36,32,0)');
    g.fillStyle = ash; g.fillRect(0, 0, s, s);
  }),
  // lateral da van "Chico Eletrônicos" dos Cinco: grafite verde neon com o alienígena de asas e o nome em letra cursiva
  van_side: () => tex(1024, 1, (g, s) => {
    const R = 3.1; // proporção do decalque (4,4 m × 1,42 m)
    const W = s * R;
    g.save();
    g.scale(1 / R, 1);
    g.clearRect(0, 0, W, s);
    // linhas de relevo topográfico (a pintura da arte conceitual)
    g.strokeStyle = 'rgba(80,255,120,0.35)'; g.lineWidth = 7;
    for (let k = 0; k < 9; k++) {
      g.beginPath();
      for (let x = 0; x <= W; x += 40) g.lineTo(x, 120 + k * 100 + Math.sin(x * 0.004 + k) * 50 + Math.sin(x * 0.011 + k * 2) * 20);
      g.stroke();
    }
    // alienígena com asas (a marca da van)
    const cx = W * 0.62; const cy = s * 0.47;
    g.fillStyle = 'rgba(60,255,110,0.9)';
    for (const d of [-1, 1]) {
      g.beginPath(); g.moveTo(cx + d * 90, cy);
      g.quadraticCurveTo(cx + d * 420, cy - 260, cx + d * 560, cy - 120);
      g.quadraticCurveTo(cx + d * 400, cy - 60, cx + d * 470, cy + 40);
      g.quadraticCurveTo(cx + d * 300, cy + 20, cx + d * 330, cy + 130);
      g.quadraticCurveTo(cx + d * 200, cy + 60, cx + d * 90, cy + 90);
      g.fill();
    }
    g.beginPath(); g.ellipse(cx, cy - 20, 150, 190, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#081a0c';
    for (const d of [-1, 1]) { g.beginPath(); g.ellipse(cx + d * 66, cy - 30, 58, 92, d * -0.5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(255,90,200,0.85)';
    g.beginPath(); g.arc(cx, cy + 120, 14, 0, Math.PI * 2); g.fill();
    // nome em letra cursiva, com contorno escuro
    g.font = 'italic bold 230px "Brush Script MT", "Segoe Script", cursive';
    g.textAlign = 'left'; g.textBaseline = 'middle';
    g.lineWidth = 18; g.strokeStyle = '#06140a';
    g.strokeText('Chico', 120, s * 0.36);
    g.fillStyle = '#ff6ad8'; g.fillText('Chico', 120, s * 0.36);
    g.font = 'italic bold 150px "Brush Script MT", "Segoe Script", cursive';
    g.strokeText('Eletrônicos', 160, s * 0.66);
    g.fillStyle = '#7dff9a'; g.fillText('Eletrônicos', 160, s * 0.66);
    g.restore();
  }, { glow: 0.35 }),
  // placas de papelão escritas à mão dos conspiracionistas
  sign_vindo: () => cardboard(['ELES', 'ESTÃO', 'VINDO!'], '#b01818'),
  sign_levem: () => cardboard(['NOS', 'LEVEM', 'JUNTO'], '#141414', true),
  sign_sinal: () => cardboard(['O SINAL', 'É REAL'], '#1a3aa0'),
  sign_varminho: () => cardboard(['VARMINHO', '26·07·90', 'NÃO', 'ESQUEÇA'], '#141414'),
  // chapa ondulada escura da estação abandonada
  shed_metal: () => tex(256, 1.2, (g, s) => {
    g.fillStyle = '#26262c'; g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 16) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x, 0, 6, s); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + 9, 0, 4, s); }
    noise(g, s, ['#4a2a1a', '#1a1a1e', '#3a3a40'], 1200, [1, 5], 0.4); // ferrugem
  }),
  // porta dupla de metal da estação
  shed_door: () => tex(256, 1, (g, s) => {
    g.fillStyle = '#5a5e68'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#3a3e46'; g.fillRect(s / 2 - 3, 0, 6, s);
    g.strokeStyle = '#2a2c34'; g.lineWidth = 6; g.strokeRect(10, 10, s - 20, s - 20);
    for (const x of [s / 2 - 30, s / 2 + 18]) { g.fillStyle = '#8a8e98'; g.fillRect(x, s * 0.5, 12, 30); }
    noise(g, s, ['#6a3a22', '#2a2a30'], 500, [1, 4], 0.35);
  }),
  // pichação na parede da estação: o símbolo da emissora (antena com ondas) e "TV VARMINHO"
  station_tag: () => tex(512, 1, (g, s) => {
    g.clearRect(0, 0, s, s);
    g.strokeStyle = 'rgba(230,230,240,0.85)'; g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(s / 2, s * 0.62); g.lineTo(s / 2, s * 0.28); g.stroke();
    g.beginPath(); g.moveTo(s * 0.38, s * 0.62); g.lineTo(s / 2, s * 0.4); g.lineTo(s * 0.62, s * 0.62); g.stroke();
    for (const r of [60, 110, 160]) { g.beginPath(); g.arc(s / 2, s * 0.28, r, -Math.PI * 0.85, -Math.PI * 0.15); g.stroke(); }
    g.font = 'bold 64px Impact, sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(230,230,240,0.85)';
    g.fillText('TV VARMINHO', s / 2, s * 0.86);
  }),
};

function crate(color) {
  return tex(128, 0.45, (g, s) => {
    g.fillStyle = color; g.fillRect(0, 0, s, s);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    for (let i = 0; i < 3; i++) g.fillRect(14 + i * 38, 30, 22, 50);
    noise(g, s, ['#000', '#fff'], 600, [1, 2], 0.2);
  });
}

// placa de papelão escrita à mão (texto em linhas, tinta da cor pedida); torta = letras tremidas
function cardboard(lines, ink, shaky = false) {
  return tex(256, 1, (g, s) => {
    g.fillStyle = '#b08a5a'; g.fillRect(0, 0, s, s);
    noise(g, s, ['#9a7646', '#c49c6a', '#8a6a40'], 1500, [1, 3], 0.4);
    g.strokeStyle = 'rgba(80,56,30,0.5)'; g.lineWidth = 3; g.strokeRect(6, 6, s - 12, s - 12);
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    const n = lines.length;
    const size = Math.min(70, Math.floor((s - 30) / n));
    lines.forEach((t, i) => {
      g.save();
      g.translate(s / 2, 20 + (i + 0.5) * ((s - 40) / n));
      g.rotate(rnd(-0.06, 0.06) + (shaky ? rnd(-0.06, 0.06) : 0));
      let sz = size;
      g.font = `bold ${sz}px "Comic Sans MS", "Segoe Print", sans-serif`;
      while (g.measureText(t).width > s - 30 && sz > 20) { sz -= 4; g.font = `bold ${sz}px "Comic Sans MS", "Segoe Print", sans-serif`; }
      g.fillText(t, 0, 0);
      g.restore();
    });
  });
}
