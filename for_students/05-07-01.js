// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";

/**
 * Object1: Face Coloring
 * Requirement: Distinct colors per triangle, shared edges. 
 * Implementation: Non-indexed (split vertices) so each face has its own color attribute.
 */
class Object1 extends GrObject {
  constructor() {
    const geometry = new T.BufferGeometry();

    // 3 triangles, vertices split (9 vertices total) to allow per-face coloring
    const positions = new Float32Array([
      // Triangle 1
      0.0, 1.5, 0.0,   -1.0, 0.0, 0.5,   0.0, 0.0, 1.0,
      // Triangle 2
      0.0, 1.5, 0.0,    0.0, 0.0, 1.0,   1.0, 0.0, 0.5,
      // Triangle 3
      0.0, 1.5, 0.0,    1.0, 0.0, 0.5,   0.0, 0.0, -1.0
    ]);

    const colors = new Float32Array([
      // Tri 1: Red
      1, 0, 0,  1, 0, 0,  1, 0, 0,
      // Tri 2: Green
      0, 1, 0,  0, 1, 0,  0, 1, 0,
      // Tri 3: Blue
      0, 0, 1,  0, 0, 1,  0, 0, 1
    ]);

    geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new T.BufferAttribute(colors, 3));
    geometry.computeVertexNormals(); // These will be "flat" because vertices aren't shared

    const material = new T.MeshStandardMaterial({
      vertexColors: true,
      side: T.DoubleSide,
      roughness: 0.5
    });

    const mesh = new T.Mesh(geometry, material);
    super("FaceColoredObject", mesh);
  }
}

/**
 * Object2: Vertex Coloring & Smooth Normals
 * Requirement: Colors vary smoothly; Lighting is smooth across boundaries.
 * Implementation: Indexed geometry so vertices are shared.
 */
class Object2 extends GrObject {
  constructor() {
    const geometry = new T.BufferGeometry();

    // Shared vertices (5 vertices for 3 triangles)
    const positions = new Float32Array([
      0.0, 1.5, 0.0,  // 0: Top
      -1.0, 0.0, 0.5, // 1: Left
      0.0, 0.0, 1.0,  // 2: Front-Center
      1.0, 0.0, 0.5,  // 3: Right
      0.0, 0.0, -1.0  // 4: Back
    ]);

    // Distinct colors at each vertex to show smooth interpolation
    const colors = new Float32Array([
      1, 1, 1, // 0: White
      1, 0, 0, // 1: Red
      0, 1, 0, // 2: Green
      0, 0, 1, // 3: Blue
      1, 0, 1  // 4: Magenta
    ]);

    geometry.setAttribute("position", new T.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new T.BufferAttribute(colors, 3));
    
    // Indexing allows smooth normals (lighting) and smooth color blending
    geometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4]);
    
    geometry.computeVertexNormals(); // Shared vertices = Averaged normals = Smooth light

    const material = new T.MeshStandardMaterial({
      vertexColors: true,
      side: T.DoubleSide,
      roughness: 0.2, // Lower roughness makes smooth normals easier to see
      metalness: 0.5
    });

    const mesh = new T.Mesh(geometry, material);
    super("SmoothColoredObject", mesh);
  }
}

// Helpers for placement
function shift(grobj, x) {
  grobj.objects.forEach(element => element.translateX(x));
  return grobj;
}

function roty(grobj, ry) {
  grobj.objects.forEach(element => element.rotation.y = ry);
  return grobj;
}

// World Setup
let mydiv = document.getElementById("div1");
let box = InputHelpers.makeBoxDiv({ width: mydiv ? 640 : 820 }, mydiv);
InputHelpers.makeHead("Face vs. Vertex Coloring & Smooth Lighting", box);

let world = new GrWorld({ width: mydiv ? 600 : 800, where: box });

let obj1 = shift(new Object1(), -2);
let obj2 = shift(new Object2(), 2);

world.add(obj1);
world.add(obj2);

let div = InputHelpers.makeBoxDiv({}, box);
let sl = new InputHelpers.LabelSlider("ry", { min: -3.14, max: 3.14, where: div });

sl.oninput = function() {
    roty(obj1, sl.value());
    roty(obj2, sl.value());
};

world.go();