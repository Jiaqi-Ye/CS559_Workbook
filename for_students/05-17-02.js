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
  2: [0.7998, 1.0, 0.08496, 0.33496],
  3: [0.02637, 0.4791, 0.35145, 0.85418],
  4: [0.32715, 0.66309, 0.66602, 1.0],
  5: [0.67773, 1.0, 0.35059, 0.68652],
  6: [0.63301, 1.1, 0.0, 0.35406],
};

function insetRect(rect, inset = 0.01) {
  const [u0, u1, v0, v1] = rect;
  return [u0 + inset, u1 - inset, v0 + inset, v1 - inset];
}

// A tiny white patch in the atlas (used for sides/bottom)
const blankRect = [0.01, 0.05, 0.95, 0.99];

function buildDominoGeometry(width, height, depth, leftNum, rightNum) {
  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  function addQuad(verts, normal, rect) {
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

    // CCW from outside
    indices.push(
      start, start + 2, start + 1,
      start, start + 3, start + 2
    );
  }

  // Top (split into two halves)
  // Left half (-x to 0)
  addQuad(
    [
      [-hw, hh, -hd],
      [ 0,  hh, -hd],
      [ 0,  hh,  hd],
      [-hw, hh,  hd],
    ],
    [0, 1, 0],
    insetRect(uvRects[leftNum])
  );
  // Right half (0 to +x)
  addQuad(
    [
      [ 0,  hh, -hd],
      [ hw, hh, -hd],
      [ hw, hh,  hd],
      [ 0,  hh,  hd],
    ],
    [0, 1, 0],
    insetRect(uvRects[rightNum])
  );

  // Bottom
  addQuad(
    [
      [-hw, -hh,  hd],
      [ hw, -hh,  hd],
      [ hw, -hh, -hd],
      [-hw, -hh, -hd],
    ],
    [0, -1, 0],
    blankRect
  );

  // Front (+Z)
  addQuad(
    [
      [-hw, -hh,  hd],
      [-hw,  hh,  hd],
      [ hw,  hh,  hd],
      [ hw, -hh,  hd],
    ],
    [0, 0, 1],
    blankRect
  );

  // Back (-Z)
  addQuad(
    [
      [ hw, -hh, -hd],
      [ hw,  hh, -hd],
      [-hw,  hh, -hd],
      [-hw, -hh, -hd],
    ],
    [0, 0, -1],
    blankRect
  );

  // Right (+X)
  addQuad(
    [
      [ hw, -hh,  hd],
      [ hw,  hh,  hd],
      [ hw,  hh, -hd],
      [ hw, -hh, -hd],
    ],
    [1, 0, 0],
    blankRect
  );

  // Left (-X)
  addQuad(
    [
      [-hw, -hh, -hd],
      [-hw,  hh, -hd],
      [-hw,  hh,  hd],
      [-hw, -hh,  hd],
    ],
    [-1, 0, 0],
    blankRect
  );

  const geometry = new T.BufferGeometry();
  geometry.setAttribute("position", new T.BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute("normal", new T.BufferAttribute(new Float32Array(normals), 3));
  geometry.setAttribute("uv", new T.BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  return geometry;
}

class Domino extends GrObject {
  constructor(name = "domino", leftNum = 6, rightNum = 6, width = 2, height = 0.25, depth = 1) {
    const geometry = buildDominoGeometry(width, height, depth, leftNum, rightNum);
    const material = new T.MeshStandardMaterial({
      color: "#ffffff",
      map: diceTexture,
      roughness: 0.7,
      metalness: 0.0,
    });

    const group = new T.Group();

    // Textured core
    const coreScale = 0.97;
    const core = new T.Mesh(geometry, material);
    core.scale.set(coreScale, coreScale, coreScale);
    core.castShadow = true;
    core.receiveShadow = true;
    group.add(core);

    // Rounded edges shell (no texture)
    const edgeMaterial = new T.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.7,
      metalness: 0.0,
    });
    const r = Math.min(width, depth) * 0.035;
    const hx = width / 2 - r;
    const hy = height / 2 - r;
    const hz = depth / 2 - r;

    // Corners (8 spheres)
    const sphereGeo = new T.SphereGeometry(r, 12, 10);
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const s = new T.Mesh(sphereGeo, edgeMaterial);
          s.position.set(sx * hx, sy * hy, sz * hz);
          group.add(s);
        }
      }
    }

    // Edges (12 cylinders)
    const cylGeoX = new T.CylinderGeometry(r, r, width - 2 * r, 12, 1);
    const cylGeoY = new T.CylinderGeometry(r, r, height - 2 * r, 12, 1);
    const cylGeoZ = new T.CylinderGeometry(r, r, depth - 2 * r, 12, 1);

    function addEdge(geo, x, y, z, axis) {
      const c = new T.Mesh(geo, edgeMaterial);
      c.position.set(x, y, z);
      if (axis === "x") c.rotation.z = Math.PI / 2;
      if (axis === "z") c.rotation.x = Math.PI / 2;
      group.add(c);
    }

    // X edges (y,z fixed)
    for (const y of [-hy, hy]) {
      for (const z of [-hz, hz]) {
        addEdge(cylGeoX, 0, y, z, "x");
      }
    }
    // Y edges (x,z fixed)
    for (const x of [-hx, hx]) {
      for (const z of [-hz, hz]) {
        addEdge(cylGeoY, x, 0, z, "y");
      }
    }
    // Z edges (x,y fixed)
    for (const x of [-hx, hx]) {
      for (const y of [-hy, hy]) {
        addEdge(cylGeoZ, x, y, 0, "z");
      }
    }

    super(name, group);
  }
}

const world = new GrWorld();

// A small legal chain with distinct dominos (includes a double-6)
const dominos = [
  new Domino("domino-6-6", 6, 6, 2, 0.25, 1),
  new Domino("domino-6-5", 6, 5, 2, 0.25, 1),
  new Domino("domino-5-3", 5, 3, 2, 0.25, 1),
  new Domino("domino-3-1", 3, 1, 2, 0.25, 1),
];

const y = 0.125;
dominos[0].objects[0].position.set(-2.2, y, 0);
dominos[1].objects[0].position.set(0, y, 0);
dominos[2].objects[0].position.set(2.2, y, 0);
dominos[3].objects[0].position.set(4.4, y, 0);
dominos[3].objects[0].rotation.y = Math.PI / 2;

for (const d of dominos) {
  world.add(d);
}
world.go();

// 2026 Workbook
