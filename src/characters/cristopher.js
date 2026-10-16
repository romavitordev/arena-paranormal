// CRISTOPHER "CRIS" COHEN (id: cristopher) — Ordo Realitas, Equipe E (O Segredo na Floresta). Wiki "Cristopher Cohen":
// o primeiro dublê do Van Damme (Retroceder Nunca, Render-se Jamais), instrutor de dublês, melhor amigo do Arnaldo
// Fritz e pai do Cesar (o Kaiser). ~2 m, "um armário"; escandaloso, protetor, o "paizão" da equipe. Morreu na primeira
// missão, pulando nas costas da Aracnasita para salvar o Thiago — "Filho! Eu te amo!".
// Habilidades da wiki → golpes:
//   FÍSICO ("muralha" que toma a linha de frente e absorve o dano)    → A Muralha (R2 + △) e a passiva Couro de Dublê;
//   EXPERIÊNCIA DE DUBLÊ (se recupera de machucados muito rápido)      → Levanta, Grandão! (△ + L2) e o □ Cena de Ação;
//   DIREÇÃO AVANÇADA (manobras radicais com o carro)                   → Direção Avançada (△ → □);
//   a carreira de dublê do Van Damme                                   → os chutes e o Suplex de Dublê;
//   "Filho! Eu te amo!" (as últimas palavras)                          → o especial Por Você, Filho!;
//   o sacrifício pela equipe                                           → a Transformação Último Sacrifício.
// Sem afinidade no cânone; no jogo, SANGUE (pedido do usuário: o elemento da força e das emoções). Luta de punhos.
const RED = 0xd8402c;
const DUST = 0xb8a890;

export const CRISTOPHER_KIT = {
  stats: { moveSpeed: 7.2 },
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'vic_cristopher', block: 'block' },
  chargeFx: { style: 'fists', color: 0xffb070 },
  dodge: { style: 'default', distance: 4.4 },

  melee: {
    name: 'Pancadaria de Dublê',
    // os socos de quem brigou em filme de ação a vida inteira, e os CHUTES do Van Damme
    strikes: [
      { name: 'Jab', anim: 'jab', dur: 0.24, active: [0.07, 0.13], damage: 22, range: 1.8, arc: 100, knockback: 0.8, lunge: 1.0, sound: 'swing', hitSound: 'punch', hand: 'L' },
      { name: 'Direto', anim: 'cross', dur: 0.28, active: [0.08, 0.16], damage: 28, range: 1.9, arc: 100, knockback: 1.0, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', hand: 'R' },
      { name: 'Joelhada', anim: 'knee', dur: 0.32, active: [0.11, 0.19], damage: 30, range: 1.5, arc: 100, knockback: 1.0, lunge: 0.9, sound: 'swing', hitSound: 'kick' },
      { name: 'Cotovelada', anim: 'sway_elbow', dur: 0.32, active: [0.1, 0.18], damage: 30, range: 1.6, arc: 110, knockback: 1.0, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch' },
      // o chute giratório do Van Damme fecha a sequência
      { name: 'Chute giratório', anim: 'spin_kick', dur: 0.5, active: [0.2, 0.3], damage: 56, range: 2.1, arc: 160, lunge: 1.4, finisher: 'launch', hitstop: 0.09, sound: 'swing', hitSound: 'kick', impactScale: 1.7 },
    ],
    up: { name: 'Gancho', anim: 'uppercut', dur: 0.42, active: [0.13, 0.23], damage: 42, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4 },
    down: { name: 'Pisão', anim: 'stomp', dur: 0.56, active: [0.26, 0.36], damage: 48, range: 1.8, arc: 140, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.6 },
    forward: { name: 'Ombrada de armário', anim: 'shoulder_bash', dur: 0.44, active: [0.15, 0.29], damage: 38, range: 1.9, arc: 110, knockback: 2.2, guardCrush: true, motion: [{ t: [0, 0.29], fwd: 5.2, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4 },
    back: { name: 'Rolamento de dublê', anim: 'knife_evade', dur: 0.46, active: [0.26, 0.35], damage: 32, range: 1.8, arc: 110, knockback: 1.8, iframes: [0, 0.24], motion: [{ t: [0, 0.16], back: 2.6 }, { t: [0.2, 0.32], fwd: 2.4, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    side: { name: 'Chute lateral', anim: 'side_kick', dur: 0.42, active: [0.16, 0.27], damage: 36, range: 2.0, arc: 120, knockback: 2.2, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'swing', hitSound: 'kick' },
    air: { name: 'Chute voador', anim: 'air_kick', dur: 0.44, active: [0.14, 0.32], damage: 40, range: 1.9, arc: 110, knockback: 3.6, slam: 18, vertical: 2.4, sound: 'swing', hitSound: 'kick', impactScale: 1.4 },
  },

  // □: CENA DE AÇÃO — ele não tem arma: se joga num mergulho de dublê até o adversário e chega com o ombro
  ranged: {
    name: 'Cena de Ação',
    type: 'dashStrike',
    description: 'O mergulho de dublê: corre e se joga de ombro em cima do adversário, derrubando quem estiver no caminho. Quebra a defesa.',
    energyCost: 0,
    cooldown: 3.6,
    windup: 0.18,
    distance: 8,
    speed: 19,
    range: 2.0,
    recovery: 0.42,
    damage: 34,
    knockback: 3.4,
    hitstun: 0.6,
    launch: true,
    guardCrush: true,
    trailKind: 'smoke',
    color: DUST,
    anim: 'shoulder_charge',
    hitSound: 'heavyPunch',
  },

  abilities: [
    {
      id: 'suplex',
      name: 'Suplex de Dublê',
      input: 'carga+physical', // △ → ○
      type: 'arenaGrab',
      description: 'Avança, agarra o adversário pela cintura, dá duas joelhadas e o arremessa por cima da cabeça contra o chão — a queda ensaiada que dói de verdade. Não dá para defender, só esquivar.',
      energyCost: 30,
      cooldown: 12,
      windup: 0.3,
      range: 1.8,
      lunge: 7,
      hold: 1.0,
      blows: 2,
      blowAnims: ['knee', 'knee'],
      blowDamage: 16,
      final: 'slam',
      finalDamage: 46,
      label: 'SUPLEX!',
      color: RED,
    },
    {
      id: 'direcaoAvancada',
      name: 'Direção Avançada',
      input: 'carga+ranged', // △ → □
      type: 'stuntCar',
      description: 'Assobia, e o carro dele vem derrapando por trás numa cena de dublê; ele se joga para o lado no último instante e o carro atropela quem estiver na frente. Quebra a defesa e joga longe.',
      energyCost: 30,
      cooldown: 16,
      behind: 11,
      delay: 0.35,
      speed: 26,
      damage: 78,
      knockback: 7,
      label: 'CENA DE AÇÃO!',
      color: RED,
    },
    {
      id: 'levantaGrandao',
      name: 'Levanta, Grandão!',
      input: 'carga+dodge', // △ + L2
      type: 'healOverTime',
      description: 'A Experiência de Dublê: sacode a poeira, estala o pescoço e recupera vida rápido — quem caiu de prédio em filme não fica no chão.',
      energyCost: 25,
      cooldown: 22,
      heal: 80,
      duration: 2.0,
      style: 'mist',
      color: DUST,
      ai: { when: 'hurt' },
    },
    {
      id: 'muralha',
      name: 'A Muralha',
      input: 'block+carga', // R2 + △
      type: 'heavyProtection',
      description: 'Se planta na frente de tudo como fazia pela equipe: por 7 s recebe 30% menos dano e aguenta 3 golpes sem recuar, mas anda um pouco mais devagar.',
      energyCost: 25,
      cooldown: 20,
      duration: 7,
      takenMult: 0.7,
      armor: 3,
      speedMult: 0.9,
      ai: { when: 'hurt' },
    },
  ],

  // POR VOCÊ, FILHO! (as últimas palavras dele, "Filho! Eu te amo!", antes de pular na Aracnasita): avança e encaixa a
  // sequência de chutes de filme de ação que aprendeu como dublê do Van Damme — frontal, lateral, joelhada, o
  // giratório e o chute final que joga longe
  special: {
    name: 'Por Você, Filho!',
    banner: 'Por Você, Filho!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: RED,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'charge_fists', time: 0.45, fx: 'stomp' },
    dash: { speed: 18, maxTime: 0.5, contact: 1.9 },
    hits: [
      { t: 0.6, anim: 'kick_front', dur: 0.3, share: 0.12, fx: { kind: 'punch' }, sound: 'kick' },
      { t: 0.92, anim: 'side_kick', dur: 0.32, share: 0.14, fx: { kind: 'punch' }, sound: 'kick' },
      { t: 1.26, anim: 'knee', dur: 0.3, share: 0.14, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.6, anim: 'kick_round', dur: 0.36, share: 0.16, fx: { kind: 'punch', up: true }, sound: 'kick' },
      { t: 2.15, anim: 'spin_kick', dur: 0.55, share: 0.44, fx: { kind: 'smash', big: true }, sound: 'kick', final: true },
    ],
    bannerAt: 0.2,
    length: 3.2,
  },

  passives: [
    { type: 'thickSkin', knockback: 0.65, chip: 0.65 }, // Couro de Dublê: segura empurrão e o desgaste na defesa (a "muralha")
    { type: 'heavyHand', knockback: 1.2, hitstun: 0.04 }, // a mão pesada do armário
  ],
};

export default {
  id: 'cristopher',
  name: 'CRISTOPHER',
  model: 'cristopher',
  color: '#d8402c',
  origin: 'Ordo Realitas', // Equipe E (O Segredo na Floresta)
  element: 'sangue', // sem afinidade no cânone; Sangue a pedido do usuário (a força e as emoções)
  energyColor: 0xffb070,
  info: {
    weapon: 'Os punhos e os chutes de dublê; o carro dele na Direção Avançada',
    style: 'Armário da linha de frente: socos e chutes de filme de ação, agarrões, o carro e aguenta tudo pela equipe',
    identity: 'O dublê do Van Damme e o paizão da Equipe E — no fim, o Último Sacrifício',
    tagline: 'Filho, eu te amo!',
  },
  ...CRISTOPHER_KIT,
  ai: { abilityRate: 1.2 },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): ÚLTIMO SACRIFÍCIO — o instinto protetor que o fez pular nas
  // costas da Aracnasita: até o fim do round ele mal recua e QUANTO MENOS VIDA, MAIS FORÇA FÍSICA — mas a vida ESCOA
  // (começa em 3 por segundo e sobe até 5 em 40 s; nunca o derruba sozinha: fica em 1, o golpe final é do adversário).
  // Balanço (pedido do usuário): entra com ≤ 35% da vida (~525) batendo 25% mais forte; em linha reta até 80% mais
  // forte perto de zero (com ~17%, ~+52%). O próprio sacrifício o leva ao pico, e no pico qualquer golpe o derruba.
  awakening: {
    name: 'Último Sacrifício',
    banner: 'Último Sacrifício',
    label: 'Último Sacrifício',
    type: 'awakenMode',
    anim: 'charge_fists',
    lowHealth: { from: 0.35, min: 1.25, max: 1.8 },
    affects: ['melee', 'ability'], // a força física: socos, chutes, o mergulho, o suplex e o carro (o especial fica de fora)
    knockbackTakenMult: 0.5,
    armorEvery: 4,
    drain: 3,
    drainMax: 5,
    drainRamp: 40,
    drainFloor: 1,
    aura: 'blood',
    color: 0xff4a2a,
  },
};
