// O ESTRANGEIRO (id: estrangeiro) — PORTADORES DAS RELÍQUIAS (pedido do usuário: entra no grupo mesmo não sendo um
// portador no cânone). A criatura de Transmissão de Sinais do Outro Lado (wiki "Estrangeiro"): 2,5 m, a máscara cinza
// de olhos verdes com os fios ligados ao corpo, a capa esverdeada até o chão, braços longos de garras enormes. Abduz,
// apaga memórias, comanda as vítimas e "derrete" com um toque. Ligado a um dos Sinos de Tenebris; "O que é pior do
// que a Dor e a Morte?". Elemento: TRANSMISSÃO (verde — o do Sino de Tenebris ligado a ele; pedido do usuário). Fala
// pouco: indiferente, superior.
// Kit (Habilidades da wiki): Rajada Psíquica (□), Comandar, Oblívio (some da mente do alvo), aparece do nada atrás da
// vítima, Toque Sutil (derrete). Especial: TORTURA MENTAL; a ABDUÇÃO é um ritual comum (R2 + △). Transformação: INCUBAR (a larva — o alvo fica exposto à mente dele).
// Modelo próprio do Blender (public/models/estrangeiro.glb, tools/blender/char_estrangeiro.py).
const GREEN = 0x8aff4a;
const PALE = 0xd8d6c8;

export default {
  id: 'estrangeiro',
  name: 'O ESTRANGEIRO',
  model: 'estrangeiro',
  color: '#8acf4a',
  origin: 'Outro Lado', // os Sinos de Tenebris (Transmissão)
  element: 'transmissao',
  hpBar: { style: 'signal' }, // barra de vida de Portador (Transmissão), sem número
  energyColor: GREEN,
  info: {
    weapon: 'Cinco garras enormes em cada mão',
    style: 'Garradas lentas e longas, a Rajada Psíquica de longe, comandos na mente e o toque que derrete',
    identity: 'A criatura de Transmissão: ninguém lembra de tê-lo visto — até ser tarde',
    tagline: 'O que é pior do que a Dor e a Morte?',
  },
  // alto e de braços longos: alcança mais, mas é mais lento
  stats: { moveSpeed: 7.2, attackSpeed: 0.95, size: 1.1, maxHealth: 1800 }, // Portador das Relíquias: aguenta mais que o elenco (o número não aparece na tela)
  anims: { idle: 'est_idle', run: 'run', charge: 'charge', victory: 'vic_estrangeiro', block: 'db_block', block_hit: 'db_block_hit' },
  chargeFx: { style: 'default', color: GREEN },
  dodge: { style: 'default', distance: 5 },

  melee: {
    name: 'Garras do Estrangeiro',
    strikes: [
      { name: 'Garra longa', anim: 'db_claw_r', dur: 0.32, active: [0.1, 0.18], damage: 26, range: 2.5, arc: 120, knockback: 1.0, lunge: 1.1, sound: 'blade', hitSound: 'clawHit', trail: { color: PALE, tilt: 0.05 } },
      { name: 'Garra de volta', anim: 'db_claw_l', dur: 0.32, active: [0.1, 0.18], damage: 26, range: 2.5, arc: 120, knockback: 1.0, lunge: 1.0, sound: 'blade', hitSound: 'clawHit', trail: { color: PALE, flip: true } },
      // a mão aberta solta um pulso de Transmissão: empurra de longe sem encostar
      { name: 'Pulso de Sinal', anim: 'wave_punch', dur: 0.42, active: [0.15, 0.25], damage: 32, range: 3.6, arc: 60, knockback: 2.4, lunge: 0.3, element: 'transmissao', sound: 'fearGaze', hitSound: 'impact', impactFx: 'sigil', impactScale: 1.3, trail: { color: GREEN, wide: true } },
      { name: 'Dez garras', anim: 'db_cross', dur: 0.44, actives: [[0.12, 0.19], [0.24, 0.32]], damage: 40, range: 2.5, arc: 130, knockback: 1.2, lunge: 1.0, sound: 'blade', hitSound: 'clawHit', trail: { color: GREEN, roll: 0.8 } },
      { name: 'Rasgar a mente', anim: 'db_rend', dur: 0.6, active: [0.24, 0.36], damage: 62, range: 2.6, arc: 140, lunge: 1.6, finisher: 'launch', hitstop: 0.1, sound: 'slashFinal', hitSound: 'clawHit', impactFx: 'sigil', impactScale: 1.7, trail: { color: GREEN, roll: 1.4, big: true } },
    ],
    up: { name: 'Erguer pela garganta', anim: 'db_up', dur: 0.42, active: [0.13, 0.24], damage: 40, range: 2.4, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'clawHit' },
    down: { name: 'Cravar as garras', anim: 'db_down', dur: 0.48, active: [0.18, 0.28], damage: 46, range: 2.4, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'blade', hitSound: 'clawHit', impactScale: 1.4 },
    forward: { name: 'Flutuar até a vítima', anim: 'db_claw_r', dur: 0.46, active: [0.18, 0.3], damage: 36, range: 2.5, arc: 110, knockback: 1.8, motion: [{ t: [0, 0.28], fwd: 5.4, stopClose: true }], sound: 'blade', hitSound: 'clawHit', trail: { color: GREEN, tilt: 0.1 } },
    back: { name: 'Recuar flutuando', anim: 'db_cross', dur: 0.52, actives: [[0.28, 0.34], [0.38, 0.44]], damage: 32, range: 2.4, arc: 120, knockback: 1.8, iframes: [0, 0.22], motion: [{ t: [0, 0.18], back: 2.8 }, { t: [0.22, 0.36], fwd: 2.4, stopClose: true }], sound: 'blade', hitSound: 'clawHit' },
    side: { name: 'Garra em arco', anim: 'db_claw_l', dur: 0.36, active: [0.12, 0.21], damage: 30, range: 2.5, arc: 160, knockback: 1.4, motion: [{ t: [0, 0.22], side: 2.6 }], sound: 'blade', hitSound: 'clawHit', trail: { color: PALE, flip: true } },
    air: { name: 'Descida das garras', anim: 'db_air', dur: 0.44, active: [0.14, 0.3], damage: 36, range: 2.4, arc: 120, knockback: 3, slam: 16, vertical: 2.4, sound: 'blade', hitSound: 'clawHit' },
  },

  // □: RAJADA PSÍQUICA — "uma onda psíquica a uma distância absurda, com fragmentos de Conhecimento incompreensível"
  ranged: {
    name: 'Rajada Psíquica',
    type: 'projectile',
    anim: 'point',
    origin: 'chest',
    windup: 0.26,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 32,
    range: 22,
    speed: 24,
    radius: 0.6,
    spread: 0,
    knockback: 0.8,
    hitstun: 0.5,
    cooldown: 2.8,
    energyCost: 0,
    visual: 'mindSigil',
    color: GREEN,
    element: 'transmissao',
    sound: 'fearGaze',
    hitSound: 'impact',
    onHit: { label: 'SINAL PERDIDO', distort: true },
  },

  abilities: [
    {
      id: 'comandar',
      name: 'Comandar',
      input: 'carga+physical', // △ + ○
      type: 'mindControl',
      description: 'Entra na mente do alvo: por alguns segundos ele anda sozinho até o Estrangeiro e não consegue se defender.',
      energyCost: 35,
      cooldown: 18,
      windup: 0.45,
      recovery: 0.3,
      range: 11,
      arc: 60,
      duration: 2.5,
      walkTo: true,
      noBlock: true,
      color: GREEN,
    },
    {
      id: 'oblivio',
      name: 'Oblívio',
      input: 'carga+ranged', // △ → □
      type: 'shadowVeil',
      description: 'O alvo ESQUECE que ele está ali (4 s): quase invisível e mais rápido. O primeiro ataque pega o alvo desprevenido. Tomar dano o revela.',
      energyCost: 22,
      cooldown: 14,
      duration: 4,
      opacity: 0.12,
      speedMult: 1.12,
      surprise: 0.6,
      color: GREEN,
    },
    {
      id: 'abducao',
      name: 'Aparição',
      input: 'carga+jump', // △ + ×
      spamWindow: 8,
      spamMult: 1.6,
      type: 'teleportBehind',
      description: 'Some numa interferência de sinal e reaparece atrás do alvo, como nas abduções.',
      energyCost: 22,
      cooldown: 7,
      distance: 1.6,
      vanishTime: 0.2,
      vanishFx: 'signal', // interferência de sinal verde
      color: GREEN,
    },
    {
      // a abdução das histórias (wiki: "suas aparições são sempre relatadas como abduções") — aqui um ritual comum, fraco
      id: 'abducao_luz',
      name: 'Abdução',
      input: 'block+carga', // R2 + △
      type: 'abductBeam',
      description: 'Um círculo verde marca o chão debaixo do adversário: se ele não sair a tempo, a luz o ERGUE no ar e logo depois o crava de volta no chão. Pouco dano, mas abre para o combo.',
      energyCost: 25,
      cooldown: 14,
      windup: 0.7,
      range: 14,
      radius: 1.4,
      damage: 40,
      element: 'transmissao',
      color: GREEN,
    },
    {
      id: 'toqueSutil',
      name: 'Toque Sutil',
      input: 'carga+dodge', // △ + L2
      type: 'deathTouch',
      description: 'Um toque de um dedo: o sangue do alvo borbulha e ele derrete por dentro — dano contínuo, lento e mais fraco por alguns segundos. Curtíssimo alcance; dá para esquivar.',
      energyCost: 35,
      cooldown: 30,
      windup: 0.4,
      recovery: 0.35,
      range: 1.6,
      damage: 40,
      duration: 5,
      dps: 8,
      slow: 0.85,
      color: GREEN,
    },
  ],

  // TORTURA MENTAL — a cena do fim de Sinais do Outro Lado (o Xande se sacrifica pelos Cinco): o Estrangeiro entra
  // na mente dele, o PARALISA, CONTROLA os movimentos e o faz se BATER três vezes, o força a AJOELHAR, APAGA as memórias
  // (o alvo esquece os rituais — recargas no máximo — e perde a sanidade) e o derrete com o TOQUE SUTIL
  // (specials/mindTorture.js)
  special: {
    name: 'Tortura Mental',
    banner: 'O que é pior do que a Dor e a Morte?',
    type: 'mindTorture',
    energyCost: 50,
    cooldown: 16,
    range: 14,
    forget: 1, // fração da recarga máxima que cada ritual do alvo recebe ao esquecer
    color: GREEN,
  },


  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): INCUBAR — a larva entra na mente: tudo o que ele faz
  // bate mais, as recargas correm e as garras drenam a sanidade da vítima até o fim do round
  awakening: {
    name: 'Incubar',
    banner: 'Incubar',
    type: 'awakenMode',
    mult: 1.15, takenMult: 0.88, cdRate: 1.3, speedMult: 1.1, aura: 'smoke', color: GREEN, heal: 0.1,
  },

  passives: [
    // a larva: acertar com as garras deixa o alvo exposto à mente dele (recebe um pouco mais de dano por instantes)
    { type: 'mindRead', takenMult: 1.08, time: 3, color: GREEN },
  ],
};
