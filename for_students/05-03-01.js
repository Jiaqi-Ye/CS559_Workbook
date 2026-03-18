// @ts-check

// get things we need
import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { AutoUI } from "CS559-Framework/AutoUI.js";
import { GrCrane, GrExcavator } from "./05-03-01-constructionobjects.js";

let cDiv = document.getElementById("construction");
let world = new GrWorld({ groundplanesize: 10, where: cDiv, renderparams: {preserveDrawingBuffer:true}, id:"canvas" });

let crane = new GrCrane({ x: 2, z: -2 });
world.add(crane);
let c_ui = new AutoUI(crane, { world, width: 300, where: cDiv, widthdiv: 1, adjusted: true });

let excavator = new GrExcavator({ x: -2, z: 2 });
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

world.go();


// 2026 Workbook
