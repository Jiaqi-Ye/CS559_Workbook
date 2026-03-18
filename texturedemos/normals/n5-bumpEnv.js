// @ts-check

import * as T from "three";

// get things we need
import { GrWorld }  from "CS559-Framework/GrWorld.js";
import { GrObject } from "CS559-Framework/GrObject.js";
import * as AutoUI  from "CS559-Framework/AutoUI.js";
import * as SimpleObjects from "CS559-Framework/SimpleObjects.js"
import * as InputHelpers from "CS559/inputHelpers.js";
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const PANEL_BOX_WIDTH = 384;
const PANEL_WORLD_WIDTH = 340;
const PANEL_WORLD_HEIGHT = 300;

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


/**
 * Read in a set of textures from HDRI Heaven, as converted by 
 * https://www.360toolkit.co/convert-spherical-equirectangular-to-cubemap
 * 
 * this uses a specific naming convention, and seems to (usually) swap bottom and front,
 * so I provide to undo this
 * 
 * @param {string} name 
 * @param {string} [ext="png"]
 * @param {boolean} [swapBottomFront=true]
 */
function cubeTextureHelp(name,ext="png", swapBottomFront=true) {
    return new T.CubeTextureLoader().load([
        name + "_Right."  +ext,
        name + "_Left."   +ext,
        name + "_Top."    +ext,
        name + (swapBottomFront ? "_Front."  : "_Bottom.") +ext,
        name + "_Back."   +ext,
        name + (swapBottomFront ? "_Bottom." : "_Front.")  +ext
    ]);
}

/**
 * Build one comparison panel.
 *
 * @param {HTMLElement} where
 * @param {string} title
 * @param {T.Texture | T.CubeTexture} envTexture
 */
function buildPanel(where, title, envTexture) {
    let box = InputHelpers.makeBoxDiv({ width: PANEL_BOX_WIDTH }, where);
    InputHelpers.makeHead(`Bump Map Test (${title})`, box);

    let world = new GrWorld({
        groundplane: false,
        width: PANEL_WORLD_WIDTH,
        height: PANEL_WORLD_HEIGHT,
        where: box
    });
    world.scene.background = envTexture;
    world.scene.environment = envTexture;

    let shaderMat = new T.MeshStandardMaterial({
        color: "white",
        bumpMap: check,
        side: T.DoubleSide,
        // envMap: envTexture, - note we get this from the scene
        metalness: 1.0,
        roughness: 0
    });

    let sph = spinY(new SimpleObjects.GrSphere({ x: -2, y: 1, material: shaderMat }));
    let sqh = spinY(new SimpleObjects.GrSquareSign({ x: 2, y: 1, size: 1, material: shaderMat }));
    world.add(sph);
    world.add(sqh);

    function camButton(obj) {
        InputHelpers.makeButton(obj.name, box).onclick = function() {
            let x = obj.objects[0].position.x;
            let y = obj.objects[0].position.y;

            world.active_camera.position.x = x;
            world.active_camera.position.y = y;
            world.active_camera.position.z = 6;
            world.orbit_controls.target = new T.Vector3(x, y, 0);
        }
    }
    camButton(sph);
    camButton(sqh);
    InputHelpers.makeButton("World Camera", box).onclick = function() {
        world.active_camera.position.set(2.5,5,10);
        world.orbit_controls.target = new T.Vector3(0, 0, 0);
    }

    let cb = InputHelpers.makeCheckbox("Spin", box);
    cb.checked = true;
    cb.onchange = function () {
        spinYspeed = cb.checked ? .25 : 0;
    }

    let cb2 = InputHelpers.makeCheckbox("Bumps", box);
    function applyBumpSelection() {
        shaderMat.bumpMap = cb2.checked ? bumps : check;
        shaderMat.needsUpdate = true;
    }
    cb2.onchange = applyBumpSelection;

    let cb3 = InputHelpers.makeCheckbox("BumpMap", box);
    cb3.checked = true;
    cb3.onchange = function() {
        if (cb3.checked)
            applyBumpSelection();
        else {
            shaderMat.bumpMap = undefined;
            shaderMat.needsUpdate = true;
        }
    }

    let sl = new InputHelpers.LabelSlider("Y Rot", { min: 0, max: 180, step: 5, where: box });
    sl.oninput = function() {
        setYrot(sph, sl.value());
        setYrot(sqh, sl.value());
    }

    let s2 = new InputHelpers.LabelSlider("bumprepeat", { min: 1, max: 5, step: .1, where: box });
    s2.oninput = function() {
        bumps.repeat.set(s2.value(), s2.value());
    };

    let s3 = new InputHelpers.LabelSlider("metal", { initial: 1, min: 0, max: 1, step: .1, where: box });
    s3.oninput = function() {
        shaderMat.metalness = s3.value();
        shaderMat.needsUpdate = true;
    }

    let s4 = new InputHelpers.LabelSlider("rough", { initial: 0, min: 0, max: 1, step: .05, where: box });
    s4.oninput = function() {
        shaderMat.roughness = s4.value();
        shaderMat.needsUpdate = true;
    }

    world.go();
}

function test() {
    // Keep the existing cube-map path in place, and add EXR beside it for comparison.
    let cubeTexture = cubeTextureHelp("/textures/HDRIHeaven/rooituo");

    let frame = InputHelpers.makeBoxDiv({ width: 800, padding: 4, margin: 5 });
    let row = InputHelpers.makeFlexDiv(frame);
    row.style.alignItems = "flex-start";
    row.style.flexWrap = "nowrap";
    row.style.justifyContent = "space-between";

    let left = document.createElement("div");
    let right = document.createElement("div");
    left.style.flex = "0 0 auto";
    right.style.flex = "0 0 auto";
    row.append(left);
    row.append(right);

    buildPanel(left, "Cube Map", cubeTexture);

    InputHelpers.makeHead("Loading EXR...", right);
    new EXRLoader().load(
        "/textures/HDRIHeaven/rooitou_park_2k.exr",
        (exrTexture) => {
            exrTexture.mapping = T.EquirectangularReflectionMapping;
            right.innerHTML = "";
            buildPanel(right, "EXR", exrTexture);
        },
        undefined,
        (err) => {
            right.innerHTML = "";
            InputHelpers.makeHead("EXR failed to load", right);
            console.error("Failed to load EXR environment:", err);
        }
    );
}


test();
