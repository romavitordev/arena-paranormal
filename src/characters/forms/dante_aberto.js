// DANTE — OLHOS ABERTOS (Calamidade). Não aparece na seleção: o Dante vira esta forma na Transformação (Barra cheia +
// vida baixa, segurando △) e fica assim até o fim do round.
// Cânone (wiki "Dante", Aparência → Olhos abertos): "Ao abrir seus olhos, Dante apresenta mudanças em sua forma,
// decorrente de sua afinidade com o elemento Morte: suas tatuagens reaparecem, seus olhos se tornam completamente
// pretos e duas faixas surgem [...] e suas orelhas ficam levemente pontudas — uma aparência geral bastante similar à de
// um Luzidio". Na transcendência em Semper Clausa, a voz lhe disse para "se aliar ao tempo" e proteger o futuro.
// Visual: o mesmo modelo com as texturas e as orelhas trocadas (models/props.js → addDanteAbertoProps).
// Kit melhorado (aprovado pelo usuário):
//   □ DECADÊNCIA "Decadenza" — a versão de Calamidade: a fumaça preta sai da BOCA, vai mais longe e definha por mais tempo
//   △ → □ TRINITÁ APRIMORADO — 4 cópias que lutam sozinhas; com elas em campo, apertar de novo TROCA DE LUGAR com uma
//   △ → ○ TENTÁCULOS DE LODO — área maior, prendem por mais tempo
//   R2 + △ PARADISO "aliado ao tempo" — cura mais e não envelhece
//   △ + L2 PARADOXO (novo) — a grande espiral preta no chão: definha, deixa lento e apodrece as invocações inimigas
//   R2 + × ECO ESPIRAL "Eco Dolor" (novo) — a silhueta negra do alvo repete cada golpe dele
//   ← + □ DESTRUIÇÃO TEMPORAL "Rotura" — o ritual que ocupava o △ + L2
//   especial A MARIONETE — a foice também corta à distância
//   passiva nova MARCADO PELA MORTE — recebe menos dano de Morte
import base from '../dante.js';

const PALE = 0xc4bfd2;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'dante_aberto',
  form: true,
  baseId: 'dante',
  name: 'DANTE',
  model: 'dante_aberto',
  energyColor: 0x6a6478,
  info: {
    ...base.info,
    style: 'De olhos abertos: a afinidade com a Morte toma o corpo — cópias que lutam, a espiral do Paradoxo e o Eco',
    identity: 'Olhos Abertos (até o fim do round)',
    tagline: 'Me aliei ao tempo.',
  },
  stats: { ...base.stats, maxHealth: 1600 }, // cabe a vida extra da transformação
  chargeFx: { style: 'aura', color: 0x6a6478, smoke: 0x0c0a0e },
  ranged: {
    ...base.ranged,
    name: 'Decadência "Decadenza"',
    description: 'A versão de Calamidade: a fumaça preta sai da BOCA e vai até o alvo — as espirais apertam e ele DEFINHA por mais tempo. Dá para esquivar quando as espirais fecham.',
    range: 11,
    damage: 72,
    cooldown: 7,
    decay: { dps: 6, duration: 4 },
    fromMouth: true,
    ai: { max: 10.5 },
    variants: { back: { ability: 'rotura' } }, // ← + □: Destruição Temporal "Rotura"
  },
  abilities: [
    {
      ...byId.trinita,
      name: 'Trinitá Aprimorado',
      description: 'Vira um vulto e deixa 4 cópias de Lodo que lutam sozinhas (cercam e batem). Com elas em campo, apertar de novo TROCA DE LUGAR com uma cópia — a mais longe do adversário quando ele está em cima, senão a mais perto dele. Um golpe (não especial) ainda pode pegar numa cópia no lugar dele.',
      copies: 4,
      perCopy: 0.17,
      duration: 9,
      cooldown: 20,
      recast: true,
    },
    { ...byId.tentaculos, name: 'Tentáculos de Lodo', radius: 2.6, hold: 1.4, stun: 1.8, damage: 78, cooldown: 10 },
    { ...byId.paradiso, name: 'Paradiso "Aliado ao Tempo"', description: 'Aliado ao tempo: acelera a cicatrização das feridas — recupera mais vida, e de olhos abertos não envelhece.', heal: 110, noAging: true, cooldown: 22 },
    {
      id: 'paradoxo',
      name: 'Paradoxo',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'paradox',
      description: 'Faz uma espiral no ar com a mão: a névoa preta forma uma GRANDE ESPIRAL no chão embaixo do adversário. Quem fica em cima definha e fica lento; invocações inimigas apodrecem rápido.',
      energyCost: 30,
      cooldown: 16,
      cast: 0.6,
      range: 10,
      radius: 3,
      life: 5,
      dps: 16,
      npcDps: 60,
      slow: 0.65,
      element: 'morte',
      color: PALE,
      ai: { max: 9.5 },
    },
    {
      id: 'ecoDolor',
      name: 'Eco Espiral "Eco Dolor"',
      input: 'block+jump', // R2 + × / RT + A
      type: 'echoPain',
      description: 'As mãos uma sobre a outra na frente do rosto e um sopro: cria a SILHUETA NEGRA do alvo. Por 6 s, cada golpe do Dante nele é repetido pelo vulto logo depois (40% do dano).',
      energyCost: 25,
      cooldown: 18,
      cast: 0.55,
      range: 10,
      duration: 6,
      echo: 0.4,
      delay: 0.35,
      element: 'morte',
      color: PALE,
      ai: { max: 9 },
    },
    { ...byId.rotura, input: 'ranged+back' }, // ← + □
  ],
  special: { ...base.special, ranged: true }, // a Marionete invocada de olhos abertos: o corte à distância da foice
  passives: [...base.passives, { type: 'deathMarked', mult: 0.8 }],
};
