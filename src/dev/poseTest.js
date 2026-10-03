// Teste de pose (V4 — etapa 15): renderiza cada personagem nas 9 poses extremas para achar deformação
// (ombro, cotovelo, punho, quadril, joelho, tornozelo) e roupa atravessando o corpo.
// Uso no console: const t = await import('/src/dev/poseTest.js'); t.poseSheet(['gal_sal', 'aguiar']);
import { renderPortraits } from '../ui/portraits.js';
import { ROSTER } from '../characters/index.js';

export const TEST_POSES = [
  { label: 'T', anim: 'pose_t', t: 0.5 },
  { label: 'braço levantado', anim: 'pose_arm_up', t: 0.5 },
  { label: 'soco', anim: 'cross', t: 0.16 },
  { label: 'chute', anim: 'kick_front', t: 0.13 },
  { label: 'corrida', anim: 'run', t: 0.18 },
  { label: 'salto', anim: 'jump', t: 0.2 },
  { label: 'agachamento', anim: 'pose_crouch', t: 0.5 },
  { label: 'defesa', anim: 'block', t: 0.3 },
  { label: 'arma', anim: 'slash_v', t: 0.18 },
];

// mostra uma folha: uma linha por personagem, uma coluna por pose (clique fecha)
export function poseSheet(ids, { w = 170, h = 280, turn = 0.6, poses = TEST_POSES, cols = poses.length } = {}) {
  const renderer = window.__game.renderer;
  const defs = ROSTER.filter((d) => ids.includes(d.id));
  document.getElementById('pv')?.remove();
  const box = document.createElement('div');
  box.id = 'pv';
  box.style.cssText = `position:fixed;inset:0;z-index:9999;background:#222;display:grid;grid-template-columns:repeat(${cols},1fr);gap:2px;align-content:start;overflow:auto`;
  for (const d of defs) {
    for (const p of poses) {
      // o clipe "salto" e "soco" etc. vêm do mapa de animações do personagem (ex.: Arthur usa os de um braço)
      const img = new Image();
      const out = renderPortraits([d], renderer, { w, h, full: true, turn, anim: p.anim, animTime: p.t, background: true });
      img.src = out[d.id];
      img.title = `${d.name} — ${p.label}`;
      img.style.width = '100%';
      box.appendChild(img);
    }
  }
  box.onclick = () => box.remove();
  document.body.appendChild(box);
  return defs.length * poses.length;
}
