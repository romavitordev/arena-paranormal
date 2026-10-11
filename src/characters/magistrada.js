// A MAGISTRADA (id: magistrada) — PORTADORES DAS RELÍQUIAS. Portadora da Relíquia de Conhecimento, a MÁSCARA DO
// DESESPERO, e líder da Seita das Máscaras (wiki "A Magistrada" / "Relíquias da Calamidade"). A última Magistrada:
// mulher negra, alta, de tranças, camisa branca, o longo tecido branco caindo do pescoço, luvas pretas, a grande capa
// preta até os pés com a gola dourada, a corda com nó de forca no pescoço e outra na cintura, a bengala sempre na
// mão. A Máscara: branca, três sulcos descendo dos olhos e da boca, a fenda de coração invertido no nariz e o Símbolo
// da Relíquia de Conhecimento na testa ("Nostis Omnia Perdet Omnia" — saber tudo é perder tudo).
// Não luta com pressa: protege o Equilíbrio. A bengala em esgrima elegante, a Dimensão das Sombras, o Olhar do
// Desespero, o Controle Mental, a Dispersão de Dano (aura dourada que divide o dano) e a Levitação. Especial: PRISÃO
// DAS SOMBRAS — consome o alvo pelas sombras numa esfera de Conhecimento onde ficam só os dois.
// Modelo próprio do Blender (public/models/magistrada.glb, tools/blender/char_magistrada.py) + a bengala em código.
const GOLD = 0xe0b84a;
const SHADOW = 0x2a1a3a;

export default {
  id: 'magistrada',
  name: 'A MAGISTRADA',
  model: 'magistrada',
  color: '#e0b84a',
  origin: 'Portadores das Relíquias', // Relíquia de Conhecimento
  element: 'conhecimento',
  energyColor: GOLD,
  info: {
    weapon: 'A bengala e a Máscara do Desespero',
    style: 'Esgrima calma com a bengala, sombras que levam e trazem, olhar que paralisa e mente que obedece',
    identity: 'A Portadora da Relíquia de Conhecimento: sabe tudo, lembra de tudo e só age quando o Equilíbrio cai',
    tagline: 'Eu tô apenas protegendo o Equilíbrio.',
  },
  stats: { moveSpeed: 7.6, attackSpeed: 1.0, maxHealth: 1000 },
  anims: { idle: 'idle_arnaldo', run: 'run', charge: 'charge', victory: 'vic_magistrada', block: 'block_weapon' },
  chargeFx: { style: 'default', color: GOLD },
  dodge: { style: 'default', distance: 4.6 },

  melee: {
    name: 'Bengala da Magistrada',
    // a bengala como espada de esgrima: precisa, sem pressa, cada golpe no lugar certo
    strikes: [
      { name: 'Advertência', anim: 'arn_open', dur: 0.32, active: [0.1, 0.19], damage: 26, range: 2.15, arc: 140, knockback: 1.1, lunge: 1.1, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, tilt: 0.05 } },
      { name: 'Ponta da Bengala', anim: 'arn_lunge', dur: 0.36, active: [0.13, 0.22], damage: 28, range: 2.5, arc: 50, knockback: 1.4, lunge: 1.6, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Revés', anim: 'arn_bowcut', dur: 0.42, active: [0.12, 0.2], damage: 28, range: 2.15, arc: 140, knockback: 1.2, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, flip: true } },
      { name: 'Sentença Dupla', anim: 'arn_flourish', dur: 0.42, actives: [[0.12, 0.2], [0.26, 0.34]], damage: 34, range: 2.2, arc: 160, knockback: 1.4, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', trail: { color: SHADOW, roll: 0.9 } },
      { name: 'Executora das Regras', anim: 'arn_final', dur: 0.62, active: [0.3, 0.4], damage: 60, range: 2.5, arc: 110, lunge: 1.8, finisher: 'launch', hitstop: 0.12, sound: 'slashFinal', hitSound: 'heavyPunch', impactFx: 'sigil', impactScale: 1.9, trail: { color: GOLD, roll: 1.5, big: true } },
    ],
    up: { name: 'Erguer pela Bengala', anim: 'slash_up', dur: 0.44, active: [0.15, 0.27], damage: 38, range: 2.2, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, tilt: -1.3 } },
    down: { name: 'Golpe do Juízo', anim: 'slash_v', dur: 0.5, active: [0.19, 0.3], damage: 46, range: 2.2, arc: 110, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4, trail: { color: GOLD, roll: 1.5 } },
    forward: { name: 'Passo das Sombras', anim: 'dash_slash', dur: 0.42, active: [0.12, 0.24], damage: 36, range: 2.2, arc: 130, knockback: 2.4, motion: [{ t: [0, 0.22], fwd: 4.8, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: SHADOW, tilt: 0.1, wide: true } },
    back: { name: 'Recuo e Estocada', anim: 'arn_lunge', dur: 0.55, active: [0.32, 0.42], damage: 40, range: 2.5, arc: 60, knockback: 2.4, iframes: [0, 0.24], motion: [{ t: [0, 0.18], back: 2.2 }, { t: [0.24, 0.38], fwd: 2.8, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch' },
    side: { name: 'Giro da Capa', anim: 'arn_spin', dur: 0.5, active: [0.12, 0.36], damage: 32, range: 2.3, arc: 360, knockback: 1.8, motion: [{ t: [0, 0.25], side: 2.4 }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: SHADOW, wide: true } },
    air: { name: 'Queda da Sentença', anim: 'air_slash', dur: 0.42, active: [0.15, 0.32], damage: 36, range: 2.2, arc: 100, knockback: 3.2, slam: 16, vertical: 2.4, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, roll: 1.5 } },
  },

  // □: SIGILO DO CONHECIMENTO — o Símbolo da Máscara voa até o alvo e mostra a ele o que não queria saber
  ranged: {
    name: 'Sigilo do Conhecimento',
    type: 'projectile',
    anim: 'point',
    origin: 'chest',
    windup: 0.24,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 30,
    range: 18,
    speed: 26,
    radius: 0.5,
    spread: 0,
    knockback: 0.6,
    hitstun: 0.5,
    cooldown: 2.6,
    energyCost: 0,
    visual: 'mindSigil',
    color: GOLD,
    element: 'conhecimento',
    sound: 'fearGaze',
    hitSound: 'impact',
    onHit: { label: 'SABER TUDO É PERDER TUDO', distort: true },
  },

  abilities: [
    {
      id: 'dimensaoSombras',
      name: 'Dimensão das Sombras',
      input: 'carga+jump', // △ + ×
      spamWindow: 8,
      spamMult: 1.6,
      type: 'teleportBehind',
      description: 'Some na própria sombra (a Onipresença da Máscara) e surge atrás do adversário, já podendo atacar.',
      energyCost: 22,
      cooldown: 6,
      distance: 1.5,
      vanishTime: 0.18,
      color: SHADOW,
    },
    {
      id: 'olharDesespero',
      name: 'Olhar do Desespero',
      input: 'carga+physical', // △ + ○
      type: 'fearGaze',
      description: 'A Máscara encara o adversário: quem estiver à frente fica paralisado por um instante, vulnerável a combo.',
      energyCost: 25,
      cooldown: 12,
      range: 8,
      arc: 70,
      windup: 0.4,
      recovery: 0.3,
      stun: 0.9,
      color: GOLD,
    },
    {
      id: 'controleMental',
      name: 'Controle Mental',
      input: 'block+jump', // R2 + ×
      type: 'mindControl',
      description: 'A Magistrada fala pelo corpo do alvo: por alguns segundos ele anda sozinho até ela e não consegue defender.',
      energyCost: 35,
      cooldown: 18,
      windup: 0.45,
      recovery: 0.3,
      range: 10,
      arc: 60,
      duration: 2.5,
      walkTo: true,
      noBlock: true,
      color: GOLD,
    },
    {
      id: 'dispersaoDano',
      name: 'Dispersão de Dano',
      input: 'carga+dodge', // △ + L2
      type: 'heavyProtection',
      description: 'A aura dourada se abre e os Sigilos giram em volta: por 5 s ela recebe METADE do dano e aguenta 1 golpe sem recuar.',
      energyCost: 30,
      cooldown: 22,
      duration: 5,
      takenMult: 0.5,
      armor: 1,
      color: GOLD,
    },
    {
      id: 'levitacao',
      name: 'Levitação',
      input: 'block+carga', // R2 + △
      type: 'levitation',
      description: 'Ergue a mão livre e as pedras do chão flutuam em volta dela; depois voam uma a uma contra o alvo (dá para defender ou sair da frente).',
      energyCost: 30,
      cooldown: 15,
      windup: 0.55,
      recovery: 0.3,
      stones: 5,
      interval: 0.16,
      speed: 24,
      range: 18,
      damage: 16,
      color: GOLD,
    },
  ],

  // PRISÃO DAS SOMBRAS: as sombras consomem o alvo e os dois ficam presos na esfera de Conhecimento — a bengala bate
  // até a esfera se fechar sobre ele
  special: {
    name: 'Prisão das Sombras',
    banner: 'Prisão das Sombras',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: GOLD,
    sound: 'specialStart',
    applyMeleePassives: false,
    prepare: { anim: 'charge', time: 0.35, fx: 'bladeGlow' },
    dash: { speed: 24, maxTime: 0.45, contact: 1.8 },
    hits: [
      { t: 0.7, anim: 'arn_open', dur: 0.3, share: 0.14, fx: { kind: 'slash', tilt: 0.1 }, sound: 'heavyPunch' },
      { t: 0.98, anim: 'arn_bowcut', dur: 0.36, share: 0.14, fx: { kind: 'slash', tilt: -0.2, flip: true }, sound: 'heavyPunch' },
      { t: 1.3, anim: 'arn_lunge', dur: 0.34, share: 0.16, fx: { kind: 'stab' }, sound: 'heavyPunch' },
      { t: 1.65, anim: 'arn_spin', dur: 0.45, share: 0.2, fx: { kind: 'slash', wide: true }, sound: 'heavyPunch' },
      { t: 2.15, anim: 'arn_final', dur: 0.55, share: 0.36, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.15,
    length: 3.0,
  },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): NOSTIS OMNIA PERDET OMNIA — a Máscara toma o corpo inteiro:
  // os rituais e o especial batem mais, as recargas correm e a sanidade volta depressa, até o fim do round
  awakening: {
    name: 'Saber Tudo é Perder Tudo',
    banner: 'Nostis Omnia Perdet Omnia',
    type: 'awakenMode',
    mult: 1.2, affects: ['ability', 'special', 'ranged'], cdRate: 1.4, energyRegenMult: 1.5, takenMult: 0.9, aura: 'sigil', color: GOLD, heal: 0.1,
  },

  passives: [
    { type: 'precognition' }, // Onipresença: sabe tudo o que acontece — não é pega desprevenida
  ],
};
