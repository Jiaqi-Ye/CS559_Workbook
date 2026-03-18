// @ts-check
// Texture filtering demonstration
// Implemented by GitHub Copilot (GPT-5.3-Codex), directed by Gleicher.

import * as T from "three";

const PANEL_SIZE = 256;
const ZOOM_PIXELS = 16;
const ZOOM_SCALE = PANEL_SIZE / ZOOM_PIXELS;
const ZOOM_START = PANEL_SIZE / 2 - ZOOM_PIXELS / 2;
const EPS = 1e-6;
const WIDTH_PIXELS_MIN = 1;
const WIDTH_PIXELS_MAX = 1024;
const DEFAULT_OBJECT_PIXEL_WIDTH = 256;

const textureManifest = [
  { name: "checkerboard_1_2_4_8_256", path: "/textures/simple/checkerboard_1_2_4_8_256.png" },
  { name: "checkerboard_4x4_8x8_64", path: "/textures/simple64/checkerboard_4x4_8x8_64.png" },
  { name: "checkerboard_gradient_256", path: "/textures/simple/checkerboard_gradient.png" },
  { name: "eye chart", path:"/textures/simple/eyechart_texture_256.png"},
  { name: "onyx", path:"/models/ambientcg/Onyx011/baseColor.jpg"}
];

const uvCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("uv-canvas"));
const zoomCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("zoom-canvas"));
const viewOverlayCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("view3d-overlay"));
const uvCtx = /** @type {CanvasRenderingContext2D} */ (uvCanvas.getContext("2d"));
const zoomCtx = /** @type {CanvasRenderingContext2D} */ (zoomCanvas.getContext("2d"));
const viewOverlayCtx = /** @type {CanvasRenderingContext2D} */ (viewOverlayCanvas.getContext("2d"));
const host3D = /** @type {HTMLDivElement} */ (document.getElementById("view3d-host"));

const state = {
  geometry: "square",
  targetWidthPixels: 256,
  tiltDeg: 0,
  rotZDeg: 0,
  textureIndex: 0,
  filterMode: "LinearMipmapLinear",
  anisotropyEnabled: false,
  anisotropyLevel: 1,
  showPixelCenters: true,
  showPixelCells: true,
  showHoverQuad: true,
  showMipApprox: true,
  thickOverlay: true,
  hoverCell: null,
  uv: [
    { u: 0.0, v: 0.0 },
    { u: 1.0, v: 0.0 },
    { u: 0.0, v: 1.0 },
    { u: 1.0, v: 1.0 }
  ]
};

/** @type {T.Texture[]} */
let textures = [];
let projectedTriangles = [];
let zoomMappings = [];

const renderer = new T.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(PANEL_SIZE, PANEL_SIZE, false);
host3D.appendChild(renderer.domElement);

const scene = new T.Scene();
scene.background = new T.Color("#0c1116");

const camera = new T.PerspectiveCamera(45, 1, 0.01, 5000);
const BASE_CAMERA_DISTANCE = PANEL_SIZE / (2 * DEFAULT_OBJECT_PIXEL_WIDTH * Math.tan(T.MathUtils.degToRad(camera.fov) / 2));

const material = new T.MeshBasicMaterial({ color: "white" });
const geometry = new T.BufferGeometry();
const mesh = new T.Mesh(geometry, material);
scene.add(mesh);

const borderMaterial = new T.LineBasicMaterial({ color: "#ffffff" });
const borderGeometry = new T.BufferGeometry();
const borderLine = new T.LineLoop(borderGeometry, borderMaterial);
scene.add(borderLine);

const uvControls = /** @type {HTMLDivElement} */ (document.getElementById("uv-controls"));
const viewControls = /** @type {HTMLDivElement} */ (document.getElementById("view-controls"));
const overlayControls = /** @type {HTMLDivElement} */ (document.getElementById("overlay-controls"));

const uvSliderRows = [];

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function pixelsToSliderValue(pixels) {
  const p = Math.min(WIDTH_PIXELS_MAX, Math.max(WIDTH_PIXELS_MIN, pixels));
  return Math.log2(p);
}

function sliderValueToPixels(sliderValue) {
  const p = 2 ** sliderValue;
  return Math.min(WIDTH_PIXELS_MAX, Math.max(WIDTH_PIXELS_MIN, p));
}

function targetPixelsToScale(targetPixels) {
  return Math.max(WIDTH_PIXELS_MIN / DEFAULT_OBJECT_PIXEL_WIDTH, targetPixels / DEFAULT_OBJECT_PIXEL_WIDTH);
}

function uvToCanvas(u, v) {
  return { x: u * (PANEL_SIZE - 1), y: (1 - v) * (PANEL_SIZE - 1) };
}

function buildRow(label, input, output) {
  const row = document.createElement("div");
  row.className = "row";
  const labelEl = document.createElement("label");
  labelEl.textContent = label;
  row.appendChild(labelEl);
  row.appendChild(input);
  row.appendChild(output);
  return row;
}

function makeRange(min, max, step, value, formatter) {
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);

  const out = document.createElement("output");
  const updateOutput = () => {
    out.textContent = formatter(Number(input.value));
  };
  updateOutput();

  input.addEventListener("input", updateOutput);
  return { input, out, updateOutput };
}

function makeSelect(label, values, current, onChange) {
  const select = document.createElement("select");
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === current) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  select.addEventListener("change", () => onChange(select.value));

  const out = document.createElement("output");
  out.textContent = "";
  return buildRow(label, select, out);
}

function makeCheckboxRow(label, checked, onChange) {
  const row = document.createElement("div");
  row.className = "checkrow";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  const span = document.createElement("span");
  span.textContent = label;
  row.appendChild(input);
  row.appendChild(span);
  input.addEventListener("change", () => onChange(input.checked));
  return row;
}

function buildUI(maxAnisotropy) {
  viewControls.appendChild(
    makeSelect("Geometry", ["equilateral", "right", "square"], state.geometry, (value) => {
      state.geometry = value;
      refreshUVControlEnabledState();
      renderAll();
    })
  );

  viewControls.appendChild(
    makeSelect(
      "Texture",
      textureManifest.map((t) => t.name),
      textureManifest[state.textureIndex].name,
      (value) => {
        state.textureIndex = textureManifest.findIndex((t) => t.name === value);
        applyTextureParameters();
        renderAll();
      }
    )
  );

  viewControls.appendChild(
    makeSelect("Filtering", ["Nearest", "Linear", "NearestMipmapNearest", "LinearMipmapLinear"], state.filterMode, (value) => {
      state.filterMode = value;
      applyTextureParameters();
      renderAll();
    })
  );

  const widthSlider = makeRange(
    pixelsToSliderValue(WIDTH_PIXELS_MIN),
    pixelsToSliderValue(WIDTH_PIXELS_MAX),
    0.01,
    pixelsToSliderValue(state.targetWidthPixels),
    (v) => `${sliderValueToPixels(v).toFixed(1)} px`
  );
  widthSlider.input.addEventListener("input", () => {
    state.targetWidthPixels = sliderValueToPixels(Number(widthSlider.input.value));
    renderAll();
  });
  viewControls.appendChild(buildRow("Square Width", widthSlider.input, widthSlider.out));

  const tilt = makeRange(0, 75, 0.1, state.tiltDeg, (v) => `${v.toFixed(1)} deg`);
  tilt.input.addEventListener("input", () => {
    state.tiltDeg = Number(tilt.input.value);
    renderAll();
  });
  viewControls.appendChild(buildRow("Tilt", tilt.input, tilt.out));

  const rotZ = makeRange(0, 360, 0.1, state.rotZDeg, (v) => `${v.toFixed(1)} deg`);
  rotZ.input.addEventListener("input", () => {
    state.rotZDeg = Number(rotZ.input.value);
    renderAll();
  });
  viewControls.appendChild(buildRow("Z Rotation", rotZ.input, rotZ.out));

  const anisoToggle = makeCheckboxRow("Enable anisotropy", state.anisotropyEnabled, (checked) => {
    state.anisotropyEnabled = checked;
    applyTextureParameters();
    renderAll();
  });
  viewControls.appendChild(anisoToggle);

  const aniso = makeRange(1, maxAnisotropy, 1, state.anisotropyLevel, (v) => String(Math.round(v)));
  aniso.input.addEventListener("input", () => {
    state.anisotropyLevel = Math.round(Number(aniso.input.value));
    applyTextureParameters();
    renderAll();
  });
  viewControls.appendChild(buildRow("Anisotropy", aniso.input, aniso.out));

  for (let i = 0; i < 4; i++) {
    const label = `UV ${i + 1}`;
    const u = makeRange(0, 1, 0.001, state.uv[i].u, (v) => v.toFixed(3));
    const v = makeRange(0, 1, 0.001, state.uv[i].v, (value) => value.toFixed(3));

    u.input.addEventListener("input", () => {
      state.uv[i].u = clamp01(Number(u.input.value));
      renderAll();
    });

    v.input.addEventListener("input", () => {
      state.uv[i].v = clamp01(Number(v.input.value));
      renderAll();
    });

    const rowU = buildRow(`${label} U`, u.input, u.out);
    const rowV = buildRow(`${label} V`, v.input, v.out);
    uvControls.appendChild(rowU);
    uvControls.appendChild(rowV);
    uvSliderRows.push({ rowU, rowV, u, v, index: i });
  }

  uvControls.appendChild(
    makeCheckboxRow("Thick overlays", state.thickOverlay, (checked) => {
      state.thickOverlay = checked;
      renderAll();
    })
  );

  overlayControls.appendChild(
    makeCheckboxRow("Show pixel centers", state.showPixelCenters, (checked) => {
      state.showPixelCenters = checked;
      renderAll();
    })
  );

  overlayControls.appendChild(
    makeCheckboxRow("Show pixel-cell trapezoids", state.showPixelCells, (checked) => {
      state.showPixelCells = checked;
      renderAll();
    })
  );

  overlayControls.appendChild(
    makeCheckboxRow("Show hover-mapped quad", state.showHoverQuad, (checked) => {
      state.showHoverQuad = checked;
      renderAll();
    })
  );

  overlayControls.appendChild(
    makeCheckboxRow("Show mip approximation", state.showMipApprox, (checked) => {
      state.showMipApprox = checked;
      renderAll();
    })
  );

  refreshUVControlEnabledState();
}

function refreshUVControlEnabledState() {
  const uvCount = state.geometry === "square" ? 4 : 3;
  for (const row of uvSliderRows) {
    const enabled = row.index < uvCount;
    row.u.input.disabled = !enabled;
    row.v.input.disabled = !enabled;
    row.rowU.style.opacity = enabled ? "1" : "0.4";
    row.rowV.style.opacity = enabled ? "1" : "0.4";
  }
}

function getGeometryDefinition() {
  if (state.geometry === "equilateral") {
    const h = Math.sqrt(3) / 2;
    return {
      positions: [
        -0.5, -h / 3, 0,
        0.5, -h / 3, 0,
        0, (2 * h) / 3, 0
      ],
      indices: [0, 1, 2],
      border: [0, 1, 2],
      uvs: [state.uv[0], state.uv[1], state.uv[2]]
    };
  }

  if (state.geometry === "right") {
    return {
      positions: [
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        -0.5, 0.5, 0
      ],
      indices: [0, 1, 2],
      border: [0, 1, 2],
      uvs: [state.uv[0], state.uv[1], state.uv[2]]
    };
  }

  return {
    positions: [
      -0.5, -0.5, 0,
      0.5, -0.5, 0,
      -0.5, 0.5, 0,
      0.5, 0.5, 0
    ],
    indices: [0, 1, 3, 0, 3, 2],
    border: [0, 1, 3, 2],
    uvs: [state.uv[0], state.uv[1], state.uv[2], state.uv[3]]
  };
}

function syncMeshGeometry() {
  const def = getGeometryDefinition();
  const uvArray = [];
  for (const uv of def.uvs) {
    uvArray.push(clamp01(uv.u), clamp01(uv.v));
  }

  geometry.setAttribute("position", new T.Float32BufferAttribute(def.positions, 3));
  geometry.setAttribute("uv", new T.Float32BufferAttribute(uvArray, 2));
  geometry.setIndex(def.indices);
  geometry.computeVertexNormals();

  const borderPos = [];
  for (const idx of def.border) {
    borderPos.push(def.positions[idx * 3], def.positions[idx * 3 + 1], def.positions[idx * 3 + 2]);
  }
  borderGeometry.setAttribute("position", new T.Float32BufferAttribute(borderPos, 3));
}

function applyTextureParameters() {
  const texture = textures[state.textureIndex];
  if (!texture) {
    return;
  }

  texture.wrapS = T.ClampToEdgeWrapping;
  texture.wrapT = T.ClampToEdgeWrapping;
  texture.flipY = false;
  texture.generateMipmaps = true;

  if (state.filterMode === "Nearest") {
    texture.magFilter = T.NearestFilter;
    texture.minFilter = T.NearestFilter;
  } else if (state.filterMode === "Linear") {
    texture.magFilter = T.LinearFilter;
    texture.minFilter = T.LinearFilter;
  } else if (state.filterMode === "NearestMipmapNearest") {
    texture.magFilter = T.NearestFilter;
    texture.minFilter = T.NearestMipmapNearestFilter;
  } else {
    texture.magFilter = T.LinearFilter;
    texture.minFilter = T.LinearMipmapLinearFilter;
  }

  texture.anisotropy = state.anisotropyEnabled ? state.anisotropyLevel : 1;
  texture.needsUpdate = true;
  material.map = texture;
  material.needsUpdate = true;
}

function render3D() {
  const objectScale = targetPixelsToScale(state.targetWidthPixels);
  camera.position.set(0, 0, BASE_CAMERA_DISTANCE);
  camera.lookAt(0, 0, 0);
  mesh.scale.set(objectScale, objectScale, objectScale);
  mesh.rotation.x = -T.MathUtils.degToRad(state.tiltDeg);
  mesh.rotation.z = T.MathUtils.degToRad(state.rotZDeg);
  borderLine.scale.set(objectScale, objectScale, objectScale);
  borderLine.rotation.x = mesh.rotation.x;
  borderLine.rotation.z = mesh.rotation.z;
  mesh.updateMatrixWorld(true);
  borderLine.updateMatrixWorld(true);
  renderer.render(scene, camera);
}

function barycentric(point, a, b, c) {
  const v0x = b.x - a.x;
  const v0y = b.y - a.y;
  const v1x = c.x - a.x;
  const v1y = c.y - a.y;
  const v2x = point.x - a.x;
  const v2y = point.y - a.y;

  const den = v0x * v1y - v1x * v0y;
  if (Math.abs(den) < EPS) {
    return null;
  }

  const v = (v2x * v1y - v1x * v2y) / den;
  const w = (v0x * v2y - v2x * v0y) / den;
  const u = 1 - v - w;
  return { u, v, w };
}

function getProjectedTriangles() {
  const def = getGeometryDefinition();
  const positions = def.positions;
  const localVerts = [];
  for (let i = 0; i < positions.length; i += 3) {
    localVerts.push(new T.Vector3(positions[i], positions[i + 1], positions[i + 2]));
  }

  const screenVerts = localVerts.map((p) => {
    const world = p.clone().applyMatrix4(mesh.matrixWorld);
    const ndc = world.clone().project(camera);
    return {
      x: (ndc.x * 0.5 + 0.5) * PANEL_SIZE,
      y: (1 - (ndc.y * 0.5 + 0.5)) * PANEL_SIZE
    };
  });

  const triangles = [];
  for (let i = 0; i < def.indices.length; i += 3) {
    const i0 = def.indices[i];
    const i1 = def.indices[i + 1];
    const i2 = def.indices[i + 2];
    const s0 = screenVerts[i0];
    const s1 = screenVerts[i1];
    const s2 = screenVerts[i2];
    const u0 = def.uvs[i0];
    const u1 = def.uvs[i1];
    const u2 = def.uvs[i2];

    const dx1 = s1.x - s0.x;
    const dy1 = s1.y - s0.y;
    const dx2 = s2.x - s0.x;
    const dy2 = s2.y - s0.y;
    const det = dx1 * dy2 - dy1 * dx2;

    let jacobian = null;
    if (Math.abs(det) > EPS) {
      const inv00 = dy2 / det;
      const inv01 = -dx2 / det;
      const inv10 = -dy1 / det;
      const inv11 = dx1 / det;

      const du1 = u1.u - u0.u;
      const dv1 = u1.v - u0.v;
      const du2 = u2.u - u0.u;
      const dv2 = u2.v - u0.v;

      jacobian = {
        duDx: du1 * inv00 + du2 * inv10,
        duDy: du1 * inv01 + du2 * inv11,
        dvDx: dv1 * inv00 + dv2 * inv10,
        dvDy: dv1 * inv01 + dv2 * inv11
      };
    }

    triangles.push({
      screen: [s0, s1, s2],
      uv: [u0, u1, u2],
      jacobian
    });
  }

  return triangles;
}

function mapScreenToUV(x, y) {
  for (let i = 0; i < projectedTriangles.length; i++) {
    const tri = projectedTriangles[i];
    const bary = barycentric({ x, y }, tri.screen[0], tri.screen[1], tri.screen[2]);
    if (!bary) {
      continue;
    }

    if (bary.u >= -1e-4 && bary.v >= -1e-4 && bary.w >= -1e-4) {
      const u = bary.u * tri.uv[0].u + bary.v * tri.uv[1].u + bary.w * tri.uv[2].u;
      const v = bary.u * tri.uv[0].v + bary.v * tri.uv[1].v + bary.w * tri.uv[2].v;
      return { u, v, triIndex: i };
    }
  }

  return null;
}

function mapScreenPointToUVForTriangle(point, tri) {
  const bary = barycentric(point, tri.screen[0], tri.screen[1], tri.screen[2]);
  if (!bary) {
    return null;
  }

  return {
    u: bary.u * tri.uv[0].u + bary.v * tri.uv[1].u + bary.w * tri.uv[2].u,
    v: bary.u * tri.uv[0].v + bary.v * tri.uv[1].v + bary.w * tri.uv[2].v
  };
}

function cross2(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

function clipPolygonAgainstEdge(polygon, edgeA, edgeB, insideSign) {
  if (polygon.length === 0) {
    return [];
  }

  const result = [];
  const ex = edgeB.x - edgeA.x;
  const ey = edgeB.y - edgeA.y;

  const signedDistance = (p) => insideSign * cross2(ex, ey, p.x - edgeA.x, p.y - edgeA.y);
  const inside = (p) => signedDistance(p) >= -1e-6;

  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const prev = polygon[(i + polygon.length - 1) % polygon.length];
    const currentInside = inside(current);
    const prevInside = inside(prev);

    if (currentInside !== prevInside) {
      const d0 = signedDistance(prev);
      const d1 = signedDistance(current);
      const denom = d0 - d1;
      const t = Math.abs(denom) < EPS ? 0 : d0 / denom;
      result.push({
        x: prev.x + (current.x - prev.x) * t,
        y: prev.y + (current.y - prev.y) * t
      });
    }

    if (currentInside) {
      result.push(current);
    }
  }

  return result;
}

function clipCellSquareWithTriangle(sx, sy, tri) {
  let poly = [
    { x: sx, y: sy },
    { x: sx + 1, y: sy },
    { x: sx + 1, y: sy + 1 },
    { x: sx, y: sy + 1 }
  ];

  const a = tri.screen[0];
  const b = tri.screen[1];
  const c = tri.screen[2];
  const triSign = Math.sign(cross2(b.x - a.x, b.y - a.y, c.x - a.x, c.y - a.y));
  if (triSign === 0) {
    return [];
  }

  poly = clipPolygonAgainstEdge(poly, a, b, triSign);
  poly = clipPolygonAgainstEdge(poly, b, c, triSign);
  poly = clipPolygonAgainstEdge(poly, c, a, triSign);
  return poly;
}

function computeCellFragments(sx, sy) {
  const fragments = [];
  for (const tri of projectedTriangles) {
    const clipped = clipCellSquareWithTriangle(sx, sy, tri);
    if (clipped.length < 3) {
      continue;
    }

    const uvPoly = [];
    for (const p of clipped) {
      const uv = mapScreenPointToUVForTriangle(p, tri);
      if (uv) {
        uvPoly.push(uv);
      }
    }
    if (uvPoly.length >= 3) {
      fragments.push(uvPoly);
    }
  }
  return fragments;
}

function computeZoomMappings() {
  const cells = [];
  for (let py = 0; py < ZOOM_PIXELS; py++) {
    for (let px = 0; px < ZOOM_PIXELS; px++) {
      const sx = ZOOM_START + px;
      const sy = ZOOM_START + py;

      const center = mapScreenToUV(sx + 0.5, sy + 0.5);
      const derivatives =
        center && center.triIndex !== undefined && projectedTriangles[center.triIndex]
          ? projectedTriangles[center.triIndex].jacobian
          : null;
      const fragments = computeCellFragments(sx, sy);

      cells.push({
        px,
        py,
        center,
        fragments,
        derivatives
      });
    }
  }

  return cells;
}

function drawUvPolygon(uvPoly) {
  if (!uvPoly || uvPoly.length < 3) {
    return;
  }
  const p0 = uvToCanvas(uvPoly[0].u, uvPoly[0].v);
  uvCtx.beginPath();
  uvCtx.moveTo(p0.x, p0.y);
  for (let i = 1; i < uvPoly.length; i++) {
    const p = uvToCanvas(uvPoly[i].u, uvPoly[i].v);
    uvCtx.lineTo(p.x, p.y);
  }
  uvCtx.closePath();
}

function drawUvSquare(centerUv, halfSizeUv, strokeStyle, lineWidth = 1.2) {
  const corners = [
    { u: centerUv.u - halfSizeUv, v: centerUv.v - halfSizeUv },
    { u: centerUv.u + halfSizeUv, v: centerUv.v - halfSizeUv },
    { u: centerUv.u + halfSizeUv, v: centerUv.v + halfSizeUv },
    { u: centerUv.u - halfSizeUv, v: centerUv.v + halfSizeUv }
  ];
  uvCtx.strokeStyle = strokeStyle;
  uvCtx.lineWidth = lineWidth;
  drawUvPolygon(corners);
  uvCtx.stroke();
}

function drawUVPanel() {
  const thickScale = state.thickOverlay ? 2 : 1;
  const outlineWidth = 2 * thickScale;
  const overlayLineWidth = 1 * thickScale;
  const hoverLineWidth = 2 * thickScale;
  const mipLineWidth = 1.5 * thickScale;
  const centerHalfSize = 1.5 * thickScale;

  uvCtx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);
  const texture = textures[state.textureIndex];
  if (texture && texture.image) {
    uvCtx.imageSmoothingEnabled = false;
    uvCtx.drawImage(texture.image, 0, 0, PANEL_SIZE, PANEL_SIZE);
  }

  const def = getGeometryDefinition();
  const border = def.border;
  uvCtx.strokeStyle = "#ffe152";
  uvCtx.lineWidth = outlineWidth;
  uvCtx.beginPath();
  for (let i = 0; i < border.length; i++) {
    const uv = def.uvs[border[i]];
    const p = uvToCanvas(uv.u, uv.v);
    if (i === 0) {
      uvCtx.moveTo(p.x, p.y);
    } else {
      uvCtx.lineTo(p.x, p.y);
    }
  }
  uvCtx.closePath();
  uvCtx.stroke();

  if (state.geometry === "square") {
    const p0 = uvToCanvas(def.uvs[0].u, def.uvs[0].v);
    const p3 = uvToCanvas(def.uvs[3].u, def.uvs[3].v);
    uvCtx.strokeStyle = "rgba(255,255,255,0.6)";
    uvCtx.lineWidth = overlayLineWidth;
    uvCtx.beginPath();
    uvCtx.moveTo(p0.x, p0.y);
    uvCtx.lineTo(p3.x, p3.y);
    uvCtx.stroke();
  }

  if (state.showPixelCells) {
    uvCtx.strokeStyle = "rgba(0, 180, 255, 0.45)";
    uvCtx.lineWidth = overlayLineWidth;
    for (const cell of zoomMappings) {
      for (const frag of cell.fragments) {
        drawUvPolygon(frag);
        uvCtx.stroke();
      }
    }
  }

  if (state.showPixelCenters) {
    uvCtx.fillStyle = "rgba(255, 56, 56, 0.95)";
    for (const cell of zoomMappings) {
      if (!cell.center) {
        continue;
      }
      const p = uvToCanvas(cell.center.u, cell.center.v);
      uvCtx.fillRect(p.x - centerHalfSize, p.y - centerHalfSize, 2 * centerHalfSize, 2 * centerHalfSize);
    }
  }

  const hover = state.hoverCell;
  if (hover) {
    const cell = zoomMappings.find((c) => c.px === hover.px && c.py === hover.py);
    if (cell) {
      if (state.showHoverQuad && cell.fragments.length > 0) {
        uvCtx.fillStyle = "rgba(255, 190, 65, 0.28)";
        uvCtx.strokeStyle = "rgba(255, 130, 20, 0.95)";
        uvCtx.lineWidth = hoverLineWidth;
        for (const frag of cell.fragments) {
          drawUvPolygon(frag);
          uvCtx.fill();
          uvCtx.stroke();
        }
      }

      if (state.showMipApprox && cell.center && cell.derivatives) {
        const texels = texture && texture.image ? texture.image.width : 64;
        const duDx = Math.hypot(cell.derivatives.duDx, cell.derivatives.dvDx);
        const duDy = Math.hypot(cell.derivatives.duDy, cell.derivatives.dvDy);
        const rho = Math.max(duDx, duDy) * texels;
        const lod = Math.max(0, Math.log2(Math.max(rho, 1e-5)));
        const footprintTexels = Math.max(1, 2 ** lod);
        const radiusUv = 0.5 * (footprintTexels / texels);
        const lowerTexels = Math.max(1, 2 ** Math.floor(lod));
        const upperTexels = Math.max(1, 2 ** Math.ceil(lod));
        const centerPoint = uvToCanvas(cell.center.u, cell.center.v);

        uvCtx.strokeStyle = "rgba(170, 38, 255, 0.95)";
        uvCtx.lineWidth = mipLineWidth;
        uvCtx.beginPath();
        uvCtx.arc(centerPoint.x, centerPoint.y, radiusUv * PANEL_SIZE, 0, Math.PI * 2);
        uvCtx.stroke();

        drawUvSquare(cell.center, 0.5 * (lowerTexels / texels), "rgba(170, 38, 255, 0.95)", mipLineWidth);
        drawUvSquare(cell.center, 0.5 * (upperTexels / texels), "rgba(170, 38, 255, 0.95)", mipLineWidth);
      }
    }
  }
}

function drawZoomPanel() {
  zoomCtx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);
  zoomCtx.imageSmoothingEnabled = false;
  zoomCtx.drawImage(
    renderer.domElement,
    ZOOM_START,
    ZOOM_START,
    ZOOM_PIXELS,
    ZOOM_PIXELS,
    0,
    0,
    PANEL_SIZE,
    PANEL_SIZE
  );

  zoomCtx.strokeStyle = "rgba(255,255,255,0.25)";
  zoomCtx.lineWidth = 1;
  for (let i = 0; i <= ZOOM_PIXELS; i++) {
    const p = i * ZOOM_SCALE;
    zoomCtx.beginPath();
    zoomCtx.moveTo(p, 0);
    zoomCtx.lineTo(p, PANEL_SIZE);
    zoomCtx.stroke();

    zoomCtx.beginPath();
    zoomCtx.moveTo(0, p);
    zoomCtx.lineTo(PANEL_SIZE, p);
    zoomCtx.stroke();
  }

  if (state.hoverCell) {
    zoomCtx.fillStyle = "rgba(255, 179, 26, 0.25)";
    zoomCtx.strokeStyle = "rgba(255, 126, 0, 0.95)";
    zoomCtx.lineWidth = 2;
    const x = state.hoverCell.px * ZOOM_SCALE;
    const y = state.hoverCell.py * ZOOM_SCALE;
    zoomCtx.fillRect(x, y, ZOOM_SCALE, ZOOM_SCALE);
    zoomCtx.strokeRect(x, y, ZOOM_SCALE, ZOOM_SCALE);
  }
}

function drawView3DOverlay() {
  viewOverlayCtx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);
  const thickScale = state.thickOverlay ? 2 : 1;
  viewOverlayCtx.strokeStyle = "rgba(255, 56, 56, 0.95)";
  viewOverlayCtx.fillStyle = "rgba(255, 56, 56, 0.12)";
  viewOverlayCtx.lineWidth = 1.5 * thickScale;
  viewOverlayCtx.fillRect(ZOOM_START, ZOOM_START, ZOOM_PIXELS, ZOOM_PIXELS);
  viewOverlayCtx.strokeRect(ZOOM_START, ZOOM_START, ZOOM_PIXELS, ZOOM_PIXELS);
}

function renderAll() {
  syncMeshGeometry();
  applyTextureParameters();
  render3D();
  drawView3DOverlay();
  projectedTriangles = getProjectedTriangles();
  zoomMappings = computeZoomMappings();
  drawZoomPanel();
  drawUVPanel();
}

function handleZoomHover(evt) {
  const rect = zoomCanvas.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;
  const px = Math.floor(x / ZOOM_SCALE);
  const py = Math.floor(y / ZOOM_SCALE);

  if (px < 0 || px >= ZOOM_PIXELS || py < 0 || py >= ZOOM_PIXELS) {
    state.hoverCell = null;
  } else {
    state.hoverCell = { px, py };
  }

  drawZoomPanel();
  drawUVPanel();
}

async function loadTextures() {
  const loader = new T.TextureLoader();
  const loaded = await Promise.all(
    textureManifest.map(
      (entry) =>
        new Promise((resolve, reject) => {
          loader.load(
            entry.path,
            (texture) => {
              texture.flipY = false;
              resolve(texture);
            },
            undefined,
            (err) => reject(new Error(`Texture load failed for ${entry.path}: ${err}`))
          );
        })
    )
  );
  textures = loaded;
}

async function start() {
  await loadTextures();
  const maxAniso = Math.max(1, renderer.capabilities.getMaxAnisotropy());
  state.anisotropyLevel = Math.min(8, maxAniso);

  buildUI(maxAniso);
  applyTextureParameters();
  renderAll();

  zoomCanvas.addEventListener("mousemove", handleZoomHover);
  zoomCanvas.addEventListener("mouseleave", () => {
    state.hoverCell = null;
    drawZoomPanel();
    drawUVPanel();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r") {
      state.hoverCell = null;
      renderAll();
    }
  });
}

start().catch((err) => {
  console.error(err);
  const message = document.createElement("pre");
  message.textContent = String(err);
  document.body.appendChild(message);
});
