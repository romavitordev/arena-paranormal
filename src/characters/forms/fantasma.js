// A FANTASMA (Kemi com as faixas, Hexatombe). Não aparece na seleção: a Kemi vira esta forma com o especial VESTIR AS
// FAIXAS e fica assim até o fim do round. Sobretudo marrom de couro com gola alta, faixas cobrindo o rosto (só os olhos na
// escuridão) e o rifle pingando lodo preto. Poderes (wiki): Analítica e Disparo Espiral — as faixas puxam o rifle e
// as balas saem em curva, contornando cobertura e ignorando resistência; Sniper da Morte e a Sede de Vingança.
export default {
  id: 'fantasma',
  form: true,
  baseId: 'kemi',
  name: 'A FANTASMA', // com as faixas ela é a assassina, não a Kemi
  model: 'fantasma',
  color: '#6a5a48',
  origin: 'Mascarados',
  element: 'morte',
  energyColor: 0x8a8690,
  info: {
    weapon: 'Sniper Fantasma pingando lodo + faixas',
    style: 'Balas curvas que não erram, faixas que prendem e some na escuridão',
    identity: 'Forma das Faixas (até o fim do round)',
    tagline: 'Ninguém vê a Fantasma.',
  },
  stats: { moveSpeed: 8.6, maxHealth: 1100 }, // cabe a vida extra das faixas (+100)
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_fantasma', block: 'block' },
  chargeFx: { style: 'default', color: 0x1a1620 },
  dodge: { style: 'default', distance: 6 },

  melee: {
    name: 'Faca e faixas',
    strikes: [
      { name: 'Corte da Fantasma', anim: 'knife_1', dur: 0.22, active: [0.05, 0.12], damage: 26, range: 1.8, arc: 110, knockback: 0.7, lunge: 1.4, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x1a1620, tilt: 0.05 } },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.22, active: [0.05, 0.12], damage: 26, range: 1.8, arc: 110, knockback: 0.7, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x1a1620, flip: true } },
      { name: 'Coronhada', anim: 'shoulder_bash', dur: 0.3, active: [0.1, 0.17], damage: 32, range: 1.7, arc: 90, knockback: 1.0, lunge: 1.2, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Estocada', anim: 'thrust', dur: 0.28, active: [0.09, 0.16], damage: 32, range: 2.0, arc: 70, knockback: 0.9, lunge: 1.5, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Faixas cortantes', anim: 'knife_final', dur: 0.44, active: [0.15, 0.25], damage: 56, range: 2.2, arc: 140, lunge: 1.8, finisher: 'launch', sound: 'slashFinal', hitSound: 'bladeHit', trail: { color: 0x0a080c, roll: 1.4, big: true } },
    ],
    up: { name: 'Faixa para cima', anim: 'slash_up', dur: 0.36, active: [0.11, 0.21], damage: 40, range: 2.0, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x1a1620, tilt: -1.3 } },
    down: { name: 'Rasteira na escuridão', anim: 'kick_low', dur: 0.42, active: [0.15, 0.25], damage: 44, range: 1.9, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Bote da Fantasma', anim: 'dash_slash', dur: 0.38, active: [0.12, 0.23], damage: 34, range: 2.0, arc: 100, knockback: 1.6, motion: [{ t: [0, 0.23], fwd: 6.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x1a1620, tilt: 0.1 } },
    back: { name: 'Some e corta', anim: 'knife_evade', dur: 0.44, active: [0.25, 0.33], damage: 32, range: 1.9, arc: 100, knockback: 1.8, iframes: [0, 0.24], motion: [{ t: [0, 0.14], back: 2.6 }, { t: [0.18, 0.3], fwd: 2.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Corte rodando', anim: 'knife_2', dur: 0.3, active: [0.09, 0.17], damage: 30, range: 1.9, arc: 140, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.8 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x1a1620 } },
    air: { name: 'Queda da Fantasma', anim: 'air_knife', dur: 0.38, active: [0.11, 0.27], damage: 34, range: 1.9, arc: 110, knockback: 2.5, slam: 15, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0x1a1620, roll: 1.3 } },
  },

  // □: DISPARO ESPIRAL (cânone: as faixas puxam a sniper e as balas saem CURVAS, negando a cobertura) — a bala
  // procura o alvo e faz curva em volta das paredes e obstáculos em vez de atravessá-los
  ranged: {
    name: 'Disparo Espiral',
    type: 'projectile',
    anim: 'shoot_sniper',
    showProp: 'sniperHand',
    hideProp: 'stowed', // faca + rifle das costas
    windup: 0.36,
    recovery: 0.44,
    count: 1,
    interval: 0,
    damage: 100,
    range: 200, // pega em qualquer lugar do mapa
    speed: 95,
    radius: 0.32,
    spread: 0,
    knockback: 4.5,
    hitstun: 0.45,
    cooldown: 4.0, // quase certeiro: recarga maior que a da sniper comum
    energyCost: 0,
    visual: 'deathSpiral',
    color: 0xd8d4dc,
    element: 'morte',
    spiral: 0.22,
    homing: 9,
    curve: true, // faz curva em volta da cobertura
    guardCrush: 25, // ignora resistência: gasta muito da defesa de quem bloqueia
    drip: true, // o rifle pinga lodo
    sound: 'sniper',
    hitSound: 'heavyPunch',
    impactScale: 1.6,
    chargeShot: { draw: 0.28, maxAim: 1.1, minDamage: 60, maxDamage: 140, recovery: 0.4 },
  },

  abilities: [
    {
      id: 'sniperMorte',
      name: 'Sniper da Morte',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'deathShot',
      description: 'O tempo quase para em volta do alvo; o tiro sai numa espiral de Morte que procura o alvo e faz curva em volta das paredes — e termina quem já está morrendo (abaixo de 30% de vida: dano ×1,6).',
      energyCost: 30,
      cooldown: 15,
      windup: 0.75,
      recovery: 0.3,
      slow: 0.2,
      slowTime: 1.3,
      element: 'morte',
      showProp: 'sniperHand',
    hideProp: 'stowed', // faca + rifle das costas
      projectile: { visual: 'deathSpiral', color: 0xd8d4dc, damage: 140, range: 200, speed: 100, radius: 0.34, knockback: 5, hitstun: 0.55, impactScale: 2, hitSound: 'heavyPunch', element: 'morte', spiral: 0.3, homing: 10, curve: true, drip: true, execute: { below: 0.3, mult: 1.6 } },
    },
    {
      id: 'faixas',
      name: 'Faixas da Fantasma',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'bloodBind',
      description: 'Lança as faixas, que cobrem o alvo dos pés ao rosto como uma múmia e o prendem por até 2,2 s — apertando os botões sem parar, ele se solta antes.',
      energyCost: 25,
      cooldown: 14,
      windup: 0.25,
      range: 11,
      arc: 50,
      hold: 2.2,
      mummy: true, // adaptação (não está na wiki): as faixas enrolam o alvo como uma múmia
      damage: 30,
      element: 'morte',
      ropeColor: 0xd8ccb0,
      ropeGlow: 0x1a1612,
      ropeThick: 0.035,
      caughtMsg: 'PRESO PELAS FAIXAS',
    },
    {
      id: 'escuridao',
      name: 'Some na Escuridão',
      input: 'block+jump', // R2 + × / RT + A
      type: 'blink',
      description: 'Some na escuridão e reaparece onde mirar (ou do lado do adversário).',
      energyCost: 15,
      cooldown: 6,
      distance: 6,
      flankDistance: 2.2,
      vanishTime: 0.22,
      color: 0x1a1620,
      residue: 'smoke', // a fumaça preta das faixas fica para trás
    },
    {
      id: 'analitica',
      name: 'Analítica',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'analyze',
      label: 'ANALISADO (ANALÍTICA)',
      description: 'Os olhos na escuridão leem cada fraqueza: por 8 s o alvo recebe 20% a mais de dano.',
      energyCost: 20,
      cooldown: 18,
      range: 30,
      duration: 8,
      takenMult: 1.2,
      color: 0xa7a3ad,
    },
    {
      id: 'pistolaTranstornadaF',
      name: 'Pistola Transtornada',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'cursedShots',
      description: 'Três tiros com balas de arame farpado: sangramento e lentidão.',
      energyCost: 20,
      cooldown: 10,
      windup: 0.18,
      count: 3,
      interval: 0.14,
      spread: 6,
      anim: 'shoot_rifle',
      showProp: 'pistol',
      hideProp: 'knife',
      projectile: { visual: 'barbed', color: 0xb8b8c0, damage: 20, range: 26, speed: 50, radius: 0.3, knockback: 0.6, hitstun: 0.25, hitSound: 'bladeHit', onHit: { bleed: { dps: 3, duration: 3 }, slow: { type: 'barbedWire', name: 'ARAME FARPADO', mult: 0.7, time: 2 } } },
    },
  ],

  // Especial DISPARO ESPIRAL: o mundo para e a bala desenha uma espiral de Morte até o alvo
  special: {
    name: 'Disparo Espiral',
    banner: 'Disparo Espiral',
    type: 'spiralSnipe',
    energyCost: 50,
    cooldown: 16,
    damage: 320, // o tiro mais forte da Kemi (padrão dos especiais: 250)
    range: 40,
    showProp: 'sniperHand',
    hideProp: 'stowed', // faca + rifle das costas
    executeBelow: 0.3,
    executeMult: 1.3,
    color: 0xd8d4dc,
  },

  passives: [
    { type: 'revenge', below: 0.3, duration: 8, mult: 1.2, speedMult: 1.1, energy: 35 }, // Sede de Vingança
  ],
};
