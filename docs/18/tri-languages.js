import * as THREE from "three";
import * as THREE_WEBGPU from "three/webgpu";
import * as TSL from "three/tsl";

/**
 * Implemented by GitHub Copilot (GPT-5.3-Codex), directed by user request.
 * This demo intentionally avoids framework helpers and uses plain Three.js APIs.
 */

const SHADERS = {
  glslVertex: "./shaders/triangle-yellow.vs",
  glslFragment: "./shaders/triangle-yellow.fs",
  wgslFragment: "./shaders/triangle-yellow.wgsl",
};

const { vec3 } = TSL;
/** @type {any} */
const tslAny = TSL;
const wgslFn = tslAny.wgslFn;

// Shared geometric definition for an equilateral triangle centered at the origin.
const HALF_SIDE = 0.62;
const HEIGHT = Math.sqrt(3) * HALF_SIDE;
const TRIANGLE_POSITIONS = [
  -HALF_SIDE,
  -HEIGHT / 3,
  0,
  HALF_SIDE,
  -HEIGHT / 3,
  0,
  0,
  (2 * HEIGHT) / 3,
  0,
];

function makeTriangleGeometry(TH) {
  const geometry = new TH.BufferGeometry();
  geometry.setAttribute(
    "position",
    new TH.Float32BufferAttribute(TRIANGLE_POSITIONS, 3)
  );
  return geometry;
}

function makeOrthoCamera(TH) {
  const camera = new TH.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
  camera.position.set(0, 0, 2);
  camera.lookAt(0, 0, 0);
  return camera;
}

function applyCanvasSize(renderer, canvas) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.text();
}

async function createGLSLDemo(canvas) {
  const [vertexShader, fragmentShader] = await Promise.all([
    fetchText(SHADERS.glslVertex),
    fetchText(SHADERS.glslFragment),
  ]);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(0x12171c, 1);
  applyCanvasSize(renderer, canvas);

  const scene = new THREE.Scene();
  const camera = makeOrthoCamera(THREE);
  const geometry = makeTriangleGeometry(THREE);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  renderer.render(scene, camera);

  return {
    resize() {
      applyCanvasSize(renderer, canvas);
      renderer.render(scene, camera);
    },
  };
}

async function createWGSLDemo(canvas) {
  const wgslSource = await fetchText(SHADERS.wgslFragment);
  const yellowWGSL = wgslFn(wgslSource);

  const renderer = new THREE_WEBGPU.WebGPURenderer({ canvas, antialias: true });
  // @ts-ignore local typings are missing WebGPU renderer APIs used by workbook demos
  renderer.setClearColor(0x12171c, 1);
  applyCanvasSize(renderer, canvas);
  // @ts-ignore local typings are missing WebGPU renderer APIs used by workbook demos
  await renderer.init();

  const scene = new THREE_WEBGPU.Scene();
  const camera = makeOrthoCamera(THREE_WEBGPU);
  const geometry = makeTriangleGeometry(THREE_WEBGPU);

  // @ts-ignore local typings do not include node material classes
  const material = new THREE_WEBGPU.MeshBasicNodeMaterial();
  material.colorNode = yellowWGSL();

  const mesh = new THREE_WEBGPU.Mesh(geometry, material);
  scene.add(mesh);
  renderer.render(scene, camera);

  return {
    resize() {
      applyCanvasSize(renderer, canvas);
      renderer.render(scene, camera);
    },
  };
}

async function createTSLDemo(canvas) {
  const renderer = new THREE_WEBGPU.WebGPURenderer({ canvas, antialias: true });
  // @ts-ignore local typings are missing WebGPU renderer APIs used by workbook demos
  renderer.setClearColor(0x12171c, 1);
  applyCanvasSize(renderer, canvas);
  // @ts-ignore local typings are missing WebGPU renderer APIs used by workbook demos
  await renderer.init();

  const scene = new THREE_WEBGPU.Scene();
  const camera = makeOrthoCamera(THREE_WEBGPU);
  const geometry = makeTriangleGeometry(THREE_WEBGPU);

  // @ts-ignore local typings do not include node material classes
  const material = new THREE_WEBGPU.MeshBasicNodeMaterial();
  material.colorNode = vec3(1.0, 0.93, 0.2);

  const mesh = new THREE_WEBGPU.Mesh(geometry, material);
  scene.add(mesh);
  renderer.render(scene, camera);

  return {
    resize() {
      applyCanvasSize(renderer, canvas);
      renderer.render(scene, camera);
    },
  };
}

function writeFallbackMessage(canvas, message) {
  const panel = canvas.closest(".panel");
  if (!panel) {
    return;
  }

  const text = document.createElement("p");
  text.textContent = message;
  text.style.marginTop = "8px";
  text.style.color = "#7f1d1d";
  panel.append(text);
}

async function main() {
  const glslCanvas = document.getElementById("glsl-canvas");
  const wgslCanvas = document.getElementById("wgsl-canvas");
  const tslCanvas = document.getElementById("tsl-canvas");

  if (!glslCanvas || !wgslCanvas || !tslCanvas) {
    return;
  }

  const demos = [];

  demos.push(await createGLSLDemo(glslCanvas));

  try {
    demos.push(await createWGSLDemo(wgslCanvas));
  } catch (err) {
    console.error(err);
    writeFallbackMessage(wgslCanvas, "WGSL panel could not initialize on this browser/GPU.");
  }

  try {
    demos.push(await createTSLDemo(tslCanvas));
  } catch (err) {
    console.error(err);
    writeFallbackMessage(tslCanvas, "TSL panel could not initialize on this browser/GPU.");
  }

  const onResize = () => {
    demos.forEach((demo) => demo.resize());
  };

  window.addEventListener("resize", onResize);
}

main().catch((err) => {
  console.error(err);
});
