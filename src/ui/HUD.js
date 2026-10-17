import { viewSize } from '../core/viewport.js';
import { COMBAT } from '../config/combat.js';
import { actionLabel } from './labels.js';
import { t } from '../i18n/index.js';
import { SETTINGS } from '../config/settings.js';
import { ELEMENTS } from '../config/elements.js';
import { hasPassive } from '../combat/passives.js';
import * as THREE from 'three';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DMG_HOLD = 1.2; // segundos que o marcador fica depois do combo acabar
const SUBTITLE_WORD_INTERVAL = 0.12;
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
      <div id="riddle"><div class="rq"><small></small><p></p><i class="rt"><u></u></i></div><div class="ropts"></div></div>
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
    this.riddleEl = root.querySelector('#riddle');
    this.dmgState = [{ value: 0, hold: 0 }, { value: 0, hold: 0 }];
    this.bannerEl = root.querySelector('#banner');
    this.letterbox = root.querySelector('#letterbox');
    this.flashEl = root.querySelector('#flash');
    this.subtitleState = null;
    this.els = [];
  }

  show(v) {
    this.root.classList.toggle('hidden', !v);
  }

  setIntro(active) {
    this.root.classList.toggle('intro-scene', active);
  }

  // Limpa TUDO que é transitório (chamado ao montar e ao desmontar uma partida):
  // nada da luta anterior pode aparecer na próxima.
  reset() {
    this.setIntro(false);
    for (const el of [this.callEl, this.bannerEl]) { el.classList.remove('show'); }
    this.callEl.textContent = '';
    this.bannerEl.querySelector('.txt').textContent = '';
    this.subtitle(null);
    this.setCinematic(false);
    this.flashEl.style.transition = 'none';
    this.flashEl.style.opacity = '0';
    this.root.querySelectorAll('.popup').forEach((e) => e.remove());
    for (const p of this.panels) p.innerHTML = '';
    for (const d of this.dmgEls) { d.classList.remove('on', 'pop'); d.querySelector('b').textContent = ''; d.querySelector('small').textContent = t('hud.damage'); }
    this.vignette.classList.remove('on');
    this.npcBar.classList.remove('on');
    this.riddle(null);
    this.dmgState = [{ value: 0, hold: 0 }, { value: 0, hold: 0 }];
    this.timerEl.textContent = '';
    this.roundsEl.innerHTML = '';
    this.fighters = null;
    this.els = [];
    if (this.extraReset) this.extraReset();
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
        <div class="name"><span class="tag">${this.names && this.names[i] ? escapeHtml(this.names[i]) : `P${i + 1}`}</span><span>${def.name}</span>${ELEMENTS[def.element] ? `<span class="el" style="color:${ELEMENTS[def.element].color}">${ELEMENTS[def.element].name}</span>` : ''}</div>
        <div class="bar health"><div class="trail"></div><div class="fill"></div><div class="fx"></div></div>
        <div class="bar energy" title="Sanidade (PE): gasta em rituais, habilidades e especial"><div class="fill"></div><div class="mark" style="left:${(f.specialCost() / f.maxEnergy) * 100}%"></div></div>
        <div class="bar guard" title="Resistência da defesa"><div class="fill"></div></div>
        ${def.awakening ? `<div class="bar storm" title="Barra de Transformação: enche apanhando; cheia e com a vida baixa, segure ${actionLabel(i, 'carga', f.input.source)} até passar da sanidade cheia"><div class="fill"></div><div class="over"></div><span>${escapeHtml(def.awakening.name.toUpperCase())}</span></div>` : ''}
        <div class="row">
          <div class="dodges" title="Esquivas (recuperam conforme toma dano)"><span class="lbl">${t('hud.dodge')}</span><i></i><i></i><i></i><i></i></div>
          <div class="state"></div>
        </div>
        <div class="abilities">${abil.map((a) => `
          <div class="ab ${a.none ? 'none' : ''}" data-k="${a.key}" title="${a.name.replace(/"/g, '&quot;')}"><div class="cd"></div><div class="k"></div><div class="n${a.name.length > 18 || a.name.split(/\s+/).some((w) => w.length > 10) ? ' long' : ''}">${a.name}</div><div class="s"></div></div>`).join('')}
        </div>
        ${f.assists ? `<div class="bar teamg" title="Barra de Equipe: enche usando as assistências e trocando de personagem"><div class="fill"></div><span>${t('hud.team_gauge')}</span></div>` : ''}
        ${f.assists ? `<div class="assists">${f.assists.map((a, k) => `<div class="as" data-k="${k}" style="--ac:${a.def.color}"><i class="ak"></i><b>${a.def.name}</b><span class="acd"></span><i class="sk" title="Trocar de personagem"></i></div>`).join('')}</div>` : ''}
        <div class="buff"></div>
        <div class="msg"></div>`;
      return {
        p,
        abil,
        hp: p.querySelector('.bar.health'),
        hpFill: p.querySelector('.bar.health .fill'),
        hpTrail: p.querySelector('.bar.health .trail'),
        en: p.querySelector('.bar.energy .fill'),
        guard: p.querySelector('.bar.guard .fill'),
        storm: p.querySelector('.bar.storm'),
        teamg: p.querySelector('.bar.teamg'),
        guardBar: p.querySelector('.bar.guard'),
        state: p.querySelector('.state'),
        dodgePips: [...p.querySelectorAll('.dodges i')],
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
    if (action === 'carga+physical' || action === 'carga+ranged') return `${actionLabel(i, 'carga', source)}·${actionLabel(i, action.slice(6), source)}`;
    if (action.startsWith('carga+')) return `${actionLabel(i, 'carga', source)}+${actionLabel(i, action.slice(6), source)}`;
    if (action.startsWith('block+')) return `${actionLabel(i, 'block', source)}+${actionLabel(i, action.slice(6), source)}`;
    if (action.startsWith('ranged+')) return `${{ forward: '→', back: '←', side: '↕' }[action.slice(7)] || ''}${actionLabel(i, 'ranged', source)}`; // □ + direção (Anfitrião)
    return actionLabel(i, action, source);
  }

  update(match) {
    this.updateSubtitle(match?.lastDt || 0);
    if (!this.fighters) return;
    this.fighters.forEach((f, i) => {
      const e = this.els[i];
      const hp = Math.max(0, f.health / f.maxHealth);
      e.hpFill.style.width = `${hp * 100}%`;
      e.hpTrail.style.width = `${hp * 100}%`;
      e.hp.classList.toggle('low', hp < 0.3);
      // a vida não mostra número. Os PORTADORES (alguns só transformados: Ferreiro → Deus da Morte, Arnaldo →
      // Anfitrião) têm barra própria, com as cores e o efeito da Relíquia (def.hpBar.style → .hb-*)
      const hb = f.def.hpBar ? `hb-${f.def.hpBar.style}` : '';
      if (e.hpStyle !== hb) {
        if (e.hpStyle) e.hp.classList.remove(e.hpStyle, 'custom');
        if (hb) e.hp.classList.add(hb, 'custom');
        e.hpStyle = hb;
      }
      e.en.style.width = `${(f.energy / f.maxEnergy) * 100}%`;
      e.en.parentNode.classList.toggle('locked', hasPassive(f, 'noSanity')); // Erin sem sanidade: barra travada
      e.guard.style.width = `${(f.guard / f.maxGuard) * 100}%`;
      e.guardBar.classList.toggle('active', f.state === 'block');
      e.guardBar.classList.toggle('low', f.guard < f.maxGuard * 0.3);
      const stateText = { block: t(f.guardMoving ? 'hud.guard_open' : 'hud.blocking'), stun: t('hud.stunned'), pulled: t('hud.held'), dodge: f.def.dodge?.name ? f.def.dodge.name.toUpperCase() : t('hud.dodge') }[f.state] || '';
      if (e.storm) {
        e.storm.children[0].style.width = `${f.storm}%`;
        e.storm.children[1].style.width = `${(f.overcharge || 0) * 100}%`;
        e.storm.classList.toggle('full', f.storm >= 100);
        e.storm.classList.toggle('ready', f.canTransform());
      }
      // transformação disponível (barra cheia + vida baixa): avisa para segurar △
      const awakenHint = f.canTransform && f.canTransform() && (f.state === 'idle' || f.state === 'charging') ? t('hud.transform', { btn: actionLabel(i, 'carga', f.input.source) }) : '';
      e.state.textContent = stateText || awakenHint;
      e.state.classList.toggle('awaken', !stateText && !!awakenHint);
      this.updateDamageMarker(i, f, match);
      // Barra de Equipe
      if (e.teamg) {
        const k = (f.teamGauge || 0) / COMBAT.teamGauge.max;
        e.teamg.children[0].style.width = `${k * 100}%`;
        e.teamg.classList.toggle('full', k >= 1);
      }
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
      e.dodgePips[0].parentNode.classList.toggle('locked', f.dodgeLockout > 0);

      // (a Carga de Poder não tem mais contador na tela: △ → ○ e △ → △ → ○ são comandos tocados seguidos — Fighter)

      // ícones de habilidade com cooldown
      const source = f.input.source;
      e.abil.forEach((a, k) => {
        const el = e.abEls[k];
        if (e.lastSource !== source) el.querySelector('.k').textContent = a.none ? '' : this.keyText(i, a.action, source);
        if (a.none) return;
        if (a.key === 'special' && f.specialUsedUp()) {
          el.classList.add('none');
          el.querySelector('.s').textContent = t('hud.used');
          return;
        }
        const cd = f.cooldowns[a.key] || 0;
        const max = f.cooldownMax[a.key] || 1;
        el.querySelector('.cd').style.setProperty('--p', `${(cd / max) * 100}%`);
        el.querySelector('.s').textContent = cd > 0 ? Math.ceil(cd) : '';
        // quem paga com vida (Arthur, Erin sem sanidade) não fica "sem sanidade" na HUD
        const noCost = f.energy < a.cost && !hasPassive(f, 'bloodPrice');
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
    // A Marionete: barra de vida preta no topo + vinheta escura nas bordas (lutador não tem mais barra de chefe no
    // centro: os Portadores usam a própria barra, customizada)
    // (também o Carniçal da Esfinge da Nubi: n.bossBar)
    const mar = match && match.world && match.world.npcs.find((n) => (n.isMarionette || n.bossBar) && n.alive);
    this.vignette.classList.toggle('on', !!mar);
    this.npcBar.classList.toggle('on', !!mar);
    if (mar) {
      this.npcBar.querySelector('b').textContent = `${mar.name} · ${mar.owner.def.name}`;
      this.npcBar.querySelector('.fill').style.width = `${Math.max(0, mar.hp / mar.maxHp) * 100}%`;
      // as MARCAS do enigma (Carniçal da Esfinge): um traço em cada uma; apagam depois de usadas
      const marks = mar.cfg && mar.cfg.marks ? mar.cfg.marks : [];
      const key = marks.map((m) => `${m}:${mar.marksLeft && mar.marksLeft.includes(m) ? 1 : 0}`).join(',');
      if (this.npcMarksKey !== key) {
        this.npcMarksKey = key;
        const bar = this.npcBar.querySelector('.bar');
        bar.querySelectorAll('.mk').forEach((e) => e.remove());
        for (const m of marks) {
          const e = document.createElement('i');
          e.className = `mk${mar.marksLeft && mar.marksLeft.includes(m) ? '' : ' used'}`;
          e.style.left = `${m * 100}%`;
          bar.appendChild(e);
        }
      }
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
    const text = el.querySelector('span');
    if (!s) {
      this.subtitleState = null;
      text.textContent = '';
      el.classList.remove('on');
      return;
    }
    el.querySelector('b').textContent = s.name;
    el.querySelector('b').style.color = s.color;
    text.textContent = '';
    text.style.borderColor = s.color;
    el.classList.toggle('right', s.side === 1);
    this.subtitleState = {
      words: s.text.trim().split(/\s+/).filter(Boolean),
      elapsed: 0,
      shown: 0,
    };
    this.showNextSubtitleWord();
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
  }

  updateSubtitle(dt) {
    const state = this.subtitleState;
    if (!state || state.shown >= state.words.length) return;
    state.elapsed += dt;
    while (state.elapsed >= SUBTITLE_WORD_INTERVAL && state.shown < state.words.length) {
      state.elapsed -= SUBTITLE_WORD_INTERVAL;
      this.showNextSubtitleWord();
    }
  }

  showNextSubtitleWord() {
    const state = this.subtitleState;
    if (!state || state.shown >= state.words.length) return;
    const word = document.createElement('i');
    word.className = 'subtitle-word';
    word.textContent = state.words[state.shown];
    if (state.shown > 0) this.subEl.querySelector('span').append(' ');
    this.subEl.querySelector('span').append(word);
    state.shown++;
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
    const { w: W, h: H } = viewSize();
    const sx = (_v.x * 0.5 + 0.5) * W;
    const sy = (-_v.y * 0.5 + 0.5) * H;
    _v.set(opp.pos.x, opp.pos.y + 2.3, opp.pos.z).project(cam);
    const ox = (_v.x * 0.5 + 0.5) * W;
    const side = sx <= ox ? -1 : 1;
    const x = Math.max(70, Math.min(W - 70, sx + side * 90));
    const y = Math.max(150, Math.min(H - 60, sy));
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

  // ENIGMA DA ESFINGE (combat/riddle.js): a pergunta e as quatro respostas no losango Y / X / B / A, com o botão de
  // quem responde (controle, teclado ou tela). r = null esconde. No celular, tocar na resposta também responde.
  riddle(r) {
    const el = this.riddleEl;
    if (!el) return;
    el.classList.toggle('on', !!r);
    el.classList.remove('done');
    if (!r) return;
    const inp = r.victim.input || {};
    const src = inp.source === 'cpu' ? 'gamepad' : inp.source;
    el.querySelector('small').textContent = `${r.sphinx.name} · ${r.victim.def.name} RESPONDE`;
    el.querySelector('p').textContent = r.q;
    const box = el.querySelector('.ropts');
    box.innerHTML = '';
    for (const o of r.opts) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `ro ro-${o.key}`;
      b.dataset.key = o.key;
      b.innerHTML = `<kbd></kbd><span></span>`;
      b.querySelector('kbd').textContent = actionLabel(inp.index ?? 0, o.key, src);
      b.querySelector('span').textContent = o.text;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); this.onRiddleTap && this.onRiddleTap(o.key, r.victim); });
      box.appendChild(b);
    }
    this.riddleTick(r);
  }

  riddleTick(r) {
    const el = this.riddleEl;
    if (!el || !r) return;
    el.querySelector('.rt u').style.width = `${Math.max(0, r.left / 10) * 100}%`;
    if (r.phase === 'result' && !el.classList.contains('done')) {
      el.classList.add('done');
      el.querySelectorAll('.ro').forEach((b) => {
        const o = r.opts.find((x) => x.key === b.dataset.key);
        b.classList.toggle('right', o.right);
        b.classList.toggle('picked', o.key === r.chosen);
      });
      el.querySelector('small').textContent = r.right ? 'RESPOSTA CERTA — A ESFINGE PARALISA' : r.chosen ? 'RESPOSTA ERRADA — DEVORADO' : 'SEM RESPOSTA — DEVORADO';
    }
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
