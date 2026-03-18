// @ts-check

/*
  Demo implemented by GitHub Copilot (GPT-5.3-Codex), directed by user request.
*/

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";

//@@Snippet:path
const texturePath = "/textures/plaintextures/texture_warnings_3363_3_XS.png";
//@@Snippet:end

class TexturedTriangle extends GrObject {
  constructor() {
    const geometry = new T.BufferGeometry();

    // One equilateral triangle in the XY plane.
    const vertices = new Float32Array([
      -1, 0, 0,
      1, 0, 0,
      0, Math.sqrt(3), 0
    ]);
    geometry.setAttribute("position", new T.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    // @@Snippet:uvs
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      0.5, 1
    ]);
    geometry.setAttribute("uv", new T.BufferAttribute(uvs, 2));
    // @@Snippet:end

    // @@Snippet:texture
    const texture = new T.TextureLoader().load(texturePath);
    const material = new T.MeshStandardMaterial({
      color: "white",
      map: texture,
      transparent: true,
      side: T.DoubleSide,
      roughness: 0.7
    });
    // @@Snippet:end

    const mesh = new T.Mesh(geometry, material);
    super("TexturedTriangle", mesh);
  }
}

const host = document.getElementById("demo");
const box = InputHelpers.makeBoxDiv({ width: 640 }, host ?? undefined);

if (!host) {
  InputHelpers.makeBreak();
}
InputHelpers.makeHead("5-3-1: Textured Triangle", box);

const layout = document.createElement("div");
layout.style.display = "flex";
layout.style.gap = "12px";
layout.style.alignItems = "flex-start";
layout.style.flexWrap = "nowrap";
box.append(layout);

const worldPane = document.createElement("div");
layout.append(worldPane);

const previewPane = document.createElement("div");
previewPane.style.width = "180px";
previewPane.style.fontSize = "0.9rem";
layout.append(previewPane);

const previewLabel = document.createElement("div");
previewLabel.textContent = "Texture Preview (triangle overlay)";
previewLabel.style.marginBottom = "6px";
previewPane.append(previewLabel);

const previewWrap = document.createElement("div");
previewWrap.style.position = "relative";
previewWrap.style.width = "180px";
previewWrap.style.height = "180px";
previewWrap.style.border = "1px solid #999";
previewPane.append(previewWrap);

const previewImg = document.createElement("img");
previewImg.src = texturePath;
previewImg.alt = "Warning texture";
previewImg.width = 180;
previewImg.height = 180;
previewImg.style.display = "block";
previewWrap.append(previewImg);

const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
overlay.setAttribute("viewBox", "0 0 180 180");
overlay.setAttribute("width", "180");
overlay.setAttribute("height", "180");
overlay.style.position = "absolute";
overlay.style.inset = "0";
overlay.style.pointerEvents = "none";
previewWrap.append(overlay);

const triOutline = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
triOutline.setAttribute("points", "0,180 180,180 90,0");
triOutline.setAttribute("fill", "none");
triOutline.setAttribute("stroke", "#ffe100");
triOutline.setAttribute("stroke-width", "4");
overlay.append(triOutline);

const world = new GrWorld({
  where: worldPane,
  width: 440,
  height: 300,
  groundplanesize: 6
});

const tri = new TexturedTriangle();
tri.objects[0].position.set(0, 0.2, 0);
world.add(tri);

world.camera.position.set(0, 1.2, 4);
world.camera.lookAt(0, 1, 0);
world.ambient.intensity = 0.9;

const light = new T.DirectionalLight("white", 0.8);
light.position.set(2, 4, 2);
world.scene.add(light);

world.go();
