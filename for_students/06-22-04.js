// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "CS559-Framework/shaderHelper.js";

{
  let mydiv = document.getElementById("div1");

  let world = await GrWorld.new({ width: mydiv ? 600 : 800, where: mydiv, webgpu: false, });

  let shaderMat = shaderMaterial("./06-22-04.vs", "./06-22-04.fs", {
    side: T.DoubleSide,
    uniforms: {
      shininess: { value: 0.5 },
    },
  });

  let slider = new InputHelpers.LabelSlider("shine", {
    width: 400,
    min: 0,
    max: 2,
    step: 0.01,
    initial: 0.5,
    where: mydiv,
  });
  function onchange() {
    shaderMat.uniforms.shininess.value = slider.value();
  }
  slider.oninput = onchange;
  onchange();
  
  world.add(new SimpleObjects.GrSphere({ x: -2, y: 1, material: shaderMat }));
  world.add(
    new SimpleObjects.GrCube({ x: 2, y: 1, size: 1.5, material: shaderMat })
  );

  world.go();
}

// 2026 Workbook
