import * as THREE from 'three';
import { yawTo, distXZ, forwardFromYaw } from '../../core/util.js';
import { COMBAT } from '../../config/combat.js';
import { applyHit } from '../damage.js';
import { splitDamage } from './common.js';
import { faceClose, overShoulder } from '../../camera/shots.js';
import { FIRE, lobLantern, placeLantern, addFireZone } from '../cristinoAbilities.js';

// Especial do Cristino — "UM, DOIS, TRÊS" (a armadilha do Quibungo, Hexatombe ep. 5: as lamparinas no caminho do bicho,
// a contagem até três e o tiro na primeira; o fogo pula de lampião em lampião e o amontoado explode).
//  1. (sem parar o mundo) arremessa TRÊS LAMPIÕES em volta de onde o adversário está — dá para sair do cerco;
//  2. cercou: a cinemática — por cima do ombro, a Socadeira apontada; "UM... DOIS... TRÊS!";
//  3. o tiro: o fogo pula de um lampião para o outro (três explosões) e a explosão grande no meio.
// Saiu do cerco: os lampiões ficam no chão como armadilhas (Trilha de Lampiões) e ele fica exposto.
// Mecanicamente: 250 de dano (padrão) dividido entre as três explosões e a grande, sem hitkill.
export const lanternCount = {
  canStart(f, sp) {
    const opp = f.opponent;
    return !!opp && opp.state !== 'ko' && opp.visible && distXZ(f.pos, opp.pos) <= (sp.range ?? 16);
  },

  start(f, sp, world) {
    const opp = f.opponent;
    const props = f.rig.props;
    const show = (name, v) => f.rig.showProp(name, v);
    const center = new THREE.Vector3(opp.pos.x, 0, opp.pos.z); // onde ele ESTAVA: dá para sair do cerco
    const ring = sp.ringRadius ?? 1.6;
    const a0 = Math.random() * Math.PI * 2;
    const spots = [0, 1, 2].map((i) => new THREE.Vector3(center.x + Math.cos(a0 + (i * Math.PI * 2) / 3) * ring, 0, center.z + Math.sin(a0 + (i * Math.PI * 2) / 3) * ring));
    const landed = []; // lampiões que já chegaram ao chão (malhas)
    const hand = () => f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(f.pos, opp.pos);
    if (props.peixeira) show('peixeira', false);
    let t = 0;
    let thrown = 0;
    let caught = null;
    let over = false;

    const throwOne = () => {
      f.anim.play('throw_r', { restart: true, duration: 0.3 });
      if (props.lantern) show('lantern', false);
      const from = hand();
      from.y = Math.max(from.y, 1.3);
      const i = thrown;
      lobLantern(world, from, spots[i], 0.38, (p, mesh) => {
        const keep = mesh.clone();
        keep.position.copy(p);
        world.scene.add(keep);
        landed[i] = keep;
        world.fx.burst(new THREE.Vector3(p.x, 0.3, p.z), { count: 6, color: 0xffd070, speed: 1.2, up: 1.2, life: 0.3, size: 0.12 });
      });
      world.audio.play('knifeThrow');
      thrown++;
    };

    const cleanupLamps = () => { for (const m of landed) if (m) world.scene.remove(m); landed.length = 0; };

    // errou o cerco: os lampiões ficam no chão como armadilhas e ele fica exposto
    const whiff = () => {
      f.notify('SAIU DO CERCO', true);
      for (const m of landed) {
        if (!m) continue;
        world.scene.remove(m);
        placeLantern(world, f, m.position, { ...sp.trap, max: 3 });
      }
      landed.length = 0;
      if (props.peixeira) show('peixeira', true);
      f.stun(sp.missRecovery ?? 0.6, 'breath');
      f.whiffRecovery = true;
    };

    return {
      update(dt) {
        if (caught) return caught.update(dt);
        if (over) return true;
        t += dt;
        if (thrown < 3 && t >= 0.15 + thrown * 0.24) {
          f.yaw = yawTo(f.pos, opp.pos);
          throwOne();
        }
        if (t >= 1.05) {
          const inside = opp.state !== 'ko' && Math.hypot(opp.pos.x - center.x, opp.pos.z - center.z) <= ring + 0.6 && opp.pos.y < 2;
          if (!inside || opp.isInvulnerable()) { whiff(); over = true; return true; }
          caught = cinematic();
        }
        return false;
      },
      cancel() {
        if (caught) caught.cancel();
        cleanupLamps();
        if (props.peixeira) show('peixeira', true);
      },
    };

    function cinematic() {
      const total = sp.damage ?? COMBAT.specialDamage;
      const parts = splitDamage(total, [0.18, 0.18, 0.18, 0.46]);
      world.beginCinematic(f, opp);
      f.vel.set(0, 0, 0);
      f.yaw = yawTo(f.pos, opp.pos);
      opp.anim.play('stagger', { restart: true });
      // a Socadeira sai das costas para as mãos
      if (props.gunBack) show('gunBack', false);
      if (props.socadeira) show('socadeira', true);
      f.anim.play('shoot_rifle', { restart: true, duration: 2.0 });
      world.cameraRig.playShots([overShoulder(f, opp, { dur: 1.6, back: 1.6, side: 0.7, height: 1.7, fov: 40 })]);
      const muzzle = () => (f.rig.muzzle && f.rig.muzzle.parent && f.rig.muzzle.parent.visible ? f.rig.muzzle.getWorldPosition(new THREE.Vector3()) : hand());
      let ct = 0;
      const said = [false, false, false];
      let shot = false;
      let boom = 0;
      const blast = (p, dmg, big) => {
        const c = new THREE.Vector3(p.x, 0.5, p.z);
        world.fx.play('FX_EXPLOSION', c, { color: FIRE, scale: big ? 4.2 : 2.2 });
        world.fx.burst(c, { count: big ? 90 : 30, color: 0xffd070, speed: big ? 13 : 7, up: 2, life: 0.6, size: big ? 0.45 : 0.3 });
        if (big) world.fx.burst(c, { count: 30, color: 0x2a2420, kind: 'smoke', speed: 3, up: 1.6, life: 1.6, size: 2, grow: 1 });
        world.audio.play('explosion', { volume: big ? 1.4 : 0.9 });
        world.cameraRig.shake(big ? 0.8 : 0.35, big ? 0.45 : 0.2);
        applyHit(world, f, opp, { damage: dmg, kind: 'special', fire: true, reaction: false, ignoreInvuln: true, sound: 'heavyPunch', color: FIRE, scale: big ? 2.4 : 1.4 });
        if (big) {
          world.screenFlash && world.screenFlash('#ffd2a0', 0.14);
          world.showBanner(sp.banner || 'UM, DOIS, TRÊS', f.def.color);
          addFireZone(world, f, center.x, center.z, { radius: 2.4, life: 4, dps: 0 });
          if (opp.state !== 'ko') opp.anim.play('launched', { restart: true });
        }
      };
      const end = () => {
        cleanupLamps();
        show('socadeira', false);
        if (props.gunBack) show('gunBack', true);
        if (props.peixeira) show('peixeira', true);
      };
      return {
        update(dt) {
          ct += dt;
          f.yaw = yawTo(f.pos, opp.pos);
          ['UM...', 'DOIS...', 'TRÊS!'].forEach((txt, i) => {
            if (!said[i] && ct >= 0.25 + i * 0.5) { said[i] = true; f.notify(txt, true); world.audio.play('ready', { volume: 0.6, pitch: 0.8 + i * 0.15 }); }
          });
          if (!shot && ct >= 1.55) {
            shot = true;
            const m = muzzle();
            world.fx.flash(m, { color: 0xffd27a, size: 2.4, life: 0.12 });
            world.fx.burst(m, { count: 10, color: 0x6a6460, kind: 'smoke', speed: 1.5, life: 0.7, size: 0.5, grow: 1 });
            world.audio.play('shotgun', { volume: 1.2 });
            if (landed[0]) world.fx.tracer(m, landed[0].position.clone().setY(0.3), { color: 0xffd27a, life: 0.12, width: 0.04 });
            world.cameraRig.playShots([overShoulder(f, opp, { dur: 1.0, back: 3.0, side: 1.2, height: 2.4, fov: 50 })]);
          }
          // o fogo pula de lampião em lampião e o amontoado explode
          while (shot && boom < 3 && ct >= 1.6 + boom * 0.16) {
            const L = landed[boom];
            if (L) {
              if (boom > 0 && landed[boom - 1]) world.fx.tracer(landed[boom - 1].position.clone().setY(0.3), L.position.clone().setY(0.3), { color: FIRE, life: 0.18, width: 0.08 });
              world.scene.remove(L);
              blast(L.position, parts[boom], false);
            } else blast(spots[boom], parts[boom], false);
            boom++;
          }
          if (boom === 3 && ct >= 2.15) {
            boom = 4;
            blast(center, parts[3], true);
            world.cameraRig.playShots([faceClose(f, { dur: 1.2, from: 2.0, to: 1.5, side: 0.4, fov: 40 })]);
          }
          if (ct >= 3.3) {
            end();
            world.endCinematic();
            if (opp.state !== 'ko') opp.react({ dir: forwardFromYaw(yawTo(f.pos, opp.pos)), knockback: 4, hitstun: COMBAT.launchHitstun, launch: true, lowLaunch: true });
            f.anim.play('idle', { blend: 0.2 });
            return true;
          }
          return false;
        },
        cancel() {
          end();
          world.endCinematic();
        },
      };
    }
  },
};
