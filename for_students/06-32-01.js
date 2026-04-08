// @ts-check

import { GrWorld } from "CS559-Framework/GrWorld.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";

let mydiv = document.getElementById("div1");
let world = await GrWorld.new({ width: mydiv ? 600 : 800, where: mydiv });

import { MeshStandardNodeMaterial } from 'three/webgpu';
import * as tsl from 'three/tsl';

// Material
const material = new MeshStandardNodeMaterial();


world.add(new SimpleObjects.GrSphere({ x: -2, y: 1, material: material }));
world.add(
    new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: material })
);
world.go();

// 2026 Workbook
