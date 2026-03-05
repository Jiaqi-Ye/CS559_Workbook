// @ts-check
export {};

let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Could not get context");

// Helper to convert quadratic segment to cubic
function quadraticAsCubic(ctx, p0x, p0y, p1x, p1y, p2x, p2y) {
    const c1x = p0x + (2 / 3) * (p1x - p0x);
    const c1y = p0y + (2 / 3) * (p1y - p0y);
    const c2x = p2x + (2 / 3) * (p1x - p2x);
    const c2y = p2y + (2 / 3) * (p1y - p2y);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2x, p2y);
}
  
ctx.lineWidth = 5;
ctx.fillStyle = "#CCC";
ctx.strokeStyle = "black";

// Starting point (M 150,100)
ctx.beginPath();
ctx.moveTo(150, 100);

// Q 150,150 100,150
quadraticAsCubic(ctx, 150, 100, 150, 150, 100, 150);
// Q 50,150 50,100
quadraticAsCubic(ctx, 100, 150, 50, 150, 50, 100);
// Q 50,50 100,50
quadraticAsCubic(ctx, 50, 100, 50, 50, 100, 50);
// Q 100,100 150,100
quadraticAsCubic(ctx, 100, 50, 100, 100, 150, 100);

ctx.closePath();
ctx.fill();
ctx.stroke();