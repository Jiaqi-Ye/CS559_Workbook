import * as THREE from 'three';
// @ts-ignore - resolved by browser import map in standalone demo pages
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const slider = /** @type {HTMLInputElement} */ (document.getElementById('sep-slider'));
const sepValue = document.getElementById('sep-value');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 30);
camera.position.set(3.1, 2.4, 4.2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x1f2937, 1.0));
const key = new THREE.DirectionalLight(0xffffff, 1.1);
key.position.set(3, 5, 4);
scene.add(key);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.45,
    metalness: 0.05
  })
);
scene.add(cube);

// One polygon geometry reused for all six decals.
const decalShape = new THREE.Shape();
decalShape.moveTo(-0.55, -0.45);
decalShape.lineTo(0.35, -0.55);
decalShape.lineTo(0.58, 0.05);
decalShape.lineTo(0.2, 0.52);
decalShape.lineTo(-0.45, 0.48);
decalShape.lineTo(-0.6, -0.08);
const decalGeo = new THREE.ShapeGeometry(decalShape);

const decalMat = new THREE.MeshStandardMaterial({
  color: 0xf97316,
  roughness: 0.55,
  metalness: 0.0,
  side: THREE.DoubleSide
});

const faceNormals = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1)
];

const decals = faceNormals.map((normal) => {
  const mesh = new THREE.Mesh(decalGeo, decalMat);

  // Shape geometry starts in the XY plane facing +Z; rotate it to each cube face normal.
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  cube.add(mesh);
  return { mesh, normal };
});

function updateDecalOffset(value) {
  const offset = Number(value);
  sepValue.textContent = offset.toFixed(4);

  for (const { mesh, normal } of decals) {
    mesh.position.copy(normal).multiplyScalar(1 + offset);
  }
}

slider.addEventListener('input', (event) => {
  const input = /** @type {HTMLInputElement} */ (event.target);
  updateDecalOffset(input.value);
});

function resizeRendererToDisplaySize() {
  const parent = canvas.parentElement;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resizeRendererToDisplaySize);

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  // Slow rotation keeps the depth conflict visible from changing view angles.
  cube.rotation.y = 0.2 * t;
  cube.rotation.x = 0.13 * t;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

updateDecalOffset(slider.value);
resizeRendererToDisplaySize();
animate();
