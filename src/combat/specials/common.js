import * as THREE from 'three';
import { forwardFromYaw, angleDiff, yawTo } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';

// Divide o dano total em partes inteiras que somam EXATAMENTE o total.
export function splitDamage(total, shares) {
  const sum = shares.reduce((a, b) => a + b, 0) || 1;
  const parts = shares.map((s) => Math.floor((total * s) / sum));
  const rest = total - parts.reduce((a, b) => a + b, 0);
  parts[parts.length - 1] += rest;
  return parts;
}

// Efeito visual de um golpe de especial, por tipo.
export function specialHitFx(world, actor, target, fx = {}, color) {
  const c = target.chestPos();
  const yaw = actor.yaw;
  const big = !!fx.big;
  switch (fx.kind) {
    case 'slash':
      world.fx.slash(c, yaw, { color, radius: fx.radius || 1.7, tilt: fx.tilt || 0, roll: fx.roll || 0, flip: !!fx.flip, arc: fx.wide ? 3.8 : 2.6, life: big ? 0.4 : 0.25, width: big ? 0.6 : 0.35 });
      break;
    case 'cross':
      world.fx.slash(c, yaw, { color, radius: 1.8, roll: 0.8, life: 0.35, width: 0.45 });
      world.fx.slash(c, yaw, { color, radius: 1.8, roll: -0.8, flip: true, life: 0.35, width: 0.45 });
      break;
    case 'stab': {
      const f = forwardFromYaw(yaw);
      world.fx.tracer(c.clone().addScaledVector(f, -0.8), c.clone().addScaledVector(f, 0.9), { color, life: 0.15, width: 0.06 });
      break;
    }
    case 'punch':
      world.fx.ring(c, { color, radius: big ? 3.2 : 1.6, life: big ? 0.45 : 0.25, vertical: true, yaw });
      world.fx.burst(c, { count: big ? 50 : 18, color, speed: big ? 12 : 7, life: 0.45, size: 0.3 });
      if (fx.up) world.fx.burst(c, { count: 20, color: 0xffffff, speed: 6, up: 2, life: 0.4, size: 0.2 });
      if (fx.paranormal) {
        // impacto sobrenatural: distorção + sigilos
        world.fx.distort(c, { color, radius: big ? 3.4 : 1.7, life: big ? 0.5 : 0.3 });
        if (big) {
          world.fx.ring(new THREE.Vector3(target.pos.x, 0.06, target.pos.z), { color, radius: 5, life: 0.6 });
          world.screenFlash && world.screenFlash('#ffffff', 0.08);
        }
      }
      break;
    case 'claw': {
      // Arma de Sangue: três rasgos paralelos, sangue paranormal e marcas no corpo
      for (let i = -1; i <= 1; i++) {
        world.fx.slash(c.clone().add(new THREE.Vector3(0, i * 0.18, 0)), yaw, { color, radius: 1.6 + i * 0.12, tilt: fx.tilt || 0, roll: (fx.roll || 0) + i * 0.08, flip: !!fx.flip, arc: 2.2, life: big ? 0.45 : 0.3, width: 0.12 });
      }
      world.fx.burst(c, { count: big ? 60 : 26, color: 0x9a0010, speed: big ? 10 : 6, life: 0.7, size: 0.22, gravity: 9 });
      world.fx.burst(c, { count: 10, color: 0x2a0004, kind: 'smoke', speed: 1.5, life: 0.8, size: 0.6, grow: 1 });
      const joints = ['sp', 'hd', 'sL', 'sR', 'lL'];
      world.fx.cutMark(target.rig.joints[joints[Math.floor(Math.random() * joints.length)]], { color, life: 2.0, size: 0.34 });
      break;
    }
    default:
      break;
  }
  if (big) {
    world.fx.flash(c, { color: 0xffffff, size: 5, life: 0.18 });
    world.fx.burst(c, { count: 40, color, speed: 12, life: 0.6, size: 0.35, gravity: 4 });
  }
}

export const tmpV = new THREE.Vector3();

/**
 * Defesa parada segura especiais (menos os marcados como `unblockable`, ex.: Inexistir).
 * Gasta bastante da resistência (pode quebrar), passa um pouco do dano e cancela o especial.
 * Retorna true se o especial foi defendido.
 */
export function trySpecialBlock(world, f, opp, sp) {
  if (sp.unblockable || !opp || !opp.isGuarding()) return false;
  const facing = Math.abs(angleDiff(opp.yaw, yawTo(opp.pos, f.pos))) <= (COMBAT.block.arc * Math.PI) / 360;
  if (!facing) return false;
  const B = COMBAT.block;
  const total = sp.damage ?? COMBAT.specialDamage;
  opp.takeDamage(Math.round(total * B.specialChip));
  opp.guard -= B.specialGuardDamage;
  opp.blockRecoil = 0.3;
  opp.anim.play('block_hit', { restart: true });
  const p = opp.chestPos();
  world.fx.burst(p, { count: 40, color: 0xbfe6ff, speed: 8, life: 0.4, size: 0.25 });
  world.fx.ring(p, { color: 0xffffff, radius: 2.6, life: 0.35, vertical: true, yaw: opp.yaw });
  world.audio.play('perfectBlock');
  world.hitstop(0.1);
  opp.notify('ESPECIAL DEFENDIDO!', true);
  if (opp.guard <= 0) opp.guardBreak();
  f.stun(0.45, 'stagger');
  return true;
}
