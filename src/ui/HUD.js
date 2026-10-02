import { COMBAT } from '../config/combat.js';
import { actionLabel } from './labels.js';
import { SETTINGS } from '../config/settings.js';
import { ELEMENTS } from '../config/elements.js';
import * as THREE from 'three';

const DMG_HOLD = 1.2; // segundos que o marcador fica depois do combo acabar
const _v = new THREE.Vector3();

const COMBO_STATES = new Set(['hitstun', 'stun', 'pulled', 'grabbed', 'downed']);

// HUD em DOM sobre o canvas. Lê o estado dos lutadores a cada frame.
export class HUD {
  constructor(root) {
    this.root = root;
    root.innerHTML = `
      <div id="letterbox"></div>
      <div class="panel p1"></div>
      <div class="panel p2"></div>
      <div id="center"><div id="timer">99</div><div class="rounds"></div></div>
      <div id="vignette"></div>
      <div id="npcbar"><b></b><div class="bar"><div class="fill"></div></div></div>
      <div class="dmg p1"><small>DANO</small><b></b></div>
      <div class="dmg p2"><small>DANO</small><b></b></div>
      <div id="callout"></div>
      <div id="subtitle"><b></b><span></span></div>
      <div id="banner"><div class="stripe"></div><div class="txt"></div></div>
      <div id="flash"></div>`;
    this.panels = [root.querySelector('.panel.p1'), root.querySelector('.panel.p2')];
    this.timerEl = root.querySelector('#timer');
    this.roundsEl = root.querySelector('.rounds');
    this.callEl = root.querySelector('#callout');
    this.subEl = root.querySelector('#subtitle');
    this.dmgEls = [root.querySelector('.dmg.p1'), root.querySelector('.dmg.p2')];
    this.vignette = root.querySelector('#vignette');
    this.npcBar = root.querySelector('#npcbar');
    this.dmgState = [{ value: 0, hold: 0 }, { value: 0, hold: 0 }];
    this.bannerEl = root.querySelector('#banner');
    this.letterbox = root.querySelector('#letterbox');
    this.flashEl = root.querySelector('#flash');
    this.els = [];
  }

  show(v) {
    this.root.classList.toggle('hidden', !v);
  }

  // Limpa TUDO que é transitório (chamado ao montar e ao desmontar uma partida):
  // nada da luta anterior pode aparecer na próxima.
  reset() {
    for (const el of [this.callEl, this.bannerEl]) { el.classList.remove('show'); }
    this.callEl.textContent = '';
    this.bannerEl.querySelector('.txt').textContent = '';
    this.subtitle(null);
    this.setCinematic(false);
    this.flashEl.style.transition = 'none';
    this.flashEl.style.opacity = '0';
    this.root.querySelectorAll('.popup').forEach((e) => e.remove());
    for (const p of this.panels) p.innerHTML = '';
    for (const d of this.dmgEls) { d.classList.remove('on', 'pop'); d.querySelector('b').textContent = ''; }
    this.vignette.classList.remove('on');
    this.npcBar.classList.remove('on');
    this.dmgState = [{ value: 0, hold: 0 }, { value: 0, hold: 0 }];
    this.timerEl.textContent = '';
    this.roundsEl.innerHTML = '';
    this.fighters = null;
    this.els = [];
    if (this.extraReset) this.extraReset();
  }

  // Tutorial ligado: mostra os comandos dos ataques nos ícones da HUD
  setTutorial(on) {
    this.root.classList.toggle('tutorial', !!on);
  }

  bind(fighters) {
    this.fighters = fighters;
    this.els = fighters.map((f, i) => {
      const p = this.panels[i];
      const def = f.def;
      const abil = [];
      abil.push({ key: 'ranged', action: 'ranged', name: def.ranged ? def.ranged.name : '—', none: !def.ranged, cost: def.ranged?.energyCost || 0 });
      for (const a of def.abilities || []) abil.push({ key: a.id, action: a.input, name: a.name, cost: a.energyCost || 0 });
      abil.push({ key: 'special', action: 'special', name: def.special ? def.special.name : '—', none: !def.special, cost: f.specialCost() });
      abil.push({ key: 'dodge', action: 'dodge', name: def.dodge?.name || 'Esquiva', cost: 0 });
      p.style.setProperty('--c', def.color);
      p.innerHTML = `
        <div class="name"><span class="tag">P${i + 1}</span><span>${def.name}</span>${ELEMENTS[def.element] ? `<span class="el" style="color:${ELEMENTS[def.element].color}">${ELEMENTS[def.element].name}</span>` : ''}</div>
        <div class="bar health"><div class="trail"></div><div class="fill"></div><div class="num"></div></div>
        <div class="bar energy" title="Sanidade (PE): gasta em rituais, habilidades e especial"><div class="fill"></div><div class="mark" style="left:${(f.specialCost() / f.maxEnergy) * 100}%"></div></div>
        <div class="bar guard" title="Resistência da defesa"><div class="fill"></div></div>
        <div class="row">
          <div class="carga" title="Carga de Poder"><span class="lbl">CARGA</span><i class="pip"></i><i class="pip"></i><b class="go">ESPECIAL</b></div>
          <div class="dodges" title="Esquivas (recuperam conforme toma dano)"><span class="lbl">ESQUIVA</span><i></i><i></i><i></i><i></i></div>
          <div class="state"></div>
        </div>
        <div class="abilities">${abil.map((a) => `
          <div class="ab ${a.none ? 'none' : ''}" data-k="${a.key}"><div class="cd"></div><div class="k"></div><div class="n">${a.name}</div><div class="s"></div></div>`).join('')}
        </div>
        ${f.assists ? `<div class="assists">${f.assists.map((a, k) => `<div class="as" data-k="${k}" style="--ac:${a.def.color}"><i class="ak"></i><b>${a.def.name}</b><span class="acd"></span><i class="sk" title="Trocar de personagem"></i></div>`).join('')}</div>` : ''}
        <div class="buff"></div>
        <div class="msg"></div>`;
      return {
        p,
        abil,
        hp: p.querySelector('.bar.health'),
        hpFill: p.querySelector('.bar.health .fill'),
        hpTrail: p.querySelector('.bar.health .trail'),
        hpNum: p.querySelector('.bar.health .num'),
        en: p.querySelector('.bar.energy .fill'),
        guard: p.querySelector('.bar.guard .fill'),
        guardBar: p.querySelector('.bar.guard'),
        state: p.querySelector('.state'),
        dodgePips: [...p.querySelectorAll('.dodges i')],
        pips: [...p.querySelectorAll('.pip')],
        go: p.querySelector('.go'),
        abEls: [...p.querySelectorAll('.ab')],
        buff: p.querySelector('.buff'),
        msg: p.querySelector('.msg'),
        asEls: [...p.querySelectorAll('.as')],
        lastSource: null,
      };
    });
  }

  keyText(i, action, source) {
    if (action === 'special') return `${actionLabel(i, 'carga', source)}·${actionLabel(i, 'carga', source)}·${actionLabel(i, 'physical', source)}`;
    if (action === 'carga+jump') return `${actionLabel(i, 'carga', source)}+${actionLabel(i, 'jump', source)}`;
    if (action.startsWith('mod+')) return `${actionLabel(i, 'mod', source)}+${actionLabel(i, action.slice(4), source)}`;
    return actionLabel(i, action, source);
  }

  update(match) {
    if (!this.fighters) return;
    this.fighters.forEach((f, i) => {
      const e = this.els[i];
      const hp = Math.max(0, f.health / f.maxHealth);
      e.hpFill.style.width = `${hp * 100}%`;
      e.hpTrail.style.width = `${hp * 100}%`;
      e.hpNum.textContent = Math.ceil(f.health);
      e.hp.classList.toggle('low', hp < 0.3);
      e.en.style.width = `${(f.energy / f.maxEnergy) * 100}%`;
      e.guard.style.width = `${(f.guard / f.maxGuard) * 100}%`;
      e.guardBar.classList.toggle('active', f.state === 'block');
      e.guardBar.classList.toggle('low', f.guard < f.maxGuard * 0.3);
      const stateText = { block: f.guardMoving ? 'DEFESA ABERTA' : 'DEFENDENDO', stun: 'ATORDOADO', pulled: 'PRESO', dodge: (f.def.dodge?.name || 'ESQUIVA').toUpperCase() }[f.state] || '';
      // Transcender disponível (vida baixa): avisa para segurar △
      const awakenHint = f.canAwaken && f.canAwaken() && (f.state === 'idle' || f.state === 'charging') ? `SEGURE ${actionLabel(i, 'carga', f.input.source)}: TRANSCENDER` : '';
      e.state.textContent = stateText || awakenHint;
      e.state.classList.toggle('awaken', !stateText && !!awakenHint);
      this.updateDamageMarker(i, f, match);
      // assistências: pronta / em campo / recarregando
      if (f.assists) {
        f.assists.forEach((a, k) => {
          const el = e.asEls[k];
          if (!el) return;
          el.classList.toggle('ready', a.ready);
          el.classList.toggle('active', !!a.active);
          el.querySelector('.acd').textContent = a.cooldown > 0 ? Math.ceil(a.cooldown) : '';
          el.style.setProperty('--p', `${(a.cooldown / 18) * 100}%`);
          el.querySelector('.ak').textContent = actionLabel(i, k ? 'assist2' : 'assist1', f.input.source);
          // troca de personagem (analógico direito): mostra a tecla e se está liberada
          const sk = el.querySelector('.sk');
          sk.textContent = `⇄ ${actionLabel(i, k ? 'switch2' : 'switch1', f.input.source)}`;
          sk.classList.toggle('off', f.cooldowns.switch > 0 || !!a.active);
        });
      }
      e.dodgePips.forEach((pip, k) => pip.classList.toggle('on', f.dodges > k));

      // Carga de Poder: etapas da sequência
      const st = f.carga.stage;
      e.pips.forEach((pip, k) => pip.classList.toggle('on', st > k));
      const armed = st >= 2;
      const avail = f.specialAvailable();
      e.go.classList.toggle('ready', armed && avail);
      e.go.classList.toggle('blocked', armed && !avail);
      const tut = SETTINGS.tutorial;
      e.go.textContent = armed ? (avail ? (tut ? `${actionLabel(i, 'physical', f.input.source)} → ESPECIAL!` : 'ESPECIAL!') : (f.cooldowns.special > 0 ? 'RECARREGANDO' : 'SEM SANIDADE')) : 'ESPECIAL';

      // ícones de habilidade com cooldown
      const source = f.input.source;
      e.abil.forEach((a, k) => {
        const el = e.abEls[k];
        if (e.lastSource !== source) el.querySelector('.k').textContent = a.none ? '' : this.keyText(i, a.action, source);
        if (a.none) return;
        if (a.key === 'special' && f.specialUsedUp()) {
          el.classList.add('none');
          el.querySelector('.s').textContent = 'USADO';
          return;
        }
        const cd = f.cooldowns[a.key] || 0;
        const max = f.cooldownMax[a.key] || 1;
        el.querySelector('.cd').style.setProperty('--p', `${(cd / max) * 100}%`);
        el.querySelector('.s').textContent = cd > 0 ? Math.ceil(cd) : '';
        const noCost = f.energy < a.cost;
        el.classList.toggle('nocost', noCost && cd <= 0);
        el.classList.toggle('ready', cd <= 0 && !noCost);
      });
      e.lastSource = source;

      e.buff.textContent = f.buffs.filter((x) => x.name).map((b) => {
        const extra = b.shots !== undefined ? `${b.shots} tiro(s) amaldiçoado(s)`
          : b.mult ? `${b.mult > 1 ? '+' : '−'}${Math.round(Math.abs(b.mult - 1) * 100)}% dano${b.type === 'mist' ? ' · esquiva melhor' : ''}`
          : b.rangeBonus ? 'mais alcance · sangramento' : b.noRegen ? 'sem regenerar sanidade' : '';
        return `${b.name} — ${extra} — ${Number.isFinite(b.time) ? b.time.toFixed(1) + 's' : 'até o fim do round'}`;
      }).join(' | ');
      e.msg.textContent = f.message ? f.message.text : '';
    });
    // A Marionete: barra de vida preta no topo + vinheta escura nas bordas enquanto ela existir
    const mar = match && match.world && match.world.npcs.find((n) => n.isMarionette && n.alive);
    this.vignette.classList.toggle('on', !!mar);
    this.npcBar.classList.toggle('on', !!mar);
    if (mar) {
      this.npcBar.querySelector('b').textContent = `${mar.name} · ${mar.owner.def.name}`;
      this.npcBar.querySelector('.fill').style.width = `${Math.max(0, mar.hp / mar.maxHp) * 100}%`;
    }
    if (match) {
      this.timerEl.textContent = !SETTINGS.timer || match.training ? '∞' : Math.max(0, Math.ceil(match.timer));
      const need = SETTINGS.rounds || COMBAT.roundsToWin;
      let html = '';
      for (let k = 0; k < need; k++) html += `<i class="p1 ${match.wins[0] > k ? 'on' : ''}"></i>`;
      html += '<span style="width:10px"></span>';
      for (let k = need - 1; k >= 0; k--) html += `<i class="p2 ${match.wins[1] > k ? 'on' : ''}"></i>`;
      this.roundsEl.innerHTML = html;
    }
  }

  // Fala de personagem (intro). null esconde.
  subtitle(s) {
    const el = this.subEl;
    if (!s) { el.classList.remove('on'); return; }
    el.querySelector('b').textContent = s.name;
    el.querySelector('b').style.color = s.color;
    el.querySelector('span').textContent = s.text;
    el.classList.toggle('right', s.side === 1);
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
  }

  // Marcador de dano do combo (estilo Storm 4): mostra só o dano do combo ATUAL de quem está batendo,
  // perto dele na tela; quando o combo acaba, fica um instante e some.
  updateDamageMarker(i, f, match) {
    const el = this.dmgEls[i];
    const st = this.dmgState[i];
    const opp = this.fighters[1 - i];
    const dt = match && match.lastDt ? match.lastDt : 1 / 60;
    const inCombo = opp && COMBO_STATES.has(opp.state) && (opp.comboDamage || 0) > 0;
    if (inCombo) {
      const v = Math.round(opp.comboDamage);
      if (v !== st.value) {
        st.value = v;
        el.querySelector('b').textContent = v;
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
      }
      st.hold = DMG_HOLD;
    } else if (st.hold > 0) {
      st.hold -= dt;
      if (st.hold <= 0) st.value = 0;
    }
    const visible = st.hold > 0 && st.value > 0;
    el.classList.toggle('on', visible);
    if (!visible || !match || !match.world) return;
    // posição: acima e ao lado de quem está batendo, para fora do centro da luta
    const cam = match.world.camera;
    _v.set(f.pos.x, f.pos.y + 2.3, f.pos.z).project(cam);
    const sx = (_v.x * 0.5 + 0.5) * innerWidth;
    const sy = (-_v.y * 0.5 + 0.5) * innerHeight;
    _v.set(opp.pos.x, opp.pos.y + 2.3, opp.pos.z).project(cam);
    const ox = (_v.x * 0.5 + 0.5) * innerWidth;
    const side = sx <= ox ? -1 : 1;
    const x = Math.max(70, Math.min(innerWidth - 70, sx + side * 90));
    const y = Math.max(150, Math.min(innerHeight - 60, sy));
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -50%)`;
  }

  callout(text, color = '#fff') {
    const el = this.callEl;
    el.textContent = text;
    el.style.color = color;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  banner(name, color) {
    const el = this.bannerEl;
    const txt = el.querySelector('.txt');
    txt.textContent = name;
    // frases mais longas ("Arma de Sangue!", "Injustiça né?") usam letra menor
    txt.style.fontSize = name.length > 12 ? 'clamp(44px, 8.5vw, 110px)' : name.length > 9 ? 'clamp(54px, 10.5vw, 135px)' : '';
    el.style.setProperty('--c', color);
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  setCinematic(on) {
    this.letterbox.classList.toggle('on', on);
    this.root.classList.toggle('cine', on);
  }

  flash(color, time) {
    const el = this.flashEl;
    el.style.background = color;
    el.style.transition = 'none';
    el.style.opacity = '0.8';
    void el.offsetWidth;
    el.style.transition = `opacity ${time * 3}s ease-out`;
    el.style.opacity = '0';
  }

  popup(i, text, color) {
    const p = this.panels[i];
    const el = document.createElement('div');
    el.className = 'popup';
    el.textContent = text;
    el.style.color = color;
    el.style.top = '64px';
    el.style[i === 0 ? 'left' : 'right'] = `${30 + Math.random() * 120}px`;
    p.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}
