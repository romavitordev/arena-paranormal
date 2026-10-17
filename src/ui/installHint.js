// APP INSTALÁVEL (PWA). registerPWA(): liga o service worker (sw.js, gerado no build) só no site publicado — nunca
// no servidor de desenvolvimento nem dentro dos apps de PC (Electron) e Android (Capacitor), que já guardam o jogo.
// InstallHint: na tela inicial, ensina a instalar — no iPhone/iPad, Safari → Compartilhar → "Adicionar à Tela de
// Início" (a Apple não deixa um botão fazer isso); no Android/Chrome, um botão INSTALAR (beforeinstallprompt).
// Some quando o jogo já está instalado (aberto pela tela de início) e quando a pessoa fecha (fica lembrado).

import { t, onLanguageChange } from '../i18n/index.js';

const UA = navigator.userAgent;
const IN_APP = /Electron/i.test(UA) || !!window.Capacitor;
const IOS = /iPhone|iPad|iPod/i.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1);
const DISMISS_KEY = 'arena_instalar_fechado';

export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches
  || window.matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;

export function registerPWA() {
  if (IN_APP || !import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const base = import.meta.env.BASE_URL;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => { /* sem app instalável: o jogo segue normal */ });
  });
}

// ícone de Compartilhar do Safari (quadrado com a seta para cima)
const SHARE = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M6 11H5v10h14V11h-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export class InstallHint {
  constructor() {
    this.prompt = null;
    let dismissed = false;
    try { dismissed = localStorage.getItem(DISMISS_KEY) === '1'; } catch { /* sem armazenamento */ }
    this.off = IN_APP || isStandalone() || dismissed;
    if (this.off) return;
    this.el = document.createElement('div');
    this.el.id = 'install-hint';
    this.el.setAttribute('role', 'note');
    document.body.appendChild(this.el);
    this.render();
    onLanguageChange(() => this.render());
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); this.prompt = e; this.render(); });
    window.addEventListener('appinstalled', () => this.close(false));
  }

  render() {
    if (!this.el) return;
    const ios = IOS && !this.prompt;
    this.el.innerHTML = ios
      ? `<span>${t('install.ios', { share: SHARE })}</span><button class="ih-x" type="button" aria-label="${t('install.close')}">×</button>`
      : `<span>${t('install.app')}</span><button class="ih-go" type="button">${t('install.button')}</button><button class="ih-x" type="button" aria-label="${t('install.close')}">×</button>`;
    this.el.querySelector('.ih-x').addEventListener('click', (e) => { e.stopPropagation(); this.close(true); });
    const go = this.el.querySelector('.ih-go');
    if (go) {
      go.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!this.prompt) return;
        this.prompt.prompt();
        const r = await this.prompt.userChoice.catch(() => null);
        this.prompt = null;
        if (r && r.outcome === 'accepted') this.close(false);
        else this.render();
      });
    }
    this.canShow = ios || !!this.prompt;
  }

  close(remember) {
    if (remember) { try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* sem armazenamento */ } }
    this.off = true;
    if (this.el) this.el.remove();
    this.el = null;
  }

  // aparece só na tela inicial (título / menu principal)
  sync(state) {
    if (this.off || !this.el) return;
    this.el.classList.toggle('on', this.canShow && (state === 'title' || state === 'mainmenu'));
  }
}
