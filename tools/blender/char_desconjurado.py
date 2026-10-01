"""
DESCONJURADO — public/models/desconjurado.glb
Cabelo CURTO (raspado), barba cheia, olhos âmbar, sigilo luminoso na testa e linha descendo do olho,
três riscos pretos no outro lado do rosto (textura face_desconjurado); sem camisa, corpo coberto de
faixas de glifos e linhas luminosas douradas (textura skin_desconjurado, com brilho); faixas brancas
nas mãos e antebraços com pontas soltas; calça escura; descalço. NENHUMA arma.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'desconjurado.glb'
b = Builder(width=1.06, bulk=1.18, height=1.03)
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_desconjurado', '#ffffff', 0.8),  # textura com glifos (e brilho)
    'face': material('face_desconjurado', '#ffffff', 0.8),
    'torso': material('skin_desconjurado', '#ffffff', 0.8),
    'arm': material('skin_desconjurado', '#ffffff', 0.8),
    'hand': material('wraps_desc', '#d2ccbe', 0.95),
    'legs': material('pants_desc', '#45454a', 0.9),
    'feet': material('skin_desconjurado', '#ffffff', 0.8),
}
wrap = M['hand']
hairm = material('hair_short', '#141010', 0.7)
beard = material('beard_desc', '#1e1612', 0.85)

hc = b.body(M, [(-0.12, 0.18), (0.0, 0.18), (0.17, 0.178), (0.36, 0.238), (0.48, 0.25), (0.58, 0.14), (0.65, 0.08)],
            arm_r=(0.085, 0.068, 0.056), leg_r=(0.095, 0.074, 0.058), head_r=(0.14, 0.15, 0.162), feet='bare', neck_r=0.07)
# peitoral e ombros mais fortes
for s in (1, -1):
    b.add(f'pec{s}', ellipsoid((s * 0.09 * H, -0.095 * H, hz + 0.4 * H), (0.1 * H, 0.06 * H, 0.08 * H), 12, 8), M['torso'], region='torso')
    b.add(f'delt{s}', ellipsoid((s * 0.27 * H, 0, 1.53 * H), (0.085 * H, 0.08 * H, 0.08 * H), 12, 8), M['arm'], region='arm' + ('L' if s > 0 else 'R'))
# faixas nos antebraços e mãos com pontas soltas
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    # faixas no antebraço até o punho (não cobrem o punho fechado inteiro: antes viravam 'luvas' gigantes)
    b.add('wrap' + side, tube(limb_rings(e.lerp(h, 0.3), h + Vector((0, 0, 0.01 * H)), 0.07, 0.06, n=5), 12), wrap, region='arm' + side)
    # pontas soltas das faixas: saem do punho e CAEM (apontam para o cotovelo), como tiras de pano
    for k in range(2):
        dx = (0.022 if k else -0.018)
        p0 = h + Vector((dx, 0.05, 0.02))
        # pontas curtas e finas (antes viravam tiras longas até o cotovelo)
        pts = [(p0.x, p0.y, p0.z, 0.011, 0.003), (p0.x + dx * 0.5, p0.y + 0.03, p0.z + 0.06, 0.01, 0.003),
               (p0.x + dx * 0.9, p0.y + 0.045, p0.z + 0.12 - k * 0.03, 0.007, 0.002)]
        b.add(f'tail{side}{k}', tube(pts, 4), wrap, region='e' + side, subdiv=0)
# calça cobrindo o quadril (sem pele aparecendo na virilha)
# (o tronco é engrossado ×k_tx/×k_ty pelo Builder: a calça precisa ficar POR FORA dele)
b.add('pants_hip', tube([(0, 0, hz + 0.06 * H, 0.214 * H / b.k_tx, 0.16 * H / b.k_ty), (0, 0, hz - 0.04 * H, 0.218 * H / b.k_tx, 0.162 * H / b.k_ty), (0, 0, hz - 0.13 * H, 0.2 * H / b.k_tx, 0.15 * H / b.k_ty)], 20, cap_start=False), M['legs'], region='torso')
# cós da calça
b.add('waist', tube([(0, 0, hz + 0.04, 0.188 * H, 0.135 * H), (0, 0, hz + 0.09, 0.19 * H, 0.137 * H)], 18), material('waistband', '#2a2a2e', 0.8), region='torso', subdiv=0)
# cabelo curto (calota fina) e barba cheia
b.add('hair_short', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.01), (0.145 * H, 0.155 * H, 0.168 * H), front=0.27, side=0.4, back=0.56), hairm, region='head')
beard_shell = ellipsoid((hc.x, hc.y - 0.004, hc.z), (0.148 * H, 0.158 * H, 0.17 * H), 20, 14, phi=(0.16, 0.84))
b.add('beard', xform(beard_shell, lambda p: Vector((p.x, p.y, min(p.z, hc.z - 0.1)))), beard, region='head')

b.export(OUT)
