// @ts-check

import * as THREE from "three";
import { uv, uniform } from "three/tsl";
import * as InputHelpers from "CS559/inputHelpers.js";
import { addSphereAndSign, makeBasicNodeMaterial, makeDemoWorld } from "./tsl-demo-utils.js";

const { box, world } = await makeDemoWorld("stripes1", "TSL Stripes 1 - simple");

const stripesU = uniform(10.0);
const swU = uniform(0.5);
const color1U = uniform(new THREE.Color(1, 0.6, 0));
const color2U = uniform(new THREE.Color(0, 0.4, 0.4));

const su = uv().x.mul(stripesU).fract();
const st = su.step(swU);
const colorNode = color1U.mix(color2U, st);

const material = makeBasicNodeMaterial(colorNode);

new InputHelpers.LabelSlider("Stripes", {
  min: 2,
  max: 50,
  initial: 10,
  step: 1,
  where: box,
  display: "inline",
}).oninput = (s) => {
  stripesU.value = Number(s.value());
};

new InputHelpers.LabelSlider("Width", {
  min: 0,
  max: 1,
  initial: 0.5,
  step: 0.05,
  where: box,
  display: "inline",
}).oninput = (s) => {
  swU.value = Number(s.value());
};

addSphereAndSign(world, material);
world.go();
