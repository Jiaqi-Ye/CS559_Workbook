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

  let shaderMat = shaderMaterial("./06-24-01.vs", "./06-24-01.fs", {
    side: T.DoubleSide,
    uniforms: {
      radius: { value: 0.3 },
      dots: { value: 4.0 },
      blur: { value: 0.0 },
      light: { value: new T.Vector3(1, 1, 1) },
      dark: { value: new T.Vector3(0.2, 0.2, 0.7) },
    },
  });

  let select = InputHelpers.makeSelect(
    ["no anti-aliasing", "light blur", "large blur", "correct anti-aliasing"],
    mydiv,
    "no anti-aliasing"
  );
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

  function onchange() {
    shaderMat.uniforms.dots.value = s1.value();
    shaderMat.uniforms.radius.value = s2.value();
    if (select.value == "light blur") shaderMat.uniforms.blur.value = 0.1;
    else if (select.value == "large blur") shaderMat.uniforms.blur.value = 0.3;
    else if (select.value == "correct anti-aliasing")
      shaderMat.uniforms.blur.value = -1;
    else shaderMat.uniforms.blur.value = 0;
  }
  s1.oninput = onchange;
  s2.oninput = onchange;
  select.oninput = onchange;
  onchange();

  world.add(new SimpleObjects.GrSphere({ x: -2, y: 1, material: shaderMat }));
  world.add(
    new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: shaderMat })
  );

  world.go();
}

// 2026 Workbook
