import { COMBAT } from '../config/combat.js';
import * as THREE from 'three';
import { applyHit } from './damage.js';
import { glowMat } from '../models/rig.js';
import { knife } from '../models/weapons.js';
import { createMistZone } from './abilities.js';

// Gerencia projéteis (balas, faca arremessada, ondas de corte, ondas de impacto).
// A aparência vem de `visual` na definição do ataque; a lógica é a mesma para todos.

const VISUALS = {
  // Decadenza (Dante): nuvem de fumaça preta com núcleo escuro e anel cinza
  decay(color) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 }));
    g.add(core);
    const haze = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 10), new THREE.MeshBasicMaterial({ color: 0x3a3444, transparent: true, opacity: 0.32, depthWrite: false }));
    g.add(haze);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 6, 24), glowMat(0x9a94ae, 0.6));
    g.add(ring);
    g.userData.spin = ring;
    return g;
  },
  bullet(color) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 5), glowMat(color, 1));
    m.geometry.rotateX(Math.PI / 2);
    return m;
  },
  sniper(color) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), glowMat(color, 1));
    core.geometry.rotateX(Math.PI / 2);
    g.add(core);
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.02, 3.2, 8), glowMat(0xff9a40, 0.35));
    halo.geometry.rotateX(Math.PI / 2);
    halo.position.z = -0.6;
    g.add(halo);
    return g;
  },
  knife(color) {
    const g = new THREE.Group();
    const k = knife();
    k.rotation.x = Math.PI / 2;
    g.add(k);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), glowMat(color, 0.35));
    g.add(glow);
    g.userData.spin = k;
    return g;
  },
  crossWave(color) {
    const g = new THREE.Group();
    for (const r of [0.75, -0.75]) {
      const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.8), glowMat(color, 0.95));
      blade.material.side = THREE.DoubleSide;
      blade.rotation.z = r;
      g.add(blade);
    }
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glowMat(0xffffff, 0.7));
    g.add(core);
    return g;
  },
  // Rebirth: tiro amaldiçoado com energia vermelha
  cursedSniper(color) {
    const g = VISUALS.sniper(color);
    const aura = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), glowMat(color, 0.6));
    aura.scale.set(1, 1, 4);
    g.add(aura);
    g.userData.lightning = true;
    return g;
  },
  // Mascarado: sombra rasteira com espinhos escuros
  shadow() {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.7, 20), new THREE.MeshBasicMaterial({ color: 0x050307, transparent: true, opacity: 0.85, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2;
    disc.scale.set(1, 1.8, 1);
    disc.position.y = -0.12;
    g.add(disc);
    const spikeMat = new THREE.MeshBasicMaterial({ color: 0x0a0608 });
    for (let i = 0; i < 4; i++) {
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 5), spikeMat);
      s.position.set((Math.random() - 0.5) * 0.6, 0.15, (Math.random() - 0.5) * 0.6);
      s.rotation.set((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6);
      g.add(s);
    }
    const rim = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.72, 24), glowMat(0xd01830, 0.6));
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = -0.1;
    g.add(rim);
    return g;
  },
  // Injustiça: ponta de lâmina presa na corrente
  chainHook(color) {
    const g = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.5, 4), new THREE.MeshToonMaterial({ color: 0x5b544a, emissive: 0x3a2a08 }));
    blade.rotation.x = Math.PI / 2;
    g.add(blade);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), glowMat(color, 0.5));
    g.add(glow);
    return g;
  },
  // granada (Erin): corpo arredondado com faixa colorida e alavanca; gira no ar
  grenade(color) {
    const g = new THREE.Group();
    const spin = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3a4a2a, roughness: 0.6 }));
    body.scale.set(1, 1.2, 1);
    spin.add(body);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 14), new THREE.MeshBasicMaterial({ color }));
    band.rotation.x = Math.PI / 2;
    spin.add(band);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 8), new THREE.MeshStandardMaterial({ color: 0x8a8a90, metalness: 0.7, roughness: 0.3 }));
    cap.position.y = 0.17;
    spin.add(cap);
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.015), cap.material);
    lever.position.set(0.09, 0.08, 0);
    lever.rotation.z = -0.3;
    spin.add(lever);
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), glowMat(0xffc040, 1));
    spark.position.y = 0.22;
    spin.add(spark);
    g.add(spin);
    g.userData.tumble = spin;
    return g;
  },
  // machado do Mutilador: cabo de madeira e lâmina vermelha, girando
  axe(color) {
    const g = new THREE.Group();
    const spin = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.75, 6), new THREE.MeshStandardMaterial({ color: 0x6a4428, roughness: 0.8 }));
    spin.add(handle);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.24), new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.6 }));
    blade.position.set(0, 0.26, 0.12);
    spin.add(blade);
    g.add(spin);
    g.userData.tumble = spin;
    return g;
  },
  // Skate Caótico (Xande): prancha amarela com raios verdes, girando
  skate(color) {
    const g = new THREE.Group();
    const spin = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.8), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
    spin.add(deck);
    for (const z of [-0.26, 0.26]) for (const x of [-0.09, 0.09]) {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8), new THREE.MeshStandardMaterial({ color: 0x3a3a3a }));
      wh.rotation.z = Math.PI / 2;
      wh.position.set(x, -0.04, z);
      spin.add(wh);
    }
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 0.7), glowMat(0x5aff6a, 0.6));
    glow.position.y = -0.025;
    spin.add(glow);
    g.add(spin);
    g.userData.spinY = spin;
    return g;
  },
  // Rajada Caótica (Labirinto): esfera de energia com coroa de faíscas
  chaos(color) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), glowMat(0xffffff, 0.9)));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), glowMat(color, 0.45)));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 4, 16), glowMat(color, 0.9));
    g.add(ring);
    g.userData.spin = ring;
    return g;
  },
  // chumbo de escopeta: pontinho brilhante
  pellet(color) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 4), glowMat(color, 1));
    return m;
  },
  shockwave(color) {
    const g = new THREE.Group();
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 6, 20, Math.PI), glowMat(color, 0.9));
    arc.rotation.set(0, 0, 0);
    g.add(arc);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 6, 16, Math.PI), glowMat(0xffffff, 0.8));
    g.add(inner);
    const fist = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), glowMat(color, 0.5));
    fist.position.y = 0.3;
    g.add(fist);
    g.userData.pulse = [arc, inner];
    return g;
  },
};

export class Projectiles {
  constructor(world) {
    this.world = world;
    this.list = [];
  }

  spawn(owner, ability, origin, dir) {
    // limite de disparos simultâneos: o mais antigo some quando passa do limite
    const vid = ability.volley ?? (owner.volleySeq = (owner.volleySeq || 0) + 1);
    const mine = [...new Set(this.list.filter((q) => q.owner === owner).map((q) => q.volley))];
    if (!mine.includes(vid) && mine.length >= COMBAT.maxVolleys) {
      const oldest = mine[0];
      for (const q of this.list.filter((x) => x.owner === owner && x.volley === oldest)) this.remove(q, true);
    }
    const mesh = (VISUALS[ability.visual] || VISUALS.bullet)(ability.color ?? 0xffffff);
    mesh.position.copy(origin);
    mesh.lookAt(origin.clone().add(dir));
    this.world.scene.add(mesh);
    const p = {
      owner, ability, mesh, volley: vid,
      pos: origin.clone(),
      dir: dir.clone().normalize(),
      traveled: 0,
      age: 0,
    };
    // arco (granada / machado arremessado): sai para cima e cai no alvo com gravidade
    if (ability.gravity) {
      const opp = this.world.opponentOf(owner);
      const flat = dir.clone().setY(0).normalize();
      let dist = ability.range * 0.5;
      let dy = 0;
      if (opp) {
        dist = Math.min(ability.range, Math.hypot(opp.pos.x - origin.x, opp.pos.z - origin.z));
        dy = (ability.lobTo === 'feet' ? 0.15 : opp.chestPos().y) - origin.y;
      }
      const t = Math.max(0.25, dist / ability.speed);
      p.vel = flat.multiplyScalar(dist / t);
      p.vel.y = (dy + 0.5 * ability.gravity * t * t) / t;
    }
    // corrente ligando a mão ao projétil (Injustiça)
    if (ability.chain) {
      const hand = owner.rig.sockets.handR;
      p.chainFx = this.world.fx.chain(() => hand.getWorldPosition(new THREE.Vector3()), () => p.pos.clone(), { links: 30, sag: 0.1, rope: !!ability.rope });
    }
    this.list.push(p);
  }

  // Efeitos extras ao acertar, definidos em `onHit` do ataque
  applyOnHit(p, target) {
    const a = p.ability;
    const w = this.world;
    if (!a.onHit || target.state === 'ko') return;
    if (a.onHit.pull) {
      // LANÇAR → PRENDER → PUXAR → COMBAR
      const o = p.owner;
      const F = new THREE.Vector3().subVectors(target.pos, o.pos).setY(0).normalize();
      const to = new THREE.Vector3(o.pos.x + F.x * (a.onHit.pull.distance ?? 1.6), target.pos.y, o.pos.z + F.z * (a.onHit.pull.distance ?? 1.6));
      target.pullTo(to, { time: a.onHit.pull.time ?? 0.3, after: a.onHit.pull.after ?? 0.6 });
      o.anim.play('chain_pull', { restart: true, duration: 0.4 });
      w.audio.play('chainPull');
      if (p.chainFx) {
        const fx = p.chainFx;
        const hand = o.rig.sockets.handR;
        fx.toFn = () => target.chestPos();
        fx.fromFn = () => hand.getWorldPosition(new THREE.Vector3());
        w.after((a.onHit.pull.time ?? 0.3) + 0.08, () => fx.stop());
        p.chainFx = null;
      }
      w.onPull && w.onPull(o, target);
    }
    if (a.onHit.stun) target.stun(a.onHit.stun, a.onHit.stunAnim || 'stagger');
    if (a.onHit.bleed) target.applyBleed(a.onHit.bleed, p.owner); // ex.: decadência da Decadenza
  }

  update(dt) {
    const w = this.world;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      const a = p.ability;
      p.age += dt;
      // zonas paranormais do adversário (névoa) desaceleram ou engolem projéteis
      let speed = a.speed;
      for (const z of w.zones) {
        if (z.owner === p.owner || !w.inZone(z, p.pos)) continue;
        if (z.eatsProjectiles) {
          w.fx.burst(p.pos, { count: 12, color: 0x7a4ab8, kind: 'smoke', speed: 1.5, life: 0.6, size: 0.6 });
          p.traveled = a.range;
        }
        if (z.projectileSlow) speed *= 1 - z.projectileSlow;
      }
      // bumerangue (Skate Caótico): vai até a metade do alcance e volta para a mão de quem jogou
      if (a.boomerang) {
        if (!p.back && p.traveled >= a.range * 0.5) p.back = true;
        if (p.back) {
          const home = p.owner.chestPos();
          const to = home.clone().sub(p.pos);
          if (to.length() < 0.9 || p.age > 3) {
            w.scene.remove(p.mesh);
            p.mesh.traverse((o) => { if (o.material) o.material.dispose(); });
            this.list.splice(i, 1);
            continue;
          }
          p.dir.lerp(to.normalize(), Math.min(1, dt * 10)).normalize();
          p.traveled = 0; // não "acaba o alcance" na volta
        }
        if (p.mesh.userData.spinY) p.mesh.userData.spinY.rotation.y += dt * 18;
      }
      if (a.visual === 'chaos' && Math.random() < 0.7) w.fx.lightning(p.pos, p.pos.clone().add(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(1.4)), { color: a.color, life: 0.08 });
      // projétil que procura o alvo (ex.: Corrente de Captura): gira devagar na direção dele
      if (a.homing) {
        const tg = w.opponentOf(p.owner);
        if (tg && tg.state !== 'ko' && tg.visible) {
          const want = tg.chestPos().sub(p.pos).normalize();
          const ang = p.dir.angleTo(want);
          if (ang > 1e-3) p.dir.lerp(want, Math.min(1, (a.homing * dt) / ang)).normalize();
          if (p.mesh) p.mesh.lookAt(p.pos.clone().add(p.dir));
        }
      }
      // projétil em arco: integra a velocidade com gravidade; explode no chão
      if (p.vel) {
        const prev = p.pos.clone();
        p.vel.y -= a.gravity * dt;
        p.pos.addScaledVector(p.vel, dt);
        p.traveled += p.vel.length() * dt;
        if (p.mesh.userData.tumble) p.mesh.userData.tumble.rotation.x += dt * (a.visual === 'axe' ? 22 : 9);
        p.mesh.position.copy(p.pos);
        let dead = false;
        const target = w.opponentOf(p.owner);
        if (a.trail) w.fx.burst(p.pos, { count: 1, color: a.trail, kind: 'smoke', speed: 0.2, life: 0.4, size: 0.25 });
        if (target && target.state !== 'ko' && !target.isInvulnerable() && target.hitTestPoint(p.pos, a.radius)) {
          if (a.explode) this.explode(p);
          else {
            const res = applyHit(w, p.owner, target, {
              damage: a.damage, kind: a.kind || 'ranged', knockback: a.knockback, hitstun: a.hitstun,
              dir: p.vel.clone().setY(0).normalize(), color: a.color, sound: a.hitSound, scale: a.impactScale || 1, pos: p.pos.clone(),
              reaction: !(a.onHit && a.onHit.pull),
            });
            if (typeof res === 'number' && res >= 0) this.applyOnHit(p, target);
          }
          dead = true;
        } else if (p.pos.y <= 0.12 || w.arena.blocksPoint(p.pos, a.radius * 0.5) || p.age > 4) {
          p.pos.copy(prev).setY(Math.max(0.12, prev.y));
          if (a.explode) this.explode(p);
          else w.fx.burst(p.pos, { count: 8, color: a.color, speed: 2, life: 0.3, size: 0.25 });
          dead = true;
        }
        if (dead) {
          if (p.chainFx) p.chainFx.stop();
          w.scene.remove(p.mesh);
          p.mesh.traverse((o) => { if (o.material) o.material.dispose(); });
          this.list.splice(i, 1);
        }
        continue;
      }
      const stepLen = speed * dt;
      const steps = Math.max(1, Math.ceil(stepLen / 0.25));
      let dead = false;
      for (let s = 0; s < steps && !dead; s++) {
        const d = stepLen / steps;
        p.pos.addScaledVector(p.dir, d);
        p.traveled += d;
        if (a.visual === 'shockwave') p.pos.y = 0.55; // a onda corre pelo chão
        if (a.visual === 'shadow') p.pos.y = 0.12;
        const npc = w.npcs.find((n) => n.alive && n.owner !== p.owner && n.hitTest(p.pos, a.radius));
        if (npc) {
          npc.hitBy(p.owner, a.damage, { kind: 'ranged' });
          w.fx.impact(p.pos.clone(), a.color ?? 0xffffff, 0.8);
          dead = true;
          break;
        }
        const target = w.opponentOf(p.owner);
        if (!p.hitOnce && target && target.state !== 'ko' && !target.isInvulnerable() && target.hitTestPoint(p.pos, a.radius)) {
          const res = applyHit(w, p.owner, target, {
            damage: a.damage, kind: a.kind || 'ranged', knockback: a.knockback, hitstun: a.hitstun,
            dir: p.dir, color: a.color, sound: a.hitSound, scale: a.impactScale || 1, pos: p.pos.clone(),
            reaction: !(a.onHit && a.onHit.pull),
          });
          if (typeof res === 'number' && res >= 0) this.applyOnHit(p, target);
          if (a.boomerang && !p.back) { p.back = true; p.hitOnce = true; break; }
          if (a.cursed) {
            for (let k = 0; k < 4; k++) w.fx.lightning(p.pos, p.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3)), { color: a.color, life: 0.2 });
            w.fx.burst(p.pos, { count: 30, color: a.color, speed: 8, life: 0.5, size: 0.3 });
          }
          dead = true;
          break;
        }
        if (w.arena.blocksPoint(p.pos, a.radius * 0.5)) {
          w.fx.impact(p.pos, a.color, 0.6);
          dead = true;
          break;
        }
        if (p.traveled >= a.range && !a.boomerang) {
          w.fx.burst(p.pos, { count: 8, color: a.color, speed: 2, life: 0.3, size: 0.25 });
          dead = true;
        }
      }
      p.mesh.position.copy(p.pos);
      if (p.mesh.userData.spin) p.mesh.userData.spin.rotation.z += dt * 30;
      if (p.mesh.userData.pulse) {
        const s = 1 + Math.sin(p.age * 30) * 0.12 + p.age * 0.6;
        p.mesh.scale.setScalar(s);
      }
      // rastro
      if (a.visual === 'sniper') w.fx.burst(p.pos, { count: 2, color: 0xffd090, speed: 0.3, life: 0.5, size: 0.25, kind: 'smoke' });
      if (a.visual === 'crossWave') w.fx.burst(p.pos, { count: 2, color: a.color, speed: 1, life: 0.3, size: 0.3 });
      if (a.visual === 'shockwave') {
        w.fx.burst(p.pos.clone().setY(0.1), { count: 3, color: a.color, speed: 2, life: 0.4, size: 0.35, up: 0.8 });
        if (Math.random() < 0.25) w.fx.ring(p.pos.clone().setY(0.08), { color: a.color, radius: 1.6, life: 0.3 });
      }
      if (a.visual === 'cursedSniper' && Math.random() < 0.6) {
        w.fx.lightning(p.pos, p.pos.clone().add(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(1.6)), { color: a.color, life: 0.08 });
      }
      if (a.visual === 'shadow') w.fx.burst(p.pos.clone().setY(0.3), { count: 2, color: 0x0a0608, kind: 'smoke', speed: 0.8, up: 0.8, life: 0.5, size: 0.5 });
      if (a.visual === 'decay') w.fx.burst(p.pos, { count: 3, color: 0x0c0a0e, kind: 'smoke', speed: 0.5, up: 0.3, life: 0.7, size: 0.55 });
      if (dead) {
        if (p.chainFx) p.chainFx.stop();
        w.scene.remove(p.mesh);
        p.mesh.traverse((o) => { if (o.material) o.material.dispose(); });
        this.list.splice(i, 1);
      }
    }
  }

  // Explosão em área (granadas): fogo, onda, fumaça; acerta quem estiver no raio
  explode(p) {
    const a = p.ability;
    const E = a.explode;
    const w = this.world;
    const c = p.pos.clone();
    w.fx.flash(c, { color: E.color ?? 0xffb040, size: E.radius * 1.6, life: 0.18 });
    w.fx.ring(new THREE.Vector3(c.x, 0.08, c.z), { color: E.color ?? 0xff8030, radius: E.radius, life: 0.4 });
    w.fx.burst(c, { count: 40, color: E.color ?? 0xff9a30, speed: 9, up: 2, life: 0.5, size: 0.35 });
    w.fx.burst(c, { count: 16, color: 0x2a2420, kind: 'smoke', speed: 2.5, up: 1.2, life: 1.1, size: 1.1, grow: 1 });
    w.audio.play(E.sound || 'explosion', { volume: 1 });
    w.cameraRig.shake(0.35, 0.25);
    if (E.mist) {
      const center = c.clone().setY(0);
      createMistZone(w, p.owner, { center: () => center, radius: E.mist.radius, duration: E.mist.duration, slow: E.mist.slow, enemyRegen: E.mist.enemyRegen, eatsProjectiles: !!E.mist.eatsProjectiles, color: E.mist.color, density: 1 });
    }
    const target = w.opponentOf(p.owner);
    if (E.damage && target && target.state !== 'ko' && !target.isInvulnerable()) {
      const d = Math.hypot(target.pos.x - c.x, target.pos.z - c.z);
      if (d <= E.radius + target.radius && Math.abs(target.chestPos().y - c.y) < E.radius + 1) {
        const res = applyHit(w, p.owner, target, {
          damage: E.damage, kind: a.kind || 'ranged', knockback: E.knockback ?? 4, hitstun: E.hitstun ?? 0.5,
          launch: !!E.launch, lowLaunch: !!E.launch, guardCrush: E.guardCrush, element: a.element,
          dir: new THREE.Vector3(target.pos.x - c.x, 0, target.pos.z - c.z).normalize(), color: E.color ?? 0xff8030, sound: 'heavyPunch', scale: 1.4,
        });
        if (typeof res === 'number' && res >= 0) this.applyOnHit(p, target);
      }
    }
    for (const n of w.npcs) if (n.alive && n.owner !== p.owner && n.hitTest(c, E.radius)) n.hitBy(p.owner, E.damage || 0, { kind: 'ranged' });
  }

  // tira um projétil do campo (fizzle = some com uma fumacinha)
  remove(p, fizzle = false) {
    const i = this.list.indexOf(p);
    if (i < 0) return;
    if (fizzle) this.world.fx.burst(p.pos.clone(), { count: 6, color: 0x8a8090, kind: 'smoke', speed: 1, life: 0.3, size: 0.3 });
    if (p.chainFx) p.chainFx.stop();
    this.world.scene.remove(p.mesh);
    p.mesh.traverse((o) => { if (o.material) o.material.dispose(); });
    this.list.splice(i, 1);
  }

  clear() {
    for (const p of this.list) {
      this.world.scene.remove(p.mesh);
      if (p.chainFx) p.chainFx.stop();
    }
    this.list.length = 0;
  }
}
