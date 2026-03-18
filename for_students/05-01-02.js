// @ts-check

import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrCube } from "CS559-Framework/SimpleObjects.js";

// @@Snippet:simplespin
// define a special kind of cube that spins
class SpinCube extends GrCube {
  constructor() {
    super({ color: "green" });
  }
  stepWorld(ms, daytime) {
    // this used to be .01 per step
    // however, we want to advance things based on the frame rate
    // if we get 60fps, that's 16 miliseconds
    this.objects[0].rotation.x += (0.01 * ms) / 16;
    this.objects[0].rotation.y += (0.01 * ms) / 16;
  }
}

let world = new GrWorld({
    groundplanecolor: "gray",
    where: document.getElementById("div1")
});

let cube = new SpinCube();
world.add(cube);
// we need to place the cube above the ground
cube.objects[0].position.y = 1;

world.go();
// @@Snippet:end


// 2026 Workbook
