// @ts-check
export {};

import * as trisquare from "../libs/CS559/TriSquare.js";

/** @type {HTMLCanvasElement} */
const canvas1 = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
const context1 = canvas1.getContext('2d');
trisquare.drawTriSquare(context1);

/** @type {HTMLCanvasElement} */
const canvas2 = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas2"));
const context2 = canvas2.getContext('2d');
trisquare.drawTriSquare(context2);

const sliderS = /** @type {HTMLInputElement} */ (document.getElementById("slider2"));
const sliderT = /** @type {HTMLInputElement} */ (document.getElementById("slider1"));
const textS = /** @type {HTMLInputElement} */ (document.getElementById("text1"));
const textT = /** @type {HTMLInputElement} */ (document.getElementById("text2"));

function sliderChange() {
    const valS = sliderS.value;
    const valT = sliderT.value;
    textS.value = valT;
    textT.value = valS;
    context1.clearRect(0, 0, canvas1.width, canvas1.height);
    context1.save();
    context1.scale(Number(valS), Number(valS));
    context1.translate(Number(valT), 0);
    trisquare.drawTriSquare(context1);
    context1.restore();

    context2.clearRect(0, 0, canvas2.width, canvas2.height);
    context2.save();
    context2.translate(Number(valT), 0);
    context2.scale(Number(valS), Number(valS));
    trisquare.drawTriSquare(context2);
    context2.restore();

}
sliderS.oninput = sliderChange;
sliderS.value = "2";
sliderT.oninput = sliderChange;
sliderT.value = "0";
sliderChange();



// 2026 Workbook
