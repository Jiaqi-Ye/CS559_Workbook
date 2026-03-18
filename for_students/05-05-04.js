/**
 * eg-triangle.js - a simple three.js program that shows a single triangle
 */

import * as THREE from "three";

/**
 * eg-triangle.js - a simple standalone three.js program
 */

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

// 2. Create the BufferGeometry for a single triangle
const geometry = new THREE.BufferGeometry();

// Define vertices for a single triangle (3 points, 3 coordinates each)
// @@Snippet:position
const vertices = new Float32Array([
    -2.0,  0.0,  0.0, // 0
     0.0,  0.0,  0.0, // 1
    -1.0,  2.0,  0.0, // 2
     2.0,  0.0,  0.0, // 3
     1.0,  2.0,  0.0, // 4
    -1.0, -2.0,  0.0, // 5
     1.0, -2.0,  0.0, // 6
]);
// technically, this needs a BufferAttribute - but three is
// smart enough to make it for us
//geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2, 1,3,4, 5,6,1]), 1));
geometry.setIndex([0,1,2, 1,3,4, 5,6,1]);
//@@Snippet:end

// Item size is 3 because there are 3 values (x, y, z) per vertex
const positionBuffer = new THREE.BufferAttribute(vertices, 3);
geometry.setAttribute('position', positionBuffer);

// 3. Create a yellow MeshBasicMaterial
const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });

// 4. Create the mesh and add it to the scene
const triangle = new THREE.Mesh(geometry, material);
scene.add(triangle);

// draw   
renderer.render(scene, camera);



// 2026 Workbook
