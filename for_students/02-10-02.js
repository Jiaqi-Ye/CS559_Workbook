// @ts-check
export {};

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
const context = canvas.getContext('2d');

const slider = /** @type {HTMLInputElement} */ (document.getElementById("slider1"));
const text = /** @type {HTMLInputElement} */ (document.getElementById("text1"));

function sliderChange() {
    const sc = Number(slider.value);
    text.value = String(sc);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.fillStyle = "goldenrod";
    context.strokeStyle = "red";
    // @@Snippet:centerscale
    context.translate(40, 40);
    context.scale(sc, sc);
    context.translate(-40, -40);
    context.fillRect(30, 30, 20, 20);
    // @@Snippet:end
    context.beginPath();
    context.moveTo(30, 30);
    context.lineTo(50, 50);
    context.moveTo(50, 30);
    context.lineTo(30, 50);
    context.stroke();
    context.restore();
}
slider.value = "1";
slider.oninput = sliderChange;
sliderChange();



// 2026 Workbook
