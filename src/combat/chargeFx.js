import * as THREE from 'three';

// Efeitos visuais da Carga de Poder, escolhidos por `chargeFx.style` na
// definição do personagem. Retorna { stop() }.
const tmp = new THREE.Vector3();

function socketPos(rig, name) {
  const s = rig.sockets[name] || rig.joints[name];
  return () => s.getWorldPosition(new THREE.Vector3());
}

export const CHARGE_STYLES = {
  // aura genérica subindo do chão
  aura(f, w, c) {
    return [
      w.fx.emitter({ rate: 60, follow: () => tmp.set(f.pos.x + (Math.random() - 0.5) * 1.2, f.pos.y + 0.1, f.pos.z + (Math.random() - 0.5) * 1.2).clone(), particle: { color: c.color, speed: 3, up: 1.4, spread: 0.15, life: 0.7, size: 0.35, drag: 0.5 } }),
      c.smoke && w.fx.emitter({ rate: 25, follow: () => tmp.set(f.pos.x, f.pos.y + 0.6, f.pos.z).clone(), particle: { color: c.smoke, speed: 1.2, up: 1, spread: 0.6, life: 0.9, size: 0.8, kind: 'smoke', grow: 1.2 } }),
    ];
  },
  // Kaiser: fumaça roxa
  smoke(f, w, c) {
    return [
      ...CHARGE_STYLES.aura(f, w, c),
      w.fx.emitter({ rate: 30, follow: () => tmp.set(f.pos.x, f.pos.y + 0.9, f.pos.z).clone(), particle: { color: 0x5a2a8a, speed: 1.4, up: 1, spread: 0.7, life: 1.0, size: 0.9, kind: 'smoke', grow: 1.5 } }),
    ];
  },
  // Arthur: energia vermelha no antebraço
  forearm(f, w, c) {
    const p = socketPos(f.rig, 'eR');
    return [
      ...CHARGE_STYLES.aura(f, w, c),
      w.fx.emitter({ rate: 70, follow: p, particle: { color: c.color, speed: 1.5, spread: 0.6, life: 0.4, size: 0.25, jitter: 0.2 } }),
    ];
  },
  // Aghata: névoa de sangue e gotas subindo
  blood(f, w, c) {
    return [
      w.fx.emitter({ rate: 50, follow: () => tmp.set(f.pos.x + (Math.random() - 0.5) * 1.6, f.pos.y + 0.05, f.pos.z + (Math.random() - 0.5) * 1.6).clone(), particle: { color: c.color, speed: 2.5, up: 1.6, spread: 0.1, life: 0.8, size: 0.2 } }),
      w.fx.emitter({ rate: 22, follow: () => tmp.set(f.pos.x, f.pos.y + 0.8, f.pos.z).clone(), particle: { color: 0x3a0610, speed: 1, up: 0.6, spread: 0.8, life: 1.0, size: 0.9, kind: 'smoke', grow: 1.2 } }),
      w.fx.emitter({ rate: 30, follow: socketPos(f.rig, 'handR'), particle: { color: 0xff4060, speed: 0.6, spread: 0.5, life: 0.35, size: 0.18 } }),
    ];
  },
  // Injustiça: energia concentrada nas duas lâminas
  blades(f, w, c) {
    return [
      w.fx.emitter({ rate: 80, follow: socketPos(f.rig, 'handR'), particle: { color: c.color, speed: 1.2, spread: 0.8, life: 0.45, size: 0.28, jitter: 0.5 } }),
      w.fx.emitter({ rate: 80, follow: socketPos(f.rig, 'handL'), particle: { color: c.color, speed: 1.2, spread: 0.8, life: 0.45, size: 0.28, jitter: 0.5 } }),
      w.fx.emitter({ rate: 25, follow: () => tmp.set(f.pos.x, f.pos.y + 0.1, f.pos.z).clone(), particle: { color: 0x6a5020, speed: 2, up: 1, spread: 0.6, life: 0.6, size: 0.3 } }),
    ];
  },
  // Kian: energia sobrenatural nas mãos e braços
  fists(f, w, c) {
    const pts = ['handL', 'handR', 'eL', 'eR'].map((n) => socketPos(f.rig, n));
    return [
      ...pts.map((p, i) => w.fx.emitter({ rate: i < 2 ? 90 : 40, follow: p, particle: { color: c.color, speed: 1.2, spread: 0.7, life: 0.4, size: i < 2 ? 0.32 : 0.22, jitter: 0.15 } })),
      w.fx.emitter({ rate: 20, follow: () => tmp.set(f.pos.x, f.pos.y + 0.05, f.pos.z).clone(), particle: { color: 0xffffff, speed: 3, up: 0.3, spread: 1, life: 0.4, size: 0.2 } }),
    ];
  },
};

export function startChargeFx(fighter, world) {
  const c = fighter.def.chargeFx || { style: 'aura', color: fighter.def.energyColor };
  const style = CHARGE_STYLES[c.style] || CHARGE_STYLES.aura;
  const emitters = style(fighter, world, c).filter(Boolean);
  // brilho pulsante no corpo (aplicado em Fighter.updateVisuals)
  fighter.glowTint = { color: c.color, base: 0.14 };
  return {
    stop() {
      emitters.forEach((e) => e.stop());
      if (fighter.glowTint && fighter.glowTint.color === c.color) fighter.glowTint = null;
    },
  };
}
