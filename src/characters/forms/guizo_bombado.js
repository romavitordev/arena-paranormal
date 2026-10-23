// GUIZO BOMBADO — uma das aparências SORTEADAS do Distorcer Aparência (pedido do usuário: "versão bombado e outras
// versões dele, mudando os ataques"). O ritual muda altura e corpo: o Guizo fica INFLADO e larga a faca — luta no soco
// (a base é a sequência de socos do Kian), mais forte, mais pesado e difícil de derrubar, porém mais lento. A câmera
// continua na outra mão, claro.
import base from '../guizo.js';
import kian from '../kian.js';

const ORANGE = 0xff8a3a;
const heavy = (s) => ({ ...s, damage: Math.round(s.damage * 1.25), knockback: (s.knockback ?? 1) * 1.3, impactScale: (s.impactScale ?? 1) * 1.3, hitSound: 'heavyPunch' });
const K = kian.melee;

export default {
  ...base,
  id: 'guizo_bombado',
  form: true,
  baseId: 'guizo',
  name: 'GUIZO BOMBADO',
  model: 'guizo_bombado',
  color: '#e87a3a',
  energyColor: ORANGE,
  info: {
    ...base.info,
    weapon: 'Os punhos (o ritual inflou o corpo inteiro)',
    style: 'Distorcer Aparência — versão bombada: socos pesados que empurram longe, aguenta mais e quase não recua',
    identity: 'Distorcer Aparência (até o fim do round)',
    tagline: 'Eu sou o mais forte.',
  },
  stats: { moveSpeed: 7.4, attackSpeed: 0.95, size: 1.12, maxHealth: 1580 }, // cabe a vida extra da transformação
  anims: { ...base.anims, idle: 'idle_guizo_bombado', block: 'block' },
  chargeFx: { style: 'default', color: ORANGE },
  melee: {
    ...K,
    name: 'Punhos Bombados',
    strikes: K.strikes.map(heavy),
    ...Object.fromEntries(['up', 'down', 'forward', 'back', 'side', 'air'].filter((k) => K[k]).map((k) => [k, heavy(K[k])])),
  },
  passives: [
    ...base.passives,
    { type: 'thickSkin', knockback: 0.7, chip: 0.7, guard: 0.75 }, // corpo inflado: quase não recua
  ],
  awakening: undefined,
};
