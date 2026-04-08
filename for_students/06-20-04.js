// @ts-check

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "CS559-Framework/shaderHelper.js";

{
  let mydiv = document.getElementById("div1");

  let world = await GrWorld.new({ width: mydiv ? 600 : 800, where: mydiv, webgpu: false, });
  
  let shaderMat = shaderMaterial("./06-20-04.vs", "./06-20-04.fs", {
    side: T.DoubleSide,
  });

  const ob1 = new SimpleObjects.GrSphere({ x: -2, y: 1, material: shaderMat });
  const ob2 = new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: shaderMat });

  /**
   * take a GrObj (assume it's first THREE object is a Mesh)
   * get the buffer geometry from the mesh, and make a new attribute
   * for it ("dim") and have it alternate between 1 and 0
   * 
   * @param {GrObject} ob 
   */
  function addDimAttribute(ob) {
    const mesh = /** @type T.Mesh */ (ob.objects[0]);
    const bg = mesh.geometry;
    const posAt = bg.attributes["position"];
    const nverts = posAt.count;
    console.log("nverts:",nverts);
    const fbuf = new Float32Array(nverts);
    // fill will alternating pattern
    for(let i=0; i<nverts; i++) fbuf[i] = i%2;
    const ab = new T.BufferAttribute(fbuf,1);
    bg.setAttribute("dim",ab);  
  }

  addDimAttribute(ob1);
  addDimAttribute(ob2);
 
  world.add(ob1);
  world.add(ob2);
 
  world.go();
}
// 2026 Workbook
