// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";

// Use the provided texture atlas (images/dice_texture.png) that contains all 6 faces.
const diceTexture = new T.TextureLoader().load("/images/dice_texture.png");
diceTexture.colorSpace = T.SRGBColorSpace;
diceTexture.wrapS = T.ClampToEdgeWrapping;
diceTexture.wrapT = T.ClampToEdgeWrapping;
diceTexture.magFilter = T.LinearFilter;
diceTexture.minFilter = T.LinearFilter;
diceTexture.generateMipmaps = false;

// UV rectangles (u0, u1, v0, v1) for each face number in dice_texture.png.
const uvRects = {
  1: [0.84668, 1.0, 0.0, 0.14941],
  2: [0.8, 1.0, 0.09496, 0.33496],
  3: [0.02637, 0.4791, 0.35145, 0.85418],
  4: [0.32715, 0.66309, 0.66602, 1.0],
  5: [0.67773, 1.0, 0.35059, 0.68652],
  6: [0.63301, 1.1, 0.0, 0.35406],
};

function insetRect(rect, inset = 0.01) {
  const [u0, u1, v0, v1] = rect;
  return [u0 + inset, u1 - inset, v0 + inset, v1 - inset];
}

/**
 * Build a cube BufferGeometry with per-face UVs to pull from the atlas.
 */
function makeDieGeometry(size = 1) {
  const s = size / 2;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  // Opposite faces sum to 7: 1-6, 2-5, 3-4.
  const faceMap = {
    px: 3, // +X
    nx: 4, // -X
    py: 1, // +Y top
    ny: 6, // -Y bottom
    pz: 2, // +Z
    nz: 5, // -Z
  };

  /**
   * Add a face with its own UV rectangle.
   * @param {number[][]} verts 4 vertices
   * @param {number[]} normal face normal
   * @param {number[]} rect [u0, u1, v0, v1]
   */
  function addFace(verts, normal, rect) {
    const start = positions.length / 3;

    for (const v of verts) {
      positions.push(v[0], v[1], v[2]);
      normals.push(normal[0], normal[1], normal[2]);
    }

    const [u0, u1, v0, v1] = rect;
    uvs.push(
      u0, v0,
      u1, v0,
      u1, v1,
      u0, v1
    );

    // Ensure face winding matches outward normals (CCW from outside).
    indices.push(
      start, start + 2, start + 1,
      start, start + 3, start + 2
    );
  }

  // +X
  addFace(
    [
      [ s, -s, -s],
      [ s, -s,  s],
      [ s,  s,  s],
      [ s,  s, -s],
    ],
    [1, 0, 0],
    insetRect(uvRects[faceMap.px])
  );

  // -X
  addFace(
    [
      [-s, -s,  s],
      [-s, -s, -s],
      [-s,  s, -s],
      [-s,  s,  s],
    ],
    [-1, 0, 0],
    insetRect(uvRects[faceMap.nx])
  );

  // +Y (top)
  addFace(
    [
      [-s,  s, -s],
      [ s,  s, -s],
      [ s,  s,  s],
      [-s,  s,  s],
    ],
    [0, 1, 0],
    insetRect(uvRects[faceMap.py])
  );

  // -Y (bottom)
  addFace(
    [
      [-s, -s,  s],
      [ s, -s,  s],
      [ s, -s, -s],
      [-s, -s, -s],
    ],
    [0, -1, 0],
    insetRect(uvRects[faceMap.ny])
  );

  // +Z
  addFace(
    [
      [-s, -s,  s],
      [-s,  s,  s],
      [ s,  s,  s],
      [ s, -s,  s],
    ],
    [0, 0, 1],
    insetRect(uvRects[faceMap.pz])
  );

  // -Z
  addFace(
    [
      [ s, -s, -s],
      [ s,  s, -s],
      [-s,  s, -s],
      [-s, -s, -s],
    ],
    [0, 0, -1],
    insetRect(uvRects[faceMap.nz])
  );

  const geometry = new T.BufferGeometry();
  geometry.setAttribute(
    "position",
    new T.BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute(
    "normal",
    new T.BufferAttribute(new Float32Array(normals), 3)
  );
  geometry.setAttribute(
    "uv",
    new T.BufferAttribute(new Float32Array(uvs), 2)
  );
  geometry.setIndex(indices);
  return geometry;
}

class Dice extends GrObject {
  constructor(name = "dice", size = 1) {
    const geometry = makeDieGeometry(size);
    const material = new T.MeshStandardMaterial({
      color: "#ffffff",
      map: diceTexture,
      roughness: 0.6,
      metalness: 0.0,
    });

    const group = new T.Group();

    // Textured core cube (slightly smaller so rounded edges show)
    const coreScale = 0.97;
    const core = new T.Mesh(geometry, material);
    core.scale.set(coreScale, coreScale, coreScale);
    core.castShadow = true;
    core.receiveShadow = true;
    group.add(core);

    // Rounded edges shell (no texture)
    const edgeMaterial = new T.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.6,
      metalness: 0.0,
    });
    const r = size * 0.025;
    const half = size / 2 - r;
    const edgeLen = size - 2 * r;

    // Corners (8 spheres)
    const sphereGeo = new T.SphereGeometry(r, 12, 10);
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const s = new T.Mesh(sphereGeo, edgeMaterial);
          s.position.set(sx * half, sy * half, sz * half);
          group.add(s);
        }
      }
    }

    // Edges (12 cylinders)
    const cylGeo = new T.CylinderGeometry(r, r, edgeLen, 12, 1);
    function addEdge(x, y, z, axis) {
      const c = new T.Mesh(cylGeo, edgeMaterial);
      c.position.set(x, y, z);
      if (axis === "x") {
        c.rotation.z = Math.PI / 2;
      } else if (axis === "z") {
        c.rotation.x = Math.PI / 2;
      }
      group.add(c);
    }
    // Edges parallel to X (y,z fixed)
    for (const y of [-half, half]) {
      for (const z of [-half, half]) {
        addEdge(0, y, z, "x");
      }
    }
    // Edges parallel to Y (x,z fixed)
    for (const x of [-half, half]) {
      for (const z of [-half, half]) {
        addEdge(x, 0, z, "y");
      }
    }
    // Edges parallel to Z (x,y fixed)
    for (const x of [-half, half]) {
      for (const y of [-half, half]) {
        addEdge(x, y, 0, "z");
      }
    }

    super(name, group);
  }
}

let world = new GrWorld();

// First die: top is 1
const die1 = new Dice("die1", 1);
die1.objects[0].position.set(-1.2, 0.52, 0);
die1.objects[0].rotation.y = Math.PI / 6;

// Second die: rotate so the top is different
const die2 = new Dice("die2", 1);
die2.objects[0].position.set(1.2, 0.52, 0.4);
// Ensure UVs/material are identical to die1 (share geometry/material).
die2.objects[0].geometry = die1.objects[0].geometry;
die2.objects[0].material = die1.objects[0].material;
// Start from die1's orientation, then rotate it.
die2.objects[0].rotation.copy(die1.objects[0].rotation);
// Rotate so a different face is on top, while still flat on the ground.
die2.objects[0].rotateX(Math.PI / 2);
die2.objects[0].rotateY(Math.PI / 2);

world.add(die1);
world.add(die2);

world.go();

// 2026 Workbook
