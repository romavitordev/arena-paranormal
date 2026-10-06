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
  // Joui: golpes vindos pelas costas do inimigo causam mais dano
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
  // O Diabo — Decepar Máscara: odeia o Conhecimento e jurou destruí-lo; bate mais forte em quem é desse elemento
  hatesElement: {
    damageMod({ victim, passive }) {
      return victim && victim.def && victim.def.element === passive.element ? passive.mult ?? 1.15 : 1;
    },
  },
  // Arthur — Preço de Sangue: sem sanidade, paga rituais e a Arma de Sangue com a própria vida (lido no Fighter)
  bloodPrice: {},
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
  // Juan — Faca Predadora: a faca absorve o sangue do golpe e o devolve ao Juan (cura uma parte do dano físico)
  lifesteal: {
    onMeleeHit({ attacker, dealt, passive, world }) {
      if (!(dealt > 0) || attacker.state === 'ko') return;
      const heal = Math.round(dealt * (passive.ratio ?? 0.15));
      attacker.health = Math.min(attacker.maxHealth, attacker.health + heal);
      if (heal > 0 && Math.random() < 0.5) world.fx.burst(attacker.chestPos(), { count: 4, color: 0xc01828, speed: 1, life: 0.4, size: 0.12 });
    },
  },
  // Juan — Masoquista: gosta da dor; cada golpe recebido devolve sanidade
  masochist: {
    onHitTaken({ victim, dealt, passive }) {
      if (dealt > 0) victim.energy = Math.min(victim.maxEnergy, victim.energy + dealt * (passive.ratio ?? 0.12));
    },
  },
  // Juan — Sangue que Endurece (cânone: "após sangrar o suficiente, seu sangue começa a formar uma armadura"): o dano
  // recebido acumula; ao passar do limite, a Armadura de Sangue Diabólica nasce sozinha (o Fighter ativa: autoArmor)
  bloodHardens: {
    onHitTaken({ victim, dealt, passive }) {
      if (!(dealt > 0) || victim.findBuff('heavyProtection')) return;
      victim.bloodLost = (victim.bloodLost || 0) + dealt;
      if (victim.bloodLost >= (passive.threshold ?? 220)) {
        victim.bloodLost = 0;
        victim.autoArmor = passive.ability;
      }
    },
  },
  // Lírio — Sangue de Ferro: mais vitalidade (a vida extra está em stats.maxHealth; aqui só identifica a passiva)
  ironBlood: {},
  // Lírio — Casca Grossa: aguenta melhor os impactos — é empurrado menos (lançamentos ainda lançam) e, defendendo,
  // a defesa gasta menos e passa menos dano
  thickSkin: {
    knockbackTakenMod({ passive, o }) {
      return o.launch ? 1 : passive.knockback ?? 0.65;
    },
    blockChipMod({ passive }) {
      return passive.chip ?? 0.6;
    },
    guardDamageMod({ passive }) {
      return passive.guard ?? 0.7;
    },
  },
  // Lírio — Mão Pesada: golpes físicos empurram mais e deixam o alvo atordoado um pouco mais (não mexe no dano)
  heavyHand: {
    knockbackMod({ kind, passive }) {
      return kind === 'melee' ? passive.knockback ?? 1.3 : 1;
    },
    hitstunBonus({ kind, passive }) {
      return kind === 'melee' ? passive.hitstun ?? 0.06 : 0;
    },
  },
  // Kaiser — Afinidade Elemental: conectado à Energia, os rituais dele (habilidades e especial) batem mais forte
  elementalAffinity: {
    damageMod({ kind, passive }) {
      return kind === 'ability' || kind === 'special' ? passive.mult ?? 1.15 : 1;
    },
  },
  // Labirinto — Mente Labiríntica: atordoamentos duram menos (lido em Fighter.stun)
  mentalMaze: {},
  // Erin (Em Nome do Caos) — Sem Sanidade: barra zerada e travada; os custos saem da vida (Fighter.addEnergy/spendEnergy)
  noSanity: {},
  // O Anfitrião — Percepção Anacrônica: sabe o que ainda vai acontecer; de tempos em tempos desvia sozinho de um golpe
  // (cooldown em passive.cooldown; lido em damage.applyHit → Fighter.trySubstitution({ free }))
  chronoSense: {},
  // Senhor Veríssimo — Segredo de Veríssimo: sabe como vai morrer; uma vez por partida um golpe fatal o deixa com 1 de
  // vida (contra o Kian, uma vez por round; lido em Fighter.takeDamage)
  verissimoSecret: {},
  // Kemi — Sede de Vingança (o poder de intenção da Lena no corpo dela): ao cair abaixo de passive.below de vida pela
  // primeira vez no round, revida com tudo — mais dano e velocidade por um tempo e sanidade de volta
  revenge: {
    onHitTaken({ victim, dealt, passive, world }) {
      if (!(dealt > 0) || victim.state === 'ko' || victim.health <= 0 || victim.revengeUsed) return;
      if (victim.health / victim.maxHealth > (passive.below ?? 0.3)) return;
      victim.revengeUsed = true;
      const d = passive.duration ?? 8;
      victim.addBuff({ type: 'revenge', name: 'SEDE DE VINGANÇA', time: d, duration: d, mult: passive.mult ?? 1.3, affects: ['melee', 'ranged', 'ability'], speedMult: passive.speedMult ?? 1.1 });
      victim.energy = Math.min(victim.maxEnergy, victim.energy + (passive.energy ?? 35));
      victim.notify('SEDE DE VINGANÇA', true);
      world.fx.burst(victim.chestPos(), { count: 26, color: 0xe8c070, speed: 4, life: 0.5, size: 0.18 });
      world.fx.ring(victim.pos.clone().setY(0.06), { color: 0xe8c070, radius: 2, life: 0.5 });
    },
  },
  // Xande — Gladiador Paranormal: cada golpe físico que acerta devolve um pouco de sanidade
  paranormalGladiator: {
    onMeleeHit({ attacker, passive }) {
      attacker.addEnergy && attacker.addEnergy(passive.energy ?? 2);
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
