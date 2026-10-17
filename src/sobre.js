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

// o elenco, agrupado por origem, montado dos próprios dados do jogo
const rosterEl = document.getElementById('roster');
let rosterDone = false;
async function buildRoster() {
  if (rosterDone) return;
  rosterDone = true;
  const { ROSTER } = await import('./characters/index.js');
  document.getElementById('roster-count').textContent = `${ROSTER.length} lutadores jogáveis, agrupados por origem.`;
  const groups = new Map();
  for (const c of ROSTER) {
    if (!groups.has(c.origin)) groups.set(c.origin, []);
    groups.get(c.origin).push(c);
  }
  const frag = document.createDocumentFragment();
  for (const [origin, list] of groups) {
    const g = document.createElement('div');
    g.className = 'group';
    const h = document.createElement('h3');
    h.textContent = origin;
    const box = document.createElement('div');
    box.className = 'fighters';
    for (const c of list) {
      const E = ELEMENTS[c.element];
      const el = E ? E.name : '';
      const col = E ? E.color : '#948a90';
      const s = document.createElement('span');
      s.className = 'fighter';
      s.style.setProperty('--c', col);
      s.innerHTML = `<i aria-hidden="true"></i>${c.name}${el ? ` <small>· ${el}</small>` : ''}`;
      box.appendChild(s);
    }
    g.append(h, box);
    frag.appendChild(g);
  }
  rosterEl.appendChild(frag);
}
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); buildRoster(); }
  }, { rootMargin: '600px 0px' });
  io.observe(rosterEl);
} else buildRoster();
