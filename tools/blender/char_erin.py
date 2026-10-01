"""
ERIN PARKER — public/models/erin.glb
Referência: arte promocional de Desconjuração (wiki). Cabelo RUIVO até os ombros com óculos de aviador
no alto da cabeça; camiseta verde com decote em V; colete modificado (parte de cima tipo cropped preto);
cinto utilitário esverdeado com bolsos e GRANADAS coloridas; aba curta nos quadris com ferramentas;
jaqueta preta aberta de mangas dobradas; calça preta para dentro de coturnos; luva sem dedos na mão
esquerda; pulseira de espinhos e duas de nó (vinho e preta) no braço direito; relógio virado para dentro.
As adagas, a escopeta e a granada da mão são adicionadas em código.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'erin.glb'
b = Builder(width=0.9, bulk=0.9, height=0.98)
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_erin', '#eac2a8', 0.8),
    'face': material('face_erin', '#ffffff', 0.8),
    'torso': material('shirt_green', '#3f6a3e', 0.85),
    'arm': material('skin_erin', '#eac2a8', 0.8),
    'handL': material('glove_black', '#1a1a1c', 0.7),  # luva sem dedos
    'legs': material('pants_black', '#1c1c20', 0.9),
    'feet': material('boots_dark', '#26201c', 0.65),
}
jacket = material('jacket_black', '#17171a', 0.75)
crop = material('crop_black', '#101012', 0.8)
olive = material('olive_gear', '#4a5232', 0.85)
olive_d = material('olive_dark', '#353b24', 0.85)
hairm = material('hair_ginger', '#c4602a', 0.55)
hair_hi = material('hair_ginger_light', '#e08a48', 0.55)
goggle = material('goggle_brass', '#8a6a3a', 0.4, metal=0.7)
lens = material('goggle_lens', '#2a3a3a', 0.15, metal=0.3)
strap = material('strap_brown', '#3a2a1e', 0.8)
wine = material('wine', '#6a1424', 0.7)
silver = material('silver', '#b0b0b8', 0.3, metal=0.9)

hc = b.body(M, [(-0.11, 0.152), (0.0, 0.152), (0.17, 0.142), (0.36, 0.188), (0.47, 0.196), (0.57, 0.108), (0.63, 0.064)],
            arm_r=(0.058, 0.047, 0.04), leg_r=(0.082, 0.064, 0.05), head_r=(0.134, 0.144, 0.156))

# decote em V: pele no peito (cunha na frente da camiseta)
b.add('vneck', xform(box((0, -0.12 * H, hz + 0.52 * H), (0.07 * H, 0.01, 0.1 * H)), lambda p: Vector((p.x * (1 - (hz + 0.57 * H - p.z) / (0.12 * H)) if p.z < hz + 0.57 * H else p.x, p.y, p.z))), M['skin'], region='torso', subdiv=0)

# colete: parte de cima "cropped" preta + parte de baixo verde-oliva com bolsos
cr = [(hz + 0.33 * H, 0.17 * H, 0.123 * H), (hz + 0.42 * H, 0.196 * H, 0.134 * H), (hz + 0.5 * H, 0.2 * H, 0.137 * H), (hz + 0.555 * H, 0.15 * H, 0.105 * H)]
b.add('crop', open_tube(cr, gap=0.08, seg=22), crop, region='torso')
vt = [(hz + 0.06 * H, 0.162 * H, 0.118 * H), (hz + 0.2 * H, 0.158 * H, 0.114 * H), (hz + 0.33 * H, 0.168 * H, 0.12 * H)]
b.add('vest_low', open_tube(vt, gap=0.05, seg=22), olive, region='torso')
for s in (1, -1):
    b.add(f'vest_pocket{s}', box((s * 0.06 * H, -0.125 * H, hz + 0.24 * H), (0.075, 0.03, 0.08), bevel=0.006), olive_d, region='torso', subdiv=0)
# cinto utilitário com bolsos e granadas
b.add('belt', tube([(0, 0, hz + 0.02 * H, 0.172 * H, 0.126 * H), (0, 0, hz + 0.07 * H, 0.172 * H, 0.126 * H)], 22), olive_d, region='torso', subdiv=0)
for k, a in enumerate((-0.9, -0.35, 0.35, 0.9, 2.4)):
    p = Vector((math.sin(a) * 0.178 * H, -math.cos(a) * 0.132 * H, hz + 0.04 * H))
    b.add(f'pouch{k}', box(tuple(p), (0.06, 0.04, 0.07), bevel=0.006), olive, region='torso', subdiv=0)
for k, (a, col) in enumerate(((-0.62, '#d02840'), (0.62, '#5ab0e0'), (1.3, '#ff9ad0'))):
    p = Vector((math.sin(a) * 0.19 * H, -math.cos(a) * 0.14 * H, hz - 0.02 * H))
    b.add(f'gren{k}', ellipsoid(tuple(p), (0.03, 0.03, 0.038), 8, 6), olive_d, region='torso', subdiv=0)
    b.add(f'grenband{k}', tube([(p.x, p.y, p.z - 0.006, 0.031, 0.031), (p.x, p.y, p.z + 0.006, 0.031, 0.031)], 8), material(f'gren_{col[1:]}', col, 0.5), region='torso', subdiv=0)
# aba curta nos quadris (porta-ferramentas), aberta na frente, com uma chave inglesa pendurada
flap = [(hz + 0.0, 0.178 * H, 0.13 * H), (hz - 0.1 * H, 0.19 * H, 0.14 * H), (hz - 0.17 * H, 0.2 * H, 0.148 * H)]
b.add('hip_flap', open_tube(flap, gap=0.2, seg=20), olive, region='skirt')
b.add('wrench', merge(box((-0.19 * H, -0.02, hz - 0.12 * H), (0.012, 0.018, 0.16)), box((-0.19 * H, -0.02, hz - 0.03 * H), (0.014, 0.04, 0.03))), silver, region='skirt', subdiv=0)

# jaqueta preta aberta, até o quadril, mangas dobradas acima do cotovelo
jk = [(hz - 0.04 * H, 0.19 * H, 0.142 * H), (hz + 0.16 * H, 0.18 * H, 0.134 * H), (hz + 0.36 * H, 0.218 * H, 0.152 * H), (hz + 0.48 * H, 0.226 * H, 0.155 * H), (hz + 0.57 * H, 0.156 * H, 0.116 * H), (hz + 0.62 * H, 0.112 * H, 0.094 * H)]
b.add('jacket', open_tube(jk, gap=0.15, seg=26), jacket, region='torso')
# gola larga virada
for s in (1, -1):
    lap = [(s * 0.07 * H, -0.1 * H, hz + 0.6 * H, 0.03 * H, 0.008 * H), (s * 0.12 * H, -0.135 * H, hz + 0.5 * H, 0.04 * H, 0.008 * H), (s * 0.14 * H, -0.15 * H, hz + 0.4 * H, 0.025 * H, 0.008 * H)]
    b.add(f'lapel{s}', tube(lap, 6), jacket, region='torso', subdiv=0)
for side in ('L', 'R'):
    sh, e = sk['s' + side], sk['e' + side]
    b.add('sleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.03)), sh.lerp(e, 0.9), 0.07, 0.066, n=4), 14), jacket, region='arm' + side)
    b.add('cuff' + side, tube(limb_rings(sh.lerp(e, 0.84), sh.lerp(e, 1.0), 0.075, 0.075, n=1), 14), jacket, region='arm' + side, subdiv=0)

# coturnos: cano até o meio da canela, com cadarço
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('bootshaft' + side, tube(limb_rings(k.lerp(f, 0.5), f + Vector((0, 0, 0.05)), 0.058, 0.058, n=3), 12), M['feet'], region='k' + side)
    b.add('bootsole' + side, box((f.x, f.y - 0.05, f.z - 0.022), (0.105 * H, 0.25 * H, 0.025)), material('sole', '#0e0e0e', 0.9), region='k' + side, subdiv=0)

# pulso direito: pulseira de espinhos + duas de nó (vinho e preta); relógio no esquerdo, virado para dentro
wr = sk['handR'].lerp(sk['eR'], 0.12)
b.add('bracelet_spike', merge(tube([(wr.x, wr.y, wr.z, 0.05, 0.05), (wr.x, wr.y, wr.z + 0.014, 0.05, 0.05)], 12),
                              *[cone((wr.x + math.sin(a) * 0.05, wr.y - math.cos(a) * 0.05, wr.z + 0.007), (wr.x + math.sin(a) * 0.068, wr.y - math.cos(a) * 0.068, wr.z + 0.007), 0.008, 4) for a in [i / 8 * TAU for i in range(8)]]),
      crop, region='eR', subdiv=0)
for k, m in enumerate((wine, crop)):
    z = wr.z + 0.03 + k * 0.022
    b.add(f'knotband{k}', tube([(wr.x, wr.y, z, 0.049, 0.049), (wr.x, wr.y, z + 0.012, 0.049, 0.049)], 10), m, region='eR', subdiv=0)
wl = sk['handL'].lerp(sk['eL'], 0.14)
b.add('watch', merge(tube([(wl.x, wl.y, wl.z, 0.05, 0.05), (wl.x, wl.y, wl.z + 0.016, 0.05, 0.05)], 10), box((wl.x - 0.045, wl.y, wl.z + 0.008), (0.012, 0.03, 0.03))), strap, region='eL', subdiv=0)

# ---------------- cabelo ruivo até os ombros, com mechas mais claras
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.012), (0.146 * H, 0.156 * H, 0.168 * H), front=0.26, side=0.5, back=0.66), hairm, region='head')
hr = [(hc.z + 0.06, 0.15 * H, 0.16 * H), (hc.z - 0.04, 0.158 * H, 0.164 * H), (hc.z - 0.14, 0.168 * H, 0.16 * H), (hc.z - 0.24, 0.17 * H, 0.15 * H)]
b.add('hair_back', open_tube(hr, gap=0.2, seg=24, cy=0.02), hairm, region='head')
random.seed(11)
for i in range(14):
    a = math.pi * 0.25 + (i / 13) * math.pi * 1.5  # dos lados e de trás (rosto livre)
    root = Vector((hc.x + math.sin(a) * 0.15 * H, hc.y - math.cos(a) * 0.155 * H, hc.z - 0.17))
    tip = root + Vector((math.sin(a) * 0.03, -math.cos(a) * 0.03, -0.08 - random.random() * 0.05))
    b.add(f'ends{i}', cone(tuple(root), tuple(tip), 0.04, 6), hair_hi if i % 3 == 0 else hairm, region='head', subdiv=0)
# franja repartida de lado, caindo pela testa e emoldurando o rosto
for i in range(5):
    x = 0.08 - i * 0.03
    # franja curta varrida para o lado direito dela: termina acima das sobrancelhas, deixa os olhos livres
    b.add(f'bang{i}', tube([(x, -0.125 * H, hc.z + 0.14, 0.03, 0.016), (x - 0.04, -0.142 * H, hc.z + 0.11, 0.024, 0.012), (x - 0.075, -0.142 * H, hc.z + 0.085, 0.01, 0.007)], 6), hair_hi if i == 2 else hairm, region='head', subdiv=0)
for s in (1, -1):
    b.add(f'sidelock{s}', tube([(s * 0.12 * H, -0.1 * H, hc.z + 0.06, 0.03, 0.02), (s * 0.135 * H, -0.11 * H, hc.z - 0.08, 0.03, 0.018), (s * 0.14 * H, -0.1 * H, hc.z - 0.2, 0.018, 0.012)], 8), hairm, region='head', subdiv=0)

# ---------------- óculos de aviador no alto da cabeça
gz = hc.z + 0.12 * H
b.add('goggle_strap', tube([(0, 0.004, gz - 0.01, 0.152 * H, 0.162 * H), (0, 0.004, gz + 0.012, 0.15 * H, 0.16 * H)], 24, cap_start=False, cap_end=False), strap, region='head', subdiv=0)
for s in (1, -1):
    c = Vector((s * 0.05 * H, -0.135 * H, gz + 0.03))
    b.add(f'goggle_rim{s}', xform(tube([(0, 0, 0, 0.036, 0.036), (0, 0, 0.03, 0.034, 0.034)], 12), lambda p, c=c: Vector((c.x + p.x, c.y - p.z * 0.6, c.z + p.y + p.z * 0.8))), goggle, region='head', subdiv=0)
    b.add(f'goggle_lens{s}', ellipsoid((c.x, c.y - 0.022, c.z + 0.024), (0.03, 0.012, 0.03), 10, 6), lens, region='head', subdiv=0)

b.export(OUT)
