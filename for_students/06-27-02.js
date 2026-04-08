// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "CS559-Framework/shaderHelper.js";

let image = new T.TextureLoader().load("/textures/islands.png");

/**
 *
 * @param {GrObject} obj
 * @param {number} [speed=1] - rotations per second
 */
function spinY(obj, speed = 1) {
  obj.stepWorld = function (delta, timeOfDay) {
    obj.objects.forEach((obj) =>
      obj.rotateY(((speed * delta) / 1000) * Math.PI)
    );
  };
  return obj;
}

{
  let mydiv = document.getElementById("div1");

  let world = await GrWorld.new({
    width: mydiv ? 600 : 800,
    where: mydiv,
    lightColoring: "white",
    webgpu: false,
  });

  let shaderMat = shaderMaterial("./06-27-02.vs", "./06-27-02.fs", {
    side: T.DoubleSide,
    uniforms: {
      colormap: { value: image },
    },
  });

  console.log(shaderMat.uniforms.colormap);

  world.add(
    spinY(
      new SimpleObjects.GrSphere({
        x: -2,
        y: 1,
        widthSegments: 100,
        heightSegments: 100,
        material: shaderMat,
      })
    )
  );
  world.add(
    new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: shaderMat })
  );

  world.ambient.intensity = 1;

  world.go();
}

// 2026 Workbook
