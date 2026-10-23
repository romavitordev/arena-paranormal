import * as THREE from 'three';
import { PASSIVES, hasPassive } from './passives.js';
import { COMBAT } from '../config/combat.js';
import { angleDiff, yawTo, DEG, distXZ } from '../core/util.js';
import { elementMultiplier } from '../config/elements.js';
import { weaknessMult } from './forms.js';
import { balanceOf } from '../config/balance.js';

// Pausa no impacto conforme o peso do golpe
function hitstopFor(o, dealt) {
  const H = COMBAT.hitstopBy;
  if (o.hitstop) return o.hitstop;
  if (o.launch) return H.launch;
  if (dealt >= 55) return H.heavy;
  if (dealt <= 24) return H.light;
  return H.medium;
}

// Escala de combo: quantos acertos seguidos o alvo já tomou neste combo
function comboScale(victim, o) {
  const S = COMBAT.comboScaling;
  let k = S[Math.min(victim.comboHits || 0, S.length - 1)];
  const floor = o.grab ? COMBAT.comboScalingFloor.grab : COMBAT.comboScalingFloor[o.kind];
  if (floor) k = Math.max(k, floor);
  return k;
}

const tmp = new THREE.Vector3();
const src = new THREE.Vector3();

/**
 * Ponto único de aplicação de dano. Todo golpe (físico, à distância, habilidade,
 * especial) passa por aqui, então regras novas entram num só lugar.
 * o: { damage, kind:'melee'|'ranged'|'ability'|'special', knockback, hitstun, launch, lowLaunch,
 *      stun, dir:Vector3, strike, color, sound, pos, reaction:boolean, ignoreInvuln,
 *      unblockable, guardBreak, scale, applyMeleePassives }
 * Retorna o dano causado (número) ou 'blocked' | 'parried' | 'countered'.
 */
export function applyHit(world, attacker, victim, o) {
  if (!victim || victim.state === 'ko') return 0;
  // golpe contra o chão (o.otg): acerta quem está CAÍDO, uma vez por queda (não vale na invulnerabilidade de levantar)
  const otg = !!o.otg && victim.state === 'downed' && !victim.otgTaken && victim.invuln <= 0 && victim.visible;
  if (otg) o = { ...o, reaction: false, ignoreInvuln: true };
  if (!o.ignoreInvuln && victim.isInvulnerable()) {
    if (victim.state === 'dodge' && victim.dodge) victim.dodge.threat = true; // a esquiva desviou de algo: gasta a carga
    return 0;
  }

  // PERCEPÇÃO ANACRÔNICA (Anfitrião): ele já sabe o que vai acontecer — de tempos em tempos desvia sozinho de um golpe
  // (não vale contra especiais nem no meio de uma cena)
  if (!o.ignoreInvuln && o.kind !== 'special' && (victim.chronoCd || 0) <= 0 && hasPassive(victim, 'chronoSense')
    && ['idle', 'walk', 'run', 'charging', 'block', 'attack', 'ranged', 'hitstun'].includes(victim.state)) {
    const P = victim.def.passives.find((p) => p.type === 'chronoSense');
    if (victim.trySubstitution({ free: true, label: 'PERCEPÇÃO ANACRÔNICA!' })) {
      victim.chronoCd = P.cooldown ?? 15;
      // ele já sabia: o próximo golpe dele (por pouco tempo) vem mais forte
      if (!victim.findBuff('anachronic')) victim.addBuff({ type: 'anachronic', name: 'JÁ SABIA', time: P.window ?? 1.5, duration: P.window ?? 1.5, mult: P.mult ?? 1.2, affects: ['melee', 'ranged', 'ability'] });
      return 0;
    }
  }

  // DESVIO IMPERTURBÁVEL (Nubi): na janela de calma, o golpe (não especial) é desviado com a Substituição do jogo
  const ce = victim.calmEvade;
  if (ce && world.time <= ce.until && o.kind !== 'special' && !o.ignoreInvuln && !o.grab) {
    victim.calmEvade = null;
    if (victim.trySubstitution({ free: true, label: ce.label })) {
      world.fx.burst(victim.chestPos(), { count: 14, color: 0x0c0a0e, kind: 'smoke', speed: 1.4, life: 0.4, size: 0.4 });
      return 0;
    }
  }

  // EMBARALHAR (Guizo): o golpe pode acertar uma das cópias ilusórias em vez dele
  if (shuffleDodge(world, attacker, victim, o)) return 'countered';

  // "PODE VIR!" (Dalmo / Colosso): na postura do □, um golpe físico ou habilidade do adversário vindo da frente e de
  // perto é segurado — ele agarra quem bateu e devolve (projéteis e especiais passam)
  const cs = victim.counterStance;
  if (cs && cs.active && victim.state === 'ranged' && (o.kind === 'melee' || o.kind === 'ability') && attacker === victim.opponent
    && Math.hypot(attacker.pos.x - victim.pos.x, attacker.pos.z - victim.pos.z) <= (cs.reach ?? 3.4)
    && Math.abs(angleDiff(victim.yaw, yawTo(victim.pos, attacker.pos))) <= 100 * DEG) {
    victim.arenaRiposte(attacker);
    return 'countered';
  }

  // Postura de contra-ataque (ex.: Joui): anula o golpe físico e revida
  if (o.kind === 'melee' && victim.state === 'attack' && victim.combo.strike && victim.combo.strike.counter && !victim.combo.counterUsed) {
    const w = victim.combo.strike.counter.window;
    if (victim.stateTime >= w[0] && victim.stateTime <= w[1]) {
      victim.triggerCounter(attacker);
      return 'countered';
    }
  }

  let mult = attacker.damageMultiplier(o.kind);
  for (const p of attacker.def.passives || []) {
    const P = PASSIVES[p.type];
    if (P && P.damageMod) mult *= P.damageMod({ attacker, victim, kind: o.kind, passive: p, world, o });
  }
  // elemento (ciclo do Diário de Deus): só RITUAIS (habilidades e especiais) têm vantagem/desvantagem,
  // não os golpes físicos nem o ataque principal. O elemento do ritual é o dele (o.element) ou o de quem conjura.
  const ritual = o.kind === 'ability' || o.kind === 'special';
  const element = ritual ? o.element || attacker.def.element : null;
  const E = COMBAT.elements;
  if (ritual) mult *= elementMultiplier(element, victim.def.element, E.advantage, E.disadvantage);
  // a ARMA AMALDIÇOADA leva o elemento do ritual nos golpes físicos (o Xande escolhe o que supera o adversário)
  else if (o.kind === 'melee' || o.kind === 'ranged') {
    const cw = attacker.findBuff && attacker.findBuff('curse');
    if (cw && cw.element) mult *= elementMultiplier(cw.element, victim.def.element, E.advantage, E.disadvantage);
  }
  for (const p of victim.def.passives || []) {
    const P = PASSIVES[p.type];
    if (P && P.damageTakenMod) mult *= P.damageTakenMod({ attacker, victim, kind: o.kind, element, passive: p, world, o });
  }
  for (const b of victim.buffs || []) if (b.takenMult && (!b.takenKinds || b.takenKinds.includes(o.kind))) mult *= b.takenMult;
  // fraquezas da forma (Deus da Morte: fogo e Energia)
  const weak = weaknessMult(victim, attacker, o);
  if (weak > 1 && !o.noWeakFx) victim.notify('FRAQUEZA!', true);
  mult *= weak;
  // vantagem do nível Super Difícil (CpuController.attach): a CPU bate mais e aguenta mais, como um chefe
  if (attacker.cpuEdge) mult *= attacker.cpuEdge.dealt;
  if (victim.cpuEdge) mult *= victim.cpuEdge.taken;
  // BALANCEAMENTO GERAL (config/balance.js): o ajuste fino de cada personagem
  const balA = balanceOf(attacker);
  const balV = balanceOf(victim);
  if (balA && balA.dealt) mult *= balA.dealt;
  if (balV && balV.taken) mult *= balV.taken;
  const attempted = Math.round(o.damage * mult);
  // passivas de peso: quem bate empurra/atordoa mais (Mão Pesada); quem apanha é empurrado menos (Casca Grossa)
  let kbMult = 1;
  let stunBonus = 0;
  for (const p of attacker.def.passives || []) {
    const P = PASSIVES[p.type];
    if (P && P.knockbackMod) kbMult *= P.knockbackMod({ kind: o.kind, passive: p });
    if (P && P.hitstunBonus) stunBonus += P.hitstunBonus({ kind: o.kind, passive: p });
  }
  for (const p of victim.def.passives || []) {
    const P = PASSIVES[p.type];
    if (P && P.knockbackTakenMod) kbMult *= P.knockbackTakenMod({ kind: o.kind, passive: p, o });
  }
  for (const b of victim.buffs || []) if (b.knockbackTakenMult) kbMult *= b.knockbackTakenMult; // ex.: Resistência à Dor (Balu)

  // ---------------- defesa ----------------
  const B = COMBAT.block;
  if (o.dir) src.copy(o.dir).negate().add(victim.pos);
  else src.copy(attacker.pos);
  const facing = Math.abs(angleDiff(victim.yaw, yawTo(victim.pos, src))) <= (B.arc * DEG) / 2;
  if (victim.isGuarding() && facing && !o.unblockable && o.kind !== 'special') {
    if (o.guardCrush && !o.guardBreak) victim.guard -= o.guardCrush; // golpe forte: gasta muito da defesa
    if (o.guardBreak) {
      victim.guardBreak(); // golpe que quebra a defesa: dano cheio a seguir
    } else {
      const pb = (victim.def.defense && victim.def.defense.perfectBlock) || B.perfect;
      // um estado ativo pode alargar a janela (ex.: a Afinidade com Precognição do Gal vê o golpe antes de ele vir)
      const pbWin = Math.max(pb ? pb.window : 0, ...(victim.buffs || []).map((b) => b.perfectBlockWindow || 0));
      if (pb && !victim.guardMoving && world.inputTime - victim.blockPressTime <= pbWin) {
        // Bloqueio Perfeito: nega o dano e abre janela de contra-ataque
        const p = victim.chestPos();
        world.fx.play('FX_PERFECT_BLOCK', p, { color: victim.def.energyColor, yaw: victim.yaw });
        world.audio.play('perfectBlock');
        world.hitstop(0.12);
        victim.notify('BLOQUEIO PERFEITO!', true);
        // golpe físico: o atacante fica aberto; projétil: só é anulado
        if (o.kind === 'melee') attacker.stun(pb.counterStun, 'stagger');
        victim.setState('idle'); // livre para contra-atacar na hora
        world.onParry && world.onParry(victim, attacker);
        return 'parried';
      }
      let chip = o.kind === 'melee' ? B.meleeChip : B.rangedChip;
      let guardMod = 1;
      for (const p of victim.def.passives || []) {
        const P = PASSIVES[p.type];
        if (P && P.blockChipMod) chip *= P.blockChipMod({ passive: p });
        if (P && P.guardDamageMod) guardMod *= P.guardDamageMod({ passive: p });
      }
      const dealt = victim.takeDamage(Math.round(attempted * chip));
      // golpe forte (guardCrush) já gastou a defesa: não soma o desgaste normal
      if (victim.state !== 'ko') victim.onBlockedHit(o.guardCrush ? 0 : attempted * guardMod, attacker);
      // bloqueio pesado: quem tem animação própria finca os pés e absorve o impacto com o corpo
      if (victim.state === 'block' && (o.guardCrush || attempted >= 40) && victim.heavyBlockReact) victim.heavyBlockReact(attacker);
      world.hitstop(COMBAT.hitstop * 0.6);
      if (o.kind === 'melee') runMeleePassives(world, attacker, victim, o, dealt, attempted);
      world.onHit && world.onHit(attacker, victim, dealt, { ...o, blocked: true });
      return 'blocked';
    }
  }

  // quem vem no dash longo e toma um golpe pesado (quebra/gasta defesa) ou um agarrão cai no chão
  if (victim.state === 'dashing' && victim.dash && victim.dash.kind === 'long' && (o.guardBreak || o.guardCrush || o.grab)) {
    o = { ...o, launch: true, lowLaunch: true, knockback: Math.max(o.knockback || 0, 4), hitstun: 1.0 };
    victim.notify('DASH INTERROMPIDO', true);
  }
  let incoming = Math.round(attempted * comboScale(victim, o));
  // escudo (ex.: Tela de Ruído): absorve dano de impacto, corte e projétil até acabar
  const shield = (victim.buffs || []).find((b) => b.shield > 0 && (!b.shieldKinds || b.shieldKinds.includes(o.kind)));
  if (shield && incoming > 0) {
    const absorbed = Math.min(shield.shield, incoming);
    shield.shield -= absorbed;
    incoming -= absorbed;
    world.fx.burst(victim.chestPos(), { count: 10, color: shield.color ?? 0x7ad0ff, speed: 3, life: 0.25, size: 0.18 });
    if (shield.shield <= 0) { shield.time = 0; victim.notify('TELA ROMPIDA', true); }
  }
  const dealt = victim.takeDamage(incoming);
  victim.comboHits = (victim.comboHits || 0) + 1;
  victim.comboDamage = (victim.comboDamage || 0) + dealt;

  // limite de lançamentos por combo: o próximo vira empurrão
  let launch = !!o.launch;
  let knockback = (o.knockback ?? 2) * kbMult;
  if (launch && !o.juggle && !o.high && (victim.comboLaunches || 0) >= COMBAT.maxLaunchesPerCombo && victim.state !== 'idle') {
    launch = false;
    knockback = Math.max(knockback, 6);
  }
  // super armadura (Transcender): aguenta o golpe sem reagir
  let reaction = o.reaction !== false;
  if (reaction && victim.armorHits > 0 && o.kind !== 'special' && !o.grab && victim.state !== 'ko') {
    victim.armorHits--;
    reaction = false;
    world.fx.flash(victim.chestPos(), { color: victim.def.energyColor, size: 2.5, life: 0.15 });
    victim.notify('AGUENTOU!', true);
  }

  // firmeza de chefe (def.poise): depois de N golpes seguidos no mesmo combo, para de reagir (não fica preso em combo)
  if (reaction && victim.def.poise && victim.comboHits > victim.def.poise.hits && !o.grab && o.kind !== 'special') {
    reaction = false;
    if (victim.comboHits === victim.def.poise.hits + 1) { victim.notify('INABALÁVEL', true); world.fx.play('FX_BLOCK', victim.chestPos(), { color: 0x6a6670 }); }
  }
  // resistência DURANTE golpes pesados (victim.superArmor): um golpe pequeno não cancela um golpe pesado já avançado.
  // Golpes fortes, lançamentos, agarrões, quebras de defesa e especiais continuam interrompendo.
  const sa = victim.superArmor;
  if (reaction && sa && sa.hits > 0 && world.time >= sa.from && world.time <= sa.to && o.kind !== 'special' && !o.grab && !o.guardBreak && !launch && incoming <= sa.max) {
    sa.hits--;
    reaction = false;
    world.fx.play('FX_BLOCK', victim.chestPos(), { color: 0xd8c8a8 });
    victim.notify('AGUENTOU!', true);
  }

  const dir = o.dir ? tmp.copy(o.dir).setY(0).normalize() : tmp.subVectors(victim.pos, attacker.pos).setY(0).normalize();
  if (reaction) {
    victim.react({
      dir,
      knockback,
      hitstun: (o.hitstun ?? (launch ? COMBAT.launchHitstun : o.launch ? 0.55 : COMBAT.hitstun)) + stunBonus,
      launch,
      lowLaunch: !!o.lowLaunch,
      high: !!o.high,
      spike: !!o.spike,
      stun: o.stun,
    });
    if (launch && !o.juggle) victim.comboLaunches = (victim.comboLaunches || 0) + 1;
  }

  const p = o.pos || victim.chestPos();
  const color = o.color ?? attacker.def.energyColor;
  const scale = o.scale ?? (launch ? 1.5 : 1);
  world.fx.play(launch || scale >= 1.5 ? 'FX_HIT_HEAVY' : 'FX_HIT_SMALL', p, { color, scale });
  if (o.strike && o.strike.impactFx === 'smash') world.fx.play('FX_DUST', victim.pos, { scale: Math.min(1.6, scale) });
  if (otg) {
    victim.otgTaken = true;
    world.fx.play('FX_GROUND_SMASH', victim.pos, { scale: 0.9 });
    victim.notify('NO CHÃO!', true);
  }
  if (attacker.buffMultiplierActive(o.kind)) world.fx.play('FX_ENERGY', p);
  world.audio.play(o.sound || 'impact', { volume: launch ? 1.1 : 0.9 });
  world.hitstop(hitstopFor({ ...o, launch }, dealt));
  world.cameraRig.shake(launch ? 0.35 : 0.15, 0.2);

  if (o.kind === 'melee' || o.applyMeleePassives) runMeleePassives(world, attacker, victim, o, dealt, attempted);

  // arma amaldiçoada (Aghata): golpes físicos e a faca arremessada abrem sangramento
  // (por elemento — abilities.js CURSE_ELEMENTS): Sangue sangra; Morte apodrece (dano contínuo) e deixa lento um
  // instante; Conhecimento drena a sanidade; Energia às vezes descarrega um choque extra
  const curse = attacker.findBuff && attacker.findBuff('curse');
  if (curse && (o.kind === 'melee' || o.kind === 'ranged') && victim.state !== 'ko') {
    if (curse.bleed) victim.applyBleed(curse.bleed, attacker);
    if (curse.slow && victim.addBuff) {
      const sb = victim.findBuff('curseSlow');
      if (sb) sb.time = curse.slow.time;
      else victim.addBuff({ type: 'curseSlow', name: 'APODRECENDO', time: curse.slow.time, duration: curse.slow.time, speedMult: curse.slow.mult });
    }
    if (curse.drain && victim.energy !== undefined) {
      victim.energy = Math.max(0, victim.energy - curse.drain);
      world.fx.burst(victim.chestPos(), { count: 4, color: 0xf2c230, speed: 1.2, up: 1, life: 0.4, size: 0.08 });
    }
    if (curse.shock && Math.random() < curse.shock.chance) {
      const n = victim.takeDamage(curse.shock.damage);
      world.fx.burst(victim.chestPos(), { count: 14, color: 0xc89aff, speed: 4, life: 0.25, size: 0.08 });
      world.audio.play('chargeHum', { volume: 0.7, pitch: 2 });
      world.onHit && world.onHit(attacker, victim, n, { kind: 'ability', ability: 'choque' });
    }
  }
  // golpe que corta fundo (ex.: machado do Mutilador) e estados que fazem sangrar (máscara do Aguiar)
  if (o.kind === 'melee' && victim.state !== 'ko' && o.strike && o.strike.bleed) victim.applyBleed(o.strike.bleed, attacker);
  // máscara do Mutilador: enquanto estiver com ela, TODO golpe do machado sangra — corpo a corpo e o machado na corda
  if ((o.kind === 'melee' || o.kind === 'ranged') && victim.state !== 'ko') {
    const mb = (attacker.buffs || []).find((b) => b.meleeBleed);
    if (mb) victim.applyBleed(mb.meleeBleed, attacker);
  }
  // Vínculo de Sangue (Juan): parte do dano que ele recebe é replicada no alvo marcado pelo outro símbolo
  const link = victim.findBuff && victim.findBuff('bloodLink');
  if (link && dealt > 0 && link.target && link.target.state !== 'ko') {
    const back = Math.round(dealt * link.ratio);
    if (back > 0) {
      link.target.takeDamage(back);
      world.fx.tracer(victim.chestPos(), link.target.chestPos(), { color: 0xc01828, life: 0.15, width: 0.04 });
      world.fx.burst(link.target.chestPos(), { count: 8, color: 0x9a0010, speed: 2, life: 0.4, size: 0.14, gravity: 6 });
    }
  }
  // passivas de quem apanha (ex.: Amuleto Elétrico)
  for (const p of victim.def.passives || []) {
    const P = PASSIVES[p.type];
    if (P && P.onHitTaken) P.onHitTaken({ attacker, victim, kind: o.kind, dealt, passive: p, world, o });
  }
  // Arma de Sangue (Arthur): a lâmina do próprio sangue faz o alvo sangrar
  const blade = attacker.findBuff && attacker.findBuff('bloodBlade');
  if (blade && o.kind === 'melee' && victim.state !== 'ko') victim.applyBleed(blade.bleed, attacker);

  // ECO ESPIRAL "Eco Dolor" (Dante — Olhos Abertos): o vulto do alvo repete cada golpe do Dante (danteAbilities.js)
  const eco = victim.findBuff && victim.findBuff('ecoDolor');
  if (eco && eco.owner === attacker && !o.echo && dealt > 0 && victim.state !== 'ko') eco.queue(dealt, o);

  world.onHit && world.onHit(attacker, victim, dealt, o);
  return dealt;
}

function runMeleePassives(world, attacker, victim, o, dealt, attempted) {
  for (const passive of attacker.def.passives || []) {
    const P = PASSIVES[passive.type];
    if (P && P.onMeleeHit && !(o.strike && o.strike.noPassive)) {
      P.onMeleeHit({ attacker, victim, strike: o.strike || { damage: attempted }, dealt, attempted, passive, world });
    }
  }
}

// (antes em guizoAbilities.js: importá-lo de lá fechava o ciclo damage → guizoAbilities → abilities → beasts → npcs →
// damage, e a galeria quebrava com "Cannot access 'BloodZombie' before initialization")
// EMBARALHAR (lido em damage.js): um golpe que ia acertar o Guizo pega numa cópia — ela se desfaz e o dano some
function shuffleDodge(world, attacker, victim, o) {
  const b = victim.findBuff && victim.findBuff('shuffle');
  if (!b || o.kind === 'special' || o.ignoreInvuln || !['melee', 'ranged', 'ability'].includes(o.kind)) return false;
  const alive = b.copies.filter((c) => c.alive);
  if (!alive.length) return false;
  if (Math.random() > b.perCopy * alive.length) return false;
  // a cópia mais perto de quem bateu leva o golpe
  alive.sort((x, y) => distXZ(x.pos, attacker.pos) - distXZ(y.pos, attacker.pos));
  alive[0].shatter(0xd8c070);
  victim.notify('ERA UMA CÓPIA!', true);
  if (attacker.notify) attacker.notify('ERA UMA CÓPIA!');
  return true;
}
