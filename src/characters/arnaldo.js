// ARNALDO FRITZ (id: arnaldo) — ator famoso que usava a fama como fachada; um dos agentes mais experientes da Ordo
// Realitas, dos Aniquiladores (com o Senhor Veríssimo). Ocultista. Pai do Thiago Fritz.
// Luta com a ESPADA comum da fita vermelha no cabo (a mesma que o Veríssimo herda depois) — esgrima TEATRAL: cortes
// largos, estocadas e floreios "de palco" — e com o Emissor de Pulsos Paranormais (Sigilos de Conhecimento que
// atraem ou afastam).
// TRANSFORMAÇÃO (pedido do usuário): tira o relógio de bolso de ouro, abre a tampa e lá dentro está a Relíquia de
// Energia — vira O ANFITRIÃO até o fim do round, com um kit totalmente novo (forms/anfitriao.js).
// Modelo PROVISÓRIO: corpo do Joui (casaco longo) + acessórios (models/props.js addArnaldoProps) até o .glb próprio.
const GOLD = 0xe0b040;
const RED = 0xc0141c;

export default {
  id: 'arnaldo',
  name: 'ARNALDO FRITZ',
  model: 'arnaldo',
  color: '#c0141c',
  origin: 'Ordo Realitas',
  element: 'conhecimento',
  energyColor: GOLD,
  info: {
    weapon: 'Espada da fita vermelha e o Emissor de Pulsos Paranormais',
    style: 'Esgrima teatral de veterano: cortes largos, estocadas, fintas e o puxa-empurra do Emissor',
    identity: 'Aniquilador da Ordo Realitas: na Transformação, o relógio de bolso guarda a Relíquia e ele vira O Anfitrião',
    tagline: 'Senhoras e senhores, o espetáculo vai começar.',
  },
  stats: { moveSpeed: 8.2, attackSpeed: 1.05, maxHealth: 1000 },
  anims: { idle: 'idle_arnaldo', run: 'run', charge: 'charge', victory: 'victory', block: 'block_weapon' },
  chargeFx: { style: 'default', color: GOLD },
  dodge: { style: 'default', distance: 4.6 },

  melee: {
    name: 'Espada da fita vermelha',
    // ator + espadachim experiente: elegante e preciso, com floreios e reverências — mas sem virar dança
    strikes: [
      { name: 'Abertura de Cena', anim: 'arn_open', dur: 0.32, active: [0.1, 0.19], damage: 26, range: 2.15, arc: 140, knockback: 1.1, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8dde4, tilt: 0.05 } },
      { name: 'Estocada de Palco', anim: 'arn_lunge', dur: 0.36, active: [0.13, 0.22], damage: 28, range: 2.6, arc: 50, knockback: 1.4, lunge: 1.7, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Corte em Reverência', anim: 'arn_bowcut', dur: 0.42, active: [0.12, 0.2], damage: 28, range: 2.15, arc: 140, knockback: 1.2, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8dde4, flip: true } },
      { name: 'Floreio', anim: 'arn_flourish', dur: 0.42, actives: [[0.12, 0.2], [0.26, 0.34]], damage: 34, range: 2.2, arc: 160, knockback: 1.4, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: RED, roll: 0.9 } },
      { name: 'Ato Final', anim: 'arn_final', dur: 0.62, active: [0.3, 0.4], damage: 60, range: 2.5, arc: 110, lunge: 1.9, finisher: 'launch', hitstop: 0.12, sound: 'slashFinal', hitSound: 'heavyPunch', impactScale: 1.9, trail: { color: RED, roll: 1.5, big: true } },
    ],
    up: { name: 'Corte Ascendente', anim: 'slash_up', dur: 0.44, active: [0.15, 0.27], damage: 38, range: 2.2, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: RED, tilt: -1.3 } },
    down: { name: 'Golpe de Cena', anim: 'slash_v', dur: 0.5, active: [0.19, 0.3], damage: 46, range: 2.2, arc: 110, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactScale: 1.4, trail: { color: RED, roll: 1.5 } },
    forward: { name: 'Entrada Triunfal', anim: 'dash_slash', dur: 0.42, active: [0.12, 0.24], damage: 36, range: 2.2, arc: 130, knockback: 2.4, motion: [{ t: [0, 0.22], fwd: 4.8, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd8dde4, tilt: 0.1, wide: true } },
    // esquiva elegante para trás (um passo de esgrima, não teletransporte) e volta na estocada
    back: { name: 'Mesura e Estocada', anim: 'arn_lunge', dur: 0.55, active: [0.32, 0.42], damage: 40, range: 2.5, arc: 60, knockback: 2.4, iframes: [0, 0.24], motion: [{ t: [0, 0.18], back: 2.2 }, { t: [0.24, 0.38], fwd: 2.8, stopClose: true }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Rodopio', anim: 'arn_spin', dur: 0.5, active: [0.12, 0.36], damage: 32, range: 2.3, arc: 360, knockback: 1.8, motion: [{ t: [0, 0.25], side: 2.4 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: RED, wide: true } },
    air: { name: 'Corte Aéreo', anim: 'air_slash', dur: 0.42, active: [0.15, 0.32], damage: 36, range: 2.2, arc: 100, knockback: 3.2, slam: 16, vertical: 2.4, sound: 'blade', hitSound: 'bladeHit', trail: { color: RED, roll: 1.5 } },
  },

  // □: EMISSOR DE PULSOS PARANORMAIS (cânone: caixa com Sigilos de Conhecimento que atrai criaturas de um elemento e
  // afasta as do oposto). Parado: o pulso ATRAI o alvo até a ponta da espada. ← + □: o pulso AFASTA.
  ranged: {
    name: 'Emissor de Pulsos Paranormais',
    type: 'projectile',
    anim: 'arn_emit',
    showProp: 'emitter',
    origin: 'handL',
    windup: 0.26,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 18,
    range: 14,
    speed: 26,
    radius: 0.6,
    spread: 0,
    knockback: 0,
    hitstun: 0.3,
    cooldown: 3.2,
    energyCost: 0,
    visual: 'shockwave',
    color: GOLD,
    element: 'conhecimento',
    sound: 'shockwave',
    hitSound: 'impact',
    // atrair → posicionar → atacar: quando o alvo chega, a Estocada de Palco já sai
    onHit: { pull: { distance: 1.9, time: 0.28, after: 0.5, anim: 'arn_emit', sound: 'ritual', follow: { name: 'Estocada do Emissor', anim: 'arn_lunge', dur: 0.36, active: [0.1, 0.2], damage: 30, range: 2.6, arc: 60, knockback: 2.2, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit' } } },
    variants: {
      back: { label: 'AFASTAR!', damage: 26, knockback: 8, hitstun: 0.6, launch: true, onHit: null, color: 0x7ad0ff }, // joga longe e derruba
    },
  },

  abilities: [
    {
      // técnica de esgrima: provoca com a mão livre, avança e o corte real entra pela guarda aberta
      id: 'fintaTeatral',
      name: 'Finta Teatral',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'dashStrike',
      description: 'Provoca com a mão livre, avança e, quando o adversário reage, o corte de verdade entra pela guarda — quebra a defesa.',
      energyCost: 20,
      cooldown: 10,
      preludeAnim: 'arn_taunt',
      anim: 'dash_slash',
      windup: 0.36,
      distance: 6,
      speed: 22,
      recovery: 0.32,
      range: 2.2,
      damage: 55,
      knockback: 3,
      guardBreak: true,
      hitSound: 'bladeHit',
      color: RED,
    },
    {
      // o Emissor no máximo: a onda ATRAI quem está longe (e a estocada já sai) ou REPELE quem está perto
      id: 'pulsoParanormal',
      name: 'Pulso Paranormal',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'polarize',
      description: 'O Emissor de Pulsos no máximo: o alvo LONGE é atraído e recebe a estocada assim que chega; o alvo PERTO é jogado longe e cai.',
      energyCost: 25,
      cooldown: 12,
      anim: 'arn_emit',
      prop: 'emitter',
      windup: 0.4,
      recovery: 0.3,
      range: 11,
      near: 3,
      pullDamage: 20,
      pushDamage: 50,
      follow: { name: 'Estocada do Pulso', anim: 'arn_lunge', dur: 0.36, active: [0.1, 0.2], damage: 36, range: 2.6, arc: 60, knockback: 2.6, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit' },
      color: GOLD,
    },
    {
      id: 'rodopioFita',
      name: 'Rodopio da Fita',
      input: 'block+jump', // R2 + × / RT + A
      type: 'sweepStrike',
      description: 'Gira com a espada aberta — a fita vermelha acompanha o giro: dois cortes em área, o último joga longe.',
      energyCost: 20,
      cooldown: 11,
      anim: 'arn_spin',
      startSound: 'blade',
      windup: 0.12,
      hits: 2,
      interval: 0.22,
      recovery: 0.3,
      radius: 3,
      damage: 60,
      color: RED,
    },
    {
      // a postura muda: mais baixo, olhar fixo, golpes mais rápidos e fortes (o efeito vem da animação, não de aura)
      id: 'aniquilador',
      name: 'Aniquilador',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'selfBuff',
      buffType: 'annihilator',
      label: 'ANIQUILADOR',
      anim: 'arn_focus',
      animTime: 0.7,
      trail: false,
      description: 'O veterano dos Aniquiladores aparece: por 7 s a postura fica agressiva, os golpes físicos saem 15% mais rápidos e 15% mais fortes, e ele recupera uma esquiva.',
      energyCost: 25,
      cooldown: 20,
      duration: 7,
      damageMult: 1.15,
      affects: ['melee'],
      atkSpeed: 1.15,
      refillDodges: 1,
      color: GOLD,
    },
    {
      // a experiência de quem já ensaiou a cena: postura controlada, estável, difícil de interromper
      id: 'ensaio',
      name: 'Ensaio Geral',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'selfBuff',
      buffType: 'rehearsal',
      label: 'ENSAIO GERAL',
      anim: 'arn_guard',
      animTime: 0.5,
      sound: 'perfectBlock',
      description: 'Já ensaiou essa cena: por 6 s recebe 20% menos dano, é empurrado bem menos e aguenta 2 golpes sem recuar.',
      energyCost: 20,
      cooldown: 18,
      duration: 6,
      takenMult: 0.8,
      knockbackTakenMult: 0.5,
      armor: 2,
      color: GOLD,
    },
  ],

  // ATO FINAL: uma execução teatral (specials/actFinal.js)
  special: {
    name: 'Ato Final',
    banner: 'Fecham-se as cortinas!',
    type: 'actFinal', // silêncio → reverência → avanço (esquivável) → 4 golpes → atravessa e o impacto chega depois
    energyCost: 50,
    cooldown: 14,
    color: RED,
    speed: 22,
    maxDash: 0.55,
    contact: 2.0,
  },

  // TRANSFORMAÇÃO (Barra de Transformação cheia + vida baixa, segurando △): o relógio de bolso, a Relíquia de Energia
  // lá dentro e O ANFITRIÃO até o fim do round (kit inteiro novo)
  awakening: {
    name: 'A Relíquia do Relógio',
    banner: 'O Anfitrião',
    type: 'maskTransform',
    scene: 'watch',
    prop: 'watch',
    form: 'anfitriao',
    formBanner: 'O ANFITRIÃO',
    color: 0xb04aff,
    tint: 0xb04aff,
    bonusHealth: 60,
  },

  passives: [],
};
