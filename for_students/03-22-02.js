// @ts-check
/* jshint -W069, esversion:6 */

import { draggablePoints } from "../libs/CS559/dragPoints.js";

/**
 * drawing function for box 2
 *
 * Use this UI code!
 **/

/* no need for onload - we use defer */


let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let thePoints = [
    [100, 100],
    [200, 100],
    [200, 200],
    [100, 200]
];

/**
 * the draw function - which the student will fill in - takes a 
 * timestamp parameter, because it will be passed to requestAnimationFrame
 * 
 * However, in most cases, you can ignore the timestamp
 * 
 * @param {DOMHighResTimeStamp} timestamp 
 */
function draw(timestamp) {
    // in 2023 we accidentally gave students part of the example code
}

draggablePoints(canvas, thePoints, draw);

// draw things when everything is ready
window.requestAnimationFrame(draw);



// 2026 Workbook
