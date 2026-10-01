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
  if (opts.roughness !== undefined) return { map: t, roughness: opts.roughness };
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
};

function crate(color) {
  return tex(128, 0.45, (g, s) => {
    g.fillStyle = color; g.fillRect(0, 0, s, s);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    for (let i = 0; i < 3; i++) g.fillRect(14 + i * 38, 30, 22, 50);
    noise(g, s, ['#000', '#fff'], 600, [1, 2], 0.2);
  });
}
