import { ROSTER } from '../characters/index.js';
import { SelectStage } from './selectStage.js';
import { ELEMENTS } from '../config/elements.js';
import { SETTINGS, TIMER_OPTIONS, CPU_LEVELS, ROUND_OPTIONS, timerLabel, cpuLabel, cycleSetting } from '../config/settings.js';
import { ARENAS, ARENA_ORDER } from '../arena/index.js';
import { actionLabel, moveLabel } from './labels.js';
import { COMBAT } from '../config/combat.js';
import { moveListHTML } from './moves.js';

// Telas fora da luta. Todas recebem as entradas normalizadas dos dois jogadores.
// Fluxo: Título → Menu principal (P1 VS P2 / P1 VS CPU / Opções) → Personagens →
//        Cenário → Carregamento → Luta. Pausa: Continuar, Comandos, opções, sair.

// Nos menus: A / × (Pulo) confirma e B / ○ (Ataque físico) volta.
const confirm = (p) => p.pressed.jump;
const back = (p) => p.pressed.physical;
const random = (p) => p.pressed.carga; // Y/△: escolha aleatória
const RAND = 'Y/△';
// índice aleatório diferente do atual (quando houver mais de uma opção)
const pickRandom = (n, cur, ok = () => true) => {
  const opts = [...Array(n).keys()].filter((i) => ok(i) && (n < 2 || i !== cur));
  return opts.length ? opts[Math.floor(Math.random() * opts.length)] : cur;
};
const OK = 'A/×';
const BACK = 'B/○';

function el(root, cls, id, html) {
  const e = document.createElement('div');
  e.className = cls;
  if (id) e.id = id;
  e.innerHTML = html;
  root.appendChild(e);
  return e;
}

// Tela inicial: logo + círculo dos elementos + elenco por origem. Começa em "PRESSIONE START"
// e, depois do primeiro toque, mostra o menu ali mesmo (B volta para o "pressione start").
const VS_OPTIONS = (prefix, team) => [
  { id: `${prefix}:pvp`, label: 'P1 VS P2', desc: team ? 'Dois jogadores, cada um com líder + 2 assistências.' : 'Dois jogadores: dois controles ou teclado dividido.' },
  { id: `${prefix}:cpu`, label: 'P1 VS CPU', desc: team ? 'Sua equipe contra a equipe do computador.' : 'Lute contra o computador. Você escolhe os dois lutadores.' },
  { id: `${prefix}:cvc`, label: 'CPU VS CPU', desc: 'Assista: escolha os lutadores, a dificuldade e o cenário.' },
];
const HOME_OPTIONS = [
  { id: 'solo', label: 'BATALHA SOLO', desc: '1 contra 1.', sub: VS_OPTIONS('solo', false) },
  { id: 'team', label: 'BATALHA EM EQUIPE', desc: 'Líder + 2 assistências (D-pad ← / →).', sub: VS_OPTIONS('team', true) },
  { id: 'training', label: 'TREINAMENTO', desc: 'Pratique combos num alvo parado. A vida dele se recupera.' },
  { id: 'options', label: 'OPÇÕES', desc: 'Tutorial, tempo da luta e modo de movimento.' },
];

function sigilSVG() {
  // círculo ritualístico genérico (não é o símbolo oficial): anéis, 5 pontos dos elementos e traços
  const pts = Object.values(ELEMENTS).map((e, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return { x: 200 + Math.cos(a) * 150, y: 200 + Math.sin(a) * 150, c: e.color, n: e.name };
  });
  const star = [0, 2, 4, 1, 3, 0].map((k) => `${pts[k].x},${pts[k].y}`).join(' ');
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2;
    const r1 = i % 5 === 0 ? 176 : 182;
    return `<line x1="${200 + Math.cos(a) * r1}" y1="${200 + Math.sin(a) * r1}" x2="${200 + Math.cos(a) * 188}" y2="${200 + Math.sin(a) * 188}"/>`;
  }).join('');
  return `<svg viewBox="0 0 400 400" aria-hidden="true">
    <g class="ring-a" fill="none" stroke="currentColor">
      <circle cx="200" cy="200" r="192" stroke-width="1.5"/><circle cx="200" cy="200" r="170" stroke-width="1"/>
      <g stroke-width="1.2">${ticks}</g>
    </g>
    <g class="ring-b" fill="none" stroke="currentColor" stroke-width="1.2">
      <polygon points="${star}" opacity=".55"/><circle cx="200" cy="200" r="78" opacity=".7"/><circle cx="200" cy="200" r="66" stroke-dasharray="3 6" opacity=".7"/>
      ${pts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="15" stroke="${p.c}" stroke-width="2.2" fill="rgba(8,5,12,.85)"/><circle cx="${p.x}" cy="${p.y}" r="5" fill="${p.c}" stroke="none"/>`).join('')}
    </g>
  </svg>`;
}

export class HomeScreen {
  constructor(root, { portraits = {}, menu = false } = {}) {
    this.portraits = portraits;
    this.index = 0;
    this.el = el(root, 'screen', 'home', `
      <div class="sigil">${sigilSVG()}</div>
      <div class="fog"></div>
      <div class="logo">
        <div class="kicker">UM JOGO DE LUTA PARANORMAL</div>
        <h1>ARENA<br><span>PARANORMAL</span></h1>
        <div class="tag">ORDO REALITAS <i>×</i> ESCRIPTAS <i>×</i> MASCARADOS <i>×</i> OS CINCO</div>
      </div>
      <div class="press">PRESSIONE <b>START</b>, <b>${OK}</b> OU <kbd>ENTER</kbd></div>
      <div class="menu-home">
        <div class="hlist"></div>
        <div class="hdesc"></div>
      </div>
      <div class="foot"><span><b>${OK}</b> confirmar · <b>${BACK}</b> voltar</span><span>Teclado: P1 WASD · P2 setas</span></div>`);
    this.desc = this.el.querySelector('.hdesc');
    this.listEl = this.el.querySelector('.hlist');
    this.list = HOME_OPTIONS;
    this.parent = null;
    this.buildList();
    this.el.addEventListener('click', () => { if (!this.menu) this.tapped = true; });
    this.setMenu(menu);
    this.fillPortraits();
  }

  fillPortraits() {
    let missing = false;
    this.el.querySelectorAll('.hf').forEach((f) => {
      const img = f.querySelector('img');
      const src = this.portraits[f.dataset.id];
      if (src && img.getAttribute('src') !== src) img.src = src;
      if (!src) missing = true;
    });
    this.portraitsReady = !missing;
  }

  // B: do submenu volta ao menu; do menu volta ao "pressione start"
  goBack() {
    if (this.parent) {
      const idx = HOME_OPTIONS.indexOf(this.parent);
      this.parent = null;
      this.list = HOME_OPTIONS;
      this.index = Math.max(0, idx);
      this.buildList();
      return 'move';
    }
    this.setMenu(false);
    return 'back';
  }

  setMenu(on) {
    this.menu = on;
    this.el.classList.toggle('menu-on', on);
    this.render();
  }

  // monta as opções da lista atual (menu principal ou submenu)
  buildList() {
    this.listEl.innerHTML = (this.parent ? `<div class="hcrumb">${this.parent.label}</div>` : '')
      + this.list.map((o) => `<div class="hopt" data-id="${o.id}"><span class="mk">◆</span>${o.label}${o.sub ? ' ▸' : ''}</div>`).join('');
    this.opts = [...this.listEl.querySelectorAll('.hopt')];
    this.opts.forEach((o, i) => {
      o.addEventListener('mouseenter', () => { if (this.menu) { this.index = i; this.render(); } });
      o.addEventListener('click', () => { this.clicked = i; });
    });
    this.render();
  }

  // escolher uma opção: abre submenu ou devolve o id
  choose(i) {
    const o = this.list[i];
    if (o.sub) {
      this.parent = o;
      this.list = o.sub;
      this.index = 0;
      this.buildList();
      return 'move';
    }
    return o.id;
  }

  render() {
    if (!this.opts) return;
    this.opts.forEach((o, i) => o.classList.toggle('on', i === this.index));
    this.desc.textContent = this.list[this.index] ? this.list[this.index].desc : '';
  }

  // 'start' (saiu do "pressione start"), id da opção, ou null
  update(input) {
    if (!this.portraitsReady) this.fillPortraits();
    if (!this.menu) {
      const go = this.tapped || input.keyPressedOnce('Enter') || input.players.some((x) => x.pressed.start || confirm(x));
      this.tapped = false;
      if (go) { this.setMenu(true); return 'start'; }
      return null;
    }
    if (this.clicked !== undefined) {
      const i = this.clicked;
      this.clicked = undefined;
      return this.choose(i);
    }
    for (const p of input.players) {
      const n = this.list.length;
      if (p.menu.up) { this.index = (this.index + n - 1) % n; this.render(); return 'move'; }
      if (p.menu.down) { this.index = (this.index + 1) % n; this.render(); return 'move'; }
      if (confirm(p) || p.pressed.start) return this.choose(this.index);
      if (back(p)) return this.goBack();
    }
    if (input.keyPressedOnce('Enter')) return this.choose(this.index);
    if (input.keyPressedOnce('Escape')) return this.goBack();
    return null;
  }

  dispose() { this.el.remove(); }
}

export class TitleScreen {
  constructor(root) {
    this.el = el(root, 'screen', 'title', `<h1>ARENA<br>PARANORMAL</h1><p>PRESSIONE ENTER, ESPAÇO OU START</p>`);
  }
  update(input) {
    return input.keyPressedOnce('Enter') || input.players.some((x) => x.pressed.start || confirm(x));
  }
  dispose() { this.el.remove(); }
}

// Menu vertical genérico. options: [{ id, label: string | () => string, disabled? }]
// jogadores que podem mexer num menu (todos, ou só o dono)
const controllers = (input, owner) => (owner === null || owner === undefined ? input.players : [input.players[owner]]);

export class MenuScreen {
  // owner: índice do jogador que controla o menu (ex.: só quem pausou despausa); null = todos
  constructor(root, { title, options, extra = '', clear = true, subtitle = '', owner = null }) {
    this.options = options;
    this.owner = owner;
    this.index = 0;
    this.el = el(root, `screen ${clear ? 'clear' : ''}`, null,
      `<div class="menu"><h2>${title}</h2>${subtitle ? `<p class="sub">${subtitle}</p>` : ''}${options.map(() => '<div class="opt"></div>').join('')}</div>${extra}`);
    this.opts = [...this.el.querySelectorAll('.opt')];
    this.opts.forEach((o, i) => o.addEventListener('click', () => { this.clicked = i; }));
    this.render();
  }
  render() {
    this.opts.forEach((o, i) => {
      const op = this.options[i];
      o.textContent = typeof op.label === 'function' ? op.label() : op.label;
      o.classList.toggle('on', i === this.index);
      o.classList.toggle('disabled', !!op.disabled);
    });
  }
  update(input) {
    if (this.clicked !== undefined) {
      const id = this.options[this.clicked].id;
      this.clicked = undefined;
      return id;
    }
    for (const p of controllers(input, this.owner)) {
      if (p.menu.up) { this.index = (this.index + this.options.length - 1) % this.options.length; this.render(); }
      if (p.menu.down) { this.index = (this.index + 1) % this.options.length; this.render(); }
      if (confirm(p) && !this.options[this.index].disabled) return this.options[this.index].id;
      if (back(p)) return 'back';
      if (p.pressed.start) return 'resume';
    }
    // Enter/Esc ficam no lado do P1 do teclado
    if (this.owner === null || this.owner === 0) {
      if (input.keyPressedOnce('Enter')) return this.options[this.index].id;
      if (input.keyPressedOnce('Escape')) return 'back';
    }
    return null;
  }
  dispose() { this.el.remove(); }
}

// Modos de partida: quem escolhe e como cada lado aparece na seleção
export const MODES = {
  pvp: { title: 'P1 VS P2', slots: ['P1', 'P2'], single: false },
  cpu: { title: 'P1 VS CPU', slots: ['P1', 'CPU'], single: true },
  cvc: { title: 'CPU VS CPU', slots: ['CPU 1', 'CPU 2'], single: true },
  training: { title: 'TREINAMENTO', slots: ['P1', 'ALVO'], single: true },
};

// Seleção de personagem no estilo Storm 4: a grade do P1 fica à esquerda e a do P2 à direita;
// no centro, os lutadores em 3D (SelectStage) entram deslizando ao serem olhados e fazem pose ao confirmar.
const SEL_COLS = 3;
const INPUT_NAMES = { 'carga+jump': 'Energia + Pulo', 'mod+ranged': 'R1 + □', 'mod+physical': 'R1 + ○', 'mod+carga': 'R1 + △', 'mod+jump': 'R1 + ×', 'mod+dodge': 'R1 + L2' };

export class SelectScreen {
  constructor(root, { portraits, audio, prev, mode = 'pvp', team = false }) {
    this.audio = audio;
    this.mode = mode;
    this.team = team;
    this.picks = [[], []]; // equipe: [líder, assist1, assist2]
    this.M = MODES[mode] || MODES.pvp;
    this.cpu = this.M.single; // um jogador escolhe os dois lados
    this.cursor = prev ? [...prev.cursor] : [0, 1];
    this.ready = [false, false];
    const side = (p) => `
      <div class="sel-side s${p + 1}">
        <div class="sel-head"><span class="tag">${this.M.slots[p]}</span><span class="st"></span></div>
        <div class="sel-grid">${ROSTER.map((c, i) => `
          <div class="card" data-i="${i}" style="--c:${c.color}">
            <img src="${portraits[c.id]}" alt="${c.name}">
            <div class="cn"><b style="color:${c.color}">${c.name}</b></div>
          </div>`).join('')}
        </div>
        <div class="det p${p + 1}"></div>
      </div>`;
    this.el = el(root, 'screen', 'select', `
      <div class="sel-title">${team ? 'MONTE SUA EQUIPE' : 'ESCOLHA SEU LUTADOR'} <small>${this.M.title}${team ? ' · LÍDER + 2 ASSISTÊNCIAS' : ''}</small></div>
      ${side(0)}
      <div class="sel-center">
        <div class="sel-vs">VS</div>
        <div class="plates"><div class="plate p1"></div><div class="plate p2"></div></div>
        <div class="startbtn">COMEÇAR <small>${OK} ou Start</small></div>
      </div>
      ${side(1)}
      <div class="hint"></div>`);
    this.stage = new SelectStage(ROSTER);
    this.startEl = this.el.querySelector('.startbtn');
    this.startEl.addEventListener('click', () => { if (this.ready[0] && this.ready[1]) this.startClicked = true; });
    this.sides = [0, 1].map((p) => this.el.querySelector(`.sel-side.s${p + 1}`));
    this.cards = this.sides.map((sd) => [...sd.querySelectorAll('.card')]);
    this.dets = this.sides.map((sd) => sd.querySelector('.det'));
    this.heads = this.sides.map((sd) => sd.querySelector('.sel-head .st'));
    this.plates = [this.el.querySelector('.plate.p1'), this.el.querySelector('.plate.p2')];
    this.hint = this.el.querySelector('.hint');
    this.cards.forEach((list, p) => list.forEach((c, i) => c.addEventListener('click', () => {
      // no modo contra CPU o lado 2 só é escolhido depois do 1
      const active = this.cpu ? (this.ready[0] ? 1 : 0) : p;
      if (active !== p || this.ready[p]) return;
      if (this.cursor[p] === i) { this.lockPick(p); this.audio.play('confirm'); } else { this.cursor[p] = i; this.audio.play('select'); }
      this.render();
    })));
    this.render();
  }

  activeSide() {
    return this.cpu ? (this.ready[0] ? 1 : 0) : -1;
  }

  render() {
    const act = this.activeSide();
    for (let p = 0; p < 2; p++) {
      const c = ROSTER[this.cursor[p]];
      // equipe: na frente fica quem está sendo escolhido (pronto: o líder); atrás, os já escolhidos
      const front = this.team && this.ready[p] ? ROSTER[this.picks[p][0]] : c;
      this.sides[p].classList.toggle('waiting', act >= 0 && act !== p && !this.ready[p]);
      this.sides[p].classList.toggle('done', this.ready[p]);
      this.cards[p].forEach((card, i) => {
        card.classList.toggle('on', this.cursor[p] === i);
        card.classList.toggle('picked', this.team && this.picks[p].includes(i));
      });
      this.heads[p].textContent = this.ready[p] ? 'PRONTO' : act >= 0 && act !== p ? 'AGUARDANDO' : `ESCOLHENDO${this.team ? ` ${this.picks[p].length + 1}/3` : ''}`;
      this.heads[p].classList.toggle('ok', this.ready[p]);
      // placa com o nome no centro
      const teamLine = this.team ? `<div class="teampicks">${['LÍDER', 'ASSIST. 1', 'ASSIST. 2'].map((lab, k) => {
        const c2 = this.picks[p][k] !== undefined ? ROSTER[this.picks[p][k]] : null;
        return `<span class="${c2 ? 'on' : ''}"><small>${lab}</small><b style="color:${c2 ? c2.color : 'inherit'}">${c2 ? c2.name : '—'}</b></span>`;
      }).join('')}</div>` : '';
      this.plates[p].innerHTML = `
        <div class="pn" style="color:${front.color}">${front.name}</div>
        <div class="po">${front.origin} · <span style="color:${ELEMENTS[front.element].color}">${ELEMENTS[front.element].name}</span></div>
        <div class="pt">“${front.info.tagline}”</div>${teamLine}`;
      this.plates[p].classList.toggle('ok', this.ready[p]);
      // ficha resumida embaixo da grade
      const extras = (c.abilities || []).map((a) => `${a.name} <i>${INPUT_NAMES[a.input] || a.input}</i>`).join('<br>') || '—';
      const sp = c.special;
      this.dets[p].innerHTML = `
        <dl>
          <dt>Estilo</dt><dd>${c.info.identity || c.info.style}</dd>
          <dt>Físico ○</dt><dd>${c.melee.name}</dd>
          <dt>Principal □</dt><dd>${c.ranged ? c.ranged.name : '—'}</dd>
          <dt>Habilidades</dt><dd>${extras}</dd>
          <dt>Especial</dt><dd>${sp ? `${sp.name}${sp.type === 'mistField' ? ' · névoa (sem dano direto)' : sp.type === 'erase' ? ' · 1x por partida' : ` · ${sp.damage ?? COMBAT.specialDamage} dano`}` : '—'}</dd>
        </dl>`;
      // modelo 3D no centro
      this.stage.show(p, front.id, this.ready[p]);
      if (this.team) this.stage.setBack(p, (this.ready[p] ? this.picks[p].slice(1) : this.picks[p]).map((i) => ROSTER[i].id));
    }
    this.startEl.classList.toggle('on', this.ready[0] && this.ready[1]);
    this.hint.innerHTML = (this.cpu
      ? `<b>P1</b> escolhe o próprio lutador (esquerda) e depois o da <b>CPU</b> (direita) · ${moveLabel(0)} mover · <kbd>${actionLabel(0, 'jump')}</kbd>/<kbd>Enter</kbd> confirmar · <kbd>${actionLabel(0, 'physical')}</kbd>/<kbd>Esc</kbd> voltar`
      : `<b>P1</b> ${moveLabel(0)} mover · <kbd>${actionLabel(0, 'jump')}</kbd> confirmar · <kbd>${actionLabel(0, 'physical')}</kbd> voltar &nbsp;|&nbsp;
         <b>P2</b> setas · <kbd>${actionLabel(1, 'jump')}</kbd> confirmar · <kbd>${actionLabel(1, 'physical')}</kbd> voltar`)
      + ` · <b>${OK}</b> confirmar · <b>${RAND}</b> aleatório · <b>${BACK}</b> voltar`;
  }

  // Retorna { p1, p2 } quando os dois estão prontos, ou 'back' para voltar ao menu
  update(input) {
    const [p1, p2] = input.players;
    let changed = false;
    // B/○ (ou Esc) com ninguém confirmado: volta para a tela inicial
    if (!this.ready[0] && !this.ready[1] && !this.picks[0].length && !this.picks[1].length && (back(p1) || (!this.cpu && back(p2)) || input.keyPressedOnce('Escape'))) return 'back';
    // os dois confirmados: COMEÇAR leva às configurações da batalha (B desfaz a escolha)
    if (this.ready[0] && this.ready[1]) {
      const humans = this.cpu ? [p1] : [p1, p2];
      const go = this.startClicked || input.keyPressedOnce('Enter') || humans.some((p) => confirm(p) || p.pressed.start);
      this.startClicked = false;
      if (go) {
        this.audio.play('confirm');
        if (this.team) {
          const teams = this.picks.map((l) => l.map((i) => ROSTER[i]));
          return { p1: teams[0][0], p2: teams[1][0], teams, cpu: this.cpu, mode: this.mode };
        }
        return { p1: ROSTER[this.cursor[0]], p2: ROSTER[this.cursor[1]], cpu: this.cpu, mode: this.mode };
      }
      if (this.cpu ? back(p1) : back(p1) || back(p2)) {
        const slot = this.cpu ? 1 : back(p2) ? 1 : 0;
        this.ready[slot] = false;
        if (this.team) this.picks[slot].pop();
        this.audio.play('select');
        this.render();
      }
      return null;
    }
    if (input.keyPressedOnce('Enter')) {
      const slot = this.ready[0] ? 1 : 0;
      if (!this.ready[slot] && (slot === 0 || this.cpu)) { this.lockPick(slot); this.audio.play('confirm'); changed = true; }
    }
    if (this.cpu) {
      changed = this.handle(p1, this.ready[0] ? 1 : 0) || changed;
    } else {
      changed = this.handle(p1, 0) || changed;
      changed = this.handle(p2, 1) || changed;
    }
    if (changed) this.render();
    return null;
  }

  handle(p, slot) {
    if (this.ready[slot]) {
      if (back(p)) { this.ready[slot] = false; if (this.team) this.picks[slot].pop(); return true; }
      return false;
    }
    // equipe: B desfaz a última escolha do lado
    if (this.team && back(p) && this.picks[slot].length) { this.picks[slot].pop(); this.audio.play('select'); return true; }
    if (back(p) && this.cpu && slot === 1) { this.ready[0] = false; if (this.team) this.picks[0].pop(); return true; }
    const n = ROSTER.length;
    let c = this.cursor[slot];
    if (p.menu.left) c = (c + n - 1) % n;
    if (p.menu.right) c = (c + 1) % n;
    if (p.menu.up) c = c - SEL_COLS >= 0 ? c - SEL_COLS : c + SEL_COLS * Math.floor((n - 1 - c) / SEL_COLS);
    if (p.menu.down) c = c + SEL_COLS < n ? c + SEL_COLS : c % SEL_COLS;
    let changed = false;
    if (c !== this.cursor[slot]) { this.cursor[slot] = c; this.audio.play('select'); changed = true; }
    if (confirm(p)) { this.lockPick(slot); this.audio.play('confirm'); changed = true; }
    else if (random(p)) {
      this.cursor[slot] = pickRandom(n, this.cursor[slot], (i) => !this.team || !this.picks[slot].includes(i));
      this.lockPick(slot);
      this.audio.play('confirm');
      this.flashRandom(slot, this.cursor[slot]);
      changed = true;
    }
    return changed;
  }

  // confirma a escolha do lado; na equipe só fica pronto com 3 personagens diferentes
  lockPick(slot) {
    if (!this.team) { this.ready[slot] = true; return; }
    const c = this.cursor[slot];
    if (this.picks[slot].includes(c)) { this.audio.play('denied'); return; }
    this.picks[slot].push(c);
    if (this.picks[slot].length >= 3) this.ready[slot] = true;
  }

  flashRandom(slot, i) {
    const c = this.cards[slot][i];
    if (!c) return;
    c.classList.remove('rand');
    void c.offsetWidth;
    c.classList.add('rand');
  }

  dispose() {
    this.stage.dispose();
    this.el.remove();
  }
}

// Configurações da batalha (depois de COMEÇAR, antes do cenário)
export class BattleConfigScreen {
  constructor(root, { audio, mode }) {
    this.audio = audio;
    this.rows = [
      { id: 'timer', label: 'TEMPO', value: () => timerLabel(), list: TIMER_OPTIONS },
      ...(mode === 'pvp' ? [] : [{ id: 'cpuLevel', label: mode === 'training' ? 'DIFICULDADE (ALVO)' : 'DIFICULDADE DA CPU', value: () => cpuLabel(), list: CPU_LEVELS, disabled: mode === 'training' }]),
      { id: 'rounds', label: 'ROUNDS PARA VENCER', value: () => String(SETTINGS.rounds), list: ROUND_OPTIONS, disabled: mode === 'training' },
      { id: 'go', label: 'ESCOLHER CENÁRIO ▶' },
    ];
    this.index = this.rows.length - 1;
    this.el = el(root, 'screen', 'config', `<div class="menu"><h2>CONFIGURAÇÕES</h2><p class="sub">${mode === 'training' ? 'Treinamento: sem tempo e sem rounds' : 'Ajuste a batalha antes de escolher o cenário'}</p>
      ${this.rows.map(() => '<div class="opt cfg"></div>').join('')}</div>
      <div class="hint">▲▼ escolher · ◀ ▶ mudar · <b>${OK}</b> confirmar · <b>${BACK}</b> voltar</div>`);
    this.opts = [...this.el.querySelectorAll('.opt')];
    this.opts.forEach((o, i) => o.addEventListener('click', () => { this.index = i; this.clicked = true; }));
    this.render();
  }
  render() {
    this.opts.forEach((o, i) => {
      const r = this.rows[i];
      o.innerHTML = r.value ? `<span>${r.label}</span><b>◀ ${r.value()} ▶</b>` : `<span>${r.label}</span>`;
      o.classList.toggle('on', i === this.index);
      o.classList.toggle('disabled', !!r.disabled);
    });
  }
  change(dir) {
    const r = this.rows[this.index];
    if (!r.list || r.disabled) return;
    cycleSetting(r.id, r.list, dir);
    this.audio.play('select');
    this.render();
  }
  update(input) {
    if (this.clicked) {
      this.clicked = false;
      if (this.rows[this.index].id === 'go') return 'go';
      this.change(1);
    }
    for (const p of input.players) {
      if (p.menu.up) { this.index = (this.index + this.rows.length - 1) % this.rows.length; this.audio.play('select'); this.render(); }
      if (p.menu.down) { this.index = (this.index + 1) % this.rows.length; this.audio.play('select'); this.render(); }
      if (p.menu.left) this.change(-1);
      if (p.menu.right) this.change(1);
      if (confirm(p) || p.pressed.start) {
        if (this.rows[this.index].id === 'go' || p.pressed.start) { this.audio.play('confirm'); return 'go'; }
        this.change(1);
      }
      if (back(p)) return 'back';
    }
    if (input.keyPressedOnce('Enter')) { this.audio.play('confirm'); return 'go'; }
    if (input.keyPressedOnce('Escape')) return 'back';
    return null;
  }
  dispose() { this.el.remove(); }
}

// Tela de VITÓRIA: vencedor no centro (render 3D na pose de vitória), nome, fala conforme o
// derrotado e, na batalha em equipe, os parceiros ao lado. Tudo local (sem internet).
export class VictoryScreen {
  constructor(root, { winner, loser, slot, art, team = null, teamArt = {}, line, options }) {
    this.options = options;
    this.index = 0;
    this.el = el(root, 'screen', 'victory', `
      <div class="vbg" style="--c:${winner.color}"></div>
      <div class="vtop"><small>${slot}</small> VENCE</div>
      <div class="vstage">
        ${team ? '<div class="vmates left"></div>' : ''}
        <div class="vhero"><img src="${art}" alt="${winner.name}"></div>
        ${team ? `<div class="vmates right"></div>` : ''}
      </div>
      <div class="vname" style="color:${winner.color}">${winner.name}</div>
      <div class="vline">“${line}”</div>
      <div class="vsub">derrotou ${loser.name}${team ? ' · equipe: ' + team.map((d) => d.name).join(', ') : ''}</div>
      <div class="vopts">${options.map(() => '<div class="opt"></div>').join('')}</div>`);
    if (team) {
      // parceiros um de cada lado do vencedor
      const [a, b] = team.slice(1);
      const box = (d) => `<div class="vmate" style="--c:${d.color}"><img src="${teamArt[d.id] || ''}" alt=""><b>${d.name}</b></div>`;
      this.el.querySelector('.vmates.left').innerHTML = a ? box(a) : '';
      this.el.querySelector('.vmates.right').innerHTML = b ? box(b) : '';
    }
    this.opts = [...this.el.querySelectorAll('.vopts .opt')];
    this.opts.forEach((o, i) => o.addEventListener('click', () => { this.clicked = i; }));
    this.render();
  }
  render() {
    this.opts.forEach((o, i) => {
      o.textContent = this.options[i].label;
      o.classList.toggle('on', i === this.index);
    });
  }
  update(input) {
    if (this.clicked !== undefined) { const id = this.options[this.clicked].id; this.clicked = undefined; return id; }
    for (const p of input.players) {
      const n = this.options.length;
      if (p.menu.left || p.menu.up) { this.index = (this.index + n - 1) % n; this.render(); }
      if (p.menu.right || p.menu.down) { this.index = (this.index + 1) % n; this.render(); }
      if (confirm(p) || p.pressed.start || (p.humanPressed && p.humanPressed.start)) return this.options[this.index].id;
    }
    if (input.keyPressedOnce('Enter')) return this.options[this.index].id;
    return null;
  }
  dispose() { this.el.remove(); }
}

export class StageSelectScreen {
  constructor(root, { audio, prev, thumbs = {} }) {
    this.audio = audio;
    this.list = ARENA_ORDER.map((id) => ({ id, ...ARENAS[id] }));
    const prevIdx = prev ? this.list.findIndex((a) => a.id === prev) : -1;
    this.index = prevIdx >= 0 ? prevIdx : Math.max(0, this.list.findIndex((a) => a.available));
    this.el = el(root, 'screen', 'stage', `
      <h2>ESCOLHA O CENÁRIO</h2>
      <div class="stages">${this.list.map((a, i) => `
        <div class="stagecard ${a.available ? '' : 'locked'}" data-i="${i}" style="--sky:${a.colors[0]};--ground:${a.colors[1]};--accent:${a.colors[2]}">
          ${thumbs[a.id] ? `<img src="${thumbs[a.id]}" alt="">` : '<div class="paint"></div>'}
          <div class="sn">${a.name}</div>
          ${a.available ? '' : '<div class="soon">EM BREVE</div>'}
        </div>`).join('')}
      </div>
      <div class="stageinfo"><div class="sprev"></div><div class="stxt"></div></div>
      <div class="hint">◀ ▶ escolher · <b>${OK}</b>, <kbd>${actionLabel(0, 'jump')}</kbd> ou <kbd>Enter</kbd> confirmar · <b>${RAND}</b> ou <kbd>${actionLabel(0, 'carga')}</kbd> aleatório · <b>${BACK}</b>, <kbd>${actionLabel(0, 'physical')}</kbd> ou <kbd>Esc</kbd> voltar</div>`);
    this.cards = [...this.el.querySelectorAll('.stagecard')];
    this.info = this.el.querySelector('.stageinfo .stxt');
    this.prev = this.el.querySelector('.stageinfo .sprev');
    this.thumbs = thumbs;
    this.cards.forEach((c, i) => c.addEventListener('click', () => { this.index = i; this.render(); }));
    this.render();
  }
  // os previews são gerados depois do carregamento: troca a pintura pela imagem assim que existir
  refreshThumbs() {
    let done = true;
    this.cards.forEach((c, i) => {
      const src = this.thumbs[this.list[i].id];
      if (!src) { done = !this.list[i].available && done; return; }
      if (!c.querySelector('img')) {
        c.querySelector('.paint')?.remove();
        c.insertAdjacentHTML('afterbegin', `<img src="${src}" alt="">`);
      }
    });
    return done;
  }

  render() {
    this.thumbsDone = this.refreshThumbs();
    this.cards.forEach((c, i) => c.classList.toggle('on', i === this.index));
    const a = this.list[this.index];
    this.info.innerHTML = `<b>${a.name}</b><span>${a.description}</span>`;
    const src = this.thumbs[a.id];
    this.prev.style.backgroundImage = src ? `url(${src})` : '';
    this.prev.classList.toggle('empty', !src);
    this.prev.style.setProperty('--sky', a.colors[0]);
    this.prev.style.setProperty('--ground', a.colors[1]);
  }
  update(input) {
    if (!this.thumbsDone) this.render();
    for (const p of input.players) {
      const n = this.list.length;
      if (p.menu.left || p.menu.up) { this.index = (this.index + n - 1) % n; this.audio.play('select'); this.render(); }
      if (p.menu.right || p.menu.down) { this.index = (this.index + 1) % n; this.audio.play('select'); this.render(); }
      if (confirm(p)) return this.choose();
      if (random(p)) {
        this.index = pickRandom(this.list.length, this.index, (i) => this.list[i].available);
        this.render();
        this.cards[this.index].classList.add('rand');
        return this.choose();
      }
      if (back(p)) return 'back';
    }
    if (input.keyPressedOnce('Enter')) return this.choose();
    if (input.keyPressedOnce('Escape')) return 'back';
    return null;
  }
  choose() {
    const a = this.list[this.index];
    if (a.available) { this.audio.play('confirm'); return a.id; }
    this.audio.play('denied');
    return null;
  }
  dispose() { this.el.remove(); }
}

const TIPS = [
  'Segure R2/RT para defender. Defesa + direção = esquiva.',
  'R1/RB + botão ativa as habilidades secundárias de cada personagem.',
  'Segure △/Y para carregar energia. △ → △ → ○ solta o especial.',
  'Direção + ○ muda o golpe: avanço, recuo, passo lateral ou golpe aéreo.',
  'Bater na defesa do inimigo deixa você exposto a contra-ataque.',
  'O Tutorial (comandos na tela) pode ser ligado em Opções ou na Pausa.',
];

export class LoadingScreen {
  constructor(root, { p1, p2, arena, cpu, portraits, mode = cpu ? 'cpu' : 'pvp' }) {
    const slots = (MODES[mode] || MODES.pvp).slots;
    this.el = el(root, 'screen', 'loading', `
      <div class="vs">
        <div class="side l" style="--c:${p1.color}"><img src="${portraits[p1.id]}" alt=""><b>${p1.name}</b><small>${slots[0]}</small></div>
        <div class="vstext">VS</div>
        <div class="side r" style="--c:${p2.color}"><img src="${portraits[p2.id]}" alt=""><b>${p2.name}</b><small>${slots[1]}</small></div>
      </div>
      <div class="arena-name">${arena.name}</div>
      <div class="bar"><div class="fill"></div></div>
      <div class="tip">Dica: ${TIPS[Math.floor(Math.random() * TIPS.length)]}</div>`);
    this.fill = this.el.querySelector('.fill');
  }
  progress(k) {
    this.fill.style.width = `${Math.round(k * 100)}%`;
  }
  dispose() { this.el.remove(); }
}

// PAUSE → COMANDOS: controles gerais + lista de golpes de cada lutador
export class CommandsScreen {
  constructor(root, { defs, owner = null }) {
    this.defs = defs;
    this.owner = owner;
    this.page = 0;
    this.el = el(root, 'screen clear', 'commands', `
      <div class="cmdbox">
        <div class="tabs"></div>
        <div class="content"></div>
        <div class="hint">◀ ▶ trocar · <b>${BACK}</b>, <kbd>${actionLabel(0, 'physical')}</kbd> ou <kbd>Esc</kbd> voltar</div>
      </div>`);
    this.tabs = this.el.querySelector('.tabs');
    this.content = this.el.querySelector('.content');
    this.render();
  }
  pages() {
    return [...this.defs.map((d, i) => ({ title: `P${i + 1}: ${d.name}`, html: moveListHTML(d) })), { title: 'CONTROLES', html: controlsTable() }];
  }
  render() {
    const pages = this.pages();
    this.tabs.innerHTML = pages.map((p, i) => `<span class="${i === this.page ? 'on' : ''}">${p.title}</span>`).join('');
    this.content.innerHTML = pages[this.page].html;
  }
  update(input) {
    const n = this.pages().length;
    for (const p of controllers(input, this.owner)) {
      if (p.menu.left) { this.page = (this.page + n - 1) % n; this.render(); }
      if (p.menu.right) { this.page = (this.page + 1) % n; this.render(); }
      if (back(p) || p.pressed.start) return 'back';
    }
    if ((this.owner === null || this.owner === 0) && input.keyPressedOnce('Escape')) return 'back';
    return null;
  }
  dispose() { this.el.remove(); }
}

export function controlsTable() {
  const row = (label, action) => `<tr><td>${label}</td><td><kbd>${actionLabel(0, action)}</kbd></td><td><kbd>${actionLabel(1, action)}</kbd></td><td>${actionLabel(0, action, 'gamepad')}</td></tr>`;
  return `
    <table class="controls-table">
      <tr><th>Ação</th><th>P1 teclado</th><th>P2 teclado</th><th>Controle</th></tr>
      <tr><td>Mover</td><td><kbd>${moveLabel(0)}</kbd></td><td><kbd>setas</kbd></td><td>Analógico / D-pad</td></tr>
      ${row('Ataque físico (+ direção / no ar = variações)', 'physical')}
      ${row('Ataque/habilidade principal', 'ranged')}
      ${row('Carga de Poder / Energia', 'carga')}
      ${row('Pulo', 'jump')}
      ${row('Defesa (segurar)', 'block')}
      ${row('Esquiva (+ direção, 4 cargas)', 'dodge')}
      <tr><td>Defesa + andar</td><td colspan="3">Anda mais rápido, mas fica aberto a golpes</td></tr>
      ${row('Modificador (segurar + botão)', 'mod')}
      <tr><td>Dash</td><td colspan="3">Pulo + Pulo (toque duplo)</td></tr>
      <tr><td>Dash longo (Mascarado: teleporte)</td><td colspan="3">Carga + Pulo</td></tr>
      <tr><td>Agarrão (não defensável)</td><td colspan="3">Defesa + Ataque físico</td></tr>
      <tr><td>Físico forte / Principal forte</td><td colspan="3">Carga + Ataque físico / Carga + Principal</td></tr>
      <tr><td>Especial</td><td colspan="3">Carga → Carga → Ataque físico</td></tr>
      <tr><td>Câmera</td><td colspan="3">Sempre travada no adversário</td></tr>
    </table>`;
}
