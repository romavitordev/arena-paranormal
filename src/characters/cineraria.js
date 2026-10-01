// KAISER (id interno: cineraria) — controle de espaço + arma de fogo + névoa.
// M4 (com variações por direção), socos e chutes, Baforada Cinerária e o
// especial Cinerária (névoa paranormal; não causa dano direto).
export default {
  id: 'cineraria',
  name: 'KAISER',
  model: 'cineraria',
  color: '#a46bff',
  origin: 'Ordo Realitas', // organização (cânone)
  element: 'energia', // afinidade elemental (ver config/elements.js)
  energyColor: 0xa46bff,
  info: {
    weapon: 'M4',
    style: 'Socos e chutes, M4 e névoa Cinerária',
    identity: 'Controle de espaço + arma de fogo + névoa',
    tagline: 'Queimada, séria e perigosa.',
  },
  stats: { moveSpeed: 7.5 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge', victory: 'victory', block: 'block' },
  chargeFx: { style: 'smoke', color: 0xa46bff },
  dodge: { style: 'default' },

  melee: {
    name: 'Socos e chutes',
    // ○ neutro: sequência
    strikes: [
      { name: 'Jab', anim: 'jab', dur: 0.3, active: [0.08, 0.17], damage: 32, range: 1.6, arc: 90, knockback: 1.5, lunge: 1.2, sound: 'swing', hitSound: 'punch', hand: 'L' },
      { name: 'Direto', anim: 'cross', dur: 0.36, active: [0.12, 0.22], damage: 38, range: 1.7, arc: 90, knockback: 2, lunge: 1.2, sound: 'swing', hitSound: 'punch', hand: 'R' },
      { name: 'Chute circular', anim: 'kick_round', dur: 0.48, active: [0.18, 0.3], damage: 44, range: 1.9, arc: 140, knockback: 2.5, lunge: 1.0, sound: 'swing', hitSound: 'kick' },
      { name: 'Chute giratório', anim: 'spin_kick', dur: 0.6, active: [0.22, 0.38], damage: 60, range: 2.0, arc: 180, lunge: 1.4, finisher: 'launch', sound: 'swing', hitSound: 'heavyPunch' },
    ],
    // frente + ○: golpe de avanço
    up: { name: 'Chute ascendente', anim: 'kick_front', dur: 0.46, active: [0.16, 0.28], damage: 38, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'kick' },
    down: { name: 'Coronhada', anim: 'heavy_punch', dur: 0.52, active: [0.2, 0.32], damage: 46, range: 1.9, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4 },
    forward: { name: 'Investida', anim: 'dash_punch', dur: 0.5, active: [0.18, 0.3], damage: 40, range: 1.8, arc: 90, knockback: 3.5, motion: [{ t: [0, 0.3], fwd: 3.4, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    // trás + ○: recua e chuta baixo (reposicionamento)
    back: { name: 'Rasteira de recuo', anim: 'kick_low', dur: 0.46, active: [0.24, 0.34], damage: 34, range: 2.4, arc: 120, knockback: 2.5, iframes: [0, 0.14], motion: [{ t: [0, 0.18], back: 1.2 }], finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    // lado + ○: chute com passo lateral
    side: { name: 'Chute lateral', anim: 'side_kick', dur: 0.45, active: [0.18, 0.3], damage: 38, range: 1.9, arc: 120, knockback: 2.4, motion: [{ t: [0, 0.25], side: 2.4 }], sound: 'swing', hitSound: 'kick' },
    // pulo + ○: voadora
    air: { name: 'Voadora', anim: 'air_kick', dur: 0.45, active: [0.15, 0.35], damage: 40, range: 1.9, arc: 110, knockback: 4, slam: 13, vertical: 2.2, sound: 'swing', hitSound: 'kick' },
  },

  ranged: {
    name: 'M4',
    type: 'projectile',
    anim: 'shoot_rifle',
    showProp: 'm4Hand',
    hideProp: 'm4Back',
    windup: 0.2,
    recovery: 0.25,
    count: 4, // rajada de 4 tiros
    interval: 0.08,
    damage: 16, // por tiro (rajada = 64)
    range: 38,
    speed: 90,
    radius: 0.25,
    spread: 0.025,
    knockback: 0.8,
    hitstun: 0.18,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'bullet',
    color: 0xffe08a,
    sound: 'm4',
    hitSound: 'impact',
    // direção + □: muda a forma de usar a arma (mesmo cooldown, dano parecido)
    variants: {
      forward: { label: 'DISPARO CONCENTRADO', count: 1, damage: 46, windup: 0.32, speed: 150, range: 46, spread: 0, knockback: 3, hitstun: 0.35, impactScale: 1.4, cooldown: 2.8 },
      back: { label: 'DISPARO DE EMERGÊNCIA', count: 3, interval: 0.06, damage: 12, windup: 0.05, recovery: 0.2, spread: 0.07, range: 26, motion: [{ t: [0, 0.25], back: 3.2 }], cooldown: 2.4 },
      side: { label: 'RAJADA EM MOVIMENTO', count: 4, interval: 0.1, damage: 14, windup: 0.12, spread: 0.04, motion: [{ t: [0, 0.55], side: 3.6 }], cooldown: 2.6 },
    },
  },

  abilities: [
    {
      id: 'baforada',
      name: 'Baforada Cinerária',
      input: 'mod+ranged', // R1 + □ / RB + X
      type: 'mistCloud',
      description: 'Sopra uma nuvem de névoa à frente: engole projéteis inimigos, deixa o inimigo lento e sem regenerar energia dentro dela.',
      energyCost: 20,
      cooldown: 12,
      distance: 3.5,
      radius: 3.2,
      duration: 5,
      enemySlow: 0.3,
      enemyRegen: 0,
      eatsProjectiles: true,
      smokeIntensity: 1,
      color: 0x8a4ae0,
    },
    {
      id: 'acacia',
      name: 'Acácia',
      input: 'mod+physical', // R1 + ○ / RB + B
      type: 'flowerRain',
      description: 'Dissipar Espíritos "Acácia": uma chuva de pequenas flores roxas cai sobre o alvo e machuca enquanto ele ficar na área.',
      energyCost: 25,
      cooldown: 13,
      range: 18,
      radius: 2.4,
      castTime: 0.45,
      hits: 5,
      interval: 0.22,
      damage: 70, // total, dividido entre os acertos
      color: 0xb36bff,
    },
  ],

  special: {
    name: 'Cinerária',
    banner: 'Cinerária!',
    type: 'mistField',
    energyCost: 50,
    cooldown: 22,
    duration: 10, // segundos
    damageBonus: 1.25, // bônus ofensivo (era ×1,5 sem outros efeitos)
    affects: ['melee', 'ranged', 'ability'],
    evasion: { iframesMult: 1.6, cooldownMult: 0.5 }, // esquiva melhor
    area: 5, // raio da área paranormal ao redor dele (cânone: Névoa do Outro Lado em 5 m)
    enemySlow: 0.2, // inimigo dentro da névoa fica 20% mais lento
    enemyRegen: 0, // e não regenera energia
    projectileSlow: 0.5, // projéteis inimigos perdem metade da velocidade na névoa
    smokeIntensity: 1,
    opacity: 0.55, // leitura visual difícil
    color: 0xa46bff,
  },

  passives: [
    { type: 'resistant', mult: 0.9, kinds: ['melee'] }, // Resistente: armadura natural contra dano físico (cânone)
  ],
};
