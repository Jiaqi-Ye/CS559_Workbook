// @ts-check

import * as THREE from "three";
import { uv, uniform } from "three/tsl";
import * as InputHelpers from "CS559/inputHelpers.js";
import { addSphereAndSign, makeBasicNodeMaterial, makeDemoWorld } from "./tsl-demo-utils.js";

const { box, world } = await makeDemoWorld("wood2b", "TSL Wood 2B");

const stripesU = uniform(10.0);
const swU = uniform(0.5);
const blurU = uniform(-0.01);
const color1U = uniform(new THREE.Color("#997950"));
const color2U = uniform(new THREE.Color("#4B3A26"));

const thickFrequency = 2.0;
const thickAmount = 0.2;
const radialFreq = 4.0;
const radialAmount = 1.0;

function noise1D(u, freq) {
  const uf = u.mul(freq);
  const n0 = uf.floor().mul(2000.0).sin().mul(12345.0).div(2.0).add(0.5).fract();
  const n1 = uf.ceil().mul(2000.0).sin().mul(12345.0).div(2.0).add(0.5).fract();
  const a0 = uf.fract();
  const a = a0.mul(a0).mul(a0.mul(-2.0).add(3.0));
  return n0.mul(a.oneMinus()).add(n1.mul(a));
}

const nu = uv().x.sub(0.5).mul(stripesU);
const nv = uv().y.sub(0.5).mul(stripesU);
const dist = nu.mul(nu).add(nv.mul(nv)).sqrt();
const angle = nv.div(nu.abs().add(0.0001)).atan();

const d = dist.add(noise1D(angle, radialFreq).mul(radialAmount));
const su = d.fract();
const dst = su.sub(0.5).abs().add(noise1D(angle.add(dist.mul(2.0)), thickFrequency).mul(thickAmount));
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
