// @ts-check

import * as THREE from "three";
import * as THREE_WEBGPU from "three/webgpu";
import * as InputHelpers from "CS559/inputHelpers.js";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";

/**
 * Implemented by GitHub Copilot (GPT-5.3-Codex), directed by the workbook author request.
 */

/**
 * Create a standard demo container and world for TSL examples.
 * @param {string} divId
 * @param {string} title
 */
export async function makeDemoWorld(divId, title) {
  const mydiv = document.getElementById(divId);
  const box = InputHelpers.makeBoxDiv({ width: 640 }, mydiv);

  if (!mydiv) {
    InputHelpers.makeBreak();
  }

  InputHelpers.makeHead(title, box);

  const world = await GrWorld.new({
    width: 600,
    where: box,
    lightColoring: "white",
    webgpu: true,
  });

  world.ambient.intensity = 1;

  return { box, world };
}

/**
 * Add the common pair of test objects used by most workbook texture demos.
 * @param {GrWorld} world
 * @param {THREE.Material} material
 */
export function addSphereAndSign(world, material) {
  world.add(new SimpleObjects.GrSphere({ x: -2, y: 1, material }));
  world.add(new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material }));
}

/**
 * @param {any} colorNode
 * @param {any} positionNode
 */
export function makeBasicNodeMaterial(colorNode, positionNode = null) {
  // @ts-ignore local workbook typings do not include node material classes
  const material = new THREE_WEBGPU.MeshBasicNodeMaterial();
  material.side = THREE.DoubleSide;
  material.colorNode = colorNode;
  if (positionNode) {
    material.positionNode = positionNode;
  }
  return material;
}
