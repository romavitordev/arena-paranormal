// OPÇÕES (v3.27): uma tela só, em seções (Som · Imagem · Partida · Idioma), pensada para ser fácil em qualquer aparelho.
//   - linhas de VOLUME com barra arrastável (mouse e toque) e o valor em %; tocar no valor liga/desliga o mudo;
//   - escolhas curtas viram botões lado a lado (Qualidade gráfica, Efeitos de tela); as longas (Tempo, Idioma) viram
//     ◀ valor ▶;
//   - controle / teclado: ↑ ↓ escolhem a linha, ◀ ▶ ajustam (a barra anda de 5 em 5), A/× também avança, B/○ volta;
//   - embaixo, uma linha explica o que a opção selecionada faz.
// A tela não guarda nada sozinha: cada mudança chama `onChange(id, valor)` (main.js aplica e salva). Trocar o idioma
// pede a tela de novo (`'relabel'`), na mesma linha.
import { t } from '../i18n/index.js';

const OK = 'A/×';
const BACK = 'B/○';
const confirm = (p) => p.pressed.jump;
const back = (p) => p.pressed.physical;

export class OptionsScreen {
  // rows: [{ section, id, kind: 'slider'|'choice', label, desc, get(), set(v), choices?: [{ v, label }], step? }]
  constructor(root, { rows, audio, onChange, focus = 0 }) {
    this.rows = rows;
    this.audio = audio;
    this.onChange = onChange;
    this.index = Math.min(focus, rows.length); // rows.length = o botão VOLTAR
    this.el = document.createElement('div');
    this.el.className = 'screen clear';
    this.el.id = 'options';
    let html = `<div class="opt-panel"><h2>${t('menu.options')}</h2><div class="opt-list">`;
    let sec = null;
    rows.forEach((r, i) => {
      if (r.section !== sec) { sec = r.section; html += `<div class="opt-sec">${sec}</div>`; }
      html += `<div class="opt-row" data-i="${i}"><span class="opt-label">${r.label}</span><span class="opt-ctl">${this.controlHTML(r)}</span></div>`;
    });
    html += `</div><div class="opt-desc"></div><div class="opt-foot"><button type="button" class="opt-back">◀ ${t('ui.back')}</button><span class="opt-hint">${t('opt.hint', { ok: OK, back: BACK })}</span></div></div>`;
    this.el.innerHTML = html;
    root.appendChild(this.el);
    this.rowEls = [...this.el.querySelectorAll('.opt-row')];
    this.descEl = this.el.querySelector('.opt-desc');
    this.backEl = this.el.querySelector('.opt-back');
    this.backEl.addEventListener('click', () => { this.clickedBack = true; });
    this.rowEls.forEach((rowEl, i) => this.bind(rowEl, rows[i], i));
    this.render();
  }

  controlHTML(r) {
    if (r.kind === 'slider') {
      return '<span class="opt-slider"><span class="opt-track"><span class="opt-fill"></span><span class="opt-knob"></span></span></span><button type="button" class="opt-val"></button>';
    }
    if (r.choices.length <= 4) return `<span class="opt-seg">${r.choices.map((c, k) => `<button type="button" data-k="${k}">${c.label}</button>`).join('')}</span>`;
    return '<span class="opt-step"><button type="button" class="opt-prev">◀</button><span class="opt-cur"></span><button type="button" class="opt-next">▶</button></span>';
  }

  bind(rowEl, r, i) {
    rowEl.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && this.index !== i) { this.index = i; this.render(); } });
    if (r.kind === 'slider') {
      const track = rowEl.querySelector('.opt-track');
      const setFrom = (e) => {
        const b = track.getBoundingClientRect();
        const k = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width));
        this.apply(r, Math.round(k * 100), false);
      };
      track.parentElement.addEventListener('pointerdown', (e) => {
        this.index = i;
        this.dragging = r;
        track.parentElement.setPointerCapture(e.pointerId);
        setFrom(e);
        e.preventDefault();
      });
      track.parentElement.addEventListener('pointermove', (e) => { if (this.dragging === r) setFrom(e); });
      const end = () => { if (this.dragging === r) { this.dragging = null; this.preview(r); } };
      track.parentElement.addEventListener('pointerup', end);
      track.parentElement.addEventListener('pointercancel', end);
      // tocar no número: mudo ↔ volta ao volume de antes
      rowEl.querySelector('.opt-val').addEventListener('click', () => {
        this.index = i;
        const cur = r.get();
        if (cur > 0) { r.lastOn = cur; this.apply(r, 0); } else this.apply(r, r.lastOn || 100);
      });
      return;
    }
    rowEl.querySelectorAll('.opt-seg button').forEach((bt) => bt.addEventListener('click', () => { this.index = i; this.apply(r, r.choices[+bt.dataset.k].v); }));
    const prev = rowEl.querySelector('.opt-prev');
    const next = rowEl.querySelector('.opt-next');
    if (prev) prev.addEventListener('click', () => { this.index = i; this.shift(r, -1); });
    if (next) next.addEventListener('click', () => { this.index = i; this.shift(r, 1); });
  }

  // ajusta uma linha (◀ ▶ do controle, clique, arraste)
  apply(r, v, sound = true) {
    if (r.get() === v) { this.render(); return; }
    r.set(v);
    const res = this.onChange && this.onChange(r.id, v);
    if (res === 'relabel') { this.relabel = true; return; }
    if (sound) this.preview(r);
    this.render();
  }

  // um som de teste no canal que mudou (o volume novo já vale)
  preview(r) {
    if (!this.audio) return;
    if (r.id === 'volSfx') this.audio.play('punch');
    else if (r.id === 'volHum') { this.audio.startLoop('optPreview', 'chargeHum'); clearTimeout(this.humT); this.humT = setTimeout(() => this.audio.stopLoop('optPreview'), 600); } else this.audio.play('select');
  }

  shift(r, dir) {
    if (r.kind === 'slider') { this.apply(r, Math.max(0, Math.min(100, r.get() + dir * (r.step || 5)))); return; }
    const k = r.choices.findIndex((c) => c.v === r.get());
    const n = r.choices.length;
    this.apply(r, r.choices[((k < 0 ? 0 : k) + dir + n) % n].v);
  }

  render() {
    this.rowEls.forEach((rowEl, i) => {
      const r = this.rows[i];
      rowEl.classList.toggle('on', i === this.index);
      if (r.kind === 'slider') {
        const v = r.get();
        rowEl.querySelector('.opt-fill').style.width = `${v}%`;
        rowEl.querySelector('.opt-knob').style.left = `${v}%`;
        const val = rowEl.querySelector('.opt-val');
        val.textContent = v ? `${v}%` : '🔇';
        val.classList.toggle('muted', !v);
      } else if (r.choices.length <= 4) {
        rowEl.querySelectorAll('.opt-seg button').forEach((bt) => bt.classList.toggle('sel', r.choices[+bt.dataset.k].v === r.get()));
      } else {
        const c = r.choices.find((x) => x.v === r.get());
        rowEl.querySelector('.opt-cur').textContent = c ? c.label : '';
      }
    });
    this.backEl.classList.toggle('on', this.index === this.rows.length);
    const r = this.rows[this.index];
    this.descEl.textContent = r ? r.desc || '' : t('opt.desc.back');
    const cur = this.index < this.rows.length ? this.rowEls[this.index] : this.backEl;
    if (cur && cur.scrollIntoView && this.lastShown !== this.index) { cur.scrollIntoView({ block: 'nearest' }); this.lastShown = this.index; }
  }

  update(input) {
    if (this.relabel) { this.relabel = false; return 'relabel'; }
    if (this.clickedBack) { this.clickedBack = false; this.audio?.play('select'); return 'back'; }
    const n = this.rows.length + 1;
    for (const p of input.players) {
      if (p.menu.up) { this.index = (this.index + n - 1) % n; this.audio?.play('select'); this.render(); }
      if (p.menu.down) { this.index = (this.index + 1) % n; this.audio?.play('select'); this.render(); }
      const r = this.rows[this.index];
      if (r && p.menu.left) this.shift(r, -1);
      if (r && p.menu.right) this.shift(r, 1);
      if (confirm(p)) {
        if (!r) { this.audio?.play('select'); return 'back'; }
        if (r.kind === 'choice') this.shift(r, 1);
      }
      if (back(p) || p.pressed.start) { this.audio?.play('select'); return 'back'; }
    }
    if (input.keyPressedOnce('Escape')) { this.audio?.play('select'); return 'back'; }
    if (input.keyPressedOnce('Enter') && this.index === this.rows.length) { this.audio?.play('select'); return 'back'; }
    return this.relabel ? (this.relabel = false, 'relabel') : null;
  }

  dispose() {
    if (this.humT) { clearTimeout(this.humT); this.audio?.stopLoop('optPreview'); }
    this.el.remove();
  }
}
