import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose, orbit } from '../../camera/shots.js';
import { createMistZone } from '../abilities.js';

// Especial "Cinerária" (Cineraria): névoa paranormal que envolve a personagem e
// altera o ambiente ao redor. NÃO causa dano direto. Durante o efeito:
//  - bônus de dano moderado nos ataques (damageBonus)
//  - esquiva melhor: mais invulnerabilidade e menos cooldown (evasion)
//  - leitura visual difícil: corpo parcialmente translúcido (opacity)
//  - área paranormal que segue a Cineraria (area): inimigos dentro ficam mais
//    lentos, não regeneram energia e projéteis inimigos perdem velocidade
export const mistField = {
  canStart: () => true,
  start(f, sp, world) {
    world.beginCinematic(f, null);
    const tl = new Timeline();
    const mouth = () => f.rig.sockets.mouth.getWorldPosition(new THREE.Vector3());
    const fwd = () => new THREE.Vector3(Math.sin(f.yaw), 0.1, Math.cos(f.yaw));
    const color = sp.color;
    f.vel.set(0, 0, 0);
    f.anim.play('powerup', { restart: true, duration: 1.8 });
    world.cameraRig.playShots([
      faceClose(f, { dur: 1.15, from: 2.0, to: 1.0, side: 0.25 }),
      orbit(f, { dur: 1.0, radius: 4.2, height: 1.6, a0: 0.5, a1: -0.6, lookH: 1.0 }),
    ]);

    // 1: acende / prepara (faísca na boca)
    world.fx.flash(mouth(), { color: 0xffa040, size: 0.5, life: 0.25 });
    world.fx.burst(mouth(), { count: 8, color: 0xffa040, speed: 1.5, life: 0.3, size: 0.08 });
    world.audio.play('smoke');
    // 2: névoa roxa saindo da boca
    let mouthSmoke = null;
    tl.add(0.25, () => {
      mouthSmoke = world.fx.emitter({
        rate: 80, follow: mouth,
        particle: { color, kind: 'smoke', speed: 1.4, spread: 0.3, life: 1.2, size: 0.35, grow: 2.8, drag: 1.2, dir: fwd(), up: 0.3 },
      });
    });
    // 3: a névoa se espalha ao redor (anel que cresce)
    let spread = null;
    tl.add(0.75, () => {
      let r = 0.5;
      spread = world.fx.emitter({
        rate: 90,
        follow: () => {
          r = Math.min(sp.area, r + 0.06);
          const a = Math.random() * Math.PI * 2;
          return new THREE.Vector3(f.pos.x + Math.sin(a) * r, 0.2 + Math.random() * 0.8, f.pos.z + Math.cos(a) * r);
        },
        particle: { color, kind: 'smoke', speed: 0.5, spread: 0.4, up: 0.3, life: 1.3, size: 0.9, grow: 1 },
      });
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color, radius: sp.area, life: 1.0, opacity: 0.6 });
    });
    // 6: nome na tela
    tl.add(1.05, () => {
      world.showBanner(sp.banner || f.def.name, f.def.color);
      world.audio.play('powerUp');
    });
    // efeito ativado
    tl.add(1.85, () => {
      mouthSmoke && mouthSmoke.stop();
      spread && spread.stop();
      activate(f, sp, world);
    });
    tl.add(2.05, () => world.endCinematic());
    tl.end(2.1);
    return {
      update: (dt) => tl.update(dt),
      cancel: () => { mouthSmoke && mouthSmoke.stop(); spread && spread.stop(); world.endCinematic(); },
    };
  },
};

function activate(f, sp, world) {
  const zone = createMistZone(world, f, {
    center: () => f.pos,
    radius: sp.area,
    slow: sp.enemySlow,
    enemyRegen: sp.enemyRegen,
    projectileSlow: sp.projectileSlow,
    color: sp.color,
    density: sp.smokeIntensity,
  });
  // 4: personagem parcialmente envolvida pela fumaça
  const wrap = world.fx.emitter({
    rate: 30 * sp.smokeIntensity,
    follow: () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 0.8, f.pos.y + 0.2 + Math.random() * 1.6, f.pos.z + (Math.random() - 0.5) * 0.8),
    particle: { color: sp.color, kind: 'smoke', speed: 0.6, up: 1.0, spread: 0.3, life: 0.9, size: 0.5, grow: 1.2 },
  });
  const mouth = world.fx.emitter({
    rate: 8, follow: () => f.rig.sockets.mouth.getWorldPosition(new THREE.Vector3()),
    particle: { color: sp.color, kind: 'smoke', speed: 0.4, up: 0.8, spread: 0.2, life: 0.8, size: 0.25, grow: 1.5 },
  });
  f.buffTint = { color: sp.color, base: 0.16 };
  f.addBuff({
    type: 'mist',
    name: 'CINERÁRIA',
    mult: sp.damageBonus,
    affects: sp.affects || ['melee', 'ranged', 'ability'],
    dodge: sp.evasion,
    opacity: sp.opacity,
    time: sp.duration,
    duration: sp.duration,
    onEnd() {
      zone.end();
      wrap.stop();
      mouth.stop();
      f.buffTint = null;
      world.fx.burst(f.chestPos(), { count: 30, color: sp.color, kind: 'smoke', speed: 2, life: 0.8, size: 0.6, grow: 1 });
    },
  });
}
