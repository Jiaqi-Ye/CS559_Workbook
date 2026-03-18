import * as THREE from 'three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

const canvas = document.getElementById('mainCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(600, 400);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 600 / 400, 0.1, 100);
camera.position.z = 3;

// --- LIGHTING ---
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 3, 3);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// --- OBJECT ---
const baseColor = new THREE.Color(0x00ffcc);
const geometry = new THREE.TorusKnotGeometry(0.6, 0.2, 150, 20);
const material = new THREE.MeshPhysicalMaterial({
    color: baseColor,
    metalness: 0,
    roughness: 0.3,
    clearcoat: 0,
    clearcoatRoughness: 0
});
const knot = new THREE.Mesh(geometry, material);
scene.add(knot);

// --- SLIDER LOGIC ---
const inputs = {
    metalness: /** @type {HTMLInputElement} */ (document.getElementById('metalness')),
    roughness: /** @type {HTMLInputElement} */ (document.getElementById('roughness')),
    clearcoat: /** @type {HTMLInputElement} */ (document.getElementById('clearcoat')),
    clearcoatRoughness: /** @type {HTMLInputElement} */ (document.getElementById('clearcoatRoughness')),
    toggleEnv: /** @type {HTMLButtonElement} */ (document.getElementById('toggleEnv')),
    toggleLights: /** @type {HTMLButtonElement} */ (document.getElementById('toggleLights'))
};

const displays = {
    metalVal: /** @type {HTMLElement} */ (document.getElementById('metalVal')),
    roughVal: /** @type {HTMLElement} */ (document.getElementById('roughVal')),
    coatVal: /** @type {HTMLElement} */ (document.getElementById('coatVal')),
    coatRoughVal: /** @type {HTMLElement} */ (document.getElementById('coatRoughVal'))
};

let envTexture = null;

function updateMaterial() {
    material.metalness = parseFloat(inputs.metalness.value);
    displays.metalVal.innerText = inputs.metalness.value;

    material.roughness = parseFloat(inputs.roughness.value);
    displays.roughVal.innerText = inputs.roughness.value;

    material.clearcoat = parseFloat(inputs.clearcoat.value);
    displays.coatVal.innerText = inputs.clearcoat.value;

    material.clearcoatRoughness = parseFloat(inputs.clearcoatRoughness.value);
    displays.coatRoughVal.innerText = inputs.clearcoatRoughness.value;
}

// Add listeners to all sliders
Object.values(inputs).forEach(input => {
    if (input instanceof HTMLInputElement) {
        input.addEventListener('input', updateMaterial);
    }
});

inputs.toggleEnv.addEventListener('click', () => {
    if (scene.environment) {
        scene.environment = null;
        scene.background = null;
    } else {
        scene.environment = envTexture;
        scene.background = envTexture;
    }
});

inputs.toggleLights.addEventListener('click', () => {
    light.visible = !light.visible;
    ambient.visible = !ambient.visible;
});

// --- ANIMATION ---
function animate() {
    requestAnimationFrame(animate);
    knot.rotation.x += 0.005;
    knot.rotation.y += 0.01;
    renderer.render(scene, camera);
}

// environment map
const loader = new EXRLoader();

loader.load('/textures/envmaps/daysky.exr', (texture) => {
  // 1. Important: Set the mapping for 360 images
  texture.mapping = THREE.EquirectangularReflectionMapping;

  // 2. Apply to the scene
  envTexture = texture;
  scene.environment = texture;
  scene.background = texture;
});


updateMaterial(); // Initial call
animate();