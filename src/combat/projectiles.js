import { COMBAT } from '../config/combat.js';
import * as THREE from 'three';
import { applyHit } from './damage.js';
import { glowMat } from '../models/rig.js';
import { knife, mutilatorAxe, baluAxe } from '../models/weapons.js';
import { createMistZone } from './abilities.js';
import { addBloodPool } from './bloodPools.js';

const UP = new THREE.Vector3(0, 1, 0);

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
  // Kemi / Fantasma: bala de Morte — núcleo cinza-claro com uma espiral de lodo preto girando em volta
  deathSpiral(color) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 6), glowMat(color, 1));
    core.geometry.rotateX(Math.PI / 2);
    g.add(core);
    const spiral = new THREE.Group();
    const dark = new THREE.MeshBasicMaterial({ color: 0x0a080c });
    for (let i = 0; i < 14; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.05 - i * 0.0022, 6, 4), dark);
      const ang = i * 0.9;
      b.position.set(Math.cos(ang) * 0.14, Math.sin(ang) * 0.14, -i * 0.12);
      spiral.add(b);
    }
    g.add(spiral);
    g.userData.spin = spiral;
    return g;
  },
  // Pistola Transtornada: bala enrolada em arame farpado
  barbed(color) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), glowMat(color, 1));
    g.add(core);
    const wire = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 4, 14), new THREE.MeshBasicMaterial({ color: 0x8a8a90 }));
    g.add(wire);
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.07, 3), new THREE.MeshBasicMaterial({ color: 0x8a8a90 }));
      const a = (i / 6) * Math.PI * 2;
      s.position.set(Math.cos(a) * 0.11, Math.sin(a) * 0.11, 0);
      s.rotation.z = a - Math.PI / 2;
      wire.add(s);
    }
    g.userData.spin = wire;
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
  // Lança de Sangue (O Diabo): lança longa de sangue coagulado com farpas, ponta brilhando (aponta para +Z)
  bloodSpear(color) {
    const g = new THREE.Group();
    const dark = new THREE.MeshBasicMaterial({ color: 0x3a0006 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.8, 7), dark);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = -0.55;
    g.add(shaft);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 6), glowMat(color, 1));
    head.rotation.x = Math.PI / 2;
    head.position.z = 0.55;
    g.add(head);
    for (let i = 0; i < 6; i++) { // farpas para trás, em espiral
      const b = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.26, 4), glowMat(color, 0.85));
      const a = i * 2.1;
      b.position.set(Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0.2 - i * 0.2);
      b.rotation.set(-Math.PI / 2 + 0.5 * Math.sin(a), 0, 0);
      b.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), a);
      g.add(b);
    }
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), glowMat(color, 0.35));
    glow.position.z = 0.45;
    g.add(glow);
    return g;
  },
  // Lâmina de Sangue (Juan): meia-lua de sangue cortada pela faca, deitada, com o fio claro na frente (aponta para +Z)
  bloodCrescent(color) {
    const g = new THREE.Group();
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.07, 6, 28, Math.PI), glowMat(color, 0.95));
    arc.rotation.x = Math.PI / 2; // deitada no plano do chão, a curva para a frente
    arc.scale.set(1, 1, 0.35);
    g.add(arc);
    const edge = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.022, 4, 28, Math.PI), glowMat(0xffd0d0, 0.9));
    edge.rotation.x = Math.PI / 2;
    g.add(edge);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), glowMat(0x5a0008, 0.8));
    core.position.z = 0.55;
    g.add(core);
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
  // Joui: sombra rasteira com espinhos escuros
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
    // o mesmo machado da mão do Aguiar, girando em volta do meio do cabo
    const axe = mutilatorAxe();
    axe.position.y = 0.3;
    spin.add(axe);
    g.add(spin);
    g.userData.tumble = spin;
    return g;
  },
  // Skate Caótico (Xande): prancha amarela com raios verdes, girando
  // Machado em Giro (Balu): o Machado Lancinante girando de ponta a ponta (volta para a mão)
  baluAxe() {
    const g = new THREE.Group();
    const spin = new THREE.Group();
    const axe = baluAxe();
    axe.position.y = 0.33; // gira em volta do meio do cabo
    spin.add(axe);
    g.add(spin);
    g.userData.tumble = spin;
    return g;
  },
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
  // Disparo do Caos do Anfitrião: a cor diz o efeito; color2 = segunda cor (combinação) no anel. O PRETO tem miolo
  // escuro (sem brilho aditivo) com o anel roxo.
  chaos(color, a = {}) {
    const g = new THREE.Group();
    const dark = color < 0x303030;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), dark ? new THREE.MeshBasicMaterial({ color: 0x050008 }) : glowMat(0xffffff, 0.9)));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), dark ? new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, depthWrite: false }) : glowMat(color, 0.45)));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 4, 16), glowMat(a.color2 ?? color, 0.9));
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
    const mesh = (VISUALS[ability.visual] || VISUALS.bullet)(ability.color ?? 0xffffff, ability);
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
      o.anim.play(a.onHit.pull.anim || 'chain_pull', { restart: true, duration: 0.4 });
      w.audio.play(a.onHit.pull.sound || 'chainPull');
      if (p.chainFx) {
        const fx = p.chainFx;
        const hand = o.rig.sockets.handR;
        fx.toFn = () => target.chestPos();
        fx.fromFn = () => hand.getWorldPosition(new THREE.Vector3());
        w.after((a.onHit.pull.time ?? 0.3) + 0.08, () => fx.stop());
        p.chainFx = null;
      }
      w.onPull && w.onPull(o, target);
      // atrair → posicionar → atacar (Emissor do Arnaldo): quando o alvo chega, a espada já sai em estocada
      const follow = a.onHit.pull.follow;
      if (follow) {
        w.after((a.onHit.pull.time ?? 0.3) + 0.02, () => {
          if (o.state !== 'ranged' && o.state !== 'idle') return;
          if (o.seq && o.seq.cancel) o.seq.cancel();
          o.seq = null;
          o.setState('idle');
          o.startStrike(follow);
          w.cameraRig.shake(0.12, 0.12);
        });
      }
    }
    if (a.onHit.stun) target.stun(a.onHit.stun, a.onHit.stunAnim || 'stagger');
    if (a.onHit.impale) {
      // empalado: a lança atravessa e prende os pés no chão por um instante
      const old = target.findBuff('impaled');
      if (old) old.time = a.onHit.impale.time;
      else target.addBuff({ type: 'impaled', name: 'EMPALADO', time: a.onHit.impale.time, duration: a.onHit.impale.time, speedMult: a.onHit.impale.mult ?? 0.1 });
      w.fx.burst(target.chestPos(), { count: 22, color: a.color ?? 0xc01020, speed: 4, life: 0.5, size: 0.18, gravity: 8 });
    }
    if (a.onHit.bleed) target.applyBleed(a.onHit.bleed, p.owner); // ex.: decadência da Decadenza
    if (a.onHit.slow) {
      // ex.: arame farpado da Pistola Transtornada
      const old = target.findBuff(a.onHit.slow.type || 'projSlow');
      if (old) old.time = a.onHit.slow.time;
      else target.addBuff({ type: a.onHit.slow.type || 'projSlow', name: a.onHit.slow.name || 'LENTO', time: a.onHit.slow.time, duration: a.onHit.slow.time, speedMult: a.onHit.slow.mult });
    }
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
            this.giveBack(p);
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
      if (a.visual === 'chaos' && Math.random() < 0.7) w.fx.lightning(p.pos, p.pos.clone().add(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(1.4)), { color: a.color2 && (Math.random() < 0.5 || a.color < 0x303030) ? a.color2 : a.color, life: 0.08 });
      // BALA CURVA (Disparo Espiral da Fantasma — cânone: "nega toda cobertura que não seja completa"): com o alvo à
      // vista, vai direto nele; com parede/obstáculo no meio, calcula uma rota pelo mapa (refeita a cada 0,25 s) e segue
      // o ponto mais distante dela que já está à vista — passa por qualquer brecha (porta, vão, janela) e acerta. Só a
      // cobertura COMPLETA (sem rota) para a bala. É quase certeira, mas dá para ESQUIVAR: esquivando com ela perto,
      // a bala perde o alvo e segue reto.
      if (a.curve) {
        const tg = w.opponentOf(p.owner);
        if (tg && !p.lost && tg.state === 'dodge' && tg.pos.distanceTo(p.pos) < 7) p.lost = true;
        const alive = tg && tg.state !== 'ko' && tg.visible && !p.lost;
        let goal = null;
        if (alive) {
          const aim = tg.chestPos();
          if (this.clearLine(p.pos, aim, a.radius * 0.5)) {
            goal = aim;
            p.path = null;
          } else {
            p.replan = (p.replan || 0) - dt;
            if (!p.path || p.replan <= 0) {
              p.path = this.planPath(p.pos, aim, a.radius);
              p.replan = 0.25;
            }
            if (p.path) {
              // descarta os pontos já alcançados e mira no mais distante que já está à vista
              while (p.path.length > 1 && p.path[0].distanceTo(p.pos) < 0.5) p.path.shift();
              for (let k = Math.min(p.path.length - 1, 24); k >= 0; k--) {
                if (p.path[k].distanceTo(p.pos) > 0.3 && this.clearLine(p.pos, p.path[k], a.radius * 0.5)) { goal = p.path[k]; break; }
              }
            }
          }
        }
        if (goal) {
          const to = goal.clone().sub(p.pos);
          const dist = tg ? tg.pos.distanceTo(p.pos) : 20;
          const want = to.normalize();
          // seguindo a rota (contornando cobertura) ou já perto do alvo, a curva é fechada na hora (quase certeira);
          // de longe e à vista, curva forte mas suave
          if (p.path || dist < 14) p.dir.copy(want);
          else {
            const turn = a.homing * (1 + 2.5 * Math.max(0, 1 - dist / 14));
            const ang = p.dir.angleTo(want);
            if (ang > 1e-3) p.dir.lerp(want, Math.min(1, (turn * dt) / ang)).normalize();
          }
        }
        if (p.mesh) p.mesh.lookAt(p.pos.clone().add(p.dir));
      }
      // projétil que procura o alvo (ex.: Corrente de Captura): gira devagar na direção dele
      if (a.homing && !a.curve) {
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
              damage: a.damage, kind: a.kind || 'ranged', knockback: a.knockback, hitstun: a.hitstun, launch: !!a.launch, lowLaunch: !!a.launch,
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
          this.giveBack(p);
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
        // a.grow: a nuvem abre conforme anda (Decadenza: as cinzas sopradas se espalham) — raio × (1 + grow × fração)
        p.r = a.radius * (1 + (a.grow || 0) * Math.min(1, p.traveled / a.range));
        if (a.visual === 'shockwave') p.pos.y = 0.55; // a onda corre pelo chão
        if (a.visual === 'shadow') p.pos.y = 0.12;
        const npc = w.npcs.find((n) => n.alive && n.owner !== p.owner && n.hitTest(p.pos, p.r ?? a.radius));
        if (npc) {
          npc.hitBy(p.owner, a.damage, { kind: 'ranged' });
          w.fx.impact(p.pos.clone(), a.color ?? 0xffffff, 0.8);
          dead = true;
          break;
        }
        const target = w.opponentOf(p.owner);
        if (!p.hitOnce && target && target.state !== 'ko' && !target.isInvulnerable() && target.hitTestPoint(p.pos, p.r ?? a.radius)) {
          // Sniper da Morte: quem já está morrendo (pouca vida) leva o tiro inteiro da espiral
          const exec = a.execute && target.health / target.maxHealth <= a.execute.below ? a.execute.mult : 1;
          if (exec > 1) target.notify('ESPIRAL DA MORTE', true);
          const res = applyHit(w, p.owner, target, {
            damage: Math.round(a.damage * exec), kind: a.kind || 'ranged', knockback: a.knockback, hitstun: a.hitstun,
            unblockable: !!a.unblockable, guardCrush: a.guardCrush, element: a.element,
            dir: p.dir, color: a.color, sound: a.hitSound, scale: a.impactScale || 1, pos: p.pos.clone(),
            reaction: !(a.onHit && a.onHit.pull),
          });
          if (typeof res === 'number' && res >= 0) {
            this.applyOnHit(p, target);
            if (a.hitFn && target.state !== 'ko') a.hitFn(w, p.owner, target, p); // efeito da cor do Disparo do Caos
          }
          if (a.pool) addBloodPool(w, p.owner, target.pos.x, target.pos.z, a.pool);
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
          if (a.stick) this.stick(p);
          if (a.pool) this.poolBelow(p);
          dead = true;
          break;
        }
        if (p.traveled >= a.range && !a.boomerang) {
          w.fx.burst(p.pos, { count: 8, color: a.color, speed: 2, life: 0.3, size: 0.25 });
          if (a.expireFn) a.expireFn(w, p); // ex.: o tiro PRETO "falha" e volta de outra direção
          if (a.pool) this.poolBelow(p);
          dead = true;
        }
      }
      p.mesh.position.copy(p.pos);
      if (a.grow && p.r) p.mesh.scale.setScalar(p.r / a.radius);
      if (a.spiral) {
        // balas curvas puxadas pelas faixas: a bala desenha uma espiral em volta da linha de tiro
        const side = new THREE.Vector3().crossVectors(p.dir, new THREE.Vector3(0, 1, 0));
        if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
        side.normalize();
        const up = new THREE.Vector3().crossVectors(side, p.dir);
        const ang = p.age * (a.spiralFreq || 26);
        const amp = a.spiral * Math.min(1, p.age * 6);
        p.mesh.position.addScaledVector(side, Math.cos(ang) * amp).addScaledVector(up, Math.sin(ang) * amp);
      }
      if (p.mesh.userData.spin) p.mesh.userData.spin.rotation.z += dt * 30;
      if (p.mesh.userData.pulse) {
        const s = 1 + Math.sin(p.age * 30) * 0.12 + p.age * 0.6;
        p.mesh.scale.setScalar(s);
      }
      // rastro
      if (a.visual === 'sniper') w.fx.burst(p.pos, { count: 2, color: 0xffd090, speed: 0.3, life: 0.5, size: 0.25, kind: 'smoke' });
      if (a.visual === 'deathSpiral') {
        w.fx.burst(p.mesh.position, { count: 2, color: 0x0a080c, kind: 'smoke', speed: 0.3, life: 0.6, size: 0.3 });
        if (a.drip && Math.random() < 0.5) w.fx.burst(p.mesh.position, { count: 1, color: 0x050406, speed: 0.2, life: 0.6, size: 0.1, gravity: 9 }); // lodo pingando
      }
      if (a.visual === 'crossWave') w.fx.burst(p.pos, { count: 2, color: a.color, speed: 1, life: 0.3, size: 0.3 });
      if (a.visual === 'bloodCrescent' || a.visual === 'bloodSpear') w.fx.burst(p.pos, { count: 1, color: 0xa01018, speed: 0.4, life: 0.5, size: 0.1, gravity: 9 }); // pinga sangue no caminho
      if (a.visual === 'shockwave') {
        w.fx.burst(p.pos.clone().setY(0.1), { count: 3, color: a.color, speed: 2, life: 0.4, size: 0.35, up: 0.8 });
        if (Math.random() < 0.25) w.fx.ring(p.pos.clone().setY(0.08), { color: a.color, radius: 1.6, life: 0.3 });
      }
      if (a.visual === 'cursedSniper' && Math.random() < 0.6) {
        w.fx.lightning(p.pos, p.pos.clone().add(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(1.6)), { color: a.color, life: 0.08 });
      }
      if (a.visual === 'shadow') w.fx.burst(p.pos.clone().setY(0.3), { count: 2, color: 0x0a0608, kind: 'smoke', speed: 0.8, up: 0.8, life: 0.5, size: 0.5 });
      if (a.visual === 'decay') {
        // fumaça preta + CINZAS sopradas (cinza claro), abrindo junto com a nuvem
        const k = (p.r ?? a.radius) / a.radius;
        w.fx.burst(p.pos, { count: 3, color: 0x0c0a0e, kind: 'smoke', speed: 0.5 * k, up: 0.3, life: 0.7, size: 0.55 * k });
        w.fx.burst(p.pos, { count: 4, color: 0x8a8490, speed: 1.2 * k, spread: 0.6, life: 0.5, size: 0.07 });
      }
      if (dead) {
        if (p.chainFx) p.chainFx.stop();
        if (!p.stuck) {
          w.scene.remove(p.mesh);
          p.mesh.traverse((o) => { if (o.material) o.material.dispose(); });
        }
        this.giveBack(p);
        this.list.splice(i, 1);
      }
    }
  }

  // a lança fica cravada na parede por um tempo e some (o mesh passa a ser de um ticker do mundo)
  stick(p) {
    const w = this.world;
    const mesh = p.mesh;
    p.stuck = true;
    mesh.position.copy(p.pos).addScaledVector(p.dir, 0.25);
    let t = 0;
    w.addTicker({
      update(dt) { t += dt; return t >= 1.6; },
      dispose() {
        w.scene.remove(mesh);
        mesh.traverse((o) => { if (o.material) o.material.dispose(); });
      },
    });
  }

  // poça de sangue no chão embaixo de onde o projétil parou (Lança de Sangue)
  poolBelow(p) {
    const w = this.world;
    const back = p.pos.clone().addScaledVector(p.dir, -0.6); // um pouco antes da parede (do lado de dentro)
    if (w.arena.blocksPoint(new THREE.Vector3(back.x, 0.5, back.z), 0.3)) return;
    addBloodPool(w, p.owner, back.x, back.z, p.ability.pool);
  }

  // Explosão em área (granadas): fogo, onda, fumaça; acerta quem estiver no raio
  explode(p) {
    const a = p.ability;
    const E = a.explode;
    const w = this.world;
    const c = p.pos.clone();
    w.fx.play('FX_EXPLOSION', c, { color: E.color ?? 0xff9a30, scale: E.radius });
    w.audio.play(E.sound || 'explosion', { volume: 1 });
    w.cameraRig.shake(0.35, 0.25);
    if (E.mist) {
      const center = c.clone().setY(0);
      createMistZone(w, p.owner, { center: () => center, radius: E.mist.radius, duration: E.mist.duration, slow: E.mist.slow, enemyRegen: E.mist.enemyRegen, eatsProjectiles: !!E.mist.eatsProjectiles, color: E.mist.color, density: E.mist.pool ? 0.2 : 1, pool: E.mist.pool });
    }
    const target = w.opponentOf(p.owner);
    if (E.damage && target && target.state !== 'ko' && !target.isInvulnerable()) {
      const d = Math.hypot(target.pos.x - c.x, target.pos.z - c.z);
      if (d <= E.radius + target.radius && Math.abs(target.chestPos().y - c.y) < E.radius + 1) {
        const res = applyHit(w, p.owner, target, {
          damage: E.damage, kind: a.kind || 'ranged', knockback: E.knockback ?? 4, hitstun: E.hitstun ?? 0.5,
          launch: !!E.launch, lowLaunch: !!E.launch, guardCrush: E.guardCrush, element: a.element, stun: E.stun, fire: E.fire !== false,
          dir: new THREE.Vector3(target.pos.x - c.x, 0, target.pos.z - c.z).normalize(), color: E.color ?? 0xff8030, sound: 'heavyPunch', scale: 1.4,
        });
        if (typeof res === 'number' && res >= 0) this.applyOnHit(p, target);
      }
    }
    for (const n of w.npcs) if (n.alive && n.owner !== p.owner && n.hitTest(c, E.radius)) n.hitBy(p.owner, E.damage || 0, { kind: 'ranged' });
  }

  // tira um projétil do campo (fizzle = some com uma fumacinha)
  // linha livre de obstáculos entre dois pontos (amostras a cada 0,2 m)
  clearLine(a, b, radius) {
    const d = b.clone().sub(a);
    const n = Math.max(1, Math.ceil(d.length() / 0.2));
    const q = new THREE.Vector3();
    for (let i = 1; i <= n; i++) {
      q.copy(a).addScaledVector(d, i / n);
      if (this.world.arena.blocksPoint(q, radius)) return false;
    }
    return true;
  }

  // rota curta (busca em largura numa grade de 0,5 m em volta do trajeto) de `from` até `to`, na altura da bala;
  // devolve os pontos da rota ou null
  planPath(from, to, radius) {
    const C = 0.35; // grade fina: cabe numa brecha estreita
    const y = from.y;
    const x0 = Math.min(from.x, to.x) - 12;
    const z0 = Math.min(from.z, to.z) - 12;
    const nx = Math.min(200, Math.ceil((Math.abs(from.x - to.x) + 24) / C));
    const nz = Math.min(200, Math.ceil((Math.abs(from.z - to.z) + 24) / C));
    const cx = (x) => Math.max(0, Math.min(nx - 1, Math.round((x - x0) / C)));
    const cz = (z) => Math.max(0, Math.min(nz - 1, Math.round((z - z0) / C)));
    const q = new THREE.Vector3();
    const blocked = new Int8Array(nx * nz).fill(-1);
    const isBlocked = (i) => {
      if (blocked[i] < 0) {
        q.set(x0 + (i % nx) * C, y, z0 + Math.floor(i / nx) * C);
        blocked[i] = this.world.arena.blocksPoint(q, radius * 0.5) ? 1 : 0;
      }
      return blocked[i] === 1;
    };
    const startI = cz(from.z) * nx + cx(from.x);
    const goalI = cz(to.z) * nx + cx(to.x);
    const prev = new Int32Array(nx * nz).fill(-1);
    prev[startI] = startI;
    const queue = [startI];
    const steps = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (let h = 0; h < queue.length; h++) {
      const i = queue[h];
      if (i === goalI) break;
      const ix = i % nx;
      const iz = Math.floor(i / nx);
      for (const [dx, dz] of steps) {
        const jx = ix + dx;
        const jz = iz + dz;
        if (jx < 0 || jz < 0 || jx >= nx || jz >= nz) continue;
        const j = jz * nx + jx;
        if (prev[j] >= 0 || (j !== goalI && isBlocked(j))) continue;
        prev[j] = i;
        queue.push(j);
      }
    }
    if (prev[goalI] < 0) return null;
    const path = [];
    for (let i = goalI; i !== startI; i = prev[i]) path.push(new THREE.Vector3(x0 + (i % nx) * C, y, z0 + Math.floor(i / nx) * C));
    path.reverse();
    if (path.length) path[path.length - 1] = to.clone();
    return path;
  }

  // há obstáculo nos próximos `len` metros na direção `dir`?
  blockedAhead(pos, dir, len, radius) {
    const q = new THREE.Vector3();
    for (const k of [0.25, 0.5, 0.75, 1]) {
      q.copy(pos).addScaledVector(dir, len * k);
      if (this.world.arena.blocksPoint(q, radius)) return true;
    }
    return false;
  }

  // projétil que é a própria arma (a.returnsProp): a peça volta a aparecer na mão quando ele acaba
  giveBack(p) {
    const a = p.ability;
    if (a.returnsProp && p.owner && p.owner.rig && !(p.owner.propLock && p.owner.propLock[a.returnsProp]) && !this.list.some((q) => q !== p && q.owner === p.owner && q.ability.returnsProp === a.returnsProp)) {
      p.owner.rig.showProp(a.returnsProp, true);
    }
  }

  remove(p, fizzle = false) {
    const i = this.list.indexOf(p);
    if (i < 0) return;
    if (fizzle) this.world.fx.burst(p.pos.clone(), { count: 6, color: 0x8a8090, kind: 'smoke', speed: 1, life: 0.3, size: 0.3 });
    this.giveBack(p);
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
