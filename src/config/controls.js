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
//   start    → Pausa
//   assist1  → Chama a assistência 1 (batalha em equipe)       (L1 / LB)
//   assist2  → Chama a assistência 2 (batalha em equipe)       (R1 / RB)
//   switch1  → Troca para o personagem da assistência 1        (analógico direito ◀)
//   switch2  → Troca para o personagem da assistência 2        (analógico direito ▶)
//
// Habilidades (sem botão modificador próprio): △ + ○ · △ + □ · △ + L2 · R2 + △ · R2 + × (R2 + ○ = agarrão)
//
//   pageL/pageR → nos menus: página anterior/seguinte da seleção    (LB / RB)
//
// A câmera fica sempre travada no adversário (padrão), sem botão de troca.
//
// TECLADO (revisado): os quatro botões de ação ficam num LOSANGO igual ao do controle —
//   I = △ Carga · J = □ Principal · L = ○ Físico · K = × Pulo (Espaço também pula)
// A mão esquerda fica nos "gatilhos": E = R2 Defesa, Shift = L2 Esquiva; Q = L1 e R = R1 (assistências).
// Equipe: Q/1 e R/2 chamam as assistências, 3 / 4 trocam de personagem.

export const KEYBOARD_LAYOUTS = {
  // Jogador 1 — lado esquerdo do teclado
  left: {
    up: ['KeyW'],
    down: ['KeyS'],
    left: ['KeyA'],
    right: ['KeyD'],
    // losango (mesma posição dos botões do controle)
    carga: ['KeyI'], // △ / Y
    ranged: ['KeyJ'], // □ / X
    physical: ['KeyL'], // ○ / B
    jump: ['KeyK', 'Space'], // × / A
    // gatilhos na mão esquerda
    block: ['KeyE'], // R2 / RT (segurar)
    dodge: ['ShiftLeft'], // L2 / LT
    assist1: ['KeyQ', 'Digit1'], // L1 / LB
    assist2: ['KeyR', 'Digit2'], // R1 / RB
    switch1: ['Digit3'],
    switch2: ['Digit4'],
    pageL: ['KeyQ'],
    pageR: ['KeyE'],
    select: ['Tab'],
    start: ['Escape'],
  },
  // Jogador 2 — setas + teclado numérico (alternativas para notebook)
  // Jogador 2 — setas + teclado numérico, com o MESMO losango (8 △ · 4 □ · 6 ○ · 2 ×)
  right: {
    up: ['ArrowUp'],
    down: ['ArrowDown'],
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    carga: ['Numpad8'], // △
    ranged: ['Numpad4'], // □
    physical: ['Numpad6'], // ○
    jump: ['Numpad2', 'Numpad0'], // ×
    block: ['Numpad9'], // R2
    dodge: ['Numpad1', 'NumpadDecimal'], // L2
    assist1: ['Numpad7', 'NumpadDivide'], // L1
    assist2: ['Numpad3', 'NumpadMultiply'], // R1
    switch1: ['NumpadSubtract'],
    switch2: ['NumpadAdd'],
    pageL: ['PageUp'],
    pageR: ['PageDown'],
    start: ['Backspace'],
  },
};

// Gamepad no layout "standard" do navegador (Xbox / PlayStation).
export const GAMEPAD_LAYOUT = {
  jump: [0], // A / ×
  physical: [1], // B / ○
  ranged: [2], // X / □
  carga: [3], // Y / △
  assist1: [4], // LB / L1 (luta em equipe: assistência 1)
  assist2: [5], // RB / R1 (luta em equipe: assistência 2)
  pageL: [4], // LB / L1 (menus: página anterior)
  pageR: [5], // RB / R1 (menus: página seguinte)
  dodge: [6], // LT / L2
  block: [7], // RT / R2
  select: [8],
  start: [9],
  // switch1/switch2: analógico direito ◀/▶ (lido como eixo no InputManager) — o D-pad fica só para andar/menus
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
    block: 'RT/R2', dodge: 'LT/L2', pageL: 'LB/L1', pageR: 'RB/R1', assist1: 'LB/L1', assist2: 'RB/R1', switch1: 'R◀', switch2: 'R▶',
  },
};
