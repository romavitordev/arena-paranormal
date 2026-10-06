// ERIN — EM NOME DO CAOS. Não aparece na seleção: a Erin vira esta forma na Transformação (Barra cheia + vida baixa,
// segurando △) e fica assim até o fim do round. A Erin é da Ordo Realitas (NÃO é Mascarada): a máscara dela é a
// máscara de gás tecnológica de um membro da Produção do Anfitrião, que ela arrancou, adaptou e passou a usar em
// combate no lugar dos óculos. Aqui ela enlouquece de vez: o fascínio por explosões vira devoção ao Caos — SEM
// SANIDADE (a barra fica zerada e travada; tudo que gastaria sanidade sai da VIDA), golpes mais rápidos e bem mais
// fortes, granadas mais fortes, nada de cura. Especial: EM NOME DO CAOS (cânone: ferida de morte
// no Dia Final de Desconjuração, ativou três granadas e se explodiu "em nome do Caos") — joga uma granada de luz; se
// cegar o adversário, corre até ele, dá o tiro de escopeta e se explode: dano enorme, mas ela morre. Se levar o
// adversário junto, ganha o round; se ele sobreviver, ela perde.
import base from '../erin.js';

const CHAOS = 0x7aff9a;
const frenzy = (s, name) => ({ ...s, ...(name ? { name } : {}), damage: Math.round(s.damage * 1.35), dur: +(s.dur * 0.9).toFixed(3), trail: s.trail ? { ...s.trail, color: 0xff5a1a } : s.trail });
const M = base.melee;
const ab = (id) => base.abilities.find((a) => a.id === id);

export default {
  ...base,
  id: 'erin_caos',
  form: true,
  baseId: 'erin',
  name: 'ERIN — EM NOME DO CAOS',
  model: 'erin_caos',
  color: '#ff5a1a',
  energyColor: 0xff5a1a,
  info: {
    weapon: 'Adagas, escopeta e granadas — com a máscara de gás',
    style: 'Frenesi de cortes, explosões por todo lado e o sacrifício final',
    identity: 'Forma Em Nome do Caos (até o fim do round)',
    tagline: 'Em nome do Caos!',
  },
  stats: { moveSpeed: 9.0, attackSpeed: 1.25, maxHealth: 1060 }, // cabe a vida extra da máscara (+60)
  chargeFx: { style: 'default', color: CHAOS },

  melee: {
    name: 'Adagas do Caos',
    strikes: [
      frenzy(M.strikes[0], 'Corte do Caos'),
      frenzy(M.strikes[1]),
      frenzy(M.strikes[2]),
      frenzy(M.strikes[3]),
      { ...frenzy(M.strikes[4], 'Estocada explosiva'), impactScale: 2, hitSound: 'explosion' },
    ],
    up: frenzy(M.up),
    down: { ...frenzy(M.down), impactScale: 1.8, hitSound: 'explosion' },
    forward: frenzy(M.forward),
    back: frenzy(M.back),
    side: frenzy(M.side),
    air: frenzy(M.air),
  },

  // □: escopeta à queima-roupa, mais forte e mais rápida
  ranged: { ...base.ranged, damage: 14, count: 7, cooldown: 1.5, knockback: 3 },

  abilities: [
    {
      ...ab('supernova'),
      description: 'A Supernova do Caos: explosão maior e mais forte, joga o alvo para cima.',
      cooldown: 6,
      projectile: { ...ab('supernova').projectile, explode: { ...ab('supernova').projectile.explode, radius: 3.2, damage: 115 } },
    },
    {
      ...ab('nebulosa'),
      projectile: { ...ab('nebulosa').projectile, explode: { ...ab('nebulosa').projectile.explode, damage: 40 } },
    },
    {
      ...ab('granadaLuz'),
      projectile: { ...ab('granadaLuz').projectile, explode: { ...ab('granadaLuz').projectile.explode, damage: 45, stun: 1.3 } },
    },
    {
      ...ab('bencaoMaldita'),
      input: 'carga+physical', // △ + ○ / Y + B
      description: 'A mão brilha em ciano e o Caos mostra o futuro: recupera todas as esquivas e bate muito mais forte por alguns segundos.',
      cooldown: 18,
      damageMult: 1.3,
    },
    // sem o "Black Hole": enlouquecida, ela não se cura mais
  ],

  // EM NOME DO CAOS: corre até o adversário e se explode (ver specials/kamikaze.js)
  special: {
    name: 'Em Nome do Caos',
    banner: 'Em nome do Caos!',
    type: 'kamikaze',
    energyCost: 0, // sem sanidade: o preço é a própria vida
    cooldown: 14,
    damage: 450, // 15% no tiro de escopeta + 85% na explosão
    shotShare: 0.15,
    range: 18,
    flash: { radius: 2.6, flight: 0.65, missRecovery: 0.7 }, // a granada de luz que "pega" o especial
    speed: 13,
    color: 0xff5a1a,
  },

  awakening: undefined,

  passives: [
    { type: 'noSanity' }, // Sem Sanidade: a barra fica zerada e travada
    { type: 'bloodPrice', hpPerPoint: 1, minHealth: 0.03 }, // ...e cada ritual, granada ou dash longo custa VIDA
    { type: 'electricAmulet', damage: 8, color: 0x5ae8ff }, // Amuleto Elétrico mais forte
  ],
};
