/**
 * 05-05-02.js - a simple standalone three.js program with vertex colors and lighting
 */

import * as THREE from "three";

// 1. Setup the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, 
    1, // aspect ratio for 200/200
    0.1, 
    1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(200, 200);
document.body.appendChild(renderer.domElement);

// 2. Setup Lighting
// Point light source at (0,0,5) with no decay or distance limit
const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(0, 0, 5);
pointLight.distance = 0; // infinite range
pointLight.decay = 0;    // no decay
scene.add(pointLight);

// Add some ambient light so we can see the colors even on the back/shaded parts
const ambientLight = new THREE.AmbientLight(0x404040); 
scene.add(ambientLight);

// 3. Create the BufferGeometry for a single triangle with position, normal, and color
const geometry = new THREE.BufferGeometry();

// Define vertices (3 points, 3 coordinates each)
const vertices = new Float32Array([
    -1.0, -1.0,  0.0, // bottom-left
     1.0, -1.0,  0.0, // bottom-right
     0.0,  1.0,  0.0  // top-center
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

//@@Snippet:attributes
// Define normals (facing +Z)
const normals = new Float32Array([
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
]);
geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

// Define colors (RGB for each vertex)
const colors = new Float32Array([
    1.0, 0.0, 0.0, // Red
    0.0, 1.0, 0.0, // Green
    0.0, 0.0, 1.0  // Blue
]);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
//@@Snippet:end

// 4. Create a MeshPhongMaterial that uses per-vertex colors
const material = new THREE.MeshPhongMaterial({ 
    vertexColors: true, 
    side: THREE.DoubleSide 
});

// 5. Create the mesh and add it to the scene
const triangle = new THREE.Mesh(geometry, material);
scene.add(triangle);

// 6. Draw (Single frame)
renderer.render(scene, camera);

// 2026 Workbook
