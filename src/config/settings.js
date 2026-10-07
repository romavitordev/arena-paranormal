import { SUPPORTED_LANGUAGES, initLanguage, setLanguage } from '../i18n/index.js';

// Opções do jogador, salvas no navegador (se o navegador permitir).
const KEY = 'arena-paranormal:settings';

const DEFAULTS = {
  timer: 99, // segundos por round; 0 = infinito
  cpuLevel: 'normal', // easy | normal | hard | veryhard | superhard
  rounds: 2, // rounds para vencer
  moveMode: 'screen', // screen = direções da tela; enemy = ↑ aproxima, ↓ recua, ←/→ orbitam o adversário
  language: 'pt-BR',
};

// opções das configurações de combate (tela antes do cenário)
export const TIMER_OPTIONS = [30, 60, 90, 99, 120, 0];
export const CPU_LEVELS = [
  { id: 'easy', label: 'FÁCIL' },
  { id: 'normal', label: 'NORMAL' },
  { id: 'hard', label: 'DIFÍCIL' },
  { id: 'veryhard', label: 'MUITO DIFÍCIL' },
  { id: 'superhard', label: 'SUPER DIFÍCIL' },
];
export const ROUND_OPTIONS = [1, 2, 3];
export const LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    // versões antigas guardavam só "infiniteTime"
    if (s.infiniteTime) { s.timer = 0; delete s.infiniteTime; }
    if (!TIMER_OPTIONS.includes(s.timer)) s.timer = DEFAULTS.timer;
    if (!CPU_LEVELS.some((l) => l.id === s.cpuLevel)) s.cpuLevel = DEFAULTS.cpuLevel;
    if (!ROUND_OPTIONS.includes(s.rounds)) s.rounds = DEFAULTS.rounds;
    if (!LANGUAGE_OPTIONS.some((l) => l.id === s.language)) s.language = initLanguage();
    else initLanguage(s.language);
    return s;
  } catch {
    const s = { ...DEFAULTS };
    s.language = initLanguage();
    return s;
  }
}

export const timerLabel = (t = SETTINGS.timer) => (t ? `${t}s` : 'INFINITO');
export const cpuLabel = (id = SETTINGS.cpuLevel) => (CPU_LEVELS.find((l) => l.id === id) || CPU_LEVELS[1]).label;
export const languageLabel = (id = SETTINGS.language) => {
  const item = LANGUAGE_OPTIONS.find((l) => l.id === id) || LANGUAGE_OPTIONS[0];
  return `${item.flag} ${item.label}`;
};

// gira uma opção da lista (dir = +1/-1)
export function cycleSetting(name, list, dir = 1) {
  const vals = list.map((v) => (typeof v === 'object' ? v.id : v));
  const i = Math.max(0, vals.indexOf(SETTINGS[name]));
  SETTINGS[name] = vals[(i + dir + vals.length) % vals.length];
  if (name === 'language') setLanguage(SETTINGS[name]);
  saveSettings();
  return SETTINGS[name];
}

export const SETTINGS = load();

export function saveSettings() {
  try {
    localStorage.setItem(KEY, JSON.stringify(SETTINGS));
  } catch {
    /* sem armazenamento: a opção vale só nesta sessão */
  }
}

