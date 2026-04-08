// @ts-check

import * as T from "three";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import { GrWorld } from "CS559-Framework/GrWorld.js";

class TrackCar extends GrObject {
  /**
   * @param {string} name
   * @param {number} radius
   * @param {number} speed
   * @param {number} phase
   * @param {number} color
   */
  constructor(name, radius, speed, phase, color) {
    const group = new T.Group();
    super(name, group);

    this.group = group;
    this.radius = radius;
    this.speed = speed;
    this.phase = phase;
    this.time = 0;

    const body = new T.Mesh(
      new T.BoxGeometry(1.35, 0.34, 0.72),
      new T.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.2 })
    );
    body.position.y = 0.34;
    group.add(body);

    const cabin = new T.Mesh(
      new T.BoxGeometry(0.62, 0.28, 0.56),
      new T.MeshStandardMaterial({ color: 0xd8e2dc, roughness: 0.7 })
    );
    cabin.position.set(-0.12, 0.62, 0);
    group.add(cabin);

    const wheelGeo = new T.CylinderGeometry(0.15, 0.15, 0.12, 16);
    const wheelMat = new T.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.9 });
    const wheelOffsets = [
      [-0.44, 0.15, 0.33],
      [0.44, 0.15, 0.33],
      [-0.44, 0.15, -0.33],
      [0.44, 0.15, -0.33],
    ];

    for (const [x, y, z] of wheelOffsets) {
      const wheel = new T.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      group.add(wheel);
    }
  }

  stepWorld(delta) {
    this.time += delta * 0.001;
    const theta = this.phase + this.time * this.speed;

    const x = this.radius * Math.cos(theta);
    const z = this.radius * Math.sin(theta);
    this.group.position.set(x, 0, z);

    // Tangent direction to circular path so cars face the direction of travel.
    this.group.rotation.y = -theta + Math.PI / 2;
  }
}

class DynamicMirrorController extends GrObject {
  /**
   * @param {GrWorld} world
   * @param {T.Mesh} mirror
   * @param {T.MeshStandardMaterial} mirrorMaterial
   * @param {T.CubeCamera} cubeCamera
   * @param {T.Texture | null} staticMap
   */
  constructor(world, mirror, mirrorMaterial, cubeCamera, staticMap) {
    const group = new T.Group();
    super("DynamicMirrorController", group);

    this.world = world;
    this.mirror = mirror;
    this.mirrorMaterial = mirrorMaterial;
    this.cubeCamera = cubeCamera;
    this.staticMap = staticMap;
    this.useDynamic = false;
  }

  setStaticMap(tex) {
    this.staticMap = tex;
    if (!this.useDynamic) {
      this.mirrorMaterial.envMap = tex;
      this.mirrorMaterial.needsUpdate = true;
    }
  }

  setDynamicEnabled(flag) {
    this.useDynamic = flag;

    this.mirrorMaterial.envMap = flag ? this.cubeCamera.renderTarget.texture : this.staticMap;
    this.mirrorMaterial.needsUpdate = true;
  }

  stepWorld() {
    if (!this.useDynamic) {
      return;
    }

    /** @type {T.WebGLRenderer} */
    // @ts-ignore GrWorld renderer is WebGL for this demo.
    const renderer = this.world.renderer;

    // Hide mirror while capturing to avoid self-reflection feedback.
    this.mirror.visible = false;
    this.cubeCamera.position.copy(this.mirror.position);
    this.cubeCamera.update(renderer, this.world.scene);
    this.mirror.visible = true;
  }
}

const parent = document.getElementById("div1");
const world = await GrWorld.new({ where: parent, groundplanesize: 18, groundplane:false });

world.camera.position.set(8.5, 6.5, 8.5);
world.camera.lookAt(0, 1, 0);

const ambient = new T.AmbientLight(0xffffff, 0.5);
const sun = new T.DirectionalLight(0xffffff, 1.1);
sun.position.set(6, 10, 4);
world.scene.add(ambient, sun);

const TRACK_RADIUS = 4.55;

const ground = new T.Mesh(
  new T.CircleGeometry(8, 64),
  new T.MeshStandardMaterial({ color: 0x3e6b48, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
world.scene.add(ground);

const track = new T.Mesh(
  new T.RingGeometry(TRACK_RADIUS - 0.65, TRACK_RADIUS + 0.65, 96),
  new T.MeshStandardMaterial({ color: 0x2f3136, roughness: 0.9 })
);
track.rotation.x = -Math.PI / 2;
track.position.y = 0.01;
world.scene.add(track);

const laneStripe = new T.Mesh(
  new T.RingGeometry(TRACK_RADIUS - 0.02, TRACK_RADIUS + 0.02, 96),
  new T.MeshBasicMaterial({ color: 0xf1f3f5 })
);
laneStripe.rotation.x = -Math.PI / 2;
laneStripe.position.y = 0.02;
world.scene.add(laneStripe);

const mirrorMaterial = new T.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1.0,
  roughness: 0.0,
});
const mirror = new T.Mesh(new T.SphereGeometry(1.05, 48, 28), mirrorMaterial);
mirror.position.set(0, 1.1, 0);
world.scene.add(mirror);

const pedestal = new T.Mesh(
  new T.CylinderGeometry(0.65, 0.85, 0.6, 32),
  new T.MeshStandardMaterial({ color: 0x6f4e37, roughness: 0.8 })
);
pedestal.position.set(0, 0.3, 0);
world.scene.add(pedestal);

world.add(new TrackCar("CarA", TRACK_RADIUS, 0.8, 0.0, 0xff4d6d));
world.add(new TrackCar("CarB", TRACK_RADIUS, 0.65, (2 * Math.PI) / 3, 0x4cc9f0));
world.add(new TrackCar("CarC", TRACK_RADIUS, 0.95, (4 * Math.PI) / 3, 0xffbe0b));

const cubeTarget = new T.WebGLCubeRenderTarget(512, {
  format: T.RGBAFormat,
  generateMipmaps: true,
  minFilter: T.LinearMipmapLinearFilter,
});
const cubeCamera = new T.CubeCamera(0.1, 100, cubeTarget);
world.scene.add(cubeCamera);

const controller = new DynamicMirrorController(world, mirror, mirrorMaterial, cubeCamera, null);
world.add(controller);

new EXRLoader().load("/textures/envmaps/daysky.exr", (texture) => {
  texture.mapping = T.EquirectangularReflectionMapping;
  world.scene.background = texture;
  world.scene.environment = texture;

  // Add a physical sky dome so dynamic CubeCamera captures include the same sky.
  const skyDome = new T.Mesh(
    new T.SphereGeometry(70, 40, 24),
    new T.MeshBasicMaterial({ map: texture, side: T.BackSide, toneMapped: false })
  );
  world.scene.add(skyDome);

  controller.setStaticMap(texture);
});

const toggleButton = document.getElementById("toggleEnv");
if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    controller.setDynamicEnabled(!controller.useDynamic);
    toggleButton.textContent = controller.useDynamic
      ? "Switch To Static Environment Map"
      : "Switch To Dynamic Environment Map";
  });
}

world.go();
