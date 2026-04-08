
// @ts-check

import * as T from "three";

// get things we need
import { GrWorld }  from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import {shaderMaterial} from "CS559-Framework/shaderHelper.js";
import * as InputHelpers from "CS559/inputHelpers.js";

const fsfilebase = "W1-wood";

let mydiv=document.getElementById("wood1");

let box = InputHelpers.makeBoxDiv({width: 640},mydiv);
if (!mydiv) {
    InputHelpers.makeBreak();   // sticks a break after the box
}
InputHelpers.makeHead("Wood 1",box);

let world = await GrWorld.new({width:600, where:box, 
    lightColoring:"white",
    webgpu:false
});

let shaderMat = shaderMaterial(fsfilebase+".vs",fsfilebase+".fs", 
    {
        uniforms: {
            stripes: { value: 10.0},
            sw: { value: 0.5},
            color1: { value: new T.Color("#997950")},
            color2: { value: new T.Color("#4B3A26")},
            blur : {value: -0.01}
        }
    }
);

new InputHelpers.LabelSlider("Stripes", {min:2, max:50, initial:10, step:1, where:box, display:"inline"}).oninput = function(s) {
    shaderMat.uniforms.stripes.value = Number(s.value());
    shaderMat.uniformsNeedUpdate = true;
}
new InputHelpers.LabelSlider("Width", {min:0, max:1.0, initial:0.5, step:.05, where:box, display:"inline"}).oninput = function(s) {
    shaderMat.uniforms.sw.value = Number(s.value());
    shaderMat.uniformsNeedUpdate = true;
}
new InputHelpers.LabelSlider("Blur", {min:-.01, max:.1, initial:-0.01, step:.01, where:box, display:"inline"}).oninput = function(s) {
    shaderMat.uniforms.blur.value = Number(s.value());
    shaderMat.uniformsNeedUpdate = true;
}

world.add(new SimpleObjects.GrSphere({x:-2,y:1, material:shaderMat}));
world.add(new SimpleObjects.GrSquareSign({x:2,y:1,size:1,material:shaderMat}));

//@ts-ignore
world.ambient.intensity = 1;

world.go(); 
