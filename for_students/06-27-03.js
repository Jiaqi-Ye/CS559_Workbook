// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "CS559-Framework/shaderHelper.js";


  let mydiv = document.getElementById("div1");

  let world = await GrWorld.new({ width: mydiv ? 600 : 800, where: mydiv, webgpu: false, });

  let shaderMat = shaderMaterial("./06-27-03.vs", "./06-27-03.fs", {
    side: T.DoubleSide,
    uniforms: {
      radius: { value: 0.3 },
      dots: { value: 4.0 },
      light: { value: new T.Vector3(1, 1, 1) },
      dark: { value: new T.Vector3(0.2, 0.2, 0.7) },
      disp: { value: 0.2 },
      blur: { value: 0.5 }
    },
  });

  let s1 = new InputHelpers.LabelSlider("dots", {
    width: 400,
    min: 1,
    max: 20,
    step: 0.5,
    initial: 4,
    where: mydiv,
  });
  let s2 = new InputHelpers.LabelSlider("radius", {
    width: 400,
    min: 0.1,
    max: 0.5,
    step: 0.01,
    initial: 0.2,
    where: mydiv,
  });
  let s5 = new InputHelpers.LabelSlider("blur", {
    width: 400,
    min: 0,
    max: 1.0,
    step: 0.02,
    initial: 0.06,
    where: mydiv,
  });
let s3 = new InputHelpers.LabelSlider("segs", {
    width: 400,
    min: 4,
    max: 64,
    step: 1,
    initial: 16,
    where: mydiv,
  });
  let s4 = new InputHelpers.LabelSlider("disp", {
    width: 400,
    min: 0,
    max: 1.0,
    step: .05,
    initial: .1,
    where: mydiv,
  });

  function onchange() {
    shaderMat.uniforms.dots.value = s1.value();
    shaderMat.uniforms.radius.value = s2.value();
    shaderMat.uniforms.disp.value = s4.value();
    shaderMat.uniforms.blur.value = s5.value();
  }
  s1.oninput = onchange;
  s2.oninput = onchange;
  s4.oninput = onchange;
  s5.oninput = onchange;
  onchange();

  let sphere = new SimpleObjects.GrSphere({ x: -2, y: 1, material: shaderMat });
  let square = new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: shaderMat });
  
  world.add(sphere);
  world.add(square);
  
  world.go();
  
  function onchangecomplexity() {
    let m = s3.value();
    sphere.setSegmentation(m,m-2);
  }
  s3.oninput = onchangecomplexity;
  onchangecomplexity();
// 2026 Workbook
