/*jshint esversion: 6 */
// @ts-check
/* infrastructure for transformation demos */
/* note: we have functions that build the demos, rather
   than having separate web pages for each demo because
   it avoids having to resize the iframes, which seems to
   be a hassle. */
/* this code was written by Gemini 3 using GitHub Copilot,
   under the guidance of Gleicher. */

   /*
export {
    drawGrid,
    setupDraggablePoints,
    drawGridFunction,
    createDemoBox,
    demoTranslate,
    demoSimilarity,
    demoAffine,
    demoProjective,
    demoTwoCanvas,
    demoThreeCanvas,
    demoIdentity,
    demoBilinear,
    demoHermite,
    demoWarpBilinear,
    demoWarpBicubic,
    demoBowl,
    demoWarpBilinear5,
    demoWarpBicubic5
};
 */
import { 
    translate, 
    rotate, 
    scale, 
    shearX, 
    shearY,
    getTranslationMatrix,
    getSimilarityMatrix,
    getAffineMatrix,
    getProjectiveMatrix,
    getBilinearFunction,
    getBicubicHermiteFunction,
    getGridPoints,
    getPiecewiseBilinear,
    getPiecewiseBicubic
} from "./computeTransforms.js";

/**
 * Draw a coordinate system grid on the canvas
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {number[]} matrix - 3x3 projective transformation matrix (row-major)
 * @param {object} [options]
 * @param {string} [options.gridColor]
 * @param {string} [options.axisColor]
 * @param {boolean} [options.drawShapes]
 * @param {boolean} [options.clear]
 * @param {boolean} [options.limitGrid] - Only draw a fixed small grid
 */
export function drawGrid(canvas, matrix, options={}) {
    const gridColor = options.gridColor || "gray";
    const axisColor = options.axisColor || "black";
    const drawShapes = options.drawShapes !== false; // Default true
    const shouldClear = options.clear !== false; // Default true
    const limitGrid = options.limitGrid || false;

    if (!matrix) matrix = [1,0,0, 0,1,0, 0,0,1];
    const context = canvas.getContext("2d");
    if (!context) return;
    
    // Clear the canvas
    if (shouldClear) context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.save();
    
    // Define the grid boundaries (in logical units)
    // We assume a reasonable range for the demo, but extend if needed
    let minX = -200, maxX = 200, minY = -200, maxY = 200;
    const spacing = 40;
    
    if (limitGrid) {
        minX = -120; maxX = 120; minY = -120; maxY = 120;
    } else 
    // Attempt to compute better bounds based on canvas size and inverse matrix
    if (matrix) {
        try {
            const m = matrix;
            // Determinant
            const det = m[0]*(m[4]*m[8] - m[5]*m[7]) - m[1]*(m[3]*m[8] - m[5]*m[6]) + m[2]*(m[3]*m[7] - m[4]*m[6]);
            
            if (Math.abs(det) > 1e-6) {
                const invDet = 1.0 / det;
                const inv = [
                    (m[4]*m[8] - m[5]*m[7]) * invDet,
                    (m[2]*m[7] - m[1]*m[8]) * invDet,
                    (m[1]*m[5] - m[2]*m[4]) * invDet,
                    (m[5]*m[6] - m[3]*m[8]) * invDet,
                    (m[0]*m[8] - m[2]*m[6]) * invDet,
                    (m[2]*m[3] - m[0]*m[5]) * invDet,
                    (m[3]*m[7] - m[4]*m[6]) * invDet,
                    (m[1]*m[6] - m[0]*m[7]) * invDet,
                    (m[0]*m[4] - m[1]*m[3]) * invDet
                ];

                const corners = [
                    [-canvas.width/2, -canvas.height/2],
                    [canvas.width/2, -canvas.height/2],
                    [canvas.width/2, canvas.height/2],
                    [-canvas.width/2, canvas.height/2]
                ];
                
                let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
                let allValid = true;

                corners.forEach(p => {
                    const x = p[0];
                    const y = p[1];
                    // Apply inverse: Inv * [x, y, 1]
                    const u_raw = inv[0]*x + inv[1]*y + inv[2];
                    const v_raw = inv[3]*x + inv[4]*y + inv[5];
                    const w_raw = inv[6]*x + inv[7]*y + inv[8];
                    
                    // If w is small, we are near infinity
                    if (Math.abs(w_raw) < 1e-5) {
                        allValid = false;
                    } else {
                        const u = u_raw / w_raw;
                        const v = v_raw / w_raw;
                        if (u < minU) minU = u;
                        if (u > maxU) maxU = u;
                        if (v < minV) minV = v;
                        if (v > maxV) maxV = v;
                    }
                });

                // If we found valid bounds and they aren't insane, use them
                // We clamp to a reasonable maximum to prevent hanging the browser on extreme zooms
                if (allValid && minU !== Infinity) {
                     const pad = 20;
                     const limit = 2000; // Limit the grid size for performance
                     
                     // Helper to expand range strictly
                     const expand = (currMin, currMax, newMin, newMax) => {
                         let nMin = Math.floor(newMin / spacing) * spacing - pad;
                         let nMax = Math.ceil(newMax / spacing) * spacing + pad;
                         // Clamp to limits
                         nMin = Math.max(nMin, -limit);
                         nMax = Math.min(nMax, limit);
                         
                         // Only extend, don't shrink (unless it was huge)
                         return [Math.min(currMin, nMin), Math.max(currMax, nMax)];
                     };

                     [minX, maxX] = expand(minX, maxX, minU, maxU);
                     [minY, maxY] = expand(minY, maxY, minV, maxV);
                }
            }
        } catch (e) {
            // Fallback to defaults
            console.error(e);
        }
    }
    
    // Helper to transform points: Logical(u,v) -> Matrix -> Screen(x,y)
    /**
     * @param {number} u 
     * @param {number} v 
     * @returns {[number, number]}
     */
    function transform(u,v) {
        // Projective transform:
        // [ m0 m1 m2 ]   [ u ]
        // [ m3 m4 m5 ] * [ v ]
        // [ m6 m7 m8 ]   [ 1 ]
        
        const m = matrix;
        const x_trans = m[0]*u + m[1]*v + m[2];
        const y_trans = m[3]*u + m[4]*v + m[5];
        const w_trans = m[6]*u + m[7]*v + m[8];
        
        // Perspective division
        // Avoid division by zero
        const w = (Math.abs(w_trans) < 0.00001) ? 0.00001 : w_trans;
        
        const x_screen = x_trans / w;
        const y_screen = y_trans / w;
        
        // Move (0,0) to center of canvas
        return [x_screen + canvas.width/2, y_screen + canvas.height/2];
    }
    
    // Helper to get w coordinate
    function getW(u, v) {
        const m = matrix;
        return m[6]*u + m[7]*v + m[8];
    }

    // Safely draw a line from (u1,v1) to (u2,v2) handling projective infinity crossing
    function drawSafeLine(u1, v1, u2, v2) {
        const subdiv = 20; // Step size
        const dist = Math.sqrt((u2-u1)**2 + (v2-v1)**2);
        const steps = Math.ceil(dist / subdiv);
        
        let started = false;
        
        // Computes point at t, returns [u, v, w]
        const getPt = (t) => {
           const u = u1 + (u2-u1)*t;
           const v = v1 + (v2-v1)*t;
           return {u, v, w: getW(u,v)};
        };

        let lastT = 0;
        let lastPt = getPt(0);
        
        if (Math.abs(lastPt.w) > 0.0001) {
            const p = transform(lastPt.u, lastPt.v);
            context.moveTo(p[0], p[1]);
            started = true;
        }

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const pt = getPt(t);
            
            // Check for sign change in W (crossing infinity)
            if (lastPt.w * pt.w <= 0) {
                // Crossing detected. Stop current segment. 
                // Move to new point to skip the "wrap around" line.
                const p = transform(pt.u, pt.v);
                context.moveTo(p[0], p[1]);
                started = true;
            } else {
                 const p = transform(pt.u, pt.v);
                 if (!started) {
                     context.moveTo(p[0], p[1]);
                     started = true;
                 } else {
                     context.lineTo(p[0], p[1]);
                 }
            }
            lastPt = pt;
        }
    }

    // Draw grid lines (Thin gray)
    context.lineWidth = 1;
    context.strokeStyle = gridColor;
    context.beginPath();

    // Vertical lines
    const startU = Math.ceil(minX / spacing) * spacing;
    for (let u = startU; u <= maxX; u += spacing) {
        // Skip axis for now (it will be drawn in black)
        if (Math.abs(u) < 0.001) continue;
        drawSafeLine(u, minY, u, maxY);
    }

    // Horizontal lines
    const startV = Math.ceil(minY / spacing) * spacing;
    for (let v = startV; v <= maxY; v += spacing) {
        // Skip axis
        if (Math.abs(v) < 0.001) continue;
        drawSafeLine(minX, v, maxX, v);
    }
    context.stroke();
    
    // Draw Axes (Black, thicker)
    context.lineWidth = 2;
    context.strokeStyle = axisColor;
    context.beginPath();
    
    // X Axis: (minX, 0) to (maxX, 0)
    drawSafeLine(minX, 0, maxX, 0);
    
    // Y Axis: (0, minY) to (0, maxY)
    drawSafeLine(0, minY, 0, maxY);
    
    context.stroke();

    if (drawShapes) {
        // Helper to draw a closed polygon
        /**
         * @param {number[][]} points 
         * @param {string} color 
         */
        function drawPolygon(points, color) {
            context.fillStyle = color;
            context.strokeStyle = "black";
            context.lineWidth = 2;
            context.beginPath();
            const start = transform(points[0][0], points[0][1]);
            context.moveTo(start[0], start[1]);
            for (let i = 1; i < points.length; i++) {
                const p = transform(points[i][0], points[i][1]);
                context.lineTo(p[0], p[1]);
            }
            context.closePath();
            context.fill();
            context.stroke();
        }

        // Draw a red square in the first quadrant
        drawPolygon([[40, 40], [80, 40], [80, 80], [40, 80]], "rgba(255, 0, 0, 0.5)");

        // Draw a green triangle in the second quadrant
        drawPolygon([[-60, 40], [-20, 40], [-40, 80]], "rgba(0, 255, 0, 0.5)");

        // Draw a blue F shape in the fourth quadrant to show orientation clearly
        drawPolygon([
            [40, -80], [80, -80], [80, -70], [50, -70], 
            [50, -60], [70, -60], [70, -50], [50, -50], 
            [50, -20], [40, -20]
        ], "rgba(0, 0, 255, 0.5)");

        // Draw a yellow star in the third quadrant
        const starPoints = [];
        const cx = -60, cy = -60, ro = 30, ri = 12;
        for(let i=0; i<10; i++) {
            const angle = -Math.PI/2 + i * Math.PI / 5;
            const r = (i % 2 === 0) ? ro : ri;
            starPoints.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
        }
        drawPolygon(starPoints, "rgba(255, 255, 0, 0.5)");
    }
    
    context.restore();
}

/**
 * Setup a canvas with draggable points.
 * Handles mouse events and redrawing.
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {Array<{x:number, y:number}>} points - The points to control
 * @param {function(Array<{x:number, y:number}>): void} renderCallback - Function to draw the content (grid) before points are drawn
 */
export function setupDraggablePoints(canvas, points, renderCallback) {
    const context = canvas.getContext("2d");
    let draggingPoint = null;

    function draw() {
        // User content (clears canvas usually)
        renderCallback(points);

        // Draw Handles
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        context.save();
        context.translate(cx, cy);
        
        points.forEach(p => {
             context.beginPath();
             context.arc(p.x, p.y, 8, 0, Math.PI*2);
             context.fillStyle = "black";
             context.fill();
             context.strokeStyle = "white";
             context.lineWidth = 2;
             context.stroke();
        });
        context.restore();
    }

    canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left - canvas.width/2;
        const my = e.clientY - rect.top - canvas.height/2;

        for (let i = points.length - 1; i >= 0; i--) {
            const d = (mx - points[i].x)**2 + (my - points[i].y)**2;
            if (d < 100) { // 10px radius squared
                draggingPoint = i;
                e.preventDefault();
                break;
            }
        }
    });

    window.addEventListener("mousemove", (e) => {
        if (draggingPoint !== null) {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left - canvas.width/2;
            const my = e.clientY - rect.top - canvas.height/2;
            
            points[draggingPoint].x = mx;
            points[draggingPoint].y = my;
            draw();
        }
    });

    window.addEventListener("mouseup", () => {
        draggingPoint = null;
    });

    // Initial draw
    draw();    
    return draw;}

/**
 * Draw a coordinate system grid on the canvas using a general function
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {function(number, number): number[]} func - Function mapping (u,v) -> [x,y]
 */
export function drawGridFunction(canvas, func) {
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Helper to transform and center
    function transform(u,v) {
        const p = func(u,v);
        // We assume the function returns logical coordinates relative to origin
        // So we just add the canvas center to map to screen space
        return [p[0] + cx, p[1] + cy];
    }
    
    // Check if point is inside canvas
    function isInside(p) {
        return p[0] >= 0 && p[0] <= w && p[1] >= 0 && p[1] <= h;
    }

    const spacing = 40;
    // Grid range: slightly larger than canvas (relative to center)
    const rangeX = w/2 + spacing;
    const rangeY = h/2 + spacing;
    
    // Draw curved line segment
    function drawCurvedLine(u1, v1, u2, v2) {
        // Check visibility of endpoints
        const pStart = transform(u1, v1);
        const pEnd = transform(u2, v2);
        
        // "only draw ... if one of the points is in the canvas"
        if (!isInside(pStart) && !isInside(pEnd)) return;
        
        const steps = 4;
        context.beginPath();
        context.moveTo(pStart[0], pStart[1]);
        
        for (let i=1; i<=steps; i++) {
            const t = i/steps;
            const u = u1 + (u2-u1)*t;
            const v = v1 + (v2-v1)*t;
            const p = transform(u, v);
            context.lineTo(p[0], p[1]);
        }
        context.stroke();
    }
    
    // Vertical Lines
    const startU = Math.ceil(-rangeX / spacing) * spacing;
    const endU = Math.floor(rangeX / spacing) * spacing;
    
    context.lineWidth = 1;
    context.strokeStyle = "gray";
    
    for (let u = startU; u <= endU; u += spacing) {
        if (Math.abs(u) < 0.001) continue; // Skip axis
        // We draw the line from -rangeY to rangeY
        // We iterate segments
         for (let v = -rangeY; v < rangeY; v += spacing) {
            drawCurvedLine(u, v, u, v + spacing);
        }
    }

    // Horizontal Lines
    const startV = Math.ceil(-rangeY / spacing) * spacing;
    const endV = Math.floor(rangeY / spacing) * spacing;
    
    for (let v = startV; v <= endV; v += spacing) {
        if (Math.abs(v) < 0.001) continue;
        for (let u = -rangeX; u < rangeX; u += spacing) {
            drawCurvedLine(u, v, u + spacing, v);
        }
    }

    // Axes
    context.lineWidth = 2;
    context.strokeStyle = "black";
    
    // Y Axis (u=0)
    for (let v = -rangeY; v < rangeY; v += spacing) {
         drawCurvedLine(0, v, 0, v + spacing);
    }
    // X Axis (v=0)
    for (let u = -rangeX; u < rangeX; u += spacing) {
         drawCurvedLine(u, 0, u + spacing, 0);
    }
    
    // Objects
    // Helper to draw a closed polygon
    /**
     * @param {number[][]} points 
     * @param {string} color 
     */
    function drawFnPolygon(points, color) {
        context.fillStyle = color;
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.beginPath();
        
        const steps = 4;

        // Iterate edges
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            
            // Subdivide edge
            for (let s = 0; s < steps; s++) {
                const t = s / steps;
                const u = p1[0] + (p2[0] - p1[0]) * t;
                const v = p1[1] + (p2[1] - p1[1]) * t;
                const p = transform(u, v);
                if (i === 0 && s === 0) context.moveTo(p[0], p[1]);
                else context.lineTo(p[0], p[1]);
            }
        }
        
        context.closePath();
        context.fill();
        context.stroke();
    }
    
    // Same shapes as drawGrid
     // Draw a red square in the first quadrant
    drawFnPolygon([[40, 40], [80, 40], [80, 80], [40, 80]], "rgba(255, 0, 0, 0.5)");

    // Draw a green triangle in the second quadrant
    drawFnPolygon([[-60, 40], [-20, 40], [-40, 80]], "rgba(0, 255, 0, 0.5)");

    // Draw a blue F shape in the fourth quadrant to show orientation clearly
    drawFnPolygon([
        [40, -80], [80, -80], [80, -70], [50, -70], 
        [50, -60], [70, -60], [70, -50], [50, -50], 
        [50, -20], [40, -20]
    ], "rgba(0, 0, 255, 0.5)");

    // Draw a yellow star in the third quadrant
    const starPoints = [];
    const scx = -60, scy = -60, ro = 30, ri = 12;
    for(let i=0; i<10; i++) {
        const angle = -Math.PI/2 + i * Math.PI / 5;
        const r = (i % 2 === 0) ? ro : ri;
        starPoints.push([scx + r * Math.cos(angle), scy + r * Math.sin(angle)]);
    }
    drawFnPolygon(starPoints, "rgba(255, 255, 0, 0.5)");
    
    context.restore();
}

/**
 * Create a demo box with a title, description, and interactive canvas.
 * 
 * @param {HTMLElement} container - The container element to populate
 * @param {string} title - The title of the demo
 * @param {string} description - The explanation text
 * @param {Array<{x:number, y:number}>} initialPoints - Initial point positions
 * @param {function(HTMLCanvasElement, Array<{x:number, y:number}>): void} renderCallback - Callback for drawing, receives (canvas, points)
 */
export function createDemoBox(container, title, description, initialPoints, renderCallback) {
    if (!container) return;
    
    container.classList.add("trdemo-box");
    
    const h1 = document.createElement("h1");
    h1.textContent = title;
    container.appendChild(h1);
    
    const p = document.createElement("p");
    p.textContent = description;
    container.appendChild(p);
    
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    
    // Create a wrapper for canvas + button relative positioning
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    // Deep copy initial points for reset
    const savedPoints = initialPoints.map(p => ({...p}));

    const draw = setupDraggablePoints(canvas, initialPoints, (points) => {
        renderCallback(canvas, points);
    });
    
    const btn = document.createElement("button");
    btn.textContent = "Reset";
    btn.style.position = "absolute";
    btn.style.bottom = "100%";
    btn.style.right = "-60px"; // Position to the right of the canvas
    btn.onclick = () => {
        // Reset points in place
        for(let i=0; i<initialPoints.length; i++) {
            initialPoints[i].x = savedPoints[i].x;
            initialPoints[i].y = savedPoints[i].y;
        }
        draw();
    };
    wrapper.appendChild(btn);

    return draw;
}


// =========================================================
// Demo Functions for t1.html
// =========================================================

export function demoTranslate(id) {
    createDemoBox(
        document.getElementById(id),
        "Interactive Translation",
        "Drag the black dot to move the coordinate system.",
        [{x: 0, y: 0}],
        (canvas, points) => {
            const tx = points[0].x;
            const ty = points[0].y;
            const matrix = translate(tx, ty);
            drawGrid(canvas, matrix);
        }
    );
}

export function demoSimilarity(id) {
    createDemoBox(
        document.getElementById(id),
        "Interactive Similarity",
        "Drag the two black dots to translate, rotate, and scale.",
        [{x: -100, y: 0}, {x: 100, y: 0}],
        (canvas, points) => {
            const src = [-100, 0, 100, 0];
            const dst = [];
            points.forEach(p => dst.push(p.x, p.y));
            
            const matrix = getSimilarityMatrix(src, dst);
            if (matrix) drawGrid(canvas, matrix);
        }
    );
}

export function demoAffine(id) {
    createDemoBox(
        document.getElementById(id),
        "Interactive Affine",
        "Drag the three black dots to apply an affine transformation.",
        [
            {x: -100, y: 100},
            {x: -100, y: -100},
            {x: 100, y: -100}
        ],
        (canvas, points) => {
            const src = [-100, 100, -100, -100, 100, -100];
            const dst = [];
            points.forEach(p => dst.push(p.x, p.y));

            const matrix = getAffineMatrix(src, dst);
            if (matrix) drawGrid(canvas, matrix);
        }
    );
}

export function demoProjective(id) {
    createDemoBox(
        document.getElementById(id),
        "Interactive Projective",
        "Drag the four black dots to apply a projective transformation.",
        [
            {x: -100, y: -100},
            {x: 100, y: -100},
            {x: 100, y: 100},
            {x: -100, y: 100}
        ],
        (canvas, points) => {
            const src = [-100, -100, 100, -100, 100, 100, -100, 100];
            const dst = [];
            points.forEach(p => dst.push(p.x, p.y));

            const matrix = getProjectiveMatrix(src, dst);
            if (matrix) drawGrid(canvas, matrix);
        }
    );
}

export function demoTwoCanvas(id, hideInitialObjects=true) {
    const container = document.getElementById(id);
    if (!container) return;
    
    container.classList.add("trdemo-box");

    const h1 = document.createElement("h1");
    h1.textContent = "Coordinate System Transformation";
    container.appendChild(h1);
    
    // Description
    const p = document.createElement("p");
    p.textContent = "Left: Define object (click to add points). Right: Drag dots to transform the blue coordinate system.";
    container.appendChild(p);

    const flexDiv = document.createElement("div");
    flexDiv.style.display = "flex";
    flexDiv.style.flexWrap = "wrap";
    flexDiv.style.gap = "10px";
    flexDiv.style.justifyContent = "center";
    container.appendChild(flexDiv);

    // Left Canvas
    const leftCanvas = document.createElement("canvas");
    leftCanvas.width = 280;
    leftCanvas.height = 280;
    leftCanvas.style.border = "1px solid gray";
    flexDiv.appendChild(leftCanvas);

    // Right Canvas Wrapper
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    const rightCanvas = document.createElement("canvas");
    rightCanvas.width = 280;
    rightCanvas.height = 280;
    rightCanvas.style.border = "1px solid gray";
    wrapper.appendChild(rightCanvas);
    flexDiv.appendChild(wrapper);

    // State
    const userPoints = []; 
    // Control points for right canvas (Origin, X-Axis)
    // Initial scaling 40% -> X-Axis target should be 0.4 * 100 = 40 units away
    // Place origin in center of first grid cell (20, 20)
    // X-Axis point at (20+80, 20) = (100, 20) - Changed to match user request
    const controlPoints = [{x: 20, y: 20}, {x: 100, y: 20}];

    // Draw Left Canvas (Static Grid + User Points)
    const drawLeft = () => {
        const ctx = leftCanvas.getContext("2d");
        drawGrid(leftCanvas, [1,0,0, 0,1,0, 0,0,1], {
            gridColor: "lightblue",
            axisColor: "blue",
            drawShapes: !hideInitialObjects, 
            clear: true,
            limitGrid: true
        });
        
        ctx.save();
        ctx.translate(leftCanvas.width/2, leftCanvas.height/2);
        ctx.fillStyle = "blue"; 
        ctx.strokeStyle = "darkblue";
        ctx.lineWidth = 2;
        userPoints.forEach(p => {
             ctx.beginPath();
             ctx.arc(p.x, p.y, 6, 0, Math.PI*2);
             ctx.fill();
             ctx.stroke();
        });
        ctx.restore();
    };

    // Callback for Right Canvas (called by setupDraggablePoints)
    const renderRight = (points) => {
        // Draw World Grid (Gray)
        drawGrid(rightCanvas, [1,0,0, 0,1,0, 0,0,1], {
            gridColor: "#808080", // Darker gray
            axisColor: "black",
            drawShapes: false,
            clear: true
        });

        // Compute Similarity (Origin -> pt0, X(100) -> pt1)
        const src = [0, 0, 100, 0];
        const dst = [points[0].x, points[0].y, points[1].x, points[1].y];
        const mat = getSimilarityMatrix(src, dst);

        if (mat) {
             // Draw Object Grid (Blue) with Shapes
             drawGrid(rightCanvas, mat, {
                gridColor: "lightblue",
                axisColor: "blue",
                drawShapes: !hideInitialObjects,
                clear: false,
                limitGrid: true
             });

             // Draw User Points Transformed
            const ctx = rightCanvas.getContext("2d");
            ctx.save();
            ctx.fillStyle = "blue"; 
            ctx.strokeStyle = "darkblue";
            ctx.lineWidth = 2;
            
            const m = mat;
            const w = rightCanvas.width;
            const h = rightCanvas.height;
            
            userPoints.forEach(pt => {
                 const xt = m[0]*pt.x + m[1]*pt.y + m[2];
                 const yt = m[3]*pt.x + m[4]*pt.y + m[5];
                 const wt = m[6]*pt.x + m[7]*pt.y + m[8];
                 const div = (Math.abs(wt)<1e-6) ? 1e-6 : wt;
                 const x = xt/div + w/2;
                 const y = yt/div + h/2;

                 ctx.beginPath();
                 ctx.arc(x, y, 6, 0, Math.PI*2);
                 ctx.fill();
                 ctx.stroke();
            });
            ctx.restore();
        }
    };

    // Setup Right Interaction
    const drawRight = setupDraggablePoints(rightCanvas, controlPoints, renderRight);

    // Left Interaction
    leftCanvas.addEventListener("mousedown", (e) => {
         const rect = leftCanvas.getBoundingClientRect();
         const x = e.clientX - rect.left - leftCanvas.width/2;
         const y = e.clientY - rect.top - leftCanvas.height/2;
         userPoints.push({x, y});
         drawLeft();
         drawRight(); 
    });

    // Reset Buttons Container
    const btnContainer = document.createElement("div");
    btnContainer.style.width = "100%";
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "center";
    btnContainer.style.gap = "40px";
    btnContainer.style.marginTop = "10px";
    container.appendChild(btnContainer);

    // Reset Left (User Points)
    const btnLeft = document.createElement("button");
    btnLeft.textContent = "Clear Left Points";
    btnLeft.onclick = () => {
        userPoints.length = 0;
        drawLeft();
        drawRight();
    };
    btnContainer.appendChild(btnLeft);

    // Reset Right (Transform)
    const btnRight = document.createElement("button");
    btnRight.textContent = "Reset Right Transform";
    btnRight.onclick = () => {
        controlPoints[0].x = 20; controlPoints[0].y = 20;
        controlPoints[1].x = 100; controlPoints[1].y = 20;
        drawLeft();
        drawRight();
    };
    btnContainer.appendChild(btnRight);

    // Initial draw
    drawLeft();
    drawRight();
}

/**
 * Three Canvas Demo: User Points -> Purple (Middle) -> Gray (Right)
 * Blue (Left) -> Transformed by Middle Controls -> Purple Canvas
 * Purple Canvas Content (Blue Grid + User Points) -> Transformed by Right Controls -> Gray Canvas
 * 
 * @param {string} id 
 * @param {boolean} hideInitialObjects 
 */
export function demoThreeCanvas(id, hideInitialObjects=true) {
    const container = document.getElementById(id);
    if (!container) return;
    
    container.classList.add("trdemo-box");
    // Reduce padding to fit 3 canvases
    container.style.padding = "10px";

    const h1 = document.createElement("h1");
    h1.textContent = "Composition of Transformations";
    container.appendChild(h1);
    
    const p = document.createElement("p");
    p.textContent = "Left: Object Space (Blue). Middle: Purple Grid (Blue transformed). Right: World Space (Gray, shows Purple transformed).";
    container.appendChild(p);

    const flexDiv = document.createElement("div");
    flexDiv.style.display = "flex";
    flexDiv.style.flexWrap = "wrap";
    flexDiv.style.gap = "5px"; // Reduced gap
    flexDiv.style.justifyContent = "center";
    container.appendChild(flexDiv);

    const size = 180; // Slightly smaller to ensure fit

    // --- LEFT CANVAS ---
    const leftCanvas = document.createElement("canvas");
    leftCanvas.width = size;
    leftCanvas.height = size;
    leftCanvas.style.border = "1px solid gray";
    flexDiv.appendChild(leftCanvas);

    // --- MIDDLE CANVAS (Wrapped) ---
    const midWrapper = document.createElement("div");
    midWrapper.style.position = "relative";
    midWrapper.style.display = "inline-block";
    const midCanvas = document.createElement("canvas");
    midCanvas.width = size;
    midCanvas.height = size;
    midCanvas.style.border = "1px solid gray";
    midWrapper.appendChild(midCanvas);
    flexDiv.appendChild(midWrapper);

    // --- RIGHT CANVAS (Wrapped) ---
    const rightWrapper = document.createElement("div");
    rightWrapper.style.position = "relative";
    rightWrapper.style.display = "inline-block";
    const rightCanvas = document.createElement("canvas");
    rightCanvas.width = size;
    rightCanvas.height = size;
    rightCanvas.style.border = "1px solid gray";
    rightWrapper.appendChild(rightCanvas);
    flexDiv.appendChild(rightWrapper);


    // --- STATE ---
    const userPoints = []; 
    // Controls for Middle Canvas (Transforms Blue -> Purple)
    const ctrlMid = [{x: 20, y: 20}, {x: 60, y: 20}]; // Scale 0.4
    // Controls for Right Canvas (Transforms Purple -> Gray)
    const ctrlRight = [{x: -50, y: -50}, {x: 50, y: -50}]; // Identity-like but shifted

    // --- DRAWING ---

    const drawLeft = () => {
        const ctx = leftCanvas.getContext("2d");
        drawGrid(leftCanvas, [1,0,0, 0,1,0, 0,0,1], {
            gridColor: "lightblue",
            axisColor: "blue",
            drawShapes: !hideInitialObjects, 
            clear: true,
            limitGrid: true
        });
        
        ctx.save();
        ctx.translate(leftCanvas.width/2, leftCanvas.height/2);
        ctx.fillStyle = "blue"; 
        ctx.strokeStyle = "darkblue";
        ctx.lineWidth = 2;
        userPoints.forEach(p => {
             ctx.beginPath();
             ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
             ctx.fill();
             ctx.stroke();
        });
        ctx.restore();
    };

    const renderMid = (points) => {
        // Draw Purple Grid (Base for this canvas)
        drawGrid(midCanvas, [1,0,0, 0,1,0, 0,0,1], {
            gridColor: "#D8BFD8", // Thistle (Light Purple)
            axisColor: "purple",
            drawShapes: false,
            clear: true
        });

        // Compute Transform Blue -> Purple
        const src = [0, 0, 100, 0];
        const dst = [points[0].x, points[0].y, points[1].x, points[1].y];
        const matBlueToPurple = getSimilarityMatrix(src, dst);

        if (matBlueToPurple) {
             // Draw Blue Grid inside Purple System
             drawGrid(midCanvas, matBlueToPurple, {
                gridColor: "lightblue",
                axisColor: "blue",
                drawShapes: !hideInitialObjects,
                clear: false,
                limitGrid: true
             });

             // Transform User Points: Blue -> Purple
             const ctx = midCanvas.getContext("2d");
             ctx.save();
             ctx.fillStyle = "blue"; 
             ctx.strokeStyle = "darkblue";
             ctx.lineWidth = 2;
             
             const m = matBlueToPurple;
             const w = midCanvas.width;
             const h = midCanvas.height;
             
             userPoints.forEach(pt => {
                  const xt = m[0]*pt.x + m[1]*pt.y + m[2];
                  const yt = m[3]*pt.x + m[4]*pt.y + m[5];
                  const wt = m[6]*pt.x + m[7]*pt.y + m[8];
                  const div = (Math.abs(wt)<1e-6) ? 1e-6 : wt;
                  
                  ctx.beginPath();
                  ctx.arc(xt/div + w/2, yt/div + h/2, 4, 0, Math.PI*2);
                  ctx.fill();
                  ctx.stroke();
             });
             ctx.restore();
        }
        
        // Trigger right redraw because Middle content (composition source) changed
        requestAnimationFrame(updateRight); 
    };

    const renderRight = (points) => {
        // Draw Gray Grid (Base)
        drawGrid(rightCanvas, [1,0,0, 0,1,0, 0,0,1], {
            gridColor: "#808080",
            axisColor: "black",
            drawShapes: false,
            clear: true
        });

        // Compute Transform Purple -> Gray
        const src = [0, 0, 100, 0];
        const dst = [points[0].x, points[0].y, points[1].x, points[1].y];
        const matPurpleToGray = getSimilarityMatrix(src, dst);

        if (matPurpleToGray) {
            // Draw Purple Grid inside Gray System
            drawGrid(rightCanvas, matPurpleToGray, {
                gridColor: "#D8BFD8", // Light Purple
                axisColor: "purple",
                drawShapes: false,
                clear: false,
                limitGrid: true
            });

             // Also need Blue -> Purple matrix to compose
             // Re-compute it here or store it. Let's recompute from ctrlMid.
             const dstBlue = [ctrlMid[0].x, ctrlMid[0].y, ctrlMid[1].x, ctrlMid[1].y];
             const matBlueToPurple = getSimilarityMatrix(src, dstBlue); // src is same [0,0,100,0]

             if (matBlueToPurple) {
                 // Compose: M_total = M_purple_to_gray * M_blue_to_purple
                 // Matrices are 3x3 row major. 
                 // transformDemo uses: x' = m0*x + m1*y + m2 ...
                 // This corresponds to standard matrix mult of column vectors: v' = M * v
                 // Composite: v'' = M2 * (M1 * v) = (M2 * M1) * v
                 
                 const m1 = matBlueToPurple;
                 const m2 = matPurpleToGray;
                 
                 const comp = [
                     m2[0]*m1[0] + m2[1]*m1[3] + m2[2]*m1[6],
                     m2[0]*m1[1] + m2[1]*m1[4] + m2[2]*m1[7],
                     m2[0]*m1[2] + m2[1]*m1[5] + m2[2]*m1[8],
                     
                     m2[3]*m1[0] + m2[4]*m1[3] + m2[5]*m1[6],
                     m2[3]*m1[1] + m2[4]*m1[4] + m2[5]*m1[7],
                     m2[3]*m1[2] + m2[4]*m1[5] + m2[5]*m1[8],
                     
                     m2[6]*m1[0] + m2[7]*m1[3] + m2[8]*m1[6],
                     m2[6]*m1[1] + m2[7]*m1[4] + m2[8]*m1[7],
                     m2[6]*m1[2] + m2[7]*m1[5] + m2[8]*m1[8]
                 ];

                 // Draw Blue Grid transformed by Composite
                 drawGrid(rightCanvas, comp, {
                    gridColor: "lightblue",
                    axisColor: "blue",
                    drawShapes: !hideInitialObjects,
                    clear: false,
                    limitGrid: true
                 });

                 // Draw User Points
                 const ctx = rightCanvas.getContext("2d");
                 ctx.save();
                 ctx.fillStyle = "blue"; 
                 ctx.strokeStyle = "darkblue";
                 ctx.lineWidth = 2;
                 
                 const w = rightCanvas.width;
                 const h = rightCanvas.height;
                 
                 userPoints.forEach(pt => {
                      const xt = comp[0]*pt.x + comp[1]*pt.y + comp[2];
                      const yt = comp[3]*pt.x + comp[4]*pt.y + comp[5];
                      const wt = comp[6]*pt.x + comp[7]*pt.y + comp[8];
                      const div = (Math.abs(wt)<1e-6) ? 1e-6 : wt;
                      
                      ctx.beginPath();
                      ctx.arc(xt/div + w/2, yt/div + h/2, 4, 0, Math.PI*2);
                      ctx.fill();
                      ctx.stroke();
                 });
                 ctx.restore();
             }
        }
    };

    // Need a way to trigger right render without mouse event on right
    let updateRight = () => {}; 
    const drawMid = setupDraggablePoints(midCanvas, ctrlMid, renderMid);
    // wrap renderRight to update internal reference
    const explicitDrawRight = setupDraggablePoints(rightCanvas, ctrlRight, renderRight);
    updateRight = explicitDrawRight;

    // Events
    leftCanvas.addEventListener("mousedown", (e) => {
         const rect = leftCanvas.getBoundingClientRect();
         const x = e.clientX - rect.left - leftCanvas.width/2;
         const y = e.clientY - rect.top - leftCanvas.height/2;
         userPoints.push({x, y});
         drawLeft();
         drawMid(); 
         // drawMid triggers updateRight via renderMid
    });

    // Reset UI
    const btnContainer = document.createElement("div");
    btnContainer.style.width = "100%";
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "center";
    btnContainer.style.gap = "20px";
    btnContainer.style.marginTop = "10px";
    container.appendChild(btnContainer);

    const mkBtn = (txt, cb) => {
        const b = document.createElement("button");
        b.textContent = txt;
        b.onclick = cb;
        btnContainer.appendChild(b);
    };

    mkBtn("Clear Points", () => {
        userPoints.length = 0;
        drawLeft(); drawMid();
    });

    mkBtn("Reset Middle", () => {
        ctrlMid[0].x = 20; ctrlMid[0].y = 20;
        ctrlMid[1].x = 60; ctrlMid[1].y = 20;
        drawMid();
    });

    mkBtn("Reset Right", () => {
        ctrlRight[0].x = -50; ctrlRight[0].y = -50;
        ctrlRight[1].x = 50; ctrlRight[1].y = -50;
        explicitDrawRight();
    });

    // Init
    drawLeft();
    drawMid();
    explicitDrawRight();
}

// =========================================================
// Demo Functions for t2.html
// =========================================================

export function demoIdentity(id) {
    createDemoBox(
        document.getElementById(id),
        "Identity Function",
        "f(x,y) = [x, y]",
        [],
        (canvas, points) => {
            const identityFunc = (x, y) => [x, y];
            drawGridFunction(canvas, identityFunc);
        }
    );
}

export function demoBilinear(id) {
    createDemoBox(
        document.getElementById(id),
        "Interactive Bilinear Interpolation",
        "Drag the four black dots to define the bilinear mapping.",
        [
            {x: -100, y: -100},
            {x: 100, y: -100},
            {x: 100, y: 100},
            {x: -100, y: 100}
        ],
        (canvas, points) => {
            const src = [-100, -100, 100, -100, 100, 100, -100, 100];
            const dst = [];
            points.forEach(p => dst.push(p.x, p.y));

            const func = getBilinearFunction(src, dst);
            if (func) drawGridFunction(canvas, func);
        }
    );
}

export function demoHermite(id) {
    createDemoBox(
        document.getElementById(id),
        "Interactive Bicubic Hermite Patch",
        "Drag the four dots. Tangents are kept as \"undistorted\" [w, 0] and [0, h]. Note how lines stay perpendicular at corners.",
        [
            {x: -100, y: -100},
            {x: 100, y: -100},
            {x: 100, y: 100},
            {x: -100, y: 100}
        ],
        (canvas, points) => {
            const src = [-100, -100, 100, -100, 100, 100, -100, 100];
            const dst = [];
            points.forEach(p => dst.push(p.x, p.y));

            const func = getBicubicHermiteFunction(src, dst);
            if (func) drawGridFunction(canvas, func);
        }
    );
}

export function demoWarpBilinear(id) {
    const gridSize = 200;
    const gridN = 1;
    const pGrid = getGridPoints(gridSize, gridN);

    createDemoBox(
        document.getElementById(id),
        "Interactive Grid Warp (Bilinear)",
        "Drag the points to warp the grid (Piecewise Bilinear). Notice the sharp corners at grid points.",
        pGrid,
        (canvas, points) => {
            const func = getPiecewiseBilinear(gridSize, gridN, points);
            if (func) drawGridFunction(canvas, func);
        }
    );
}

export function demoWarpBicubic(id) {
    const gridSize = 200;
    const gridN = 1;
    const container = document.getElementById(id);
    const pGridBicubic = getGridPoints(gridSize, gridN);
    
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    label.style.display = "block";
    label.style.marginTop = "10px";
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" Use Phantom Points (Better handling of outside areas)"));
    
    const draw = createDemoBox(
        container,
        "Interactive Grid Warp (Bicubic)",
        "Drag the points. Uses Bicubic Hermite interpolation with fixed tangents. Notice the smoothness at grid points.",
        pGridBicubic,
        (canvas, points) => {
            const usePhantom = checkbox.checked;
            const func = getPiecewiseBicubic(gridSize, gridN, points, usePhantom);
            if (func) drawGridFunction(canvas, func);
        }
    );
    container.appendChild(label);
    checkbox.onclick = draw;
}

export function demoBowl(id) {
    createDemoBox(
        document.getElementById(id),
        "Interactive Bowl",
        "Drag the point to change the bowl parameter. f(x,y) = [s·x, y + k·x²]",
        [{x: 100, y: 100}],
        (canvas, points) => {
            const P = points[0];
            const s = P.x / 100;
            const k = (P.y - 100) / 10000;
            
            const func = (x, y) => [s * x, y + k * x * x];
            drawGridFunction(canvas, func);
        }
    );
}

export function demoWarpBilinear5(id) {
    const gridSize = 300;
    const gridN = 3;
    const pGrid = getGridPoints(gridSize, gridN);
    createDemoBox(
        document.getElementById(id),
        "Interactive Grid Warp (Bilinear 5x5)",
        "5x5 Grid of Points (4x4 Cells). Piecewise Bilinear.",
        pGrid,
        (canvas, points) => {
            const func = getPiecewiseBilinear(gridSize, gridN, points);
            if (func) drawGridFunction(canvas, func);
        }
    );
}

export function demoWarpBicubic5(id) {
    const gridSize = 300;
    const gridN = 3;
    const container = document.getElementById(id);
    const pGridBicubic = getGridPoints(gridSize, gridN);

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    label.style.display = "block";
    label.style.marginTop = "10px";
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" Use Phantom Points"));

    const draw = createDemoBox(
        container,
        "Interactive Grid Warp (Bicubic 5x5)",
        "5x5 Grid of Points. Piecewise Bicubic Hermite.",
        pGridBicubic,
        (canvas, points) => {
            const usePhantom = checkbox.checked;
            const func = getPiecewiseBicubic(gridSize, gridN, points, usePhantom);
            if (func) drawGridFunction(canvas, func);
        }
    );
    container.appendChild(label);
    checkbox.onclick = draw;
}


