"""
COLISEU — public/arenas/coliseu.glb
Arena de areia ao ENTARDECER, cercada por muralhas e torres de pedra em ruínas (sem plateia): trechos de muralha
derrubados, dois portões, torres quadradas e hexagonais com telhado, estandartes compridos, braseiros acesos, máquinas
de cerco destruídas e entulho na areia; falésias e árvores do lado de fora.
Muralhas, torres, portões, estandartes, catapultas, pedras e árvores são PRONTOS do Castle Kit / Nature Kit /
Graveyard Kit do Kenney (CC0, tools/blender/kenney.py). Feitos aqui: a areia e o fogo dos braseiros.
Coordenadas do jogo: arena de areia redonda, raio andável ~22,6 m.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU
from kenney import put

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'coliseu.glb'
random.seed(21)
start()

M = {
    'sand': material('sand', '#c9a46a', 1),
    'fire': material('brazier_fire', '#ff8a2a', 0.3, emission='#ff7a1a', strength=1.6),
}
R_WALL = 26.0
S = 4.0  # escala do Castle Kit (bloco de muralha de 1 unidade -> 4 m de largura, 5,2 m de altura)

# ---------------- areia
cyl('GROUND_sand', (0, -0.2, 0), 70, 0.2, M['sand'], seg=64)

# ---------------- muralha em anel com torres; o lado da câmera inicial (+z) é mais baixo/destruído e fica transparente
n = int(R_WALL * TAU / S)
gates = (n // 4, 3 * n // 4)
for k in range(n):
    a = (k + 0.5) / n * TAU
    x, z = math.sin(a) * R_WALL, math.cos(a) * R_WALL
    front = z > 6
    if k in gates:
        put('castle', 'wall-doorway', (x, 0, z), a, S, 'OCC_' if front else '')
        put('castle', 'gate', (x * 0.99, 0, z * 0.99), a + math.pi / 2, S)
        continue
    if k % 6 == 3:
        # torre: base + meio + topo (quadradas e hexagonais alternadas)
        hexa = (k // 6) % 2 == 0
        pre = 'OCC_' if front else ''
        if hexa:
            put('castle', 'tower-hexagon-base', (x, 0, z), a, S * 1.2, pre)
            put('castle', 'tower-hexagon-mid', (x, 1.31 * S * 1.2, z), a, S * 1.2, pre)
            put('castle', 'tower-hexagon-roof', (x, (1.31 + 0.46) * S * 1.2, z), a, S * 1.2, pre)
        else:
            put('castle', 'tower-square-base', (x, 0, z), a, S * 1.1, pre)
            put('castle', 'tower-square-mid-windows', (x, 1.01 * S * 1.1, z), a, S * 1.1, pre)
            put('castle', 'tower-square-top-roof', (x, 2.02 * S * 1.1, z), a, S * 1.1, pre)
        continue
    if front and random.random() < 0.55:
        # muralha derrubada: só o pé do muro e pedras
        put('castle', 'wall-half', (x, 0, z), a, S, 'OCC_')
        put('castle', 'rocks-large', (x * 0.94, 0, z * 0.94), random.uniform(0, TAU), 2.5)
        continue
    piece = 'wall-pillar' if k % 3 == 0 else 'wall'
    put('castle', piece, (x, 0, z), a, S, 'OCC_' if front else '')

# ---------------- estandartes compridos pendurados na parte de dentro da muralha
for k in range(10):
    a = (k + 0.25) / 10 * TAU
    if math.cos(a) > 0.3:
        continue
    x, z = math.sin(a) * (R_WALL - 2.3), math.cos(a) * (R_WALL - 2.3)
    put('castle', 'flag-banner-long', (x, 1.2, z), a + math.pi / 2, 3.2)

# ---------------- braseiros acesos em volta da areia (cesto de fogo do kit + fogo)
for k in range(6):
    a = (k + 0.5) / 6 * TAU
    x, z = math.sin(a) * (R_WALL - 4.2), math.cos(a) * (R_WALL - 4.2)
    put('graveyard', 'pillar-square', (x, 0, z), a, 2.4)
    put('graveyard', 'fire-basket', (x, 2.3, z), a, 3.0)
    cyl(f'FLICKER_fire{k}', (x, 2.6, z), 0.45, 0.7, M['fire'], seg=8, r_top=0.05)
    col_cyl(f'brazier{k}', (x, 0, z), 0.8, 2.8)

# ---------------- obstáculos na areia: máquinas de cerco destruídas e entulho
for k, (name, x, z, rot) in enumerate((('siege-catapult-demolished', -12, 6, 0.4), ('siege-ram-demolished', 9, -11, 1.2),
                                         ('siege-trebuchet-demolished', 13, 8, 2.4))):
    put('castle', name, (x, 0, z), rot, 3.0)
    col_cyl(f'siege{k}', (x, 0, z), 2.6, 1.6)
for k, (x, z) in enumerate(((-6, -14), (3, 15), (-16, -4))):
    put('castle', 'rocks-large', (x, 0, z), random.uniform(0, TAU), 3.0)
    put('castle', 'rocks-small', (x + 1.6, 0, z + 0.8), random.uniform(0, TAU), 3.0)
    col_cyl(f'rubble{k}', (x, 0, z), 1.9, 1.4)
# colunas quebradas
for k, (x, z, h) in enumerate(((10, 2, 4.5), (-9, -8, 2.6), (-4, 10, 3.6))):
    put('graveyard', 'column-large', (x, 0, z), random.uniform(0, TAU), h / 1.13, 'OCC_')
    col_cyl(f'column{k}', (x, 0, z), 0.9, h)

# ---------------- fora: rochedos altos e árvores
for k in range(16):
    a = (k / 16) * math.pi * 1.2 + math.pi * 0.2
    r = R_WALL + 16 + random.uniform(0, 8)
    put('nature', random.choice(['rock_tallA', 'rock_tallB', 'rock_tallC', 'rock_tallE', 'rock_tallG']), (math.sin(a) * r, 0, math.cos(a) * r), random.uniform(0, TAU), random.uniform(14, 22))
for k in range(30):
    a = random.uniform(0, TAU)
    r = random.uniform(R_WALL + 6, R_WALL + 30)
    put('castle', random.choice(['tree-large', 'tree-small', 'tree-large']), (math.sin(a) * r, 0, math.cos(a) * r), random.uniform(0, TAU), random.uniform(4, 6))

finalize(OUT)
