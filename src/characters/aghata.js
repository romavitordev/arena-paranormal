// AGHATA (id interno: aghata) — pressão em curta distância + faca + ritual de cortes sobrenaturais (Descarnar).
// A faca arremessada é uma ferramenta de pressão; os poderes paranormais são Amaldiçoar Arma
// (Sangue, △+□) e o especial Descarnar.
export default {
  id: 'aghata',
  name: 'AGHATA',
  model: 'aghata',
  color: '#e0204a',
  origin: 'Ordo Realitas', // organização (cânone)
  element: 'sangue', // afinidade elemental (ver config/elements.js)
  energyColor: 0xe0204a,
  info: {
    weapon: 'Faca',
    style: 'Cortes curtos, reversos, estocadas e contra-ataque na esquiva',
    identity: 'Pressão em curta distância + faca + ritual de cortes sobrenaturais',
    tagline: 'Sorri antes de cortar.',
  },
  stats: { moveSpeed: 8.6, attackSpeed: 1.18 },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_aghata', block: 'block_weapon' },
  chargeFx: { style: 'blood', color: 0xe0204a },
  dodge: { style: 'default', distance: 4.6 },

  melee: {
    name: 'Faca',
    strikes: [
      { name: 'Corte curto', anim: 'knife_1', dur: 0.28, active: [0.09, 0.16], damage: 22, range: 1.55, arc: 110, knockback: 1.0, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.1, tilt: 0.1 } },
      { name: 'Corte reverso', anim: 'knife_2', dur: 0.28, active: [0.09, 0.16], damage: 22, range: 1.55, arc: 110, knockback: 1.0, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.1, tilt: -0.1, flip: true } },
      { name: 'Estocada', anim: 'thrust', dur: 0.32, active: [0.11, 0.2], damage: 28, range: 1.8, arc: 50, knockback: 1.6, lunge: 1.4, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Corte descendente', anim: 'knife_3', dur: 0.28, active: [0.08, 0.16], damage: 30, range: 1.6, arc: 100, knockback: 1.4, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 1.0 } },
      { name: 'Finalizador', anim: 'knife_final', dur: 0.44, active: [0.15, 0.26], damage: 50, range: 1.8, arc: 80, lunge: 2.2, finisher: 'launch', sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.3, roll: 0.3, big: true } },
    ],
    up: { name: 'Facada ascendente', anim: 'slash_up', dur: 0.4, active: [0.12, 0.24], damage: 34, range: 1.7, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: 0xe0204a, tilt: -1.2 } },
    down: { name: 'Facada descendente', anim: 'knife_final', dur: 0.44, active: [0.15, 0.26], damage: 42, range: 1.8, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactScale: 1.4, trail: { color: 0xe0204a, roll: 1.4 } },
    forward: { name: 'Avanço', anim: 'dash_slash', dur: 0.4, active: [0.12, 0.22], damage: 34, range: 1.8, arc: 120, knockback: 2.2, motion: [{ t: [0, 0.2], fwd: 4.2, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.3, tilt: 0.1 } },
    // recua com invulnerabilidade e volta cortando
    back: { name: 'Esquiva com contra-ataque', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 40, range: 1.7, arc: 100, knockback: 2.4, iframes: [0, 0.22], motion: [{ t: [0, 0.15], back: 2.2 }, { t: [0.18, 0.32], fwd: 2.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: -0.2 } },
    side: { name: 'Corte circular', anim: 'knife_2', dur: 0.3, active: [0.08, 0.16], damage: 26, range: 1.6, arc: 130, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.4 }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, flip: true } },
    air: { name: 'Corte aéreo', anim: 'air_knife', dur: 0.36, active: [0.12, 0.28], damage: 34, range: 1.7, arc: 110, knockback: 3, slam: 15, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 1.2 } },
  },

  // □: faca arremessada — ferramenta de pressão e abertura (não é o poder principal)
  ranged: {
    name: 'Faca Arremessada',
    type: 'projectile',
    anim: 'throw_r',
    showProp: 'knifeThrow',
    windup: 0.2,
    recovery: 0.18,
    count: 1,
    interval: 0,
    damage: 40,
    range: 24,
    speed: 36,
    radius: 0.35,
    spread: 0,
    knockback: 1.5,
    hitstun: 0.3,
    cooldown: 1.8,
    energyCost: 0,
    visual: 'knife',
    color: 0xff3355,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      id: 'amaldicoar',
      name: 'Amaldiçoar Arma',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'curseWeapon',
      description: 'Amaldiçoa a faca com o elemento Sangue: por alguns segundos cada acerto (físico ou faca arremessada) abre um sangramento que continua tirando vida.',
      energyCost: 25,
      cooldown: 16,
      duration: 9, // segundos com a arma amaldiçoada
      bleed: { dps: 7, duration: 3 }, // dano por segundo e duração do sangramento (renova a cada acerto)
      color: 0xe0204a,
    },
    {
      id: 'facasAmaldicoadas',
      name: 'Facas Amaldiçoadas',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'cursedShots',
      description: 'Arremessa três facas banhadas em sangue, em leque, que se curvam atrás do alvo e VOLTAM para a mão — a que errou na ida ainda pode acertar na volta.',
      energyCost: 20,
      cooldown: 11,
      anim: 'throw_r',
      shotSound: 'knifeThrow',
      windup: 0.15,
      interval: 0.14,
      count: 3,
      spread: 18,
      // voltam para a mão (bumerangue): a que errou na ida ainda pode acertar na volta
      projectile: { visual: 'knife', color: 0xe0204a, speed: 30, range: 20, radius: 0.35, damage: 24, knockback: 1, hitstun: 0.3, homing: 1.0, boomerang: true, kind: 'ability', element: 'sangue', hitSound: 'bladeHit' },
    },
    {
      // cânone: o ritual dela troca as mentes de duas pessoas de corpo
      id: 'passagemConhecimento',
      name: 'Passagem de Conhecimento',
      input: 'block+jump', // R2 + × / RT + A
      type: 'mindSwap',
      description: 'Troca de mente com o adversário por um instante: os dois trocam de lugar e ele volta desorientado, de costas e atordoado.',
      energyCost: 25,
      cooldown: 14,
      range: 14,
      windup: 0.3,
      stun: 0.5,
      surprise: 0.9,
      color: 0xe8c070,
    },
    {
      // cânone: ela aprendeu a "ler" rituais, entendendo como funcionam sem transcender
      id: 'leituraRituais',
      name: 'Leitura de Rituais',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'selfBuff',
      buffType: 'ritualReading',
      label: 'LEITURA DE RITUAIS',
      anim: 'concentrate',
      description: 'Lê os rituais do adversário antes de eles chegarem: por 7 s recebe 40% menos dano de rituais e especiais.',
      energyCost: 20,
      cooldown: 16,
      duration: 7,
      takenMult: 0.6,
      takenKinds: ['ability', 'special'],
      color: 0xe8c070,
    },
  ],

  // Especial DESCARNAR (substitui a antiga "Dança Carmesim")
  special: {
    name: 'Descarnar',
    banner: 'Descarnar!',
    type: 'ritual',
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → COMBAT.specialDamage (250). NÃO é hitkill.
    range: 20,
    color: 0xe0204a,
    waves: [
      { t: 2.1, cuts: 6, share: 0.45 },
      { t: 2.55, cuts: 7, share: 0.55, final: true },
    ],
  },

  passives: [
    { type: 'bloodNecklace', resist: 0.85, bleedMult: 1.1 }, // Colar Banhado em Sangue: resiste a Sangue, sangramento um pouco mais forte
  ],
};
