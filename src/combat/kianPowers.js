import * as THREE from 'three';
import { applyHit } from './damage.js';

// A ESCRITA (Kian — o Conhecimento escreve nos corpos dos "Marcados"): cada golpe dele deixa uma marca de escrita no
// adversário (passiva 'kianScript'); o Impacto Sigilar deixa duas, o soco do Teletransporte e cada pedra da Levitação
// uma. Com P.max marcas a escrita DETONA: dano de Conhecimento que não dá para defender e um atordoamento curto. As
// marcas somem se ele ficar P.time segundos sem marcar de novo. Enquanto marcado, a escrita brilha no corpo do alvo
// (mais forte a cada marca).
const GOLD = 0xffd27a;

export function scriptPassive(f) {
  return (f.def.passives || []).find((p) => p.type === 'kianScript') || null;
}

export function inscribe(world, attacker, victim, n = 1) {
  const P = scriptPassive(attacker);
  if (!P || !victim || victim.state === 'ko' || !victim.addBuff || n <= 0) return;
  let b = victim.findBuff('kianScript');
  if (!b) {
    const glow = world.fx.emitter({
      rate: 6,
      follow: () => victim.chestPos().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.4) * 0.9, (Math.random() - 0.5) * 0.6)),
      particle: { color: GOLD, speed: 0.15, spread: 0.05, life: 0.5, size: 0.09 },
    });
    b = { type: 'kianScript', name: 'ESCRITA', time: P.time ?? 5, duration: P.time ?? 5, stacks: 0, glow, onEnd() { glow.stop(); } };
    victim.addBuff(b);
  }
  b.stacks += n;
  b.time = P.time ?? 5;
  b.name = `ESCRITA ${Math.min(b.stacks, P.max)}/${P.max}`;
  b.glow.rate = 6 + b.stacks * 10;
  world.fx.ring(victim.chestPos(), { color: GOLD, radius: 0.6 + 0.12 * b.stacks, life: 0.25, vertical: true, yaw: attacker.yaw });
  if (b.stacks < P.max) return;
  // DETONA: a escrita acende inteira e rasga por dentro
  b.time = 0;
  const c = victim.chestPos();
  world.after(0.08, () => {
    if (victim.state === 'ko') return;
    world.fx.flash(c, { color: GOLD, size: 3, life: 0.2 });
    world.fx.burst(c, { count: 50, color: GOLD, speed: 6, life: 0.6, size: 0.16 });
    world.fx.distort(c, { color: GOLD, radius: 2, life: 0.35 });
    for (let i = 0; i < 3; i++) world.after(i * 0.06, () => world.fx.ring(c, { color: GOLD, radius: 0.8 + i * 0.6, life: 0.35, vertical: true, yaw: attacker.yaw + i * 0.7 }));
    world.audio.play('ritual', { volume: 0.9, pitch: 1.3 });
    world.cameraRig.shake(0.3, 0.2);
    const res = applyHit(world, attacker, victim, { damage: P.burst, kind: 'ability', element: 'conhecimento', unblockable: true, reaction: false, sound: 'heavyPunch', color: GOLD, scale: 1.4, strike: { damage: P.burst, noPassive: true } });
    if (typeof res === 'number' && victim.state !== 'ko' && P.stun) victim.stun(P.stun);
    victim.notify('A ESCRITA DETONOU', true);
  });
}
