// GAIUS (id: gaius) — ORDO CALAMITAS (Calamidade, 67 d.C.). Wiki "Gaius": "um homem velho, de cabelo curto e uma
// barba, ambos grisalhos; armadura com alguns panos roxos, um cachecol, um capuz, uma capa e um pano no peito com o
// Símbolo da Ordo Calamitas"; nas memórias, a aura e os olhos ROXOS. Cansado, reclama da idade e vangloria a juventude
// dos colegas — mas é confiante, "ciente de sua força e seu poder". Antes da Ordo, foi da SEITA DAS MÁSCARAS (um acordo
// para curar a filha). Arma: a MAÇA pequena de ferro, de uma mão, com o cabo em couro. A única habilidade conhecida dele
// (sem nome revelado) ANULAVA uma habilidade usada contra ele.
// Transformação canônica (Calamidade ep. 5): a Relíquia de Energia se projeta no rosto dele e ele vira AMPHITRUO, o
// primeiro Anfitrião (forms/amphitruo.js — o kit do Anfitrião com a aparência do Gaius mascarado). Na seleção, o RB/LB
// troca entre o Gaius e o Amphitruo (characters/index.js VERSION_GROUPS).
// Modelo próprio do Blender (public/models/gaius.glb, tools/blender/char_gaius.py) + a maça e a máscara em código.
const PURPLE = 0x9a5aff;
const IRON = 0x9a9ca4;

export default {
  id: 'gaius',
  name: 'GAIUS',
  model: 'gaius',
  color: '#9a5aff',
  origin: 'Ordo Calamitas',
  element: 'energia',
  energyColor: PURPLE,
  info: {
    weapon: 'A maça pequena de ferro',
    style: 'Golpes curtos e pesados de veterano, a defesa de quem já apanhou de tudo e a habilidade que anula o que vem contra ele',
    identity: 'O mais velho da Ordo Calamitas: reclama da idade, mas sabe muito bem a força que tem',
    tagline: 'Ah, a juventude... Senta aí, que o velho vai te mostrar.',
  },
  stats: { moveSpeed: 7.2, attackSpeed: 0.95 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge', victory: 'vic_magistrada', block: 'block_weapon' },
  chargeFx: { style: 'default', color: PURPLE },
  dodge: { style: 'default' },

  melee: {
    name: 'Maça de Ferro',
    // sem pressa: a maça bate curto e pesado, e a mão livre empurra (o velho guerreiro não desperdiça movimento)
    strikes: [
      { name: 'Maçada', anim: 'slash_h', dur: 0.34, active: [0.12, 0.2], damage: 32, range: 2.0, arc: 120, knockback: 1.2, lunge: 0.9, sound: 'swing', hitSound: 'heavyPunch', trail: { color: IRON, tilt: 0.05 } },
      { name: 'Revés da Maça', anim: 'slash_h_back', dur: 0.34, active: [0.12, 0.2], damage: 32, range: 2.0, arc: 120, knockback: 1.2, lunge: 0.9, sound: 'swing', hitSound: 'heavyPunch', trail: { color: IRON, flip: true } },
      { name: 'Empurrão do Veterano', anim: 'hook_r', dur: 0.36, active: [0.12, 0.22], damage: 26, range: 1.7, arc: 90, knockback: 2.0, lunge: 0.8, sound: 'punch', hitSound: 'heavyPunch' },
      { name: 'Maça de Cima', anim: 'slash_v', dur: 0.46, active: [0.18, 0.28], damage: 44, range: 2.1, arc: 100, knockback: 1.6, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4, trail: { color: IRON, roll: 1.5 } },
      { name: 'Ainda Dou Conta', anim: 'slash_finisher', dur: 0.64, active: [0.3, 0.42], damage: 62, range: 2.3, arc: 120, lunge: 1.3, finisher: 'launch', hitstop: 0.12, element: 'energia', sound: 'slashFinal', hitSound: 'heavyPunch', impactScale: 2.0, trail: { color: PURPLE, roll: 1.5, big: true } },
    ],
    up: { name: 'Maça para Cima', anim: 'slash_up', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.1, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: IRON, tilt: -1.3 } },
    down: { name: 'Esmagar', anim: 'slash_v', dur: 0.52, active: [0.2, 0.32], damage: 48, range: 2.1, arc: 110, lunge: 0.9, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.5, trail: { color: IRON, roll: 1.5 } },
    forward: { name: 'Passo Pesado', anim: 'dash_slash', dur: 0.44, active: [0.13, 0.25], damage: 38, range: 2.2, arc: 120, knockback: 2.6, motion: [{ t: [0, 0.22], fwd: 4.6, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: IRON, tilt: 0.1 } },
    back: { name: 'Recuo e Contragolpe', anim: 'slash_h', dur: 0.56, active: [0.32, 0.42], damage: 36, range: 2.2, arc: 120, knockback: 2.4, iframes: [0, 0.24], motion: [{ t: [0, 0.2], back: 2.4 }], sound: 'swing', hitSound: 'heavyPunch' },
    side: { name: 'Maçada Larga', anim: 'slash_h', dur: 0.48, active: [0.13, 0.3], damage: 34, range: 2.3, arc: 280, knockback: 1.8, motion: [{ t: [0, 0.25], side: 2.2 }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: IRON, wide: true } },
    air: { name: 'Queda da Maça', anim: 'air_slash', dur: 0.44, active: [0.16, 0.32], damage: 38, range: 2.2, arc: 100, knockback: 3.2, slam: 16, vertical: 2.4, sound: 'swing', hitSound: 'heavyPunch', trail: { color: IRON, roll: 1.5 } },
  },

  // □: MAÇA ARREMESSADA — a maça sai girando da mão e volta no fim
  ranged: {
    name: 'Maça Arremessada',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'hand',
    hideProp: 'mace',
    windup: 0.26,
    recovery: 0.32,
    count: 1,
    interval: 0,
    damage: 34,
    range: 13,
    speed: 24,
    radius: 0.5,
    spread: 0,
    knockback: 1.6,
    hitstun: 0.5,
    cooldown: 2.8,
    energyCost: 0,
    visual: 'ironMace',
    color: IRON,
    sound: 'knifeThrow',
    hitSound: 'heavyPunch',
  },

  abilities: [
    {
      id: 'golpeVeterano',
      name: 'Golpe do Veterano',
      input: 'carga+physical', // △ + ○
      type: 'heavyBlow',
      description: 'Firma os pés, ergue a maça e desce com tudo — gasta muito da defesa e derruba. Preparação longa (aguenta um golpe pequeno depois de firmar); errar deixa ele aberto.',
      energyCost: 30,
      cooldown: 12,
      anim: 'slash_v',
      duration: 1.15,
      armorFrom: 0.3,
      impact: 0.7,
      step: 4.5,
      range: 2.2,
      arc: 90,
      damage: 88,
      knockback: 4,
      guardCrush: 60,
      whiffRecovery: 0.5,
      ai: { when: 'opening', max: 2.5 },
    },
    {
      // a habilidade dele no cânone (sem nome revelado): "permitia que ele anulasse uma habilidade usada contra ele"
      id: 'anular',
      name: 'Anular',
      input: 'carga+dodge', // △ + L2
      type: 'selfBuff',
      buffType: 'nullify',
      label: 'ANULAR',
      anim: 'concentrate',
      animTime: 0.35,
      description: 'Já viu de tudo e sabe desmanchar um poder: por 3 s as HABILIDADES usadas contra ele não causam dano (golpes físicos, tiros e especiais ainda doem).',
      energyCost: 25,
      cooldown: 18,
      duration: 3,
      takenMult: 0,
      takenKinds: ['ability'],
      color: PURPLE,
    },
    {
      id: 'cargaVeterano',
      name: 'Carga do Veterano',
      input: 'block+jump', // R2 + ×
      type: 'dashStrike',
      description: 'Abaixa o ombro e avança com a maça por baixo — quebra a defesa e empurra longe.',
      energyCost: 20,
      cooldown: 10,
      anim: 'dash_slash',
      windup: 0.3,
      distance: 5.5,
      speed: 20,
      recovery: 0.36,
      range: 2.2,
      damage: 52,
      knockback: 3.4,
      guardBreak: true,
      hitSound: 'heavyPunch',
      color: PURPLE,
    },
    {
      // cansado, reclama da idade — mas aguenta: a armadura e a teimosia de quem já apanhou de tudo
      id: 'cansadoMasFirme',
      name: 'Cansado, Mas Firme',
      input: 'block+carga', // R2 + △
      type: 'selfBuff',
      buffType: 'oldGuard',
      label: 'CANSADO, MAS FIRME',
      anim: 'concentrate',
      animTime: 0.45,
      sound: 'perfectBlock',
      description: 'Respira fundo e se planta: por 6 s recebe 25% menos dano, é empurrado bem menos e aguenta 2 golpes sem recuar.',
      energyCost: 20,
      cooldown: 18,
      duration: 6,
      takenMult: 0.75,
      knockbackTakenMult: 0.5,
      armor: 2,
      color: PURPLE,
    },
  ],

  // CIENTE DA PRÓPRIA FORÇA: o velho avança e a maça não para — o último golpe já vem com o roxo da Energia
  special: {
    name: 'Ciente da Própria Força',
    banner: 'Ainda dou conta!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: PURPLE,
    sound: 'specialStart',
    prepare: { anim: 'charge', time: 0.35, fx: 'bladeGlow' },
    dash: { speed: 22, maxTime: 0.45, contact: 1.8 },
    hits: [
      { t: 0.75, anim: 'slash_h', dur: 0.32, share: 0.14, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.04, anim: 'slash_h_back', dur: 0.32, share: 0.14, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.36, anim: 'hook_r', dur: 0.34, share: 0.16, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.74, anim: 'slash_v', dur: 0.44, share: 0.2, fx: { kind: 'smash', big: true }, sound: 'heavyPunch' },
      { t: 2.26, anim: 'slash_finisher', dur: 0.56, share: 0.36, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.15,
    length: 3.0,
  },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): a Relíquia de Energia se projeta no rosto dele — a MÁSCARA
  // sorridente com as três mãos se funde ao rosto, a maça é consumida e ele vira AMPHITRUO, o primeiro Anfitrião
  awakening: {
    name: 'A Relíquia de Energia',
    banner: 'Amphitruo',
    type: 'maskTransform',
    prop: 'amphMask',
    swap: [['mace', false]],
    form: 'amphitruo',
    formBanner: 'AMPHITRUO',
    color: PURPLE,
    tint: 0xb04aff,
    bonusHealth: 300,
  },

  passives: [
    { type: 'sonOfPain', after: 3, mult: 0.8 }, // Couro Velho: apanhando seguido, firma e resiste mais (já apanhou de tudo)
  ],
};
