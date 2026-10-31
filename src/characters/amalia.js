// AMALIA (id: amalia) — ORDO CALAMITAS (Calamidade, 67 d.C.). Wiki "Amalia": "A Flecha" (a Celestine a chama de "Gata"),
// guerreira da Ordo escolhida a dedo pela habilidade com o ARCO; "uma mulher negra com cabelos cacheados escuros, um
// vestido com um manto verde, fivelas até o pescoço, um cachecol, ombreiras metálicas pontudas, o Símbolo da Ordo
// Calamitas no peito e uma grande cicatriz em cruz no rosto"; nas memórias revividas, a AURA CIANO e os olhos acesos.
// Quieta: fala só o necessário (mais solta com a Cascadia). "Não perde a cabeça!" (Calamidade ep. 6).
// Arsenal: o grande arco verde de detalhes brancos e as FLECHAS FLAMEJANTES da cor da aura.
// Habilidades da ficha: ALTRUÍSMO (sacrifica a própria existência por um aliado), LONGA-DISTÂNCIA (de longe, o alvo não
// esquiva, não defende e não contra-ataca) e CAÓTICA (depois de acertar, devolve existência a um aliado).
// Modelo próprio do Blender (public/models/amalia.glb, tools/blender/char_amalia.py) + o arco e a aura em código.
const CYAN = 0x3affd0;
const BOW = 0x6ac8a0;

export default {
  id: 'amalia',
  name: 'AMALIA',
  model: 'amalia',
  color: '#3ae8b8',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: CYAN,
  info: {
    weapon: 'O grande arco verde e as flechas flamejantes',
    style: 'Distância e precisão: flechas que não erram de longe, a chuva de flechas e o arco como arma de perto',
    identity: 'A Flecha: a arqueira da Ordo Calamitas — fala pouco, acerta sempre',
    tagline: 'Não perde a cabeça!', // a fala dela em Calamidade (ep. 6)
  },
  stats: { moveSpeed: 8.0, attackSpeed: 1.05 },
  ai: { style: 'zoner' }, // a CPU luta de longe com ela (kitProfile): é arqueira, não perseguidora
  anims: { idle: 'bow_idle', run: 'run', charge: 'charge', victory: 'vic_magistrada', block: 'block_weapon' },
  chargeFx: { style: 'default', color: CYAN },
  dodge: { style: 'default', distance: 5 },

  melee: {
    name: 'Arco e Chutes',
    // de perto o arco vira arma: as pontas brancas cortam, e os chutes abrem espaço para atirar
    strikes: [
      { name: 'Corte do Arco', anim: 'slash_h', dur: 0.3, active: [0.1, 0.18], damage: 26, range: 2.0, arc: 120, knockback: 1.0, lunge: 0.9, sound: 'swing', hitSound: 'blade', trail: { color: BOW, tilt: 0.05 } },
      { name: 'Revés do Arco', anim: 'slash_h_back', dur: 0.3, active: [0.1, 0.18], damage: 26, range: 2.0, arc: 120, knockback: 1.0, lunge: 0.9, sound: 'swing', hitSound: 'blade', trail: { color: BOW, flip: true } },
      { name: 'Chute Frontal', anim: 'kick_front', dur: 0.36, active: [0.14, 0.22], damage: 30, range: 1.9, arc: 90, knockback: 2.2, lunge: 0.6, sound: 'swing', hitSound: 'kick' },
      { name: 'Chute Giratório', anim: 'spin_kick', dur: 0.44, active: [0.16, 0.28], damage: 36, range: 2.0, arc: 200, knockback: 1.8, lunge: 0.7, sound: 'swing', hitSound: 'kick' },
      { name: 'Flecha à Queima-Roupa', anim: 'bow_shot', dur: 0.62, active: [0.36, 0.46], damage: 58, range: 3.2, arc: 60, lunge: 0.3, finisher: 'launch', hitstop: 0.1, element: 'energia', sound: 'sniper', hitSound: 'impact', impactFx: 'sigil', impactScale: 1.6, trail: { color: CYAN, wide: true } },
    ],
    up: { name: 'Arco para Cima', anim: 'slash_up', dur: 0.44, active: [0.15, 0.27], damage: 38, range: 2.0, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'blade', trail: { color: BOW, tilt: -1.3 } },
    down: { name: 'Pisão', anim: 'stomp', dur: 0.48, active: [0.2, 0.3], damage: 42, range: 1.9, arc: 120, lunge: 0.6, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch' },
    forward: { name: 'Avanço Rasteiro', anim: 'side_kick', dur: 0.42, active: [0.13, 0.24], damage: 34, range: 2.1, arc: 100, knockback: 2.6, motion: [{ t: [0, 0.2], fwd: 4.6, stopClose: true }], sound: 'swing', hitSound: 'kick' },
    back: { name: 'Salto e Flecha', anim: 'bow_shot', dur: 0.6, active: [0.34, 0.44], damage: 32, range: 4.5, arc: 50, knockback: 1.6, iframes: [0, 0.22], motion: [{ t: [0, 0.22], back: 3.4 }], element: 'energia', sound: 'sniper', hitSound: 'impact', trail: { color: CYAN, wide: true } },
    side: { name: 'Giro do Arco', anim: 'slash_h', dur: 0.46, active: [0.13, 0.3], damage: 32, range: 2.2, arc: 280, knockback: 1.6, motion: [{ t: [0, 0.25], side: 2.4 }], sound: 'swing', hitSound: 'blade', trail: { color: BOW, wide: true } },
    air: { name: 'Flecha do Alto', anim: 'air_kick', dur: 0.44, active: [0.16, 0.3], damage: 34, range: 2.2, arc: 100, knockback: 3, slam: 16, vertical: 2.4, sound: 'swing', hitSound: 'kick' },
  },

  // □: FLECHA FLAMEJANTE — rápida e de longe; LONGA-DISTÂNCIA: depois de 12 m de voo ela não pode ser esquivada nem defendida
  ranged: {
    name: 'Flecha Flamejante',
    type: 'projectile',
    anim: 'bow_shot',
    origin: 'chest',
    windup: 0.34,
    recovery: 0.24,
    count: 1,
    interval: 0,
    damage: 28,
    range: 30,
    speed: 38,
    radius: 0.32,
    spread: 0,
    knockback: 0.8,
    hitstun: 0.4,
    cooldown: 1.8,
    energyCost: 0,
    visual: 'flameArrow',
    color: CYAN,
    element: 'energia',
    sound: 'sniper',
    hitSound: 'impact',
    longRange: { from: 12 },
  },

  abilities: [
    {
      // LONGA-DISTÂNCIA (a ficha): a mira longa, a corda puxada até o rosto — de longe, ninguém esquiva nem defende
      id: 'longaDistancia',
      name: 'Longa-Distância',
      input: 'carga+ranged', // △ + □
      type: 'deathShot',
      description: 'Mira com calma e solta a flecha mais forte: a mais de 9 m o alvo NÃO consegue esquivar nem defender. A mira deixa ela parada um instante.',
      energyCost: 30,
      cooldown: 14,
      windup: 0.95,
      recovery: 0.3,
      aimAnim: 'bow_aim',
      fireAnim: 'bow_shot',
      aimColor: CYAN,
      element: 'energia',
      projectile: { name: 'Longa-Distância', type: 'projectile', visual: 'flameArrow', color: CYAN, damage: 88, range: 40, speed: 62, radius: 0.36, knockback: 2.6, hitstun: 0.7, launch: true, hitSound: 'heavyPunch', impactScale: 1.6, longRange: { from: 9 } },
      ai: { when: 'far', min: 6 },
    },
    {
      id: 'chuvaDeFlechas',
      name: 'Chuva de Flechas',
      input: 'carga+physical', // △ + ○
      type: 'flowerRain',
      description: 'Atira para o alto e as flechas flamejantes caem sobre a área do alvo — machucam enquanto ele ficar dentro do círculo.',
      energyCost: 25,
      cooldown: 13,
      anim: 'bow_shot',
      sound: 'sniper',
      range: 20,
      radius: 2.6,
      castTime: 0.5,
      hits: 6,
      interval: 0.2,
      damage: 72,
      color: CYAN,
    },
    {
      // ALTRUÍSMO (a ficha): sacrifica a própria existência por um aliado
      id: 'altruismo',
      name: 'Altruísmo',
      input: 'carga+dodge', // △ + L2
      type: 'altruism',
      description: 'Sacrifica 6% da própria vida pelos aliados: na batalha em equipe as ASSISTÊNCIAS voltam na hora e a Barra de Equipe enche um pouco; sozinha, recupera 40 de sanidade e as esquivas.',
      energyCost: 0,
      cooldown: 20,
      healthCost: 0.06,
      energy: 40,
      refillDodges: 2,
      teamGauge: 20,
      color: CYAN,
    },
    {
      id: 'flechasCaoticas',
      name: 'Flechas Caóticas',
      input: 'block+jump', // R2 + ×
      type: 'cursedShots',
      description: 'Três flechas em leque, uma atrás da outra — boas para pegar quem vem correndo de lado.',
      energyCost: 20,
      cooldown: 10,
      windup: 0.24,
      count: 3,
      interval: 0.14,
      spread: 14,
      anim: 'bow_shot',
      projectile: { visual: 'flameArrow', color: CYAN, damage: 20, range: 26, speed: 40, radius: 0.3, knockback: 0.6, hitstun: 0.3, element: 'energia', hitSound: 'impact' },
    },
  ],

  // NÃO PERDE A CABEÇA! (a fala dela no último jogo do Anfitrião): chega chutando, gira o arco e fecha com a flecha
  // flamejante à queima-roupa
  special: {
    name: 'Não Perde a Cabeça!',
    banner: 'Não perde a cabeça!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: CYAN,
    sound: 'specialStart',
    prepare: { anim: 'bow_aim', time: 0.35, fx: 'bladeGlow' },
    dash: { speed: 24, maxTime: 0.45, contact: 1.8 },
    hits: [
      { t: 0.75, anim: 'kick_front', dur: 0.3, share: 0.12, fx: { kind: 'smash' }, sound: 'kick' },
      { t: 1.02, anim: 'slash_h', dur: 0.3, share: 0.14, fx: { kind: 'slash' }, sound: 'blade' },
      { t: 1.3, anim: 'slash_h_back', dur: 0.3, share: 0.14, fx: { kind: 'slash' }, sound: 'blade' },
      { t: 1.62, anim: 'spin_kick', dur: 0.4, share: 0.2, fx: { kind: 'smash', big: true }, sound: 'kick' },
      { t: 2.14, anim: 'bow_shot', dur: 0.56, share: 0.4, fx: { kind: 'cross', big: true }, sound: 'sniper', final: true },
    ],
    bannerAt: 0.15,
    length: 2.9,
  },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): a MEMÓRIA REVIVIDA — a aura ciano toma o corpo todo e os olhos
  // acendem (Calamidade ep. 5): as flechas batem mais, as recargas correm e ela fica mais ligeira
  awakening: {
    name: 'Memória Revivida',
    banner: 'A Flecha',
    type: 'awakenMode',
    mult: 1.15, affects: ['ranged', 'ability'], cdRate: 1.3, speedMult: 1.08, aura: 'flame', color: CYAN, heal: 0.1,
  },

  passives: [
    { type: 'chaotic', every: 2, heal: 0.02, color: CYAN }, // CAÓTICA: a cada 2 flechas que acertam, a existência volta (cura)
    { type: 'longShot', minDist: 10, mult: 1.1 }, // de longe, um pouco mais de dano (a arqueira escolhida a dedo)
  ],
};
