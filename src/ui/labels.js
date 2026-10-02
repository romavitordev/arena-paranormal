import { KEYBOARD_LAYOUTS, PLAYER_DEVICES, BUTTON_LABELS } from '../config/controls.js';

const NAMES = { Space: 'Espaço', Semicolon: 'Ç', Escape: 'Esc', Backspace: '⌫', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', ShiftLeft: 'Shift', ShiftRight: 'Shift D', PageUp: 'PgUp', PageDown: 'PgDn', NumpadDivide: 'N/', NumpadMultiply: 'N*', NumpadSubtract: 'N-', NumpadAdd: 'N+', NumpadDecimal: 'N,' };

export function keyName(code) {
  if (NAMES[code]) return NAMES[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Numpad')) return 'N' + code.slice(6);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}

// Rótulo do botão de uma ação, conforme o dispositivo em uso pelo jogador.
export function actionLabel(playerIndex, action, source = 'keyboard') {
  if (source === 'gamepad') return BUTTON_LABELS.pad[action] || action;
  const layout = KEYBOARD_LAYOUTS[PLAYER_DEVICES[playerIndex].keyboard];
  const codes = layout[action];
  return codes ? keyName(codes[0]) : '?';
}

export function moveLabel(playerIndex) {
  const l = KEYBOARD_LAYOUTS[PLAYER_DEVICES[playerIndex].keyboard];
  return [l.up, l.left, l.down, l.right].map((c) => keyName(c[0])).join('');
}
