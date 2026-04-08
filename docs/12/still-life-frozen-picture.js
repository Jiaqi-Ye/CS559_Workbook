// @ts-check

import * as T from "three";
import { GrObject } from "CS559-Framework/GrObject.js";
import { GrWorld } from "CS559-Framework/GrWorld.js";

/**
 * Capture the main camera's view once and keep it as a frozen texture.
 */
class FrozenPictureCapture extends GrObject {
  /**
   * @param {GrWorld} world
   * @param {T.MeshBasicMaterial} pictureMaterial
   */
  constructor(world, pictureMaterial) {
    const group = new T.Group();
    super("FrozenPictureCapture", group);
    this.world = world;
    this.pictureMaterial = pictureMaterial;
    this.captured = false;
    const TargetCtor = T.RenderTarget || T.WebGLRenderTarget;
    /** @type {any} */
    this.target = new TargetCtor(1024, 1024, { depthBuffer: true });

    // WebGPU render-target textures appear vertically inverted with this UV layout.
    // Use explicit UV transform so orientation is stable across backends.
    if (/** @type {any} */ (this.world.renderer).isWebGPURenderer) {
      this.target.texture.repeat.set(1, -1);
      this.target.texture.offset.set(0, 1);
    }
  }

  stepWorld() {
    if (this.captured) {
      return;
    }

    /** @type {T.WebGLRenderer} */
    // @ts-ignore GrWorld renderer may be WebGL or WebGPU.
    const renderer = this.world.renderer;
    const scene = this.world.scene;
    const camera = this.world.camera;

    const previousTarget = renderer.getRenderTarget();

    // Hide the picture while capturing to avoid a feedback artifact.
    this.pictureMaterial.visible = false;

    // @ts-ignore RenderTarget is supported at runtime; local typings still expect WebGLRenderTarget.
    renderer.setRenderTarget(this.target);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(previousTarget);

    this.pictureMaterial.map = this.target.texture;
    this.pictureMaterial.needsUpdate = true;
    this.pictureMaterial.visible = true;

    this.captured = true;
  }
}

class SpinningKnot extends GrObject {
  constructor() {
    const mesh = new T.Mesh(
      new T.TorusKnotGeometry(0.22, 0.075, 120, 20),
      new T.MeshStandardMaterial({
        color: 0xd000ff,
        emissive: 0x6b00a8,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.25,
      })
    );
    mesh.position.set(-0.15, 1.72, 0.45);
    super("SpinningKnot", mesh);
    this.mesh = mesh;
  }

  stepWorld(delta) {
    const dt = delta * 0.001;
    this.mesh.rotateY(dt * 1.6);
    this.mesh.rotateX(dt * 0.9);
  }
}

const parentOfCanvas = document.getElementById("div1");
const world = await GrWorld.new({ where: parentOfCanvas, groundplanesize: 20 });

world.camera.position.set(5.2, 3.3, 6.2);
world.camera.lookAt(0, 1.3, 0);

world.scene.background = new T.Color(0xdde5f0);

const ambient = new T.AmbientLight(0xffffff, 0.6);
const key = new T.DirectionalLight(0xffffff, 1.0);
key.position.set(4, 8, 3);
world.scene.add(ambient, key);

const tableTop = new T.Mesh(
  new T.BoxGeometry(6, 0.3, 3.2),
  new T.MeshStandardMaterial({ color: 0xb08968, roughness: 0.85 })
);
tableTop.position.set(0, 1.2, 0);
world.scene.add(tableTop);

for (const sx of [-2.5, 2.5]) {
  for (const sz of [-1.25, 1.25]) {
    const leg = new T.Mesh(
      new T.BoxGeometry(0.22, 1.2, 0.22),
      new T.MeshStandardMaterial({ color: 0x7f5539, roughness: 0.9 })
    );
    leg.position.set(sx, 0.6, sz);
    world.scene.add(leg);
  }
}

const wall = new T.Mesh(
  new T.PlaneGeometry(12, 6),
  new T.MeshStandardMaterial({ color: 0xebe4da, roughness: 0.95 })
);
wall.position.set(0, 3, -4.4);
world.scene.add(wall);

const pictureFrame = new T.Mesh(
  new T.BoxGeometry(3.8, 2.6, 0.16),
  new T.MeshStandardMaterial({ color: 0x2f2f2f, roughness: 0.6, metalness: 0.2 })
);
pictureFrame.position.set(0, 2.7, -4.15);
world.scene.add(pictureFrame);

const pictureMaterial = new T.MeshBasicMaterial({ color: 0xffffff });
const picture = new T.Mesh(new T.PlaneGeometry(3.4, 2.2), pictureMaterial);
picture.position.set(0, 2.7, -4.05);
world.scene.add(picture);

const vase = new T.Mesh(
  new T.CylinderGeometry(0.3, 0.2, 1.0, 24),
  new T.MeshStandardMaterial({ color: 0x4a7c8c, roughness: 0.35, metalness: 0.1 })
);
vase.position.set(-0.9, 1.75, -0.25);
world.scene.add(vase);

const bowl = new T.Mesh(
  new T.SphereGeometry(0.48, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
  new T.MeshStandardMaterial({ color: 0xd58f4b, roughness: 0.55 })
);
bowl.position.set(1.0, 1.48, 0.2);
world.scene.add(bowl);

const fruitA = new T.Mesh(
  new T.SphereGeometry(0.24, 20, 16),
  new T.MeshStandardMaterial({ color: 0xd73a31, roughness: 0.4 })
);
fruitA.position.set(0.84, 1.63, 0.22);
world.scene.add(fruitA);

const fruitB = new T.Mesh(
  new T.SphereGeometry(0.2, 20, 16),
  new T.MeshStandardMaterial({ color: 0xf0c808, roughness: 0.45 })
);
fruitB.position.set(1.18, 1.6, 0.08);
world.scene.add(fruitB);

const fruitC = new T.Mesh(
  new T.SphereGeometry(0.18, 20, 16),
  new T.MeshStandardMaterial({ color: 0x77a64a, roughness: 0.45 })
);
fruitC.position.set(1.02, 1.58, 0.45);
world.scene.add(fruitC);

const candle = new T.Mesh(
  new T.CylinderGeometry(0.12, 0.12, 0.8, 20),
  new T.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.75 })
);
candle.position.set(0.2, 1.7, -0.4);
world.scene.add(candle);

world.add(new SpinningKnot());
world.add(new FrozenPictureCapture(world, pictureMaterial));

world.go();
