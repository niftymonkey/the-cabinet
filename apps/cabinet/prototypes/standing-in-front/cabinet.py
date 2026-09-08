"""PROTOTYPE, throwaway. Builds a home multicade cabinet in Blender and renders a yaw turntable.

Run: blender --background --python cabinet.py -- <out-dir> [--quick]
"""

import json
import math
import os
import sys
import time
import urllib.request
import zipfile

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
MATERIALS_DIR = os.path.join(HERE, "materials")
FONT_PATH = os.path.join(HERE, "Bungee-Regular.ttf")
CWEBP = "/home/linuxbrew/.linuxbrew/bin/cwebp"

FRAME_W, FRAME_H = 720, 1200
SPILL_W, SPILL_H = 1440, 900
# Wider sensor for the spill plate: same camera, same perspective, cabinet about 60 percent of the height.
SPILL_SENSOR_MM = 53.0
YAWS = list(range(-12, 13))
SAMPLES = 96

# Cabinet dimensions in metres: width across X, front toward -Y, floor at z = 0.
WIDTH = 0.59
HALF = WIDTH / 2
HEIGHT = 1.75
BACK_Y = 0.235

# Side profile in (y, z), clockwise seen from +X. Front is negative y.
P_BOTTOM_FRONT = (-0.24, 0.00)
P_BOTTOM_BACK = (BACK_Y, 0.00)
P_TOP_BACK = (BACK_Y, HEIGHT)
P_TOP_FRONT = (-0.20, HEIGHT)
P_MARQUEE_BOTTOM = (-0.245, 1.58)
P_BEZEL_TOP = (-0.175, 1.565)
P_BEZEL_BOTTOM = (-0.195, 0.955)
P_PANEL_FRONT = (-0.315, 0.93)
P_LIP_BOTTOM = (-0.315, 0.845)
P_BODY_FRONT_TOP = (-0.24, 0.80)
PROFILE = [
    P_BOTTOM_FRONT, P_BOTTOM_BACK, P_TOP_BACK, P_TOP_FRONT, P_MARQUEE_BOTTOM,
    P_BEZEL_TOP, P_BEZEL_BOTTOM, P_PANEL_FRONT, P_LIP_BOTTOM, P_BODY_FRONT_TOP,
]
SEAM_Z = 0.40

CAMERA_EYE_Z = 1.55
CAMERA_TARGET_Z = 1.0
FOCAL_MM = 40.0
SENSOR_MM = 36.0

cabinet_objects = []
room_objects = []
room_lights = []
markers = {}


# ---------------------------------------------------------------- colours

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb(hex_color, alpha=1.0):
    h = hex_color.lstrip("#")
    parts = tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return tuple(srgb_to_linear(c) for c in parts) + (alpha,)


def mix_hex(a, b, t):
    ha, hb = a.lstrip("#"), b.lstrip("#")
    out = ""
    for i in (0, 2, 4):
        v = int(ha[i:i + 2], 16) * (1 - t) + int(hb[i:i + 2], 16) * t
        out += f"{int(round(v)):02x}"
    return "#" + out


# ---------------------------------------------------------------- materials

def principled(name, hex_color, roughness=0.5, metallic=0.0, specular=0.5):
    mat = bpy.data.materials.new(name)
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = rgb(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Specular IOR Level"].default_value = specular
    return mat


def emissive(name, hex_color, strength):
    mat = bpy.data.materials.new(name)
    nodes = mat.node_tree.nodes
    em = nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = rgb(hex_color)
    em.inputs["Strength"].default_value = strength
    mat.node_tree.links.new(em.outputs[0], nodes["Material Output"].inputs["Surface"])
    return mat


def fetch_ambientcg_maps(asset_id, suffixes):
    """Downloads the 1K JPG zip through the keyless API and unpacks only the named maps."""
    zip_path = os.path.join(MATERIALS_DIR, f"{asset_id}_1K-JPG.zip")
    if not os.path.exists(zip_path):
        api = f"https://ambientcg.com/api/v3/assets?id={asset_id}&include=downloads"
        with urllib.request.urlopen(api, timeout=30) as r:
            downloads = json.load(r)["assets"][0]["downloads"]
        url = next(d["url"] for d in downloads if d["attributes"] == "1K-JPG")
        urllib.request.urlretrieve(url, zip_path)
    wanted = {s: f"{asset_id}_1K-JPG_{s}.jpg" for s in suffixes}
    with zipfile.ZipFile(zip_path) as z:
        for member in wanted.values():
            if not os.path.exists(os.path.join(MATERIALS_DIR, member)):
                z.extract(member, MATERIALS_DIR)
    return {s: os.path.join(MATERIALS_DIR, m) for s, m in wanted.items()}


def try_fetch(asset_id, suffixes):
    try:
        return fetch_ambientcg_maps(asset_id, suffixes)
    except Exception as e:
        print(f"MATERIAL FALLBACK {asset_id}: {e}")
        return None


def image_node(mat, path, non_color, uv_scale):
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(path)
    if non_color:
        tex.image.colorspace_settings.name = "Non-Color"
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (uv_scale, uv_scale, uv_scale)
    coords = nodes.new("ShaderNodeTexCoord")
    links.new(coords.outputs["UV"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], tex.inputs["Vector"])
    return tex


def textured(name, maps, tint_hex, uv_scale, metallic=0.0, roughness_scale=1.0):
    """Principled material driven by ambientCG maps; the base colour is our tint, not the map."""
    mat = principled(name, tint_hex, metallic=metallic)
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = nodes["Principled BSDF"]
    rough = image_node(mat, maps["Roughness"], True, uv_scale)
    scale = nodes.new("ShaderNodeMath")
    scale.operation = "MULTIPLY"
    scale.inputs[1].default_value = roughness_scale
    links.new(rough.outputs["Color"], scale.inputs[0])
    links.new(scale.outputs[0], bsdf.inputs["Roughness"])
    normal = image_node(mat, maps["NormalGL"], True, uv_scale)
    nmap = nodes.new("ShaderNodeNormalMap")
    nmap.inputs["Strength"].default_value = 0.6
    links.new(normal.outputs["Color"], nmap.inputs["Color"])
    links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    if "Color" in maps:
        color = image_node(mat, maps["Color"], False, uv_scale)
        tint = nodes.new("ShaderNodeMixRGB")
        tint.blend_type = "MULTIPLY"
        tint.inputs["Fac"].default_value = 1.0
        tint.inputs["Color2"].default_value = rgb(tint_hex)
        links.new(color.outputs["Color"], tint.inputs["Color1"])
        links.new(tint.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def build_materials():
    m = {}
    plastic = try_fetch("Plastic006", ["NormalGL", "Roughness"])
    m["body"] = textured("Body", plastic, "#0b0d10", 3.0) if plastic else principled("Body", "#0b0d10", 0.35)
    m["body_fallback"] = plastic is None
    metal = try_fetch("Metal009", ["Color", "NormalGL", "Roughness"])
    m["door"] = (textured("Door", metal, "#3a4046", 4.0, metallic=1.0, roughness_scale=1.1)
                 if metal else principled("Door", "#111417", 0.4, metallic=1.0))
    m["door_fallback"] = metal is None
    m["side"] = principled("Side", "#0e1114", 0.45)
    m["side_art"] = principled("SideArt", "#1d3a42", 0.5)
    m["side_stripe"] = principled("SideStripe", mix_hex("#1d3a42", "#4fa3a8", 0.5), 0.5)
    m["tmolding"] = principled("TMolding", "#262c33", 0.3)
    m["seam"] = principled("Seam", "#181d22", 0.6)
    m["marquee"] = emissive("Marquee", "#f6e094", 1.0)
    m["marquee_text"] = principled("MarqueeText", "#1a1a1a", 0.6)
    m["bezel"] = principled("Bezel", "#101317", 0.5)
    m["bezel_art"] = principled("BezelArt", "#172838", 0.5)
    m["screen"] = emissive("Screen", mix_hex("#0b1a1d", "#8fd0c9", 0.22), 1.0)
    m["panel"] = principled("Panel", "#1a1f24", 0.4)
    m["lip"] = principled("Lip", "#090b0e", 0.5)
    m["shaft"] = principled("Shaft", "#262c33", 0.3, metallic=0.8)
    m["red"] = principled("Red", "#d94f4f", 0.2)
    m["yellow"] = principled("Yellow", "#e6c65c", 0.2)
    m["teal"] = principled("Teal", "#4fa3a8", 0.2)
    m["door_btn"] = principled("DoorButton", "#2f353c", 0.3)
    m["slot"] = principled("Slot", "#070809", 0.8)
    m["port"] = principled("Port", "#262c33", 0.4)
    m["wall"] = room_material("Wall", "#08090c")
    m["baseboard"] = room_material("Baseboard", "#0d1014")
    m["floor"] = floor_material()
    return m


def room_material(name, hex_color):
    """Self-lit at exactly the base colour plus diffuse for the cabinet's light: unlit pixels match Pixi's plates."""
    mat = principled(name, hex_color, 0.8, specular=0.0)
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    em = nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = rgb(hex_color)
    em.inputs["Strength"].default_value = 1.0
    add = nodes.new("ShaderNodeAddShader")
    links.new(nodes["Principled BSDF"].outputs[0], add.inputs[0])
    links.new(em.outputs[0], add.inputs[1])
    links.new(add.outputs[0], nodes["Material Output"].inputs["Surface"])
    return mat


def floor_material():
    """Floor colour fades from #0c0f13 near the machine toward #050608 with distance from it."""
    mat = room_material("Floor", "#0c0f13")
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    geo = nodes.new("ShaderNodeNewGeometry")
    dist = nodes.new("ShaderNodeVectorMath")
    dist.operation = "DISTANCE"
    dist.inputs[1].default_value = (0, 0, 0)
    links.new(geo.outputs["Position"], dist.inputs[0])
    ramp = nodes.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.4
    ramp.inputs["From Max"].default_value = 2.6
    links.new(dist.outputs["Value"], ramp.inputs["Value"])
    mix = nodes.new("ShaderNodeMixRGB")
    mix.inputs["Color1"].default_value = rgb("#0c0f13")
    mix.inputs["Color2"].default_value = rgb("#050608")
    links.new(ramp.outputs["Result"], mix.inputs["Fac"])
    links.new(mix.outputs["Color"], nodes["Principled BSDF"].inputs["Base Color"])
    links.new(mix.outputs["Color"], nodes["Emission"].inputs["Color"])
    return mat


# ---------------------------------------------------------------- geometry helpers

def register(obj, group=cabinet_objects):
    group.append(obj)
    return obj


def set_material(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def cube_project_uv(obj, scale):
    """Box-projects UVs by each face's dominant normal axis so tangent normal maps work."""
    mesh = obj.data
    uv = mesh.uv_layers.new(name="UVMap")
    for poly in mesh.polygons:
        n = poly.normal
        axis = max(range(3), key=lambda i: abs(n[i]))
        for li in poly.loop_indices:
            co = mesh.vertices[mesh.loops[li].vertex_index].co
            if axis == 0:
                u, v = co.y, co.z
            elif axis == 1:
                u, v = co.x, co.z
            else:
                u, v = co.x, co.y
            uv.data[li].uv = (u * scale, v * scale)


def surface_frame(p_bottom, p_top):
    """A front-facing surface between two profile points: midpoint, tilt, length, along, normal."""
    (y0, z0), (y1, z1) = p_bottom, p_top
    along = Vector((0, y1 - y0, z1 - z0))
    length = along.length
    along.normalize()
    normal = Vector((0, -along.z, along.y))
    tilt = math.atan2(-normal.y, normal.z)
    mid = Vector((0, (y0 + y1) / 2, (z0 + z1) / 2))
    return {"mid": mid, "tilt": tilt, "length": length, "along": along, "normal": normal}


def on_surface(frame, x, v, lift):
    """World point on a surface frame: x across, v along the surface from its midpoint, lift out."""
    return frame["mid"] + Vector((x, 0, 0)) + frame["along"] * v + frame["normal"] * lift


def plate(name, frame, width, length, lift, mat, x=0.0, v=0.0, thickness=None):
    """A rectangle (or thin box) lying on a surface frame."""
    if thickness:
        bpy.ops.mesh.primitive_cube_add(size=1)
        obj = bpy.context.object
        obj.scale = (width, length, thickness)
        loc = on_surface(frame, x, v, lift + thickness / 2)
    else:
        bpy.ops.mesh.primitive_plane_add(size=1)
        obj = bpy.context.object
        obj.scale = (width, length, 1)
        loc = on_surface(frame, x, v, lift)
    obj.name = name
    obj.location = loc
    obj.rotation_euler = (frame["tilt"], 0, 0)
    set_material(obj, mat)
    return register(obj)


def cylinder(name, frame, radius, depth, x, v, lift, mat):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, vertices=48)
    obj = bpy.context.object
    obj.name = name
    obj.location = on_surface(frame, x, v, lift + depth / 2)
    obj.rotation_euler = (frame["tilt"], 0, 0)
    set_material(obj, mat)
    return register(obj)


def sphere(name, location, radius, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=location, segments=48, ring_count=24)
    obj = bpy.context.object
    obj.name = name
    bpy.ops.object.shade_smooth()
    set_material(obj, mat)
    return register(obj)


# ---------------------------------------------------------------- the cabinet

def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras):
        for datum in list(block):
            block.remove(datum)


def build_body(m):
    """The side profile extruded across the width, with sides on the caps and T-molding via bevel."""
    n = len(PROFILE)
    verts = [(-HALF, y, z) for y, z in PROFILE] + [(HALF, y, z) for y, z in PROFILE]
    faces = [list(range(n))[::-1], list(range(n, 2 * n))]
    faces += [[i, (i + 1) % n, (i + 1) % n + n, i + n] for i in range(n)]
    mesh = bpy.data.meshes.new("Body")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("Body", mesh)
    bpy.context.collection.objects.link(obj)
    cube_project_uv(obj, 1.0)
    mesh.materials.append(m["body"])
    mesh.materials.append(m["side"])
    mesh.materials.append(m["tmolding"])
    for poly in mesh.polygons:
        poly.material_index = 1 if abs(poly.normal.x) > 0.9 else 0
    bevel = obj.modifiers.new("TMolding", "BEVEL")
    bevel.width = 0.006
    bevel.segments = 3
    bevel.limit_method = "ANGLE"
    bevel.angle_limit = math.radians(30)
    bevel.material = 2
    register(obj)
    build_seam(m)
    return obj


def build_seam(m):
    """The riser seam: a thin dark band a third of the way up, wrapping front and sides."""
    depth = BACK_Y - P_BOTTOM_FRONT[0]
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.object
    obj.name = "RiserSeam"
    obj.scale = (WIDTH + 0.003, depth + 0.0015, 0.005)
    obj.location = (0, (BACK_Y + P_BOTTOM_FRONT[0]) / 2 - 0.0015, SEAM_Z)
    set_material(obj, m["seam"])
    register(obj)


def build_marquee(m):
    """Light-up marquee: an emissive plate on the leaning face, THE CABINET in Bungee on it."""
    frame = surface_frame(P_MARQUEE_BOTTOM, P_TOP_FRONT)
    face_w, face_l = WIDTH - 0.05, frame["length"] - 0.03
    plate("MarqueeFace", frame, face_w, face_l, 0.003, m["marquee"])
    markers["marquee"] = [on_surface(frame, sx * face_w / 2, sy * face_l / 2, 0.003)
                          for sx, sy in ((-1, 1), (1, 1), (1, -1), (-1, -1))]
    curve = bpy.data.curves.new("MarqueeText", type="FONT")
    curve.body = "THE CABINET"
    curve.font = bpy.data.fonts.load(FONT_PATH)
    curve.size = 0.062
    curve.extrude = 0.001
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    text = bpy.data.objects.new("MarqueeText", curve)
    bpy.context.collection.objects.link(text)
    text.location = on_surface(frame, 0, 0.004, 0.006)
    text.rotation_euler = (frame["tilt"], 0, 0)
    curve.materials.append(m["marquee_text"])
    register(text)
    light = area_light("MarqueeLight", "#f6e4a8", 80, (0.5, 0.06))
    light.location = on_surface(frame, 0, -face_l / 2 - 0.01, 0.16)
    light.rotation_euler = (math.radians(-2), 0, 0)
    light.data.spread = math.radians(50)
    leak = area_light("MarqueeLeak", "#f6e094", 45, (0.5, 0.04))
    leak.data.spread = math.radians(60)
    leak.location = on_surface(frame, 0, face_l / 2 + 0.01, 0.01)
    leak.rotation_euler = (math.radians(160), 0, 0)
    return frame


def build_monitor(m):
    """Flat monitor recessed behind a proud printed bezel with teal side art."""
    frame = surface_frame(P_BEZEL_BOTTOM, P_BEZEL_TOP)
    bezel_l = frame["length"]
    screen_w, screen_l = 0.43, 0.34
    screen_v = 0.02
    thick = 0.015
    side_w = (WIDTH - screen_w) / 2
    plate("BezelLeft", frame, side_w, bezel_l, 0.0, m["bezel_art"], x=-(screen_w + side_w) / 2, thickness=thick)
    plate("BezelRight", frame, side_w, bezel_l, 0.0, m["bezel_art"], x=(screen_w + side_w) / 2, thickness=thick)
    top_l = bezel_l / 2 - (screen_v + screen_l / 2)
    plate("BezelTop", frame, screen_w, top_l, 0.0, m["bezel"], v=bezel_l / 2 - top_l / 2, thickness=thick)
    bot_l = bezel_l / 2 + (screen_v - screen_l / 2)
    plate("BezelBottom", frame, screen_w, bot_l, 0.0, m["bezel"], v=-bezel_l / 2 + bot_l / 2, thickness=thick)
    plate("Screen", frame, screen_w + 0.01, screen_l + 0.01, 0.002, m["screen"], v=screen_v)
    markers["monitor"] = [on_surface(frame, sx * screen_w / 2, screen_v + sy * screen_l / 2, thick)
                          for sx, sy in ((-1, 1), (1, 1), (1, -1), (-1, -1))]
    light = area_light("ScreenLight", "#8fd0c9", 10, (screen_w, screen_l))
    light.location = on_surface(frame, 0, screen_v, thick + 0.01)
    light.rotation_euler = (frame["tilt"] + math.pi, 0, 0)
    for i in range(3):
        for j in range(2):
            cylinder(f"SpeakerHole{i}{j}", frame, 0.004, 0.001, 0.22 + i * 0.018, bezel_l / 2 - 0.03 - j * 0.018, thick, m["tmolding"])


def build_control_panel(m):
    """Slanted panel: two red-ball sticks and six buttons each in two rows of three."""
    frame = surface_frame(P_PANEL_FRONT, P_BEZEL_BOTTOM)
    plate("PanelTop", frame, WIDTH - 0.004, frame["length"] - 0.004, 0.002, m["panel"])
    lip = surface_frame(P_LIP_BOTTOM, P_PANEL_FRONT)
    plate("Lip", lip, WIDTH - 0.004, lip["length"] - 0.004, 0.001, m["lip"])
    plate("UsbPort", lip, 0.03, 0.012, 0.002, m["port"], x=-0.22, thickness=0.002)
    colours = (m["red"], m["yellow"], m["teal"])
    for player, stick_x in enumerate((-0.18, 0.056)):
        cylinder(f"Shaft{player}", frame, 0.005, 0.055, stick_x, 0.0, 0.002, m["shaft"])
        top = on_surface(frame, stick_x, 0.0, 0.002 + 0.055 + 0.012)
        sphere(f"Ball{player}", top, 0.017, m["red"])
        cylinder(f"StickBase{player}", frame, 0.018, 0.004, stick_x, 0.0, 0.002, m["tmolding"])
        for row, v in enumerate((0.018, -0.022)):
            for col in range(3):
                x = stick_x + 0.061 + col * 0.037 + (0.004 if row == 0 else 0.0)
                cylinder(f"Button{player}{row}{col}", frame, 0.014, 0.009, x, v, 0.002, colours[col])
                cylinder(f"ButtonRim{player}{row}{col}", frame, 0.0165, 0.003, x, v, 0.002, m["tmolding"])
    return frame


def build_coin_door(m):
    """Faux coin door: brushed metal plate, a dark slot, three menu buttons."""
    frame = surface_frame(P_BOTTOM_FRONT, P_BODY_FRONT_TOP)
    door_z = 0.545
    v = door_z - frame["mid"].z
    plate("CoinDoor", frame, 0.22, 0.19, 0.0, m["door"], v=v, thickness=0.006)
    plate("CoinSlot", frame, 0.14, 0.03, 0.006, m["slot"], v=v + 0.06, thickness=0.002)
    for i, x in enumerate((-0.05, 0.0, 0.05)):
        cylinder(f"DoorButton{i}", frame, 0.012, 0.006, x, v - 0.03, 0.006, m["door_btn"])
        cylinder(f"DoorButtonRim{i}", frame, 0.0145, 0.002, x, v - 0.03, 0.006, m["tmolding"])
    markers["floor_contact"] = Vector((0, P_BOTTOM_FRONT[0], 0))


def build_side_art(m):
    """Printed side art on both sides: a dark teal panel with one half-strength teal stripe."""
    for sign in (-1, 1):
        for name, z0, z1, mat, lift in (("SideArt", 0.74, 1.55, m["side_art"], 0.0012),
                                        ("SideStripe", 1.03, 1.077, m["side_stripe"], 0.0018)):
            bpy.ops.mesh.primitive_plane_add(size=1)
            obj = bpy.context.object
            obj.name = f"{name}{'R' if sign > 0 else 'L'}"
            obj.scale = (z1 - z0, 0.36, 1)
            obj.rotation_euler = (0, sign * math.radians(90), 0)
            obj.location = (sign * (HALF + lift), 0.03, (z0 + z1) / 2)
            set_material(obj, mat)
            register(obj)


def build_room(m):
    """Wall, floor and baseboard for the spill plate; hidden for the cabinet frames."""
    wall_y = BACK_Y + 0.06
    bpy.ops.mesh.primitive_plane_add(size=1)
    wall = bpy.context.object
    wall.name = "Wall"
    wall.scale = (8, 4, 1)
    wall.rotation_euler = (math.radians(90), 0, 0)
    wall.location = (0, wall_y, 2)
    set_material(wall, m["wall"])
    register(wall, room_objects)
    bpy.ops.mesh.primitive_plane_add(size=1)
    floor = bpy.context.object
    floor.name = "Floor"
    floor.scale = (8, 8, 1)
    floor.location = (0, wall_y - 4, 0)
    set_material(floor, m["floor"])
    register(floor, room_objects)
    bpy.ops.mesh.primitive_cube_add(size=1)
    base = bpy.context.object
    base.name = "Baseboard"
    base.scale = (8, 0.012, 0.10)
    base.location = (0, wall_y - 0.006, 0.05)
    set_material(base, m["baseboard"])
    register(base, room_objects)


# ---------------------------------------------------------------- lights, world, camera

def area_light(name, hex_color, watts, size):
    data = bpy.data.lights.new(name, "AREA")
    data.color = rgb(hex_color)[:3]
    data.energy = watts
    data.shape = "RECTANGLE"
    data.size, data.size_y = size
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    return obj


def build_fill_light():
    """A very faint cool fill so the unlit side reads as near-black, not a hole."""
    for name, x, watts in (("CoolFillRight", 2.6, 260), ("CoolFillLeft", -2.6, 140)):
        fill = area_light(name, "#9db8d6", watts, (3.0, 3.0))
        fill.location = (x, -2.4, 2.4)
        aim(fill, Vector((0, 0, 1.0)))
        room_lights.append(fill)
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = rgb("#0e1420")
    bg.inputs["Strength"].default_value = 1.5


def aim(obj, target):
    direction = target - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def cabinet_corners():
    ys = [p[0] for p in PROFILE]
    return [Vector((sx * HALF, y, z)) for sx in (-1, 1) for y in (min(ys), max(ys)) for z in (0, HEIGHT)]


def place_camera(cam, yaw_deg, distance, target_z):
    yaw = math.radians(yaw_deg)
    cam.location = (distance * math.sin(yaw), -distance * math.cos(yaw), CAMERA_EYE_Z)
    aim(cam, Vector((0, 0, target_z)))


def vertical_span(scene, cam, distance, target_z):
    lo, hi = 1.0, 0.0
    for yaw in (-12, 0, 12):
        place_camera(cam, yaw, distance, target_z)
        bpy.context.view_layer.update()
        for c in cabinet_corners():
            v = world_to_camera_view(scene, cam, c)
            lo, hi = min(lo, v.y), max(hi, v.y)
    return lo, hi


def fit_camera(scene, cam):
    """Finds the orbit distance and target height that leave about 4 percent air above and below."""
    target_z = CAMERA_TARGET_Z
    distance = 2.5
    for _ in range(6):
        low, high = 1.5, 6.0
        for _ in range(30):
            distance = (low + high) / 2
            lo, hi = vertical_span(scene, cam, distance, target_z)
            if hi - lo > 0.92:
                low = distance
            else:
                high = distance
        lo, hi = vertical_span(scene, cam, distance, target_z)
        target_z += ((lo + hi) / 2 - 0.5) * 0.9
    return distance, target_z


def build_camera(scene):
    data = bpy.data.cameras.new("Camera")
    data.lens = FOCAL_MM
    data.sensor_fit = "VERTICAL"
    data.sensor_height = SENSOR_MM
    cam = bpy.data.objects.new("Camera", data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y = FRAME_W, FRAME_H
    distance, target_z = fit_camera(scene, cam)
    return cam, distance, target_z


def configure_render(scene, quick):
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 16 if quick else SAMPLES
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = "OPENIMAGEDENOISE"
    scene.cycles.max_bounces = 6
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.render.resolution_percentage = 100


# ---------------------------------------------------------------- rendering

def project(scene, cam, point, width, height):
    v = world_to_camera_view(scene, cam, point)
    return [round(v.x * width, 2), round((1 - v.y) * height, 2)]


def frame_record(scene, cam, yaw, width, height):
    return {
        "yaw": yaw,
        "monitor": [project(scene, cam, p, width, height) for p in markers["monitor"]],
        "marquee": [project(scene, cam, p, width, height) for p in markers["marquee"]],
        "floor_contact": project(scene, cam, markers["floor_contact"], width, height),
    }


def render_turntable(scene, cam, distance, target_z, out_dir, yaws):
    for obj in room_objects:
        obj.hide_render = True
    records = []
    for yaw in yaws:
        place_camera(cam, yaw, distance, target_z)
        bpy.context.view_layer.update()
        index = yaw + 12
        scene.render.filepath = os.path.join(out_dir, f"cabinet-{index:02d}.png")
        t = time.time()
        bpy.ops.render.render(write_still=True)
        seconds = time.time() - t
        print(f"FRAME {index:02d} yaw {yaw:+d} {seconds:.1f}s", flush=True)
        rec = frame_record(scene, cam, yaw, FRAME_W, FRAME_H)
        rec["seconds"] = round(seconds, 1)
        records.append(rec)
    return records


def render_spill(scene, cam, distance, target_z, out_dir):
    """Room plate at yaw 0: cabinet invisible to the camera but still lighting the room.

    Fills and world off: the room materials are self-lit at their base colours, the cabinet adds the rest."""
    for obj in room_objects:
        obj.hide_render = False
    for obj in cabinet_objects:
        obj.visible_camera = False
    for light in room_lights:
        light.hide_render = True
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.0
    scene.render.resolution_x, scene.render.resolution_y = SPILL_W, SPILL_H
    cam.data.sensor_height = SPILL_SENSOR_MM
    place_camera(cam, 0, distance, target_z)
    bpy.context.view_layer.update()
    scene.render.filepath = os.path.join(out_dir, "spill.png")
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"SPILL {time.time() - t:.1f}s", flush=True)
    rec = frame_record(scene, cam, 0, SPILL_W, SPILL_H)
    rec.update({"width": SPILL_W, "height": SPILL_H, "sensor_height_mm": SPILL_SENSOR_MM,
                "cabinet_sprite_scale": round(SENSOR_MM / SPILL_SENSOR_MM, 5),
                "cabinet_sprite_center": [SPILL_W / 2, SPILL_H / 2],
                "note": "same camera position and lens as the frames; the cabinet frame scaled by cabinet_sprite_scale and centred on cabinet_sprite_center lands on this plate"})
    cam.data.sensor_height = SENSOR_MM
    scene.render.resolution_x, scene.render.resolution_y = FRAME_W, FRAME_H
    for obj in cabinet_objects:
        obj.visible_camera = True
    return rec


def export_frames_json(out_dir, records, spill, distance, target_z, m):
    ys = [p[0] for p in PROFILE]
    doc = {
        "frame": {"width": FRAME_W, "height": FRAME_H, "count": len(records), "center_index": 12},
        "corner_order": ["top-left", "top-right", "bottom-right", "bottom-left"],
        "camera": {
            "distance_m": round(distance, 4),
            "eye_height_m": CAMERA_EYE_Z,
            "target_height_m": round(target_z, 4),
            "focal_length_mm": FOCAL_MM,
            "sensor_height_mm": SENSOR_MM,
            "sensor_fit": "VERTICAL",
            "orbit_axis": "cabinet vertical axis through footprint centre (x=0, y=0)",
        },
        "cabinet_m": {"width": WIDTH, "height": HEIGHT, "depth": round(max(ys) - min(ys), 3),
                      "front_y": min(ys), "back_y": max(ys), "riser_seam_z": SEAM_Z},
        "materials": {"body": "fallback Principled" if m["body_fallback"] else "ambientCG Plastic006 1K",
                      "door": "fallback Principled" if m["door_fallback"] else "ambientCG Metal009 1K"},
        "frames": records,
        "spill": spill,
    }
    with open(os.path.join(out_dir, "frames.json"), "w") as f:
        json.dump(doc, f, indent=1)


def encode_webp(out_dir, names):
    import subprocess
    for name in names:
        src = os.path.join(out_dir, f"{name}.png")
        dst = os.path.join(out_dir, f"{name}.webp")
        subprocess.run([CWEBP, "-quiet", "-q", "88", "-alpha_q", "100", "-exact", src, "-o", dst], check=True)


# ---------------------------------------------------------------- entry

def main():
    args = sys.argv[sys.argv.index("--") + 1:]
    out_dir = os.path.abspath(args[0])
    quick = "--quick" in args
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(MATERIALS_DIR, exist_ok=True)
    scene = bpy.context.scene
    started = time.time()
    clear_scene()
    m = build_materials()
    build_body(m)
    build_marquee(m)
    build_monitor(m)
    build_control_panel(m)
    build_coin_door(m)
    build_side_art(m)
    build_room(m)
    build_fill_light()
    configure_render(scene, quick)
    cam, distance, target_z = build_camera(scene)
    print(f"CAMERA distance {distance:.3f} target_z {target_z:.3f} eye_z {CAMERA_EYE_Z} focal {FOCAL_MM}", flush=True)
    yaws = [-12, 0, 12] if quick else YAWS
    records = render_turntable(scene, cam, distance, target_z, out_dir, yaws)
    spill = render_spill(scene, cam, distance, target_z, out_dir)
    export_frames_json(out_dir, records, spill, distance, target_z, m)
    encode_webp(out_dir, [f"cabinet-{r['yaw'] + 12:02d}" for r in records] + ["spill"])
    print(f"TOTAL {time.time() - started:.1f}s", flush=True)


main()
