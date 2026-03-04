/**
 * CS559 Spring 2026 Workbook
 * 03-22-01 RunCanvas demo
 */

// @ts-check
/* jshint -W069, esversion:6 */

import { runCanvas } from "../libs/CS559/runCanvas.js";

/**
 * Draw function called every time the slider changes
 * @param {HTMLCanvasElement} canvas
 * @param {Number} time
 */
function myDraw(canvas, time) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // move origin to center of canvas
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // rotate based on time
    // since time goes from 0 to 2, multiply by 2π to get full rotations
    ctx.rotate(time * 2 * Math.PI);

    // draw a rectangle centered at origin
    ctx.fillStyle = "blue";
    ctx.fillRect(-50, -25, 100, 50);

    ctx.restore();
}

// set slider range from 0 to 2
runCanvas("canvas1", myDraw, {
    min: 0,
    max: 2,
    step: 0.01
});