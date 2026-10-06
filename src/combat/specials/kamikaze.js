import * as THREE from 'three';
import { yawTo, distXZ, angleDiff, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';

// EM NOME DO CAOS (Erin transformada). Cânone: ferida de morte pelo Gal no Dia Final de Desconjuração, Erin ativou três
// das suas granadas e se explodiu "em nome do Caos".
//  1. puxa os pinos das três granadas rindo (sp.pins s, faíscas — dá para ver o que vem);
//  2. CORRE até o adversário (sp.run s no máximo; o mundo não para — dá para fugir, esquivar ou defender);
//  3. explode quando encosta (sp.contact m) ou quando o tempo acaba: sp.damage em quem estiver no raio sp.radius
//     (esquiva desvia; defesa de frente segura METADE e quebra a guarda);
//  4. a Erin MORRE na explosão. Se o adversário também cair, a Erin ganha o round (Match.endRound: `sacrificeWin`);
//     se ele sobreviver, ela perde.
export const kamikaze = {
  canStart: (f) => !!f.opponent && f.opponent.state !== 'ko',
  start(f, sp, world) {
    const opp = f.opponent;
    const col = sp.color ?? 0xff5a1a;
    const props = f.rig.props;
    let phase = 'pins';
    let t = 0;
    let exploded = false;
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('cast_up', { restart: true, duration: sp.pins ?? 0.7 });
    if (props.grenade) f.rig.showProp('grenade', true);
    if (props.daggerR) f.rig.showProp('daggerR', false);
    world.showBanner(sp.banner || 'Em Nome do Caos!', f.def.color);
    world.audio.play('grenadePin', { volume: 1 });
    const hand = () => (f.rig.sockets.handR ? f.rig.sockets.handR.getWorldPosition(new THREE.Vector3()) : f.chestPos());
    const sparks = world.fx.emitter({ rate: 90, follow: hand, particle: { color: col, speed: 3, spread: 0.8, up: 1, life: 0.3, size: 0.12, gravity: 6 } });

    const explode = () => {
      if (exploded) return;
      exploded = true;
      sparks.stop();
      if (props.grenade) f.rig.showProp('grenade', false);
      const c = f.chestPos();
      world.fx.flash(c, { color: 0xffffff, size: 9, life: 0.3 });
      world.fx.burst(c, { count: 120, color: col, speed: 16, life: 0.9, size: 0.45, gravity: 4 });
      world.fx.burst(c, { count: 50, color: 0x2a2228, kind: 'smoke', speed: 5, up: 2, life: 1.4, size: 1.2, grow: 1.4 });
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: col, radius: sp.radius * 1.6, life: 0.6 });
      world.fx.ring(c, { color: 0xffe0a0, radius: sp.radius * 1.4, life: 0.4, vertical: true, yaw: f.yaw });
      world.cameraRig.shake(0.9, 0.5);
      world.screenFlash && world.screenFlash('#ffffff', 0.18);
      world.audio.play('explosion', { volume: 1.4, pitch: 0.8 });
      world.audio.play('heavyPunch', { volume: 1, pitch: 0.6 });
      // o adversário no raio leva a explosão
      if (opp && opp.state !== 'ko' && distXZ(f.pos, opp.pos) <= sp.radius) {
        const facing = Math.abs(angleDiff(opp.yaw, yawTo(opp.pos, f.pos))) <= (COMBAT.block.arc * Math.PI) / 360;
        const guarded = opp.isGuarding() && facing;
        const res = applyHit(world, f, opp, {
          damage: Math.round(sp.damage * (guarded ? sp.guardedMult ?? 0.5 : 1)), kind: 'special', fire: true, element: 'energia',
          dir: forwardFromYaw(yawTo(f.pos, opp.pos)), knockback: 9, hitstun: COMBAT.launchHitstun, launch: true,
          sound: 'heavyPunch', color: col, scale: 2.6,
        });
        if (guarded && typeof res === 'number' && opp.state !== 'ko') opp.guardBreak();
        if (res === 0 && opp.state !== 'ko') opp.notify('DESVIOU!', true);
      } else if (opp) {
        opp.notify('ESCAPOU!', true);
      }
      // ...e a Erin morre (no treino, quem é imortal fica com 1 de vida)
      f.sacrificeWin = true;
      f.invuln = 0;
      f.takeDamage(f.health);
    };

    return {
      update(dt) {
        t += dt;
        if (exploded) return t > 0.1;
        if (phase === 'pins') {
          if (opp) f.yaw = yawTo(f.pos, opp.pos);
          if (t >= (sp.pins ?? 0.7)) {
            phase = 'run';
            t = 0;
            f.anim.play('run', { restart: true });
            f.anim.speed = 1.5;
            world.audio.play('fearGaze', { volume: 0.5, pitch: 1.6 }); // risada do Caos
          }
          return false;
        }
        // correndo até o alvo
        if (opp && opp.state !== 'ko') {
          const dir = new THREE.Vector3().subVectors(opp.pos, f.pos).setY(0);
          const d = dir.length();
          dir.normalize();
          f.yaw = Math.atan2(dir.x, dir.z);
          f.vel.x = dir.x * sp.speed;
          f.vel.z = dir.z * sp.speed;
          if (d <= sp.contact) explode();
        }
        if (Math.random() < 0.6) world.fx.burst(hand(), { count: 2, color: col, speed: 2, life: 0.25, size: 0.1 });
        if (!exploded && t >= (sp.run ?? 1.4)) explode();
        if (exploded) {
          f.vel.x = 0;
          f.vel.z = 0;
          f.anim.speed = 1;
        }
        return false;
      },
      cancel() {
        sparks.stop();
        if (props.grenade) f.rig.showProp('grenade', false);
        f.anim.speed = 1;
      },
    };
  },
};
