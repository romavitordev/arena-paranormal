import { ROSTER } from '../characters/index.js';
import { SelectStage } from './selectStage.js';
import { ELEMENTS } from '../config/elements.js';
import { SETTINGS, TIMER_OPTIONS, CPU_LEVELS, ROUND_OPTIONS, timerLabel, cpuLabel, cycleSetting } from '../config/settings.js';
import { ARENAS, ARENA_ORDER } from '../arena/index.js';
import { actionLabel, moveLabel } from './labels.js';
import { COMBAT } from '../config/combat.js';
import { moveListHTML } from './moves.js';
import { VERSION, CHANGELOG, formatVersion } from '../config/version.js';

// Telas fora da luta. Todas recebem as entradas normalizadas dos dois jogadores.
// Fluxo: Título → Menu principal (P1 VS P2 / P1 VS CPU / Opções) → Personagens →
//        Cenário → Carregamento → Luta. Pausa: Continuar, Comandos, opções, sair.

// Nos menus: A / × (Pulo) confirma e B / ○ (Ataque físico) volta.
const confirm = (p) => p.pressed.jump;
const back = (p) => p.pressed.physical;
// START para prosseguir: só o do controle. No teclado o START é o Esc (P1) / Backspace (P2), que nos menus VOLTA.
const startGo = (p, input) => p.pressed.start && !input.keyPressedOnce('Escape') && !input.keyPressedOnce('Backspace');
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
  { id: 'team', label: 'BATALHA EM EQUIPE', desc: 'Líder + 2 assistências (L1 / R1).', sub: VS_OPTIONS('team', true) },
  { id: 'lan', label: 'ONLINE / LAN', desc: 'Contra outra pessoa em outro computador: crie uma sala (pública ou privada, com senha se quiser), veja as salas abertas ou entre com um código.' },
  { id: 'tutorial', label: 'TUTORIAL', desc: 'Escolha um personagem e aprenda, passo a passo, todos os golpes dele.' },
  { id: 'training', label: 'TREINAMENTO', desc: 'Pratique combos num alvo parado. A vida dele se recupera.' },
  { id: 'news', label: 'NOVIDADES', desc: `O que mudou na versão v${formatVersion(VERSION)}.` },
  { id: 'options', label: 'OPÇÕES', desc: 'Tempo da luta e modo de movimento.' },
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
  constructor(root, { portraits = {}, menu = false, touchOnly = false } = {}) {
    this.portraits = portraits;
    this.touchOnly = touchOnly;
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
      <div class="ver">v${formatVersion(VERSION)}</div>
      <div class="foot"><span><b>${OK}</b> confirmar · <b>${BACK}</b> voltar</span><span>Teclado: P1 WASD + losango I J K L · P2 setas + numérico 8 4 6 2</span></div>`);
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
    this.visibleList = this.touchOnly ? this.list.filter((o) => !o.id.endsWith(':pvp')) : this.list;
    this.listEl.innerHTML = (this.parent ? `<div class="hcrumb">${this.parent.label}</div>` : '')
      + this.visibleList.map((o) => `<div class="hopt" data-id="${o.id}"><span class="mk">◆</span>${o.label}${o.sub ? ' ▸' : ''}</div>`).join('');
    this.opts = [...this.listEl.querySelectorAll('.hopt')];
    this.opts.forEach((o, i) => {
      o.addEventListener('mouseenter', () => { if (this.menu) { this.index = i; this.render(); } });
      o.addEventListener('click', () => { this.clicked = i; });
    });
    this.render();
  }

  // escolher uma opção: abre submenu ou devolve o id
  choose(i) {
    const o = this.visibleList[i];
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
    this.desc.textContent = this.visibleList[this.index] ? this.visibleList[this.index].desc : '';
  }

  // 'start' (saiu do "pressione start"), id da opção, ou null
  update(input) {
    if (!this.portraitsReady) this.fillPortraits();
    if (!this.menu) {
      const go = this.tapped || input.keyPressedOnce('Enter') || input.players.some((x) => startGo(x, input) || confirm(x));
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
      const n = this.visibleList.length;
      if (p.menu.up) { this.index = (this.index + n - 1) % n; this.render(); return 'move'; }
      if (p.menu.down) { this.index = (this.index + 1) % n; this.render(); return 'move'; }
      if (confirm(p) || startGo(p, input)) return this.choose(this.index);
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
    return input.keyPressedOnce('Enter') || input.players.some((x) => startGo(x, input) || confirm(x));
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
      if (p.pressed.start) return this.options.some((x) => x.id === 'resume') ? 'resume' : 'back';
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
  tutorial: { title: 'TUTORIAL', slots: ['P1', 'ALVO'], single: true },
};

// Seleção de personagem no estilo Storm 4: a grade do P1 fica à esquerda e a do P2 à direita;
// no centro, os lutadores em 3D (SelectStage) entram deslizando ao serem olhados e fazem pose ao confirmar.
const SEL_COLS = 3;
const SEL_PAGE = 15; // 15 lutadores por página (3 × 5), sem barra de rolagem; LB/RB trocam de página
const INPUT_NAMES = { 'carga+jump': 'Energia + Pulo', 'carga+ranged': '△ → □', 'carga+physical': '△ → ○', 'block+carga': 'R2 + △', 'block+jump': 'R2 + ×', 'carga+dodge': '△ + L2' };

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
        <div class="sel-pages"><b class="pg-prev">◀ <kbd>LB</kbd></b><span class="pg-n"></span><b class="pg-next"><kbd>RB</kbd> ▶</b></div>
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
    this.pages = this.sides.map((sd) => sd.querySelector('.sel-pages'));
    this.pageCount = Math.max(1, Math.ceil(ROSTER.length / SEL_PAGE));
    // setas clicáveis (mouse / toque)
    this.pages.forEach((pg, p) => {
      pg.querySelector('.pg-prev').addEventListener('click', () => { this.turnPage(p, -1); this.render(); });
      pg.querySelector('.pg-next').addEventListener('click', () => { this.turnPage(p, 1); this.render(); });
    });
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
      // só os 15 da página do cursor aparecem
      const page = Math.floor(this.cursor[p] / SEL_PAGE);
      this.pages[p].classList.toggle('single', this.pageCount < 2);
      this.pages[p].querySelector('.pg-n').textContent = `PÁGINA ${page + 1} / ${this.pageCount}`;
      this.cards[p].forEach((card, i) => {
        card.classList.toggle('off', Math.floor(i / SEL_PAGE) !== page);
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
          <dt>Especial</dt><dd>${sp ? `${sp.name}${sp.type === 'mistField' ? ' · névoa + Acácia (250 dano)' : sp.type === 'erase' ? ' · 1x por partida' : ` · ${sp.damage ?? COMBAT.specialDamage} dano`}` : '—'}</dd>
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
      + ` · <b>${OK}</b> confirmar · <b>${RAND}</b> aleatório · <b>${BACK}</b> voltar`
      + (this.pageCount > 1 ? ` · <b>LB/RB</b> · <kbd>${actionLabel(0, 'pageL')}</kbd>/<kbd>${actionLabel(0, 'pageR')}</kbd> trocar página` : '');
  }

  // Retorna { p1, p2 } quando os dois estão prontos, ou 'back' para voltar ao menu
  update(input) {
    const [p1, p2] = input.players;
    let changed = false;
    // Esc (teclado do P1) vale como o "voltar" do P1
    this.escBack = input.keyPressedOnce('Escape');
    this.p1 = p1;
    // B/○ (ou Esc) com ninguém confirmado: volta para a tela inicial
    if (!this.ready[0] && !this.ready[1] && !this.picks[0].length && !this.picks[1].length && (this.bk(p1) || (!this.cpu && this.bk(p2)))) return 'back';
    // os dois confirmados: COMEÇAR leva às configurações da batalha (B desfaz a escolha)
    if (this.ready[0] && this.ready[1]) {
      const humans = this.cpu ? [p1] : [p1, p2];
      const go = this.startClicked || input.keyPressedOnce('Enter') || humans.some((p) => confirm(p) || startGo(p, input));
      this.startClicked = false;
      if (go) {
        this.audio.play('confirm');
        if (this.team) {
          const teams = this.picks.map((l) => l.map((i) => ROSTER[i]));
          return { p1: teams[0][0], p2: teams[1][0], teams, cpu: this.cpu, mode: this.mode };
        }
        return { p1: ROSTER[this.cursor[0]], p2: ROSTER[this.cursor[1]], cpu: this.cpu, mode: this.mode };
      }
      if (this.cpu ? this.bk(p1) : this.bk(p1) || this.bk(p2)) {
        const slot = this.cpu ? 1 : this.bk(p2) ? 1 : 0;
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

  bk(p) {
    return back(p) || (this.escBack && p === this.p1);
  }

  handle(p, slot) {
    if (this.ready[slot]) {
      if (this.bk(p)) { this.ready[slot] = false; if (this.team) this.picks[slot].pop(); return true; }
      return false;
    }
    // equipe: B desfaz a última escolha do lado
    if (this.team && this.bk(p) && this.picks[slot].length) { this.picks[slot].pop(); this.audio.play('select'); return true; }
    if (this.bk(p) && this.cpu && slot === 1) { this.ready[0] = false; if (this.team) this.picks[0].pop(); return true; }
    const n = ROSTER.length;
    let changed = false;
    // LB / RB (Q / E · PgUp / PgDn): troca de página mantendo a posição na grade
    if (p.pressed.pageL || p.pressed.pageR) { this.turnPage(slot, p.pressed.pageR ? 1 : -1); changed = true; }
    // setas andam dentro da página (de uma ponta passa para a próxima página)
    const page = Math.floor(this.cursor[slot] / SEL_PAGE);
    const start = page * SEL_PAGE;
    const count = Math.min(SEL_PAGE, n - start);
    let c = this.cursor[slot] - start;
    if (p.menu.left) c = (c + count - 1) % count;
    if (p.menu.right) c = (c + 1) % count;
    if (p.menu.up) c = c - SEL_COLS >= 0 ? c - SEL_COLS : c + SEL_COLS * Math.floor((count - 1 - c) / SEL_COLS);
    if (p.menu.down) c = c + SEL_COLS < count ? c + SEL_COLS : c % SEL_COLS;
    c += start;
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

  // página anterior/seguinte (circular), mantendo a mesma posição na grade quando existe
  turnPage(slot, dir) {
    if (this.pageCount < 2 || this.ready[slot]) return;
    const n = ROSTER.length;
    const page = Math.floor(this.cursor[slot] / SEL_PAGE);
    const pos = this.cursor[slot] % SEL_PAGE;
    const np = (page + dir + this.pageCount) % this.pageCount;
    this.cursor[slot] = Math.min(np * SEL_PAGE + pos, n - 1);
    this.audio.play('select');
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
      if (confirm(p) || startGo(p, input)) {
        if (this.rows[this.index].id === 'go' || startGo(p, input)) { this.audio.play('confirm'); return 'go'; }
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
      if (confirm(p) || startGo(p, input) || (p.cpu && p.humanPressed && p.humanPressed.start && !input.keyPressedOnce('Escape'))) return this.options[this.index].id;
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
      <button class="stage-confirm" type="button">CONFIRMAR CENÁRIO</button>
      <div class="hint">◀ ▶ escolher · <b>${OK}</b>, <kbd>${actionLabel(0, 'jump')}</kbd> ou <kbd>Enter</kbd> confirmar · <b>${RAND}</b> ou <kbd>${actionLabel(0, 'carga')}</kbd> aleatório · <b>${BACK}</b>, <kbd>${actionLabel(0, 'physical')}</kbd> ou <kbd>Esc</kbd> voltar</div>`);
    this.cards = [...this.el.querySelectorAll('.stagecard')];
    this.info = this.el.querySelector('.stageinfo .stxt');
    this.prev = this.el.querySelector('.stageinfo .sprev');
    this.confirmEl = this.el.querySelector('.stage-confirm');
    this.thumbs = thumbs;
    this.cards.forEach((c, i) => c.addEventListener('click', () => { this.index = i; this.render(); }));
    this.confirmEl.addEventListener('click', () => { this.confirmClicked = true; });
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
    if (this.confirmClicked) {
      this.confirmClicked = false;
      return this.choose();
    }
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
  'Habilidades: △ → ○, △ → □ (um toque depois do outro), △ + L2, R2 + △ e R2 + ×. L1 e R1 chamam as assistências na batalha em equipe.',
  'Segure △/Y para carregar energia. △ → △ → ○ solta o especial.',
  'Direção + ○ muda o golpe: avanço, recuo, passo lateral ou golpe aéreo.',
  'Bater na defesa do inimigo deixa você exposto a contra-ataque.',
  'No menu inicial, o modo TUTORIAL ensina passo a passo os golpes do personagem que você escolher.',
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
// ONLINE / LAN: nome de usuário, criar sala (senha opcional, pública ou privada), lista de SALAS ABERTAS e entrar
// com código. A conexão fica em net/NetSession.js. update() devolve null, 'move', 'back', 'cancel', 'refresh',
// { act: 'host', password, isPublic } ou { act: 'join', code, password }.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NAME_KEY = 'arena_nome_usuario';
export function loadUserName() {
  let n = '';
  try { n = localStorage.getItem(NAME_KEY) || ''; } catch { /* sem armazenamento */ }
  return n || `Jogador${Math.floor(100 + Math.random() * 900)}`;
}

export class LanScreen {
  constructor(root) {
    this.view = 'menu';
    this.index = 0;
    this.name = loadUserName();
    this.isPublic = true;
    this.password = '';
    this.code = '';
    this.rooms = [];
    this.el = el(root, 'screen clear', 'lan', '');
    this.render();
  }

  saveName() {
    this.name = String(this.name || '').replace(/[<>]/g, '').slice(0, 16);
    try { localStorage.setItem(NAME_KEY, this.name); } catch { /* sem armazenamento */ }
  }

  options() {
    switch (this.view) {
      case 'menu': return [['create', 'CRIAR SALA'], ['rooms', 'SALAS ABERTAS'], ['join', 'ENTRAR COM CÓDIGO'], ['back', 'VOLTAR']];
      case 'create': return [['vis', `VISIBILIDADE: ${this.isPublic ? 'PÚBLICA (aparece na lista)' : 'PRIVADA (só com o código)'}`], ['host', 'CRIAR'], ['menu', 'VOLTAR']];
      case 'rooms': return [
        ...this.rooms.map((r, i) => [`room:${i}`, `${r.locked ? '🔒 ' : ''}Sala de ${esc(r.name)} · ${r.code}`]),
        ['refresh', 'ATUALIZAR'], ['menu', 'VOLTAR'],
      ];
      case 'join': case 'password': return [['go', 'ENTRAR'], [this.view === 'password' ? 'rooms' : 'menu', 'VOLTAR']];
      default: return [['cancel', 'CANCELAR']];
    }
  }

  render() {
    const V = this.view;
    const opts = this.options();
    this.opts = opts;
    if (this.index >= opts.length) this.index = Math.max(0, opts.length - 1);
    const field = (cls, ph, max = 16, type = 'text') => `<input class="lan-field ${cls}" type="${type}" maxlength="${max}" autocomplete="off" spellcheck="false" placeholder="${ph}">`;
    let body = '';
    if (V === 'menu') body = `<label class="lan-label">SEU NOME</label>${field('f-name', 'Seu nome de usuário')}<p class="sub">Partida pela internet, na mesma rede ou pelo Radmin. Quem cria a sala é o P1; os dois precisam da mesma versão do jogo.</p>`;
    else if (V === 'create') body = `<label class="lan-label">SENHA (opcional)</label>${field('f-pass', 'sem senha', 20, 'password')}`;
    else if (V === 'host') body = `<p class="sub">${this.code ? 'Código da sala:' : 'Criando a sala…'}</p><div class="lan-code">${this.code || '· · · · ·'}</div><p class="sub">${this.isPublic ? 'Sala PÚBLICA (aparece em SALAS ABERTAS)' : 'Sala PRIVADA (passe o código)'}${this.password ? ' · com senha' : ''}</p>`;
    else if (V === 'rooms') body = `<p class="sub">${this.rooms.length ? 'Salas públicas abertas agora:' : 'Procurando salas… (nenhuma aberta no momento)'}</p>`;
    else if (V === 'join') body = `<label class="lan-label">CÓDIGO DA SALA</label>${field('f-code lan-input', 'ABCDE', 5)}<label class="lan-label">SENHA (se tiver)</label>${field('f-pass', 'sem senha', 20, 'password')}`;
    else if (V === 'password') body = `<p class="sub">Sala de ${esc(this.target && this.target.name)} · ${this.target && this.target.code}</p><label class="lan-label">SENHA</label>${field('f-pass', 'senha da sala', 20, 'password')}`;
    this.el.innerHTML = `<div class="menu lan"><h2>ONLINE / LAN</h2>${body}<p class="lan-status ${this.statusErr ? 'err' : ''}">${esc(this.status || '')}</p>${opts.map(([, l], i) => `<div class="opt ${i === this.index ? 'on' : ''}" data-i="${i}">${l}</div>`).join('')}</div>`;
    this.el.querySelectorAll('.opt').forEach((o) => o.addEventListener('click', () => { this.clicked = Number(o.dataset.i); }));
    const bindField = (sel, get, set, upper) => {
      const inp = this.el.querySelector(sel);
      if (!inp) return null;
      inp.value = get();
      inp.addEventListener('input', () => {
        if (upper) inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        set(inp.value);
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.submit = true;
        if (e.key === 'Escape') this.escape = true;
      });
      return inp;
    };
    const nameIn = bindField('.f-name', () => this.name, (v) => { this.name = v; this.saveName(); });
    const codeIn = bindField('.f-code', () => this.code, (v) => { this.code = v; }, true);
    const passIn = bindField('.f-pass', () => this.password, (v) => { this.password = v; });
    const focus = V === 'join' ? codeIn : V === 'create' || V === 'password' ? passIn : null;
    if (focus) setTimeout(() => focus.focus(), 0);
    void nameIn;
  }

  setStatus(text, err = false) {
    this.status = text;
    this.statusErr = err;
    const s = this.el.querySelector('.lan-status');
    if (s) { s.textContent = text; s.classList.toggle('err', err); }
  }

  setRooms(list) {
    this.rooms = list || [];
    if (this.view === 'rooms' && !this.el.querySelector('input:focus')) this.render();
  }

  showCode(code) {
    this.code = code;
    this.status = this.isPublic ? 'Aguardando alguém entrar… (a sala está na lista de salas abertas)' : 'Aguardando o amigo entrar com o código…';
    this.statusErr = false;
    this.render();
  }

  // volta para o menu mostrando um erro
  fail(msg) {
    this.view = this.view === 'wait' && this.from === 'rooms' ? 'rooms' : 'menu';
    this.status = msg;
    this.statusErr = true;
    this.render();
  }

  go(view, ret) {
    this.view = view;
    this.status = '';
    this.statusErr = false;
    this.index = 0;
    this.render();
    return ret;
  }

  act(id) {
    if (!id) return null;
    if (id === 'back') { this.saveName(); return 'back'; }
    if (id === 'create') { this.password = ''; return this.go('create', 'move'); }
    if (id === 'rooms') return this.go('rooms', 'refresh');
    if (id === 'join') { this.code = ''; this.password = ''; return this.go('join', 'move'); }
    if (id === 'menu') return this.go('menu', 'move');
    if (id === 'refresh') { this.setStatus('Atualizando…'); return 'refresh'; }
    if (id === 'vis') { this.isPublic = !this.isPublic; this.render(); return 'move'; }
    if (id === 'cancel') return this.go(this.from === 'rooms' ? 'rooms' : 'menu', 'cancel');
    if (id === 'host') {
      this.saveName();
      this.code = '';
      this.from = 'menu';
      this.go('host', null);
      return { act: 'host', password: this.password, isPublic: this.isPublic };
    }
    if (id.startsWith('room:')) {
      const r = this.rooms[Number(id.slice(5))];
      if (!r) return null;
      this.target = r;
      this.code = r.code;
      this.password = '';
      if (r.locked) return this.go('password', 'move');
      this.from = 'rooms';
      this.go('wait', null);
      this.setStatus(`Entrando na sala de ${r.name}…`);
      return { act: 'join', code: r.code, password: '' };
    }
    if (id === 'go') {
      if (!/^[A-Z0-9]{5}$/.test(this.code || '')) { this.setStatus('O código tem 5 letras/números.', true); return null; }
      this.saveName();
      this.from = this.view === 'password' ? 'rooms' : 'menu';
      this.go('wait', null);
      this.setStatus('Conectando…');
      return { act: 'join', code: this.code, password: this.password };
    }
    return null;
  }

  backId() {
    return { menu: 'back', create: 'menu', rooms: 'menu', join: 'menu', password: 'rooms' }[this.view] || 'cancel';
  }

  update(input) {
    if (this.clicked !== undefined) {
      const i = this.clicked;
      this.clicked = undefined;
      return this.act(this.opts[i] && this.opts[i][0]);
    }
    if (this.submit) {
      this.submit = false;
      const def = { menu: null, create: 'host', join: 'go', password: 'go' }[this.view];
      if (def) return this.act(def);
    }
    if (this.escape) { this.escape = false; return this.act(this.backId()); }
    for (const p of controllers(input, null)) {
      const n = this.opts.length;
      if (p.menu.up) { this.index = (this.index + n - 1) % n; this.render(); return 'move'; }
      if (p.menu.down) { this.index = (this.index + 1) % n; this.render(); return 'move'; }
      if ((p.menu.left || p.menu.right) && this.opts[this.index][0] === 'vis') return this.act('vis');
      if (confirm(p)) return this.act(this.opts[this.index][0]);
      if (back(p)) return this.act(this.backId());
    }
    if (input.keyPressedOnce('Enter')) return this.act(this.opts[this.index][0]);
    if (input.keyPressedOnce('Escape')) return this.act(this.backId());
    return null;
  }

  dispose() { this.el.remove(); }
}

// NOVIDADES: o changelog, uma versão por vez (◀ ▶ navegam; começa na mais nova)
export class ChangelogScreen {
  constructor(root) {
    this.page = 0;
    this.el = el(root, 'screen clear', 'changelog', `
      <div class="cmdbox news">
        <div class="news-head"><h3>NOVIDADES</h3><span class="news-ver"></span></div>
        <div class="news-nav"><button type="button" aria-label="Versão anterior">◀</button><button type="button" aria-label="Próxima versão">▶</button></div>
        <div class="content"></div>
        <div class="hint">◀ ▶ outras versões · <b>${OK}</b> ou <b>${BACK}</b> fechar</div>
      </div>`);
    this.content = this.el.querySelector('.content');
    this.verEl = this.el.querySelector('.news-ver');
    const [previous, next] = this.el.querySelectorAll('.news-nav button');
    previous.addEventListener('click', (event) => { event.stopPropagation(); this.changePage(-1); });
    next.addEventListener('click', (event) => { event.stopPropagation(); this.changePage(1); });
    this.el.addEventListener('click', () => { this.clicked = true; });
    this.render();
  }
  changePage(direction) {
    this.page = (this.page + direction + CHANGELOG.length) % CHANGELOG.length;
    this.render();
  }
  render() {
    const c = CHANGELOG[this.page];
    const version = formatVersion(c.v);
    this.verEl.textContent = `v${version}${c.v === VERSION ? ' · ATUAL' : ''} — ${this.page + 1} / ${CHANGELOG.length}`;
    this.content.innerHTML = `<div class="news-title">v${version} — ${c.title}</div><div class="news-date">${c.date.split('-').reverse().join('/')}</div><ul>${c.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  }
  update(input) {
    if (this.clicked) { this.clicked = false; return 'back'; }
    for (const p of controllers(input, null)) {
      if (p.menu.left) this.changePage(-1);
      if (p.menu.right) this.changePage(1);
      if (back(p) || confirm(p) || p.pressed.start) return 'back';
    }
    if (input.keyPressedOnce('Escape') || input.keyPressedOnce('Enter')) return 'back';
    return null;
  }
  dispose() {
    this.el.remove();
  }
}

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
      ${row('Assistência 1 / 2 (equipe)', 'assist1')}
      <tr><td>Dash</td><td colspan="3">Pulo + Pulo (toque duplo)</td></tr>
      <tr><td>Dash longo (Mascarado: teleporte)</td><td colspan="3">Carga + Pulo</td></tr>
      <tr><td>Agarrão (não defensável)</td><td colspan="3">Defesa + Ataque físico</td></tr>
      <tr><td>Habilidades</td><td colspan="3">Carga + Físico · Carga + Principal · Carga + Esquiva · Defesa + Carga · Defesa + Pulo</td></tr>
      <tr><td>Especial</td><td colspan="3">Carga → Carga → Ataque físico</td></tr>
      <tr><td>Câmera</td><td colspan="3">Sempre travada no adversário</td></tr>
    </table>`;
}
