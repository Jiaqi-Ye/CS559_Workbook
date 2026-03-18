// @ts-check

import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrCube, GrCone } from "CS559-Framework/SimpleObjects.js";

let world = new GrWorld({
    groundplanecolor: "gray",
    where: document.getElementById("div1")
});

// @@Snippet:spin-func
// make a regular cube
// define a function that replaces the object's step function
function spin(object) {
    object.stepWorld = function(ms, daytime) {
        this.objects[0].rotation.x += (0.01 * ms) / 16;
        this.objects[0].rotation.y += (0.01 * ms) / 16;
    }
}

let cube = new GrCube({color:"green"});
spin(cube);
world.add(cube);
cube.objects[0].position.y = 1;

let cone = new GrCone();
spin(cone);
world.add(cone);
cone.objects[0].position.set(2,1,0);

// @@Snippet:end

// we need to place the cube above the ground

world.go();
// @@Snippet:end


// 2026 Workbook
