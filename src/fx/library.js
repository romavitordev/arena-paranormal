import * as THREE from 'three';

// V4 etapa 19: efeitos como ASSETS INDEPENDENTES. Cada efeito comum do combate tem um nome FX_* e uma
// receita própria (partículas, clarão, anéis); o combate só pede pelo nome:
//   world.fx.play('FX_HIT_HEAVY', pos, { color, scale })
// Ajustar um efeito aqui muda todos os lugares que o usam.
//
// Opções aceitas (todas opcionais): color, scale, dir (Vector3, para onde o efeito "aponta"),
// yaw (orientação), kind (variação do efeito).

const v = new THREE.Vector3();

export const FX_LIBRARY = {
  // golpe comum: faíscas + clarão + anel vertical
  FX_HIT_SMALL(fx, pos, { color = 0xffffff, scale = 1 }) {
    fx.flash(pos, { color, size: 1.4 * scale, life: 0.1 });
    fx.burst(pos, { count: Math.round(14 * scale), color, speed: 7 * scale, life: 0.35, size: 0.18, gravity: 6 });
    fx.ring(pos, { color, radius: 1.1 * scale, life: 0.2, vertical: true, yaw: Math.random() * Math.PI });
  },

  // golpe pesado / lançamento: o golpe comum maior + onda de choque no chão
  FX_HIT_HEAVY(fx, pos, { color = 0xffffff, scale = 1.5 }) {
    FX_LIBRARY.FX_HIT_SMALL(fx, pos, { color, scale });
    fx.ring(v.set(pos.x, 0.06, pos.z), { color, radius: 1.4 * scale, life: 0.3 });
  },

  // arrancada do dash: rastro de energia (longo) ou poeira (curto)
  FX_DASH(fx, pos, { color = 0xffffff, kind = 'short' }) {
    const long = kind === 'long';
    fx.burst(pos, { count: long ? 20 : 8, color: long ? color : 0x8a8090, kind: long ? 'glow' : 'smoke', speed: 2, life: 0.4, size: 0.4 });
  },

  // golpe defendido: faíscas frias saindo da guarda (dir = de onde veio o golpe)
  FX_BLOCK(fx, pos, { dir = null, color = 0xbfe6ff }) {
    const p = dir ? v.copy(pos).addScaledVector(dir, -0.4) : pos;
    fx.burst(p, { count: 14, color, speed: 6, life: 0.25, size: 0.2 });
  },

  // bloqueio perfeito: clarão grande + anel na frente + explosão de faíscas da cor do lutador
  FX_PERFECT_BLOCK(fx, pos, { color = 0xffffff, yaw = 0 }) {
    fx.flash(pos, { color, size: 3.5, life: 0.2 });
    fx.ring(pos, { color, radius: 2.4, life: 0.35, vertical: true, yaw });
    fx.burst(pos, { count: 30, color, speed: 8, life: 0.4, size: 0.25 });
  },

  // gotas de sangue (sangramento)
  FX_BLOOD(fx, pos, { color = 0x9a0010, scale = 1 }) {
    fx.burst(pos, { count: Math.round(3 * scale), color, speed: 1.5, life: 0.5, size: 0.14, gravity: 7 });
  },

  // energia paranormal (buff de dano ativo, aura)
  FX_ENERGY(fx, pos, { color = 0xa46bff, scale = 1 }) {
    fx.burst(pos, { count: Math.round(10 * scale), color, speed: 4, life: 0.6, size: 0.35, kind: 'glow' });
  },

  // explosão (granadas, projéteis explosivos)
  FX_EXPLOSION(fx, pos, { color = 0xff9a30, scale = 1 }) {
    fx.flash(pos, { color, size: scale * 1.6, life: 0.18 });
    fx.ring(v.set(pos.x, 0.08, pos.z), { color, radius: scale, life: 0.4 });
    fx.burst(pos, { count: 40, color, speed: 9, up: 2, life: 0.5, size: 0.35 });
    fx.burst(pos, { count: 16, color: 0x2a2420, kind: 'smoke', speed: 2.5, up: 1.2, life: 1.1, size: 1.1, grow: 1 });
  },

  // teleporte / troca / substituição: nuvem no lugar + faíscas do elemento (+ anel no chão)
  FX_TELEPORT(fx, pos, { color = 0xffffff, kind = 'blink' }) {
    if (kind === 'smoke') {
      fx.burst(pos, { count: 30, color: 0xd8d0c0, kind: 'smoke', speed: 2.5, life: 0.6, size: 0.7, grow: 1 });
      fx.burst(pos, { count: 18, color, speed: 5, life: 0.35, size: 0.18 });
      return;
    }
    fx.burst(pos, { count: 26, color, speed: 5, life: 0.4, size: 0.22 });
    if (kind === 'ring') fx.ring(v.set(pos.x, 0.06, pos.z), { color, radius: 2, life: 0.4 });
  },
};

export const FX_NAMES = Object.keys(FX_LIBRARY);
