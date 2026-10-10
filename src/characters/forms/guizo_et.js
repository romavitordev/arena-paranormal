// GUIZO — DISFARCE ALIENÍGENA (Distorcer Aparência). Não aparece na seleção: o Guizo vira esta forma na Transformação
// (Barra cheia + vida baixa, segurando △) e fica assim até o fim do round.
// Canônico: o ritual Distorcer Aparência (wiki: muda altura, pele, cabelo, voz...) e o disfarce de alienígena da galeria
// ("Guizo ET"); a faca amaldiçoada pelo Conhecimento (miniatura "Guizo em combate com sua adaga amaldiçoada pelo
// Conhecimento"). Adaptação: com a cara do que ele sempre quis encontrar, o lado de Conhecimento toma conta — a faca
// brilha dourada e LÊ o alvo a cada golpe (Leitura), a Rajada Mental sai em três sigilos, o Embaralhar faz 4 cópias e
// a Ligação Telepática (a outra forma do Invadir Mente) deixa o adversário exposto.
import base from '../guizo.js';

const GOLD = 0xe8c860;
const GREEN = 0x6aff7a;
const knowledge = (s) => ({ ...s, damage: Math.round(s.damage * 1.1), element: 'conhecimento', trail: s.trail ? { ...s.trail, color: GOLD } : s.trail });
const M = base.melee;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'guizo_et',
  form: true,
  baseId: 'guizo',
  name: 'GUIZO ET',
  model: 'guizo_et',
  color: '#5ac85a',
  element: 'conhecimento',
  energyColor: GREEN,
  info: {
    weapon: 'A faca amaldiçoada pelo Conhecimento e a câmera',
    style: 'Disfarce alienígena: a faca dourada lê o alvo, três rajadas mentais, quatro cópias',
    identity: 'Distorcer Aparência (até o fim do round)',
    tagline: 'Eu sou o que eu sempre quis encontrar!',
  },
  stats: { moveSpeed: 8.3, maxHealth: 1060 }, // cabe a vida extra do disfarce (+80)
  chargeFx: { style: 'default', color: GREEN },
  melee: {
    ...M,
    name: 'Faca amaldiçoada pelo Conhecimento',
    strikes: M.strikes.map(knowledge),
    up: knowledge(M.up),
    down: knowledge(M.down),
    forward: knowledge(M.forward),
    back: knowledge(M.back),
    side: M.side,
    air: knowledge(M.air),
  },
  ranged: {
    ...base.ranged,
    name: 'Invadir Mente (Rajada)',
    count: 3,
    interval: 0.12,
    spread: 0.08,
    damage: 22,
    cooldown: 3,
    onHit: { label: 'OS CINCO! OS CINCO! OS CINCO!', distort: true },
  },
  abilities: [
    byId.decadencia,
    {
      id: 'ligacaoTelepatica',
      name: 'Ligação Telepática',
      input: 'carga+ranged', // △ → □
      type: 'mindLink',
      description: 'A outra forma do Invadir Mente: liga a mente dele à do adversário. Por 6 s o alvo fica EXPOSTO (recebe 15% a mais de dano) e o Guizo recupera um pouco de sanidade a cada golpe que dá.',
      energyCost: 20,
      cooldown: 16,
      range: 12,
      duration: 6,
      takenMult: 1.15,
      energyPerHit: 3,
      color: GOLD,
    },
    byId.velocidadeMortal,
    { ...byId.embaralhar, copies: 4, duration: 9, description: 'Vira um holograma e deixa 4 cópias realistas em volta que imitam cada movimento dele. Por 9 s, um golpe (não especial) pode acertar uma cópia no lugar dele.' },
    byId.espirais,
    byId.cicatrizacao,
  ],
  special: { ...base.special, damage: 280, copies: { ...base.special.copies, count: 4, color: GREEN }, color: GREEN },
  passives: [
    ...base.passives,
    { type: 'mindRead', takenMult: 1.08, time: 3, color: GOLD }, // Leitura: a faca de Conhecimento marca o alvo
  ],
  awakening: undefined,
};
