// Gera HABILIDADES.md a partir das definições dos personagens:
//   npm run moves
import { writeFileSync } from 'node:fs';
import { ROSTER } from '../src/characters/index.js';
import { COMBAT } from '../src/config/combat.js';
import { ELEMENTS } from '../src/config/elements.js';

const INPUT = {
  'carga+jump': 'Energia + Pulo (△+× / Y+A)',
  'mod+ranged': 'R1 + □ / RB + X',
  'mod+physical': 'R1 + ○ / RB + B',
  'mod+carga': 'R1 + △ / RB + Y',
  'mod+jump': 'R1 + × / RB + A',
  'mod+dodge': 'R1 + L2 / RB + LT',
};
const FIN = { launch: 'lança', knockdown: 'derruba', push: 'afasta', stun: 'atordoa' };
const DIR = { forward: 'Frente + ○', back: 'Trás + ○', side: 'Lado + ○', air: 'No ar + ○', up: '↑ + ○ (no combo)', down: '↓ + ○ (no combo)' };

const strikeRow = (label, s) => {
  const hits = s.actives ? ` (${s.actives.length} acertos)` : '';
  const notes = [
    s.finisher && `finalizador: ${FIN[s.finisher]}`,
    s.counter && `contra-ataque (revida ${s.counter.riposte.damage})`,
    s.iframes && 'invulnerável no começo',
    s.chain && 'usa corrente',
    s.onHit && s.onHit.pull && 'puxa o inimigo',
    s.heal && `Y = ${s.heal}`,
    s.slam && 'desce com impacto',
  ].filter(Boolean).join(', ');
  return `| ${label} | ${s.name} | ${s.damage}${hits} | ${s.range} m | ${notes} |`;
};

let md = `# Habilidades — Arena Paranormal

> Gerado automaticamente a partir de \`src/characters/\` (\`npm run moves\`). Não edite à mão.

**Regras gerais:** vida ${COMBAT.maxHealth} · energia ${COMBAT.maxEnergy} (começa em ${COMBAT.startEnergy}, +${COMBAT.energyRegen}/s, +${COMBAT.chargeRate}/s segurando a Carga de Poder) ·
especial = Carga → Carga → ○ (custa ${COMBAT.specialEnergyCost}, ofensivos causam ${COMBAT.specialDamage}, nunca hitkill).

**Defesa:** segurar R2/RT parado (defende até especiais, menos o Inexistir); andando com a defesa você se move mais rápido, mas fica aberto. Passa ${COMBAT.block.meleeChip * 100}% do dano físico e ${COMBAT.block.rangedChip * 100}% do resto, gasta a resistência
(quebra e atordoa por ${COMBAT.block.breakStun} s). Quem bate na defesa fica exposto para contra-ataque. Defesa parada segura até especiais (menos o Inexistir).
**Esquiva:** L2/LT + direção (4 cargas, recuperam tomando dano) (${COMBAT.dodge.distance} m, ${COMBAT.dodge.iframes} s de invulnerabilidade, cooldown ${COMBAT.dodge.cooldown} s).
**Dash:** × + × na direção do analógico (sem direção, até o adversário). **Dash longo:** △ + × (persegue o adversário, 10 de sanidade) — no Joui, △ + × é o Teleporte das Sombras.
**Combo vertical:** ↑ + ○ dentro do combo lança e o atacante sobe junto (até ${COMBAT.airCombo.maxHits} golpes aéreos + finalização); ↓ + ○ derruba. × depois de acertar = dash de perseguição (até ${COMBAT.comboDash.maxPerCombo} por combo).
**Queda:** caído não toma dano; × ou L2 logo ao cair levanta rolando. **Perfect Block:** defesa no instante do impacto (todos). **Carregar andando:** ${COMBAT.chargeMoveSpeed * 100}% da velocidade, ${COMBAT.chargeMoveRate * 100}% da carga.
**Agarrão:** R2 + ○ (curta distância, ${COMBAT.grab.damage} de dano, não pode ser defendido — só esquivado). **Versões fortes:** △ + ○ = físico forte (×${COMBAT.powered.meleeMult}, gasta ${COMBAT.powered.guardCrush} da defesa, ${COMBAT.powered.meleeCost} de sanidade) · △ + □ = principal forte (×${COMBAT.powered.rangedMult}, +${COMBAT.powered.rangedCost} de energia).
**Elementos (só nos rituais — habilidades e especiais):** Sangue > Conhecimento > Energia > Morte > Sangue (+${Math.round((COMBAT.elements.advantage - 1) * 100)}% / −${Math.round((1 - COMBAT.elements.disadvantage) * 100)}%). **Escala de combo:** ${COMBAT.comboScaling.join(' → ')}. **Substituição:** L2 apanhando (1 carga). **Escapar do agarrão:** R2 + ○ logo no começo. **Transcender:** vida ≤ ${COMBAT.awaken.healthRatio * 100}% + segurar △ ${COMBAT.awaken.hold} s (1x por partida, +${Math.round((COMBAT.awaken.damageMult - 1) * 100)}% de dano por ${COMBAT.awaken.duration} s, aguenta 1 golpe).
**Câmera:** sempre travada no adversário.
`;

for (const c of ROSTER) {
  const r = c.ranged;
  const sp = c.special;
  md += `\n---\n\n## ${c.name}\n\n*${c.info.identity}* · arma: ${c.info.weapon}\n\n`;
  md += `### Físico (○ / B)\n\n| Comando | Golpe | Dano | Alcance | Observações |\n|---|---|---|---|---|\n`;
  c.melee.strikes.forEach((s, i) => { md += strikeRow(`○ ${i + 1}`, s) + '\n'; });
  for (const k of ['forward', 'back', 'side', 'air', 'up', 'down']) if (c.melee[k]) md += strikeRow(DIR[k], c.melee[k]) + '\n';
  md += `\n### Principal (□ / X): ${r.name}\n\n`;
  md += `- Dano ${r.damage}${r.count > 1 ? ` × ${r.count}` : ''} · alcance ${r.range} m · cooldown ${r.cooldown} s · custo ${r.energyCost || 0}\n`;
  if (r.onHit && r.onHit.pull) md += `- Prende e puxa o inimigo para ${r.onHit.pull.distance} m, abrindo ${r.onHit.pull.after} s para combar\n`;
  if (r.onHit && r.onHit.stun) md += `- Prende o inimigo por ${r.onHit.stun} s\n`;
  if (r.variants) {
    for (const [k, v] of Object.entries(r.variants)) {
      md += `- ${DIR[k].replace('○', '□')}: **${v.label}** — ${v.damage}${(v.count ?? r.count) > 1 ? ` × ${v.count ?? r.count}` : ''}\n`;
    }
  }
  md += `\n### Habilidades\n\n`;
  for (const a of c.abilities || []) {
    md += `- **${a.name}** — ${INPUT[a.input] || a.input} · custo ${a.energyCost} · cooldown ${a.cooldown} s${a.damage ? ` · dano ${a.damage}` : ''}${a.range ? ` · alcance ${a.range} m` : ''}\n  ${a.description || ''}\n`;
  }
  if (c.dodge && c.dodge.name) md += `- **${c.dodge.name}** (esquiva própria) — invulnerável por ${c.dodge.iframes} s · cooldown ${c.dodge.cooldown} s\n`;
  if (c.defense && c.defense.perfectBlock) md += `- **Bloqueio Perfeito** — defender no instante exato (${c.defense.perfectBlock.window} s) anula o dano e atordoa o atacante por ${c.defense.perfectBlock.counterStun} s\n`;
  for (const p of c.passives || []) {
    if (p.type === 'meleeDrain') md += `- **Passiva:** o físico tira X de vida; o INIMIGO recupera Y (Y < X) e perde Y × ${p.energyRatio} de sanidade (energia). O Injustiça não se cura.\n`;
    if (p.type === 'decepar') md += `- **Passiva — Decepar:** finalizador +${Math.round((p.mult - 1) * 100)}% em quem está com menos de ${p.threshold * 100}% de vida
`;
    if (p.type === 'resistant') md += `- **Passiva — Resistente:** −${Math.round((1 - p.mult) * 100)}% de dano físico recebido
`;
    if (p.type === 'bloodNecklace') md += `- **Passiva — Colar Banhado em Sangue:** −${Math.round((1 - p.resist) * 100)}% de dano de Sangue; sangramento ${Math.round((p.bleedMult - 1) * 100)}% mais forte
`;
    if (p.type === 'precognition') md += `- **Passiva — Precognição:** não é pego desprevenido (sem bônus de costas nem susto de teleporte)
`;
    if (p.type === 'bulletDodge') md += `- **Passiva — Desviar de Balas:** esquivar de um projétil não gasta carga
`;
    if (p.type === 'backstab') md += `- **Passiva:** golpes físicos pelas costas causam +${Math.round((p.mult - 1) * 100)}%\n`;
  }
  md += `\n### Especial: ${sp.name}\n\n`;
  if (sp.type === 'mistField') {
    md += `Névoa paranormal por ${sp.duration} s (sem dano direto): +${Math.round((sp.damageBonus - 1) * 100)}% de dano, esquiva com ${sp.evasion.iframesMult}× invulnerabilidade e metade do cooldown, corpo translúcido, área de ${sp.area} m onde o inimigo fica ${sp.enemySlow * 100}% mais lento, não regenera energia e os projéteis perdem ${sp.projectileSlow * 100}% da velocidade. Custo ${sp.energyCost} · cooldown ${sp.cooldown} s.\n`;
  } else if (sp.type === 'erase') {
    md += `Corpo a corpo, ${sp.usesPerMatch}x por partida (+${sp.bonusUseOnTranscend || 0} depois da primeira Transcendência), não pode ser defendido: o alvo vira pó. Escapa esquivando no contato; com a sanidade cheia resiste levando ${sp.resistDamage} de dano (nunca morre por isso). Custo ${sp.energyCost}.\n`;
  } else {
    md += `${sp.damage ?? COMBAT.specialDamage} de dano · custo ${sp.energyCost} · cooldown ${sp.cooldown} s.\n`;
  }
}

writeFileSync(new URL('../HABILIDADES.md', import.meta.url), md);
console.log('HABILIDADES.md gerado.');
