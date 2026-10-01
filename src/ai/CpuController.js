import { distXZ } from '../core/util.js';

// Adversário controlado pelo computador. Gera o mesmo tipo de entrada que um jogador
// (nada de atalhos internos) e erra de propósito conforme a dificuldade.
//
// Ele olha: distância, vida, sanidade, recargas, posição e o estado do adversário.
//  - vida baixa → joga mais na defensiva (defende/esquiva mais, mantém distância, transcende);
//  - adversário longe → ataque à distância ou aproxima com dash;
//  - adversário atacando → defende, esquiva ou tenta o perfect block;
//  - adversário caído → reposiciona/carrega (caído não toma dano);
//  - adversário defendendo → agarrão ou golpe forte.
export const CPU_LEVELS = {
  easy: { think: [0.45, 0.8], block: 0.025, dodge: 0.02, perfect: 0, subst: 0.006, mistake: 0.3, combo: [1, 3], ability: 0.06, special: 0.12, vertical: 0, tech: 0.1, ranged: 0.35 },
  normal: { think: [0.25, 0.45], block: 0.06, dodge: 0.05, perfect: 0, subst: 0.015, mistake: 0.15, combo: [2, 4], ability: 0.12, special: 0.22, vertical: 0.25, tech: 0.35, ranged: 0.45 },
  hard: { think: [0.15, 0.3], block: 0.12, dodge: 0.09, perfect: 0.15, subst: 0.03, mistake: 0.07, combo: [3, 5], ability: 0.16, special: 0.3, vertical: 0.5, tech: 0.6, ranged: 0.5 },
  veryhard: { think: [0.1, 0.2], block: 0.2, dodge: 0.14, perfect: 0.35, subst: 0.05, mistake: 0.03, combo: [4, 6], ability: 0.2, special: 0.35, vertical: 0.7, tech: 0.85, ranged: 0.5 },
};

const rnd = (a, b) => a + Math.random() * (b - a);

export class CpuController {
  constructor({ level = 'normal' } = {}) {
    this.fighter = null;
    this.queue = [];
    this.think = 0;
    this.strafe = 1;
    this.holdCharge = 0;
    this.aimHold = 0;
    this.L = CPU_LEVELS[level] || CPU_LEVELS.normal;
  }

  attach(fighter) {
    this.fighter = fighter;
  }

  tap(action, extra = {}, raw) {
    this.queue.push({ t: 0.06, held: { [action]: true, ...extra }, raw }, { t: 0.05, held: {}, raw });
  }

  // sequência de golpes; às vezes termina com ↑ (lançador + aéreo) ou ↓ (derruba)
  combo() {
    const L = this.L;
    const n = Math.round(rnd(L.combo[0], L.combo[1]));
    for (let i = 0; i < n; i++) this.tap('physical');
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

  produce(dt) {
    const out = { moveX: 0, moveY: 0, held: {} };
    const f = this.fighter;
    if (!f || !f.world) return out;
    const w = f.world;
    const opp = w.opponentOf(f);
    if (!opp) return out;
    const L = this.L;
    const k = Math.min(2, dt * 60); // probabilidades "por quadro" independentes do fps

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

    if (this.holdCharge > 0) {
      this.holdCharge -= dt;
      out.held.carga = true;
      // vida baixa: carrega andando para longe
      if (lowHp) {
        const b = f.moveBasis();
        out.moveX = -toOpp.x * b.right.x + -toOpp.z * b.right.z;
        out.moveY = -toOpp.x * b.forward.x + -toOpp.z * b.forward.z;
      }
      return out;
    }

    // ---- reações defensivas
    if ((f.state === 'idle' || f.state === 'charging') && f.onGround) {
      const incoming = w.projectiles.list.some((p) => p.owner === opp && Math.hypot(p.pos.x - f.pos.x, p.pos.z - f.pos.z) < 9);
      if (incoming && f.cooldowns.dodge <= 0 && f.dodges > 0 && Math.random() < L.dodge * defensive * k) {
        this.queue.push({ t: 0.06, held: { dodge: true }, move: side }, { t: 0.05, held: {} });
        return out;
      }
      const threat = (opp.state === 'attack' || opp.state === 'dashing') && d < 3;
      if (threat) {
        // perfect block: aperta a defesa bem perto do impacto
        const nearImpact = opp.state === 'attack' && opp.combo && opp.combo.windows && opp.stateTime > opp.combo.windows[0][0] - 0.08 && opp.stateTime < opp.combo.windows[0][0];
        if (nearImpact && Math.random() < L.perfect) {
          this.queue.push({ t: 0.3, held: { block: true } }, { t: 0.04, held: {} });
          return out;
        }
        if (Math.random() < L.block * defensive * k) {
          this.queue.push({ t: rnd(0.35, 0.7), held: { block: true } }, { t: 0.04, held: {} });
          return out;
        }
        if (f.dodges > 1 && Math.random() < L.dodge * 0.6 * defensive * k) {
          this.queue.push({ t: 0.06, held: { dodge: true }, move: side }, { t: 0.05, held: {} });
          return out;
        }
      }
    }

    this.think -= dt;
    if (this.think <= 0) {
      this.think = rnd(L.think[0], L.think[1]);
      if (Math.random() < 0.15) this.strafe *= -1;
      const r = Math.random();
      const def = f.def;
      // erros de propósito: hesita, pula à toa ou ataca no vazio
      if (Math.random() < L.mistake) {
        const m = Math.random();
        if (m < 0.3 && f.onGround) this.tap('jump');
        else if (m < 0.55 && d > 3) this.tap('physical');
        return out;
      }
      // adversário caído: não adianta bater (fica invulnerável) — reposiciona ou carrega
      if (opp.state === 'downed') {
        if (f.energy < 80 && d > 3) this.holdCharge = rnd(0.4, 0.8);
        return out;
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
      // habilidades secundárias (R1/RB + botão)
      const mods = (def.abilities || []).filter((a) => a.input.startsWith('mod+') && f.cooldowns[a.id] <= 0 && f.energy >= (f.abilityCost ? f.abilityCost(a) : a.energyCost || 0) + 5);
      if (mods.length && r < L.ability) {
        const a = mods[Math.floor(Math.random() * mods.length)];
        const btn = a.input.slice(4);
        const range = a.range || 10;
        if (d <= range || ['weaponState', 'blink', 'mistCloud', 'healOverTime', 'hatredTemple', 'shadowClones'].includes(a.type)) {
          this.queue.push({ t: 0.05, held: { mod: true } }, { t: 0.06, held: { mod: true, [btn]: true } }, { t: 0.05, held: {} });
          return out;
        }
      }
      const tele = (def.abilities || []).find((a) => a.input === 'carga+jump');
      if (f.specialAvailable() && d < 7 && r < L.special) {
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
      if (def.ranged && f.cooldowns.ranged <= 0 && d > 5 && r < L.ranged * (lowHp ? 1.4 : 1) && f.energy >= (def.ranged.energyCost || 0)) {
        if (def.ranged.chargeShot) {
          this.queue.push({ t: 0.06, held: { ranged: true } });
          this.aimHold = Math.min(1.6, 0.2 + d / 14);
        } else this.tap('ranged');
        return out;
      }
      // Transcender com a vida baixa: segura △
      if (f.canAwaken() && d > 4 && r < 0.35) {
        this.holdCharge = 1.3;
        return out;
      }
      if (f.energy < 45 && d > 9 && r < 0.3) {
        this.holdCharge = rnd(0.8, 1.6);
        return out;
      }
      // contra quem defende: agarrão ou golpe forte
      if (d < 1.8 && f.cooldowns.grab <= 0 && (opp.state === 'block' || r < 0.08)) {
        this.queue.push({ t: 0.05, held: { block: true } }, { t: 0.06, held: { block: true, physical: true } }, { t: 0.05, held: {} });
        return out;
      }
      if (d < 2.3 && (opp.state === 'block' ? r < 0.4 : r < 0.12) && f.cooldowns.powerMelee <= 0 && f.energy > 35) {
        this.queue.push({ t: 0.05, held: { carga: true, physical: true } }, { t: 0.05, held: {} });
        return out;
      }
      if (def.ranged && f.cooldowns.ranged <= 0 && d > 5 && r > 0.92 && f.energy >= (def.ranged.energyCost || 0) + 40) {
        this.queue.push({ t: 0.05, held: { carga: true, ranged: true } }, { t: 0.05, held: {} });
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

    // movimento: aproxima rodeando; com vida baixa mantém distância
    const keep = lowHp ? 5 : 2.0;
    const wantClose = d > keep;
    const away = !wantClose && lowHp;
    const mx = (wantClose ? toOpp.x : away ? -toOpp.x : -toOpp.x * 0.3) + side.x * 0.45;
    const mz = (wantClose ? toOpp.z : away ? -toOpp.z : -toOpp.z * 0.3) + side.z * 0.45;
    const b = f.moveBasis();
    out.moveX = mx * b.right.x + mz * b.right.z;
    out.moveY = mx * b.forward.x + mz * b.forward.z;
    return out;
  }
}
