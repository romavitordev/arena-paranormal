// GAL SAL (id interno: injustica; personagem masculino) — lâminas + correntes de metal + puxão +
// cura invertida que drena sanidade + controle de espaço.
// Mecânica obrigatória no ataque físico:
//   o golpe tira X de vida do inimigo → o INIMIGO recupera Y de vida (Y < X)
//   → e perde Y × 1,5 de sanidade (energia). O Gal não se cura.
// X = dano do golpe (por acerto), Y = `heal` (por acerto). Totalmente determinístico.
export default {
  id: 'injustica',
  name: 'GAL SAL',
  model: 'injustica',
  color: '#d4a64a',
  origin: 'Escriptas', // organização (cânone)
  element: 'conhecimento', // afinidade elemental (ver config/elements.js)
  energyColor: 0xd4a64a,
  info: {
    weapon: 'Duas lâminas com correntes',
    style: 'Cortes, giros, lâminas lançadas e puxadas pelas correntes',
    identity: 'Lâminas + correntes + puxão + cura que drena a sanidade + controle de espaço',
    tagline: 'Toda ferida cobra um preço.',
  },
  stats: { moveSpeed: 7.8 },
  anims: { idle: 'idle_dual', run: 'run', charge: 'charge_dual', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'blades', color: 0xd4a64a },
  dodge: { style: 'default' },
  // Bloqueio Perfeito: segurar a defesa no instante do golpe físico inimigo
  defense: { perfectBlock: { window: 0.15, counterStun: 0.7 } },

  melee: {
    name: 'Lâminas e correntes',
    strikes: [
      { name: 'Corte curto', anim: 'dual_r', dur: 0.3, active: [0.08, 0.17], damage: 34, heal: 9, range: 2.0, arc: 120, knockback: 1.2, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.1 } },
      { name: 'Corte alternado', anim: 'dual_l', dur: 0.3, active: [0.08, 0.17], damage: 34, heal: 9, range: 2.0, arc: 120, knockback: 1.2, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: -0.1, flip: true } },
      { name: 'Corte cruzado', anim: 'dual_cross', dur: 0.42, active: [0.14, 0.24], damage: 44, heal: 12, range: 2.1, arc: 100, knockback: 2.0, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { cross: true } },
      // dois acertos: X e Y valem por acerto (24 de dano e 6 de vida cada)
      { name: 'Ataque giratório', anim: 'dual_spin', dur: 0.55, actives: [[0.12, 0.24], [0.3, 0.44]], damage: 48, heal: 6, range: 2.2, arc: 360, knockback: 1.6, lunge: 0.8, sound: 'blade', hitSound: 'bladeHit', trail: { spin: true } },
      { name: 'Duas correntes', anim: 'chain_sweep', dur: 0.6, active: [0.24, 0.38], damage: 56, heal: 15, range: 3.6, arc: 160, lunge: 0.6, finisher: 'launch', chain: true, sound: 'slashFinal', hitSound: 'bladeHit', trail: { big: true, wide: true, radius: 3.2 } },
    ],
    // frente + ○: lança uma lâmina presa à corrente (alcance médio)
    up: { name: 'Lâminas para cima', anim: 'dual_both', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.1, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', heal: 12, hand: 'R' },
    down: { name: 'Cruz das lâminas', anim: 'dual_cross', dur: 0.52, active: [0.2, 0.32], damage: 46, range: 2.1, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactScale: 1.4, heal: 14 },
    forward: { name: 'Lançamento de lâmina', anim: 'chain_throw', dur: 0.46, active: [0.16, 0.3], damage: 32, heal: 9, range: 4.6, arc: 40, knockback: 2.4, chain: true, sound: 'chainThrow', hitSound: 'bladeHit' },
    // trás + ○: puxa a lâmina de volta trazendo o inimigo junto
    back: { name: 'Puxão da lâmina', anim: 'chain_pull', dur: 0.46, active: [0.08, 0.22], damage: 26, heal: 8, range: 4.6, arc: 40, knockback: 0, chain: true, onHit: { pull: true, after: 0.55 }, sound: 'chainPull', hitSound: 'bladeHit' },
    side: { name: 'Corte lateral alternado', anim: 'dual_alt', dur: 0.36, active: [0.1, 0.2], damage: 30, heal: 9, range: 2.0, arc: 120, knockback: 1.6, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'blade', hitSound: 'bladeHit', trail: { roll: 1.0 } },
    air: { name: 'Cruz aérea', anim: 'air_dual', dur: 0.4, active: [0.14, 0.3], damage: 36, heal: 10, range: 2.1, arc: 110, knockback: 3, slam: 15, vertical: 2.3, sound: 'blade', hitSound: 'bladeHit', trail: { cross: true } },
  },

  // □: CORRENTE (substitui o "Corte Projetado"): LANÇAR → PRENDER → PUXAR → COMBAR
  ranged: {
    // CORRENTE DE CAPTURA: procura o inimigo, prende, puxa para a distância de combo e abre a sequência
    // física. Dá para esquivar (L2) — e a curva é lenta, então desviar para o lado também funciona.
    name: 'Corrente de Captura',
    type: 'projectile',
    homing: 2.4, // rad/s de correção na direção do alvo
    anim: 'chain_throw',
    origin: 'hand',
    chain: true,
    windup: 0.16,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 25, // baixo: o valor está no combo que ela abre
    range: 15,
    speed: 38,
    radius: 0.45,
    spread: 0,
    knockback: 0,
    hitstun: 0.1,
    onHit: { pull: { distance: 1.4, time: 0.3, after: 0.7 } }, // prende e puxa para perto; janela de combo
    cooldown: 5,
    energyCost: 15,
    visual: 'chainHook',
    color: 0xd4a64a,
    sound: 'chainThrow',
    hitSound: 'chainPull',
  },

  abilities: [
    {
      id: 'gancho',
      name: 'Corrente Gancho',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'chainSelfPull',
      description: 'Prende a corrente no adversário e puxa o PRÓPRIO Gal até o adversário, chegando com um corte cruzado.',
      energyCost: 20,
      cooldown: 8,
      range: 14,
      chainSpeed: 45,
      flySpeed: 26,
      damage: 28,
      hitstun: 0.5,
      color: 0xd4a64a,
    },
    {
      id: 'teletransporteGal',
      name: 'Teletransporte',
      input: 'block+jump', // R2 + × / RT + A
      type: 'sparkTeleport',
      description: 'Some em faíscas douradas e surge atrás do adversário, como fez com Arthur e Erin no orfanato.',
      energyCost: 22,
      cooldown: 9,
      distance: 1.6,
      vanishTime: 0.2,
      surpriseTime: 0.35,
      color: 0xffcf4a,
    },
    {
      id: 'controleMental',
      name: 'Controle Mental',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'mindControl',
      description: 'Um sigilo dourado sobre a cabeça do alvo: por alguns segundos o corpo dele obedece ao contrário (direções invertidas).',
      energyCost: 35,
      cooldown: 24,
      windup: 0.45,
      recovery: 0.3,
      range: 10,
      arc: 60,
      duration: 2.5,
      color: 0xffcf4a,
    },
    {
      id: 'correnteGiratoria',
      name: 'Corrente Giratória',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'sweepStrike',
      description: 'Gira as duas lâminas presas às correntes em volta do corpo: três cortes em área, o último lança.',
      energyCost: 25,
      cooldown: 13,
      anim: 'chain_sweep',
      startSound: 'chainThrow',
      windup: 0.2,
      hits: 3,
      interval: 0.16,
      recovery: 0.3,
      radius: 3.4,
      damage: 75,
      knockback: 6,
      launch: true,
      element: 'conhecimento',
      color: 0xd4a64a,
    },
  ],

  special: {
    name: 'Injustiça',
    banner: 'Injustiça né?',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: 0xd4a64a,
    sound: 'specialStart',
    // O especial NÃO aplica o dreno X/Y. Para ativar no futuro: applyMeleePassives: true
    applyMeleePassives: false,
    approach: 'chain', // 1–3: lança a lâmina, prende e puxa
    chain: { speed: 55, range: 16 },
    prepare: { anim: 'charge_dual', time: 0.3, fx: 'bladeGlow' },
    hits: [
      { t: 0.75, anim: 'dual_r', dur: 0.3, share: 0.12, fx: { kind: 'slash', tilt: 0.15, chain: 'R' }, sound: 'bladeHit', shot: 0 },
      { t: 1.0, anim: 'dual_l', dur: 0.3, share: 0.12, fx: { kind: 'slash', tilt: -0.15, flip: true, chain: 'L' }, sound: 'bladeHit' },
      { t: 1.27, anim: 'dual_spin', dur: 0.5, share: 0.16, fx: { kind: 'slash', wide: true }, sound: 'bladeHit', shot: 1 },
      { t: 1.75, anim: 'chain_sweep', dur: 0.5, share: 0.2, fx: { kind: 'slash', big: true, chain: 'both' }, sound: 'bladeHit', shot: 2 },
      { t: 2.35, anim: 'dual_cross', dur: 0.42, share: 0.4, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.05,
    length: 3.2,
    shots: 'flurry',
  },

  passives: [
    { type: 'bulletDodge' }, // Desviar de Balas: esquivar de projéteis não gasta carga
    { type: 'meleeDrain', energyRatio: 1.5, giveEnergyToAttacker: false },
  ],
};
