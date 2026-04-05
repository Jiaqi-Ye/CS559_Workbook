// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";

class MappedSphere extends GrObject {
  /**
   * @param {T.Texture} ormTex
   */
  constructor(ormTex) {
    const geom = new T.SphereGeometry(1.2, 64, 32);
    const mat = new T.MeshStandardMaterial({
      color: "#9a9a9a",
      roughness: 1.0,
      metalness: 1.0,
      roughnessMap: ormTex,
      metalnessMap: ormTex
    });

    const mesh = new T.Mesh(geom, mat);
    super("MappedSphere", mesh);
  }

  stepWorld(delta) {
    const obj = this.objects[0];
    obj.rotation.y += delta * 0.0006;
    obj.rotation.x += delta * 0.00035;
  }
}

let parentOfCanvas = document.getElementById("div1");
let box = InputHelpers.makeBoxDiv({ width: parentOfCanvas ? 640 : 820 }, parentOfCanvas);
if (!parentOfCanvas) {
  InputHelpers.makeBreak();
}
InputHelpers.makeHead("Material Property Map Demo", box);

const world = new GrWorld({ width: parentOfCanvas ? 600 : 800, where: box });

const ormTex = new T.TextureLoader().load("/images/map.jpg");
ormTex.colorSpace = T.NoColorSpace;
ormTex.wrapS = T.RepeatWrapping;
ormTex.wrapT = T.RepeatWrapping;
ormTex.repeat.set(2, 2);

const sphere = new MappedSphere(ormTex);
sphere.setPos(0, 1.3, 0);
world.add(sphere);

const groundMat = new T.MeshStandardMaterial({
  color: "#6f6f6f",
  roughness: 0.9,
  metalness: 0.0
});
const ground = new T.Mesh(new T.CylinderGeometry(3.2, 3.2, 0.2, 64), groundMat);
ground.position.y = 0.1;
world.scene.add(ground);

world.ambient.intensity = 0.35;

const key = new T.DirectionalLight("white", 1.1);
key.position.set(4, 6, 3);
world.scene.add(key);

const rim = new T.PointLight("#a0c8ff", 0.8, 20);
rim.position.set(-4, 2.5, -3);
world.scene.add(rim);

world.go();

// 2026 Workbook
