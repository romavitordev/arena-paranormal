// Valores globais de combate. Tudo que for "regra do jogo" e não de um
// personagem específico mora aqui. Os personagens podem sobrescrever
// a maioria desses valores no próprio arquivo de definição.

export const COMBAT = {
  maxHealth: 1000,
  maxEnergy: 100,
  startEnergy: 30,
  energyRegen: 2.5, // por segundo, passivo
  chargeRate: 32, // por segundo enquanto segura a Carga de Poder

  // Dano base de TODOS os especiais ofensivos. Nenhum especial deve ser
  // mais forte só por ser mais elaborado visualmente.
  specialDamage: 250,
  specialEnergyCost: 50,
  specialCooldown: 14,

  // Sequência CARGA → CARGA → ATAQUE FÍSICO
  cargaWindow: 2.5, // segundos para continuar a sequência após cada etapa
  // Comandos de duas teclas (ex.: Energia + Pulo). Tolerância entre os toques.
  chordWindow: 0.16,

  comboChainGrace: 0.22, // tempo extra após um golpe para encadear o próximo

  gravity: 32,
  jumpVelocity: 11.5,
  moveSpeed: 7.5,
  chargeMoveSpeed: 0.45, // carregando andando: anda a 45% da velocidade...
  chargeMoveRate: 0.5, // ...e carrega a 50% da velocidade parada
  bodyRadius: 0.5,
  bodyHeight: 1.8,

  hitstun: 0.32,
  // golpes físicos da sequência seguram o alvo até o próximo golpe chegar (combo contínuo, como no Storm;
  // só a substituição tira do combo)
  meleeHitstun: 0.55,
  launchHitstun: 0.85,
  hitstop: 0.055, // congelamento rápido no impacto

  roundTime: 99,
  roundsToWin: 2,

  // ---- V2: defesa ----
  block: {
    meleeChip: 0.15, // fração do dano físico que passa pela defesa
    rangedChip: 0.35, // fração do dano à distância/habilidade que passa
    maxGuard: 100, // "resistência" da defesa — não dura para sempre
    guardDamage: 0.9, // quanto cada ponto de dano bloqueado gasta da defesa
    guardRegen: 28, // por segundo, após guardRegenDelay sem bloquear
    guardRegenDelay: 0.7,
    breakStun: 1.0, // atordoamento quando a defesa quebra
    specialGuardDamage: 70, // especial defendido (parado) gasta muito da defesa
    specialChip: 0.1, // e passa 10% do dano
    moveSpeedMult: 1.25, // defesa + andar: anda mais rápido, mas fica aberto a golpes
    attackerRecoil: 0.22, // quem bate na defesa fica exposto (contra-ataque)
    pushback: 2.2,
    arc: 110, // só bloqueia golpes vindos da frente (graus)
    turnRate: 5, // parado na defesa, gira devagar para acompanhar o adversário (laterais podem passar)
    // Perfect Block para TODOS: defender no instante do impacto anula o dano e abre o atacante
    perfect: { window: 0.1, counterStun: 0.35 },
  },
  // ---- V2: esquiva (padrão; personagens podem sobrescrever em `dodge`) ----
  dodge: {
    distance: 4.2,
    duration: 0.26,
    iframes: 0.18, // invulnerabilidade no início
    cooldown: 0.6,
    cancelAfter: 0.45, // fração da esquiva a partir da qual pode contra-atacar
    charges: 4, // barra de esquivas
    damagePerCharge: 120, // a cada 120 de dano recebido recupera 1 esquiva
  },
  // ---- Dashes ----
  // A/× + A/× (toque duplo no pulo) = dash curto para frente
  // △/Y + A/× = dash longo que persegue o adversário (Mascarado: teleporte no lugar)
  dash: {
    doubleTapWindow: 0.32,
    short: { distance: 5, duration: 0.22, cooldown: 0.35, energyCost: 0, stopAt: 1.3 },
    long: { distance: 14, duration: 0.42, cooldown: 1.0, energyCost: 10, stopAt: 1.4, homing: true },
  },
  // ---- Agarrão: Defesa + ○/B. Curta distância, NÃO pode ser defendido (só esquivado) ----
  grab: {
    range: 1.35,
    arc: 70,
    reach: [0.1, 0.24], // janela em que agarra
    whiffRecovery: 0.75, // errar deixa exposto
    holdTime: 0.3, // segura antes de arremessar
    damage: 70,
    knockback: 9,
    cooldown: 1.2,
  },
  // ---- Versões fortes com △/Y (como o dash longo): △+□ e △+○ ----
  powered: {
    guardCrush: 60, // △+○ gasta 60 da defesa (quebra só se ela já estiver gasta)
    meleeCost: 15,
    meleeMult: 1.6,
    meleeCooldown: 1.6,
    rangedCost: 20,
    rangedMult: 1.6,
  },
  // ---- Escala de dano em combo: cada acerto seguido no mesmo combo vale menos ----
  comboScaling: [1, 1, 0.9, 0.8, 0.72, 0.65, 0.58, 0.5],
  comboScalingFloor: { special: 0.75, grab: 0.75 }, // especial e agarrão nunca caem abaixo disso
  maxLaunchesPerCombo: 1, // depois do 1º lançamento, novos "lançamentos" viram empurrão
  // ---- Pausa no impacto por peso do golpe ----
  hitstopBy: { light: 0.04, medium: 0.055, heavy: 0.075, launch: 0.11 },
  // ---- Elementos: ciclo Sangue > Conhecimento > Energia > Morte > Sangue (Medo neutro) ----
  elements: { advantage: 1.1, disadvantage: 0.9 },
  // ---- Substituição: L2 enquanto apanha, gasta 1 carga de esquiva e reaparece atrás do atacante ----
  substitution: { charges: 1, cooldown: 1.2, iframes: 0.35, behind: 1.6 },
  // ---- Escapar do agarrão: Defesa + ○ logo no começo ----
  grabTech: { window: 0.22, push: 6 },
  // ---- Buffer de comandos (apertou um pouco antes de poder agir) ----
  inputBuffer: 0.12,
  // ---- Levantar depois de ser lançado ----
  wakeupInvuln: 0.35,
  // ---- Transcender (todos): vida baixa + segurar △ por 1 s, 1x por partida ----
  awaken: { healthRatio: 0.3, hold: 1.0, duration: 12, damageMult: 1.15, armorHits: 1, speedMult: 1.08 },
  // ---- Combos verticais (dentro de um combo): ↑ + ○ lança para cima, ↓ + ○ derruba ----
  airCombo: { chase: 12.5, maxHits: 3, hang: 2.0, pop: 4.0, chainMult: 0.6, finalMult: 1.2 },
  // ---- Dash de perseguição no meio do combo (× depois de acertar) ----
  comboDash: { maxPerCombo: 2, energyCost: 8 },
  // ---- Queda: caído não toma dano; dá para levantar rolando (× ou L2) ----
  down: { lie: 0.75, techFrom: 0.12, techUntil: 0.6, techDistance: 2.6, techTime: 0.32, getup: 0.35 },
  // ---- Anti-repetição ----
  maxVolleys: 2, // no máximo 2 disparos do mesmo jogador no ar (um terceiro apaga o mais antigo)
  repeat: { after: 2, mult: 0.7, window: 2.5 }, // o mesmo golpe 3x seguidas causa 70% (até variar)
  // Finalizadores: o último golpe de cada sequência escolhe um destes efeitos
  finishers: {
    launch: { knockback: 7, launch: true, hitstun: 0.85 },
    knockdown: { knockback: 3, launch: true, lowLaunch: true, hitstun: 1.0 },
    push: { knockback: 11, hitstun: 0.55 },
    stun: { knockback: 1, stun: 0.75 },
    launchHigh: { knockback: 0.8, launch: true, high: true, hitstun: 1.4 }, // ↑ + ○: sobe para o combo aéreo
    spike: { knockback: 2, launch: true, spike: true, hitstun: 1.0 }, // fim do combo aéreo: crava no chão
  },
};
