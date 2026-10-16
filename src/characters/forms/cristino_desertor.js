// CRISTINO DESERTOR (Hexatombe). Não aparece na seleção: o Cristino vira esta forma na Transformação ("Tocado pela
// Coroa": Barra cheia + vida baixa, segurando △) e fica assim até o fim do round. Ep. 9: ele encosta no sino da
// Verdadeira Coroa de Espinhos e o corpo todo se enche de RABISCOS VERMELHOS; as artes do Desertor o mostram assim,
// com um RIFLE. Curiosidade da wiki: "Cristino tem uma conexão ao elemento de Intenção" — no jogo, ele SENTE a intenção
// do adversário (não é pego desprevenido) e os golpes entram mais fundo.
//   □ vira o RIFLE: tiros rápidos sem a recarga longa da Socadeira (e ainda detonam os lampiões);
//   os lampiões estouram maiores; a Corda do Telhado e o Decepar voltam mais cedo.
import base from '../cristino.js';

const RED = 0xff2a1a;
const sharpen = (s) => ({ ...s, damage: Math.round(s.damage * 1.15), trail: s.trail ? { ...s.trail, color: RED } : s.trail });
const M = base.melee;
const faster = (a) => ({ ...a, cooldown: Math.round(a.cooldown * 0.75 * 10) / 10 });
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'cristino_desertor',
  form: true,
  baseId: 'cristino',
  name: 'CRISTINO DESERTOR',
  model: 'cristino_desertor',
  info: {
    weapon: 'Peixeira, o rifle e Lampiões Explosivos',
    style: 'Coberto de rabiscos vermelhos: sente a intenção do adversário e atira sem parar',
    identity: 'Forma do Desertor (até o fim do round)',
    tagline: 'Eu sei o que você quer.',
  },
  stats: { moveSpeed: 7.9, maxHealth: 1580 }, // cabe a vida extra da transformação
  chargeFx: { style: 'default', color: RED },
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
  ranged: {
    ...base.ranged,
    name: 'Rifle',
    description: 'Três tiros rápidos e precisos, sem a recarga longa da Socadeira. Ainda detona os lampiões à frente.',
    count: 3,
    interval: 0.16,
    damage: 26,
    range: 24,
    speed: 70,
    spread: 0.04,
    knockback: 1.2,
    hitstun: 0.3,
    cooldown: 1.6,
    visual: 'bullet',
    color: RED,
    sound: 'sniper',
  },
  abilities: [
    { ...byId.lampiaoExplosivo, radius: 2.6, damage: 64, fire: { ...byId.lampiaoExplosivo.fire, radius: 2.1 }, color: RED },
    { ...byId.trilhaLampioes, radius: 2.4, damage: 50 },
    faster({ ...byId.cordaTelhado, color: RED }),
    faster({ ...byId.decepar, damage: 68 }),
  ],
  special: { ...base.special, damage: 300 },
  passives: [
    ...base.passives,
    { type: 'precognition' }, // a Intenção: sente o que o adversário vai fazer — não é pego desprevenido
  ],
  awakening: undefined,
};
