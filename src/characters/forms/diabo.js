// O DIABO — O PORTADOR DO TRONO (Juan, fim de Hexatombe). Não aparece na seleção: com o especial RENASCIMENTO o Juan
// sobe no Trono do Diabo (Relíquia de Sangue) e vira esta forma até o fim do round. Quatro braços com garras, asas de
// braços vermelhos, Coroa de Espinhos dourada, chifres em foice, pernas de bode.
// Poderes do Portador (wiki): Ódio do Diabo, Sangue nos Arredores, Transportar pelo Sangue, Veias de Sangue,
// Regeneração, Amaldiçoar Arma (toda garra faz sangrar), Senhor do Sangue e o Pacto.
export default {
  id: 'diabo',
  form: true,
  baseId: 'juan',
  name: 'O DIABO (JUAN)',
  model: 'diabo',
  color: '#a01818',
  origin: 'Relíquia de Sangue',
  element: 'sangue',
  energyColor: 0xff2a3d,
  info: {
    weapon: 'Quatro braços com garras',
    style: 'Garras em sequência, correntes de sangue nas veias e teleporte pelas poças de sangue',
    identity: 'O Portador do Trono: fica assim até o fim do round',
    tagline: 'Um novo começo.',
  },
  stats: { moveSpeed: 8.0, size: 1.35, maxHealth: 1150 }, // 1250 → 1150 na v2.2 (82–86% de vitórias como Diabo)
  // Regeneração (cânone: "quando fraco ou ferido"): mais rápida abaixo de 40% de vida e o dobro em cima das poças dele
  regen: { every: 6, amount: 22, color: 0x7a0010, low: { below: 0.4, every: 3.5, amount: 34 }, onPool: 2 },
  // animações próprias (anim/formClips.js); os nomes genéricos usados pelas habilidades também são trocados
  anims: { idle: 'db_idle', run: 'db_run', walk: 'db_run', walk_back: 'db_walk_back', strafe_L: 'db_strafe_L', strafe_R: 'db_strafe_R', dash: 'db_dash', charge: 'db_charge', concentrate: 'db_charge', victory: 'db_victory', block: 'db_block', block_hit: 'db_block_hit', point: 'db_point', throw_r: 'db_throw', powerup: 'db_powerup', dual_cross: 'db_cross', cast_up: 'db_powerup' },
  chargeFx: { style: 'default', color: 0xff2a3d },
  // Amaldiçoar Arma: as garras amaldiçoadas pingam sangue o tempo todo (Fighter.updateDrips)
  drips: { sockets: ['handR', 'handL'], color: 0xa01018, every: 0.09 },
  dodge: { style: 'default', distance: 5.2 },

  melee: {
    name: 'Garras do Diabo',
    strikes: [
      { name: 'Garra direita', anim: 'db_claw_r', dur: 0.28, active: [0.08, 0.16], damage: 32, range: 2.2, arc: 120, knockback: 1.0, lunge: 1.3, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, tilt: 0.05 } },
      { name: 'Garra esquerda', anim: 'db_claw_l', dur: 0.28, active: [0.08, 0.16], damage: 32, range: 2.2, arc: 120, knockback: 1.0, lunge: 1.2, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, flip: true } },
      { name: 'Quatro garras', anim: 'db_cross', dur: 0.4, actives: [[0.1, 0.17], [0.22, 0.3]], damage: 48, range: 2.2, arc: 130, knockback: 1.2, lunge: 1.1, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, roll: 0.8 } },
      { name: 'Rasgar', anim: 'db_rend', dur: 0.55, active: [0.22, 0.34], damage: 70, range: 2.3, arc: 140, lunge: 1.8, finisher: 'launch', bleed: { dps: 8, duration: 3 }, hitstop: 0.1, sound: 'slashFinal', hitSound: 'clawHit', impactScale: 1.8, trail: { color: 0x7a0010, roll: 1.4, big: true } },
    ],
    up: { name: 'Garra ascendente', anim: 'db_up', dur: 0.4, active: [0.13, 0.24], damage: 44, range: 2.2, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit' },
    down: { name: 'Cravar as garras', anim: 'db_down', dur: 0.46, active: [0.18, 0.28], damage: 50, range: 2.2, arc: 120, lunge: 1, finisher: 'knockdown', bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', impactScale: 1.5 },
    air: { name: 'Mergulho do Diabo', anim: 'db_air', dur: 0.42, active: [0.13, 0.3], damage: 40, range: 2.2, arc: 120, knockback: 3, slam: 16, vertical: 2.5, bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit' },
  },

  // □: LANÇA DE SANGUE — uma lança de sangue coagulado com farpas. Empala (prende os pés por um instante), faz
  // sangrar, fica cravada na parede e deixa uma POÇA DE SANGUE onde para (passagem do Transportar pelo Sangue).
  // Direção + □: para a frente = Lança Cravada (pesada); para os lados = Quatro Lanças (uma de cada braço);
  // para trás = salta para trás e arremessa.
  ranged: {
    name: 'Lança de Sangue',
    type: 'projectile',
    anim: 'db_throw',
    windup: 0.22,
    recovery: 0.26,
    count: 1,
    interval: 0.1,
    damage: 30,
    range: 22,
    speed: 46,
    radius: 0.42,
    spread: 0,
    knockback: 1.6,
    hitstun: 0.4,
    cooldown: 1.9,
    energyCost: 0,
    visual: 'bloodSpear',
    color: 0xff2a3d,
    element: 'sangue',
    stick: true,
    pool: { radius: 1.0, life: 8 },
    onHit: { impale: { time: 0.55, mult: 0.1 }, bleed: { dps: 3, duration: 1.5 } },
    sound: 'knifeThrow',
    hitSound: 'clawHit',
    variants: {
      forward: { label: 'LANÇA CRAVADA', windup: 0.38, damage: 46, speed: 40, radius: 0.5, knockback: 4.5, hitstun: 0.55, impactScale: 1.6, pool: { radius: 1.5, life: 10 }, onHit: { impale: { time: 0.9, mult: 0.05 }, bleed: { dps: 6, duration: 2.5 } }, cooldown: 3.2 },
      side: { label: 'QUATRO LANÇAS', count: 4, interval: 0.07, damage: 13, speed: 44, spread: 0.14, radius: 0.36, knockback: 1, hitstun: 0.25, pool: null, onHit: { bleed: { dps: 2, duration: 1.5 } }, motion: [{ t: [0, 0.4], side: 3.2 }], cooldown: 2.6 },
      back: { label: 'LANÇA E RECUO', windup: 0.12, damage: 24, motion: [{ t: [0, 0.3], back: 3.6 }], onHit: { impale: { time: 0.4, mult: 0.15 } }, cooldown: 2.4 },
    },
  },

  abilities: [
    {
      id: 'veiasSangue',
      name: 'Veias de Sangue',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'veinChains',
      description: 'O sangue rompe as veias do alvo e vira correntes que saem do peito dele e se cravam no chão: fica preso por um instante.',
      energyCost: 25,
      cooldown: 13,
      windup: 0.3,
      range: 12,
      arc: 50,
      hold: 1.3,
      damage: 36,
    },
    {
      id: 'odioDiabo',
      name: 'Ódio do Diabo',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'devilHate',
      anim: 'db_powerup',
      // cânone: o Diabo faz o ALVO sentir um ódio paranormal extremo, mais forte — e cego de raiva
      description: 'Enche o adversário de um ódio paranormal por 6 s: ele bate 10% mais forte, mas não defende, não usa rituais e leva 20% a mais de dano. O Diabo se alimenta do ódio: +15% de dano e mais velocidade enquanto durar.',
      energyCost: 25,
      cooldown: 18,
      range: 11,
      arc: 70,
      duration: 6,
      enragedMult: 1.1,
      ai: { max: 10 }, // CPU: só com o alvo ao alcance da mira
      takenMult: 1.2,
      selfMult: 1.15,
      selfSpeed: 1.12,
      color: 0xff2a3d,
    },
    {
      id: 'transportarSangue',
      name: 'Transportar pelo Sangue',
      input: 'block+jump', // R2 + × / RT + A
      type: 'bloodTransport',
      description: 'Afunda no sangue e sai pela poça mais perto do adversário (ou por uma fenda atrás dele). Se o adversário estiver colado, é ARRASTADO junto e cuspido no chão de outra poça.',
      energyCost: 20,
      cooldown: 8,
      distance: 1.6,
      vanishTime: 0.18,
      dragRange: 2.2,
      ai: { max: 2.2 }, // CPU: usa colado no adversário, para arrastá-lo
      dragDamage: 34,
      color: 0x9a0010,
    },
    {
      id: 'senhorSangue',
      name: 'Senhor do Sangue',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'summonBlood',
      description: 'Abre poças de sangue perto do adversário e delas sobe uma horda que luta pelo Diabo por 12 s: 1 a 3 Zumbis de Sangue fracos, ou 2 fracos e 1 forte.',
      energyCost: 30,
      cooldown: 22,
      duration: 12,
      // hordas possíveis (sorteadas): fraco = 90 de vida, garra e mordida; forte = 260, pancada que derruba (ver npcs.js BLOOD_ZOMBIE)
      hordes: [['weak'], ['weak', 'weak'], ['weak', 'weak', 'weak'], ['weak', 'strong', 'weak']],
    },
    {
      id: 'sangueArredores',
      name: 'Sangue nos Arredores',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'bloodGeysers',
      description: 'O chão em volta jorra sangue em 4 ondas: dano, lentidão, e o Diabo bebe 50% do sangue derramado. Deixa poças de sangue em volta.',
      energyCost: 30,
      cooldown: 16,
      waves: 4,
      interval: 0.55,
      radius: 4.2,
      damage: 24,
      drain: 0.5,
      slow: 0.6,
      pools: 4,
    },
  ],

  // Especial PACTO ("Eu vim te oferecer um pacto."): o Diabo sai do Símbolo do Pacto cara a cara com o adversário e
  // oferece. A VÍTIMA ESCOLHE (○ aceita, Defesa recusa; calar é consentir):
  //  - aceitar: o presente (cura 15% e sanidade cheia) e o preço distorcido — TRANSTORNADO por 9 s: não defende, leva
  //    25% a mais de dano e a sanidade do presente escorre de volta para o Diabo; o Diabo cura 80;
  //  - recusar: o Diabo cobra à força — 3 garradas de 36 e um rasgo de 70 que arremessa (sem defesa), sangramento
  //    forte e 4 s de Transtorno (não defende, +15% de dano).
  special: {
    name: 'Pacto',
    banner: 'Eu vim te oferecer um pacto',
    type: 'devilDeal',
    energyCost: 50,
    cooldown: 20,
    choice: 1.6,
    giftHeal: 0.15,
    duration: 9,
    takenMult: 1.25,
    drain: 9,
    heal: 80,
    refuseHit: 36,
    refuseFinal: 70,
    refuseDuration: 4,
    refuseTaken: 1.15,
    color: 0xff2a3d,
  },

  passives: [
    { type: 'lifesteal', ratio: 0.08 }, // o Diabo também se alimenta do sangue (0,12 → 0,08 na v2.2: 86% de vitórias como Diabo)
    { type: 'hatesElement', element: 'conhecimento', mult: 1.15 }, // odeia o Conhecimento ("Decepar Máscara")
  ],
};
