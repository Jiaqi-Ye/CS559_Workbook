/**
 * adapted from 05-01-01.js
 * 
 * written by Michael Gleicher, January 2019
 * modified January 2020
 * modified July 2025
 */

// @ts-check
/* jshint -W069, esversion:6 */

import { plotter, twoQuarterCircles } from "../libs/CS559/curves.js";

//////////////////////////////////////////////////////////////////
import { runCanvas } from "../libs/CS559/runCanvas.js";

// note that checking that canvas is the right type of element tells typescript
// that this is the right type - it's a form of a safe cast 
let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let context = canvas.getContext("2d");

// a function to fill in a canvas (do the drawing) in an animation
// loop - the form of this function is meant to be used with
// "runcanvas" which is defined in another file
// runcanvas will take a function that takes 2 arguments (a canvas and a time)
function draw1(canvas, t) {
    if (!(context instanceof CanvasRenderingContext2D))
        throw new Error("Context is not a Context!");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(40, 40);
    context.fillStyle = "green";
    context.lineWidth = 3;
    plotter(context, twoQuarterCircles, 50, t, 1);
    context.restore();
    console.log("Hello?")
}
console.log("Yes, Really here!");

// this actually runs the animation loop
runCanvas(canvas, draw1, 0, true, 0, 1, 0.02);




// 2026 Workbook
