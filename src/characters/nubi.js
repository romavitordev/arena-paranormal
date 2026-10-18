// NUBI (id: nubi) — ESCRIPTAS. Ocultista de Morte que cresceu no Orfanato Santa Menefreda; irmã do Gregory, Escripta
// sob Kian (wiki "Nubi"). O ritual feito em Nina distorceu a percepção de tempo dela: cada segundo dura horas na mente.
// Na Mansão Leone (Calamidade ep. 10): desvia do tiro do Arthur, explica a condição dela com calma e conjura um ritual —
// o Lodo sai dos olhos e da boca dela (e dos corpos dos aliados), junta numa poça e dela sobe o CARNIÇAL DA ESFINGE.
// Aparência: mulher negra, rabo de cavalo, olhos pretos com uma faixa preta descendo de cada olho, "Morte" na testa,
// tatuagens dos Escriptas, joias de ouro, manto preto, descalça e a bengala com a cabeça de chacal dourada.
// CÂNONE × ADAPTAÇÃO: cânone = a aparência, a afinidade com Morte, a bengala de chacal, a percepção de tempo, o Lodo dos
// olhos e da boca e o Carniçal da Esfinge. Adaptação do jogo = os nomes dos golpes, o combo, os números, a Decadência
// (ritual de Morte compartilhado com o Dante e o Guizo) e o Ritual de Drenagem (inspirado no que ela fez em Nina — não é
// uma técnica de combate confirmada). Ela NÃO controla o tempo: os efeitos de tempo aqui são secundários.
// Modelo próprio do Blender (public/models/nubi.glb, tools/blender/char_nubi.py), com a bengala no próprio modelo.
const LODO = 0x0c0a0e;
const GOLD = 0xd8b04a;
const MORTE = 0x8a8494;

export default {
  id: 'nubi',
  name: 'NUBI',
  model: 'nubi',
  color: '#c9a640',
  origin: 'Escriptas', // organização (cânone): o culto do Kian
  element: 'morte',
  energyColor: 0x7a7088,
  info: {
    weapon: 'A bengala da cabeça de chacal',
    style: 'Bengala em golpes deliberados, Lodo dos olhos e da boca, calma absoluta',
    identity: 'Escripta de Morte: para ela cada segundo dura horas — nada a apressa',
    tagline: 'Cada segundo de vocês são horas pra mim.',
  },
  stats: { moveSpeed: 7.3, attackSpeed: 1.0 },
  anims: { idle: 'idle_nubi', run: 'run', charge: 'nubi_ritual', victory: 'vic_nubi', block: 'block_weapon' },
  chargeFx: { style: 'default', color: 0x7a7088 },
  // DESVIO IMPERTURBÁVEL (adaptação do tiro desviado na Mansão Leone): a esquiva dela é um passo curto e calmo, com o
  // rastro escuro — usa a esquiva normal do jogo (mesma invulnerabilidade curta, mesmas 4 cargas)
  dodge: { style: 'calm', name: 'Passo Imperturbável', distance: 3.4 },

  melee: {
    name: 'Bengala Ritualística',
    // golpes deliberados, sem acrobacia: horizontal, volta com a outra ponta, passo e pancada curta no tronco, e a batida
    // de baixo para cima que afasta (o Lodo respinga no último)
    strikes: [
      { name: 'Pancada horizontal', anim: 'slash_h', dur: 0.32, active: [0.1, 0.19], damage: 26, range: 2.1, arc: 130, knockback: 0.9, lunge: 0.9, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, tilt: 0.05 } },
      { name: 'Ponta de volta', anim: 'slash_h_back', dur: 0.32, active: [0.1, 0.19], damage: 26, range: 2.1, arc: 130, knockback: 0.9, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0x2a2028, flip: true } },
      { name: 'Passo e pancada no tronco', anim: 'thrust', dur: 0.34, active: [0.11, 0.2], damage: 30, range: 2.0, arc: 80, knockback: 1.0, lunge: 1.3, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Batida ascendente', anim: 'slash_up', dur: 0.48, active: [0.16, 0.28], damage: 56, range: 2.2, arc: 120, lunge: 1.0, finisher: 'launch', hitstop: 0.1, element: 'morte', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.4, trail: { color: LODO, tilt: -1.3, big: true } },
    ],
    up: { name: 'Bengala de baixo', anim: 'slash_up', dur: 0.44, active: [0.15, 0.27], damage: 38, range: 2.2, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, tilt: -1.3 } },
    down: { name: 'Bengala fincada', anim: 'slash_v', dur: 0.5, active: [0.19, 0.3], damage: 46, range: 2.2, arc: 110, lunge: 0.9, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactFx: 'smash', impactScale: 1.3, trail: { color: LODO, roll: 1.5 } },
    forward: { name: 'Passo calmo', anim: 'dash_slash', dur: 0.44, active: [0.13, 0.25], damage: 34, range: 2.2, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.22], fwd: 4.6, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, tilt: 0.1 } },
    back: { name: 'Recuo e ponta', anim: 'thrust', dur: 0.5, active: [0.28, 0.38], damage: 32, range: 2.1, arc: 70, knockback: 2.2, iframes: [0, 0.22], motion: [{ t: [0, 0.2], back: 2.4 }], sound: 'swing', hitSound: 'heavyPunch' },
    side: { name: 'Giro do manto', anim: 'slash_h', dur: 0.46, active: [0.12, 0.3], damage: 30, range: 2.2, arc: 300, knockback: 1.6, motion: [{ t: [0, 0.25], side: 2.4 }], sound: 'swing', hitSound: 'heavyPunch', trail: { color: 0x2a2028, wide: true } },
    air: { name: 'Bengala no ar', anim: 'air_slash', dur: 0.42, active: [0.15, 0.32], damage: 34, range: 2.2, arc: 100, knockback: 3, slam: 15, vertical: 2.3, sound: 'swing', hitSound: 'heavyPunch', trail: { color: GOLD, roll: 1.5 } },
  },

  // □: LODO DA MORTE (cânone: o Lodo que sai dos olhos e da boca dela) — uma massa compacta de Lodo Preto, com
  // tentáculos curtos, voa até o alvo, envolve por um instante (atordoa curto) e cai no chão
  ranged: {
    name: 'Lodo da Morte',
    type: 'projectile',
    anim: 'point',
    origin: 'chest',
    windup: 0.36,
    recovery: 0.32,
    count: 1,
    interval: 0,
    damage: 38,
    range: 15,
    speed: 17,
    radius: 0.55,
    spread: 0,
    knockback: 0.4,
    hitstun: 0.45,
    cooldown: 3.2,
    energyCost: 0,
    visual: 'lodoMass',
    color: LODO,
    element: 'morte',
    sound: 'drain',
    hitSound: 'impact',
    onHit: { stun: 0.45, stunAnim: 'stagger', label: 'LODO DA MORTE' },
  },

  abilities: [
    {
      // DESVIO IMPERTURBÁVEL (adaptação do tiro do Arthur desviado na Mansão Leone): uma janela curta de calma — se um
      // golpe chegar nela, ela sai da frente com um passo (a Substituição do jogo, sem gastar esquivas). Precisa de
      // tempo certo; não vale contra especiais
      id: 'desvioImperturbavel',
      name: 'Desvio Imperturbável',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'calmEvade',
      description: 'Fica imóvel por um instante, olhando: se um golpe ou tiro chegar nessa janela, ela desvia com um passo calmo, sem gastar esquiva. Não vale contra especiais.',
      energyCost: 15,
      cooldown: 12,
      window: 0.45,
    },
    {
      // DECADÊNCIA: o ritual de Morte do Dante e do Guizo (afinidade de Morte = rituais de Morte sem ingredientes)
      id: 'decadenciaNubi',
      name: 'Decadência',
      input: 'carga+physical', // △ → ○ / Y → B
      type: 'decadence',
      description: 'Espirais de Morte surgem em volta do alvo, apertam e ele DEFINHA (dano de Morte e uma decadência curta depois). Dá para esquivar quando as espirais fecham.',
      energyCost: 25,
      cooldown: 10,
      cast: 0.62,
      range: 9,
      damage: 58,
      decay: { dps: 4, duration: 3 },
      element: 'morte',
      color: MORTE,
      ai: { max: 8.5 },
    },
    {
      // LODO QUE PRENDE (cânone: o Lodo Preto que sai do rosto dela e dos corpos em volta e forma a poça): a poça abre
      // embaixo do alvo e o Lodo sobe em tentáculos que prendem e apertam (o mesmo ritual dos Tentáculos do Dante, mais
      // fraco e mais rápido de recarregar — o Lodo dela é menos denso)
      id: 'lodoPrende',
      name: 'Lodo que Prende',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'lodoTentacles',
      description: 'O Lodo escorre do rosto dela até o chão e brota embaixo do inimigo em tentáculos que prendem e apertam.',
      energyCost: 25,
      cooldown: 12,
      range: 9,
      radius: 1.8,
      castTime: 0.55,
      hold: 0.9,
      damage: 52,
      stun: 1.1,
      color: 0x0a080c,
    },
    {
      // SENTENÇA DO CHACAL (adaptação: a bengala de cabeça de chacal, onde o ritual está gravado): passo firme e a
      // pancada de cima com a cabeça de chacal — a Morte fica no ferimento e o alvo não se cura por um tempo
      id: 'sentencaChacal',
      name: 'Sentença do Chacal',
      input: 'block+jump', // R2 + × / RT + A
      type: 'heavyBlow',
      description: 'Um passo firme e a pancada de cima com a cabeça de chacal da bengala. A Morte fica no ferimento: o alvo não se cura por 8 s. Aguenta um golpe na preparação.',
      energyCost: 25,
      cooldown: 13,
      anim: 'slash_v',
      duration: 0.9,
      armorFrom: 0.1,
      impact: 0.36,
      step: 5,
      stepTime: 0.3,
      track: true,
      range: 2.4,
      arc: 130,
      damage: 58,
      knockback: 2.2,
      element: 'morte',
      noHeal: 8,
      whiffRecovery: 0.4,
      hitSound: 'heavyPunch',
      color: 0xd8b04a,
    },
    {
      // RITUAL DE DRENAGEM (adaptação inspirada em Nina: "sugou todo o meu tempo"): finca a bengala, a marca de Lodo
      // abre sob o alvo e os filamentos fecham — o corpo dele fica lento por pouco tempo (o mesmo efeito do Senhor do
      // Tempo do Deus da Morte, mais curto e mais fraco)
      id: 'ritualDrenagem',
      name: 'Ritual de Drenagem',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'timeWarp',
      description: 'Finca a bengala: a marca de Lodo abre embaixo do alvo e os filamentos fecham — ele fica LENTO por 2,5 s.',
      energyCost: 25,
      cooldown: 16,
      range: 12,
      slow: 0.6,
      duration: 2.5,
    },
  ],

  // AFINIDADE COM A MORTE (cânone: a afinidade elemental dela): rituais mais fortes e o tempo de recarga correndo mais
  // rápido para ela (a percepção de tempo distorcida, em versão de jogo) — o mesmo modelo, com os OLHOS TODOS PRETOS e o
  // Lodo escorrendo do rosto (face_nubi_open)
  awakening: {
    name: 'Afinidade com a Morte',
    banner: 'Afinidade com a Morte',
    type: 'awakenMode',
    mult: 1.15, affects: ['ability', 'special', 'ranged'], cdRate: 1.4, energyRegenMult: 1.4, aura: 'smoke', color: 0x5a5262, heal: 0.1,
    face: ['face_nubi', 'face_nubi_open'], eyeDrip: 0x0a080c,
  },

  passives: [
    { type: 'elementalAffinity', mult: 1.1 }, // Afinidade Elemental (Morte): rituais 10% mais fortes
  ],

  // CARNIÇAL DA ESFINGE (cânone, Calamidade ep. 10): o Lodo sai dos olhos e da boca dela, escorre, forma a poça e dela
  // sobe o Carniçal da Esfinge — salta no alvo e ataca por um tempo; depois volta a ser Lodo (specials/sphinx.js)
  special: {
    name: 'Carniçal da Esfinge',
    banner: 'Carniçal da Esfinge',
    type: 'sphinx',
    energyCost: 50,
    cooldown: 50,
    duration: 35, // tempo de sobra para os enigmas das 3 marcas (o relógio para enquanto ela está paralisada)
    hp: 480,
    color: LODO,
  },
};
