// DALMO MAGNO — "O COLOSSO" (id: dalmo) — Mascarados (Natal Macabro / Hexatombe), parceiro do Mutilador Noturno e da Jae.
// Motorista de ônibus simpático por fora; gladiador das arenas do submundo ocultista por dentro, lutando por dinheiro
// para o tratamento da filha, Manu ("O sangue podia até pagar bem, mas para Dalmo... a glória era viciante").
// "Eu sou grande, mas não sou dois." Finalizava os adversários esmagando o crânio com as mãos (wiki). 1,85 m, enorme.
// Ficha (Hexatombe): FOR 4, VIG 3, AGI 1, INT 1, PRE 1 → o mais forte e resistente dos Mascarados, lento.
// Habilidades da ficha: GOLPES DE ARENA (acertou o corpo a corpo → ataque desarmado extra ou manobra) e PRESSÃO
// ATMOSFÉRICA (+dano de Energia e o alvo ATORDOADO). Arsenal: as MANOPLAS DO COLOSSO (amaldiçoadas com Energia: cada
// soco vem com uma pressão atmosférica demolidora) — no jogo elas vêm com o escafandro, na Transformação.
// Referências: Referencias visuais/Personagens/Dalmo (+ dossie_dalmo_arena_paranormal.txt) e a wiki.
// Lutador de curta distância: socos pesados, cabeçadas, agarrões e o chão — ataques com preparação e recuperação
// visíveis, nada de acrobacia nem de arremesso: o □ é o PODE VIR!, a postura de contra-ataque (segura o golpe e devolve).
// TRANSFORMAÇÃO: põe o escafandro (segura no peito, ergue e encaixa; agacha de braços abertos e a aura vermelha
// explode — o gif) e vira O COLOSSO até o fim do round (forms/colosso.js).
const RED = 0xc8281e;
const PRESS = 0xffb070; // a onda de pressão das Manoplas

export const DALMO_KIT = {
  stats: { moveSpeed: 7.0, maxHealth: 1300 }, // VIG 3: aguenta muito; AGI 1: lento (só o Lírio é mais lento)
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge_fists', victory: 'vic_dalmo', block: 'block' },
  chargeFx: { style: 'fists', color: 0xe8b070 },
  dodge: { style: 'default', distance: 4.0 }, // pesado: esquiva curta

  melee: {
    name: 'Golpes de Arena',
    // socos curtos e pesados de quem viveu nas arenas: empurram, têm peso e o último derruba
    strikes: [
      { name: 'Direto pesado', anim: 'cross', dur: 0.3, active: [0.09, 0.17], damage: 30, range: 1.9, arc: 100, knockback: 1.0, lunge: 1.0, sound: 'swing', hitSound: 'heavyPunch', hand: 'R' },
      { name: 'Cruzado', anim: 'hook_l', dur: 0.34, active: [0.11, 0.19], damage: 32, range: 1.9, arc: 140, knockback: 1.1, lunge: 0.9, sound: 'swing', hitSound: 'heavyPunch', hand: 'L' },
      { name: 'Cotovelada', anim: 'sway_elbow', dur: 0.32, active: [0.1, 0.18], damage: 30, range: 1.6, arc: 110, knockback: 0.9, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Joelhada', anim: 'knee', dur: 0.34, active: [0.12, 0.2], damage: 32, range: 1.5, arc: 100, knockback: 1.0, lunge: 0.9, sound: 'swing', hitSound: 'kick' },
      // o fim do combo: o Golpes de Arena emenda uma cabeçada sozinho quando entra
      { name: 'Soco de arena', anim: 'heavy_punch', dur: 0.5, active: [0.2, 0.29], damage: 58, range: 2.0, arc: 100, lunge: 1.6, finisher: 'launch', hitstop: 0.1, sound: 'swing', hitSound: 'heavyPunch', hand: 'R', impactScale: 1.9 },
    ],
    up: { name: 'Gancho ascendente', anim: 'uppercut', dur: 0.44, active: [0.14, 0.24], damage: 44, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.5 },
    down: { name: 'Pisão', anim: 'stomp', dur: 0.62, active: [0.3, 0.4], damage: 54, range: 1.8, arc: 140, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.8, hitstop: 0.1 },
    forward: { name: 'Ombrada', anim: 'shoulder_bash', dur: 0.46, active: [0.16, 0.3], damage: 40, range: 1.9, arc: 110, knockback: 2.2, guardCrush: true, motion: [{ t: [0, 0.3], fwd: 5.5, stopClose: true }], sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.5 },
    back: { name: 'Cabeçada', anim: 'headbutt', dur: 0.44, active: [0.2, 0.3], damage: 40, range: 1.5, arc: 90, knockback: 1.6, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4 },
    side: { name: 'Gancho de lado', anim: 'hook_r', dur: 0.36, active: [0.12, 0.21], damage: 34, range: 1.9, arc: 150, knockback: 1.3, motion: [{ t: [0, 0.2], side: 2.2 }], sound: 'swing', hitSound: 'heavyPunch' },
    air: { name: 'Martelada no ar', anim: 'meteor_punch', dur: 0.48, active: [0.16, 0.36], damage: 44, range: 1.9, arc: 110, knockback: 4, slam: 20, vertical: 2.4, sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.6 },
  },

  // □: PODE VIR! — o Dalmo não arremessa nada: se planta de braços abertos e chama o adversário ("eu sou grande, mas
  // não sou dois"). Se levar um golpe físico ou uma habilidade de frente nessa hora, SEGURA o golpe, agarra quem bateu
  // pela gola, dá uma cabeçada e empurra longe (o lutador de arena que aguenta o soco para devolver). Projéteis e
  // especiais passam; se ninguém bater, ele fica aberto na recuperação.
  ranged: {
    name: 'Pode Vir!',
    type: 'counter',
    description: 'Se planta de braços abertos e chama: um golpe físico ou habilidade que chegar de frente é segurado — ele agarra quem bateu, dá uma cabeçada e empurra longe. Não segura projéteis nem especiais; no vazio, fica aberto.',
    window: [0.1, 0.85],
    recovery: 0.4,
    reach: 3.4,
    cooldown: 4,
    energyCost: 0,
    damage: 52, // cabeçada + empurrão
    range: 3.4,
    color: 0xe8b070,
    label: 'PODE VIR!',
    riposte: {
      windup: 0.06,
      range: 3.4,
      lunge: 6,
      hold: 0.55,
      blows: 1,
      blowAnims: ['headbutt'],
      blowDamage: 20,
      final: 'throw',
      finalDamage: 32,
      label: 'GOLPE SEGURADO!',
      color: 0xe8b070,
    },
  },

  abilities: [
    {
      id: 'pressaoAtmosferica',
      name: 'Pressão Atmosférica',
      input: 'carga+physical', // △ → ○
      type: 'heavyBlow',
      description: 'Concentra a força num soco que solta uma onda de pressão (dano de Energia): quem é atingido fica ATORDOADO. Aguenta um golpe durante a preparação; errar deixa ele aberto.',
      energyCost: 25,
      cooldown: 11,
      anim: 'heavy_punch',
      duration: 0.95,
      armorFrom: 0.12,
      impact: 0.5,
      step: 6,
      range: 2.4,
      arc: 110,
      damage: 58,
      knockback: 2,
      stun: 1.1,
      pressure: 2.2,
      whiffRecovery: 0.35,
      element: 'energia',
      color: PRESS,
    },
    {
      id: 'agarraoArena',
      name: 'Agarrão de Arena',
      input: 'carga+ranged', // △ → □
      type: 'arenaGrab',
      description: 'Avança e agarra o adversário pela cabeça: duas cabeçadas segurando e bate o corpo dele no chão. Não dá para defender — só esquivar.',
      energyCost: 30,
      cooldown: 12,
      windup: 0.32,
      range: 1.8,
      lunge: 7,
      hold: 1.0,
      blows: 2,
      blowAnims: ['headbutt', 'headbutt'],
      blowDamage: 18,
      final: 'slam',
      finalDamage: 40,
      label: 'AGARRADO PELA CABEÇA!',
      color: RED,
    },
    {
      id: 'investida',
      name: 'Atropelar',
      input: 'carga+dodge', // △ + L2
      type: 'dashStrike',
      description: 'Abaixa o ombro e atropela tudo pela frente como um ônibus desgovernado: quebra a guarda e derruba.',
      energyCost: 20,
      cooldown: 9,
      windup: 0.22,
      distance: 8,
      speed: 17,
      range: 2.0,
      recovery: 0.4,
      damage: 44,
      knockback: 4,
      hitstun: 0.7,
      launch: true,
      guardCrush: true,
      trailKind: 'smoke',
      color: 0x8a7a6a,
      anim: 'shoulder_charge',
      hitSound: 'heavyPunch',
    },
    {
      id: 'gloria',
      name: 'A Glória Era Viciante',
      input: 'block+carga', // R2 + △
      type: 'selfBuff',
      buffType: 'gloria',
      label: 'A GLÓRIA ERA VICIANTE',
      description: 'O grito da plateia na cabeça: por 8 s aguenta 3 golpes sem recuar, bate 15% mais forte e recebe 15% menos dano.',
      energyCost: 30,
      cooldown: 20,
      duration: 8,
      armor: 3,
      damageMult: 1.15,
      affects: ['melee', 'ability'],
      takenMult: 0.85,
      anim: 'taunt_roar',
      animTime: 0.6,
      sound: 'powerUp',
      color: RED,
    },
  ],

  // FINALIZAÇÃO DE ARENA: avança, castiga o corpo, cabeçada, gancho que tira do chão e o PISÃO final — a finalização do
  // Mosto (o fã das lutas contava que o Colosso sempre terminava esmagando o crânio)
  special: {
    name: 'Finalização de Arena',
    banner: 'Finalização de Arena',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: RED,
    sound: 'specialStart',
    physical: true,
    prepare: { anim: 'taunt_roar', time: 0.45, fx: 'stomp' },
    dash: { speed: 18, maxTime: 0.5, contact: 1.9 },
    hits: [
      { t: 0.6, anim: 'body_blow', dur: 0.3, share: 0.1, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 0.92, anim: 'hook_l', dur: 0.3, share: 0.12, fx: { kind: 'smash' }, sound: 'heavyPunch' },
      { t: 1.25, anim: 'headbutt', dur: 0.38, share: 0.14, fx: { kind: 'punch' }, sound: 'heavyPunch' },
      { t: 1.68, anim: 'uppercut', dur: 0.4, share: 0.16, fx: { kind: 'punch', up: true }, sound: 'heavyPunch' },
      { t: 2.3, anim: 'stomp', dur: 0.6, share: 0.48, fx: { kind: 'smash', big: true }, sound: 'heavyPunch', final: true },
    ],
    bannerAt: 0.2,
    length: 3.3,
  },

  passives: [
    { type: 'arenaBlows', damage: 14, delay: 0.16 }, // Golpes de Arena: o finalizador emenda uma cabeçada
    { type: 'heavyHand', knockback: 1.25, hitstun: 0.05 }, // socos de quem é enorme: empurram e seguram mais
  ],
};

export default {
  id: 'dalmo',
  name: 'DALMO',
  model: 'dalmo',
  color: '#b8562e',
  origin: 'Mascarados', // Hexatombe (associação: Assassinos)
  element: 'energia', // as Manoplas do Colosso são amaldiçoadas com Energia
  energyColor: PRESS,
  info: {
    weapon: 'Os punhos; as Manoplas do Colosso na Transformação',
    style: 'Gigante de arena: socos pesados, cabeçadas, agarrões e pisões — lento, mas aguenta tudo',
    identity: 'Gladiador das arenas clandestinas: pondo o escafandro, vira o Colosso',
    tagline: 'Eu sou grande, mas não sou dois.',
  },
  ...DALMO_KIT,
  ai: { abilityRate: 1.3 },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): O COLOSSO — segura o escafandro no peito, ergue, encaixa,
  // a camisa some e aparece o traje; agacha de braços abertos e a aura vermelha explode (o gif) — até o fim do round
  awakening: {
    name: 'O Colosso',
    banner: 'O Colosso',
    type: 'maskTransform',
    scene: 'helmet',
    form: 'colosso',
    formBanner: 'COLOSSO',
    prop: 'helmet',
    swap: [['colosso', true], ['shirt', false], ['laces', false]],
    finalAnim: 'colosso_roar',
    duration: 0, // até o fim do round
    bonusHealth: 120,
    color: RED,
  },
};
