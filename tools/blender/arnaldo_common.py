"""
Corpo compartilhado do ARNALDO FRITZ e do ANFITRIÃO (forma dele) — usado por char_arnaldo.py e char_anfitriao.py.
Refeito com a técnica atual (sculpt_lib: roupa a partir do corpo, metaballs, relevo, peças coladas na superfície por
raio), a partir da ARTE OFICIAL "Arte do Arnaldo em Desconjuração" e da "Miniatura Arnaldo em Desconjuração" (wiki
"Arnaldo Fritz", Desconjuração e Calamidade):
  ARNALDO: ~50 anos; cabelo CASTANHO volumoso penteado de lado (risca do lado direito dele), cobrindo o alto das
  orelhas; barba CHEIA castanho-escura bem aparada com o bigode; óculos redondos de aro preto (em código: props.js);
  camisa social BRANCA de colarinho, gravata VERMELHA, colete MARROM abotoado com a corrente de ouro do relógio;
  o casacão ESCURO até o joelho, aberto, com a gola virada e as lapelas largas, mangas compridas; calça marrom-escura
  e sapatos sociais pretos.
  ANFITRIÃO: as MESMAS ROUPAS do dia em que a Relíquia apareceu; o corpo vira matéria caótica da Energia (roxo/rosa/
  azul, emissivo); MÁSCARA DE GÁS FIXA no rosto com o Símbolo do Anfitrião e olhos roxos; um CABO sai do peito até o
  relógio no braço esquerdo (em código, acompanha o braço); CABOS enrolados pelo corpo todo; aura roxa (em código).
"""
import math
import os
import random
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def build(kind, OUT):
    host = kind == 'anfitriao'
    random.seed(1971)
    b = Builder(width=1.0, bulk=1.03, height=1.02)  # ~1,83 m, ombros largos de quem já foi dublê de ação
    sk = b.sk
    H = sk.h
    hz = sk['hips'].z
    top = 1.55 * H

    if host:
        # matéria caótica da Energia: roxo emissivo (a textura alterna rosa e azul em veias)
        skin = material('skin_anfitriao', '#ffffff', 0.5, emission='#5a1aa0', strength=0.5)
        face = material('face_anfitriao', '#ffffff', 0.5, emission='#5a1aa0', strength=0.5)
    else:
        skin = material('skin_arnaldo', '#d4a484', 0.8)
        face = material('face_arnaldo', '#ffffff', 0.8)
    coat = material('coat_arnaldo', '#ffffff', 0.85)  # casacão escuro (textura de lã)
    vest = material('vest_arnaldo', '#ffffff', 0.8)  # colete marrom + camisa branca em V (textura)
    pants = material('pants_arnaldo', '#ffffff', 0.85)  # calça marrom-escura (textura)
    M = {'skin': skin, 'face': face, 'torso': vest, 'arm': coat, 'hand': skin, 'legs': pants, 'feet': skin}
    shirt = material('shirt_arnaldo', '#eeeae2', 0.8)
    tie = material('tie_arnaldo', '#9a1018', 0.6)
    gold = material('gold_arnaldo', '#d4a640', 0.3, metal=0.9)
    lining = material('lining_arnaldo', '#4a1418', 0.8)  # forro vinho do casaco
    shoe = material('shoe_arnaldo', '#151214', 0.4)
    sole = material('sole_arnaldo', '#2a2220', 0.8)
    hairm = material('hair_arnaldo', '#3a2b20', 0.6)
    beardm = material('beard_arnaldo', '#2a1e16', 0.8)
    PREVIEW = {'coat_arnaldo': '#2a2826', 'vest_arnaldo': '#5a3a24', 'pants_arnaldo': '#3a2a20', 'face_arnaldo': '#d4a484', 'face_anfitriao': '#7a3ac0', 'skin_anfitriao': '#7a3ac0'}
    for m in bpy.data.materials:
        for k, c in PREVIEW.items():
            if m.name.endswith(k):
                m['preview'] = c

    TP = [(-0.12, 0.17), (0.0, 0.172), (0.18, 0.168), (0.38, 0.218), (0.5, 0.23), (0.6, 0.124), (0.66, 0.072)]
    hc = b.body(M, TP, arm_r=(0.064, 0.052, 0.044), feet='bare')

    def part(name):
        return next(o for o in b.parts if o.name == name)

    def W(reg):
        return lambda p: auto_weights(sk, p, reg)

    HEAD = lambda p: {'hd': 1.0}
    _bvh = {}

    def bvh(name):
        if name not in _bvh:
            o = part(name)
            dg = bpy.context.evaluated_depsgraph_get()
            me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
            me.transform(o.matrix_world)
            bm = bmesh.new()
            bm.from_mesh(me)
            _bvh[name] = BVHTree.FromBMesh(bm)
            bm.free()
            bpy.data.meshes.remove(me)
        return _bvh[name]

    def surf(name, origin, direction, off=0.0):
        hit = bvh(name).ray_cast(Vector(origin), Vector(direction).normalized())
        return None if hit[0] is None else hit[0] + hit[1] * off

    def front(name, x, z, off=0.0, back=False):
        s = 1 if back else -1
        return surf(name, Vector((x, s * 0.6 * H, z)), Vector((0, -s, 0)), off)

    def around(name, z, off, n=40):
        pts = []
        for i in range(n + 1):
            a = i / n * TAU
            d = Vector((math.sin(a), -math.cos(a), 0))
            q = surf(name, Vector((0, 0, z)) + d * 0.6 * H, -d, off)
            if q:
                pts.append(q)
        return pts

    def limb_ring(name, c, ax, off, n=24):
        ax = ax.normalized()
        u = ax.orthogonal().normalized()
        v = ax.cross(u)
        out = []
        for k in range(n + 1):
            a = k / n * TAU
            d = u * math.cos(a) + v * math.sin(a)
            q = surf(name, c + d * 0.4 * H, -d, off)
            out.append(q if q else c + d * 0.07 * H)
        return out

    def lim(x):
        return max(0.0, min(1.0, x))

    tor = part('torso')
    # ================================================================ o COLETE marrom (a textura traz a camisa no V): o pano assentado,
    # os botões de ouro, a corrente do relógio de um bolso ao outro e o volume do relógio no bolso esquerdo
    relief(tor, lambda p: 0.003 * H * (ridge(p.z / H * 16 + n3(p, 8) * 1.2, 2) - 0.4))
    bts = []
    for i in range(5):
        c = front('torso', 0.0, hz + (0.1 + 0.055 * i) * H, 0.004 * H)
        if c:
            bts.append(ellipsoid(tuple(c), (0.009 * H, 0.005 * H, 0.009 * H), 8, 5))
    b.add('vestButtons', merge(*bts), gold, region='body', weight_fn=W('torso'), subdiv=0)
    ch = [front('torso', (-0.1 + 0.18 * t) * H, hz + (0.2 - math.sin(t * math.pi) * 0.05) * H, 0.006 * H) for t in [k / 14 for k in range(15)]]
    ch = [q for q in ch if q]
    if len(ch) > 3:
        b.add('watchChain', rod(ch, 0.0035 * H, 5, caps=False), gold, region='body', weight_fn=W('torso'), subdiv=0)
    wb = front('torso', 0.085 * H, hz + 0.19 * H, 0.004 * H)
    if wb:
        b.add('watchBulge', ellipsoid(tuple(wb), (0.026 * H, 0.008 * H, 0.026 * H), 10, 6), vest, region='body', weight_fn=W('torso'), subdiv=0)

    # ================================================================ o COLARINHO branco e a GRAVATA vermelha (nó + corpo colado no peito)
    b.add('shirtCollar', clothe(part('neck'), lambda p: p.z < top + 0.075 * H, 0.008 * H, cuts=1), shirt, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
    for s in (1, -1):  # as pontas do colarinho dobradas por cima
        c = front('neck', s * 0.03 * H, top + 0.02 * H, 0.012 * H)
        if c:
            b.add(f'collarTip{s}', rod([c + Vector((s * 0.01 * H, 0, 0.04 * H)), c, c + Vector((-s * 0.012 * H, -0.004 * H, -0.035 * H))], 0.01 * H, 5, flat=(lambda p: Vector((0, -1, 0)), 0.3)), shirt, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
    kn = front('neck', 0.0, top + 0.005 * H, 0.016 * H)
    if kn:
        K = Sculpt()
        K.ell(kn, (0.022 * H, 0.014 * H, 0.022 * H))
        b.add('tieKnot', K.mesh(res=0.003, smooth=2, target=400), tie, region='body', weight_fn=W('torso'), subdiv=0)
    tb = [front('torso', 0.0, z, 0.008 * H) for z in [top - 0.06 * H - (top - hz - 0.3 * H) * k / 8 for k in range(9)]]
    tb = [q for q in tb if q]
    if len(tb) > 2:
        if kn:
            tb.insert(0, kn + Vector((0, 0.002 * H, -0.02 * H)))
        widths = [0.014 * H + 0.012 * H * (k / (len(tb) - 1)) for k in range(len(tb))]
        b.add('tieBody', rod(tb, widths, 6, flat=(lambda p: Vector((0, -1, 0)), 0.25)), tie, region='body', weight_fn=W('torso'), subdiv=0)

    # ================================================================ o CASACÃO escuro até o joelho, ABERTO (mostra o colete), com as
    # LAPELAS largas e a GOLA virada; a saia cai em dobras e tem o forro vinho por dentro
    open_front = lambda p: p.y < -0.05 * H and abs(p.x) < 0.07 * H + 0.08 * lim((top - 0.05 * H - p.z) / (top - hz)) * H
    coat_up = b.add('coat', clothe(tor, lambda p: hz - 0.05 * H < p.z < top + 0.025 * H and not open_front(p), 0.026 * H, cuts=1), coat, region='body', weight_fn=W('torso'), subdiv=0)
    relief(coat_up, lambda p: 0.005 * H * (ridge(p.z / H * 11 + n3(p, 7) * 1.3, 2) - 0.4))
    GAP = 0.1
    SK_Z = [hz + 0.02 * H, hz - 0.18 * H, hz - 0.36 * H, hz - 0.5 * H]
    rings = [(z, 0.212 * H * (1.0 + 0.07 * k), 0.158 * H * (1.0 + 0.08 * k)) for k, z in enumerate(SK_Z)]
    skirt = b.add('coatSkirt', open_tube(rings, gap=GAP, seg=40), coat, region='skirt', subdiv=1)
    relief(skirt, lambda p: (0.004 + 0.009 * lim((hz - p.z) / (0.5 * H))) * H * ridge(math.atan2(p.x, -p.y) * 6 + n3(p, 5) * 1.2, 2))
    b.add('coatLining', open_tube([(z, rx * 0.93, ry * 0.93) for z, rx, ry in rings], gap=GAP + 0.004, seg=40), lining, region='skirt', subdiv=1)
    # as LAPELAS: faixas largas e achatadas ao longo da abertura, do colarinho até a cintura (abrindo para fora)
    # (tiradas da superfície do TRONCO, por fora do casaco: cobrem o corte serrilhado da abertura)
    edge_x = lambda z: 0.07 * H + 0.08 * lim((top - 0.05 * H - z) / (top - hz)) * H
    for s in (1, -1):
        zs = [top + 0.01 * H - (top - hz + 0.04 * H) * k / 16 for k in range(17)]
        ed = [front('torso', s * (edge_x(z) + 0.004 * H), z, 0.03 * H) for z in zs]
        ed = [q for q in ed if q]
        if len(ed) > 3:
            b.add(f'coatEdgeUp{s}', rod(ed, 0.013 * H, 6, caps=False, flat=(outward((0, 0)), 0.45)), coat, region='body', weight_fn=W('torso'), subdiv=0)
        # a LAPELA larga: do colarinho até o meio do peito, virada para fora sobre o casaco
        lz = [top + 0.0 * H - 0.3 * H * k / 10 for k in range(11)]
        lp = [front('torso', s * (edge_x(z) + (0.03 - 0.018 * k / 10) * H), z, 0.036 * H) for k, z in enumerate(lz)]
        lp = [q for q in lp if q]
        if len(lp) > 3:
            wd = [0.034 * H * (1.0 - 0.7 * k / (len(lp) - 1)) + 0.006 * H for k in range(len(lp))]
            b.add(f'lapel{s}', rod(lp, wd, 6, caps=False, flat=(outward((0, 0)), 0.2)), coat, region='body', weight_fn=W('torso'), subdiv=0)
        # a borda da abertura descendo pela saia
        a = (GAP if s > 0 else 1 - GAP) * TAU
        edge = [Vector((math.sin(a) * rx * 1.01, -math.cos(a) * ry * 1.01, z)) for z, rx, ry in rings]
        b.add(f'coatEdge{s}', rod(edge, 0.012 * H, 6, caps=False), coat, region='skirt', subdiv=0)
    # a GOLA virada atrás e dos lados do pescoço
    gl = []
    for i in range(25):
        a = (0.16 + 0.68 * i / 24) * TAU
        d = Vector((math.sin(a), -math.cos(a), 0))
        q = surf('coat', Vector((0, 0, top + 0.01 * H)) + d * 0.6 * H, -d, 0.006 * H)
        if q:
            gl.append(q + Vector((0, 0, 0.03 * H)))
    if len(gl) > 3:
        b.add('coatCollar', rod(gl, 0.03 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), coat, region='body', weight_fn=W('torso'), subdiv=0)
    # as MANGAS compridas do casaco (até o punho) e o punho branco da camisa
    for side in ('L', 'R'):
        arm = part('arm' + side)
        e_, h_ = sk['e' + side], sk['hand' + side]
        sl = b.add('coatSleeve' + side, clothe(arm, lambda p: True, 0.01 * H, cuts=1), coat, region='body', weight_fn=W('arm' + side), subdiv=0)
        relief(sl, lambda p: 0.005 * H * (ridge(p.z / H * 22 + n3(p, 9), 2) - 0.4))
        b.add('shirtCuff' + side, rod(limb_ring('arm' + side, e_.lerp(h_, 0.9), h_ - e_, 0.01 * H), 0.01 * H, 5, caps=False), shirt, region='body', weight_fn=W('arm' + side), subdiv=0)

    # ================================================================ a CALÇA social: o vinco na frente e as dobras sobre o sapato
    for side in ('L', 'R'):
        leg = part('leg' + side)
        relief(leg, lambda p: 0.004 * H * (ridge(p.z / H * 18 + n3(p, 9) * 1.4, 2) - 0.4))

    # ================================================================ SAPATOS sociais pretos (bico arredondado, sola fina)
    for side in ('L', 'R'):
        s = 1 if side == 'L' else -1
        f = sk['foot' + side]
        heel = Vector((f.x, f.y + 0.03 * H, f.z + 0.018 * H))
        toe = Vector((f.x - s * 0.003 * H, f.y - 0.16 * H, f.z + 0.006 * H))
        U = Sculpt()
        U.chain([heel, heel.lerp(toe, 0.55) + Vector((0, 0, 0.012 * H)), toe], [0.045 * H, 0.046 * H, 0.036 * H], step=0.45)
        U.chain([Vector((f.x, f.y + 0.01 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.08 * H))], [0.052 * H, 0.05 * H], step=0.45)
        b.add('shoe' + side, U.mesh(res=0.005, smooth=2, target=800), shoe, region='body', weight_fn=W('k' + side), subdiv=0)
        S = Sculpt()
        S.chain([heel + Vector((0, 0.006 * H, -0.02 * H)), toe + Vector((0, -0.008 * H, -0.004 * H))], [0.048 * H, 0.04 * H], step=0.35)
        so = S.mesh(res=0.005, smooth=2, target=400)
        so = ([(x, y, max(z, f.z - 0.03 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.004 * H)) for x, y, z in so[0]], so[1], so[2])
        b.add('sole' + side, so, sole, region='body', weight_fn=W('k' + side), subdiv=0)

    if host:
        _host_head(b, H, hc, surf, W, HEAD, top)
    else:
        _arnaldo_head(b, H, hc, surf, hairm, beardm, HEAD)
    b.export(OUT)
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
    os.makedirs(src, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, kind + '.blend'), check_existing=False)


def _arnaldo_head(b, H, hc, surf, hairm, beardm, HEAD):
    HCv = Vector((hc.x, hc.y, hc.z))

    def on_head(a, el, off):
        """a = ângulo a partir da frente (+ = lado esquerdo dele, +x), el = elevação a partir do equador"""
        d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
        return surf('head', HCv + d * 0.6 * H, -d, off)

    # ================================================================ CABELO castanho volumoso PENTEADO DE LADO: a risca do lado direito
    # dele (-x); as mechas saem da risca e varrem por cima da cabeça para a esquerda e para trás, com volume na frente;
    # dos lados cobre o alto das orelhas e a nuca é curta
    D = Sculpt()
    # a CALOTA colada na cabeça, do alto (coroa) até a nuca curta atrás e o alto das orelhas dos lados (as bolas
    # precisam se sobrepor para fundir numa peça só)
    for i in range(30):
        for j in range(11):
            a = (i / 30 - 0.5) * TAU
            el = -0.42 + 1.85 * j / 10
            if math.cos(a) > 0.45 and el < 0.8:
                continue  # testa e rosto
            if el < 0.15 and math.cos(a) > -0.35:
                continue  # dos lados só desce até o alto da orelha (atrás desce até a nuca, abaixo do meio da cabeça)
            if el < -0.1 and math.cos(a) > -0.8:
                continue
            q = on_head(a, el, (0.012 if abs(math.sin(a)) > 0.8 and el < 0.5 else 0.006) * H)
            if q:
                D.ell(q, (0.032 * H, 0.032 * H, 0.028 * H))
    PART = -0.5  # a risca (ângulo do lado direito dele)
    for i in range(14):
        # da risca, varrendo para a esquerda (+x) e para trás, com o topete alto na frente
        a0 = PART + 0.05
        el0 = 0.95 - 0.04 * i
        p0 = on_head(a0, 1.05, 0.02 * H)
        if not p0:
            continue
        spread = i / 13
        pts = [on_head(a0 + 0.1, 1.08 - 0.02 * i, 0.016 * H + 0.008 * H * (1 - spread)),
               on_head(0.2 + 0.9 * spread, 1.2 - 0.25 * spread, 0.018 * H),
               on_head(0.6 + 1.3 * spread, 0.75 - 0.25 * spread, 0.014 * H),
               on_head(1.1 + 1.5 * spread, 0.4, 0.012 * H)]
        pts = [q for q in pts if q]
        if len(pts) > 2:
            D.chain(pts, [0.022 * H, 0.026 * H, 0.022 * H, 0.012 * H][:len(pts)], step=0.5)
    # o lado direito, curto: da risca para baixo, até cobrir o alto da orelha
    for i in range(7):
        a = PART - 0.2 - 0.12 * i
        pts = [on_head(a, 1.0, 0.014 * H), on_head(a - 0.3, 0.6, 0.016 * H), on_head(a - 0.45, 0.25, 0.012 * H)]
        pts = [q for q in pts if q]
        if len(pts) > 1:
            D.chain(pts, [0.02 * H, 0.022 * H, 0.012 * H][:len(pts)], step=0.5)
    # a franja/topete na frente, caindo um pouco para a esquerda sobre a testa
    for i in range(5):
        a = PART + 0.15 + 0.14 * i
        pts = [on_head(a, 0.95, 0.02 * H), on_head(a + 0.18, 0.8, 0.018 * H), on_head(a + 0.32, 0.7, 0.008 * H)]
        pts = [q for q in pts if q]
        if len(pts) > 1:
            D.chain(pts, [0.02 * H, 0.016 * H, 0.006 * H][:len(pts)], step=0.5)
    hd_ = lambda p: 0.002 * H * (ridge(p.x / H * 90 + p.y / H * 60 + n3(p, 30), 2) - 0.4)
    b.add('hair', D.mesh(res=0.0045, smooth=2, disp=hd_, target=5000), hairm, region='body', weight_fn=HEAD, subdiv=0)

    # ================================================================ BARBA CHEIA castanho-escura bem aparada (queixo, mandíbula e bochechas;
    # a boca livre) com as costeletas até o cabelo e o BIGODE
    B = Sculpt()
    for i in range(19):
        a = (i / 18 - 0.5) * 2.75
        for el in (-0.22, -0.36, -0.5, -0.64, -0.78):
            if abs(a) < 0.34 and el > -0.56:
                continue  # a boca
            if abs(a) < 0.72 and el > -0.34:
                continue  # as maçãs do rosto ficam livres
            q = on_head(a, el, 0.003 * H)
            if q:
                B.ell(q, (0.024 * H, 0.024 * H, 0.022 * H))
    for s in (1, -1):
        for el in (-0.1, 0.05, 0.2):
            q = on_head(s * 1.25, el, 0.003 * H)
            if q:
                B.ell(q, (0.02 * H, 0.02 * H, 0.024 * H))
    chin = on_head(0.0, -0.82, 0.012 * H)
    if chin:
        B.chain([chin, chin + Vector((0, -0.01 * H, -0.035 * H))], [0.03 * H, 0.016 * H], step=0.5)
    b.add('beard', B.mesh(res=0.004, smooth=2, disp=lambda p: 0.002 * H * (ridge(p.x / H * 140 + p.z / H * 40, 2) - 0.4), target=2600), beardm, region='body', weight_fn=HEAD, subdiv=0)
    Mu = Sculpt()
    for s in (1, -1):
        pts = [on_head(s * a, el, 0.012 * H) for a, el in ((0.03, -0.36), (0.16, -0.38), (0.28, -0.45), (0.32, -0.56))]
        pts = [q for q in pts if q]
        if len(pts) > 1:
            Mu.chain(pts, [0.014 * H, 0.016 * H, 0.012 * H, 0.008 * H][:len(pts)], step=0.45)
    b.add('mustache', Mu.mesh(res=0.0035, smooth=2, target=1000), beardm, region='body', weight_fn=HEAD, subdiv=0)


def _host_head(b, H, hc, surf, W, HEAD, top):
    """O ANFITRIÃO pela "Miniatura O Anfitrião em Calamidade": a cabeça toda tomada por MANGUEIRAS CANELADAS (cinza, rosa e
    azul) que saem do alto e descem pelas costas até abaixo dos ombros; na frente a MÁSCARA DE GÁS lisa e escura com o
    SÍMBOLO DO ANFITRIÃO gravado em luz (o círculo com as runas, o triângulo e o olho), as duas LENTES REDONDAS grandes
    brilhando em rosa e, no queixo, o FILTRO canelado com as runas acesas em volta."""
    HCv = Vector((hc.x, hc.y, hc.z))

    def on_head(a, el, off):
        d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
        return surf('head', HCv + d * 0.6 * H, -d, off)

    rubber = material('mask_anfitriao', '#2a1a34', 0.5)
    hose = material('hose_anfitriao', '#5a5560', 0.55)
    glowp = material('eyes_anfitriao', '#ff6ae0', 0.4, emission='#ff5ad8', strength=2.2)  # as lentes rosa (forte demais estoura)
    sym = material('symbol_anfitriao', '#ffe0f8', 0.4, emission='#ff9ae8', strength=3.5)
    cab = [material('cable_pink', '#ff4ad0', 0.4, emission='#ff4ad0', strength=2.5),
           material('cable_blue', '#4ab8ff', 0.4, emission='#4ab8ff', strength=2.5)]
    # nas mangueiras que descem abaixo do pescoço, o tronco leva (senão elas saem do lugar quando ele vira a cabeça)
    def HW(p):
        return HEAD(p) if p.z > top + 0.1 * H else W('torso')(p)

    # ---------------- a MÁSCARA: a calota lisa por cima da cabeça inteira e a placa da frente
    Mk = Sculpt()
    for i in range(26):
        for j in range(10):
            a = (i / 26 - 0.5) * TAU
            el = -0.55 + 1.95 * j / 9
            q = on_head(a, el, 0.006 * H)
            if q:
                Mk.ell(q, (0.03 * H, 0.03 * H, 0.028 * H))
    b.add('maskShell', Mk.mesh(res=0.0045, smooth=2, target=3500), rubber, region='body', weight_fn=HEAD, subdiv=0)
    face_c = on_head(0.0, 0.05, 0.03 * H)
    # o SÍMBOLO DO ANFITRIÃO: o círculo duplo, o triângulo e o olho, e os tracinhos das runas em volta
    if face_c:
        n = Vector((0, -1, 0))
        ring = lambda r, k=40: [face_c + Vector((math.cos(t) * r, -0.002 * H, math.sin(t) * r)) for t in [i / k * TAU for i in range(k + 1)]]
        parts = [rod(ring(0.105 * H), 0.004 * H, 4, caps=False), rod(ring(0.082 * H), 0.003 * H, 4, caps=False)]
        tri = [face_c + Vector((math.cos(t) * 0.075 * H, -0.004 * H, math.sin(t) * 0.075 * H)) for t in [math.pi / 2 + k / 3 * TAU for k in range(4)]]
        parts.append(rod(tri, 0.0035 * H, 4, caps=False))
        for k in range(16):  # as runas: tracinhos entre os dois círculos
            t = k / 16 * TAU
            p0 = face_c + Vector((math.cos(t) * 0.087 * H, -0.003 * H, math.sin(t) * 0.087 * H))
            parts.append(rod([p0, p0 + Vector((math.cos(t + 0.6) * 0.012 * H, 0, math.sin(t + 0.6) * 0.012 * H))], 0.0025 * H, 4))
        b.add('hostSymbol', merge(*parts), sym, region='body', weight_fn=HEAD, subdiv=0)
        # as LENTES redondas grandes (com o aro escuro) por cima do símbolo
        for s in (1, -1):
            c = face_c + Vector((s * 0.052 * H, -0.012 * H, 0.012 * H))
            b.add(f'lensRim{s}', rod([c + Vector((math.cos(t) * 0.042 * H, 0, math.sin(t) * 0.042 * H)) for t in [i / 24 * TAU for i in range(25)]], 0.009 * H, 6, caps=False), rubber, region='body', weight_fn=HEAD, subdiv=0)
            b.add(f'lens{s}', ellipsoid(tuple(c + Vector((0, -0.002 * H, 0))), (0.038 * H, 0.012 * H, 0.038 * H), 16, 8), glowp, region='body', weight_fn=HEAD, subdiv=0)
    # ---------------- o FILTRO no queixo: o cilindro canelado, a grade e as runas acesas em volta
    chin = on_head(0.0, -0.62, 0.02 * H)
    if chin:
        ax = Vector((0, -0.8, -0.6)).normalized()
        F = Sculpt()
        F.chain([chin, chin + ax * 0.06 * H], [0.05 * H, 0.054 * H], step=0.35)
        fo = b.add('maskFilter', F.mesh(res=0.004, smooth=2, target=900), rubber, region='body', weight_fn=HEAD, subdiv=0)
        relief(fo, lambda p: 0.004 * H * ridge(((p - chin).dot(ax)) / H * 160, 3))
        cap_c = chin + ax * 0.064 * H
        u, v = Vector((1, 0, 0)), ax.cross(Vector((1, 0, 0))).normalized()
        grill = [rod([cap_c + u * x * H + v * -0.035 * H, cap_c + u * x * H + v * 0.035 * H], 0.003 * H, 4) for x in (-0.024, -0.008, 0.008, 0.024)]
        b.add('filterGrill', merge(*grill), sym, region='body', weight_fn=HEAD, subdiv=0)
        runes = []
        for k in range(10):
            a = (k / 9 - 0.5) * 1.6
            q = on_head(a, -0.36, 0.034 * H)
            if q:
                runes.append(rod([q, q + Vector((0.008 * H, 0, -0.012 * H))], 0.0025 * H, 4))
        if runes:
            b.add('maskRunes', merge(*runes), sym, region='body', weight_fn=HEAD, subdiv=0)
    # ---------------- as MANGUEIRAS CANELADAS: saem do alto e da beira da máscara e descem pelas costas até abaixo dos
    # ombros (algumas caem pela frente dos ombros); cinza na maioria, rosa e azul acesas entre elas
    rnd = random.Random(77)
    hoses = {0: [], 1: [], 2: []}
    for i in range(26):
        # dos lados do rosto (±1,35 rad) até o meio das costas (π): emolduram a máscara, nunca caem na frente dela
        side = 1 if i % 2 else -1
        a = side * (1.35 + (math.pi - 1.35) * (i // 2) / 12)
        a0 = rnd.uniform(-0.5, 0.5)
        pts = [on_head(a0 * 0.6, 1.3, 0.03 * H), on_head(a * 0.6, 0.95, 0.034 * H), on_head(a * 0.9, 0.45, 0.036 * H), on_head(a, -0.15, 0.034 * H)]
        pts = [q for q in pts if q]
        if len(pts) < 3:
            continue
        end = pts[-1]
        d = Vector((math.sin(a), -math.cos(a), 0)).normalized()
        drop = rnd.uniform(0.32, 0.5) * H
        pts += [end + d * 0.04 * H + Vector((0, 0.02 * H, -0.14 * H)), end + d * 0.07 * H + Vector((0, 0.04 * H, -drop))]
        kind = 1 if i % 6 == 2 else 2 if i % 6 == 5 else 0
        hoses[kind].append(rod(pts, 0.013 * H if kind == 0 else 0.009 * H, 6, caps=True))
    for kind, lst in hoses.items():
        if not lst:
            continue
        o = b.add(f'hoses{kind}', merge(*lst), hose if kind == 0 else cab[kind - 1], region='body', weight_fn=HW, subdiv=0)
        if kind == 0:
            relief(o, lambda p: 0.004 * H * ridge(p.z / H * 150 + p.x / H * 40, 3))  # os anéis da mangueira
    # a mangueira grossa do filtro descendo até o peito
    if chin:
        st = chin + Vector((0, -0.05 * H, -0.04 * H))
        h2 = [st, st + Vector((0.03 * H, -0.02 * H, -0.08 * H)), st + Vector((0.06 * H, -0.01 * H, -0.18 * H)), st + Vector((0.07 * H, 0.0, -0.28 * H))]
        o = b.add('filterHose', rod(h2, 0.016 * H, 8), hose, region='body', weight_fn=HW, subdiv=0)
        relief(o, lambda p: 0.004 * H * ridge(p.z / H * 150, 3))
    # os cabos enrolados pelo corpo (tronco, braços, pernas) ficam em código: anéis finos que balançam (props.js)
