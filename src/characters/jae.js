// PARK JAE-YOON — "JAE" ou "X" (id: jae) — Mascarados (Hexatombe), parceira do Mutilador Noturno e do Colosso.
// Assassina em série furtiva (Natal Macabro): trancou viajantes na Casa Juno num jogo macabro das chaves; espreita como
// uma sombra entre as árvores, anuncia o ataque sussurrando "Shhh..." e pega o alvo quando ele menos espera; corre de
// forma quase sobrenatural (wiki). Inspirada no Ghostface. Pessoa não-binária — qualquer pronome vale (wiki).
// "Ao encontrar no Sangue a liberdade da rebeldia... Jae matava porque podia." Atributos (ficha): AGI 3, INT 3, FOR 2,
// PRE 1, VIG 1 → rápida e frágil. Afinidade: SANGUE.
// Visual (Referencias visuais/Personagens/Jae + wiki): 1,70 m, traços coreanos, cabelo preto com franja sobre um olho,
// maquiagem preta forte nos olhos, batom vermelho, pinta falsa no queixo; gola alta preta; sobretudo de COURO vermelho
// com capuz, cintos pelo corpo, luvas sem dedos. Arma: o PUNHAL X (cabo preto, guarda amarela, lâmina longa).
// Kit da ficha / wiki:
//   Assassinato Furtivo — alvo desprevenido ou flanqueado leva +3d8 → △+L2: some e surge apunhalando as costas;
//   Zona dos Sussurros — marca uma área com "X": +5 no ataque, não perde a Furtividade ao chamar atenção, melhora o
//     assassinato → R2+△;
//   Punhal X — deixa o alvo desprevenido e, se acertar, CEGO por 1 rodada → △→○;
//   o "Shhh..." e as sombras (personalidade/wiki) → △→□: some nas sombras.
// CAPUZ DE X (Transformação): ao pôr o capuz as habilidades melhoram — Assassinato Furtivo vira ASSASSINATO CRUEL
// (+6d8) e ganha a ZONA DAS SOMBRAS (armadilha de Conhecimento de 3 m: cego e SURDO) — forms/jae_x.js.
const RED = 0xd01828;
const STEEL = 0xd8d4dc;

export const JAE_KIT = {
  stats: { moveSpeed: 8.3, maxHealth: 930 }, // VIG 1: a mais frágil das assassinas, AGI 3: a mais rápida
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_jae', block: 'block' },
  chargeFx: { style: 'blood', color: RED },
  dodge: { style: 'default', distance: 5.8 },

  melee: {
    name: 'Punhal X',
    strikes: [
      { name: 'Corte rápido', anim: 'knife_1', dur: 0.22, active: [0.05, 0.12], damage: 22, range: 1.7, arc: 110, knockback: 0.6, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: 0.05 } },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.22, active: [0.05, 0.12], damage: 22, range: 1.7, arc: 110, knockback: 0.6, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, flip: true } },
      { name: 'Punhalada', anim: 'knife_3', dur: 0.26, active: [0.07, 0.14], damage: 26, range: 1.8, arc: 90, knockback: 0.8, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -0.4 } },
      { name: 'Estocada', anim: 'thrust', dur: 0.28, active: [0.09, 0.16], damage: 28, range: 1.9, arc: 70, knockback: 0.9, lunge: 1.4, sound: 'blade', hitSound: 'bladeHit' },
      // o X: dois cortes cruzados — a marca dela
      { name: 'X', anim: 'dual_cross', dur: 0.44, active: [0.15, 0.25], damage: 50, range: 1.9, arc: 130, lunge: 1.7, finisher: 'launch', sound: 'slashFinal', hitSound: 'bladeHit', trail: { color: RED, roll: 0.9, big: true } },
    ],
    up: { name: 'Corte ascendente', anim: 'slash_up', dur: 0.36, active: [0.11, 0.21], damage: 36, range: 1.8, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, tilt: -1.3 } },
    down: { name: 'Rasteira', anim: 'kick_low', dur: 0.42, active: [0.15, 0.25], damage: 40, range: 1.8, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'kick' },
    forward: { name: 'Bote na sombra', anim: 'dash_slash', dur: 0.38, active: [0.12, 0.23], damage: 30, range: 1.9, arc: 100, knockback: 1.5, motion: [{ t: [0, 0.23], fwd: 6.2, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: RED, tilt: 0.1 } },
    back: { name: 'Some e volta', anim: 'knife_evade', dur: 0.44, active: [0.25, 0.33], damage: 28, range: 1.8, arc: 100, knockback: 1.8, iframes: [0, 0.22], motion: [{ t: [0, 0.14], back: 2.6 }, { t: [0.18, 0.3], fwd: 2.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Flanco', anim: 'knife_2', dur: 0.3, active: [0.09, 0.17], damage: 28, range: 1.8, arc: 140, knockback: 1.3, motion: [{ t: [0, 0.2], side: 2.8 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL } },
    air: { name: 'Punhal do alto', anim: 'air_knife', dur: 0.38, active: [0.11, 0.27], damage: 30, range: 1.8, arc: 110, knockback: 2.4, slam: 15, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: STEEL, roll: 1.3 } },
  },

  // □: PUNHAIS ARREMESSADOS — dois, rápidos (ela sempre tem mais um no cinto)
  ranged: {
    name: 'Punhais Arremessados',
    type: 'projectile',
    anim: 'throw_r',
    windup: 0.16,
    recovery: 0.3,
    count: 2,
    interval: 0.12,
    damage: 22,
    range: 24,
    speed: 44,
    radius: 0.32,
    spread: 0.06, // desvio do vetor de mira (fração, não graus: com 4 as facas voavam para qualquer lado)
    knockback: 0.8,
    hitstun: 0.3,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'knife',
    color: STEEL,
    sound: 'knifeThrow',
    hitSound: 'bladeHit',
  },


  abilities: [
    {
      id: 'punhalX',
      name: 'Punhal X',
      input: 'carga+physical', // △ → ○
      type: 'dashStrike',
      description: 'Avança com o Punhal X num corte em X: quem é acertado fica CEGO por um instante — não consegue se defender nem se virar, e fica desprevenido.',
      energyCost: 20,
      cooldown: 10,
      windup: 0.15,
      distance: 7,
      speed: 26,
      range: 1.9,
      recovery: 0.3,
      damage: 38,
      knockback: 1.2,
      hitstun: 0.5,
      blind: 1.2,
      xSlash: true,
      color: RED,
      element: 'sangue',
      anim: 'dash_slash',
      hitSound: 'bladeHit',
    },
    {
      id: 'shhh',
      name: 'Shhh...',
      input: 'carga+ranged', // △ → □
      type: 'shadowVeil',
      description: 'Leva o dedo aos lábios e some nas sombras (4 s): quase invisível e mais rápida, o adversário perde o rastro dela. O primeiro ataque sai do escuro e pega o alvo DESPREVENIDO. Tomar dano a revela.',
      energyCost: 20,
      cooldown: 12,
      duration: 4,
      opacity: 0.12,
      speedMult: 1.15,
      surprise: 0.6,
      color: RED,
    },
    {
      id: 'assassinatoFurtivo',
      name: 'Assassinato Furtivo',
      input: 'carga+dodge', // △ + L2
      type: 'teleportBehind',
      description: 'Some e surge pelas costas do alvo já apunhalando: ele fica desprevenido e o golpe entra com o bônus de assassina.',
      energyCost: 25,
      cooldown: 10,
      distance: 1.2,
      vanishTime: 0.22,
      surpriseTime: 0.7,
      strike: { damage: 34, anim: 'thrust', dur: 0.32, at: 0.1, knockback: 1.2, hitstun: 0.5, element: 'sangue' },
      color: RED,
    },
    {
      id: 'zonaSussurros',
      name: 'Zona dos Sussurros',
      input: 'block+carga', // R2 + △
      type: 'whisperZone',
      description: 'Marca um X vermelho no chão (8 s). Lá dentro ela anda mais rápido, todo golpe dela entra como assassinato e atacar não a tira do Shhh...',
      energyCost: 25,
      cooldown: 18,
      radius: 3.2,
      duration: 8,
      mult: 1.1,
      speedMult: 1.12,
      color: RED,
    },
  ],

  // A MARCA DO X: sussurra, some, surge colada no alvo, abre o corpo em cortes rápidos e termina riscando um X enorme —
  // como no primeiro assassinato dela, quando o X da opressão do pai virou a marca da sua libertação (wiki)
  special: {
    name: 'A Marca do X',
    banner: 'A Marca do X',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: RED,
    sound: 'specialStart',
    prepare: { anim: 'shh', time: 0.4 },
    dash: { speed: 28, maxTime: 0.4, contact: 1.8 },
    hits: [
      { t: 0.6, anim: 'knife_1', dur: 0.22, share: 0.12, fx: { kind: 'slash', tilt: 0.05 }, sound: 'bladeHit' },
      { t: 0.82, anim: 'knife_2', dur: 0.22, share: 0.12, fx: { kind: 'slash', flip: true }, sound: 'bladeHit' },
      { t: 1.04, anim: 'knife_3', dur: 0.24, share: 0.12, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.3, anim: 'thrust', dur: 0.26, share: 0.14, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.8, anim: 'dual_cross', dur: 0.44, share: 0.5, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true, bleed: { dps: 5, duration: 3 } },
    ],
    bannerAt: 0.2,
    length: 2.8,
  },

  // Jae matava porque podia: golpe em quem está desprevenido, cego, surdo ou de costas entra muito mais forte
  passives: [
    { type: 'backstab', kinds: ['melee', 'ability'], mult: 1.3, surprised: true },
  ],
};

export default {
  id: 'jae',
  name: 'JAE',
  model: 'jae',
  color: '#c81e2e',
  origin: 'Mascarados', // Hexatombe (associação: Assassinos)
  element: 'sangue',
  energyColor: RED,
  info: {
    weapon: 'Punhal X (adaga) e punhais de arremesso',
    style: 'Assassina furtiva: some nas sombras, surge pelas costas, cega e corta — rápida e frágil',
    identity: 'Assassina em série: pondo o capuz, vira X',
    tagline: 'Shhh. Não grita.',
  },
  ...JAE_KIT,
  ai: { abilityRate: 1.8 }, // assassina que vive das habilidades (some, surge pelas costas, cega): a CPU usa mais

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): CAPUZ DE X — segura o capuz, puxa por cima da cabeça,
  // sorri, "Shhh..." e o rosto some na escuridão com o X vermelho no lugar (o gif) — X até o fim do round
  awakening: {
    name: 'Capuz de X',
    banner: 'Capuz de X',
    type: 'maskTransform',
    scene: 'hood',
    form: 'jae_x',
    formBanner: 'X',
    prop: 'hoodX',
    swap: [['hoodUp', true], ['hoodDown', false]],
    grin: ['face_jae', 'face_jae_grin'], // o sorriso debaixo do capuz
    duration: 0, // até o fim do round
    bonusHealth: 80,
    color: RED,
  },
};
