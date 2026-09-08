"""The smallest complete headless Blender scene: a box on a floor under one glowing panel.

Run: blender --background --python example.py -- <out.png>
"""

import sys
import time

import bpy


def clear_scene(scene):
    for obj in list(scene.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def plain_material(name, rgb):
    mat = bpy.data.materials.new(name)
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*rgb, 1)
    return mat


def glowing_material(name, rgb, strength):
    mat = bpy.data.materials.new(name)
    nodes = mat.node_tree.nodes
    emission = nodes.new("ShaderNodeEmission")
    emission.inputs["Color"].default_value = (*rgb, 1)
    emission.inputs["Strength"].default_value = strength
    mat.node_tree.links.new(emission.outputs[0], nodes["Material Output"].inputs["Surface"])
    return mat


def build_objects():
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.5))
    bpy.context.object.data.materials.append(plain_material("Body", (0.02, 0.025, 0.03)))
    bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, 0))
    bpy.context.object.data.materials.append(plain_material("Floor", (0.03, 0.04, 0.05)))
    bpy.ops.mesh.primitive_plane_add(size=0.6, location=(0, 0, 1.2))
    bpy.context.object.data.materials.append(glowing_material("Panel", (0.965, 0.878, 0.58), 8))


def build_camera(scene):
    bpy.ops.object.camera_add(location=(2.2, -3.0, 1.4), rotation=(1.25, 0, 0.62))
    scene.camera = bpy.context.object


def configure_render(scene, out_path):
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 256
    scene.render.resolution_y = 384
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0, 0, 0, 1)
    scene.render.filepath = out_path


def main():
    out_path = sys.argv[sys.argv.index("--") + 1]
    scene = bpy.context.scene
    clear_scene(scene)
    build_objects()
    build_camera(scene)
    configure_render(scene, out_path)
    started = time.time()
    bpy.ops.render.render(write_still=True)
    print("EXAMPLE_RENDER_SECONDS", round(time.time() - started, 1))


main()
