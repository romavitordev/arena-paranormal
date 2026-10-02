// KAISER (id interno: cineraria) — controle de espaço + arma de fogo + névoa.
// M4 (com variações por direção), socos e chutes, Baforada Cinerária e o
// especial Cinerária (névoa paranormal + tempestade de Acácia).
export default {
  id: 'cineraria',
  name: 'KAISER',
  model: 'cineraria',
  color: '#a46bff',
  origin: 'Ordo Realitas', // organização (cânone)
  element: 'energia', // afinidade elemental (ver config/elements.js)
  energyColor: 0xa46bff,
  info: {
    weapon: 'M4, Desert Eagle e karambit vermelha',
    style: 'Combo ágil com karambit, M4, balas amaldiçoadas e rituais de Energia (Cinerária, Acácia, Dendrobium)',
    identity: 'Controle de espaço + arma de fogo + névoa',
    tagline: 'Queimada, séria e perigosa.',
  },
  stats: { moveSpeed: 7.5 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge', victory: 'victory', block: 'block' },
  chargeFx: { style: 'smoke', color: 0xa46bff },
  dodge: { style: 'default' },

  melee: {
    name: 'Socos, chutes e karambit',
    // ○ neutro: sequência
    // sequência ágil: socos, chutes e cortes da karambit vermelha (mão esquerda); empurra pouco e emenda
    strikes: [
      { name: 'Jab', anim: 'jab', dur: 0.26, active: [0.07, 0.14], damage: 26, range: 1.7, arc: 100, knockback: 0.8, lunge: 1.3, sound: 'swing', hitSound: 'punch', hand: 'L' },
      { name: 'Direto', anim: 'cross', dur: 0.28, active: [0.08, 0.16], damage: 28, range: 1.7, arc: 100, knockback: 0.9, lunge: 1.2, sound: 'swing', hitSound: 'punch', hand: 'R' },
      { name: 'Corte de karambit', anim: 'dual_l', dur: 0.28, active: [0.08, 0.16], damage: 32, range: 1.7, arc: 120, knockback: 0.9, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828, radius: 1.1, tilt: -0.1, flip: true } },
      { name: 'Chute circular', anim: 'kick_round', dur: 0.38, active: [0.13, 0.24], damage: 36, range: 1.9, arc: 140, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'kick' },
      { name: 'Corte cruzado', anim: 'dual_alt', dur: 0.32, active: [0.09, 0.18], damage: 30, range: 1.8, arc: 130, knockback: 1.0, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828, radius: 1.2, roll: 0.6 } },
      { name: 'Chute giratório', anim: 'spin_kick', dur: 0.52, active: [0.2, 0.34], damage: 60, range: 2.0, arc: 180, lunge: 1.4, finisher: 'launch', sound: 'swing', hitSound: 'heavyPunch' },
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
      id: 'dendrobium',
      name: 'Sentir Através "Dendrobium"',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'rootTrap',
      description: 'Raízes roxas e uma flor brotam do chão sob o alvo e o prendem por um instante.',
      energyCost: 25,
      cooldown: 14,
      range: 16,
      radius: 1.3,
      delay: 0.5,
      hold: 1.1,
      damage: 45,
      color: 0xa46bff,
    },
    {
      id: 'balasAmaldicoadas',
      name: 'Balas Amaldiçoadas',
      input: 'block+jump', // R2 + × / RT + A
      type: 'cursedShots',
      description: 'Saca a Desert Eagle e dispara três balas amaldiçoadas com Energia, que procuram o alvo.',
      energyCost: 25,
      cooldown: 11,
      windup: 0.2,
      interval: 0.16,
      count: 3,
      projectile: { visual: 'cursedSniper', color: 0xa46bff, speed: 60, range: 30, radius: 0.35, damage: 30, knockback: 1.5, hitstun: 0.3, homing: 1.4, cursed: true, kind: 'ability', element: 'energia', hitSound: 'impact' },
    },
    {
      id: 'nebulosa',
      name: 'Granada "Nebulosa"',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'throwProjectile',
      description: 'A granada que a Erin fez para ele: explode numa nuvem que deixa o inimigo lento e engole os tiros.',
      energyCost: 20,
      cooldown: 16,
      anim: 'throw_r',
      windup: 0.3,
      recovery: 0.3,
      startSound: 'grenadePin',
      projectile: {
        visual: 'grenade', color: 0x7ad0ff, speed: 15, range: 15, radius: 0.4, gravity: 18, damage: 0, lobTo: 'feet', trail: 0x6a6460,
        explode: { radius: 2.2, damage: 30, knockback: 1, color: 0x9ac8ff, mist: { radius: 3.4, duration: 5, slow: 0.35, enemyRegen: 0.5, eatsProjectiles: true, color: 0x8a6ab0 } },
      },
    },
    {
      id: 'baforada',
      name: 'Baforada Cinerária',
      input: 'carga+ranged', // △ + □ / Y + X
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
      input: 'carga+physical', // △ + ○ / Y + B
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
    // dentro da névoa ele amplifica a Acácia sobre o inimigo: o especial causa os 250 de dano
    flowerStorm: { shares: [0.12, 0.12, 0.12, 0.14, 0.15, 0.35], interval: 0.2 },
  },

  passives: [
    { type: 'resistant', mult: 0.9, kinds: ['melee'] }, // Resistente: armadura natural contra dano físico (cânone)
    { type: 'elementalAffinity', mult: 1.15 }, // Afinidade Elemental: conectado à Energia, rituais 15% mais fortes
  ],
};
