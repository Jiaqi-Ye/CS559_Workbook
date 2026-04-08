// @ts-check

import * as THREE from "three";
import { uv, uniform, attribute, normalWorld, vec3 } from "three/tsl";
import * as InputHelpers from "CS559/inputHelpers.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import { makeBasicNodeMaterial, makeDemoWorld } from "./tsl-demo-utils.js";

const { box, world } = await makeDemoWorld("div1", "TSL Texture Lookup 10-08-03");

const radiusU = uniform(0.3);
const dotsU = uniform(4.0);
const lightU = uniform(new THREE.Color(1, 1, 1));
const darkU = uniform(new THREE.Color(0.2, 0.2, 0.7));
const dispU = uniform(0.2);
const blurU = uniform(0.06);

function fdot(uvNode) {
  const x = uvNode.x.mul(dotsU);
  const y = uvNode.y.mul(dotsU);
  const dx = x.sub(x.floor()).sub(0.5);
  const dy = y.sub(y.floor()).sub(0.5);
  const d = dx.mul(dx).add(dy.mul(dy)).sqrt();
  return d.smoothstep(radiusU.sub(blurU), radiusU.add(blurU)).oneMinus();
}

const dc = fdot(uv());
// Match GLSL exactly: mix(light, dark, dc) = light*(1-dc) + dark*dc.
const baseColor = lightU.mul(dc.oneMinus()).add(darkU.mul(dc));
const lightDir = vec3(1, 1, 1).normalize();
const bright = normalWorld.normalize().dot(lightDir).clamp(0.0, 1.0).add(0.2).clamp(0.0, 1.0);
const colorNode = baseColor.mul(bright);
const posNode = attribute("position", "vec3").add(attribute("normal", "vec3").mul(dispU).mul(dc));

const material = makeBasicNodeMaterial(colorNode, posNode);

const sphere = new SimpleObjects.GrSphere({ x: -2, y: 1, material });
const square = new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material });
world.add(sphere);
world.add(square);

const s1 = new InputHelpers.LabelSlider("dots", { width: 400, min: 1, max: 20, step: 0.5, initial: 4, where: box });
const s2 = new InputHelpers.LabelSlider("radius", { width: 400, min: 0.1, max: 0.5, step: 0.01, initial: 0.2, where: box });
const s5 = new InputHelpers.LabelSlider("blur", { width: 400, min: 0.001, max: 1.0, step: 0.02, initial: 0.06, where: box });
const s3 = new InputHelpers.LabelSlider("segs", { width: 400, min: 4, max: 64, step: 1, initial: 16, where: box });
const s4 = new InputHelpers.LabelSlider("disp", { width: 400, min: 0, max: 1.0, step: 0.05, initial: 0.1, where: box });

function onchange() {
  dotsU.value = Number(s1.value());
  radiusU.value = Number(s2.value());
  dispU.value = Number(s4.value());
  blurU.value = Number(s5.value());
}

s1.oninput = onchange;
s2.oninput = onchange;
s4.oninput = onchange;
s5.oninput = onchange;
onchange();

s3.oninput = () => {
  const m = Number(s3.value());
  sphere.setSegmentation(m, m - 2);
};
s3.oninput();

world.go();
