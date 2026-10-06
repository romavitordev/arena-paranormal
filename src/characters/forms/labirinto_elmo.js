// LABIRINTO COM O CAPACETE DO ??? (Hexatombe). Não aparece na seleção: o Labirinto vira esta forma na Transformação
// (Barra cheia + vida baixa, segurando △) e fica assim até o fim do round. Para os Mascarados a máscara é o despertar da
// Intenção de Assassino: o elmo de ferro arranhado com o sorriso carnoso, papéis de labirinto colados descendo até o
// peito. Cânone (wiki, "Capacete do ???"): os rituais viram Tempestade Caótica (raio mais forte que a Rajada),
// Labirinto Abissal (o alvo anda para onde O LABIRINTO escolhe), Consumir Momento (espiral que deteriora e estoura ao
// estalar os dedos) e Revelação Sanguínea (o mapa de sangue mostra posição, intenção e saúde de todos).
import base from '../labirinto.js';

const BONE = 0xd8c8a8;
const boost = (s, name) => ({ ...s, ...(name ? { name } : {}), damage: Math.round(s.damage * 1.25), trail: s.trail ? { ...s.trail, color: BONE } : s.trail });
const M = base.melee;

export default {
  ...base,
  id: 'labirinto_elmo',
  form: true,
  baseId: 'labirinto',
  name: '??? (LABIRINTO)',
  model: 'labirinto_elmo',
  energyColor: 0xc8a0ff,
  info: {
    weapon: 'A Antena + Capacete do ???',
    style: 'Rituais do capacete: raios mais fortes, labirinto que manda no alvo e o chão que se consome',
    identity: 'Forma do Capacete do ??? (até o fim do round)',
    tagline: 'Ao final do labirinto... um sorriso.',
  },
  stats: { moveSpeed: 8.0, attackSpeed: 1.12, maxHealth: 1080 }, // cabe a vida extra do capacete (+80)
  chargeFx: { style: 'default', color: 0xc8a0ff },

  melee: {
    name: 'A Antena do ???',
    strikes: [
      boost(M.strikes[0], 'Estocada do ???'),
      boost(M.strikes[1]),
      boost(M.strikes[2]),
      boost(M.strikes[3], 'Parabólica sorridente'),
      { ...boost(M.strikes[4], 'Giro do Labirinto'), bleed: { dps: 4, duration: 2 } },
    ],
    up: boost(M.up),
    down: boost(M.down),
    forward: boost(M.forward),
    back: boost(M.back),
    side: boost(M.side),
    air: boost(M.air),
  },

  // □: TEMPESTADE CAÓTICA (cânone: 8d10 — a Rajada era 8d8): raio maior, mais forte e mais rápido
  ranged: {
    ...base.ranged,
    name: 'Tempestade Caótica',
    damage: 72,
    speed: 36,
    radius: 0.6,
    knockback: 4,
    hitstun: 0.55,
    cooldown: 2.1,
    color: 0xc8a0ff,
    impactScale: 1.8,
  },

  abilities: [
    {
      id: 'labirintoAbissal',
      name: 'Labirinto Abissal',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'mentalMaze',
      description: 'O labirinto agora é dele: por vários segundos o alvo anda perdido, preso nas paredes que o ??? desenhou.',
      energyCost: 30,
      cooldown: 16,
      windup: 0.4,
      recovery: 0.3,
      range: 13,
      arc: 70,
      duration: 4,
      color: 0xc8a0ff,
    },
    {
      id: 'consumirMomento',
      name: 'Consumir Momento',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'consumeMoment',
      description: 'Marca o chão onde o alvo pisa com uma espiral violenta que deteriora o lugar só de existir; ao estalar os dedos ela estoura (Morte). Dá para sair de cima se perceber a marca.',
      energyCost: 30,
      cooldown: 11,
      radius: 3.1,
      damage: 95,
      delay: 1.0,
      color: 0xa7a3ad,
    },
    {
      id: 'tempestadeCaotica',
      name: 'Tempestade Caótica',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'chaosStorm',
      description: 'A parabólica chama a tempestade em cima do alvo: um círculo avisa a área e dez raios caóticos caem nela por 2 s — metade mira onde o alvo está. Saia de baixo!',
      energyCost: 30,
      cooldown: 13,
      anim: 'point',
      windup: 0.3,
      range: 20,
      radius: 3.6,
      warn: 0.55,
      duration: 2,
      bolts: 10,
      boltRadius: 1.0,
      damage: 26,
      element: 'energia',
      color: 0xc8a0ff,
    },
    {
      id: 'revelacaoSanguinea',
      name: 'Revelação Sanguínea',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'predatorScent',
      description: 'O mapa de gotas de sangue revela posição, intenção e saúde da vítima: por um bom tempo ele a caça — mais rápido e batendo bem mais forte nela.',
      energyCost: 20,
      cooldown: 18,
      duration: 10,
      damageMult: 1.22,
      speedMult: 1.1,
      color: 0xb0101c,
    },
  ],

  // O LABIRINTO É A RESPOSTA com o capacete: o labirinto é maior e mais cruel
  special: { ...base.special, damage: 320 },

  awakening: undefined,

  passives: [
    { type: 'mentalMaze', stunMult: 0.5 }, // Mente Labiríntica: com o capacete a mente fica ainda mais fechada
  ],
};
