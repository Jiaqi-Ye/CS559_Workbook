// @ts-check
export {};

// --- Canvas setup ---
let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Could not get 2D context");

// --- Control points for looped spline ---
const points = [
    {x: 50, y:150},
    {x: 350, y:150},
    {x: 350, y:50},
    {x: 200, y:100},
    {x: 50, y:50}
];

// Cardinal tension parameter, t=0.5 corresponds to Catmull-Rom
const tension = 0.5;

/**
 * Convert a Catmull-Rom segment to a cubic Bézier segment.
 * p0,p1,p2,p3: previous, start, end, next points
 */
function catmullRomToBezier(p0, p1, p2, p3, t) {
    const cp1 = {
        x: p1.x + (p2.x - p0.x) * t / 3,
        y: p1.y + (p2.y - p0.y) * t / 3
    };
    const cp2 = {
        x: p2.x - (p3.x - p1.x) * t / 3,
        y: p2.y - (p3.y - p1.y) * t / 3
    };
    return [cp1, cp2];
}

// --- Draw the Cardinal spline as Bézier curves ---
ctx.beginPath();
ctx.moveTo(points[0].x, points[0].y);

for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];

    const [cp1, cp2] = catmullRomToBezier(p0, p1, p2, p3, tension);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
}

ctx.closePath();
ctx.lineWidth = 3;
ctx.strokeStyle = "black";
ctx.stroke();

// --- Function to compute a point on cubic Bézier segment ---
function getPointOnBezier(p0,p1,p2,p3,tSeg){
    const x = Math.pow(1-tSeg,3)*p0.x
            + 3*Math.pow(1-tSeg,2)*tSeg*p1.x
            + 3*(1-tSeg)*Math.pow(tSeg,2)*p2.x
            + Math.pow(tSeg,3)*p3.x;
    const y = Math.pow(1-tSeg,3)*p0.y
            + 3*Math.pow(1-tSeg,2)*tSeg*p1.y
            + 3*(1-tSeg)*Math.pow(tSeg,2)*p2.y
            + Math.pow(tSeg,3)*p3.y;
    return {x,y};
}

/**
 * Sample the spline into many points for arc-length parameterization
 */
function sampleSpline(points, tension, samplesPerSegment=50){
    let sampledPoints = [];
    for(let i=0;i<points.length;i++){
        const p0 = points[(i-1+points.length)%points.length];
        const p1 = points[i];
        const p2 = points[(i+1)%points.length];
        const p3 = points[(i+2)%points.length];

        const [cp1, cp2] = catmullRomToBezier(p0,p1,p2,p3,tension);

        for(let j=0;j<samplesPerSegment;j++){
            const tSeg = j/samplesPerSegment;
            sampledPoints.push(getPointOnBezier(p1,cp1,cp2,p2,tSeg));
        }
    }
    return sampledPoints;
}

// --- Compute cumulative arc-lengths ---
function computeArcLengths(points){
    let lengths = [0];
    for(let i=1;i<points.length;i++){
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        lengths.push(lengths[i-1]+Math.sqrt(dx*dx+dy*dy));
    }
    return lengths;
}

/**
 * Interpolate along the sampled points to get equally spaced points
 * using linear interpolation along cumulative arc-length
 */
function getEquallySpacedPoints(sampledPoints, numPoints){
    const lengths = computeArcLengths(sampledPoints);
    const totalLength = lengths[lengths.length-1];
    const spacing = totalLength / numPoints;
    let result = [];
    let seg = 0;

    for(let i=0;i<numPoints;i++){
        const target = i*spacing;
        // move seg forward until lengths[seg+1] >= target
        while(seg < lengths.length-1 && lengths[seg+1] < target){
            seg++;
        }
        const t = (target - lengths[seg]) / (lengths[seg+1]-lengths[seg]);
        const x = sampledPoints[seg].x + t*(sampledPoints[seg+1].x - sampledPoints[seg].x);
        const y = sampledPoints[seg].y + t*(sampledPoints[seg+1].y - sampledPoints[seg].y);
        result.push({x,y});
    }
    return result;
}

// --- Draw 20 points equally spaced along the spline ---
const sampledPoints = sampleSpline(points, tension, 50);
const equalPoints = getEquallySpacedPoints(sampledPoints, 20);

ctx.fillStyle = "red";
for(const pt of equalPoints){
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI*2);
    ctx.fill();
}