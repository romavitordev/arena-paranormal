import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose, orbit } from '../../camera/shots.js';

// REESCREVER A REALIDADE (A Magistrada — habilidade canônica, wiki "A Magistrada": "pode reescrever a Realidade
// completamente, alterar o estado, posição e composição de objetos e seres... e também recuperar completamente o
// corpo e mente de uma pessoa"). Ocupa a Barra de Transformação dela, mas NÃO é uma transformação (pedido de
// 2026-10-27: a Magistrada não se transforma no cânone): uma cena curta e a Realidade é reescrita —
//   o corpo e a mente dela voltam (sp.heal da vida, a sanidade cheia, sem nada de ruim em cima: sangramento, cegueira,
//   abalo, lentidão...) e as recargas zeram; no adversário, tudo o que o fortalecia some (buffs de dano, defesa,
//   velocidade e armadura — a forma/transformação continua, isso não é um buff).
const BAD = new Set(['bleed', 'blind', 'deaf', 'shaken', 'projSlow', 'impaled', 'mindLinked', 'mindRead', 'hypno', 'mindControl', 'enraged', 'provoked', 'cursedBlood']);
const isBad = (b) => BAD.has(b.type) || (b.mult !== undefined && b.mult < 1) || (b.takenMult !== undefined && b.takenMult > 1) || (b.speedMult !== undefined && b.speedMult < 1);
const isGood = (b) => b.type !== 'awakened' && !BAD.has(b.type) && ((b.mult !== undefined && b.mult > 1) || (b.takenMult !== undefined && b.takenMult < 1) || (b.speedMult !== undefined && b.speedMult > 1) || b.armor > 0 || b.shield > 0);

function strip(f, test) {
  let n = 0;
  for (let i = f.buffs.length - 1; i >= 0; i--) {
    const b = f.buffs[i];
    if (!test(b)) continue;
    b.onEnd && b.onEnd();
    f.buffs.splice(i, 1);
    n++;
  }
  return n;
}

export const realityRewrite = {
  canStart: () => true,
  start(f, sp, world) {
    const tl = new Timeline();
    const col = sp.color ?? f.def.energyColor ?? 0xe0b84a;
    const opp = f.opponent;
    world.beginCinematic(f, null);
    f.vel.set(0, 0, 0);
    f.anim.play(sp.anim || 'charge', { restart: true, duration: 1.3 });
    world.cameraRig.playShots([
      faceClose(f, { dur: 0.7, from: 2.0, to: 1.3, side: -0.35 }),
      orbit(f, { dur: 0.7, radius: 4.4, height: 1.7, a0: 0.5, a1: -0.5, lookH: 1.1 }),
    ]);
    world.audio.play('ritual', { volume: 0.9, pitch: 0.8 });
    const runes = world.fx.runes(() => f.chestPos(), { color: col, count: 8, radius: 1.1, size: 0.28 });
    tl.add(0.3, () => world.showBanner(sp.banner || sp.name, f.def.color));
    tl.add(0.95, () => {
      // a Realidade é reescrita: o mundo "pisca" e os Sigilos se espalham
      world.screenFlash && world.screenFlash('#fff4d0', 0.1);
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: col, radius: 6, life: 0.8 });
      world.fx.distort(f.chestPos(), { color: col, radius: 4, life: 0.6 });
      world.fx.burst(f.chestPos(), { count: 60, color: col, speed: 7, life: 0.7, size: 0.22 });
      world.audio.play('armed');
      // o corpo e a mente dela
      f.health = Math.min(f.maxHealth, f.health + f.maxHealth * (sp.heal ?? 0.3));
      f.energy = f.maxEnergy;
      const cured = strip(f, isBad);
      for (const k in f.cooldowns) if (k !== 'special') f.cooldowns[k] = 0;
      // o estado do adversário
      let erased = 0;
      if (opp && opp.state !== 'ko') {
        erased = strip(opp, isGood);
        opp.armorHits = 0;
        world.fx.ring(opp.chestPos(), { color: col, radius: 1.6, life: 0.5, vertical: true, yaw: f.yaw });
        opp.notify(erased ? 'A REALIDADE FOI REESCRITA: SEUS PODERES SUMIRAM' : 'A REALIDADE FOI REESCRITA', true);
      }
      f.notify(`REALIDADE REESCRITA${cured ? ' · CURADA' : ''}`, true);
    });
    tl.add(1.3, () => {});
    tl.end(1.3);
    const finish = () => { runes.stop(); world.endCinematic(); };
    return {
      update: (dt) => {
        const done = tl.update(dt);
        if (done) finish();
        return done;
      },
      cancel: finish,
    };
  },
};
