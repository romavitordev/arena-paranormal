"""
Biblioteca de modelagem procedural para o Blender (executada em modo background).
Gera personagens com esqueleto (armature) compatível com o Animator do jogo e
cenários estáticos, e exporta em .glb.

Convenções (coordenadas do Blender, Z para cima):
  - o personagem olha para -Y (vira +Z no three.js); o lado ESQUERDO do personagem é +X
  - juntas com os MESMOS nomes do jogo: hips, sp, hd, sL, eL, sR, eR, lL, kL, lR, kR
  - pivôs nas mesmas alturas do rig procedural (quadril 0.95, ombro 1.55, cabeça 1.68...)
  - texturas pintadas (rosto, tatuagens, xadrez...) são aplicadas no jogo pelo NOME do material
"""
import bpy
import bmesh
import math
from mathutils import Vector, Matrix

TAU = math.pi * 2


# ---------------------------------------------------------------- cena
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, color, rough=0.75, metal=0.0, emission=None, strength=1.0, alpha=1.0):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    c = hex_rgb(color)
    bsdf.inputs['Base Color'].default_value = (*c, 1)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if emission is not None:
        e = hex_rgb(emission)
        bsdf.inputs['Emission Color'].default_value = (*e, 1)
        bsdf.inputs['Emission Strength'].default_value = strength
    if alpha < 1:
        bsdf.inputs['Alpha'].default_value = alpha
        m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
    return m


def hex_rgb(h):
    if isinstance(h, str):
        h = int(h.lstrip('#'), 16)
    r, g, b = (h >> 16) & 255, (h >> 8) & 255, h & 255
    # Blender trabalha em espaço linear
    lin = lambda v: (v / 255) ** 2.2
    return (lin(r), lin(g), lin(b))


def make_obj(name, verts, faces, uvs=None, mat=None, smooth=True, subdiv=0, parent=None, collection=None):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([tuple(v) for v in verts], [], [tuple(f) for f in faces])
    mesh.update()
    if uvs is not None:
        uv = mesh.uv_layers.new(name='UVMap')
        for poly in mesh.polygons:
            for li, vi in zip(poly.loop_indices, poly.vertices):
                uv.data[li].uv = uvs[vi]
    # normais sempre para fora
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    (collection or bpy.context.scene.collection).objects.link(obj)
    if mat is not None:
        obj.data.materials.append(mat)
    if smooth:
        for p in mesh.polygons:
            p.use_smooth = True
    if subdiv:
        mod = obj.modifiers.new('sub', 'SUBSURF')
        mod.levels = subdiv
        mod.render_levels = subdiv
        apply_modifiers(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def apply_modifiers(obj):
    bpy.context.view_layer.objects.active = obj
    for o in bpy.context.selected_objects:
        o.select_set(False)
    obj.select_set(True)
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def join(objs, name):
    """Junta várias malhas numa só (mantendo materiais por face)."""
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    objs[0].name = name
    objs[0].data.name = name
    return objs[0]


# ---------------------------------------------------------------- primitivas
def tube(rings, segments=14, cap_start=True, cap_end=True, u_front=0.5):
    """
    Tubo "lofted" por anéis. rings: [(x, y, z, rx, ry), ...] (raio rx em X, ry em Y).
    UV: u ao redor (0.5 = frente, -Y), v ao longo do comprimento.
    Retorna verts, faces, uvs.
    """
    verts, faces, uvs = [], [], []
    n = len(rings)
    total = 0
    lens = [0]
    for i in range(1, n):
        a, b = Vector(rings[i - 1][:3]), Vector(rings[i][:3])
        total += (b - a).length
        lens.append(total)
    total = total or 1
    for i, (x, y, z, rx, ry) in enumerate(rings):
        for s in range(segments + 1):
            # costura nas COSTAS: u = 0.5 fica na frente (-Y), bom para texturas de peito/rosto
            a = (s / segments - 0.5) * TAU
            px = x + math.sin(a) * rx
            py = y - math.cos(a) * ry
            verts.append((px, py, z))
            uvs.append(((s / segments + u_front) % 1.0001 if s < segments else (1 + u_front) % 1.0001 or 1.0, 1 - lens[i] / total))
    row = segments + 1
    for i in range(n - 1):
        for s in range(segments):
            a = i * row + s
            faces.append((a, a + 1, a + 1 + row, a + row))
    if cap_start:
        c = len(verts)
        x, y, z, _, _ = rings[0]
        verts.append((x, y, z))
        uvs.append((0.5, 1))
        for s in range(segments):
            faces.append((c, s + 1, s))
    if cap_end:
        c = len(verts)
        x, y, z, _, _ = rings[-1]
        verts.append((x, y, z))
        uvs.append((0.5, 0))
        base = (n - 1) * row
        for s in range(segments):
            faces.append((c, base + s, base + s + 1))
    # UV contínuo: recalcula u sem "wrap" para evitar costura esticada
    for i in range(n):
        for s in range(segments + 1):
            vi = i * row + s
            uvs[vi] = (s / segments, uvs[vi][1])
    return verts, faces, uvs


def ellipsoid(center, radii, seg=16, rings=12, theta_max=math.pi, phi=(0.0, 1.0)):
    """
    Elipsoide (ou parte dele) com UV esférico; u=0.5 na frente (-Y).
    theta_max < pi corta a parte de baixo (calota); phi=(u0,u1) limita a volta (ex.: só a frente).
    """
    cx, cy, cz = center
    rx, ry, rz = radii
    verts, faces, uvs = [], [], []
    for r in range(rings + 1):
        th = r / rings * theta_max
        zz = math.cos(th)
        rr = math.sin(th)
        for s in range(seg + 1):
            u = phi[0] + (phi[1] - phi[0]) * s / seg
            a = (u - 0.5) * TAU
            verts.append((cx + math.sin(a) * rr * rx, cy - math.cos(a) * rr * ry, cz + zz * rz))
            uvs.append((s / seg, 1 - r / rings))
    row = seg + 1
    for r in range(rings):
        for s in range(seg):
            a = r * row + s
            faces.append((a, a + 1, a + row + 1, a + row))
    return verts, faces, uvs


def hair_cap(center, radii, front=0.3, back=0.62, side=0.45, seg=24, rings=10):
    """
    Calota de cabelo com linha do cabelo ALTA na testa (front, em frações de pi a partir do topo),
    na altura das têmporas nos lados (side) e mais baixa na nuca (back). Não cobre o rosto.
    """
    cx, cy, cz = center
    rx, ry, rz = radii
    verts, faces, uvs = [], [], []
    for r in range(rings + 1):
        for s in range(seg + 1):
            u = s / seg
            a = (u - 0.5) * TAU  # 0 = frente
            c = math.cos(a)
            lim = (side + (front - side) * c) if c >= 0 else (side + (back - side) * -c)
            th = r / rings * lim * math.pi
            zz, rr = math.cos(th), math.sin(th)
            verts.append((cx + math.sin(a) * rr * rx, cy - math.cos(a) * rr * ry, cz + zz * rz))
            uvs.append((u, 1 - r / rings))
    row = seg + 1
    for r in range(rings):
        for s in range(seg):
            a0 = r * row + s
            faces.append((a0, a0 + 1, a0 + row + 1, a0 + row))
    return verts, faces, uvs


def sphere_front_u(center, radii, seg=20, rings=14):
    """Igual ao ellipsoid, mas garantindo u=0.5 exatamente na frente (-Y)."""
    cx, cy, cz = center
    rx, ry, rz = radii
    verts, faces, uvs = [], [], []
    for r in range(rings + 1):
        th = r / rings * math.pi
        zz = math.cos(th)
        rr = math.sin(th)
        for s in range(seg + 1):
            u = s / seg
            a = (u - 0.5) * TAU  # u=0.5 → a=0 → frente
            verts.append((cx + math.sin(a) * rr * rx, cy - math.cos(a) * rr * ry, cz + zz * rz))
            uvs.append((u, 1 - r / rings))
    row = seg + 1
    for r in range(rings):
        for s in range(seg):
            a = r * row + s
            faces.append((a, a + 1, a + row + 1, a + row))
    return verts, faces, uvs


def box(center, size, bevel=0.0):
    cx, cy, cz = center
    sx, sy, sz = [v / 2 for v in size]
    verts = [(cx + x * sx, cy + y * sy, cz + z * sz) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]
    faces = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    uvs = [((x + 1) / 2, (z + 1) / 2) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]
    return verts, faces, uvs


def cone(base, tip, r, seg=8):
    base, tip = Vector(base), Vector(tip)
    axis = (tip - base).normalized()
    side = axis.orthogonal().normalized()
    up = axis.cross(side)
    verts, faces, uvs = [], [], []
    for s in range(seg):
        a = s / seg * TAU
        p = base + (side * math.cos(a) + up * math.sin(a)) * r
        verts.append(tuple(p))
        uvs.append((s / seg, 0))
    verts.append(tuple(tip))
    uvs.append((0.5, 1))
    verts.append(tuple(base))
    uvs.append((0.5, 0))
    t, c = seg, seg + 1
    for s in range(seg):
        faces.append((s, (s + 1) % seg, t))
        faces.append(((s + 1) % seg, s, c))
    return verts, faces, uvs


def merge(*parts):
    """Junta listas (verts, faces, uvs) numa só malha."""
    V, F, U = [], [], []
    for v, f, u in parts:
        o = len(V)
        V += v
        U += u
        F += [tuple(i + o for i in face) for face in f]
    return V, F, U


def mirror_x(part):
    v, f, u = part
    return [(-x, y, z) for x, y, z in v], [tuple(reversed(face)) for face in f], list(u)


def xform(part, fn):
    v, f, u = part
    return [fn(Vector(p)) for p in v], f, u


# ---------------------------------------------------------------- esqueleto
class Skeleton:
    """Posições dos pivôs no mesmo padrão do rig procedural do jogo."""

    def __init__(self, width=1.0, bulk=1.0, height=1.0):
        self.w, self.b, self.h = width, bulk, height
        H = height
        sx = 0.25 * width * bulk
        lx = 0.1 * width
        self.j = {
            'hips': Vector((0, 0, 0.95 * H)),
            'sp': Vector((0, 0, 1.05 * H)),
            'hd': Vector((0, 0, 1.68 * H)),
            'sL': Vector((sx * H, 0, 1.55 * H)),
            'eL': Vector((sx * H, 0, 1.25 * H)),
            'handL': Vector((sx * H, 0, 0.95 * H)),
            'sR': Vector((-sx * H, 0, 1.55 * H)),
            'eR': Vector((-sx * H, 0, 1.25 * H)),
            'handR': Vector((-sx * H, 0, 0.95 * H)),
            'lL': Vector((lx * H, 0, 0.93 * H)),
            'kL': Vector((lx * H, 0, 0.48 * H)),
            'footL': Vector((lx * H, 0, 0.03 * H)),
            'lR': Vector((-lx * H, 0, 0.93 * H)),
            'kR': Vector((-lx * H, 0, 0.48 * H)),
            'footR': Vector((-lx * H, 0, 0.03 * H)),
            'top': Vector((0, 0, 1.98 * H)),
        }

    def __getitem__(self, k):
        return self.j[k]


BONES = [
    # nome, cabeça, cauda, pai
    ('hips', 'hips', 'sp', None),
    ('sp', 'sp', 'hd', 'hips'),
    ('hd', 'hd', 'top', 'sp'),
    ('sL', 'sL', 'eL', 'sp'),
    ('eL', 'eL', 'handL', 'sL'),
    ('sR', 'sR', 'eR', 'sp'),
    ('eR', 'eR', 'handR', 'sR'),
    ('lL', 'lL', 'kL', 'hips'),
    ('kL', 'kL', 'footL', 'lL'),
    ('lR', 'lR', 'kR', 'hips'),
    ('kR', 'kR', 'footR', 'lR'),
]


BONE_NAMES = {b[0] for b in BONES}


def build_armature(sk, name="rig"):
    arm = bpy.data.armatures.new(name)
    obj = bpy.data.objects.new(name, arm)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    eb = {}
    for bname, h, t, parent in BONES:
        b = arm.edit_bones.new(bname)
        b.head = sk[h]
        b.tail = sk[t]
        b.roll = 0
        if parent:
            b.parent = eb[parent]
            b.use_connect = False
        eb[bname] = b
    bpy.ops.object.mode_set(mode='OBJECT')
    return obj


# ---------------------------------------------------------------- pesos
def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def auto_weights(sk, p, region=None):
    """
    Pesos determinísticos pela posição do vértice (sem 'bone heat').
    region força uma parte: 'head', 'armL', 'armR', 'legL', 'legR', 'torso', 'skirt', ou um nome de osso.
    """
    x, y, z = p
    H = sk.h
    if region in BONE_NAMES:
        return {region: 1.0}
    if region == 'head':
        return {'hd': 1.0}
    if region is None:
        # decide pela posição
        sx = abs(sk['sL'].x)
        if z > sk['hd'].z - 0.02 * H:
            region = 'head'
        elif abs(x) > sx - 0.02 and z < sk['sL'].z + 0.06 * H and z > sk['handL'].z - 0.2 * H:
            region = 'armL' if x > 0 else 'armR'
        elif z < sk['hips'].z - 0.06 * H:
            region = 'legL' if x > 0 else 'legR'
        else:
            region = 'torso'
    if region == 'head':
        return {'hd': 1.0}
    if region in ('armL', 'armR'):
        s = 'L' if region == 'armL' else 'R'
        ez = sk['e' + s].z
        sz = sk['s' + s].z
        w_fore = smoothstep(ez + 0.05 * H, ez - 0.05 * H, z)
        w_sh = 1 - w_fore
        # perto do ombro mistura com o tronco
        w_sp = smoothstep(sz - 0.06 * H, sz + 0.06 * H, z) * 0.6 * w_sh
        return {'e' + s: w_fore, 's' + s: w_sh - w_sp, 'sp': w_sp}
    if region in ('legL', 'legR'):
        s = 'L' if region == 'legL' else 'R'
        kz = sk['k' + s].z
        hz = sk['l' + s].z
        w_shin = smoothstep(kz + 0.05 * H, kz - 0.05 * H, z)
        w_th = 1 - w_shin
        w_hip = smoothstep(hz - 0.1 * H, hz + 0.04 * H, z) * 0.5 * w_th
        return {'k' + s: w_shin, 'l' + s: w_th - w_hip, 'hips': w_hip}
    if region == 'skirt':
        # casaco/poncho: segue o quadril e um pouco das pernas
        side = 'L' if x > 0 else 'R'
        drop = smoothstep(sk['hips'].z, sk['kL'].z, z)
        return {'hips': 1 - drop * 0.45, 'l' + side: drop * 0.45}
    # tronco
    w_sp = smoothstep(sk['hips'].z - 0.02 * H, sk['hips'].z + 0.22 * H, z)
    return {'sp': w_sp, 'hips': 1 - w_sp}


def skin(obj, arm, sk, region=None, weight_fn=None):
    """Cria grupos de vértices e o modificador Armature."""
    groups = {b[0]: obj.vertex_groups.new(name=b[0]) for b in BONES}
    mw = obj.matrix_world
    for v in obj.data.vertices:
        p = mw @ v.co
        w = weight_fn(p) if weight_fn else auto_weights(sk, p, region)
        tot = sum(max(0, a) for a in w.values()) or 1
        for b, a in w.items():
            if a > 1e-4:
                groups[b].add([v.index], a / tot, 'REPLACE')
    obj.parent = arm
    mod = obj.modifiers.new('Armature', 'ARMATURE')
    mod.object = arm
    return obj


# ---------------------------------------------------------------- partes do corpo
def limb_rings(a, b, r0, r1, n=6, mid=None, bulge=0.0):
    """Anéis ao longo de um membro reto entre pontos a e b."""
    rings = []
    for i in range(n + 1):
        t = i / n
        p = a.lerp(b, t)
        r = r0 + (r1 - r0) * t
        if bulge:
            r *= 1 + math.sin(t * math.pi) * bulge
        rings.append((p.x, p.y, p.z, r, r))
    return rings


def arm_part(sk, side, r_sh=0.075, r_el=0.058, r_wr=0.048, ext=0.0, end=None, start_z=None, seg=12):
    """Braço contínuo do ombro ao punho (ou até `end`, fração do antebraço)."""
    s = sk['s' + side]
    e = sk['e' + side]
    h = sk['hand' + side]
    top = s + Vector((0, 0, 0.04 * sk.h)) if start_z is None else Vector((s.x, s.y, start_z))
    wrist = e.lerp(h, end if end is not None else 0.92)
    rings = []
    rings += limb_rings(top, e, r_sh + ext, r_el + ext, n=5, bulge=0.06)[:-1]
    rings += limb_rings(e, wrist, r_el + ext, r_wr + ext, n=5, bulge=0.04)
    return tube(rings, segments=seg)


def leg_part(sk, side, r_th=0.085, r_kn=0.066, r_an=0.052, ext=0.0, end=0.94, top_z=None, seg=12):
    l = sk['l' + side]
    k = sk['k' + side]
    f = sk['foot' + side]
    top = Vector((l.x, l.y, (top_z if top_z is not None else l.z + 0.06 * sk.h)))
    ankle = k.lerp(f, end)
    rings = limb_rings(top, k, r_th + ext, r_kn + ext, n=5, bulge=0.05)[:-1]
    rings += limb_rings(k, ankle, r_kn + ext, r_an + ext, n=5, bulge=0.06)
    return tube(rings, segments=seg)


def torso_part(sk, profile, seg=18, depth=0.62):
    """
    profile: [(z_relativo_ao_quadril, meia_largura)], de baixo para cima.
    depth: profundidade relativa à largura (achatado em Y).
    """
    hz = sk['hips'].z
    rings = [(0, 0, hz + dz * sk.h, w * sk.h, w * depth * sk.h) for dz, w in profile]
    return tube(rings, segments=seg)


def hand_part(sk, side, r=0.055, fist=True):
    """
    Punho fechado: palma, fileira de 4 nós dos dedos embaixo, dedos dobrados do lado de dentro
    (virado para o corpo) e o polegar por cima, na frente. fist=False: mão aberta simples.
    """
    c = sk['hand' + side] + Vector((0, 0, -0.04 * sk.h))
    if not fist:
        return ellipsoid(c, (r * 0.75, r * 1.05, r * 1.35), seg=10, rings=8)
    inner = -1 if c.x > 0 else 1  # lado de dentro (palma) aponta para o centro do corpo
    parts = [ellipsoid((c.x, c.y, c.z + r * 0.15), (r * 0.78, r * 1.0, r * 1.05), seg=10, rings=8)]
    for i in range(4):
        y = c.y + (i - 1.5) * r * 0.5
        # nó do dedo (base do punho) e o dedo dobrado por dentro
        parts.append(ellipsoid((c.x - inner * r * 0.05, y, c.z - r * 0.85), (r * 0.42, r * 0.27, r * 0.3), seg=8, rings=6))
        parts.append(ellipsoid((c.x + inner * r * 0.45, y, c.z - r * 0.55), (r * 0.3, r * 0.25, r * 0.36), seg=8, rings=6))
    # polegar: na frente, cruzando por cima dos dedos
    parts.append(ellipsoid((c.x + inner * r * 0.35, c.y - r * 0.85, c.z - r * 0.35), (r * 0.42, r * 0.3, r * 0.28), seg=8, rings=6))
    return merge(*parts)


def foot_part(sk, side, length=0.24, width=0.1, height=0.075):
    f = sk['foot' + side]
    return box((f.x, f.y - 0.05, f.z + height / 2 - 0.03), (width, length, height))


def head_part(sk, radii=(0.15, 0.16, 0.175), seg=24, rings=18):
    c = sk['hd'] + Vector((0, 0, 0.16 * sk.h))
    v, f, u = sphere_front_u(c, tuple(r * sk.h for r in radii), seg, rings)
    # mandíbula mais estreita e queixo levemente à frente
    out = []
    for x, y, z in v:
        dz = (z - c.z) / (radii[2] * sk.h)
        if dz < 0:
            k = 1 + dz * 0.18
            x *= k
            y = y * (1 + dz * 0.05) - (0.012 * -dz if y < c.y else 0)
        out.append((x, y, z))
    return out, f, u


def head_center(sk):
    return sk['hd'] + Vector((0, 0, 0.16 * sk.h))


# ---------------------------------------------------------------- montagem
def open_tube(rings, gap=0.12, seg=20, cx=0.0, cy=0.0):
    """Tubo aberto na frente (casacos, jaquetas abertas). rings: [(z, rx, ry)]. gap = fração aberta de cada lado."""
    v, f, u = [], [], []
    for i, (z, rx, ry) in enumerate(rings):
        for s in range(seg + 1):
            t = gap + (1 - 2 * gap) * s / seg
            a = t * TAU
            v.append((cx + math.sin(a) * rx, cy - math.cos(a) * ry, z))
            u.append((s / seg, 1 - i / max(1, len(rings) - 1)))
    row = seg + 1
    for i in range(len(rings) - 1):
        for s in range(seg):
            a0 = i * row + s
            f.append((a0, a0 + 1, a0 + 1 + row, a0 + row))
    return v, f, u


def _alive(o):
    try:
        o.name
        return True
    except ReferenceError:
        return False


def closest_on_polyline(p, pts):
    best, bd = pts[0], 1e9
    for a, b in zip(pts, pts[1:]):
        ab = b - a
        t = max(0.0, min(1.0, (p - a).dot(ab) / max(1e-9, ab.length_squared)))
        q = a + ab * t
        d = (p - q).length
        if d < bd:
            best, bd = q, d
    return best


REGION_OF_BONE = {'sL': 'armL', 'eL': 'armL', 'sR': 'armR', 'eR': 'armR', 'lL': 'legL', 'kL': 'legL',
                  'lR': 'legR', 'kR': 'legR', 'sp': 'torso', 'hips': 'torso', 'hd': 'head'}


class Builder:
    """
    Ajuda a montar um personagem: cria, pesa e guarda as partes.
    `thick` deixa o corpo mais encorpado (estilo HQ): engrossa membros e tronco
    em volta dos ossos, aplicado igualmente a corpo e roupas (que continuam encaixadas).
    """

    def __init__(self, width=1.0, bulk=1.0, height=1.0, thick=(1.34, 1.3, 1.15, 1.2)):
        reset()
        self.sk = Skeleton(width, bulk, height)
        self.arm = build_armature(self.sk)
        self.parts = []
        self.k_arm, self.k_leg, self.k_tx, self.k_ty = thick

    def region_of(self, p, region):
        if region in REGION_OF_BONE:
            return REGION_OF_BONE[region]
        if region is not None:
            return region
        sk, H = self.sk, self.sk.h
        sx = abs(sk['sL'].x)
        if p.z > sk['hd'].z - 0.02 * H:
            return 'head'
        if abs(p.x) > sx - 0.02 and sk['handL'].z - 0.2 * H < p.z < sk['sL'].z + 0.06 * H:
            return 'armL' if p.x > 0 else 'armR'
        if p.z < sk['hips'].z - 0.06 * H:
            return 'legL' if p.x > 0 else 'legR'
        return 'torso'

    def shape(self, v, region):
        sk, H = self.sk, self.sk.h
        out = []
        for co in v:
            p = Vector(co)
            r = self.region_of(p, region)
            if r in ('armL', 'armR'):
                s = r[-1]
                axis = [sk['s' + s], sk['e' + s], sk['hand' + s] + Vector((0, 0, -0.14 * H))]
                q = closest_on_polyline(p, axis)
                k = self.k_arm
                # no alto do ombro mistura com o tronco para não "inchar" a cabeça do ombro
                if p.z > sk['s' + s].z:
                    k = 1 + (k - 1) * 0.5
                p = q + (p - q) * k
            elif r in ('legL', 'legR'):
                s = r[-1]
                if p.z < sk['foot' + s].z + 0.09 * H:
                    c = Vector((sk['foot' + s].x, sk['foot' + s].y, p.z))
                    d = p - c
                    p = c + Vector((d.x * 1.15, d.y * 1.05, 0))
                else:
                    axis = [sk['l' + s] + Vector((0, 0, 0.1 * H)), sk['k' + s], sk['foot' + s]]
                    q = closest_on_polyline(p, axis)
                    p = q + (p - q) * self.k_leg
            elif r in ('torso', 'skirt'):
                p = Vector((p.x * self.k_tx, p.y * self.k_ty, p.z))
            out.append(tuple(p))
        return out

    def add(self, name, part, mat, region=None, subdiv=1, weight_fn=None):
        v, f, u = part
        part = (self.shape(v, region), f, u)
        o = make_obj(name, *part, mat=mat, subdiv=subdiv)
        skin(o, self.arm, self.sk, region=region, weight_fn=weight_fn)
        self.parts.append(o)
        return o

    def group(self, prefix, name=None):
        """Junta todas as partes cujo nome começa com prefix (para props liga/desliga)."""
        alive = []
        for o in self.parts:
            try:
                alive.append(o.name)
            except ReferenceError:
                pass  # já foi juntado em outro objeto
        objs = [bpy.data.objects[n] for n in alive if n.startswith(prefix) and n in bpy.data.objects]
        if objs:
            res = join(objs, name or prefix)
            self.parts = [o for o in self.parts if _alive(o)]
            return res

    def body(self, M, torso_profile, arms=('L', 'R'), arm_r=(0.07, 0.056, 0.047), leg_r=(0.088, 0.07, 0.054),
             head_r=(0.138, 0.148, 0.162), sleeve=None, legs=True, feet='shoe', torso_mat=None, neck_r=0.058):
        """
        Corpo base: tronco, pescoço, cabeça (material de rosto), orelhas, braços, mãos, pernas, pés.
        M: dict de materiais com chaves skin, face, e opcionais torso, arm (manga), forearm, hand, legs, feet.
        """
        sk = self.sk
        H = sk.h
        self.add('torso', torso_part(sk, torso_profile), torso_mat or M.get('torso', M['skin']), region='torso')
        self.add('neck', tube([(0, 0, 1.58 * H, neck_r * H, neck_r * H), (0, 0, 1.72 * H, neck_r * 0.95 * H, neck_r * 0.95 * H)], 12), M['skin'], region='head', subdiv=0)
        self.add('head', head_part(sk, radii=head_r), M['face'], region='head')
        hc = head_center(sk)
        for s in (1, -1):
            self.add(f'ear{s}', ellipsoid((s * (head_r[0] - 0.002) * H, 0.0, hc.z - 0.01 * H), (0.02 * H, 0.034 * H, 0.044 * H), 8, 6), M['skin'], region='head', subdiv=0)
        for side in arms:
            arm_mat = M.get('arm' + side, M.get('arm', M['skin']))
            self.add('arm' + side, arm_part(sk, side, *arm_r), arm_mat, region='arm' + side)
            self.add('hand' + side, hand_part(sk, side, arm_r[2] * 1.15), M.get('hand' + side, M.get('hand', M['skin'])), region='e' + side)
        if legs:
            for side in ('L', 'R'):
                self.add('leg' + side, leg_part(sk, side, *leg_r), M.get('legs', M['skin']), region='leg' + side)
                if feet == 'shoe':
                    self.add('foot' + side, foot_part(sk, side, 0.24 * H, 0.1 * H, 0.075 * H), M.get('feet', M['skin']), region='k' + side)
                elif feet == 'bare':
                    f = sk['foot' + side]
                    self.add('foot' + side, ellipsoid((f.x, f.y - 0.045 * H, f.z + 0.015 * H), (0.048 * H, 0.11 * H, 0.04 * H), 10, 8), M.get('feet', M['skin']), region='k' + side)
        return hc

    def export(self, path):
        export_glb(path)


# ---------------------------------------------------------------- exportação
def export_glb(path):
    for o in bpy.context.selected_objects:
        o.select_set(False)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        export_apply=True,
        export_skins=True,
        export_animations=False,
        export_yup=True,
        export_materials='EXPORT',
        export_lights=False,
        export_cameras=False,
    )
    print('EXPORTADO', path)
