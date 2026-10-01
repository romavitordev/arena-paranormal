// KIAN (id interno: desconjurado) — força física absurda + paranormal + mobilidade + ataques devastadores.
// REGRA ABSOLUTA: nenhuma arma. Todo o combate é com os punhos/corpo.
// Rituais: Teletransporte, Lâmina do Medo, Transcendência e o especial Inexistir.
// A Lâmina do Medo é uma manifestação de energia temporária ao redor da mão,
// não uma espada física, e só aparece durante a habilidade.
export default {
  id: 'desconjurado',
  name: 'KIAN',
  model: 'desconjurado',
  color: '#f2efe2',
  origin: 'Escriptas', // organização (cânone)
  element: 'conhecimento', // afinidade elemental (ver config/elements.js)
  energyColor: 0xffd88a,
  unarmed: true, // verificado pelo script de checagem do elenco
  info: {
    weapon: 'Punhos (sem armas)',
    style: 'Jab, direto, cruzado, golpe no corpo, gancho, golpe pesado, agarrão',
    identity: 'Força física absurda + paranormal + mobilidade + ataques devastadores',
    tagline: 'Os sigilos seguram o que ele carrega.',
  },
  stats: { moveSpeed: 7.4 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'victory', block: 'block' },
  chargeFx: { style: 'fists', color: 0xffd88a },
  dodge: { style: 'default' },

  melee: {
    name: 'Punhos',
    strikes: [
      { name: 'Jab', anim: 'jab', dur: 0.28, active: [0.07, 0.15], damage: 30, range: 1.6, arc: 90, knockback: 2.4, lunge: 1.2, hitstop: 0.075, sound: 'swing', hitSound: 'punch', hand: 'L', impactScale: 1.2 },
      { name: 'Direto', anim: 'cross', dur: 0.34, active: [0.11, 0.2], damage: 36, range: 1.7, arc: 90, knockback: 3.0, lunge: 1.2, hitstop: 0.075, sound: 'swing', hitSound: 'heavyPunch', hand: 'R', impactScale: 1.3 },
      { name: 'Cruzado', anim: 'hook_l', dur: 0.38, active: [0.13, 0.23], damage: 40, range: 1.6, arc: 130, knockback: 3.2, lunge: 1.1, hitstop: 0.075, sound: 'swing', hitSound: 'heavyPunch', hand: 'L', impactScale: 1.3 },
      { name: 'Gancho', anim: 'uppercut', dur: 0.45, active: [0.18, 0.28], damage: 42, range: 1.5, arc: 100, knockback: 3.4, lunge: 1.0, hitstop: 0.075, sound: 'swing', hitSound: 'heavyPunch', hand: 'R', impactScale: 1.4 },
      { name: 'Golpe pesado', anim: 'heavy_punch', dur: 0.55, active: [0.24, 0.34], damage: 64, range: 1.8, arc: 90, lunge: 2.0, finisher: 'launch', hitstop: 0.075, sound: 'swing', hitSound: 'heavyPunch', hand: 'R', impactFx: 'sigil', impactScale: 1.8 },
    ],
    up: { name: 'Gancho ascendente', anim: 'uppercut', dur: 0.46, active: [0.16, 0.28], damage: 46, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', hitstop: 0.08 },
    down: { name: 'Soco meteoro', anim: 'meteor_punch', dur: 0.6, active: [0.26, 0.38], damage: 56, range: 1.9, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.8, hitstop: 0.1 },
    forward: { name: 'Avanço', anim: 'dash_punch', dur: 0.5, active: [0.18, 0.3], damage: 46, range: 1.8, arc: 90, knockback: 5, motion: [{ t: [0, 0.3], fwd: 4.6, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', impactFx: 'sigil', impactScale: 1.5 },
    // trás + ○: agarra e empurra para longe (reposicionamento)
    back: { name: 'Agarrão e empurrão', anim: 'shove', dur: 0.5, active: [0.2, 0.32], damage: 34, range: 1.4, arc: 90, finisher: 'push', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4 },
    side: { name: 'Gancho em movimento', anim: 'hook_r', dur: 0.4, active: [0.13, 0.23], damage: 38, range: 1.6, arc: 130, knockback: 2.6, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.3 },
    air: { name: 'Soco meteoro', anim: 'meteor_punch', dur: 0.5, active: [0.18, 0.4], damage: 44, range: 1.9, arc: 110, knockback: 4, slam: 18, vertical: 2.5, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'sigil', impactScale: 1.6 },
  },

  ranged: {
    name: 'Impacto Sigilar',
    type: 'projectile',
    anim: 'wave_punch',
    windup: 0.33,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 70,
    range: 22,
    speed: 22,
    radius: 1.0,
    spread: 0,
    knockback: 4,
    hitstun: 0.4,
    cooldown: 3.5,
    energyCost: 20,
    visual: 'shockwave', // onda de energia gerada pelo corpo, não um objeto
    color: 0xffd88a,
    sound: 'shockwave',
    hitSound: 'heavyPunch',
    origin: 'fist',
  },

  abilities: [
    {
      id: 'teletransporte',
      name: 'Teletransporte',
      input: 'mod+ranged', // R1 + □ / RB + X
      type: 'blink',
      description: 'Some numa distorção e reaparece numa posição válida: na direção do analógico ou, sem direção, ao lado do adversário.',
      energyCost: 20,
      cooldown: 7,
      distance: 7,
      flankDistance: 2.2,
      vanishTime: 0.16,
      color: 0xffd88a,
    },
    {
      id: 'transcendencia',
      name: 'Transcendência',
      input: 'mod+carga', // R1 + △ / RB + Y
      type: 'transcend',
      description: 'O primeiro ritual: exposição total ao Outro Lado. Por alguns segundos os sigilos brilham, os golpes físicos atravessam a defesa e ganham impacto paranormal.',
      energyCost: 35,
      cooldown: 26,
      duration: 7,
      endDrain: 15, // transcender cobra sanidade: sem regeneração durante e -15 no fim
      color: 0xffd88a,
    },
    {
      id: 'laminaMedo',
      name: 'Lâmina do Medo',
      input: 'mod+physical', // R1 + ○ / RB + B
      type: 'fearBlade',
      description: 'Manifesta uma lâmina translúcida de medo ao redor da mão para um golpe curto devastador que quebra a defesa. Errar deixa ele exposto.',
      energyCost: 40,
      cooldown: 25, // alto, para balancear
      duration: 0.75,
      active: [0.42, 0.56],
      range: 2.8,
      arc: 100,
      damage: 160,
      hitstun: 1.1,
      whiffRecovery: 0.45,
      color: 0xb8aaff,
    },
    {
      id: 'rejeitarNevoa',
      name: 'Rejeitar Névoa',
      input: 'mod+jump', // R1 + × / RB + A
      type: 'rejectMist',
      description: 'Enfraquece drasticamente os rituais na área: dissipa névoas e zonas do inimigo e corta o dano dos rituais e do ataque principal dele por alguns segundos.',
      energyCost: 25,
      cooldown: 16,
      radius: 7,
      duration: 4,
      weaken: 0.6,
      color: 0xffd88a,
    },
    {
      id: 'toqueMorte',
      name: 'Toque da Morte',
      input: 'mod+dodge', // R1 + L2 / RB + LT
      type: 'deathTouch',
      description: 'Toca o alvo e o envelhece rápido: ele bate mais fraco, fica mais lento e definha por alguns segundos. Curto alcance e lento para sair — dá para esquivar.',
      energyCost: 35,
      cooldown: 22,
      windup: 0.38,
      recovery: 0.35,
      range: 1.5,
      damage: 30,
      duration: 6,
      dps: 6,
      weaken: 0.8,
      slow: 0.8,
      color: 0x8a8090,
    },
  ],

  // Especial INEXISTIR: o corpo do alvo se enche de escrita, brilha por dentro e vira pó,
  // como se nunca tivesse existido. Corpo a corpo, 1 vez por partida (+1 ao Transcender) (não volta no round
  // seguinte), NÃO pode ser defendido — só esquivado. Com a sanidade (energia) cheia o alvo
  // resiste: leva muito dano, mas não o suficiente para morrer.
  special: {
    name: 'Inexistir',
    banner: 'Inexistir',
    type: 'erase',
    energyCost: 50,
    cooldown: 14,
    usesPerMatch: 1,
    bonusUseOnTranscend: 1, // ao Transcender (1ª vez na partida) pode usar o Inexistir mais uma vez
    unblockable: true,
    dash: { speed: 24, maxTime: 0.4, contact: 1.6 },
    resistDamage: 450, // dano quando o alvo resiste com sanidade cheia (nunca mata)
    color: 0xffd88a,
  },

  passives: [
    { type: 'precognition' }, // Precognição: não é pego desprevenido (sem bônus de costas nem "surpreso")
  ],
};
