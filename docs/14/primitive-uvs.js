// @ts-check

/*
  Demo implemented by GitHub Copilot (GPT-5.3-Codex), directed by user request.
*/

import * as T from "three";
import { makeLabel } from "CS559-Framework/label.js";

const host = document.getElementById("demo");
if (!host) {
  throw new Error("Missing #demo container for primitive UV demo.");
}

const title = document.createElement("h3");
title.textContent = "Default UV Mapping On Three.js Primitives";
host.append(title);

const note = document.createElement("p");
note.className = "note";
note.textContent =
  "All shapes use UV_Grid_Sm.jpg with each geometry's default UV coordinates. Drag to orbit, and use the wheel to zoom.";
host.append(note);

const canvasWrap = document.createElement("div");
canvasWrap.className = "canvas-wrap";
host.append(canvasWrap);

const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasWrap.append(renderer.domElement);

const scene = new T.Scene();
scene.background = new T.Color("#f4f5f6");

const camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
const orbitTarget = new T.Vector3(0, -0.25, 0);
let orbitTheta = 0;
let orbitPhi = 1.05;
let orbitRadius = 12;

function updateCameraFromOrbit() {
  const sinPhi = Math.sin(orbitPhi);
  camera.position.set(
    orbitTarget.x + orbitRadius * sinPhi * Math.sin(orbitTheta),
    orbitTarget.y + orbitRadius * Math.cos(orbitPhi),
    orbitTarget.z + orbitRadius * sinPhi * Math.cos(orbitTheta)
  );
  camera.lookAt(orbitTarget);
}

updateCameraFromOrbit();

scene.add(new T.AmbientLight("white", 0.35));

const key = new T.DirectionalLight("white", 1.0);
key.position.set(5, 7, 4);
scene.add(key);

const fill = new T.DirectionalLight("#cfe8ff", 0.45);
fill.position.set(-6, 3, -2);
scene.add(fill);

setupOrbitInput(renderer.domElement);

const primitives = [
  {
    name: "Plane",
    geometry: () => new T.PlaneGeometry(1.8, 1.8, 1, 1)
  },
  {
    name: "Cylinder",
    geometry: () => new T.CylinderGeometry(0.75, 0.75, 1.7, 32, 1, false)
  },
  {
    name: "Cone",
    geometry: () => new T.ConeGeometry(0.8, 1.8, 32, 1, false)
  },
  {
    name: "Torus",
    geometry: () => new T.TorusGeometry(0.7, 0.25, 20, 48)
  },
  {
    name: "Capsule",
    geometry: () => new T.CapsuleGeometry(0.45, 1.0, 8, 20)
  },
  {
    name: "Ring",
    geometry: () => new T.RingGeometry(0.35, 0.9, 48, 1)
  },
  {
    name: "Tube",
    geometry: () => {
      const curve = new T.CatmullRomCurve3([
        new T.Vector3(-0.7, -0.5, 0),
        new T.Vector3(-0.2, 0.7, 0.3),
        new T.Vector3(0.25, -0.5, -0.3),
        new T.Vector3(0.8, 0.45, 0)
      ]);
      return new T.TubeGeometry(curve, 80, 0.2, 18, false);
    }
  },
  {
    name: "Sphere",
    geometry: () => new T.SphereGeometry(0.85, 32, 20)
  },
  {
    name: "Icosahedron",
    geometry: () => new T.IcosahedronGeometry(0.9, 0)
  },
  {
    name: "Box",
    geometry: () => new T.BoxGeometry(1.45, 1.45, 1.45)
  }
];

const meshes = [];
const texturePath = "/textures/UV_Grid_Sm.jpg";

new T.TextureLoader().load(texturePath, (uvTexture) => {
  uvTexture.colorSpace = T.SRGBColorSpace;

  const cols = 5;
  const spacingX = 2.45;
  const spacingY = 2.9;

  primitives.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const material = new T.MeshStandardMaterial({
      map: uvTexture,
      color: "white",
      roughness: 0.65,
      metalness: 0.05,
      side: T.DoubleSide
    });

    const mesh = new T.Mesh(item.geometry(), material);
    mesh.position.set((col - 2) * spacingX, 1.25 - row * spacingY, 0);
    scene.add(mesh);
    meshes.push(mesh);

    const label = makeLabel(item.name);
    label.position.set(mesh.position.x, mesh.position.y - 1.2, 0);
    scene.add(label);
  });

  render();
});

function resize() {
  const width = Math.max(320, Math.min(700, canvasWrap.clientWidth));
  const height = Math.round(width * 0.68);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function setupOrbitInput(element) {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  element.style.cursor = "grab";

  element.addEventListener("pointerdown", (evt) => {
    dragging = true;
    lastX = evt.clientX;
    lastY = evt.clientY;
    element.style.cursor = "grabbing";
    element.setPointerCapture(evt.pointerId);
  });

  element.addEventListener("pointermove", (evt) => {
    if (!dragging) {
      return;
    }

    const dx = evt.clientX - lastX;
    const dy = evt.clientY - lastY;
    lastX = evt.clientX;
    lastY = evt.clientY;

    orbitTheta -= dx * 0.006;
    orbitPhi -= dy * 0.006;
    orbitPhi = Math.max(0.2, Math.min(Math.PI - 0.2, orbitPhi));
    updateCameraFromOrbit();
  });

  element.addEventListener("pointerup", (evt) => {
    dragging = false;
    element.style.cursor = "grab";
    element.releasePointerCapture(evt.pointerId);
  });

  element.addEventListener("pointerleave", () => {
    dragging = false;
    element.style.cursor = "grab";
  });

  element.addEventListener(
    "wheel",
    (evt) => {
      evt.preventDefault();
      orbitRadius *= Math.exp(evt.deltaY * 0.0012);
      orbitRadius = Math.max(6.5, Math.min(22, orbitRadius));
      updateCameraFromOrbit();
    },
    { passive: false }
  );
}

function render() {
  resize();

  for (const mesh of meshes) {
    mesh.rotation.y += 0.008;
    mesh.rotation.x += 0.002;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);
