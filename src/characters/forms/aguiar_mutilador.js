// MUTILADOR NOTURNO (Aguiar com a máscara, Natal Macabro / Hexatombe). Não aparece na seleção: o Aguiar vira esta forma
// na Transformação (Barra cheia + vida baixa, segurando △) e fica assim até o fim do round. Para os Mascarados a
// máscara é o despertar da Intenção de Assassino: a máscara branca com a mão vermelha no rosto. Cânone ("Máscara do
// Mutilador Noturno"): Ataque Mutilador (+10 no dano — o dobro do Ataque Especial) e Predador Perfeito (uma ação extra
// na rodada). No jogo: o machado bate bem mais forte, TODO golpe sangra, aguenta golpes sem reagir e a caçada é mais
// rápida.
import base from '../aguiar.js';

const RED = 0xd01020;
const BLEED = { dps: 5, duration: 2.5 };
const maul = (s, name) => ({ ...s, ...(name ? { name } : {}), damage: Math.round(s.damage * 1.25), bleed: s.bleed || BLEED, trail: s.trail ? { ...s.trail, color: RED } : s.trail });
const M = base.melee;

export default {
  ...base,
  id: 'aguiar_mutilador',
  form: true,
  baseId: 'aguiar',
  name: 'MUTILADOR NOTURNO (AGUIAR)',
  model: 'aguiar_mutilador',
  info: {
    weapon: 'Machado do Mutilador + a máscara da mão vermelha',
    style: 'Machadadas que sempre fazem sangrar, sem recuar diante dos golpes',
    identity: 'Forma do Mutilador Noturno (até o fim do round)',
    tagline: 'Ninguém sai do acampamento.',
  },
  stats: { moveSpeed: 8.1, maxHealth: 1250 }, // cabe a vida extra da máscara (+100)
  chargeFx: { style: 'blood', color: RED },

  melee: {
    name: 'Machado do Mutilador',
    strikes: [
      maul(M.strikes[0], 'Ataque Mutilador'),
      maul(M.strikes[1]),
      maul(M.strikes[2]),
      maul(M.strikes[3]),
      { ...maul(M.strikes[4], 'Mutilação Noturna'), bleed: { dps: 8, duration: 3 } },
    ],
    up: maul(M.up),
    down: maul(M.down),
    forward: maul(M.forward),
    back: maul(M.back),
    side: maul(M.side),
    air: maul(M.air),
  },

  ranged: { ...base.ranged, damage: 40, cooldown: 2.2, onHit: { ...base.ranged.onHit, bleed: { dps: 6, duration: 3 } } },

  abilities: [
    {
      id: 'ataqueMutilador',
      name: 'Ataque Mutilador',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'heavyBlow',
      description: 'O golpe do Mutilador: ergue o machado e crava por cima com o dobro da força do Ataque Especial — derruba, quebra a defesa e faz sangrar.',
      energyCost: 30,
      cooldown: 10,
      anim: 'slash_v',
      duration: 1.1,
      armorFrom: 0.25,
      impact: 0.66,
      step: 6,
      range: 2.3,
      arc: 100,
      damage: 125,
      knockback: 5,
      guardCrush: 90,
      whiffRecovery: 0.45,
      ai: { when: 'opening', max: 2.6 },
    },
    ...base.abilities.filter((a) => a.id !== 'ataqueEspecial' && a.id !== 'predador'),
    {
      id: 'predadorPerfeito',
      name: 'Predador Perfeito',
      input: 'block+jump', // R2 + × / RT + A
      type: 'predatorScent',
      description: 'O Mutilador caçando: rastreia o sangue da vítima, anda bem mais rápido e cada golpe contra ela é muito mais forte por um bom tempo.',
      energyCost: 20,
      cooldown: 16,
      duration: 10,
      damageMult: 1.25,
      speedMult: 1.15,
      color: 0xb0101c,
    },
  ],

  // Especial com a máscara: finaliza a vítima a machadadas (mais forte que a caçada sem máscara)
  special: { ...base.special, name: 'Finalização do Mutilador', banner: 'Mutilador Noturno!', damage: 320 },

  awakening: undefined,

  passives: [
    { type: 'sonOfPain', after: 2, mult: 0.7 }, // Filho da Dor: com a máscara abraça a dor mais cedo
    { type: 'thickSkin', knockback: 0.6, chip: 0.7, guard: 0.8 }, // não recua diante dos golpes
  ],
};
