// Página SOBRE / BAIXAR (sobre.html). Leve de propósito: a versão vem do build (__APP_VERSION__, sem carregar o
// changelog) e o elenco (os dados dos personagens) só carrega quando a seção chega perto da tela.
import { ELEMENTS } from './config/elements.js'; // as cores dos elementos do próprio jogo (arquivo pequeno)

const REL = 'https://github.com/romavitordev/arena-paranormal/releases/latest/download/';

/* global __APP_VERSION__ */
const ver = document.getElementById('ver');
if (ver && typeof __APP_VERSION__ === 'string') ver.textContent = `v${__APP_VERSION__}`;

// a ação principal é o download do aparelho de quem vê (iPhone/iPad: jogar no navegador)
const ua = navigator.userAgent;
const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
const android = /Android/i.test(ua);
const cta = document.getElementById('cta-main');
const ctaLabel = document.getElementById('cta-label');
if (android) { cta.href = REL + 'Arena-Paranormal-Android.apk'; ctaLabel.textContent = 'Baixar para Android'; }
else if (ios) { cta.href = '#dl-web'; ctaLabel.textContent = 'Instalar no iPhone'; } // os passos ficam no cartão (instala pela tela de início)
document.getElementById(android ? 'dl-android' : ios ? 'dl-web' : 'dl-pc')?.classList.add('suggested');

// dentro do app instalado (Electron / Capacitor): avisa e mantém os downloads (servem para atualizar)
if (/Electron/i.test(ua) || window.Capacitor) document.getElementById('no-app').classList.remove('hidden');

// os dados dos personagens: carregados uma vez, quando o elenco ou os elementos chegam perto da tela
let rosterData = null;
const loadRoster = () => (rosterData ??= import('./characters/index.js').then((m) => m.ROSTER));

// os elementos: quem do elenco é de cada um (o texto é do HTML; aqui só entra a lista de nomes)
let elementsDone = false;
async function fillElements() {
  if (elementsDone) return;
  elementsDone = true;
  const ROSTER = await loadRoster();
  for (const card of document.querySelectorAll('#elements .element')) {
    const names = ROSTER.filter((c) => c.element === card.dataset.el).map((c) => c.name);
    if (names.length) card.querySelector('.el-who').textContent = `No elenco: ${names.join(', ')}.`;
  }
}

// o elenco: um cartão por lutador (retrato pré-renderizado em public/sobre/elenco, gerado dos modelos do jogo), com
// filtros por origem e por elemento — montado dos próprios dados do jogo
const rosterEl = document.getElementById('roster');
let rosterDone = false;
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
async function buildRoster() {
  if (rosterDone) return;
  rosterDone = true;
  const ROSTER = await loadRoster();
  document.getElementById('roster-count').textContent = `${ROSTER.length} lutadores jogáveis: origem, elemento, arma, especial e transformação de cada um.`;
  const frag = document.createDocumentFragment();
  for (const c of ROSTER) {
    const E = ELEMENTS[c.element];
    const card = document.createElement('article');
    card.className = 'fcard';
    card.dataset.origin = c.origin;
    card.dataset.element = c.element || '';
    card.style.setProperty('--c', E ? E.color : '#948a90');
    const rows = [
      ['Arma', c.info && c.info.weapon],
      ['Especial', c.special && c.special.name],
      ['Transformação', c.awakening && c.awakening.name],
    ].filter(([, v]) => v);
    card.innerHTML = `<div class="fpic"><img src="sobre/elenco/${esc(c.id)}.webp" width="240" height="320" loading="lazy" decoding="async" alt=""></div>
      <div class="fbody">
        <p class="fk">${esc(c.origin)}${E ? ` · <span>${esc(E.name)}</span>` : ''}</p>
        <h3>${esc(c.name)}</h3>
        ${c.info && c.info.tagline ? `<p class="ftag">“${esc(c.info.tagline)}”</p>` : ''}
        <dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      </div>`;
    frag.appendChild(card);
  }
  rosterEl.appendChild(frag);

  // filtros: origem e elemento juntos (os dois "Todos" no começo); aria-pressed marca o escolhido
  const sel = { origin: null, element: null };
  const status = document.getElementById('roster-status');
  const apply = () => {
    let n = 0;
    for (const card of rosterEl.children) {
      const ok = (!sel.origin || card.dataset.origin === sel.origin) && (!sel.element || card.dataset.element === sel.element);
      card.hidden = !ok;
      if (ok) n++;
    }
    status.textContent = `${n} lutador${n === 1 ? '' : 'es'} na lista.`;
  };
  const chips = (box, key, values, label) => {
    for (const v of [null, ...values]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = v ? label(v) : 'Todos';
      if (key === 'element' && v && ELEMENTS[v]) b.style.setProperty('--c', ELEMENTS[v].color);
      b.setAttribute('aria-pressed', String(v === null));
      b.addEventListener('click', () => {
        sel[key] = v;
        for (const o of box.children) o.setAttribute('aria-pressed', String(o === b));
        apply();
      });
      box.appendChild(b);
    }
  };
  const origins = [...new Set(ROSTER.map((c) => c.origin))];
  const elements = Object.keys(ELEMENTS).filter((e) => ROSTER.some((c) => c.element === e));
  chips(document.getElementById('f-origin'), 'origin', origins, (o) => o);
  chips(document.getElementById('f-element'), 'element', elements, (e) => ELEMENTS[e].name);
  document.getElementById('roster-filters').hidden = false;
}
const whenNear = (el, fn) => {
  if (!el) return;
  if (!('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
  }, { rootMargin: '600px 0px' });
  io.observe(el);
};
whenNear(document.getElementById('elements'), fillElements);
whenNear(rosterEl, buildRoster);
