// @ts-check
// Implemented by GitHub Copilot using GPT-5.3-Codex. Directed by Gleicher.

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";

const roughnessTex = new T.TextureLoader().load("/textures/simple/check_16x16.png");

class GrSpinningPhysicalSphere extends GrObject {
  constructor() {
    const sphere = new T.Mesh(
      new T.SphereGeometry(1, 40, 24),
      new T.MeshPhysicalMaterial({
        color: "#d0d0d0",
        metalness: 0.1,
//@@Snippet:props
        roughness: 1.0,
        roughnessMap: roughnessTex,
//@@Snippet:end
        clearcoat: 0.0,
      })
    );

    // Keep the sphere above the ground plane.
    sphere.position.y = 1.2;
    super("SpinningPhysicalSphere", sphere);
  }

  stepWorld(delta) {
    this.objects[0].rotation.y += 0.0012 * delta;
  }
}

const parentOfCanvas = document.getElementById("div1");
const world = new GrWorld({ where: parentOfCanvas });

// Strong directional key light makes roughness differences easy to see while spinning.
const key = new T.DirectionalLight("white", 1.8);
key.position.set(2, 3, 1);
world.scene.add(key);

const fill = new T.DirectionalLight("white", 0.5);
fill.position.set(-2, 2, -1.5);
world.scene.add(fill);

world.ambient.intensity = 0.15;

world.add(new GrSpinningPhysicalSphere());
world.go();
