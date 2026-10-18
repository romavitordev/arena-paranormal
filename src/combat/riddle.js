import { RIDDLES } from '../config/riddles.js';

// ENIGMA DO CARNIÇAL DA ESFINGE (cânone: "a criatura deixa o alvo diante de um enigma, onde ele deve dar a resposta
// certa ou é devorado"). Durante o enigma o mundo PARA (como uma cinemática, o relógio também): a vítima tem alguns
// segundos para responder com Y / A / B / X (△ × ○ □). Errou ou deixou o tempo acabar → é DEVORADA (vai para dentro das
// costelas, toma dano e cura a Esfinge — o Estômago). Acertou → a Esfinge fica PARALISADA por um tempo e toma dano.
// Sorteio com Math.random: no online a simulação usa o sorteio com semente, então os dois veem o mesmo enigma.
export const RIDDLE = { time: 10, resultTime: 0.9, cpuDelay: [2.6, 5.5], cpuRight: 0.5 };

// ordem dos botões na tela (o losango do controle): Y em cima, X à esquerda, B à direita, A embaixo
export const RIDDLE_KEYS = ['carga', 'ranged', 'physical', 'jump'];
const RECENT_KEY = 'arena.riddles.recent';

function recentSeen() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; }
}

function remember(i) {
  try {
    const r = recentSeen().filter((x) => x !== i);
    r.push(i);
    localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(-Math.floor(RIDDLES.length * 0.7))));
  } catch (e) { /* sem armazenamento: só não lembra entre partidas */ }
}

// escolhe um enigma que ainda não saiu nesta partida (e, fora do online, que não foi visto há pouco)
function pick(world) {
  const used = world.riddlesUsed || (world.riddlesUsed = new Set());
  const recent = world.netplay ? [] : recentSeen();
  let pool = RIDDLES.map((_, i) => i).filter((i) => !used.has(i) && !recent.includes(i));
  if (!pool.length) pool = RIDDLES.map((_, i) => i).filter((i) => !used.has(i));
  if (!pool.length) { used.clear(); pool = RIDDLES.map((_, i) => i); }
  const i = pool[Math.floor(Math.random() * pool.length)];
  used.add(i);
  if (!world.netplay) remember(i);
  return i;
}

export function canRiddle(world, victim) {
  return !world.riddle && !world.cinematic && victim && !['ko', 'grabbed', 'downed', 'launched', 'pulled'].includes(victim.state);
}

export function startRiddle(world, sphinx, victim) {
  if (!canRiddle(world, victim)) return false;
  const idx = pick(world);
  const R = RIDDLES[idx];
  // as quatro respostas embaralhadas nos quatro botões
  const answers = [R.a, ...R.w];
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  const opts = RIDDLE_KEYS.map((key, i) => ({ key, text: answers[i], right: answers[i] === R.a }));
  victim.cancelAction && victim.cancelAction();
  victim.vel && victim.vel.set(0, 0, 0);
  const cpu = !!(victim.input && victim.input.cpu);
  world.riddle = {
    sphinx, victim, idx, q: R.q, opts, t: 0, left: RIDDLE.time, phase: 'ask', chosen: null,
    // a IA "pensa" um pouco e acerta metade das vezes
    cpuAt: cpu ? RIDDLE.cpuDelay[0] + Math.random() * (RIDDLE.cpuDelay[1] - RIDDLE.cpuDelay[0]) : null,
    cpuRight: cpu ? Math.random() < RIDDLE.cpuRight : false,
  };
  // descarta toques que já vinham apertados (o golpe que a pessoa estava dando não vira resposta)
  world.riddle.armed = false;
  world.audio.play('fearGaze', { pitch: 0.7 });
  world.cameraRig.shake(0.2, 0.25);
  world.ui && world.ui.riddle && world.ui.riddle(world.riddle);
  return true;
}

// chamado pelo World enquanto há enigma (o resto da simulação está parado)
export function updateRiddle(world, dt) {
  const r = world.riddle;
  if (!r) return;
  r.t += dt;
  if (r.phase === 'ask') {
    r.left = Math.max(0, RIDDLE.time - r.t);
    let key = null;
    const inp = r.victim.input;
    if (r.cpuAt !== null) {
      if (r.t >= r.cpuAt) {
        const right = r.opts.find((o) => o.right);
        const wrong = r.opts.filter((o) => !o.right);
        key = r.cpuRight ? right.key : wrong[Math.floor(Math.random() * wrong.length)].key;
      }
    } else if (inp) {
      if (!r.armed) r.armed = !RIDDLE_KEYS.some((k) => inp.held && inp.held[k]) || r.t > 0.6;
      else key = RIDDLE_KEYS.find((k) => inp.pressed && inp.pressed[k]) || null;
    }
    if (key || r.left <= 0) {
      const opt = r.opts.find((o) => o.key === key);
      r.chosen = key;
      r.right = !!(opt && opt.right);
      r.phase = 'result';
      r.t = 0;
      world.audio.play(r.right ? 'banner' : 'ko', { volume: 0.6 });
    }
    world.ui && world.ui.riddleTick && world.ui.riddleTick(r);
    return;
  }
  // mostra a resposta certa por um instante e então resolve
  if (r.t >= RIDDLE.resultTime) finishRiddle(world);
  else world.ui && world.ui.riddleTick && world.ui.riddleTick(r);
}

export function finishRiddle(world) {
  const r = world.riddle;
  if (!r) return;
  world.riddle = null;
  world.ui && world.ui.riddle && world.ui.riddle(null);
  const { sphinx, victim } = r;
  // quem respondeu volta livre (o Amedrontar ou o golpe de antes do enigma não continua depois dele)
  if (victim.state === 'stun' || victim.state === 'hitstun') victim.setState('idle');
  if (!sphinx.alive || sphinx.state === 'die' || sphinx.state === 'leave') return;
  if (r.right) sphinx.riddleSolved(victim);
  else sphinx.riddleFailed(victim, r.chosen === null);
}

// fim de round / partida desmontada: some sem efeito
export function cancelRiddle(world) {
  if (!world.riddle) return;
  world.riddle = null;
  world.ui && world.ui.riddle && world.ui.riddle(null);
}
