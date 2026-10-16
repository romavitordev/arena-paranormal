"""
ESCULTURA ORGÂNICA para os personagens (char_*.py): em vez de juntar primitivas (que ficam com cara de "formas
coladas"), a peça é UMA forma contínua — vários metaballs que se fundem (metaballs negativos cavam), suavizados, com
relevo esculpido por deslocamento ao longo da normal e decimados para o orçamento. Mesma técnica do Carniçal
(npc_carnical.py), aqui em coordenadas do Blender (x = esquerda do boneco, -y = frente, z = cima), para entrar no
Builder com b.add(nome, s.mesh(...), material, region=..., subdiv=0) e ganhar os pesos do esqueleto como qualquer peça.
"""
import math

import bpy
import bmesh
from mathutils import Vector, noise

TAU = math.tau

K = 0.575  # metaball (rigidez 2, limiar 0.6): a superfície de um elemento isolado fica em 0.575 × raio


def ridge(x, sharp=3):
    """crista: 1 no topo, 0 no sulco (fios de cabelo, fibras, dobras)"""
    return (0.5 + 0.5 * math.cos(x)) ** sharp


def n3(p, s=1.0):
    return noise.noise(Vector(p) * s)


class Sculpt:
    _n = 0

    def __init__(self):
        self.els = []  # (centro, raios (x, y, z), direção ou None, negativo)

    def ell(self, c, r, dir=None, neg=False):
        """elipsoide; com `dir`, r[2] é o raio AO LONGO de dir e r[0] o de través"""
        if not isinstance(r, (tuple, list)):
            r = (r, r, r)
        self.els.append((Vector(c), tuple(r), Vector(dir).normalized() if dir else None, neg))
        return self

    def chain(self, pts, radii, step=0.45):
        """bolas ao longo de uma polilinha, próximas o bastante para fundir num tubo liso"""
        n = len(pts)
        rs = radii if isinstance(radii, (list, tuple)) else [radii] * n
        if len(rs) != n:
            rs = [rs[0] + (rs[-1] - rs[0]) * i / (n - 1) for i in range(n)]
        for i in range(n - 1):
            a, b = Vector(pts[i]), Vector(pts[i + 1])
            k = max(1, int((b - a).length / (min(rs[i], rs[i + 1]) * step)))
            for j in range(k):
                t = j / k
                self.ell(a.lerp(b, t), rs[i] + (rs[i + 1] - rs[i]) * t)
        self.ell(pts[-1], rs[-1])
        return self

    def mesh(self, res=0.008, smooth=3, disp=None, target=None):
        """a malha (verts, faces, uvs=None) em coordenadas do mundo, pronta para o Builder"""
        Sculpt._n += 1
        name = f'MBsculpt{Sculpt._n}'  # nome único = família de metaball própria (não funde com outras peças)
        mb = bpy.data.metaballs.new(name)
        mb.resolution = res
        mb.render_resolution = res
        mb.threshold = 0.6
        for c, r, d, neg in self.els:
            e = mb.elements.new(type='ELLIPSOID')
            e.co = c
            e.radius = 1 / K
            e.stiffness = 8.0 if neg else 2.0  # o negativo forte cava de verdade
            e.use_negative = neg
            e.size_x, e.size_y, e.size_z = r
            if d is not None:
                e.rotation = Vector((0, 0, 1)).rotation_difference(d)
        ob = bpy.data.objects.new(name, mb)
        bpy.context.scene.collection.objects.link(ob)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
        bpy.data.objects.remove(ob)
        bpy.data.metaballs.remove(mb)
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=res * 0.25)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        for _ in range(smooth):
            bmesh.ops.smooth_vert(bm, verts=bm.verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bm.normal_update()
        if disp:
            for v in bm.verts:
                v.co += v.normal * disp(v.co.copy())
        bm.to_mesh(me)
        bm.free()
        if target and len(me.polygons) > target:
            tmp = bpy.data.objects.new(name, me)
            bpy.context.scene.collection.objects.link(tmp)
            m = tmp.modifiers.new('dec', 'DECIMATE')
            m.ratio = target / len(me.polygons)
            m.use_collapse_triangulate = True
            dg = bpy.context.evaluated_depsgraph_get()
            me2 = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
            bpy.data.objects.remove(tmp)
            bpy.data.meshes.remove(me)
            me = me2
        verts = [tuple(v.co) for v in me.vertices]
        faces = [tuple(p.vertices) for p in me.polygons]
        bpy.data.meshes.remove(me)
        return verts, faces, None


# ---------------------------------------------------------------- peças por caminho / superfície (para o Builder)
def ring_pts(z, rx, ry, a0, a1, n):
    """pontos de um anel elíptico (ângulo 0 = frente, -y), de a0 a a1"""
    out = []
    for i in range(n + 1):
        a = a0 + (a1 - a0) * i / n
        out.append(Vector((math.sin(a) * rx, -math.cos(a) * ry, z)))
    return out


def rod(pts, radii, seg=6, caps=True, flat=None):
    """Tubo com anéis perpendiculares ao caminho (o tube() do lib faz anéis horizontais: só serve para peças em pé).
    flat=(normal_fn, achatamento): seção achatada na direção da normal — tiras de couro e faixas rentes ao corpo."""
    pts = [Vector(p) for p in pts]
    n = len(pts)
    rs = radii if isinstance(radii, (list, tuple)) else [radii] * n
    verts, faces, uvs = [], [], []
    prev = None
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
        if flat:
            nn = flat[0](p)
            nn = (nn - t * nn.dot(t)).normalized()
            side = t.cross(nn).normalized()
            up = nn
        else:
            side = (prev - t * prev.dot(t)) if prev is not None else t.orthogonal()
            side.normalize()
            prev = side
            up = t.cross(side)
        k = flat[1] if flat else 1.0
        for j in range(seg + 1):
            a = j / seg * TAU
            verts.append(tuple(p + side * math.cos(a) * rs[i] + up * math.sin(a) * rs[i] * k))
            uvs.append((j / seg, i / (n - 1)))
    row = seg + 1
    for i in range(n - 1):
        for j in range(seg):
            a = i * row + j
            faces.append((a, a + row, a + 1 + row, a + 1))
    if caps:
        for k_, flip in ((0, True), (n - 1, False)):
            c = len(verts)
            verts.append(tuple(pts[k_]))
            uvs.append((0.5, k_ / (n - 1)))
            for j in range(seg):
                faces.append((c, k_ * row + j + 1, k_ * row + j) if flip else (c, k_ * row + j, k_ * row + j + 1))
    return verts, faces, uvs


def outward(c):
    """normal "para fora" a partir de um eixo vertical em c (x, y): fitas deitadas na superfície do corpo"""
    return lambda p: Vector((p.x - c[0], p.y - c[1], 0)) if (p.x - c[0]) ** 2 + (p.y - c[1]) ** 2 > 1e-9 else Vector((0, -1, 0))


def shell_grid(rows, thick=0.006):
    """superfície por linhas de pontos (todas do mesmo tamanho), com espessura (frente e verso + bordas)"""
    nr, nc = len(rows), len(rows[0])
    verts, faces, uvs = [], [], []
    # normal aproximada por diferenças finitas
    def nrm(i, j):
        a = rows[min(i + 1, nr - 1)][j] - rows[max(i - 1, 0)][j]
        b_ = rows[i][min(j + 1, nc - 1)] - rows[i][max(j - 1, 0)]
        n = a.cross(b_)
        return n.normalized() if n.length > 1e-9 else Vector((0, 0, 1))
    for side in (1, -1):
        for i in range(nr):
            for j in range(nc):
                verts.append(tuple(rows[i][j] + nrm(i, j) * thick * 0.5 * side))
                uvs.append((j / (nc - 1), 1 - i / (nr - 1)))
    off = nr * nc
    for i in range(nr - 1):
        for j in range(nc - 1):
            a = i * nc + j
            faces.append((a, a + 1, a + 1 + nc, a + nc))
            faces.append((off + a + nc, off + a + 1 + nc, off + a + 1, off + a))
    # bordas fechando as duas faces
    loop = [(0, j) for j in range(nc)] + [(i, nc - 1) for i in range(1, nr)] + [(nr - 1, j) for j in range(nc - 2, -1, -1)] + [(i, 0) for i in range(nr - 2, 0, -1)]
    for k in range(len(loop)):
        i0, j0 = loop[k]
        i1, j1 = loop[(k + 1) % len(loop)]
        a, c = i0 * nc + j0, i1 * nc + j1
        faces.append((a, off + a, off + c, c))
    return verts, faces, uvs


def relief(obj, fn):
    """esculpe uma peça que JÁ existe (mantém o UV e a textura): desloca cada vértice ao longo da normal por fn(p),
    p no mundo — músculos no tronco nu, dobras num pano"""
    me = obj.data
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.normal_update()
    mw = obj.matrix_world
    inv = mw.inverted()
    for v in bm.verts:
        p = mw @ v.co
        d = fn(p)
        if d:
            n = (mw.to_3x3() @ v.normal).normalized()
            v.co = inv @ (p + n * d)
    bm.to_mesh(me)
    bm.free()
    me.update()


# CORRENTE de verdade: elos ovais alternados (um deitado, o próximo em pé) ao longo de um caminho
def chain_mesh(path, link=0.032, r=0.0042, closed=False):
    pts = [Vector(q) for q in path]
    seg = list(zip(pts, pts[1:] + ([pts[0]] if closed else [])))
    lens = [(b_ - a_).length for a_, b_ in seg]
    total = sum(lens)
    n = max(2, int(total / (link * 0.78)))

    def at(d):
        for (a_, b_), L in zip(seg, lens):
            if d <= L:
                return a_.lerp(b_, d / max(L, 1e-9))
            d -= L
        return seg[-1][1].copy()
    samples = [at(total * i / n) for i in range(n + 1)]
    links = []
    for i in range(len(samples) - 1):
        c = (samples[i] + samples[i + 1]) / 2
        t = (samples[i + 1] - samples[i]).normalized()
        nrm = t.orthogonal().normalized()
        if i % 2:
            nrm = t.cross(nrm).normalized()  # um elo deitado, o próximo em pé
        ring = [c + t * math.cos(a) * link * 0.55 + nrm * math.sin(a) * link * 0.32 for a in [k / 8 * TAU for k in range(9)]]
        links.append(rod(ring, r, 4, caps=False))
    V, F = [], []
    for v, f, _ in links:
        o = len(V)
        V += v
        F += [tuple(i + o for i in face) for face in f]
    return V, F, None


def vcol_material(name, rough=0.55):
    """material cuja cor vem do atributo de vértice 'Col' (o glTF exporta COLOR_0; o jogo liga vertexColors)"""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Roughness'].default_value = rough
    attr = nt.nodes.new('ShaderNodeVertexColor')
    attr.layer_name = 'Col'
    nt.links.new(attr.outputs['Color'], bsdf.inputs['Base Color'])
    return m


def paint(obj, fn):
    """pinta a cor por vértice (atributo 'Col') com fn(p no mundo) → (r, g, b) linear"""
    me = obj.data
    ca = me.color_attributes.get('Col') or me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    mw = obj.matrix_world
    for v in me.vertices:
        c = fn(mw @ v.co)
        ca.data[v.index].color = (c[0], c[1], c[2], 1)


def clothe(src, keep, offset=0.006, cuts=3):
    """ROUPA JUSTA a partir de uma peça do corpo: copia a malha de `src` (já no lugar, com UV), infla `offset` ao longo
    da normal e fica só com as faces cujo centro passa em keep(p) — uma regata cortando decote e cavas do tronco.
    Devolve (verts, faces, uvs) no mundo, para o Builder (use region='body' para não escalar de novo)."""
    # a malha AVALIADA (com a subdivisão do Builder): o corte do decote sai liso, não em degraus
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(src.evaluated_get(dg))
    if cuts:  # subdivide antes de cortar: a borda do corte fica com degraus pequenos
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
        bm.to_mesh(me)
        bm.free()
        me.update()
    mw = src.matrix_world
    nm = mw.to_3x3()
    uv = me.uv_layers.active.data if me.uv_layers.active else None
    verts, faces, uvs, remap = [], [], [], {}
    for poly in me.polygons:
        c = mw @ poly.center
        if not keep(c):
            continue
        f = []
        for li in poly.loop_indices:
            vi = me.loops[li].vertex_index
            key = (vi, tuple(round(x, 5) for x in uv[li].uv) if uv else None)
            if key not in remap:
                v = me.vertices[vi]
                remap[key] = len(verts)
                verts.append(tuple(mw @ v.co + (nm @ v.normal).normalized() * offset))
                uvs.append(tuple(uv[li].uv) if uv else (0.0, 0.0))
            f.append(remap[key])
        faces.append(tuple(f))
    bpy.data.meshes.remove(me)
    return verts, faces, uvs
