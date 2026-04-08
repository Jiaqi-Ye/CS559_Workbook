// @ts-check

import * as THREE from "three";
import { uniform, attribute, vec4 } from "three/tsl";
import * as InputHelpers from "CS559/inputHelpers.js";
import { addSphereAndSign, makeBasicNodeMaterial, makeDemoWorld } from "./tsl-demo-utils.js";

const { box, world } = await makeDemoWorld("wood3", "TSL Wood 3A (transformable wood coordinates)");

let tx = 0;
let ty = 0;
let tz = 0;
let ts = 1.0;
let trotx = 0;
let troty = 0;
let trotz = 0;

const stripesU = uniform(4.0);
const swU = uniform(0.5);
const blurU = uniform(-0.05);
const color2U = uniform(new THREE.Color("#997950"));
const color1U = uniform(new THREE.Color("#4B3A26"));
const woodTransU = uniform(new THREE.Matrix4());

function updateMatrix() {
  const q = new THREE.Quaternion(1, 0, 0, 0);
  q.setFromEuler(new THREE.Euler(trotx, troty, trotz));
  woodTransU.value.compose(new THREE.Vector3(tx, ty, tz), q, new THREE.Vector3(ts, ts, ts));
}

const p = woodTransU.mul(vec4(attribute("position", "vec3"), 1.0));
const nu = p.x.mul(stripesU);
const nv = p.y.mul(stripesU);

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
  min: 1,
  max: 20,
  initial: 4,
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
  min: -0.1,
  max: 0.1,
  initial: -0.05,
  step: 0.01,
  where: box,
  display: "inline",
}).oninput = (s) => {
  blurU.value = Number(s.value());
};

new InputHelpers.LabelSlider("transf X", { min: -4, max: 4, initial: tx, step: 0.25, where: box, display: "inline" }).oninput = (s) => {
  tx = Number(s.value());
  updateMatrix();
};
new InputHelpers.LabelSlider("transf Y", { min: -4, max: 4, initial: ty, step: 0.25, where: box, display: "inline" }).oninput = (s) => {
  ty = Number(s.value());
  updateMatrix();
};
new InputHelpers.LabelSlider("transf Z", { min: -4, max: 4, initial: tz, step: 0.25, where: box, display: "inline" }).oninput = (s) => {
  tz = Number(s.value());
  updateMatrix();
};
new InputHelpers.LabelSlider("transf S", { min: 0.1, max: 2, initial: ts, step: 0.1, where: box, display: "inline" }).oninput = (s) => {
  ts = Number(s.value());
  updateMatrix();
};
new InputHelpers.LabelSlider("transf rotX", { min: -2, max: 2, initial: trotx, step: 0.1, where: box, display: "inline" }).oninput = (s) => {
  trotx = Number(s.value());
  updateMatrix();
};
new InputHelpers.LabelSlider("transf rotY", { min: -2, max: 2, initial: troty, step: 0.1, where: box, display: "inline" }).oninput = (s) => {
  troty = Number(s.value());
  updateMatrix();
};
new InputHelpers.LabelSlider("transf rotZ", { min: -2, max: 2, initial: trotz, step: 0.1, where: box, display: "inline" }).oninput = (s) => {
  trotz = Number(s.value());
  updateMatrix();
};

updateMatrix();
addSphereAndSign(world, material);
world.go();
