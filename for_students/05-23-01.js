// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";

let parentOfCanvas = document.getElementById("div1");
let world = new GrWorld({ where: parentOfCanvas });

// Environment map (equirectangular) for skybox/background
const envTexture = new T.TextureLoader().load("../images/evn.jpg");
envTexture.mapping = T.EquirectangularReflectionMapping;
envTexture.colorSpace = T.SRGBColorSpace;
world.scene.background = envTexture;
world.scene.environment = envTexture;

// Simple objects on the ground plane
class GrSimpleObject extends GrObject {
  constructor(name, mesh, x, y, z) {
    mesh.position.set(x, y, z);
    super(name, mesh);
  }
}

const shinyMat = new T.MeshStandardMaterial({
  color: "#9ec5ff",
  metalness: 0.85,
  roughness: 0.2
});

const matteMat = new T.MeshStandardMaterial({
  color: "#d46a6a",
  metalness: 0.1,
  roughness: 0.7
});

const accentMat = new T.MeshStandardMaterial({
  color: "#7bd88f",
  metalness: 0.2,
  roughness: 0.5
});

// Make the objects clearly above the ground and more separated

const sphere = new T.Mesh(new T.SphereGeometry(0.6, 32, 16), shinyMat);
world.add(new GrSimpleObject("ShinySphere", sphere, -2.5, 1.5, -1.2));

const box = new T.Mesh(new T.BoxGeometry(1, 1, 1), matteMat);
world.add(new GrSimpleObject("MatteBox", box, 2.3, 1.3, -1.0));

const torus = new T.Mesh(
  new T.TorusKnotGeometry(0.4, 0.15, 100, 16),
  accentMat
);
world.add(new GrSimpleObject("AccentTorus", torus, 0.0, 2.1, 2.0));

world.go();
