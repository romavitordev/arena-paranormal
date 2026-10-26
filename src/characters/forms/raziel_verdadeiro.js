// O VERDADEIRO RAZIEL (Hexatombe, ep. 9). Não aparece na seleção: o Raziel vira esta forma na Transformação (Barra cheia
// + vida baixa, segurando △) e fica assim até o fim do round. Na guerra contra os Mascarados, depois do tiro da Lena,
// ele RASGA o resto das vestes e mostra a forma verdadeira: o corpo descarnado, decrépito e musculoso, com a grande
// ferida que mostra as COSTELAS, os braços RASGADOS até o osso e a LÍNGUA comprida que ele não consegue conter. Fica
// DESCONTROLADO: grita, ataca tudo e devora quem está morrendo (SEDE INCONTROLÁVEL), mas ainda pensa.
//   as garras ficam mais fortes e rápidas e sugam bem mais vida; quem está com a vida baixa sangra mais;
//   a Mordida vira DEVORAR (morde mais fundo e cura mais); o Bote Retalhador volta antes e bate mais forte;
//   os rituais finos de antes dão lugar ao FRENESI (Sede Incontrolável: mais força e velocidade, cada garra faz sangrar).
import base from '../raziel.js';

const RAW = 0xd01020;
const M = base.melee;
const savage = (s) => ({ ...s, damage: Math.round(s.damage * 1.18), bleed: s.bleed || { dps: 3, duration: 1.5 }, trail: s.trail ? { ...s.trail, color: RAW } : s.trail });
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'raziel_verdadeiro',
  form: true,
  baseId: 'raziel',
  name: 'O VERDADEIRO RAZIEL',
  model: 'raziel_verdadeiro',
  info: {
    weapon: 'Garras, dentes e a língua',
    style: 'Descontrolado: garras mais fortes e rápidas, devora para se curar',
    identity: 'A forma verdadeira (até o fim do round)',
    tagline: 'MAIS.',
  },
  stats: { moveSpeed: 8.8, attackSpeed: 1.22, maxHealth: 1580 }, // cabe a vida extra da transformação
  chargeFx: { style: 'default', color: RAW },
  melee: {
    ...M,
    strikes: M.strikes.map(savage),
    up: savage(M.up),
    down: savage(M.down),
    forward: savage(M.forward),
    back: savage(M.back),
    side: savage(M.side),
    air: savage(M.air),
  },
  abilities: [
    { ...byId.boteRetalhador, damage: 108, cooldown: 9, description: 'O bote do descontrole: salta e retalha com as duas garras. Quem esquiva ainda toma metade.' },
    { ...byId.mordida, id: 'devorar', name: 'Devorar', damage: 34, drain: 0.9, cooldown: 7, description: 'SEDE INCONTROLÁVEL: dá o bote, segura e devora — morde duas vezes mais fundo e cura quase tudo o que tirou.' },
    byId.endurecerSangue,
    {
      id: 'frenesi',
      name: 'Frenesi',
      input: 'carga+dodge', // △ + L2 (no lugar da Maldição Sanguínea)
      type: 'selfBuff',
      buffType: 'frenzy',
      label: 'FRENESI',
      description: 'Grita e perde o controle por 6 s: mais forte e mais rápido, e cada golpe físico faz sangrar.',
      energyCost: 25,
      cooldown: 14,
      duration: 6,
      damageMult: 1.2,
      speedMult: 1.15,
      atkSpeed: 1.12,
      meleeBleed: { dps: 3, duration: 2 },
      redAura: RAW,
      anim: 'taunt_roar',
      color: RAW,
    },
  ],
  special: { ...base.special, name: 'Banquete Bestial', banner: 'Banquete Bestial', damage: 320, color: RAW },
  passives: [
    { type: 'lifesteal', ratio: 0.2 }, // Sede Incontrolável: as garras bebem bem mais
  ],
  awakening: undefined,
};
