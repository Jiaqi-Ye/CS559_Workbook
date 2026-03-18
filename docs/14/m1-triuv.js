// @ts-check

import * as T from "three";

const container_width = 650;
const margins = 10;

// get things we need
import { GrWorld }  from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as AutoUI  from "CS559-Framework/AutoUI.js";
import * as InputHelpers from "CS559/inputHelpers.js";

const s2 = Math.sqrt(2)/2;

// the texture we will use over and over
let texture = new T.TextureLoader().load("/textures/UV_Grid_Sm.jpg");
texture.flipY = false;

class TextureGadget extends GrObject {
    constructor() {
        let group = new T.Group();
        super("TextureGadget",group,
                [["u1",0,1,0.25],
                 ["v1",0,1,0.25],
                 ["u2",0,1,0.75],
                 ["v2",0,1,0.25],
                 ["u3",0,1,0.5],
                 ["v3",0,1,0.75]]);

        // the texture coordinates - this is for the triangle in UV space and is 
        // used througout
        this.v1 = new T.Vector3(0.25,0.25,0.01);
        this.v2 = new T.Vector3(0.5, 0.25,0.01);
        this.v3 = new T.Vector3(0.25,0.5, 0.01);

        // the square showing the texture
        const sqGeom = new T.BufferGeometry();
        const sqXYZ = new Float32Array([0,0,0, 1,0,0, 0,1,0, 1,1,0]);
        const sqUV  = new Float32Array([0,0,   1,0,   0,1,   1,1  ]);
        sqGeom.setAttribute("position", new T.BufferAttribute(sqXYZ,3) );
        sqGeom.setAttribute("uv", new T.BufferAttribute(sqUV,2) );
        sqGeom.setIndex([0,1,2,3,2,1]);
        sqGeom.computeVertexNormals();
        this.texMat = new T.MeshBasicMaterial({color:"white",map:texture});
        this.square = new T.Mesh(sqGeom,this.texMat);
        group.add(this.square);

        // a polyline to show where the texture is coming from
        this.lineGeom= new T.BufferGeometry();

        // set the buffer geometry from the UVs
        this.lineGeom.setFromPoints([this.v1,this.v2,this.v3,this.v1]);

        this.lineMat = new T.LineBasicMaterial({color:"yellow", linewidth:5});
        this.line = new T.Line(this.lineGeom,this.lineMat);
        group.add(this.line);

        // the Triangle showing the texture
        this.triBG = new T.BufferGeometry();
        const s1 = Math.sqrt(3)/2;
        const triVerts = new T.BufferAttribute(new 
            Float32Array([1.7-.6,0,0,  
                          1.7+.6,0,0,  
                          1.7,1.2*s1,0 ]), 3);
        const uvVerts = new T.BufferAttribute(new Float32Array([this.v1.x, this.v1.y, this.v2.x, this.v2.y, this.v3.x, this.v3.y]),2);
        this.triBG.setAttribute("position",triVerts);
        this.triBG.setAttribute("uv",uvVerts);
        this.triMesh = new T.Mesh(this.triBG,this.texMat);

        group.add(this.triMesh);
        
    }
    update(paramVals) {
        this.v1.x = paramVals[0];
        this.v1.y = paramVals[1];
        this.v2.x = paramVals[2];
        this.v2.y = paramVals[3];
        this.v3.x = paramVals[4];
        this.v3.y = paramVals[5];
        // this will correctly change the lines
        this.lineGeom.setFromPoints([this.v1,this.v2,this.v3,this.v1]);
        // changing the UVs of the BufferGeom is tricker
        // see https://discourse.threejs.org/t/updating-uv-coordinates-of-buffergeometry/9180

        const uvs = this.triBG.getAttribute("uv");
        uvs.setXY(0, this.v1.x,this.v1.y)
        uvs.setXY(1, this.v2.x,this.v2.y)
        uvs.setXY(2, this.v3.x,this.v3.y)
        uvs.needsUpdate = true;

    }
}


function test() {
    let container = document.getElementById("gadget-here");
    let box = InputHelpers.makeBoxDiv({width:container_width},container);
    InputHelpers.makeBreak();   // sticks a break after the box
   
    InputHelpers.makeHead("Texture Test",box);

    let left = -0.25;
    let right = 2.5;
    let top = 1.25;
    let bottom = -0.25;

    let myCam = new T.OrthographicCamera(left,right,top,bottom,-1,1);
    const cw = container_width-2*margins;
    let world = new GrWorld({width:cw, height:cw * (top-bottom)/(right-left), where:box, camera:myCam});
 

    let tt = new TextureGadget();
    world.add(tt);

    let ai = new AutoUI.AutoUI(tt, {
        world,
        width: 360,
        where: box,
        useLilGUI: false,
        labelDisplay: "inline"
    });

    world.go();
}
test();

