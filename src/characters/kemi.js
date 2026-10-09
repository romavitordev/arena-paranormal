// KEMI (id: kemi) — "a Fantasma" de Hexatombe: assassina silenciosa e mercenária, a última a entrar para os
// Assassinos de Dalmo Magno. 1,60 m, dreads loiros quase brancos presos no alto, olhos âmbar, piercings, top branco,
// calça larga, casaco amarrado na cintura e bandagens pelo corpo. Afinidade com Morte.
// Kit do cânone: Sniper Fantasma (rifle de Morte), faca, revólver .38 e a Pistola Transtornada (arame farpado);
// Perita, Disparo da Morte, Sniper da Morte e a Sede de Vingança (o poder de intenção da Lena no corpo dela).
// Especial: VESTIR AS FAIXAS — vira A FANTASMA por um tempo (ver forms/fantasma.js).
export default {
  id: 'kemi',
  name: 'KEMI',
  model: 'kemi',
  color: '#d8c890',
  origin: 'Mascarados', // Hexatombe (associação: Assassinos)
  element: 'morte',
  energyColor: 0xa7a3ad,
  info: {
    weapon: 'Sniper Fantasma (rifle de Morte), faca e revólver .38',
    style: 'Atiradora de elite: mira com calma de longe, faca rápida de perto e o tempo desacelerando no tiro certo',
    identity: 'Assassina silenciosa: vestindo as faixas vira A Fantasma',
    tagline: 'Um contrato é um contrato.',
  },
  stats: { moveSpeed: 7.9 },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_kemi', block: 'block' },
  chargeFx: { style: 'default', color: 0xa7a3ad },
  dodge: { style: 'default', distance: 5.4 },

  melee: {
    name: 'Faca',
    strikes: [
      { name: 'Corte rápido', anim: 'knife_1', dur: 0.24, active: [0.06, 0.13], damage: 24, range: 1.7, arc: 110, knockback: 0.7, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8d4dc, tilt: 0.05 } },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.24, active: [0.06, 0.13], damage: 24, range: 1.7, arc: 110, knockback: 0.7, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8d4dc, flip: true } },
      { name: 'Coronhada', anim: 'shoulder_bash', dur: 0.32, active: [0.1, 0.18], damage: 30, range: 1.6, arc: 90, knockback: 1.0, lunge: 1.2, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Estocada no pescoço', anim: 'thrust', dur: 0.3, active: [0.1, 0.17], damage: 30, range: 1.9, arc: 70, knockback: 0.9, lunge: 1.4, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Execução', anim: 'knife_final', dur: 0.46, active: [0.16, 0.26], damage: 52, range: 1.9, arc: 120, lunge: 1.8, finisher: 'launch', sound: 'slashFinal', hitSound: 'bladeHit', trail: { color: 0x4a4650, roll: 1.4, big: true } },
    ],
    up: { name: 'Corte para cima', anim: 'slash_up', dur: 0.38, active: [0.12, 0.22], damage: 38, range: 1.8, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8d4dc, tilt: -1.3 } },
    down: { name: 'Rasteira e faca', anim: 'kick_low', dur: 0.44, active: [0.16, 0.26], damage: 42, range: 1.8, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Bote silencioso', anim: 'dash_slash', dur: 0.4, active: [0.13, 0.24], damage: 32, range: 1.9, arc: 100, knockback: 1.6, motion: [{ t: [0, 0.24], fwd: 5.8, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8d4dc, tilt: 0.1 } },
    back: { name: 'Recua e corta', anim: 'knife_evade', dur: 0.46, active: [0.26, 0.34], damage: 30, range: 1.8, arc: 100, knockback: 1.8, iframes: [0, 0.2], motion: [{ t: [0, 0.14], back: 2.4 }, { t: [0.18, 0.3], fwd: 2.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Corte rodando', anim: 'knife_2', dur: 0.32, active: [0.1, 0.18], damage: 28, range: 1.8, arc: 140, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8d4dc } },
    air: { name: 'Faca aérea', anim: 'air_knife', dur: 0.4, active: [0.12, 0.28], damage: 32, range: 1.8, arc: 110, knockback: 2.5, slam: 15, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8d4dc, roll: 1.3 } },
  },

  // □: SNIPER FANTASMA — segurar para ajoelhar e mirar (mais tempo = mais dano); toque rápido = tiro rápido e fraco
  ranged: {
    name: 'Sniper Fantasma',
    type: 'projectile',
    anim: 'shoot_sniper',
    showProp: 'sniperHand',
    hideProp: 'stowed', // faca + rifle das costas
    windup: 0.4,
    recovery: 0.48,
    count: 1,
    interval: 0,
    damage: 100,
    range: 70,
    speed: 100, // dá para ver a bala e desviar (170 chegava no mesmo quadro)
    radius: 0.3,
    spread: 0,
    knockback: 4.5,
    hitstun: 0.45,
    cooldown: 3.0,
    energyCost: 0,
    visual: 'sniper',
    color: 0xd8d4dc,
    element: 'morte',
    sound: 'sniper',
    hitSound: 'heavyPunch',
    impactScale: 1.6,
    chargeShot: { draw: 0.3, maxAim: 1.2, minDamage: 65, maxDamage: 150, recovery: 0.42 },
  },

  abilities: [
    {
      id: 'disparoMorte',
      name: 'Disparo da Morte',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'deathShot',
      description: 'Ajoelha e o tempo desacelera em volta do alvo (fica bem lento) — ela mira com calma e dispara um tiro certeiro de Morte.',
      energyCost: 30,
      cooldown: 16,
      windup: 0.85,
      recovery: 0.35,
      slow: 0.3,
      slowTime: 1.3,
      element: 'morte',
      showProp: 'sniperHand',
    hideProp: 'stowed', // faca + rifle das costas
      projectile: { visual: 'sniper', color: 0xd8d4dc, damage: 110, range: 70, speed: 180, radius: 0.32, knockback: 4.5, hitstun: 0.5, impactScale: 1.8, hitSound: 'heavyPunch', element: 'morte' },
    },
    {
      id: 'pistolaTranstornada',
      name: 'Pistola Transtornada',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'cursedShots',
      description: 'Três tiros com balas enroladas em arame farpado: cada uma faz sangrar e deixa o alvo mais lento.',
      energyCost: 20,
      cooldown: 11,
      windup: 0.2,
      count: 3,
      interval: 0.16,
      spread: 6,
      anim: 'shoot_rifle',
      showProp: 'pistol',
      hideProp: 'knife',
      projectile: { visual: 'barbed', color: 0xb8b8c0, damage: 18, range: 26, speed: 48, radius: 0.3, knockback: 0.6, hitstun: 0.25, hitSound: 'bladeHit', onHit: { bleed: { dps: 3, duration: 3 }, slow: { type: 'barbedWire', name: 'ARAME FARPADO', mult: 0.75, time: 2 } } },
    },
    {
      id: 'perita',
      name: 'Perita',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'analyze',
      label: 'ANALISADO (PERITA)',
      description: 'Estuda o alvo com olho de assassina: por 8 s ele recebe 12% a mais de dano de tudo.',
      energyCost: 20,
      cooldown: 18,
      range: 30,
      duration: 8,
      takenMult: 1.12,
      color: 0xe8c070,
    },
    {
      id: 'revolver38',
      name: 'Revólver .38',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'cursedShots',
      description: 'Saque rápido do revólver: seis tiros em leque, rápidos, para quem chega perto demais.',
      energyCost: 20,
      cooldown: 10,
      windup: 0.12,
      count: 6,
      interval: 0.08,
      spread: 14,
      anim: 'shoot_rifle',
      showProp: 'pistol',
      hideProp: 'knife',
      projectile: { visual: 'bullet', color: 0xffe0a0, damage: 12, range: 20, speed: 60, radius: 0.28, knockback: 0.5, hitstun: 0.2, hitSound: 'bladeHit' },
    },
  ],

  // CONTRATO DE MORTE (a assassina de aluguel cumpre o contrato; cânone do tiro: o tempo desacelera em volta dela e a
  // espiral de Morte se forma do disparo): ajoelha, o tempo para, e a bala vai reta e devagar, girando a espiral até o alvo.
  special: {
    name: 'Contrato de Morte',
    banner: 'Contrato de Morte',
    type: 'spiralSnipe',
    path: 'straight',
    flight: 1.0,
    energyCost: 50,
    cooldown: 16,
    // damage: omitido → 250 (padrão); termina o serviço em quem já está morrendo (executeBelow)
    range: 40,
    showProp: 'sniperHand',
    hideProp: 'stowed',
    executeBelow: 0.25,
    executeMult: 1.2,
    color: 0xd8d4dc,
  },

  // TRANSFORMAÇÃO (Barra de Transformação cheia + vida baixa, segurando △): as faixas enrolam o rosto e o corpo, a
  // escuridão esconde quem ela é — A FANTASMA até o fim do round
  awakening: {
    name: 'Vestir as Faixas',
    banner: 'Vestir as Faixas',
    type: 'ghostBands',
    form: 'fantasma',
    duration: 0, // até o fim do round
    bonusHealth: 50,
    color: 0xa7a3ad,
  },

  passives: [
    { type: 'revenge', below: 0.3, duration: 8, mult: 1.2, speedMult: 1.1, energy: 35 }, // Sede de Vingança
  ],
};
