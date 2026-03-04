// @ts-check
export {}; // null statement to tell VSCode we're doing a module

// Get canvas and context
let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Canvas is not HTML Element");
let ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Could not get 2D context");

// Get controls
const lineCheck = document.getElementById("lineCheck");
const bezierCheck = document.getElementById("bezierCheck");
const numPointsSlider = document.getElementById("numPointsSlider");
const numPointsLabel = document.getElementById("numPointsLabel");

// Spiral function: returns [x, y] for a given u (0 <= u <= 1)
function spiral(u) {
    const x = 200 + 180 * u * Math.cos(2 * Math.PI * 4 * u);
    const y = 200 + 180 * u * Math.sin(2 * Math.PI * 4 * u);
    return [x, y];
}

// Function to compute Bezier control points for approximate curve
// Simple approach: use 2 consecutive points to form cubic Bezier
// Improved Bezier approximation using tangent (Catmull-Rom style)
function drawBezierSpiral(points) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    for (let i = 0; i < points.length - 1; i++) {
        // Get neighboring points
        const p0 = i > 0 ? points[i - 1] : points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i < points.length - 2 ? points[i + 2] : p2;

        // Catmull-Rom to Bezier conversion
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
    }

    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw the spiral with given number of points and mode (dots/lines/Bezier)
function drawSpiral() {
    const numPoints = parseInt(numPointsSlider.value);
    numPointsLabel.textContent = numPoints;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

    let points = [];
    for (let i = 0; i <= numPoints; i++) {
        const u = i / numPoints;
        points.push(spiral(u));
    }

    if (bezierCheck.checked) {
        drawBezierSpiral(points);
    } else if (lineCheck.checked) {
        // Connect points with lines
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        // Draw individual dots
        ctx.fillStyle = "red";
        for (let p of points) {
            ctx.beginPath();
            ctx.arc(p[0], p[1], 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

// Draw initially
drawSpiral();

// Redraw when slider or checkboxes change
numPointsSlider.addEventListener("input", drawSpiral);
lineCheck.addEventListener("change", drawSpiral);
bezierCheck.addEventListener("change", drawSpiral);