import * as THREE from 'three';
import { yawTo, distXZ, angleDiff, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage } from './common.js';
import { grenadeMesh } from './supernova.js';
import { faceClose, socketClose, twoShot, pullBack } from '../../camera/shots.js';

// EM NOME DO CAOS (Erin transformada). Cânone: ferida de morte pelo Gal no Dia Final de Desconjuração, Erin ativou três
// das suas granadas e se explodiu "em nome do Caos".
//  1. PEGAR o especial: ela arremessa uma GRANADA DE LUZ de verdade (o mundo não para) em arco até onde o adversário
//     estava. Dá para escapar: sair do raio, esquivar na hora ou defender de frente para ela (cobre os olhos). Errou:
//     ela fica parada e aberta (e NÃO se explode);
//  2. CEGOU: cutscene — ela corre até ele rindo, dá o tiro de escopeta à queima-roupa, puxa os pinos das três
//     granadas (close na máscara de gás e nas granadas na mão) e se explode colada nele: sp.damage no total
//     (sp.shotShare no tiro, o resto na explosão);
//  3. a Erin MORRE na explosão. Se o adversário também cair, ela ganha o round (Match.endRound: `sacrificeWin`); se
//     ele sobreviver, ela perde.
export const kamikaze = {
  canStart: (f, sp) => !!f.opponent && f.opponent.state !== 'ko' && f.opponent.visible && distXZ(f.pos, f.opponent.pos) <= (sp.range ?? 18),
  start(f, sp, world) {
    const opp = f.opponent;
    const col = sp.color ?? 0xff5a1a;
    const props = f.rig.props;
    const F0 = sp.flash || {};
    const flashRadius = F0.radius ?? 2.6;
    const hand = () => (f.rig.sockets.handR ? f.rig.sockets.handR.getWorldPosition(new THREE.Vector3()) : f.chestPos());
    const muzzle = () => (f.rig.muzzle && f.rig.muzzle.parent && f.rig.muzzle.parent.visible ? f.rig.muzzle.getWorldPosition(new THREE.Vector3()) : hand());
    const show = (name, v) => props[name] && f.rig.showProp(name, v);

    // ---------------------------------------------------------------- 1) a granada de luz
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('throw_r', { restart: true, duration: 0.55 });
    show('daggerR', false);
    world.audio.play('grenadePin', { volume: 0.8 });
    world.audio.play('fearGaze', { volume: 0.5, pitch: 1.8 }); // a risada
    const target = new THREE.Vector3(opp.pos.x, 0.15, opp.pos.z); // onde ele ESTAVA: dá para sair de baixo
    let lob = null;
    let tt = 0;
    let cut = null; // a cutscene (depois de cegar)
    let done = false;

    const flashBang = () => {
      const p = lob.mesh.position.clone();
      world.scene.remove(lob.mesh);
      lob = null;
      f.threatLob = null;
      world.fx.flash(p, { color: 0xffffff, size: 8, life: 0.35 });
      world.fx.ring(new THREE.Vector3(p.x, 0.07, p.z), { color: 0xfff6d0, radius: flashRadius, life: 0.4 });
      world.fx.burst(p, { count: 40, color: 0xfff6d0, speed: 9, life: 0.4, size: 0.25 });
      world.audio.play('explosion', { volume: 0.7, pitch: 1.6 });
      const inside = opp.state !== 'ko' && Math.hypot(opp.pos.x - p.x, opp.pos.z - p.z) <= flashRadius;
      const facing = Math.abs(angleDiff(opp.yaw, yawTo(opp.pos, f.pos))) <= (COMBAT.block.arc * Math.PI) / 360;
      if (inside && opp.isGuarding() && facing) { opp.notify('COBRIU OS OLHOS!', true); return false; }
      if (!inside || opp.isInvulnerable()) { if (inside) opp.notify('DESVIOU!', true); return false; }
      world.screenFlash && world.screenFlash('#ffffff', 0.25);
      opp.notify('CEGO!', true);
      return true;
    };
    // errou: sai do especial e fica parada e ABERTA (atordoada, sem Substituição)
    const whiff = () => {
      f.notify('ERROU', true);
      show('daggerR', true);
      f.stun(F0.missRecovery ?? 0.7, 'breath');
      f.whiffRecovery = true;
    };

    // ---------------------------------------------------------------- 2) cegou: a cutscene
    const startCut = () => {
      const [shotDmg, blastDmg] = splitDamage(sp.damage, [sp.shotShare ?? 0.15, 1 - (sp.shotShare ?? 0.15)]);
      world.beginCinematic(f, opp);
      opp.anim.play('fear', { restart: true }); // cego pelo clarão
      f.yaw = yawTo(f.pos, opp.pos);
      show('shotgun', true);
      f.anim.play('run', { restart: true });
      f.anim.speed = 1.5;
      const hy = f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).y - f.pos.y;
      world.cameraRig.playShots([twoShot(f, opp, { dur: 0.9, dist: 4.2, height: 1.4, push: 1.0, side: 1, fov: 44 })]);
      world.audio.play('fearGaze', { volume: 0.8, pitch: 1.7 });
      return { t: 0, phase: 'run', shotDmg, blastDmg, hy };
    };

    const shoot = (c) => {
      f.anim.speed = 1;
      f.anim.play('shoot_rifle', { restart: true, duration: 0.5 });
      const m = muzzle();
      const F = forwardFromYaw(f.yaw);
      world.audio.play('shotgun', { volume: 1.2 });
      world.fx.flash(m, { color: 0xffd27a, size: 2.4, life: 0.12 });
      for (let i = 0; i < 9; i++) {
        const d = F.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.4) * 0.25, (Math.random() - 0.5) * 0.5)).normalize();
        world.fx.tracer(m, m.clone().addScaledVector(d, 2.6), { color: 0xffd27a, life: 0.12, width: 0.03 });
      }
      world.fx.burst(opp.chestPos(), { count: 30, color: 0xffb060, speed: 7, life: 0.4, size: 0.2 });
      applyHit(world, f, opp, { damage: c.shotDmg, kind: 'special', reaction: false, ignoreInvuln: true, sound: 'impact', color: 0xffd27a, scale: 1.6 });
      if (opp.state !== 'ko') opp.anim.play('hit', { restart: true });
      world.cameraRig.shake(0.4, 0.2);
      world.cameraRig.playShots([
        faceClose(f, { dur: 0.75, from: 1.3, to: 1.0, side: 0.3, height: c.hy, fov: 34 }), // a máscara de gás, rindo
        socketClose(f, hand, { dur: 0.65, dist: 1.0, side: 0.5, fov: 38 }), // as três granadas sem pino na mão
        twoShot(f, opp, { dur: 0.5, dist: 4.5, height: 1.6, push: 1.2, side: -1, fov: 44 }),
        pullBack(f, opp, { dur: 1.1, from: 6, to: 12, height: 4, side: 1 }), // a explosão vista de longe
      ]);
    };

    const pins = () => {
      show('shotgun', false);
      show('grenade', true);
      f.anim.play('cast_up', { restart: true, duration: 0.6 });
      world.audio.play('grenadePin', { volume: 1 });
      world.audio.play('fearGaze', { volume: 0.8, pitch: 1.7 });
      world.showBanner(sp.banner || 'Em Nome do Caos!', f.def.color);
    };

    const blast = (c) => {
      show('grenade', false);
      const p = f.chestPos();
      world.fx.flash(p, { color: 0xffffff, size: 12, life: 0.35 });
      world.fx.burst(p, { count: 160, color: col, speed: 18, life: 1.0, size: 0.5, gravity: 4 });
      world.fx.burst(p, { count: 60, color: 0x2a2228, kind: 'smoke', speed: 6, up: 2.4, life: 1.6, size: 1.4, grow: 1.6 });
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: col, radius: 6, life: 0.7 });
      world.fx.ring(p, { color: 0xffe0a0, radius: 5, life: 0.45, vertical: true, yaw: f.yaw });
      world.fx.distort && world.fx.distort(p, { color: col, radius: 4.5, life: 0.5 });
      world.cameraRig.shake(1.0, 0.6);
      world.screenFlash && world.screenFlash('#ffffff', 0.3);
      world.audio.play('explosion', { volume: 1.5, pitch: 0.7 });
      world.audio.play('heavyPunch', { volume: 1, pitch: 0.5 });
      if (opp.state !== 'ko') {
        applyHit(world, f, opp, {
          damage: c.blastDmg, kind: 'special', fire: true, element: 'energia', dir: forwardFromYaw(yawTo(f.pos, opp.pos)),
          knockback: 10, hitstun: COMBAT.launchHitstun, launch: true, sound: 'heavyPunch', color: col, scale: 3, ignoreInvuln: true,
        });
      }
      // ela some na explosão; a morte espera o plano aberto terminar (morrer cancela a cena)
      f.setVisible(false);
    };

    const die = () => {
      f.setVisible(true);
      f.sacrificeWin = true;
      f.invuln = 0;
      f.takeDamage(f.health); // no treino, quem é imortal fica com 1 de vida
    };

    const cleanup = () => {
      if (lob) { world.scene.remove(lob.mesh); lob = null; }
      f.threatLob = null;
      show('grenade', false);
      show('shotgun', false);
      show('daggerR', true);
      f.anim.speed = 1;
    };

    return {
      update(dt) {
        tt += dt;
        if (cut) {
          const c = cut;
          c.t += dt;
          if (c.phase === 'run') {
            // corre até ficar colada nele
            const dir = new THREE.Vector3().subVectors(opp.pos, f.pos).setY(0);
            const d = dir.length();
            f.yaw = Math.atan2(dir.x, dir.z);
            if (d > 1.4 && c.t < 1.2) f.pos.addScaledVector(dir.normalize(), Math.min(d - 1.4, (sp.speed ?? 13) * dt));
            else { shoot(c); c.phase = 'shot'; c.t = 0; }
          } else if (c.phase === 'shot') {
            if (c.t >= 0.6) { pins(); c.phase = 'pins'; c.t = 0; }
          } else if (c.phase === 'pins') {
            // as granadas brilham cada vez mais até explodir
            if (Math.random() < 0.8) world.fx.burst(hand(), { count: 3, color: c.t > 0.8 ? 0xffffff : col, speed: 2 + c.t * 4, life: 0.25, size: 0.1 + c.t * 0.08 });
            if (c.t >= 1.3) { blast(c); c.phase = 'boom'; c.t = 0; }
          } else if (c.phase === 'boom' && c.t >= 1.0) {
            done = true;
            cleanup();
            world.endCinematic();
            die();
            return true;
          }
          return false;
        }
        if (!lob && tt >= 0.3 && !done) {
          // solta a granada de luz: arco até onde ele estava
          const mesh = grenadeMesh(0xf4f0e0);
          const start = hand();
          mesh.position.copy(start);
          world.scene.add(mesh);
          lob = { mesh, start, t: 0, dur: F0.flight ?? 0.65, target };
          f.threatLob = lob; // a CPU adversária vê a granada vindo
          world.audio.play('knifeThrow');
        }
        if (lob) {
          lob.t += dt;
          const u = Math.min(1, lob.t / lob.dur);
          lob.mesh.position.lerpVectors(lob.start, target, u);
          lob.mesh.position.y += Math.sin(u * Math.PI) * 2.0;
          lob.mesh.rotation.x += dt * 12;
          if (u >= 1) {
            if (flashBang()) { cut = startCut(); return false; }
            done = true;
            whiff();
            return true;
          }
        }
        return false;
      },
      cancel() {
        if (cut && !done) { world.endCinematic(); f.setVisible(true); }
        cleanup();
      },
    };
  },
};
