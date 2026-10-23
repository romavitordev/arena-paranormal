// CRISTINO — "o Cangaceiro" / "Lampião" (id: cristino) — Transtornados (Hexatombe). Wiki "Cristino": 45 anos, porte
// robusto, cabelo longo, bigode grosso, um olho cego e cicatrizes; traje de cangaceiro com o chapéu de espinhos, óculos
// de lentes vermelhas, lenço vermelho e o Símbolo de Sangue nas costas. Indiferente, fala só o necessário, prefere agir
// sozinho e é TÁTICO: caça a presa com vários planos ("Não é pessoal, e eu já disse que não me importo com os joguinhos
// de vocês." / "Eu odeio gente barulhenta."). 120 PV na ficha (o Remi viu pela Intenção) — aguenta muito.
// Arsenal (wiki): ESPINGARDA SOCADEIRA (carrega pela boca; a coronha com a roda de espinhos vira bastão), PEIXEIRA e
// LAMPIÕES EXPLOSIVOS. Momentos do Hexatombe que viram golpe:
//   a armadilha do Quibungo (ep. 5): lampiões no caminho, "um, dois, três", o tiro e o fogo pulando de um para o outro
//     → Lampião Explosivo, Trilha de Lampiões, o tiro que detona os lampiões e o especial Odeio Gente Barulhenta;
//   a Igreja de Sangue (ep. 9): escalou a capela, flanqueou do teto e desceu pela corda → Corda do Telhado;
//   decepou o braço do Raziel com a peixeira; finalizou o Caíto → Decepar (dói mais em quem está preso/atordoado);
//   tocou a Verdadeira Coroa de Espinhos e ficou coberto de rabiscos vermelhos (ep. 9) → a Transformação, o Desertor
//     (forms/cristino_desertor.js), com o rifle das artes e a ligação dele com a Intenção.
// Equipe: Transtornados (os Apóstolos de Sangue de Hexatombe) — Sangue.
const FIRE = 0xff7a2a;
const RUST = 0xd0702c;

export const CRISTINO_KIT = {
  stats: { moveSpeed: 7.5 },
  anims: { idle: 'idle_cristino', run: 'run', charge: 'charge', victory: 'vic_cristino', block: 'block' },
  chargeFx: { style: 'default', color: RUST },
  dodge: { style: 'default', distance: 4.6 },

  melee: {
    name: 'Peixeira',
    // cortes curtos e secos de quem mata sem pressa; o último abre o alvo
    strikes: [
      { name: 'Corte de peixeira', anim: 'knife_1', dur: 0.26, active: [0.07, 0.14], damage: 24, range: 1.7, arc: 110, knockback: 0.8, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd4d0cc, tilt: 0.05 } },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.26, active: [0.07, 0.14], damage: 24, range: 1.7, arc: 110, knockback: 0.8, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd4d0cc, flip: true } },
      { name: 'Estocada', anim: 'thrust', dur: 0.3, active: [0.09, 0.17], damage: 28, range: 1.9, arc: 70, knockback: 0.9, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Cotovelada', anim: 'sway_elbow', dur: 0.32, active: [0.1, 0.18], damage: 28, range: 1.6, arc: 110, knockback: 1.0, lunge: 0.8, sound: 'swing', hitSound: 'heavyPunch' },
      { name: 'Peixeirada', anim: 'knife_final', dur: 0.48, active: [0.17, 0.27], damage: 54, range: 1.9, arc: 120, lunge: 1.5, finisher: 'launch', sound: 'slashFinal', hitSound: 'bladeHit', trail: { color: 0xc01818, big: true, roll: 0.5 } },
    ],
    up: { name: 'Peixeira de baixo', anim: 'slash_up', dur: 0.38, active: [0.12, 0.22], damage: 36, range: 1.8, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd4d0cc, tilt: -0.6 } },
    down: { name: 'Pisão de alpercata', anim: 'stomp', dur: 0.5, active: [0.22, 0.32], damage: 42, range: 1.7, arc: 130, lunge: 0.8, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.3 },
    forward: { name: 'Investida do cangaço', anim: 'dash_slash', dur: 0.4, active: [0.12, 0.23], damage: 32, range: 1.9, arc: 100, knockback: 1.8, motion: [{ t: [0, 0.22], fwd: 5.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd4d0cc } },
    back: { name: 'Recua e corta', anim: 'knife_evade', dur: 0.46, active: [0.26, 0.35], damage: 30, range: 1.8, arc: 100, knockback: 1.8, iframes: [0, 0.2], motion: [{ t: [0, 0.14], back: 2.4 }, { t: [0.18, 0.3], fwd: 2.2, stopClose: true }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Flanco', anim: 'knife_2', dur: 0.32, active: [0.1, 0.18], damage: 30, range: 1.8, arc: 140, knockback: 1.3, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd4d0cc, flip: true } },
    air: { name: 'Peixeira do alto', anim: 'air_knife', dur: 0.4, active: [0.12, 0.28], damage: 34, range: 1.8, arc: 110, knockback: 2.6, slam: 16, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xd4d0cc } },
  },

  // □: ESPINGARDA SOCADEIRA — um tiro de chumbo grosso, forte de perto; carregar pela boca demora (recarga longa).
  // O tiro DETONA EM CADEIA os lampiões dele que estão à frente (o fogo pulando de um para o outro).
  ranged: {
    name: 'Espingarda Socadeira',
    type: 'projectile',
    description: 'Um tiro de chumbo grosso, forte de perto e fraco de longe; carregar pela boca demora. O tiro detona em cadeia os lampiões dele que estão à frente.',
    anim: 'shoot_rifle',
    showProp: 'socadeira',
    hideProp: 'peixeira+gunBack',
    windup: 0.3,
    recovery: 0.5,
    count: 7,
    interval: 0,
    damage: 13,
    range: 12,
    speed: 55,
    radius: 0.3,
    spread: 0.3,
    knockback: 2.8,
    hitstun: 0.36,
    cooldown: 3.2,
    energyCost: 0,
    visual: 'pellet',
    color: 0xffc070,
    sound: 'shotgun',
    hitSound: 'impact',
    ignitesLanterns: { range: 18, arc: 80 },
  },

  abilities: [
    {
      id: 'lampiaoExplosivo',
      name: 'Lampião Explosivo',
      input: 'carga+physical', // △ → ○
      type: 'lanternThrow',
      description: 'Arremessa um lampião de espinhos onde o adversário está: estoura em fogo, joga para cima e deixa o chão queimando por alguns segundos.',
      energyCost: 20,
      cooldown: 8,
      windup: 0.32,
      recovery: 0.3,
      flight: 0.55,
      range: 14,
      radius: 2.2,
      damage: 55,
      knockback: 3.5,
      launch: true,
      fire: { radius: 1.7, life: 5, dps: 16 },
      showProp: 'lantern',
      hideProp: 'peixeira',
      color: FIRE,
    },
    {
      id: 'trilhaLampioes',
      name: 'Trilha de Lampiões',
      input: 'carga+ranged', // △ → □
      type: 'lanternTrap',
      description: 'Agacha e planta um lampião aceso à frente (até 3). Estoura quando o adversário pisa perto — ou quando o tiro da Socadeira passa: aí o fogo pula de lampião em lampião.',
      energyCost: 15,
      cooldown: 4,
      max: 3,
      trigger: 1.0,
      armTime: 0.5,
      life: 20,
      radius: 2.0,
      damage: 42,
      knockback: 3,
      launch: true,
      fire: { radius: 1.5, life: 4, dps: 14 },
      showProp: 'lantern',
      hideProp: 'peixeira',
      color: FIRE,
    },
    {
      id: 'cordaTelhado',
      name: 'Corda do Telhado',
      input: 'carga+dodge', // △ + L2
      type: 'teleportBehind',
      rope: true,
      description: 'Laça uma corda no alto, sobe e cai atrás do adversário já cravando a peixeira (como na Igreja de Sangue). Pega desprevenido.',
      energyCost: 20,
      cooldown: 10,
      distance: 1.5,
      vanishTime: 0.38,
      surpriseTime: 0.5,
      strike: { damage: 40, anim: 'thrust', dur: 0.32, at: 0.08, knockback: 1.4, hitstun: 0.5, sound: 'bladeHit' },
      color: RUST,
    },
    {
      id: 'decepar',
      name: 'Decepar',
      input: 'block+carga', // R2 + △
      type: 'heavyBlow',
      description: 'Ergue a peixeira e desce num golpe que abre a carne: o alvo SANGRA e fica com a FERIDA ABERTA — não se cura por 12 s. Avança e vira para o alvo enquanto prepara. Em quem está atordoado, agarrado ou sendo puxado, entra muito mais fundo. Aguenta um golpe na preparação.',
      energyCost: 25,
      cooldown: 11,
      anim: 'knife_final',
      duration: 0.85,
      armorFrom: 0.08,
      impact: 0.3, // mais rápido (era 0,42): menos tempo para o alvo sair
      step: 7.5,
      stepTime: 0.32, // o avanço começa antes e vai mais longe
      track: true, // vira para o alvo durante a preparação
      range: 2.6,
      arc: 150,
      damage: 60,
      knockback: 1.6,
      bleed: { dps: 6, duration: 4 },
      noHeal: 12, // FERIDA ABERTA: segundos sem cura (renova a cada acerto)
      downBonus: 1.5,
      downLabel: 'DECEPOU!',
      whiffRecovery: 0.35,
      hitSound: 'bladeHit',
      color: 0xc01818,
    },
  ],

  // ODEIO GENTE BARULHENTA (a fala dele no Hexatombe, antes de finalizar o Caíto): cerca o adversário com três lampiões, conta até três e atira — o fogo pula de um para o outro e o
  // amontoado explode (a armadilha do Quibungo)
  special: {
    name: 'Odeio Gente Barulhenta',
    banner: 'Odeio Gente Barulhenta',
    type: 'lanternCount',
    energyCost: 50,
    cooldown: 14,
    range: 16,
    ringRadius: 1.6,
    missRecovery: 0.6,
    trap: { trigger: 1.0, armTime: 0.3, life: 14, radius: 2.0, damage: 42, knockback: 3, launch: true, fire: { radius: 1.5, life: 4, dps: 14 } },
    color: FIRE,
    sound: 'specialStart',
  },

  passives: [
    { type: 'thickSkin', knockback: 0.7, chip: 0.7 }, // Couro Curtido: robusto (120 PV na ficha), segura empurrão e desgaste na defesa
  ],
};

export default {
  id: 'cristino',
  name: 'CRISTINO',
  model: 'cristino',
  color: '#d0702c',
  origin: 'Transtornados', // Hexatombe (os Apóstolos de Sangue)
  element: 'sangue', // o Símbolo de Sangue nas costas; o sacrifício para abrir a porta de Tenebris
  energyColor: RUST,
  info: {
    weapon: 'Peixeira, Espingarda Socadeira e Lampiões Explosivos',
    style: 'Caçador tático: espalha lampiões, atira para o fogo pular de um para o outro e termina na peixeira',
    identity: 'O cangaceiro que não queria jogar o Hexatombe — tocando a Coroa de Espinhos, vira o Desertor',
    tagline: 'Não é pessoal.',
  },
  ...CRISTINO_KIT,
  ai: { abilityRate: 1.2 },

  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): TOCADO PELA COROA — ergue a mão como quem encosta no sino
  // da Verdadeira Coroa de Espinhos e o corpo se enche de rabiscos vermelhos: vira o DESERTOR até o fim do round
  awakening: {
    name: 'Tocado pela Coroa',
    banner: 'Tocado pela Coroa',
    type: 'maskTransform',
    form: 'cristino_desertor',
    formBanner: 'CRISTINO DESERTOR',
    anim: 'cast_up',
    startSound: 'ritual',
    sound: 'powerUp',
    tint: 0xff2a1a,
    duration: 0, // até o fim do round
    bonusHealth: 80,
    color: 0xff2a1a,
  },
};
