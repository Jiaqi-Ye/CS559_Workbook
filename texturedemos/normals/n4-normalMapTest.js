// @ts-normalMap

import * as T from "three";

// get things we need
import { GrWorld }  from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as InputHelpers from "CS559/inputHelpers.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import {shaderMaterial} from "CS559-Framework/shaderHelper.js";

let normalMap = new T.TextureLoader().load("/textures/pixl_r_normal.png");

/**
 * 
 * @param {GrObject} obj 
 * @param {number} [speed=1] - rotations per second
 */
function spinY(obj, speed=0.5) {
    obj.advance = function(delta,timeOfDay) {
        obj.objects.forEach(obj => obj.rotateY(speed*delta/1000*Math.PI));
    };
    return obj;
}


function test() {
    let mydiv;

    let box = InputHelpers.makeBoxDiv({width: (mydiv ? 640:820)},mydiv);
    if (!mydiv) {
        InputHelpers.makeBreak();   // sticks a break after the box
    }
    InputHelpers.makeHead("Normal Map Test - extreme cool/warm lighting",box);

    let world = new GrWorld({width:(mydiv ? 600:800), where:box,
        lightColoring : "xtreme"
    });

    let objs = [];
    let dx = -6;

    let shaderMat = new T.MeshStandardMaterial({color:"white",normalMap:normalMap,side:T.DoubleSide});

    world.add(spinY(new SimpleObjects.GrSphere({x:-2,y:1, material:shaderMat})));
    world.add(spinY(new SimpleObjects.GrSquareSign({x:2,y:1,size:1,material:shaderMat})));

    world.go();
}
test();
