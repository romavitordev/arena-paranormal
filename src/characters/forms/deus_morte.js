// O DEUS DA MORTE (Relíquia de Morte no corpo do Ferreiro). Não aparece na seleção: o Miguel vira o Deus da Morte se
// morrer durante o Pacto do Santo. CHEFE: o dobro do tamanho, barra de vida preta no centro da tela, fraco contra
// FOGO e ENERGIA (os Luzidios renegam a Energia, até o fogo), regenera de tempo em tempo e não fica preso em combos.
// Habilidades do cânone: Espiral Descendente, Controlar Mortos, Senhor do Tempo e Regeneração.
export default {
  id: 'deus_morte',
  form: true,
  baseId: 'miguel',
  boss: true,
  name: 'O DEUS DA MORTE',
  model: 'deus_morte',
  color: '#2a2632',
  origin: 'Relíquia de Morte',
  element: 'morte',
  energyColor: 0x6a6670,
  info: {
    weapon: 'Punhos de Lodo',
    style: 'Chefe gigante: agarra e envelhece, controla os mortos e distorce o tempo',
    identity: 'Forma de chefe do Miguel (morreu durante o Pacto do Santo)',
    tagline: 'É possível destruir a própria Morte?',
  },
  stats: { moveSpeed: 5.4, size: 2, maxHealth: 1300 },
  weakTo: { fire: 1.5, energia: 1.5 },
  regen: { every: 6, amount: 60, color: 0x0a080c },
  poise: { hits: 3 },
  anims: { idle: 'idle_hunch', run: 'walk', charge: 'charge', victory: 'victory', block: 'block_hunch' },
  chargeFx: { style: 'default', color: 0x6a6670 },
  dodge: { style: 'default', distance: 3.6 },

  melee: {
    name: 'Punhos de Lodo',
    strikes: [
      { name: 'Tapa de Lodo', anim: 'cross', dur: 0.5, active: [0.18, 0.28], damage: 46, range: 3.4, arc: 120, knockback: 2.5, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.6, groundFx: 'dust', groundScale: 0.7 },
      { name: 'Gancho de Lodo', anim: 'hook_r', dur: 0.54, active: [0.2, 0.3], damage: 52, range: 3.4, arc: 150, knockback: 3, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.7 },
      { name: 'Esmagar', anim: 'heavy_punch', dur: 0.7, active: [0.3, 0.42], damage: 72, range: 3.6, arc: 110, lunge: 1.2, finisher: 'launch', hitstop: 0.12, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 2.2, groundFx: 'smash' },
    ],
    up: { name: 'Erguer pelo pescoço', anim: 'uppercut', dur: 0.56, active: [0.2, 0.32], damage: 50, range: 3.4, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.8 },
    down: { name: 'Pisão de Lodo', anim: 'meteor_punch', dur: 0.62, active: [0.26, 0.38], damage: 60, range: 3.4, arc: 140, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 2, groundFx: 'smash', groundScale: 1.2 },
    air: { name: 'Queda do Deus', anim: 'meteor_punch', dur: 0.5, active: [0.16, 0.32], damage: 50, range: 3.4, arc: 140, knockback: 4, slam: 18, vertical: 3.2, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 2 },
  },

  // □: onda de Lodo pelo chão
  ranged: {
    name: 'Onda de Lodo',
    type: 'projectile',
    anim: 'cast_up',
    windup: 0.4,
    recovery: 0.4,
    count: 1,
    interval: 0,
    damage: 40,
    range: 16,
    speed: 16,
    radius: 0.9,
    spread: 0,
    knockback: 2.5,
    hitstun: 0.5,
    cooldown: 3,
    energyCost: 0,
    visual: 'shockwave',
    color: 0x2a2632,
    sound: 'drain',
    hitSound: 'impact',
  },

  abilities: [
    {
      id: 'espiralDescendente',
      name: 'Espiral Descendente',
      input: 'mod+physical', // R1 + ○ / RB + B
      type: 'timelockGrab',
      description: 'Agarra a vítima e a prende no tempo: ela envelhece (dano contínuo), perde sanidade e fica lenta. Não dá para defender.',
      energyCost: 25,
      cooldown: 14,
      windup: 0.45,
      lunge: 8,
      range: 3.6,
      hold: 1.6,
      damage: 90,
      energyDrain: 40,
      slow: 0.6,
      slowTime: 5,
    },
    {
      id: 'controlarMortos',
      name: 'Controlar Mortos',
      input: 'mod+carga', // R1 + △ / RB + Y
      type: 'deadHands',
      description: 'O Lodo obedece: mãos de Lodo brotam do chão sob o inimigo, três vezes (a última lança).',
      energyCost: 25,
      cooldown: 12,
      windup: 0.4,
      count: 3,
      interval: 0.55,
      radius: 1.4,
      damage: 30,
      range: 16,
    },
    {
      id: 'senhorDoTempo',
      name: 'Senhor do Tempo',
      input: 'mod+jump', // R1 + × / RB + A
      type: 'timeWarp',
      description: 'Distorce o tempo do inimigo: ele fica muito lento por 4 s.',
      energyCost: 30,
      cooldown: 18,
      range: 16,
      slow: 0.5,
      duration: 4,
    },
  ],

  // Especial HEILAG VAGGA: agarra e esmaga com os punhos de Lodo
  special: {
    name: 'Heilag Vagga',
    banner: 'Heilag Vagga',
    type: 'cinematicCombo',
    physical: true,
    energyCost: 50,
    cooldown: 16,
    color: 0x2a2632,
    sound: 'specialStart',
    prepare: { anim: 'charge', time: 0.6, fx: 'stomp' },
    dash: { speed: 14, maxTime: 0.6, contact: 3 },
    hits: [
      { t: 0.95, anim: 'hook_r', dur: 0.5, share: 0.2, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.5, anim: 'cross', dur: 0.5, share: 0.2, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 2.2, anim: 'meteor_punch', dur: 0.6, share: 0.6, fx: { kind: 'smash', big: true }, sound: 'heavyPunch', final: true },
    ],
    bannerAt: 0.3,
    length: 3.4,
  },

  passives: [
    { type: 'thickSkin', knockback: 0.3, chip: 0.5, guard: 0.6 }, // massa enorme: quase não é empurrado
  ],
};
