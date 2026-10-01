// Configuração dos cenários feitos no Blender: limites andáveis, luz, céu, névoa,
// partículas e câmera. A geometria e os obstáculos vêm do .glb (tools/blender/arena_*.py).

export const ORFANATO = {
  id: 'orfanato',
  name: 'Orfanato Santa Mega-Freira',
  glb: 'arenas/orfanato.glb',
  bounds: { radius: 20.2 },
  spawns: [{ x: 0, z: -5 }, { x: 0, z: 5 }],
  sky: 0xc9ccd0,
  skyGradient: [[0, '#b8bcc2'], [0.6, '#d4d6d8'], [1, '#e6e6e4']],
  fog: { color: 0xc4c8cc, density: 0.024 },
  lights: [
    { type: 'hemi', sky: 0xdfe3e8, ground: 0x6a5a40, intensity: 1.5 },
    { type: 'dir', color: 0xf2f0ea, intensity: 1.3, pos: [-14, 26, 10], shadow: true, area: 30 },
    { type: 'ambient', color: 0x8a8a90, intensity: 0.35 },
    { type: 'point', color: 0xffb860, intensity: 18, distance: 10, pos: [19.2, 3, 0] },
  ],
  particles: { color: 0x8a6a3a, count: 160, area: 40, height: 6, rise: -0.25, drift: 0.8, size: 0.09, opacity: 0.8 }, // folhas secas caindo
  camera: { radius: 26, maxY: 14 },
};

// Bar: dá para lutar no salão e sair pela porta para a calçada
export const SUVACO = {
  id: 'suvaco',
  name: 'Bar Suvaco Seco',
  glb: 'arenas/suvaco.glb',
  bounds: {
    // Os retângulos se sobrepõem BEM mais que o diâmetro do corpo (1 m): com sobreposição curta,
    // o raio descontado de cada lado abria frestas e o lutador travava numa "parede invisível" na porta.
    rects: [
      { minX: -8.8, maxX: 8.8, minZ: -5.8, maxZ: 5.9 }, // salão
      { minX: -2.15, maxX: 2.15, minZ: 3.0, maxZ: 9.5 }, // porta (4,6 m), entra fundo no salão e na calçada
      { minX: -29, maxX: 29, minZ: 6.55, maxZ: 26.6 }, // calçada + rua + calçada da frente
      { minX: 17.15, maxX: 20.35, minZ: -5.3, maxZ: 9.0 }, // beco à direita
    ],
  },
  spawns: [{ x: -3.2, z: 0.6 }, { x: 3.0, z: 0.6 }],
  sky: 0x0c0e16,
  skyGradient: [[0, '#05060c'], [0.7, '#141a2a'], [1, '#2a2a34']],
  fog: { color: 0x161a26, density: 0.016 },
  lights: [
    { type: 'hemi', sky: 0x6a7aa0, ground: 0x2a2018, intensity: 0.85 },
    { type: 'ambient', color: 0x3a3a40, intensity: 0.4 },
    { type: 'point', color: 0xf2f4ea, intensity: 26, distance: 11, pos: [-4, 3.2, -1.5], flicker: true },
    { type: 'point', color: 0xf2f4ea, intensity: 26, distance: 11, pos: [4, 3.2, -1.5] },
    { type: 'point', color: 0xf2f4ea, intensity: 20, distance: 10, pos: [0, 3.2, 3] },
    { type: 'point', color: 0xffc070, intensity: 40, distance: 18, pos: [-10, 4.8, 15.2] },
    { type: 'point', color: 0xffc070, intensity: 40, distance: 18, pos: [10, 4.8, 15.2] },
    { type: 'point', color: 0xffc070, intensity: 36, distance: 18, pos: [-24, 4.8, 23.8] },
    { type: 'point', color: 0xffc070, intensity: 36, distance: 18, pos: [24, 4.8, 23.8] },
    { type: 'point', color: 0xffc070, intensity: 34, distance: 17, pos: [0, 4.8, 23.8] },
    { type: 'point', color: 0xffd090, intensity: 8, distance: 7, pos: [17.6, 3.2, -1.0] }, // beco
    { type: 'point', color: 0xff4ab0, intensity: 6, distance: 7, pos: [-13.6, 3.2, 7.2] }, // neon LANCHES
    { type: 'point', color: 0x3aff6a, intensity: 6, distance: 7, pos: [26.2, 3.2, 7.2] }, // neon FARMÁCIA
    { type: 'point', color: 0xffb860, intensity: 10, distance: 6, pos: [0, 3.6, 7.0] },
    { type: 'dir', color: 0x8ea0d0, intensity: 0.95, pos: [10, 24, 22], shadow: true, area: 34 },
  ],
  particles: { color: 0xffe0a0, count: 60, area: 16, height: 3.4, rise: 0.05, drift: 0.3, size: 0.03, opacity: 0.5, center: [0, 0, 0] }, // poeira na luz
  camera: {
    rect: { minX: -31, maxX: 31, minZ: -7, maxZ: 33 },
    maxY: 8.5,
    // dentro do salão: câmera presa no salão e abaixo do teto
    interior: { when: { minX: -9, maxX: 9, minZ: -6, maxZ: 5.6 }, rect: { minX: -8.6, maxX: 8.6, minZ: -5.6, maxZ: 5.7 }, maxY: 3.25 },
  },
};

// Coliseu em ruínas ao entardecer, sem plateia
export const COLISEU = {
  id: 'coliseu',
  name: 'Coliseu',
  glb: 'arenas/coliseu.glb',
  bounds: { radius: 22.6 },
  spawns: [{ x: 0, z: -6 }, { x: 0, z: 6 }],
  sky: 0xe8915a,
  skyGradient: [[0, '#3a2a5a'], [0.45, '#c8604a'], [0.75, '#f0a060'], [1, '#f6d0a0']],
  fog: { color: 0xe0a070, density: 0.0085 },
  lights: [
    { type: 'hemi', sky: 0xffc8a0, ground: 0x6a4a3a, intensity: 1.0 },
    { type: 'dir', color: 0xffb070, intensity: 2.6, pos: [-34, 14, 18], shadow: true, area: 30 },
    { type: 'ambient', color: 0x8a6a6a, intensity: 0.3 },
    { type: 'point', color: 0xff8a3a, intensity: 10, distance: 9, pos: [0, 2, 21.5], flicker: true },
  ],
  particles: { color: 0xf0c890, count: 240, area: 46, height: 7, rise: 0.08, drift: 1.2, size: 0.06, opacity: 0.55 }, // poeira dourada
  camera: { radius: 30, maxY: 16 },
};
