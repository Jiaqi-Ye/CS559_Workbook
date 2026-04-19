// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";
import * as Simple from "CS559-Framework/SimpleObjects.js";

/**
 *
 * @param {GrObject} obj
 * @param {number} [speed=1] - rotations per second
 */
function spinY(obj, speed = 1) {
  obj.stepWorld = function(delta, timeOfDay) {
    obj.objects.forEach(obj => obj.rotateY(((speed * delta) / 1000) * Math.PI));
  };
  return obj;
}

async function test() {
  let parentOfCanvas = document.getElementById("div1");
  let world = await GrWorld.new({ where: parentOfCanvas });

  /**
   * Some Stuff in the world to cast and receive shadows
   */
  // a high object to cast shadows on lower objects
  let gr = new T.Group();
  let mat = new T.MeshStandardMaterial({ color: "blue" });
  let geom = new T.TorusGeometry();
  let tmesh = new T.Mesh(geom, mat);
  tmesh.rotateX(Math.PI / 2);
  tmesh.scale.set(0.5, 0.5, 0.25);
  tmesh.translateX(-2);
  gr.add(tmesh);
  gr.translateY(3);
  let highobj = new GrObject("high obj", gr);
  spinY(highobj);
  world.add(highobj);

  // some low objects to be shadowed - although these
  // should cast shadows on the ground plane
  world.add(spinY(new Simple.GrCube({ x: -3, y: 1 })));
  world.add(spinY(new Simple.GrTorusKnot({ x: 3, y: 1, size: 0.5 })));

  /**
   * Turn on Shadows - this is the student's job in the assignment
   * Remember to:
   * - make a spotlight and turn on its shadows
   * - have objects (including the ground plane) cast / receive shadows
   * - turn on shadows in the renderer
   *
   * it's about 15 lines (with a recursive "loop" to enable shadows for all objects)
   * but you can also just turn things on as you make objects
   */
  world.renderer.shadowMap.enabled = true;
  world.renderer.shadowMap.type = T.PCFSoftShadowMap;

  if (world.ambient) world.ambient.intensity = 0.12;
  world.scene.traverse(obj => {
    if (obj instanceof T.DirectionalLight) obj.intensity = 0.35;
  });

  let spot = new T.SpotLight("white", 70, 30, Math.PI / 9, 0.05);
  spot.position.set(-1.0, 9, 3.4);
  spot.castShadow = true;
  spot.shadow.bias = -0.0002;
  spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.camera.near = 0.5;
  spot.shadow.camera.far = 40;
  spot.target.position.set(0, 1.0, 0);
  world.scene.add(spot);
  world.scene.add(spot.target);

  world.scene.traverse(obj => {
    if (obj instanceof T.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  world.go();
}
await test();



// 2026 Workbook
