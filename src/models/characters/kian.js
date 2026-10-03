import * as THREE from 'three';
import { buildHumanoid, part, faceTexture, paintEyes, paintMouth, glowMat } from '../rig.js';
import { wraps } from '../weapons.js';

// Kian — modelo provisório. Sem camisa, corpo coberto por sigilos
// brancos, black power, barba, olhos âmbar e faixas nas mãos/antebraços.
// NÃO possui nenhuma arma: o modelo não cria nenhum prop de arma.
function sigilTexture(base, { lines = true, script = true } = {}) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  if (script) {
    g.fillStyle = 'rgba(235,235,225,0.85)';
    g.font = '11px serif';
    const glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
    for (let y = 10; y < 256; y += 13) {
      for (let x = 0; x < 256; x += 9) {
        if (Math.random() > 0.35) g.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], x, y);
      }
    }
  }
  if (lines) {
    g.strokeStyle = 'rgba(255,255,250,0.95)';
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(40, 0); g.lineTo(128, 120); g.lineTo(216, 0); g.stroke();
    g.beginPath(); g.moveTo(128, 120); g.lineTo(128, 256); g.stroke();
    g.beginPath(); g.moveTo(70, 140); g.lineTo(190, 110); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildKian() {
  const skin = 0x5e4234;
  const face = faceTexture((g) => {
    g.fillStyle = '#5e4234';
    g.fillRect(0, 0, 256, 128);
    paintEyes(g, { color: '#2a1a0a', iris: '#d89a2a', browTilt: 2, brow: '#1a120e' });
    // sigilos no rosto
    g.strokeStyle = '#f2f0e8'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(44, 30); g.lineTo(54, 40); g.lineTo(44, 48); g.moveTo(50, 36); g.lineTo(58, 30); g.stroke();
    g.beginPath(); g.moveTo(52, 70); g.lineTo(52, 84); g.moveTo(46, 76); g.lineTo(58, 76); g.stroke();
    // barba
    g.fillStyle = '#1e1612';
    g.beginPath(); g.moveTo(34, 76); g.quadraticCurveTo(64, 70, 94, 76); g.quadraticCurveTo(90, 122, 64, 124); g.quadraticCurveTo(38, 122, 34, 76); g.fill();
    paintMouth(g, { y: 92, w: 8, color: '#7a4a40' });
  });
  const rig = buildHumanoid({
    skin, faceTex: face,
    torsoTex: sigilTexture('#5e4234'), armTex: sigilTexture('#5e4234', { lines: false }), armTexUpper: true,
    torso: skin, sleeveL: skin, sleeveR: skin, forearmL: 0xd2ccbe, forearmR: 0xd2ccbe, handL: 0x2e2420, handR: 0x2e2420,
    pants: 0x45454a, shoes: skin, bulk: 1.18, width: 1.06, height: 1.03,
  });
  const { joints } = rig;

  // faixas nos antebraços e mãos, com pontas soltas
  for (const e of [joints.eL, joints.eR]) {
    const w = wraps(0.3, 0.056, 0xd2ccbe, true);
    e.add(w);
  }
  // cós da calça
  const waist = part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 14), 0x2a2a2e);
  waist.scale.z = 0.75;
  waist.position.y = 0.1;
  joints.hips.add(waist);

  // black power e barba
  const afro = part(new THREE.SphereGeometry(0.22, 16, 12), 0x141010);
  afro.position.set(0, 0.25, -0.03);
  afro.scale.set(1, 0.9, 1);
  joints.hd.add(afro);
  const beard = part(new THREE.SphereGeometry(0.11, 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), 0x1e1612);
  beard.scale.set(1.15, 0.9, 0.72);
  beard.position.set(0, 0.07, 0.07);
  joints.hd.add(beard);

  // marcadores de energia nos punhos (usados pelos efeitos da Carga de Poder)
  rig.fistL = rig.sockets.handL;
  rig.fistR = rig.sockets.handR;

  // Lâmina do Medo: manifestação TRANSLÚCIDA de energia envolvendo a mão.
  // Não é uma arma física: só aparece durante a habilidade e some em seguida.
  const blade = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-0.07, 0);
  shape.quadraticCurveTo(-0.05, -0.5, 0.02, -0.95);
  shape.quadraticCurveTo(0.09, -0.45, 0.07, 0);
  shape.lineTo(-0.07, 0);
  const geo = new THREE.ShapeGeometry(shape);
  const core = new THREE.Mesh(geo, glowMat(0xffffff, 0.75));
  core.material.side = THREE.DoubleSide;
  core.rotation.y = Math.PI / 2;
  blade.add(core);
  const haze = new THREE.Mesh(geo, glowMat(0x8a7aff, 0.45));
  haze.material.side = THREE.DoubleSide;
  haze.scale.set(1.8, 1.15, 1.8);
  haze.rotation.y = Math.PI / 2;
  blade.add(haze);
  const fist = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), glowMat(0xb8aaff, 0.4));
  blade.add(fist);
  blade.rotation.x = -0.35;
  blade.visible = false;
  rig.sockets.handR.add(blade);
  rig.props.fearBlade = blade;

  return rig.finish();
}
