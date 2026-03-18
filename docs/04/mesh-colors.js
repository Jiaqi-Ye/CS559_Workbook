// @ts-check

/**
 * Note: this makes two triangles, with different colorings
 * 
 * Originally, this was written with old-style geometry - some of the 
 * comments still refer to that
 * 
 * TwoTriangles - split vertices, explicit normals
 * TwoColoredTriangles - split vertices, computed normals, vertex colors
 * TwoGradientTriangles - split vertices, computed normals, vertex colors
 */

import * as T from "three";
import { GrWorld } from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";

/**
 * two trinagles - same color, automatic face normals, all yellow
 * 
 * now done with BufferGeometry
 */
class TwoTriangles extends GrObject {
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
      // don't ask where we learn to call this "position" and "normal"
      // the only thing I can find is to read examples...
      geometry.setAttribute('position',new T.BufferAttribute(vertices,3));
      // in theory, we could "compute vertex normals" since the triangles are separate
      // so each vertex is just used once, so it will just average over the one triangle
      // geometry.computeVertexNormals();
      // but instead, let's compute it explicitly - we need to compute the cross product
      // and normalize
      // with three, we make the first vector and then cross it with the second vector
      // these explicit object operations might not be the 
      //                      C-B                        A-B
      let n1 = (new T.Vector3(0,2,0).cross(new T.Vector3(-1,1,-1))).normalize();
       //                      C-A                        C=B
      let n2 = (new T.Vector3(1,1,-1).cross(new T.Vector3(0,2,0))).normalize();
      const normals = new Float32Array([
          n1.x, n1.y, n1.z,     // all verts of this triangle have the same normal
          n1.x, n1.y, n1.z, 
          n1.x, n1.y, n1.z,
          n2.x, n2.y, n2.z,
          n2.x, n2.y, n2.z,
          n2.x, n2.y, n2.z
      ])
      geometry.setAttribute("normal",new T.BufferAttribute(normals,3));

      let material = new T.MeshStandardMaterial({
        color: "yellow",
        roughness: 0.75
      });

      let mesh = new T.Mesh(geometry, material);
  
      //
      super("TwoTriangles", mesh);
    }
}
  
/**
 * Each face is a different color
 * in the old days, this was easy... now its hard since it
 * requires vertex split
 */
// @@Snippet:twotribuff
class TwoColoredTriangles extends GrObject {
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
      // in the previous example, we computed them explicitly - here we let three
      // do it for us
      geometry.computeVertexNormals();

      // the colors
      const colors = new Float32Array( [
          1,1,0,    // yellow (3 vertices)
          1,1,0,
          1,1,0,
          1,.65,0,  // orange (#FFA500)
          1,.65,0,
          1,.65,0 
      ]);
      geometry.setAttribute("color",new T.BufferAttribute(colors,3));

      let material = new T.MeshStandardMaterial({
        roughness: 0.75,
        vertexColors: true
      });
      let mesh = new T.Mesh(geometry, material);
  
      //
      super("TwoTrianglesBuff", mesh);
    }
  }
// @@Snippet:end

/**
 * A gradient of colors on the triangles
 * note we still need to split vertices, since the triangles are still flat
 */
class TwoGradientTriangles extends GrObject {
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
      // don't ask where we learn to call this "position" and "normal"
      // the only thing I can find is to read examples...
      geometry.setAttribute('position',new T.BufferAttribute(vertices,3));
      // compute vertex normals works because each triangle is separate - each
      // vertex is computed correctly
      geometry.computeVertexNormals();

      // the colors
      const colors = new Float32Array( [
          1,0,0,   
          1,1,0,
          1,1,1,
          0,1,0,  
          1,1,1,
          1,1,0 
      ]);
      geometry.setAttribute("color",new T.BufferAttribute(colors,3));

      let material = new T.MeshStandardMaterial({
        roughness: 0.75,
        vertexColors: true
      });
      let mesh = new T.Mesh(geometry, material);
  
      //
      super("TwoTriangles1", mesh);
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
InputHelpers.makeHead("Three Different Colorings", box);

let world = new GrWorld({ width: mydiv ? 600 : 800, where: box });
let tt = shift(new TwoTriangles(), -3);
world.add(tt);

let t2 = shift(new TwoColoredTriangles(), 0);
world.add(t2);

let t3 = shift(new TwoGradientTriangles(), 3);
world.add(t3);

let div = InputHelpers.makeBoxDiv({}, box);

let sl = new InputHelpers.LabelSlider("ry", { min: -2, max: 2, where: div });

InputHelpers.makeBreak(box);

sl.oninput = function(evt) {
    let v = sl.value();
    roty(tt,v);
    roty(t2,v);
    roty(t3,v);
};

world.go();

