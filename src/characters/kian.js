// KIAN (id interno: kian) — força física absurda + paranormal + mobilidade + ataques devastadores.
// REGRA ABSOLUTA: nenhuma arma. Todo o combate é com os punhos/corpo.
// Rituais: Teletransporte, Lâmina do Medo, Toque da Morte, Levitação, Rejeitar Névoa e o especial Inexistir.
// A Lâmina do Medo é uma manifestação de energia temporária ao redor da mão,
// não uma espada física, e só aparece durante a habilidade.
export default {
  id: 'kian',
  name: 'KIAN',
  model: 'kian',
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
  stats: { moveSpeed: 7.8, attackSpeed: 1.14 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'vic_kian', block: 'block' },
  chargeFx: { style: 'fists', color: 0xffd88a },
  dodge: { style: 'default' },

  melee: {
    name: 'Punhos',
    // sequência ágil: cada golpe sai rápido, empurra pouco (o alvo continua no alcance) e emenda no próximo
    strikes: [
      { name: 'Jab', anim: 'jab', dur: 0.24, active: [0.06, 0.13], damage: 24, range: 1.8, arc: 100, knockback: 0.8, lunge: 1.3, sound: 'swing', hitSound: 'punch', hand: 'L' },
      { name: 'Direto', anim: 'cross', dur: 0.26, active: [0.07, 0.14], damage: 26, range: 1.8, arc: 100, knockback: 0.9, lunge: 1.2, sound: 'swing', hitSound: 'punch', hand: 'R' },
      // três socos seguidos com sigilos (três acertos)
      { name: 'Rajada sigilar', anim: 'flurry', dur: 0.5, actives: [[0.06, 0.14], [0.2, 0.28], [0.34, 0.42]], damage: 42, range: 1.8, arc: 110, knockback: 0.5, lunge: 0.9, sound: 'swing', hitSound: 'punch', impactFx: 'sigil', impactScale: 0.9 },
      { name: 'Soco no corpo', anim: 'body_blow', dur: 0.3, active: [0.09, 0.17], damage: 28, range: 1.7, arc: 100, knockback: 1.0, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch', hand: 'R' },
      { name: 'Cruzado', anim: 'hook_l', dur: 0.32, active: [0.1, 0.18], damage: 30, range: 1.8, arc: 140, knockback: 1.2, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch', hand: 'L', impactScale: 1.2 },
      { name: 'Golpe da Transcendência', anim: 'heavy_punch', dur: 0.46, active: [0.18, 0.27], damage: 60, range: 1.9, arc: 100, lunge: 2.0, finisher: 'launch', hitstop: 0.08, sound: 'swing', hitSound: 'heavyPunch', hand: 'R', impactFx: 'sigil', impactScale: 1.8 },
    ],
    up: { name: 'Gancho ascendente', anim: 'uppercut', dur: 0.4, active: [0.12, 0.22], damage: 42, range: 1.9, arc: 120, lunge: 1.0, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch' },
    down: { name: 'Soco meteoro', anim: 'meteor_punch', dur: 0.5, active: [0.2, 0.3], damage: 52, range: 1.9, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.8, hitstop: 0.09 },
    // frente + ○: avança e já abre combo (empurra pouco)
    forward: { name: 'Avanço', anim: 'dash_punch', dur: 0.42, active: [0.14, 0.26], damage: 36, range: 1.8, arc: 100, knockback: 1.4, motion: [{ t: [0, 0.26], fwd: 5.0, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', impactFx: 'sigil', impactScale: 1.3 },
    // trás + ○: agarra e empurra para longe (reposicionamento)
    back: { name: 'Agarrão e empurrão', anim: 'shove', dur: 0.42, active: [0.16, 0.26], damage: 32, range: 1.5, arc: 100, finisher: 'push', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4 },
    side: { name: 'Gancho em movimento', anim: 'hook_r', dur: 0.32, active: [0.1, 0.19], damage: 30, range: 1.8, arc: 140, knockback: 1.1, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.2 },
    air: { name: 'Soco meteoro aéreo', anim: 'meteor_punch', dur: 0.44, active: [0.14, 0.34], damage: 40, range: 1.9, arc: 110, knockback: 4, slam: 18, vertical: 2.5, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'sigil', impactScale: 1.5 },
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
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'blink',
      description: 'Some numa distorção e reaparece numa posição válida: na direção do analógico ou, sem direção, ao lado do adversário.',
      energyCost: 20,
      cooldown: 7,
      distance: 7,
      flankDistance: 2.2,
      vanishTime: 0.16,
      color: 0xffd88a,
      residue: 'sigil', // deixa sigilos dourados onde estava
    },
    {
      // cânone: "Kian consegue levitar e mover pequenos objetos apenas erguendo a sua mão" (substitui a
      // Transcendência, que repetia o golpe que atravessa a defesa)
      id: 'levitacao',
      name: 'Levitação',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'levitation',
      description: 'Ergue a mão e as pedras do chão flutuam em volta dele; depois voam uma a uma contra o alvo (dá para defender ou sair da frente).',
      energyCost: 30,
      cooldown: 15,
      windup: 0.55,
      recovery: 0.3,
      stones: 5,
      interval: 0.16,
      speed: 24,
      range: 18,
      damage: 16, // por pedra (80 se todas acertarem)
      color: 0xffd88a,
    },
    {
      id: 'laminaMedo',
      name: 'Lâmina do Medo',
      input: 'carga+physical', // △ + ○ / Y + B
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
      input: 'block+jump', // R2 + × / RT + A
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
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'deathTouch',
      description: 'Toca o alvo e o envelhece: ele definha e fica lento por alguns segundos e FRACO (−20% de dano) até o fim do round. Curtíssimo alcance, como o Inexistir — dá para esquivar. Recarga muito longa.',
      energyCost: 40,
      cooldown: 55,
      roundWeaken: 0.8, // dano do alvo × 0,8 até o fim do round
      windup: 0.38,
      recovery: 0.35,
      range: 1.3,
      damage: 30,
      duration: 6,
      dps: 6,
      slow: 0.8,
      color: 0x8a8090,
    },
  ],

  // Especial INEXISTIR: o corpo do alvo se enche de escrita, brilha por dentro e vira pó,
  // como se nunca tivesse existido. Corpo a corpo, 2 vezes por partida (não volta no round
  // seguinte), NÃO pode ser defendido — só esquivado. Com a sanidade (energia) cheia o alvo
  // resiste: leva muito dano, mas não o suficiente para morrer.
  special: {
    name: 'Inexistir',
    banner: 'Inexistir',
    type: 'erase',
    energyCost: 50,
    cooldown: 14,
    usesPerMatch: 2, // era 1 (+1 ao Transcender): com o fim do Transcender, os 2 usos ficam fixos
    unblockable: true,
    dash: { speed: 24, maxTime: 0.4, contact: 1.6 },
    resistDamage: 450, // dano quando o alvo resiste com sanidade cheia (nunca mata)
    color: 0xffd88a,
  },

  passives: [
    { type: 'precognition' }, // Precognição: não é pego desprevenido (sem bônus de costas nem "surpreso")
  ],
};
