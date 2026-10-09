import { distXZ } from '../core/util.js';
import { COMBAT } from '../config/combat.js';
import { Episode, stateKey, choose, observePlayer, observePlayerMove, playerMoveRate, playerTendency, saveLearned, noteGame } from './learner.js';

// Adversário controlado pelo computador. Gera o mesmo tipo de entrada que um jogador
// (nada de atalhos internos) e erra de propósito conforme a dificuldade.
//
// Ele olha: distância, vida, sanidade, recargas, posição e o estado do adversário.
//  - vida baixa → joga mais na defensiva (defende/esquiva mais, mantém distância, transcende);
//  - adversário longe → ataque à distância ou aproxima com dash;
//  - adversário atacando → defende, esquiva ou tenta o perfect block;
//  - adversário caído → reposiciona/carrega (caído não toma dano);
//  - adversário defendendo → agarrão.
export const CPU_LEVELS = {
  easy: { think: [0.45, 0.8], block: 0.025, dodge: 0.02, perfect: 0, subst: 0.006, mistake: 0.3, combo: [1, 3], ability: 0.06, special: 0.12, vertical: 0, tech: 0.1, ranged: 0.35, tactics: 0, adapt: 0 },
  normal: { think: [0.25, 0.45], block: 0.06, dodge: 0.05, perfect: 0, subst: 0.015, mistake: 0.15, combo: [2, 4], ability: 0.12, special: 0.22, vertical: 0.25, tech: 0.35, ranged: 0.45, tactics: 0.2, adapt: 0.25 },
  hard: { think: [0.15, 0.3], block: 0.12, dodge: 0.09, perfect: 0.15, subst: 0.03, mistake: 0.07, combo: [3, 5], ability: 0.16, special: 0.3, vertical: 0.5, tech: 0.6, ranged: 0.5, rush: 0.35, tactics: 0.55, adapt: 0.6 },
  veryhard: { think: [0.1, 0.2], block: 0.2, dodge: 0.14, perfect: 0.35, subst: 0.05, mistake: 0.03, combo: [4, 6], ability: 0.2, special: 0.35, vertical: 0.7, tech: 0.85, ranged: 0.5, rush: 0.6, tactics: 0.8, adapt: 0.85 },
  // SUPER DIFÍCIL: a IA inteligente no máximo (reage rápido, sem erros de propósito, pune aberturas, lê o jogador) e
  // APRENDE (learner.js): escolhe entre as ações possíveis pelo que já deu certo em situações parecidas.
  superhard: { think: [0.05, 0.1], block: 0.42, dodge: 0.3, perfect: 0.75, subst: 0.12, mistake: 0, combo: [5, 7], ability: 0.24, special: 0.45, vertical: 0.9, tech: 1, ranged: 0.55, rush: 0.85, smart: true, learn: true, tactics: 1, adapt: 1, edge: { dealt: 1.15, taken: 0.85 } },
};

const rnd = (a, b) => a + Math.random() * (b - a);
const PATTERN_WINDOW = 12;
const ACTIVE_BUFF_TYPES = {
  weaponState: ['weaponState'],
  curseWeapon: ['curse'],
  demonAxe: ['bloodBlade'],
  heavyProtection: ['heavyProtection'],
  healOverTime: ['healing'],
  whisperZone: ['whisperZone'], // Jae: não refaz a Zona dos Sussurros enquanto está dentro de uma
  shadowVeil: ['veil'], // Jae: não some de novo enquanto já está escondida
};

export function canSpendDodge(f, emergency = false) {
  if (!f || f.dodges <= 0 || f.cooldowns.dodge > 0) return false;
  return emergency || f.dodges > COMBAT.substitution.charges + 1;
}

export function abilityUsePrior(a, f, opp, { distance, lowHp, opening, threat, lastAbility } = {}) {
  const selfTarget = SELF_TYPES.includes(a.type);
  if (!selfTarget && (opp.state === 'downed' || opp.isInvulnerable?.())) return 0;
  if (a.hpCost && f.health - a.hpCost < f.maxHealth * 0.2) return 0;
  if (a.ai?.when === 'opening' && !opening) return 0;
  if (a.ai?.when === 'far' && distance < (a.ai.min || 4)) return 0;
  if (a.ai?.when === 'hurt' && !lowHp && f.health >= f.maxHealth * 0.6) return 0;

  const knownBuffs = ACTIVE_BUFF_TYPES[a.type] || (a.type === 'selfBuff' ? [a.buffType] : []);
  if (knownBuffs.some((type) => type && f.findBuff(type))) return 0;
  if (a.type === 'healOverTime' && f.health > f.maxHealth * 0.72) return 0;
  if (a.type === 'heavyProtection' && !threat && !lowHp && f.health > f.maxHealth * 0.6) return 0;
  if (a.type === 'demonAxe' && f.health < f.maxHealth * 0.45) return 0;

  let prior = a.id === lastAbility ? 0.3 : 0.65;
  if (opening && !selfTarget) prior *= 2.5;
  if (opp.state === 'block' && a.guardCrush) prior *= 2;
  if (threat && ['heavyProtection', 'selfBuff'].includes(a.type)) prior *= 2;
  if (lowHp && a.type === 'healOverTime') prior *= 3;
  if (lowHp && a.ai?.when === 'hurt') prior *= 1.5;
  if (distance < 2 && a.range > 4 && !selfTarget) prior *= 0.55;
  return prior;
}

function projectileApproach(p, f) {
  const dx = f.pos.x - p.pos.x;
  const dz = f.pos.z - p.pos.z;
  const along = dx * p.dir.x + dz * p.dir.z;
  const side = Math.abs(dx * p.dir.z - dz * p.dir.x);
  const radius = (p.ability?.radius || 0.5) + (f.radius || 0.5) + 0.35;
  return along >= -1 && along <= 8 && side <= radius ? along : Infinity;
}

export class OpponentPatternMemory {
  constructor() {
    this.events = new Map();
    this.lastState = null;
    this.lastStateTime = 0;
    this.lastStrike = null;
    this.lastAbilityUse = {};
    this.activeMove = null;
  }

  observe(opp, now) {
    let move = null;
    const strike = opp.state === 'attack' && opp.combo && opp.combo.strike;
    const startedStrike = strike && (
      this.lastState !== 'attack' ||
      strike !== this.lastStrike ||
      opp.stateTime + 0.05 < this.lastStateTime
    );
    if (startedStrike) move = `melee:${opp.def.id}:${strike.name || 'physical'}`;

    let abilityMove = null;
    if (opp.state === 'ability' && opp.lastAbilityUse) {
      let latestId = null;
      let latestTime = -Infinity;
      for (const [id, time] of Object.entries(opp.lastAbilityUse)) {
        if (time > latestTime) { latestId = id; latestTime = time; }
        if (time > (this.lastAbilityUse[id] ?? -Infinity)) move = `ability:${opp.def.id}:${id}`;
      }
      if (latestId) abilityMove = `ability:${opp.def.id}:${latestId}`;
    }
    if (!move && opp.state === 'ranged' && this.lastState !== 'ranged') {
      move = `ranged:${opp.def.id}:${opp.def.ranged?.type || 'main'}`;
    }
    if (!move && opp.state === 'specialStart' && this.lastState !== 'specialStart') {
      move = `special:${opp.def.id}:${opp.def.special?.type || 'main'}`;
    }

    this.activeMove = strike
      ? `melee:${opp.def.id}:${strike.name || 'physical'}`
      : abilityMove
        ? abilityMove
        : opp.state === 'ranged'
          ? `ranged:${opp.def.id}:${opp.def.ranged?.type || 'main'}`
          : ['specialStart', 'special'].includes(opp.state)
            ? `special:${opp.def.id}:${opp.def.special?.type || 'main'}`
            : null;

    if (move) {
      const events = (this.events.get(move) || []).filter((time) => now - time <= PATTERN_WINDOW);
      events.push(now);
      this.events.set(move, events);
    }
    this.lastState = opp.state;
    this.lastStateTime = opp.stateTime;
    this.lastStrike = strike;
    this.lastAbilityUse = { ...(opp.lastAbilityUse || {}) };
    return move;
  }

  count(move, now) {
    if (!move) return 0;
    const events = (this.events.get(move) || []).filter((time) => now - time <= PATTERN_WINDOW);
    this.events.set(move, events);
    return events.length;
  }
}

// especial que mata quem usa (Erin, Em Nome do Caos): só vale se a explosão provavelmente derrubar o adversário
function sacrificeOk(f, opp) {
  const sp = f.def.special;
  return !sp || sp.type !== 'kamikaze' || opp.health <= sp.damage * 0.8;
}

// habilidades por comando (△ + ○/□/L2, R2 + △/× e □ + direção do Anfitrião); △ + × fica com a aproximação
const isModAbility = (a) => a.input.startsWith('block+') || a.input.startsWith('ranged+') || (a.input.startsWith('carga+') && a.input !== 'carga+jump');
// tipos que não precisam do adversário perto (buffs, invocações, regras do jogo...)
const SELF_TYPES = ['weaponState', 'blink', 'mistCloud', 'healOverTime', 'hatredTemple', 'shadowClones', 'heavyProtection', 'noiseScreen', 'selfBuff', 'gameRule',
  'chaosRule', 'hostTime', 'hostAudience', 'hostButton', 'orphanGame', 'hostClones', 'whisperZone', 'shadowVeil'];

export class CpuController {
  constructor({ level = 'normal' } = {}) {
    this.fighter = null;
    this.queue = [];
    this.think = 0;
    this.strafe = 1;
    this.holdCharge = 0;
    this.aimHold = 0;
    this.L = CPU_LEVELS[level] || CPU_LEVELS.normal;
    this.episode = null; // aprendizado (Super Difícil)
    this.opponentPatterns = new OpponentPatternMemory();
  }

  attach(fighter) {
    this.fighter = fighter;
    if (this.L.learn && fighter) this.episode = new Episode(fighter.def.id);
    if (fighter) fighter.cpuEdge = this.L.edge || null; // Super Difícil: +15% de dano, −15% de dano recebido
  }

  tap(action, extra = {}, raw) {
    this.queue.push({ t: 0.06, held: { [action]: true, ...extra }, raw }, { t: 0.05, held: {}, raw });
  }

  // aperta o comando de uma habilidade; □ + direção vira a direção em relação ao adversário
  pressAbility(a, toOpp, side) {
    // ocupado (no meio de um golpe): guarda para o primeiro quadro livre
    if (this.fighter && !this.fighter.canAct()) { this.pendingAbility = { a, ttl: 0.9 }; return; }
    this.pressAbilityNow(a, toOpp, side);
  }

  pressAbilityNow(a, toOpp, side) {
    const [modKey, btn] = a.input.split('+'); // 'carga' (△), 'block' (R2) ou 'ranged' (□ + direção)
    if (modKey === 'block') this.queue.push({ t: 0.05, held: { block: true } }, { t: 0.06, held: { block: true, [btn]: true } }, { t: 0.05, held: {} });
    else if (modKey === 'ranged') {
      const move = btn === 'forward' ? toOpp : btn === 'back' ? { x: -toOpp.x, z: -toOpp.z } : side;
      this.queue.push({ t: 0.05, held: {}, move }, { t: 0.06, held: { ranged: true }, move }, { t: 0.05, held: {} });
    } else this.queue.push({ t: 0.05, held: { carga: true, [btn]: true } }, { t: 0.05, held: {} });
  }

  // sequência de golpes; às vezes termina com ↑ (lançador + aéreo) ou ↓ (derruba)
  combo() {
    const L = this.L;
    const n = Math.round(rnd(L.combo[0], L.combo[1]));
    for (let i = 0; i < n; i++) this.tap('physical');
    // estilo Storm: rush △+× antes do finalizador e mais uma sequência (às vezes duas)
    if (L.rush && Math.random() < L.rush) {
      const loops = Math.random() < 0.4 ? 2 : 1;
      for (let k = 0; k < loops; k++) {
        this.queue.push({ t: 0.06, held: { carga: true, jump: true } }, { t: 0.18, held: {} });
        for (let i = 0; i < 3; i++) this.tap('physical');
      }
    }
    if (Math.random() < L.vertical) {
      if (Math.random() < 0.6) {
        this.tap('physical', {}, [0, 1]); // ↑ + ○
        this.queue.push({ t: 0.25, held: {} });
        for (let i = 0; i < 4; i++) { this.tap('physical'); this.queue.push({ t: 0.12, held: {} }); }
      } else {
        this.tap('physical', {}, [0, -1]); // ↓ + ○
      }
    }
  }

  // REGRA DO JOGO (Anfitrião) em vigor: a CPU respeita a regra anunciada (não pula / não defende / não dá dash; parada
  // proibida → anda de lado). O nível mais fácil esquece a regra às vezes.
  produce(dt) {
    const out = this.produceRaw(dt);
    const f = this.fighter;
    const rule = f && f.world && f.world.activeRule;
    if (rule !== this.lastRule) { this.lastRule = rule; this.ruleForgot = rule && this.L.block < 0.2 && Math.random() < 0.3; }
    if (!rule || this.ruleForgot) return out;
    if (rule === 'jump') out.held.jump = false;
    if (rule === 'block') out.held.block = false;
    if (rule === 'dash' && out.held.carga) out.held.jump = false;
    if ((rule === 'still' || rule === 'move') && !out.moveX && !out.moveY) out.moveX = Math.sin(f.world.time * 1.3 || 0) > 0 ? 0.8 : -0.8;
    if (rule === 'attack') { out.held.physical = false; out.held.ranged = false; }
    if (rule === 'turn' && (out.moveX || out.moveY)) {
      // vira a cada pouco mais de 1 s (gira o vetor 90° nos tempos ímpares)
      if (Math.floor((f.world.time || 0) / 1.2) % 2) { const x = out.moveX; out.moveX = -out.moveY; out.moveY = x; }
    }
    if (rule === 'approach') {
      const opp = f.world.opponentOf(f);
      if (opp && distXZ(f.pos, opp.pos) > 5) {
        const b = f.moveBasis();
        const dx = opp.pos.x - f.pos.x;
        const dz = opp.pos.z - f.pos.z;
        const l = Math.hypot(dx, dz) || 1;
        out.moveX = (dx / l) * b.right.x + (dz / l) * b.right.z;
        out.moveY = (dx / l) * b.forward.x + (dz / l) * b.forward.z;
      }
    }
    return out;
  }

  produceRaw(dt) {
    const out = { moveX: 0, moveY: 0, held: {} };
    const f = this.fighter;
    if (!f || !f.world) return out;
    const w = f.world;
    const opp = w.opponentOf(f);
    if (!opp) return out;
    const L = this.L;
    const k = Math.min(2, dt * 60); // probabilidades "por quadro" independentes do fps
    const observedMove = this.opponentPatterns.observe(opp, w.time);
    if (observedMove && opp.input && !opp.input.cpu) observePlayerMove(observedMove);
    if (this.episode) this.learnTick(f, opp, w);

    if (this.queue.length) {
      const q = this.queue[0];
      q.t -= dt;
      Object.assign(out.held, q.held);
      if (q.raw) {
        out.moveX = q.raw[0];
        out.moveY = q.raw[1];
      } else if (q.move) {
        const b = f.moveBasis();
        out.moveX = q.move.x * b.right.x + q.move.z * b.right.z;
        out.moveY = q.move.x * b.forward.x + q.move.z * b.forward.z;
      }
      if (q.t <= 0) this.queue.shift();
      return out;
    }
    if (f.state === 'ko' || f.state === 'intro' || opp.state === 'ko') return out;

    // habilidade escolhida no meio de um golpe: o jogo ignora △/R2 + botão enquanto o lutador não está livre, então a
    // escolha fica guardada e sai no primeiro quadro livre (antes, quase todas se perdiam no meio dos combos)
    if (this.pendingAbility) {
      const pend = this.pendingAbility;
      pend.ttl -= dt;
      if (pend.ttl <= 0 || f.cooldowns[pend.a.id] > 0) this.pendingAbility = null;
      else if (f.canAct()) {
        this.pendingAbility = null;
        const dd = distXZ(f.pos, opp.pos);
        const tx = (opp.pos.x - f.pos.x) / (dd || 1);
        const tz = (opp.pos.z - f.pos.z) / (dd || 1);
        this.pressAbilityNow(pend.a, { x: tx, z: tz }, { x: -tz * this.strafe, z: tx * this.strafe });
        return out;
      }
    }

    // Pacto do Diabo: decide uma vez — com pouca vida aceita mais (o presente cura e enche a sanidade)
    if (f.pactOffer) {
      if (!f.pactOffer.cpuDecided) {
        f.pactOffer.cpuDecided = true;
        const accept = Math.random() < 0.25 + 0.55 * (1 - f.health / f.maxHealth);
        this.queue.push({ t: 0.3 + Math.random() * 0.6, held: {} }, { t: 0.08, held: accept ? { physical: true } : { block: true } }, { t: 0.05, held: {} });
      }
      return out;
    }

    // ---- escapes
    if (f.state === 'hitstun' && f.dodges > 1 && f.cooldowns.substitution <= 0 && Math.random() < L.subst * k) {
      this.tap('dodge');
      return out;
    }
    if (f.state === 'grabbed' && Math.random() < 0.15 * k * (L.tech + 0.2)) {
      this.queue.push({ t: 0.05, held: { block: true, physical: true } }, { t: 0.05, held: {} });
      return out;
    }
    if (f.state === 'downed' && f.stateTime > 0.15 && f.stateTime < 0.5 && !this.techTried) {
      this.techTried = true;
      if (Math.random() < L.tech) {
        this.tap('jump');
        return out;
      }
    }
    if (f.state !== 'downed') this.techTried = false;

    // Arthur: segurando □ para o tiro carregado (mais tempo de mira = mais dano)
    if (this.aimHold > 0) {
      this.aimHold -= dt;
      if (f.state === 'ranged') out.held.ranged = true;
      return out;
    }

    const d = distXZ(f.pos, opp.pos);
    const toOpp = { x: opp.pos.x - f.pos.x, z: opp.pos.z - f.pos.z };
    const len = Math.hypot(toOpp.x, toOpp.z) || 1;
    toOpp.x /= len;
    toOpp.z /= len;
    const side = { x: -toOpp.z * this.strafe, z: toOpp.x * this.strafe };
    const lowHp = f.health < f.maxHealth * 0.3;
    const defensive = lowHp ? 1.8 : 1;

    // Jae no "Shhh..." (quase invisível) ou a CPU SURDA (Zona das Sombras): perde o rastro dela — anda devagar de lado e
    // às vezes se defende no escuro, até ela atacar ou chegar muito perto
    if (((opp.findBuff && opp.findBuff('veil')) || (f.findBuff && f.findBuff('deaf'))) && d > 2.2 && (f.state === 'idle' || f.state === 'charging')) {
      if (Math.random() < 0.025 * k) {
        this.queue.push({ t: 0.4, held: { block: true } }, { t: 0.04, held: {} });
        return out;
      }
      const b = f.moveBasis();
      out.moveX = 0.35 * (side.x * b.right.x + side.z * b.right.z);
      out.moveY = 0.35 * (side.x * b.forward.x + side.z * b.forward.z);
      return out;
    }

    // adversário preparando o especial: um tiro pode interromper (quanto mais difícil, mais a CPU tenta)
    if (opp.state === 'specialStart' && !this.triedInterrupt && (f.state === 'idle' || f.state === 'charging')) {
      this.triedInterrupt = true;
      if (f.cooldowns.ranged <= 0 && Math.random() < 1 - this.L.mistake * 2.5) { this.tap('ranged'); return out; }
    }
    if (opp.state !== 'specialStart') this.triedInterrupt = false;
    // granada de luz da Supernova (Erin) caindo perto: sai de baixo esquivando, ou cobre os olhos defendendo
    const lob = opp.threatLob;
    if (lob && lob !== this.readLob && lob.dur - lob.t <= 0.3 && Math.hypot(f.pos.x - lob.target.x, f.pos.z - lob.target.z) < 3 && f.onGround && (f.state === 'idle' || f.state === 'charging' || f.state === 'block')) {
      this.readLob = lob;
      if (Math.random() < Math.min(0.92, (L.block + L.dodge) * 2)) {
        if (canSpendDodge(f)) this.queue.push({ t: 0.06, held: { dodge: true }, move: side }, { t: 0.05, held: {} });
        else this.queue.push({ t: 0.6, held: { block: true } }, { t: 0.04, held: {} });
        return out;
      }
    }
    // especial avisado (sigilo no chão / mira): perto do fim do aviso, esquiva para o lado ou defende
    const tg = opp.pendingSpecial && opp.pendingSpecial.tg;
    if (tg && tg !== this.readTelegraph && tg.cfg.time - tg.t <= 0.35 && f.onGround && (f.state === 'idle' || f.state === 'charging' || f.state === 'block')) {
      this.readTelegraph = tg;
      if (Math.random() < Math.min(0.92, (L.block + L.dodge) * 2)) {
        if (canSpendDodge(f)) this.queue.push({ t: 0.06, held: { dodge: true }, move: side }, { t: 0.05, held: {} });
        else this.queue.push({ t: 0.6, held: { block: true } }, { t: 0.04, held: {} });
        return out;
      }
    }

    if (this.holdCharge > 0) {
      this.holdCharge -= dt;
      out.held.carga = true;
      // vida baixa (ou indo para a Transformação): carrega andando para longe
      if (lowHp || f.canTransform()) {
        const b = f.moveBasis();
        out.moveX = -toOpp.x * b.right.x + -toOpp.z * b.right.z;
        out.moveY = -toOpp.x * b.forward.x + -toOpp.z * b.forward.z;
      }
      return out;
    }

    // ---- níveis táticos: punem aberturas e saem do caminho dos projéteis
    if ((L.smart || L.tactics >= 0.45) && (f.state === 'idle' || f.state === 'charging') && f.onGround) {
      const punishChance = L.smart ? 0.55 : Math.max(0, L.tactics - 0.35) * 0.55;
      if (d < 2.4 && this.aiOk({ ai: { when: 'opening' } }, d, opp, lowHp) && opp.state !== 'block' && Math.random() < punishChance * k) {
        this.combo();
        return out;
      }
      const shot = w.projectiles.list.find((p) => p.owner === opp && projectileApproach(p, f) < 4.5);
      const evadeChance = L.smart ? 0.45 : L.tactics * 0.3;
      if (shot && canSpendDodge(f, projectileApproach(shot, f) < 1.5) && Math.random() < evadeChance * k) {
        this.queue.push({ t: 0.06, held: { dodge: true }, move: side }, { t: 0.05, held: {} });
        return out;
      }
    }

    // ---- reações defensivas
    if ((f.state === 'idle' || f.state === 'charging') && f.onGround) {
      const incoming = w.projectiles.list
        .filter((p) => p.owner === opp)
        .map((p) => projectileApproach(p, f))
        .filter((approach) => approach < 4.5)
        .sort((a, b) => a - b)[0];
      if (incoming !== undefined && canSpendDodge(f, incoming < 1.5) && Math.random() < L.dodge * defensive * k) {
        this.queue.push({ t: 0.06, held: { dodge: true }, move: side }, { t: 0.05, held: {} });
        return out;
      }
      const threat = (opp.state === 'attack' || opp.state === 'dashing') && d < 3;
      // Super Difícil: quem costuma atacar perto faz a CPU defender mais (perfil aprendido dos jogadores)
      const activeMove = this.opponentPatterns.activeMove;
      const repeated = this.opponentPatterns.count(activeMove, w.time);
      const adapt = Math.min(0.75, Math.max((repeated - 1) * 0.18, playerMoveRate(activeMove) * 1.5)) * L.adapt;
      const read = (L.smart ? 0.6 + playerTendency(d, 'atk') * 1.6 : 1) + adapt;
      if (threat) {
        // perfect block: aperta a defesa bem perto do impacto
        const nearImpact = opp.state === 'attack' && opp.combo && opp.combo.windows && opp.stateTime > opp.combo.windows[0][0] - 0.08 && opp.stateTime < opp.combo.windows[0][0];
        if (nearImpact && Math.random() < Math.min(0.9, L.perfect * read)) {
          this.queue.push({ t: 0.3, held: { block: true } }, { t: 0.04, held: {} });
          return out;
        }
        if (Math.random() < L.block * defensive * read * k) {
          this.queue.push({ t: rnd(0.35, 0.7), held: { block: true } }, { t: 0.04, held: {} });
          return out;
        }
        if (canSpendDodge(f) && Math.random() < L.dodge * 0.6 * defensive * k) {
          this.queue.push({ t: 0.06, held: { dodge: true }, move: side }, { t: 0.05, held: {} });
          return out;
        }
      }
    }

    // invocações FRACAS do adversário por perto (Zumbi fraco, clones do Trinitá): limpa antes de voltar a ele
    if ((f.state === 'idle' || f.state === 'charging') && f.onGround && w.hostileNpcs) {
      let prey = null;
      let best = 5;
      for (const n of w.hostileNpcs(f)) {
        if (!n.alive || n.state === 'rise' || n.state === 'die' || n.state === 'leave' || !(n.isClone || n.maxHp <= 120)) continue;
        const dn = distXZ(f.pos, n.pos);
        if (dn < best && (dn < d - 1 || d > 4)) { best = dn; prey = n; }
      }
      if (prey && Math.random() < 0.5 * k * (1 - L.mistake)) {
        if (best <= 1.9) this.tap('physical');
        else {
          const lx = prey.pos.x - f.pos.x;
          const lz = prey.pos.z - f.pos.z;
          const ln = Math.hypot(lx, lz) || 1;
          this.queue.push({ t: 0.18, held: {}, move: { x: lx / ln, z: lz / ln } });
        }
        return out;
      }
    }

    this.think -= dt;
    if (this.think <= 0) {
      this.think = rnd(L.think[0], L.think[1]);
      if (Math.random() < 0.15) this.strafe *= -1;
      const r = Math.random();
      const def = f.def;
      if (L.learn) return this.decideLearned(out, f, opp, d, lowHp, side) || this.move(out, f, d, lowHp, toOpp, side);
      // erros de propósito: hesita, pula à toa ou ataca no vazio
      if (Math.random() < L.mistake) {
        const m = Math.random();
        if (m < 0.3 && f.onGround) this.tap('jump');
        else if (m < 0.55 && d > 3) this.tap('physical');
        return out;
      }
      // adversário caído: quem tem golpe no chão (Lírio) aproveita uma vez; os outros reposicionam ou carregam
      const G = def.melee && def.melee.ground;
      if (opp.state === 'downed' && G && !opp.otgTaken && opp.invuln <= 0 && d < G.range + 0.9 && Math.random() < 0.7) {
        this.tap('physical');
        return out;
      }
      if (opp.state === 'downed') {
        if (f.energy < 80 && d > 3) this.holdCharge = rnd(0.4, 0.8);
        return out;
      }
      // batalha em equipe: às vezes TROCA de personagem (vida baixa troca mais)
      if (f.assists && f.cooldowns.switch <= 0 && r < (lowHp ? 0.05 : 0.015)) {
        const k3 = f.assists.findIndex((a) => !a.active);
        if (k3 >= 0) {
          this.queue.push({ t: 0.06, held: { [k3 ? 'switch2' : 'switch1']: true } }, { t: 0.05, held: {} });
          return out;
        }
      }
      // batalha em equipe: chama uma assistência pronta (parado = ataque; andando = apoio)
      if (f.assists && r < L.ability * 0.6) {
        const k2 = f.assists.findIndex((a) => a.ready);
        if (k2 >= 0) {
          const moving = lowHp || Math.random() < 0.4;
          this.queue.push({ t: 0.06, held: { [k2 ? 'assist2' : 'assist1']: true }, move: moving ? side : null }, { t: 0.05, held: {} });
          return out;
        }
      }
      // Barra de Transformação cheia e vida baixa: prioridade — segura △ (andando para longe, ver holdCharge) até encher
      // a sanidade e passar do limite. Antes só tentava a mais de 4 m e depois das habilidades: colada no adversário a
      // CPU quase nunca transformava
      if (f.canTransform() && d > 1.8 && r < 0.6) {
        this.holdCharge = (f.maxEnergy - f.energy) / COMBAT.chargeRate + COMBAT.storm.overcharge + 0.4;
        return out;
      }
      // habilidades secundárias: △ + ○/□/L2 e R2 + △/×
      const opening = this.aiOk({ ai: { when: 'opening' } }, d, opp, lowHp);
      const threat = (opp.state === 'attack' || opp.state === 'dashing') && d < 3;
      let mods = (def.abilities || [])
        .filter((a) => isModAbility(a) && f.cooldowns[a.id] <= 0 && f.energy >= (f.abilityCost ? f.abilityCost(a) : a.energyCost || 0) + 5 && this.aiOk(a, d, opp, lowHp))
        .map((a) => ({ ability: a, prior: abilityUsePrior(a, f, opp, { distance: d, lowHp, opening, threat, lastAbility: this.lastAbility }) }))
        .filter((item) => item.prior > 0);
      // não repetir a mesma habilidade seguida quando houver outra
      if (mods.length > 1 && mods.some((item) => item.ability.id !== this.lastAbility)) {
        mods = mods.filter((item) => item.ability.id !== this.lastAbility);
      }
      // def.ai.abilityRate: personagens que vivem das habilidades (Jae) usam mais
      if (mods.length && r < L.ability * ((def.ai && def.ai.abilityRate) || 1)) {
        const total = mods.reduce((sum, item) => sum + item.prior, 0);
        let roll = Math.random() * total;
        let picked = mods[mods.length - 1];
        for (const item of mods) { roll -= item.prior; if (roll <= 0) { picked = item; break; } }
        const a = picked.ability;
        this.lastAbility = a.id;
        const range = a.range || 10;
        if (d <= range || SELF_TYPES.includes(a.type)) {
          this.pressAbility(a, toOpp, side);
          return out;
        }
      }
      const tele = (def.abilities || []).find((a) => a.input === 'carga+jump');
      if (f.specialAvailable() && sacrificeOk(f, opp) && d < 7 && r < L.special) {
        this.tap('carga');
        this.tap('carga');
        this.tap('physical');
        return out;
      }
      // longe: aproxima com dash longo / teleporte
      const longDashOk = !tele && f.cooldowns.dash <= 0 && f.energy > 25 && d > 9 && !lowHp;
      if ((longDashOk && r < 0.15) || (tele && f.cooldowns[tele.id] <= 0 && f.energy > tele.energyCost + 10 && d > 4 && d < 14 && r < 0.2)) {
        this.queue.push({ t: 0.05, held: { carga: true } }, { t: 0.06, held: { carga: true, jump: true } }, { t: 0.05, held: {} });
        return out;
      }
      // à distância: principal (sniper do Arthur: segura para carregar — quanto mais longe, mais tempo)
      if (def.ranged && f.cooldowns.ranged <= 0 && d > 5 && d < (def.ranged.range ?? 99) + 0.5 && r < L.ranged * (lowHp ? 1.4 : 1) && f.energy >= (def.ranged.energyCost || 0)) {
        if (def.ranged.chargeShot) {
          this.queue.push({ t: 0.06, held: { ranged: true } });
          this.aimHold = Math.min(1.6, 0.2 + d / 14);
        } else this.tap('ranged');
        return out;
      }
      // especial que exige sanidade alta (Pacto do Santo: 85%): de longe, carrega até chegar lá
      const spx = def.special;
      if (spx && spx.minEnergy && f.cooldowns.special <= 0 && f.energy < spx.minEnergy * f.maxEnergy && d > 4.5 && r < 0.45) {
        this.holdCharge = rnd(1.0, 1.8);
        return out;
      }
      if (f.energy < 45 && d > 9 && r < 0.3) {
        this.holdCharge = rnd(0.8, 1.6);
        return out;
      }
      // contra quem defende: agarrão
      if (d < 1.8 && f.cooldowns.grab <= 0 && (opp.state === 'block' || r < 0.08)) {
        this.queue.push({ t: 0.05, held: { block: true } }, { t: 0.06, held: { block: true, physical: true } }, { t: 0.05, held: {} });
        return out;
      }
      // perto: combo (com ↑/↓ conforme a dificuldade)
      if (d < 2.3 && r < (lowHp ? 0.55 : 0.85)) {
        this.combo();
        return out;
      }
      // médio: dash curto para entrar no combo
      if (d > 3.5 && d < 8 && f.cooldowns.dash <= 0 && !lowHp && r < 0.12) {
        this.queue.push({ t: 0.05, held: { jump: true } }, { t: 0.05, held: {} }, { t: 0.05, held: { jump: true } }, { t: 0.05, held: {} });
        return out;
      }
      if (r > 0.96 && f.onGround) this.tap('jump');
    }

    return this.move(out, f, d, lowHp, toOpp, side);
  }

  // movimento: aproxima rodeando; com vida baixa mantém distância (atiradores no Super Difícil: na distância deles)
  move(out, f, d, lowHp, toOpp, side) {
    const r = f.def.ranged;
    const shooter = this.L.tactics >= 0.5 && r && (r.range || 0) >= 14 && (r.chargeShot || (r.damage || 0) >= 60);
    const keep = lowHp ? 5 : shooter && f.health > f.maxHealth * 0.5 ? 7 : 2.0;
    const wantClose = d > keep;
    const away = !wantClose && lowHp;
    const mx = (wantClose ? toOpp.x : away ? -toOpp.x : -toOpp.x * 0.3) + side.x * 0.45;
    const mz = (wantClose ? toOpp.z : away ? -toOpp.z : -toOpp.z * 0.3) + side.z * 0.45;
    const b = f.moveBasis();
    out.moveX = mx * b.right.x + mz * b.right.z;
    out.moveY = mx * b.forward.x + mz * b.forward.z;
    return out;
  }

  // ---- APRENDIZADO (Super Difícil)
  learnTick(f, opp, w) {
    const now = w.time;
    this.episode.update(f, opp, now);
    // perfil do jogador: só observa HUMANOS (o adversário sem controlador de IA)
    if (opp.input && !opp.input.cpu && opp.state !== 'intro' && opp.state !== 'ko') {
      this.obsClock = (this.obsClock || 0) + 1;
      if (this.obsClock % 6 === 0) observePlayer(opp, distXZ(f.pos, opp.pos));
    }
    // fim do round (alguém caiu ou o round mudou): fecha o que está pendente e salva
    const roundOver = f.state === 'ko' || opp.state === 'ko' || this.round !== w.roundNo;
    if (roundOver && !this.closed) {
      this.closed = true;
      this.episode.update(f, opp, now, true);
      noteGame(); // um round aprendido
      saveLearned(performance.now(), true);
    }
    if (this.round !== w.roundNo) { this.round = w.roundNo; this.closed = false; }
    else if (f.state !== 'ko' && opp.state !== 'ko') this.closed = false;
    if (Math.random() < 0.002) saveLearned();
  }

  // as ações possíveis agora, cada uma com uma preferência "de fábrica" (prior) e como executar
  options(f, opp, d, lowHp, side) {
    const def = f.def;
    const tl0 = Math.hypot(opp.pos.x - f.pos.x, opp.pos.z - f.pos.z) || 1;
    const toOpp = { x: (opp.pos.x - f.pos.x) / tl0, z: (opp.pos.z - f.pos.z) / tl0 };
    const L = this.L;
    const opts = [];
    const add = (id, prior, run) => { if (prior > 0) opts.push({ id, prior, run }); };
    const open = this.aiOk({ ai: { when: 'opening' } }, d, opp, lowHp);
    const blockerRate = playerTendency(d, 'blk');
    // perto
    if (d < 2.3) {
      add('combo', open ? 4 : lowHp ? 1.2 : 2.8, () => this.combo());
      if (f.cooldowns.grab <= 0) add('grab', opp.state === 'block' ? 3 : 0.3 + blockerRate * 3, () => this.queue.push({ t: 0.05, held: { block: true } }, { t: 0.06, held: { block: true, physical: true } }, { t: 0.05, held: {} }));
      if (!open) add('guard', opp.state === 'attack' ? 1.6 : 0.4, () => this.queue.push({ t: rnd(0.3, 0.6), held: { block: true } }, { t: 0.04, held: {} }));
      if (canSpendDodge(f)) add('backstep', lowHp ? 1 : 0.25, () => this.queue.push({ t: 0.06, held: { dodge: true }, move: { x: -side.z, z: side.x } }, { t: 0.05, held: {} }));
    }
    // médio: entra com dash curto
    if (d > 3.5 && d < 8 && f.cooldowns.dash <= 0) add('dashIn', lowHp ? 0.2 : open ? 1.4 : 0.6, () => this.queue.push({ t: 0.05, held: { jump: true } }, { t: 0.05, held: {} }, { t: 0.05, held: { jump: true } }, { t: 0.05, held: {} }));
    // à distância
    const r = def.ranged;
    if (r && f.cooldowns.ranged <= 0 && d > 3 && d < (r.range ?? 99) + 0.5 && f.energy >= (r.energyCost || 0)) {
      add('ranged', d > 5 ? 1.4 : 0.5, () => {
        if (r.chargeShot) { this.queue.push({ t: 0.06, held: { ranged: true } }); this.aimHold = Math.min(1.6, 0.2 + d / 14); } else this.tap('ranged');
      });
    }
    // habilidades
    for (const a of def.abilities || []) {
      if (!isModAbility(a)) continue;
      if (f.cooldowns[a.id] > 0 || f.energy < (f.abilityCost ? f.abilityCost(a) : a.energyCost || 0) + 5 || !this.aiOk(a, d, opp, lowHp)) continue;
      const range = a.range || 10;
      const self = SELF_TYPES.includes(a.type);
      if (!self && d > range) continue;
      const prior = abilityUsePrior(a, f, opp, { distance: d, lowHp, opening: open, threat: (opp.state === 'attack' || opp.state === 'dashing') && d < 3, lastAbility: this.lastAbility });
      add('ab:' + a.id, prior, () => {
        this.lastAbility = a.id;
        this.pressAbility(a, toOpp, side);
      });
    }
    // especial
    if (f.specialAvailable() && sacrificeOk(f, opp) && d < 7) add('special', open ? 2.2 : 1.1, () => { this.tap('carga'); this.tap('carga'); this.tap('physical'); });
    // longe: aproxima (teleporte ou dash longo)
    const tele = (def.abilities || []).find((a) => a.input === 'carga+jump');
    if (tele && f.cooldowns[tele.id] <= 0 && f.energy > tele.energyCost + 10 && d > 4 && d < 14) add('teleport', 0.8, () => this.queue.push({ t: 0.05, held: { carga: true } }, { t: 0.06, held: { carga: true, jump: true } }, { t: 0.05, held: {} }));
    else if (!tele && f.cooldowns.dash <= 0 && f.energy > 25 && d > 9 && !lowHp) add('longDash', 0.8, () => this.queue.push({ t: 0.05, held: { carga: true } }, { t: 0.06, held: { carga: true, jump: true } }, { t: 0.05, held: {} }));
    // carregar sanidade (longe, ou adversário caído)
    if (f.energy < 80 && (d > 6 || opp.state === 'downed')) add('charge', f.energy < 40 ? 1.2 : 0.5, () => { this.holdCharge = rnd(0.5, 1.1); });
    // esperar / rodear (às vezes não fazer nada é a melhor resposta)
    add('wait', 0.2, () => {});
    return opts;
  }

  decideLearned(out, f, opp, d, lowHp, side) {
    // regras que não se aprendem (sempre certas): transformar quando der, não bater em quem está caído
    if (f.canTransform() && d > 1.8) {
      this.holdCharge = (f.maxEnergy - f.energy) / COMBAT.chargeRate + COMBAT.storm.overcharge + 0.4;
      return out;
    }
    const G = f.def.melee && f.def.melee.ground;
    if (opp.state === 'downed' && G && !opp.otgTaken && opp.invuln <= 0 && d < G.range + 0.9) { this.tap('physical'); return out; }
    if (opp.state === 'downed' && opp.invuln > 0) return null;
    const opts = this.options(f, opp, d, lowHp, side);
    const key = stateKey(f, opp, d);
    const pick = choose(f.def.id, key, opts);
    if (!pick) return null;
    pick.run();
    this.episode.record(key, pick.id, f, opp, f.world.time);
    return this.queue.length || this.holdCharge > 0 || this.aimHold > 0 ? out : null;
  }

  // dicas de uso por habilidade (a.ai): when 'opening' (só com o inimigo aberto), 'far' (de longe), 'hurt' (vida baixa);
  // min/max limitam a distância. Sem dica: usa como antes.
  aiOk(a, d, opp, lowHp) {
    const h = a.ai;
    if (!h) return true;
    if (h.max && d > h.max) return false;
    if (h.min && d < h.min) return false;
    const f = this.fighter;
    if (h.when === 'hurt') return lowHp || f.health < f.maxHealth * 0.6;
    if (h.when === 'far') return d >= (h.min || 4);
    if (h.when === 'opening') {
      // defendendo também é abertura para golpes que gastam a defesa (guardCrush)
      if (['stun', 'hitstun', 'ability', 'ranged', 'specialStart', 'dashing'].includes(opp.state)) return true;
      if (opp.state === 'block' && a.guardCrush) return true;
      const c = opp.combo;
      // recuperação de um golpe (já passou da janela de acerto)
      return opp.state === 'attack' && c && c.windows && opp.stateTime > c.windows[c.windows.length - 1][1];
    }
    return true;
  }
}
