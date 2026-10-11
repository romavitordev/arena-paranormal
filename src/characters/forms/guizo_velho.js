// GUIZO VELHO — uma das aparências SORTEADAS do Distorcer Aparência (a referência "Guizo velho": cabelo grisalho e o
// bigode farto). O ritual envelhece o corpo: anda e bate mais devagar, mas a cabeça ficou mais velha também — os
// rituais batem mais forte e recarregam mais rápido, e a Rajada Mental pesa mais.
import base from '../guizo.js';

const GRAY = 0xd8d8c8;

export default {
  ...base,
  id: 'guizo_velho',
  form: true,
  baseId: 'guizo',
  name: 'GUIZO VELHO',
  model: 'guizo_velho',
  color: '#b8b8a8',
  energyColor: GRAY,
  info: {
    ...base.info,
    style: 'Distorcer Aparência — versão velha: mais lento, mas os rituais batem mais forte e voltam mais rápido',
    identity: 'Distorcer Aparência (até o fim do round)',
    tagline: 'Na minha época, a gente gravava em fita.',
  },
  stats: { ...base.stats, moveSpeed: 6.9, attackSpeed: 0.88 },
  ranged: { ...base.ranged, damage: Math.round(base.ranged.damage * 1.35) },
  abilities: base.abilities.map((a) => ({ ...a, ...(a.damage ? { damage: Math.round(a.damage * 1.25) } : {}), cooldown: Math.round(a.cooldown * 0.75) })),
  awakening: undefined,
};
