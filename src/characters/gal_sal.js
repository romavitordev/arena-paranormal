// GAL SAL (id interno: gal_sal; personagem masculino) — lâminas + correntes de metal + puxão +
// cura invertida que drena sanidade + controle de espaço.
// Mecânica obrigatória no ataque físico:
//   o golpe tira X de vida do inimigo → o INIMIGO recupera Y de vida (Y < X)
//   → e perde Y × 1,5 de sanidade (energia). O Gal não se cura.
// X = dano do golpe (por acerto), Y = `heal` (por acerto). Totalmente determinístico.
// v2.0: Y −40% (telemetria: 25% de vitórias com o 2º maior dano causado — a cura devolvia ~¼ do dano).
export default {
  id: 'gal_sal',
  name: 'GAL SAL',
  model: 'gal_sal',
  color: '#d4a64a',
  origin: 'Escriptas', // organização (cânone)
  element: 'conhecimento', // afinidade elemental (ver config/elements.js)
  energyColor: 0xd4a64a,
  info: {
    weapon: 'Duas lâminas com correntes',
    style: 'Cortes, giros, lâminas lançadas e puxadas pelas correntes',
    identity: 'Lâminas + correntes + puxão + cura que drena a sanidade + controle de espaço',
    tagline: 'Toda ferida cobra um preço.',
  },
  stats: { moveSpeed: 8.0, attackSpeed: 1.1 },
  anims: { idle: 'idle_dual', run: 'run', charge: 'charge_dual', victory: 'vic_gal', block: 'block_weapon' },
  chargeFx: { style: 'blades', color: 0xd4a64a },
  dodge: { style: 'default' },
  // Bloqueio Perfeito: segurar a defesa no instante do golpe físico inimigo
  defense: { perfectBlock: { window: 0.15, counterStun: 0.7 } },

  melee: {
    name: 'Lâminas e correntes',
    strikes: [
      { name: 'Corte curto', anim: 'dual_r', dur: 0.3, active: [0.08, 0.17], damage: 34, heal: 5, range: 2.0, arc: 120, knockback: 1.2, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.1 } },
      { name: 'Corte alternado', anim: 'dual_l', dur: 0.3, active: [0.08, 0.17], damage: 34, heal: 5, range: 2.0, arc: 120, knockback: 1.2, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: -0.1, flip: true } },
      { name: 'Corte cruzado', anim: 'dual_cross', dur: 0.42, active: [0.14, 0.24], damage: 44, heal: 7, range: 2.1, arc: 100, knockback: 2.0, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { cross: true } },
      // dois acertos: X e Y valem por acerto (24 de dano e 6 de vida cada)
      { name: 'Ataque giratório', anim: 'dual_spin', dur: 0.55, actives: [[0.12, 0.24], [0.3, 0.44]], damage: 48, heal: 4, range: 2.2, arc: 360, knockback: 1.6, lunge: 0.8, sound: 'blade', hitSound: 'bladeHit', trail: { spin: true } },
      { name: 'Duas correntes', anim: 'chain_sweep', dur: 0.6, active: [0.24, 0.38], damage: 56, heal: 9, range: 3.6, arc: 160, lunge: 0.6, finisher: 'launch', chain: true, sound: 'slashFinal', hitSound: 'bladeHit', trail: { big: true, wide: true, radius: 3.2 } },
    ],
    // frente + ○: lança uma lâmina presa à corrente (alcance médio)
    up: { name: 'Lâminas para cima', anim: 'dual_both', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.1, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', heal: 7, hand: 'R' },
    down: { name: 'Cruz das lâminas', anim: 'dual_cross', dur: 0.52, active: [0.2, 0.32], damage: 46, range: 2.1, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactScale: 1.4, heal: 8 },
    forward: { name: 'Lançamento de lâmina', anim: 'chain_throw', dur: 0.46, active: [0.16, 0.3], damage: 32, heal: 5, range: 4.6, arc: 40, knockback: 2.4, chain: true, sound: 'chainThrow', hitSound: 'bladeHit' },
    // trás + ○: puxa a lâmina de volta trazendo o inimigo junto
    back: { name: 'Puxão da lâmina', anim: 'chain_pull', dur: 0.46, active: [0.08, 0.22], damage: 26, heal: 5, range: 4.6, arc: 40, knockback: 0, chain: true, onHit: { pull: true, after: 0.55 }, sound: 'chainPull', hitSound: 'bladeHit' },
    side: { name: 'Corte lateral alternado', anim: 'dual_alt', dur: 0.36, active: [0.1, 0.2], damage: 30, heal: 5, range: 2.0, arc: 120, knockback: 1.6, motion: [{ t: [0, 0.22], side: 2.4 }], sound: 'blade', hitSound: 'bladeHit', trail: { roll: 1.0 } },
    air: { name: 'Cruz aérea', anim: 'air_dual', dur: 0.4, active: [0.14, 0.3], damage: 36, heal: 6, range: 2.1, arc: 110, knockback: 3, slam: 15, vertical: 2.3, sound: 'blade', hitSound: 'bladeHit', trail: { cross: true } },
  },

  // □: CORRENTE (substitui o "Corte Projetado"): LANÇAR → PRENDER → PUXAR → COMBAR
  ranged: {
    // CORRENTE DE CAPTURA: procura o inimigo, prende, puxa para a distância de combo e abre a sequência
    // física. Dá para esquivar (L2) — e a curva é lenta, então desviar para o lado também funciona.
    name: 'Corrente de Captura',
    type: 'projectile',
    homing: 2.4, // rad/s de correção na direção do alvo
    anim: 'chain_throw',
    origin: 'hand',
    chain: true,
    windup: 0.16,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 25, // baixo: o valor está no combo que ela abre
    range: 15,
    speed: 38,
    radius: 0.45,
    spread: 0,
    knockback: 0,
    hitstun: 0.1,
    onHit: { pull: { distance: 1.4, time: 0.3, after: 0.7 } }, // prende e puxa para perto; janela de combo
    cooldown: 5,
    energyCost: 15,
    visual: 'chainHook',
    color: 0xd4a64a,
    sound: 'chainThrow',
    hitSound: 'chainPull',
    // trás + □: Ativar Ereshkigal (habilidade com recarga própria; recarregando, sai a Corrente de Captura)
    variants: { back: { ability: 'ativarEreshkigal' } },
  },

  abilities: [
    {
      // ATIVAR ERESHKIGAL (nome do usuário: as lâminas Ereshkigal do Gal) — liga por alguns segundos a regra do Gal: o golpe tira X, o inimigo recupera Y e
      // paga com sanidade (Y × 1,5), que vai para o Gal. Fora dela, o físico do Gal é normal.
      id: 'ativarEreshkigal',
      name: 'Ativar Ereshkigal',
      input: 'ranged+back', // trás + □
      type: 'selfBuff',
      buffType: 'ereshkigal',
      label: 'ERESHKIGAL',
      anim: 'charge_dual',
      animTime: 0.4,
      description: 'Por 6 s, cada golpe físico que acerta faz o inimigo recuperar parte da vida e pagar 1,5× isso em sanidade — que vai para o Gal.',
      energyCost: 15,
      cooldown: 14,
      duration: 6,
      ai: { max: 5 },
      color: 0xd4a64a,
    },
    {
      id: 'gancho',
      name: 'Corrente Gancho',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'chainSelfPull',
      description: 'Prende a corrente no adversário e puxa o PRÓPRIO Gal até o adversário, chegando com um corte cruzado.',
      energyCost: 20,
      cooldown: 8,
      range: 14,
      chainSpeed: 45,
      flySpeed: 26,
      damage: 28,
      hitstun: 0.5,
      color: 0xd4a64a,
    },
    {
      id: 'teletransporteGal',
      name: 'Teletransporte',
      input: 'block+jump', // R2 + × / RT + A
      type: 'sparkTeleport',
      description: 'Some em faíscas douradas e surge atrás do adversário, como fez com Arthur e Erin no orfanato.',
      energyCost: 22,
      cooldown: 9,
      distance: 1.6,
      vanishTime: 0.2,
      surpriseTime: 0.35,
      color: 0xffcf4a,
    },
    {
      id: 'controleMental',
      name: 'Controle Mental',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'mindControl',
      description: 'Um sigilo dourado sobre a cabeça do alvo: por alguns segundos o corpo dele obedece ao Gal — anda sozinho até ele e não consegue defender.',
      energyCost: 35,
      cooldown: 18, // buff v3.6 (era 24)
      windup: 0.45,
      recovery: 0.3,
      range: 10,
      arc: 60,
      duration: 3, // era 2,5
      walkTo: true, // o alvo anda até o Gal (antes: direções invertidas, que o faziam fugir)
      noBlock: true,
      color: 0xffcf4a,
    },
    {
      id: 'correnteGiratoria',
      name: 'Corrente Giratória',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'sweepStrike',
      description: 'Gira as duas lâminas presas às correntes em volta do corpo: três cortes em área, o último lança — o 1º giro laça e arrasta quem estiver perto.',
      energyCost: 25,
      cooldown: 11, // era 13
      anim: 'chain_sweep',
      startSound: 'chainThrow',
      windup: 0.2,
      hits: 3,
      interval: 0.16,
      recovery: 0.3,
      radius: 3.4,
      pull: 2.5, // laça até 2,5 m além do raio
      damage: 75,
      knockback: 6,
      launch: true,
      element: 'conhecimento',
      color: 0xd4a64a,
    },
    {
      // cânone: o Leque da Fatalidade dele é amaldiçoado com um Ritual de Velocidade Mortal
      id: 'velocidadeMortal',
      name: 'Velocidade Mortal',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'deadlySpeedTrail', // a mesma Velocidade Mortal melhorada do Guizo (pedido do usuário)
      label: 'VELOCIDADE MORTAL',
      description: 'O ritual do Leque da Fatalidade distorce o tempo em volta dele: por 6 s fica muito mais rápido, bate mais rápido, recupera as esquivas e deixa rastros dele no ar.',
      energyCost: 25,
      cooldown: 20,
      duration: 6,
      speedMult: 1.35,
      atkSpeed: 1.25,
      refillDodges: 4,
      anim: 'breath',
      animTime: 0.4,
      color: 0xa7a3ad,
    },
  ],

  // INJUSTIÇA — a cena do cânone (Desconjuração, ep. 6): o Controle Mental faz Joui ajoelhar numa reverência forçada,
  // o Gal diz "Injustiça, né? Muito prazer, eu sou a injustiça." e executa. Aqui: a corrente prende e puxa (dá para
  // esquivar/defender; se errar, não há cena), o sigilo do Controle Mental faz o alvo AJOELHAR, e a execução é precisa —
  // cada corte é sabido antes de acontecer (Bênção Maldita: o lampejo dourado marca o impacto) — até a cruz final com as
  // correntes tensas, que derruba o alvo. Dano (250), custo e recarga iguais aos de antes; o dano cai em cada impacto.
  special: {
    name: 'Injustiça né?',
    banner: 'Injustiça né?', // curto: a fala inteira não cabe na faixa do banner
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: 0xd4a64a,
    sound: 'specialStart',
    // O especial NÃO aplica o dreno X/Y. Para ativar no futuro: applyMeleePassives: true
    applyMeleePassives: false,
    approach: 'chain', // lança a lâmina, prende e puxa
    chain: { speed: 55, range: 16 },
    prepare: { anim: 'charge_dual', time: 0.3, fx: 'bladeGlow' },
    hits: [
      // o Controle Mental: o Gal aponta, o sigilo acende e o alvo ajoelha (sem dano)
      { t: 0.1, noHit: true, anim: 'point', dur: 1.0, victimAnim: 'forced_kneel', sigil: true },
      // a execução: três cortes no alvo ajoelhado, cada um anunciado pelo lampejo dourado
      { t: 1.15, anim: 'dual_r', dur: 0.3, share: 0.15, foresee: true, victimAnim: 'forced_kneel', push: 0, fx: { kind: 'slash', tilt: 0.15, chain: 'R' }, sound: 'bladeHit', shot: 0 },
      { t: 1.45, anim: 'dual_l', dur: 0.3, share: 0.15, foresee: true, victimAnim: 'forced_kneel', push: 0, fx: { kind: 'slash', tilt: -0.15, flip: true, chain: 'L' }, sound: 'bladeHit' },
      { t: 1.78, anim: 'dual_both', dur: 0.4, share: 0.2, foresee: true, victimAnim: 'stagger', push: 0.1, fx: { kind: 'slash', big: true }, sound: 'bladeHit', shot: 1 },
      // a cruz final com as duas correntes tensas: o alvo cai
      { t: 2.3, anim: 'dual_cross', dur: 0.42, share: 0.5, foresee: true, fx: { kind: 'cross', big: true, chain: 'both' }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.55,
    length: 3.1,
    shots: 'control',
    endReaction: { knockback: 3, lowLaunch: true },
  },

  // DESPERTAR (Barra de Transformação cheia + vida baixa, segurando △) — cânone (Calamidade): Afinidade com Precognição —
  // defesa a mais contra golpes de perto E de longe (takenMult) e NÃO PODE MAIS SER PEGO DESPREVENIDO (a passiva
  // precognition: sem bônus de costas nem "surpreso" depois de teletransportes). A antecipação também aparece no
  // Bloqueio Perfeito: a janela abre um pouco mais (0,15 → 0,2 s). Velocidade +10% (era +15%: a força agora está na
  // leitura da luta, não nos números). Até o fim do round.
  awakening: {
    // nome do estado: "O Realizador do Destino" (apelido oficial do Gal na wiki); o poder é a Afinidade com Precognição
    name: 'O Realizador do Destino',
    banner: 'O Realizador do Destino',
    type: 'awakenMode',
    anim: 'charge_dual',
    mult: 1.1, takenMult: 0.85, speedMult: 1.1, aura: 'sigil', color: 0xffcf4a, heal: 0.1,
    passives: [{ type: 'precognition' }],
    perfectBlockWindow: 0.2,
    glowMat: 'blindfold', // as marcas douradas da venda acendem e pulsam enquanto durar
  },

  passives: [
    { type: 'bulletDodge' }, // Desviar de Balas: esquivar de projéteis não gasta carga
    // a cura que cobra sanidade NÃO é mais passiva (pedido do usuário): só vale com a Ereshkigal ativada
    { type: 'meleeDrain', energyRatio: 1.5, giveEnergyToAttacker: true, whileBuff: 'ereshkigal' },
  ],
};
