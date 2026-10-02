"""
RUÍNAS DO RITUAL — public/arenas/ruinas.glb
Cemitério abandonado à noite com um círculo de invocação roxo no centro: muro baixo de pedra em ruínas com grades de
ferro, seis colunas de pedra em volta do círculo (metade quebradas), lápides de vários tipos, covas, caixões velhos,
velas no círculo, lampiões, criptas ao fundo e pinheiros retorcidos.
Todas as peças do cemitério e as árvores são PRONTAS do Graveyard Kit do Kenney (CC0, tools/blender/kenney.py);
feito aqui só o círculo ritual (decalque com a textura ritual_circle).
Coordenadas do jogo: arena redonda, raio andável ~21,5 m.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU
from kenney import put

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'ruinas.glb'
random.seed(13)
start()

M = {
    'ground': material('ground_graveyard', '#3a3442', 1),
    'circle': material('ritual_circle', '#ffffff', 0.9),
}
R = 22.0
S = 2.4  # escala do Graveyard Kit (muro de 1 unidade -> 2,4 m)

# ---------------- chão: terra escura + o círculo de invocação (decalque com brilho roxo)
cyl('GROUND_dirt', (0, -0.25, 0), 70, 0.2, M['ground'], seg=48)
plane('DECAL_ritual', (0, 0.02, 0), (2 * (R - 1), 2 * (R - 1)), M['circle'], facing='up')

# ---------------- muro baixo de pedra em volta (com trechos quebrados e quatro passagens) e grade de ferro atrás
n = int(R * TAU / S) + 1
for k in range(n):
    a = (k + 0.5) / n * TAU
    if k % (n // 4) == 0:
        continue  # passagens
    x, z = math.sin(a) * (R + 0.6), math.cos(a) * (R + 0.6)
    piece = 'stone-wall-column' if k % 6 == 0 else ('stone-wall-damaged' if random.random() < 0.35 else 'stone-wall')
    put('graveyard', piece, (x, 0, z), a, S, 'OCC_' if z > 4 else '')
    x2, z2 = math.sin(a) * (R + 3.0), math.cos(a) * (R + 3.0)
    put('graveyard', 'iron-fence-damaged' if random.random() < 0.3 else 'iron-fence', (x2, 0, z2), a, S)

# ---------------- seis colunas em volta do círculo (as quebradas são mais baixas); ficam transparentes na frente
for i in range(6):
    a = i / 6 * TAU + math.pi / 6
    x, z = math.sin(a) * 13.5, math.cos(a) * 13.5
    broken = i % 2 == 1
    put('graveyard', 'column-large', (x, 0, z), random.uniform(0, TAU), 3.2 if broken else 5.0, 'OCC_')
    col_cyl(f'pillar{i}', (x, 0, z), 1.0, 3.6 if broken else 5.6)

# ---------------- lápides, covas e caixões espalhados (fora do caminho dos lutadores no começo)
STONES = ['gravestone-cross', 'gravestone-round', 'gravestone-bevel', 'gravestone-decorative', 'gravestone-roof',
          'gravestone-wide', 'gravestone-broken', 'gravestone-cross-large', 'cross-column']
placed = []
for i in range(40):
    a = random.uniform(0, TAU)
    r = random.uniform(7, 19)
    x, z = math.sin(a) * r, math.cos(a) * r
    if abs(x) < 3.5 and abs(z) < 10:
        continue  # deixa os spawns livres
    if any(math.hypot(x - px, z - pz) < 2.6 for px, pz in placed) or any(abs(math.hypot(x, z) - 13.5) < 1.8 and abs(((math.atan2(x, z) - (j / 6 * TAU + math.pi / 6) + math.pi) % TAU) - math.pi) < 0.2 for j in range(6)):
        continue
    placed.append((x, z))
    kind = random.choice(STONES)
    face = math.atan2(-x, -z) + random.uniform(-0.4, 0.4)
    put('graveyard', kind, (x, 0, z), face, S)
    if random.random() < 0.5:
        put('graveyard', random.choice(['grave', 'grave-border']), (x - math.sin(face) * 1.6, 0, z - math.cos(face) * 1.6), face, S)
    col_cyl(f'stone{i}', (x, 0, z), 0.6, 1.8)
for i in range(3):
    a = random.uniform(0, TAU)
    x, z = math.sin(a) * 17, math.cos(a) * 17
    put('graveyard', random.choice(['coffin-old', 'coffin']), (x, 0, z), random.uniform(0, TAU), S)

# ---------------- velas no círculo, cesto de fogo e pá cravada
for i in range(10):
    a = i / 10 * TAU
    put('graveyard', 'candle-multiple' if i % 2 else 'candle', (math.sin(a) * 4.2, 0, math.cos(a) * 4.2), a, S)
for x, z in ((6.5, -15.0), (-15.5, 6.0)):
    put('graveyard', 'fire-basket', (x, 0, z), 0, S)
put('graveyard', 'shovel-dirt', (9.5, 0, 12.5), 0.6, S)

# ---------------- lampiões em volta, criptas e altar ao fundo
for i in range(6):
    a = (i + 0.5) / 6 * TAU
    put('graveyard', 'lightpost-single', (math.sin(a) * (R - 1.2), 0, math.cos(a) * (R - 1.2)), a + math.pi, S)
for k, (a, kind, sc) in enumerate(((math.pi, 'crypt-large', 4.0), (math.pi + 0.7, 'crypt-a', 3.5), (math.pi - 0.75, 'crypt-b', 3.5),
                                   (math.pi / 2 + 0.3, 'crypt', 4.0), (-math.pi / 2 - 0.3, 'crypt', 4.0))):
    x, z = math.sin(a) * (R + 9), math.cos(a) * (R + 9)
    put('graveyard', kind, (x, 0, z), a + math.pi, sc)
put('graveyard', 'altar-stone', (0, 0, -(R + 4.5)), 0, 3.0)

# ---------------- pinheiros retorcidos fora do muro e pedras
for i in range(34):
    a = random.uniform(0, TAU)
    r = random.uniform(R + 5, R + 22)
    x, z = math.sin(a) * r, math.cos(a) * r
    put('graveyard', random.choice(['pine-crooked', 'pine-fall-crooked', 'pine-crooked', 'pine']), (x, 0, z), random.uniform(0, TAU), random.uniform(3.5, 5.5))
for i in range(14):
    a = random.uniform(0, TAU)
    r = random.uniform(R + 4, R + 14)
    put('graveyard', random.choice(['rocks', 'rocks-tall', 'debris', 'trunk', 'trunk-long']), (math.sin(a) * r, 0, math.cos(a) * r), random.uniform(0, TAU), S)

finalize(OUT)
