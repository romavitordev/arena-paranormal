// Textos da INTERFACE (menus, HUD, pausa, online). Os 13 arquivos têm exatamente as mesmas chaves (teste em
// tests/). Conteúdo dos personagens, falas e novidades continuam em português.
import ptBR from './locales/pt-BR.js';
import ptPT from './locales/pt-PT.js';
import en from './locales/en.js';
import es from './locales/es.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import it from './locales/it.js';
import ru from './locales/ru.js';
import zh from './locales/zh.js';
import ja from './locales/ja.js';
import ko from './locales/ko.js';
import tr from './locales/tr.js';
import pl from './locales/pl.js';

export const SUPPORTED_LANGUAGES = [
  { id: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { id: 'pt-PT', label: 'Português (Portugal)', flag: '🇵🇹' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'it', label: 'Italiano', flag: '🇮🇹' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'zh', label: '中文', flag: '🇨🇳' },
  { id: 'ja', label: '日本語', flag: '🇯🇵' },
  { id: 'ko', label: '한국어', flag: '🇰🇷' },
  { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { id: 'pl', label: 'Polski', flag: '🇵🇱' },
];

export const LOCALES = { 'pt-BR': ptBR, 'pt-PT': ptPT, en, es, de, fr, it, ru, zh, ja, ko, tr, pl };

const DEFAULT_LANG = 'pt-BR';
let currentLang = DEFAULT_LANG;
const listeners = new Set();

export function detectBrowserLanguage() {
  if (typeof navigator === 'undefined' || !navigator.language) return DEFAULT_LANG;
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('pt-br')) return 'pt-BR';
  if (nav.startsWith('pt')) return 'pt-PT';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('en')) return 'en';
  if (nav.startsWith('de')) return 'de';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('it')) return 'it';
  if (nav.startsWith('ru')) return 'ru';
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('ja')) return 'ja';
  if (nav.startsWith('ko')) return 'ko';
  if (nav.startsWith('tr')) return 'tr';
  if (nav.startsWith('pl')) return 'pl';
  return DEFAULT_LANG;
}

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.some((l) => l.id === lang)) return;
  if (currentLang === lang) return;
  currentLang = lang;
  try {
    localStorage.setItem('arena-paranormal:lang', lang);
  } catch {
    /* sem persistência */
  }
  for (const fn of listeners) {
    try { fn(currentLang); } catch (e) { console.warn('i18n listener error', e); }
  }
}

export function onLanguageChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initLanguage(preferred) {
  let lang = preferred;
  if (!lang) {
    try {
      lang = localStorage.getItem('arena-paranormal:lang');
    } catch {
      lang = null;
    }
  }
  if (!lang || !SUPPORTED_LANGUAGES.some((l) => l.id === lang)) {
    lang = detectBrowserLanguage();
  }
  currentLang = lang;
  return currentLang;
}

export function t(key, params = {}) {
  const dict = LOCALES[currentLang] || LOCALES[DEFAULT_LANG];
  let text = dict?.[key] ?? LOCALES[DEFAULT_LANG]?.[key] ?? key;
  if (typeof text !== 'string') return key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

// Avisos de combate (Fighter.notify) e mensagens da partida online (netToast, erro da tela ONLINE): o código escreve o texto em pt-BR; os avisos do SISTEMA (errou, recarregando,
// longe demais…) viram a chave combat.* / alert.* de mesmo texto. Nomes de poderes e frases dos personagens não estão
// na tabela e ficam como vieram.
let alertIndex = null;
export function tAlert(text) {
  if (currentLang === DEFAULT_LANG || typeof text !== 'string') return text;
  if (!alertIndex) {
    alertIndex = new Map();
    for (const [k, v] of Object.entries(LOCALES[DEFAULT_LANG])) {
      if (/^(alert|combat|net)\./.test(k) || k === 'lan.code_invalid') { if (!v.includes('{')) alertIndex.set(v, k); }
    }
  }
  const key = alertIndex.get(text);
  if (key) return t(key);
  let m = text.match(/^PRECISA DE (\d+)% DE SANIDADE$/);
  if (m) return t('alert.need_sanity', { n: m[1] });
  m = text.match(/^Versões diferentes do jogo \((.+) na sala, (.+) aí\)\. Atualizem a página\.$/);
  if (m) return t('net.version', { a: m[1], b: m[2] });
  m = text.match(/^(.+): RECARREGANDO$/);
  if (m) return t('combat.cooldown', { name: m[1] });
  return text;
}
