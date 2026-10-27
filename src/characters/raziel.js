// RAZIEL (id: raziel) — líder dos VAMPIROS (Hexatombe). Wiki "Raziel" + Sobrevivendo ao Horror (o representante da
// trilha Monstruoso, Sangue, Combatente): 1,90 m, forte, a pele DESCARNADA e o rosto deformado pelo Sangue — sem olhos,
// sem nariz, sem cabelo, a boca de fera com os dentes amarelados; o casacão até o chão de ombros altos e gola alta, o
// forro vermelho, os laços dourados e a pedra vermelha. Culto e educado como um aristocrata antigo ("Eu espero que
// vocês aproveitem esse banquete tanto quanto a gente!") até mostrar a intenção assassina; ataca "como um vulto".
// 390 PV (a Intenção do Remi viu). Ficha → golpes:
//   GARRAS e a MORDIDA (morde o Henri e "se delicia com o sangue")          → o físico de garras e a Mordida
//   ENDURECER SANGUE (camada rígida sobre as vestes: resistência a dano)     → Endurecer Sangue (R2 + △)
//   BOTE RETALHADOR (até 105 de dano; quem desvia toma metade)              → Bote Retalhador (△ → ○)
//   MALDIÇÃO SANGUÍNEA (apodrece o sangue: abalado, -1 dado em tudo)        → Maldição Sanguínea (△ + L2)
//   TURNO EXTRA (duas ações por rodada)                                     → finalizador abre a ação extra (passiva extraTurn)
//   AFINIDADE COM SANGUE e o gosto pelo sangue                              → as garras sugam um pouco de vida
//   a CEIA DOS VAMPIROS (o banquete na Igreja Antiga)                        → o especial Banquete de Sangue
//   a VERDADEIRA FORMA (rasga as vestes; corpo descarnado, costelas à mostra, a língua) → a Transformação
// Equipe: VAMPIROS (Alvira, Velisar, Zéfero, Sabara) — Sangue.
const BLOOD = 0xb01020;
const CRIMSON = 0xff2a3d;

export const RAZIEL_KIT = {
  stats: { moveSpeed: 8.2, attackSpeed: 1.12 }, // Turno Extra: rápido como um vulto
  anims: { idle: 'idle_raziel', run: 'run', charge: 'db_charge', victory: 'vic_raziel', block: 'db_block' },
  chargeFx: { style: 'default', color: BLOOD },
  brightBloodArmor: true, // a crosta do Endurecer Sangue mais viva e molhada: o casacão já é vermelho-sangue
  dodge: { style: 'default', distance: 5.0 },

  melee: {
    name: 'Garras',
    // as garras longas rasgando em sequência; a última abre o alvo
    strikes: [
      { name: 'Garra', anim: 'db_claw_r', dur: 0.28, active: [0.08, 0.15], damage: 24, range: 2.0, arc: 120, knockback: 0.8, lunge: 1.2, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON, tilt: 0.1 } },
      { name: 'Garra de volta', anim: 'db_claw_l', dur: 0.28, active: [0.08, 0.15], damage: 24, range: 2.0, arc: 120, knockback: 0.8, lunge: 1.1, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON, flip: true } },
      { name: 'Rasgo cruzado', anim: 'db_cross', dur: 0.4, actives: [[0.12, 0.18], [0.22, 0.28]], damage: 30, range: 2.0, arc: 130, knockback: 1.0, lunge: 1.0, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
      { name: 'Retalhar', anim: 'db_rend', dur: 0.5, active: [0.18, 0.3], damage: 52, range: 2.2, arc: 150, lunge: 1.5, finisher: 'launch', bleed: { dps: 4, duration: 2 }, sound: 'slashFinal', hitSound: 'clawHit', trail: { color: BLOOD, big: true } },
    ],
    up: { name: 'Garra de baixo', anim: 'db_up', dur: 0.4, active: [0.13, 0.23], damage: 38, range: 2.0, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON, tilt: -0.6 } },
    down: { name: 'Esmagar', anim: 'db_down', dur: 0.5, active: [0.22, 0.32], damage: 44, range: 2.0, arc: 140, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4 },
    forward: { name: 'Como um vulto', anim: 'db_dash', dur: 0.4, active: [0.12, 0.24], damage: 34, range: 2.2, arc: 110, knockback: 1.8, motion: [{ t: [0, 0.22], fwd: 7.0, stopClose: true }], sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
    back: { name: 'Recua e rasga', anim: 'db_cross', dur: 0.48, actives: [[0.26, 0.32], [0.36, 0.42]], damage: 30, range: 2.1, arc: 120, knockback: 1.6, iframes: [0, 0.2], motion: [{ t: [0, 0.16], back: 2.6 }, { t: [0.2, 0.34], fwd: 2.6, stopClose: true }], sound: 'blade', hitSound: 'clawHit' },
    side: { name: 'Garra em giro', anim: 'db_claw_l', dur: 0.34, active: [0.1, 0.19], damage: 30, range: 2.1, arc: 150, knockback: 1.4, motion: [{ t: [0, 0.22], side: 2.8 }], sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
    air: { name: 'Garras do alto', anim: 'db_air', dur: 0.44, active: [0.14, 0.3], damage: 36, range: 2.0, arc: 120, knockback: 2.8, slam: 16, vertical: 2.4, sound: 'blade', hitSound: 'clawHit', trail: { color: CRIMSON } },
  },

  // □: VULTO RETALHADOR — no cânone o Raziel não atira nada: luta de perto e se move "como um vulto" (ep. 9). O □ é a
  // investida longa (10 m) que atravessa a arena e termina num X de garras que faz sangrar (TODO RZ-04, opção B; antes
  // era a meia-lua de sangue, uma licença sem base na ficha). Diferente do Frente + ○ (o bote curto do combo).
  ranged: {
    name: 'Vulto Retalhador',
    type: 'dashStrike',
    description: 'Some num vulto: avança 10 m numa linha e, se encontra o adversário, rasga em X com as duas garras (faz sangrar).',
    anim: 'db_dash',
    windup: 0.14,
    distance: 10,
    speed: 34,
    recovery: 0.32,
    range: 1.6,
    aiRange: 10, // a CPU usa de longe (o range é o alcance do corte no fim da investida)
    damage: 30,
    knockback: 2.0,
    hitstun: 0.45,
    xSlash: true,
    bleed: { dps: 3, duration: 1.5 },
    cooldown: 2.6,
    energyCost: 0,
    color: CRIMSON,
    trailKind: 'smoke',
    element: 'sangue',
    startSound: 'blink',
    hitSound: 'clawHit',
  },

  abilities: [
    {
      id: 'boteRetalhador',
      name: 'Bote Retalhador',
      input: 'carga+physical', // △ → ○
      type: 'heavyBlow',
      description: 'Agacha, salta sobre o adversário e desce rasgando com as duas garras: o golpe mais forte dele, que faz sangrar. Quem ESQUIVA ainda toma METADE (como na ficha). Aguenta um golpe na preparação; se errar, fica exposto.',
      energyCost: 30,
      cooldown: 12,
      anim: 'raziel_pounce',
      duration: 0.95,
      armorFrom: 0.05,
      impact: 0.62,
      step: 10,
      stepTime: 0.32,
      track: true,
      range: 2.8,
      arc: 150,
      damage: 84, // 92 → 84 (v3.47.0)
      knockback: 2.2,
      bleed: { dps: 5, duration: 3 },
      grazeOnDodge: 0.5,
      element: 'sangue',
      whiffRecovery: 0.4,
      hitSound: 'clawHit',
      color: BLOOD,
    },
    {
      id: 'mordida',
      name: 'Mordida',
      input: 'carga+ranged', // △ → □
      type: 'vampireBite',
      description: 'Dá o bote curto e, se alcança, segura pelo pescoço e morde duas vezes: tira vida, faz sangrar e CURA o Raziel com o sangue que bebe.',
      energyCost: 20,
      cooldown: 9,
      duration: 0.95,
      step: 9,
      range: 1.7,
      hold: 0.9,
      damage: 28,
      drain: 0.6,
      bleed: { dps: 4, duration: 2.5 },
      color: BLOOD,
    },
    {
      id: 'endurecerSangue',
      name: 'Endurecer Sangue',
      input: 'block+carga', // R2 + △
      type: 'heavyProtection',
      description: 'Endurece o próprio sangue numa crosta rígida por cima das vestes: por 6 s recebe bem menos dano de tudo e aguenta golpes sem recuar.',
      energyCost: 25,
      cooldown: 16,
      duration: 6,
      takenMult: 0.6,
      armor: 3,
      bloodArmor: true,
      label: 'ENDURECER SANGUE',
      color: BLOOD,
    },
    {
      id: 'maldicaoSanguinea',
      name: 'Maldição Sanguínea',
      input: 'carga+dodge', // △ + L2
      type: 'bloodCurse',
      // ficha: o alvo fica abalado (−1 dado em tudo) → aqui: bate 20% mais fraco e apanha 10% mais por 6 s (no ar
      // ~43% do tempo com a recarga de 14 s); renova sem acumular; quem DEFENDE na hora resiste a metade do tempo
      description: 'Aponta e APODRECE o sangue do adversário: ele fica ABALADO por 6 s (bate 20% mais fraco e apanha 10% mais), pingando sangue podre. Quem estiver defendendo resiste a metade do tempo.',
      energyCost: 25,
      cooldown: 14,
      windup: 0.45,
      range: 13,
      duration: 6,
      mult: 0.8,
      takenMult: 1.1,
      damage: 18,
      color: BLOOD,
    },
  ],

  // BANQUETE DE SANGUE (a Ceia dos Vampiros: "Eu espero que vocês aproveitem esse banquete tanto quanto a gente!"):
  // avança como um vulto, rasga com as garras, segura e morde — cada mordida cura — e termina arremessando
  special: {
    name: 'Banquete de Sangue',
    banner: 'Banquete de Sangue',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: BLOOD,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'vic_raziel', time: 0.5 },
    dash: { speed: 22, maxTime: 0.45, contact: 1.8 },
    hits: [
      { t: 0.6, anim: 'db_claw_r', dur: 0.28, share: 0.12, fx: { kind: 'cross', color: CRIMSON }, sound: 'clawHit' },
      { t: 0.9, anim: 'db_claw_l', dur: 0.28, share: 0.12, fx: { kind: 'cross', color: CRIMSON }, sound: 'clawHit' },
      { t: 1.25, anim: 'raziel_feast', dur: 0.45, share: 0.16, fx: { kind: 'punch', color: BLOOD }, sound: 'clawHit', victimAnim: 'stun', drain: 0.6, bleed: { dps: 4, duration: 2 } },
      { t: 1.75, anim: 'raziel_feast', dur: 0.45, share: 0.16, fx: { kind: 'punch', color: BLOOD }, sound: 'clawHit', victimAnim: 'stun', drain: 0.6 },
      { t: 2.3, anim: 'db_rend', dur: 0.55, share: 0.44, fx: { kind: 'cross', big: true, color: BLOOD, color2: CRIMSON }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.2,
    length: 3.3,
  },

  passives: [
    { type: 'lifesteal', ratio: 0.05 }, // o gosto pelo sangue: cada garra devolve um pouco de vida (0,08 → 0,05: v3.47.0, ganhava 9 de 10)
    // TURNO EXTRA (duas ações por rodada): o finalizador do combo que entra abre 2 s em que a próxima habilidade não
    // entra em recarga (uma vez a cada 10 s)
    { type: 'extraTurn', window: 2, cooldown: 10, color: CRIMSON },
    // AFINIDADE COM SANGUE (ficha: Combatente, trilha Monstruoso): os rituais de Sangue dele batem 10% mais forte e ele
    // resiste a 15% dos rituais de Sangue dos outros. As penalidades de interpretação/progressão do Monstruoso não entram
    { type: 'elementalAffinity', element: 'sangue', mult: 1.1, resist: 0.85 },
  ],
};

export default {
  id: 'raziel',
  name: 'RAZIEL',
  model: 'raziel',
  color: '#b01020',
  origin: 'Vampiros', // o líder dos Vampiros em Hexatombe
  element: 'sangue',
  energyColor: BLOOD,
  info: {
    weapon: 'Garras, a Mordida e os rituais de Sangue',
    style: 'Aristocrata predador: garras rápidas, o bote retalhador, morde para se curar e endurece o sangue para aguentar',
    identity: 'O líder dos Vampiros e anfitrião da Ceia na Igreja Antiga — por baixo das vestes, a verdadeira forma',
    tagline: 'Eu espero que vocês aproveitem esse banquete.',
  },
  ...RAZIEL_KIT,
  ai: { abilityRate: 1.25 },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): O VERDADEIRO RAZIEL — rasga a parte de cima das roupas e
  // mostra o corpo descarnado (as costelas, os braços rasgados até o osso, a língua); fica descontrolado até o fim do round
  awakening: {
    name: 'O Verdadeiro Raziel',
    banner: 'O Verdadeiro Raziel',
    type: 'maskTransform',
    form: 'raziel_verdadeiro',
    formBanner: 'O VERDADEIRO RAZIEL',
    anim: 'taunt_roar',
    startSound: 'fearGaze',
    sound: 'powerUp',
    tint: 0xff1a2a,
    duration: 0,
    bonusHealth: 80,
    color: BLOOD,
  },
};
