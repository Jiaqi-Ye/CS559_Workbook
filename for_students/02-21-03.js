/**
 * 02-21-03.js - a simple JavaScript file that gets loaded with
 * page 4 of Workbook 4 (CS559).
 *
 * written by Michael Gleicher, January 2019
 * modified January 2020
 *
 */

// @ts-check
/* jshint -W069, esversion:6 */

import * as utilities from "../libs/CS559/dots.js";

/**
 * TwoDots - a function for the student to write
 * Notice that it gets the two points and the context as arguments
 * This function should apply a transformation
 *
 * This should perform some transformation - you can decide how it works
 *
 * @param {CanvasRenderingContext2D} context
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
function twoDots(context, x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;

    let a = (dx + dy) / 20;
    let b = (dy - dx) / 20;
    let c = -b;
    let d = a;

    let e = x1;
    let f = y1;

    context.transform(a, b, c, d, e, f);
}

// start the program running
utilities.setup("canvas1", twoDots);



// 2026 Workbook
