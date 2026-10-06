import * as THREE from 'three';

// AVISO dos especiais que acertam à distância (Descarnar, Labirinto, tiros de sniper, Supernova, Shi no Kage,
// Cinerária com a Acácia): depois do preparo, quem usa fica PARADO e VULNERÁVEL fazendo o gesto (braço erguido, mira,
// postura) enquanto um sigilo pulsa no chão debaixo do alvo (ou a mira brilha nele). Só no fim do aviso o especial
// "conecta" e a cinemática começa:
//   - o alvo esquivou / usou a Substituição no fim do aviso (ou ainda está invulnerável) → ERROU, quem usou fica exposto;
//   - o alvo saiu do alcance / sumiu → ERROU;
//   - defendendo de frente → o próprio especial já trata (trySpecialBlock);
//   - acertar quem está no aviso interrompe o especial (como no preparo).
// Cada tipo de especial define `telegraph(f, sp)` → { time, anim, mark: 'sigil' | 'laser' } (ou null = sem aviso);
// o personagem pode sobrescrever com `special.telegraph` (objeto, ou false para desligar).

export const TELEGRAPH = {
  evadeWindow: 0.45, // esquiva/substituição nesse tempo antes do fim do aviso desvia
  missRecovery: 0.6, // quem errou fica parado e aberto
};

export function telegraphFor(impl, f, sp) {
  if (sp.telegraph === false) return null;
  const base = impl.telegraph ? impl.telegraph(f, sp) : null;
  if (!base) return null;
  return typeof sp.telegraph === 'object' ? { ...base, ...sp.telegraph } : base;
}

export function startTelegraph(f, cfg) {
  const w = f.world;
  if (cfg.anim) f.anim.play(cfg.anim, { restart: true, blend: 0.08, duration: cfg.animDuration });
  const col = cfg.color ?? f.def.special.color ?? f.def.energyColor ?? 0xffffff;
  const hand = () => (f.rig.sockets.handR ? f.rig.sockets.handR.getWorldPosition(new THREE.Vector3()) : f.chestPos());
  const aura = w.fx.emitter({ rate: 60, follow: hand, particle: { color: col, speed: 1.4, spread: 0.5, up: 0.8, life: 0.35, size: 0.18 } });
  w.audio.play('heartbeat', { volume: 0.8 });
  return { cfg, t: 0, pulse: 0, col, aura, hand };
}

// um quadro do aviso: o sigilo/mira acompanha o alvo
export function updateTelegraph(f, tg, dt) {
  const w = f.world;
  const opp = f.opponent;
  tg.t += dt;
  tg.pulse -= dt;
  if (!opp) return;
  const left = Math.max(0, tg.cfg.time - tg.t);
  if (tg.cfg.mark === 'laser') {
    // mira fina que treme e engrossa até o disparo
    if (Math.random() < 0.7) w.fx.tracer(tg.hand(), opp.chestPos(), { color: tg.col, life: 0.05, width: 0.006 + (1 - left / tg.cfg.time) * 0.02 });
  }
  if (tg.pulse <= 0) {
    // sigilo pulsando no chão do alvo, cada vez mais rápido
    tg.pulse = 0.08 + 0.17 * (left / tg.cfg.time);
    w.fx.ring(new THREE.Vector3(opp.pos.x, 0.07, opp.pos.z), { color: tg.col, radius: 1.5, life: 0.3, inner: 0.82 });
  }
}

export function stopTelegraph(tg) {
  if (tg && tg.aura) tg.aura.stop();
}

// fim do aviso: o alvo escapou?
export function telegraphMissed(f, impl, sp) {
  const opp = f.opponent;
  if (!opp || opp.state === 'ko') return 'gone';
  if (impl.canStart && !impl.canStart(f, sp, f.world)) return 'range';
  const recent = opp.lastEvadeAt !== undefined && f.world.inputTime - opp.lastEvadeAt <= TELEGRAPH.evadeWindow;
  if (opp.state === 'dodge' || opp.invuln > 0 || recent) return 'evaded';
  return null;
}
