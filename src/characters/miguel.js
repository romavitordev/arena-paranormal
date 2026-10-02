// MIGUEL CARIAD (id: miguel) — ex-agente da Ordo Realitas (Equipe Kelvin), ex-fisiculturista, que se entregou a
// Santo Berço (O Segredo na Floresta). Luta com os punhos e o revólver Magnum; a lábia é a arma preferida dele.
//
// TRÊS FORMAS (ver combat/forms.js e characters/forms):
//   1. MIGUEL — quando a SANIDADE zera (cada golpe recebido também tira sanidade), vira LUZIDIO, como a barra de
//      sanidade secreta de Santo Berço no cânone.
//   2. LUZIDIO (O Ferreiro) — 2,20 m, pele cinza, barba branca, Espada Consumidora. O especial dele é o PACTO DO
//      SANTO: exige sanidade acima de 85% e dura 45 s.
//   3. DEUS DA MORTE — se ele MORRER durante o pacto, o Lodo toma o corpo: chefe com o dobro do tamanho, barra de vida
//      preta no centro da tela, fraco contra fogo e Energia, que regenera de tempo em tempo.
export default {
  id: 'miguel',
  name: 'MIGUEL CARIAD',
  model: 'miguel',
  color: '#5a6a52',
  origin: 'Ordo Realitas',
  element: 'morte', // a Exposição que o levou a Santo Berço e à Relíquia de Morte
  energyColor: 0x9a94ae,
  info: {
    weapon: 'Punhos, revólver Magnum e a lábia',
    style: 'Socos pesados de fisiculturista; perdendo a sanidade vira Luzidio e pode virar o Deus da Morte',
    identity: 'Se transforma: Miguel → Luzidio (sanidade zerada) → Deus da Morte (morrer durante o Pacto do Santo)',
    tagline: 'Opa, tá perdida aí?',
  },
  stats: { moveSpeed: 7.4, maxHealth: 1050 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'victory', block: 'block' },
  chargeFx: { style: 'default', color: 0x9a94ae },
  dodge: { style: 'default', distance: 4.8 },
  // sanidade zerada → forma Luzidia (recomeça com um pouco de sanidade para poder lutar)
  onSanityZero: { form: 'miguel_luzidio', energy: 35, banner: 'Luzidio', notify: 'A SANIDADE ACABOU: LUZIDIO' },

  melee: {
    name: 'Punhos de fisiculturista',
    strikes: [
      { name: 'Jab', anim: 'jab', dur: 0.26, active: [0.07, 0.14], damage: 28, range: 1.8, arc: 100, knockback: 0.9, lunge: 1.2, sound: 'swing', hitSound: 'punch', hand: 'L' },
      { name: 'Direto', anim: 'cross', dur: 0.3, active: [0.08, 0.16], damage: 30, range: 1.8, arc: 100, knockback: 1.0, lunge: 1.2, sound: 'swing', hitSound: 'punch', hand: 'R' },
      { name: 'Gancho', anim: 'hook_l', dur: 0.34, active: [0.1, 0.19], damage: 34, range: 1.8, arc: 140, knockback: 1.2, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch', hand: 'L' },
      { name: 'Soco no estômago', anim: 'body_blow', dur: 0.34, active: [0.1, 0.19], damage: 38, range: 1.7, arc: 100, knockback: 1.1, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch', hand: 'R' },
      { name: 'Supino invertido', anim: 'heavy_punch', dur: 0.52, active: [0.2, 0.3], damage: 62, range: 1.9, arc: 100, lunge: 1.8, finisher: 'launch', hitstop: 0.09, sound: 'swing', hitSound: 'heavyPunch', hand: 'R', impactScale: 1.7 },
    ],
    up: { name: 'Uppercut', anim: 'uppercut', dur: 0.42, active: [0.13, 0.23], damage: 42, range: 1.9, arc: 120, lunge: 1.0, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch' },
    down: { name: 'Martelada com os punhos', anim: 'meteor_punch', dur: 0.5, active: [0.2, 0.3], damage: 50, range: 1.9, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.6 },
    forward: { name: 'Ombrada', anim: 'shoulder_bash', dur: 0.42, active: [0.14, 0.26], damage: 36, range: 1.8, arc: 100, knockback: 2.2, motion: [{ t: [0, 0.26], fwd: 5.2, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    side: { name: 'Passo e gancho', anim: 'hook_r', dur: 0.36, active: [0.12, 0.21], damage: 32, range: 1.8, arc: 140, knockback: 1.6, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'swing', hitSound: 'heavyPunch' },
    back: { name: 'Agarrão e empurrão', anim: 'shove', dur: 0.42, active: [0.16, 0.26], damage: 32, range: 1.5, arc: 100, finisher: 'push', sound: 'swing', hitSound: 'heavyPunch' },
    air: { name: 'Soco aéreo', anim: 'meteor_punch', dur: 0.44, active: [0.14, 0.28], damage: 36, range: 1.9, arc: 110, knockback: 3, slam: 15, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch' },
  },

  // □: Magnum — um tiro só, pesado e lento para recarregar
  ranged: {
    name: 'Magnum',
    type: 'projectile',
    anim: 'point',
    showProp: 'gun',
    windup: 0.28,
    recovery: 0.32,
    count: 1,
    interval: 0,
    damage: 46,
    range: 30,
    speed: 70,
    radius: 0.3,
    spread: 0,
    knockback: 2.0,
    hitstun: 0.4,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffd27a,
    sound: 'sniper',
    hitSound: 'impact',
  },

  abilities: [
    {
      id: 'labia',
      name: 'Lábia',
      input: 'mod+physical', // R1 + ○ / RB + B
      type: 'charm',
      description: 'O charme do Miguel: o inimigo à frente hesita um instante e bate 20% mais fraco por 5 s.',
      energyCost: 20,
      cooldown: 12,
      windup: 0.3,
      range: 5,
      arc: 80,
      stun: 0.6,
      weaken: 0.8,
      duration: 5,
      color: 0xd8c8a0,
    },
    {
      id: 'poseFisiculturista',
      name: 'Pose de Fisiculturista',
      input: 'mod+carga', // R1 + △ / RB + Y
      type: 'selfBuff',
      buffType: 'flex',
      label: 'POSE DE FISICULTURISTA',
      anim: 'powerup',
      description: 'Contrai os músculos: socos 25% mais fortes por 7 s.',
      energyCost: 20,
      cooldown: 16,
      duration: 7,
      damageMult: 1.25,
      affects: ['melee'],
      color: 0xd8c8a0,
    },
    {
      id: 'tiroNaTesta',
      name: 'Tiro na Testa',
      input: 'mod+ranged', // R1 + □ / RB + X
      type: 'cursedShots',
      description: 'Mira com calma e dispara a Magnum na cabeça: um tiro só, muito forte.',
      energyCost: 20,
      cooldown: 11,
      anim: 'point',
      windup: 0.55,
      interval: 0.1,
      count: 1,
      projectile: { visual: 'bullet', color: 0xffd27a, speed: 80, range: 32, radius: 0.32, damage: 72, knockback: 3, hitstun: 0.5, homing: 0.6, kind: 'ability', hitSound: 'impact' },
    },
    {
      id: 'marcaEspiral',
      name: 'Marca Espiral',
      input: 'mod+dodge', // R1 + L2 / RB + LT
      type: 'spiralMark',
      description: 'Crava o Símbolo Espiral no próprio peito: perde um pouco de vida e TODA a sanidade — vira Luzidio na hora.',
      energyCost: 0,
      cooldown: 30,
      duration: 0.9,
      selfDamage: 40,
    },
  ],

  // Especial EQUIPE KELVIN: a sequência que ele aprendeu com Arnaldo Fritz — socos pesados até o uppercut final
  special: {
    name: 'Equipe Kelvin',
    banner: 'Equipe Kelvin!',
    type: 'cinematicCombo',
    physical: true,
    energyCost: 50,
    cooldown: 14,
    color: 0xd8c8a0,
    sound: 'specialStart',
    prepare: { anim: 'charge_fists', time: 0.5, fx: 'stomp' },
    dash: { speed: 20, maxTime: 0.5, contact: 1.7 },
    hits: [
      { t: 0.9, anim: 'jab', dur: 0.26, share: 0.12, fx: { kind: 'punch' }, sound: 'punch' },
      { t: 1.15, anim: 'cross', dur: 0.3, share: 0.14, fx: { kind: 'punch' }, sound: 'punch' },
      { t: 1.45, anim: 'body_blow', dur: 0.34, share: 0.16, fx: { kind: 'punch' }, sound: 'heavyPunch' },
      { t: 1.8, anim: 'hook_l', dur: 0.34, share: 0.18, fx: { kind: 'punch' }, sound: 'heavyPunch' },
      { t: 2.3, anim: 'uppercut', dur: 0.42, share: 0.4, fx: { kind: 'punch', big: true, up: true }, sound: 'heavyPunch', final: true },
    ],
    bannerAt: 0.3,
    length: 3.2,
  },

  passives: [
    { type: 'fragileSanity', mult: 0.3 }, // Sanidade em Queda: cada golpe recebido também tira sanidade
  ],
};
