// Regras passivas de personagem, acionadas por eventos de combate.
// Funções puras sempre que possível (testáveis sem navegador).

/**
 * Regra do Injustiça (determinística, sem aleatoriedade):
 *   1. o golpe tira X de vida do INIMIGO;
 *   2. em seguida o próprio INIMIGO recupera Y de vida (sempre Y < X);
 *   3. e perde Y × energyRatio (1,5) de sanidade (energia).
 * O Injustiça não se cura. Se o golpe causou menos dano que X (inimigo com
 * pouca vida), Y é reduzido na mesma proporção, para nunca devolver mais vida
 * do que o dano realmente causado.
 */
export function computeDrain({ X, Y, dealt, energyRatio = 1.5 }) {
  if (!(X > 0) || !(Y > 0) || !(dealt > 0)) return { heal: 0, energyRemoved: 0 };
  const safeY = Math.min(Y, X * 0.999); // garante Y < X mesmo com configuração errada
  const ratio = Math.min(1, dealt / X);
  const heal = safeY * ratio;
  return { heal, energyRemoved: heal * energyRatio };
}

export const hasPassive = (f, type) => !!(f && f.def && (f.def.passives || []).some((p) => p.type === type));

export const PASSIVES = {
  // Mascarado: golpes vindos pelas costas do inimigo causam mais dano
  backstab: {
    damageMod({ attacker, victim, kind, passive }) {
      if (kind === 'special' || !(passive.kinds || ['melee']).includes(kind)) return 1;
      if (hasPassive(victim, 'precognition')) return 1; // Precognição: não é pego desprevenido
      const fx = Math.sin(victim.yaw);
      const fz = Math.cos(victim.yaw);
      const dx = attacker.pos.x - victim.pos.x;
      const dz = attacker.pos.z - victim.pos.z;
      const len = Math.hypot(dx, dz) || 1;
      const dot = (fx * dx + fz * dz) / len; // -1 = atacante exatamente atrás
      return dot < -0.5 ? passive.mult ?? 1.25 : 1;
    },
  },
  // Joui — Decepar: o finalizador corta mais fundo quem já está "morrendo"
  decepar: {
    damageMod({ victim, kind, passive, o }) {
      if (kind !== 'melee' || !o || !o.strike || !o.strike.finisher) return 1;
      return victim.health <= victim.maxHealth * (passive.threshold ?? 0.2) ? passive.mult ?? 1.3 : 1;
    },
  },
  // Kaiser — Resistente: armadura natural contra dano físico
  resistant: {
    damageTakenMod({ kind, passive }) {
      return (passive.kinds || ['melee']).includes(kind) ? passive.mult ?? 0.95 : 1;
    },
  },
  // Agatha — Colar Banhado em Sangue: resiste a Sangue e faz o sangramento dela doer mais
  bloodNecklace: {
    damageTakenMod({ element, passive }) {
      return element === 'sangue' ? passive.resist ?? 0.8 : 1;
    },
  },
  // Kian — Precognição: imune a bônus de costas e a ficar "surpreso" (lido em abilities/passives)
  precognition: {},
  // Gal — Desviar de Balas: esquivar de projéteis não gasta carga de esquiva (lido no Fighter)
  bulletDodge: {},
  // Dante — Concentração Inquebrável: rituais (habilidades) custam menos sanidade (lido no Fighter)
  ritualFocus: {},
  // Erin — Amuleto Elétrico: quem a acerta com golpe físico leva um choque (dano de Energia)
  electricAmulet: {
    onHitTaken({ attacker, victim, kind, passive, world }) {
      if (kind !== 'melee' || !attacker || attacker === victim || attacker.state === 'ko' || !attacker.takeDamage) return;
      if (attacker.def && attacker.def.element === 'energia') return; // criatura de Energia não sente
      attacker.takeDamage(passive.damage ?? 6);
      const a = attacker.chestPos();
      world.fx.lightning(victim.chestPos(), a, { color: passive.color ?? 0x5ae8ff, life: 0.12 });
      world.fx.burst(a, { count: 6, color: passive.color ?? 0x5ae8ff, speed: 3, life: 0.2, size: 0.1 });
    },
  },
  // Aguiar — Filho da Dor: quando apanha várias vezes seguidas, abraça a dor e resiste mais
  sonOfPain: {
    damageTakenMod({ victim, passive }) {
      return (victim.comboHits || 0) >= (passive.after ?? 3) ? passive.mult ?? 0.75 : 1;
    },
  },
  meleeDrain: {
    onMeleeHit({ attacker, victim, strike, dealt, attempted, passive, world }) {
      const { heal, energyRemoved } = computeDrain({
        X: attempted ?? strike.damage,
        Y: strike.heal ?? passive.heal ?? 0,
        dealt,
        energyRatio: passive.energyRatio ?? 1.5,
      });
      // inimigo nocauteado pelo golpe não se recupera
      if (heal <= 0 || victim.state === 'ko' || victim.health <= 0) return;
      victim.heal(heal); // a cura é NO INIMIGO...
      const removed = victim.drainEnergy(energyRemoved); // ...que paga com sanidade
      if (passive.giveEnergyToAttacker) attacker.addEnergy(removed);
      world.onDrain && world.onDrain(attacker, victim, heal, removed);
    },
  },
};

// Valida a configuração no carregamento (avisa no console).
export function validatePassives(def) {
  const problems = [];
  for (const p of def.passives || []) {
    if (!PASSIVES[p.type]) problems.push(`${def.id}: passiva desconhecida "${p.type}"`);
    if (p.type === 'meleeDrain') {
      def.melee.strikes.forEach((s, i) => {
        if (!(s.heal < s.damage)) problems.push(`${def.id}: golpe ${i + 1} tem Y (${s.heal}) >= X (${s.damage})`);
      });
    }
  }
  return problems;
}
