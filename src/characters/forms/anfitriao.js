// O ANFITRIÃO — forma do Arnaldo Fritz (Transformação: o relógio de bolso com a Relíquia de Energia). Não aparece na
// seleção e fica até o fim do round. Kit TOTALMENTE novo (nada da forma base continua).
// Cânone: portador da Relíquia de Energia — entidade de Energia com complementos de Conhecimento e Medo; manifestação
// do caos e da imprevisibilidade, obcecada em trazer agonia à Realidade com JOGOS de regras imprevisíveis (precisa de
// plateia). Distorce a Realidade conforme a vontade dele; percepção cronológica distorcida (sabe o que vai acontecer).
// Visual: máscara de gás com o Símbolo do Anfitrião e olhos roxos, cabos, o relógio de ouro brilhando em roxo e
// girando sem parar no braço esquerdo, aura roxa/rosa/azul.
// Equilíbrio: o aleatório fica só no "sabor" (efeito do tiro, regra sorteada, casa da roleta), nunca no acerto — tudo
// que acerta de longe tem aviso. Todo o sorteio passa por combat/chaos.js (raridade, histórico, combinações).
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
  anims: { idle: 'idle_host', run: 'run', charge: 'charge', victory: 'vic_anfitriao', block: 'block' },
  quirks: true, // manias do Anfitrião (chaos.js tickHostQuirks): cabeça torta, risadas, tique-taque, passos que "pulam"
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

  // □: DISPARO DO CAOS — cada tiro sorteia uma de 8 cores (raridade + histórico, às vezes duas combinadas) e a cor diz
  // o efeito: ROXO impacto · AZUL distorção (lento) · ROSA repulsão · AMARELO choque · VERDE troca de lugar ·
  // VERMELHO explosão · BRANCO duplicação · PRETO falha (some no meio do caminho e volta de outra direção).
  // □ + direção soltam três habilidades do kit (cada uma com a sua recarga; recarregando, sai o tiro normal).
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
    cooldown: 2.2,
    energyCost: 0,
    visual: 'chaos',
    color: PURPLE,
    element: 'energia',
    sound: 'shockwave',
    hitSound: 'impact',
    chaosShot: true,
    variants: {
      forward: { ability: 'chicotada' },
      back: { ability: 'tradicao' },
      side: { ability: 'plateia' },
    },
  },

  abilities: [
    {
      id: 'regraDoCaos',
      name: 'Regra do Caos',
      input: 'carga+physical', // △ → ○
      type: 'chaosRule',
      description: 'Impõe uma de 8 regras por 6 s (não pular, não correr, não defender, não ficar parado, não atacar, permanecer em movimento, trocar de direção, aproximar-se). Vale para os DOIS: quem quebrar leva um castigo sorteado (raio, choque, empurrão, explosão ou atordoamento) — o Anfitrião conhece o jogo e leva metade.',
      energyCost: 25,
      cooldown: 18,
      windup: 0.5,
      duration: 6,
      damage: 45,
      ownerMult: 0.5,
      color: PURPLE,
    },
    {
      id: 'multiplicacao',
      name: 'Multiplicação',
      input: 'carga+ranged', // △ → □
      type: 'hostClones',
      description: 'Duas cópias de Energia (5 s): cercam, batem, correm e EXPLODEM no fim perto do alvo. Às vezes ele troca de lugar com uma delas — quem é o verdadeiro?',
      energyCost: 30,
      cooldown: 20,
      clones: 2,
      duration: 5,
      swapChance: 0.4,
      color: PINK,
    },
    {
      id: 'distorcao',
      name: 'Distorção',
      input: 'carga+jump', // △ + ×
      type: 'hostDistortion',
      description: 'Some numa dobra da Realidade e reaparece atrás, do lado ou longe do adversário, que fica virado para o lado errado. Nem sempre funciona: às vezes o truque falha e ele surge na frente.',
      energyCost: 15,
      cooldown: 7,
      range: 14,
      gone: 0.32,
      surprise: 0.6,
      recovery: 0.3,
      color: PINK,
    },
    {
      id: 'tempoDistorcido',
      name: 'Tempo Distorcido',
      input: 'block+jump', // R2 + ×
      type: 'hostTime',
      description: 'Os ponteiros enlouquecem: 6 s mais rápido (anda e bate), recupera as esquivas e o tempo pesa em volta do adversário por 3 s.',
      energyCost: 25,
      cooldown: 20,
      duration: 6,
      speedMult: 1.25,
      atkSpeed: 1.12,
      refillDodges: 4,
      slow: 0.75,
      slowTime: 3,
      range: 14,
      color: BLUE,
    },
    {
      id: 'orfanato',
      name: 'Jogo do Orfanato',
      input: 'carga+dodge', // △ + L2
      type: 'orphanGame',
      description: 'Chamas de Energia em volta da arena e a luz fica roxa por 8 s. A regra do orfanato: quem passar 4 s sem usar um ritual perde sanidade e leva dano de Energia.',
      energyCost: 30,
      cooldown: 26,
      duration: 8,
      tick: 1.5,
      drain: 10,
      damage: 14,
      radius: 7,
      color: PURPLE,
    },
    {
      id: 'botao',
      name: 'Botão do Anfitrião',
      input: 'block+carga', // R2 + △
      type: 'hostButton',
      description: 'O Anfitrião estala os dedos e leva os dois ao início da arena. Corra até o botão no centro e aperte o botão físico antes do adversário para lançar um evento aleatório do caos contra ele.',
      energyCost: 20,
      cooldown: 14,
      pressAt: 0.75,
      color: PINK,
    },
    {
      id: 'chicotada',
      name: 'Chicotada do Caos',
      input: 'ranged+forward', // frente + □
      type: 'chaosWhip',
      description: 'Os cabos de Energia viram chicote (alcance 8 m); o estalo tem um efeito sorteado: puxa, dá choque, deixa lento ou joga para o alto.',
      energyCost: 15,
      cooldown: 6,
      windup: 0.28,
      recovery: 0.3,
      damage: 38,
      range: 8,
      color: PINK,
    },
    {
      id: 'tradicao',
      name: 'Tradição de Família',
      input: 'ranged+back', // trás + □
      type: 'familyTradition',
      description: 'Junta Energia entre as mãos (parado, dá para interromper) e explode em volta de si (3,4 m), lançando.',
      energyCost: 30,
      cooldown: 16,
      windup: 0.85,
      recovery: 0.4,
      radius: 3.4,
      range: 3.4,
      damage: 72,
      knockback: 7,
      ai: { max: 3.2 },
      color: PURPLE,
    },
    {
      id: 'plateia',
      name: 'A Plateia',
      input: 'ranged+side', // lado + □
      type: 'hostAudience',
      description: 'Vira para a plateia, faz uma reverência e recebe os aplausos: +20 de sanidade e, por 8 s, rituais e □ 20% mais fortes e o caos mais generoso com o raro. Fica aberto durante o número.',
      energyCost: 10,
      cooldown: 22,
      duration: 8,
      damageMult: 1.2,
      affects: ['ranged', 'ability'],
      energy: 20,
      animTime: 1.2,
      ai: { min: 6 },
      color: PINK,
    },
  ],

  // O JOGO DO ANFITRIÃO: aviso claro (o relógio sobe, sigilo no alvo); se conectar, vira um programa de auditório:
  // apresentador → palco → roleta de 7 casas → resultado → reverência. Dano sempre entre 200 e 300
  // (specials/hostGame.js)
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
    { type: 'chronoSense', cooldown: 15 }, // Percepção Anacrônica: de 15 em 15 s desvia sozinho de um golpe (e já sabe o próximo)
  ],
};
