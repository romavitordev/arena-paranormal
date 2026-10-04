// Checagem rápida das regras do elenco (roda no Node, sem navegador):
//   npm run check
import { ROSTER } from '../src/characters/index.js';
import { COMBAT } from '../src/config/combat.js';
import { computeDrain, validatePassives } from '../src/combat/passives.js';
import { CLIPS } from '../src/anim/clips.js';
import { GAMEPAD_LAYOUT } from '../src/config/controls.js';
import { ELEMENTS } from '../src/config/elements.js';
import * as ARENA_CFGS from '../src/arena/configs.js';
import { INTRO_DIALOGUES, VICTORY_LINES, introLines, victoryLine } from '../src/config/dialogues.js';

let fails = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) fails++;
};
const get = (id) => ROSTER.find((c) => c.id === id);
const allStrikes = (c) => [...c.melee.strikes, ...['forward', 'back', 'side', 'air', 'up', 'down'].map((k) => c.melee[k]).filter(Boolean)];

// ---------------- base preservada ----------------
const ids = ROSTER.map((c) => c.id);
ok(['kaiser', 'arthur', 'joui', 'aghata', 'dante', 'erin', 'gal_sal', 'kian', 'aguiar', 'labirinto', 'xande', 'lirio'].every((i) => ids.includes(i)), `elenco com os 12 personagens (${ids.join(', ')})`);
let validIntroPairs = 0;
let validVictoryPairs = 0;
let validIntroScenes = true;
let validVictoryLines = true;
for (const winner of ids) {
  if (Object.keys(INTRO_DIALOGUES[winner] || {}).length !== ids.length - 1) validIntroScenes = false;
  if (Object.keys(VICTORY_LINES[winner] || {}).length !== ids.length - 1) validVictoryLines = false;
  for (const opponent of ids) {
    if (winner === opponent) continue;
    const scenes = INTRO_DIALOGUES[winner]?.[opponent];
    if (Array.isArray(scenes) && scenes.length === 2
      && scenes[0].starter === scenes[1].response
      && scenes[1].starter === scenes[0].response
      && scenes[0].starter !== scenes[1].starter
      && scenes.every((scene) => typeof scene.line === 'string' && scene.line.trim()
        && typeof scene.responseLine === 'string' && scene.responseLine.trim()
        && !/\b(ganh\w*|perd\w*|venc\w*|vit[oó]ria|derrota)\b/i.test(`${scene.line} ${scene.responseLine}`))) {
      validIntroPairs++;
    } else validIntroScenes = false;
    const lines = VICTORY_LINES[winner]?.[opponent];
    if (Array.isArray(lines) && lines.length === 2 && lines.every((line) => typeof line === 'string' && line.trim())) {
      validVictoryPairs++;
    } else validVictoryLines = false;
  }
}
const sampleIntro = introLines('kaiser', 'erin');
const sampleVictory = victoryLine('kaiser', 'erin');
let randomSelectionValid = false;
const originalRandom = Math.random;
try {
  Math.random = () => 0;
  const firstIntro = introLines('kaiser', 'erin');
  const firstVictory = victoryLine('kaiser', 'erin');
  Math.random = () => 0.999999;
  const secondIntro = introLines('kaiser', 'erin');
  const secondVictory = victoryLine('kaiser', 'erin');
  randomSelectionValid = firstIntro[0][0] !== secondIntro[0][0]
    && firstVictory !== secondVictory
    && VICTORY_LINES.kaiser.erin.includes(firstVictory)
    && VICTORY_LINES.kaiser.erin.includes(secondVictory);
} finally {
  Math.random = originalRandom;
}
const PAIRS = ids.length * (ids.length - 1);
ok(validIntroScenes && validIntroPairs === PAIRS && sampleIntro.length === 2 && randomSelectionValid, `introduções: ${PAIRS} confrontos, duas cenas alternadas e aleatórias, sem falas de resultado`);
ok(validVictoryLines && validVictoryPairs === PAIRS && VICTORY_LINES.kaiser.erin.includes(sampleVictory) && randomSelectionValid, `vitórias: ${PAIRS} confrontos com duas falas selecionáveis aleatoriamente`);
ok(ROSTER.map((c) => c.name).join() === 'KAISER,ARTHUR CERVERO,JOUI JOUKI,AGHATA,DANTE,ERIN PARKER,GAL SAL,KIAN,AGUIAR,LABIRINTO,XANDE,LÍRIO,FERREIRO,JUAN,KEMI,BALU', 'nomes: Kaiser, Arthur Cervero, Joui Jouki, Aghata, Dante, Erin Parker, Gal Sal, Kian, Aguiar, Labirinto, Xande, Lírio, Ferreiro, Juan, Kemi, Balu');
const bal = get('balu');
ok(bal && bal.origin === 'Ordo Realitas' && bal.stats.maxHealth >= 1250 && ['curseWeapon', 'demonAxe', 'caiDentro', 'selfBuff', 'heavyProtection'].every((t) => bal.abilities.some((a) => a.type === t)) && bal.ranged.boomerang && bal.ranged.returnsProp === 'axe' && bal.melee.ground && bal.melee.ground.otg && bal.grip.twoHand, 'Balu: pesado da Ordo Realitas, Amaldiçoar Arma, Machado Demônio (vida), Fala Imponente, 110%, Colete, machado que volta e Derrubar e Atacar');
const banners = Object.fromEntries(ROSTER.map((c) => [c.id, c.special.banner]));
ok(banners.gal_sal === 'Injustiça né?' && banners.kaiser === 'Cinerária!' && banners.joui === 'Shi no Kage!' && banners.aghata === 'Descarnar!' && banners.arthur === 'Arma de Sangue!' && banners.kian === 'Inexistir', 'textos dos especiais na tela');
ok(COMBAT.maxHealth === 1000 && COMBAT.maxEnergy === 100, 'vida 1000 e energia 100');
ok(COMBAT.startEnergy === 30 && COMBAT.energyRegen === 2.5 && COMBAT.chargeRate === 32, 'energia: início 30, regen 2,5/s, carga 32/s');

// ---------------- controles V2 ----------------
ok(GAMEPAD_LAYOUT.block[0] === 7, 'defesa no RT / R2');
ok(!GAMEPAD_LAYOUT.mod && GAMEPAD_LAYOUT.assist1[0] === 4 && GAMEPAD_LAYOUT.assist2[0] === 5, 'assistências no L1/LB e R1/RB (sem botão modificador)');
ok(COMBAT.dodge.charges === 4 && COMBAT.dodge.damagePerCharge > 0, 'barra com 4 esquivas que recupera tomando dano');
ok(ROSTER.find((c) => c.id === 'arthur').abilities[0].color === 0x3aff6a, 'Rebirth verde');
ok(!GAMEPAD_LAYOUT.lock, 'sem botão de travar câmera');
ok(GAMEPAD_LAYOUT.dodge[0] === 6, 'esquiva no LT / L2 (separada da defesa)');

for (const c of ROSTER) {
  for (const s of allStrikes(c)) if (!CLIPS[s.anim]) ok(false, `${c.name}: animação inexistente ${s.anim}`);
  for (const a of Object.values(c.anims)) if (!CLIPS[a]) ok(false, `${c.name}: animação inexistente ${a}`);
  ok(['forward', 'back', 'side', 'air'].every((k) => c.melee[k]), `${c.name}: físico com variações neutro/frente/trás/lado/aéreo`);
  ok(c.melee.strikes.at(-1).finisher, `${c.name}: sequência termina com finalizador (${c.melee.strikes.at(-1).finisher})`);
  ok(!!c.ranged, `${c.name}: botão □/X não fica vazio (${c.ranged && c.ranged.name})`);
  ok((c.abilities || []).some((a) => a.input.startsWith('block+') || a.input.startsWith('carga+')), `${c.name}: possui habilidade secundária (△ + botão ou R2 + botão)`);
  for (const a of c.abilities || []) ok(a.cooldown > 0, `${c.name}: ${a.name} tem cooldown (${a.cooldown}s, custo ${a.energyCost})`);
  ok(validatePassives(c).length === 0, `${c.name}: configuração de passivas válida`);
}

// ---------------- especiais ----------------
const offensive = ROSTER.filter((c) => !['mistField', 'erase', 'marionette'].includes(c.special.type));
const dmg = offensive.map((c) => c.special.damage ?? COMBAT.specialDamage);
ok(dmg.every((d) => d === 250), `especiais ofensivos com 250 de dano (${dmg.join(', ')})`);
ok(dmg.every((d) => d < COMBAT.maxHealth), 'especiais comuns não são hitkill (o Inexistir é a exceção pedida, com regras próprias)');
ok(ROSTER.every((c) => (c.special.energyCost ?? COMBAT.specialEnergyCost) === 50), 'todos os especiais custam 50 de energia');

// ---------------- Kaiser ----------------
const cin = get('kaiser');
ok(cin.ranged.name === 'M4' && cin.ranged.count === 4 && cin.ranged.damage === 16 && cin.ranged.cooldown === 2.6, 'M4 mantida: rajada de 4 × 16, cooldown 2,6 s');
ok(['forward', 'back', 'side'].every((k) => cin.ranged.variants[k]), 'M4 com variações por direção');
const varMax = Math.max(...Object.values(cin.ranged.variants).map((v) => v.damage * (v.count ?? cin.ranged.count)));
ok(varMax <= 64, `variações da M4 não aumentam o dano da rajada (máx ${varMax})`);
ok(cin.special.type === 'mistField' && cin.special.evasion && cin.special.area && cin.special.opacity < 1, 'Cinerária é névoa: dano + evasão + área + leitura visual difícil');
ok(cin.special.damageBonus < 1.5, `Cinerária não é mais só ×1,5 (bônus ${cin.special.damageBonus})`);

// ---------------- Arthur ----------------
const abu = get('arthur');
const twoArm = ['jab', 'hook_l', 'dual_r', 'dual_l', 'dual_alt', 'dual_cross', 'dual_both', 'dual_spin', 'shove', 'block', 'shoot_rifle', 'charge'];
ok(abu.oneArm && allStrikes(abu).every((s) => !twoArm.includes(s.anim)) && !twoArm.includes(abu.anims.block), 'Arthur: nenhum golpe/defesa usa um segundo braço');
ok(abu.ranged.name === 'Sniper' && abu.ranged.damage === 110, 'Arthur: sniper mantida (110)');
const reb = abu.abilities.find((a) => a.id === 'rebirth');
ok(reb && reb.input === 'carga+ranged' && reb.type === 'weaponState' && reb.shots > 0 && reb.bonusDamage > 0, 'Rebirth: △+□, estado temporário da arma com tiros fortalecidos');
ok(abu.special.name === 'Arma de Sangue', 'Arthur: especial ARMA DE SANGUE (nome correto)');
ok(abu.ranged.chargeShot && abu.ranged.chargeShot.maxDamage > abu.ranged.chargeShot.minDamage, 'Arthur: sniper com tiro carregado (ajoelha, mais tempo = mais dano)');
const legOnly = ['kick_low', 'kick_round', 'kick_front', 'spin_kick', 'knee', 'side_kick', 'air_kick', 'sway_kick'];
ok(allStrikes(abu).every((s) => legOnly.includes(s.anim)), 'Arthur: golpes físicos só com chutes/joelhadas (não bate com o braço que não tem)');
ok(abu.anims.grab === 'grab_onearm', 'Arthur: agarrão com um braço só');

// ---------------- Joui ----------------
const mas = get('joui');
ok(mas.melee.strikes.every((s) => s.anim.startsWith('slash')), 'Joui: sequência só com a katana');
ok(mas.melee.back.counter, 'Joui: contra-ataque');
ok(mas.abilities.some((a) => a.type === 'teleportBehind' && a.input === 'carga+jump' && a.cooldown > 0), 'Teleporte das Sombras: Energia + Pulo, com cooldown');
const gaze = mas.abilities.find((a) => a.type === 'fearGaze');
ok(gaze && gaze.stun <= 1 && gaze.cooldown >= 10, `Olhar do Desespero: atordoamento breve (${gaze && gaze.stun}s) e cooldown`);
ok(mas.ranged.visual === 'shadow', 'Joui: □ é uma extensão de sombra');
ok(mas.special.type === 'teleportStrike', 'Joui: Corte Silencioso mantido');

// ---------------- Aghata ----------------
const vam = get('aghata');
ok(allStrikes(vam).every((s) => s.trail || s.anim === 'thrust'), 'Aghata: físico só com a faca');
ok(!vam.abilities.some((a) => a.name === 'Descarnar'), 'Aghata: Descarnar não aparece repetido (só no especial)');
ok(vam.abilities.some((a) => a.type === 'curseWeapon' && a.bleed), 'Aghata: Amaldiçoar Arma (Sangue) com sangramento');
ok(vam.special.name === 'Descarnar' && vam.special.type === 'ritual', 'Aghata: especial DESCARNAR');
ok(!JSON.stringify(vam).includes('Dança Carmesim'), 'Dança Carmesim removida');

// ---------------- Injustiça ----------------
const inj = get('gal_sal');
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

// ---------------- Kian ----------------
const des = get('kian');
const fistAnims = ['jab', 'cross', 'hook_l', 'hook_r', 'uppercut', 'heavy_punch', 'wave_punch', 'body_blow', 'dash_punch', 'shove', 'meteor_punch', 'flurry'];
ok(des.unarmed && allStrikes(des).every((s) => fistAnims.includes(s.anim) && !s.trail), 'Kian: físico só com punhos');
ok(des.special.type === 'erase' && des.special.usesPerMatch === 1 && des.special.unblockable && des.special.resistDamage > 0, 'Kian: especial Inexistir (1x por partida, indefensável, resiste com sanidade cheia)');
ok(des.special.bonusUseOnTranscend === 1, 'Kian: Transcender libera mais um Inexistir');
ok(des.abilities.some((a) => a.type === 'transcend'), 'Kian: Transcendência');
ok(des.abilities.some((a) => a.type === 'blink' && a.cooldown > 0), 'Kian: Teletransporte com cooldown');
const fb = des.abilities.find((a) => a.type === 'fearBlade');
ok(fb && fb.cooldown >= 20, `Lâmina do Medo: manifestação temporária com cooldown alto (${fb && fb.cooldown}s)`);
ok(des.dodge.style !== 'inexistir', 'Inexistir não é mais esquiva');

// ---------------- Origem e elemento ----------------
ok(ROSTER.every((c) => c.origin && ELEMENTS[c.element]), 'todos com origem e elemento válidos');
ok(get('joui').origin === 'Ordo Realitas' && get('joui').element === 'conhecimento', 'Joui Jouki: Ordo Realitas (Conhecimento)');

// ---------------- Cânone e mecânicas (TODO 2026-10-01) ----------------
const pas = (id, t) => (get(id).passives || []).some((p) => p.type === t);
const abil = (id, t) => (get(id).abilities || []).some((a) => a.type === t);
ok(pas('kian', 'precognition') && abil('kian', 'rejectMist'), 'Kian: Precognição + Rejeitar Névoa');
ok(get('kian').melee.strikes.reduce((n, s) => n + s.damage, 0) <= 215, 'Kian: combo reduzido (≤ 215)');
ok(get('kian').abilities.find((a) => a.type === 'transcend').endDrain > 0, 'Kian: Transcendência cobra sanidade');
ok(pas('kaiser', 'resistant') && abil('kaiser', 'flowerRain') && get('kaiser').special.area === 5, 'Kaiser: Resistente, Acácia, Cinerária em 5 m');
// RB + LT (mod+dodge): todo personagem tem um golpe nesse comando
ok(ROSTER.every((c) => (c.abilities || []).some((a) => a.input === 'carga+dodge')), 'todos têm habilidade em △ + L2 (Y + LT)');
ok(abil('kaiser', 'rootTrap') && abil('kaiser', 'cursedShots') && pas('kaiser', 'elementalAffinity') && get('kaiser').special.flowerStorm, 'Kaiser: Dendrobium, Balas Amaldiçoadas, Afinidade Elemental e Cinerária com tempestade de Acácia');
ok(abil('arthur', 'hatredTemple') && abil('arthur', 'bloodParalysis'), 'Arthur: Templo do Ódio + Dystopia');
ok(pas('joui', 'decepar') && get('joui').melee.strikes.slice(0, -1).every((s) => s.range <= 2.2), 'Joui: Decepar, sequência com alcance ≤ 2,2 m');
ok(pas('aghata', 'bloodNecklace'), 'Agatha: Colar Banhado em Sangue');
ok(pas('gal_sal', 'bulletDodge') && abil('gal_sal', 'sparkTeleport'), 'Gal: Desviar de Balas + Teletransporte');
const mods = (c) => (c.abilities || []).filter((a) => a.input.startsWith('block+') || a.input.startsWith('carga+')).map((a) => a.input);
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
ok(agu && ['maskForm', 'bearTrap', 'predatorScent', 'huntingDog'].every((t) => agu.abilities.some((a) => a.type === t)), 'Aguiar: Máscara do Mutilador, Armadilha de Urso, Predador de Sangue e Cães de Caça');
ok(agu && agu.abilities.find((a) => a.type === 'maskForm').noBlock, 'Aguiar: forma de máscara não consegue defender (intenção assassina)');
ok(agu && pas('aguiar', 'sonOfPain'), 'Aguiar: Filho da Dor');
const lab = get('labirinto');
const xan = get('xande');
ok(lab && lab.origin === 'Mascarados' && lab.melee.name === 'A Antena' && lab.ranged.name === 'Rajada Caótica', 'Labirinto: Mascarados, A Antena e Rajada Caótica');
ok(lab && ['mentalMaze', 'consumeMoment', 'helmetForm'].every((t) => abil('labirinto', t)) && lab.special.type === 'abyssMaze', 'Labirinto: Labirinto Mental, Consumir Momento, Capacete do ??? e especial do labirinto');
ok(xan && xan.origin === 'Os Cinco' && xan.melee.name.includes('Taco') && xan.ranged.boomerang, 'Xande: Os Cinco, taco com arame farpado e Skate Caótico que volta');
ok(xan && ['curseWeapon', 'polarize', 'noiseScreen', 'selfBuff'].every((t) => abil('xande', t)) && pas('xande', 'paranormalGladiator'), 'Xande: Amaldiçoar Arma, Polarização Caótica, Tela de Ruído, Velocidade Mortal, Gladiador Paranormal');
const fer = get('ferreiro');
ok(fer && fer.special.type === 'santoPact' && fer.special.minEnergy === 0.85 && fer.special.window === 45 && fer.special.form === 'deus_morte' && fer.melee.name === 'Espada Consumidora', 'Ferreiro: Espada Consumidora; Pacto do Santo exige 85% de sanidade, dura 45 s e leva ao Deus da Morte');
{
  const { getForm } = await import('../src/characters/forms/index.js');
  const deus = getForm('deus_morte');
  ok(!getForm('miguel_luzidio') && getForm('deus_morte').baseId === 'ferreiro', 'sem a forma humana do Miguel: Ferreiro → Deus da Morte');
  ok(deus && deus.boss && deus.stats.size === 2 && deus.weakTo.fire > 1 && deus.weakTo.energia > 1 && deus.regen && deus.poise, 'Deus da Morte: chefe, 2x maior, fraco contra fogo e Energia, regenera e não fica preso em combo');
  ok(deus && ['timelockGrab', 'deadHands', 'timeWarp'].every((t) => deus.abilities.some((a) => a.type === t)), 'Deus da Morte: Espiral Descendente, Controlar Mortos, Senhor do Tempo');
}
const jua = get('juan');
ok(jua && jua.element === 'sangue' && ['ritualCuts', 'command', 'bloodLink', 'heavyProtection'].every((t) => abil('juan', t)) && pas('juan', 'lifesteal') && jua.special.type === 'devilPact' && jua.special.form === 'diabo' && !jua.special.duration && jua.special.usesPerMatch === 1, 'Juan: Descarnar, Perturbação, Vínculo de Sangue, Armadura de Sangue, Faca Predadora e o Renascimento (Trono do Diabo até o fim do round)');
{
  const { getForm } = await import('../src/characters/forms/index.js');
  const dia = getForm('diabo');
  ok(dia && dia.regen && ['veinChains', 'devilHate', 'bloodTransport', 'summonBlood', 'bloodGeysers'].every((t) => dia.abilities.some((a) => a.type === t)) && dia.special.type === 'devilDeal' && dia.melee.strikes.every((x) => x.bleed) && dia.regen.low && dia.passives.some((p) => p.type === 'hatesElement' && p.element === 'conhecimento'), 'Diabo (Portador do Trono): Veias de Sangue, Ódio do Diabo (no alvo), Transportar pelo Sangue (arrasta), Senhor do Sangue, Sangue nos Arredores, Amaldiçoar Arma, Regeneração (mais forte ferido), Pacto e ódio ao Conhecimento');
  ok(dia && dia.ranged.visual === 'bloodSpear' && dia.ranged.pool && dia.ranged.onHit.impale && ['forward', 'side', 'back'].every((k) => dia.ranged.variants[k]), 'Diabo: Lança de Sangue empala, deixa poça e tem 3 variações (frente, lados, trás)');
}
const lir = get('lirio');
ok(lir && lir.origin === 'Os Cinco' && lir.melee.name === 'Leonora' && lir.stats.maxHealth > 1000 && lir.stats.moveSpeed < Math.min(...ROSTER.filter((c) => c.id !== 'lirio').map((c) => c.stats.moveSpeed)), 'Lírio: Os Cinco, Leonora, mais vida e o mais lento do elenco');
ok(lir && ['heavyBlow', 'caiDentro', 'bloodBind', 'curseWeapon', 'heavyProtection'].every((t) => abil('lirio', t)) && ['ironBlood', 'thickSkin', 'heavyHand'].every((t) => pas('lirio', t)), 'Lírio: Golpe Pesado, Cai Dentro, Amarras de Sangue, Leonora Amaldiçoada, Proteção Pesada + Sangue de Ferro, Casca Grossa, Mão Pesada');
ok(lir && lir.melee.ground && lir.melee.ground.otg && lir.melee.strikes.some((s) => s.armor) && lir.assistAuto && lir.grip.twoHand, 'Lírio: golpe no chão, resistência em golpes pesados, Cai Dentro automático na equipe e Leonora com as duas mãos');

// ---------------- V2.3: combos verticais ----------------
ok(ROSTER.every((c) => c.melee.up && c.melee.up.launcher && c.melee.up.finisher === 'launchHigh'), 'todos com ↑ + ○ (lançador próprio)');
ok(ROSTER.every((c) => c.melee.down && c.melee.down.finisher === 'knockdown'), 'todos com ↓ + ○ (derruba)');
ok(COMBAT.down && COMBAT.down.lie > 0 && COMBAT.airCombo.maxHits <= 4, 'queda com recuperação e combo aéreo limitado');

// ---------------- Regras gerais V2.1 ----------------
ok(COMBAT.grab && COMBAT.grab.range < 2 && COMBAT.grab.damage > 0, 'agarrão (Defesa + ○): curta distância');
ok(!COMBAT.powered && ROSTER.every((c) => !(c.abilities || []).some((a) => a.input.startsWith('mod+'))), 'habilidades em △ + ○/□/L2 e R2 + △/× (sem versões fortes, sem R1 modificador)');

console.log(fails ? `\n${fails} verificação(ões) falharam.` : '\nTudo certo.');
process.exit(fails ? 1 : 0);
