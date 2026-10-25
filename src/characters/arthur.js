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
    identity: 'Precisão + sniper + arma amaldiçoada + combate de um braço; sem sanidade, paga os rituais com o próprio sangue',
    tagline: 'Paciente. Um tiro basta.',
  },
  stats: { moveSpeed: 7.2 },
  victoryProp: 'sniperHand', // a sniper à mostra na vitória (no resto do tempo só aparece no tiro)
  anims: { idle: 'idle_onearm', run: 'run', charge: 'charge_onearm', victory: 'vic_arthur', block: 'block_onearm', grab: 'grab_onearm', throw_grab: 'kick_front' },
  chargeFx: { style: 'forearm', color: 0xff2a3d },
  dodge: { style: 'default' },

  // o braço DIREITO bate junto com os chutes (soco e cotovelada de um braço só); o esquerdo não existe
  melee: {
    name: 'Combate de um braço',
    strikes: [
      { name: 'Chute baixo', anim: 'kick_low', dur: 0.32, active: [0.1, 0.19], damage: 36, range: 1.9, arc: 100, knockback: 0.9, lunge: 1.3, sound: 'swing', hitSound: 'kick' },
      { name: 'Soco de direita', anim: 'onearm_punch', dur: 0.3, active: [0.09, 0.17], damage: 38, range: 1.6, arc: 90, knockback: 1.0, lunge: 1.3, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Joelhada', anim: 'knee', dur: 0.34, active: [0.1, 0.2], damage: 42, range: 1.7, arc: 100, knockback: 1.0, lunge: 1.4, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Cotovelada', anim: 'onearm_elbow', dur: 0.34, active: [0.1, 0.2], damage: 44, range: 1.5, arc: 110, knockback: 1.2, lunge: 1.2, sound: 'swing', hitSound: 'heavyPunch' },
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
    speed: 95, // rápido, mas dá para ver a bala (com 170 chegava no mesmo quadro e não dava para desviar)
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
    // track: velocidade (m/s) com que o laser persegue o alvo — correndo de lado dá para sair da mira;
    // lockWarn: com a mira cheia o laser trava e pisca antes do disparo automático (tempo para esquivar)
    chargeShot: { draw: 0.32, maxAim: 1.3, minDamage: 70, maxDamage: 160, recovery: 0.45, track: 5, lockWarn: 0.35 },
  },

  abilities: [
    {
      id: 'rebirth',
      name: 'Rebirth',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'weaponState',
      // cânone (Calamidade, Amaldiçoar Arma com Energia): abre os olhos, os RAIOS ROXOS vazam e envolvem a arma com
      // pequenas caveiras; os tiros saem com os raios roxos e dano de Energia (o verde era o Rebirth de Desconjuração)
      description: 'Abre os olhos e os raios roxos de Energia envolvem o rifle com pequenas caveiras: os próximos tiros da sniper causam dano extra.',
      energyCost: 30,
      cooldown: 22,
      duration: 15, // segundos máximos do estado amaldiçoado
      shots: 3, // tiros fortalecidos
      bonusDamage: 75, // por tiro (110 → 185; era +60, buff v3.6)
      color: 0xa46bff, // os raios ROXOS de Calamidade
      element: 'energia',
      projectile: { visual: 'cursedSniper', color: 0xa46bff, impactScale: 2.4, hitSound: 'clawHit', knockback: 7, hitstun: 0.6 },
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
      damageMult: 1.35, // era 1,25 (buff v3.6)
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
    {
      // cânone (Calamidade): "gastando 2 PV, projeta uma lâmina a partir do próprio sangue". A lâmina nasce do punho
      // DIREITO (o braço que ele tem) e, enquanto dura, o físico deixa os chutes e vira a sequência de CORTES com ela
      // (`melee` abaixo): paga com a vida, alcança mais longe e faz sangrar. (Antes era o especial; o especial agora é
      // o Solo do Abutre.)
      id: 'armaDeSangue',
      name: 'Arma de Sangue',
      input: 'block+jump', // R2 + × / RT + A
      type: 'bloodBlade',
      description: 'Paga com o próprio sangue e projeta uma lâmina de sangue do punho direito: por 8 s o físico vira cortes com ela, que alcançam mais longe e fazem sangrar.',
      healthCost: 40,
      energyCost: 0,
      cooldown: 18,
      duration: 8,
      rangeBonus: 0.4,
      bleed: { dps: 5, duration: 3 },
      showProp: 'bloodBlade',
      props: [],
      color: 0xff1a30,
      // os CORTES com a lâmina de sangue — só o braço direito (as animações de faca de uma mão)
      melee: {
        name: 'Lâmina de Sangue',
        strikes: [
          { name: 'Corte de sangue', anim: 'knife_1', dur: 0.3, active: [0.09, 0.17], damage: 38, range: 2.0, arc: 120, knockback: 1.0, lunge: 1.3, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff1a30, tilt: 0.05 } },
          { name: 'Corte reverso', anim: 'knife_2', dur: 0.3, active: [0.09, 0.17], damage: 40, range: 2.0, arc: 120, knockback: 1.1, lunge: 1.2, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff1a30, flip: true } },
          { name: 'Estocada de sangue', anim: 'thrust', dur: 0.34, active: [0.11, 0.21], damage: 44, range: 2.3, arc: 60, knockback: 1.6, lunge: 1.5, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff1a30 } },
          { name: 'Talho de sangue', anim: 'knife_final', dur: 0.5, active: [0.17, 0.3], damage: 62, range: 2.2, arc: 140, lunge: 2.0, finisher: 'launch', sound: 'slashFinal', hitSound: 'clawHit', impactScale: 1.6, trail: { color: 0xff1a30, roll: 1.2, big: true } },
        ],
        up: { name: 'Corte ascendente', anim: 'slash_up', dur: 0.42, active: [0.13, 0.25], damage: 42, range: 2.1, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'clawHit', trail: { color: 0xff1a30, tilt: -1.2 } },
        down: { name: 'Corte descendente', anim: 'knife_3', dur: 0.44, active: [0.15, 0.26], damage: 46, range: 2.1, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'clawHit', impactScale: 1.4, trail: { color: 0xff1a30, roll: 1.4 } },
        forward: { name: 'Avanço cortante', anim: 'dash_slash', dur: 0.42, active: [0.12, 0.24], damage: 44, range: 2.1, arc: 120, knockback: 2.6, motion: [{ t: [0, 0.22], fwd: 4.4, stopClose: true }], sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff1a30, wide: true } },
        back: { name: 'Esquiva e corte', anim: 'knife_evade', dur: 0.5, active: [0.28, 0.38], damage: 44, range: 2.0, arc: 110, knockback: 2.6, iframes: [0, 0.22], motion: [{ t: [0, 0.16], back: 2.0 }, { t: [0.18, 0.32], fwd: 2.2, stopClose: true }], sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff1a30 } },
        side: { name: 'Corte lateral', anim: 'knife_2', dur: 0.34, active: [0.1, 0.2], damage: 40, range: 2.0, arc: 140, knockback: 2.2, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff1a30, tilt: 0.2 } },
        air: { name: 'Corte aéreo', anim: 'air_knife', dur: 0.38, active: [0.12, 0.28], damage: 40, range: 2.0, arc: 110, knockback: 3, slam: 15, vertical: 2.2, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff1a30, roll: 1.2 } },
      },
    },
  ],

  // SOLO DO ABUTRE — "O Guitarrista" que guarda o rifle na capa da guitarra, último dos Gaudérios Abutres e aprendiz
  // do atirador Aaron. As habilidades de atirador de Calamidade numa cena (specials/eliteShot.js): some na fumaça
  // (Treinado em Furtividade), reaparece ajoelhado, o Rebirth amaldiçoa o rifle com os raios roxos, mira (Mira de Elite)
  // e o tiro sai crítico (Golpe de Sorte). Dá para defender/esquivar na largada como os outros especiais.
  special: {
    name: 'Solo do Abutre',
    banner: 'Solo do Abutre',
    type: 'eliteShot',
    energyCost: 50,
    cooldown: 16,
    range: 45,
    // damage: omitido → 250 (padrão)
    critMult: 1.1, // o crítico do Golpe de Sorte
    showProp: 'sniperHand',
    color: 0xa46bff,
  },

  // DESPERTAR "OLHOS SEMPRE ABERTOS" (Barra de Transformação cheia + vida baixa, segurando △) — no cânone é ao abrir os
  // olhos que os rituais vazam (Rebirth, Dystopia); aqui eles ficam abertos até o fim do round. Cânone: aos 50% de exposição ele se conecta
  // com a Marca pelo SANGUE (Afinidade Elemental: vantagem em Força e nos rituais de Sangue; mechas brancas e caninos
  // afiados) e tem o Sangue de Ferro (mais vida). "Magnum Opus" no cânone é uma habilidade SOCIAL (ser reconhecido como
  // artista), por isso saiu daqui. Até o fim do round.
  awakening: {
    name: 'Olhos Sempre Abertos',
    banner: 'Olhos Sempre Abertos',
    type: 'awakenMode',
    mult: 1.15, affects: ['melee', 'ability', 'special'], takenMult: 0.85, aura: 'blood', color: 0xff1a30, heal: 0.15,
  },

  passives: [
    { type: 'bloodPrice', hpPerPoint: 1.5, minHealth: 0.15 }, // sem sanidade, paga rituais com a própria vida (cânone: a Arma de Sangue gasta PV)
    // cânone (Calamidade): Golpe de Sorte — a margem de crítico dobra (16 a 20): os tiros podem sair críticos
    { type: 'luckyStrike', kinds: ['ranged'], chance: 0.25, mult: 1.5 },
    // cânone: Furtivo e Letal — com o rifle, de longe, o ataque furtivo dói mais
    { type: 'longShot', kinds: ['ranged'], minDist: 10, mult: 1.2 },
  ],
};
