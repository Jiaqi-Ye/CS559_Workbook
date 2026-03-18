// @ts-check
// Nearest-neighbor filtering artifact demo.
// Implemented by GitHub Copilot (GPT-5.3-Codex), directed by Gleicher.

import * as T from "three";

//const TEXTURE_PATH = "/textures/simple64/checkerboard_gradient_2x2_64.png";
const TEXTURE_PATH = "/textures/simple64/checkerboard_2x2_3x3_64.png";

const CAMERA_FOV = 45;
const MAX_TILT = 80;
const TEXTURE_REPEAT = 1;

const tiltInput = /** @type {HTMLInputElement} */ (document.getElementById("tilt"));
const tiltOut = /** @type {HTMLOutputElement} */ (document.getElementById("tilt-out"));
const toggleButton = /** @type {HTMLButtonElement} */ (document.getElementById("toggle-animation"));

const panelDefs = [
  { hostId: "nearest-host", label: "nearest" },
  { hostId: "mipmap-host", label: "mipmap" },
  { hostId: "aniso-host", label: "aniso" }
];

/**
 * @typedef {object} Panel
 * @property {HTMLDivElement} host
 * @property {T.WebGLRenderer} renderer
 * @property {T.Scene} scene
 * @property {T.PerspectiveCamera} camera
 * @property {T.Group} pivot
 * @property {T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial>} mesh
 */

/** @type {Panel[]} */
const panels = [];

let nearestTexture;
let mipTexture;
let anisoTexture;
let isAnimating = true;
let tiltDeg = 0;

init().catch((err) => {
  console.error(err);
});

async function init() {
  const loader = new T.TextureLoader();
  const sourceTexture = await loader.loadAsync(TEXTURE_PATH);
  applyCommonTextureSettings(sourceTexture);

  nearestTexture = sourceTexture.clone();
  applyCommonTextureSettings(nearestTexture);
  configureNearest(nearestTexture);

  mipTexture = sourceTexture.clone();
  applyCommonTextureSettings(mipTexture);
  configureMipLinear(mipTexture, 1);

  anisoTexture = sourceTexture.clone();
  applyCommonTextureSettings(anisoTexture);

  for (const def of panelDefs) {
    const host = /** @type {HTMLDivElement} */ (document.getElementById(def.hostId));
    const panel = makePanel(host);
    panels.push(panel);
  }

  const maxAnisotropy = Math.max(1, panels[0].renderer.capabilities.getMaxAnisotropy());
  configureMipLinear(anisoTexture, maxAnisotropy);

  setPanelTexture(panels[0], nearestTexture);
  setPanelTexture(panels[1], mipTexture);
  setPanelTexture(panels[2], anisoTexture);

  for (const panel of panels) {
    resizePanel(panel);
  }

  window.addEventListener("resize", () => {
    for (const panel of panels) {
      resizePanel(panel);
    }
    renderAll();
  });

  tiltInput.addEventListener("input", () => {
    tiltDeg = Number(tiltInput.value);
    isAnimating = false;
    toggleButton.textContent = "Resume Animation";
    updateTiltText();
    renderAll();
  });

  toggleButton.addEventListener("click", () => {
    isAnimating = !isAnimating;
    toggleButton.textContent = isAnimating ? "Pause Animation" : "Resume Animation";
  });

  updateTiltText();
  requestAnimationFrame(loop);
}

/** @returns {Panel} */
function makePanel(host) {
  const renderer = new T.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(1);
  host.appendChild(renderer.domElement);

  const scene = new T.Scene();
  scene.background = new T.Color("#10161c");

  const camera = new T.PerspectiveCamera(CAMERA_FOV, 1, 0.01, 100);
  const cameraDistance = 1 / (2 * Math.tan(T.MathUtils.degToRad(CAMERA_FOV * 0.5)));
  camera.position.set(0, 0, cameraDistance);
  camera.lookAt(0, 0, 0);

  const pivot = new T.Group();
  pivot.position.y = -0.5;
  scene.add(pivot);

  const geometry = new T.PlaneGeometry(1, 1);
  const material = new T.MeshBasicMaterial({ color: "white" });
  const mesh = new T.Mesh(geometry, material);
  mesh.position.y = 0.5;
  pivot.add(mesh);

  return { host, renderer, scene, camera, pivot, mesh };
}

function resizePanel(panel) {
  const side = Math.max(64, Math.floor(panel.host.clientWidth));
  panel.renderer.setSize(side, side, false);
  panel.camera.aspect = 1;
  panel.camera.updateProjectionMatrix();
}

function configureNearest(texture) {
  texture.generateMipmaps = false;
  texture.magFilter = T.NearestFilter;
  texture.minFilter = T.NearestFilter;
  texture.anisotropy = 1;
  texture.needsUpdate = true;
}

function applyCommonTextureSettings(texture) {
  texture.wrapS = T.RepeatWrapping;
  texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
  texture.needsUpdate = true;
}

function configureMipLinear(texture, anisotropy) {
  texture.generateMipmaps = true;
  texture.magFilter = T.LinearFilter;
  texture.minFilter = T.LinearMipmapLinearFilter;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
}

function setPanelTexture(panel, texture) {
  panel.mesh.material.map = texture;
  panel.mesh.material.needsUpdate = true;
}

function updateTiltText() {
  tiltOut.textContent = `${tiltDeg.toFixed(1)}°`;
  tiltInput.value = String(tiltDeg);
}

function loop(timeMs) {
  if (isAnimating) {
    // Oscillate between 0 and MAX_TILT so the onset of aliasing is easy to compare.
    const phase = timeMs * 0.0008;
    tiltDeg = (Math.sin(phase) * 0.5 + 0.5) * MAX_TILT;
    updateTiltText();
  }

  renderAll();
  requestAnimationFrame(loop);
}

function renderAll() {
  const tiltRad = T.MathUtils.degToRad(tiltDeg);
  for (const panel of panels) {
    panel.pivot.rotation.x = -tiltRad;
    panel.renderer.render(panel.scene, panel.camera);
  }
}