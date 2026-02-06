/*****
 * Crabby - that's how I felt, not necessarily this guy's name
 * 
 * I drew the crab in Illustrator to produce an SVG and then 
 * step by step simplified it using Co-Pilot to get it to draw.
 * I had the intent of having an LLM just write the code 
 * (tracing clip-art I found on the web), but instead it became a 
 * highly manual process. 
 * 
 * Co-Pilot/Gemini 3 did a lot of the actual code, but it was me dissecting
 * things step by step to build out the hierarchical models
 * 
 * the articulation is done manually
 */

// Styles
const styles = {
    st0: { fill: '#e68283', stroke: '#231f20' },
    st1: { fill: '#fff', stroke: '#231f20' },
    st2: { fill: '#2e3192', stroke: '#231f20' },
    st3: { fill: '#000000', stroke: '#000000' }, // implied fill
    st4: { stroke: '#000000', lineWidth: 4 },
};

export const defaults = {
    // global x,y,theta
    x: 110, y: 88, theta: 0,
    // the arm angles are relative to "base pose"
    l_arm:0, l_elbow:0, l_wrist:0, l_thumb:0,
    r_arm:0, r_elbow:0, r_wrist:0, r_thumb:0,
    l_eye:0, r_eye:0,
    l1_hip:0, l1_knee:0,
    l2_hip:0, l2_knee:0,
    l3_hip:0, l3_knee:0,
    r1_hip:0, r1_knee:0,
    r2_hip:0, r2_knee:0,
    r3_hip:0, r3_knee:0
}
export function draw(ctx, params = {}) {
    // make sure params has all the parameters
    // the ones it's missing - give it the default
    // the extra ones, throw an error
    params = params || {};
    Object.keys(params).forEach(key => {
        if (!(key in defaults)) {
            throw new Error(`Unknown crab parameter: ${key}`);
        }
    });
    params = { ...defaults, ...params };

    // Helper functions
    function setStyle(style) {
        ctx.fillStyle = style.fill || 'transparent';
        ctx.strokeStyle = style.stroke || 'transparent';
        ctx.lineWidth = style.lineWidth || 1;
        ctx.miterLimit = 10;
    }

    function drawPath(style, pathFunc) {
        ctx.save();
        setStyle(style);
        ctx.beginPath();
        pathFunc();
        if (style.fill) ctx.fill();
        if (style.stroke) ctx.stroke();
        ctx.restore();
    }

    function drawEllipse(cx, cy, rx, ry, style) {
        drawPath(style, () => {
            ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        });
    }

    function drawPolygon(points, style, transform) {
        drawPath(style, () => {
            if (transform) {
                if (transform.translate) ctx.translate(transform.translate[0], transform.translate[1]);
                if (transform.rotate) ctx.rotate(transform.rotate * Math.PI / 180);
            }
            ctx.moveTo(points[0], points[1]);
            for (let i = 2; i < points.length; i += 2) {
                ctx.lineTo(points[i], points[i + 1]);
            }
            ctx.closePath();
        });
    }

    function drawRect(x, y, w, h, transform, style) {
        ctx.save();
        if (transform) {
            if (transform.translate) ctx.translate(transform.translate[0], transform.translate[1]);
            if (transform.rotate) ctx.rotate(transform.rotate * Math.PI / 180);
        }
        setStyle(style);
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        if (style.fill) ctx.fill();
        if (style.stroke) ctx.stroke();
        ctx.restore();
    }

    function drawCircle(cx, cy, r, style) {
        drawPath(style, () => {
            ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        });
    }

    /** Body part functions */
    function crabBody() {
        drawEllipse(0, 0, 61, 45, styles.st0);
        drawPath(styles.st4, () => {
            ctx.moveTo(-11, -29);
            ctx.bezierCurveTo(
                -11, -20,
                12, -20,
                12, -29
            );
        });
    }

    function leg(x, y, t1, t2) {
        const legPolyVertical = [-6, -2, 6, -2, 5, 26, -5, 26];
        const footPolyVertical = [-5, -2, 5, -2, 5, 12, 1, 32, -1, 32, -5, 12];
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t1 * Math.PI / 180);
        drawPolygon(legPolyVertical, styles.st0);
        ctx.translate(0, 24);
        ctx.rotate(t2 * Math.PI / 180);
        drawPolygon(footPolyVertical, styles.st0);
        ctx.restore();
    }

    function arm(shoulder,elbow,wrist,thumb) {
        ctx.save();
        ctx.translate(-55, -5);
        ctx.rotate(shoulder);
        drawPolygon([-27, -5, -20, -17, 7, -6, 1, 9, -27, -5], styles.st0);
        ctx.save();
        ctx.translate(-24, -12);
        ctx.rotate(elbow);
        drawRect(86, 157, 13, 34, {
            translate: [-137, -157],
            rotate: -15
        }, styles.st0);
        // claw
        ctx.save();
        ctx.translate(-3, -25);
        ctx.rotate(wrist);
        drawPolygon([14, -39, 22, -27, 18, -5, 6, 5, -10, 0, -2, -19, 4, -20, 14, -39], styles.st0);
        ctx.save();
        ctx.translate(-5, -3);
        ctx.rotate(thumb);
        drawEllipse(-6, -17, 15, 24, styles.st0);
        ctx.restore();
        ctx.restore();
        ctx.restore();
        ctx.restore();
    }

    // eye stalk
    function eyeStalk(eye) {
        ctx.save();
        ctx.translate(-17, -40);
        ctx.rotate(eye);
        const stalkPoly = [-4, 2, 4, 2, 0, -40];
        drawPolygon(stalkPoly, styles.st0, {
            rotate: -11
        });
        drawCircle(-7, -28, 13, styles.st1);
        drawCircle(-7, -24, 6, styles.st3);
        ctx.restore();
    }

    // Draw Sequence
    ctx.save();
    ctx.translate(params.x, params.y);
    ctx.rotate(params.theta);

    leg(46, 12, -70+params.l1_hip, 40+params.l1_knee);
    leg(42, 21, -60+params.l2_hip, 50+params.l2_knee);
    leg(27, 27, -50+params.l3_hip, 50+params.l3_knee);
    ctx.save();
    ctx.scale(-1, 1);
    leg(46, 12, -70+params.r1_hip, 40+params.r1_knee);
    leg(42, 21, -60+params.r2_hip, 50+params.r2_knee);
    leg(27, 27, -50+params.r3_hip, 50+params.r3_knee);
    ctx.restore();

    arm(params.l_arm,params.l_elbow,params.l_wrist,params.l_thumb);
    ctx.save();
    ctx.scale(-1, 1);
    arm(params.r_arm,params.r_elbow,params.r_wrist,params.r_thumb);
    ctx.restore();

    eyeStalk(params.l_eye);
    ctx.save();
    ctx.scale(-1, 1);
    eyeStalk(params.r_eye);
    ctx.restore();
    crabBody();

    ctx.restore();
}
