// @ts-check

import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrCube } from "CS559-Framework/SimpleObjects.js";

let world = new GrWorld({
    groundplanecolor: "gray",
    where: document.getElementById("div1")
});

// @@Snippet:spin-func
// make a regular cube
let cube = new GrCube({color:"green"});

// replace its step function
cube.stepWorld = function(ms, daytime) {
    this.objects[0].rotation.x += (0.01 * ms) / 16;
    this.objects[0].rotation.y += (0.01 * ms) / 16;
}
world.add(cube);
// @@Snippet:end

// we need to place the cube above the ground
cube.objects[0].position.y = 1;

world.go();
// @@Snippet:end


// 2026 Workbook
