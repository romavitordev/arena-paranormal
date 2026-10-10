import * as THREE from 'three';
import { clamp, angleDiff } from '../core/util.js';

// Câmera de luta em arena, no estilo dos jogos de arena 3D (ref.: Naruto Storm 4):
//  - mira o ponto médio entre os dois e fica de LADO para a linha que os une
//  - essa linha não "vira" 180° quando os dois trocam de lugar (sem flip)
//  - quando estão colados, congela a direção (evita giro à toa)
//  - gira com velocidade angular limitada (teleporte/puxão não chicoteiam a câmera)
//  - distância e altura amortecidas separadamente; pulo quase não mexe na altura
//  - objetos do cenário entre a câmera e os lutadores ficam transparentes
//    (em vez de empurrar a câmera para frente aos trancos)
//  - toca planos cinematográficos nos especiais
const v1 = new THREE.Vector3();
const ray = new THREE.Raycaster();

export const CAMERA_CFG = {
  fov: 46,
  minDistance: 6.2,
  maxDistance: 24,
  margin: 2.2, // espaço extra nas laterais da tela
  baseHeight: 1.7,
  heightPerDistance: 0.17,
  lookHeight: 1.05,
  yawBias: 0.16, // leve rotação em 3/4 (rad) para dar profundidade
  maxYawSpeed: 2.2, // rad/s
  yawDamping: 5,
  distanceDamping: 3.2,
  targetDamping: 7,
  freezeAxisBelow: 1.6, // metros: abaixo disso a direção não muda
  occluderOpacity: 0.28,
};

export class CameraRig {
  constructor(camera, world) {
    this.camera = camera;
    this.world = world;
    this.pos = new THREE.Vector3(0, 6, 14);
    this.look = new THREE.Vector3(0, 1, 0);
    this.target = new THREE.Vector3(0, 1, 0);
    this.axis = new THREE.Vector3(1, 0, 0); // direção P1 → P2 sem sinal "pulando"
    this.yaw = 0; // ângulo atual da câmera em volta do ponto médio
    this.distance = 12;
    this.height = 3.5;
    this.shots = null;
    this.shakeAmt = 0;
    this.shakeTime = 0;
    this.basis = { forward: new THREE.Vector3(0, 0, -1), right: new THREE.Vector3(1, 0, 0) };
    this.faded = new Map(); // objeto → tempo restante transparente
    camera.fov = CAMERA_CFG.fov;
  }

  playShots(shots) {
    this.shots = { list: shots, i: 0, t: 0 };
  }

  stopShots() {
    if (this.shots) {
      // volta para o enquadramento de luta a partir de onde a cinematic parou
      const mid = this.midpoint(this.world.fighters);
      const d = v1.subVectors(this.pos, mid).setY(0);
      if (d.lengthSq() > 0.01) this.yaw = Math.atan2(d.x, d.z);
      this.distance = clamp(d.length(), CAMERA_CFG.minDistance, CAMERA_CFG.maxDistance);
    }
    this.shots = null;
  }

  shake(amount, time) {
    this.shakeAmt = Math.max(this.shakeAmt, amount);
    this.shakeTime = Math.max(this.shakeTime, time);
  }

  // Posiciona na hora (início de rodada)
  snap(fighters) {
    if (fighters.length === 2) {
      const [a, b] = fighters;
      this.axis.subVectors(b.pos, a.pos).setY(0).normalize();
      // P1 à esquerda da tela
      this.yaw = this.desiredYaw();
      this.distance = this.desiredDistance(fighters);
      this.height = CAMERA_CFG.baseHeight + this.distance * CAMERA_CFG.heightPerDistance;
      this.target.copy(this.midpoint(fighters));
    }
    this.update(0, fighters, true);
  }

  midpoint(fighters) {
    const [a, b] = fighters;
    const m = new THREE.Vector3().addVectors(a.pos, b.pos).multiplyScalar(0.5);
    // pulo mexe pouco na altura do alvo
    // combo aéreo: a câmera sobe junto (mantém os dois no quadro)
    m.y = Math.max(a.pos.y, b.pos.y) * 0.6 + CAMERA_CFG.lookHeight;
    // forma gigante (Deus da Morte, size 2): mira mais alto para caber o corpo inteiro
    const big = Math.max(a.size || 1, b.size || 1);
    if (big > 1) m.y += (big - 1) * 0.9;
    return m;
  }

  // Ângulo em que a câmera fica de lado para a linha P1→P2, com P1 à esquerda
  desiredYaw() {
    // perpendicular "à direita" da linha (vista de cima): câmera olhando para o meio
    const px = -this.axis.z;
    const pz = this.axis.x;
    return Math.atan2(px, pz) - CAMERA_CFG.yawBias;
  }

  desiredDistance(fighters) {
    const [a, b] = fighters;
    const sep = Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z);
    const vfov = (this.camera.fov * Math.PI) / 180;
    // janela minimizada / tela de tamanho zero: aspect vira NaN (0/0) e a distância, a câmera e a direção do controle
    // viravam NaN — os lutadores sumiam da arena (posição NaN) para sempre. Usa 16:9 enquanto não houver tamanho.
    const asp = Number.isFinite(this.camera.aspect) && this.camera.aspect > 0 ? this.camera.aspect : 16 / 9;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * asp);
    const fitW = (sep / 2 + CAMERA_CFG.margin) / Math.tan(hfov / 2);
    const vert = Math.abs(a.pos.y - b.pos.y);
    const big = Math.max(a.size || 1, b.size || 1);
    const fitH = (vert / 2 + 1.6 * big) / Math.tan(vfov / 2);
    return clamp(Math.max(fitW, fitH), CAMERA_CFG.minDistance, CAMERA_CFG.maxDistance);
  }

  update(dt, fighters, snap = false) {
    // lutador escondido da tela (Jae da CPU no "Shhh..."): a câmera enquadra onde ele foi visto por último, senão o
    // enquadramento entregava a posição dele (Fighter.camPos)
    fighters = fighters.map((f) => (f.camPos ? { pos: f.camPos, size: f.size } : f));
    const cam = this.camera;
    const C = CAMERA_CFG;
    if (this.shots) {
      const s = this.shots;
      let shot = s.list[s.i];
      s.t += dt;
      while (shot && s.t > shot.dur && s.i < s.list.length - 1) {
        s.t -= shot.dur;
        s.i++;
        shot = s.list[s.i];
      }
      if (shot) {
        const k = clamp(s.t / shot.dur, 0, 1);
        this.pos.copy(shot.pos(k));
        this.look.copy(shot.look(k));
        this.clampToArena(this.pos);
        cam.fov += ((shot.fov || 45) - cam.fov) * Math.min(1, dt * 10);
      }
    } else if (fighters.length === 2) {
      const [a, b] = fighters;
      const sep = Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z);
      // linha entre os dois: sem flip e congelada quando estão colados
      if (sep > C.freezeAxisBelow) {
        const nx = (b.pos.x - a.pos.x) / sep;
        const nz = (b.pos.z - a.pos.z) / sep;
        if (nx * this.axis.x + nz * this.axis.z < 0) this.axis.set(-nx, 0, -nz);
        else this.axis.set(nx, 0, nz);
      }
      // giro suave com velocidade máxima
      const want = this.desiredYaw();
      const diff = angleDiff(this.yaw, want);
      const step = snap ? diff : clamp(diff * Math.min(1, dt * C.yawDamping), -C.maxYawSpeed * dt, C.maxYawSpeed * dt);
      this.yaw += step;

      const wantDist = this.desiredDistance(fighters);
      this.distance += (wantDist - this.distance) * (snap ? 1 : Math.min(1, dt * C.distanceDamping));
      const wantH = C.baseHeight + this.distance * C.heightPerDistance;
      this.height += (wantH - this.height) * (snap ? 1 : Math.min(1, dt * C.distanceDamping));

      const mid = this.midpoint(fighters);
      this.target.lerp(mid, snap ? 1 : Math.min(1, dt * C.targetDamping));
      this.pos.set(
        this.target.x + Math.sin(this.yaw) * this.distance,
        this.target.y + this.height,
        this.target.z + Math.cos(this.yaw) * this.distance,
      );
      this.clampToArena(this.pos);
      this.avoidSolids(dt);
      this.look.copy(this.target);
      // se a parede não deixa recuar, abre a lente para continuar enquadrando os dois
      const real = this.pos.distanceTo(this.target);
      const full = Math.hypot(this.distance, this.height);
      let wantFov = C.fov;
      if (real < full - 0.05) {
        const t = Math.tan((C.fov * Math.PI) / 360) * (full / Math.max(1, real));
        wantFov = Math.min(84, (Math.atan(t) * 360) / Math.PI);
      }
      cam.fov += (wantFov - cam.fov) * (snap ? 1 : Math.min(1, dt * 5));
    }

    cam.position.copy(this.pos);
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const s = this.shakeAmt * Math.max(0, this.shakeTime / 0.3);
      cam.position.x += (Math.random() - 0.5) * s;
      cam.position.y += (Math.random() - 0.5) * s;
      if (this.shakeTime <= 0) this.shakeAmt = 0;
    }
    cam.lookAt(this.look);
    cam.updateProjectionMatrix();
    this.updateOcclusion(fighters, dt);

    // base para movimentação relativa à câmera. Na LAN vem só do ângulo da câmera (igual nos dois computadores; a
    // posição real muda com o tamanho da janela e com paredes)
    if (this.world.netplay) this.basis.forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    else cam.getWorldDirection(this.basis.forward);
    this.basis.forward.y = 0;
    this.basis.forward.normalize();
    // nunca deixa o controle com direção inválida (o lutador iria para NaN)
    if (!Number.isFinite(this.basis.forward.x) || this.basis.forward.lengthSq() < 0.5) this.basis.forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    this.basis.right.set(-this.basis.forward.z, 0, this.basis.forward.x);
  }

  // Bloco grande do cenário (cidade/cemitério juntados numa peça só) entre os lutadores e a câmera: em vez de ficar
  // atrás dele, a câmera chega para a frente do obstáculo (a lente abre sozinha para continuar enquadrando)
  // O raio contra os blocos é caro (milhares de triângulos): é refeito 10x por segundo e a distância livre fica guardada
  // para os quadros do meio.
  avoidSolids(dt = 1 / 60) {
    const solids = this.world.arena && this.world.arena.solids;
    if (!solids || !solids.length) return;
    const from = v1.copy(this.target);
    from.y += 0.6;
    const dir = new THREE.Vector3().subVectors(this.pos, from);
    const len = dir.length();
    if (len < 1) return;
    dir.divideScalar(len);
    this.solidTimer = (this.solidTimer || 0) - dt;
    if (this.solidTimer <= 0) {
      this.solidTimer = 0.1;
      ray.set(from, dir);
      ray.far = len;
      const hit = ray.intersectObjects(solids, false)[0];
      this.solidFree = hit && hit.distance > 1.5 ? hit.distance - 0.4 : null;
    }
    if (this.solidFree != null && this.solidFree < len) this.pos.copy(from).addScaledVector(dir, this.solidFree);
  }

  // Mantém a câmera dentro dos limites que a arena permitir (sem pulos bruscos)
  clampToArena(p) {
    const arena = this.world.arena;
    if (!arena) return;
    if (arena.clampCamera) {
      arena.clampCamera(p, this.world.fighters);
    } else {
      const maxR = arena.radius + 4;
      const r = Math.hypot(p.x, p.z);
      if (r > maxR) {
        p.x *= maxR / r;
        p.z *= maxR / r;
      }
    }
    if (p.y < 0.4) p.y = 0.4;
  }

  // Objetos entre a câmera e os lutadores ficam transparentes: raios até a cabeça, o peito e o quadril de cada um, e
  // também o objeto em que a câmera "entrou". Some na hora e volta 0,35 s depois de parar de tampar (sem piscar).
  updateOcclusion(fighters, dt = 1 / 60, force = false) {
    const occ = this.world.arena && this.world.arena.occluders;
    if (!occ || !occ.length) return;
    // 10x por segundo basta para sumir/voltar (os raios contra ~150 objetos custavam mais que a luta inteira)
    this.occTimer = (this.occTimer || 0) - dt;
    if (!force && this.occTimer > 0) return;
    dt = Math.max(dt, 0.1 - Math.max(0, this.occTimer));
    this.occTimer = 0.1;
    const cam = this.camera.position;
    const hits = new Set();
    for (const f of fighters) {
      if (!f.visible) continue;
      const chest = f.chestPos(v1);
      const s = f.def && f.def.stats && f.def.stats.size ? f.def.stats.size : 1;
      for (const dy of [0.55 * s, 0, -0.55 * s]) {
        const target = new THREE.Vector3(chest.x, chest.y + dy, chest.z);
        const dir = target.sub(cam);
        const len = dir.length();
        if (len < 0.5) continue;
        ray.set(cam, dir.divideScalar(len));
        ray.far = len - 0.4;
        for (const hit of ray.intersectObjects(occ, false)) hits.add(hit.object);
      }
    }
    for (const o of occ) {
      if (!o.userData.occBox) o.userData.occBox = new THREE.Box3().setFromObject(o).expandByScalar(0.3);
      if (o.userData.occBox.containsPoint(cam)) hits.add(o);
    }
    for (const o of hits) {
      if (!this.faded.has(o)) setFade(o, CAMERA_CFG.occluderOpacity);
      this.faded.set(o, 0.35);
    }
    for (const [o, t] of this.faded) {
      if (hits.has(o)) continue;
      if (t - dt > 0) this.faded.set(o, t - dt);
      else {
        setFade(o, 1);
        this.faded.delete(o);
      }
    }
  }
}

function setFade(obj, opacity) {
  // objetos do kit dividem o material: copia antes de deixar transparente (senão some toda casa igual)
  if (opacity < 1 && obj.userData.autoOcc && !obj.userData.ownMat) {
    obj.material = Array.isArray(obj.material) ? obj.material.map((m) => m.clone()) : obj.material.clone();
    obj.userData.ownMat = true;
  }
  const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
  for (const m of mats) {
    if (!m) continue;
    if (m.userData.fadeBase === undefined) m.userData.fadeBase = { t: m.transparent, o: m.opacity, d: m.depthWrite };
    const b = m.userData.fadeBase;
    m.transparent = opacity < 1 ? true : b.t;
    m.opacity = opacity < 1 ? opacity : b.o;
    m.depthWrite = opacity < 1 ? false : b.d;
    m.needsUpdate = true;
  }
}
