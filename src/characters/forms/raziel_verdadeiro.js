// O VERDADEIRO RAZIEL (Hexatombe, ep. 9). Não aparece na seleção: o Raziel vira esta forma na Transformação (Barra cheia
// + vida baixa, segurando △) e fica assim até o fim do round. Na guerra contra os Mascarados, depois do tiro da Lena,
// ele RASGA o resto das vestes e mostra a forma verdadeira: o corpo descarnado, decrépito e musculoso, com a grande
// ferida que mostra as COSTELAS, os braços RASGADOS até o osso e a LÍNGUA comprida que ele não consegue conter. Fica
// DESCONTROLADO: grita, ataca tudo e devora quem está morrendo (SEDE INCONTROLÁVEL), mas ainda pensa.
//   as garras ficam mais fortes e rápidas e sugam bem mais vida; quem está com a vida baixa sangra mais;
//   a Mordida vira DEVORAR (morde mais fundo e cura mais); o Bote Retalhador volta antes e bate mais forte;
//   os rituais finos de antes dão lugar ao FRENESI (Sede Incontrolável: mais força e velocidade, cada garra faz sangrar);
//   a fera não se protege: o Endurecer Sangue vira a LÍNGUA (puxa a presa para as garras); o □ vira o VULTO BESTIAL;
//   PREDADOR (passiva): +20% em quem está atordoado, caído, tomando golpe ou abaixo de 30% da vida.
import base from '../raziel.js';

const RAW = 0xd01020;
const BLOOD_DARK = 0x6a0010;
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
  hpBar: { style: 'vampire' }, // barra própria: sangue coagulado com as gotas escorrendo (styles.css .hb-vampire)
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
    {
      ...byId.mordida, id: 'devorar', name: 'Devorar', damage: 34, drain: 0.9, cooldown: 7,
      // SEDE INCONTROLÁVEL: com o alvo abaixo de 30% da vida o bote vai mais longe, morde 1,4× e bebe tudo
      thirst: { below: 0.3, reach: 1.6, stepMult: 1.5, mult: 1.4, drain: 1 },
      description: 'Dá o bote, segura e devora — morde duas vezes mais fundo e cura quase tudo o que tirou. SEDE INCONTROLÁVEL: em quem está morrendo, o bote vai mais longe, a mordida é mais funda e bebe tudo.',
    },
    // no lugar do Endurecer Sangue: a fera descontrolada não se protege — LÍNGUA puxa a presa para as garras
    {
      id: 'lingua',
      name: 'Língua',
      input: 'block+carga', // R2 + △
      type: 'tongueLash',
      description: 'A língua comprida que ele não consegue conter dispara (até 6,5 m), enrola no adversário e o puxa para as garras, atordoado. Não dá para defender; esquivar escapa. Se errar, fica exposto.',
      energyCost: 20,
      cooldown: 9,
      windup: 0.28,
      pull: 0.3,
      recovery: 0.4,
      range: 6.5,
      stun: 0.55,
      damage: 22,
      bleed: { dps: 3, duration: 2 },
      color: 0xc04050,
      ai: { when: 'far', min: 3 },
    },
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
  // BANQUETE BESTIAL: não é o Banquete de Sangue recolorido — o anfitrião controlado vira a fera. Ruge e explode em
  // sangue, avança mais rápido que um vulto, retalha num frenesi de garras, DEVORA (segura o alvo de joelhos e morde
  // fundo duas vezes, bebendo tudo) e termina rasgando e jogando no chão
  special: {
    ...base.special,
    name: 'Banquete Bestial',
    banner: 'Banquete Bestial',
    damage: 320,
    color: RAW,
    prepare: { anim: 'db_powerup', time: 0.4, fx: 'bloodBurst' },
    dash: { speed: 30, maxTime: 0.5, contact: 2.0 },
    shots: 'claw',
    hits: [
      { t: 0.5, anim: 'db_claw_r', dur: 0.2, share: 0.07, fx: { kind: 'cross', color: RAW }, sound: 'clawHit', push: 0.08 },
      { t: 0.66, anim: 'db_claw_l', dur: 0.2, share: 0.07, fx: { kind: 'cross', color: RAW }, sound: 'clawHit', push: 0.08 },
      { t: 0.82, anim: 'db_claw_r', dur: 0.2, share: 0.07, fx: { kind: 'cross', color: RAW }, sound: 'clawHit', push: 0.08 },
      { t: 0.98, anim: 'db_cross', dur: 0.3, share: 0.08, fx: { kind: 'cross', big: true, color: RAW }, sound: 'bloodClaw', bleed: { dps: 5, duration: 3 } },
      { t: 1.4, anim: 'raziel_feast', dur: 0.8, share: 0.2, fx: { kind: 'punch', color: BLOOD_DARK }, sound: 'clawHit', victimAnim: 'forced_kneel', drain: 1, gore: true, push: 0 },
      { t: 2.2, anim: 'raziel_feast', dur: 0.5, share: 0.14, fx: { kind: 'punch', color: BLOOD_DARK }, sound: 'clawHit', victimAnim: 'forced_kneel', drain: 1, gore: true, push: 0 },
      { t: 2.85, anim: 'db_rend', dur: 0.55, share: 0.37, fx: { kind: 'cross', big: true, color: RAW, color2: BLOOD_DARK }, sound: 'slashFinal', final: true },
    ],
    endReaction: { knockback: 6, lowLaunch: true }, // jogado no chão, não lançado longe
    bannerAt: 0.15,
    length: 3.7,
  },
  passives: [
    { type: 'lifesteal', ratio: 0.14 }, // Sede Incontrolável: as garras bebem bem mais (0,2 → 0,14: v3.47.0)
    ...base.passives.filter((p) => p.type === 'extraTurn' || p.type === 'elementalAffinity'), // Turno Extra e Afinidade continuam
    { type: 'predator', mult: 1.2, threshold: 0.3 }, // Predador: +20% em quem está vulnerável ou morrendo
  ],
  // □ VULTO BESTIAL: a mesma investida, mais rápida e mais funda
  ranged: { ...base.ranged, name: 'Vulto Bestial', speed: 40, damage: 36, cooldown: 2.2, bleed: { dps: 4, duration: 2 }, color: RAW, description: 'Some num vulto ainda mais rápido: avança 10 m e rasga em X, fazendo sangrar mais.' },
  awakening: undefined,
};
