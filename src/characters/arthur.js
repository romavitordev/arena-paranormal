// ARTHUR CERVERO (id interno: arthur) — precisão + sniper + arma amaldiçoada (Rebirth) + combate de um braço.
// REGRA: possui só o braço DIREITO. Nenhum golpe usa um segundo braço.
export default {
  id: 'arthur',
  name: 'ARTHUR CERVERO',
  model: 'arthur',
  color: '#ff2a3d',
  origin: 'Ordo Realitas', // organização (cânone)
  element: 'sangue', // afinidade elemental (ver config/elements.js)
  energyColor: 0xff2a3d,
  oneArm: true, // verificado pelo script de checagem
  info: {
    weapon: 'Sniper',
    style: 'Um braço só: luta com chutes e joelhadas (o braço fica para a sniper)',
    identity: 'Precisão + sniper + arma amaldiçoada + combate de um braço',
    tagline: 'Paciente. Um tiro basta.',
  },
  stats: { moveSpeed: 7.2 },
  anims: { idle: 'idle_onearm', run: 'run', charge: 'charge_onearm', victory: 'victory_onearm', block: 'block_onearm', grab: 'grab_onearm', throw_grab: 'kick_front' },
  chargeFx: { style: 'forearm', color: 0xff2a3d },
  dodge: { style: 'default' },

  melee: {
    name: 'Combate de um braço',
    strikes: [
      { name: 'Chute baixo', anim: 'kick_low', dur: 0.32, active: [0.1, 0.19], damage: 36, range: 1.9, arc: 100, knockback: 0.9, lunge: 1.3, sound: 'swing', hitSound: 'kick' },
      { name: 'Joelhada', anim: 'knee', dur: 0.34, active: [0.1, 0.2], damage: 42, range: 1.7, arc: 100, knockback: 1.0, lunge: 1.4, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Chute circular', anim: 'kick_round', dur: 0.4, active: [0.13, 0.25], damage: 46, range: 1.9, arc: 140, knockback: 1.2, lunge: 1.1, sound: 'swing', hitSound: 'kick' },
      { name: 'Chute giratório', anim: 'spin_kick', dur: 0.6, active: [0.22, 0.38], damage: 60, range: 2.0, arc: 160, lunge: 1.8, finisher: 'launch', sound: 'swing', hitSound: 'heavyPunch' },
    ],

    up: { name: 'Chute alto', anim: 'kick_front', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'kick' },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.44, active: [0.14, 0.26], damage: 44, range: 1.9, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick', impactScale: 1.4 },
    forward: { name: 'Chute de avanço', anim: 'kick_front', dur: 0.45, active: [0.16, 0.28], damage: 42, range: 2.0, arc: 90, knockback: 3.5, motion: [{ t: [0, 0.28], fwd: 2.6, stopClose: true }], sound: 'swing', hitSound: 'kick' },
    // esquiva usando o corpo e revida com um chute
    back: { name: 'Esquiva corporal', anim: 'sway_kick', dur: 0.55, active: [0.3, 0.42], damage: 44, range: 1.6, arc: 110, knockback: 3, iframes: [0, 0.22], motion: [{ t: [0, 0.18], back: 1.8 }, { t: [0.2, 0.36], fwd: 2.0, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    side: { name: 'Chute lateral', anim: 'side_kick', dur: 0.45, active: [0.18, 0.3], damage: 40, range: 1.9, arc: 120, knockback: 2.6, motion: [{ t: [0, 0.25], side: 2.2 }], sound: 'swing', hitSound: 'kick' },
    air: { name: 'Pisão aéreo', anim: 'air_kick', dur: 0.45, active: [0.15, 0.35], damage: 40, range: 1.9, arc: 110, knockback: 4, slam: 15, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch' },
  },

  ranged: {
    name: 'Sniper',
    type: 'projectile',
    anim: 'shoot_sniper',
    showProp: 'sniperHand',
    windup: 0.42, // lento
    recovery: 0.5,
    count: 1,
    interval: 0,
    damage: 110, // alto dano
    range: 70, // longo alcance
    speed: 170, // preciso
    radius: 0.3,
    spread: 0,
    knockback: 5, // grande impacto
    hitstun: 0.45,
    cooldown: 3.2,
    energyCost: 0,
    visual: 'sniper',
    color: 0xfff2c0,
    sound: 'sniper',
    hitSound: 'heavyPunch',
    impactScale: 1.8,
    // Segurar □: pega o rifle, ajoelha, apoia no joelho e mira. Quanto mais tempo mirando, mais dano —
    // e mais tempo exposto (tomar um golpe cancela o tiro). Toque rápido = disparo rápido e fraco.
    chargeShot: { draw: 0.32, maxAim: 1.3, minDamage: 70, maxDamage: 160, recovery: 0.45 },
  },

  abilities: [
    {
      id: 'rebirth',
      name: 'Rebirth',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'weaponState',
      description: 'Energia paranormal percorre o corpo e amaldiçoa o rifle: os próximos tiros da sniper causam dano extra, com raios e runas.',
      energyCost: 30,
      cooldown: 22,
      duration: 15, // segundos máximos do estado amaldiçoado
      shots: 3, // tiros fortalecidos
      bonusDamage: 60, // por tiro (110 → 170)
      color: 0x3aff6a, // energia VERDE com caveirinhas
      projectile: { visual: 'cursedSniper', color: 0x3aff6a, impactScale: 2.4, hitSound: 'clawHit', knockback: 7, hitstun: 0.6 },
    },
    {
      id: 'templo',
      name: 'Ódio Incontrolável "Templo do Ódio"',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'hatredTemple',
      description: 'Corta a palma e sangra sobre o olho: ódio intenso por alguns segundos — físico mais forte e mais rápido, mas não consegue defender.',
      energyCost: 15,
      healthCost: 30,
      cooldown: 20,
      duration: 6,
      damageMult: 1.25,
      speedMult: 1.12,
      color: 0xd0102a,
    },
    {
      id: 'dystopia',
      name: 'Paralisia de Sangue "Dystopia"',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'bloodParalysis',
      description: 'Mancha o símbolo com o próprio sangue, abre os olhos vermelhos e paralisa quem estiver à frente por um instante.',
      energyCost: 25,
      healthCost: 15,
      cooldown: 18,
      windup: 0.4,
      recovery: 0.3,
      range: 7,
      arc: 70,
      stun: 0.9,
      color: 0xff1f3a,
    },
    {
      // cânone (Desconjuração, 40% de exposição): detecta uma brecha no inimigo — vantagem e mais dano em ataques
      // físicos no alvo. Arthur luta com chutes: a brecha vale para o corpo a corpo.
      id: 'analisarBrecha',
      name: 'Analisar Brecha',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'analyze',
      buffType: 'brecha',
      label: 'BRECHA (ARTHUR)',
      description: 'Estuda o adversário e acha uma brecha: por 7 s ele recebe 25% a mais de dano dos golpes físicos.',
      energyCost: 20,
      cooldown: 16,
      range: 14,
      duration: 7,
      takenMult: 1.25,
      takenKinds: ['melee'],
      color: 0xd8a040,
    },
  ],

  special: {
    name: 'Arma de Sangue',
    banner: 'Arma de Sangue!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → COMBAT.specialDamage (250)
    color: 0xff1a30,
    sound: 'bloodClaw',
    // o braço de sangue nasce no ombro ESQUERDO (o que ele perdeu) — os golpes saem dele
    prepare: { anim: 'claw_raise_L', time: 0.75, showProp: 'claw', fx: 'forearmEnergy', arm: 'L' },
    dash: { speed: 22, maxTime: 0.45, contact: 1.8 },
    hits: [
      { t: 0.95, anim: 'slash_h_L', dur: 0.32, share: 0.15, fx: { kind: 'claw', tilt: 0.1 }, sound: 'clawHit' },
      { t: 1.28, anim: 'slash_h_back_L', dur: 0.32, share: 0.15, fx: { kind: 'claw', tilt: -0.2, flip: true }, sound: 'clawHit' },
      { t: 1.62, anim: 'slash_d_L', dur: 0.36, share: 0.2, fx: { kind: 'claw', roll: 0.9 }, sound: 'clawHit' },
      { t: 2.0, anim: 'slash_up_L', dur: 0.36, share: 0.2, fx: { kind: 'claw', roll: -1.0 }, sound: 'clawHit' },
      { t: 2.55, anim: 'slash_v_L', dur: 0.4, share: 0.3, fx: { kind: 'claw', roll: 1.5, big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.25,
    length: 3.4,
    shots: 'claw',
    hideProp: 'claw',
  },

  passives: [],
};
