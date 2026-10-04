// XANDE (Alexandre) (id: xande) — Os Cinco (Sinais do Outro Lado). Skatista, teórico da conspiração e
// ocultista da trilha Lâmina Paranormal: taco de baseball com arame farpado preso por corrente ao braço e o
// Skate Caótico. Rituais: Amaldiçoar Arma com Sangue, Polarização Caótica, Tela de Ruído, Velocidade Mortal.
// Passiva Gladiador Paranormal: cada golpe físico que acerta devolve sanidade.
export default {
  id: 'xande',
  name: 'XANDE',
  model: 'xande',
  color: '#f2c230',
  origin: 'Os Cinco',
  element: 'sangue', // Lâmina Paranormal: Amaldiçoar Arma com Sangue, Descarnar, Armadura de Sangue
  energyColor: 0xf2c230,
  info: {
    weapon: 'Taco com arame farpado e o Skate Caótico',
    style: 'Tacadas pesadas, skate que vai e volta e rituais de Energia e Sangue',
    identity: 'Brigão versátil: amaldiçoa o taco, puxa ou repele com magnetismo e se protege com a Tela de Ruído',
    tagline: 'Por eles... Por eles... Por eles...',
  },
  stats: { moveSpeed: 8.6, attackSpeed: 1.1 }, // Tênis Lépidos
  // anda um instante e SOBE no Skate Caótico: bem mais rápido; parar, atacar ou apanhar desce
  mount: { prop: 'skate', after: 0.35, speedMult: 1.4, anim: 'skate_ride', lift: 0.1, height: 0.06, center: 0.3, color: 0x5aff6a },
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_xande', block: 'block_skate' },
  // pegada: skate na mão esquerda; ao bater vai para as costas e o taco é seguro com as duas mãos
  grip: { prop: 'skate', reach: 0.42 },
  // o skate de escudo: bloqueio perfeito com janela um pouco maior
  defense: { perfectBlock: { window: 0.14, counterStun: 0.45 } },
  chargeFx: { style: 'default', color: 0xf2c230 },
  dodge: { style: 'default', distance: 5.0 },

  melee: {
    name: 'Taco com arame farpado',
    strikes: [
      { name: 'Tacada', anim: 'slash_h', dur: 0.32, active: [0.1, 0.18], damage: 33, range: 2.0, arc: 130, knockback: 1.0, lunge: 1.2, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0xf2c230, tilt: 0.05 } },
      { name: 'Tacada de volta', anim: 'slash_h_back', dur: 0.32, active: [0.1, 0.18], damage: 33, range: 2.0, arc: 130, knockback: 1.0, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0xf2c230, flip: true } },
      { name: 'Skate na cara', anim: 'dual_l', dur: 0.3, active: [0.09, 0.17], damage: 28, range: 1.8, arc: 110, knockback: 1.0, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Tacada por cima', anim: 'slash_v', dur: 0.42, active: [0.16, 0.26], damage: 42, range: 2.0, arc: 70, knockback: 1.6, lunge: 1.0, guardCrush: 20, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0xf2c230, roll: 1.55 } },
      { name: 'Home run', anim: 'slash_finisher', dur: 0.58, active: [0.28, 0.4], damage: 62, range: 2.1, arc: 100, lunge: 1.8, finisher: 'launch', bleed: { dps: 5, duration: 3 }, sound: 'slashFinal', hitSound: 'heavyPunch', trail: { color: 0xf2c230, roll: 1.5, big: true } },
    ],
    up: { name: 'Tacada para cima', anim: 'slash_up', dur: 0.44, active: [0.15, 0.27], damage: 40, range: 2.0, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0xf2c230, tilt: -1.3 } },
    down: { name: 'Tacada no chão', anim: 'slash_d', dur: 0.5, active: [0.2, 0.3], damage: 46, range: 2.0, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4, trail: { color: 0xf2c230, roll: 1.2, big: true } },
    // frente + ○: avança em cima do skate e acerta com o taco
    forward: { name: 'Manobra de skate', anim: 'dash_slash', dur: 0.42, active: [0.14, 0.26], damage: 34, range: 2.0, arc: 120, knockback: 1.8, motion: [{ t: [0, 0.26], fwd: 5.6, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0x5aff6a, tilt: 0.1 } },
    back: { name: 'Recua e rebate', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 34, range: 2.0, arc: 100, knockback: 2.2, iframes: [0, 0.22], motion: [{ t: [0, 0.15], back: 2.4 }, { t: [0.18, 0.32], fwd: 2.4, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0xf2c230, tilt: -0.2 } },
    side: { name: 'Tacada em movimento', anim: 'slash_h', dur: 0.36, active: [0.11, 0.21], damage: 30, range: 2.0, arc: 140, knockback: 1.6, motion: [{ t: [0, 0.22], side: 2.6 }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0xf2c230, tilt: 0.2 } },
    air: { name: 'Tacada aérea', anim: 'air_slash', dur: 0.42, active: [0.14, 0.3], damage: 36, range: 2.0, arc: 110, knockback: 3, slam: 16, vertical: 2.3, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0xf2c230, roll: 1.3 } },
  },

  // □: Skate Caótico — arremessa o skate amaldiçoado, que vai e volta para a mão
  ranged: {
    name: 'Skate Caótico',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'chest',
    windup: 0.24,
    recovery: 0.34,
    count: 1,
    interval: 0,
    damage: 38,
    range: 16,
    speed: 22,
    radius: 0.55,
    spread: 0,
    knockback: 2.0,
    hitstun: 0.45,
    cooldown: 2.2,
    energyCost: 0,
    boomerang: true,
    visual: 'skate',
    color: 0xf2c230,
    sound: 'knifeThrow',
    hitSound: 'heavyPunch',
  },

  abilities: [
    {
      id: 'amaldicoarTaco',
      name: 'Amaldiçoar Arma com Sangue',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'curseWeapon',
      description: 'Imbui o taco com Sangue: por alguns segundos cada golpe físico e o skate abrem um sangramento.',
      energyCost: 25,
      cooldown: 16,
      duration: 9,
      props: ['bat'],
      bleed: { dps: 6, duration: 3 },
      color: 0xe0204a,
    },
    {
      id: 'polarizacao',
      name: 'Polarização Caótica',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'polarize',
      description: 'Aura magnética: o inimigo LONGE é atraído até ele; o inimigo PERTO é repelido para longe e cai.',
      energyCost: 30,
      cooldown: 12,
      windup: 0.4,
      recovery: 0.3,
      range: 11,
      near: 3,
      pullDamage: 25,
      pushDamage: 45,
      color: 0x5aff6a,
    },
    {
      id: 'telaRuido',
      name: 'Tela de Ruído',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'noiseScreen',
      description: 'Película de Energia que absorve até 140 de dano físico e de projétil por alguns segundos.',
      energyCost: 30,
      cooldown: 22,
      duration: 8,
      shield: 140,
      color: 0x7ad0ff,
    },
    {
      id: 'velocidadeMortal',
      name: 'Velocidade Mortal',
      input: 'block+jump', // R2 + × / RT + A
      type: 'selfBuff',
      buffType: 'deadlySpeed',
      label: 'VELOCIDADE MORTAL',
      description: 'Distorce o tempo em volta de si: fica muito mais rápido e recupera todas as esquivas.',
      energyCost: 25,
      cooldown: 20,
      duration: 6,
      speedMult: 1.35,
      refillDodges: 4,
      color: 0xa7a3ad,
    },
    {
      id: 'cicatrizacao',
      name: 'Cicatrização',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'healOverTime',
      description: 'Ritual de Sangue: fios de sangue correm pelo corpo e fecham as feridas, recuperando vida aos poucos.',
      energyCost: 30,
      cooldown: 26,
      heal: 70,
      duration: 2.5,
      style: 'blood',
      color: 0xc01830,
    },
  ],

  // Especial "POR ELES": sobe no skate, atropela, lança o inimigo e acaba com o taco amaldiçoado
  special: {
    name: 'Por Eles',
    banner: 'Por eles...',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → COMBAT.specialDamage (250)
    color: 0xf2c230,
    sound: 'specialStart',
    prepare: { anim: 'charge', time: 0.7 },
    dash: { speed: 24, maxTime: 0.45, contact: 1.8 },
    hits: [
      { t: 0.95, anim: 'dash_slash', dur: 0.34, share: 0.15, fx: { kind: 'slash', tilt: 0.1 }, sound: 'heavyPunch' },
      { t: 1.3, anim: 'slash_up', dur: 0.36, share: 0.15, fx: { kind: 'slash', roll: -1.0 }, sound: 'heavyPunch' },
      { t: 1.65, anim: 'slash_h', dur: 0.32, share: 0.15, fx: { kind: 'slash', tilt: 0.1 }, sound: 'heavyPunch' },
      { t: 1.98, anim: 'slash_h_back', dur: 0.32, share: 0.15, fx: { kind: 'slash', tilt: -0.2, flip: true }, sound: 'heavyPunch' },
      { t: 2.5, anim: 'slash_v', dur: 0.44, share: 0.4, fx: { kind: 'slash', roll: 1.55, big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.3,
    length: 3.4,
  },

  passives: [
    { type: 'paranormalGladiator', energy: 3 }, // Gladiador Paranormal: +3 de sanidade a cada golpe físico que acerta
  ],
};
