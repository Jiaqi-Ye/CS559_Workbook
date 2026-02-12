// @ts-check
export {};

import * as trisquare from "../libs/CS559/TriSquare.js";

// the first canvas - which works
{
    // note that I am just using braces to have a new scope so I can
    // keep my variable names
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
    const context = canvas.getContext("2d");
    // scale first and then translate the right amount
    context.scale(0.5, 0.5);
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 8; c++) {
            context.save();
            context.translate(c * 40, r * 40);
            trisquare.drawTriSquare(context);
            context.restore();
        }
    }
}

// the second Canvas - which the student needs to fix so it looks like the previous one
{
    // note that I am just using braces to have a new scope so I can
    // keep my variable names
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas2"));
    const context = canvas.getContext("2d");
    // put the scale inside the loop
    // you may need to add other things as well.
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 8; c++) {
            context.save();
            context.translate(c * 20, r * 20);
            context?.scale(0.5, 0.5);
            trisquare.drawTriSquare(context);
            context.restore();
        }
    }
}



// 2026 Workbook
