import * as THREE from "three";
import * as THREE_WEBGPU from "three/webgpu";
import * as TSL from "three/tsl";
import * as InputHelpers from "CS559/inputHelpers.js";

/**
 * Implemented by GitHub Copilot (GPT-5.3-Codex), directed by workbook author request.
 */

const SHADERS = {
  glslVertex: "./shaders/dots-languages.vs",
  glslFragment: "./shaders/dots-languages.fs",
  wgslFragment: "./shaders/dots-languages.wgsl",
};

const { uniform, uv } = TSL;
/** @type {any} */
const tslAny = TSL;
const wgslFn = tslAny.wgslFn;

const params = {
  dots: 4.0,
  radius: 0.2,
};

function makeCamera(TH) {
  const camera = new TH.PerspectiveCamera(40, 1, 0.1, 20);
  camera.position.set(0, 1.8, 4.2);
  camera.lookAt(0, 0.8, 0);
  return camera;
}

function makeObjects(TH, material) {
  const group = new TH.Group();

  const plane = new TH.Mesh(new TH.PlaneGeometry(1.6, 1.6, 1, 1), material);
  plane.position.set(-1.2, 0.9, 0);

  const sphere = new TH.Mesh(new TH.SphereGeometry(0.8, 48, 32), material);
  sphere.position.set(1.2, 0.9, 0);

  group.add(plane);
  group.add(sphere);
  return group;
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
  const camera = makeCamera(THREE);

  const uniforms = {
    dots: { value: params.dots },
    radius: { value: params.radius },
    light: { value: new THREE.Vector3(1, 1, 1) },
    dark: { value: new THREE.Vector3(0.2, 0.2, 0.7) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide,
  });

  scene.add(makeObjects(THREE, material));

  return {
    render() {
      uniforms.dots.value = params.dots;
      uniforms.radius.value = params.radius;
      renderer.render(scene, camera);
    },
    resize() {
      applyCanvasSize(renderer, canvas);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    },
  };
}

async function createWGSLDemo(canvas) {
  const wgslSource = await fetchText(SHADERS.wgslFragment);
  const dotsWGSL = wgslFn(wgslSource);

  const renderer = new THREE_WEBGPU.WebGPURenderer({ canvas, antialias: true });
  // @ts-ignore local typings are missing WebGPU renderer APIs used by workbook demos
  renderer.setClearColor(0x12171c, 1);
  applyCanvasSize(renderer, canvas);
  // @ts-ignore local typings are missing WebGPU renderer APIs used by workbook demos
  await renderer.init();

  const scene = new THREE_WEBGPU.Scene();
  const camera = makeCamera(THREE_WEBGPU);

  const dotsU = uniform(params.dots);
  const radiusU = uniform(params.radius);
  const lightU = uniform(new THREE.Vector3(1, 1, 1));
  const darkU = uniform(new THREE.Vector3(0.2, 0.2, 0.7));

  // @ts-ignore local typings do not include node material classes
  const material = new THREE_WEBGPU.MeshBasicNodeMaterial();
  material.side = THREE.DoubleSide;
  material.colorNode = dotsWGSL(uv(), dotsU, radiusU, lightU, darkU);

  scene.add(makeObjects(THREE_WEBGPU, material));

  return {
    render() {
      dotsU.value = params.dots;
      radiusU.value = params.radius;
      renderer.render(scene, camera);
    },
    resize() {
      applyCanvasSize(renderer, canvas);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
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
  const camera = makeCamera(THREE_WEBGPU);

  const dotsU = uniform(params.dots);
  const radiusU = uniform(params.radius);
  const lightU = uniform(new THREE.Vector3(1, 1, 1));
  const darkU = uniform(new THREE.Vector3(0.2, 0.2, 0.7));

  const uNode = uv();
  const x = uNode.x.mul(dotsU);
  const y = uNode.y.mul(dotsU);
  const dx = x.fract().sub(0.5);
  const dy = y.fract().sub(0.5);
  const d = dx.mul(dx).add(dy.mul(dy)).sqrt();
  // Dot coverage: 1 inside radius, 0 outside, avoiding step() ordering ambiguity.
  const dc = radiusU.sub(d).sign().add(1.0).mul(0.5);
  const colorNode = lightU.mul(dc.oneMinus()).add(darkU.mul(dc));

  // @ts-ignore local typings do not include node material classes
  const material = new THREE_WEBGPU.MeshBasicNodeMaterial();
  material.side = THREE.DoubleSide;
  material.colorNode = colorNode;

  scene.add(makeObjects(THREE_WEBGPU, material));

  return {
    render() {
      dotsU.value = params.dots;
      radiusU.value = params.radius;
      renderer.render(scene, camera);
    },
    resize() {
      applyCanvasSize(renderer, canvas);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    },
  };
}

function setupControls(renderAll) {
  const controls = document.getElementById("controls");
  if (!controls) {
    return;
  }

  const s1 = new InputHelpers.LabelSlider("dots", {
    width: 420,
    min: 1,
    max: 20,
    step: 0.5,
    initial: params.dots,
    where: controls,
    display: "block",
  });

  const s2 = new InputHelpers.LabelSlider("radius", {
    width: 420,
    min: 0.1,
    max: 0.5,
    step: 0.01,
    initial: params.radius,
    where: controls,
    display: "block",
  });

  const onchange = () => {
    params.dots = Number(s1.value());
    params.radius = Number(s2.value());
    renderAll();
  };

  s1.oninput = onchange;
  s2.oninput = onchange;
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

  const renderAll = () => {
    demos.forEach((demo) => demo.render());
  };

  setupControls(renderAll);
  renderAll();

  const onResize = () => {
    demos.forEach((demo) => demo.resize());
  };

  window.addEventListener("resize", onResize);
}

main().catch((err) => {
  console.error(err);
});
