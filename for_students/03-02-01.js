/**
 * 03-02-01.js - a simple JavaScript file that gets loaded with
 * page 1 of Workbook 5 (CS559).
 *
 * written by Michael Gleicher, January 2019
 * modified January 2020
 * modified July 2025
 */

// @ts-check
/* jshint -W069, esversion:6 */

/***************************************************** */
/** A Gallery of Parametric Curves - all are designed to fit in the box (0,0,100,100) */
/**
 * Sample parametric functions
 *
 * Note that they return x,y
 */
//@@Snippet:lines
function line1(u) {
  return [0, 100 * u];
}
function line2(u) {
  return [0, 100 * (1 - u)];
}
function line3(u) {
  return [0, 100 * u * u];
}
//@@Snippet:end
function circ(u) {
  let ur = Math.PI * 2 * u;
  return [
    50 + 50 * Math.cos(ur),
    50 + 50 * Math.sin(ur)
  ];
}
export function twoQuarterCircles(u) {
  let pu = Math.PI * u;
  if (u < 0.5)
    return [
      50 + 50 * Math.cos(pu),
      50 * Math.sin(pu)
    ];
  else
    return [
      50 + 50 * Math.cos(pu),
      100 - 50 * Math.sin(pu)
    ];
}

// The two lines meeting in a V
//@@Snippet:v
function twoLines(u) {
    if (u < 0.5) return [20 + 80 * u, 200 * u];
    else return [20+ 80 * u, 100 - 200 * (u - 0.5)];
  }
//@@Snippet:end

function disconnect(u) {
  if (u < 0.5) return [0, 200 * u,];
  else return [20, 100 - 200 * (u - 0.5)];
}
/**
 * Parabola */
function parabola(u) {
    return [20+80 * u, 100 - 400 * (u - 0.5) * (u - 0.5)]
}


/*********************************************** */
/**
 * plot a parametric function
 * pass the function and the number of steps
 *
 * @param {CanvasRenderingContext2D} context
 * @param {function(Number):Number[]} func - parametric function
 * @param {Number} steps - number of steps to draw
 * @param {Number} param - draw the square at this parameter value
 */
export function plotter(context, func, steps, param) {
  context.save();
  context.lineWidth = 3;
  context.strokeStyle = "black";
  context.beginPath();

  // rounding error is annoying, so make sure we get exactly to 1
  for (let u = 0, i = 0; i <= steps; i++, u += 1 / steps) {
    if (i == steps) u = 1;
    let [x, y] = func(u);
    if (!i) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();

  // draw the mark at the parameter values
  let [rx, ry] = func(param);
  context.fillRect(rx - 5, ry - 5, 10, 10);
  // draw a line for the tangent
  context.restore();
}


// draw the gallery
/**
 * Draw all of the different shapes
 *
 * @param {CanvasRenderingContext2D} context
 * @param {number} t
 * @param {number} tangentScale
 */
export function functionGallery(context, t) {
  context.save();
  context.fillStyle = "green";
  context.lineWidth = 3;
  plotter(context, line1, 1, t);
  context.translate(30, 0);
  plotter(context, line2, 1, t);
  context.translate(30, 0);
  plotter(context, line3, 1, t);
  context.translate(30, 0);
  plotter(context, circ, 50, t);
  context.translate(110, 0);
  plotter(context, parabola, 40, t);
  context.translate(110, 0);
  plotter(context, twoLines, 2, t);
  context.translate(110, 0);
  plotter(context, twoQuarterCircles, 50, t);
  context.translate(120, 0);
  // we can't use plotter to draw disconnected lines
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, 100);
  context.moveTo(20, 100);
  context.lineTo(20, 0);
  context.stroke();
  // we can use plotter to draw the moving square
  plotter(context, disconnect, 0, t);
  context.restore();
}


//////////////////////////////////////////////////////////////////
import { runCanvas } from "../libs/CS559/runCanvas.js";

// note that checking that canvas is the right type of element tells typescript
// that this is the right type - it's a form of a safe cast 
let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let context = canvas.getContext("2d");

// use the library code to set up a drawing canvas with a time slider, a start/stop button
// and an animation loop that makes it go.
// the important thing is that it takes a function that is called for drawing
// the content of the canvas
// this will be explained more later in the workbook

// a function to fill in a canvas (do the drawing) in an animation
// loop - the form of this function is meant to be used with
// "runcanvas" which is defined in another file
// runcanvas will take a function that takes 2 arguments (a canvas and a time)
function draw1(canvas, t) {
    if (!(context instanceof CanvasRenderingContext2D))
        throw new Error("Context is not a Context!");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(20, 40);
    functionGallery(context, t, 0);
    context.restore();
}

// this actually runs the animation loop
runCanvas(canvas, draw1, 0, true, 0, 1, 0.02);




// 2026 Workbook
