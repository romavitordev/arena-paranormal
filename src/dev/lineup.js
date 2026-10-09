// Depuração: mostra retratos lado a lado num painel por cima do jogo (para comparar modelos).
// uso no console: await (await import('/src/dev/lineup.js')).lineup(['jae', 'aguiar'], { full: true, turns: [0.35, 3.5] })
import { renderPortraits } from '../ui/portraits.js';
import { preloadModels } from '../models/index.js';

export async function lineup(models, { full = true, turns = [0.35], w = 260, h = 420, anim = 'idle', animTime = 0.3, zoom = null } = {}) {
  await preloadModels();
  const renderer = window.__game.renderer;
  let box = document.getElementById('__lineup');
  if (!box) {
    box = document.createElement('div');
    box.id = '__lineup';
    box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#111;display:flex;flex-wrap:wrap;gap:4px;padding:4px;overflow:auto';
    box.onclick = () => box.remove();
    document.body.appendChild(box);
  }
  box.innerHTML = '';
  for (const turn of turns) {
    const defs = models.map((m) => ({ id: m + '_' + turn, model: m, color: '#444444', anims: {} }));
    const out = renderPortraits(defs, renderer, { full, turn, w, h, anim, animTime, background: false });
    for (const d of defs) {
      const img = new Image();
      img.src = out[d.id];
      img.style.cssText = `width:${w}px;height:${h}px;background:#3a3440` + (zoom ? `;object-fit:none;object-position:${zoom}` : '');
      box.appendChild(img);
    }
  }
  return models.length * turns.length;
}
