// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";

class BumpWall extends GrObject {
  /**
   * @param {T.Texture} bumpTex
   */
  constructor(bumpTex) {
    const geom = new T.BoxGeometry(3.0, 2.2, 0.3, 1, 1, 1);
    const mat = new T.MeshStandardMaterial({
      color: "#a8a8a8",
      roughness: 0.18,
      metalness: 0.0,
      bumpMap: bumpTex,
      bumpScale: 10
    });
    const mesh = new T.Mesh(geom, mat);
    super("BumpWall", mesh);
  }

  stepWorld(delta) {
    this.objects[0].rotation.y += delta * 0.00035;
  }
}

class NormalWall extends GrObject {
  /**
   * @param {T.Texture} normalTex
   */
  constructor(normalTex) {
    const geom = new T.BoxGeometry(3.0, 2.2, 0.3, 1, 1, 1);
    const mat = new T.MeshStandardMaterial({
      color: "#a8a8a8",
      roughness: 0.08,
      metalness: 0.0,
      normalMap: normalTex,
      normalScale: new T.Vector2(2.2, -2.2)
    });
    const mesh = new T.Mesh(geom, mat);
    super("NormalWall", mesh);
  }

  stepWorld(delta) {
    this.objects[0].rotation.y += delta * 0.00045;
  }
}

class CombinedWall extends GrObject {
  /**
   * @param {T.Texture} colorTex
   * @param {T.Texture} bumpTex
   */
  constructor(colorTex, bumpTex) {
    const geom = new T.BoxGeometry(2.4, 1.6, 0.25, 1, 1, 1);
    const mat = new T.MeshStandardMaterial({
      map: colorTex,
      bumpMap: bumpTex,
      bumpScale: 0.3,
      roughness: 0.2,
      metalness: 0.0,
      color: "#ffffff"
    });
    const mesh = new T.Mesh(geom, mat);
    super("CombinedWall", mesh);
  }

  stepWorld(delta) {
    this.objects[0].rotation.y += delta * 0.00025;
  }
}

let parentOfCanvas = document.getElementById("div1");
let box = InputHelpers.makeBoxDiv(
  { width: parentOfCanvas ? 640 : 820 },
  parentOfCanvas
);
if (!parentOfCanvas) {
  InputHelpers.makeBreak();
}
InputHelpers.makeHead("Normal Map and Bump Map Exercise", box);

let world = new GrWorld({ where: box, width: parentOfCanvas ? 600 : 800 });

// textures
const loader = new T.TextureLoader();

const bumpTex = loader.load("/images/bump-map.jpg");
bumpTex.colorSpace = T.NoColorSpace;
bumpTex.wrapS = T.RepeatWrapping;
bumpTex.wrapT = T.RepeatWrapping;
bumpTex.repeat.set(2.2, 1.6);

const bumpColor = loader.load("/images/bump-map.jpg");
bumpColor.colorSpace = T.SRGBColorSpace;
bumpColor.wrapS = T.RepeatWrapping;
bumpColor.wrapT = T.RepeatWrapping;
bumpColor.repeat.set(2.2, 1.6);

const normalTex = loader.load("/images/normal-map.jpg");
normalTex.colorSpace = T.NoColorSpace;
normalTex.wrapS = T.RepeatWrapping;
normalTex.wrapT = T.RepeatWrapping;
normalTex.repeat.set(1, 1);

// objects
const bumpObj = new BumpWall(bumpTex);
bumpObj.setPos(-2.1, 1.15, 0);
bumpObj.objects[0].rotation.y = Math.PI / 9;
world.add(bumpObj);

const normalObj = new NormalWall(normalTex);
normalObj.setPos(2.1, 1.15, 0);
normalObj.objects[0].rotation.y = -Math.PI / 9;
world.add(normalObj);

const comboObj = new CombinedWall(bumpColor, bumpTex);
comboObj.setPos(0, 1.0, -1.8);
comboObj.objects[0].rotation.y = Math.PI;
world.add(comboObj);

// ground
const groundMat = new T.MeshStandardMaterial({
  color: "#5c5c5c",
  roughness: 0.95,
  metalness: 0.0
});
const ground = new T.Mesh(
  new T.CylinderGeometry(4.5, 4.5, 0.18, 64),
  groundMat
);
ground.position.y = 0.09;
world.scene.add(ground);

// lighting
world.ambient.intensity = 0.04;

// moving rake light: this is the important one for showing normal-map detail
const movingLight = new T.DirectionalLight("white", 2.2);
movingLight.position.set(5.5, 1.2, 0.6);
world.scene.add(movingLight);

// a weak cool fill so shadows are not fully black
const fill = new T.PointLight("#9ab6ff", 0.18, 20);
fill.position.set(-3.5, 1.4, -3.0);
world.scene.add(fill);

// a mild warm side light for extra contrast
const side = new T.DirectionalLight("#ffd9a8", 0.45);
side.position.set(-4.0, 2.0, 1.5);
world.scene.add(side);

// animate the key light so highlights sweep across the walls
let t = 0;
const oldStep = world.stepWorld ? world.stepWorld.bind(world) : undefined;
world.stepWorld = function (delta, timeOfDay) {
  if (oldStep) oldStep(delta, timeOfDay);
  t += delta * 0.0012;
  movingLight.position.x = 5.5 * Math.cos(t);
  movingLight.position.z = 1.2 + 2.2 * Math.sin(t);
  movingLight.position.y = 1.2;
};

world.go();
