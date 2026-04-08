// @ts-check

import * as THREE from "three";
import { uv, uniform } from "three/tsl";
import * as InputHelpers from "CS559/inputHelpers.js";
import { addSphereAndSign, makeBasicNodeMaterial, makeDemoWorld } from "./tsl-demo-utils.js";

const { box, world } = await makeDemoWorld("stripes2", "TSL Stripes 2 - anti-aliased");

const stripesU = uniform(10.0);
const swU = uniform(0.5);
const blurU = uniform(-0.01);
const color1U = uniform(new THREE.Color(1, 0.6, 0));
const color2U = uniform(new THREE.Color(0, 0.4, 0.4));

const su = uv().x.mul(stripesU).fract();
const useManualBlur = blurU.add(0.000001).sign().add(1.0).mul(0.5);
const adaptiveBlur = su.fwidth().mul(useManualBlur.oneMinus()).add(blurU.mul(useManualBlur));
const st = su.smoothstep(swU.sub(adaptiveBlur), swU.add(adaptiveBlur));
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

new InputHelpers.LabelSlider("Blur", {
  min: -0.01,
  max: 0.1,
  initial: -0.01,
  step: 0.01,
  where: box,
  display: "inline",
}).oninput = (s) => {
  blurU.value = Number(s.value());
};

addSphereAndSign(world, material);
world.go();
