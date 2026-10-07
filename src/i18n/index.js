import ptBR from './locales/pt-BR.js';
import en from './locales/en.js';
import es from './locales/es.js';

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

const LOCALES = {
  'pt-BR': ptBR,
  'pt-PT': ptBR, // fallback estruturado para variantes
  en,
  es,
};

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
