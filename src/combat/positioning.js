// Utilitários de posicionamento independentes de renderização.
// arena: {
//   radius,                       // limite circular (padrão)
//   bounds?: { rects: [{minX,maxX,minZ,maxZ}] },  // OU área andável como união de retângulos
//   colliders: [{x, z, r, h?}],   // obstáculos redondos
//   boxes?: [{minX,maxX,minZ,maxZ,h?}],  // obstáculos retangulares
// }

function inRect(rc, x, z, m) {
  return x >= rc.minX + m && x <= rc.maxX - m && z >= rc.minZ + m && z <= rc.maxZ - m;
}

export function inBounds(arena, x, z, radius = 0) {
  if (arena.bounds && arena.bounds.rects) return arena.bounds.rects.some((rc) => inRect(rc, x, z, radius));
  return Math.hypot(x, z) <= arena.radius - radius;
}

function hitsBox(b, x, z, r) {
  const cx = Math.max(b.minX, Math.min(x, b.maxX));
  const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
  return Math.hypot(x - cx, z - cz) < r;
}

export function isSpotFree(arena, x, z, radius, others = []) {
  if (!inBounds(arena, x, z, radius + 0.15)) return false;
  for (const c of arena.colliders) {
    if (Math.hypot(x - c.x, z - c.z) < c.r + radius + 0.08) return false;
  }
  for (const b of arena.boxes || []) {
    if (hitsBox(b, x, z, radius + 0.08)) return false;
  }
  for (const o of others) {
    if (Math.hypot(x - o.x, z - o.z) < (o.r ?? 0.5) + radius) return false;
  }
  return true;
}

/**
 * Posição atrás do alvo (relativa para onde o alvo está olhando).
 * Se o ponto exato estiver bloqueado (parede, pilar, limite da arena),
 * procura automaticamente a posição válida mais próxima do ponto ideal.
 * Retorna {x, z} ou null se não houver nenhuma.
 */
export function findSpotBehind(arena, target, { distance = 1.5, radius = 0.5, targetRadius = 0.5 } = {}) {
  const yaw = target.yaw;
  const bx = -Math.sin(yaw);
  const bz = -Math.cos(yaw);
  const ideal = { x: target.x + bx * distance, z: target.z + bz * distance };
  const others = [{ x: target.x, z: target.z, r: targetRadius + 0.05 }];
  if (isSpotFree(arena, ideal.x, ideal.z, radius, others)) return ideal;

  const candidates = [];
  const dists = [distance, distance * 0.8, distance * 1.25, distance * 1.6, 1.15, 2.2];
  for (let a = 0; a <= 180; a += 15) {
    for (const s of a === 0 || a === 180 ? [1] : [1, -1]) {
      const ang = Math.atan2(bx, bz) + s * (a * Math.PI) / 180;
      for (const d of dists) {
        const x = target.x + Math.sin(ang) * d;
        const z = target.z + Math.cos(ang) * d;
        if (isSpotFree(arena, x, z, radius, others)) {
          candidates.push({ x, z, cost: Math.hypot(x - ideal.x, z - ideal.z) });
        }
      }
    }
  }
  if (!candidates.length) return null;
  candidates.sort((p, q) => p.cost - q.cost);
  return { x: candidates[0].x, z: candidates[0].z };
}

// Posição livre mais próxima de um ponto desejado (teletransporte).
export function findFreeSpotNear(arena, x, z, { radius = 0.5, others = [] } = {}) {
  if (isSpotFree(arena, x, z, radius, others)) return { x, z };
  let best = null;
  for (let r = 0.5; r <= 6 && !best; r += 0.5) {
    for (let a = 0; a < 360; a += 20) {
      const px = x + Math.sin((a * Math.PI) / 180) * r;
      const pz = z + Math.cos((a * Math.PI) / 180) * r;
      if (isSpotFree(arena, px, pz, radius, others)) {
        const cost = Math.hypot(px - x, pz - z);
        if (!best || cost < best.cost) best = { x: px, z: pz, cost };
      }
    }
  }
  return best ? { x: best.x, z: best.z } : null;
}

// Empurra um corpo circular para fora dos obstáculos e para dentro da área andável.
export function resolveBody(arena, pos, radius) {
  for (const c of arena.colliders) {
    const dx = pos.x - c.x;
    const dz = pos.z - c.z;
    const d = Math.hypot(dx, dz);
    const min = c.r + radius;
    if (d < min && d > 1e-5) {
      pos.x = c.x + (dx / d) * min;
      pos.z = c.z + (dz / d) * min;
    }
  }
  for (const b of arena.boxes || []) {
    const cx = Math.max(b.minX, Math.min(pos.x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(pos.z, b.maxZ));
    const dx = pos.x - cx;
    const dz = pos.z - cz;
    const d = Math.hypot(dx, dz);
    if (d < radius) {
      if (d > 1e-5) {
        pos.x = cx + (dx / d) * radius;
        pos.z = cz + (dz / d) * radius;
      } else {
        // centro dentro da caixa: sai pelo lado mais próximo
        const opts = [
          [b.minX - radius - pos.x, 0], [b.maxX + radius - pos.x, 0],
          [0, b.minZ - radius - pos.z], [0, b.maxZ + radius - pos.z],
        ];
        opts.sort((p, q) => Math.abs(p[0] + p[1]) - Math.abs(q[0] + q[1]));
        pos.x += opts[0][0];
        pos.z += opts[0][1];
      }
    }
  }
  if (arena.bounds && arena.bounds.rects) {
    if (!inBounds(arena, pos.x, pos.z, radius)) {
      // ponto mais próximo dentro da união de retângulos
      let best = null;
      for (const rc of arena.bounds.rects) {
        const x = Math.max(rc.minX + radius, Math.min(pos.x, rc.maxX - radius));
        const z = Math.max(rc.minZ + radius, Math.min(pos.z, rc.maxZ - radius));
        const d = Math.hypot(pos.x - x, pos.z - z);
        if (!best || d < best.d) best = { x, z, d };
      }
      pos.x = best.x;
      pos.z = best.z;
    }
    return;
  }
  const r = Math.hypot(pos.x, pos.z);
  const max = arena.radius - radius;
  if (r > max) {
    pos.x *= max / r;
    pos.z *= max / r;
  }
}

// Projéteis param em obstáculos e fora da área (usado pelos cenários do Blender)
export function blocksPointGeneric(arena, p, r = 0) {
  if (p.y < -0.2) return true;
  if (!inBounds(arena, p.x, p.z, -0.6)) return true;
  for (const c of arena.colliders) {
    if (p.y < (c.h ?? 3) && Math.hypot(p.x - c.x, p.z - c.z) < c.r + r) return true;
  }
  for (const b of arena.boxes || []) {
    if (p.y < (b.h ?? 3) && hitsBox(b, p.x, p.z, r)) return true;
  }
  return false;
}
