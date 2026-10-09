// PARK JAE-YOON — "JAE" ou "X" (id: jae) — Mascarados (Hexatombe), parceira do Mutilador Noturno e do Colosso.
// Assassina em série furtiva: trancou viajantes na Casa Juno num jogo macabro das chaves. "Ao encontrar no Sangue a
// liberdade da rebeldia... Jae matava porque podia." (ficha). Atributos: AGI 3, INT 3, FOR 2, PRE 1, VIG 1 → rápida e
// frágil. Afinidade: SANGUE.
// Visual (Referencias visuais/Personagens/Jae): 1,70 m, traços coreanos, cabelo preto com franja sobre um olho,
// maquiagem preta forte nos olhos, batom vermelho, pinta no queixo; gola alta preta canelada; sobretudo VERMELHO longo
// aberto, com lapelas, botões dourados, tiras cinza com fivelas de latão, tiras pretas em X nos punhos e barra com
// laços em X e tiras penduradas; luvas sem dedos; por baixo suspensórios cinza, cinto e tiras vermelhas em X nas
// pernas; coturnos com polainas cinza. Arma: o PUNHAL X (adaga de guarda de latão).
// Kit do RPG (ficha): Assassinato Furtivo, Zona dos Sussurros, Punhal X (cega), Zona das Sombras (armadilha de
// Conhecimento que cega) e Assassinato Cruel. TRANSFORMAÇÃO: puxa o capuz — o rosto some na escuridão e um X vermelho
// aparece no lugar dele: vira X até o fim do round (forms/jae_x.js).
const RED = 0xd01828;
const STEEL = 0xd8d4dc;

export const JAE_KIT = {
  stats: { moveSpeed: 8.3, maxHealth: 930 }, // VIG 1: a mais frágil das assassinas, AGI 3: a mais rápida
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_jae', block: 'block' },
  chargeFx: { style: 'blood', color: RED },
  dodge: { style: 'default', distance: 5.8 },

  melee: {
    name: 'Punhal X',
    strikes: [
      { name: 'Corte rápido', anim: 'knife_1', dur: 0.22, active: [0.05, 0.12], damage: 22, range: 1.7, arc: 110, knockback: 0.6, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: 0.05 } },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.22, active: [0.05, 0.12], damage: 22, range: 1.7, arc: 110, knockback: 0.6, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, flip: true } },
      { name: 'Punhalada', anim: 'knife_3', dur: 0.26, active: [0.07, 0.14], damage: 26, range: 1.8, arc: 90, knockback: 0.8, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -0.4 } },
      { name: 'Estocada', anim: 'thrust', dur: 0.28, active: [0.09, 0.16], damage: 28, range: 1.9, arc: 70, knockback: 0.9, lunge: 1.4, sound: 'blade', hitSound: 'bladeHit' },
      // o X: dois cortes cruzados — a marca dela
      { name: 'X', anim: 'dual_cross', dur: 0.44, active: [0.15, 0.25], damage: 50, range: 1.9, arc: 130, lunge: 1.7, finisher: 'launch', sound: 'slashFinal', hitSound: 'bladeHit', trail: { color: RED, roll: 0.9, big: true } },
    ],
    up: { name: 'Corte ascendente', anim: 'slash_up', dur: 0.36, active: [0.11, 0.21], damage: 36, range: 1.8, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.42, active: [0.15, 0.25], damage: 40, range: 1.8, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Bote na sombra', anim: 'dash_slash', dur: 0.38, active: [0.12, 0.23], damage: 30, range: 1.9, arc: 100, knockback: 1.5, motion: [{ t: [0, 0.23], fwd: 6.2, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: RED, tilt: 0.1 } },
    back: { name: 'Some e volta', anim: 'knife_evade', dur: 0.44, active: [0.25, 0.33], damage: 28, range: 1.8, arc: 100, knockback: 1.8, iframes: [0, 0.22], motion: [{ t: [0, 0.14], back: 2.6 }, { t: [0.18, 0.3], fwd: 2.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Flanco', anim: 'knife_2', dur: 0.3, active: [0.09, 0.17], damage: 28, range: 1.8, arc: 140, knockback: 1.3, motion: [{ t: [0, 0.2], side: 2.8 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL } },
    air: { name: 'Punhal do alto', anim: 'air_knife', dur: 0.38, active: [0.11, 0.27], damage: 30, range: 1.8, arc: 110, knockback: 2.4, slam: 15, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, roll: 1.3 } },
  },

  // □: PUNHAIS ARREMESSADOS — dois, rápidos (ela sempre tem mais um no cinto)
  ranged: {
    name: 'Punhais Arremessados',
    type: 'projectile',
    anim: 'throw_r',
    windup: 0.16,
    recovery: 0.3,
    count: 2,
    interval: 0.12,
    damage: 22,
    range: 24,
    speed: 44,
    radius: 0.32,
    spread: 4,
    knockback: 0.8,
    hitstun: 0.3,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'knife',
    color: STEEL,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      id: 'punhalX',
      name: 'Punhal X',
      input: 'carga+physical', // △ → ○
      type: 'dashStrike',
      description: 'Avança com o Punhal X e corta: quem é acertado fica CEGO por um instante — não consegue se defender nem se virar.',
      energyCost: 20,
      cooldown: 10,
      windup: 0.15,
      distance: 7,
      speed: 26,
      range: 1.9,
      recovery: 0.3,
      damage: 38,
      knockback: 1.2,
      hitstun: 0.5,
      blind: 1.2,
      color: RED,
      element: 'sangue',
      anim: 'dash_slash',
      hitSound: 'bladeHit',
    },
    {
      id: 'zonaSombras',
      name: 'Zona das Sombras',
      input: 'carga+ranged', // △ → □
      type: 'shadowTrap',
      description: 'Arma uma armadilha de Conhecimento quase invisível no chão (3 m). Quem pisa toma dano de Conhecimento e fica CEGO.',
      energyCost: 25,
      cooldown: 14,
      radius: 1.6,
      damage: 60,
      blind: 1.6,
      life: 16,
      element: 'conhecimento',
      color: 0xe0b030,
    },
    {
      id: 'assassinatoFurtivo',
      name: 'Assassinato Furtivo',
      input: 'carga+dodge', // △ + L2
      type: 'teleportBehind',
      description: 'Some nas sombras e surge pelas costas do alvo, que fica desprevenido — o próximo golpe dela entra com o bônus de assassina.',
      energyCost: 20,
      cooldown: 9,
      distance: 1.3,
      vanishTime: 0.22,
      surpriseTime: 0.6,
      color: RED,
    },
    {
      id: 'zonaSussurros',
      name: 'Zona dos Sussurros',
      input: 'block+carga', // R2 + △
      type: 'whisperZone',
      description: 'Marca um X vermelho no chão. Dentro da área ela bate 25% mais forte e anda mais rápido (8 s).',
      energyCost: 25,
      cooldown: 18,
      radius: 3.2,
      duration: 8,
      mult: 1.25,
      speedMult: 1.12,
      color: RED,
    },
  ],

  // ASSASSINATO CRUEL: some, surge colada no alvo e abre o corpo em cortes rápidos até o X final
  special: {
    name: 'Assassinato Cruel',
    banner: 'Assassinato Cruel',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: RED,
    sound: 'specialStart',
    prepare: { anim: 'vanish', time: 0.35 },
    dash: { speed: 26, maxTime: 0.4, contact: 1.8 },
    hits: [
      { t: 0.6, anim: 'knife_1', dur: 0.22, share: 0.12, fx: { kind: 'slash', tilt: 0.05 }, sound: 'bladeHit' },
      { t: 0.82, anim: 'knife_2', dur: 0.22, share: 0.12, fx: { kind: 'slash', flip: true }, sound: 'bladeHit' },
      { t: 1.04, anim: 'knife_3', dur: 0.24, share: 0.12, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.3, anim: 'thrust', dur: 0.26, share: 0.14, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.8, anim: 'dual_cross', dur: 0.44, share: 0.5, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.2,
    length: 2.8,
  },

  // Jae matava porque podia: golpe em quem está desprevenido, cego ou de costas entra muito mais forte
  passives: [
    { type: 'backstab', kinds: ['melee', 'ability'], mult: 1.3, surprised: true },
  ],
};

export default {
  id: 'jae',
  name: 'JAE',
  model: 'jae',
  color: '#c81e2e',
  origin: 'Mascarados', // Hexatombe (associação: Assassinos)
  element: 'sangue',
  energyColor: RED,
  info: {
    weapon: 'Punhal X (adaga) e punhais de arremesso',
    style: 'Assassina furtiva: some, surge pelas costas, cega e corta — rápida e frágil',
    identity: 'Assassina em série: puxando o capuz vira X',
    tagline: 'Shh. Não grita.',
  },
  ...JAE_KIT,

  // TRANSFORMAÇÃO (Barra de Transformação cheia + vida baixa, segurando △): puxa o capuz, sorri, e o rosto some na
  // escuridão com o X vermelho no lugar — X até o fim do round
  awakening: {
    name: 'Capuz do X',
    banner: 'Capuz do X',
    type: 'maskTransform',
    form: 'jae_x',
    formBanner: 'X',
    prop: 'hoodUp',
    duration: 0, // até o fim do round
    bonusHealth: 80,
    color: RED,
  },
};
