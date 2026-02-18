// written by Gemini with the prompt: 
/* 
I would like to create a demonstration that compares linear interpolation, lagrange polynomial interpolation, and cardinal (catmull-rom) spline interpolation.

Create a web page with three canvases.

On these three canvases, we will put 9 points in a sawtooth shape.

The user can drag the points in any one of the canvases, and they will move in all three.

In canvas one, connect the points with straight lines.

In canvas two, connect the points with a single lagrange polynomial of the appropriate degree.

In canvas three, connect the points with a cardinal cubic spline. color each segment of the spline with an alternative dark blue/light blue color

we will want to use the code to put on a hugo page in the future. make it self contained. but we also want a stand-alone html page for testing.
*/
(function() {
    // --- Configuration ---
    const WIDTH = 600;
    const HEIGHT = 200;
    const POINT_RADIUS = 6;
    const DRAG_THRESHOLD = 20;

    // --- State ---
    const points = [];
    const numPoints = 9;
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: 50 + i * ((WIDTH - 100) / (numPoints - 1)),
            y: (i % 2 === 0) ? 140 : 60 
        });
    }

    let draggingIdx = -1;

    // --- DOM Elements ---
    const canvases = [
        document.getElementById('cLinear'),
        document.getElementById('cLagrange'),
        document.getElementById('cSpline')
    ];
    const contexts = canvases.map(c => c.getContext('2d'));

    // --- Interaction Logic ---
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function handleStart(evt, canvasIndex) {
        evt.preventDefault();
        const pos = getMousePos(canvases[canvasIndex], evt.type.includes('touch') ? evt.touches[0] : evt);
        
        let nearest = -1;
        let minDist = DRAG_THRESHOLD;

        points.forEach((p, i) => {
            const dx = pos.x - p.x;
            const dy = pos.y - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = i;
            }
        });

        draggingIdx = nearest;
    }

    function handleMove(evt, canvasIndex) {
        if (draggingIdx === -1) return;
        evt.preventDefault();
        
        const pos = getMousePos(canvases[canvasIndex], evt.type.includes('touch') ? evt.touches[0] : evt);
        
        points[draggingIdx].x = Math.max(0, Math.min(WIDTH, pos.x));
        points[draggingIdx].y = Math.max(0, Math.min(HEIGHT, pos.y));
        
        drawAll();
    }

    function handleEnd() {
        draggingIdx = -1;
    }

    canvases.forEach((cvs, idx) => {
        cvs.addEventListener('mousedown', e => handleStart(e, idx));
        cvs.addEventListener('mousemove', e => handleMove(e, idx));
        cvs.addEventListener('touchstart', e => handleStart(e, idx), {passive: false});
        cvs.addEventListener('touchmove', e => handleMove(e, idx), {passive: false});
    });
    
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);


    // --- Math Functions ---

    function drawLinear(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.moveTo(points[0].x, points[0].y);
        for(let i=1; i<points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }

    function drawLagrange(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = "#d946ef"; 
        ctx.lineWidth = 2;

        const n = points.length;
        const step = 0.05; 
        
        for (let t = 0; t <= n - 1; t += step) {
            let x = 0;
            let y = 0;

            for (let i = 0; i < n; i++) {
                let weight = 1;
                for (let j = 0; j < n; j++) {
                    if (i !== j) {
                        weight *= (t - j) / (i - j);
                    }
                }
                x += points[i].x * weight;
                y += points[i].y * weight;
            }

            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function drawSpline(ctx) {
        ctx.lineWidth = 3;
        
        function getPt(t, p0, p1, p2, p3) {
            const t2 = t * t;
            const t3 = t2 * t;
            
            const f1 = -0.5 * t3 + t2 - 0.5 * t;
            const f2 =  1.5 * t3 - 2.5 * t2 + 1.0;
            const f3 = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
            const f4 =  0.5 * t3 - 0.5 * t2;

            return {
                x: p0.x * f1 + p1.x * f2 + p2.x * f3 + p3.x * f4,
                y: p0.y * f1 + p1.y * f2 + p2.y * f3 + p3.y * f4
            };
        }

        for (let i = 0; i < points.length - 1; i++) {
            ctx.strokeStyle = (i % 2 === 0) ? "#0284c7" : "#7dd3fc"; 
            
            const p0 = points[Math.max(0, i - 1)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(points.length - 1, i + 2)];

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            
            for (let t = 0; t <= 1; t += 0.05) {
                const pt = getPt(t, p0, p1, p2, p3);
                ctx.lineTo(pt.x, pt.y);
            }
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    function drawAll() {
        contexts.forEach((ctx, i) => {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            
            ctx.strokeStyle = "#f0f0f0";
            ctx.lineWidth = 1;
            ctx.beginPath();
            for(let x=0; x<WIDTH; x+=50) { ctx.moveTo(x,0); ctx.lineTo(x,HEIGHT); }
            for(let y=0; y<HEIGHT; y+=50) { ctx.moveTo(0,y); ctx.lineTo(WIDTH,y); }
            ctx.stroke();
            
            if (i === 0) drawLinear(ctx);
            if (i === 1) drawLagrange(ctx);
            if (i === 2) drawSpline(ctx);

            points.forEach((p, idx) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, POINT_RADIUS, 0, Math.PI * 2);
                
                if(idx === draggingIdx) {
                    ctx.fillStyle = "#ff0000";
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = "rgba(0,0,0,0.2)";
                } else {
                    ctx.fillStyle = "#000";
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0; 
            });
        });
    }

    drawAll();

})();
