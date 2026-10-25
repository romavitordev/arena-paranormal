// VERSÃO PARA PC (Electron): abre o jogo numa janela própria, em tela cheia e sem internet.
// O jogo é servido pelo protocolo app:// (e não file://) porque o fetch dos modelos .glb, sons e JSON não funciona
// em file:// — o protocolo privilegiado se comporta como um site normal (https).
const { app, BrowserWindow, protocol, net, shell, Menu, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

// Versão nova instalada por cima da antiga: limpa o cache do navegador e qualquer service worker/cache guardado, para
// os modelos (.glb), sons e imagens virem do pacote novo (na v3.41.0 o Arthur e o Joui antigos continuavam aparecendo).
// localStorage (opções, progresso da Torre, aprendizado da CPU) fica.
async function clearOldCaches() {
  const mark = path.join(app.getPath('userData'), 'versao-cache.txt');
  let last = '';
  try { last = fs.readFileSync(mark, 'utf8').trim(); } catch { /* primeira vez */ }
  if (last === app.getVersion()) return;
  try {
    await session.defaultSession.clearCache();
    await session.defaultSession.clearStorageData({ storages: ['serviceworkers', 'cachestorage'] });
  } catch { /* sem cache para limpar */ }
  try { fs.writeFileSync(mark, app.getVersion()); } catch { /* sem permissão: tenta de novo na próxima */ }
}

const DIST = path.join(__dirname, '..', 'dist');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true,
    backgroundColor: '#0b0910',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  // links externos (GitHub, wiki) abrem no navegador, não dentro do jogo
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('app://')) { event.preventDefault(); shell.openExternal(url); }
  });
  // F11 alterna a tela cheia
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); event.preventDefault(); }
  });
  win.loadURL('app://jogo/index.html');
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  await clearOldCaches();
  protocol.handle('app', (request) => {
    let { pathname } = new URL(request.url);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.normalize(path.join(DIST, decodeURIComponent(pathname)));
    if (!file.startsWith(DIST)) return new Response('proibido', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  createWindow();
});

app.on('window-all-closed', () => app.quit());
