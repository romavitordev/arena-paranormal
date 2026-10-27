// O AMIGO IMAGINÁRIO (id: amigo) — PORTADORES DAS RELÍQUIAS (pedido do usuário: entra no grupo mesmo sem portar
// Relíquia). "A Obra de Arte Perfeita", o chefe de O Segredo na Ilha (wiki "Amigo Imaginário"): criatura da união
// impossível de Morte e Sangue, moldada pelo MEDO que o Barnabé espalhou em Tipora e ligada à TINTA de um dos Sinos de
// Tenebris. Curvado, de capuz até o chão, tentáculos, braços secos de garras e o buraco no lugar do rosto de onde a
// tinta escorre sem parar. Elemento no jogo: TINTA (marrom; pedido do usuário).
// Kit (Habilidades da wiki): Tentáculos (golpe à distância), Agarrão (puxa e arremessa), Derreter (a tinta no rosto),
// Garras, Dissolver (absorve e recupera vida), O Sino (quem ouve fica vulnerável / preso perto dele) e o FRENESI DE
// SANGUE (ferido, fica rápido e furioso — a transformação). Especial: TODO MUNDO VAI MORRER.
// Modelo próprio do Blender (public/models/amigo.glb, tools/blender/char_amigo.py) com o JORRO de tinta do rosto até o
// chão feito em código (def.inkStream). Animações próprias (ai_*, anim/charClips.js) e golpes únicos: Derreter
// (inkMelt), Tentáculos que Prendem (inkTentacles), O Sino (bellToll), Dissolver (inkDissolve) — combat/amigoPowers.js
// — e o especial Todo Mundo Vai Morrer (specials/inkRequiem.js). Efeitos de tinta em fx/inkFx.js.
const INK = 0x8a4a22;
const DARK = 0x3a1a10;

export default {
  id: 'amigo',
  name: 'AMIGO IMAGINÁRIO',
  model: 'amigo',
  color: '#a0602a',
  origin: 'Outro Lado', // os Sinos de Tenebris (Tinta)
  element: 'tinta',
  hpBar: { style: 'ink' }, // barra de vida de Portador (Tinta), sem número
  energyColor: INK,
  info: {
    weapon: 'Garras secas, tentáculos e a tinta que escorre do rosto',
    style: 'Lento e pesado: tentáculos que puxam de longe, garras de perto e a tinta que derrete',
    identity: 'A Obra de Arte Perfeita: quando o Sino tocar, a criatura vai retornar',
    tagline: 'Quando o Sino tocar, todo mundo vai morrer.',
  },
  // enorme e lento (o chefe da ilha)
  stats: { moveSpeed: 7.0, attackSpeed: 0.9, size: 1.15, maxHealth: 1800 }, // Portador das Relíquias: aguenta mais que o elenco (o número não aparece na tela)
  anims: {
    idle: 'ai_idle', run: 'ai_run', walk: 'ai_walk', walk_back: 'ai_walk_back', strafe_L: 'ai_strafe_L', strafe_R: 'ai_strafe_R', dash: 'ai_dash',
    charge: 'ai_charge', concentrate: 'ai_charge', victory: 'vic_amigo', block: 'ai_block', block_hit: 'ai_block_hit', point: 'ai_point', gaze: 'ai_bell', breath: 'ai_dissolve',
  },
  chargeFx: { style: 'default', color: INK },
  dodge: { style: 'default', distance: 4.4 },
  // a tinta escorre do buraco do rosto o tempo todo: o JORRO grosso até o chão (com a poça embaixo) e respingos
  inkStream: { socket: 'mouth', color: 0x6a2812, width: 0.05, pool: 0.34, max: 2.2 },
  drips: { sockets: ['mouth'], color: 0x5a1e10, every: 0.12 },

  // golpes próprios (clipes ai_*): garras em arcos largos e lentos, o corpo chicoteia e os TENTÁCULOS saem do chão
  // junto (s.tentacle); a tinta espirra onde acerta (impactFx 'ink')
  melee: {
    name: 'Garras e Tentáculos',
    strikes: [
      { name: 'Garra seca', anim: 'ai_claw_r', dur: 0.38, active: [0.13, 0.22], damage: 30, range: 2.5, arc: 130, knockback: 1.1, lunge: 0.9, sound: 'blade', hitSound: 'clawHit', impactFx: 'ink', trail: { color: DARK, tilt: 0.1, roll: 0.5 } },
      { name: 'Garra seca', anim: 'ai_claw_l', dur: 0.38, active: [0.13, 0.22], damage: 30, range: 2.5, arc: 130, knockback: 1.1, lunge: 0.8, sound: 'blade', hitSound: 'clawHit', impactFx: 'ink', trail: { color: DARK, flip: true, roll: -0.5 } },
      // o corpo chicoteia e um tentáculo sai do chão até o alvo
      { name: 'Chicote de tentáculo', anim: 'ai_lash', dur: 0.46, active: [0.18, 0.28], damage: 34, range: 3.8, arc: 70, knockback: 1.8, lunge: 0.3, element: 'tinta', tentacle: 'right', sound: 'whip', hitSound: 'impact', impactFx: 'ink' },
      { name: 'Dez garras', anim: 'ai_rake', dur: 0.5, actives: [[0.15, 0.22], [0.3, 0.38]], damage: 42, range: 2.6, arc: 140, knockback: 1.3, lunge: 0.9, sound: 'blade', hitSound: 'clawHit', impactFx: 'ink', trail: { color: INK, roll: 0.8 } },
      { name: 'Rasgar o quadro', anim: 'ai_tear', dur: 0.66, active: [0.34, 0.46], damage: 64, range: 2.7, arc: 150, lunge: 1.4, finisher: 'launch', hitstop: 0.12, sound: 'slashFinal', hitSound: 'clawHit', impactScale: 1.8, impactFx: 'ink', trail: { color: INK, roll: 1.4, big: true } },
    ],
    up: { name: 'Erguer pelos tentáculos', anim: 'ai_up', dur: 0.48, active: [0.16, 0.28], damage: 42, range: 2.7, arc: 120, lunge: 0.8, finisher: 'launchHigh', launcher: true, tentacle: 'left', sound: 'whip', hitSound: 'clawHit', impactFx: 'ink' },
    down: { name: 'Esmagar', anim: 'ai_down', dur: 0.52, active: [0.28, 0.38], damage: 48, range: 2.6, arc: 120, lunge: 0.9, finisher: 'knockdown', groundFx: 'dust', sound: 'heavyPunch', hitSound: 'clawHit', impactScale: 1.5, impactFx: 'ink' },
    forward: { name: 'Avanço da criatura', anim: 'ai_claw_r', dur: 0.5, active: [0.2, 0.32], damage: 38, range: 2.6, arc: 120, knockback: 2.0, motion: [{ t: [0, 0.3], fwd: 5.2, stopClose: true }], sound: 'blade', hitSound: 'clawHit', impactFx: 'ink', trail: { color: INK, tilt: 0.1 } },
    back: { name: 'Recua e chicoteia', anim: 'ai_lash_l', dur: 0.56, active: [0.32, 0.42], damage: 34, range: 3.8, arc: 70, knockback: 2.6, iframes: [0, 0.22], motion: [{ t: [0, 0.2], back: 2.4 }], element: 'tinta', tentacle: 'left', sound: 'whip', hitSound: 'impact', impactFx: 'ink' },
    side: { name: 'Varredura de tentáculos', anim: 'ai_lash', dur: 0.48, active: [0.16, 0.32], damage: 32, range: 3.0, arc: 300, knockback: 1.6, motion: [{ t: [0, 0.24], side: 2.2 }], tentacle: 'right', sound: 'whip', hitSound: 'impact', impactFx: 'ink', trail: { color: DARK, wide: true } },
    air: { name: 'Desabar', anim: 'ai_air', dur: 0.46, active: [0.15, 0.32], damage: 38, range: 2.5, arc: 120, knockback: 3, slam: 18, vertical: 2.2, sound: 'blade', hitSound: 'clawHit', impactScale: 1.4, impactFx: 'ink' },
  },

  // □: TENTÁCULO — arremessa a garra e um tentáculo negro se estica atrás dela, prende o alvo e o PUXA (o Agarrão)
  ranged: {
    name: 'Tentáculo',
    type: 'projectile',
    homing: 2.0,
    anim: 'ai_fling',
    origin: 'hand',
    chain: true,
    rope: true,
    ropeColor: 0x1a100c,
    ropeThick: 0.05,
    windup: 0.24,
    recovery: 0.34,
    count: 1,
    interval: 0,
    damage: 26,
    range: 14,
    speed: 30,
    radius: 0.5,
    spread: 0,
    knockback: 0,
    hitstun: 0.1,
    onHit: { pull: { distance: 1.6, time: 0.35, after: 0.7 } },
    cooldown: 5.5,
    energyCost: 15,
    visual: 'inkClaw',
    color: INK,
    element: 'tinta',
    sound: 'chainThrow',
    hitSound: 'chainPull',
  },

  abilities: [
    {
      // a tinta que escorre do rosto, despejada na cara da vítima: derrete
      id: 'derreter',
      name: 'Derreter',
      input: 'carga+physical', // △ + ○
      type: 'inkMelt',
      description: 'Avança, AGARRA a cabeça da vítima e curva o capuz sobre o rosto dela: a tinta escorre direto na cara (dano em pulsos, sem defesa). Solta com o ROSTO DERRETENDO — dano contínuo, lentidão e mais fraco por alguns segundos. Curto alcance; dá para esquivar.',
      energyCost: 35,
      cooldown: 22,
      windup: 0.38,
      hold: 0.9,
      recovery: 0.3,
      range: 1.9,
      damage: 44,
      duration: 5,
      dps: 6,
      slow: 0.85,
      weaken: 0.9,
      color: INK,
    },
    {
      // os tentáculos brotam de uma poça de tinta debaixo do alvo e o prendem
      id: 'tentaculosPrendem',
      name: 'Tentáculos que Prendem',
      input: 'carga+ranged', // △ → □
      type: 'inkTentacles',
      description: 'Aponta a garra e uma POÇA de tinta se abre debaixo do alvo (o aviso: dá para sair dela). Os tentáculos brotam, se enrolam em quem ficou em cima e o PRENDEM.',
      energyCost: 25,
      cooldown: 13,
      windup: 0.55,
      range: 12,
      arc: 60,
      radius: 1.3,
      hold: 1.3,
      count: 4,
      damage: 32,
      color: DARK,
    },
    {
      // O SINO: o som de sino ecoa de dentro da criatura — quem ouve tem a mente falhando
      id: 'oSino',
      name: 'O Sino',
      input: 'block+carga', // R2 + △
      type: 'bellToll',
      description: 'O SINO toca dentro da criatura: três badaladas, cada uma uma onda de som em volta (qualquer direção) que machuca um pouco. Quem ainda estiver perto na ÚLTIMA fica paralisado e VULNERÁVEL (leva mais dano) por alguns segundos.',
      energyCost: 25,
      cooldown: 16,
      range: 6,
      windup: 0.3,
      gap: 0.3,
      tolls: 3,
      recovery: 0.35,
      tollDamage: 6,
      damage: 14,
      stun: 0.9,
      takenMult: 1.2,
      vulnTime: 4,
      color: 0xb07a3a,
    },
    {
      // os animais de Tipora infectados pela Tinta (wiki: Javalis Infectados; Cachorros Selvagens Infectados)
      id: 'bichos',
      name: 'Bichos da Ilha',
      input: 'block+jump', // R2 + ×
      type: 'summonInkBeasts',
      description: 'O Sino chama os animais da ilha INFECTADOS PELA TINTA: saem de poças em volta do adversário e atacam por 12 s — um JAVALI (presas e investida que derruba) e/ou CÃES SELVAGENS (mordidas e o salto). Cadáveres de carne derretida: morrem e viram poça.',
      energyCost: 30,
      cooldown: 22,
      duration: 12,
      // matilhas possíveis (sorteadas)
      packs: [['javali'], ['cao', 'cao'], ['javali', 'cao'], ['cao', 'cao', 'cao']],
    },
    {
      // DISSOLVER: vira uma poça de tinta, absorve e se refaz
      id: 'dissolver',
      name: 'Dissolver',
      input: 'carga+dodge', // △ + L2
      type: 'inkDissolve',
      description: 'DERRETE numa poça da própria tinta (intocável enquanto isso), absorve e recupera vida, e se refaz de uma vez: a tinta espirra em volta e machuca quem estiver em cima da poça.',
      energyCost: 30,
      cooldown: 24,
      time: 1.6,
      heal: 90,
      damage: 24,
      radius: 2.2,
      color: INK,
    },
  ],

  // TODO MUNDO VAI MORRER: o sino toca, os tentáculos erguem a vítima da poça, as garras rasgam, a tinta derrete o rosto
  // e a última badalada a bate no chão (specials/inkRequiem.js)
  special: {
    name: 'Todo Mundo Vai Morrer',
    banner: 'Todo mundo vai morrer.',
    type: 'inkRequiem',
    energyCost: 50,
    cooldown: 14,
    range: 12,
    color: INK,
    sound: 'specialStart',
    melt: { duration: 4, dps: 5, slow: 0.85, weaken: 0.9 },
  },

  // FRENESI DE SANGUE (Barra cheia + vida baixa, segurando △): ferido, a criatura entra em fúria — mais rápida, mais
  // agressiva e mais resistente, até o fim do round (wiki: "os toques do sino assumem uma nova frequência")
  awakening: {
    name: 'Frenesi de Sangue',
    banner: 'Frenesi de Sangue',
    type: 'awakenMode',
    anim: 'ai_frenzy',
    mult: 1.2, affects: ['melee', 'ability'], takenMult: 0.85, speedMult: 1.3, meleeBleed: true, aura: 'blood', color: 0xa02a18, heal: 0.12,
  },

  passives: [
    { type: 'lifesteal', ratio: 0.06 }, // Dissolver: cada golpe absorve um pouco
  ],
};
