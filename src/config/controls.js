// Mapeamento de controles. Nada no jogo usa teclas fixas: tudo passa por aqui.
// Para mudar uma tecla, troque o código (KeyboardEvent.code) na lista.
//
// Ações:
//   physical → Ataque Físico                (○ Bolinha / B)
//   ranged   → Ataque/habilidade principal  (□ Quadrado / X)
//   carga    → Carga de Poder / Energia     (△ Triângulo / Y)
//   jump     → Pulo                         (× X / A)
//   block    → Defesa (segurar)             (R2 / RT)
//              parado = defende tudo · andando = anda mais rápido, mas aberto
//   dodge    → Esquiva (+ direção)          (L2 / LT) — 4 cargas
//   mod      → Modificador de habilidade    (R1 / RB) — segurar + outro botão
//   start    → Pausa
//   assist1  → Assistência 1 (batalha em equipe) (D-pad ← / analógico direito ←)
//   assist2  → Assistência 2 (batalha em equipe) (D-pad → / analógico direito →)
//
// A câmera fica sempre travada no adversário (padrão), sem botão de troca.
// L1/LB fica livre para funções futuras.

export const KEYBOARD_LAYOUTS = {
  // Jogador 1 — lado esquerdo do teclado
  left: {
    up: ['KeyW'],
    down: ['KeyS'],
    left: ['KeyA'],
    right: ['KeyD'],
    physical: ['KeyF'],
    ranged: ['KeyG'],
    carga: ['KeyH'],
    jump: ['Space'],
    block: ['KeyQ'],
    dodge: ['ShiftLeft'],
    mod: ['KeyR'],
    assist1: ['KeyZ'],
    assist2: ['KeyC'],
    select: ['Tab'],
    start: ['Escape'],
  },
  // Jogador 2 — setas + teclado numérico (alternativas para notebook)
  right: {
    up: ['ArrowUp'],
    down: ['ArrowDown'],
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    physical: ['Numpad1', 'KeyK'],
    ranged: ['Numpad2', 'KeyL'],
    carga: ['Numpad3', 'Semicolon'], // Semicolon = tecla Ç no ABNT2
    jump: ['Numpad0', 'KeyJ'],
    block: ['Numpad4', 'KeyU'],
    dodge: ['NumpadDecimal', 'KeyP'],
    mod: ['Numpad6', 'KeyO'],
    assist1: ['Numpad7', 'KeyN'],
    assist2: ['Numpad9', 'KeyM'],
    start: ['Backspace'],
  },
};

// Gamepad no layout "standard" do navegador (Xbox / PlayStation).
export const GAMEPAD_LAYOUT = {
  jump: [0], // A / ×
  physical: [1], // B / ○
  ranged: [2], // X / □
  carga: [3], // Y / △
  mod: [5], // RB / R1
  dodge: [6], // LT / L2
  block: [7], // RT / R2
  select: [8],
  start: [9],
  assist1: [14], // D-pad ← (na batalha em equipe o D-pad ←/→ chama as assistências)
  assist2: [15], // D-pad →
  up: [12],
  down: [13],
  left: [14],
  right: [15],
};

export const GAMEPAD_DEADZONE = 0.25;

// Quem lê o quê. Cada jogador soma teclado + controle, então dá para jogar
// com dois controles, com teclado dividido ou misturado.
export const PLAYER_DEVICES = [
  { keyboard: 'left', gamepadSlot: 0 },
  { keyboard: 'right', gamepadSlot: 1 },
];

// Nomes exibidos na HUD / tela de controles quando o jogador usa controle.
export const BUTTON_LABELS = {
  pad: {
    physical: 'B/○', ranged: 'X/□', carga: 'Y/△', jump: 'A/×',
    block: 'RT/R2', mod: 'RB/R1', dodge: 'LT/L2', assist1: '◀', assist2: '▶',
  },
};
