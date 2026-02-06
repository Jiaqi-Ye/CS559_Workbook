/** These functions compute various 2D transformation matrices based on point correspondences.
 * The code was written by gemini
 */

export {
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
};

/**
 * Create a translation matrix.
 * @param {number} tx - Translation in x
 * @param {number} ty - Translation in y
 * @returns {Array<number>} The 9-element homogeneous matrix
 */
function translate(tx, ty) {
    return [
        1, 0, tx,
        0, 1, ty,
        0, 0, 1
    ];
}

/**
 * Create a rotation matrix.
 * @param {number} radians - Angle in radians
 * @returns {Array<number>} The 9-element homogeneous matrix
 */
function rotate(radians) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    return [
        c, -s, 0,
        s,  c, 0,
        0,  0, 1
    ];
}

/**
 * Create a scale matrix.
 * If sy is omitted, a uniform scale is performed using sx.
 * @param {number} sx - Scale factor in x
 * @param {number} [sy] - Scale factor in y (optional)
 * @returns {Array<number>} The 9-element homogeneous matrix
 */
function scale(sx, sy) {
    if (sy === undefined) sy = sx;
    return [
        sx, 0,  0,
        0,  sy, 0,
        0,  0,  1
    ];
}

/**
 * Create a Shear X matrix.
 * x' = x + ky
 * y' = y
 * @param {number} k - Shear factor
 * @returns {Array<number>} The 9-element homogeneous matrix
 */
function shearX(k) {
    return [
        1, k, 0,
        0, 1, 0,
        0, 0, 1
    ];
}

/**
 * Create a Shear Y matrix.
 * x' = x
 * y' = kx + y
 * @param {number} k - Shear factor
 * @returns {Array<number>} The 9-element homogeneous matrix
 */
function shearY(k) {
    return [
        1, 0, 0,
        k, 1, 0,
        0, 0, 1
    ];
}

/**
 * Helper: Gaussian Elimination Solver
 * Solves a system of linear equations Ax = B.
 * Used by the Affine and Projective solvers below.
 * * @param {Array<Array<number>>} A - The matrix of coefficients (n x n)
 * @param {Array<number>} B - The constant vector (length n)
 * @returns {Array<number>|null} The solution vector x, or null if singular
 */
function solveLinearSystem(A, B) {
    const n = A.length;
    const M = A.map(row => [...row]);
    const x = [...B];

    // Forward Elimination
    for (let i = 0; i < n; i++) {
        let pivotRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(M[j][i]) > Math.abs(M[pivotRow][i])) pivotRow = j;
        }

        [M[i], M[pivotRow]] = [M[pivotRow], M[i]];
        [x[i], x[pivotRow]] = [x[pivotRow], x[i]];

        const pivot = M[i][i];
        if (Math.abs(pivot) < 1e-10) return null; // Singular matrix
        
        for (let j = i + 1; j < n; j++) {
            const factor = M[j][i] / pivot;
            x[j] -= factor * x[i];
            for (let k = i; k < n; k++) {
                M[j][k] -= factor * M[i][k];
            }
        }
    }

    // Back Substitution
    const result = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += M[i][j] * result[j];
        }
        result[i] = (x[i] - sum) / M[i][i];
    }
    return result;
}

/**
 * 1. Translation Matrix
 * * Computes a 3x3 matrix representing a pure translation.
 * * MATH:
 * u = x + tx
 * v = y + ty
 * * MATRIX FORM:
 * [ 1  0  tx ]
 * [ 0  1  ty ]
 * [ 0  0  1  ]
 * * @param {Array<number>} src - Source point [x, y]
 * @param {Array<number>} dst - Destination point [u, v]
 * @returns {Array<number>} The 9-element homogeneous matrix
 */
function getTranslationMatrix(src, dst) {
    const tx = dst[0] - src[0];
    const ty = dst[1] - src[1];

    return [
        1, 0, tx,
        0, 1, ty,
        0, 0, 1
    ];
}

/**
 * 2. Similarity Matrix
 * * Computes a transformation consisting of translation, rotation, and uniform scale.
 * Preserves angles and the ratios of distances (shapes remain the same).
 * * MATH:
 * u = (s*cosθ)x - (s*sinθ)y + tx
 * v = (s*sinθ)x + (s*cosθ)y + ty
 * Let a = s*cosθ, b = s*sinθ
 * * MATRIX FORM:
 * [ a -b  tx ]
 * [ b  a  ty ]
 * [ 0  0  1  ]
 * * @param {Array<number>} src - Source points [x1, y1, x2, y2]
 * @param {Array<number>} dst - Destination points [u1, v1, u2, v2]
 * @returns {Array<number>|null} The 9-element homogeneous matrix
 */
function getSimilarityMatrix(src, dst) {
    // We treat the points as vectors to remove translation and solve for rotation/scale first
    const dx = src[2] - src[0];
    const dy = src[3] - src[1];
    const du = dst[2] - dst[0];
    const dv = dst[3] - dst[1];

    const det = dx * dx + dy * dy;
    if (det === 0) return null; // Points are coincident

    // Solve for partial rotation/scale (a and b)
    const a = (dx * du + dy * dv) / det;
    const b = (dx * dv - dy * du) / det;

    // Solve for translation using the first point
    const tx = dst[0] - (a * src[0] - b * src[1]);
    const ty = dst[1] - (b * src[0] + a * src[1]);

    return [
        a, -b, tx,
        b,  a, ty,
        0,  0, 1
    ];
}

/**
 * 3. Affine Matrix
 * * Computes a transformation that preserves parallelism but not necessarily angles or lengths.
 * Includes translation, rotation, scale (non-uniform), and shear.
 * * MATH:
 * u = ax + by + c
 * v = dx + ey + f
 * * MATRIX FORM:
 * [ a  b  c ]
 * [ d  e  f ]
 * [ 0  0  1 ]
 * * LOGIC:
 * Solves two independent 3x3 linear systems (one for u rows, one for v rows).
 * * @param {Array<number>} src - Source points [x1, y1, x2, y2, x3, y3]
 * @param {Array<number>} dst - Destination points [u1, v1, u2, v2, u3, v3]
 * @returns {Array<number>|null} The 9-element homogeneous matrix
 */
function getAffineMatrix(src, dst) {
    // Matrix A is the same for both systems: [x, y, 1] for each point
    const A = [
        [src[0], src[1], 1],
        [src[2], src[3], 1],
        [src[4], src[5], 1]
    ];

    // Target vectors for rows 1 (u) and 2 (v)
    const B_u = [dst[0], dst[2], dst[4]]; 
    const B_v = [dst[1], dst[3], dst[5]]; 

    const row1 = solveLinearSystem(A, B_u); // Solves for [a, b, c]
    const row2 = solveLinearSystem(A, B_v); // Solves for [d, e, f]

    if (!row1 || !row2) return null; 

    return [
        ...row1, 
        ...row2, 
        0, 0, 1
    ];
}

/**
 * 4. Projective Matrix (Homography)
 * * Computes a transformation that maps lines to lines but does not preserve parallelism.
 * Used for perspective distortion. Maps a square to an arbitrary convex quadrilateral.
 * * MATH:
 * u = (ax + by + c) / (gx + hy + 1)
 * v = (dx + ey + f) / (gx + hy + 1)
 * * MATRIX FORM:
 * [ a  b  c ]
 * [ d  e  f ]
 * [ g  h  1 ]
 * * LOGIC:
 * Solves an 8x8 linear system (Direct Linear Transformation - DLT) 
 * to find the 8 coefficients (setting i=1).
 * * @param {Array<number>} src - Source points [x1, y1, ..., x4, y4]
 * @param {Array<number>} dst - Destination points [u1, v1, ..., u4, v4]
 * @returns {Array<number>|null} The 9-element homogeneous matrix
 */
function getProjectiveMatrix(src, dst) {
    const A = [];
    const B = [];

    for (let i = 0; i < 4; i++) {
        const x = src[i * 2];
        const y = src[i * 2 + 1];
        const u = dst[i * 2];
        const v = dst[i * 2 + 1];

        // Row 1: ax + by + c - u(gx + hy + 1) = 0
        A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
        B.push(u);

        // Row 2: dx + ey + f - v(gx + hy + 1) = 0
        A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
        B.push(v);
    }

    const h = solveLinearSystem(A, B);
    
    if (!h) return null; 

    // Append '1' as the 9th element to complete the matrix
    return [...h, 1];
}

//*************************************************** */
/* Non-linear transformations - these return functions (x,y) => [x',y'] */
//*************************************************** */

/**
 * 5. Bilinear Interpolation Function
 * Creates a function that maps (u,v) to (x,y) using bilinear interpolation 
 * between 4 control points representing the corners of a rectangular region.
 * 
 * We assume the src points define the bounding box of the domain (e.g. standard square),
 * and dst points are the arbitrary positions those corners map to.
 * 
 * Standard Bilinear Interpolation (on unit square 0..1):
 * f(u,v) = (1-u)(1-v)P00 + u(1-v)P10 + (1-u)vP01 + uvP11
 * 
 * Here we map the src bounds to 0..1 first.
 * We assume src order is: [x0,y0, x1,y1, x2,y2, x3,y3] 
 * corresponding to Top-Left, Top-Right, Bottom-Right, Bottom-Left 
 * (or whatever order matches min/max logic).
 * 
 * Actually, to match getProjectiveMatrix signature generally, we need to know the domain.
 * We will infer the domain min/max from the src points.
 * 
 * @param {Array<number>} src - Source points [x1, y1, ..., x4, y4]
 * @param {Array<number>} dst - Destination points [u1, v1, ..., u4, v4]
 * @returns {function(number, number): number[]} A function f(x,y) -> [u, v]
 */
function getBilinearFunction(src, dst) {
    // Find bounding box of source to normalize coordinates
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for(let i=0; i<4; i++) {
        minX = Math.min(minX, src[i*2]);
        maxX = Math.max(maxX, src[i*2]);
        minY = Math.min(minY, src[i*2+1]);
        maxY = Math.max(maxY, src[i*2+1]);
    }
    
    // We assume the points correspond to corners in a specific order for bilinear interpolation.
    // Ideally: 
    // dst[0]: Top-Left (minX, minY) -> (0,0) u,v space
    // dst[1]: Top-Right (maxX, minY) -> (1,0)
    // dst[2]: Bottom-Right (maxX, maxY) -> (1,1)
    // dst[3]: Bottom-Left (minX, maxY) -> (0,1)
    // But we should probably just take them in index order 0,1,2,3 for consistancy 
    // with how points are usually passed (TL, TR, BR, BL).
    // Let's assume the user passes them in the order suitable for the interpolation.
    
    // P0 = dst[0..1]
    // P1 = dst[2..3]
    // P2 = dst[4..5]
    // P3 = dst[6..7]

    return function(x, y) {
        // Normalize x,y to 0..1
        let u = (x - minX) / (maxX - minX);
        let v = (y - minY) / (maxY - minY);
        
        // Clamp to 0..1 ?? Or let it extrapolate?
        // Usually transforms extrapolate.
        
        // Bilinear Interpolation
        // We use the 4 dst points.
        // If we assume standard sweep order (TL, TR, BR, BL) is incorrect for standard equation.
        // Standard bilinear usually takes (0,0), (1,0), (0,1), (1,1) or similar.
        // Let's assume input order matches:
        // 0: (min, min)
        // 1: (max, min)
        // 2: (max, max)
        // 3: (min, max)
        
        // f(u,v) = (1-u)(1-v)P0 + u(1-v)P1 + u*v*P2 + (1-u)v*P3
        
        const P0x = dst[0]; const P0y = dst[1];
        const P1x = dst[2]; const P1y = dst[3];
        const P2x = dst[4]; const P2y = dst[5];
        const P3x = dst[6]; const P3y = dst[7];
        
        const resX = (1-u)*(1-v)*P0x + u*(1-v)*P1x + u*v*P2x + (1-u)*v*P3x;
        const resY = (1-u)*(1-v)*P0y + u*(1-v)*P1y + u*v*P2y + (1-u)*v*P3y;
        
        return [resX, resY];
    };
}

/**
 * 6. Bicubic Hermite Patch Function
 * Creates a function that maps (u,v) to (x,y) using bicubic Hermite interpolation.
 * 
 * Unlike standard bilinear interpolation which only considers corner positions,
 * this considers derivatives (tangents) at the corners to define the curvature.
 * 
 * In this specific implementation, we enforce that the tangents at the corners 
 * match the "undistorted" grid vectors. 
 * i.e., at any corner, the partial derivative with respect to u is [width, 0]
 * and with respect to v is [0, height].
 * Twist vectors (mixed partials) are set to zero.
 * 
 * This creates an effect where the grid lines leave the corners perpendicular (or parallel) 
 * to the original axes, regardless of where the corner has been moved to.
 * 
 * @param {Array<number>} src - Source points [x1, y1, ..., x4, y4]
 * @param {Array<number>} dst - Destination points [u1, v1, ..., u4, v4]
 * @returns {function(number, number): number[]} A function f(x,y) -> [u, v]
 */
function getBicubicHermiteFunction(src, dst) {
    // 1. Compute bounds to normalize coordinates and determine tangents
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for(let i=0; i<4; i++) {
        minX = Math.min(minX, src[i*2]);
        maxX = Math.max(maxX, src[i*2]);
        minY = Math.min(minY, src[i*2+1]);
        maxY = Math.max(maxY, src[i*2+1]);
    }
    
    const width = maxX - minX;
    const height = maxY - minY;

    // 2. Define Control Points (Positions)
    // Indices: 0:TL, 1:TR, 2:BR, 3:BL (based on previous functions)
    // Map to grid (u,v) coords:
    // P00 (0,0) = dst[0] (TL)
    // P10 (1,0) = dst[1] (TR)
    // P11 (1,1) = dst[2] (BR)
    // P01 (0,1) = dst[3] (BL)
    
    // 3. Define Tangents
    // We set tangents to be the "original" grid vectors.
    // Tu (derivative along u) = [width, 0] for all corners
    // Tv (derivative along v) = [0, height] for all corners
    // Twists = [0, 0]
    
    return function(x, y) {
        // Normalize x,y to 0..1
        let u = (x - minX) / width;
        let v = (y - minY) / height;

        // Hermite Basis Functions
        // H0(t) = 2t^3 - 3t^2 + 1   (Weight for P at 0)
        // H1(t) = -2t^3 + 3t^2      (Weight for P at 1)
        // H2(t) = t^3 - 2t^2 + t    (Weight for Tangent at 0)
        // H3(t) = t^3 - t^2         (Weight for Tangent at 1)

        const u2 = u * u; const u3 = u2 * u;
        const v2 = v * v; const v3 = v2 * v;

        const h0u = 2*u3 - 3*u2 + 1;
        const h1u = -2*u3 + 3*u2;
        const h2u = u3 - 2*u2 + u;
        const h3u = u3 - u2;

        const h0v = 2*v3 - 3*v2 + 1;
        const h1v = -2*v3 + 3*v2;
        const h2v = v3 - 2*v2 + v;
        const h3v = v3 - v2;

        // 4. Compute Interpolated Position
        // P(u,v) = Sum( Sum( Hi(u)*Hj(v)*Qij ) )
        
        // --- Contribution from Positions ---
        // P00 at u=0, v=0. Weight: h0u * h0v
        const w00 = h0u * h0v;
        const P00x = dst[0]; const P00y = dst[1];

        // P10 at u=1, v=0. Weight: h1u * h0v
        const w10 = h1u * h0v;
        const P10x = dst[2]; const P10y = dst[3];

        // P01 at u=0, v=1. Weight: h0u * h1v
        const w01 = h0u * h1v;
        const P01x = dst[6]; const P01y = dst[7];

        // P11 at u=1, v=1. Weight: h1u * h1v
        const w11 = h1u * h1v;
        const P11x = dst[4]; const P11y = dst[5];

        let posX = w00*P00x + w10*P10x + w01*P01x + w11*P11x;
        let posY = w00*P00y + w10*P10y + w01*P01y + w11*P11y;

        // --- Contribution from Tangents ---
        // Since Tu is constant [width, 0] for all corners:
        // Sum of weights for all Tu terms simplifies to: (h2u + h3u) * (h0v + h1v)
        // And since h0v + h1v = 1, it is just (h2u + h3u).
        const weightTu = h2u + h3u;
        posX += weightTu * width;
        // posY += weightTu * 0;
        
        // Since Tv is constant [0, height] for all corners:
        // Sum of weights for all Tv terms simplifies to: (h0u + h1u) * (h2v + h3v)
        // And since h0u + h1u = 1, it is just (h2v + h3v).
        const weightTv = h2v + h3v;
        // posX += weightTv * 0;
        posY += weightTv * height;

        return [posX, posY];
    };
}

/** **************************************************** */
/** Grid Warping Support */

/**
 * Generate starting positions for points on a regular grid centered at (0,0).
 * @param {number} size - The total width/height of the grid.
 * @param {number} n - The number of "in-between" points along each side (not counting corners).
 *                     n=1 creates a 3x3 grid (1 mid point).
 * @returns {Array<{x:number, y:number}>} Array of point objects {x,y}.
 */
function getGridPoints(size, n) {
    const points = [];
    const count = n + 2;        // Total points along one edge
    const step = size / (n + 1); // Distance between points (size / number of intervals)
    const start = -size / 2;    // Starting coordinate (centered)

    for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
            points.push({
                x: start + c * step,
                y: start + r * step
            });
        }
    }
    return points;
}

/**
 * Create a piecewise bilinear warp function based on a displaced grid.
 * It is simpler to pass the parameters size and n, because they allow us to 
 * directly compute which grid cell a point (x,y) falls into, rather than searching.
 * 
 * @param {number} size - Total size of the grid
 * @param {number} n - Number of internal points (grid is n+1 x n+1 cells)
 * @param {Array<{x:number, y:number}>} dstPoints - The displaced positions of the grid points.
 * @returns {function(number, number): number[]} Warp function f(x,y) -> [x', y']
 */
function getPiecewiseBilinear(size, n, dstPoints) {
    const count = n + 2;         // Points per row/col
    const step = size / (n + 1); // Cell size
    const start = -size / 2;     // Grid start coordinate
    
    return function(x, y) {
        // 1. Determine local coordinates relative to the grid
        let u_global = (x - start) / step;
        let v_global = (y - start) / step;

        // 2. Determine which cell (col, row) we are in
        // Clamp to valid cells [0, n] 
        // Note: For n=1 (3 points), valid cells are 0 and 1.
        let c = Math.floor(u_global);
        let r = Math.floor(v_global);

        c = Math.max(0, Math.min(c, n));
        r = Math.max(0, Math.min(r, n));

        // 3. Compute local parameters (u,v) within the cell [0,1]
        // If we are outside the grid, this effectively extends the boundary cell's interpolation
        let u = u_global - c;
        let v = v_global - r;

        // 4. Fetch the 4 corners of this cell from dstPoints
        // Grid is row-major: index = r * count + c
        const i00 = r * count + c;        // Top-Left
        const i10 = r * count + (c + 1);  // Top-Right
        const i11 = (r + 1) * count + (c + 1); // Bottom-Right
        const i01 = (r + 1) * count + c;  // Bottom-Left

        const P00 = dstPoints[i00];
        const P10 = dstPoints[i10];
        const P11 = dstPoints[i11];
        const P01 = dstPoints[i01];

        // 5. Bilinear Interpolation
        // f(u,v) = (1-u)(1-v)P00 + u(1-v)P10 + uvP11 + (1-u)vP01
        
        const resX = (1-u)*(1-v)*P00.x + u*(1-v)*P10.x + u*v*P11.x + (1-u)*v*P01.x;
        const resY = (1-u)*(1-v)*P00.y + u*(1-v)*P10.y + u*v*P11.y + (1-u)*v*P01.y;

        return [resX, resY];
    };
}

/**
 * Create a piecewise bicubic Hermite warp function based on a displaced grid.
 * Similar to piecewise bilinear, but uses bicubic Hermite interpolation for each cell.
 * The tangent vectors at each grid point are set to the "undistorted" grid steps,
 * ensuring angular continuity across cell boundaries (C1 continuity).
 * 
 * @param {number} size - Total size of the grid
 * @param {number} n - Number of internal points (grid is n+1 x n+1 cells)
 * @param {Array<{x:number, y:number}>} dstPoints - The displaced positions of the grid points.
 * @param {boolean} [usePhantomPoints=true] - If true, points outside the grid are extrapolated using "phantom points" that move with the nearest grid point.
 * @returns {function(number, number): number[]} Warp function f(x,y) -> [x', y']
 */
function getPiecewiseBicubic(size, n, dstPoints, usePhantomPoints = true) {
    const count = n + 2;         // Points per row/col
    const step = size / (n + 1); // Cell size (equivalent to width/height of a cell)
    const start = -size / 2;     // Grid start coordinate
    
    // We treat the grid step as both width and height for calculating tangents
    // Tangents are fixed: Tu = [step, 0], Tv = [0, step]
    
    return function(x, y) {
        // 1. Determine local coordinates relative to the grid
        let u_global = (x - start) / step;
        let v_global = (y - start) / step;

        // 2. Determine which cell (col, row) we are in
        let c = Math.floor(u_global);
        let r = Math.floor(v_global);

        if (!usePhantomPoints) {
            c = Math.max(0, Math.min(c, n));
            r = Math.max(0, Math.min(r, n));
        }

        // 3. Compute local parameters (u,v) within the cell [0,1]
        let u = u_global - c;
        let v = v_global - r;

        // Helper to get point (handling phantom points if enabled)
        function getPoint(col, row) {
            if (col >= 0 && col < count && row >= 0 && row < count) {
                return dstPoints[row * count + col];
            }
            // If we are here, we are out of bounds.
            // If phantom points are disabled, we shouldn't be here because c,r are clamped
            // such that c+1 and r+1 are max n+1 < count. 
            // However, for safety/completeness:
            const validC = Math.max(0, Math.min(col, count - 1));
            const validR = Math.max(0, Math.min(row, count - 1));
            const P = dstPoints[validR * count + validC];

            return {
                x: P.x + (col - validC) * step,
                y: P.y + (row - validR) * step
            };
        }

        // 4. Fetch the 4 corners of this cell
        const P00 = getPoint(c, r);
        const P10 = getPoint(c + 1, r);
        const P11 = getPoint(c + 1, r + 1);
        const P01 = getPoint(c, r + 1);

        // 5. Bicubic Hermite Interpolation for this cell
        // Tangents are assumed to be "undistorted" original grid steps
        // Tu = [step, 0], Tv = [0, step]

        
        const u2 = u * u; const u3 = u2 * u;
        const v2 = v * v; const v3 = v2 * v;

        const h0u = 2*u3 - 3*u2 + 1;
        const h1u = -2*u3 + 3*u2;
        const h2u = u3 - 2*u2 + u;
        const h3u = u3 - u2;

        const h0v = 2*v3 - 3*v2 + 1;
        const h1v = -2*v3 + 3*v2;
        const h2v = v3 - 2*v2 + v;
        const h3v = v3 - v2;
        
        // --- Contribution from Positions ---
        let posX = (h0u*h0v)*P00.x + (h1u*h0v)*P10.x + (h0u*h1v)*P01.x + (h1u*h1v)*P11.x;
        let posY = (h0u*h0v)*P00.y + (h1u*h0v)*P10.y + (h0u*h1v)*P01.y + (h1u*h1v)*P11.y;

        // --- Contribution from Tangents ---
        // Tu contribution (adds 'step' to X)
        // Weight sum is (h2u + h3u) * (h0v + h1v) = (h2u + h3u) * 1
        const weightTu = h2u + h3u;
        posX += weightTu * step;
        
        // Tv contribution (adds 'step' to Y)
        // Weight sum is (h0u + h1u) * (h2v + h3v) = 1 * (h2v + h3v)
        const weightTv = h2v + h3v;
        posY += weightTv * step;

        return [posX, posY];
    };
}

