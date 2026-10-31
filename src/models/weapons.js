import * as THREE from 'three';
import { part, toon, glowMat } from './rig.js';
import { buildNpcModel } from './npcRig.js';

// Armas PROVISÓRIAS. Convenção: empunhadura na origem, lâmina/cano apontando
// para -Y local (continuação do braço) e "topo" da arma em +Z local.

function bladeShape(len, width, curve, tipBack = 0.3) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.quadraticCurveTo(-width / 2 + curve, -len * 0.55, curve * 1.6, -len);
  s.quadraticCurveTo(width / 2 + curve * (1 - tipBack), -len * 0.5, width / 2, 0);
  s.lineTo(-width / 2, 0);
  return s;
}

function extrude(shape, depth = 0.012) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 12 });
  g.translate(0, 0, -depth / 2);
  return g;
}

// Perfil de uma lâmina CURVA de katana no plano XY (empunhadura em y=0, ponta em y=-len, curvatura para +X).
// side: 'ji' = corpo (do dorso até a linha do hamon), 'ha' = fio (do hamon até o gume), 'all' = inteira.
function katanaShape(len, width, sori, side = 'all') {
  const N = 28;
  const spine = (t) => sori * t * t; // dorso (mune)
  const w = (t) => width * (1 - 0.22 * t); // estreita um pouco até a ponta
  const kis = 0.9; // começo do kissaki
  const edgeAt = (t) => {
    if (t <= kis) return spine(t) - w(t);
    const u = (t - kis) / (1 - kis); // o gume sobe em curva até encontrar o dorso na ponta
    return spine(t) - w(t) * Math.cos((u * Math.PI) / 2) ** 0.8;
  };
  // linha do hamon: ondulada, a ~40% da largura a partir do gume
  const hamonAt = (t) => {
    const e = edgeAt(t);
    const span = spine(t) - e;
    return e + span * (0.42 + 0.1 * Math.sin(t * 46) * Math.min(1, t * 8));
  };
  const top = side === 'ha' ? hamonAt : spine;
  const bot = side === 'ji' ? hamonAt : edgeAt;
  const sh = new THREE.Shape();
  sh.moveTo(top(0), 0);
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    sh.lineTo(top(t), -len * t);
  }
  for (let i = N; i >= 0; i--) {
    const t = i / N;
    sh.lineTo(bot(t), -len * t);
  }
  return sh;
}

// KATANA do Joui (arte "mascarado especial"/"corpo inteiro"): lâmina CURVA de aço com o HAMON claro e ondulado no
// fio e a ponta kissaki; habaki dourado; TSUBA vermelha octogonal com aro escuro; cabo de pele de raia branca com o
// trançado VERMELHO em losangos (ito), menuki dourado, fuchi e kashira pretos e a borla de corda vermelha.
export function katana() {
  const g = new THREE.Group();
  const LEN = 0.84;
  const W = 0.036;
  const SORI = 0.05;
  // cabo: núcleo branco (samegawa) + losangos vermelhos do trançado nos dois lados
  const tsukaLen = 0.25;
  const core = part(new THREE.CylinderGeometry(0.0185, 0.0175, tsukaLen, 10), 0xe6e0d2);
  core.scale.z = 0.82;
  core.position.y = -0.078 + tsukaLen / 2 + 0.006;
  g.add(core);
  const ito = toon(0xa0141c);
  const n = 7;
  for (let i = 0; i < n; i++) {
    const y = -0.06 + (i + 0.5) * (tsukaLen / n);
    // fitas cruzadas em X na frente e atrás do cabo: os vãos mostram o branco em losango
    for (const d of [1, -1]) {
      for (const zs of [1, -1]) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.011, 0.004), ito);
        band.position.set(0, y, zs * 0.0152);
        band.rotation.z = d * 0.62;
        g.add(band);
      }
    }
  }
  // menuki dourado (enfeite sob o trançado, um de cada lado)
  for (const zs of [1, -1]) {
    const menuki = part(new THREE.SphereGeometry(0.009, 6, 4), 0xd2a84a, { outline: false });
    menuki.scale.set(0.8, 2.2, 0.5);
    menuki.position.set(0, 0.06, zs * 0.016);
    g.add(menuki);
  }
  const black = 0x161416;
  const fuchi = part(new THREE.CylinderGeometry(0.021, 0.021, 0.018, 10), black);
  fuchi.scale.z = 0.85;
  fuchi.position.y = -0.066;
  g.add(fuchi);
  const kashira = part(new THREE.CylinderGeometry(0.017, 0.021, 0.022, 10), black);
  kashira.scale.z = 0.85;
  kashira.position.y = 0.19;
  g.add(kashira);
  // borla de corda vermelha pendurada no pomo
  const tassel = part(new THREE.CylinderGeometry(0.004, 0.006, 0.09, 5), 0xa0141c, { outline: false });
  tassel.position.set(0.012, 0.225, 0);
  tassel.rotation.z = -0.5;
  g.add(tassel);
  // tsuba vermelha OCTOGONAL com aro escuro + seppa
  const tsuba = part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), 0x9a1018, { mat: toon(0x9a1018, { emissive: 0x200204 }) });
  tsuba.rotation.y = Math.PI / 8;
  tsuba.scale.z = 0.86;
  tsuba.position.y = -0.081;
  g.add(tsuba);
  const rim = part(new THREE.TorusGeometry(0.047, 0.004, 4, 8), 0x2a0a0c, { outline: false });
  rim.rotation.set(Math.PI / 2, 0, Math.PI / 8);
  rim.scale.y = 0.86;
  rim.position.y = -0.081;
  g.add(rim);
  for (const dy of [-0.0075, 0.0075]) {
    const seppa = part(new THREE.CylinderGeometry(0.026, 0.026, 0.003, 10), 0xc9a24a, { outline: false });
    seppa.scale.z = 0.7;
    seppa.position.y = -0.081 + dy;
    g.add(seppa);
  }
  // habaki dourado
  const habaki = part(new THREE.BoxGeometry(0.008, 0.03, 0.04), 0xd2a84a, { mat: toon(0xd2a84a, { emissive: 0x2a1e06 }) });
  habaki.position.set(0, -0.103, -0.002);
  g.add(habaki);
  // lâmina: corpo de aço + fio claro (hamon), curvando para o dorso (+Z = "topo" da arma)
  const blade = new THREE.Group();
  const ji = part(extrude(katanaShape(LEN, W, SORI, 'ji'), 0.007), 0, { mat: toon(0x76808e, { emissive: 0x0c1016 }) });
  const ha = part(extrude(katanaShape(LEN, W, SORI, 'ha'), 0.005), 0, { mat: toon(0xf6f9ff, { emissive: 0x3a4250 }), outline: false });
  blade.add(ji, ha);
  blade.position.set(0, -0.09, 0);
  blade.rotation.y = -Math.PI / 2; // X da forma → +Z do grupo: o dorso fica para cima
  // centraliza: o dorso começa em x=0, então desloca meia largura para o gume ficar embaixo
  ji.position.x = W / 2;
  ha.position.x = W / 2;
  g.add(blade);
  g.userData.tipLength = 0.93;
  return g;
}

// BAINHA (saya) do Joui: laca preta levemente curva, boca de chifre, ponteira de metal escuro e o SAGEO (cordão
// vermelho) enrolado perto da boca com a laçada pendurada.
// SHI NO KAGE ("Sombra da Morte") — a katana que a Magistrada dá ao Joui depois do ep. 9 de Calamidade (wiki "Joui
// Jouki", Arsenal): lâmina PRETA, amaldiçoada com Conhecimento, com SIGILOS DE CONHECIMENTO DOURADOS que brilham na
// lâmina. Mesma forma e empunhadura da katana dele (o Joui segura do mesmo jeito); cabo e tsuba escuros.
export function shiNoKage() {
  const g = katana();
  const black = toon(0x121014, { emissive: 0x050405 });
  const edge = toon(0x3a3640, { emissive: 0x0c0a10 });
  g.traverse((o) => {
    if (!o.isMesh || o.userData.isOutline) return;
    const c = o.material && o.material.color && o.material.color.getHex();
    if (c === 0x76808e) o.material = black; // corpo da lâmina
    else if (c === 0xf6f9ff) o.material = edge; // o fio: cinza escuro, sem o brilho de aço
    else if (c === 0xa0141c || c === 0x9a1018 || c === 0xe6e0d2) o.material = toon(0x1c1a1e); // trançado, tsuba e cabo
  });
  // os sigilos dourados ao longo da lâmina, nas duas faces (traços curtos como escrita cuneiforme)
  const gold = glowMat(0xffd27a, 1);
  const LEN = 0.84;
  for (let i = 0; i < 9; i++) {
    const y = -0.15 - i * (LEN - 0.12) / 9;
    const curve = 0.05 * ((-y - 0.09) / LEN) ** 2; // acompanha a curvatura (sori) da lâmina
    for (const side of [1, -1]) {
      const strokes = i % 2 ? [[0, 0.0], [0.6, 0.012]] : [[-0.5, 0.0], [0.5, 0.0], [0, 0.014]];
      for (const [rot, dy] of strokes) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.0015, 0.026, 0.008), gold);
        s.position.set(side * 0.0045, y + dy, 0.018 + curve);
        s.rotation.x = rot;
        g.add(s);
      }
    }
  }
  // o brilho fraco que acompanha a lâmina (o Conhecimento)
  const halo = new THREE.Mesh(new THREE.BoxGeometry(0.004, LEN, 0.05), glowMat(0xffd27a, 0.12));
  halo.position.set(0, -0.09 - LEN / 2, 0.02);
  g.add(halo);
  return g;
}

// A RELÍQUIA DE ENERGIA sacada (a katana antiga do Joui depois que a Relíquia se assimilou a ela — wiki: "uma forma
// brilhante similar a um sabre de luz"): cabo escuro e a lâmina de luz roxa com o halo. Só aparece no especial da forma.
export function relicBlade() {
  const g = new THREE.Group();
  const grip = part(new THREE.CylinderGeometry(0.019, 0.018, 0.24, 10), 0x1c1a1e);
  grip.position.y = 0.04;
  g.add(grip);
  const guard = part(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8), 0x2a2030);
  guard.position.y = -0.085;
  g.add(guard);
  const LEN = 0.84;
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.012, LEN, 0.03), glowMat(0xf4e8ff, 1));
  core.position.y = -0.09 - LEN / 2;
  g.add(core);
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.03, LEN + 0.02, 0.06), glowMat(0xb070ff, 0.55));
  glow.position.copy(core.position);
  g.add(glow);
  const halo = new THREE.Mesh(new THREE.BoxGeometry(0.07, LEN + 0.06, 0.11), glowMat(0x8a40ff, 0.18));
  halo.position.copy(core.position);
  g.add(halo);
  g.userData.tipLength = 0.93;
  return g;
}

// A bainha que a Magistrada fez para conter a RELÍQUIA DE ENERGIA (a katana antiga do Joui): os Sigilos de Conhecimento
// ROXOS brilhando ao longo dela (wiki "Joui Jouki", Arsenal de Calamidade)
export function relicScabbard() {
  const g = scabbard();
  const purple = glowMat(0xb070ff, 1);
  for (let i = 0; i < 7; i++) {
    const t = (i + 1) / 8;
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.03, 0.012), purple);
    s.position.set(0.015, -0.86 * t, 0.05 * t * t + 0.004);
    s.rotation.z = i % 2 ? 0.5 : -0.5;
    g.add(s);
    const s2 = s.clone();
    s2.position.x = -0.015;
    g.add(s2);
  }
  return g;
}

export function scabbard() {
  const g = new THREE.Group();
  const LEN = 0.86;
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -LEN * 0.5, 0.012), new THREE.Vector3(0, -LEN, 0.05));
  const body = part(new THREE.TubeGeometry(curve, 20, 0.024, 8, false), 0x141012, { mat: toon(0x141012, { emissive: 0x060406 }) });
  body.scale.x = 0.62;
  g.add(body);
  const mouth = part(new THREE.CylinderGeometry(0.027, 0.027, 0.03, 10), 0x2a2224);
  mouth.scale.x = 0.66;
  mouth.position.y = -0.012;
  g.add(mouth);
  const tip = part(new THREE.CylinderGeometry(0.026, 0.02, 0.05, 10), 0x5a5a60);
  tip.scale.x = 0.66;
  tip.position.set(0, -LEN + 0.022, 0.048);
  tip.rotation.x = -0.1;
  g.add(tip);
  const cap = part(new THREE.SphereGeometry(0.02, 10, 6), 0x5a5a60);
  cap.scale.set(0.66, 0.5, 1);
  cap.position.set(0, -LEN - 0.002, 0.05);
  g.add(cap);
  // kurigata (argola lateral) + sageo enrolado
  const red = 0xa0141c;
  const kuri = part(new THREE.TorusGeometry(0.012, 0.004, 4, 8), 0x2a2224, { outline: false });
  kuri.position.set(0, -0.09, -0.026);
  kuri.rotation.y = Math.PI / 2;
  g.add(kuri);
  for (let i = 0; i < 4; i++) {
    const w = part(new THREE.TorusGeometry(0.025, 0.0045, 4, 12), red, { outline: false });
    w.scale.set(0.66, 1, 1);
    w.rotation.x = Math.PI / 2 + (i % 2 ? 0.25 : -0.25);
    w.position.y = -0.07 - i * 0.016;
    g.add(w);
  }
  const loopCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.1, -0.03),
    new THREE.Vector3(0.01, -0.2, -0.05),
    new THREE.Vector3(0.0, -0.28, -0.035),
    new THREE.Vector3(-0.01, -0.2, -0.028),
    new THREE.Vector3(0, -0.12, -0.026),
  ]);
  g.add(part(new THREE.TubeGeometry(loopCurve, 18, 0.004, 4, false), red, { outline: false }));
  return g;
}

// BENGALA da Magistrada (a arte do Livro de Regras): haste escura e fina até o chão, cabo dourado em L e a corrente
// dourada pendurada do cabo. Empunhada como espada de esgrima (a ponta vai para -Y).
export function bengala() {
  const g = new THREE.Group();
  const goldM = toon(0xc8a048, { emissive: 0x2a1e06 });
  const shaft = part(new THREE.CylinderGeometry(0.014, 0.011, 0.92, 8), 0x1e1612);
  shaft.position.y = -0.44;
  g.add(shaft);
  const tip = part(new THREE.CylinderGeometry(0.013, 0.016, 0.04, 8), 0, { mat: goldM });
  tip.position.y = -0.9;
  g.add(tip);
  const collar = part(new THREE.CylinderGeometry(0.02, 0.018, 0.04, 10), 0, { mat: goldM });
  collar.position.y = 0.02;
  g.add(collar);
  // cabo em L para a frente (+Z)
  const handle = part(new THREE.BoxGeometry(0.028, 0.03, 0.13), 0, { mat: goldM });
  handle.position.set(0, 0.05, 0.05);
  g.add(handle);
  const knob = part(new THREE.SphereGeometry(0.02, 8, 6), 0, { mat: goldM });
  knob.position.set(0, 0.05, 0.12);
  g.add(knob);
  // corrente fina caindo do cabo em laço
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    pts.push(new THREE.Vector3(0.01, 0.04 - Math.sin(t * Math.PI) * 0.32, 0.11 - t * 0.1));
  }
  g.add(part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.004, 4, false), 0, { mat: goldM, outline: false }));
  g.userData.tipLength = 0.9;
  return g;
}

// Karambit vermelha do Kaiser: lâmina curva em garra e anel no cabo
export function karambit() {
  const g = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.016, 0.016, 0.1, 8), 0x1a1a1c);
  handle.position.y = 0.02;
  g.add(handle);
  const ring = part(new THREE.TorusGeometry(0.026, 0.007, 6, 14), 0x8a8a90);
  ring.position.y = 0.09;
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  const blade = part(extrude(bladeShape(0.18, 0.035, 0.09, 0.15), 0.008), 0xb0141e, { mat: toon(0xb0141e, { emissive: 0x2a0004 }) });
  blade.position.y = -0.03;
  blade.rotation.y = Math.PI / 2;
  g.add(blade);
  return g;
}

export function knife() {
  const g = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.018, 0.016, 0.12, 8), 0x2a1a14);
  handle.position.y = 0.02;
  g.add(handle);
  for (let i = 0; i < 3; i++) {
    const bead = part(new THREE.SphereGeometry(0.012, 6, 5), 0xa01020, { outline: false });
    bead.position.set(0.02, 0.05 - i * 0.03, 0);
    g.add(bead);
  }
  const blade = part(extrude(bladeShape(0.24, 0.04, 0.07, 0.2), 0.008), 0xd8d8d8, { mat: toon(0xd8d8d8, { emissive: 0x221111 }) });
  blade.position.y = -0.04;
  blade.rotation.y = Math.PI / 2;
  g.add(blade);
  return g;
}

// Lâmina longa curva do Injustiça (arco dos dois lados, empunhadura com aro dourado)
export function sickleBlade() {
  // o modelo do Blender (tools/blender/npc_gal_blade.py, a partir da arte oficial): a lâmina longa em meia-lua de aço
  // escuro com as pontas para a frente, a escrita cuneiforme dourada, a empunhadura enrolada e a guarda em anel
  const m = buildNpcModel('gal_blade', { outline: 0.005, noOutline: ['gold', 'edge'] });
  if (m) return m.root;
  const g = new THREE.Group();
  const ring = part(new THREE.TorusGeometry(0.06, 0.012, 6, 16), 0xc9a24a, { mat: toon(0xc9a24a, { emissive: 0x3a2a08 }) });
  ring.rotation.y = Math.PI / 2;
  ring.position.set(0, 0, 0.04);
  g.add(ring);
  const grip = part(new THREE.CylinderGeometry(0.016, 0.016, 0.14, 8), 0xb08a3a);
  g.add(grip);
  const bladeMat = toon(0x5b544a, { emissive: 0x15120c });
  const lower = part(extrude(bladeShape(0.62, 0.05, 0.12, 0.4), 0.01), 0, { mat: bladeMat });
  lower.position.y = -0.07;
  lower.rotation.y = Math.PI / 2;
  g.add(lower);
  const upper = part(extrude(bladeShape(0.45, 0.045, 0.1, 0.4), 0.01), 0, { mat: bladeMat });
  upper.position.y = 0.07;
  upper.rotation.set(Math.PI, Math.PI / 2, 0);
  g.add(upper);
  return g;
}

export function m4() {
  const g = new THREE.Group();
  const dark = 0x1d1f22;
  const recv = part(new THREE.BoxGeometry(0.06, 0.32, 0.09), dark);
  recv.position.y = -0.08;
  g.add(recv);
  const guard = part(new THREE.BoxGeometry(0.055, 0.24, 0.065), 0x2b2e33);
  guard.position.set(0, -0.36, 0.005);
  g.add(guard);
  const barrel = part(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6), dark);
  barrel.position.y = -0.58;
  g.add(barrel);
  const stock = part(new THREE.BoxGeometry(0.05, 0.22, 0.07), dark);
  stock.position.set(0, 0.17, -0.01);
  g.add(stock);
  const mag = part(new THREE.BoxGeometry(0.04, 0.06, 0.14), dark);
  mag.position.set(0, -0.15, -0.1);
  mag.rotation.x = 0.25;
  g.add(mag);
  const sight = part(new THREE.BoxGeometry(0.03, 0.08, 0.04), 0x111111);
  sight.position.set(0, -0.12, 0.065);
  g.add(sight);
  const muzzle = new THREE.Object3D();
  muzzle.position.y = -0.7;
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

export function sniper() {
  const g = new THREE.Group();
  const wood = 0x3a2a1e;
  const metal = 0x1c1c1e;
  const body = part(new THREE.BoxGeometry(0.06, 0.5, 0.08), wood);
  body.position.y = -0.1;
  g.add(body);
  const barrel = part(new THREE.CylinderGeometry(0.014, 0.016, 0.7, 8), metal);
  barrel.position.y = -0.68;
  g.add(barrel);
  const scope = part(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 10), metal);
  scope.position.set(0, -0.15, 0.08);
  g.add(scope);
  const stock = part(new THREE.BoxGeometry(0.05, 0.25, 0.11), wood);
  stock.position.set(0, 0.25, -0.02);
  g.add(stock);
  const muzzle = new THREE.Object3D();
  muzzle.position.y = -1.04;
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

// SNIPER FANTASMA (Kemi): rifle preto de cano longo com silenciador, luneta, todo enrolado em faixas claras com
// pontas soltas penduradas. drip: na forma Fantasma o cano pinga lodo preto. Mesma orientação do sniper(): cano em -Y.
export function sniperFantasma({ drip = false } = {}) {
  const g = new THREE.Group();
  const black = 0x161618;
  const band = 0xd8ccb0;
  const body = part(new THREE.BoxGeometry(0.06, 0.55, 0.085), black);
  body.position.y = -0.1;
  g.add(body);
  const stock = part(new THREE.BoxGeometry(0.05, 0.28, 0.12), black);
  stock.position.set(0, 0.28, -0.02);
  g.add(stock);
  const grip = part(new THREE.BoxGeometry(0.035, 0.1, 0.05), black);
  grip.position.set(0, 0.06, -0.07);
  grip.rotation.x = 0.4;
  g.add(grip);
  const barrel = part(new THREE.CylinderGeometry(0.014, 0.016, 0.8, 8), black);
  barrel.position.y = -0.75;
  g.add(barrel);
  const silencer = part(new THREE.CylinderGeometry(0.026, 0.026, 0.2, 10), 0x0c0c0e);
  silencer.position.y = -1.2;
  g.add(silencer);
  const scope = part(new THREE.CylinderGeometry(0.026, 0.03, 0.32, 10), black);
  scope.position.set(0, -0.16, 0.085);
  g.add(scope);
  // faixas enroladas: no corpo, na luneta e no cano (com duas pontas soltas penduradas)
  for (const [y, r, z] of [[0.2, 0.072, -0.02], [-0.02, 0.066, 0], [-0.2, 0.066, 0], [-0.1, 0.034, 0.085], [-0.25, 0.034, 0.085], [-0.55, 0.022, 0], [-0.85, 0.022, 0]]) {
    const w = part(new THREE.CylinderGeometry(r, r, 0.045, 10, 1, true), band, { mat: toon(band, { side: THREE.DoubleSide }) });
    w.position.set(0, y, z);
    w.rotation.x = 0.12;
    g.add(w);
  }
  for (const [y, len] of [[-0.55, 0.32], [-0.02, 0.24]]) {
    const strip = part(new THREE.PlaneGeometry(0.035, len), band, { mat: toon(band, { side: THREE.DoubleSide }) });
    strip.position.set(0.01, y - 0.02, -0.04 - len / 2);
    strip.rotation.x = Math.PI / 2 - 0.25;
    g.add(strip);
  }
  if (drip) {
    // lodo preto escorrendo do cano
    const lodo = toon(0x050406, { emissive: 0x0a0508 });
    for (const [y, l] of [[-1.28, 0.14], [-1.12, 0.09], [-0.9, 0.11]]) {
      const d = part(new THREE.CylinderGeometry(0.008, 0.016, l, 6), 0x050406, { mat: lodo });
      d.position.set(0, y, -0.03 - l / 2);
      d.rotation.x = Math.PI / 2;
      g.add(d);
      const drop = part(new THREE.SphereGeometry(0.016, 6, 4), 0x050406, { mat: lodo });
      drop.position.set(0, y, -0.035 - l);
      g.add(drop);
    }
  }
  const muzzle = new THREE.Object3D();
  muzzle.position.y = -1.32;
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

// Suporte nas costas semelhante a um case de violão
export function guitarCase() {
  const g = new THREE.Group();
  const c = 0x17171a;
  const lower = part(new THREE.SphereGeometry(0.2, 14, 10), c);
  lower.scale.set(1, 1.15, 0.45);
  lower.position.y = -0.32;
  g.add(lower);
  const upper = part(new THREE.SphereGeometry(0.16, 14, 10), c);
  upper.scale.set(1, 1.1, 0.45);
  upper.position.y = 0.0;
  g.add(upper);
  const neck = part(new THREE.BoxGeometry(0.12, 0.55, 0.1), c);
  neck.position.y = 0.38;
  g.add(neck);
  const head = part(new THREE.BoxGeometry(0.15, 0.16, 0.11), c);
  head.position.y = 0.72;
  g.add(head);
  const strap = part(new THREE.BoxGeometry(0.03, 0.75, 0.02), 0x2a2018, { outline: false });
  strap.position.set(0.0, 0.05, 0.11);
  strap.rotation.z = 0.7;
  g.add(strap);
  return g;
}

// textura de sangue: vermelho escuro com feixes claros escorrendo no comprimento e veias quase pretas
let bloodTex = null;
function bloodTexture() {
  if (bloodTex) return bloodTex;
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 128, 0);
  grd.addColorStop(0, '#4a0008'); grd.addColorStop(0.5, '#8a0418'); grd.addColorStop(1, '#4a0008');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 256);
  const streak = (color, w, n) => {
    g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      let x = Math.random() * 128;
      g.beginPath(); g.moveTo(x, -10);
      for (let y = 0; y <= 266; y += 22) { x += (Math.random() - 0.5) * 14; g.lineTo(x, y); }
      g.stroke();
    }
  };
  streak('rgba(30,0,4,0.8)', 5, 7); // veias escuras
  streak('rgba(200,16,48,0.85)', 3, 9); // feixes claros
  streak('rgba(255,90,110,0.7)', 1.2, 6); // brilho molhado
  bloodTex = new THREE.CanvasTexture(c);
  bloodTex.colorSpace = THREE.SRGBColorSpace;
  bloodTex.wrapS = bloodTex.wrapT = THREE.RepeatWrapping;
  return bloodTex;
}
function bloodMaterial() {
  // sangue molhado: brilho especular + um pouco de luz própria
  const m = new THREE.MeshStandardMaterial({ map: bloodTexture(), color: 0xffffff, roughness: 0.22, metalness: 0.15, emissive: 0x3a0008, emissiveIntensity: 0.9 });
  m.userData.keepEmissive = true;
  return m;
}

// Reveste uma arma com SANGUE: troca o material de cada peça pelo mesmo sangue molhado da Arma de Sangue do Arthur
// (textura de sangue, reflexo úmido, luz própria fraca). Retorna a função que devolve os materiais originais.
export function bloodCoat(root) {
  const mat = bloodMaterial();
  const saved = [];
  root.traverse((o) => {
    if (!o.isMesh || o.userData.isOutline || o.material === mat) return;
    if (o.material && o.material.side === THREE.BackSide) return; // contorno preto fica
    if (!o.visible || (o.material && o.material.transparent)) return; // brilhos/halos transparentes ficam (viravam bolas vermelhas)
    saved.push([o, o.material]);
    o.material = mat;
  });
  return () => {
    for (const [o, m] of saved) o.material = m;
    mat.map && mat.map.dispose();
    mat.dispose();
  };
}

// ARMA AMALDIÇOADA POR ELEMENTO: uma textura para cada elemento do Outro Lado (pintada uma vez e reaproveitada).
//  - SANGUE: sangue molhado escuro com escorridos, coágulos e o reflexo úmido;
//  - MORTE: o Lodo preto com as ESPIRAIS cinza (o símbolo da Morte) e o brilho molhado;
//  - CONHECIMENTO: madeira/metal escurecido coberto de SIGILOS dourados que brilham;
//  - ENERGIA: roxo profundo rachado por RAIOS violeta que piscam.
// Cada uma traz o mapa de cor e o de brilho (as partes que acendem); a cobertura troca o material de cada peça e
// devolve a função que desfaz.
const ELEMENT_TEX = {};
function paintCoat(el) {
  if (ELEMENT_TEX[el]) return ELEMENT_TEX[el];
  const mk = () => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; return c; };
  const col = mk(); const glo = mk();
  const g = col.getContext('2d'); const e = glo.getContext('2d');
  e.fillStyle = '#000'; e.fillRect(0, 0, 256, 256);
  const R_ = Math.random;
  const wander = (ctx, x0, step, jit) => { let x = x0; ctx.beginPath(); ctx.moveTo(x, -10); for (let y = 0; y <= 266; y += step) { x += (R_() - 0.5) * jit; ctx.lineTo(x, y); } ctx.stroke(); };
  if (el === 'sangue') {
    const grd = g.createLinearGradient(0, 0, 256, 0);
    grd.addColorStop(0, '#3a0006'); grd.addColorStop(0.5, '#7a0414'); grd.addColorStop(1, '#3a0006');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(20,0,2,0.75)'; g.lineWidth = 7; for (let i = 0; i < 9; i++) wander(g, R_() * 256, 20, 16); // veias escuras
    g.strokeStyle = 'rgba(190,14,40,0.9)'; g.lineWidth = 4; for (let i = 0; i < 12; i++) wander(g, R_() * 256, 18, 14); // escorridos
    for (let i = 0; i < 22; i++) { // gotas penduradas e coágulos
      const x = R_() * 256, y = R_() * 256, r = 3 + R_() * 6;
      g.fillStyle = 'rgba(110,0,12,0.95)'; g.beginPath(); g.ellipse(x, y, r * 0.8, r * 1.4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,120,130,0.6)'; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.5, r * 0.25, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = 'rgba(255,110,125,0.55)'; g.lineWidth = 1.4; for (let i = 0; i < 8; i++) wander(g, R_() * 256, 24, 10); // reflexo molhado
    e.strokeStyle = 'rgba(120,0,16,1)'; e.lineWidth = 4; for (let i = 0; i < 6; i++) wander(e, R_() * 256, 18, 14);
  } else if (el === 'morte') {
    g.fillStyle = '#0e0c10'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(60,56,66,${R_() * 0.2})`; g.fillRect(R_() * 256, R_() * 256, 3, 2); }
    // as espirais da Morte
    for (let k = 0; k < 7; k++) {
      const cx = R_() * 256, cy = R_() * 256, rr = 10 + R_() * 18;
      for (const [ctx, c, w] of [[g, 'rgba(150,146,158,0.85)', 2.2], [e, 'rgba(120,116,128,1)', 2.2]]) {
        ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
        for (let a = 0; a < Math.PI * 5; a += 0.15) { const r = rr * (1 - a / (Math.PI * 5)); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
        ctx.stroke();
      }
    }
    g.strokeStyle = 'rgba(120,118,130,0.35)'; g.lineWidth = 1.4; for (let i = 0; i < 10; i++) wander(g, R_() * 256, 22, 8); // brilho do Lodo escorrendo
  } else if (el === 'conhecimento') {
    const grd = g.createLinearGradient(0, 0, 256, 0);
    grd.addColorStop(0, '#2a1c08'); grd.addColorStop(0.5, '#4a3412'); grd.addColorStop(1, '#2a1c08');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    // fileiras de SIGILOS (traços retos, círculos e cruzes, como as escritas do Conhecimento)
    for (let row = 0; row < 8; row++) {
      for (let k = 0; k < 7; k++) {
        const x = 12 + k * 36 + (row % 2) * 16, y = 18 + row * 32;
        for (const [ctx, c] of [[g, '#f2c230'], [e, '#d8a020']]) {
          ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.beginPath();
          const t = (row * 7 + k) % 4;
          if (t === 0) { ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); }
          else if (t === 1) { ctx.moveTo(x - 7, y - 8); ctx.lineTo(x + 7, y + 8); ctx.moveTo(x + 7, y - 8); ctx.lineTo(x - 7, y + 8); ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10); }
          else if (t === 2) { ctx.moveTo(x - 8, y + 7); ctx.lineTo(x, y - 8); ctx.lineTo(x + 8, y + 7); ctx.closePath(); }
          else { ctx.moveTo(x - 8, y - 6); ctx.lineTo(x + 8, y - 6); ctx.moveTo(x - 4, y - 6); ctx.lineTo(x - 4, y + 8); ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + 8, y + 8); }
          ctx.stroke();
        }
      }
    }
  } else { // energia
    g.fillStyle = '#180826'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(150,90,255,${R_() * 0.18})`; g.fillRect(R_() * 256, R_() * 256, 2, 2); }
    // RAIOS ramificados
    const bolt = (ctx, c, w) => {
      ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineJoin = 'miter';
      for (let i = 0; i < 7; i++) {
        let x = R_() * 256, y = -10;
        ctx.beginPath(); ctx.moveTo(x, y);
        while (y < 266) { x += (R_() - 0.5) * 34; y += 10 + R_() * 18; ctx.lineTo(x, y); if (R_() < 0.2) { ctx.moveTo(x, y); ctx.lineTo(x + (R_() - 0.5) * 40, y + 20); ctx.moveTo(x, y); } }
        ctx.stroke();
      }
    };
    bolt(g, 'rgba(200,150,255,0.95)', 2.4);
    bolt(e, 'rgba(190,120,255,1)', 3);
  }
  const mkTex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 2); return t; };
  ELEMENT_TEX[el] = { map: mkTex(col), emissiveMap: mkTex(glo) };
  return ELEMENT_TEX[el];
}

const COAT_LOOK = {
  sangue: { roughness: 0.22, metalness: 0.15, emissive: 0xc0102a, emissiveIntensity: 0.55 },
  morte: { roughness: 0.18, metalness: 0.1, emissive: 0x8a8494, emissiveIntensity: 0.6 },
  conhecimento: { roughness: 0.5, metalness: 0.3, emissive: 0xffc830, emissiveIntensity: 1.6 },
  energia: { roughness: 0.35, metalness: 0.2, emissive: 0xb070ff, emissiveIntensity: 1.8 },
};

// Reveste a arma com o ELEMENTO (sangue, morte, conhecimento, energia). Retorna { undo, mat } — mat para animar o
// brilho (a Energia pisca). Elementos fora do ciclo (Medo, Tinta, Transmissão) usam o Sangue.
export function elementCoat(root, el) {
  const key = COAT_LOOK[el] ? el : 'sangue';
  const tx = paintCoat(key);
  const L = COAT_LOOK[key];
  const mat = new THREE.MeshStandardMaterial({ map: tx.map, emissiveMap: tx.emissiveMap, color: 0xffffff, roughness: L.roughness, metalness: L.metalness, emissive: L.emissive, emissiveIntensity: L.emissiveIntensity });
  mat.userData.keepEmissive = true;
  mat.userData.baseGlow = L.emissiveIntensity;
  const saved = [];
  root.traverse((o) => {
    if (!o.isMesh || o.userData.isOutline || o.material === mat) return;
    if (o.material && o.material.side === THREE.BackSide) return;
    if (!o.visible || (o.material && o.material.transparent)) return;
    saved.push([o, o.material]);
    o.material = mat;
  });
  return { mat, undo: () => { for (const [o, m] of saved) o.material = m; mat.dispose(); } };
}

// tubo ao longo de uma curva que vai afinando (r(t) = raio no ponto t de 0 a 1)
export function taperedTube(curve, len, r, mat, seg = 24, radial = 7) {
  const geo = new THREE.TubeGeometry(curve, seg, 1, radial, false);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = Math.floor(i / (radial + 1)) / seg;
    const p = curve.getPointAt(Math.min(1, t));
    v.sub(p).multiplyScalar(r(t)).add(p);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.userData.outline = true;
  return m;
}

// feixe retorcido de sangue girando em volta do eixo -Y
function bloodStrand(len, r0, r1, turns, offset, phase, mat, wobble = 0.35) {
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const a = phase + t * turns * Math.PI * 2;
    const rr = offset * (1 + Math.sin(t * Math.PI * 3 + phase) * wobble);
    pts.push(new THREE.Vector3(Math.cos(a) * rr, -t * len, Math.sin(a) * rr));
  }
  return taperedTube(new THREE.CatmullRomCurve3(pts), len, (t) => r0 + (r1 - r0) * t, mat);
}

// Arma de Sangue do ARTHUR (cânone: "gastando 2 PV, projeta uma lâmina a partir do próprio sangue"), v2 (pedido de 2026-10-27: "tem que cobrir seu antebraço como uma lâmina saindo dele e não
// ser segurada como uma espada"): o sangue cobre o ANTEBRAÇO DIREITO numa crosta, e a lâmina NASCE dela — corre pelas
// costas do antebraço e passa direto do punho fechado, na linha do braço (sem cabo, sem "segurar"). Espaço do soquete
// da mão: +Y = para o cotovelo, −Y = para além dos dedos; −Z = costas do antebraço.
export function bloodForearmBlade(fore = 0.26, reach = 0.5) {
  const mat = bloodMaterial();
  const g = new THREE.Group();
  // a CROSTA que cobre o antebraço (do pulso até perto do cotovelo), mais grossa nas costas
  const sleeve = taperedTube(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.02, -0.006), new THREE.Vector3(0, fore * 0.5, -0.01), new THREE.Vector3(0, fore, -0.006)]), fore, (t) => 0.05 + Math.sin(t * Math.PI) * 0.008, mat, 16, 10);
  g.add(sleeve);
  // feixes enrolando a crosta (o sangue ainda correndo)
  for (let i = 0; i < 3; i++) {
    const s = bloodStrand(fore * 0.9, 0.012, 0.005, 0.8, 0.054, (i / 3) * Math.PI * 2, mat, 0.15);
    s.rotation.x = Math.PI;
    s.position.y = -0.01;
    g.add(s);
  }
  // a LÂMINA: o dorso preso nas costas do antebraço, a ponta passando do punho na linha do braço
  const len = fore * 0.85 + reach;
  const blade = new THREE.Mesh(extrude(bladeShape(len, 0.075, 0.09, 0.2), 0.016), mat);
  blade.rotation.y = Math.PI / 2;
  blade.position.set(0, fore * 0.85, -0.06);
  blade.userData.outline = true;
  g.add(blade);
  // a "costura" da lâmina na crosta (um cordão de sangue ao longo da base)
  const seam = taperedTube(new THREE.CatmullRomCurve3([new THREE.Vector3(0, fore * 0.85, -0.05), new THREE.Vector3(0, fore * 0.3, -0.055), new THREE.Vector3(0, -0.05, -0.058)]), fore, () => 0.016, mat, 10, 6);
  g.add(seam);
  // espinhos nas costas da lâmina, para trás (para o cotovelo)
  for (let i = 0; i < 4; i++) {
    const sp = bloodSpike(0.06 + i * 0.015, 0.011, 0.025, mat);
    sp.position.set(0, fore * 0.7 - i * 0.16, -0.1);
    sp.rotation.x = -2.4;
    g.add(sp);
  }
  return g;
}

// espinho/garra de sangue curvado
export function bloodSpike(len, r, bend, mat) {
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pts.push(new THREE.Vector3(Math.sin(t * 1.2) * bend, -t * len, 0));
  }
  return taperedTube(new THREE.CatmullRomCurve3(pts), len, (t) => r * (1 - t) ** 1.3 + 0.002, mat, 12, 6);
}

/**
 * Arma de Sangue (especial do Arthur): um BRAÇO inteiro de sangue que nasce do toco do ombro esquerdo.
 * Feixes retorcidos formam o braço; a mão termina em garras longas e espinhos que se abrem.
 * Retorna { upper, fore }: upper vai na junta do ombro (sL), fore na do cotovelo (eL).
 * Espaço local: braço para baixo = -Y, frente do personagem = +Z.
 */
export function bloodArm(upperLen = 0.32, foreLen = 0.3) {
  const mat = bloodMaterial();
  const upper = new THREE.Group();
  const fore = new THREE.Group();
  // ombro: massa de sangue que cobre o toco
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), mat);
  cap.scale.set(1.1, 0.9, 1.05);
  cap.userData.outline = true;
  upper.add(cap);
  // braço: núcleo + feixes retorcidos
  // braço musculoso: núcleo grosso (bíceps mais largo no meio) + feixes retorcidos por fora
  const bicep = (t) => 0.08 + Math.sin(t * Math.PI) * 0.025 - t * 0.012;
  const core = (len, fn) => {
    const pts = [];
    for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector3(0, -(i / 8) * len, 0));
    return taperedTube(new THREE.CatmullRomCurve3(pts), len, fn, mat, 16, 10);
  };
  upper.add(core(upperLen + 0.04, bicep));
  for (let i = 0; i < 8; i++) upper.add(bloodStrand(upperLen + 0.05, 0.034, 0.026, 0.3 + (i % 3) * 0.12, 0.07, (i / 8) * Math.PI * 2, mat, 0.25));
  // antebraço: largo perto do cotovelo, afina no punho
  fore.add(core(foreLen + 0.02, (t) => 0.078 + Math.sin(t * Math.PI * 0.8) * 0.018 - t * 0.03));
  for (let i = 0; i < 9; i++) fore.add(bloodStrand(foreLen + 0.03, 0.032, 0.022, -0.35 - (i % 2) * 0.15, 0.064, (i / 9) * Math.PI * 2 + 0.3, mat, 0.25));
  // mão: massa no punho
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), mat);
  hand.scale.set(1.05, 1.3, 0.85);
  hand.position.y = -foreLen - 0.04;
  hand.userData.outline = true;
  fore.add(hand);
  // garras: 5 dedos longos e curvos, abertos para frente
  for (let i = 0; i < 5; i++) {
    const s = bloodSpike(0.32 + (i === 2 ? 0.08 : 0), 0.028, 0.08, mat);
    s.position.set((i - 2) * 0.034, -foreLen - 0.1, 0.02);
    s.rotation.set(-0.25 - Math.abs(i - 2) * 0.05, -Math.PI / 2, (i - 2) * 0.16);
    fore.add(s);
  }
  // espinhos longos que se abrem do antebraço e da mão (como chamas de sangue)
  const spikes = [
    [0.55, 0.62, 0.5, 0.25], [0.7, 0.7, 0.15, -0.1], [0.5, 0.7, -0.35, 0.3], [0.45, 0.58, 0.9, -0.2],
    [0.6, 0.78, -0.7, 0.15], [0.38, 0.55, -1.2, 0.35], [0.42, 0.74, 1.4, -0.3],
  ];
  for (const [len, at, yaw, tilt] of spikes) {
    const s = bloodSpike(len * 1.15, 0.04, 0.14, mat);
    s.position.set(Math.sin(yaw) * 0.05, -foreLen * at, Math.cos(yaw) * 0.05);
    s.rotation.set(0.6 + tilt, yaw, 0.3);
    fore.add(s);
  }
  // fios soltos saindo do braço (sangue vivo)
  for (let i = 0; i < 5; i++) {
    const s = bloodSpike(0.18, 0.015, 0.06, mat);
    s.position.set(0, -upperLen * (0.3 + i * 0.15), 0);
    s.rotation.set(0.9 + (i % 3) * 0.2, (i / 5) * Math.PI * 2, 0.4);
    upper.add(s);
  }
  // aura de brilho tênue
  const glowU = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, upperLen, 10, 1, true), glowMat(0xff1030, 0.14));
  glowU.position.y = -upperLen / 2;
  upper.add(glowU);
  const glowF = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, foreLen + 0.15, 10, 1, true), glowMat(0xff1030, 0.14));
  glowF.position.y = -(foreLen + 0.15) / 2;
  fore.add(glowF);
  return { upper, fore };
}

// Arma de Sangue antiga (garra no antebraço) — usada só no modelo procedural de reserva
export function bloodClaw() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.32, 10), glowMat(0xff1030, 0.55));
  core.position.y = -0.15;
  g.add(core);
  const clawMat = toon(0x9b0010, { emissive: 0xff1020, emissiveIntensity: 0.9 });
  for (let i = -1; i <= 1; i++) {
    const shape = bladeShape(0.55, 0.05, 0.12, 0.5);
    const talon = new THREE.Mesh(extrude(shape, 0.02), clawMat);
    talon.position.set(i * 0.045, -0.3, 0.02);
    talon.rotation.set(0.2, Math.PI / 2, i * 0.18);
    talon.userData.outline = true;
    g.add(talon);
  }
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), glowMat(0xff2244, 0.35));
  shell.scale.set(1, 1.8, 1);
  shell.position.y = -0.2;
  g.add(shell);
  return g;
}

// Machado do Mutilador: cabo de madeira marrom e lâmina vermelha levemente triangular
export function mutilatorAxe() {
  // o modelo do Blender (tools/blender/npc_aguiar_axe.py, a partir da arte oficial): lâmina vermelha curva com o fio
  // gasto, olho e contrapeso de ferro, cabo com a empunhadura de couro, a corda amarrada e o sangue escorrendo
  const m = buildNpcModel('aguiar_axe', { outline: 0.006, noOutline: ['blood', 'rope', 'grip', 'edge'] });
  if (m) return m.root;
  const g = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.022, 0.028, 0.72, 8), 0x6a4428);
  handle.position.y = -0.22;
  g.add(handle);
  const grip = part(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), 0x2a1a10, { outline: false });
  grip.position.y = 0.06;
  g.add(grip);
  // cabeça: lâmina vermelha (cânone) desenhada no plano XY e girada para que o FIO aponte para a frente do golpe
  // (o machado pende da mão para -Y; com -π/2 o fio ficava virado para as costas do Aguiar)
  const head = new THREE.Group();
  head.rotation.y = Math.PI / 2;
  head.position.y = -0.5;
  g.add(head);
  const shape = new THREE.Shape();
  shape.moveTo(0.02, 0.06);
  shape.lineTo(0.17, 0.12);
  shape.quadraticCurveTo(0.215, 0, 0.17, -0.12);
  shape.lineTo(0.02, -0.06);
  shape.lineTo(0.02, 0.06);
  const blade = part(extrude(shape, 0.016), 0xb01818, { mat: toon(0xb01818, { emissive: 0x200000 }) });
  head.add(blade);
  // fio de aço: faixa curva que segue o gume e encosta na lâmina (antes era uma caixa solta do outro lado)
  const bit = new THREE.Shape();
  bit.moveTo(0.17, 0.12);
  bit.quadraticCurveTo(0.215, 0, 0.17, -0.12);
  bit.lineTo(0.205, -0.135);
  bit.quadraticCurveTo(0.255, 0, 0.205, 0.135);
  bit.lineTo(0.17, 0.12);
  const edge = part(extrude(bit, 0.01), 0xc8c4c0, { mat: toon(0xc8c4c0) });
  head.add(edge);
  // olho de ferro que prende a lâmina no cabo + contrapeso atrás
  const eye = part(new THREE.BoxGeometry(0.07, 0.15, 0.06), 0x2e2a2a);
  head.add(eye);
  const poll = part(new THREE.BoxGeometry(0.05, 0.08, 0.05), 0x2e2a2a);
  poll.position.x = -0.05;
  head.add(poll);
  // manchas de sangue escuro na lâmina
  for (const [x, y, r] of [[0.1, 0.03, 0.022], [0.14, -0.06, 0.016], [0.07, -0.03, 0.012]]) {
    for (const sz of [1, -1]) {
      const spot = part(new THREE.CircleGeometry(r, 8), 0x4a0408, { outline: false });
      spot.position.set(x, y, sz * 0.0125);
      if (sz < 0) spot.rotation.y = Math.PI;
      head.add(spot);
    }
  }
  return g;
}

// A Antena (Labirinto): cabo de ferro enrolado em arame, parabólica no topo e varetas espetadas.
// Empunhada no meio do cabo: a parabólica fica para cima/frente (-Y é a ponta de baixo, a "lança").
export function antenna() {
  const g = new THREE.Group();
  const iron = 0x4a4a4e;
  const pole = part(new THREE.CylinderGeometry(0.022, 0.026, 2.0, 8), iron);
  pole.position.y = -0.1;
  g.add(pole);
  // arame enrolado no cabo
  for (let i = 0; i < 14; i++) {
    const r = part(new THREE.TorusGeometry(0.028, 0.006, 4, 10), 0x6a6a70, { outline: false });
    r.rotation.x = Math.PI / 2 + 0.3;
    r.position.y = -0.7 + i * 0.09;
    g.add(r);
  }
  const head = new THREE.Group();
  head.position.y = -1.0; // na pose de luta o -Y do soquete aponta para cima: a parabólica fica no alto
  const dish = part(new THREE.SphereGeometry(0.21, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), 0x9a9a98, { mat: toon(0x9a9a98, { side: THREE.DoubleSide }) });
  dish.rotation.x = Math.PI * 1.4;
  dish.position.z = 0.08;
  head.add(dish);
  const feed = part(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 5), iron);
  feed.rotation.x = Math.PI / 2;
  feed.position.z = 0.24;
  head.add(feed);
  // varetas espetadas em volta (como raios)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const rod = part(new THREE.CylinderGeometry(0.006, 0.006, 0.36, 4), 0x5a5a60, { outline: false });
    rod.position.set(Math.cos(a) * 0.12, 0.12, Math.sin(a) * 0.12);
    rod.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1);
    head.add(rod);
  }
  g.add(head);
  // ponta de baixo (lança)
  const tip = part(new THREE.ConeGeometry(0.035, 0.22, 6), 0x6a6a70);
  tip.position.y = 0.9; // ponta de lança na outra extremidade
  g.add(tip);
  return g;
}

// Taco de baseball do Xande: madeira, fita na empunhadura, arame farpado e corrente até o braço
export function barbedBat() {
  // o modelo do Blender (tools/blender/npc_xande_bat.py): madeira, fita, arame farpado com as farpas, pregos e a corrente
  const m = buildNpcModel('xande_bat', { outline: 0.006, noOutline: ['tape', 'wire', 'nail'] });
  if (m) return m.root;
  const g = new THREE.Group();
  const wood = part(new THREE.CylinderGeometry(0.052, 0.024, 0.86, 10), 0x7a4a26);
  wood.position.y = -0.38;
  g.add(wood);
  const tape = part(new THREE.CylinderGeometry(0.027, 0.027, 0.22, 8), 0xd8d4c8);
  tape.position.y = 0.06;
  g.add(tape);
  for (let i = 0; i < 9; i++) {
    const w = part(new THREE.TorusGeometry(0.045 - i * 0.002, 0.005, 4, 10), 0x9a9aa0, { outline: false });
    w.rotation.x = Math.PI / 2 + (i % 2 ? 0.4 : -0.4);
    w.position.y = -0.7 + i * 0.065;
    g.add(w);
    // farpas
    const sp = part(new THREE.ConeGeometry(0.008, 0.035, 3), 0x9a9aa0, { outline: false });
    sp.position.set(Math.cos(i * 2.1) * 0.05, -0.7 + i * 0.065, Math.sin(i * 2.1) * 0.05);
    sp.rotation.z = Math.cos(i * 2.1) * -1.4;
    g.add(sp);
  }
  return g;
}

// LEONORA (Lírio): marreta de madeira enorme. Cabeça em forma de tambor (eixo em Z: as faces batem para a
// frente/trás do golpe) feita de tábuas, cintas de ferro com espinhos curtos de METAL cravados, a PATA dourada nas
// duas faces e um tufo de pelo branco no encaixe (a arte da wiki). Cabo comprido com faixa preta enrolada,
// empunhadura de couro e colar de ferro. Feita para parecer pesada.
export function leonora() {
  // o modelo do Blender (tools/blender/npc_leonora.py, pela arte oficial): o tambor com a pata dourada, as cintas de ferro
  // com os cravos, o tufo de pelo e o cabo com as faixas pretas. O de baixo (em código) fica de reserva.
  const m = buildNpcModel('leonora', { outline: 0.006, noOutline: ['fur', 'paw', 'wrap'] });
  if (m) return m.root;
  const g = new THREE.Group();
  const woodDark = 0x6a4224;
  const woodHead = 0x8a5a32;
  const iron = 0x3a3a40;
  // cabo: da ponta de baixo (pomo, +Y) até a cabeça (-Y)
  const handle = part(new THREE.CylinderGeometry(0.03, 0.036, 1.06, 10), woodDark);
  handle.position.y = -0.33;
  g.add(handle);
  const grip = part(new THREE.CylinderGeometry(0.038, 0.038, 0.3, 10), 0x3e2614);
  grip.position.y = 0.02;
  g.add(grip);
  for (let i = 0; i < 6; i++) {
    const wrapRing = part(new THREE.TorusGeometry(0.039, 0.005, 4, 10), 0x2a180a, { outline: false });
    wrapRing.rotation.x = Math.PI / 2 + 0.35;
    wrapRing.position.y = -0.1 + i * 0.05;
    g.add(wrapRing);
  }
  // faixa preta enrolada no meio do cabo (a arte)
  for (let i = 0; i < 8; i++) {
    const w2 = part(new THREE.TorusGeometry(0.035, 0.007, 4, 10), 0x141214, { outline: false });
    w2.rotation.x = Math.PI / 2 + (i % 2 ? 0.3 : -0.3);
    w2.position.y = -0.42 + i * 0.035;
    g.add(w2);
  }
  const pommel = part(new THREE.CylinderGeometry(0.045, 0.04, 0.05, 10), iron);
  pommel.position.y = 0.2;
  g.add(pommel);
  const collar = part(new THREE.CylinderGeometry(0.046, 0.04, 0.12, 10), iron);
  collar.position.y = -0.72;
  g.add(collar);
  // cabeça (tambor)
  const head = new THREE.Group();
  head.position.y = -0.88;
  g.add(head);
  const R = 0.17;
  const L = 0.46;
  const drum = part(new THREE.CylinderGeometry(R, R, L, 18), woodHead);
  drum.rotation.x = Math.PI / 2; // eixo do tambor em Z
  head.add(drum);
  // anéis da madeira nas faces (discos um pouco mais escuros)
  for (const z of [L / 2 + 0.002, -L / 2 - 0.002]) {
    const face = part(new THREE.CircleGeometry(R * 0.96, 18), 0x7a4c28, { outline: false });
    face.position.z = z;
    if (z < 0) face.rotation.y = Math.PI;
    head.add(face);
    for (const rr of [0.11, 0.06]) {
      const ring = part(new THREE.RingGeometry(rr, rr + 0.006, 18), 0x5a361a, { outline: false });
      ring.position.z = z + Math.sign(z) * 0.001;
      if (z < 0) ring.rotation.y = Math.PI;
      head.add(ring);
    }
  }
  // cintas de ferro nas bordas
  for (const z of [L / 2 - 0.03, -L / 2 + 0.03]) {
    const band = part(new THREE.TorusGeometry(R + 0.004, 0.014, 6, 22), iron);
    band.position.z = z;
    head.add(band);
  }
  // tábuas do barril (frisos escuros ao longo do comprimento)
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const plank = part(new THREE.BoxGeometry(0.006, 0.006, L - 0.07), 0x4a2c14, { outline: false });
    plank.position.set(Math.cos(a) * (R + 0.001), Math.sin(a) * (R + 0.001), 0);
    head.add(plank);
  }
  // espinhos CURTOS de metal cravados nas duas cintas (a arte da wiki)
  for (const z of [L / 2 - 0.03, -L / 2 + 0.03]) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const len = 0.055;
      const spike = part(new THREE.ConeGeometry(0.013, len, 5), 0xc8c8cc, { mat: toon(0xc8c8cc, { emissive: 0x18181c }) });
      spike.position.set(Math.cos(a) * (R + 0.012 + len / 2), Math.sin(a) * (R + 0.012 + len / 2), z);
      spike.rotation.z = a - Math.PI / 2;
      head.add(spike);
    }
  }
  // tufo de pelo branco no encaixe do cabo
  const tuft = part(new THREE.SphereGeometry(0.055, 10, 8), 0xe8e4dc);
  tuft.scale.set(1.1, 0.7, 1.1);
  tuft.position.y = R + 0.02;
  head.add(tuft);
  // PATA dourada nas duas faces: almofada + 4 dedos
  for (const sz of [1, -1]) {
    const paw = new THREE.Group();
    paw.position.z = sz * (L / 2 + 0.012);
    if (sz < 0) paw.rotation.y = Math.PI;
    const pad = part(new THREE.SphereGeometry(0.055, 12, 8), 0xd0a640, { mat: toon(0xd0a640, { emissive: 0x2a1a00 }) });
    pad.scale.set(1.15, 0.9, 0.25);
    pad.position.y = -0.025;
    paw.add(pad);
    for (const [x, y] of [[-0.062, 0.035], [-0.024, 0.07], [0.024, 0.07], [0.062, 0.035]]) {
      const toe = part(new THREE.SphereGeometry(0.024, 10, 6), 0xd0a640, { mat: toon(0xd0a640, { emissive: 0x2a1a00 }) });
      toe.scale.set(0.9, 1.15, 0.3);
      toe.position.set(x, y, 0);
      paw.add(toe);
    }
    head.add(paw);
  }
  g.userData.head = head; // ponto de impacto (poeira/faíscas) e onde a maldição de Sangue se enrosca
  return g;
}

// MAGNUM: revólver grande (o .38 da Kemi) de cano longo, preto com cabo de madeira
export function magnum() {
  const g = new THREE.Group();
  const grip = part(new THREE.BoxGeometry(0.03, 0.11, 0.045), 0x5a3a22);
  grip.position.set(0, 0.03, -0.01);
  grip.rotation.x = 0.25;
  g.add(grip);
  const frame = part(new THREE.BoxGeometry(0.03, 0.06, 0.07), 0x1c1c20);
  frame.position.set(0, -0.04, 0.02);
  g.add(frame);
  const drum = part(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 6), 0x2a2a30);
  drum.rotation.x = Math.PI / 2;
  drum.position.set(0, -0.05, 0.05);
  g.add(drum);
  const barrel = part(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 8), 0x1c1c20);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, -0.045, 0.17);
  g.add(barrel);
  return g;
}

// ESPADA CONSUMIDORA (Ferreiro): lâmina enorme e larga, cabo vermelho com pedras pretas; arma amaldiçoada.
// Empunhada no cabo (origem); a lâmina segue para -Y, o fio virado para +Z.
export function espadaConsumidora() {
  const g = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.03, 0.032, 0.38, 10), 0x8a1418);
  handle.position.y = 0.06;
  g.add(handle);
  for (const y of [0.18, 0.1, 0.02, -0.06]) {
    const stone = part(new THREE.OctahedronGeometry(0.022), 0x0a0a0c, { mat: toon(0x0a0a0c, { emissive: 0x150818 }) });
    stone.position.set(0, y, 0.03);
    g.add(stone);
  }
  const pommel = part(new THREE.SphereGeometry(0.04, 10, 8), 0x2a2a2e);
  pommel.position.y = 0.27;
  g.add(pommel);
  const guard = part(new THREE.BoxGeometry(0.06, 0.05, 0.32), 0x3a3a40);
  guard.position.y = -0.14;
  g.add(guard);
  const shape = new THREE.Shape();
  shape.moveTo(-0.09, 0);
  shape.lineTo(-0.1, -1.05);
  shape.lineTo(0, -1.3);
  shape.lineTo(0.1, -1.05);
  shape.lineTo(0.09, 0);
  shape.lineTo(-0.09, 0);
  const blade = part(extrude(shape, 0.022), 0x8a8c94, { mat: toon(0x8a8c94) });
  blade.rotation.y = -Math.PI / 2; // fio para a frente (+Z)
  blade.position.y = -0.16;
  g.add(blade);
  // sulco escuro no meio da lâmina
  const fuller = part(new THREE.BoxGeometry(0.03, 0.85, 0.03), 0x3a3a42, { outline: false });
  fuller.position.set(0, -0.62, 0);
  g.add(fuller);
  return g;
}

// FACA PREDADORA (Juan): faca bonita com a lâmina toda em ondas (como um kris), cabo escuro com anel de metal.
export function facaPredadora() {
  const g = new THREE.Group();
  const grip = part(new THREE.CylinderGeometry(0.02, 0.022, 0.12, 8), 0x2a1a1a);
  grip.position.y = 0.04;
  g.add(grip);
  const ring = part(new THREE.TorusGeometry(0.024, 0.006, 5, 10), 0xb8b8c0, { outline: false });
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.02;
  g.add(ring);
  // lâmina ondulada: contorno senoidal
  const s = new THREE.Shape();
  const len = 0.3;
  const N = 14;
  s.moveTo(-0.022, 0);
  for (let i = 1; i <= N; i++) { const t = i / N; s.lineTo(-0.022 * (1 - t * 0.85) + Math.sin(t * Math.PI * 5) * 0.01, -len * t); }
  for (let i = N; i >= 0; i--) { const t = i / N; s.lineTo(0.022 * (1 - t * 0.85) + Math.sin(t * Math.PI * 5) * 0.01, -len * t); }
  const blade = part(extrude(s, 0.006), 0xc8c8d0, { mat: toon(0xc8c8d0) });
  blade.rotation.y = -Math.PI / 2;
  blade.position.y = -0.03;
  g.add(blade);
  return g;
}

// Skate Caótico (na mão esquerda do Xande)
export function chaosSkate() {
  // o modelo do Blender (tools/blender/npc_xande_skate.py, a partir da arte oficial): guardas de metal, lâminas, rodas
  // vermelhas com espinhos dourados, a alça do escudo, "OCULTO" no shape e as runas verdes
  const m = buildNpcModel('xande_skate', { outline: 0.006, noOutline: ['rune', 'ink', 'rivet', 'spike'] });
  if (m) { m.root.userData.fromGlb = true; return m.root; }
  const g = new THREE.Group();
  const deck = part(new THREE.BoxGeometry(0.03, 0.78, 0.22), 0xe8bc22);
  deck.position.y = -0.3;
  g.add(deck);
  for (const y of [-0.04, -0.56]) for (const z of [-0.08, 0.08]) {
    const wh = part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8), 0x3a3a3a);
    wh.rotation.z = Math.PI / 2;
    wh.position.set(-0.045, y, z);
    g.add(wh);
    const spike = part(new THREE.ConeGeometry(0.012, 0.05, 4), 0xb8b8c0, { outline: false });
    spike.rotation.z = Math.PI / 2;
    spike.position.set(-0.085, y, z);
    g.add(spike);
  }
  const sig = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.62), glowMat(0x5aff6a, 0.4));
  sig.rotation.y = -Math.PI / 2;
  sig.position.set(-0.017, -0.3, 0);
  g.add(sig);
  return g;
}

// Escopeta calibre 12 da Erin (com um desenho na lateral)
export function shotgun() {
  const g = new THREE.Group();
  const stock = part(new THREE.BoxGeometry(0.05, 0.3, 0.1), 0x5a3a24);
  stock.position.set(0, 0.22, -0.02);
  g.add(stock);
  const body = part(new THREE.BoxGeometry(0.055, 0.22, 0.08), 0x232326);
  body.position.y = -0.04;
  g.add(body);
  const sticker = part(new THREE.PlaneGeometry(0.12, 0.05), 0xff3050, { outline: false });
  sticker.position.set(0.029, -0.04, 0);
  sticker.rotation.y = Math.PI / 2;
  g.add(sticker);
  const barrel = part(new THREE.CylinderGeometry(0.02, 0.02, 0.56, 8), 0x1c1c1e);
  barrel.position.set(0, -0.42, 0.015);
  g.add(barrel);
  const pump = part(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), 0x5a3a24);
  pump.position.set(0, -0.3, -0.02);
  g.add(pump);
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, -0.72, 0.015);
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

// Granada de mão (a que aparece na mão antes de arremessar)
export function handGrenade(color = 0xff3050) {
  const g = new THREE.Group();
  const body = part(new THREE.SphereGeometry(0.07, 10, 8), 0x3a4a2a);
  body.scale.set(1, 1.2, 1);
  body.position.y = -0.08;
  g.add(body);
  const band = part(new THREE.TorusGeometry(0.07, 0.014, 6, 12), color, { outline: false });
  band.rotation.x = Math.PI / 2;
  band.position.y = -0.08;
  g.add(band);
  const cap = part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), 0x8a8a90);
  cap.position.y = 0.0;
  g.add(cap);
  return g;
}

// Faixas (bandagens) enroladas em um membro: anéis claros + pontas soltas
export function wraps(len, radius, color = 0xd9d4c8, loose = true) {
  const g = new THREE.Group();
  const mat = toon(color);
  const n = Math.round(len / 0.035);
  for (let i = 0; i < n; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 4, 12), mat);
    r.rotation.x = Math.PI / 2 + (i % 2 ? 0.18 : -0.18);
    r.position.y = -i * 0.035;
    g.add(r);
  }
  if (loose) {
    for (const dx of [-0.02, 0.025]) {
      const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 0.22), new THREE.MeshToonMaterial({ color, side: THREE.DoubleSide }));
      tail.position.set(dx, -len - 0.08, -radius);
      tail.rotation.x = 0.15;
      g.add(tail);
    }
  }
  return g;
}

// MACHADO LANCINANTE (Balu): cabo longo de metal escuro com tiras de couro bege, pomo em CABEÇA DE PANTERA e uma
// lâmina larga de um lado só, ornamentada com saliências feitas à mão, com um esporão atrás. Duas mãos, mesma pegada
// da Leonora (pomo em +Y, cabeça em −Y; o fio aponta para a frente do golpe).
export function baluAxe() {
  const g = new THREE.Group();
  const iron = toon(0x2a2a30);
  const steel = toon(0xc4c4ca);
  const handle = part(new THREE.CylinderGeometry(0.026, 0.032, 1.08, 10), 0x4a3424); // cabo de madeira escura
  handle.position.y = -0.33;
  g.add(handle);
  // faixas de pano enroladas em espiral no cabo (empunhadura de cima e perto da cabeça), como na referência
  for (const [y0, len] of [[0.16, 0.5], [-0.58, 0.16]]) {
    const pts = [];
    const turns = len / 0.026; // faixa larga e apertada: as voltas quase se encostam
    for (let i = 0; i <= 120; i++) { const t = i / 120; const a = t * turns * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * 0.03, y0 - t * len, Math.sin(a) * 0.03)); }
    g.add(part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 320, 0.012, 5, false), 0xb8ae98, { outline: false }));
  }
  // pomo: cabeça de pantera (focinho, orelhas, olhos) em metal escuro
  const panther = new THREE.Group();
  panther.position.y = 0.25;
  g.add(panther);
  const skull = part(new THREE.SphereGeometry(0.05, 12, 10), 0x1e1e24, { mat: iron });
  skull.scale.set(1, 0.9, 1.15);
  panther.add(skull);
  const snout = part(new THREE.SphereGeometry(0.03, 10, 8), 0x1e1e24, { mat: iron });
  snout.position.set(0, -0.012, 0.045);
  panther.add(snout);
  for (const s of [-1, 1]) {
    const ear = part(new THREE.ConeGeometry(0.016, 0.035, 5), 0x1e1e24, { mat: iron });
    ear.position.set(s * 0.03, 0.045, -0.005);
    panther.add(ear);
    const eyeL = part(new THREE.SphereGeometry(0.007, 6, 4), 0xd8b040, { outline: false, mat: glowMat(0xd8b040, 0.9) });
    eyeL.position.set(s * 0.02, 0.012, 0.045);
    panther.add(eyeL);
  }
  // cabeça do machado (referência do usuário): lâmina GRANDE de um lado só, em barba (desce mais do que sobe), fio
  // largo e curvo em aço claro, miolo mais escuro com uma fileira de furos e gravações, ponta-lança no alto e um
  // gancho curvo atrás
  const head = new THREE.Group();
  head.rotation.y = Math.PI / 2;
  head.position.y = -0.8;
  g.add(head);
  const dark = toon(0x6e6e78);
  const outer = new THREE.Shape(); // contorno inteiro (aço claro do fio)
  outer.moveTo(0.03, 0.08);
  outer.lineTo(0.12, 0.12);
  outer.quadraticCurveTo(0.2, 0.2, 0.31, 0.22);
  outer.quadraticCurveTo(0.39, 0.02, 0.33, -0.26);
  outer.quadraticCurveTo(0.22, -0.3, 0.13, -0.17);
  outer.lineTo(0.03, -0.09);
  outer.lineTo(0.03, 0.08);
  head.add(part(extrude(outer, 0.018), 0xc8ccd2, { mat: steel }));
  const inner = new THREE.Shape(); // miolo escuro (por cima, nos dois lados)
  inner.moveTo(0.03, 0.07);
  inner.lineTo(0.12, 0.1);
  inner.quadraticCurveTo(0.18, 0.15, 0.25, 0.15);
  inner.quadraticCurveTo(0.3, 0.0, 0.26, -0.19);
  inner.quadraticCurveTo(0.19, -0.22, 0.12, -0.14);
  inner.lineTo(0.03, -0.08);
  inner.lineTo(0.03, 0.07);
  const innerM = part(extrude(inner, 0.024), 0x6e6e78, { mat: dark, outline: false });
  head.add(innerM);
  // fileira de furos e as gravações
  for (const [x, y] of [[0.09, 0.05], [0.13, 0.02], [0.17, -0.02], [0.21, -0.07], [0.13, -0.09]]) {
    for (const sz of [1, -1]) {
      const hole = part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 10), 0x16161a, { outline: false });
      hole.rotation.x = Math.PI / 2;
      hole.position.set(x, y, sz * 0.0135);
      head.add(hole);
    }
  }
  for (const sz of [1, -1]) {
    const eng = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.09, sz * 0.0135), new THREE.Vector3(0.18, 0.12, sz * 0.0135), new THREE.Vector3(0.26, 0.0, sz * 0.0135), new THREE.Vector3(0.22, -0.18, sz * 0.0135),
    ]), 16, 0.003, 4, false), toon(0x2a2a30));
    head.add(eng);
  }
  // olho de ferro (onde o cabo passa), ponta-lança no alto e gancho curvo atrás
  head.add(part(new THREE.BoxGeometry(0.08, 0.2, 0.07), 0x2a2a30, { mat: iron }));
  const spike = part(new THREE.ConeGeometry(0.022, 0.16, 6), 0xc8ccd2, { mat: steel });
  spike.position.y = 0.17;
  head.add(spike);
  const hook = new THREE.Shape();
  hook.moveTo(-0.03, 0.05);
  hook.quadraticCurveTo(-0.12, 0.06, -0.17, -0.02);
  hook.quadraticCurveTo(-0.11, 0.0, -0.03, -0.03);
  hook.lineTo(-0.03, 0.05);
  head.add(part(extrude(hook, 0.016), 0xc8ccd2, { mat: steel }));
  // veias vermelhas na lâmina (o Diabo amaldiçoou o machado): finas, coladas nos dois lados
  const veinMat = toon(0x8a0a14, { emissive: 0x3a0004 });
  for (const sz of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const pts = [];
      for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push(new THREE.Vector3(0.05 + t * 0.22, (k - 1.5) * 0.06 * (1 - t * 0.4) + Math.sin(t * 6 + k) * 0.012, sz * 0.0145)); }
      const vein = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.004, 4, false), veinMat);
      head.add(vein);
    }
  }
  return g;
}

// MACHADO DEMÔNIO (Balu): o pomo de pantera cravado no peito faz o sangue escorrer e, no lugar da lâmina, nasce uma
// MAÇA-ESTRELA de sangue (bola espinhosa vermelho-escura). Mesmo cabo; trocado com o machado pela habilidade.
export function demonMace() {
  const g = new THREE.Group();
  const mat = bloodMaterial();
  const handle = part(new THREE.CylinderGeometry(0.026, 0.032, 1.08, 10), 0x26262c, { mat: toon(0x2a2a30) });
  handle.position.y = -0.33;
  g.add(handle);
  const ball = new THREE.Group();
  ball.position.y = -0.96;
  g.add(ball);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), mat);
  core.userData.outline = true;
  ball.add(core);
  // espinhos em todas as direções (distribuição de Fibonacci na esfera)
  const n = 26;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.399963;
    const dir = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    const len = 0.12 + (i % 3) * 0.04;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, len, 6), mat);
    spike.position.copy(dir).multiplyScalar(0.15 + len / 2);
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    ball.add(spike);
  }
  // sangue escorrendo pelo cabo
  for (let k = 0; k < 3; k++) {
    const drip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.004, 0.22 + k * 0.08, 6), mat);
    drip.position.set(Math.cos(k * 2.1) * 0.03, -0.72 + k * 0.05, Math.sin(k * 2.1) * 0.03);
    g.add(drip);
  }
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), glowMat(0xff1030, 0.16));
  glow.position.y = -0.96;
  g.add(glow);
  return g;
}

// Máscara de gás tecnológica (a da Produção do Anfitrião que a Erin adaptou e passou a usar no lugar dos óculos),
// no estilo da referência do usuário: borracha preta cobrindo dos olhos ao queixo, duas lentes redondas com aro que
// BRILHAM em verde, o filtro redondo na frente da boca, um cartucho grande na bochecha direita e tubos verdes
// brilhantes descendo do rosto até o peito. Presa no socket `mouth` (frente do rosto, eixo +z para fora, y para cima).
// CELESTINE — as MACHADINHAS (wiki "Celestine" → Arsenal: "duas pequenas machadinhas com detalhes talhados em azul...
// conectados por uma corrente"; a arte "Machados de Celestine em Calamidade"): o cabo escuro com o anel turquesa perto
// da lâmina, a LÂMINA turquesa em crescente com as pontas em espinho e os talhos azuis, e o elo onde a corrente prende no
// pomo. Convenção de arma: empunhadura na origem, a cabeça para −Y. userData.ring: de onde sai a corrente.
export function chainHatchet() {
  const g = new THREE.Group();
  // metal escuro (a wiki: "com detalhes talhados em azul" — o azul é dos talhos, não da lâmina)
  const teal = toon(0x5c666e, { emissive: 0x0a1418 });
  const carve = glowMat(0x5ad8ff, 0.9);
  const wood = 0x2a1e18;
  const handle = part(new THREE.CylinderGeometry(0.015, 0.018, 0.34, 8), wood);
  handle.position.y = -0.1;
  g.add(handle);
  // a faixa de couro na empunhadura
  for (let k = 0; k < 4; k++) {
    const w = part(new THREE.TorusGeometry(0.019, 0.004, 4, 10), 0x15100c);
    w.rotation.x = Math.PI / 2;
    w.position.y = 0.02 - k * 0.025;
    g.add(w);
  }
  // o anel turquesa perto da cabeça e o pomo com o elo da corrente
  const ring = part(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 10), 0, { mat: teal });
  ring.position.y = -0.24;
  g.add(ring);
  const pommel = part(new THREE.SphereGeometry(0.02, 8, 6), 0, { mat: teal });
  pommel.position.y = 0.075;
  g.add(pommel);
  const link = part(new THREE.TorusGeometry(0.016, 0.004, 4, 10), 0x3a3c40);
  link.position.y = 0.1;
  g.add(link);
  g.userData.ring = link;
  // a LÂMINA em crescente com as pontas (para a frente, +X), presa no topo do cabo
  const s = new THREE.Shape();
  s.moveTo(0, -0.22);
  s.quadraticCurveTo(0.07, -0.19, 0.12, -0.12); // ponta de cima
  s.lineTo(0.1, -0.2);
  s.quadraticCurveTo(0.15, -0.26, 0.13, -0.33); // o gume em arco
  s.lineTo(0.16, -0.4); // ponta de baixo
  s.quadraticCurveTo(0.07, -0.33, 0.0, -0.3);
  s.lineTo(-0.035, -0.32); // o espinho de trás
  s.lineTo(-0.01, -0.27);
  s.lineTo(-0.04, -0.22);
  s.lineTo(0, -0.22);
  const blade = part(extrude(s, 0.012), 0, { mat: teal });
  g.add(blade);
  // os talhos azuis acesos na lâmina
  const groove = new THREE.Shape();
  groove.moveTo(0.02, -0.25);
  groove.quadraticCurveTo(0.07, -0.24, 0.1, -0.27);
  groove.lineTo(0.1, -0.29);
  groove.quadraticCurveTo(0.07, -0.265, 0.02, -0.27);
  for (const z of [0.0085, -0.0085]) {
    const gr = new THREE.Mesh(new THREE.ShapeGeometry(groove), carve);
    gr.position.z = z;
    if (z < 0) gr.rotation.y = Math.PI, gr.position.x = 0.12;
    g.add(gr);
  }
  return g;
}

// A MÁSCARA DO DESESPERO (a Relíquia de Conhecimento — wiki "Relíquias da Calamidade"): branca, com TRÊS GRANDES SULCOS
// descendo dos olhos e da boca até a borda, a fenda em CORAÇÃO INVERTIDO no nariz (como uma caveira) e o Símbolo da
// Relíquia de Conhecimento cravado na testa. A Celestine a coloca na Transformação (a forma Celestine, a Magistrada).
let despairTex = null;
function despairTexture() {
  if (despairTex) return despairTex;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#f2efe8';
  x.fillRect(0, 0, 256, 256);
  // o mapa da meia-esfera: u = de um lado ao outro (centro = 128), v = de cima (0) para baixo
  x.fillStyle = '#0a0808';
  for (const s of [-1, 1]) {
    // os olhos: fendas fundas e o SULCO que desce dela até a borda
    x.beginPath(); x.ellipse(128 + s * 34, 112, 16, 9, s * 0.15, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.moveTo(128 + s * 26, 116); x.quadraticCurveTo(128 + s * 36, 180, 128 + s * 30, 256); x.lineTo(128 + s * 44, 256); x.quadraticCurveTo(128 + s * 46, 180, 128 + s * 42, 116); x.fill();
  }
  // a boca e o sulco do meio até a borda
  x.beginPath(); x.ellipse(128, 176, 18, 7, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.moveTo(122, 178); x.lineTo(118, 256); x.lineTo(138, 256); x.lineTo(134, 178); x.fill();
  // a fenda de CORAÇÃO INVERTIDO no nariz
  x.beginPath(); x.moveTo(128, 128); x.bezierCurveTo(110, 136, 116, 156, 128, 150); x.bezierCurveTo(140, 156, 146, 136, 128, 128); x.fill();
  // o Símbolo da Relíquia de Conhecimento na testa (círculo duplo com o triângulo e os traços)
  x.strokeStyle = '#7a6a30';
  x.lineWidth = 3;
  x.beginPath(); x.arc(128, 62, 20, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.arc(128, 62, 13, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.moveTo(128, 46); x.lineTo(142, 72); x.lineTo(114, 72); x.closePath(); x.stroke();
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; x.beginPath(); x.moveTo(128 + Math.cos(a) * 20, 62 + Math.sin(a) * 20); x.lineTo(128 + Math.cos(a) * 27, 62 + Math.sin(a) * 27); x.stroke(); }
  despairTex = new THREE.CanvasTexture(c);
  despairTex.colorSpace = THREE.SRGBColorSpace;
  return despairTex;
}
export function despairMask() {
  const g = new THREE.Group();
  const mat = new THREE.MeshToonMaterial({ map: despairTexture(), color: 0xffffff });
  // a metade da frente (+z): com phi de 0 a π, o meio da textura (u = 0,5) cai bem na frente
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.118, 22, 14, 0, Math.PI, 0, Math.PI), mat);
  shell.scale.set(1, 1.24, 0.82);
  shell.position.set(0, 0.03, -0.03);
  shell.userData.outline = true;
  g.add(shell);
  return g;
}

// GAIUS: a MAÇA pequena de ferro, de uma mão, com o cabo enrolado em couro (wiki "Gaius" — Arsenal). Cabo em y, a
// cabeça em cima (o pulso segura embaixo, como as outras armas de uma mão)
export function ironMace() {
  const g = new THREE.Group();
  const iron = toon(0x5a5c62);
  const handle = part(new THREE.CylinderGeometry(0.016, 0.018, 0.4, 8), 0x3a2a1e);
  handle.position.y = -0.04;
  g.add(handle);
  for (let k = 0; k < 5; k++) { // o couro enrolado na base
    const w = part(new THREE.TorusGeometry(0.02, 0.005, 4, 10), 0x24180f);
    w.rotation.x = Math.PI / 2;
    w.position.y = -0.18 + k * 0.024;
    g.add(w);
  }
  const head = part(new THREE.SphereGeometry(0.055, 12, 10), 0, { mat: iron });
  head.position.y = 0.2;
  g.add(head);
  for (let k = 0; k < 6; k++) { // os flanges de ferro
    const fl = part(new THREE.BoxGeometry(0.016, 0.1, 0.05), 0, { mat: iron });
    const a = (k / 6) * Math.PI * 2;
    fl.position.set(Math.cos(a) * 0.05, 0.2, Math.sin(a) * 0.05);
    fl.rotation.y = -a;
    g.add(fl);
  }
  const cap = part(new THREE.ConeGeometry(0.025, 0.05, 6), 0, { mat: iron });
  cap.position.y = 0.27;
  g.add(cap);
  return g;
}

// AMPHITRUO: a MÁSCARA da Relíquia de Energia no rosto do Gaius (wiki "Amphitruo" e a "Máscara de Amphitruo"): metal
// cinza-prateado "em constante transformação", SORRISO LARGO de dentes à mostra, olhos pequenos apertados de riso, a
// superfície toda em SULCOS ondulados (como metal derretido) e TRÊS MÃOS de metal que saem das bordas e seguram o rosto,
// fundidas a ele — uma na testa, uma no queixo e a de cima com os dedos subindo como coroa
// a máscara ESCULPIDA: uma meia-esfera deformada vértice a vértice — maçãs do rosto saltadas pelo sorriso, a boca
// afundada em meia-lua de canto a canto, os olhos apertados afundados, a testa alta e as ONDULAÇÕES concêntricas em
// relevo. As cores vêm da própria forma (cor por vértice): o fundo da boca e dos olhos escuro, os sulcos mais escuros,
// o metal mais claro nas cristas — assim o desenho nunca sai do lugar do relevo
const AMPH_R = 0.13;
const smileY = (x) => -0.4 + 0.85 * x * x; // a curva da boca (os cantos sobem)
function amphitruoFace() {
  const geo = new THREE.SphereGeometry(AMPH_R, 72, 56, 0, Math.PI, 0, Math.PI);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  const g2 = (x, y, cx, cy, s) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / s);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const { x, y, z } = v;
    const front = Math.max(0, z);
    let r = 1;
    // maçãs do rosto empurradas para cima pelo sorriso
    r += 0.09 * front * (g2(x, y, 0.5, -0.18, 0.025) + g2(x, y, -0.5, -0.18, 0.025));
    // o queixo para a frente
    r += 0.06 * front * g2(x, y, 0, -0.78, 0.05);
    // a BOCA: uma meia-lua afundada de canto a canto (aberta no meio, fechando nos cantos)
    const open = Math.max(0, 1 - (x / 0.62) ** 2); // altura da boca: máxima no meio
    const dy = y - smileY(x);
    const inMouth = Math.abs(x) < 0.62 && dy < 0.03 && dy > -0.08 - 0.26 * open;
    if (inMouth) r -= 0.2 * front * Math.min(1, open * 2.5);
    // os OLHOS apertados de riso: duas meias-luas finas, os cantos de fora caindo
    let inEye = false;
    for (const s of [-1, 1]) {
      const ex = x - s * 0.34;
      const top = 0.16 - 2.6 * ex * ex;
      if (Math.abs(ex) < 0.17 && y < top && y > top - 0.05) { r -= 0.07 * front; inEye = true; }
    }
    // o sulco do nariz e as rugas de riso nos cantos da boca
    r -= 0.025 * front * g2(x, y, 0, -0.05, 0.002);
    for (const s of [-1, 1]) r -= 0.02 * front * Math.exp(-(((x - s * 0.66) ** 2) / 0.002 + ((y + 0.22) ** 2) / 0.03));
    // as ONDULAÇÕES concêntricas (centro na testa), mais fortes longe da boca
    const ring = Math.sin(Math.hypot(x * 1.1, (y - 0.42) * 0.9) * 46 + Math.sin(Math.atan2(y - 0.42, x) * 5) * 0.8);
    const wave = 0.016 * ring * (inMouth || inEye ? 0 : 1);
    r += wave;
    v.multiplyScalar(r * AMPH_R);
    pos.setXYZ(i, v.x, v.y * 1.18, v.z * 0.92); // comprida e um pouco achatada
    // cor: o metal (mais claro nas cristas), os sulcos escuros, a boca e os olhos quase pretos
    let c = 0.36 + 0.09 * ring; // cinza-prateado (o claro demais estourava na luz roxa)
    if (inMouth) c = 0.07;
    if (inEye) c = 0.06;
    if (z < 0.05) c *= 0.75; // a borda de trás
    col[i * 3] = c * 0.98;
    col[i * 3 + 1] = c;
    col[i * 3 + 2] = c * 1.06;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const face = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ vertexColors: true }));
  face.userData.outline = true;
  // os DENTES: uma fileira em cima, seguindo o sorriso, um pouco para dentro da boca
  const tooth = new THREE.MeshBasicMaterial({ color: 0xf2efe6 }); // sem sombra: sempre claros contra o fundo da boca
  const teeth = new THREE.Group();
  for (let k = 0; k < 12; k++) {
    const x = -0.47 + (k / 11) * 0.94;
    const y = smileY(x) - 0.03;
    const z = Math.sqrt(Math.max(0.01, 1 - x * x - y * y)) * 0.97; // logo atrás do lábio, à frente do fundo da boca
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.02, 0.008), tooth);
    t.position.set(x * AMPH_R, y * AMPH_R * 1.18, z * AMPH_R * 0.92);
    t.lookAt(t.position.clone().multiplyScalar(2));
    teeth.add(t);
  }
  const g = new THREE.Group();
  g.add(face, teeth);
  return g;
}

// uma mão de metal: palma, quatro dedos de duas falanges curvados (agarrando) e o polegar; dedos para +y, palma +z
function metalHand(mat, { spread = 0.16, curl = 0.5, len = 1 } = {}) {
  const g = new THREE.Group();
  const palm = part(new THREE.BoxGeometry(0.07, 0.075, 0.022), 0, { mat });
  g.add(palm);
  for (let k = 0; k < 4; k++) {
    const L = (k === 1 || k === 2 ? 0.05 : 0.042) * len;
    const base = new THREE.Group();
    base.position.set(-0.026 + k * 0.0175, 0.036, 0);
    base.rotation.z = (k - 1.5) * -spread;
    base.rotation.x = curl * 0.6;
    const p1 = part(new THREE.CylinderGeometry(0.0072, 0.0082, L, 6), 0, { mat });
    p1.position.y = L / 2;
    base.add(p1);
    const mid = new THREE.Group();
    mid.position.y = L;
    mid.rotation.x = curl;
    const p2 = part(new THREE.CylinderGeometry(0.0058, 0.007, L * 0.8, 6), 0, { mat });
    p2.position.y = (L * 0.8) / 2;
    mid.add(p2);
    const nail = part(new THREE.ConeGeometry(0.0058, 0.012, 5), 0, { mat });
    nail.position.y = L * 0.8 + 0.005;
    mid.add(nail);
    base.add(mid);
    g.add(base);
  }
  const th = new THREE.Group();
  th.position.set(0.036, -0.012, 0.004);
  th.rotation.z = -0.95;
  th.rotation.x = curl * 0.5;
  const tp = part(new THREE.CylinderGeometry(0.0075, 0.0085, 0.05, 6), 0, { mat });
  tp.position.y = 0.025;
  th.add(tp);
  g.add(th);
  return g;
}

export function amphitruoMask() {
  const g = new THREE.Group();
  const metal = toon(0x8e9098);
  const face = amphitruoFace();
  face.position.set(0, 0.04, -0.03);
  g.add(face);
  // as TRÊS MÃOS fundidas ao rosto (a arte dos Anfitriões): nascem nas BORDAS da máscara, a palma virada para o rosto e
  // os dedos curvados POR CIMA dele — a da esquerda agarra a testa e a têmpora, a da direita o queixo e a bochecha; a
  // de cima sobe atrás da cabeça com os dedos abertos como uma coroa
  const hL = metalHand(metal, { curl: 0.75, spread: 0.12 });
  hL.position.set(0.125, 0.09, 0.0);
  hL.rotation.set(0, -Math.PI / 2, 0.55); // palma para o rosto (−x), dedos subindo e entrando na testa
  hL.scale.setScalar(1.3);
  g.add(hL);
  const hR = metalHand(metal, { curl: 0.8, spread: 0.12 });
  hR.position.set(-0.125, -0.06, 0.02);
  hR.rotation.set(0, Math.PI / 2, Math.PI + 0.45); // palma para o rosto (+x), dedos descendo e segurando o queixo
  hR.scale.setScalar(1.3);
  g.add(hR);
  const hT = metalHand(metal, { spread: 0.36, curl: 0.1, len: 1.3 });
  hT.position.set(0.0, 0.2, -0.06);
  hT.rotation.set(-0.25, 0, 0);
  hT.scale.setScalar(1.25);
  g.add(hT);  return g;
}

// CHAMAS DE ENERGIA (Celestine nas miniaturas de Calamidade): línguas de fogo azul-turquesa saindo do corpo e do cabelo.
// Cada língua é uma gota (torno) em duas camadas somadas (fora turquesa, dentro quase branca) que tremula sozinha no
// onBeforeRender — anda na luta, na seleção e nos retratos sem precisar de atualização de fora.
const FLAME_GEO = (() => {
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10; // 0 = base, 1 = ponta
    pts.push(new THREE.Vector2(Math.sin(Math.min(1, t * 1.6) * Math.PI) * 0.5 * (1 - t) ** 0.8 + (t < 0.05 ? 0.2 : 0), t));
  }
  return new THREE.LatheGeometry(pts, 8);
})();
const _flameQ = new THREE.Quaternion();
export function energyFlames(color = 0x3ae8ff, { count = 5, radius = 0.08, height = 0.24, width = 0.07, lean = 0 } = {}) {
  const g = new THREE.Group();
  // somadas umas às outras estouram para o branco: o turquesa vai mais escuro e a de dentro mais fraca
  const outer = glowMat(new THREE.Color(color).multiplyScalar(0.62), 0.5);
  const inner = glowMat(0x5ae0f0, 0.32);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    const r = radius * (0.6 + Math.random() * 0.4);
    const h = height * (0.65 + Math.random() * 0.55);
    const tongue = new THREE.Group();
    tongue.position.set(Math.cos(a) * r, -h * 0.25, Math.sin(a) * r);
    const tilt = [Math.sin(a) * 0.3 + lean, -Math.cos(a) * 0.3]; // abre para fora do corpo
    tongue.rotation.set(tilt[0], 0, tilt[1]);
    const o = new THREE.Mesh(FLAME_GEO, outer);
    o.scale.set(width, h, width);
    const n = new THREE.Mesh(FLAME_GEO, inner);
    n.scale.set(width * 0.45, h * 0.6, width * 0.45);
    tongue.add(o, n);
    const phase = Math.random() * 10;
    const speed = 7 + Math.random() * 5;
    o.onBeforeRender = () => {
      // o fogo sobe sempre para cima, qualquer que seja a pose do osso (vale no quadro seguinte)
      if (i === 0 && g.parent) g.quaternion.copy(g.parent.getWorldQuaternion(_flameQ).invert());
      const t = performance.now() / 1000 * speed + phase;
      tongue.scale.set(1 + Math.sin(t * 1.3) * 0.12, 1 + Math.sin(t) * 0.22 + Math.sin(t * 2.7) * 0.08, 1);
      tongue.rotation.y = Math.sin(t * 0.4) * 0.5;
      // a ponta balança (a chama ondula em vez de ficar parada como vela)
      tongue.rotation.x = tilt[0] + Math.sin(t * 0.9) * 0.22;
      tongue.rotation.z = tilt[1] + Math.cos(t * 0.7) * 0.22;
    };
    g.add(tongue);
  }
  g.userData.noShadow = true;
  return g;
}

// MÁSCARAS DA SEITA (wiki "Seita das Máscaras"): cada membro tem a sua — branca, preta ou riscada de vermelho. A do
// NATHANIEL: branca, o coração dourado invertido no alto, estrelas de quatro pontas em volta dos olhos e lágrimas pretas.
// Mesmo mapa da Máscara do Desespero (meia-esfera: u = de um lado ao outro, centro 128; v = de cima para baixo).
export const SEITA_MASKS = ['nathaniel', 'riscos', 'negra', 'sorriso'];
const seitaTex = {};
function seitaTexture(kind) {
  if (seitaTex[kind]) return seitaTex[kind];
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const x = c.getContext('2d');
  const dark = kind === 'negra';
  const ink = dark ? '#d8d4cc' : '#121014';
  x.fillStyle = dark ? '#1c1a1e' : '#eeebe4';
  x.fillRect(0, 0, 256, 256);
  // os olhos: fendas vazadas
  x.fillStyle = dark ? '#000' : '#0a0808';
  for (const s of [-1, 1]) { x.beginPath(); x.ellipse(128 + s * 34, 112, 15, 8, s * 0.12, 0, Math.PI * 2); x.fill(); }
  if (kind === 'nathaniel') {
    x.fillStyle = '#d0a040'; // o coração dourado invertido
    x.beginPath(); x.moveTo(128, 30); x.bezierCurveTo(100, 46, 106, 74, 120, 72); x.lineTo(128, 64); x.lineTo(136, 72); x.bezierCurveTo(150, 74, 156, 46, 128, 30); x.fill();
    x.strokeStyle = ink; x.lineWidth = 2.5;
    for (const s of [-1, 1]) {
      const ex = 128 + s * 34;
      x.beginPath();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const r = i % 2 ? 9 : 24; x[i ? 'lineTo' : 'moveTo'](ex + Math.cos(a) * r, 112 + Math.sin(a) * r); }
      x.closePath(); x.stroke();
      x.fillStyle = ink; x.beginPath(); x.moveTo(ex - 4, 134); x.quadraticCurveTo(ex, 176, ex + 4, 134); x.fill(); // a lágrima preta
    }
  } else if (kind === 'riscos') {
    x.strokeStyle = '#a01820'; x.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const px = 70 + i * 24; x.lineWidth = 3 + (i % 2) * 2; x.beginPath(); x.moveTo(px, 30 + (i % 3) * 18); x.lineTo(px + 14 - (i % 2) * 20, 240 - (i % 3) * 22); x.stroke(); }
    x.fillStyle = ink; x.fillRect(110, 172, 36, 4); // a boca: um corte reto
  } else if (kind === 'negra') {
    x.strokeStyle = ink; x.lineWidth = 2;
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(128 + s * 18, 100); x.lineTo(128 + s * 60, 86); x.stroke(); } // sobrancelhas riscadas
    x.beginPath(); x.moveTo(128, 30); x.lineTo(128, 82); x.stroke();
  } else {
    // o SORRISO: branca, sem nariz, o sorriso largo e fino de orelha a orelha
    x.strokeStyle = ink; x.lineWidth = 4; x.lineCap = 'round';
    x.beginPath(); x.moveTo(78, 160); x.quadraticCurveTo(128, 206, 178, 160); x.stroke();
    for (let i = 0; i < 7; i++) { const px = 92 + i * 12; const py = 160 + Math.sin(((i + 1) / 8) * Math.PI) * 22; x.lineWidth = 2; x.beginPath(); x.moveTo(px, py - 7); x.lineTo(px, py + 7); x.stroke(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  seitaTex[kind] = t;
  return t;
}

export function seitaMask(kind = 'nathaniel') {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.118, 22, 14, 0, Math.PI, 0, Math.PI), new THREE.MeshToonMaterial({ map: seitaTexture(kind), color: 0xffffff }));
  shell.scale.set(1, 1.24, 0.82);
  shell.position.set(0, 0.03, -0.03);
  shell.userData.outline = true;
  g.add(shell);
  return g;
}

export function gasMask(glow = 0x7aff9a) {
  const g = new THREE.Group();
  const RUBBER = 0x15171a;
  // concha de borracha (metade da frente de uma esfera achatada) cobrindo olhos, nariz e boca
  const shell = part(new THREE.SphereGeometry(0.115, 18, 12, 0, Math.PI, 0, Math.PI), RUBBER); // metade da frente (+z)
  shell.scale.set(1, 1.18, 0.85);
  shell.position.set(0, 0.015, -0.035);
  g.add(shell);
  // lentes: aro grosso + vidro verde brilhando + halo
  for (const s of [-1, 1]) {
    const rim = part(new THREE.CylinderGeometry(0.036, 0.04, 0.03, 18), 0x2a2d30);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0.045 * s, 0.06, 0.06);
    g.add(rim);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.03, 18), glowMat(glow, 0.95));
    lens.position.set(0.045 * s, 0.06, 0.077);
    g.add(lens);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.05, 18), glowMat(glow, 0.25));
    halo.position.set(0.045 * s, 0.06, 0.08);
    g.add(halo);
  }
  // filtro redondo na frente da boca (bocal + tampa com grade)
  const snout = part(new THREE.CylinderGeometry(0.034, 0.042, 0.05, 16), 0x24272b);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.035, 0.085);
  g.add(snout);
  const cap = part(new THREE.CylinderGeometry(0.044, 0.044, 0.018, 16), 0x3a3f44);
  cap.rotation.x = Math.PI / 2;
  cap.position.set(0, -0.035, 0.115);
  g.add(cap);
  // cartucho grande na bochecha direita, apontando para a frente e para fora
  const can = part(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 16), 0x1e2124);
  can.rotation.set(Math.PI / 2, 0, 0);
  can.rotation.y = -0.6;
  can.position.set(-0.085, -0.04, 0.06);
  g.add(can);
  const canCap = part(new THREE.CylinderGeometry(0.043, 0.043, 0.015, 16), 0x4a4f54);
  canCap.rotation.set(Math.PI / 2, 0, 0);
  canCap.rotation.y = -0.6;
  canCap.position.set(-0.11, -0.04, 0.1);
  g.add(canCap);
  // tubos verdes brilhantes: do queixo descendo pelo pescoço até o peito (um de cada lado)
  for (const s of [-1, 1]) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.025 * s, -0.07, 0.07),
      new THREE.Vector3(0.07 * s, -0.16, 0.05),
      new THREE.Vector3(0.1 * s, -0.27, 0.03),
      new THREE.Vector3(0.08 * s, -0.4, 0.05),
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(path, 16, 0.009, 6, false), glowMat(glow, 0.9));
    g.add(tube);
  }
  // alças pretas em volta da cabeça
  for (const y of [0.075, -0.02]) {
    const strap = part(new THREE.TorusGeometry(0.105, 0.01, 5, 20), RUBBER);
    strap.rotation.x = Math.PI / 2;
    strap.position.set(0, y, -0.06);
    g.add(strap);
  }
  return g;
}

// ESPADA DO ARNALDO (Arnaldo Fritz e, depois da morte dele, o Senhor Veríssimo), como na referência do usuário:
// espada comum, sem nada paranormal — lâmina reta e longa, cinza-escura com o fio claro e ponta em bico; guarda
// pequena preta e retangular; cabo enrolado em fita bege (losangos) e as duas FITAS VINHO longas presas na guarda,
// caindo soltas. Empunhada no cabo (origem); a lâmina segue para -Y, o fio virado para +Z.
export function swordArnaldo() {
  const g = new THREE.Group();
  // cabo: fita bege enrolada (faixas inclinadas mais escuras por cima)
  const grip = part(new THREE.CylinderGeometry(0.02, 0.021, 0.24, 10), 0xd8ccae);
  grip.position.y = 0.07;
  g.add(grip);
  for (let k = 0; k < 5; k++) {
    const band = part(new THREE.TorusGeometry(0.021, 0.0035, 4, 12), 0x8a7a5a, { outline: false });
    band.rotation.set(Math.PI / 2 + 0.45, 0, 0);
    band.position.y = -0.03 + k * 0.045;
    g.add(band);
  }
  const cap = part(new THREE.CylinderGeometry(0.022, 0.018, 0.02, 10), 0x1a1a1c);
  cap.position.y = 0.2;
  g.add(cap);
  // guarda: placa preta retangular
  const guard = part(new THREE.BoxGeometry(0.045, 0.028, 0.13), 0x141416);
  guard.position.y = -0.065;
  g.add(guard);
  // lâmina: corpo cinza-escuro + fio claro na frente
  const body = new THREE.Shape();
  body.moveTo(-0.026, 0);
  body.lineTo(-0.024, -0.86);
  body.lineTo(0.004, -0.97);
  body.lineTo(0.026, -0.84);
  body.lineTo(0.026, 0);
  body.lineTo(-0.026, 0);
  const blade = part(extrude(body, 0.009), 0x5c6068, { mat: toon(0x5c6068, { emissive: 0x101418 }) });
  blade.rotation.y = -Math.PI / 2;
  blade.position.y = -0.08;
  g.add(blade);
  const edge = new THREE.Shape();
  edge.moveTo(0.012, 0);
  edge.lineTo(0.012, -0.84);
  edge.lineTo(0.004, -0.95);
  edge.lineTo(0.028, -0.84);
  edge.lineTo(0.028, 0);
  edge.lineTo(0.012, 0);
  const edgeM = part(extrude(edge, 0.011), 0xd8dde4, { outline: false, mat: toon(0xd8dde4, { emissive: 0x202830 }) });
  edgeM.rotation.y = -Math.PI / 2;
  edgeM.position.y = -0.08;
  g.add(edgeM);
  // as duas fitas VERMELHAS presas na guarda: tiras com FÍSICA própria (balançam no idle, na corrida, nos golpes e no dash)
  const RIBBON = 0xd01c30;
  const knot = part(new THREE.TorusGeometry(0.02, 0.008, 6, 12), RIBBON, { outline: false, mat: toon(RIBBON, { emissive: RIBBON }) });
  knot.material.emissiveIntensity = 0.7;
  knot.material.userData.baseEmissive = { color: new THREE.Color(RIBBON), intensity: 0.7 };
  knot.position.y = -0.04;
  knot.rotation.x = Math.PI / 2;
  g.add(knot);
  g.add(physicsRibbon(new THREE.Vector3(0, -0.04, -0.012), 0.46, 0.05, RIBBON, 0.6));
  g.add(physicsRibbon(new THREE.Vector3(0, -0.04, 0.012), 0.38, 0.044, RIBBON, -0.5));
  g.userData.tipLength = 1.05;
  return g;
}

// RELÓGIO DE BOLSO de ouro do Arnaldo (com a foto do Thiago). `relic`: dentro da tampa está a Relíquia de Energia
// (brilho roxo/rosa/azul). A tampa (userData.lid) abre girando no eixo da dobradiça.
export function pocketWatch({ relic = false } = {}) {
  const g = new THREE.Group();
  const GOLD = 0xd4a640;
  const caseM = part(new THREE.CylinderGeometry(0.045, 0.045, 0.018, 20), GOLD);
  caseM.rotation.x = Math.PI / 2;
  g.add(caseM);
  const crown = part(new THREE.CylinderGeometry(0.008, 0.008, 0.016, 8), GOLD);
  crown.position.y = 0.052;
  g.add(crown);
  const bow = part(new THREE.TorusGeometry(0.014, 0.003, 5, 10), GOLD, { outline: false });
  bow.position.y = 0.068;
  g.add(bow);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.039, 20), relic ? glowMat(0xb04aff, 0.95) : toon(0xf4ecd8));
  face.position.z = 0.0095;
  g.add(face);
  if (relic) {
    // a Relíquia: núcleo brilhante e ponteiros girando sem parar
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.018), glowMat(0xff6ad0, 1));
    core.position.z = 0.016;
    g.add(core);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), glowMat(0x7a5aff, 0.3));
    halo.position.z = 0.012;
    g.add(halo);
    g.userData.core = core;
  }
  const hands = new THREE.Group();
  for (const [len, w] of [[0.032, 0.004], [0.022, 0.006]]) {
    const h = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.002), relic ? glowMat(0x7ad0ff, 1) : toon(0x1a1a1a));
    h.position.y = len / 2;
    const pivot = new THREE.Group();
    pivot.add(h);
    hands.add(pivot);
  }
  hands.position.z = 0.012;
  g.add(hands);
  g.userData.hands = hands.children;
  // tampa articulada na dobradiça de cima-esquerda
  const lidPivot = new THREE.Group();
  lidPivot.position.set(-0.045, 0, 0.01);
  const lid = part(new THREE.CylinderGeometry(0.046, 0.046, 0.006, 20), GOLD);
  lid.rotation.x = Math.PI / 2;
  lid.position.set(0.045, 0, 0.003);
  lidPivot.add(lid);
  g.add(lidPivot);
  g.userData.lid = lidPivot;
  return g;
}

// MÁSCARA DO ANFITRIÃO (referências do usuário): máscara de gás com duas lentes redondas GRANDES brilhando em
// branco-rosa, o filtro redondo na frente da boca com a grade em cruz e FIOS NEON (rosa, azul, amarelo, verde)
// enrolados em volta da cabeça e da máscara. Fixa no rosto (socket `mouth`).
export const NEON = [0xff4ad0, 0x4ab8ff, 0xffe04a, 0x5aff8a, 0xff4a4a];
export function hostMask() {
  const g = gasMask(0xffc8f0);
  // lentes maiores com halo forte
  for (const sx of [-1, 1]) {
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.042, 20), glowMat(0xfff0fa, 1));
    lens.position.set(0.048 * sx, 0.06, 0.082);
    g.add(lens);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), glowMat(0xff6ad0, 0.35));
    halo.position.set(0.048 * sx, 0.06, 0.084);
    g.add(halo);
  }
  // filtro: disco claro com a grade em cruz
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), glowMat(0xffd8f0, 0.85));
  disc.position.set(0, -0.035, 0.126);
  g.add(disc);
  for (const r of [0, Math.PI / 2]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.006, 0.004), toon(0x6a2a6a));
    bar.rotation.z = r;
    bar.position.set(0, -0.035, 0.128);
    g.add(bar);
  }
  // fios neon em volta da cabeça (anéis inclinados)
  NEON.forEach((c, i) => {
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.13 + i * 0.008, 0.0045, 4, 28), glowMat(c, 0.95));
    w.rotation.set(Math.PI / 2 + (i - 2) * 0.35, (i % 2 ? 1 : -1) * 0.3, 0);
    w.position.set(0, 0.05 - i * 0.02, -0.04);
    g.add(w);
  });
  return g;
}

// FIOS NEON enrolados num pedaço do corpo (tronco, braço, perna do Anfitrião): anéis finos e coloridos, um pouco
// tortos, em volta do eixo Y local
export function neonWraps(radius, length, count = 4) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const c = NEON[i % NEON.length];
    const w = new THREE.Mesh(new THREE.TorusGeometry(radius * (0.95 + Math.random() * 0.15), 0.006, 4, 24), glowMat(c, 0.95));
    w.rotation.set(Math.PI / 2 + (Math.random() - 0.5) * 0.7, 0, (Math.random() - 0.5) * 0.5);
    w.position.y = -length * (i + 0.5) / count;
    g.add(w);
  }
  return g;
}

// óculos redondos de lente rosa-avermelhada (Arnaldo, como nas referências do usuário)
export function roundGlasses({ tint = 0xff5a7a, opacity = 0.6 } = {}) {
  const g = new THREE.Group();
  const mat = toon(0x2a2a2a);
  for (const s of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.0035, 6, 16), mat);
    rim.position.set(0.04 * s, 0, 0);
    g.add(rim);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.022, 14), new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity })); // lente rosa/vermelha (referências)
    lens.position.set(0.04 * s, 0, 0.001);
    g.add(lens);
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.003, 0.003), mat);
  g.add(bridge);
  return g;
}

// bigode cheio + cavanhaque grisalhos (Veríssimo)
export function mustache(color = 0xb8b4ac) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const m = part(new THREE.CapsuleGeometry(0.012, 0.04, 4, 8), color, { outline: false });
    m.rotation.z = (Math.PI / 2) * s - 0.35 * s;
    m.position.set(0.024 * s, 0, 0);
    g.add(m);
  }
  const goatee = part(new THREE.ConeGeometry(0.018, 0.04, 8), color, { outline: false });
  goatee.rotation.x = Math.PI;
  goatee.position.set(0, -0.06, -0.005);
  g.add(goatee);
  return g;
}

// FITA COM FÍSICA: uma tira presa num ponto do objeto (local) que cai e balança com a gravidade e a inércia do movimento
// (corrente de pontos com Verlet, em coordenadas do mundo; a malha é refeita no espaço local a cada quadro).
export function physicsRibbon(anchor, len, width, color, sway = 0.5, n = 10) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array((n + 1) * 2 * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const idx = [];
  for (let i = 0; i < n; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setIndex(idx);
  const mat = new THREE.MeshToonMaterial({ color, emissive: color, emissiveIntensity: 0.7, side: THREE.DoubleSide });
  // brilho próprio que o "flash" de dano do rig (setTint) devolve ao terminar — sem isso o setTint zerava o emissive a
  // cada quadro e a fita vermelha ficava quase preta na luz do cenário
  mat.userData.baseEmissive = { color: new THREE.Color(color), intensity: 0.7 };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.userData.outline = false;
  const seg = len / n;
  const P = [];
  const O = [];
  let ready = false;
  let last = 0;
  const inv = new THREE.Matrix4();
  const tmp = new THREE.Vector3();
  const side = new THREE.Vector3();
  const faceAxis = new THREE.Vector3();
  const grav = new THREE.Vector3(0, -9.8, 0);
  mesh.onBeforeRender = () => {
    const now = performance.now();
    const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000 || 1 / 60));
    last = now;
    const parent = mesh.parent;
    if (!parent) return;
    parent.updateWorldMatrix(true, false);
    const root = tmp.copy(anchor).applyMatrix4(parent.matrixWorld);
    if (!ready) {
      for (let i = 0; i <= n; i++) { P.push(root.clone().add(new THREE.Vector3(0, -i * seg, 0))); O.push(P[i].clone()); }
      ready = true;
    }
    const t = now / 1000;
    const wind = new THREE.Vector3(Math.sin(t * 1.7) * sway, 0, Math.cos(t * 1.3) * sway * 0.6);
    P[0].copy(root);
    O[0].copy(root);
    for (let i = 1; i <= n; i++) { // Verlet: inércia + gravidade + um vento leve (a fita nunca fica parada)
      const p = P[i];
      const v = p.clone().sub(O[i]).multiplyScalar(0.96);
      O[i].copy(p);
      p.add(v).addScaledVector(grav, dt * dt).addScaledVector(wind, dt * dt);
    }
    for (let it = 0; it < 4; it++) { // comprimento fixo de cada pedaço
      for (let i = 1; i <= n; i++) {
        const a = P[i - 1];
        const b = P[i];
        const d = b.clone().sub(a);
        const l = d.length() || 1e-6;
        const k = (l - seg) / l;
        if (i === 1) b.addScaledVector(d, -k);
        else { a.addScaledVector(d, k * 0.5); b.addScaledVector(d, -k * 0.5); }
      }
      P[0].copy(root);
    }
    inv.copy(parent.matrixWorld).invert();
    for (let i = 0; i <= n; i++) {
      const dir = i < n ? P[i + 1].clone().sub(P[i]) : P[i].clone().sub(P[i - 1]);
      // largura da fita: perpendicular ao trecho, no plano da lâmina (eixo Z da espada no mundo). A conta antiga
      // (dir.z, 0, −dir.x) dava ZERO com a fita pendurada reta para baixo: largura zero → normais NaN → a luz do
      // MeshToon ficava NaN e a fita vermelha aparecia PRETA (inclusive o brilho)
      side.crossVectors(dir, faceAxis.set(0, 0, 1).transformDirection(parent.matrixWorld));
      if (side.lengthSq() < 1e-8) side.crossVectors(dir, faceAxis.set(1, 0, 0));
      if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
      side.normalize().multiplyScalar(width * (1 - i / n * 0.4) / 2);
      const l = P[i].clone().add(side).applyMatrix4(inv);
      const r = P[i].clone().sub(side).applyMatrix4(inv);
      pos.set([l.x, l.y, l.z, r.x, r.y, r.z], i * 6);
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  };
  // primeira pose (antes do 1º quadro): pendurada
  for (let i = 0; i <= n; i++) pos.set([anchor.x - width / 2, anchor.y - i * seg, anchor.z, anchor.x + width / 2, anchor.y - i * seg, anchor.z], i * 6);
  return mesh;
}

// EMISSOR DE PULSOS PARANORMAIS (Arnaldo — wiki): CAIXA coberta de Sigilos de Conhecimento, detalhes DOURADOS, cabos e
// fios saindo de um buraco. userData.glow: o brilho que acende na ativação.
export function pulseEmitter() {
  const g = new THREE.Group();
  const tex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#2a2016'; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = '#f2c230'; x.lineWidth = 3; x.lineCap = 'round';
    for (let k = 0; k < 6; k++) { // sigilos de Conhecimento (traços angulosos)
      x.beginPath();
      let px = 20 + Math.random() * 88;
      let py = 20 + Math.random() * 88;
      x.moveTo(px, py);
      for (let j = 0; j < 4; j++) { px += (Math.random() - 0.5) * 40; py += (Math.random() - 0.5) * 40; x.lineTo(px, py); }
      x.stroke();
    }
    x.strokeRect(6, 6, 116, 116);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const box = part(new THREE.BoxGeometry(0.16, 0.11, 0.12), 0xffffff, { mat: new THREE.MeshToonMaterial({ map: tex }) });
  g.add(box);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { // cantos dourados
    const c = part(new THREE.BoxGeometry(0.022, 0.12, 0.022), 0xd4a640, { outline: false });
    c.position.set(sx * 0.08, 0, sz * 0.06);
    g.add(c);
  }
  const hole = part(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 12), 0x050505, { outline: false });
  hole.position.y = 0.056;
  g.add(hole);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), glowMat(0xf2c230, 0));
  glow.position.y = 0.06;
  g.add(glow);
  g.userData.glow = glow;
  // cabos e fios saindo do buraco
  for (let i = 0; i < 4; i++) {
    const a = i * 1.6;
    const pts = [new THREE.Vector3(0, 0.055, 0), new THREE.Vector3(Math.cos(a) * 0.04, 0.1, Math.sin(a) * 0.04), new THREE.Vector3(Math.cos(a) * 0.09, 0.08, Math.sin(a) * 0.09), new THREE.Vector3(Math.cos(a) * 0.1, 0.02, Math.sin(a) * 0.1)];
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.005, 4, false), toon([0xb02020, 0x2050b0, 0xd0a020, 0x202020][i])));
  }
  return g;
}

// BANDOLEIRA com cartuchos (Veríssimo): faixa de couro atravessando o peito com os cartuchos vermelhos
export function bandolier() {
  const g = new THREE.Group();
  const strap = part(new THREE.BoxGeometry(0.06, 0.62, 0.012), 0x4a2e1a);
  strap.rotation.z = 0.75;
  g.add(strap);
  for (let i = 0; i < 9; i++) {
    const shell = part(new THREE.CylinderGeometry(0.009, 0.009, 0.045, 8), 0xb02a20, { outline: false });
    const t = (i - 4) * 0.055;
    shell.position.set(Math.sin(0.75) * -t, Math.cos(0.75) * t, 0.012);
    shell.rotation.z = 0.75;
    g.add(shell);
    const cap = part(new THREE.CylinderGeometry(0.0095, 0.0095, 0.012, 8), 0xd4a640, { outline: false });
    cap.position.copy(shell.position).add(new THREE.Vector3(Math.sin(0.75) * 0.02, -Math.cos(0.75) * 0.02, 0));
    cap.rotation.z = 0.75;
    g.add(cap);
  }
  return g;
}

// ---------------- CRISTINO (Transtornados, Hexatombe) — wiki "Cristino", Arsenal
// A ESPINGARDA SOCADEIRA: espingarda de carregar pela boca, cano longo, coronha de madeira enfaixada com a RODA DE
// ESPINHOS (dá para usar como bastão quando não dá tempo de carregar). Mesmo encaixe da escopeta: cano para baixo (-y).
export function socadeira({ rifle = false } = {}) {
  const g = new THREE.Group();
  const wood = 0x6a3a22;
  const stock = part(new THREE.BoxGeometry(0.05, 0.3, 0.1), wood);
  stock.position.set(0, 0.2, -0.025);
  stock.rotation.x = -0.12;
  g.add(stock);
  const wrap = part(new THREE.CylinderGeometry(0.058, 0.058, 0.12, 10), 0xd8ccbc);
  wrap.position.set(0, 0.24, -0.03);
  g.add(wrap);
  const lock = part(new THREE.BoxGeometry(0.045, 0.1, 0.07), 0x3a3634);
  lock.position.y = 0.02;
  g.add(lock);
  const hammer = part(new THREE.BoxGeometry(0.014, 0.04, 0.03), 0xc8a048);
  hammer.position.set(0.026, 0.05, 0.03);
  hammer.rotation.x = 0.5;
  g.add(hammer);
  const fore = part(new THREE.BoxGeometry(0.04, 0.42, 0.05), wood);
  fore.position.set(0, -0.24, -0.006);
  g.add(fore);
  const len = rifle ? 0.78 : 0.92;
  const barrel = part(new THREE.CylinderGeometry(0.017, 0.019, len, 8), 0x2a2828);
  barrel.position.set(0, -len / 2 + 0.02, 0.022);
  g.add(barrel);
  for (const y of [-0.12, -0.42]) { // as braçadeiras de latão
    const band = part(new THREE.TorusGeometry(0.026, 0.006, 4, 10), 0xc8a048, { outline: false });
    band.rotation.x = Math.PI / 2;
    band.position.set(0, y, 0.01);
    g.add(band);
  }
  if (rifle) {
    // o rifle do Desertor: ferrolho e alça de mira, sem a roda de espinhos
    const bolt = part(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), 0x9a9692);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(0.04, 0.0, 0.03);
    g.add(bolt);
  } else {
    // a RODA DE ESPINHOS na coronha
    const steel = toon(0xc8c4bc, { emissive: 0x141210 });
    const hub = part(new THREE.TorusGeometry(0.075, 0.008, 4, 16), 0, { mat: steel });
    hub.rotation.y = Math.PI / 2;
    hub.position.set(0, 0.34, -0.05);
    g.add(hub);
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      const sp = part(new THREE.ConeGeometry(0.012, 0.12, 5), 0, { mat: steel });
      sp.position.set(0, 0.34 + Math.cos(a) * 0.12, -0.05 + Math.sin(a) * 0.12);
      sp.rotation.x = a;
      g.add(sp);
    }
  }
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, -len + 0.02, 0.022);
  g.add(muzzle);
  g.userData.muzzle = muzzle;
  return g;
}

// a PEIXEIRA: a faca longa do sertão (quase um facão) — lâmina de ~50 cm, estreita, dorso reto e a ponta afilada, a
// guarda de latão e o cabo de chifre com anéis de metal; manchada de sangue
export function peixeira() {
  const g = new THREE.Group();
  const handle = part(new THREE.CylinderGeometry(0.02, 0.017, 0.17, 10), 0x2a1c16);
  handle.position.y = 0.05;
  g.add(handle);
  for (const y of [0.0, 0.05, 0.1]) {
    const ring = part(new THREE.CylinderGeometry(0.021, 0.021, 0.008, 10), 0xc8c4bc, { outline: false });
    ring.position.y = y;
    g.add(ring);
  }
  const pommel = part(new THREE.SphereGeometry(0.022, 10, 8), 0xc8a048);
  pommel.position.y = 0.14;
  pommel.scale.set(1, 0.8, 1);
  g.add(pommel);
  const bolster = part(new THREE.BoxGeometry(0.07, 0.025, 0.03), 0xc8a048);
  bolster.position.y = -0.04;
  g.add(bolster);
  // dorso reto e gume reto que só cai na ponta (o perfil da peixeira)
  const sh = new THREE.Shape();
  const L = 0.5;
  sh.moveTo(-0.022, 0);
  sh.lineTo(-0.022, -L * 0.86);
  sh.quadraticCurveTo(-0.02, -L * 0.96, 0.004, -L);
  sh.quadraticCurveTo(0.03, -L * 0.85, 0.028, -L * 0.7);
  sh.lineTo(0.026, 0);
  sh.lineTo(-0.022, 0);
  const blade = part(extrude(sh, 0.006), 0xd4d0cc, { mat: toon(0xd4d0cc, { emissive: 0x1a0c0c }) });
  blade.position.y = -0.05;
  blade.rotation.y = Math.PI / 2;
  g.add(blade);
  const groove = part(new THREE.BoxGeometry(0.008, L * 0.7, 0.004), 0x9a9692, { outline: false }); // o vinco do dorso
  groove.position.set(0.0045, -0.05 - L * 0.38, -0.012); // na face da lâmina, perto do dorso
  g.add(groove);
  const blood = part(extrude(bladeShape(0.2, 0.034, 0.004, 0.6), 0.0075), 0x8a1010, { outline: false });
  blood.position.y = -0.3;
  blood.rotation.y = Math.PI / 2;
  g.add(blood);
  return g;
}

// o LAMPIÃO de espinhos: corpo vermelho, vidro com a chama acesa, espinhos em volta e a alça
export function spikedLantern() {
  const g = new THREE.Group();
  const red = 0xa0141c;
  const base = part(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 10), red);
  base.position.y = -0.12;
  g.add(base);
  const cap = part(new THREE.ConeGeometry(0.065, 0.07, 10), red);
  cap.position.y = 0.06;
  g.add(cap);
  const glass = part(new THREE.CylinderGeometry(0.05, 0.05, 0.13, 10), 0xffb050, { mat: toon(0xffb050, { emissive: 0xff7a1a, emissiveIntensity: 1.2, transparent: true, opacity: 0.85 }), outline: false });
  glass.position.y = -0.035;
  g.add(glass);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), glowMat(0xffd070, 0.95));
  flame.scale.y = 1.6;
  flame.position.y = -0.04;
  g.add(flame);
  for (const s of [-1, 1]) { // as barras de proteção e os espinhos
    const bar = part(new THREE.BoxGeometry(0.012, 0.16, 0.012), red);
    bar.position.set(s * 0.058, -0.035, 0);
    g.add(bar);
    for (const y of [-0.1, 0.02]) {
      const sp = part(new THREE.ConeGeometry(0.008, 0.05, 4), 0xc8c4bc, { outline: false });
      sp.position.set(s * 0.085, y, 0);
      sp.rotation.z = -s * Math.PI / 2;
      g.add(sp);
    }
  }
  const handle = part(new THREE.TorusGeometry(0.04, 0.005, 4, 10, Math.PI), 0x2a2420, { outline: false });
  handle.position.y = 0.1;
  g.add(handle);
  g.userData.flame = flame;
  return g;
}

// o PINGENTE de Tenebris: o círculo com os triângulos (o medalhão que o Quibungo roubou)
export function tenebrisPendant() {
  const g = new THREE.Group();
  const bronze = toon(0xb07848, { emissive: 0x1a0c06 });
  const ring = part(new THREE.TorusGeometry(0.035, 0.005, 4, 16), 0, { mat: bronze });
  g.add(ring);
  for (let k = 0; k < 3; k++) {
    const bar = part(new THREE.BoxGeometry(0.06, 0.006, 0.006), 0, { mat: bronze });
    bar.rotation.z = (k / 3) * Math.PI;
    g.add(bar);
  }
  return g;
}
