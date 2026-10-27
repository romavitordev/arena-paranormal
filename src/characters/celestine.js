// CELESTINE (id: celestine) — PORTADORA de Conhecimento e guerreira da ORDO CALAMITAS (wiki "Celestine"; Calamidade).
// 67 d.C.: pele clara, cabelo loiro curto, a armadura com panos por cima, o cachecol e o Símbolo da Ordo Calamitas no
// peito; olhos e aura azul-claros nas memórias. Arma: DUAS MACHADINHAS com talhos azuis LIGADAS POR UMA CORRENTE.
// Energética, debochada e grossa — e fria na hora de trair. Habilidades da ficha: NADA PESSOAL (ganha com a traição) e
// CÓDIGO (sussurra mensagens que só o aliado entende); viciada em endorfina.
// Transformação canônica (Calamidade ep. 6): veste a MÁSCARA DO DESESPERO e vira A MAGISTRADA — os mesmos poderes da
// Magistrada das Relíquias, com a aparência DELA (forms/celestine_magistrada.js).
// Modelo próprio do Blender (public/models/celestine.glb, tools/blender/char_celestine.py) + machadinhas e Máscara em código.
const BLUE = 0x8ad8ff;
const TEAL = 0x4ab0e0;

export default {
  id: 'celestine',
  name: 'CELESTINE',
  model: 'celestine',
  color: '#8ad8ff',
  origin: 'Portadores', // carrega a Máscara do Desespero (Relíquia de Conhecimento)...
  teams: ['Ordo Calamitas'], // ...e é da Ordo Calamitas
  element: 'conhecimento',
  energyColor: BLUE,
  info: {
    weapon: 'Duas machadinhas ligadas por uma corrente',
    style: 'Cortes duplos rápidos, a machadinha voando na corrente e a traição na hora certa',
    identity: 'Guerreira da Ordo Calamitas que veste a Máscara do Desespero e vira a Magistrada',
    tagline: 'Nada pessoal.',
  },
  stats: { moveSpeed: 8.3, attackSpeed: 1.1 },
  anims: { idle: 'idle_dual', run: 'run', charge: 'charge_dual', victory: 'vic_gal', block: 'block_weapon' },
  chargeFx: { style: 'blades', color: BLUE },
  dodge: { style: 'default' },

  melee: {
    name: 'Machadinhas na Corrente',
    strikes: [
      { name: 'Talho Direito', anim: 'dual_r', dur: 0.28, active: [0.08, 0.16], damage: 30, range: 2.0, arc: 120, knockback: 1.0, lunge: 1.2, sound: 'blade', hitSound: 'axeHit', trail: { color: TEAL, tilt: 0.1 } },
      { name: 'Talho Esquerdo', anim: 'dual_l', dur: 0.28, active: [0.08, 0.16], damage: 30, range: 2.0, arc: 120, knockback: 1.0, lunge: 1.2, sound: 'blade', hitSound: 'axeHit', trail: { color: TEAL, tilt: -0.1, flip: true } },
      { name: 'Cruz das Machadinhas', anim: 'dual_cross', dur: 0.4, active: [0.13, 0.23], damage: 42, range: 2.1, arc: 100, knockback: 1.8, lunge: 1.3, sound: 'blade', hitSound: 'axeHit', trail: { color: TEAL, cross: true } },
      { name: 'Giro Debochado', anim: 'dual_spin', dur: 0.55, actives: [[0.12, 0.24], [0.3, 0.44]], damage: 46, range: 2.2, arc: 360, knockback: 1.6, lunge: 0.8, sound: 'blade', hitSound: 'axeHit', trail: { color: TEAL, spin: true } },
      // as duas machadinhas voam na corrente e varrem a frente
      { name: 'Corrente Aberta', anim: 'chain_sweep', dur: 0.6, active: [0.24, 0.38], damage: 58, range: 3.6, arc: 160, lunge: 0.6, finisher: 'launch', chain: true, element: 'conhecimento', sound: 'slashFinal', hitSound: 'axeHit', trail: { color: BLUE, big: true, wide: true, radius: 3.2 } },
    ],
    up: { name: 'Machadinhas para Cima', anim: 'dual_both', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.1, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'axeHit', hand: 'R' },
    down: { name: 'Machadinhas no Chão', anim: 'dual_cross', dur: 0.52, active: [0.2, 0.32], damage: 46, range: 2.1, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'axeHit', impactScale: 1.4 },
    forward: { name: 'Machadinha Lançada', anim: 'chain_throw', dur: 0.46, active: [0.16, 0.3], damage: 32, range: 4.6, arc: 40, knockback: 2.4, chain: true, sound: 'chainThrow', hitSound: 'axeHit' },
    back: { name: 'Puxão da Corrente', anim: 'chain_pull', dur: 0.46, active: [0.08, 0.22], damage: 26, range: 4.6, arc: 40, knockback: 0, chain: true, onHit: { pull: true, after: 0.55 }, sound: 'chainPull', hitSound: 'axeHit' },
    side: { name: 'Talho de Passagem', anim: 'dual_alt', dur: 0.36, active: [0.1, 0.2], damage: 30, range: 2.0, arc: 120, knockback: 1.6, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'blade', hitSound: 'axeHit', trail: { color: TEAL, roll: 1.0 } },
    air: { name: 'Queda das Machadinhas', anim: 'air_dual', dur: 0.4, active: [0.14, 0.3], damage: 36, range: 2.1, arc: 110, knockback: 3, slam: 15, vertical: 2.3, sound: 'blade', hitSound: 'axeHit', trail: { color: TEAL, cross: true } },
  },

  // □: MACHADINHA NA CORRENTE — a direita voa girando, crava e puxa o alvo para a distância do combo
  ranged: {
    name: 'Machadinha na Corrente',
    type: 'projectile',
    anim: 'chain_throw',
    origin: 'hand',
    hideProp: 'hatchetR', // a machadinha sai da mão e volta no fim
    windup: 0.18,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 28,
    range: 14,
    speed: 32,
    radius: 0.5,
    spread: 0,
    knockback: 0,
    hitstun: 0.4,
    cooldown: 2.6,
    energyCost: 0,
    chain: true,
    rope: true,
    visual: 'hatchet',
    color: BLUE,
    sound: 'knifeThrow',
    hitSound: 'axeHit',
    onHit: { pull: { distance: 1.5, time: 0.3, after: 0.6 } },
  },

  abilities: [
    {
      id: 'correnteGiratoria',
      name: 'Corrente Giratória',
      input: 'carga+physical', // △ + ○
      type: 'sweepStrike',
      description: 'Solta as duas machadinhas na corrente e gira com elas em volta do corpo: dois cortes em área, o último joga longe.',
      energyCost: 20,
      cooldown: 11,
      anim: 'dual_spin',
      startSound: 'blade',
      windup: 0.12,
      hits: 2,
      interval: 0.22,
      recovery: 0.3,
      radius: 3.4,
      damage: 60,
      color: BLUE,
    },
    {
      // CÓDIGO (ficha): sussurra a mensagem secreta — aqui, o que ela leu da guarda do adversário
      id: 'codigo',
      name: 'Código',
      input: 'carga+dodge', // △ + L2
      type: 'analyze',
      buffType: 'codigo',
      label: 'CÓDIGO (CELESTINE)',
      description: 'Sussurra o Código: decifra a guarda do adversário e, por 7 s, ele recebe 25% a mais de dano dos golpes físicos.',
      energyCost: 20,
      cooldown: 16,
      range: 14,
      duration: 7,
      takenMult: 1.25,
      takenKinds: ['melee'],
      color: BLUE,
    },
    {
      id: 'investidaRebelde',
      name: 'Investida Rebelde',
      input: 'block+jump', // R2 + ×
      type: 'dashStrike',
      description: 'Avança rindo e crava as duas machadinhas de uma vez — quebra a defesa.',
      energyCost: 20,
      cooldown: 10,
      anim: 'dual_cross',
      windup: 0.24,
      distance: 6,
      speed: 24,
      recovery: 0.32,
      range: 2.2,
      damage: 55,
      knockback: 3,
      guardBreak: true,
      hitSound: 'axeHit',
      color: BLUE,
    },
    {
      // viciada em endorfina: a dor e a pressa viram combustível
      id: 'endorfina',
      name: 'Endorfina',
      input: 'block+carga', // R2 + △
      type: 'selfBuff',
      buffType: 'endorphin',
      label: 'ENDORFINA',
      anim: 'concentrate',
      animTime: 0.5,
      description: 'A endorfina sobe: por 7 s os golpes físicos saem 15% mais rápidos e 15% mais fortes, e ela recupera uma esquiva.',
      energyCost: 25,
      cooldown: 20,
      duration: 7,
      damageMult: 1.15,
      affects: ['melee'],
      atkSpeed: 1.15,
      refillDodges: 1,
      color: BLUE,
    },
  ],

  // DUELO FINAL: o duelo contra a Amalia — a corrente prende, ela puxa e as machadinhas não param até o último talho
  special: {
    name: 'Duelo Final',
    banner: 'Nada Pessoal',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLUE,
    sound: 'specialStart',
    prepare: { anim: 'charge_dual', time: 0.3, fx: 'bladeGlow' },
    dash: { speed: 26, maxTime: 0.45, contact: 1.8 },
    hits: [
      { t: 0.7, anim: 'dual_r', dur: 0.26, share: 0.12, fx: { kind: 'slash', tilt: 0.1 }, sound: 'axeHit' },
      { t: 0.92, anim: 'dual_l', dur: 0.26, share: 0.12, fx: { kind: 'slash', tilt: -0.2, flip: true }, sound: 'axeHit' },
      { t: 1.18, anim: 'dual_cross', dur: 0.36, share: 0.18, fx: { kind: 'cross' }, sound: 'axeHit' },
      { t: 1.55, anim: 'dual_spin', dur: 0.5, share: 0.2, fx: { kind: 'slash', wide: true }, sound: 'blade' },
      { t: 2.1, anim: 'chain_sweep', dur: 0.55, share: 0.38, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.15,
    length: 2.9,
  },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): veste a MÁSCARA DO DESESPERO e vira A MAGISTRADA
  awakening: {
    name: 'A Máscara do Desespero',
    banner: 'A Máscara do Desespero',
    type: 'maskTransform',
    prop: 'despairMask',
    form: 'celestine_magistrada',
    formBanner: 'CELESTINE, A MAGISTRADA',
    color: BLUE,
    tint: BLUE,
    bonusHealth: 300, // vestida a Relíquia, aguenta mais que o elenco
  },

  passives: [
    { type: 'backstab', mult: 1.2 }, // Nada Pessoal: a traição vem pelas costas — +20% de dano físico por trás
  ],
};
