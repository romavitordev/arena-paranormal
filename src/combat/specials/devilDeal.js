import * as THREE from 'three';
import { Timeline, yawTo, forwardFromYaw } from '../../core/util.js';
import { faceClose, twoShot } from '../../camera/shots.js';
import { findFreeSpotNear } from '../positioning.js';
import { applyHit } from '../damage.js';
import { addBloodPool } from '../bloodPools.js';

// PACTO (O Diabo — "Eu vim te oferecer um pacto."). Cânone: o Diabo oferece um pacto; aceito, ele CUMPRE a parte dele,
// mas distorce o resultado — o pacto é um vínculo de dependência obsessiva que transforma a vítima num TRANSTORNADO.
//  1. o Diabo some no sangue e sai pelo Símbolo do Pacto, cara a cara com o adversário (cinemática: o mundo para);
//  2. a VÍTIMA ESCOLHE (sp.choice s): ○ aceita, Defesa recusa; calar é consentir;
//  3a. ACEITOU — o presente: cura e sanidade cheia. O preço: TRANSTORNADO por sp.duration (não defende, leva mais
//      dano e a sanidade escorre de volta para o Diabo); o Diabo se cura;
//  3b. RECUSOU — o Diabo cobra à força: três garradas e um rasgo que arremessa, sangramento forte e um Transtorno curto.
export const devilDeal = {
  canStart: (f) => !!f.opponent && f.opponent.state !== 'ko',
  start(f, sp, world) {
    const opp = f.opponent;
    const tl = new Timeline();
    const col = sp.color ?? 0xff2a3d;
    world.beginCinematic(f, opp);
    f.vel.set(0, 0, 0);
    f.anim.play('vanish', { restart: true, duration: 0.3 });
    world.audio.play('teleport', { pitch: 0.6 });
    world.fx.burst(new THREE.Vector3(f.pos.x, 0.3, f.pos.z), { count: 26, color: 0x9a0010, speed: 3, up: 3, life: 0.6, size: 0.22, gravity: 8 });
    const offer = { choice: null, cpuDecided: false, blockWas: !!(opp.input && opp.input.held.block) };
    let ended = false;
    const end = () => {
      if (ended) return;
      ended = true;
      opp.pactOffer = null;
      world.endCinematic();
    };

    // 1. sai pelo Símbolo do Pacto na frente do adversário
    tl.add(0.3, () => {
      const F = forwardFromYaw(opp.yaw, new THREE.Vector3());
      const want = { x: opp.pos.x + F.x * 1.5, z: opp.pos.z + F.z * 1.5 };
      const spot = findFreeSpotNear(world.arena, want.x, want.z, { radius: f.radius, others: [{ x: opp.pos.x, z: opp.pos.z, r: 0.9 }] }) || want;
      f.pos.set(spot.x, 0, spot.z);
      f.yaw = yawTo(f.pos, opp.pos);
      opp.yaw = yawTo(opp.pos, f.pos);
      addBloodPool(world, f, f.pos.x, f.pos.z, { radius: 1.3, life: 8 });
      world.fx.burst(new THREE.Vector3(f.pos.x, 0.3, f.pos.z), { count: 30, color: 0x9a0010, speed: 3, up: 4, life: 0.6, size: 0.22, gravity: 8 });
      f.anim.play('point', { restart: true, duration: 1.2 });
      // o Diabo é grande (size): a câmera afasta e sobe na mesma proporção
      const k = (f.def.stats && f.def.stats.size) || 1;
      world.cameraRig.playShots([
        faceClose(f, { dur: 0.75, from: 3.4 * k, to: 2.6 * k, side: 0.5, height: 1.55 * k }),
        twoShot(f, opp, { dur: sp.choice + 0.3, dist: 4.6 * k, height: 1.5 * k, lookH: 1.2 * k, push: 0.5 }),
      ]);
      world.showBanner(sp.banner || 'Eu vim te oferecer um pacto', f.def.color);
      world.audio.play('fearGaze', { volume: 0.8, pitch: 0.6 });
      opp.pactOffer = offer;
    });
    // o Símbolo do Pacto brilha no chão entre os dois (anéis em sequência)
    for (let i = 0; i < 3; i++) {
      tl.add(0.35 + i * 0.15, () => {
        const mid = new THREE.Vector3((f.pos.x + opp.pos.x) / 2, 0.06, (f.pos.z + opp.pos.z) / 2);
        world.fx.ring(mid, { color: 0x9a0010, radius: 0.9 + i * 0.75, life: 1.6 });
      });
    }

    // 2. a escolha da vítima
    const t0 = 0.75;
    tl.each((time) => {
      if (offer.choice || time < t0 || time > t0 + sp.choice) return;
      opp.notify('PACTO — GOLPE ACEITA · DEFESA RECUSA', true);
      const inp = opp.input;
      if (!inp) return;
      if (inp.pressed.physical) offer.choice = 'accept';
      else if (inp.held.block && !offer.blockWas) offer.choice = 'refuse';
      if (!inp.held.block) offer.blockWas = false; // segurava Defesa antes da oferta: precisa soltar e apertar de novo
    });
    tl.add(t0, () => world.showBanner('Golpe aceita · Defesa recusa', '#e8c070')); // a escolha, grande no meio da tela
    tl.add(t0 + sp.choice, () => { if (!offer.choice) offer.choice = 'accept'; }); // quem cala consente

    // 3. o resultado
    let outcome = null;
    tl.each((time) => {
      if (outcome || !offer.choice || time < t0) return;
      outcome = offer.choice;
      opp.pactOffer = null;
      opp.message = null;
      if (outcome === 'accept') accept(time);
      else refuse(time);
    });

    function transtorno(time, takenMult, drain) {
      const old = opp.findBuff('transtornado');
      if (old) old.done = true;
      const smoke = world.fx.emitter({ rate: 16, follow: () => opp.chestPos(), particle: { color: 0x3a0006, kind: 'smoke', speed: 0.4, up: 0.8, spread: 0.3, life: 0.6, size: 0.4 } });
      opp.addBuff({
        type: 'transtornado', name: 'TRANSTORNADO (PACTO)', time, duration: time, noBlock: true, takenMult,
        onTick(dt) {
          if (!drain) return;
          // a sanidade do presente escorre de volta para o Diabo
          const d = Math.min(opp.energy, drain * dt);
          opp.energy -= d;
          if (f.state !== 'ko') f.addEnergy(d * 0.5);
        },
        onEnd() { smoke.stop(); },
      });
    }

    function accept(at) {
      world.showBanner('Pacto feito', f.def.color);
      world.audio.play('ritual', { pitch: 0.5 });
      // o presente: ele cumpre a parte dele
      opp.health = Math.min(opp.maxHealth, opp.health + opp.maxHealth * sp.giftHeal);
      opp.energy = opp.maxEnergy;
      world.fx.burst(opp.chestPos(), { count: 40, color: 0xffd070, speed: 3, up: 2, life: 0.7, size: 0.16 });
      // o preço: distorcido
      transtorno(sp.duration, sp.takenMult, sp.drain);
      f.health = Math.min(f.maxHealth, f.health + sp.heal);
      opp.notify('TRANSTORNADO', true);
      tl.add(at + 0.6, end);
      tl.end(at + 0.65);
    }

    function refuse(at) {
      world.showBanner('Recusou o pacto', f.def.color);
      world.audio.play('slashFinal', { pitch: 0.7 });
      const dir = () => new THREE.Vector3().subVectors(opp.pos, f.pos).setY(0).normalize();
      ['db_claw_r', 'db_claw_l', 'db_cross'].forEach((anim, i) => {
        tl.add(at + 0.12 + i * 0.26, () => {
          f.anim.play(anim, { restart: true, duration: 0.28 });
          world.fx.slash(new THREE.Vector3(f.pos.x, f.pos.y + 1.4, f.pos.z), f.yaw, { color: col, radius: 2, arc: 2.4, life: 0.2, width: 0.4, roll: i % 2 ? -0.6 : 0.6 });
          applyHit(world, f, opp, { damage: sp.refuseHit, kind: 'special', element: 'sangue', knockback: 0, reaction: false, unblockable: true, ignoreInvuln: true, dir: dir(), sound: 'clawHit', color: col, scale: 1.2 });
        });
      });
      tl.add(at + 0.95, () => {
        f.anim.play('db_rend', { restart: true, duration: 0.5 });
        end();
        applyHit(world, f, opp, { damage: sp.refuseFinal, kind: 'special', element: 'sangue', knockback: 6, launch: true, unblockable: true, ignoreInvuln: true, dir: dir(), sound: 'heavyPunch', color: col, scale: 2 });
        if (opp.state !== 'ko') {
          opp.applyBleed({ dps: 8, duration: 3 }, f);
          transtorno(sp.refuseDuration, sp.refuseTaken, 0);
        }
        world.cameraRig.shake(0.5, 0.35);
      });
      tl.end(at + 1.2);
    }

    tl.end(t0 + sp.choice + 2);
    return {
      update: (dt) => {
        const done = tl.update(dt);
        if (done) end();
        return done;
      },
      cancel: end,
    };
  },
};
