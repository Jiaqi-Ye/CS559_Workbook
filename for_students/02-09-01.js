// we do enable typescript type checking - see
// https://graphics.cs.wisc.edu/Courses/559-sp2020/pages/typed-js/
// and
// https://github.com/Microsoft/TypeScript/wiki/Type-Checking-JavaScript-Files
// @ts-check

/**
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

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
const context = canvas.getContext('2d');
trisquare.drawTriSquare(context);



// 2026 Workbook
