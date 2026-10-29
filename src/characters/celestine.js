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
    identity: 'A Rebelde: guerreira da Ordo Calamitas que trai sem pensar duas vezes e veste a Máscara do Desespero',
    tagline: 'Aproveita e reza pra deixar de ser chato... Chato!', // a fala dela em Calamidade (ep. 5)
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
      // ALIANÇA FALSA — a SALA DA MORTE dos jogos do Anfitrião (Calamidade ep. 6): "formava alianças e traía em seguida"
      id: 'aliancaFalsa',
      name: 'Aliança Falsa',
      input: 'carga+physical', // △ + ○
      type: 'falseAlliance',
      description: 'Baixa as machadinhas e estende a mão. Se o adversário atacar nesse instante, ela escapa, aparece nas costas dele e crava as duas machadinhas (não dá para defender) — a traição vale DOIS dados do Nada Pessoal. Se ninguém cair, ela debocha e fica aberta.',
      energyCost: 20,
      cooldown: 12,
      window: [0.12, 1.0],
      recovery: 0.35,
      offerAnim: 'point',
      strikeAnim: 'dual_cross',
      damage: 70,
      knockback: 2.6,
      hitstun: 0.8,
      stacks: 2,
      offerLabel: 'ALIANÇA?',
      missLabel: 'CHATO!',
      betrayLabel: 'NADA PESSOAL',
      element: 'conhecimento',
      color: BLUE,
    },
    {
      // CÓDIGO (ficha): "sussurra mensagens secretas que só a pessoa ouve" — o alvo fica distraído com o que ouviu
      id: 'codigo',
      name: 'Código',
      input: 'carga+dodge', // △ + L2
      type: 'analyze',
      buffType: 'codigo',
      label: 'CÓDIGO (CELESTINE)',
      description: 'Sussurra o Código no ouvido do adversário — a mensagem que só ele escuta. Distraído por 7 s: recebe 20% a mais de dano dos golpes físicos e TODO golpe dela conta como traição (Nada Pessoal).',
      energyCost: 25,
      cooldown: 18,
      range: 14,
      duration: 7,
      takenMult: 1.2,
      takenKinds: ['melee'],
      color: BLUE,
    },
    {
      // SALA DA MORTE — o jogo de Morte do Anfitrião: "uma caveira que eventualmente perseguirá os agentes"
      id: 'salaDaMorte',
      name: 'Sala da Morte',
      input: 'block+jump', // R2 + ×
      type: 'throwProjectile',
      anim: 'point',
      windup: 0.4,
      recovery: 0.3,
      sound: 'fearGaze',
      description: 'Chama a CAVEIRA da Sala da Morte: ela flutua devagar atrás do adversário por 5 s, batendo os dentes. Quem for alcançado leva um golpe pesado e cai — dá para fugir, esquivar ou se esconder atrás de algo.',
      energyCost: 30,
      cooldown: 16,
      element: 'morte',
      projectile: {
        visual: 'deathSkull',
        speed: 6.5,
        range: 33, // ~5 s no ar
        homing: 2.6,
        radius: 0.6,
        damage: 72,
        knockback: 3,
        hitstun: 0.9,
        launch: true, // derruba
        kind: 'ability',
        trail: 0x14101a,
        color: 0xd8d0bc,
        hitSound: 'heavyPunch',
      },
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
    // NADA PESSOAL (ficha): cada traição — acertar pelas costas ou no meio do ataque do adversário — soma um dado:
    // +7% de dano físico por dado, até 4 (12 s, renova a cada traição)
    { type: 'nothingPersonal', mult: 0.07, max: 4, time: 12 },
  ],
};
