// SERVICE WORKER do app instalável (PWA) — este arquivo é um MODELO: o build (vite.config.js, pwaPlugin) troca
// __VERSION__ e __SHELL__ e grava o resultado como sw.js na raiz do site.
//  - Instalação: guarda a "casca" do jogo (index.html, scripts e estilos do build, manifesto e ícones): abre sem internet.
//  - Modelos, cenários, sons e imagens: guardados na primeira vez que o jogo usa (não baixa os ~57 MB de uma vez no
//    celular); depois vêm do aparelho. Os scripts do build mudam de nome a cada versão, mas os de public/ (modelos .glb,
//    sons, imagens) NÃO — por isso o cache deles também leva a versão: versão nova apaga o antigo e baixa de novo o que
//    for usado (na v3.41.0 o Arthur e o Joui novos não apareciam para quem já tinha o jogo guardado).
//  - A página (index.html) e o aprendizado da CPU vêm primeiro da rede (versão nova chega na hora); sem rede, do aparelho.
//  - Versão nova: o sw.js muda, instala a casca nova e apaga o que era da versão anterior.
const VERSION = '__VERSION__';
const SHELL = __SHELL__;
const CACHE = `arena-${VERSION}`;
const RUNTIME = `arena-arquivos-${VERSION}`;
const FONTS = 'arena-fontes';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('arena-') && k !== CACHE && k !== RUNTIME && k !== FONTS) await caches.delete(k);
    await self.clients.claim();
  })());
});

const networkFirst = async (req, key = CACHE) => {
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(key)).put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await caches.match(req, { ignoreSearch: req.mode === 'navigate' });
    if (hit) return hit;
    if (req.mode === 'navigate') { const home = await caches.match('./index.html'); if (home) return home; }
    throw err;
  }
};

const cacheFirst = async (req, key) => {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') (await caches.open(key)).put(req, res.clone());
  return res;
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // fontes do Google: guardadas no aparelho
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') { e.respondWith(cacheFirst(req, FONTS)); return; }
  if (url.origin !== self.location.origin) return; // corretor das salas online, GitHub etc.: direto na rede
  const path = url.pathname;
  if (req.mode === 'navigate' || path.endsWith('/ai/learned.json') || path.endsWith('.webmanifest')) { e.respondWith(networkFirst(req)); return; }
  e.respondWith(cacheFirst(req, /\/assets\//.test(path) ? CACHE : RUNTIME));
});
