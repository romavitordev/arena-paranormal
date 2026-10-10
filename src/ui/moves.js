import { COMBAT } from '../config/combat.js';
import { ELEMENTS } from '../config/elements.js';

// Lista de comandos de um personagem (usada em PAUSE → COMANDOS).
const INPUT = {
  'carga+jump': '△ + × / Y + A',
  'carga+ranged': '△ → □ / Y → X',
  'carga+physical': '△ → ○ / Y → B',
  'block+carga': 'R2 + △ / RT + Y',
  'block+jump': 'R2 + × / RT + A',
  'carga+dodge': '△ + L2 / Y + LT',
  'ranged+forward': 'Frente + □ / X',
  'ranged+back': 'Trás + □ / X',
  'ranged+side': 'Lado + □ / X',
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
  if (r.type === 'counter') html += row('□ / X', r.name, `${r.description} · ${r.damage} de dano · recarga ${r.cooldown}s`);
  else html += row('□ / X', r.name, `${r.damage}${r.count > 1 ? ` × ${r.count}` : ''} de dano · recarga ${r.cooldown}s${r.energyCost ? ` · ${r.energyCost} de sanidade` : ''}`);
  if (r.variants) for (const [k, v] of Object.entries(r.variants)) if (!v.ability) html += row(DIR[k].replace('○', '□'), v.label.toLowerCase().replace(/^./, (x) => x.toUpperCase()), `${v.damage}${(v.count ?? r.count) > 1 ? ` × ${v.count ?? r.count}` : ''} de dano`);
  for (const a of c.abilities || []) html += row(INPUT[a.input] || a.input, a.name, `${a.description || ''} (${a.energyCost} de sanidade · recarga ${a.cooldown}s)`);
  html += row('△ → △ → ○', `Especial: ${c.special.name}`, specialSummary(c));
  html += row('R2 parado', 'Defesa', 'defende tudo, até especial (quebra depois de muito dano)');
  html += row('R2 + direção', 'Passo da defesa', 'passos rápidos para os lados / trás, de frente para o rival (como no Storm 4)');
  html += row('L2 + direção', c.dodge && c.dodge.name ? `Esquiva: ${c.dodge.name}` : 'Esquiva', 'gasta 1 das 4 cargas só se desviar de algo (esquivar no vazio não gasta); recuperam tomando dano');
  html += row('× + × (+ direção)', 'Dash', 'na direção do analógico (diagonais também); sem direção, até o adversário');
  html += row('× depois de acertar', 'Dash de perseguição', 'continua o combo (até no ar) · máx. 2 por combo');
  html += row('× ou L2 ao cair', 'Levantar rolando', 'caído não toma dano');
  html += row('R2 no instante do golpe', 'Perfect Block', 'anula o dano e deixa o atacante aberto');
  html += row('△ segurando + andar', 'Carregar andando', 'anda mais devagar e carrega pela metade');
  if (!(c.abilities || []).some((a) => a.input === 'carga+jump')) html += row('△ + ×', 'Dash longo', 'persegue o adversário · 10 de sanidade');
  html += row('R2 + ○', 'Agarrão', `curta distância, não pode ser defendido (só esquivado) · ${COMBAT.grab.damage} de dano`);
  html += row('R2 + ○ ao ser agarrado', 'Escapar do agarrão', 'logo no começo: os dois se soltam, sem dano');
  html += row('L2 apanhando', 'Substituição', 'apanhando ou atordoado: gasta 1 carga de esquiva, cancela o combo do adversário e desvia para o lado, perto de onde estava');
  if (c.awakening) html += row(`Barra de Transformação cheia + vida ≤ ${Math.round(COMBAT.storm.healthRatio * 100)}%: segurar △`, c.awakening.name, `a sanidade enche e passa do limite: ${specialSummary({ special: c.awakening })} · a barra enche apanhando e zera a cada round`);
  if (c.defense && c.defense.perfectBlock) html += row('R2 no tempo exato', 'Bloqueio Perfeito', 'anula o golpe físico e atordoa o atacante');
  for (const p of c.passives || []) {
    if (p.type === 'meleeDrain') html += row('Passiva', 'Cura que cobra sanidade', 'o físico tira X de vida; o inimigo recupera Y (Y < X) e perde Y × 1,5 de sanidade (energia)');
    if (p.type === 'backstab') html += row('Passiva', 'Golpe pelas costas', `+${Math.round((p.mult - 1) * 100)}% de dano`);
    if (p.type === 'decepar') html += row('Passiva', 'Decepar', `finalizador +${Math.round((p.mult - 1) * 100)}% em quem está com menos de ${p.threshold * 100}% de vida`);
    if (p.type === 'resistant') html += row('Passiva', 'Resistente', `-${Math.round((1 - p.mult) * 100)}% de dano físico recebido`);
    if (p.type === 'bloodNecklace') html += row('Passiva', 'Colar Banhado em Sangue', `-${Math.round((1 - p.resist) * 100)}% de dano de Sangue e sangramento ${Math.round((p.bleedMult - 1) * 100)}% mais forte`);
    if (p.type === 'precognition') html += row('Passiva', 'Precognição', 'não é pego desprevenido: sem bônus de costas nem susto de teleporte');
    if (p.type === 'slowImpact') html += row('Passiva', 'Desacelerar Impacto', `-${Math.round((1 - p.mult) * 100)}% de dano de projéteis`);
    if (p.type === 'iKnewIt') html += row('Passiva', 'Eu Já Sabia', `resistência mental: -${Math.round((1 - p.mult) * 100)}% de dano de Conhecimento`);
    if (p.type === 'mindRead') html += row('Passiva', 'Leitura', `cada golpe físico lê o alvo: +${Math.round((p.takenMult - 1) * 100)}% de dano recebido por ${p.time}s`);
    if (p.type === 'bulletDodge') html += row('Passiva', 'Desviar de Balas', 'esquivar de um projétil não gasta carga de esquiva');
  }
  return html + '</table>';
}

// resumo do especial: transformações, invocações e pactos não são "N de dano"
export function specialSummary(c) {
  const sp = c.special;
  if (!sp) return '—';
  const until = (d) => (d ? `por ${d} s` : 'até o fim do round');
  const life = sp.bonusHealth ? ` (+${sp.bonusHealth} de vida)` : '';
  switch (sp.type) {
    case 'mistField': return 'névoa + Acácia amplificada (250 de dano); a névoa fica no mapa';
    case 'erase': return 'corpo a corpo, 1x por partida, indefensável: o alvo vira pó — só escapa esquivando ou com sanidade cheia (resiste levando muito dano)';
    case 'santoPact': if (sp.immediate) return 'o Lodo toma o corpo: transforma no Deus da Morte (chefe com vida própria) até o fim do round';
      return `com mais de ${Math.round((sp.minEnergy || 0) * 100)}% de sanidade: pacto de ${sp.window || 45} s — morrer durante o pacto transforma no Deus da Morte`;
    case 'devilPact': return `transforma no Diabo ${until(sp.duration)}${life}${sp.usesPerMatch ? `, ${sp.usesPerMatch}x por partida` : ''}`;
    case 'ghostBands': return `transforma na Fantasma ${until(sp.duration)}${life}`;
    case 'devilDeal': return `o alvo fica transtornado por ${sp.duration || 8} s: não defende e recebe mais dano; o Diabo se cura`;
    case 'marionette': return 'invoca a Marionete, que luta ao seu lado';
    case 'ageGrab': return `agarra pelo pescoço e envelhece o alvo até o fim do round (${Math.round((1 - (sp.aged?.mult ?? 0.6)) * 100)}% menos dano, ${Math.round((1 - (sp.aged?.speedMult ?? 0.7)) * 100)}% mais lento, sem regenerar sanidade) · ${sp.damage} de dano · 1x por round`;
    case 'awakenMode': {
      const pct = (m) => `${m > 1 ? '+' : '−'}${Math.round(Math.abs(m - 1) * 100)}%`;
      const parts = [];
      if (sp.mult) parts.push(`${pct(sp.mult)} de dano${sp.affects ? ` (${sp.affects.map((k) => ({ melee: 'físico', ranged: 'distância', ability: 'habilidades', special: 'especial' })[k]).join(', ')})` : ''}`);
      if (sp.takenMult) parts.push(`${pct(sp.takenMult)} de dano recebido`);
      if (sp.speedMult) parts.push(`${pct(sp.speedMult)} de velocidade`);
      if (sp.cdRate) parts.push(`recargas ${Math.round((sp.cdRate - 1) * 100)}% mais rápidas`);
      if (sp.energyRegenMult) parts.push(`sanidade regenera ${pct(sp.energyRegenMult)}`);
      if (sp.regen) parts.push(`regenera ${sp.regen} de vida/s`);
      if (sp.armorEvery) parts.push(`aguenta 1 golpe sem reagir a cada ${sp.armorEvery} s`);
      if (sp.unblockable) parts.push('golpes físicos atravessam a defesa');
      if (sp.meleeBleed) parts.push('todo golpe sangra');
      if (sp.bloodArmSide) parts.push('braço de sangue');
      if (sp.heal) parts.push(`cura ${Math.round(sp.heal * 100)}% na hora`);
      return `desperta até o fim do round: ${parts.join(', ')}`;
    }
    default: return `${sp.damage ?? COMBAT.specialDamage} de dano`;
  }
}
