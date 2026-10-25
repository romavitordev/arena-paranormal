// JOUI COM A SHI NO KAGE (Transformação). Não aparece na seleção: o Joui vira esta forma na Transformação (Barra cheia +
// vida baixa, segurando △) e fica assim até o fim do round.
//
// FASE (decisão explícita, feedback de 25/10/2026 — ver docs/AUDITORIA-KIAN-JOUI.md): o Joui NORMAL do jogo é o Joui
// MASCARADO da Seita das Máscaras (máscara, sombras, teleporte). A FORMA é o Joui da FASE FINAL contra o Kian (depois do
// ep. 9 de Calamidade): ele ENTREGOU a máscara à Magistrada — sem ela, sem os poderes da máscara (sem Teleporte das
// Sombras, sem Sombra Rasteira, sem Corte das Sombras) — e luta com a SHI NO KAGE ("Sombra da Morte"), a katana preta
// amaldiçoada com Conhecimento (sigilos dourados) que a Magistrada lhe deu; no quadril, a bainha com sigilos roxos que
// contém a Relíquia de Energia (a katana antiga). O que é proposta de jogo está marcado como tal nos comentários.
import base from '../joui.js';

const GOLD = 0xffd27a;
const RELIC = 0xb070ff;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));
// os cortes da Shi no Kage: Conhecimento, rastro dourado e +20% sobre os números da tabela — a forma tem que ficar ACIMA do
// Joui mascarado no auge (com o Tomado pelo Ódio: sequência ×1,2 e velocidade ×1,1 por 6 s), e o tempo todo
const K = (s) => ({ ...s, damage: Math.round(s.damage * 1.2), element: 'conhecimento', trail: { ...(s.trail || {}), color: GOLD } });

export default {
  ...base,
  id: 'joui_shinokage',
  form: true,
  baseId: 'joui',
  name: 'JOUI JOUKI',
  model: 'joui_shinokage',
  noMask: true, // ele entregou a máscara: as duas versões dela ficam escondidas (Fighter não troca a máscara)
  energyColor: GOLD,
  info: {
    ...base.info,
    weapon: 'Shi no Kage',
    identity: 'A fase final contra o Kian: sem a máscara, a Shi no Kage de Conhecimento e a Relíquia de Energia na bainha',
    tagline: 'Sem máscara. Só a lâmina.',
  },
  stats: { ...base.stats, moveSpeed: 9.3, attackSpeed: 1.28 }, // acima do mascarado com o Tomado pelo Ódio ativo (9,1 e 1,23)
  chargeFx: { style: 'aura', color: GOLD, smoke: 0x1a1608 },
  dodge: { style: 'default' }, // sem a máscara, a esquiva não é mais pelas sombras

  // ESGRIMA TÉCNICA com a Shi no Kage (proposta): cortes mais rápidos e um pouco mais longos, rastro dourado e dano de
  // Conhecimento (o corte da katana amaldiçoada drena a sanidade); o contra-ataque Coincidência Forçada "Rodolfo" fica
  melee: {
    name: 'Shi no Kage',
    strikes: [
      K({ name: 'Corte da Sombra da Morte', anim: 'slash_h', dur: 0.28, active: [0.08, 0.17], damage: 34, range: 2.5, arc: 130, knockback: 1.3, lunge: 1.4, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.05 } }),
      K({ name: 'Corte diagonal', anim: 'slash_d', dur: 0.3, active: [0.09, 0.18], damage: 36, range: 2.5, arc: 110, knockback: 1.5, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { roll: 0.9 } }),
      K({ name: 'Corte vertical', anim: 'slash_v', dur: 0.34, active: [0.12, 0.21], damage: 40, range: 2.5, arc: 70, knockback: 1.8, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { roll: 1.55 } }),
      K({ name: 'Sequência rápida', anim: 'slash_rapid', dur: 0.22, active: [0.05, 0.13], damage: 20, range: 2.4, arc: 120, knockback: 0.7, lunge: 0.9, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: -0.15 } }),
      K({ name: 'Sequência rápida (volta)', anim: 'slash_h_back', dur: 0.24, active: [0.06, 0.14], damage: 20, range: 2.4, arc: 120, knockback: 0.7, lunge: 0.9, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.15, flip: true } }),
      K({ name: 'Iaijutsu', anim: 'iai_slash', dur: 0.5, active: [0.22, 0.32], damage: 66, range: 2.7, arc: 120, lunge: 2.2, finisher: 'launch', sound: 'slashFinal', hitSound: 'bladeHit', impactScale: 1.6, trail: { roll: 1.5, big: true } }),
    ],
    up: K({ ...base.melee.up, damage: 44, range: 2.5 }),
    down: K({ ...base.melee.down, damage: 52, range: 2.5 }),
    forward: K({ ...base.melee.forward, damage: 44, range: 2.4 }),
    back: base.melee.back, // Coincidência Forçada "Rodolfo" (ritual dele, não da máscara)
    side: K({ ...base.melee.side, damage: 34, range: 2.4 }),
    air: K({ ...base.melee.air, damage: 42, range: 2.4 }),
  },

  // □ CORTE DE CONHECIMENTO (proposta, no lugar da Sombra Rasteira — a sombra era da máscara): o corte da Shi no Kage
  // solta uma onda de sigilos dourados que avança pelo chão
  ranged: {
    name: 'Corte de Conhecimento',
    type: 'projectile',
    anim: 'slash_h',
    windup: 0.2,
    recovery: 0.22,
    count: 1,
    interval: 0,
    damage: 42,
    range: 16,
    speed: 26,
    radius: 0.9,
    spread: 0,
    knockback: 1.4,
    hitstun: 0.3,
    cooldown: 3.5,
    energyCost: 12,
    visual: 'scriptWave',
    element: 'conhecimento',
    color: GOLD,
    sound: 'slashFinal',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      // △ + × SAQUE DA RELÍQUIA (proposta; base canônica: a Relíquia de Energia é a katana antiga dele, guardada na bainha
      // de sigilos roxos que a Magistrada fez): o iaijutsu saca a lâmina de luz roxa num avanço cortante de Energia —
      // no lugar do Teleporte das Sombras (era poder da máscara)
      id: 'saqueReliquia',
      name: 'Saque da Relíquia',
      input: 'carga+jump',
      type: 'dashStrike',
      description: 'Saca a Relíquia de Energia da bainha num iaijutsu: avança em linha como um relâmpago roxo e corta o primeiro no caminho — quebra a defesa.',
      energyCost: 30,
      cooldown: 12,
      anim: 'iai_slash',
      windup: 0.2,
      distance: 10,
      speed: 34,
      range: 1.6,
      recovery: 0.35,
      damage: 95,
      knockback: 6,
      hitstun: 0.8,
      guardBreak: true,
      element: 'energia',
      color: RELIC,
    },
    // Envelhecimento Localizado "Mateo" (ritual dele): na fase final o tempo corre só ali e as FERIDAS FECHAM — além de
    // curar, tira sangramento, MORRENDO, envelhecimento, queimadura, cegueira, surdez e a ferida aberta
    { ...byId.mateo, cleanse: true, description: 'Recita o nome de Mateo e solta as cinzas sobre a ferida: o tempo corre só ali — recupera vida e as feridas FECHAM (sangramento, MORRENDO, envelhecimento, queimadura, cegueira, surdez e ferida aberta saem na hora).' },
    // Olhar do Desespero (habilidade dele; cânone: "paralisa... ou torna-o ESMORECIDO"): passada a paralisia, o alvo
    // fica esmorecido — bate 25% mais fraco por 5 s
    { ...byId.olhar, wither: { mult: 0.75, duration: 5 }, description: 'Encara o adversário: quem estiver à frente fica paralisado de medo e, passada a paralisia, ESMORECIDO — bate 25% mais fraco por 5 s.' },
    {
      // △ + L2 DECEPAR (pedido do Vitor: "um golpe como o do Cristino de decepar membro"; cânone do Joui: "quando deixa um
      // alvo morrendo pode decepar um membro; se o dano for suficiente para matar, pode decapitar"): ergue a Shi no Kage e
      // desce num corte que arranca — o alvo SANGRA e fica com a FERIDA ABERTA (sem cura); em quem está atordoado ou
      // preso entra mais fundo, e em quem já está morrendo (vida baixa) o corte vai no pescoço
      id: 'decepar',
      name: 'Decepar',
      input: 'carga+dodge',
      type: 'heavyBlow',
      description: 'Ergue a Shi no Kage e desce num corte que arranca um membro: o alvo SANGRA e fica com a FERIDA ABERTA (não se cura por 12 s). Em quem está atordoado ou preso entra mais fundo; em quem está com a vida baixa, DECAPITA (dano muito maior). Aguenta um golpe na preparação.',
      energyCost: 30,
      cooldown: 13,
      anim: 'slash_finisher',
      duration: 0.85,
      armorFrom: 0.08,
      impact: 0.34,
      step: 7.5,
      stepTime: 0.3,
      track: true,
      range: 2.7,
      arc: 150,
      damage: 64,
      knockback: 1.6,
      bleed: { dps: 7, duration: 4 },
      noHeal: 12,
      downBonus: 1.5,
      downLabel: 'DECEPOU!',
      lowBonus: { below: 0.25, mult: 2.0, label: 'DECAPITOU!' },
      whiffRecovery: 0.35,
      element: 'conhecimento',
      hitSound: 'bladeHit',
      color: 0xc01818,
    },
    // Pavor Anormal (ritual dele, do Espreitador): na fase final ele risca o Símbolo DEBAIXO do adversário (até 9 m) —
    // o aviso aparece e arma em 0,6 s
    { ...byId.pavorAnormal, atTarget: 9, description: 'Risca o Símbolo de Conhecimento e Medo DEBAIXO do adversário (até 9 m): o aviso aparece e, se ele não sair de cima, toma dano de Conhecimento e fica paralisado de pavor.' },
  ],

  // ESPECIAL "SHI NO KAGE" (Sombra da Morte) — a ULTIMATE da fase final, diferente e mais forte que a do Joui mascarado
  // (a "Execução das Sombras", que só some na sombra e golpeia pelas costas). O nome e as armas são canônicos; a cena é
  // proposta: ele SACA A RELÍQUIA DE ENERGIA na mão esquerda (a lâmina de luz roxa) e luta com AS DUAS — a Shi no Kage
  // de Conhecimento na direita. O Conhecimento marca o alvo (o sigilo dourado sobre a cabeça) e cada corte é visto um
  // instante antes (o lampejo dourado); no meio da sequência o DECEPAR abre a carne (sangra) e o alvo ajoelha; fecha
  // com o corte em X dourado e roxo que leva o nome da katana. Dano base 430: são 7 cortes e a escala de combo come uma
  // parte deles — medido no jogo contra o Balu, sai ~250 contra ~180 da Execução das Sombras (um golpe só, sem escala).
  special: {
    name: 'Shi no Kage',
    banner: 'Shi no Kage',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 16,
    damage: 430,
    color: GOLD,
    sound: 'slashFinal',
    prepare: { anim: 'relic_draw', time: 0.75, fx: 'relicDraw', showProp: 'relicBlade', arm: 'L' },
    dash: { speed: 30, maxTime: 0.45, contact: 2.0 },
    hits: [
      { t: 0.8, anim: 'slash_h', dur: 0.24, share: 0.08, fx: { kind: 'slash', tilt: 0.05 }, sound: 'blade', sigil: true, foresee: true },
      { t: 1.02, anim: 'slash_h_back', dur: 0.24, share: 0.08, fx: { kind: 'slash', tilt: -0.2, flip: true, color: RELIC }, sound: 'blade', foresee: true },
      { t: 1.24, anim: 'slash_d', dur: 0.24, share: 0.08, fx: { kind: 'slash', roll: 0.9 }, sound: 'blade', foresee: true },
      { t: 1.46, anim: 'slash_rapid', dur: 0.22, share: 0.08, fx: { kind: 'slash', tilt: -0.15, color: RELIC }, sound: 'blade', foresee: true },
      // DECEPAR: o corte que arranca — sangra e o alvo cai de joelhos
      { t: 1.78, anim: 'slash_finisher', dur: 0.4, share: 0.16, fx: { kind: 'slash', roll: 1.5, big: true }, sound: 'slashFinal', victimAnim: 'forced_kneel', bleed: { dps: 8, duration: 5 }, push: 0.05 },
      { t: 2.3, anim: 'slash_up', dur: 0.3, share: 0.1, fx: { kind: 'slash', tilt: -1.2, color: RELIC }, sound: 'blade', foresee: true },
      // o X final: as duas lâminas cruzando
      { t: 2.75, anim: 'iai_double', dur: 0.5, share: 0.42, fx: { kind: 'cross', color: GOLD, color2: RELIC }, sound: 'slashFinal', final: true },
    ],
    bannerAt: 0.25,
    length: 3.7,
  },

  awakening: undefined,
  passives: [
    ...base.passives,
    // Técnica Secreta "Desarmar" (habilidade dele): na forma é passiva — o finalizador arranca a arma do alvo
    { type: 'disarmStrike', time: 4 },
  ],
};
