// JUAN NO ÓDIO DO DIABO — 1ª transformação do Juan (Barra cheia + vida baixa, segurando △). Não aparece na seleção.
// Pedido do usuário: o Juan tem DUAS transformações — primeiro o Ódio do Diabo, depois, dentro dela, o Renascimento
// no Trono (O Portador do Trono, a forma 'diabo'). O Diabo também existe separado, nos Portadores das Relíquias.
// Visual (a arte "pose ultimate"): o antebraço direito vira sangue com garras, o capuz vermelho erguido e o olho que
// restou aceso em vermelho. O ódio que o Diabo planta (cânone: "Ódio do Diabo") toma o próprio Juan: as garras fazem
// sangrar, alcançam mais e roubam mais vida; ele fica mais rápido e a Barra volta a encher — mais depressa — para o
// segundo estágio.
import base from '../juan.js';

const RED = 0xff1a30;
const claw = (s, i) => ({
  ...s,
  damage: Math.round(s.damage * 1.18),
  range: (s.range ?? 1.7) + 0.3,
  bleed: s.bleed || { dps: 3, duration: 1.5 },
  hitSound: 'clawHit',
  trail: s.trail ? { ...s.trail, color: RED } : { color: RED, flip: i % 2 === 1 },
});
const M = base.melee;

export default {
  ...base,
  id: 'juan_odio',
  form: true,
  baseId: 'juan',
  name: 'JUAN',
  model: 'juan_odio',
  energyColor: RED,
  info: {
    ...base.info,
    weapon: 'Garras de sangue no braço direito',
    identity: 'Juan tomado pelo Ódio do Diabo: garras que fazem sangrar — e o Trono ainda chama',
    tagline: 'Eu não quero morrer... eu quero um novo começo.',
  },
  stats: { ...base.stats, moveSpeed: 8.1, attackSpeed: 1.0 },
  drips: { sockets: ['handR'], color: 0xa01018, every: 0.12 },
  melee: {
    ...M,
    name: 'Garras do Ódio',
    strikes: M.strikes.map(claw),
    ...Object.fromEntries(['up', 'down', 'forward', 'back', 'side', 'air', 'ground'].filter((k) => M[k]).map((k) => [k, claw(M[k], 0)])),
  },
  // 2ª transformação: RENASCIMENTO — o Trono do Diabo sobe e ele vira O PORTADOR DO TRONO até o fim do round.
  // chain: a Barra continua enchendo nesta forma (fill: 3× mais rápido — ele já está quase morto)
  awakening: {
    name: 'Renascimento',
    banner: 'Renascimento',
    type: 'devilPact',
    form: 'diabo',
    chain: true,
    fill: 3,
    duration: 0,
    bonusHealth: 150,
    color: 0xc01828,
  },
  passives: base.passives.map((p) => (p.type === 'lifesteal' ? { ...p, ratio: 0.14 } : p)),
};
