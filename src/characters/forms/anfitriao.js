// O ANFITRIÃO — forma do Arnaldo Fritz (Transformação: o relógio de bolso com a Relíquia de Energia). Não aparece na
// seleção e fica até o fim do round. Kit TOTALMENTE novo (nada da forma base continua).
// Cânone: portador da Relíquia de Energia — entidade de Energia com complementos de Conhecimento e Medo; manifestação
// do caos e da imprevisibilidade, obcecada em trazer agonia à Realidade com JOGOS de regras imprevisíveis (precisa de
// plateia). Distorce a Realidade conforme a vontade dele; percepção cronológica distorcida (sabe o que vai acontecer).
// Visual: máscara de gás com o Símbolo do Anfitrião e olhos roxos, cabos, o relógio de ouro brilhando em roxo e
// girando sem parar no braço esquerdo, aura roxa/rosa/azul.
// Equilíbrio: o aleatório fica só no "sabor" (efeito do tiro, regra sorteada, casa da roleta), nunca no acerto — tudo
// que acerta de longe tem aviso.
import base from '../arnaldo.js';

const PURPLE = 0xb04aff;
const PINK = 0xff6ad0;
const BLUE = 0x5aa0ff;

export default {
  ...base,
  id: 'anfitriao',
  form: true,
  baseId: 'arnaldo',
  name: 'O ANFITRIÃO',
  model: 'anfitriao',
  color: '#b04aff',
  element: 'energia',
  energyColor: PURPLE,
  unarmed: true,
  info: {
    weapon: 'A Relíquia de Energia no relógio de bolso',
    style: 'Energia caótica, regras de jogo impostas à Realidade e a roleta do Anfitrião',
    identity: 'Forma O Anfitrião (até o fim do round)',
    tagline: 'Bem-vindos ao meu jogo. As regras? Vocês vão lembrar delas.',
  },
  stats: { moveSpeed: 8.6, attackSpeed: 1.1, maxHealth: 1060 }, // cabe a vida extra da Relíquia (+60)
  anims: { idle: 'idle_fist', run: 'run', charge: 'charge', victory: 'victory', block: 'block' },
  chargeFx: { style: 'default', color: PURPLE },

  // ○: golpes de Energia caótica com o braço do relógio e os cabos — cada golpe numa cor do caos
  melee: {
    name: 'Energia do Caos',
    strikes: [
      { name: 'Tique', anim: 'jab', dur: 0.26, active: [0.07, 0.15], damage: 24, range: 1.9, arc: 100, knockback: 1, lunge: 1.1, sound: 'punch', hitSound: 'impact', trail: { color: PURPLE } },
      { name: 'Taque', anim: 'cross', dur: 0.28, active: [0.08, 0.16], damage: 26, range: 1.9, arc: 100, knockback: 1.1, lunge: 1.1, sound: 'punch', hitSound: 'impact', trail: { color: PINK } },
      { name: 'Ponteiro', anim: 'hook_l', dur: 0.3, active: [0.09, 0.18], damage: 30, range: 2.0, arc: 120, knockback: 1.3, lunge: 1, sound: 'punch', hitSound: 'impact', trail: { color: BLUE } },
      { name: 'Badalada', anim: 'wave_punch', dur: 0.36, active: [0.12, 0.22], damage: 34, range: 2.6, arc: 90, knockback: 1.6, lunge: 1, sound: 'shockwave', hitSound: 'impact', impactFx: 'sigil', trail: { color: PURPLE } },
      { name: 'Hora Marcada', anim: 'meteor_punch', dur: 0.56, active: [0.26, 0.36], damage: 62, range: 2.4, arc: 100, lunge: 1.8, finisher: 'launch', sound: 'heavyPunch', hitSound: 'explosion', impactScale: 1.8, trail: { color: PINK, big: true } },
    ],
    up: { name: 'Ponteiro para o alto', anim: 'uppercut', dur: 0.42, active: [0.14, 0.26], damage: 38, range: 2.0, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'punch', hitSound: 'impact', trail: { color: BLUE } },
    down: { name: 'Fim do Tempo', anim: 'heavy_punch', dur: 0.5, active: [0.2, 0.3], damage: 46, range: 2.1, arc: 110, lunge: 1, finisher: 'knockdown', sound: 'heavyPunch', hitSound: 'explosion', impactScale: 1.5, groundFx: 'smash', groundScale: 0.7 },
    forward: { name: 'Entrada do Apresentador', anim: 'dash_punch', dur: 0.42, active: [0.12, 0.24], damage: 36, range: 2.0, arc: 120, knockback: 2.4, motion: [{ t: [0, 0.22], fwd: 4.8, stopClose: true }], sound: 'punch', hitSound: 'impact', trail: { color: PURPLE } },
    back: { name: 'Contratempo', anim: 'sway_kick', dur: 0.5, active: [0.28, 0.38], damage: 38, range: 2.0, arc: 110, knockback: 2.4, iframes: [0, 0.24], motion: [{ t: [0, 0.15], back: 2.2 }, { t: [0.18, 0.32], fwd: 2.4, stopClose: true }], sound: 'kick', hitSound: 'impact', trail: { color: BLUE } },
    side: { name: 'Giro do Relógio', anim: 'spin_kick', dur: 0.4, active: [0.12, 0.26], damage: 32, range: 2.1, arc: 200, knockback: 1.8, motion: [{ t: [0, 0.22], side: 2.6 }], sound: 'kick', hitSound: 'impact', trail: { color: PINK } },
    air: { name: 'Queda Livre', anim: 'air_kick', dur: 0.42, active: [0.15, 0.3], damage: 36, range: 2.0, arc: 110, knockback: 3, slam: 16, vertical: 2.3, sound: 'kick', hitSound: 'impact', trail: { color: PURPLE } },
  },

  // □: disparo de Energia com efeito SORTEADO a cada tiro (a cor mostra qual saiu): dano / lentidão / empurrão
  ranged: {
    name: 'Disparo do Caos',
    type: 'projectile',
    anim: 'wave_punch',
    origin: 'fist',
    windup: 0.24,
    recovery: 0.3,
    count: 1,
    interval: 0,
    damage: 30,
    range: 18,
    speed: 26,
    radius: 0.5,
    spread: 0,
    knockback: 1.2,
    hitstun: 0.35,
    cooldown: 2.4,
    energyCost: 0,
    visual: 'chaos',
    color: PURPLE,
    element: 'energia',
    sound: 'shockwave',
    hitSound: 'impact',
    chaos: [
      { color: PURPLE, damage: 42 }, // roxo: dano
      { color: BLUE, damage: 24, onHit: { slow: { mult: 0.6, time: 2.2, name: 'TEMPO LENTO' } } }, // azul: lentidão
      { color: PINK, damage: 26, knockback: 6, hitstun: 0.5 }, // rosa: empurrão
    ],
  },

  abilities: [
    {
      id: 'regraDoJogo',
      name: 'Regra do Jogo',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'gameRule',
      description: 'Impõe uma regra sorteada por 6 s, anunciada na tela: proibido pular, defender, correr ou ficar parado. Vale para os DOIS — quem quebrar leva um raio (o Anfitrião conhece o jogo e leva metade).',
      energyCost: 25,
      cooldown: 18,
      windup: 0.5,
      duration: 6,
      damage: 45,
      ownerMult: 0.5,
      color: PURPLE,
    },
    {
      id: 'distorcao',
      name: 'Distorção',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'mindSwap',
      description: 'Distorce a Realidade: os dois trocam de lugar e o adversário volta desorientado, de costas e atordoado.',
      energyCost: 25,
      cooldown: 14,
      range: 14,
      windup: 0.3,
      stun: 0.5,
      surprise: 0.9,
      color: PINK,
    },
    {
      id: 'tempoDistorcido',
      name: 'Tempo Distorcido',
      input: 'block+jump', // R2 + × / RT + A
      type: 'selfBuff',
      buffType: 'deadlySpeed',
      label: 'TEMPO DISTORCIDO',
      anim: 'cast_up',
      description: 'Os ponteiros enlouquecem: fica muito mais rápido por 6 s e recupera todas as esquivas.',
      energyCost: 25,
      cooldown: 20,
      duration: 6,
      speedMult: 1.3,
      refillDodges: 4,
      color: BLUE,
    },
    {
      id: 'plateia',
      name: 'A Plateia',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'selfBuff',
      buffType: 'audience',
      label: 'A PLATEIA',
      anim: 'concentrate',
      description: 'Todo jogo precisa de plateia: por 7 s os rituais e o □ batem 25% mais forte.',
      energyCost: 25,
      cooldown: 20,
      duration: 7,
      damageMult: 1.25,
      affects: ['ranged', 'ability'],
      color: PINK,
    },
  ],

  // O JOGO DO ANFITRIÃO: aviso claro (o relógio sobe, sigilo no alvo); se conectar, a roleta decide o sabor — o dano
  // fica sempre entre 200 e 300 (specials/hostGame.js)
  special: {
    name: 'O Jogo do Anfitrião',
    banner: 'O Jogo do Anfitrião',
    type: 'hostGame',
    energyCost: 50,
    cooldown: 14,
    range: 18,
    minDamage: 200,
    maxDamage: 300,
    steal: 30,
    stun: 1.2,
    color: PURPLE,
  },

  awakening: undefined,

  passives: [
    { type: 'chronoSense', cooldown: 15 }, // Percepção Cronológica: de 15 em 15 s desvia sozinho de um golpe
  ],
};
