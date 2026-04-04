// @ts-check

// get things we need
import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { AutoUI } from "CS559-Framework/AutoUI.js";
import {
  GrCrane,
  GrExcavator,
  GrDumpTruck,
  GrForklift,
  GrMiniExcavator
} from "./05-03-01-constructionobjects.js";

let cDiv = document.getElementById("construction");
let world = new GrWorld({ groundplanesize: 10, where: cDiv, renderparams: {preserveDrawingBuffer:true}, id:"canvas" });

let crane = new GrCrane({ x: -7, z: -6 });
world.add(crane);
let c_ui = new AutoUI(crane, { world, width: 300, where: cDiv, widthdiv: 1, adjusted: true });

let excavator = new GrExcavator({ x: 7, z: -6 });
world.add(excavator);
let e_ui = new AutoUI(excavator, { world, width: 300, where: cDiv, widthdiv: 1, adjusted: true });
e_ui.set("x", 6);
e_ui.set("z", 3);
e_ui.set("theta", 36);

// let excavator2 = new GrExcavator({ x: -2, z: 2 });
// world.add(excavator2);
// let e_ui2 = new AutoUI(excavator, { world, width: 300, where: cDiv, widthdiv: 1, adjusted: true });
// e_ui2.set("x", 6);
// e_ui2.set("z", 3);
// e_ui2.set("theta", 36);

let dumpTruck = new GrDumpTruck({ x: -7, z: 6, size: 0.95 });
world.add(dumpTruck);
let d_ui = new AutoUI(dumpTruck, { world, width: 300, where: cDiv, widthdiv: 1, adjusted: true });
d_ui.set("bed_tilt", 20);
d_ui.set("tailgate", 30);
d_ui.set("wheel_spin", 45);

let forklift = new GrForklift({ x: 7, z: 6, size: 1.0 });
world.add(forklift);
let f_ui = new AutoUI(forklift, { world, width: 300, where: cDiv, widthdiv: 1, adjusted: true });
f_ui.set("mast_tilt", -4);
f_ui.set("lift_height", 0.8);
f_ui.set("fork_extend", 0.2);
f_ui.set("wheel_spin", 30);

let miniExcavator = new GrMiniExcavator({ x: 0, z: 7, size: 1.0 });
world.add(miniExcavator);
let me_ui = new AutoUI(miniExcavator, { world, width: 300, where: cDiv, widthdiv: 1, adjusted: true });
me_ui.set("cab_spin", 20);
me_ui.set("boom", 15);
me_ui.set("stick", 20);
me_ui.set("bucket", -10);
me_ui.set("wheel_spin", 30);

world.go();


// 2026 Workbook
