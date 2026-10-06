// SENHOR VERÍSSIMO (id: verissimo) — líder da Ordo Realitas ("Veríssimo" era a designação genérica dos agentes; o
// nome verdadeiro é desconhecido). Manda as equipes em todas as temporadas, treinou vários agentes (inclusive a filha,
// Mia) e liderou os Aniquiladores. Combatente, trilha Comandante de Campo. Usa a ESPADA DO ARNALDO (herdada depois da
// morte dele) — esgrima DISCIPLINADA e econômica, o contrário do estilo teatral do Arnaldo.
// Cânone: Inteligência Estratégica (analisa o inimigo e dá ordens: os aliados ganham um ataque extra), Segredo de
// Veríssimo (sabe como vai morrer — o Kian não consegue matá-lo); bloqueou o golpe do Kian que quase matou o Arthur.
// Em 1997 carregava espingarda e faca na bandoleira (o □ é uma escopeta curta).
// Modelo PROVISÓRIO: corpo do Lírio (sobretudo) + acessórios (models/props.js addVerissimoProps) até o .glb próprio.
const BLUE = 0x6ab0e0;
const STEEL = 0xd8dde4;

export default {
  id: 'verissimo',
  name: 'SENHOR VERÍSSIMO',
  model: 'verissimo',
  color: '#6ab0e0',
  origin: 'Ordo Realitas',
  element: 'conhecimento',
  energyColor: BLUE,
  info: {
    weapon: 'A espada do Arnaldo e uma escopeta curta',
    style: 'Esgrima disciplinada, defesa sólida e contra-ataque; dá ordens que rendem um corte extra',
    identity: 'Líder da Ordo Realitas: Inteligência Estratégica e o Segredo de Veríssimo',
    tagline: 'Agentes, em posição. Eu cuido do resto.',
  },
  stats: { moveSpeed: 7.8, maxHealth: 1080 },
  anims: { idle: 'idle_katana', run: 'run', charge: 'charge', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'default', color: BLUE },
  dodge: { style: 'default', distance: 4.4 },
  // defesa de veterano (bloqueou o Kian): janela de Bloqueio Perfeito maior e o atacante fica mais tempo aberto
  defense: { perfectBlock: { window: 0.16, counterStun: 0.6 } },

  melee: {
    name: 'Espada do Arnaldo',
    strikes: [
      { name: 'Estocada curta', anim: 'thrust', dur: 0.28, active: [0.09, 0.17], damage: 26, range: 2.4, arc: 50, knockback: 1.1, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Corte seco', anim: 'slash_h', dur: 0.3, active: [0.09, 0.18], damage: 28, range: 2.1, arc: 120, knockback: 1.2, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL } },
      { name: 'Corte de volta', anim: 'slash_h_back', dur: 0.3, active: [0.09, 0.18], damage: 28, range: 2.1, arc: 120, knockback: 1.2, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, flip: true } },
      { name: 'Comando', anim: 'slash_v', dur: 0.46, active: [0.18, 0.28], damage: 56, range: 2.3, arc: 80, lunge: 1.5, finisher: 'launch', guardCrush: 20, sound: 'slashFinal', hitSound: 'heavyPunch', impactScale: 1.5, trail: { color: BLUE, roll: 1.55, big: true } },
    ],
    up: { name: 'Corte ascendente', anim: 'slash_up', dur: 0.44, active: [0.15, 0.27], damage: 38, range: 2.2, arc: 110, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: BLUE, tilt: -1.3 } },
    down: { name: 'Golpe de cima', anim: 'slash_v', dur: 0.5, active: [0.19, 0.3], damage: 46, range: 2.2, arc: 110, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4, trail: { color: BLUE, roll: 1.5 } },
    forward: { name: 'Avanço do comandante', anim: 'dash_slash', dur: 0.42, active: [0.12, 0.24], damage: 36, range: 2.2, arc: 120, knockback: 2.4, motion: [{ t: [0, 0.22], fwd: 4.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: 0.1 } },
    // postura de guarda: se for atacado no físico na janela, bloqueia e revida (como quando parou o golpe do Kian)
    back: {
      name: 'Guarda do Comandante', anim: 'counter_stance', dur: 0.62, active: [0.62, 0.62], damage: 0, range: 0, arc: 0, knockback: 0,
      counter: { window: [0.05, 0.5], riposte: { damage: 55, finisher: 'launch', anim: 'iai_slash', sound: 'slashFinal' } },
      sound: 'blade',
    },
    side: { name: 'Corte lateral', anim: 'slash_h', dur: 0.34, active: [0.1, 0.2], damage: 30, range: 2.1, arc: 130, knockback: 1.8, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: 0.2 } },
    air: { name: 'Corte aéreo', anim: 'air_slash', dur: 0.42, active: [0.15, 0.32], damage: 36, range: 2.2, arc: 100, knockback: 3.2, slam: 16, vertical: 2.4, sound: 'blade', hitSound: 'bladeHit', trail: { color: BLUE, roll: 1.5 } },
  },

  // □: escopeta curta (o Veríssimo de 1997): leque forte de perto, fraco de longe
  ranged: {
    name: 'Escopeta curta',
    type: 'projectile',
    anim: 'shoot_rifle',
    showProp: 'shotgun',
    windup: 0.24,
    recovery: 0.42,
    count: 5,
    interval: 0,
    damage: 11,
    range: 10,
    speed: 55,
    radius: 0.3,
    spread: 0.36,
    knockback: 2.2,
    hitstun: 0.3,
    cooldown: 2.2,
    energyCost: 0,
    visual: 'pellet',
    color: 0xffd27a,
    sound: 'shotgun',
    hitSound: 'impact',
  },

  abilities: [
    {
      id: 'inteligenciaEstrategica',
      name: 'Inteligência Estratégica',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'selfBuff',
      buffType: 'strategicOrder',
      label: 'ORDEM!',
      anim: 'point',
      description: '"Ordem!" — analisa o inimigo: por 7 s cada golpe físico que acerta ganha um corte extra.',
      energyCost: 25,
      cooldown: 18,
      duration: 7,
      extraHit: { damage: 12, delay: 0.1, color: BLUE },
      color: BLUE,
    },
    {
      id: 'analiseTatica',
      name: 'Análise Tática',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'analyze',
      description: 'Lê o adversário como lê um relatório: por alguns segundos ele recebe mais dano.',
      energyCost: 20,
      cooldown: 16,
      windup: 0.35,
      range: 14,
      duration: 6,
      takenMult: 1.15,
      color: BLUE,
    },
    {
      id: 'investida',
      name: 'Investida dos Aniquiladores',
      input: 'block+jump', // R2 + × / RT + A
      type: 'dashStrike',
      description: 'Avança em linha reta com a espada na frente e atravessa a guarda com força.',
      energyCost: 20,
      cooldown: 10,
      anim: 'dash_slash',
      windup: 0.2,
      distance: 6,
      speed: 20,
      recovery: 0.32,
      range: 2.2,
      damage: 50,
      knockback: 3.5,
      guardCrush: 30,
      hitSound: 'bladeHit',
      color: BLUE,
    },
    {
      id: 'jaqueta',
      name: 'Jaqueta de Veríssimo',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'heavyProtection',
      label: 'JAQUETA DE VERÍSSIMO',
      description: 'Fecha a jaqueta de couro passada entre os agentes: por 6 s recebe 20% menos dano e aguenta 1 golpe sem recuar.',
      energyCost: 25,
      cooldown: 22,
      duration: 6,
      takenMult: 0.8,
      armor: 1,
      speedMult: 1,
    },
  ],

  // ORDEM DE ATAQUE: comanda o ataque — avança (dá para esquivar do avanço), uma série de estocadas e cortes secos e
  // finaliza com a espada do Arnaldo
  special: {
    name: 'Ordem de Ataque',
    banner: 'Aniquiladores, agora!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLUE,
    sound: 'specialStart',
    prepare: { anim: 'point', time: 0.4, fx: 'bladeGlow' },
    dash: { speed: 20, maxTime: 0.5, contact: 2.0 },
    hits: [
      { t: 0.7, anim: 'thrust', dur: 0.28, share: 0.15, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.0, anim: 'slash_h', dur: 0.3, share: 0.15, fx: { kind: 'slash', tilt: 0.05 }, sound: 'bladeHit' },
      { t: 1.3, anim: 'slash_h_back', dur: 0.3, share: 0.15, fx: { kind: 'slash', flip: true }, sound: 'bladeHit' },
      { t: 1.6, anim: 'thrust', dur: 0.28, share: 0.15, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 2.1, anim: 'slash_v', dur: 0.46, share: 0.4, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.2,
    length: 3.1,
  },

  // DESPERTAR: Líder dos Aniquiladores (sem forma própria) — até o fim do round
  awakening: {
    name: 'Líder dos Aniquiladores',
    banner: 'Líder dos Aniquiladores',
    type: 'awakenMode',
    anim: 'point',
    mult: 1.15, affects: ['melee', 'ranged', 'ability'], takenMult: 0.85, cdRate: 1.3, aura: 'sigil', color: BLUE, heal: 0.1,
  },

  passives: [
    { type: 'verissimoSecret' }, // Segredo de Veríssimo: uma vez por partida, o golpe fatal o deixa com 1 de vida
  ],
};
