// @ts-check

import * as THREE from "three";
import { uv, uniform } from "three/tsl";
import * as InputHelpers from "CS559/inputHelpers.js";
import { addSphereAndSign, makeBasicNodeMaterial, makeDemoWorld } from "./tsl-demo-utils.js";

const { box, world } = await makeDemoWorld("stripes3", "TSL Stripes 3 - two-sided anti-alias");

const stripesU = uniform(10.0);
const swU = uniform(0.5);
const blurU = uniform(-0.01);
const color1U = uniform(new THREE.Color(1, 0.6, 0));
const color2U = uniform(new THREE.Color(0, 0.4, 0.4));

const su = uv().x.mul(stripesU).fract();
const dst = su.sub(0.5).abs();
// Match GLSL: a = (blur >= 0.0) ? blur : fwidth(dst)
// Build a numeric mask to avoid any ambiguity in step() argument order.
const useManualBlur = blurU.add(0.000001).sign().add(1.0).mul(0.5);
const adaptiveBlur = dst.fwidth().mul(useManualBlur.oneMinus()).add(blurU.mul(useManualBlur));
const h = swU.mul(0.5);
const st = dst.smoothstep(h.sub(adaptiveBlur), h.add(adaptiveBlur));
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
