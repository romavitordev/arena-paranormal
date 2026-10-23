import { SUPPORTED_LANGUAGES, initLanguage, setLanguage, t } from '../i18n/index.js';

// Opções do jogador, salvas no navegador (se o navegador permitir).
const KEY = 'arena-paranormal:settings';

const DEFAULTS = {
  timer: 150, // segundos por round (cabe a vida de 1500: 1,5× os antigos 99 s); 0 = infinito
  cpuLevel: 'normal', // easy | normal | hard | veryhard | superhard
  rounds: 2, // rounds para vencer
  language: 'pt-BR',
  volume: 100, // % do volume GERAL (0 = mudo)
  volSfx: 100, // % dos efeitos da luta
  volUi: 100, // % dos sons dos menus
  volHum: 100, // % do zumbido da Carga de Poder
  reduceFx: false, // conforto/fotossensibilidade: flashes de tela e tremor de câmera bem mais fracos
  fightLines: true, // falas curtas no meio da luta (provocações, vida baixa); as de entrada e vitória continuam
  graphics: 'auto', // QUALIDADE GRÁFICA: auto (baixa no celular, alta no PC) | high | medium | low
};

// opções das configurações de combate (tela antes do cenário)
export const TIMER_OPTIONS = [45, 90, 120, 150, 180, 0]; // proporcionais à vida 1500 (antes 30–120 com vida 1000)
export const CPU_LEVELS = [
  { id: 'easy', label: 'FÁCIL' },
  { id: 'normal', label: 'NORMAL' },
  { id: 'hard', label: 'DIFÍCIL' },
  { id: 'veryhard', label: 'MUITO DIFÍCIL' },
  { id: 'superhard', label: 'SUPER DIFÍCIL' },
];
export const ROUND_OPTIONS = [1, 2, 3];
export const VOLUME_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
export const FX_OPTIONS = [false, true];
export const LINES_OPTIONS = [true, false];
export const GFX_OPTIONS = ['auto', 'high', 'medium', 'low'];

// QUALIDADE GRÁFICA: o que cada nível liga. Só mexe no DESENHO (resolução, antialias, sombras, luzes pontuais) — nada
// que mude a luta ou o sorteio dos efeitos (o online depende de os dois lados sortearem igual).
const GFX_PROFILES = {
  // maxFps: celular de 90/120 Hz desenhava o dobro de quadros, esquentava e o sistema derrubava o desempenho
  high: { pixelRatio: 2, antialias: true, shadows: true, softShadows: true, shadowSize: 2048, pointLights: 8, maxFps: 0, rimLights: 8 },
  medium: { pixelRatio: 1.5, antialias: false, shadows: true, softShadows: false, shadowSize: 1024, pointLights: 2, maxFps: 60, rimLights: 2 },
  low: { pixelRatio: 1, antialias: false, shadows: false, softShadows: false, shadowSize: 512, pointLights: 1, maxFps: 60, rimLights: 0 },
};
// celular / tablet (toque como ponteiro principal) ou pouca memória → baixa; o resto → alta
let _auto = null; // o aparelho não muda durante a sessão: decide uma vez (o laço de quadros pergunta sempre)
export function autoGraphics() {
  if (_auto) return _auto;
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const lowMem = typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory <= 4;
  _auto = coarse || lowMem ? 'low' : 'high';
  return _auto;
}
export const gfxLevel = (v = SETTINGS.graphics) => (v === 'auto' ? autoGraphics() : v);
export const gfxProfile = (v) => GFX_PROFILES[gfxLevel(v)] || GFX_PROFILES.high;
export const LANGUAGE_OPTIONS = SUPPORTED_LANGUAGES;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    // versões antigas guardavam só "infiniteTime"
    if (s.infiniteTime) { s.timer = 0; delete s.infiniteTime; }
    delete s.moveMode; // opção "relativo ao inimigo" removida: o movimento é sempre pelas direções da tela
    if (!TIMER_OPTIONS.includes(s.timer)) s.timer = DEFAULTS.timer;
    if (!CPU_LEVELS.some((l) => l.id === s.cpuLevel)) s.cpuLevel = DEFAULTS.cpuLevel;
    if (!ROUND_OPTIONS.includes(s.rounds)) s.rounds = DEFAULTS.rounds;
    // volumes: 0..100 (a barra arrastável grava qualquer valor; as versões antigas gravavam de 10 em 10)
    for (const k of ['volume', 'volSfx', 'volUi', 'volHum']) if (!(Number.isFinite(s[k]) && s[k] >= 0 && s[k] <= 100)) s[k] = DEFAULTS[k];
    s.reduceFx = !!s.reduceFx;
    s.fightLines = s.fightLines !== false;
    if (!GFX_OPTIONS.includes(s.graphics)) s.graphics = DEFAULTS.graphics;
    if (!LANGUAGE_OPTIONS.some((l) => l.id === s.language)) s.language = initLanguage();
    else initLanguage(s.language);
    return s;
  } catch {
    const s = { ...DEFAULTS };
    s.language = initLanguage();
    return s;
  }
}

export const volumeLabel = (v = SETTINGS.volume) => (v ? `${v}%` : '🔇');
export const gfxLabel = (v = SETTINGS.graphics) => (v === 'auto' ? `${t('opt.gfx.auto')} (${t('opt.gfx.' + autoGraphics())})` : t('opt.gfx.' + v));
export const fxLabel = (v = SETTINGS.reduceFx) => t(v ? 'opt.fx.reduced' : 'opt.fx.normal');
export const timerLabel = (v = SETTINGS.timer) => (v ? `${v}s` : t('settings.timer.infinite'));
export const cpuLabel = (id = SETTINGS.cpuLevel) => t('cpu.' + (CPU_LEVELS.find((l) => l.id === id) || CPU_LEVELS[1]).id);
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

