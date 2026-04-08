// @ts-check

import { GrWorld } from "CS559-Framework/GrWorld.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";

let mydiv = document.getElementById("div1");
let world = await GrWorld.new({ width: mydiv ? 600 : 800, where: mydiv });

// from graph editor
import { color, float, mrt, mul, mx_noise_vec3, normalView, output, pass, uv, vec3 } from 'three/tsl';
import { MeshStandardNodeMaterial } from 'three/webgpu';

import * as tsl from 'three/tsl';

/////////////////////////////////////////////
// Material Graph
// Generated TSL Code
const _node0 = uv(0);
const _node1 = float(9.9);
const _node2 = mul(_node0, _node1);
const _node3 = mx_noise_vec3(_node2, 1, 0);

// Material
const material = new MeshStandardNodeMaterial();
material.colorNode = _node3;

/* Same material, just more compactly... */
material.colorNode = tsl.mx_noise_vec3(tsl.uv(0).mul(9.9),1,0);

world.add(new SimpleObjects.GrSphere({ x: -2, y: 1, material: material }));
world.add(
    new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: material })
);
world.go();
