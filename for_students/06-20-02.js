// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "CS559-Framework/shaderHelper.js";

/**
 *
 * @param {GrObject} obj
 * @param {number} [speed=1] - rotations per second
 */
function spinY(obj, speed = 0) {
  obj.stepWorld = function (delta, timeOfDay) {
    obj.objects.forEach((obj) =>
      obj.rotateY(((speed * delta) / 1000) * Math.PI)
    );
  };
  return obj;
}

{
  let mydiv = document.getElementById("div1");

  let world = await GrWorld.new({ width: 640, where: mydiv, webgpu: false });

  // Shader 0 - solid color
  /* use the simplest shader pair */
  let mat0 = shaderMaterial("./06-20-02-2.vs", "./06-20-02-2.fs");
  world.add(new SimpleObjects.GrCube({ material: mat0, x: -3, y: 1 }));

  // Shader 1 - solid color, passed by uniform
  /* next up - shader pair that has a uniform */
  /* notice how we pass the uniform as a parameter to the shader constructor */
  /* note that we also pass an extra "time" parameter that is unnused */
  let mat1 = shaderMaterial("./06-20-02.vs", "./06-20-02.fs", {
    uniforms: { 
        color: { value: new T.Vector3(0.4, 0.8, 0.8) },
        time: { value: 0 }
    },
  });
  world.add(new SimpleObjects.GrCube({ material: mat1, x: 0, y: 1 }));

  // Shader 1b - solid color, passed by uniform, animate uniform
  /* let's use that same thing, but to animate the parameter of the shader */
  let mat2 = shaderMaterial("./06-20-02.vs", "./06-20-02.fs", {
    uniforms: {
      color: { value: new T.Vector3(0.4, 0.5, 0.5) },
      time: { value: 0 },
    },
  });
  let cube2 = new SimpleObjects.GrCube({ material: mat2, x: 3, y: 1 });

  // add an "advance" function to animate this cube
  let cubeTime = 0;
  cube2.stepWorld = function (delta, timeofday) {
    cubeTime += delta;
    let newR = Math.sin(cubeTime / 200) / 2 + 0.5; // get a number between 0-1
    mat2.uniforms.color.value.x = newR;
    mat2.uniforms.time.value = cubeTime * 0.001; // pass in the time in seconds
  };
  world.add(cube2);

  world.go();
}

// 2026 Workbook
