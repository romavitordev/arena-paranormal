import * as THREE from 'three';
import { Timeline, yawTo, distXZ, forwardFromYaw, angleDiff, DEG } from '../core/util.js';
import { ABILITY_TYPES } from './abilities.js';
import { applyHit } from './damage.js';
import { spikedLantern } from '../models/weapons.js';

// ------------------------------------------------------------------ CRISTINO (Transtornados, Hexatombe)
// O cangaceiro que caçou o Quibungo com LAMPIÕES EXPLOSIVOS (wiki, Episódio 5): espalhou lamparinas no caminho do
// bicho, contou até três e atirou na primeira — o fogo pulou de lampião em lampião até o amontoado, e o tiro nos
// barris fez a explosão enorme. No jogo:
//   LAMPIÃO EXPLOSIVO   arremessa um lampião que estoura e deixa FOGO NO CHÃO
//   TRILHA DE LAMPIÕES  planta lampiões (até 3) que estouram quando o adversário pisa perto
//   o TIRO DA SOCADEIRA detona os lampiões dele que estão à frente, EM CADEIA (o fogo pulando de um para o outro)
const seqFrom = (tl, extra = {}) => ({ update: (dt) => tl.update(dt), ...extra });
export const FIRE = 0xff7a2a;

const foeOf = (world, owner) => (world.opponentOf ? world.opponentOf(owner) : owner.opponent);

// FOGO NO CHÃO: queima quem é do outro lado e fica em cima (dano por segundo); some sozinho
export function addFireZone(world, owner, x, z, { radius = 1.6, life = 5, dps = 14 } = {}) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ color: 0xff5a10, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.045, z);
  mesh.renderOrder = 1;
  world.scene.add(mesh);
  let t = 0;
  let acc = 0;
  let npcT = 0;
  world.addTicker({
    update(dt) {
      t += dt;
      const k = t / life;
      mesh.scale.setScalar(radius * Math.min(1, t / 0.2));
      mesh.material.opacity = 0.5 * (k > 0.75 ? (1 - k) / 0.25 : 1) * (0.85 + 0.15 * Math.sin(t * 17));
      // as chamas subindo
      if (Math.random() < dt * 28 * (1 - k * 0.6)) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius * 0.9;
        world.fx.burst(new THREE.Vector3(x + Math.cos(a) * r, 0.1, z + Math.sin(a) * r), { count: 2, color: Math.random() < 0.5 ? FIRE : 0xffd070, speed: 0.6, up: 2.6, life: 0.45, size: 0.32 });
      }
      if (Math.random() < dt * 4) world.fx.burst(new THREE.Vector3(x, 0.6, z), { count: 1, color: 0x2a2220, kind: 'smoke', speed: 0.4, up: 1.4, life: 1.0, size: 0.8, grow: 1 });
      // queima o adversário que está em cima
      const foe = foeOf(world, owner);
      if (foe && foe.state !== 'ko' && foe.onGround && !foe.isInvulnerable() && Math.hypot(foe.pos.x - x, foe.pos.z - z) <= radius + foe.radius * 0.4) {
        acc += dps * dt;
        if (!foe.findBuff('burn')) foe.addBuff({ type: 'burn', name: 'QUEIMANDO', time: 0.3, duration: 0.3 });
        else foe.findBuff('burn').time = 0.3;
        if (acc >= 1) {
          const n = Math.floor(acc);
          acc -= n;
          foe.takeDamage(n);
          if (Math.random() < 0.4) world.fx.burst(foe.chestPos(), { count: 3, color: FIRE, speed: 1.2, up: 2, life: 0.35, size: 0.25 });
          world.onHit && world.onHit(owner, foe, n, { kind: 'burn' });
        }
      }
      npcT += dt;
      if (npcT >= 0.5) {
        npcT = 0;
        const c = new THREE.Vector3(x, 0.5, z);
        for (const n of world.npcs || []) if (n.alive && n.owner !== owner && n.hitTest(c, radius)) n.hitBy(owner, Math.round(dps * 0.5), { kind: 'ability' });
      }
      return t >= life;
    },
    dispose() {
      world.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    },
  });
}

// a explosão de um lampião: fogo, onda e o FOGO NO CHÃO que fica
export function lanternBlast(world, owner, pos, a) {
  const c = new THREE.Vector3(pos.x, 0.4, pos.z);
  world.fx.play('FX_EXPLOSION', c, { color: FIRE, scale: a.radius ?? 2.2 });
  world.fx.burst(c, { count: 26, color: 0xffd070, speed: 7, up: 2, life: 0.5, size: 0.3 });
  world.fx.burst(c, { count: 10, color: 0xc8c4bc, speed: 9, life: 0.4, size: 0.08 }); // os espinhos do lampião voando
  world.audio.play('explosion', { volume: 0.9 });
  world.cameraRig.shake(0.3, 0.2);
  const foe = foeOf(world, owner);
  const R = a.radius ?? 2.2;
  if (a.damage && foe && foe.state !== 'ko' && !foe.isInvulnerable() && Math.hypot(foe.pos.x - c.x, foe.pos.z - c.z) <= R + foe.radius && foe.pos.y < 2.6) {
    applyHit(world, owner, foe, {
      damage: a.damage, kind: 'ability', knockback: a.knockback ?? 3, hitstun: a.hitstun ?? 0.5, launch: !!a.launch, lowLaunch: !!a.launch, fire: true,
      dir: new THREE.Vector3(foe.pos.x - c.x, 0, foe.pos.z - c.z).normalize(), color: FIRE, sound: 'heavyPunch', scale: 1.4,
    });
  }
  for (const n of world.npcs || []) if (n.alive && n.owner !== owner && n.hitTest(c, R)) n.hitBy(owner, a.damage || 0, { kind: 'ability' });
  if (a.fire) addFireZone(world, owner, c.x, c.z, a.fire);
}

// LAMPIÕES PLANTADOS no chão (Trilha de Lampiões e as sobras do especial): estouram quando o adversário pisa perto ou
// quando o tiro da Socadeira os detona
export function lanternsOf(world, owner) {
  return (world.lanterns || []).filter((L) => L.owner === owner && !L.dead);
}

export function explodeLantern(world, L) {
  if (L.dead) return;
  L.dead = true;
  world.scene.remove(L.mesh);
  lanternBlast(world, L.owner, L.pos, L.a);
}

export function placeLantern(world, owner, pos, a) {
  if (!world.lanterns) world.lanterns = [];
  const mine = lanternsOf(world, owner);
  // o máximo por dono: o mais velho apaga (sem explodir)
  if (mine.length >= (a.max ?? 3)) { mine[0].dead = true; world.scene.remove(mine[0].mesh); }
  const mesh = spikedLantern();
  mesh.scale.setScalar(1.35);
  mesh.position.set(pos.x, 0.16, pos.z);
  world.scene.add(mesh);
  const L = { owner, pos: new THREE.Vector3(pos.x, 0, pos.z), a, mesh, t: 0, dead: false };
  world.lanterns.push(L);
  const flame = mesh.userData.flame;
  world.addTicker({
    update(dt) {
      if (L.dead) return true;
      L.t += dt;
      if (flame) flame.scale.set(1 + Math.sin(L.t * 23) * 0.15, 1.6 + Math.sin(L.t * 17) * 0.25, 1);
      if (L.t > (a.life ?? 20)) { L.dead = true; world.scene.remove(mesh); return true; }
      const foe = foeOf(world, owner);
      if (L.t >= (a.armTime ?? 0.5) && foe && foe.state !== 'ko' && foe.onGround && !foe.isInvulnerable() && Math.hypot(foe.pos.x - L.pos.x, foe.pos.z - L.pos.z) <= (a.trigger ?? 1.0) + foe.radius) {
        explodeLantern(world, L);
        return true;
      }
      return false;
    },
    dispose() {
      if (!L.dead) { L.dead = true; world.scene.remove(mesh); }
      const i = world.lanterns.indexOf(L);
      if (i >= 0) world.lanterns.splice(i, 1);
    },
  });
  return L;
}

// O TIRO NO LAMPIÃO: o disparo da Socadeira detona, em cadeia, os lampiões dele que estão à frente (cone)
export function detonateLanterns(world, f, { range = 18, arc = 80 } = {}) {
  const list = lanternsOf(world, f)
    .filter((L) => distXZ(f.pos, L.pos) <= range && Math.abs(angleDiff(f.yaw, yawTo(f.pos, L.pos))) <= (arc * DEG) / 2)
    .sort((a, b) => distXZ(f.pos, a.pos) - distXZ(f.pos, b.pos));
  if (!list.length) return 0;
  const from = f.chestPos();
  world.fx.tracer(from, new THREE.Vector3(list[0].pos.x, 0.3, list[0].pos.z), { color: 0xffd27a, life: 0.12, width: 0.04 });
  let t = 0;
  let i = 0;
  world.addTicker({
    update(dt) {
      t += dt;
      // o fogo pula de um lampião para o próximo
      while (i < list.length && t >= 0.06 + i * 0.14) {
        if (i > 0) world.fx.tracer(new THREE.Vector3(list[i - 1].pos.x, 0.3, list[i - 1].pos.z), new THREE.Vector3(list[i].pos.x, 0.3, list[i].pos.z), { color: FIRE, life: 0.18, width: 0.08 });
        explodeLantern(world, list[i]);
        i++;
      }
      return i >= list.length;
    },
  });
  if (list.length > 1) f.notify('FOGO EM CADEIA!', true);
  return list.length;
}

// um lampião arremessado em arco até um ponto do chão; ao chegar, chama `land(pos)`
export function lobLantern(world, from, to, flight, land) {
  const mesh = spikedLantern();
  mesh.scale.setScalar(1.3);
  mesh.position.copy(from);
  world.scene.add(mesh);
  const start = from.clone();
  const target = new THREE.Vector3(to.x, 0.16, to.z);
  const h = 1.2 + start.distanceTo(target) * 0.12;
  let t = 0;
  const lob = { mesh, done: false };
  world.addTicker({
    update(dt) {
      t += dt;
      const u = Math.min(1, t / flight);
      mesh.position.lerpVectors(start, target, u);
      mesh.position.y += Math.sin(u * Math.PI) * h;
      mesh.rotation.x += dt * 9;
      if (u >= 1) { lob.done = true; land(target, mesh); return true; }
      return false;
    },
    dispose() { world.scene.remove(mesh); },
  });
  return lob;
}

Object.assign(ABILITY_TYPES, {
  // △ → ○  LAMPIÃO EXPLOSIVO: arremessa o lampião onde o adversário está; estoura e deixa fogo no chão
  lanternThrow: {
    start(f, a, world) {
      const tl = new Timeline();
      const opp = f.opponent;
      f.vel.set(0, 0, 0);
      if (opp) f.yaw = yawTo(f.pos, opp.pos);
      f.anim.play(a.anim || 'throw_r', { restart: true, duration: a.windup + a.recovery });
      if (a.showProp) f.rig.showProp(a.showProp, true);
      if (a.hideProp) f.rig.showProp(a.hideProp, false);
      const restore = () => {
        if (a.showProp) f.rig.showProp(a.showProp, false);
        if (a.hideProp) f.rig.showProp(a.hideProp, true);
      };
      tl.add(a.windup, () => {
        if (a.showProp) f.rig.showProp(a.showProp, false);
        const hand = f.rig.sockets.handR.getWorldPosition(new THREE.Vector3());
        hand.y = Math.max(hand.y, 1.3);
        const F = forwardFromYaw(f.yaw);
        const aim = opp && opp.state !== 'ko' && distXZ(f.pos, opp.pos) <= (a.range ?? 14)
          ? opp.pos.clone()
          : new THREE.Vector3(f.pos.x + F.x * (a.range ?? 14) * 0.6, 0, f.pos.z + F.z * (a.range ?? 14) * 0.6);
        lobLantern(world, hand, aim, a.flight ?? 0.55, (p) => lanternBlast(world, f, p, a));
        world.audio.play('knifeThrow');
      });
      tl.add(a.windup + a.recovery - 0.02, () => { if (a.hideProp) f.rig.showProp(a.hideProp, true); });
      tl.end(a.windup + a.recovery);
      return seqFrom(tl, { cancel: restore });
    },
  },

  // △ → □  TRILHA DE LAMPIÕES: agacha e planta um lampião à frente (até 3); estoura quando o adversário pisa perto —
  // ou quando o tiro da Socadeira passa por ele
  lanternTrap: {
    start(f, a, world) {
      const tl = new Timeline();
      f.vel.set(0, 0, 0);
      f.anim.play(a.anim || 'sniper_kneel', { restart: true, duration: 0.55 });
      if (a.showProp) f.rig.showProp(a.showProp, true);
      if (a.hideProp) f.rig.showProp(a.hideProp, false);
      const restore = () => {
        if (a.showProp) f.rig.showProp(a.showProp, false);
        if (a.hideProp) f.rig.showProp(a.hideProp, true);
      };
      tl.add(0.32, () => {
        if (a.showProp) f.rig.showProp(a.showProp, false);
        const F = forwardFromYaw(f.yaw);
        const p = new THREE.Vector3(f.pos.x + F.x * (a.distance ?? 1.3), 0, f.pos.z + F.z * (a.distance ?? 1.3));
        if (world.arena.blocksPoint(new THREE.Vector3(p.x, 0.5, p.z), 0.3)) p.set(f.pos.x, 0, f.pos.z);
        placeLantern(world, f, p, a);
        world.fx.burst(new THREE.Vector3(p.x, 0.3, p.z), { count: 10, color: 0xffd070, speed: 1.5, up: 1.5, life: 0.4, size: 0.15 });
        world.audio.play('grenadePin', { volume: 0.6 });
        f.notify(`LAMPIÃO ${lanternsOf(world, f).length}/${a.max ?? 3}`);
      });
      tl.add(0.5, () => { if (a.hideProp) f.rig.showProp(a.hideProp, true); });
      tl.end(0.55);
      return seqFrom(tl, { cancel: restore });
    },
  },
});
