// JOUI JOUKI (id interno: mascarado) — velocidade + katana + sombras + teleporte.
export default {
  id: 'mascarado',
  name: 'JOUI JOUKI',
  model: 'mascarado',
  color: '#e8e2d6',
  origin: 'Ordo Realitas', // organização (cânone)
  element: 'conhecimento', // afinidade elemental (ver config/elements.js)
  energyColor: 0xd01830,
  info: {
    weapon: 'Katana',
    style: 'Espadachim ágil: cortes, avanço, contra-ataque e golpe aéreo',
    identity: 'Velocidade + katana + sombras + teleporte',
    tagline: 'Ninguém viu o rosto. Ninguém viu ele chegar.',
  },
  stats: { moveSpeed: 8.0 },
  anims: { idle: 'idle_katana', run: 'run', charge: 'charge', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'aura', color: 0xd01830, smoke: 0x120a0c },
  // esquiva pelas sombras (não é teleporte: só um passo rápido envolto em sombra)
  dodge: { style: 'shadow', iframes: 0.2 },

  melee: {
    name: 'Katana',
    strikes: [
      { name: 'Corte horizontal', anim: 'slash_h', dur: 0.32, active: [0.09, 0.19], damage: 33, range: 2.2, arc: 130, knockback: 1.5, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.05 } },
      { name: 'Corte diagonal', anim: 'slash_d', dur: 0.36, active: [0.11, 0.21], damage: 35, range: 2.2, arc: 110, knockback: 1.7, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { roll: 0.9 } },
      { name: 'Corte vertical', anim: 'slash_v', dur: 0.4, active: [0.14, 0.24], damage: 39, range: 2.2, arc: 70, knockback: 2.0, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { roll: 1.55 } },
      { name: 'Sequência rápida', anim: 'slash_rapid', dur: 0.24, active: [0.06, 0.14], damage: 18, range: 2.1, arc: 120, knockback: 0.8, lunge: 0.8, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: -0.15 } },
      { name: 'Sequência rápida (volta)', anim: 'slash_h_back', dur: 0.26, active: [0.07, 0.15], damage: 18, range: 2.1, arc: 120, knockback: 0.8, lunge: 0.8, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.15, flip: true } },
      { name: 'Finalizador', anim: 'slash_finisher', dur: 0.62, active: [0.3, 0.42], damage: 60, range: 2.4, arc: 90, lunge: 1.8, finisher: 'launch', sound: 'slashFinal', hitSound: 'bladeHit', trail: { roll: 1.5, big: true } },
    ],
    up: { name: 'Corte ascendente', anim: 'slash_up', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.3, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: 0xd01830, tilt: -1.3 } },
    down: { name: 'Corte descendente', anim: 'slash_v', dur: 0.52, active: [0.2, 0.32], damage: 48, range: 2.3, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactScale: 1.4, trail: { color: 0xd01830, roll: 1.5, big: true } },
    forward: { name: 'Avanço com corte', anim: 'dash_slash', dur: 0.42, active: [0.12, 0.24], damage: 40, range: 2.2, arc: 140, knockback: 2.6, motion: [{ t: [0, 0.22], fwd: 4.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.1, wide: true } },
    // postura de contra-ataque: se for atacado no físico durante a janela, revida
    back: {
      name: 'Coincidência Forçada "Rodolfo"', anim: 'counter_stance', dur: 0.62, active: [0.62, 0.62], damage: 0, range: 0, arc: 0, knockback: 0,
      counter: { window: [0.05, 0.5], riposte: { damage: 55, finisher: 'launch', anim: 'iai_slash', sound: 'slashFinal' } },
      sound: 'blade',
    },
    side: { name: 'Corte lateral', anim: 'slash_h', dur: 0.34, active: [0.1, 0.2], damage: 30, range: 2.2, arc: 130, knockback: 1.8, motion: [{ t: [0, 0.22], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.2 } },
    air: { name: 'Golpe aéreo', anim: 'air_slash', dur: 0.42, active: [0.15, 0.32], damage: 38, range: 2.2, arc: 100, knockback: 3.5, slam: 16, vertical: 2.4, sound: 'blade', hitSound: 'bladeHit', trail: { roll: 1.5 } },
  },

  // □: Sombra Rasteira — extensão de sombra pelo chão (não é projétil genérico)
  ranged: {
    name: 'Sombra Rasteira',
    type: 'projectile',
    anim: 'shadow_cast',
    origin: 'ground',
    windup: 0.24,
    recovery: 0.2,
    count: 1,
    interval: 0,
    damage: 30,
    range: 13,
    speed: 24,
    radius: 0.7,
    spread: 0,
    knockback: 0.5,
    hitstun: 0.2,
    onHit: { stun: 0.55, stunAnim: 'stagger' }, // prende o alvo para iniciar pressão
    cooldown: 4,
    energyCost: 10,
    visual: 'shadow',
    color: 0xd01830,
    sound: 'teleport',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      id: 'teleport',
      name: 'Teleporte das Sombras',
      input: 'carga+jump', // Energia (△/Y) + Pulo (×/A)
      spamWindow: 8, // teleportar de novo em menos de 8 s custa 60% a mais
      spamMult: 1.6,
      type: 'teleportBehind',
      description: 'Afunda na própria sombra e emerge atrás do adversário, já podendo atacar. Não causa dano.',
      energyCost: 22,
      cooldown: 5,
      distance: 1.5,
      vanishTime: 0.16,
      color: 0xd01830,
    },
    {
      id: 'olhar',
      name: 'Olhar do Desespero',
      input: 'mod+physical', // R1 + ○ / RB + B
      type: 'fearGaze',
      description: 'Encara o adversário e libera uma manifestação de medo: quem estiver à frente fica paralisado por um instante, vulnerável a combo.',
      energyCost: 25,
      cooldown: 12,
      range: 8,
      arc: 70,
      windup: 0.4,
      recovery: 0.3,
      stun: 0.9, // breve: não tira o controle por tempo exagerado
      color: 0xd01830,
    },
  ],

  special: {
    name: 'Shi no Kage',
    banner: 'Shi no Kage!',
    type: 'teleportStrike',
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → COMBAT.specialDamage. NÃO é hitkill.
    maxRange: 30,
    behindDistance: 1.4,
    color: 0xd01830,
    sound: 'teleport',
  },

  passives: [
    { type: 'decepar', threshold: 0.2, mult: 1.3 }, // Decepar: finalizador +30% em quem está com menos de 20% de vida
    // golpes físicos pelas costas do inimigo (ex.: após o teleporte) causam +25%
    { type: 'backstab', mult: 1.25, kinds: ['melee'] },
  ],
};
