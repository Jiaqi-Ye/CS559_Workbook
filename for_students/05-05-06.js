// @ts-check

/**
 * Draw Two Triangles - but set the normals in different ways
 * 
 * For BufferGeometry we show things with Vertex normals (split)
 * For smooth normals, we do it with both split (just happens to be the same)
 * as well as shared (so they can be computed)
 * 
 */

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";

import {VertexNormalsHelper} from "three/examples/jsm/helpers/VertexNormalsHelper.js";

const s2 = Math.sqrt(2) / 2;

/**
 * flat triangles (face normals) - implemented by splitting vertices
 * since that's what we have to do with buffer geometry.
 */
class TwoNormalTrianglesBG extends GrObject {
    constructor() {
      let geometry = new T.BufferGeometry();
      //
      // while the two triangles have 4 certices, we need to split the vertices
      // so that they can have different normals
      const vertices = new Float32Array( [
         -1, 1, -1,     // 1A note that we need to keep this ccw
         0, 0, 0,       // 1B
         0, 2, 0,       // 1C
         
         1, 1, -1,      // second triangle
         0, 2, 0,       // 2B
         0, 0, 0        // 2C
      ]);
      geometry.setAttribute('position',new T.BufferAttribute(vertices,3));
      // each triangle is separate, so computing the vertex normals is OK
      geometry.computeVertexNormals();

      let material = new T.MeshStandardMaterial({
        color: "yellow",
        roughness: 0.75
      });

      let mesh = new T.Mesh(geometry, material);
  
      //
      super("TwoNormalTrianglesBG", mesh);
    }
  }

/**
 * here we do it with 4 vertices - which requires using indecies
 */
class TwoSmoothTriangleShared extends GrObject {
    constructor() {
        let geometry = new T.BufferGeometry();
        //
        // while the two triangles have 4 certices, we need to split the vertices
        // so that they can have different normals
        const vertices = new Float32Array( [
            -1, 1, -1,     // 1A note that we need to keep this ccw
            0, 0, 0,       // 1B
            0, 2, 0,       // 1C
            1, 1, -1,      // second triangle
        ]);
        // don't ask where we learn to call this "position" and "normal"
        // the only thing I can find is to read examples...
        geometry.setAttribute('position',new T.BufferAttribute(vertices,3));
        // I happen to now the direction of the triangle...
        const normals = new Float32Array([
            -s2,0,s2,
            0,0,1,      // point forward - which is the average direction
            0,0,1,      // or the way it would be facing if it were curved
            s2,0,s2
        ]);
        geometry.setAttribute("normal",new T.BufferAttribute(normals,3));

        // set the indecies - our triangles are 0 1 2 and 3,2,1
        geometry.setIndex([0,1,2, 3,2,1]);

        let material = new T.MeshStandardMaterial({
        color: "yellow",
        roughness: 0.75
        });

        let mesh = new T.Mesh(geometry, material);

        //
        super("TwoSmoothTriangleShared", mesh);
    }
}

class TwoSmoothTrianglesComputed extends GrObject {
    constructor() {
        let geometry = new T.BufferGeometry();
        //
        // while the two triangles have 4 certices, we need to split the vertices
        // so that they can have different normals
        const vertices = new Float32Array( [
            -1, 1, -1,     // 1A note that we need to keep this ccw
            0, 0, 0,       // 1B
            0, 2, 0,       // 1C
            1, 1, -1,      // second triangle
        ]);
        geometry.setAttribute('position',new T.BufferAttribute(vertices,3));

        // set the indecies - our triangles are 0 1 2 and 3,2,1
        geometry.setIndex([0,1,2, 3,2,1]);

        // Let THREE do this for us
        geometry.computeVertexNormals();

        let material = new T.MeshStandardMaterial({
        color: "yellow",
        roughness: 0.75
        });

        let mesh = new T.Mesh(geometry, material);

        //
        super("TwoSmoothTriangleComputed", mesh);
    }
}


/**
 * shift a GrObject - apply a translation
 * 
 * @param {GrObject} grobj 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z 
 * @returns 
 */
function shift(grobj, x, y, z) {
    grobj.setPos(x,y,z);
    return grobj;
}

/**
 * Add a new object to the scene that is a "VertexNormalsHelper"
 * to show the normals
 * @param {GrObject} grobj 
 */
function addNormalHelper(grobj) {
    let nhelper = new VertexNormalsHelper(grobj.objects[0]);
    grobj.objects.push(/** @type {any} */ (nhelper));
}

// "main" part
let mydiv = document.getElementById("div1");

let box = InputHelpers.makeBoxDiv({ width: mydiv ? 640 : 820 }, mydiv);
if (!mydiv) {
    InputHelpers.makeBreak(); // sticks a break after the box
}

InputHelpers.makeHead("Three Different Normals (face/vertex, shared, computed)",box);

let world = new GrWorld({ width: mydiv ? 600 : 800, where: box });

// no "regular triangles" since we don't have compute face normals
// as it was deprecated with old fashioned Geometry
let t2 = shift(new TwoNormalTrianglesBG(), -4, 0.2, 0);
addNormalHelper(t2);
world.add(t2);

let t3 = shift(new TwoSmoothTriangleShared(), 0, 0.2, 0);
addNormalHelper(t3);
world.add(t3);

let t4 = shift(new TwoSmoothTrianglesComputed(), 4, 0.2, 0);
addNormalHelper(t4);
world.add(t4);


let div = InputHelpers.makeBoxDiv({}, box);

let sl = new InputHelpers.LabelSlider("ry", { min: -2, max: 2, where: div });
sl.oninput = function (evt) {
    let v = sl.value();
    t2.objects[0].rotation.y = v;
    /** @type {any} */ (t2.objects[1]).update();
    t3.objects[0].rotation.y = v;
    /** @type {any} */ (t3.objects[1]).update();
    t4.objects[0].rotation.y = v;
    /** @type {any} */ (t4.objects[1]).update();
};

InputHelpers.makeBreak(box);

world.go();



// 2026 Workbook
