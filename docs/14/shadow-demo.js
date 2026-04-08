// shadow-demo.js  — CS559 Shadow Maps Demo
// Three.js r180, standalone (no CS559 framework)

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── Renderer ────────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type   = THREE.PCFSoftShadowMap;
renderer.toneMapping      = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

function resize() {
  const wrap = canvas.parentElement;
  renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
  camera.aspect = wrap.clientWidth / wrap.clientHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

// ─── Camera ───────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 150);
camera.position.set(9, 7, 11);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping  = true;
controls.dampingFactor  = 0.07;
controls.target.set(0, 1, 0);
controls.minDistance    = 3;
controls.maxDistance    = 40;

// ─── Scene ────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8caabb);
scene.fog = new THREE.Fog(0x8caabb, 30, 80);

// Ambient (low, so shadows are clearly darker)
const ambient = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambient);

// ─── Directional light ───────────────────────────────────────────────────────
const dirLight = new THREE.DirectionalLight(0xfff8e7, 2.0);
dirLight.castShadow               = true;
dirLight.shadow.mapSize.width     = 256;
dirLight.shadow.mapSize.height    = 256;
dirLight.shadow.camera.near       = 0.5;
dirLight.shadow.camera.far        = 50;
dirLight.shadow.camera.left       = -12;
dirLight.shadow.camera.right      = 12;
dirLight.shadow.camera.top        = 12;
dirLight.shadow.camera.bottom     = -12;
dirLight.shadow.bias              = 0.0005;
dirLight.shadow.normalBias        = 0.05;

const dirHelper = new THREE.DirectionalLightHelper(dirLight, 3, 0xfbbf24);
dirHelper.visible = false;

// ─── Spot light ───────────────────────────────────────────────────────────────
const spot = new THREE.SpotLight(0xfff8e7, 120);
spot.castShadow               = true;
spot.angle                    = Math.PI / 9;
spot.penumbra                 = 0.25;
spot.decay                    = 2;
spot.shadow.mapSize.width     = 256;
spot.shadow.mapSize.height    = 256;
spot.shadow.camera.near       = 1;
spot.shadow.camera.far        = 40;
spot.shadow.bias              = 0.0005;
spot.shadow.normalBias        = 0.05;

const spotTarget = new THREE.Object3D();
spotTarget.position.set(0, 0, 0);
scene.add(spotTarget);
spot.target = spotTarget;

const spotHelper = new THREE.SpotLightHelper(spot, 0xfbbf24);
spotHelper.visible = false;

// ─── Active light state ───────────────────────────────────────────────────────
let lightType   = 'dir';   // 'dir' | 'spot'
let activeLight = dirLight;
let activeHelper = dirHelper;

scene.add(dirLight);
scene.add(dirHelper);
// spot starts off-scene

// ─── Light position ───────────────────────────────────────────────────────────
let lightH = 8, lightA = 90, lightR = 7;
function updateLight() {
  const rad = (lightA * Math.PI) / 180;
  const x = lightR * Math.sin(rad);
  const z = lightR * Math.cos(rad);
  activeLight.position.set(x, lightH, z);
  activeHelper.update();
}
updateLight();

// ─── Ground ───────────────────────────────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(30, 30);
const groundMat = new THREE.MeshLambertMaterial({ color: 0xc8d8b0 });
const ground    = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid on ground
const grid = new THREE.GridHelper(30, 30, 0x888888, 0x999999);
grid.material.opacity   = 0.25;
grid.material.transparent = true;
scene.add(grid);

// ─── Objects ──────────────────────────────────────────────────────────────────
function makeMesh(geo, color, x, y, z) {
  const mat  = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// Blue box
makeMesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), 0x4a9ded, -2.2, 0.8,  0.2);
// Tall green box
makeMesh(new THREE.BoxGeometry(1.0, 2.8, 1.0), 0x4caf78, 0.6, 1.4, -1.8);
// Orange sphere
makeMesh(new THREE.SphereGeometry(0.9, 32, 16),  0xe07040,  2.2, 0.9,  1.2);
// Small white torus (casts a fun shadow shape)
const torus = makeMesh(new THREE.TorusGeometry(0.8, 0.28, 16, 48), 0xf0e8d0, -0.5, 0.3, 2.0);
torus.rotation.x = Math.PI / 2.5;
// Low flat box (good shadow receiver)
makeMesh(new THREE.BoxGeometry(3.5, 0.25, 1.8), 0xa0887a, 1.5, 0.125, -0.2);

// ─── FPS counter ─────────────────────────────────────────────────────────────
let lastTime = 0, frameCount = 0;
const fpsEl = document.getElementById('fps');

// ─── Animation loop ───────────────────────────────────────────────────────────
function animate(now) {
  requestAnimationFrame(animate);
  controls.update();
  torus.rotation.z += 0.004;   // slowly spin the torus
  renderer.render(scene, camera);

  // FPS
  frameCount++;
  if (now - lastTime >= 1000) {
    fpsEl.textContent = frameCount;
    frameCount = 0;
    lastTime = now;
  }
}
resize();
animate(0);

// ─── UI Controls ─────────────────────────────────────────────────────────────
const MAP_SIZES = [64, 128, 256, 512, 1024];

// helpers for refreshing materials after light switch
function markMaterialsForUpdate() {
  scene.traverse(obj => {
    if (obj.isMesh && obj.material) obj.material.needsUpdate = true;
  });
}

// ── Light type toggle ─────────────────────────────────────────────────────────
function switchLightType() {
  const prevLight  = activeLight;
  const prevHelper = activeHelper;
  const helperWasVisible = prevHelper.visible;

  // copy shared state to incoming light
  const nextLight  = lightType === 'dir' ? spot    : dirLight;
  const nextHelper = lightType === 'dir' ? spotHelper : dirHelper;
  nextLight.castShadow           = prevLight.castShadow;
  nextLight.shadow.mapSize.width = prevLight.shadow.mapSize.width;
  nextLight.shadow.mapSize.height= prevLight.shadow.mapSize.height;
  nextLight.shadow.map?.dispose();
  nextLight.shadow.map = null;

  // swap scene membership
  scene.remove(prevLight);
  scene.remove(prevHelper);
  scene.add(nextLight);
  scene.add(nextHelper);

  activeLight  = nextLight;
  activeHelper = nextHelper;
  lightType    = lightType === 'dir' ? 'spot' : 'dir';

  // copy helper visibility
  activeHelper.visible = helperWasVisible;

  // reposition and refresh
  updateLight();
  markMaterialsForUpdate();

  // update button label
  const btn = document.getElementById('btn-light-type');
  btn.textContent = lightType === 'dir'
    ? 'Switch to SpotLight'
    : 'Switch to DirectionalLight';
  document.getElementById('light-type-label').textContent =
    lightType === 'dir' ? 'Directional' : 'Spot';
}

document.getElementById('btn-light-type').addEventListener('click', switchLightType);

// ── Shadow on/off toggle ──────────────────────────────────────────────────────
let shadowsOn = true;

document.getElementById('btn-shadows').addEventListener('click', () => {
  shadowsOn = !shadowsOn;
  activeLight.castShadow = shadowsOn;
  markMaterialsForUpdate();
  const btn   = document.getElementById('btn-shadows');
  const badge = document.getElementById('shadow-badge');
  if (shadowsOn) {
    btn.textContent   = 'Toggle Shadows OFF';
    btn.classList.remove('off');
    badge.textContent = 'Shadows ON';
    badge.className   = 'badge badge-on';
  } else {
    btn.textContent   = 'Toggle Shadows ON';
    btn.classList.add('off');
    badge.textContent = 'Shadows OFF';
    badge.className   = 'badge badge-off';
  }
});

// ── Helper toggle ─────────────────────────────────────────────────────────────
let helperOn = false;
document.getElementById('btn-helper').addEventListener('click', () => {
  helperOn = !helperOn;
  activeHelper.visible = helperOn;
  document.getElementById('btn-helper').textContent =
    helperOn ? 'Hide Light Helper' : 'Show Light Helper';
});

// ── Light position sliders ────────────────────────────────────────────────────
document.getElementById('light-h').addEventListener('input', e => {
  lightH = parseFloat(e.target.value);
  document.getElementById('lh-val').textContent = lightH;
  updateLight();
});
document.getElementById('light-a').addEventListener('input', e => {
  lightA = parseFloat(e.target.value);
  document.getElementById('la-val').textContent = lightA + '°';
  updateLight();
});
document.getElementById('light-r').addEventListener('input', e => {
  lightR = parseFloat(e.target.value);
  document.getElementById('lr-val').textContent = lightR;
  updateLight();
});

// ── Map size slider ───────────────────────────────────────────────────────────
document.getElementById('map-size').addEventListener('input', e => {
  const idx  = parseInt(e.target.value);
  const size = MAP_SIZES[idx];
  activeLight.shadow.mapSize.width  = size;
  activeLight.shadow.mapSize.height = size;
  activeLight.shadow.map?.dispose();
  activeLight.shadow.map = null;     // force rebuild of shadow map
  document.getElementById('ms-val').textContent    = size;
  document.getElementById('smap-size').textContent = `${size}×${size}`;
});
