// AGUIAR / MUTILADOR NOTURNO (id: aguiar) — Mascarados (Natal Macabro / Hexatombe).
// Delegado Jonas Aguiar, o assassino em série do Acampamento Lua da Benquerença. Combatente:
// machado de lâmina vermelha (sangramento severo) arremessado na corda para puxar a vítima,
// armadilhas de urso. A máscara branca com a mão vermelha (o Mutilador Noturno) só aparece na Transformação.
export default {
  id: 'aguiar',
  name: 'AGUIAR',
  model: 'aguiar',
  color: '#c4241c',
  origin: 'Mascarados',
  element: 'sangue', // assassinos dos sacrifícios de Sangue do Hexatombe; "Predador de Sangue"
  energyColor: 0xc4241c,
  info: {
    weapon: 'Machado do Mutilador (com corda para arremessar e puxar)',
    style: 'Machadadas pesadas que fazem sangrar, armadilhas e caça ao alvo',
    identity: 'Caçador paciente: prende, marca e mutila — e vira o Mutilador Noturno quando põe a máscara (Transformação)',
    tagline: 'A próxima rodada sou eu.',
  },
  stats: { moveSpeed: 7.4, maxHealth: 1150 }, // pesado: aguenta os rápidos pela vida (1200 deu 71%, 1100 deu 36%)
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_aguiar', block: 'block_weapon' },
  chargeFx: { style: 'blood', color: 0xc4241c },
  dodge: { style: 'default', distance: 4.2 },

  melee: {
    name: 'Machado do Mutilador',
    strikes: [
      { name: 'Machadada', anim: 'slash_h', dur: 0.38, active: [0.13, 0.22], damage: 34, range: 2.0, arc: 120, knockback: 1.6, lunge: 1.1, sound: 'swing', hitSound: 'axeHit', trail: { color: 0xc01818, tilt: 0.05 } },
      { name: 'Machadada de volta', anim: 'slash_h_back', dur: 0.38, active: [0.13, 0.22], damage: 34, range: 2.0, arc: 120, knockback: 1.6, lunge: 1.0, sound: 'swing', hitSound: 'axeHit', trail: { color: 0xc01818, tilt: 0.15, flip: true } },
      { name: 'Chute de coturno', anim: 'kick_front', dur: 0.36, active: [0.12, 0.2], damage: 28, range: 1.7, arc: 80, knockback: 2.0, lunge: 1.0, sound: 'swing', hitSound: 'kick' },
      { name: 'Golpe por cima', anim: 'slash_v', dur: 0.46, active: [0.18, 0.28], damage: 44, range: 2.0, arc: 70, knockback: 2.2, lunge: 1.0, guardCrush: 30, sound: 'swing', hitSound: 'axeHit', trail: { color: 0xc01818, roll: 1.55 } },
      { name: 'Mutilação', anim: 'slash_finisher', dur: 0.64, active: [0.3, 0.42], damage: 60, range: 2.2, arc: 90, lunge: 1.8, finisher: 'launch', bleed: { dps: 6, duration: 3 }, sound: 'slashFinal', hitSound: 'axeHit', trail: { color: 0xc01818, roll: 1.5, big: true } },
    ],
    up: { name: 'Machado para cima', anim: 'slash_up', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.1, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'axeHit', trail: { color: 0xc01818, tilt: -1.3 } },
    down: { name: 'Machado no chão', anim: 'slash_d', dur: 0.52, active: [0.2, 0.32], damage: 48, range: 2.1, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'axeHit', impactScale: 1.4, trail: { color: 0xc01818, roll: 1.2, big: true } },
    forward: { name: 'Investida de ombro', anim: 'shoulder_bash', dur: 0.45, active: [0.14, 0.26], damage: 36, range: 1.7, arc: 110, knockback: 3.2, guardCrush: 25, motion: [{ t: [0, 0.24], fwd: 4.8, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Recua e revida', anim: 'sway_elbow', dur: 0.55, active: [0.32, 0.44], damage: 38, range: 1.6, arc: 100, knockback: 2.4, iframes: [0, 0.22], motion: [{ t: [0, 0.16], back: 2.0 }, { t: [0.2, 0.34], fwd: 2.2, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    side: { name: 'Machadada lateral', anim: 'slash_h', dur: 0.4, active: [0.12, 0.24], damage: 30, range: 2.0, arc: 140, knockback: 1.8, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'swing', hitSound: 'axeHit', trail: { color: 0xc01818, tilt: 0.2 } },
    air: { name: 'Machado do alto', anim: 'air_slash', dur: 0.42, active: [0.14, 0.3], damage: 38, range: 2.0, arc: 110, knockback: 3, slam: 16, vertical: 2.2, sound: 'swing', hitSound: 'axeHit', trail: { color: 0xc01818, roll: 1.4 } },
  },

  // □: Machado na Corda — amarra a corda no machado, arremessa (como no píer do acampamento) e, se acertar,
  // abre um corte que sangra e PUXA a vítima para perto. Ele não usa arma de fogo.
  ranged: {
    name: 'Machado na Corda',
    type: 'projectile',
    anim: 'throw_r',
    hideProp: 'axe', // o machado sai da mão e volta no fim
    origin: 'hand',
    windup: 0.3,
    recovery: 0.5,
    count: 1,
    interval: 0,
    damage: 30,
    range: 14,
    speed: 26,
    radius: 0.5,
    spread: 0,
    knockback: 0,
    hitstun: 0.5,
    cooldown: 2.6,
    energyCost: 0,
    chain: true,
    rope: true,
    visual: 'axe',
    color: 0xc01818,
    sound: 'knifeThrow',
    hitSound: 'axeHit',
    onHit: { pull: { distance: 1.6, time: 0.3, after: 0.6 }, bleed: { dps: 4, duration: 2.5 } },
  },

  abilities: [
    {
      id: 'ataqueEspecial',
      name: 'Ataque Especial',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'heavyBlow',
      description: 'Concentra a força num golpe só: ergue o machado e crava por cima com tudo — gasta muito da defesa e derruba. Preparação longa (aguenta um golpe pequeno depois de firmar os pés); errar deixa ele aberto.',
      energyCost: 30,
      cooldown: 12,
      anim: 'slash_v',
      duration: 1.2,
      armorFrom: 0.3,
      impact: 0.72,
      step: 5,
      range: 2.2,
      arc: 90,
      damage: 90,
      knockback: 4,
      guardCrush: 60,
      whiffRecovery: 0.5,
      ai: { when: 'opening', max: 2.5 },
    },
    {
      id: 'armadilha',
      name: 'Armadilha de Urso',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'bearTrap',
      description: 'Arma uma armadilha de urso no chão à frente. Quem pisar fica preso, toma dano e sangra. Só uma por vez.',
      energyCost: 20,
      cooldown: 12,
      damage: 40,
      stun: 1.2,
      radius: 0.7,
      distance: 1.4,
      life: 14,
      bleed: { dps: 5, duration: 3 },
    },
    {
      id: 'caes',
      name: 'Cães de Caça',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'huntingDog',
      description: 'Assobia e um dos Rottweilers do acampamento corre até a vítima, morde (prende por um instante e faz sangrar) e volta.',
      energyCost: 25,
      cooldown: 14,
      damage: 30,
      hold: 0.8,
      speed: 13,
      maxRun: 2.5,
      bleed: { dps: 4, duration: 2 },
    },
    {
      id: 'predador',
      name: 'Predador de Sangue',
      input: 'block+jump', // R2 + × / RT + A
      type: 'predatorScent',
      description: 'Memoriza o cheiro da vítima: por alguns segundos rastreia o sangue dela, anda mais rápido e todo ataque contra ela fica mais forte.',
      energyCost: 20,
      cooldown: 20,
      duration: 8,
      damageMult: 1.15,
      speedMult: 1.08,
      color: 0xb0101c,
    },
  ],

  // Especial (sem a máscara — ela é só da Transformação): o delegado caça e finaliza a vítima a machadadas
  special: {
    name: 'Caçada no Acampamento',
    banner: 'A próxima rodada sou eu.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → COMBAT.specialDamage (250)
    color: 0xd01020,
    sound: 'axeHit',
    prepare: { anim: 'concentrate', time: 0.8 },
    dash: { speed: 18, maxTime: 0.5, contact: 1.9 },
    hits: [
      { t: 0.95, anim: 'slash_d', dur: 0.36, share: 0.15, fx: { kind: 'slash', roll: 0.9 }, sound: 'axeHit' },
      { t: 1.32, anim: 'slash_h', dur: 0.34, share: 0.15, fx: { kind: 'slash', tilt: 0.1 }, sound: 'axeHit' },
      { t: 1.68, anim: 'slash_h_back', dur: 0.34, share: 0.15, fx: { kind: 'slash', tilt: -0.2, flip: true }, sound: 'axeHit' },
      { t: 2.02, anim: 'kick_front', dur: 0.34, share: 0.15, fx: { kind: 'punch' }, sound: 'kick' },
      { t: 2.5, anim: 'slash_v', dur: 0.44, share: 0.4, fx: { kind: 'slash', roll: 1.55, big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.3,
    length: 3.4,
  },

  // TRANSFORMAÇÃO (Barra de Transformação cheia + vida baixa, segurando △): para os Mascarados a máscara é a Intenção de
  // Assassino despertando — ele põe a máscara branca da mão vermelha e vira o MUTILADOR NOTURNO até o fim do round
  // (forms/aguiar_mutilador.js): Ataque Mutilador, Predador Perfeito e todo golpe do machado sangra.
  awakening: {
    name: 'Máscara do Mutilador Noturno',
    banner: 'Máscara do Mutilador Noturno',
    type: 'maskTransform',
    form: 'aguiar_mutilador',
    formBanner: 'Mutilador Noturno',
    prop: 'maskOn',
    duration: 0, // até o fim do round
    bonusHealth: 100,
    color: 0xd01020,
  },

  passives: [
    { type: 'sonOfPain', after: 3, mult: 0.75 }, // Filho da Dor: apanhando seguido, resiste mais
  ],
};
