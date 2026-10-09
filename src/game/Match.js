import { COMBAT } from '../config/combat.js';
import { SETTINGS } from '../config/settings.js';
import { t } from '../i18n/index.js';
import { World } from './World.js';
import { battleLines, introLines, BASE_CHARACTER } from '../config/dialogues.js';
import { Assist } from '../combat/assists.js';
import { yawTo } from '../core/util.js';

const ENTRANCE_WALK_TIME = 1.7;
const READY_TIME = 0.9;
const POST_DIALOGUE_PAUSE = 1.0;

// Partida: rodadas, cronômetro, K.O. e vitória. Usa o World para a luta em si.
export class Match {
  constructor({ renderer, audio, input, hud, defs, arenaId, onEnd, dialogue = true, mode = 'pvp', teams = null }) {
    this.mode = mode;
    this.teams = teams; // [[líder, assist1, assist2], [...]] na batalha em equipe
    this.training = mode === 'training';
    // treino estilo Storm 4: alvo parado, vida volta sozinha, sem tempo e sem fim de luta
    this.trainingOpts = { life: 'regen', energy: true, noCooldown: false, dummy: 'still' };
    this.regenWait = 0;
    this.hud = hud;
    this.input = input;
    this.dialogue = dialogue;
    this.battleDialogue = null;
    this.battleDialogueNextAt = 0;
    this.criticalDialogueFired = new Set();
    this.audio = audio;
    this.onEnd = onEnd;
    this.defs = defs;
    this.world = new World({ renderer, audio, input, ui: hud });
    this.world.setup(defs, arenaId);
    input.teamMode = !!teams;
    if (teams) {
      this.world.fighters.forEach((f, i) => {
        f.assists = teams[i].slice(1, 3).map((d, slot) => new Assist(d, f, this.world, slot));
      });
    }
    this.world.onKO = () => { this.koPending = true; };
    this.world.onBattleDialogue = (fighter, event) => this.triggerBattleDialogue(fighter, event);
    // troca de personagem na equipe: a HUD passa a mostrar o novo (nome, habilidades, assistências)
    this.world.onSwitch = () => this.hud.bind(this.world.fighters);
    this.world.onTransform = (fighter) => {
      this.hud.bind(this.world.fighters);
      this.triggerBattleDialogue(fighter, 'transform');
    };
    // Injustiça: o inimigo recupera Y de vida e perde sanidade (energia)
    this.world.onDrain = (attacker, victim, heal, removed) => {
      hud.popup(victim.index, t('combat.heal_popup', { n: fmt(heal) }), '#7dffb0');
      hud.popup(victim.index, t('combat.sanity_popup', { n: fmt(removed) }), '#6ad1ff');
    };
    this.wins = [0, 0];
    this.round = 0;
    this.phase = 'loading';
  }

  // Chamado quando a tela de carregamento termina
  beginIntro() {
    this.hud.reset();
    this.hud.bind(this.world.fighters);
    this.hud.show(true);
    if (this.dialogue) this.startEntrance();
    else this.startRound();
  }

  // Entrada dos lutadores e falas antes do primeiro round (qualquer jogador pode pular).
  startEntrance() {
    this.world.resetRound();
    this.phase = 'entrance';
    this.phaseTime = 0;
    this.round = 1;
    this.timer = SETTINGS.timer || COMBAT.roundTime;
    let nextLineAt = 0;
    this.lines = introLines(this.defs[0].id, this.defs[1].id).map(([id, text], k) => {
      // forma (ex.: Deus da Morte, chefe da TORRE) fala com as falas da base (Ferreiro); sem achar, vale a ordem
      let fighter = this.defs.findIndex((def) => def.id === id);
      if (fighter < 0) fighter = this.defs.findIndex((def) => BASE_CHARACTER[def.id] === id);
      if (fighter < 0) fighter = k;
      const duration = getDialogueDuration(text);
      const line = { id, text, fighter, start: nextLineAt, end: nextLineAt + duration };
      nextLineAt = line.end;
      return line;
    });
    this.lineIndex = -1;
    this.hud.setIntro(true);
    this.entranceStarts = this.fighters.map((f) => f.pos.clone());
    const [a, b] = this.entranceStarts;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const distance = Math.hypot(dx, dz) || 1;
    const midpoint = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
    this.entranceTargets = [
      { x: midpoint.x - (dx / distance) * 1.1, z: midpoint.z - (dz / distance) * 1.1 },
      { x: midpoint.x + (dx / distance) * 1.1, z: midpoint.z + (dz / distance) * 1.1 },
    ];
    this.entranceReadyAt = nextLineAt + POST_DIALOGUE_PAUSE;
    this.entranceReadyShown = false;
    for (const f of this.fighters) {
      f.setState('intro');
      f.anim.play('walk', { restart: true });
    }
  }

  updateEntrance(dt) {
    const w = this.world;
    w.update(dt, { simulate: false });
    const skip = this.input.players.some((p) => !p.cpu && (p.pressed.start || p.pressed.jump));
    if (skip && !this.entranceReadyShown) {
      this.entranceReadyAt = this.phaseTime;
      this.entranceSkipped = true;
    }
    const progress = this.entranceSkipped ? 1 : Math.min(1, this.phaseTime / ENTRANCE_WALK_TIME);
    const eased = progress * progress * (3 - 2 * progress);
    this.fighters.forEach((fighter, i) => {
      const target = this.entranceTargets[i];
      fighter.pos.set(
        this.entranceStarts[i].x + (target.x - this.entranceStarts[i].x) * eased,
        0,
        this.entranceStarts[i].z + (target.z - this.entranceStarts[i].z) * eased,
      );
      fighter.yaw = yawTo(fighter.pos, this.fighters[1 - i].pos);
      fighter.anim.play(progress < 1 ? 'walk' : 'idle');
    });

    const activeLine = this.entranceSkipped
      ? null
      : this.lines.find((line) => this.phaseTime >= line.start && this.phaseTime < line.end);
    if (activeLine) {
      if (activeLine.fighter !== this.lineIndex) {
        this.lineIndex = activeLine.fighter;
        const def = this.defs[activeLine.fighter];
        this.hud.subtitle({ name: def.name, color: def.color, text: activeLine.text, side: activeLine.fighter });
      }
    } else {
      this.hud.subtitle(null);
      if (this.phaseTime >= this.entranceReadyAt && !this.entranceReadyShown) {
        this.entranceReadyShown = true;
        this.entranceReadyAt = Math.max(this.entranceReadyAt, this.phaseTime);
        this.hud.callout(t('combat.fight'), '#ffd84a');
        this.audio.play('confirm', { volume: 1.2 });
      } else if (this.phaseTime >= this.entranceReadyAt + READY_TIME) {
        this.phase = 'fight';
        this.phaseTime = 0;
        this.koPending = false;
        this.hud.setIntro(false);
        for (const fighter of this.fighters) fighter.setState('idle');
      }
    }
  }

  get fighters() {
    return this.world.fighters;
  }

  startRound() {
    this.clearBattleDialogue();
    this.battleDialogueNextAt = this.world.time;
    this.criticalDialogueFired.clear();
    this.round++;
    this.world.resetRound();
    this.timer = SETTINGS.timer || COMBAT.roundTime;
    this.phase = 'intro';
    this.phaseTime = 0;
    this.countStep = 0;
    this.koPending = false;
    for (const f of this.fighters) f.setState('intro');
  }

  update(dt) {
    this.lastDt = dt;
    if (this.phase === 'loading') return;
    if (this.training && this.phase === 'fight') this.updateTraining(dt);
    this.phaseTime += dt;
    const w = this.world;
    switch (this.phase) {
      case 'entrance':
        this.updateEntrance(dt);
        break;
      case 'intro': {
        w.update(dt, { simulate: false });
        for (const f of this.fighters) f.anim.play('idle');
        const steps = [[0.1, t('combat.round', { n: this.round }), '#ffffff'], [1.0, t('combat.fight'), '#ffd84a']];
        for (let i = 0; i < steps.length; i++) {
          const [at, text, color] = steps[i];
          if (this.phaseTime >= at && this.countStep <= i) {
            this.countStep = i + 1;
            this.hud.callout(text, color);
            this.audio.play(i === steps.length - 1 ? 'confirm' : 'banner', { volume: 1.2 });
          }
        }
        if (this.phaseTime > 1.9) {
          this.phase = 'fight';
          for (const f of this.fighters) f.setState('idle');
        }
        break;
      }
      case 'fight':
        w.update(dt);
        this.checkCriticalDialogues();
        this.updateBattleDialogue(dt);
        if (!w.cinematic && SETTINGS.timer && !this.training) this.timer -= dt;
        // K.O. só é resolvido depois que o especial termina
        if (this.koPending && !w.cinematic) this.endRound('ko');
        else if (this.timer <= 0) this.endRound('time');
        break;
      case 'roundEnd':
        w.update(dt);
        if (this.phaseTime > 3.0) {
          if (this.wins.some((x) => x >= (SETTINGS.rounds || COMBAT.roundsToWin))) {
            this.phase = 'over';
            const winner = this.wins[0] > this.wins[1] ? 0 : 1;
            const winningFighter = this.fighters[winner];
            const activeDef = winningFighter.baseForm?.def ?? winningFighter.def;
            const roster = this.teams ? this.teams[winner] : null;
            const activeIndex = roster?.findIndex((member) => member.id === activeDef.id) ?? -1;
            // transformado (Diabo, Deus da Morte, Fantasma): aparece SÓ a forma, no lugar do personagem base — antes a
            // equipe trazia o Juan/Ferreiro/Kemi E a forma na mesma tela de vitória
            const team = activeIndex >= 0
              ? [winningFighter.def, ...roster.filter((_, index) => index !== activeIndex)]
              : roster;
            this.onEnd && this.onEnd({ winner, def: winningFighter.def, loser: this.fighters[1 - winner].def, team });
          } else {
            this.startRound();
          }
        }
        break;
      case 'over':
        w.update(dt);
        break;
      default:
        break;
    }
    this.hud.update(this);
  }

  endRound(reason) {
    this.clearBattleDialogue();
    this.phase = 'roundEnd';
    this.phaseTime = 0;
    const [a, b] = this.fighters;
    let winner = -1;
    if (a.state === 'ko' && b.state !== 'ko') winner = 1;
    else if (b.state === 'ko' && a.state !== 'ko') winner = 0;
    // os dois caíram: quem se explodiu levando o outro junto (Erin, Em Nome do Caos) ganha o round
    else if (a.state === 'ko' && b.state === 'ko' && a.sacrificeWin !== b.sacrificeWin) winner = a.sacrificeWin ? 0 : 1;
    else if (a.state !== 'ko' && b.state !== 'ko') {
      const ra = a.health / a.maxHealth;
      const rb = b.health / b.maxHealth;
      winner = ra === rb ? -1 : ra > rb ? 0 : 1;
    }
    if (winner >= 0) this.wins[winner]++;
    else { this.wins[0]++; this.wins[1]++; } // empate: ponto para os dois
    this.hud.callout(t(reason === 'ko' ? 'combat.ko' : 'combat.time_up'), reason === 'ko' ? '#ff4a3a' : '#ffd84a');
    for (const f of this.fighters) {
      f.stopCharging();
      if (f.state !== 'ko') {
        f.setState('intro');
        f.vel.set(0, f.vel.y, 0);
        if (this.fighters.indexOf(f) === winner) f.anim.play('victory', { restart: true });
        else if (winner >= 0) f.anim.play('defeat', { restart: true }); // perdeu no tempo: cai de joelho
      }
    }
  }

  render() {
    this.world.render();
  }

  triggerBattleDialogue(fighter, event) {
    if (!this.dialogue || this.training || this.phase !== 'fight' || this.battleDialogue) return false;
    if (this.world.time < this.battleDialogueNextAt) return false;
    const opponent = fighter.opponent;
    if (!opponent) return false;
    const exchange = battleLines(fighter.def.id, opponent.def.id, event);
    if (!exchange) return false;
    const fighters = [fighter, opponent];
    this.battleDialogue = {
      lines: exchange.map(([id, text], i) => {
        const speaker = fighters[i];
        return { name: speaker.def.name, color: speaker.def.color, text, side: speaker.index };
      }),
      index: 0,
      remaining: 1.6,
    };
    this.battleDialogueNextAt = this.world.time + 16;
    this.showBattleDialogueLine();
    return true;
  }

  showBattleDialogueLine() {
    const state = this.battleDialogue;
    if (!state) return;
    const line = state.lines[state.index];
    this.hud.subtitle(line || null);
    if (line) state.remaining = Math.min(2.4, Math.max(1.6, 1.0 + line.text.length * 0.025));
  }

  updateBattleDialogue(dt) {
    if (!this.battleDialogue) return;
    this.battleDialogue.remaining -= dt;
    if (this.battleDialogue.remaining > 0) return;
    this.battleDialogue.index++;
    if (this.battleDialogue.index >= this.battleDialogue.lines.length) {
      this.clearBattleDialogue();
      return;
    }
    this.showBattleDialogueLine();
  }

  checkCriticalDialogues() {
    if (!this.dialogue || this.training) return;
    for (const fighter of this.fighters) {
      if (fighter.state === 'ko' || fighter.health / fighter.maxHealth > 0.25 || this.criticalDialogueFired.has(fighter)) continue;
      if (this.triggerBattleDialogue(fighter, 'critical')) this.criticalDialogueFired.add(fighter);
    }
  }

  clearBattleDialogue() {
    if (!this.battleDialogue) return;
    this.battleDialogue = null;
    this.hud.subtitle(null);
  }

  updateTraining(dt) {
    const o = this.trainingOpts;
    const [p, dummy] = this.fighters;
    this.timer = COMBAT.roundTime;
    for (const f of this.fighters) f.immortal = o.life !== 'normal' || f === p; // o jogador nunca morre no treino
    // vida do alvo regenera depois que o combo acaba (como no Storm 4)
    const inCombo = ['hitstun', 'stun', 'pulled', 'grabbed', 'downed'].includes(dummy.state) || dummy.health < dummy.lastTrainHp;
    dummy.lastTrainHp = dummy.health;
    if (inCombo) this.regenWait = 1.2;
    else if (this.regenWait > 0) this.regenWait -= dt;
    if (o.life === 'regen' && this.regenWait <= 0 && dummy.health < dummy.maxHealth) dummy.health = Math.min(dummy.maxHealth, dummy.health + dummy.maxHealth * 1.5 * dt);
    if (p.health < p.maxHealth && !['hitstun', 'downed'].includes(p.state)) p.health = Math.min(p.maxHealth, p.health + p.maxHealth * dt);
    if (o.energy) { p.energy = p.maxEnergy; p.dodges = COMBAT.dodge.charges; p.guard = p.maxGuard; }
    if (o.noCooldown) for (const k in p.cooldowns) if (k !== 'dodge') p.cooldowns[k] = Math.min(p.cooldowns[k], 0.05);
    if (o.noCooldown) p.specialUses = 0;
    // treino com sanidade infinita: a Barra de Transformação fica cheia e não precisa da vida baixa
    if (o.energy && p.def.awakening && !p.baseForm) { p.storm = 100; p.trainingAwaken = true; }
  }

  // Treino: volta os dois para o começo, com vida cheia (Select na luta ou opção da pausa)
  resetTraining() {
    this.world.resetRound();
    this.regenWait = 0;
    for (const f of this.fighters) f.setState('idle');
    this.hud.callout(t('combat.reset'), '#ffd84a');
  }

  dispose() {
    this.disposed = true;
    this.world.dispose();
    this.hud.reset();
    this.hud.show(false);
  }
}

function getDialogueDuration(text) {
  return Math.min(Math.max(2200 + text.length * 45, 2500), 6000) / 1000;
}

function fmt(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
