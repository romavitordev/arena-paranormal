// O DIABO — O PORTADOR DO TRONO (Juan, fim de Hexatombe). Não aparece na seleção: com o especial RENASCIMENTO o Juan
// sobe no Trono do Diabo (Relíquia de Sangue) e vira esta forma até o fim do round. Quatro braços com garras, asas de
// braços vermelhos, Coroa de Espinhos dourada, chifres em foice, pernas de bode.
// Poderes do Portador (wiki): Ódio do Diabo, Sangue nos Arredores, Transportar pelo Sangue, Veias de Sangue,
// Regeneração, Amaldiçoar Arma (toda garra faz sangrar), Senhor do Sangue e o Pacto.
export default {
  id: 'diabo',
  form: true,
  baseId: 'juan',
  name: 'O DIABO (JUAN)',
  model: 'diabo',
  color: '#a01818',
  origin: 'Relíquia de Sangue',
  element: 'sangue',
  energyColor: 0xff2a3d,
  info: {
    weapon: 'Quatro braços com garras',
    style: 'Garras em sequência, correntes de sangue nas veias e teleporte pelas poças de sangue',
    identity: 'O Portador do Trono: fica assim até o fim do round',
    tagline: 'Um novo começo.',
  },
  stats: { moveSpeed: 8.0, size: 1.35, maxHealth: 1250 },
  regen: { every: 6, amount: 22, color: 0x7a0010 }, // Regeneração
  anims: { idle: 'idle_dual', run: 'run', charge: 'charge', victory: 'victory', block: 'block' },
  chargeFx: { style: 'default', color: 0xff2a3d },
  dodge: { style: 'default', distance: 5.2 },

  melee: {
    name: 'Garras do Diabo',
    strikes: [
      { name: 'Garra direita', anim: 'dual_r', dur: 0.28, active: [0.08, 0.16], damage: 32, range: 2.2, arc: 120, knockback: 1.0, lunge: 1.3, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, tilt: 0.05 } },
      { name: 'Garra esquerda', anim: 'dual_l', dur: 0.28, active: [0.08, 0.16], damage: 32, range: 2.2, arc: 120, knockback: 1.0, lunge: 1.2, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, flip: true } },
      { name: 'Quatro garras', anim: 'dual_cross', dur: 0.4, actives: [[0.1, 0.17], [0.22, 0.3]], damage: 48, range: 2.2, arc: 130, knockback: 1.2, lunge: 1.1, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, roll: 0.8 } },
      { name: 'Rasgar', anim: 'dual_both', dur: 0.55, active: [0.22, 0.34], damage: 70, range: 2.3, arc: 140, lunge: 1.8, finisher: 'launch', bleed: { dps: 8, duration: 3 }, hitstop: 0.1, sound: 'slashFinal', hitSound: 'clawHit', impactScale: 1.8, trail: { color: 0x7a0010, roll: 1.4, big: true } },
    ],
    up: { name: 'Garra ascendente', anim: 'slash_up', dur: 0.4, active: [0.13, 0.24], damage: 44, range: 2.2, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit' },
    down: { name: 'Cravar as garras', anim: 'slash_d', dur: 0.46, active: [0.18, 0.28], damage: 50, range: 2.2, arc: 120, lunge: 1, finisher: 'knockdown', bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', impactScale: 1.5 },
    air: { name: 'Mergulho do Diabo', anim: 'air_dual', dur: 0.42, active: [0.13, 0.3], damage: 40, range: 2.2, arc: 120, knockback: 3, slam: 16, vertical: 2.5, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit' },
  },

  // □: lança de sangue
  ranged: {
    name: 'Lança de Sangue',
    type: 'projectile',
    anim: 'throw_r',
    windup: 0.2,
    recovery: 0.24,
    count: 2,
    interval: 0.12,
    damage: 26,
    range: 20,
    speed: 34,
    radius: 0.4,
    spread: 6,
    knockback: 1.4,
    hitstun: 0.35,
    cooldown: 2.0,
    energyCost: 0,
    visual: 'crossWave',
    color: 0xff2a3d,
    sound: 'blade',
    hitSound: 'clawHit',
  },

  abilities: [
    {
      id: 'veiasSangue',
      name: 'Veias de Sangue',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'bloodBind',
      description: 'Puxa o sangue das veias do alvo e forma correntes em volta dele: fica preso por um instante.',
      energyCost: 25,
      cooldown: 13,
      windup: 0.3,
      range: 12,
      arc: 50,
      hold: 1.3,
      damage: 36,
    },
    {
      id: 'odioDiabo',
      name: 'Ódio do Diabo',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'selfBuff',
      buffType: 'devilHate',
      label: 'ÓDIO DO DIABO',
      anim: 'powerup',
      description: 'O ódio mais puro: golpes 30% mais fortes e mais velocidade por 8 s.',
      energyCost: 25,
      cooldown: 18,
      duration: 8,
      damageMult: 1.3,
      speedMult: 1.15,
      affects: ['melee', 'ranged', 'ability'],
      color: 0xff2a3d,
    },
    {
      id: 'transportarSangue',
      name: 'Transportar pelo Sangue',
      input: 'block+jump', // R2 + × / RT + A
      type: 'teleportBehind',
      description: 'Afunda numa poça de sangue e sai por outra, atrás do adversário.',
      energyCost: 20,
      cooldown: 7,
      distance: 1.6,
      vanishTime: 0.18,
      color: 0x9a0010,
    },
    {
      id: 'senhorSangue',
      name: 'Senhor do Sangue',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'summonBlood',
      description: 'Abre uma poça de sangue perto do adversário e dela sobe um Zumbi de Sangue que luta pelo Diabo por 12 s.',
      energyCost: 30,
      cooldown: 22,
      duration: 12,
      hp: 220,
    },
    {
      id: 'sangueArredores',
      name: 'Sangue nos Arredores',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'bloodGeysers',
      description: 'O chão em volta jorra sangue em 4 ondas: dano, lentidão, e o Diabo bebe 50% do sangue derramado.',
      energyCost: 30,
      cooldown: 16,
      waves: 4,
      interval: 0.55,
      radius: 4.2,
      damage: 24,
      drain: 0.5,
      slow: 0.6,
    },
  ],

  // Especial PACTO: o Diabo estende a mão e oferece um pacto — o alvo fica TRANSTORNADO por 8 s (não consegue
  // defender, recebe 20% a mais de dano e perde energia) e o Diabo se cura
  special: {
    name: 'Pacto',
    banner: 'Pacto com o Diabo',
    type: 'devilDeal',
    energyCost: 50,
    cooldown: 20,
    duration: 8,
    takenMult: 1.2,
    drain: 4,
    heal: 120,
    color: 0xff2a3d,
  },

  passives: [
    { type: 'lifesteal', ratio: 0.12 }, // o Diabo também se alimenta do sangue
  ],
};
