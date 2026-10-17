// TAMANHO DA TELA. No iPhone/iPad com o jogo INSTALADO (aberto pela tela de início), o iOS às vezes deixa a página com
// o tamanho de antes de girar: em pé ao abrir e deitado depois, a luta ficava cortada (faltava a altura da barra de
// status, ~47 pt, embaixo ou do lado). Aqui o tamanho de verdade vem da própria tela (screen) nesse caso, e as camadas
// de tela cheia (canvas, HUD, telas, controles de toque) são forçadas para ele (classe vp-fix no <html>).
// Fora disso, viewSize() é o innerWidth/innerHeight de sempre.

const UA = navigator.userAgent;
const IOS = /iPhone|iPad|iPod/i.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1);
const standalone = () => navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
  || window.matchMedia('(display-mode: fullscreen)').matches;

function landscape() {
  const o = screen.orientation && screen.orientation.type;
  if (o) return o.startsWith('landscape');
  if (typeof window.orientation === 'number') return Math.abs(window.orientation) === 90;
  return innerWidth > innerHeight;
}

let fixed = null; // { w, h } quando a correção está valendo

export function viewSize() {
  return fixed || { w: innerWidth, h: innerHeight };
}

function measure() {
  fixed = null;
  if (IOS && standalone() && screen.width && screen.height) {
    const long = Math.max(screen.width, screen.height);
    const short = Math.min(screen.width, screen.height);
    const w = landscape() ? long : short;
    const h = landscape() ? short : long;
    // só corrige quando o iOS errou (diferença maior que um arredondamento)
    if (Math.abs(innerWidth - w) > 2 || Math.abs(innerHeight - h) > 2) fixed = { w, h };
  }
  const root = document.documentElement;
  root.classList.toggle('vp-fix', !!fixed);
  if (fixed) {
    root.style.setProperty('--app-w', `${fixed.w}px`);
    root.style.setProperty('--app-h', `${fixed.h}px`);
  }
}

// onChange(): chamado quando o tamanho muda (girar, redimensionar). No iOS o tamanho certo às vezes só chega um pouco
// depois do giro: mede de novo algumas vezes em seguida.
export function watchViewport(onChange) {
  let last = '';
  const run = () => {
    measure();
    const { w, h } = viewSize();
    const key = `${w}x${h}`;
    if (key === last) return;
    last = key;
    onChange();
  };
  const burst = () => { run(); for (const ms of [120, 350, 800]) setTimeout(run, ms); };
  window.addEventListener('resize', burst);
  window.addEventListener('orientationchange', burst);
  if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', burst);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', burst);
  measure();
  last = `${viewSize().w}x${viewSize().h}`;
}
