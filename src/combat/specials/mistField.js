import * as THREE from 'three';
import { Timeline } from '../../core/util.js';
import { faceClose, orbit } from '../../camera/shots.js';
import { createMistZone } from '../abilities.js';
import { applyHit } from '../damage.js';
import { splitDamage } from './common.js';
import { COMBAT } from '../../config/combat.js';
import { yawTo, forwardFromYaw } from '../../core/util.js';

// Especial "Cinerária" (Kaiser): solta a névoa Cinerária e, dentro dela, conjura a ACÁCIA
// amplificada pela névoa (é a Acácia que causa o dano; o letreiro continua "Cinerária").
// Depois, a névoa fica PARADA no mapa onde foi solta por um tempo. Enquanto o Kaiser estiver dentro:
//  - bônus de dano moderado nos ataques (damageBonus)
//  - esquiva melhor: mais invulnerabilidade e menos cooldown (evasion)
//  - leitura visual difícil: corpo parcialmente translúcido (opacity)
//  - área paranormal fixa no chão (area): inimigos dentro ficam mais
//    lentos, não regeneram energia e projéteis inimigos perdem velocidade
export const mistField = {
  canStart: () => true,
  start(f, sp, world) {
    // com flowerStorm: dentro da névoa ele amplifica a Acácia sobre o inimigo (o especial passa a causar dano)
    const opp = f.opponent;
    const storm = sp.flowerStorm && opp && opp.state !== 'ko' ? sp.flowerStorm : null;
    world.beginCinematic(f, storm ? opp : null);
    if (storm) f.yaw = yawTo(f.pos, opp.pos);
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
    // TEMPESTADE DE ACÁCIA: flores roxas caem sobre o inimigo, cada vez mais rápidas; a última explode
    let rain = null;
    let tEnd = 1.85;
    if (storm) {
      const total = sp.damage ?? COMBAT.specialDamage;
      const parts = splitDamage(total, storm.shares);
      const t0 = 1.35;
      tl.add(t0 - 0.2, () => {
        f.anim.play('cast_up', { restart: true, duration: 0.6 });
        world.cameraRig.playShots([orbit(opp, { dur: 1.6, radius: 4.5, height: 2.2, a0: -0.7, a1: 0.7, lookH: 1.0, fov: 50 })]);
        world.audio.play('rebirth', { volume: 0.7, pitch: 1.3 });
        f.notify('ACÁCIA (CINERÁRIA)');
      });
      tl.add(t0, () => {
        const c = opp.pos.clone();
        rain = world.fx.emitter({
          rate: 220,
          follow: () => { const a = Math.random() * Math.PI * 2; const r = Math.sqrt(Math.random()) * 2.2; return new THREE.Vector3(c.x + Math.sin(a) * r, 4.5 + Math.random() * 2, c.z + Math.cos(a) * r); },
          particle: { color, speed: 0.4, up: -7, spread: 0.3, life: 0.9, size: 0.2, gravity: 3 },
        });
        opp.anim.play('hit', { restart: true });
      });
      storm.shares.forEach((_, i) => {
        const last = i === storm.shares.length - 1;
        tl.add(t0 + 0.15 + i * storm.interval, () => {
          applyHit(world, f, opp, { damage: parts[i], kind: 'special', reaction: false, ignoreInvuln: true, color, sound: 'clawHit', scale: last ? 2.2 : 0.9 });
          world.fx.burst(opp.chestPos(), { count: last ? 70 : 14, color, speed: last ? 10 : 4, life: 0.6, size: last ? 0.3 : 0.18 });
          if (last) {
            world.fx.flash(opp.chestPos(), { color, size: 6, life: 0.3 });
            world.fx.ring(new THREE.Vector3(opp.pos.x, 0.06, opp.pos.z), { color, radius: 4, life: 0.5 });
            world.cameraRig.shake(0.6, 0.35);
            if (opp.state !== 'ko') opp.anim.play('launched', { restart: true });
          } else if (opp.state !== 'ko') opp.anim.play('hit', { restart: true });
        });
      });
      tEnd = t0 + 0.4 + storm.shares.length * storm.interval;
    }
    // efeito ativado
    tl.add(tEnd, () => {
      mouthSmoke && mouthSmoke.stop();
      spread && spread.stop();
      rain && rain.stop();
      activate(f, sp, world);
    });
    tl.add(tEnd + 0.2, () => {
      world.endCinematic();
      if (storm && opp.state !== 'ko') opp.react({ dir: forwardFromYaw(yawTo(f.pos, opp.pos)), knockback: 4, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
    });
    tl.end(tEnd + 0.25);
    return {
      update: (dt) => tl.update(dt),
      cancel: () => { mouthSmoke && mouthSmoke.stop(); spread && spread.stop(); rain && rain.stop(); world.endCinematic(); },
    };
  },
};

function activate(f, sp, world) {
  // a névoa fica no mapa onde foi solta (não acompanha o Kaiser)
  const center = new THREE.Vector3(f.pos.x, 0, f.pos.z);
  const inside = () => Math.hypot(f.pos.x - center.x, f.pos.z - center.z) <= sp.area;
  const zone = createMistZone(world, f, {
    center: () => center,
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
    follow: () => inside() && new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 0.8, f.pos.y + 0.2 + Math.random() * 1.6, f.pos.z + (Math.random() - 0.5) * 0.8),
    particle: { color: sp.color, kind: 'smoke', speed: 0.6, up: 1.0, spread: 0.3, life: 0.9, size: 0.5, grow: 1.2 },
  });
  const mouth = world.fx.emitter({
    rate: 8, follow: () => f.rig.sockets.mouth.getWorldPosition(new THREE.Vector3()),
    particle: { color: sp.color, kind: 'smoke', speed: 0.4, up: 0.8, spread: 0.2, life: 0.8, size: 0.25, grow: 1.5 },
  });
  f.buffTint = { color: sp.color, base: 0.16 };
  f.addBuff({
    when: inside, // bônus só valem dentro da névoa
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
