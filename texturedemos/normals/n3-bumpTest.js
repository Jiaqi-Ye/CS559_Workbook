// @ts-check

import * as T from "three";

// get things we need
import { GrWorld }  from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as AutoUI  from "CS559-Framework/AutoUI.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js"
import * as InputHelpers from "CS559/inputHelpers.js";
import { ShaderLib } from "three";

let check = new T.TextureLoader().load("./paintBump.png");
let bumps = new T.TextureLoader().load("./dots-bump.png");
bumps.wrapS = T.MirroredRepeatWrapping;
bumps.wrapT = T.MirroredRepeatWrapping;

let spinYspeed = .25;
/**
 * speed is a global variable...
 * 
 * @param {GrObject} obj 
 */
function spinY(obj) {
    obj.stepWorld = function(delta,timeOfDay) {
        obj.objects.forEach(obj => obj.rotateY(spinYspeed*delta/1000*Math.PI));
    };
    return obj;
}

function setYrot(obj,theta) {
    obj.objects.forEach(ob => ob.rotation.y = (theta*Math.PI/180));
}

function test() {
    let mydiv;

    let box = InputHelpers.makeBoxDiv({width: (mydiv ? 640:820)},mydiv);
    if (!mydiv) {
        InputHelpers.makeBreak();   // sticks a break after the box
    }
    InputHelpers.makeHead("Bump Map Test",box);

    let world = new GrWorld({width:(mydiv ? 600:800), height: 600, where:box
    });

    let objs = [];
    let dx = -6;

    let shaderMat = new T.MeshStandardMaterial({color:"white",bumpMap:check,side:T.DoubleSide});

    let sph = spinY(new SimpleObjects.GrSphere({x:-2,y:1, material:shaderMat}));
    let sqh = spinY(new SimpleObjects.GrSquareSign({x:2,y:1,size:1,material:shaderMat}));
    world.add(sph);
    world.add(sqh);

    function camButton(obj) {
        InputHelpers.makeButton(obj.name).onclick = function() {
            let x = obj.objects[0].position.x;
            let y = obj.objects[0].position.y;

            world.active_camera.position.x = x;
            world.active_camera.position.y = y;
            world.active_camera.position.z = 6;

            //world.active_camera.lookAt( -4.5 + id*3,
            //                           objs[id].objects[0].position.y,
            //                           objs[id].objects[0].position.z);
            world.orbit_controls.target = new T.Vector3(x, y, 0);
        }
    }
    camButton(sph);
    camButton(sqh);

    InputHelpers.makeButton("World Camera").onclick = function() {
        world.active_camera.position.set(2.5,5,10);
        world.orbit_controls.target = new T.Vector3(0, 0, 0);
    }
    
    let cb = InputHelpers.makeCheckbox("Spin");
    cb.checked = true;
    cb.onchange = function () {
        spinYspeed = cb.checked ? .25 : 0;
    }

    let cb2 = InputHelpers.makeCheckbox("Bumps");
    cb2.onchange = function() {
        shaderMat.bumpMap = cb2.checked ? bumps : check;
        shaderMat.needsUpdate = true;
    }

    let sl = new InputHelpers.LabelSlider("Y Rot",{min:0,max:180,step:5,where:undefined});
    sl.oninput = function() {
        setYrot(sph,sl.value());
        setYrot(sqh,sl.value());
    }

    let s2 = new InputHelpers.LabelSlider("bumprepeat",{min:1,max:5,step:.1,where:undefined});
    s2.oninput = function() {
        bumps.repeat.set(s2.value(),s2.value());
    };

    world.go();

}
test();
