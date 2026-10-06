import * as THREE from 'three';
import { yawTo, distXZ, forwardFromYaw, angleDiff } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage } from './common.js';
import { faceClose, overShoulder, socketClose } from '../../camera/shots.js';

// Especial da Erin — SUPERNOVA. Para PEGAR o especial ela arremessa primeiro uma GRANADA DE LUZ de verdade (sem parar o
// mundo): ela voa em arco até onde o adversário estava e estoura num clarão. Dá para escapar — sair do raio, esquivar
// na hora ou defender de frente (cobre os olhos). Errou: ela fica exposta. CEGOU o adversário: aí sim a cinemática:
//  1. close dela CORRENDO com a escopeta na direção do inimigo (ele ainda cego);
//  2. tiro de escopeta à queima-roupa: o inimigo voa para longe;
//  3. close na mão SEGURANDO A GRANADA (a do coração vermelho);
//  4. arremessa: a granada explode no inimigo — "SUPERNOVA" na tela — e close nela sorrindo.
// Mecanicamente: 250 de dano (padrão) dividido entre o tiro e a explosão, sem hitkill.

// câmera baixa, à frente e ao lado de quem corre, olhando para ela (acompanha o movimento)
function runTrack(f, { dur = 1, ahead = 2.2, side = 1.1, height = 1.0, fov = 42 } = {}) {
  return {
    dur, fov,
    pos: () => {
      const F = forwardFromYaw(f.yaw);
      const R = new THREE.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw));
      return new THREE.Vector3(f.pos.x, f.pos.y + height, f.pos.z).addScaledVector(F, ahead).addScaledVector(R, side);
    },
    look: () => new THREE.Vector3(f.pos.x, f.pos.y + 1.2, f.pos.z),
  };
}

export function grenadeMesh(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3a4a2a, roughness: 0.6 }));
  body.scale.set(1, 1.2, 1);
  g.add(body);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 6, 14), new THREE.MeshBasicMaterial({ color }));
  band.rotation.x = Math.PI / 2;
  g.add(band);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffd060 }));
  spark.position.y = 0.2;
  g.add(spark);
  return g;
}

export const supernova = {
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 18);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    const props0 = f.rig.props;
    // ---------------------------------------------------------------- 1) a granada de luz (não é cinemática)
    const F0 = sp.flash || {};
    const flashRadius = F0.radius ?? 2.6;
    const hand0 = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    f.anim.play('throw_r', { restart: true, duration: 0.55 });
    if (props0.daggerR) f.rig.showProp('daggerR', false);
    world.audio.play('grenadePin', { volume: 0.8 });
    let lob = null; // granada de luz voando
    let tt = 0;
    let caught = null; // virou a cinemática
    const target = new THREE.Vector3(opp.pos.x, 0.15, opp.pos.z); // onde ele ESTAVA: dá para sair de baixo
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
      // defender de frente para a Erin cobre os olhos (a granada cai no pé dele, então vale a direção de quem jogou)
      const facing = Math.abs(angleDiff(opp.yaw, yawTo(opp.pos, f.pos))) <= (COMBAT.block.arc * Math.PI) / 360;
      if (inside && opp.isGuarding() && facing) { opp.notify('COBRIU OS OLHOS!', true); return false; }
      if (!inside || opp.isInvulnerable()) { if (inside) opp.notify('DESVIOU!', true); return false; }
      world.screenFlash && world.screenFlash('#ffffff', 0.25);
      opp.notify('CEGO!', true);
      return true;
    };
    // errou: sai do especial e fica parada e ABERTA (atordoada, sem Substituição) — durante o especial ela não apanha
    const whiff = () => {
      f.notify('ERROU', true);
      if (props0.daggerR) f.rig.showProp('daggerR', true);
      f.stun(F0.missRecovery ?? 0.6, 'breath');
      f.whiffRecovery = true;
    };
    const flashSeq = {
      update(dt) {
        if (caught) return caught.update(dt);
        tt += dt;
        if (!lob && tt >= 0.3) {
          // solta a granada: arco de 0,65 s até onde ele estava
          const mesh = grenadeMesh(0xf4f0e0);
          const start = hand0();
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
            if (flashBang()) { caught = startCinematic(); return false; }
            whiff();
            return true;
          }
        }
        return false;
      },
      cancel() {
        if (lob) world.scene.remove(lob.mesh);
        f.threatLob = null;
        if (caught) caught.cancel();
        if (props0.daggerR) f.rig.showProp('daggerR', true);
      },
    };
    return flashSeq;

    // ---------------------------------------------------------------- 2) cegou: a cinemática da Supernova
    function startCinematic() {
    const total = sp.damage ?? COMBAT.specialDamage;
    const [shotDmg, blastDmg] = splitDamage(total, [sp.shotShare ?? 0.35, 1 - (sp.shotShare ?? 0.35)]);
    const color = sp.color;
    const props = f.rig.props;
    const show = (name, v) => props[name] && f.rig.showProp(name, v);
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    opp.anim.play('fear', { restart: true }); // cego pelo clarão
    show('daggerR', false);
    show('shotgun', true);
    f.anim.play('run', { restart: true });
    world.audio.play('grenadePin', { volume: 0.5 });
    world.cameraRig.playShots([runTrack(f, { dur: 1.2 })]);

    let phase = 'run';
    let t = 0; // tempo dentro da fase
    let total_t = 0;
    let fly = null; // granada voando
    let knock = null; // inimigo voando depois do tiro
    const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    const muzzle = () => (f.rig.muzzle && f.rig.muzzle.parent && f.rig.muzzle.parent.visible ? f.rig.muzzle.getWorldPosition(new THREE.Vector3()) : hand());
    const go = (p) => { phase = p; t = 0; };

    const shoot = () => {
      f.anim.play('shoot_rifle', { restart: true, duration: 0.55 });
      const m = muzzle();
      const F = forwardFromYaw(f.yaw);
      world.audio.play('shotgun', { volume: 1.2 });
      world.fx.flash(m, { color: 0xffd27a, size: 2.4, life: 0.12 });
      for (let i = 0; i < 9; i++) {
        const d = F.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.4) * 0.25, (Math.random() - 0.5) * 0.5)).normalize();
        world.fx.tracer(m, m.clone().addScaledVector(d, 3.2), { color: 0xffd27a, life: 0.12, width: 0.03 });
      }
      world.fx.burst(opp.chestPos(), { count: 30, color: 0xffb060, speed: 7, life: 0.4, size: 0.2 });
      world.fx.burst(m, { count: 10, color: 0x6a6460, kind: 'smoke', speed: 1.5, life: 0.7, size: 0.5, grow: 1 });
      applyHit(world, f, opp, { damage: shotDmg, kind: 'special', reaction: false, ignoreInvuln: true, sound: 'impact', color: 0xffd27a, scale: 1.6 });
      world.cameraRig.shake(0.45, 0.25);
      if (opp.state !== 'ko') opp.anim.play('launched', { restart: true });
      // o tiro joga o inimigo longe
      const from = opp.pos.clone();
      const to = from.clone().addScaledVector(F, sp.knockDistance ?? 5.5);
      knock = { from, to, t: 0, dur: 0.5 };
      // por cima do ombro dela: vê o inimigo voando para longe
      world.cameraRig.playShots([overShoulder(f, opp, { dur: 0.75, back: 1.8, side: 0.8, height: 1.6, fov: 44 })]);
    };

    const holdGrenade = () => {
      show('shotgun', false);
      show('grenade', true);
      f.anim.play('throw_r', { restart: true, duration: 1.6 }); // fica no preparo, granada na mão
      world.audio.play('grenadePin');
      f.yaw = yawTo(f.pos, opp.pos);
      world.cameraRig.playShots([socketClose(f, hand, { dur: 0.8, dist: 1.1, side: 0.7, fov: 36 })]);
      f.notify('Kaboom!', true);
    };

    const throwIt = () => {
      f.anim.play('throw_r', { restart: true, duration: 0.4 });
      show('grenade', false);
      const mesh = grenadeMesh(0xff3050);
      const start = hand();
      mesh.position.copy(start);
      world.scene.add(mesh);
      fly = { mesh, start, t: 0, dur: 0.6 };
      world.audio.play('knifeThrow');
      world.cameraRig.playShots([overShoulder(f, opp, { dur: 0.6, back: 2.6, side: 1.0, height: 2.1, fov: 48 })]);
    };

    const explode = () => {
      const c = opp.chestPos();
      world.fx.flash(c, { color: 0xffffff, size: 9, life: 0.35 });
      world.fx.ring(new THREE.Vector3(opp.pos.x, 0.08, opp.pos.z), { color, radius: 7, life: 0.6 });
      world.fx.ring(c, { color: 0xff3050, radius: 4, life: 0.5, vertical: true, yaw: f.yaw });
      world.fx.burst(c, { count: 110, color: 0xff9a30, speed: 15, up: 2, life: 0.7, size: 0.45 });
      world.fx.burst(c, { count: 50, color: 0xff3050, speed: 11, life: 0.7, size: 0.3 });
      world.fx.burst(c, { count: 36, color: 0x2a2420, kind: 'smoke', speed: 3, up: 1.6, life: 1.6, size: 2, grow: 1 });
      world.screenFlash && world.screenFlash('#fff2d0', 0.14);
      world.audio.play('explosion', { volume: 1.4 });
      world.cameraRig.shake(0.8, 0.45);
      applyHit(world, f, opp, { damage: blastDmg, kind: 'special', fire: true, reaction: false, ignoreInvuln: true, sound: 'heavyPunch', color, scale: 2.4 });
      if (opp.state !== 'ko') opp.anim.play('launched', { restart: true });
      world.showBanner(sp.banner || 'SUPERNOVA', f.def.color);
      // close nela sorrindo, com o clarão atrás
      world.cameraRig.playShots([faceClose(f, { dur: 1.4, from: 2.1, to: 1.4, side: 0.5, fov: 40 })]);
    };

    const cleanup = () => {
      if (fly) { world.scene.remove(fly.mesh); fly = null; }
      show('grenade', false);
      show('shotgun', false);
      show('daggerR', true);
    };

    return {
      update(dt) {
        t += dt;
        total_t += dt;
        // inimigo voando depois do tiro
        if (knock) {
          knock.t += dt;
          const k = Math.min(1, knock.t / knock.dur);
          const e = 1 - (1 - k) ** 2;
          opp.pos.lerpVectors(knock.from, knock.to, e);
          opp.pos.y = Math.sin(k * Math.PI) * 0.6;
          if (k >= 1) { opp.pos.y = 0; knock = null; }
        }
        if (phase === 'run') {
          f.yaw = yawTo(f.pos, opp.pos);
          const d = distXZ(f.pos, opp.pos);
          if (d > (sp.shootDistance ?? 2.2) && t < 1.1) {
            const F = forwardFromYaw(f.yaw);
            const step = Math.min(d - (sp.shootDistance ?? 2.2), (sp.runSpeed ?? 13) * dt);
            f.pos.addScaledVector(F, step);
          } else if (t >= 0.45) {
            shoot();
            go('shot');
          }
        } else if (phase === 'shot') {
          if (t >= 0.75) { holdGrenade(); go('hold'); }
        } else if (phase === 'hold') {
          if (t >= 0.8) { throwIt(); go('fly'); }
        } else if (phase === 'fly') {
          fly.t += dt;
          const u = Math.min(1, fly.t / fly.dur);
          fly.mesh.position.lerpVectors(fly.start, opp.chestPos(), u);
          fly.mesh.position.y += Math.sin(u * Math.PI) * 2.2;
          fly.mesh.rotation.x += dt * 14;
          // já arremessou: vira de costas para a explosão e sorri para a câmera
          if (fly.t >= 0.32 && !fly.turned) {
            fly.turned = true;
            f.yaw = yawTo(opp.pos, f.pos);
            f.anim.play('victory', { restart: true });
            world.cameraRig.playShots([faceClose(f, { dur: 0.4, from: 2.4, to: 2.1, side: 0.5, fov: 40 })]);
          }
          if (u >= 1) {
            world.scene.remove(fly.mesh);
            fly = null;
            explode();
            go('boom');
          }
        } else if (phase === 'boom') {
          if (t >= 1.4) {
            cleanup();
            world.endCinematic();
            // ela está de costas: o empurrão final é na direção dela → inimigo
            if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(yawTo(f.pos, opp.pos)), knockback: 4, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
            f.anim.play('idle', { blend: 0.2 });
            return true;
          }
        }
        // segurança: nunca trava
        if (total_t > 8) { cleanup(); world.endCinematic(); return true; }
        return false;
      },
      cancel() {
        cleanup();
        world.endCinematic();
      },
    };
    }
  },
};
