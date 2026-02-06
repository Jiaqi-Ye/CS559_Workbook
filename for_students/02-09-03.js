// @ts-check

/** moving the triangle and square - with a transform
 * 
 * This is for drawTriSquare - it loads in a separate module that holds the code for the function
 * so we can put that code into a separate file (called "TriSquare.js")
 * 
 * Now is a good time to learn about modules!
 * 
 * Check your favorite JavaScript book (if it is up to date with ES6).
 * https://github.com/nzakas/understandinges6/blob/master/manuscript/13-Modules.md
 * is a nice tutorial.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
 * is an official reference
 */
export {};

import * as trisquare from "../libs/CS559/TriSquare.js";

/**
 * Draw the triangle and square at a specific X position
 * 
 * @param {CanvasRenderingContext2D} context 
 * @param {number} xval 
 */
// @@Snippet:transform
function drawTriSquareTransform(context, xval) {
    context.save();
    context.translate(xval, 0);
    trisquare.drawTriSquare(context);
    context.restore();
}
// @@Snippet:end

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
const context = canvas.getContext('2d');

const slider = /** @type {HTMLInputElement} */ (document.getElementById("slider1"));

// draw the initial things
const xval = Number(slider.value);
// draw the boxes
drawTriSquareTransform(context, xval);

/** Set up the callback function to move the squares */
slider.oninput = function () {
    // clear the canvases
    context.clearRect(0, 0, canvas.width, canvas.height);
    // get the X position and convert to a number
    const xval = Number(slider.value);
    // draw the boxes
    drawTriSquareTransform(context, xval);
};



// 2026 Workbook
