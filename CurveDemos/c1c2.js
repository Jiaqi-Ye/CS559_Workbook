// This program was written using AI GitHub Copilot and Gemini 3 Pro
export function initDemo(rootId) {
    const root = document.getElementById(rootId);
    if (!root) {
        throw new Error(`Curve demo root not found for c1c2: ${rootId}`);
    }

    const canvas = root.querySelector('[data-curve="canvas"]');
    const ctx = canvas.getContext('2d');
    const c2Checkbox = root.querySelector('[data-curve="c2Checkbox"]');
    const g2Checkbox = root.querySelector('[data-curve="g2Checkbox"]');

    // Initial positions
    // P curve: Left side
    const Ps = [
        { x: 50, y: 300, label: "P0" },
        { x: 50, y: 100, label: "P1" },
        { x: 215, y: 100, label: "P2" },
        { x: 300, y: 150, label: "P3" }
    ];

    // Q curve: Right side
    // Initial values will be overwritten by constraints
    const Qs = [
        { x: 0, y: 0, label: "Q0" }, // Constrained to P3
        { x: 0, y: 0, label: "Q1" }, // Constrained C1
        { x: 500, y: 300, label: "Q2" },
        { x: 550, y: 300, label: "Q3" }
    ];

    let draggingPoint = null;
    let c2Enabled = true;
    let g2Enabled = true;

    c2Checkbox.addEventListener('change', (e) => {
        c2Enabled = e.target.checked;
        if (c2Enabled) {
            g2Enabled = true;
            g2Checkbox.checked = true;
        }
        applyConstraints();
        draw();
    });

    g2Checkbox.addEventListener('change', (e) => {
        g2Enabled = e.target.checked;
        if (!g2Enabled) {
            c2Enabled = false;
            c2Checkbox.checked = false;
        }
        applyConstraints();
        draw();
    });

    function getMousePos(evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function dist(p1, p2) {
        return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
    }

    canvas.addEventListener('mousedown', (e) => {
        const pos = getMousePos(e);
        let minDist = 15;
        let closest = null;

        // Check Ps
        for(let p of Ps) {
            const d = dist(pos, p);
            if (d < minDist) {
                closest = p;
                minDist = d;
            }
        }

        // Check the movable Qs
        // Q0 is P3, never directly movable as Q0 (user moves P3)
        // Q1 is defined by C1, never movable
        // Q2 is movable only if !c2Enabled
        // Q3 is always movable
        
        if (!closest) {
            // Check Q3
            let d = dist(pos, Qs[3]);
            if (d < minDist) {
                closest = Qs[3];
                minDist = d;
            }
            
            // Check Q2 if allowed
            if (!c2Enabled) {
                d = dist(pos, Qs[2]);
                if (d < minDist) {
                    closest = Qs[2]; // Can move Q2
                    minDist = d;
                }
            }
        }

        if (closest) {
            draggingPoint = closest;
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (draggingPoint) {
            const pos = getMousePos(e);
            draggingPoint.x = pos.x;
            draggingPoint.y = pos.y;
            applyConstraints();
            draw();
        }
    });

    canvas.addEventListener('mouseup', () => {
        draggingPoint = null;
    });

    canvas.addEventListener('mouseleave', () => {
        draggingPoint = null;
    });

    function applyConstraints() {
        // C0: Q0 = P3
        Qs[0].x = Ps[3].x;
        Qs[0].y = Ps[3].y;

        // C1: Q1 = P3 + (P3 - P2) = 2P3 - P2
        Qs[1].x = 2 * Ps[3].x - Ps[2].x;
        Qs[1].y = 2 * Ps[3].y - Ps[2].y;

        // C2: Q2 = P1 + 4(P3 - P2)
        // Derived from P''(1) = Q''(0)
        if (c2Enabled) {
            Qs[2].x = Ps[1].x + 4 * (Ps[3].x - Ps[2].x);
            Qs[2].y = Ps[1].y + 4 * (Ps[3].y - Ps[2].y);
        } else if (g2Enabled) {
            // Project Q2 onto G2 Line
            const c2Target = {
                x: Ps[1].x + 4 * (Ps[3].x - Ps[2].x),
                y: Ps[1].y + 4 * (Ps[3].y - Ps[2].y)
            };
            const tanX = Ps[3].x - Ps[2].x;
            const tanY = Ps[3].y - Ps[2].y;
            const den = tanX * tanX + tanY * tanY;

            if (den > 1e-6) {
                // Vector from C2Target to current Q2
                const diffX = Qs[2].x - c2Target.x;
                const diffY = Qs[2].y - c2Target.y;

                // Project diff onto tangent vector
                const t = (diffX * tanX + diffY * tanY) / den;

                // New Q2 = c2Target + t * tangent
                Qs[2].x = c2Target.x + t * tanX;
                Qs[2].y = c2Target.y + t * tanY;
            }
        }
    }

    // Cubic Bezier Evaluation
    function cubicBezier(t, p0, p1, p2, p3) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        let x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
        let y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
        return { x, y };
    }

    // First Derivative
    function cubicDerivative(t, p0, p1, p2, p3) {
        const u = 1 - t;
        // P'(t) = 3(1-t)^2(P1-P0) + 6(1-t)t(P2-P1) + 3t^2(P3-P2)
        const d1x = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
        const d1y = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
        return { x: d1x, y: d1y };
    }

    // Second Derivative
    function cubicSecondDerivative(t, p0, p1, p2, p3) {
        const u = 1 - t;
        // P''(t) = 6(1-t)(P2-2P1+P0) + 6t(P3-2P2+P1)
        const d2x = 6 * u * (p2.x - 2 * p1.x + p0.x) + 6 * t * (p3.x - 2 * p2.x + p1.x);
        const d2y = 6 * u * (p2.y - 2 * p1.y + p0.y) + 6 * t * (p3.y - 2 * p2.y + p1.y);
        return { x: d2x, y: d2y };
    }

    function getCurvature(d1, d2) {
        // k = (x'y'' - y'x'') / (x'^2 + y'^2)^(3/2)
        const num = d1.x * d2.y - d1.y * d2.x;
        const den = Math.pow(d1.x * d1.x + d1.y * d1.y, 1.5);
        if (Math.abs(den) < 1e-6) return 0;
        return num / den;
    }

    function drawCurveAndComb(points, color, steps = 100) {
        // Draw Curve
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        // We can just use standard canvas bezierCurveTo, but we iterate for combs anyway
        // Let's use standard bezier for the thick line
        ctx.moveTo(points[0].x, points[0].y);
        ctx.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
        ctx.stroke();

        // Draw Curvature Comb
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.beginPath();
        const scale = 2000; // Visual scale factor for combs

        // Loop for comb
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const p = cubicBezier(t, points[0], points[1], points[2], points[3]);
            const d1 = cubicDerivative(t, points[0], points[1], points[2], points[3]);
            const d2 = cubicSecondDerivative(t, points[0], points[1], points[2], points[3]);
            const k = getCurvature(d1, d2);

            // Normal vector: (-y', x')
            let len = Math.sqrt(d1.x * d1.x + d1.y * d1.y);
            if (len < 1e-6) continue;
            let nx = -d1.y / len;
            let ny = d1.x / len;

            // Draw comb line
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + nx * k * scale, p.y + ny * k * scale);
        }
        // Add a light stroke for the comb
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    function drawControlPolygon(points) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.moveTo(points[0].x, points[0].y);
        for(let i=1; i<points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawPoint(p, color, isConstrained) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = isConstrained ? '#ccc' : color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#000';
        ctx.font = '12px sans-serif';
        ctx.fillText(p.label, p.x + 8, p.y - 8);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Control Polygons
        drawControlPolygon(Ps);
        drawControlPolygon(Qs);

        // Calculate C2 Ghost Point
        // Q2 = P1 + 4(P3 - P2)
        const c2Target = {
            x: Ps[1].x + 4 * (Ps[3].x - Ps[2].x),
            y: Ps[1].y + 4 * (Ps[3].y - Ps[2].y)
        };

        // Draw G2 Line
        // Line passes through C2 target with direction P2->P3 (tangent direction)
        // G2 means curvature matches. Since tangents match (C1),
        // the locus of Q2 for G2 is a line parallel to the tangent passing through the C2 point.
        const tanX = Ps[3].x - Ps[2].x;
        const tanY = Ps[3].y - Ps[2].y;
        const tanLen = Math.sqrt(tanX*tanX + tanY*tanY);
        
        if (tanLen > 0.001) {
            // Draw a long line centered on c2Target
            const ext = 2000;
            const ux = tanX / tanLen;
            const uy = tanY / tanLen;
            
            ctx.beginPath();
            ctx.strokeStyle = '#ccc'; // Thin gray line
            ctx.lineWidth = 1;
            ctx.moveTo(c2Target.x - ext * ux, c2Target.y - ext * uy);
            ctx.lineTo(c2Target.x + ext * ux, c2Target.y + ext * uy);
            ctx.stroke();

            // Draw G2 Line Label nearby
            ctx.fillStyle = '#999';
            ctx.fillText("G2 Locus", c2Target.x + 20, c2Target.y + 20);
        }

        // Draw C2 Target Ghost Point
        ctx.beginPath();
        ctx.arc(c2Target.x, c2Target.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#bbb'; // Gray dot
        ctx.fill();
        
        // Draw Curvature Combs and Curves
        drawCurveAndComb(Ps, 'blue');
        drawCurveAndComb(Qs, 'purple');

        // Draw Points
        // P points are always movable (Blueish)
        Ps.forEach(p => drawPoint(p, '#aaf', false));

        // Q points:
        // Q0, Q1 are always locked
        drawPoint(Qs[0], '#faa', true);
        drawPoint(Qs[1], '#faa', true);
        // Q2 locked if c2Enabled, else movable
        drawPoint(Qs[2], '#fcc', c2Enabled);
        // Q3 always movable
        drawPoint(Qs[3], '#fcc', false);
    }

    // Initialize
    applyConstraints();
    draw();
}
