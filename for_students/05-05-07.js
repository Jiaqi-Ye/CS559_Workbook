// @ts-check

/**
 * Demo to show off backface culling
 * Makes a grid of triangles, and displas them in different ways.
 * 
 * All of them use a 3x3 grid of points - Each one is a different color
 */

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";



/**
 * simple grid - badly ordered triangles
 */
function testGrid() {
    let geometry = new T.BufferGeometry();
    //
    // while the two triangles have 4 certices, we need to split the vertices
    // so that they can have different normals
    const vertices = new Float32Array( [
        -1, 0, 0,
        0,  0, 0,
        1,  0, 0,
        -1, 1, 0,
        0,  1, 0,
        1,  1, 0,
        -1, 2, 0,
        0,  2, 0,
        1,  2, 0
    ]);
    // don't ask where we learn to call this "position" and "normal"
    // the only thing I can find is to read examples...
    geometry.setAttribute('position',new T.BufferAttribute(vertices,3));
    // make all the normals point forward 
    const normals = new Float32Array([
        0,0,1, 0,0,1, 0,0,1,
        0,0,1, 0,0,1, 0,0,1,
        0,0,1, 0,0,1, 0,0,1
    ]);
    geometry.setAttribute("normal",new T.BufferAttribute(normals,3));

    // mow make the triangles
    // note: I am intentionally being sloppy with the order
    geometry.setIndex([
        0,1,4,  0,4,3,
        1,2,5,  1,5,4,
        3,4,7,  3,7,6,
        4,5,8,  4,8,7
    ]);

    return geometry;
}

/**
 * use directly - won't show well
 */
class SimpleGrid extends GrObject {
    constructor(doTwoSided=false) {
        let geometry = testGrid();

        let material = new T.MeshStandardMaterial({
            color: "yellow",
            roughness: 0.75,
            side: doTwoSided ? T.DoubleSide : T.FrontSide
        });

        let mesh = new T.Mesh(geometry, material);

        //
        super("TwoTriangles", mesh);
    }
}
  

// move the object in the X direction
function shift(grobj, x, z=0) {
    grobj.objects.forEach(element => {
        element.translateX(x);
        element.translateZ(z);
    });
  return grobj;
}

// Set the Object's Y rotate
function roty(grobj, ry) {
    grobj.objects.forEach(element => {
        element.rotation.y = ry;
    });
  return grobj;
}

// "Main" [art]
let mydiv = document.getElementById("div1");

let box = InputHelpers.makeBoxDiv({ width: mydiv ? 640 : 820 }, mydiv);
if (!mydiv) {
    InputHelpers.makeBreak(); // sticks a break after the box
}
InputHelpers.makeHead("Backface Grid", box);

let world = new GrWorld({ width: mydiv ? 600 : 800, where: box });

let t1 = shift(new SimpleGrid(), -2);
let t2 = shift(new SimpleGrid(true), 2);

world.add(t1);
world.add(t2);

let div = InputHelpers.makeBoxDiv({}, box);

let sl = new InputHelpers.LabelSlider("ry", { min: -2, max: 2, where: div });

InputHelpers.makeBreak(box);

sl.oninput = function(evt) {
    let v = sl.value();
    roty(t1,v);
    roty(t2,v);
};

world.go();


// 2026 Workbook
