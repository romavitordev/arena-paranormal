// LABIRINTO (id: labirinto) — Mascarados (Hexatombe). O ocultista e assassino obcecado por labirintos que
// reuniu os Assassinos; em Hexatombe, o corpo do agente Remi. Luta com "A Antena" (parabólica presa num cabo
// de ferro, usada como lança e para disparar rituais). Rituais (cânone): Rajada Caótica, Labirinto Mental, Mapa
// Sanguíneo e Capturar Momento. O CAPACETE DO ??? só aparece na Transformação (forms/labirinto_elmo.js) e troca tudo:
// Tempestade Caótica, Labirinto Abissal, Consumir Momento e Revelação Sanguínea.
export default {
  id: 'labirinto',
  name: 'LABIRINTO',
  model: 'labirinto',
  color: '#8aa05a',
  origin: 'Mascarados',
  element: 'energia', // Rajada/Tempestade Caótica; todos os rituais dele têm o mesmo padrão de labirinto
  energyColor: 0x9a6aff,
  info: {
    weapon: 'A Antena (lança com parabólica)',
    style: 'Alcance longo com a Antena, rituais à distância e armadilhas de área',
    identity: 'Controla o espaço com rituais à distância — e vira o ??? quando põe o capacete',
    tagline: 'O que espera no final do labirinto... é você.',
  },
  stats: { moveSpeed: 7.7, attackSpeed: 1.08 },
  anims: { idle: 'idle_katana', run: 'run', charge: 'charge', victory: 'vic_labirinto', block: 'block_weapon' },
  chargeFx: { style: 'default', color: 0x9a6aff },
  dodge: { style: 'default', distance: 4.4 },

  melee: {
    name: 'A Antena',
    strikes: [
      { name: 'Estocada', anim: 'thrust', dur: 0.3, active: [0.09, 0.18], damage: 30, range: 2.5, arc: 50, knockback: 1.0, lunge: 1.1, sound: 'swing', hitSound: 'bladeHit', trail: { color: 0x9a6aff, radius: 2.0 } },
      { name: 'Varrida', anim: 'slash_h', dur: 0.32, active: [0.1, 0.19], damage: 32, range: 2.5, arc: 140, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'impact', trail: { color: 0x9a6aff, radius: 2.1, tilt: 0.05 } },
      { name: 'Varrida de volta', anim: 'slash_h_back', dur: 0.32, active: [0.1, 0.19], damage: 32, range: 2.5, arc: 140, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'impact', trail: { color: 0x9a6aff, radius: 2.1, flip: true } },
      { name: 'Golpe da parabólica', anim: 'slash_d', dur: 0.4, active: [0.14, 0.24], damage: 40, range: 2.4, arc: 100, knockback: 1.6, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0x9a6aff, roll: 0.9 } },
      { name: 'Giro da Antena', anim: 'chain_sweep', dur: 0.6, active: [0.24, 0.38], damage: 58, range: 3.0, arc: 220, lunge: 0.6, finisher: 'launch', sound: 'slashFinal', hitSound: 'heavyPunch', trail: { color: 0x9a6aff, big: true, wide: true, radius: 2.8 } },
    ],
    up: { name: 'Antena para cima', anim: 'slash_up', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.4, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'impact', trail: { color: 0x9a6aff, tilt: -1.3 } },
    down: { name: 'Antena no chão', anim: 'slash_v', dur: 0.52, active: [0.2, 0.32], damage: 46, range: 2.4, arc: 100, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4, trail: { color: 0x9a6aff, roll: 1.5, big: true } },
    forward: { name: 'Investida da lança', anim: 'dash_slash', dur: 0.42, active: [0.14, 0.26], damage: 34, range: 2.6, arc: 60, knockback: 2.2, motion: [{ t: [0, 0.24], fwd: 4.4, stopClose: true }], sound: 'swing', hitSound: 'bladeHit', trail: { color: 0x9a6aff, radius: 2.0 } },
    back: { name: 'Recua e estoca', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 34, range: 2.4, arc: 70, knockback: 2.0, iframes: [0, 0.2], motion: [{ t: [0, 0.15], back: 2.4 }, { t: [0.18, 0.32], fwd: 1.6, stopClose: true }], sound: 'swing', hitSound: 'bladeHit', trail: { color: 0x9a6aff, radius: 2.0 } },
    side: { name: 'Varrida lateral', anim: 'slash_h', dur: 0.38, active: [0.11, 0.22], damage: 30, range: 2.5, arc: 160, knockback: 1.6, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'swing', hitSound: 'impact', trail: { color: 0x9a6aff, radius: 2.1, tilt: 0.2 } },
    air: { name: 'Antena do alto', anim: 'air_slash', dur: 0.42, active: [0.14, 0.3], damage: 36, range: 2.4, arc: 110, knockback: 3, slam: 15, vertical: 2.3, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0x9a6aff, roll: 1.3 } },
  },

  // □: Rajada Caótica — a Antena guarda o ritual e dispara um raio de Energia
  ranged: {
    name: 'Rajada Caótica',
    type: 'projectile',
    anim: 'point',
    origin: 'chest',
    windup: 0.34,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 56,
    range: 20,
    speed: 30,
    radius: 0.45,
    spread: 0,
    knockback: 3,
    hitstun: 0.45,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'chaos',
    color: 0x9a6aff,
    sound: 'shockwave',
    hitSound: 'impact',
    impactScale: 1.4,
  },

  abilities: [
    {
      id: 'labirintoMental',
      name: 'Labirinto Mental',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'mentalMaze',
      description: 'Prende a mente do alvo num labirinto: por alguns segundos ele anda numa direção que muda sozinha. Com o capacete vira Labirinto Abissal.',
      energyCost: 30,
      cooldown: 18,
      windup: 0.45,
      recovery: 0.3,
      range: 11,
      arc: 60,
      duration: 2.5,
      helmetMult: 1.6,
      color: 0x9a6aff,
    },
    {
      id: 'mapaSanguineo',
      name: 'Mapa Sanguíneo',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'predatorScent',
      description: 'Desenha um mapa com gotas de sangue que mostra onde a vítima está: por alguns segundos ele a rastreia, anda mais rápido e os ataques contra ela ficam mais fortes. Com o capacete vira Revelação Sanguínea.',
      energyCost: 20,
      cooldown: 20,
      duration: 7,
      damageMult: 1.12,
      speedMult: 1.06,
      color: 0xb0101c,
    },
    {
      id: 'capturarMomento',
      name: 'Capturar Momento',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'blessing',
      description: 'Marca o lugar com um símbolo que capta imagens e sons: ele vê o que vem — recupera 2 esquivas e fica mais atento por alguns segundos.',
      energyCost: 25,
      cooldown: 22,
      duration: 6,
      damageMult: 1.05,
      dodges: 2,
      color: 0x9a6aff,
    },
  ],

  special: {
    name: 'O Labirinto é a Resposta',
    banner: 'O labirinto é a resposta.',
    type: 'abyssMaze',
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → COMBAT.specialDamage (250)
    range: 20,
    color: 0x9a6aff,
  },

  // TRANSFORMAÇÃO (Barra de Transformação cheia + vida baixa, segurando △): para os Mascarados a máscara é a Intenção
  // de Assassino despertando — o Labirinto põe o CAPACETE DO ??? (o elmo do sorriso) e os rituais viram as versões do
  // capacete (cânone): Tempestade Caótica, Labirinto Abissal, Consumir Momento e Revelação Sanguínea. Até o fim do round.
  awakening: {
    name: 'Capacete do ???',
    banner: 'Capacete do ???',
    type: 'maskTransform',
    form: 'labirinto_elmo',
    formBanner: '???',
    prop: 'helmetOn',
    duration: 0, // até o fim do round
    bonusHealth: 80,
    color: 0xd8c8a8,
  },

  passives: [
    { type: 'mentalMaze', stunMult: 0.6 }, // Mente Labiríntica: a mente se protege — atordoamentos duram 40% menos
  ],
};
