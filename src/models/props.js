import * as THREE from 'three';
import { glowMat } from './rig.js';
import { katana, scabbard, m4, sniper, guitarCase, bloodArm, knife, karambit, sickleBlade, mutilatorAxe, shotgun, handGrenade, antenna, barbedBat, chaosSkate, leonora, magnum, espadaConsumidora, facaPredadora, sniperFantasma, baluAxe, demonMace, gasMask, swordArnaldo, pocketWatch, roundGlasses, neonWraps, pulseEmitter, bandolier } from './weapons.js';

// Armas e acessórios adicionados em código sobre os modelos do Blender.
// Usam só `sockets`, `attach()` e `props`, que existem nos dois tipos de rig.

export function addKaiserProps(rig) {
  const { sockets, props } = rig;
  // faca karambit vermelha (cânone) na mão esquerda
  const kar = karambit();
  kar.rotation.set(-0.35, Math.PI, 0.5);
  sockets.handL.add(kar);
  props.karambit = kar;
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
  // Arma de Sangue: braço de sangue no lugar do braço esquerdo (escondido até o especial)
  const wp = (j) => rig.joints[j].getWorldPosition(new THREE.Vector3());
  const upperLen = wp('sL').distanceTo(wp('eL'));
  const arm = bloodArm(upperLen, upperLen * 0.95);
  rig.attach('sL', arm.upper);
  rig.attach('eL', arm.fore);
  // as duas partes ligam/desligam juntas
  const claw = {
    get visible() { return arm.upper.visible; },
    set visible(v) { arm.upper.visible = v; arm.fore.visible = v; },
    traverse(fn) { arm.upper.traverse(fn); arm.fore.traverse(fn); },
  };
  claw.visible = false;
  props.claw = claw;
  // olhos amaldiçoados do Rebirth
  const eyes = new THREE.Group();
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), glowMat(0x3aff6a, 1));
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
  blade.rotation.x = -0.35;
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
    d.rotation.set(-0.35, s === 'L' ? Math.PI : 0, 0);
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
  axe.rotation.x = -0.25;
  sockets.handR.add(axe);
  props.axe = axe;
  if (props.maskOn) rig.showProp('maskOn', false);
}

// LABIRINTO: a Antena na mão direita; o elmo do sorriso (do Blender) fica escondido
export function addLabirintoProps(rig) {
  const { sockets, props } = rig;
  const ant = antenna();
  ant.rotation.x = -0.35;
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
  hammer.rotation.x = -0.25;
  sockets.handR.add(hammer);
  props.leonora = hammer;
  const kn = knife();
  kn.visible = false;
  kn.rotation.x = -0.3;
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
  axe.rotation.x = -0.25;
  sockets.handR.add(axe);
  props.axe = axe;
  const mace = demonMace();
  mace.rotation.x = -0.25;
  mace.visible = false;
  sockets.handR.add(mace);
  props.demonMace = mace;
}

// FERREIRO: a Espada Consumidora (duas mãos)
export function addFerreiroProps(rig) {
  const { sockets, props } = rig;
  const sword = espadaConsumidora();
  sword.rotation.x = -0.25;
  sockets.handR.add(sword);
  props.sword = sword;
}

// JUAN: a Faca Predadora na mão direita
export function addJuanProps(rig) {
  const { sockets, props } = rig;
  const k = facaPredadora();
  k.rotation.x = -0.3;
  sockets.handR.add(k);
  props.knife = k;
}

// XANDE: taco com arame farpado na mão direita, Skate Caótico na esquerda

export function addXandeProps(rig) {
  const { sockets, props } = rig;
  const bat = barbedBat();
  bat.rotation.x = -0.3;
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
  right.rotation.x = -0.3;
  right.scale.setScalar(1.1);
  sockets.handR.add(right);
  props.bladeR = right;
  const left = sickleBlade();
  left.rotation.set(-0.3, Math.PI, 0);
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
  blade.rotation.x = -0.35;
  blade.visible = false;
  rig.sockets.handR.add(blade);
  rig.props.fearBlade = blade;
}

// KEMI / A FANTASMA: faca na mão direita, a Sniper Fantasma pendurada nas costas (vai para a mão no tiro) e o
// revólver .38 / Pistola Transtornada (aparece só nos tiros). 'stowed' = faca + rifle das costas (somem juntos
// quando ela ajoelha para mirar). ghost: na forma Fantasma o rifle pinga lodo.
function kemiProps(rig, ghost) {
  const { sockets, props } = rig;
  const k = knife();
  k.rotation.x = -0.3;
  sockets.handR.add(k);
  props.knife = k;
  const back = sniperFantasma({ drip: ghost });
  back.rotation.set(0, 0, 2.6);
  back.position.set(0, -0.12, -0.11);
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
  sword.rotation.x = -0.25;
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

// cabo que liga dois pontos do corpo e acompanha o movimento (tubo refeito a cada quadro no espaço do personagem)
function liveCable(rig, from, to, color) {
  const mat = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  mesh.frustumCulled = false;
  rig.root.add(mesh);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const inv = new THREE.Matrix4();
  let t = 0;
  mesh.onBeforeRender = () => {
    t += 0.016;
    rig.root.updateWorldMatrix(true, true);
    inv.copy(rig.root.matrixWorld).invert();
    from.getWorldPosition(a).applyMatrix4(inv);
    to.getWorldPosition(b).applyMatrix4(inv);
    // modelo recém-criado (antes da primeira pose) tem as juntas no mesmo ponto: a curva teria comprimento zero e o
    // TubeGeometry quebrava DENTRO da renderização (o quadro inteiro ficava preto — ex.: tela de vitória do Anfitrião)
    if (!(a.distanceToSquared(b) > 1e-6) || !Number.isFinite(a.x + a.y + a.z + b.x + b.y + b.z)) return;
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(Math.sin(t * 3) * 0.03, -0.12, 0.08));
    mesh.geometry.dispose();
    mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 12, 0.008, 5, false);
  };
  return mesh;
}

// SENHOR VERÍSSIMO (modelo próprio: tools/blender/char_verissimo.py): a espada do Arnaldo (mesmo modelo, com a fita) na
// mão direita, a bandoleira com cartuchos no peito e a escopeta curta (aparece no □)
export function addVerissimoProps(rig) {
  const { sockets, props } = rig;
  const sword = swordArnaldo();
  sword.rotation.x = -0.25;
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
  d.rotation.x = -0.3;
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
  blade.rotation.x = -0.45;
  sockets.handR.add(blade);
  props.katana = blade;
  if (props.maskSide) rig.showProp('maskSide', false);
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
}

// COLOSSO: o escafandro posto, sem a camisa, com as Manoplas e o resto do traje
export function addColossoProps(rig) {
  addDalmoProps(rig);
  rig.showProp('helmet', true);
  if (rig.props.colosso) rig.showProp('colosso', true);
  if (rig.props.shirt) rig.showProp('shirt', false);
}
