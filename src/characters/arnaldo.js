// ARNALDO FRITZ (id: arnaldo) — ator famoso que usava a fama como fachada; um dos agentes mais experientes da Ordo
// Realitas, dos Aniquiladores (com o Senhor Veríssimo). Ocultista. Pai do Thiago Fritz.
// Luta com a ESPADA comum da fita vermelha no cabo (a mesma que o Veríssimo herda depois) — esgrima TEATRAL: cortes
// largos, estocadas e floreios "de palco" — e com o Emissor de Pulsos Paranormais (Sigilos de Conhecimento que
// atraem ou afastam).
// TRANSFORMAÇÃO (pedido do usuário): tira o relógio de bolso de ouro, abre a tampa e lá dentro está a Relíquia de
// Energia — vira O ANFITRIÃO até o fim do round, com um kit totalmente novo (forms/anfitriao.js).
// Modelo PROVISÓRIO: corpo do Joui (casaco longo) + acessórios (models/props.js addArnaldoProps) até o .glb próprio.
const GOLD = 0xe0b040;
const RED = 0xc0141c;

export default {
  id: 'arnaldo',
  name: 'ARNALDO FRITZ',
  model: 'arnaldo',
  color: '#c0141c',
  origin: 'Ordo Realitas',
  element: 'conhecimento',
  energyColor: GOLD,
  info: {
    weapon: 'Espada da fita vermelha e o Emissor de Pulsos Paranormais',
    style: 'Esgrima teatral de veterano: cortes largos, estocadas, fintas e o puxa-empurra do Emissor',
    identity: 'Aniquilador da Ordo Realitas: na Transformação, o relógio de bolso guarda a Relíquia e ele vira O Anfitrião',
    tagline: 'Senhoras e senhores, o espetáculo vai começar.',
  },
  stats: { moveSpeed: 8.2, attackSpeed: 1.05, maxHealth: 1000 },
  anims: { idle: 'idle_katana', run: 'run', charge: 'charge', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'default', color: GOLD },
  dodge: { style: 'default', distance: 4.6 },

  melee: {
    name: 'Espada da fita vermelha',
    strikes: [
      { name: 'Corte de abertura', anim: 'slash_h', dur: 0.32, active: [0.1, 0.19], damage: 26, range: 2.1, arc: 140, knockback: 1.1, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8dde4, tilt: 0.05 } },
      { name: 'Estocada de palco', anim: 'thrust', dur: 0.32, active: [0.11, 0.2], damage: 26, range: 2.5, arc: 50, knockback: 1.4, lunge: 1.5, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Corte em reverência', anim: 'slash_h_back', dur: 0.32, active: [0.1, 0.19], damage: 28, range: 2.1, arc: 140, knockback: 1.2, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8dde4, flip: true } },
      { name: 'Floreio', anim: 'slash_d', dur: 0.36, active: [0.12, 0.22], damage: 32, range: 2.2, arc: 110, knockback: 1.4, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { color: RED, roll: 0.9 } },
      { name: 'Ato final', anim: 'slash_finisher', dur: 0.58, active: [0.27, 0.38], damage: 58, range: 2.4, arc: 100, lunge: 1.8, finisher: 'launch', sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.6, trail: { color: RED, roll: 1.5, big: true } },
    ],
    up: { name: 'Corte ascendente', anim: 'slash_up', dur: 0.44, active: [0.15, 0.27], damage: 38, range: 2.2, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: RED, tilt: -1.3 } },
    down: { name: 'Golpe de cena', anim: 'slash_v', dur: 0.5, active: [0.19, 0.3], damage: 46, range: 2.2, arc: 110, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactScale: 1.4, trail: { color: RED, roll: 1.5 } },
    forward: { name: 'Entrada triunfal', anim: 'dash_slash', dur: 0.42, active: [0.12, 0.24], damage: 36, range: 2.2, arc: 130, knockback: 2.4, motion: [{ t: [0, 0.22], fwd: 4.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8dde4, tilt: 0.1, wide: true } },
    back: { name: 'Mesura e estocada', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 38, range: 2.3, arc: 80, knockback: 2.4, iframes: [0, 0.22], motion: [{ t: [0, 0.15], back: 2.2 }, { t: [0.18, 0.32], fwd: 2.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Rodopio', anim: 'slash_h', dur: 0.36, active: [0.1, 0.21], damage: 30, range: 2.2, arc: 160, knockback: 1.8, motion: [{ t: [0, 0.22], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8dde4, tilt: 0.2 } },
    air: { name: 'Corte aéreo', anim: 'air_slash', dur: 0.42, active: [0.15, 0.32], damage: 36, range: 2.2, arc: 100, knockback: 3.2, slam: 16, vertical: 2.4, sound: 'blade', hitSound: 'bladeHit', trail: { color: RED, roll: 1.5 } },
  },

  // □: EMISSOR DE PULSOS PARANORMAIS (cânone: caixa com Sigilos de Conhecimento que atrai criaturas de um elemento e
  // afasta as do oposto). Parado: o pulso ATRAI o alvo até a ponta da espada. ← + □: o pulso AFASTA.
  ranged: {
    name: 'Emissor de Pulsos Paranormais',
    type: 'projectile',
    anim: 'point',
    origin: 'chest',
    windup: 0.26,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 18,
    range: 14,
    speed: 26,
    radius: 0.6,
    spread: 0,
    knockback: 0,
    hitstun: 0.3,
    cooldown: 3.2,
    energyCost: 0,
    visual: 'shockwave',
    color: GOLD,
    element: 'conhecimento',
    sound: 'shockwave',
    hitSound: 'impact',
    onHit: { pull: { distance: 1.7, time: 0.28, after: 0.5, anim: 'point', sound: 'ritual' } },
    variants: {
      back: { label: 'AFASTAR!', damage: 26, knockback: 8, hitstun: 0.6, launch: true, onHit: null, color: 0x7ad0ff }, // joga longe e derruba
    },
  },

  abilities: [
    {
      id: 'fintaTeatral',
      name: 'Finta Teatral',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'dashStrike',
      description: 'Ator de verdade: finge o golpe, a defesa abre e o corte de verdade entra — quebra a defesa.',
      energyCost: 20,
      cooldown: 10,
      anim: 'dash_slash',
      windup: 0.22,
      distance: 6,
      speed: 22,
      recovery: 0.32,
      range: 2.2,
      damage: 55,
      knockback: 3,
      guardBreak: true,
      hitSound: 'bladeHit',
      color: RED,
    },
    {
      id: 'pulsoParanormal',
      name: 'Pulso Paranormal',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'polarize',
      description: 'O Emissor no máximo: o alvo LONGE é atraído até o Arnaldo; o alvo PERTO é jogado longe e cai.',
      energyCost: 25,
      cooldown: 12,
      windup: 0.4,
      recovery: 0.3,
      range: 11,
      near: 3,
      pullDamage: 25,
      pushDamage: 45,
      color: GOLD,
    },
    {
      id: 'rodopioFita',
      name: 'Rodopio da Fita',
      input: 'block+jump', // R2 + × / RT + A
      type: 'sweepStrike',
      description: 'Gira a espada em volta do corpo como no palco: dois cortes em área, o último joga longe.',
      energyCost: 20,
      cooldown: 11,
      anim: 'dual_spin',
      startSound: 'blade',
      windup: 0.15,
      hits: 2,
      interval: 0.2,
      recovery: 0.3,
      radius: 3,
      damage: 60,
      color: RED,
    },
    {
      id: 'aniquilador',
      name: 'Aniquilador',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'selfBuff',
      buffType: 'annihilator',
      label: 'ANIQUILADOR',
      anim: 'concentrate',
      description: 'A experiência dos Aniquiladores: por 7 s os golpes físicos batem 20% mais forte e ele recupera uma esquiva.',
      energyCost: 25,
      cooldown: 20,
      duration: 7,
      damageMult: 1.2,
      affects: ['melee'],
      refillDodges: 1,
      color: GOLD,
    },
    {
      id: 'ensaio',
      name: 'Ensaio Geral',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'selfBuff',
      buffType: 'rehearsal',
      label: 'ENSAIO GERAL',
      anim: 'concentrate',
      description: 'Já ensaiou essa cena: por 6 s recebe 25% menos dano de golpes físicos e tiros.',
      energyCost: 20,
      cooldown: 18,
      duration: 6,
      takenMult: 0.75,
      takenKinds: ['melee', 'ranged'],
      color: GOLD,
    },
  ],

  // ATO FINAL: a sequência de espada da época dos Aniquiladores — avança (dá para esquivar do avanço), quatro cortes de
  // palco e a estocada final com a fita vermelha riscando o ar
  special: {
    name: 'Ato Final',
    banner: 'Fecham-se as cortinas!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: RED,
    sound: 'specialStart',
    prepare: { anim: 'charge', time: 0.35, fx: 'bladeGlow' },
    dash: { speed: 22, maxTime: 0.5, contact: 2.0 },
    hits: [
      { t: 0.7, anim: 'slash_h', dur: 0.32, share: 0.18, fx: { kind: 'slash', tilt: 0.05, wide: true }, sound: 'bladeHit' },
      { t: 1.05, anim: 'slash_h_back', dur: 0.32, share: 0.18, fx: { kind: 'slash', tilt: -0.1, flip: true, wide: true }, sound: 'bladeHit' },
      { t: 1.4, anim: 'slash_d', dur: 0.36, share: 0.2, fx: { kind: 'slash', roll: 0.9 }, sound: 'bladeHit' },
      { t: 1.95, anim: 'thrust', dur: 0.5, share: 0.44, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.2,
    length: 3.0,
  },

  // TRANSFORMAÇÃO (Barra de Transformação cheia + vida baixa, segurando △): o relógio de bolso, a Relíquia de Energia
  // lá dentro e O ANFITRIÃO até o fim do round (kit inteiro novo)
  awakening: {
    name: 'A Relíquia do Relógio',
    banner: 'O Anfitrião',
    type: 'maskTransform',
    scene: 'watch',
    prop: 'watch',
    form: 'anfitriao',
    formBanner: 'O ANFITRIÃO',
    color: 0xb04aff,
    tint: 0xb04aff,
    bonusHealth: 60,
  },

  passives: [],
};
