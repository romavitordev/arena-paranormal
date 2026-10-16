// DANTE — ocultista da Morte (Ordo Realitas). Sem armas: palmas carregadas de Lodo Preto e rituais.
// Rituais do cânone: Decadência "Decadenza", Embaralhar "Trinitá", Tentáculos de Lodo,
// Cicatrização "Paradiso" e Destruição Temporal "Rotura" (especial).
export default {
  id: 'dante',
  name: 'DANTE',
  model: 'dante',
  color: '#c4bfd2',
  origin: 'Ordo Realitas', // organização (cânone)
  element: 'morte', // afinidade elemental (ver config/elements.js)
  energyColor: 0x9a94ae, // cinza-cinza do Lodo (o preto puro some no cenário escuro)
  info: {
    weapon: 'Rituais (sem armas)',
    style: 'Ocultista: palmas com Lodo Preto, chutes e rituais de Morte',
    identity: 'Ocultista da Morte: decadência, cópias, lodo e cura',
    tagline: 'É ironia do destino.',
  },
  stats: { moveSpeed: 7.6, attackSpeed: 1.06 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge', victory: 'vic_dante', block: 'block' },
  chargeFx: { style: 'aura', color: 0x9a94ae, smoke: 0x0c0a0e },
  dodge: { style: 'shadow' }, // vira um vulto preto ao esquivar

  melee: {
    name: 'Palmas de Lodo',
    strikes: [
      { name: 'Palma', anim: 'jab', dur: 0.3, active: [0.08, 0.17], damage: 30, range: 1.7, arc: 90, knockback: 1.4, lunge: 1.1, sound: 'swing', hitSound: 'punch', hand: 'L' },
      { name: 'Palma reversa', anim: 'cross', dur: 0.34, active: [0.1, 0.2], damage: 34, range: 1.75, arc: 90, knockback: 1.8, lunge: 1.1, sound: 'swing', hitSound: 'punch', hand: 'R' },
      { name: 'Chute baixo', anim: 'kick_low', dur: 0.38, active: [0.12, 0.22], damage: 38, range: 1.9, arc: 100, knockback: 2.0, lunge: 1.0, sound: 'swing', hitSound: 'kick' },
      { name: 'Empurrão espiral', anim: 'shove', dur: 0.42, active: [0.14, 0.26], damage: 44, range: 1.8, arc: 110, knockback: 2.6, lunge: 1.2, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0x2a2632, radius: 1.4 } },
      { name: 'Espiral de Lodo', anim: 'wave_punch', dur: 0.56, active: [0.22, 0.36], damage: 58, range: 2.2, arc: 140, lunge: 1.6, finisher: 'push', sound: 'swing', hitSound: 'drain', impactFx: 'sigil', trail: { color: 0x1a161e, spin: true, big: true } },
    ],
    up: { name: 'Espiral ascendente', anim: 'uppercut', dur: 0.46, active: [0.16, 0.28], damage: 38, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0x1a161e, tilt: -1.2 } },
    down: { name: 'Palma esmagadora', anim: 'shove', dur: 0.52, active: [0.2, 0.32], damage: 46, range: 1.9, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'drain', impactScale: 1.4, impactFx: 'sigil' },
    forward: { name: 'Avanço do vulto', anim: 'dash_punch', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 1.9, arc: 100, knockback: 3.2, motion: [{ t: [0, 0.28], fwd: 2.8, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Passo da Morte', anim: 'sway_kick', dur: 0.55, active: [0.3, 0.42], damage: 42, range: 1.8, arc: 110, knockback: 3, iframes: [0, 0.22], motion: [{ t: [0, 0.18], back: 1.8 }, { t: [0.2, 0.36], fwd: 2.0, stopClose: true }], sound: 'swing', hitSound: 'kick' },
    side: { name: 'Chute lateral', anim: 'side_kick', dur: 0.45, active: [0.18, 0.3], damage: 38, range: 1.9, arc: 120, knockback: 2.6, motion: [{ t: [0, 0.25], side: 2.2 }], sound: 'swing', hitSound: 'kick' },
    air: { name: 'Pisão espiral', anim: 'air_kick', dur: 0.45, active: [0.15, 0.35], damage: 38, range: 1.9, arc: 110, knockback: 4, slam: 15, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch' },
  },

  // Decadência "Decadenza": o MESMO ritual Decadência do Guizo (a versão mais nova, v3.16) — espirais de Morte surgem em
  // volta do alvo, apertam e ele DEFINHA. É o □ dele: roda como habilidade (Fighter.tryRanged → ABILITY_TYPES).
  ranged: {
    name: 'Decadenza',
    type: 'decadence',
    description: 'Estende a mão envolta em espirais: elas surgem em volta do alvo, apertam e ele DEFINHA (dano de Morte e uma decadência curta depois). Dá para esquivar quando as espirais fecham.',
    energyCost: 25,
    cooldown: 9,
    cast: 0.62,
    range: 9,
    damage: 62,
    decay: { dps: 4, duration: 3 },
    element: 'morte',
    color: 0x8a8494,
    ai: { max: 8.5 },
  },

  abilities: [
    {
      id: 'trinita',
      name: 'Embaralhar "Trinitá"',
      input: 'carga+ranged',
      type: 'shuffle',
      description: 'Vira um vulto, troca de lugar e deixa 3 cópias realistas em volta que imitam cada movimento dele. Por 7 s, um golpe (não especial) pode acertar uma cópia no lugar dele — a cópia se desfaz.',
      energyCost: 30,
      cooldown: 22,
      duration: 7,
      copies: 3,
      spacing: 1.1,
      perCopy: 0.22,
      color: 0x1a161e,
    },
    {
      id: 'tentaculos',
      name: 'Tentáculos de Lodo',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'lodoTentacles',
      description: 'Põe a mão no chão: tentáculos de Lodo Preto brotam embaixo do inimigo, prendem e comprimem.',
      energyCost: 30,
      cooldown: 11, // era 14 (buff v3.6)
      range: 10,
      radius: 2.0,
      castTime: 0.5,
      hold: 1.0,
      damage: 70, // era 60
      stun: 1.4, // era 1,1: os tentáculos prendem mais
      color: 0x0e0c10,
    },
    {
      id: 'paradiso',
      name: 'Cicatrização "Paradiso"',
      input: 'block+carga',
      type: 'agingHeal',
      description: 'Acelera o tempo nas feridas: recupera vida em instantes — mas envelhece. A névoa preta sai em espiral da boca dele.',
      energyCost: 30,
      cooldown: 26,
      heal: 85,
      duration: 2.4,
      style: 'mist',
      maxAge: 3,
      color: 0x2a2632,
    },
    {
      // cânone (Desconjuração, depois de transcender): concentrando-se no Símbolo, o alvo APODRECE e se desintegra —
      // "tal como a Decadência e a Cicatrização" (a mecânica das espirais que apertam). Substitui a antiga "Poça de
      // Lodo", que não existia na wiki.
      id: 'rotura',
      name: 'Destruição Temporal "Rotura"',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'decadence',
      description: 'Concentra-se no Símbolo: espirais de Morte surgem em volta do alvo, apertam e ele APODRECE (dano de Morte e uma decomposição que continua). Dá para esquivar quando as espirais fecham.',
      energyCost: 25,
      cooldown: 14,
      cast: 0.62,
      range: 9,
      damage: 58,
      decay: { dps: 5, duration: 3 },
      element: 'morte',
      color: 0x2a2632,
      ai: { max: 8.5 },
    },
  ],

  // INVOCAÇÃO: A MARIONETE — um NPC real (vida, IA, ataques próprios) que fica 25 s em campo.
  // Pode ser atacada e destruída. Recarga alta. Às vezes se volta contra o próprio Dante.
  special: {
    name: 'Invocação: A Marionete',
    banner: 'A Marionete!',
    type: 'marionette',
    energyCost: 50,
    cooldown: 50,
    duration: 18,
    hp: 350,
    color: 0x8ad8c0,
  },

  // DESPERTAR (Barra de Transformação cheia + vida baixa, segurando △) — cânone: transcendeu depois de Tirigan e Sukkalgir e ganhou Afinidade com o Outro Lado — rituais de Morte mais fortes. Até o fim do round.
  awakening: {
    name: 'Afinidade com o Outro Lado',
    banner: 'Afinidade com o Outro Lado',
    type: 'awakenMode',
    mult: 1.25, affects: ['ability', 'special'], cdRate: 1.3, regen: 4, aura: 'smoke', color: 0x3a3442, heal: 0.1,
  },

  passives: [
    { type: 'ritualFocus', mult: 0.9 }, // Concentração Inquebrável: rituais custam 10% menos sanidade
  ],
};
