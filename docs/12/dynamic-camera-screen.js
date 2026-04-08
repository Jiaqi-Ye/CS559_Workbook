// @ts-check
// Dynamic camera-screen demo implemented by GitHub Copilot (GPT-5.3-Codex), directed by Prof. Gleicher.

import * as T from "three";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import { GrWorld } from "CS559-Framework/GrWorld.js";

/**
 * A moving target so the monitor feed has a clear subject to track.
 */
class MovingTarget extends GrObject {
  constructor() {
    const group = new T.Group();
    super("MovingTarget", group);

    this.group = group;
    this.time = 0;

    const core = new T.Mesh(
      new T.TorusKnotGeometry(0.6, 0.2, 120, 18),
      new T.MeshStandardMaterial({
        color: "#ff8d2e",
        metalness: 0.25,
        roughness: 0.3
      })
    );
    core.position.y = 1.6;
    group.add(core);
    this.core = core;

    const pedestal = new T.Mesh(
      new T.CylinderGeometry(0.35, 0.5, 1.2, 24),
      new T.MeshStandardMaterial({ color: "#2f4f8f", roughness: 0.75 })
    );
    pedestal.position.y = 0.6;
    group.add(pedestal);
  }

  stepWorld(delta) {
    this.time += delta * 0.001;
    this.group.position.set(
      2.7 * Math.cos(this.time * 0.7),
      0,
      2.7 * Math.sin(this.time * 0.9)
    );
    this.core.rotation.x += delta * 0.001;
    this.core.rotation.y += delta * 0.0015;
  }

  getFocusPoint() {
    return this.core.getWorldPosition(new T.Vector3());
  }
}

/**
 * A camera rig that visibly moves through the scene and points at the target.
 */
class CameraRig extends GrObject {
  constructor(target) {
    const group = new T.Group();
    super("CameraRig", group);

    this.group = group;
    this.target = target;
    this.time = 0;

    const rigMaterial = new T.MeshStandardMaterial({
      color: "#49d3b5",
      metalness: 0.15,
      roughness: 0.45
    });

    const body = new T.Mesh(new T.SphereGeometry(0.35, 20, 12), rigMaterial);
    body.layers.set(1);
    group.add(body);

    const boom = new T.Mesh(
      new T.CylinderGeometry(0.06, 0.06, 0.9, 10),
      new T.MeshStandardMaterial({ color: "#8efff0", roughness: 0.4 })
    );
    boom.rotation.z = Math.PI / 2;
    boom.position.z = -0.36;
    boom.layers.set(1);
    group.add(boom);

    const lens = new T.Mesh(
      new T.ConeGeometry(0.16, 0.4, 16),
      new T.MeshStandardMaterial({ color: "#112233", metalness: 0.8, roughness: 0.2 })
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.z = -0.82;
    lens.layers.set(1);
    group.add(lens);

    this.captureCamera = new T.PerspectiveCamera(55, 1, 0.1, 120);
    this.captureCamera.position.set(0, 0.08, -0.7);
    // The rig mesh points along +Z, but PerspectiveCamera looks down -Z by default.
    // Flip the camera's local heading so "forward" matches the visible lens direction.
    this.captureCamera.rotation.y = Math.PI;
    // Capture pass renders only layer 0, so it never sees monitor/camera helper objects.
    this.captureCamera.layers.set(0);
    group.add(this.captureCamera);

    const pathRing = new T.Mesh(
      new T.TorusGeometry(5.2, 0.02, 6, 96),
      new T.MeshBasicMaterial({ color: "#ffef8b" })
    );
    pathRing.rotation.x = Math.PI / 2;
    pathRing.position.y = 0.02;
    group.add(pathRing);
  }

  stepWorld(delta) {
    this.time += delta * 0.001;

    const px = 5.2 * Math.cos(this.time * 0.5);
    const py = 2.2 + 0.7 * Math.sin(this.time * 1.1);
    const pz = 5.2 * Math.sin(this.time * 0.5);
    this.group.position.set(px, py, pz);

    const lookAt = this.target.getFocusPoint();
    this.group.lookAt(lookAt);
  }
}

/**
 * A monitor in the scene that displays what the moving camera captures.
 */
class CameraScreen extends GrObject {
  constructor(world, captureCamera) {
    const group = new T.Group();
    super("CameraScreen", group);

    this.world = world;
    this.captureCamera = captureCamera;
    // Render target = off-screen texture that the capture camera draws into each frame.
    const TargetCtor = T.RenderTarget || T.WebGLRenderTarget;
    /** @type {any} */
    this.renderTarget = new TargetCtor(512, 512, {
      depthBuffer: true
    });

    if (/** @type {any} */ (this.world.renderer).isWebGPURenderer) {
      this.renderTarget.texture.repeat.set(1, -1);
      this.renderTarget.texture.offset.set(0, 1);
    }

    const frame = new T.Mesh(
      new T.BoxGeometry(7.2, 7.2, 0.25),
      new T.MeshStandardMaterial({ color: "#1f2430", roughness: 0.6, metalness: 0.2 })
    );
    frame.layers.set(1);
    group.add(frame);

    const screen = new T.Mesh(
      new T.PlaneGeometry(6.6, 6.6),
      // MeshBasicMaterial shows the texture "as-is" (not affected by scene lighting).
      new T.MeshBasicMaterial({ map: this.renderTarget.texture })
    );
    screen.position.z = 0.14;
    screen.layers.set(1);
    group.add(screen);

    this.screen = screen;

    group.position.set(-8, 4.2, 0);
    group.lookAt(0, 2, 0);

    // Main camera sees layer 1; capture camera only sees layer 0.
    // This avoids recursive "camera filming the monitor that shows the camera" feedback.
    this.world.camera.layers.enable(1);
  }

  stepWorld() {
    const renderer = this.world.renderer;
    const previousTarget = renderer.getRenderTarget();

    // Pass 1: render from the moving camera into the off-screen texture.
    // @ts-ignore RenderTarget is supported at runtime; local typings still expect WebGLRenderTarget.
    renderer.setRenderTarget(this.renderTarget);
    renderer.clear();
    renderer.render(this.world.scene, this.captureCamera);

    // Pass 2: restore the original destination so the framework can draw normally.
    renderer.setRenderTarget(previousTarget);
  }
}

const parentOfCanvas = document.getElementById("div1");
const world = await GrWorld.new({ where: parentOfCanvas, groundplanesize: 24 });
world.camera.position.set(11, 7, 10);
world.camera.lookAt(0, 2, 0);

// Load an equirectangular HDR texture for the world background and lighting.
// The mapping mode tells three.js how to project the panoramic EXR onto the scene.
new EXRLoader().load("/textures/envmaps/daysky.exr", (texture) => {
  texture.mapping = T.EquirectangularReflectionMapping;
  world.scene.background = texture;
  world.scene.environment = texture;
});

const ambient = new T.AmbientLight(0xffffff, 0.5);
const sun = new T.DirectionalLight(0xffffff, 1.2);
sun.position.set(6, 9, 3);
world.scene.add(ambient, sun);

for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const tower = new T.Mesh(
    new T.CylinderGeometry(0.22, 0.22, 2.6, 18),
    new T.MeshStandardMaterial({
      color: i % 2 === 0 ? "#ff4f5e" : "#4f89ff",
      roughness: 0.55,
      metalness: 0.1
    })
  );
  tower.position.set(7.5 * Math.cos(angle), 1.3, 7.5 * Math.sin(angle));
  world.scene.add(tower);
}

const movingTarget = new MovingTarget();
world.add(movingTarget);

const rig = new CameraRig(movingTarget);
world.add(rig);

const monitor = new CameraScreen(world, rig.captureCamera);
world.add(monitor);

// Helper makes it obvious which way the moving capture camera is pointing.
const helper = new T.CameraHelper(rig.captureCamera);
helper.layers.set(1);
world.scene.add(helper);

world.go();
