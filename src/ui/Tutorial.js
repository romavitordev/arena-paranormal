import { actionLabel } from './labels.js';

// MODO TUTORIAL: ensina, passo a passo, os comandos do personagem escolhido contra um alvo parado (vida infinita,
// sanidade infinita, sem recargas). Cada passo mostra o comando com as teclas do aparelho que o jogador está usando
// e só avança quando ele faz aquilo de verdade (o tutorial observa o lutador; não muda nada no combate).
//
// update(dt) → 'done' quando todos os passos foram feitos.

export class TutorialMode {
  constructor(root, match) {
    this.match = match;
    this.f = match.fighters[0];
    this.ev = new Set(); // ações observadas desde o começo do passo
    this.watch(this.f);
    this.steps = buildSteps(this.f.def);
    this.i = 0;
    this.ok = 0; // tempo do "MUITO BEM!" na tela
    this.moved = 0;
    this.blockT = 0;
    this.chargeT = 0;
    this.lastPos = this.f.pos.clone();
    this.el = document.createElement('div');
    this.el.id = 'tutorial-panel';
    root.appendChild(this.el);
    this.lastSource = null;
    this.render();
  }

  // envolve os métodos do lutador que disparam cada ação (sem mudar o que eles fazem)
  watch(f) {
    const ev = this.ev;
    const m = f.def.melee;
    const wrap = (name, after) => {
      const orig = f[name].bind(f);
      f[name] = (...args) => {
        const before = snapshot(f);
        const r = orig(...args);
        after(args, before, r);
        return r;
      };
    };
    const snapshot = (x) => ({ state: x.state, cds: { ...x.cooldowns }, energy: x.energy });
    wrap('startStrike', ([s]) => {
      ev.add('strike');
      if (s === m.strikes.at(-1)) ev.add('finisher');
      for (const k of ['forward', 'back', 'side', 'air', 'up', 'down']) if (s === m[k]) ev.add('strike:' + k);
    });
    wrap('startDash', ([kind]) => ev.add(kind === 'long' ? 'dash:long' : 'dash'));
    wrap('tryRanged', () => { if (f.state === 'ranged') ev.add('ranged'); });
    wrap('startChargeShot', () => ev.add('ranged'));
    wrap('tryDodge', () => { if (f.state === 'dodge' || f.state === 'dashing') ev.add('dodge'); });
    wrap('tryGrab', () => ev.add('grab'));
    wrap('useAbility', ([a], before) => { if (f.cooldowns[a.id] > 0 && !(before.cds[a.id] > 0)) ev.add('ability:' + a.id); });
    wrap('trySpecial', () => { if (f.cooldowns.special > 0 || f.state === 'specialStart' || f.state === 'special') ev.add('special'); });
  }

  update(dt) {
    const f = this.f;
    // ajudas contínuas do tutorial: alvo sempre perto e sanidade/recargas livres (vêm do treinamento)
    this.moved += f.pos.distanceTo(this.lastPos);
    this.lastPos.copy(f.pos);
    if (!f.onGround) this.ev.add('jump');
    this.blockT = f.state === 'block' ? this.blockT + dt : 0;
    if (this.blockT >= 1) this.ev.add('block');
    this.chargeT = f.state === 'charging' ? this.chargeT + dt : 0;
    if (this.chargeT >= 1) this.ev.add('charge');
    if (this.moved >= 5) this.ev.add('move');

    if (f.input.source !== this.lastSource) { this.lastSource = f.input.source; this.render(); }
    if (this.ok > 0) {
      this.ok -= dt;
      if (this.ok <= 0) this.next();
      return null;
    }
    const st = this.steps[this.i];
    if (!st) return 'done';
    if (st.needs.every((n) => this.ev.has(n))) {
      this.ok = 0.9;
      this.match.audio.play('confirm');
      this.render(true);
    }
    return null;
  }

  next() {
    this.i++;
    this.ev.clear();
    this.moved = 0;
    if (this.i >= this.steps.length) { this.render(); return; }
    // habilidade de cura não sai com a vida cheia: o tutorial tira um pouco de vida antes desse passo
    const st = this.steps[this.i];
    if (st.heal && this.f.health >= this.f.maxHealth) this.f.health = Math.round(this.f.maxHealth * 0.7);
    this.render();
  }

  // pular o passo atual (pela pausa)
  skip() {
    this.ok = 0;
    this.next();
  }

  render(done = false) {
    const st = this.steps[this.i];
    const src = this.f.input.source;
    if (!st) {
      this.el.innerHTML = `<div class="t-card fin"><div class="t-top">TUTORIAL — ${this.f.def.name}</div><h3>TUTORIAL CONCLUÍDO!</h3><p>Você já conhece todos os golpes. Abra a pausa para repetir ou trocar de personagem.</p></div>`;
      return;
    }
    const cmd = st.cmd.map((part) => (typeof part === 'string' && part.startsWith('@') ? `<kbd>${keyText(part.slice(1), src)}</kbd>` : part)).join(' ');
    this.el.innerHTML = `<div class="t-card${done ? ' ok' : ''}">
      <div class="t-top">TUTORIAL — ${this.f.def.name}<span>${this.i + 1} / ${this.steps.length}</span></div>
      <div class="t-bar"><i style="width:${(this.i / this.steps.length) * 100}%"></i></div>
      <h3>${done ? '✓ MUITO BEM!' : st.title}</h3>
      <div class="t-cmd">${cmd}</div>
      <p>${st.text}</p>
      <div class="t-hint">Pausa: pular passo · ver todos os comandos</div>
    </div>`;
  }

  dispose() {
    this.el.remove();
  }
}

// rótulo de uma ação ou combinação ('carga+physical' → "I + L" / "Y/△ + B/○")
function keyText(action, source) {
  if (action === 'move') return source === 'gamepad' ? 'Analógico' : source === 'touch' ? 'Joystick' : 'W A S D';
  return action.split('+').map((a) => actionLabel(0, a, source)).join(' + ');
}

const DIRS = {
  forward: ['Frente', 'avança em direção ao alvo'],
  back: ['Trás', 'recua e contra-ataca'],
  side: ['Lado', 'golpe com passo lateral'],
  up: ['↑ (para cima)', 'no meio da sequência: lança o alvo para o alto'],
  down: ['↓ (para baixo)', 'no meio da sequência: derruba o alvo'],
};

function buildSteps(def) {
  const m = def.melee;
  const steps = [
    { title: 'ANDAR', cmd: ['@move'], text: 'Ande pelo cenário. A câmera fica sempre travada no adversário.', needs: ['move'] },
    { title: 'PULAR', cmd: ['@jump'], text: 'Pule. No ar dá para atacar e esquivar.', needs: ['jump'] },
    { title: 'DASH', cmd: ['@jump', '@jump'], text: 'Toque duas vezes no pulo para avançar rápido (com direção, vai para aquele lado).', needs: ['dash'] },
    { title: 'SEQUÊNCIA DE GOLPES', cmd: ['@physical', '@physical', '@physical', '…'], text: `Perto do alvo, aperte o físico várias vezes até o finalizador: <b>${m.strikes.at(-1).name}</b>.`, needs: ['finisher'] },
  ];
  for (const k of ['forward', 'back', 'side']) {
    if (!m[k]) continue;
    steps.push({ title: m[k].name.toUpperCase(), cmd: [DIRS[k][0], '+', '@physical'], text: `Segure a direção e aperte o físico: ${DIRS[k][1]}.`, needs: ['strike:' + k] });
  }
  for (const k of ['up', 'down']) {
    if (!m[k]) continue;
    steps.push({ title: m[k].name.toUpperCase(), cmd: ['@physical', '@physical', '→', DIRS[k][0], '+', '@physical'], text: `Comece a sequência e, no meio dela, segure ${DIRS[k][0]} e aperte o físico: ${DIRS[k][1]}.`, needs: ['strike:' + k] });
  }
  if (m.air) steps.push({ title: m.air.name.toUpperCase(), cmd: ['@jump', '→', '@physical'], text: 'Pule e aperte o físico ainda no ar.', needs: ['strike:air'] });
  if (def.ranged) {
    const r = def.ranged;
    steps.push({ title: r.name.toUpperCase(), cmd: ['@ranged'], text: r.chargeShot ? 'Ataque principal. SEGURE para mirar (mais tempo = mais dano) e solte para atirar.' : 'Ataque principal (à distância).', needs: ['ranged'] });
  }
  steps.push(
    { title: 'DEFESA', cmd: ['@block'], text: 'Segure a defesa por 1 segundo. Parado defende tudo; andando, anda mais rápido mas fica aberto.', needs: ['block'] },
    { title: 'ESQUIVA', cmd: ['@dodge', '+', 'direção'], text: 'Esquive para um lado. São 4 cargas — só gasta quando desvia de algo — e voltam conforme você toma dano. Apanhando, a esquiva vira SUBSTITUIÇÃO.', needs: ['dodge'] },
    { title: 'AGARRÃO', cmd: ['@block', '+', '@physical'], text: 'Bem perto do alvo: segure a defesa e aperte o físico. Não pode ser defendido.', needs: ['grab'] },
    { title: 'CARGA DE PODER', cmd: ['@carga'], text: 'Segure por 1 segundo para recuperar sanidade (a energia das habilidades). Andando, carrega pela metade.', needs: ['charge'] },
  );
  const tele = (def.abilities || []).find((a) => a.input === 'carga+jump');
  if (!tele) steps.push({ title: 'DASH LONGO', cmd: ['@carga', '+', '@jump'], text: 'Persegue o adversário de longe (gasta 10 de sanidade).', needs: ['dash:long'] });
  for (const a of def.abilities || []) {
    steps.push({ title: a.name.toUpperCase(), cmd: comboCmd(a.input), text: a.description || '', needs: ['ability:' + a.id], heal: a.type === 'healOverTime' });
  }
  steps.push({ title: `ESPECIAL: ${def.special.name.toUpperCase()}`, cmd: ['@carga', '→', '@carga', '→', '@physical'], text: 'Duas cargas seguidas e o físico. Custa 50 de sanidade (aqui a sanidade é infinita).', needs: ['special'] });
  return steps;
}

function comboCmd(input) {
  const [mod, btn] = input.split('+');
  // △ → ○ / △ → □: um toque depois do outro (Storm 4)
  const seq = input === 'carga+physical' || input === 'carga+ranged';
  return [`@${mod}`, seq ? '→' : '+', `@${btn}`];
}
