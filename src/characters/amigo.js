// O AMIGO IMAGINÁRIO (id: amigo) — PORTADORES DAS RELÍQUIAS (pedido do usuário: entra no grupo mesmo sem portar
// Relíquia). "A Obra de Arte Perfeita", o chefe de O Segredo na Ilha (wiki "Amigo Imaginário"): criatura da união
// impossível de Morte e Sangue, moldada pelo MEDO que o Barnabé espalhou em Tipora e ligada à TINTA de um dos Sinos de
// Tenebris. Curvado, de capuz até o chão, tentáculos, braços secos de garras e o buraco no lugar do rosto de onde a
// tinta escorre sem parar. Elemento no jogo: TINTA (marrom; pedido do usuário).
// Kit (Habilidades da wiki): Tentáculos (golpe à distância), Agarrão (puxa e arremessa), Derreter (a tinta no rosto),
// Garras, Dissolver (absorve e recupera vida), O Sino (quem ouve fica vulnerável / preso perto dele) e o FRENESI DE
// SANGUE (ferido, fica rápido e furioso — a transformação). Especial: TODO MUNDO VAI MORRER.
// Modelo próprio do Blender (public/models/amigo.glb, tools/blender/char_amigo.py).
const INK = 0x8a4a22;
const DARK = 0x3a1a10;

export default {
  id: 'amigo',
  name: 'AMIGO IMAGINÁRIO',
  model: 'amigo',
  color: '#a0602a',
  origin: 'Portadores das Relíquias',
  element: 'tinta',
  energyColor: INK,
  info: {
    weapon: 'Garras secas, tentáculos e a tinta que escorre do rosto',
    style: 'Lento e pesado: tentáculos que puxam de longe, garras de perto e a tinta que derrete',
    identity: 'A Obra de Arte Perfeita: quando o Sino tocar, a criatura vai retornar',
    tagline: 'Quando o Sino tocar, todo mundo vai morrer.',
  },
  // enorme e lento; aguenta mais (o chefe da ilha)
  stats: { moveSpeed: 7.0, attackSpeed: 0.9, maxHealth: 1100, size: 1.15 }, // o Lírio continua o mais lento (6,9)
  anims: { idle: 'ai_idle', run: 'run', charge: 'charge', victory: 'vic_amigo', block: 'db_block', block_hit: 'db_block_hit' },
  chargeFx: { style: 'default', color: INK },
  dodge: { style: 'default', distance: 4.4 },
  // a tinta escorre do buraco do rosto o tempo todo
  drips: { sockets: ['mouth'], color: 0x5a1e10, every: 0.07 },

  melee: {
    name: 'Garras e Tentáculos',
    strikes: [
      { name: 'Garra seca', anim: 'db_claw_r', dur: 0.36, active: [0.12, 0.2], damage: 30, range: 2.4, arc: 120, knockback: 1.1, lunge: 0.9, sound: 'blade', hitSound: 'clawHit', trail: { color: DARK, tilt: 0.05 } },
      { name: 'Garra seca', anim: 'db_claw_l', dur: 0.36, active: [0.12, 0.2], damage: 30, range: 2.4, arc: 120, knockback: 1.1, lunge: 0.8, sound: 'blade', hitSound: 'clawHit', trail: { color: DARK, flip: true } },
      // os tentáculos chicoteiam de longe
      { name: 'Chicote de tentáculo', anim: 'wave_punch', dur: 0.44, active: [0.16, 0.26], damage: 34, range: 3.8, arc: 70, knockback: 1.8, lunge: 0.3, element: 'tinta', sound: 'chainThrow', hitSound: 'impact', trail: { color: DARK, wide: true } },
      { name: 'Dez garras', anim: 'db_cross', dur: 0.48, actives: [[0.13, 0.2], [0.26, 0.34]], damage: 42, range: 2.5, arc: 130, knockback: 1.3, lunge: 0.9, sound: 'blade', hitSound: 'clawHit', trail: { color: INK, roll: 0.8 } },
      { name: 'Rasgar o quadro', anim: 'db_rend', dur: 0.64, active: [0.26, 0.38], damage: 64, range: 2.6, arc: 140, lunge: 1.4, finisher: 'launch', hitstop: 0.12, sound: 'slashFinal', hitSound: 'clawHit', impactScale: 1.8, trail: { color: INK, roll: 1.4, big: true } },
    ],
    up: { name: 'Erguer pelos tentáculos', anim: 'db_up', dur: 0.46, active: [0.15, 0.26], damage: 42, range: 2.6, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'chainThrow', hitSound: 'clawHit' },
    down: { name: 'Esmagar', anim: 'db_down', dur: 0.5, active: [0.2, 0.3], damage: 48, range: 2.5, arc: 120, lunge: 0.9, finisher: 'knockdown', sound: 'blade', hitSound: 'clawHit', impactScale: 1.5 },
    forward: { name: 'Avanço da criatura', anim: 'db_claw_r', dur: 0.5, active: [0.2, 0.32], damage: 38, range: 2.6, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.3], fwd: 5.2, stopClose: true }], sound: 'blade', hitSound: 'clawHit', trail: { color: INK, tilt: 0.1 } },
    back: { name: 'Recua e chicoteia', anim: 'wave_punch', dur: 0.56, active: [0.32, 0.42], damage: 34, range: 3.8, arc: 70, knockback: 2.6, iframes: [0, 0.22], motion: [{ t: [0, 0.2], back: 2.4 }], element: 'tinta', sound: 'chainThrow', hitSound: 'impact' },
    side: { name: 'Varredura de tentáculos', anim: 'db_claw_l', dur: 0.46, active: [0.14, 0.3], damage: 32, range: 3.0, arc: 300, knockback: 1.6, motion: [{ t: [0, 0.24], side: 2.2 }], sound: 'chainThrow', hitSound: 'impact', trail: { color: DARK, wide: true } },
    air: { name: 'Desabar', anim: 'db_air', dur: 0.46, active: [0.15, 0.32], damage: 38, range: 2.5, arc: 120, knockback: 3, slam: 18, vertical: 2.2, sound: 'blade', hitSound: 'clawHit', impactScale: 1.4 },
  },

  // □: TENTÁCULO — estica um tentáculo negro, prende o alvo e o PUXA até as garras (o Agarrão da wiki)
  ranged: {
    name: 'Tentáculo',
    type: 'projectile',
    homing: 2.0,
    anim: 'wave_punch',
    origin: 'hand',
    chain: true,
    windup: 0.22,
    recovery: 0.34,
    count: 1,
    interval: 0,
    damage: 26,
    range: 14,
    speed: 30,
    radius: 0.5,
    spread: 0,
    knockback: 0,
    hitstun: 0.1,
    onHit: { pull: { distance: 1.6, time: 0.35, after: 0.7 } },
    cooldown: 5.5,
    energyCost: 15,
    visual: 'chainHook',
    color: DARK,
    element: 'tinta',
    sound: 'chainThrow',
    hitSound: 'chainPull',
  },

  abilities: [
    {
      // a tinta que escorre do rosto, despejada na cara da vítima: derrete
      id: 'derreter',
      name: 'Derreter',
      input: 'carga+physical', // △ + ○
      type: 'deathTouch',
      description: 'Aproxima o buraco do rosto e DESPEJA a tinta na cara da vítima: o rosto derrete — dano contínuo, lentidão e o alvo fica mais fraco por alguns segundos. Curto alcance; dá para esquivar.',
      energyCost: 35,
      cooldown: 22,
      windup: 0.42,
      recovery: 0.35,
      range: 1.8,
      damage: 44,
      duration: 5,
      dps: 8,
      slow: 0.85,
      color: INK,
    },
    {
      // o Agarrão da wiki: os tentáculos prendem a vítima no lugar
      id: 'tentaculosPrendem',
      name: 'Tentáculos que Prendem',
      input: 'carga+ranged', // △ → □
      type: 'veinChains',
      description: 'Os tentáculos saem do chão debaixo do alvo e o prendem por um instante.',
      energyCost: 25,
      cooldown: 13,
      windup: 0.3,
      range: 12,
      arc: 50,
      hold: 1.2,
      damage: 32,
      color: DARK,
    },
    {
      // O SINO: o som de sino ecoa de dentro da criatura — quem ouve tem a mente falhando e não consegue se afastar
      id: 'oSino',
      name: 'O Sino',
      input: 'block+carga', // R2 + △
      type: 'fearGaze',
      description: 'O SINO toca dentro da criatura: quem estiver por perto, em qualquer direção, sente a mente falhar e fica paralisado por um instante.',
      energyCost: 25,
      cooldown: 16,
      range: 6,
      arc: 360,
      windup: 0.5,
      recovery: 0.3,
      stun: 0.9,
      color: INK,
    },
    {
      // DISSOLVER: absorve o que derreteu e recupera vida
      id: 'dissolver',
      name: 'Dissolver',
      input: 'carga+dodge', // △ + L2
      type: 'healOverTime',
      description: 'Absorve a tinta derramada em volta e se recompõe: recupera vida em instantes.',
      energyCost: 30,
      cooldown: 24,
      heal: 90,
      duration: 2.4,
      style: 'mist',
      color: INK,
    },
  ],

  // TODO MUNDO VAI MORRER (as músicas do chefe): os tentáculos agarram e puxam, as garras rasgam e, de cara para o
  // buraco do rosto, a tinta despeja e DERRETE a vítima
  special: {
    name: 'Todo Mundo Vai Morrer',
    banner: 'Todo mundo vai morrer.',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: INK,
    sound: 'specialStart',
    applyMeleePassives: false,
    approach: 'chain',
    chain: { speed: 46, range: 14 },
    prepare: { anim: 'charge', time: 0.35, fx: 'bloodBurst' },
    hits: [
      { t: 0.75, anim: 'db_claw_r', dur: 0.32, share: 0.14, fx: { kind: 'claw' }, sound: 'clawHit' },
      { t: 1.05, anim: 'db_claw_l', dur: 0.32, share: 0.14, fx: { kind: 'claw', flip: true }, sound: 'clawHit' },
      { t: 1.4, anim: 'db_cross', dur: 0.44, share: 0.18, fx: { kind: 'claw' }, sound: 'clawHit' },
      { t: 1.9, anim: 'db_up', dur: 0.44, share: 0.18, fx: { kind: 'slash', big: true }, sound: 'clawHit' },
      { t: 2.45, anim: 'db_rend', dur: 0.6, share: 0.36, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true, bleed: { dps: 8, duration: 4 } },
    ],
    bannerAt: 0.1,
    length: 3.3,
  },

  // FRENESI DE SANGUE (Barra cheia + vida baixa, segurando △): ferido, a criatura entra em fúria — mais rápida, mais
  // agressiva e mais resistente, até o fim do round (wiki: "os toques do sino assumem uma nova frequência")
  awakening: {
    name: 'Frenesi de Sangue',
    banner: 'Frenesi de Sangue',
    type: 'awakenMode',
    mult: 1.2, affects: ['melee', 'ability'], takenMult: 0.85, speedMult: 1.3, meleeBleed: true, aura: 'blood', color: 0xa02a18, heal: 0.12,
  },

  passives: [
    { type: 'lifesteal', ratio: 0.06 }, // Dissolver: cada golpe absorve um pouco
  ],
};
