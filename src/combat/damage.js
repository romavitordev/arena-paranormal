import * as THREE from 'three';
import { PASSIVES } from './passives.js';
import { COMBAT } from '../config/combat.js';
import { angleDiff, yawTo, DEG } from '../core/util.js';
import { elementMultiplier } from '../config/elements.js';

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
  if (!o.ignoreInvuln && victim.isInvulnerable()) return 0;


  // Postura de contra-ataque (ex.: Mascarado): anula o golpe físico e revida
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
  for (const p of victim.def.passives || []) {
    const P = PASSIVES[p.type];
    if (P && P.damageTakenMod) mult *= P.damageTakenMod({ attacker, victim, kind: o.kind, element, passive: p, world, o });
  }
  const attempted = Math.round(o.damage * mult);

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
      if (pb && !victim.guardMoving && world.inputTime - victim.blockPressTime <= pb.window) {
        // Bloqueio Perfeito: nega o dano e abre janela de contra-ataque
        const p = victim.chestPos();
        world.fx.flash(p, { color: victim.def.energyColor, size: 3.5, life: 0.2 });
        world.fx.ring(p, { color: victim.def.energyColor, radius: 2.4, life: 0.35, vertical: true, yaw: victim.yaw });
        world.fx.burst(p, { count: 30, color: victim.def.energyColor, speed: 8, life: 0.4, size: 0.25 });
        world.audio.play('perfectBlock');
        world.hitstop(0.12);
        victim.notify('BLOQUEIO PERFEITO!', true);
        // golpe físico: o atacante fica aberto; projétil: só é anulado
        if (o.kind === 'melee') attacker.stun(pb.counterStun, 'stagger');
        victim.setState('idle'); // livre para contra-atacar na hora
        world.onParry && world.onParry(victim, attacker);
        return 'parried';
      }
      const chip = o.kind === 'melee' ? B.meleeChip : B.rangedChip;
      const dealt = victim.takeDamage(Math.round(attempted * chip));
      // golpe forte (guardCrush) já gastou a defesa: não soma o desgaste normal
      if (victim.state !== 'ko') victim.onBlockedHit(o.guardCrush ? 0 : attempted, attacker);
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
  const dealt = victim.takeDamage(Math.round(attempted * comboScale(victim, o)));
  victim.comboHits = (victim.comboHits || 0) + 1;
  victim.comboDamage = (victim.comboDamage || 0) + dealt;

  // limite de lançamentos por combo: o próximo vira empurrão
  let launch = !!o.launch;
  let knockback = o.knockback ?? 2;
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

  const dir = o.dir ? tmp.copy(o.dir).setY(0).normalize() : tmp.subVectors(victim.pos, attacker.pos).setY(0).normalize();
  if (reaction) {
    victim.react({
      dir,
      knockback,
      hitstun: o.hitstun ?? (launch ? COMBAT.launchHitstun : o.launch ? 0.55 : COMBAT.hitstun),
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
  world.fx.impact(p, color, scale);
  if (attacker.buffMultiplierActive(o.kind)) {
    world.fx.burst(p, { count: 10, color: 0xa46bff, speed: 4, life: 0.6, size: 0.35, kind: 'glow' });
  }
  world.audio.play(o.sound || 'impact', { volume: launch ? 1.1 : 0.9 });
  world.hitstop(hitstopFor({ ...o, launch }, dealt));
  world.cameraRig.shake(launch ? 0.35 : 0.15, 0.2);

  if (o.kind === 'melee' || o.applyMeleePassives) runMeleePassives(world, attacker, victim, o, dealt, attempted);

  // arma amaldiçoada (Aghata): golpes físicos e a faca arremessada abrem sangramento
  const curse = attacker.findBuff && attacker.findBuff('curse');
  if (curse && (o.kind === 'melee' || o.kind === 'ranged') && victim.state !== 'ko') victim.applyBleed(curse.bleed, attacker);
  // golpe que corta fundo (ex.: machado do Mutilador) e estados que fazem sangrar (máscara do Aguiar)
  if (o.kind === 'melee' && victim.state !== 'ko') {
    if (o.strike && o.strike.bleed) victim.applyBleed(o.strike.bleed, attacker);
    const mb = (attacker.buffs || []).find((b) => b.meleeBleed);
    if (mb) victim.applyBleed(mb.meleeBleed, attacker);
  }
  // passivas de quem apanha (ex.: Amuleto Elétrico)
  for (const p of victim.def.passives || []) {
    const P = PASSIVES[p.type];
    if (P && P.onHitTaken) P.onHitTaken({ attacker, victim, kind: o.kind, dealt, passive: p, world, o });
  }
  // Arma de Sangue (Arthur): a lâmina do próprio sangue faz o alvo sangrar
  const blade = attacker.findBuff && attacker.findBuff('bloodBlade');
  if (blade && o.kind === 'melee' && victim.state !== 'ko') victim.applyBleed(blade.bleed, attacker);

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
