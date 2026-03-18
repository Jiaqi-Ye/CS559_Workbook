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

// --- OBJECT ---
const baseColor = new THREE.Color(0x00ffcc);
const geometry = new THREE.TorusKnotGeometry(0.6, 0.2, 150, 20);
const material = new THREE.MeshPhongMaterial({
    color: baseColor,
    specular: 0x888888,
    shininess: 30
});
const knot = new THREE.Mesh(geometry, material);
scene.add(knot);

// --- SLIDER LOGIC ---
const inputs = {
    diffuse: /** @type {HTMLInputElement} */ (document.getElementById('diffuse')),
    shininess: /** @type {HTMLInputElement} */ (document.getElementById('shininess')),
    specMix: /** @type {HTMLInputElement} */ (document.getElementById('specMix')),
    lightInt: /** @type {HTMLInputElement} */ (document.getElementById('lightInt'))
};

const displays = {
    diffVal: /** @type {HTMLElement} */ (document.getElementById('diffVal')),
    shinVal: /** @type {HTMLElement} */ (document.getElementById('shinVal')),
    specVal: /** @type {HTMLElement} */ (document.getElementById('specVal')),
    lightVal: /** @type {HTMLElement} */ (document.getElementById('lightVal'))
};

function updateMaterial() {
    // 1. Diffuse: Control by scaling the base color
    const d = parseFloat(inputs.diffuse.value);
    material.color.copy(baseColor).multiplyScalar(d);
    displays.diffVal.innerText = d.toFixed(1);

    // 2. Shininess: The Phong exponent (n)
    const s = parseFloat(inputs.shininess.value);
    material.shininess = s;
    displays.shinVal.innerText = String(s);

    // 3. Specular: Lerp between Object Color and White
    const mix = parseFloat(inputs.specMix.value) / 100;
    const white = new THREE.Color(0xffffff);
    material.specular.copy(baseColor).lerp(white, mix);
    displays.specVal.innerText = `${Math.round(mix * 100)}%`;

    // 4. Global Light Intensity
    const li = parseFloat(inputs.lightInt.value);
    light.intensity = li;
    displays.lightVal.innerText = String(li);
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