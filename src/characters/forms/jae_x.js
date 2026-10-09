// X (Jae com o capuz, Hexatombe / Natal Macabro). Não aparece na seleção: a Jae vira esta forma na Transformação (Barra
// cheia + vida baixa, segurando △) e fica assim até o fim do round. Ao pôr o capuz o rosto some na escuridão e um X
// vermelho aparece no lugar dele (referências "X", "X corpo", "shiu" e o gif "jae colocando mascara").
// Wiki — Capuz de X: "ao colocar o capuz, Jae tem suas habilidades melhoradas":
//   Assassinato Furtivo → ASSASSINATO CRUEL (+6d8 em vez de +3d8): surge pelas costas e abre o alvo, que sangra;
//   ganha a ZONA DAS SOMBRAS (armadilha de Conhecimento de 3 m de raio: 6d6, CEGO e SURDO) no lugar do Shhh... — ao
//   armar a armadilha ela some nas sombras do mesmo jeito.
// Além disso: golpes mais fortes, mais rápida, o bônus de assassina vale mais e tudo volta mais cedo.
import base from '../jae.js';

const RED = 0xff2030;
const sharpen = (s) => ({ ...s, damage: Math.round(s.damage * 1.2), trail: s.trail ? { ...s.trail, color: RED } : s.trail });
const M = base.melee;
const faster = (a) => ({ ...a, cooldown: Math.round(a.cooldown * 0.7 * 10) / 10 });
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'jae_x',
  form: true,
  baseId: 'jae',
  name: 'X',
  model: 'jae_x',
  info: {
    weapon: 'Punhal X + o Capuz de X',
    style: 'Assassina sem rosto: cega, ensurdece, some e corta ainda mais fundo',
    identity: 'Forma do X (até o fim do round)',
    tagline: 'Shhh.',
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
  abilities: [
    faster({ ...byId.punhalX, blind: byId.punhalX.blind + 0.4, color: RED }),
    {
      id: 'zonaSombras',
      name: 'Zona das Sombras',
      input: 'carga+ranged', // △ → □
      type: 'shadowTrap',
      description: 'Arma uma armadilha de Conhecimento quase invisível no chão (3 m) e some nas sombras. Quem pisa toma dano de Conhecimento e fica CEGO e SURDO — perde o rastro dela.',
      energyCost: 25,
      cooldown: 12,
      radius: 1.6,
      damage: 60,
      blind: 1.6,
      deaf: 3.5,
      life: 16,
      veil: { duration: 2.5, opacity: 0.12, speedMult: 1.15, surprise: 0.6 },
      element: 'conhecimento',
      color: 0xe0b030,
    },
    faster({
      ...byId.assassinatoFurtivo,
      id: 'assassinatoCruel',
      name: 'Assassinato Cruel',
      description: 'Some e surge pelas costas abrindo o alvo num corte cruel: muito mais dano que o Furtivo, e ele sangra.',
      strike: { damage: 58, anim: 'dual_cross', dur: 0.4, at: 0.16, knockback: 1.8, hitstun: 0.6, element: 'sangue', big: true, sound: 'slashFinal', bleed: { dps: 6, duration: 3 } },
      color: RED,
    }),
    faster({ ...byId.zonaSussurros, color: RED }),
  ],
  special: { ...base.special, damage: 300 },
  passives: [{ type: 'backstab', kinds: ['melee', 'ability'], mult: 1.45, surprised: true }],
  awakening: undefined,
};
