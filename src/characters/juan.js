// JUAN (Henri) (id: juan) — Escripta da Desconjuração que, em Hexatombe, fez um pacto com o Diabo para virar Marcado e
// ser "livre". Agitado, sorriso perturbador, obcecado por sangue, masoquista. Afinidade com Sangue.
// Kit do cânone: Faca Predadora (absorve sangue e cura), Descarnar Discente, Perturbação Discente, Vínculo de Sangue e
// Armadura de Sangue Diabólica. Especial: RENASCIMENTO — como no fim de Hexatombe, sobe no Trono do Diabo e vira O PORTADOR DO TRONO
// até o fim do round (uma vez por partida).
export default {
  id: 'juan',
  name: 'JUAN',
  model: 'juan',
  color: '#c01828',
  origin: 'Escriptas', // o grupo do Estigma do Desejo em Hexatombe (com Labirinto e Aguiar)
  element: 'sangue',
  energyColor: 0xc01828,
  info: {
    weapon: 'Faca Predadora (lâmina ondulada que absorve sangue)',
    style: 'Cortes rápidos que curam, rituais de Sangue e o pacto que o transforma no Diabo',
    identity: 'Masoquista e imprevisível: quanto mais apanha, mais sanidade; quase morto, senta no Trono e vira o Diabo',
    tagline: 'Eu não quero morrer... eu quero um novo começo.',
  },
  stats: { moveSpeed: 7.6, attackSpeed: 0.92 }, // estava rápido demais (64%+ de vitórias): mais lento e combos mais cadenciados,
  anims: { idle: 'idle_knife', run: 'run', charge: 'charge', victory: 'vic_juan', block: 'block' },
  chargeFx: { style: 'default', color: 0xc01828 },
  dodge: { style: 'default', distance: 5.2 },

  melee: {
    name: 'Faca Predadora',
    strikes: [
      { name: 'Corte rápido', anim: 'knife_1', dur: 0.24, active: [0.06, 0.13], damage: 24, range: 1.7, arc: 110, knockback: 0.7, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828, tilt: 0.05 } },
      { name: 'Corte de volta', anim: 'knife_2', dur: 0.24, active: [0.06, 0.13], damage: 24, range: 1.7, arc: 110, knockback: 0.7, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828, flip: true } },
      { name: 'Estocada', anim: 'thrust', dur: 0.3, active: [0.1, 0.17], damage: 28, range: 1.9, arc: 70, knockback: 0.9, lunge: 1.4, sound: 'blade', hitSound: 'bladeHit' },
      { name: 'Corte descendente', anim: 'knife_3', dur: 0.3, active: [0.09, 0.17], damage: 30, range: 1.7, arc: 110, knockback: 1.0, lunge: 1.1, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828, roll: 1.2 } },
      { name: 'Banho de Sangue', anim: 'knife_final', dur: 0.46, active: [0.16, 0.26], damage: 54, range: 1.9, arc: 120, lunge: 1.8, finisher: 'launch', bleed: { dps: 4, duration: 2 }, sound: 'slashFinal', hitSound: 'bladeHit', trail: { color: 0x7a0010, roll: 1.4, big: true } },
    ],
    up: { name: 'Corte para cima', anim: 'slash_up', dur: 0.38, active: [0.12, 0.22], damage: 38, range: 1.8, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828, tilt: -1.3 } },
    down: { name: 'Faca no chão', anim: 'slash_d', dur: 0.44, active: [0.18, 0.28], damage: 44, range: 1.8, arc: 110, lunge: 1, finisher: 'knockdown', sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828, roll: 1.2 } },
    forward: { name: 'Bote', anim: 'dash_slash', dur: 0.4, active: [0.13, 0.24], damage: 32, range: 1.9, arc: 100, knockback: 1.6, motion: [{ t: [0, 0.24], fwd: 5.8, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828, tilt: 0.1 } },
    back: { name: 'Recua e corta', anim: 'knife_evade', dur: 0.46, active: [0.26, 0.34], damage: 30, range: 1.8, arc: 100, knockback: 1.8, iframes: [0, 0.2], motion: [{ t: [0, 0.14], back: 2.4 }, { t: [0.18, 0.3], fwd: 2.4, stopClose: true }], sound: 'blade', hitSound: 'bladeHit' },
    side: { name: 'Corte em movimento', anim: 'knife_2', dur: 0.32, active: [0.1, 0.18], damage: 28, range: 1.8, arc: 140, knockback: 1.4, motion: [{ t: [0, 0.2], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828 } },
    air: { name: 'Faca aérea', anim: 'air_knife', dur: 0.4, active: [0.12, 0.28], damage: 32, range: 1.8, arc: 110, knockback: 2.5, slam: 15, vertical: 2.2, sound: 'blade', hitSound: 'bladeHit', trail: { color: 0xc01828, roll: 1.3 } },
  },

  // □: corta o próprio braço com a faca e lança uma MEIA-LUA de sangue (pinga no caminho e faz sangrar)
  ranged: {
    name: 'Lâmina de Sangue',
    type: 'projectile',
    anim: 'throw_r',
    windup: 0.2,
    recovery: 0.26,
    count: 1,
    interval: 0,
    damage: 24,
    range: 18,
    speed: 30,
    radius: 0.4,
    spread: 0,
    knockback: 1.2,
    hitstun: 0.35,
    cooldown: 2.0,
    energyCost: 0,
    visual: 'bloodCrescent',
    color: 0xc01828,
    element: 'sangue',
    onHit: { bleed: { dps: 2, duration: 1.5 } },
    sound: 'blade',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      id: 'descarnarDiscente',
      name: 'Descarnar Discente',
      input: 'block+carga', // R2 + △ / RT + Y
      type: 'ritualCuts',
      description: 'Ritual de Sangue: cortes surgem no corpo do alvo, um atrás do outro (dano alto e sangramento).',
      energyCost: 30,
      cooldown: 14,
      windup: 0.45,
      range: 9,
      arc: 50,
      cuts: 5,
      interval: 0.1,
      damage: 80,
      color: 0xc01828,
    },
    {
      id: 'perturbacao',
      name: 'Perturbação Discente',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'command',
      description: 'Uma ordem simples a quem está perto: "PARE!" (paralisa), "VENHA!" (puxa) ou "AJOELHE!" (derruba). Sai uma ao acaso.',
      energyCost: 20,
      cooldown: 12,
      windup: 0.3,
      range: 5,
      stun: 1.0,
      damage: 30,
    },
    {
      id: 'vinculoSangue',
      name: 'Vínculo de Sangue',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'bloodLink',
      description: 'Marca o próprio corpo e o do alvo: por 8 s, 30% do dano que o Juan recebe é replicado no alvo.',
      energyCost: 25,
      cooldown: 20,
      windup: 0.35,
      range: 9,
      arc: 50,
      duration: 8,
      ratio: 0.3, // 0,4 → 0,3 (Juan com 70–80% de vitórias)
    },
    {
      id: 'armaduraSangueDiabolica',
      name: 'Armadura de Sangue Diabólica',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'heavyProtection',
      description: 'Também nasce sozinha depois de sangrar o bastante (a cada 400 de dano recebido, mais curta, e usa a recarga). O próprio sangue endurece numa armadura com espinhos: recebe 30% menos dano, aguenta 2 golpes sem recuar e fica mais rápido. O braço da faca vira uma arma de sangue: golpes físicos 25% mais fortes.',
      energyCost: 30,
      cooldown: 24,
      duration: 7,
      takenMult: 0.7,
      armor: 2,
      speedMult: 1.15,
      bloodArmor: true, // casca de sangue sobre o corpo (Fighter.updateBloodShell)
      bloodArm: { side: 'R', meleeMult: 1.25 }, // o braço da faca vira arma de sangue (só quem conjura)
      autoDuration: 0.6, // nascida sozinha (Sangue que Endurece): 60% do tempo
    },
  ],

  // HEMORRAGIA SEVERA (Descarnar Discente no cânone: dano de Sangue e hemorragia severa): a faca ondulada abre o
  // alvo em cinco cortes; o último deixa uma hemorragia que continua depois da cena. A Faca Predadora cura no caminho.
  special: {
    name: 'Hemorragia Severa',
    banner: 'Hemorragia Severa',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → 250 (padrão); a hemorragia do último corte soma ~40
    color: 0xc01828,
    sound: 'specialStart',
    applyMeleePassives: true, // a Faca Predadora rouba vida de cada corte
    prepare: { anim: 'charge', time: 0.35, fx: 'bloodBurst' },
    dash: { speed: 24, maxTime: 0.45, contact: 1.6 },
    hits: [
      { t: 0.7, anim: 'knife_1', dur: 0.24, share: 0.14, fx: { kind: 'slash', tilt: 0.1 }, sound: 'bladeHit' },
      { t: 0.95, anim: 'knife_2', dur: 0.24, share: 0.14, fx: { kind: 'slash', tilt: -0.2, flip: true }, sound: 'bladeHit' },
      { t: 1.2, anim: 'thrust', dur: 0.3, share: 0.16, fx: { kind: 'stab' }, sound: 'bladeHit' },
      { t: 1.55, anim: 'knife_3', dur: 0.3, share: 0.2, fx: { kind: 'slash', roll: 1.2 }, sound: 'bladeHit' },
      { t: 2.0, anim: 'knife_final', dur: 0.46, share: 0.36, fx: { kind: 'cross', big: true }, sound: 'slashFinal', final: true, bleed: { dps: 8, duration: 5 } },
    ],
    bannerAt: 0.2,
    length: 3.0,
  },

  // TRANSFORMAÇÃO (Barra de Transformação cheia + vida baixa, segurando △): o Trono do Diabo sobe do chão, o Juan
  // senta e vira O DIABO até o fim do round (+150 de vida)
  awakening: {
    name: 'Renascimento',
    banner: 'Renascimento',
    type: 'devilPact',
    form: 'diabo',
    duration: 0,
    bonusHealth: 150,
    color: 0xc01828,
  },

  passives: [
    { type: 'lifesteal', ratio: 0.1 }, // Faca Predadora: cura 10% do dano dos cortes (era 15%)
    { type: 'masochist', ratio: 0.08 }, // Masoquista: apanhar devolve sanidade (0,12 → 0,08: chegava rápido demais ao Renascimento)
    { type: 'bloodHardens', threshold: 400, ability: 'armaduraSangueDiabolica' }, // a cada 400 de dano recebido, a armadura nasce sozinha (60% do tempo, gasta a recarga)
  ],
};
