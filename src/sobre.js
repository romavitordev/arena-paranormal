// Página SOBRE / BAIXAR (sobre.html): versão atual e o elenco tirados dos próprios dados do jogo.
import { VERSION_LABEL, CHANGELOG } from './config/version.js';
import { ROSTER } from './characters/index.js';

const ELEMENTS = { sangue: 'Sangue', conhecimento: 'Conhecimento', energia: 'Energia', morte: 'Morte', medo: 'Medo' };

const latest = CHANGELOG[0];
document.getElementById('ver').textContent = `${VERSION_LABEL} — ${latest.title}`;

document.getElementById('roster-count').textContent = `${ROSTER.length} lutadores jogáveis, agrupados por origem.`;
const groups = new Map();
for (const c of ROSTER) {
  if (!groups.has(c.origin)) groups.set(c.origin, []);
  groups.get(c.origin).push(c);
}
const roster = document.getElementById('roster');
for (const [origin, list] of groups) {
  const g = document.createElement('div');
  g.className = 'group';
  g.innerHTML = `<h3>${origin}</h3>` + list.map((c) => `<span class="fighter" style="--c:${c.color}">${c.name}<small>${ELEMENTS[c.element] || ''}</small></span>`).join('');
  roster.appendChild(g);
}

// dentro do app instalado (Electron / Capacitor) os botões de download não fazem sentido
const inApp = /Electron/i.test(navigator.userAgent) || !!window.Capacitor;
if (inApp) {
  document.getElementById('no-app').classList.remove('hidden');
  document.querySelector('.cards').classList.add('hidden');
}
// destaca o download do aparelho de quem está vendo
const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
document.getElementById(mobile ? 'dl-android' : 'dl-pc').classList.add('suggested');
