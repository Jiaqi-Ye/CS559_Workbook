/**
 * 02-21-04.js - a simple JavaScript file that gets loaded with
 * page 4 of Workbook 4 (CS559).
 *
 * written by Michael Gleicher, January 2019
 * modified January 2020
 *
 */

// @ts-check
/* jshint -W069, esversion:6 */

import * as utilities from "../libs/CS559/dots.js";

// draw the original ones using translate, rotate, scale
// students don't need to change this
// we put it in braces to create a scope (so the variables are local)
{
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
    let context = canvas.getContext("2d");
    // Square #1
    context.save();
    // transformation version 
    context.translate(20, 20);
    context.scale(4, 4);
    //
    utilities.markedSquare(context);
    context.restore();

    // Square #2 
    context.save();
    // transformation version 
    context.translate(20,20);
    context.scale(4,4);
    context.translate(15,0);
    utilities.markedSquare(context);
    //
    context.restore();

    // Square #3
    context.save();
    // transformation version
    context.translate(140, 20);
    context.scale(4, 4);
    context.rotate(Math.PI / 2);
    context.translate(0, -10);
    //
    utilities.markedSquare(context);
    context.restore();

    // Square #4
    context.save();
    // transformation version 
    context.rotate(-Math.PI / 2);
    context.translate(-60, 200);
    context.scale(4, 4);
    //
    utilities.markedSquare(context);
    context.restore();

    // Square #5
    context.save();
    // transformation version 
    context.rotate(-Math.PI / 2);
    context.translate(-60, 260);
    context.scale(4, -4);
    context.translate(0, -10);
    //
    utilities.markedSquare(context);
    context.restore();
}


// students should change the transform commands so picture 2
// matches picture 1
{

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas2"));
    let context = canvas.getContext("2d");
    // Square #1
    context.save();
    // matrix version (student should replace the numbers)
    context.transform(1, 0, 0, 1, 20, 0);
    //
    utilities.markedSquare(context);
    context.restore();

    // Square #2 - We did this one for you!
    context.save();
    // matrix version (we have put in the numbers)
    context.transform(4, 0, 0, 4, 80, 20);
    utilities.markedSquare(context);
    //
    context.restore();

    // Square #3
    context.save();
    // matrix version (student should replace the numbers)
    context.transform(1, 0, 0, 1, 40, 0);
    //
    utilities.markedSquare(context);
    context.restore();

    // Square #4
    context.save();
    // matrix version (student should replace the numbers)
    context.transform(1, 0, 0, 1, 60, 0);
    //
    utilities.markedSquare(context);
    context.restore();

    // Square #5
    context.save();
    // matrix version (student should replace the numbers)
    context.transform(1, 0, 0, 1, 80, 0);
    //
    utilities.markedSquare(context);
    context.restore();
}


// 2026 Workbook
