// JOUI JOUKI (id interno: joui) — velocidade + katana + sombras + teleporte.
export default {
  id: 'joui',
  name: 'JOUI JOUKI',
  model: 'joui',
  color: '#e8e2d6',
  origin: 'Ordo Realitas', // organização (cânone)
  element: 'conhecimento', // afinidade elemental (ver config/elements.js)
  energyColor: 0xd01830,
  info: {
    weapon: 'Katana',
    style: 'Espadachim ágil: cortes, avanço, contra-ataque e golpe aéreo',
    identity: 'Velocidade + katana + sombras + teleporte',
    tagline: 'Ninguém viu o rosto. Ninguém viu ele chegar.',
  },
  stats: { moveSpeed: 8.3, attackSpeed: 1.12 },
  anims: { idle: 'idle_joui', run: 'run', charge: 'charge', victory: 'vic_joui', block: 'block_weapon' },
  chargeFx: { style: 'aura', color: 0xd01830, smoke: 0x120a0c },
  // esquiva pelas sombras (não é teleporte: só um passo rápido envolto em sombra)
  dodge: { style: 'shadow', iframes: 0.2 },

  melee: {
    name: 'Katana',
    strikes: [
      { name: 'Corte horizontal', anim: 'slash_h', dur: 0.32, active: [0.09, 0.19], damage: 33, range: 2.2, arc: 130, knockback: 1.5, lunge: 1.3, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.05 } },
      { name: 'Corte diagonal', anim: 'slash_d', dur: 0.36, active: [0.11, 0.21], damage: 35, range: 2.2, arc: 110, knockback: 1.7, lunge: 1.2, sound: 'blade', hitSound: 'bladeHit', trail: { roll: 0.9 } },
      { name: 'Corte vertical', anim: 'slash_v', dur: 0.4, active: [0.14, 0.24], damage: 39, range: 2.2, arc: 70, knockback: 2.0, lunge: 1.0, sound: 'blade', hitSound: 'bladeHit', trail: { roll: 1.55 } },
      { name: 'Sequência rápida', anim: 'slash_rapid', dur: 0.24, active: [0.06, 0.14], damage: 18, range: 2.1, arc: 120, knockback: 0.8, lunge: 0.8, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: -0.15 } },
      { name: 'Sequência rápida (volta)', anim: 'slash_h_back', dur: 0.26, active: [0.07, 0.15], damage: 18, range: 2.1, arc: 120, knockback: 0.8, lunge: 0.8, sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.15, flip: true } },
      { name: 'Finalizador', anim: 'slash_finisher', dur: 0.62, active: [0.3, 0.42], damage: 60, range: 2.4, arc: 90, lunge: 1.8, finisher: 'launch', sound: 'slashFinal', hitSound: 'bladeHit', trail: { roll: 1.5, big: true } },
    ],
    up: { name: 'Corte ascendente', anim: 'slash_up', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 2.3, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'bladeHit', trail: { color: 0xd01830, tilt: -1.3 } },
    down: { name: 'Corte descendente', anim: 'slash_v', dur: 0.52, active: [0.2, 0.32], damage: 48, range: 2.3, arc: 120, lunge: 1, finisher: 'knockdown', sound: 'swing', hitSound: 'bladeHit', impactScale: 1.4, trail: { color: 0xd01830, roll: 1.5, big: true } },
    forward: { name: 'Avanço com corte', anim: 'dash_slash', dur: 0.42, active: [0.12, 0.24], damage: 40, range: 2.2, arc: 140, knockback: 2.6, motion: [{ t: [0, 0.22], fwd: 4.6, stopClose: true }], sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.1, wide: true } },
    // postura de contra-ataque: se for atacado no físico durante a janela, revida
    back: {
      name: 'Coincidência Forçada "Rodolfo"', anim: 'counter_stance', dur: 0.62, active: [0.62, 0.62], damage: 0, range: 0, arc: 0, knockback: 0,
      counter: { window: [0.05, 0.5], riposte: { damage: 55, finisher: 'launch', anim: 'iai_slash', sound: 'slashFinal' } },
      sound: 'blade',
    },
    side: { name: 'Corte lateral', anim: 'slash_h', dur: 0.34, active: [0.1, 0.2], damage: 30, range: 2.2, arc: 130, knockback: 1.8, motion: [{ t: [0, 0.22], side: 2.6 }], sound: 'blade', hitSound: 'bladeHit', trail: { tilt: 0.2 } },
    air: { name: 'Golpe aéreo', anim: 'air_slash', dur: 0.42, active: [0.15, 0.32], damage: 38, range: 2.2, arc: 100, knockback: 3.5, slam: 16, vertical: 2.4, sound: 'blade', hitSound: 'bladeHit', trail: { roll: 1.5 } },
  },

  // □: Sombra Rasteira — extensão de sombra pelo chão (não é projétil genérico)
  ranged: {
    name: 'Sombra Rasteira',
    type: 'projectile',
    anim: 'shadow_cast',
    origin: 'ground',
    windup: 0.24,
    recovery: 0.2,
    count: 1,
    interval: 0,
    damage: 30,
    range: 13,
    speed: 24,
    radius: 0.7,
    spread: 0,
    knockback: 0.5,
    hitstun: 0.2,
    onHit: { stun: 0.55, stunAnim: 'stagger' }, // prende o alvo para iniciar pressão
    cooldown: 4,
    energyCost: 10,
    visual: 'shadow',
    color: 0xd01830,
    sound: 'teleport',
    hitSound: 'bladeHit',
  },

  abilities: [
    {
      id: 'teleport',
      name: 'Teleporte das Sombras',
      input: 'carga+jump', // Energia (△/Y) + Pulo (×/A)
      spamWindow: 8, // teleportar de novo em menos de 8 s custa 60% a mais
      spamMult: 1.6,
      type: 'teleportBehind',
      description: 'Afunda na própria sombra e emerge atrás do adversário, já podendo atacar. Não causa dano.',
      energyCost: 22,
      cooldown: 5,
      distance: 1.5,
      vanishTime: 0.16,
      color: 0xd01830,
    },
    {
      // cânone (Desconjuração): segurando as cinzas perto do coração, recita o nome de Mateo e as solta sobre a ferida —
      // o ritual de Morte acelera o tempo só ali e a ferida fecha
      id: 'mateo',
      name: 'Envelhecimento Localizado "Mateo"',
      input: 'block+carga', // R2 + △
      type: 'healOverTime',
      description: 'Recita o nome de Mateo e solta as cinzas sobre a ferida: o tempo corre só ali e ele recupera vida em instantes.',
      energyCost: 30,
      cooldown: 26,
      heal: 80,
      duration: 2.4,
      style: 'mist',
      color: 0x8a8090,
    },
    {
      id: 'olhar',
      name: 'Olhar do Desespero',
      input: 'carga+physical', // △ + ○ / Y + B
      type: 'fearGaze',
      description: 'Encara o adversário e libera uma manifestação de medo: quem estiver à frente fica paralisado por um instante, vulnerável a combo.',
      energyCost: 25,
      cooldown: 12,
      range: 8,
      arc: 70,
      windup: 0.4,
      recovery: 0.3,
      stun: 0.9, // breve: não tira o controle por tempo exagerado
      color: 0xd01830,
    },
    {
      // cânone (Calamidade, a fase da máscara): PORTAL DAS SOMBRAS — "um portal pelas sombras; um objeto, como sua katana,
      // seria transportado para sua mão". No lugar do antigo Corte das Sombras (que era só proposta de jogo): ele crava a
      // katana na própria sombra e ela SOBE de um portal debaixo do adversário, cortando e lançando para o alto.
      id: 'portalSombras',
      name: 'Portal das Sombras',
      input: 'carga+dodge', // △ + L2 / Y + LT
      type: 'shadowPortal',
      description: 'Crava a katana na própria sombra: um portal de sombra abre debaixo do adversário e a lâmina sobe dele cortando e lançando para o alto (não dá para defender — saia de cima do portal). A katana volta para a mão por outro portal.',
      energyCost: 22,
      cooldown: 11,
      range: 14,
      radius: 1.3,
      warn: 0.5,
      damage: 72,
      element: 'conhecimento',
      color: 0xd01830,
    },
    {
      // R2 + × TOMADO PELO ÓDIO (pedido de 2026-10-26; o nome é do dono — o Joui tomado pelo ódio, como na Mansão): ele já usa a máscara da Seita, mas ATIVA os poderes dela como
      // os outros Mascarados fazem — sem a cena de pôr a máscara: entra na postura de saque, a aura vermelha dos
      // Mascarados acende e por alguns segundos ele fica mais forte e mais rápido, e cada corte faz sangrar um pouco.
      // Só no Joui mascarado (na forma Shi no Kage ele entregou a máscara).
      id: 'tomadoPeloOdio',
      name: 'Tomado pelo Ódio',
      input: 'block+jump', // R2 + × / RT + A
      type: 'selfBuff',
      buffType: 'maskIntent',
      label: 'TOMADO PELO ÓDIO',
      description: 'Tomado pelo ódio, ativa os poderes da máscara: entra na postura de saque, a aura vermelha acende e por 6 s ele bate 20% mais forte, ataca e anda mais rápido, e cada corte faz o alvo sangrar de leve.',
      energyCost: 25,
      cooldown: 18,
      duration: 6,
      anim: 'counter_stance',
      animTime: 0.6,
      damageMult: 1.2,
      affects: ['melee', 'ability'],
      speedMult: 1.1,
      atkSpeed: 1.1,
      meleeBleed: { dps: 3, duration: 2.5 },
      redAura: 0xff1a1a,
      trail: false,
      sound: 'carga',
      color: 0xd01830,
    },
    {
      // cânone (Desconjuração, achado sob o corpo do Espreitador): o Símbolo de Conhecimento e Medo é desenhado no chão
      // e ativado ao pisar nele; a aura paralisa o alvo. Aqui ele risca o Símbolo à frente e quem pisar fica paralisado.
      id: 'pavorAnormal',
      name: 'Pavor Anormal',
      input: 'carga+ranged', // △ + □ / Y + X
      type: 'shadowTrap',
      description: 'Risca no chão o Símbolo de Conhecimento e Medo: quem pisar nele toma dano de Conhecimento e fica paralisado de pavor.',
      energyCost: 20,
      cooldown: 14,
      radius: 1.5,
      damage: 25,
      stun: 1.1,
      label: 'PAVOR ANORMAL',
      life: 14,
      element: 'conhecimento',
      color: 0xd01830,
    },
  ],

  // ESPECIAL do Joui mascarado: some na própria sombra e surge golpeando pelas costas. (Até a v3.41.0 chamava "Shi no
  // Kage", mas Shi no Kage é o nome da KATANA que ele só recebe depois de entregar a máscara — agora é o especial da
  // Transformação; este passou a se chamar "Execução das Sombras", nome de jogo, não do cânone.)
  special: {
    name: 'Execução das Sombras',
    banner: 'Execução das Sombras',
    type: 'teleportStrike',
    energyCost: 50,
    cooldown: 14,
    // damage: omitido → COMBAT.specialDamage. NÃO é hitkill.
    maxRange: 30,
    behindDistance: 1.4,
    color: 0xd01830,
    sound: 'teleport',
  },

  // TRANSFORMAÇÃO (Barra de Transformação cheia + vida baixa, segurando △) — "SHI NO KAGE": o Joui da FASE FINAL contra o
  // Kian (depois do ep. 9 de Calamidade). Ele tira a máscara (entregou-a à Magistrada e perdeu os poderes dela) e luta
  // com a Shi no Kage, a katana preta de Conhecimento com os sigilos dourados; a Relíquia de Energia fica na bainha de
  // sigilos roxos. Kit próprio (forms/joui_shinokage.js): esgrima de Conhecimento, Corte de Conhecimento, Saque da
  // Relíquia, DECEPAR (membro / decapitar) e o especial Shi no Kage. Até o fim do round. (Antes era o awakenMode
  // "Técnica Secreta" — o mesmo kit com atributos maiores; o Desarmar virou passiva da forma.)
  awakening: {
    name: 'Shi no Kage',
    banner: 'Shi no Kage',
    type: 'maskTransform',
    form: 'joui_shinokage',
    formBanner: 'SHI NO KAGE',
    anim: 'iai_slash',
    tint: 0xffd27a,
    sound: 'slashFinal',
    duration: 0, // até o fim do round
    bonusHealth: 80,
    color: 0xffd27a,
  },

  passives: [
    { type: 'decepar', threshold: 0.2, mult: 1.3 }, // Decepar: finalizador +30% em quem está com menos de 20% de vida
    // golpes físicos pelas costas do inimigo (ex.: após o teleporte) causam +25%
    { type: 'backstab', mult: 1.25, kinds: ['melee'] },
    // cânone: Um por Um — derrubou um, parte pro próximo como ação livre (o finalizador devolve sanidade)
    { type: 'oneByOne', energy: 8 },
    // cânone: Precognição — sente quem chega perto (+5 de defesa no curto alcance): não é pego pelas costas e o
    // corpo a corpo dói um pouco menos
    { type: 'precognition' },
    { type: 'resistant', kinds: ['melee'], mult: 0.93 },
    // cânone: Resistência Paranormal — portou a Máscara do Desespero; resiste a dano de Conhecimento
    { type: 'iKnewIt', mult: 0.85 },
  ],
};
