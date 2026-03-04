// @ts-check
/* jshint -W069, esversion:6 */

import { draggablePoints } from "../libs/CS559/dragPoints.js";

let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Could not get 2D context");

let thePoints = [
    [200, 80],
    [300, 140],
    [300, 260],
    [200, 320],
    [100, 260],
    [100, 140]
];

function draw(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (thePoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(thePoints[0][0], thePoints[0][1]);
        for (let i = 1; i < thePoints.length; i++) {
            ctx.lineTo(thePoints[i][0], thePoints[i][1]);
        }
        ctx.closePath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    for (let point of thePoints) {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 6, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
    }
}

draggablePoints(canvas, thePoints, draw);
window.requestAnimationFrame(draw);