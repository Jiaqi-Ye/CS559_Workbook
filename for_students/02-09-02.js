// @ts-check

export {};

/**
 * Draw the triangle and square at a specific X position
 * 
 * @param {CanvasRenderingContext2D} context 
 * @param {number} xval 
 */
// @@Snippet:drawTriSquareParameter
function drawTriSquareParameter(context, xval) {
    context.fillStyle = "goldenrod";
    context.fillRect(20 + xval, 20, 20, 20);
    context.fillStyle = "red";
    context.beginPath();
    context.moveTo(25 + xval, 25);
    context.lineTo(25 + xval, 35);
    context.lineTo(35 + xval, 30);
    context.fill();
}
// @@Snippet:end

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
const context = canvas.getContext('2d');


const slider = /** @type {HTMLInputElement} */ (document.getElementById("slider1"));

// draw the initial things
const xval = Number(slider.value);
// draw the boxes
drawTriSquareParameter(context, xval);

/** Set up the callback function to move the squares */
slider.oninput = function () {
    // clear the canvases
    context.clearRect(0, 0, canvas.width, canvas.height);
    // get the X position and convert to a number
    const xval = Number(slider.value);
    // draw the boxes
    drawTriSquareParameter(context, xval);
};



// 2026 Workbook
