import * as THREE from 'three';
import { InputManager } from './input/InputManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { HUD } from './ui/HUD.js';
import { HomeScreen, BattleConfigScreen, VictoryScreen, MODES, SelectScreen, MenuScreen, StageSelectScreen, LoadingScreen, CommandsScreen, ChangelogScreen, LanScreen, TowerScreen, TowerSelectScreen, NET_UI } from './ui/Screens.js';
import { buildTower, pickBoss, towerFloorCount, isTowerUnlocked, bestDifficulty, saveTowerClear, TOWERS, TOWER_DIFFICULTIES, BOSS_BUFF, VILLAINS } from './game/tower.js';
import { TowerStage } from './ui/towerStage.js';
import { getForm } from './characters/forms/index.js';
import { NetSession, Lobby, packInput, unpackInput, seededRandom } from './net/NetSession.js';
import { setLabelNetplay } from './ui/labels.js';
import { renderPortraits } from './ui/portraits.js';
import { renderArenaThumbs } from './ui/arenaThumbs.js';
import { victoryLine } from './config/dialogues.js';
import { preloadModels } from './models/index.js';
import { TitleStage } from './ui/titleStage.js';
import { loadLearned } from './ai/learner.js';
import { ROSTER } from './characters/index.js';
import { validatePassives } from './combat/passives.js';
import { Match } from './game/Match.js';
import { CpuController } from './ai/CpuController.js';
import { ARENAS, ARENA_ORDER, DEFAULT_ARENA, preloadArenas } from './arena/index.js';
import { SETTINGS, cycleSetting, TIMER_OPTIONS, timerLabel, cpuLabel, LANGUAGE_OPTIONS, languageLabel } from './config/settings.js';
import { TutorialMode } from './ui/Tutorial.js';
import { VERSION } from './config/version.js';
import { t, tAlert } from './i18n/index.js';
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
// aprendizado da CPU (Super Difícil): o que vem com o jogo + o que este navegador já aprendeu
loadLearned(import.meta.env.BASE_URL).catch(() => {});
Promise.all([preloadModels(), preloadArenas()])
  .catch((e) => console.warn(e))
  .then(() => {
    Object.assign(portraits, renderPortraits([...ROSTER, ...VILLAINS.map(getForm)], renderer)); // + os vilões das TORRES
    booted = true;
    // não trava a tela inicial: gera os previews no quadro seguinte
    setTimeout(() => Object.assign(arenaThumbs, renderArenaThumbs(renderer)), 50);
  });

// fundo animado dos menus: lutadores em 3D, círculo ritual e cinzas (ui/titleStage.js); montado depois que os modelos
// carregam
const titleStage = new TitleStage(ROSTER);
const menuCam = titleStage.cam;

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

const timeLabel = () => t('opt.time', { v: timerLabel() });
const langLabel = () => t('opt.lang', { v: languageLabel() });

function setScreen(state, screen) {
  game.uiSeq = ((game.uiSeq || 0) + 1) & 15; // toques online de uma tela que já saiu são descartados (netTaps)
  if (game.screen) game.screen.dispose();
  game.screen = screen;
  if (screen && screen.el) screen.el.classList.add('screen-enter');
  game.state = state;
}

function setOverlay(state, overlay) {
  game.uiSeq = ((game.uiSeq || 0) + 1) & 15;
  if (game.overlay) game.overlay.dispose();
  game.overlay = overlay;
  if (overlay && overlay.el) overlay.el.classList.add('screen-enter');
  game.state = state;
}

// Tela inicial com o menu aberto (voltar da seleção, das opções ou da pausa)
function toMainMenu() {
  if (game.net) { endNet('Partida online encerrada.', true); return; }
  endMatch();
  setOverlay(null, null);
  closeTowerStage();
  game.towerRun = null;
  setScreen('mainmenu', new HomeScreen(screens, { portraits, menu: true, touchOnly: touchDevice }));
}

// index: opção já selecionada (ao trocar o idioma a tela é remontada no novo idioma, sem sair da linha IDIOMA)
function toOptions(index = 0) {
  const scr = new MenuScreen(screens, {
    title: t('menu.options'),
    audio,
    clear: false,
    options: [
      { id: 'time', label: timeLabel },
      { id: 'lang', label: langLabel },
      { id: 'back', label: () => t('ui.back') },
    ],
  });
  scr.index = index;
  scr.render();
  setScreen('options', scr);
  if (index) scr.el.classList.remove('screen-enter'); // troca de idioma: sem a animação de entrada
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
    renderer, audio, input, hud, mode: game.mode.kind === 'tutorial' ? 'training' : game.mode.kind === 'tower' ? 'cpu' : game.mode.kind, teams: game.mode.team ? game.pick.teams : null, dialogue: game.mode.kind !== 'training' && game.mode.kind !== 'tutorial',
    defs: [p1, p2],
    arenaId: game.arenaId || DEFAULT_ARENA,
    onEnd: ({ winner, def, loser, team }) => {
      // tempo contado pela simulação (e não pelo relógio): na LAN a tela de vitória abre no mesmo quadro nos dois
      match.world.after(0.4, () => {
        if (game.state !== 'fight' || game.match !== match) return;
        // quem terminou a luta fica no meio; o resto da equipe dos lados
        const lineup = team ? [def, ...team.filter((d) => d.id !== def.id)] : [def];
        match.world.showVictoryLineup(lineup);
        hud.show(false);
        setOverlay('result', new VictoryScreen(screens, {
          winner: def, loser, slot: MODES[game.mode.kind].slots[winner], team: team ? lineup : null,
          line: victoryLine(def.id, loser.id, loser.name),
          audio,
          options: game.mode.kind === 'tower'
            ? (winner === 0
              ? [{ id: 'tower_next', label: t('tower.next') }, { id: 'tower_quit', label: t('tower.quit') }]
              : [{ id: 'rematch', label: t('tower.retry') }, { id: 'tower_quit', label: t('tower.quit') }])
            : [
              { id: 'rematch', label: t('ui.rematch') },
              { id: 'select', label: t('ui.char_select') },
              { id: 'stage', label: t('ui.stage_select') },
              { id: 'main', label: t('ui.main_menu') },
            ],
        }));
        placeVictoryLabels();
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
  restorePauseController();
  if (game.tutorial) { game.tutorial.dispose(); game.tutorial = null; }
  game.tutorialEnded = false;
  if (game.match) game.match.dispose();
  game.match = null;
  for (const p of input.players) { p.cpu = null; p.setVirtual(null); }
  input.teamMode = false;
  game.pausedBy = 0;
}

function suspendPauseController(owner) {
  if (game.pauseController) return;
  const player = input.players[owner];
  if (!player || (!player.cpu && !player._virtual)) return;
  game.pauseController = { player, cpu: player.cpu, virtual: player._virtual };
  player.cpu = null;
  player.setVirtual(null);
  player._prevHeld = { ...player._prevHeld, start: true };
  player.menu = { up: false, down: false, left: false, right: false };
  player.pressed = {};
}

function restorePauseController() {
  const paused = game.pauseController;
  if (!paused) return;
  paused.player.cpu = paused.cpu;
  paused.player.setVirtual(paused.virtual);
  game.pauseController = null;
}

// Controladores de cada lado conforme o modo
function setupControllers(match) {
  const kind = game.mode.kind;
  const [p1, p2] = input.players;
  p1.cpu = kind === 'cvc' ? new CpuController({ level: SETTINGS.cpuLevel }) : null;
  const floor = kind === 'tower' ? game.towerRun.floors[game.towerRun.floor] : null;
  const level = floor ? floor.level : SETTINGS.cpuLevel; // TORRE: a dificuldade é do andar
  p2.cpu = kind === 'cpu' || kind === 'cvc' || kind === 'tower' ? new CpuController({ level }) : null;
  if (kind === 'training' || kind === 'tutorial') p2.setVirtual({ moveX: 0, moveY: 0, held: {} }); // o alvo fica parado (muda na pausa)
  if (p1.cpu) p1.cpu.attach(match.fighters[0]);
  if (p2.cpu) p2.cpu.attach(match.fighters[1]);
  // TORRE: o vilão do topo vem fortalecido só para essa luta (mais vida, bate mais, apanha menos)
  if (floor && floor.buff) {
    const f = match.fighters[1];
    f.maxHealth = Math.round(f.maxHealth * floor.buff.hp);
    f.health = f.maxHealth;
    const e = f.cpuEdge || { dealt: 1, taken: 1 };
    f.cpuEdge = { dealt: e.dealt * floor.buff.dealt, taken: e.taken * floor.buff.taken };
  }
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

// TORRES: menu das 8 torres → torre em 3D (a câmera sobe até o topo) → lutador (fixo) → dificuldade → andares
function towerArenas() {
  return ARENA_ORDER.filter((id) => ARENAS[id].available);
}

function closeTowerStage() {
  if (game.towerStage) { game.towerStage.dispose(); game.towerStage = null; }
}

function toTowerMenu(index = 0) {
  endMatch();
  setOverlay(null, null);
  closeTowerStage();
  game.towerRun = null;
  const towers = TOWERS.map((tw, i) => {
    const best = bestDifficulty(tw.id);
    return {
      color: tw.color,
      floorCount: towerFloorCount(tw),
      title: tw.gauntlet ? t('tower.babel') : t('tower.name', { n: tw.numeral }),
      villain: tw.boss ? getForm(tw.boss).name : t('tower.random_villain'),
      unlocked: isTowerUnlocked(i),
      best: best ? cpuLabel(best) : null,
    };
  });
  setScreen('towers', new TowerSelectScreen(screens, { towers, index }));
}

// entrou numa torre: sorteia os andares e o vilão desta subida e mostra a câmera subindo
function openTower(index) {
  const tower = TOWERS[index];
  const seed = Date.now();
  const boss = pickBoss(tower, seed);
  game.towerIndex = index;
  game.towerRun = buildTower({ tower, player: null, roster: ROSTER, getForm, arenas: towerArenas(), difficulty: 'normal', seed, boss });
  closeTowerStage();
  game.towerStage = new TowerStage({ color: tower.color, floors: game.towerRun.floors.length - 1 });
  game.towerStage.setFloors(game.towerRun.floors, portraits);
  game.towerStage.setProgress(-1);
  game.towerStage.intro();
  toTowerView('intro');
}

function toTowerView(mode, extra = {}) {
  endMatch();
  setOverlay(null, null);
  const run = game.towerRun;
  const stage = game.towerStage;
  const tower = run.tower;
  const k = tower.bossBuff || 1;
  if (mode === 'map') { stage.setProgress(run.floor); stage.focus(run.floor >= run.floors.length - 1 ? stage.n : run.floor); }
  else if (mode === 'done') { stage.setProgress(run.floors.length, true); stage.focus(null); }
  else if (mode === 'diff') stage.focus(stage.n);
  else if (stage.introDone) stage.focus(null);
  setScreen('towerview', new TowerScreen(screens, {
    mode, run, stage, portraits, cpuLabel,
    difficulties: TOWER_DIFFICULTIES,
    best: bestDifficulty(tower.id),
    buffs: BOSS_BUFF.map((b) => ({ hp: b.hp * k, dealt: b.dealt * k })),
    ...extra,
  }));
}

// escolheu a dificuldade: monta os andares de novo com ela (mesma semente → mesmos adversários e mesmo vilão)
function startTowerRun(difficulty) {
  const old = game.towerRun;
  game.towerRun = buildTower({ tower: old.tower, player: old.player, roster: ROSTER, getForm, arenas: towerArenas(), difficulty, seed: old.seed, boss: old.boss });
  game.towerStage.setFloors(game.towerRun.floors, portraits);
  toTowerView('map');
}

// venceu o andar: sobe (no topo: guarda a dificuldade zerada e talvez destrave a próxima torre)
function towerWin() {
  const run = game.towerRun;
  run.floor++;
  if (run.floor < run.floors.length) { toTowerView('map'); return; }
  const i = game.towerIndex;
  const nextWasOpen = i + 1 >= TOWERS.length || isTowerUnlocked(i + 1);
  const newBest = saveTowerClear(run.tower.id, run.difficulty);
  const unlockedNext = !nextWasOpen && isTowerUnlocked(i + 1) ? TOWERS[i + 1].numeral : null;
  toTowerView('done', { newBest, unlockedNext });
}

function startTowerFloor() {
  const f = game.towerRun.floors[game.towerRun.floor];
  game.pick = { p1: game.towerRun.player, p2: f.def };
  game.arenaId = f.arenaId;
  startMatch();
}

function toConfig() {
  endMatch();
  setOverlay(null, null);
  setScreen('config', new BattleConfigScreen(screens, { audio, mode: game.mode.kind }));
}

// só quem pausou (game.pausedBy) navega no menu e despausa
function openPause(by = game.pausedBy) {
  game.pausedBy = by;
  suspendPauseController(by);
  audio.stopAllLoops();
  const tut = game.tutorial;
  const tr = !tut && game.match && game.match.training ? game.match.trainingOpts : null;
  setOverlay('pause', new MenuScreen(screens, {
    audio,
    title: tut ? t('menu.tutorial') : tr ? t('menu.training') : t('pause.title'),
    subtitle: tr ? t('pause.training_sub') : t('pause.sub', { n: by + 1 }),
    owner: by,
    options: [
      { id: 'resume', label: t('pause.resume') },
      ...(tut ? [
        { id: 'tut_skip', label: t('pause.tut_skip') },
        { id: 'rematch', label: t('pause.tut_restart') },
      ] : []),
      ...(tr ? [
        { id: 'tr_life', label: () => t('pause.tr_life', { v: t({ regen: 'pause.regen', infinite: 'pause.infinite', normal: 'pause.normal' }[tr.life]) }) },
        { id: 'tr_energy', label: () => t('pause.tr_energy', { v: t(tr.energy ? 'pause.infinite' : 'pause.normal') }) },
        { id: 'tr_cd', label: () => t('pause.tr_cd', { v: t(tr.noCooldown ? 'pause.no_wait' : 'pause.normal_pl') }) },
        { id: 'tr_dummy', label: () => t('pause.tr_dummy', { v: tr.dummy === 'cpu' ? 'CPU' : t(tr.dummy === 'block' ? 'pause.blocking' : 'pause.still') }) },
        { id: 'tr_reset', label: t('pause.tr_reset') },
      ] : []),
      { id: 'commands', label: t('pause.commands') },
      ...(tut ? [] : [{ id: 'time', label: timeLabel }, { id: 'rematch', label: t('pause.restart') }]),
      game.mode.kind === 'tower' ? { id: 'tower_quit', label: t('tower.quit') } : { id: 'select', label: tut ? t('pause.other_char') : t('ui.char_select') },
      { id: 'main', label: t('ui.main_menu') },
    ],
  }));
}

// Atalho de testes: partida completa pelo fluxo real (carregamento, falas, vitória)
//   await __game.devStart({ kind: 'cpu', team: true, picks: [['dante','joui','arthur'], ['kaiser','aghata','gal_sal']], arenaId: 'ruinas' })
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

// Teste do online sem a internet: __game.devNet(sessão já conectada) — ver tests/ (dois navegadores via BroadcastChannel)
game.devNet = (session) => startNet(session);
// Atalho de desenvolvimento: __game.quick('joui', 'gal_sal', true)
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
  if (game.match) game.match.world.layoutVictoryLineup();
  placeVictoryLabels();
});

// nomes da equipe vencedora embaixo de cada modelo (projeta o pé de cada um na tela)
function placeVictoryLabels() {
  const w = game.match && game.match.world;
  if (!w || !w.victoryActors || !game.overlay || !game.overlay.placeLabels) return;
  w.camera.updateMatrixWorld();
  const pts = [];
  for (const a of w.victoryActors) {
    const v = a.rig.root.position.clone().setY(-0.05).project(w.camera);
    pts[a.index] = { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight + 6 };
  }
  game.overlay.placeLabels(pts);
}

const clock = new THREE.Clock();
function frame() {
  const dt = clock.getDelta();
  if (game.net) netPump(dt);
  else tick(Math.min(1 / 30, dt));
  // tela de vitória: a câmera se mexe (World.updateVictoryCam), os nomes acompanham
  if (game.match && game.match.world && game.match.world.victoryCam) placeVictoryLabels();
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
  // um toque na tela por quadro (código da tela + nº da tela em que foi tocado): ver Screens.js NET_UI
  const tap = game.netTaps && game.netTaps.length ? game.netTaps.shift() : 0;
  return packInput(d.mx, d.my, held, (game.netLoaded ? 1 : 0) | (tap << 1));
}

// aplica os toques que vieram no quadro sincronizado (dos dois jogadores), na tela que está aberta
function applyNetTaps() {
  const target = ['pause', 'result', 'commands'].includes(game.state) ? game.overlay : game.screen;
  input.netFrame.forEach((v, slot) => {
    const t = v.flags >> 1;
    if (!t || !target || !target.netTap) return;
    if ((t >> 10) !== game.uiSeq) return; // tocado numa tela que já fechou
    target.netTap(t & 1023, slot);
  });
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
    netBadge.textContent = wait ? t('net.waiting') : `ONLINE · ${net.names[0]} × ${net.names[1]} · ${net.ping} ms${net.desyncs ? ` · ${t('net.resynced')}` : ''}`;
  }
}

// depuração: um passo de rede manual (aba em segundo plano não roda o requestAnimationFrame)
game.netPumpOnce = () => { if (game.net) netPump(NET_STEP); };

function netToast(text) {
  const old = document.getElementById('net-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'net-toast';
  t.textContent = tAlert(text);
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
  game.netTaps = [];
  game.uiSeq = 0; // os dois aparelhos contam as telas a partir daqui (igual nos dois)
  NET_UI.slot = session.slot;
  NET_UI.send = (code) => { if (game.netTaps.length < 4) game.netTaps.push(code | (game.uiSeq << 10)); };
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
  NET_UI.send = null;
  game.netTaps = null;
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
    const settings = { timer: SETTINGS.timer, rounds: SETTINGS.rounds };
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
      scr.fail(tAlert((err && err.message) || 'Não foi possível conectar.'));
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
  if (touch) touch.sync(game.state, !!input.teamMode, game.state === 'mainmenu' && game.screen.menu, game.state === 'fight' && !!game.match && ['entrance', 'dialogue'].includes(game.match.phase));
  if (game.tutorial) game.tutorial.el.style.display = game.state === 'fight' ? '' : 'none';
  input.update(dt);
  if (input.netFrame) applyNetTaps();
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
      else if (c === 'tower') {
        audio.play('confirm');
        game.mode = { kind: 'tower', cpu: true, team: false };
        toTowerMenu();
      }
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
      else if (c === 'lang') { cycleSetting('language', LANGUAGE_OPTIONS); audio.play('select'); toOptions(game.screen.index); }
      else if (c === 'back') toMainMenu();
      break;
    }
    case 'select': {
      const pick = game.screen.update(input);
      if (pick === 'back') { if (game.mode.kind === 'tower' && game.towerRun) toTowerView('intro'); else toMainMenu(); }
      else if (pick) {
        game.lastSelect = { cursor: [...game.screen.cursor] };
        game.pick = pick;
        if (game.mode.kind === 'tower') { game.towerRun.player = pick.p1; toTowerView('diff'); }
        else if (game.mode.kind === 'tutorial') {
          // tutorial: direto para a luta, sem configuração nem escolha de cenário
          game.arenaId = DEFAULT_ARENA;
          startMatch();
        } else toConfig();
      }
      break;
    }
    case 'towers': {
      const c = game.screen.update(input);
      if (c === 'move') audio.play('select');
      else if (c === 'denied') audio.play('denied');
      else if (c === 'back') { audio.play('select'); toMainMenu(); }
      else if (typeof c === 'number') { audio.play('confirm'); openTower(c); }
      break;
    }
    case 'towerview': {
      const c = game.screen.update(input);
      if (!c) break;
      if (c === 'move') audio.play('select');
      else if (c === 'pick' || c === 'reselect') { audio.play('confirm'); game.lastSelect = null; toSelect(); }
      else if (c.startsWith('diff:')) { audio.play('confirm'); startTowerRun(c.slice(5)); }
      else if (c === 'fight') { audio.play('confirm'); startTowerFloor(); }
      else if (c === 'back' || c === 'quit' || c === 'done') { audio.play('select'); toTowerMenu(game.towerIndex || 0); }
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
        restorePauseController();
        setOverlay('fight', null);
      } else if (choice && choice.startsWith && choice.startsWith('tr_')) {
        const tr = game.match.trainingOpts;
        if (choice === 'tr_life') tr.life = { regen: 'infinite', infinite: 'normal', normal: 'regen' }[tr.life];
        if (choice === 'tr_energy') tr.energy = !tr.energy;
        if (choice === 'tr_cd') tr.noCooldown = !tr.noCooldown;
        if (choice === 'tr_dummy') { tr.dummy = { still: 'block', block: 'cpu', cpu: 'still' }[tr.dummy]; applyDummy(); }
        if (choice === 'tr_reset') { game.match.resetTraining(); restorePauseController(); setOverlay('fight', null); }
        else { audio.play('select'); game.overlay.render(); }
      } else if (choice === 'commands') {
        const defs = game.match.fighters.map((f) => f.def);
        setOverlay('commands', new CommandsScreen(screens, { defs, owner: game.pausedBy }));
      } else if (choice === 'tut_skip') {
        if (game.tutorial) game.tutorial.skip();
        restorePauseController();
        setOverlay('fight', null);
      } else if (choice === 'time') {
        cycleSetting('timer', TIMER_OPTIONS);
        game.overlay.render();
      } else if (choice === 'tower_next') {
        towerWin();
      } else if (choice === 'tower_quit') {
        toTowerMenu(game.towerIndex || 0);
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

// celular deitado: a seleção não tem espaço para os lutadores em 3D no meio (eles apareciam atrás das grades)
const PHONE_LANDSCAPE = window.matchMedia('(max-height: 520px) and (max-width: 760px)');

function render() {
  if (game.match && (game.state === 'fight' || game.state === 'pause' || game.state === 'result' || game.state === 'commands')) {
    game.match.render();
  } else if (game.state === 'towerview' && game.towerStage) {
    game.towerStage.render(renderer);
  } else if (game.state === 'select' && game.screen && game.screen.stage && !PHONE_LANDSCAPE.matches) {
    game.screen.stage.render(renderer); // seleção: lutadores em 3D no centro
  } else {
    if (booted) titleStage.ready();
    titleStage.render(renderer);
  }
}
requestAnimationFrame(frame);
