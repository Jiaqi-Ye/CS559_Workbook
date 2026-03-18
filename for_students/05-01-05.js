// @ts-check

import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrCube } from "CS559-Framework/SimpleObjects.js";
import { AutoUI } from "CS559-Framework/AutoUI.js";

// define a special kind of cube that spins
//@@Snippet:rotcube
class RotCube extends GrCube {
  constructor() {
    super({ color: "green" }, [
      ["X", -Math.PI / 2, Math.PI / 2, 0],
      ["Y", -Math.PI / 2, Math.PI / 2, 0],
      ["Z", -Math.PI / 2, Math.PI / 2, 0]
    ]);
  }
  update(vec) {
    this.objects[0].rotation.x = vec[0];
    this.objects[0].rotation.y = vec[1];
    this.objects[0].rotation.z = vec[2];
  }
}
//@@Snippet:end

function go() {
  let div = document.getElementById("div1");
  let world = new GrWorld({ groundplanecolor: "gray", where: div });

  let cube = new RotCube();
  world.add(cube);

  let cubeUI = new AutoUI(cube, { world, width: 200, where: div });

  // we need to place the cube above the ground
  cube.objects[0].position.y = 1;

  world.go();
}
go();


// 2026 Workbook
