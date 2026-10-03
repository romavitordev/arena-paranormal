"""
Ajudantes de geometria das INVOCAÇÕES (npc_*.py): peças rígidas penduradas em juntas (empties J_*), sem esqueleto.
Coordenadas no espaço do jogo (x = esquerda do boneco, y = cima, z = frente), convertidas para o Blender por T().
"""
import bpy
import math
import random
from mathutils import Vector
from lib import make_obj, join, TAU


def T(x, y, z):
    """espaço do jogo → Blender"""
    return Vector((x, -z, y))


# ---------------------------------------------------------------- geometria (pontos no espaço do jogo)
def frames(pts):
    """tangente, normal e binormal ao longo da curva (transporte paralelo: o tubo não torce)"""
    n = len(pts)
    tan = []
    for i in range(n):
        a = pts[max(0, i - 1)]
        b = pts[min(n - 1, i + 1)]
        t = (b - a)
        tan.append(t.normalized() if t.length > 1e-9 else Vector((0, 1, 0)))
    up = Vector((0, 0, 1)) if abs(tan[0].z) < 0.9 else Vector((1, 0, 0))
    N = [tan[0].cross(up).normalized()]
    for i in range(1, n):
        v = N[-1] - tan[i] * N[-1].dot(tan[i])
        N.append(v.normalized() if v.length > 1e-9 else N[-1])
    B = [tan[i].cross(N[i]).normalized() for i in range(n)]
    return tan, N, B


def rod(points, radii, seg=8, flat=1.0, caps=True, wobble=0.0):
    """tubo por uma curva qualquer; radii: número ou lista; flat < 1 achata (lâmina)"""
    pts = [T(*p) for p in points]
    n = len(pts)
    rs = radii if isinstance(radii, (list, tuple)) else [radii] * n
    if len(rs) != n:  # interpola
        rs = [rs[0] + (rs[-1] - rs[0]) * i / (n - 1) for i in range(n)]
    tan, N, B = frames(pts)
    V, F, U = [], [], []
    for i in range(n):
        w = 1 + (random.uniform(-wobble, wobble) if wobble else 0)
        for s in range(seg):
            a = s / seg * TAU
            off = N[i] * math.cos(a) * rs[i] * w + B[i] * math.sin(a) * rs[i] * flat * w
            V.append(tuple(pts[i] + off))
            U.append((s / seg, i / max(1, n - 1)))
    for i in range(n - 1):
        for s in range(seg):
            a = i * seg + s
            b = i * seg + (s + 1) % seg
            F.append((a, b, b + seg, a + seg))
    if caps:
        for end, base in ((0, 0), (n - 1, (n - 1) * seg)):
            c = len(V)
            V.append(tuple(pts[end]))
            U.append((0.5, 0.5))
            for s in range(seg):
                a, b = base + s, base + (s + 1) % seg
                F.append((c, b, a) if end == 0 else (c, a, b))
    return V, F, U


def curve(p0, p1, p2, n=8, jitter=0.0):
    """curva de Bézier quadrática (pontos do jogo), com tremor opcional (galho retorcido)"""
    out = []
    for i in range(n):
        t = i / (n - 1)
        p = [(1 - t) ** 2 * p0[k] + 2 * (1 - t) * t * p1[k] + t * t * p2[k] for k in range(3)]
        if jitter and 0 < i < n - 1:
            p = [p[0] + random.uniform(-jitter, jitter), p[1], p[2] + random.uniform(-jitter, jitter)]
        out.append(tuple(p))
    return out


def ring(center, axis, radius, r_tube=0.012, seg=14):
    """anel de corda em volta de um eixo (amarração)"""
    c = Vector(center)  # espaço do jogo (o rod converte)
    ax = Vector(axis).normalized()
    side = ax.orthogonal().normalized()
    up = ax.cross(side)
    pts = []
    for i in range(seg + 1):
        a = i / seg * TAU
        p = c + (side * math.cos(a) + up * math.sin(a)) * radius
        pts.append((p.x, p.y, p.z))
    return rod(pts, r_tube, seg=5, caps=False)


def blob(center, radii, seg=10, rings=8):
    """elipsoide (crânio, nós das juntas, gotas de lodo)"""
    cx, cy, cz = center
    rx, ry, rz = radii
    V, F, U = [], [], []
    for r in range(rings + 1):
        th = r / rings * math.pi
        for s in range(seg):
            a = s / seg * TAU
            p = T(cx + math.sin(th) * math.cos(a) * rx, cy + math.cos(th) * ry, cz + math.sin(th) * math.sin(a) * rz)
            V.append(tuple(p))
            U.append((s / seg, r / rings))
    for r in range(rings):
        for s in range(seg):
            a = r * seg + s
            b = r * seg + (s + 1) % seg
            F.append((a, b, b + seg, a + seg))
    return V, F, U


def spike(base, tip, r, seg=6):
    """cone (dente, espinho, estaca)"""
    b, t = T(*base), T(*tip)
    ax = (t - b).normalized()
    side = ax.orthogonal().normalized()
    up = ax.cross(side)
    V, F, U = [], [], []
    for s in range(seg):
        a = s / seg * TAU
        V.append(tuple(b + (side * math.cos(a) + up * math.sin(a)) * r))
        U.append((s / seg, 0))
    V.append(tuple(t))
    V.append(tuple(b))
    U += [(0.5, 1), (0.5, 0)]
    for s in range(seg):
        F.append((s, (s + 1) % seg, seg))
        F.append(((s + 1) % seg, s, seg + 1))
    return V, F, U


def ribbon(points, widths, normal=(0, 0, 1)):
    """fita (pano rasgado, mecha de cabelo): faixa de quadriláteros; a ponta fica em bico"""
    pts = [T(*p) for p in points]
    n = len(pts)
    ws = widths if isinstance(widths, (list, tuple)) else [widths * (1 - 0.85 * i / (n - 1)) for i in range(n)]
    nrm = T(*normal)
    V, F, U = [], [], []
    for i in range(n):
        t = (pts[min(n - 1, i + 1)] - pts[max(0, i - 1)]).normalized()
        side = t.cross(nrm)
        side = side.normalized() if side.length > 1e-6 else Vector((1, 0, 0))
        V.append(tuple(pts[i] + side * ws[i] / 2))
        V.append(tuple(pts[i] - side * ws[i] / 2))
        U += [(0, i / (n - 1)), (1, i / (n - 1))]
    for i in range(n - 1):
        a = i * 2
        F.append((a, a + 1, a + 3, a + 2))
    return V, F, U


# ---------------------------------------------------------------- juntas (empties)
def joint(name, pos, parent=None):
    e = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(e)
    e.empty_display_size = 0.05
    if parent is not None:
        e.parent = parent
    e.location = T(*pos)
    return e


parts = {}  # junta → lista de objetos (juntados no fim)


def add(jnt, name, geo, mat):
    v, f, u = geo
    o = make_obj(name, v, f, u, mat=mat, parent=jnt)
    parts.setdefault(jnt.name, []).append(o)
    return o


def finish():
    """junta as peças de cada junta numa malha (uma por junta, materiais por face)"""
    for jname, objs in parts.items():
        if len(objs) > 1:
            join(objs, f'P_{jname[2:]}')
        else:
            objs[0].name = f'P_{jname[2:]}'
