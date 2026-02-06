// @ts-check
export {};

let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
let context = canvas.getContext("2d");

// parameters of the windmill
const height = 100;
const width = 30;
const bladeLength = 80;
const bladeThin = 8;
const bladeThick = 16;
const bladeOffset = 7;

/**
 * Draw the windmill - it's positioned at X=0, at the bottom of the
 * window (Y is up!). The windmill is drawn at X=0.
 * We pass the angle for the fan/propeller/whatever you call it.
 *
 * @param {number} angle
 */
function drawMill(angle) {
    context.save();
    // draw the base - just a triangle
    context.fillStyle = "brown";
    context.beginPath();
    context.moveTo(0, height);
    context.lineTo(-width, 0);
    context.lineTo(width, 0);
    context.fill();
    // draw the propeller
    context.save();
    context.translate(0, height); // we'll build the propeller at the origin, move into place
    context.rotate(angle); // spin the propeller
    // place the different blades at 90 degree angles to the first
    for (let blades = 0; blades < 4; blades++) {
        context.fillStyle = "black";
        context.fillRect(0, -bladeThin / 2, bladeLength, bladeThin);
        context.fillStyle = "gray";
        context.fillRect(bladeOffset, bladeThin / 2, bladeLength, bladeThick);
        context.rotate(Math.PI / 2);
    }
    context.restore();
    context.restore();
}

function drawScene() {
    let a = performance.now() / 4000;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    // flip the coordinate system since I like Y-up
    context.scale(1, -1);
    context.translate(0, -canvas.height);
    // draw the windmill away from the edge
    context.save();
    context.translate(100, 0);
    drawMill(a);
    context.restore();
    context.save();
    context.translate(300, 0);
    context.scale(0.8, 0.8);
    drawMill(a);
    context.restore();

    context.restore();
    window.requestAnimationFrame(drawScene);
}
drawScene();



// 2026 Workbook
