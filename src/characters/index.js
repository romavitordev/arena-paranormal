import kaiser from './kaiser.js';
import arthur from './arthur.js';
import joui from './joui.js';
import aghata from './aghata.js';
import gal_sal from './gal_sal.js';
import kian from './kian.js';
import dante from './dante.js';
import erin from './erin.js';
import aguiar from './aguiar.js';
import labirinto from './labirinto.js';
import xande from './xande.js';
import lirio from './lirio.js';
import ferreiro from './ferreiro.js';
import juan from './juan.js';
import kemi from './kemi.js';
import balu from './balu.js';

// Elenco jogável, na ordem da tela de seleção.
// Para adicionar um personagem: crie o arquivo de definição aqui, registre o
// modelo em models/index.js e acrescente nesta lista.
export const ROSTER = [kaiser, arthur, joui, aghata, dante, erin, gal_sal, kian, aguiar, labirinto, xande, lirio, ferreiro, juan, kemi, balu];

// RITMO DOS COMBOS (stats.attackSpeed): > 1 deixa os golpes físicos mais rápidos (duração, janelas de acerto,
// movimentos e invulnerabilidade escalam juntos; a animação acompanha porque toca com a duração do golpe).
// Aplicado uma vez, ao carregar. Ágeis/leves acima de 1; pesados em 1 (aguentam pela vida); Juan abaixo de 1.
export function applyAttackSpeed(def) {
  const k = def.stats && def.stats.attackSpeed;
  if (!k || k === 1 || def.attackSpeedApplied) return def;
  def.attackSpeedApplied = true;
  const scale = (s) => {
    if (!s || typeof s !== 'object') return;
    if (s.dur) s.dur /= k;
    if (s.active) s.active = s.active.map((t) => t / k);
    if (s.actives) s.actives = s.actives.map((w) => w.map((t) => t / k));
    if (s.iframes) s.iframes = s.iframes.map((t) => t / k);
    if (s.motion) s.motion = s.motion.map((m) => ({ ...m, t: m.t.map((t) => t / k) }));
  };
  const m = def.melee || {};
  (m.strikes || []).forEach(scale);
  for (const key of ['up', 'down', 'forward', 'back', 'side', 'air', 'ground']) scale(m[key]);
  return def;
}
ROSTER.forEach(applyAttackSpeed);

export function getCharacter(id) {
  return ROSTER.find((c) => c.id === id);
}
