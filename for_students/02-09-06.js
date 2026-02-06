// @ts-check

export {};

/**
 * Your turn! understand my code and fix it!
 * This is mainly about understanding what translate does.
 */
const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
const context = canvas.getContext('2d');
/** @type {HTMLButtonElement} */
const button = /** @type {HTMLButtonElement} */ (document.getElementById("button1"));

/**
 * draw the box with a triangle in it - the jump flag says if the
 * button is pressed (if it is, the triangle should move to the right)
 * 
 * The student should fix this function - without using any negative numbers!
 * 
 * @param {number} jump 
 */
function draw(jump) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (jump) {
        context.translate(20, 0);
        context.fillStyle = "blue";
    } else {
        context.fillStyle = "red";
    }
    context.beginPath();
    context.moveTo(20, 10);
    context.lineTo(10, 30);
    context.lineTo(30, 30);
    context.fill();
}
// draw the initial triangle
draw(0);

// now make the button work
button.onmousedown = function () {
    draw(1);
};
button.onmouseup = function () {
    draw(0);
};



// 2026 Workbook
