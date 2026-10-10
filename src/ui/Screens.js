import { TEAM_COLORS, TEAM_SHORT } from '../config/teams.js';
import { ROSTER } from '../characters/index.js';
import { SelectStage } from './selectStage.js';
import { ELEMENTS } from '../config/elements.js';
import { SETTINGS, TIMER_OPTIONS, CPU_LEVELS, ROUND_OPTIONS, timerLabel, cpuLabel, cycleSetting } from '../config/settings.js';
import { ARENAS, ARENA_ORDER } from '../arena/index.js';
import { actionLabel, moveLabel } from './labels.js';
import { moveListHTML, specialSummary } from './moves.js';
import { VERSION, VERSION_LABEL, CHANGELOG, formatVersion } from '../config/version.js';
import { t, getLanguage } from '../i18n/index.js';
import { roundKey } from '../game/tournament.js';

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

// PARTIDA ONLINE: um toque/clique não mexe na tela na hora (cada aparelho ficaria num estado diferente). Ele vira um
// código que viaja junto com os comandos sincronizados (main.js packLocal → flags) e os dois aparelhos aplicam no mesmo
// quadro, com o lado de quem tocou (screen.netTap(code, slot)). NET_UI.send existe só durante a partida online.
export const NET_UI = { send: null, slot: 0 };

// liga o clique de um elemento: fora do online roda fn(null) na hora; no online manda o código (fn(slot) ao chegar)
function onTap(screen, elm, code, fn) {
  if (!screen.tapFns) screen.tapFns = {};
  screen.tapFns[code] = fn;
  elm.addEventListener('click', () => { if (NET_UI.send) NET_UI.send(code); else fn(null); });
}

// screen.netTap: aplica o toque que chegou pela rede (slot = de quem tocou)
function netTapDefault(code, slot) {
  const fn = this.tapFns && this.tapFns[code];
  if (fn) fn(slot);
}

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
  { id: `${prefix}:pvp`, label: t('vs.pvp'), desc: t(team ? 'vs.pvp.desc_team' : 'vs.pvp.desc') },
  { id: `${prefix}:cpu`, label: t('vs.cpu'), desc: t(team ? 'vs.cpu.desc_team' : 'vs.cpu.desc') },
  { id: `${prefix}:cvc`, label: t('vs.cvc'), desc: t('vs.cvc.desc') },
];
// textos no idioma atual: montado a cada HomeScreen (trocar o idioma nas OPÇÕES e voltar já mostra traduzido)
const homeOptions = () => [
  { id: 'solo', label: t('menu.solo'), desc: t('menu.solo.desc'), sub: VS_OPTIONS('solo', false) },
  { id: 'team', label: t('menu.team'), desc: t('menu.team.desc'), sub: VS_OPTIONS('team', true) },
  { id: 'tower', label: t('menu.tower'), desc: t('menu.tower.desc') },
  { id: 'tournament', label: t('menu.tournament'), desc: t('menu.tournament.desc') },
  { id: 'lan', label: t('menu.lan'), desc: t('menu.lan.desc') },
  { id: 'tutorial', label: t('menu.tutorial'), desc: t('menu.tutorial.desc') },
  { id: 'training', label: t('menu.training'), desc: t('menu.training.desc') },
  { id: 'news', label: t('menu.news'), desc: t('menu.news.desc', { v: VERSION_LABEL }) },
  { id: 'options', label: t('menu.options'), desc: t('menu.options.desc') },
];

export class HomeScreen {
  constructor(root, { portraits = {}, menu = false, touchOnly = false } = {}) {
    this.portraits = portraits;
    this.touchOnly = touchOnly;
    this.index = 0;
    this.el = el(root, 'screen', 'home', `
      <div class="vignette"></div>
      <div class="grain"></div>
      <div class="fog"></div>
      <div class="logo">
        <div class="kicker">${t('menu.subtitle')}</div>
        <div class="t-arena">ARENA</div>
        <h1 data-text="PARANORMAL">PARANORMAL</h1>
        <div class="elements"><i class="ln"></i>${Object.values(ELEMENTS).map((e) => `<b style="--c:${e.color}" title="${e.name}"></b>`).join('')}<i class="ln"></i></div>
        <div class="tag">ORDO REALITAS <i>·</i> ESCRIPTAS <i>·</i> MASCARADOS <i>·</i> OS CINCO</div>
      </div>
      <div class="press">${touchOnly ? t('menu.press_touch') : t('menu.press_start', { ok: OK })}</div>
      <div class="menu-home">
        <div class="hlist"></div>
        <div class="hdesc"></div>
      </div>
      <div class="ver">${VERSION_LABEL}</div>
      <div class="foot">${touchOnly ? `<span>${t('menu.foot_touch')}</span>` : `<span>${t('menu.foot_confirm', { ok: OK, back: BACK })}</span><span>${t('menu.foot_keys')}</span>`}</div>`);
    this.desc = this.el.querySelector('.hdesc');
    this.listEl = this.el.querySelector('.hlist');
    this.home = homeOptions();
    this.list = this.home;
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
      const idx = this.home.indexOf(this.parent);
      this.parent = null;
      this.list = this.home;
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
      // destaque ao passar o MOUSE (só mouse: no celular, mudar a tela no "hover" fazia o navegador engolir o 1º toque —
      // era preciso tocar duas vezes para escolher uma opção do submenu)
      o.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && this.menu) { this.index = i; this.render(); } });
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
    this.el = el(root, 'screen', 'title', `<h1>ARENA<br>PARANORMAL</h1><p>${t('title.press')}</p>`);
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
  constructor(root, { title, options, extra = '', clear = true, subtitle = '', owner = null, audio = null }) {
    this.options = options;
    this.owner = owner;
    this.audio = audio;
    this.index = 0;
    this.el = el(root, `screen ${clear ? 'clear' : ''}`, null,
      `<div class="menu"><h2>${title}</h2>${subtitle ? `<p class="sub">${subtitle}</p>` : ''}${options.map(() => '<div class="opt"></div>').join('')}</div>${extra}`);
    this.opts = [...this.el.querySelectorAll('.opt')];
    // no online, só quem controla o menu (ex.: quem pausou) escolhe pelo toque
    this.opts.forEach((o, i) => onTap(this, o, 1 + i, (slot) => { if (slot === null || this.owner === null || slot === this.owner) this.clicked = i; }));
    this.el.classList.add('net-taps');
    this.netTap = netTapDefault;
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
      this.audio?.play('confirm');
      return id;
    }
    for (const p of controllers(input, this.owner)) {
      if (p.menu.up) { this.index = (this.index + this.options.length - 1) % this.options.length; this.audio?.play('select'); this.render(); }
      if (p.menu.down) { this.index = (this.index + 1) % this.options.length; this.audio?.play('select'); this.render(); }
      if (confirm(p) && !this.options[this.index].disabled) { this.audio?.play('confirm'); return this.options[this.index].id; }
      if (back(p)) { this.audio?.play('select'); return 'back'; }
      if (p.pressed.start) {
        const id = this.options.some((x) => x.id === 'resume') ? 'resume' : 'back';
        this.audio?.play(id === 'resume' ? 'confirm' : 'select');
        return id;
      }
    }
    // Enter/Esc ficam no lado do P1 do teclado
    if (this.owner === null || this.owner === 0) {
      if (input.keyPressedOnce('Enter')) { this.audio?.play('confirm'); return this.options[this.index].id; }
      if (input.keyPressedOnce('Escape')) { this.audio?.play('select'); return 'back'; }
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
  get training() { return { title: t('menu.training'), slots: ['P1', t('mode.target')], single: true }; },
  get tutorial() { return { title: t('menu.tutorial'), slots: ['P1', t('mode.target')], single: true }; },
  get tower() { return { title: t('menu.tower'), slots: ['P1', 'CPU'], single: true, soloPick: true }; },
  get tournament() { return { title: t('menu.tournament'), slots: ['P1', 'CPU'], single: true, soloPick: true }; },
};

// Seleção de personagem no estilo Storm 4: a grade do P1 fica à esquerda e a do P2 à direita;
// no centro, os lutadores em 3D (SelectStage) entram deslizando ao serem olhados e fazem pose ao confirmar.
const SEL_COLS = 3;
const SEL_PAGE = 15; // até 15 lutadores por página (3 × 5), sem barra de rolagem; LB/RB trocam de página
// páginas por EQUIPE: o elenco vem agrupado pela origem (ROSTER); uma equipe que não cabe inteira no resto da página
// começa a página seguinte (ex.: os Mascarados ficam juntos na página 2). Cada página = [início, fim) em ROSTER.
const SEL_PAGES = (() => {
  const pages = [[0, 0]];
  let i = 0;
  while (i < ROSTER.length) {
    let j = i;
    while (j < ROSTER.length && ROSTER[j].origin === ROSTER[i].origin) j++;
    const cur = pages[pages.length - 1];
    if (cur[1] > cur[0] && cur[1] - cur[0] + (j - i) > SEL_PAGE) pages.push([i, i]);
    // equipe maior que uma página inteira: quebra de 15 em 15
    for (let k = i; k < j; k++) {
      const pg = pages[pages.length - 1];
      if (pg[1] - pg[0] >= SEL_PAGE) pages.push([k, k]);
      pages[pages.length - 1][1] = k + 1;
    }
    i = j;
  }
  return pages;
})();
const pageOf = (i) => Math.max(0, SEL_PAGES.findIndex(([a, b]) => i >= a && i < b));
const INPUT_NAMES = { 'carga+ranged': '△ → □', 'carga+physical': '△ → ○', 'block+carga': 'R2 + △', 'block+jump': 'R2 + ×', 'carga+dodge': '△ + L2', 'ranged+forward': '→ + □', 'ranged+back': '← + □' };
const inputName = (k) => (k === 'carga+jump' ? t('input.carga_jump') : k === 'ranged+side' ? `${t('input.side')} + □` : INPUT_NAMES[k] || k);


export class SelectScreen {
  // heading: título no lugar do padrão (TORNEIO: "VEZ DE: JOGADOR 3")
  constructor(root, { portraits, audio, prev, mode = 'pvp', team = false, heading = null }) {
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
            <span class="tm" style="--tc:${TEAM_COLORS[c.origin] || '#aaa'}">${TEAM_SHORT[c.origin] || c.origin}</span>
            <div class="cn"><b style="color:${c.color}">${c.name}</b></div>
          </div>`).join('')}
        </div>
        <div class="det p${p + 1}"></div>
      </div>`;
    this.el = el(root, 'screen', 'select', `
      <div class="sel-title">${heading || t(team ? 'sel.title_team' : 'sel.title')} <small>${this.M.title}${team ? ` · ${t('sel.team_sub')}` : ''}</small></div>
      ${side(0)}
      <div class="sel-center">
        <div class="sel-vs">VS</div>
        <div class="plates"><div class="plate p1"></div><div class="plate p2"></div></div>
        <div class="startbtn">${t('ui.start')} <small>${t('sel.start_hint', { ok: OK })}</small></div>
      </div>
      ${side(1)}
      <div class="hint"></div>`);
    this.stage = new SelectStage(ROSTER);
    if (this.M.soloPick) this.el.classList.add('solo-pick');
    this.startEl = this.el.querySelector('.startbtn');
    onTap(this, this.startEl, 250, () => { if (this.ready[0] && this.ready[1]) this.startClicked = true; });
    this.el.classList.add('net-taps');
    this.sides = [0, 1].map((p) => this.el.querySelector(`.sel-side.s${p + 1}`));
    this.cards = this.sides.map((sd) => [...sd.querySelectorAll('.card')]);
    this.dets = this.sides.map((sd) => sd.querySelector('.det'));
    this.heads = this.sides.map((sd) => sd.querySelector('.sel-head .st'));
    this.plates = [this.el.querySelector('.plate.p1'), this.el.querySelector('.plate.p2')];
    this.pages = this.sides.map((sd) => sd.querySelector('.sel-pages'));
    this.pageCount = SEL_PAGES.length;
    // setas clicáveis (mouse / toque)
    this.pages.forEach((pg, p) => {
      pg.querySelector('.pg-prev').addEventListener('click', () => this.tapSide(p, 251));
      pg.querySelector('.pg-next').addEventListener('click', () => this.tapSide(p, 252));
    });
    this.hint = this.el.querySelector('.hint');
    // toque no lutador: o 1º toque olha, o 2º no mesmo confirma
    this.cards.forEach((list, p) => list.forEach((c, i) => c.addEventListener('click', () => this.tapSide(p, 1 + i))));
    this.render();
  }

  // toque numa das grades. Online: cada um só mexe na própria grade e os dois escolhem AO MESMO TEMPO (o toque viaja
  // pela rede e é aplicado no lado de quem tocou); fora do online aplica na hora
  tapSide(p, code) {
    if (NET_UI.send) {
      if (p === NET_UI.slot) NET_UI.send(code);
      return;
    }
    this.netTap(code, p);
  }

  netTap(code, p) {
    if (code === 250) { if (this.tapFns && this.tapFns[250]) this.tapFns[250](p); return; }
    if (code === 251 || code === 252) { this.turnPage(p, code === 251 ? -1 : 1); this.render(); return; }
    const i = code - 1;
    if (i < 0 || i >= ROSTER.length) return;
    // no modo contra CPU o lado 2 só é escolhido depois do 1
    const active = this.cpu ? (this.ready[0] ? 1 : 0) : p;
    if (active !== p || this.ready[p]) return;
    if (this.cursor[p] === i) { this.lockPick(p); this.audio.play('confirm'); } else { this.cursor[p] = i; this.audio.play('select'); }
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
      const page = pageOf(this.cursor[p]);
      this.pages[p].classList.toggle('single', this.pageCount < 2);
      this.pages[p].querySelector('.pg-n').textContent = t('sel.page', { n: page + 1, t: this.pageCount });
      this.cards[p].forEach((card, i) => {
        card.classList.toggle('off', pageOf(i) !== page);
        card.classList.toggle('on', this.cursor[p] === i);
        card.classList.toggle('picked', this.team && this.picks[p].includes(i));
      });
      const you = NET_UI.send && p === NET_UI.slot ? `${t('sel.you')} · ` : ''; // online: qual lado é o seu
      this.heads[p].textContent = you + (this.ready[p] ? t('sel.ready') : act >= 0 && act !== p ? t('sel.waiting') : `${t('sel.choosing')}${this.team ? ` ${this.picks[p].length + 1}/3` : ''}`);
      this.heads[p].classList.toggle('ok', this.ready[p]);
      // placa com o nome no centro
      const teamLine = this.team ? `<div class="teampicks">${[t('sel.leader'), t('sel.assist1'), t('sel.assist2')].map((lab, k) => {
        const c2 = this.picks[p][k] !== undefined ? ROSTER[this.picks[p][k]] : null;
        return `<span class="${c2 ? 'on' : ''}"><small>${lab}</small><b style="color:${c2 ? c2.color : 'inherit'}">${c2 ? c2.name : '—'}</b></span>`;
      }).join('')}</div>` : '';
      this.plates[p].innerHTML = `
        <div class="pn" style="color:${front.color}">${front.name}</div>
        <div class="po">${front.origin} · <span style="color:${ELEMENTS[front.element].color}">${ELEMENTS[front.element].name}</span></div>
        <div class="pt">“${front.info.tagline}”</div>${teamLine}`;
      this.plates[p].classList.toggle('ok', this.ready[p]);
      // ficha resumida embaixo da grade
      const extras = (c.abilities || []).map((a) => `<span class="abl">${a.name} <i>${inputName(a.input)}</i></span>`).join('') || '—';
      const sp = c.special;
      this.dets[p].innerHTML = `
        <dl>
          <dt>${t('sel.style')}</dt><dd class="clamp">${c.info.identity || c.info.style}</dd>
          <dt>${t('sel.melee')}</dt><dd>${c.melee.name}</dd>
          <dt>${t('sel.ranged')}</dt><dd>${c.ranged ? c.ranged.name : '—'}</dd>
          <dt>${t('sel.special')}</dt><dd class="clamp">${sp ? `${sp.name} · ${specialSummary(c)}` : '—'}</dd>
          <dt>${t('sel.abilities')}</dt><dd>${extras}</dd>
        </dl>`;
      // modelo 3D no centro (TORRE: só o do P1)
      if (!(this.M.soloPick && p === 1)) this.stage.show(p, front.id, this.ready[p]);
      if (this.team) this.stage.setBack(p, (this.ready[p] ? this.picks[p].slice(1) : this.picks[p]).map((i) => ROSTER[i].id));
    }
    this.startEl.classList.toggle('on', this.ready[0] && this.ready[1]);
    const keys = { move: moveLabel(0), jump: actionLabel(0, 'jump'), phys: actionLabel(0, 'physical'), jump2: actionLabel(1, 'jump'), phys2: actionLabel(1, 'physical') };
    this.hint.innerHTML = t(this.M.soloPick ? 'tower.sel_hint' : this.cpu ? 'sel.hint_cpu' : 'sel.hint_pvp', keys)
      + t('sel.hint_common', { ok: OK, rand: RAND, back: BACK })
      + (this.pageCount > 1 ? t('sel.hint_page', { l: actionLabel(0, 'pageL'), r: actionLabel(0, 'pageR') }) : '');
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
    // TORRE: só o P1 escolhe; os adversários vêm da torre
    if (this.M.soloPick && this.ready[0]) {
      const teams = this.team ? [this.picks[0].map((i) => ROSTER[i])] : null;
      return { p1: teams ? teams[0][0] : ROSTER[this.cursor[0]], p2: null, teams, cpu: true, mode: this.mode };
    }
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
    const [start, end] = SEL_PAGES[pageOf(this.cursor[slot])];
    const count = end - start;
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
    const page = pageOf(this.cursor[slot]);
    const pos = this.cursor[slot] - SEL_PAGES[page][0];
    const np = (page + dir + this.pageCount) % this.pageCount;
    this.cursor[slot] = Math.min(SEL_PAGES[np][0] + pos, SEL_PAGES[np][1] - 1);
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
      { id: 'timer', label: t('cfg.time'), value: () => timerLabel(), list: TIMER_OPTIONS },
      ...(mode === 'pvp' ? [] : [{ id: 'cpuLevel', label: mode === 'training' ? t('cfg.cpu_target') : t('settings.difficulty'), value: () => cpuLabel(), list: CPU_LEVELS, disabled: mode === 'training' }]),
      { id: 'rounds', label: t('settings.rounds'), value: () => String(SETTINGS.rounds), list: ROUND_OPTIONS, disabled: mode === 'training' },
      { id: 'go', label: t('cfg.go') },
    ];
    this.index = this.rows.length - 1;
    this.el = el(root, 'screen', 'config', `<div class="menu"><h2>${t('cfg.title')}</h2><p class="sub">${t(mode === 'training' ? 'cfg.sub_training' : 'cfg.sub')}</p>
      ${this.rows.map(() => '<div class="opt cfg"></div>').join('')}</div>
      <div class="hint">${t('cfg.hint', { ok: OK, back: BACK })}</div>`);
    this.opts = [...this.el.querySelectorAll('.opt')];
    this.opts.forEach((o, i) => onTap(this, o, 1 + i, () => { this.index = i; this.clicked = true; }));
    this.el.classList.add('net-taps');
    this.netTap = netTapDefault;
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

// Tela de vitória sobre a arena: a equipe fica em pose no cenário e só o lutador ativo fala.
export class VictoryScreen {
  constructor(root, { winner, loser, slot, team = null, line, options, audio = null }) {
    this.options = options;
    this.audio = audio;
    this.index = 0;
    this.el = el(root, 'screen', 'victory', `
      <div class="vbg" style="--c:${winner.color}"></div>
      <div class="vtop"><small>${slot}</small> ${t('vic.wins')}</div>
      <div class="vteam">${(team || [winner]).map((member) => `<span style="--c:${member.color}">${member.name}</span>`).join('')}</div>
      <div class="vquote">
        <div class="vname" style="--c:${winner.color}">${winner.name}</div>
        <div class="vline">“${line}”</div>
        <div class="vsub">${t('vic.defeated', { name: loser.name })}</div>
      </div>
      <div class="vopts">${options.map(() => '<div class="opt"></div>').join('')}</div>`);
    this.opts = [...this.el.querySelectorAll('.vopts .opt')];
    this.opts.forEach((o, i) => onTap(this, o, 1 + i, () => { this.clicked = i; }));
    this.el.classList.add('net-taps');
    this.netTap = netTapDefault;
    this.render();
  }
  render() {
    this.opts.forEach((o, i) => {
      o.textContent = this.options[i].label;
      o.classList.toggle('on', i === this.index);
    });
  }
  // nomes embaixo de cada vencedor: pontos na tela (px), na mesma ordem da equipe
  placeLabels(points) {
    const spans = [...this.el.querySelectorAll('.vteam span')];
    this.el.querySelector('.vteam').classList.add('placed');
    spans.forEach((sp, i) => {
      const p = points[i];
      if (!p) return;
      sp.style.left = `${p.x}px`;
      sp.style.top = `${p.y}px`;
    });
  }
  update(input) {
    if (this.clicked !== undefined) { const id = this.options[this.clicked].id; this.clicked = undefined; this.audio?.play('confirm'); return id; }
    for (const p of input.players) {
      const n = this.options.length;
      if (p.menu.left || p.menu.up) { this.index = (this.index + n - 1) % n; this.audio?.play('select'); this.render(); }
      if (p.menu.right || p.menu.down) { this.index = (this.index + 1) % n; this.audio?.play('select'); this.render(); }
      if (confirm(p) || startGo(p, input) || (p.cpu && p.humanPressed && p.humanPressed.start && !input.keyPressedOnce('Escape'))) { this.audio?.play('confirm'); return this.options[this.index].id; }
    }
    if (input.keyPressedOnce('Enter')) { this.audio?.play('confirm'); return this.options[this.index].id; }
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
      <h2>${t('stage.title')}</h2>
      <div class="stages">${this.list.map((a, i) => `
        <div class="stagecard ${a.available ? '' : 'locked'}" data-i="${i}" style="--sky:${a.colors[0]};--ground:${a.colors[1]};--accent:${a.colors[2]}">
          ${thumbs[a.id] ? `<img src="${thumbs[a.id]}" alt="">` : '<div class="paint"></div>'}
          <div class="sn">${a.name}</div>
          ${a.available ? '' : `<div class="soon">${t('stage.soon')}</div>`}
        </div>`).join('')}
      </div>
      <div class="stageinfo"><div class="sprev"></div><div class="stxt"></div></div>
      <button class="stage-confirm" type="button">${t('stage.confirm')}</button>
      <div class="hint">${t('stage.hint', { ok: OK, jump: actionLabel(0, 'jump'), rand: RAND, carga: actionLabel(0, 'carga'), back: BACK, phys: actionLabel(0, 'physical') })}</div>`);
    this.cards = [...this.el.querySelectorAll('.stagecard')];
    this.info = this.el.querySelector('.stageinfo .stxt');
    this.prev = this.el.querySelector('.stageinfo .sprev');
    this.confirmEl = this.el.querySelector('.stage-confirm');
    this.thumbs = thumbs;
    this.cards.forEach((c, i) => onTap(this, c, 1 + i, () => { this.index = i; this.render(); }));
    onTap(this, this.confirmEl, 250, () => { this.confirmClicked = true; });
    this.el.classList.add('net-taps');
    this.netTap = netTapDefault;
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
      if (p.menu.left) this.move(this.index % this.cols() === 0 ? Math.min(n - 1, this.index + this.cols() - 1) : this.index - 1);
      if (p.menu.right) this.move(this.index % this.cols() === this.cols() - 1 || this.index === n - 1 ? this.index - (this.index % this.cols()) : this.index + 1);
      // cima / baixo trocam de LINHA (mesma coluna); passando da borda, volta pelo outro lado
      if (p.menu.up) this.move(this.index - this.cols() >= 0 ? this.index - this.cols() : this.lastInColumn(this.index % this.cols()));
      if (p.menu.down) this.move(this.index + this.cols() < n ? this.index + this.cols() : this.index % this.cols());
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
  // colunas da grade como estão na tela (muda no celular): cartões na mesma altura do primeiro
  cols() {
    const top = this.cards[0].offsetTop;
    return Math.max(1, this.cards.filter((c) => c.offsetTop === top).length);
  }
  lastInColumn(col) {
    const c = this.cols();
    let i = col;
    while (i + c < this.list.length) i += c;
    return i;
  }
  move(i) {
    if (i === this.index) return;
    this.index = i;
    this.audio.play('select');
    this.render();
  }
  choose() {
    const a = this.list[this.index];
    if (a.available) { this.audio.play('confirm'); return a.id; }
    this.audio.play('denied');
    return null;
  }
  dispose() { this.el.remove(); }
}

const TIP_COUNT = 6; // tip.1 … tip.6 nos arquivos de idioma

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
      <div class="tip">${t('load.tip', { tip: t(`tip.${1 + Math.floor(Math.random() * TIP_COUNT)}`) })}</div>`);
    this.fill = this.el.querySelector('.fill');
  }
  progress(k) {
    this.fill.style.width = `${Math.round(k * 100)}%`;
  }
  dispose() { this.el.remove(); }
}

// TORRES — menu: 8 torres (4 em cima, 4 embaixo). Só a 1ª começa livre; as outras têm cadeado até a anterior ser
// zerada. Cada carta mostra a dificuldade MAIS DIFÍCIL já zerada naquela torre. update() devolve o índice, 'back' ou
// 'denied' (torre trancada).
const towerSvg = (color, n) => {
  const tiers = Array.from({ length: n }, (_, i) => {
    const w = 64 - i * (44 / n);
    const h = 70 / n;
    const y = 92 - (i + 1) * h;
    return `<rect x="${50 - w / 2}" y="${y}" width="${w}" height="${h - 1.5}" rx="1.5"/>`;
  }).join('');
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="${color}">${tiers}<polygon points="46,22 54,22 50,9"/></g><rect x="20" y="92" width="60" height="3" fill="${color}" opacity=".5"/></svg>`;
};

export class TowerSelectScreen {
  constructor(root, { towers, progress, getName, index = 0 }) {
    this.towers = towers;
    this.index = index;
    this.el = el(root, 'screen', 'towers', `
      <h2>${t('tower.select_title')}</h2>
      <div class="tws-grid">${towers.map((tw) => `
        <div class="tws-card ${tw.unlocked ? '' : 'locked'}" style="--c:${tw.color}">
          <div class="tws-art">${towerSvg(tw.color, Math.min(8, tw.floorCount))}${tw.unlocked ? '' : '<span class="tws-lock">🔒</span>'}</div>
          <b>${tw.title}</b>
          <small>${tw.unlocked ? `${t('tower.floors_n', { n: tw.floorCount })} · ${tw.villain}` : t('tower.locked')}</small>
          <em class="${tw.best ? 'ok' : ''}">${tw.unlocked ? (tw.best ? `★ ${t('tower.best', { v: tw.best })}` : t('tower.not_cleared')) : t('tower.locked_msg')}</em>
        </div>`).join('')}
      </div>
      <div class="hint">${t('tower.select_hint', { ok: OK, back: BACK })}</div>`);
    void progress; void getName;
    this.cards = [...this.el.querySelectorAll('.tws-card')];
    this.cards.forEach((c, i) => onTap(this, c, 1 + i, () => { if (this.index === i) this.clicked = i; else { this.index = i; this.render(); this.moved = true; } }));
    this.el.classList.add('net-taps');
    this.netTap = netTapDefault;
    this.render();
  }
  render() { this.cards.forEach((c, i) => c.classList.toggle('on', i === this.index)); }
  choose(i) { return this.towers[i].unlocked ? i : 'denied'; }
  update(input) {
    if (this.clicked !== undefined) { const i = this.clicked; this.clicked = undefined; return this.choose(i); }
    if (this.moved) { this.moved = false; return 'move'; }
    for (const p of controllers(input, null)) {
      const col = this.index % 4;
      const row = Math.floor(this.index / 4);
      let ni = this.index;
      if (p.menu.left) ni = row * 4 + (col + 3) % 4;
      if (p.menu.right) ni = row * 4 + (col + 1) % 4;
      if (p.menu.up || p.menu.down) ni = (1 - row) * 4 + col;
      if (ni !== this.index) { this.index = ni; this.render(); return 'move'; }
      if (confirm(p) || startGo(p, input)) return this.choose(this.index);
      if (back(p)) return 'back';
    }
    if (input.keyPressedOnce('Enter')) return this.choose(this.index);
    if (input.keyPressedOnce('Escape')) return 'back';
    return null;
  }
  dispose() { this.el.remove(); }
}

// TORRE — a torre em 3D (TowerStage, desenhada atrás) com o painel por cima. Modos:
//   intro: a câmera sobe da base ao topo e afasta; depois ESCOLHER LUTADOR / VOLTAR ('pick' | 'back')
//   diff:  o lutador escolhido + as 5 dificuldades ('diff:<id>' | 'reselect')
//   map:   andares, o da vez em destaque ('fight' | 'quit')
//   done:  topo alcançado ('done')
export class TowerScreen {
  constructor(root, { mode, run, stage, portraits, cpuLabel: label = cpuLabel, difficulties = [], best = null, newBest = false, unlockedNext = null }) {
    this.mode = mode;
    this.run = run;
    this.stage = stage;
    this.index = 0;
    const T = run.tower;
    const title = T.gauntlet ? t('tower.babel') : t('tower.name', { n: T.numeral });
    const boss = run.floors.at(-1).def;
    const head = `<div class="tw-head" style="--c:${T.color}"><small>${t('tower.name', { n: T.numeral })}</small><b>${title}</b>
      <span>${t('tower.floors_n', { n: run.floors.length })} · ${t('tower.villain')}: <i>${boss.name}</i></span>
      <span class="tw-best">${best ? `★ ${t('tower.best', { v: label(best) })}` : t('tower.not_cleared')}</span></div>`;
    let panel = '';
    let opts = [];
    if (mode === 'intro') {
      opts = [['pick', t('tower.pick_fighter')], ['back', t('ui.back')]];
      panel = `<div class="tw-panel tw-center">${head}</div>`;
    } else if (mode === 'diff') {
      const P = run.player;
      opts = difficulties.map((d) => [`diff:${d}`, `${label(d)}${d === best ? ' ★' : ''}`]).concat([['reselect', t('ui.back')]]);
      panel = `<div class="tw-panel">${head}
        <div class="tw-fighter" style="--c:${P.color}"><img src="${portraits[P.id] || ''}" alt=""><div><b>${P.name}</b><small>${t('tower.fighter_fixed')}</small></div></div>
        <h3>${t('tower.choose_diff')}</h3></div>`;
      this.index = Math.max(0, difficulties.indexOf(best || 'normal'));
    } else if (mode === 'map' || mode === 'done') {
      const P = run.player;
      const list = run.floors.map((f, i) => {
        const st = mode === 'done' || i < run.floor ? 'won' : i === run.floor ? 'now' : 'next';
        return `<div class="tw-floor ${st}${f.boss ? ' boss' : ''}" style="--c:${f.def.color}"><span class="tw-n">${f.boss ? t('tower.boss') : t('tower.floor', { n: i + 1 })}</span><img src="${portraits[f.def.id] || ''}" alt=""><b>${f.def.name}</b><small>${label(f.level)}</small><i class="tw-mark">${st === 'won' ? '✔' : st === 'now' ? '◀' : ''}</i></div>`;
      }).reverse().join('');
      opts = mode === 'done' ? [['done', t('tower.continue')]] : [['fight', t('tower.fight')], ['quit', t('tower.quit')]];
      const doneTxt = mode === 'done' ? `<h3 class="tw-done">${t('tower.done')}</h3><p>${t('tower.done_sub', { name: P.name, n: run.floors.length })}</p>${newBest ? `<p class="tw-gold">${t('tower.new_best')}</p>` : ''}${unlockedNext ? `<p class="tw-gold">🔓 ${t('tower.unlocked_next', { n: unlockedNext })}</p>` : ''}` : '';
      panel = `<div class="tw-panel">${head}
        <div class="tw-fighter" style="--c:${P.color}"><img src="${portraits[P.id] || ''}" alt=""><div><b>${P.name}</b><small>${label(run.difficulty)}</small></div></div>
        ${doneTxt}<div class="tw-list">${list}</div></div>`;
    }
    this.opts = opts;
    this.el = el(root, 'screen clear', 'tower', `${panel}
      <div class="tw-btns">${opts.map(([id, l]) => `<div class="opt" data-a="${id}">${l}</div>`).join('')}</div>
      <div class="hint">${mode === 'intro' ? `<span class="tw-skip">${t('tower.skip')}</span>` : ''}<span class="tw-nav">${t('tower.menu_hint', { ok: OK, back: BACK })}</span></div>`);
    this.btnBox = this.el.querySelector('.tw-btns');
    this.btns = [...this.el.querySelectorAll('.tw-btns .opt')];
    this.btns.forEach((b, i) => onTap(this, b, 1 + i, () => { this.clicked = b.dataset.a; }));
    this.el.addEventListener('click', () => { if (this.stage && !this.stage.introDone) this.stage.skipIntro(); });
    this.el.classList.add('net-taps');
    this.netTap = netTapDefault;
    const now = this.el.querySelector('.tw-floor.now');
    if (now) setTimeout(() => now.scrollIntoView({ block: 'center' }), 0);
    this.render();
  }
  get waiting() { return this.mode === 'intro' && this.stage && !this.stage.introDone; }
  render() {
    this.el.classList.toggle('tw-waiting', this.waiting);
    this.btns.forEach((b, i) => b.classList.toggle('on', i === this.index));
  }
  backId() { return { intro: 'back', diff: 'reselect', map: 'quit', done: 'done' }[this.mode]; }
  update(input) {
    // apresentação: qualquer botão pula; os botões só aparecem quando a câmera termina
    if (this.waiting) {
      if (input.anyPressed || input.keyPressedOnce('Enter') || input.keyPressedOnce('Escape')) this.stage.skipIntro();
      return null;
    }
    if (this.el.classList.contains('tw-waiting')) { this.render(); this.guard = 0.2; }
    if (this.guard > 0) { this.guard -= 1 / 60; return null; }
    if (this.clicked) { const a = this.clicked; this.clicked = null; return a; }
    for (const p of controllers(input, null)) {
      const n = this.btns.length;
      if (p.menu.up || p.menu.left) { this.index = (this.index + n - 1) % n; this.render(); return 'move'; }
      if (p.menu.down || p.menu.right) { this.index = (this.index + 1) % n; this.render(); return 'move'; }
      if (confirm(p) || startGo(p, input)) return this.btns[this.index].dataset.a;
      if (back(p)) return this.backId();
    }
    if (input.keyPressedOnce('Enter')) return this.btns[this.index].dataset.a;
    if (input.keyPressedOnce('Escape')) return this.backId();
    return null;
  }
  dispose() { this.el.remove(); }
}

// TORNEIO — montagem no estilo Naruto Storm: 8 vagas em cartas grandes (4 em cima, 4 embaixo). Em cada vaga:
// A/× alterna VAZIO → HUMANO → CPU, Y/△ escolhe o lutador (CPU sem escolha = sorteado). Em cima SOLO/EQUIPE, embaixo
// as regras (tempo, rounds, dificuldade, cenário) e COMEÇAR. cfg = { team, slots: [{ type, defs }] × 8, stage }.
// update() devolve 'go', 'back', 'move', 'denied' ou 'pick:<vaga>'.
export class TournamentSetupScreen {
  constructor(root, { audio, cfg, stages, portraits, focus = null }) {
    this.audio = audio;
    this.cfg = cfg;
    this.stages = stages;
    this.portraits = portraits;
    // grade de foco: linha 0 formato | 1–2 vagas | 3 regras | 4 começar
    this.grid = [['format'], ['s0', 's1', 's2', 's3'], ['s4', 's5', 's6', 's7'], ['timer', 'rounds', 'cpuLevel', 'stage'], ['go']];
    this.pos = focus || [1, 0];
    this.el = el(root, 'screen', 'tsetup', '');
    this.render();
  }
  names() {
    let h = 0;
    let c = 0;
    return this.cfg.slots.map((s) => (s.type === 'human' ? t('tour.player', { n: ++h }) : s.type === 'cpu' ? t('tour.cpu_name', { n: ++c }) : ''));
  }
  get active() { return this.cfg.slots.filter((s) => s.type !== 'empty').length; }
  render() {
    const c = this.cfg;
    const names = this.names();
    const stage = this.stages.find((s) => s.id === c.stage) || this.stages[0];
    const focus = this.grid[this.pos[0]][this.pos[1]];
    const TYPES = [['empty', t('tour.empty')], ['human', t('tour.human')], ['cpu', 'CPU']];
    const card = (s, i) => {
      const d = s.defs && s.defs.length ? s.defs : null;
      // seletor de tipo SEMPRE visível em cima; a área do retrato é o botão de escolher o lutador
      const seg = `<div class="ts-seg">${TYPES.map(([id, l]) => `<span class="${s.type === id ? 'on' : ''}" data-type="${i}:${id}">${l}</span>`).join('')}</div>`;
      let art;
      if (s.type === 'empty') art = `<div class="ts-art add" data-type="${i}:human"><i class="ts-plus">+</i><em>${t('tour.add')}</em></div>`;
      else if (d) {
        art = `<div class="ts-art" data-pick="${i}"><img class="ts-lead" src="${this.portraits[d[0].id] || ''}" alt="">${d.length > 1 ? `<div class="ts-mini">${d.slice(1).map((x) => `<img src="${this.portraits[x.id] || ''}" alt="">`).join('')}</div>` : ''}<em class="ts-change">${t('tour.change')}</em></div>`;
      } else {
        art = `<div class="ts-art" data-pick="${i}"><i class="ts-q">${s.type === 'cpu' ? '🎲' : '?'}</i><em>${s.type === 'cpu' ? t('tour.cpu_random') : t('tour.choose')}</em></div>`;
      }
      const who = d ? d.map((x) => x.name).join(' · ') : s.type === 'cpu' ? t('ui.random') : s.type === 'human' ? '—' : '';
      return `<div class="ts-card ${s.type} ${focus === `s${i}` ? 'on-focus' : ''}" data-k="s${i}" style="--c:${d ? d[0].color : 'transparent'}">
        ${seg}${art}
        <div class="ts-info"><b>${names[i] || t('tour.slot', { n: i + 1 })}</b><small>${who}</small></div>
      </div>`;
    };
    const pill = (k, label, value) => `<div class="ts-pill ${focus === k ? 'on-focus' : ''}" data-k="${k}"><small>${label}</small><b><i data-dir="-1">◀</i> ${value} <i data-dir="1">▶</i></b></div>`;
    // dica de controle conforme o que está selecionado (só o que dá para fazer ali)
    const hint = focus[0] === 's' ? (c.slots[Number(focus.slice(1))].type === 'empty' ? t('tour.hint_add', { ok: OK }) : t('tour.hint_slot', { ok: OK, rand: RAND }))
      : focus === 'format' ? t('tour.hint_format', { ok: OK }) : focus === 'go' ? t('tour.hint_go', { ok: OK }) : t('tour.hint_rule');
    this.el.innerHTML = `
      <div class="ts-head"><h2>${t('menu.tournament')}</h2><div class="ts-count"><b>${this.active}</b> ${t('tour.count')}</div></div>
      <div class="ts-step"><span>1</span>${t('tour.format')}</div>
      <div class="ts-format ${focus === 'format' ? 'on-focus' : ''}" data-k="format"><span class="${c.team ? '' : 'on'}" data-fmt="solo">${t('tour.solo')}</span><span class="${c.team ? 'on' : ''}" data-fmt="team">${t('tour.team')}</span></div>
      <div class="ts-step"><span>2</span>${t('tour.count')}</div>
      <div class="ts-grid">${c.slots.map(card).join('')}</div>
      <div class="ts-step"><span>3</span>${t('tour.rules')}</div>
      <div class="ts-rules">${pill('timer', t('cfg.time'), timerLabel())}${pill('rounds', t('settings.rounds'), SETTINGS.rounds)}${pill('cpuLevel', t('settings.difficulty'), cpuLabel())}${pill('stage', t('tour.stage'), stage.name)}</div>
      <div class="ts-go ${this.active >= 2 ? '' : 'off'} ${focus === 'go' ? 'on-focus' : ''}" data-k="go">${this.active >= 2 ? `${t('ui.start')} ▶` : t('tour.need2')}</div>
      <div class="ts-hint"><span class="ts-hint-now">${hint}</span><span>${t('tour.hint_nav', { back: BACK })}</span></div>`;
    this.el.querySelectorAll('[data-k]').forEach((e) => {
      e.addEventListener('click', (ev) => {
        this.focusKey(e.dataset.k);
        const type = ev.target.closest('[data-type]');
        const pick = ev.target.closest('[data-pick]');
        const fmt = ev.target.closest('[data-fmt]');
        const dir = ev.target.closest('[data-dir]');
        if (type) { const [i, ty] = type.dataset.type.split(':'); this.clicked = `type:${i}:${ty}`; }
        else if (pick) this.clicked = `pick:${pick.dataset.pick}`;
        else if (fmt) this.clicked = `fmt:${fmt.dataset.fmt}`;
        else this.clicked = dir ? `dir:${dir.dataset.dir}` : 'act';
        ev.stopPropagation();
      });
    });
  }
  focusKey(k) {
    this.grid.forEach((row, r) => row.forEach((x, c) => { if (x === k) this.pos = [r, c]; }));
  }
  get focus() { return this.grid[this.pos[0]][this.pos[1]]; }
  // ação no item em foco (A/× ou clique): alterna/gira o valor
  act(dir = 1) {
    const k = this.focus;
    const c = this.cfg;
    if (k === 'go') return this.active >= 2 ? 'go' : 'denied';
    if (k === 'format') c.team = !c.team;
    else if (k[0] === 's') {
      const s = c.slots[Number(k.slice(1))];
      const order = ['empty', 'human', 'cpu'];
      s.type = order[(order.indexOf(s.type) + (dir > 0 ? 1 : 2)) % 3];
      if (s.type === 'empty') s.defs = null;
    } else if (k === 'timer') cycleSetting('timer', TIMER_OPTIONS, dir);
    else if (k === 'rounds') cycleSetting('rounds', ROUND_OPTIONS, dir);
    else if (k === 'cpuLevel') cycleSetting('cpuLevel', CPU_LEVELS, dir);
    else if (k === 'stage') {
      const i = this.stages.findIndex((x) => x.id === c.stage);
      c.stage = this.stages[(i + dir + this.stages.length) % this.stages.length].id;
    }
    // trocar solo/equipe apaga as escolhas (o número de lutadores muda)
    if (k === 'format') c.slots.forEach((s) => { s.defs = null; });
    this.render();
    return 'move';
  }
  move(dr, dc) {
    let [r, c] = this.pos;
    if (dr) { r = Math.max(0, Math.min(this.grid.length - 1, r + dr)); c = Math.min(c, this.grid[r].length - 1); }
    if (dc) c = (c + dc + this.grid[r].length) % this.grid[r].length;
    this.pos = [r, c];
    this.render();
    return 'move';
  }
  update(input) {
    if (this.clicked) {
      const a = this.clicked;
      this.clicked = null;
      if (a.startsWith('pick:')) return a;
      if (a.startsWith('type:')) {
        const [, i, ty] = a.split(':');
        const sl = this.cfg.slots[Number(i)];
        sl.type = ty;
        if (ty === 'empty') sl.defs = null;
        this.render();
        return 'move';
      }
      if (a.startsWith('fmt:')) {
        const team = a === 'fmt:team';
        if (team !== this.cfg.team) { this.cfg.team = team; this.cfg.slots.forEach((x) => { x.defs = null; }); }
        this.render();
        return 'move';
      }
      if (a.startsWith('dir:')) return this.act(Number(a.slice(4)));
      return this.act(1);
    }
    for (const p of input.players) {
      if (p.menu.up) return this.move(-1, 0);
      if (p.menu.down) return this.move(1, 0);
      // nas regras ◀ ▶ mudam o valor; no resto andam
      const onRule = this.pos[0] === 3 || this.pos[0] === 0;
      if (p.menu.left) return onRule ? this.act(-1) : this.move(0, -1);
      if (p.menu.right) return onRule ? this.act(1) : this.move(0, 1);
      if (random(p) && this.focus[0] === 's' && this.cfg.slots[Number(this.focus.slice(1))].type !== 'empty') return `pick:${this.focus.slice(1)}`;
      if (startGo(p, input)) return this.active >= 2 ? 'go' : 'denied';
      if (confirm(p)) return this.act(1);
      if (back(p)) return 'back';
    }
    if (input.keyPressedOnce('Enter')) return this.act(1);
    if (input.keyPressedOnce('Escape')) return 'back';
    return null;
  }
  dispose() { this.el.remove(); }
}

// TORNEIO — a chave no estilo Naruto Storm: árvore espelhada (metade da chave de cada lado convergindo para a final
// no centro), medalhões com o retrato, linhas que acendem em dourado pelo caminho do vencedor, eliminados em cinza.
// Embaixo o painel VS da próxima luta (LUTAR / SAIR) ou o CAMPEÃO com troféu (CONTINUAR).
export class TournamentScreen {
  constructor(root, { tour, portraits, next = null, autos = new Set() }) {
    this.tour = tour;
    const P = tour.participants;
    const R = tour.rounds.length;
    const colX = (col, side) => {
      const x = R === 1 ? 26 : 6 + col * (32 / (R - 1));
      return side < 0 ? x : 100 - x;
    };
    // posição (x, y em %) de cada assento: rodada r, luta m, lado 0 (a) ou 1 (b)
    const seat = {};
    const half0 = tour.rounds[0].length / 2;
    tour.rounds.forEach((round, r) => round.forEach((match, m) => {
      const final = r === R - 1;
      for (const k of [0, 1]) {
        let side;
        let y;
        if (final) { side = k ? 1 : -1; y = r === 0 ? 50 : seatY(r - 1, k ? 1 : 0); }
        else {
          side = m < round.length / 2 ? -1 : 1;
          if (r === 0) {
            const idx = (m % Math.max(1, half0)) * 2 + k;
            y = ((idx + 0.5) / (Math.max(1, half0) * 2)) * 100;
          } else y = seatY(r - 1, m * 2 + k);
        }
        seat[`${r}:${m}:${k}`] = { x: colX(r, side), y, side };
      }
    }));
    // y do vencedor da luta (r, m) = meio dos dois assentos dela
    function seatY(r, m) { return (seat[`${r}:${m}:0`].y + seat[`${r}:${m}:1`].y) / 2; }
    const finalY = seat[`${R - 1}:0:0`].y;
    const champ = { x: 50, y: Math.max(14, finalY - 26) };

    const lines = [];
    const nodes = [];
    const who = (i) => (i === null || i === undefined ? null : P[i]);
    tour.rounds.forEach((round, r) => round.forEach((match, m) => {
      const final = r === R - 1;
      const target = final ? champ : (() => { const nm = Math.floor(m / 2); const s = seat[`${r + 1}:${nm}:${m % 2}`]; return s; })();
      [0, 1].forEach((k) => {
        const s = seat[`${r}:${m}:${k}`];
        const idx = k ? match.b : match.a;
        const bye = r === 0 && k === 1 && match.b === null;
        const lit = match.winner !== null && idx === match.winner;
        const midX = (s.x + target.x) / 2;
        if (!bye) lines.push(`<path class="${lit ? 'lit' : ''}" d="M${s.x} ${s.y} H${final ? s.x : midX} V${target.y} H${target.x}"/>`);
        const p = who(idx);
        const st = match.winner === null ? '' : lit ? 'win' : 'lose';
        const isNext = next && next.r === r && next.m === m;
        // "passa direto": sem assento vazio — a linha dourada já mostra quem avançou
        if (!bye) nodes.push(`<div class="tn ${p ? '' : 'empty'} ${st} ${isNext ? 'next' : ''} ${final ? 'big' : ''} ${p && p.human ? 'human' : ''}" style="left:${s.x}%;top:${s.y}%;--c:${p ? p.defs[0].color : '#3a3346'}">
              ${p ? `<img src="${portraits[p.defs[0].id] || ''}" alt="">` : '<i>?</i>'}<span>${p ? p.name : ''}</span></div>`);
      });
      if (autos.has(`${r}:${m}`)) {
        const a = seat[`${r}:${m}:0`];
        nodes.push(`<em class="tn-auto" style="left:${(a.x + target.x) / 2}%;top:${(a.y + seat[`${r}:${m}:1`].y) / 2}%" title="${t('tour.auto')}">🎲</em>`);
      }
    }));
    const ch = who(tour.champion);
    nodes.push(`<div class="tn champ ${ch ? 'win' : 'empty'}" style="left:${champ.x}%;top:${champ.y}%;--c:${ch ? ch.defs[0].color : '#3a3346'}">
      ${ch ? `<img src="${portraits[ch.defs[0].id] || ''}" alt="">` : '<i>🏆</i>'}<span>${ch ? ch.name : t('tour.champion')}</span></div>`);
    const roundName = (r) => t({ final: 'tour.round_final', semi: 'tour.round_semi', quarter: 'tour.round_quarter' }[roundKey(tour.rounds[r].length)]);

    let panel;
    let opts;
    if (ch) {
      opts = [['done', t('tour.continue')]];
      panel = `<div class="tv-panel champ" style="--c:${ch.defs[0].color}"><img src="${portraits[ch.defs[0].id] || ''}" alt="">
        <div><small>🏆 ${t('tour.champion')}</small><b>${ch.name}</b><p>${ch.defs.map((d) => d.name).join(' · ')}</p></div></div>`;
    } else {
      const a = P[next.match.a];
      const b = P[next.match.b];
      opts = [['fight', t('tour.fight')], ['quit', t('tour.quit')]];
      const fighter = (p, side) => `<div class="tv-f ${side}" style="--c:${p.defs[0].color}"><img src="${portraits[p.defs[0].id] || ''}" alt=""><b>${p.name}</b><small>${p.defs.map((d) => d.name).join(' · ')}</small></div>`;
      const sides = a.human && b.human ? `<p class="tv-sides">${t('tour.sides', { a: a.name, b: b.name })}</p>` : '';
      panel = `<div class="tv-panel"><div class="tv-round">${t('tour.next')} · ${roundName(next.r)}</div>${fighter(a, 'l')}<div class="tv-vs">VS</div>${fighter(b, 'r')}${sides}</div>`;
    }
    this.opts = opts;
    this.index = 0;
    this.el = el(root, 'screen', 'tbracket', `
      <h2>${t('menu.tournament')}</h2>
      <div class="tb-tree"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${lines.join('')}</svg>${nodes.join('')}</div>
      ${panel}
      <div class="tb-btns">${opts.map(([id, l]) => `<div class="opt" data-a="${id}">${l}</div>`).join('')}</div>`);
    this.btns = [...this.el.querySelectorAll('.tb-btns .opt')];
    this.btns.forEach((b, i) => onTap(this, b, 1 + i, () => { this.clicked = b.dataset.a; }));
    this.el.classList.add('net-taps');
    this.netTap = netTapDefault;
    this.render();
  }
  render() { this.btns.forEach((b, i) => b.classList.toggle('on', i === this.index)); }
  update(input) {
    if (this.clicked) { const a = this.clicked; this.clicked = null; return a; }
    for (const p of input.players) {
      const n = this.btns.length;
      if (p.menu.left || p.menu.up) { this.index = (this.index + n - 1) % n; this.render(); return 'move'; }
      if (p.menu.right || p.menu.down) { this.index = (this.index + 1) % n; this.render(); return 'move'; }
      if (confirm(p) || startGo(p, input)) return this.btns[this.index].dataset.a;
      if (back(p)) return this.tour.champion !== null ? 'done' : null;
    }
    if (input.keyPressedOnce('Enter')) return this.btns[this.index].dataset.a;
    return null;
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
      case 'menu': return [['create', t('lan.create')], ['rooms', t('lan.rooms')], ['join', t('lan.join')], ['back', t('ui.back')]];
      case 'create': return [['vis', t('lan.vis', { v: t(this.isPublic ? 'lan.public' : 'lan.private') })], ['host', t('lan.do_create')], ['menu', t('ui.back')]];
      case 'rooms': return [
        ...this.rooms.map((r, i) => [`room:${i}`, `${r.locked ? '🔒 ' : ''}${t('lan.room_of', { name: esc(r.name) })} · ${r.code}`]),
        ['refresh', t('lan.refresh')], ['menu', t('ui.back')],
      ];
      case 'join': case 'password': return [['go', t('lan.enter')], [this.view === 'password' ? 'rooms' : 'menu', t('ui.back')]];
      default: return [['cancel', t('lan.cancel')]];
    }
  }

  render() {
    const V = this.view;
    const opts = this.options();
    this.opts = opts;
    if (this.index >= opts.length) this.index = Math.max(0, opts.length - 1);
    const field = (cls, ph, max = 16, type = 'text') => `<input class="lan-field ${cls}" type="${type}" maxlength="${max}" autocomplete="off" spellcheck="false" placeholder="${ph}">`;
    let body = '';
    if (V === 'menu') body = `<label class="lan-label">${t('lan.your_name')}</label>${field('f-name', t('lan.name_ph'))}<p class="sub">${t('lan.intro')}</p>`;
    else if (V === 'create') body = `<label class="lan-label">${t('lan.password_opt')}</label>${field('f-pass', t('lan.no_password'), 20, 'password')}`;
    else if (V === 'host') body = `<p class="sub">${t(this.code ? 'lan.code' : 'lan.creating')}</p><div class="lan-code">${this.code || '· · · · ·'}</div><p class="sub">${t(this.isPublic ? 'lan.public_room' : 'lan.private_room')}${this.password ? t('lan.with_password') : ''}</p>`;
    else if (V === 'rooms') body = `<p class="sub">${t(this.rooms.length ? 'lan.open_now' : 'lan.searching')}</p>`;
    else if (V === 'join') body = `<label class="lan-label">${t('lan.room_code')}</label>${field('f-code lan-input', 'ABCDE', 5)}<label class="lan-label">${t('lan.password_if')}</label>${field('f-pass', t('lan.no_password'), 20, 'password')}`;
    else if (V === 'password') body = `<p class="sub">${t('lan.room_of', { name: esc(this.target && this.target.name) })} · ${this.target && this.target.code}</p><label class="lan-label">${t('lan.password')}</label>${field('f-pass', t('lan.password_ph'), 20, 'password')}`;
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
    this.status = t(this.isPublic ? 'lan.waiting_public' : 'lan.waiting_private');
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
    if (id === 'refresh') { this.setStatus(t('lan.refreshing')); return 'refresh'; }
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
      this.setStatus(t('lan.joining', { name: r.name }));
      return { act: 'join', code: r.code, password: '' };
    }
    if (id === 'go') {
      if (!/^[A-Z0-9]{5}$/.test(this.code || '')) { this.setStatus(t('lan.code_invalid'), true); return null; }
      this.saveName();
      this.from = this.view === 'password' ? 'rooms' : 'menu';
      this.go('wait', null);
      this.setStatus(t('lan.connecting'));
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
        <div class="news-head"><h3>${t('menu.news')}</h3><span class="news-ver"></span></div>
        <div class="news-nav"><button type="button" aria-label="${t('news.prev')}">◀</button><button type="button" aria-label="${t('news.next')}">▶</button></div>
        <div class="content"></div>
        <div class="hint">${getLanguage().startsWith('pt') ? '' : `${t('news.note')} · `}${t('news.hint', { ok: OK, back: BACK })}</div>
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
    this.verEl.textContent = `${formatVersion(c.v)}${c.v === VERSION ? ` · ${t('news.current')}` : ''} — ${this.page + 1} / ${CHANGELOG.length}`;
    this.content.innerHTML = `<div class="news-title">${formatVersion(c.v)} — ${c.title}</div><div class="news-date">${c.date.split('-').reverse().join('/')}</div><ul>${c.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
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
        <div class="hint">${t('cmd.hint', { back: BACK, phys: actionLabel(0, 'physical') })}</div>
      </div>`);
    this.tabs = this.el.querySelector('.tabs');
    this.content = this.el.querySelector('.content');
    this.render();
  }
  pages() {
    return [...this.defs.map((d, i) => ({ title: `P${i + 1}: ${d.name}`, html: moveListHTML(d) })), { title: t('cmd.controls'), html: controlsTable() }];
  }
  render() {
    const pages = this.pages();
    this.tabs.innerHTML = pages.map((p, i) => `<span class="${i === this.page ? 'on' : ''}">${p.title}</span>`).join('');
    this.content.innerHTML = pages[this.page].html;
    this.content.scrollTop = 0;
  }
  update(input) {
    const n = this.pages().length;
    for (const p of controllers(input, this.owner)) {
      if (p.menu.left) { this.page = (this.page + n - 1) % n; this.render(); }
      if (p.menu.right) { this.page = (this.page + 1) % n; this.render(); }
      // a lista de golpes é longa: ▲ ▼ rolam (com a roda do mouse / dedo também)
      if (p.moveY > 0.5) this.content.scrollTop -= 14;
      if (p.moveY < -0.5) this.content.scrollTop += 14;
      if (back(p) || p.pressed.start) return 'back';
    }
    if ((this.owner === null || this.owner === 0) && input.keyPressedOnce('Escape')) return 'back';
    return null;
  }
  dispose() { this.el.remove(); }
}

export function controlsTable() {
  const wide = (k) => `<tr><td>${t(k)}</td><td colspan="3">${t(`${k}_v`)}</td></tr>`;
  const row = (label, action) => `<tr><td>${label}</td><td><kbd>${actionLabel(0, action)}</kbd></td><td><kbd>${actionLabel(1, action)}</kbd></td><td>${actionLabel(0, action, 'gamepad')}</td></tr>`;
  return `
    <table class="controls-table">
      <tr><th>${t('ctl.action')}</th><th>${t('ctl.p1kb')}</th><th>${t('ctl.p2kb')}</th><th>${t('ctl.pad')}</th></tr>
      <tr><td>${t('ctl.move')}</td><td><kbd>${moveLabel(0)}</kbd></td><td><kbd>${t('ctl.arrows')}</kbd></td><td>${t('ctl.stick')}</td></tr>
      ${row(t('ctl.physical'), 'physical')}
      ${row(t('ctl.ranged'), 'ranged')}
      ${row(t('ctl.carga'), 'carga')}
      ${row(t('ctl.jump'), 'jump')}
      ${row(t('ctl.block'), 'block')}
      ${row(t('ctl.dodge'), 'dodge')}
      ${wide('ctl.block_dir')}
      ${row(t('ctl.assist'), 'assist1')}
      ${wide('ctl.dash')}
      ${wide('ctl.longdash')}
      ${wide('ctl.grab')}
      ${wide('ctl.abilities')}
      ${wide('ctl.special')}
      ${wide('ctl.camera')}
    </table>`;
}
