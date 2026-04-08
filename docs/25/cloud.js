import * as THREE from 'three';

// --- GLSL SOURCE STRINGS ---
// --- Procedural Noise Citation ---
// Algorithm: Simplex Noise by Ken Perlin (2001)
// GLSL Implementation: Stefan Gustavson and Ian McEwan (Ashima Arts)
// Source: https://github.com/stegu/webgl-noise
// License: MIT
const noiseLibrary = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;
${noiseLibrary}

float fBm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
        value += amplitude * snoise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec3 skyBlue = mix(vec3(0.4, 0.6, 1.0), vec3(0.1, 0.3, 0.8), vUv.y);
    vec2 cloudUV = vUv * 3.0;
    cloudUV.x += uTime * 0.05; 
    
    float n = fBm(cloudUV);
    n = n * 0.5 + 0.5; 

    float cloudMask = smoothstep(0.4, 0.65, n);
    gl_FragColor = vec4(mix(skyBlue, vec3(1.0), cloudMask), 1.0);
}
`;

// --- THREE.JS SETUP ---

const canvas = document.getElementById('cloud-canvas');

// Initialize renderer with the existing canvas
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true 
});

// Set initial size based on the CSS/Element size
const width = canvas.clientWidth;
const height = canvas.clientHeight;
renderer.setSize(width, height, false); // 'false' prevents Three.js from overriding CSS width/height

const scene = new THREE.Scene();

// Orthographic camera fits the plane to the canvas perfectly
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;

const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader,
    fragmentShader
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// --- ADAPTIVE RESIZING ---
function onWindowResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    
    renderer.setSize(w, h, false);
    // Since it's a full-plane shader, the Ortho camera doesn't 
    // technically need an aspect update, but it's good practice.
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', onWindowResize);

// --- ANIMATION LOOP ---
function animate(time) {
    requestAnimationFrame(animate);
    material.uniforms.uTime.value = time * 0.001;
    renderer.render(scene, camera);
}
animate(0);
