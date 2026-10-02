import { KEYBOARD_LAYOUTS, GAMEPAD_LAYOUT, GAMEPAD_DEADZONE, PLAYER_DEVICES } from '../config/controls.js';

const ACTIONS = ['physical', 'ranged', 'carga', 'jump', 'block', 'dodge', 'start', 'select', 'assist1', 'assist2', 'switch1', 'switch2', 'pageL', 'pageR'];
const DIRS = ['up', 'down', 'left', 'right'];

// Estado de entrada de UM jogador, já normalizado (teclado + controle somados).
// O combate só enxerga isto — nunca teclas ou botões diretamente.
export class PlayerInput {
  constructor(index) {
    this.index = index;
    this.moveX = 0; // -1..1  (direita +)
    this.moveY = 0; // -1..1  (frente/cima +)
    this.held = {};
    this.pressed = {};
    this.pressTime = {}; // tempo (s) do último toque de cada ação
    this.menu = { up: false, down: false, left: false, right: false };
    this._prevHeld = {};
    this._prevDir = {};
    this.source = 'keyboard';
    this.cpu = null; // controlador de IA opcional
  }

  // Usado pela IA e por testes: injeta um estado completo.
  setVirtual(state) {
    this._virtual = state;
  }
}

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.players = [new PlayerInput(0), new PlayerInput(1)];
    this.time = 0;
    this.anyPressed = false;

    // toques que aconteceram desde o último frame (não perde toque rápido)
    this.tapped = new Set();
    this.frameTaps = new Set();
    // controles de toque na tela (celular): somados ao jogador 1 — ver ui/touchControls.js
    this.touch = { active: false, moveX: 0, moveY: 0, held: {}, taps: new Set() };
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      this.tapped.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Tab', 'NumpadDecimal'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  connectedPads() {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
    return pads.filter((p) => p && p.connected);
  }

  update(dt) {
    this.time += dt;
    const pads = this.connectedPads();
    this.anyPressed = false;
    this.frameTaps = this.tapped;
    this.tapped = new Set();

    this.players.forEach((p, i) => {
      const dev = PLAYER_DEVICES[i];
      const layout = KEYBOARD_LAYOUTS[dev.keyboard];
      const pad = pads[dev.gamepadSlot];
      const held = {};
      let mx = 0;
      let my = 0;

      // Start/Select do aparelho físico (para pausar/reiniciar mesmo com a CPU no controle)
      {
        const kbStart = layout.start && layout.start.some((c) => this.frameTaps.has(c) || this.keys.has(c));
        const kbSelect = layout.select && layout.select.some((c) => this.frameTaps.has(c) || this.keys.has(c));
        const padBtn = (ids) => pad && ids && ids.some((id) => pad.buttons[id] && pad.buttons[id].pressed);
        const now = { start: !!(kbStart || padBtn(GAMEPAD_LAYOUT.start)), select: !!(kbSelect || padBtn(GAMEPAD_LAYOUT.select)) };
        const prev = p._prevHuman || {};
        p.humanPressed = { start: now.start && !prev.start, select: now.select && !prev.select };
        p._prevHuman = now;
      }

      if (p.cpu || p._virtual) {
        const v = p.cpu ? p.cpu.produce(dt) : p._virtual;
        mx = v.moveX || 0;
        my = v.moveY || 0;
        for (const a of ACTIONS) held[a] = !!(v.held && v.held[a]);
        p.source = 'cpu';
      } else {
        const kbHeld = (codes) => codes && codes.some((c) => this.keys.has(c) || this.frameTaps.has(c));
        for (const a of ACTIONS) held[a] = kbHeld(layout[a]);
        mx += (kbHeld(layout.right) ? 1 : 0) - (kbHeld(layout.left) ? 1 : 0);
        my += (kbHeld(layout.up) ? 1 : 0) - (kbHeld(layout.down) ? 1 : 0);

        // toque na tela (celular): botões e joystick virtuais do jogador 1
        const T = this.touch;
        if (i === 0 && T.active) {
          for (const a of ACTIONS) if (T.held[a] || T.taps.has(a)) held[a] = true;
          if (Math.abs(T.moveX) > Math.abs(mx)) mx = T.moveX;
          if (Math.abs(T.moveY) > Math.abs(my)) my = T.moveY;
          if (T.moveX || T.moveY || T.taps.size || ACTIONS.some((a) => T.held[a])) p.source = 'touch';
          T.taps.clear();
        }
        if (pad) {
          // gatilhos (LT/RT) são analógicos: considera apertado acima de 35%
          const btn = (ids) => ids.some((id) => pad.buttons[id] && (pad.buttons[id].pressed || pad.buttons[id].value > 0.35));
          for (const a of ACTIONS) if (GAMEPAD_LAYOUT[a] && btn(GAMEPAD_LAYOUT[a])) held[a] = true;
          // analógico direito ◀/▶: TROCA o personagem em campo pelo da assistência 1/2
          // (as assistências são chamadas por L1/LB e R1/RB)
          const rx = pad.axes[2] || 0;
          if (rx < -0.6) held.switch1 = true;
          if (rx > 0.6) held.switch2 = true;
          let ax = pad.axes[0] || 0;
          let ay = -(pad.axes[1] || 0);
          const mag = Math.hypot(ax, ay);
          if (mag < GAMEPAD_DEADZONE) { ax = 0; ay = 0; }
          ax += (btn(GAMEPAD_LAYOUT.right) ? 1 : 0) - (btn(GAMEPAD_LAYOUT.left) ? 1 : 0);
          ay += (btn(GAMEPAD_LAYOUT.up) ? 1 : 0) - (btn(GAMEPAD_LAYOUT.down) ? 1 : 0);
          if (Math.abs(ax) > Math.abs(mx)) mx = ax;
          if (Math.abs(ay) > Math.abs(my)) my = ay;
          if (ax || ay || ACTIONS.some((a) => GAMEPAD_LAYOUT[a] && btn(GAMEPAD_LAYOUT[a]))) p.source = 'gamepad';
          else if (mx || my || ACTIONS.some((a) => held[a])) p.source = 'keyboard';
        } else if (p.source !== 'touch') {
          p.source = 'keyboard';
        }
      }

      const mag = Math.hypot(mx, my);
      if (mag > 1) { mx /= mag; my /= mag; }
      p.moveX = mx;
      p.moveY = my;

      for (const a of ACTIONS) {
        p.pressed[a] = held[a] && !p._prevHeld[a];
        if (p.pressed[a]) {
          p.pressTime[a] = this.time;
          this.anyPressed = true;
        }
      }
      p.held = held;
      p._prevHeld = held;

      // Navegação de menu com detecção de borda
      const dirNow = { up: my > 0.5, down: my < -0.5, left: mx < -0.5, right: mx > 0.5 };
      for (const d of DIRS) {
        p.menu[d] = dirNow[d] && !p._prevDir[d];
        if (p.menu[d]) this.anyPressed = true;
      }
      p._prevDir = dirNow;
    });
  }

  // Tecla "global" (ex.: Enter no título)
  keyPressedOnce(code) {
    return this.frameTaps.has(code);
  }
}
