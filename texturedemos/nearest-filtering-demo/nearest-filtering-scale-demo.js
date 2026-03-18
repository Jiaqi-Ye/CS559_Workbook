// @ts-check
// Nearest-neighbor filtering artifact demo using scale motion.
// Implemented by GitHub Copilot (GPT-5.3-Codex), directed by Gleicher.

import * as T from "three";

//const TEXTURE_PATH = "/textures/simple64/checkerboard_gradient_2x2_64.png";
const TEXTURE_PATH = "/textures/simple64/checkerboard_2x2_3x3_64.png";

const CAMERA_FOV = 45;
const TEXTURE_REPEAT = 1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 1.0;

const scaleInput = /** @type {HTMLInputElement} */ (document.getElementById("scale"));
const scaleOut = /** @type {HTMLOutputElement} */ (document.getElementById("scale-out"));
const toggleButton = /** @type {HTMLButtonElement} */ (document.getElementById("toggle-animation"));

/**
 * @typedef {object} Panel
 * @property {HTMLDivElement} host
 * @property {T.WebGLRenderer} renderer
 * @property {T.Scene} scene
 * @property {T.PerspectiveCamera} camera
 * @property {T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial>} mesh
 */

const panelDefs = [
  { hostId: "nearest-host" },
  { hostId: "mipmap-host" },
  { hostId: "aniso-host" }
];

/** @type {Panel[]} */
const panels = [];

let nearestTexture;
let mipTexture;
let anisoTexture;
let isAnimating = true;
let squareScale = MAX_SCALE;

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

  scaleInput.addEventListener("input", () => {
    squareScale = Number(scaleInput.value);
    isAnimating = false;
    toggleButton.textContent = "Resume Animation";
    updateScaleText();
    renderAll();
  });

  toggleButton.addEventListener("click", () => {
    isAnimating = !isAnimating;
    toggleButton.textContent = isAnimating ? "Pause Animation" : "Resume Animation";
  });

  updateScaleText();
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

  const geometry = new T.PlaneGeometry(1, 1);
  const material = new T.MeshBasicMaterial({ color: "white" });
  const mesh = new T.Mesh(geometry, material);
  scene.add(mesh);

  return { host, renderer, scene, camera, mesh };
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

function updateScaleText() {
  scaleOut.textContent = squareScale.toFixed(3);
  scaleInput.value = String(squareScale);
}

function loop(timeMs) {
  if (isAnimating) {
    // Oscillate uniformly between full size and one quarter size.
    const phase = timeMs * 0.001;
    squareScale = MIN_SCALE + (Math.sin(phase) * 0.5 + 0.5) * (MAX_SCALE - MIN_SCALE);
    updateScaleText();
  }

  renderAll();
  requestAnimationFrame(loop);
}

function renderAll() {
  for (const panel of panels) {
    panel.mesh.scale.set(squareScale, squareScale, 1);
    panel.renderer.render(panel.scene, panel.camera);
  }
}