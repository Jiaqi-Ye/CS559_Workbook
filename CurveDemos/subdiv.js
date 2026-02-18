// This program was written using AI GitHub Copilot and Gemini 3 Pro
export function initDemo(rootId) {
    const root = document.getElementById(rootId);
    if (!root) {
        throw new Error(`Curve demo root not found for subdiv: ${rootId}`);
    }

    const canvas = root.querySelector('[data-curve="canvas"]');
    const ctx = canvas.getContext('2d');
    const schemeSelect = root.querySelector('[data-curve="schemeSelect"]');
    const btnSubdivide = root.querySelector('[data-curve="btnSubdivide"]');
    const btnReset = root.querySelector('[data-curve="btnReset"]');
    const btnResetStar = root.querySelector('[data-curve="btnResetStar"]');
    const chkShowDots = root.querySelector('[data-curve="chkShowDots"]');

    // State
    // Points structure: { x, y, createdLevel }
    let initialPoints = []; // The base control polygon
    let currentPoints = []; // Displays current subdivision
    let subdivisionLevel = 0;

    let dragIdx = -1;

    // Initialize Square
    function initSquare() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const s = 100;
        initialPoints = [
            { x: cx - s, y: cy - s },
            { x: cx + s, y: cy - s },
            { x: cx + s, y: cy + s },
            { x: cx - s, y: cy + s }
        ];
        resetToInitial();
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

        initialPoints = pts;
        resetToInitial();
    }

    function resetToInitial() {
        subdivisionLevel = 0;
        // Deep copy and assign level 0
        currentPoints = initialPoints.map(p => ({ x: p.x, y: p.y, createdLevel: 0 }));
        draw();
    }

    function getPoint(pts, i) {
        // Closed loop handling
        let len = pts.length;
        let idx = ((i % len) + len) % len;
        return pts[idx];
    }

    // --- Subdivision Schemes ---

    function subdivide() {
        const oldPts = currentPoints;
        const newPts = [];
        const scheme = parseInt(schemeSelect.value);
        const nextLevel = subdivisionLevel + 1;

        for (let i = 0; i < oldPts.length; i++) {
            // Keep the old point (Interpolating scheme)
            newPts.push(oldPts[i]);

            // Insert new point at i+1/2
            let nx, ny;

            if (scheme === 2) {
                // Linear: 1/2 (Pi + Pi+1)
                const p0 = getPoint(oldPts, i);
                const p1 = getPoint(oldPts, i + 1);
                nx = 0.5 * (p0.x + p1.x);
                ny = 0.5 * (p0.y + p1.y);
            }
            else if (scheme === 4) {
                // 4-Point: (-1/16)(Pi-1 + Pi+2) + (9/16)(Pi + Pi+1)
                const pm1 = getPoint(oldPts, i - 1);
                const p0  = getPoint(oldPts, i);
                const p1  = getPoint(oldPts, i + 1);
                const p2  = getPoint(oldPts, i + 2);

                const w1 = 9/16;
                const w2 = -1/16;

                nx = w2 * (pm1.x + p2.x) + w1 * (p0.x + p1.x);
                ny = w2 * (pm1.y + p2.y) + w1 * (p0.y + p1.y);
            }
            else if (scheme === 6) {
                // 6-Point:
                // Weights: 3/256, -25/256, 150/256
                const pm2 = getPoint(oldPts, i - 2);
                const pm1 = getPoint(oldPts, i - 1);
                const p0  = getPoint(oldPts, i);
                const p1  = getPoint(oldPts, i + 1);
                const p2  = getPoint(oldPts, i + 2);
                const p3  = getPoint(oldPts, i + 3);

                const w1 = 150/256;
                const w2 = -25/256;
                const w3 = 3/256;

                nx = w3 * (pm2.x + p3.x) + w2 * (pm1.x + p2.x) + w1 * (p0.x + p1.x);
                ny = w3 * (pm2.y + p3.y) + w2 * (pm1.y + p2.y) + w1 * (p0.y + p1.y);
            }

            newPts.push({ x: nx, y: ny, createdLevel: nextLevel });
        }

        currentPoints = newPts;
        subdivisionLevel = nextLevel;
        draw();
    }

    // --- Interaction ---

    function distSq(p1, p2) {
        return (p1.x - p2.x)**2 + (p1.y - p2.y)**2;
    }

    canvas.addEventListener('mousedown', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (e.shiftKey) {
            // Add point logic
            // Find closest edge to insert on current initial poly
            let bestIdx = -1;
            let minD = Infinity;
            
            // We only edit the *initial* polygon.
            for (let i = 0; i < initialPoints.length; i++) {
                const p1 = initialPoints[i];
                const p2 = initialPoints[(i + 1) % initialPoints.length];
                
                // Distance from point to line segment
                const l2 = distSq(p1, p2);
                if (l2 === 0) continue;
                let t = ((mx - p1.x) * (p2.x - p1.x) + (my - p1.y) * (p2.y - p1.y)) / l2;
                t = Math.max(0, Math.min(1, t));
                const projX = p1.x + t * (p2.x - p1.x);
                const projY = p1.y + t * (p2.y - p1.y);
                
                const d = (mx - projX)**2 + (my - projY)**2;
                if (d < 900 && d < minD) { // Within 30px radius
                    minD = d;
                    bestIdx = i;
                }
            }

            if (bestIdx !== -1) {
                // Insert after bestIdx at cursor position
                initialPoints.splice(bestIdx + 1, 0, { x: mx, y: my });
                resetToInitial();
            }

        } else {
            // Drag start
            let closest = -1;
            let minD = 100; // 10px radius squared

            for(let i=0; i<initialPoints.length; i++) {
                const p = initialPoints[i];
                const d = distSq({x:mx, y:my}, p);
                if (d < minD) {
                    minD = d;
                    closest = i;
                }
            }

            if (closest !== -1) {
                dragIdx = closest;
            }
        }
    });

    canvas.addEventListener('mousemove', e => {
        if (dragIdx !== -1) {
            const rect = canvas.getBoundingClientRect();
            initialPoints[dragIdx].x = e.clientX - rect.left;
            initialPoints[dragIdx].y = e.clientY - rect.top;
            resetToInitial();
        }
    });

    window.addEventListener('mouseup', () => {
        dragIdx = -1;
    });

    // --- Drawing ---

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.beginPath();
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        for(let i=0; i<canvas.width; i+=20) { ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); }
        for(let i=0; i<canvas.height; i+=20) { ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); }
        ctx.stroke();

        // Draw Lines
        if (currentPoints.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
            for(let i=1; i<currentPoints.length; i++) {
                ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
            }
            ctx.lineTo(currentPoints[0].x, currentPoints[0].y); // Close loop
            ctx.stroke();
        }

        // Draw Dots
        if (chkShowDots.checked) {
            for (let i = 0; i < currentPoints.length; i++) {
                const p = currentPoints[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);

                // Color Logic
                // New points (current level) -> Red
                // Previous generation (current level - 1) -> Dark Red
                // Others -> Black
                
                if (subdivisionLevel > 0) {
                    if (p.createdLevel === subdivisionLevel) {
                        ctx.fillStyle = 'red';
                    } else if (p.createdLevel === subdivisionLevel - 1) {
                        ctx.fillStyle = '#8B0000'; // DarkRed
                    } else {
                        ctx.fillStyle = 'black';
                    }
                } else {
                    // Level 0, all black
                    ctx.fillStyle = 'black';
                }
                
                if (i < initialPoints.length && dragIdx === i && subdivisionLevel === 0) {
                    // Highlight dragged
                    ctx.fillStyle = '#555';
                }

                ctx.fill();
            }
        }
    }

    // Listeners
    btnSubdivide.addEventListener('click', subdivide);
    btnReset.addEventListener('click', initSquare);
    btnResetStar.addEventListener('click', resetStar);
    schemeSelect.addEventListener('change', resetToInitial);
    chkShowDots.addEventListener('change', draw);

    // Start
    initSquare();
}
