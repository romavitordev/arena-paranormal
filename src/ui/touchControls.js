// CONTROLES DE TOQUE (celular / tablet). Ficam por cima do jogo e alimentam o jogador 1 (InputManager.touch).
//  - Luta: joystick à esquerda; losango △ □ ○ × à direita (mesma posição do controle); R1 (modificador: segure e
//    toque um botão do losango), DEF (defesa: segure), ESQ (esquiva) e ESPECIAL (faz △ △ ○ sozinho); PAUSA.
//    Na batalha em equipe aparecem os botões das assistências e da troca.
//  - Menus: setas, OK e VOLTAR (os cartões e opções também aceitam toque direto).
// Aparece sozinho em aparelhos com tela de toque (ou com ?touch=1 na URL para testar no PC).

export function isTouchDevice() {
  const q = new URLSearchParams(location.search);
  if (q.has('touch')) return q.get('touch') !== '0';
  return 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
}

const FIGHT_BUTTONS = [
  // [ação, rótulo, classe] — posições no CSS (#touch .b-*)
  ['carga', '△', 'b-tri'],
  ['ranged', '□', 'b-sq'],
  ['physical', '○', 'b-ci'],
  ['jump', '×', 'b-x'],
  ['mod', 'R1', 'b-r1'],
  ['block', 'DEF', 'b-r2'],
  ['dodge', 'ESQ', 'b-l2'],
];

export class TouchControls {
  constructor(input) {
    this.input = input;
    this.T = input.touch;
    this.T.active = true;
    this.T.queue = [];
    this.mode = null;
    this.root = document.createElement('div');
    this.root.id = 'touch';
    this.root.innerHTML = `
      <div class="t-fight">
        <div class="stick"><div class="knob"></div></div>
        ${FIGHT_BUTTONS.map(([a, l, c]) => `<button class="tb ${c}" data-a="${a}">${l}</button>`).join('')}
        <button class="tb b-sp" data-macro="special">ESPECIAL</button>
        <button class="tb b-a1 team" data-a="assist1">AS1</button>
        <button class="tb b-a2 team" data-a="assist2">AS2</button>
        <button class="tb b-s1 team" data-a="switch1">⇄1</button>
        <button class="tb b-s2 team" data-a="switch2">⇄2</button>
        <button class="tb b-pause" data-a="start">II</button>
      </div>
      <div class="t-menu">
        <div class="dpad">
          <button class="tb d-up" data-dir="up">▲</button>
          <button class="tb d-left" data-dir="left">◀</button>
          <button class="tb d-right" data-dir="right">▶</button>
          <button class="tb d-down" data-dir="down">▼</button>
        </div>
        <button class="tb m-lb" data-a="pageL">LB</button>
        <button class="tb m-rb" data-a="pageR">RB</button>
        <button class="tb m-back" data-a="physical">VOLTAR</button>
        <button class="tb m-ok" data-a="jump">OK</button>
      </div>
    `;
    document.body.appendChild(this.root);
    document.body.classList.add('touch-capable');
    document.body.classList.add('touch-ui');
    // notebook com tela de toque: os botões somem quando o jogador usa teclado/controle e voltam ao tocar na tela
    window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') this.setHidden(false); }, true);
    this.bindButtons();
    this.bindStick();
  }

  // botões: segurar = held; um toque rápido também vale (taps) para não perder o aperto entre dois quadros
  bindButtons() {
    const T = this.T;
    for (const b of this.root.querySelectorAll('.tb')) {
      const a = b.dataset.a;
      const dir = b.dataset.dir;
      const macro = b.dataset.macro;
      const down = (e) => {
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        b.classList.add('on');
        if (macro === 'special') {
          // △ △ ○ com um quadro de intervalo entre cada toque
          T.queue.push(['carga'], [], ['carga'], [], ['physical']);
          return;
        }
        if (dir) { T.dirHeld = dir; return; }
        T.held[a] = true;
        T.taps.add(a);
      };
      const up = (e) => {
        e.preventDefault();
        b.classList.remove('on');
        if (dir) { if (T.dirHeld === dir) T.dirHeld = null; return; }
        if (a) T.held[a] = false;
      };
      b.addEventListener('pointerdown', down);
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  // joystick analógico: arrasta o pino; distância = intensidade (andar devagar / correr)
  bindStick() {
    const stick = this.root.querySelector('.stick');
    const knob = stick.querySelector('.knob');
    const T = this.T;
    let id = null;
    const set = (e) => {
      const r = stick.getBoundingClientRect();
      let dx = e.clientX - (r.left + r.width / 2);
      let dy = e.clientY - (r.top + r.height / 2);
      const R = Math.min(r.width, r.height) / 2 - knob.offsetWidth / 2 - 2;
      const d = Math.hypot(dx, dy);
      if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const mx = dx / R;
      const my = -dy / R;
      const mag = Math.hypot(mx, my);
      T.moveX = mag < 0.15 ? 0 : mx;
      T.moveY = mag < 0.15 ? 0 : my;
    };
    stick.addEventListener('pointerdown', (e) => { e.preventDefault(); id = e.pointerId; try { stick.setPointerCapture(id); } catch (err) { /* evento sintético sem ponteiro real */ } set(e); });
    stick.addEventListener('pointermove', (e) => { if (e.pointerId === id) set(e); });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      knob.style.transform = '';
      T.moveX = 0;
      T.moveY = 0;
    };
    stick.addEventListener('pointerup', end);
    stick.addEventListener('pointercancel', end);
  }

  setHidden(v) {
    this.hidden = v;
    this.root.classList.toggle('away', v);
    document.body.classList.toggle('touch-ui', !v);
  }

  // chamado a cada quadro, ANTES do InputManager: mostra o conjunto certo de botões e aplica as macros
  sync(state, teamMode = false) {
    const fight = state === 'fight';
    const mode = fight ? 'fight' : 'menu';
    if (mode !== this.mode) {
      this.mode = mode;
      this.root.classList.toggle('fighting', fight);
      // trocar de modo solta tudo (nada fica "preso" apertado)
      this.T.held = {};
      this.T.dirHeld = null;
      this.T.moveX = 0;
      this.T.moveY = 0;
    }
    this.root.classList.toggle('team', !!teamMode);
    const src = this.input.players[0].source;
    if (!this.hidden && (src === 'keyboard' || src === 'gamepad') && this.input.anyPressed) this.setHidden(true);
    // seleção de personagem: os cartões e as setas de página já aceitam toque — só OK/VOLTAR no alto
    this.root.classList.toggle('select', state === 'select');
    // menus: as setas viram direção (o InputManager transforma em navegação)
    if (!fight) {
      const d = this.T.dirHeld;
      this.T.moveX = d === 'left' ? -1 : d === 'right' ? 1 : 0;
      this.T.moveY = d === 'up' ? 1 : d === 'down' ? -1 : 0;
    }
    // macro em andamento (ESPECIAL): um passo por quadro
    if (this.T.queue.length) for (const a of this.T.queue.shift()) this.T.taps.add(a);
  }
}
