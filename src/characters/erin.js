// ERIN PARKER (id: erin) — Ordo Realitas, Equipe Brasa / Força D (Desconjuração).
// Engenheira "com uma estranha admiração por explosões": adagas de perto, escopeta calibre 12 e
// granadas feitas por ela (Supernova, Nebulosa, Sakura). Rituais: Bênção Maldita (Energia) e
// Envelhecimento Localizado "Black Hole" (cura). Amuleto Elétrico: quem a acerta leva choque.
export default {
  id: 'erin',
  name: 'ERIN PARKER',
  model: 'erin',
  color: '#ff7a2a',
  origin: 'Ordo Realitas',
  element: 'energia', // Bênção Maldita, Amuleto Elétrico e o Caos que ela abraçou no fim
  energyColor: 0xff7a2a,
  info: {
    weapon: 'Adagas, escopeta calibre 12 e granadas',
    style: 'Cortes rápidos com duas adagas, tiro de perto e explosões em área',
    identity: 'Controle de espaço com granadas + punição de perto com a escopeta',
    tagline: 'Kaboom!',
  },
  stats: { moveSpeed: 8.4, attackSpeed: 1.12 },
  anims: { idle: 'idle_dual', run: 'run', charge: 'charge_dual', victory: 'vic_erin', block: 'block_weapon' },
  chargeFx: { style: 'default', color: 0xff7a2a },
  dodge: { style: 'default', distance: 4.8 },

  melee: {
    name: 'Adagas',
    strikes: [
      { name: 'Corte direito', anim: 'dual_r', dur: 0.26, active: [0.08, 0.15], damage: 20, range: 1.6, arc: 110, knockback: 0.9, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.1, tilt: 0.1 } },
      { name: 'Corte esquerdo', anim: 'dual_l', dur: 0.26, active: [0.08, 0.15], damage: 20, range: 1.6, arc: 110, knockback: 0.9, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.1, tilt: -0.1, flip: true } },
      { name: 'Cortes alternados', anim: 'dual_alt', dur: 0.3, active: [0.09, 0.18], damage: 26, range: 1.6, arc: 120, knockback: 1.2, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 0.6 } },
      { name: 'Corte em X', anim: 'dual_cross', dur: 0.32, active: [0.1, 0.2], damage: 30, range: 1.7, arc: 100, knockback: 1.4, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 0.9 } },
      { name: 'Estocada dupla', anim: 'dual_both', dur: 0.46, active: [0.16, 0.27], damage: 52, range: 1.9, arc: 80, lunge: 2.0, finisher: 'launch', sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.3, big: true } },
    ],
    up: { name: 'Adaga ascendente', anim: 'slash_up', dur: 0.4, active: [0.12, 0.24], damage: 34, range: 1.7, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: 0xff7a2a, tilt: -1.2 } },
    down: { name: 'Adagas para baixo', anim: 'knife_final', dur: 0.44, active: [0.15, 0.26], damage: 42, range: 1.8, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactScale: 1.4, trail: { color: 0xff7a2a, roll: 1.4 } },
    forward: { name: 'Avanço cortante', anim: 'dash_slash', dur: 0.4, active: [0.12, 0.22], damage: 32, range: 1.8, arc: 120, knockback: 2.2, motion: [{ t: [0, 0.2], fwd: 4.2, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.3, tilt: 0.1 } },
    back: { name: 'Recuo com corte', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 36, range: 1.7, arc: 100, knockback: 2.2, iframes: [0, 0.2], motion: [{ t: [0, 0.15], back: 2.4 }, { t: [0.18, 0.32], fwd: 2.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, tilt: -0.2 } },
    side: { name: 'Giro das adagas', anim: 'dual_spin', dur: 0.48, active: [0.12, 0.36], damage: 30, range: 1.8, arc: 360, knockback: 1.6, motion: [{ t: [0, 0.25], side: 2.2 }], sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.3, wide: true } },
    air: { name: 'Adagas aéreas', anim: 'air_dual', dur: 0.4, active: [0.12, 0.3], damage: 34, range: 1.7, arc: 110, knockback: 3, slam: 15, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { radius: 1.2, roll: 1.2 } },
  },

  // □: Escopeta calibre 12 (5 cartuchos): leque de chumbo, forte de perto, fraca de longe
  ranged: {
    name: 'Escopeta calibre 12',
    type: 'projectile',
    anim: 'shoot_rifle',
    showProp: 'shotgun',
    hideProp: 'daggerR',
    windup: 0.22,
    recovery: 0.4,
    count: 6,
    interval: 0,
    damage: 11,
    range: 11,
    speed: 55,
    radius: 0.3,
    spread: 0.38,
    knockback: 2.4,
    hitstun: 0.32,
    cooldown: 1.9,
    energyCost: 0,
    visual: 'pellet',
    color: 0xffd27a,
    sound: 'shotgun',
    hitSound: 'impact',
  },

  abilities: [
    {
      id: 'supernova',
      name: 'Granada "Supernova"',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'throwProjectile',
      description: 'A granada com o coração vermelho: arremessa em arco e explode em área, jogando o alvo para cima. Pega quem está defendendo de lado ou parado.',
      energyCost: 25,
      cooldown: 7,
      anim: 'throw_r',
      windup: 0.3,
      recovery: 0.3,
      showProp: 'grenade',
      hideProp: 'daggerR',
      startSound: 'grenadePin',
      projectile: {
        visual: 'grenade', color: 0xff3050, speed: 16, range: 16, radius: 0.4, gravity: 18, damage: 0, lobTo: 'feet', trail: 0x6a6460,
        explode: { radius: 2.6, damage: 70, knockback: 5, launch: true, color: 0xff5030 },
      },
    },
    {
      id: 'nebulosa',
      name: 'Granada "Nebulosa"',
      input: 'block+jump', // R2 + × / RT + A
      type: 'throwProjectile',
      description: 'A granada do emoji (a que ela deu ao Kaiser): explode numa nuvem que deixa o inimigo lento, corta a recuperação dele e engole os tiros que entram nela.',
      energyCost: 20,
      cooldown: 14,
      anim: 'throw_r',
      windup: 0.3,
      recovery: 0.3,
      showProp: 'grenade',
      hideProp: 'daggerR',
      startSound: 'grenadePin',
      projectile: {
        visual: 'grenade', color: 0x7ad0ff, speed: 15, range: 15, radius: 0.4, gravity: 18, damage: 0, lobTo: 'feet', trail: 0x6a6460,
        explode: { radius: 2.2, damage: 25, knockback: 1, color: 0x9ac8ff, mist: { radius: 3.4, duration: 5, slow: 0.35, enemyRegen: 0.5, eatsProjectiles: true, color: 0x6a8aa8 } },
      },
    },
    {
      id: 'bencaoMaldita',
      name: 'Bênção Maldita',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'blessing',
      description: 'Ritual de Energia: a mão brilha em ciano e ela vê um pedaço do futuro — recupera todas as esquivas e bate mais forte por alguns segundos.',
      energyCost: 30,
      cooldown: 22,
      duration: 8,
      damageMult: 1.2,
      dodges: 4,
      color: 0x5ae8ff,
    },
    {
      id: 'blackHole',
      name: 'Envelhecimento Localizado "Black Hole"',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'healOverTime',
      description: 'Segura cinzas, diz "Black Hole" e assopra: as cinzas ficam pretas e envelhecem as feridas até cicatrizarem em espiral — mais forte e mais rápido que o ritual do Dante.',
      energyCost: 30,
      cooldown: 26,
      heal: 80,
      duration: 1.8,
      style: 'ash',
      color: 0x141018,
    },
    {
      id: 'granadaLuz',
      name: 'Granada de Luz',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'throwProjectile',
      description: 'Uma granada de clarão: explode numa luz branca que deixa o inimigo atordoado por um instante.',
      energyCost: 20,
      cooldown: 16,
      anim: 'throw_r',
      windup: 0.3,
      recovery: 0.3,
      startSound: 'grenadePin',
      projectile: {
        visual: 'grenade', color: 0xf4f0e0, speed: 16, range: 15, radius: 0.4, gravity: 18, damage: 0, lobTo: 'feet', trail: 0xfff6d0,
        explode: { radius: 2.6, damage: 25, knockback: 0.5, color: 0xfff6d0, stun: 1.1 },
      },
    },
  ],

  // Especial SUPERNOVA (cinemático): corre com a escopeta, atira à queima-roupa, o inimigo voa longe,
  // ela segura a granada do coração vermelho e arremessa — explosão com SUPERNOVA na tela e ela sorrindo
  special: {
    name: 'Supernova',
    banner: 'SUPERNOVA',
    type: 'supernova',
    shotShare: 0.35, // tiro 35% · explosão 65%
    knockDistance: 5.5,
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → COMBAT.specialDamage (250)
    range: 18,
    color: 0xff7a2a,
  },

  // DESPERTAR (Barra de Transformação cheia + vida baixa, segurando △) — cânone: Bênção Maldita — a energia do Outro Lado cura e empurra o corpo além do limite. Até o fim do round.
  awakening: {
    name: 'Bênção Maldita',
    banner: 'Bênção Maldita',
    type: 'awakenMode',
    mult: 1.1, regen: 6, energyRegenMult: 1.4, aura: 'flame', color: 0x7ad8ff, heal: 0.12,
  },

  passives: [
    { type: 'electricAmulet', damage: 4, color: 0x5ae8ff }, // Amuleto Elétrico: choque em quem bate nela
  ],
};
