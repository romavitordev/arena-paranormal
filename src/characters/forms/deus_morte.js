// O DEUS DA MORTE (Relíquia de Morte no corpo do Ferreiro). Não aparece na seleção: o Ferreiro vira o Deus da Morte se
// morrer durante o Pacto do Santo. CHEFE: o dobro do tamanho, barra de vida preta no centro da tela, fraco contra
// FOGO e ENERGIA (os Luzidios renegam a Energia, até o fogo), regenera de tempo em tempo e não fica preso em combos.
// Habilidades do cânone: Espiral Descendente, Controlar Mortos, Senhor do Tempo e Regeneração.
export default {
  id: 'deus_morte',
  form: true,
  baseId: 'ferreiro',
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
    identity: 'Forma de chefe do Ferreiro (morreu durante o Pacto do Santo)',
    tagline: 'É possível destruir a própria Morte?',
  },
  stats: { moveSpeed: 5.4, size: 2, maxHealth: 850 }, // última resistência, não uma luta nova
  weakTo: { fire: 1.5, energia: 1.5 },
  regen: { every: 7, amount: 45, color: 0x0a080c },
  poise: { hits: 3 },
  // animações próprias (anim/formClips.js); os nomes genéricos usados pelas habilidades também são trocados
  anims: { idle: 'idle_hunch', run: 'dm_walk', walk: 'dm_walk', walk_back: 'dm_walk_back', strafe_L: 'dm_strafe_L', strafe_R: 'dm_strafe_R', dash: 'dm_dash', charge: 'dm_charge', concentrate: 'dm_charge', victory: 'dm_victory', block: 'dm_block', block_hit: 'dm_block_hit', hit: 'dm_hit', grab: 'dm_grab', cast_up: 'dm_cast', point: 'dm_point', powerup: 'dm_charge' },
  chargeFx: { style: 'default', color: 0x6a6670 },
  dodge: { style: 'default', distance: 3.6 },

  melee: {
    name: 'Punhos de Lodo',
    strikes: [
      { name: 'Tapa de Lodo', anim: 'dm_slap', dur: 0.5, active: [0.18, 0.28], damage: 46, range: 3.4, arc: 120, knockback: 2.5, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.6, groundFx: 'dust', groundScale: 0.7 },
      { name: 'Gancho de Lodo', anim: 'dm_hook', dur: 0.54, active: [0.2, 0.3], damage: 52, range: 3.4, arc: 150, knockback: 3, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.7 },
      { name: 'Esmagar', anim: 'dm_smash', dur: 0.7, active: [0.3, 0.42], damage: 72, range: 3.6, arc: 110, lunge: 1.2, finisher: 'launch', hitstop: 0.12, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 2.2, groundFx: 'smash' },
    ],
    up: { name: 'Erguer pelo pescoço', anim: 'dm_lift', dur: 0.56, active: [0.2, 0.32], damage: 50, range: 3.4, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.8 },
    down: { name: 'Pisão de Lodo', anim: 'dm_stomp', dur: 0.62, active: [0.26, 0.38], damage: 60, range: 3.4, arc: 140, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 2, groundFx: 'smash', groundScale: 1.2 },
    air: { name: 'Queda do Deus', anim: 'dm_air', dur: 0.5, active: [0.16, 0.32], damage: 50, range: 3.4, arc: 140, knockback: 4, slam: 18, vertical: 3.2, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 2 },
  },

  // □: onda de Lodo pelo chão
  ranged: {
    name: 'Onda de Lodo',
    type: 'projectile',
    anim: 'dm_cast',
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
      input: 'carga+physical', // △ + ○ / Y + B
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
      input: 'block+carga', // R2 + △ / RT + Y
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
      input: 'block+jump', // R2 + × / RT + A
      type: 'timeWarp',
      description: 'Distorce o tempo do inimigo: ele fica muito lento por 4 s.',
      energyCost: 30,
      cooldown: 18,
      range: 16,
      slow: 0.5,
      duration: 4,
    },
  ],

  // Especial ENVELHECIMENTO (pedido do usuário): agarra o adversário pelo PESCOÇO, ergue e o envelhece — cabelo
  // branco, pele acinzentada, curvado — e o deixa fraco até o fim do round. É o golpe mais forte dele: preparo
  // visível (dá para esquivar ou sair do alcance), só de perto, 1x por round (não pega quem já está envelhecido) e
  // recarga longa. (Era o Heilag Vagga, um combo de socos de Lodo.)
  special: {
    name: 'Envelhecimento',
    banner: 'Envelhecimento',
    type: 'ageGrab',
    energyCost: 50,
    cooldown: 60,
    range: 7,
    grabRange: 2.6,
    reach: 0.55,
    damage: 150,
    aged: { mult: 0.6, speedMult: 0.7 }, // −40% de dano, −30% de velocidade, sem regenerar sanidade
    color: 0x6a6670,
  },

  passives: [
    { type: 'thickSkin', knockback: 0.3, chip: 0.5, guard: 0.6 }, // massa enorme: quase não é empurrado
  ],
};
