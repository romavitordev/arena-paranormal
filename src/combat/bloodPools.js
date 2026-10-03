import * as THREE from 'three';

// POÇAS DE SANGUE do Diabo (Portador do Trono). Nascem da Lança de Sangue (onde ela crava), do Sangue nos Arredores
// e dos Zumbis. Servem de passagem para o Transportar pelo Sangue ("através de fendas ou grandes poças de Sangue").
// Quem é do outro lado e pisa nelas atola (fica lento); o dono regenera mais rápido em cima delas.
// Vivem como tickers do mundo: somem sozinhas e são limpas no fim do round (World.clearTickers).

// contorno de respingo irregular (determinístico pela posição: não gasta sorteios do netplay)
export function splatGeo(x, z) {
  const g = new THREE.CircleGeometry(1, 36);
  const p = g.attributes.position;
  const s = x * 12.9898 + z * 78.233;
  for (let i = 1; i < p.count; i++) {
    const a = Math.atan2(p.getY(i), p.getX(i));
    const k = 0.82 + 0.12 * Math.sin(a * 3 + s) + 0.08 * Math.sin(a * 7 + s * 1.7) + 0.06 * Math.sin(a * 13 + s * 0.3);
    p.setXY(i, Math.cos(a) * k, Math.sin(a) * k);
  }
  return g;
}

export function addBloodPool(world, owner, x, z, { radius = 1.1, life = 9 } = {}) {
  if (!world.bloodPools) world.bloodPools = [];
  // poça em cima de outra do mesmo dono: só renova e cresce um pouco
  const near = world.bloodPools.find((p) => p.owner === owner && Math.hypot(p.x - x, p.z - z) < (p.r + radius) * 0.6);
  if (near) {
    near.t = 0;
    near.life = Math.max(near.life, life);
    near.r = Math.min(2.2, Math.max(near.r, radius) + 0.15);
    return near;
  }
  const mesh = new THREE.Mesh(splatGeo(x, z), new THREE.MeshBasicMaterial({ color: 0x5a0008, transparent: true, opacity: 0, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.035 + world.bloodPools.length * 0.001, z);
  mesh.renderOrder = 1;
  world.scene.add(mesh);
  const pool = { owner, x, z, r: radius, life, t: 0, mesh };
  world.bloodPools.push(pool);
  // o máximo de poças por dono (as mais velhas secam antes)
  const mine = world.bloodPools.filter((p) => p.owner === owner);
  if (mine.length > 6) mine[0].t = mine[0].life;
  world.addTicker({
    update(dt) {
      pool.t += dt;
      const k = pool.t / pool.life;
      mesh.scale.setScalar(pool.r * Math.min(1, pool.t / 0.25));
      mesh.material.opacity = 0.82 * Math.min(1, pool.t / 0.2) * (k > 0.8 ? (1 - k) / 0.2 : 1);
      // atola quem é do outro lado
      for (const f of world.fighters) {
        if (f === owner || f.state === 'ko' || !f.onGround) continue;
        if (Math.hypot(f.pos.x - pool.x, f.pos.z - pool.z) > pool.r + f.radius * 0.5) continue;
        const b = f.findBuff('bloodPool');
        if (b) b.time = 0.25;
        else f.addBuff({ type: 'bloodPool', name: 'ATOLADO NO SANGUE', time: 0.25, duration: 0.25, speedMult: 0.75 });
      }
      return pool.t >= pool.life;
    },
    dispose() {
      world.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      const i = world.bloodPools.indexOf(pool);
      if (i >= 0) world.bloodPools.splice(i, 1);
    },
  });
  return pool;
}

export function poolsOf(world, owner) {
  return (world.bloodPools || []).filter((p) => p.owner === owner && p.t < p.life * 0.9);
}

// a poça do dono em que o ponto está (ou null)
export function poolAt(world, owner, x, z) {
  return poolsOf(world, owner).find((p) => Math.hypot(p.x - x, p.z - z) <= p.r) || null;
}
