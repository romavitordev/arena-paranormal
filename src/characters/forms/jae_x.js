// X (Jae com o capuz, Hexatombe). Não aparece na seleção: a Jae vira esta forma na Transformação (Barra cheia + vida
// baixa, segurando △) e fica assim até o fim do round. Ao puxar o capuz o rosto some na escuridão e um X vermelho
// aparece no lugar dele (referências "X", "X corpo", "shiu" e o vídeo "jae colocando mascara"). No jogo: mais rápida,
// golpes mais fortes, o bônus de assassina vale mais e as Zonas/o Punhal X voltam mais cedo.
import base from '../jae.js';

const RED = 0xff2030;
const sharpen = (s) => ({ ...s, damage: Math.round(s.damage * 1.2), trail: s.trail ? { ...s.trail, color: RED } : s.trail });
const M = base.melee;

export default {
  ...base,
  id: 'jae_x',
  form: true,
  baseId: 'jae',
  name: 'X',
  model: 'jae_x',
  info: {
    weapon: 'Punhal X + o capuz do X',
    style: 'Assassina sem rosto: some, cega e corta ainda mais rápido',
    identity: 'Forma do X (até o fim do round)',
    tagline: 'Shh.',
  },
  stats: { moveSpeed: 8.9, maxHealth: 1010 }, // cabe a vida extra do capuz (+80)
  chargeFx: { style: 'blood', color: RED },
  melee: {
    ...M,
    strikes: M.strikes.map(sharpen),
    up: sharpen(M.up),
    down: sharpen(M.down),
    forward: sharpen(M.forward),
    back: sharpen(M.back),
    side: sharpen(M.side),
    air: sharpen(M.air),
  },
  // as quatro habilidades voltam 30% mais cedo; o Punhal X cega por mais tempo
  abilities: base.abilities.map((a) => ({ ...a, cooldown: Math.round(a.cooldown * 0.7 * 10) / 10, ...(a.blind ? { blind: a.blind + 0.4 } : {}) })),
  passives: [{ type: 'backstab', kinds: ['melee', 'ability'], mult: 1.45, surprised: true }],
  awakening: undefined,
};
