import { COMBAT } from '../config/combat.js';
import { ELEMENTS } from '../config/elements.js';

// Lista de comandos de um personagem (usada em PAUSE → COMANDOS).
const INPUT = {
  'carga+jump': '△ + × / Y + A',
  'mod+ranged': 'R1 + □ / RB + X',
  'mod+physical': 'R1 + ○ / RB + B',
  'mod+carga': 'R1 + △ / RB + Y',
  'mod+jump': 'R1 + × / RB + A',
  'mod+dodge': 'R1 + L2 / RB + LT',
};
const FIN = { launch: 'lança', knockdown: 'derruba', push: 'afasta', stun: 'atordoa' };
const DIR = { forward: 'Frente + ○', back: 'Trás + ○', side: 'Lado + ○', air: 'No ar + ○', up: '↑ + ○ no combo', down: '↓ + ○ no combo' };

export function moveListHTML(c) {
  const row = (cmd, name, info = '') => `<tr><td class="cmd">${cmd}</td><td><b>${name}</b>${info ? `<span>${info}</span>` : ''}</td></tr>`;
  const strike = (s) => [
    `${s.damage} de dano`,
    s.finisher && FIN[s.finisher],
    s.counter && `contra-ataque (revida ${s.counter.riposte.damage})`,
    s.onHit && s.onHit.pull && 'puxa o inimigo',
    s.chain && 'corrente',
  ].filter(Boolean).join(' · ');
  let html = `<h3 style="color:${c.color}">${c.name}</h3><p class="ident">${c.origin} · <b style="color:${ELEMENTS[c.element].color}">${ELEMENTS[c.element].name}</b> — ${c.info.identity || c.info.style}</p><table class="moves">`;
  html += row('○ ○ ○…', `Sequência: ${c.melee.strikes.map((s) => s.name).join(' → ')}`, `termina com ${FIN[c.melee.strikes.at(-1).finisher] || 'finalizador'}`);
  for (const k of ['forward', 'back', 'side', 'air', 'up', 'down']) if (c.melee[k]) html += row(DIR[k], c.melee[k].name, strike(c.melee[k]));
  const r = c.ranged;
  html += row('□ / X', r.name, `${r.damage}${r.count > 1 ? ` × ${r.count}` : ''} de dano · recarga ${r.cooldown}s${r.energyCost ? ` · ${r.energyCost} de sanidade` : ''}`);
  if (r.variants) for (const [k, v] of Object.entries(r.variants)) html += row(DIR[k].replace('○', '□'), v.label.toLowerCase().replace(/^./, (x) => x.toUpperCase()), `${v.damage}${(v.count ?? r.count) > 1 ? ` × ${v.count ?? r.count}` : ''} de dano`);
  for (const a of c.abilities || []) html += row(INPUT[a.input] || a.input, a.name, `${a.description || ''} (${a.energyCost} de sanidade · recarga ${a.cooldown}s)`);
  html += row('△ → △ → ○', `Especial: ${c.special.name}`, c.special.type === 'mistField' ? 'névoa paranormal, sem dano direto' : c.special.type === 'erase' ? 'corpo a corpo, 1x por partida (+1 depois de Transcender), indefensável: o alvo vira pó — só escapa esquivando ou com sanidade cheia (resiste levando muito dano)' : `${c.special.damage ?? COMBAT.specialDamage} de dano`);
  html += row('R2 parado', 'Defesa', 'defende tudo, até especial (quebra depois de muito dano)');
  html += row('R2 + andar', 'Defesa em movimento', 'anda mais rápido, mas fica aberto a golpes');
  html += row('L2 + direção', c.dodge && c.dodge.name ? `Esquiva: ${c.dodge.name}` : 'Esquiva', 'gasta 1 das 4 cargas (recuperam tomando dano)');
  html += row('× + × (+ direção)', 'Dash', 'na direção do analógico (diagonais também); sem direção, até o adversário');
  html += row('× depois de acertar', 'Dash de perseguição', 'continua o combo (até no ar) · máx. 2 por combo');
  html += row('× ou L2 ao cair', 'Levantar rolando', 'caído não toma dano');
  html += row('R2 no instante do golpe', 'Perfect Block', 'anula o dano e deixa o atacante aberto');
  html += row('△ segurando + andar', 'Carregar andando', 'anda mais devagar e carrega pela metade');
  if (!(c.abilities || []).some((a) => a.input === 'carga+jump')) html += row('△ + ×', 'Dash longo', 'persegue o adversário · 10 de sanidade');
  html += row('R2 + ○', 'Agarrão', `curta distância, não pode ser defendido (só esquivado) · ${COMBAT.grab.damage} de dano`);
  html += row('R2 + ○ ao ser agarrado', 'Escapar do agarrão', 'logo no começo: os dois se soltam, sem dano');
  html += row('L2 apanhando', 'Substituição', 'gasta 1 carga de esquiva e reaparece atrás do atacante');
  html += row('Segurar △ (vida ≤ 30%)', 'Transcender', `1x por partida: +${Math.round((COMBAT.awaken.damageMult - 1) * 100)}% de dano por ${COMBAT.awaken.duration}s e aguenta 1 golpe sem reagir`);
  html += row('△ + ○', 'Físico forte', `finalizador ×${COMBAT.powered.meleeMult} que gasta ${COMBAT.powered.guardCrush} da defesa · ${COMBAT.powered.meleeCost} de sanidade`);
  if (c.ranged) html += row('△ + □', `${c.ranged.name} forte`, `×${COMBAT.powered.rangedMult} de dano, maior e mais rápido · +${COMBAT.powered.rangedCost} de sanidade`);
  if (c.defense && c.defense.perfectBlock) html += row('R2 no tempo exato', 'Bloqueio Perfeito', 'anula o golpe físico e atordoa o atacante');
  for (const p of c.passives || []) {
    if (p.type === 'meleeDrain') html += row('Passiva', 'Cura que cobra sanidade', 'o físico tira X de vida; o inimigo recupera Y (Y < X) e perde Y × 1,5 de sanidade (energia)');
    if (p.type === 'backstab') html += row('Passiva', 'Golpe pelas costas', `+${Math.round((p.mult - 1) * 100)}% de dano`);
    if (p.type === 'decepar') html += row('Passiva', 'Decepar', `finalizador +${Math.round((p.mult - 1) * 100)}% em quem está com menos de ${p.threshold * 100}% de vida`);
    if (p.type === 'resistant') html += row('Passiva', 'Resistente', `-${Math.round((1 - p.mult) * 100)}% de dano físico recebido`);
    if (p.type === 'bloodNecklace') html += row('Passiva', 'Colar Banhado em Sangue', `-${Math.round((1 - p.resist) * 100)}% de dano de Sangue e sangramento ${Math.round((p.bleedMult - 1) * 100)}% mais forte`);
    if (p.type === 'precognition') html += row('Passiva', 'Precognição', 'não é pego desprevenido: sem bônus de costas nem susto de teleporte');
    if (p.type === 'bulletDodge') html += row('Passiva', 'Desviar de Balas', 'esquivar de um projétil não gasta carga de esquiva');
  }
  return html + '</table>';
}
