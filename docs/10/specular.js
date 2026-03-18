import * as THREE from 'three';

const canvas = document.getElementById('mainCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(600, 400);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 600 / 400, 0.1, 100);
camera.position.z = 3;

// --- LIGHTING ---
const light = new THREE.PointLight(0xffffff, 15);
light.position.set(3, 3, 3);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambient);

// --- OBJECTS ---
const baseColor = new THREE.Color(0x00ffcc);
const diffuseFactor = 0.5;
const specularColor = new THREE.Color(0xffffff);

const material = new THREE.MeshPhongMaterial({
    color: baseColor.clone().multiplyScalar(diffuseFactor),
    specular: specularColor,
    shininess: 30
});

const knotGeometry = new THREE.TorusKnotGeometry(0.5, 0.15, 150, 20);
const knot = new THREE.Mesh(knotGeometry, material);
knot.position.x = -0.8;
scene.add(knot);

const sphereGeometry = new THREE.SphereGeometry(0.6, 64, 64);
const sphere = new THREE.Mesh(sphereGeometry, material);
sphere.position.x = 0.8;
scene.add(sphere);

// --- SLIDER LOGIC ---
const inputs = {
    shininess: /** @type {HTMLInputElement} */ (document.getElementById('shininess')),
    toggleBtn: /** @type {HTMLButtonElement} */ (document.getElementById('toggleLighting'))
};

const displays = {
    shinVal: /** @type {HTMLElement} */ (document.getElementById('shinVal'))
};

let specularOnly = false;

function updateMaterial() {
    // 1. Diffuse/Ambient: Set to black if specularOnly is true
    if (specularOnly) {
        material.color.set(0x000000);
        ambient.intensity = 0;
    } else {
        material.color.copy(baseColor).multiplyScalar(diffuseFactor);
        ambient.intensity = 0.2;
    }

    // 2. Shininess: The Phong exponent (n)
    const s = parseFloat(inputs.shininess.value);
    material.shininess = s;
    displays.shinVal.innerText = String(s);
}

// Add listeners
inputs.shininess.addEventListener('input', updateMaterial);
inputs.toggleBtn.addEventListener('click', () => {
    specularOnly = !specularOnly;
    inputs.toggleBtn.innerText = specularOnly ? "Specular Only (press to turn on diffuse)" : "Specular+Diffuse (press to turn off diffuse)";
    updateMaterial();
});

// --- ANIMATION ---
function animate() {
    requestAnimationFrame(animate);
    knot.rotation.x += 0.005;
    knot.rotation.y += 0.01;
    sphere.rotation.y += 0.005;
    renderer.render(scene, camera);
}

updateMaterial(); // Initial call
animate();