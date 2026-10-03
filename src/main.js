import * as THREE from 'three';
import { InputManager } from './input/InputManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { HUD } from './ui/HUD.js';
import { HomeScreen, BattleConfigScreen, VictoryScreen, MODES, SelectScreen, MenuScreen, StageSelectScreen, LoadingScreen, CommandsScreen, ChangelogScreen, LanScreen } from './ui/Screens.js';
import { NetSession, Lobby, packInput, unpackInput, seededRandom } from './net/NetSession.js';
import { setLabelNetplay } from './ui/labels.js';
import { renderPortraits } from './ui/portraits.js';
import { renderArenaThumbs } from './ui/arenaThumbs.js';
import { victoryLine } from './config/dialogues.js';
import { preloadModels } from './models/index.js';
import { ROSTER } from './characters/index.js';
import { validatePassives } from './combat/passives.js';
import { Match } from './game/Match.js';
import { CpuController } from './ai/CpuController.js';
import { ARENAS, DEFAULT_ARENA, preloadArenas } from './arena/index.js';
import { SETTINGS, cycleSetting, TIMER_OPTIONS, timerLabel } from './config/settings.js';
import { TutorialMode } from './ui/Tutorial.js';
import { VERSION } from './config/version.js';
import { TouchControls, isTouchDevice } from './ui/touchControls.js';

const touchDevice = isTouchDevice();
document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// Avisa no console se alguma definição de personagem estiver inconsistente
for (const def of ROSTER) for (const p of validatePassives(def)) console.warn(p);

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const input = new InputManager();
const audio = new AudioManager();
const hud = new HUD(document.getElementById('hud'));
const screens = document.getElementById('screens');
// modelos do Blender carregam no início; os retratos são gerados depois
const portraits = {};
const arenaThumbs = {}; // previews dos cenários (gerados depois dos retratos)
let booted = false;
Promise.all([preloadModels(), preloadArenas()])
  .catch((e) => console.warn(e))
  .then(() => {
    Object.assign(portraits, renderPortraits(ROSTER, renderer));
    booted = true;
    // não trava a tela inicial: gera os previews no quadro seguinte
    setTimeout(() => Object.assign(arenaThumbs, renderArenaThumbs(renderer)), 50);
  });

// fundo animado dos menus
const menuScene = new THREE.Scene();
menuScene.background = new THREE.Color(0x0b0910);
const menuCam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
menuCam.position.set(0, 0, 6);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xa46bff, transparent: true, opacity: 0.35 });
const rings = [3, 2.3, 1.5].map((r, i) => {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02 + i * 0.01, 6, 80), ringMat);
  menuScene.add(m);
  return m;
});

const game = {
  state: 'title',
  screen: new HomeScreen(screens, { portraits, touchOnly: touchDevice }),
  overlay: null,
  match: null,
  mode: null, // { cpu: boolean }
  pick: null, // personagens escolhidos
  arenaId: null,
  lastSelect: null,
};
window.__game = game; // depuração / testes
game.input = input;
game.isBooted = () => booted;
game.arenaThumbs = arenaThumbs; // depuração
game.renderer = renderer;

const timeLabel = () => `TEMPO DA LUTA: ${timerLabel()}`;
const moveLabel = () => `MOVIMENTO: ${SETTINGS.moveMode === 'enemy' ? 'RELATIVO AO INIMIGO' : 'DIREÇÕES DA TELA'}`;

function setScreen(state, screen) {
  if (game.screen) game.screen.dispose();
  game.screen = screen;
  game.state = state;
}

function setOverlay(state, overlay) {
  if (game.overlay) game.overlay.dispose();
  game.overlay = overlay;
  game.state = state;
}

// Tela inicial com o menu aberto (voltar da seleção, das opções ou da pausa)
function toMainMenu() {
  if (game.net) { endNet('Partida online encerrada.', true); return; }
  endMatch();
  setOverlay(null, null);
  setScreen('mainmenu', new HomeScreen(screens, { portraits, menu: true, touchOnly: touchDevice }));
}

function toOptions() {
  setScreen('options', new MenuScreen(screens, {
    title: 'OPÇÕES',
    clear: false,
    options: [
      { id: 'time', label: timeLabel },
      { id: 'move', label: moveLabel },
      { id: 'back', label: 'VOLTAR' },
    ],
  }));
}

function toSelect() {
  endMatch();
  setOverlay(null, null);
  setScreen('select', new SelectScreen(screens, { portraits, audio, prev: game.lastSelect, mode: game.mode.kind, team: !!game.mode.team }));
}

function toStage() {
  endMatch();
  setOverlay(null, null);
  setScreen('stage', new StageSelectScreen(screens, { audio, prev: game.arenaId, thumbs: arenaThumbs }));
}

// Tela de carregamento → monta a luta → começa
async function startMatch() {
  endMatch();
  game.netLoaded = null;
  setOverlay(null, null);
  const { p1, p2 } = game.pick;
  const arena = ARENAS[game.arenaId] || ARENAS[DEFAULT_ARENA];
  const loading = new LoadingScreen(screens, { p1, p2, arena, cpu: game.mode.cpu, mode: game.mode.kind, portraits });
  setScreen('loading', loading);
  const t0 = performance.now();
  // quadro de tela (ou 50 ms, se a janela estiver em segundo plano: na LAN o outro jogador não fica esperando)
  const frame = () => new Promise((r) => { requestAnimationFrame(() => r()); setTimeout(r, 50); });
  loading.progress(0.1);
  await frame();
  await frame();
  const match = new Match({
    renderer, audio, input, hud, mode: game.mode.kind === 'tutorial' ? 'training' : game.mode.kind, teams: game.mode.team ? game.pick.teams : null, dialogue: game.mode.kind !== 'training' && game.mode.kind !== 'tutorial',
    defs: [p1, p2],
    arenaId: game.arenaId || DEFAULT_ARENA,
    onEnd: ({ winner, def, loser, team }) => {
      // tempo contado pela simulação (e não pelo relógio): na LAN a tela de vitória abre no mesmo quadro nos dois
      match.world.after(0.4, () => {
        if (game.state !== 'fight' || game.match !== match) return;
        // imagem do vencedor: render 3D na pose de vitória (local)
        const arts = renderPortraits(team || [def], renderer, { w: 520, h: 700, anim: 'victory', animTime: 1.2, full: true, background: false, turn: 0.2 });
        setOverlay('result', new VictoryScreen(screens, {
          winner: def, loser, slot: MODES[game.mode.kind].slots[winner], art: arts[def.id], team, teamArt: arts,
          line: victoryLine(def.id, loser.id),
          options: [
            { id: 'rematch', label: 'REVANCHE' },
            { id: 'select', label: 'SELEÇÃO DE PERSONAGENS' },
            { id: 'stage', label: 'SELEÇÃO DE CENÁRIO' },
            { id: 'main', label: 'MENU PRINCIPAL' },
          ],
        }));
      });
    },
  });
  if (game.net) match.world.netplay = true;
  if (match.ready) await match.ready((k) => loading.progress(0.1 + k * 0.8));
  loading.progress(0.95);
  // compila os shaders antes de mostrar, para não travar no primeiro frame
  renderer.compile(match.world.scene, match.world.camera);
  while (performance.now() - t0 < 1400) {
    loading.progress(Math.min(1, 0.95 + (performance.now() - t0) / 28000));
    await frame();
  }
  loading.progress(1);
  if (game.state !== 'loading') { match.dispose(); return; }
  if (game.net) {
    // LAN: a luta só começa no MESMO quadro nos dois computadores — quando os dois avisarem que carregaram (tick)
    game.netLoaded = match;
    return;
  }
  beginLoadedMatch(match);
}

// carregou: controles, tutorial e a apresentação
function beginLoadedMatch(match) {
  setupControllers(match);
  game.match = match;
  if (game.mode.kind === 'tutorial') {
    // tutorial: sanidade infinita, sem recargas, alvo parado com vida infinita
    Object.assign(match.trainingOpts, { life: 'infinite', energy: true, noCooldown: true, dummy: 'still' });
    game.tutorial = new TutorialMode(document.getElementById('app') || document.body, match);
  }
  setScreen('fight', null);
  match.beginIntro();
}

function endMatch() {
  if (game.tutorial) { game.tutorial.dispose(); game.tutorial = null; }
  game.tutorialEnded = false;
  if (game.match) game.match.dispose();
  game.match = null;
  for (const p of input.players) { p.cpu = null; p.setVirtual(null); }
  input.teamMode = false;
  game.pausedBy = 0;
}

// Controladores de cada lado conforme o modo
function setupControllers(match) {
  const kind = game.mode.kind;
  const [p1, p2] = input.players;
  p1.cpu = kind === 'cvc' ? new CpuController({ level: SETTINGS.cpuLevel }) : null;
  p2.cpu = kind === 'cpu' || kind === 'cvc' ? new CpuController({ level: SETTINGS.cpuLevel }) : null;
  if (kind === 'training' || kind === 'tutorial') p2.setVirtual({ moveX: 0, moveY: 0, held: {} }); // o alvo fica parado (muda na pausa)
  if (p1.cpu) p1.cpu.attach(match.fighters[0]);
  if (p2.cpu) p2.cpu.attach(match.fighters[1]);
}

// comportamento do alvo no treino
function applyDummy() {
  const m = game.match;
  if (!m || !m.training) return;
  const p2 = input.players[1];
  const mode = m.trainingOpts.dummy;
  p2.cpu = mode === 'cpu' ? new CpuController({ level: SETTINGS.cpuLevel }) : null;
  if (p2.cpu) { p2.setVirtual(null); p2.cpu.attach(m.fighters[1]); }
  else p2.setVirtual({ moveX: 0, moveY: 0, held: mode === 'block' ? { block: true } : {} });
}

function toConfig() {
  endMatch();
  setOverlay(null, null);
  setScreen('config', new BattleConfigScreen(screens, { audio, mode: game.mode.kind }));
}

// só quem pausou (game.pausedBy) navega no menu e despausa
function openPause(by = game.pausedBy) {
  game.pausedBy = by;
  audio.stopAllLoops();
  const tut = game.tutorial;
  const tr = !tut && game.match && game.match.training ? game.match.trainingOpts : null;
  setOverlay('pause', new MenuScreen(screens, {
    title: tut ? 'TUTORIAL' : tr ? 'TREINAMENTO' : 'PAUSA',
    subtitle: tr ? 'Ajuste o treino · Select na luta reinicia a posição' : `pausado pelo P${by + 1} — só quem pausou pode continuar`,
    owner: by,
    options: [
      { id: 'resume', label: 'CONTINUAR' },
      ...(tut ? [
        { id: 'tut_skip', label: 'PULAR ESTE PASSO' },
        { id: 'rematch', label: 'RECOMEÇAR O TUTORIAL' },
      ] : []),
      ...(tr ? [
        { id: 'tr_life', label: () => `VIDA DO ALVO: ${{ regen: 'REGENERA', infinite: 'INFINITA', normal: 'NORMAL' }[tr.life]}` },
        { id: 'tr_energy', label: () => `SANIDADE: ${tr.energy ? 'INFINITA' : 'NORMAL'}` },
        { id: 'tr_cd', label: () => `RECARGAS: ${tr.noCooldown ? 'SEM ESPERA' : 'NORMAIS'}` },
        { id: 'tr_dummy', label: () => `ALVO: ${{ still: 'PARADO', block: 'DEFENDENDO', cpu: 'CPU' }[tr.dummy]}` },
        { id: 'tr_reset', label: 'RESETAR POSIÇÃO' },
      ] : []),
      { id: 'commands', label: 'COMANDOS' },
      ...(tut ? [] : [{ id: 'time', label: timeLabel }, { id: 'rematch', label: 'REINICIAR LUTA' }]),
      { id: 'select', label: tut ? 'OUTRO PERSONAGEM' : 'SELEÇÃO DE PERSONAGENS' },
      { id: 'main', label: 'MENU PRINCIPAL' },
    ],
  }));
}

// Atalho de testes: partida completa pelo fluxo real (carregamento, falas, vitória)
//   await __game.devStart({ kind: 'cpu', team: true, picks: [['dante','mascarado','abutre'], ['cineraria','vampira','injustica']], arenaId: 'ruinas' })
game.devStart = async ({ kind = 'cpu', team = false, picks, arenaId = DEFAULT_ARENA }) => {
  const byId = (id) => ROSTER.find((c) => c.id === id);
  const teams = picks.map((l) => (Array.isArray(l) ? l : [l]).map(byId));
  game.mode = { kind, cpu: kind !== 'pvp', team };
  game.pick = { p1: teams[0][0], p2: teams[1][0], teams: team ? teams : null };
  game.arenaId = arenaId;
  setOverlay(null, null);
  if (game.screen) { game.screen.dispose(); game.screen = null; }
  await startMatch();
  return game.match;
};

// Atalho de desenvolvimento: abre a seleção de personagens direto (__game.toSelect('cpu'))
game.toSelect = (kind = 'cpu', team = false) => { game.mode = { kind, cpu: kind !== 'pvp', team }; toSelect(); };

// Atalho de desenvolvimento: __game.quick('mascarado', 'injustica', true)
game.quick = (a, b, cpu = false, arenaId = DEFAULT_ARENA, dialogue = false) => {
  setOverlay(null, null);
  if (game.screen) { game.screen.dispose(); game.screen = null; }
  endMatch();
  game.mode = { kind: cpu ? 'cpu' : 'pvp', cpu };
  game.pick = { p1: ROSTER.find((c) => c.id === a), p2: ROSTER.find((c) => c.id === b) };
  game.arenaId = arenaId;
  const match = new Match({ renderer, audio, input, hud, mode: game.mode.kind, defs: [game.pick.p1, game.pick.p2], arenaId, onEnd: () => {}, dialogue });
  setupControllers(match);
  game.match = match;
  game.state = 'fight';
  match.beginIntro();
  return match;
};

window.addEventListener('pointerdown', () => audio.unlock());
window.addEventListener('keydown', () => audio.unlock());
window.addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  for (const cam of [menuCam, game.match && game.match.world.camera]) {
    if (!cam) continue;
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
  }
});

const clock = new THREE.Clock();
function frame() {
  const dt = clock.getDelta();
  if (game.net) netPump(dt);
  else tick(Math.min(1 / 30, dt));
  render();
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- PARTIDA LAN (ver net/NetSession.js)
const NET_STEP = 1 / 60;
const nativeRandom = Math.random;
let netBadge = null;

// comandos locais de um quadro de rede (o Esc do teclado volta nos menus e só pausa na luta, como fora da LAN)
function packLocal() {
  const d = input.readLocal();
  const held = { ...d.held };
  if (d.escape && game.state !== 'fight') { held.start = false; held.physical = true; }
  return packInput(d.mx, d.my, held, game.netLoaded ? 1 : 0);
}

// resumo do estado da luta para conferir a sincronia
function netHash() {
  const m = game.match;
  let s = game.state + '|';
  if (m && m.fighters) for (const f of m.fighters) s += [f.def.id, f.state, f.pos.x.toFixed(2), f.pos.z.toFixed(2), Math.round(f.health), Math.round(f.energy)].join(',') + ';';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}
function netSnapshot() {
  const m = game.match;
  if (!m || !m.fighters) return null;
  return m.fighters.map((f) => ({ id: f.def.id, p: f.pos.toArray(), v: f.vel.toArray(), yaw: f.yaw, hp: f.health, en: f.energy, dg: f.dodges, cd: { ...f.cooldowns } }));
}
function netApplyFix(snap) {
  const m = game.match;
  if (!snap || !m || !m.fighters) return;
  m.fighters.forEach((f, i) => {
    const s = snap[i];
    if (!s || s.id !== f.def.id) return;
    f.pos.fromArray(s.p);
    f.vel.fromArray(s.v);
    f.yaw = s.yaw;
    f.health = s.hp;
    f.energy = s.en;
    f.dodges = s.dg;
    Object.assign(f.cooldowns, s.cd);
  });
}

function netPump(realDt) {
  const net = game.net;
  if (net.closed) { endNet(net.closeReason || 'A partida LAN terminou.'); return; }
  net.acc = Math.min(net.acc + realDt, 0.2);
  let n = 0;
  while (net.acc >= NET_STEP && n < 6) {
    net.fill(packLocal);
    if (!net.ready()) { net.waiting += realDt; break; }
    net.waiting = 0;
    input.netFrame = net.take().map(unpackInput);
    Math.random = game.simRandom; // a simulação usa o sorteio com semente (igual nos dois computadores)
    try { tick(NET_STEP); } finally { Math.random = nativeRandom; }
    if (net.role === 'guest') while (net.fixes.length) netApplyFix(net.fixes.shift());
    if (game.net) net.afterTick(netHash, netSnapshot);
    net.acc -= NET_STEP;
    n++;
    if (!game.net) return;
  }
  if (netBadge) {
    const wait = net.waiting > 0.4;
    netBadge.classList.toggle('wait', wait);
    netBadge.textContent = wait ? 'ONLINE · AGUARDANDO O OUTRO JOGADOR…' : `ONLINE · ${net.names[0]} × ${net.names[1]} · ${net.ping} ms${net.desyncs ? ' · ressincronizado' : ''}`;
  }
}

// depuração: um passo de rede manual (aba em segundo plano não roda o requestAnimationFrame)
game.netPumpOnce = () => { if (game.net) netPump(NET_STEP); };

function netToast(text) {
  const old = document.getElementById('net-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'net-toast';
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}

// conectou: os dois começam do mesmo estado (seleção de personagens P1 × P2) e daqui em diante andam juntos
function startNet(session) {
  game.net = session;
  game.netSettings = { ...SETTINGS };
  Object.assign(SETTINGS, session.settings || {});
  game.simRandom = seededRandom(session.seed);
  input.netSlot = session.slot;
  input.time = 0;
  for (const p of input.players) {
    p.cpu = null;
    p.setVirtual(null);
    p._prevHeld = {};
    p._prevDir = {};
    p.pressTime = {};
    p.held = {};
    p.pressed = {};
  }
  document.body.classList.add('netplay');
  setLabelNetplay(true);
  hud.names = session.names.slice();
  netBadge = document.createElement('div');
  netBadge.id = 'net-badge';
  document.body.appendChild(netBadge);
  game.mode = { kind: 'pvp', cpu: false, team: false, net: true };
  game.lastSelect = null;
  game.arenaId = null;
  game.pausedBy = 0;
  game.menuGuard = 0;
  audio.play('confirm');
  toSelect();
}

function endNet(reason, byMe = false) {
  const net = game.net;
  game.net = null;
  game.netLoaded = null;
  input.netFrame = null;
  input.netSlot = undefined;
  if (net) { if (byMe) net.leave(); else net.close(); }
  if (game.netSettings) { Object.assign(SETTINGS, game.netSettings); game.netSettings = null; }
  document.body.classList.remove('netplay');
  setLabelNetplay(false);
  hud.names = null;
  if (netBadge) { netBadge.remove(); netBadge = null; }
  if (reason) netToast(reason);
  toMainMenu();
}

// tela ONLINE / LAN (antes de conectar: roda fora da sincronia) + lista de salas abertas (Lobby)
function openOnline() {
  const scr = new LanScreen(screens);
  setScreen('lan', scr);
  if (game.lobby) game.lobby.stop();
  game.lobby = new Lobby({ onRooms: (list) => { if (game.screen === scr) scr.setRooms(list); } });
  game.lobby.start();
}

function leaveOnline() {
  if (game.lanPending) { game.lanPending.close('cancelado'); game.lanPending = null; }
  if (game.lobby) { game.lobby.stop(); game.lobby = null; }
}

function updateLan() {
  const scr = game.screen;
  const c = scr.update(input);
  const cancelPending = () => {
    if (game.lanPending) { game.lanPending.close('cancelado'); game.lanPending = null; }
    if (game.lobby && game.lanRoom) { game.lobby.remove(game.lanRoom); game.lanRoom = null; }
  };
  if (c === 'move') audio.play('select');
  else if (c === 'refresh') { audio.play('select'); if (game.lobby) game.lobby.refresh(); }
  else if (c === 'back') { leaveOnline(); audio.play('select'); toMainMenu(); }
  else if (c === 'cancel') { cancelPending(); audio.play('select'); }
  else if (c && (c.act === 'host' || c.act === 'join')) {
    audio.play('confirm');
    cancelPending();
    const ticket = {};
    game.lanTicket = ticket;
    const settings = { timer: SETTINGS.timer, moveMode: SETTINGS.moveMode, rounds: SETTINGS.rounds };
    const onSession = (s) => { game.lanPending = s; };
    const p = c.act === 'host'
      ? NetSession.host({
        name: scr.name, password: c.password, settings, onSession,
        onCode: (code) => {
          if (game.lanTicket !== ticket || game.screen !== scr) return;
          scr.showCode(code);
          if (c.isPublic && game.lobby) { game.lanRoom = code; game.lobby.announce({ code, name: scr.name, locked: !!c.password }); }
        },
      })
      : NetSession.join(c.code, { name: scr.name, password: c.password, onSession });
    p.then((session) => {
      if (game.lanTicket !== ticket || game.screen !== scr || session.closed) { session.close(); return; }
      game.lanPending = null;
      game.lanRoom = null;
      leaveOnline();
      startNet(session);
    }).catch((err) => {
      if (game.lanTicket !== ticket || game.screen !== scr) return;
      game.lanPending = null;
      if (game.lobby && game.lanRoom) { game.lobby.remove(game.lanRoom); game.lanRoom = null; }
      if (err && err.message === 'cancelado') return;
      scr.fail((err && err.message) || 'Não foi possível conectar.');
    });
  }
}

// Depuração: avança N frames de forma síncrona (útil com a aba em segundo plano)
game.step = (n = 1, dt = 1 / 60) => {
  for (let i = 0; i < n; i++) tick(dt);
  render();
};

// celular/tablet: botões na tela (alimentam o jogador 1)
const touch = touchDevice ? new TouchControls(input) : null;
game.touch = touch;

function tick(dt) {
  if (touch) touch.sync(game.state, !!input.teamMode, game.state === 'mainmenu' && game.screen.menu);
  if (game.tutorial) game.tutorial.el.style.display = game.state === 'fight' ? '' : 'none';
  input.update(dt);
  if (input.anyPressed) audio.unlock();

  switch (game.state) {
    case 'title':
    case 'mainmenu': {
      // a tela inicial é uma só: "pressione start" → menu (B volta para o "pressione start")
      if (!booted && !game.screen.menu) break;
      if (game.menuGuard > 0) { game.menuGuard -= dt; break; }
      const c = game.screen.update(input);
      if (c === 'start') {
        audio.unlock();
        audio.play('confirm');
        game.state = 'mainmenu';
        // versão nova: mostra as NOVIDADES uma vez
        let seen = null;
        try { seen = localStorage.getItem('arena_versao_vista'); } catch { /* sem armazenamento */ }
        if (String(seen) !== String(VERSION)) {
          try { localStorage.setItem('arena_versao_vista', String(VERSION)); } catch { /* sem armazenamento */ }
          setOverlay('news', new ChangelogScreen(screens));
        }
      }
      else if (c === 'news') { audio.play('confirm'); setOverlay('news', new ChangelogScreen(screens)); }
      else if (c === 'lan') { audio.play('confirm'); openOnline(); }
      else if (c === 'back') { audio.play('select'); game.state = 'title'; }
      else if (c === 'move') audio.play('select');
      else if (c && (c.includes(':') || c === 'training' || c === 'tutorial')) {
        audio.play('confirm');
        const [fmt, kind] = c === 'training' || c === 'tutorial' ? ['solo', c] : c.split(':');
        game.mode = { kind, cpu: kind !== 'pvp', team: fmt === 'team' };
        game.lastSelect = null;
        toSelect();
      } else if (c === 'options') {
        audio.play('confirm');
        toOptions();
      }
      break;
    }
    case 'options': {
      const c = game.screen.update(input);
      if (c === 'time') { cycleSetting('timer', TIMER_OPTIONS); audio.play('select'); game.screen.render(); }
      else if (c === 'move') { cycleSetting('moveMode', ['screen', 'enemy']); audio.play('select'); game.screen.render(); }
      else if (c === 'back') toMainMenu();
      break;
    }
    case 'select': {
      const pick = game.screen.update(input);
      if (pick === 'back') toMainMenu();
      else if (pick) {
        game.lastSelect = { cursor: [...game.screen.cursor] };
        game.pick = pick;
        if (game.mode.kind === 'tutorial') {
          // tutorial: direto para a luta, sem configuração nem escolha de cenário
          game.arenaId = DEFAULT_ARENA;
          startMatch();
        } else toConfig();
      }
      break;
    }
    case 'config': {
      const c = game.screen.update(input);
      if (c === 'back') toSelect();
      else if (c === 'go') toStage();
      break;
    }
    case 'stage': {
      const id = game.screen.update(input);
      if (id === 'back') toConfig();
      else if (id) {
        game.arenaId = id;
        startMatch();
      }
      break;
    }
    case 'loading':
      // LAN: começa quando os dois computadores avisaram que carregaram (o aviso viaja junto com os comandos)
      if (game.net && game.netLoaded && input.netFrame && input.netFrame.every((v) => v.flags & 1)) {
        const m = game.netLoaded;
        game.netLoaded = null;
        beginLoadedMatch(m);
      }
      break;
    case 'lan':
      updateLan();
      break;
    case 'fight':
      const pauser = input.players.findIndex((p) => (!p.cpu && p.pressed.start) || (p.humanPressed && p.humanPressed.start && (p.cpu || p._virtual)));
      // treino: Select reinicia a posição
      if (game.match.training && input.players[0].humanPressed && input.players[0].humanPressed.select) game.match.resetTraining();
      if (pauser >= 0 && game.match.phase !== 'over') {
        openPause(pauser);
        break;
      }
      game.match.update(dt);
      if (game.tutorial && game.match.phase === 'fight' && game.tutorial.update(dt) === 'done' && !game.tutorialEnded) {
        game.tutorialEnded = true;
        audio.play('armed');
      }
      break;
    case 'pause':
    case 'result': {
      const choice = game.overlay.update(input);
      if ((choice === 'resume' || choice === 'back') && game.state === 'pause') {
        setOverlay('fight', null);
      } else if (choice && choice.startsWith && choice.startsWith('tr_')) {
        const tr = game.match.trainingOpts;
        if (choice === 'tr_life') tr.life = { regen: 'infinite', infinite: 'normal', normal: 'regen' }[tr.life];
        if (choice === 'tr_energy') tr.energy = !tr.energy;
        if (choice === 'tr_cd') tr.noCooldown = !tr.noCooldown;
        if (choice === 'tr_dummy') { tr.dummy = { still: 'block', block: 'cpu', cpu: 'still' }[tr.dummy]; applyDummy(); }
        if (choice === 'tr_reset') { game.match.resetTraining(); setOverlay('fight', null); }
        else { audio.play('select'); game.overlay.render(); }
      } else if (choice === 'commands') {
        const defs = game.match.fighters.map((f) => f.def);
        setOverlay('commands', new CommandsScreen(screens, { defs, owner: game.pausedBy }));
      } else if (choice === 'tut_skip') {
        if (game.tutorial) game.tutorial.skip();
        setOverlay('fight', null);
      } else if (choice === 'time') {
        cycleSetting('timer', TIMER_OPTIONS);
        game.overlay.render();
      } else if (choice === 'rematch') {
        startMatch();
      } else if (choice === 'select') {
        toSelect();
      } else if (choice === 'stage') {
        toStage();
      } else if (choice === 'main') {
        toMainMenu();
      }
      if (game.state === 'result' && game.match) game.match.update(dt);
      break;
    }
    case 'commands':
      if (game.overlay.update(input) === 'back') openPause();
      break;
    case 'news':
      if (game.overlay.update(input) === 'back') {
        audio.play('select');
        setOverlay('mainmenu', null);
        game.menuGuard = 0.25; // o botão que fechou as novidades não pode valer também no menu
      }
      break;
    default:
      break;
  }
}

function render() {
  if (game.match && (game.state === 'fight' || game.state === 'pause' || game.state === 'result' || game.state === 'commands')) {
    game.match.render();
  } else if (game.state === 'select' && game.screen && game.screen.stage) {
    game.screen.stage.render(renderer); // seleção: lutadores em 3D no centro
  } else {
    const t = clock.elapsedTime;
    rings.forEach((r, i) => { r.rotation.x = t * (0.2 + i * 0.1); r.rotation.y = t * (0.3 - i * 0.07); });
    renderer.render(menuScene, menuCam);
  }
}
requestAnimationFrame(frame);
