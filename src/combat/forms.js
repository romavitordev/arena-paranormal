import { buildModel } from '../models/index.js';
import { poolAt } from './bloodPools.js';
import { getForm } from '../characters/forms/index.js';

// FORMAS (transformações no meio da luta): Ferreiro → Deus da Morte, Juan → Diabo, Kemi → Fantasma.
// Uma forma é uma definição de personagem completa (modelo, golpes, habilidades, especial) que NÃO aparece na
// seleção (src/characters/forms). O lutador troca de modelo e de kit mantendo posição, placar e (por padrão) vida.
// No fim do round tudo volta para a forma base.
//
// Campos opcionais de uma forma:
//   stats.size        tamanho do corpo (2 = o dobro): raio, altura do peito e área de acerto acompanham
//   stats.maxHealth   vida máxima na forma (o chefe tem barra própria)
//   boss              mostra a barra de vida preta no centro da tela
//   weakTo            { fire, energia }: multiplicadores de dano recebido (fraquezas)
//   regen             { every, amount }: regenera vida de tempo em tempo
//   formDuration      segundos até voltar sozinho para a forma anterior

export function transform(f, formId, o = {}) {
  const def = typeof formId === 'string' ? getForm(formId) : formId;
  if (!def) throw new Error(`Forma desconhecida: ${formId}`);
  const w = f.world;
  if (!f.baseForm) f.baseForm = { def: f.def, rig: f.rig, maxHealth: f.maxHealth };
  const prevRatio = f.health / f.maxHealth;
  const rig = buildModel(def.model);
  w.scene.remove(f.rig.root);
  f.applyDef(def, rig);
  // vida: mantém a proporção, ou o valor pedido pela transformação
  const maxH = def.stats?.maxHealth ?? f.baseForm.maxHealth;
  f.maxHealth = maxH;
  f.health = o.health != null ? Math.min(maxH, o.health) : Math.max(1, Math.round(maxH * prevRatio));
  const dur = o.duration ?? def.formDuration;
  f.form = { id: def.id, since: w.time, until: dur ? w.time + dur : Infinity, prev: o.prev || null, onEnd: o.onEnd || null, bonus: o.bonusHealth || 0 };
  f.regenClock = 0;
  w.fx.play('FX_TELEPORT', f.chestPos(), { color: def.energyColor ?? 0xffffff, kind: 'ring' });
  if (o.banner) w.showBanner(o.banner, def.color);
  w.onTransform && w.onTransform(f, def);
  return f;
}

// volta para a forma base (fim do round, fim do tempo da forma)
export function revertForm(f, { keepHealth = true } = {}) {
  const base = f.baseForm;
  if (!base) return;
  const ratio = f.health / f.maxHealth;
  const bonus = f.form && f.form.bonus;
  const hp = f.health;
  f.world.scene.remove(f.rig.root);
  f.applyDef(base.def, base.rig);
  f.maxHealth = base.maxHealth;
  if (!keepHealth) f.health = base.maxHealth;
  // forma que deu vida extra (Pacto do Hexatombe): ao voltar, a vida extra que sobrou se perde (mínimo de 15%)
  else if (bonus) f.health = Math.min(base.maxHealth, Math.max(Math.round(base.maxHealth * 0.15), hp - bonus));
  else f.health = Math.max(1, Math.round(base.maxHealth * Math.min(1, ratio)));
  f.baseForm = null;
  f.form = null;
  // o HUD volta para o nome e as habilidades da forma base (antes ficava o nome da forma)
  f.world.onTransform && f.world.onTransform(f, base.def);
}

// Chamado a cada quadro pelo Fighter: tempo de forma, regeneração e gatilhos da forma
export function updateForm(f, dt) {
  const def = f.def;
  const w = f.world;
  if (f.state === 'ko' || w.cinematic) return;
  // regeneração de tempo em tempo (ex.: Deus da Morte)
  if (def.regen) {
    // ferido (low): regenera mais e mais rápido; em cima das próprias poças de sangue (onPool) o relógio corre mais
    const R = def.regen.low && f.health <= f.maxHealth * def.regen.low.below ? { ...def.regen, ...def.regen.low } : def.regen;
    const fast = def.regen.onPool && poolAt(w, f, f.pos.x, f.pos.z) ? def.regen.onPool : 1;
    f.regenClock = (f.regenClock || 0) + dt * fast;
    if (f.regenClock >= R.every) {
      f.regenClock = 0;
      const before = f.health;
      f.health = Math.min(f.maxHealth, f.health + R.amount);
      if (f.health > before) {
        w.fx.burst(f.chestPos(), { count: 24, color: def.regen.color ?? 0x2a2632, kind: 'smoke', speed: 1.5, up: 1, life: 0.8, size: 0.7, grow: 1 });
        f.notify(`REGENERAÇÃO +${Math.round(f.health - before)}`, true);
      }
    }
  }
  // forma com tempo: volta sozinha (Diabo do Juan)
  if (f.form && w.time >= f.form.until && ['idle', 'block', 'charging', 'dashing'].includes(f.state)) {
    const cb = f.form.onEnd;
    revertForm(f);
    w.fx.burst(f.chestPos(), { count: 30, color: 0x7a0010, kind: 'smoke', speed: 2, life: 0.7, size: 0.7, grow: 1 });
    f.notify('A FORMA SE DESFEZ', true);
    cb && cb(f);
  }
}

// multiplicador de fraquezas da forma (fogo, Energia)
export function weaknessMult(victim, attacker, o) {
  const W = victim.def.weakTo;
  if (!W) return 1;
  // vale a MAIOR fraqueza (uma explosão de quem é de Energia não conta duas vezes)
  let m = 1;
  if (W.fire && o.fire) m = Math.max(m, W.fire);
  const energy = o.element ? o.element === 'energia' : attacker.def.element === 'energia' && o.kind !== 'melee';
  if (W.energia && energy) m = Math.max(m, W.energia);
  return m;
}
