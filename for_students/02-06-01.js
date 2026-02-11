// @ts-check
export {};

/**
 *
 * @param {CanvasRenderingContext2D} context
 */
function picture(context) {
    // draw a simple house shape (approx 20x20) to show orientation
    context.fillStyle = "royalblue";
    context.beginPath();
    context.moveTo(0, 0);   // bottom-left
    context.lineTo(20, 0);  // bottom-right
    context.lineTo(20, 10); // right wall
    context.lineTo(10, 20); // roof peak
    context.lineTo(0, 10);  // left wall
    context.closePath();
    context.fill();

    // add a yellow window on the right side to distinguish left from right
    context.fillStyle = "yellow";
    context.fillRect(13, 4, 4, 4);
}

// note we use the braces to get new scopes so we can re-use variable names
{ // box 1 - regular canvas coordinate system
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
    const context = canvas.getContext("2d");
    picture(context);
}

{ // box 2 - flip coordinate system, translate first
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas2"));
    const context = canvas.getContext("2d");
    context.translate(0, canvas.height);
    context.scale(1, -1);
    picture(context);
}

{ // box 3 - flip coordinate system, scale first
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas3"));
    const context = canvas.getContext("2d");
    context.scale(1, -1);
    context.translate(0, -canvas.height);
    picture(context);
}



// 2026 Workbook
