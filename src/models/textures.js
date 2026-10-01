import * as THREE from 'three';

// Texturas pintadas em canvas e aplicadas nos modelos do Blender pelo NOME do
// material (ex.: material "face_mascarado" no Blender → MATERIAL_TEXTURES.face_mascarado).
// Uma entrada pode devolver uma textura ou { map, emissiveMap, emissive }.
//
// ROSTOS: o UV da cabeça (tools/blender/lib.py → head_part) tem a frente em u = 0.5 e
// o topo em v = 1. No canvas 512 × 256: centro do rosto em x = 256; olhos em y ≈ 120,
// nariz ≈ 145, boca ≈ 168. x > 256 = lado ESQUERDO do personagem.

const W = 512;
const HT = 256;
const CX = 256;
const EYE_Y = 120;
const NOSE_Y = 146;
const MOUTH_Y = 170;

function canvasTex(w, h, paint, { wrap = false, repeat } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

// ------------------------------------------------------------ pintura de rosto
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

function baseSkin(g, skin) {
  g.fillStyle = skin;
  g.fillRect(0, 0, W, HT);
  // sombra suave nas laterais (volume do rosto) e sob o queixo
  const side = g.createRadialGradient(CX, 135, 40, CX, 135, 170);
  side.addColorStop(0, 'rgba(0,0,0,0)');
  side.addColorStop(1, 'rgba(40,20,10,0.28)');
  g.fillStyle = side;
  g.fillRect(0, 0, W, HT);
  // bochechas levemente rosadas
  for (const s of [-1, 1]) {
    const b = g.createRadialGradient(CX + s * 46, 150, 2, CX + s * 46, 150, 22);
    b.addColorStop(0, 'rgba(190,80,70,0.16)');
    b.addColorStop(1, 'rgba(190,80,70,0)');
    g.fillStyle = b;
    g.fillRect(CX + s * 46 - 24, 126, 48, 48);
  }
}

function eye(g, x, y, s, o) {
  const w = o.w ?? 15;
  const h = o.h ?? 8;
  const tilt = (o.tilt ?? 0.08) * s; // canto externo um pouco mais alto
  g.save();
  g.translate(x, y);
  g.rotate(-tilt);
  // branco do olho (amendoado)
  g.beginPath();
  g.moveTo(-w, 0);
  g.quadraticCurveTo(0, -h * 1.35, w, -1);
  g.quadraticCurveTo(0, h * 1.0, -w, 0);
  g.closePath();
  g.fillStyle = o.sclera || '#f3eee6';
  g.fill();
  g.save();
  g.clip();
  // íris
  const ir = o.irisR ?? 6.2;
  const ix = (o.look ?? 0) * s;
  const grad = g.createRadialGradient(ix, -1, 1, ix, -1, ir);
  grad.addColorStop(0, o.irisLight || o.iris);
  grad.addColorStop(1, o.iris);
  g.fillStyle = grad;
  g.beginPath(); g.arc(ix, -1, ir, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 1.2;
  g.stroke();
  g.fillStyle = '#060406';
  g.beginPath(); g.arc(ix, -1, ir * 0.42, 0, Math.PI * 2); g.fill();
  if (o.glow) {
    g.fillStyle = o.glow;
    g.beginPath(); g.arc(ix, -1, ir * 1.1, 0, Math.PI * 2); g.fill();
  }
  // brilho
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.beginPath(); g.arc(ix + 2, -3.4, 1.6, 0, Math.PI * 2); g.fill();
  // sombra da pálpebra
  g.fillStyle = 'rgba(40,20,20,0.22)';
  g.fillRect(-w, -h * 1.4, w * 2, h * 0.7);
  g.restore();
  // pálpebra superior (traço grosso de HQ)
  g.strokeStyle = o.lash || '#140c0a';
  g.lineWidth = o.lid ?? 3.2;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-w - 1, 0.5);
  g.quadraticCurveTo(0, -h * 1.45, w + 2, -1.5);
  g.stroke();
  // pálpebra inferior
  g.lineWidth = 1.1;
  g.strokeStyle = 'rgba(30,15,10,0.55)';
  g.beginPath();
  g.moveTo(-w + 3, 1.5);
  g.quadraticCurveTo(0, h * 1.05, w - 1, 0.5);
  g.stroke();
  // olheira / cansaço
  if (o.bags) {
    g.strokeStyle = 'rgba(60,30,30,0.3)';
    g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-w + 5, h + 3); g.quadraticCurveTo(0, h + 6, w - 2, h + 1); g.stroke();
  }
  g.restore();
}

function brow(g, x, y, s, o) {
  // sobrancelha afinando para fora; angry > 0 abaixa a ponta interna
  const len = o.len ?? 22;
  const th = o.thick ?? 5;
  const ang = o.angry ?? 4;
  g.fillStyle = o.color || '#151010';
  g.beginPath();
  g.moveTo(x - s * 4, y + ang);
  g.quadraticCurveTo(x + s * (len * 0.5), y - 4 - (o.arch ?? 2), x + s * len, y + 1);
  g.lineTo(x + s * len, y + 2.5);
  g.quadraticCurveTo(x + s * (len * 0.5), y - 4 - (o.arch ?? 2) + th, x - s * 4, y + ang + th);
  g.closePath();
  g.fill();
}

function noseMouth(g, o) {
  const ink = 'rgba(70,32,24,0.65)';
  // nariz: sombra lateral + narinas
  g.strokeStyle = ink;
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(CX - 4, NOSE_Y - 20);
  g.quadraticCurveTo(CX - 8, NOSE_Y - 2, CX - 3, NOSE_Y + 2);
  g.stroke();
  g.fillStyle = 'rgba(60,25,20,0.55)';
  for (const s of [-1, 1]) {
    g.beginPath(); g.ellipse(CX + s * 6, NOSE_Y + 2, 2.6, 1.6, 0, 0, Math.PI * 2); g.fill();
  }
  const nb = g.createRadialGradient(CX, NOSE_Y - 4, 1, CX, NOSE_Y - 4, 14);
  nb.addColorStop(0, 'rgba(255,255,255,0.12)');
  nb.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = nb;
  g.fillRect(CX - 14, NOSE_Y - 18, 28, 28);
  // boca
  const mw = o.mouthW ?? 16;
  const smile = o.smile ?? 0;
  const y = MOUTH_Y;
  if (o.grin) {
    // sorriso largo com dentes
    g.fillStyle = '#2a1012';
    g.beginPath();
    g.moveTo(CX - mw * 1.6, y - 3);
    g.quadraticCurveTo(CX, y + 18, CX + mw * 1.6, y - 3);
    g.quadraticCurveTo(CX, y + 4, CX - mw * 1.6, y - 3);
    g.fill();
    g.fillStyle = '#efe8dc';
    g.beginPath();
    g.moveTo(CX - mw * 1.45, y - 1.5);
    g.quadraticCurveTo(CX, y + 9, CX + mw * 1.45, y - 1.5);
    g.quadraticCurveTo(CX, y + 4, CX - mw * 1.45, y - 1.5);
    g.fill();
    g.strokeStyle = 'rgba(40,20,20,0.5)'; g.lineWidth = 0.8;
    for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(CX + i * 6, y + 1); g.lineTo(CX + i * 6, y + 6); g.stroke(); }
    return;
  }
  g.strokeStyle = o.lipLine || '#4a2220';
  g.lineWidth = 2.4;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(CX - mw, y - smile * 0.4);
  g.quadraticCurveTo(CX, y + smile, CX + mw, y - smile * 0.4 - (o.smirk ?? 0));
  g.stroke();
  // lábio inferior (sombra)
  g.fillStyle = o.lip || 'rgba(150,70,60,0.35)';
  g.beginPath(); g.ellipse(CX, y + 6, mw * 0.6, 3.2, 0, 0, Math.PI * 2); g.fill();
  if (o.fangs) {
    g.fillStyle = '#f6f2ea';
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(CX + s * 7, y);
      g.lineTo(CX + s * 10, y);
      g.lineTo(CX + s * 8.5, y + 6);
      g.closePath();
      g.fill();
    }
  }
}

function stubble(g, color = 'rgba(30,20,15,0.22)', density = 900, area = { y0: 150, y1: 215, w: 70 }) {
  g.fillStyle = color;
  for (let i = 0; i < density; i++) {
    const a = Math.random() * Math.PI - Math.PI;
    const x = CX + (Math.random() * 2 - 1) * area.w;
    const y = area.y0 + Math.random() * (area.y1 - area.y0);
    if (Math.abs(x - CX) > area.w * (0.4 + (y - area.y0) / (area.y1 - area.y0) * 0.6)) continue;
    if (Math.abs(y - MOUTH_Y) < 4 && Math.abs(x - CX) < 18) continue;
    g.fillRect(x, y, 1.4, 1.4);
    void a;
  }
}


// barba pintada ao redor da boca e na mandíbula (o volume do queixo vem do modelo)
function beardPaint(g, color, { mustache = color, full = true } = {}) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(CX - 78, 150);
  g.quadraticCurveTo(CX - 72, 205, CX, 222);
  g.quadraticCurveTo(CX + 72, 205, CX + 78, 150);
  g.quadraticCurveTo(CX + 60, full ? 176 : 196, CX + 24, MOUTH_Y + 2);
  g.quadraticCurveTo(CX, MOUTH_Y + 12, CX - 24, MOUTH_Y + 2);
  g.quadraticCurveTo(CX - 60, full ? 176 : 196, CX - 78, 150);
  g.fill();
  // textura de fios
  g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 1;
  for (let i = 0; i < 160; i++) {
    const x = CX - 70 + Math.random() * 140, y = 160 + Math.random() * 60;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 3, y + 5); g.stroke();
  }
  // bigode
  g.fillStyle = mustache;
  g.beginPath();
  g.moveTo(CX - 26, MOUTH_Y - 1);
  g.quadraticCurveTo(CX - 14, MOUTH_Y - 15, CX, MOUTH_Y - 9);
  g.quadraticCurveTo(CX + 14, MOUTH_Y - 15, CX + 26, MOUTH_Y - 1);
  g.quadraticCurveTo(CX, MOUTH_Y - 5, CX - 26, MOUTH_Y - 1);
  g.fill();
}

function face(paintExtras, o) {
  return () => canvasTex(W, HT, (g) => {
    baseSkin(g, o.skin);
    if (o.before) o.before(g);
    for (const s of o.noEyes ? [] : [-1, 1]) {
      const eo = { ...o.eye, iris: (s > 0 ? o.eye.irisL : o.eye.irisR) || o.eye.iris };
      eye(g, CX + s * (o.eyeGap ?? 32), EYE_Y, s, eo);
      brow(g, CX + s * ((o.eyeGap ?? 32) - 10), EYE_Y - 20, s, o.brow || {});
    }
    noseMouth(g, o.mouth || {});
    if (o.after) o.after(g);
    if (paintExtras) paintExtras(g);
  }, { wrap: true });
}

// ------------------------------------------------------------ peles com padrões
function glyphs(g, x0, y0, w, h, color, size = 11, density = 0.7) {
  g.fillStyle = color;
  g.font = `${size}px serif`;
  const set = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ⊕⊗ᛝ';
  for (let y = y0 + size; y < y0 + h; y += size + 2) {
    for (let x = x0; x < x0 + w; x += size * 0.8) {
      if (Math.random() < density) g.fillText(set[Math.floor(Math.random() * set.length)], x, y);
    }
  }
}

const LATIN = 'iustitia lex propterea moveat fiat justitia ruat caelum dura lex sed lex nemo iudex in causa sua veritas audi alteram partem poena culpa ius vindicta sententia ';

// desenha um padrão de labirinto (linhas retas que viram em ângulo reto) numa área
function mazeLines(g, x0, y0, w, h, cell, color, width = 1.6) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = 'square';
  for (let y = y0; y < y0 + h; y += cell) {
    for (let x = x0; x < x0 + w; x += cell) {
      g.beginPath();
      const r = Math.random();
      if (r < 0.35) { g.moveTo(x, y); g.lineTo(x + cell, y); g.lineTo(x + cell, y + cell); }
      else if (r < 0.7) { g.moveTo(x, y); g.lineTo(x, y + cell); g.lineTo(x + cell * 0.6, y + cell); }
      else { g.moveTo(x + cell * 0.5, y); g.lineTo(x + cell * 0.5, y + cell * 0.5); g.lineTo(x, y + cell * 0.5); }
      g.stroke();
    }
  }
}

export const MATERIAL_TEXTURES = {
  // ---------------- CINERARIA: queimadura no lado ESQUERDO (x > 256)
  face_cineraria: face((g) => {
    stubble(g, 'rgba(30,20,15,0.25)', 700);
  }, {
    skin: '#c49478',
    eye: { iris: '#2a2018', irisL: '#5a3a7a', irisLight: '#6a5040', bags: true, tilt: 0.05 },
    brow: { angry: 5, thick: 5.5 },
    mouth: { mouthW: 14, smile: -1, smirk: 2 },
    before(g) {
      // queimadura: pele derretida e rachada do lado esquerdo (testa → olho → bochecha → pescoço)
      g.save();
      g.beginPath();
      g.moveTo(CX + 6, 30);
      g.bezierCurveTo(CX + 70, 20, CX + 120, 60, CX + 112, 130);
      g.bezierCurveTo(CX + 106, 200, CX + 60, 250, CX + 24, 256);
      g.bezierCurveTo(CX + 30, 200, CX + 8, 150, CX + 14, 110);
      g.bezierCurveTo(CX + 18, 80, CX - 4, 60, CX + 6, 30);
      g.closePath();
      const burn = g.createRadialGradient(CX + 60, 120, 10, CX + 60, 120, 110);
      burn.addColorStop(0, '#8e3a26');
      burn.addColorStop(0.6, '#a75236');
      burn.addColorStop(1, '#b8775a');
      g.fillStyle = burn;
      g.fill();
      g.clip();
      // placas e rachaduras com contorno escuro (como nas artes)
      for (let i = 0; i < 70; i++) {
        const x = CX + 10 + Math.random() * 105;
        const y = 30 + Math.random() * 225;
        const r = 4 + Math.random() * 11;
        g.fillStyle = Math.random() < 0.5 ? 'rgba(110,40,28,0.55)' : 'rgba(200,120,90,0.35)';
        g.beginPath(); g.ellipse(x, y, r, r * 0.7, Math.random() * 3, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(40,12,8,0.7)'; g.lineWidth = 1.2; g.stroke();
      }
      g.restore();
    },
  }),

  // ---------------- ABUTRE: heterocromia (direito castanho, esquerdo verde), cicatriz diagonal
  face_abutre: face((g) => {
    // cicatriz diagonal da testa, cruzando o olho direito e o nariz
    g.strokeStyle = '#7a3c34'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX - 60, 60); g.lineTo(CX + 8, 162); g.stroke();
    g.strokeStyle = 'rgba(240,190,170,0.6)'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(CX - 58, 62); g.lineTo(CX + 9, 160); g.stroke();
    // mais dois rasgos de garra, paralelos e menores (testa e bochecha), avermelhados como na arte
    for (const [x0, y0, x1, y1] of [[CX - 28, 50, CX + 6, 98], [CX + 2, 132, CX + 30, 176]]) {
      g.strokeStyle = '#8a2e2a'; g.lineWidth = 3.2;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.strokeStyle = 'rgba(240,170,150,0.5)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0 + 1, y0 + 1); g.lineTo(x1, y1 - 1); g.stroke();
    }
    // rugas de expressão
    g.strokeStyle = 'rgba(80,40,30,0.35)'; g.lineWidth = 1.2;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(CX + s * 50, 112); g.lineTo(CX + s * 58, 118); g.stroke(); }
    g.beginPath(); g.moveTo(CX - 20, 80); g.lineTo(CX + 20, 80); g.stroke();
  }, {
    skin: '#c09a80',
    eye: { iris: '#4a3020', irisL: '#3f8a5a', irisLight: '#7ab88a', tilt: 0.02, bags: true },
    brow: { angry: 3, thick: 5, color: '#4a3a30' },
    mouth: { mouthW: 13, smile: -1 },
    after: (g) => beardPaint(g, '#b8b2aa', { mustache: '#4a3626' }),
  }),

  hand_abutre: () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#c09a80';
    g.fillRect(0, 0, 128, 128);
    // tatuagem tribal/escrita no dorso da mão
    g.strokeStyle = '#1a1210'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(44, 30); g.bezierCurveTo(64, 50, 54, 80, 70, 100); g.moveTo(64, 40); g.lineTo(84, 60); g.moveTo(56, 70); g.lineTo(36, 86); g.stroke();
  }),

  // ---------------- ERIN: olhos verdes com olheiras sutis, sardas, sorriso solto
  face_erin: face((g) => {
    // sardas no nariz e nas bochechas
    g.fillStyle = 'rgba(170,90,50,0.45)';
    for (let i = 0; i < 70; i++) {
      const s = Math.random() < 0.5 ? -1 : 1;
      const x = CX + s * (8 + Math.random() * 50), y = 132 + Math.random() * 30;
      g.beginPath(); g.arc(x, y, 1 + Math.random() * 1.2, 0, Math.PI * 2); g.fill();
    }
  }, {
    skin: '#eac2a8',
    eye: { iris: '#3a8a4a', irisLight: '#7ad08a', bags: true, tilt: -0.02, lashes: true },
    brow: { angry: -2, thick: 3.5, color: '#a04a20' },
    mouth: { mouthW: 13, smile: 4, lip: 'rgba(190,90,90,0.45)' },
  }),

  // ---------------- AGUIAR: barba feita (sombra), olhar duro, cicatriz pequena no queixo
  face_aguiar: face((g) => {
    stubble(g, 'rgba(25,18,14,0.28)', 1100);
    g.strokeStyle = '#a0685a'; g.lineWidth = 2.2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX - 22, 196); g.lineTo(CX - 12, 210); g.stroke();
  }, {
    skin: '#d9ad8e',
    eye: { iris: '#3a2a20', irisLight: '#6a5040', tilt: 0.08 },
    brow: { angry: 7, thick: 6.5, color: '#0e0d0f' },
    mouth: { mouthW: 13, smile: -1 },
  }),
  // braços com várias cicatrizes
  arms_aguiar: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#d9ad8e'; g.fillRect(0, 0, 256, 256);
    g.lineCap = 'round';
    for (let i = 0; i < 22; i++) {
      const x = Math.random() * 256, y = Math.random() * 256, a = Math.random() * Math.PI, l = 10 + Math.random() * 26;
      g.strokeStyle = 'rgba(150,80,70,0.7)'; g.lineWidth = 2.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      g.strokeStyle = 'rgba(245,205,185,0.6)'; g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(x + 1, y); g.lineTo(x + Math.cos(a) * l + 1, y + Math.sin(a) * l); g.stroke();
    }
    g.fillStyle = 'rgba(30,20,15,0.12)';
    for (let i = 0; i < 400; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 1, 2); // pelos
  }, { wrap: true }),
  // máscara do Mutilador Noturno: branca e suja, com a MÃO VERMELHA aberta sobre o rosto
  // (UV da frente da cabeça: olhos em x = 0,5 ± 0,126 e y ≈ 0,52; boca y ≈ 0,74)
  mask_mutilador: () => canvasTex(512, 512, (g) => {
    const w = 512, h = 512;
    g.fillStyle = '#e9e4d8'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,110,90,0.18)';
    for (let i = 0; i < 260; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 5, 0, Math.PI * 2); g.fill(); }
    // mão vermelha: palma no nariz/boca, dedos subindo pela testa (abertos), polegar na bochecha
    g.fillStyle = '#b8141a';
    g.beginPath(); g.ellipse(w * 0.5, h * 0.66, w * 0.13, h * 0.12, 0, 0, Math.PI * 2); g.fill();
    const finger = (x0, y0, x1, y1, r) => {
      g.lineWidth = r * 2; g.strokeStyle = '#b8141a'; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    };
    finger(w * 0.42, h * 0.58, w * 0.36, h * 0.2, 17);
    finger(w * 0.48, h * 0.56, w * 0.46, h * 0.13, 18);
    finger(w * 0.54, h * 0.56, w * 0.56, h * 0.14, 18);
    finger(w * 0.6, h * 0.58, w * 0.66, h * 0.22, 16);
    finger(w * 0.38, h * 0.7, w * 0.24, h * 0.62, 17); // polegar
    // escorridos de tinta
    g.strokeStyle = 'rgba(160,15,20,0.85)';
    for (let i = 0; i < 9; i++) {
      const x = w * (0.4 + Math.random() * 0.2);
      g.lineWidth = 3 + Math.random() * 4;
      g.beginPath(); g.moveTo(x, h * 0.72); g.lineTo(x + (Math.random() - 0.5) * 6, h * (0.8 + Math.random() * 0.12)); g.stroke();
    }
    // olhos: buracos pretos inclinados
    g.fillStyle = '#060606';
    for (const s of [-1, 1]) {
      g.save(); g.translate(w * (0.5 + s * 0.126), h * 0.52); g.rotate(s * 0.15);
      g.beginPath(); g.ellipse(0, 0, w * 0.06, h * 0.028, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    // fileiras de furinhos na boca
    for (let r = 0; r < 2; r++) for (let i = -3; i <= 3; i++) { g.beginPath(); g.arc(w * (0.5 + i * 0.028), h * (0.76 + r * 0.035), 4, 0, Math.PI * 2); g.fill(); }
    // rachaduras
    g.strokeStyle = 'rgba(40,30,25,0.6)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(w * 0.7, h * 0.3); g.lineTo(w * 0.74, h * 0.4); g.lineTo(w * 0.71, h * 0.46); g.stroke();
  }),

  // ---------------- LABIRINTO: pele pálida coberta de cicatrizes geométricas (escarificação em labirinto)
  skin_labirinto: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#e2d2c6'; g.fillRect(0, 0, 512, 512);
    mazeLines(g, 0, 0, 512, 512, 16, 'rgba(150,80,72,0.75)', 2.2);
    mazeLines(g, 4, 4, 512, 512, 16, 'rgba(250,225,215,0.5)', 0.8); // brilho da cicatriz
  }, { wrap: true }),
  face_labirinto: face((g) => {
    // cabeça raspada: o labirinto sobe pela testa e pelo crânio, contornando os olhos
    g.save();
    g.beginPath(); g.rect(0, 0, W, HT); g.ellipse(CX - 32, EYE_Y, 26, 16, 0, 0, Math.PI * 2); g.ellipse(CX + 32, EYE_Y, 26, 16, 0, 0, Math.PI * 2); g.ellipse(CX, 175, 30, 18, 0, 0, Math.PI * 2);
    g.clip('evenodd');
    mazeLines(g, 0, 0, W, HT, 14, 'rgba(150,80,72,0.7)', 2);
    g.restore();
  }, {
    skin: '#e2d2c6',
    eye: { iris: '#8a9098', irisLight: '#c0c8d0', tilt: 0, bags: true },
    brow: { angry: 0, thick: 2, color: '#b8a89a' },
    mouth: { mouthW: 12, smile: -1, lip: 'rgba(160,110,110,0.35)' },
  }),
  // retalhos de tecido desenhados com labirintos (saia por baixo da túnica)
  patch_skirt: () => canvasTex(256, 256, (g) => {
    const cols = ['#8a5a44', '#a07a5a', '#6a3a30', '#b08a6a'];
    for (let y = 0; y < 256; y += 32) for (let x = 0; x < 256; x += 32) {
      g.fillStyle = cols[(x / 32 + y / 32 * 3) % cols.length];
      g.fillRect(x + 1, y + 1, 30, 30);
      mazeLines(g, x + 4, y + 4, 24, 24, 8, 'rgba(40,20,16,0.6)', 1);
    }
    g.fillStyle = 'rgba(120,10,10,0.35)';
    for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(Math.random() * 256, 200 + Math.random() * 56, 6 + Math.random() * 10, 0, Math.PI * 2); g.fill(); } // sangue na barra
  }, { wrap: true }),
  feet_labirinto: () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#d8c6b8'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(110,20,16,0.6)';
    for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(Math.random() * 128, 60 + Math.random() * 68, 3 + Math.random() * 8, 0, Math.PI * 2); g.fill(); }
  }, { wrap: true }),
  // elmo de ferro arranhado com o SORRISO enorme (u 0,5 = frente; boca em y ≈ 0,62–0,8)
  helmet_labirinto: () => canvasTex(512, 512, (g) => {
    const w = 512, h = 512;
    g.fillStyle = '#7a7470'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(40,36,34,0.45)'; g.lineWidth = 1;
    for (let i = 0; i < 160; i++) { const x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 10); g.stroke(); }
    g.fillStyle = 'rgba(120,60,30,0.35)';
    for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 4 + Math.random() * 14, 0, Math.PI * 2); g.fill(); } // ferrugem
    // rebites
    g.fillStyle = '#4a4440';
    for (let x = 0; x < w; x += 24) { g.beginPath(); g.arc(x, h * 0.18, 4, 0, Math.PI * 2); g.fill(); }
    // lábios carnudos
    const cx = w * 0.5, cy = h * 0.71, mw = w * 0.2, mh = h * 0.11;
    g.fillStyle = '#b8484a';
    g.beginPath(); g.ellipse(cx, cy, mw, mh, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5a0e10';
    g.beginPath(); g.ellipse(cx, cy, mw * 0.86, mh * 0.72, 0, 0, Math.PI * 2); g.fill();
    // dentes enormes (fileira de cima e de baixo)
    g.fillStyle = '#efe6d4'; g.strokeStyle = '#8a7a66'; g.lineWidth = 2;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const x = cx - mw * 0.8 + (i / (n - 1)) * mw * 1.6;
      const tw = (mw * 1.6) / n;
      const curve = Math.cos(((i / (n - 1)) - 0.5) * Math.PI) * mh * 0.12;
      g.fillRect(x - tw / 2, cy - mh * 0.62 - curve * 0.5, tw - 2, mh * 0.55); g.strokeRect(x - tw / 2, cy - mh * 0.62 - curve * 0.5, tw - 2, mh * 0.55);
      g.fillRect(x - tw / 2, cy + mh * 0.08 + curve * 0.3, tw - 2, mh * 0.5); g.strokeRect(x - tw / 2, cy + mh * 0.08 + curve * 0.3, tw - 2, mh * 0.5);
    }
    g.fillStyle = 'rgba(200,120,120,0.6)'; // gengiva
    g.fillRect(cx - mw * 0.8, cy - mh * 0.7, mw * 1.6, mh * 0.1);
  }),
  paper_maze: () => canvasTex(128, 256, (g) => {
    g.fillStyle = '#e8e0cc'; g.fillRect(0, 0, 128, 256);
    mazeLines(g, 8, 8, 112, 240, 12, 'rgba(30,24,20,0.7)', 1.4);
  }, { wrap: true }),

  // ---------------- JOUI: cordas trançadas (listras diagonais = fios torcidos)
  rope_twist_red: () => canvasTex(64, 64, (g) => {
    g.fillStyle = '#8a1018'; g.fillRect(0, 0, 64, 64);
    g.strokeStyle = '#3a0608'; g.lineWidth = 5;
    for (let x = -64; x < 128; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, 64); g.stroke(); }
    g.strokeStyle = 'rgba(255,120,120,0.35)'; g.lineWidth = 1.5;
    for (let x = -64; x < 128; x += 12) { g.beginPath(); g.moveTo(x + 4, 0); g.lineTo(x + 44, 64); g.stroke(); }
  }, { wrap: true, repeat: [12, 1] }),
  rope_twist_cream: () => canvasTex(64, 64, (g) => {
    g.fillStyle = '#c8b08a'; g.fillRect(0, 0, 64, 64);
    g.strokeStyle = '#7a6448'; g.lineWidth = 4;
    for (let x = -64; x < 128; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, 64); g.stroke(); }
  }, { wrap: true, repeat: [6, 1] }),

  // ---------------- KAISER: pesponto do acolchoado na jaqueta e canelado na gola alta
  jacket: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#d6d4cc'; g.fillRect(0, 0, 256, 256);
    // faixas acolchoadas: costura horizontal + leve sombra embaixo de cada gomo
    for (let y = 0; y < 256; y += 64) {
      const grd = g.createLinearGradient(0, y, 0, y + 64);
      grd.addColorStop(0, 'rgba(255,255,255,0.06)'); grd.addColorStop(0.85, 'rgba(0,0,0,0.03)'); grd.addColorStop(1, 'rgba(0,0,0,0.08)');
      g.fillStyle = grd; g.fillRect(0, y, 256, 64);
      g.strokeStyle = 'rgba(90,88,82,0.3)'; g.lineWidth = 1; g.setLineDash([4, 3]);
      g.beginPath(); g.moveTo(0, y + 63); g.lineTo(256, y + 63); g.stroke();
    }
    g.setLineDash([]);
  }, { wrap: true, repeat: [1, 1] }),
  turtleneck: () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#141416'; g.fillRect(0, 0, 128, 128);
    for (let x = 0; x < 128; x += 6) { g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x, 0, 3, 128); }
  }, { wrap: true, repeat: [6, 2] }),

  // ---------------- XANDE: olhos azuis, rosto jovem; camiseta amarela com 3 triângulos e "oculto"
  face_xande: face((g) => {
    stubble(g, 'rgba(120,90,50,0.15)', 500);
    g.strokeStyle = 'rgba(160,80,70,0.6)'; g.lineWidth = 1.6; // arranhão de skate na bochecha
    g.beginPath(); g.moveTo(CX + 50, 150); g.lineTo(CX + 62, 158); g.stroke();
  }, {
    skin: '#e6bea2',
    eye: { iris: '#3a7ac0', irisLight: '#7ab8f0', tilt: -0.04 },
    brow: { angry: 1, thick: 3.5, color: '#6a4a24' },
    mouth: { mouthW: 13, smile: 1 },
  }),
  shirt_xande: () => canvasTex(512, 256, (g) => {
    g.fillStyle = '#e8bc22'; g.fillRect(0, 0, 512, 256);
    // frente do tronco = meio da textura (u ≈ 0,5)
    g.fillStyle = '#141414';
    const tri = (x, y, s) => { g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.9, y + s * 0.6); g.lineTo(x - s * 0.9, y + s * 0.6); g.closePath(); g.fill(); };
    tri(256, 70, 26); tri(226, 118, 22); tri(286, 118, 22);
    g.fillStyle = '#e8bc22';
    tri(256, 76, 12); tri(226, 122, 9); tri(286, 122, 9);
    g.fillStyle = '#141414'; g.font = 'bold 22px monospace'; g.textAlign = 'center';
    g.fillText('oculto', 256, 168);
    g.strokeStyle = 'rgba(120,90,10,0.35)'; g.lineWidth = 1;
    for (let y = 0; y < 256; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  }, { wrap: true }),

  // ---------------- MASCARADO: cicatriz em X na bochecha esquerda
  face_mascarado: face((g) => {
    g.strokeStyle = '#8a3e36'; g.lineWidth = 3.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX + 36, 142); g.lineTo(CX + 58, 166); g.moveTo(CX + 58, 142); g.lineTo(CX + 36, 166); g.stroke();
    stubble(g, 'rgba(25,20,15,0.3)', 800);
  }, {
    skin: '#d0a888',
    eye: { iris: '#2a1e18', irisLight: '#5a4030', tilt: 0.1 },
    brow: { angry: 6, thick: 6, color: '#0e0e10' },
    mouth: { mouthW: 13, smile: -1.5 },
  }),

  // ---------------- VAMPIRA: olhar provocador, presas
  face_vampira: face((g) => {
    // pintinha e tatuagem pequena no pescoço (parte de baixo do rosto)
    g.fillStyle = '#3a2420';
    g.beginPath(); g.arc(CX + 30, 184, 1.8, 0, Math.PI * 2); g.fill();
  }, {
    skin: '#d6a68c',
    eye: { iris: '#2a1414', irisLight: '#7a2a30', w: 16, h: 8.5, tilt: 0.14, lid: 3.8 },
    brow: { angry: -1, thick: 4.5, arch: 4 },
    mouth: { mouthW: 15, smile: 5, smirk: 3, fangs: true, lip: 'rgba(160,50,60,0.45)' },
  }),
  arms_vampira: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#d6a68c';
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(25,20,24,0.85)';
    g.lineWidth = 2;
    // sigilos de círculo e linhas (tatuagens rituais)
    for (let i = 0; i < 9; i++) {
      const x = 20 + Math.random() * 216;
      const y = 20 + Math.random() * 216;
      const r = 8 + Math.random() * 14;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r * 1.6); g.stroke();
    }
    for (let i = 0; i < 26; i++) {
      const x = Math.random() * 256, y = Math.random() * 256;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() > 0.5 ? 18 : 0), y + (Math.random() > 0.5 ? 0 : 18)); g.stroke();
    }
    // cicatrizes no antebraço
    g.strokeStyle = 'rgba(170,90,80,0.7)'; g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(100 + i * 9, 170); g.lineTo(108 + i * 9, 196); g.stroke(); }
  }, { wrap: true }),
  plaid: () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#8a8070'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(40,40,46,0.6)';
    for (let i = 0; i < 128; i += 32) { g.fillRect(i, 0, 12, 128); g.fillRect(0, i, 128, 12); }
    g.fillStyle = 'rgba(160,40,40,0.5)';
    for (let i = 16; i < 128; i += 32) { g.fillRect(i, 0, 3, 128); g.fillRect(0, i, 128, 3); }
  }, { wrap: true, repeat: [3, 1] }),

  // ---------------- INJUSTIÇA: venda cobre os olhos (geometria); sorriso largo; texto pela pele
  face_injustica: face((g) => {
    // gota escorrendo de baixo da venda
    g.strokeStyle = '#3a1416'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(CX - 26, 132); g.lineTo(CX - 27, 160); g.stroke();
    // texto também no pescoço/mandíbula
    g.fillStyle = 'rgba(20,16,16,0.75)'; g.font = 'italic 10px serif';
    for (let y = 200; y < 256; y += 11) g.fillText(LATIN.slice((y * 3) % 60, (y * 3) % 60 + 40), CX - 90, y);
  }, {
    skin: '#d8c2b4',
    noEyes: true, // a faixa preta cobre os olhos
    eye: { iris: '#202020', tilt: 0.05 },
    brow: { angry: 2, thick: 4, color: '#0d0d0f' },
    mouth: { grin: true, mouthW: 15, lip: 'rgba(18,8,10,0.85)', lipLine: '#080406' }, // lábios escuros
  }),
  skin_injustica: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#d8c2b4';
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = 'rgba(18,14,14,0.82)';
    let k = 0;
    for (let y = 14; y < 512; y += 15) {
      g.font = `${y % 45 === 14 ? 'bold ' : ''}italic 13px serif`;
      const line = (LATIN + LATIN).slice(k % LATIN.length, (k % LATIN.length) + 80);
      g.fillText(line, -((y * 7) % 40), y);
      k += 23;
    }
    // sigilo na palma (fica na região da mão)
    g.strokeStyle = '#140e0e'; g.lineWidth = 2;
    g.beginPath(); g.arc(256, 470, 22, 0, Math.PI * 2); g.moveTo(234, 470); g.lineTo(278, 470); g.moveTo(256, 448); g.lineTo(256, 492); g.stroke();
  }, { wrap: true }),

  // venda do Gal: pano preto com marcas douradas na frente (u = 0.5 é a frente do tubo)
  blindfold_gal: () => canvasTex(512, 64, (g) => {
    g.fillStyle = '#0d0c10'; g.fillRect(0, 0, 512, 64);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    for (let y = 6; y < 64; y += 9) g.fillRect(0, y, 512, 1); // trama do tecido
    g.strokeStyle = '#d9b25a'; g.fillStyle = '#d9b25a'; g.lineWidth = 3; g.lineCap = 'round';
    // olho estilizado no centro + traços que se abrem para os lados (como na arte)
    g.beginPath(); g.ellipse(256, 32, 20, 9, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(256, 32, 4, 0, Math.PI * 2); g.fill();
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(256 + s * 28, 32); g.lineTo(256 + s * 70, 32); g.stroke();
      for (let i = 0; i < 4; i++) { const x = 256 + s * (82 + i * 16); g.beginPath(); g.moveTo(x, 22); g.lineTo(x + s * 6, 42); g.stroke(); }
      g.beginPath(); g.arc(256 + s * 158, 32, 3, 0, Math.PI * 2); g.fill();
    }
    g.lineWidth = 1.5; g.beginPath(); g.moveTo(150, 10); g.lineTo(362, 10); g.moveTo(150, 54); g.lineTo(362, 54); g.stroke();
  }),

  // ---------------- DESCONJURADO: sigilo na testa (lado direito), linha do olho, 3 riscos pretos
  face_desconjurado: () => {
    const map = face((g) => {
      // riscos pretos (marca de garra) no lado esquerdo do rosto
      g.strokeStyle = 'rgba(15,8,6,0.85)'; g.lineWidth = 5; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(CX + 30 + i * 11, 96); g.lineTo(CX + 22 + i * 11, 168); g.stroke(); }
      paintDesconjuradoSigils(g, '#f2e2b0');
    }, {
      skin: '#5e4234',
      eye: { iris: '#b8761a', irisLight: '#ffcf5a', tilt: 0.06 },
      brow: { angry: 6, thick: 6.5, color: '#120c0a' },
      mouth: { mouthW: 14, smile: -1, lipLine: '#2a1612', lip: 'rgba(90,40,30,0.4)' },
      after: (g) => beardPaint(g, '#1e1612'),
    })();
    const emissiveMap = canvasTex(W, HT, (g) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, HT);
      paintDesconjuradoSigils(g, '#ffd27a');
    }, { wrap: true });
    return { map, emissiveMap, emissive: 0xffd27a };
  },
  skin_desconjurado: () => {
    const paint = (g, glowOnly) => {
      g.fillStyle = glowOnly ? '#000' : '#5e4234';
      g.fillRect(0, 0, 512, 512);
      if (!glowOnly) {
        // faixas de glifos escritos (escuros, com brilho fraco)
        for (let band = 0; band < 512; band += 64) glyphs(g, 0, band, 512, 40, 'rgba(250,236,200,0.55)', 12, 0.75);
      } else {
        for (let band = 0; band < 512; band += 64) glyphs(g, 0, band, 512, 40, 'rgba(255,210,120,0.55)', 12, 0.75);
      }
      // linhas luminosas tipo circuito com setas
      g.strokeStyle = glowOnly ? '#ffd27a' : '#fff1c8';
      g.lineWidth = 4;
      g.beginPath(); g.moveTo(180, 0); g.lineTo(256, 150); g.lineTo(332, 0); g.stroke();
      g.beginPath(); g.moveTo(256, 150); g.lineTo(256, 512); g.stroke();
      g.beginPath(); g.moveTo(140, 230); g.lineTo(372, 190); g.stroke();
      for (const [x, y] of [[372, 190], [140, 230]]) {
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x > 256 ? -12 : 12), y - 7); g.moveTo(x, y); g.lineTo(x + (x > 256 ? -12 : 12), y + 7); g.stroke();
      }
    };
    const map = canvasTex(512, 512, (g) => paint(g, false), { wrap: true });
    const emissiveMap = canvasTex(512, 512, (g) => paint(g, true), { wrap: true });
    return { map, emissiveMap, emissive: 0xffd27a };
  },

  // ---------------- DANTE: sigilo do infinito na testa, risco preto descendo pelo rosto,
  // lágrimas de Lodo Preto (Morte), rosto sem barba e tatuagens subindo pelo pescoço
  face_dante: face((g) => {
    // linha na testa com o símbolo do infinito no meio
    g.strokeStyle = '#1c1414'; g.lineWidth = 2.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX - 62, 74); g.lineTo(CX - 16, 74); g.moveTo(CX + 16, 74); g.lineTo(CX + 62, 74); g.stroke();
    g.lineWidth = 3;
    g.beginPath();
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.1) {
      const x = CX + 15 * Math.sin(t);
      const y = 74 + 6 * Math.sin(t) * Math.cos(t);
      if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
    for (const s of [-1, 1]) { g.beginPath(); g.arc(CX + s * 70, 74, 2.2, 0, Math.PI * 2); g.fillStyle = '#1c1414'; g.fill(); }
    // risco preto da testa ao queixo, passando pelo olho direito (x < 256)
    g.strokeStyle = 'rgba(14,10,12,0.9)'; g.lineWidth = 3.2;
    g.beginPath(); g.moveTo(CX - 34, 50); g.bezierCurveTo(CX - 36, 100, CX - 30, 150, CX - 22, 205); g.stroke();
    // lágrimas de Lodo Preto escorrendo dos dois olhos
    for (const s of [-1, 1]) {
      const x0 = CX + s * 30;
      g.fillStyle = 'rgba(8,6,8,0.92)';
      g.beginPath();
      g.moveTo(x0 - 6, EYE_Y + 5);
      g.bezierCurveTo(x0 - 7, EYE_Y + 30, x0 - 3, EYE_Y + 52, x0 - 1, EYE_Y + 70);
      g.lineTo(x0 + 3, EYE_Y + 70);
      g.bezierCurveTo(x0 + 4, EYE_Y + 48, x0 + 6, EYE_Y + 26, x0 + 6, EYE_Y + 5);
      g.closePath(); g.fill();
      g.beginPath(); g.arc(x0 + 1, EYE_Y + 72, 3.4, 0, Math.PI * 2); g.fill(); // gota
      // escorrido mais fino ao lado
      g.strokeStyle = 'rgba(8,6,8,0.8)'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x0 + s * 7, EYE_Y + 6); g.quadraticCurveTo(x0 + s * 9, EYE_Y + 24, x0 + s * 8, EYE_Y + 38); g.stroke();
    }
    // tatuagens subindo pelo pescoço (parte de baixo da textura)
    g.fillStyle = 'rgba(20,14,16,0.75)';
    for (let i = 0; i < 380; i++) {
      const x = CX - 110 + Math.random() * 220, y = 214 + Math.random() * 42;
      g.beginPath(); g.arc(x, y, 0.8 + Math.random() * 1.4, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = 'rgba(20,14,16,0.8)'; g.lineWidth = 1.6;
    for (const x of [CX - 70, CX + 60]) {
      g.beginPath();
      for (let t = 0; t < 14; t += 0.2) g.lineTo(x + Math.cos(t) * t * 1.1, 236 + Math.sin(t) * t * 1.1);
      g.stroke();
    }
  }, {
    skin: '#dcc0b0',
    eye: { iris: '#3a3434', irisLight: '#6a6460', tilt: -0.02, lid: 4.2, bags: true },
    brow: { angry: 2, thick: 4, color: '#7a6640' },
    mouth: { mouthW: 14, smile: 2, smirk: 2 },
  }),
  skin_dante: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#dcc0b0';
    g.fillRect(0, 0, 512, 512);
    const ink = 'rgba(22,16,18,0.85)';
    // pontilhado denso (como nas artes) com espirais e rosas de linhas
    g.fillStyle = ink;
    for (let i = 0; i < 5200; i++) {
      const x = Math.random() * 512, y = Math.random() * 512;
      if ((Math.sin(x * 0.05) + Math.cos(y * 0.04)) < -0.3) continue; // deixa respiros de pele
      g.beginPath(); g.arc(x, y, 0.8 + Math.random() * 1.6, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = ink; g.lineWidth = 2.2;
    for (let k = 0; k < 16; k++) {
      const cx = 30 + Math.random() * 452, cy = 30 + Math.random() * 452, sc = 1 + Math.random() * 1.6;
      g.beginPath();
      for (let t = 0; t < 16; t += 0.15) g.lineTo(cx + Math.cos(t) * t * sc, cy + Math.sin(t) * t * sc);
      g.stroke();
    }
    // sigilos de círculo e escrita
    g.lineWidth = 1.8;
    for (let k = 0; k < 10; k++) {
      const x = Math.random() * 512, y = Math.random() * 512, r = 10 + Math.random() * 12;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.moveTo(x - r * 0.7, y); g.lineTo(x + r * 0.7, y); g.moveTo(x, y - r * 0.7); g.lineTo(x, y + r * 0.7); g.stroke();
    }
    glyphs(g, 0, 0, 512, 512, 'rgba(22,16,18,0.6)', 10, 0.18);
  }, { wrap: true }),
};

function paintDesconjuradoSigils(g, color) {
  // glifos "KI" e "AN" na bochecha direita (x < 256), em traços retos de runa
  g.save();
  g.strokeStyle = color; g.lineWidth = 2.6; g.lineCap = 'round';
  const gx = CX - 66, gy = 150;
  const seg = (a, b2, c, d) => { g.beginPath(); g.moveTo(gx + a, gy + b2); g.lineTo(gx + c, gy + d); g.stroke(); };
  seg(0, 0, 0, 18); seg(0, 9, 9, 0); seg(0, 9, 9, 18); // K
  seg(14, 0, 14, 18); // I
  seg(2, 26, 7, 44); seg(7, 26, 2, 44); seg(3, 37, 6, 37); // A (anguloso)
  seg(13, 44, 13, 26); seg(13, 26, 22, 44); seg(22, 44, 22, 26); // N
  g.restore();
  g.strokeStyle = color;
  g.lineWidth = 3.4;
  g.lineCap = 'round';
  // sigilo na testa (lado direito do personagem = x < 256)
  const x = CX - 40, y = 62;
  g.beginPath();
  g.moveTo(x - 12, y - 10); g.lineTo(x + 6, y - 14); g.lineTo(x + 14, y); g.lineTo(x, y + 12); g.lineTo(x - 14, y + 2); g.closePath();
  g.moveTo(x + 6, y - 14); g.lineTo(x + 12, y - 22);
  g.moveTo(x + 14, y); g.lineTo(x + 22, y - 4);
  g.stroke();
  // linha luminosa descendo do olho direito pela bochecha
  g.beginPath(); g.moveTo(CX - 32, EYE_Y + 8); g.lineTo(CX - 34, 160); g.moveTo(CX - 40, 140); g.lineTo(CX - 26, 140); g.stroke();
}
