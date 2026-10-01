"""
DANTE — public/models/dante.glb   (referências em 'Referencias visuais/Personagens/Dante')
Ocultista da Morte (Calamidade): cabelo loiro-escuro com franja e preso num coque alto, orelhas
levemente pontudas, sigilo do infinito na testa com um risco que desce pelo rosto, lágrimas de Lodo
Preto escorrendo dos olhos, sem barba (textura face_dante); pescoço e braços cobertos de tatuagens
de sigilos e espirais (textura skin_dante); camiseta escura, xale grande cinza-claro enrolado no
pescoço e caindo sobre os ombros como capa; cinto com bolsas e lanterna; calça escura; pés descalços
enfaixados. Sem armas: luta com rituais e palmas carregadas de Lodo.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'dante.glb'
b = Builder(width=0.98, bulk=1.0, height=1.02)
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_dante', '#ffffff', 0.8),  # textura com tatuagens
    'face': material('face_dante', '#ffffff', 0.8),
    'torso': material('shirt_dante', '#232226', 0.9),
    'arm': material('skin_dante', '#ffffff', 0.8),
    'legs': material('pants_dante', '#1f1d1c', 0.9),
    'feet': material('skin_dante', '#ffffff', 0.8),
}
shawl = material('shawl_dante', '#a9a7a0', 0.95)
shawl_dark = material('shawl_shadow', '#7c7a74', 0.95)
wrap = material('wraps_dante', '#d8d2c4', 0.95)
hairm = material('hair_dante', '#8a7244', 0.6)
hair_dark = material('hair_dante_dark', '#6e5c3a', 0.65)
beard = material('beard_dante', '#7a6640', 0.85)
leather = material('belt_dante', '#3a2a20', 0.7)
metal = material('metal_dante', '#8a8c90', 0.4, metal=0.7)
lens = material('flashlight_lens', '#f4f0d8', 0.2, emission='#fff4c0', strength=1.5)
gem = material('shawl_pin', '#2a4ab8', 0.2, emission='#1a3a9a', strength=0.6)

hc = b.body(M, [(-0.12, 0.17), (0.0, 0.17), (0.17, 0.162), (0.36, 0.212), (0.48, 0.222), (0.58, 0.122), (0.65, 0.072)],
            arm_r=(0.068, 0.055, 0.046), leg_r=(0.086, 0.068, 0.052), feet='bare')

# manga curta da camiseta escura (o resto do braço é pele tatuada)
for side in ('L', 'R'):
    s, e = sk['s' + side], sk['e' + side]
    b.add('sleeve' + side, tube(limb_rings(s + Vector((0, 0, 0.02)), s.lerp(e, 0.42), 0.078, 0.07, n=3), 12), M['torso'], region='arm' + side)

# orelhas levemente pontudas (como nas artes)
for s2 in (1, -1):
    b.add(f'eartip{s2}', cone((s2 * 0.148 * H, 0.012, hc.z + 0.0), (s2 * 0.172 * H, 0.03, hc.z + 0.06), 0.016, 6), M['skin'], region='head', subdiv=0)

# xale: rolo grosso em volta do pescoço + capa curta sobre os ombros, aberta na frente
top = 1.6 * H
b.add('shawl_roll', tube([(0, 0.0, top - 0.04 * H, 0.13 * H, 0.12 * H), (0, -0.004, top + 0.005 * H, 0.142 * H, 0.13 * H),
                          (0, 0.0, top + 0.05 * H, 0.122 * H, 0.112 * H), (0, 0.004, top + 0.075 * H, 0.098 * H, 0.09 * H)], 24), shawl, region='torso')
# MANTO: o xale grande que cobre ombros e braços e cai até os joelhos (aberto na frente), com dobras
K_TX, K_TY = b.k_tx, b.k_ty
GAP = 0.13  # abertura da frente (fração da volta)
SEG, ROWS = 56, 16


def cloak_len(a):
    # mais comprido atrás e nos lados; as pontas da frente um pouco mais curtas
    return (0.88 - 0.16 * max(0.0, math.cos(a)) ** 2) * H


def cloak_pt(a, v, out=1.0):
    s = min(1.0, v * 4.0) ** 0.6
    rx = 0.14 * H + (0.37 * H - 0.14 * H) * s + v * 0.02 * H
    ry = 0.12 * H + (0.22 * H - 0.12 * H) * s + v * 0.05 * H
    fold = 1 + 0.06 * v * math.sin(a * 9)  # dobras verticais do pano
    z = top - 0.02 * H - v * cloak_len(a)
    return (math.sin(a) * rx * fold * out / K_TX, -math.cos(a) * ry * fold * out / K_TY, z)


def cloak_mesh(out=1.0, flip=False):
    verts, faces, uvs = [], [], []
    for i in range(ROWS + 1):
        v = i / ROWS
        for s in range(SEG + 1):
            t = GAP + (1 - 2 * GAP) * s / SEG  # pula a abertura da frente
            verts.append(cloak_pt(t * TAU, v, out))
            uvs.append((s / SEG, 1 - v))
    row = SEG + 1
    for i in range(ROWS):
        for s in range(SEG):
            p = i * row + s
            f = (p, p + 1, p + 1 + row, p + row)
            faces.append(tuple(reversed(f)) if flip else f)
    return verts, faces, uvs


def cloak_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.14 * H, 0.32 * H, abs(p.x)) * smoothstep(top - 0.6 * H, top - 0.1 * H, p.z) * 0.6
    w_hip = smoothstep(hz + 0.1 * H, hz - 0.3 * H, p.z) * (1 - w_arm) * 0.7
    return {'s' + side: w_arm, 'hips': w_hip, 'sp': max(0.0, 1 - w_arm - w_hip)}


b.add('shawl_cape', cloak_mesh(), shawl, region='torso', weight_fn=cloak_weights, subdiv=0)  # já tem resolução própria
b.add('shawl_cape_in', cloak_mesh(0.975, flip=True), shawl_dark, region='torso', weight_fn=cloak_weights, subdiv=0)
# pontas do xale caindo na frente (assimétricas, como pano enrolado)
# pano macio: ondula de lado, alarga no meio, gira um pouco e termina em franja desfiada
for s2, ln in ((1, 0.38), (-1, 0.28)):
    tail = []
    n = 9
    for i in range(n):
        t = i / (n - 1)
        x = s2 * (0.07 + 0.035 * t) * H + math.sin(t * math.pi * 2.2) * 0.012 * H
        y = -(0.125 + 0.025 * math.sin(t * math.pi)) * H
        z = top - (0.03 + (ln - 0.03) * t) * H
        w = (0.03 + 0.018 * math.sin(t * math.pi * 0.9)) * H
        th = (0.013 - 0.004 * t) * H * (1 + 0.4 * math.sin(t * math.pi * 3))  # dobras do tecido
        tail.append((x, y, z, w, th))
    b.add(f'shawl_tail{s2}', tube(tail, 12), shawl_dark if s2 < 0 else shawl, region='torso')
    # franja desfiada na ponta
    ex, ey, ez = tail[-1][0], tail[-1][1], tail[-1][2]
    fr = [cone((ex + (j - 2) * 0.012 * H, ey, ez + 0.01 * H), (ex + (j - 2) * 0.014 * H, ey - 0.003 * H, ez - (0.04 + 0.012 * (j % 2)) * H), 0.006, 4) for j in range(5)]
    b.add(f'shawl_fringe{s2}', merge(*fr), shawl_dark, region='torso', subdiv=0)
# dobras: faixas mais escuras sobre a capa
b.add('shawl_pin', ellipsoid((0.07 * H, -0.15 * H, top - 0.03 * H), (0.014, 0.008, 0.014), 8, 6), gem, region='torso', subdiv=0)

# cinto de couro com bolsas e lanterna
b.add('belt', tube([(0, 0, hz + 0.02, 0.18 * H, 0.128 * H), (0, 0, hz + 0.07, 0.182 * H, 0.13 * H)], 20), leather, region='torso', subdiv=0)
b.add('buckle', box((0, -0.132 * H, hz + 0.045), (0.05, 0.01, 0.04)), metal, region='torso', subdiv=0)
for k, x in enumerate((-0.12, 0.13)):
    b.add(f'pouch{k}', box((x * H, -0.1 * H, hz - 0.01), (0.07, 0.05, 0.08)), leather, region='torso', subdiv=0)
b.add('flashlight', cone((0.17 * H, -0.04, hz - 0.02), (0.17 * H, -0.04, hz - 0.17), 0.022, 10), metal, region='legL', subdiv=0)
b.add('flash_lens', ellipsoid((0.17 * H, -0.04, hz - 0.17), (0.022, 0.022, 0.006), 10, 4), lens, region='legL', subdiv=0)

# pés descalços enfaixados (faixas no tornozelo e no peito do pé)
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('anklewrap' + side, tube(limb_rings(k.lerp(f, 0.78), f + Vector((0, -0.01, 0.045)), 0.06, 0.058, n=3), 12), wrap, region='k' + side, subdiv=0)
    b.add('footwrap' + side, ellipsoid((f.x, f.y - 0.06 * H, f.z + 0.03 * H), (0.052 * H, 0.06 * H, 0.03 * H), 10, 6, phi=(0.0, 0.62)), wrap, region='k' + side, subdiv=0)

# cabelo: franja sobre a testa, laterais presas e COQUE alto (com algumas mechas soltas)
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.004, hc.z + 0.014), (0.149 * H, 0.159 * H, 0.172 * H), front=0.22, side=0.4, back=0.62), hairm, region='head')
# franja: lâminas finas descendo pela testa (o sigilo do infinito fica visível embaixo)
for k in range(9):
    x0 = (-0.1 + k * 0.025) * H
    curve = 1 - (abs(x0) / (0.12 * H)) ** 2  # acompanha a curva da testa
    yf = -(0.14 + 0.012 * curve) * H
    ln = 0.07 + (0.012 if k % 3 == 1 else 0) - (0.01 if k % 4 == 0 else 0)  # pontas desencontradas
    lock = [(x0, yf + 0.008, hc.z + 0.15, 0.017, 0.008), (x0 * 1.06, yf - 0.002, hc.z + 0.115, 0.016, 0.007), (x0 * 1.1, yf - 0.004, hc.z + ln + abs(x0) * 0.3, 0.008, 0.004)]
    b.add(f'bang{k}', tube(lock, 6), hairm if k % 2 else hair_dark, region='head', subdiv=0)
# laterais lisas cobrindo as orelhas até a mandíbula (cabelo em "cortina")
for s2 in (1, -1):
    for j in range(3):
        y0 = (-0.08 + j * 0.055) * H
        side = [(s2 * 0.136 * H, y0, hc.z + 0.12, 0.016, 0.018), (s2 * 0.146 * H, y0, hc.z + 0.04, 0.015, 0.017), (s2 * 0.146 * H, y0 + 0.004, hc.z - 0.03 - j * 0.01, 0.007, 0.008)]
        b.add(f'side_hair{s2}{j}', tube(side, 6), hairm, region='head', subdiv=0)
# volume puxado para trás até o coque
b.add('hair_back', ellipsoid((hc.x, hc.y + 0.04, hc.z + 0.03), (0.146 * H, 0.13 * H, 0.15 * H), 16, 10, theta_max=math.pi * 0.7, phi=(0.6, 1.4)), hairm, region='head')
b.add('bun', merge(ellipsoid((0, 0.05, hc.z + 0.2), (0.055, 0.05, 0.05), 12, 8),
                   tube([(0, 0.045, hc.z + 0.15, 0.026, 0.026), (0, 0.048, hc.z + 0.18, 0.03, 0.03)], 8)), hairm, region='head')
b.add('bun_tie', tube([(0, 0.046, hc.z + 0.162, 0.03, 0.03), (0, 0.047, hc.z + 0.172, 0.031, 0.031)], 10), leather, region='head', subdiv=0)
for k in range(3):
    a = (k - 1) * 0.6
    tuft = [(math.sin(a) * 0.02, 0.05, hc.z + 0.24, 0.016, 0.01), (math.sin(a) * 0.05, 0.06, hc.z + 0.28, 0.01, 0.006), (math.sin(a) * 0.07, 0.08, hc.z + 0.29, 0.004, 0.003)]
    b.add(f'tuft{k}', tube(tuft, 5), hair_dark, region='head', subdiv=0)
# mechas soltas nas laterais do rosto
for s2 in (1, -1):
    side_lock = [(s2 * 0.138 * H, -0.07 * H, hc.z + 0.06, 0.007, 0.005), (s2 * 0.146 * H, -0.075 * H, hc.z, 0.006, 0.004), (s2 * 0.148 * H, -0.07 * H, hc.z - 0.05, 0.004, 0.003)]
    b.add(f'side_lock{s2}', tube(side_lock, 6), hairm, region='head', subdiv=0)
# sem barba (pedido do usuário)

b.export(OUT)
