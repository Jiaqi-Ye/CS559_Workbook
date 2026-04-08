// @ts-check

import * as THREE from "three";
import { texture, uv, attribute } from "three/tsl";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import { makeBasicNodeMaterial, makeDemoWorld } from "./tsl-demo-utils.js";

const image = new THREE.TextureLoader().load("/textures/islands.png");

const { world } = await makeDemoWorld("div1", "TSL Texture Lookup 10-08-02");

const h = texture(image, uv()).g;
const posNode = attribute("position", "vec3").add(attribute("normal", "vec3").mul(h).mul(0.4));
const colorNode = texture(image, uv()).rgb;
const material = makeBasicNodeMaterial(colorNode, posNode);

const sphere = new SimpleObjects.GrSphere({
  x: -2,
  y: 1,
  widthSegments: 100,
  heightSegments: 100,
  material,
});

sphere.stepWorld = (delta) => {
  sphere.objects.forEach((obj) => obj.rotateY((delta / 1000) * Math.PI));
};

world.add(sphere);
world.add(new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material }));

world.go();
