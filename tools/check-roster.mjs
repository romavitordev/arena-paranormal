// Checagem rápida das regras do elenco (roda no Node, sem navegador):
//   npm run check
import { ROSTER } from '../src/characters/index.js';
import { COMBAT } from '../src/config/combat.js';
import { computeDrain, validatePassives } from '../src/combat/passives.js';
import { CLIPS } from '../src/anim/clips.js';
import { GAMEPAD_LAYOUT } from '../src/config/controls.js';
import { ELEMENTS } from '../src/config/elements.js';
import * as ARENA_CFGS from '../src/arena/configs.js';

let fails = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) fails++;
};
const get = (id) => ROSTER.find((c) => c.id === id);
const allStrikes = (c) => [...c.melee.strikes, ...['forward', 'back', 'side', 'air', 'up', 'down'].map((k) => c.melee[k]).filter(Boolean)];

// ---------------- base preservada ----------------
const ids = ROSTER.map((c) => c.id);
ok(['cineraria', 'abutre', 'mascarado', 'vampira', 'dante', 'erin', 'injustica', 'desconjurado', 'aguiar'].every((i) => ids.includes(i)), `elenco com os 9 personagens (${ids.join(', ')})`);
ok(ROSTER.map((c) => c.name).join() === 'KAISER,ARTHUR CERVERO,JOUI JOUKI,AGHATA,DANTE,ERIN PARKER,GAL SAL,KIAN,AGUIAR', 'nomes: Kaiser, Arthur Cervero, Joui Jouki, Aghata, Dante, Erin Parker, Gal Sal, Kian, Aguiar');
const banners = Object.fromEntries(ROSTER.map((c) => [c.id, c.special.banner]));
ok(banners.injustica === 'Injustiça né?' && banners.cineraria === 'Cinerária!' && banners.mascarado === 'Shi no Kage!' && banners.vampira === 'Descarnar!' && banners.abutre === 'Arma de Sangue!' && banners.desconjurado === 'Inexistir', 'textos dos especiais na tela');
ok(COMBAT.maxHealth === 1000 && COMBAT.maxEnergy === 100, 'vida 1000 e energia 100');
ok(COMBAT.startEnergy === 30 && COMBAT.energyRegen === 2.5 && COMBAT.chargeRate === 32, 'energia: início 30, regen 2,5/s, carga 32/s');

// ---------------- controles V2 ----------------
ok(GAMEPAD_LAYOUT.block[0] === 7, 'defesa no RT / R2');
ok(GAMEPAD_LAYOUT.mod[0] === 5, 'modificador no RB / R1');
ok(COMBAT.dodge.charges === 4 && COMBAT.dodge.damagePerCharge > 0, 'barra com 4 esquivas que recupera tomando dano');
ok(ROSTER.find((c) => c.id === 'abutre').abilities[0].color === 0x3aff6a, 'Rebirth verde');
ok(!GAMEPAD_LAYOUT.lock, 'sem botão de travar câmera');
ok(GAMEPAD_LAYOUT.dodge[0] === 6, 'esquiva no LT / L2 (separada da defesa)');

for (const c of ROSTER) {
  for (const s of allStrikes(c)) if (!CLIPS[s.anim]) ok(false, `${c.name}: animação inexistente ${s.anim}`);
  for (const a of Object.values(c.anims)) if (!CLIPS[a]) ok(false, `${c.name}: animação inexistente ${a}`);
  ok(['forward', 'back', 'side', 'air'].every((k) => c.melee[k]), `${c.name}: físico com variações neutro/frente/trás/lado/aéreo`);
  ok(c.melee.strikes.at(-1).finisher, `${c.name}: sequência termina com finalizador (${c.melee.strikes.at(-1).finisher})`);
  ok(!!c.ranged, `${c.name}: botão □/X não fica vazio (${c.ranged && c.ranged.name})`);
  ok((c.abilities || []).some((a) => a.input.startsWith('mod+')), `${c.name}: possui habilidade secundária com R1/RB`);
  for (const a of c.abilities || []) ok(a.cooldown > 0, `${c.name}: ${a.name} tem cooldown (${a.cooldown}s, custo ${a.energyCost})`);
  ok(validatePassives(c).length === 0, `${c.name}: configuração de passivas válida`);
}

// ---------------- especiais ----------------
const offensive = ROSTER.filter((c) => !['mistField', 'erase', 'marionette'].includes(c.special.type));
const dmg = offensive.map((c) => c.special.damage ?? COMBAT.specialDamage);
ok(dmg.every((d) => d === 250), `especiais ofensivos com 250 de dano (${dmg.join(', ')})`);
ok(dmg.every((d) => d < COMBAT.maxHealth), 'especiais comuns não são hitkill (o Inexistir é a exceção pedida, com regras próprias)');
ok(ROSTER.every((c) => (c.special.energyCost ?? COMBAT.specialEnergyCost) === 50), 'todos os especiais custam 50 de energia');

// ---------------- Cineraria ----------------
const cin = get('cineraria');
ok(cin.ranged.name === 'M4' && cin.ranged.count === 4 && cin.ranged.damage === 16 && cin.ranged.cooldown === 2.6, 'M4 mantida: rajada de 4 × 16, cooldown 2,6 s');
ok(['forward', 'back', 'side'].every((k) => cin.ranged.variants[k]), 'M4 com variações por direção');
const varMax = Math.max(...Object.values(cin.ranged.variants).map((v) => v.damage * (v.count ?? cin.ranged.count)));
ok(varMax <= 64, `variações da M4 não aumentam o dano da rajada (máx ${varMax})`);
ok(cin.special.type === 'mistField' && cin.special.evasion && cin.special.area && cin.special.opacity < 1, 'Cinerária é névoa: dano + evasão + área + leitura visual difícil');
ok(cin.special.damageBonus < 1.5, `Cinerária não é mais só ×1,5 (bônus ${cin.special.damageBonus})`);

// ---------------- Abutre ----------------
const abu = get('abutre');
const twoArm = ['jab', 'hook_l', 'dual_r', 'dual_l', 'dual_alt', 'dual_cross', 'dual_both', 'dual_spin', 'shove', 'block', 'shoot_rifle', 'charge'];
ok(abu.oneArm && allStrikes(abu).every((s) => !twoArm.includes(s.anim)) && !twoArm.includes(abu.anims.block), 'Abutre: nenhum golpe/defesa usa um segundo braço');
ok(abu.ranged.name === 'Sniper' && abu.ranged.damage === 110, 'Abutre: sniper mantida (110)');
const reb = abu.abilities.find((a) => a.id === 'rebirth');
ok(reb && reb.input === 'mod+ranged' && reb.type === 'weaponState' && reb.shots > 0 && reb.bonusDamage > 0, 'Rebirth: R1+□, estado temporário da arma com tiros fortalecidos');
ok(abu.special.name === 'Arma de Sangue', 'Arthur: especial ARMA DE SANGUE (nome correto)');
ok(abu.ranged.chargeShot && abu.ranged.chargeShot.maxDamage > abu.ranged.chargeShot.minDamage, 'Arthur: sniper com tiro carregado (ajoelha, mais tempo = mais dano)');
const legOnly = ['kick_low', 'kick_round', 'kick_front', 'spin_kick', 'knee', 'side_kick', 'air_kick', 'sway_kick'];
ok(allStrikes(abu).every((s) => legOnly.includes(s.anim)), 'Arthur: golpes físicos só com chutes/joelhadas (não bate com o braço que não tem)');
ok(abu.anims.grab === 'grab_onearm', 'Arthur: agarrão com um braço só');

// ---------------- Mascarado ----------------
const mas = get('mascarado');
ok(mas.melee.strikes.every((s) => s.anim.startsWith('slash')), 'Mascarado: sequência só com a katana');
ok(mas.melee.back.counter, 'Mascarado: contra-ataque');
ok(mas.abilities.some((a) => a.type === 'teleportBehind' && a.input === 'carga+jump' && a.cooldown > 0), 'Teleporte das Sombras: Energia + Pulo, com cooldown');
const gaze = mas.abilities.find((a) => a.type === 'fearGaze');
ok(gaze && gaze.stun <= 1 && gaze.cooldown >= 10, `Olhar do Desespero: atordoamento breve (${gaze && gaze.stun}s) e cooldown`);
ok(mas.ranged.visual === 'shadow', 'Mascarado: □ é uma extensão de sombra');
ok(mas.special.type === 'teleportStrike', 'Mascarado: Corte Silencioso mantido');

// ---------------- Vampira ----------------
const vam = get('vampira');
ok(allStrikes(vam).every((s) => s.trail || s.anim === 'thrust'), 'Vampira: físico só com a faca');
ok(!vam.abilities.some((a) => a.name === 'Descarnar'), 'Aghata: Descarnar não aparece repetido (só no especial)');
ok(vam.abilities.some((a) => a.type === 'curseWeapon' && a.bleed), 'Aghata: Amaldiçoar Arma (Sangue) com sangramento');
ok(vam.special.name === 'Descarnar' && vam.special.type === 'ritual', 'Vampira: especial DESCARNAR');
ok(!JSON.stringify(vam).includes('Dança Carmesim'), 'Dança Carmesim removida');

// ---------------- Injustiça ----------------
const inj = get('injustica');
ok(allStrikes(inj).every((s) => s.heal < s.damage), 'Injustiça: Y < X em todos os golpes físicos');
const ex = computeDrain({ X: 100, Y: 60, dealt: 100, energyRatio: 1.5 });
ok(ex.heal === 60 && ex.energyRemoved === 90, `exemplo do documento: X=100, Y=60 → +${ex.heal} vida, −${ex.energyRemoved} energia`);
ok(computeDrain({ X: 100, Y: 120, dealt: 100 }).heal < 100, 'mesmo com Y configurado errado, nunca recupera mais que X');
const partial = computeDrain({ X: 100, Y: 60, dealt: 50 });
ok(partial.heal === 30 && partial.energyRemoved === 45, 'dano parcial reduz Y na mesma proporção');
ok(inj.ranged.name === 'Corrente de Captura' && inj.ranged.chain && inj.ranged.homing > 0 && inj.ranged.onHit.pull, 'Gal: □ Corrente de Captura (procura, prende e puxa)');
ok(inj.ranged.damage <= 30, `Corrente com dano inicial baixo (${inj.ranged.damage})`);
ok(allStrikes(inj).some((s) => s.chain), 'Injustiça: correntes aparecem nos golpes físicos');
ok(inj.defense && inj.defense.perfectBlock && inj.defense.perfectBlock.window <= 0.2, 'Injustiça: Bloqueio Perfeito com janela curta');
ok(inj.special.approach === 'chain' && inj.special.applyMeleePassives === false, 'Sentença com corrente; não aplica X/Y por padrão');

// ---------------- Desconjurado ----------------
const des = get('desconjurado');
const fistAnims = ['jab', 'cross', 'hook_l', 'hook_r', 'uppercut', 'heavy_punch', 'wave_punch', 'body_blow', 'dash_punch', 'shove', 'meteor_punch', 'flurry'];
ok(des.unarmed && allStrikes(des).every((s) => fistAnims.includes(s.anim) && !s.trail), 'Desconjurado: físico só com punhos');
ok(des.special.type === 'erase' && des.special.usesPerMatch === 1 && des.special.unblockable && des.special.resistDamage > 0, 'Kian: especial Inexistir (1x por partida, indefensável, resiste com sanidade cheia)');
ok(des.special.bonusUseOnTranscend === 1, 'Kian: Transcender libera mais um Inexistir');
ok(des.abilities.some((a) => a.type === 'transcend'), 'Kian: Transcendência');
ok(des.abilities.some((a) => a.type === 'blink' && a.cooldown > 0), 'Desconjurado: Teletransporte com cooldown');
const fb = des.abilities.find((a) => a.type === 'fearBlade');
ok(fb && fb.cooldown >= 20, `Lâmina do Medo: manifestação temporária com cooldown alto (${fb && fb.cooldown}s)`);
ok(des.dodge.style !== 'inexistir', 'Inexistir não é mais esquiva');

// ---------------- Origem e elemento ----------------
ok(ROSTER.every((c) => c.origin && ELEMENTS[c.element]), 'todos com origem e elemento válidos');
ok(get('mascarado').origin === 'Ordo Realitas' && get('mascarado').element === 'conhecimento', 'Joui Jouki: Ordo Realitas (Conhecimento)');

// ---------------- Cânone e mecânicas (TODO 2026-10-01) ----------------
const pas = (id, t) => (get(id).passives || []).some((p) => p.type === t);
const abil = (id, t) => (get(id).abilities || []).some((a) => a.type === t);
ok(pas('desconjurado', 'precognition') && abil('desconjurado', 'rejectMist'), 'Kian: Precognição + Rejeitar Névoa');
ok(get('desconjurado').melee.strikes.reduce((n, s) => n + s.damage, 0) <= 215, 'Kian: combo reduzido (≤ 215)');
ok(get('desconjurado').abilities.find((a) => a.type === 'transcend').endDrain > 0, 'Kian: Transcendência cobra sanidade');
ok(pas('cineraria', 'resistant') && abil('cineraria', 'flowerRain') && get('cineraria').special.area === 5, 'Kaiser: Resistente, Acácia, Cinerária em 5 m');
ok(abil('abutre', 'hatredTemple') && abil('abutre', 'bloodParalysis'), 'Arthur: Templo do Ódio + Dystopia');
ok(pas('mascarado', 'decepar') && get('mascarado').melee.strikes.slice(0, -1).every((s) => s.range <= 2.2), 'Joui: Decepar, sequência com alcance ≤ 2,2 m');
ok(pas('vampira', 'bloodNecklace'), 'Agatha: Colar Banhado em Sangue');
ok(pas('injustica', 'bulletDodge') && abil('injustica', 'sparkTeleport'), 'Gal: Desviar de Balas + Teletransporte');
const mods = (c) => (c.abilities || []).filter((a) => a.input.startsWith('mod+')).map((a) => a.input);
ok(ROSTER.every((c) => new Set(mods(c)).size === mods(c).length), 'nenhum R1 + botão repetido no mesmo personagem');
ok(COMBAT.comboScaling[0] === 1 && COMBAT.comboScaling.at(-1) >= 0.5 && COMBAT.substitution && COMBAT.grabTech && COMBAT.awaken, 'escala de combo, substituição, escape do agarrão e Transcender configurados');

// ---------------- Cenários: sem frestas entre retângulos andáveis ----------------
// Onde dois retângulos se encontram, a sobreposição tem que passar do diâmetro do corpo; senão o lutador trava.
for (const cfg of Object.values(ARENA_CFGS)) {
  const rects = cfg && cfg.bounds && cfg.bounds.rects;
  if (!rects) continue;
  const need = COMBAT.bodyRadius * 2 + 0.2;
  let worst = Infinity;
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i]; const b = rects[j];
    const ox = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
    const oz = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
    if (ox < 0 || oz < 0) continue; // não se encostam
    worst = Math.min(worst, Math.max(Math.min(ox, oz), 0));
  }
  ok(worst === Infinity || worst >= need, `${cfg.name}: retângulos andáveis sem frestas (sobreposição mínima ${worst === Infinity ? '—' : worst.toFixed(2)} m)`);
}

// ---------------- Dante ----------------
const dan = get('dante');
ok(dan && dan.origin === 'Ordo Realitas' && dan.element === 'morte', 'Dante: Ordo Realitas, Morte');
ok(dan && dan.ranged.name === 'Decadenza' && dan.ranged.onHit.bleed, 'Dante: □ Decadenza com decadência contínua');
ok(dan && ['shadowClones', 'lodoTentacles', 'healOverTime'].every((t) => dan.abilities.some((a) => a.type === t)), 'Dante: Trinitá, Tentáculos de Lodo e Paradiso');
ok(dan && dan.special.type === 'marionette' && dan.special.duration <= 30 && dan.special.cooldown >= 30, 'Dante: especial Invocação da Marionete (NPC por tempo limitado, recarga alta)');
ok(dan && dan.abilities.find((a) => a.type === 'shadowClones').cooldown >= 30, 'Dante: Trinitá com recarga longa');
ok(dan && allStrikes(dan).every((s) => !s.weapon), 'Dante: sem armas');

// ---------------- Erin Parker e Aguiar
const eri = get('erin');
const agu = get('aguiar');
ok(eri && eri.origin === 'Ordo Realitas' && eri.ranged.name.startsWith('Escopeta') && eri.ranged.count > 1, 'Erin: Ordo Realitas, □ escopeta calibre 12 (leque de chumbo)');
ok(eri && ['supernova', 'nebulosa'].every((id) => eri.abilities.some((a) => a.id === id && a.projectile && a.projectile.explode)), 'Erin: granadas Supernova e Nebulosa explodem em área');
ok(eri && eri.abilities.some((a) => a.type === 'blessing') && eri.abilities.some((a) => a.id === 'blackHole'), 'Erin: rituais Bênção Maldita e Black Hole');
ok(eri && pas('erin', 'electricAmulet') && eri.special.type === 'supernova', 'Erin: Amuleto Elétrico e especial Supernova (escopeta + granada)');
ok(agu && agu.origin === 'Mascarados' && agu.element === 'sangue', 'Aguiar: Mascarados (Sangue)');
ok(agu && agu.melee.name.includes('Machado') && agu.melee.strikes.at(-1).bleed, 'Aguiar: machado do Mutilador (o finalizador faz sangrar)');
ok(agu && ['maskForm', 'bearTrap', 'predatorScent'].every((t) => agu.abilities.some((a) => a.type === t)), 'Aguiar: Máscara do Mutilador, Armadilha de Urso e Predador de Sangue');
ok(agu && agu.abilities.find((a) => a.type === 'maskForm').noBlock, 'Aguiar: mascarado não consegue defender (intenção assassina)');
ok(agu && pas('aguiar', 'sonOfPain'), 'Aguiar: Filho da Dor');

// ---------------- V2.3: combos verticais ----------------
ok(ROSTER.every((c) => c.melee.up && c.melee.up.launcher && c.melee.up.finisher === 'launchHigh'), 'todos com ↑ + ○ (lançador próprio)');
ok(ROSTER.every((c) => c.melee.down && c.melee.down.finisher === 'knockdown'), 'todos com ↓ + ○ (derruba)');
ok(COMBAT.down && COMBAT.down.lie > 0 && COMBAT.airCombo.maxHits <= 4, 'queda com recuperação e combo aéreo limitado');

// ---------------- Regras gerais V2.1 ----------------
ok(COMBAT.grab && COMBAT.grab.range < 2 && COMBAT.grab.damage > 0, 'agarrão (Defesa + ○): curta distância');
ok(COMBAT.powered && COMBAT.powered.meleeMult > 1 && COMBAT.powered.rangedMult > 1 && COMBAT.powered.meleeCost > 0, 'versões fortes △+○ / △+□ com custo de energia');

console.log(fails ? `\n${fails} verificação(ões) falharam.` : '\nTudo certo.');
process.exit(fails ? 1 : 0);
