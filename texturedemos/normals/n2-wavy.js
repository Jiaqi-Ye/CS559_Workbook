// an attempt to re-create the old "wavy" demo
// that shows different ways to create the appearance of a wavy surface

import * as T from "three";

// get things we need
import { GrWorld }  from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";
import {VertexNormalsHelper} from "three/examples/jsm/helpers/VertexNormalsHelper.js";

const s2 = Math.sqrt(2)/2;

// a texture of gradient stripes
let gradient = new T.TextureLoader().load("./grad-stripes.png");
let nmap = new T.TextureLoader().load("./nmap-stripes.png");

// keep count of objects
let ctr = 0;

// originally, there was one class that did everything
// now we use flat for "one big square"
// params
//   x,y,z
//   bump: true/false
//   size
//   normal: true/false
class Flat extends GrObject {
    constructor(params={}) {
        let forward = params.forward || 0.0;
        let nsteps = params.steps || 8;
        let size = params.size || 2;
        //
        // make regular arrays, then convert to buffers later
        let uvs = [];
        let verts = []
        let normals = [];
        let indices = [];

        // one big square
        verts.push(0,0,0);
        verts.push(size,0,0);
        verts.push(0,size,0);
        verts.push(size,size,0);
        uvs.push(0,0);
        uvs.push(1,0);
        uvs.push(0,1);
        uvs.push(1,1);
        normals.push(0,0,1);
        normals.push(0,0,1);
        normals.push(0,0,1);
        normals.push(0,0,1);

        indices.push(0,1,2);
        indices.push(1,3,2);
        
        let geometry = new T.BufferGeometry();
        geometry.setAttribute("position", new T.Float32BufferAttribute(verts,3));
        geometry.setAttribute("normal", new T.Float32BufferAttribute(normals,3));
        geometry.setIndex(indices);
        geometry.setAttribute("uv", new T.Float32BufferAttribute(uvs,2));

        let matprops = {color:"white", side:T.DoubleSide};

        if (params.bump) {
            matprops.bumpMap = gradient;
            matprops.bumpScale = 4;
        }
        if (params.normalMap) {
            matprops.normalMap = nmap;
        }

        let material = new T.MeshStandardMaterial(matprops);
        let mesh = new T.Mesh(geometry,material);
        super(`Flat-${ctr++}`,mesh);
        mesh.translateX(params.x || 0);
        mesh.translateX(params.y || 0);
        mesh.translateX(params.z || 0);
    }
}

class MultiFlat extends GrObject {
    constructor(params={}) {
        let forward = params.forward || 0.0;
        let nsteps = params.steps || 8;
        let size = params.size || 2;
        let zeroz = params.zeroz || false;
        let helper = params.helper || false;
        //
        // make regular arrays, then convert to buffers later
        let verts = []
        let normals = [];
        let indices = [];

        // rather than one big square, we make stripes
        for(let x=0; x<nsteps; x++) {
            // index of first vertex in array
            const v0 = verts.length/3;
            const x0 = x * size / nsteps;
            const x1 = (x+1) * size / nsteps;

            const z0 = (x % 2) ? 0 : forward;
            const z1 = (x % 2) ? forward : 0;

            verts.push(x0,0,   zeroz ? 0 : z0);
            verts.push(x0,size,zeroz ? 0 : z0);
            verts.push(x1,0,   zeroz ? 0 : z1);
            verts.push(x1,size,zeroz ? 0 : z1);

            // compute the normal for each face - compute it, since
            // we might be warping it...
            let v1 = new T.Vector3(x1-x0,0,z1-z0);
            v1.normalize();
            let v2 = new T.Vector3(0,size,0);
            v2.normalize();
            let v3 = new T.Vector3();
            v3.crossVectors(v1,v2);
            v3.normalize();     // unnecessary, but just in case

            normals.push(v3.x,v3.y,v3.z);
            normals.push(v3.x,v3.y,v3.z);
            normals.push(v3.x,v3.y,v3.z);
            normals.push(v3.x,v3.y,v3.z);

            indices.push(v0,v0+2,v0+1);
            indices.push(v0+2,v0+3,v0+1);
        }
        
        let geometry = new T.BufferGeometry();
        geometry.setAttribute("position", new T.Float32BufferAttribute(verts,3));
        geometry.setAttribute("normal", new T.Float32BufferAttribute(normals,3));
        geometry.setIndex(indices);
   
        let matprops = {color:"white", side:T.DoubleSide};

        let material = new T.MeshStandardMaterial(matprops);
        let mesh = new T.Mesh(geometry,material);
        super(`MultiFlat-${ctr++}`,mesh);
        mesh.translateX(params.x || 0);
        mesh.translateX(params.y || 0);
        mesh.translateX(params.z || 0);

        if (helper) {
            let helpobj = new VertexNormalsHelper(mesh);
            this.objects.push(helpobj);
        }
    }
}

let box = InputHelpers.makeBoxDiv({width: 820});

let world = new GrWorld({width:800, where:box, 
    lightColoring:"xtreme",
    ambient : 0.5
    // sideLightColors:[0xFF8080,0x80FFFF]
});

// world.add(new Flat({x:-6}));
// world.add(new Flat({x:-3, bump:true}));
//world.add(new Flat({x: 0, normalMap:true}));
world.add(new MultiFlat({x: 2, forward:.35}));
world.add(new MultiFlat({x: -1, forward:.35, zeroz:true}));
world.add(new MultiFlat({x: -4, forward:.35, zeroz:true, helper:true}))


world.go();
