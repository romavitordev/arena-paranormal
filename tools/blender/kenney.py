"""
Peças PRONTAS dos kits gratuitos do Kenney (CC0, kenney.nl) para montar os cenários no Blender.
Os kits ficam em assets_src/kenney/ (fora do git; ver assets_src/README.md para baixar de novo).

Uso nos scripts arena_*.py:
    from kenney import put, house
    put('town', 'tree-crooked', (x, 0, z), rot_y=0.3, s=3.0)        # coordenadas do JOGO (x, y, z)
    house('casa1', (x, 0, z), rot_y, cells=(3, 2), floors=2)          # casa medieval montada com o Fantasy Town Kit

Convenções:
  - Cada peça vira um objeto 'KEN_<nome>' (o finalize NÃO refaz o UV delas: usam o atlas colormap do kit).
  - prefix='OCC_' faz a peça ficar transparente quando tampa a luta.
  - A escala padrão do Fantasy Town Kit é 3 (parede de 1 unidade -> 3 m).
"""
import os
import math
import bpy
from mathutils import Vector
from arena_lib import B, join_objs

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..', 'assets_src', 'kenney'))
KITS = {
    'town': ('kenney_fantasy-town-kit_2.0', 'Models/GLB format'),
    'nature': ('kenney_nature-kit', 'Models/GLTF format'),
    'graveyard': ('kenney_graveyard-kit_5.0', 'Models/GLB format'),
    'castle': ('kenney_castle-kit', 'Models/GLB format'),
    'furniture': ('kenney_furniture-kit', 'Models/GLTF format'),
    'suburban': ('kenney_city-kit-suburban_20', 'Models/GLB format'),
    'roads': ('kenney_city-kit-roads', 'Models/GLB format'),
    'commercial': ('kenney_city-kit-commercial_2.1', 'Models/GLB format'),
    'cars': ('kenney_car-kit', 'Models/GLB format'),
}
_lib = {}
_count = [0]


def _path(kit, name):
    folder, sub = KITS[kit]
    d = os.path.join(ROOT, folder, sub)
    for ext in ('.glb', '.gltf'):
        p = os.path.join(d, name + ext)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f'peça Kenney não encontrada: {kit}/{name} (baixe os kits em assets_src/kenney)')


def _load(kit, name):
    """Importa a peça uma vez e guarda como modelo (LIB_), juntando as malhas num só objeto."""
    key = (kit, name)
    if key in _lib:
        return _lib[key]
    before = set(o.name for o in bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=_path(kit, name))
    new_names = [o.name for o in bpy.context.scene.objects if o.name not in before]
    meshes = [bpy.data.objects[n] for n in new_names if bpy.data.objects[n].type == 'MESH']
    for s in bpy.context.selected_objects:
        s.select_set(False)
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    # aplica a hierarquia/transformações do glTF e junta tudo num objeto
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    obj.name = f'LIB_{kit}_{name}'
    keep = obj.name
    for n in new_names:
        o = bpy.data.objects.get(n)
        if o is not None and o.name != keep:
            bpy.data.objects.remove(o, do_unlink=True)
    obj = bpy.data.objects[keep]
    for i, m in enumerate(obj.data.materials):
        if m is None:
            continue
        base = m.name.split('.')[0]
        want = f'{base}_{kit}' if base == 'colormap' else base
        have = bpy.data.materials.get(want)
        if have is not None and have is not m:
            obj.data.materials[i] = have  # reaproveita (sem cópias 'nome.001')
        else:
            m.name = want
    obj.hide_render = True
    obj.location = (0, 0, -500)  # fora de vista; removido no finalize
    _lib[key] = obj
    return obj


def put(kit, name, pos, rot_y=0.0, s=1.0, prefix='', tint=None, sx=None, center=False, up=None):
    """Coloca uma cópia da peça na posição do JOGO (x, y, z), girada em torno do eixo vertical."""
    src = _load(kit, name)
    o = src.copy()
    o.data = src.data.copy()
    if tint:
        # recolore (ex.: folhas de cores estranhas): copia os materiais e troca a cor base
        for i, m in enumerate(o.data.materials):
            if m is None:
                continue
            base = m.name.split('.')[0]
            col = tint.get(base) or tint.get('*')
            if not col:
                continue
            tname = f'{base}_t{int(col[0] * 255):02x}{int(col[1] * 255):02x}{int(col[2] * 255):02x}'  # sem pontos no nome
            m2 = bpy.data.materials.get(tname)
            if m2 is None:
                m2 = m.copy()
                m2.name = tname
                bsdf = m2.node_tree.nodes.get('Principled BSDF') if m2.use_nodes else None
                if bsdf:
                    bsdf.inputs['Base Color'].default_value = (*col, 1)
            o.data.materials[i] = m2
    _count[0] += 1
    o.name = f'{prefix}KEN_{name}_{_count[0]}'
    bpy.context.scene.collection.objects.link(o)
    o.hide_render = False
    o.location = B(*pos)
    if center:
        # peças com a origem num canto (ex.: móveis): desloca para o centro da base ficar em pos
        xs = [v[0] for v in src.bound_box]
        ys = [v[1] for v in src.bound_box]
        cx, cy = (min(xs) + max(xs)) / 2 * (s if sx is None else sx), (min(ys) + max(ys)) / 2 * s
        ca, sa = math.cos(rot_y), math.sin(rot_y)
        o.location.x -= cx * ca - cy * sa
        o.location.y -= cx * sa + cy * ca
    o.rotation_mode = 'XYZ'  # o importador glTF deixa em quaternion (aí o giro em Euler seria ignorado)
    o.rotation_euler = (0, 0, rot_y)
    o.scale = (s if sx is None else sx, s, s if up is None else up)  # up: escala só da altura (ex.: rua fininha)
    return o


def remove_library():
    for o in list(_lib.values()):
        if o.name in bpy.data.objects:
            bpy.data.objects.remove(o, do_unlink=True)
    _lib.clear()


# ---------------------------------------------------------------- casa medieval montada com o Fantasy Town Kit
def house(name, pos, rot_y=0.0, cells=(3, 2), floors=1, s=3.0, wood=True, roof_color='red', prefix='', door_at=1):
    """Casa de enxaimel: `cells` = (largura ao longo da fachada, profundidade) em células de 1 unidade do kit.
    A fachada (com a porta) fica em +z local antes do giro. Telhado de duas águas com a cumeeira ao longo da largura."""
    W, D = cells
    x0, y0, z0 = pos
    ca, sa = math.cos(rot_y), math.sin(rot_y)

    def at(lx, ly, lz):
        # local (x ao longo da fachada, z para a frente) -> mundo do jogo, girado por rot_y em torno de y
        wx = lx * ca + lz * sa
        wz = -lx * sa + lz * ca
        return (x0 + wx * s, y0 + ly * s, z0 + wz * s)

    w_plain = 'wall-wood' if wood else 'wall'
    w_win = 'wall-wood-window-shutters' if wood else 'wall-window-shutters'
    w_door = 'wall-wood-door' if wood else 'wall-door'
    w_corner = 'wall-wood-corner' if wood else 'wall-corner'
    out = []
    cx = (W - 1) / 2
    cz = (D - 1) / 2
    for fl in range(floors):
        stone = (not wood) or (floors > 1 and fl == 0)
        w_plain = 'wall' if stone else 'wall-wood'
        w_win = 'wall-window-shutters' if stone else 'wall-wood-window-shutters'
        w_door = 'wall-door' if stone else 'wall-wood-door'
        for i in range(W):
            for j in range(D):
                lx, lz = i - cx, j - cz
                # paredes do perímetro: cada peça fica na face +X da célula; o giro escolhe a face
                faces = []
                if j == D - 1:
                    faces.append(-math.pi / 2)  # frente (+z)
                if j == 0:
                    faces.append(math.pi / 2)  # fundo (-z)
                if i == W - 1:
                    faces.append(0.0)  # lado +x
                if i == 0:
                    faces.append(math.pi)  # lado -x
                for f in faces:
                    front = abs(f + math.pi / 2) < 1e-3
                    piece = w_plain
                    if front and fl == 0 and i == min(door_at, W - 1):
                        piece = w_door
                    elif front or (fl > 0 and (i + j) % 2 == 0):
                        piece = w_win
                    out.append(put('town', piece, at(lx, fl, lz), rot_y + f, s, prefix))
    # telhado vermelho de duas águas com a cumeeira ao longo da fachada:
    #  profundidade 1 -> roof-high-gable em cada célula; profundidade 2 -> rampas roof-high (frente e fundo) se encontram
    top = floors
    for i in range(W):
        lx = i - cx
        if D == 1:
            out.append(put('town', 'roof-high-gable', at(lx, top, 0), rot_y, s, prefix))
        else:
            for j in range(D):
                lz = j - cz
                # a rampa sobe para -x local; gira para subir em direção ao meio da casa
                out.append(put('town', 'roof-high', at(lx, top, lz), rot_y + (math.pi / 2 if lz > 0 else -math.pi / 2), s, prefix))
    # a casa inteira vira UM objeto (menos chamadas de desenho e um só oclusor)
    return join_pieces(out, f'{prefix}KEN_house_{name}')


def join_pieces(objs, name):
    """Junta várias peças num objeto só (mantém KEN_ no nome: o finalize não refaz o UV)."""
    if len(objs) == 1:
        objs[0].name = name
        return objs[0]
    return join_objs(objs, name)


def tower(name, pos, floors=4, s=3.0, prefix='OCC_', window='wall-window-small', window_face=-math.pi / 2, door_face=None):
    """Torre quadrada de pedra (Fantasy Town Kit) com telhado em ponta, num objeto só."""
    x, y, z = pos
    out = []
    for fl in range(floors):
        for f in (0.0, math.pi / 2, math.pi, -math.pi / 2):
            piece = 'wall'
            if fl % 2 == 1 and abs(f - window_face) < 1e-3:
                piece = window
            if fl == 0 and door_face is not None and abs(f - door_face) < 1e-3:
                piece = 'wall-door'
            out.append(put('town', piece, (x, y + fl * s, z), f, s, prefix))
    out.append(put('town', 'roof-high-point', (x, y + floors * s, z), 0.0, s, prefix))
    return join_pieces(out, f'{prefix}KEN_tower_{name}')
