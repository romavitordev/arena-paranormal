import * as THREE from 'three';
import { yawTo, distXZ, angleDiff, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { faceClose, socketClose, twoShot, pullBack } from '../../camera/shots.js';

// EM NOME DO CAOS (Erin transformada). Cânone: ferida de morte pelo Gal no Dia Final de Desconjuração, Erin ativou três
// das suas granadas e se explodiu "em nome do Caos".
//  1. puxa os pinos das três granadas rindo (sp.pins s, faíscas — dá para ver o que vem);
//  2. CORRE até o adversário (sp.run s no máximo; o mundo não para — dá para fugir, esquivar ou defender);
//  3. se ENCOSTA (sp.contact m) num adversário que não está esquivando: CUTSCENE — o tempo para, close no rosto com a
//     máscara de gás (ela ri), close nas três granadas brilhando na mão, plano aberto dos dois e a explosão engole a
//     tela; sp.damage (defesa de frente na hora do contato segura METADE e quebra a guarda). Se ele esquivou / saiu do
//     raio, ela explode sozinha na hora (sem cutscene);
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

    // a explosão em si (efeitos + dano + a morte dela). hit: { guarded } se pegou o adversário, null se não pegou
    const blast = (hit) => {
      if (exploded) return;
      exploded = true;
      sparks.stop();
      if (props.grenade) f.rig.showProp('grenade', false);
      const c = f.chestPos();
      world.fx.flash(c, { color: 0xffffff, size: 12, life: 0.35 });
      world.fx.burst(c, { count: 160, color: col, speed: 18, life: 1.0, size: 0.5, gravity: 4 });
      world.fx.burst(c, { count: 60, color: 0x2a2228, kind: 'smoke', speed: 6, up: 2.4, life: 1.6, size: 1.4, grow: 1.6 });
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: col, radius: sp.radius * 1.8, life: 0.7 });
      world.fx.ring(c, { color: 0xffe0a0, radius: sp.radius * 1.5, life: 0.45, vertical: true, yaw: f.yaw });
      world.fx.distort && world.fx.distort(c, { color: col, radius: sp.radius * 1.4, life: 0.5 });
      world.cameraRig.shake(1.0, 0.6);
      world.screenFlash && world.screenFlash('#ffffff', 0.3);
      world.audio.play('explosion', { volume: 1.5, pitch: 0.7 });
      world.audio.play('heavyPunch', { volume: 1, pitch: 0.5 });
      if (hit && opp && opp.state !== 'ko') {
        const res = applyHit(world, f, opp, {
          damage: Math.round(sp.damage * (hit.guarded ? sp.guardedMult ?? 0.5 : 1)), kind: 'special', fire: true, element: 'energia',
          dir: forwardFromYaw(yawTo(f.pos, opp.pos)), knockback: 10, hitstun: COMBAT.launchHitstun, launch: true,
          sound: 'heavyPunch', color: col, scale: 3, ignoreInvuln: true,
        });
        if (hit.guarded && typeof res === 'number' && opp.state !== 'ko') opp.guardBreak();
      } else if (opp && opp.state !== 'ko') {
        opp.notify('ESCAPOU!', true);
      }
      // ...e a Erin morre (no treino, quem é imortal fica com 1 de vida). Na cutscene a morte espera o plano aberto
      // terminar (morrer cancela a cena); fora dela, morre na hora
      if (cut) { f.setVisible(false); return; }
      die();
    };
    const die = () => {
      f.sacrificeWin = true;
      f.invuln = 0;
      f.takeDamage(f.health);
    };

    // encostou (ou o tempo da corrida acabou): pegou o adversário? então CUTSCENE; senão explode sozinha
    let cut = null;
    const explode = () => {
      if (exploded || cut) return;
      f.vel.x = 0;
      f.vel.z = 0;
      f.anim.speed = 1;
      const near = opp && opp.state !== 'ko' && distXZ(f.pos, opp.pos) <= sp.radius;
      if (!near || opp.isInvulnerable()) { blast(null); return; }
      const facing = Math.abs(angleDiff(opp.yaw, yawTo(opp.pos, f.pos))) <= (COMBAT.block.arc * Math.PI) / 360;
      const hit = { guarded: opp.isGuarding() && facing };
      world.beginCinematic(f, opp);
      f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play('cast_up', { restart: true, duration: 0.6 });
      if (props.grenade) f.rig.showProp('grenade', true);
      world.showBanner(sp.banner || 'Em Nome do Caos!', f.def.color);
      const hy = f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).y - f.pos.y;
      world.cameraRig.playShots([
        faceClose(f, { dur: 0.75, from: 1.3, to: 1.0, side: 0.3, height: hy, fov: 34 }), // a máscara de gás, rindo
        socketClose(f, hand, { dur: 0.6, dist: 1.0, side: 0.5, fov: 38 }), // as três granadas sem pino na mão
        twoShot(f, opp, { dur: 0.55, dist: 4.5, height: 1.6, push: 1.2, side: -1, fov: 44 }), // os dois, um instante antes
        pullBack(f, opp, { dur: 1.1, from: 6, to: 12, height: 4, side: 1 }), // a explosão vista de longe
      ]);
      world.audio.play('fearGaze', { volume: 0.8, pitch: 1.7 }); // a risada do Caos
      cut = { t: 0, hit };
    };
    return {
      update(dt) {
        t += dt;
        if (cut) {
          // cutscene: as granadas brilham cada vez mais até explodir (aos 1,9 s), depois o plano aberto termina
          cut.t += dt;
          if (!exploded && Math.random() < 0.8) world.fx.burst(hand(), { count: 3, color: cut.t > 1.3 ? 0xffffff : col, speed: 2 + cut.t * 3, life: 0.25, size: 0.1 + cut.t * 0.05 });
          if (!exploded && cut.t >= 1.9) blast(cut.hit);
          if (cut.t >= 2.8) {
            world.endCinematic();
            f.setVisible(true);
            die();
            return true;
          }
          return false;
        }
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
        if (cut) { world.endCinematic(); f.setVisible(true); }
        sparks.stop();
        if (props.grenade) f.rig.showProp('grenade', false);
        f.anim.speed = 1;
      },
    };
  },
};
