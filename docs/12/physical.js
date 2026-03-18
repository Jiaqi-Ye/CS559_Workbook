import * as THREE from 'three';

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
    clearcoatRoughness: /** @type {HTMLInputElement} */ (document.getElementById('clearcoatRoughness'))
};

const displays = {
    metalVal: /** @type {HTMLElement} */ (document.getElementById('metalVal')),
    roughVal: /** @type {HTMLElement} */ (document.getElementById('roughVal')),
    coatVal: /** @type {HTMLElement} */ (document.getElementById('coatVal')),
    coatRoughVal: /** @type {HTMLElement} */ (document.getElementById('coatRoughVal'))
};

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
    input.addEventListener('input', updateMaterial);
});

// --- ANIMATION ---
function animate() {
    requestAnimationFrame(animate);
    knot.rotation.x += 0.005;
    knot.rotation.y += 0.01;
    renderer.render(scene, camera);
}

updateMaterial(); // Initial call
animate();