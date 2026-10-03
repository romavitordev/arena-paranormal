"""
JOUI — public/models/joui.glb
Referências (mascarado corpo inteiro / poses / especial / SÉRIO / desenho):
  casaco longo cinza-escuro ABERTO na frente com debrum vermelho em toda a borda e na barra;
  túnica de gola chinesa cinza com fechos vermelhos; corda bege no pescoço com nó;
  corda vermelha grossa na cintura com pontas soltas; capuz caído com borda vermelha;
  mangas do casaco até o cotovelo; faixas escuras no antebraço; luvas sem dedos;
  calça larga cinza presa na canela; botas tipo tabi pretas;
  cabelo preto liso com franja reta; cicatriz em X na bochecha esquerda (textura face_mascarado);
  máscara escura estilo oni com marcas vermelhas e fendas brilhantes.
A máscara tem duas versões (prop_maskOn no rosto / prop_maskSide puxada para o lado, mostrando o
rosto). O jogo mostra só UMA de cada vez.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'joui.glb'
b = Builder(width=0.98, bulk=1.0, height=1.0)
sk = b.sk
hz = sk['hips'].z

M = {
    'skin': material('skin_mascarado', '#d0a888', 0.8),
    'face': material('face_mascarado', '#ffffff', 0.8),
    'torso': material('tunic', '#3e3d42', 0.85),
    'arm': material('tunic', '#3e3d42', 0.85),
    'hand': material('gloves', '#141416', 0.7),
    'legs': material('pants', '#3a3a3f', 0.9),
    'feet': material('boots', '#18181a', 0.7),
}
coat = material('coat', '#26252a', 0.9)
red = material('trim_red', '#8a1018', 0.7)
twist_red = material('rope_twist_red', '#ffffff', 0.85)    # corda trançada vermelha e escura (textura)
twist_cream = material('rope_twist_cream', '#ffffff', 0.9)  # cordão cru trançado (textura)
rope = material('rope', '#b8a07a', 0.9)
wrapm = material('wraps', '#2a2a2e', 0.9)
hairm = material('hair', '#0e0e10', 0.6)
maskm = material('mask', '#1c1b1f', 0.45)
glow = material('eyeglow', '#ffffff', 0.5, emission='#ffffff', strength=3)

hc = b.body(M, [(-0.12, 0.165), (0.0, 0.165), (0.18, 0.16), (0.38, 0.21), (0.5, 0.222), (0.6, 0.12), (0.66, 0.07)],
            leg_r=(0.1, 0.085, 0.07))

# ---------------- túnica: fechos vermelhos e gola chinesa
for i in range(4):
    b.add(f'frog{i}', box((0, -0.14, hz + 0.2 + i * 0.075), (0.12, 0.012, 0.014)), red, region='torso', subdiv=0)
b.add('mandarin_collar', tube([(0, 0, 1.57, 0.075, 0.07), (0, 0, 1.64, 0.07, 0.066)], 14), M['torso'], region='torso', subdiv=0)
b.add('collar_trim', tube([(0, 0, 1.635, 0.071, 0.067), (0, 0, 1.65, 0.07, 0.066)], 14), red, region='torso', subdiv=0)
# faixas no antebraço e calça presa por faixas na canela
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    b.add('wrap' + side, tube(limb_rings(e.lerp(h, 0.35), e.lerp(h, 0.92), 0.06, 0.052, n=4), 12), wrapm, region='arm' + side)
    k, f = sk['k' + side], sk['foot' + side]
    b.add('shinwrap' + side, tube(limb_rings(k.lerp(f, 0.55), f + Vector((0, 0, 0.07)), 0.06, 0.056, n=3), 12), M['feet'], region='k' + side)

# ---------------- casaco longo aberto com debrum vermelho
gap = 0.08
coat_top = [(hz + 0.0, 0.19, 0.138), (hz + 0.18, 0.182, 0.132), (hz + 0.38, 0.228, 0.158), (hz + 0.5, 0.238, 0.164), (hz + 0.58, 0.16, 0.118), (hz + 0.63, 0.11, 0.092)]
b.add('coat', open_tube(coat_top, gap=gap, seg=24), coat, region='torso')
skirt = [(hz + 0.05, 0.2, 0.146), (hz - 0.2, 0.232, 0.168), (hz - 0.45, 0.268, 0.196), (hz - 0.62, 0.285, 0.21)]
b.add('coat_skirt', open_tube(skirt, gap=0.1, seg=24), coat, region='skirt')
b.add('coat_hem', open_tube([(hz - 0.6, 0.288, 0.213), (hz - 0.64, 0.289, 0.214)], gap=0.1, seg=24), red, region='skirt', subdiv=0)
# debrum vermelho subindo pelas bordas abertas (saia + peito)
for s in (1, -1):
    def edge(rings, g):
        pts = []
        for z, rx, ry in rings:
            a = (g if s > 0 else 1 - g) * TAU
            pts.append((math.sin(a) * (rx + 0.004), -math.cos(a) * (ry + 0.004), z, 0.014, 0.014))
        return tube(pts, 6)
    b.add(f'edge_top{s}', edge(coat_top[:-1], gap), red, region='torso', subdiv=0)
    b.add(f'edge_skirt{s}', edge(skirt, 0.1), red, region='skirt', subdiv=0)
# mangas do casaco até o cotovelo, com punho vermelho
for side in ('L', 'R'):
    sh, e = sk['s' + side], sk['e' + side]
    b.add('coat_sleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.03)), sh.lerp(e, 1.0), 0.08, 0.088, n=4), 14), coat, region='arm' + side)
    b.add('coat_cuff' + side, tube(limb_rings(sh.lerp(e, 0.94), sh.lerp(e, 1.03), 0.09, 0.091, n=1), 14), red, region='arm' + side, subdiv=0)
# capuz caído com borda vermelha
hood = ellipsoid((0, 0.1, 1.6), (0.17, 0.11, 0.13), 16, 10, theta_max=math.pi * 0.62)
b.add('hood', xform(hood, lambda p: Vector((p.x, p.y + max(0, (1.66 - p.z)) * 0.3, p.z))), coat, region='torso')
b.add('hood_trim', tube([(0, 0.035, 1.64, 0.15, 0.1), (0, 0.04, 1.665, 0.152, 0.102)], 18), red, region='torso', subdiv=0)
# corda no pescoço com nó e pontas
b.add('neck_rope', tube([(0, -0.005, 1.585, 0.088, 0.075), (0, -0.005, 1.615, 0.088, 0.075)], 16), rope, region='torso', subdiv=0)
b.add('rope_knot', merge(ellipsoid((0, -0.088, 1.53), (0.03, 0.022, 0.035), 8, 6),
                         tube([(0, -0.092, 1.51, 0.012, 0.012), (0.012, -0.1, 1.4, 0.011, 0.011)], 6),
                         tube([(0, -0.092, 1.51, 0.012, 0.012), (-0.01, -0.1, 1.42, 0.011, 0.011)], 6)), rope, region='torso', subdiv=0)
# corda vermelha grossa na cintura, com nó e pontas soltas
# corda trançada na cintura (três voltas), nó e laçadas penduradas do lado esquerdo — como na arte
b.add('belt_rope', merge(tube([(0, 0, hz + 0.03, 0.206, 0.153), (0, 0, hz + 0.06, 0.208, 0.155)], 24),
                         tube([(0, 0, hz + 0.07, 0.205, 0.152), (0, 0, hz + 0.1, 0.205, 0.152)], 24),
                         tube([(0, 0, hz + 0.11, 0.203, 0.15), (0, 0, hz + 0.135, 0.202, 0.149)], 24)), twist_red, region='torso', subdiv=0)
b.add('belt_knot', ellipsoid((0.11, -0.15, hz + 0.07), (0.04, 0.03, 0.04), 8, 6), twist_red, region='torso', subdiv=0)
for k, dx in enumerate((0.1, 0.13)):
    b.add(f'belt_end{k}', tube([(dx, -0.155, hz + 0.05, 0.014, 0.014), (dx + 0.03, -0.16, hz - 0.12, 0.013, 0.013), (dx + 0.01, -0.16, hz - 0.3, 0.012, 0.012)], 6), twist_red, region='skirt', subdiv=0)
# laçadas de corda penduradas no quadril esquerdo
loops = []
for k in range(3):
    c = Vector((0.2 - k * 0.012, -0.06 + k * 0.03, hz - 0.02 - k * 0.04))
    pts = []
    for j in range(13):
        a = j / 12 * TAU
        pts.append((c.x + math.sin(a) * 0.012, c.y + math.cos(a) * 0.05, c.z - 0.09 + math.cos(a) * 0.09, 0.011, 0.011))
    loops.append(tube(pts, 6, cap_start=False, cap_end=False))
b.add('rope_loops', merge(*loops), twist_red, region='skirt', subdiv=0)
# cordão cru cruzado em X no peito, logo abaixo da gola, com pingente de corda
lace = []
for k in range(3):
    z0 = 1.53 - k * 0.04
    lace.append(cone((-0.035, -0.145, z0), (0.035, -0.148, z0 - 0.035), 0.006, 4))
    lace.append(cone((0.035, -0.145, z0), (-0.035, -0.148, z0 - 0.035), 0.006, 4))
b.add('chest_lace', merge(*lace), twist_cream, region='torso', subdiv=0)
b.add('pendant', merge(tube([(0, -0.15, 1.4, 0.016, 0.01), (0, -0.152, 1.33, 0.014, 0.009)], 6), ellipsoid((0, -0.153, 1.32), (0.02, 0.012, 0.022), 8, 6)), twist_cream, region='torso', subdiv=0)

# pulseira de miçangas com as bandeiras do Brasil, Itália e Japão (punho esquerdo)
flags = [('#1f9a3a', '#f2d22a'), ('#1f9a3a', '#f4f4f0', '#d42a2a'), ('#f4f4f0', '#d42a2a')]
cols = [c for f in flags for c in f]
wr = sk['handL'].lerp(sk['eL'], 0.1)
beads = []
for i, c in enumerate(cols * 2):
    a = i / (len(cols) * 2) * TAU
    beads.append((c, ellipsoid((wr.x + math.sin(a) * 0.058, wr.y - math.cos(a) * 0.058, wr.z), (0.014, 0.014, 0.012), 6, 4)))
for c in set(cols):
    b.add('bracelet' + c[1:], merge(*[p for cc, p in beads if cc == c]), material('bead' + c[1:], c, 0.5), region='eL', subdiv=0)

# ---------------- cabelo preto liso com franja reta
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.014), (0.147, 0.157, 0.168), front=0.3, side=0.45, back=0.62), hairm, region='head')
b.add('hair_back', ellipsoid((hc.x, hc.y + 0.05, hc.z - 0.03), (0.144, 0.12, 0.14), 16, 10, theta_max=math.pi * 0.72, phi=(0.68, 1.32)), hairm, region='head')
for i in range(7):
    x = -0.096 + i * 0.032
    b.add(f'fringe{i}', cone((x, -0.135, hc.z + 0.13), (x * 1.04, -0.152, hc.z + 0.08), 0.026, 6), hairm, region='head', subdiv=0)
for s in (1, -1):
    b.add(f'sideburn{s}', cone((s * 0.13, -0.05, hc.z + 0.08), (s * 0.135, -0.06, hc.z - 0.04), 0.03, 6), hairm, region='head', subdiv=0)

# ---------------- máscara oni: só a frente do rosto, com relevo de nariz/sobrancelha
def mask_parts(fn):
    shell = ellipsoid((hc.x, hc.y - 0.014, hc.z - 0.006), (0.15, 0.156, 0.168), 20, 14, theta_max=math.pi * 0.8, phi=(0.29, 0.71))
    def relief(p):
        # sobrancelha saliente e nariz pontudo
        d = Vector((p.x - hc.x, 0, p.z - hc.z))
        brow = math.exp(-((p.z - (hc.z + 0.055)) ** 2) / 0.0004) * 0.012
        nose = math.exp(-((p.x) ** 2) / 0.0006 - ((p.z - (hc.z - 0.02)) ** 2) / 0.0025) * 0.03
        return Vector((p.x, p.y - brow - nose, p.z))
    shell = xform(shell, relief)
    marks = []
    for s in (1, -1):
        # marcas vermelhas: risco sobre o olho e risco diagonal na bochecha
        marks.append(xform(box((s * 0.058, -0.17, hc.z + 0.07), (0.075, 0.01, 0.016)), lambda p, s=s: Vector((p.x, p.y, p.z + (p.x - s * 0.058) * 0.35 * s))))
        marks.append(xform(box((s * 0.075, -0.158, hc.z - 0.03), (0.012, 0.01, 0.07)), lambda p, s=s: Vector((p.x + (p.z - (hc.z - 0.03)) * -0.4 * s, p.y, p.z))))
    eyes = [xform(ellipsoid((s * 0.052, -0.168, hc.z + 0.03), (0.026, 0.006, 0.01), 8, 6), lambda p, s=s: Vector((p.x, p.y, p.z + (p.x - s * 0.052) * 0.35 * s))) for s in (1, -1)]
    return xform(shell, fn), xform(merge(*marks), fn), xform(merge(*eyes), fn)

def side_fn(p):
    # gira ~80° para o lado direito do personagem e sobe (a máscara fica presa na faixa)
    c = Vector((hc.x, hc.y, hc.z))
    d = p - c
    a = math.radians(-82)
    x = d.x * math.cos(a) - d.y * math.sin(a)
    y = d.x * math.sin(a) + d.y * math.cos(a)
    return c + Vector((x * 1.04, y * 1.04, d.z * 0.9 + 0.06))

for variant, fn in (('prop_maskOn', lambda p: p), ('prop_maskSide', side_fn)):
    shell, marks, eyes = mask_parts(fn)
    b.add(variant + '_shell', shell, maskm, region='head', subdiv=1)
    b.add(variant + '_marks', marks, red, region='head', subdiv=0)
    if variant == 'prop_maskOn':
        b.add(variant + '_eyes', eyes, glow, region='head', subdiv=0)
    b.group(variant)
# faixa que prende a máscara (aparece nas duas versões)
b.add('mask_band', tube([(0, 0.0, hc.z + 0.065, 0.15, 0.16), (0, 0.0, hc.z + 0.09, 0.151, 0.161)], 22), maskm, region='head', subdiv=0)

b.export(OUT)
