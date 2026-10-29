import * as THREE from 'three';
import { glowMat, toon } from './rig.js';
import { MATERIAL_TEXTURES } from './textures.js';
import { katana, scabbard, shiNoKage, relicScabbard, relicBlade, m4, sniper, guitarCase, bloodArm, bloodForearmBlade, knife, karambit, sickleBlade, mutilatorAxe, shotgun, handGrenade, antenna, barbedBat, chaosSkate, leonora, magnum, espadaConsumidora, facaPredadora, sniperFantasma, baluAxe, demonMace, gasMask, swordArnaldo, pocketWatch, roundGlasses, neonWraps, pulseEmitter, bandolier, bengala, mustache, socadeira, peixeira, spikedLantern, tenebrisPendant, chainHatchet, despairMask, seitaMask, SEITA_MASKS, energyFlames } from './weapons.js';

// Armas e acessórios adicionados em código sobre os modelos do Blender.
// Usam só `sockets`, `attach()` e `props`, que existem nos dois tipos de rig.

// EMPUNHADURA (2026-10-23): no punho fechado dos modelos, o "buraco" por onde passa o cabo corre de frente para trás
// (do indicador ao mínimo), perpendicular ao antebraço. As armas brancas eram giradas só ~−0,3 rad — quase alinhadas
// com o antebraço — e a lâmina saía por dentro dos dedos. Agora o cabo atravessa o punho: a lâmina sai por cima (do
// lado do polegar) e o pomo aparece embaixo; as pesadas (machado, marreta, taco, lança) inclinam um pouco menos.
// FIST desce o cabo até o meio da mão (o socket fica no pulso). As armas de fogo já eram giradas assim (~−1,4).
const GRIP = -1.35;
const GRIP_HEAVY = -1.15;
const FIST = -0.06;
function inFist(obj, tilt = GRIP) {
  obj.rotation.x = tilt;
  obj.position.y += FIST;
  return obj;
}

export function addKaiserProps(rig) {
  const { sockets, props } = rig;
  // faca karambit vermelha (cânone) na mão esquerda
  const kar = karambit();
  kar.rotation.set(GRIP, Math.PI, 0.5);
  kar.position.y += FIST;
  sockets.handL.add(kar);
  props.karambit = kar;
  // a câmera fotográfica na mesma mão: aparece só na FOTO COM FLASH (no lugar da karambit)
  const photo = photoCamera();
  photo.position.set(0, -0.06, 0.03);
  photo.rotation.set(-1.25, 0, 0);
  photo.visible = false;
  sockets.handL.add(photo);
  props.photoCamera = photo;
  const back = m4();
  back.rotation.set(0, 0, 2.5);
  back.position.set(0, 0, -0.08);
  sockets.back.add(back);
  props.m4Back = back;
  const hand = m4();
  hand.rotation.x = -0.1;
  hand.position.y = -0.03;
  sockets.handR.add(hand);
  hand.visible = false;
  props.m4Hand = hand;
  rig.muzzle = hand.userData.muzzle;
}

export function addArthurProps(rig) {
  const { sockets, props } = rig;
  const kase = guitarCase();
  kase.rotation.z = -0.35;
  kase.position.set(0, -0.05, -0.12);
  sockets.back.add(kase);
  props.case = kase;
  const rifle = sniper();
  rifle.position.y = -0.02;
  sockets.handR.add(rifle);
  rifle.visible = false;
  props.sniperHand = rifle;
  rig.muzzle = rifle.userData.muzzle;
  // Arma de Sangue: o sangue cobre o antebraço DIREITO — o braço que ele tem — e a lâmina sai dele, na linha do braço,
  // passando do punho (não é segurada; escondida até a habilidade)
  const blade = bloodForearmBlade();
  sockets.handR.add(blade);
  blade.visible = false;
  props.bloodBlade = blade;
  // olhos amaldiçoados do Rebirth
  const eyes = new THREE.Group();
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), glowMat(0x3aff6a, 1)); // os raios verdes do Rebirth (a cor da HQ)
    e.position.set(s * 0.05, 0.175, 0.14);
    eyes.add(e);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), glowMat(0x3aff6a, 0.35));
    halo.position.copy(e.position);
    eyes.add(halo);
  }
  eyes.visible = false;
  sockets.head.add(eyes);
  props.eyes = eyes;
}

export function addAghataProps(rig) {
  const { sockets, props } = rig;
  const blade = knife();
  inFist(blade);
  blade.scale.setScalar(1.15);
  sockets.handR.add(blade);
  props.knife = blade;
  const spare = knife();
  spare.visible = false;
  sockets.handR.add(spare);
  props.knifeThrow = spare;
}

// ERIN: uma adaga em cada mão; a escopeta aparece no disparo; granada na mão antes do arremesso
export function addErinProps(rig) {
  const { sockets, props } = rig;
  for (const s of ['R', 'L']) {
    const d = knife();
    d.rotation.set(GRIP, s === 'L' ? Math.PI : 0, 0);
    d.position.y += FIST;
    d.scale.setScalar(1.05);
    sockets['hand' + s].add(d);
    props['dagger' + s] = d;
  }
  const gun = shotgun();
  gun.position.y = -0.02;
  sockets.handR.add(gun);
  gun.visible = false;
  props.shotgun = gun;
  rig.muzzle = gun.userData.muzzle;
  const gr = handGrenade(0xff3050);
  gr.visible = false;
  sockets.handR.add(gr);
  props.grenade = gr;
  // máscara de gás (só aparece na Transformação: na cena ela leva a máscara das mãos ao rosto)
  const mask = gasMask(0x7aff9a);
  mask.position.set(0, -0.02, -0.01);
  mask.visible = false;
  sockets.mouth.add(mask);
  props.gasMask = mask;
}

// AGUIAR: machado do Mutilador na mão direita (sem arma de fogo); máscara (do Blender) escondida
export function addAguiarProps(rig) {
  const { sockets, props } = rig;
  const axe = mutilatorAxe();
  inFist(axe, GRIP_HEAVY);
  sockets.handR.add(axe);
  props.axe = axe;
  if (props.maskOn) rig.showProp('maskOn', false);
}

// LABIRINTO: a Antena na mão direita; o elmo do sorriso (do Blender) fica escondido
export function addLabirintoProps(rig) {
  const { sockets, props } = rig;
  const ant = antenna();
  inFist(ant, GRIP_HEAVY);
  ant.position.y = 0.05;
  sockets.handR.add(ant);
  props.antenna = ant;
  if (props.helmetOn) rig.showProp('helmetOn', false);
  if (props.helmetOn_papers) {
    // papéis colados fazem parte do elmo: ligam e desligam juntos
    const hp = props.helmetOn;
    const pp = props.helmetOn_papers;
    props.helmetOn = {
      parts: [hp, pp], // as peças reais (a cena da Transformação leva o elmo das mãos até a cabeça)
      get visible() { return hp.visible; },
      set visible(v) { hp.visible = v; pp.visible = v; },
      traverse(fn) { hp.traverse(fn); pp.traverse(fn); },
    };
    rig.showProp('helmetOn', false);
  }
}

// LÍRIO: a LEONORA na mão direita (a esquerda vai para o cabo por pose); o canivete de osso só aparece no arremesso
export function addLirioProps(rig) {
  const { sockets, props } = rig;
  const hammer = leonora();
  inFist(hammer, GRIP_HEAVY);
  sockets.handR.add(hammer);
  props.leonora = hammer;
  const kn = knife();
  kn.visible = false;
  inFist(kn);
  sockets.handL.add(kn);
  props.knifeThrow = kn;
  // capacete azul com listra branca (pendurado no equipamento na arte): aparece na Proteção Pesada
  const helmet = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.175, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshToonMaterial({ color: 0x2c5aa0 }));
  helmet.add(dome);
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.014, 6, 24, Math.PI), new THREE.MeshToonMaterial({ color: 0xe8eef4 }));
  stripe.rotation.y = Math.PI / 2;
  stripe.position.y = 0.012;
  helmet.add(stripe);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.176, 0.012, 6, 24), new THREE.MeshToonMaterial({ color: 0x1a3a6a }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.05;
  helmet.add(rim);
  helmet.position.set(0, 0.06, -0.01);
  helmet.visible = false;
  sockets.head.add(helmet);
  props.helmet = helmet;
}

// BALU: o Machado Lancinante nas duas mãos (pegada da Leonora); o Machado Demônio (maça de sangue) fica escondido até
// a habilidade trocar um pelo outro
export function addBaluProps(rig) {
  const { sockets, props } = rig;
  const axe = baluAxe();
  inFist(axe, GRIP_HEAVY);
  sockets.handR.add(axe);
  props.axe = axe;
  const mace = demonMace();
  inFist(mace, GRIP_HEAVY);
  mace.visible = false;
  sockets.handR.add(mace);
  props.demonMace = mace;
}

// FERREIRO: a Espada Consumidora (duas mãos)
export function addFerreiroProps(rig) {
  const { sockets, props } = rig;
  const sword = espadaConsumidora();
  inFist(sword);
  sockets.handR.add(sword);
  props.sword = sword;
}

// JUAN: a Faca Predadora na mão direita
export function addJuanProps(rig) {
  const { sockets, props } = rig;
  const k = facaPredadora();
  inFist(k);
  sockets.handR.add(k);
  props.knife = k;
  // ÓDIO DO DIABO (1ª transformação, a arte "pose ultimate"): escondidos até a cena — o antebraço direito vira sangue
  // com garras (o mesmo braço de sangue do Arthur, só a parte do antebraço), o capuz vermelho sobe e o olho que restou
  // acende em vermelho
  const wp = (j) => rig.joints[j].getWorldPosition(new THREE.Vector3());
  const upperLen = wp('sR').distanceTo(wp('eR'));
  const fore = bloodArm(upperLen, upperLen * 0.95).fore;
  fore.scale.setScalar(0.9);
  rig.attach('eR', fore);
  fore.visible = false;
  props.bloodHand = fore;
  props.hoodUp = juanHood();
  props.hoodUp.visible = false;
  sockets.head.add(props.hoodUp);
  const eye = new THREE.Group();
  const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), glowMat(0xff2030, 1));
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), glowMat(0xff1020, 0.35));
  e.position.set(-0.05, 0.17, 0.135); // o olho DIREITO (o esquerdo é o perdido, costurado)
  halo.position.copy(e.position);
  eye.add(e, halo);
  eye.visible = false;
  sockets.head.add(eye);
  props.hateEye = eye;
}

// capuz vermelho erguido (o manto rasgado do Juan cobrindo a cabeça): casca aberta na frente, ponta caída atrás e a
// borda esfiapada em volta do rosto
function juanHood() {
  const g = new THREE.Group();
  const mat = toon(0x6e1216, { side: THREE.DoubleSide });
  const dark = toon(0x380608, { side: THREE.DoubleSide });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14, Math.PI / 2 + 0.75, Math.PI * 2 - 1.5, 0, 2.2), mat);
  shell.scale.set(1.0, 1.08, 1.12);
  shell.position.set(0, 0.17, -0.01);
  shell.userData.outline = true;
  g.add(shell);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 10), mat);
  tip.position.set(0, 0.28, -0.17);
  tip.rotation.x = -2.2;
  g.add(tip);
  for (let i = 0; i < 9; i++) {
    const a = -1.1 + (i / 8) * 2.2;
    const rag = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.07 + (i % 3) * 0.025, 4), dark);
    rag.position.set(Math.sin(a) * 0.17, 0.27 - Math.abs(Math.sin(a)) * 0.12, 0.13 + Math.cos(a) * 0.04);
    rag.rotation.x = Math.PI;
    g.add(rag);
  }
  return g;
}

// JUAN no ÓDIO DO DIABO: as peças da transformação à mostra; a faca dá lugar às garras de sangue
export function addJuanOdioProps(rig) {
  addJuanProps(rig);
  for (const [p, v] of [['bloodHand', true], ['hoodUp', true], ['hateEye', true], ['knife', false]]) rig.showProp(p, v);
}

// XANDE: taco com arame farpado na mão direita, Skate Caótico na esquerda

export function addXandeProps(rig) {
  const { sockets, props } = rig;
  const bat = barbedBat();
  inFist(bat, GRIP_HEAVY);
  sockets.handR.add(bat);
  props.bat = bat;
  const sk = chaosSkate();
  sk.rotation.set(0.2, 0, 0.1);
  sockets.handL.add(sk);
  props.skate = sk;
}

export function addGalSalProps(rig) {
  const { sockets, props } = rig;
  const right = sickleBlade();
  inFist(right);
  right.scale.setScalar(1.1);
  sockets.handR.add(right);
  props.bladeR = right;
  const left = sickleBlade();
  left.rotation.set(GRIP, Math.PI, 0);
  left.position.y += FIST;
  left.scale.setScalar(1.1);
  sockets.handL.add(left);
  props.bladeL = left;
}

// Kian: NENHUMA arma. Só a manifestação translúcida da Lâmina do Medo,
// que aparece apenas durante a habilidade.
export function addKianProps(rig) {
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
  const haze = new THREE.Mesh(geo, glowMat(0xffd88a, 0.45));
  haze.material.side = THREE.DoubleSide;
  haze.scale.set(1.8, 1.15, 1.8);
  haze.rotation.y = Math.PI / 2;
  blade.add(haze);
  blade.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), glowMat(0xffe2a8, 0.4)));
  inFist(blade);
  blade.visible = false;
  rig.sockets.handR.add(blade);
  rig.props.fearBlade = blade;
  // Desconjuração: barba rala, sem as faixas (elas e a barba cheia são da Transformação — Calamidade)
  for (const [p, v] of [['beard_s', false], ['beard_m', false], ['beard_f', false], ['wraps', false]]) if (rig.props[p]) rig.showProp(p, v); // a barba rala é só pintada no rosto
}

// KIAN DE CALAMIDADE (Transformação): a barba cheia e as faixas nos antebraços
export function addKianCalamidadeProps(rig) {
  addKianProps(rig);
  for (const [p, v] of [['beard_s', false], ['beard_m', false], ['beard_f', true], ['wraps', true]]) if (rig.props[p]) rig.showProp(p, v);
}

// KEMI / A FANTASMA: faca na mão direita, a Sniper Fantasma pendurada nas costas (vai para a mão no tiro) e o
// revólver .38 / Pistola Transtornada (aparece só nos tiros). 'stowed' = faca + rifle das costas (somem juntos
// quando ela ajoelha para mirar). ghost: na forma Fantasma o rifle pinga lodo.
function kemiProps(rig, ghost) {
  const { sockets, props } = rig;
  const k = knife();
  inFist(k);
  sockets.handR.add(k);
  props.knife = k;
  const back = sniperFantasma({ drip: ghost });
  back.rotation.set(0, 0, 2.6);
  back.position.set(0, -0.12, ghost ? -0.11 : -0.16); // a Kemi tem a mochila nas costas: o rifle fica por cima dela
  back.scale.setScalar(0.78); // nas costas, sem passar muito da cabeça
  sockets.back.add(back);
  props.rifleBack = back;
  const hand = sniperFantasma({ drip: ghost });
  hand.position.y = -0.02;
  hand.visible = false;
  sockets.handR.add(hand);
  props.sniperHand = hand;
  rig.muzzle = hand.userData.muzzle;
  const gun = magnum();
  gun.scale.setScalar(0.9);
  gun.rotation.x = -1.4;
  gun.visible = false;
  sockets.handR.add(gun);
  props.pistol = gun;
  props.stowed = {
    get visible() { return k.visible; },
    set visible(v) { k.visible = v; back.visible = v; },
    traverse(fn) { k.traverse(fn); back.traverse(fn); },
  };
}

export function addKemiProps(rig) {
  kemiProps(rig, false);
}

export function addFantasmaProps(rig) {
  kemiProps(rig, true);
}

// ERIN — forma "Em Nome do Caos": a máscara de gás da Produção do Anfitrião no rosto (lentes verdes)
export function addErinCaosProps(rig) {
  addErinProps(rig);
  rig.showProp('gasMask', true);
}

// LABIRINTO — forma do Capacete do ???: o elmo do sorriso fica no rosto o tempo todo
export function addLabirintoElmoProps(rig) {
  addLabirintoProps(rig);
  if (rig.props.helmetOn) rig.showProp('helmetOn', true);
}

// AGUIAR — forma do Mutilador Noturno: a máscara branca da mão vermelha fica no rosto o tempo todo
export function addAguiarMutiladorProps(rig) {
  addAguiarProps(rig);
  if (rig.props.maskOn) rig.showProp('maskOn', true);
}

// ponteiros do relógio girando (o do Anfitrião gira sem parar, de jeitos aleatórios)
function tickWatch(watch, crazy) {
  const face = watch.children.find((c) => c.isMesh && c.geometry.type === 'CircleGeometry');
  if (!face) return;
  let last = performance.now();
  let speed = 1;
  face.onBeforeRender = () => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (crazy && Math.random() < 0.02) speed = (Math.random() - 0.3) * 30;
    const [m, h] = watch.userData.hands;
    m.rotation.z -= dt * (crazy ? speed : 0.6);
    h.rotation.z -= dt * (crazy ? speed * 0.4 : 0.05);
    if (watch.userData.core) watch.userData.core.rotation.y += dt * 4;
  };
}

// ARNALDO FRITZ (modelo próprio: tools/blender/arnaldo_common.py): a espada da fita vermelha (com física) na mão
// direita, os óculos finos e arredondados, o relógio de bolso de ouro (aparece na Transformação) e o Emissor de Pulsos
// Paranormais (aparece no □) na mão esquerda
export function addArnaldoProps(rig) {
  const { sockets, props } = rig;
  const sword = swordArnaldo();
  inFist(sword);
  sockets.handR.add(sword);
  props.sword = sword;
  const glasses = roundGlasses({ tint: 0xdde8f0, opacity: 0.22 });
  glasses.position.set(0, 0.07, 0.012);
  sockets.mouth.add(glasses);
  props.glasses = glasses;
  const watch = pocketWatch();
  watch.scale.setScalar(1.8); // grande o bastante para ler na cena da Transformação
  watch.rotation.set(-1.2, 0, 0);
  watch.position.set(0, -0.07, 0.07);
  watch.visible = false;
  sockets.handL.add(watch);
  props.watch = watch;
  tickWatch(watch, false);
  const emitter = pulseEmitter();
  emitter.position.set(0, -0.06, 0.06);
  emitter.visible = false;
  sockets.handL.add(emitter);
  props.emitter = emitter;
}

// O ANFITRIÃO (modelo próprio — máscara fundida, cabos e corpo de Energia vêm do Blender): o relógio com a Relíquia
// preso no antebraço esquerdo, girando sem parar, e o CABO que sai do peito até ele (acompanha o braço a cada quadro)
export function addAnfitriaoProps(rig) {
  const { sockets, props } = rig;
  const watch = pocketWatch({ relic: true });
  watch.scale.setScalar(1.6);
  watch.rotation.set(0, Math.PI / 2, 0);
  watch.position.set(0.06, -0.12, 0);
  rig.attach('eL', watch);
  props.watch = watch;
  tickWatch(watch, true);
  props.chestCable = liveCable(rig, sockets.chest, watch, 0xff4ad0);
  // cabos enrolados pelo corpo todo (anéis finos coloridos que balançam um pouco)
  const wraps = [];
  for (const [joint, r, len, n] of [['sp', 0.22, 0.4, 4], ['sL', 0.075, 0.26, 2], ['sR', 0.075, 0.26, 2], ['eL', 0.062, 0.2, 1], ['eR', 0.062, 0.2, 2], ['lL', 0.095, 0.36, 2], ['lR', 0.095, 0.36, 2]]) {
    const w = neonWraps(r, len, n);
    if (joint === 'sp') w.rotation.x = Math.PI; // no tronco os anéis sobem da cintura para o peito
    rig.attach(joint, w);
    wraps.push(w);
  }
  let wt = 0;
  wraps[0].children[0].onBeforeRender = () => { wt += 0.016; wraps.forEach((w, i) => { w.rotation.y = Math.sin(wt * 1.3 + i) * 0.25; if (i === 0) w.rotation.x = Math.PI; }); };
  props.wires = { get visible() { return wraps[0].visible; }, set visible(v) { wraps.forEach((w) => { w.visible = v; }); }, traverse(fn) { wraps.forEach((w) => w.traverse(fn)); } };
}

// cabo que liga dois pontos do corpo e acompanha o movimento (no espaço do personagem). A malha é UMA só, com um
// buffer fixo de vértices reescrito no lugar a cada quadro (antes um TubeGeometry novo por quadro: lixo de memória)
const CABLE_SEG = 12;
const CABLE_RAD = 5;
function liveCable(rig, from, to, color) {
  const mat = new THREE.MeshBasicMaterial({ color });
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array((CABLE_SEG + 1) * CABLE_RAD * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const idx = [];
  for (let i = 0; i < CABLE_SEG; i++) {
    for (let j = 0; j < CABLE_RAD; j++) {
      const a0 = i * CABLE_RAD + j;
      const a1 = i * CABLE_RAD + ((j + 1) % CABLE_RAD);
      idx.push(a0, a1, a0 + CABLE_RAD, a1, a1 + CABLE_RAD, a0 + CABLE_RAD);
    }
  }
  geo.setIndex(idx); // o buffer começa zerado: nada aparece até a primeira curva válida
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  rig.root.add(mesh);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const mid = new THREE.Vector3();
  const p = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const n1 = new THREE.Vector3();
  const n2 = new THREE.Vector3();
  const up = new THREE.Vector3(0, 0, 1);
  const inv = new THREE.Matrix4();
  let t = 0;
  mesh.onBeforeRender = () => {
    t += 0.016;
    rig.root.updateWorldMatrix(true, true);
    inv.copy(rig.root.matrixWorld).invert();
    from.getWorldPosition(a).applyMatrix4(inv);
    to.getWorldPosition(b).applyMatrix4(inv);
    // modelo recém-criado (antes da primeira pose) tem as juntas no mesmo ponto: a curva teria comprimento zero
    if (!(a.distanceToSquared(b) > 1e-6) || !Number.isFinite(a.x + a.y + a.z + b.x + b.y + b.z)) return;
    mid.copy(a).lerp(b, 0.5).add(n1.set(Math.sin(t * 3) * 0.03, -0.12, 0.08));
    for (let i = 0; i <= CABLE_SEG; i++) {
      const s = i / CABLE_SEG;
      // curva de Bézier quadrática a → mid → b e a tangente nela
      p.set(0, 0, 0).addScaledVector(a, (1 - s) * (1 - s)).addScaledVector(mid, 2 * (1 - s) * s).addScaledVector(b, s * s);
      tan.copy(mid).sub(a).multiplyScalar(2 * (1 - s)).addScaledVector(n2.copy(b).sub(mid), 2 * s).normalize();
      n1.crossVectors(tan, up);
      if (n1.lengthSq() < 1e-8) n1.set(1, 0, 0);
      n1.normalize();
      n2.crossVectors(tan, n1).normalize();
      for (let j = 0; j < CABLE_RAD; j++) {
        const ang = (j / CABLE_RAD) * Math.PI * 2;
        const c = Math.cos(ang) * 0.008;
        const d = Math.sin(ang) * 0.008;
        const k = (i * CABLE_RAD + j) * 3;
        pos[k] = p.x + n1.x * c + n2.x * d;
        pos[k + 1] = p.y + n1.y * c + n2.y * d;
        pos[k + 2] = p.z + n1.z * c + n2.z * d;
      }
    }
    geo.attributes.position.needsUpdate = true;
  };
  return mesh;
}

// SENHOR VERÍSSIMO (modelo próprio: tools/blender/char_verissimo.py): a espada do Arnaldo (mesmo modelo, com a fita) na
// mão direita, a bandoleira com cartuchos no peito e a escopeta curta (aparece no □)
export function addVerissimoProps(rig) {
  const { sockets, props } = rig;
  const sword = swordArnaldo();
  inFist(sword);
  sockets.handR.add(sword);
  props.sword = sword;
  const band = bandolier();
  band.position.set(0, -0.08, 0.035);
  sockets.chest.add(band);
  props.bandolier = band;
  const gun = shotgun();
  gun.position.y = -0.02;
  gun.visible = false;
  sockets.handR.add(gun);
  props.shotgun = gun;
  rig.muzzle = gun.userData.muzzle;
}

// JAE (modelo próprio: tools/blender/char_jae.py): o PUNHAL X na mão direita. O capuz é do próprio modelo:
// prop_hoodDown (caído nas costas), prop_hoodUp (posto) e prop_hoodX (o rosto sumido na escuridão com o X vermelho)
// — o jogo mostra o caído OU o posto.
// Punhal X (wiki): cabo preto, guarda amarela e lâmina longa com um recorte no alto do dorso (ponta "clip").
// GUIZO: a faca de detalhes dourados (wiki: arsenal; "Faca de Guizo em Sinais do Outro Lado"): lâmina longa e
// estreita bronze-escura, guarda dourada com as pontas curvas, cabo trançado preto e pomo dourado. Material com brilho
// próprio (o Amaldiçoar Arma cobre de Sangue; no disfarce alienígena ela brilha em Conhecimento)
function guizoKnife() {
  const g = new THREE.Group();
  const black = new THREE.MeshToonMaterial({ color: 0x18161a });
  const gold = new THREE.MeshToonMaterial({ color: 0xd8a830, emissive: 0x2a1c06 });
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.015, 0.12, 8), black);
  grip.position.y = 0.04;
  g.add(grip);
  // trança do cabo
  for (let i = 0; i < 5; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.004, 4, 10), black);
    r.rotation.set(Math.PI / 2 + (i % 2 ? 0.35 : -0.35), 0, 0);
    r.position.y = -0.005 + i * 0.022;
    g.add(r);
  }
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 6), gold);
  pommel.position.y = 0.105;
  g.add(pommel);
  // guarda dourada: barra com as pontas viradas para a lâmina
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.014, 0.024), gold);
  guard.position.y = -0.024;
  g.add(guard);
  for (const s of [-1, 1]) {
    const q = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.045, 6), gold);
    q.position.set(s * 0.062, -0.04, 0);
    q.rotation.z = s * 0.5 + Math.PI;
    g.add(q);
  }
  // lâmina de dois gumes, longa e estreita, afinando até a ponta
  const shape = new THREE.Shape();
  shape.moveTo(-0.019, 0);
  shape.lineTo(0.019, 0);
  shape.quadraticCurveTo(0.018, -0.2, 0, -0.32);
  shape.quadraticCurveTo(-0.018, -0.2, -0.019, 0);
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.002, bevelSegments: 1 }), new THREE.MeshToonMaterial({ color: 0xa8968a, emissive: 0x000000 }));
  blade.position.set(0, -0.03, -0.003);
  blade.rotation.y = Math.PI / 2;
  g.add(blade);
  const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.2, 0.006), new THREE.MeshToonMaterial({ color: 0x3a2c24 }));
  fuller.position.set(0, -0.13, 0);
  g.add(fuller);
  return g;
}

// KAISER: a câmera fotográfica (a FOTO COM FLASH — ← + □): corpo preto compacto, a lente na frente e o flash em cima
// (userData.flash: de onde sai o clarão)
function photoCamera() {
  const g = new THREE.Group();
  const black = new THREE.MeshToonMaterial({ color: 0x1c1c20 });
  const metal = new THREE.MeshToonMaterial({ color: 0x8a8c94 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.06), black);
  g.add(body);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.07), black);
  grip.position.set(-0.055, -0.004, 0.006);
  g.add(grip);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.03, 0.05, 14), metal);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0.01, 0, 0.05);
  g.add(lens);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.022, 14), new THREE.MeshBasicMaterial({ color: 0x3a5a7a }));
  glass.position.set(0.01, 0, 0.076);
  g.add(glass);
  const flash = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.035), black);
  flash.position.set(0.02, 0.055, 0.005);
  g.add(flash);
  const bulb = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.018), new THREE.MeshBasicMaterial({ color: 0xfff8e0 }));
  bulb.position.set(0.02, 0.055, 0.0235);
  g.add(bulb);
  g.userData.flash = bulb;
  g.traverse((o) => { if (o.isMesh) o.userData.outline = true; });
  return g;
}

// GUIZO: a filmadora (sempre com ele — "pena que eu não tenho a minha câmera comigo agora"): corpo cinza-escuro, lente
// grande, visor lateral aberto com a tela azul acesa, alça de mão e a luz vermelha de gravação
function camcorder() {
  const g = new THREE.Group();
  const body = new THREE.MeshToonMaterial({ color: 0x3a3c42 });
  const dark = new THREE.MeshToonMaterial({ color: 0x18181c });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.08, 0.17), body);
  g.add(box);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.12), dark);
  top.position.set(0, 0.05, -0.01);
  g.add(top);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.04, 0.07, 14), dark);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.004, 0.11);
  g.add(lens);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.03, 14), new THREE.MeshBasicMaterial({ color: 0x4a7aa0 }));
  glass.position.set(0, 0.004, 0.146);
  g.add(glass);
  // visor lateral aberto (do lado de fora) com a tela acesa
  const flip = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.055, 0.075), dark);
  flip.position.set(0.058, 0.004, 0.01);
  flip.rotation.y = 0.5;
  g.add(flip);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.065, 0.045), new THREE.MeshBasicMaterial({ color: 0x5ad0e8 }));
  screen.position.set(0.063, 0.004, 0.012);
  screen.rotation.y = 0.5 + Math.PI / 2;
  g.add(screen);
  const rec = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 5), new THREE.MeshBasicMaterial({ color: 0xff2020 }));
  rec.position.set(0, 0.044, 0.07);
  g.add(rec);
  g.userData.rec = rec;
  return g;
}

// GUIZO — Distorcer Aparência: o disfarce ALIENÍGENA (referência "Guizo ET" e a miniatura do disfarce): cabeça verde de
// crânio grande e queixo fino, olhos pretos enormes amendoados e brilhantes
function etHead() {
  const g = new THREE.Group();
  const green = new THREE.MeshToonMaterial({ color: 0x6ab056 });
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 16), green);
  skull.scale.set(1.12, 1.22, 1.15);
  skull.position.y = 0.2;
  g.add(skull);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), green);
  jaw.scale.set(1.15, 1.5, 1.15);
  jaw.position.set(0, 0.06, 0.05);
  g.add(jaw);
  const eyeMat = new THREE.MeshToonMaterial({ color: 0x050506, emissive: 0x0a0a10 });
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), eyeMat);
    e.scale.set(1.25, 0.62, 0.55);
    e.position.set(s * 0.066, 0.17, 0.15);
    e.rotation.z = s * -0.45;
    g.add(e);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 5), new THREE.MeshBasicMaterial({ color: 0xd8f0ff }));
    shine.position.set(s * 0.056, 0.185, 0.175);
    g.add(shine);
  }
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.004, 0.01), new THREE.MeshBasicMaterial({ color: 0x1c3a18 }));
  mouth.position.set(0, 0.045, 0.14);
  g.add(mouth);
  return g;
}

export function addGuizoProps(rig) {
  const { sockets, props } = rig;
  const k = guizoKnife();
  inFist(k);
  sockets.handR.add(k);
  props.knife = k;
  // a câmera na mão esquerda, com a lente para a frente (no ataque ela vai para o quadril: def.grip)
  const cam = camcorder();
  cam.position.set(0.0, -0.05, 0.02);
  cam.rotation.set(-1.25, 0, 0);
  sockets.handL.add(cam);
  props.camera = cam;
  const et = etHead();
  et.visible = false;
  sockets.head.add(et);
  props.etHead = et;
  if (props.hair) rig.showProp('hair', true);
}

// GUIZO — disfarce alienígena (Transformação): a cabeça de ET no lugar do cabelo e do rosto
export function addGuizoETProps(rig) {
  addGuizoProps(rig);
  rig.showProp('etHead', true);
  if (rig.props.hair) rig.showProp('hair', false);
  // a faca amaldiçoada pelo Conhecimento: a lâmina brilha dourada
  rig.props.knife.traverse((o) => {
    if (o.isMesh && o.material && o.material.emissive && o.geometry && o.geometry.type === 'ExtrudeGeometry') {
      o.material = o.material.clone();
      o.material.color.set(0xf0d070);
      o.material.emissive.set(0xc89a20);
      o.material.emissiveIntensity = 0.9;
      o.material.userData.keepEmissive = true;
    }
  });
}

function jaeDagger() {
  const g = new THREE.Group();
  const black = new THREE.MeshToonMaterial({ color: 0x141214 });
  const gold = new THREE.MeshToonMaterial({ color: 0xe0b02a, emissive: 0x2a1c06 });
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.015, 0.115, 8), black);
  grip.position.y = 0.035;
  g.add(grip);
  // anéis do cabo
  for (const y of [0.0, 0.035, 0.07]) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.003, 4, 10), black);
    r.rotation.x = Math.PI / 2;
    r.position.y = y;
    g.add(r);
  }
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.016, 0.028), gold);
  guard.position.y = -0.028;
  g.add(guard);
  for (const s of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 5), gold);
    tip.position.set(s * 0.05, -0.028, 0);
    g.add(tip);
  }
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), gold);
  pommel.position.y = 0.1;
  g.add(pommel);
  // lâmina longa: gume reto embaixo, dorso com o recorte côncavo perto da ponta
  const shape = new THREE.Shape();
  shape.moveTo(-0.02, 0);
  shape.lineTo(0.02, 0);
  shape.lineTo(0.02, -0.2);
  shape.quadraticCurveTo(0.012, -0.25, -0.004, -0.31);
  shape.lineTo(-0.012, -0.26);
  shape.quadraticCurveTo(-0.022, -0.15, -0.02, 0);
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 1 }), new THREE.MeshToonMaterial({ color: 0xdcd8e0, emissive: 0x221016 }));
  blade.position.set(0, -0.035, -0.003);
  blade.rotation.y = Math.PI / 2;
  g.add(blade);
  // fio de sangue no gume
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.16, 0.004), new THREE.MeshToonMaterial({ color: 0x8a0e18 }));
  edge.position.set(0, -0.17, 0.02);
  g.add(edge);
  return g;
}

export function addJaeProps(rig) {
  const { sockets, props } = rig;
  const d = jaeDagger();
  inFist(d);
  sockets.handR.add(d);
  props.knife = d;
  if (props.hoodUp) rig.showProp('hoodUp', false);
  if (props.hoodX) rig.showProp('hoodX', false);
  if (props.hoodDown) rig.showProp('hoodDown', true);
}

// JAE — forma do X: o capuz fica posto o tempo todo
export function addJaeXProps(rig) {
  addJaeProps(rig);
  for (const [p, v] of [['hoodUp', true], ['hoodX', true], ['hoodDown', false]]) if (rig.props[p]) rig.showProp(p, v);
}

// JOUI: katana sempre na mão (arma principal) e bainha na cintura; a máscara puxada para o lado começa escondida (o
// lutador decide qual mostrar)
export function addJouiProps(rig) {
  const { sockets, props } = rig;
  const sheath = scabbard();
  sheath.rotation.set(0.9, 0, 0.35);
  sockets.hip.add(sheath);
  props.scabbard = sheath;
  const blade = katana();
  inFist(blade);
  sockets.handR.add(blade);
  props.katana = blade;
  if (props.maskSide) rig.showProp('maskSide', false);
}

// JOUI COM A SHI NO KAGE (a Transformação; a fase depois do ep. 9 de Calamidade): ele ENTREGOU a máscara à Magistrada —
// as duas versões da máscara somem; na mão a Shi no Kage (preta, sigilos dourados) e no quadril a bainha com os sigilos
// roxos que contém a Relíquia de Energia (a katana antiga)
export function addJouiShinokageProps(rig) {
  const { sockets, props } = rig;
  for (const p of ['maskOn', 'maskSide']) if (props[p]) rig.showProp(p, false);
  const sheath = relicScabbard();
  sheath.rotation.set(0.9, 0, 0.35);
  sockets.hip.add(sheath);
  props.scabbard = sheath;
  const blade = shiNoKage();
  inFist(blade);
  sockets.handR.add(blade);
  props.katana = blade; // o mesmo nome do prop da katana: golpes, poses e o especial já mostram/escondem por ele
  // a Relíquia de Energia sacada na mão ESQUERDA (só no especial Shi no Kage: as duas lâminas)
  const relic = inFist(relicBlade());
  sockets.handL.add(relic);
  relic.visible = false;
  props.relicBlade = relic;
}

// DALMO / COLOSSO (modelo próprio: tools/blender/char_dalmo.py). O ESCAFANDRO do Colosso fica em código para a cena da
// Transformação poder levá-lo do peito à cabeça (o gif: segura o capacete, ergue e encaixa): casco de cobre arranhado,
// os TRÊS visores vermelhos rachados (frente e laterais), rebites, espinhos no alto e atrás e o pingente de axolote rosa
// pendurado na frente, no canto da visão (wiki: "para que lembre do motivo" — a filha, Manu).
function colossoHelmet() {
  const g = new THREE.Group();
  const copper = new THREE.MeshToonMaterial({ color: 0x8e4a22 });
  const brass = new THREE.MeshToonMaterial({ color: 0xd0a050 });
  const dark = new THREE.MeshToonMaterial({ color: 0x2a1a12 });
  const steel = new THREE.MeshToonMaterial({ color: 0xcfcfd4 });
  const glass = glowMat(0xff2418, 0.95);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), copper);
  shell.scale.set(1, 1.04, 1);
  g.add(shell);
  // riscos fundos no cobre
  for (let i = 0; i < 7; i++) {
    const sc = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.16, 0.006), dark);
    const a = Math.random() * Math.PI * 2;
    sc.position.set(Math.sin(a) * 0.268, 0.05 + Math.random() * 0.1, Math.cos(a) * 0.268);
    sc.rotation.set(0.3, a, Math.random() - 0.5);
    g.add(sc);
  }
  const visor = (r, pos, rotY) => {
    const v = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.26, 8, 20), brass);
    v.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 18), glass);
    disc.position.z = -0.005;
    v.add(disc);
    // rachaduras no vidro
    for (const ang of [0.4, 1.9, 3.6]) {
      const c = new THREE.Mesh(new THREE.PlaneGeometry(0.006, r * 1.4), new THREE.MeshBasicMaterial({ color: 0x3a0604 }));
      c.position.z = 0.002;
      c.rotation.z = ang;
      v.add(c);
    }
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const bolt = new THREE.Mesh(new THREE.SphereGeometry(r * 0.12, 6, 5), brass);
      bolt.position.set(Math.cos(a) * r * 1.32, Math.sin(a) * r * 1.32, 0.01);
      v.add(bolt);
    }
    v.position.copy(pos);
    v.rotation.y = rotY;
    g.add(v);
    return v;
  };
  visor(0.11, new THREE.Vector3(0, 0, 0.262), 0);
  visor(0.065, new THREE.Vector3(0.258, 0.01, 0.03), Math.PI / 2);
  visor(0.065, new THREE.Vector3(-0.258, 0.01, 0.03), -Math.PI / 2);
  // espinhos no alto e atrás
  for (const [x, y, z] of [[0, 0.27, -0.02], [0.12, 0.23, -0.1], [-0.12, 0.23, -0.1], [0, 0.18, -0.2], [0.18, 0.1, -0.15], [-0.18, 0.1, -0.15]]) {
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.11, 6), steel);
    const n = new THREE.Vector3(x, y, z).normalize();
    s.position.set(x, y, z).addScaledVector(n, 0.04);
    s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    g.add(s);
  }
  // anel do pescoço (encaixa na gola de cobre do modelo)
  const neck = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 22), brass);
  neck.rotation.x = Math.PI / 2;
  neck.position.y = -0.23;
  g.add(neck);
  // o axolote rosa pendurado no alto da frente
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.08, 4), dark);
  string.position.set(0.09, 0.2, 0.25);
  g.add(string);
  const pink = new THREE.MeshToonMaterial({ color: 0xff8ab8 });
  const ax = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), pink);
  ax.scale.set(1, 0.75, 1.5);
  ax.position.set(0.09, 0.15, 0.255);
  g.add(ax);
  for (const s of [-1, 1]) {
    const gill = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.03, 4), pink);
    gill.position.set(0.09 + s * 0.024, 0.165, 0.255);
    gill.rotation.z = -s * 1.1;
    g.add(gill);
  }
  return g;
}

export function addDalmoProps(rig) {
  const { sockets, props } = rig;
  const helm = colossoHelmet();
  helm.position.set(0, 0.17, 0.005);
  helm.visible = false;
  sockets.head.add(helm);
  props.helmet = helm;
  if (props.colosso) rig.showProp('colosso', false);
  if (props.shirt) rig.showProp('shirt', true);
  if (props.laces) rig.showProp('laces', true);
}

// COLOSSO: o escafandro posto, sem a camisa, com as Manoplas e o resto do traje
export function addColossoProps(rig) {
  addDalmoProps(rig);
  rig.showProp('helmet', true);
  if (rig.props.colosso) rig.showProp('colosso', true);
  if (rig.props.shirt) rig.showProp('shirt', false);
  if (rig.props.laces) rig.showProp('laces', false);
}

// A MAGISTRADA: a bengala na mão direita (como na arte), empunhada como espada
export function addMagistradaProps(rig) {
  const { sockets, props } = rig;
  const cane = bengala();
  cane.rotation.x = -0.3;
  sockets.handR.add(cane);
  props.cane = cane;
}

// GUIZO BOMBADO (Distorcer Aparência, uma das versões sorteadas): o mesmo Guizo, só que INFLADO — ombros e peito largos,
// um pouco mais alto
export function addGuizoBombadoProps(rig) {
  addGuizoProps(rig);
  rig.showProp('knife', false); // luta no soco
  rig.body.scale.set(1.24, 1.07, 1.22);
}

// GUIZO VELHO (outra versão, a referência "Guizo velho"): cabelo grisalho e o bigode farto
export function addGuizoVelhoProps(rig) {
  addGuizoProps(rig);
  rig.root.traverse((o) => {
    if (!o.isMesh || !o.material || !o.material.name || !/hair_guizo/.test(o.material.name)) return;
    o.material = o.material.clone();
    o.material.color.set(0x9a9a96);
    if (o.material.map) o.material.map = null;
  });
  const m = mustache(0x6a6a66);
  m.scale.setScalar(1.6);
  m.position.set(0, -0.005, 0.0);
  rig.sockets.mouth.add(m);
  rig.props.oldStache = m;
}

// CRISTINO (modelo próprio: tools/blender/char_cristino.py): a PEIXEIRA na mão direita; a ESPINGARDA SOCADEIRA atravessada
// nas costas (vai para as mãos no tiro — props.socadeira); o LAMPIÃO de espinhos pendurado no quadril esquerdo (e um na
// mão para arremessar — props.lantern); o pingente de Tenebris no peito. hideProp 'peixeira+gunBack' esconde os dois.
export function addCristinoProps(rig, { rifle = false } = {}) {
  const { sockets, props } = rig;
  const knife = peixeira();
  inFist(knife);
  sockets.handR.add(knife);
  props.peixeira = knife;
  const gun = socadeira({ rifle });
  gun.position.y = -0.02;
  gun.visible = false;
  sockets.handR.add(gun);
  props.socadeira = gun;
  rig.muzzle = gun.userData.muzzle;
  const back = socadeira({ rifle });
  back.position.set(0, 0.0, -0.06);
  back.rotation.set(0, 0, Math.PI * 0.78); // atravessada: o cano sai por cima do ombro esquerdo
  sockets.back.add(back);
  props.gunBack = back;
  const hipLamp = spikedLantern();
  hipLamp.position.set(0.02, -0.16, 0.06);
  sockets.hip.add(hipLamp);
  props.lanternHip = hipLamp;
  const lamp = spikedLantern();
  lamp.position.y = -0.1;
  lamp.visible = false;
  sockets.handR.add(lamp);
  props.lantern = lamp;
  const pend = tenebrisPendant();
  pend.position.set(0.06, -0.12, 0.03);
  sockets.chest.add(pend);
  props.pendant = pend;
}

// os RABISCOS VERMELHOS de quem tocou a Coroa de Espinhos (o Cristino Desertor): pintados num mapa de brilho por cima
// de cada textura — o couro, a pele e o pano continuam, e os rabiscos brilham. Só nas peças do corpo com UV.
function scribbleGlow(mat, seed) {
  const src = mat.map && mat.map.image;
  const w = (src && src.width) || 256;
  const h = (src && src.height) || 256;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  g.strokeStyle = '#ff2a1a'; g.lineCap = 'round'; g.lineJoin = 'round';
  const n = Math.round((w * h) / 9000) + 6;
  for (let i = 0; i < n; i++) {
    g.lineWidth = 1 + rnd() * 2.2;
    let x = rnd() * w;
    let y = rnd() * h;
    let a = rnd() * Math.PI * 2;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 14; k++) { a += (rnd() - 0.5) * 2.4; x += Math.cos(a) * 9; y += Math.sin(a) * 9; g.lineTo(x, y); }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false;
  if (mat.map) { t.wrapS = mat.map.wrapS; t.wrapT = mat.map.wrapT; t.repeat.copy(mat.map.repeat); }
  mat.emissiveMap = t;
  mat.emissive = new THREE.Color(0xff2a1a);
  mat.emissiveIntensity = 1.3;
  mat.userData.baseEmissive = { color: mat.emissive.clone(), intensity: 1.3 };
  mat.needsUpdate = true;
}

// CRISTINO DESERTOR (Transformação "Tocado pela Coroa"): o corpo todo coberto de rabiscos vermelhos e o RIFLE no lugar da
// Socadeira (as artes do Desertor)
export function addCristinoDesertorProps(rig) {
  addCristinoProps(rig, { rifle: true });
  const done = new Set();
  let seed = 5;
  rig.body.traverse((o) => {
    // só o corpo (malhas com esqueleto, material toon): as armas e a chama do lampião ficam como estão
    if (!o.isSkinnedMesh || o.userData.isOutline || !o.geometry.attributes.uv || !o.material.isMeshToonMaterial) return;
    const m = o.material;
    if (done.has(m) || m.userData.glow) return;
    done.add(m);
    scribbleGlow(m, (seed += 7919));
  });
}

// DANTE (modelo próprio: tools/blender/char_dante.py): sem armas. As orelhas pontudas (prop_eartip) só aparecem de
// OLHOS ABERTOS.
export function addDanteProps(rig) {
  rig.showProp('eartip_L+eartip_R', false);
}

// DANTE — OLHOS ABERTOS (a Transformação): o mesmo modelo com os olhos pretos e as duas faixas no rosto, as tatuagens
// de volta no pescoço e nos braços e as orelhas pontudas — "uma aparência bastante similar à de um Luzidio" (wiki)
const DANTE_OPEN = { face_dante: 'face_dante_open', skin_dante: 'skin_dante_open' };
const danteOpenTex = {};
export function addDanteAbertoProps(rig) {
  rig.showProp('eartip_L+eartip_R', true);
  const swapped = new Map();
  rig.root.traverse((o) => {
    if (!o.isMesh || !o.material || !o.material.name || o.userData.isOutline) return;
    const key = Object.keys(DANTE_OPEN).find((k) => o.material.name.endsWith(k));
    if (!key) return;
    if (!swapped.has(o.material)) {
      const m = o.material.clone();
      const id = DANTE_OPEN[key];
      if (!danteOpenTex[id]) {
        const t = MATERIAL_TEXTURES[id]();
        t.flipY = false;
        t.needsUpdate = true;
        danteOpenTex[id] = t;
      }
      m.map = danteOpenTex[id];
      m.userData.sharedMap = true;
      swapped.set(o.material, m);
    }
    o.material = swapped.get(o.material);
  });
}

// RAZIEL (Vampiros): tudo vem do modelo (garras, dentes, o casaco); a forma verdadeira é o mesmo .glb trocando as peças
// CELESTINE: as duas MACHADINHAS (uma em cada mão; a corrente entre elas aparece no arremesso e nos giros — combat) e
// a MÁSCARA DO DESESPERO guardada (aparece na Transformação: a forma Celestine, a Magistrada)
export function addCelestineProps(rig) {
  const { sockets, props } = rig;
  for (const side of ['R', 'L']) {
    const h = chainHatchet();
    inFist(h);
    if (side === 'L') h.rotation.y = Math.PI; // a lâmina para fora nas duas mãos
    sockets['hand' + side].add(h);
    props['hatchet' + side] = h;
  }
  const mask = despairMask();
  mask.position.set(0, -0.02, -0.02);
  mask.visible = false;
  sockets.mouth.add(mask);
  props.despairMask = mask;
  rig.root.add(hatchetChain(props.hatchetR, props.hatchetL));
  // as CHAMAS DE ENERGIA azul-turquesa das miniaturas de Calamidade: no cabelo, nos ombros, nos braços, nos lados do
  // tronco e subindo das pernas (que quase somem no fogo). Ficam sempre de pé (energyFlames: upright)
  const at = (joint, pos, o) => { const f = energyFlames(0x3ae8ff, o); f.position.set(...pos); rig.attach(joint, f); };
  at('hd', [0, 0.3, -0.03], { count: 3, radius: 0.03, height: 0.3, width: 0.14 });
  for (const [side, sx] of [['L', 1], ['R', -1]]) {
    at('s' + side, [0.05 * sx, 0.02, 0], { count: 6, radius: 0.11, height: 0.38, width: 0.15 });
    at('e' + side, [0.02 * sx, -0.12, 0], { count: 8, radius: 0.11, height: 0.44, width: 0.15 });
    at('sp', [0.2 * sx, 0.1, 0], { count: 6, radius: 0.09, height: 0.46, width: 0.15 });
    at('l' + side, [0.04 * sx, -0.2, 0], { count: 7, radius: 0.13, height: 0.46, width: 0.16 });
    at('k' + side, [0, -0.26, 0], { count: 9, radius: 0.12, height: 0.52, width: 0.17 });
  }
}

// A CORRENTE que liga as duas machadinhas (wiki: "os dois conectados por uma corrente"): elos de um pomo ao outro,
// pendendo entre as mãos; refeita a cada quadro (onBeforeRender) — estica quando os braços abrem, cai quando fecham.
// Some enquanto uma das machadinhas está fora da mão (o arremesso tem a própria corrente)
const _ca = new THREE.Vector3();
const _cb = new THREE.Vector3();
function hatchetChain(hR, hL, links = 16) {
  const g = new THREE.Group();
  const mat = toon(0x6a7078);
  const geo = new THREE.TorusGeometry(0.022, 0.0065, 5, 10);
  const ms = [];
  for (let i = 0; i < links; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.frustumCulled = false;
    m.castShadow = false;
    ms.push(m);
    g.add(m);
  }
  // o primeiro elo nunca fica invisível (é ele que atualiza os outros): sem corrente, todos encolhem a zero
  ms[0].onBeforeRender = () => {
    const show = hR.visible && hL.visible && !!g.parent;
    for (const m of ms) m.scale.setScalar(show ? 1 : 0.0001);
    if (!show) return;
    g.parent.updateWorldMatrix(true, false);
    g.parent.worldToLocal(hR.userData.ring.getWorldPosition(_ca)); // no espaço do modelo (o corpo só gira em y)
    g.parent.worldToLocal(hL.userData.ring.getWorldPosition(_cb));
    const sag = Math.max(0.05, 0.75 - _ca.distanceTo(_cb)) * 0.45; // corrente frouxa cai mais
    const yaw = Math.atan2(_cb.x - _ca.x, _cb.z - _ca.z) + Math.PI / 2;
    for (let i = 0; i < links; i++) {
      const t = i / (links - 1);
      ms[i].position.lerpVectors(_ca, _cb, t);
      ms[i].position.y -= sag * 4 * t * (1 - t);
      ms[i].rotation.set(i % 2 ? Math.PI / 2 : 0, yaw, 0);
    }
  };
  return g;
}

// CELESTINE, A MAGISTRADA: o mesmo corpo com a Máscara do Desespero no rosto
export function addCelestineMagistradaProps(rig) {
  addCelestineProps(rig); // a variante troca as peças da base: as machadinhas e a Máscara vêm de lá
  rig.showProp('despairMask', true);
}

// MEMBRO DA SEITA DAS MÁSCARAS (as invocações da Magistrada): as máscaras ficam todas no rosto, escondidas — quem invoca
// mostra uma por membro (abilities.js summonMasks), cada um com a sua
export function addSeitaProps(rig) {
  const { sockets, props } = rig;
  for (const kind of SEITA_MASKS) {
    const m = seitaMask(kind);
    m.position.set(0, -0.02, -0.02);
    m.visible = false;
    sockets.mouth.add(m);
    props['mask_' + kind] = m;
  }
}

export function addRazielProps(rig) {
  if (rig.props.true) rig.showProp('true', false); // o corpo rasgado só aparece na transformação
}

// O VERDADEIRO RAZIEL: rasgou a parte de cima das roupas — some o casaco de cima, a gola, o jabô, as correntes, e aparecem
// a ferida com as costelas, os braços rasgados até o osso e a língua
export function addRazielVerdadeiroProps(rig) {
  if (rig.props.up) rig.showProp('up', false);
  if (rig.props.true) rig.showProp('true', true);
}
