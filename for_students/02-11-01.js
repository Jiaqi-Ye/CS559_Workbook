// @ts-check
export {};

let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
let context = canvas.getContext("2d");

let slider = /** @type {HTMLInputElement} */ (document.getElementById("slider1"));

function sliderChange() {
    let val = slider.value;
    let spin = Number(val) * Math.PI;
    // draw the first canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.fillStyle = "red";
    context.rotate(spin);
    context.fillRect(30, 30, 20, 20);
    context.restore();

    context.save();
    context.fillStyle = "blue";
    context.translate(80, 30);
    context.rotate(spin);
    context.translate(-80, -30);
    context.fillRect(80, 30, 20, 20);
    context.restore();

    context.save();
    context.fillStyle = "purple";
    context.translate(140, 40);
    context.rotate(spin);
    context.translate(-140, -40);
    context.fillRect(130, 30, 20, 20);
    context.restore();

    context.save();
    context.fillStyle = "goldenrod";
    context.translate(200, 50);
    context.rotate(spin);
    context.translate(-200, -50);
    context.fillRect(180, 30, 20, 20);
    context.restore();
}
slider.oninput = sliderChange;
slider.value = "0";
sliderChange();



// 2026 Workbook
