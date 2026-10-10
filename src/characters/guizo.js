// GUIZO — Guilherme R. Santos (id: guizo) — Os Cinco (Sinais do Outro Lado). Ocultista da trilha Graduado, origem
// Teórico da Conspiração; o "câmera das missões" dos Cinco: filma tudo de paranormal e posta no site dele. Empolgado,
// extrovertido e expressivo — e assustado quando o perigo é real (o Interflorado). Melhor amigo do Alexandre (Xande).
// Pesquisa (wiki Guilherme_Santos, Alexandre; Referencias visuais/Personagens/Guizo + guizo.txt):
//   CANÔNICO — 1,72 m; cabelo vinho com raiz preta; camiseta "ahlevo" sobre a listrada; câmera sempre com ele; a faca de
//   detalhes dourados (arsenal), amaldiçoada com SANGUE (Amaldiçoar Arma com Sangue: a de Morte foi descartada pelo
//   Felps) e, nas miniaturas, também pelo CONHECIMENTO. Rituais: Decadência, Embaralhar, Velocidade Mortal, Invadir
//   Mente (Rajada Mental — no Fummu ele repetiu "Os Cinco" sem parar na mente do alheio), Espirais da Perdição,
//   Distorcer Aparência (virou o Adágio, ficou musculoso, barbudo, alienígena...), Cicatrização (cura e envelhece),
//   Desacelerar Impacto. Habilidade "Eu Já Sabia" (resistência mental).
//   ADAPTAÇÃO — como cada ritual vira golpe (abaixo); a Transformação é o DISFARCE ALIENÍGENA do Distorcer Aparência
//   com a faca de Conhecimento; o especial "Registro do Outro Lado" (nome do jogo, não do RPG).
//   NÃO CONFIRMADO — o cumprimento secreto com o Alexandre existe, mas não é descrito: as falas só citam o cumprimento.
// Lutador ágil e frágil: cortes rápidos de faca, rituais de controle (lentidão, cópias, definhar) e a câmera sempre na
// mão esquerda (vai para o quadril quando ele ataca — def.grip).
const MORTE = 0x8a8494;
const GOLD = 0xe8c860; // Conhecimento
const BLADE = 0xd8cfc4;

export const GUIZO_KIT = {
  stats: { moveSpeed: 8.2, maxHealth: 980 }, // ocultista: rápido e frágil
  anims: { idle: 'idle_guizo', run: 'run', charge: 'charge', victory: 'vic_guizo', block: 'block' },
  // a câmera fica na mão esquerda; ao atacar vai para o quadril (pendurada na alça) e a mão fica livre
  grip: { prop: 'camera', stow: 'hip', bothHands: false },
  chargeFx: { style: 'default', color: MORTE },
  dodge: { style: 'default', distance: 5.6 },

  melee: {
    name: 'Faca de detalhes dourados',
    strikes: [
      { name: 'Corte curto', anim: 'knife_1', dur: 0.23, active: [0.05, 0.12], damage: 24, range: 1.7, arc: 110, knockback: 0.6, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: BLADE, tilt: 0.05 } },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.23, active: [0.05, 0.12], damage: 24, range: 1.7, arc: 110, knockback: 0.6, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { color: BLADE, flip: true } },
      { name: 'Cotovelada curta', anim: 'sway_elbow', dur: 0.28, active: [0.08, 0.16], damage: 22, range: 1.4, arc: 100, knockback: 0.8, lunge: 0.9, sound: 'swing', hitSound: 'punch' },
      { name: 'Estocada', anim: 'thrust', dur: 0.28, active: [0.09, 0.16], damage: 28, range: 1.9, arc: 70, knockback: 0.9, lunge: 1.4, sound: 'blade', hitSound: 'bladeHit' },
      // o fim: corte largo que solta uma espiral cinza (Morte) e afasta
      { name: 'Corte espiral', anim: 'knife_final', dur: 0.46, active: [0.16, 0.26], damage: 48, range: 1.9, arc: 140, lunge: 1.6, finisher: 'launch', impactFx: 'spiral', sound: 'slashFinal', hitSound: 'bladeHit', trail: { color: MORTE, roll: 0.9, big: true } },
    ],
    up: { name: 'Corte ascendente', anim: 'slash_up', dur: 0.36, active: [0.11, 0.21], damage: 34, range: 1.8, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: BLADE, tilt: -1.3 } },
    down: { name: 'Golpe descendente', anim: 'slash_d', dur: 0.46, active: [0.18, 0.28], damage: 40, range: 1.8, arc: 110, lunge: 1, finisher: 'knockdown', sound: 'blade', hitSound: 'bladeHit', impactScale: 1.2, trail: { color: BLADE, roll: 1.2 } },
    forward: { name: 'Avanço com a faca', anim: 'dash_slash', dur: 0.38, active: [0.12, 0.23], damage: 30, range: 1.9, arc: 100, knockback: 1.4, motion: [{ t: [0, 0.23], fwd: 5.8, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: BLADE, tilt: 0.1 } },
    back: { name: 'Recua e corta', anim: 'knife_evade', dur: 0.44, active: [0.25, 0.33], damage: 28, range: 1.8, arc: 100, knockback: 1.6, iframes: [0, 0.2], motion: [{ t: [0, 0.14], back: 2.4 }, { t: [0.18, 0.3], fwd: 2.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Chute rápido', anim: 'side_kick', dur: 0.32, active: [0.1, 0.18], damage: 26, range: 1.7, arc: 130, knockback: 1.6, motion: [{ t: [0, 0.2], side: 2.4 }], sound: 'swing', hitSound: 'kick' },
    air: { name: 'Faca do alto', anim: 'air_knife', dur: 0.38, active: [0.11, 0.27], damage: 30, range: 1.8, arc: 110, knockback: 2.4, slam: 15, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: BLADE, roll: 1.3 } },
  },

  // □: INVADIR MENTE — a Rajada Mental (dano de Conhecimento): o sigilo dourado voa até o alvo e, na cabeça dele, ecoa
  // "OS CINCO! OS CINCO! OS CINCO!" (o que o Guizo repetiu na mente do Fummu). □ + ←: Cicatrização.
  ranged: {
    name: 'Invadir Mente',
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
    onHit: { label: 'OS CINCO! OS CINCO! OS CINCO!', distort: true },
    variants: { back: { ability: 'cicatrizacao' } },
  },

  abilities: [
    {
      id: 'decadencia',
      name: 'Decadência',
      input: 'carga+physical', // △ → ○
      type: 'decadence',
      description: 'Estende a mão envolta em espirais: elas surgem em volta do alvo, apertam e ele DEFINHA (dano de Morte e uma decadência curta depois). Dá para esquivar quando as espirais fecham.',
      energyCost: 25,
      cooldown: 9,
      cast: 0.62,
      range: 9,
      damage: 62,
      decay: { dps: 4, duration: 3 },
      element: 'morte',
      color: MORTE,
      ai: { max: 8.5 },
    },
    {
      id: 'amaldicoarFaca',
      name: 'Amaldiçoar Arma com Sangue',
      input: 'carga+ranged', // △ → □
      type: 'curseWeapon',
      description: 'O sangue sobe em espiral até a faca: por 8 s ela fica coberta de Sangue e todo golpe físico abre um sangramento.',
      energyCost: 20,
      cooldown: 18,
      duration: 8,
      props: ['knife'],
      element: 'sangue',
      bleed: { dps: 4, duration: 3 },
      color: 0xc01830,
    },
    {
      id: 'velocidadeMortal',
      name: 'Velocidade Mortal',
      input: 'carga+dodge', // △ + L2
      type: 'deadlySpeedTrail',
      label: 'VELOCIDADE MORTAL',
      description: 'Distorce o tempo em volta de si: por 6 s fica muito mais rápido, bate mais rápido, recupera as esquivas e deixa rastros dele no ar.',
      energyCost: 25,
      cooldown: 20,
      duration: 6,
      speedMult: 1.35,
      atkSpeed: 1.25,
      refillDodges: 4,
      anim: 'breath',
      animTime: 0.4,
      color: 0xb8b4c4,
    },
    {
      id: 'embaralhar',
      name: 'Embaralhar',
      input: 'block+carga', // R2 + △
      type: 'shuffle',
      description: 'Vira um holograma, troca de lugar e deixa 3 cópias realistas em volta que imitam cada movimento dele. Por 7 s, um golpe (não especial) pode acertar uma cópia no lugar dele — a cópia se desfaz.',
      energyCost: 30,
      cooldown: 22,
      duration: 7,
      copies: 3,
      spacing: 1.1,
      perCopy: 0.22,
      color: GOLD,
    },
    {
      id: 'espirais',
      name: 'Espirais da Perdição',
      input: 'block+jump', // R2 + ×
      type: 'doomSpirals',
      description: 'Marca o chão do alvo com um anel de espirais; se ele não sair, elas sobem pelo corpo: por 5 s fica LENTO e os golpes dele perdem força.',
      energyCost: 25,
      cooldown: 14,
      range: 11,
      radius: 1.6,
      delay: 0.55,
      duration: 5,
      slow: 0.6,
      weaken: 0.75,
      damage: 12,
      color: MORTE,
      ai: { max: 10.5 },
    },
    {
      id: 'cicatrizacao',
      name: 'Cicatrização',
      input: 'ranged+back', // ← + □
      type: 'agingHeal',
      description: 'Acelera o tempo nas feridas: recupera vida em instantes — mas envelhece. A cada uso o cabelo fica mais grisalho.',
      energyCost: 30,
      cooldown: 26,
      heal: 85,
      duration: 2.4,
      style: 'mist',
      maxAge: 3,
      color: 0xb8b4c0,
    },
  ],

  // REGISTRO DO OUTRO LADO (nome do jogo): olha o adversário pela câmera e grava; a imagem chia, cópias dele surgem em
  // volta do alvo e todas cortam junto (o Embaralhar); a última facada solta a espiral de Morte; e ele confere a gravação
  special: {
    name: 'Registro do Outro Lado',
    banner: 'Registro do Outro Lado',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: GOLD,
    sound: 'specialStart',
    damage: 250,
    element: 'morte',
    prepare: { anim: 'film_cam', time: 0.7 },
    dash: { speed: 22, maxTime: 0.45, contact: 1.6 },
    copies: { at: 0.55, until: 2.9, count: 3, radius: 1.5, color: GOLD },
    hits: [
      { t: 0.1, anim: 'film_cam', dur: 0.55, share: 0, noHit: true },
      { t: 0.75, anim: 'knife_1', dur: 0.24, share: 0.12, fx: { kind: 'slash' }, sound: 'bladeHit' },
      { t: 1.05, anim: 'knife_2', dur: 0.24, share: 0.12, fx: { kind: 'slash' }, sound: 'bladeHit' },
      { t: 1.35, anim: 'thrust', dur: 0.28, share: 0.14, fx: { kind: 'slash' }, sound: 'bladeHit' },
      { t: 1.75, anim: 'dual_cross', dur: 0.42, share: 0.18, fx: { kind: 'slash', big: true }, sound: 'slashFinal' },
      { t: 2.35, anim: 'knife_final', dur: 0.5, share: 0.44, fx: { kind: 'smash', big: true }, sound: 'slashFinal', final: true },
    ],
    outro: { t: 3.05, anim: 'film_cam', dur: 0.7 },
    bannerAt: 0.4,
    length: 3.8,
  },

  passives: [
    { type: 'slowImpact', mult: 0.85 }, // Desacelerar Impacto: projéteis chegam mais devagar nele (−15% de dano)
    { type: 'iKnewIt', mult: 0.85 }, // Eu Já Sabia: resistência mental (−15% de dano de Conhecimento)
  ],
};

export default {
  id: 'guizo',
  name: 'GUIZO',
  model: 'guizo',
  color: '#a01c34',
  origin: 'Os Cinco',
  element: 'morte', // a maioria dos rituais dele é de Morte (tempo e espirais)
  energyColor: MORTE,
  info: {
    weapon: 'Faca de detalhes dourados e a câmera',
    style: 'Cortes rápidos de faca, rituais de Morte e de Conhecimento: cópias, lentidão, definhar e invadir a mente',
    identity: 'O câmera dos Cinco: grava tudo de paranormal — e luta com a faca na outra mão',
    tagline: 'Tô gravando! Isso vai pro site!',
  },
  ...GUIZO_KIT,
  ai: { abilityRate: 1.3 },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): DISTORCER APARÊNCIA — passa a mão no rosto, a imagem chia e
  // ele vira o DISFARCE ALIENÍGENA (o ET das referências), com a faca amaldiçoada pelo Conhecimento — forms/guizo_et.js
  awakening: {
    name: 'Distorcer Aparência',
    banner: 'Distorcer Aparência',
    type: 'maskTransform',
    scene: 'distort',
    form: 'guizo_et',
    formBanner: 'DISFARCE ALIENÍGENA',
    swap: [['etHead', true], ['hair', false]],
    finalAnim: 'film_cam',
    tint: 0x6aff7a,
    sound: 'teleport',
    duration: 0, // até o fim do round
    bonusHealth: 80,
    color: 0x6aff7a,
  },
};
