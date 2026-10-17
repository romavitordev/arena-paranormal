// CONTROLES DE TOQUE (celular / tablet). Ficam por cima do jogo e alimentam o jogador local (InputManager.touch).
//  - Luta: joystick FLUTUANTE à esquerda (nasce onde o polegar encosta); à direita, um ATAQUE grande no canto com um
//    anel de botões em volta (× pulo · □ tiro · ESQ · △ carga · DEF) e, num anel de fora, UM BOTÃO POR HABILIDADE do
//    lutador em campo + o ESPECIAL. Cada botão de habilidade aperta sozinho o comando dela (△ + ○, DEF + △, ← + □...) no
//    mesmo quadro — vale igual ao controle, inclusive na partida online — e mostra a recarga e se falta sanidade.
//    PAUSA no alto, no meio. Na batalha em equipe aparecem as assistências e a troca, à esquerda.
//  - Menus: opções e cartões clicáveis; a seta no alto volta para a tela anterior.
// As posições são calculadas aqui (layout), na escala da tela. Aparece sozinho em aparelhos com tela de toque (ou com
// ?touch=1 na URL para testar no PC).

import { viewSize } from '../core/viewport.js';
import { t, onLanguageChange } from '../i18n/index.js';
import { hasPassive } from '../combat/passives.js';

export function isTouchDevice() {
  const q = new URLSearchParams(location.search);
  if (q.has('touch')) return q.get('touch') !== '0';
  return 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
}

// botões fixos da direita: [ação, símbolo, legenda (i18n), ângulo no anel de dentro (graus; 180 = esquerda, 90 = cima)]
const RING = [
  ['jump', '×', 'touch.jump', 200, 'c-x'],
  ['ranged', '□', 'touch.shot', 166, 'c-sq'],
  ['dodge', '', 'hud.esq', 132, 'c-esq'],
  ['carga', '△', 'hud.charge', 98, 'c-tri'],
  ['block', '', 'hud.def', 64, 'c-def'],
];

// o comando que cada tipo de habilidade aperta (um quadro, tudo junto) — ver Fighter.handleCommands
const CHORDS = {
  'carga+physical': ['carga', 'physical'],
  'carga+ranged': ['carga', 'ranged'],
  'carga+dodge': ['carga', 'dodge'],
  'carga+jump': ['carga', 'jump'],
  'block+carga': ['block', 'carga'],
  'block+jump': ['block', 'jump'],
  'ranged+forward': ['ranged'],
  'ranged+back': ['ranged'],
  'ranged+side': ['ranged'],
};
const ORDER = Object.keys(CHORDS);

// nome do botão: o que mais IDENTIFICA a habilidade. O apelido do ritual entre aspas vem primeiro (Granada "Supernova"
// → Supernova; Cicatrização "Paradiso" → Paradiso); sem apelido, o maior começo do nome que cabe (até 20 letras, sem
// terminar em "de", "do"...). Se dois botões do mesmo lutador ficarem iguais, os dois mostram o nome inteiro.
const LABEL_MAX = 20;
const FILLER = /^(de|do|da|dos|das|e|com|que|pelo|pela|nos|nas|no|na|em|of|the)$/i;
export function abilityLabel(name) {
  const nick = String(name).match(/["“«]([^"”»]+)["”»]/);
  if (nick && nick[1].trim()) return nick[1].trim();
  const words = String(name).replace(/\([^)]*\)/g, '').trim().split(/\s+/).filter(Boolean);
  let best = words[0] || String(name);
  for (let n = 2; n <= words.length; n++) {
    const s = words.slice(0, n).join(' ');
    if (s.length > LABEL_MAX) break;
    if (!FILLER.test(words[n - 1])) best = s;
  }
  return best;
}
export function abilityLabels(names) {
  const labels = names.map(abilityLabel);
  return labels.map((l, i) => (labels.indexOf(l) !== labels.lastIndexOf(l) ? String(names[i]).replace(/["“”«»]/g, '') : l));
}

// tamanho da letra para o nome caber no botão (mede o texto; abaixo de 7,5 px abrevia a palavra comprida: "Cicatriz.")
const measureCtx = document.createElement('canvas').getContext('2d');
function fitLabel(text, width, maxPx) {
  const longest = (s) => s.split(' ').reduce((m, w) => {
    measureCtx.font = `800 10px Inter, sans-serif`;
    return Math.max(m, measureCtx.measureText(w).width / 10);
  }, 0);
  let s = text;
  let px = Math.min(maxPx, width / longest(s));
  while (px < 7.5 && s.replace(/\.$/, '').length > 4) {
    s = s.split(' ').map((w) => (w.length > 6 && measureCtx.measureText(w).width / 10 * 7.5 > width ? `${w.replace(/\.$/, '').slice(0, -1)}.` : w)).join(' ');
    px = Math.min(maxPx, width / longest(s));
  }
  return { text: s, px: Math.max(7, Math.floor(px * 10) / 10) };
}

// escala dos controles pela tela (o desenho é feito para 844 × 390, celular comum deitado)
const scaleFor = () => { const { w, h } = viewSize(); return Math.max(0.8, Math.min(1.35, Math.min(h / 390, w / 800))); };

export class TouchControls {
  constructor(input) {
    this.input = input;
    this.T = input.touch;
    this.T.active = true;
    this.T.queue = [];
    this.mode = null;
    this.fighter = null;
    this.boundDef = null;
    this.abilBtns = [];
    this.root = document.createElement('div');
    this.root.id = 'touch';
    this.root.innerHTML = `
      <div class="t-fight">
        <div class="t-zone"><div class="stick"><div class="knob"></div></div></div>
        <div class="t-right">
          <button class="tb c-atk" data-a="physical"><b>○</b><small data-t="touch.attack">${t('touch.attack')}</small></button>
          ${RING.map(([a, sym, lbl, , c]) => `<button class="tb ring ${c}" data-a="${a}">${sym ? `<b>${sym}</b>` : ''}<small data-t="${lbl}">${t(lbl)}</small><i class="cd"></i><em class="s"></em></button>`).join('')}
          <button class="tb abil c-sp" data-macro="special"><span data-t="hud.special">${t('hud.special')}</span><i class="cd"></i><em class="s"></em></button>
          <div class="t-abils"></div>
        </div>
        <div class="t-team"></div>
        <button class="tb b-pause" data-a="start" aria-label="Pausa">II</button>
      </div>
      <button class="tb t-back" type="button" aria-label="Voltar" title="Voltar">←</button>
      <button class="tb t-fullscreen" type="button" aria-label="Entrar em tela cheia" title="Tela cheia">⛶</button>
      <div class="t-status" role="status" aria-live="polite"></div>
      <div class="t-rotate" role="alert" aria-live="assertive">
        <strong data-t="touch.rotate">${t('touch.rotate')}</strong>
        <span data-t="touch.rotate_sub">${t('touch.rotate_sub')}</span>
      </div>
    `;
    document.body.appendChild(this.root);
    this.right = this.root.querySelector('.t-right');
    this.abilBox = this.root.querySelector('.t-abils');
    this.teamBox = this.root.querySelector('.t-team');
    this.ringEls = Object.fromEntries(RING.map(([a]) => [a, this.root.querySelector(`.ring[data-a="${a}"]`)]));
    this.spBtn = this.root.querySelector('.c-sp');
    // trocar o idioma nas OPÇÕES atualiza os rótulos na hora (os botões são criados uma vez só)
    onLanguageChange(() => { this.root.querySelectorAll('[data-t]').forEach((e) => { e.textContent = t(e.dataset.t); }); this.layout(); });
    document.body.classList.add('touch-capable');
    document.body.classList.add('touch-ui');
    window.addEventListener('pointerdown', (e) => {
      if (this.scene && !this.hidden && !(e.target && e.target.closest && e.target.closest('.tb'))) this.T.taps.add('jump');
    });
    // notebook com tela de toque: os botões somem quando o jogador usa teclado/controle e voltam ao tocar na tela
    window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') this.setHidden(false); }, true);
    for (const b of this.root.querySelectorAll('.t-fight .tb')) this.bindButton(b);
    this.bindStick();
    this.bindNavigation();
    this.bindFullscreen();
    this.layout(); // ao girar, o main.js chama layout() de novo (com o tamanho certo de core/viewport.js)
  }

  // botões: segurar = held; um toque rápido também vale (taps) para não perder o aperto entre dois quadros
  bindButton(b) {
    const T = this.T;
    const a = b.dataset.a;
    const down = (e) => {
      e.preventDefault();
      try { b.setPointerCapture(e.pointerId); } catch (err) { /* evento sintético sem ponteiro real */ }
      b.classList.add('on');
      if (b.dataset.macro === 'special') {
        // △ △ ○ com um quadro de intervalo entre cada toque
        T.queue.push(['carga'], [], ['carga'], [], ['physical']);
        return;
      }
      if (b.dataset.ab !== undefined) { this.fireAbility(+b.dataset.ab); return; }
      T.held[a] = true;
      T.taps.add(a);
    };
    const up = (e) => {
      e.preventDefault();
      b.classList.remove('on');
      if (a) T.held[a] = false;
    };
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // habilidade pelo botão: o comando dela num quadro só (□ + direção calcula a direção em relação ao adversário)
  fireAbility(k) {
    const ab = this.abilities[k];
    const f = this.fighter;
    if (!ab || !f) return;
    const keys = CHORDS[ab.input];
    const step = [...keys];
    if (ab.input.startsWith('ranged+')) {
      const opp = f.opponent;
      const basis = f.world && f.world.cameraBasis;
      if (opp && basis) {
        let dx = opp.pos.x - f.pos.x;
        let dz = opp.pos.z - f.pos.z;
        const len = Math.hypot(dx, dz) || 1;
        dx /= len; dz /= len;
        const kind = ab.input.slice(7);
        if (kind === 'back') { dx = -dx; dz = -dz; } else if (kind === 'side') { [dx, dz] = [-dz, dx]; }
        step.nudge = [dx * basis.right.x + dz * basis.right.z, dx * basis.forward.x + dz * basis.forward.z];
      }
    }
    if (!keys.includes('block')) step.mute = ['block'];
    this.T.queue.push(step);
  }

  // posições dos botões da direita: ATAQUE no canto, anel de dentro e anel de fora (habilidades), na escala da tela
  layout() {
    const k = scaleFor();
    this.k = k;
    const cx = 80 * k; // centro do ATAQUE, medido da direita
    const cy = 84 * k; // e de baixo
    const put = (el, ang, r, size) => {
      const rad = (ang * Math.PI) / 180;
      const x = cx - Math.cos(rad) * r;
      const y = cy + Math.sin(rad) * r;
      el.style.width = el.style.height = `${size}px`;
      el.style.right = `${x - size / 2}px`;
      el.style.bottom = `${y - size / 2}px`;
    };
    put(this.root.querySelector('.c-atk'), 0, 0, 88 * k);
    for (const [a, , , ang] of RING) put(this.ringEls[a], ang, 98 * k, 56 * k);
    // anel de fora: o ESPECIAL em cima e as habilidades descendo para a esquerda
    const step = 19.5;
    const size = 56 * k;
    put(this.spBtn, 81, 172 * k, size);
    this.abilBtns.forEach((b, i) => put(b, 81 + step * (i + 1), 172 * k, size));
    this.root.style.setProperty('--k', k);
    // nomes: o maior tamanho de letra que cabe (a largura útil do círculo é menor que o diâmetro)
    for (const b of [this.spBtn, ...this.abilBtns]) {
      const span = b.querySelector('span');
      const label = b.dataset.label || t(span.dataset.t);
      const { text, px } = fitLabel(label, size * 0.8, 10.5 * k);
      span.textContent = text;
      span.style.fontSize = `${px}px`;
    }
  }

  // monta os botões de habilidade do lutador em campo (muda com a troca da equipe e com as transformações)
  bindFighter(f) {
    this.fighter = f;
    this.boundDef = f ? f.def : null;
    this.abilBox.innerHTML = '';
    this.abilBtns = [];
    this.abilities = f ? (f.def.abilities || []).filter((a) => CHORDS[a.input]).sort((x, y) => ORDER.indexOf(x.input) - ORDER.indexOf(y.input)).slice(0, 6) : [];
    const labels = abilityLabels(this.abilities.map((a) => a.name));
    this.abilities.forEach((a, i) => {
      const b = document.createElement('button');
      b.className = 'tb abil';
      b.dataset.ab = i;
      b.setAttribute('aria-label', a.name);
      b.dataset.label = labels[i];
      b.innerHTML = '<span></span><i class="cd"></i><em class="s"></em>';
      this.abilBox.appendChild(b);
      this.bindButton(b);
      this.abilBtns.push(b);
    });
    if (f) this.root.style.setProperty('--ec', f.def.energyColor != null ? `#${(f.def.energyColor >>> 0).toString(16).padStart(6, '0').slice(-6)}` : '#a46bff');
    // equipe: assistências (chamar) e troca, com o nome de quem vem
    this.teamBox.innerHTML = '';
    this.teamEls = [];
    if (f && f.assists) {
      f.assists.forEach((as, i) => {
        const b = document.createElement('button');
        b.className = 'tb team-as';
        b.dataset.a = i ? 'assist2' : 'assist1';
        b.style.setProperty('--ac', as.def.color);
        b.innerHTML = `<span>${as.def.name.split(/\s+/)[0]}</span><em class="s"></em>`;
        const sw = document.createElement('button');
        sw.className = 'tb team-sw';
        sw.dataset.a = i ? 'switch2' : 'switch1';
        sw.setAttribute('aria-label', `Trocar para ${as.def.name}`);
        sw.textContent = '⇄';
        this.teamBox.append(b, sw);
        this.bindButton(b);
        this.bindButton(sw);
        this.teamEls.push([b, sw]);
      });
    }
    this.layout();
  }

  // recarga, falta de sanidade e estados (transformação pronta, cargas da esquiva...) desenhados nos próprios botões
  paint() {
    const f = this.fighter;
    if (!f) return;
    const cd = (el, key) => {
      const c = f.cooldowns[key] || 0;
      const max = f.cooldownMax[key] || 1;
      el.querySelector('.cd').style.setProperty('--p', `${Math.min(1, c / max) * 100}%`);
      el.querySelector('.s').textContent = c > 0 ? Math.ceil(c) : '';
      el.classList.toggle('cool', c > 0);
      return c;
    };
    const free = hasPassive(f, 'bloodPrice'); // paga com vida: nunca "sem sanidade"
    this.abilities.forEach((a, i) => {
      const el = this.abilBtns[i];
      const c = cd(el, a.id);
      const noCost = !free && f.energy < (a.energyCost || 0);
      el.classList.toggle('nocost', noCost && c <= 0);
      el.classList.toggle('ready', c <= 0 && !noCost);
    });
    // especial: pronto (brilha), gasto no round ou sem sanidade
    const used = f.specialUsedUp && f.specialUsedUp();
    const spC = used ? 0 : cd(this.spBtn, 'special');
    if (used) this.spBtn.querySelector('.s').textContent = t('hud.used');
    const avail = !used && f.specialAvailable();
    this.spBtn.classList.toggle('ready', avail);
    this.spBtn.classList.toggle('nocost', !used && !avail && spC <= 0);
    this.spBtn.classList.toggle('used', !!used);
    cd(this.ringEls.ranged, 'ranged');
    // △: a transformação disponível (segurar)
    const tri = this.ringEls.carga;
    tri.classList.toggle('awaken', !!(f.canTransform && f.canTransform()));
    // ESQ: as cargas da esquiva (bolinhas embaixo)
    const esq = this.ringEls.dodge;
    esq.querySelector('.s').textContent = '•'.repeat(Math.max(0, f.dodges || 0));
    esq.classList.toggle('nocost', (f.dodges || 0) <= 0 || f.dodgeLockout > 0);
    if (this.teamEls && f.assists) {
      f.assists.forEach((as, i) => {
        const pair = this.teamEls[i];
        if (!pair) return;
        pair[0].classList.toggle('ready', !!as.ready);
        pair[0].classList.toggle('active', !!as.active);
        pair[0].querySelector('.s').textContent = as.cooldown > 0 ? Math.ceil(as.cooldown) : '';
        pair[1].classList.toggle('nocost', f.cooldowns.switch > 0 || !!as.active);
      });
    }
  }

  bindNavigation() {
    this.root.querySelector('.t-back').addEventListener('click', (e) => {
      e.preventDefault();
      this.T.taps.add('physical');
    });
  }

  bindFullscreen() {
    const button = this.root.querySelector('.t-fullscreen');
    const status = this.root.querySelector('.t-status');
    let statusTimer;
    const update = () => {
      const active = !!document.fullscreenElement;
      button.textContent = active ? '×' : '⛶';
      button.setAttribute('aria-label', active ? 'Sair da tela cheia' : 'Entrar em tela cheia');
      button.title = active ? 'Sair da tela cheia' : 'Tela cheia';
    };
    button.addEventListener('click', async () => {
      try {
        if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) {
          status.textContent = 'Tela cheia não é suportada neste navegador.';
          status.classList.add('on');
          clearTimeout(statusTimer);
          statusTimer = setTimeout(() => status.classList.remove('on'), 4000);
          return;
        }
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch (error) {
        status.textContent = `Não foi possível alterar a tela cheia: ${error.message || error}`;
        status.classList.add('on');
        clearTimeout(statusTimer);
        statusTimer = setTimeout(() => status.classList.remove('on'), 4000);
      }
    });
    document.addEventListener('fullscreenchange', update);
    update();
  }

  // joystick analógico FLUTUANTE: encostar em qualquer lugar da metade esquerda põe o joystick ali; arrastar move
  // (distância = intensidade: andar devagar / correr); soltar devolve ao lugar de descanso
  bindStick() {
    const zone = this.root.querySelector('.t-zone');
    const stick = zone.querySelector('.stick');
    const knob = stick.querySelector('.knob');
    const T = this.T;
    let id = null;
    let ox = 0;
    let oy = 0;
    const set = (e) => {
      let dx = e.clientX - ox;
      let dy = e.clientY - oy;
      const R = stick.offsetWidth / 2 - knob.offsetWidth / 4;
      const d = Math.hypot(dx, dy);
      if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const mx = dx / R;
      const my = -dy / R;
      const mag = Math.hypot(mx, my);
      T.moveX = mag < 0.15 ? 0 : mx;
      T.moveY = mag < 0.15 ? 0 : my;
    };
    zone.addEventListener('pointerdown', (e) => {
      if (id !== null) return;
      e.preventDefault();
      id = e.pointerId;
      try { zone.setPointerCapture(id); } catch (err) { /* evento sintético sem ponteiro real */ }
      // o joystick nasce sob o polegar (sem sair da zona)
      const z = zone.getBoundingClientRect();
      const h = stick.offsetWidth / 2;
      ox = Math.max(z.left + h, Math.min(z.right - h, e.clientX));
      oy = Math.max(z.top + h, Math.min(z.bottom - h, e.clientY));
      stick.style.left = `${ox - z.left - h}px`;
      stick.style.top = `${oy - z.top - h}px`;
      stick.style.bottom = 'auto';
      stick.classList.add('on');
      set(e);
    });
    zone.addEventListener('pointermove', (e) => { if (e.pointerId === id) set(e); });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      knob.style.transform = '';
      stick.style.left = stick.style.top = stick.style.bottom = '';
      stick.classList.remove('on');
      T.moveX = 0;
      T.moveY = 0;
    };
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);
  }

  setHidden(v) {
    this.hidden = v;
    this.root.classList.toggle('away', v);
    document.body.classList.toggle('touch-ui', !v);
  }

  // chamado a cada quadro, ANTES do InputManager: mostra o conjunto certo de botões e aplica as macros
  // scene: apresentação antes da luta / fim da luta — os botões de combate somem (cobriam as falas) e um toque
  // em qualquer lugar vale como × (pula a apresentação)
  // fighter: o lutador deste aparelho (P1, ou o lado deste computador na partida online)
  sync(state, teamMode = false, mainMenuOpen = false, scene = false, fighter = null) {
    const fight = state === 'fight';
    this.root.classList.toggle('scene', !!scene);
    this.scene = !!scene;
    const showBack = state === 'mainmenu' ? mainMenuOpen : !fight && state !== 'title' && state !== 'loading';
    const mode = fight ? 'fight' : 'other';
    if (mode !== this.mode) {
      this.mode = mode;
      this.root.classList.toggle('fighting', fight);
      // trocar de modo solta tudo (nada fica "preso" apertado)
      this.T.held = {};
      this.T.dirHeld = null;
      this.T.moveX = 0;
      this.T.moveY = 0;
      this.T.queue.length = 0;
      for (const b of this.root.querySelectorAll('.tb.on')) b.classList.remove('on');
    }
    const f = fight ? fighter : null;
    if (f !== this.fighter || (f && f.def !== this.boundDef)) this.bindFighter(f);
    if (f && !this.hidden) this.paint();
    this.root.classList.toggle('menu-mode', showBack);
    this.root.classList.toggle('team', !!teamMode);
    const src = this.input.players[0].source;
    if (!this.hidden && (src === 'keyboard' || src === 'gamepad') && this.input.anyPressed) this.setHidden(true);
    // Os cartões e as setas de página da seleção aceitam toque direto.
    this.root.classList.toggle('select', state === 'select');
    // macro em andamento (ESPECIAL / botão de habilidade): um passo por quadro
    if (this.T.queue.length) {
      const step = this.T.queue.shift();
      for (const a of step) this.T.taps.add(a);
      if (step.nudge) this.T.nudge = step.nudge;
      if (step.mute) this.T.mute = step.mute;
    }
  }
}
