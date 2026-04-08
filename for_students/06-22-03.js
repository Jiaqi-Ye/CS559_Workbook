// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "CS559-Framework/shaderHelper.js";

{
  let mydiv = document.getElementById("div1");

  let world = await GrWorld.new({ width: mydiv ? 600 : 800, where: mydiv, webgpu: false, });
  
  let shaderMat = shaderMaterial("./06-22-03.vs", "./06-22-03.fs", {
    side: T.DoubleSide,
  });

  world.add(new SimpleObjects.GrSphere({ x: -2, y: 1, material: shaderMat }));
  world.add(
    new SimpleObjects.GrCube({ x: 2, y: 1, size: 1.5, material: shaderMat })
  );

  world.go();
}

// 2026 Workbook
