// @ts-check
/**
 * CS559 Graphics Pipeline Demo
 *
 * Shows several 3D objects (each composed of many triangles) in a single scene.
 * Toggle wireframe to see the actual triangle mesh – this gives you a feel for
 * what "sending triangles to the GPU" actually means at scale.
 *
 * Pipeline connection: this scene represents what sits in the Command Buffer.
 * Every triangle you see here flows through all the pipeline stages: vertex
 * processing, assembly, rasterization, fragment shading, and z-testing.
 */

import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ── Container ──────────────────────────────────────────────────────────────
const container = document.getElementById("div1") || document.body;
const W = (container instanceof HTMLElement ? container.clientWidth || 680 : 680);
const H = 420;

// ── Renderer ───────────────────────────────────────────────────────────────
const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
if (container instanceof HTMLElement) container.appendChild(renderer.domElement);

// ── Scene ──────────────────────────────────────────────────────────────────
const scene = new T.Scene();
scene.background = new T.Color(0x16213e);
scene.fog = new T.FogExp2(0x16213e, 0.025);

// ── Lighting ───────────────────────────────────────────────────────────────
const ambient = new T.AmbientLight(0xffffff, 0.45);
scene.add(ambient);

const sunLight = new T.DirectionalLight(0xfff5e0, 1.1);
sunLight.position.set(8, 14, 6);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -12;
sunLight.shadow.camera.right = 12;
sunLight.shadow.camera.top = 12;
sunLight.shadow.camera.bottom = -12;
scene.add(sunLight);

const fillLight = new T.DirectionalLight(0xc0d8ff, 0.4);
fillLight.position.set(-5, 3, -8);
scene.add(fillLight);

// ── Ground ─────────────────────────────────────────────────────────────────
const groundGeo = new T.PlaneGeometry(28, 28);
const groundMat = new T.MeshLambertMaterial({ color: 0x1e3a5f });
const ground = new T.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new T.GridHelper(28, 28, 0x2a4a6a, 0x1e3557);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// ── Objects ────────────────────────────────────────────────────────────────
// Each object uses many triangles to illustrate the GPU's workload.
// High subdivision counts → more triangles → more vertices to process in parallel.

/** @type {T.Mesh[]} */
const meshes = [];

/** @param {T.BufferGeometry} geo @param {number} color @param {number} x @param {number} y @param {number} z */
function addMesh(geo, color, x, y, z) {
  const mat = new T.MeshPhongMaterial({
    color,
    shininess: 60,
    specular: new T.Color(0x444444),
  });
  const mesh = new T.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  meshes.push(mesh);
  return mesh;
}

// Sphere (32×32 = ~4k triangles) – labeled "many parallel vertex shaders"
addMesh(new T.SphereGeometry(1.4, 32, 32), 0x2979ff, -4.5, 1.4, -1);

// Torus (24×64 = ~3k triangles)
addMesh(new T.TorusGeometry(1.1, 0.45, 24, 64), 0xff3d00, 0, 1.55, -1);

// Torus knot (128 tube segments = ~4k triangles) – most complex
addMesh(new T.TorusKnotGeometry(0.9, 0.32, 128, 18), 0x00c853, 4.5, 1.4, -1);

// Cone (32 segments)
addMesh(new T.ConeGeometry(0.9, 2.4, 32, 1), 0xffd600, -2.5, 1.2, 2.5);

// Cylinder (32 segments)
addMesh(new T.CylinderGeometry(0.55, 0.85, 2.5, 32, 4), 0xaa00ff, 2.5, 1.25, 2.5);

// Dodecahedron (detail=2 = ~720 triangles)
addMesh(new T.DodecahedronGeometry(1.1, 2), 0xff6d00, 0, 1.1, 4.5);

// ── Count triangles & vertices ─────────────────────────────────────────────
let totalTris = 0;
let totalVerts = 0;
scene.traverse((obj) => {
  if (!(obj instanceof T.Mesh) || !obj.geometry) return;
  const geo = obj.geometry;
  if (geo.index) {
    totalTris  += geo.index.count / 3;
    totalVerts += geo.attributes.position.count;
  } else if (geo.attributes.position) {
    totalTris  += geo.attributes.position.count / 3;
    totalVerts += geo.attributes.position.count;
  }
});
totalTris  = Math.round(totalTris);
totalVerts = Math.round(totalVerts);

// ── Camera & Controls ──────────────────────────────────────────────────────
const camera = new T.PerspectiveCamera(50, W / H, 0.1, 200);
camera.position.set(0, 7, 14);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 40;
controls.update();

// ── UI Controls ────────────────────────────────────────────────────────────
const ui = document.createElement("div");
ui.style.cssText =
  "margin-top:7px; margin-bottom:4px; display:flex; align-items:center; gap:12px;" +
  "font-family:Helvetica Neue,Helvetica,Arial,sans-serif; font-size:13px; color:#ccc; flex-wrap:wrap;" +
  "padding: 0 6px;";

// Wireframe toggle
let wireframeOn = false;
const wireBtn = document.createElement("button");
wireBtn.textContent = "Show Wireframe";
wireBtn.style.cssText =
  "padding:4px 13px; cursor:pointer; border:1px solid #555; border-radius:5px;" +
  "background:#2a3a5a; color:#cde; font-size:13px;";

wireBtn.addEventListener("click", () => {
  wireframeOn = !wireframeOn;
  wireBtn.textContent = wireframeOn ? "Hide Wireframe" : "Show Wireframe";
  meshes.forEach((m) => {
    if (m.material instanceof T.MeshPhongMaterial) {
      m.material.wireframe = wireframeOn;
    }
  });
});

// Stats label
const statsEl = document.createElement("span");
statsEl.style.color = "#aaa";
statsEl.innerHTML =
  `<strong>${totalTris.toLocaleString()}</strong> triangles &nbsp;·&nbsp; ` +
  `<strong>${totalVerts.toLocaleString()}</strong> vertices &nbsp;—&nbsp; ` +
  `all vertex-processed <em>in parallel</em> by the GPU`;

ui.appendChild(wireBtn);
ui.appendChild(statsEl);
if (container instanceof HTMLElement) container.appendChild(ui);

// ── Animation loop ─────────────────────────────────────────────────────────
let lastTime = 0;

function animate(/** @type {number} */ t) {
  requestAnimationFrame(animate);

  const dt = (t - lastTime) * 0.001;
  lastTime = t;

  // Gentle rotation on each object (independent – just like the GPU processes them)
  if (meshes[0]) meshes[0].rotation.y += dt * 0.35;
  if (meshes[1]) { meshes[1].rotation.x += dt * 0.28; meshes[1].rotation.z += dt * 0.18; }
  if (meshes[2]) meshes[2].rotation.y += dt * 0.55;
  if (meshes[3]) meshes[3].rotation.y += dt * 0.25;
  if (meshes[4]) meshes[4].rotation.y -= dt * 0.30;
  if (meshes[5]) meshes[5].rotation.x += dt * 0.40;

  controls.update();
  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
