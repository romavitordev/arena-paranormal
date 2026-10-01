import * as THREE from 'three';
import { forwardFromYaw, lerp, smooth } from '../core/util.js';

// Enquadramentos de câmera cinematográfica reutilizáveis pelos especiais.
// Cada função devolve { dur, pos(t)→Vector3, look(t)→Vector3, fov }
// t vai de 0 a 1 dentro do plano. Posições são calculadas a partir dos
// personagens envolvidos, então funcionam em qualquer ponto da arena.

const right = (yaw) => new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

function rel(f, fwd, side, up) {
  const F = forwardFromYaw(f.yaw);
  const R = right(f.yaw);
  return new THREE.Vector3(f.pos.x, f.pos.y + up, f.pos.z).addScaledVector(F, fwd).addScaledVector(R, side);
}

// Close no rosto, de frente, aproximando
export function faceClose(f, { dur = 1, from = 2.4, to = 1.3, side = 0.35, height = 1.55, fov = 38 } = {}) {
  return {
    dur, fov,
    pos: (t) => rel(f, lerp(from, to, smooth(t)), side, height),
    look: () => rel(f, 0, 0, height - 0.05),
  };
}

// Orbita lenta ao redor do personagem
export function orbit(f, { dur = 1, radius = 3.2, height = 1.4, a0 = -0.6, a1 = 0.6, lookH = 1.1, fov = 45 } = {}) {
  return {
    dur, fov,
    pos: (t) => {
      const a = f.yaw + lerp(a0, a1, smooth(t));
      return new THREE.Vector3(f.pos.x + Math.sin(a) * radius, f.pos.y + height, f.pos.z + Math.cos(a) * radius);
    },
    look: () => new THREE.Vector3(f.pos.x, f.pos.y + lookH, f.pos.z),
  };
}

// Plano lateral com os dois personagens
export function twoShot(a, b, { dur = 1, dist = 3.2, height = 1.4, push = 0.6, side = 1, fov = 40, lookH = 1.3 } = {}) {
  return {
    dur, fov,
    pos: (t) => {
      const mid = new THREE.Vector3().addVectors(a.pos, b.pos).multiplyScalar(0.5);
      const axis = new THREE.Vector3().subVectors(b.pos, a.pos).setY(0).normalize();
      const perp = new THREE.Vector3(-axis.z, 0, axis.x).multiplyScalar(side);
      const d = dist - push * smooth(t);
      return mid.addScaledVector(perp, d).setY(mid.y + height);
    },
    look: () => new THREE.Vector3().addVectors(a.pos, b.pos).multiplyScalar(0.5).setY((a.pos.y + b.pos.y) / 2 + lookH),
  };
}

// Por cima do ombro de `a` olhando para `b`
export function overShoulder(a, b, { dur = 1, back = 1.6, side = 0.7, height = 1.7, fov = 42 } = {}) {
  return {
    dur, fov,
    pos: (t) => rel(a, -back - t * 0.3, side, height),
    look: () => new THREE.Vector3(b.pos.x, b.pos.y + 1.2, b.pos.z),
  };
}

// Câmera baixa, olhando de baixo para cima (impacto)
export function lowAngle(f, { dur = 1, dist = 2.6, side = 1.4, fov = 50 } = {}) {
  return {
    dur, fov,
    pos: (t) => rel(f, dist, side + t * 0.6, 0.35),
    look: () => rel(f, 0, 0, 1.4),
  };
}

// Plano aberto que se afasta (finalização de golpe)
export function pullBack(a, b, { dur = 1, from = 3, to = 6.5, height = 2.2, side = -1, fov = 46 } = {}) {
  return twoShot(a, b, { dur, dist: from, height, push: from - to, side, fov });
}

// Close em um ponto do corpo (ex.: antebraço do Abutre)
export function socketClose(f, getPoint, { dur = 1, dist = 1.4, side = 0.8, fov = 40 } = {}) {
  return {
    dur, fov,
    pos: (t) => {
      const p = getPoint();
      const F = forwardFromYaw(f.yaw);
      const R = right(f.yaw);
      return p.clone().addScaledVector(F, dist - t * 0.3).addScaledVector(R, -side).add(new THREE.Vector3(0, 0.15, 0));
    },
    look: () => getPoint(),
  };
}
