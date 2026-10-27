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

// sorteio repetível (mesma semente → mesmos números): para cor e brilho baterem
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SIGIL_SET = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒ⊕⊗';

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

// JAE (Park Jae-Yoon): pele clara, maquiagem preta esfumada forte em volta dos olhos escuros, batom vermelho e a pinta
// falsa no queixo (lado esquerdo dela, x > 256) — referências "jae serio" e "jae rosto"; grin = sorriso com dentes
function jaeFace(grin) {
  return face((g) => {
    g.fillStyle = '#2a1214';
    g.beginPath(); g.arc(CX + 14, MOUTH_Y + 26, 3.2, 0, Math.PI * 2); g.fill();
    if (grin) {
      // batom vermelho em volta do sorriso
      g.strokeStyle = 'rgba(170,20,36,0.95)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(CX - 20, MOUTH_Y - 4); g.quadraticCurveTo(CX, MOUTH_Y + 20, CX + 20, MOUTH_Y - 4); g.stroke();
      g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(CX - 20, MOUTH_Y - 4); g.quadraticCurveTo(CX, MOUTH_Y + 2, CX + 20, MOUTH_Y - 4); g.stroke();
    }
  }, {
    skin: '#e6c4a8',
    before(g) {
      // sombra preta esfumada, alongada para fora (sem virar "olho roxo")
      for (const s of [-1, 1]) {
        const grd = g.createRadialGradient(CX + s * 36, EYE_Y - 1, 3, CX + s * 36, EYE_Y - 1, 22);
        grd.addColorStop(0, 'rgba(18,8,12,0.7)');
        grd.addColorStop(0.6, 'rgba(26,10,16,0.32)');
        grd.addColorStop(1, 'rgba(26,10,16,0)');
        g.fillStyle = grd;
        g.beginPath(); g.ellipse(CX + s * 36, EYE_Y - 1, 24, 12, s * -0.12, 0, Math.PI * 2); g.fill();
      }
    },
    after(g) {
      // delineado preto grosso com a ponta puxada para fora e para cima
      g.fillStyle = '#0a0608';
      for (const s of [-1, 1]) {
        const x = CX + s * 32;
        g.beginPath();
        g.moveTo(x - s * 15, EYE_Y - 3);
        g.quadraticCurveTo(x, EYE_Y - 10, x + s * 15, EYE_Y - 5);
        g.lineTo(x + s * 25, EYE_Y - 11);
        g.lineTo(x + s * 15, EYE_Y - 1);
        g.quadraticCurveTo(x, EYE_Y - 6, x - s * 15, EYE_Y - 1);
        g.closePath();
        g.fill();
      }
    },
    eye: { iris: '#2a1810', irisLight: '#5a3a28', tilt: 0.1, lashes: true, w: 15, h: 7 },
    brow: { angry: 2, thick: 3.5, color: '#100c0e' },
    mouth: grin ? { mouthW: 12, grin: true } : { mouthW: 14, lip: 'rgba(170,20,36,0.95)' },
  });
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

// feixes de tendão (Deus da Morte): cordas paralelas onduladas, escuras no meio e claras nas bordas
function tendonRopes(g, w, h) {
  g.fillStyle = '#0c0b0e'; g.fillRect(0, 0, w, h);
  let x = 0;
  while (x < w) {
    const bw = 5 + Math.random() * 9;
    const ph = Math.random() * 6;
    for (const [off, col, lw] of [[0, 'rgba(18,16,22,1)', bw], [-bw * 0.35, 'rgba(92,88,100,0.55)', 1.4], [bw * 0.3, 'rgba(40,38,46,0.9)', 1]]) {
      g.strokeStyle = col; g.lineWidth = lw;
      g.beginPath();
      for (let y = 0; y <= h; y += 16) g.lineTo(x + off + Math.sin(y * 0.025 + ph) * 5, y);
      g.stroke();
    }
    x += bw * 0.85;
  }
}

// veias de Energia (Anfitrião): linhas tortas rosa e azul brilhando sobre o roxo
function energyVeins(g, w, h) {
  const rnd = seeded(13);
  for (let i = 0; i < 26; i++) {
    g.strokeStyle = rnd() < 0.5 ? 'rgba(255,106,208,0.85)' : 'rgba(90,170,255,0.85)';
    g.lineWidth = 1 + rnd() * 2.5;
    g.beginPath();
    let x = rnd() * w;
    let y = rnd() * h;
    g.moveTo(x, y);
    for (let k = 0; k < 8; k++) { x += (rnd() - 0.5) * 40; y += (rnd() - 0.5) * 40; g.lineTo(x, y); }
    g.stroke();
  }
}

// o SÍMBOLO DE SANGUE costurado nas costas da jaqueta do Cristino: a haste com a ponta de flecha em cima e as duas
// travessas com pontas de flecha (a de baixo mais larga). (x, y) = meio da haste; `size` = altura; `down` vira de
// cabeça para baixo (no UV da jaqueta a barra fica no alto do canvas)
function bloodSymbol(g, x, y, size, color, { down = false, stitch } = {}) {
  g.save();
  g.translate(x, y);
  if (down) g.rotate(Math.PI);
  const u = size / 10;
  const arrow = (px, py, ang) => {
    g.save(); g.translate(px, py); g.rotate(ang);
    g.beginPath(); g.moveTo(0, -1.3 * u); g.lineTo(1.1 * u, 0.4 * u); g.lineTo(-1.1 * u, 0.4 * u); g.closePath(); g.fill();
    g.restore();
  };
  g.fillStyle = color;
  g.fillRect(-0.45 * u, -4.2 * u, 0.9 * u, 9.2 * u); // a haste
  arrow(0, -4.6 * u, 0);
  g.fillRect(-2.6 * u, -1.6 * u, 5.2 * u, 0.85 * u); // travessa de cima
  arrow(-3.0 * u, -1.18 * u, -Math.PI / 2); arrow(3.0 * u, -1.18 * u, Math.PI / 2);
  g.fillRect(-4.0 * u, 1.6 * u, 8.0 * u, 0.85 * u); // travessa de baixo (mais larga)
  arrow(-4.4 * u, 2.02 * u, -Math.PI / 2); arrow(4.4 * u, 2.02 * u, Math.PI / 2);
  if (stitch) { // a costura em volta
    g.strokeStyle = stitch; g.lineWidth = Math.max(1, u * 0.18); g.setLineDash([u * 0.4, u * 0.35]);
    g.strokeRect(-0.75 * u, -4.2 * u, 1.5 * u, 9.2 * u);
    g.setLineDash([]);
  }
  g.restore();
}

// couro gasto: vincos verticais, manchas e brilho fraco (base de jaqueta, calça e chapéu do Cristino)
function leather(g, w, h, base, seed, { dark = '40,16,8', light = '200,130,90', marks = 50 } = {}) {
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < marks; i++) {
    const x = rnd() * w;
    const ww = 3 + rnd() * 12;
    const isDark = rnd() < 0.6;
    const grd = g.createLinearGradient(x - ww, 0, x + ww, 0);
    const c = isDark ? dark : light;
    const a = isDark ? 0.2 + rnd() * 0.25 : 0.1 + rnd() * 0.12;
    grd.addColorStop(0, `rgba(${c},0)`); grd.addColorStop(0.5, `rgba(${c},${a})`); grd.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = grd;
    const y0 = rnd() * h * 0.4;
    g.fillRect(x - ww, y0, ww * 2, h - y0 * rnd());
  }
  for (let i = 0; i < 18; i++) { // manchas de sangue seco e sujeira
    g.fillStyle = rnd() < 0.5 ? 'rgba(90,10,8,0.25)' : 'rgba(30,18,10,0.2)';
    g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 4 + rnd() * 16, 3 + rnd() * 10, rnd() * 3, 0, Math.PI * 2); g.fill();
  }
  return rnd;
}

// DANTE (Calamidade): as tatuagens de "pele de onça" — pintas graúdas e irregulares, o pontilhado fino entre elas e as
// espirais (a miniatura em combate). Só aparecem com os OLHOS ABERTOS.
function danteTattoos(g, area = { x: 0, y: 0, w: 512, h: 512 }, base = '#dcc0b4') {
  const { x: x0, y: y0, w, h } = area;
  if (base) { g.fillStyle = base; g.fillRect(x0, y0, w, h); }
  const rnd = seeded(1265);
  const ink = 'rgba(30,18,22,0.88)';
  g.fillStyle = ink;
  for (let i = 0; i < (w * h) / 170; i++) {
    const x = x0 + rnd() * w, y = y0 + rnd() * h;
    if (Math.sin(x * 0.045) + Math.cos(y * 0.037) < -0.7) continue; // respiros de pele
    // a pinta de onça: um anel aberto com o miolo mais claro
    const rx = 2.5 + rnd() * 4, ry = 2 + rnd() * 3, a = rnd() * Math.PI;
    g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.fill();
    if (rx > 4.5) { g.fillStyle = 'rgba(200,150,140,0.85)'; g.beginPath(); g.ellipse(x, y, rx * 0.45, ry * 0.45, a, 0, Math.PI * 2); g.fill(); g.fillStyle = ink; }
  }
  for (let i = 0; i < (w * h) / 100; i++) { const x = x0 + rnd() * w, y = y0 + rnd() * h; g.beginPath(); g.arc(x, y, 0.7 + rnd() * 1.1, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = ink; g.lineWidth = 2.6;
  for (let k = 0; k < (w * h) / 14000; k++) {
    const cx = x0 + 20 + rnd() * (w - 40), cy = y0 + 20 + rnd() * (h - 40), sc = 1.6 + rnd() * 1.4;
    g.beginPath();
    for (let t = 0; t < 15; t += 0.15) g.lineTo(cx + Math.cos(t) * t * sc, cy + Math.sin(t) * t * sc);
    g.stroke();
  }
}

// NUBI: o rosto normal (olhos pretos de íris, faixas pretas descendo) e o da AFINIDADE COM A MORTE (a Transformação):
// o olho inteiro fica PRETO e o Lodo escorre mais grosso dos olhos, como na Mansão Leone
function nubiFace(open) {
  return face((g) => {
    // as duas faixas pretas: saem da pálpebra de baixo e descem pela bochecha até o maxilar (um pouco irregulares)
    g.strokeStyle = 'rgba(8,4,6,0.94)'; g.lineCap = 'round';
    for (const s of [-1, 1]) {
      const x = CX + s * 32;
      g.lineWidth = open ? 11 : 7;
      g.beginPath(); g.moveTo(x - s * 2, EYE_Y + 6); g.bezierCurveTo(x - s * 1, EYE_Y + 40, x + s * 3, EYE_Y + 80, x + s * 1, 236); g.stroke();
      g.lineWidth = open ? 4 : 2.5;
      g.beginPath(); g.moveTo(x + s * 6, EYE_Y + 8); g.quadraticCurveTo(x + s * 8, EYE_Y + 40, x + s * 6, EYE_Y + 66); g.stroke();
      if (open) {
        // o Lodo transbordando: uma mancha em volta do olho, um fio a mais e gotas penduradas
        g.fillStyle = 'rgba(6,4,6,0.55)';
        g.beginPath(); g.ellipse(x, EYE_Y + 2, 21, 12, 0, 0, Math.PI * 2); g.fill();
        g.lineWidth = 3;
        g.beginPath(); g.moveTo(x - s * 9, EYE_Y + 7); g.quadraticCurveTo(x - s * 12, EYE_Y + 34, x - s * 10, EYE_Y + 52); g.stroke();
        g.fillStyle = 'rgba(8,4,6,0.95)';
        for (const [dx, dy, r] of [[-s * 10, EYE_Y + 54, 3], [s * 6, EYE_Y + 68, 2.6], [s * 1, 238, 4]]) { g.beginPath(); g.arc(x + dx, dy, r, 0, Math.PI * 2); g.fill(); }
        // o brilho molhado do Lodo
        g.strokeStyle = 'rgba(120,112,130,0.35)'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(x - s * 3, EYE_Y + 30); g.lineTo(x - s * 2, EYE_Y + 60); g.stroke();
        g.strokeStyle = 'rgba(8,4,6,0.94)';
      }
    }
    // "MORTE" na testa, em letras escuras de traço fino (como escrito à mão)
    g.fillStyle = 'rgba(14,8,8,0.92)'; g.font = 'bold 22px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save(); g.translate(CX, 74); g.scale(1.15, 1); g.fillText('MORTE', 0, 0); g.restore();
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    // tatuagens dos Escriptas: fileiras de escrita subindo pelo pescoço (a parte de baixo do canvas)
    glyphs(g, CX - 130, 206, 260, 50, 'rgba(18,10,8,0.85)', 10, 0.75);
  }, {
    skin: '#5a3828',
    // transformada: o olho todo preto (íris e branco), só um reflexo fraco
    eye: open ? { iris: '#040304', irisLight: '#2a2630', sclera: '#060406', tilt: 0.04, lashes: true, w: 14, h: 7 }
      : { iris: '#0a0606', irisLight: '#1c1214', tilt: 0.04, lashes: true, w: 14, h: 7 },
    brow: { angry: open ? 0.15 : 0, thick: 2.6, color: '#0c0808' },
    mouth: { mouthW: 13, smile: 0, lip: 'rgba(40,18,16,0.85)', lipLine: '#1a0c0a' },
  });
}

// o rosto do Dante: fechado (a cegueira, sereno) ou ABERTO (olhos pretos, as faixas, as tatuagens no pescoço)
function danteFace(open) {
  return face((g) => {
    // o sigilo do infinito na testa, com o traço vertical curto
    g.strokeStyle = '#2a1c1c'; g.lineWidth = 2.6; g.lineCap = 'round';
    g.beginPath();
    for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.1) {
      const x = CX + 13 * Math.sin(t);
      const y = 72 + 5.5 * Math.sin(t) * Math.cos(t);
      if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
    g.beginPath(); g.moveTo(CX - 40, 72); g.lineTo(CX - 18, 72); g.moveTo(CX + 18, 72); g.lineTo(CX + 40, 72); g.stroke();
    g.beginPath(); g.moveTo(CX + 46, 66); g.lineTo(CX + 46, 78); g.stroke();
    // a cicatriz na têmpora direita (x < 256), descendo para a maçã do rosto
    g.strokeStyle = 'rgba(150,96,92,0.75)'; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(CX - 66, EYE_Y - 24); g.quadraticCurveTo(CX - 62, EYE_Y + 2, CX - 52, EYE_Y + 22); g.stroke();
    g.strokeStyle = 'rgba(150,96,92,0.5)'; g.lineWidth = 1.4;
    for (let k = 0; k < 4; k++) { const y = EYE_Y - 16 + k * 10; g.beginPath(); g.moveTo(CX - 69, y); g.lineTo(CX - 57, y + 3); g.stroke(); }
    if (!open) {
      // OLHOS FECHADOS: a linha da pálpebra curvada para baixo, os cílios e a sombra leve
      for (const s of [-1, 1]) {
        const x = CX + s * 32;
        const sh = g.createRadialGradient(x, EYE_Y - 2, 2, x, EYE_Y - 2, 18);
        sh.addColorStop(0, 'rgba(150,100,100,0.22)'); sh.addColorStop(1, 'rgba(150,100,100,0)');
        g.fillStyle = sh; g.beginPath(); g.ellipse(x, EYE_Y - 2, 19, 10, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#2a1a16'; g.lineWidth = 2.6;
        g.beginPath(); g.moveTo(x - 14, EYE_Y - 1); g.quadraticCurveTo(x, EYE_Y + 6, x + 14, EYE_Y - 2); g.stroke();
        g.lineWidth = 1.2;
        for (let k = 0; k < 4; k++) { const t = 0.2 + k * 0.2, lx = x - 14 + 28 * t, ly = EYE_Y - 1 + 6 * Math.sin(t * Math.PI) * 0.9; g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + s * 1.5, ly + 4); g.stroke(); }
        g.strokeStyle = 'rgba(80,50,46,0.4)'; g.lineWidth = 1.2; // a dobra da pálpebra
        g.beginPath(); g.moveTo(x - 12, EYE_Y - 7); g.quadraticCurveTo(x, EYE_Y - 10, x + 12, EYE_Y - 8); g.stroke();
      }
      return;
    }
    // OLHOS ABERTOS: completamente pretos (sem branco nem íris), com um brilho fino
    for (const s of [-1, 1]) {
      const x = CX + s * 32;
      g.fillStyle = '#060406';
      g.beginPath(); g.moveTo(x - 15, EYE_Y); g.quadraticCurveTo(x, EYE_Y - 11, x + 15, EYE_Y - 1); g.quadraticCurveTo(x, EYE_Y + 8, x - 15, EYE_Y); g.fill();
      g.fillStyle = 'rgba(120,130,150,0.5)'; g.beginPath(); g.arc(x + 4, EYE_Y - 4, 1.6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#0a0606'; g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(x - 16, EYE_Y + 0.5); g.quadraticCurveTo(x, EYE_Y - 12, x + 17, EYE_Y - 1.5); g.stroke();
    }
    // a FAIXA vertical pelo olho direito: da testa (por baixo do sigilo) até a bochecha
    g.strokeStyle = 'rgba(12,8,10,0.92)'; g.lineWidth = 5; g.lineCap = 'butt';
    g.beginPath(); g.moveTo(CX - 32, 52); g.bezierCurveTo(CX - 33, 95, CX - 31, 140, CX - 28, 188); g.stroke();
    // e a faixa HORIZONTAL atravessando os lábios, de bochecha a bochecha
    g.lineWidth = 4.4;
    g.beginPath(); g.moveTo(CX - 58, MOUTH_Y - 2); g.quadraticCurveTo(CX, MOUTH_Y + 3, CX + 58, MOUTH_Y - 2); g.stroke();
    // as tatuagens subindo pelo pescoço (a parte de baixo do canvas)
    danteTattoos(g, { x: CX - 120, y: 212, w: 240, h: 44 }, null);
  }, {
    skin: '#e2c8bc',
    noEyes: !open,
    eye: { iris: '#060406', irisLight: '#060406', sclera: '#060406', tilt: -0.02, lid: 3.4 },
    brow: { angry: 1, thick: 3, color: '#a88a58' },
    mouth: { mouthW: 13, smile: 0, smirk: 0 },
  });
}

export const MATERIAL_TEXTURES = {
  // ---------------- KAISER: queimadura no lado ESQUERDO (x > 256)
  // KAISER depois do orfanato (wiki): a metade ESQUERDA do rosto queimada, sem barba e sem a sobrancelha esquerda; com
  // 50% de exposição os olhos ficaram roxos
  face_cineraria: face((g) => {
    // a sobrancelha esquerda (x > CX) sumiu na queimadura: a pele queimada cobre o lugar dela
    g.fillStyle = '#9a4a32';
    g.beginPath(); g.ellipse(CX + 22, EYE_Y - 20, 17, 7, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(40,12,8,0.6)'; g.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(CX + 12 + i * 5, EYE_Y - 20 + (i % 2) * 3, 4, 3, 0.4, 0, Math.PI * 2); g.stroke(); }
  }, {
    skin: '#c49478',
    eye: { iris: '#6a3aa8', irisLight: '#b48ae8', bags: true, tilt: 0.05 },
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

  // KAISER: o casacão cinza-claro DO AVESSO (as costuras para fora), sujo de fuligem, com BURACOS queimados de borda
  // escura e a barra esfiapada
  jacket_kaiser: () => canvasTex(512, 512, (g) => {
    const rnd = seeded(175);
    g.fillStyle = '#d2d0c6'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(60,58,52,0.06)'; g.fillRect(rnd() * 512, rnd() * 512, 2, 1); }
    g.strokeStyle = 'rgba(120,116,104,0.5)'; g.lineWidth = 2; g.setLineDash([6, 4]);
    for (const x of [64, 192, 320, 448]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); } // as costuras do avesso
    g.setLineDash([]);
    for (let i = 0; i < 14; i++) { // fuligem
      const grd = g.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.save(); g.translate(rnd() * 512, rnd() * 512); g.scale(20 + rnd() * 50, 14 + rnd() * 30);
      grd.addColorStop(0, 'rgba(40,36,32,0.28)'); grd.addColorStop(1, 'rgba(40,36,32,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore();
    }
    for (let i = 0; i < 16; i++) { // os buracos queimados
      const x = rnd() * 512, y = rnd() * 512, r = 5 + rnd() * 14;
      g.fillStyle = 'rgba(70,40,24,0.75)'; g.beginPath(); g.ellipse(x, y, r * 1.35, r, rnd() * 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#121214'; g.beginPath(); g.ellipse(x, y, r, r * 0.7, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
    const hem = g.createLinearGradient(0, 470, 0, 512);
    hem.addColorStop(0, 'rgba(60,52,44,0)'); hem.addColorStop(1, 'rgba(60,52,44,0.35)');
    g.fillStyle = hem; g.fillRect(0, 470, 512, 42);
  }, { wrap: true }),
  // a gola alta preta canelada (as nervuras verticais)
  turtleneck_kaiser: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#18181c'; g.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 6) {
      g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x, 0, 3, 256);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 3, 0, 1, 256);
    }
  }, { wrap: true }),
  // a calça preta: sarja, joelhos gastos e a fuligem embaixo
  pants_kaiser: () => canvasTex(256, 512, (g) => {
    const rnd = seeded(29);
    g.fillStyle = '#1c1c20'; g.fillRect(0, 0, 256, 512);
    g.strokeStyle = 'rgba(255,255,255,0.035)'; g.lineWidth = 1;
    for (let k = -512; k < 512; k += 3) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 512, 512); g.stroke(); }
    const knee = g.createRadialGradient(128, 300, 0, 128, 300, 70);
    knee.addColorStop(0, 'rgba(90,90,100,0.2)'); knee.addColorStop(1, 'rgba(90,90,100,0)');
    g.fillStyle = knee; g.fillRect(0, 220, 256, 160);
    g.strokeStyle = 'rgba(70,70,80,0.6)'; g.lineWidth = 2;
    for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
    for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(60,50,40,${0.12 + rnd() * 0.15})`; g.beginPath(); g.ellipse(rnd() * 256, 340 + rnd() * 170, 4 + rnd() * 12, 3 + rnd() * 7, rnd() * 3, 0, Math.PI * 2); g.fill(); }
  }, { wrap: true }),
  // a pele QUEIMADA do braço esquerdo (as mesmas placas e rachaduras do rosto)
  skin_burn_kaiser: () => canvasTex(256, 256, (g) => {
    const rnd = seeded(66);
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#9a4a32'); grd.addColorStop(1, '#b26a50');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      const x = rnd() * 256, y = rnd() * 256, r = 4 + rnd() * 12;
      g.fillStyle = rnd() < 0.5 ? 'rgba(110,40,28,0.55)' : 'rgba(210,140,110,0.35)';
      g.beginPath(); g.ellipse(x, y, r, r * 0.7, rnd() * 3, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(40,12,8,0.7)'; g.lineWidth = 1.2; g.stroke();
    }
  }, { wrap: true }),

  // ---------------- ARTHUR: heterocromia (direito castanho, esquerdo verde), cicatriz diagonal
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

  // ---------------- AGUIAR (arte de Natal Macabro, sem a máscara): pele bronzeada, olhos escuros de pálpebra pesada,
  // sobrancelhas grossas, a sombra da barba feita, meio sorriso de quem sabe mais do que diz e a cicatriz no queixo
  face_aguiar: face((g) => {
    stubble(g, 'rgba(25,18,14,0.2)', 1500, { y0: 140, y1: 222, w: 78 });
    g.strokeStyle = '#8a5a4a'; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX - 22, 198); g.lineTo(CX - 13, 211); g.stroke(); // a cicatriz no queixo
    g.strokeStyle = 'rgba(240,200,180,0.45)'; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(CX - 21, 198); g.lineTo(CX - 12, 210); g.stroke();
  }, {
    skin: '#a06a46',
    before(g) {
      for (const s of [-1, 1]) {
        // olheiras e a sombra funda sob a sobrancelha (o olhar pesado)
        const grd = g.createRadialGradient(CX + s * 33, EYE_Y + 10, 2, CX + s * 33, EYE_Y + 10, 20);
        grd.addColorStop(0, 'rgba(70,35,25,0.32)'); grd.addColorStop(1, 'rgba(70,35,25,0)');
        g.fillStyle = grd; g.beginPath(); g.ellipse(CX + s * 33, EYE_Y + 10, 21, 9, 0, 0, Math.PI * 2); g.fill();
        const br = g.createRadialGradient(CX + s * 33, EYE_Y - 9, 2, CX + s * 33, EYE_Y - 9, 20);
        br.addColorStop(0, 'rgba(60,30,20,0.28)'); br.addColorStop(1, 'rgba(60,30,20,0)');
        g.fillStyle = br; g.beginPath(); g.ellipse(CX + s * 33, EYE_Y - 9, 22, 8, 0, 0, Math.PI * 2); g.fill();
        // maçãs e o sulco do nariz até a boca
        g.strokeStyle = 'rgba(90,45,30,0.25)'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(CX + s * 14, 148); g.quadraticCurveTo(CX + s * 22, 162, CX + s * 20, MOUTH_Y + 4); g.stroke();
        g.fillStyle = 'rgba(90,45,30,0.18)';
        g.beginPath(); g.ellipse(CX + s * 9, 140, 3.5, 16, s * 0.08, 0, Math.PI * 2); g.fill();
      }
    },
    after(g) {
      // a pálpebra de cima pesada (meio fechada) e o canto da boca puxado de um lado (o meio sorriso)
      g.fillStyle = 'rgba(120,70,45,0.85)';
      for (const s of [-1, 1]) {
        g.beginPath(); g.ellipse(CX + s * 32, EYE_Y - 4, 15, 4.5, s * 0.06, Math.PI, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(30,15,10,0.7)'; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(CX + s * 18, EYE_Y - 3); g.quadraticCurveTo(CX + s * 32, EYE_Y - 9, CX + s * 46, EYE_Y - 2); g.stroke();
      }
      g.strokeStyle = 'rgba(60,25,20,0.7)'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(CX + 12, MOUTH_Y); g.quadraticCurveTo(CX + 17, MOUTH_Y - 3, CX + 20, MOUTH_Y - 5); g.stroke();
    },
    eye: { iris: '#2a1a12', irisLight: '#5a3a28', tilt: 0.06 },
    brow: { angry: 4, thick: 7, color: '#0e0b0c' },
    mouth: { mouthW: 13, smile: 0 },
  }),
  // a camiseta creme justa: malha, manchas de sujeira e de sangue seco (respingos) e a gola mais escura. A frente é o meio
  // (u = 0,5); o pescoço é a parte de baixo da textura
  shirt_aguiar: () => canvasTex(512, 256, (g) => {
    g.fillStyle = '#ddd6c6'; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 2600; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,245,0.06)' : 'rgba(90,70,50,0.06)'; g.fillRect(Math.random() * 512, Math.random() * 256, 2, 1); }
    const side = g.createLinearGradient(0, 0, 512, 0);
    side.addColorStop(0, 'rgba(90,70,50,0.22)'); side.addColorStop(0.3, 'rgba(90,70,50,0)'); side.addColorStop(0.7, 'rgba(90,70,50,0)'); side.addColorStop(1, 'rgba(90,70,50,0.22)');
    g.fillStyle = side; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 18; i++) { // sujeira
      g.fillStyle = `rgba(110,90,60,${0.06 + Math.random() * 0.08})`;
      g.beginPath(); g.ellipse(Math.random() * 512, Math.random() * 256, 8 + Math.random() * 18, 5 + Math.random() * 10, Math.random(), 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 26; i++) { // respingos de sangue seco no peito e na barriga (frente)
      const x = 200 + Math.random() * 112, y = 40 + Math.random() * 170;
      g.fillStyle = `rgba(110,20,18,${0.35 + Math.random() * 0.35})`;
      g.beginPath(); g.arc(x, y, 1 + Math.random() * 3.5, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#c4bba8'; g.fillRect(0, 244, 512, 12); // a gola
  }, { wrap: true }),
  // o colete vermelho (a jaqueta sem mangas): tecido gasto, as costuras mais escuras e manchas de sangue
  vest_aguiar: () => canvasTex(512, 256, (g) => {
    g.fillStyle = '#9a2420'; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 3000; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,180,160,0.05)' : 'rgba(40,0,0,0.08)'; g.fillRect(Math.random() * 512, Math.random() * 256, 2, 1); }
    for (let i = 0; i < 14; i++) { // o desbotado e o gasto
      g.fillStyle = `rgba(190,90,70,${0.06 + Math.random() * 0.08})`;
      g.beginPath(); g.ellipse(Math.random() * 512, Math.random() * 256, 16 + Math.random() * 30, 8 + Math.random() * 16, Math.random(), 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = 'rgba(50,8,6,0.55)'; g.lineWidth = 2; g.setLineDash([5, 3]);
    for (const x of [128, 384, 60, 452]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
    g.setLineDash([]);
    for (let i = 0; i < 10; i++) { // manchas de sangue escuro
      g.fillStyle = `rgba(50,4,4,${0.25 + Math.random() * 0.25})`;
      g.beginPath(); g.ellipse(Math.random() * 512, Math.random() * 256, 4 + Math.random() * 10, 3 + Math.random() * 7, Math.random(), 0, Math.PI * 2); g.fill();
    }
  }, { wrap: true }),
  // o jeans cinza-esverdeado escuro: a sarja, o desbotado nas coxas, as costuras laterais e os vincos atrás do joelho
  jeans_aguiar: () => canvasTex(256, 512, (g) => {
    g.fillStyle = '#3e4840'; g.fillRect(0, 0, 256, 512);
    g.strokeStyle = 'rgba(255,255,255,0.04)'; g.lineWidth = 1;
    for (let k = -512; k < 512; k += 3) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 512, 512); g.stroke(); }
    const fade = g.createLinearGradient(0, 0, 256, 0);
    fade.addColorStop(0.3, 'rgba(160,175,160,0)'); fade.addColorStop(0.5, 'rgba(160,175,160,0.16)'); fade.addColorStop(0.7, 'rgba(160,175,160,0)');
    g.fillStyle = fade; g.fillRect(0, 60, 256, 220);
    g.strokeStyle = 'rgba(200,170,110,0.35)'; g.setLineDash([4, 3]);
    for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
    g.setLineDash([]);
    g.strokeStyle = 'rgba(15,20,15,0.35)'; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const y = 250 + i * 9; g.beginPath(); g.moveTo(200, y); g.quadraticCurveTo(225, y + 4, 250, y); g.stroke(); } // vincos
    for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(120,110,90,0.06)'; g.fillRect(Math.random() * 256, Math.random() * 512, 3, 2); }
  }, { wrap: true }),
  // braços com várias cicatrizes
  arms_aguiar: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#9a6644'; g.fillRect(0, 0, 256, 256);
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
    finger(w * 0.41, h * 0.62, w * 0.39, h * 0.12, 9);
    finger(w * 0.47, h * 0.6, w * 0.465, h * 0.08, 9);
    finger(w * 0.53, h * 0.6, w * 0.535, h * 0.08, 9);
    finger(w * 0.59, h * 0.62, w * 0.61, h * 0.12, 9);
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
    // pele pálida ACINZENTADA (as artes) com as cicatrizes finas e escuras do labirinto e o relevo claro ao lado
    g.fillStyle = '#a99f95'; g.fillRect(0, 0, 512, 512);
    mazeLines(g, 0, 0, 512, 512, 18, 'rgba(82,66,60,0.62)', 1.6);
    mazeLines(g, 2, 2, 512, 512, 18, 'rgba(250,244,236,0.45)', 0.8); // brilho da cicatriz
  }, { wrap: true }),
  face_labirinto: face((g) => {
    // cabeça raspada: o labirinto sobe pela testa e pelo crânio, contornando os olhos
    g.save();
    g.beginPath(); g.rect(0, 0, W, HT); g.ellipse(CX - 32, EYE_Y, 26, 16, 0, 0, Math.PI * 2); g.ellipse(CX + 32, EYE_Y, 26, 16, 0, 0, Math.PI * 2); g.ellipse(CX, 175, 30, 18, 0, 0, Math.PI * 2);
    g.clip('evenodd');
    mazeLines(g, 0, 0, W, HT, 15, 'rgba(82,66,60,0.6)', 1.5);
    g.restore();
  }, {
    skin: '#a99f95',
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
    const cx = w * 0.5, cy = h * 0.68, mw = w * 0.22, mh = h * 0.15;
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
    g.fillStyle = 'rgba(170,40,44,0.75)'; // gengiva
    g.fillRect(cx - mw * 0.8, cy - mh * 0.7, mw * 1.6, mh * 0.1);
    // duas faixas de metal rebitadas emoldurando o sorriso (dão a volta no elmo)
    for (const y of [cy - mh * 1.08, cy + mh * 0.9]) {
      g.fillStyle = '#4e4a48'; g.fillRect(0, y, w, h * 0.045);
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, y, w, 3);
      g.fillStyle = '#7a3a20';
      for (let x = 12; x < w; x += 40) { g.beginPath(); g.arc(x, y + h * 0.022, 4, 0, Math.PI * 2); g.fill(); }
    }
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
    // rosto jovem e limpo (a arte não tem barba): o arranhão de skate bem de leve na maçã do rosto
    g.strokeStyle = 'rgba(170,90,80,0.35)'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(CX + 52, 150); g.lineTo(CX + 63, 157); g.stroke();
    g.beginPath(); g.moveTo(CX + 50, 154); g.lineTo(CX + 58, 160); g.stroke();
  }, {
    skin: '#e8c0a4',
    before(g) {
      // volumes suaves: sombra embaixo dos olhos (cansado, ouve música a noite inteira), o dorso do nariz e o queixo
      for (const s of [-1, 1]) {
        const grd = g.createRadialGradient(CX + s * 33, EYE_Y + 11, 2, CX + s * 33, EYE_Y + 11, 20);
        grd.addColorStop(0, 'rgba(150,95,85,0.22)'); grd.addColorStop(1, 'rgba(150,95,85,0)');
        g.fillStyle = grd; g.beginPath(); g.ellipse(CX + s * 33, EYE_Y + 11, 20, 9, 0, 0, Math.PI * 2); g.fill();
        // as maçãs do rosto um pouco mais quentes
        const ck = g.createRadialGradient(CX + s * 52, 150, 2, CX + s * 52, 150, 26);
        ck.addColorStop(0, 'rgba(220,120,105,0.16)'); ck.addColorStop(1, 'rgba(220,120,105,0)');
        g.fillStyle = ck; g.beginPath(); g.arc(CX + s * 52, 150, 26, 0, Math.PI * 2); g.fill();
        // a lateral do nariz
        g.fillStyle = 'rgba(160,100,85,0.16)';
        g.beginPath(); g.ellipse(CX + s * 9, 140, 3.5, 16, s * 0.08, 0, Math.PI * 2); g.fill();
      }
      const ch = g.createRadialGradient(CX, 205, 4, CX, 205, 30);
      ch.addColorStop(0, 'rgba(160,100,85,0.14)'); ch.addColorStop(1, 'rgba(160,100,85,0)');
      g.fillStyle = ch; g.beginPath(); g.arc(CX, 205, 30, 0, Math.PI * 2); g.fill();
    },
    after(g) {
      // a dobra da pálpebra de cima (olhar meio sonolento, sereno) e o contorno dos lábios mais rosado
      g.strokeStyle = 'rgba(120,70,55,0.55)'; g.lineWidth = 1.5;
      for (const s of [-1, 1]) {
        g.beginPath(); g.moveTo(CX + s * 20, EYE_Y - 9); g.quadraticCurveTo(CX + s * 33, EYE_Y - 15, CX + s * 46, EYE_Y - 8); g.stroke();
      }
      g.fillStyle = 'rgba(190,105,95,0.35)';
      g.beginPath(); g.ellipse(CX, MOUTH_Y + 5, 12, 3.6, 0, 0, Math.PI * 2); g.fill();
    },
    eye: { iris: '#3a78c4', irisLight: '#86c0f4', tilt: -0.03, lashes: true, w: 14, h: 6.5 },
    brow: { angry: 0, thick: 3.2, color: '#6a4a26' },
    mouth: { mouthW: 13, smile: 0 },
  }),
  // camiseta amarela-mostarda: o tecido (trama e as dobras dos lados mais escuras), a gola canelada e a estampa preta
  // dos 3 triângulos em pirâmide com "oculto" embaixo. A frente é o meio (u = 0,5); o pescoço é a parte de BAIXO da
  // textura (o tubo do tronco vai do quadril ao pescoço): a estampa é desenhada de cabeça para baixo
  shirt_xande: () => canvasTex(512, 256, (g) => {
    g.fillStyle = '#d9ac22'; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 2600; i++) { // trama
      g.fillStyle = Math.random() < 0.5 ? 'rgba(255,240,170,0.06)' : 'rgba(90,60,0,0.07)';
      g.fillRect(Math.random() * 512, Math.random() * 256, 2, 1);
    }
    // dobras: lados (u ≈ 0 e 1, as costas e as laterais) mais escuros, e vincos verticais suaves
    const side = g.createLinearGradient(0, 0, 512, 0);
    side.addColorStop(0, 'rgba(110,70,0,0.25)'); side.addColorStop(0.25, 'rgba(110,70,0,0.0)');
    side.addColorStop(0.75, 'rgba(110,70,0,0.0)'); side.addColorStop(1, 'rgba(110,70,0,0.25)');
    g.fillStyle = side; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = 'rgba(120,80,0,0.12)'; g.lineWidth = 3;
    for (const x of [150, 200, 318, 362]) { g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 8, 128, x - 4, 256); g.stroke(); }
    // a gola canelada (em cima do tronco = embaixo da textura) e a barra (em cima da textura)
    g.fillStyle = '#c49a1c'; g.fillRect(0, 244, 512, 12);
    g.strokeStyle = 'rgba(80,50,0,0.35)'; g.lineWidth = 1;
    for (let x = 0; x < 512; x += 4) { g.beginPath(); g.moveTo(x, 244); g.lineTo(x, 256); g.stroke(); }
    g.fillStyle = 'rgba(110,70,0,0.3)'; g.fillRect(0, 0, 512, 5);
    // a estampa (de cabeça para baixo na textura → direita no peito: o pescoço é a parte de baixo da textura)
    g.save();
    g.translate(256, 128); g.scale(1, -1); g.translate(-256, -128);
    g.translate(0, -58); // sobe a estampa para o peito (o cinto e as tiras cobrem a barriga)
    const tri = (x, y, sz, hollow) => {
      g.beginPath(); g.moveTo(x, y - sz); g.lineTo(x + sz * 0.95, y + sz * 0.65); g.lineTo(x - sz * 0.95, y + sz * 0.65); g.closePath();
      g.fillStyle = '#141210'; g.fill();
      if (hollow) { g.beginPath(); g.moveTo(x, y - sz * 0.45); g.lineTo(x + sz * 0.45, y + sz * 0.33); g.lineTo(x - sz * 0.45, y + sz * 0.33); g.closePath(); g.fillStyle = '#d9ac22'; g.fill(); }
    };
    tri(256, 96, 26, true); tri(228, 140, 22, true); tri(284, 140, 22, true);
    // o "oculto" à mão embaixo dos triângulos (o X das tiras de couro já cruza por cima, como na arte)
    g.fillStyle = '#141210'; g.font = 'italic bold 32px Georgia, serif'; g.textAlign = 'center';
    g.fillText('oculto', 256, 192);
    // a tinta da estampa gasta (falhas claras)
    for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(217,172,34,0.55)'; g.fillRect(196 + Math.random() * 120, 66 + Math.random() * 140, 2, 2); }
    g.restore();
  }, { wrap: true }),
  // as mangas cinza largas da camiseta: malha com a barra dobrada mais escura
  sleeve_xande: () => canvasTex(128, 256, (g) => {
    g.fillStyle = '#6e7066'; g.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'; g.fillRect(Math.random() * 128, Math.random() * 256, 2, 1); }
    g.fillStyle = 'rgba(30,32,28,0.35)'; g.fillRect(0, 238, 128, 18); // a barra (embaixo da manga)
    g.strokeStyle = 'rgba(20,20,18,0.45)'; g.lineWidth = 1; g.setLineDash([3, 3]);
    g.beginPath(); g.moveTo(0, 236); g.lineTo(128, 236); g.stroke(); g.setLineDash([]);
  }, { wrap: true }),
  // a bermuda preta: sarja (diagonais finas), a costura lateral e um pesponto
  shorts_xande: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#18181b'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(255,255,255,0.035)'; g.lineWidth = 1;
    for (let k = -256; k < 256; k += 4) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 256, 256); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.setLineDash([4, 3]);
    for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
    g.setLineDash([]);
    for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(120,110,100,0.06)'; g.fillRect(Math.random() * 256, Math.random() * 256, 3, 2); } // poeira de skate
  }, { wrap: true }),
  // a balaclava cinza-esverdeada embolada: malha canelada com os triângulos brancos (wiki)
  gaiter_xande: () => canvasTex(256, 128, (g) => {
    g.fillStyle = '#5f6656'; g.fillRect(0, 0, 256, 128);
    g.strokeStyle = 'rgba(0,0,0,0.16)'; g.lineWidth = 2;
    for (let x = 0; x < 256; x += 5) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); }
    g.fillStyle = 'rgba(235,235,225,0.75)';
    for (let k = 0; k < 7; k++) { const x = 18 + k * 36, y = 40 + (k % 2) * 40; g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 7, y + 5); g.lineTo(x - 7, y + 5); g.closePath(); g.fill(); }
  }, { wrap: true, repeat: [3, 1] }),
  // pernas: a pele clara com os arranhões das quedas de skate e as marcas de mordida de cachorro nas canelas (wiki)
  legs_xande: () => canvasTex(256, 512, (g) => {
    g.fillStyle = '#e6bea2'; g.fillRect(0, 0, 256, 512);
    g.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 256;
      const y = 260 + Math.random() * 200; // da canela para baixo
      g.strokeStyle = `rgba(${160 + Math.random() * 40},${70 + Math.random() * 30},60,${0.2 + Math.random() * 0.25})`;
      g.lineWidth = 1 + Math.random() * 1.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 18, y + 10 + Math.random() * 22); g.stroke();
    }
    for (const [x, y] of [[70, 330], [190, 300]]) { // mordidas: pontinhos em arco
      g.fillStyle = 'rgba(150,60,55,0.35)';
      for (let k = 0; k < 7; k++) { const a = Math.PI * (0.15 + k * 0.12); g.beginPath(); g.arc(x + Math.cos(a) * 14, y + Math.sin(a) * 8, 1.6, 0, Math.PI * 2); g.fill(); }
    }
  }, { wrap: true }),
  // a barra amarela da bermuda e das munhequeiras: uma fileira de triângulos pretos entre dois filetes
  trim_xande: () => canvasTex(256, 32, (g) => {
    g.fillStyle = '#e2b524'; g.fillRect(0, 0, 256, 32);
    g.fillStyle = '#141414';
    g.fillRect(0, 2, 256, 3); g.fillRect(0, 27, 256, 3);
    for (let x = 0; x < 256; x += 21) { g.beginPath(); g.moveTo(x, 24); g.lineTo(x + 10, 8); g.lineTo(x + 20, 24); g.closePath(); g.fill(); }
  }, { wrap: true, repeat: [3, 1] }),

  // ---------------- GUIZO (Sinais do Outro Lado): rosto fino, olhos castanho-avermelhados, sobrancelhas escuras
  // grossas, meio sorriso curioso (referência "Guizo rosto")
  face_guizo: face((g) => {
    g.strokeStyle = 'rgba(150,90,70,0.35)'; g.lineWidth = 1.4; // maçãs do rosto marcadas (rosto fino)
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(CX + s * 46, 138); g.quadraticCurveTo(CX + s * 50, 160, CX + s * 40, 182); g.stroke(); }
  }, {
    skin: '#c98d64',
    eye: { iris: '#6a2418', irisLight: '#a8442c', tilt: 0.02 },
    brow: { angry: 0, thick: 6, color: '#2a1612' },
    mouth: { mouthW: 13, smile: 3 },
  }),
  // camiseta preta da banda AHLEVO ("ovelha" ao contrário): a ovelha de cabeça para baixo, o nome rabiscado em branco,
  // △ X O espalhados; a gola da camisa listrada aparecendo em volta do pescoço. A frente é o meio (u = 0,5); o pescoço
  // é a parte de BAIXO da textura (o tubo do tronco vai do quadril ao pescoço)
  shirt_guizo: () => canvasTex(512, 256, (g) => {
    g.fillStyle = '#242226'; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(255,255,255,0.025)'; g.fillRect(Math.random() * 512, Math.random() * 256, 2, 2); }
    // gola listrada (camisa de baixo) no topo do tronco = fim da textura
    for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#e8e2da' : '#b01c28'; g.fillRect(0, 246 + k * 3, 512, 3); }
    g.save();
    g.translate(256, 0); g.scale(1, -1); g.translate(-256, -256); // estampa de cabeça para cima no peito
    // ovelha de cabeça para baixo: o corpo de lã (nuvem) em cima, as patas para cima, a cabeça preta embaixo
    g.fillStyle = '#d8d6d4';
    for (const [x, y, r] of [[256, 128, 30], [228, 124, 20], [284, 124, 20], [240, 108, 18], [272, 108, 18], [256, 100, 16], [236, 140, 16], [276, 140, 16]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#d8d6d4';
    for (const x of [236, 250, 262, 276]) g.fillRect(x - 2, 72, 4, 22); // patas para cima
    g.fillStyle = '#0c0c0e';
    g.beginPath(); g.ellipse(256, 168, 16, 20, 0, 0, Math.PI * 2); g.fill(); // cabeça embaixo
    g.fillStyle = '#d8d6d4'; g.beginPath(); g.arc(250, 172, 2.5, 0, Math.PI * 2); g.arc(262, 172, 2.5, 0, Math.PI * 2); g.fill();
    // △ X O na barriga da ovelha
    g.strokeStyle = '#141416'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(256, 112); g.lineTo(266, 128); g.lineTo(246, 128); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(236, 134); g.lineTo(246, 144); g.moveTo(246, 134); g.lineTo(236, 144); g.stroke();
    g.beginPath(); g.arc(274, 139, 6, 0, Math.PI * 2); g.stroke();
    // o nome da banda rabiscado
    g.fillStyle = '#ecebe8'; g.font = 'bold 30px "Comic Sans MS", cursive, sans-serif'; g.textAlign = 'center';
    g.fillText('AHLEVO', 256, 56);
    // △ X O nas mangas / lados
    g.strokeStyle = '#ecebe8'; g.lineWidth = 2.5;
    for (const cx of [120, 392]) {
      g.beginPath(); g.moveTo(cx, 60); g.lineTo(cx + 9, 75); g.lineTo(cx - 9, 75); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(cx - 14, 92); g.lineTo(cx - 4, 102); g.moveTo(cx - 4, 92); g.lineTo(cx - 14, 102); g.stroke();
      g.beginPath(); g.arc(cx + 10, 97, 6, 0, Math.PI * 2); g.stroke();
    }
    g.restore();
  }, { wrap: true }),
  // camisa listrada vermelha e branca (mangas compridas por baixo da camiseta)
  sleeve_guizo: () => canvasTex(64, 128, (g) => {
    for (let y = 0; y < 128; y += 16) { g.fillStyle = '#b81c2a'; g.fillRect(0, y, 64, 9); g.fillStyle = '#ebe5dc'; g.fillRect(0, y + 9, 64, 7); }
    g.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 0; x < 64; x += 16) g.fillRect(x, 0, 3, 128);
  }, { wrap: true, repeat: [1, 2] }),
  // calça cinza-oliva gasta, rasgada no joelho e na canela (a pele aparecendo, fios soltos), barra dobrada embaixo
  pants_guizo: () => canvasTex(256, 256, (g) => {
    let seed = 77;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    g.fillStyle = '#5e5d52'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1200; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(30,30,24,0.2)' : 'rgba(140,138,120,0.14)'; g.fillRect(rnd() * 256, rnd() * 256, 2, 2); }
    g.strokeStyle = 'rgba(30,30,26,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 256); g.moveTo(192, 0); g.lineTo(192, 256); g.stroke();
    const rip = (cx, cy, rx, ry) => {
      g.fillStyle = '#8a5a44';
      g.beginPath();
      for (let k = 0; k <= 22; k++) { const a = (k / 22) * Math.PI * 2; const r = 1 + (k % 2 ? 0.3 : -0.1) * rnd(); const x = cx + Math.cos(a) * rx * r; const y = cy + Math.sin(a) * ry * r; if (k) g.lineTo(x, y); else g.moveTo(x, y); }
      g.closePath(); g.fill();
      g.strokeStyle = 'rgba(200,196,176,0.85)'; g.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) { const y = cy - ry * 0.6 + k * ry * 0.4; g.beginPath(); g.moveTo(cx - rx, y); g.quadraticCurveTo(cx, y + 3, cx + rx, y); g.stroke(); }
    };
    rip(118, 120, 20, 9); rip(142, 176, 14, 7); rip(100, 205, 12, 6);
    for (let y = 232; y < 256; y += 7) { g.fillStyle = 'rgba(20,20,16,0.4)'; g.fillRect(0, y, 256, 2); }
  }, { wrap: true }),
  // pano xadrez preto e vermelho-escuro preso na pochete
  plaid_guizo: () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#6a1018'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(10,8,10,0.55)';
    for (let k = 0; k < 128; k += 32) { g.fillRect(k, 0, 12, 128); g.fillRect(0, k, 128, 12); }
    g.fillStyle = 'rgba(200,160,160,0.25)';
    for (let k = 20; k < 128; k += 32) { g.fillRect(k, 0, 2, 128); g.fillRect(0, k, 128, 2); }
  }, { wrap: true, repeat: [2, 2] }),

  // ---------------- BALU: rosto largo e sorridente, bigode grosso e cavanhaque curto no meio do queixo, sobrancelhas
  // grossas, e a cicatriz em ESPIRAL no lugar da orelha direita (lado direito = x < 256); polo branca com flores
  // amarelas; antebraços fortes e peludos; jeans azul-claro; fivela do Amuleto (veias vermelhas + Símbolo de Sangue)
  face_balu: face((g) => {
    stubble(g, 'rgba(25,18,14,0.22)', 900, { y0: 150, y1: 215, w: 74 });
    // bigode grosso (a malha dá o volume; a pintura dá a sombra e os fios)
    g.fillStyle = '#17110f';
    g.beginPath();
    g.moveTo(CX - 34, MOUTH_Y + 2);
    g.quadraticCurveTo(CX - 20, MOUTH_Y - 20, CX, MOUTH_Y - 12);
    g.quadraticCurveTo(CX + 20, MOUTH_Y - 20, CX + 34, MOUTH_Y + 2);
    g.quadraticCurveTo(CX, MOUTH_Y - 4, CX - 34, MOUTH_Y + 2);
    g.fill();
    // cavanhaque curto só no meio do queixo
    g.beginPath(); g.ellipse(CX, MOUTH_Y + 30, 10, 12, 0, 0, Math.PI * 2); g.fill();
    // cicatriz em espiral onde ficava a orelha direita
    g.strokeStyle = 'rgba(150,80,72,0.85)'; g.lineWidth = 2.6; g.lineCap = 'round';
    g.beginPath();
    for (let k = 0; k <= 60; k++) {
      const a = k * 0.32;
      const r = 2 + k * 0.33;
      const x = 128 + Math.cos(a) * r;
      const y = 132 + Math.sin(a) * r * 1.2;
      if (k) g.lineTo(x, y); else g.moveTo(x, y);
    }
    g.stroke();
    // marcas de expressão (sempre sorrindo)
    g.strokeStyle = 'rgba(90,50,35,0.35)'; g.lineWidth = 1.4;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(CX + s * 30, 150); g.quadraticCurveTo(CX + s * 40, 168, CX + s * 34, 182); g.stroke(); }
  }, {
    skin: '#c8946e',
    eye: { iris: '#3a2a20', irisLight: '#6a5040', tilt: -0.04, h: 6 },
    brow: { angry: -1, thick: 8, color: '#17110f' },
    mouth: { mouthW: 20, smile: 6, teeth: true },
  }),
  // ---------------- ARNALDO FRITZ (Desconjuração/Calamidade): ~50 anos, barba castanha bem aparada, olhar confiante de
  // ator (meio sorriso de canto), rugas leves de expressão
  face_arnaldo: face((g) => {
    stubble(g, 'rgba(62,38,20,0.5)', 1600, { y0: 140, y1: 225, w: 82 });
    g.strokeStyle = 'rgba(110,70,50,0.35)'; g.lineWidth = 1.3;
    for (const s of [-1, 1]) { // pés de galinha e marca do sorriso
      for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(CX + s * 58, EYE_Y - 4 + k * 5); g.lineTo(CX + s * 68, EYE_Y - 7 + k * 7); g.stroke(); }
      g.beginPath(); g.moveTo(CX + s * 26, 150); g.quadraticCurveTo(CX + s * 34, 166, CX + s * 30, 180); g.stroke();
    }
    g.beginPath(); g.moveTo(CX - 18, EYE_Y - 34); g.lineTo(CX + 18, EYE_Y - 34); g.stroke(); // ruga da testa
  }, {
    skin: '#d4a484',
    eye: { iris: '#4a3018', irisLight: '#7a5a38', tilt: 0.02, h: 7, lid: 3.6 },
    brow: { angry: 1, thick: 6, color: '#3e2614', arch: 3 },
    mouth: { mouthW: 18, smirk: true, lipLine: true },
  }),
  // ANFITRIÃO: matéria caótica da Energia — roxo com veias rosa e azul pulsando (o rosto fica sob a máscara)
  face_anfitriao: () => canvasTex(512, 256, (g) => {
    g.fillStyle = '#6a2ac0'; g.fillRect(0, 0, 512, 256);
    energyVeins(g, 512, 256);
  }, { wrap: true }),
  skin_anfitriao: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#6a2ac0'; g.fillRect(0, 0, 256, 256);
    energyVeins(g, 256, 256);
  }, { wrap: true }),
  // colete MARROM abotoado com a camisa social BRANCA aparecendo em V no peito (a gravata é malha)
  vest_arnaldo: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#5a3a24'; g.fillRect(0, 0, 512, 512);
    const rnd = seeded(7);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '30,18,10' : '120,86,60'},0.12)`; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
    // o V fica embaixo da textura (o UV do tronco tem v=1 no pescoço)
    g.fillStyle = '#eeeae2'; // camisa branca no V
    g.beginPath(); g.moveTo(196, 512); g.lineTo(256, 322); g.lineTo(316, 512); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(30,18,10,0.6)'; g.lineWidth = 3; // borda do colete
    g.beginPath(); g.moveTo(196, 512); g.lineTo(256, 322); g.lineTo(316, 512); g.stroke();
    g.fillStyle = 'rgba(30,18,10,0.35)'; // bolsos
    for (const x of [150, 330]) g.fillRect(x, 207, 46, 5);
  }, { wrap: true }),
  coat_arnaldo: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#26252c'; g.fillRect(0, 0, 256, 256);
    const rnd = seeded(9);
    for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '10,10,14' : '70,68,80'},0.14)`; g.fillRect(rnd() * 256, rnd() * 256, 1.5, 3); }
  }, { wrap: true }),
  pants_arnaldo: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#5a4030'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(40,26,16,0.4)'; g.lineWidth = 2; // vinco
    for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
  }, { wrap: true }),
  // ---------------- SENHOR VERÍSSIMO (Calamidade): 60 anos, cansado e pálido, OLHEIRAS grandes, rugas fundas, olhar
  // sério e concentrado; barba e bigode grisalhos (a malha dá o volume)
  face_verissimo: face((g) => {
    stubble(g, 'rgba(150,146,140,0.55)', 1800, { y0: 135, y1: 230, w: 88 });
    g.strokeStyle = 'rgba(100,70,60,0.4)'; g.lineWidth = 1.6;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(CX - 30, EYE_Y - 32 - k * 7); g.quadraticCurveTo(CX, EYE_Y - 36 - k * 7, CX + 30, EYE_Y - 32 - k * 7); g.stroke(); } // testa
    g.beginPath(); g.moveTo(CX - 6, EYE_Y - 20); g.lineTo(CX - 4, EYE_Y - 8); g.moveTo(CX + 6, EYE_Y - 20); g.lineTo(CX + 4, EYE_Y - 8); g.stroke(); // vinco entre as sobrancelhas
    for (const s of [-1, 1]) {
      g.fillStyle = 'rgba(90,60,70,0.28)'; // olheiras fundas
      g.beginPath(); g.ellipse(CX + s * 32, EYE_Y + 13, 19, 8, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(CX + s * 24, 148); g.quadraticCurveTo(CX + s * 36, 168, CX + s * 32, 190); g.stroke(); // bigode-chinês
    }
  }, {
    skin: '#d8b49c',
    eye: { iris: '#3a4a5a', irisLight: '#6a7a8a', tilt: -0.06, h: 6, lid: 4, bags: true },
    brow: { angry: 3, thick: 7, color: '#b8b4ae' },
    mouth: { mouthW: 18, lipLine: true },
  }),
  // MANANCIAL (invocação do Ferreiro; miniaturas e a HQ de O Segredo na Floresta): pálido cinza-esverdeado, os olhos
  // FUNDOS e PRETOS (covas escuras, sem íris), olheiras, o rosto chupado e os lábios rachados de quem enlouqueceu na cela
  face_manancial: () => canvasTex(W, HT, (g) => {
    g.fillStyle = '#bcbdac'; g.fillRect(0, 0, W, HT);
    const rnd = seeded(15);
    for (let i = 0; i < 80; i++) { // a pele manchada e encardida
      g.fillStyle = `rgba(${90 + rnd() * 40 | 0},${96 + rnd() * 30 | 0},${80 + rnd() * 20 | 0},${0.05 + rnd() * 0.08})`;
      g.beginPath(); g.ellipse(rnd() * W, rnd() * HT, 4 + rnd() * 16, 3 + rnd() * 12, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
    // as covas dos olhos: a olheira larga e, dentro, o olho PRETO e fundo
    for (const s of [-1, 1]) {
      const ring = g.createRadialGradient(CX + s * 32, EYE_Y + 4, 6, CX + s * 32, EYE_Y + 6, 32);
      ring.addColorStop(0, 'rgba(40,34,40,0.9)'); ring.addColorStop(0.55, 'rgba(70,58,66,0.55)'); ring.addColorStop(1, 'rgba(70,58,66,0)');
      g.fillStyle = ring; g.beginPath(); g.ellipse(CX + s * 32, EYE_Y + 6, 32, 22, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#060606'; g.beginPath(); g.ellipse(CX + s * 32, EYE_Y + 4, 15, 11, s * -0.08, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(220,220,210,0.55)'; g.beginPath(); g.arc(CX + s * 28, EYE_Y, 2.2, 0, Math.PI * 2); g.fill(); // o brilho úmido
    }
    // o rosto chupado: as sombras sob as maçãs e o nariz fino
    g.strokeStyle = 'rgba(70,72,60,0.4)'; g.lineWidth = 2;
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(CX + s * 46, EYE_Y + 34); g.quadraticCurveTo(CX + s * 50, MOUTH_Y - 16, CX + s * 40, MOUTH_Y + 26); g.stroke();
      g.beginPath(); g.moveTo(CX + s * 4, EYE_Y + 16); g.lineTo(CX + s * 7, NOSE_Y + 4); g.stroke();
    }
    // a boca entreaberta, escura, com os lábios rachados
    g.fillStyle = 'rgba(40,24,28,0.85)'; g.beginPath(); g.ellipse(CX, MOUTH_Y, 14, 5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(120,70,70,0.55)'; g.lineWidth = 1;
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(CX + k * 6, MOUTH_Y - 7); g.lineTo(CX + k * 6 + 1, MOUTH_Y - 2); g.stroke(); }
  }),
  // o TRONCO esquálido: a pele pálida com as sombras das costelas, a sujeira e o SÍMBOLO ESPIRAL marcado no peito
  // (a marca do Santo; frente = metade de baixo da textura, como nas outras camisas)
  skin_manancial_torso: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#bcbdac'; g.fillRect(0, 0, 512, 512);
    const rnd = seeded(11);
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(${80 + rnd() * 40 | 0},${84 + rnd() * 30 | 0},${70 + rnd() * 20 | 0},${0.05 + rnd() * 0.1})`;
      g.beginPath(); g.ellipse(rnd() * 512, rnd() * 512, 10 + rnd() * 40, 6 + rnd() * 30, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
    // as sombras entre as costelas (faixas curvas dos lados)
    g.strokeStyle = 'rgba(80,84,70,0.28)'; g.lineWidth = 6;
    for (let k = 0; k < 7; k++) {
      const y = 250 + k * 26;
      for (const x0 of [40, 300]) { g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo(x0 + 85, y - 22, x0 + 170, y); g.stroke(); }
    }
    // o Símbolo Espiral cortado na pele (cicatriz escura e avermelhada)
    g.strokeStyle = 'rgba(90,24,28,0.85)'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath();
    for (let t = 0; t <= 1; t += 0.01) {
      const a = t * Math.PI * 6;
      const r = 4 + t * 46;
      const x = 256 + Math.cos(a) * r;
      const y = 372 + Math.sin(a) * r;
      if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }, { wrap: true }),
  vest_verissimo: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#1c1c20'; g.fillRect(0, 0, 512, 512);
    const rnd = seeded(5);
    for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '70,70,80'},0.14)`; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
    g.fillStyle = '#efece6'; // camisa branca no V (embaixo da textura = no pescoço)
    g.beginPath(); g.moveTo(200, 512); g.lineTo(256, 332); g.lineTo(312, 512); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(200, 512); g.lineTo(256, 332); g.lineTo(312, 512); g.stroke();
    g.fillStyle = 'rgba(80,80,90,0.5)';
    for (const x of [150, 330]) g.fillRect(x, 208, 46, 4);
    // o RISCADO DE GIZ do colete (Calamidade): listras claras finas na vertical, fora do V da camisa
    g.strokeStyle = 'rgba(150,150,160,0.32)'; g.lineWidth = 1.5;
    for (let x = 6; x < 512; x += 14) {
      g.beginPath(); g.moveTo(x, 0);
      const inV = x > 200 && x < 312;
      g.lineTo(x, inV ? 332 + Math.abs(x - 256) * (180 / 56) : 512); g.stroke(); // para na borda do V
    }
  }, { wrap: true }),
  shirt_verissimo: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#efece6'; g.fillRect(0, 0, 256, 256);
    const rnd = seeded(3);
    for (let i = 0; i < 14; i++) {
      const x = rnd() * 256;
      g.strokeStyle = 'rgba(120,120,135,0.22)'; g.lineWidth = 3 + rnd() * 5;
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 20, 90, x - 20, 170, x + 8, 256); g.stroke();
    }
  }, { wrap: true }),
  // calça escura RISCADA (Calamidade) com o vinco
  pants_verissimo: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#2a2a30'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(140,140,150,0.28)'; g.lineWidth = 1;
    for (let x = 4; x < 256; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
    g.strokeStyle = 'rgba(10,10,14,0.5)'; g.lineWidth = 2;
    for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
  }, { wrap: true }),
  // polo VERDE-CLARA (o desenho de Calamidade, base do modelo): dobras sombreadas, carcela com botões e a abertura em V
  shirt_balu: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#9cc49a'; g.fillRect(0, 0, 512, 512);
    // dobras do tecido (faixas mais escuras e mais claras, na vertical e em diagonal)
    const rnd = seeded(41);
    for (let i = 0; i < 26; i++) {
      const x = rnd() * 512;
      const w = 6 + rnd() * 14;
      g.fillStyle = rnd() < 0.6 ? 'rgba(40,80,50,0.16)' : 'rgba(255,255,255,0.12)';
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 30, 170, x - 30, 340, x + 10, 512); g.lineTo(x + w + 10, 512); g.bezierCurveTo(x + w - 30, 340, x + w + 30, 170, x + w, 0); g.closePath(); g.fill();
    }
    // trama fina do piquê
    g.strokeStyle = 'rgba(30,60,40,0.10)'; g.lineWidth = 1;
    for (let y = 0; y < 512; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
    // abertura da gola em V no meio da frente (pele), carcela e dois botões
    g.fillStyle = '#c8946e';
    g.beginPath(); g.moveTo(228, 0); g.lineTo(256, 78); g.lineTo(284, 0); g.closePath(); g.fill();
    g.fillStyle = '#86b088'; g.fillRect(250, 78, 12, 70);
    g.fillStyle = '#e8eee4';
    for (const y of [96, 128]) { g.beginPath(); g.arc(256, y, 4, 0, Math.PI * 2); g.fill(); }
  }, { wrap: true }),
  arms_balu: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#c8946e'; g.fillRect(0, 0, 256, 256);
    // pelos escuros nos antebraços e veias leves
    for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(30,20,14,0.3)'; g.fillRect(Math.random() * 256, Math.random() * 256, 1, 2.5); }
    g.strokeStyle = 'rgba(110,70,60,0.25)'; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const x = 20 + Math.random() * 216; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 20, 80, x - 20, 160, x + 10, 256); g.stroke(); }
  }, { wrap: true }),
  jeans_balu: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#7f9aa8'; g.fillRect(0, 0, 256, 256); // azul acinzentado da miniatura de Calamidade
    // trama diagonal do jeans, desbotado no joelho, costura dourada
    g.strokeStyle = 'rgba(40,60,100,0.22)'; g.lineWidth = 1;
    for (let i = -256; i < 256; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 256, 256); g.stroke(); }
    const fade = g.createRadialGradient(128, 140, 4, 128, 140, 90);
    fade.addColorStop(0, 'rgba(230,240,250,0.35)'); fade.addColorStop(1, 'rgba(230,240,250,0)');
    g.fillStyle = fade; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(200,150,60,0.6)'; g.setLineDash([4, 3]);
    g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 256); g.moveTo(192, 0); g.lineTo(192, 256); g.stroke();
    g.setLineDash([]);
  }, { wrap: true }),
  amulet_balu: () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#9a8e80'; g.fillRect(0, 0, 128, 128);
    // veias vermelhas e o Símbolo de Sangue
    g.strokeStyle = '#a01018'; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(64, 64); g.quadraticCurveTo(Math.random() * 128, Math.random() * 128, Math.random() * 128, Math.random() * 128); g.stroke(); }
    g.strokeStyle = '#ff2a3d'; g.lineWidth = 4;
    g.beginPath(); g.arc(64, 64, 22, 0, Math.PI * 2); g.moveTo(64, 34); g.lineTo(64, 94); g.moveTo(40, 64); g.lineTo(88, 64); g.stroke();
  }),

  // ---------------- LÍRIO: rosto largo e sorridente, barba loira aparada; camisa azul com o emblema branco;
  // antebraços com cicatrizes de corte (ataduras são malhas à parte)
  face_lirio: face((g) => {
    stubble(g, 'rgba(150,110,40,0.42)', 1600, { y0: 150, y1: 225, w: 92 });
    // cicatriz pequena no supercílio direito
    g.strokeStyle = 'rgba(170,90,80,0.65)'; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX - 52, 96); g.lineTo(CX - 40, 108); g.stroke();
  }, {
    skin: '#e8c0a2',
    eye: { iris: '#5a4a2a', irisLight: '#8a7a4a', tilt: -0.02 },
    brow: { angry: 2, thick: 6, color: '#8a6a2a' },
    mouth: { mouthW: 17, smile: 4, smirk: 1 },
  }),
  shirt_lirio: () => canvasTex(512, 256, (g) => {
    g.fillStyle = '#2c4f8a'; g.fillRect(0, 0, 512, 256);
    // o tubo do tronco vai do quadril ao pescoço: desenha "em pé" (y = 0 no pescoço)
    g.translate(0, 256); g.scale(1, -1);
    // emblema branco no peito (frente = meio da textura): triângulo vazado com a "cabeça" dos Cinco
    g.fillStyle = '#e8eef4';
    g.beginPath(); g.moveTo(256, 54); g.lineTo(296, 128); g.lineTo(216, 128); g.closePath(); g.fill();
    g.fillStyle = '#2c4f8a';
    g.beginPath(); g.moveTo(256, 80); g.lineTo(279, 120); g.lineTo(233, 120); g.closePath(); g.fill();
    g.fillStyle = '#e8eef4';
    g.beginPath(); g.ellipse(256, 108, 9, 11, 0, 0, Math.PI * 2); g.fill();
    // gola em V amarrada (cadarço)
    g.strokeStyle = '#1a2e52'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(240, 0); g.lineTo(256, 36); g.lineTo(272, 0); g.stroke();
    g.strokeStyle = 'rgba(230,230,230,0.7)'; g.lineWidth = 1.2;
    for (let y = 8; y < 34; y += 8) { g.beginPath(); g.moveTo(246, y); g.lineTo(266, y + 4); g.stroke(); }
    // trama do tecido e sujeira
    g.strokeStyle = 'rgba(10,20,40,0.18)'; g.lineWidth = 1;
    for (let y = 0; y < 256; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(60,40,20,0.12)'; g.beginPath(); g.arc(Math.random() * 512, 150 + Math.random() * 100, 4 + Math.random() * 8, 0, Math.PI * 2); g.fill(); }
  }, { wrap: true }),
  arms_lirio: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#e8c0a2'; g.fillRect(0, 0, 256, 256);
    // pelos claros e várias cicatrizes de corte (riscos rosados com pontos de sutura)
    for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(190,150,80,0.18)'; g.fillRect(Math.random() * 256, Math.random() * 256, 1, 2); }
    for (let i = 0; i < 11; i++) {
      const x = 10 + Math.random() * 236; const y = 60 + Math.random() * 180; const len = 14 + Math.random() * 26; const a = -0.6 + Math.random() * 1.2;
      g.strokeStyle = 'rgba(180,96,86,0.75)'; g.lineWidth = 2.2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
      g.strokeStyle = 'rgba(120,60,50,0.6)'; g.lineWidth = 1;
      for (let k = 4; k < len; k += 6) { const cx = x + Math.cos(a) * k; const cy = y + Math.sin(a) * k; g.beginPath(); g.moveTo(cx - Math.sin(a) * 3, cy + Math.cos(a) * 3); g.lineTo(cx + Math.sin(a) * 3, cy - Math.cos(a) * 3); g.stroke(); }
    }
  }, { wrap: true }),
  glove_lirio: () => canvasTex(128, 128, (g) => {
    // luva marrom com faixas azuis
    g.fillStyle = '#6a4428'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#2c4f8a'; g.fillRect(0, 40, 128, 14); g.fillRect(0, 84, 128, 10);
    g.strokeStyle = 'rgba(30,18,8,0.5)'; g.lineWidth = 1; g.setLineDash([3, 3]);
    g.beginPath(); g.moveTo(0, 38); g.lineTo(128, 38); g.moveTo(0, 56); g.lineTo(128, 56); g.stroke();
    g.setLineDash([]);
  }, { wrap: true }),
  coat_lirio: () => canvasTex(256, 256, (g) => {
    // lã azul-escura grossa com desgaste nas bordas
    g.fillStyle = '#1c2a44'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.08)'; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 1); }
    const grd = g.createLinearGradient(0, 200, 0, 256);
    grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(60,50,40,0.35)');
    g.fillStyle = grd; g.fillRect(0, 200, 256, 56);
  }, { wrap: true }),
  fur_white: () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#e8e4dc'; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(150,140,128,0.45)'; g.lineWidth = 1;
    for (let i = 0; i < 600; i++) { const x = Math.random() * 128; const y = Math.random() * 128; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 6, y + 4 + Math.random() * 5); g.stroke(); }
  }, { wrap: true, repeat: [3, 2] }),
  // pelo cinza-claro do sobretudo do Lírio (a miniatura de Sinais do Outro Lado)
  fur_lirio: () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#d6d1c8'; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(120,112,102,0.5)'; g.lineWidth = 1;
    for (let i = 0; i < 600; i++) { const x = Math.random() * 128; const y = Math.random() * 128; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 6, y + 4 + Math.random() * 5); g.stroke(); }
  }, { wrap: true, repeat: [3, 2] }),

  // ---------------- FERREIRO (Luzidio): pele cinza, olhos todo pretos, faixas pretas dos olhos às bochechas e do
  // nariz subindo pela cabeça; queimaduras nos braços
  face_luzidio: face((g) => {
    g.fillStyle = 'rgba(12,12,14,0.92)';
    // faixa do nariz subindo pela testa
    g.beginPath(); g.moveTo(CX - 7, 150); g.lineTo(CX - 10, 0); g.lineTo(CX + 10, 0); g.lineTo(CX + 7, 150); g.closePath(); g.fill();
    // faixas que descem dos olhos curvando para as bochechas
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(CX + s * 22, EYE_Y + 4);
      g.quadraticCurveTo(CX + s * 30, EYE_Y + 50, CX + s * 58, EYE_Y + 78);
      g.lineTo(CX + s * 66, EYE_Y + 70);
      g.quadraticCurveTo(CX + s * 44, EYE_Y + 40, CX + s * 40, EYE_Y + 4);
      g.closePath(); g.fill();
    }
    // queimadura parcial no rosto (lado direito)
    g.fillStyle = 'rgba(120,70,60,0.45)';
    g.beginPath(); g.ellipse(CX - 70, 180, 26, 34, 0.3, 0, Math.PI * 2); g.fill();
  }, {
    skin: '#8e9096',
    eye: { iris: '#050506', irisLight: '#101012', sclera: '#0a0a0c', tilt: 0.04 },
    brow: { angry: 4, thick: 6, color: '#d8d6d0' },
    mouth: { mouthW: 14, smile: 0 },
  }),
  // braços inteiros marcados pelas queimaduras (nas artes: pele cinza toda manchada de placas marrom-avermelhadas
  // com contorno escuro, como couro rachado), mais densas no antebraço
  arms_luzidio: () => canvasTex(256, 512, (g) => {
    let seed = 22;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    g.fillStyle = '#8e9096'; g.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 260; i++) {
      const y = rnd() ** 0.8 * 512;
      if (rnd() > 0.35 + (y / 512) * 0.65) continue; // ombro com menos marcas
      const x = rnd() * 256;
      const r = 5 + rnd() * 14;
      const tone = rnd();
      g.fillStyle = tone < 0.4 ? 'rgba(118,84,74,0.85)' : tone < 0.75 ? 'rgba(138,104,92,0.8)' : 'rgba(98,70,64,0.85)';
      g.beginPath();
      for (let k = 0; k <= 9; k++) {
        const a = (k / 9) * Math.PI * 2;
        const rr = r * (0.75 + rnd() * 0.45);
        const px = x + Math.cos(a) * rr;
        const py = y + Math.sin(a) * rr * 0.8;
        if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.closePath(); g.fill();
      g.strokeStyle = 'rgba(44,26,24,0.6)'; g.lineWidth = 1.3; g.stroke();
    }
  }, { wrap: true }),

  // ---------------- DEUS DA MORTE: tendões de Lodo preto, espiral no peito, crânio com as faixas Luzidias
  // tendões: cordas fibrosas pretas e cinza, com as bordas de cada feixe mais claras (como nas artes)
  lodo_tendon: () => canvasTex(256, 256, (g) => tendonRopes(g, 256, 256), { wrap: true, repeat: [2, 1] }),
  // peito: os tendões se retorcem numa ESPIRAL, que brilha em vermelho (emissiveMap)
  lodo_chest: () => {
    const spiral = (g, glow) => {
      for (let k = 0; k < (glow ? 2 : 3); k++) {
        g.strokeStyle = glow ? (k ? 'rgba(255,120,90,0.9)' : 'rgba(255,40,30,0.95)') : k === 1 ? 'rgba(120,114,126,0.9)' : 'rgba(8,6,10,0.95)';
        g.lineWidth = glow ? (k ? 2 : 6) : k === 1 ? 3 : 8;
        g.beginPath();
        for (let t = 0; t < 1; t += 0.008) {
          const a = t * Math.PI * 7;
          const r = 5 + t * 78 + k * 2;
          const x = 256 + Math.cos(a) * r;
          const y = 186 + Math.sin(a) * r * 0.6; // no tronco o V cresce de baixo para cima: 186 ≈ meio do peito
          if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }
    };
    const map = canvasTex(512, 256, (g) => { tendonRopes(g, 512, 256); spiral(g, false); }, { wrap: true });
    const emissiveMap = canvasTex(512, 256, (g) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, 512, 256);
      const grd = g.createRadialGradient(256, 186, 4, 256, 186, 90);
      grd.addColorStop(0, 'rgba(120,10,8,0.8)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(150, 100, 212, 156);
      spiral(g, true);
    }, { wrap: true });
    return { map, emissiveMap, emissive: 0xff3a2a };
  },
  face_skull: () => canvasTex(W, HT, (g) => {
    // crânio exposto (osso amarelado), órbitas fundas, nariz triangular e dentes; faixas Luzidias no osso
    g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, W, HT);
    g.fillStyle = 'rgba(150,140,120,0.5)';
    for (let i = 0; i < 300; i++) g.fillRect(Math.random() * W, Math.random() * HT, 2, 2);
    g.fillStyle = '#060506';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(CX + s * 32, EYE_Y + 2, 22, 18, 0, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.moveTo(CX, 140); g.lineTo(CX - 11, 170); g.lineTo(CX + 11, 170); g.closePath(); g.fill();
    g.fillStyle = '#efe8d6';
    for (let i = -4; i <= 4; i++) { g.fillRect(CX + i * 9 - 3.5, 186, 7, 14); }
    g.strokeStyle = '#3a342c'; g.lineWidth = 1.5;
    g.strokeRect(CX - 40, 186, 80, 14);
    g.fillStyle = 'rgba(12,12,14,0.85)';
    g.fillRect(CX - 7, 0, 14, 128); // faixa preta vertical do topo do crânio até o nariz
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(CX + s * 30, EYE_Y + 18); g.lineTo(CX + s * 52, EYE_Y + 78); g.lineTo(CX + s * 62, EYE_Y + 72); g.lineTo(CX + s * 42, EYE_Y + 16); g.closePath(); g.fill(); }
  }, { wrap: true }),

  // ---------------- JUAN (Henri): olho ESQUERDO perdido (buraco com cicatriz), o direito esbranquiçado, piercings na
  // boca e no olho, olheiras; torso cheio de cortes e frases tatuadas (menos o peito/braço esquerdo)
  // KEMI: pele negra, olhos âmbar, piercing no septo
  face_kemi: face((g) => {
    g.strokeStyle = '#c8c8d0'; g.lineWidth = 2.4;
    g.beginPath(); g.arc(CX, NOSE_Y + 6, 5, 0.2, Math.PI - 0.2); g.stroke();
  }, {
    skin: '#3a2216',
    eye: { iris: '#b8801a', irisLight: '#f0b040', tilt: 0.02, lashes: true },
    brow: { angry: 3, thick: 4, color: '#2a1810' },
    mouth: { mouthW: 15, lip: 'rgba(60,30,26,0.6)' },
  }),
  // o top branco curto: malha canelada, encardido de poeira e sangue seco
  top_kemi: () => canvasTex(512, 256, (g) => {
    const rnd = seeded(61);
    g.fillStyle = '#e4ded0'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = 'rgba(150,140,120,0.16)'; g.lineWidth = 1;
    for (let x = 0; x < 512; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
    for (let i = 0; i < 18; i++) { // poeira e suor
      g.fillStyle = `rgba(140,120,90,${0.06 + rnd() * 0.1})`;
      g.beginPath(); g.ellipse(rnd() * 512, rnd() * 256, 10 + rnd() * 30, 6 + rnd() * 18, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 8; i++) { // respingos de sangue seco
      g.fillStyle = `rgba(110,30,24,${0.2 + rnd() * 0.25})`;
      g.beginPath(); g.arc(rnd() * 512, rnd() * 256, 1.5 + rnd() * 3, 0, Math.PI * 2); g.fill();
    }
  }, { wrap: true }),
  // a calça cáqui larga: sarja grossa, joelhos gastos, costuras e terra na barra
  pants_kemi: () => canvasTex(256, 512, (g) => {
    const rnd = seeded(83);
    g.fillStyle = '#9c8c70'; g.fillRect(0, 0, 256, 512);
    g.strokeStyle = 'rgba(255,245,220,0.06)'; g.lineWidth = 1;
    for (let k = -512; k < 512; k += 3) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 512, 512); g.stroke(); }
    const knee = g.createRadialGradient(128, 300, 0, 128, 300, 70);
    knee.addColorStop(0, 'rgba(210,195,160,0.25)'); knee.addColorStop(1, 'rgba(210,195,160,0)');
    g.fillStyle = knee; g.fillRect(0, 220, 256, 160);
    g.strokeStyle = 'rgba(60,48,32,0.45)'; g.lineWidth = 2; g.setLineDash([5, 3]);
    for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
    g.setLineDash([]);
    const dirt = g.createLinearGradient(0, 400, 0, 512);
    dirt.addColorStop(0, 'rgba(70,52,34,0)'); dirt.addColorStop(1, 'rgba(70,52,34,0.4)');
    g.fillStyle = dirt; g.fillRect(0, 400, 256, 112);
    for (let i = 0; i < 24; i++) {
      g.fillStyle = `rgba(80,62,40,${0.1 + rnd() * 0.15})`;
      g.beginPath(); g.ellipse(rnd() * 256, rnd() * 512, 4 + rnd() * 14, 3 + rnd() * 8, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
  }, { wrap: true }),
  // o casaco de pano marrom amarrado na cintura: a trama, as dobras escuras e a barra suja
  coat_kemi: () => canvasTex(512, 512, (g) => {
    const rnd = leather(g, 512, 512, '#5c3c26', 19, { dark: '28,14,6', light: '150,100,64', marks: 60 });
    g.strokeStyle = 'rgba(30,16,8,0.1)'; g.lineWidth = 1;
    for (let k = 0; k < 512; k += 3) { g.beginPath(); g.moveTo(0, k); g.lineTo(512, k); g.stroke(); }
    g.strokeStyle = 'rgba(190,150,100,0.35)'; g.lineWidth = 1.5; g.setLineDash([5, 4]);
    for (const x of [8, 504]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
    g.setLineDash([]);
    for (let i = 0; i < 1200; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,220,180,0.04)' : 'rgba(0,0,0,0.06)'; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
  }, { wrap: true }),
  // JAE (Park Jae-Yoon): pele clara, maquiagem preta esfumada forte em volta dos olhos escuros, batom vermelho e a pinta
  // falsa no queixo (lado esquerdo dela, x > 256) — referências "jae serio" e "jae rosto"
  face_jae: jaeFace(false),
  // o sorriso de canto debaixo do capuz (cena da Transformação, o gif)
  face_jae_grin: jaeFace(true),
  // DALMO (o Colosso): pele escura, olhar pesado, cicatriz na bochecha esquerda e no nariz, barba rala
  face_dalmo: face((g) => {
    g.strokeStyle = 'rgba(30,14,10,0.7)'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX + 30, EYE_Y + 16); g.lineTo(CX + 50, EYE_Y + 44); g.stroke();
    g.beginPath(); g.moveTo(CX - 6, NOSE_Y - 18); g.lineTo(CX + 8, NOSE_Y - 6); g.stroke();
    g.fillStyle = 'rgba(20,10,8,0.35)';
    for (let i = 0; i < 260; i++) { const a = Math.random() * Math.PI; const r = 34 + Math.random() * 12; g.fillRect(CX + Math.cos(a) * r * 1.2, MOUTH_Y - 6 + Math.sin(a) * r * 0.75, 1.5, 1.5); }
  }, {
    skin: '#5a3a2a',
    eye: { iris: '#2a1a10', irisLight: '#4a3020', tilt: -0.04, w: 14, h: 6 },
    brow: { angry: 3, thick: 5, color: '#120c0a' },
    mouth: { mouthW: 17, lip: 'rgba(70,36,30,0.75)' },
  }),
  // tronco do Dalmo: pele escura cheia de cicatrizes das arenas (aparece no Colosso, sem a camisa)
  skin_torso_dalmo: () => canvasTex(512, 256, (g) => {
    g.fillStyle = '#5a3a2a'; g.fillRect(0, 0, 512, 256);
    const sh = g.createLinearGradient(0, 0, 0, 256);
    sh.addColorStop(0, 'rgba(255,220,190,0.06)'); sh.addColorStop(1, 'rgba(0,0,0,0.25)');
    g.fillStyle = sh; g.fillRect(0, 0, 512, 256);
    // peitoral e barriga marcados
    g.strokeStyle = 'rgba(30,16,10,0.35)'; g.lineWidth = 4;
    for (const s of [-1, 1]) { g.beginPath(); g.arc(256 + s * 46, 70, 44, 0.2, Math.PI - 0.2); g.stroke(); }
    g.beginPath(); g.moveTo(256, 40); g.lineTo(256, 200); g.stroke();
    // cicatrizes: riscos claros com borda escura
    let seed = 11;
    const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 26; i++) {
      const x = r() * 512; const y = 20 + r() * 220; const len = 18 + r() * 50; const a = r() * Math.PI;
      g.lineCap = 'round';
      g.strokeStyle = 'rgba(30,14,10,0.6)'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
      g.strokeStyle = 'rgba(150,100,80,0.75)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
  }, { wrap: true }),
  // cargo verde-musgo: costuras laterais, vincos de pano largo, o joelho rasgado (fendas desfiadas com a pele aparecendo)
  // e o pano franzido embaixo, por cima do coturno
  pants_dalmo: () => canvasTex(256, 256, (g) => {
    let seed = 41;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    g.fillStyle = '#3f4b35'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(20,26,16,0.22)' : 'rgba(110,120,90,0.15)'; g.fillRect(rnd() * 256, rnd() * 256, 2, 2); }
    for (let i = 0; i < 22; i++) {
      const x = rnd() * 256;
      const w = 4 + rnd() * 9;
      const grd = g.createLinearGradient(x - w, 0, x + w, 0);
      grd.addColorStop(0, 'rgba(18,24,14,0)'); grd.addColorStop(0.5, `rgba(18,24,14,${0.18 + rnd() * 0.2})`); grd.addColorStop(1, 'rgba(18,24,14,0)');
      g.fillStyle = grd; g.fillRect(x - w, rnd() * 80, w * 2, 256);
    }
    g.strokeStyle = 'rgba(20,24,14,0.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 256); g.moveTo(192, 0); g.lineTo(192, 256); g.stroke();
    // joelho rasgado: fendas horizontais irregulares, fios claros soltos
    {
      const cx = 128;
      const cy = 166;
      g.fillStyle = '#5c3c2a'; // a pele aparecendo pelo rasgo
      g.beginPath();
      for (let k = 0; k <= 28; k++) {
        const a = (k / 28) * Math.PI * 2;
        const r = 1 + (k % 2 ? 0.28 : -0.08) * rnd();
        const px = cx + Math.cos(a) * 30 * r;
        const py = cy + Math.sin(a) * 13 * r;
        if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.closePath(); g.fill();
      // fios claros atravessando o buraco e a borda desfiada
      g.strokeStyle = 'rgba(214,204,176,0.9)'; g.lineWidth = 1.6;
      for (let k = 0; k < 5; k++) {
        const y = cy - 8 + k * 4;
        g.beginPath(); g.moveTo(cx - 30, y + rnd() * 2); g.quadraticCurveTo(cx, y + 3 + rnd() * 3, cx + 30, y + rnd() * 2); g.stroke();
      }
      g.lineWidth = 1;
      for (let k = 0; k < 30; k++) {
        const a = (k / 30) * Math.PI * 2;
        const px = cx + Math.cos(a) * 30;
        const py = cy + Math.sin(a) * 13;
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * 4, py + Math.sin(a) * 4 + 1); g.stroke();
      }
    }
    // franzido embaixo (o pano dobra em cima do coturno)
    for (let y = 205; y < 256; y += 9) {
      g.strokeStyle = 'rgba(16,20,12,0.5)'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x * 0.08 + y) * 3); g.stroke();
    }
  }, { wrap: true }),
  // camisa social preta folgada: vincos verticais e repuxados (a camisa esticada na barriga), brilho fraco do tecido
  shirt_dalmo: () => canvasTex(512, 256, (g) => {
    let seed = 13;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    g.fillStyle = '#2d2c31'; g.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 40; i++) {
      const x = rnd() * 512;
      const w = 4 + rnd() * 14;
      const dark = rnd() < 0.6;
      const grd = g.createLinearGradient(x - w, 0, x + w, 0);
      const c = dark ? '10,10,14' : '86,84,94';
      const a = dark ? 0.3 + rnd() * 0.25 : 0.15 + rnd() * 0.15;
      grd.addColorStop(0, `rgba(${c},0)`); grd.addColorStop(0.5, `rgba(${c},${a})`); grd.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = grd;
      g.fillRect(x - w, 0, w * 2, 256);
    }
    // repuxados diagonais (tecido esticado)
    g.strokeStyle = 'rgba(12,12,16,0.35)'; g.lineWidth = 2;
    for (let i = 0; i < 26; i++) {
      const x = rnd() * 512;
      const y = rnd() * 256;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + 6, x + 24 + rnd() * 16, y + 4 + rnd() * 8); g.stroke();
    }
  }, { wrap: true }),
  // gola alta preta canelada (listras verticais)
  turtleneck_jae: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#1b191d'; g.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 8) {
      g.fillStyle = 'rgba(70,66,74,0.55)'; g.fillRect(x, 0, 2, 256);
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x + 4, 0, 2, 256);
    }
  }, { wrap: true }),
  // sobretudo de couro vermelho: vincos verticais escuros, brilhos do couro e a costura do meio das costas (u = 0,5)
  coat_jae: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#a3192a'; g.fillRect(0, 0, 512, 512);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 46; i++) {
      const x = rnd() * 512;
      const w = 3 + rnd() * 10;
      const y0 = rnd() * 200;
      const grd = g.createLinearGradient(x - w, 0, x + w, 0);
      const dark = rnd() < 0.6;
      const c = dark ? '70,6,16' : '214,70,80';
      const a = dark ? 0.25 + rnd() * 0.25 : 0.12 + rnd() * 0.12;
      grd.addColorStop(0, `rgba(${c},0)`); grd.addColorStop(0.5, `rgba(${c},${a})`); grd.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = grd;
      g.fillRect(x - w, y0, w * 2, 512 - y0 * (0.3 + rnd() * 0.5));
    }
    g.fillStyle = 'rgba(60,4,12,0.6)'; g.fillRect(254, 0, 3, 512);
    g.fillStyle = 'rgba(220,90,100,0.25)'; g.fillRect(258, 0, 1, 512);
  }, { wrap: true }),
  // A FANTASMA: rosto todo enfaixado; só os olhos âmbar numa fenda de escuridão
  face_fantasma: () => canvasTex(W, HT, (g) => {
    const rnd = seeded(41);
    g.fillStyle = '#d6cab0'; g.fillRect(0, 0, W, HT);
    // as voltas de faixa sobrepostas, cada uma com a borda de cima sombreada e a trama fina
    for (let y = -10; y < HT; y += 16) {
      const tilt = (rnd() - 0.5) * 10;
      g.fillStyle = `rgba(${200 + rnd() * 30},${188 + rnd() * 26},${160 + rnd() * 24},0.9)`;
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + tilt); g.lineTo(W, y + tilt + 15); g.lineTo(0, y + 15); g.fill();
      g.strokeStyle = 'rgba(100,80,55,0.55)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + tilt); g.stroke();
    }
    g.strokeStyle = 'rgba(120,100,70,0.12)'; g.lineWidth = 1;
    for (let x = 0; x < W; x += 3) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, HT); g.stroke(); }
    for (let i = 0; i < 16; i++) { // sujeira e sangue velho
      g.fillStyle = rnd() < 0.6 ? 'rgba(110,85,55,0.18)' : 'rgba(110,30,20,0.18)';
      g.beginPath(); g.ellipse(rnd() * W, rnd() * HT, 6 + rnd() * 18, 4 + rnd() * 10, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
    // a fenda dos olhos: escuridão com as bordas da faixa puídas e os olhos âmbar brilhando lá dentro
    const slit = g.createLinearGradient(0, EYE_Y - 18, 0, EYE_Y + 16);
    slit.addColorStop(0, 'rgba(6,4,6,0.3)'); slit.addColorStop(0.25, '#060406'); slit.addColorStop(0.8, '#060406'); slit.addColorStop(1, 'rgba(6,4,6,0.3)');
    g.fillStyle = slit; g.fillRect(0, EYE_Y - 18, W, 34);
    g.strokeStyle = 'rgba(200,185,155,0.7)'; g.lineWidth = 1;
    for (let x = 0; x < W; x += 4) { // os fiapos soltos nas bordas da fenda
      g.beginPath(); g.moveTo(x, EYE_Y - 16); g.lineTo(x + rnd() * 3, EYE_Y - 16 + rnd() * 6); g.stroke();
      g.beginPath(); g.moveTo(x, EYE_Y + 14); g.lineTo(x + rnd() * 3, EYE_Y + 14 - rnd() * 5); g.stroke();
    }
    for (const s of [-1, 1]) {
      const glow = g.createRadialGradient(CX + s * 32, EYE_Y, 0, CX + s * 32, EYE_Y, 14);
      glow.addColorStop(0, 'rgba(255,190,60,0.55)'); glow.addColorStop(1, 'rgba(255,140,20,0)');
      g.fillStyle = glow; g.fillRect(CX + s * 32 - 14, EYE_Y - 14, 28, 28);
      g.fillStyle = '#f0a020'; g.beginPath(); g.ellipse(CX + s * 32, EYE_Y, 6, 4.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff0c0'; g.beginPath(); g.arc(CX + s * 32 + 1.5, EYE_Y - 1.2, 1.4, 0, Math.PI * 2); g.fill();
    }
  }, { wrap: true }),
  // o sobretudo de couro marrom gasto: vincos, arranhões claros, as costuras pespontadas e a barra mais escura
  coat_fantasma: () => canvasTex(512, 512, (g) => {
    const rnd = leather(g, 512, 512, '#5e3e27', 77, { dark: '30,16,8', light: '170,120,80', marks: 70 });
    for (let i = 0; i < 40; i++) { // arranhões
      const x = rnd() * 512, y = rnd() * 512, a = rnd() * Math.PI, l = 6 + rnd() * 20;
      g.strokeStyle = `rgba(190,150,110,${0.15 + rnd() * 0.2})`; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    g.strokeStyle = 'rgba(200,160,110,0.4)'; g.lineWidth = 1.5; g.setLineDash([5, 4]);
    for (const x of [6, 250, 262, 506]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
    g.setLineDash([]);
    const hem = g.createLinearGradient(0, 430, 0, 512);
    hem.addColorStop(0, 'rgba(25,14,6,0)'); hem.addColorStop(1, 'rgba(25,14,6,0.45)');
    g.fillStyle = hem; g.fillRect(0, 430, 512, 82);
    for (let i = 0; i < 1500; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,220,180,0.04)' : 'rgba(0,0,0,0.06)'; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
  }, { wrap: true }),
  // a calça cargo marrom: o tecido grosso, o joelho gasto, as costuras laterais e os bolsos
  pants_fantasma: () => canvasTex(256, 512, (g) => {
    const rnd = seeded(91);
    g.fillStyle = '#4e3c2a'; g.fillRect(0, 0, 256, 512);
    g.strokeStyle = 'rgba(255,230,190,0.05)'; g.lineWidth = 1;
    for (let k = -512; k < 512; k += 3) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 512, 512); g.stroke(); }
    const knee = g.createRadialGradient(128, 300, 0, 128, 300, 70);
    knee.addColorStop(0, 'rgba(150,120,85,0.22)'); knee.addColorStop(1, 'rgba(150,120,85,0)');
    g.fillStyle = knee; g.fillRect(0, 220, 256, 160);
    g.strokeStyle = 'rgba(30,20,10,0.5)'; g.lineWidth = 2;
    for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
    g.strokeRect(20, 150, 40, 56); g.strokeRect(196, 150, 40, 56); // os bolsos laterais
    g.beginPath(); g.moveTo(20, 164); g.lineTo(60, 164); g.moveTo(196, 164); g.lineTo(236, 164); g.stroke();
    for (let i = 0; i < 20; i++) { // terra e poeira
      g.fillStyle = `rgba(90,70,45,${0.12 + rnd() * 0.15})`;
      g.beginPath(); g.ellipse(rnd() * 256, 300 + rnd() * 212, 4 + rnd() * 14, 3 + rnd() * 8, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
  }, { wrap: true }),
  // as faixas de pano (braços, canelas e cabeça): a trama, as bordas desfiadas e a sujeira
  bandage_fantasma: () => canvasTex(256, 256, (g) => {
    const rnd = seeded(23);
    g.fillStyle = '#d8ccb2'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(120,100,70,0.16)'; g.lineWidth = 1;
    for (let k = 0; k < 256; k += 3) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 256); g.stroke();
      g.beginPath(); g.moveTo(0, k); g.lineTo(256, k); g.stroke();
    }
    g.strokeStyle = 'rgba(95,75,50,0.45)'; g.lineWidth = 2;
    for (let y = 0; y < 256; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y + 2); g.stroke(); }
    for (let i = 0; i < 22; i++) {
      g.fillStyle = rnd() < 0.7 ? `rgba(120,95,60,${0.12 + rnd() * 0.18})` : `rgba(110,30,20,${0.12 + rnd() * 0.15})`;
      g.beginPath(); g.ellipse(rnd() * 256, rnd() * 256, 5 + rnd() * 16, 3 + rnd() * 9, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
  }, { wrap: true }),
  face_juan: face((g) => {
    // olho esquerdo arrancado: órbita escura com cicatriz e sangue seco
    g.fillStyle = '#2a0e0c';
    g.beginPath(); g.ellipse(CX + 32, EYE_Y, 17, 10, 0.08, 0, Math.PI * 2); g.fill();
    // ferida em CRUZ sobre o olho perdido (sangue escorrendo) e os pontos de metal que a costuram
    g.strokeStyle = 'rgba(150,20,24,0.9)'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX + 32, EYE_Y - 34); g.lineTo(CX + 32, EYE_Y + 30); g.moveTo(CX + 8, EYE_Y - 6); g.lineTo(CX + 58, EYE_Y - 6); g.stroke();
    g.strokeStyle = 'rgba(120,10,14,0.6)'; g.lineWidth = 3;
    for (const dx of [-6, 2, 9]) { g.beginPath(); g.moveTo(CX + 32 + dx, EYE_Y + 28); g.lineTo(CX + 33 + dx, EYE_Y + 52 + Math.random() * 18); g.stroke(); }
    g.strokeStyle = '#c8c8d0'; g.lineWidth = 2;
    for (let k = 0; k < 5; k++) { const y = EYE_Y - 26 + k * 12; g.beginPath(); g.moveTo(CX + 25, y); g.lineTo(CX + 39, y + 3); g.stroke(); }
    // BOCA COSTURADA: grampos de metal verticais atravessando os lábios
    g.strokeStyle = '#d0d0d8'; g.lineWidth = 2.6;
    for (let k = -3; k <= 3; k++) { const x = CX + k * 5; g.beginPath(); g.moveTo(x, MOUTH_Y - 8); g.lineTo(x + 1, MOUTH_Y + 9); g.stroke(); }
    g.fillStyle = 'rgba(90,30,30,0.55)';
    for (let k = -3; k <= 3; k++) { for (const y of [MOUTH_Y - 9, MOUTH_Y + 10]) { g.beginPath(); g.arc(CX + k * 5, y, 1.6, 0, Math.PI * 2); g.fill(); } }
    // barba por fazer no queixo
    stubble(g, 'rgba(70,45,30,0.4)', 700, { y0: 175, y1: 225, w: 70 });
    // olheiras e respingos de sangue
    g.fillStyle = 'rgba(90,40,50,0.35)';
    g.beginPath(); g.ellipse(CX - 32, EYE_Y + 12, 16, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(140,16,20,0.55)';
    for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(CX - 80 + Math.random() * 160, 140 + Math.random() * 90, 1.5 + Math.random() * 2.5, 0, Math.PI * 2); g.fill(); }
    // "psycho" tatuado na lateral da cabeça
    g.fillStyle = 'rgba(25,20,24,0.85)'; g.font = 'italic 16px serif';
    g.fillText('psycho', CX - 175, 70);
  }, {
    skin: '#d8a888',
    eye: { iris: '#d8d4cc', irisLight: '#f4f2ee', irisL: '#2a0e0c', tilt: 0.1 },
    brow: { angry: 3, thick: 4.5, color: '#3a2412' },
    mouth: { mouthW: 17, smile: 5, smirk: 3, lip: 'rgba(150,60,60,0.4)' },
  }),
  skin_torso_juan: () => canvasTex(512, 256, (g) => {
    g.fillStyle = '#d8a888'; g.fillRect(0, 0, 512, 256);
    // frases sombrias tatuadas (como as dos Escriptas), menos no peito esquerdo (x entre 256 e 330 na frente)
    g.fillStyle = 'rgba(25,20,24,0.8)'; g.font = '10px serif';
    const L = 'sangue livre dor desejo novo começo não quero morrer correntes quebradas o diabo escuta ';
    for (let y = 14; y < 256; y += 13) {
      let x = (y % 26) - 10;
      while (x < 512) {
        const w = 90;
        if (!(x > 250 && x < 330)) g.fillText(L.slice((x + y) % 40, ((x + y) % 40) + 14), x, y);
        x += w;
      }
    }
    // cortes (vermelhos, alguns frescos)
    for (let i = 0; i < 22; i++) {
      const x = Math.random() * 512; const y = Math.random() * 256; const len = 10 + Math.random() * 28; const a = -1 + Math.random() * 2;
      g.strokeStyle = Math.random() < 0.5 ? 'rgba(170,30,34,0.85)' : 'rgba(120,50,46,0.7)'; g.lineWidth = 1.5 + Math.random() * 1.5;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
  }, { wrap: true }),
  arms_juan: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#d8a888'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = 'rgba(25,20,24,0.75)'; g.font = '10px serif';
    for (let y = 14; y < 256; y += 13) g.fillText('dor desejo liberdade sangue', (y * 3) % 40 - 20, y);
    g.fillStyle = 'rgba(140,16,20,0.5)';
    for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 0, Math.PI * 2); g.fill(); }
  }, { wrap: true }),

  // ---------------- O DIABO (Juan Portador do Trono): sorriso enorme e dentado, olho preto de íris amarela (o outro
  // perdido, como o do Juan), nariz grande; torso com o símbolo de Sangue, boca vertical no umbigo e Sigilos de
  // Conhecimento DOURADOS brilhando no lado direito
  face_diabo: face((g) => {
    g.fillStyle = '#1a0606';
    g.beginPath(); g.ellipse(CX + 32, EYE_Y, 17, 10, 0.08, 0, Math.PI * 2); g.fill();
    // sorriso de orelha a orelha com dentes pontudos
    g.fillStyle = '#140404';
    g.beginPath(); g.moveTo(CX - 74, 180); g.quadraticCurveTo(CX, 238, CX + 74, 180); g.quadraticCurveTo(CX, 214, CX - 74, 180); g.fill();
    g.fillStyle = '#efe4cc';
    for (let i = -6; i <= 6; i++) {
      const x = CX + i * 11; const y = 186 + (1 - Math.abs(i) / 7) * 16;
      g.beginPath(); g.moveTo(x - 4.5, y - 4); g.lineTo(x + 4.5, y - 4); g.lineTo(x, y + 7); g.closePath(); g.fill();
    }
    g.fillStyle = '#d8d8de';
    for (const [x, y] of [[CX + 60, 196], [CX + 64, 204], [CX + 58, 211]]) { g.beginPath(); g.arc(x, y, 2.4, 0, Math.PI * 2); g.fill(); }
  }, {
    skin: '#a01818',
    eye: { iris: '#e8b020', irisLight: '#ffe070', sclera: '#060404', irisL: '#060404', tilt: 0.18 },
    brow: { angry: 9, thick: 6, color: '#3a0606' },
    mouth: { mouthW: 0, smile: 0 },
  }),
  skin_torso_diabo: () => {
    const sigils = (g, color) => {
      g.fillStyle = color; g.font = '15px serif';
      // sorteio com semente: a cor (map) e o brilho (emissiveMap) caem exatamente nos mesmos lugares
      const rnd = seeded(7);
      // lado DIREITO do corpo (na frente, x < 256)
      for (let y = 16; y < 250; y += 18) for (let x = 120; x < 240; x += 14) if (rnd() < 0.7) g.fillText(SIGIL_SET[Math.floor(rnd() * SIGIL_SET.length)], x, y);
    };
    const map = canvasTex(512, 256, (g) => {
      g.fillStyle = '#a01818'; g.fillRect(0, 0, 512, 256);
      // símbolo de Sangue enorme no peito (frente = meio)
      g.strokeStyle = '#3a0406'; g.lineWidth = 7; g.lineCap = 'round';
      g.beginPath(); g.arc(256, 92, 46, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(256, 30); g.lineTo(256, 154); g.moveTo(214, 70); g.lineTo(298, 114); g.moveTo(298, 70); g.lineTo(214, 114); g.stroke();
      // a boca vertical agora é malha 3D no modelo (char_diabo.py: belly_mouth_*)
      sigils(g, '#e8c060');
    }, { wrap: true });
    const emissiveMap = canvasTex(512, 256, (g) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, 512, 256);
      sigils(g, '#ffd27a');
    }, { wrap: true });
    return { map, emissiveMap, emissive: 0xffd27a };
  },
  // braço DIREITO do Diabo: onde o Juan tinha as tatuagens agora há Sigilos de Conhecimento dourados que brilham
  arms_diabo: () => {
    const sigils = (g, color) => {
      const rnd = seeded(11);
      g.fillStyle = color;
      for (let y = 14; y < 256; y += 16) {
        g.font = (y % 48 === 14 ? 'bold ' : '') + '14px serif';
        for (let x = 4 + ((y * 5) % 12); x < 256; x += 13) if (rnd() < 0.62) g.fillText(SIGIL_SET[Math.floor(rnd() * SIGIL_SET.length)], x, y);
      }
      // dois anéis de sigilo (ombro e antebraço)
      g.strokeStyle = color; g.lineWidth = 2.5;
      for (const y of [40, 170]) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.moveTo(0, y + 6); g.lineTo(256, y + 6); g.stroke(); }
    };
    const map = canvasTex(256, 256, (g) => {
      g.fillStyle = '#a01818'; g.fillRect(0, 0, 256, 256);
      sigils(g, '#e8c060');
    }, { wrap: true });
    const emissiveMap = canvasTex(256, 256, (g) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
      sigils(g, '#ffd27a');
    }, { wrap: true });
    return { map, emissiveMap, emissive: 0xffd27a };
  },

  // ---------------- JOUI: cicatriz em X na bochecha esquerda
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

  // ---------------- AGHATA: olhar provocador, presas
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
      const r = 5 + Math.random() * 8; // sigilos menores e mais finos (a arte)
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
  // camisa de flanela CÁQUI amarrada na cintura (a arte de corpo inteiro): fundo mostarda e o xadrez marrom fino
  plaid: () => canvasTex(128, 128, (g) => {
    g.fillStyle = '#a88e58'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(90,64,32,0.35)';
    for (let i = 0; i < 128; i += 32) { g.fillRect(i, 0, 10, 128); g.fillRect(0, i, 128, 10); }
    g.fillStyle = 'rgba(60,40,20,0.7)';
    for (let i = 14; i < 128; i += 32) { g.fillRect(i, 0, 2, 128); g.fillRect(0, i, 128, 2); }
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

  // o poncho do Gal: pano preto gasto, a trama, as manchas desbotadas, os remendos costurados e a barra mais clara
  poncho_gal: () => canvasTex(512, 512, (g) => {
    const rnd = seeded(55);
    g.fillStyle = '#19171d'; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = 'rgba(255,255,255,0.035)'; g.lineWidth = 1;
    for (let k = 0; k < 512; k += 3) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.stroke();
      g.beginPath(); g.moveTo(0, k); g.lineTo(512, k); g.stroke();
    }
    for (let i = 0; i < 26; i++) { // o desbotado
      g.fillStyle = `rgba(90,86,100,${0.05 + rnd() * 0.07})`;
      g.beginPath(); g.ellipse(rnd() * 512, rnd() * 512, 20 + rnd() * 50, 10 + rnd() * 30, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 6; i++) { // os remendos com a costura em pontos
      const x = rnd() * 440, y = 60 + rnd() * 380, w = 30 + rnd() * 40, h = 24 + rnd() * 34;
      g.fillStyle = 'rgba(8,8,10,0.55)'; g.fillRect(x, y, w, h);
      g.strokeStyle = 'rgba(170,150,110,0.45)'; g.lineWidth = 1.5; g.setLineDash([4, 3]); g.strokeRect(x + 2, y + 2, w - 4, h - 4); g.setLineDash([]);
    }
    const hem = g.createLinearGradient(0, 440, 0, 512);
    hem.addColorStop(0, 'rgba(110,100,90,0)'); hem.addColorStop(1, 'rgba(110,100,90,0.25)');
    g.fillStyle = hem; g.fillRect(0, 440, 512, 72);
  }, { wrap: true }),
  // a calça preta do Gal: pano gasto, joelhos desbotados e a barra puída
  pants_inj: () => canvasTex(256, 512, (g) => {
    const rnd = seeded(37);
    g.fillStyle = '#16151a'; g.fillRect(0, 0, 256, 512);
    g.strokeStyle = 'rgba(255,255,255,0.04)'; g.lineWidth = 1;
    for (let k = -512; k < 512; k += 3) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 512, 512); g.stroke(); }
    const knee = g.createRadialGradient(128, 300, 0, 128, 300, 70);
    knee.addColorStop(0, 'rgba(90,88,100,0.22)'); knee.addColorStop(1, 'rgba(90,88,100,0)');
    g.fillStyle = knee; g.fillRect(0, 220, 256, 160);
    g.strokeStyle = 'rgba(60,58,70,0.6)'; g.lineWidth = 2;
    for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
    for (let i = 0; i < 40; i++) { // a barra puída
      const x = rnd() * 256;
      g.strokeStyle = 'rgba(120,115,125,0.35)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, 490); g.lineTo(x + rnd() * 4 - 2, 512); g.stroke();
    }
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

  // ---------------- KIAN: sigilo na testa (lado direito), linha do olho, 3 riscos pretos
  // A MAGISTRADA: o rosto inteiro é a MÁSCARA DO DESESPERO (wiki) — oval branca encardida, três sulcos escuros em
  // forma de folha descendo dos olhos e da boca até a borda, a fenda de coração invertido no nariz (como uma caveira) e
  // o Símbolo da Relíquia de Conhecimento na testa. Em volta, a pele escura (as laterais e a nuca são cobertas pelas
  // tranças). Inspirada em "O Grito".
  face_magistrada: () => canvasTex(W, HT, (g) => {
    g.fillStyle = '#4a2e22'; g.fillRect(0, 0, W, HT);
    // a máscara
    const my = 132, rx = 74, ry = 104;
    const grd = g.createRadialGradient(CX - 10, my - 30, 10, CX, my, ry);
    grd.addColorStop(0, '#f2efe8'); grd.addColorStop(0.7, '#dedad0'); grd.addColorStop(1, '#a8a296');
    g.fillStyle = grd;
    g.beginPath(); g.ellipse(CX, my, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2a2224'; g.lineWidth = 3; g.stroke();
    // manchas de uso
    g.fillStyle = 'rgba(120,100,90,0.18)';
    for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(CX + (Math.random() - 0.5) * rx * 1.5, my + (Math.random() - 0.5) * ry * 1.5, 2 + Math.random() * 6, 0, Math.PI * 2); g.fill(); }
    // três sulcos: dos dois olhos e da boca até a borda de baixo (folhas escuras com o veio claro no meio)
    const groove = (x0, y0, x1, y1, w) => {
      g.fillStyle = '#231c20';
      g.beginPath(); g.moveTo(x0, y0);
      g.quadraticCurveTo(x0 + w, (y0 + y1) / 2, x1, y1);
      g.quadraticCurveTo(x0 - w, (y0 + y1) / 2, x0, y0);
      g.fill();
      g.strokeStyle = 'rgba(200,190,180,0.5)'; g.lineWidth = 1.4;
      for (let k = 1; k <= 3; k++) {
        const t = k / 4;
        g.beginPath(); g.moveTo(x0 + (x1 - x0) * t - w * 0.5, y0 + (y1 - y0) * t); g.lineTo(x0 + (x1 - x0) * t + w * 0.5, y0 + (y1 - y0) * t - 6); g.stroke();
      }
    };
    groove(CX - 30, EYE_Y - 6, CX - 40, my + ry - 8, 16);
    groove(CX + 30, EYE_Y - 6, CX + 40, my + ry - 8, 16);
    groove(CX, MOUTH_Y - 8, CX, my + ry - 2, 13);
    // olhos: fendas fundas no alto de cada sulco
    g.fillStyle = '#0c0a0c';
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(CX + sx * 30, EYE_Y - 2, 13, 7, sx * -0.25, 0, Math.PI * 2); g.fill(); }
    // nariz: fenda de coração invertido
    g.beginPath(); g.moveTo(CX, NOSE_Y + 10);
    g.bezierCurveTo(CX - 12, NOSE_Y, CX - 10, NOSE_Y - 12, CX - 3, NOSE_Y - 8);
    g.lineTo(CX, NOSE_Y - 4); g.lineTo(CX + 3, NOSE_Y - 8);
    g.bezierCurveTo(CX + 10, NOSE_Y - 12, CX + 12, NOSE_Y, CX, NOSE_Y + 10);
    g.fill();
    // o Símbolo da Relíquia de Conhecimento na testa (círculo, triângulos entrelaçados e o olho no centro)
    const sy = 70, sr = 22;
    g.strokeStyle = '#3a1c22'; g.lineWidth = 2;
    g.beginPath(); g.arc(CX, sy, sr, 0, Math.PI * 2); g.stroke();
    for (const rot of [0, Math.PI]) {
      g.beginPath();
      for (let k = 0; k < 3; k++) { const a = rot + (k / 3) * Math.PI * 2 - Math.PI / 2; g[k ? 'lineTo' : 'moveTo'](CX + Math.cos(a) * sr * 0.95, sy + Math.sin(a) * sr * 0.95); }
      g.closePath(); g.stroke();
    }
    g.beginPath(); g.arc(CX, sy, 5, 0, Math.PI * 2); g.fillStyle = '#3a1c22'; g.fill();
    g.strokeStyle = 'rgba(120,40,50,0.35)'; g.lineWidth = 6;
    g.beginPath(); g.arc(CX, sy, sr + 6, 0, Math.PI * 2); g.stroke(); // a mancha avermelhada em volta do símbolo
  }),
  // O ESTRANGEIRO: a máscara cinza "em forma de cabeça humana" (os olhos verdes e a divisão do meio são malha; aqui só o
  // relevo: maçãs e testa marcadas, arranhões e o cinza frio) — a cabeça inteira é a máscara
  // O DIABO (o de Ordem Paranormal, a miniatura do usuário): pele vermelha, olhos amarelos estreitos e maldosos sob a
  // testa franzida, nariz enrugado e o SORRISO enorme de orelha a orelha cheio de dentes finos e pontudos
  face_o_diabo: () => canvasTex(W, HT, (g) => {
    g.fillStyle = '#a8262a'; g.fillRect(0, 0, W, HT);
    const shade = g.createRadialGradient(CX, 130, 20, CX, 130, 200);
    shade.addColorStop(0, 'rgba(255,120,100,0.18)'); shade.addColorStop(1, 'rgba(40,0,0,0.35)');
    g.fillStyle = shade; g.fillRect(0, 0, W, HT);
    // rugas da testa franzida
    g.strokeStyle = 'rgba(60,6,10,0.7)'; g.lineWidth = 2.4;
    for (const dy of [0, 10, 20]) { g.beginPath(); g.moveTo(CX - 40, 70 + dy); g.quadraticCurveTo(CX, 82 + dy, CX + 40, 70 + dy); g.stroke(); }
    for (const sx of [-1, 1]) {
      // sobrancelha em V (cara de deboche)
      g.lineWidth = 5; g.beginPath(); g.moveTo(CX + sx * 12, EYE_Y - 4); g.lineTo(CX + sx * 56, EYE_Y - 20); g.stroke();
      // olho amarelo estreito com a pupila em fenda
      g.fillStyle = '#ffd23a'; g.beginPath(); g.ellipse(CX + sx * 32, EYE_Y + 4, 16, 6, sx * -0.3, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#1a0a04'; g.fillRect(CX + sx * 32 - 1.5, EYE_Y - 2, 3, 12);
      // maçãs do rosto puxadas pelo sorriso
      g.lineWidth = 2.4; g.beginPath(); g.moveTo(CX + sx * 22, NOSE_Y + 6); g.quadraticCurveTo(CX + sx * 54, NOSE_Y + 2, CX + sx * 74, NOSE_Y + 26); g.stroke();
    }
    // nariz enrugado
    g.beginPath(); g.moveTo(CX - 8, NOSE_Y + 4); g.quadraticCurveTo(CX, NOSE_Y + 10, CX + 8, NOSE_Y + 4); g.stroke();
    // o sorriso: boca larga escura e duas fileiras de dentes finos
    const y0 = MOUTH_Y + 2, wq = 78;
    g.fillStyle = '#2a0406';
    g.beginPath(); g.moveTo(CX - wq, y0 - 10); g.quadraticCurveTo(CX, y0 + 40, CX + wq, y0 - 10); g.quadraticCurveTo(CX, y0 + 14, CX - wq, y0 - 10); g.fill();
    g.fillStyle = '#f2ead8';
    for (let i = -10; i <= 10; i++) {
      const x = CX + i * (wq / 11);
      const top = y0 - 10 + (1 - (i / 11) ** 2) * 12;
      const bot = y0 - 10 + (1 - (i / 11) ** 2) * 36;
      g.beginPath(); g.moveTo(x - 3, top); g.lineTo(x + 3, top); g.lineTo(x, top + 9); g.fill();
      g.beginPath(); g.moveTo(x - 3, bot); g.lineTo(x + 3, bot); g.lineTo(x, bot - 9); g.fill();
    }
  }),
  // MÁSCARAS DA SEITA (as invocações da Magistrada): cada membro tem a sua (wiki "Seita das Máscaras") — o Símbolo da
  // Máscara do Desespero fica do lado de dentro. A do NATHANIEL: branca, o coração dourado invertido no alto, estrelas
  // de quatro pontas em volta dos olhos e lágrimas pretas caindo. As outras: branca riscada de vermelho e a preta.
  ...Object.fromEntries([['nathaniel', '#eeebe4', '#2a2228'], ['riscos', '#e4e0d8', '#2a2228'], ['negra', '#1c1a1e', '#d8d4cc']].map(([k, base, ink]) => [`mask_seita_${k}`, () => canvasTex(W, HT, (g) => {
    g.fillStyle = '#4a2e22'; g.fillRect(0, 0, W, HT); // pele em volta (as laterais ficam sob o capuz/tranças)
    g.fillStyle = base; g.beginPath(); g.ellipse(CX, 130, 76, 106, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#141214'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#0c0a0c';
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(CX + sx * 30, EYE_Y, 12, 7, 0, 0, Math.PI * 2); g.fill(); }
    if (k === 'nathaniel') {
      g.fillStyle = '#d0a040'; // coração dourado invertido
      g.beginPath(); g.moveTo(CX, 46); g.bezierCurveTo(CX - 26, 62, CX - 22, 86, CX - 8, 84); g.lineTo(CX, 78); g.lineTo(CX + 8, 84); g.bezierCurveTo(CX + 22, 86, CX + 26, 62, CX, 46); g.fill();
      g.strokeStyle = ink; g.lineWidth = 2;
      for (const sx of [-1, 1]) {
        const ex = CX + sx * 30;
        g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const r = i % 2 ? 9 : 22; g[i ? 'lineTo' : 'moveTo'](ex + Math.cos(a) * r, EYE_Y + Math.sin(a) * r); } g.closePath(); g.stroke();
        g.fillStyle = ink; g.beginPath(); g.moveTo(ex - 3, EYE_Y + 22); g.quadraticCurveTo(ex, EYE_Y + 48, ex + 3, EYE_Y + 22); g.fill(); // a lágrima preta
      }
    } else {
      g.strokeStyle = k === 'riscos' ? '#a01820' : ink; g.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const x = CX - 50 + i * 25; g.beginPath(); g.moveTo(x, 50 + (i % 2) * 20); g.lineTo(x + 10, 200 - (i % 3) * 20); g.stroke(); }
    }
  })])),
  face_estrangeiro: () => canvasTex(W, HT, (g) => {
    g.fillStyle = '#8a8c88'; g.fillRect(0, 0, W, HT);
    const grd = g.createRadialGradient(CX, 110, 10, CX, 120, 150);
    grd.addColorStop(0, '#b4b6b0'); grd.addColorStop(1, '#6a6c68');
    g.fillStyle = grd; g.fillRect(CX - 160, 0, 320, HT);
    // relevo: sobrancelhas fundas sobre os olhos, maçãs e o queixo
    g.strokeStyle = 'rgba(40,42,40,0.55)'; g.lineWidth = 3;
    for (const sx of [-1, 1]) {
      g.beginPath(); g.moveTo(CX + sx * 18, EYE_Y - 18); g.quadraticCurveTo(CX + sx * 48, EYE_Y - 30, CX + sx * 72, EYE_Y - 8); g.stroke();
      g.beginPath(); g.moveTo(CX + sx * 30, NOSE_Y + 8); g.quadraticCurveTo(CX + sx * 56, NOSE_Y + 4, CX + sx * 70, NOSE_Y - 24); g.stroke();
      g.beginPath(); g.ellipse(CX + sx * 46, EYE_Y, 34, 18, sx * -0.35, 0, Math.PI * 2); g.fillStyle = 'rgba(20,24,20,0.6)'; g.fill(); // órbita escura em volta do olho
    }
    g.beginPath(); g.moveTo(CX - 26, MOUTH_Y + 18); g.quadraticCurveTo(CX, MOUTH_Y + 30, CX + 26, MOUTH_Y + 18); g.stroke();
    // arranhões e manchas
    g.strokeStyle = 'rgba(30,30,30,0.3)'; g.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const x = CX - 140 + Math.random() * 280, y = Math.random() * HT; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 18, y + Math.random() * 12); g.stroke(); }
  }),
  face_desconjurado: () => {
    const map = face((g) => {
      // três riscos escuros na diagonal, do lado esquerdo do rosto (sob o olho, descendo para a bochecha)
      g.strokeStyle = 'rgba(14,8,6,0.85)'; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        g.lineWidth = 6 - i;
        g.beginPath(); g.moveTo(CX + 26 + i * 12, 104 + i * 2); g.quadraticCurveTo(CX + 30 + i * 13, 140, CX + 24 + i * 14, 176 - i * 6); g.stroke();
      }
      paintKianSigils(g, '#f2e2b0');
    }, {
      skin: '#4e3426',
      eye: { iris: '#b8761a', irisLight: '#ffcf5a', tilt: 0.06 },
      brow: { angry: 5, thick: 7, color: '#120c0a' },
      mouth: { mouthW: 16, smile: -1, lipLine: '#1e100c', lip: 'rgba(70,30,24,0.55)' },
      // sem barba (Desconjuração); a barba de Calamidade é malha e cresce na Transformação
    })();
    const emissiveMap = canvasTex(W, HT, (g) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, HT);
      paintKianSigils(g, '#ffd27a');
    }, { wrap: true });
    return { map, emissiveMap, emissive: 0xffd27a };
  },
  // tronco do Kian (miniaturas de Desconjuração/Calamidade): pele escura com o peito e o abdômen marcados, as LINHAS
  // DOURADAS que descem dos lados do pescoço, passam pelos ombros (setas), cruzam o peito em V até o esterno, uma faixa
  // sob o peitoral e a linha que desce pelo abdômen; colunas de escrita escura entre elas. O pescoço é o fim da textura
  // (o tubo do tronco vai do quadril ao pescoço): desenha de cabeça para baixo
  skin_torso_kian: () => {
    // referências "desconjurado" / "desconjurado sério" / miniaturas: duas linhas paralelas de cada lado do pescoço que
    // descem até a clavícula e correm por cima dela até o ombro (seta na ponta); do ombro, a diagonal que cruza o
    // peitoral até o ESTERNO (o V, no meio do peito); a faixa sob o peitoral (setas nas pontas); as diagonais de baixo que
    // fecham o losango no umbigo; a linha do esterno até a cintura. Escrita escura: colunas dos dois lados da linha do
    // meio e fileiras ao longo das clavículas. Coordenadas "em pé": y = 0 no pescoço (≈ 588 px por unidade de altura).
    const paint = (g, glow) => {
      g.fillStyle = glow ? '#000' : '#4e3426'; g.fillRect(0, 0, 512, 512);
      g.save();
      g.translate(0, 512); g.scale(1, -1);
      if (!glow) {
        // volume: peitoral, serrátil e os gomos do abdômen
        g.fillStyle = 'rgba(20,10,6,0.28)';
        for (const s2 of [-1, 1]) { g.beginPath(); g.ellipse(256 + s2 * 58, 192, 56, 26, s2 * 0.18, 0, Math.PI); g.fill(); }
        for (let r = 0; r < 3; r++) for (const s2 of [-1, 1]) g.fillRect(256 + (s2 < 0 ? -50 : 8), 262 + r * 50, 42, 4);
        g.fillStyle = 'rgba(255,220,180,0.05)';
        for (const s2 of [-1, 1]) { g.beginPath(); g.ellipse(256 + s2 * 58, 150, 50, 34, 0, 0, Math.PI * 2); g.fill(); }
        // escrita escura: colunas dos dois lados da linha do meio, nas laterais e nas costas; fileiras nas clavículas
        for (const x of [222, 270]) glyphs(g, x, 160, 22, 300, 'rgba(14,8,4,0.82)', 14, 0.9);
        for (const x of [130, 362]) glyphs(g, x, 250, 24, 200, 'rgba(14,8,4,0.7)', 13, 0.7);
        for (const x of [10, 470]) glyphs(g, x, 60, 30, 400, 'rgba(14,8,4,0.75)', 13, 0.8);
        for (const s2 of [-1, 1]) glyphs(g, s2 < 0 ? 150 : 290, 76, 72, 14, 'rgba(14,8,4,0.8)', 12, 0.9);
      }
      // cada linha: um halo largo e o traço brilhante por cima
      const line = (pts, w = 1) => {
        for (const [lw, st] of glow ? [[14 * w, 'rgba(255,190,90,0.35)'], [6 * w, '#ffd27a']] : [[9 * w, 'rgba(255,214,150,0.35)'], [4 * w, '#fff1c8']]) {
          g.strokeStyle = st; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
          g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
        }
      };
      const arrow = (x, y, dx, dy) => {
        const l = Math.hypot(dx, dy); const ux = dx / l; const uy = dy / l;
        line([[x - ux * 16 - uy * 9, y - uy * 16 + ux * 9], [x, y], [x - ux * 16 + uy * 9, y - uy * 16 - ux * 9]]);
      };
      for (const s2 of [-1, 1]) {
        const X = (dx) => 256 + s2 * dx;
        // pescoço → clavícula → ombro (duas paralelas), seta no ombro
        line([[X(40), 0], [X(44), 42], [X(150), 56]]); arrow(X(150), 56, s2, 0.13);
        line([[X(60), 0], [X(64), 30], [X(118), 38]]);
        // do ombro ao esterno: o V no meio do peito
        line([[X(124), 72], [256, 150]]);
        // diagonais de baixo: das costelas ao umbigo (fecham o losango)
        line([[X(130), 232], [256, 345]], 0.85);
        // costas: o V entre as escápulas e a linha da coluna
        const bx = s2 < 0 ? 0 : 512;
        line([[bx - s2 * 110, 70], [bx, 190]]);
      }
      // faixa sob o peitoral, com setas, e a linha do esterno até a cintura
      line([[118, 230], [394, 230]]); arrow(394, 230, 1, 0); arrow(118, 230, -1, 0);
      line([[256, 150], [256, 480]]);
      line([[0, 190], [0, 470]]); line([[512, 190], [512, 470]]);
      g.restore();
    };
    const map = canvasTex(512, 512, (g) => paint(g, false), { wrap: true });
    const emissiveMap = canvasTex(512, 512, (g) => paint(g, true), { wrap: true });
    return { map, emissiveMap, emissive: 0xffd27a };
  },
  // braços, mãos e pés do Kian: fileiras de escrita que brilha, cobrindo tudo (a referência "desconjurado pose")
  arms_kian: () => {
    const paint = (g, glow) => {
      g.fillStyle = glow ? '#000' : '#3c271b'; g.fillRect(0, 0, 256, 512);
      for (let y = 6; y < 512; y += 24) glyphs(g, 0, y, 256, 17, glow ? 'rgba(255,214,130,0.95)' : 'rgba(255,244,214,0.95)', 16, 0.5);
      // anéis dourados contínuos em volta do braço, de tempos em tempos (como nas artes)
      g.strokeStyle = glow ? '#ffd27a' : '#fff1c8'; g.lineWidth = glow ? 4 : 3;
      for (const y of [120, 300]) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    };
    const map = canvasTex(256, 512, (g) => paint(g, false), { wrap: true });
    const emissiveMap = canvasTex(256, 512, (g) => paint(g, true), { wrap: true });
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

  // ---------------- DANTE (Calamidade): de OLHOS FECHADOS, pele pálida, sem as tatuagens à mostra, a cicatriz na têmpora
  // direita (x < 256) e o sigilo do infinito na testa. OLHOS ABERTOS (a Transformação, dante_aberto): os olhos ficam
  // COMPLETAMENTE PRETOS, surgem as duas FAIXAS (uma passando pelo olho direito, da testa à bochecha, e outra na
  // horizontal pelos lábios) e as tatuagens de pintas e espirais voltam (pescoço e braços) — "como um Luzidio"
  face_dante: danteFace(false),
  face_dante_open: danteFace(true),

  // ---------------- NUBI (Escriptas): pele escura, olhos pretos, uma FAIXA PRETA descendo de cada olho até o queixo,
  // "MORTE" escrito na testa e as tatuagens dos Escriptas subindo pelo pescoço (wiki "Nubi" + a arte de referência)
  face_nubi: nubiFace(false),
  face_nubi_open: nubiFace(true),
  // pele dos braços, mãos, pernas e pés: escura, com fileiras de escrita dos Escriptas em tinta preta
  skin_nubi: () => canvasTex(256, 512, (g) => {
    g.fillStyle = '#5a3828'; g.fillRect(0, 0, 256, 512);
    for (let y = 8; y < 512; y += 26) glyphs(g, 0, y, 256, 16, 'rgba(16,8,6,0.82)', 13, 0.55);
    g.strokeStyle = 'rgba(16,8,6,0.7)'; g.lineWidth = 2;
    for (const y of [150, 330]) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  }, { wrap: true }),
  // tronco: o mesmo, com uma coluna de escrita descendo pelo meio da barriga e linhas finas nos lados
  skin_torso_nubi: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#5a3828'; g.fillRect(0, 0, 512, 512);
    for (let y = 10; y < 512; y += 30) glyphs(g, 0, y, 512, 18, 'rgba(16,8,6,0.7)', 12, 0.42);
    g.fillStyle = 'rgba(12,6,4,0.9)';
    for (let y = 40; y < 470; y += 16) glyphs(g, 236, y, 40, 14, 'rgba(12,6,4,0.95)', 13, 0.95);
  }, { wrap: true }),
  // manto preto: dobras verticais (faixas um pouco mais claras e mais escuras) e a barra gasta
  cloak_nubi: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#141114'; g.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x += 32) {
      const grd = g.createLinearGradient(x, 0, x + 32, 0);
      grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.5, 'rgba(255,255,255,0.05)'); grd.addColorStop(1, 'rgba(0,0,0,0.12)');
      g.fillStyle = grd; g.fillRect(x, 0, 32, 512);
    }
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1;
    for (let i = 0; i < 60; i++) { const x = Math.random() * 512, y = 420 + Math.random() * 92; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 8, y + 10); g.stroke(); }
  }, { wrap: true }),
  // tranças pretas puxadas para trás: listras finas com brilho azulado
  hair_nubi: () => canvasTex(256, 256, (g) => {
    g.fillStyle = '#0e0a0c'; g.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 12) {
      g.fillStyle = 'rgba(90,90,110,0.18)'; g.fillRect(x + 3, 0, 3, 256);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + 9, 0, 2, 256);
    }
  }, { wrap: true }),
  skin_dante: () => canvasTex(512, 512, (g) => {
    g.fillStyle = '#e2c8bc';
    g.fillRect(0, 0, 512, 512);
    // pele pálida com um leve manchado (sem as tatuagens: elas só aparecem de olhos abertos)
    const rnd = seeded(1265);
    for (let i = 0; i < 260; i++) {
      const x = rnd() * 512, y = rnd() * 512, r = 6 + rnd() * 18;
      const gr = g.createRadialGradient(x, y, 1, x, y, r);
      gr.addColorStop(0, 'rgba(200,150,140,0.10)'); gr.addColorStop(1, 'rgba(200,150,140,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }, { wrap: true }),
  skin_dante_open: () => canvasTex(512, 512, (g) => danteTattoos(g), { wrap: true }),
  // o xale BRANCO: tecido grosso com as dobras sombreadas em azul-acinzentado (como no traço da miniatura)
  shawl_dante: () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#eeede8';
    g.fillRect(0, 0, w, h);
    const rnd = seeded(77);
    for (let i = 0; i < 46; i++) {
      const x = rnd() * w, y0 = rnd() * h * 0.3, len = 120 + rnd() * 320, wd = 6 + rnd() * 18;
      const gr = g.createLinearGradient(x - wd, 0, x + wd, 0);
      gr.addColorStop(0, 'rgba(150,158,172,0)'); gr.addColorStop(0.5, `rgba(150,158,172,${0.18 + rnd() * 0.22})`); gr.addColorStop(1, 'rgba(150,158,172,0)');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(x - wd, y0); g.quadraticCurveTo(x + (rnd() - 0.5) * 40, y0 + len / 2, x - wd * 0.3, y0 + len); g.lineTo(x + wd * 0.3, y0 + len); g.quadraticCurveTo(x + (rnd() - 0.5) * 40 + wd, y0 + len / 2, x + wd, y0); g.fill();
    }
    g.strokeStyle = 'rgba(70,76,90,0.35)'; g.lineWidth = 1.4; // traços de dobra (o nanquim da HQ)
    for (let i = 0; i < 40; i++) {
      const x = rnd() * w, y = rnd() * h;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (rnd() - 0.5) * 20, y + 30, x + (rnd() - 0.5) * 16, y + 50 + rnd() * 60); g.stroke();
    }
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(120,120,110,${rnd() * 0.06})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); } // trama do tecido
  }, { wrap: true }),
  // as faixas dos pés: pano cru encardido, com as voltas marcadas
  wraps_dante: () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#cfc8b8';
    g.fillRect(0, 0, w, h);
    const rnd = seeded(31);
    g.strokeStyle = 'rgba(110,98,80,0.45)'; g.lineWidth = 2;
    for (let y = 8; y < h; y += 16 + rnd() * 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (rnd() - 0.5) * 6); g.stroke(); }
    for (let i = 0; i < 30; i++) {
      const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 20;
      const gr = g.createRadialGradient(x, y, 1, x, y, r);
      gr.addColorStop(0, 'rgba(110,90,70,0.28)'); gr.addColorStop(1, 'rgba(110,90,70,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }, { wrap: true }),

  // ---------------- CRISTINO (Transtornados, Hexatombe): 45 anos, pele curtida de sol, barba por fazer, o olho DIREITO
  // cego (leitoso, atravessado por uma cicatriz de combate) e outras cicatrizes; bigode grosso (volume no modelo)
  face_cristino: face((g) => {
    stubble(g, 'rgba(48,30,18,0.5)', 1700, { y0: 140, y1: 228, w: 84 });
    // o olho direito CEGO: a íris some num branco leitoso (pintado por cima do olho normal)
    const blind = g.createRadialGradient(CX - 32, EYE_Y - 1, 1, CX - 32, EYE_Y - 1, 7);
    blind.addColorStop(0, '#e4ded4'); blind.addColorStop(1, '#bdb4a8');
    g.fillStyle = blind;
    g.beginPath(); g.arc(CX - 32, EYE_Y - 1, 6.4, 0, Math.PI * 2); g.fill();
    // a cicatriz que cega o olho direito (x < 256): da testa até a maçã do rosto
    g.strokeStyle = 'rgba(120,58,44,0.9)'; g.lineWidth = 3.2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX - 40, EYE_Y - 34); g.lineTo(CX - 30, EYE_Y - 4); g.lineTo(CX - 26, EYE_Y + 30); g.stroke();
    g.strokeStyle = 'rgba(230,180,160,0.5)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(CX - 39, EYE_Y - 33); g.lineTo(CX - 29, EYE_Y - 4); g.lineTo(CX - 25, EYE_Y + 29); g.stroke();
    // cicatrizes menores: a bochecha esquerda e o queixo
    g.strokeStyle = 'rgba(120,64,48,0.7)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(CX + 44, NOSE_Y - 4); g.lineTo(CX + 60, NOSE_Y + 10); g.stroke();
    g.beginPath(); g.moveTo(CX + 8, MOUTH_Y + 30); g.lineTo(CX + 18, MOUTH_Y + 40); g.stroke();
    // rugas de quem vive no sol
    g.strokeStyle = 'rgba(90,50,32,0.4)'; g.lineWidth = 1.3;
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(CX + s * 56, EYE_Y - 2 + k * 5); g.lineTo(CX + s * 68, EYE_Y - 6 + k * 8); g.stroke(); }
    g.beginPath(); g.moveTo(CX - 22, EYE_Y - 36); g.lineTo(CX + 22, EYE_Y - 36); g.stroke();
  }, {
    skin: '#b88262',
    eye: { iris: '#3a2616', irisLight: '#6a4a2a', tilt: -0.05, h: 6.5, lid: 4 },
    brow: { angry: 2, thick: 7, color: '#2e1e14' },
    mouth: { mouthW: 18, lip: 'rgba(110,60,44,0.7)' },
  }),
  // camisa social azul-esverdeada, amassada e suja de sangue
  shirt_cristino: () => canvasTex(512, 256, (g, w, h) => {
    const rnd = leather(g, w, h, '#3f8a86', 23, { dark: '14,40,40', light: '140,200,190', marks: 40 });
    g.strokeStyle = 'rgba(14,40,40,0.35)'; g.lineWidth = 2;
    for (let i = 0; i < 24; i++) { const x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y + 6, x + 22, y + 3); g.stroke(); }
  }, { wrap: true }),
  // a jaqueta de couro marrom-avermelhada: costuras grossas e o grande SÍMBOLO DE SANGUE costurado nas costas (u = 0,5;
  // no UV da jaqueta a barra fica no alto do canvas, então o símbolo vai de cabeça para baixo, na parte de baixo)
  jacket_cristino: () => canvasTex(512, 512, (g, w, h) => {
    leather(g, w, h, '#8a4a2c', 31, { marks: 24 });
    g.strokeStyle = 'rgba(40,16,8,0.6)'; g.lineWidth = 2; g.setLineDash([7, 5]);
    for (const x of [96, 416]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } // costuras dos lados
    g.beginPath(); g.moveTo(0, 30); g.lineTo(w, 30); g.stroke();
    g.setLineDash([]);
    bloodSymbol(g, 256, 360, 210, '#3a160c', { down: true, stitch: 'rgba(220,190,150,0.55)' });
  }, { wrap: true }),
  // acabamento branco das bordas: ziguezague marrom (os "dentes" da arte)
  trim_cristino: () => canvasTex(64, 256, (g, w, h) => {
    g.fillStyle = '#e8e0d0'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6a3a20';
    for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 16); g.lineTo(0, y + 32); g.closePath(); g.fill(); }
  }, { wrap: true, repeat: [1, 4] }),
  // calça de couro: costuras em X subindo as laterais
  pants_cristino: () => canvasTex(256, 256, (g, w, h) => {
    leather(g, w, h, '#7a4630', 47);
    g.strokeStyle = 'rgba(232,214,180,0.75)'; g.lineWidth = 1.6;
    for (const x0 of [64, 192]) {
      for (let y = 8; y < h; y += 18) { g.beginPath(); g.moveTo(x0 - 6, y); g.lineTo(x0 + 6, y + 12); g.moveTo(x0 + 6, y); g.lineTo(x0 - 6, y + 12); g.stroke(); }
    }
  }, { wrap: true }),
  // faixas das canelas: pano cru com as manchas de sangue
  bandage_cristino: () => canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#d8ccbc'; g.fillRect(0, 0, w, h);
    let s = 9;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    g.strokeStyle = 'rgba(120,100,80,0.35)'; g.lineWidth = 1;
    for (let y = 4; y < h; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + rnd() * 2); g.stroke(); }
    for (let i = 0; i < 16; i++) {
      g.fillStyle = `rgba(${120 + rnd() * 40 | 0},10,12,${0.45 + rnd() * 0.4})`;
      g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 3 + rnd() * 14, 2 + rnd() * 8, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
  }, { wrap: true }),
  // o couro do chapéu: claro, gasto, com a costura da aba
  hat_cristino: () => canvasTex(256, 256, (g, w, h) => {
    leather(g, w, h, '#9a5a34', 59, { marks: 40 });
    g.strokeStyle = 'rgba(232,210,170,0.6)'; g.lineWidth = 1.4; g.setLineDash([5, 4]);
    g.beginPath(); g.moveTo(0, 40); g.lineTo(w, 40); g.stroke();
    g.setLineDash([]);
  }, { wrap: true }),

  // ---------------- CRISTOPHER "CRIS" COHEN (Ordo Realitas, OSNF): 59 anos, olhos azuis, rugas, barba por fazer grisalha e
  // a grande QUEIMADURA no lado ESQUERDO do rosto (x > 256): faixas vermelho-arroxeadas repuxadas, da testa ao queixo
  face_cristopher: face((g) => {
    stubble(g, 'rgba(150,140,130,0.55)', 1800, { y0: 140, y1: 228, w: 86 });
    // a queimadura (Desconjuração / OSNF): só o lado ESQUERDO — da testa, pelo olho e a bochecha, até o maxilar e a
    // orelha; não passa do nariz nem pega a boca. Base vermelho-arroxeada e as faixas de pele repuxada, irregulares
    g.save();
    g.beginPath();
    g.moveTo(CX + 18, 40); g.quadraticCurveTo(CX + 50, 26, CX + 104, 44); g.lineTo(CX + 130, 150); g.quadraticCurveTo(CX + 118, 224, CX + 66, 238);
    g.quadraticCurveTo(CX + 44, 206, CX + 40, 176); g.quadraticCurveTo(CX + 24, 150, CX + 22, 120); g.quadraticCurveTo(CX + 14, 80, CX + 18, 40); g.closePath();
    g.clip();
    g.fillStyle = '#6e2c38'; g.fillRect(0, 0, W, HT);
    let sd = 5;
    const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (let i = 0; i < 30; i++) {
      const y = 28 + i * 7.5 + rnd() * 4;
      g.strokeStyle = i % 2 ? `rgba(70,18,32,${0.5 + rnd() * 0.3})` : `rgba(150,74,80,${0.45 + rnd() * 0.3})`; g.lineWidth = 2 + rnd() * 3;
      g.beginPath(); g.moveTo(CX + 10, y + 12); g.bezierCurveTo(CX + 44, y - 8 + rnd() * 10, CX + 84, y + 16 - rnd() * 10, CX + 140, y - 6); g.stroke();
    }
    g.restore();
    // o olho esquerdo continua lá dentro da cicatriz (um pouco caído): o branco, a íris azul e a pálpebra repuxada
    g.fillStyle = '#e8ddd4';
    g.beginPath(); g.ellipse(CX + 32, EYE_Y + 1, 13, 6, 0.12, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3a6aa8'; g.beginPath(); g.arc(CX + 31, EYE_Y + 1, 5.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0a0608'; g.beginPath(); g.arc(CX + 31, EYE_Y + 1, 2.4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(40,10,18,0.9)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(CX + 18, EYE_Y - 1); g.quadraticCurveTo(CX + 32, EYE_Y - 9, CX + 46, EYE_Y + 2); g.stroke();
    g.strokeStyle = 'rgba(96,36,44,0.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(CX + 18, 40); g.quadraticCurveTo(CX + 14, 80, CX + 22, 120); g.quadraticCurveTo(CX + 24, 150, CX + 40, 176); g.quadraticCurveTo(CX + 44, 206, CX + 66, 238); g.stroke();
    // rugas da idade
    g.strokeStyle = 'rgba(110,60,40,0.4)'; g.lineWidth = 1.4;
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(CX - 26, EYE_Y - 38 + k * 6); g.lineTo(CX + 4, EYE_Y - 40 + k * 6); g.stroke(); }
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(CX - 54, EYE_Y - 3 + k * 5); g.lineTo(CX - 68, EYE_Y - 6 + k * 7); g.stroke(); }
    g.beginPath(); g.moveTo(CX - 26, 150); g.quadraticCurveTo(CX - 36, 168, CX - 30, 184); g.stroke();
  }, {
    skin: '#d8a080',
    eye: { iris: '#3a6aa8', irisLight: '#8ab8e8', tilt: -0.02, h: 6.5, lid: 4 },
    brow: { angry: 0, thick: 6, color: '#a8a49c' },
    mouth: { mouthW: 21, smile: 4, lip: 'rgba(150,80,70,0.5)' },
  }),
  // o tronco: pele (aparece no decote e nas cavas) e as ESCAMAS tatuadas nas costas (u perto de 0/1 = costas, em cima)
  skin_torso_cristopher: () => canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#d8a080'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(30,36,40,0.85)'; g.lineWidth = 2.2;
    for (const [x0, x1] of [[0, 120], [392, 512]]) {
      for (let y = 6; y < 120; y += 13) {
        for (let x = x0 + ((y / 13) % 2) * 9; x < x1; x += 18) {
          g.beginPath(); g.arc(x, y, 9, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke(); // uma escama (meia-lua)
        }
      }
    }
    g.fillStyle = 'rgba(60,30,24,0.25)';
    for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 0, Math.PI * 2); g.fill(); } // pintas e poeira
  }, { wrap: true }),
  // os braços: TATUAGENS TRIBAIS em faixas pontudas no alto do braço e no antebraço
  arms_cristopher: () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#d8a080'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(22,24,28,0.88)';
    const band = (y0, hgt) => {
      for (let x = 0; x < w; x += 32) {
        g.beginPath();
        g.moveTo(x, y0 + hgt * 0.5);
        g.quadraticCurveTo(x + 10, y0 - hgt * 0.4, x + 30, y0);
        g.quadraticCurveTo(x + 18, y0 + hgt * 0.4, x + 34, y0 + hgt);
        g.quadraticCurveTo(x + 12, y0 + hgt * 0.8, x, y0 + hgt * 0.5);
        g.fill();
      }
    };
    band(30, 34); // o alto do braço
    band(92, 22);
    band(160, 26); // o antebraço
    g.strokeStyle = 'rgba(120,70,50,0.35)'; g.lineWidth = 1.2; // veias
    for (let i = 0; i < 6; i++) { const x = 100 + i * 10; g.beginPath(); g.moveTo(x, 150); g.bezierCurveTo(x + 6, 180, x - 6, 210, x + 4, 250); g.stroke(); }
  }, { wrap: true }),
  // a REGATA branca: canelada, encardida, com manchas de sangue e de terra da floresta
  tank_cristopher: () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#ebe6dc'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 4) { g.fillStyle = 'rgba(160,150,135,0.25)'; g.fillRect(x, 0, 1.5, h); }
    let s = 17;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 14; i++) {
      g.fillStyle = rnd() < 0.4 ? `rgba(140,20,24,${0.3 + rnd() * 0.3})` : `rgba(110,90,60,${0.15 + rnd() * 0.2})`;
      g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 4 + rnd() * 16, 3 + rnd() * 10, rnd() * 3, 0, Math.PI * 2); g.fill();
    }
  }, { wrap: true }),

  // ---------------------------------------------------------------- RAZIEL (Vampiros, Hexatombe)
  // o rosto DESCARNADO: carne rosada com as fibras e as cicatrizes, sem olhos nem nariz (só as covas fundas), e o
  // ESTIGMA da Coroa de Espinhos cortado na testa, brilhando vermelho (cinemática "O Verdadeiro Raziel"). A boca de fera
  // (gengiva e dentes) é esculpida no modelo.
  // CELESTINE (Ordo Calamitas): pele clara, os olhos azul-claros (na memória revivida eles BRILHAM nessa cor), as
  // sobrancelhas loiras e o meio-sorriso debochado de quem desafia até o imperador
  face_celestine: face((g) => {
    g.strokeStyle = 'rgba(150,90,80,0.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(CX - 14, MOUTH_Y + 1); g.quadraticCurveTo(CX + 2, MOUTH_Y + 4, CX + 16, MOUTH_Y - 3); g.stroke(); // o meio-sorriso torto
    for (const s of [-1, 1]) { // o brilho azul em volta da íris
      const gr = g.createRadialGradient(CX + s * 32, EYE_Y + 4, 2, CX + s * 32, EYE_Y + 4, 16);
      gr.addColorStop(0, 'rgba(120,220,255,0.35)'); gr.addColorStop(1, 'rgba(120,220,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(CX + s * 32, EYE_Y + 4, 16, 0, Math.PI * 2); g.fill();
    }
  }, {
    skin: '#e8c8b0',
    eye: { iris: '#4ab0e0', irisLight: '#c8f4ff', tilt: 0.04, lashes: true },
    brow: { angry: 2, thick: 3, color: '#c8b890' },
    mouth: { mouthW: 15, lip: 'rgba(170,100,96,0.5)' },
  }),
  // a camisa preta com o SÍMBOLO DA ORDO CALAMITAS no peito (o círculo branco ornamentado da arte; frente = metade de
  // baixo da textura, como nas outras camisas do corpo base)
  shirt_celestine: () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#1a191e'; g.fillRect(0, 0, w, h);
    const rnd = seeded(67);
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '60,58,66'},${0.1 + rnd() * 0.15})`; g.fillRect(rnd() * w, 0, 3 + rnd() * 10, h); }
    const cx = 256;
    const cy = 372;
    g.strokeStyle = '#e8e4dc'; g.fillStyle = '#e8e4dc'; g.lineCap = 'round';
    g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 52, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 40, 0, Math.PI * 2); g.stroke();
    // os ornamentos em volta (os "raios" curvos do emblema)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52);
      g.quadraticCurveTo(cx + Math.cos(a + 0.18) * 66, cy + Math.sin(a + 0.18) * 66, cx + Math.cos(a + 0.05) * 74, cy + Math.sin(a + 0.05) * 74); g.stroke();
    }
    // o centro: o gládio cruzado com a lança e o olho
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(cx - 24, cy + 24); g.lineTo(cx + 24, cy - 24); g.stroke();
    g.beginPath(); g.moveTo(cx + 24, cy + 24); g.lineTo(cx - 24, cy - 24); g.stroke();
    g.beginPath(); g.ellipse(cx, cy, 13, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1a191e'; g.beginPath(); g.arc(cx, cy, 4, 0, Math.PI * 2); g.fill();
  }, { wrap: true }),
  face_raziel: () => canvasTex(W, HT, (g) => {
    g.fillStyle = '#c4847c'; g.fillRect(0, 0, W, HT);
    const rnd = seeded(390);
    // as fibras e manchas de carne viva
    for (let i = 0; i < 260; i++) {
      g.strokeStyle = rnd() < 0.5 ? `rgba(120,30,34,${0.12 + rnd() * 0.2})` : `rgba(240,190,180,${0.1 + rnd() * 0.15})`;
      g.lineWidth = 0.8 + rnd() * 1.6;
      const x = rnd() * W, y = rnd() * HT;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (rnd() - 0.5) * 20, y + 10, x + (rnd() - 0.5) * 12, y + 24 + rnd() * 20); g.stroke();
    }
    // as cicatrizes do crânio (riscos escuros)
    g.strokeStyle = 'rgba(70,10,14,0.65)'; g.lineWidth = 2.4; g.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const x = rnd() * W, y = rnd() * 90; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 50, y + 10 + rnd() * 30); g.stroke(); }
    // onde seriam os olhos: covas fundas e escuras, cobertas de cicatriz
    for (const sx of [-1, 1]) {
      const gr = g.createRadialGradient(CX + sx * 32, EYE_Y + 4, 2, CX + sx * 32, EYE_Y + 4, 22);
      gr.addColorStop(0, 'rgba(60,8,12,0.85)'); gr.addColorStop(1, 'rgba(60,8,12,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(CX + sx * 32, EYE_Y + 4, 24, 14, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(90,16,20,0.7)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(CX + sx * 16, EYE_Y + 2); g.lineTo(CX + sx * 48, EYE_Y + 8); g.stroke();
    }
    // sem nariz: as duas fendas
    g.fillStyle = 'rgba(50,6,10,0.85)';
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(CX + sx * 6, NOSE_Y, 3, 7, sx * 0.3, 0, Math.PI * 2); g.fill(); }
    // o ESTIGMA da Coroa de Espinhos: o traço curvo de espinhos cortado na testa, vermelho e aceso
    g.strokeStyle = '#ff2a30'; g.lineWidth = 5; g.shadowColor = '#ff1020'; g.shadowBlur = 10;
    g.beginPath(); g.moveTo(CX - 46, EYE_Y - 30); g.quadraticCurveTo(CX - 10, EYE_Y - 74, CX + 30, EYE_Y - 40); g.quadraticCurveTo(CX + 50, EYE_Y - 22, CX + 36, EYE_Y - 8); g.stroke();
    g.beginPath(); g.moveTo(CX + 2, EYE_Y - 56); g.lineTo(CX - 4, EYE_Y - 12); g.stroke();
    for (const [x, y, a] of [[-36, -40, -0.8], [-18, -56, -1.2], [14, -54, -2.0], [32, -38, -2.6], [-2, -32, -1.6], [40, -18, 0.6]]) {
      g.beginPath(); g.moveTo(CX + x, EYE_Y + y); g.lineTo(CX + x + Math.cos(a) * 14, EYE_Y + y + Math.sin(a) * 14); g.stroke();
    }
    g.shadowBlur = 0;
    // sangue escorrendo do estigma
    g.fillStyle = 'rgba(140,10,18,0.6)';
    for (const x of [-30, 6, 34]) g.fillRect(CX + x, EYE_Y - 10, 3, 30 + rnd() * 20);
  }),
  // o tronco DESCARNADO (aparece na Verdadeira Forma): músculos à mostra, cortes fundos e sangue seco
  skin_raziel_torso: () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#9a4844'; g.fillRect(0, 0, w, h); // carne viva (mais escura que o rosto)
    const rnd = seeded(905);
    for (let i = 0; i < 520; i++) {
      g.strokeStyle = rnd() < 0.55 ? `rgba(120,24,30,${0.15 + rnd() * 0.25})` : `rgba(235,180,170,${0.12 + rnd() * 0.15})`;
      g.lineWidth = 1 + rnd() * 2.2;
      const x = rnd() * w, y = rnd() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 14, y + 18 + rnd() * 30); g.stroke();
    }
    for (let i = 0; i < 12; i++) { // os cortes fundos
      g.strokeStyle = 'rgba(80,6,12,0.85)'; g.lineWidth = 3 + rnd() * 4;
      const x = rnd() * w, y = rnd() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 80, y + (rnd() - 0.5) * 60); g.stroke();
    }
    for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(110,10,16,${0.2 + rnd() * 0.3})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 8 + rnd() * 30, 6 + rnd() * 20, rnd() * 3, 0, Math.PI * 2); g.fill(); }
  }, { wrap: true }),
  // o CASACÃO: preto-avermelhado, mais vermelho embaixo, gasto nas bordas e MANCHADO de sangue
  coat_raziel: () => canvasTex(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#2a1014'); gr.addColorStop(1, '#4a1218');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const rnd = seeded(77);
    for (let x = 0; x < w; x += 6) { g.fillStyle = `rgba(0,0,0,${0.08 + rnd() * 0.1})`; g.fillRect(x, 0, 2, h); }
    for (let i = 0; i < 26; i++) { // as manchas e escorridos de sangue
      g.fillStyle = `rgba(${120 + rnd() * 60 | 0},10,18,${0.25 + rnd() * 0.35})`;
      const x = rnd() * w, y = rnd() * h;
      g.beginPath(); g.ellipse(x, y, 10 + rnd() * 34, 6 + rnd() * 20, rnd() * 3, 0, Math.PI * 2); g.fill();
      g.fillRect(x - 2, y, 4, 20 + rnd() * 60);
    }
  }, { wrap: true }),
  pants_raziel: () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#1c181c'; g.fillRect(0, 0, w, h);
    const rnd = seeded(13);
    for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(110,10,16,${0.25 + rnd() * 0.3})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 6 + rnd() * 18, 4 + rnd() * 12, rnd() * 3, 0, Math.PI * 2); g.fill(); }
  }, { wrap: true }),
};

function paintKianSigils(g, color) {
  // referências "desconjurado" / "desconjurado sério": o sigilo anguloso no alto da testa (lado direito dele = x < 256)
  // e o traço luminoso que desce do olho direito pela bochecha, com um gancho no fim
  g.strokeStyle = color;
  g.lineWidth = 3.4;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const x = CX - 36, y = 80;
  g.beginPath();
  g.moveTo(x - 11, y - 7); g.lineTo(x + 4, y - 11); g.lineTo(x + 11, y + 1); g.lineTo(x, y + 10); g.lineTo(x - 12, y + 2); g.closePath();
  g.moveTo(x + 4, y - 11); g.lineTo(x + 9, y - 18);
  g.moveTo(x + 11, y + 1); g.lineTo(x + 18, y - 3);
  g.moveTo(x - 4, y - 2); g.lineTo(x + 3, y + 3);
  g.stroke();
  g.beginPath(); g.moveTo(CX - 31, EYE_Y + 9); g.quadraticCurveTo(CX - 34, 145, CX - 36, 168); g.lineTo(CX - 45, 174); g.stroke();
}
