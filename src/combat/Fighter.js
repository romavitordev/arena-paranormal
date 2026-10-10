import * as THREE from 'three';
import { tAlert } from '../i18n/index.js';
import { COMBAT } from '../config/combat.js';
import { buildModel } from '../models/index.js';
import { Animator } from '../anim/Animator.js';
import { clamp, yawTo, turnTowards, forwardFromYaw, distXZ, angleDiff, DEG } from '../core/util.js';
import { applyHit } from './damage.js';
import { findSubstitutionSpot, resolveBody } from './positioning.js';
import { startChargeFx } from './chargeFx.js';
import { ABILITY_TYPES } from './abilities.js';
import './hostAbilities.js'; // registra as habilidades do Anfitrião em ABILITY_TYPES
import './guizoAbilities.js'; // e as do Guizo (Embaralhar, Decadência, Espirais da Perdição...)
import { SPECIALS } from './specials/index.js';
import { telegraphFor, startTelegraph, updateTelegraph, stopTelegraph, telegraphMissed, TELEGRAPH } from './specials/telegraph.js';
import { hasPassive } from './passives.js';
import { ELEMENTS } from '../config/elements.js';
import { updateForm, revertForm } from './forms.js';
import { buildBloodArmor } from '../models/bloodArmor.js';
import { orbit, twoShot } from '../camera/shots.js';
import { splitDamage, specialHitFx } from './specials/common.js';
import { GRAB_SCENES, FINISHERS } from './grabScenes.js';
import { rollChaosShot, tickHostQuirks } from './chaos.js';

// estados em que o alvo continua "dentro do combo" (contadores de escala não zeram)
const COMBO_STATES = new Set(['hitstun', 'stun', 'pulled', 'grabbed', 'ko', 'downed']);
// comandos que o buffer guarda
const BUFFER_ACTIONS = ['physical', 'ranged', 'carga', 'dodge'];

const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();

// Botão + modificador (R1/RB) → chave usada em `abilities[].input`

/**
 * Lutador genérico. NÃO existe código específico de personagem aqui:
 * tudo vem da definição (src/characters/*.js).
 *
 * Estados: idle | charging | attack | ranged | ability | special | block | dodge |
 *          hitstun | stun | pulled | grabbed | ko | intro
 */
export class Fighter {
  constructor(def, index, world, input) {
    this.def = def;
    this.index = index;
    this.world = world;
    this.input = input;

    this.rig = buildModel(def.model);
    this.anim = new Animator(this.rig, def.anims);
    world.scene.add(this.rig.root);

    const s = def.stats || {};
    this.maxHealth = s.maxHealth ?? COMBAT.maxHealth;
    this.maxEnergy = s.maxEnergy ?? COMBAT.maxEnergy;
    this.moveSpeed = s.moveSpeed ?? COMBAT.moveSpeed;
    this.size = s.size ?? 1; // formas gigantes (Deus da Morte = 2): raio, peito e área de acerto acompanham
    this.radius = COMBAT.bodyRadius * this.size;
    this.dodgeCfg = { ...COMBAT.dodge, ...(def.dodge || {}) };
    this.maxGuard = COMBAT.block.maxGuard;

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.onGround = true;
    this.lockOn = true;
    this.visible = true;

    // cooldowns: nome → segundos restantes; cooldownMax para a HUD
    this.cooldowns = { ranged: 0, special: 0, dodge: 0, dash: 0, grab: 0, substitution: 0, switch: 0 };
    this.cooldownMax = {
      ranged: def.ranged?.cooldown || 1,
      special: def.special?.cooldown ?? COMBAT.specialCooldown,
      dodge: this.dodgeCfg.cooldown,
    };
    for (const a of def.abilities || []) {
      this.cooldowns[a.id] = 0;
      this.cooldownMax[a.id] = a.cooldown;
    }
    this.buffs = [];
    this.specialUses = 0; // por PARTIDA (não volta no round seguinte)
    this.specialBonusUses = 0; // usos extras do especial ganhos na partida
    this.reset();
  }

  reset() {
    if (this.riding) this.mount(false);
    if (this.baseForm) revertForm(this, { keepHealth: false });
    this.lethalHook = null;
    this.revengeUsed = false; // Sede de Vingança (Kemi): uma vez por round
    this.storm = 0; // Barra de Transformação (0–100), zera a cada round
    this.overcharge = 0; // segurando △ com a sanidade cheia (0–1) → transforma
    this.health = this.maxHealth;
    this.energy = COMBAT.startEnergy;
    this.guard = this.maxGuard;
    this.guardIdle = 0;
    this.guardMoving = false;
    this.dodges = COMBAT.dodge.charges;
    this.dodgeDmgAcc = 0;
    this.dodgeLockout = 0;
    this.sacrificeWin = false;
    this.chronoCd = 0; // Percepção Anacrônica (Anfitrião): recarga da esquiva automática
    this.secretRound = false; // Segredo de Veríssimo contra o Kian: uma vez por round
    for (const k in this.cooldowns) this.cooldowns[k] = 0;
    this.carga = { stage: 0, timer: 0 };
    this.combo = { chain: -1, steps: 0, grace: 0, queued: null, strike: null, hits: [], windows: [] };
    this.endBuffs();
    this.stopCharging();
    this.stopStrikeFx();
    this.seq = null;
    this.state = 'idle';
    this.stateTime = 0;
    this.vel.set(0, 0, 0);
    this.onGround = true;
    this.invuln = 0;
    this.surprised = 0;
    this.rig.body.position.y = 0;
    this.setVisible(true);
    this.setOpacity(1);
    this.hideRangedProps();
    this.anim.play('idle', { restart: true, blend: 0 });
    this.flash = 0;
    this.message = null;
    this.glowTint = null;
    this.buffTint = null;
    this.comboHits = 0;
    this.comboLaunches = 0;
    this.comboDamage = 0;
    this.comboDashes = 0;
    this.buffered = null;
    this.launched = false;
    this.armorHits = 0;
    this.dash = null;
    this.lastJumpPress = undefined;
    this.dirPressed = false;
    this.prevMoveMag = 0;
    this.downed = null;
    this.juggleT = 0;
    this.airCombo = null;
  }

  get opponent() {
    return this.world.opponentOf(this);
  }

  // ---------------------------------------------------------------- consultas
  chestPos(out = new THREE.Vector3()) {
    return out.set(this.pos.x, this.pos.y + 1.15 * (this.size || 1), this.pos.z);
  }

  hitTestPoint(p, r = 0) {
    const dy = p.y - this.pos.y;
    if (dy < -0.2 - r || dy > COMBAT.bodyHeight * (this.size || 1) + r) return false;
    return Math.hypot(p.x - this.pos.x, p.z - this.pos.z) <= this.radius + r;
  }

  isInvulnerable() {
    return this.state === 'special' || this.state === 'ko' || this.state === 'intro' || this.state === 'downed' || !this.visible || this.invuln > 0;
  }

  damageMultiplier(kind) {
    let m = 1;
    for (const b of this.buffs) if (b.mult && b.affects && b.affects.includes(kind) && (!b.when || b.when())) m *= b.mult;
    return m;
  }

  buffMultiplierActive(kind) {
    return this.damageMultiplier(kind) > 1;
  }

  // Provocado (Cai Dentro) ou cego de ódio (Ódio do Diabo): só corpo a corpo — avisa e retorna true
  meleeLocked() {
    const b = this.buffs.find((x) => x.type === 'provoked' || x.meleeOnly);
    if (b) this.notify(b.lockMsg || 'PROVOCADO: SÓ NO CORPO A CORPO');
    return !!b;
  }

  findBuff(type) {
    return this.buffs.find((b) => b.type === type);
  }

  canAct() {
    return this.state === 'idle' || this.state === 'charging';
  }

  specialCost() {
    return this.def.special?.energyCost ?? COMBAT.specialEnergyCost;
  }

  specialUsedUp() {
    const lim = this.def.special && this.def.special.usesPerMatch;
    return !!lim && this.specialUses >= lim + this.specialBonusUses;
  }

  specialAvailable() {
    const sp = this.def.special;
    if (sp && sp.minEnergy && this.energy < sp.minEnergy * this.maxEnergy) return false;
    return !!this.def.special && !this.specialUsedUp() && this.cooldowns.special <= 0 && this.energy >= this.specialCost();
  }

  // Esquiva com bônus de buffs (ex.: névoa da Kaiser)
  dodgeParams() {
    const d = { ...this.dodgeCfg };
    for (const b of this.buffs) {
      if (b.dodge && (!b.when || b.when())) {
        d.iframes *= b.dodge.iframesMult ?? 1;
        d.cooldown *= b.dodge.cooldownMult ?? 1;
        d.distance *= b.dodge.distanceMult ?? 1;
      }
    }
    return d;
  }

  // ---------------------------------------------------------------- vida / energia
  takeDamage(n) {
    // treino: ninguém morre (fica com 1 de vida)
    const cap = this.immortal ? Math.max(0, this.health - 1) : this.health;
    const dealt = Math.min(cap, Math.max(0, n));
    this.health -= dealt;
    this.dmgTaken = (this.dmgTaken || 0) + dealt; // total da partida (a IA que aprende mede o resultado das ações por ele)
    // Barra de Transformação: enche com o dano recebido (só na forma base de quem transforma)
    if (this.def.awakening && !this.baseForm) this.storm = Math.min(100, this.storm + (dealt / this.maxHealth) * 100 * COMBAT.storm.fillPerHealth);
    // a barra de esquivas recupera conforme toma dano
    // (zerou as esquivas há pouco: o dano não conta até passar COMBAT.dodge.emptyLockout)
    if (this.dodgeLockout <= 0) this.dodgeDmgAcc += dealt;
    while (this.dodgeDmgAcc >= COMBAT.dodge.damagePerCharge) {
      this.dodgeDmgAcc -= COMBAT.dodge.damagePerCharge;
      if (this.dodges < COMBAT.dodge.charges) this.dodges++;
    }
    this.flash = 0.12;
    // SEGREDO DE VERÍSSIMO: ele sabe como vai morrer — uma vez por partida, o golpe que o mataria o deixa com 1 de vida
    // (contra o Kian, que não pode matá-lo, vale uma vez por round)
    if (this.health <= 0 && !this.sacrificeWin && hasPassive(this, 'verissimoSecret')) {
      const vsKian = this.opponent && (this.opponent.def.baseId || this.opponent.def.id) === 'kian';
      if (vsKian ? !this.secretRound : !this.secretUsed) {
        if (vsKian) this.secretRound = true;
        else this.secretUsed = true;
        this.health = 1;
        this.invuln = Math.max(this.invuln, 1.0);
        this.notify('SEGREDO DE VERÍSSIMO', true);
        this.world.fx.burst(this.chestPos(), { count: 30, color: 0x6ab0e0, speed: 4, life: 0.6, size: 0.22 });
        this.world.audio.play('perfectBlock', { volume: 0.8, pitch: 0.8 });
        return dealt;
      }
    }
    if (this.health <= 0 && this.lethalHook) {
      const hook = this.lethalHook;
      this.lethalHook = null;
      if (hook(this)) return dealt;
    }
    if (this.health <= 0) this.knockOut();
    return dealt;
  }

  heal(n) {
    this.health = Math.min(this.maxHealth, this.health + n);
    this.world.fx.burst(this.chestPos(), { count: 8, color: 0x7dffb0, speed: 2, life: 0.6, size: 0.25, up: 1 });
  }

  drainEnergy(n) {
    const removed = Math.min(this.energy, n);
    this.energy -= removed;
    return removed;
  }

  addEnergy(n) {
    // SEM SANIDADE (Erin, Em Nome do Caos): a barra fica zerada e travada
    if (hasPassive(this, 'noSanity')) { this.energy = 0; return; }
    this.energy = clamp(this.energy + n, 0, this.maxEnergy);
  }

  spendEnergy(n) {
    // sem sanidade, tudo que gastaria sanidade sai da vida (bloodPrice)
    if (n > 0 && hasPassive(this, 'noSanity')) {
      const P = (this.def.passives || []).find((p) => p.type === 'bloodPrice');
      const hp = Math.ceil(n * (P?.hpPerPoint ?? 1));
      if (this.health - hp < this.maxHealth * (P?.minHealth ?? 0.05)) { this.notify('SEM VIDA PARA PAGAR'); return false; }
      this.health -= hp;
      return true;
    }
    if (this.energy < n) return false;
    this.energy -= n;
    return true;
  }

  // ---------------------------------------------------------------- estados
  setState(s) {
    if (this.state === 'dodge' && s !== 'dodge') this.settleDodge();
    if (s !== 'idle' && this.anim) this.anim.twist = 0; // giro das pernas só existe andando
    if (this.state === 'downed' && s !== 'downed') this.otgTaken = false;
    if (s !== 'attack' && s !== 'ability') this.superArmor = null;
    // preparo do especial interrompido por qualquer outro estado (golpe, projétil, agarrão...)
    if (this.state === 'specialStart' && s !== 'special' && s !== 'specialStart') this.interruptSpecial();
    // montaria (skate): só continua andando/pulando ou no dash; qualquer outra ação desce
    if (this.riding && s !== 'idle' && s !== 'dashing') this.mount(false);
    if (!COMBO_STATES.has(s)) { this.comboHits = 0; this.comboLaunches = 0; this.comboDamage = 0; this.comboDashes = 0; }
    if (this.state === 'charging' && s !== 'charging') this.stopCharging();
    if (this.state === 'attack' && s !== 'attack') this.stopStrikeFx();
    this.state = s;
    this.stateTime = 0;
  }

  setVisible(v) {
    this.visible = v;
    this.rig.root.visible = v;
  }

  // Perdeu o rastro do adversário (Jae no "Shhh..." ou este lutador SURDO pela Zona das Sombras): a mira não acompanha
  // ele sozinha — quem joga tem que achá-la de olho
  lostTrack(opp) {
    if (!opp || !opp.findBuff) return false;
    return (!!opp.findBuff('veil') && distXZ(this.pos, opp.pos) > 1.6) || !!this.findBuff('deaf');
  }

  // Translucidez (névoa da Kaiser, Inexistir do Kian)
  setOpacity(a) {
    if (this._opacity === a) return;
    this._opacity = a;
    this.rig.root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      if (o.userData.isOutline) { o.visible = a > 0.95; return; }
      const m = o.material;
      if (m.userData.baseTransparent === undefined) {
        m.userData.baseTransparent = m.transparent;
        m.userData.baseOpacity = m.opacity;
      }
      m.transparent = a < 1 || m.userData.baseTransparent;
      m.opacity = m.userData.baseOpacity * a;
    });
  }

  notify(text, silent = false) {
    this.message = { text: tAlert(text), time: 1.0 };
    if (!silent) this.world.audio.play('denied');
  }

  react({ dir, knockback, hitstun, launch, lowLaunch, high, spike, stun }) {
    if (this.state === 'ko') {
      this.vel.x = dir.x * knockback;
      this.vel.z = dir.z * knockback;
      return;
    }
    this.cancelAction();
    this.carga.stage = 0;
    this.vel.x = dir.x * knockback;
    this.vel.z = dir.z * knockback;
    this.yaw = yawTo(this.pos, v1.copy(this.pos).sub(dir));
    if (stun) {
      this.stun(stun, 'stagger');
      return;
    }
    this.setState('hitstun');
    this.hitstun = hitstun;
    // golpes aéreos de malabarismo não tiram a marca de "lançado" (ao cair, fica caído)
    this.launched = launch || (this.launched && !this.onGround);
    if (launch) {
      this.vel.y = spike ? -16 : high ? COMBAT.airCombo.chase : lowLaunch ? 3.5 : 6.5;
      this.onGround = this.pos.y <= 0 && spike;
      this.anim.play('launched', { restart: true, blend: 0.04 });
    } else {
      this.anim.play('hit', { restart: true, blend: 0.03 });
    }
  }

  // Atordoamento genérico (quebra de defesa, medo, contra-ataque recebido)
  stun(time, anim = 'stagger') {
    if (this.state === 'ko') return;
    // Mente Labiríntica (Labirinto): a mente se protege — atordoamentos duram menos
    const mm = (this.def.passives || []).find((p) => p.type === 'mentalMaze');
    if (mm) time *= mm.stunMult ?? 0.6;
    this.cancelAction();
    this.carga.stage = 0;
    this.setState('stun');
    this.stunTime = time;
    this.whiffRecovery = false;
    this.anim.play(anim, { restart: true, blend: 0.05 });
  }

  // Puxado (corrente do Injustiça): vai até `target` e fica vulnerável
  pullTo(target, { time = 0.28, after = 0.55 } = {}) {
    if (this.state === 'ko') return;
    this.cancelAction();
    this.carga.stage = 0;
    this.setState('pulled');
    this.pull = { from: this.pos.clone(), to: target.clone(), time, after };
    this.vel.set(0, 0, 0);
    this.anim.play('launched', { restart: true, duration: time + 0.1 });
  }

  knockOut() {
    this.cancelAction();
    this.setState('ko');
    this.anim.play('ko', { restart: true });
    this.world.audio.play('ko');
    this.world.onKO && this.world.onKO(this);
  }

  cancelAction() {
    this.stopCharging();
    this.stopStrikeFx();
    this.hideRangedProps();
    if (this.seq && this.seq.cancel) this.seq.cancel();
    this.seq = null;
    if (!this.visible) this.setVisible(true);
  }

  hideRangedProps() {
    const r = this.def.ranged;
    if (!r) return;
    if (r.showProp) this.rig.showProp(r.showProp, false);
    // a arma arremessada que volta (returnsProp, ex.: machado do Balu) só reaparece quando chega de volta na mão
    const flying = r.returnsProp && this.world && this.world.projectiles && this.world.projectiles.list.some((p) => p.owner === this && p.ability.returnsProp === r.returnsProp);
    const locked = this.propLock && this.propLock[r.hideProp]; // ex.: a maça do Machado Demônio está no lugar do machado
    if (r.hideProp && !flying && !locked) this.rig.showProp(r.hideProp, true);
  }

  startCharging() {
    this.chargeMoving = false;
    if (this.state !== 'charging') {
      this.setState('charging');
      this.chargeFx = startChargeFx(this, this.world);
      this.world.audio.startLoop('charge' + this.index, 'chargeHum', 1 + this.index * 0.08);
    }
    this.anim.play('charge');
  }

  stopCharging() {
    if (this.chargeFx) {
      this.chargeFx.stop();
      this.chargeFx = null;
    }
    this.world.audio.stopLoop('charge' + this.index);
  }

  addBuff(b) {
    this.buffs.push(b);
  }

  // Sangramento: dano contínuo por alguns segundos (renova a cada acerto)
  applyBleed(bleed0, source) {
    const neck = source && source.def && (source.def.passives || []).find((p) => p.type === 'bloodNecklace');
    const bleed = neck ? { ...bleed0, dps: bleed0.dps * (neck.bleedMult ?? 1.15) } : bleed0;
    const cur = this.findBuff('bleed');
    if (cur) {
      cur.time = bleed.duration;
      return;
    }
    let acc = 0;
    const self = this;
    this.addBuff({
      type: 'bleed',
      time: bleed.duration,
      onTick(dt) {
        if (self.state === 'ko') return;
        acc += bleed.dps * dt;
        if (acc >= 1) {
          const n = Math.floor(acc);
          acc -= n;
          self.takeDamage(n);
          self.flash = 0;
          if (Math.random() < 0.5) self.world.fx.play('FX_BLOOD', self.chestPos(), { color: bleed.color ?? 0x9a0010 });
          self.world.onHit && self.world.onHit(source, self, n, { kind: 'bleed' });
        }
      },
    });
  }

  // Batalha em equipe (estilo Storm 4): o personagem da assistência entra em campo e o atual vira a
  // assistência daquele lado. Vida, sanidade e esquivas são da equipe e continuam iguais.
  trySwitch(slot) {
    const as = this.assists && this.assists[slot];
    if (!as) return false;
    const S = COMBAT.switch;
    if (this.cooldowns.switch > 0) { this.notify('TROCA RECARREGANDO'); return false; }
    if (as.active) { this.notify('ASSISTÊNCIA EM CAMPO'); return false; }
    if (this.baseForm) { this.notify('TRANSFORMADO: NÃO PODE TROCAR'); return false; }
    if (!['idle', 'charging', 'block', 'dashing'].includes(this.state) || !this.onGround || this.world.cinematic) return false;
    const w = this.world;
    const newDef = as.def;
    const newRig = as.rig;
    const oldDef = this.def;
    const oldRig = this.rig;
    // fumaça de troca onde estava o antigo
    w.fx.burst(this.chestPos(), { count: 30, color: 0x2a2632, kind: 'smoke', speed: 2.5, life: 0.6, size: 0.8, grow: 1 });
    w.scene.remove(oldRig.root);
    if (newRig.root.parent) newRig.root.parent.remove(newRig.root);
    as.takeOver(oldDef, oldRig);
    as.cooldown = Math.max(as.cooldown, S.assistCooldown);
    this.applyDef(newDef, newRig);
    this.cooldowns.switch = S.cooldown;
    this.cooldownMax.switch = S.cooldown;
    this.invuln = Math.max(this.invuln, S.invuln);
    w.fx.play('FX_TELEPORT', this.chestPos(), { color: newDef.energyColor ?? 0xffffff, kind: 'ring' });
    w.audio.play('teleport');
    this.notify(`TROCA: ${newDef.name}!`, true);
    w.onSwitch && w.onSwitch(this, oldDef, newDef);
    return true;
  }

  // troca a definição (personagem) deste lutador mantendo vida, sanidade, posição e placar
  applyDef(def, rig) {
    this.mount(false);
    this.mountHolder = null;
    this.gripHome = null;
    this.gripSlot = null;
    if (this.anim) this.anim.poseFilter = null;
    this.stopCharging();
    this.stopStrikeFx();
    this.endBuffs();
    this.seq = null;
    this.def = def;
    this.rig = rig;
    this.anim = new Animator(rig, def.anims);
    this.world.scene.add(rig.root);
    rig.root.visible = true;
    rig.root.position.copy(this.pos);
    rig.root.rotation.y = this.yaw;
    rig.body.position.y = 0;
    const s = def.stats || {};
    this.moveSpeed = s.moveSpeed ?? COMBAT.moveSpeed;
    this.size = s.size ?? 1;
    this.radius = COMBAT.bodyRadius * this.size;
    this.dodgeCfg = { ...COMBAT.dodge, ...(def.dodge || {}) };
    this.cooldownMax.ranged = def.ranged?.cooldown || 1;
    this.cooldownMax.special = def.special?.cooldown ?? COMBAT.specialCooldown;
    // ao trocar de forma, a recarga do especial anterior não prende o especial novo (antes: Vestir as Faixas, 60 s,
    // travava o Disparo Espiral da Fantasma pelo mesmo tempo)
    if (this.cooldowns.special > this.cooldownMax.special) this.cooldowns.special = this.cooldownMax.special;
    this.cooldownMax.dodge = this.dodgeCfg.cooldown;
    for (const a of def.abilities || []) {
      if (this.cooldowns[a.id] === undefined) this.cooldowns[a.id] = 0;
      this.cooldownMax[a.id] = a.cooldown;
    }
    this.combo = { chain: -1, steps: 0, grace: 0, queued: null, strike: null, hits: [], windows: [] };
    this.carga = { stage: 0, timer: 0 };
    this.glowTint = null;
    this.buffTint = null;
    this.armorHits = 0;
    this.dash = null;
    this.setVisible(true);
    this.setOpacity(1);
    this.hideRangedProps();
    this.anim.play('idle', { restart: true, blend: 0 });
    this.setState('idle');
  }

  endBuffs() {
    for (const b of this.buffs || []) b.onEnd && b.onEnd();
    this.buffs = [];
  }

  // ---------------------------------------------------------------- loop
  // guarda apertos feitos enquanto o mundo está congelado (hitstop) para o próximo quadro
  captureInputs() {
    const p = this.input.pressed;
    for (const k in p) if (p[k]) (this.pendingPress || (this.pendingPress = {}))[k] = true;
    // a direção do analógico no momento do aperto também vale (↑/↓ no combo)
    if (p.physical) this.pendingVert = this.stickVert();
  }

  update(dt) {
    if (this.pendingPress) {
      for (const k in this.pendingPress) this.input.pressed[k] = true;
      this.pendingPress = null;
      this.capturedVert = this.pendingVert;
      this.pendingVert = null;
    } else {
      this.capturedVert = null;
    }
    this.stateTime += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.dodgeLockout > 0) this.dodgeLockout -= dt;
    if (this.chronoCd > 0) this.chronoCd -= dt;
    if (this.gestureT > 0) this.gestureT -= dt; // gesto parado (ex.: o Anfitrião inclinando a cabeça) não é trocado pelo idle
    if (this.def.quirks) tickHostQuirks(this, dt);
    if (this.overcharge > 0 && this.state !== 'charging') this.overcharge = Math.max(0, this.overcharge - dt * COMBAT.storm.decay);
    updateForm(this, dt);
    if (this.message) {
      this.message.time -= dt;
      if (this.message.time <= 0) this.message = null;
    }

    // cooldowns individuais (cdRate: estados que aceleram as recargas, ex.: Despertar)
    let cdRate = 1;
    for (const b of this.buffs) if (b.cdRate) cdRate *= b.cdRate;
    for (const k in this.cooldowns) {
      if (this.cooldowns[k] > 0) {
        this.cooldowns[k] -= dt * (k === 'dodge' ? 1 : cdRate);
        if (this.cooldowns[k] <= 0) {
          this.cooldowns[k] = 0;
          if (k === 'ranged' || k === 'special') this.world.audio.play(k === 'ranged' && this.def.ranged?.visual === 'bullet' ? 'reload' : 'ready', { volume: 0.6 });
        }
      }
    }
    // buffs (ex.: névoa, Rebirth)
    for (let i = this.buffs.length - 1; i >= 0; i--) {
      const b = this.buffs[i];
      b.time -= dt;
      b.onTick && b.onTick(dt);
      if (b.time <= 0 || b.done) {
        b.onEnd && b.onEnd();
        this.buffs.splice(i, 1);
      }
    }
    // energia
    if (hasPassive(this, 'noSanity')) this.energy = 0; // Em Nome do Caos: nada repõe a sanidade
    if (this.state !== 'ko' && this.state !== 'special' && !this.buffs.some((b) => b.noRegen)) {
      let enMult = 1;
      for (const b of this.buffs) if (b.energyRegenMult) enMult *= b.energyRegenMult;
      this.addEnergy(COMBAT.energyRegen * dt * this.world.energyRegenFactor(this) * enMult);
    }
    // resistência da defesa
    if (this.state !== 'block') {
      this.guardIdle += dt;
      if (this.guardIdle > COMBAT.block.guardRegenDelay) this.guard = Math.min(this.maxGuard, this.guard + COMBAT.block.guardRegen * dt);
    }
    // janela da sequência CARGA → CARGA → FÍSICO
    if (this.carga.stage > 0) {
      this.carga.timer -= dt;
      if (this.carga.timer <= 0) this.carga.stage = 0;
    }
    if (this.combo.grace > 0) {
      this.combo.grace -= dt;
      if (this.combo.grace <= 0) { this.combo.chain = -1; this.combo.steps = 0; }
    }
    // direção "apertada" agora (borda) — usada por Defesa + direção = esquiva
    const mag = Math.hypot(this.input.moveX, this.input.moveY);
    this.dirPressed = mag > 0.5 && (this.prevMoveMag ?? 0) <= 0.5;
    this.prevMoveMag = mag;

    const hostButtonGame = this.world.hostButtonGame;
    if (hostButtonGame) hostButtonGame.captureInput(this);
    this.bufferInputs();

    // batalha em equipe: chamar assistência 1/2 (D-pad ◀/▶) ou TROCAR de personagem (analógico direito ◀/▶)
    if (this.assists && !this.world.cinematic) {
      if (this.input.pressed.assist1 && this.assists[0]) this.assists[0].call();
      if (this.input.pressed.assist2 && this.assists[1]) this.assists[1].call();
      if (this.input.pressed.switch1) this.trySwitch(0);
      if (this.input.pressed.switch2) this.trySwitch(1);
    }

    switch (this.state) {
      case 'idle': this.updateIdle(dt); break;
      case 'charging': this.updateCharging(dt); break;
      case 'attack': this.updateAttack(dt); break;
      case 'block': this.updateBlock(dt); break;
      case 'dodge': this.updateDodge(dt); break;
      case 'dashing': this.updateDash(dt); break;
      case 'specialStart': this.updateSpecialStart(dt); break;
      case 'ranged':
      case 'ability':
      case 'special':
        if (this.seq) {
          // guarda a sequência ANTES de atualizar: ela pode trocar/zerar this.seq por dentro (ex.: o Renascimento do
          // Juan troca a forma no meio — antes isso dava erro aqui e travava o jogo inteiro)
          const cur = this.seq;
          const done = cur.update(dt);
          if (done && this.seq && this.seq !== cur) {
            // a sequência terminou trocando por outra (nova ação já começou): deixa a nova seguir
          } else if (done) {
            this.seq = null;
            if (this.state !== 'ko' && this.state !== 'hitstun' && this.state !== 'stun' && this.state !== 'pulled') {
              this.setState('idle');
              if (cur.onDone) cur.onDone(); // ex.: Pulso Paranormal → estocada pronta quando o alvo chega
            }
          } else if (this.seq && this.state === 'ability' && this.seq.cancelable && this.seq.cancelable()) {
            // habilidades de movimento (teleportes) emendam direto em ataques
            const s = this.seq;
            const inp = this.input;
            if (inp.pressed.physical || inp.pressed.ranged || this.wantsDodge() || this.comboPressed()) {
              s.finish && s.finish();
              this.seq = null;
              this.setState('idle');
              this.handleCommands();
            }
          }
        }
        break;
      case 'hitstun': this.updateHitstun(dt); break;
      case 'downed': this.updateDowned(dt); break;
      case 'stun':
        this.vel.x *= 0.85;
        this.vel.z *= 0.85;
        // atordoado também dá para sair com a Substituição (L2)
        if (!this.whiffRecovery && this.input.pressed.dodge && this.trySubstitution()) break;
        if (this.stateTime >= this.stunTime) this.setState('idle');
        break;
      case 'pulled': this.updatePulled(dt); break;
      case 'grabbed':
        // segurança: nunca fica preso no agarrão (quem segura solta em ~0,5 s)
        if (this.stateTime > 1.2) this.setState('idle');
        break;
      default: break;
    }

    this.integrate(dt);
    this.updateVisuals(dt);
  }

  // sangue pingando das mãos/garras (def.drips — Amaldiçoar Arma do Diabo)
  updateDrips(dt) {
    const D = this.def.drips;
    if (!D || !this.visible || this.state === 'ko') return;
    this.dripT = (this.dripT ?? 0) - dt;
    if (this.dripT > 0) return;
    this.dripT = D.every ?? 0.1;
    const s = this.rig.sockets && this.rig.sockets[D.sockets[(this.dripI = ((this.dripI || 0) + 1) % D.sockets.length)]];
    if (!s) return;
    this.world.fx.burst(s.getWorldPosition(v1), { count: 1, color: D.color ?? 0xa01018, speed: 0.2, up: -0.5, life: 0.5, size: 0.07, gravity: 9 });
  }

  // ARMADURA DE SANGUE (Juan e a assistência dele): carne de sangue porosa crescendo no lado esquerdo do corpo
  // enquanto durar. Quem conjura (b.bloodArmSide) também tem o braço da faca virando arma de sangue.
  updateBloodShell(dt) {
    // Sangue que Endurece (Juan): sangrou o bastante → a armadura nasce sozinha, de graça
    if (this.autoArmor) {
      const a = (this.def.abilities || []).find((x) => x.id === this.autoArmor);
      this.autoArmor = null;
      if (a && this.state !== 'ko' && !this.findBuff('heavyProtection')) {
        this.armorHits = (this.armorHits || 0) + (a.armor || 0);
        const self = this;
        this.addBuff({
          // versão "de graça" (nasceu do sangue): dura menos que a conjurada (autoDuration)
          type: 'heavyProtection', name: (a.label || a.name).toUpperCase(), time: a.duration * (a.autoDuration ?? 0.6), duration: a.duration * (a.autoDuration ?? 0.6), takenMult: a.takenMult, speedMult: a.speedMult,
          bloodArmor: true, ...(a.bloodArm ? { bloodArmSide: a.bloodArm.side, mult: a.bloodArm.meleeMult, affects: ['melee'] } : {}),
          onEnd() { self.armorHits = Math.max(0, (self.armorHits || 0) - (a.armor || 0)); },
        });
        this.cooldowns[a.id] = Math.max(this.cooldowns[a.id] || 0, a.cooldown); // e gasta a recarga inteira da habilidade
        this.notify('O SANGUE ENDURECEU', true);
        this.world.audio.play('blockHit', { volume: 0.8, pitch: 0.6 });
      }
    }
    const on = this.state !== 'ko' && this.visible ? this.buffs.find((b) => b.type === 'bloodArmor' || b.bloodArmor) : null;
    const side = on ? this.buffs.find((b) => b.bloodArmSide)?.bloodArmSide || null : null;
    const key = on ? `on:${side}` : null;
    if (this.bloodArmor && (this.bloodArmor.key !== key || this.bloodArmor.rig !== this.rig)) {
      this.bloodArmor.fx.remove();
      this.bloodArmor = null;
    }
    if (key && !this.bloodArmor) {
      const fx = buildBloodArmor(this.rig, { weaponSide: side, yaw: this.yaw });
      if (fx) {
        this.bloodArmor = { fx, key, rig: this.rig };
        this.world.fx.burst(this.chestPos(), { count: 30, color: 0xb01020, speed: 3, life: 0.5, size: 0.18, gravity: 6 });
      }
    }
    if (this.bloodArmor) this.bloodArmor.fx.update(dt);
  }

  // Só animação/transformação (usado durante cinematics, quando o mundo para)
  updatePresentation(dt) {
    this.updateVisuals(dt);
  }

  updateVisuals(dt) {
    this.updateGrip();
    this.updateBloodShell(dt);
    this.updateDrips(dt);
    // posiciona o modelo ANTES de animar: o ajuste de pés/chão do rig usa a posição deste quadro
    this.rig.root.position.copy(this.pos);
    this.rig.root.rotation.y = this.yaw;
    // pés presos ao chão só com o lutador apoiado (no ar, sendo lançado ou caído, a pose manda)
    this.rig.groundLock = this.onGround && !['launched', 'ko', 'downed', 'grabbed', 'pulled', 'special'].includes(this.state);
    this.anim.update(dt);
    this.glowClock = (this.glowClock || 0) + dt;
    if (this.flash > 0) {
      this.flash -= dt;
      this.rig.setTint(0xffffff, Math.max(0, this.flash / 0.12) * 0.8);
    } else if (this.glowTint || this.buffTint) {
      const g = this.glowTint || this.buffTint;
      this.rig.setTint(g.color, g.base + Math.sin(this.glowClock * 10) * 0.06);
    } else {
      this.rig.setTint(0x000000, 0);
    }
    // máscara (Joui): no rosto na luta, puxada para o lado nas cinematics e na vitória
    if (this.rig.props.maskOn && this.rig.props.maskSide) {
      const reveal = (this.world.cinematic && this.world.cinematic.actor === this) || (this.anim.currentName || '').startsWith('victory');
      if (reveal !== this._maskRevealed) {
        this._maskRevealed = reveal;
        this.rig.showProp('maskOn', !reveal);
        this.rig.showProp('maskSide', reveal);
      }
    }
    // translucidez de buffs (névoa) / esquivas especiais
    let op = 1;
    let stealth = false;
    for (const b of this.buffs) {
      if (!b.opacity || (b.when && !b.when())) continue;
      if (b.stealth) { stealth = true; op = Math.min(op, this.stealthOpacity(b)); } else op = Math.min(op, b.opacity);
    }
    this.updateStealthMark(stealth && this.ownerSees());
    // escondido de quem olha a tela (só contra a CPU: no online a câmera precisa ser igual nos dois computadores, e no
    // P1 vs P2 a tela é uma só): a câmera fica no último lugar em que ele foi visto
    const hideCam = stealth && !this.ownerSees() && !this.world.netplay;
    if (hideCam) { if (!this.camPos) this.camPos = this.pos.clone(); } else this.camPos = null;
    if (this.state === 'dodge' && this.dodgeCfg.style === 'inexistir') op = Math.min(op, 0.25 + Math.abs(Math.sin(this.stateTime * 60)) * 0.3);
    this.setOpacity(op);
  }

  // Quem está olhando esta tela controla este lutador? Online: o lado deste computador (world.viewSlot). Local: um
  // humano no controle (no P1 vs P2 os dois são humanos na MESMA tela — os dois veem a silhueta, e o que vale é o
  // efeito em jogo: o adversário não se vira sozinho para ela, a emboscada e o bônus de assassina)
  ownerSees() {
    const v = this.world.viewSlot;
    if (v !== undefined && v !== null) return this.index === v;
    return !(this.input && this.input.cpu);
  }

  // furtividade (o "Shhh..." da Jae): o dono vê uma silhueta escura; no online o adversário quase não vê nada; contra
  // a CPU (ou CPU × CPU) fica como antes
  stealthOpacity(b) {
    if (this.ownerSees()) return 0.38;
    return this.world.netplay ? 0.06 : b.opacity;
  }

  // anel no chão, na cor do jogador, debaixo de quem está furtivo — só na tela de quem o controla
  updateStealthMark(on) {
    if (!on && !this._stealthRing) return;
    if (!this._stealthRing) {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 40), new THREE.MeshBasicMaterial({ color: this.index ? 0xff4a52 : 0x3aa0ff, transparent: true, opacity: 0.55, depthWrite: false }));
      m.rotation.x = -Math.PI / 2;
      m.renderOrder = 3;
      this.world.scene.add(m);
      this._stealthRing = m;
    }
    this._stealthRing.visible = on;
    if (on) this._stealthRing.position.set(this.pos.x, Math.max(0.03, this.pos.y + 0.03), this.pos.z);
  }

  // ------------------------------------------------ buffer de comandos
  // Apertou ○ □ △ ou L2 um pouco antes de poder agir (fim de golpe, levantando, saindo do dash):
  // o comando fica guardado por COMBAT.inputBuffer e sai no primeiro quadro livre.
  bufferInputs() {
    const inp = this.input;
    const now = this.world.inputTime;
    if (this.canAct()) {
      const b = this.buffered;
      if (b && now - b.t <= COMBAT.inputBuffer && !BUFFER_ACTIONS.some((a) => inp.pressed[a])) inp.pressed[b.action] = true;
      this.buffered = null;
      return;
    }
    if (this.state === 'block' || this.state === 'ko' || this.state === 'intro') return;
    for (const a of BUFFER_ACTIONS) {
      // durante o golpe, ○ já entra na fila própria do combo
      if (a === 'physical' && this.state === 'attack') continue;
      if (inp.pressed[a]) this.buffered = { action: a, t: now };
    }
  }

  // ------------------------------------------------ comandos
  recent(action) {
    const t = this.input.pressTime[action];
    return t !== undefined && this.world.inputTime - t <= COMBAT.chordWindow;
  }

  // Comando Energia + Pulo (△/Y + A/×). Retorna true se consumiu.
  // Todos: dash longo. Quem tiver habilidade própria nesse comando (Joui) usa ela.
  tryChord() {
    const inp = this.input;
    const jumpWithCarga = inp.pressed.jump && (inp.held.carga || this.recent('carga'));
    const cargaWithJump = inp.pressed.carga && this.recent('jump') && inp.held.jump;
    if (!jumpWithCarga && !cargaWithJump) return false;
    if (this.recent('carga') && this.carga.stage > 0) this.carga.stage -= 1;
    const chordAbility = (this.def.abilities || []).find((a) => a.input === 'carga+jump');
    if (chordAbility) this.useAbility(chordAbility);
    else this.startDash('long');
    return true;
  }

  // Dash para frente (curto: A+A / longo: Y+A)
  // kind 'short': A + A — vai na direção do analógico (frente, trás, lados, diagonais); sem direção, vai até o adversário
  // kind 'long': △ + A — persegue o adversário
  // kind 'chase': × no meio do combo — persegue o alvo (inclusive no ar)
  startDash(kind) {
    const cfg = COMBAT.dash[kind === 'chase' ? 'short' : kind];
    const key = 'dash';
    if (this.cooldowns[key] > 0 && kind !== 'chase') return;
    if (!this.spendEnergy(cfg.energyCost || 0)) {
      this.notify('SEM SANIDADE');
      return;
    }
    if (kind !== 'step') this.dashes = (this.dashes || 0) + 1; // contado pela Regra do Jogo do Anfitrião ("proibido correr")
    const opp = this.opponent;
    let dir;
    const stick = kind === 'short' || kind === 'step' ? this.moveInputWorld(new THREE.Vector3()) : null;
    let free = false;
    if (stick && stick.length() > 0.35) {
      dir = stick.setY(0).normalize();
      free = true;
    } else if (opp && distXZ(this.pos, opp.pos) < 30) dir = new THREE.Vector3().subVectors(opp.pos, this.pos).setY(0).normalize();
    else dir = forwardFromYaw(this.yaw, new THREE.Vector3());
    // mantém o rosto no adversário quando o dash é lateral/para trás
    if (!free || !opp) this.yaw = Math.atan2(dir.x, dir.z);
    else this.yaw = yawTo(this.pos, opp.pos);
    const homing = kind === 'long' || kind === 'chase';
    const climb = kind === 'chase' && opp && opp.pos.y > 1.2 ? Math.min(14, (opp.pos.y - this.pos.y) / cfg.duration) : 0;
    this.dash = { kind, cfg: { ...cfg, homing, stopAt: free ? 0 : cfg.stopAt }, dir, speed: cfg.distance / cfg.duration, airborne: !this.onGround || climb > 0, climb, free };
    this.cooldowns[key] = cfg.cooldown;
    this.carga.stage = 0;
    this.setState('dashing');
    this.vel.y = Math.max(0, Math.min(this.vel.y, 2));
    // passo da defesa: pulinho curto (pose da esquiva), não a corrida do dash
    if (kind === 'step') this.anim.play('dodge', { restart: true, duration: cfg.duration, blend: 0.03 });
    else this.anim.play('dash', { restart: true });
    this.world.audio.play(kind === 'long' ? 'blink' : 'jump', { volume: 0.7 });
    const col = this.def.energyColor;
    this.world.fx.play('FX_DASH', v2.set(this.pos.x, this.pos.y + 0.4, this.pos.z), { color: col, kind });
  }

  tryComboDash() {
    const opp = this.opponent;
    const C = COMBAT.comboDash;
    if (!opp || opp.state === 'ko' || (opp.comboDashes || 0) >= C.maxPerCombo) return false;
    if (!this.spendEnergy(C.energyCost)) return false;
    opp.comboDashes = (opp.comboDashes || 0) + 1;
    // a sequência recomeça do primeiro golpe (não cai no finalizador)
    this.combo.chain = -1;
    this.combo.steps = 0;
    this.combo.queued = null;
    this.stopStrikeFx();
    this.setState('idle');
    this.startDash('chase');
    if (this.state !== 'dashing') return false;
    // se o alvo está no ar, o combo continua no ar
    if (opp.pos.y > 1.2) this.airCombo = this.airCombo || { target: opp, hits: 0, t: 0 };
    return true;
  }

  updateDash(dt) {
    const d = this.dash;
    const opp = this.opponent;
    if (d.climb) this.vel.y = d.climb;
    if (d.cfg.homing && opp && opp.visible) {
      // dash longo persegue o adversário
      const want = new THREE.Vector3().subVectors(opp.pos, this.pos).setY(0).normalize();
      d.dir.lerp(want, Math.min(1, dt * 8)).normalize();
      this.yaw = Math.atan2(d.dir.x, d.dir.z);
    }
    this.vel.x = d.dir.x * d.speed;
    this.vel.z = d.dir.z * d.speed;
    // no ar, o dash é quase reto (cai devagar)
    if (!d.climb && (d.airborne || !this.onGround)) this.vel.y = -1.2;
    if (d.kind === 'long' && Math.random() < 0.7) {
      this.world.fx.burst(this.chestPos(), { count: 2, color: this.def.energyColor, speed: 0.6, life: 0.35, size: 0.45 });
    }
    const close = !d.free && opp && distXZ(this.pos, opp.pos) <= d.cfg.stopAt && Math.abs(opp.pos.y - this.pos.y) < 1.4;
    const k = this.stateTime / d.cfg.duration;
    // pode emendar ataque no fim do dash
    if (k > 0.55) {
      const inp = this.input;
      if (inp.pressed.physical || inp.pressed.ranged || this.comboPressed()) {
        this.vel.x = 0;
        this.vel.z = 0;
        this.setState('idle');
        this.handleCommands();
        return;
      }
    }
    if (k >= 1 || close) {
      this.vel.x *= 0.2;
      this.vel.z *= 0.2;
      if (d.kind === 'step' && this.input.held.block && this.onGround) {
        const dir = this.moveInputWorld(v1);
        if (dir.length() > 0.3 && this.cooldowns.dash <= 0) {
          this.startDash('step');
          return;
        }
        this.startBlock();
        return;
      }
      this.setState('idle');
    }
  }

  // Combinações de habilidade que não são △ + ○/□ (essas ficam em tryCargaAbility):
  //   △ + L2 = 'carga+dodge' · R2 (defesa) + △ = 'block+carga' · R2 + × = 'block+jump'  (R2 + ○ é o agarrão)
  comboAbility() {
    const inp = this.input;
    const abs = this.def.abilities || [];
    // △ + L2: os dois juntos ou em sequência rápida (vale o MOMENTO do aperto do △; segurando △ para carregar por mais
    // tempo, L2 continua sendo ESQUIVA — fugir vem antes)
    if (inp.pressed.dodge && (inp.pressed.carga || this.recent('carga'))) {
      const a = abs.find((x) => x.input === 'carga+dodge');
      if (a) return a;
    }
    if (inp.held.block) {
      if (inp.pressed.carga) return abs.find((x) => x.input === 'block+carga') || null;
      if (inp.pressed.jump) return abs.find((x) => x.input === 'block+jump') || null;
    }
    return null;
  }

  comboPressed() {
    return !!this.comboAbility();
  }

  tryComboAbility() {
    const a = this.comboAbility();
    if (!a) return false;
    if (this.input.pressed.dodge && !this.input.pressed.carga && this.carga.stage > 0) this.carga.stage -= 1; // o △ era parte do comando
    this.useAbility(a);
    return true;
  }

  // Esquiva: botão próprio (L2/LT) + direção (sem direção, recua). Gasta 1 das 4 cargas.
  wantsDodge() {
    return !!this.input.pressed.dodge && this.cooldowns.dodge <= 0 && this.onGround;
  }

  handleCommands() {
    const inp = this.input;
    if (this.tryChord()) return true;
    if (this.tryComboAbility()) return true;
    if (this.wantsDodge()) {
      this.tryDodge();
      return true;
    }
    // Defesa + ○/B = agarrão (não pode ser defendido)
    if (inp.pressed.physical && inp.held.block && this.onGround) {
      this.tryGrab();
      return true;
    }
    if (inp.pressed.physical) {
      if (this.carga.stage >= 2) {
        this.carga.stage = 0;
        this.trySpecial();
      } else if (!this.tryCargaAbility('physical')) {
        this.startMelee();
      }
      return true;
    }
    if (inp.pressed.ranged) {
      if (!this.tryCargaAbility('ranged')) this.tryRanged();
      return true;
    }
    if (inp.pressed.carga) {
      this.advanceCarga();
      this.startCharging();
      return true;
    }
    if (inp.held.block && this.onGround && !this.buffs.some((b) => b.noBlock)) {
      this.startBlock();
      return true;
    }
    return false;
  }

  // △/Y é o MODIFICADOR de ○ e □, como no Storm 4: △ → ○ e △ → □ (um toque logo depois do outro, dentro de
  // COMBAT.cargaComboWindow; também vale junto ou segurando △) soltam a habilidade daquele comando ('carga+physical' / 'carga+ranged')
  // e desfazem a etapa de Carga daquele toque. △ → △ → ○ continua sendo o especial.
  chordWithCarga() {
    const inp = this.input;
    // em sequência (△, solta, ○/□): só vale logo depois do △ — andar um tempo e apertar ○ é ataque normal
    const t = inp.pressTime.carga;
    const seq = this.carga.stage === 1 && t !== undefined && this.world.inputTime - t <= COMBAT.cargaComboWindow;
    if (!inp.pressed.carga && !inp.held.carga && !this.recent('carga') && !seq) return false;
    if (!inp.pressed.carga && this.carga.stage > 0) this.carga.stage -= 1;
    return true;
  }

  tryCargaAbility(btn) {
    const a = (this.def.abilities || []).find((x) => x.input === 'carga+' + btn);
    if (!a || !this.chordWithCarga()) return false;
    this.useAbility(a);
    return true;
  }

  advanceCarga() {
    this.carga.stage = Math.min(2, this.carga.stage + 1);
    this.carga.timer = COMBAT.cargaWindow;
    const col = this.def.energyColor;
    this.world.fx.ring(v1.set(this.pos.x, this.pos.y + 0.05, this.pos.z), { color: col, radius: 1.8 + this.carga.stage * 0.6, life: 0.45 });
    this.world.fx.burst(this.chestPos(), { count: 18, color: col, speed: 4, life: 0.5, size: 0.3 });
    if (this.carga.stage === 2) {
      this.world.audio.play('armed');
      this.world.fx.flash(this.chestPos(), { color: col, size: 3, life: 0.2 });
    } else {
      this.world.audio.play('carga', { pitch: 1 });
    }
  }

  // Base do analógico: sempre as direções da tela (câmera). O modo "relativo ao inimigo" foi removido.
  moveBasis() {
    return this.world.cameraBasis;
  }

  moveInputWorld(out) {
    const b = this.moveBasis();
    out.set(0, 0, 0);
    out.addScaledVector(b.right, this.input.moveX);
    out.addScaledVector(b.forward, this.input.moveY);
    // Controle Mental (Gal): o corpo obedece ao contrário
    if (this.buffs && this.buffs.some((x) => x.invertMove)) out.negate();
    // Hipnose Espiral (Ferreiro): o corpo anda em círculos até o centro da espiral, mesmo sem comando
    const hyp = this.buffs && this.buffs.find((x) => x.spiralTo);
    if (hyp) {
      const dx = hyp.spiralTo.x - this.pos.x;
      const dz = hyp.spiralTo.z - this.pos.z;
      const d = Math.hypot(dx, dz) || 1;
      const pull = new THREE.Vector3(-dz / d, 0, dx / d).multiplyScalar(1).add(new THREE.Vector3(dx / d, 0, dz / d).multiplyScalar(0.3)).normalize().multiplyScalar(0.8);
      out.multiplyScalar(0.3).add(pull);
    }
    // Controle Mental do Gal (walkTo): o corpo anda sozinho até quem controla e para colado nele (os comandos valem 25%)
    const ctl = this.buffs && this.buffs.find((x) => x.walkTo);
    if (ctl && ctl.walkTo.state !== 'ko') {
      const dx = ctl.walkTo.pos.x - this.pos.x;
      const dz = ctl.walkTo.pos.z - this.pos.z;
      const d = Math.hypot(dx, dz) || 1;
      out.multiplyScalar(0.25);
      if (d > 1.7) out.add(new THREE.Vector3(dx / d, 0, dz / d).multiplyScalar(0.85));
    }
    // Labirinto Mental: o corpo anda numa direção que muda sozinha (como perdido num labirinto)
    const maze = this.buffs && this.buffs.find((x) => x.mazeMove);
    if (maze && out.lengthSq() > 0) {
      if (maze.pullTo && maze.pullTo.state !== 'ko') {
        // Labirinto Abissal: qualquer direção vira "na direção de quem lançou"
        const len = out.length();
        out.set(maze.pullTo.pos.x - this.pos.x, 0, maze.pullTo.pos.z - this.pos.z).normalize().multiplyScalar(len);
      } else out.applyAxisAngle(new THREE.Vector3(0, 1, 0), maze.mazeAngle || 0);
    }
    return out;
  }

  // Direção do comando em relação ao adversário: neutro / frente / trás / lado
  dirIntent() {
    const dir = this.moveInputWorld(new THREE.Vector3());
    const mag = dir.length();
    if (mag < 0.35) return { kind: 'neutral' };
    dir.normalize();
    const opp = this.opponent;
    const fwd = opp && distXZ(opp.pos, this.pos) > 0.01 ? new THREE.Vector3().subVectors(opp.pos, this.pos).setY(0).normalize() : forwardFromYaw(this.yaw);
    const d = dir.dot(fwd);
    if (d > 0.5) return { kind: 'forward' };
    if (d < -0.5) return { kind: 'back' };
    const side = dir.clone().addScaledVector(fwd, -d).normalize();
    return { kind: 'side', side };
  }

  updateIdle(dt) {
    if (this.handleCommands()) return;
    const inp = this.input;
    const dir = this.moveInputWorld(v1);
    const mag = Math.min(1, dir.length());
    let buffSpeed = 1;
    for (const b of this.buffs) if (b.speedMult) buffSpeed *= b.speedMult;
    this.updateMount(dt, mag);
    const ride = this.riding ? this.def.mount.speedMult : 1;
    const speed = this.moveSpeed * buffSpeed * ride * (this.onGround ? 1 : 0.85) * this.world.speedFactor(this);
    if (mag > 0.05) {
      dir.normalize();
      this.vel.x = dir.x * speed * mag;
      this.vel.z = dir.z * speed * mag;
      this.applyOrbit(dir, speed * mag, dt);
    } else {
      this.vel.x = 0;
      this.vel.z = 0;
    }
    const opp = this.opponent;
    if (this.surprised > 0) {
      // surpreendido (ex.: Joui surgiu pelas costas): não se vira sozinho
      this.surprised -= dt;
    } else if (this.riding && mag > 0.05) {
      // no skate: o corpo vira para onde está andando (não fica travado no adversário)
      this.yaw = turnTowards(this.yaw, Math.atan2(dir.x, dir.z), dt * 9);
    } else if (this.lockOn && opp && !this.lostTrack(opp)) this.yaw = turnTowards(this.yaw, yawTo(this.pos, opp.pos), dt * 12);
    else if (mag > 0.05) this.yaw = turnTowards(this.yaw, Math.atan2(dir.x, dir.z), dt * 14);

    // A/× + A/× (toque duplo) = dash curto para frente
    if (inp.pressed.jump) {
      const now = this.world.inputTime;
      const doubleTap = this.lastJumpPress !== undefined && now - this.lastJumpPress <= COMBAT.dash.doubleTapWindow;
      this.lastJumpPress = doubleTap ? undefined : now;
      if (doubleTap) {
        this.startDash('short');
        return;
      }
    }
    if (inp.pressed.jump && this.onGround) {
      this.jumps = (this.jumps || 0) + 1; // contado pela Regra do Jogo do Anfitrião ("proibido pular")
      this.vel.y = COMBAT.jumpVelocity;
      this.onGround = false;
      this.anim.play('jump', { restart: true });
      this.world.audio.play('jump');
    }

    if (!this.onGround) {
      if (this.vel.y < 0) this.anim.play('fall');
    } else if (mag > 0.05) {
      // analógico até a metade: caminha; daí para cima: corre (com folga para não ficar alternando)
      this.walking = mag < (this.walking ? 0.6 : 0.5);
      if (this.riding) { this.anim.play(this.def.mount.anim); this.anim.speed = 1; this.anim.twist = 0; }
      else {
        // direção do movimento em relação a para onde ele olha (travado no adversário = anda de lado/de costas)
        const fd = dir.x * Math.sin(this.yaw) + dir.z * Math.cos(this.yaw);
        const ld = dir.x * Math.cos(this.yaw) - dir.z * Math.sin(this.yaw);
        let clip;
        let twist = 0;
        if (fd <= -0.6) clip = 'walk_back'; // recuo de frente para o adversário
        else if (this.walking) clip = fd >= 0.7 ? 'walk' : ld > 0 ? 'strafe_L' : 'strafe_R';
        else {
          // correndo de lado/diagonal: as pernas viram para onde vai (até 70°), o peito segue no adversário
          clip = 'run';
          twist = clamp(Math.atan2(ld, fd), -1.22, 1.22);
        }
        this.anim.play(clip, { blend: 0.15 });
        this.anim.twist += (twist - this.anim.twist) * Math.min(1, dt * 10);
        this.anim.speed = this.strideSpeed(this.anim.current, Math.hypot(this.vel.x, this.vel.z));
      }
    } else {
      if (!(this.gestureT > 0)) this.anim.play('idle');
      this.anim.speed = 1;
      this.anim.twist = 0;
    }
  }

  // velocidade do clipe de locomoção casada com o deslocamento (o pé de apoio não escorrega — V4 etapa 17)
  strideSpeed(clip, v) {
    if (!clip || !clip.stride) return 1;
    const dist = clip.stride * (this.rig.hipHeight || 0.95); // metros por ciclo
    return clamp((v * clip.dur) / dist, 0.5, 1.9);
  }

  // Pegada da arma (def.grip): Xande guarda o skate nas costas ao bater e segura o taco com as duas mãos;
  // na defesa ergue o skate como escudo; parado/andando leva o skate na mão esquerda.
  updateGrip() {
    const G = this.def.grip;
    if (!G || this.riding) { if (this.anim.poseFilter && !G) this.anim.poseFilter = null; return; }
    if (G.twoHand) {
      // arma de duas mãos (Lírio — Leonora): a esquerda segura o cabo em quase tudo; andando/correndo carrega no ombro
      const clip = this.anim.currentName || '';
      const free = (G.freeLeft || []).includes(clip) || ['ko', 'downed', 'launched'].includes(this.state);
      const carry = G.carry && ['walk', 'run', 'walk_back', 'strafe_L', 'strafe_R'].includes(clip) && this.state === 'idle';
      this.anim.poseFilter = free ? null : (p) => {
        if (carry) { p.sR = [...G.carry.sR]; p.eR = [...G.carry.eR]; }
        const r = p.sR;
        const e = p.eR;
        p.sL = [r[0], r[1] - (G.reach ?? 0.42), -0.05];
        p.eL = [Math.min(e[0], -0.25) - 0.15, e[1], e[2]];
        return p;
      };
      return;
    }
    const prop = this.rig.props[G.prop];
    if (!prop) return;
    const attacking = this.state === 'attack';
    const slot = attacking ? 'back' : 'hand';
    if (!this.gripHome) this.gripHome = { parent: prop.parent, pos: prop.position.clone(), rot: prop.rotation.clone() };
    if (this.gripSlot !== slot) {
      this.gripSlot = slot;
      if (slot === 'back' && G.stow === 'hip') {
        // Guizo: a câmera fica pendurada na alça, no quadril
        this.rig.sockets.hip.add(prop);
        prop.position.set(0.03, -0.06, 0.04);
        prop.rotation.set(0.2, 0, 0.15);
      } else if (slot === 'back') {
        this.rig.sockets.back.add(prop);
        prop.position.set(0.02, 0.1, -0.06);
        prop.rotation.set(0, 0, 0.5); // atravessado nas costas
      } else {
        this.gripHome.parent.add(prop);
        prop.position.copy(this.gripHome.pos);
        prop.rotation.copy(this.gripHome.rot);
      }
    }
    // duas mãos no taco: o braço esquerdo acompanha o direito (as mãos se encontram no cabo)
    this.anim.poseFilter = attacking && G.bothHands !== false ? (p) => {
      const r = p.sR;
      const e = p.eR;
      p.sL = [r[0], r[1] - (G.reach ?? 0.42), -0.05];
      p.eL = [Math.min(e[0], -0.25) - 0.15, e[1], e[2]];
      return p;
    } : null;
  }

  // Montaria (Xande — Skate Caótico): andando um instante ele sobe no skate e fica mais rápido;
  // parar, atacar, defender ou apanhar faz descer. Configurado em def.mount.
  updateMount(dt, mag) {
    const M = this.def.mount;
    if (!M) return;
    if (mag > 0.5) {
      this.mountStill = 0;
      if (!this.riding) {
        this.mountT = (this.mountT || 0) + dt;
        if (this.mountT >= M.after && this.onGround) this.mount(true);
      } else if (this.onGround && Math.random() < 0.35) {
        // faíscas verdes das rodas
        this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.08, this.pos.z), { count: 1, color: M.color ?? 0x5aff6a, speed: 1.2, up: 0.4, life: 0.25, size: 0.08 });
      }
    } else {
      this.mountT = 0;
      if (this.riding) {
        this.mountStill = (this.mountStill || 0) + dt;
        if (this.mountStill > 0.25) this.mount(false);
      }
    }
  }

  mount(on) {
    const M = this.def.mount;
    const prop = M && this.rig.props[M.prop];
    if (!prop || !!this.riding === on) { if (!on) this.riding = false; return; }
    if (!this.mountHolder) {
      // suporte deitado no chão, alinhado com a frente do personagem
      this.mountHolder = new THREE.Group();
      this.mountHolder.rotation.x = -Math.PI / 2;
      this.mountHolder.position.set(0, M.height ?? 0.06, 0);
      this.rig.root.add(this.mountHolder);
      this.mountHome = { parent: prop.parent, pos: prop.position.clone(), rot: prop.rotation.clone() };
    }
    this.riding = on;
    if (on) {
      this.mountHolder.add(prop);
      prop.position.set(0, M.center ?? 0.3, 0);
      prop.rotation.set(0, -Math.PI / 2, 0);
      this.rig.body.position.y = M.lift ?? 0.1;
      this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.15, this.pos.z), { count: 10, color: M.color ?? 0x5aff6a, speed: 2, life: 0.3, size: 0.12 });
      this.anim.play(M.anim, { restart: true, blend: 0.1 });
    } else {
      this.mountHome.parent.add(prop);
      prop.position.copy(this.mountHome.pos);
      prop.rotation.copy(this.mountHome.rot);
      this.rig.body.position.y = 0;
    }
    this.mountT = 0;
    this.mountStill = 0;
  }

  // Lock-on: a parte lateral do movimento vira órbita (corrige o raio que abriria a cada quadro)
  applyOrbit(dir, speed, dt) {
    const opp = this.opponent;
    if (!this.lockOn || !opp || !this.onGround) return;
    const dx = opp.pos.x - this.pos.x;
    const dz = opp.pos.z - this.pos.z;
    const r = Math.hypot(dx, dz);
    if (r < 0.8 || r > 25) return;
    const fx = dx / r;
    const fz = dz / r;
    const radial = dir.x * fx + dir.z * fz;
    const lat = Math.sqrt(Math.max(0, 1 - radial * radial));
    if (lat < 0.2) return;
    const vt = speed * lat;
    // andar reto na tangente abre o raio em vt²·dt²/(2r) por quadro: esta velocidade para dentro cancela isso
    const pull = (vt * vt * dt) / (2 * r);
    this.vel.x += fx * pull;
    this.vel.z += fz * pull;
  }

  updateCharging(dt) {
    const inp = this.input;
    // carregar ANDANDO: mais devagar e carrega menos (parado = velocidade normal)
    const mdir = this.moveInputWorld(v1);
    const mmag = Math.min(1, mdir.length());
    const moving = mmag > 0.2 && this.onGround;
    if (moving) {
      mdir.normalize();
      const sp = this.moveSpeed * COMBAT.chargeMoveSpeed * mmag * this.world.speedFactor(this);
      this.vel.x = mdir.x * sp;
      this.vel.z = mdir.z * sp;
      this.applyOrbit(mdir, sp, dt);
    } else {
      this.vel.x = 0;
      this.vel.z = 0;
    }
    if (moving !== this.chargeMoving) {
      this.chargeMoving = moving;
      this.anim.play(moving ? 'run' : 'charge', { blend: 0.12 });
    }
    if (this.tryChord()) return;
    if (inp.pressed.physical && this.carga.stage >= 2) {
      this.carga.stage = 0;
      this.trySpecial();
      return;
    }
    if (inp.pressed.carga) this.advanceCarga();
    // sair da carga: ataque, defesa, habilidade ou ESQUIVA (fugir no meio da carga)
    if (inp.pressed.physical || inp.pressed.ranged || inp.pressed.block || this.comboPressed() || this.wantsDodge()) {
      this.setState('idle');
      this.handleCommands();
      return;
    }
    if (!inp.held.carga) {
      this.setState('idle');
      return;
    }
    this.addEnergy(COMBAT.chargeRate * (moving ? COMBAT.chargeMoveRate : 1) * dt);
    if (this.carga.stage > 0) this.carga.timer = Math.max(this.carga.timer, 0.6);
    // Barra de Transformação cheia e vida baixa: com a sanidade cheia, continuar segurando passa do limite e transforma
    if (this.canTransform() && this.energy >= this.maxEnergy) {
      this.overcharge = Math.min(1, this.overcharge + dt / COMBAT.storm.overcharge);
      if (Math.random() < 0.5) this.world.fx.burst(this.chestPos(), { count: 2, color: this.def.awakening.color ?? this.def.energyColor, speed: 3 + this.overcharge * 5, life: 0.3, size: 0.12 + this.overcharge * 0.15 });
      if (this.overcharge >= 1) {
        this.startAwakening();
        return;
      }
    }
    const opp = this.opponent;
    if (opp) this.yaw = turnTowards(this.yaw, yawTo(this.pos, opp.pos), dt * 6);
    this.anim.speed = moving ? 0.6 : 1;
  }

  // ------------------------------------------------ defesa (L1/LB)
  startBlock() {
    this.setState('block');
    this.guardMoving = false;
    // momento em que a Defesa foi apertada (usado pelo Bloqueio Perfeito)
    this.blockPressTime = this.input.pressTime.block ?? this.world.inputTime;
    this.vel.x = 0;
    this.vel.z = 0;
    this.anim.play('block', { blend: 0.05 });
  }

  updateBlock(dt) {
    const inp = this.input;
    this.guardIdle = 0;
    const opp = this.opponent;
    // R2 + △ / R2 + × (e △ + L2) saindo da defesa
    if (this.tryComboAbility()) {
      this.guardMoving = false;
      return;
    }
    // Defesa + direção (apertada agora) = esquiva, se houver carga na barra
    if (this.wantsDodge()) {
      this.tryDodge();
      return;
    }
    // Defesa + ○/B = agarrão
    if (inp.pressed.physical) {
      this.guardMoving = false;
      this.tryGrab();
      return;
    }
    // contra-ataque saindo direto da defesa
    if (inp.pressed.ranged || this.comboPressed()) {
      this.guardMoving = false;
      this.setState('idle');
      this.handleCommands();
      return;
    }
    if (!inp.held.block) {
      this.guardMoving = false;
      this.setState('idle');
      return;
    }
    const dir = this.moveInputWorld(v1);
    const mag = Math.min(1, dir.length());
    if (mag > 0.3) {
      // DEFESA + DIREÇÃO SEGURADA (Storm 4): não anda — emenda passos rápidos para aquele lado, de frente para o rival
      if (this.onGround && this.cooldowns.dash <= 0) {
        this.guardMoving = false;
        this.startDash('step');
        return;
      }
    }
    // DEFESA PARADO: defende tudo (até especial), gastando a resistência
    if (this.guardMoving) {
      this.guardMoving = false;
      this.anim.play('block', { blend: 0.06 });
    }
    this.anim.speed = 1;
    this.vel.x *= 0.6;
    this.vel.z *= 0.6;
    if (this.surprised > 0) this.surprised -= dt;
    else if (opp && !this.lostTrack(opp)) this.yaw = turnTowards(this.yaw, yawTo(this.pos, opp.pos), dt * COMBAT.block.turnRate);
    if (this.blockRecoil > 0) {
      this.blockRecoil -= dt;
      if (this.blockRecoil <= 0) this.anim.play('block', { blend: 0.05 });
    }
  }

  // Defendendo de verdade? (parado; andando com a defesa fica aberto)
  isGuarding() {
    return this.state === 'block' && !this.guardMoving;
  }

  // Golpe bloqueado: gasta a resistência e pode quebrar a defesa
  onBlockedHit(attempted, attacker) {
    const B = COMBAT.block;
    this.guard -= attempted * B.guardDamage;
    this.blockRecoil = 0.2;
    this.anim.play('block_hit', { restart: true, blend: 0.02 });
    const dir = v1.subVectors(this.pos, attacker.pos).setY(0).normalize();
    this.vel.x = dir.x * B.pushback;
    this.vel.z = dir.z * B.pushback;
    this.world.fx.play('FX_BLOCK', this.chestPos(), { dir });
    this.world.audio.play('blockHit');
    if (this.guard <= 0) this.guardBreak();
  }

  // Bloqueio pesado (def.anims.blockHeavy): finca os pés, absorve com o corpo e quase não recua
  heavyBlockReact(attacker) {
    const name = this.def.anims && this.def.anims.blockHeavy;
    if (!name) return;
    this.anim.play(name, { restart: true, blend: 0.02 });
    this.vel.x *= 0.35;
    this.vel.z *= 0.35;
    this.blockRecoil = 0.32;
    this.world.fx.play('FX_DUST', this.pos, { scale: 0.7 });
    this.world.cameraRig.shake(0.12, 0.12);
    this.world.audio.play('heavyPunch', { volume: 0.5, pitch: 0.7 });
  }

  guardBreak() {
    this.guard = this.maxGuard * 0.4;
    this.world.fx.burst(this.chestPos(), { count: 40, color: 0xbfe6ff, speed: 9, life: 0.5, size: 0.3, gravity: 6 });
    this.world.fx.ring(this.chestPos(), { color: 0xffffff, radius: 2.5, life: 0.3, vertical: true, yaw: this.yaw });
    this.world.audio.play('guardBreak');
    this.notify('DEFESA QUEBRADA', true);
    this.stun(COMBAT.block.breakStun, 'stagger');
  }

  // ------------------------------------------------ esquiva (R2/RT)
  tryDodge() {
    if (this.cooldowns.dodge > 0 || !this.onGround) return;
    if (this.dodges <= 0) {
      this.notify('SEM ESQUIVAS');
      return;
    }
    // a carga só é gasta se a esquiva DESVIAR DE ALGO (settleDodge, no fim): esquivar no vazio não gasta
    const d = this.dodgeParams();
    let dir = this.moveInputWorld(v1);
    if (dir.length() < 0.3) {
      const opp = this.opponent;
      dir = opp ? v1.subVectors(this.pos, opp.pos).setY(0) : forwardFromYaw(this.yaw, v1).negate();
    }
    dir.normalize();
    this.lastEvadeAt = this.world.inputTime; // desvia de especiais avisados (specials/telegraph.js)
    this.dodge = { dir: dir.clone(), speed: d.distance / d.duration, duration: d.duration, cancelAfter: d.cancelAfter, threat: false, bullet: false };
    this.invuln = d.iframes;
    this.cooldowns.dodge = d.cooldown;
    this.cooldownMax.dodge = d.cooldown;
    this.carga.stage = 0;
    this.setState('dodge');
    this.anim.play('dodge', { restart: true, duration: d.duration, blend: 0.03 });
    this.world.audio.play(this.dodgeCfg.style === 'shadow' || this.dodgeCfg.style === 'inexistir' ? 'teleport' : 'jump', { volume: 0.6 });
    const style = this.dodgeCfg.style || 'default';
    const p = v2.set(this.pos.x, 0.3, this.pos.z);
    if (style === 'shadow') {
      this.world.fx.burst(p, { count: 14, color: 0x0c0608, kind: 'smoke', speed: 2, life: 0.5, size: 0.6, up: 0.6 });
    } else if (style === 'inexistir') {
      this.world.fx.distort(this.chestPos(), { color: this.def.energyColor, radius: 1.4, life: 0.3 });
    } else {
      this.world.fx.burst(p, { count: 8, color: 0x8a8090, kind: 'smoke', speed: 2, life: 0.4, size: 0.4 });
    }
    if (this.findBuff('mist')) {
      this.world.fx.burst(this.chestPos(), { count: 16, color: 0xa46bff, kind: 'smoke', speed: 1.5, life: 0.8, size: 0.7, grow: 1.2 });
    }
  }

  updateDodge(dt) {
    const d = this.dodge;
    const k = this.stateTime / d.duration;
    this.senseDodgeThreat(d);
    const sp = d.speed * (k < 0.75 ? 1 : 0.4);
    this.vel.x = d.dir.x * sp;
    this.vel.z = d.dir.z * sp;
    if (this.dodgeCfg.style === 'shadow' && Math.random() < 0.5) {
      this.world.fx.burst(v2.set(this.pos.x, 0.8, this.pos.z), { count: 1, color: 0x0c0608, kind: 'smoke', speed: 0.5, life: 0.4, size: 0.6 });
    }
    if (k >= d.cancelAfter) {
      const inp = this.input;
      if (inp.pressed.physical || inp.pressed.ranged || this.comboPressed()) {
        this.setState('idle');
        this.handleCommands();
        return;
      }
    }
    if (k >= 1) {
      this.vel.x = 0;
      this.vel.z = 0;
      // continua defendendo se o jogador ainda segura a defesa
      if (this.input.held.block) this.startBlock();
      else this.setState('idle');
    }
  }

  // A esquiva desviou de algo? Golpe/ritual/especial do adversário em andamento por perto, um projétil inimigo
  // passando perto, ou um acerto anulado pela invulnerabilidade da esquiva (damage.js marca dodge.threat).
  senseDodgeThreat(d) {
    if (d.threat) return;
    const opp = this.opponent;
    if (opp && ['attack', 'special', 'ability', 'dashing', 'ranged'].includes(opp.state) && distXZ(this.pos, opp.pos) < 3.6) d.threat = true;
    // especial avisado mirando nela (sigilo no chão / mira) — esquivar dele gasta a carga
    if (opp && opp.pendingSpecial && opp.pendingSpecial.tg) d.threat = true;
    for (const p of this.world.projectiles.list) {
      if (p.owner === this) continue;
      if (Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z) < 1.8) { d.threat = true; d.bullet = true; break; }
    }
    if (!d.threat && this.world.npcs.some((n) => n.alive && n.owner !== this && n.state === 'attack' && distXZ(this.pos, n.pos) < 3)) d.threat = true;
  }

  // gasta cargas de esquiva; ao zerar, a recarga por dano fica travada por um tempo (e o que já tinha acumulado some)
  spendDodges(n) {
    this.dodges = Math.max(0, this.dodges - n);
    if (this.dodges === 0) {
      this.dodgeLockout = COMBAT.dodge.emptyLockout;
      this.dodgeDmgAcc = 0;
    }
  }

  // fim da esquiva: gasta 1 carga só se desviou de algo (Desviar de Balas do Gal: projétil não gasta)
  settleDodge() {
    const d = this.dodge;
    if (!d || d.settled) return;
    d.settled = true;
    if (!d.threat) return;
    if (d.bullet && hasPassive(this, 'bulletDodge')) { this.notify('DESVIOU!', true); return; }
    this.spendDodges(1);
  }

  // ------------------------------------------------ ataque físico
  // Dentro de um combo (um golpe acabou de acertar): analógico ↑ / ↓ trocam o próximo golpe
  inCombo() {
    const c = this.combo;
    if (this.state === 'attack' && c.hits && c.hits.some(Boolean)) return true;
    return c.grace > 0 && c.chain >= 0 && c.lastHit;
  }

  stickVert() {
    const { moveX, moveY } = this.input;
    if (moveY > 0.55 && Math.abs(moveX) < 0.7) return 'up';
    if (moveY < -0.55 && Math.abs(moveX) < 0.7) return 'down';
    return null;
  }

  upStrike() {
    const m = this.def.melee;
    return m.up || { name: 'Lançador', anim: (this.def.anims && this.def.anims.launcher) || 'uppercut', dur: 0.46, active: [0.16, 0.28], damage: 40, range: 1.9, arc: 120, lunge: 0.9, finisher: 'launchHigh', launcher: true, sound: 'swing', hitSound: 'heavyPunch', trail: { color: this.def.energyColor, tilt: -1.2 } };
  }

  downStrike() {
    const m = this.def.melee;
    return m.down || { name: 'Golpe para baixo', anim: (this.def.anims && this.def.anims.smash) || 'heavy_punch', dur: 0.52, active: [0.2, 0.32], damage: 48, range: 1.9, arc: 120, lunge: 1.0, finisher: 'knockdown', sound: 'swing', hitSound: 'heavyPunch', impactScale: 1.4 };
  }

  // golpes do combo aéreo: leves (sobem o alvo) e o último crava no chão
  airStrike() {
    const A = COMBAT.airCombo;
    const base = this.def.melee.air;
    const ac = this.airCombo;
    if (ac && ac.hits >= A.maxHits) {
      return { ...base, name: base.name + ' (finalizador)', damage: Math.round(base.damage * A.finalMult), finisher: 'spike', slam: base.slam || 14, airFinal: true };
    }
    return { ...base, name: base.name, damage: Math.round(base.damage * A.chainMult), slam: 0, finisher: undefined, hang: A.hang, airPop: true, dur: Math.min(base.dur, 0.36), active: [0.08, 0.2] };
  }

  startMelee() {
    const m = this.def.melee;
    const opp0 = this.opponent;
    if (m.ground && this.onGround && opp0 && opp0.state === 'downed' && !opp0.otgTaken && distXZ(this.pos, opp0.pos) <= m.ground.range + 1.0) {
      this.startStrike(m.ground, { branch: true });
      return;
    }
    if (!this.onGround && m.air) {
      if (this.airCombo) this.startStrike(this.airStrike(), { air: true });
      else this.startStrike(m.air, { air: true });
      return;
    }
    if (this.inCombo()) {
      const v = this.stickVert();
      if (v === 'up') { this.startStrike(this.upStrike(), { branch: true }); return; }
      if (v === 'down') { this.startStrike(this.downStrike(), { branch: true }); return; }
    }
    const intent = this.dirIntent();
    const variant = intent.kind !== 'neutral' ? m[intent.kind] : null;
    if (variant) {
      this.startStrike(variant, { intent, branch: true });
      return;
    }
    const c = this.combo;
    const next = c.grace > 0 ? c.chain + 1 : 0;
    const idx = next < m.strikes.length ? next : 0;
    if (idx === 0) c.steps = 0;
    this.startStrike(m.strikes[idx], { index: idx });
  }

  startStrike(strike, { index = null, intent = null, branch = false, air = false } = {}) {
    if (!strike) return;
    // golpes mais rápidos por um buff (ex.: Aniquilador do Arnaldo): escala os tempos do golpe
    const fast = this.buffs.find((b) => b.atkSpeed);
    if (fast) {
      const k = fast.atkSpeed;
      strike = {
        ...strike, dur: strike.dur / k,
        active: strike.active && strike.active.map((t) => t / k),
        actives: strike.actives && strike.actives.map((w) => w.map((t) => t / k)),
        iframes: strike.iframes && strike.iframes.map((t) => t / k),
        motion: strike.motion && strike.motion.map((m) => ({ ...m, t: m.t.map((t) => t / k) })),
      };
    }
    this.stopStrikeFx();
    this.setState('attack');
    const c = this.combo;
    c.pullTarget = null;
    if (index !== null) c.chain = index;
    c.steps++;
    c.strike = strike;
    c.branch = branch;
    c.air = air;
    c.windows = strike.actives || [strike.active];
    c.hits = c.windows.map(() => false);
    c.swung = c.windows.map(() => false);
    c.queued = null;
    c.blocked = false;
    c.side = intent && intent.side ? intent.side.clone() : null;
    c.counterUsed = false;
    c.lastHit = false;
    c.npcHits = {};
    // anti-repetição: o mesmo golpe várias vezes seguidas (sem variar) perde força
    const R = COMBAT.repeat;
    const now = this.world.time;
    if (this.lastStrikeName === strike.name && now - (this.lastStrikeAt || 0) < R.window) this.repeatCount = (this.repeatCount || 0) + 1;
    else this.repeatCount = 0;
    this.lastStrikeName = strike.name;
    this.lastStrikeAt = now;
    c.repeatMult = this.repeatCount >= R.after ? R.mult : 1;
    this.anim.speed = 1;
    this.anim.play(strike.anim, { duration: strike.dur, restart: true, blend: 0.05 });
    const opp = this.opponent;
    // mira: o adversário, ou um NPC inimigo (clone, Marionete) que esteja bem mais perto
    let aim = opp && distXZ(this.pos, opp.pos) < 8 ? opp : null;
    const dOpp = aim ? distXZ(this.pos, opp.pos) : 99;
    for (const n of this.world.hostileNpcs(this)) {
      const dn = distXZ(this.pos, n.pos);
      if (dn < 3 && dn < dOpp - 0.5) { aim = n; break; }
    }
    if (aim) this.yaw = yawTo(this.pos, aim.pos);
    this.vel.x = 0;
    this.vel.z = 0;
    if (air) {
      this.vel.y = Math.max(this.vel.y, strike.hang ?? 1.5);
    }
    if (strike.iframes) this.invuln = strike.iframes[1];
    const A = strike.armor;
    this.superArmor = A ? { from: now + A.from, to: now + A.to, max: A.max ?? 40, hits: A.hits ?? 1 } : null;
    // segmentos de movimento (avanço, recuo, passo lateral)
    const lastActive = c.windows[c.windows.length - 1][1];
    c.motion = strike.motion || (strike.lunge ? [{ t: [0, lastActive], fwd: strike.lunge, stopClose: true }] : []);
  }

  updateAttack(dt) {
    const c = this.combo;
    const s = c.strike;
    const t = this.stateTime;
    const opp = this.opponent;

    // movimento do golpe
    let vx = 0;
    let vz = 0;
    const F = forwardFromYaw(this.yaw, v1);
    for (const seg of c.motion) {
      if (t < seg.t[0] || t > seg.t[1]) continue;
      const len = Math.max(0.01, seg.t[1] - seg.t[0]);
      const close = seg.stopClose && opp && distXZ(this.pos, opp.pos) < 1.05;
      if (seg.fwd && !close) { vx += (F.x * seg.fwd) / len; vz += (F.z * seg.fwd) / len; }
      if (seg.back) { vx -= (F.x * seg.back) / len; vz -= (F.z * seg.back) / len; }
      if (seg.side && c.side) { vx += (c.side.x * seg.side) / len; vz += (c.side.z * seg.side) / len; }
    }
    this.vel.x = vx;
    this.vel.z = vz;
    if (c.air && s.slam && t >= c.windows[0][0] && this.vel.y > -s.slam) this.vel.y = -s.slam;

    c.windows.forEach((w, i) => {
      if (!c.swung[i] && t >= w[0]) {
        c.swung[i] = true;
        this.world.audio.play(s.sound, { volume: 0.8 });
        this.spawnTrail(s);
        if (s.groundFx) {
          const F0 = forwardFromYaw(this.yaw, v3);
          const at = new THREE.Vector3(this.pos.x + F0.x * (s.range * 0.75), 0, this.pos.z + F0.z * (s.range * 0.75));
          this.world.fx.play(s.groundFx === 'smash' ? 'FX_GROUND_SMASH' : 'FX_DUST', at, { scale: s.groundScale ?? 1 });
          this.world.cameraRig.shake(s.groundFx === 'smash' ? 0.3 : 0.15, 0.18);
        }
        if (s.chain) this.startStrikeChain(s, w);
      }
      if (!c.hits[i] && t >= w[0] && t <= w[1]) this.checkMeleeHit(s, i);
      else if (c.hits[i] && t >= w[0] && t <= w[1]) this.checkNpcHits(s, i);
    });

    // qualquer ○ apertado durante o golpe entra na fila (não perde botão no combo rápido)
    if (this.input.pressed.physical && t > 0.02) c.queued = { intent: this.dirIntent(), vert: this.stickVert() || this.capturedVert || (c.queued && c.queued.vert) };
    // △ + × depois de acertar: RUSH de perseguição (estilo Storm) — a sequência de ○ recomeça do 1º golpe,
    // então dá para emendar ○○○ → △+× → ○○○ → △+× ... antes do finalizador
    const inp = this.input;
    const rush = (inp.pressed.jump && (inp.held.carga || this.recent('carga'))) || (inp.pressed.carga && (inp.held.jump || this.recent('jump')));
    if (rush && !c.air && c.hits.some(Boolean) && t > c.windows[0][0] && this.tryComboDash()) return;
    // combo aéreo: acompanha o alvo no ar
    if (c.air && this.airCombo) {
      const tg = this.airCombo.target;
      if (tg && tg.state !== 'ko') {
        const dx = tg.pos.x - this.pos.x;
        const dz = tg.pos.z - this.pos.z;
        const dist = Math.hypot(dx, dz) || 1;
        if (dist > 1.1) { this.vel.x = (dx / dist) * Math.min(9, (dist - 1.1) * 10); this.vel.z = (dz / dist) * Math.min(9, (dist - 1.1) * 10); }
        this.yaw = Math.atan2(dx, dz);
      }
    }
    if (this.input.pressed.dodge && this.cooldowns.dodge <= 0 && this.onGround && t > (s.cancelDodge ?? s.dur * 0.5) && !c.blocked) {
      this.setState('idle');
      this.tryDodge();
      return;
    }
    // cancelar em especial: CARGA, CARGA durante o combo
    if (this.input.pressed.carga && t > c.windows[c.windows.length - 1][1]) {
      this.advanceCarga();
      this.startCharging();
      return;
    }
    const recoil = c.blocked ? COMBAT.block.attackerRecoil : 0;
    if (c.air && this.onGround && t > c.windows[0][0]) {
      // aterrissou durante o golpe aéreo
      if (s.slam) {
        this.world.fx.ring(v2.set(this.pos.x, 0.06, this.pos.z), { color: this.def.energyColor, radius: 2.4, life: 0.35 });
        this.world.cameraRig.shake(0.2, 0.15);
      }
      this.endCombo(0.12);
      return;
    }
    if (t >= s.dur + recoil) {
      const m = this.def.melee;
      const maxSteps = m.strikes.length + 1;
      if (c.queued && !c.blocked && !c.air && c.hits.some(Boolean) && c.queued.vert && !s.finisher) {
        // ↑ / ↓ dentro do combo
        this.startStrike(c.queued.vert === 'up' ? this.upStrike() : this.downStrike(), { branch: true });
        return;
      }
      if (c.queued && this.airCombo && !this.onGround && !s.airFinal) {
        this.startStrike(this.airStrike(), { air: true });
        return;
      }
      if (c.queued && !c.blocked && c.steps < maxSteps && !c.air) {
        const q = c.queued.intent;
        const variant = q.kind !== 'neutral' ? m[q.kind] : null;
        if (variant && variant !== s) {
          this.startStrike(variant, { intent: q, branch: true });
          return;
        }
        const next = c.chain + 1;
        if (next < m.strikes.length && !s.finisher && !s.launch) {
          this.startStrike(m.strikes[next], { index: next });
          return;
        }
      }
      this.endCombo(c.blocked ? 0 : COMBAT.comboChainGrace);
    }
  }

  endCombo(grace) {
    const c = this.combo;
    const m = this.def.melee;
    const finished = c.strike && (c.strike.finisher || c.strike.launch);
    if (finished || c.chain + 1 >= m.strikes.length) { c.chain = -1; c.steps = 0; }
    c.grace = grace;
    this.setState('idle');
  }

  // Corrente visível nos golpes que usam as correntes (Injustiça)
  startStrikeChain(s, w) {
    const hand = this.rig.sockets[s.hand === 'L' ? 'handL' : 'handR'];
    const reach = s.range + 0.4;
    const t0 = this.stateTime;
    const life = (w[1] - w[0]) + 0.18;
    const h = this.world.fx.chain(
      () => hand.getWorldPosition(new THREE.Vector3()),
      () => {
        const k = Math.min(1, (this.stateTime - t0) / Math.max(0.05, (w[1] - w[0]) * 0.6));
        const out = Math.sin(Math.min(1, k) * Math.PI * 0.5);
        const target = this.combo.pullTarget && this.combo.pullTarget.state === 'pulled' ? this.combo.pullTarget.chestPos() : null;
        return target || this.chestPos().addScaledVector(forwardFromYaw(this.yaw, v3), 0.4 + reach * out);
      },
      { links: 18 },
    );
    this.strikeFx = this.strikeFx || [];
    this.strikeFx.push({ h, until: t0 + life + (s.onHit?.pull ? 0.3 : 0) });
  }

  stopStrikeFx() {
    if (!this.strikeFx) return;
    for (const f of this.strikeFx) f.h.stop();
    this.strikeFx = [];
  }

  // golpes físicos também acertam NPCs inimigos (clones, Marionete) — um acerto por janela
  checkNpcHits(s, wi) {
    const list = this.world.hostileNpcs(this);
    if (!list.length) return;
    const c = this.combo;
    c.npcHits = c.npcHits || {};
    const key = (n) => `${wi}:${this.world.npcs.indexOf(n)}`;
    const blade = this.findBuff('bloodBlade');
    for (const n of list) {
      if (c.npcHits[key(n)]) continue;
      const d = distXZ(this.pos, n.pos) - n.radius;
      if (d > s.range + (blade ? blade.rangeBonus : 0)) continue;
      if (Math.abs(angleDiff(this.yaw, yawTo(this.pos, n.pos))) > (s.arc * DEG) / 2) continue;
      if (Math.abs(n.pos.y - this.pos.y) > (s.vertical ?? 2.2)) continue;
      c.npcHits[key(n)] = true;
      n.hitBy(this, s.damage / (s.actives ? s.actives.length : 1), { kind: 'melee' });
      this.world.hitstop(0.035);
    }
  }

  checkMeleeHit(s, wi) {
    this.checkNpcHits(s, wi);
    const opp = this.opponent;
    if (!opp || opp.state === 'ko') return;
    const d = distXZ(this.pos, opp.pos) - opp.radius;
    const blade = this.findBuff('bloodBlade');
    if (d > s.range + (blade ? blade.rangeBonus : 0)) return;
    const ang = Math.abs(angleDiff(this.yaw, yawTo(this.pos, opp.pos)));
    if (ang > (s.arc * DEG) / 2) return;
    if (Math.abs(opp.pos.y - this.pos.y) > (s.vertical ?? 1.6)) return;
    this.combo.hits[wi] = true;
    const dir = forwardFromYaw(this.yaw, v2).clone();
    const isLast = wi === this.combo.windows.length - 1;
    const fin = isLast && s.finisher ? COMBAT.finishers[s.finisher] : null;
    const res = applyHit(this.world, this, opp, {
      damage: (s.damage / (s.actives ? s.actives.length : 1)) * (this.combo.repeatMult || 1),
      kind: 'melee',
      knockback: fin ? fin.knockback : s.knockback,
      hitstun: fin ? fin.hitstun : (s.hitstun ?? COMBAT.meleeHitstun),
      launch: fin ? !!fin.launch : (isLast && s.launch),
      lowLaunch: fin && fin.lowLaunch,
      stun: (fin && fin.stun) || (s.onHit && s.onHit.stun),
      guardBreak: s.guardBreak,
      guardCrush: s.guardCrush,
      juggle: !!s.airPop,
      otg: !!s.otg,
      high: fin && fin.high,
      spike: fin && fin.spike,
      unblockable: !!this.findBuff('transcend') || !!this.def.unblockableMelee || this.buffs.some((b) => b.unblockable),
      dir, strike: s, sound: s.hitSound,
      color: s.impactFx === 'sigil' ? 0xffffff : undefined,
      scale: s.impactScale,
      hitstop: s.hitstop,
    });
    if (res === 'blocked') {
      this.combo.blocked = true;
      return;
    }
    if (res === 'countered' || res === 'parried') return;
    this.combo.lastHit = true;
    // INTELIGÊNCIA ESTRATÉGICA (Veríssimo): enquanto a ordem vale, cada golpe físico que acerta ganha um corte extra
    const extra = this.buffs.find((b) => b.extraHit);
    if (extra && typeof res === 'number' && opp.state !== 'ko') {
      const eh = extra.extraHit;
      this.world.after(eh.delay ?? 0.1, () => {
        if (opp.state === 'ko' || this.state === 'ko') return;
        const p = opp.chestPos();
        this.world.fx.slash(p, this.yaw + Math.PI / 2, { color: eh.color ?? this.def.energyColor, radius: 1.2, arc: 2.2, life: 0.22, width: 0.25 });
        applyHit(this.world, this, opp, { damage: eh.damage, kind: 'melee', reaction: false, strike: { damage: eh.damage, noPassive: true }, sound: 'bladeHit', color: eh.color, scale: 0.8 });
      });
    }
    // DALMO — GOLPES DE ARENA (ficha): o finalizador do combo que entra emenda sozinho um golpe desarmado (cabeçada)
    // COLOSSO — PRESSÃO ATMOSFÉRICA das Manoplas: todo soco que entra solta uma onda de pressão (dano extra de Energia);
    // os finalizadores deixam o alvo ATORDOADO
    const pas = this.def.passives || [];
    const arena = pas.find((p) => p.type === 'arenaBlows');
    const press = pas.find((p) => p.type === 'atmosphericPressure');
    // LEITURA (Guizo — disfarce alienígena): a faca de Conhecimento marca o alvo
    const read = pas.find((p) => p.type === 'mindRead');
    if (read && typeof res === 'number' && opp.state !== 'ko') {
      const old = opp.findBuff('mindRead');
      if (old) old.time = read.time;
      else opp.addBuff({ type: 'mindRead', name: 'LIDO', time: read.time, duration: read.time, takenMult: read.takenMult });
      if (Math.random() < 0.5) this.world.fx.ring(opp.chestPos(), { color: read.color ?? 0xe8c860, radius: 0.8, life: 0.2, vertical: true, yaw: this.yaw });
    }
    // LIGAÇÃO TELEPÁTICA: cada golpe no alvo ligado devolve sanidade
    const tele = this.findBuff('telepathy');
    if (tele && typeof res === 'number' && opp.findBuff && opp.findBuff('mindLinked')) this.energy = Math.min(this.maxEnergy, this.energy + (tele.energyPerHit || 0));
    if (press && typeof res === 'number' && opp.state !== 'ko') {
      const c = opp.chestPos();
      this.world.fx.distort(c, { color: press.color ?? 0xffb070, radius: s.finisher ? 2.2 : 1.2, life: 0.25 });
      this.world.fx.ring(c, { color: press.color ?? 0xffb070, radius: s.finisher ? 2.0 : 1.1, life: 0.22, vertical: true, yaw: this.yaw });
      applyHit(this.world, this, opp, { damage: press.damage ?? 6, kind: 'melee', element: 'energia', reaction: false, strike: { damage: press.damage ?? 6, noPassive: true }, sound: null, color: press.color, scale: 0.6 });
      if (s.finisher && press.stun && opp.state !== 'ko') { opp.stun(press.stun); opp.notify('ATORDOADO', true); }
    }
    if (arena && s.finisher && typeof res === 'number' && opp.state !== 'ko') {
      this.world.after(arena.delay ?? 0.16, () => {
        if (opp.state === 'ko' || this.state === 'ko' || distXZ(this.pos, opp.pos) > 2.6) return;
        this.anim.play('headbutt', { restart: true, duration: 0.3 });
        this.world.after(0.1, () => {
          if (opp.state === 'ko') return;
          applyHit(this.world, this, opp, { damage: arena.damage ?? 14, kind: 'melee', reaction: false, strike: { damage: arena.damage ?? 14, noPassive: true }, sound: arena.sound || 'heavyPunch', scale: 1.1, hitstop: 0.06 });
          this.world.fx.play('FX_HIT_HEAVY', opp.chestPos().add(new THREE.Vector3(0, 0.35, 0)), { color: 0xf0e0c0, scale: 1 });
        });
      });
    }
    if (typeof res === 'number' && opp.state !== 'ko') {
      if (s.launcher) {
        // ↑ + ○: o alvo sobe e o atacante vai junto
        this.airCombo = { target: opp, hits: 0, t: 0 };
        this.vel.y = COMBAT.airCombo.chase * 0.95;
        this.onGround = false;
        this.world.audio.play('jump', { volume: 0.6 });
      } else if (s.airPop && this.airCombo) {
        this.airCombo.hits++;
        opp.vel.y = Math.max(opp.vel.y, COMBAT.airCombo.pop);
        opp.juggleT = 0.55;
        opp.hitstun = Math.max(opp.hitstun, opp.stateTime + 0.6);
        this.vel.y = Math.max(this.vel.y, COMBAT.airCombo.hang);
      } else if (s.airFinal) {
        this.airCombo = null;
      }
    }
    if (s.onHit && s.onHit.pull && opp.state !== 'ko') {
      // puxão: traz o inimigo para a distância de combate
      const F = forwardFromYaw(this.yaw, v3);
      const to = new THREE.Vector3(this.pos.x + F.x * 1.5, opp.pos.y, this.pos.z + F.z * 1.5);
      opp.pullTo(to, { time: 0.22, after: s.onHit.after ?? 0.5 });
      this.combo.pullTarget = opp;
    }
    if (s.impactFx === 'spiral') {
      // Guizo: o corte final solta uma espiral cinza de Morte no alvo
      const c = opp.chestPos();
      for (let i = 0; i < 3; i++) this.world.after(i * 0.05, () => this.world.fx.ring(c, { color: 0x8a8494, radius: 0.7 + i * 0.45, life: 0.3, vertical: true, yaw: this.yaw + i * 0.6 }));
      this.world.fx.burst(c, { count: 16, color: 0x26222c, kind: 'smoke', speed: 1.6, life: 0.5, size: 0.3 });
    }
    if (s.impactFx === 'sigil') {
      this.world.fx.ring(opp.chestPos(), { color: this.def.energyColor, radius: 2.2, life: 0.35, vertical: true, yaw: this.yaw });
      this.world.fx.distort(opp.chestPos(), { color: this.def.energyColor, radius: 1.6, life: 0.3 });
    }
  }

  // Contra-ataque (postura de contra do Joui): acionado por damage.js
  triggerCounter(attacker) {
    const s = this.combo.strike;
    const r = s.counter.riposte;
    this.combo.counterUsed = true;
    this.invuln = 0.35;
    this.yaw = yawTo(this.pos, attacker.pos);
    this.anim.play(r.anim || 'iai_slash', { restart: true, duration: 0.4 });
    this.world.audio.play(r.sound || 'slashFinal');
    this.world.fx.slash(attacker.chestPos(), this.yaw, { color: this.def.energyColor, radius: 2.2, arc: 3, life: 0.35, width: 0.4 });
    this.world.fx.flash(attacker.chestPos(), { color: 0xffffff, size: 3, life: 0.15 });
    this.notify('CONTRA-ATAQUE!', true);
    const fin = COMBAT.finishers[r.finisher || 'launch'];
    applyHit(this.world, this, attacker, {
      damage: r.damage, kind: 'melee', knockback: fin.knockback, hitstun: fin.hitstun, launch: !!fin.launch,
      dir: forwardFromYaw(this.yaw, v2).clone(), ignoreInvuln: true, unblockable: true, strike: { damage: r.damage },
    });
    // termina a postura logo depois
    this.combo.windows = [[0, 0]];
    this.stateTime = Math.max(this.stateTime, s.dur - 0.3);
  }

  // "PODE VIR!" (Dalmo / Colosso): o golpe entrou na postura — segura, agarra quem bateu e devolve (damage.js)
  arenaRiposte(attacker) {
    const r = this.def.ranged;
    if (this.seq && this.seq.cancel) this.seq.cancel();
    this.counterStance = null;
    this.invuln = Math.max(this.invuln, 0.2);
    this.yaw = yawTo(this.pos, attacker.pos);
    this.world.hitstop(0.12);
    this.world.audio.play('perfectBlock');
    this.world.fx.flash(this.chestPos(), { color: r.color ?? 0xffffff, size: 3, life: 0.18 });
    this.notify(r.label || 'PODE VIR!', true);
    this.setState('ability');
    this.seq = ABILITY_TYPES.arenaGrab.start(this, r.riposte, this.world);
  }

  spawnTrail(s) {
    const tr = s.trail;
    if (!tr) return;
    const col = this.buffMultiplierActive('melee') ? 0xc89aff : (tr.color ?? this.def.energyColor);
    const base = v1.set(this.pos.x, this.pos.y + (tr.height ?? 1.15), this.pos.z);
    const opts = { color: col, radius: tr.radius || (s.range * 0.85), tilt: tr.tilt || 0, roll: tr.roll || 0, flip: !!tr.flip, arc: tr.wide ? 3.6 : 2.4, life: tr.big ? 0.32 : 0.2, width: tr.big ? 0.5 : 0.3 };
    if (tr.cross) {
      this.world.fx.slash(base, this.yaw, { ...opts, roll: 0.8 });
      this.world.fx.slash(base, this.yaw, { ...opts, roll: -0.8, flip: true });
    } else if (tr.spin) {
      this.world.fx.slash(base, this.yaw, { ...opts, arc: Math.PI * 2 - 0.1 });
    } else {
      this.world.fx.slash(base, this.yaw, opts);
    }
  }

  // ------------------------------------------------ ataque principal (□/X)
  tryRanged() {
    if (this.meleeLocked()) return;
    const base = this.def.ranged;
    if (!base) {
      this.notify('SEM ATAQUE À DISTÂNCIA');
      return;
    }
    const intent = this.dirIntent();
    // variante que é uma HABILIDADE do kit (□ + direção do Anfitrião): usa a habilidade (tem recarga própria);
    // recarregando, sai o □ normal
    let variant = base.variants && intent.kind !== 'neutral' ? base.variants[intent.kind] : null;
    if (variant && variant.ability) {
      const ab = (this.def.abilities || []).find((x) => x.id === variant.ability);
      if (ab && !(this.cooldowns[ab.id] > 0)) {
        this.useAbility(ab);
        return;
      }
      variant = null;
    }
    if (this.cooldowns.ranged > 0) {
      this.notify('RECARREGANDO');
      return;
    }
    if (base.chargeShot) {
      this.startChargeShot(base);
      return;
    }
    // POSTURA DE CONTRA (Dalmo / Colosso: "Pode Vir!"): o □ não arremessa nada — ele se planta e espera o golpe
    if (base.type === 'counter') {
      if (!this.spendEnergy(base.energyCost || 0)) { this.notify('SEM SANIDADE'); return; }
      this.cooldowns.ranged = base.cooldown;
      this.cooldownMax.ranged = base.cooldown;
      this.setState('ranged');
      this.seq = ABILITY_TYPES.arenaCounterStance.start(this, base, this.world);
      return;
    }
    if (base.type === 'beam') {
      this.startBeam(base);
      return;
    }
    // a arma do □ muda com um estado (ex.: Machado Demônio do Balu: arremessa a maça de sangue, não o machado)
    if (!variant && base.whileBuff) for (const t in base.whileBuff) if (this.findBuff(t)) { variant = base.whileBuff[t]; break; }
    let r = variant ? { ...base, ...variant } : base;
    if (!this.spendEnergy(r.energyCost || 0)) {
      this.notify('SEM SANIDADE');
      return;
    }
    this.cooldowns.ranged = r.cooldown;
    this.cooldownMax.ranged = r.cooldown;
    r = { ...r, volley: (this.volleySeq = (this.volleySeq || 0) + 1) };
    this.setState('ranged');
    this.vel.x = 0;
    this.vel.z = 0;
    const total = r.windup + Math.max(0, r.count - 1) * r.interval + r.recovery;
    this.anim.play(r.anim, { duration: total, restart: true });
    if (r.showProp) this.rig.showProp(r.showProp, true);
    if (r.hideProp) this.rig.showProp(r.hideProp, false);
    if (variant && variant.label) this.notify(variant.label, true);
    let fired = 0;
    const self = this;
    const side = intent.side ? intent.side.clone() : null;
    this.seq = {
      t: 0,
      update(dt) {
        this.t += dt;
        const opp = self.opponent;
        if (opp) self.yaw = turnTowards(self.yaw, yawTo(self.pos, opp.pos), dt * 10);
        // movimento durante o disparo (recuo / lateral)
        self.vel.x = 0;
        self.vel.z = 0;
        if (r.motion) {
          const F = forwardFromYaw(self.yaw, v1);
          for (const seg of r.motion) {
            if (this.t < seg.t[0] || this.t > seg.t[1]) continue;
            const len = seg.t[1] - seg.t[0];
            if (seg.back) { self.vel.x -= (F.x * seg.back) / len; self.vel.z -= (F.z * seg.back) / len; }
            if (seg.fwd) { self.vel.x += (F.x * seg.fwd) / len; self.vel.z += (F.z * seg.fwd) / len; }
            if (seg.side && side) { self.vel.x += (side.x * seg.side) / len; self.vel.z += (side.z * seg.side) / len; }
          }
        }
        while (fired < r.count && this.t >= r.windup + fired * r.interval) {
          self.fireProjectile(r);
          fired++;
        }
        if (this.t >= total) {
          self.hideRangedProps();
          return true;
        }
        return false;
      },
      cancel() { self.hideRangedProps(); },
    };
  }

  // RAIO CANALIZADO (Tempestade Caótica do ???): depois do preparo, um raio contínuo sai da Antena por r.duration s;
  // a ponta PERSEGUE o adversário a r.track m/s (um dash ou correr de lado escapa). Pulsos de r.damage a cada r.tick s
  // em quem estiver no caminho (largura r.width). É um ataque à distância comum: defesa de frente segura, esquiva
  // desvia e apanhar no meio interrompe (o estado sai de 'ranged').
  startBeam(r) {
    if (!this.spendEnergy(r.energyCost || 0)) {
      this.notify('SEM SANIDADE');
      return;
    }
    this.cooldowns.ranged = r.cooldown;
    this.cooldownMax.ranged = r.cooldown;
    this.setState('ranged');
    this.vel.x = 0;
    this.vel.z = 0;
    const total = r.windup + r.duration + r.recovery;
    this.anim.play(r.anim || 'point', { duration: total, restart: true });
    const self = this;
    const w = this.world;
    const src = () => (self.rig.sockets.handR ? self.rig.sockets.handR.getWorldPosition(new THREE.Vector3()) : self.chestPos());
    let aim = null; // ponta do raio
    let tickT = 0;
    let hum = 0;
    const seg = new THREE.Vector3();
    const toP = new THREE.Vector3();
    this.seq = {
      t: 0,
      update(dt) {
        this.t += dt;
        const opp = self.opponent;
        if (opp) self.yaw = turnTowards(self.yaw, yawTo(self.pos, opp.pos), dt * 3); // gira devagar acompanhando
        self.vel.x = 0;
        self.vel.z = 0;
        const firing = this.t >= r.windup && this.t < r.windup + r.duration;
        if (this.t < r.windup && Math.random() < 0.6) w.fx.burst(src(), { count: 2, color: r.color, speed: 1.5, life: 0.25, size: 0.12 });
        if (firing) {
          const from = src();
          const want = opp ? opp.chestPos() : from.clone().addScaledVector(forwardFromYaw(self.yaw), r.range);
          if (!aim) { aim = want.clone(); w.audio.play('shockwave', { volume: 0.8 }); }
          // a ponta persegue o alvo com velocidade limitada
          const d = want.clone().sub(aim);
          const step = r.track * dt;
          if (d.length() > step) aim.addScaledVector(d.normalize(), step); else aim.copy(want);
          // limita ao alcance
          const dir = aim.clone().sub(from);
          if (dir.length() > r.range) aim.copy(from).addScaledVector(dir.normalize(), r.range);
          // visual: dois raios tremendo + núcleo claro + faíscas na ponta
          w.fx.lightning(from, aim, { color: r.color, life: 0.06, segments: 12, jitter: 0.22 });
          w.fx.lightning(from, aim, { color: 0xffffff, life: 0.05, segments: 8, jitter: 0.08 });
          w.fx.tracer(from, aim, { color: r.color, life: 0.05, width: r.width * 0.25 });
          if (Math.random() < 0.7) w.fx.burst(aim, { count: 3, color: r.color, speed: 3, life: 0.25, size: 0.14 });
          hum -= dt;
          if (hum <= 0) { hum = 0.35; w.audio.play('shockwave', { volume: 0.25, pitch: 1.6 }); }
          // pulsos de dano em quem estiver no caminho
          tickT -= dt;
          if (tickT <= 0 && opp && opp.state !== 'ko') {
            tickT = r.tick;
            seg.subVectors(aim, from);
            const L = seg.length() || 1;
            toP.subVectors(opp.chestPos(), from);
            const k = Math.max(0, Math.min(1, toP.dot(seg) / (L * L)));
            const dist = toP.addScaledVector(seg, -k).length();
            if (dist <= r.width) {
              // só queima (sem travar em atordoamento): quem é pego ainda consegue correr, esquivar ou defender
              applyHit(w, self, opp, { damage: r.damage, kind: 'ranged', element: 'energia', dir: seg.clone().setY(0).normalize(), reaction: false, sound: r.hitSound || 'impact', color: r.color, scale: 0.9 });
            }
          }
        }
        if (this.t >= total) return true;
        return false;
      },
      cancel() {},
    };
  }

  // Sniper do Arthur: ajoelha, apoia no joelho e mira enquanto segura □; solta para atirar.
  // Mais tempo mirando = mais dano e impacto; levar um golpe cancela (fica vulnerável o tempo todo).
  // Dá para desviar: o ponto do laser SEGUE o alvo com atraso (C.track m/s — correndo de lado você sai da mira) e o
  // tiro vai para onde o laser está, não para onde o alvo está; com a mira cheia o laser TRAVA e pisca vermelho por
  // C.lockWarn s antes do disparo automático (aviso para esquivar).
  startChargeShot(base) {
    const C = base.chargeShot;
    if (!this.spendEnergy(base.energyCost || 0)) {
      this.notify('SEM SANIDADE');
      return;
    }
    this.cooldowns.ranged = base.cooldown;
    this.cooldownMax.ranged = base.cooldown;
    this.setState('ranged');
    this.vel.x = 0;
    this.vel.z = 0;
    this.anim.play('sniper_kneel', { restart: true, duration: C.draw });
    if (base.showProp) this.rig.showProp(base.showProp, true);
    if (base.hideProp) this.rig.showProp(base.hideProp, false);
    const self = this;
    const w = this.world;
    let t = 0;
    let fired = false;
    let k = 0;
    let lastLine = 0;
    let lockT = -1; // mira cheia: tempo travado antes do disparo automático
    const aim = new THREE.Vector3();
    const want = new THREE.Vector3();
    let aimReady = false;
    const track = C.track ?? 5;
    this.seq = {
      update(dt) {
        t += dt;
        const opp = self.opponent;
        self.vel.x = 0;
        self.vel.z = 0;
        if (!fired) {
          // o ponto da mira persegue o alvo devagar (trava de vez quando a mira enche)
          if (opp) {
            opp.chestPos(want);
            if (!aimReady) { aim.copy(want); aimReady = true; }
            else if (lockT < 0) {
              const d = want.distanceTo(aim);
              const step = track * dt;
              if (d > step) aim.lerp(want, step / d);
              else aim.copy(want);
            }
            self.yaw = turnTowards(self.yaw, yawTo(self.pos, aim), dt * 6);
          }
          const aiming = t > C.draw;
          k = aiming ? Math.min(1, (t - C.draw) / C.maxAim) : 0;
          if (k >= 1 && lockT < 0) { lockT = 0; self.fullCharge = true; w.audio.play('armed', { volume: 0.6 }); }
          if (lockT >= 0) lockT += dt;
          // mira a laser: mais grossa e vermelha conforme carrega; travada, pisca
          const blink = lockT >= 0 && Math.floor(lockT * 16) % 2 === 1;
          if (aiming && aimReady && t - lastLine > 0.05 && !blink) {
            lastLine = t;
            const from = self.rig.muzzle ? self.rig.muzzle.getWorldPosition(new THREE.Vector3()) : self.chestPos();
            const to = aim.clone().sub(from).multiplyScalar(1.15).add(from); // passa um pouco do ponto: mostra a linha do tiro
            w.fx.tracer(from, to, { color: lockT >= 0 ? 0xff1010 : k > 0.6 ? 0xff5030 : 0xff9a60, life: 0.06, width: 0.01 + k * 0.03 });
          }
          const release = aiming && (!self.input.held.ranged || lockT >= (C.lockWarn ?? 0.35));
          const quick = !aiming && t >= C.draw - 0.01 && !self.input.held.ranged;
          if (release || quick) {
            fired = true;
            self.fullCharge = false;
            const dmg = Math.round(C.minDamage + (C.maxDamage - C.minDamage) * k);
            self.fireProjectile({ ...base, damage: dmg, knockback: base.knockback * (0.6 + k * 0.8), impactScale: (base.impactScale || 1) * (0.7 + k * 0.8), hitstun: base.hitstun * (0.7 + k * 0.6), aimAt: aimReady ? aim.clone() : undefined });
            self.anim.play('sniper_fire', { restart: true, duration: C.recovery + 0.1 });
            if (k >= 0.99) self.notify('TIRO CARREGADO!', true);
            t = 0;
          }
          return false;
        }
        if (t >= C.recovery) {
          self.hideRangedProps();
          return true;
        }
        return false;
      },
      cancel() { self.hideRangedProps(); self.fullCharge = false; },
    };
  }

  fireProjectile(r0) {
    let r = r0;
    // estado temporário da arma (Rebirth do Arthur)
    // tiro do Caos (Anfitrião): o efeito é sorteado a cada disparo e a cor mostra qual saiu
    // (8 cores com raridade, histórico e combinações — combat/chaos.js)
    if (r.chaosShot) {
      r = rollChaosShot(this, r);
      this.notify(r.chaosLabel, true);
    }
    const ws = this.buffs.find((b) => b.type === 'weaponState' && b.shots > 0);
    if (ws) {
      r = { ...r0, ...ws.projectile, damage: r0.damage + ws.bonusDamage, cursed: true };
      ws.shots--;
      if (ws.shots <= 0) ws.done = true;
    }
    const opp = this.opponent;
    const origin = new THREE.Vector3();
    this.rig.root.updateMatrixWorld(true);
    if (r.origin === 'chest') {
      this.chestPos(origin).addScaledVector(forwardFromYaw(this.yaw, v1), 0.6);
    } else if (r.origin === 'fist') {
      this.rig.sockets.handR.getWorldPosition(origin);
      origin.addScaledVector(forwardFromYaw(this.yaw, v1), 0.4);
    } else if (r.origin === 'ground') {
      origin.set(this.pos.x, 0.15, this.pos.z).addScaledVector(forwardFromYaw(this.yaw, v1), 0.8);
    } else if (r.origin === 'handL') {
      this.rig.sockets.handL.getWorldPosition(origin); // ex.: o Emissor de Pulsos na mão esquerda do Arnaldo
    } else if (r.origin === 'hand') {
      this.rig.sockets.handR.getWorldPosition(origin);
    } else if (this.rig.muzzle && this.rig.muzzle.parent && this.rig.muzzle.parent.visible) {
      this.rig.muzzle.getWorldPosition(origin);
    } else {
      this.rig.sockets.handR.getWorldPosition(origin);
    }
    // r.aimAt: ponto mirado (sniper do Arthur: onde o laser está, que pode ter ficado para trás do alvo)
    const target = r.aimAt ? v2.copy(r.aimAt) : opp ? opp.chestPos(v2) : origin.clone().add(forwardFromYaw(this.yaw, v1).multiplyScalar(10));
    if (r.visual === 'shockwave' || r.origin === 'ground') target.y = origin.y;
    const dir = target.clone().sub(origin).normalize();
    if (r.spread) {
      dir.x += (Math.random() - 0.5) * r.spread;
      dir.y += (Math.random() - 0.5) * r.spread * 0.5;
      dir.z += (Math.random() - 0.5) * r.spread;
      dir.normalize();
    }
    this.world.projectiles.spawn(this, r, origin, dir);
    if (r.afterFire) r.afterFire(this, r, origin, dir);
    this.world.audio.play(r.sound);
    // Trinitá: um clone (só um, para não somar 4 vezes) repete o principal com metade do dano
    if (!r.echo && this.def.id === 'dante') {
      const cl = this.world.npcs.find((n) => n.isClone && n.owner === this && n.alive);
      if (cl && opp) {
        const from = new THREE.Vector3(cl.pos.x, cl.pos.y + 1.3, cl.pos.z);
        const cd = opp.chestPos().sub(from).normalize();
        this.world.projectiles.spawn(this, { ...r, echo: true, damage: Math.round(r.damage * 0.5), onHit: r.onHit && { ...r.onHit, bleed: undefined } }, from, cd);
      }
    }
    if (r.visual === 'bullet' || r.visual === 'sniper' || r.visual === 'cursedSniper') {
      this.world.fx.flash(origin, { color: r.cursed ? r.color : 0xffd27a, size: r.visual === 'bullet' ? 0.9 : 2.2, life: 0.06 });
      this.world.fx.burst(origin, { count: r.visual === 'bullet' ? 4 : 14, color: 0x999999, speed: 1.5, life: 0.6, size: 0.3, kind: 'smoke', dir: dir.clone().multiplyScalar(0.6) });
      if (r.visual !== 'bullet') this.world.cameraRig.shake(r.cursed ? 0.4 : 0.25, 0.2);
      if (r.cursed) {
        for (let i = 0; i < 3; i++) this.world.fx.lightning(origin, origin.clone().addScaledVector(dir, 2 + Math.random() * 2), { color: r.color, life: 0.15 });
        this.world.audio.play('bloodClaw', { volume: 0.5 });
      }
    } else if (r.visual === 'shockwave') {
      this.world.fx.ring(v1.set(this.pos.x, 0.06, this.pos.z), { color: r.color, radius: 2.5, life: 0.35 });
      this.world.fx.distort(this.rig.sockets.handR.getWorldPosition(new THREE.Vector3()), { color: r.color, radius: 1.2, life: 0.3 });
      this.world.cameraRig.shake(0.2, 0.15);
    }
  }

  // ------------------------------------------------ Defesa + ○: agarrão (não defensável, só esquivável)
  tryGrab() {
    const G = { ...COMBAT.grab, ...(this.def.grab || {}) };
    if (this.cooldowns.grab > 0 || !this.onGround) {
      this.setState('idle');
      if (this.cooldowns.grab > 0) this.notify('AGARRÃO: RECARREGANDO');
      return;
    }
    this.cooldowns.grab = G.cooldown;
    this.carga.stage = 0;
    const self = this;
    const w = this.world;
    const opp = this.opponent;
    if (opp && distXZ(this.pos, opp.pos) < 5) this.yaw = yawTo(this.pos, opp.pos);
    this.guardMoving = false;
    this.setState('ability');
    this.anim.play('grab', { restart: true, duration: 0.34 });
    w.audio.play('swing', { volume: 0.7 });
    let t = 0;
    let caught = null;
    let thrown = false;
    let scene = null;
    // CENA DO AGARRÃO: cada personagem tem a sua (src/combat/grabScenes.js — dois golpes do kit e um finalizador com
    // os poderes dele); sem cena registrada, usa os dois primeiros golpes do combo e um arremesso simples
    const startGrabScene = () => {
      const strikes = (self.def.melee && self.def.melee.strikes) || [];
      const sc = GRAB_SCENES[self.def.id] || {
        beats: [
          { t: 0.12, anim: strikes[0]?.anim || 'jab', dur: 0.28, fx: { kind: strikes[0]?.trail ? 'slash' : 'punch' }, sound: strikes[0]?.hitSound },
          { t: 0.48, anim: strikes[1]?.anim || 'heavy_punch', dur: 0.3, fx: { kind: strikes[1]?.trail ? 'slash' : 'punch', flip: true }, sound: strikes[1]?.hitSound },
        ],
        fin: { t: 0.9, anim: 'throw_grab', dur: 0.5 },
      };
      const beats = sc.beats;
      const fin = sc.fin;
      const IMPACT = fin.t + fin.dur * 0.4;
      const END = IMPACT + 0.5;
      const parts = splitDamage(G.damage, [...beats.map(() => 0.2), 1 - beats.length * 0.2]);
      const col = self.def.energyColor ?? 0xffffff;
      w.beginCinematic(self, caught);
      w.cameraRig.playShots(sc.shots ? sc.shots(self, caught) : [
        twoShot(self, caught, { dur: 0.55, dist: 2.8, height: 1.5, push: 0.5, side: 1, lookH: 1.3 }),
        orbit(self, { dur: END - 0.55, radius: 3.0, height: 1.5, a0: 0.9, a1: 2.0, lookH: 1.2 }),
      ]);
      let st = 0;
      let i = 0;
      let threw = false;
      let finAnim = false;
      const hold = () => {
        const Fw = forwardFromYaw(self.yaw, v3);
        caught.pos.set(self.pos.x + Fw.x * 0.9, self.pos.y, self.pos.z + Fw.z * 0.9);
        caught.vel.set(0, 0, 0);
        caught.yaw = yawTo(caught.pos, self.pos);
      };
      const hit = (dmg, last) => applyHit(w, self, caught, {
        damage: dmg, kind: 'melee', reaction: !!last, knockback: last ? G.knockback : 0, hitstun: last ? COMBAT.launchHitstun : 0,
        launch: !!last, lowLaunch: !!last, dir: forwardFromYaw(self.yaw), unblockable: true, ignoreInvuln: true,
        sound: last ? 'heavyPunch' : undefined, scale: last ? 1.6 : 1.1, strike: { damage: dmg, name: 'Agarrão' }, grab: true,
      });
      return {
        end() { if (w.cinematic && w.cinematic.actor === self) w.endCinematic(); },
        update(dt2) {
          st += dt2;
          if (caught.state === 'ko') { this.end(); thrown = true; return true; }
          if (!threw) hold();
          while (i < beats.length && st >= beats[i].t) {
            const bt = beats[i];
            self.anim.play(bt.anim, { restart: true, duration: bt.dur, blend: 0.04 });
            caught.anim.play('hit', { restart: true, blend: 0.02 });
            hit(parts[i], false);
            specialHitFx(w, self, caught, bt.fx || {}, col);
            w.audio.play(bt.sound || 'impact', { volume: 0.8 });
            w.cameraRig.shake(0.15, 0.12);
            i++;
          }
          if (!finAnim && st >= fin.t) {
            finAnim = true;
            self.anim.play(fin.anim, { restart: true, duration: fin.dur, blend: 0.04 });
          }
          if (!threw && st >= IMPACT) {
            threw = true;
            thrown = true;
            // o finalizador com os poderes do personagem (efeito visual + um efeito pequeno)
            const fx = FINISHERS[fin.fx];
            if (fx) fx(w, self, caught, col);
            if (fin.sound) w.audio.play(fin.sound, { volume: 1 });
            w.endCinematic(); // o arremesso acontece já com o mundo andando (o alvo voa e cai)
            caught.setState('idle');
            hit(parts[parts.length - 1], true);
            if (caught.state !== 'ko') {
              if (fin.bleed) caught.applyBleed(fin.bleed, self);
              if (fin.drain) caught.energy = Math.max(0, caught.energy - fin.drain);
              if (fin.slow) caught.addBuff({ type: 'grabSlow', name: 'LENTO', time: fin.slow.time, duration: fin.slow.time, speedMult: fin.slow.mult });
              if (fin.invert) caught.addBuff({ type: 'chaosInvert', name: 'DESORIENTADO', time: fin.invert, duration: fin.invert, invertMove: true });
            }
            if (fin.heal) self.health = Math.min(self.maxHealth, self.health + fin.heal);
            w.cameraRig.shake(0.45, 0.28);
          }
          return threw && st >= END;
        },
      };
    };
    this.seq = {
      update(dt) {
        t += dt;
        const F = forwardFromYaw(self.yaw, v3);
        if (!caught) {
          // passinho curto para alcançar
          const close = opp && distXZ(self.pos, opp.pos) < 1.0;
          const step = t < G.reach[1] && !close ? 4 : 0;
          self.vel.x = F.x * step;
          self.vel.z = F.z * step;
          if (t >= G.reach[0] && t <= G.reach[1] && opp && opp.state !== 'ko' && opp.state !== 'grabbed') {
            const d = distXZ(self.pos, opp.pos) - opp.radius;
            const ang = Math.abs(angleDiff(self.yaw, yawTo(self.pos, opp.pos)));
            // defesa não segura agarrão; só a esquiva (invulnerável) escapa
            if (d <= G.range && ang <= (G.arc * DEG) / 2 && Math.abs(opp.pos.y - self.pos.y) < 1.0 && !opp.isInvulnerable()) {
              caught = opp;
              opp.cancelAction();
              opp.carga.stage = 0;
              opp.guardMoving = false;
              opp.setState('grabbed');
              opp.vel.set(0, 0, 0);
              opp.anim.play('hit', { restart: true });
              t = 0;
              w.audio.play('blockHit');
              w.fx.burst(opp.chestPos(), { count: 10, color: 0xffffff, speed: 3, life: 0.25, size: 0.18 });
              opp.notify('AGARRADO!', true);
            }
          }
          // errou: fica exposto até o fim da recuperação
          return !caught && t >= G.whiffRecovery;
        }
        self.vel.x = 0;
        self.vel.z = 0;
        // escape: Defesa + ○ logo no começo solta os dois, sem dano
        const T = COMBAT.grabTech;
        const techPressed = (caught.input.pressed.physical && caught.input.held.block) ||
                            (caught.input.pressed.block && caught.input.held.physical) ||
                            (caught.input.pressed.physical && caught.input.pressed.block);
        if (!thrown && caught.state === 'grabbed' && t <= T.window && techPressed) {
          thrown = true;
          caught.setState('idle');
          const away = new THREE.Vector3().subVectors(caught.pos, self.pos).setY(0).normalize();
          caught.vel.x = away.x * T.push;
          caught.vel.z = away.z * T.push;
          self.vel.x = -away.x * T.push;
          self.vel.z = -away.z * T.push;
          w.fx.burst(caught.chestPos(), { count: 18, color: 0xffffff, speed: 5, life: 0.3, size: 0.2 });
          w.audio.play('blockHit');
          caught.notify('ESCAPOU!', true);
          t = G.holdTime + 0.3; // termina logo
          return false;
        }
        if (caught.state === 'grabbed') {
          // segura o alvo colado na frente
          caught.pos.set(self.pos.x + F.x * 0.9, self.pos.y, self.pos.z + F.z * 0.9);
          caught.vel.set(0, 0, 0);
          caught.yaw = yawTo(caught.pos, self.pos);
        }
        // passou a janela de escape: vira CENA (cutscene de agarrão) — câmera em volta dos dois, dois golpes com o
        // estilo do próprio personagem (os dois primeiros golpes do combo dele: faca, machado, socos...) e o arremesso
        if (!scene && !thrown && t > T.window && caught.state === 'grabbed') scene = startGrabScene();
        if (scene) return scene.update(dt);
        return thrown && t >= G.holdTime + 0.45; // escapou: termina logo
      },
      cancel() {
        if (scene) scene.end();
        if (caught && caught.state === 'grabbed') caught.setState('idle');
      },
    };
  }

  // ------------------------------------------------ habilidades extras / secundárias
  // custo em sanidade das habilidades (Concentração Inquebrável do Dante reduz)
  abilityCost(a) {
    const focus = (this.def.passives || []).find((p) => p.type === 'ritualFocus');
    let cost = (a.energyCost || 0) * (focus ? focus.mult ?? 0.8 : 1);
    // usar de novo dentro da janela de "spam" fica mais caro (ex.: Teleporte das Sombras)
    const last = this.lastAbilityUse && this.lastAbilityUse[a.id];
    if (a.spamWindow && last !== undefined && this.world.time - last < a.spamWindow) cost *= a.spamMult || 1.6;
    return Math.round(cost);
  }

  useAbility(a) {
    if (this.meleeLocked()) return;
    if (this.cooldowns[a.id] > 0) {
      this.notify(`${a.name.toUpperCase()}: RECARREGANDO`);
      return;
    }
    const cost = this.abilityCost(a);
    const blood = this.bloodPrice(cost);
    if (blood < 0) return;
    const impl = ABILITY_TYPES[a.type];
    if (!impl) return;
    this.carga.stage = 0;
    const seq = impl.start(this, a, this.world);
    if (!seq) return; // falhou (ex.: sem posição/alvo válido) — não gasta nada
    this.payCost(cost, blood);
    (this.lastAbilityUse || (this.lastAbilityUse = {}))[a.id] = this.world.time;
    this.cooldowns[a.id] = a.cooldown;
    this.setState('ability');
    this.seq = seq;
  }

  // Quanto de VIDA vai custar um ritual/especial: 0 = paga com sanidade; −1 = não dá (já avisou).
  // Preço de Sangue (Arthur, cânone: a Arma de Sangue gasta PV): o que faltar de sanidade sai da vida.
  bloodPrice(cost) {
    if (this.energy >= cost) return 0;
    const P = (this.def.passives || []).find((p) => p.type === 'bloodPrice');
    if (!P) { this.notify('SEM SANIDADE'); return -1; }
    const hp = Math.ceil((cost - this.energy) * (P.hpPerPoint ?? 2));
    if (this.health - hp < this.maxHealth * (P.minHealth ?? 0.15)) { this.notify('SEM SANIDADE (NEM SANGUE)'); return -1; }
    return hp;
  }

  payCost(cost, blood) {
    if (!blood) { this.spendEnergy(cost); return; }
    this.energy = 0;
    this.health -= blood;
    this.world.fx.burst(this.chestPos(), { count: 26, color: 0xb01020, speed: 3, life: 0.5, size: 0.16, gravity: 7 });
    this.notify(`PAGOU COM SANGUE −${blood}`, true);
  }

  // ------------------------------------------------ especial
  trySpecial() {
    const sp = this.def.special;
    if (!sp) {
      this.notify('ESPECIAL INDISPONÍVEL');
      return;
    }
    if (this.specialUsedUp()) {
      this.notify('ESPECIAL JÁ USADO NESTA PARTIDA');
      return;
    }
    if (this.cooldowns.special > 0) {
      this.notify('ESPECIAL RECARREGANDO');
      return;
    }
    const spBlood = this.bloodPrice(this.specialCost());
    if (spBlood < 0) return;
    // especiais que exigem a sanidade alta (Pacto do Santo: acima de 85%)
    if (sp.minEnergy && this.energy < sp.minEnergy * this.maxEnergy) {
      this.notify(`PRECISA DE ${Math.round(sp.minEnergy * 100)}% DE SANIDADE`);
      return;
    }
    const impl = SPECIALS[sp.type];
    if (!impl) return;
    if (impl.canStart && !impl.canStart(this, sp, this.world)) {
      this.notify(impl.blockMsg || 'ALVO FORA DE ALCANCE');
      return;
    }
    this.payCost(this.specialCost(), spBlood);
    this.specialUses++;
    this.cooldowns.special = this.cooldownMax.special;
    this.vel.set(0, this.vel.y, 0);
    // PREPARO: concentra a energia (vulnerável); se não for atingido, o especial começa de verdade
    const S = COMBAT.specialStartup;
    const w = this.world;
    this.setState('specialStart');
    this.anim.play('charge', { restart: true, blend: 0.05 });
    const col = this.def.energyColor ?? 0xffffff;
    w.fx.ring(new THREE.Vector3(this.pos.x, 0.06, this.pos.z), { color: col, radius: 2.2, life: S.time + 0.1 });
    const aura = w.fx.emitter({ rate: 70, follow: () => this.chestPos(), particle: { color: col, speed: 2, spread: 0.6, up: 1, life: 0.35, size: 0.2 } });
    w.audio.play('carga', { pitch: 1.4 });
    this.pendingSpecial = { impl, sp, t: 0, aura };
    w.onBattleDialogue && w.onBattleDialogue(this, 'special');
  }

  updateSpecialStart(dt) {
    const p = this.pendingSpecial;
    if (!p) { this.setState('idle'); return; }
    p.t += dt;
    const opp = this.opponent;
    if (opp) this.yaw = turnTowards(this.yaw, yawTo(this.pos, opp.pos), dt * 10);
    this.vel.x = 0;
    this.vel.z = 0;
    if (p.t < COMBAT.specialStartup.time) return;
    // AVISO (especiais que acertam à distância): gesto + sigilo no alvo antes de conectar — dá para esquivar/defender
    if (!p.tg) {
      p.aura.stop();
      const cfg = telegraphFor(p.impl, this, p.sp);
      if (cfg) {
        p.tg = startTelegraph(this, cfg);
        return;
      }
    } else {
      updateTelegraph(this, p.tg, dt);
      if (p.tg.t < p.tg.cfg.time) return;
      stopTelegraph(p.tg);
      const miss = telegraphMissed(this, p.impl, p.sp);
      if (miss) {
        this.whiffSpecial(miss);
        return;
      }
    }
    this.pendingSpecial = null;
    this.setState('special');
    this.seq = p.impl.start(this, p.sp, this.world);
  }

  // o especial avisado não conectou: quem usou fica parado e aberto (recarga e sanidade já gastas)
  whiffSpecial(reason) {
    const opp = this.opponent;
    this.pendingSpecial = null;
    this.notify('ERROU', true);
    if (opp && reason === 'evaded') opp.notify('DESVIOU!', true);
    this.world.fx.burst(this.chestPos(), { count: 18, color: 0x8a8090, kind: 'smoke', speed: 2, life: 0.5, size: 0.35 });
    this.stun(TELEGRAPH.missRecovery, 'breath');
    this.whiffRecovery = true; // errar o especial não se cancela com a Substituição
  }

  // golpe recebido durante o preparo: o especial é cancelado
  interruptSpecial() {
    const p = this.pendingSpecial;
    if (!p) return;
    p.aura.stop();
    stopTelegraph(p.tg);
    this.pendingSpecial = null;
    this.cooldowns.special = Math.min(this.cooldowns.special, COMBAT.specialStartup.interruptedCooldown);
    this.notify('ESPECIAL INTERROMPIDO!', true);
    this.world.fx.burst(this.chestPos(), { count: 24, color: 0x8a8090, kind: 'smoke', speed: 3, life: 0.5, size: 0.4 });
  }

  // ------------------------------------------------ dano recebido
  updateHitstun(dt) {
    // SUBSTITUIÇÃO: L2 enquanto apanha gasta carga de esquiva e desvia com um passo curto para o lado
    if (this.input.pressed.dodge && this.trySubstitution()) return;
    if (this.onGround) {
      const f = Math.exp(-dt * 6);
      this.vel.x *= f;
      this.vel.z *= f;
    }
    // lançado e tocou o chão: fica caído (invulnerável) e pode levantar rolando
    if (this.launched && this.onGround && this.stateTime > 0.12 && this.vel.y <= 0) {
      this.startDowned();
      return;
    }
    if (this.stateTime >= this.hitstun && this.onGround) {
      this.setState('idle');
      this.launched = false;
    }
  }

  // ------------------------------------------------ queda e recuperação
  startDowned() {
    this.launched = false;
    this.setState('downed');
    this.downed = { tech: null, getup: false };
    this.vel.x *= 0.3;
    this.vel.z *= 0.3;
    this.anim.play('downed', { restart: true });
    this.world.fx.burst(new THREE.Vector3(this.pos.x, 0.15, this.pos.z), { count: 10, color: 0x8a8090, kind: 'smoke', speed: 1.5, life: 0.5, size: 0.5 });
  }

  updateDowned(dt) {
    const D = COMBAT.down;
    const d = this.downed || (this.downed = {});
    const f = Math.exp(-dt * 8);
    this.vel.x *= f;
    this.vel.z *= f;
    const inp = this.input;
    if (d.tech) {
      // rolamento: deslocamento físico real, invulnerável
      const k = this.stateTime - d.tech.t0;
      this.vel.x = d.tech.dir.x * (D.techDistance / D.techTime);
      this.vel.z = d.tech.dir.z * (D.techDistance / D.techTime);
      if (k >= D.techTime) {
        this.vel.x = 0;
        this.vel.z = 0;
        this.downed = null;
        this.invuln = Math.max(this.invuln, 0.15);
        this.setState('idle');
      }
      return;
    }
    if (d.getup) {
      if (this.stateTime >= d.getup) {
        this.downed = null;
        this.invuln = Math.max(this.invuln, COMBAT.wakeupInvuln);
        this.setState('idle');
      }
      return;
    }
    // levantar rápido: × ou L2 (+ direção) logo depois de cair
    if (this.stateTime >= D.techFrom && this.stateTime <= D.techUntil && (inp.pressed.jump || inp.pressed.dodge)) {
      let dir = this.moveInputWorld(new THREE.Vector3());
      const opp = this.opponent;
      if (dir.length() < 0.3) dir = opp ? new THREE.Vector3().subVectors(this.pos, opp.pos).setY(0) : forwardFromYaw(this.yaw).negate();
      dir.setY(0).normalize();
      d.tech = { dir, t0: this.stateTime };
      this.anim.play('tech_roll', { restart: true, duration: D.techTime });
      this.world.audio.play('jump', { volume: 0.5 });
      return;
    }
    if (this.stateTime >= D.lie) {
      d.getup = this.stateTime + D.getup;
      this.anim.play('getup', { restart: true, duration: D.getup });
    }
  }

  // free: desvio que não gasta esquiva nem recarga (Percepção Anacrônica do Anfitrião)
  trySubstitution({ free = false, label = 'SUBSTITUIÇÃO!' } = {}) {
    const S = COMBAT.substitution;
    if (this.world.cinematic) return false;
    if (!free && this.cooldowns.substitution > 0) return false;
    if (!free && this.dodges < S.charges) {
      this.notify('SEM ESQUIVAS');
      return false;
    }
    const opp = this.opponent;
    if (!opp) return false;
    // lado do desvio: o que o direcional aponta (esquerda/direita em relação ao atacante); sem direcional, o lado livre
    const stick = this.moveInputWorld(new THREE.Vector3());
    const away = new THREE.Vector3().subVectors(this.pos, opp.pos).setY(0).normalize();
    const lateral = stick.x * -away.z + stick.z * away.x;
    const spot = findSubstitutionSpot(this.world.arena, this.pos, opp.pos, {
      sidestep: S.sidestep,
      back: S.back,
      radius: this.radius,
      attackerRadius: opp.radius,
      side: Math.abs(lateral) > 0.3 ? Math.sign(lateral) : 0,
    });
    if (!free) {
      this.spendDodges(S.charges);
      this.cooldowns.substitution = S.cooldown;
    }
    this.lastEvadeAt = this.world.inputTime;
    this.buffered = null; // o L2 da substituição não vira uma esquiva logo depois
    const col = ELEMENTS[this.def.element] ? new THREE.Color(ELEMENTS[this.def.element].color).getHex() : this.def.energyColor;
    const from = this.chestPos();
    // "tronco": nuvem no lugar onde estava + faíscas do elemento
    this.world.fx.play('FX_TELEPORT', from, { color: col, kind: 'smoke' });
    this.world.audio.play('teleport', { volume: 0.8 });
    this.pos.set(spot.x, 0, spot.z);
    this.vel.set(0, 0, 0);
    this.onGround = true;
    this.launched = false;
    this.yaw = yawTo(this.pos, opp.pos);
    this.invuln = S.iframes;
    this.comboHits = 0;
    this.comboLaunches = 0;
    this.setState('idle');
    this.anim.play('idle', { restart: true, blend: 0.03 });
    this.world.fx.burst(this.chestPos(), { count: 18, color: col, speed: 4, life: 0.3, size: 0.18 });
    this.notify(label, true);
    if (!hasPassive(opp, 'precognition')) opp.surprised = 0.25;
    // o atacante bate no "tronco": a sequência dele acaba aqui (não emenda o próximo golpe) e fica exposto
    if (opp.state === 'attack') opp.combo.blocked = true;
    opp.airCombo = null;
    return true;
  }

  // ------------------------------------------------ Transformação (Barra de Transformação cheia + vida baixa)
  // As transformações (Diabo, Fantasma, Deus da Morte) saíram do especial: o kit traz `awakening` com a cinemática de
  // transformação (mesmos tipos de especial: devilPact, ghostBands, santoPact) e ela só fica disponível assim.
  canTransform() {
    const aw = this.def.awakening;
    if (!aw || this.baseForm || this.health <= 0) return false;
    return this.storm >= 100 && (this.health <= this.maxHealth * COMBAT.storm.healthRatio || this.trainingAwaken);
  }

  startAwakening() {
    const aw = this.def.awakening;
    const impl = SPECIALS[aw.type];
    this.overcharge = 0;
    if (!impl || (impl.canStart && !impl.canStart(this, aw, this.world))) {
      this.notify(impl?.blockMsg || 'NÃO DÁ PARA TRANSFORMAR AGORA');
      return;
    }
    this.storm = 0;
    this.carga = { stage: 0, timer: 0 };
    this.vel.set(0, this.vel.y, 0);
    this.world.screenFlash && this.world.screenFlash('#ffffff', 0.12);
    this.setState('special');
    this.seq = impl.start(this, aw, this.world);
  }

  updatePulled(dt) {
    const p = this.pull;
    const k = Math.min(1, this.stateTime / p.time);
    this.pos.x = p.from.x + (p.to.x - p.from.x) * k;
    this.pos.z = p.from.z + (p.to.z - p.from.z) * k;
    this.vel.set(0, 0, 0);
    if (k >= 1) {
      // janela para continuar o combo
      this.setState('hitstun');
      this.hitstun = p.after;
      this.anim.play('hit', { restart: true });
    }
  }

  // ------------------------------------------------ física
  integrate(dt) {
    if (this.state === 'grabbed') return;
    if (this.state === 'pulled') {
      resolveBody(this.world.arena, this.pos, this.radius);
      return;
    }
    if ((!this.onGround || this.vel.y > 0) && this.state !== 'dashing') {
      // combo aéreo: atacante e alvo flutuam (gravidade menor) enquanto o malabarismo dura
      let gmul = 1;
      // (só na descida: a subida é normal, senão os dois sobem demais)
      if (this.airCombo && this.state === 'attack' && this.vel.y < 0) gmul = 0.3;
      if (this.juggleT > 0) { this.juggleT -= dt; if (this.vel.y < 0) gmul = 0.4; }
      this.vel.y -= COMBAT.gravity * gmul * dt;
    }
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;
    if (this.pos.y <= 0) {
      if (!this.onGround) {
        this.world.audio.play('land', { volume: 0.6 });
        if (this.state === 'idle') this.anim.play('idle', { blend: 0.1 });
      }
      this.pos.y = 0;
      this.vel.y = 0;
      this.onGround = true;
      this.airCombo = null;
    } else {
      this.onGround = false;
    }
    if (this.state === 'ko') {
      const f = Math.exp(-dt * 4);
      this.vel.x *= f;
      this.vel.z *= f;
    }
    resolveBody(this.world.arena, this.pos, this.radius);
    // fim dos efeitos de corrente dos golpes
    if (this.strikeFx && this.strikeFx.length) {
      for (let i = this.strikeFx.length - 1; i >= 0; i--) {
        if (this.state !== 'attack' || this.stateTime > this.strikeFx[i].until) {
          this.strikeFx[i].h.stop();
          this.strikeFx.splice(i, 1);
        }
      }
    }
  }
}
