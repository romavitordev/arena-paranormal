import { COMBAT } from '../config/combat.js';
import { SETTINGS } from '../config/settings.js';
import { World } from './World.js';
import { introLines } from '../config/dialogues.js';
import { Assist } from '../combat/assists.js';

const LINE_TIME = 2.2; // segundos por fala antes do ROUND 1

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
    // Injustiça: o inimigo recupera Y de vida e perde sanidade (energia)
    this.world.onDrain = (attacker, victim, heal, removed) => {
      hud.popup(victim.index, `+${fmt(heal)} VIDA`, '#7dffb0');
      hud.popup(victim.index, `−${fmt(removed)} SANIDADE`, '#6ad1ff');
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
    if (this.dialogue) this.startDialogue();
    else this.startRound();
  }

  // Falas antes do ROUND 1 (qualquer jogador pode pular com confirmar/Start)
  startDialogue() {
    this.world.resetRound();
    this.phase = 'dialogue';
    this.phaseTime = 0;
    this.lines = introLines(this.defs[0].id, this.defs[1].id).map(([id, t], i) => [id, t, i]).filter(([, t]) => t);
    this.lineIndex = -1;
    for (const f of this.fighters) f.setState('intro');
  }

  updateDialogue(dt) {
    const w = this.world;
    w.update(dt, { simulate: false });
    for (const f of this.fighters) f.anim.play('idle');
    const skip = this.input.players.some((p) => !p.cpu && (p.pressed.start || p.pressed.jump));
    const idx = Math.floor(this.phaseTime / LINE_TIME);
    if (skip || idx >= this.lines.length) {
      this.hud.subtitle(null);
      this.round = 0;
      this.startRound();
      return;
    }
    if (idx !== this.lineIndex) {
      this.lineIndex = idx;
      const [, text, fi] = this.lines[idx];
      const def = this.defs[fi];
      this.hud.subtitle({ name: def.name, color: def.color, text, side: fi });
    }
  }

  get fighters() {
    return this.world.fighters;
  }

  startRound() {
    this.round++;
    this.world.resetRound();
    this.timer = SETTINGS.timer || COMBAT.roundTime;
    this.phase = 'intro';
    this.phaseTime = 0;
    this.countStep = 0;
    this.koPending = false;
    for (const f of this.fighters) f.setState('intro');
    this.hud.callout(`ROUND ${this.round}`);
    this.audio.play('banner');
  }

  update(dt) {
    this.lastDt = dt;
    if (this.phase === 'loading') return;
    if (this.training && this.phase === 'fight') this.updateTraining(dt);
    this.phaseTime += dt;
    const w = this.world;
    switch (this.phase) {
      case 'dialogue':
        this.updateDialogue(dt);
        break;
      case 'intro': {
        w.update(dt, { simulate: false });
        for (const f of this.fighters) f.anim.play('idle');
        // ROUND N → 3, 2, 1 → LUTE!
        const steps = [[0.9, '3', '#ffffff'], [1.6, '2', '#ffffff'], [2.3, '1', '#ffffff'], [3.0, 'LUTAR!', '#ffd84a']];
        for (let i = 0; i < steps.length; i++) {
          const [at, text, color] = steps[i];
          if (this.phaseTime >= at && this.countStep <= i) {
            this.countStep = i + 1;
            this.hud.callout(text, color);
            this.audio.play(i === steps.length - 1 ? 'confirm' : 'select', { volume: 1.2 });
          }
        }
        if (this.phaseTime > 3.0) {
          this.phase = 'fight';
          for (const f of this.fighters) f.setState('idle');
        }
        break;
      }
      case 'fight':
        w.update(dt);
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
            this.onEnd && this.onEnd({ winner, def: this.fighters[winner].def, loser: this.fighters[1 - winner].def, team: this.teams ? this.teams[winner] : null });
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
    this.phase = 'roundEnd';
    this.phaseTime = 0;
    const [a, b] = this.fighters;
    let winner = -1;
    if (a.state === 'ko' && b.state !== 'ko') winner = 1;
    else if (b.state === 'ko' && a.state !== 'ko') winner = 0;
    else if (a.state !== 'ko' && b.state !== 'ko') {
      const ra = a.health / a.maxHealth;
      const rb = b.health / b.maxHealth;
      winner = ra === rb ? -1 : ra > rb ? 0 : 1;
    }
    if (winner >= 0) this.wins[winner]++;
    else { this.wins[0]++; this.wins[1]++; } // empate: ponto para os dois
    this.hud.callout(reason === 'ko' ? 'K.O.' : 'TEMPO!', reason === 'ko' ? '#ff4a3a' : '#ffd84a');
    for (const f of this.fighters) {
      f.stopCharging();
      if (f.state !== 'ko') {
        f.setState('intro');
        f.vel.set(0, f.vel.y, 0);
        if (this.fighters.indexOf(f) === winner) f.anim.play('victory', { restart: true });
      }
    }
  }

  render() {
    this.world.render();
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
    if (o.noCooldown) { p.specialUses = 0; p.awakened = false; }
  }

  // Treino: volta os dois para o começo, com vida cheia (Select na luta ou opção da pausa)
  resetTraining() {
    this.world.resetRound();
    this.regenWait = 0;
    for (const f of this.fighters) f.setState('idle');
    this.hud.callout('RESET', '#ffd84a');
  }

  dispose() {
    this.disposed = true;
    this.world.dispose();
    this.hud.reset();
    this.hud.show(false);
  }
}

function fmt(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
