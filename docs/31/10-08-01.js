// @ts-check

import * as THREE from "three";
import { texture, uv } from "three/tsl";
import { addSphereAndSign, makeBasicNodeMaterial, makeDemoWorld } from "./tsl-demo-utils.js";

const image = new THREE.TextureLoader().load("/textures/Aerial_Campus18_9797.jpg");
const { world } = await makeDemoWorld("div1", "TSL Texture Lookup 10-08-01");

const colorNode = texture(image, uv()).rgb;
const material = makeBasicNodeMaterial(colorNode);

addSphereAndSign(world, material);
world.go();
