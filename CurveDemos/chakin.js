// This program was written using AI GitHub Copilot and Gemini 3 Pro
export function initDemo(rootId) {
    const root = document.getElementById(rootId);
    if (!root) {
        throw new Error(`Curve demo root not found for chakin: ${rootId}`);
    }

    const canvas = root.querySelector('[data-curve="canvas"]');
    const ctx = canvas.getContext('2d');
    const btnSubdivide = root.querySelector('[data-curve="btnSubdivide"]');
    const btnReset = root.querySelector('[data-curve="btnReset"]');
    const btnResetA = root.querySelector('[data-curve="btnResetA"]');
    const btnResetStar = root.querySelector('[data-curve="btnResetStar"]');
    const chkShowDots = root.querySelector('[data-curve="chkShowDots"]');

    // State
    let basePoints = []; // The original control polygon points
    let currentPoints = []; // The currently displayed points (subdivided or original)
    let subdivisionLevel = 0; // Number of times Chakin has been applied
    let dragInfo = null;

    // Configuration
    const POINT_RADIUS = 6;
    const HIT_RADIUS_SQ = 100; // 10px * 10px

    // Initialize with a Square
    function init() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const s = 100;
        basePoints = [
            { x: cx - s, y: cy - s },
            { x: cx + s, y: cy - s },
            { x: cx + s, y: cy + s },
            { x: cx - s, y: cy + s }
        ];
        resetView();
    }

    function resetStar() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const outerR = 140;
        const innerR = 70;
        const pts = [];

        for (let i = 0; i < 10; i++) {
            const angle = -Math.PI / 2 + i * (Math.PI / 5);
            const r = i % 2 === 0 ? outerR : innerR;
            pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
        }

        basePoints = pts;
        resetView();
    }

    // Reset to show the base polygon (Level 0)
    function resetView() {
        subdivisionLevel = 0;
        // Deep copy base points to current points
        currentPoints = basePoints.map(p => ({ x: p.x, y: p.y }));
        draw();
    }

    // Chakin Algorithm: Apply one step to a list of points
    function applyChakin(pts) {
        let newPts = [];
        for (let i = 0; i < pts.length; i++) {
            const p1 = pts[i];
            const p2 = pts[(i + 1) % pts.length];

            // Q1 = 3/4 A + 1/4 B
            newPts.push({
                x: 0.75 * p1.x + 0.25 * p2.x,
                y: 0.75 * p1.y + 0.25 * p2.y
            });
            // Q2 = 1/4 A + 3/4 B
            newPts.push({
                x: 0.25 * p1.x + 0.75 * p2.x,
                y: 0.25 * p1.y + 0.75 * p2.y
            });
        }
        return newPts;
    }

    // Draw Function
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. If subdivided (Level > 0), Draw the PREVIOUS level in gray for context
        let previousLevelPoints = null;
        if (subdivisionLevel > 0) {
            let temp = basePoints.map(p => ({x:p.x, y:p.y}));
            for(let i=0; i < subdivisionLevel - 1; i++) {
                 temp = applyChakin(temp);
            }
            previousLevelPoints = temp;
        }

        if (subdivisionLevel > 0 && previousLevelPoints) {
            // Draw Previous Edges in Gray
            ctx.beginPath();
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = 2;
            if (previousLevelPoints.length > 0) {
                ctx.moveTo(previousLevelPoints[0].x, previousLevelPoints[0].y);
                for (let i = 1; i < previousLevelPoints.length; i++) {
                    ctx.lineTo(previousLevelPoints[i].x, previousLevelPoints[i].y);
                }
                ctx.closePath();
            }
            ctx.stroke();
        }

        // 2. Draw Current Edges (Black) - either base or subdivided
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        if (currentPoints.length > 0) {
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
            for (let i = 1; i < currentPoints.length; i++) {
                ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
            }
            ctx.closePath();
        }
        ctx.stroke();

        // 3. Draw Points
        
        // Always draw Original Control Points in Black for reference/editing
        ctx.fillStyle = "black";
        for (let p of basePoints) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, POINT_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        }

        if (chkShowDots.checked) {
            if (subdivisionLevel > 0) {
                // Draw New Subdivided Points in Red
                ctx.fillStyle = "red";
                for (let p of currentPoints) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            } 
        }
    }

    // Interaction Handlers (Operate on basePoints)
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    function distSq(p1, p2) {
        return (p1.x - p2.x)**2 + (p1.y - p2.y)**2;
    }

    canvas.addEventListener('mousedown', e => {
        const m = getMousePos(e);

        if (e.shiftKey) {
            // Add Point Logic (to basePoints)
            // Find closest edge to insert point
            let bestIdx = -1;
            let minD = Infinity;

            for (let i = 0; i < basePoints.length; i++) {
                const p1 = basePoints[i];
                const p2 = basePoints[(i + 1) % basePoints.length];
                
                // Segment length squared
                const l2 = distSq(p1, p2);
                if (l2 === 0) continue;

                // Projection t = dot(AP, AB) / dot(AB, AB)
                let t = ((m.x - p1.x) * (p2.x - p1.x) + (m.y - p1.y) * (p2.y - p1.y)) / l2;
                t = Math.max(0, Math.min(1, t)); // Clamp to segment
                
                const projX = p1.x + t * (p2.x - p1.x);
                const projY = p1.y + t * (p2.y - p1.y);
                
                const d = (m.x - projX)**2 + (m.y - projY)**2;
                
                if (d < 400 && d < minD) { // 20px radius tolerance
                    minD = d;
                    bestIdx = i;
                }
            }

            if (bestIdx !== -1) {
                basePoints.splice(bestIdx + 1, 0, { x: m.x, y: m.y });
                resetView(); // Editing resets subdivision
            }
        } else {
            // Drag Logic (check against basePoints)
            for (let i = 0; i < basePoints.length; i++) {
                if (distSq(basePoints[i], m) < HIT_RADIUS_SQ) {
                    dragInfo = { idx: i };
                    // Prompt said: "The display should also reset if the user moves... a control point"
                    resetView();
                    return;
                }
            }
        }
    });

    canvas.addEventListener('mousemove', e => {
        if (dragInfo) {
            const m = getMousePos(e);
            basePoints[dragInfo.idx].x = m.x;
            basePoints[dragInfo.idx].y = m.y;
            // Since we called resetView() on mousedown, currentPoints IS basePoints here.
            // We need to update currentPoints to reflect the drag immediately
            currentPoints[dragInfo.idx].x = m.x;
            currentPoints[dragInfo.idx].y = m.y;
            draw();
        }
    });

    canvas.addEventListener('mouseup', () => {
        dragInfo = null;
    });

    canvas.addEventListener('mouseleave', () => {
        dragInfo = null;
    });

    // Buttons
    btnSubdivide.addEventListener('click', () => {
        // Apply one step of subdivision to currentPoints
        currentPoints = applyChakin(currentPoints);
        subdivisionLevel++;
        draw();
    });

    btnReset.addEventListener('click', () => {
        init();
    });

    btnResetA.addEventListener('click', () => {
        // Rough coordinates for a block letter A (filled, without hole)
        basePoints = [
            { x: 230, y: 400 }, // Bottom Left Outer
            { x: 330, y: 50 },  // Top
            { x: 430, y: 400 }, // Bottom Right Outer
            { x: 380, y: 400 }, // Bottom Right Inner
            { x: 350, y: 280 }, // Crossbar Right
            { x: 310, y: 280 }, // Crossbar Left
            { x: 280, y: 400 }  // Bottom Left Inner
        ];
        resetView();
    });

    btnResetStar.addEventListener('click', () => {
        resetStar();
    });

    chkShowDots.addEventListener('change', () => {
        draw();
    });

    // Start
    init();

    // Check for "iter" parameter to pre-subdivide
    const iterAttr = root.getAttribute("data-iter");
    if (iterAttr) {
        const iterSteps = parseInt(iterAttr, 10);
        if (!isNaN(iterSteps) && iterSteps > 0) {
            chkShowDots.checked = false; // Hide dots
            for(let k=0; k<iterSteps; k++) {
                 currentPoints = applyChakin(currentPoints);
                 subdivisionLevel++;
            }
            draw();
        }
    }
}
