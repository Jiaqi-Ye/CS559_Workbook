// @ts-check

import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject} from "CS559-Framework/GrObject.js";
import { GrCube } from "CS559-Framework/SimpleObjects.js";

// three things for making a cube
import * as T from "three";

// @@Snippet:makeworld
let world = new GrWorld({
    groundplanecolor: "gray",
    where: document.getElementById("div1")
});

// make a THREE cube
let geometry = new T.BoxGeometry(1, 1, 1);
let mat = new T.MeshStandardMaterial({ color: "green" });
let cubeObj3D = new T.Mesh(geometry, mat);

// make this cubeObj3D (an Object3D) into a framework object
let cube1 = new GrObject("cube-0",cubeObj3D);
// put it into the world
world.add(cube1);
// move it above the ground plane
cubeObj3D.position.y=0.5;

// make a Framework object that has a cube inside of it
let cube2 = new GrCube({x:2,y:0.5,color:"yellow"});
world.add(cube2);

// run the animation/interaction loop
world.go();
// @@Snippet:end


// 2026 Workbook
