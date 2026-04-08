
// @ts-check

import * as T from "three";

// get things we need
import { GrWorld }  from "CS559-Framework/GrWorld.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js";
import {shaderMaterial} from "CS559-Framework/shaderHelper.js";
import * as InputHelpers from "CS559/inputHelpers.js";

let mydiv= document.getElementById("stripes1");

let box = InputHelpers.makeBoxDiv({width: 640},mydiv);
if (!mydiv) {
    InputHelpers.makeBreak();   // sticks a break after the box
}
InputHelpers.makeHead("Shader Stripes",box);

let world = await GrWorld.new({width:600, where:box, 
    lightColoring:"white",
    webgpu:false
});

let shaderMat = shaderMaterial("stripes.vs",
                               "1-stripes-simple.fs",
    {
        uniforms: {
            stripes: { value: 10.0},
            sw: { value: 0.5},
            color1: { value: new T.Vector3(1,.6,0)},
            color2: { value: new T.Vector3(0,0.4,0.4)}
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

world.add(new SimpleObjects.GrSphere({x:-2,y:1, material:shaderMat}));
world.add(new SimpleObjects.GrSquareSign({x:2,y:1,size:1,material:shaderMat}));

world.ambient.intensity = 1;

world.go();
