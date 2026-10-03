// FERREIRO (id: ferreiro) — o Luzidio que guarda Santo Berço (O Segredo na Floresta): 2,20 m, pele cinza, olhos
// pretos, barba branca, peitoral de metal e a Espada Consumidora com as duas mãos.
// Especial: PACTO DO SANTO (sanidade acima de 85%, 45 s) — se morrer nesse tempo, o Lodo toma o corpo e ele vira o
// DEUS DA MORTE (chefe 2x maior, barra preta no centro, fraco contra fogo e Energia, regenera; ver forms/deus_morte.js).
export default {
  id: 'ferreiro',
  name: 'FERREIRO',
  model: 'ferreiro',
  color: '#8e9096',
  origin: 'Luzidios',
  element: 'morte',
  energyColor: 0x8a8090,
  info: {
    weapon: 'Espada Consumidora',
    style: 'Cortes enormes com a espada amaldiçoada; o Pacto do Santo abre caminho para o Deus da Morte',
    identity: 'Guardião de Santo Berço: no Pacto do Santo, morrer o transforma no Deus da Morte',
    tagline: 'Eu não posso permitir que vocês destruam minha cidade.',
  },
  stats: { moveSpeed: 7.0, size: 1.1 },
  anims: { idle: 'idle_katana', run: 'run', charge: 'charge', victory: 'vic_ferreiro', block: 'block_weapon' },
  grip: { twoHand: true, reach: 0.42, freeLeft: ['concentrate', 'charge', 'victory', 'hit', 'launched', 'fall', 'getup', 'point'] },
  chargeFx: { style: 'default', color: 0x8a8090 },
  dodge: { style: 'default', distance: 4.6 },

  melee: {
    name: 'Espada Consumidora',
    strikes: [
      { name: 'Corte largo', anim: 'slash_h', dur: 0.38, active: [0.12, 0.2], damage: 32, range: 2.3, arc: 150, knockback: 1.2, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x6a6670, tilt: 0.05 } },
      { name: 'Corte de volta', anim: 'slash_h_back', dur: 0.38, active: [0.12, 0.2], damage: 32, range: 2.3, arc: 150, knockback: 1.2, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x6a6670, flip: true } },
      { name: 'Corte diagonal', anim: 'slash_d', dur: 0.44, active: [0.16, 0.26], damage: 38, range: 2.3, arc: 110, knockback: 1.4, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x6a6670, roll: 0.8 } },
      { name: 'Golpe do Ferreiro', anim: 'slash_v', dur: 0.5, active: [0.2, 0.3], damage: 44, range: 2.4, arc: 80, knockback: 1.6, lunge: 1.1, guardCrush: 30, sound: 'blade', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.5, groundFx: 'dust', trail: { color: 0x6a6670, roll: 1.55 } },
      { name: 'Consumir', anim: 'slash_finisher', dur: 0.66, active: [0.3, 0.42], damage: 66, range: 2.4, arc: 120, lunge: 1.8, finisher: 'launch', armor: { from: 0.12, to: 0.3, max: 35 }, hitstop: 0.11, sound: 'slashFinal', hitSound: 'heavyPunch', impactScale: 1.9, trail: { color: 0x2a2632, roll: 1.5, big: true } },
    ],
    up: { name: 'Corte ascendente', anim: 'slash_up', dur: 0.46, active: [0.16, 0.28], damage: 44, range: 2.5, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x6a6670, tilt: -1.3 } },
    down: { name: 'Espada no chão', anim: 'slash_d', dur: 0.54, active: [0.22, 0.32], damage: 52, range: 2.5, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'blade', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.6, groundFx: 'smash', groundScale: 0.8 },
    forward: { name: 'Investida do Ferreiro', anim: 'dash_slash', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.4, arc: 110, knockback: 2.2, motion: [{ t: [0, 0.28], fwd: 5.0, stopClose: true }], sound: 'blade', hitSound: 'heavyPunch', trail: { color: 0x6a6670, tilt: 0.1 } },
    back: { name: 'Recua e consome', anim: 'slash_h_back', dur: 0.52, active: [0.3, 0.4], damage: 36, range: 2.4, arc: 140, knockback: 2.4, iframes: [0, 0.22], motion: [{ t: [0, 0.16], back: 2.2 }, { t: [0.2, 0.34], fwd: 2.2, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x6a6670, flip: true } },
    side: { name: 'Corte em arco', anim: 'slash_h', dur: 0.44, active: [0.14, 0.24], damage: 34, range: 2.4, arc: 170, knockback: 1.8, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x6a6670 } },
    air: { name: 'Corte aéreo', anim: 'air_slash', dur: 0.46, active: [0.15, 0.32], damage: 40, range: 2.5, arc: 110, knockback: 3, slam: 16, vertical: 2.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x6a6670, roll: 1.3 } },
  },

  // □: Lodo arremessado — uma bola de Lodo preto da caverna
  ranged: {
    name: 'Lodo arremessado',
    type: 'projectile',
    anim: 'throw_r',
    windup: 0.26,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 34,
    range: 18,
    speed: 22,
    radius: 0.45,
    spread: 0,
    knockback: 1.6,
    hitstun: 0.4,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'decay',
    color: 0x2a2632,
    sound: 'drain',
    hitSound: 'impact',
  },

  abilities: [
    {
      id: 'hipnoseEspiral',
      name: 'Hipnose Espiral',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'mindControl',
      description: 'A espiral do Parasita de Dimensões: por alguns segundos o corpo do alvo obedece ao contrário.',
      energyCost: 25,
      cooldown: 22,
      windup: 0.45,
      recovery: 0.3,
      range: 10,
      arc: 60,
      duration: 2.5,
      color: 0x6a6670,
    },
    {
      id: 'espadaConsumidora',
      name: 'Espada Consumidora',
      input: 'block+jump', // R2 + × / RT + A
      type: 'curseWeapon',
      description: 'Desperta a espada amaldiçoada: por alguns segundos cada corte abre um ferimento que consome o alvo.',
      energyCost: 20,
      cooldown: 16,
      duration: 8,
      props: ['sword'],
      bleed: { dps: 4, duration: 3, color: 0x2a2632 },
      color: 0x6a6670,
    },
    {
      id: 'regeneracaoLuzidia',
      name: 'Conforto de Santo Berço',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'healOverTime',
      description: 'A ilusão de Santo Berço conforta o Luzidio: recupera vida aos poucos.',
      energyCost: 25,
      cooldown: 24,
      heal: 70,
      duration: 2.5,
      color: 0x8a8090,
    },
    {
      id: 'armaduraFerreiro',
      name: 'Armadura do Ferreiro',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'heavyProtection',
      label: 'ARMADURA DO FERREIRO',
      description: 'Fecha o peitoral de metal: por 6 s recebe 25% menos dano e aguenta 2 golpes sem recuar, mas anda um pouco mais devagar.',
      energyCost: 25,
      cooldown: 22,
      duration: 6,
      takenMult: 0.75,
      armor: 2,
      speedMult: 0.92,
    },
  ],

  // PACTO DO SANTO: exige a sanidade acima de 85%; por 45 s, morrer = virar o Deus da Morte
  special: {
    name: 'Pacto do Santo',
    banner: 'Pacto do Santo',
    type: 'santoPact',
    minEnergy: 0.85,
    energyCost: 50,
    cooldown: 50,
    window: 45,
    form: 'deus_morte',
    color: 0x2a2632,
  },

  passives: [
    { type: 'resistant', mult: 0.92, kinds: ['melee'] }, // corpo de Luzidio: aguenta melhor golpes físicos
  ],
};
