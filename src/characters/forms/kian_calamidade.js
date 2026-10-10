// KIAN DE CALAMIDADE (Transformação). Não aparece na seleção: o Kian vira esta forma na Transformação (Barra cheia +
// vida baixa, segurando △) e fica assim até o fim do round. Pedido do usuário: "a barba cresce e ele fica mais poderoso,
// como o Kian de Desconjuração × Calamidade" — as miniaturas da wiki ("Kian marcado em Desconjuração" e "Kian em
// Calamidade"): em Calamidade a barba está cheia e os antebraços enfaixados, e ele é o Kian no auge (o Invólucro do
// Conhecimento: os textos tomam o corpo e os golpes atravessam a defesa).
// Mais forte em tudo: golpes físicos 20% mais fortes e IMPOSSÍVEIS DE DEFENDER, Impacto Sigilar maior, rituais 20% mais
// fortes, mais rápido e o Inexistir mais pesado.
import base from '../kian.js';

const GOLD = 0xffd27a;
const stronger = (s) => ({ ...s, damage: Math.round(s.damage * 1.2) });
const M = base.melee;

export default {
  ...base,
  id: 'kian_calamidade',
  form: true,
  baseId: 'kian',
  name: 'KIAN',
  model: 'kian_calamidade',
  energyColor: GOLD,
  unblockableMelee: true, // Invólucro do Conhecimento: os golpes físicos atravessam a defesa
  info: {
    ...base.info,
    identity: 'Kian de Calamidade: barba cheia, faixas nos braços, os textos tomam o corpo (até o fim do round)',
    tagline: 'O conhecimento não se defende. Se aceita.',
  },
  stats: { ...base.stats, moveSpeed: 8.3, attackSpeed: 1.22, maxHealth: 1100 }, // cabe a vida extra (+100)
  melee: {
    ...M,
    name: 'Punhos de Calamidade',
    strikes: M.strikes.map(stronger),
    up: stronger(M.up),
    down: stronger(M.down),
    forward: stronger(M.forward),
    back: stronger(M.back),
    side: stronger(M.side),
    air: stronger(M.air),
  },
  ranged: { ...base.ranged, name: 'Impacto Sigilar de Calamidade', damage: 85, radius: 1.3, cooldown: 3 },
  abilities: base.abilities.map((a) => (a.damage ? { ...a, damage: Math.round(a.damage * 1.2) } : a)),
  special: { ...base.special, resistDamage: 520 },
  awakening: undefined,
};
