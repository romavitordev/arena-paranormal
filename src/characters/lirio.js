// LÍRIO TELLINI (id: lirio) — Os Cinco (Sinais do Outro Lado). "A parede": Combatente da trilha Tropa de Choque.
// Força bruta e resistência, sempre na frente para proteger os amigos, com a marreta LEONORA.
// Poderes do cânone (wiki): Sangue de Ferro, Casca Grossa, Ataque Especial, Golpe Pesado, Mão Pesada, Cai Dentro e
// Proteção Pesada; item paranormal Amarras de Sangue "Magras"; a Leonora amaldiçoada com Sangue (miniaturas).
//
// Lugar no elenco: o único PESADO de verdade. Mais vida (Sangue de Ferro), é empurrado menos (Casca Grossa), golpes
// físicos com muito impacto (Mão Pesada) e golpes pesados que aguentam um golpe pequeno. Em troca: o mais lento do
// elenco, combo mais curto e golpes com preparação visível, esquiva mais curta e ataque à distância fraco
// (canivete). Para alcançar quem foge: golpe de aproximação, Amarras de Sangue e o Cai Dentro (corrida + provocação).
export default {
  id: 'lirio',
  name: 'LÍRIO',
  model: 'lirio',
  color: '#2c6fc8',
  origin: 'Os Cinco',
  element: 'sangue', // Amarras de Sangue e a Leonora amaldiçoada com Sangue
  energyColor: 0xd8c8a0, // impactos de cor de pó/osso: a força dele é física, não paranormal
  info: {
    weapon: 'Leonora (marreta de madeira com espinhos) e o canivete de osso da avó',
    style: 'Marretadas pesadas com o corpo inteiro, resistência e proteção dos aliados',
    identity: 'A parede: aguenta o impacto, chega perto e decide com golpes que derrubam',
    tagline: "Hoje 'cê vai conhecer a Leonora!",
  },
  stats: { moveSpeed: 6.9, maxHealth: 1350 }, // Sangue de Ferro + pesado: o mais lento e o que mais aguenta
  anims: { idle: 'idle_hammer', run: 'run', charge: 'charge', victory: 'victory_hammer', block: 'block_hammer', blockHeavy: 'block_heavy', dash: 'dash_heavy' },
  // Leonora de duas mãos: a esquerda segura o cabo; andando/correndo leva a marreta no ombro
  grip: {
    twoHand: true,
    reach: 0.42,
    carry: { sR: [-0.55, 0.35, -0.35], eR: [-1.6, 0, 0] },
    freeLeft: ['taunt_roar', 'victory_hammer', 'throw_l', 'charge', 'shoulder_charge', 'defeat', 'dash_heavy', 'hit', 'launched', 'fall', 'getup'],
  },
  chargeFx: { style: 'default', color: 0xd8c8a0 },
  dodge: { style: 'default', distance: 4.2 }, // pesado: esquiva mais curta

  melee: {
    name: 'Leonora',
    // RÁPIDOS abrem o combo (menos preparação); o VERTICAL e o FINALIZADOR são pesados (mais preparação e risco)
    strikes: [
      { name: 'Marretada horizontal', anim: 'hammer_h', dur: 0.42, active: [0.11, 0.2], damage: 34, range: 2.2, arc: 140, knockback: 1.1, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.2, trail: { color: 0xd8c8a0, tilt: 0.05 } },
      { name: 'Marretada diagonal', anim: 'hammer_diag', dur: 0.5, active: [0.2, 0.3], damage: 38, range: 2.2, arc: 120, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.3, trail: { color: 0xd8c8a0, roll: 0.8 } },
      { name: 'Marretada vertical', anim: 'hammer_v', dur: 0.56, active: [0.25, 0.35], damage: 46, range: 2.3, arc: 80, knockback: 1.6, lunge: 1.1, guardCrush: 25, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.5, groundFx: 'dust', groundScale: 0.8, hitstop: 0.09, trail: { color: 0xd8c8a0, roll: 1.55 } },
      { name: 'Hoje cê conhece a Leonora', anim: 'hammer_finisher', dur: 0.82, active: [0.36, 0.5], damage: 74, range: 2.4, arc: 170, lunge: 1.6, finisher: 'launch', armor: { from: 0.18, to: 0.36, max: 35 }, sound: 'slashFinal', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 2.0, hitstop: 0.12, trail: { color: 0xd8c8a0, roll: 1.4, big: true } },
    ],
    up: { name: 'Leonora para cima', anim: 'hammer_up', dur: 0.52, active: [0.19, 0.29], damage: 42, range: 2.2, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4, trail: { color: 0xd8c8a0, tilt: -1.3 } },
    // ↓ no combo: crava a marreta no chão (derruba)
    down: { name: 'Marretada descendente', anim: 'hammer_ground', dur: 0.62, active: [0.25, 0.37], damage: 50, range: 2.2, arc: 100, lunge: 0.9, finisher: 'knockdown', armor: { from: 0.1, to: 0.25, max: 30 }, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.6, groundFx: 'smash', groundScale: 0.9, hitstop: 0.1 },
    // perto de alguém CAÍDO: marretada no chão (acerta quem está no chão, uma vez por queda)
    ground: { name: 'Marretada no chão', anim: 'hammer_ground', dur: 0.62, active: [0.25, 0.37], damage: 30, range: 2.2, arc: 110, motion: [{ t: [0, 0.25], fwd: 1.6, stopClose: true }], otg: true, knockback: 0, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.3, groundFx: 'smash', groundScale: 0.8, noPassive: true },
    // frente + físico: ATAQUE DE APROXIMAÇÃO — inclina, avança correndo, ergue a Leonora e acerta (compensa a lentidão)
    forward: { name: 'Investida com a Leonora', anim: 'hammer_charge', dur: 0.62, active: [0.28, 0.38], damage: 40, range: 2.3, arc: 120, knockback: 2.2, armor: { from: 0.0, to: 0.28, max: 30 }, motion: [{ t: [0, 0.3], fwd: 6.2, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.5, groundFx: 'dust', groundScale: 0.6, trail: { color: 0xd8c8a0, tilt: -0.6 } },
    // trás + físico: firma os pés, recua um passo e rebate com a marreta
    back: { name: 'Recua e rebate', anim: 'hammer_h', dur: 0.52, active: [0.24, 0.32], damage: 34, range: 2.2, arc: 130, knockback: 2.6, motion: [{ t: [0, 0.14], back: 1.6 }, { t: [0.18, 0.3], fwd: 1.8, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.3, trail: { color: 0xd8c8a0, tilt: 0.05 } },
    side: { name: 'Marretada em movimento', anim: 'hammer_h', dur: 0.48, active: [0.18, 0.27], damage: 32, range: 2.2, arc: 150, knockback: 1.8, motion: [{ t: [0, 0.24], side: 2.2 }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.2, trail: { color: 0xd8c8a0, tilt: 0.2 } },
    // aéreo: não é acrobático — desce com o peso do corpo e crava no chão
    air: { name: 'Marretada aérea', anim: 'hammer_air', dur: 0.5, active: [0.18, 0.34], damage: 40, range: 2.2, arc: 110, knockback: 3, slam: 18, vertical: 2.2, sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.5, trail: { color: 0xd8c8a0, roll: 1.4 } },
  },

  // □: o canivete de osso (presente da avó) — curto alcance e pouco dano: ele não é um lutador de distância
  ranged: {
    name: 'Canivete de osso',
    type: 'projectile',
    anim: 'throw_l',
    showProp: 'knifeThrow',
    windup: 0.24,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 22,
    range: 13,
    speed: 30,
    radius: 0.35,
    spread: 0,
    knockback: 1.2,
    hitstun: 0.3,
    cooldown: 2.8,
    energyCost: 0,
    visual: 'knife',
    color: 0xe8dcc0,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
  },

  // As entradas abaixo seguem o esquema geral de controles do jogo (modificador + botão); cada habilidade é um
  // tipo independente em combat/abilities.js e pode ser religada a outro comando sem mudar a lógica.
  abilities: [
    {
      id: 'golpePesado',
      name: 'Golpe Pesado',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'heavyBlow',
      description: 'Ergue a Leonora, finca os pés, avança o corpo e crava a marreta: derruba e gasta muito da defesa. Preparação longa (aguenta um golpe pequeno depois de concentrar); errar deixa ele aberto.',
      energyCost: 30,
      cooldown: 12,
      duration: 1.4,
      armorFrom: 0.35,
      impact: 0.84,
      step: 6,
      range: 2.3,
      arc: 90,
      damage: 95,
      knockback: 4.5,
      guardCrush: 70,
      whiffRecovery: 0.5,
      ai: { when: 'opening', max: 2.6 },
    },
    {
      id: 'caiDentro',
      name: 'Cai Dentro',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'caiDentro',
      description: 'Chama a atenção do inimigo e assume o confronto: longe, corre e dá uma ombrada; perto, grita. O inimigo fica PROVOCADO (só ataca no corpo a corpo por 4 s) e o Lírio recebe 20% menos dano.',
      energyCost: 20,
      cooldown: 14,
      duration: 4,
      near: 3.2,
      runSpeed: 13,
      runTime: 0.75,
      provokeRange: 8,
      bashDamage: 30,
      takenMult: 0.8,
      roarTime: 0.75,
      range: 11,
      ai: { when: 'far', min: 4.5 },
    },
    {
      id: 'amarrasSangue',
      name: 'Amarras de Sangue "Magras"',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'bloodBind',
      description: 'Estala as Magras — corda de tripas carnudas trançadas — no alvo, e as voltas se enrolam no corpo dele e o prendem. Feitas para prender criaturas de Conhecimento: seguram 60% mais tempo quem é de Conhecimento.',
      energyCost: 25,
      cooldown: 15,
      windup: 0.3,
      range: 9,
      arc: 40,
      hold: 1.0,
      damage: 30,
      gut: true, // visual das Magras (tripas trançadas + voltas no corpo)
      vsConhecimento: 1.6,
    },
    {
      id: 'leonoraAmaldicoada',
      name: 'Leonora Amaldiçoada (Sangue)',
      input: 'block+jump', // R2 + × / RT + A
      type: 'curseWeapon',
      description: 'Amaldiçoa a Leonora com Sangue: por alguns segundos cada marretada abre um sangramento.',
      energyCost: 25,
      cooldown: 18,
      duration: 8,
      props: ['leonora'],
      bleed: { dps: 5, duration: 3 },
      color: 0xc01828,
    },
    {
      id: 'protecaoPesada',
      name: 'Proteção Pesada',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'heavyProtection',
      description: 'Põe o capacete azul e se fecha: recebe 25% menos dano e aguenta 2 golpes sem recuar por 7 s, mas fica um pouco mais lento.',
      energyCost: 25,
      cooldown: 22,
      duration: 7,
      takenMult: 0.75,
      armor: 2,
      speedMult: 0.9,
      prop: 'helmet',
      ai: { when: 'hurt' },
    },
  ],

  // Especial: concentra toda a força num ataque — pisa firme, corre (sem teletransporte), três marretadas e a
  // última crava o adversário no chão. Efeito físico (pó, pedras, tremor), nada de energia genérica.
  special: {
    name: 'Leonora',
    banner: "Hoje 'cê vai conhecer a Leonora!",
    type: 'cinematicCombo',
    physical: true,
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → COMBAT.specialDamage (250)
    color: 0xe8dcc0,
    sound: 'specialStart',
    prepare: { anim: 'taunt_roar', time: 0.75, fx: 'stomp' },
    dash: { speed: 15, maxTime: 0.6, contact: 1.9 },
    hits: [
      { t: 0.95, anim: 'hammer_h', dur: 0.46, share: 0.18, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.45, anim: 'hammer_diag', dur: 0.5, share: 0.18, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.95, anim: 'hammer_up', dur: 0.52, share: 0.2, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 2.6, anim: 'hammer_ground', dur: 0.62, share: 0.44, fx: { kind: 'smash', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.3,
    length: 3.6,
  },

  // auxiliar de equipe: entra sozinho para proteger o parceiro que está apanhando (ver combat/assists.js)
  assistAuto: { comboHits: 3, cooldownMult: 1.35 },

  // DESPERTAR (Barra de Transformação cheia + vida baixa, segurando △) — cânone: Sangue de Ferro e Casca Grossa — a raiva da Lírio vira uma muralha. Até o fim do round.
  awakening: {
    name: 'Sangue de Ferro',
    banner: 'Sangue de Ferro',
    type: 'awakenMode',
    mult: 1.1, takenMult: 0.75, armorEvery: 3, aura: 'flame', color: 0xd8a040, heal: 0.1,
  },

  passives: [
    { type: 'ironBlood' }, // Sangue de Ferro: mais vitalidade (+15% de vida)
    { type: 'thickSkin', knockback: 0.65, chip: 0.6, guard: 0.7 }, // Casca Grossa: menos recuo; defendendo, perde menos
    { type: 'heavyHand', knockback: 1.3, hitstun: 0.06 }, // Mão Pesada: golpes físicos empurram e atordoam mais
  ],
};
