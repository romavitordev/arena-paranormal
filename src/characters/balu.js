// BALU — Antônio "Balu" Pontevedra (id: balu). Ordo Realitas (Equipe Abutres, Calamidade): ex-agente veterano,
// Combatente / Duelista, 1,90 m. Bobo e piadista, protetor da equipe, fala alto e está sempre sorrindo — e muito sério
// quando ameaçam a família dele. Repudia o paranormal: paga o Machado Demônio com o próprio sangue.
// Cânone (wiki): Força Física, Resistência à Dor, Fala Imponente, Técnica Secreta, Ataque Poderoso, 110%, Derrubar e
// Atacar; Amaldiçoar Arma com Sangue → Machado Demônio (o pomo de pantera cravado no peito vira a lâmina numa
// maça-estrela de sangue); Colete Físico-Balístico; Amuleto de Proteção Elemental na fivela; Machado Lancinante
// (cabo de metal, pomo em cabeça de pantera), amaldiçoado com veias vermelhas depois de acertar o Diabo.
// Escala de poder (lore/ESCALA.md): nível B — o "tanque" humano do elenco. PESADO: muita vida, golpes que derrubam e
// aguentam um golpe pequeno, um pouco mais rápido que a Lírio; pouca ferramenta de distância (o machado que volta).
export default {
  id: 'balu',
  name: 'BALU',
  model: 'balu',
  color: '#e8b23a', // as flores amarelas da camisa
  origin: 'Ordo Realitas',
  element: 'sangue', // o machado amaldiçoado pelo Diabo e o Machado Demônio
  energyColor: 0xd8b070,
  info: {
    weapon: 'Machado Lancinante (pomo de pantera) e o Machado Demônio de sangue',
    style: 'Machadadas pesadas com as duas mãos, aguenta a pancada e derruba',
    identity: 'O tanque da Equipe Abutres: fica na linha de frente, apanha, sorri e derruba',
    tagline: 'Calma, calma… deixa que o tio Balu resolve.',
  },
  stats: { moveSpeed: 7.1, maxHealth: 1300, attackSpeed: 1.04 },
  anims: { idle: 'idle_hammer', run: 'run', charge: 'charge', victory: 'vic_balu', block: 'block_hammer', blockHeavy: 'block_heavy', dash: 'dash_heavy' },
  // machado de duas mãos (mesma pegada da Leonora): andando leva no ombro
  grip: {
    twoHand: true,
    reach: 0.42,
    carry: { sR: [-0.55, 0.35, -0.35], eR: [-1.6, 0, 0] },
    freeLeft: ['taunt_roar', 'vic_balu', 'throw_r', 'charge', 'shoulder_charge', 'defeat', 'dash_heavy', 'hit', 'launched', 'fall', 'getup', 'concentrate'],
  },
  chargeFx: { style: 'default', color: 0xd8b070 },
  dodge: { style: 'default', distance: 4.4 },

  melee: {
    name: 'Machado Lancinante',
    strikes: [
      { name: 'Machadada lateral', anim: 'hammer_h', dur: 0.4, active: [0.11, 0.2], damage: 32, range: 2.3, arc: 140, knockback: 1.1, lunge: 1.0, sound: 'swing', hitSound: 'axeHit', impactScale: 1.2, trail: { color: 0xd8d8de, tilt: 0.05 } },
      { name: 'Machadada cruzada', anim: 'hammer_diag', dur: 0.48, active: [0.19, 0.29], damage: 36, range: 2.3, arc: 120, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'axeHit', impactScale: 1.3, trail: { color: 0xd8d8de, roll: 0.8 } },
      { name: 'Machadada por cima', anim: 'hammer_v', dur: 0.54, active: [0.24, 0.34], damage: 44, range: 2.4, arc: 80, knockback: 1.6, lunge: 1.1, guardCrush: 22, sound: 'swing', hitSound: 'axeHit', impactFx: 'smash', impactScale: 1.5, groundFx: 'dust', groundScale: 0.8, hitstop: 0.09, trail: { color: 0xd8d8de, roll: 1.55 } },
      { name: 'Pancada do Urso', anim: 'hammer_finisher', dur: 0.8, active: [0.35, 0.49], damage: 70, range: 2.5, arc: 170, lunge: 1.6, finisher: 'launch', armor: { from: 0.16, to: 0.35, max: 35 }, sound: 'slashFinal', hitSound: 'axeHit', impactFx: 'smash', impactScale: 2.0, hitstop: 0.12, trail: { color: 0xd8d8de, roll: 1.4, big: true } },
    ],
    up: { name: 'Machado de baixo para cima', anim: 'hammer_up', dur: 0.5, active: [0.18, 0.28], damage: 40, range: 2.3, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'axeHit', impactScale: 1.4, trail: { color: 0xd8d8de, tilt: -1.3 } },
    down: { name: 'Machado no chão', anim: 'hammer_ground', dur: 0.6, active: [0.24, 0.36], damage: 48, range: 2.3, arc: 100, lunge: 0.9, finisher: 'knockdown', armor: { from: 0.1, to: 0.25, max: 30 }, sound: 'swing', hitSound: 'axeHit', impactFx: 'smash', impactScale: 1.6, groundFx: 'smash', groundScale: 0.9, hitstop: 0.1 },
    // DERRUBAR E ATACAR (cânone): perto de quem está caído, mais uma machadada no chão (uma vez por queda)
    ground: { name: 'Derrubar e Atacar', anim: 'hammer_ground', dur: 0.6, active: [0.24, 0.36], damage: 32, range: 2.3, arc: 110, motion: [{ t: [0, 0.24], fwd: 1.6, stopClose: true }], otg: true, knockback: 0, sound: 'swing', hitSound: 'axeHit', impactFx: 'smash', impactScale: 1.3, groundFx: 'smash', groundScale: 0.8, noPassive: true },
    // frente + físico: entra correndo com o machado erguido (o "tio Balu" chegando)
    forward: { name: 'Investida do Urso', anim: 'hammer_charge', dur: 0.6, active: [0.27, 0.37], damage: 40, range: 2.4, arc: 120, knockback: 2.2, armor: { from: 0.0, to: 0.27, max: 30 }, motion: [{ t: [0, 0.29], fwd: 6.6, stopClose: true }], sound: 'swing', hitSound: 'axeHit', impactScale: 1.5, groundFx: 'dust', groundScale: 0.6, trail: { color: 0xd8d8de, tilt: -0.6 } },
    back: { name: 'Recua e machada', anim: 'hammer_h', dur: 0.5, active: [0.23, 0.31], damage: 34, range: 2.3, arc: 130, knockback: 2.6, motion: [{ t: [0, 0.14], back: 1.7 }, { t: [0.18, 0.3], fwd: 1.9, stopClose: true }], sound: 'swing', hitSound: 'axeHit', impactScale: 1.3, trail: { color: 0xd8d8de, tilt: 0.05 } },
    side: { name: 'Machadada em movimento', anim: 'hammer_h', dur: 0.46, active: [0.17, 0.26], damage: 32, range: 2.3, arc: 150, knockback: 1.8, motion: [{ t: [0, 0.24], side: 2.4 }], sound: 'swing', hitSound: 'axeHit', impactScale: 1.2, trail: { color: 0xd8d8de, tilt: 0.2 } },
    air: { name: 'Machado aéreo', anim: 'hammer_air', dur: 0.5, active: [0.18, 0.34], damage: 40, range: 2.3, arc: 110, knockback: 3, slam: 18, vertical: 2.2, sound: 'swing', hitSound: 'axeHit', impactFx: 'smash', impactScale: 1.5, trail: { color: 0xd8d8de, roll: 1.4 } },
  },

  // □: MACHADO EM GIRO — arremessa o Machado Lancinante girando e ele volta para a mão (a mão fica vazia enquanto voa)
  ranged: {
    name: 'Machado em Giro',
    type: 'projectile',
    anim: 'throw_r',
    origin: 'chest',
    hideProp: 'axe',
    windup: 0.3,
    recovery: 0.34,
    count: 1,
    interval: 0,
    damage: 34,
    range: 14,
    speed: 20,
    radius: 0.6,
    spread: 0,
    knockback: 2.2,
    hitstun: 0.45,
    cooldown: 3.0,
    energyCost: 0,
    boomerang: true,
    returnsProp: 'axe',
    visual: 'baluAxe',
    color: 0xd8d8de,
    // com o Machado Demônio ativo ele arremessa a MAÇA DE SANGUE que está na mão (antes saía o machado comum)
    whileBuff: { bloodBlade: { hideProp: 'demonMace', returnsProp: 'demonMace', returnsFallback: { buff: 'bloodBlade', prop: 'axe' }, visual: 'demonMace', color: 0xa01018 } },
    sound: 'knifeThrow',
    hitSound: 'axeHit',
  },

  abilities: [
    {
      id: 'amaldicoarMachado',
      name: 'Amaldiçoar Arma com Sangue',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'curseWeapon',
      description: 'Desperta as veias que o Diabo deixou no machado: por alguns segundos cada machadada (e o machado arremessado) abre um sangramento.',
      energyCost: 25,
      cooldown: 18,
      duration: 8,
      props: ['axe'],
      bleed: { dps: 5, duration: 3 },
      color: 0xc01828,
    },
    {
      id: 'machadoDemonio',
      name: 'Machado Demônio',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'demonAxe',
      anim: 'concentrate',
      description: 'Crava o pomo de pantera no próprio peito (custa 60 de VIDA, não sanidade): o sangue vira uma maça-estrela no lugar da lâmina por 10 s — golpes físicos 25% mais fortes, mais alcance, sangramento e aguenta 2 golpes sem recuar.',
      energyCost: 0,
      hpCost: 60,
      cooldown: 22,
      duration: 10,
      damageMult: 1.25,
      rangeBonus: 0.5,
      bleed: { dps: 4, duration: 2 },
      armor: 2,
      ai: { max: 6 },
    },
    {
      id: 'falaImponente',
      name: 'Fala Imponente',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'caiDentro',
      description: 'O ex-vendedor sabe fazer um discurso firme: grita com o adversário, que fica PROVOCADO (só ataca no corpo a corpo por 4 s), e o Balu recebe 15% menos dano.',
      energyCost: 20,
      cooldown: 14,
      duration: 4,
      near: 99, // nunca corre: sempre o discurso
      runSpeed: 13,
      runTime: 0.75,
      provokeRange: 9,
      bashDamage: 0,
      takenMult: 0.85,
      roarTime: 0.75,
      range: 9,
      ai: { max: 9 },
    },
    {
      id: 'cento10',
      name: '110%',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'selfBuff',
      buffType: 'power110',
      label: '110%',
      anim: 'taunt_roar',
      description: 'Dá 110% de si: por 6 s os golpes físicos ficam 20% mais fortes e ele anda 10% mais rápido.',
      energyCost: 20,
      cooldown: 16,
      duration: 6,
      damageMult: 1.2,
      speedMult: 1.1,
      affects: ['melee'],
      color: 0xe8b23a,
    },
    {
      id: 'coleteBalistico',
      name: 'Colete Físico-Balístico',
      input: 'block+jump', // R2 + × / RT + A
      type: 'heavyProtection',
      label: 'COLETE FÍSICO-BALÍSTICO',
      description: 'Fecha o colete e aguenta firme (Resistência à Dor): por 7 s recebe 25% menos dano e aguenta 2 golpes sem recuar, um pouco mais lento.',
      energyCost: 25,
      cooldown: 22,
      duration: 7,
      takenMult: 0.75,
      armor: 2,
      speedMult: 0.92,
      ai: { when: 'hurt' },
    },
  ],

  // Especial: PANCADA DO URSO — crava o pomo no peito (o Machado Demônio nasce na mão), corre e desce três machadadas
  // de sangue; a última esmaga o adversário no chão.
  special: {
    name: 'Pancada do Urso',
    banner: 'Deixa que o tio Balu resolve!',
    type: 'cinematicCombo',
    physical: true,
    energyCost: 50,
    cooldown: 14,
    color: 0xc01828,
    sound: 'specialStart',
    prepare: { anim: 'concentrate', time: 0.75, fx: 'stomp', showProp: 'demonMace', hideProp: 'axe', keepIfBuff: 'bloodBlade' },
    dash: { speed: 14, maxTime: 0.6, contact: 2.0 },
    hits: [
      { t: 0.95, anim: 'hammer_h', dur: 0.46, share: 0.18, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.45, anim: 'hammer_diag', dur: 0.5, share: 0.18, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.95, anim: 'hammer_up', dur: 0.52, share: 0.2, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 2.6, anim: 'hammer_ground', dur: 0.62, share: 0.44, fx: { kind: 'smash', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.3,
    length: 3.6,
  },

  // DESPERTAR (Barra de Transformação cheia + vida baixa, segurando △) — cânone: Força Física e Resistência à Dor — o Balu
  // com raiva vira um TANQUE até o fim do round (pedido do usuário): recebe quase metade do dano, quase não é empurrado,
  // aguenta golpes sem recuar (até 2 guardados, um novo a cada 1,5 s), recupera um quarto da vida e bate mais forte; em
  // troca anda um pouco mais devagar.
  awakening: {
    name: 'Resistência à Dor',
    banner: 'Resistência à Dor',
    type: 'awakenMode',
    mult: 1.2, affects: ['melee'], takenMult: 0.55, armorEvery: 1.5, armorMax: 2, knockbackTakenMult: 0.4, speedMult: 0.92,
    aura: 'flame', color: 0xd04020, heal: 0.25,
  },

  passives: [
    { type: 'thickSkin', knockback: 0.75, chip: 0.7, guard: 0.75 }, // Resistência à Dor: aguenta tiro à queima-roupa
    { type: 'heavyHand', knockback: 1.25, hitstun: 0.05 }, // Força Física: "um soco desacorda uma pessoa comum"
  ],
};
